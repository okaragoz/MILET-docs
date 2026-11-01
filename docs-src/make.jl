# Build the MILET documentation with DocumenterVitepress.
#
#   julia --project=docs-src docs-src/make.jl         # full site build
#   julia --project=docs-src docs-src/make.jl serve   # dev server with live reload
#
# MILET is a flat-include research code (no package module), so the docs are
# narrative markdown pages — physics, numerics, and reference — rather than
# docstring-generated API listings.

using Documenter
using DocumenterVitepress

# ── Example case pages ───────────────────────────────────────────────────────
# One left-sidebar page per tectonic regime, generated at build time so the
# embedded TOML stays in sync with the actual case files under cases/.
# Tuple: (sidebar title, page slug, path to .toml relative to repo root, blurb).
# The MILET code is a separate repository: set MILET_ROOT to a clone of it
# (default: a MILET folder next to this MILET-docs clone).
const REPO_ROOT = normpath(get(ENV, "MILET_ROOT", joinpath(@__DIR__, "..", "..", "MILET")))
isfile(joinpath(REPO_ROOT, "main.jl")) ||
    error("MILET code not found at $REPO_ROOT: set MILET_ROOT to a clone of okaragoz/MILET")

# Optional animation shown under an example's blurb: MP4 + poster in
# docs-src/src/media/ (rendered by docs-src/scripts/render_*.py).  Referenced with a
# relative path so Vite bundles it as an asset and applies the site base.
const EXAMPLE_MEDIA = Dict(
    "chunk_plumes" => ("chunk_plumes", "Temperature in the 2-D spherical chunk as plumes rise from the core-mantle boundary"),
    "convection3d" => ("convection3d", "Temperature isosurfaces and velocity in the 3-D convection box"),
    "mor3d"        => ("mor3d", "Dynamic topography and temperature of the 3-D ridge with a transform offset"),
)

const EXAMPLE_GROUPS = [
    "Horizontal / plate regimes" => [
        ("Subduction", "subduction", "cases/subduction.toml",
         "Plate-driven trench with slab descent (oceanic–continental / oceanic–oceanic)."),
        ("Continental collision", "collision", "cases/collision.toml",
         "Convergent orogeny — crustal thickening and shortening."),
        ("Continental rifting", "rifting", "cases/extension.toml",
         "Divergent walls with a weak crustal seed that localises a rift."),
        ("Mid-ocean ridge with a transform (3-D)", "mor3d", "cases/mor3d.toml",
         "Two ridge segments offset by a 40 km transform spread at 3 cm/yr per side above half-space-cooling plates. The seafloor is a free-slip surface; its deformation is shown as dynamic topography, h = -(σyy - <σyy>)/((ρm - ρw) g), which develops axial valleys along both segments and relief at the ridge-transform intersections."),
        ("Mid-ocean ridge spreading", "ridge", "cases/examples/ridge.toml",
         "Symmetric spreading with passive asthenospheric upwelling at the axis. **Starter template.**"),
        ("Transform / strike-slip", "transform", "cases/examples/transform.toml",
         "Map-view simple shear across a weak fault zone. **Starter template.**"),
        ("Transtension / transpression", "transtension", "cases/examples/transtension.toml",
         "Oblique driving = strike-slip + fault-normal opening (transtension) or closing (transpression). **Starter template.**"),
    ],
    "Vertical / intraplate regimes" => [
        ("Lithospheric drip & delamination", "drip", "cases/holt_condit_2021.toml",
         "A dense lithospheric root founders / peels away (Holt & Condit 2021)."),
        ("Eclogite foundering (Venus plateau)", "venus_eclogite", "cases/venus_eclogite_foundering.toml",
         "A thick basaltic plateau eclogitises through the divariant mode-3 reaction and founders when the mantle beneath it is weak enough (Karagoz 2026, JGR: Planets, in revision). Commented lines switch on composite creep with a fixed grain size, wet olivine and the dry-eclogite rheology blend."),
        ("Stagnant lid", "stagnant_lid", "cases/solomatov_stagnant.toml",
         "Temperature-dependent-viscosity convection with an immobile lid (mobility M ≪ 1)."),
        ("Mantle plumes / hotspots", "plume", "cases/plume.toml",
         "A bottom-heated Gaussian thermal anomaly rises as a plume."),
        ("3-D thermal convection in a box", "convection3d", "cases/convection3d.toml",
         "Bottom-heated, isoviscous convection in a unit cube at Ra = 10⁵ with free-slip walls: cold sheets and hot plumes grow from a perturbed conductive state into time-dependent flow."),
        ("Mantle plumes in a spherical chunk (2-D)", "chunk_plumes", "cases/chunk_plumes.toml",
         "Whole-mantle plumes in a 92° annular wedge with radial gravity: a hot core-mantle boundary layer, thickened at a few uneven angles, feeds plumes that rise toward a cold surface boundary layer."),
        ("Sagduction", "sagduction", "cases/examples/sagduction.toml",
         "Dense greenstone over buoyant TTG crust → Rayleigh–Taylor drips. **Starter template.**"),
        ("Plutonic squishy / sluggish lid", "squishy_lid", "cases/examples/squishy_lid.toml",
         "Convection beneath a weak, yielding lid (intermediate mobility). **Starter template.**"),
    ],
]

