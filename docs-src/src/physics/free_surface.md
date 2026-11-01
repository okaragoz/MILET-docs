# Free surface

MILET offers two free-surface treatments, both built around a sticky-air
layer (`src/physics/FreeSurface.jl`):

1. **Sticky air** (default) — a finite layer of low-density, low-viscosity
   "air" on top of the lithosphere absorbs vertical motion of the rock
   surface while the Eulerian grid stays fixed (Crameri et al. 2012).
2. **ALE vertical mesh stretching** (`src/physics/ALEFreeSurface.jl`,
   optional, 2-D only) — the mesh top follows the surface-velocity field in
   the manner of Kaus, Mühlhaus & May (2010), on top of the sticky-air
   marker treatment.

Surface elevation is exported every output step as a topography VTU series
regardless of which treatment is active.

## Sticky air

The air occupies the top `air_thick` metres of the domain (the $y$ axis
points down, so the rock surface starts at $y =$ `air_thick`) and is an
ordinary `[[rock]]` entry — typically $\rho \approx 1\,\mathrm{kg/m^3}$ and
$\eta \approx 10^{18}\text{–}10^{19}\,\mathrm{Pa\,s}$ — identified by
`air_rock_id` (default rock 1). Two pieces of machinery make it behave as a
surface tracker:

- **Immobile air markers.** Setting `immobile = true` on the air rock makes
  the marker advection skip those markers
  (`rocks[Int(mk.rtype[m])].immobile && continue` in
  `src/particles/Advection.jl`): the air stays put while rock markers move
  through it, so the rock–air interface *is* the free surface. Reseeding
  (`src/particles/Reseed.jl`) refills cells with air markers using
  `air_rock_id` when no donor marker is available.
- **Surface boundary condition.** The top wall carries no-slip as a proxy for
  free-slip; the deformable rock surface lives inside the domain and the
  sticky air absorbs the difference (`src/boundary_conditions/Velocity.jl`).

**Resolution requirement.** `check_sticky_air_thickness(cfg, mb)` warns when
the layer is thinner than 4 cells, the minimum recommended by Crameri et
al. (2012) for "drunken-sailor"-free surface tracking; `check_config_sanity`
(`src/io/UserHelpers.jl`) additionally warns when `do_free_surface = true`
but `air_thick = 0`.

`smooth_air_interface!` is reserved for Crameri–Kaus-style diffusion of the
marker interface; in the current code it is a documented no-op placeholder
(the `surface_smooth` key instead drives the ALE smoothing below).

## ALE free surface (`do_ale_free_surface = true`)

The ALE option tracks a 1-D surface-height field $h(x)$ — one entry per
$x$ grid line, positive $h$ meaning the surface has risen above its initial
level — and deforms the mesh to follow it. Each step the driver
(`src/time_stepping/Driver.jl`, after the AMR block, 2-D only) runs:

1. **Sample** $v_y(x, y_\text{surf})$ at every top-row node from the solved
   velocity (`_sample_vy_at_surface`).
2. **Advance** the height field with the Kaus (2010) implicit relaxation
   (`update_surface_height`):

   ```math
   h^{n+1}_i = h^n_i + \frac{\Delta t\,(-v_{y,i})}
   {1 + \theta\, \dfrac{g\,\Delta\rho_\text{max}\,\Delta t^2}{\eta_\text{ref}\,\Delta x}},
   ```

   where $\theta$ = `fs_stabilisation` $\in [0,1]$ (0 = explicit, 0.5–1 =
   strong damping). The explicit update ($\theta = 0$) is unconditionally
   unstable at high CFL — the drunken-sailor oscillation; the denominator is
   the Kaus stability factor with $\Delta\rho_\text{max}$ taken as
   `rho_ref_heat` and $\eta_\text{ref}$ as `eta_max`.
3. **Smooth** horizontally (Crameri-style low-pass) when
   `surface_smooth` $= w_s > 0$:

   ```math
   h_i \leftarrow (1-w_s)\,h_i + \tfrac{w_s}{2}\,(h_{i-1} + h_{i+1}).
   ```

