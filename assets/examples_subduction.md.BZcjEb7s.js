import{_ as i,o as a,c as n,an as l}from"./chunks/framework.Xu3Q0CJC.js";const g=JSON.parse('{"title":"Subduction","description":"","frontmatter":{},"headers":[],"relativePath":"examples/subduction.md","filePath":"examples/subduction.md","lastUpdated":null}'),p={name:"examples/subduction.md"};function h(k,s,t,e,E,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="Subduction" tabindex="-1">Subduction <a class="header-anchor" href="#Subduction" aria-label="Permalink to &quot;Subduction {#Subduction}&quot;">​</a></h1><p>Plate-driven trench with slab descent (oceanic–continental / oceanic–oceanic).</p><p>Run it with:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">julia</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -t</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> auto</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --project=.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.jl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cases/subduction.toml</span></span></code></pre></div><p>Full case file — <a href="https://github.com/okaragoz/MILET/blob/main/cases/subduction.toml" target="_blank" rel="noreferrer"><code>cases/subduction.toml</code></a>:</p><div class="language-toml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Oceanic subduction case — two-plate symmetric convergence (two-plate symmetric setup).</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Domain: 4000 km × 1400 km (y = 0 surface, +y depth).</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Q2-Q1 Taylor-Hood FEM, MUMPS direct solver.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">case = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;subduction&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── domain &amp; resolution ──────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dim   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xsize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4000000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 4000 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ysize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1400000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 1400 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nx    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">201</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            # 200 cells, 20 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ny    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">71</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">             # 70 cells, 20 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mnx   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mny   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── gravity ──────────────────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gx = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gy = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9.81</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">pinit = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── rheology limits ──────────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            # asthenosphere floor (was 1e18 — gave unphysical 1000 cm/yr flows)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e25</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── time control ─────────────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxxystep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxtkstep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxtmstep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.5768e13</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # ≈ 500 kyr</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ntot      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── physics toggles ──────────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_stokes        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_heat          = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_advect        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_adiabatic     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_shear_heating = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_friction      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_phase_change  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_melting       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_free_surface  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_radiogenic    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── FEM discretization ───────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_v = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # Q2 velocity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_p = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # Q1 pressure (Taylor-Hood)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_T = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n_picard   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">picard_tol = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-3</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── solver ───────────────────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">solver_type = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;mumps&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">krylov_tol  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">krylov_maxit = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gmg_levels  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── IO ───────────────────────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">output_dir   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;output/subduction&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">output_every = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">str_min      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eii_seed        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-15</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # mild seed — engages power-law without overheating</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">body_force_full = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # Boussinesq perturbation (ρ−ρ̄)·g: stable with our pressure null-space</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">marker_T_mode   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;overwrite&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # subduction convection-light — PIC not needed</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── thermal BCs ──────────────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_top = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_bot = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1623.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── subduction geometry ──────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">trench_x            = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plate_thickness     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">80000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plate_age           = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">continent_thickness = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">120000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">air_thick           = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_plate_left        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">294000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_plate_right       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3706000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vx_plate            =  </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9.51173113506658e-10</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vx_plate_right      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-9.51173113506658e-10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── free surface ─────────────────────────────────────────────────────────────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">air_rock_id    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">surface_smooth = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Rocks (1=air, 2=oceanic crust, 3=continental crust, 4=lith mantle, 5=asthen)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">beta=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ss=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.97e17</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">154000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ss=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2900.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">beta=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e-7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e23</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ss=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2700.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">beta=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.06</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e25</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.97e17</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">154000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ss=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">beta=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-11</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e-8</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e22</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                # lithospheric mantle: strong (was 1e18; never softer than 10²²)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e25</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                # ceiling raised to engage MC plasticity at hinge</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">7e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.97e17</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">154000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ss=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">beta=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-11</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e-8</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.03</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.01</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                # asthenosphere floor (raised from 1e18 — too weak)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e22</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                # max — allows some stiffness in deep regions</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">7e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── Phase transitions (Olivine → Wadsleyite at 410 km; eclogitization of basalt at 70 km) ──</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">phase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_from = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # asthenosphere</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_to   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">transition = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_ref = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1700.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">P_ref = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">14e9</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # ~410 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">clapeyron = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e-9</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # +2.5 MPa/K (exothermic)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">drho = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">270</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           # +270 kg/m³</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">latent = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-90000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # -90 kJ/kg (released)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">phase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_from = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # oceanic crust</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_to   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # transforms to eclogite (heavier — joins lith mantle)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">transition = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # depth-triggered</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">depth = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">70e3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">drho = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">latent = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── Melting (Katz-style for oceanic crust + asthenosphere) ──</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">melt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id           = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # oceanic crust</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_solidus_ref     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1085.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_liquidus_ref    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1780.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">solidus_dPdT      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">132.9e-9</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">liquidus_dPdT     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">89.0e-9</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">H_latent_melt     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4e5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">extract_threshold = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_after_extract = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">melt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id           = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # asthenosphere</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_solidus_ref     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1085.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_liquidus_ref    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1780.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">solidus_dPdT      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">132.9e-9</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">liquidus_dPdT     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">89.0e-9</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">H_latent_melt     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4e5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">extract_threshold = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_after_extract = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span></code></pre></div>`,6)])])}const y=i(p,[["render",h]]);export{g as __pageData,y as default};
