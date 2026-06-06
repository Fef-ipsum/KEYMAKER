import { readFileSync, writeFileSync } from 'node:fs';
const data = JSON.parse(readFileSync('/sessions/practical-loving-bardeen/mnt/outputs/audit_data.json','utf8'));

const MOD_NAMES = {3:'Connexion Guitare',4:'Son & Effets',5:'Informatique Musicale',6:'Composition & Projets',7:'Genres & Styles'};
const SEV_LABEL = {3:'haut',2:'à écouter',1:'note',0:''};

// ordre naturel pour le parcours
const byId = [...data.records].sort((a,b)=>a.id.localeCompare(b.id,undefined,{numeric:true}));
const suspects = byId.filter(r=>r.maxSev>=2);

const css = `
:root{--bg:#0a0e14;--panel:#121822;--panel2:#0e141d;--line:#1e2937;--txt:#dbe5f0;--mut:#8294a8;--acc:#22d3ee;--acc2:#0891b2;--ok:#34d399;--warn:#fb7185;--mid:#fbbf24;--radius:14px}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
a{color:var(--acc)}
.wrap{max-width:920px;margin:0 auto;padding:22px 18px 80px}
header h1{font-size:22px;margin:0 0 4px;letter-spacing:.2px}
header .sub{color:var(--mut);font-size:13.5px;margin-bottom:16px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
.chip{background:var(--panel);border:1px solid var(--line);color:var(--txt);padding:6px 11px;border-radius:999px;font-size:12.5px;cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:6px}
.chip .n{color:var(--mut);font-variant-numeric:tabular-nums}
.chip.active{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc) inset;color:#fff}
.chip.warn.active{border-color:var(--warn);box-shadow:0 0 0 1px var(--warn) inset}
.progress{margin:14px 0 6px;background:var(--panel2);border:1px solid var(--line);border-radius:999px;height:12px;overflow:hidden}
.progress > i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--acc2),var(--acc));transition:width .35s}
.pmeta{display:flex;justify-content:space-between;color:var(--mut);font-size:12.5px;margin-bottom:8px}
.prio{background:linear-gradient(180deg,rgba(34,211,238,.06),transparent);border:1px solid var(--line);border-radius:var(--radius);padding:12px 14px;margin:10px 0 18px}
.prio h3{margin:0 0 8px;font-size:13px;color:var(--acc);letter-spacing:.4px;text-transform:uppercase}
.prio .plist{display:flex;flex-wrap:wrap;gap:7px}
.ptag{font-size:12px;background:var(--panel);border:1px solid var(--line);padding:4px 9px;border-radius:8px;cursor:pointer;font-variant-numeric:tabular-nums}
.ptag:hover{border-color:var(--acc)}
.ptag.done{opacity:.45;text-decoration:line-through}
.grp{margin:22px 0 8px;font-size:12px;color:var(--mut);text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid var(--line);padding-bottom:6px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:13px 14px;margin:10px 0;scroll-margin-top:14px}
.card.s-3{border-left:3px solid var(--warn)}
.card.s-2{border-left:3px solid var(--mid)}
.card.st-ok{border-left:3px solid var(--ok)}
.card.st-pb{border-left:3px solid var(--warn);background:linear-gradient(180deg,rgba(251,113,133,.05),transparent)}
.top{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.id{font-weight:700;color:var(--acc);font-variant-numeric:tabular-nums}
.ttl{font-weight:600}
.kick{color:var(--mut);font-size:12.5px}
.badge{font-size:11px;padding:2px 7px;border-radius:6px;margin-left:auto;white-space:nowrap}
.badge.b2{background:rgba(251,191,36,.14);color:var(--mid);border:1px solid rgba(251,191,36,.3)}
.flags{margin:8px 0 0;padding:0;list-style:none}
.flags li{font-size:12.5px;color:var(--mut);padding:3px 0 3px 16px;position:relative}
.flags li:before{content:"›";position:absolute;left:2px;color:var(--acc)}
pre{margin:10px 0 0;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px 12px;overflow:auto;font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#bfe9f2;white-space:pre-wrap;word-break:break-word}
.row{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}
.btn{background:var(--panel2);border:1px solid var(--line);color:var(--txt);padding:6px 11px;border-radius:9px;font-size:12.5px;cursor:pointer}
.btn:hover{border-color:var(--acc)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:9px;overflow:hidden}
.seg button{background:transparent;border:0;color:var(--mut);padding:7px 12px;font-size:12.5px;cursor:pointer}
.seg button+button{border-left:1px solid var(--line)}
.seg button.on-todo{background:rgba(130,148,168,.18);color:#fff}
.seg button.on-ok{background:rgba(52,211,153,.18);color:var(--ok)}
.seg button.on-pb{background:rgba(251,113,133,.18);color:var(--warn)}
.note{flex:1 1 220px;min-width:160px;background:var(--panel2);border:1px solid var(--line);color:var(--txt);border-radius:9px;padding:7px 10px;font:12.5px/1.4 inherit;resize:vertical}
.copied{color:var(--ok);font-size:12px;margin-left:4px}
.hidden{display:none}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 2px}
dialog{background:var(--panel);color:var(--txt);border:1px solid var(--line);border-radius:14px;max-width:680px;width:92%;padding:0}
dialog::backdrop{background:rgba(0,0,0,.55)}
.dlg-h{padding:14px 16px;border-bottom:1px solid var(--line);font-weight:600;display:flex;justify-content:space-between;align-items:center}
.dlg-b{padding:14px 16px}
.dlg-b textarea{width:100%;height:240px;background:var(--panel2);border:1px solid var(--line);color:var(--txt);border-radius:10px;padding:10px;font:12.5px/1.5 ui-monospace,monospace}
.muted{color:var(--mut)}
`;

