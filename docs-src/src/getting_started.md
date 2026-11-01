# Getting started

## Requirements

- **Julia ≥ 1.10** (see the `[compat]` block in `Project.toml`).
- All dependencies are registered packages, pinned by the shipped
  `Manifest.toml`: Gridap 0.20, MUMPS.jl, MPI.jl, WriteVTK, and the optional
  PETSc stack (PETSc.jl, GridapPETSc, GridapSolvers).
- **MPI** is initialised unconditionally (`MPI.Init()` in `main.jl`) because
  MUMPS requires it, but runs are single-process — no `mpiexec` needed. The
  repository ships a `LocalPreferences.toml` that selects the bundled
  `MPICH_jll` binary, so MPI works out of the box.
- Shared-memory **threading** parallelises the marker-side work (projection,
  advection, per-marker rheology and grain-size updates): start Julia with
  `-t auto` to use all cores.

## Installation

```bash
git clone https://github.com/okaragoz/MILET
cd MILET
julia --project=. -e 'using Pkg; Pkg.instantiate()'
```

`Pkg.instantiate()` resolves the pinned manifest and downloads the binary
artifacts (MPICH, MUMPS, PETSc) on first use. There is no package to build:
MILET is a flat-include code — `main.jl` includes everything under `src/` in
dependency order and then runs the case.

## Running a case

```bash
julia -t auto --project=. main.jl cases/falling_block.toml
```

- Without an argument, `main.jl` defaults to `cases/subduction.toml`.
- The case TOML is **deep-merged onto `cases/_defaults.toml`** by
  `load_config_toml` (`src/io/TOMLLoader.jl`), so a case file only specifies
  what differs from the defaults. Every key is documented in the
  [parameter-file reference](reference/parameter_file.md).
