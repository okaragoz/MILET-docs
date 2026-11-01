# Testing

## Running the suite

The test runner is a plain script, not a `Pkg.test` target:

```bash
julia --project=. test/runtests.jl                    # smoke tests only
RUN_BENCHMARKS=1 julia --project=. test/runtests.jl   # smoke + short benchmarks
```

`test/runtests.jl` replicates the `main.jl` include list (so `MPI.Init()` is
called exactly once, guarded by `MPI.Initialized()`), defines
`const ROOT = abspath(joinpath(@__DIR__, ".."))`, and then `include`s the
smoke files. Everything runs in **one Julia process and one namespace**:
later test files can use helpers defined by earlier ones (e.g. the
`_test_rock` keyword constructor from `test/smoke/test_rheology.jl` is used
by `test_grainsize.jl` and `test_softening.jl`). Threads are optional but
exercise the production marker kernels: `julia --project=. -t 4
test/runtests.jl`.

Tests that run full cases write to `output/...` directories; these are
scratch artifacts, safe to delete.

## What each testset covers

### Smoke tests (always run)

| File | Testsets | Covers |
|---|---|---|
| `test/smoke/test_rheology.jl` | *Rheology pointwise*, *Density* | `compute_viscosity` (constant-Newtonian identity, Arrhenius ∂η/∂T < 0, Drucker–Prager yield cap, strain-weakening ramp monotonicity), `compute_VEP_viscosity` (0 < Z ≤ 1, χ + Z = 1, η_VEP ≤ η_viscous), `compute_density` (reference value, expansivity sign, linear `phase_drho` stacking). Also defines `_test_rock`. |
| `test/smoke/test_mesh.jl` | *Mesh — 2D Cartesian + tags*, *Mesh — 3D Cartesian (synthetic config)* | `build_model` cell counts and `cell_dx`/`cell_dy` against `cfg.xsize/(nx-1)`, 3-D construction via `clone_config(...; dim = 3, ...)`. |
| `test/smoke/test_fespaces.jl` | *FE spaces — Taylor-Hood Q2-Q1 + Q1 T* | `build_spaces` DOF sanity (velocity > pressure DOFs, temperature space nonempty) and that `State(mb, fes, cfg)` constructs with matching `n_cells`. |
| `test/smoke/test_phase_melt.jl` | *Phase change: depth-triggered*, *Melting: Katz-lite solidus/liquidus* | `apply_phase_change!` crossing logic (rock-type switch + Δρ at the 410 km trigger, no-op above it), `melt_fraction` endpoints and mid-range bracket. |
| `test/smoke/test_grainsize.jl` | *growth-only analytic*, *wattmeter steady state (p = 3)*, *composite rheology + regression*, *mechanism partition consistency* | `update_grain_size` against the closed-form growth ODE, convergence of the Austin–Evans wattmeter to `grain_size_steady_state` from above and below, harmonic diffusion+dislocation composite vs the single-mechanism regression, `viscous_mechanism_partition` consistency (see `doc/design/grain_size.md` and [Grain-size evolution](../physics/grain_size.md)). |
| `test/smoke/test_softening.jl` | *healing decay*, *viscous strain softening ramp*, *configurable yield cap*, *yielded flag* | Arrhenius healing timescale, `visc_soft_factor` ramp endpoints, `yield_stress_max` capping at depth, and the yield flag returned by `compute_VEP_viscosity` (see `doc/design/softening_healing.md` and [Softening & healing](../physics/softening.md)). |
| `test/smoke/test_eclogite.jl` | *Eclogite: flow-law catalogue + aliases*, *composite creep + granulite→eclogite blend*, *loader keys + example case* | New `FLOW_LAWS` entries and the `_COH1000` aliases, the constant-grain-size diffusion+dislocation composite (clamp applied to the composite), the `eclogite_flow_law` log-blend limits (X = 0, 1, ½ geometric mean, clamp of X), `grain_size_mm` → `grain_init`, and loading `cases/venus_eclogite_foundering.toml`. |
| `test/smoke/test_gmg.jl` | *GMG V-cycle: variable-viscosity Q2 vector Laplacian*, *GMG V-cycle: 3D Q2 hierarchy*, *GMG Stokes: matches direct solve* | `build_gmg_hierarchy` level/transfer shapes, 8-cycle residual contraction (< 0.5 mean rate) on a 4-decade viscosity contrast, `gmg_update!` value refresh on a fixed pattern, 3-D hierarchy construction, and FGMRES+GMG vs MUMPS velocity agreement (rel. diff < 2e-3) over a 2-iteration Picard solve — `n_picard = 2` deliberately exercises `assemble_stokes_cached!`, the MUMPS numeric-only refactorization, and `gmg_update!`, the paths production runs live on (see [Geometric multigrid](../numerics/multigrid.md)). |
| `test/smoke/test_twophase.jl` | *Two-phase: closures*, *Two-phase: φ=0 reduces to single-phase Stokes* | `permeability`, `inv_compaction_viscosity`, `melt_weakened_viscosity`, `compaction_length`, and the gate that `solve_twophase!` at zero porosity reproduces `picard_stokes!` velocities (see `doc/design/two_phase_flow.md` and [Two-phase flow](../physics/two_phase.md)). |

