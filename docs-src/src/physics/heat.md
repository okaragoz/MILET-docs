# Heat transport

The energy equation is solved implicitly on the FE grid
(`src/physics/Heat.jl`, driven by `solve_heat_step!` in
`src/time_stepping/Driver.jl`) with sources assembled in
`src/physics/HeatSources.jl`. Temperature *advection* is, by default,
handled in the Lagrangian frame by the markers (PIC pattern below), so the
grid solve is a pure diffusion + source step.

## Strong form and backward-Euler discretization

```math
\rho c_p\Bigl(\frac{\partial T}{\partial t} + \mathbf{u}\cdot\nabla T\Bigr)
= \nabla\cdot(k\,\nabla T) + H,
```

where $H$ aggregates radiogenic, shear, adiabatic, and latent sources.
Backward Euler in time:

```math
\rho c_p\,\frac{T^{n+1} - T^{n}}{\Delta t}
+ \rho c_p\,\mathbf{u}\cdot\nabla T^{n+1}
= \nabla\cdot(k\,\nabla T^{n+1}) + H .
```

Testing with $q$ and integrating the Fourier flux by parts
(`build_heat_forms`):

```math
\int_\Omega \frac{\rho c_p}{\Delta t}\,T\,q\,d\Omega
+ \underbrace{\int_\Omega \rho c_p\,(\mathbf{u}\cdot\nabla T)\,q\,d\Omega}_{\text{only if } \texttt{with\_advection}}
+ \int_\Omega k\,\nabla T\cdot\nabla q\,d\Omega
= \int_\Omega \frac{\rho c_p}{\Delta t}\,T^{n}\,q\,d\Omega
+ \int_\Omega H\,q\,d\Omega .
```

Temperature uses Q1 elements (`fe_order_T = 1`). The system is solved with
a cached MUMPS factorization (`CachedMumps` in `state.heat_solver_cache`) —
the sparsity pattern is constant across steps, so only the numeric
factorization repeats.

