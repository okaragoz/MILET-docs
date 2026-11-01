#!/usr/bin/env python3
"""
Render the 3D mid-ocean-ridge example (cases/mor3d.toml) as a block diagram:
dynamic topography of the free-slip seafloor on top (vertically exaggerated)
and temperature on the front and side faces (from the FE solution).

Dynamic topography, water-loaded:  h = -(σyy - <σyy>) / ((ρm - ρw) g),
σyy = -p + 2η ∂vy/∂y just below the top (y = depth, positive down), so the
surface rises over upwelling and sinks over downwelling.

Usage:
    python3 docs/scripts/render_mor3d.py <output_dir_of_mor3d_run>

Writes docs-src/src/media/mor3d.mp4 (+ .jpg poster). Requires pyvista, scipy,
cmcrameri, Pillow and imageio-ffmpeg.
"""
import glob, os, re, sys
import numpy as np
import pyvista as pv
from cmcrameri import cm as cmc
from scipy.ndimage import gaussian_filter
from PIL import Image

pv.OFF_SCREEN = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from video_utils import save_mp4
MEDIA = os.environ.get("OUT_DIR") or os.path.normpath(os.path.join(HERE, "..", "src", "media"))
run = sys.argv[1]
AIR = 0.0                    # model top = seafloor (no sticky air)
VE = 10.0                    # vertical exaggeration of the seafloor
T_SKIP_MYR = 0.3             # skip the start-up transient (initial stresses adjusting to the plates)
RHO_M, RHO_W, G = 3300.0, 1030.0, 9.81
files = sorted(glob.glob(os.path.join(run, "solution_*.vtu")))
assert files, f"no solution_*.vtu in {run}"

times = {}
for line in open(os.path.join(run, "run.log")):
    p = line.split()
    if p and p[0].isdigit():
        times[int(p[0])] = float(p[1])


def dynamic_topography(m, xc, zc, dy):
    """Water-loaded dynamic topography (m, + up) on the (xc, zc) grid."""
    def sample(y):
        pts = pv.PolyData(np.array([(x, y, z) for z in zc for x in xc]))
        return pts.sample(m)
    top, below = sample(1.0), sample(dy)
    p = np.asarray(top["pressure_Pa"]).ravel()
    vy0 = np.asarray(top["velocity_m_s"])[:, 1]
    vy1 = np.asarray(below["velocity_m_s"])[:, 1]
    eta = np.asarray(sample(0.5 * dy)["viscosity_Pa_s"]).ravel()
    syy = -p + 2.0 * eta * (vy1 - vy0) / dy
    syy = syy.reshape(len(zc), len(xc))
    inner = np.zeros_like(syy, dtype=bool); inner[:, 2:-2] = True   # skip wall-corner spikes
    h = -(syy - syy[inner].mean()) / ((RHO_M - RHO_W) * G)
    # σ = 2 bins ≈ 8 km: removes cell-scale (8.6 km) noise from yielding in the
    # plastic crust, which this mesh cannot resolve anyway.
    return gaussian_filter(h, 2.0)


W, H = 1100, 840
clim_T = (273.0, 1623.0)

# pass 1: seafloor elevation per frame (fixed colour range over the whole run)
data = []
for f in files:
    step = int(re.search(r"(\d+)\.vtu$", f).group(1))
    if times.get(step, 0.0) / 1e6 < T_SKIP_MYR:
        continue
    m = pv.read(f)
    lo = np.array(m.bounds[0::2]); hi = np.array(m.bounds[1::2])
    xs = np.linspace(lo[0], hi[0], 61); zs = np.linspace(lo[2], hi[2], 31)
    xc, zc = 0.5 * (xs[1:] + xs[:-1]), 0.5 * (zs[1:] + zs[:-1])
    elev = dynamic_topography(m, xc, zc, dy=0.5 * (hi[1] - lo[1]) / 16)
    data.append((f, step, lo, hi, xc, zc, elev))
allz = np.concatenate([d[-1].ravel() for d in data])
lim = float(np.percentile(np.abs(allz), 99))
clim_e = (-lim, lim)                                       # symmetric about the mean seafloor

