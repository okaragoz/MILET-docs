# Softening & healing

Strain localization in MILET is driven by a per-marker accumulated plastic
strain $\varepsilon_p$ (`mk.strain`) that weakens both the plastic and (optionally)
the viscous branch of the rheology, anneals away on a temperature-dependent
healing timescale, and accumulates only where the material actually yields.
The constitutive side lives in `src/materials/Rheology.jl`
(`_compute_viscosity_core`), the strain bookkeeping in
`update_marker_strain!` (`src/particles/Projection.jl`); the design spec is
`doc/design/softening_healing.md`.

## Plastic strain weakening (Drucker–Prager ramps)

The yield stress is Drucker–Prager with linear strain weakening:

```math
\tau_\mathrm{yield} = \min\bigl(\,C(\varepsilon_p) + \sin\varphi(\varepsilon_p)\,P,\;\;
\sigma_{y,\mathrm{max}}\bigr)
```

Cohesion $C$ and friction $\sin\varphi$ interpolate linearly from
$(C_0, \sin\varphi_0)$ to $(C_f, \sin\varphi_f)$ as $\varepsilon_p$ runs over
$[\varepsilon_\mathrm{init}, \varepsilon_\mathrm{weak}]$:

```math
C(\varepsilon_p) = C_0 + f\,(C_f - C_0),\qquad
\sin\varphi(\varepsilon_p) = \sin\varphi_0 + f\,(\sin\varphi_f - \sin\varphi_0),
```

```math
f = \mathrm{clamp}\!\left(
\frac{\varepsilon_p - \varepsilon_\mathrm{init}}
     {\varepsilon_\mathrm{weak} - \varepsilon_\mathrm{init}},\,0,\,1\right).
```

The rate-dependent realization is
$\eta_\mathrm{plast} = \tau_\mathrm{yield}/(2\,\dot\varepsilon_{II})$, so
$2\,\eta_\mathrm{plast}\,\dot\varepsilon_{II} = \tau_\mathrm{yield}$ exactly
when plasticity is engaged. The composite with the viscous branch is
**stress-limiting**, not harmonic:
$\eta_\mathrm{eff} = \min(\eta_\mathrm{visc}, \eta_\mathrm{plast})$, i.e.
$1/\eta_\mathrm{eff} = \max(1/\eta_\mathrm{visc}, 1/\eta_\mathrm{plast})$.
See [Rheology](./rheology.md) for the full VEP composite.

Per-`[[rock]]` keys: `cohesion_init`/`cohesion_weak` (Pa, $C_0$/$C_f$),
`friction_init`/`friction_weak` ($\sin\varphi_0$/$\sin\varphi_f$),
`strain_thresh_init`/`strain_thresh_weak`
($\varepsilon_\mathrm{init}$/$\varepsilon_\mathrm{weak}$).
`validate_config` (`src/io/UserHelpers.jl`) warns on a reversed ramp
($\varepsilon_\mathrm{weak} < \varepsilon_\mathrm{init}$) and on strain
*hardening* ($C_f > C_0$ or $\sin\varphi_f > \sin\varphi_0$ — unusual but
allowed).

## Yield cap

The absolute cap $\sigma_{y,\mathrm{max}}$ is the per-rock key
`yield_stress_max` (Pa, default `5e8`; set $\le 0$ to disable). Without it,
$C + \sin\varphi\,P$ grows to many GPa at depth, letting cold strong slab cores
accumulate unbounded elastic stress and trigger break-off cascades (Kaus 2010;
Glerum et al. 2018). The 500 MPa default matches lithospheric strength
estimates (Byerlee envelope at 30–40 km).

## Yield-fraction gating of strain accumulation

Weakening strain should only build where the material actually yields — in
shear bands, not in distributed viscous flow. Two pieces implement this:

1. `_compute_viscosity_core` returns a `yielded` flag
   (`inv_plast > inv_visc`, i.e. the plastic branch governs), propagated
   through `compute_VEP_viscosity`. During `project_markers_to_cells!` the
   marker-fraction of yielding markers is accumulated per cell into
   `state.yield_frac_c` $\in [0,1]$.
2. `update_marker_strain!` accumulates, per marker,

```math
\Delta\varepsilon_p = \Delta t\;\dot\varepsilon_{II}(\text{cell})\;
f_\mathrm{yield}(\text{cell}),
```

using the host cell's strain-rate invariant `state.eii_c` and yield fraction
`state.yield_frac_c` — zero where nothing yields, the full rate inside shear
bands. Accumulation is also skipped when the cell strain rate is below the
global `[rheology]` threshold `str_min` (default `1e-18` s⁻¹).

The global switch `strain_gate_plastic` (`[rheology]`, default `true`)
controls the gate; `false` recovers the legacy total-strain accumulation
($f_\mathrm{yield} \equiv 1$).

## Healing (annealing)

Plastic strain anneals away on an Arrhenius temperature-dependent timescale —
healed faults restrengthen, which is essential for episodic tectonics:

```math
\frac{d\varepsilon_p}{dt} = -\frac{\varepsilon_p}{\tau_\mathrm{heal}(T)},
\qquad
\tau_\mathrm{heal}(T) = \tau_0\,
\exp\!\left[\frac{E_\mathrm{heal}}{R}\Bigl(\frac{1}{T} - \frac{1}{T_\mathrm{ref}}\Bigr)\right].
```

