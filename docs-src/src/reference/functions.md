# Function reference

MILET is a flat-include research code: `main.jl` includes every file under
`src/` in dependency order, so all functions live in one namespace. This page
lists the public entry points grouped by module. Signatures are abbreviated
(keyword arguments with defaults omitted unless load-bearing); follow the
file paths for the full definitions and derivations in the header comments.

Conventions: `cfg::Config` is the parsed parameter file
([reference](./parameter_file.md)), `mb::MeshBundle` the mesh + measures,
`fes::FESpaceBundle` the FE spaces, `state::State` the live solution,
`mk::Markers` the particle cloud.

## Core — `src/core/`

| Function | Purpose | File |
|---|---|---|
| `build_model(cfg; quad_order)` | Build the Cartesian (or chunk) `DiscreteModel`, tag walls (`surface`, `deep`, `left`, `right`, `front`, `back`), return the `MeshBundle` | `src/core/Mesh.jl` |
| `tag_box_walls!(model, dim, domain)` | Attach the physical wall tags to a box model (y-down convention: `surface` = low-y face) | `src/core/Mesh.jl` |
| `rebuild_mesh_bundle(model_new, dim, nel_base, domain, ...)` | Re-wrap an adapted/deformed model into a fresh `MeshBundle` (AMR / ALE path) | `src/core/Mesh.jl` |
| `velocity_dirichlet_tags(cfg)` | Wall tags carrying strong velocity Dirichlet BCs — shared between `build_spaces` and the GMG hierarchy so coarse levels constrain identically | `src/core/FESpaces.jl` |
| `build_spaces(mb, cfg)` | Build the Taylor–Hood Q2/Q1 Stokes spaces + Q1 temperature/composition spaces; returns `FESpaceBundle` | `src/core/FESpaces.jl` |
| `State(mb, fes, cfg; T_init)` | Construct the mutable solution container: FE functions (`uh`, `ph`, `Th`, …) + per-cell rheology arrays (`eta_c`, `rho_c`, `eii_c`, `sii_c`, `yield_frac_c`, …) | `src/core/State.jl` |
| `as_cellfield(values, Ω)` | Lift a per-cell `Vector{Float64}` to a piecewise-constant `CellField` for assembly | `src/core/State.jl` |

## Boundary conditions — `src/boundary_conditions/`

| Function | Purpose | File |
|---|---|---|
| `bc_left(cfg)`, `bc_right(cfg)` | Wall velocity closures `x -> VectorValue`; inject `vx_plate` / `vx_plate_right` inside the plate-depth windows for the subduction case | `src/boundary_conditions/Velocity.jl` |
| `bc_surface(cfg)`, `bc_deep(cfg)`, `bc_zwall(cfg)` | Surface / deep / z-wall velocity closures (deep wall returns the mass-conserving outflow profile) | `src/boundary_conditions/Velocity.jl` |
| `bc_T_surface(cfg)`, `bc_T_deep(cfg)` | Dirichlet temperature closures returning `T_top` / `T_bot` | `src/boundary_conditions/Temperature.jl` |

## Materials — `src/materials/`