const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Keymaker — Validation audio M3→M7</title>
<style>${css}</style>
</head><body><div class="wrap">
<header>
  <h1>🎧 Validation audio — Keymaker M3 → M7</h1>
  <div class="sub">125 flashs à écouter. Pour chacun : ouvre-le dans Keymaker (ou colle le code dans Strudel), <b>Ctrl+Entrée</b>, écoute, puis marque <b>OK</b> ou <b>⚠️ Problème</b>. Ta progression est sauvegardée automatiquement dans ce fichier. <span class="muted">Audit statique : ${data.counts.haut} risque haut · ${data.counts.moyen} à écouter en priorité · le reste = aucun signal de silence détecté.</span></div>
</header>

<div class="progress"><i id="bar"></i></div>
<div class="pmeta"><span id="pcount">0 / 125 validés</span><span id="pbreak"></span></div>

<div class="chips" id="filters">
  <span class="chip active" data-f="parcours">Parcours <span class="n" id="c-all"></span></span>
  <span class="chip" data-f="suspects">⭐ Suspects <span class="n">${suspects.length}</span></span>
  <span class="chip" data-f="todo">À écouter <span class="n" id="c-todo"></span></span>
  <span class="chip" data-f="ok">OK <span class="n" id="c-ok"></span></span>
  <span class="chip warn" data-f="pb">⚠️ Problèmes <span class="n" id="c-pb"></span></span>
</div>
<div class="toolbar">
  <button class="btn" id="exportBtn">📋 Exporter les problèmes</button>
  <button class="btn" id="resetBtn">↺ Réinitialiser le suivi</button>
</div>

<div class="prio" id="prioPanel">
  <h3>À écouter en priorité — ${suspects.length} flashs (découpe de samples, mask, final)</h3>
  <div class="plist" id="prioList"></div>
</div>

<main id="list"></main>
</div>

