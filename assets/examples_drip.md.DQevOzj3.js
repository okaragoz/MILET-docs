import{_ as i,o as a,c as n,an as l}from"./chunks/framework.Xu3Q0CJC.js";const y=JSON.parse('{"title":"Lithospheric drip &amp; delamination","description":"","frontmatter":{},"headers":[],"relativePath":"examples/drip.md","filePath":"examples/drip.md","lastUpdated":null}'),p={name:"examples/drip.md"};function h(k,s,t,e,E,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="Lithospheric-drip-and-delamination" tabindex="-1">Lithospheric drip &amp; delamination <a class="header-anchor" href="#Lithospheric-drip-and-delamination" aria-label="Permalink to &quot;Lithospheric drip &amp;amp; delamination {#Lithospheric-drip-and-delamination}&quot;">​</a></h1><p>A dense lithospheric root founders / peels away (Holt &amp; Condit 2021).</p><p>Run it with:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">julia</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -t</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> auto</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --project=.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.jl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cases/holt_condit_2021.toml</span></span></code></pre></div><p>Full case file — <a href="https://github.com/okaragoz/MILET/blob/main/cases/holt_condit_2021.toml" target="_blank" rel="noreferrer"><code>cases/holt_condit_2021.toml</code></a>:</p><div class="language-toml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Holt &amp; Condit (2021) &quot;Slab temperature evolution over the lifetime of a</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># subduction zone&quot; — reference thermo-mechanical model.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># https://zenodo.org/records/4543414</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Full thermo-mechanical setup with the Hirth-Kohlstedt composite diffusion+</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># dislocation Arrhenius creep, 90-Myr SP and 10-Myr OP, large lower-mantle</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># domain.  Scaled DOWN from Holt-Condit&#39;s 11600×2900 km (which needs AMR +</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 100 MPI ranks) to 5000×1500 km — still big but tractable on uniform mesh.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Reference paper figures show slab tip reaching the upper-mantle base</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># (660 km depth, in our 1500-km domain that&#39;s well above the bottom) in</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ~20-30 Myr, then continuing into the deeper mantle while folding /</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># stagnating below 660 km.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">case = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;subduction&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mesh</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dim   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xsize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5000000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 5000 km — scaled down from H-C 11600 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ysize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1500000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 1500 km — covers upper mantle + bit of lower</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nx    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">251</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            # 250 cells × 20 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ny    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">76</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">             # 75 cells × 20 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mnx   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mny   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gravity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gy = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9.81</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxxystep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxtkstep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxtmstep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2e13</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # ~650 kyr cap</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ntot      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rheology</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e18</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # H-C Minimum Viscosity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e24</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # H-C Maximum Viscosity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">str_min = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-20</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eii_seed = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-15</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_top = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_bot = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1694.5</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # H-C reference / bottom T</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_ref_density = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">marker_T_mode = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;overwrite&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">physics</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_stokes        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_heat          = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_advect        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_adiabatic     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_shear_heating = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_friction      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_phase_change  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_melting       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_free_surface  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_radiogenic    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">boundary_velocity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_left    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # H-C: tangential velocity on all four walls</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_right   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_surface = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_deep    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # H-C does free-slip bottom (not no-slip)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">free_surface</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_ale_free_surface = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">air_rock_id    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">amr</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_amr = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_v = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_p = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_T = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n_picard   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">picard_tol = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-5</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">solver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">type = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;mumps&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">output</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dir   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;output/holt_condit_2021&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">every = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">subduction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">trench_x            = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plate_thickness     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">continent_thickness = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">air_thick           = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plate_age           = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">90e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_plate_left        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_plate_right       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4700000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vx_plate            = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vx_plate_right      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Rocks — Holt &amp; Condit 2021 reference (4 compositions)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Composite η = η_diff + η_disl, both Arrhenius.  Dislocation params for</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># dry olivine (Hirth &amp; Kohlstedt 2003), diffusion params lower (typical</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># diffusion creep activation energy).</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 1 = background mantle  (dry olivine, with plasticity)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 2 = SP crust           (weak η=2e20, no plasticity — decoupling layer)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 3 = OP                 (dry olivine, NO plasticity)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 4 = SP mantle          (dry olivine, with plasticity)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># All rocks have same ρ_ref = 3300; density CONTRAST comes purely from T.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 1: background mantle</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta0                 = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e16</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # reference viscosity (will be modulated by Arrhenius)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activation_energy    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">540000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # Hirth-Kohlstedt dry olivine Q_disl</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activation_volume    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.2</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # 12 cm³/mol × 1e5 (bar→Pa)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stress_exponent      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ref_yield_stress     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">reference_density    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_expansion    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">specific_heat        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">940.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # H-C value</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_conductivity = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.96</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # κρcp = κ_th = 1e-6 with these values</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5e7</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # 50 MPa</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">friction_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.342</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # sin(20°)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">friction_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.342</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">strain_thresh_init   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">strain_thresh_weak   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e12</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e24</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shear_modulus        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile             = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 2: SP crust (weak decoupling layer)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta0                 = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2e20</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activation_energy    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activation_volume    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stress_exponent      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ref_yield_stress     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">reference_density    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_expansion    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">specific_heat        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">940.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_conductivity = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.96</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # plasticity off</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">friction_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">friction_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2e20</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # stay weak</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shear_modulus        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile             = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 3: overriding plate (no plasticity)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta0                 = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e16</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activation_energy    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">540000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activation_volume    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stress_exponent      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ref_yield_stress     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">reference_density    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_expansion    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">specific_heat        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">940.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_conductivity = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.96</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">friction_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">friction_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e24</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shear_modulus        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile             = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 4: SP mantle (slab core)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta0                 = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e16</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activation_energy    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">540000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">activation_volume    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">stress_exponent      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ref_yield_stress     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">reference_density    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_expansion    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">specific_heat        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">940.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_conductivity = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.96</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">friction_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.342</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">friction_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.342</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">strain_thresh_init   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">strain_thresh_weak   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e12</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e24</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shear_modulus        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile             = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Initial geometry — same generic [[layer]] schema used by Glerum cases</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background_mantle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;overriding_plate&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1800000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100000.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name      = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;bent_slab_mantle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape     = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;bent_band&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thickness = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vertices  = [[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1750000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">250000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name      = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;bent_slab_crust&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape     = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;bent_band&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thickness = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vertices  = [[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1750000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">250000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sp_crust&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4700000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10000.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sp_mantle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4700000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100000.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Initial temperature — data-driven [[init_T]]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Holt &amp; Condit: HSC per plate (SP 90 Myr, OP 10 Myr).  Adiabat bottom.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Background = constant adiabat T.  Then a thin surface BL rectangle</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># overlays a linear T(0→1593) over the top 150 km so the lithosphere has</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># a proper cold lid.  Per-plate HSC entries below override the BL where</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># applicable (younger or older HSC profiles).  This prevents the</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># pathology where a &quot;linear-across-full-depth&quot; background sets the deep</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># mantle as colder than the slab (slab would float instead of sinking).</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background_adiabat&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;constant&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_value = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1593.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;surface_boundary_layer&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;linear&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-1e9</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">+1e9</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">150000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_top   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_bot   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1593.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># OP: HSC with 10 Myr age (H-C reference)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name         = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;OP_hsc&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape        = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile      = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;hsc&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1800000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_surf       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_mantle     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1573.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plate_age_yr = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kappa        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-6</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># SP: HSC with 90 Myr age (H-C reference)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name         = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;SP_hsc&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape        = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile      = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;hsc&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4700000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_surf       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_mantle     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1573.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plate_age_yr = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">90e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kappa        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-6</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Bent slab: HSC along band (slab core stays cold as it dips)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name         = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;bent_slab_hsc&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape        = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;bent_band&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile      = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;hsc&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thickness    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vertices     = [[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1750000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">250000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], [</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000000.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_surf       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_mantle     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1573.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plate_age_yr = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">90e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kappa        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-6</span></span></code></pre></div>`,6)])])}const g=i(p,[["render",h]]);export{y as __pageData,g as default};