| Function | Purpose | File |
|---|---|---|
| `lookup_flow_law(name)` | Resolve a named dislocation-creep law (Ranalli 1995 / Hirth & Kohlstedt 2003 catalog, `disl_prof` key) to its `CreepLaw` (A, n, E, V) | `src/materials/FlowLaws.jl` |
| `lookup_diff_creep_law(name)` | Resolve a named diffusion-creep law (`diff_prof` key) to its `DiffCreepLaw` (A, m, E, V) | `src/materials/FlowLaws.jl` |
| `dislocation_viscosity(A, n, E, V, T, P_Pa, eii)` | $\eta = 10^6 \tfrac12 A^{-1/n}\, \dot\varepsilon_{II}^{(1-n)/n} \exp\!\big(\tfrac{E+PV}{nRT}\big)$ Pa·s | `src/materials/FlowLaws.jl` |
| `diffusion_viscosity(A, m, E, V, T, P_Pa, d)` | $\eta = 10^6\, (d\cdot10^6)^m / (2A)\, \exp\!\big(\tfrac{E+PV}{RT}\big)$ Pa·s, grain size d in metres | `src/materials/FlowLaws.jl` |
| `compute_viscosity(T, P_bar, eii, strain, rk, eta_min, eta_max; ...)` | Pointwise visco-plastic effective viscosity: composite diffusion + dislocation creep, viscous softening, Drucker–Prager yield with strain weakening and `yield_stress_max` cap, melt weakening, clamps | `src/materials/Rheology.jl` |
| `compute_VEP_viscosity(T, P_bar, eii, strain, rk, eta_min, eta_max, dt; ...)` | Visco-elasto-plastic wrapper: returns `(η_VEP, Z, χ, yielded)` with Maxwell factor $Z = G\Delta t/(\eta_{VP} + G\Delta t)$ and elastic-memory weight χ = 1 − Z | `src/materials/Rheology.jl` |
| `viscous_mechanism_partition(T, P_bar, eii, rk; grain_size)` | Split the viscous deformation into diffusion/dislocation shares at common stress; returns `(η_visc, η_diff, η_disl, ε̇_diff, ε̇_disl, Ψ_disl)` — feeds the grain-size wattmeter | `src/materials/Rheology.jl` |
| `compute_density(T, P_bar, rk; phase_drho, F_melt, rho_melt, depletion)` | Boussinesq density $\rho_0(1-\alpha\Delta T)(1+\beta\Delta P)$ + phase-change Δρ + melt mixture | `src/materials/Density.jl` |
| `apply_phase_change!(rtype, drho, x, y, T, P_bar, phases, dt)` | Per-marker phase transitions: Clapeyron (mode 1), depth-trigger (mode 2), rate-limited divariant eclogitization (mode 3); returns latent heat | `src/materials/PhaseChange.jl` |
| `melt_fraction(T, P_bar, mp; T_sol_offset)` | Katz-lite melt fraction, linear between solidus and liquidus | `src/materials/Melting.jl` |
| `apply_melting!(rtype, F_melt, ...)` | Per-marker melting + extraction above `extract_threshold`; returns the latent-heat contribution | `src/materials/Melting.jl` |
| `grain_growth_coeff(rk, T, P_Pa)` | Growth-rate coefficient $K = G_0 \exp(-(E_g + P V_g)/RT)$ | `src/materials/GrainSize.jl` |
| `grain_size_steady_state(rk, T, P_Pa, Ψ_disl)` | Closed-form wattmeter fixed point $d_{ss} = (c\gamma K/(p\lambda\Psi))^{1/(p+1)}$ (Austin & Evans 2007) | `src/materials/GrainSize.jl` |
| `update_grain_size(d_old, T, P_Pa, Ψ_disl, dt, rk; ...)` | Advance one marker's grain size with exact operator-split sub-flows (closed-form growth + reduction) | `src/materials/GrainSize.jl` |

## Particles — `src/particles/`

