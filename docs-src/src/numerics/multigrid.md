# Geometric multigrid

`src/solvers/GMG.jl` implements a geometric multigrid (GMG) for the velocity
block of the Stokes system on nested Cartesian meshes — 2D and 3D, any
Lagrangian order ($Q_2$ velocity in practice). It is used as the $A^{-1}$
approximation inside the FGMRES block preconditioner
([Linear solvers](./solvers.md)); one `vcycle!` per preconditioner
application by default (`gmg_cycles`).

## Hierarchy

Level 1 is the fine mesh; each coarser level halves every Cartesian
dimension. `build_gmg_hierarchy(V_fine, mb, cfg)` coarsens while

- the level count is below `gmg_levels`,
- all cell counts are even and at least 2, and
- the current level still has more than `gmg_coarse_dofs` free velocity DOFs
  (default 2000 — the coarsest level is solved exactly, so it must stay
  cheap).

It returns `nothing` (and the Stokes solve falls back to MUMPS) when the
mesh cannot support a useful hierarchy: an adapted (AMR/ALE) or mapped
(chunk) mesh, non-halvable cell counts, or fewer than 2 levels.

Coarse FE spaces are built **only** to recover node coordinates for the
transfer operators; coarse models replicate the fine mesh's wall tags via the
shared full-closure tagging helper `tag_box_walls!`
(`src/core/Mesh.jl`) and apply exactly the velocity Dirichlet tags reported
by `velocity_dirichlet_tags(cfg)` — the coarse spaces must constrain the same
walls (including edge/corner entities) as the fine space, or the geometric
prolongation maps free DOFs inconsistently. See the
[edge/corner Dirichlet story](./discretization.md#wall-tags-and-the-edgecorner-dirichlet-story).

## Geometric transfers in O(n)

The prolongation $P_\ell : V_{\ell+1} \to V_\ell$ (coarse → fine) is built
geometrically by `_geometric_prolongation` in
$O(n_\text{fine} \cdot (p+1)^d)$: every fine free DOF — recovered as a
(node position, vector component) pair by `_free_dof_coords`, which
interpolates coordinate fields instead of relying on Gridap's internal DOF
ordering — is located in its host coarse cell by pure Cartesian index
arithmetic, and the coarse Lagrangian shape functions evaluated at that node
give its row of $P$. A dense (node-grid index, component) → free-DOF lookup
table handles the coarse side; coarse DOFs eliminated by Dirichlet tags map
to zero and are dropped, which is correct for the multigrid *error* equation
(homogeneous BCs).

This replaces an earlier basis-by-basis FE interpolation builder that was
$O(n_\text{coarse} \cdot n_\text{fine})$ and infeasible beyond toy meshes;
the geometric operator was validated against it to machine precision,
including Dirichlet-constrained spaces.

## Galerkin coarse operators (RAP)

Level matrices are never rediscretized. `gmg_setup` forms the Galerkin
triple products

```math
A_{\ell+1} = P_\ell^{\mathsf T} A_\ell P_\ell ,
```

so variable viscosity, free-slip penalty terms, and Dirichlet elimination are
inherited **exactly** from the fine operator — no placeholder coarse
viscosity, no rediscretization. When only matrix values change (new $\eta$
in a Picard iteration, same mesh), `gmg_update!` redoes the RAP products,
refreshes the smoother data, and refactorizes the coarse LU in place
(UMFPACK `lu!` when the pattern is unchanged).

## Smoother and V-cycle

Each level except the coarsest is smoothed by a **Chebyshev iteration of
degree `gmg_cheb_degree`** (default 3) on the Jacobi-preconditioned operator
$D^{-1}A$, targeting the spectrum interval
$[\lambda_\text{max}/4,\; 1.1\,\lambda_\text{max}]$, with
$\lambda_\text{max}$ estimated by 10 power iterations
(`_estimate_lambda_max`, deterministically seeded so repeated setups are
reproducible). Chebyshev needs only matrix-vector products and the inverse
diagonal — no triangular sweeps, so it threads with the SpMV.

The coarsest level is solved exactly with a cached **UMFPACK LU**
factorization of $A_L$.

`vcycle!(y, setup, b)` performs the standard V-cycle: pre-smooth, restrict
the defect with $P_\ell^{\mathsf T}$, recurse, prolongate the correction
($y \mathrel{+}= P_\ell e$), post-smooth. All cycle operations are in-place
on preallocated per-level work vectors (`r`, `d`, `bc`, `yc` in `GMGSetup`)
— **zero allocations per V-cycle**.

## Measured convergence

From the smoke tests in `test/smoke/test_gmg.jl`, run on the actual $Q_2$
vector velocity space with the production assembly:

- **2D, 4-decade viscosity contrast** (stiff block $\eta = 10^4$ in a
  $\eta = 1$ matrix, 32² cells, 4 levels): mean V-cycle contraction factor
  ≈ **0.08** per cycle; residual reduced below $10^{-4} r_0$ within 8
  cycles. This is the configuration the earlier constant-coarse-viscosity
  placeholder could not converge on — the Galerkin RAP is what makes the
  contrast harmless.
- **3D, $10^3$ viscosity contrast** (16³ cells, 3 levels): relative residual
  **3.5 × 10⁻⁶ after 8 V-cycles** (test gate $10^{-3}$).
- After `gmg_update!` with rescaled viscosity (same pattern), convergence is
  unchanged.
- End-to-end, GMG-preconditioned FGMRES reproduces the MUMPS direct solution
  of a buoyancy-driven variable-viscosity Stokes flow to ~4 × 10⁻⁴ relative —
  at the attainable-accuracy floor of the dimensional system, below
  discretization error (see
  [stagnation](./solvers.md#attainable-accuracy-stagnation)).

## Config keys

| Key (`[solver]`) | Default | Meaning |
|---|---|---|
| `gmg_levels` | 3 | Maximum hierarchy depth; auto-clamped by mesh divisibility and `gmg_coarse_dofs` |
| `gmg_cheb_degree` | 3 | Chebyshev degree per pre- and post-smoothing sweep |
| `gmg_cycles` | 1 | V-cycles per FGMRES preconditioner application |
| `gmg_coarse_dofs` | 2000 | Stop coarsening below this many free velocity DOFs |
