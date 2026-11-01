# Two-phase flow

MILET implements McKenzie-type two-phase flow — porous melt migration through a
compacting viscous matrix — as a switchable extension of the Stokes solve
(`do_two_phase = true` in the `[twophase]` section). The implementation lives in
`src/physics/TwoPhase.jl`; the design spec is `doc/design/two_phase_flow.md`.
At zero porosity the system reduces to single-phase [Stokes](./governing_equations.md),
and a regression test enforces this limit.

## Governing equations (3-field formulation)

Following Katz (2008) and Rhebergen, Wells & Katz (2014), with incompressible
phases and the Boussinesq approximation, the unknowns are the solid velocity
$\mathbf{u}_s$, the fluid (melt) pressure $p_f$, and the compaction pressure
$p_c$:

```math
-\nabla\cdot\bigl(2\,\eta_\varphi\,\dot\varepsilon(\mathbf{u}_s)\bigr)
+ \nabla p_f + \nabla p_c = \bar\rho\,\mathbf{g}
\qquad \text{(momentum)}
```

```math
\nabla\cdot\mathbf{u}_s + \frac{p_c}{\zeta_\varphi} = 0
\qquad \text{(compaction closure)}
```

```math
-\nabla\cdot\Bigl(\tfrac{k_\varphi}{\mu_f}\bigl(\nabla p_f - \rho_f\,\mathbf{g}\bigr)\Bigr)
- \nabla\cdot\mathbf{u}_s = 0
\qquad \text{(fluid mass + Darcy)}
```

The mixture density $\bar\rho = (1-\varphi)\rho_s + \varphi\rho_f$ drives
buoyancy (`twophase_buoyancy`, same volume-mean perturbation convention as the
single-phase `buoyancy_cellfield`; `body_force_full = true` disables the
reference subtraction). Melt buoyancy *relative to the solid* enters the $p_f$
equation through the $(k_\varphi/\mu_f)\,\rho_f\,\mathbf{g}$ term, so melt
percolates upward even in a static matrix. The compaction pressure is the
diagnostic $p_c = -\zeta_\varphi\,\nabla\cdot\mathbf{u}_s$, realized weakly by
the closure equation.

## Constitutive closures

Built cell-wise from the marker-projected porosity by `twophase_cell_fields`
(`src/physics/TwoPhase.jl`):

| Closure | Formula | Function | Config keys |
|---|---|---|---|
| Permeability | $k_\varphi = k_0\bigl(\tfrac{\varphi+\varphi_\mathrm{min}}{\varphi_0}\bigr)^{n}$ | `permeability` | `k0`, `phi0`, `n_perm`, `phi_min` |
| Compaction viscosity | $\zeta_\varphi = \eta_\varphi/(\varphi+\varphi_\mathrm{min})$ | `inv_compaction_viscosity` | `phi_min` |
| Melt-weakened matrix viscosity | $\eta_\varphi = \eta_s\,e^{-\alpha_\varphi \varphi}$ | `melt_weakened_viscosity` | `alpha_phi` |

$\eta_s$ is the visco-elasto-plastic matrix viscosity from the marker
projection (see [Rheology](./rheology.md)); $\alpha_\varphi \approx 27$ follows
Mei et al. (2002). The regularization porosity $\varphi_\mathrm{min}$
(default $10^{-4}$) keeps both closures finite as $\varphi \to 0$.

The compaction length

```math
\delta = \sqrt{\frac{\zeta_\varphi\, k_\varphi}{\mu_f}}
```

is available as a diagnostic (`compaction_length`) and is the resolution guide:
the grid should resolve $\delta$ wherever compaction dynamics matter.

## Weak form and discretization

`build_twophase_forms` assembles the symmetric indefinite bilinear form with the
same integration-by-parts conventions as `src/physics/Stokes.jl`:

```math
\begin{aligned}
a\bigl((\mathbf{u},p_f,p_c),(\mathbf{v},q_f,q_c)\bigr)
 &= \int_\Omega 2\eta_\varphi\,\dot\varepsilon(\mathbf{u})\!:\!\dot\varepsilon(\mathbf{v})
  \;-\; \int_\Omega (p_f + p_c)\,\nabla\cdot\mathbf{v} \\
 &\;-\; \int_\Omega q_f\,\nabla\cdot\mathbf{u}
  \;-\; \int_\Omega \tfrac{k_\varphi}{\mu_f}\,\nabla p_f\cdot\nabla q_f
  \;-\; \int_\Omega q_c\,\nabla\cdot\mathbf{u}
  \;-\; \int_\Omega \tfrac{p_c\, q_c}{\zeta_\varphi}
\end{aligned}
```

```math
l\bigl((\mathbf{v},q_f,q_c)\bigr)
= \int_\Omega \bar\rho\,\mathbf{g}\cdot\mathbf{v}
- \int_\Omega \tfrac{k_\varphi}{\mu_f}\,\rho_f\,\mathbf{g}\cdot\nabla q_f
\;\Bigl(+ \int_\Omega \chi\,\sigma_\mathrm{old}\!:\!\dot\varepsilon(\mathbf{v})
+ \text{tractions}\Bigr)
```

The optional $\chi\,\sigma_\mathrm{old}$ term is the visco-elastic stress
memory, with the same convention as `build_stokes_forms`; free-slip penalty and
traction boundary conditions are reused from the single-phase path.

The $-(k_\varphi/\mu_f)\nabla p_f\cdot\nabla q_f$ pressure Laplacian removes the
pressure nullspace whenever $k_\varphi > 0$.

