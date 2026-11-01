# Markers

MILET uses the marker-in-cell (particle-in-cell) method: Lagrangian markers
carry material identity and history through the Eulerian FE mesh. The
implementation lives in `src/particles/` — `Particles.jl` (storage),
`Projection.jl` (marker ↔ grid transfer), `Advection.jl` (RK4),
`CartEval.jl` (fast FE evaluation), `Reseed.jl` (repopulation).

## Struct-of-Arrays layout

`Markers` (`src/particles/Particles.jl`) is a struct of plain `Vector`s —
one contiguous array per field — for cache-friendly per-field iteration.
Positions and all physical fields are `Float32` (halves memory; stresses are
re-evaluated every step so the precision is sufficient), rock type is `Int8`,
layer ID `Int16`. Carried per marker:

- position `x`, `y`, `z` (zero in 2D)
- temperature `T`, rock type `rtype`, accumulated plastic strain `strain`
- melt fraction `F_melt`, cumulative phase-change density `phase_drho`
- deviatoric stress tensor `sxx … syz` (VEP elastic memory, Jaumann-rotated)
- `grain_size`, `porosity` (two-phase flow state), `layer_id`
- volatile masses `sulfur`, `graphite`, `carbonatite`, `water`

`ensure_capacity!` grows all arrays geometrically (doubling) when reseeding
needs room; the live count is `mk.n`.

## Marker → cell projection

`project_markers_to_cells!` (`src/particles/Projection.jl`) turns marker
properties into the per-cell arrays the assembly consumes
(`state.eta_c`, `rho_c`, `cp_c`, `kt_c`, `ht_c`, `chi_c`,
`sxx_old_c … syz_old_c`, `yield_frac_c`). Two averaging conventions, chosen
per quantity:

- **Arithmetic mean** for additive quantities — density, heat capacity,
  radiogenic heating, stresses, the Maxwell weight $\chi$:
  $\langle f\rangle = \sum w_m f_m / \sum w_m$.
- **Harmonic mean** for transport coefficients — viscosity $\eta$ and
  thermal conductivity $k$:
  $\langle f\rangle = \sum w_m \big/ \sum (w_m/f_m)$.
  Resistor analogy (Gerya 2010 §8.6): a cell mixing soft and stiff material
  in series has the harmonic effective resistance — the soft phase dominates,
  so a weak inclusion (e.g. weak crust lubricating a strong slab) keeps
  winning without smearing the contrast across cell boundaries.

The per-marker viscosity itself comes from the full VEP composite
(`compute_VEP_viscosity`, see [Rheology](../physics/rheology.md)), including
grain-size feedback and the eclogite reaction-softening factor
$\eta \leftarrow \eta\,10^{-\Delta\cdot X}$.

**Stencils** (`projection_mode` in `[output]`):

- `"host"` (default): each marker contributes only to its host cell — sharp
  interfaces, small cell-boundary noise from marker discreteness.
- `"bilinear"`: 2×2 (2D) / 2×2×2 (3D) scatter with weights
  $(1-|\xi|)(1-|\eta|)(1-|\zeta|)$ over the neighbour cells straddled by the
  marker (`bilinear_stencil_2d/_3d`) — smoother, slightly smeared interfaces.
  At domain boundaries the missing neighbour folds back onto the host so
  weights always sum to 1.

### Cell-binned threading

On the uniform Cartesian fast path (`mb.adapted == false`,
`geometry = "box"`), markers are binned by host cell into a CSR layout
(`ProjCache`: `offsets`/`order`) with a stable counting sort — allocation-free
and recomputed every call, with the host lookup itself threaded
(`_bin_markers!`, pure arithmetic via the inlined `locate_cartesian`). The
cache is reused across calls via `state.proj_cache` and rebuilt only when
marker capacity or cell count changes (12.5 % headroom for reseeding).

- *Host mode* threads **over cells**: each cell's accumulation touches only
  its own bin, so there are no shared writes, and per-cell accumulation runs
  in ascending marker order — bit-identical to the legacy serial loop.
- *Bilinear mode* splits into phase A (threaded over markers: the expensive
  rheology into per-marker scratch arrays) and phase B (serial scatter into a
  `(n_cells, 13)` accumulator — shared writes, but cheap arithmetic), again
  preserving bit-identical results.

