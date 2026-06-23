import{_ as i,o as a,c as n,an as l}from"./chunks/framework.Xu3Q0CJC.js";const g=JSON.parse('{"title":"Mid-ocean ridge spreading","description":"","frontmatter":{},"headers":[],"relativePath":"examples/ridge.md","filePath":"examples/ridge.md","lastUpdated":null}'),p={name:"examples/ridge.md"};function h(k,s,t,e,E,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="Mid-ocean-ridge-spreading" tabindex="-1">Mid-ocean ridge spreading <a class="header-anchor" href="#Mid-ocean-ridge-spreading" aria-label="Permalink to &quot;Mid-ocean ridge spreading {#Mid-ocean-ridge-spreading}&quot;">​</a></h1><p>Symmetric spreading with passive asthenospheric upwelling at the axis. <strong>Starter template.</strong></p><p>Run it with:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">julia</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -t</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> auto</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --project=.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.jl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cases/examples/ridge.toml</span></span></code></pre></div><p>Full case file — <a href="https://github.com/okaragoz/MILET/blob/main/cases/examples/ridge.toml" target="_blank" rel="noreferrer"><code>cases/examples/ridge.toml</code></a>:</p><div class="language-toml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># EXAMPLE TEMPLATE — Mid-Ocean Ridge spreading (divergent margin)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Two oceanic plates pulled apart at a constant half-rate; passive asthenospheric</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># upwelling fills the gap beneath the ridge axis (x = xsize/2). A hot Gaussian</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># anomaly at the axis seeds the upwelling.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># This is a STARTER TEMPLATE built on the data-driven [[layer]]/[[init_T]] path</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># (the [model] case name is unknown to select_case, so geometry comes from the</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># layer/temperature tables below). Tune resolution, rates, and rheology before</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># using it for production. Coordinate convention: y = depth, positive DOWN.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">case = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ridge&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                     # unknown name → data-driven layers/init_T</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mesh</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dim   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xsize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                   # 600 km wide</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ysize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                   # 200 km deep (incl. 20 km sticky air)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nx    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">201</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ny    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">67</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mnx   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mny   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gravity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gy = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9.81</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxxystep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxtmstep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.1556e12</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              # ~100 kyr cap</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ntot      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rheology</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e24</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_top = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_bot = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1623.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">physics</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_stokes        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_heat          = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_advect        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_shear_heating = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_friction      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_free_surface  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_radiogenic    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Divergent kinematics: both side walls move outward at 3 cm/yr (half-rate),</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># the bottom is left open (traction-free) so asthenosphere flows up to fill in.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">boundary_velocity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_left    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;uniform&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_right   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;uniform&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_surface = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;free_slip&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_deep    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;traction&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            # open bottom: passive inflow</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">boundary_velocity_values</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_left_vx  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-9.51173e-10</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # −3 cm/yr (leftward)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_right_vx =  </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">9.51173e-10</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # +3 cm/yr (rightward)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">free_surface</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_ale_free_surface = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">air_rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n_picard   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">picard_tol = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-3</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">solver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">type = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;mumps&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">output</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dir   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;output/ridge&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">every = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── Rocks: 1=air, 2=oceanic crust (basalt), 3=lithospheric mantle, 4=asthenosphere</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]                           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 1 — sticky air</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">50.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]                           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 2 — oceanic crust (basalt/gabbro)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e21</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2900.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2e-7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.02</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e24</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]                           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 3 — lithospheric mantle (dry olivine)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.97e17</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">beta=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-11</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e-8</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">154000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e24</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">7e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]                           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 4 — asthenosphere</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.97e17</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3300.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e-5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">beta=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-11</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5e-8</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">154000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ss=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.03</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.01</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e23</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">7e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── Initial geometry (evaluated in order; later layers override earlier) ──────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;asthenosphere&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;lithospheric_mantle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">27000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  # 7 km below the crust base</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">60000.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;oceanic_crust&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  # top of crust = base of air</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">27000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  # 7 km thick</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;air&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20000.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── Initial temperature: linear geotherm in the mantle, cold air, hot axis ────</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;geotherm&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;linear&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_top   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_bot   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1623.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;air&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;constant&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_value = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">273.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ridge_upwelling&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;gaussian&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;gaussian&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xc      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300000.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                 # ridge axis (domain centre)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">yc      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">60000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">r0      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dT      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">250.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    # +250 K hot anomaly drives upwelling</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_base  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1623.0</span></span></code></pre></div>`,6)])])}const y=i(p,[["render",h]]);export{g as __pageData,y as default};