| Function | Purpose | File |
|---|---|---|
| `Markers(cap)` | Allocate the Struct-of-Arrays marker container (position, T, rock type, strain, melt F, stresses, grain size, porosity) | `src/particles/Particles.jl` |
| `ensure_capacity!(mk, needed)` | Grow all marker arrays to at least `needed` | `src/particles/Particles.jl` |
| `locate_cartesian(x, y, z, mb)` | O(1) host-cell location on the uniform Cartesian mesh; returns `(i, j, k, ξ, η, ζ)` | `src/particles/Advection.jl` |
| `cart_to_linear(i, j, k, mb)` | Cartesian → linear cell index | `src/particles/Advection.jl` |
| `eval_velocity(uh, x, y, z, mb; ...)` | Velocity at an arbitrary point (fast Cartesian path or Gridap evaluate fallback) | `src/particles/Advection.jl` |
| `advect_markers!(mk, uh, mb, dt, cfg)` | RK4 marker advection through the FE velocity field (immobile rocks skipped) | `src/particles/Advection.jl` |
| `snapshot_q2_vec(uh, mb)` / `snapshot_q1_scalar(Th, mb)` | Snapshot Q2-vector / Q1-scalar DOFs per cell for direct evaluation (bypasses Gridap `evaluate` in marker loops); `_3d` variants for 3D | `src/particles/CartEval.jl` |
| `eval_q2_vec(snap, x, y)` / `eval_q2_gradu(snap, x, y)` / `eval_q1_scalar(snap, x, y)` | Direct shape-function evaluation of velocity / velocity gradient / scalar on the snapshots (2D; `_3d` variants exist) | `src/particles/CartEval.jl` |
| `project_markers_to_cells!(state, mk, mb, rocks, cfg; dt)` | The forward projection: marker properties → per-cell η, ρ, c_p, k, H, χ, σ_old, yield fraction, via host-cell binning or bilinear stencils (`projection_mode`) | `src/particles/Projection.jl` |
| `project_marker_T_to_cells(mk, mb)` | Binned arithmetic mean of marker temperature per cell | `src/particles/Projection.jl` |
| `update_marker_temperatures!(mk, Th, mb; ...)` | Backward projection: grid T → markers (`overwrite` or `pic_increment` mode) | `src/particles/Projection.jl` |
| `apply_subgrid_diffusion!(mk, Th_old, state, mb, cfg, dt)` | Subgrid-scale marker–grid T relaxation (Gerya & Yuen 2003), strength `subgrid_d`; returns the per-marker change, which the Driver grids and subtracts from the grid increment | `src/particles/Projection.jl` |
| `update_marker_strain!(mk, state, mb, cfg, dt)` | Accumulate plastic strain $\Delta\varepsilon_p = \Delta t\,\dot\varepsilon_{II}\cdot f_{\rm yield}$ (gated by `strain_gate_plastic`) after Arrhenius healing decay (`heal_*` keys) | `src/particles/Projection.jl` |
| `locate_cell_general(pt, mb)` | Gridap point location on adapted (AMR/ALE) meshes | `src/particles/Projection.jl` |
| `reseed_markers!(mk, Th, mb, cfg; min_per_cell)` | Repopulate under-populated cells; new markers inherit majority rock type and donor-marker history (strain, grain size, stresses) | `src/particles/Reseed.jl` |

## Initialization — `src/initialization/`

| Function | Purpose | File |
|---|---|---|
| `init_markers!(mk, cfg, mb, rock_type_fn, initial_T_fn)` | Seed the jittered marker cloud and sample rock type + T from the case closures (with slab pre-weakening for subduction) | `src/initialization/Markers.jl` |
| `rock_type_from_layers(x, y, cfg)` | Data-driven initial geometry from `[[layer]]` entries (background / rectangle / polygon / bent_band; later overrides earlier) | `src/initialization/Geometry.jl` |
| `rock_type_subduction(x, y, cfg)`, `rock_type_subduction_init`, `rock_type_extension`, `rock_type_falling_block`, `rock_type_plume`, `rock_type_solcx`, `rock_type_vankeken`, `rock_type_vankeken_smooth`, `rock_type_rt3`, … | Hard-coded case geometries selected by `select_case` | `src/initialization/Geometry.jl` |
| `initial_T_from_regions(x, y, cfg)` | Data-driven initial temperature from `[[init_T]]` regions (constant / linear / hsc / gaussian profiles) | `src/initialization/Temperature.jl` |
| `hsc_temperature(y_m, age_yr, T_surf, T_mantle; kappa)` | Half-space-cooling geotherm $T = T_s + (T_m - T_s)\,\mathrm{erf}(y/2\sqrt{\kappa t})$ | `src/initialization/Temperature.jl` |
| `initial_temperature_subduction`, `initial_temperature_plume`, `initial_temperature_blankenbach`, `initial_temperature_isothermal`, `initial_temperature_chunk`, `initial_temperature_plume3`, `initial_temperature_busse`, … | Per-case initial T closures | `src/initialization/Temperature.jl` |

## Physics — `src/physics/`

