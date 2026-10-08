/* ================= HOTSCREEN V2 — app.js ================= */
'use strict';
const $  = (s, r) => (r||document).querySelector(s);
const $$ = (s, r) => Array.from((r||document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------------- Mock Data Provider (demo data only) ---------------- */
const DB = {
  level: 4, xp: 1250, xpNext: 2000, compliance: 92,
  credits: 1840, debt: 0,
  contract: { id:'CT-2091', name:'Standard Containment', status:'Active', ends:'2026-11-08' },
  lease: { id:'PL-077', scope:'Full Suite', expires:'2026-10-15' },
  zones: [
    { id:'head',   name:'HEAD',       vis:true,  exposure:'Clear',    stage:1, xp:120, credits:0,   access:'Granted',  effect:'None' },
    { id:'torso',  name:'TORSO',      vis:true,  exposure:'Filtered', stage:3, xp:340, credits:120, access:'Granted',  effect:'Pixelate' },
    { id:'l_arm',  name:'LEFT ARM',   vis:true,  exposure:'Clear',    stage:0, xp:40,  credits:0,   access:'Granted',  effect:'None' },
    { id:'r_arm',  name:'RIGHT ARM',  vis:true,  exposure:'Clear',    stage:0, xp:40,  credits:0,   access:'Granted',  effect:'None' },
    { id:'l_hand', name:'LEFT HAND',  vis:true,  exposure:'Monitored',stage:2, xp:90,  credits:20,  access:'Granted',  effect:'Blur' },
    { id:'r_hand', name:'RIGHT HAND', vis:true,  exposure:'Monitored',stage:2, xp:90,  credits:20,  access:'Granted',  effect:'Blur' },
    { id:'l_leg',  name:'LEFT LEG',   vis:false, exposure:'Filtered', stage:4, xp:210, credits:150, access:'Leased',   effect:'Solid Cover' },
    { id:'r_leg',  name:'RIGHT LEG',  vis:false, exposure:'Filtered', stage:4, xp:210, credits:150, access:'Leased',   effect:'Solid Cover' },
  ],
  stack: [
    { id:'fx1', name:'Pixelate',    on:true,  params:{ size:14 } },
    { id:'fx2', name:'Blur',        on:false, params:{ radius:8 } },
    { id:'fx3', name:'Solid Cover', on:false, params:{ opacity:85 } },
  ],
  events: [
    { t:'09:41', msg:'Zone TORSO reassigned → Pixelate (demo)', cls:'inf' },
    { t:'09:12', msg:'Global Level raised to 4 — policy pack v2 applied (demo)', cls:'ok' },
    { t:'08:57', msg:'Permission lease PL-077 renewed for 7 days (demo)', cls:'inf' },
    { t:'08:30', msg:'Compliance check passed — 92/100 (demo)', cls:'ok' },
    { t:'08:02', msg:'Contract CT-2091 milestone reached (demo)', cls:'warn' },
  ],
  txns: [
    { id:'TX-8812', what:'Effect preset purchase — "Soft Veil"', amt:-120, bal:1840 },
    { id:'TX-8809', what:'Daily compliance bonus', amt:+60, bal:1960 },
    { id:'TX-8801', what:'Zone lease — LEFT LEG (7d)', amt:-150, bal:1900 },
    { id:'TX-8794', what:'Level 4 milestone reward', amt:+200, bal:2050 },
  ],
  contracts: [
    { id:'CT-2091', name:'Standard Containment', status:'Active',  progress:64, ends:'2026-11-08' },
    { id:'CT-2077', name:'Trial Protocol',       status:'Sealed',  progress:100, ends:'2026-09-30' },
    { id:'CT-2105', name:'Deep Focus Session',   status:'Draft',   progress:0,  ends:'—' },
  ],
  leases: [
    { id:'PL-077', scope:'Full Suite',        state:'Active',  expires:'2026-10-15' },
    { id:'PL-071', scope:'Effects Studio',    state:'Active',  expires:'2026-10-20' },
    { id:'PL-068', scope:'Body-Part Monitor', state:'Expired', expires:'2026-09-28' },
  ],
  log: [
    { ts:'09:41:02', cls:'inf',  msg:'renderer: frame 88210 composited in 6.2ms (demo)' },
    { ts:'09:41:00', cls:'ok',   msg:'policy: zone TORSO → Pixelate applied cleanly' },
    { ts:'09:40:47', cls:'warn', msg:'lease PL-068 expired — monitor running in fallback' },
    { ts:'09:39:15', cls:'inf',  msg:'demo mode: all values simulated, no external calls' },
    { ts:'09:38:02', cls:'err',  msg:'effect "Blur": skipped (disabled in stack)' },
  ],
  profiles: {
    theme:    { name:'Midnight HUD',   desc:'Default dark control theme.' },
    rule:     { name:'Balanced',       desc:'Standard detection → policy mapping.' },
    feedback: { name:'Subtle',         desc:'Low-key confirmations, no banners.' },
    effect:   { name:'Soft Veil',      desc:'Gentle default filter preset.' },
  }
};
const LEVELS = ['0 Initiate','1 Aware','2 Watchful','3 Guarded','4 Warded','5 Sealed','6 Bound','7 Deep','8 Total','9 Absolute','10 Transcendent'];

/* ---------------- Store (localStorage demo persistence) ---------------- */
const Store = {
  get(k, d){ try{ const v = localStorage.getItem('hs2_'+k); return v===null?d:JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('hs2_'+k, JSON.stringify(v)); }catch(e){} },
  reset(){ try{ Object.keys(localStorage).filter(k=>k.indexOf('hs2_')===0).forEach(k=>localStorage.removeItem(k)); }catch(e){} }
};

/* ---------------- Toast & Modal ---------------- */
function toast(msg, type){
  const box = $('#toasts'); if(!box) return;
  const el = document.createElement('div');
  el.className = 'toast ' + (type||'');
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .4s'; setTimeout(()=>el.remove(), 420); }, 3200);
}
function confirmModal(title, body, okLabel, onOk){
  const back = document.createElement('div'); back.className='mback';
  back.innerHTML = '<div class="modal" role="dialog"><h3>'+esc(title)+'</h3><p>'+esc(body)+'</p>'+
    '<div class="mrow"><button class="btn btn-ghost btn-sm" data-x>Cancel</button>'+
    '<button class="btn btn-danger btn-sm" data-ok>'+esc(okLabel||'Confirm')+'</button></div></div>';
  document.body.appendChild(back);
  $('[data-x]', back).onclick = ()=>back.remove();
  back.addEventListener('click', e=>{ if(e.target===back) back.remove(); });
  $('[data-ok]', back).onclick = ()=>{ back.remove(); onOk && onOk(); };
}

/* ---------------- Theme ---------------- */
function applyTheme(){
  const t = Store.get('theme','dark');
  document.documentElement.setAttribute('data-theme', t);
  const b = $('#themeBtn'); if(b) b.textContent = t==='dark' ? '◐' : '◑';
}
function toggleTheme(){
  const t = Store.get('theme','dark')==='dark' ? 'light' : 'dark';
  Store.set('theme', t); applyTheme();
  toast('Theme switched to '+t+' (demo)', 'ok');
}

/* ---------------- Test pattern painter (neutral素材) ---------------- */
function paintPattern(ctx, w, h, variant){
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'#0d1626'); g.addColorStop(1,'#131c30');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = 'rgba(48,216,230,.14)'; ctx.lineWidth = 1;
  for(let x=0;x<w;x+=24){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<h;y+=24){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  const cols = ['#30D8E6','#D74C5B','#33CB99','#F3B35D'];
  if(variant===0){
    cols.forEach((c,i)=>{ ctx.fillStyle=c+'55';
      ctx.beginPath(); ctx.arc(w*(0.2+0.2*i), h*0.5, 34, 0, 6.29); ctx.fill();
      ctx.strokeStyle=c; ctx.lineWidth=2; ctx.stroke(); });
  }else if(variant===1){
    for(let i=0;i<5;i++){ ctx.fillStyle=cols[i%4]+'66';
      ctx.fillRect(w*0.12+i*w*0.16, h*0.3, w*0.1, h*0.4); }
  }else{
    ctx.strokeStyle='#30D8E6'; ctx.lineWidth=3; ctx.beginPath();
    for(let x=0;x<=w;x+=8){ const y=h*0.55+Math.sin(x/28)*h*0.16; x===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
    ctx.stroke();
    ctx.fillStyle='rgba(215,76,91,.5)';
    ctx.fillRect(w*0.32,h*0.28,w*0.36,h*0.2);
  }
  ctx.fillStyle='rgba(232,237,243,.5)'; ctx.font='11px JetBrains Mono, monospace';
  ctx.fillText('NEUTRAL TEST PATTERN — DEMO', 10, h-10);
}
/* apply an effect stack to src canvas → dst canvas */
function renderStack(src, dst, stack){
  const w = src.width, h = src.height;
  dst.width = w; dst.height = h;
  const c = dst.getContext('2d');
  c.drawImage(src, 0, 0);
  stack.forEach(fx=>{
    if(!fx.on) return;
    if(fx.name==='Pixelate'){
      const s = Math.max(2, fx.params.size|0);
      const t = document.createElement('canvas');
      t.width = Math.max(1, w/s|0); t.height = Math.max(1, h/s|0);
      t.getContext('2d').drawImage(dst, 0, 0, t.width, t.height);
      c.imageSmoothingEnabled = false;
      c.drawImage(t, 0, 0, t.width, t.height, 0, 0, w, h);
      c.imageSmoothingEnabled = true;
    }else if(fx.name==='Blur'){
      c.filter = 'blur('+(fx.params.radius|0)+'px)';
      c.drawImage(dst, 0, 0); c.filter = 'none';
    }else if(fx.name==='Solid Cover'){
      c.fillStyle = 'rgba(8,11,16,'+((fx.params.opacity|0)/100)+')';
      c.fillRect(0, 0, w, h);
    }else if(fx.name==='Scanlines'){
      c.fillStyle = 'rgba(0,0,0,'+((fx.params.opacity|0)/100)+')';
      for(let y=0;y<h;y+=4) c.fillRect(0, y, w, 1.5);
    }
  });
}

/* ---------------- Router ---------------- */
const APP_PAGES = [
  ['dashboard','01','Dashboard','Overview'],
  ['body-parts','02','Body Parts','Zones'],
  ['effects','03','Effects Studio','Filters'],
  ['progression','04','Progression','Levels'],
  ['economy','05','Economy','Credits'],
  ['contracts','06','Contracts','Pacts'],
  ['access','07','Access','Leases'],
  ['profiles','08','Profiles','Config'],
  ['diagnostics','09','Diagnostics','Logs'],
];
const APP_RENDER = {};
function route(){
  const h = location.hash || '#/';
  const root = $('#view'); if(!root) return;
  document.body.classList.remove('in-app');
  if(diagTimer && h !== '#/app/diagnostics'){ clearInterval(diagTimer); diagTimer = null; }
  if(h === '#/' || h === '#'){ window.scrollTo(0,0); renderMarketingHome(root); return; }
  if(h === '#/demo'){ window.scrollTo(0,0); renderDemo(root); return; }
  if(h === '#/docs'){ window.scrollTo(0,0); renderDocs(root); return; }
  if(h.indexOf('#/app/') === 0){
    const page = h.slice(6) || 'dashboard';
    if(APP_RENDER[page]){ document.body.classList.add('in-app'); renderAppShell(root, page); window.scrollTo(0,0); return; }
    location.hash = '#/app/dashboard'; return;
  }
  if(h.indexOf('#/') === 0){ location.hash = '#/'; return; }
  /* plain in-page anchor, e.g. #features */
  if(!$('#top')) renderMarketingHome(root);
  requestAnimationFrame(()=>{ const el = $(h); if(el) el.scrollIntoView(); });
}
window.addEventListener('hashchange', route);

/* ---------------- Marketing chrome ---------------- */
function marketingNav(){
  return '<nav class="mnav"><a class="logo" href="#/"><span class="mark"></span>HOTSCREEN&nbsp;V2</a>'+
  '<div class="links"><a href="#features">Features</a><a href="#technology">Technology</a>'+
  '<a href="#roadmap">Roadmap</a><a href="#/docs">Docs</a></div>'+
  '<div class="cta-row"><a class="btn btn-ghost btn-sm" href="#/demo">Launch Demo</a>'+
  '<a class="btn btn-primary btn-sm" href="#/app/dashboard">Control Center</a></div></nav>';
}
function marketingFoot(){
  return '<footer class="mfooter"><div class="cols">'+
  '<div style="max-width:320px"><a class="logo" href="#/" style="margin-bottom:12px"><span class="mark"></span>HOTSCREEN&nbsp;V2</a>'+
  '<p style="margin-top:10px">Next-generation screen interaction system. Demo build — all values simulated.</p></div>'+
  '<div><div class="mono muted" style="font-size:11px;letter-spacing:.2em;margin-bottom:10px">PRODUCT</div>'+
  '<div><a href="#features">Features</a></div><div><a href="#/demo">Demo</a></div><div><a href="#/app/dashboard">Control Center</a></div></div>'+
  '<div><div class="mono muted" style="font-size:11px;letter-spacing:.2em;margin-bottom:10px">RESOURCES</div>'+
  '<div><a href="#/docs">Docs</a></div><div><a href="#roadmap">Roadmap</a></div></div>'+
  '<div><div class="mono muted" style="font-size:11px;letter-spacing:.2em;margin-bottom:10px">STATUS</div>'+
  '<div><span class="badge badge-demo"><span class="dot"></span>Demo mode</span></div>'+
  '<div style="margin-top:8px"><span class="badge">Coming soon</span></div></div>'+
  '</div><div class="base"><span>HOTSCREEN V2 — demo website. No downloads available yet.</span>'+
  '<span>v2.0.0-demo · static build</span></div></footer>';
}

/* ---------------- Marketing: Home ---------------- */
function renderMarketingHome(root){
  root.innerHTML = marketingNav() +
  '<header class="mhero" id="top"><div>'+
    '<div class="kick mono" style="color:var(--cyan);letter-spacing:.3em;font-size:12px;margin-bottom:16px">HOTSCREEN V2 · DEMO BUILD</div>'+
    '<h1>Beyond Censorship.<br><span class="cy">Into Control.</span></h1>'+
    '<p class="sub">基于身体部位语义、视觉效果编排与动态规则的下一代屏幕交互系统。<br>'+
    'A next-generation screen interaction system built on body-part semantics, effect orchestration and dynamic rules.</p>'+
    '<div class="cta-row"><a class="btn btn-primary" href="#features">Explore Features</a>'+
    '<a class="btn btn-ghost" href="#/demo">Launch Demo</a></div>'+
    '<div class="meta"><span class="badge badge-demo"><span class="dot"></span>Demo mode</span>'+
    '<span class="badge">No download yet — coming soon</span></div>'+
  '</div>'+
  '<div class="console hud-corner"><div class="cbar"><i></i><i></i><i></i><span class="t">hotscreen://console — demo</span></div>'+
  '<div class="cbody"><div class="scanwrap"><div class="grid"></div><div class="beam"></div>'+
    '<div class="zone" style="left:12%;top:18%">TORSO · FILTERED</div>'+
    '<div class="zone" style="left:58%;top:55%">HAND · MONITORED</div></div>'+
  '<div class="kv"><span class="k">global_level</span><span class="v">4 <span class="ok">● stable</span></span></div>'+
  '<div class="kv"><span class="k">active_effects</span><span class="v">1 / 3</span></div>'+
  '<div class="kv"><span class="k">compliance</span><span class="v"><span class="ok">92 / 100</span></span></div>'+
  '<div class="kv"><span class="k">mode</span><span class="v warn">DEMO — simulated</span></div>'+
  '</div></div></header>'+

  '<section class="msection" id="features"><div class="kick">Core Capabilities</div><h2>One system, four disciplines.</h2>'+
  '<p class="lede">Detection understands the frame. Effects reshape it. Progression remembers. Rules decide.</p>'+
  '<div class="cards">'+
    '<div class="card"><div class="ic">01</div><h3>Body-Part Detection</h3><p>Semantic zone mapping across neutral body regions. Each zone carries visibility, exposure state and an effective stage from 0–6.</p></div>'+
    '<div class="card"><div class="ic">02</div><h3>Native Effects</h3><p>Pixelate, blur and cover filters composed in an ordered stack with per-effect parameters and live preview.</p></div>'+
    '<div class="card"><div class="ic">03</div><h3>Global Progression</h3><p>A single Global Censor Level 0–10 tracks long-term progression. Zones contribute XP; nothing levels in isolation.</p></div>'+
    '<div class="card"><div class="ic">04</div><h3>Gameplay Rule Engine</h3><p>Contracts, credits, leases and compliance form a rule layer that gates what effects may run, and when.</p></div>'+
  '</div></section>'+

  '<section class="msection" id="technology"><div class="kick">How It Works</div><h2>Detection → Renderer.</h2>'+
  '<p class="lede">A strict pipeline. Every frame passes through the same five stages; policy is evaluated before any pixel is touched.</p>'+
  '<div class="flow">'+
    '<div class="fstep"><div class="n">01</div><h4>Detection</h4><p>Zones located in the frame.</p></div><div class="farrow">→</div>'+
    '<div class="fstep"><div class="n">02</div><h4>State</h4><p>Visibility &amp; exposure resolved.</p></div><div class="farrow">→</div>'+
    '<div class="fstep"><div class="n">03</div><h4>Policy</h4><p>Contracts &amp; level gate the run.</p></div><div class="farrow">→</div>'+
    '<div class="fstep"><div class="n">04</div><h4>Effect</h4><p>Stack composed in order.</p></div><div class="farrow">→</div>'+
    '<div class="fstep"><div class="n">05</div><h4>Renderer</h4><p>Frame composited &amp; shown.</p></div>'+
  '</div></section>'+

  '<section class="msection"><div class="kick">Effect Showcase</div><h2>Try a filter, live.</h2>'+
  '<p class="lede">A miniature of the Effects Studio. Neutral test pattern only — no camera, no screen capture.</p>'+
  '<div class="showcase"><div class="preview-box hud-corner"><canvas id="miniSrc" width="480" height="300" class="hidden"></canvas>'+
  '<canvas id="miniDst" width="480" height="300"></canvas>'+
  '<div class="ctl-row"><div class="seg" id="miniSeg">'+
  '<button data-fx="Pixelate" class="on">Pixelate</button><button data-fx="Blur">Blur</button><button data-fx="Solid Cover">Solid</button></div>'+
  '<div class="field" style="margin:0"><div class="row"><input type="range" id="miniRange" min="2" max="40" value="14"><output id="miniOut">14</output></div></div>'+
  '</div></div>'+
  '<div><h3 style="margin-bottom:10px">Composed, not pasted.</h3>'+
  '<p class="muted" style="margin-bottom:14px">Effects run as an ordered stack. Reorder them and the output changes — the studio version adds drag-and-drop, presets and per-zone assignment.</p>'+
  '<a class="btn btn-primary btn-sm" href="#/app/effects">Open Effects Studio</a> '+
  '<a class="btn btn-ghost btn-sm" href="#/demo">Full interactive demo</a></div></div></section>'+

  '<section class="msection"><div class="kick">Gameplay Showcase</div><h2>Systems that remember.</h2>'+
  '<p class="lede">Cosmetic filters are only the surface. Underneath, a progression economy keeps score.</p>'+
  '<div class="cards">'+
  '<div class="card"><div class="ic">LV</div><h3>Global Censor Level</h3><p>One level 0–10 for the whole system. Zones feed it XP; it unlocks stricter policy tiers.</p></div>'+
  '<div class="card"><div class="ic">CR</div><h3>Credits &amp; Debt</h3><p>Earn credits through compliance, spend them on presets and leases. Debt gates high-tier effects.</p></div>'+
  '<div class="card"><div class="ic">CT</div><h3>Contracts</h3><p>Time-boxed pacts with milestones. Complete them for rewards; break them and pay.</p></div>'+
  '<div class="card"><div class="ic">AC</div><h3>Compliance &amp; Access</h3><p>Permission leases grant scoped access. Compliance score decides what stays enabled.</p></div>'+
  '</div></section>'+

  '<section class="msection" id="roadmap"><div class="kick">Roadmap</div><h2>Honest milestones.</h2>'+
  '<p class="lede">This page describes the plan as it stands. Nothing below is sold as shipped unless marked completed.</p>'+
  '<div class="rm-grid">'+
  '<div class="rm-col done"><h4>COMPLETED</h4>'+
    '<div class="rm-item">Brand site &amp; design system<span class="tag">v2.0.0-demo</span></div>'+
    '<div class="rm-item">Interactive demo sandbox<span class="tag">v2.0.0-demo</span></div>'+
    '<div class="rm-item">Control Center dashboard<span class="tag">v2.0.0-demo</span></div></div>'+
  '<div class="rm-col prog"><h4>IN PROGRESS</h4>'+
    '<div class="rm-item">Effects Studio drag-and-drop stack<span class="tag">demo interaction</span></div>'+
    '<div class="rm-item">Body-part zone editor<span class="tag">demo interaction</span></div>'+
    '<div class="rm-item">Progression &amp; economy screens<span class="tag">mock data</span></div></div>'+
  '<div class="rm-col plan"><h4>PLANNED</h4>'+
    '<div class="rm-item">Runtime adapter for live capture<span class="tag">not started</span></div>'+
    '<div class="rm-item">Native desktop build<span class="tag">not started</span></div>'+
    '<div class="rm-item">Public download<span class="tag">coming soon</span></div></div>'+
  '</div></section>'+

  '<section class="msection"><div class="kick">FAQ</div><h2>Questions.</h2><div style="max-width:760px;margin-top:26px">'+
  '<details class="faq"><summary>What is Hotscreen V2?</summary><div class="a">A design concept for a screen interaction system: semantic body-part detection, composable visual effects, and a progression/rules layer. This website is a demo build.</div></details>'+
  '<details class="faq"><summary>Can I download it?</summary><div class="a">Not yet. There is no download link because there is no shipping build. The roadmap marks it as coming soon.</div></details>'+
  '<details class="faq"><summary>Does the demo access my screen or camera?</summary><div class="a">No. The demo uses generated neutral test patterns only. Nothing leaves your browser; there is no backend in this build.</div></details>'+
  '<details class="faq"><summary>Are the numbers real?</summary><div class="a">No. Levels, XP, credits and logs on this site are simulated demo data, clearly labeled wherever they appear.</div></details>'+
  '<details class="faq"><summary>What platforms will it run on?</summary><div class="a">Undecided. A native desktop build is on the roadmap as a planned item, not a promise.</div></details>'+
  '</div></section>'+marketingFoot();
  initMiniShowcase();
}
function initMiniShowcase(){
  const src = $('#miniSrc'), dst = $('#miniDst'); if(!src||!dst) return;
  paintPattern(src.getContext('2d'), src.width, src.height, 0);
  let fx = 'Pixelate';
  const draw = ()=>{
    const v = +$('#miniRange').value; $('#miniOut').textContent = v;
    const stack = fx==='Pixelate' ? [{name:'Pixelate',on:true,params:{size:v}}]
      : fx==='Blur' ? [{name:'Blur',on:true,params:{radius:v}}]
      : [{name:'Solid Cover',on:true,params:{opacity:v>40?40:v}}];
    renderStack(src, dst, stack);
  };
  $$('#miniSeg button').forEach(b=>b.onclick=()=>{ $$('#miniSeg button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); fx=b.dataset.fx;
    const r=$('#miniRange'); if(fx==='Solid Cover'){ r.min=10; r.max=100; r.value=70; } else { r.min=2; r.max=40; r.value=14; }
    draw(); });
  $('#miniRange').oninput = draw; draw();
}

/* ---------------- Marketing: Docs ---------------- */
function renderDocs(root){
  root.innerHTML = marketingNav() +
  '<section class="msection" style="padding-top:130px"><div class="kick">Documentation</div>'+
  '<h2>Docs <span class="badge badge-demo" style="vertical-align:middle">Early draft</span></h2>'+
  '<p class="lede">The honest state of documentation for a product still in demo.</p>'+
  '<div class="cards">'+
  '<div class="card"><div class="ic">A</div><h3>Concepts</h3><p>Zones, stages, the single Global Level, and how policy gates effects. <span class="muted">Draft in progress.</span></p></div>'+
  '<div class="card"><div class="ic">B</div><h3>Effects reference</h3><p>Pixelate, Blur, Solid Cover, Scanlines — parameters and stacking order. <span class="muted">Covered in the demo.</span></p></div>'+
  '<div class="card"><div class="ic">C</div><h3>Runtime adapter</h3><p>How a future live adapter would plug in. <span class="muted">Not started — no API to document yet.</span></p></div>'+
  '</div><div class="mt16"><a class="btn btn-ghost btn-sm" href="#/">← Back to site</a></div></section>'+marketingFoot();
}

/* ---------------- Interactive Demo ---------------- */
const DemoState = { variant:0, fx:'Pixelate', param:14, level:4, compare:true };
function renderDemo(root){
  root.innerHTML = marketingNav() +
  '<div class="demo-head"><span class="badge badge-demo"><span class="dot"></span>Demo mode — mock data</span>'+
  '<h1 style="margin:16px 0 10px">Interactive Demo</h1>'+
  '<p class="muted">Switch patterns, stack a filter, drag the Global Level. Everything here is simulated in your browser.</p></div>'+
  '<div class="demo-grid"><div class="preview-box hud-corner">'+
    '<div class="compare"><figure><canvas id="dSrc" width="420" height="300"></canvas><figcaption>SOURCE · NEUTRAL PATTERN</figcaption></figure>'+
    '<figure><canvas id="dDst" width="420" height="300"></canvas><figcaption id="dCap">FILTERED · DEMO</figcaption></figure></div>'+
    '<div class="panel mt16" style="margin-bottom:0"><h3>System feedback <span class="badge badge-demo" style="margin-left:8px">simulated</span></h3>'+
    '<p class="psub">What the pipeline reports at the current level.</p><div id="dFeed" class="log" style="max-height:180px"></div></div>'+
  '</div>'+
  '<div><div class="panel"><h3>Pattern</h3><p class="psub">Neutral generated素材 — no camera involved.</p>'+
    '<div class="seg" id="dVar"><button data-v="0" class="on">Orbs</button><button data-v="1">Bars</button><button data-v="2">Wave</button></div></div>'+
  '<div class="panel"><h3>Filter</h3><p class="psub">One filter at a time in this demo.</p>'+
    '<div class="seg" id="dFx"><button data-f="Pixelate" class="on">Pixelate</button><button data-f="Blur">Blur</button><button data-f="Solid Cover">Solid</button></div>'+
    '<div class="field"><label>INTENSITY</label><div class="row"><input type="range" id="dParam" min="2" max="40" value="14"><output id="dParamOut">14</output></div></div></div>'+
  '<div class="panel"><h3>Global Level <span class="mono" id="dLvlOut" style="color:var(--cyan)">4</span></h3>'+
    '<p class="psub">Drag to preview policy feedback per level (demo).</p>'+
    '<div class="levels" id="dLevels">'+LEVELS.map((l,i)=>'<div class="lvl'+(i===4?' cur':'')+'" data-l="'+i+'"><b>'+i+'</b><small>'+l.split(' ')[1]+'</small></div>').join('')+'</div>'+
    '<div class="progress"><i id="dProg" style="width:40%"></i></div></div>'+
  '<div class="flex gap8 wrap"><a class="btn btn-ghost btn-sm" href="#/">← Site</a>'+
  '<a class="btn btn-primary btn-sm" href="#/app/dashboard">Open Control Center</a></div>'+
  '</div></div>'+marketingFoot();
  const src=$('#dSrc'), dst=$('#dDst');
  const paint=()=>paintPattern(src.getContext('2d'), src.width, src.height, DemoState.variant);
  const LEVEL_MSG = [
    'L0 — monitoring only, no filters engaged.',
    'L1 — zone scan active. Policy: observe.',
    'L2 — HAND zones → Monitored. Light logging on.',
    'L3 — TORSO zone → Filtered. Pixelate armed.',
    'L4 — Pixelate live on TORSO. Compliance 92/100.',
    'L5 — Solid Cover unlocked for LEG zones (leased).',
    'L6 — contract milestone: bonus credits pending.',
    'L7 — strict policy: all motion zones filtered.',
    'L8 — deep policy pack. Manual review required (demo).',
    'L9 — near-total coverage. Lease renewal advised (demo).',
    'L10 — Transcendent. Nothing to configure — demo ends here.' ];
  const draw=()=>{
    const v=+$('#dParam').value; $('#dParamOut').textContent=v;
    const st = DemoState.fx==='Pixelate' ? [{name:'Pixelate',on:true,params:{size:v}}]
      : DemoState.fx==='Blur' ? [{name:'Blur',on:true,params:{radius:v}}]
      : [{name:'Solid Cover',on:true,params:{opacity:Math.min(90,v*2)}}];
    renderStack(src, dst, st);
    $('#dCap').textContent = 'FILTERED · '+DemoState.fx.toUpperCase()+' · DEMO';
    const feed=$('#dFeed');
    feed.innerHTML = '<div class="ln"><span class="ts">now</span><span class="inf">'+esc(LEVEL_MSG[DemoState.level])+'</span></div>'+
      '<div class="ln"><span class="ts">now</span>filter='+DemoState.fx+' intensity='+v+' <span class="ok">applied</span></div>'+
      '<div class="ln"><span class="ts">now</span><span class="warn">demo data — nothing leaves this page</span></div>';
  };
  $$('#dVar button').forEach(b=>b.onclick=()=>{ $$('#dVar button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); DemoState.variant=+b.dataset.v; paint(); draw(); });
  $$('#dFx button').forEach(b=>b.onclick=()=>{ $$('#dFx button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); DemoState.fx=b.dataset.f;
    const r=$('#dParam'); if(DemoState.fx==='Solid Cover'){ r.min=5; r.max=45; r.value=20; } else { r.min=2; r.max=40; r.value=14; }
    draw(); });
  $('#dParam').oninput = draw;
  $$('#dLevels .lvl').forEach(el=>el.onclick=()=>{ $$('#dLevels .lvl').forEach(x=>x.classList.remove('cur'));
    el.classList.add('cur'); DemoState.level=+el.dataset.l;
    $('#dLvlOut').textContent=DemoState.level; $('#dProg').style.width=(DemoState.level*10)+'%'; draw();
    toast('Global Level → '+DemoState.level+' (demo)'); });
  paint(); draw();
}

/* ---------------- App shell ---------------- */
function renderAppShell(root, page){
  const icons = { dashboard:'◧','body-parts':'◈','effects':'▦','progression':'▲','economy':'◉','contracts':'✎','access':'⌘','profiles':'⚙','diagnostics':'≋' };
  const groups = [['Operate',['dashboard','body-parts','effects']],['Advance',['progression','economy','contracts']],['System',['access','profiles','diagnostics']]];
  let nav = '';
  groups.forEach(([g, ids])=>{
    nav += '<div class="grp">'+g+'</div>';
    ids.forEach(id=>{
      const p = APP_PAGES.find(x=>x[0]===id);
      nav += '<a href="#/app/'+id+'" class="'+(page===id?'on':'')+'"><span class="di">'+icons[id]+'</span>'+p[2]+'</a>';
    });
  });
  root.innerHTML =
  '<div class="app"><aside class="sidebar"><div class="slogo"><a class="logo" href="#/"><span class="mark"></span>HOTSCREEN&nbsp;V2</a></div>'+
  '<nav class="snav">'+nav+'</nav>'+
  '<div class="sfoot">DEMO BUILD<br>v2.0.0 · mock data</div></aside>'+
  '<div class="main"><div class="topbar">'+
    '<span class="badge badge-demo"><span class="dot"></span>Demo mode</span>'+
    '<span class="ttl">'+esc((APP_PAGES.find(p=>p[0]===page)||[])[2]||'')+'</span><span class="sp"></span>'+
    '<span class="tstat">LEVEL <b>'+DB.level+'</b></span>'+
    '<span class="tstat">◉ <b>'+DB.credits+'</b></span>'+
    '<button class="iconbtn" id="themeBtn" title="Toggle theme">◐</button>'+
    '<button class="iconbtn" id="bellBtn" title="Notifications">♪</button>'+
    '<a class="btn btn-ghost btn-sm" href="#/">← Site</a>'+
  '</div><div class="workspace" id="ws"></div></div></div>';
  applyTheme();
  $('#themeBtn').onclick = toggleTheme;
  $('#bellBtn').onclick = ()=>toast('3 unread demo notifications — nothing urgent.', 'warn');
  APP_RENDER[page]($('#ws'));
}
function pageHead(title, sub, extra){
  return '<div class="pagehead"><div><h2>'+esc(title)+'</h2><p>'+sub+'</p></div><div>'+(extra||'')+'</div></div>';
}

/* ---------------- App: Dashboard ---------------- */
APP_RENDER.dashboard = function(ws){
  ws.innerHTML = pageHead('Dashboard','System overview. All figures below are simulated demo data.',
    '<span class="badge badge-demo"><span class="dot"></span>Demo data</span>')+
  '<div class="grid4 mb16">'+
    '<div class="stat"><div class="k">Global Censor Level</div><div class="v cy">'+DB.level+' <small>/ 10</small></div><div class="d">Warded — policy pack v2</div></div>'+
    '<div class="stat"><div class="k">XP</div><div class="v">'+DB.xp+' <small>/ '+DB.xpNext+'</small></div><div class="progress mt8"><i style="width:'+(DB.xp/DB.xpNext*100)+'%"></i></div></div>'+
    '<div class="stat"><div class="k">Compliance</div><div class="v gr">'+DB.compliance+'<small> / 100</small></div><div class="d">Last check 08:30 (demo)</div></div>'+
    '<div class="stat"><div class="k">Credits</div><div class="v am">◉ '+DB.credits+'</div><div class="d">Debt: ◉ '+DB.debt+'</div></div>'+
  '</div><div class="grid2">'+
  '<div class="panel"><h3>Active Contract</h3><p class="psub">Time-boxed pact with milestones.</p>'+
    '<div class="flex gap12 wrap" style="align-items:center;justify-content:space-between">'+
    '<div><div style="font-weight:700">'+DB.contract.id+' · '+esc(DB.contract.name)+'</div>'+
    '<div class="muted mono" style="font-size:12px">ends '+DB.contract.ends+' · <span style="color:var(--green)">'+DB.contract.status+'</span></div></div>'+
    '<a class="btn btn-ghost btn-sm" href="#/app/contracts">Manage</a></div></div>'+
  '<div class="panel"><h3>Permission Lease</h3><p class="psub">Scoped access grant.</p>'+
    '<div class="flex gap12 wrap" style="align-items:center;justify-content:space-between">'+
    '<div><div style="font-weight:700">'+DB.lease.id+' · '+esc(DB.lease.scope)+'</div>'+
    '<div class="muted mono" style="font-size:12px">expires '+DB.lease.expires+'</div></div>'+
    '<a class="btn btn-ghost btn-sm" href="#/app/access">Manage</a></div></div>'+
  '</div>'+
  '<div class="panel"><h3>Body-Part Monitor</h3><p class="psub">Live zone states (demo snapshot).</p>'+
    '<div class="grid4">'+DB.zones.slice(0,4).map(z=>
    '<div class="stat"><div class="k">'+z.name+'</div><div class="v" style="font-size:18px">'+(z.vis?'<span style="color:var(--green)">●</span>':'<span style="color:var(--muted)">○</span>')+' <small>'+z.exposure+'</small></div><div class="d">Stage '+z.stage+' · '+z.effect+'</div></div>').join('')+'</div>'+
    '<div class="mt16"><a class="btn btn-ghost btn-sm" href="#/app/body-parts">Open zone editor</a></div></div>'+
  '<div class="panel"><h3>Recent Events</h3><p class="psub">Latest pipeline events (demo).</p>'+
    DB.events.map(e=>'<div class="trow"><div class="tl"><span class="mono muted" style="font-size:11px;margin-right:10px">'+e.t+'</span>'+esc(e.msg)+'</div></div>').join('')+'</div>';
};

/* ---------------- App: Body Parts ---------------- */
let selZone = 'torso';
APP_RENDER['body-parts'] = function(ws){
  const Z = {
    head:  {x:'circle', cx:100, cy:34, r:22, lx:100, ly:8},
    torso: {x:'rect', x0:74, y0:64, w:52, h:104, rx:16, lx:100, ly:60},
    l_arm: {x:'rect', x0:42, y0:72, w:20, h:96, rx:10, lx:52, ly:66},
    r_arm: {x:'rect', x0:138, y0:72, w:20, h:96, rx:10, lx:148, ly:66},
    l_hand:{x:'circle', cx:52, cy:182, r:11, lx:52, ly:204},
    r_hand:{x:'circle', cx:148, cy:182, r:11, lx:148, ly:204},
    l_leg: {x:'rect', x0:76, y0:184, w:20, h:118, rx:10, lx:86, ly:316},
    r_leg: {x:'rect', x0:104, y0:184, w:20, h:118, rx:10, lx:114, ly:316},
  };
  let shapes = '';
  Object.keys(Z).forEach(id=>{
    const z = DB.zones.find(q=>q.id===id), s = Z[id];
    const el = s.x==='circle'
      ? '<circle class="zone'+(id===selZone?' sel':'')+'" data-z="'+id+'" cx="'+s.cx+'" cy="'+s.cy+'" r="'+s.r+'"/>'
      : '<rect class="zone'+(id===selZone?' sel':'')+'" data-z="'+id+'" x="'+s.x0+'" y="'+s.y0+'" width="'+s.w+'" height="'+s.h+'" rx="'+s.rx+'"/>';
    shapes += el + '<text class="zlabel" x="'+s.lx+'" y="'+s.ly+'">'+z.name+'</text>';
  });
  const z = DB.zones.find(q=>q.id===selZone);
  ws.innerHTML = pageHead('Body Parts','Select a neutral zone to inspect and edit its policy. Demo data only.',
    '<span class="badge badge-demo"><span class="dot"></span>Demo data</span>')+
  '<div class="bodywrap"><div class="bodysvg"><svg viewBox="0 0 200 330">'+shapes+'</svg>'+
  '<p class="muted mono center" style="font-size:11px;margin-top:10px">NEUTRAL MANNEQUIN · CLICK A ZONE</p></div>'+
  '<div class="panel" id="zPanel" style="margin-bottom:0">'+zonePanel(z)+'</div></div>';
  $$('.zone', ws).forEach(el=>el.onclick=()=>{
    selZone = el.dataset.z;
    $$('.zone', ws).forEach(x=>x.classList.remove('sel')); el.classList.add('sel');
    $('#zPanel').innerHTML = zonePanel(DB.zones.find(q=>q.id===selZone));
    bindZonePanel();
  });
  bindZonePanel();
  function bindZonePanel(){
    const zz = DB.zones.find(q=>q.id===selZone);
    const vis = $('#zVis'); if(vis) vis.onclick = ()=>{ zz.vis=!zz.vis; vis.classList.toggle('on',zz.vis); toast(zz.name+' visibility '+(zz.vis?'on':'off')+' (demo)'); };
    const st = $('#zStage'); if(st) st.oninput = ()=>{ zz.stage=+st.value; $('#zStageOut').textContent=zz.stage; };
    const ex = $('#zExp'); if(ex) ex.onchange = ()=>{ zz.exposure=ex.value; toast(zz.name+' exposure → '+ex.value+' (demo)'); };
    const ef = $('#zFx'); if(ef) ef.onchange = ()=>{ zz.effect=ef.value; toast(zz.name+' effect → '+ef.value+' (demo)'); };
  }
};
function zonePanel(z){
  return '<h3>'+z.name+' <span class="badge '+(z.vis?'badge-live':'')+'" style="margin-left:8px">'+(z.vis?'visible':'hidden')+'</span></h3>'+
  '<p class="psub">Zone policy — changes apply to the demo session.</p>'+
  '<div class="trow"><div class="tl">Visibility<small>Whether the zone is tracked</small></div><div class="toggle'+(z.vis?' on':'')+'" id="zVis"></div></div>'+
  '<div class="trow"><div class="tl">Exposure state<small>Clear / Monitored / Filtered</small></div>'+
  '<select class="sel" id="zExp">'+['Clear','Monitored','Filtered'].map(e=>'<option'+(e===z.exposure?' selected':'')+'>'+e+'</option>').join('')+'</select></div>'+
  '<div class="field"><label>EFFECTIVE STAGE · <output id="zStageOut" style="color:var(--cyan)">'+z.stage+'</output> / 6</label>'+
  '<div class="row"><input type="range" id="zStage" min="0" max="6" value="'+z.stage+'" style="flex:1"></div></div>'+
  '<div class="trow"><div class="tl">Effect assignment</div>'+
  '<select class="sel" id="zFx">'+['None','Pixelate','Blur','Solid Cover'].map(e=>'<option'+(e===z.effect?' selected':'')+'>'+e+'</option>').join('')+'</select></div>'+
  '<hr class="hr"><div class="grid2">'+
  '<div class="stat"><div class="k">XP contribution</div><div class="v" style="font-size:20px">'+z.xp+'</div></div>'+
  '<div class="stat"><div class="k">Credits</div><div class="v am" style="font-size:20px">◉ '+z.credits+'</div></div></div>'+
  '<div class="trow mt16"><div class="tl">Access state</div><span class="badge '+(z.access==='Granted'?'badge-live':'badge-cyan')+'">'+z.access+'</span></div>';
}

/* ---------------- App: Effects Studio ---------------- */
const FX_LIB = [
  { name:'Pixelate',    desc:'Block mosaic over the zone.', params:{ size:{label:'Block size', min:2, max:40} } },
  { name:'Blur',        desc:'Gaussian softening.',         params:{ radius:{label:'Radius', min:1, max:24} } },
  { name:'Solid Cover', desc:'Opaque neutral cover.',       params:{ opacity:{label:'Opacity %', min:10, max:100} } },
  { name:'Scanlines',   desc:'CRT line overlay.',           params:{ opacity:{label:'Opacity %', min:5, max:60} } },
];
APP_RENDER.effects = function(ws){
  ws.innerHTML = pageHead('Effects Studio','Compose the filter stack. Drag to reorder — order changes the output.',
    '<span class="badge badge-demo"><span class="dot"></span>Demo data</span>')+
  '<div class="grid2"><div><div class="panel"><h3>Effect Stack</h3><p class="psub">Top runs first. Drag handles to reorder.</p>'+
    '<div class="stack" id="fxStack"></div>'+
    '<div class="flex gap8 mt16"><button class="btn btn-ghost btn-sm" id="fxReset">Reset stack</button>'+
    '<button class="btn btn-ghost btn-sm" id="fxPreset">Load preset “Soft Veil”</button></div></div>'+
  '<div class="panel"><h3>Filter Library</h3><p class="psub">Add filters to the stack.</p><div id="fxLib"></div></div></div>'+
  '<div class="panel"><h3>Live Preview <span class="badge badge-demo" style="margin-left:8px">neutral pattern</span></h3>'+
  '<p class="psub">Rendered from the current stack, in order.</p>'+
  '<div class="showcase" style="grid-template-columns:1fr 1fr"><div class="preview-box"><canvas id="eSrc" width="420" height="280" class="hidden"></canvas>'+
  '<canvas id="eDst" width="420" height="280" style="width:100%;border-radius:8px;background:#0a0f16"></canvas>'+
  '<p class="mono muted" style="font-size:11px;margin-top:8px">OUTPUT · STACK ORDER APPLIED</p></div>'+
  '<div><div id="fxParams"></div></div></div></div>';
  const src=$('#eSrc'); paintPattern(src.getContext('2d'), src.width, src.height, 0);
  const draw=()=>renderStack(src, $('#eDst'), DB.stack);
  const renderList=()=>{
    $('#fxStack').innerHTML = DB.stack.map((f,i)=>
      '<div class="fxitem" draggable="true" data-id="'+f.id+'"><span class="grip">⋮⋮</span>'+
      '<span class="ord">'+(i+1)+'</span><span class="nm">'+esc(f.name)+'</span>'+
      '<div class="toggle'+(f.on?' on':'')+'" data-tg="'+f.id+'"></div>'+
      '<button class="iconbtn" data-rm="'+f.id+'" title="Remove" style="width:28px;height:28px">×</button></div>').join('')
      || '<p class="muted">Stack is empty — add a filter from the library.</p>';
    $$('#fxStack .fxitem').forEach(el=>{
      el.addEventListener('dragstart',()=>{ el.classList.add('dragging'); });
      el.addEventListener('dragend',()=>{
        el.classList.remove('dragging');
        const ids=$$('#fxStack .fxitem').map(x=>x.dataset.id);
        DB.stack.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));
        renderList(); draw(); toast('Stack reordered (demo)');
      });
      el.addEventListener('dragover',e=>{ e.preventDefault();
        const d=$('.fxitem.dragging'); if(!d||d===el) return;
        const r=el.getBoundingClientRect();
        const after=(e.clientY-r.top)>r.height/2;
        el.parentNode.insertBefore(d, after?el.nextSibling:el);
      });
    });
    $$('#fxStack [data-tg]').forEach(t=>t.onclick=e=>{ e.stopPropagation();
      const f=DB.stack.find(x=>x.id===t.dataset.tg); f.on=!f.on; t.classList.toggle('on',f.on); draw(); });
    $$('#fxStack [data-rm]').forEach(b=>b.onclick=e=>{ e.stopPropagation();
      DB.stack=DB.stack.filter(x=>x.id!==b.dataset.rm); renderList(); renderParams(); draw();
      toast('Filter removed (demo)'); });
    draw();
  };
  const renderParams=()=>{
    $('#fxParams').innerHTML = DB.stack.map(f=>{
      const lib=FX_LIB.find(l=>l.name===f.name); if(!lib) return '';
      return Object.keys(lib.params).map(pk=>{
        const p=lib.params[pk];
        return '<div class="field"><label>'+esc(f.name).toUpperCase()+' · '+esc(p.label)+'</label>'+
        '<div class="row"><input type="range" min="'+p.min+'" max="'+p.max+'" value="'+f.params[pk]+'" data-f="'+f.id+'" data-p="'+pk+'" style="flex:1">'+
        '<output>'+f.params[pk]+'</output></div></div>';
      }).join('');
    }).join('') || '<p class="muted">No parameters — stack is empty.</p>';
    $$('#fxParams input[type=range]').forEach(r=>r.oninput=()=>{
      const f=DB.stack.find(x=>x.id===r.dataset.f); f.params[r.dataset.p]=+r.value;
      r.nextElementSibling.textContent=r.value; draw(); });
  };
  $('#fxLib').innerHTML = FX_LIB.map(l=>
    '<div class="libitem"><div><div style="font-weight:600">'+l.name+'</div>'+
    '<div class="muted" style="font-size:12.5px">'+l.desc+'</div></div>'+
    '<button class="btn btn-ghost btn-sm" data-add="'+l.name+'">+ Add</button></div>').join('');
  $$('#fxLib [data-add]').forEach(b=>b.onclick=()=>{
    const lib=FX_LIB.find(l=>l.name===b.dataset.add);
    const params={}; Object.keys(lib.params).forEach(k=>params[k]=Math.round((lib.params[k].min+lib.params[k].max)/2));
    DB.stack.push({ id:'fx'+Date.now(), name:lib.name, on:true, params });
    renderList(); renderParams(); toast(lib.name+' added to stack (demo)','ok'); });
  $('#fxReset').onclick=()=>confirmModal('Reset effect stack?','Restore the default demo stack.', 'Reset', ()=>{
    DB.stack=[{id:'fx1',name:'Pixelate',on:true,params:{size:14}},{id:'fx2',name:'Blur',on:false,params:{radius:8}},{id:'fx3',name:'Solid Cover',on:false,params:{opacity:85}}];
    renderList(); renderParams(); toast('Stack reset (demo)','ok'); });
  $('#fxPreset').onclick=()=>{
    DB.stack=[{id:'fx'+Date.now(),name:'Blur',on:true,params:{radius:10}},{id:'fx'+(Date.now()+1),name:'Scanlines',on:true,params:{opacity:22}}];
    renderList(); renderParams(); toast('Preset “Soft Veil” loaded (demo)','ok'); };
  renderList(); renderParams();
};

/* ---------------- App: Progression ---------------- */
APP_RENDER.progression = function(ws){
  ws.innerHTML = pageHead('Progression','The single Global Censor Level 0–10. Zones feed it XP; nothing levels alone.',
    '<span class="badge badge-demo"><span class="dot"></span>Demo data</span>')+
  '<div class="panel"><h3>Global Censor Level</h3><p class="psub">Current level and roadmap.</p>'+
  '<div class="flex gap12" style="align-items:baseline"><span class="mono" style="font-size:44px;color:var(--cyan)">'+DB.level+'</span>'+
  '<span class="muted">'+LEVELS[DB.level]+' · '+DB.xp+' / '+DB.xpNext+' XP</span></div>'+
  '<div class="progress mt8"><i style="width:'+(DB.xp/DB.xpNext*100)+'%"></i></div>'+
  '<div class="levels">'+LEVELS.map((l,i)=>'<div class="lvl'+(i===DB.level?' cur':i<DB.level?' done':'')+'"><b>'+i+'</b><small>'+l.split(' ')[1]+'</small></div>').join('')+'</div>'+
  '<p class="muted" style="font-size:12.5px">Click a level to preview its policy tier (demo).</p></div>'+
  '<div class="panel"><h3>Zone XP contributions</h3><p class="psub">Where the level comes from.</p>'+
  '<table class="tbl"><tr><th>Zone</th><th>Stage</th><th>XP</th><th>Effect</th></tr>'+
  DB.zones.map(z=>'<tr><td>'+z.name+'</td><td class="mono">'+z.stage+' / 6</td><td class="mono">'+z.xp+'</td><td>'+z.effect+'</td></tr>').join('')+'</table></div>';
  $$('.lvl', ws).forEach(el=>el.onclick=()=>toast('Level '+el.querySelector('b').textContent+' policy tier preview (demo)'));
};

/* ---------------- App: Economy ---------------- */
APP_RENDER.economy = function(ws){
  ws.innerHTML = pageHead('Economy','Credits and debt. Simulated ledger — nothing of value moves.',
    '<span class="badge badge-demo"><span class="dot"></span>Demo data</span>')+
  '<div class="grid4 mb16">'+
  '<div class="stat"><div class="k">Balance</div><div class="v am">◉ '+DB.credits+'</div></div>'+
  '<div class="stat"><div class="k">Debt</div><div class="v">◉ '+DB.debt+'</div><div class="d">Cleared</div></div>'+
  '<div class="stat"><div class="k">Earned (demo)</div><div class="v gr">◉ 260</div><div class="d">This session</div></div>'+
  '<div class="stat"><div class="k">Spent (demo)</div><div class="v rd">◉ 270</div><div class="d">This session</div></div></div>'+
  '<div class="panel"><h3>Ledger</h3><p class="psub">Recent simulated transactions.</p>'+
  '<table class="tbl"><tr><th>ID</th><th>Description</th><th>Amount</th><th>Balance</th></tr>'+
  DB.txns.map(t=>'<tr><td class="mono">'+t.id+'</td><td>'+esc(t.what)+'</td>'+
  '<td class="mono" style="color:'+(t.amt>0?'var(--green)':'var(--red)')+'">'+(t.amt>0?'+':'')+t.amt+'</td><td class="mono">'+t.bal+'</td></tr>').join('')+'</table></div>';
};

/* ---------------- App: Contracts ---------------- */
APP_RENDER.contracts = function(ws){
  ws.innerHTML = pageHead('Contracts','Time-boxed pacts with milestones. Demo signatures only.',
    '<span class="badge badge-demo"><span class="dot"></span>Demo data</span><button class="btn btn-primary btn-sm" id="ctNew" style="margin-left:10px">+ New contract</button>')+
  '<div class="grid3" id="ctGrid"></div>';
  const draw=()=>{
    $('#ctGrid').innerHTML = DB.contracts.map((c,i)=>
    '<div class="card"><div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:10px">'+
    '<span class="mono" style="font-size:12px;color:var(--muted)">'+c.id+'</span>'+
    '<span class="badge '+(c.status==='Active'?'badge-live':c.status==='Sealed'?'badge-cyan':'')+'">'+c.status+'</span></div>'+
    '<h3>'+esc(c.name)+'</h3><div class="progress mt8"><i style="width:'+c.progress+'%"></i></div>'+
    '<div class="muted mono mt8" style="font-size:11.5px">'+c.progress+'% · ends '+c.ends+'</div>'+
    '<div class="flex gap8 mt16">'+(c.status==='Draft'
      ? '<button class="btn btn-primary btn-sm" data-sign="'+i+'">Sign (demo)</button>'
      : '<button class="btn btn-ghost btn-sm" data-view="'+i+'">Details</button>')+
    (c.status==='Active' ? '<button class="btn btn-danger btn-sm" data-brk="'+i+'">Break</button>' : '')+'</div></div>').join('');
    $$('#ctGrid [data-sign]').forEach(b=>b.onclick=()=>{ const c=DB.contracts[+b.dataset.sign];
      c.status='Active'; c.progress=5; draw(); toast(c.id+' signed (demo)','ok'); });
    $$('#ctGrid [data-view]').forEach(b=>b.onclick=()=>{ const c=DB.contracts[+b.dataset.view];
      toast(c.id+' — '+c.progress+'% complete, ends '+c.ends+' (demo)'); });
    $$('#ctGrid [data-brk]').forEach(b=>b.onclick=()=>{ const c=DB.contracts[+b.dataset.brk];
      confirmModal('Break '+c.id+'?','Breaking costs ◉ 200 credits (demo).','Break contract',()=>{
        c.status='Draft'; c.progress=0; DB.credits-=200; draw(); toast(c.id+' broken — ◉ 200 penalty (demo)','warn'); }); });
  };
  $('#ctNew').onclick=()=>{ DB.contracts.push({id:'CT-'+(2106+DB.contracts.length), name:'Untitled Pact', status:'Draft', progress:0, ends:'—'});
    draw(); toast('Draft contract created (demo)','ok'); };
  draw();
};

/* ---------------- App: Access ---------------- */
APP_RENDER.access = function(ws){
  ws.innerHTML = pageHead('Access','Permission leases grant scoped access. Demo grants only.',
    '<span class="badge badge-demo"><span class="dot"></span>Demo data</span>')+
  '<div class="panel"><h3>Permission leases</h3><p class="psub">Grant, renew or revoke scoped access.</p>'+
  '<table class="tbl"><tr><th>ID</th><th>Scope</th><th>State</th><th>Expires</th><th></th></tr>'+
  DB.leases.map((l,i)=>'<tr><td class="mono">'+l.id+'</td><td>'+esc(l.scope)+'</td>'+
  '<td><span class="badge '+(l.state==='Active'?'badge-live':'badge-red')+'">'+l.state+'</span></td>'+
  '<td class="mono">'+l.expires+'</td><td>'+
  (l.state==='Active'
    ? '<button class="btn btn-ghost btn-sm" data-rvk="'+i+'">Revoke</button> <button class="btn btn-ghost btn-sm" data-rnw="'+i+'">Renew</button>'
    : '<button class="btn btn-primary btn-sm" data-grt="'+i+'">Grant</button>')+'</td></tr>').join('')+'</table></div>';
  $$('#ws [data-rvk]').forEach(b=>b.onclick=()=>{ const l=DB.leases[+b.dataset.rvk];
    confirmModal('Revoke '+l.id+'?','The scope loses access immediately (demo).','Revoke',()=>{ l.state='Revoked'; APP_RENDER.access(ws); toast(l.id+' revoked (demo)','warn'); }); });
  $$('#ws [data-rnw]').forEach(b=>b.onclick=()=>toast(DB.leases[+b.dataset.rnw].id+' renewed +7 days (demo)','ok'));
  $$('#ws [data-grt]').forEach(b=>b.onclick=()=>{ DB.leases[+b.dataset.grt].state='Active'; APP_RENDER.access(ws); toast('Lease granted (demo)','ok'); });
};

/* ---------------- App: Profiles ---------------- */
APP_RENDER.profiles = function(ws){
  const P = DB.profiles;
  const saved = Store.get('profiles', null);
  const profOpts = k => { const cur = Store.get('prof_'+k, P[k].name);
    return [P[k].name, 'Standard', 'Minimal'].map(o=>'<option'+(cur===o?' selected':'')+'>'+esc(o)+'</option>').join(''); };
  ws.innerHTML = pageHead('Profiles','Theme, rules, feedback and effect profiles are independent concepts.',
    '<span class="badge '+(saved?'badge-live':'badge-demo')+'">'+(saved?'Saved config loaded':'Defaults')+'</span>')+
  '<div class="grid2">'+
  [['theme','ThemeProfile','Visual theme for the control center.'],['rule','RulePreset','Detection → policy mapping.'],
   ['feedback','FeedbackProfile','How the system confirms actions.'],['effect','EffectProfile','Default filter preset.']]
  .map(([k,t,d])=>'<div class="panel" style="margin-bottom:0"><h3>'+t+'</h3><p class="psub">'+d+'</p>'+
    '<div class="field"><label>ACTIVE</label><select class="sel" data-p="'+k+'">'+profOpts(k)+'</select></div>'+
    '<div class="muted" style="font-size:12.5px">Current: <b class="mono" data-cur="'+k+'">'+esc(Store.get('prof_'+k, P[k].name))+'</b><br>'+esc(P[k].desc)+'</div></div>').join('')+
  '</div><div class="flex gap8 mt16 wrap">'+
  '<button class="btn btn-primary btn-sm" id="pfSave">Save configuration</button>'+
  '<button class="btn btn-ghost btn-sm" id="pfLoad">Load saved</button>'+
  '<button class="btn btn-danger btn-sm" id="pfReset">Reset to defaults</button></div>';
  $$('#ws [data-p]').forEach(s=>s.onchange=()=>{ $('[data-cur="'+s.dataset.p+'"]', ws).textContent = s.value; });
  $('#pfSave').onclick=()=>{ $$('#ws [data-p]').forEach(s=>Store.set('prof_'+s.dataset.p, s.value));
    Store.set('profiles', true); toast('Configuration saved (demo)','ok'); APP_RENDER.profiles(ws); };
  $('#pfLoad').onclick=()=>{ if(!Store.get('profiles', null)) return toast('No saved configuration (demo)','warn');
    APP_RENDER.profiles(ws); toast('Saved configuration loaded (demo)','ok'); };
  $('#pfReset').onclick=()=>confirmModal('Reset profiles?','Clear saved configuration and restore defaults.','Reset',()=>{
    ['theme','rule','feedback','effect'].forEach(k=>{ try{localStorage.removeItem('hs2_prof_'+k);}catch(e){} });
    try{localStorage.removeItem('hs2_profiles');}catch(e){}
    APP_RENDER.profiles(ws); toast('Profiles reset to defaults (demo)','ok'); });
};

/* ---------------- App: Diagnostics ---------------- */
let diagTimer = null;
APP_RENDER.diagnostics = function(ws){
  ws.innerHTML = pageHead('Diagnostics','Runtime checks and the event log. Simulated entries.',
    '<span class="badge badge-demo"><span class="dot"></span>Demo data</span>'+
    '<button class="btn btn-ghost btn-sm" id="dgPause" style="margin-left:10px">Pause feed</button>')+
  '<div class="grid2"><div class="panel" style="margin-bottom:0"><h3>System checks</h3><p class="psub">Last run just now (demo).</p>'+
  [['Detection pipeline','ok','8 zones mapped'],['Policy engine','ok','pack v2 active'],
   ['Renderer','ok','compositor nominal'],['Lease PL-068','warn','expired — fallback mode'],
   ['External adapter','err','not connected (demo)']].map(c=>
  '<div class="trow"><div class="tl">'+c[0]+'<small>'+c[2]+'</small></div>'+
  '<span class="badge '+(c[1]==='ok'?'badge-live':c[1]==='warn'?'badge-demo':'badge-red')+'">'+c[1].toUpperCase()+'</span></div>').join('')+'</div>'+
  '<div class="panel" style="margin-bottom:0"><h3>Run log</h3><p class="psub">Append-only in this session.</p>'+
  '<div class="log" id="dgLog"></div></div></div>';
  const logEl = $('#dgLog');
  const paint=()=>{ logEl.innerHTML = DB.log.map(l=>'<div class="ln"><span class="ts">'+l.ts+'</span><span class="'+l.cl+'">'+esc(l.msg)+'</span></div>').join('');
    logEl.scrollTop = logEl.scrollHeight; };
  paint();
  let paused=false, n=0;
  const msgs=[['inf','policy: heartbeat ok — no drift'],['ok','renderer: frame composited cleanly'],
    ['inf','demo mode: values simulated'],['warn','compliance sampling in 60s']];
  clearInterval(diagTimer);
  diagTimer=setInterval(()=>{ if(paused) return;
    const m=msgs[n++%msgs.length]; const t=new Date();
    DB.log.push({ts:t.toTimeString().slice(0,8), cls:m[0], msg:m[1]}); paint(); }, 5000);
  $('#dgPause').onclick=e=>{ paused=!paused; e.target.textContent=paused?'Resume feed':'Pause feed';
    toast(paused?'Log feed paused (demo)':'Log feed resumed (demo)'); };
};

/* ---------------- Boot ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const t = document.createElement('div'); t.id='toasts'; document.body.appendChild(t);
  applyTheme();
  route();
});
