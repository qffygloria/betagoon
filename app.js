/* ================= HOTSCREEN V2 — app.js (i18n) ================= */
'use strict';
const $  = (s, r) => (r||document).querySelector(s);
const $$ = (s, r) => Array.from((r||document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* SYNVEIL brand mark — minimalist veil motif in the cold-cyan system */
const SYN_LOGO = '<svg class="synlogo" viewBox="0 0 32 32" fill="none" aria-hidden="true">'
 +'<path d="M6 12.5c4-4.2 16-4.2 20 0" stroke="#22d3ee" stroke-width="2.6" stroke-linecap="round"/>'
 +'<path d="M6 17.5c4-4.2 16-4.2 20 0" stroke="#22d3ee" stroke-width="2.6" stroke-linecap="round" opacity=".6"/>'
 +'<path d="M6 22.5c4-4.2 16-4.2 20 0" stroke="#22d3ee" stroke-width="2.6" stroke-linecap="round" opacity=".32"/>'
 +'<circle cx="16" cy="8.5" r="2.3" fill="#22d3ee"/></svg>';
const brandLogo = (href) => '<a class="logo" href="'+(href||'#/')+'">'+SYN_LOGO+'<span class="bname">'+t('brand.name')+'</span></a>';

/* ---------------- i18n core ---------------- */
const I18N = { lang: 'en' };
function t(key, params){
  const L = (window.HS_LOCALES||{}), d = L[I18N.lang]||{}, f = L.en||{};
  let s = d[key] !== undefined ? d[key] : f[key];
  if(s === undefined){
    if(window.__HS_DEBUG) console.warn('[i18n] missing key:', key);
    return key;
  }
  if(params) s = s.replace(/\{(\w+)\}/g, (m,k)=> params[k]!==undefined ? params[k] : m);
  return s;
}
function initLang(){
  let l = null;
  try{ l = localStorage.getItem('hs2_lang'); }catch(e){}
  if(!l){
    const nav = (navigator.language||'en').toLowerCase();
    l = nav.indexOf('zh')===0 ? 'zh-CN' : 'en';
  }
  I18N.lang = (l==='zh-CN') ? 'zh-CN' : 'en';
  document.documentElement.setAttribute('lang', I18N.lang);
}
function setLang(l){
  if(l!=='en' && l!=='zh-CN') l='en';
  if(l===I18N.lang) return;
  I18N.lang = l;
  try{ localStorage.setItem('hs2_lang', l); }catch(e){}
  document.documentElement.setAttribute('lang', l);
  applyI18nMeta();
  const h = location.hash;
  const isAnchor = h && h!=='#' && h.indexOf('#/')!==0;
  const y = window.scrollY;
  route();
  requestAnimationFrame(()=>{
    if(isAnchor){ const el=$(h); if(el){ el.scrollIntoView(); return; } }
    window.scrollTo(0,y);
  });
  toast(t('toast.lang'));
}
function applyI18nMeta(){
  document.title = t('meta.title');
  const md = document.querySelector('meta[name="description"]');
  if(md) md.setAttribute('content', t('meta.desc'));
}
function langSwitcher(){
  const l = I18N.lang;
  return '<div class="langsw" role="group" aria-label="'+esc(t('a11y.language'))+'">'+
    '<span class="globe" aria-hidden="true">🌐</span>'+
    '<button type="button" class="ls-btn'+(l==='en'?' on':'')+'" data-lang="en">EN</button>'+
    '<span class="sep" aria-hidden="true">|</span>'+
    '<button type="button" class="ls-btn'+(l==='zh-CN'?' on':'')+'" data-lang="zh-CN">中文</button></div>';
}
function bindLangSwitcher(){
  $$('[data-lang]').forEach(b=>{ b.onclick = ()=>setLang(b.dataset.lang); });
}
function fmtNum(n){
  try{ return new Intl.NumberFormat(I18N.lang==='zh-CN'?'zh-CN':'en-US').format(n); }
  catch(e){ return String(n); }
}
/* display-name helpers (internal values stay English) */
const zoneName = id => t('zones.'+id);
const expName  = e => ({Clear:t('exp.clear'),Monitored:t('exp.monitored'),Filtered:t('exp.filtered')}[e]||e);
const fxName   = n => ({Pixelate:t('fx.pixelate'),Blur:t('fx.blur'),'Solid Cover':t('fx.solid'),'Scanlines':t('fx.scanlines'),'Glitch':t('fx.glitch'),'Cel Shader':t('fx.cel'),'Cellular Noise':t('fx.cellular'),'Oil Painting':t('fx.oil'),'None':t('fx.none')}[n]||n);
/* effective mode for a stack filter (old configs without mode -> legacy behavior) */
const fxEffMode = f => { const lib = FX_LIB.find(l=>l.name===f.name); return f.params.mode || (lib&&lib.legacyMode) || 'classic'; };
const accName  = a => ({Granted:t('access.granted'),Leased:t('access.leased')}[a]||a);

/* ---------------- Mock Data Provider (demo data only) ---------------- */
const DB = {
  level: 4, xp: 1250, xpNext: 2000, compliance: 92,
  credits: 1840, debt: 0,
  contract: { id:'CT-2091', nameKey:'ct.name1', stKey:'ct.stActive', ends:'2026-11-08' },
  lease: { id:'PL-077', scopeKey:'acc.scope1', expires:'2026-10-15' },
  zones: [
    { id:'head',   vis:true,  exposure:'Clear',    stage:1, xp:120, credits:0,   access:'Granted',  effect:'None' },
    { id:'torso',  vis:true,  exposure:'Filtered', stage:3, xp:340, credits:120, access:'Granted',  effect:'Pixelate' },
    { id:'l_arm',  vis:true,  exposure:'Clear',    stage:0, xp:40,  credits:0,   access:'Granted',  effect:'None' },
    { id:'r_arm',  vis:true,  exposure:'Clear',    stage:0, xp:40,  credits:0,   access:'Granted',  effect:'None' },
    { id:'l_hand', vis:true,  exposure:'Monitored',stage:2, xp:90,  credits:20,  access:'Granted',  effect:'Blur' },
    { id:'r_hand', vis:true,  exposure:'Monitored',stage:2, xp:90,  credits:20,  access:'Granted',  effect:'Blur' },
    { id:'l_leg',  vis:false, exposure:'Filtered', stage:4, xp:210, credits:150, access:'Leased',   effect:'Solid Cover' },
    { id:'r_leg',  vis:false, exposure:'Filtered', stage:4, xp:210, credits:150, access:'Leased',   effect:'Solid Cover' },
  ],
  stack: [
    { id:'fx1', name:'Pixelate',    on:true,  params:{ size:14 } },
    { id:'fx2', name:'Blur',        on:false, params:{ radius:8 } },
    { id:'fx3', name:'Solid Cover', on:false, params:{ opacity:85 } },
  ],
  events: [
    { t:'09:41', key:'ev.zoneReassign', p:{zone:'torso', fx:'Pixelate'}, cls:'inf' },
    { t:'09:12', key:'ev.levelUp', p:{n:4}, cls:'ok' },
    { t:'08:57', key:'ev.leaseRenew', p:{id:'PL-077', d:7}, cls:'inf' },
    { t:'08:30', key:'ev.compliance', p:{n:92}, cls:'ok' },
    { t:'08:02', key:'ev.milestone', p:{id:'CT-2091'}, cls:'warn' },
  ],
  txns: [
    { id:'TX-8812', key:'txn.preset', p:{name:'fx.presetName'}, amt:-120, bal:1840 },
    { id:'TX-8809', key:'txn.bonus', p:{}, amt:60, bal:1960 },
    { id:'TX-8801', key:'txn.lease', p:{zone:'l_leg', d:7}, amt:-150, bal:1900 },
    { id:'TX-8794', key:'txn.milestone', p:{n:4}, amt:200, bal:2050 },
  ],
  contracts: [
    { id:'CT-2091', nameKey:'ct.name1', stKey:'ct.stActive', progress:64, ends:'2026-11-08' },
    { id:'CT-2077', nameKey:'ct.name2', stKey:'ct.stSealed', progress:100, ends:'2026-09-30' },
    { id:'CT-2105', nameKey:'ct.name3', stKey:'ct.stDraft', progress:0, ends:'—' },
  ],
  leases: [
    { id:'PL-077', scopeKey:'acc.scope1', stKey:'acc.stActive', expires:'2026-10-15' },
    { id:'PL-071', scopeKey:'acc.scope2', stKey:'acc.stActive', expires:'2026-10-20' },
    { id:'PL-068', scopeKey:'acc.scope3', stKey:'acc.stExpired', expires:'2026-09-28' },
  ],
  log: [
    { ts:'09:41:02', cls:'inf',  key:'diag.logRender', p:{f:88210, ms:6.2} },
    { ts:'09:41:00', cls:'ok',   key:'diag.logPolicy', p:{zone:'torso', fx:'Pixelate'} },
    { ts:'09:40:47', cls:'warn', key:'diag.logLease', p:{id:'PL-068'} },
    { ts:'09:39:15', cls:'inf',  key:'diag.logDemo', p:{} },
    { ts:'09:38:02', cls:'err',  key:'diag.logSkip', p:{fx:'Blur'} },
  ],
  profiles: {
    theme:    { descKey:'prof.themeD' },
    rule:     { descKey:'prof.ruleD' },
    feedback: { descKey:'prof.feedbackD' },
    effect:   { descKey:'prof.effectD' },
  }
};
const N_LEVELS = 11;
const lvlName = i => t('lvl.'+i);

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
  back.innerHTML = '<div class="modal" role="dialog" aria-label="'+esc(title)+'"><h3>'+esc(title)+'</h3><p>'+esc(body)+'</p>'+
    '<div class="mrow"><button class="btn btn-ghost btn-sm" data-x>'+esc(t('modal.cancel'))+'</button>'+
    '<button class="btn btn-danger btn-sm" data-ok>'+esc(okLabel)+'</button></div></div>';
  document.body.appendChild(back);
  $('[data-x]', back).onclick = ()=>back.remove();
  back.addEventListener('click', e=>{ if(e.target===back) back.remove(); });
  $('[data-ok]', back).onclick = ()=>{ back.remove(); onOk && onOk(); };
}

/* ---------------- Theme ---------------- */
function applyTheme(){
  const tc = Store.get('theme','dark');
  document.documentElement.setAttribute('data-theme', tc);
  const b = $('#themeBtn'); if(b) b.textContent = tc==='dark' ? '◐' : '◑';
}
function toggleTheme(){
  const tc = Store.get('theme','dark')==='dark' ? 'light' : 'dark';
  Store.set('theme', tc); applyTheme();
  toast(t('toast.theme', {t: t('theme.'+tc)}), 'ok');
}

/* ---------------- Test pattern painter (neutral素材) ---------------- */
function paintPattern(ctx, w, h, variant){
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'#0d1626'); g.addColorStop(1,'#131c30');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = 'rgba(48,216,230,.14)'; ctx.lineWidth = 1;
  for(let x=0;x<w;x+=24){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
  for(let y=0;y<h;y+=24){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
  /* soft radial light orb + diagonal sheen: gives Cel banding and Cellular overlay something to work with */
  const rg = ctx.createRadialGradient(w*0.72, h*0.28, 8, w*0.72, h*0.28, w*0.46);
  rg.addColorStop(0,'rgba(150,190,240,0.34)'); rg.addColorStop(1,'rgba(150,190,240,0)');
  ctx.fillStyle = rg; ctx.fillRect(0,0,w,h);
  const dg = ctx.createLinearGradient(0,h,w,0);
  dg.addColorStop(0,'rgba(48,216,230,0.10)'); dg.addColorStop(0.5,'rgba(0,0,0,0)'); dg.addColorStop(1,'rgba(215,76,91,0.10)');
  ctx.fillStyle = dg; ctx.fillRect(0,0,w,h);
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
  ctx.fillStyle='rgba(232,237,243,.5)'; ctx.font='11px "JetBrains Mono", monospace';
  ctx.fillText(t('testpattern.note'), 10, h-10);
}
/* apply an effect stack to src canvas → dst canvas (internal names stay English) */
function renderStack(src, dst, stack){
  const w = src.width, h = src.height;
  dst.width = w; dst.height = h;
  const c = dst.getContext('2d');
  c.drawImage(src, 0, 0);
  stack.forEach(fx=>{
    if(!fx.on) return;
    if(fx.name==='Pixelate'){
      const s = Math.max(2, fx.params.size|0);
      const tc2 = document.createElement('canvas');
      tc2.width = Math.max(1, w/s|0); tc2.height = Math.max(1, h/s|0);
      tc2.getContext('2d').drawImage(dst, 0, 0, tc2.width, tc2.height);
      c.imageSmoothingEnabled = false;
      c.drawImage(tc2, 0, 0, tc2.width, tc2.height, 0, 0, w, h);
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
    }else if(fx.name==='Glitch'){
      applyGlitch(c, w, h, fx.params||{});
    }else if(fx.name==='Cel Shader'){
      applyCel(c, w, h, fx.params||{});
    }else if(fx.name==='Cellular Noise'){
      applyCellular(c, w, h, fx.params||{});
    }else if(fx.name==='Oil Painting'){
      applyOil(c, w, h, fx.params||{});
    }
  });
}

/* ---------------- Seeded RNG (deterministic procedural effects) ---------------- */
function rng32(seed){
  let a = (seed|0) >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* animation frame for Glitch (reset on route change; 0 = static) */
const FX_ANIM = { frame: 0 };
function mkCanvas(w, h){ const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }

/* ---------------- Glitch: seeded digital tearing ----------------
   Bands -> blocks -> RGB split -> sparse noise. intensity=0 is a no-op.
   Deterministic for fixed (seed, FX_ANIM.frame). */
function applyGlitch(c, w, h, p){
  const intensity = Math.max(0, Math.min(100, p.intensity|0));
  if(intensity <= 0) return;
  const rnd = rng32((p.seed|0) + FX_ANIM.frame * 7919);
  const disp = Math.max(0, Math.min(40, p.displacement|0));
  const rgb  = Math.max(0, Math.min(20, p.rgbSplit|0));
  const blk  = Math.max(4, Math.min(64, p.blockSize|0));
  const tmp = mkCanvas(w, h), tc = tmp.getContext('2d');
  tc.drawImage(c.canvas, 0, 0);
  /* 1. horizontal displacement bands */
  const bands = 2 + Math.round(intensity/100 * 14);
  for(let i=0;i<bands;i++){
    const bh = Math.max(2, Math.round(blk * (0.3 + rnd()*1.2)));
    const y = Math.floor(rnd() * Math.max(1, h - bh));
    const dx = Math.round((rnd()*2-1) * disp * (0.3 + intensity/100));
    if(dx===0) continue;
    const strip = tc.getImageData(0, y, w, bh);
    tc.clearRect(0, y, w, bh);
    tc.putImageData(strip, dx, y);
  }
  /* 2. block corruption: displaced copies or solid glitch blocks */
  const nBlocks = Math.round(intensity/100 * 10);
  const cols = [[48,216,230],[215,76,91],[243,179,93],[232,237,243]];
  for(let i=0;i<nBlocks;i++){
    const bw = blk, bh = Math.max(4, Math.round(blk*(0.5+rnd())));
    const x = Math.floor(rnd()*Math.max(1,w-bw)), y = Math.floor(rnd()*Math.max(1,h-bh));
    if(rnd() < 0.45){
      const col = cols[Math.floor(rnd()*cols.length)];
      tc.fillStyle = 'rgba('+col[0]+','+col[1]+','+col[2]+','+(0.45+rnd()*0.5).toFixed(2)+')';
      tc.fillRect(x, y, bw, bh);
    }else{
      const sx = Math.floor(rnd()*Math.max(1,w-bw)), sy = Math.floor(rnd()*Math.max(1,h-bh));
      tc.drawImage(tmp, sx, sy, bw, bh, x, y, bw, bh);
    }
  }
  /* 3. RGB channel split (per-pixel, single pass) */
  if(rgb > 0){
    const amt = Math.max(1, Math.round(rgb * (0.4 + intensity/100*0.6)));
    const img = tc.getImageData(0, 0, w, h), d = img.data;
    const src = new Uint8ClampedArray(d);
    for(let y=0;y<h;y++){
      const row = y*w;
      for(let x=0;x<w;x++){
        const o = (row+x)*4;
        const xr = x-amt < 0 ? 0 : x-amt, xb = x+amt >= w ? w-1 : x+amt;
        d[o] = src[(row+xr)*4];
        d[o+2] = src[(row+xb)*4+2];
      }
    }
    tc.putImageData(img, 0, 0);
  }
  /* 4. sparse digital noise */
  const nNoise = Math.round(intensity * 6);
  for(let i=0;i<nNoise;i++){
    const x = Math.floor(rnd()*w), y = Math.floor(rnd()*h), v = Math.floor(rnd()*255);
    tc.fillStyle = rnd()<0.5 ? 'rgb('+v+','+v+','+v+')' : 'rgba(48,216,230,0.8)';
    tc.fillRect(x, y, 2, 2);
  }
  c.drawImage(tmp, 0, 0);
}

/* ---------------- Cel Shader: toon quantization + Sobel ink outlines ----------------
   blend=0 is a no-op. Distinct from Pixelate: flat color bands, not enlarged blocks.
   (Classic Toon mode — kept for backward compatibility.) */
function applyCelClassic(c, w, h, p){
  const blend = Math.max(0, Math.min(100, p.blend|0))/100;
  if(blend <= 0) return;
  const levels = Math.max(2, Math.min(12, p.levels|0));
  const edgeT = Math.max(0, Math.min(100, p.edgeThreshold|0));
  const outline = Math.max(0, Math.min(100, p.outline|0))/100;
  const sat = Math.max(0, Math.min(200, p.saturation|0))/100;
  const img = c.getImageData(0, 0, w, h), d = img.data, n = w*h;
  const lum = new Float32Array(n);
  for(let i=0;i<n;i++){ const o=i*4; lum[i] = 0.2126*d[o]+0.7152*d[o+1]+0.0722*d[o+2]; }
  const thr = Math.pow(1-edgeT/100, 2) * 600;
  const orig = new Uint8ClampedArray(d);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const i = y*w+x, o = i*4, L = lum[i];
      /* quantize luminance into flat bands, scale rgb to preserve hue */
      const q = Math.min(levels-1, Math.floor(L/256*levels));
      const qL = (q+0.5)/levels*255, s = L>1 ? qL/L : 1;
      let r = d[o]*s, g = d[o+1]*s, b = d[o+2]*s;
      const g2 = 0.2126*r+0.7152*g+0.0722*b;
      r = g2+(r-g2)*sat; g = g2+(g-g2)*sat; b = g2+(b-g2)*sat;
      /* Sobel edge -> ink outline */
      if(outline > 0 && x>0 && x<w-1 && y>0 && y<h-1){
        const gx = -lum[i-w-1]-2*lum[i-1]-lum[i+w-1]+lum[i-w+1]+2*lum[i+1]+lum[i+w+1];
        const gy = -lum[i-w-1]-2*lum[i-w]-lum[i-w+1]+lum[i+w-1]+2*lum[i+w]+lum[i+w+1];
        const mag = Math.sqrt(gx*gx+gy*gy);
        if(mag > thr){
          const k = Math.min(1, (mag-thr)/300) * outline, ik = 1-k;
          r*=ik; g*=ik; b*=ik;
        }
      }
      d[o]   = orig[o]  +(r-orig[o])  *blend;
      d[o+1] = orig[o+1]+(g-orig[o+1])*blend;
      d[o+2] = orig[o+2]+(b-orig[o+2])*blend;
    }
  }
  c.putImageData(img, 0, 0);
}

/* seeded 2D value noise (smooth, for irregular region boundaries) */
function vnoise2(x, y, seed){
  const xi = Math.floor(x), yi = Math.floor(y), xf = x-xi, yf = y-yi;
  const h = function(a, b){
    let n = (Math.imul(a,374761393) + Math.imul(b,668265263) + Math.imul(seed,1442695041))|0;
    n = (n ^ (n>>>13))|0; n = Math.imul(n,1274126177); n = (n ^ (n>>>16))>>>0;
    return n/4294967296;
  };
  const u = xf*xf*(3-2*xf), v = yf*yf*(3-2*yf);
  return h(xi,yi)*(1-u)*(1-v) + h(xi+1,yi)*u*(1-v) + h(xi,yi+1)*(1-u)*v + h(xi+1,yi+1)*u*v;
}
/* small k-means over cell average colors (deterministic via seed) */
function kmeansPalette(avg, nCells, k, seed){
  const rnd = rng32(seed^0x51af);
  const cents = [], used = {};
  let guard = 0;
  while(cents.length < k && guard++ < 200){
    const i = Math.floor(rnd()*nCells);
    if(!used[i]){ used[i] = 1; cents.push([avg[3*i],avg[3*i+1],avg[3*i+2]]); }
  }
  const assign = new Uint8Array(nCells);
  for(let it=0; it<12; it++){
    for(let i=0;i<nCells;i++){
      let bi=0, bd=1e18;
      for(let j=0;j<cents.length;j++){
        const dr=avg[3*i]-cents[j][0], dg=avg[3*i+1]-cents[j][1], db=avg[3*i+2]-cents[j][2];
        const dd=dr*dr+dg*dg+db*db;
        if(dd<bd){ bd=dd; bi=j; }
      }
      assign[i]=bi;
    }
    const sum=new Float64Array(cents.length*3), cnt=new Float64Array(cents.length);
    for(let i=0;i<nCells;i++){ const a=assign[i]; sum[3*a]+=avg[3*i]; sum[3*a+1]+=avg[3*i+1]; sum[3*a+2]+=avg[3*i+2]; cnt[a]++; }
    for(let j=0;j<cents.length;j++) if(cnt[j]>0){ cents[j][0]=sum[3*j]/cnt[j]; cents[j][1]=sum[3*j+1]/cnt[j]; cents[j][2]=sum[3*j+2]/cnt[j]; }
  }
  return cents;
}

/* ---------------- Cel Shader: Palette Regions (new default) ----------------
   Irregular flat color regions driven by image color/luminance, with
   noise-perturbed hand-cut boundaries. blend=0 is a no-op. */
const CEL_REF_PALETTE = [
  [232,144,156],[154,160,60],[232,201,60],[58,63,69],
  [240,235,225],[70,90,110],[62,142,138],[180,90,60]
];
function applyCelRegions(c, w, h, p){
  const blend = Math.max(0, Math.min(100, p.blend|0))/100;
  if(blend <= 0) return;
  const regionSize = Math.max(8, Math.min(64, p.regionSize|0 || 18));
  const colorCount = Math.max(2, Math.min(8, p.colorCount|0 || 4));
  const paletteName = p.palette || 'reference';
  const variation = Math.max(0, Math.min(100, p.colorVariation==null?25:p.colorVariation))/100;
  const irregularity = Math.max(0, Math.min(100, p.edgeIrregularity==null?50:p.edgeIrregularity))/100;
  const smoothness = Math.max(0, Math.min(100, p.edgeSmoothness==null?60:p.edgeSmoothness))/100;
  const seed = p.seed|0;
  const img = c.getImageData(0, 0, w, h), d = img.data, n = w*h;
  /* 1. palette */
  let palette;
  if(paletteName === 'original'){
    const ns = Math.min(n, 4000), samp = new Float32Array(ns*3), rs = rng32(seed^0x51af);
    for(let i=0;i<ns;i++){ const o=(Math.floor(rs()*n))*4; samp[3*i]=d[o]; samp[3*i+1]=d[o+1]; samp[3*i+2]=d[o+2]; }
    palette = kmeansPalette(samp, ns, colorCount, seed);
  }else{
    palette = CEL_REF_PALETTE.slice(0, Math.min(colorCount, CEL_REF_PALETTE.length)).map(a=>a.slice());
  }
  const npal = palette.length;
  /* 2. strongly smooth the image: downscale -> blur -> upscale (organic regions) */
  const ds = Math.max(2, Math.min(12, Math.round(regionSize/3)));
  const sw = Math.max(1, Math.round(w/ds)), sh = Math.max(1, Math.round(h/ds));
  const tmp = mkCanvas(w, h); tmp.getContext('2d').putImageData(img, 0, 0);
  const sc = mkCanvas(sw, sh), sx = sc.getContext('2d');
  sx.imageSmoothingEnabled = true; sx.imageSmoothingQuality = 'high';
  sx.drawImage(tmp, 0, 0, sw, sh);
  sx.filter = 'blur(1.5px)'; sx.drawImage(sc, 0, 0); sx.drawImage(sc, 0, 0); sx.filter = 'none';
  const sm = mkCanvas(w, h), smx = sm.getContext('2d');
  smx.imageSmoothingEnabled = true; smx.imageSmoothingQuality = 'high';
  smx.drawImage(sc, 0, 0, w, h);
  const sd = smx.getImageData(0, 0, w, h).data;
  /* 3. coarse perturbation + low-freq variation fields */
  const nAmp = irregularity * regionSize * 0.5;
  const nScale = 1/(regionSize*(1.2 + smoothness*3));
  const nStep = Math.max(4, Math.round(regionSize/3));
  const nw = Math.ceil(w/nStep)+2, nh = Math.ceil(h/nStep)+2;
  const nfx = new Float32Array(nw*nh), nfy = new Float32Array(nw*nh), nvv = new Float32Array(nw*nh);
  const s1 = seed^0x1111, s2 = seed^0x2222, s3 = seed^0x3333;
  for(let j=0;j<nh;j++) for(let i=0;i<nw;i++){
    const k=j*nw+i, X=i*nStep*nScale, Y=j*nStep*nScale;
    nfx[k] = (0.65*vnoise2(X,Y,s1) + 0.35*vnoise2(X*2.13+7.3,Y*2.13+3.1,s1) - 0.5)*2*nAmp;
    nfy[k] = (0.65*vnoise2(X,Y,s2) + 0.35*vnoise2(X*2.13+1.7,Y*2.13+9.2,s2) - 0.5)*2*nAmp;
    nvv[k] = 1 + (vnoise2(X*0.5+3.7, Y*0.5+9.1, s3)-0.5)*variation*0.6;
  }
  const bsamp = function(f, x, y){
    const fx=Math.max(0,Math.min(nw-1.001,x/nStep)), fy=Math.max(0,Math.min(nh-1.001,y/nStep));
    const ix=Math.floor(fx), iy=Math.floor(fy), tx=fx-ix, ty=fy-iy, k=iy*nw+ix;
    return f[k]*(1-tx)*(1-ty)+f[k+1]*tx*(1-ty)+f[k+nw]*(1-tx)*ty+f[k+nw+1]*tx*ty;
  };
  /* 4. per-pixel: perturbed smooth sample -> nearest palette -> flat color */
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const o=(y*w+x)*4;
      let qx=x, qy=y;
      if(nAmp > 0.01){ qx = x + bsamp(nfx,x,y); qy = y + bsamp(nfy,x,y); }
      qx = Math.max(0, Math.min(w-1, Math.round(qx))); qy = Math.max(0, Math.min(h-1, Math.round(qy)));
      const so=(qy*w+qx)*4, sr=sd[so], sg=sd[so+1], sb=sd[so+2];
      let bi=0, bd=1e18;
      for(let j=0;j<npal;j++){
        const dr=sr-palette[j][0], dg=sg-palette[j][1], db=sb-palette[j][2];
        const dd=dr*dr+dg*dg+db*db;
        if(dd<bd){ bd=dd; bi=j; }
      }
      const vv = bsamp(nvv,x,y);
      const pr = palette[bi][0]*vv, pgc = palette[bi][1]*vv, pb = palette[bi][2]*vv;
      d[o]   += (pr -d[o])  *blend;
      d[o+1] += (pgc-d[o+1])*blend;
      d[o+2] += (pb -d[o+2])*blend;
    }
  }
  c.putImageData(img, 0, 0);
}