| Function | Purpose | File |
|---|---|---|
| `gravity_fn(cfg)` | Position → gravity vector closure (`vertical_const` or `radial`) | `src/physics/Gravity.jl` |
| `buoyancy_cellfield(state, mb, cfg)` | Per-cell buoyancy ρg CellField (perturbation $(\rho-\bar\rho)g$ unless `body_force_full`; `buoyancy_from_T` branch for nondimensional benchmarks) | `src/physics/Gravity.jl` |
| `build_stokes_forms(η_cell, ρg, dΩ; σ_old, χ_cell, free_slip_bcs, traction_bcs, ρ_adi_cell)` | Bilinear + linear forms of the mixed Stokes problem incl. VEP elastic memory, free-slip penalty, tractions, ALA continuity | `src/physics/Stokes.jl` |
| `assemble_stokes(fes, η_cell, ρg, dΩ; ...)` | Assemble the `AffineFEOperator` for the saddle-point system | `src/physics/Stokes.jl` |
| `build_free_slip_bcs(mb, cfg, η_cell)` / `build_traction_bcs(mb, cfg)` | Per-wall penalty / Neumann BC lists from the `bc_*` config keys | `src/physics/Stokes.jl` |
| `build_sigma_old_cellfield(state, mb)` | Previous-step deviatoric stress as a tensor CellField (elastic source term) | `src/physics/Stokes.jl` |
| `recover_invariants!(state, mb, fes, cfg)` | Post-solve recovery of per-cell $\dot\varepsilon_{II}$ and $\sigma_{II}$ from `uh` | `src/physics/Stokes.jl` |
| `update_marker_stresses!(mk, state, mb, cfg, dt)` | VEP marker stress update + Jaumann rotation (2D; `_update_marker_stresses_3d!` in 3D) | `src/physics/Stokes.jl` |
| `build_heat_source(state, mb, cfg, H_marker_c, ρcp_cell, η_cell, εII_cell)` | Aggregate volumetric heat source: radiogenic + constant + user `H_fn` + marker latent + shear ($4\eta\dot\varepsilon_{II}^2$) + adiabatic | `src/physics/HeatSources.jl` |
| `build_heat_forms(ρcp_cell, kt_cell, T_old, H_cell, uh, dt, dΩ; with_advection, h_cell)` | Backward-Euler heat forms; optional SUPG-stabilised FE advection (Codina τ) | `src/physics/Heat.jl` |
| `assemble_heat(fes, ...; flux_bcs, robin_bcs)` | Assemble the heat operator including flux / Robin boundary terms | `src/physics/Heat.jl` |
| `build_heat_flux_bcs(mb, cfg)` | Flux + Robin BC lists from the `bcT_*` config keys | `src/physics/Heat.jl` |
| `entropy_viscosity(state, mb, cfg, dt; c_max, c_E)` | Residual-driven artificial diffusivity per cell (Guermond–Pasquetti–Popov 2011) for `heat_stabilisation = "entropy"` | `src/physics/EntropyViscosity.jl` |
| `check_sticky_air_thickness(cfg, mb)` | Warn when the sticky-air layer is under ~4 cells (Crameri et al. 2012) | `src/physics/FreeSurface.jl` |
| `smooth_air_interface!(mk, mb, cfg, ...)` | 1-D Laplacian smoothing of the air–rock interface (drunken-sailor suppression) | `src/physics/FreeSurface.jl` |
| `update_surface_height(h, vy_top, dt, cfg, ...)` | Explicit ALE surface kinematics with Kaus 2010 implicit stabilisation (`fs_stabilisation`) | `src/physics/ALEFreeSurface.jl` |
| `build_mapped_model(cfg, h)` / `rebuild_mb_with_ale(cfg, new_model; ...)` | Vertical-stretch mesh mapping $y = Y - h(X)(1 - Y/y_{\rm size})$ and bundle rebuild | `src/physics/ALEFreeSurface.jl` |
| `reference_state(cfg)`, `ref_rho(rs, y)`, `ref_T(rs, y)`, `dissipation_number(rs, H)` | TALA adiabatic reference state $\bar\rho(y)$, $\bar T(y)$ and $Di$ ([Compressibility](../physics/compressibility.md)) | `src/physics/ReferenceState.jl` |
| `marker_density(T, P, rock, y, cfg)`, `heat_density(cfg, state, c)` | Marker density (Boussinesq EOS or about the TALA reference state); $\rho$ in the energy equation | `src/physics/ReferenceState.jl` |
| `marker_conductivity(T, P, rock)`, `radiative_conductivity(T)` | $k(T,P)$ of Xu et al. (2004) plus the Hofmeister (1999) radiative term | `src/materials/Density.jl` |
| `SteadyLid(region, cfg)`, `build_steady_lids(cfg)` | Steady conductive lid on the adiabat for `[[init_T]]` profile `steady_lid` | `src/initialization/Temperature.jl` |
| `adiabatic_density_profile(ρ_surface, g, H)` / `adiabatic_temperature_profile(...)` | Old closed-form ALA profiles; no longer used by the solver | `src/physics/Compressibility.jl` |
| `function_heating(H_fn, state, mb)` / `compositional_heating(...)` / `anisotropic_shear_heating(state, mb, cfg)` | Optional extra heat sources (user closure, per-composition, fabric-aligned) | `src/physics/AdvancedHeating.jl` |
| `build_composition_forms(C_old, uh, dt, dΩ; ...)` / `assemble_composition(...)` | Advection–diffusion of the optional FE composition field | `src/physics/Composition.jl` |

