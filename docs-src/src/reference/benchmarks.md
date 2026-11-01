# Benchmarks and verification

MILET's verification story has three layers: fast **smoke tests** that pin
the pointwise physics to analytic results, **solver gates** that require the
iterative and reduced formulations to reproduce the direct/reference
solution to tight tolerances, and **community benchmarks** (SolCx,
Blankenbach, King et al. 2010, Glerum, Busse) with published reference values. Everything
below lives in `test/` and runs against the same source files as production
(`test/runtests.jl` includes the identical module graph as `main.jl`).

```bash
# smoke + solver gates (minutes)
julia --project=. test/runtests.jl

# additionally run the short physics benchmarks
RUN_BENCHMARKS=1 julia --project=. test/runtests.jl

# convergence studies (longer)
julia --project=. test/validation/solcx_convergence.jl
julia --project=. test/validation/blankenbach_convergence.jl

# laptop-budget long bench (≈ 30–45 min)
julia --project=. test/long_bench.jl
```

## SolCx — variable-viscosity Stokes convergence

`test/validation/solcx_convergence.jl` runs the SolCx benchmark (Duretz et
al. 2011) — a sharp 10⁶ viscosity jump at x = 0.5 with the analytic body
force $\rho g_y = \sin(\pi y)\cos(\pi x)$ and free-slip walls — at
nx = 33, 65, 129 and estimates the convergence order of $|v|_{\max}$ by
Richardson extrapolation between successive refinements (h halves → an
error ratio of 4 implies second order). The reference peak velocity is
$|v|_{\max} \approx 6.9\times10^{-9}$. The case definitions are
`cases/solcx.toml` and the fixed-resolution series
`cases/solcx_fixed_n24…n128.toml`; the short gated variant
(`test/benchmarks/run_solcx.jl`, `RUN_BENCHMARKS=1`) asserts finiteness and
brackets `vmax`. Because the viscosity jump is **element-aligned** for even
cell counts, this benchmark exercises exactly the discontinuous-coefficient
regime the Q2/Q1 Taylor–Hood pair (see
[Discretization](../numerics/discretization.md)) must handle.

## Blankenbach 1A — thermal convection references

`test/validation/blankenbach_convergence.jl` runs Case 1A of Blankenbach et
al. (1989) — isoviscous Ra = 10⁴ convection, nondimensional unit box — at
nx = 41/61/81 to quasi-steady state and compares against the canonical
steady-state references:

```math
\mathrm{Nu} = 4.884, \qquad V_{\rm rms} = 42.86.
```

