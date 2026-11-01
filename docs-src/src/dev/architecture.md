# Architecture

MILET is a **flat-include research code**: there is no package module and no
`using MILET`. The entry script `main.jl` `include`s every source file in
dependency order into `Main`, then runs the case driver. Tests and validation
scripts load the same graph (either by replicating the include list, as
`test/runtests.jl` does, or by `include("main.jl")`, which skips the auto-run
when it is not the main script — see the
`abspath(PROGRAM_FILE) == @__FILE__` guard at the bottom of `main.jl`).

## Include graph

`main.jl` loads, in this order (later files may call anything defined
earlier; nothing forward-references):

| Layer | Files (in order) | Provides |
|---|---|---|
| core | `src/core/Constants.jl`, `src/core/Config.jl`, `src/core/Mesh.jl` | physical constants (`SEC_YR`, `R_GAS`, …), `Config` + `RockProp`/`PhaseProp`/`MeltProp`, `MeshBundle` / `build_model` |
| boundary conditions | `src/boundary_conditions/Velocity.jl`, `src/boundary_conditions/Temperature.jl` | Dirichlet closures `bc_left` … `bc_deep`, `bc_T_surface`, `bc_T_deep` |
| core (cont.) | `src/core/FESpaces.jl`, `src/core/State.jl` | `FESpaceBundle` / `build_spaces`, `State` |
| materials | `src/materials/FlowLaws.jl`, `Rheology.jl`, `Density.jl`, `PhaseChange.jl`, `Melting.jl`, `GrainSize.jl` | `compute_viscosity`, `compute_VEP_viscosity`, `compute_density`, `apply_phase_change!`, `apply_melting!`, `update_grain_size` |
| particles | `src/particles/Particles.jl`, `CartEval.jl`, `Advection.jl`, `Projection.jl`, `Reseed.jl` | `Markers`, fast Q2/Q1 evaluators, `advect_markers!`, `project_markers_to_cells!`, `reseed_markers!` |
| initialization | `src/initialization/Geometry.jl`, `Temperature.jl`, `Markers.jl` | `rock_type_*` / `initial_temperature_*` case closures, `rock_type_from_layers`, `init_markers!` |
| physics | `src/physics/Gravity.jl`, `Stokes.jl`, `HeatSources.jl`, `Heat.jl`, `FreeSurface.jl`, `EntropyViscosity.jl`, `Composition.jl`, `Compressibility.jl`, `AdvancedHeating.jl`, `ALEFreeSurface.jl`, `Volatile.jl`, `TwoPhase.jl` | weak forms (`build_stokes_forms`, `assemble_heat`, `assemble_composition`), `buoyancy_cellfield`, `recover_invariants!`, free-slip/traction BC builders, ALE surface machinery, McKenzie two-phase solve |
| solvers | `src/solvers/Mumps.jl`, `PETScSolvers.jl`, `BAMGS.jl`, `Schur.jl`, `GMG.jl`, `BlockMG.jl`, `AMR.jl` | `MumpsSolver` / `CachedMumps`, PETSc stacks, η-weighted pressure mass, `build_gmg_hierarchy` / `vcycle!`, `StokesSolverCache` / `fgmres!`, `apply_amr!` |
| io | `src/io/VTK.jl`, `PVD.jl`, `Diagnostics.jl`, `TOMLLoader.jl`, `UserHelpers.jl` | `write_grid_vtu` / `write_markers_vtu` / `write_topography_vtu`, `save_pvd`, `record_step!` / `nusselt` / `vrms`, `load_config_toml` / `clone_config` / `select_case`, run summary + validation |
| time stepping | `src/time_stepping/CFL.jl`, `PicardLoop.jl`, `NewtonLoop.jl`, `Driver.jl`, then `src/io/Checkpoint.jl` | `compute_dt`, `picard_stokes!`, `newton_stokes!`, `run_case`, checkpoint/restart |

The entry point itself is four calls:
`load_config_toml(case_file)` → `select_case(read_case_name(case_file))` →
`run_case(cfg; rock_type_fn, initial_T_fn, rho_field_fn, eta_field_fn)` →
`finalize_mumps_contexts!()` before `MPI.Finalize()` (cached MUMPS
factorizations have destructors that do *collective* MPI calls; finalizing
them after MPI is down aborts the process — see `src/solvers/Mumps.jl`).