- `select_case` (`src/io/UserHelpers.jl`) maps the `[model] case` name to the
  initial geometry and temperature functions; an unknown name falls back to
  the data-driven `[[layer]]`/`[[init_T]]` path. Worked setups are catalogued
  in [Examples by tectonic regime](#examples-by-tectonic-regime) below.
- All output goes to the directory set by `[output] dir`
  (e.g. `output/falling_block`).

While running, each time step prints a one-line summary (from
`record_step!` in `src/io/Diagnostics.jl`):

```
step=    7  t=    0.061 Myr  dt=  9863.0 yr  vmax=  2.952 cm/yr  T=  273..1623 K  ε̇max=4.51e-15  σmax=58.3 MPa  Picard=3/4.2e-04/✓
```

`Picard=iters/rel/flag` reports the nonlinear loop: iterations taken, final
relative velocity update, and `✓` (converged below `[fe] picard_tol`),
`max` (hit `[fe] n_picard`), or `—`.

## Output files

With `[output] every = N`, MILET writes a snapshot every `N` steps (and
always at step 1) into the output directory:

| File | Written by | Content |
|---|---|---|
| `solution_NNNNN.vtu` + `solution.pvd` | `write_grid_vtu` (`src/io/VTK.jl`) | FE fields and per-cell rheology on the grid |
| `markers_NNNNN.vtu` + `markers.pvd` | `write_markers_vtu` (`src/io/VTK.jl`) | the marker point cloud |
| `topography_NNNNN.vtu` + `topography.pvd` | `write_topography_vtu` (`src/io/VTK.jl`) | surface polyline with elevation |
| `bench.csv` | `write_bench_csv` (`src/io/Diagnostics.jl`) | integral convection observables (when `do_heat = true`) |
| `run.log` | `record_step!` (`src/io/Diagnostics.jl`) | per-step diagnostics, one row per step |
| `checkpoint_NNNNN.bin` | `save_checkpoint` (`src/io/Checkpoint.jl`) | restart snapshots (when `[checkpoint] every > 0`) |

The three `.pvd` collection files index the `.vtu` snapshots for ParaView's
animation slider; their `timestep` values are in **years**.

### Grid fields (`solution_*.vtu`)

FE solutions and cell-wise material state, in both SI and "ParaView-handy"
units: `pressure_Pa` / `pressure_MPa`, `velocity_m_s` / `velocity_cm_yr` /
`velocity_magnitude_cm_yr`, `divergence_velocity_1_s` (continuity residual
$\nabla\cdot\mathbf{u}$), `temperature_K` / `temperature_C`,
`strain_rate_II_1_s` / `log10_strain_rate_1_s`, `stress_II_Pa` /
`stress_II_MPa`, `viscosity_Pa_s` / `log10_viscosity_Pa_s`,
`density_kg_m3`, `specific_heat_J_kg_K`, `thermal_conductivity_W_m_K`,
`radiogenic_heating_W_m3`, `elastic_chi`, and `rock_type` (per-cell majority
vote of the markers — a sharp material map next to the smoothed $\eta$, $\rho$
fields).

### Marker fields (`markers_*.vtu`)

One poly-vertex cloud with per-marker scalars: `rock_type`, `layer_id`,
`temperature_K` / `temperature_C`, `depth_km`, `plastic_strain`,
`melt_fraction`, `phase_drho_kg_m3` (phase-change density increment),
`grain_size_mm`, the stress components `sxx` / `syy` / `sxy` (Pa and MPa),
`stress_II_Pa` / `stress_II_MPa`, and `viscosity_Pa_s` /
`log10_viscosity_Pa_s` (host-cell lookup of the projected cell viscosity,
which already includes plasticity, melt, and reaction softening).

### Topography (`topography_*.vtu`)

A polyline of the highest non-air marker per x-bin, carrying `elevation_m`
relative to the initial surface: **positive = uplift, negative =
subsidence**. The line is drawn in raw model coordinates, consistent with
the solution and marker files.

### `run.log` columns

One row per step (header written by `open_diagnostics`):

```
# step  time_yr  dt_yr  vmax_cm_yr  Tmin_K  Tmax_K  eii_max_1_s  sii_max_MPa  melt_vol_frac  slab_depth_km  picard_iters  picard_rel  picard_ok
```

| Column | Meaning |
|---|---|
| `step` | time-step index |
| `time_yr`, `dt_yr` | cumulative model time and step size (years) |
| `vmax_cm_yr` | max velocity-DOF magnitude (cm/yr) |
| `Tmin_K`, `Tmax_K` | temperature extrema over the FE DOFs |
| `eii_max_1_s` | max second strain-rate invariant $\dot\varepsilon_{II}$ (1/s) |
| `sii_max_MPa` | max second stress invariant $\sigma_{II}$ (MPa) |
| `melt_vol_frac` | mean marker melt fraction $F$ |
| `slab_depth_km` | deepest slab marker within 700 km east of `trench_x` (subduction cases; 0 otherwise) |
| `picard_iters`, `picard_rel`, `picard_ok` | nonlinear iterations, final relative update, converged flag (1/0); `picard_rel = -1` if no solve ran |

The marker-scan columns and the simulation-health checks (non-finite DOFs,
velocity explosion > 100× between checks, $T$ outside the Dirichlet bounds by
more than 20 %, $\dot\varepsilon_{II} > 1\,\mathrm{s^{-1}}$) run every
`[output] diagnostics_every` steps; skipped steps re-log the last values so
the column layout never changes.

### `bench.csv` columns

Appended at every output step when `do_heat = true` — the integral
observables used by the convection benchmarks
([Benchmarks](reference/benchmarks.md)):

```
step,time,Nu,Vrms,Vsurf,mobility,mean_T
```

| Column | Definition |
|---|---|
| `time` | model time in **seconds** |
| `Nu` | Nusselt number $Nu = \langle \partial T/\partial y\,\rvert_{y=0} \rangle\, H/\Delta T$ (with $y$ down, the cold top is $y=0$; Blankenbach 1a reference: 4.884) |
| `Vrms` | $\sqrt{\int \mathbf{u}\cdot\mathbf{u}\,d\Omega / \lvert\Omega\rvert}$ (m/s) |
| `Vsurf` | surface RMS velocity $\sqrt{\int \mathbf{u}\cdot\mathbf{u}\,d\Gamma_\mathrm{top} / \lvert\Gamma_\mathrm{top}\rvert}$ |
| `mobility` | $M = V_\mathrm{surf}/V_\mathrm{rms}$ — $M \gtrsim 1$ mobile lid, $M \ll 1$ stagnant lid |
| `mean_T` | volume-mean temperature $\int T\,d\Omega/\lvert\Omega\rvert$ (K) |

## Viewing results in ParaView

**Coordinate convention: $y$ is depth, positive downward.** The geological
surface is at $y = 0$ (or at $y =$ `air_thick` below a sticky-air layer) and
$y$ = `ysize` is the model bottom; gravity is `gy = +9.81`. Solution,
marker, and topography files all use these raw model coordinates.

1. Open `output/<case>/solution.pvd` (and `markers.pvd`, `topography.pvd`).
   The `.pvd` collections drive the animation slider; timestep values are
   years.
2. **Set the camera so $-Y$ is up**, otherwise the model renders upside
   down. Use the *Adjust Camera* dialog (camera icon in the render-view
   toolbar) and set the view-up vector to `(0, -1, 0)`; for 2-D cases (data
   in the $z = 0$ plane) also place the camera at negative $z$ so $x$ still
   increases to the right. Equivalent Python-shell snippet:

   ```python
   v = GetActiveView()
   v.CameraViewUp   = [0, -1, 0]
   v.CameraPosition = [v.CameraFocalPoint[0], v.CameraFocalPoint[1], -abs(v.CameraPosition[2])]
   Render()
   ```

   (Alternatively apply a *Transform* filter with scale `(1, -1, 1)`, at the
   cost of negated $y$ coordinates in probes and plots.)
3. Useful defaults: colour the solution by `log10_viscosity_Pa_s` or
   `temperature_C`; colour by `rock_type` with a categorical colour map for
   the material layout; render `markers.pvd` with the **Point Gaussian**
   representation; colour `topography.pvd` by `elevation_m` (positive =
   uplift).

## Examples by tectonic regime

Worked setups for the major tectonic regimes live under **Examples** in the
sidebar — one page per regime, each with the fully-commented case TOML embedded
inline. They are grouped by the dominant kinematics:

**Horizontal / plate regimes** — [Subduction](examples/subduction.md),
[Continental collision](examples/collision.md),
[Continental rifting](examples/rifting.md),
[Mid-ocean ridge spreading](examples/ridge.md),
[Transform / strike-slip](examples/transform.md),
[Transtension / transpression](examples/transtension.md).

**Vertical / intraplate regimes** —
[Lithospheric drip & delamination](examples/drip.md),
[Stagnant lid](examples/stagnant_lid.md),
[Mantle plumes / hotspots](examples/plume.md),
[Sagduction](examples/sagduction.md),
[Plutonic squishy / sluggish lid](examples/squishy_lid.md).

Cases under `cases/` are the maintained, benchmarked setups; the ones marked
**Starter template** live under `cases/examples/` and are heavily-commented
starting points on the data-driven `[[layer]]`/`[[init_T]]` path (see the
[parameter-file reference](reference/parameter_file.md)) — runnable, but meant
to be tuned before production.

## Checkpoint / restart

```toml
[checkpoint]
every   = 50      # snapshot every 50 steps (0 = disabled)
restart = false   # true: resume from the latest checkpoint in [output] dir
```

`save_checkpoint` serialises the full state (FE DOF vectors, per-cell arrays,
the complete marker set including grain size and porosity) to
`checkpoint_NNNNN.bin`. With `restart = true`, `run_case` calls
`load_latest_checkpoint` on the output directory and resumes from the most
recent snapshot — see `src/io/Checkpoint.jl` and
[Time stepping](numerics/time_stepping.md).

## Running the tests

```bash
julia --project=. test/runtests.jl                    # smoke tests
RUN_BENCHMARKS=1 julia --project=. test/runtests.jl   # + SolCx, falling block, plume, Blankenbach
```

The smoke suite covers rheology, mesh/FE-space construction, phase change and
melting, grain-size evolution, softening/healing, the GMG solver, and the
two-phase $\phi \to 0$ regression gate — see [Testing](dev/testing.md).

## Building this documentation

```bash
julia --project=docs -e 'using Pkg; Pkg.instantiate()'
julia --project=docs docs/make.jl          # full site build
julia --project=docs docs/make.jl serve    # dev server with live reload
```

## Where to go next

- [Governing equations](physics/governing_equations.md) — the physics and
  its weak forms
- [Parameter file](reference/parameter_file.md) — every TOML key, with units
  and defaults
- [Examples by tectonic regime](#examples-by-tectonic-regime) — worked
  setups grouped by plate and intraplate regime
- [Linear solvers](numerics/solvers.md) and
  [Geometric multigrid](numerics/multigrid.md) — choosing `mumps` vs `gmg`