/* Cel Shader dispatcher: old configs (no mode) -> classic; new adds default to regions */
function applyCel(c, w, h, p){
  if((p.mode || 'classic') === 'regions') applyCelRegions(c, w, h, p);
  else applyCelClassic(c, w, h, p);
}

/* ---------------- Cellular Noise: 2D Voronoi / Worley ----------------
   (Noise Overlay mode — the original texture. F1/F2 field cached per size/jitter/seed.) */
const worleyCache = new Map();
function worleyField(w, h, scale, jitter01, seed){
  const key = w+'x'+h+'|'+scale+'|'+jitter01.toFixed(3)+'|'+seed;
  const hit = worleyCache.get(key);
  if(hit) return hit;
  const rnd = rng32(seed);
  const gw = Math.ceil(w/scale)+2, gh = Math.ceil(h/scale)+2;
  const px = new Float32Array(gw*gh), py = new Float32Array(gw*gh);
  for(let j=0;j<gh;j++) for(let i=0;i<gw;i++){
    const k = j*gw+i;
    px[k] = (i+0.5+(rnd()*2-1)*jitter01*0.5)*scale;
    py[k] = (j+0.5+(rnd()*2-1)*jitter01*0.5)*scale;
  }
  const f1 = new Float32Array(w*h), f2 = new Float32Array(w*h), maxD = scale*1.5;
  for(let y=0;y<h;y++){
    const cy = Math.floor(y/scale)+1;
    for(let x=0;x<w;x++){
      const cx = Math.floor(x/scale)+1;
      let b1=1e12, b2=1e12;
      for(let j=-1;j<=1;j++) for(let i=-1;i<=1;i++){
        const k = (cy+j)*gw+(cx+i);
        const dx = px[k]-x, dy = py[k]-y, dd = dx*dx+dy*dy;
        if(dd<b1){ b2=b1; b1=dd; } else if(dd<b2){ b2=dd; }
      }
      const idx = y*w+x;
      f1[idx] = Math.sqrt(b1)/maxD; f2[idx] = Math.sqrt(b2)/maxD;
    }
  }
  const e = { f1:f1, f2:f2 };
  worleyCache.set(key, e);
  if(worleyCache.size > 4) worleyCache.delete(worleyCache.keys().next().value);
  return e;
}
/* (Noise Overlay mode — the original Worley texture; kept for backward compatibility.) */
function applyCellOverlay(c, w, h, p){
  const opacity = Math.max(0, Math.min(100, p.opacity|0))/100;
  if(opacity <= 0) return;
  const scale = Math.max(4, Math.min(40, p.cellScale|0));
  const jitter = Math.max(0, Math.min(100, p.jitter|0))/100;
  const contrast = Math.max(0, Math.min(200, p.contrast|0))/100;
  const edgeS = Math.max(0, Math.min(100, p.edge|0))/100;
  const fld = worleyField(w, h, scale, jitter, p.seed|0);
  const f1 = fld.f1, f2 = fld.f2;
  const img = c.getImageData(0, 0, w, h), d = img.data, n = w*h;
  const edgeW = 0.16;
  for(let i=0;i<n;i++){
    let v = 0.5 + (Math.min(1, f1[i])-0.5)*contrast;
    v = v<0?0:v>1?1:v;
    let pr = 28+v*92, pgc = 58+v*112, pb = 78+v*122;
    const ek = Math.pow(Math.max(0, 1-(f2[i]-f1[i])/edgeW), 1.5)*edgeS;
    pr += (150-pr)*ek; pgc += (232-pgc)*ek; pb += (242-pb)*ek;
    const o = i*4;
    d[o]   += (pr -d[o])  *opacity;
    d[o+1] += (pgc-d[o+1])*opacity;
    d[o+2] += (pb -d[o+2])*opacity;
  }
  c.putImageData(img, 0, 0);
}

