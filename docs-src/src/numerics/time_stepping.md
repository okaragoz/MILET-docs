# Time stepping

The time loop lives in `run_case` (`src/time_stepping/Driver.jl`); the
nonlinear Stokes iteration in `src/time_stepping/PicardLoop.jl` (with a
full-Newton alternative in `NewtonLoop.jl`); the adaptive step size in
`src/time_stepping/CFL.jl`.

## Driver loop order

After setup (mesh → FE spaces → `State` → markers → initial $T$/$C$ fields →
initial marker projection), each step `step = 1:ntot` executes in this order:

1. **Stokes solve** (`do_stokes`) — `picard_stokes!`, or the three-field
   two-phase solve when `do_two_phase = true` (see
   [Two-phase flow](../physics/two_phase.md)). Uses the running-mean step
   size `timesum/(step-1)` as the Maxwell time-step guess for the
   projection's elastic weight $\chi$ (step 1 uses `maxtmstep`); the Picard
   loop re-projects with it each iteration.
2. **CFL** — `compute_dt`, then the melt-segregation limit (below);
   `timesum += dt`.
3. **Porosity evolution** (two-phase only) — compaction opens/closes pores
   at the rate set by the solved compaction pressure.
4. **Heat** (`do_heat`) — backward-Euler solve (`solve_heat_step!`); in
   `marker_T_mode = "pic_increment"` the pre-solve $T_\text{old}$ is first
   rebuilt from marker temperatures via a cached $L^2$ projection
   (`_project_cellfield_to_T`), optionally followed by
   [subgrid diffusion](./markers.md#subgrid-temperature-diffusion); markers
   then absorb only the $\Delta T$ increment
   (`update_marker_temperatures!`), clamped to the bound-preserving limits
   of `_heat_clamp_bounds` (pre-solve field range ∪ Dirichlet endpoints
   + 5 %·ΔT slack).
5. **Composition FE** (`do_composition_fe`) — SUPG advection step for `Ch`
   and any extra composition fields.
6. **Marker stresses** — `update_marker_stresses!` (VEP, Jaumann-rotated)
   *before* advection so the rotation uses the current cell-frame velocity
   gradient.
7. **Advection** (`do_advect`) — `advect_markers!` (RK4), then
   `update_marker_strain!` (healing + yield-gated accumulation),
   `update_marker_grain_size!` (if any rock has `grain_G0 > 0`), then
   `reseed_markers!`.
8. **Phase changes + melting** (`do_phase_change` / `do_melting`) —
   `apply_marker_phase_and_melt!`, accumulating per-cell latent heat
   `H_marker_latent` (W/m³) for the *next* heat step.
9. **Volatiles** (`do_volatile`) — release + buoyant transport.
10. **Final projection** — `project_markers_to_cells!` so diagnostics and
    the next step start from current marker state; `record_step!`.
11. **I/O** every `output_every` steps — grid/markers/topography VTU + PVD,
    benchmark observables, inventories; **checkpoint** every
    `checkpoint_every` steps.
12. **AMR** every `amr_every` steps (if `do_amr`) and **ALE free surface**
    each step (if `do_ale_free_surface`, 2D) — see [AMR & ALE](./amr_ale.md).
    A successful AMR step sets `skip_heat_next` so the heat solve is skipped
    once while the marker-temperature projection re-establishes consistency
    on the new mesh.

The run stops at `ntot` steps or when `timesum` reaches `t_end_myr` (if
nonzero). With `solver_type = "bamgs"` the entire loop is wrapped in a single
PETSc context (`with_bamgs_context`,
see [Linear solvers](./solvers.md#bamgs-solver_type--bamgs)). Setting
`PROFILE_STEPS=1` in the environment prints a per-step timing breakdown.

## CFL time step

`compute_dt` (`src/time_stepping/CFL.jl`) takes the most restrictive of:

- **Advection CFL**: $\;dt \le C\, h_\text{min} / v_\text{max}$, with
  $C = \texttt{maxxystep}$ (default 0.5), $h_\text{min}$ the smallest cell
  edge, and $v_\text{max}$ the largest velocity DOF magnitude (non-finite
  DOFs are clamped with a warning rather than propagating `dt = NaN`).
- **Diffusion limit**: $\;dt \le C\, h_\text{min}^2 \rho c_p / k$ using the
  largest cell diffusivity $\kappa = k/(\rho_\text{ref} c_p)$. Backward Euler
  is unconditionally stable; this keeps the Fourier number ≤ `maxxystep` for
  *accuracy*.
- **Hard cap**: $dt \le \texttt{maxtmstep}$ (default 1.5 × 10¹³ s ≈ 500 kyr).
- **Floor**: $dt \ge \texttt{maxtmstep}\cdot10^{-8}$ (avoids `dt = 0`
  stalls).

### Melt-segregation limit

With two-phase flow the Darcy flux can outrun the solid CFL. The Driver
computes the maximum segregation speed
(`max_melt_segregation_speed`, `src/physics/TwoPhase.jl`)

```math
v_\text{seg} = \max_c \; \frac{k_\phi/\mu_f}{\phi}\,
\bigl\lVert \nabla p_f - \rho_f \mathbf g \bigr\rVert ,
```

from the cell-averaged fluid-pressure gradient of the last $p_f$ solve, and
enforces $dt \le \texttt{maxxystep}\cdot h_\text{min}/v_\text{seg}$.

## Picard iteration

The Stokes operator is nonlinear because $\eta = \eta(\dot\varepsilon_{II})$
with $\dot\varepsilon_{II} = \sqrt{\tfrac12\,\varepsilon(\mathbf u)\!:\!\varepsilon(\mathbf u)}$.
`picard_stokes!` runs the fixed-point sequence

```math
\eta^{(k)} = \eta\!\left(\dot\varepsilon_{II}^{(k)}\right), \qquad
L\!\left(\eta^{(k)}\right) x^{(k+1)} = b, \qquad
\dot\varepsilon_{II}^{(k+1)} \text{ recovered from } x^{(k+1)},
```

for up to `n_picard` iterations (default 3). Each iteration re-projects
markers to cells (the viscosity update enters through
`compute_VEP_viscosity` at the cell strain rate), rebuilds the buoyancy and
optional VEP/free-slip/traction/ALA terms, refills the cached sparse system
in place, and re-solves with warm starts — see
[caching](./solvers.md#caching-and-warm-starts).

### Velocity-increment convergence test

Convergence is declared when the relative change of the **velocity DOF
vector** drops below `picard_tol` (default 1e-3):

```math
\frac{\lVert \mathbf u^{(k+1)} - \mathbf u^{(k)} \rVert_2}
     {\lVert \mathbf u^{(k+1)} \rVert_2} < \texttt{picard\_tol}.
```

This is deliberately an increment test on the DOF vector, not a comparison of
successive iterate *norms* — the earlier norm-based criterion could report
convergence for two different velocity fields of equal magnitude. The outcome
is recorded on the state (`last_picard_iters`, `last_picard_rel`,
`last_picard_ok`); a post-run audit (`print_convergence_summary`) scans
`run.log` for non-converged steps.

### Damped Picard and full Newton

- `nonlinear_method = "newton"` applies under-relaxation inside the Picard
  loop: $u_\text{new} = (1-\alpha)\,u_\text{old} + \alpha\,u_\text{solve}$
  with $\alpha = \texttt{newton\_damping} \in (0,1]$ (default 0.5).
  $\alpha < 1$ trades convergence speed for robustness under large viscosity
  contrasts; $\alpha = 1$ recovers plain Picard.
- `nonlinear_method = "full_newton"` selects `newton_stokes!`
  (`src/time_stepping/NewtonLoop.jl`): linearization of the residual
  $R(\mathbf u, p) = -\nabla\!\cdot[2\eta(\dot\varepsilon_{II})\,\varepsilon(\mathbf u)] + \nabla p - \rho\mathbf g$
  in the spirit of Fraters et al. (2019), with re-projection of $\eta$ at the
  current strain rate each iteration and an Armijo-style backtracking damp
  when the velocity-DOF change grows. This path is a scaffold (MUMPS-only,
  no caching) and is not the production default.

## Config keys

```toml
[time]
maxxystep = 0.5      # CFL fraction (advection, diffusion, melt segregation)
maxtmstep = 1.5e13   # hard cap on dt (s)
ntot      = 100      # number of steps
# t_end_myr = 0.0    # stop at this model time (Myr); 0 = step count only

[fe]
n_picard         = 3
picard_tol       = 1e-3
nonlinear_method = "picard"   # picard | newton | full_newton
newton_damping   = 0.5

[temperature]
marker_T_mode        = "pic_increment"  # pic_increment | overwrite
# do_subgrid_diffusion = false
# subgrid_d            = 1.0
# subgrid_scheme       = "gerya_yuen"
```