**Density convention:** the heat equation uses the constant Boussinesq
reference density, $\rho c_p =$ `rho_ref_heat` $\cdot\, c_p$ (per-cell
marker-mean $c_p$), *not* the perturbed $\rho(T)$ — which can go negative
in non-dimensional cases (e.g. Blankenbach with $\alpha = 10^4$) and would
destabilize the BE mass term. The $\rho(T)$ buoyancy lives only in the
Stokes RHS (see
[Governing equations](governing_equations.md#buoyancy-boussinesq-perturbation-form)).
Under `formulation = "tala"` the reference density $\bar\rho(y)$ of the
adiabatic reference state replaces `rho_ref_heat` (`heat_density`), in the
heat solve, in the subgrid $\kappa$ and in the diffusion time-step bound
(see [TALA](compressibility.md#TALA)).

## Thermal conductivity

Each marker's conductivity is (`marker_conductivity`,
`src/materials/Density.jl`)

```math
k(T, P) = k_0\Bigl(\frac{298}{T}\Bigr)^{n}(1 + aP) + w\,k_\mathrm{rad}(T),
```

with $T$ in K and $P$ the lithostatic pressure in Pa. The per-rock keys are
`thermal_conductivity` ($k_0$), `k_T_exponent` ($n$), `k_P_coeff` ($a$) and
`k_radiative` ($w$). All three at 0 (the default) gives the constant
$k = k_0$. The lattice part has the form fitted by Xu et al. (2004) to
olivine, wadsleyite and ringwoodite. Their joint 4–10 GPa olivine fit is
$k_0 = 4.10$ W/m/K, $n = 0.493$, $a = 0.032$ GPa⁻¹ $= 3.2\times10^{-11}$ Pa⁻¹
(their Table 1). The radiative part is the Hofmeister (1999) polynomial for
mantle olivine,

```math
k_\mathrm{rad} = 1.753\times10^{-2} - 1.0365\times10^{-4}\,T + 2.2451\times10^{-7}\,T^2 - 3.4071\times10^{-11}\,T^3 ,
```

about 0.05 W/m/K at 735 K and 0.32 at 1700 K (coefficients as quoted by
McKenzie et al. 2005). Cell conductivity is the harmonic mean over the
markers in the cell.

- Xu, Y., Shankland, T. J., Linhardt, S., Rubie, D. C., Langenhorst, F., & Klasinski, K. (2004). Thermal diffusivity and conductivity of olivine, wadsleyite and ringwoodite to 20 GPa and 1373 K. *Phys. Earth Planet. Inter.*, 143–144, 321–336. [doi:10.1016/j.pepi.2004.03.005](https://doi.org/10.1016/j.pepi.2004.03.005)
- Hofmeister, A. M. (1999). Mantle values of thermal conductivity and the geotherm from phonon lifetimes. *Science*, 283, 1699–1706.
- McKenzie, D., Jackson, J., & Priestley, K. (2005). Thermal structure of oceanic and continental lithosphere. *Earth Planet. Sci. Lett.*, 233, 337–349.

## Stabilized FE advection (optional)

With `do_supg_heat = true` (or `heat_stabilisation = "supg"`), the FE field
advects temperature directly and the cell-Péclet > 1 regime is stabilized
by **SUPG**: the test function is augmented $q \to q + \tau\,(\mathbf{u}\cdot\nabla q)$,
adding

```math
\int_\Omega \rho c_p\,\tau\,(\mathbf{u}\cdot\nabla T)(\mathbf{u}\cdot\nabla q)\,d\Omega
\quad\text{(LHS)},\qquad
\int_\Omega \tau\,H\,(\mathbf{u}\cdot\nabla q)\,d\Omega
\quad\text{(RHS)},
```

with the Codina (2000) parameter

```math
\tau = \Bigl[\Bigl(\frac{2\lvert\mathbf{u}\rvert}{h}\Bigr)^{2}
+ \Bigl(\frac{4k}{\rho c_p h^{2}}\Bigr)^{2}
+ \Bigl(\frac{1}{\Delta t}\Bigr)^{2}\Bigr]^{-1/2},
```

so $\tau\to h/(2\lvert u\rvert)$ when advection dominates,
$h^2\rho c_p/(4k)$ when diffusion dominates, $\Delta t$ when storage
dominates. The cell size is $h = \sqrt{\Delta x\,\Delta y}$ (2D) or
$(\Delta x\,\Delta y\,\Delta z)^{1/3}$ (3D).

`heat_stabilisation = "entropy"` instead adds residual-driven artificial
diffusion (Guermond–Pasquetti–Popov 2011; `entropy_viscosity` in
`src/physics/EntropyViscosity.jl`):

```math
\nu_e(K) = \min\Bigl(c_\mathrm{max}\,h\,\lvert u\rvert_K,\;
c_E\,h^{2}\,\frac{\lvert R_E(T)\rvert_K}{\lVert T - \bar T\rVert}\Bigr),
\qquad
R_E = (T - \bar T)\Bigl(\frac{T - T_\mathrm{old}}{\Delta t} + \mathbf{u}\cdot\nabla T\Bigr),
```

with $c_\mathrm{max} = 0.5$, $c_E = 1.0$ (Kronbichler–Heister–Bangerth 2012
§3.4 defaults) and entropy $S = \tfrac12(T - \bar T)^2$ about the
volume-mean temperature. It enters the diffusion term as
$k_\mathrm{eff} = k + \rho c_p\,\nu_e$ per cell (`solve_heat_step!`).
Default is `heat_stabilisation = "none"` (PIC advection, diffusion-only FE
operator).

## Boundary conditions

Configured per wall in `[boundary_temperature]`
(`build_heat_flux_bcs` in `Heat.jl`; Dirichlet values in
`src/boundary_conditions/Temperature.jl`):

| `bcT_surface` / `bcT_deep` | Weak-form contribution | Keys |
|---|---|---|
| `"dirichlet"` (default) | strong, via the FE space: $T=$ `T_top` (surface), `T_bot` (deep) | `T_top`, `T_bot` |
| `"flux"` | $-k\nabla T\cdot\mathbf{n} = q$: adds $\int_\Gamma -q\,\tilde q\,d\Gamma$ to the RHS | `q_surface`, `q_deep` (W/m²) |
| `"robin"` | $-k\nabla T\cdot\mathbf{n} = h(T - T_\mathrm{amb})$: adds $\int_\Gamma h\,T\,\tilde q\,d\Gamma$ (LHS) and $\int_\Gamma h\,T_\mathrm{amb}\,\tilde q\,d\Gamma$ (RHS) | `h_robin`, `T_amb` |
| `"insulating"` | natural zero-flux Neumann, no contribution | — |

Lateral walls are insulating by default.

## Heat sources

`build_heat_source` (`src/physics/HeatSources.jl`) assembles $H$ (W/m³)
from per-cell constants plus `CellField` expressions that track the current
FE solution:

- **Radiogenic** (`do_radiogenic = true`): per-cell marker mean of the
  per-rock `radiogenic_heating` $h_r$ (W/m³; typical $10^{-6}$ continental
  crust, $10^{-7}$ oceanic crust, $10^{-8}$ mantle), held in `state.ht_c`.
- **Constant / functional**: `H_const` adds a uniform W/m³ everywhere;
  `cfg.H_fn` (set programmatically, not from TOML) evaluates
  $H(x,y[,z])$ at cell centres — used by prescribed-source benchmarks.
- **Shear heating** (`do_shear_heating = true`): viscous dissipation
  $\sigma\!:\!\dot\varepsilon = 2\eta\,\varepsilon\!:\!\varepsilon$; with
  MILET's invariant convention
  $\dot\varepsilon_{II} = \sqrt{\tfrac12\,\varepsilon\!:\!\varepsilon}$ this is

  ```math
  H_\mathrm{shear} = 4\,\eta\,\dot\varepsilon_{II}^{2} \ \geq 0,
  ```

  built from the cell fields `eta_c` (the effective $\eta_\mathrm{VEP}$, so
  only the visco-plastic part dissipates) and `eii_c`.
- **Adiabatic** (`do_adiabatic = false` by default):
  $H_\mathrm{adiab} = \alpha\,T\,(\mathbf{u}\cdot\nabla p)$ with the
  hydrostatic simplification
  $\nabla p \approx \rho_\mathrm{ref}\,\mathbf{g}$:

  ```math
  H_\mathrm{adiab} = \alpha\,T\,\rho_\mathrm{ref}\,g_y\,u_y ,
  ```

  positive for downward flow ($u_y > 0$ in the y-down convention —
  sinking material heats). Implemented with a representative
  $\alpha_\mathrm{ref} = 3\times10^{-5}$ K⁻¹,
  $\rho_\mathrm{ref}=$ `rho_ref_heat`, $g_y =$ `gy`. Under
  `formulation = "tala"` this term is $\bar\rho(y)\,\alpha_r\,g\,u_y\,T$
  and is always on; `do_adiabatic` is not used.
- **Latent** (phase change + melting): $H_\mathrm{latent} = \rho L_\mathrm{phase}\,\dot\phi_\mathrm{phase} + \rho L_\mathrm{melt}\,dF/dt$,
  accumulated on markers by `apply_marker_phase_and_melt!` and passed in as
  the per-cell vector `H_marker_c`. Marker contributions are **averaged**
  per cell, not summed, so dense marker packing cannot inflate the source.
  Sign convention: $L > 0$ endothermic. See
  [Phase changes](phase_changes.md) and [Melting](melting.md).

## PIC temperature pattern

Markers carry temperature; how they exchange it with the grid is set by
`marker_T_mode` (`[temperature]`, default `"pic_increment"` in
`cases/_defaults.toml`). The per-step sequence in
`src/time_stepping/Driver.jl` is:

1. **`pic_increment` only** — project marker $T$ to cell means
   (`project_marker_T_to_cells`) and L2-fit the piecewise-constant field
   onto Q1 (`_project_cellfield_to_T`, bound-preserving: the projection is
   clamped to the marker-data range widened to the Dirichlet endpoints),
   stamping the post-advection marker temperature into `state.Th`.
2. Optional **subgrid diffusion** (below); its gridded change is
   subtracted from the grid increment in step 4.
3. FE heat solve (`solve_heat_step!`) → $T^{n+1}$ with diffusion + sources.
4. Marker update (`update_marker_temperatures!` in
   `src/particles/Projection.jl`):
   - `mode = :pic_increment`: $T_m \mathrel{+}= T_h^{new}(x_m) - T_h^{pre}(x_m)$
     (minus the gridded subgrid change, when subgrid diffusion is on) —
     the I2ELVIS/PIC pattern: markers keep their advected temperature
     identity and absorb only the diffusion + source **increment**.
     Required for vigorous convection (Blankenbach-class) and for cold
     slabs that must not lose their thermal identity.
   - `mode = :overwrite`: $T_m = T_h(x_m)$ — markers track the FE field
     entirely. **Caveat:** combined with the default diffusion-only heat
     operator, temperature then does not advect at all; use `overwrite`
     only deliberately, e.g. together with `do_supg_heat = true` so the FE
     operator supplies the advection.

### Subgrid diffusion (Gerya & Yuen 2003)

With `do_subgrid_diffusion = true`, `apply_subgrid_diffusion!`
(`src/particles/Projection.jl`) relaxes each marker toward the
grid-interpolated temperature $T_n$ at the subgrid diffusion timescale:

```math
T_m \leftarrow T_n + (T_m - T_n)\,
\exp\bigl(-d\,\kappa\,\Delta t\,g_\mathrm{fac}\bigr),
\qquad
g_\mathrm{fac} = \frac{2}{\Delta x^2} + \frac{2}{\Delta y^2}
\Bigl(+ \frac{2}{\Delta z^2}\Bigr),
```

with $\kappa = k_c / (\rho_\mathrm{ref}\,c_{p,c})$ from the host cell and
the dimensionless coefficient $d =$ `subgrid_d` (default `1.0`). This
suppresses the marker–grid temperature inconsistency that otherwise
accumulates in PIC thermal convection and stalls it at fine grids. The
correction only acts in `pic_increment` mode and is restricted to uniform
Cartesian meshes.

The relaxed change $\delta T_m$ is then averaged to cells, L2-projected onto
the grid ($\delta T_h$, zero on Dirichlet walls) and subtracted from the
grid increment, so each marker receives

```math
T_m \leftarrow T_m + \delta T_m + \bigl[T_h^{new}(x_m) - T_h^{pre}(x_m)\bigr] - \delta T_h(x_m)
```

(`subgrid_scheme = "gerya_yuen"`, the default). The grid field built from
cell means is slightly biased by where markers sit inside their cells; the
subtraction cancels that systematic part, so only genuine sub-cell
deviations relax. The earlier implementation instead re-projected the
relaxed markers and diffused that field (`subgrid_scheme = "reproject"`,
kept only to reproduce old runs). It re-applied the projection bias every
step, which accumulated as a slow artificial drift: 20–57 K of lateral
temperature spread in a static stagnant lid, where the full scheme gives
0.1 K, and Blankenbach 1a at 65×65 off by −5.9 % in Nu and +4.6 % in
$V_\text{rms}$, where the full scheme gives −1.1 % and −0.15 %. Without
any subgrid diffusion, sub-cell marker temperature variance is never
diffused and PIC convection stalls, so the step itself is required.

### Bound-preserving clamp

Galerkin/BE produces small over/undershoots near sharp gradients
(sticky-air interface, slab tips) that compound over many PIC steps.
`_heat_clamp_bounds` (`src/time_stepping/Driver.jl`) computes per-step
bounds from the **pre-solve field range** united with the Dirichlet
endpoints, widened by a 5 % slack:

```math
[T_\mathrm{lo}, T_\mathrm{hi}] =
\bigl[\min(\min T^{n},\,T_\mathrm{top},\,T_\mathrm{bot}) - s,\;
\max(\max T^{n},\,T_\mathrm{top},\,T_\mathrm{bot}) + s\bigr],
\qquad
s = 0.05\,\lvert T_\mathrm{bot} - T_\mathrm{top}\rvert .
```

The rationale: by the maximum principle, pure BE diffusion cannot exceed
the pre-solve range; the slack admits legitimate source-driven growth
(shear/radiogenic/latent heating) per step. The same bounds are applied to
the FE dofs after the solve *and* to the marker temperatures in
`update_marker_temperatures!`, so grid and markers stay consistent.
(Clamping to the Dirichlet endpoints alone — an earlier scheme — flattened
internal anomalies hotter than the boundary range.)

## Time-step interaction

`compute_dt` (`src/time_stepping/CFL.jl`) limits $\Delta t$ by both the
advection CFL and a thermal-diffusion accuracy bound
$\Delta t \le \texttt{maxxystep}\cdot h^2 \rho c_p / k$ (BE is
unconditionally stable; the bound keeps the Fourier number small for
accuracy). See [Time stepping](../numerics/time_stepping.md).

## Key reference

| Config key | Default | Meaning |
|---|---|---|
| `do_heat` | `true` | solve the energy equation |
| `T_top`, `T_bot` | 273, 1623 K | Dirichlet surface / bottom temperature |
| `rho_ref_heat` | 3300 | constant $\rho$ in $\rho c_p$ (and in subgrid $\kappa$) |
| `marker_T_mode` | `"pic_increment"` | `pic_increment` (ΔT → markers) or `overwrite` (FE → markers) |
| `heat_stabilisation` | `"none"` | `none` (PIC) \| `supg` \| `entropy` |
| `do_supg_heat` | `false` | legacy alias for SUPG-stabilized FE advection |
| `do_subgrid_diffusion`, `subgrid_d` | `false`, `1.0` | Gerya–Yuen marker-grid relaxation |
| `subgrid_scheme` | `"gerya_yuen"` | `"gerya_yuen"` (subgrid change subtracted from the grid increment) or `"reproject"` (legacy, drifts) |
| `do_radiogenic`, `do_shear_heating`, `do_adiabatic` | `true`, `true`, `false` | source toggles |
| `H_const` | `0.0` | uniform extra source (W/m³) |
| `bcT_surface`, `bcT_deep` | `"dirichlet"` | `dirichlet` \| `flux` \| `insulating` \| `robin` |
| `q_surface`, `q_deep`, `h_robin`, `T_amb` | 0, 0, 0, 298.15 | flux / Robin BC data |
| `radiogenic_heating` (per `[[rock]]`) | — | $h_r$ (W/m³) |
| `specific_heat`, `thermal_conductivity` (per `[[rock]]`) | — | $c_p$, $k_0$ (harmonic cell mean for $k$) |
| `k_T_exponent`, `k_P_coeff`, `k_radiative` (per `[[rock]]`) | 0, 0, 0 | $k(T,P)$ (see [Thermal conductivity](#Thermal-conductivity)) |
