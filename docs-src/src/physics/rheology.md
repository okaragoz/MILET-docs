# Rheology

MILET's constitutive model is a pointwise visco-elasto-plastic (VEP)
composite evaluated per marker at $(T, P, \dot\varepsilon_{II}, \varepsilon_\mathrm{pl}, d)$
and harmonically averaged to cells. The core
lives in `src/materials/Rheology.jl` (`_compute_viscosity_core`,
`compute_VEP_viscosity`, `viscous_mechanism_partition`) with calibrated flow
laws in `src/materials/FlowLaws.jl`.

The total deviatoric strain rate decomposes as a serial (Maxwell-type)
arrangement sharing one deviatoric stress:

```math
\dot\varepsilon = \dot\varepsilon_\mathrm{visc} + \dot\varepsilon_\mathrm{plast} + \dot\varepsilon_\mathrm{elast}.
```

## 1. Viscous branch

### Calibrated dislocation creep (`creep_A` / `disl_prof`)

The secondary-invariant power law (Ranalli 1995 convention)

```math
\dot\varepsilon_{II} = A\,\sigma_{II}^{\,n}\,\exp\!\Bigl(-\frac{E + PV}{RT}\Bigr),
\qquad A\ \text{in MPa}^{-n}\,\mathrm{s}^{-1}
```

is inverted to an effective viscosity (`dislocation_viscosity` in
`FlowLaws.jl`):

```math
\eta_\mathrm{disl} = 10^{6}\cdot\tfrac12\,A^{-1/n}\,
\dot\varepsilon_{II}^{\,(1-n)/n}\,
\exp\!\Bigl(\frac{E + PV}{n\,R\,T}\Bigr)\quad[\mathrm{Pa\,s}],
```

with $E$ in J/mol, $V$ in m³/mol, $P$ in Pa; the $10^6$ converts the
MPa-based stress convention. A rock activates this path by setting
`creep_A > 0` explicitly or by naming a catalog profile:

```toml
[[rock]]
disl_prof = "Dry_Olivine-Ranalli_1995"
```

`lookup_flow_law` resolves the name from the `FLOW_LAWS` catalog and
overrides `activation_energy`, `activation_volume`, `stress_exponent`, and
`creep_A`. Shipped entries:

| Profile | $A$ (MPa⁻ⁿ s⁻¹) | $n$ | $E$ (kJ/mol) | $V$ (m³/mol) |
|---|---|---|---|---|
| `Dry_Olivine-Ranalli_1995` | 2.5e4 | 3.5 | 532 | 0 |
| `Wet_Olivine-Ranalli_1995` | 2.0e3 | 4.0 | 471 | 0 |
| `Mafic_Granulite-Ranalli_1995` | 1.4e4 | 4.2 | 445 | 0 |
| `Plagioclase_An75-Ranalli_1995` | 3.3e-4 | 3.2 | 238 | 0 |
| `Quartzite-Ranalli_1995` | 6.7e-6 | 2.4 | 156 | 0 |
| `Wet_Quarzite-Ranalli_1995` | 3.2e-4 | 2.3 | 154 | 0 |
| `Dry_Olivine_disl-Hirth_Kohlstedt_2003` | 1.1e5 | 3.5 | 530 | 14e-6 |
| `Wet_Olivine_disl-Hirth_Kohlstedt_2003` | 90·1000^1.2 ≈ 3.58e5 | 3.5 | 480 | 11e-6 |
| `Dry_Eclogite-Jin_2001` | 1.995e3 | 3.5 | 403 | 27.2e-6 |
| `Dry_Maryland_Diabase-Mackwell_1998` | 8.0 | 4.7 | 485 | 0 |

