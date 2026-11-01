# Discretization

MILET discretizes all fields with continuous Lagrangian finite elements on a
quadrilateral (2D) / hexahedral (3D) mesh built with
[Gridap](https://github.com/gridap/Gridap.jl). The mesh and boundary tags are
constructed in `src/core/Mesh.jl` (`build_model`); the FE spaces in
`src/core/FESpaces.jl` (`build_spaces`).

## Element choices

| Field | Element | Config key | Default |
|---|---|---|---|
| Velocity $\mathbf{u}$ | $Q_2$ vector Lagrangian | `fe_order_v` | 2 |
| Pressure $p$ | $Q_1$ Lagrangian | `fe_order_p` | 1 |
| Temperature $T$ | $Q_1$ Lagrangian | `fe_order_T` | 1 |
| Composition $C$ | $Q_1$ Lagrangian (same `reffe_T`) | — | 1 |

The $Q_2/Q_1$ **Taylor–Hood** pair satisfies the inf-sup (LBB) condition, so
the mixed Stokes saddle point

```math
\begin{bmatrix} A & B^{\mathsf T} \\ B & 0 \end{bmatrix}
\begin{bmatrix} \mathbf u \\ p \end{bmatrix} =
\begin{bmatrix} \mathbf f \\ 0 \end{bmatrix}
```

is stable without pressure stabilization terms. The weak form assembled on
this pair (`build_stokes_forms` in `src/physics/Stokes.jl`) is

```math
a((\mathbf u,p),(\mathbf v,q)) = \int_\Omega 2\,\eta\,\varepsilon(\mathbf u):\varepsilon(\mathbf v)\,d\Omega
- \int_\Omega p\,(\nabla\!\cdot\!\mathbf v)\,d\Omega
- \int_\Omega q\,(\nabla\!\cdot\!\mathbf u)\,d\Omega
+ \sum_{\Gamma_{fs}} \int_{\Gamma} \gamma\,(\mathbf u\cdot\mathbf n)(\mathbf v\cdot\mathbf n)\,d\Gamma,
```

with quadrature order $2\,\max(\texttt{fe\_order\_v},1)$ (the `quad_order`
default of `build_model`). See
[Governing equations](../physics/governing_equations.md) for the full physics.

`build_spaces` returns an `FESpaceBundle` holding the velocity test/trial pair
(`V`/`U`), the pressure pair (`Q`/`P`), their monolithic multi-field
combinations `X = MultiFieldFESpace([U, P])` and `Y = MultiFieldFESpace([V, Q])`
(Gridap's consecutive numbering puts all velocity DOFs before all pressure
DOFs — the solver layer relies on this, see [Linear solvers](./solvers.md)),
plus the temperature pair (`VT`/`UT`) and the composition pair (`VC`/`UC`).

**Pressure nullspace.** Pressure carries no Dirichlet condition. The constant
mode is handled at the solver level: MUMPS tolerates the single zero
eigenvalue of the assembled saddle point, and the iterative path works with
the dynamic (Boussinesq-perturbation) pressure so the hydrostatic gradient
never enters the system (see `buoyancy_cellfield` in
`src/time_stepping/PicardLoop.jl`).

## Wall tags and the edge/corner Dirichlet story

Boundary tags are named by *physical* meaning, not by Gridap's `top`/`bottom`
convention — $y$ grows downward in MILET (FD-code convention,
`gy[1] = 0` = surface), so the low-$y$ face is the **surface** and the
high-$y$ face is the **deep** boundary:

| Tag | Location (box geometry) |
|---|---|
| `left`, `right` | $x = 0$, $x = \texttt{xsize}$ |
| `surface` | $y = 0$ (free surface / sticky air top) |
| `deep` | $y = \texttt{ysize}$ |
| `front`, `back` | $z = 0$, $z = \texttt{zsize}$ (3D only) |
| `walls_x`, `walls_y`, `walls_z` | unions of the above |

The crucial detail is that every wall tag is built with its **full closure**:
not just the face entities, but also the edge and vertex entities lying on
that wall. Lagrangian DOFs sitting on box edges and corners belong to those
lower-dimensional topological entities, and a Dirichlet tag that lists only
the face entity leaves them **unconstrained**. In 3D this produced visible
flow leaking along all 12 box edges with `"prescribed"` walls — face
interiors exactly zero, edge velocities up to the interior velocity scale; in
2D the 4 corner nodes escaped the constraint.

`tag_box_walls!` (`src/core/Mesh.jl`) therefore collects entities
*geometrically*: `_wall_entity_set(model, on_wall)` walks every face of
dimension $0 \le d \le D-1$ and keeps the entity if **all** its vertices
satisfy the wall-membership predicate (e.g.
`x -> abs(x[ax] - val) <= tol` with `tol = 1e-8 · max(|domain|, 1)`). This
makes no assumption about Gridap's internal entity numbering and works for
mapped (chunk) geometries too.

Overlap at shared edges/corners is intentional: Gridap assigns each
constrained DOF to the *first* tag in `dirichlet_tags` that contains its
entity, so the `wall_specs` ordering in `build_spaces` (side walls first)
decides ownership deterministically.

The same helper is reused by the GMG hierarchy builder
(`build_gmg_hierarchy` in `src/solvers/GMG.jl`): coarse-level spaces **must**
constrain exactly the same walls — including edge/corner entities — as the
fine space, or the geometric prolongation maps free DOFs inconsistently and
the Galerkin coarse operators are wrong. `velocity_dirichlet_tags(cfg)`
(`src/core/FESpaces.jl`) is the single shared source of which walls carry a
strong constraint.

## Velocity boundary conditions

Each wall is typed by a config key in `[boundary_velocity]`
(`bc_left`, `bc_right`, `bc_surface`, `bc_deep`, and in 3D `bc_front`,
`bc_back`):

- `"prescribed"` — strong Dirichlet; the value closure comes from
  `src/boundary_conditions/Velocity.jl` (`bc_left(cfg)`, … `bc_zwall(cfg)`).
- `"free_slip"` — no Dirichlet tag; no-penetration $\mathbf u\cdot\mathbf n = 0$
  is enforced weakly by the penalty boundary integral
  $\int_\Gamma \gamma (\mathbf u\cdot\mathbf n)(\mathbf v\cdot\mathbf n)\,d\Gamma$
  added by the Stokes form, with $\gamma$ scaled by `free_slip_penalty`
  (default `1000.0`).
- `"traction"` — Neumann traction added to the RHS (see
  `build_traction_bcs` in `src/physics/Stokes.jl` and the
  `t_traction_*_n` / `t_traction_*_t` keys).

If *all* walls are free-slip, the velocity space is built without Dirichlet
tags; the penalty terms alone exclude rigid-body modes.

Temperature uses per-wall types `bcT_surface` / `bcT_deep`
(`"dirichlet"` → strong via `bc_T_surface(cfg)` / `bc_T_deep(cfg)`;
`"flux"`, `"robin"`, `"insulating"` → weak form, see
[Heat transport](../physics/heat.md)). Composition is always insulating
(no Dirichlet).

## Chunk geometry (2D wedge and 3D spherical shell)

Setting `geometry = "chunk"` builds a curved wedge as a
`CartesianDiscreteModel` over reference coordinates with a lifting map
passed through Gridap's `map` keyword (`_build_chunk_model` in
`src/core/Mesh.jl`). Pair it with `gravity_model = "radial"`.

