import{_ as i,o as a,c as n,an as l}from"./chunks/framework.Xu3Q0CJC.js";const g=JSON.parse('{"title":"Transtension / transpression","description":"","frontmatter":{},"headers":[],"relativePath":"examples/transtension.md","filePath":"examples/transtension.md","lastUpdated":null}'),p={name:"examples/transtension.md"};function h(k,s,t,e,E,r){return a(),n("div",null,[...s[0]||(s[0]=[l(`<h1 id="Transtension-/-transpression" tabindex="-1">Transtension / transpression <a class="header-anchor" href="#Transtension-/-transpression" aria-label="Permalink to &quot;Transtension / transpression {#Transtension-/-transpression}&quot;">​</a></h1><p>Oblique driving = strike-slip + fault-normal opening (transtension) or closing (transpression). <strong>Starter template.</strong></p><p>Run it with:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">julia</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -t</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> auto</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --project=.</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> main.jl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> cases/examples/transtension.toml</span></span></code></pre></div><p>Full case file — <a href="https://github.com/okaragoz/MILET/blob/main/cases/examples/transtension.toml" target="_blank" rel="noreferrer"><code>cases/examples/transtension.toml</code></a>:</p><div class="language-toml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># EXAMPLE TEMPLATE — Transtension / transpression (OBLIQUE, map view)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Oblique relative plate motion = strike-slip (along-fault, y) + fault-normal</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># (across-fault, x) component. Same map-view setup as transform.toml, but the</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># side walls now carry BOTH components:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   • TRANSTENSION (this file): walls also move APART  → bc_left_vx &lt; 0, bc_right_vx &gt; 0</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   • TRANSPRESSION: flip the normal sign → walls move TOGETHER (bc_left_vx &gt; 0,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#     bc_right_vx &lt; 0). Switch the two bc_*_vx signs below to convert.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Obliquity angle θ = atan(v_normal / v_shear). Here v_shear = 2 cm/yr and</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># v_normal = 1 cm/yr → θ ≈ 27° (transtensional pull-apart). STARTER TEMPLATE,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># data-driven path, gravity OFF (map view). Tune before production.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ══════════════════════════════════════════════════════════════════════════════</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">model</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">case = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;transtension&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              # unknown name → data-driven layers/init_T</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">mesh</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dim   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">xsize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ysize = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nx    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">101</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ny    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">101</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mnx   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mny   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">gravity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">gy = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                           # MAP VIEW</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">time</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxxystep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">maxtmstep = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.1556e12</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ntot      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rheology</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_min = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e18</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">eta_max = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e24</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">temperature</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_top = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">673.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_bot = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">673.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">physics</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_stokes        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_heat          = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_advect        = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_shear_heating = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_friction      = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_free_surface  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">do_radiogenic    = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Oblique driving: shear (vy) + opening (vx). For transpression, flip vx signs.</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">boundary_velocity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_left    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;uniform&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_right   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;uniform&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_surface = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;traction&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_deep    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;traction&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">boundary_velocity_values</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_left_vx  = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-3.17e-10</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           # −1 cm/yr  (opening; flip to + for transpression)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_left_vy  =  </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">6.34e-10</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           # +2 cm/yr  (shear, north)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_right_vx =  </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.17e-10</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           # +1 cm/yr  (opening; flip to − for transpression)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">bc_right_vy = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-6.34e-10</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           # −2 cm/yr  (shear, south)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">n_picard   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">picard_tol = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e-3</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">solver</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">type = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;mumps&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">output</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dir   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;output/transtension&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">every = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── Rocks: 1=crust, 2=weak releasing-bend / fault gouge</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]                           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 1 — crust</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e22</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2750.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2e7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.06</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e20</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e24</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">rock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]                           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 2 — weak fault zone</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e20</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ro0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2750.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">alpha=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cp=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">kt=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2.5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ht=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mm=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dh=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dv=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.05</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">a1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e5</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">b1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e0=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">e1=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_min=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e19</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">nu_max=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1e22</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">immobile=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">G=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3e10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># ── Geometry: crust with a 10 km-wide oblique-slip fault at the centre</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;crust&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">layer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;fault_zone&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">rock_id = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;rectangle&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">95000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">x_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">105000.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_min   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">y_max   = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200000.0</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">init_T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name    = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;uniform&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">shape   = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;background&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">profile = </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;constant&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">T_value = </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">673.0</span></span></code></pre></div>`,6)])])}const y=i(p,[["render",h]]);export{g as __pageData,y as default};