/* shared Voronoi cell structure (seeded jittered grid) */
function voronoiCells(w, h, scale, jitter01, seed){
  const rnd = rng32(seed);
  const gw = Math.ceil(w/scale)+2, gh = Math.ceil(h/scale)+2;
  const px = new Float32Array(gw*gh), py = new Float32Array(gw*gh);
  for(let j=0;j<gh;j++) for(let i=0;i<gw;i++){
    const k = j*gw+i;
    px[k] = (i+0.5+(rnd()*2-1)*jitter01*0.5)*scale;
    py[k] = (j+0.5+(rnd()*2-1)*jitter01*0.5)*scale;
  }
  return { gw:gw, gh:gh, px:px, py:py, scale:scale };
}
/* nearest cell id + F1/F2 for one pixel (3x3 search is exact for jitter<=1) */
function nearestCell(vc, x, y){
  const gw = vc.gw, px = vc.px, py = vc.py, s = vc.scale;
  const cx = Math.floor(x/s)+1, cy = Math.floor(y/s)+1;
  let bi=-1, b1=1e18, b2=1e18;
  for(let j=-1;j<=1;j++) for(let i=-1;i<=1;i++){
    const k=(cy+j)*gw+(cx+i);
    const dx=px[k]-x, dy=py[k]-y, dd=dx*dx+dy*dy;
    if(dd<b1){ b2=b1; b1=dd; bi=k; } else if(dd<b2){ b2=dd; }
  }
  return { id:bi, f1:Math.sqrt(b1), f2:Math.sqrt(b2) };
}

/* ---------------- Cellular: Flat Cells (new default) ----------------
   The image is truly fragmented: each Voronoi cell is filled with its
   region's representative color. opacity=0 is a no-op. */
function applyCellFlat(c, w, h, p, pre){
  const opacity = Math.max(0, Math.min(100, p.opacity|0))/100;
  if(opacity <= 0) return;
  const scale = Math.max(8, Math.min(64, p.cellScale|0 || 28));
  const density = Math.max(10, Math.min(100, p.density==null?100:p.density));
  const effScale = scale * (1 + (100-density)/100*1.5);
  const jitter = Math.max(0, Math.min(100, p.jitter==null?60:p.jitter))/100;
  const borderW = Math.max(0, Math.min(8, p.borderWidth==null?2:p.borderWidth));
  const borderDark = Math.max(0, Math.min(100, p.borderDark==null?50:p.borderDark))/100;
  const colorMode = p.colorMode || 'average';
  const seed = p.seed|0;
  const vc = voronoiCells(w, h, effScale, jitter, seed);
  const n = w*h, nCells = vc.gw*vc.gh;
  const ids = new Int32Array(n), df = new Float32Array(n);
  const sum = new Float64Array(nCells*3), cnt = new Float64Array(nCells);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const nc = nearestCell(vc, x, y), i = y*w+x, o = i*4;
    ids[i] = nc.id; df[i] = nc.f2-nc.f1;
    sum[3*nc.id]+=pre[o]; sum[3*nc.id+1]+=pre[o+1]; sum[3*nc.id+2]+=pre[o+2]; cnt[nc.id]++;
  }
  const img = c.getImageData(0, 0, w, h), d = img.data;
  for(let i=0;i<n;i++){
    const id = ids[i], o = i*4;
    let pr, pgc, pb;
    if(colorMode === 'center'){
      const cx = Math.max(0, Math.min(w-1, Math.round(vc.px[id]))), cy = Math.max(0, Math.min(h-1, Math.round(vc.py[id])));
      const co = (cy*w+cx)*4; pr = pre[co]; pgc = pre[co+1]; pb = pre[co+2];
    }else{
      const cc = cnt[id]||1; pr = sum[3*id]/cc; pgc = sum[3*id+1]/cc; pb = sum[3*id+2]/cc;
    }
    if(borderW > 0 && borderDark > 0 && df[i] < borderW){
      const k = (1 - df[i]/borderW) * borderDark;
      pr *= (1-k); pgc *= (1-k); pb *= (1-k);
    }
    d[o]   += (pr -d[o])  *opacity;
    d[o+1] += (pgc-d[o+1])*opacity;
    d[o+2] += (pb -d[o+2])*opacity;
  }
  c.putImageData(img, 0, 0);
}

/* ---------------- Cellular: Fragmented Image ----------------
   Cells keep their local image texture, each shifted slightly (seeded).
   opacity=0 is a no-op. */
function applyCellFragments(c, w, h, p, pre){
  const opacity = Math.max(0, Math.min(100, p.opacity|0))/100;
  if(opacity <= 0) return;
  const scale = Math.max(8, Math.min(64, p.cellScale|0 || 28));
  const density = Math.max(10, Math.min(100, p.density==null?100:p.density));
  const effScale = scale * (1 + (100-density)/100*1.5);
  const jitter = Math.max(0, Math.min(100, p.jitter==null?60:p.jitter))/100;
  const disp = Math.max(0, Math.min(30, p.displacement==null?6:p.displacement));
  const borderW = Math.max(0, Math.min(8, p.borderWidth==null?2:p.borderWidth));
  const borderDark = Math.max(0, Math.min(100, p.borderDark==null?55:p.borderDark))/100;
  const seed = p.seed|0;
  const vc = voronoiCells(w, h, effScale, jitter, seed);
  const nCells = vc.gw*vc.gh;
  const rnd = rng32(seed^0x77aa);
  const cdx = new Float32Array(nCells), cdy = new Float32Array(nCells);
  for(let k=0;k<nCells;k++){
    const a = rnd()*6.2832, m = rnd()*disp;
    cdx[k] = Math.cos(a)*m; cdy[k] = Math.sin(a)*m;
  }
  const img = c.getImageData(0, 0, w, h), d = img.data, n = w*h;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const nc = nearestCell(vc, x, y), i = y*w+x, o = i*4;
    const sx = Math.max(0, Math.min(w-1, Math.round(x - cdx[nc.id])));
    const sy = Math.max(0, Math.min(h-1, Math.round(y - cdy[nc.id])));
    const so = (sy*w+sx)*4;
    let pr = pre[so], pgc = pre[so+1], pb = pre[so+2];
    if(borderW > 0 && borderDark > 0 && (nc.f2-nc.f1) < borderW){
      const k = (1 - (nc.f2-nc.f1)/borderW) * borderDark;
      pr *= (1-k); pgc *= (1-k); pb *= (1-k);
    }
    d[o]   += (pr -d[o])  *opacity;
    d[o+1] += (pgc-d[o+1])*opacity;
    d[o+2] += (pb -d[o+2])*opacity;
  }
  c.putImageData(img, 0, 0);
}

/* Cellular Noise dispatcher: old configs (no mode) -> overlay; new adds default to flat */
function applyCellular(c, w, h, p){
  const mode = p.mode || 'overlay';
  if(mode === 'flat' || mode === 'fragments'){
    const img = c.getImageData(0, 0, w, h);
    const pre = new Uint8ClampedArray(img.data);
    if(mode === 'flat') applyCellFlat(c, w, h, p, pre);
    else applyCellFragments(c, w, h, p, pre);
  }else{
    applyCellOverlay(c, w, h, p);
  }
}

/* ---------------- Oil Painting: Kuwahara painterly smoothing ----------------
   Integral-image accelerated. blend=0 is a no-op. Deterministic (no RNG). */
function kuwaharaPass(img, w, h, r, edgeP){
  const d = img.data, W = w+1;
  const iL=new Float64Array(W*(h+1)), iL2=new Float64Array(W*(h+1));
  const iR=new Float64Array(W*(h+1)), iG=new Float64Array(W*(h+1)), iB=new Float64Array(W*(h+1));
  for(let y=0;y<h;y++){
    let sL=0,sL2=0,sR=0,sG=0,sB=0;
    const row=(y+1)*W, prow=y*W;
    for(let x=0;x<w;x++){
      const o=(y*w+x)*4;
      const L=0.2126*d[o]+0.7152*d[o+1]+0.0722*d[o+2];
      sL+=L; sL2+=L*L; sR+=d[o]; sG+=d[o+1]; sB+=d[o+2];
      const k=row+x+1, ku=prow+x+1;
      iL[k]=iL[ku]+sL; iL2[k]=iL2[ku]+sL2;
      iR[k]=iR[ku]+sR; iG[k]=iG[ku]+sG; iB[k]=iB[ku]+sB;
    }
  }
  const out = new Uint8ClampedArray(d.length);
  for(let y=0;y<h;y++){
    const ya=Math.max(0,y-r), yb=y+1, yc=Math.min(h,y+r+1);
    for(let xi=0;xi<w;xi++){
      /* recompute x-dependent corners per pixel */
      const x0=Math.max(0,xi-r), x1=xi+1, x2=Math.min(w,xi+r+1);
      let bVar=1e18, br=0, bg=0, bb=0;
      /* 4 quadrants: [x0,x1]x[ya,yb], [x1,x2]x[ya,yb], [x0,x1]x[yb,yc], [x1,x2]x[yb,yc] */
      for(let q=0;q<4;q++){
        const qx0=q%2?x1:x0, qx1=q%2?x2:x1, qy0=q<2?ya:yb, qy1=q<2?yb:yc;
        const aa=qy0*W+qx0, bb2=qy0*W+qx1, cc=qy1*W+qx0, dd2=qy1*W+qx1;
        const nn=Math.max(1,(qx1-qx0)*(qy1-qy0));
        const sL=(iL[dd2]-iL[bb2]-iL[cc]+iL[aa])/nn;
        const vr=(iL2[dd2]-iL2[bb2]-iL2[cc]+iL2[aa])/nn - sL*sL;
        if(vr<bVar){
          bVar=vr;
          br=(iR[dd2]-iR[bb2]-iR[cc]+iR[aa])/nn;
          bg=(iG[dd2]-iG[bb2]-iG[cc]+iG[aa])/nn;
          bb=(iB[dd2]-iB[bb2]-iB[cc]+iB[aa])/nn;
        }
      }
      /* full-window mean */
      const fa=ya*W+x0, fb=ya*W+x2, fc=yc*W+x0, fd=yc*W+x2;
      const nf=Math.max(1,(x2-x0)*(yc-ya));
      const fr=(iR[fd]-iR[fb]-iR[fc]+iR[fa])/nf;
      const fg=(iG[fd]-iG[fb]-iG[fc]+iG[fa])/nf;
      const fb2=(iB[fd]-iB[fb]-iB[fc]+iB[fa])/nf;
      const o=(y*w+xi)*4;
      out[o]  =fr+(br-fr)  *edgeP;
      out[o+1]=fg+(bg-fg)*edgeP;
      out[o+2]=fb2+(bb-fb2)*edgeP;
      out[o+3]=d[o+3];
    }
  }
  return new ImageData(out, w, h);
}
/* cheap integral-image box blur (for Oil Painting extra smoothing) */
function boxBlurPass(img, w, h, r){
  const d = img.data, W = w+1, H = h+1;
  const iR=new Float64Array(W*H), iG=new Float64Array(W*H), iB=new Float64Array(W*H);
  for(let y=0;y<h;y++){
    let sR=0,sG=0,sB=0;
    for(let x=0;x<w;x++){
      const o=(y*w+x)*4;
      sR+=d[o]; sG+=d[o+1]; sB+=d[o+2];
      const k=(y+1)*W+(x+1), ku=y*W+(x+1);
      iR[k]=iR[ku]+sR; iG[k]=iG[ku]+sG; iB[k]=iB[ku]+sB;
    }
  }
  const out = new Uint8ClampedArray(d.length);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    const x0=Math.max(0,x-r), y0=Math.max(0,y-r), x1=Math.min(w,x+r+1), y1=Math.min(h,y+r+1);
    const nn=(x1-x0)*(y1-y0), o=(y*w+x)*4;
    out[o]  =(iR[y1*W+x1]-iR[y0*W+x1]-iR[y1*W+x0]+iR[y0*W+x0])/nn;
    out[o+1]=(iG[y1*W+x1]-iG[y0*W+x1]-iG[y1*W+x0]+iG[y0*W+x0])/nn;
    out[o+2]=(iB[y1*W+x1]-iB[y0*W+x1]-iB[y1*W+x0]+iB[y0*W+x0])/nn;
    out[o+3]=d[o+3];
  }
  return new ImageData(out, w, h);
}
function applyOil(c, w, h, p){
  const blend = Math.max(0, Math.min(100, p.blend|0))/100;
  if(blend <= 0) return;
  const r = Math.max(1, Math.min(8, p.brushSize|0 || 5));
  const passes = 1 + Math.round(Math.max(0, Math.min(100, p.strokeStrength==null?75:p.strokeStrength))/100);
  const detail = Math.max(0, Math.min(100, p.detail==null?50:p.detail))/200;
  const smoothR = Math.round(Math.max(0, Math.min(100, p.smoothness==null?60:p.smoothness))/100*2);
  const edgeP = Math.max(0, Math.min(100, p.edgePreserve==null?80:p.edgePreserve))/100;
  const sat = Math.max(0, Math.min(200, p.saturation==null?105:p.saturation))/100;
  const tex = Math.max(0, Math.min(100, p.texture|0))/100;
  const srcImg = c.getImageData(0, 0, w, h);
  const orig = new Uint8ClampedArray(srcImg.data);
  let img = srcImg;
  for(let i=0;i<passes;i++) img = kuwaharaPass(img, w, h, r, edgeP);
  /* optional extra smoothing: cheap integral box blur (not another Kuwahara pass) */
  if(smoothR > 0) img = boxBlurPass(img, w, h, smoothR);
  const d = img.data, n = w*h;
  for(let i=0;i<n;i++){
    const o=i*4;
    /* detail preservation: pre-mix with original */
    let rr = d[o]+(orig[o]-d[o])*detail, gg = d[o+1]+(orig[o+1]-d[o+1])*detail, bb = d[o+2]+(orig[o+2]-d[o+2])*detail;
    /* saturation */
    const L = 0.2126*rr+0.7152*gg+0.0722*bb;
    rr = L+(rr-L)*sat; gg = L+(gg-L)*sat; bb = L+(bb-L)*sat;
    /* canvas weave (deterministic) */
    if(tex > 0){
      const wv = Math.sin(i%w*0.35)*Math.sin(Math.floor(i/w)*0.35)*tex*4;
      rr+=wv; gg+=wv; bb+=wv;
    }
    d[o]=rr; d[o+1]=gg; d[o+2]=bb;
  }
  /* final blend with the true original: out = orig*(1-blend) + processed*blend.
     Continuous from 0 (original) to 1 (full oil); RGB and Alpha all interpolated. */
  for(let i=0;i<n;i++){
    const o=i*4, ib=1-blend;
    d[o]=orig[o]*ib+d[o]*blend; d[o+1]=orig[o+1]*ib+d[o+1]*blend;
    d[o+2]=orig[o+2]*ib+d[o+2]*blend; d[o+3]=orig[o+3]*ib+d[o+3]*blend;
  }
  c.putImageData(img, 0, 0);
}

