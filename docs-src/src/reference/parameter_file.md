# Parameter file reference

Every MILET run is fully specified by a single TOML file in `cases/`. The
loader (`load_config_toml` in `src/io/TOMLLoader.jl`) parses the file,
**deep-merges it onto `cases/_defaults.toml`**, and builds the immutable
`Config` struct (`src/core/Config.jl`) that every module reads. A minimal
case therefore only states what differs from the defaults.

```bash
julia --project=. main.jl cases/my_case.toml
```

This page documents **every key the loader reads**, grouped by section, with
type, default, and units. The *Default* column shows the value shipped in
`cases/_defaults.toml`; keys marked *(loader)* are not present in the
defaults file and fall back to the hard-coded default inside
`load_config_toml`.

## Loading semantics and precedence

The loader applies three deterministic transformations
(`src/io/TOMLLoader.jl`):

1. **Deep merge** (`_deep_merge`): the user file is merged onto
   `cases/_defaults.toml`, with user values winning on every key collision,
   recursively through nested tables.
2. **Section flattening** (`_flatten_sections`): all `[section]` tables are
   flattened into one namespace. Keys are promoted bare (`[time] ntot` →
   `ntot`); for the sections in `_PREFIX_SECTIONS`
   (`output`, `checkpoint`, `free_surface`, `amr`, `anisotropic_heating`,
   `boundary_velocity`, `boundary_temperature`, `solver`, `gravity`,
   `twophase`) a prefixed alias is added as well (`[output] dir` →
   `output_dir`, `[solver] type` → `solver_type`), which is the name the
   loader actually reads. You may write either form.
3. **`[model]`-last precedence**: sections are flattened in **sorted
   alphabetical order, with the legacy flat `[model]` block flattened
   last**, so an explicit key in `[model]` always beats a
   section-promoted value. This rule is deterministic by construction —
   earlier versions relied on `Dict` iteration order, which could silently
   load a 3D case as 2D depending on hash order.

The array-of-tables (`[[rock]]`, `[[phase]]`, `[[melt]]`, `[[layer]]`,
`[[init_T]]`) are **replaced wholesale**, never merged: if your file defines
any `[[rock]]` entry, the defaults' rock list is discarded entirely
(materials are case-specific).

::: warning Sectioned layout for nondimensional cases
Benchmarks that override many defaults (Blankenbach, SolCx) must use the
sectioned layout — see the header comment in `cases/blankenbach_1a.toml`.
A flat layout that relies on bare-key promotion can lose to defaults during
flattening.
:::

## `[model]`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `case` | string | `"subduction"` | Case identifier, dispatched by `select_case` (`src/io/TOMLLoader.jl`) to the initial rock-type / temperature closures. Known names: `subduction`, `subduction_init`, `extension`, `falling_block`, `plume`, `plume3d`, `rt3d`, `busse`, `blankenbach`, `solcx`, `chunk`. Unknown names fall back to the data-driven `[[layer]]` / `[[init_T]]` path. |
| `eclogite_flow_law` | string | `""` | Optional granulite→eclogite rheology blend for a `transition = 3` phase: name of a `FLOW_LAWS` entry (e.g. `"Dry_Eclogite-Jin_2001"`); the dislocation viscosity of an eclogitising `disl_prof` rock is log-interpolated toward it with the eclogite fraction $X$. `""` = off. See [Rheology](../physics/rheology.md). |
| `eclogite_floor_stop` | bool | `false` | With a `transition = 3` phase, stop the run (with a final checkpoint) once the deepest marker of its `rock_from` with $X > 0.55$ reaches 95 % of `ysize`. |

Any other key placed in `[model]` is treated as a flat top-level key and,
by the precedence rule above, overrides the same key from any section.

## `[mesh]`

| Key | Type | Default | Units | Meaning |
|---|---|---|---|---|
| `dim` | int | 2 | — | 2 or 3 |
| `xsize` | float | 4.0e6 | m | Domain extent in x (required for `box` geometry) |
| `ysize` | float | 1.4e6 | m | Domain extent in y; **y grows downward** (y = 0 is the surface) |
| `zsize` | float | 0.0 | m | Domain extent in z (3D only) |
| `nx`, `ny`, `nz` | int | 101, 36, 1 | — | Grid **lines** per axis (cells = n − 1) |
| `mnx`, `mny`, `mnz` | int | 4, 4, 1 | — | Markers per cell per axis |
| `geometry` | string | `"box"` | — | `box` \| `chunk` \| `sphere_shell`. Non-box geometries derive `xsize`/`ysize` from `r_outer − r_inner` if absent |
| `r_inner` | float | 3.481e6 | m | Inner radius (chunk/shell) |
| `r_outer` | float | 6.371e6 | m | Outer radius (chunk/shell) |
| `chunk_theta_extent` | float | 1.0472 (π/3) | rad | Angular extent θ of the chunk |
| `chunk_phi_extent` | float | 1.0472 | rad | Angular extent φ (3D chunk) |

## `[gravity]`

| Key | Type | Default | Units | Meaning |
|---|---|---|---|---|
| `gx`, `gy`, `gz` | float | 0.0, 9.81, 0.0 | m/s² | Constant Cartesian gravity. `gy > 0` points down (y-down convention) |
| `model` | string | `"vertical_const"` | — | `vertical_const` \| `radial` (`gravity_fn` in `src/physics/Gravity.jl`; radial points toward the origin) |
| `g_mag` | float | 9.81 | m/s² | Magnitude for `radial` gravity |

