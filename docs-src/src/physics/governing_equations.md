# Governing equations

MILET solves creeping (zero-Reynolds-number) thermo-mechanical flow: a mixed
Stokes problem for velocity and pressure with visco-elasto-plastic (VEP)
rheology, coupled to an energy equation ([Heat transport](heat.md)) and a
marker-in-cell material description ([Markers](../numerics/markers.md)).
This page covers the Stokes system as implemented in
`src/physics/Stokes.jl`, the buoyancy term from `src/physics/Gravity.jl` /
`src/time_stepping/PicardLoop.jl`; the compressible (TALA) form is on the
[Compressibility](compressibility.md) page.

## Strong form

In the default Boussinesq formulation (`formulation = "boussinesq"`):

```math
-\nabla\cdot\bigl(2\,\eta_\mathrm{VEP}\,\varepsilon(\mathbf{u})\bigr) + \nabla p = \rho\,\mathbf{g}
\qquad\text{(momentum)}
```

```math
\nabla\cdot\mathbf{u} = 0 \qquad\text{(mass)}
```

with $\varepsilon(\mathbf{u}) = \tfrac12(\nabla\mathbf{u} + \nabla\mathbf{u}^{\mathsf T})$
the symmetric strain-rate tensor and $\eta_\mathrm{VEP}$ the effective
visco-elasto-plastic viscosity (see [Rheology](rheology.md)). MILET uses a
**y-positive-down** convention, so gravity is `gy = +9.81` in the `[gravity]`
TOML section.

## Weak form

`build_stokes_forms` (`src/physics/Stokes.jl`) assembles the bilinear and
linear forms. Multiplying momentum by a test function $\mathbf{v}\in V$,
integrating the stress term by parts, and testing continuity with $q\in Q$:

```math
a\bigl((\mathbf{u},p),(\mathbf{v},q)\bigr)
= \int_\Omega 2\,\eta_\mathrm{VEP}\,\varepsilon(\mathbf{u}):\varepsilon(\mathbf{v})\,d\Omega
- \int_\Omega p\,(\nabla\cdot\mathbf{v})\,d\Omega
- \int_\Omega q\,(\nabla\cdot\mathbf{u})\,d\Omega
+ \sum_{\Gamma_\mathrm{fs}} \int_{\Gamma} \gamma\,(\mathbf{u}\cdot\mathbf{n})(\mathbf{v}\cdot\mathbf{n})\,d\Gamma
```

```math
l\bigl((\mathbf{v},q)\bigr)
= \int_\Omega \rho\,\mathbf{g}\cdot\mathbf{v}\,d\Omega
+ \int_\Omega \chi\,\boldsymbol{\sigma}_\mathrm{old}:\varepsilon(\mathbf{v})\,d\Omega
+ \sum_{\Gamma_t} \int_{\Gamma} \mathbf{t}\cdot\mathbf{v}\,d\Gamma
```

The system is discretized with inf-sup stable **Q2–Q1 Taylor–Hood** elements
(`fe_order_v = 2`, `fe_order_p = 1` in the `[fe]` section; see
[Discretization](../numerics/discretization.md)). $\eta_\mathrm{VEP}$ enters
as a piecewise-constant `CellField` projected from the markers
(`project_markers_to_cells!` in `src/particles/Projection.jl`).
`assemble_stokes` wraps the forms into a Gridap `AffineFEOperator`.

### Free-slip penalty

Walls flagged `free_slip` (`bc_left`, `bc_right`, `bc_surface`, `bc_deep`,
plus `bc_front`/`bc_back` in 3D) contribute the penalty term

```math
\int_{\Gamma} \gamma\,(\mathbf{u}\cdot\mathbf{n})(\mathbf{v}\cdot\mathbf{n})\,d\Gamma ,
```

which weakly enforces no-penetration ($\mathbf{u}\cdot\mathbf{n}=0$) while
leaving the tangential component free. `build_free_slip_bcs` sets the
penalty scale per wall as

```math
\gamma = \texttt{free\_slip\_penalty}\cdot\frac{\eta_\mathrm{ref}}{h_x},
```

where $\eta_\mathrm{ref}$ is the volume-mean viscosity of the current
iteration (floored at `eta_min`) and $h_x$ the cell width — so the
dimensionless config key `free_slip_penalty` (default `1000`) is portable
across viscosity regimes and resolutions.

### Traction (Neumann) walls

Walls flagged `traction` impose $\boldsymbol{\sigma}\cdot\mathbf{n} = \mathbf{t}$
via the RHS boundary integral $\int_\Gamma \mathbf{t}\cdot\mathbf{v}\,d\Gamma$.
`build_traction_bcs` composes the global-frame traction vector from the
per-wall config keys `t_traction_<wall>_n` (normal, positive outward) and
`t_traction_<wall>_t` (tangential), where `<wall>` is one of
`left | right | surface | deep`. Walls flagged `prescribed` use strong
Dirichlet values instead (`src/boundary_conditions/Velocity.jl`).

### VEP elastic memory source

For Maxwell visco-elasticity the previous-step deviatoric stress enters the
RHS as

```math
\int_\Omega \chi\,\boldsymbol{\sigma}_\mathrm{old}:\varepsilon(\mathbf{v})\,d\Omega ,
\qquad \chi = 1 - Z,
```

