# Phase changes

Solid–solid phase transitions are applied **per marker**, after the heat solve
and marker advection, by `apply_marker_phase_and_melt!`
(`src/time_stepping/Driver.jl`), which calls `apply_phase_change!`
(`src/materials/PhaseChange.jl`) for every marker against every `[[phase]]`
entry whose `rock_from` matches the marker's current rock type. The module is
enabled by `do_phase_change` in the `[physics]` section (default `false` in
`cases/_defaults.toml`).

Each marker carries a cumulative density anomaly `phase_drho` (kg/m³,
`Float32`, defined in `src/particles/Particles.jl`). It is the state variable
of the phase-change module: `compute_density` (`src/materials/Density.jl`)
adds it directly to the solid density,

```math
\rho_\text{solid}(T,P) = \rho_0\,\bigl(1-\alpha(T-T_\text{ref})\bigr)\bigl(1+\beta(P-P_\text{ref})\bigr) + \Delta\rho_\text{phase} - \delta\,F,
```

where $P$ is in **bar** (so the per-rock `compressibility` $\beta$ is in
bar⁻¹), $\delta$ is the melt-depletion density loss and $F$ the melt
fraction. When melt is retained the bulk density is the mixture
$\rho = (1-F)\,\rho_\text{solid} + F\,\rho_\text{melt}$
(see [Melting](./melting.md)).

Because `phase_drho` is a marker property, a transition changes buoyancy exactly once per marker (no re-counting from
cell-wise $P$–$T$ lookups). The field is written to the markers VTU as
`phase_drho_kg_m3` and stored in checkpoints.

**Pressure.** The trigger pressure is the lithostatic estimate
$P = \rho_\text{ref}\, g\, y$ (computed in bar in the driver,
`P_bar = rk.reference_density * cfg.gy_grav * y / 1e5`, converted back to Pa
inside `apply_phase_change!`). Using the FE pressure field instead is a noted
TODO in `apply_marker_phase_and_melt!`.

## Mode 1 — Clapeyron $P$–$T$ transition (`transition = 1`)

Univariant transitions such as olivine → wadsleyite (≈ 410 km) and
ringwoodite → bridgmanite (≈ 660 km). The phase boundary is a straight line
in $P$–$T$ space through the reference point $(T_\text{ref}, P_\text{ref})$
with Clausius–Clapeyron slope $\gamma = dT/dP$ (config key `clapeyron`, K/Pa):

```math
T_\text{locus}(P) = T_\text{ref} + \gamma\,(P - P_\text{ref}).
```

A marker has crossed when $T > T_\text{locus}(P)$, i.e. it lies on the
high-pressure-phase side of the line. On crossing, `apply_phase_change!`

- reassigns the rock type to `rock_to` (may equal `rock_from` to apply only
  the density jump and latent heat),
- adds `drho` (kg/m³, positive = densified) to the marker's `phase_drho`,
- accumulates `latent` (J/kg) into the returned latent-heat budget.

Sign convention for the slope (see the header comment of
`src/materials/PhaseChange.jl`): positive `clapeyron` → exothermic transition,
boundary deflects *upward* around cold slabs (enhanced penetration); negative
`clapeyron` → endothermic, boundary deflects *downward* (the textbook 660 km
barrier).

## Mode 2 — depth-triggered transition (`transition = 2`)

For reactions whose temperature dependence is negligible at the depth of
interest (e.g. basalt → eclogite as a sharp jump near 70 km), the locus is a
depth threshold: the marker crosses when $y > y_\text{trigger}$ (the $y$ axis
points down). The same `rock_to` / `drho` / `latent` effects apply as in
mode 1.

::: warning Parsed key
In mode 2 the **`P_ref` slot is reinterpreted as the trigger depth in
metres** (`if y > ph.P_ref` in `apply_phase_change!`). The TOML loader
(`src/io/TOMLLoader.jl`) parses `P_ref` only — a `depth` key in a `[[phase]]`
block is silently ignored and `P_ref` falls back to its default of `0.0`,
which triggers the transition everywhere below the surface. Set
`P_ref = 70000.0` (metres) for a 70 km trigger.
:::

