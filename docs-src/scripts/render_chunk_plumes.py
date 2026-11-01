#!/usr/bin/env python3
"""
Render the 2-D spherical-chunk plume example (cases/chunk_plumes.toml) as an
animated temperature field for its example page.

Usage:
    python3 docs/scripts/render_chunk_plumes.py <output_dir_of_chunk_plumes_run>

Writes docs-src/src/media/chunk_plumes.mp4 (+ .jpg poster). Requires pyvista,
matplotlib, scipy, cmcrameri, Pillow and imageio-ffmpeg.

The Q1 temperature lives on the regular (r, θ) node grid of the chunk mesh;
it is put back on that grid and interpolated bicubically (tensor-product
cubic spline in (r, θ), clipped to the boundary temperatures) onto a 10x
finer polar grid for a smooth image.
"""
import glob, io, os, re, sys
import numpy as np
import pyvista as pv
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from cmcrameri import cm as cmc
from scipy.interpolate import RegularGridInterpolator
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from video_utils import save_mp4
MEDIA = os.environ.get("OUT_DIR") or os.path.normpath(os.path.join(HERE, "..", "src", "media"))
run = sys.argv[1]
files = sorted(glob.glob(os.path.join(run, "solution_*.vtu")))
assert files, f"no solution_*.vtu in {run}"

# model time of each output step, from run.log (step, time_yr, ...)
times = {}
for line in open(os.path.join(run, "run.log")):
    parts = line.split()
    if parts and parts[0].isdigit():
        times[int(parts[0])] = float(parts[1])

T_LO, T_HI = 273.0, 3500.0
frames = []
for f in files:
    m = pv.read(f)
    T = np.asarray(m["temperature_K"]).ravel()
    r = np.hypot(m.points[:, 0], m.points[:, 1])
    th = np.arctan2(m.points[:, 1], m.points[:, 0])
    # VTU stores per-cell vertex copies: rebuild the (r, θ) nodal grid.
    rs = np.unique(r.round(0)); ths = np.unique(th.round(7))
    i = np.searchsorted(rs, r.round(0)); j = np.searchsorted(ths, th.round(7))
    grid = np.zeros((len(rs), len(ths))); cnt = np.zeros_like(grid)
    np.add.at(grid, (i, j), T); np.add.at(cnt, (i, j), 1.0)
    grid /= np.maximum(cnt, 1.0)
    interp = RegularGridInterpolator((rs, ths), grid, method="cubic")
    rf = np.linspace(rs[0], rs[-1], 10 * len(rs))
    tf = np.linspace(ths[0], ths[-1], 10 * len(ths))
    RF, TF = np.meshgrid(rf, tf, indexing="ij")
    Tf = np.clip(interp((RF, TF)), T_LO, T_HI)
    X, Y = -RF * np.sin(TF) / 1e3, RF * np.cos(TF) / 1e3   # chunk axis points up (km)
    fig, ax = plt.subplots(figsize=(9.0, 5.4), dpi=130)
    pc = ax.pcolormesh(X, Y, Tf, shading="gouraud", cmap=cmc.lajolla, vmin=T_LO, vmax=T_HI,
                       rasterized=True)
    ax.set_aspect("equal"); ax.axis("off")
    step = int(re.search(r"(\d+)\.vtu$", f).group(1))
    t_myr = times.get(step, 0.0) / 1e6
    ax.set_title(f"t = {t_myr:5.1f} Myr", fontsize=12, loc="left")
    cb = fig.colorbar(pc, ax=ax, orientation="horizontal", fraction=0.045, pad=0.02, shrink=0.5)
    cb.set_label("Temperature (K)", fontsize=10); cb.ax.tick_params(labelsize=9)
    buf = io.BytesIO(); fig.savefig(buf, format="png", facecolor="white", bbox_inches="tight", pad_inches=0.08); plt.close(fig)
    buf.seek(0); frames.append(Image.open(buf).convert("RGB"))

out = os.path.join(MEDIA, "chunk_plumes.mp4")
save_mp4(frames, out, fps=8, hold_last=1.0, crop=True, poster=os.path.join(MEDIA, "chunk_plumes.jpg"))
print("wrote", out, f"({len(frames)} frames, {frames[0].size})")