### Two-phase flow — `src/physics/TwoPhase.jl`

| Function | Purpose |
|---|---|
| `permeability(φ, tp)` / `inv_compaction_viscosity(η, φ, tp)` / `melt_weakened_viscosity(η, φ, tp)` / `compaction_length(η, φ, tp)` | Constitutive closures $k_\phi$, $1/\zeta_\phi$, $\eta_\phi$, $\delta = \sqrt{k_\phi \zeta_\phi/\mu}$ |
| `build_twophase_forms(η_cell, ρg_mix, kμ_cell, invζ_cell, g_f, dΩ; ...)` | Weak forms of the 3-field $(u_s, p_f, p_c)$ McKenzie system |
| `build_twophase_spaces(mb, fes, cfg; pf_surface0)` | MultiField FE spaces (Q2 velocity + two Q1 pressures); optional $p_f = 0$ surface Dirichlet |
| `project_porosity_to_cells!(poro_c, mk, mb)` | Marker porosity → cell mean |
| `twophase_cell_fields(eta_c, poro_c, mb, tp)` | Build the η_φ, k/μ, 1/ζ CellFields from projected porosity |
| `twophase_buoyancy(rho_c, poro_c, mb, cfg, tp)` | Mixture buoyancy $\bar\rho = (1-\phi)\rho_s + \phi\rho_f$ |
| `solve_twophase!(cache, sp, mb, eta_c, rho_c, poro_c, cfg, tp; ...)` | Assemble + cached-MUMPS solve; returns `(uh, pfh, pch, kμ_c, invζ_c)` |
| `compaction_pressure_cells(pch, mb)` | Cell-mean compaction pressure from the solved $p_c$ |
| `melt_to_porosity!(mk, F_old, F_new, m, tp)` | Melting source: ΔF → Δφ on the marker |
| `update_marker_porosity!(mk, pc_c, invζ_c, mb, tp, dt)` | Operator-split porosity evolution $D\phi/Dt = -(1-\phi)\,p_c/\zeta_\phi$ |
| `max_melt_segregation_speed(pfh, poro_c, kμ_c, mb, tp, gy)` | Darcy segregation speed for the melt CFL limit |

## Solvers — `src/solvers/`