let exdir = joinpath(@__DIR__, "src", "examples")
    isdir(exdir) || mkpath(exdir)
    for (_group, items) in EXAMPLE_GROUPS
        for (title, slug, tomlpath, blurb) in items
            toml = read(joinpath(REPO_ROOT, tomlpath), String)
            open(joinpath(exdir, slug * ".md"), "w") do io
                println(io, "# ", title, "\n")
                println(io, blurb, "\n")
                if haskey(EXAMPLE_MEDIA, slug) &&
                   isfile(joinpath(@__DIR__, "src", "media", EXAMPLE_MEDIA[slug][1] * ".mp4"))
                    stem, alt = EXAMPLE_MEDIA[slug]
                    println(io, "```@raw html")
                    println(io, "<video class=\"milet-example-video\" src=\"../media/", stem,
                            ".mp4\" poster=\"../media/", stem, ".jpg\" controls autoplay muted loop playsinline",
                            " preload=\"metadata\" aria-label=\"", alt, "\" style=\"width:100%;border-radius:8px\"></video>")
                    println(io, "```\n")
                end
                println(io, "Run it with:\n")
                println(io, "```bash")
                println(io, "julia -t auto --project=. main.jl ", tomlpath)
                println(io, "```\n")
                println(io, "Full case file — [`", tomlpath,
                        "`](https://github.com/okaragoz/MILET/blob/main/", tomlpath, "):\n")
                println(io, "````toml")
                print(io, toml)
                endswith(toml, "\n") || println(io)
                println(io, "````")
            end
        end
    end
end

# Sidebar nav: "Examples" group → category subgroups → one page per regime.
example_nav = "Examples" => [
    group => [title => "examples/$slug.md" for (title, slug, _p, _b) in items]
    for (group, items) in EXAMPLE_GROUPS
]

makedocs(;
    sitename = "MILET",
    authors  = "Oğuz Karagöz",
    format   = DocumenterVitepress.MarkdownVitepress(
        repo = "github.com/okaragoz/MILET-docs",
        devbranch = "main",
        devurl = "dev",
    ),
    pages = [
        "Home" => "index.md",
        "Getting started" => "getting_started.md",
        example_nav,
        "Physics" => [
            "Governing equations" => "physics/governing_equations.md",
            "Compressibility"     => "physics/compressibility.md",
            "Rheology"            => "physics/rheology.md",
            "Two-phase flow"      => "physics/two_phase.md",
            "Grain-size evolution"=> "physics/grain_size.md",
            "Softening & healing" => "physics/softening.md",
            "Phase changes"       => "physics/phase_changes.md",
            "Melting"             => "physics/melting.md",
            "Heat transport"      => "physics/heat.md",
            "Free surface"        => "physics/free_surface.md",
        ],
        "Numerics" => [
            "Discretization"      => "numerics/discretization.md",
            "Linear solvers"      => "numerics/solvers.md",
            "Geometric multigrid" => "numerics/multigrid.md",
            "Markers"             => "numerics/markers.md",
            "Time stepping"       => "numerics/time_stepping.md",
            "AMR & ALE"           => "numerics/amr_ale.md",
        ],
        "Reference" => [
            "Parameter file"      => "reference/parameter_file.md",
            "Function reference"  => "reference/functions.md",
            "Benchmarks"          => "reference/benchmarks.md",
        ],
        "Development" => [
            "Architecture"        => "dev/architecture.md",
            "Testing"             => "dev/testing.md",
        ],
    ],
    warnonly = true,   # narrative docs: missing-link warnings must not fail the build
    checkdocs = :none,
    remotes = nothing,
)

# Deployment (see README.md): build with CI=true so the site base is /MILET-docs/,
# then copy docs-src/build/1/ to the top of this repository (main).
