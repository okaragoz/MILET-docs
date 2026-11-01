#!/usr/bin/env python3
"""
Plot the van Keken et al. (1997) benchmark for the Benchmarks page: Vrms over
time in cases 1a and 1c for the three interface treatments, on 96 x 96 cells.

Usage:
    python3 docs-src/scripts/plot_vankeken.py <MILET clone>

Reads <MILET>/output/vankeken1997_<case>_n97{,_bilinear,_smooth1.0}/bench.csv,
written by test/validation/vankeken_rt.jl, and writes
docs-src/src/media/vankeken1997.svg. Requires numpy and matplotlib.
"""
import os, sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

milet = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "..", "..", "..", "MILET")
out = os.path.join(os.path.dirname(__file__), "..", "src", "media", "vankeken1997.svg")

REF = {"1a": (208.99, 0.0031), "1c": (49.57, 0.0146)}
ZOOM = {"1a": (190, 235), "1c": (46, 53)}
TITLE = {"1a": "Case 1a: equal viscosities", "1c": "Case 1c: light layer 100× less viscous"}
METHODS = [("", "Sharp interface, host projection", "#2a78d6"),
           ("_bilinear", "Sharp interface, bilinear projection", "#eb6834"),
           ("_smooth1.0", "tanh interface (half width 1 cell), host", "#1baf7a")]
INK, MUTED, GRID = "#1f1f1e", "#6b6a64", "#e4e3de"

def series(case, suffix):
    d = np.loadtxt(os.path.join(milet, "output", f"vankeken1997_{case}_n97{suffix}", "bench.csv"),
                   delimiter=",", skiprows=1, usecols=(1, 3))
    return d[:, 0], d[:, 1]

plt.rcParams.update({"font.size": 10, "axes.edgecolor": MUTED, "axes.labelcolor": INK,
                     "xtick.color": MUTED, "ytick.color": MUTED, "text.color": INK})
fig, axes = plt.subplots(2, 2, figsize=(9.0, 6.4), facecolor="white")
for col, case in enumerate(("1a", "1c")):
    tr, vr = REF[case]
    for row in (0, 1):
        ax = axes[row, col]
        ax.set_facecolor("white")
        for suffix, label, color in METHODS:
            t, v = series(case, suffix)
            ax.plot(t, v * 1e3, color=color, lw=2 if row else 1.6, label=label)
        ax.plot([tr], [vr * 1e3], marker="o", ms=8, mfc="white", mec=INK, mew=2, ls="none",
                label="van Keken et al. (1997), first peak", zorder=5)
        ax.grid(color=GRID, lw=0.8)
        ax.set_axisbelow(True)
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
        if row == 0:
            ax.set_title(TITLE[case], fontsize=11, loc="left")
            ax.axvspan(*ZOOM[case], color=GRID, alpha=0.5, lw=0)
        else:
            lo, hi = ZOOM[case]
            ax.set_xlim(lo, hi)
            ax.set_ylim(vr * 1e3 * (0.94 if case == "1a" else 0.92), vr * 1e3 * 1.03)
            ax.set_title("Around the first peak (shaded above)", fontsize=10, loc="left", color=MUTED)
            ax.set_xlabel("Time (η / Δρ g H)")
        if col == 0:
            ax.set_ylabel("V$_{rms}$ (×10$^{-3}$)")
handles, labels = axes[0, 0].get_legend_handles_labels()
fig.legend(handles, labels, loc="lower center", ncol=2, frameon=False, fontsize=9.5)
fig.tight_layout(rect=(0, 0.08, 1, 1))
os.makedirs(os.path.dirname(out), exist_ok=True)
fig.savefig(out, facecolor="white")
if len(sys.argv) > 2:
    fig.savefig(sys.argv[2], facecolor="white", dpi=110)
print("wrote", os.path.abspath(out))