4. **Rebuild the mesh** (`build_mapped_model`) as a
   `CartesianDiscreteModel` with a vertical-stretch map that pins the bottom
   and puts the top at $y = -h(x)$:

   ```math
   y_\text{phys} = Y - h(X)\left(1 - \frac{Y}{y_\text{size}}\right),
   ```

   with $h(X)$ linearly interpolated between grid lines.
   `rebuild_mb_with_ale` re-applies the standard boundary tags
   (`left`/`right`/`surface`/`deep`, plus `front`/`back` in 3-D) and
   rebuilds the triangulation and measures.
5. **Transfer state**: velocity, pressure and temperature
   (`state.uh`, `state.ph`, `state.Th`, `state.Th_old`) are interpolated
   onto the deformed mesh with the NaN-safe `_safe_fe_transfer` — the same
   `Interpolable` machinery used by [AMR](../numerics/amr_ale.md) — and the
   markers are re-projected (`project_markers_to_cells!`).

The ALE update runs only when `cfg.dim == 2` and `dt > 0`; the height array
`h_surface` has `cfg.nx` entries and starts at zero. With profiling enabled,
its cost appears as the `ale=` column of the per-step `PROFILE` line.

## Topography output

`write_topography_vtu` (`src/io/VTK.jl`) writes a 1-D polyline along the
surface at every output step (`output_every`), collected into
`topography.pvd` next to `solution.pvd` and `markers.pvd`. The surface is
measured directly from the markers, so it works with both treatments:

- the $x$ axis is split into `n_bins = max(2 nₑₗ,ₓ, 64)` bins;
- in each bin the *highest* (smallest $y$) marker whose rock type is not
  `air_rock_id` defines the surface; empty bins default to the initial
  surface $y =$ `air_thick`;
- the point data field `elevation_m` is

  ```math
  e(x) = \texttt{air\_thick} - y_\text{topo}(x),
  ```

  positive for uplift, negative for subsidence, so ParaView's diverging
  colour maps read naturally.

## Configuration

| Key | Section | Default | Meaning |
|---|---|---|---|
| `do_free_surface` | `[physics]` | `true` | enable sticky-air surface tracking (sanity checks + diagnostics) |
| `air_thick` | case geometry (e.g. `[subduction]`) | `10e3` (loader); `40000.0` in `_defaults.toml` | sticky-air layer thickness (m); rock surface starts at this depth |
| `air_rock_id` | `[free_surface]` | `1` | rock id of the sticky air (skipped by topography binning, used by reseeding) |
| `immobile` | per `[[rock]]` | `false` | set `true` on the air rock so its markers are not advected |
| `do_ale_free_surface` | `[free_surface]` | `false` | enable the Kaus-style vertical-stretch ALE surface (2-D only) |
| `fs_stabilisation` | `[free_surface]` | `0.5` | implicit relaxation $\theta$ in the Kaus stability factor |
| `surface_smooth` | `[free_surface]` | `0.0` | Crameri horizontal smoothing weight $w_s$ for the ALE height field |

(TOML sections are flattened by `_flatten_sections` in
`src/io/TOMLLoader.jl`, so these keys are recognized from any section; the
table shows where they live in `cases/_defaults.toml`.)

```toml
[physics]
do_free_surface = true

[free_surface]
do_ale_free_surface = false   # true → vertical mesh stretch (Kaus 2010)
fs_stabilisation    = 0.5     # implicit damping (0 = none, 1 = strong)
surface_smooth      = 0.0     # Laplacian smoothing of the ALE topography
air_rock_id         = 1

[[rock]]                      # rock 1: sticky air
reference_density = 1.0
eta0              = 1e18
immobile          = true
```

## Related pages

- [AMR & ALE](../numerics/amr_ale.md) — the mesh-rebuild and FE-transfer
  machinery the ALE surface reuses.
- [Markers](../numerics/markers.md) — marker advection, reseeding and
  projection.
- [Governing equations](./governing_equations.md) — the Stokes problem whose
  surface boundary condition the sticky air regularizes.
- [Parameter file](../reference/parameter_file.md) — full key reference.
