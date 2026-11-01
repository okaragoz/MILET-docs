# Compressibility

MILET has two ways to treat the compressibility of rock:

- **Boussinesq** (`formulation = "boussinesq"`, the default). The flow is
  incompressible, $\nabla\cdot\mathbf{u} = 0$, and compressibility enters
  only through the buoyancy. Each marker's density follows the rock's
  equation of state at lithostatic pressure,

  ```math
  \rho = \rho_0\,\bigl(1 - \alpha\,(T - T_\mathrm{ref})\bigr)\,\bigl(1 + \beta\,(P - P_\mathrm{ref})\bigr),
  ```

  with the per-rock keys `reference_density` ($\rho_0$),
  `thermal_expansion` ($\alpha$) and `compressibility` ($\beta$, 1/Pa).
  The energy equation uses the constant `rho_ref_heat`, and there is no
  adiabatic heating unless `do_adiabatic` is set.
- **TALA** (`formulation = "tala"`). One adiabatic reference state is used
  in the mass, momentum and energy equations, as described below. This is
  the consistent compressible option for convection with a significant
  dissipation number.

ALA, the full anelastic approximation with a dynamic-pressure density
term, is not implemented. `formulation = "ala"` stops with an error.

## TALA


`formulation = "tala"` (in `[rheology]`) replaces the Boussinesq equations
with the truncated anelastic liquid approximation of King et al. (2010).
One adiabatic reference state (`src/physics/ReferenceState.jl`), with $y$
the depth,

```math
\bar\rho(y) = \rho_0\,\exp\!\Bigl(\frac{\alpha_r g\,y}{\gamma_r c_p}\Bigr),
\qquad
\bar T(y) = T_0\,\exp\!\Bigl(\frac{\alpha_r g\,y}{c_p}\Bigr),
```

from the keys `ref_rho0`, `ref_T0`, `ref_alpha`, `ref_cp`, `ref_gamma`, is
used in all three equations:

```math
\nabla\cdot(\bar\rho\,\mathbf{u}) = 0,
\qquad
\nabla\cdot\bigl(2\eta\dot\varepsilon - \tfrac23\eta(\nabla\cdot\mathbf{u})\mathbf{I}\bigr) - \nabla p
= \bar\rho\,\alpha\,(T - \bar T)\,\mathbf{g},
```

```math
\bar\rho\,c_p\,\frac{DT}{Dt} = \nabla\cdot(k\nabla T) + \bar\rho\,\alpha\,g\,u_y\,T + \tau\!:\!\dot\varepsilon + H .
```

- **Mass:** `build_stokes_forms` tests $-q\,(\bar\rho\,\nabla\cdot\mathbf{u} + \mathbf{u}\cdot\nabla\bar\rho)$, with $\nabla\bar\rho$ exact.
- **Buoyancy:** the marker density is taken about the reference state, $\rho = (\bar\rho/\rho_0)\,\rho_\mathrm{rock}(T;\ T_\mathrm{ref} = \bar T(y),\ P = 0)$. A reference-rock marker on the adiabat therefore has exactly $\bar\rho(y)$, and the dynamic-pressure contribution to density is dropped (TALA).
- **Energy:** $\rho c_p$ uses $\bar\rho(y)$ in place of `rho_ref_heat`. Adiabatic heating $\bar\rho\alpha g u_y T$ belongs to the formulation and is always on. Shear heating is the full deviatoric $2\eta(\varepsilon\!:\!\varepsilon - \tfrac13(\nabla\cdot\mathbf{u})^2)$ at the quadrature points.

The dissipation number of a box of depth $H$ is $Di = \alpha_r g H / c_p$.
Verification against King et al. (2010) is in
[Benchmarks](../reference/benchmarks.md#King-et-al.-2010-—-TALA-compressible-convection).
For planetary models, set `ref_T0` to the mantle potential temperature and
`T_bot` to $\bar T$ at the box floor. The `[[init_T]]` profiles
`hsc_adiabat` and `steady_lid` build lids on that adiabat (see
[Parameter file](../reference/parameter_file.md#init_T-—-initial-temperature-regions-data-driven)).

## Reference-state keys

| Key | Default | Meaning |
|---|---|---|
| `formulation` | `"boussinesq"` | `"tala"` switches on everything on this page |
| `ref_T0` | `T_top` | $T_0$, reference temperature at $y = 0$ (K) |
| `ref_rho0` | rock 1 `reference_density` | $\rho_0$, reference density at $y = 0$ (kg/m³) |
| `ref_alpha` | rock 1 `thermal_expansion` | $\alpha_r$ (1/K) |
| `ref_cp` | rock 1 `specific_heat` | $c_p$ (J/kg/K) |
| `ref_gamma` | 1.0 | Grüneisen parameter $\gamma_r$ |

The keys can go in any section; the bundled cases put them under
`[physics]`. A planetary model typically looks like this:

```toml
[rheology]
formulation = "tala"

[physics]
ref_T0    = 1600.0     # mantle potential temperature (K)
ref_rho0  = 3300.0
ref_alpha = 3e-5
ref_cp    = 1250.0
ref_gamma = 1.2

[temperature]
T_bot = 1869.0         # T0 exp(alpha g H / cp) at the floor (g = 9.81, H = 660 km)
```

## Source

`src/physics/ReferenceState.jl` (reference state, marker density, $\rho$ in
the energy equation), `src/physics/Stokes.jl` (mass and compressible
stress), `src/physics/Gravity.jl` (buoyancy) and `src/physics/HeatSources.jl`
(adiabatic and shear heating).

## Reference

King, S. D., Lee, C., van Keken, P. E., Leng, W., Zhong, S., Tan, E.,
Tosi, N., & Kameyama, M. C. (2010). A community benchmark for 2-D
Cartesian compressible convection in the Earth's mantle. *Geophys. J.
Int.*, 180, 73–87.
