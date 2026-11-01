# Linear solvers

The Stokes saddle point assembled on the $Q_2/Q_1$ Taylor–Hood pair (see
[Discretization](./discretization.md)) is solved by one of five backends,
selected by `type` in the `[solver]` block (`cfg.solver_type`). The solver
layer lives in `src/solvers/`: `Mumps.jl`, `BlockMG.jl`, `Schur.jl`,
`GMG.jl`, `PETScSolvers.jl`, `BAMGS.jl`.

## Solver matrix

| `solver_type` | Path | When to use |
|---|---|---|
| `mumps` (default) | Cached MUMPS direct factorization (`solve_stokes_direct!`) | 2D, moderate 3D; bit-reproducible reference |
| `gmg` (alias `vcycle`) | FGMRES + block preconditioner: GMG on velocity, lumped $M_p/\eta$ on pressure (`solve_stokes_iterative!`) | Large systems, 3D production runs |
| `auto` | `gmg` above 400 000 DOFs, `mumps` below (`resolve_solver_type`, `src/solvers/BlockMG.jl`) | Sensible default for case sweeps |
| `petsc` | One-shot `GridapPETSc` KSP with a preset option string (`solve_petsc`, `src/solvers/PETScSolvers.jl`) | Experimentation with PETSc stacks |
| `bamgs` | PETSc FGMRES + PCFIELDSPLIT-Schur, hypre BoomerAMG on velocity, Jacobi on pressure (`solve_bamgs`, `src/solvers/BAMGS.jl`) | AMG comparison runs |

The nonlinear (Picard) loop dispatches in
`src/time_stepping/PicardLoop.jl`: `mumps`/`gmg` share the cached-assembly
path; `petsc`/`bamgs` assemble a fresh `AffineFEOperator` per iteration (no
caching).

## MUMPS direct path

`src/solvers/Mumps.jl` wraps MUMPS behind Gridap's `LinearSolver` interface
(`MumpsSolver`, `symbolic_setup` / `numerical_setup` / `numerical_setup!` /
`solve!`).

**Numeric-only refactorization.** The first `numerical_setup` builds a MUMPS
context and runs analysis + factorization. When the Picard loop or a new
time step re-assembles the matrix with the *same sparsity pattern* (same FE
space, same connectivity), `numerical_setup!` keeps the symbolic analysis and
re-runs only the numeric factorization (MUMPS job 2) — typically 30–50 %
cheaper than analyse+factor, with the saving growing with problem size. If
MUMPS rejects the refactorization (pattern actually changed,
`infog[1] < 0`), the context is rebuilt transparently.

**Repeated solves.** `solve!` drives MUMPS job 3 explicitly with a
re-associated RHS rather than via the convenience `MUMPS.solve!` — the
convenience layer's job state machine treats a context already in the SOLVE
state as done and silently returns stale results for a new RHS on a cached
factorization.

**Context registry.** Persistent caches keep MUMPS contexts alive until
process exit, where Julia's final GC runs *after* MPI.jl's `atexit` hook has
finalized MPICH; the context destructor then makes a collective MPI call on a
dead library and MPICH aborts the process. MILET registers every live context
in `_MUMPS_LIVE` and finalizes them from its **own** `atexit` hook, which is
registered after `MPI.Init`'s and therefore runs before it (atexit is LIFO).
`finalize_mumps_contexts!()` is exposed for paths that call `MPI.Finalize()`
explicitly. `MUMPS.finalize` is idempotent, so the later GC finalizers become
no-ops.

**`CachedMumps`.** Systems re-solved every step with an unchanged pattern
(heat, composition, the PIC $L^2$ projection) go through
`cached_mumps_solve!`: full analyse+factor once, numeric-only refactorization
afterwards — or *no* refactorization at all for `constant_values = true`
systems such as the $L^2$-projection mass matrix. The cache rebuilds itself
when the system size changes (AMR / ALE mesh swap).

## Iterative path: FGMRES + block preconditioner

`solve_stokes_iterative!` (`src/solvers/BlockMG.jl`) runs
right-preconditioned **flexible GMRES** (`fgmres!`, modified Gram–Schmidt +
Givens rotations) on the monolithic system

```math
K = \begin{bmatrix} A & B^{\mathsf T} \\ B & 0 \end{bmatrix},
\qquad
P^{-1} = \begin{bmatrix} \mathrm{MG}(A) & 0 \\ 0 & \big(\mathrm{lump}\,M_p/\eta\big)^{-1} \end{bmatrix}.
```

- $A^{-1}$ is approximated by `gmg_cycles` V-cycle(s) of the Galerkin
  geometric multigrid — see [Geometric multigrid](./multigrid.md). The
  velocity block `A = K[1:nu, 1:nu]` is extracted directly from the
  monolithic matrix (Gridap's consecutive multi-field numbering puts the
  `nu` velocity DOFs first), so free-slip penalty terms and Dirichlet
  elimination are inherited exactly.
- The pressure Schur complement $S = B A^{-1} B^{\mathsf T}$ is approximated
  by the $\eta$-weighted lumped pressure mass matrix
  (Elman–Silvester–Wathen): `src/solvers/Schur.jl` assembles
  $\int_\Omega \eta^{-1} p\, q \, d\Omega$, lumps row sums, and inverts the
  diagonal (`lumped_inverse_pressure_mass`). The $1/\eta$ weighting keeps the
  preconditioner uniformly bounded under many-decade viscosity contrasts, so
  Krylov iteration counts stay nearly $\eta$-independent. It is refreshed at
  every nonlinear iteration as $\eta$ evolves.