The wet Hirth & Kohlstedt (2003) law is the constant-water form with
$C_\mathrm{OH} = 1000$ H/10⁶ Si folded into $A$ ($A_\mathrm{eff} = 90\cdot
1000^{1.2}$); it pairs with the wet diffusion law below. The names
`Wet_Olivine_disl-Hirth_Kohlstedt_2003_COH1000` and
`Wet_Olivine_diff-Hirth_Kohlstedt_2003_COH1000` are accepted as aliases.
Catalog $V$ is always in m³/mol (multiplied by $P$ in Pa); the legacy
J/(mol·bar) convention of `activation_volume` applies only to the
`eta0` Arrhenius branch, which a catalog law never uses.

#### Granulite→eclogite blend (`eclogite_flow_law`)

With a divariant `transition = 3` phase and the model key
`eclogite_flow_law = "<FLOW_LAWS name>"` (e.g. `"Dry_Eclogite-Jin_2001"`,
any section, normally `[model]`), the dislocation viscosity of a
`creep_A`/`disl_prof` rock is log-interpolated with the marker eclogite
fraction $X = \texttt{phase\_drho}/\Delta\rho_\mathrm{max}$:

```math
\eta_\mathrm{disl} \leftarrow \exp\bigl[(1-X)\ln\eta_\mathrm{rock} + X\ln\eta_\mathrm{ecl}\bigr],
```

before the diffusion/Peierls composite, plasticity and the clamp. Off by
default.

### Grain-size-sensitive diffusion creep (`diff_A` / `diff_prof`)

A parallel linear-viscous mechanism (Hirth & Kohlstedt 2003 form):

```math
\dot\varepsilon_{II} = A\,\sigma_{II}\,d^{-m}\,\exp\!\Bigl(-\frac{E + PV}{RT}\Bigr)
\;\;\Longrightarrow\;\;
\eta_\mathrm{diff} = 10^{6}\,\frac{(d\cdot10^{6})^{m}}{2A}\,
\exp\!\Bigl(\frac{E + PV}{RT}\Bigr),
```

with lab units $A$ in MPa⁻¹ µm$^m$ s⁻¹ and grain size $d$ in metres at the
call site (`diffusion_viscosity`). Configure with explicit
`diff_A`, `diff_m`, `diff_E`, `diff_V` keys or a catalog profile
(`DIFF_CREEP_LAWS`): `Dry_Olivine_diff-Hirth_Kohlstedt_2003`
($A=1.5\times10^9$, $m=3$, $E=375$ kJ/mol, $V=6\times10^{-6}$) or
`Wet_Olivine_diff-Hirth_Kohlstedt_2003` ($A=10^9$, $m=3$, $E=335$ kJ/mol,
$V=4\times10^{-6}$; $C_\mathrm{OH}=1000$ H/10⁶ Si). `diff_A = 0` (default)
disables the mechanism. The grain size $d$ is a marker property initialised
from `grain_init` (m) or its alias `grain_size_mm` (mm); it stays constant
unless the rock has `grain_G0 > 0`, in which case it is evolved by the
paleowattmeter — see [Grain-size evolution](grain_size.md).

### Harmonic composite

Both mechanisms act in parallel at common stress, so compliances add
(the standard LaMEM/ASPECT "harmonic" approximation, evaluated at the total
strain-rate invariant):

```math
\frac{1}{\eta_\mathrm{visc}} = \frac{1}{\eta_\mathrm{disl}} + \frac{1}{\eta_\mathrm{diff}(d)} .
```

### Legacy Arrhenius path (`eta0`)

When `creep_A = 0` and `eta0 > 0`, the pre-exponential viscosity form is
used:

```math
\eta_\mathrm{creep} = \eta_0\,\exp\!\Bigl(\frac{Q + V\,P_\mathrm{bar}}{n\,R\,T}\Bigr),
```

with $n = $ `stress_exponent` ($n = 1$ → diffusion creep, $n > 1$ →
dislocation creep; the $1/n$ in the exponent is essential to avoid
$\sim10^8\times$ overestimated viscosity at depth). **Unit note for this
path:** `activation_energy` $Q$ is in J/mol but `activation_volume` $V$ is
in J/(mol·bar) since $P$ enters in bar. Strain-rate dependence is supplied
by the power-law blend when `ref_yield_stress` $\sigma_\mathrm{ref} > 0$ and
$n > 1$:

```math
x = \Bigl(\frac{2\,\eta_\mathrm{creep}\,\dot\varepsilon_{II}}{\sigma_\mathrm{ref}}\Bigr)^{1 - 1/n},
\qquad
\eta_\mathrm{visc} = \frac{\eta_\mathrm{creep}}{1 + x},
```

which interpolates continuously between the linear regime
($\dot\varepsilon_{II}\to0$) and the power-law regime without an explicit
switch. A legacy "air-like" branch (`activation_energy < 0`) reproduces
the I3ELVIS depth-linear softening, and a legacy `grain_exponent` modifier
scales `eta0`-path viscosity by $(d/d_\mathrm{ref})^{m}$.

### Viscous strain softening (`visc_soft_factor`)

Fabric/CPO weakening of ductile shear zones: the aggregate viscous
viscosity is divided by a factor that ramps linearly from $1$ to
`visc_soft_factor` over the same accumulated-strain interval
$[\varepsilon_0, \varepsilon_f]$ = [`strain_thresh_init`,
`strain_thresh_weak`] as the plastic weakening. `visc_soft_factor = 1.0`
(default) disables it; e.g. `0.3` gives a 3.3× weaker steady shear zone.

## 2. Plastic branch (Drucker–Prager + strain weakening)

Drucker–Prager yield with linear strain weakening of both cohesion and
friction:

```math
\tau_\mathrm{yield} = \min\bigl(C(\varepsilon_\mathrm{pl}) + \sin\varphi(\varepsilon_\mathrm{pl})\cdot P,\;
\sigma_{y,\max}\bigr),
```

where $C$ and $\sin\varphi$ interpolate linearly from
(`cohesion_init`, `friction_init`) to (`cohesion_weak`, `friction_weak`) as
the accumulated plastic strain $\varepsilon_\mathrm{pl}$ grows across
[`strain_thresh_init`, `strain_thresh_weak`]. Note `friction_init` /
`friction_weak` are $\sin\varphi$ directly (dimensionless), not angles.

The absolute **yield cap** `yield_stress_max` (default `5e8` Pa, after
Kaus 2010 / Glerum et al. 2018) prevents $C + \sin\varphi\,P$ from growing
to many GPa at depth — without it cold slab cores accumulate unbounded
elastic stress and trigger spurious break-off cascades; set `<= 0` to
disable.

Plasticity is realized rate-dependently as an effective viscosity

```math
\eta_\mathrm{plast} = \frac{\tau_\mathrm{yield}}{2\,\dot\varepsilon_{II}},
```

so that $2\,\eta_\mathrm{plast}\,\dot\varepsilon_{II} = \tau_\mathrm{yield}$
exactly when plasticity is engaged.

### Visco-plastic combination

The combination is **stress-limiting**, not harmonic — the weaker mechanism
governs:

```math
\frac{1}{\eta_\mathrm{VP}} = \max\Bigl(\frac{1}{\eta_\mathrm{visc}},\ \frac{1}{\eta_\mathrm{plast}}\Bigr)
\;\Longleftrightarrow\;
\eta_\mathrm{VP} = \min(\eta_\mathrm{visc},\ \eta_\mathrm{plast}),
```

which caps the stress at yield once plasticity engages rather than summing
compliances. `_compute_viscosity_core` also returns a `yielded` flag
(`inv_plast > inv_visc`); its marker average forms the per-cell yield
fraction `state.yield_frac_c`, which gates plastic-strain accumulation on
markers (`update_marker_strain!` in `src/particles/Projection.jl`, toggled
by `strain_gate_plastic`) so weakening strain builds only in shear zones
that actually yield. Strain healing (`heal_tau0`, `heal_E`, `heal_Tref`)
anneals $\varepsilon_\mathrm{pl}$ back — see
[Softening & healing](softening.md).