On adapted (AMR/ALE) or mapped (chunk) meshes the fast path is invalid —
markers live in physical coordinates, `locate_cartesian` assumes reference
coordinates — and projection falls back to a **serial** host-only loop using
Gridap's KDTree point-in-cell search (`_project_markers_general!`,
`locate_cell_general`); Gridap's search is not thread-safe. See
[AMR & ALE](./amr_ale.md#fast-paths-disabled-on-adapted-meshes).

Empty cells keep their previous state (host mode) or sensible defaults; cells
emptied by strong flow are repopulated by reseeding (below).

## RK4 advection

`advect_markers!` (`src/particles/Advection.jl`) integrates
$d\mathbf x/dt = \mathbf u(\mathbf x)$ per marker with classical fourth-order
Runge–Kutta:

```math
\mathbf k_1 = \mathbf u(\mathbf x_n),\quad
\mathbf k_2 = \mathbf u(\mathbf x_n + \tfrac{\Delta t}{2}\mathbf k_1),\quad
\mathbf k_3 = \mathbf u(\mathbf x_n + \tfrac{\Delta t}{2}\mathbf k_2),\quad
\mathbf k_4 = \mathbf u(\mathbf x_n + \Delta t\,\mathbf k_3),
```
```math
\mathbf x_{n+1} = \mathbf x_n + \tfrac{\Delta t}{6}(\mathbf k_1 + 2\mathbf k_2 + 2\mathbf k_3 + \mathbf k_4).
```

$O(\Delta t^4)$ per step at the cost of 4 velocity evaluations per marker.
Substep probes that land slightly outside the mesh are clamped to a small
inset inside the domain (the I3ELVIS convention for boundary excursions).
Markers of rocks flagged `immobile = true` (sticky air) are skipped so the
air interface stays at $y = 0$.

## Fast Q2/Q1 evaluators

Gridap's generic `evaluate(uh, Point(…))` dominates marker-loop cost.
`src/particles/CartEval.jl` bypasses it on uniform Cartesian meshes
(~300× speedup) by snapshotting the FE coefficient vectors once per step and
evaluating tensor-product Lagrange bases directly:

- **2D**: `snapshot_q2_vec` / `eval_q2_vec` (velocity, per-cell 9-node
  storage), `snapshot_q1_scalar` / `eval_q1_scalar` (temperature),
  plus `eval_q2_gradu` for physical-space velocity gradients (stress
  rotation).
- **3D**: `snapshot_q2_vec_3d` / `eval_q2_vec_3d` and the Q1 variants store
  the **global nodal grid** — $(2n_x{+}1)(2n_y{+}1)(2n_z{+}1)$ values per
  component — instead of per-cell duplication (27 values/cell would be
  ~3.4× larger); evaluation is a clean 3×3×3 tensor-product gather. The
  local-node → sub-grid offset maps are derived from Gridap's reference-FE
  node coordinates at include time, so HEX node ordering is never hard-coded.

These snapshots also make threading safe: advection, marker-T updates, strain
and grain-size updates all run in contiguous chunks across threads on the
fast path, and fall back to a serial Gridap-evaluate loop on adapted meshes.

## Reseeding with history inheritance

Strong convergent flow sweeps markers out of source cells; holes in the
rheology field follow. `reseed_markers!` (`src/particles/Reseed.jl`) injects
markers into any cell with fewer than `min_per_cell` (default 2) markers:

1. **Rock type**: air layer ($y_c < \texttt{air\_thick}$) → `air_rock_id`;
   cell with survivors → majority vote among them (preserves slab-tip and
   plate-boundary detail); empty cell → majority vote over the 3×3(×3)
   neighbourhood.
2. **Temperature**: evaluated from the FE field `Th` at the cell centre.
3. **History inheritance**: the new marker copies `strain`, `F_melt`,
   `phase_drho`, the stress tensor, `grain_size`, `porosity`, and `layer_id`
   from a **donor** marker of the same rock type — in-cell if available,
   else from the neighbourhood. Without this, reseeding erases
   strain-softening and grain-size memory exactly where shear zones deplete
   markers, artificially re-strengthening active faults. Air markers never
   inherit.
4. **Volatiles**: new markers carry zero volatile mass — volatile content is
   an extensive mass on the original carriers, so adding zero-mass markers
   keeps the cell inventory exactly conserved.

New markers are staggered inside the cell so repeated reseeds do not stack.

## Subgrid temperature diffusion

`apply_subgrid_diffusion!` (Gerya & Yuen 2003) relaxes each marker's
temperature toward the grid-interpolated value $T_n$ at the subgrid
timescale:

```math
T_m \leftarrow T_n + (T_m - T_n)\, e^{-d\,\kappa\,\Delta t\,g},\qquad
g = \frac{2}{\Delta x^2} + \frac{2}{\Delta y^2}\;\Big(+ \frac{2}{\Delta z^2}\Big),
```

with $\kappa = k_c/(\rho_\text{ref} c_{p,c})$ from the host cell and $d$ the
dimensionless coefficient `subgrid_d` (typically 1). This suppresses the
marker–grid temperature inconsistency that otherwise accumulates in PIC
thermal convection and stalls it on fine grids.

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

Enabled by `do_subgrid_diffusion = true`; only active in `marker_T_mode =
"pic_increment"` (see [Time stepping](./time_stepping.md)); uniform Cartesian
fast path only.

## Marker temperature update

`update_marker_temperatures!` has two modes (`marker_T_mode` in
`[temperature]`):

- `"pic_increment"` (default): $T_m \mathrel{+}= T^\text{new}(x_m) - T^\text{old}(x_m)$
  — markers carry temperature; the FE solve contributes
  only the diffusion + sources increment (I2ELVIS/PIC pattern, required for
  vigorous convection where $T$ must advect with the flow).
- `"overwrite"`: $T_m = T^\text{new}(x_m)$ — fine when advection of heat is
  handled on the grid (e.g. `do_supg_heat = true`).

Both clamp to bound-preserving limits supplied by the Driver so FE Galerkin
overshoots cannot accumulate across PIC steps.