## Mode 3 — divariant, rate-limited eclogitization (`transition = 3`)

Eclogitization of subducted crust is not a univariant jump: the
gabbro/blueschist → eclogite reaction progresses over a pressure band and is
kinetically inhibited in cold, dry slabs. Mode 3 models this as a continuous
reaction-progress variable $X \in [0,1]$ (the eclogite fraction) with an
equilibrium target and an optional forward-only relaxation.

**Equilibrium (S1).** The reaction-band centre is a line in $P$–$T$ space
(here `clapeyron` is the slope $dP/dT$ in **Pa/K**, transposed relative to
mode 1):

```math
P_c(T) = P_\text{ref} + \gamma'\,(T - T_\text{ref}),
\qquad
X_\text{eq}(P,T) = \operatorname{clamp}\!\left(\frac{P - P_c(T)}{\Delta P_\text{band}} + \tfrac12,\; 0,\; 1\right),
```

with band width $\Delta P_\text{band}$ = `band_width` (Pa). With
`react_tau_ref = 0` (the default), the marker is set to equilibrium each step,
$X = X_\text{eq}$ — an instantaneous divariant transition.

**Kinetics (S2).** With `react_tau_ref > 0` the eclogite fraction relaxes
*forward only* (the reaction is irreversible; $X$ never decreases) toward
$X_\text{eq}$ with an Arrhenius reaction time modelled on dry volume diffusion
(Ahrens & Schubert 1975):

```math
\tau_\text{rxn}(T) = \tau_\text{ref}\,
  \exp\!\left[\frac{Q_\text{rxn}}{R}\left(\frac{1}{T} - \frac{1}{T_\text{rxn,ref}}\right)\right],
\qquad
X \leftarrow X + (X_\text{eq} - X)\left(1 - e^{-\Delta t/\tau_\text{rxn}}\right),
```

where $\tau_\text{ref}$ = `react_tau_ref` (s), $Q_\text{rxn}$ = `react_Q`
(J/mol) and $T_\text{rxn,ref}$ = `react_Tref` (K, default 973.15). The update
is the exact integral of $\dot X = (X_\text{eq}-X)/\tau$ over the step, so the
result is independent of the time-step size.

**State and coupling.** Mode 3 does *not* reassign the rock type. The
state variable is the marker's `phase_drho`, which is **overwritten** each
step as $\Delta\rho_\text{phase} = \texttt{drho}\cdot X$ (a state function of
$P$, $T$ and reaction history, not a cumulative jump); the eclogite fraction
is recovered as $X = \texttt{phase\_drho}/\texttt{drho}$. Two couplings
follow:

- *Densification*: the full $\texttt{drho}\cdot X$ enters `compute_density`,
  driving slab pull as the reaction progresses.