| Function | Purpose | File |
|---|---|---|
| `mumps_solve(K, b)` / `cached_mumps_solve!(cm, K, b)` | One-shot / pattern-cached MUMPS direct solve (numeric-only refactorization on reuse) | `src/solvers/Mumps.jl` |
| `finalize_mumps_contexts!()` | Release all live MUMPS factorizations before `MPI.Finalize` (called by `main.jl`) | `src/solvers/Mumps.jl` |
| `pressure_mass_matrix(fes, η_cell, dΩ)` / `lumped_inverse_pressure_mass(fes, η_cell, dΩ)` | η⁻¹-weighted pressure mass matrix and its lumped inverse — the Schur-complement preconditioner $S \approx M_p/\eta$ (Elman–Silvester–Wathen) | `src/solvers/Schur.jl` |
| `build_gmg_hierarchy(V_fine, mb, cfg; dirichlet_tags, max_levels, coarse_dof_target)` | Nested-coarsening hierarchy with geometric prolongations on the actual Q2 velocity space | `src/solvers/GMG.jl` |
| `gmg_setup(hier, A_fine; cheb_degree)` | Galerkin triple products $A_{\ell+1} = P_\ell^T A_\ell P_\ell$, Chebyshev smoother data, coarse LU | `src/solvers/GMG.jl` |
| `gmg_update!(s, A_fine)` | Refresh level matrices/smoothers for new values on the same pattern (per Picard iteration) | `src/solvers/GMG.jl` |
| `vcycle!(y, setup, b)` | One multigrid V-cycle (Chebyshev pre/post smoothing, exact coarse solve) | `src/solvers/GMG.jl` |
| `stokes_solver_cache!(state, mb, fes)` | Get-or-create the persistent `StokesSolverCache` (invalidated on mesh/DOF changes) | `src/solvers/BlockMG.jl` |
| `resolve_solver_type(cfg, ndof)` | Map `solver.type` (`auto` → gmg/mumps by DOF count; `vcycle` → gmg) to the concrete path | `src/solvers/BlockMG.jl` |
| `assemble_stokes_cached!(cache, fes, ...)` | In-place sparse reassembly preserving the symbolic pattern | `src/solvers/BlockMG.jl` |
| `fgmres!(x, K, b, precond!; tol, maxit, restart)` | Right-preconditioned flexible GMRES on the monolithic saddle-point system | `src/solvers/BlockMG.jl` |
| `solve_stokes_iterative!(cache, ...)` / `solve_stokes_direct!(cache, ...)` | The two production Stokes paths (FGMRES + block GMG / cached MUMPS) | `src/solvers/BlockMG.jl` |
| `petsc_options(cfg)` / `solve_petsc(op, cfg)` / `solve_stokes_with_amg(op, ...)` | PETSc KSP+PC paths driven by `solver.petsc_preset` | `src/solvers/PETScSolvers.jl` |
| `solve_bamgs(op, fes)` / `with_bamgs_context(f)` | PETSc fieldsplit + BoomerAMG variant | `src/solvers/BAMGS.jl` |
| `amr_indicator(state, mb, cfg; user_fn)` | Per-cell refinement indicator (`T_gradient`, `composition`, `strain_rate`, `viscosity`, `user`) | `src/solvers/AMR.jl` |
| `fixed_fraction_marks(ind, refine_frac)` | Boolean refinement marks for the top fraction of cells | `src/solvers/AMR.jl` |

## Time stepping — `src/time_stepping/`

| Function | Purpose | File |
|---|---|---|
| `run_case(cfg; rock_type_fn, initial_T_fn, rho_field_fn, eta_field_fn, amr_user_indicator)` | The top-level driver: build mesh/spaces/state/markers, then per step Stokes → CFL → heat → marker updates → advection → reseed → output → diagnostics → checkpoint. Returns `(state, mk, mb, fes)` | `src/time_stepping/Driver.jl` |
| `compute_dt(state, mb, cfg)` | Adaptive Δt from advection CFL, thermal-diffusion limit, and `maxtmstep` cap | `src/time_stepping/CFL.jl` |
| `picard_stokes!(state, mb, fes, mk, cfg, dt; rho_field_fn, eta_field_fn)` | Fixed-point nonlinear Stokes loop with cached reassembly/factorization; sets `state.last_picard_*` convergence telemetry | `src/time_stepping/PicardLoop.jl` |
| `newton_stokes!(state, mb, fes, mk, cfg, dt; ...)` | AD-Jacobian Newton alternative with Armijo line search (`nonlinear_method = "full_newton"`) | `src/time_stepping/NewtonLoop.jl` |
| `solve_heat_step!(state, mb, fes, cfg, dt, ...)` | One backward-Euler heat solve incl. sources, stabilisation, BCs, and the post-solve clamp (`_heat_clamp_bounds`) | `src/time_stepping/Driver.jl` |
| `solve_composition_step!(state, mb, fes, cfg, dt)` | One advection–diffusion step of the FE composition field | `src/time_stepping/Driver.jl` |
| `apply_marker_phase_and_melt!(mk, state, mb, cfg, dt, H_marker_latent)` | Per-marker phase change + melting pass; accumulates latent heat per cell and routes ΔF to porosity when two-phase is on | `src/time_stepping/Driver.jl` |
| `update_marker_grain_size!(mk, state, mb, cfg, dt)` | Threaded per-marker grain-size evolution using the local mechanism partition | `src/time_stepping/Driver.jl` |

