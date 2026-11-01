```@raw html
---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "MILET"
  text: "Modeling in Lithospheric Evolution Tectonics"
  tagline: A thermomechanical finite-element framework for lithosphere and mantle dynamics, developed entirely in Julia on top of Gridap and named after Miletus, a historic center of early scientific thought.
  actions:
    - theme: brand
      text: Getting started
      link: /getting_started
    - theme: alt
      text: Governing equations
      link: /physics/governing_equations
    - theme: alt
      text: Parameter reference
      link: /reference/parameter_file

features:
  - title: Stokes + energy with markers-in-cell
    details: Inf-sup stable Taylor–Hood (Q2/Q1) Stokes coupled to heat transport; RK4 marker advection carries composition, temperature, stress, plastic strain, grain size and porosity.
  - title: Visco-elasto-plastic rheology
    details: Composite diffusion + dislocation creep with experimentally calibrated flow laws, Drucker–Prager yield, strain softening, Arrhenius healing, and reaction softening.
  - title: Geometric multigrid in 2-D and 3-D
    details: FGMRES on the full saddle-point system, preconditioned by Galerkin-coarsened geometric multigrid V-cycles with Chebyshev smoothing — variable viscosity inherited exactly, no rediscretisation.
  - title: Two-phase McKenzie flow
    details: Porous melt migration through a compacting viscous matrix — a 3-field (u, p_f, p_c) extension of the Stokes solve that reduces exactly to single-phase Stokes at zero porosity.
  - title: Grain-size evolution
    details: Arrhenius normal grain growth balanced against Austin–Evans (2007) paleowattmeter reduction, two-way coupled to the diffusion/dislocation mechanism partitioning.
  - title: Phase change, melting, free surface
    details: Divariant rate-limited metamorphic reactions with reaction-progress softening, melting parameterisations, sticky-air and ALE free surfaces, AMR, checkpoint/restart.
---
```

```@raw html
<style>
/* Home hero: text only (the animations live in the showcase below), centred
   at every width.  !important because VitePress's own rules use [data-v-*]
   attribute selectors, which outrank plain class selectors. */
.VPHero .container {
  text-align: center !important;
}
.VPHero .main {
  max-width: 880px !important;
  margin: 0 auto !important;
}
.VPHero .name,
.VPHero .text,
.VPHero .tagline {
  margin-left: auto !important;
  margin-right: auto !important;
  text-align: center !important;
}
.VPHero .name,
.VPHero .text {
  max-width: none !important;
}
.VPHero .tagline {
  max-width: 820px !important;
}
.VPHero .actions {
  justify-content: center !important;
}

/* Showcase: one card per animation — centred title, video player, centred
   one-line description, link to the case page. */
.milet-showcase {
  max-width: 1152px;
  margin: 8px auto 48px;
}
.milet-showcase > h2 {
  text-align: center;
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}
.milet-showcase > p.lead {
  text-align: center;
  color: var(--vp-c-text-2);
  max-width: 760px;
  margin: 0 auto 28px;
}
.milet-showcase .grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .milet-showcase .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .milet-showcase .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.milet-showcase figure {
  margin: 0;
  padding: 12px 12px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
}
.milet-showcase figure h3 {
  text-align: center;
  margin: 0 0 10px;
  padding: 0;
  border: none;
  font-size: 0.98rem;
  line-height: 1.3;
}
.milet-showcase video {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  background: #fff;
  border-radius: 8px;
  display: block;
}
.milet-showcase figcaption {
  text-align: center;
  font-size: 0.82rem;
  line-height: 1.4;
  color: var(--vp-c-text-2);
  margin-top: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.milet-showcase figcaption a {
  display: inline-block;
  margin-top: 6px;
  font-weight: 500;
}

/* Align the nav bar (logo + menu) with the 1152px content container, instead of
   the full-width default set by the readability plugin. */
.VPNavBar > .wrapper > .container {
  max-width: 1152px !important;
  margin: 0 auto !important;
}

/* Separator line after the tagline, centred above the feature cards — mirrors
   the section dividers further down the page. */
.VPFeatures::before {
  content: "";
  display: block;
  max-width: 1152px;
  margin: 0 auto 56px;
  border-top: 1px solid var(--vp-c-divider);
}
</style>
```