where $Z = G\,\Delta t/(\eta_\mathrm{VP} + G\,\Delta t)$ is the
visco-elasticity factor and $\chi$ the elastic-memory weight (derivation in
[Rheology — Maxwell elasticity](rheology.md#maxwell-elasticity)).
$\boldsymbol{\sigma}_\mathrm{old}$ is a cell-piecewise `SymTensorValue`
field built from the marker-averaged stress components by
`build_sigma_old_cellfield`. `picard_stokes!` only constructs this term when
any cell has $\chi > 0$ (i.e. some rock has `shear_modulus` $G > 0$); with
$\chi = 0$ everywhere the system reduces to pure visco-plastic Stokes.

After each Stokes solve, `update_marker_stresses!` applies the marker-level
stress update (Gerya 2010, eq. 12.13)

```math
\boldsymbol{\sigma}_\mathrm{new} = 2\,\eta_\mathrm{VEP}\,\dot\varepsilon(\mathbf{u})
+ \chi\,\boldsymbol{\sigma}_\mathrm{old}
```

followed by an explicit **Jaumann co-rotation** increment
$\Delta t\,(\mathbf{W}\boldsymbol{\sigma} - \boldsymbol{\sigma}\mathbf{W})$
with spin tensor $\mathbf{W} = \tfrac12(\nabla\mathbf{u} - \nabla\mathbf{u}^{\mathsf T})$;
the 3D variant `_update_marker_stresses_3d!` carries all six deviatoric
components and the full three-component spin. `recover_invariants!`
computes cell-mean $\dot\varepsilon_{II} = \sqrt{\tfrac12\,\varepsilon:\varepsilon}$
and $\sigma_{II} = 2\,\eta\,\dot\varepsilon_{II}$ for diagnostics and for the
next nonlinear iteration.

## Buoyancy: Boussinesq perturbation form

`buoyancy_cellfield` (`src/physics/Gravity.jl`) builds the body-force
`CellField` used in $l$. By default the **perturbation form** is used:

```math
\mathbf{f}_\mathrm{buoy} = (\rho - \bar\rho)\,\mathbf{g},
```

where $\bar\rho$ is the **volume-weighted** mean cell density of the current
Picard iteration (a plain arithmetic mean would bias toward refined regions
on AMR meshes and produce spurious buoyancy). The hydrostatic component
$\bar\rho\,\mathbf{g}$ is absorbed into a reference pressure that is dropped
from the system entirely — this prevents direct-solver pivoting on the
singular saddle point from leaking the hydrostatic gradient into the
velocity field (observed as $10^4\times$ overestimated plume velocities
before the fix; see the commentary in `src/time_stepping/PicardLoop.jl`).

Options:

| Config key | Default | Effect |
|---|---|---|
| `body_force_full` | `false` | `true` → use full $\rho\,\mathbf{g}$ (I2ELVIS/FD convention), no subtraction |
| `buoyancy_from_T` | `false` | `true` → build $\rho(T_h) = \rho_0\bigl(1 - \alpha\,(T_h - T_\mathrm{ref})\bigr)$ from the **continuous FE temperature** (resolves thermal boundary layers that the cell-constant marker projection under-drives at high Ra); $T_\mathrm{ref}$ = `T_ref_density` |
| `gravity.model` | `"vertical_const"` | `"vertical_const"` (constant $(g_x,g_y[,g_z])$ from `gx`,`gy`,`gz`) or `"radial"` ($-g_\mathrm{mag}\,\hat{\mathbf r}$ toward the origin, magnitude `g_mag`) — `gravity_fn` in `src/physics/Gravity.jl` |

## Compressible flow (TALA)

`formulation = "tala"` replaces the Boussinesq equations with the truncated
anelastic liquid approximation of King et al. (2010). The equations, the
reference state and their verification are on the
[Compressibility](compressibility.md) page.

## Nonlinear (Picard) iteration

The viscosity depends on strain rate, $\eta = \eta(\dot\varepsilon_{II})$, so
the Stokes operator is nonlinear. `picard_stokes!`
(`src/time_stepping/PicardLoop.jl`) iterates:

1. project markers → cell fields ($\eta$, $\rho$, $\chi$, $\boldsymbol{\sigma}_\mathrm{old}$),
2. assemble and solve the linear Stokes system with frozen $\eta^{(k)}$,
3. recover $\dot\varepsilon_{II}^{(k+1)}$,
4. test $\lVert\mathbf{u}^{(k+1)} - \mathbf{u}^{(k)}\rVert / \lVert\mathbf{u}^{(k+1)}\rVert < \texttt{picard\_tol}$.

Controls in `[fe]`: `n_picard` (default `3`), `picard_tol` (default `1e-3`),
`nonlinear_method = "picard" | "newton"` and `newton_damping`
($\alpha\in(0,1]$ under-relaxation; $\alpha = 1$ recovers Picard). Sparse
patterns, factorizations, and multigrid hierarchies are cached across
iterations — see [Linear solvers](../numerics/solvers.md) and
[Geometric multigrid](../numerics/multigrid.md).

## Related pages

- [Rheology](rheology.md) — how $\eta_\mathrm{VEP}$, $Z$, $\chi$ are computed
- [Heat transport](heat.md) — the coupled energy equation
- [Two-phase flow](two_phase.md) — the three-field $(u_s, p_f, p_c)$ extension
- [Free surface](free_surface.md) — sticky-air and ALE treatments
- [Parameter file](../reference/parameter_file.md) — full key reference
