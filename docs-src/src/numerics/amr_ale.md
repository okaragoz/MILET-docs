# AMR & ALE

Two optional mechanisms move the mesh during a run: adaptive mesh refinement
(`src/solvers/AMR.jl`) and the arbitrary-Lagrangian–Eulerian free surface
(`src/physics/ALEFreeSurface.jl`). Both produce a mesh that the rest of the
code treats as *adapted* (`MeshBundle.adapted = true`), which disables every
Cartesian fast path — read the [limitations](#limitations) below before
enabling either.

## Adaptive mesh refinement

Strategy: standard **fixed-fraction refinement**. Every `amr_every` steps
(when `do_amr = true`):

1. Compute a per-cell scalar indicator $I_K$ (`amr_indicator`).
2. Mark the top `amr_refine_fraction` of cells by $I_K$
   (`fixed_fraction_marks` — threshold at the $n$-th largest indicator).
3. Refine marked cells via `Gridap.Adaptivity.refine` (each split into 4 in
   2D / 8 in 3D); unmarked cells are untouched.

### Indicators (`amr_criterion`)

| Value | Indicator | Captures |
|---|---|---|
| `"T_gradient"` (default) | $I_K = \overline{\lVert\nabla T\rVert}_K \cdot h_K$ (cell-mean of $\int_K \lVert\nabla T\rVert$) | thermal interfaces — plume head, slab top |
| `"strain_rate"` | $I_K = \dot\varepsilon_{II,K} \cdot h_K$ | faults, shear bands |
| `"viscosity"` | $I_K = \lvert\nabla \log_{10}\eta\rvert_K \cdot h_K$ (central FD between cell centres) | rheology jumps |
| `"composition"` | $I_K = \overline{\lVert\nabla C\rVert}_K \cdot h_K$ (needs `do_composition_fe`) | compositional interfaces |
| `"user"` | closure `(x, y, z, state, cfg) -> Float64` passed as `amr_user_indicator` to `run_case` | anything |

With sticky air (`air_thick > 0`) the indicator is masked to zero for all
cells above `air_thick + 2·Δy`: the air/lithosphere velocity discontinuity
creates spurious high strain-rate / $T$-gradient signals that would otherwise
waste the refinement budget on the interface.

### State transfer

`apply_amr!` rebuilds the `MeshBundle` around the `RefinedDiscreteModel`
(`rebuild_mesh_bundle`, which preserves the inherited wall tags), rebuilds
the FE spaces, and transfers the FE solutions
(`uh`, `ph`, `Th`, `Th_old`, `Ch`, `Ch_old`, extra composition fields) by
interpolation via Gridap's `Interpolable`. The transfer is NaN-safe
(`_safe_fe_transfer`): any non-finite DOF — possible when the KDTree search
misses a boundary point by floating-point ε — is replaced by a conservative
fallback value, and a failed transfer falls back to a constant field.

Markers are *unchanged* (they hold global coordinates); only their host-cell
association is recomputed at the next projection.

### Per-cell state reset caveat

The per-cell arrays cannot be interpolated — the cell set itself changed —
so `apply_amr!` **reallocates and resets** them to defaults for the new cell
count: $\eta_c = \tfrac12(\eta_\text{min}+\eta_\text{max})$;
$\rho_c$, $c_{p,c}$, $k_{t,c}$, $h_{t,c}$ from the *last* rock in
`cfg.rocks` (conventionally the asthenosphere background);
$\dot\varepsilon_{II,c}$ to `eii_seed` (or $10^{-15}$);
**old deviatoric stresses and the Maxwell weight $\chi_c$ to zero**. The
defaults exist so cells that receive no markers in the subsequent
re-projection do not keep $\eta = 0$ and produce NaNs in the next assembly,
but the consequences are real: the VEP elastic memory is wiped at every AMR
event, and rheology in sparsely-marked refined cells is the background until
markers are re-binned. The Driver immediately re-projects markers after
`apply_amr!` and additionally **skips one heat solve** (`skip_heat_next`) —
on rare refinement patterns the first post-AMR heat solve produced NaN
(a Gridap quadrature edge case with specific hanging-node configurations).

### Config keys

```toml
[amr]
do_amr              = false
amr_every           = 10
amr_refine_fraction = 0.3
amr_criterion       = "T_gradient"  # T_gradient | composition | strain_rate | viscosity | user
# amr_coarsen_fraction = 0.0        # bottom fraction coarsened (refine-only by default)
# amr_max_level        = 2          # cap on refinement levels
```

`amr_coarsen_fraction` and `amr_max_level` are parsed
(`src/io/TOMLLoader.jl`) but coarsening is not yet wired into `apply_amr!` —
the implementation is currently refine-only.

## ALE free surface

`do_ale_free_surface = true` (2D only) replaces the sticky-air approximation
with a mesh that follows the rock–air interface, using vertical stretching
after Kaus, Mühlhaus & May (2010). Per step (after AMR, at the end of the
Driver loop):

1. Sample $v_y$ at every top-row $x$-grid line at the current surface height
   (`_sample_vy_at_surface`).
2. Advance the 1-D height field $h(x)$ — positive $h$ = surface risen above
   its initial level, since $y$ points down — with the **Kaus implicit
   stabilization** against the drunken-sailor instability:

   ```math
   h_\text{new} = h + \frac{\Delta t \,(-v_y)}
   {1 + \theta\, g\, \Delta\rho_\text{max}\, \Delta t^2 / (\eta_\text{ref}\,\Delta x)},
   ```

   with $\theta$ = `fs_stabilisation` (0 = none, 0.5–1 = strong; default
   0.5), $\Delta\rho_\text{max} \approx$ `rho_ref_heat`,
   $\eta_\text{ref} =$ `eta_max` (`update_surface_height`).
3. Optional Crameri-style horizontal smoothing, weight `surface_smooth`
   (default 0): $h_i \leftarrow (1-w)h_i + \tfrac{w}{2}(h_{i-1}+h_{i+1})$.
4. Rebuild the `CartesianDiscreteModel` with the vertical-stretch map
   (`build_mapped_model`)

   ```math
   y_\text{phys} = Y - h(X)\,\bigl(1 - Y/\texttt{ysize}\bigr),
   ```

   so the bottom stays fixed and the top sits at $y = -h(X)$; $h(X)$ is
   linearly interpolated between grid lines.
5. Re-wrap into a `MeshBundle` (`rebuild_mb_with_ale`) and transfer
   `uh`, `ph`, `Th`, `Th_old` with the same NaN-safe `Interpolable`
   machinery as AMR, then re-project markers.

```toml
[free_surface]
do_ale_free_surface = false
fs_stabilisation    = 0.5
surface_smooth      = 0.0
```

## Limitations

### Fast paths disabled on adapted meshes

Every mesh produced by AMR or ALE (and the chunk geometry) is flagged
`adapted = true`, and all of the following silently switch from the
$O(1)$ Cartesian arithmetic path to Gridap's general KDTree point-in-cell
search — which is also **not thread-safe**, so these loops run serial:

- marker → cell projection (`_project_markers_general!`, host-only stencil —
  the bilinear stencil needs the uniform neighbour layout);
- RK4 advection (generic `eval_velocity` instead of the
  [direct Q2 snapshot evaluators](./markers.md#fast-q2q1-evaluators) —
  roughly the ~300× evaluator speedup is lost);
- marker temperature/strain/grain-size updates;
- subgrid temperature diffusion (`apply_subgrid_diffusion!` is a no-op on
  adapted meshes).

The [GMG hierarchy](./multigrid.md) also cannot be built on an adapted or
mapped mesh — `build_gmg_hierarchy` returns `nothing` and `solver_type =
"gmg"`/`"auto"` falls back to the cached MUMPS direct solve (one-time
warning). Expect AMR/ALE runs to be markedly slower per marker and per solve
than uniform-mesh runs of comparable size; the solver caches themselves
(keyed on model identity and DOF counts) rebuild automatically after every
mesh swap.

### Other caveats

- AMR refinement is one-way in practice (no coarsening yet); recovering a
  coarse mesh means rebuilding the model.
- ALE is 2D-only and assumes the `box` geometry (the rebuild re-tags walls
  with the fixed Cartesian entity IDs of `CartesianDiscreteModel`).
- AMR and the heat solve interact through the one-step `skip_heat_next`
  guard; diagnostics for that step reflect the pre-AMR temperature.
- Combining AMR with two-phase flow or volatile transport is untested.