<dialog id="exportDlg"><div class="dlg-h"><span>Problèmes à corriger</span><button class="btn" id="closeDlg">Fermer</button></div>
<div class="dlg-b"><p class="muted" style="margin-top:0">Copie-colle ça dans Notion ou dans une nouvelle conversation « on corrige les flashs de la validation audio ».</p>
<textarea id="exportTxt" readonly></textarea>
<div style="margin-top:10px"><button class="btn" id="copyExport">Copier</button> <span class="copied hidden" id="copyMsg">copié ✓</span></div></div></dialog>

<script>
const DATA = ${JSON.stringify({records: byId, suspects: suspects.map(s=>s.id)})};
const MOD_NAMES = ${JSON.stringify(MOD_NAMES)};
const KEY='keymaker:c14:validation:v1';
let state = {};
try{ state = JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){ state={}; }
let filter='parcours';
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} }
function st(id){ return (state[id]&&state[id].status)||'todo'; }
function note(id){ return (state[id]&&state[id].note)||''; }
function setStatus(id,s){ state[id]=state[id]||{}; state[id].status=(st(id)===s?'todo':s); save(); render(); }
function setNote(id,v){ state[id]=state[id]||{}; state[id].note=v; save(); updateCounts(); }

function counts(){
  let ok=0,pb=0,todo=0;
  for(const r of DATA.records){ const s=st(r.id); if(s==='ok')ok++; else if(s==='pb')pb++; else todo++; }
  return {ok,pb,todo,done:ok+pb,total:DATA.records.length};
}
function updateCounts(){
  const c=counts();
  document.getElementById('bar').style.width=(100*c.done/c.total)+'%';
  document.getElementById('pcount').textContent=c.done+' / '+c.total+' validés';
  document.getElementById('pbreak').textContent=c.ok+' OK · '+c.pb+' à corriger · '+c.todo+' restants';
  document.getElementById('c-all').textContent=c.total;
  document.getElementById('c-todo').textContent=c.todo;
  document.getElementById('c-ok').textContent=c.ok;
  document.getElementById('c-pb').textContent=c.pb;
  // prio chips done state
  document.querySelectorAll('.ptag').forEach(t=>{ t.classList.toggle('done', st(t.dataset.id)!=='todo'); });
}
function visible(r){
  const s=st(r.id);
  if(filter==='parcours') return true;
  if(filter==='suspects') return r.maxSev>=2;
  if(filter==='todo') return s==='todo';
  if(filter==='ok') return s==='ok';
  if(filter==='pb') return s==='pb';
  return true;
}
function cardHTML(r){
  const s=st(r.id);
  const sev = r.maxSev>=2 ? 'badge b2' : '';
  const badge = r.maxSev>=2 ? '<span class="'+sev+'">à écouter</span>' : '';
  const flags = r.flags.length ? '<ul class="flags">'+r.flags.map(f=>'<li>'+escapeHtml(f.msg)+'</li>').join('')+'</ul>' : '';
  return '<div class="card s-'+r.maxSev+' '+(s==='ok'?'st-ok':s==='pb'?'st-pb':'')+'" id="card-'+r.id+'">'
   +'<div class="top"><span class="id">'+r.id+'</span><span class="ttl">'+escapeHtml(r.title)+'</span>'
   +(r.kicker?'<span class="kick">'+escapeHtml(r.kicker)+'</span>':'')+badge+'</div>'
   +flags
   +'<pre>'+escapeHtml(r.code)+'</pre>'
   +'<div class="row">'
   +'<button class="btn" data-copy="'+r.id+'">⧉ Copier le code</button>'
   +'<span class="seg">'
     +'<button data-s="todo" class="'+(s==='todo'?'on-todo':'')+'" data-id="'+r.id+'">À écouter</button>'
     +'<button data-s="ok" class="'+(s==='ok'?'on-ok':'')+'" data-id="'+r.id+'">✓ OK</button>'
     +'<button data-s="pb" class="'+(s==='pb'?'on-pb':'')+'" data-id="'+r.id+'">⚠️ Problème</button>'
   +'</span>'
   +'<input class="note" placeholder="note (ce qui sonne mal…)" data-note="'+r.id+'" value="'+escapeAttr(note(r.id))+'">'
   +'</div></div>';
}
function render(){
  const list=document.getElementById('list');
  let html=''; let curMod=null, curCh=null;
  const rows=DATA.records.filter(visible);
  if(!rows.length) html='<p class="muted" style="padding:20px 0">Rien dans ce filtre 🎉</p>';
  for(const r of rows){
    if(filter==='parcours'){
      if(r.module!==curMod){ curMod=r.module; curCh=null; html+='<div class="grp">Module '+r.module+' — '+(MOD_NAMES[r.module]||'')+'</div>'; }
      if(r.chapter!==curCh){ curCh=r.chapter; html+='<div class="grp" style="border:0;color:var(--acc);opacity:.8">'+escapeHtml(r.chapter)+'</div>'; }
    }
    html+=cardHTML(r);
  }
  list.innerHTML=html;
  document.getElementById('prioPanel').classList.toggle('hidden', filter!=='parcours');
  updateCounts();
}
function escapeHtml(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function escapeAttr(s){ return String(s).replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

// prio chips
document.getElementById('prioList').innerHTML = DATA.suspects.map(id=>'<span class="ptag" data-id="'+id+'">'+id+'</span>').join('');

// events (delegation)
document.body.addEventListener('click',e=>{
  const seg=e.target.closest('button[data-s]'); if(seg){ setStatus(seg.dataset.id, seg.dataset.s); return; }
  const cp=e.target.closest('button[data-copy]'); if(cp){ const r=DATA.records.find(x=>x.id===cp.dataset.copy); navigator.clipboard.writeText(r.code).then(()=>{ cp.textContent='✓ copié'; setTimeout(()=>cp.textContent='⧉ Copier le code',1200); }); return; }
  const pt=e.target.closest('.ptag'); if(pt){ const el=document.getElementById('card-'+pt.dataset.id); if(el){ el.scrollIntoView({behavior:'smooth',block:'center'}); el.style.transition='box-shadow .3s'; el.style.boxShadow='0 0 0 2px var(--acc)'; setTimeout(()=>el.style.boxShadow='',1100);} return; }
  const ch=e.target.closest('.chip'); if(ch){ filter=ch.dataset.f; document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); ch.classList.add('active'); render(); return; }
});
document.body.addEventListener('input',e=>{ const n=e.target.closest('input[data-note]'); if(n){ setNote(n.dataset.note, n.value); } });

document.getElementById('resetBtn').onclick=()=>{ if(confirm('Effacer tout le suivi (statuts + notes) ?')){ state={}; save(); render(); } };
const dlg=document.getElementById('exportDlg');
document.getElementById('exportBtn').onclick=()=>{
  const pbs=DATA.records.filter(r=>st(r.id)==='pb');
  let txt='# Validation audio Keymaker — problèmes à corriger ('+pbs.length+')\\n\\n';
  if(!pbs.length) txt+='Aucun problème marqué pour l’instant.';
  for(const r of pbs){ txt+='- ['+r.id+'] '+r.title+'\\n  code: '+r.code.replace(/\\n/g,' / ')+'\\n'+(note(r.id)?'  note: '+note(r.id)+'\\n':''); }
  document.getElementById('exportTxt').value=txt; dlg.showModal();
};
document.getElementById('closeDlg').onclick=()=>dlg.close();
document.getElementById('copyExport').onclick=()=>{ const t=document.getElementById('exportTxt'); navigator.clipboard.writeText(t.value); const m=document.getElementById('copyMsg'); m.classList.remove('hidden'); setTimeout(()=>m.classList.add('hidden'),1400); };

render();
</script>
</body></html>`;

const OUT='/sessions/practical-loving-bardeen/mnt/Strudel CC/KEYMAKER_validation_audio.html';
writeFileSync(OUT, html);
console.log('HTML ecrit:', OUT);
console.log('taille:', html.length, 'octets');
console.log('flashs:', byId.length, '| suspects:', suspects.length);