### Benchmarks (gated by `RUN_BENCHMARKS`)

The four short benchmark runs are real `run_case` invocations and take
minutes, so `test/runtests.jl` includes them only when
`ENV["RUN_BENCHMARKS"] == "1"`:

| File | What it runs / asserts |
|---|---|
| `test/benchmarks/run_solcx.jl` | SolCx (`cases/solcx.toml`) with the analytic `rho_field_solcx`/`eta_field_solcx` overrides; finite velocity DOFs and a bounded `|v|_max` bracket. |
| `test/benchmarks/run_falling_block.jl` | Falling block, 50 steps; finite DOFs, nonzero sinking velocity. |
| `test/benchmarks/run_plume.jl` | Plume, shortened to 20 steps via `clone_config`; finite DOFs. |
| `test/benchmarks/run_blankenbach.jl` | Blankenbach 1A, 50 steps; `nusselt` and `vrms` finite (reference values Nu ≈ 4.884, Vrms ≈ 42.86 are logged, not asserted at this length). |

Quantitative pass/fail against reference values is the job of the longer
studies below; the gated benchmarks only guard against regressions that
break a full coupled run. See [Benchmarks](../reference/benchmarks.md) for
the published comparisons.

### Longer studies (run manually, not part of the suite)

These scripts `include(main.jl)` themselves and are launched standalone:

```bash
julia --project=. test/validation/solcx_convergence.jl        # nx = 33/65/129 order estimate
julia --project=. test/validation/blankenbach_convergence.jl  # Nu, Vrms vs nx = 41/61/81
julia --project=. test/long_bench.jl                          # 4-case laptop-budget sweep (~30-45 min)
```

`test/performance/solver_2d.jl` (*Performance: MUMPS scaling (2D)*) is an
informational scaling probe at nx = 21/41/81; it expects the `ROOT` constant
and source graph from `runtests.jl`, so `include` it from a session that has
already run the suite.

## MPI: serialize concurrent Julia runs

Every MILET process — `main.jl`, `test/runtests.jl`, and the validation
scripts alike — calls `MPI.Init()` at load time because MUMPS requires an
MPI communicator (the binding is pinned to `MPICH_jll` in
`LocalPreferences.toml`). The process is a single-rank MPI "singleton"; no
`mpiexec` is involved.

**Do not launch multiple MILET Julia processes concurrently from the same
working tree.** Run the test suite, benchmarks, and validation scripts one
at a time. Two concurrently initializing MPICH singletons on one machine can
interfere with each other, and the failure mode is ugly rather than clean:
MUMPS factorization handles perform *collective* MPI calls in their
destructors, so a process whose MPI state has been disturbed (or torn down
in the wrong order) dies via `abort()` with exit code 1 and its buffered
stdout discarded — see the `_MUMPS_LIVE` registry and
`finalize_mumps_contexts!` in `src/solvers/Mumps.jl`, and the matching
comment at the entry point of `main.jl`. Concurrent runs of the same case
would additionally race on the shared `output/<case>/` directories
(checkpoints, PVD series, `run.log`).

If you need to compare configurations, run them sequentially in one session
(the pattern used by `test/long_bench.jl`) or use distinct machines.

## Adding a test

1. Create `test/smoke/test_<topic>.jl`. Use `using Test` and one or more
   `@testset` blocks; everything from `src/` is already in scope.
2. Append an `include(joinpath(@__DIR__, "smoke", "test_<topic>.jl"))` line
   to the smoke list in `test/runtests.jl` — files run in list order, so put
   it after any file whose helpers you reuse.
3. Conventions worth following:
   - Build configurations from a shipped case plus overrides, never by
     positional `Config` construction:
     `cfg = clone_config(load_config_toml(joinpath(ROOT, "cases/falling_block.toml")); nx = 25, ny = 25, ntot = 1, ...)`.
     `clone_config` (`src/io/TOMLLoader.jl`) keeps tests immune to `Config`
     field growth.
   - Likewise build `RockProp`s with the keyword `_test_rock` helper from
     `test/smoke/test_rheology.jl` rather than positionally.
   - Keep smoke tests at toy resolutions (≤ 33² mesh, `ntot = 1`,
     `n_picard = 1`) — the suite should stay in the minutes range. Anything
     that needs a long run belongs behind the `RUN_BENCHMARKS` gate or in
     `test/validation/`.
   - Point any file output at a throwaway directory, e.g.
     `output_dir = "output/_test_<topic>"`.
   - Prefer analytic identities and limits (the φ = 0 two-phase gate, the
     grain-growth closed form) over golden numbers; when a reference value
     exists, log it with `@info` and assert a tolerance you can defend.
4. For a new gated benchmark, add the file under `test/benchmarks/` and
   include it inside the `if get(ENV, "RUN_BENCHMARKS", "0") == "1"` block
   of `test/runtests.jl`.

Related: [Architecture](architecture.md) for the include graph the runner
replicates, and the case files under `cases/` for the TOML definitions the
tests load.