## 3. Maxwell elasticity {#maxwell-elasticity}

A Maxwell body $\dot\sigma/G + \sigma/\eta_\mathrm{VP} = \dot\varepsilon$
discretized with backward Euler over $\Delta t$ gives
(`compute_VEP_viscosity`):

```math
Z = \frac{G\,\Delta t}{\eta_\mathrm{VP} + G\,\Delta t}\in[0,1],
\qquad
\eta_\mathrm{VEP} = Z\,\eta_\mathrm{VP},
\qquad
\chi = 1 - Z,
```

```math
\boldsymbol{\sigma}_\mathrm{new} = 2\,\eta_\mathrm{VEP}\,\dot\varepsilon + \chi\,\boldsymbol{\sigma}_\mathrm{old}.
```

Limits: $G\,\Delta t \gg \eta_\mathrm{VP}$ → $Z\to1$, $\chi\to0$ (pure
viscous, old stress forgotten); $G\,\Delta t \ll \eta_\mathrm{VP}$ →
$Z\to0$, $\eta_\mathrm{VEP}\to0$, $\boldsymbol{\sigma}_\mathrm{new}\to\boldsymbol{\sigma}_\mathrm{old}$
(pure elastic). In between, stress relaxes over the Maxwell time
$\tau_M = \eta/G$. The per-rock key is `shear_modulus` (Pa; typical
silicate $\approx 7\times10^{10}$); `shear_modulus <= 0` disables
elasticity ($Z = 1$, $\chi = 0$). The $\chi\,\boldsymbol{\sigma}_\mathrm{old}$
term feeds the Stokes RHS — see
[Governing equations](governing_equations.md#vep-elastic-memory-source).

## 4. Melt weakening

`_compute_viscosity_core` applies an exponential melt weakening to the
total visco-plastic viscosity (Mei et al. 2002):

```math
\eta \leftarrow \eta\,e^{-\phi_w F_\mathrm{melt}},
```

via the `melt_factor` ($\phi_w$) and `F_melt` (marker melt fraction)
keyword arguments — melt weakens both diffusion and dislocation creep, hence
the application to the aggregate. The single-phase marker projection
currently calls it with `melt_factor = 0.0`; active matrix melt weakening
in the shipped physics goes through the two-phase module, which applies
$\eta\,e^{-\alpha_\phi\,\phi}$ with the `[twophase]` key `alpha_phi`
(default `27.0`) in `src/physics/TwoPhase.jl`. See
[Melting](melting.md) and [Two-phase flow](two_phase.md).

## 5. Clamps and evaluation pipeline

The numerical bounds act on the **visco-plastic** viscosity inside
`_compute_viscosity_core`, before elasticity and before reaction softening:

```math
\eta_\mathrm{VP} \leftarrow \operatorname{clamp}\!\Bigl(\eta_\mathrm{VP},\ \max(\texttt{eta\_min},\ \texttt{rock.eta\_min}),\ \min(\texttt{eta\_max},\ \texttt{rock.eta\_max})\Bigr),
```

combining the global `[rheology]` bounds (defaults `1e19` / `1e25` Pa·s)
with the per-rock ones. The marker viscosity that enters the projection is
then built in this order:

1. **Clamp** the visco-plastic viscosity as above.
2. **Maxwell elasticity** (`compute_VEP_viscosity`): $\eta_\mathrm{VEP} = Z\,\eta_\mathrm{VP}$
   with $Z \le 1$. Because this step follows the clamp, $\eta_\mathrm{VEP}$
   can fall below `eta_min` when $G\,\Delta t$ is small.
3. **Reaction softening** (only for rocks with a mode-3 `[[phase]]` and
   `weaken_decades > 0`, in `project_markers_to_cells!`):
   $\eta \leftarrow \max\bigl(\eta\cdot10^{-w X},\ \texttt{eta\_min}\bigr)$,
   floored at the **global** `[rheology]` `eta_min`, not at `rock.eta_min`.
   See [Softening & healing](softening.md#reaction-softening-divariant-eclogitization).

Raising `eta_max` therefore changes the reacted viscosity only through the
clamp in step 1, and the softened value can sit below a rock's own
`eta_min` if that is higher than the global one.

`project_markers_to_cells!` (`src/particles/Projection.jl`) evaluates
`compute_VEP_viscosity` per marker with marker temperature, lithostatic
pressure $P = \rho_0\,g\,y$ (converted to bar), the **host cell's**
$\dot\varepsilon_{II}$ from the previous iteration, the marker's
accumulated strain, grain size, and melt fraction. Cell viscosity and
thermal conductivity are **harmonic** marker means; $\rho$, $c_p$, $h_r$,
$\chi$, $\boldsymbol{\sigma}_\mathrm{old}$, and the yield fraction are
arithmetic means.

## Mechanism partition (wattmeter input)

`viscous_mechanism_partition` splits the viscous deformation at a point for
the grain-size wattmeter. At the harmonic-composite approximation both
mechanisms see the common stress
$\sigma_{II} = 2\,\eta_\mathrm{visc}\,\dot\varepsilon_{II}$ and partition as
$\dot\varepsilon_\mathrm{mech} = \sigma_{II} / (2\,\eta_\mathrm{mech})$. It
returns
$(\eta_\mathrm{visc}, \eta_\mathrm{diff}, \eta_\mathrm{disl}, \dot\varepsilon_\mathrm{diff}, \dot\varepsilon_\mathrm{disl}, \Psi_\mathrm{disl})$
with the dislocation work rate
$\Psi_\mathrm{disl} = \sigma_{II}\,\dot\varepsilon_\mathrm{disl}$.
Deliberately **unclamped**: applying the `eta_min`/`eta_max` numerical
guards here would break the identity
$\dot\varepsilon_\mathrm{diff} + \dot\varepsilon_\mathrm{disl} = \dot\varepsilon_{II}$
and inflate the wattmeter work rate. With `diff_A = 0` the full work rate is
attributed to dislocation creep (the conservative choice for grain-size
reduction). See [Grain-size evolution](grain_size.md).

## Key reference

| Key (per `[[rock]]` unless noted) | Units | Meaning |
|---|---|---|
| `eta0` | Pa·s | legacy pre-exponential viscosity |
| `activation_energy`, `activation_volume`, `stress_exponent` | J/mol; J/(mol·bar) legacy / m³/mol calibrated; — | $Q$/$E$, $V$, $n$ |
| `ref_yield_stress` | Pa | $\sigma_\mathrm{ref}$ of the $(1+x)$ power-law blend |
| `creep_A` or `disl_prof` | MPa⁻ⁿ s⁻¹ / name | calibrated dislocation creep |
| `diff_A`, `diff_m`, `diff_E`, `diff_V` or `diff_prof` | lab units / name | grain-size-sensitive diffusion creep |
| `cohesion_init`, `cohesion_weak` | Pa | $C_0$, $C_f$ |
| `friction_init`, `friction_weak` | — | $\sin\varphi_0$, $\sin\varphi_f$ |
| `strain_thresh_init`, `strain_thresh_weak` | — | weakening strain bracket $[\varepsilon_0, \varepsilon_f]$ |
| `visc_soft_factor` | — | viscous softening end-member (1 = off) |
| `yield_stress_max` | Pa | absolute yield cap (default 5e8; ≤ 0 off) |
| `shear_modulus` | Pa | Maxwell $G$ (0 = no elasticity) |
| `eta_min`, `eta_max` | Pa·s | per-rock clamp (also global in `[rheology]`) |
| `strain_gate_plastic` (`[rheology]`) | bool | gate strain accumulation by yield fraction |
| `grain_exponent` (`[rheology]`) | — | legacy $d$-dependence of the `eta0` path |