## IO — `src/io/`

| Function | Purpose | File |
|---|---|---|
| `load_config_toml(path)` | Parse + deep-merge a case TOML onto `cases/_defaults.toml` and build the `Config` (see [Parameter file](./parameter_file.md)) | `src/io/TOMLLoader.jl` |
| `select_case(name; geometry)` | Map the case name to `(rock_type_fn, initial_T_fn, rho_field_fn, eta_field_fn)` closures | `src/io/TOMLLoader.jl` |
| `read_case_name(path)` | Read `[model] case` (falls back to the filename stem) | `src/io/TOMLLoader.jl` |
| `clone_config(cfg; overrides...)` | Copy a `Config` with keyword field overrides — the test/benchmark idiom | `src/io/TOMLLoader.jl` |
| `write_grid_vtu(state, mb, mk, step, time_yr, dir)` | FE solution + per-cell fields (η, ρ, $\dot\varepsilon_{II}$, $\sigma_{II}$, majority rock type, …) to `.vtu` | `src/io/VTK.jl` |
| `write_markers_vtu(mk, mb, step, time, dir; ...)` | Marker cloud snapshot (position, rock type, T, strain, grain size, porosity, …) | `src/io/VTK.jl` |
| `write_topography_vtu(mk, mb, cfg, step, time, dir)` | Air–rock interface as a topography polyline | `src/io/VTK.jl` |
| `save_pvd(steps, times_yr, fnames, dir; pvd_name)` | Maintain the ParaView `.pvd` collection (times in years; step-index fallback for degenerate times) | `src/io/PVD.jl` |
| `open_diagnostics(dir)` / `record_step!(log, state, mk, mb, cfg, step, time_s, dt)` / `close_diagnostics(log)` | Per-step `run.log` line + gated health checks (non-finite DOFs, velocity explosions, T-bound violations) every `diagnostics_every` steps | `src/io/Diagnostics.jl` |
| `nusselt(state, mb, fes, cfg)` | $\mathrm{Nu} = \langle \partial T/\partial y \rvert_{y=0}\rangle\, H/\Delta T$ (Blankenbach 1A reference 4.884) | `src/io/Diagnostics.jl` |
| `vrms(state, mb)` / `vrms_surface(state, mb)` / `surface_mobility(state, mb)` / `mean_temperature(state, mb)` | $V_{\rm rms} = \sqrt{\int u\cdot u\, d\Omega / \lvert\Omega\rvert}$ and the derived convection observables | `src/io/Diagnostics.jl` |
| `write_bench_csv(state, mb, fes, cfg, step, timesum, dir)` | Append `step, time, Nu, Vrms, Vsurf, mobility, mean_T` to `bench.csv` | `src/io/Diagnostics.jl` |
| `save_checkpoint(state, mk, step, ...)` / `load_latest_checkpoint(dir)` / `apply_checkpoint!(state, mk, snap, ...)` | Serialization-based checkpoint/restart (versioned snapshot structs; DOF vectors + marker SoA) | `src/io/Checkpoint.jl` |
| `print_run_summary(cfg)` / `validate_config(cfg)` | Pre-run parameter banner + sanity warnings (typos, conflicting BCs, missing rocks) | `src/io/UserHelpers.jl` |
| `print_convergence_summary(log_path)` / `solver_guide()` / `tolerance_guide()` / `case_walkthrough(case)` | Interactive helpers for run analysis and configuration | `src/io/UserHelpers.jl` |

Related pages: [Discretization](../numerics/discretization.md),
[Linear solvers](../numerics/solvers.md),
[Markers](../numerics/markers.md),
[Time stepping](../numerics/time_stepping.md),
[Architecture](../dev/architecture.md).
