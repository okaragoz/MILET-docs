#!/usr/bin/env python3
"""
Render the 3D box-convection example (cases/convection3d.toml) in perspective
for the home-page showcase: semi-transparent temperature isosurfaces and
velocity arrows coloured by speed.

Usage:
    python3 docs/scripts/render_convection3d.py <output_dir_of_convection3d_run> [max_step]

Writes docs-src/src/media/convection3d.mp4 (+ .jpg poster). Requires pyvista,
Pillow and imageio-ffmpeg.
"""
import glob, os, re, sys
import numpy as np
import pyvista as pv
from PIL import Image

pv.OFF_SCREEN = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from video_utils import save_mp4
MEDIA = os.environ.get("OUT_DIR") or os.path.normpath(os.path.join(HERE, "..", "src", "media"))
run = sys.argv[1]
max_step = int(sys.argv[2]) if len(sys.argv) > 2 else 10**9
files = [f for f in sorted(glob.glob(os.path.join(run, "solution_*.vtu")))
         if int(re.search(r"(\d+)\.vtu$", f).group(1)) <= max_step]
assert files, f"no solution_*.vtu in {run}"

W, H = 900, 780
LEVELS = [0.12, 0.3, 0.45, 0.6, 0.75, 0.9]   # nondimensional temperature
CMAP = "turbo"
frames = []
for f in files:
    m = pv.read(f)
    m.points[:, 1] = m.points[:, 1].max() - m.points[:, 1]   # y is depth in MILET: flip so "up" is up
    T = np.asarray(m["temperature_K"]).ravel()
    m.point_data.clear()
    m["T"] = T
    m["v"] = np.asarray(pv.read(f)["velocity_m_s"])
    lo = np.array(m.bounds[0::2]); hi = np.array(m.bounds[1::2])
    n = 61
    grid = pv.ImageData(dimensions=(n, n, n), origin=tuple(lo), spacing=tuple((hi - lo) / (n - 1)))
    grid = grid.sample(m)
    p = pv.Plotter(off_screen=True, window_size=(W, H))
    p.set_background("white")
    p.add_mesh(pv.Box(bounds=tuple(np.ravel(np.column_stack([lo, hi])))).outline(), color="#444444", line_width=1.2)
    for lev in LEVELS:
        s = grid.contour([lev], scalars="T")
        if s.n_points:
            op = 0.95 if lev == LEVELS[0] else 0.45
            p.add_mesh(s, scalars="T", cmap=CMAP, clim=(0, 1), opacity=op,
                       smooth_shading=True, specular=0.4, show_scalar_bar=False)
    # velocity arrows on a coarse sub-lattice, coloured by speed
    arrows_src = pv.ImageData(dimensions=(9, 9, 9), origin=tuple(lo + 0.06 * (hi - lo)),
                              spacing=tuple(0.88 * (hi - lo) / 8)).sample(m)
    v = np.asarray(arrows_src["v"]).copy(); v[:, 1] *= -1            # flip vy with the axis
    sp = np.linalg.norm(v, axis=1); vmax = sp.max() if sp.max() > 0 else 1.0
    arrows_src["vec"] = v / vmax
    arrows_src["speed"] = sp / vmax
    arrows_src = arrows_src.threshold(0.15, scalars="speed")          # skip near-stagnant points
    gl = arrows_src.glyph(orient="vec", scale="speed", factor=0.13,
                          geom=pv.Arrow(tip_length=0.35, tip_radius=0.12, shaft_radius=0.045))
    p.add_mesh(gl, scalars="speed", cmap=CMAP, clim=(0, 1), show_scalar_bar=False)
    p.camera_position = [(2.9, 2.2, 3.1), (0.5, 0.45, 0.5), (0, 1, 0)]
    p.camera.zoom(1.12)
    img = p.screenshot(return_img=True)
    p.close()
    frames.append(Image.fromarray(img))

out = os.path.join(MEDIA, "convection3d.mp4")
save_mp4(frames, out, fps=6, hold_last=1.0, crop=True,
         poster=os.path.join(MEDIA, "convection3d.jpg"), poster_index=len(frames) // 2)
print("wrote", out, f"({len(frames)} frames, {frames[0].size})")