```@raw html
<section class="milet-showcase">
  <h2>Example simulations</h2>
  <p class="lead">Every animation below comes from a case file shipped in <code>cases/</code>; open a card's page for the full parameter file and the command to run it.</p>
  <div class="grid">
    <figure>
      <h3>Subduction (2-D)</h3>
      <video src="./media/m1_sub.mp4" poster="./media/m1_sub.jpg" controls autoplay muted loop playsinline preload="metadata" aria-label="M1 subduction benchmark animation"></video>
      <figcaption><span>Glerum et al. (2018) Model 1: a slab sinks toward 660 km.</span><a href="reference/benchmarks.html">Benchmarks →</a></figcaption>
    </figure>
    <figure>
      <h3>Convection in a box (3-D)</h3>
      <video src="./media/convection3d.mp4" poster="./media/convection3d.jpg" controls autoplay muted loop playsinline preload="metadata" aria-label="3-D thermal convection animation"></video>
      <figcaption><span>Bottom-heated convection at Ra = 10⁵: isotherms and flow.</span><a href="examples/convection3d.html">Case file →</a></figcaption>
    </figure>
    <figure>
      <h3>Plumes in a spherical chunk (2-D)</h3>
      <video src="./media/chunk_plumes.mp4" poster="./media/chunk_plumes.jpg" controls autoplay muted loop playsinline preload="metadata" aria-label="Plumes in a spherical chunk animation"></video>
      <figcaption><span>Plumes rise from the core-mantle boundary of a 92° wedge.</span><a href="examples/chunk_plumes.html">Case file →</a></figcaption>
    </figure>
    <figure>
      <h3>Ridge and transform (3-D)</h3>
      <video src="./media/mor3d.mp4" poster="./media/mor3d.jpg" controls autoplay muted loop playsinline preload="metadata" aria-label="3-D mid-ocean ridge animation"></video>
      <figcaption><span>Offset spreading segments: seafloor dynamic topography.</span><a href="examples/mor3d.html">Case file →</a></figcaption>
    </figure>
  </div>
</section>
```

## What is MILET?