/* ---------------- Router ---------------- */
const APP_PAGES = [
  ['dashboard','01','app.page.dashboard'],
  ['body-parts','02','app.page.body-parts'],
  ['effects','03','app.page.effects'],
  ['progression','04','app.page.progression'],
  ['economy','05','app.page.economy'],
  ['contracts','06','app.page.contracts'],
  ['access','07','app.page.access'],
  ['profiles','08','app.page.profiles'],
  ['diagnostics','09','app.page.diagnostics'],
];
const APP_RENDER = {};
let diagTimer = null;
let heroTimer = null;
function route(){
  _route();
  bindLangSwitcher();
}
function _route(){
  const h = location.hash || '#/';
  const root = $('#view'); if(!root) return;
  document.body.classList.remove('in-app');
  if(diagTimer && h !== '#/app/diagnostics'){ clearInterval(diagTimer); diagTimer = null; }
  if(heroTimer && h.indexOf('#/')===0 && h !== '#/'){ clearInterval(heroTimer); heroTimer = null; }
  stopFxAnim(); cancelFxDraw();
  if(h === '#/' || h === '#'){ window.scrollTo(0,0); renderMarketingHome(root); return; }
  if(h === '#/demo'){ window.scrollTo(0,0); renderDemo(root); return; }
  if(h === '#/docs'){ window.scrollTo(0,0); renderDocs(root); return; }
  if(h.indexOf('#/app/') === 0){
    const page = h.slice(6) || 'dashboard';
    if(APP_RENDER[page]){ document.body.classList.add('in-app'); renderAppShell(root, page); window.scrollTo(0,0); return; }
    location.hash = '#/app/dashboard'; return;
  }
  if(h.indexOf('#/') === 0){ location.hash = '#/'; return; }
  /* plain in-page anchor, e.g. #features — always re-render so that a language
     switch while sitting on an anchor still updates every string */
  renderMarketingHome(root);
  requestAnimationFrame(()=>{ const el = $(h); if(el) el.scrollIntoView(); });
}
window.addEventListener('hashchange', route);

/* ---------------- Marketing chrome ---------------- */
function marketingNav(){
  return '<nav class="mnav">'+brandLogo()+
  '<div class="links"><a href="#features">'+t('nav.features')+'</a><a href="#architecture">'+t('nav.architecture')+'</a>'+
  '<a href="#roadmap">'+t('nav.roadmap')+'</a><a href="#/docs">'+t('nav.docs')+'</a></div>'+
  '<div class="cta-row">'+langSwitcher()+'<a class="btn btn-ghost btn-sm" href="#/demo">'+t('nav.launchDemo')+'</a>'+
  '<a class="btn btn-primary btn-sm" href="#/app/dashboard">'+t('nav.controlCenter')+'</a></div></nav>';
}
function marketingFoot(){
  return '<footer class="mfooter"><div class="cols">'+
  '<div style="max-width:320px">'+brandLogo()+
  '<p style="margin-top:10px">'+t('foot.desc')+'</p></div>'+
  '<div><div class="mono muted" style="font-size:11px;letter-spacing:.2em;margin-bottom:10px">'+t('foot.product')+'</div>'+
  '<div><a href="#features">'+t('nav.features')+'</a></div><div><a href="#/demo">'+t('nav.launchDemo')+'</a></div><div><a href="#/app/dashboard">'+t('nav.controlCenter')+'</a></div></div>'+
  '<div><div class="mono muted" style="font-size:11px;letter-spacing:.2em;margin-bottom:10px">'+t('foot.resources')+'</div>'+
  '<div><a href="#/docs">'+t('nav.docs')+'</a></div><div><a href="#roadmap">'+t('nav.roadmap')+'</a></div></div>'+
  '<div><div class="mono muted" style="font-size:11px;letter-spacing:.2em;margin-bottom:10px">'+t('foot.status')+'</div>'+
  '<div><span class="badge badge-demo"><span class="dot"></span>'+t('hero.badgeDemo')+'</span></div>'+
  '<div style="margin-top:8px"><span class="badge">'+t('foot.comingSoon')+'</span></div></div>'+
  '</div><div class="base"><span>'+t('foot.base')+'</span>'+
  '<span>'+t('foot.build')+'</span></div></footer>';
}