- *Reaction softening*: if `weaken_decades` > 0, the marker viscosity is
  reduced during marker→cell projection
  (`_eclogite_softening_params` and `project_markers_to_cells!` in
  `src/particles/Projection.jl`):

  ```math
  \eta \leftarrow \max\!\left(\eta\cdot 10^{-w\,X},\ \eta_\text{min}\right),
  \qquad w = \texttt{weaken\_decades}.
  ```

  The softening follows the viscosity clamp, and $\eta_\text{min}$ here is
  the global `[rheology]` floor (see [Rheology §5](./rheology.md#5-clamps-and-evaluation-pipeline)).
- *Eclogite flow law (optional)*: with the model key `eclogite_flow_law`
  the dislocation creep of the reacting rock is log-interpolated toward a
  named eclogite law with $X$ (see [Rheology](./rheology.md)).
- *Floor stop*: `eclogite_floor_stop` (default `false`, set `true` in the Venus example) ends the run once the
  eclogite ($X > 0.55$) reaches 95 % of the domain depth.

A complete example is `cases/venus_eclogite_foundering.toml`.

::: info No latent heat in mode 3
The mode-3 branch returns before the latent-heat accumulation in
`apply_phase_change!`; the `latent` key has no effect for `transition = 3`.
Latent heating/cooling is applied only by modes 1 and 2 (and by
[melting](./melting.md)).
:::

## Latent heat

`apply_phase_change!` returns the latent heat $Q_\text{lat}$ (J/kg) of all
transitions crossed by the marker this step. Sign convention: **positive =
endothermic** (heat absorbed by the reaction, surroundings cool), negative =
exothermic (released). In `apply_marker_phase_and_melt!` this becomes a
volumetric source for the *next* heat solve,

```math
H_\text{latent} = -\,\rho_\text{ref}\,\frac{Q_\text{lat}}{\Delta t} \quad [\mathrm{W/m^3}],
```

accumulated into the per-cell vector `H_marker_latent` and **averaged over the
markers in each cell** (not summed) so the source is independent of marker
packing density. The cell vector is added to the right-hand side of the heat
equation by `build_heat_source` (`src/physics/HeatSources.jl`) — see
[Heat transport](./heat.md).

## Configuration

Phase transitions are declared as repeated `[[phase]]` blocks (the user file's
array *replaces* the defaults; see `load_config_toml` in
`src/io/TOMLLoader.jl`). Parsed keys and defaults:

| Key | Default | Units | Used by | Meaning |
|---|---|---|---|---|
| `rock_from` | — (required) | – | all | rock type the transition applies to |
| `rock_to` | — (required) | – | 1, 2 | rock type assigned after crossing |
| `transition` | `1` | – | all | 1 = Clapeyron, 2 = depth trigger, 3 = divariant eclogitization |
| `T_ref` | `0.0` | K | 1, 3 | reference temperature on the locus |
| `P_ref` | `0.0` | Pa (mode 1, 3); **m** (mode 2) | all | reference pressure / trigger depth |
| `clapeyron` | `0.0` | K/Pa (mode 1); **Pa/K** (mode 3) | 1, 3 | locus slope ($dT/dP$ vs. $dP/dT$) |
| `drho` | `0.0` | kg/m³ | all | density jump (mode 3: at $X=1$) |
| `latent` | `0.0` | J/kg | 1, 2 | latent heat, + endothermic / − exothermic |
| `band_width` | `0.0` | Pa | 3 | divariant reaction-band width |
| `react_tau_ref` | `0.0` | s | 3 | reaction time at `react_Tref`; 0 = instantaneous |
| `react_Q` | `0.0` | J/mol | 3 | reaction activation energy |
| `react_Tref` | `973.15` | K | 3 | reference temperature for `react_tau_ref` |
| `weaken_decades` | `0.0` | decades | 3 | viscosity drop $10^{-w X}$ at full eclogitization |

Example (from `cases/subduction_thermomech.toml`): the 410 km and 660 km
mantle transitions plus crustal eclogitization,

```toml
[physics]
do_phase_change = true

# olivine → wadsleyite, 410 km (exothermic, positive Clapeyron slope)
[[phase]]
rock_from  = 5
rock_to    = 5
transition = 1
T_ref      = 1700.0
P_ref      = 14e9      # 410 km ≈ 14 GPa
clapeyron  = 2.5e-9    # K/Pa
drho       = 270.0
latent     = -90000.0  # released

# ringwoodite → bridgmanite, 660 km (endothermic, negative slope)
[[phase]]
rock_from  = 5
rock_to    = 5
transition = 1
T_ref      = 1900.0
P_ref      = 23e9      # 660 km ≈ 23 GPa
clapeyron  = -2.0e-9
drho       = 400.0
latent     = 180000.0  # absorbed

# basalt → eclogite at ~70 km, sharp depth trigger
[[phase]]
rock_from  = 2
rock_to    = 4
transition = 2
P_ref      = 70000.0   # trigger depth (m)
drho       = 200.0
```

`check_config_sanity` (`src/io/UserHelpers.jl`) warns when
`do_phase_change = true` but the domain is shallower than 660 km, since the
mantle transitions then never fire.

## Related pages

- [Melting](./melting.md) — the other consumer of the shared per-marker
  latent-heat accumulator.
- [Heat transport](./heat.md) — how `H_marker_latent` enters the heat solve.
- [Rheology](./rheology.md) — the visco-elasto-plastic viscosity that
  mode-3 reaction softening modifies.
- [Markers](../numerics/markers.md) — marker state, projection and
  averaging conventions.
