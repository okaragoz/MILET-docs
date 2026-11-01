# Melting

Partial melting is computed **per marker** by `apply_melting!`
(`src/materials/Melting.jl`), called from `apply_marker_phase_and_melt!`
(`src/time_stepping/Driver.jl`) in the same pass as
[phase changes](./phase_changes.md). Enable it with `do_melting` in the
`[physics]` section (default `false`) and declare one `[[melt]]` block per
meltable rock type (`find_melt_entry` matches on `rock_id`).

## Solidus, liquidus and melt fraction (Katz lite)

The parameterization follows Katz, Spiegelman & Langmuir (2003), simplified to
a *linear* melt fraction between a quadratic-in-$P$ solidus and liquidus
(`melt_fraction` in `src/materials/Melting.jl`):

```math
T_\text{sol}(P) = T_{\text{sol},0} + a_\text{sol}\,P + b_\text{sol}\,P^2 - \Delta T_\text{sol},
\qquad
T_\text{liq}(P) = T_{\text{liq},0} + a_\text{liq}\,P + b_\text{liq}\,P^2,
```

```math
F = \operatorname{clamp}\!\left(\frac{T - T_\text{sol}}{T_\text{liq} - T_\text{sol}},\; 0,\; 1\right).
```

(The full Katz 2003 model uses a non-linear $F(T)$ with separate cpx-out
curves; MILET keeps the linear form for tractability — see the module header.)

**Units.** `a_sol`/`a_liq` are in **K/Pa** (e.g. `132.9e-9` ≈ 133 K/GPa from
Katz 2003) and `b_sol`/`b_liq` in K/Pa². The marker pressure arrives in bar
and is converted to Pa inside `melt_fraction` (`P_Pa = P_bar * 1e5`); a
previous version skipped this conversion, flattening the solidus's depth
dependence and spuriously melting the deep mantle — the comment in the source
records the bug. As for phase changes, $P$ is the lithostatic estimate
$\rho_\text{ref}\,g\,y$.

**Volatile solidus offset.** `melt_fraction` accepts an optional
`T_sol_offset` (positive K) that *lowers* the dry solidus,
$T_\text{sol,eff} = T_\text{sol,dry} - \Delta T_\text{sol}$, to represent flux
melting in volatile-rich wedge mantle. The driver computes it from
`volatile_solidus_depression` only when `do_volatile = true`; the volatile
module is not included in this release, so the offset is `0.0` and the dry
solidus applies.

## Latent heat

`apply_melting!` returns the latent heat exchanged since the marker's last
update,

```math
Q_\text{lat} = L\,(F_\text{new} - F_\text{old}) \quad [\mathrm{J/kg}],
```

positive when melt fraction grows (endothermic; melting absorbs heat) and
negative on crystallisation. The driver converts it to a volumetric source
for the next heat solve,

```math
H_\text{latent} = -\rho\,L\,\frac{\partial F}{\partial t}
\;\approx\; -\rho_\text{ref}\,\frac{Q_\text{lat}}{\Delta t} \quad [\mathrm{W/m^3}],
```

accumulated into the per-cell `H_marker_latent` vector and **averaged over the
markers in each cell** — averaging (not summing) keeps the source independent
of marker packing (the module header documents the over-counting bug this
fixed). The vector enters the heat equation through `build_heat_source`
(`src/physics/HeatSources.jl`); see [Heat transport](./heat.md). The default
latent heat is the global constant `L_MELT = 4e5` J/kg
(`src/core/Constants.jl`).

## What happens to the melt

The marker melt fraction `mk.F_melt` (`Float32`, exported to the markers VTU
as `melt_fraction`) can be routed two ways.

### Threshold extraction (default)

When $F \ge$ `extract_threshold`, `apply_melting!` switches the marker's rock
type to `rock_after_extract` (a "depleted residue" type) and resets
$F \to 0$. The extracted melt is a diagnostic only — it is **not** advected
upward in this mode (that would require a separate melt-tracking field; see
the module header).

While melt is retained ($0 < F <$ threshold) it feeds back on density and,
optionally, on rheology:

- **Buoyancy** — `compute_density` (`src/materials/Density.jl`) mixes solid
  and melt densities and applies residue depletion:

  ```math
  \rho = (1-F)\,\rho_\text{solid} + F\,\rho_\text{melt},
  \qquad
  \rho_\text{solid} \mathrel{-}= \text{depletion}\cdot F,
  ```

  with $\rho_\text{melt}$ = `density_melt` (default 2800 kg/m³).
- **Melt weakening** — `compute_VEP_viscosity`
  (`src/materials/Rheology.jl`) supports
  $\eta \leftarrow \eta\,e^{-\nu F}$ (Mei et al. 2002) via its `melt_factor`
  argument. The `nu_factor` key (default 25.0) is parsed into `MeltProp` for
  this purpose, but the marker projection currently calls the rheology with
  `melt_factor = 0.0` (`src/particles/Projection.jl`), so retained-melt
  weakening is active only through the two-phase porosity closure below.

### Two-phase porosity routing (`do_two_phase = true`)

With McKenzie [two-phase flow](./two_phase.md) enabled, a melt-fraction change
*sources the marker porosity* instead of being deleted by extraction
(`apply_marker_phase_and_melt!`):

```math
\phi \leftarrow \operatorname{clamp}\!\bigl(\phi + \Delta F,\; 0,\; \phi_\text{max}\bigr),
\qquad \Delta F = F_\text{new} - F_\text{old},
```

with $\phi_\text{max}$ = `twophase_phi_max` (default 0.5). The melt then
stays in the pores and percolates via the three-field
$(u_s, p_f, p_c)$ Darcy/compaction solve (`solve_twophase!` in
`src/physics/TwoPhase.jl`); freezing ($\Delta F < 0$) consumes porosity. The
porosity also weakens the matrix through the two-phase closure
$\eta_\phi = \eta_s\,e^{-\alpha_\phi \phi}$ (`melt_weakened_viscosity`,
key `alpha_phi` in `[twophase]`, default 27).

Threshold extraction still fires in this mode — and because the porosity
source uses $\Delta F$ *after* the extraction reset, an extraction event
($F \to 0$) produces a negative $\Delta F$ that removes the corresponding
porosity. Set `extract_threshold = 1.0` if all melt should remain in the
porosity field and be transported solely by the two-phase solve.

## Configuration

`[[melt]]` keys parsed by `src/io/TOMLLoader.jl` (one block per meltable
rock; the user file's `[[melt]]` array replaces the defaults):

| Key | Default | Units | Meaning |
|---|---|---|---|
| `rock_id` | — (required) | – | rock type this law applies to |
| `T_sol0` | `1373.0` | K | solidus at $P = 0$ |
| `a_sol` | `0.0` | K/Pa | linear solidus slope |
| `b_sol` | `0.0` | K/Pa² | quadratic solidus coefficient |
| `T_liq0` | `1973.0` | K | liquidus at $P = 0$ |
| `a_liq` | `0.0` | K/Pa | linear liquidus slope |
| `b_liq` | `0.0` | K/Pa² | quadratic liquidus coefficient |
| `latent` | `4e5` (`L_MELT`) | J/kg | latent heat of fusion |
| `extract_threshold` | `0.05` | – | $F$ above which melt is extracted |
| `rock_after_extract` | `rock_id` | – | residue rock type after extraction |
| `density_melt` | `2800.0` | kg/m³ | melt density for the two-phase mixture |
| `nu_factor` | `25.0` | – | reserved $e^{-\nu F}$ melt-weakening factor |

Example (from `cases/subduction_thermomech.toml`):

```toml
[physics]
do_melting = true

[[melt]]
rock_id            = 5              # asthenospheric mantle
T_sol0             = 1085.0
a_sol              = 132.9e-9       # ≈ 133 K/GPa (Katz et al. 2003)
T_liq0             = 1780.0
a_liq              = 89.0e-9
latent             = 4e5            # J/kg
extract_threshold  = 0.3            # 30 % melt → extract
rock_after_extract = 5
```

## Related pages

- [Two-phase flow](./two_phase.md) — porosity transport, Darcy percolation,
  compaction and the melt-segregation CFL limit.
- [Phase changes](./phase_changes.md) — the companion per-marker pass and the
  shared latent-heat accumulator.
- [Heat transport](./heat.md) — heat-source assembly
  (`build_heat_source`).
- [Rheology](./rheology.md) — the effective viscosity that melt and porosity
  weaken.