/* ---------------- Marketing: Home ---------------- */
function renderMarketingHome(root){
  root.innerHTML = marketingNav() +
  '<header class="mhero" id="top"><div>'+
    '<div class="kick mono" style="color:var(--cyan);letter-spacing:.3em;font-size:12px;margin-bottom:16px">'+t('hero.kick')+'</div>'+
    '<h1>'+t('hero.l1')+'<br><span class="cy">'+t('hero.l2')+'</span></h1>'+
    '<p class="sub">'+t('hero.sub')+'</p>'+
    '<div class="cta-row"><a class="btn btn-primary" href="#features">'+t('hero.explore')+'</a>'+
    '<a class="btn btn-ghost" href="#/demo">'+t('hero.launch')+'</a></div>'+
    '<div class="meta"><span class="badge badge-demo"><span class="dot"></span>'+t('hero.badgeDemo')+'</span>'+
    '<span class="badge">'+t('hero.badgePersonal')+'</span>'+
    '<span class="badge">'+t('hero.badgeSoon')+'</span></div>'+
  '</div>'+
  '<div class="console hud-corner"><div class="cbar"><i></i><i></i><i></i><span class="t">'+t('console.title')+'</span></div>'+
  '<div class="cbody"><div class="statusline"><span class="pulse"></span><span id="heroStatus">'+t('console.msg0')+'</span><span class="sp"></span><span id="heroLvl">LV 4</span></div>'+
  '<div class="lvlbar"><i id="heroBar" style="width:40%"></i></div>'+
  '<div class="scanwrap"><div class="grid"></div><div class="beam"></div>'+
    '<div class="zone" style="left:12%;top:18%">'+zoneName('torso')+' · '+expName('Filtered')+'</div>'+
    '<div class="zone" style="left:58%;top:55%">'+zoneName('l_hand')+' · '+expName('Monitored')+'</div></div>'+
  '<div class="kv"><span class="k">'+t('console.kLevel')+'</span><span class="v">'+t('console.vLevel')+'</span></div>'+
  '<div class="kv"><span class="k">'+t('console.kFx')+'</span><span class="v">1 / 3</span></div>'+
  '<div class="kv"><span class="k">'+t('console.kCompliance')+'</span><span class="v"><span class="ok">92 / 100</span></span></div>'+
  '<div class="kv"><span class="k">'+t('console.kMode')+'</span><span class="v warn">'+t('console.vMode')+'</span></div>'+
  '</div></div></header>'+

  '<section class="msection" id="features"><div class="kick">'+t('caps.kick')+'</div><h2>'+t('caps.title')+'</h2>'+
  '<p class="lede">'+t('caps.lede')+'</p>'+
  '<div class="cards">'+
    '<div class="card"><div class="ic">01</div><h3>'+t('caps.c1t')+'</h3><p>'+t('caps.c1d')+'</p></div>'+
    '<div class="card"><div class="ic">02</div><h3>'+t('caps.c2t')+'</h3><p>'+t('caps.c2d')+'</p></div>'+
    '<div class="card"><div class="ic">03</div><h3>'+t('caps.c3t')+'</h3><p>'+t('caps.c3d')+'</p></div>'+
    '<div class="card"><div class="ic">04</div><h3>'+t('caps.c4t')+'</h3><p>'+t('caps.c4d')+'</p></div>'+
  '</div></section>'+

  '<section class="msection" id="technology"><div class="kick">'+t('how.kick')+'</div><h2>'+t('how.title')+'</h2>'+
  '<p class="lede">'+t('how.lede')+'</p>'+
  '<div class="flow">'+
    '<div class="fstep"><div class="n">01</div><h4>'+t('how.s1t')+'</h4><p>'+t('how.s1d')+'</p></div><div class="farrow">→</div>'+
    '<div class="fstep"><div class="n">02</div><h4>'+t('how.s2t')+'</h4><p>'+t('how.s2d')+'</p></div><div class="farrow">→</div>'+
    '<div class="fstep"><div class="n">03</div><h4>'+t('how.s3t')+'</h4><p>'+t('how.s3d')+'</p></div><div class="farrow">→</div>'+
    '<div class="fstep"><div class="n">04</div><h4>'+t('how.s4t')+'</h4><p>'+t('how.s4d')+'</p></div><div class="farrow">→</div>'+
    '<div class="fstep"><div class="n">05</div><h4>'+t('how.s5t')+'</h4><p>'+t('how.s5d')+'</p></div>'+
  '</div></section>'+

  '<section class="msection" id="architecture"><div class="kick">'+t('arch.kick')+'</div><h2>'+t('arch.title')+'</h2>'+
  '<p class="lede">'+t('arch.lede')+'</p>'+
  '<div class="cards">'+
    '<div class="card"><div class="ic">UI</div><h3>'+t('arch.c1t')+'</h3><p>'+t('arch.c1d')+'</p></div>'+
    '<div class="card"><div class="ic">PL</div><h3>'+t('arch.c2t')+'</h3><p>'+t('arch.c2d')+' <span class="muted">'+t('arch.c2note')+'</span></p></div>'+
    '<div class="card"><div class="ic">FX</div><h3>'+t('arch.c3t')+'</h3><p>'+t('arch.c3d')+'</p></div>'+
    '<div class="card"><div class="ic">DT</div><h3>'+t('arch.c4t')+'</h3><p>'+t('arch.c4d')+'</p></div>'+
  '</div></section>'+

  '<section class="msection"><div class="kick">'+t('sc.kick')+'</div><h2>'+t('sc.title')+'</h2>'+
  '<p class="lede">'+t('sc.lede')+'</p>'+
  '<div class="showcase"><div class="preview-box hud-corner"><canvas id="miniSrc" width="480" height="300" class="hidden"></canvas>'+
  '<canvas id="miniDst" width="480" height="300"></canvas>'+
  '<div class="ctl-row"><div class="seg" id="miniSeg">'+
  '<button data-fx="Pixelate" class="on">'+fxName('Pixelate')+'</button><button data-fx="Blur">'+fxName('Blur')+'</button><button data-fx="Solid Cover">'+fxName('Solid Cover')+'</button></div>'+
  '<div class="field" style="margin:0"><div class="row"><input type="range" id="miniRange" min="2" max="40" value="14" aria-label="'+esc(t('demo.intensity'))+'"><output id="miniOut">14</output></div></div>'+
  '</div></div>'+
  '<div><h3 style="margin-bottom:10px">'+t('sc.h3')+'</h3>'+
  '<p class="muted" style="margin-bottom:14px">'+t('sc.p')+'</p>'+
  '<a class="btn btn-primary btn-sm" href="#/app/effects">'+t('sc.openStudio')+'</a> '+
  '<a class="btn btn-ghost btn-sm" href="#/demo">'+t('sc.fullDemo')+'</a></div></div></section>'+

  '<section class="msection"><div class="kick">'+t('gp.kick')+'</div><h2>'+t('gp.title')+'</h2>'+
  '<p class="lede">'+t('gp.lede')+'</p>'+
  '<div class="cards">'+
  '<div class="card"><div class="ic">LV</div><h3>'+t('gp.c1t')+'</h3><p>'+t('gp.c1d')+'</p></div>'+
  '<div class="card"><div class="ic">CR</div><h3>'+t('gp.c2t')+'</h3><p>'+t('gp.c2d')+'</p></div>'+
  '<div class="card"><div class="ic">CT</div><h3>'+t('gp.c3t')+'</h3><p>'+t('gp.c3d')+'</p></div>'+
  '<div class="card"><div class="ic">AC</div><h3>'+t('gp.c4t')+'</h3><p>'+t('gp.c4d')+'</p></div>'+
  '</div></section>'+

  '<section class="msection" id="roadmap"><div class="kick">'+t('rm.kick')+'</div><h2>'+t('rm.title')+'</h2>'+
  '<p class="lede">'+t('rm.lede')+'</p>'+
  '<div class="rm-grid">'+
  '<div class="rm-col done"><h4>'+t('rm.done')+'</h4>'+
    '<div class="rm-item">'+t('rm.i1')+'<span class="tag">'+t('rm.tagDemo')+'</span></div>'+
    '<div class="rm-item">'+t('rm.i2')+'<span class="tag">'+t('rm.tagDemo')+'</span></div>'+
    '<div class="rm-item">'+t('rm.i3')+'<span class="tag">'+t('rm.tagDemo')+'</span></div></div>'+
  '<div class="rm-col prog"><h4>'+t('rm.prog')+'</h4>'+
    '<div class="rm-item">'+t('rm.i4')+'<span class="tag">'+t('rm.tagInteraction')+'</span></div>'+
    '<div class="rm-item">'+t('rm.i5')+'<span class="tag">'+t('rm.tagInteraction')+'</span></div>'+
    '<div class="rm-item">'+t('rm.i6')+'<span class="tag">'+t('rm.tagMock')+'</span></div></div>'+
  '<div class="rm-col plan"><h4>'+t('rm.plan')+'</h4>'+
    '<div class="rm-item">'+t('rm.i7')+'<span class="tag">'+t('rm.tagNotStarted')+'</span></div>'+
    '<div class="rm-item">'+t('rm.i8')+'<span class="tag">'+t('rm.tagNotStarted')+'</span></div>'+
    '<div class="rm-item">'+t('rm.i9')+'<span class="tag">'+t('rm.tagSoon')+'</span></div></div>'+
  '</div></section>'+

  '<section class="msection"><div class="kick">'+t('faq.kick')+'</div><h2>'+t('faq.title')+'</h2><div style="max-width:760px;margin-top:26px">'+
  '<details class="faq"><summary>'+t('faq.q1')+'</summary><div class="a">'+t('faq.a1')+'</div></details>'+
  '<details class="faq"><summary>'+t('faq.q2')+'</summary><div class="a">'+t('faq.a2')+'</div></details>'+
  '<details class="faq"><summary>'+t('faq.q3')+'</summary><div class="a">'+t('faq.a3')+'</div></details>'+
  '<details class="faq"><summary>'+t('faq.q4')+'</summary><div class="a">'+t('faq.a4')+'</div></details>'+
  '<details class="faq"><summary>'+t('faq.q5')+'</summary><div class="a">'+t('faq.a5')+'</div></details>'+
  '</div></section>'+marketingFoot();
  initMiniShowcase();
  initHeroConsole();
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
function initHeroConsole(){
  const st = $('#heroStatus'), bar = $('#heroBar'); if(!st) return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const msgs = [t('console.msg0'),t('console.msg1'),t('console.msg2'),t('console.msg3'),t('console.msg4')];
  let i = 0;
  if(heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(()=>{
    i = (i+1) % msgs.length;
    st.style.opacity = '0';
    setTimeout(()=>{ st.textContent = msgs[i]; st.style.opacity = '1'; }, 300);
    if(bar) bar.style.width = (36 + Math.round(Math.random()*10)) + '%';
  }, 2800);
}

/* ---------------- Marketing: Docs ---------------- */
function renderDocs(root){
  root.innerHTML = marketingNav() +
  '<section class="msection" style="padding-top:110px;max-width:900px"><div class="kick">'+t('docs.kick')+'</div>'+
  '<h2>'+t('nav.docs')+' <span class="badge badge-demo" style="vertical-align:middle">'+t('docs.early')+'</span></h2>'+
  '<p class="lede">'+t('docs.lede')+'</p>'+

  '<div class="panel"><h3>'+t('docs.s1t')+'</h3><p class="psub">'+t('docs.s1sub')+'</p>'+
  '<div class="flow">'+
  '<div class="fstep"><div class="n">A</div><h4>'+t('docs.f1t')+'</h4><p>'+t('docs.f1d')+'</p></div><div class="farrow">→</div>'+
  '<div class="fstep"><div class="n">B</div><h4>'+t('docs.f2t')+'</h4><p>'+t('docs.f2d')+'</p></div><div class="farrow">→</div>'+
  '<div class="fstep"><div class="n">C</div><h4>'+t('docs.f3t')+'</h4><p>'+t('docs.f3d')+'</p></div><div class="farrow">→</div>'+
  '<div class="fstep"><div class="n">D</div><h4>'+t('docs.f4t')+'</h4><p>'+t('docs.f4d')+'</p></div>'+
  '</div><p class="muted mt16" style="font-size:13px">'+t('docs.s1note')+'</p></div>'+

  '<div class="panel"><h3>'+t('docs.s2t')+'</h3><p class="psub">'+t('docs.s2sub')+'</p>'+
  '<table class="tbl"><tr><th>'+t('docs.thConcept')+'</th><th>'+t('docs.thValues')+'</th><th>'+t('docs.thNotes')+'</th></tr>'+
  '<tr><td class="mono">'+t('docs.r1c')+'</td><td>'+t('docs.r1v')+'</td><td>'+t('docs.r1n')+'</td></tr>'+
  '<tr><td class="mono">'+t('docs.r2c')+'</td><td>'+t('docs.r2v')+'</td><td>'+t('docs.r2n')+'</td></tr>'+
  '<tr><td class="mono">'+t('docs.r3c')+'</td><td class="mono">'+t('docs.r3v')+'</td><td>'+t('docs.r3n')+'</td></tr>'+
  '<tr><td class="mono">'+t('docs.r4c')+'</td><td class="mono">'+t('docs.r4v')+'</td><td>'+t('docs.r4n')+'</td></tr>'+
  '</table></div>'+

  '<div class="panel"><h3>'+t('docs.s3t')+'</h3><p class="psub">'+t('docs.s3sub')+'</p>'+
  '<table class="tbl"><tr><th>'+t('docs.thFilter')+'</th><th>'+t('docs.thParams')+'</th><th>'+t('docs.thStatus')+'</th></tr>'+
  [['Pixelate','size 2–40'],['Blur','radius 1–24'],['Solid Cover','opacity 10–100%'],['Scanlines','opacity 5–60%'],
   ['Glitch','intensity 0–100 · rgb 0–20px · 6 params'],['Cel Shader','classic / palette-regions · 2 modes'],['Cellular Noise','flat / fragments / overlay · 3 modes'],['Oil Painting','Kuwahara brush 1–8 · 8 params']].map(r=>
  '<tr><td>'+fxName(r[0])+'</td><td class="mono">'+r[1]+'</td><td><span class="badge badge-live">'+t('docs.working')+'</span></td></tr>').join('')+'</table></div>'+

  '<div class="panel"><h3>'+t('docs.s4t')+'</h3>'+
  [['docs.g1t','docs.g1d','badge-live','docs.guaranteed'],['docs.g2t','docs.g2d','badge-live','docs.guaranteed'],
   ['docs.g3t','docs.g3d','badge-live','docs.guaranteed'],['docs.g4t','docs.g4d','badge-demo','docs.honest']].map(g=>
  '<div class="trow"><div class="tl">'+t(g[0])+'<small>'+t(g[1])+'</small></div><span class="badge '+g[2]+'">'+t(g[3])+'</span></div>').join('')+'</div>'+

  '<div class="mt16"><a class="btn btn-ghost btn-sm" href="#/">'+t('nav.backSiteLong')+'</a></div></section>'+marketingFoot();
}

/* ---------------- Interactive Demo ---------------- */
const DemoState = { variant:0, fx:'Pixelate', param:14, level:4, compare:true };
/* demo: one main slider param per filter (other params use FX_LIB defaults) */
const DEMO_FX_ORDER = ['Pixelate','Blur','Solid Cover','Glitch','Cel Shader','Cellular Noise','Oil Painting'];
const DEMO_FX = {
  'Pixelate':      {key:'size',      min:2,  max:40,  def:14,  labelKey:'fx.pSize'},
  'Blur':          {key:'radius',    min:1,  max:24,  def:8,   labelKey:'fx.pRadius'},
  'Solid Cover':   {key:'opacity',   min:10, max:90,  def:40,  labelKey:'fx.pOpacity'},
  'Glitch':        {key:'intensity', min:0,  max:100, def:35,  labelKey:'fx.pIntensity'},
  'Cel Shader':    {key:'blend',     min:0,  max:100, def:100, labelKey:'fx.pBlend'},
  'Cellular Noise':{key:'opacity',   min:0,  max:100, def:75,  labelKey:'fx.pOpacity'},
  'Oil Painting':  {key:'blend',     min:0,  max:100, def:100, labelKey:'fx.pBlend'},
};
function renderDemo(root){
  root.innerHTML = marketingNav() +
  '<div class="demo-head"><span class="badge badge-demo"><span class="dot"></span>'+t('demo.badge')+'</span>'+
  '<h1 style="margin:16px 0 10px">'+t('demo.title')+'</h1>'+
  '<p class="muted">'+t('demo.lede')+'</p></div>'+
  '<div class="demo-grid"><div class="preview-box hud-corner">'+
    '<div class="compare"><figure><canvas id="dSrc" width="420" height="300"></canvas><figcaption>'+t('demo.source')+'</figcaption></figure>'+
    '<figure><canvas id="dDst" width="420" height="300"></canvas><figcaption id="dCap">'+t('demo.filtered',{fx:fxName(DemoState.fx)})+'</figcaption></figure></div>'+
    '<div class="panel mt16" style="margin-bottom:0"><h3>'+t('demo.feedback')+' <span class="badge badge-demo" style="margin-left:8px">'+t('demo.simulated')+'</span></h3>'+
    '<p class="psub">'+t('demo.feedSub')+'</p><div id="dFeed" class="log" style="max-height:180px"></div></div>'+
  '</div>'+
  '<div><div class="panel"><h3>'+t('demo.pattern')+'</h3><p class="psub">'+t('demo.patternSub')+'</p>'+
    '<div class="seg" id="dVar"><button data-v="0" class="on">'+t('demo.orbs')+'</button><button data-v="1">'+t('demo.bars')+'</button><button data-v="2">'+t('demo.wave')+'</button></div></div>'+
  '<div class="panel"><h3>'+t('demo.filter')+'</h3><p class="psub">'+t('demo.filterSub')+'</p>'+
    '<div class="field"><select class="sel" id="dFxSel" aria-label="'+esc(t('demo.filter'))+'">'+
    DEMO_FX_ORDER.map(n=>'<option value="'+n+'"'+(n===DemoState.fx?' selected':'')+'>'+fxName(n)+'</option>').join('')+'</select></div>'+
    '<div class="field"><label id="dParamLabel">'+t(DEMO_FX[DemoState.fx].labelKey)+'</label><div class="row"><input type="range" id="dParam" min="'+DEMO_FX[DemoState.fx].min+'" max="'+DEMO_FX[DemoState.fx].max+'" value="'+DEMO_FX[DemoState.fx].def+'" aria-label="'+esc(t(DEMO_FX[DemoState.fx].labelKey))+'"><output id="dParamOut">'+DEMO_FX[DemoState.fx].def+'</output></div></div></div>'+
  '<div class="panel"><h3>'+t('demo.globalLevel')+' <span class="mono" id="dLvlOut" style="color:var(--cyan)">4</span></h3>'+
    '<p class="psub">'+t('demo.levelSub')+'</p>'+
    '<div class="levels" id="dLevels">'+Array.from({length:N_LEVELS},(_,i)=>'<div class="lvl'+(i===4?' cur':'')+'" data-l="'+i+'"><b>'+i+'</b><small>'+esc(lvlName(i))+'</small></div>').join('')+'</div>'+
    '<div class="progress"><i id="dProg" style="width:40%"></i></div></div>'+
  '<div class="flex gap8 wrap"><a class="btn btn-ghost btn-sm" href="#/">'+t('nav.backSite')+'</a>'+
  '<a class="btn btn-primary btn-sm" href="#/app/dashboard">'+t('nav.controlCenter')+'</a></div>'+
  '</div></div>'+marketingFoot();
  const src=$('#dSrc'), dst=$('#dDst');
  const paint=()=>paintPattern(src.getContext('2d'), src.width, src.height, DemoState.variant);
  const draw=()=>{
    const cfg=DEMO_FX[DemoState.fx], lib=FX_LIB.find(l=>l.name===DemoState.fx);
    const params={};
    Object.keys(lib.params).forEach(k=>{ const pd=lib.params[k];
      params[k]=(pd.def!=null?pd.def:Math.round((pd.min+pd.max)/2)); });
    const v=+$('#dParam').value; $('#dParamOut').textContent=v;
    params[cfg.key]=v;
    renderStack(src, dst, [{name:DemoState.fx,on:true,params:params}]);
    $('#dCap').textContent = t('demo.filtered',{fx:fxName(DemoState.fx)});
    const feed=$('#dFeed');
    feed.innerHTML = '<div class="ln"><span class="ts">now</span><span class="inf">'+esc(t('demo.lvl'+DemoState.level))+'</span></div>'+
      '<div class="ln"><span class="ts">now</span>'+esc(t('demo.feedApplied',{fx:fxName(DemoState.fx), v:v}))+' <span class="ok">✓</span></div>'+
      '<div class="ln"><span class="ts">now</span><span class="warn">'+esc(t('demo.feedDemo'))+'</span></div>';
  };
  $$('#dVar button').forEach(b=>b.onclick=()=>{ $$('#dVar button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on'); DemoState.variant=+b.dataset.v; paint(); draw(); });
  $('#dFxSel').onchange=e=>{
    DemoState.fx=e.target.value;
    const cfg=DEMO_FX[DemoState.fx], r=$('#dParam');
    r.min=cfg.min; r.max=cfg.max; r.value=cfg.def;
    $('#dParamLabel').textContent=t(cfg.labelKey);
    r.setAttribute('aria-label', t(cfg.labelKey));
    draw(); };
  $('#dParam').oninput = draw;
  $$('#dLevels .lvl').forEach(el=>el.onclick=()=>{ $$('#dLevels .lvl').forEach(x=>x.classList.remove('cur'));
    el.classList.add('cur'); DemoState.level=+el.dataset.l;
    $('#dLvlOut').textContent=DemoState.level; $('#dProg').style.width=(DemoState.level*10)+'%'; draw();
    toast(t('demo.levelSet',{n:DemoState.level})); });
  paint(); draw();
}

/* ---------------- App shell ---------------- */
function renderAppShell(root, page){
  const icons = { dashboard:'◧','body-parts':'◈','effects':'▦','progression':'▲','economy':'◉','contracts':'✎','access':'⌘','profiles':'⚙','diagnostics':'≋' };
  const groups = [[t('app.groupOperate'),['dashboard','body-parts','effects']],[t('app.groupAdvance'),['progression','economy','contracts']],[t('app.groupSystem'),['access','profiles','diagnostics']]];
  let nav = '';
  groups.forEach(([g, ids])=>{
    nav += '<div class="grp">'+g+'</div>';
    ids.forEach(id=>{
      nav += '<a href="#/app/'+id+'" class="'+(page===id?'on':'')+'"><span class="di">'+icons[id]+'</span>'+t('app.page.'+id)+'</a>';
    });
  });
  const pg = APP_PAGES.find(p=>p[0]===page);
  root.innerHTML =
  '<div class="app"><aside class="sidebar"><div class="slogo">'+brandLogo()+'</div>'+
  '<nav class="snav">'+nav+'</nav>'+
  '<div class="sfoot">'+t('app.sfoot')+'</div></aside>'+
  '<div class="main"><div class="topbar">'+
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span>'+
    '<span class="ttl">'+t(pg[2])+'</span><span class="sp"></span>'+
    '<span class="tstat">'+t('app.level')+' <b>'+DB.level+'</b></span>'+
    '<span class="tstat">◉ <b>'+fmtNum(DB.credits)+'</b></span>'+
    langSwitcher()+
    '<select class="sel pagenav" id="pageNav" aria-label="'+esc(t(pg[2]))+'">'+
      APP_PAGES.map(p=>'<option value="'+p[0]+'"'+(p[0]===page?' selected':'')+'>'+t(p[2])+'</option>').join('')+'</select>'+
    '<button class="iconbtn" id="themeBtn" title="'+esc(t('a11y.theme'))+'" aria-label="'+esc(t('a11y.theme'))+'">◐</button>'+
    '<button class="iconbtn" id="bellBtn" title="'+esc(t('a11y.bell'))+'" aria-label="'+esc(t('a11y.bell'))+'">♪</button>'+
    '<a class="btn btn-ghost btn-sm" href="#/">'+t('nav.backSite')+'</a>'+
  '</div><div class="workspace" id="ws"></div></div></div>';
  applyTheme();
  $('#themeBtn').onclick = toggleTheme;
  $('#bellBtn').onclick = ()=>toast(t('app.bell'), 'warn');
  const pn = $('#pageNav'); if(pn) pn.onchange = e=>{ location.hash = '#/app/'+e.target.value; };
  APP_RENDER[page]($('#ws'));
}
function pageHead(title, sub, extra){
  return '<div class="pagehead"><div><h2>'+title+'</h2><p>'+sub+'</p></div><div>'+(extra||'')+'</div></div>';
}
function evText(e){
  const p = Object.assign({}, e.p);
  if(p.zone) p.zone = zoneName(p.zone);
  if(p.fx) p.fx = fxName(p.fx);
  if(p.name && typeof p.name==='string' && p.name.indexOf('.')>0) p.name = t(p.name);
  return t(e.key, p);
}

/* ---------------- App: Dashboard ---------------- */
APP_RENDER.dashboard = function(ws){
  ws.innerHTML = pageHead(t('dash.title'), t('dash.sub'),
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span>')+
  '<div class="grid4 mb16">'+
    '<div class="stat"><div class="k">'+t('dash.level')+'</div><div class="v cy">'+DB.level+' <small>/ 10</small></div><div class="d">'+t('dash.levelTier')+'</div></div>'+
    '<div class="stat"><div class="k">'+t('dash.xp')+'</div><div class="v">'+fmtNum(DB.xp)+' <small>/ '+fmtNum(DB.xpNext)+'</small></div><div class="progress mt8"><i style="width:'+(DB.xp/DB.xpNext*100)+'%"></i></div></div>'+
    '<div class="stat"><div class="k">'+t('dash.compliance')+'</div><div class="v gr">'+DB.compliance+'<small> / 100</small></div><div class="d">'+t('dash.complianceSub')+'</div></div>'+
    '<div class="stat"><div class="k">'+t('dash.credits')+'</div><div class="v am">◉ '+fmtNum(DB.credits)+'</div><div class="d">'+t('dash.debt')+': ◉ '+fmtNum(DB.debt)+' · '+t('dash.debtClear')+'</div></div>'+
  '</div><div class="grid2">'+
  '<div class="panel"><h3>'+t('dash.contract')+'</h3><p class="psub">'+t('dash.contractSub')+'</p>'+
    '<div class="flex gap12 wrap" style="align-items:center;justify-content:space-between">'+
    '<div><div style="font-weight:700">'+DB.contract.id+' · '+t(DB.contract.nameKey)+'</div>'+
    '<div class="muted mono" style="font-size:12px">'+t('dash.ends')+' '+DB.contract.ends+' · <span style="color:var(--green)">'+t(DB.contract.stKey)+'</span></div></div>'+
    '<a class="btn btn-ghost btn-sm" href="#/app/contracts">'+t('app.manage')+'</a></div></div>'+
  '<div class="panel"><h3>'+t('dash.lease')+'</h3><p class="psub">'+t('dash.leaseSub')+'</p>'+
    '<div class="flex gap12 wrap" style="align-items:center;justify-content:space-between">'+
    '<div><div style="font-weight:700">'+DB.lease.id+' · '+t(DB.lease.scopeKey)+'</div>'+
    '<div class="muted mono" style="font-size:12px">'+t('dash.expires')+' '+DB.lease.expires+'</div></div>'+
    '<a class="btn btn-ghost btn-sm" href="#/app/access">'+t('app.manage')+'</a></div></div>'+
  '</div>'+
  '<div class="panel"><h3>'+t('dash.monitor')+'</h3><p class="psub">'+t('dash.monitorSub')+'</p>'+
    '<div class="grid4">'+DB.zones.slice(0,4).map(z=>
    '<div class="stat"><div class="k">'+zoneName(z.id)+'</div><div class="v" style="font-size:18px">'+(z.vis?'<span style="color:var(--green)">●</span>':'<span style="color:var(--muted)">○</span>')+' <small>'+expName(z.exposure)+'</small></div><div class="d">'+t('dash.stage')+' '+z.stage+' · '+fxName(z.effect)+'</div></div>').join('')+'</div>'+
    '<div class="mt16"><a class="btn btn-ghost btn-sm" href="#/app/body-parts">'+t('dash.openEditor')+'</a></div></div>'+
  '<div class="panel"><h3>'+t('dash.events')+'</h3><p class="psub">'+t('dash.eventsSub')+'</p>'+
    DB.events.map(e=>'<div class="event '+e.cls+'"><span class="ets mono">'+e.t+'</span><span>'+esc(evText(e))+'</span></div>').join('')+'</div>';
};

/* ---------------- App: Body Parts ---------------- */
let selZone = 'torso';
APP_RENDER['body-parts'] = function(ws){
  const EXPCLS = { Clear:'z-clear', Monitored:'z-monitored', Filtered:'z-filtered' };
  const Z = {
    head:  {x:'circle', cx:110, cy:30, r:18, lx:110, ly:10,  anchor:'middle'},
    torso: {x:'rect', x0:84, y0:56, w:52, h:92, rx:15, lx:110, ly:106, anchor:'middle'},
    l_arm: {x:'rect', x0:52, y0:62, w:20, h:84, rx:10, lx:48, ly:108, anchor:'end'},
    r_arm: {x:'rect', x0:148, y0:62, w:20, h:84, rx:10, lx:172, ly:108, anchor:'start'},
    l_hand:{x:'circle', cx:62, cy:168, r:10, lx:62, ly:190, anchor:'middle'},
    r_hand:{x:'circle', cx:158, cy:168, r:10, lx:158, ly:190, anchor:'middle'},
    l_leg: {x:'rect', x0:78, y0:196, w:22, h:104, rx:10, lx:74, ly:252, anchor:'end'},
    r_leg: {x:'rect', x0:120, y0:196, w:22, h:104, rx:10, lx:146, ly:252, anchor:'start'},
  };
  const selectZone = id => {
    selZone = id;
    $$('.zone', ws).forEach(x=>x.classList.toggle('sel', x.dataset.z===id));
    $('#zPanel').innerHTML = zonePanel(DB.zones.find(q=>q.id===id));
    bindZonePanel();
  };
  let shapes = '';
  Object.keys(Z).forEach(id=>{
    const z = DB.zones.find(q=>q.id===id), s = Z[id];
    const cls = 'zone '+EXPCLS[z.exposure]+(id===selZone?' sel':'');
    const attrs = 'data-z="'+id+'" tabindex="0" role="button" aria-label="'+esc(t('bp.zoneAria',{name:zoneName(id), exposure:expName(z.exposure)}))+'"';
    const el = s.x==='circle'
      ? '<circle class="'+cls+'" '+attrs+' cx="'+s.cx+'" cy="'+s.cy+'" r="'+s.r+'"/>'
      : '<rect class="'+cls+'" '+attrs+' x="'+s.x0+'" y="'+s.y0+'" width="'+s.w+'" height="'+s.h+'" rx="'+s.rx+'"/>';
    shapes += el + '<text class="zlabel" x="'+s.lx+'" y="'+s.ly+'" text-anchor="'+s.anchor+'">'+zoneName(id)+'</text>';
  });
  const z = DB.zones.find(q=>q.id===selZone);
  ws.innerHTML = pageHead(t('bp.title'), t('bp.sub'),
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span>')+
  '<div class="bodywrap"><div class="bodysvg"><svg viewBox="0 0 224 330" role="group" aria-label="'+esc(t('bp.title'))+'">'+shapes+'</svg>'+
  '<p class="muted mono center" style="font-size:11px;margin-top:10px">'+t('bp.hint')+'</p>'+
  '<div class="flex gap8 wrap mt16" style="justify-content:center">'+
  '<span class="badge badge-live">'+t('exp.clear')+'</span><span class="badge badge-demo">'+t('exp.monitored')+'</span><span class="badge badge-cyan">'+t('exp.filtered')+'</span></div></div>'+
  '<div class="panel" id="zPanel" style="margin-bottom:0">'+zonePanel(z)+'</div></div>';
  $$('.zone', ws).forEach(el=>{
    el.addEventListener('click', ()=>selectZone(el.dataset.z));
    el.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); selectZone(el.dataset.z); } });
  });
  bindZonePanel();
  function bindZonePanel(){
    const zz = DB.zones.find(q=>q.id===selZone);
    const vis = $('#zVis'); if(vis) vis.onclick = ()=>{ zz.vis=!zz.vis; vis.classList.toggle('on',zz.vis);
      toast(t('bp.visToast',{name:zoneName(zz.id), state:t(zz.vis?'bp.stateOn':'bp.stateOff')})); };
    const st = $('#zStage'); if(st) st.oninput = ()=>{ zz.stage=+st.value; $('#zStageOut').textContent=zz.stage; };
    const ex = $('#zExp'); if(ex) ex.onchange = ()=>{ zz.exposure=ex.value;
      const shape = $('.zone[data-z="'+zz.id+'"]', ws);
      if(shape){ shape.classList.remove('z-clear','z-monitored','z-filtered'); shape.classList.add(EXPCLS[zz.exposure]);
        shape.setAttribute('aria-label', t('bp.zoneAria',{name:zoneName(zz.id), exposure:expName(zz.exposure)})); }
      const badge = $('#zExpBadge'); if(badge){ badge.textContent = expName(zz.exposure); }
      toast(t('bp.expToast',{name:zoneName(zz.id), v:expName(zz.exposure)})); };
    const ef = $('#zFx'); if(ef) ef.onchange = ()=>{ zz.effect=ef.value;
      toast(t('bp.fxToast',{name:zoneName(zz.id), v:fxName(zz.effect)})); };
  }
};
function zonePanel(z){
  const expBadge = z.exposure==='Clear'?'badge-live':z.exposure==='Monitored'?'badge-demo':'badge-cyan';
  return '<h3>'+zoneName(z.id)+' <span class="badge '+(z.vis?'badge-live':'')+'" style="margin-left:8px">'+t(z.vis?'bp.visible':'bp.hidden')+'</span>'+
  ' <span class="badge '+expBadge+'" id="zExpBadge">'+expName(z.exposure)+'</span></h3>'+
  '<p class="psub">'+t('bp.policyNote')+'</p>'+
  '<div class="trow"><div class="tl">'+t('bp.visibility')+'<small>'+t('bp.visibilitySub')+'</small></div><div class="toggle'+(z.vis?' on':'')+'" id="zVis" role="switch" aria-checked="'+z.vis+'" aria-label="'+esc(t('bp.visibility'))+'"></div></div>'+
  '<div class="trow"><div class="tl">'+t('bp.exposure')+'</div>'+
  '<select class="sel" id="zExp" aria-label="'+esc(t('bp.exposure'))+'">'+['Clear','Monitored','Filtered'].map(e=>'<option value="'+e+'"'+(e===z.exposure?' selected':'')+'>'+expName(e)+'</option>').join('')+'</select></div>'+
  '<div class="field"><label>'+t('bp.stage')+' · <output id="zStageOut" style="color:var(--cyan)">'+z.stage+'</output> / 6</label>'+
  '<div class="row"><input type="range" id="zStage" min="0" max="6" value="'+z.stage+'" style="flex:1" aria-label="'+esc(t('bp.stage'))+'"></div></div>'+
  '<div class="trow"><div class="tl">'+t('bp.effect')+'</div>'+
  '<select class="sel" id="zFx" aria-label="'+esc(t('bp.effect'))+'">'+['None','Pixelate','Blur','Solid Cover','Glitch','Cel Shader','Cellular Noise','Oil Painting'].map(e=>'<option value="'+e+'"'+(e===z.effect?' selected':'')+'>'+fxName(e)+'</option>').join('')+'</select></div>'+
  '<hr class="hr"><div class="grid2">'+
  '<div class="stat"><div class="k">'+t('bp.xp')+'</div><div class="v" style="font-size:20px">'+fmtNum(z.xp)+'</div></div>'+
  '<div class="stat"><div class="k">'+t('bp.credits')+'</div><div class="v am" style="font-size:20px">◉ '+fmtNum(z.credits)+'</div></div></div>'+
  '<div class="trow mt16"><div class="tl">'+t('bp.access')+'</div><span class="badge '+(z.access==='Granted'?'badge-live':'badge-cyan')+'">'+accName(z.access)+'</span></div>';
}