**Spaces** (`build_twophase_spaces`): $Q_2$ velocity (the existing
`FESpaceBundle` velocity space, `fe_order_v = 2`) and two fresh $Q_1$ scalar
spaces for $p_f$ and $p_c$ (`fe_order_p = 1`), combined into a 3-field
`MultiFieldFESpace` (`X3`/`Y3`). By default $p_f$ has no Dirichlet condition
(flux-free walls — melt cannot leave the domain); `pf_surface0 = true` imposes
homogeneous Dirichlet $p_f = 0$ on the `"surface"` boundary tag so melt escapes
freely at the surface (extraction sink).

**Solver**: `solve_twophase!` assembles an `AffineFEOperator` and solves the
monolithic 3-field system with a cached MUMPS factorization
(`cached_mumps_solve!`, `src/solvers/Mumps.jl`) — the sparsity pattern is
constant across steps, so only the numeric factorization is repeated. See
[Linear solvers](../numerics/solvers.md).

**Driver coupling** (`src/time_stepping/Driver.jl`): when `do_two_phase` is on,
the step loop replaces `picard_stokes!` with a Picard iteration
(`n_picard` iterations) of
`project_markers_to_cells!` → `project_porosity_to_cells!` → `solve_twophase!`
→ `recover_invariants!`. The solved $p_f$ takes the pressure role downstream
(`state.ph = pfh`), and the per-cell compaction pressure is recovered as cell
means by `compaction_pressure_cells`.

## Porosity transport on markers

Porosity lives on the markers (`mk.porosity::Vector{Float32}`,
`src/particles/Particles.jl`): it advects with the markers, is inherited on
[reseeding](../numerics/markers.md), and is checkpointed (format v3). Markers
initialize at $\varphi = 0$ (or uniformly at `phi_init` when set).
`project_porosity_to_cells!` produces the arithmetic host-cell mean
$\varphi_c$ that feeds the closures.

Porosity evolves by operator splitting, after the two-phase solve
(`update_marker_porosity!`):

```math
\frac{D\varphi}{Dt} = (1-\varphi)\,\nabla\cdot\mathbf{u}_s
                    = -(1-\varphi)\,\frac{p_c}{\zeta_\varphi}
```

evaluated per marker from the host cell's solved $p_c/\zeta_\varphi$, then
clamped to $[0, \varphi_\mathrm{max}]$ (`phi_max`, default 0.5). The update is
pure per-marker arithmetic and threads over markers on the Cartesian fast path.

## Melting coupling

With two-phase flow enabled, [melting](./melting.md) sources porosity instead of
deleting melt: in `apply_marker_phase_and_melt!` (`Driver.jl`), each marker's
melt-fraction change $\Delta F$ from `apply_melting!` is added to its porosity
(clamped to $[0, \varphi_\mathrm{max}]$) — melt stays in the pores and
percolates via the Darcy solve rather than being removed by threshold
extraction. Freezing ($\Delta F < 0$) consumes porosity first. The helper
`melt_to_porosity!` (`TwoPhase.jl`) implements the same rule.

## Melt-segregation CFL

The Darcy segregation flux can outrun the solid-velocity CFL. The melt velocity
is

```math
\mathbf{u}_f = \mathbf{u}_s
- \frac{k_\varphi}{\mu_f\,\varphi}\bigl(\nabla p_f - \rho_f\,\mathbf{g}\bigr),
```

and `max_melt_segregation_speed` estimates
$\max|\mathbf{u}_f - \mathbf{u}_s|$ cell-wise from the solved $p_f$. The driver
then limits the step to

```math
\Delta t \le \mathrm{CFL}\cdot\frac{h_\mathrm{min}}{\max|\mathbf{u}_f - \mathbf{u}_s|}
```

with `CFL = maxxystep`, on top of the usual limits in
[Time stepping](../numerics/time_stepping.md).

## The φ = 0 limit (regression gate)

As $\varphi \to 0$, $k_\varphi$ becomes tiny and
$1/\zeta_\varphi \to \varphi_\mathrm{min}/\eta$ becomes negligible: the
$p_f$ equation degenerates to
$-\nabla\cdot\mathbf{u} = 0$ and $p_c \to 0$, recovering single-phase Stokes.
`test/smoke/test_twophase.jl` enforces this on the falling-block case: with
`do_two_phase = true` and $\varphi = 0$, the two-phase velocity field matches
single-phase Stokes to a relative difference of $4\times10^{-5}$, and the total
pressure $p_f + p_c$ (mean-free — the split between $p_f$ and $p_c$ is
regularization-dependent at $\varphi = 0$, but their sum is the physical
pressure) matches to $10^{-4}$. The test gate is set at $5\times10^{-3}$ to
absorb conditioning variation of the dimensional system.

## Configuration

All keys live in the `[twophase]` TOML section (defaults from
`cases/_defaults.toml`; loaded into `cfg.twophase_*` by
`src/io/TOMLLoader.jl` and bundled into the `TwoPhaseParams` struct):

```toml
[twophase]
do_two_phase = false
k0           = 1e-12    # reference permeability at phi0 (m²)
phi0         = 0.01     # reference porosity
n_perm       = 3.0      # permeability exponent
mu_fluid     = 1.0      # melt viscosity (Pa·s)
rho_fluid    = 2800.0   # melt density (kg/m³)
alpha_phi    = 27.0     # matrix melt-weakening exponent (Mei et al. 2002)
phi_min      = 1e-4     # regularization porosity (phi → 0 limit)
phi_max      = 0.5      # marker porosity cap
pf_surface0  = false    # Dirichlet p_f = 0 at the surface (melt escapes)
phi_init     = 0.0      # uniform initial marker porosity
```

See also [Parameter file](../reference/parameter_file.md),
[Melting](./melting.md), and [Markers](../numerics/markers.md).