## `[time]`

| Key | Type | Default | Units | Meaning |
|---|---|---|---|---|
| `maxxystep` | float | 0.5 | — | Courant fraction for both the advection and the thermal-diffusion limit (`compute_dt`, `src/time_stepping/CFL.jl`) |
| `maxtkstep` | float | 50.0 | K | Maximum temperature change per step |
| `maxtmstep` | float | 1.5e13 | s | Hard upper bound on Δt (≈ 500 kyr) |
| `ntot` | int | 100 | — | Total number of time steps |
| `pinit` | float | 0.0 | Pa | Reference pressure offset |
| `t_end_myr` | float | 0.0 *(loader)* | Myr | Stop when simulated time exceeds this (writing a final checkpoint when `do_checkpoint`); 0 disables (steps then end only at `ntot`) |
| `cfl_exclude_air` | bool | false | — | With `do_free_surface`, take $v_{\max}$ for the advection limit only over cells that are mostly rock (density ≥ half the lightest non-air rock), so fast circulation inside a low-viscosity sticky-air layer does not set the time step |

The time step is $\Delta t = \max\!\big(\min(C\,h/v_{\max},\; C\,h^2 \rho c_p / k,\; \texttt{maxtmstep}),\; \texttt{maxtmstep}\cdot 10^{-8}\big)$ with $C$ = `maxxystep`; $v_{\max}$ is the largest velocity DOF (over mostly-rock cells only when `cfl_exclude_air = true`). With [two-phase flow](../physics/two_phase.md) enabled, the melt segregation speed (`max_melt_segregation_speed`) is added to the CFL constraint.

## `[rheology]`

Global limits applied after the per-rock clamps (the effective bound is
`clamp(η, max(eta_min, rock.eta_min), min(eta_max, rock.eta_max))` —
`_compute_viscosity_core` in `src/materials/Rheology.jl`).