/* ---------------- App: Effects Studio ---------------- */
const FX_LIB = [
  { name:'Pixelate',    descKey:'fx.dPixelate',    params:{ size:{labelKey:'fx.pSize', min:2, max:40} } },
  { name:'Blur',        descKey:'fx.dBlur',        params:{ radius:{labelKey:'fx.pRadius', min:1, max:24} } },
  { name:'Solid Cover', descKey:'fx.dSolid',       params:{ opacity:{labelKey:'fx.pOpacity', min:10, max:100} } },
  { name:'Scanlines',   descKey:'fx.dScanlines',   params:{ opacity:{labelKey:'fx.pOpacity', min:5, max:60} } },
  { name:'Glitch', descKey:'fx.dGlitch', params:{
    intensity:{labelKey:'fx.pIntensity', min:0, max:100, def:35},
    rgbSplit:{labelKey:'fx.pRgbSplit', min:0, max:20, def:5},
    displacement:{labelKey:'fx.pDisplacement', min:0, max:40, def:12},
    blockSize:{labelKey:'fx.pBlockSize', min:4, max:64, def:16},
    seed:{labelKey:'fx.pSeed', min:0, max:999, def:42},
    animSpeed:{labelKey:'fx.pAnimSpeed', min:0, max:5, def:0} } },
  { name:'Cel Shader', descKey:'fx.dCel', legacyMode:'classic', params:{
    mode:{type:'select', labelKey:'fx.pMode', options:['classic','regions'],
      labels:{classic:'fx.mClassic',regions:'fx.mRegions'}, def:'regions'},
    levels:{labelKey:'fx.pLevels', min:2, max:12, def:5, modes:['classic']},
    edgeThreshold:{labelKey:'fx.pEdgeThreshold', min:0, max:100, def:35, modes:['classic']},
    outline:{labelKey:'fx.pOutline', min:0, max:100, def:60, modes:['classic']},
    saturation:{labelKey:'fx.pSaturation', min:0, max:200, def:110, modes:['classic']},
    regionSize:{labelKey:'fx.pRegionSize', min:8, max:64, def:18, modes:['regions']},
    colorCount:{labelKey:'fx.pColorCount', min:2, max:8, def:4, modes:['regions']},
    palette:{type:'select', labelKey:'fx.pPalette', options:['reference','original'],
      labels:{reference:'fx.pRefPalette',original:'fx.pOrigPalette'}, def:'reference', modes:['regions']},
    colorVariation:{labelKey:'fx.pColorVariation', min:0, max:100, def:25, modes:['regions']},
    edgeIrregularity:{labelKey:'fx.pEdgeIrregularity', min:0, max:100, def:55, modes:['regions']},
    edgeSmoothness:{labelKey:'fx.pEdgeSmoothness', min:0, max:100, def:60, modes:['regions']},
    seed:{labelKey:'fx.pSeed', min:0, max:999, def:42, modes:['regions']},
    blend:{labelKey:'fx.pBlend', min:0, max:100, def:100, modes:['classic','regions']} } },
  { name:'Cellular Noise', descKey:'fx.dCellular', legacyMode:'overlay', params:{
    mode:{type:'select', labelKey:'fx.pMode', options:['flat','fragments','overlay'],
      labels:{flat:'fx.mFlat',fragments:'fx.mFragments',overlay:'fx.mOverlay'}, def:'flat'},
    cellScale:{labelKey:'fx.pCellScale', min:4, max:64, def:28, modes:['flat','fragments','overlay']},
    density:{labelKey:'fx.pDensity', min:10, max:100, def:100, modes:['flat','fragments']},
    jitter:{labelKey:'fx.pJitter', min:0, max:100, def:60, modes:['flat','fragments','overlay']},
    displacement:{labelKey:'fx.pDisplacement', min:0, max:30, def:6, modes:['fragments']},
    borderWidth:{labelKey:'fx.pBorderWidth', min:0, max:8, def:2, modes:['flat','fragments']},
    borderDark:{labelKey:'fx.pBorderDark', min:0, max:100, def:50, modes:['flat','fragments']},
    colorMode:{type:'select', labelKey:'fx.pColorMode', options:['average','center'],
      labels:{average:'fx.pAvgColor',center:'fx.pCenterColor'}, def:'average', modes:['flat']},
    contrast:{labelKey:'fx.pContrast', min:0, max:200, def:120, modes:['overlay']},
    edge:{labelKey:'fx.pEdge', min:0, max:100, def:55, modes:['overlay']},
    opacity:{labelKey:'fx.pOpacity', min:0, max:100, def:85, modes:['flat','fragments','overlay']},
    seed:{labelKey:'fx.pSeed', min:0, max:999, def:42, modes:['flat','fragments','overlay']} } },
  { name:'Oil Painting', descKey:'fx.dOil', params:{
    brushSize:{labelKey:'fx.pBrushSize', min:1, max:8, def:5},
    strokeStrength:{labelKey:'fx.pStrokeStrength', min:0, max:100, def:75},
    detail:{labelKey:'fx.pDetail', min:0, max:100, def:50},
    smoothness:{labelKey:'fx.pSmoothness', min:0, max:100, def:60},
    edgePreserve:{labelKey:'fx.pEdgePreserve', min:0, max:100, def:80},
    saturation:{labelKey:'fx.pSaturation', min:0, max:200, def:105},
    texture:{labelKey:'fx.pCanvasTex', min:0, max:100, def:0},
    blend:{labelKey:'fx.pBlend', min:0, max:100, def:100} } },
];
/* glitch animation timer (effects page only; cleared on route change) */
let fxAnimTimer = null;
function stopFxAnim(){ if(fxAnimTimer){ clearInterval(fxAnimTimer); fxAnimTimer = null; } FX_ANIM.frame = 0; }
/* pending coalesced preview render (Effects Studio drawSoon) */
let fxDrawRaf = 0;
function cancelFxDraw(){ if(fxDrawRaf){ cancelAnimationFrame(fxDrawRaf); fxDrawRaf = 0; } }
/* named presets (internal filter names + full param sets stay English/stable) */
const FX_PRESETS = [
  { key:'fx.presetName', stack:[['Blur',{radius:10}],['Scanlines',{opacity:22}]] },
  { key:'fx.presetTear',  stack:[['Glitch',{intensity:55,rgbSplit:8,displacement:20,blockSize:16,seed:42,animSpeed:0}]] },
  { key:'fx.presetToon',  stack:[['Cel Shader',{mode:'classic',levels:4,edgeThreshold:30,outline:75,saturation:115,blend:100}]] },
  { key:'fx.presetField', stack:[['Cellular Noise',{cellScale:14,jitter:65,contrast:120,edge:55,opacity:75,seed:42}]] },
];
APP_RENDER.effects = function(ws){
  ws.innerHTML = pageHead(t('fx.title'), t('fx.sub'),
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span>')+
  '<div class="panel"><h3>'+t('fx.preview')+' <span class="badge badge-demo" style="margin-left:8px">'+t('demo.simulated')+'</span></h3>'+
  '<p class="psub">'+t('fx.previewSub')+'</p>'+
  '<div class="compare">'+
  '<figure><canvas id="eSrc" width="560" height="360" class="hidden"></canvas><canvas id="eBefore" width="560" height="360"></canvas><figcaption>'+t('fx.before')+'</figcaption></figure>'+
  '<figure><canvas id="eDst" width="560" height="360"></canvas><figcaption id="eAfterCap">'+t('fx.after',{names:t('fx.afterEmpty')})+'</figcaption></figure>'+
  '</div></div>'+
  '<div class="mrow" style="margin-top:14px;gap:14px;flex-wrap:wrap;align-items:flex-end">'+
  '<div class="field" style="margin:0"><label>'+t('fx.mask')+'</label>'+
  '<select class="sel" id="maskShape" aria-label="'+esc(t('fx.mask'))+'">'+
  '<option value="full">'+t('fx.mFull')+'</option><option value="rect">'+t('fx.mRect')+'</option>'+
  '<option value="ellipse">'+t('fx.mEllipse')+'</option></select></div>'+
  '<div class="field" style="margin:0"><label>'+t('fx.maskSize')+'</label>'+
  '<div class="row"><input type="range" id="maskSize" min="10" max="100" value="60" style="width:110px" aria-label="'+esc(t('fx.maskSize'))+'"><output id="maskSizeOut">60</output></div></div>'+
  '<div class="field" style="margin:0"><label>'+t('fx.maskFeather')+'</label>'+
  '<div class="row"><input type="range" id="maskFeather" min="0" max="60" value="18" style="width:110px" aria-label="'+esc(t('fx.maskFeather'))+'"><output id="maskFeatherOut">18</output></div></div></div>'+
  '<p class="psub" style="margin-top:8px">'+t('fx.maskSub')+'</p>'+
  '<div class="grid3">'+
  '<div class="panel"><h3>'+t('fx.stack')+'</h3><p class="psub">'+t('fx.stackSub')+'</p>'+
    '<div class="stack" id="fxStack"></div>'+
    '<div class="flex gap8 mt16 wrap"><button class="btn btn-ghost btn-sm" id="fxReset">'+t('fx.reset')+'</button>'+
    '<select class="sel" id="fxPresetSel" aria-label="'+esc(t('fx.presetPick'))+'" style="max-width:230px">'+
    '<option value="">'+t('fx.presetPick')+'</option>'+
    FX_PRESETS.map((pr,i)=>'<option value="'+i+'">'+t(pr.key)+'</option>').join('')+'</select></div></div>'+
  '<div class="panel"><h3>'+t('fx.lib')+'</h3><p class="psub">'+t('fx.libSub')+'</p><div id="fxLib"></div></div>'+
  '<div class="panel"><h3>'+t('fx.params')+'</h3><p class="psub">'+t('fx.paramsSub')+'</p><div id="fxParams"></div></div>'+
  '</div>';
  const src=$('#eSrc'); paintPattern(src.getContext('2d'), src.width, src.height, 0);
  /* Preview Mask (studio demo only): full stack renders inside, original stays outside */
  let maskShape='full', maskSize=60, maskFeather=18;
  const maskCache={key:'', data:null};
  const buildMask=(w,h)=>{
    const key=[maskShape,maskSize,maskFeather,w,h].join('|');
    if(maskCache.key===key && maskCache.data) return maskCache.data;
    const mc=mkCanvas(w,h), mx=mc.getContext('2d');
    mx.fillStyle='#000'; mx.fillRect(0,0,w,h);
    mx.fillStyle='#fff';
    const s=maskSize/100;
    if(maskShape==='rect'){
      const mw=w*0.8*s, mh=h*0.8*s;
      mx.fillRect((w-mw)/2,(h-mh)/2,mw,mh);
    }else if(maskShape==='ellipse'){
      mx.beginPath(); mx.ellipse(w/2,h/2,w*0.42*s,h*0.42*s,0,0,6.2832); mx.fill();
    }
    let md;
    if(maskFeather>0 && maskShape!=='full'){
      const bc=mkCanvas(w,h), bx=bc.getContext('2d');
      bx.filter='blur('+maskFeather+'px)'; bx.drawImage(mc,0,0); bx.filter='none';
      md=bx.getImageData(0,0,w,h).data;
    }else{ md=mx.getImageData(0,0,w,h).data; }
    const m=new Float32Array(w*h);
    for(let i=0;i<w*h;i++) m[i]=md[i*4]/255;
    maskCache.key=key; maskCache.data=m;
    return m;
  };
  const draw=()=>{
    cancelFxDraw(); /* an immediate draw supersedes any pending coalesced one */
    $('#eBefore').getContext('2d').drawImage(src,0,0);
    const dst=$('#eDst');
    renderStack(src, dst, DB.stack);
    if(maskShape!=='full'){
      const w=dst.width, h=dst.height, m=buildMask(w,h);
      const ctx=dst.getContext('2d');
      const img=ctx.getImageData(0,0,w,h), d=img.data;
      const sdata=src.getContext('2d').getImageData(0,0,w,h).data;
      for(let i=0;i<w*h;i++){
        const k=m[i]; if(k>=1) continue;
        const o=i*4;
        if(k<=0){ d[o]=sdata[o]; d[o+1]=sdata[o+1]; d[o+2]=sdata[o+2]; }
        else{ d[o]+= (sdata[o]-d[o])*(1-k); d[o+1]+=(sdata[o+1]-d[o+1])*(1-k); d[o+2]+=(sdata[o+2]-d[o+2])*(1-k); }
      }
      ctx.putImageData(img,0,0);
    }
    const names = DB.stack.filter(f=>f.on).map(f=>fxName(f.name)).join(' → ') || t('fx.afterEmpty');
    $('#eAfterCap').textContent = t('fx.after',{names:names});
    syncFxAnim();
  };
  /* coalesce rapid slider input into one render per animation frame.
     Final output is identical (latest param values); redundant renders dropped.
     The frame id is tracked so route/language changes can cancel it, and the
     callback verifies the page still exists before touching DOM or timers. */
  const drawSoon=()=>{
    if(fxDrawRaf) return;
    fxDrawRaf=requestAnimationFrame(()=>{
      fxDrawRaf=0;
      if(!document.getElementById('eDst')) return; /* page gone: no dead-DOM access, no timer restart */
      draw();
    });
  };
  /* Glitch animation: only while an enabled Glitch has animSpeed>0, frame-limited,
     honors reduced-motion, no stray rAF/interval after stop or route change. */
  function syncFxAnim(){
    let speed=0;
    DB.stack.forEach(f=>{ if(f.on && f.name==='Glitch') speed=Math.max(speed, f.params.animSpeed|0); });
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reduce && speed>0 && !fxAnimTimer){
      const iv = Math.max(120, 700-speed*110);
      fxAnimTimer = setInterval(()=>{ FX_ANIM.frame++; draw(); }, iv);
    }else if((reduce || speed<=0) && fxAnimTimer){
      stopFxAnim(); draw();
    }
  }
  const renderList=()=>{
    $('#fxStack').innerHTML = DB.stack.map((f,i)=>
      '<div class="fxitem" draggable="true" data-id="'+f.id+'"><span class="grip">⋮⋮</span>'+
      '<span class="ord">'+(i+1)+'</span><span class="nm">'+fxName(f.name)+'</span>'+
      '<div class="toggle'+(f.on?' on':'')+'" data-tg="'+f.id+'" role="switch" aria-checked="'+f.on+'" aria-label="'+esc(fxName(f.name))+'"></div>'+
      '<button class="iconbtn" data-rm="'+f.id+'" title="'+esc(t('fx.removed'))+'" aria-label="'+esc(fxName(f.name))+'" style="width:28px;height:28px">×</button></div>').join('')
      || '<p class="muted">'+t('fx.empty')+'</p>';
    $$('#fxStack .fxitem').forEach(el=>{
      el.addEventListener('dragstart',()=>{ el.classList.add('dragging'); });
      el.addEventListener('dragend',()=>{
        el.classList.remove('dragging');
        const ids=$$('#fxStack .fxitem').map(x=>x.dataset.id);
        DB.stack.sort((a,b)=>ids.indexOf(a.id)-ids.indexOf(b.id));
        renderList(); draw(); toast(t('fx.reordered'));
      });
      el.addEventListener('dragover',e=>{ e.preventDefault();
        const d=$('.fxitem.dragging'); if(!d||d===el) return;
        const r=el.getBoundingClientRect();
        const after=(e.clientY-r.top)>r.height/2;
        el.parentNode.insertBefore(d, after?el.nextSibling:el);
      });
    });
    $$('#fxStack [data-tg]').forEach(tg=>tg.onclick=e=>{ e.stopPropagation();
      const f=DB.stack.find(x=>x.id===tg.dataset.tg); f.on=!f.on;
      tg.classList.toggle('on',f.on); tg.setAttribute('aria-checked', f.on); draw(); });
    $$('#fxStack [data-rm]').forEach(b=>b.onclick=e=>{ e.stopPropagation();
      DB.stack=DB.stack.filter(x=>x.id!==b.dataset.rm); renderList(); renderParams(); draw();
      toast(t('fx.removed')); });
    draw();
  };
  const renderParams=()=>{
    $('#fxParams').innerHTML = DB.stack.map((f,i)=>{
      const lib=FX_LIB.find(l=>l.name===f.name); if(!lib) return '';
      const mode=fxEffMode(f);
      const fields = Object.keys(lib.params).filter(pk=>{
        const p=lib.params[pk]; return !p.modes || p.modes.indexOf(mode)>=0;
      }).map(pk=>{
        const p=lib.params[pk];
        const cur = pk==='mode' ? mode : ((f.params[pk]!==undefined && f.params[pk]!==null) ? f.params[pk] : p.def);
        const al = 'aria-label="'+esc(fxName(f.name)+' · '+t(p.labelKey))+'"';
        if(p.type==='select'){
          const opts=p.options.map(o=>'<option value="'+o+'"'+(o===cur?' selected':'')+'>'+t(p.labels[o])+'</option>').join('');
          return '<div class="field"><label>'+t(p.labelKey)+'</label>'+
          '<div class="row"><select class="sel" data-f="'+f.id+'" data-p="'+pk+'" data-t="select" style="flex:1" '+al+'>'+opts+'</select></div></div>';
        }
        return '<div class="field"><label>'+t(p.labelKey)+'</label>'+
        '<div class="row"><input type="range" min="'+p.min+'" max="'+p.max+'" value="'+cur+'" data-f="'+f.id+'" data-p="'+pk+'" style="flex:1" '+al+'">'+
        '<output>'+cur+'</output></div></div>';
      }).join('');
      return '<div class="pgroup"><div class="pgname">'+(i+1)+' · '+fxName(f.name).toUpperCase()+(f.on?'':' · '+t('fx.off'))+'</div>'+fields+'</div>';
    }).join('') || '<p class="muted">'+t('fx.noParams')+'</p>';
    $$('#fxParams input[type=range]').forEach(r=>r.oninput=()=>{
      const f=DB.stack.find(x=>x.id===r.dataset.f); f.params[r.dataset.p]=+r.value;
      r.nextElementSibling.textContent=r.value; drawSoon(); });
    $$('#fxParams select[data-t="select"]').forEach(s=>s.onchange=()=>{
      const f=DB.stack.find(x=>x.id===s.dataset.f); f.params[s.dataset.p]=s.value;
      renderParams(); draw(); });
  };
  $('#fxLib').innerHTML = FX_LIB.map(l=>
    '<div class="libitem"><div><div style="font-weight:600">'+fxName(l.name)+'</div>'+
    '<div class="muted" style="font-size:12.5px">'+t(l.descKey)+'</div></div>'+
    '<button class="btn btn-ghost btn-sm" data-add="'+l.name+'">'+t('fx.add')+'</button></div>').join('');
  $$('#fxLib [data-add]').forEach(b=>b.onclick=()=>{
    const lib=FX_LIB.find(l=>l.name===b.dataset.add);
    const params={}; Object.keys(lib.params).forEach(k=>{ const pd=lib.params[k];
      params[k] = (pd.def!=null ? pd.def : Math.round((pd.min+pd.max)/2)); });
    DB.stack.push({ id:'fx'+Date.now(), name:lib.name, on:true, params });
    renderList(); renderParams(); toast(t('fx.added',{name:fxName(lib.name)}),'ok'); });
  $('#fxReset').onclick=()=>confirmModal(t('fx.resetTitle'), t('fx.resetBody'), t('modal.reset'), ()=>{
    DB.stack=[{id:'fx1',name:'Pixelate',on:true,params:{size:14}},{id:'fx2',name:'Blur',on:false,params:{radius:8}},{id:'fx3',name:'Solid Cover',on:false,params:{opacity:85}}];
    renderList(); renderParams(); toast(t('fx.resetDone'),'ok'); });
  $('#fxPresetSel').onchange=e=>{
    const pr=FX_PRESETS[+e.target.value]; e.target.value=''; if(!pr) return;
    DB.stack=pr.stack.map((s,i)=>({id:'fx'+Date.now()+i, name:s[0], on:true, params:Object.assign({},s[1])}));
    renderList(); renderParams(); toast(t('fx.presetDone',{name:t(pr.key)}),'ok'); };
  $('#maskShape').onchange=e=>{ maskShape=e.target.value; draw(); };
  $('#maskSize').oninput=e=>{ maskSize=+e.target.value; $('#maskSizeOut').textContent=e.target.value; drawSoon(); };
  $('#maskFeather').oninput=e=>{ maskFeather=+e.target.value; $('#maskFeatherOut').textContent=e.target.value; drawSoon(); };
  renderList(); renderParams();
};