**M**odeling **i**n **L**ithospheric **E**volution **T**ectonics is a
thermo-mechanical finite-element code for lithospheric and mantle dynamics.
It solves the coupled Stokes and energy equations with a mixed, inf-sup
stable Taylor–Hood discretisation ($Q_2$ velocity, $Q_1$ pressure, built on
[Gridap.jl](https://github.com/gridap/Gridap.jl)) combined with a
marker-in-cell representation of material. It is designed for problems in
which composition, rheology, and metamorphic phase change evolve together —
lithospheric foundering, delamination, drips, and subduction.

MILET is a flat-include research code: `main.jl` includes the sources under
`src/` in dependency order and drives one simulation per run, fully specified
by a single TOML parameter file (deep-merged onto `cases/_defaults.toml`).

## Capabilities

- **Stokes flow**, Boussinesq or compressible (TALA, King et al. 2010), in
  2-D and 3-D Cartesian plus spherical-chunk geometry —
  [Governing equations](physics/governing_equations.md),
  [Compressibility](physics/compressibility.md)
- **Visco-elasto-plastic composite rheology** with calibrated
  dislocation-creep flow laws (Ranalli 1995 catalogue), grain-size-sensitive
  diffusion creep, and Drucker–Prager yield — [Rheology](physics/rheology.md)
- **Marker-in-cell transport**: RK4 advection, reseeding, and subgrid-scale
  temperature diffusion after Gerya & Yuen (2003) —
  [Markers](numerics/markers.md)
- **Divariant, rate-limited (Arrhenius) phase transitions** with
  reaction-progress-dependent softening —
  [Phase changes](physics/phase_changes.md)
- **Melting parameterisations** and melt weakening —
  [Melting](physics/melting.md)
- **Heat transport** with shear, adiabatic, and radiogenic heating, plus
  SUPG / entropy-viscosity stabilisation options —
  [Heat transport](physics/heat.md)
- **Sticky-air free surface** with FSSA stabilisation and an ALE
  surface-tracking option — [Free surface](physics/free_surface.md)
- **Direct (MUMPS) and iterative (GMG, PETSc) solvers** with cached
  factorisations and warm starts — [Linear solvers](numerics/solvers.md)
- **Picard and Newton nonlinear loops**, CFL-limited time stepping,
  checkpoint/restart, VTK output —
  [Time stepping](numerics/time_stepping.md)
- **Adaptive mesh refinement and ALE** — [AMR & ALE](numerics/amr_ale.md)

### New capabilities

**Geometric multigrid 3-D Stokes solver** —
[Geometric multigrid](numerics/multigrid.md). Right-preconditioned FGMRES on
the monolithic saddle-point system; the velocity block is preconditioned by
V-cycles of a Galerkin geometric multigrid
($A_{\ell+1} = P_\ell^T A_\ell P_\ell$, so variable viscosity and
Dirichlet elimination are inherited
exactly from the fine operator), with Chebyshev smoothing and a cached-LU
coarse solve; the pressure Schur complement uses the $\eta$-weighted lumped
pressure mass (Elman–Silvester–Wathen). Select with `[solver] type = "gmg"`
(`gmg_levels`, `gmg_cheb_degree`, `gmg_cycles`, `gmg_coarse_dofs`); shipped
3-D cases: `cases/plume3d_cube_gmg.toml`, `cases/plume3d_slab_gmg.toml`.
Implementation: `src/solvers/GMG.jl`, `src/solvers/BlockMG.jl`.

**Two-phase (McKenzie) flow** — [Two-phase flow](physics/two_phase.md).
Porous melt migration through a compacting viscous matrix, as a 3-field
extension of the Stokes solve (Katz 2008; Rhebergen, Wells & Katz 2014):

```math
-\nabla\!\cdot\!\bigl(2\eta_\phi\,\dot\varepsilon(\mathbf{u}_s)\bigr)
  + \nabla p_f + \nabla p_c = \bar\rho\,\mathbf{g}, \qquad
  \nabla\!\cdot\!\mathbf{u}_s + \frac{p_c}{\zeta_\phi} = 0, \qquad
  -\nabla\!\cdot\!\Bigl(\frac{k_\phi}{\mu_f}\,(\nabla p_f - \rho_f\mathbf{g})\Bigr)
- \nabla\!\cdot\!\mathbf{u}_s = 0,
```

discretised as $Q_2$ solid velocity / $Q_1$ fluid pressure / $Q_1$ compaction
pressure, with porosity carried on markers. At $\phi = 0$ the system reduces
exactly to single-phase Stokes (a regression test enforces this). Enabled
with `[twophase] do_two_phase = true` (`k0`, `phi0`, `n_perm`, `mu_fluid`,
`rho_fluid`, `alpha_phi`, `phi_min`, `pf_surface0`, …). Implementation:
`src/physics/TwoPhase.jl`.

**Grain-size evolution (paleowattmeter)** —
[Grain-size evolution](physics/grain_size.md). Per-marker grain size $d$
evolves by Arrhenius normal grain growth balanced against Austin & Evans
(2007) reduction driven by the dislocation-creep work rate
$\Psi_\mathrm{disl} = \sigma_{II}\,\dot\varepsilon_\mathrm{disl}$:

```math
\frac{\mathrm{d}d}{\mathrm{d}t}
  = \frac{G_0}{p\,d^{\,p-1}} \exp\!\Bigl(-\frac{E_g + P V_g}{RT}\Bigr)
- \frac{\lambda}{c\,\gamma}\, d^{2}\, \Psi_\mathrm{disl},
```

integrated with exact operator-split sub-flows (`update_grain_size`,
`src/materials/GrainSize.jl`) and two-way coupled to the composite
diffusion + dislocation rheology. Per-rock keys `grain_G0`, `grain_p`,
`grain_Eg`, `grain_Vg`, `grain_lambda`, `grain_gamma`, `grain_c`,
`grain_init` (`grain_G0 = 0` freezes the grain size).

**Strain softening & healing** — [Softening & healing](physics/softening.md).
Linear cohesion/friction weakening over
`[strain_thresh_init, strain_thresh_weak]`, now with plastic-strain gating
(`[rheology] strain_gate_plastic = true`: weakening strain accumulates only
where the cell actually yields), temperature-dependent Arrhenius healing
($\tau_\mathrm{heal} = \tau_0 \exp[\tfrac{E}{R}(\tfrac{1}{T} - \tfrac{1}{T_\mathrm{ref}})]$;
per-rock `heal_tau0`, `heal_E`, `heal_Tref`),
optional viscous strain softening (`visc_soft_factor`), and a configurable
yield-stress cap (`yield_stress_max`).

## Quick start

```bash
# install dependencies (once)
julia --project=. -e 'using Pkg; Pkg.instantiate()'

# verification benchmark: SolCx (variable-viscosity Stokes, analytic solution)
julia --project=. main.jl cases/solcx_fixed.toml

# convection benchmark: Blankenbach case 1a
julia --project=. main.jl cases/blankenbach_1a.toml

# a worked geodynamic example: thermo-mechanical subduction
julia --project=. main.jl cases/subduction.toml

# 3-D plume with the geometric-multigrid solver
julia -t auto --project=. main.jl cases/plume3d_cube_gmg.toml
```

Results are written as VTK files (solution fields, markers, topography) to
`output/<case>/`, viewable in ParaView — see
[Getting started](getting_started.md) for output formats and the
depth-positive-down camera setup. Every TOML key is documented in the
[parameter-file reference](reference/parameter_file.md).

## Verification

- **SolCx** (Duretz et al. 2011): grid convergence of the variable-viscosity
  Stokes solution (`cases/solcx_fixed_n*.toml`)
- **Blankenbach et al. (1989) case 1a**: steady convection diagnostics
  ($Nu$, $V_\mathrm{rms}$) at three resolutions (`cases/blankenbach_*.toml`)
- Smoke and benchmark tests under `test/`
  (`julia --project=. test/runtests.jl`) — see
  [Benchmarks](reference/benchmarks.md) and [Testing](dev/testing.md)

## Notes

- The multi-species volatile transport module is part of a separate study in
  preparation and is not included in this release; shipped cases run with
  volatiles disabled.
- 3-D and spherical-chunk support are functional but less exercised than the
  2-D Cartesian path.

## Citing

If you use MILET in your work, please cite the paper that describes the code
and its application to eclogite foundering on Venus, together with the
archived simulations and inputs:

- Karagoz, O. (2026). A mantle viscosity threshold for eclogite foundering
  on Venus. *Journal of Geophysical Research: Planets*, in revision.
- Karagoz, O. (2026). MILET simulations, inputs and figure scripts for the
  eclogite-foundering study [Data set]. Zenodo.
  [doi:10.5281/zenodo.20932417](https://doi.org/10.5281/zenodo.20932417)

Until the paper is published, please also cite the repository,
[github.com/okaragoz/MILET](https://github.com/okaragoz/MILET). The
reference will be updated with volume, pages and DOI on publication.

```bibtex
@article{Karagoz2026Venus,
  author  = {Karagoz, Oguzcan},
  title   = {A Mantle Viscosity Threshold for Eclogite Foundering on {Venus}},
  journal = {Journal of Geophysical Research: Planets},
  year    = {2026},
  note    = {In revision}
}

@misc{Karagoz2026Zenodo,
  author       = {Karagoz, Oguzcan},
  title        = {{MILET} simulations, inputs and figure scripts for the
                  eclogite-foundering study on {Venus}},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.20932417},
  url          = {https://doi.org/10.5281/zenodo.20932417}
}
```