| Key | Type | Default | Units | Meaning |
|---|---|---|---|---|
| `eta_min` | float | 1e19 | Pa·s | Global lower viscosity clamp |
| `eta_max` | float | 1e25 | Pa·s | Global upper viscosity clamp |
| `str_min` | float | 1e-18 | 1/s | Minimum strain-rate invariant (regularizes plastic viscosity and strain accumulation) |
| `eii_seed` | float | 0.0 | 1/s | Initial $\dot\varepsilon_{II}$ for the first Picard iteration so power-law creep engages on step 1 |
| `body_force_full` | bool | false | — | `false`: Boussinesq perturbation buoyancy $(\rho - \bar\rho)\,g$; `true`: full $\rho g$ body force |
| `formulation` | string | `"boussinesq"` | — | `boussinesq` \| `tala` — `tala` is the truncated anelastic approximation of King et al. (2010) about the reference state below (see [Compressibility](../physics/compressibility.md#TALA)); any other value is an error (`ala` is not implemented) |
| `ref_T0` | float | `T_top` | K | TALA reference temperature at $y = 0$: $\bar T(y) = T_0\,e^{\alpha_r g y / c_p}$ (the surface temperature for the King et al. benchmark, the mantle potential temperature for planetary models) |
| `ref_rho0` | float | rock 1 `reference_density` | kg/m³ | TALA reference density at $y = 0$: $\bar\rho(y) = \rho_0\,e^{\alpha_r g y / (\gamma_r c_p)}$ |
| `ref_alpha` | float | rock 1 `thermal_expansion` | 1/K | $\alpha_r$ of the reference state |
| `ref_cp` | float | rock 1 `specific_heat` | J/kg/K | $c_p$ of the reference state |
| `ref_gamma` | float | 1.0 | — | Grüneisen parameter $\gamma_r$ |
| `grain_exponent` | float | 0.0 | — | Legacy grain-size modifier on the `eta0` path: $\eta \mathrel{*}= (d/d_{\rm ref})^m$; 0 = off (the calibrated grain-size law uses `diff_*` instead) |
| `strain_gate_plastic` | bool | true *(loader)* | — | Accumulate weakening strain only weighted by the per-cell yield fraction (see [Softening & healing](../physics/softening.md)); `false` = legacy total-strain accumulation |

## `[temperature]`

| Key | Type | Default | Units | Meaning |
|---|---|---|---|---|
| `T_top` | float | 273.0 | K | Surface Dirichlet temperature |
| `T_bot` | float | 1623.0 | K | Bottom Dirichlet temperature |
| `T_ref_density` | float | 298.15 | K | Reference temperature for the density expansion $\rho_0 (1 - \alpha (T - T_{\rm ref}))$ |
| `rho_ref_heat` | float | 3300.0 | kg/m³ | Reference ρ in the $\rho c_p$ heat-capacity term |
| `marker_T_mode` | string | `"pic_increment"` | — | `pic_increment`: markers carry T and advect it; the FE solve contributes only the diffusion + sources **increment** (I2ELVIS/PIC pattern, validated on Blankenbach). `overwrite`: the grid solution replaces marker T each step — with the default diffusion-only heat operator temperature does **not** advect; only use deliberately (e.g. with `do_supg_heat = true`) |
| `heat_stabilisation` | string | `"none"` | — | `none` \| `supg` \| `entropy` — stabilisation for FE temperature advection (see [Heat transport](../physics/heat.md)) |
| `H_const` | float | 0.0 | W/m³ | Uniform constant volumetric heating added to every cell |

## `[physics]` — toggles

All booleans, read by `run_case` (`src/time_stepping/Driver.jl`):

| Key | Default | Meaning |
|---|---|---|
| `do_stokes` | true | Solve momentum each step |
| `do_heat` | true | Solve the energy equation each step |
| `do_advect` | true | Advect markers (RK4, `advect_markers!`) |
| `do_adiabatic` | false | Adiabatic heating $H = \alpha T \rho_{\rm ref}\, g\, u_y$ |
| `do_shear_heating` | true | Viscous dissipation $H = 4\eta\,\dot\varepsilon_{II}^2$ |
| `do_friction` | true | Drucker–Prager plastic yield + strain weakening |
| `do_phase_change` | false | Per-marker phase transitions (`[[phase]]`) |
| `do_melting` | false | Katz-lite melting + extraction (`[[melt]]`) |
| `do_free_surface` | true | Sticky-air free-surface handling |
| `do_radiogenic` | true | Radiogenic heating $H = \rho h_r$ per rock |
| `do_supg_heat` | false | FE advection of T with SUPG stabilisation (instead of marker advection) |
| `do_composition_fe` | false | Additional smooth Q1 composition field, advected on the FE grid |
| `buoyancy_from_T` | false *(loader)* | Buoyancy directly from the FE temperature field, $\rho g = -\rho_0 \alpha T\, g$ (used by nondimensional convection benchmarks) |
| `do_subgrid_diffusion` | false *(loader)* | Subgrid-scale marker–grid temperature relaxation (Gerya & Yuen 2003, `apply_subgrid_diffusion!`) |
| `subgrid_d` | 1.0 *(loader)* | Subgrid diffusion strength coefficient d |
| `subgrid_scheme` | `"gerya_yuen"` *(loader)* | `"gerya_yuen"`: full Gerya & Yuen (2003) scheme, the subgrid change is subtracted from the grid increment; `"reproject"`: legacy re-projection (drifts; only to reproduce old runs) |
| `do_volatile` | false *(loader)* | Multi-species volatile transport — part of a separate study; disabled in this release |
| `n_comp_fields` | 0 *(loader)* | Number of independent FE composition fields when `do_composition_fe` |

## `[boundary_velocity]`

Per-wall mechanical BC type; walls are `left`, `right`, `surface` (y = 0),
`deep` (y = ysize), and `front`/`back` in 3D.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `bc_left`, `bc_right`, `bc_surface`, `bc_deep`, `bc_front`, `bc_back` | string | `"prescribed"` | `prescribed` \| `free_slip` \| `traction` |
| `free_slip_penalty` | float | 1000.0 | Penalty factor γ in the weak no-penetration term $\int_\Gamma \gamma (u\cdot n)(v\cdot n)\,d\Gamma$ |
| `t_traction_surface_n` / `_t` | float | 0.0 | Normal / tangential traction (Pa) when `bc_surface = "traction"` |
| `t_traction_deep_n` / `_t` | float | 0.0 | As above for the deep wall |
| `t_traction_left_n` / `_t` | float | 0.0 | As above for the left wall |
| `t_traction_right_n` / `_t` | float | 0.0 | As above for the right wall |

- `prescribed` — strong Dirichlet from the per-wall closures `bc_left(cfg)`,
  `bc_right(cfg)`, … (`src/boundary_conditions/Velocity.jl`); for the
  subduction case these inject the plate velocities `vx_plate` /
  `vx_plate_right` within the plate-depth windows.
- `free_slip` — only $u \cdot n = 0$ enforced weakly (penalty term added in
  `build_free_slip_bcs`, `src/physics/Stokes.jl`); tangential motion free.
- `traction` — Neumann $\sigma \cdot n = t$ via `build_traction_bcs`.

## `[boundary_temperature]`

| Key | Type | Default | Units | Meaning |
|---|---|---|---|---|
| `bcT_surface`, `bcT_deep` | string | `"dirichlet"` | — | `dirichlet` \| `flux` \| `insulating` \| `robin` |
| `bcT_left`, `bcT_right`, `bcT_front`, `bcT_back` | string | `"insulating"` *(loader)* | — | Lateral wall T BCs (insulating = natural zero-flux) |
| `q_surface`, `q_deep` | float | 0.0 | W/m² | Prescribed flux when type = `flux` ($-k\nabla T\cdot n = q$) |
| `h_robin` | float | 0.0 | W/m²/K | Robin coefficient: $-k\nabla T\cdot n = h\,(T - T_{\rm amb})$ |
| `T_amb` | float | 298.15 | K | Ambient temperature for the Robin BC |

Flux and Robin contributions are assembled by `build_heat_flux_bcs` and
`assemble_heat` (`src/physics/Heat.jl`).

## `[free_surface]`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `do_ale_free_surface` | bool | false | ALE vertical mesh stretching following the rock–air interface (Kaus et al. 2010; `src/physics/ALEFreeSurface.jl`) |
| `fs_stabilisation` | float | 0.5 | Implicit damping θ in the Kaus 2010 stability factor (0 = none, 1 = strong) |
| `surface_smooth` | float | 0.0 | Horizontal Laplacian smoothing of the marker surface (`smooth_air_interface!`) |
| `air_rock_id` | int | 1 | Which `[[rock]]` index represents sticky air |

See [Free surface](../physics/free_surface.md).

## `[anisotropic_heating]`

Fabric-aligned anisotropic shear heating (`anisotropic_shear_heating`,
`src/physics/AdvancedHeating.jl`).

| Key | Type | Default | Meaning |
|---|---|---|---|
| `fabric_nx`, `fabric_ny` | float | 0.0 | Fabric direction components; (0, 0) disables |
| `fabric_back_stress` | float | 1.0 | Back-stress amplification factor |

## `[amr]`

Adaptive mesh refinement (`src/solvers/AMR.jl`). Marker loops fall back to
serial Gridap point location on adapted meshes — AMR currently slows runs
substantially (see [AMR & ALE](../numerics/amr_ale.md)).

| Key | Type | Default | Meaning |
|---|---|---|---|
| `do_amr` | bool | false | Enable adaptive refinement |
| `amr_every` | int | 10 | Adapt every N steps |
| `amr_refine_fraction` | float | 0.3 | Top fraction of cells (by indicator) refined |
| `amr_coarsen_fraction` | float | 0.0 *(loader)* | Bottom fraction coarsened |
| `amr_max_level` | int | 2 *(loader)* | Refinement-level cap |
| `amr_criterion` | string | `"T_gradient"` | `T_gradient` \| `composition` \| `strain_rate` \| `viscosity` \| `user` (`amr_indicator`) |

## `[fe]`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `fe_order_v` | int | 2 | Velocity polynomial order (Q2, Taylor–Hood) |
| `fe_order_p` | int | 1 | Pressure order (Q1) |
| `fe_order_T` | int | 1 | Temperature order (Q1) |
| `n_picard` | int | 3 | Max nonlinear (Picard) iterations per step |
| `picard_tol` | float | 1e-3 | Relative convergence $\lVert \Delta u\rVert / \lVert u\rVert$ |
| `nonlinear_method` | string | `"picard"` | `picard` \| `newton` (damped Picard update) \| `full_newton` (AD Jacobian, `newton_stokes!`) |
| `newton_damping` | float | 0.5 | Under-relaxation α ∈ (0, 1] for `newton`; α = 1 recovers Picard |

See [Time stepping](../numerics/time_stepping.md) and `picard_stokes!`
(`src/time_stepping/PicardLoop.jl`).

## `[solver]`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `type` | string | `"mumps"` | `mumps` (cached direct LU) \| `gmg` (alias `vcycle`; FGMRES + geometric multigrid) \| `auto` (gmg above 400k DOFs, mumps below — `resolve_solver_type`) \| `petsc` \| `bamgs` |
| `petsc_preset` | string | `"lu_mumps"` | `lu_mumps` \| `fgmres_gamg` \| `bcgs_ilu` \| `fgmres_fieldsplit` \| `custom` (`petsc_options` in `src/solvers/PETScSolvers.jl`) |
| `petsc_options` | string | `""` | Raw PETSc CLI string when `petsc_preset = "custom"` |
| `krylov_tol` | float | 1e-7 | Relative residual tolerance for the Krylov solve |
| `krylov_maxit` | int | 200 | Maximum Krylov iterations |
| `krylov_restart` | int | 30 | FGMRES restart length (gmg path) |
| `gmg_levels` | int | 3 | Multigrid depth (auto-clamped to what the mesh allows) |
| `gmg_cheb_degree` | int | 3 | Chebyshev smoother degree per pre/post sweep |
| `gmg_cycles` | int | 1 | V-cycles per preconditioner application |
| `gmg_coarse_dofs` | int | 2000 | Stop coarsening below this many velocity DOFs |

The iterative path is right-preconditioned FGMRES on the monolithic
saddle-point system with a block preconditioner: Galerkin geometric
multigrid on the velocity block, η-weighted lumped pressure mass on the
Schur complement (see [Linear solvers](../numerics/solvers.md) and
[Geometric multigrid](../numerics/multigrid.md)).

## `[checkpoint]`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `do_checkpoint` | bool | false *(loader)* | Master enable for periodic checkpoints |
| `every` | int | 0 | Checkpoint every N steps (`checkpoint_every`; both `do_checkpoint = true` and `every > 0` are required) |
| `restart` | bool | false | Resume from the latest checkpoint found in the output directory (`load_latest_checkpoint`, `src/io/Checkpoint.jl`) |

## `[output]`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `dir` | string | `"output"` | Output directory (`output_dir`) |
| `every` | int | 10 | Write VTU snapshots + PVD collections every N steps |
| `diagnostics_every` | int | 1 | Full marker/DOF diagnostics (O(n_markers) scans, `isfinite` health checks in `record_step!`) every N steps; the cheap per-step `run.log` line is always written. Raise (e.g. 25) for large runs |
| `every_myr` | float | 0.0 | Also write output at every multiple of this model time (Myr); the step that would pass it is shortened to land on it exactly (`output_every_myr`). 0 = off |
| `projection_mode` | string | `"host"` | Marker→cell projection: `host` (host-cell mean, sharp) \| `bilinear` (2×2 stencil scatter, smoothed) |

## `[subduction]`

Only used when `case = "subduction"` (wall plate driving + slab geometry,
`rock_type_subduction` / `bc_left` / `bc_right`).

| Key | Type | Default | Units | Meaning |
|---|---|---|---|---|
| `trench_x` | float | 2.0e6 | m | Initial trench position |
| `plate_thickness` | float | 8.0e4 | m | Oceanic plate thickness |
| `plate_age` | float | 4.0e7 | yr | Plate age for the half-space-cooling geotherm |
| `continent_thickness` | float | 1.2e5 | m | Overriding continental plate thickness |
| `air_thick` | float | 4.0e4 | m | Sticky-air layer thickness |
| `x_plate_left`, `x_plate_right` | float | 2.94e5, 3.706e6 | m | Plate-velocity window bounds on the side walls |
| `vx_plate` | float | 9.51173e-10 | m/s | Left-wall plate velocity (≈ 3 cm/yr) |
| `vx_plate_right` | float | −9.51173e-10 | m/s | Right-wall plate velocity |
| `vx_plate_cm_yr`, `vx_plate_right_cm_yr` | float | — | cm/yr | Readable alternatives; converted to m/s by the loader and taking precedence over the m/s keys |

## `[twophase]`

McKenzie two-phase flow — porous melt migration through a compacting viscous
matrix. Three-field $(u_s, p_f, p_c)$ solve plus marker porosity transport;
see [Two-phase flow](../physics/two_phase.md), `doc/design/two_phase_flow.md`
and `src/physics/TwoPhase.jl`.

| Key | Type | Default | Units | Meaning |
|---|---|---|---|---|
| `do_two_phase` | bool | false | — | Enable the 3-field two-phase solve |
| `k0` | float | 1e-12 | m² | Reference permeability at φ₀: $k_\phi = k_0\,((\phi+\phi_{\min})/\phi_0)^{n}$ |
| `phi0` | float | 0.01 | — | Reference porosity |
| `n_perm` | float | 3.0 | — | Permeability exponent n |
| `mu_fluid` | float | 1.0 | Pa·s | Melt viscosity μ_f |
| `rho_fluid` | float | 2800.0 | kg/m³ | Melt density (mixture buoyancy $\bar\rho = (1-\phi)\rho_s + \phi\rho_f$) |
| `alpha_phi` | float | 27.0 | — | Matrix melt-weakening exponent: $\eta_\phi = \eta_s e^{-\alpha_\phi \phi}$ (Mei et al. 2002) |
| `phi_min` | float | 1e-4 | — | Regularization porosity for the φ → 0 limit (recovers single-phase Stokes, enforced by `test/smoke/test_twophase.jl`) |
| `phi_max` | float | 0.5 | — | Cap on marker porosity |
| `pf_surface0` | bool | false | — | Homogeneous Dirichlet $p_f = 0$ on the surface (melt escapes freely) |
| `phi_init` | float | 0.0 | — | Uniform initial marker porosity |

## `[[rock]]` — material parameters

One entry per rock type; rocks are referenced by 1-based index from
`[[layer]]`, `[[phase]]`, `[[melt]]`, and `air_rock_id`. Each key also
accepts the legacy I3ELVIS shorthand (table at the end); canonical names win
when both are present.

### Viscous creep

| Key | Default | Units | Meaning |
|---|---|---|---|
| `eta0` | 1e22 | Pa·s | Pre-exponential viscosity for the Arrhenius path: $\eta = \eta_0 \exp\!\big((Q + V P)/(nRT)\big)$, n = 1 diffusion-like, n > 1 dislocation |
| `activation_energy` | 0.0 | J/mol | Q |
| `activation_volume` | 0.0 | J/(mol·bar) | V (note the bar-based convention on the `eta0` path — see `src/materials/Rheology.jl`) |
| `stress_exponent` | 1.0 | — | n |
| `ref_yield_stress` | 0.0 | Pa | $\sigma_{\rm ref}$ for the smooth power-law blend $\eta = \eta_{\rm diff}/(1+x)$, $x = (2\eta\,\dot\varepsilon_{II}/\sigma_{\rm ref})^{1-1/n}$ |
| `disl_prof` | `""` | — | Named dislocation-creep law from the catalog in `src/materials/FlowLaws.jl` (e.g. `"Dry_Olivine-Ranalli_1995"`, `"Dry_Olivine_disl-Hirth_Kohlstedt_2003"`, `"Wet_Olivine_disl-Hirth_Kohlstedt_2003"`, `"Dry_Eclogite-Jin_2001"`, `"Dry_Maryland_Diabase-Mackwell_1998"`); overrides `creep_A`, `activation_energy`, `activation_volume`, `stress_exponent` |
| `creep_A` | 0.0 | MPa⁻ⁿ s⁻¹ | Explicit dislocation-creep pre-exponential, $\dot\varepsilon_{II} = A\,\sigma_{II}^n \exp(-(E+PV)/RT)$; > 0 switches from the `eta0` path to `dislocation_viscosity` |

### Diffusion creep (grain-size-sensitive)

$\dot\varepsilon_{II} = A\,\sigma_{II}\, d^{-m} \exp(-(E + PV)/RT)$, lab
convention A in MPa⁻¹ µm^m s⁻¹ (Hirth & Kohlstedt 2003); acts **in parallel**
with dislocation creep (compliances add). `diff_A = 0` (default) disables the
mechanism. See [Grain-size evolution](../physics/grain_size.md).

| Key | Default | Units | Meaning |
|---|---|---|---|
| `diff_prof` | `""` | — | Named diffusion-creep law (`"Dry_Olivine_diff-Hirth_Kohlstedt_2003"`, `"Wet_Olivine_diff-Hirth_Kohlstedt_2003"`); overrides the explicit keys below |
| `diff_A` | 0.0 | MPa⁻¹ µm^m s⁻¹ | Pre-exponential |
| `diff_m` | 3.0 | — | Grain-size exponent m |
| `diff_E` | 375e3 | J/mol | Activation energy |
| `diff_V` | 6e-6 | m³/mol | Activation volume |

### Plastic yield (Drucker–Prager + strain weakening)

$\tau_y = \min\!\big(C(\varepsilon_p) + \sin\varphi(\varepsilon_p)\,P,\; \sigma_{y,\max}\big)$,
with C and sin φ ramping linearly over accumulated
plastic strain $\varepsilon_p \in [\varepsilon_0, \varepsilon_f]$.

| Key | Default | Units | Meaning |
|---|---|---|---|
| `cohesion_init`, `cohesion_weak` | 0.0 | Pa | C₀, C_f |
| `friction_init`, `friction_weak` | 0.0 | — | sin φ₀, sin φ_f |
| `strain_thresh_init`, `strain_thresh_weak` | 0.0, 0.1 | — | ε₀, ε_f bracketing the weakening ramp |
| `yield_stress_max` | 5.0e8 | Pa | Absolute Drucker–Prager yield cap (Kaus 2010, Glerum et al. 2018); prevents unbounded plastic stress at depth. ≤ 0 disables |

### Viscous softening & healing

See [Softening & healing](../physics/softening.md) and
`doc/design/softening_healing.md`.

| Key | Default | Units | Meaning |
|---|---|---|---|
| `visc_soft_factor` | 1.0 | — | Viscous strain softening (fabric/CPO): the aggregate viscous viscosity ramps 1 → factor over [`strain_thresh_init`, `strain_thresh_weak`]; 1.0 = off |
| `heal_tau0` | 0.0 | s | Healing (annealing) time at `heal_Tref`: $\varepsilon_p \leftarrow \varepsilon_p\, e^{-\Delta t/\tau(T)}$ with $\tau = \tau_0 \exp\!\big(\tfrac{E_h}{R}(\tfrac1T - \tfrac1{T_{\rm ref}})\big)$; 0 = no healing |
| `heal_E` | 3e5 | J/mol | Healing activation energy |
| `heal_Tref` | 1000.0 | K | Healing reference temperature |

### Grain-size evolution

Austin–Evans (2007) paleowattmeter, integrated per marker
(`update_grain_size`, `src/materials/GrainSize.jl`):
$\dot d = \frac{G_0}{p\,d^{\,p-1}}e^{-(E_g+PV_g)/RT} - \frac{\lambda}{c\,\gamma}\, d^2\, \Psi_{\rm disl}$.
`grain_G0 = 0` (default) freezes the grain size.

| Key | Default | Units | Meaning |
|---|---|---|---|
| `grain_G0` | 0.0 | m^p/s | Normal-growth prefactor |
| `grain_p` | 3.0 | — | Growth exponent |
| `grain_Eg` | 350e3 | J/mol | Growth activation energy |
| `grain_Vg` | 8e-6 | m³/mol | Growth activation volume |
| `grain_lambda` | 0.1 | — | Fraction of dislocation work stored as grain-boundary surface energy |
| `grain_gamma` | 1.0 | J/m² | Grain-boundary energy |
| `grain_c` | 9.4248 (3π) | — | Geometric constant |
| `grain_init` | 1e-3 | m | Initial marker grain size (constant unless `grain_G0 > 0`) |
| `grain_size_mm` | — | mm | Alias for `grain_init` in millimetres (error if both are given and differ) |

### Density, thermal, elastic, misc

| Key | Default | Units | Meaning |
|---|---|---|---|
| `reference_density` | 3300.0 | kg/m³ | ρ₀ |
| `thermal_expansion` | 3e-5 | 1/K | α |
| `compressibility` | 0.0 | 1/Pa | β |
| `specific_heat` | 1000.0 | J/kg/K | c_p |
| `thermal_conductivity` | 3.0 | W/m/K | $k_0$: constant $k$, or $k$ at 298 K and $P = 0$ when the next keys are set |
| `k_T_exponent` | 0.0 | — | $n$ in $k = k_0\,(298/T)^n\,(1 + aP) + w\,k_{\rm rad}(T)$ (Xu et al. 2004 form; see [Heat transport](../physics/heat.md#Thermal-conductivity)) |
| `k_P_coeff` | 0.0 | 1/Pa | $a$ (lithostatic $P$) |
| `k_radiative` | 0.0 | — | $w$: weight of the Hofmeister (1999) radiative term; 1 = on |
| `radiogenic_heating` | 0.0 | W/m³ | h_r |
| `shear_modulus` | 0.0 | Pa | G — Maxwell visco-elasticity; 0 = pure visco-plastic |
| `immobile` | false | — | Marker never advects (sticky-air anchor) |
| `eta_min`, `eta_max` | 1e17, 1e26 | Pa·s | Per-rock viscosity clamps |

### Volatile species keys

The loader also accepts per-species volatile parameters
(`sulfur_*`, `graphite_*`, `carbonatite_*`, `water_*`, each with
`_capacity` (wt%), `_release_T` (K), `_release_frac` (per step),
`_solidus_drop` (K); legacy `volatile_*` keys map to carbonatite). The
volatile transport module is part of a separate study and is disabled in
this release (`do_volatile = false`).

## `[[phase]]` — phase transitions

Applied per marker by `apply_phase_change!` (`src/materials/PhaseChange.jl`)
when `do_phase_change = true`.

| Key | Default | Units | Meaning |
|---|---|---|---|
| `rock_from` | (required) | — | Rock id the transition applies to |
| `rock_to` | (required) | — | Rock id after crossing (same id → only Δρ + latent) |
| `transition` | 1 | — | 1 = Clapeyron P–T line; 2 = depth-triggered; 3 = divariant rate-limited eclogitization |
| `T_ref` | 0.0 | K | Reference point on the transition line |
| `P_ref` | 0.0 | Pa | Reference pressure. **Mode 2 reinterprets `P_ref` as the trigger depth in metres** (a marker crosses when y > `P_ref`) |
| `clapeyron` | 0.0 | K/Pa (mode 1); Pa/K (mode 3) | Mode 1: $T_{\rm locus}(P) = T_{\rm ref} + c\,(P - P_{\rm ref})$, positive = exothermic. Mode 3: $P_c(T) = P_{\rm ref} + c\,(T - T_{\rm ref})$ |
| `drho` | 0.0 | kg/m³ | Density jump across the transition (accumulated on the marker `phase_drho`) |
| `latent` | 0.0 | J/kg | Latent heat (positive = endothermic, absorbed) |
| `band_width` | 0.0 | Pa | Mode 3: divariant band width — $X_{\rm eq} = \mathrm{clamp}\big((P - P_c)/\Delta P + \tfrac12, 0, 1\big)$ |
| `react_tau_ref` | 0.0 | s | Mode 3: reaction time at `react_Tref`; 0 = instantaneous equilibrium |
| `react_Q` | 0.0 | J/mol | Mode 3: reaction activation energy (Arrhenius τ) |
| `react_Tref` | 973.15 | K | Mode 3: reference T for `react_tau_ref` |
| `weaken_decades` | 0.0 | — | Mode 3: reaction softening $\eta \leftarrow \eta\, 10^{-w X}$ with X the reaction progress |

See [Phase changes](../physics/phase_changes.md).

## `[[melt]]` — melting laws (Katz lite)

Linear melt fraction between a quadratic-in-P solidus and liquidus
(`melt_fraction`, `apply_melting!` in `src/materials/Melting.jl`); enabled by
`do_melting = true`.

| Key | Default | Units | Meaning |
|---|---|---|---|
| `rock_id` | (required) | — | Rock the law applies to |
| `T_sol0` | 1373.0 | K | Solidus at P = 0: $T_{\rm sol}(P) = T_{\rm sol,0} + a_{\rm sol} P + b_{\rm sol} P^2$ (P in Pa) |
| `a_sol`, `b_sol` | 0.0 | K/Pa, K/Pa² | Solidus pressure coefficients |
| `T_liq0` | 1973.0 | K | Liquidus at P = 0 |
| `a_liq`, `b_liq` | 0.0 | K/Pa, K/Pa² | Liquidus pressure coefficients |
| `extract_threshold` | 0.05 | — | F above which melt is extracted and the marker switches rock type |
| `density_melt` | 2800.0 | kg/m³ | Melt density for the two-phase ρ mixture |
| `latent` | `L_MELT` (4e5) | J/kg | Latent heat of fusion |
| `nu_factor` | 25.0 | — | Melt weakening: $\eta \leftarrow \eta\, e^{-\nu F}$ (Mei et al. 2002) |
| `rock_after_extract` | `rock_id` | — | Depleted-residue rock id after extraction |

With `do_two_phase = true`, a melt-fraction increase becomes marker porosity
(percolating melt) instead of instant extraction (`melt_to_porosity!`). See
[Melting](../physics/melting.md).

## `[[layer]]` — initial geometry (data-driven)

The initial rock-type field is built from `[[layer]]` entries
(`rock_type_from_layers`, `src/initialization/Geometry.jl`) whenever the list
is non-empty; later layers override earlier ones at overlapping points.

| Key | Default | Units | Meaning |
|---|---|---|---|
| `name` | `"unnamed"` | — | Label (diagnostics only) |
| `rock_id` | (required) | — | 1-based index into `[[rock]]` |
| `shape` | `"background"` | — | `background` \| `rectangle` \| `polygon` \| `bent_band` |
| `x_min`, `x_max`, `y_min`, `y_max` | ±Inf | m | Bounds for `rectangle` |
| `vertices` | `[]` | m | List of `[x, y]` pairs: closed polygon (`polygon`) or polyline (`bent_band`) |
| `thickness` | 0.0 | m | `bent_band`: band of this normal thickness extending downward from the polyline |

## `[[init_T]]` — initial temperature regions (data-driven)

Used by `initial_T_from_regions` (`src/initialization/Temperature.jl`); same
shape vocabulary and later-overrides-earlier semantics as `[[layer]]`.

| Key | Default | Units | Meaning |
|---|---|---|---|
| `name` | `"unnamed"` | — | Label |
| `shape` | `"background"` | — | `background` \| `rectangle` \| `polygon` \| `bent_band` |
| `profile` | `"constant"` | — | `constant` \| `linear` \| `hsc` \| `hsc_adiabat` \| `steady_lid` \| `gaussian` |
| `x_min`, `x_max`, `y_min`, `y_max` | ±Inf | m | Region bounds (rectangle) |
| `vertices` | `[]` | m | Polygon / polyline vertices |
| `thickness` | 0.0 | m | `bent_band` thickness |
| `T_value` | 0.0 | K | `constant`: T everywhere in the region |
| `T_top`, `T_bot` | 273.0, 1623.0 | K | `linear`: $T = T_{\rm top} + (T_{\rm bot} - T_{\rm top})\, y_{\rm local}/Y$ |
| `T_surf`, `T_mantle` | 273.0, 1593.0 | K | `hsc` half-space cooling: $T = T_s + (T_m - T_s)\,\mathrm{erf}\!\big(y_{\rm local}/2\sqrt{\kappa t}\big)$ |
| `plate_age_yr` | 50e6 | yr | `hsc` cooling age t |
| `kappa` | 1e-6 | m²/s | `hsc` thermal diffusivity |
| `xc`, `yc` | 0.0 | m | `gaussian` anomaly centre |
| `r0` | 100e3 | m | `gaussian` radius |
| `dT` | 0.0 | K | `gaussian` amplitude: $T = T_{\rm base} + \Delta T\, e^{-r^2/r_0^2}$ |
| `T_base` | 1593.0 | K | `gaussian` background T |
| — | | | `hsc_adiabat`: as `hsc`, but cooling toward the adiabat $T_{\rm ad}(y) = T_{\rm mantle}\,e^{\alpha_r g y / c_p}$ ($\alpha_r$, $c_p$ = `ref_alpha`, `ref_cp`) |
| `q_mantle` | 0.0 | W/m² | `steady_lid`: heat flux into the lid base (uniform). 0 = fit it to `T_ref` |
| `T_ref`, `x_ref`, `y_ref` | 0.0 | K, m, m | `steady_lid`: fit `q_mantle` so that $T(x_{\rm ref}, y_{\rm ref}) = T_{\rm ref}$; an error if `T_ref` is below the lowest steady value (set by the heat made in the lid) |
| `column_x` | NaN | m | `steady_lid`: use the column at this x everywhere (unset = each x its own column) |
| `exclude_layers` | `[]` | — | `steady_lid`: `[[layer]]` names left out of the columns (rocks are taken from the layers below them) |

**`steady_lid`** is a conductive lid in thermal equilibrium on the adiabat:
in each column $dT/dy = q(y)/k(T,P)$ with
$q(y) = q_m + \int_y^{y_L} H\,dy'$, from `T_surf` at $y = 0$ down to the
depth $y_L$ where $T$ meets $T_{\rm ad}(y)$, and $T_{\rm ad}$ below. $k$ and
$H$ are the model's own per-rock values (`k_T_exponent`, `k_P_coeff`,
`k_radiative`, `radiogenic_heating` if `do_radiogenic`) with rocks from the
`[[layer]]` geometry, so the lid starts in steady state up to discretisation
and lateral-conduction error. The adiabat uses `T_mantle`, `ref_alpha`,
`ref_cp`; set `T_bot` on the same adiabat. With `column_x`, a thicker layer
elsewhere sits on the equilibrium geotherm of the reference column (for
example young crust emplaced on an old lid); `exclude_layers` builds that
geotherm as if the named layers were absent. The fitted `q_mantle` and the
lid base are written to the log.

`y_local` is depth within the region (depends on shape — see the header of
`src/initialization/Temperature.jl`).

## Legacy / shorthand rock keys

Accepted for backwards compatibility; canonical names win when both appear.

| Canonical | Legacy | Canonical | Legacy |
|---|---|---|---|
| `eta0` | `nu0` | `eta_min` / `eta_max` | `nu_min` / `nu_max` |
| `activation_energy` | `dh` | `reference_density` | `ro0` |
| `activation_volume` | `dv` | `thermal_expansion` | `alpha` |
| `ref_yield_stress` | `ss` | `compressibility` | `beta` |
| `stress_exponent` | `mm` | `specific_heat` | `cp` |
| `cohesion_init` / `cohesion_weak` | `a0` / `a1` | `thermal_conductivity` | `kt` |
| `friction_init` / `friction_weak` | `b0` / `b1` | `radiogenic_heating` | `ht` |
| `strain_thresh_init` / `strain_thresh_weak` | `e0` / `e1` | `shear_modulus` | `G` |

## Minimal example

```toml
[mesh]
xsize = 1_000_000.0
ysize = 1_000_000.0
nx    = 81
ny    = 81

[physics]
do_heat = false

[[rock]]
eta0 = 1e21
reference_density = 3300.0

[[layer]]
rock_id = 1
shape   = "background"
```

Everything else inherits from `cases/_defaults.toml`. For complete worked
examples see the [examples by tectonic regime](../getting_started.md#examples-by-tectonic-regime)
and the case files under `cases/`; for the function-level API see
the [function reference](./functions.md).