**2D** — annular wedge $r \in [r_\text{inner}, r_\text{outer}]$,
$\theta \in [-\Delta\theta/2, +\Delta\theta/2]$ (`r_inner`, `r_outer`,
`chunk_theta_extent`):

```math
(r, \theta) \mapsto (x, y) = (r\cos\theta,\; r\sin\theta)
```

**3D** — spherical-shell wedge (`geometry = "chunk"` with `dim = 3`, or the
alias `geometry = "sphere_shell"`), adding `chunk_phi_extent` for the
latitude span. With $\theta$ the longitude and $\varphi$ the latitude,

```math
(r, \theta, \varphi) \mapsto
(x, y, z) = \bigl(r\cos\varphi\cos\theta,\; r\cos\varphi\sin\theta,\; r\sin\varphi\bigr)
```

a single-block wedge centred on the $+x$ axis (valid for caps
$\Delta\theta, \Delta\varphi < \pi$; a cubed sphere would be needed for
wider caps). Wall tags keep the same names so the BC machinery works
unchanged — `surface` is $r = r_\text{outer}$, `deep` is $r = r_\text{inner}$,
`left`/`right` are the $\theta$ rays, and in 3D `front`/`back` are the
$\varphi$ faces — discovered geometrically in *physical* coordinates
(predicates on the radius, $\operatorname{atan}(y,x)$, and the latitude),
since the map bends the reference box.

A chunk `MeshBundle` is marked `adapted = true`: markers live in physical
coordinates, so the Cartesian reference-coordinate fast paths for marker
location and field evaluation are invalid and the code falls back to
Gridap's KDTree point-in-cell search (see [Markers](./markers.md) and the
[AMR & ALE](./amr_ale.md) caveats, which share the same flag). For the same
reason the **geometric multigrid hierarchy cannot be built on a mapped
mesh** (it needs the structured Cartesian reference lattice for its $O(n)$
transfer operators), so chunk runs fall back to the direct MUMPS solve;
multigrid for mapped geometries — by carrying the transfer in reference
coordinates — is a planned follow-up. Marker **reseeding** is likewise
skipped on mapped/adapted meshes (the reference-lattice cell-centre
placement would mis-locate markers); it warns once.

## The MeshBundle

`MeshBundle` packages the model, the volume triangulation `Ω` and measure
`dΩ`, per-tag boundary triangulations/measures (`Γs`/`dΓs`), the base
Cartesian cell counts `nel`, the domain box, and the `adapted` flag that
gates every Cartesian fast path in the code (marker binning, direct $Q_2$/$Q_1$
evaluation, GMG hierarchy construction). Uniform cell sizes are exposed as
`cell_dx` / `cell_dy` / `cell_dz`, used by marker location and the
[CFL step control](./time_stepping.md).