Both diagnostics are FE-integral-accurate (`nusselt` and `vrms` in
`src/io/Diagnostics.jl`): Nu is computed as
$\mathrm{Nu} = \langle \partial T/\partial y\rvert_{y=0}\rangle\, H/\Delta T$
(positive in MILET's y-down convention) over the surface boundary measure,
and $V_{\rm rms} = \sqrt{\int u\cdot u\, d\Omega / |\Omega|}$. The script
prints the percent error per resolution. The benchmark validates the entire
PIC heat-transport loop — `marker_T_mode = "pic_increment"` (markers carry
and advect temperature, the FE step supplies the diffusion increment) plus
the `buoyancy_from_T` Stokes coupling. The `cases/blankenbach_sg_n41/65/97`
series repeats the study with Gerya & Yuen (2003) subgrid diffusion enabled
(`do_subgrid_diffusion = true`). The 3D analogue is `cases/busse_1a.toml` (Busse et al. 1993:
Nu ≈ 3.539, V_rms ≈ 40.999).

### Grid study with subgrid diffusion

Case 1A with markers carrying temperature and the full Gerya & Yuen (2003)
subgrid scheme (`subgrid_scheme = "gerya_yuen"`, the default). The values
are averages over the last fifth of each run.

| Run | Nu (4.884) | V_rms (42.865) | V_surf | mobility |
|---|---|---|---|---|
| 41 × 41 | 4.772 (−2.3 %) | 42.77 (−0.22 %) | 45.27 | 1.06 |
| 65 × 65 | 4.829 (−1.1 %) | 42.81 (−0.13 %) | 45.33 | 1.06 |
| 97 × 97 | 4.851 (−0.68 %) | 42.84 (−0.07 %) | 45.37 | 1.06 |
| 65 × 65, Eulerian SUPG solve, no markers | 4.853 (−0.63 %) | 42.83 (−0.08 %) | 45.36 | 1.06 |
| 65 × 65, legacy `"reproject"` scheme | 4.603 (−5.8 %) | 44.81 (+4.5 %) | 47.32 | 1.06 |

- **Convergence:** the Nu error falls with grid spacing at an order of about 1.2–1.6. Richardson extrapolation gives Nu ≈ 4.878, about −0.1 %. V_rms is within 0.25 % on every grid.
- **Where the remaining Nu error comes from:** the Eulerian solve without markers has the same offset on the same grid. So the remaining Nu error comes from resolving the thermal boundary layer and from computing Nu from the surface temperature gradient, not from the marker coupling.
- **Legacy scheme:** the old `"reproject"` variant stays about 5 % off at every resolution, and it drifts laterally in a static conductive lid by tens of kelvin. With `"gerya_yuen"` the same lid keeps its lateral temperature uniform to within 0.1 K. Keep `"reproject"` only to reproduce old runs.
- **Plain Boussinesq on the TALA code:** the Boussinesq path gives the same 65 × 65 values (Nu 4.830, V_rms 42.80).

## King et al. (2010) — TALA compressible convection

`cases/king2010_tala_Ra1e4_Di{025,050,100}.toml` run the TALA cases of King
et al. (2010) at Ra = 10⁴ and Di = 0.25, 0.5, 1 (unit box, 65 × 65, markers
with subgrid diffusion, $\gamma_r = 1$, surface temperature 0.091). They are
compared with the converged ASPECT values (King et al. 2010 as tabulated in
Heister et al. 2017; the same numbers are in ASPECT's
`benchmarks/king2dcompressible`). `cases/tala_boussinesq_limit_Ra1e4.toml`
runs TALA at Di = 10⁻⁶, which must reproduce Blankenbach 1A.

| Case | Nu | V_rms |
|---|---|---|
| Di = 10⁻⁶ (Boussinesq limit) | 4.846 (plain Boussinesq on the same grid: 4.830) | 42.80 (42.80) |
| Di = 0.25 | −1.0 % | −0.3 % |
| Di = 0.5 | −2.0 % | −0.5 % |
| Di = 1, long run (t = 1.1) | 2.515 (−2.0 %; ASPECT 2.566) | 25.77 (−1.0 %; ASPECT 26.03) |
| Di = 1, Eulerian solve without markers | 2.543 (−0.9 %) | 25.86 (−0.65 %) |

The mean temperature agrees with ASPECT to within 0.001 at every Di. The
Eulerian solve is within 1 % of ASPECT, which is the accuracy of the same
solver for Boussinesq convection on this grid. Carrying temperature on
markers adds a further low bias that grows with Di. For the planetary
dissipation numbers MILET is used at (Di ≈ 0.1), the error is below the
Di = 0.25 values.

## Geometric multigrid gates

`test/smoke/test_gmg.jl` contains three gates for the GMG solver stack
(`src/solvers/GMG.jl`, `src/solvers/BlockMG.jl`; see
[Geometric multigrid](../numerics/multigrid.md)):

1. **2D V-cycle on the real Q2 velocity space** with a 4-decade viscosity
   contrast (stiff block in a soft matrix): the Galerkin hierarchy
   ($A_{\ell+1} = P_\ell^T A_\ell P_\ell$) must contract the residual by
   ≥ 10⁴ within 8 V-cycles with a mean per-cycle rate < 0.5, and
   `gmg_update!` (new matrix values, same pattern — the Picard-iteration
   path) must keep converging.
2. **3D hierarchy**: the same machinery on a 16³ Q2 vector space with a
   viscosity contrast — relative residual < 10⁻³ after 8 cycles. This
   validates transfers, Galerkin products, and Chebyshev smoothing in 3D.
3. **End-to-end Stokes**: GMG-preconditioned FGMRES must reproduce the MUMPS
   direct solution of a buoyancy-driven variable-viscosity flow to a
   relative velocity difference < 2×10⁻³ (measured agreement ≈ 4×10⁻⁴ —
   the gate reflects the backward-error limit of a fully dimensional
   system with η ~ 10²⁰ Pa·s, not discretization error). The test runs
   `n_picard = 2` deliberately so the cached in-place reassembly
   (`assemble_stokes_cached!`), the MUMPS numeric-only refactorization, and
   `gmg_update!` — the paths production runs live on — are all exercised.

The runnable demos for the iterative path are
`cases/plume3d_cube_gmg.toml` and `cases/plume3d_slab_gmg.toml`.

## Two-phase flow — the φ = 0 gate

`test/smoke/test_twophase.jl` enforces the degeneracy requirement of the
McKenzie three-field formulation (`src/physics/TwoPhase.jl`; see
[Two-phase flow](../physics/two_phase.md)): as $\phi \to 0$ the permeability
$k_\phi \to$ tiny and $1/\zeta_\phi \to$ tiny, so the fluid-pressure
equation degenerates to $-\nabla\cdot u = 0$ and $p_c \to 0$ — the system
must reproduce **single-phase Stokes**. The test solves the same
falling-block problem with `picard_stokes!` and with `solve_twophase!` at
φ = 0 and asserts

- relative velocity difference < 5×10⁻³, and
- relative difference of the **total pressure** $p_f + p_c$ (mean-free, since
  the split between the two multipliers is regularization-dependent at
  φ = 0) against the single-phase pressure < 5×10⁻³.

A companion testset checks the constitutive closures pointwise
(permeability power law, compaction viscosity, melt weakening
$\eta\,e^{-\alpha_\phi\phi}$, finite compaction length
$\delta = \sqrt{k_\phi \zeta_\phi/\mu}$).

## Grain-size evolution — analytic tests

`test/smoke/test_grainsize.jl` pins the grain-size module
(`src/materials/GrainSize.jl`, design in `doc/design/grain_size.md`; see
[Grain-size evolution](../physics/grain_size.md)) to closed-form results:

- **Growth-only analytic**: with $\Psi_{\rm disl} = 0$ the ODE integrates
  exactly to $d(t)^p = d_0^p + G_0\, t\, e^{-E_g/RT}$; `update_grain_size`
  must match within 1 % (it does so in a single substep, because the growth
  sub-flow is integrated in closed form).
- **Wattmeter steady state**: integrating from 10× above and 0.1× below the
  Austin & Evans (2007) fixed point
  $d_{ss} = (c\gamma K/(p\lambda\Psi))^{1/(p+1)}$ must converge to the same
  value within 5 % of the analytic $d_{ss}$ (and to each other within
  10⁻⁶ — a unique fixed point).
- **Composite-rheology identity**: with diffusion creep enabled, the
  pre-clamp harmonic identity
  $1/\eta_{\rm comp} = 1/\eta_{\rm diff} + 1/\eta_{\rm disl}$ must hold
  to 10⁻¹⁰; `diff_A = 0` must regress exactly
  to the single-mechanism path.
- **Mechanism-partition consistency** (`viscous_mechanism_partition`):
  stress continuity requires
  $\dot\varepsilon_{\rm diff} + \dot\varepsilon_{\rm disl} = \dot\varepsilon_{II}$ and
  $\Psi_{\rm disl} = 2\eta_v \dot\varepsilon_{II}\,\dot\varepsilon_{\rm disl}$,
  both to 10⁻¹⁰.

## Softening and healing tests

`test/smoke/test_softening.jl` covers the strain-softening additions
(design in `doc/design/softening_healing.md`; see
[Softening & healing](../physics/softening.md)):

- **Healing decay**: $\varepsilon_p(t) = \varepsilon_p(0)\, e^{-t/\tau}$
  halves after $t = \tau \ln 2$ at $T = T_{\rm ref}$; the Arrhenius τ(T)
  must shrink for hotter and grow for colder material.
- **Viscous strain-softening ramp**: `visc_soft_factor = 0.1` must leave
  fresh material at η₀, reach exactly 0.1 η₀ beyond `strain_thresh_weak`,
  and be monotonic in between; the default factor 1.0 must be a no-op.
- **Configurable yield cap**: at 3 GPa confining pressure the implied stress
  $2\eta\dot\varepsilon_{II}$ must respect `yield_stress_max = 1e8`, and
  disabling the cap (≤ 0) must let the Drucker–Prager yield grow with depth.
- **Yielded flag**: `compute_VEP_viscosity` must report plasticity governing
  (the flag that feeds the per-cell yield fraction gating strain
  accumulation) for a low-cohesion/high-η rock, and never for a purely
  viscous one.

## Other smoke tests

- `test/smoke/test_rheology.jl` — pointwise rheology invariants: constant
  Newtonian rock returns exactly η₀; Arrhenius ∂η/∂T < 0; Maxwell VEP gives
  Z ∈ (0, 1], χ + Z = 1, η_VEP ≤ η_viscous; strain weakening is monotonic.
  Plus density: ρ(T_ref) = ρ₀, thermal contraction, additive phase Δρ.
- `test/smoke/test_mesh.jl`, `test/smoke/test_fespaces.jl` — 2D/3D mesh
  construction, wall tagging, and Taylor–Hood space sanity.
- `test/smoke/test_phase_melt.jl` — depth-triggered phase change and the
  Katz-lite solidus/liquidus melt fraction.

## Gated short benchmarks and the long bench

With `RUN_BENCHMARKS=1`, `test/runtests.jl` additionally runs short
end-to-end models (`test/benchmarks/`): SolCx (analytic ρ/η), the falling
block (50 steps), a 20-step plume, and a short Blankenbach 1A that logs Nu
and V_rms against 4.884 / 42.86. `test/long_bench.jl` is the curated
laptop-budget suite (SolCx at two resolutions, falling block, plume,
Blankenbach with ~200 steps) used to track wall-clock and physics regressions
together.

## Related pages

- The case files under `cases/` — the runnable TOML definitions behind each
  benchmark.
- [Testing](../dev/testing.md) — how the test harness is organised.
- [Linear solvers](../numerics/solvers.md), [Geometric multigrid](../numerics/multigrid.md) —
  the solver architecture the GMG gates protect.
