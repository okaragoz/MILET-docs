# MILET-docs sources

The website https://okaragoz.github.io/MILET-docs/ is served from the top of
this repository (branch gh-pages, its only branch). This folder holds its
sources: the pages (`src/`) and the build script (`make.jl`). The code itself
is in the separate repository okaragoz/MILET.

## Build

The example pages embed TOML files from the MILET code, so the build needs a
clone of okaragoz/MILET. By default it looks for a `MILET` folder next to this
repository's folder; otherwise set `MILET_ROOT`.

```bash
MILET_ROOT=/path/to/MILET CI=true julia --project=docs-src docs-src/make.jl
```

`CI=true` makes the links start with `/MILET-docs/`; without it every link on
the live site breaks. The site is written to `docs-src/build/1/`.

## Deploy

```bash
rsync -a --delete --exclude .git --exclude .nojekyll --exclude .gitignore \
      --exclude docs-src docs-src/build/1/ ./
```

Check that the hrefs start with `/MILET-docs/`, then commit
"deploy: okaragoz/MILET@<short sha>" and push.

The code itself: https://github.com/okaragoz/MILET (private).