/* ---------------- App: Progression ---------------- */
APP_RENDER.progression = function(ws){
  ws.innerHTML = pageHead(t('prog.title'), t('prog.sub'),
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span>')+
  '<div class="panel"><h3>'+t('prog.cur')+'</h3><p class="psub">'+t('prog.roadmap')+'</p>'+
  '<div class="flex gap12" style="align-items:baseline"><span class="mono" style="font-size:44px;color:var(--cyan)">'+DB.level+'</span>'+
  '<span class="muted">'+lvlName(DB.level)+' · '+fmtNum(DB.xp)+' / '+fmtNum(DB.xpNext)+' XP</span></div>'+
  '<div class="progress mt8"><i style="width:'+(DB.xp/DB.xpNext*100)+'%"></i></div>'+
  '<div class="levels">'+Array.from({length:N_LEVELS},(_,i)=>'<div class="lvl'+(i===DB.level?' cur':i<DB.level?' done':'')+'"><b>'+i+'</b><small>'+esc(lvlName(i))+'</small></div>').join('')+'</div>'+
  '<p class="muted" style="font-size:12.5px">'+t('prog.click')+'</p></div>'+
  '<div class="panel"><h3>'+t('prog.zxp')+'</h3><p class="psub">'+t('prog.zxpSub')+'</p>'+
  '<table class="tbl"><tr><th>'+t('prog.thZone')+'</th><th>'+t('prog.thStage')+'</th><th>'+t('prog.thXp')+'</th><th>'+t('prog.thEffect')+'</th></tr>'+
  DB.zones.map(z=>'<tr><td>'+zoneName(z.id)+'</td><td class="mono">'+z.stage+' / 6</td><td class="mono">'+fmtNum(z.xp)+'</td><td>'+fxName(z.effect)+'</td></tr>').join('')+'</table></div>';
  $$('.lvl', ws).forEach(el=>el.onclick=()=>toast(t('prog.toast',{n:el.querySelector('b').textContent})));
};

/* ---------------- App: Economy ---------------- */
function txnText(x){
  const p = Object.assign({}, x.p);
  if(p.zone) p.zone = zoneName(p.zone);
  if(p.name && typeof p.name==='string' && p.name.indexOf('.')>0) p.name = t(p.name);
  return t(x.key, p);
}
APP_RENDER.economy = function(ws){
  ws.innerHTML = pageHead(t('econ.title'), t('econ.sub'),
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span>')+
  '<div class="grid4 mb16">'+
  '<div class="stat"><div class="k">'+t('econ.balance')+'</div><div class="v am">◉ '+fmtNum(DB.credits)+'</div></div>'+
  '<div class="stat"><div class="k">'+t('econ.debt')+'</div><div class="v">◉ '+fmtNum(DB.debt)+'</div><div class="d">'+t('econ.debtSub')+'</div></div>'+
  '<div class="stat"><div class="k">'+t('econ.earned')+'</div><div class="v gr">◉ 260</div><div class="d">'+t('econ.session')+'</div></div>'+
  '<div class="stat"><div class="k">'+t('econ.spent')+'</div><div class="v rd">◉ 270</div><div class="d">'+t('econ.session')+'</div></div></div>'+
  '<div class="panel"><h3>'+t('econ.ledger')+'</h3><p class="psub">'+t('econ.ledgerSub')+'</p>'+
  '<table class="tbl"><tr><th>'+t('econ.thId')+'</th><th>'+t('econ.thDesc')+'</th><th>'+t('econ.thAmt')+'</th><th>'+t('econ.thBal')+'</th></tr>'+
  DB.txns.map(x=>'<tr><td class="mono">'+x.id+'</td><td>'+esc(txnText(x))+'</td>'+
  '<td class="mono" style="color:'+(x.amt>0?'var(--green)':'var(--red)')+'">'+(x.amt>0?'+':'')+fmtNum(x.amt)+'</td><td class="mono">'+fmtNum(x.bal)+'</td></tr>').join('')+'</table></div>';
};

/* ---------------- App: Contracts ---------------- */
APP_RENDER.contracts = function(ws){
  ws.innerHTML = pageHead(t('ct.title'), t('ct.sub'),
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span><button class="btn btn-primary btn-sm" id="ctNew" style="margin-left:10px">'+t('ct.new')+'</button>')+
  '<div class="grid3" id="ctGrid"></div>';
  const draw=()=>{
    $('#ctGrid').innerHTML = DB.contracts.map((c,i)=>{
      const badge = c.stKey==='ct.stActive'?'badge-live':c.stKey==='ct.stSealed'?'badge-cyan':'';
      return '<div class="card"><div class="flex" style="justify-content:space-between;align-items:center;margin-bottom:10px">'+
      '<span class="mono" style="font-size:12px;color:var(--muted)">'+c.id+'</span>'+
      '<span class="badge '+badge+'">'+t(c.stKey)+'</span></div>'+
      '<h3>'+t(c.nameKey)+'</h3><div class="progress mt8"><i style="width:'+c.progress+'%"></i></div>'+
      '<div class="muted mono mt8" style="font-size:11.5px">'+c.progress+'% · '+t('ct.ends')+' '+c.ends+'</div>'+
      '<div class="flex gap8 mt16">'+(c.stKey==='ct.stDraft'
        ? '<button class="btn btn-primary btn-sm" data-sign="'+i+'">'+t('ct.sign')+'</button>'
        : '<button class="btn btn-ghost btn-sm" data-view="'+i+'">'+t('ct.details')+'</button>')+
      (c.stKey==='ct.stActive' ? '<button class="btn btn-danger btn-sm" data-brk="'+i+'">'+t('ct.break')+'</button>' : '')+'</div></div>';
    }).join('');
    $$('#ctGrid [data-sign]').forEach(b=>b.onclick=()=>{ const c=DB.contracts[+b.dataset.sign];
      c.stKey='ct.stActive'; c.progress=5; draw(); toast(t('ct.signed',{id:c.id}),'ok'); });
    $$('#ctGrid [data-view]').forEach(b=>b.onclick=()=>{ const c=DB.contracts[+b.dataset.view];
      toast(t('ct.detail',{id:c.id, p:c.progress, e:c.ends})); });
    $$('#ctGrid [data-brk]').forEach(b=>b.onclick=()=>{ const c=DB.contracts[+b.dataset.brk];
      confirmModal(t('ct.breakTitle',{id:c.id}), t('ct.breakBody'), t('modal.break'),()=>{
        c.stKey='ct.stDraft'; c.progress=0; DB.credits-=200; draw(); toast(t('ct.broken',{id:c.id}),'warn'); }); });
  };
  $('#ctNew').onclick=()=>{ DB.contracts.push({id:'CT-'+(2106+DB.contracts.length), nameKey:'ct.nameNew', stKey:'ct.stDraft', progress:0, ends:'—'});
    draw(); toast(t('ct.created'),'ok'); };
  draw();
};

/* ---------------- App: Access ---------------- */
APP_RENDER.access = function(ws){
  ws.innerHTML = pageHead(t('acc.title'), t('acc.sub'),
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span>')+
  '<div class="panel"><h3>'+t('acc.leases')+'</h3><p class="psub">'+t('acc.leasesSub')+'</p>'+
  '<table class="tbl"><tr><th>'+t('acc.thId')+'</th><th>'+t('acc.thScope')+'</th><th>'+t('acc.thState')+'</th><th>'+t('acc.thExpires')+'</th><th></th></tr>'+
  DB.leases.map((l,i)=>'<tr><td class="mono">'+l.id+'</td><td>'+t(l.scopeKey)+'</td>'+
  '<td><span class="badge '+(l.stKey==='acc.stActive'?'badge-live':'badge-red')+'">'+t(l.stKey)+'</span></td>'+
  '<td class="mono">'+l.expires+'</td><td>'+
  (l.stKey==='acc.stActive'
    ? '<button class="btn btn-ghost btn-sm" data-rvk="'+i+'">'+t('acc.revoke')+'</button> <button class="btn btn-ghost btn-sm" data-rnw="'+i+'">'+t('acc.renew')+'</button>'
    : '<button class="btn btn-primary btn-sm" data-grt="'+i+'">'+t('acc.grant')+'</button>')+'</td></tr>').join('')+'</table></div>';
  $$('#ws [data-rvk]').forEach(b=>b.onclick=()=>{ const l=DB.leases[+b.dataset.rvk];
    confirmModal(t('acc.revokeTitle',{id:l.id}), t('acc.revokeBody'), t('modal.revoke'),()=>{ l.stKey='acc.stRevoked'; APP_RENDER.access(ws); toast(t('acc.revoked',{id:l.id}),'warn'); }); });
  $$('#ws [data-rnw]').forEach(b=>b.onclick=()=>toast(t('acc.renewed',{id:DB.leases[+b.dataset.rnw].id}),'ok'));
  $$('#ws [data-grt]').forEach(b=>b.onclick=()=>{ DB.leases[+b.dataset.grt].stKey='acc.stActive'; APP_RENDER.access(ws); toast(t('acc.granted'),'ok'); });
};

/* ---------------- App: Profiles ---------------- */
/* profile options use stable internal ids; labels are translated at render time */
const PROF_IDS = ['default','standard','minimal'];
function profLabel(k, id){
  return id==='standard' ? t('prof.optStandard') : id==='minimal' ? t('prof.optMinimal') : t('prof.name.'+k);
}
function profGet(k){
  const raw = Store.get('prof_'+k, null);
  if(raw && PROF_IDS.indexOf(raw)>=0) return raw;
  if(raw){
    /* migrate legacy values saved as display names (en or zh) */
    const L = window.HS_LOCALES||{}, en=L.en||{}, zh=L['zh-CN']||{};
    if(raw===en['prof.name.'+k]||raw===zh['prof.name.'+k]) return 'default';
    if(raw===en['prof.optStandard']||raw===zh['prof.optStandard']) return 'standard';
    if(raw===en['prof.optMinimal']||raw===zh['prof.optMinimal']) return 'minimal';
  }
  return 'default';
}
APP_RENDER.profiles = function(ws){
  const P = DB.profiles;
  const saved = Store.get('profiles', null);
  const profOpts = k => { const cur = profGet(k);
    return PROF_IDS.map(id=>'<option value="'+id+'"'+(cur===id?' selected':'')+'>'+esc(profLabel(k,id))+'</option>').join(''); };
  const cards = [['theme','prof.theme'],['rule','prof.rule'],
   ['feedback','prof.feedback'],['effect','prof.effect']]
  .map(([k,tk])=>'<div class="panel" style="margin-bottom:0"><h3>'+t(tk)+'</h3><p class="psub">'+t(P[k].descKey)+'</p>'+
    '<div class="field"><label>'+t('prof.active')+'</label><select class="sel" data-p="'+k+'" aria-label="'+esc(t(tk))+'">'+profOpts(k)+'</select></div>'+
    '<div class="muted" style="font-size:12.5px">'+t('prof.current')+' <b class="mono" data-cur="'+k+'">'+esc(profLabel(k, profGet(k)))+'</b><br>'+t(P[k].descKey)+'</div></div>').join('');
  ws.innerHTML = pageHead(t('prof.title'), t('prof.sub'),
    '<span class="badge '+(saved?'badge-live':'badge-demo')+'">'+t(saved?'prof.saved':'prof.defaults')+'</span>')+
  '<div class="grid2">'+cards+'</div><div class="flex gap8 mt16 wrap">'+
  '<button class="btn btn-primary btn-sm" id="pfSave">'+t('prof.save')+'</button>'+
  '<button class="btn btn-ghost btn-sm" id="pfLoad">'+t('prof.load')+'</button>'+
  '<button class="btn btn-danger btn-sm" id="pfReset">'+t('prof.reset')+'</button></div>';
  $$('#ws [data-p]').forEach(s=>s.onchange=()=>{ $('[data-cur="'+s.dataset.p+'"]', ws).textContent = profLabel(s.dataset.p, s.value); });
  $('#pfSave').onclick=()=>{ $$('#ws [data-p]').forEach(s=>Store.set('prof_'+s.dataset.p, s.value));
    Store.set('profiles', true); toast(t('prof.savedToast'),'ok'); APP_RENDER.profiles(ws); };
  $('#pfLoad').onclick=()=>{ if(!Store.get('profiles', null)) return toast(t('prof.noSave'),'warn');
    APP_RENDER.profiles(ws); toast(t('prof.loadedToast'),'ok'); };
  $('#pfReset').onclick=()=>confirmModal(t('prof.resetTitle'), t('prof.resetBody'), t('modal.reset'),()=>{
    ['theme','rule','feedback','effect'].forEach(k=>{ try{localStorage.removeItem('hs2_prof_'+k);}catch(e){} });
    try{localStorage.removeItem('hs2_profiles');}catch(e){}
    APP_RENDER.profiles(ws); toast(t('prof.resetToast'),'ok'); });
};

/* ---------------- App: Diagnostics ---------------- */
APP_RENDER.diagnostics = function(ws){
  ws.innerHTML = pageHead(t('diag.title'), t('diag.sub'),
    '<span class="badge badge-demo"><span class="dot"></span>'+t('app.demoMode')+'</span>'+
    '<button class="btn btn-ghost btn-sm" id="dgPause" style="margin-left:10px">'+t('diag.pause')+'</button>')+
  '<div class="grid2"><div class="panel" style="margin-bottom:0"><h3>'+t('diag.checks')+'</h3><p class="psub">'+t('diag.checksSub')+'</p>'+
  [[t('diag.c1t'),t('diag.c1d'),'ok'],[t('diag.c2t'),t('diag.c2d'),'ok'],[t('diag.c3t'),t('diag.c3d'),'ok'],
   [t('diag.c4t'),t('diag.c4d'),'warn'],[t('diag.c5t'),t('diag.c5d'),'err']].map(c=>
  '<div class="trow"><div class="tl">'+c[0]+'<small>'+c[1]+'</small></div>'+
  '<span class="badge '+(c[2]==='ok'?'badge-live':c[2]==='warn'?'badge-demo':'badge-red')+'">'+t('diag.'+c[2])+'</span></div>').join('')+'</div>'+
  '<div class="panel" style="margin-bottom:0"><h3>'+t('diag.log')+'</h3><p class="psub">'+t('diag.logSub')+'</p>'+
  '<div class="log" id="dgLog" role="log" aria-label="'+esc(t('diag.log'))+'"></div></div></div>';
  const logEl = $('#dgLog');
  const lineText = l => { const p = Object.assign({}, l.p);
    if(p.zone) p.zone = zoneName(p.zone);
    if(p.fx) p.fx = fxName(p.fx);
    return t(l.key, p); };
  const paint=()=>{ logEl.innerHTML = DB.log.map(l=>'<div class="ln"><span class="ts">'+l.ts+'</span><span class="'+l.cls+'">'+esc(lineText(l))+'</span></div>').join('');
    logEl.scrollTop = logEl.scrollHeight; };
  paint();
  let paused=false, n=0;
  const tickKeys=['diag.tick1','diag.tick2','diag.tick3','diag.tick4'];
  const tickCls=['inf','ok','inf','warn'];
  clearInterval(diagTimer);
  diagTimer=setInterval(()=>{ if(paused) return;
    const k=tickKeys[n%tickKeys.length]; const tc=tickCls[n%tickKeys.length]; n++;
    const d=new Date();
    DB.log.push({ts:d.toTimeString().slice(0,8), cls:tc, key:k, p:{}}); paint(); }, 5000);
  $('#dgPause').onclick=e=>{ paused=!paused;
    e.target.textContent = t(paused?'diag.resume':'diag.pause');
    toast(t(paused?'diag.paused':'diag.resumed')); };
};

/* ---------------- Boot ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const tc = document.createElement('div'); tc.id='toasts'; document.body.appendChild(tc);
  initLang();
  applyTheme();
  applyI18nMeta();
  route();
});