# pass 2: render
frames = []
for f, step, lo, hi, xc, zc, elev in data:
    m = pv.read(f)
    # display coords (km): X = x, Y = up, Z = z; rock top at Y = 0, depth negative
    # surface on the bin centres plus the box edges (edge-padded), so it meets
    # the block outline; the deepest seafloor rests on the block top.
    xg = np.concatenate([[lo[0]], xc, [hi[0]]]) / 1e3
    zg = np.concatenate([[lo[2]], zc, [hi[2]]]) / 1e3
    eg = np.pad(elev, 1, mode="edge")
    Yg = (eg - clim_e[0]) / 1e3 * VE
    XX, ZZ = np.meshgrid(xg, zg)
    surf = pv.StructuredGrid(XX, Yg, ZZ)
    surf["elev"] = eg.ravel(order="F")
    # curtains closing the gap between the block top and the exaggerated
    # seafloor along the two edges facing the camera
    def curtain(xline, zline, yline):
        n = len(yline)
        X = np.vstack([xline, xline]); Z = np.vstack([zline, zline])
        Y = np.vstack([np.zeros(n), yline])
        return pv.StructuredGrid(X, Y, Z)
    curt_front = curtain(xg, np.full_like(xg, zg[-1]), Yg[-1, :])
    curt_side = curtain(np.full_like(zg, xg[-1]), zg, Yg[:, -1])

    rockpart = m.clip_box((lo[0], hi[0], AIR, hi[1], lo[2], hi[2]), invert=False)
    def face(normal, origin):
        s = rockpart.slice(normal=normal, origin=origin)
        P = np.asarray(s.points).copy()
        s.points = np.column_stack([P[:, 0] / 1e3, (AIR - P[:, 1]) / 1e3, P[:, 2] / 1e3])
        return s
    front = face("z", (0, 0, hi[2] - 1.0))      # faces the camera
    side = face("x", (hi[0] - 1.0, 0, 0))

    p = pv.Plotter(off_screen=True, window_size=(W, H))
    p.set_background("white")
    p.add_mesh(surf, scalars="elev", cmap=cmc.oslo, clim=clim_e, smooth_shading=True,
               specular=0.25, scalar_bar_args=dict(title="Dynamic topography (m)", n_labels=4,
               position_x=0.06, position_y=0.03, width=0.32, height=0.05, fmt="%.0f",
               color="#333333", title_font_size=15, label_font_size=12, vertical=False))
    for s in (front, side):
        p.add_mesh(s, scalars="temperature_K", cmap=cmc.lajolla, clim=clim_T, lighting=False,
                   scalar_bar_args=dict(title="Temperature (K)", n_labels=4, position_x=0.62,
                   position_y=0.03, width=0.32, height=0.05, fmt="%.0f", color="#333333",
                   title_font_size=15, label_font_size=12, vertical=False))
    for c in (curt_front, curt_side):
        p.add_mesh(c, color="#9aa7b4", lighting=False)
    depth = (hi[1] - AIR) / 1e3
    p.add_mesh(pv.Box(bounds=(lo[0] / 1e3, hi[0] / 1e3, -depth, 0.0, lo[2] / 1e3, hi[2] / 1e3)).outline(),
               color="#555555", line_width=1.0)
    p.add_text(f"t = {times.get(step, 0.0) / 1e6:4.1f} Myr   (dynamic topography ×{VE:.0f} vertical)",
               position="upper_left", font_size=12, color="#333333")
    cx, cz = 0.5 * (lo[0] + hi[0]) / 1e3, 0.5 * (lo[2] + hi[2]) / 1e3
    p.camera_position = [(cx + 250, 170, cz + 330), (cx, -35, cz), (0, 1, 0)]
    p.camera.zoom(1.0)
    frames.append(Image.fromarray(p.screenshot(return_img=True)))
    p.close()

out = os.path.join(MEDIA, "mor3d.mp4")
save_mp4(frames, out, fps=4, hold_last=1.5, crop=True,
         poster=os.path.join(MEDIA, "mor3d.jpg"), poster_index=-1)
print("wrote", out, f"({len(frames)} frames, {frames[0].size})")