## Core data structures

### `MeshBundle` (`src/core/Mesh.jl`)

Immutable bundle of everything mesh-related:

- `model` — the Gridap `CartesianDiscreteModel` (possibly mapped or adapted),
- `Ω`, `dΩ` — triangulation + bulk measure (quadrature order `2·fe_order_v`),
- `Γs`, `dΓs` — `NamedTuple`s of boundary triangulations/measures keyed by
  the wall tags `left`, `right`, `surface` (y = 0), `deep` (y = `ysize`),
  plus `front`/`back` in 3-D,
- `dim`, `nel` (cell counts of the *base* Cartesian mesh,
  `(nx-1, ny-1[, nz-1])`), `domain` extents,
- `adapted::Bool` — see [the adapted-mesh flag](#the-adapted-mesh-flag).

Wall tags are built by `tag_box_walls!` with **full closures** (face + edge +
vertex entities, collected geometrically by `_wall_entity_set`); a tag that
lists only the face entity leaves the Lagrangian DOFs on box edges/corners
unconstrained. Helpers: `cell_dx`/`cell_dy`/`cell_dz`, `n_cells`.

### `FESpaceBundle` (`src/core/FESpaces.jl`)

Built by `build_spaces(mb, cfg)`:

- `V`/`U` — Q`fe_order_v` vector velocity test/trial (Taylor–Hood, default Q2),
- `Q`/`P` — Q`fe_order_p` pressure (default Q1, no Dirichlet — the constant
  nullspace is handled at the solver level),
- `X = MultiFieldFESpace([U, P])`, `Y = MultiFieldFESpace([V, Q])`,
- `VT`/`UT` — Q`fe_order_T` temperature (strong Dirichlet only on walls with
  `bcT_surface`/`bcT_deep = "dirichlet"`),
- `VC`/`UC` — Q1 composition (insulating BCs).

Velocity Dirichlet tags are only those walls with `bc_* = "prescribed"`
(`velocity_dirichlet_tags`); `"free_slip"` walls are handled by a penalty
boundary integral added in the Stokes weak form (`build_free_slip_bcs` in
`src/physics/Stokes.jl`). The GMG coarse spaces reuse exactly the same tag
list so the Galerkin transfer is consistent.

### `State` (`src/core/State.jl`)

Mutable container for the live solution. FE fields: `uh`, `ph`, `Th`,
`Th_old`, `Ch`/`Ch_old` (+ `Ch_extra[_old]` when `n_comp_fields > 1`).
Per-cell `Vector{Float64}` arrays of length `n_cells`, rewritten by
`project_markers_to_cells!`:

- rheology: `eta_c`, `rho_c`, `cp_c`, `kt_c`, `ht_c`,
- invariants: `eii_c` (seeded with `eii_seed` for the first Picard
  iteration), `sii_c`,
- visco-elastic memory: `sxx_old_c` … `syz_old_c`, `chi_c`
  ($\chi = 1 - Z$, the elastic weight), `yield_frac_c`,
- cached cell centres `xc`, `yc`, `zc`, volatile mass storage and escape-flux
  accumulators (the volatile module is disabled in this release),
- nonlinear diagnostics `last_picard_iters`/`last_picard_rel`/`last_picard_ok`.

Per-cell values are lifted to weak forms with `CellField(values, mb.Ω)`
(`as_cellfield`), i.e. piecewise-constant coefficients — quadrature-point
arrays are never stored. The five `Any`-typed slots at the end
(`solver_cache`, `heat_solver_cache`, `proj_solver_cache`,
`comp_solver_cache`, `proj_cache`) hold persistent solver state, see
[Solver caches](#solver-caches-and-invalidation).

### `Markers` (`src/particles/Particles.jl`)

Struct-of-arrays Lagrangian markers, positions and carried fields in
`Float32` (halves memory): `x`, `y`, `z`, `T`, `rtype::Vector{Int8}`,
`strain`, `F_melt`, `phase_drho`, the deviatoric stress components
`sxx … syz` (VEP elastic memory, Jaumann-rotated each step), `grain_size`,
`porosity` (two-phase state variable), `layer_id::Vector{Int16}` (passive
stratigraphy), four volatile species, and the live count `n`. Capacity grows
geometrically via `ensure_capacity!`; `run_case` allocates
`nel·mnx·mny·mnz·2` up front.

## The per-step pipeline

`run_case(cfg; ...)` (`src/time_stepping/Driver.jl`) builds
`build_model` → `build_spaces` → `State` → `Markers`/`init_markers!`,
interpolates the initial temperature onto `fes.UT`, does one initial
`project_markers_to_cells!`, optionally restores a checkpoint
(`load_latest_checkpoint` / `apply_checkpoint!` when `restart = true`), then
loops `step = step_start:ntot`:

1. **Stokes** (`do_stokes`) — `picard_stokes!(state, mb, fes, mk, cfg, dt_guess)`;
   with `do_two_phase` instead an inline Picard loop over
   `project_markers_to_cells!` → `project_porosity_to_cells!` →
   `solve_twophase!` → `recover_invariants!`.
2. **Time step** — `compute_dt(state, mb, cfg)` (advection CFL
   $\Delta t \le \mathrm{maxxystep}\cdot h_{\min}/v_{\max}$, thermal Fourier
   limit, hard cap `maxtmstep`); the two-phase path additionally limits by
   the Darcy segregation speed (`max_melt_segregation_speed`).
3. **Porosity** (`do_two_phase`) — `update_marker_porosity!` closes/opens
   pores at the solved compaction-pressure rate.
4. **Heat** (`do_heat`) — in `marker_T_mode = "pic_increment"` first
   `project_marker_T_to_cells` → `_project_cellfield_to_T` (bound-preserving
   L2 fit onto `UT`), optionally `apply_subgrid_diffusion!`
   (`do_subgrid_diffusion`, Gerya–Yuen relaxation; its gridded change,
   `_project_cellfield_to_dT`, is subtracted from the grid increment); then
   `solve_heat_step!` (backward-Euler, cached MUMPS), and markers absorb the
   result via `update_marker_temperatures!` (`:pic_increment` adds only the
   increment $\Delta T = T^{new}_h - T^{old}_h$ at the marker; `"overwrite"`
   replaces). Both the FE dofs and the marker T are clamped to
   `_heat_clamp_bounds` (pre-solve range ∪ Dirichlet endpoints + 5 %·ΔT).
5. **Composition FE** (`do_composition_fe`) — `solve_composition_step!` for
   `Ch` and each `Ch_extra[i]` (SUPG advection, κ = 0).
6. **Marker stresses** (`do_stokes`) — `update_marker_stresses!`
   ($\sigma^{new} = 2\eta_{VEP}\,\dot\varepsilon + \chi\,\sigma^{old}$ +
   Jaumann co-rotation), *before* advection so the rotation uses the current
   velocity gradient.
7. **Advection** (`do_advect`) — `advect_markers!` (RK4 on the FE velocity),
   `update_marker_strain!`, `update_marker_grain_size!` (only if any rock has
   `grain_G0 > 0`), `reseed_markers!`.
8. **Phase change + melting** (`do_phase_change || do_melting`) —
   `apply_marker_phase_and_melt!`, which also accumulates the per-cell
   latent-heat source `H_marker_latent` (W/m³) used by the *next* heat step.
9. **Projection + diagnostics** — `project_markers_to_cells!`, then
   `record_step!` appends to `run.log`.
10. **I/O** (every `output_every` steps and at step 1) — `write_grid_vtu`,
    `write_markers_vtu`, `write_topography_vtu`, `write_bench_csv`
    (Nu/Vrms/mobility observables), and `save_pvd` for the three series.
11. **Checkpoint** — `save_checkpoint` every `checkpoint_every` steps when
    `do_checkpoint`.
12. **AMR** (`do_amr`, every `amr_every` steps) — `apply_amr!` returns a new
    `(mb, fes)`; the driver re-projects markers and sets `skip_heat_next`
    (one heat solve is skipped after refinement to avoid a Gridap quadrature
    edge case on fresh hanging-node patterns).
13. **ALE free surface** (`do_ale_free_surface`, 2-D only) —
    `_sample_vy_at_surface` → `update_surface_height` → `build_mapped_model`
    → `rebuild_mb_with_ale` → `build_spaces`, with FE fields transferred via
    `_safe_fe_transfer` (the same NaN-guarded interpolation AMR uses).

Set `PROFILE_STEPS=1` in the environment to print a per-step timing
breakdown (stokes/heat/stress/advect/phase/proj/io/amr/ale). The run ends
early when `t_end_myr` is reached. With `solver_type = "bamgs"` the whole
loop is wrapped in one `with_bamgs_context` so PETSc's `MATSCHURCOMPLEMENT`
registration survives across solves.

### Nonlinear loop

`picard_stokes!` (`src/time_stepping/PicardLoop.jl`) iterates up to
`n_picard` times: re-project markers with the current `dt`, freeze
$\eta^{(k)} = \eta(\dot\varepsilon_{II}^{(k)})$, assemble + solve the linear
Stokes problem, `recover_invariants!`, and test the relative velocity-DOF
change

```math
\frac{\lVert u^{(k+1)} - u^{(k)} \rVert_2}{\lVert u^{(k+1)} \rVert_2} < \texttt{picard\_tol}.
```

`nonlinear_method = "newton"` applies under-relaxation
$u \leftarrow (1-\alpha)u_{old} + \alpha u_{solve}$ with
$\alpha =$ `newton_damping`. Solver dispatch is `resolve_solver_type`:
`"mumps"` (cached direct), `"gmg"`/legacy `"vcycle"` (FGMRES + GMG/pressure
mass block preconditioner), `"auto"` (GMG above 400 k DOFs), `"petsc"`,
`"bamgs"`. Optional `rho_field_fn`/`eta_field_fn` closures (used by
benchmark cases) overwrite the projected per-cell ρ/η at cell centres each
iteration. See [Linear solvers](../numerics/solvers.md) and
[Geometric multigrid](../numerics/multigrid.md).

## Solver caches and invalidation

All persistent solver state lives on `State` so it survives Picard
iterations *and* time steps:

- **`state.solver_cache :: StokesSolverCache`** (`src/solvers/BlockMG.jl`).
  Keyed by `(objectid(mb.model), num_free_dofs(V), num_free_dofs(Q))`;
  `stokes_solver_cache!` compares the key on every call and allocates a
  fresh cache when it differs — this is the *entire* invalidation mechanism,
  and it fires automatically because AMR (`apply_amr!`) and ALE
  (`rebuild_mb_with_ale`) create a new model object and change DOF counts.
  Contents: the assembled-pattern reuse triple (`assem`, `K`, `b`, plus
  `uhd`; `assemble_stokes_cached!` refills values in place with
  `assemble_matrix_and_vector!` after the first assembly), the GMG hierarchy
  + setup (`hier`, `hier_tried`, `setup`, `Mp_inv` — `gmg_update!` redoes
  only Galerkin products and smoother data per iteration), the MUMPS
  numerical setup (`mumps_ns` — symbolic analysis once per pattern,
  numeric-only refactorization via `numerical_setup!`, MUMPS job 2), and the
  warm-start vector `x_prev` shared by both paths.
- **`state.heat_solver_cache :: CachedMumps`** (`src/solvers/Mumps.jl`) —
  the heat matrix pattern is constant across steps; only the numeric
  factorization repeats (values change with `dt`, `kt_eff`, `uh`).
  `CachedMumps` rebuilds itself whenever the system size changes
  (`cm.n != size(K, 1)`), which again covers AMR/ALE.
- **`state.proj_solver_cache :: CachedMumps(constant_values = true)`** —
  the L2-projection mass matrix used by `_project_cellfield_to_T` never
  changes value, so it is factored exactly once per mesh.
- **`state.comp_solver_cache`** — reserved slot; `solve_composition_step!`
  currently builds a fresh `LinearFESolver(MumpsSolver())` per solve.
- **`state.proj_cache :: ProjCache`** (`src/particles/Projection.jl`) — the
  marker-binning working set (CSR-style `host`/`offsets`/`cursor`/`order`
  plus bilinear-mode scratch). Rebuilt by `_get_proj_cache!` only when the
  cell count or marker capacity changes; the binning itself (a stable,
  allocation-free counting sort) is recomputed on *every* call, so a stale
  cache can never change results. A module-level `_proj_cache_ref` lets
  `project_marker_T_to_cells` (which takes no `State`) reuse the buffers.
- **`_point_cache :: IdDict`** (`src/particles/Projection.jl`) — Gridap
  KDTree point-location caches for `locate_cell_general`, keyed by `mb.Ω`
  (a new triangulation gets a new cache).

MUMPS contexts are additionally tracked in a process-global registry
(`_MUMPS_LIVE`): their destructors make collective MPI calls, so
`finalize_mumps_contexts!` (called by `main.jl`, plus an `atexit` hook
registered LIFO-before MPI's) tears them down before MPI is finalized.

## Threading model

MILET uses plain Julia threads (`julia -t N` / `JULIA_NUM_THREADS`); there
is no distributed assembly — MPI exists only because MUMPS requires it.

The pattern, used identically everywhere, is chunked
`Threads.@spawn` over disjoint contiguous index ranges
(`_parallel_ranges` in `src/particles/Projection.jl` is the shared helper):
each task reads shared immutable snapshots and writes only its own slice of
the marker arrays, or only its own cells via the CSR bins.

**The one hard rule: Gridap's `evaluate` (and its KDTree point search) is
NOT thread-safe.** Every threaded marker kernel therefore runs only on the
uniform-Cartesian fast path, where FE evaluation goes through the dependency-
free snapshot evaluators in `src/particles/CartEval.jl`
(`snapshot_q2_vec[_3d]` / `eval_q2_vec[_3d]` / `eval_q2_gradu[_3d]` /
`snapshot_q1_scalar[_3d]`) and cell location is the O(1) arithmetic of
`locate_cartesian` + `cart_to_linear`. On adapted/mapped meshes the same
kernels fall back to `Gridap.evaluate` / `locate_cell_general` and run
**serial**.

Threaded kernels (fast path only unless noted):

- `advect_markers!` (`src/particles/Advection.jl`),
- `update_marker_stresses!` / `_update_marker_stresses_3d!` (`src/physics/Stokes.jl`),
- `update_marker_temperatures!`, `_bin_markers!`, the per-cell accumulation
  of `project_markers_to_cells!` (host mode: markers contribute only to
  their host cell, so per-cell sums are disjoint) and `_binned_T_average`
  (`src/particles/Projection.jl`),
- `update_marker_strain!` — threaded **regardless** of `mb.adapted`
  (pure per-marker arithmetic on already-projected cell arrays),
- `update_marker_grain_size!` (`src/time_stepping/Driver.jl`),
- `update_marker_porosity!` (`src/physics/TwoPhase.jl`).

FE assembly and the linear solves are serial at the Julia level (MUMPS uses
its own BLAS threading).

## The adapted-mesh flag

`MeshBundle.adapted` is `true` whenever marker→cell lookup can no longer use
the uniform-Cartesian arithmetic fast path:

- AMR-refined models (`rebuild_mesh_bundle`, called from `apply_amr!`),
- the mapped 2-D `chunk` geometry (`_build_chunk_model` — markers live in
  physical x,y, not in the (r,θ) reference grid),
- ALE-deformed meshes (`rebuild_mb_with_ale`).

Consequences when `adapted == true` (several sites also check
`cfg.geometry != "box"` for mapped geometries):

| Disabled / degraded | Replacement |
|---|---|
| `CartEval` fast Q2/Q1 evaluation in `advect_markers!`, `update_marker_stresses!`, `update_marker_temperatures!` | `Gridap.evaluate` per point, **serial** |
| Binned fast projection in `project_markers_to_cells!` and `project_marker_T_to_cells` | `_project_markers_general!` / per-marker `locate_cell_general` (KDTree), **serial** |
| Threading of all the above marker loops | serial fallback (Gridap evaluate is not thread-safe) |
| `apply_subgrid_diffusion!` | no-op (`(dt <= 0 || mb.adapted) && return`) |
| GMG hierarchy (`build_gmg_hierarchy` returns `nothing`) | cached MUMPS direct solve (`solve_stokes_direct!`), with a one-time warning |
| Cartesian cell lookup in VTK marker/topography output | `locate_cell_general` |

`nel` and `domain` always keep the *base* mesh values, so CFL cell sizes and
the volatile cell-volume bookkeeping remain defined after refinement. See
[AMR & ALE](../numerics/amr_ale.md) for the refinement and surface-tracking
algorithms themselves, and [Markers](../numerics/markers.md) for the
projection details.