`update_marker_strain!` applies this as a multiplicative decay
$\varepsilon_p \leftarrow \varepsilon_p\, e^{-\Delta t/\tau_\mathrm{heal}}$
**before** the accumulation term, with $\tau_\mathrm{heal}$ floored at
$10^6$ s to avoid exponential underflow at hot temperatures. Hot (deep, or
recently annealed) faults therefore lose their weakening memory quickly while
cold upper-crustal faults stay weak.

Per-`[[rock]]` keys: `heal_tau0` (s at $T_\mathrm{ref}$; default `0.0` = no
healing), `heal_E` (J/mol, default `3e5`), `heal_Tref` (K, default `1000.0`).

## Viscous strain softening

Ductile shear zones weaken by fabric/CPO development independently of friction.
When `visc_soft_factor` $< 1$, the aggregate *viscous* viscosity in
`_compute_viscosity_core` ramps from $1$ to `visc_soft_factor` over the same
strain interval
$[\varepsilon_\mathrm{init}, \varepsilon_\mathrm{weak}]$ as the plastic ramp:

```math
\eta_\mathrm{visc} \leftarrow \eta_\mathrm{visc}\cdot
f_\mathrm{visc}(\varepsilon_p),
\qquad
f_\mathrm{visc}: 1 \to \texttt{visc\_soft\_factor}.
```

Per-`[[rock]]` key `visc_soft_factor` (default `1.0` = off; e.g. `0.1` = 10×
softer when fully strained). `validate_config` requires
$0 < $ `visc_soft_factor` $\le 1$.

## Reaction softening (divariant eclogitization)

Orthogonal to the strain machinery, MILET applies a reaction–deformation
softening tied to the divariant eclogite transition
([Phase changes](./phase_changes.md), `transition = 3` in a `[[phase]]` block,
`src/materials/PhaseChange.jl`). The reaction progress is
$X = $ `phase_drho`$/\Delta\rho_\mathrm{max}$, the marker's accumulated
densification normalized by the transition's `drho`. During
`project_markers_to_cells!` (`src/particles/Projection.jl`,
`_eclogite_softening_params`) the marker viscosity is reduced by a fixed number
of decades per unit reaction progress:

```math
\eta \leftarrow \max\bigl(\eta\cdot 10^{-\Delta_\mathrm{dec}\, X},\;
\eta_\mathrm{min}\bigr)
```

with $\Delta_\mathrm{dec}$ = the `[[phase]]` key `weaken_decades` (0 = off).

The softening is applied **after** the `eta_min`/`eta_max` clamp and after
the Maxwell factor (see [Rheology §5](rheology.md#5-clamps-and-evaluation-pipeline)),
and the floor $\eta_\mathrm{min}$ is the **global** `[rheology]` `eta_min`,
not the per-rock `eta_min`. A higher per-rock floor therefore does not stop
a reacted marker from softening below it. Raising `eta_max` affects the
softened viscosity only through the clamp that precedes the softening.
This represents grain-size-sensitive diffusion creep in the fine-grained,
Zener-pinned reaction product, and combines with shear heating
(`do_shear_heating`) into a thermal–reaction weakening feedback. It is applied
in all three projection paths (host, bilinear, general/AMR).

## Configuration summary

```toml
[rheology]
strain_gate_plastic = true   # yield-fraction gating; false = legacy total strain
str_min             = 1e-18  # minimum cell strain rate for accumulation (1/s)

[[rock]]
cohesion_init        = 20e6  # C0 (Pa)
cohesion_weak        = 4e6   # Cf (Pa)
friction_init        = 0.5   # sin(phi0)
friction_weak        = 0.1   # sin(phif)
strain_thresh_init   = 0.0   # ramp start
strain_thresh_weak   = 0.5   # ramp end
yield_stress_max     = 5e8   # Drucker-Prager cap (Pa); <= 0 disables
visc_soft_factor     = 0.3   # viscous ramp target; 1.0 = off
heal_tau0            = 1e13  # s at heal_Tref; 0 = no healing
heal_E               = 3e5   # J/mol
heal_Tref            = 1000.0 # K

[[phase]]                    # reaction softening (eclogite)
transition      = 3
drho            = 270.0      # full densification (kg/m³)
weaken_decades  = 2.0        # eta reduction at X = 1
```

## Tests

`test/smoke/test_softening.jl` covers: healing decay
($\varepsilon_p \to \varepsilon_p/2$ after $t = \tau_\mathrm{heal}\ln 2$),
the viscous-softening ramp endpoint
($\eta(\varepsilon_\mathrm{weak}) = $ `visc_soft_factor`
$\cdot\,\eta(0)$ for a purely viscous rock), the yield cap, the yield flag /
gating behavior ($f_\mathrm{yield} = 0$ → no accumulation; $= 1$ → full rate),
and a defaults regression against the pre-change extension-case rheology.

See also [Rheology](./rheology.md), [Grain-size evolution](./grain_size.md)
(an independent, complementary localization mechanism), and
[Parameter file](../reference/parameter_file.md).
