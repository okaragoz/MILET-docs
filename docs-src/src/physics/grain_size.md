# Grain-size evolution

MILET evolves a grain size $d$ on every marker, balancing Arrhenius normal
grain growth against paleowattmeter grain-size reduction (Austin & Evans 2007,
*Geology* 35:343), and feeds it back into the viscosity through a
grain-size-sensitive diffusion-creep law. The kinetics live in
`src/materials/GrainSize.jl`, the rheological coupling in
`src/materials/Rheology.jl` and `src/materials/FlowLaws.jl`, the driver wiring
in `update_marker_grain_size!` (`src/time_stepping/Driver.jl`); the design spec
is `doc/design/grain_size.md`.

## Evolution equation

Per marker, at fixed $(T, P, \Psi_\mathrm{disl})$:

```math
\frac{dd}{dt}
= \underbrace{\frac{G_0}{p\,d^{\,p-1}}\,
  \exp\!\Bigl(-\frac{E_g + P V_g}{R T}\Bigr)}_{\text{growth}}
\;-\;
\underbrace{\frac{\lambda}{c\,\gamma}\, d^2\, \Psi_\mathrm{disl}}_{\text{reduction}}
```

**Growth** is the normal grain-growth law
$d^p - d_0^p = G_0\, t\, \exp(-(E_g + P V_g)/RT)$ differentiated
(Karato 1989; Evans et al. 2001). Typical olivine values: $p = 3$,
$G_0 \approx 1.5\times10^{-5}\,\mathrm{m}^p/\mathrm{s}$,
$E_g \approx 3.5\times10^{5}\,\mathrm{J/mol}$. The rate coefficient
$K(T,P) = G_0 \exp(-(E_g + P V_g)/RT)$ is `grain_growth_coeff`.

**Reduction** is the Austin–Evans wattmeter: the fraction $\lambda \approx 0.1$
of the *dislocation*-creep work rate
$\Psi_\mathrm{disl} = \sigma_{II}\,\dot\varepsilon_\mathrm{disl}$ (W/m³) is
stored as new grain-boundary surface energy ($\gamma \approx 1$ J/m², geometric
constant $c \approx 3\pi$). Diffusion creep does no work on the dislocation
structure and therefore does not reduce $d$.

## Steady state (the wattmeter)

Setting growth = reduction gives the closed-form fixed point
(`grain_size_steady_state`):

```math
d_\mathrm{ss}
= \left(\frac{c\,\gamma\,K}{p\,\lambda\,\Psi_\mathrm{disl}}\right)^{\!1/(p+1)},
\qquad K = G_0\,\exp\!\Bigl(-\frac{E_g + P V_g}{R T}\Bigr),
```

reproducing the $d_\mathrm{ss} \propto \Psi^{-1/(p+1)}$ scaling of Austin &
Evans (2007). This is enforced as a unit test
(`test/smoke/test_grainsize.jl`), approached from both above and below.

## Exact-sub-flow integrator

The ODE is stiff far from equilibrium (reduction $\propto d^2$, growth
$\propto d^{\,1-p}$), so `update_grain_size` uses operator splitting in which
**both sub-flows integrate exactly in closed form**:

```math
\text{growth:}\quad \frac{d(d^{\,p})}{dt} = K
\;\Rightarrow\; d \leftarrow \bigl(d^{\,p} + K\,\Delta t\bigr)^{1/p}
```

```math
\text{reduction:}\quad \dot d = -a\,d^2,\;\; a = \frac{\lambda\,\Psi_\mathrm{disl}}{c\,\gamma}
\;\Rightarrow\; d \leftarrow \frac{d}{1 + a\,d\,\Delta t}
```

Consequences: with $\Psi_\mathrm{disl} = 0$ the analytic growth law is
reproduced in a *single* substep, and the reduction flow is unconditionally
stable. Substeps are adaptive:

- net-rate limiter: $\Delta t_\mathrm{sub} \le 0.1\, d / |\dot d_\mathrm{net}|$
  — vanishes at the fixed point, where an equilibrium early-exit
  ($|\dot d_\mathrm{net}|\, t_\mathrm{left} < 10^{-3} d$) makes steady-state
  markers nearly free;
- split-error control: each sub-flow capped at 5 % of $d$ per substep
  (a 50 % cap left a 10 % offset from the analytic $d_\mathrm{ss}$; 5 % gives
  < 1 %);
- bounds: floor `d_min = 1e-6` m (1 µm), cap `d_max = 0.1` m, at most
  `max_substeps = 400` substeps.

The update is pure per-marker arithmetic (no Gridap calls) and is threaded over
markers on the Cartesian fast path.

## Mechanism partition (who pays for the wattmeter)

The composite viscous rheology assumes both creep mechanisms act in parallel at
common stress, so compliances add (see [Rheology](./rheology.md)):

```math
\frac{1}{\eta_\mathrm{visc}} = \frac{1}{\eta_\mathrm{disl}} + \frac{1}{\eta_\mathrm{diff}(d)}
```

`viscous_mechanism_partition` (`src/materials/Rheology.jl`) recovers the
per-mechanism rates under stress continuity:

```math
\sigma_{II} = 2\,\eta_\mathrm{visc}\,\dot\varepsilon_{II},
\qquad
\dot\varepsilon_\mathrm{mech} = \frac{\sigma_{II}}{2\,\eta_\mathrm{mech}},
\qquad
\Psi_\mathrm{disl} = \sigma_{II}\,\dot\varepsilon_\mathrm{disl}.
```

Two implementation points matter:

- The partition uses the **unclamped** constitutive viscosity — the
  `eta_min`/`eta_max` clamps are numerical guards for the FE solve; applying
  them here would break the identity
  $\dot\varepsilon_\mathrm{diff} + \dot\varepsilon_\mathrm{disl} = \dot\varepsilon_{II}$
  and inflate the work rate wherever a clamp engages.
- With no calibrated diffusion law (`diff_A = 0`) the entire viscous strain
  rate is attributed to the dislocation/legacy branch — the conservative choice
  for grain-size reduction.

The diffusion-creep viscosity is the Hirth & Kohlstedt (2003) form
(`diffusion_viscosity`, `src/materials/FlowLaws.jl`):

```math
\dot\varepsilon_{II} = A\,\sigma_{II}\, d^{-m}\,
\exp\!\Bigl(-\frac{E + P V}{R T}\Bigr)
\;\Rightarrow\;
\eta_\mathrm{diff} = 10^{6}\,\frac{(d\cdot10^{6})^{m}}{2A}\,
\exp\!\Bigl(\frac{E + P V}{R T}\Bigr)\ \ [\mathrm{Pa\,s}]
```

with the laboratory convention $A$ in MPa⁻¹ µm$^m$ s⁻¹ ($d$ in metres at the
call site, converted to µm inside; the $10^6$ factor converts MPa to Pa).
Catalog entries (`DIFF_CREEP_LAWS`) usable via `diff_prof`:
`"Dry_Olivine_diff-Hirth_Kohlstedt_2003"` ($A = 1.5\times10^{9}$, $m = 3$,
$E = 375$ kJ/mol, $V = 6\times10^{-6}$ m³/mol) and
`"Wet_Olivine_diff-Hirth_Kohlstedt_2003"` ($A = 10^{9}$, $m = 3$,
$E = 335$ kJ/mol, $V = 4\times10^{-6}$ m³/mol).

## Driver wiring and feedback loop

Per step, after marker advection and gated on `any(rk -> rk.grain_G0 > 0)`,
`update_marker_grain_size!` runs per marker:

1. $T$ from `mk.T`; lithostatic pressure
   $P = \rho_\mathrm{ref}\, g\, y$ (the same convention as the projection and
   phase changes); $\dot\varepsilon_{II}$ from the host cell (`state.eii_c`).
2. `viscous_mechanism_partition` at the marker's **own** grain size →
   $\Psi_\mathrm{disl}$.
3. `update_grain_size` advances `mk.grain_size[m]`.

The loop closes through the projection: `project_markers_to_cells!`
(`src/particles/Projection.jl`) passes each marker's grain size to
`compute_VEP_viscosity`, where `diff_A > 0` activates the
$1/\eta_\mathrm{diff}(d)$ compliance — so grain-size reduction in shear zones
lowers viscosity, localizes strain, raises $\Psi_\mathrm{disl}$, and reduces
$d$ further until the wattmeter balance is reached.

Marker state: `mk.grain_size::Vector{Float32}` is initialized per rock from
`grain_init` (`src/initialization/Markers.jl`), advects with the marker,
is inherited on [reseeding](../numerics/markers.md), checkpointed, and written
to the marker VTK output as `grain_size_mm`.

A legacy path is kept for backward compatibility: the global `[rheology]` key
`grain_exponent` ($m$: 0 = off, 2 = Coble, 3 = Nabarro–Herring) multiplies the
`eta0`-path creep viscosity by $(d/d_\mathrm{ref})^m$ with
$d_\mathrm{ref} = 10^{-3}$ m. With `diff_A = 0` and `grain_G0 = 0` behavior is
identical to the pre-grain-size code (regression-tested).

## Configuration (per `[[rock]]`)

Defaults from `src/io/TOMLLoader.jl`; see also
[Parameter file](../reference/parameter_file.md) and
`doc/Parameter-file-example.md`.

| Key | Default | Units | Meaning |
|---|---|---|---|
| `diff_prof` | `""` | — | named catalog diffusion-creep law (overrides the four below) |
| `diff_A` | `0.0` | MPa⁻¹ µm$^m$ s⁻¹ | diffusion-creep prefactor; 0 = mechanism off |
| `diff_m` | `3.0` | — | grain-size exponent $m$ |
| `diff_E` | `375e3` | J/mol | activation energy |
| `diff_V` | `6e-6` | m³/mol | activation volume |
| `grain_G0` | `0.0` | m$^p$/s | growth prefactor $G_0$; 0 = grain size frozen |
| `grain_p` | `3.0` | — | growth exponent $p$ |
| `grain_Eg` | `350e3` | J/mol | growth activation energy $E_g$ |
| `grain_Vg` | `8e-6` | m³/mol | growth activation volume $V_g$ |
| `grain_lambda` | `0.1` | — | work partition $\lambda$ |
| `grain_gamma` | `1.0` | J/m² | grain-boundary surface energy $\gamma$ |
| `grain_c` | `3π` | — | geometric constant $c$ |
| `grain_init` | `1e-3` | m | initial marker grain size |

## Tests

`test/smoke/test_grainsize.jl` checks: (1) the growth-only analytic law over a
large $\Delta t$; (2) convergence to the closed-form $d_\mathrm{ss}$ from both
directions; (3) the composite-rheology identity
$1/\eta = 1/\eta_\mathrm{diff} + 1/\eta_\mathrm{disl}$ and the `diff_A = 0`
regression; (4) mechanism-partition stress consistency
($\dot\varepsilon_\mathrm{diff} + \dot\varepsilon_\mathrm{disl} \approx \dot\varepsilon_{II}$).
