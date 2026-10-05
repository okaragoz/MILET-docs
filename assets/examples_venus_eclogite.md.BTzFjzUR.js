import{_ as i,o as a,c as n,an as l}from"./chunks/framework.DPv6r7OK.js";const g=JSON.parse('{"title":"Eclogite foundering (Venus plateau)","description":"","frontmatter":{},"headers":[],"relativePath":"examples/venus_eclogite.md","filePath":"examples/venus_eclogite.md","lastUpdated":null}'),p={name:"examples/venus_eclogite.md"};function h(e,s,t,k,r,E){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="Eclogite-foundering-Venus-plateau" tabindex="-1">Eclogite foundering (Venus plateau) <a class="header-anchor" href="#Eclogite-foundering-Venus-plateau" aria-label="Permalink to &quot;Eclogite foundering (Venus plateau) {#Eclogite-foundering-Venus-plateau}&quot;">​</a></h1><p>A thick basaltic plateau eclogitises through the divariant mode-3 reaction and founders when the mantle beneath it is weak enough (Karagoz 2026, JGR: Planets, in revision). Commented lines switch on composite creep with a fixed grain size, wet olivine and the dry-eclogite rheology blend.</p><p>Run it with:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">julia</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -t</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> auto</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --project=.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.jl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cases/venus_eclogite_foundering.toml</span></span></code></pre></div><p>Full case file — <a href="https://github.com/okaragoz/MILET/blob/main/cases/venus_eclogite_foundering.toml" target="_blank" rel="noreferrer"><code>cases/venus_eclogite_foundering.toml</code></a>:</p><div class="language-toml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># venus_eclogite_foundering — eclogite foundering beneath a thick-crust plateau</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Generic version of the reference set-up of the Venus eclogite-foundering</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># study (stagnant lid, no imposed kinematics, no plume).  A 65 km thick</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># basaltic plateau crust sits between 20 km normal crust.  Only the thick root</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># crosses the divariant basalt→eclogite reaction, densifies, and can founder</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># as a gravitational drip from beneath the plateau.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   Domain     1000 km × 420 km, 5 km cells (200 × 84 elements)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   Gravity    Venus, g = 8.87 m/s², surface 735 K, mantle 1700 K</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   Geotherm   half-space cooling, plate age 150 Myr → Moho (65 km) ≈ 1214 K</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   Rheology   dislocation creep: dry olivine (mantle), mafic granulite (crust)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#              η clamped to [1e19, 1e23] Pa·s</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   Reaction   divariant (transition = 3) basalt→eclogite, Δρ_max = 550 kg/m³,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#              rate-limited (Arrhenius τ_rxn) with reaction-deformation</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#              softening of weaken_decades = 3 (η ← η·10^(−3·X))</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Run:  julialauncher --project=. main.jl cases/venus_eclogite_foundering.toml</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The run stops at t_end_myr = 50 Myr, or earlier when the eclogite reaches the</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># domain floor (eclogite_floor_stop).  A 5 km run takes several hours on a</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># laptop; set nx = 100, ny = 42 for a quick 10 km look.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">case = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;venus_eclogite_foundering&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   # data-driven: [[layer]] + [[init_T]] below</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Optional granulite→eclogite rheology blend: as the crust eclogitises (X: 0→1)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># its dislocation viscosity is log-interpolated toward this flow law,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#     η = exp((1−X)·ln η_granulite + X·ln η_eclogite).</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Off when absent.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># eclogite_flow_law = &quot;Dry_Eclogite-Jin_2001&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eclogite_floor_stop = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            # stop when the drip hits the floor (default false)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mesh</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dim   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xsize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # 1000 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ysize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">420000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 420 km</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nx    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">             # 5 km cells</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ny    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">84</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mnx   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">               # markers per cell (x)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mny   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">               # markers per cell (y)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gravity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gy = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8.87</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">               # Venus</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxxystep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # CFL: max marker displacement per step (cells)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxtmstep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">6.0e13</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # dt cap ≈ 1.9 Myr</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ntot      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # step cap; t_end_myr normally stops the run first</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rheology</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e23</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # global cap on the cold lid / eclogite root</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">str_min  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eii_seed = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-15</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_top                = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">735.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_bot                = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1700.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">marker_T_mode        = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;pic_increment&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_subgrid_diffusion = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">subgrid_d            = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">t_end_myr            = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # self-stop at this model time (Myr)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">physics</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_stokes        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_heat          = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_advect        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_adiabatic     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_shear_heating = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_friction      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_phase_change  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # the basalt→eclogite reaction is the driver</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_melting       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_volatile      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_free_surface  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_radiogenic    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">boundary_velocity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_left    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_right   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_surface = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_deep    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">free_surface</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_ale_free_surface = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">amr</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_amr = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_v = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_p = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">fe_order_T = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n_picard   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # viscoplastic + reaction nonlinearity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">picard_tol = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-4</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">solver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">type = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;mumps&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">output</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dir   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;output/venus_eclogite_foundering&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">every = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Rocks</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   1 = asthenosphere           (dry olivine)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   2 = basaltic crust          (mafic granulite; eclogitises in place, X carried</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#                                by phase_drho, rock type is NOT switched)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   3 = lithospheric mantle     (dry olivine, stiffer floor eta_min)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   4 = eclogite                (reserved rock slot; unused by transition 3)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Composite creep (optional): add a grain-size-sensitive diffusion law in</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># parallel with dislocation creep, 1/η = 1/η_disl + 1/η_diff(d).  Grain size is</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># constant unless grain_G0 &gt; 0.  For rocks 1 and 3:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#     diff_prof     = &quot;Dry_Olivine_diff-Hirth_Kohlstedt_2003&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#     grain_size_mm = 3                     # same as grain_init = 3e-3 (m)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Wet mantle (Hirth &amp; Kohlstedt 2003, C_OH = 1000 H/10^6 Si):</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#     disl_prof     = &quot;Wet_Olivine_disl-Hirth_Kohlstedt_2003&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#     diff_prof     = &quot;Wet_Olivine_diff-Hirth_Kohlstedt_2003&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#     grain_size_mm = 3</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Rock 1 — asthenosphere</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">disl_prof            = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Dry_Olivine-Ranalli_1995&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># diff_prof          = &quot;Dry_Olivine_diff-Hirth_Kohlstedt_2003&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># grain_size_mm      = 3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">reference_density    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_expansion    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">specific_heat        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1250.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_conductivity = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # effectively no plasticity</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e23</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shear_modulus        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Rock 2 — basaltic crust (eclogitisable).  ρ₀ = 3000; the eclogite density</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># gain is carried by phase_drho (full eclogite = 3000 + 550 = 3550 kg/m³).</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">disl_prof            = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Mafic_Granulite-Ranalli_1995&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">reference_density    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_expansion    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">specific_heat        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1250.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_conductivity = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e23</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shear_modulus        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Rock 3 — lithospheric mantle</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">disl_prof            = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Dry_Olivine-Ranalli_1995&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># diff_prof          = &quot;Dry_Olivine_diff-Hirth_Kohlstedt_2003&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># grain_size_mm      = 3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">reference_density    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3330.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_expansion    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">specific_heat        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1250.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_conductivity = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e21</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e23</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shear_modulus        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Rock 4 — eclogite (reserved; a transition-1/2 phase could switch into it)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">disl_prof            = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Mafic_Granulite-Ranalli_1995&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">reference_density    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3500.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_expansion    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">specific_heat        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1250.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">thermal_conductivity = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_init        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cohesion_weak        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e15</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e21</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max              = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e23</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shear_modulus        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Basalt→eclogite: divariant equilibrium (transition = 3), rate-limited.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   X_eq(P,T) = clamp((P − P_c(T))/W + ½, 0, 1),  P_c(T) = P_ref + S·(T − T_ref)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   dX/dt toward X_eq with τ_rxn(T) = react_tau_ref·exp((react_Q/R)(1/T − 1/react_Tref))</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   phase_drho = drho·X  →  eclogite fraction X = phase_drho/drho</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   reaction softening: η ← max(η·10^(−weaken_decades·X), eta_min)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Set react_tau_ref = 0 for instantaneous equilibrium, weaken_decades = 0 to</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># switch the softening off.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">phase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_from      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_to        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # transition 3 does not switch rock type</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">transition     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">drho           = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">550.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # Δρ_max basalt → full eclogite (kg/m³)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">band_width     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">6.0e8</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # W (Pa): divariant width (~20 km)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">P_ref          = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.010517e9</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # P_c at T_ref (Pa)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">clapeyron      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.520571e6</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # S = dP/dT (Pa/K)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_ref          = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">928.15</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # K</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">latent         = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">react_tau_ref  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.1557e13</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # ~1 Myr at react_Tref</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">react_Q        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0e5</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # J/mol</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">react_Tref     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">973.15</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     # K (700 °C)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">weaken_decades = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Initial temperature: half-space cooling of a 150 Myr plate (Moho ≈ 1214 K).</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Moho temperature is the main control on foundering; vary plate_age_yr.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name         = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;hsc_geotherm&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape        = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile      = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;hsc&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_surf       = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">735.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_mantle     = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1700.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">plate_age_yr = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">150.0e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kappa        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-6</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Initial geometry: flat layers; plateau crust between x = 250 and 650 km.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;asthenosphere&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;lithospheric_mantle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">110000.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;normal_crust&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20000.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;plateau_thick_crust&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">250000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">650000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">65000.0</span></span></code></pre></div>`,6)])])}const y=i(p,[["render",h]]);export{g as __pageData,y as default};