FGMRES (not GMRES) is required because the V-cycle preconditioner is
nonstationary.

**Fallback.** If no GMG hierarchy is possible — adapted/mapped mesh, or cell
counts not divisible by 2 — the call falls back to the cached MUMPS direct
path with a one-time warning (`hier_tried` prevents re-attempting).

### Attainable-accuracy stagnation

Dimensional geodynamic systems ($\eta \sim 10^{20}\,$Pa·s,
$u \sim 10^{-9}\,$m/s) have an attainable-residual floor of roughly
$\epsilon\,\lVert K\rVert\,\lVert x\rVert/\lVert b\rVert$ that can sit above
`krylov_tol`; **any** backward-stable solver (MUMPS included) stops improving
there. `fgmres!` therefore exits when a full restart cycle improves the
relative residual by less than 5 % (`rel > 0.95 · rel_prev_cycle`) and returns
the best iterate instead of burning `krylov_maxit`. A residual above
tolerance is reported sparingly (`maxlog = 3`) since it is usually this floor,
not a solver failure. The GMG-vs-MUMPS regression test
(`test/smoke/test_gmg.jl`) gates mutual agreement at $2\times10^{-3}$ for the
same reason — measured agreement is $\sim 4\times10^{-4}$, far below
discretization error.

## Caching and warm starts

All per-mesh solver state lives in a `StokesSolverCache` stored on
`state.solver_cache` and fetched by `stokes_solver_cache!`; it is keyed on
`(objectid(model), nu, np)` and so invalidates automatically when AMR/ALE
swaps the mesh or the DOF layout changes. Across Picard iterations and time
steps it preserves:

- the assembled sparsity pattern — `assemble_stokes_cached!` assembles once,
  then refills values in place via Gridap's
  `assemble_matrix_and_vector!`;
- the MUMPS context (symbolic analysis) on the direct path;
- the GMG hierarchy + transfer operators (`hier`) and operator setup
  (`setup`, refreshed by `gmg_update!`) on the iterative path;
- the previous solution `x_prev`, used to **warm-start** both paths;
- diagnostics `last_iters` / `last_rel`.

## PETSc presets (`solver_type = "petsc"`)

`petsc_options(cfg)` maps `solver_petsc_preset` (config key `petsc_preset`)
to an option string:

| Preset | Stack | Notes |
|---|---|---|
| `lu_mumps` (default) | `-ksp_type preonly -pc_type lu -pc_factor_mat_solver_type mumps` | MUMPS routed through KSP |
| `fgmres_gamg` | FGMRES + GAMG | **Positive-definite problems only** — GAMG on the indefinite saddle point does not converge (zero pressure block) |
| `bcgs_ilu` | BiCGStab + block-Jacobi ILU(1) | Indefinite-tolerant fallback |
| `fgmres_fieldsplit` | FGMRES + FIELDSPLIT with saddle-point auto-detection | Canonical block-Schur stack |
| `custom` | raw CLI from `petsc_options` | anything |

Each `solve_petsc` call opens and closes its own `GridapPETSc.with` context.

## BAMGS (`solver_type = "bamgs"`)

`src/solvers/BAMGS.jl` builds a full PETSc Schur fieldsplit:
`-pc_fieldsplit_type schur`, `upper` factorization, `selfp` Schur
approximation, hypre **BoomerAMG** on the velocity block
(HMIS coarsening, ext+i interpolation, strong threshold 0.5) and Jacobi on
the pressure block, behind outer FGMRES (`rtol 1e-5`, restart 100). The u/p
index sets are injected from the multi-field DOF ranges via a
`PCFieldSplitSetIS` `ccall` (`bamgs_setup_callback`). Two PETSc quirks are
handled explicitly: `KSPInitializePackage` is invoked up front so the
`MATSCHURCOMPLEMENT` type is registered before PCFIELDSPLIT needs it, and the
entire step loop is wrapped in **one** long-lived context
(`with_bamgs_context`, applied by the Driver) because PETSc's package-init
booleans survive Init/Finalize cycles while the type registry does not —
re-Init would skip the registration and the second solve would fail.

## Config keys

```toml
[solver]
type            = "mumps"     # mumps | gmg (alias vcycle) | auto | petsc | bamgs
petsc_preset    = "lu_mumps"  # lu_mumps | fgmres_gamg | bcgs_ilu | fgmres_fieldsplit | custom
petsc_options   = ""          # raw PETSc CLI for preset = "custom"
krylov_tol      = 1e-7        # FGMRES relative-residual target
krylov_maxit    = 200
krylov_restart  = 30          # FGMRES restart length (gmg path)
gmg_levels      = 3           # multigrid depth (auto-clamped to what the mesh allows)
gmg_cheb_degree = 3           # Chebyshev smoother degree per pre/post sweep
gmg_cycles      = 1           # V-cycles per preconditioner application
gmg_coarse_dofs = 2000        # stop coarsening below this many velocity DOFs
```

See [Geometric multigrid](./multigrid.md) for the GMG internals and
[Time stepping](./time_stepping.md) for how the Picard loop drives
re-assembly and re-solves.
