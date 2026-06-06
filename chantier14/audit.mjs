import { writeFileSync } from 'node:fs';
const SRC = '/sessions/practical-loving-bardeen/mnt/Strudel CC/keymaker-app/src/lessons.js';
const { modules } = await import('file://' + SRC);

const PC = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
function noteValue(tok){
  const m = /^([a-g])(#|b|s|f)?(-?\d+)$/.exec(tok.toLowerCase());
  if(!m) return null;
  let v = PC[m[1]];
  if(m[2]==='#'||m[2]==='s') v+=1;
  if(m[2]==='b'||m[2]==='f') v-=1;
  return parseInt(m[3],10)*12+v;
}
function notesIn(code){
  const out=[]; const re=/note\(\s*[`"']([^`"']*)[`"']/g; let m;
  while((m=re.exec(code))) for(const raw of m[1].split(/[\s\[\]<>,*!@/()]+/)){ const v=noteValue(raw); if(v!==null) out.push({tok:raw,v}); }
  return out;
}
function soundsIn(code){
  const out=new Set(); const re=/(?:^|[^a-zA-Z_])(?:s|sound)\(\s*[`"']([^`"']*)[`"']/g; let m;
  while((m=re.exec(code))) for(const raw of m[1].split(/[\s\[\]<>,*!@/()]+/)){
    const t=raw.replace(/[?:].*$/,'').trim();
    if(!t||/^~$/.test(t)) continue;
    if(/^\d+(\.\d+)?$/.test(t)) continue;
    out.add(t);
  }
  return [...out];
}
function numArgs(code,fn){ const out=[]; const re=new RegExp('\\.'+fn+'\\(\\s*(-?\\d*\\.?\\d+)','g'); let m; while((m=re.exec(code))) out.push(parseFloat(m[1])); return out; }
function balance(code){
  const probs=[]; for(const [o,c] of [['(',')'],['[',']'],['{','}']]){ const no=code.split(o).length-1, nc=code.split(c).length-1; if(no!==nc) probs.push(o+c+' desequilibres ('+no+'/'+nc+')'); }
  if((code.split('"').length-1)%2!==0) probs.push('guillemets impairs');
  if((code.split('`').length-1)%2!==0) probs.push('backticks impairs');
  return probs;
}
const DRUMS=new Set('bd sd hh oh rim cr rd cp ht mt lt sh cb tb perc misc'.split(' '));
const SYNTHS=new Set('sine sawtooth saw square triangle tri pulse white pink brown crackle'.split(' '));
const COMMON=new Set(('casio jazz metal jvbass juno piano east crow insect wind space numbers arpy bass bass1 bass2 bass3 drum drumtraks feel hand hardcore hardkick house industrial jungle kicklinn latibro led linnhats mash newnotes notes outdoor pad popkick reverbkick sax sf sitar speech tabla tech techno tink tok ul voodoo wobble breaks125 breaks152 breaks157 breaks165 amencutup gretsch amen').split(/\s+/).filter(Boolean));
const TRUSTED=new Set();
for(const mod of modules) for(const ch of (mod.chapitres||[])){ if((ch.module??9)>2) continue; for(const fl of (ch.flashs||[])) for(const s of soundsIn(fl.code||'')) TRUSTED.add(s); }
function classifySound(t){ if(DRUMS.has(t)||SYNTHS.has(t)) return 'ok'; if(/^gm_/.test(t)) return 'gm'; if(COMMON.has(t)||TRUSTED.has(t)) return 'ok'; return 'unknown'; }
const RANDOM_FNS=/\b(degrade|degradeBy|sometimes|sometimesBy|someCycles|someCyclesBy|rarely|almostNever|often|chooseCycles|randcat|wchooseCycles)\b/;

const flashs=[];
for(const mod of modules) for(const ch of (mod.chapitres||[])) for(const fl of (ch.flashs||[])){
  const modNum = ch.module ?? parseInt(String(fl.id).split('.')[0],10);
  flashs.push({ module:modNum, chapter:ch.chapter||ch.title||'', id:fl.id, kicker:fl.kicker||'', title:fl.title||'', code:fl.code||'' });
}
const target=flashs.filter(f=>f.module>=3&&f.module<=7);
const records=[];
for(const f of target){
  const code=f.code; const flags=[]; const add=(sev,tag,msg)=>flags.push({sev,tag,msg});
  if(/gm_acoustic_guitar_steel/.test(code)){
    const lows=notesIn(code).filter(n=>n.v<=29);
    if(lows.length){ const below=lows.some(n=>n.v<=28); add(below?'haut':'moyen','steel-grave','steel + note grave ('+[...new Set(lows.map(n=>n.tok))].join(', ')+') -- steel muet sous ~Fa2. Preferer nylon/basse.'); }
  }
  const codeNoMidi=code.replace(/\.midi\s*\([^)]*\)/g,'');
  if(/\.midi\s*\(/.test(code) && !/\.s\s*\(|\bsound\s*\(|\bs\s*\(/.test(codeNoMidi)) add('haut','midi-muet','.midi() route vers un appareil externe -> aucun son interne. Flash auto-joue muet.');
  else if(/\.midi\s*\(/.test(code)) add('moyen','midi-present','.midi() present -- verifier qu un .s() audible reste joue.');
  if(/\b(chop|slice|splice|fit)\s*\(/.test(code)){
    const hasSamples=/\bsamples\s*\(/.test(code); const snds=soundsIn(code); const ext=snds.some(s=>classifySound(s)==='unknown');
    if(!hasSamples&&ext) add('haut','chop-sample','chop/slice sur son non standard sans samples() -> risque silence (sons: '+snds.join(', ')+').');
    else add('moyen','chop','chop/slice/splice -- decoupe de sample : verifier que ca sonne (point chaud M6/M7).');
  }
  let m; const mm=/\bmask\(\s*[`"']([^`"']*)[`"']/g;
  while((m=mm.exec(code))) if(/^\s*[<\[]?\s*0(\s|!|>|\]|$)/.test(m[1])) add('moyen','mask-silence','mask("'+m[1].slice(0,24)+'...") demarre par des cycles a 0 -> muet au debut, ecouter dans la duree.');
  if(RANDOM_FNS.test(code)) add('bas','hasard','hasard (degrade/sometimes/someCycles) -> certains cycles plus vides. Ecouter plusieurs cycles.');
  for(const v of numArgs(code,'lpf')) if(v<=200) add('moyen','lpf-bas','lpf('+v+') tres bas -> son tres etouffe, quasi inaudible possible.');
  for(const v of numArgs(code,'hpf')) if(v>=6000) add('moyen','hpf-haut','hpf('+v+') tres haut -> son tres fin, quasi inaudible possible.');
  for(const v of numArgs(code,'gain')){ if(v===0) add('haut','gain0','gain(0) -> silence.'); else if(v<=0.15) add('bas','gain-bas','gain('+v+') tres bas -> piste presque inaudible.'); }
  for(const p of balance(code)) add('haut','syntaxe','Desequilibre : '+p+' -> risque erreur execution (pas de son).');
  const hasSamples=/\bsamples\s*\(/.test(code); const unknown=soundsIn(code).filter(s=>classifySound(s)==='unknown');
  if(unknown.length&&!hasSamples&&!/\b(chop|slice|splice|fit)\s*\(/.test(code)) add('moyen','son-inconnu','Son(s) non standard : '+unknown.join(', ')+' -- verifier qu ils existent (sinon silence).');
  const ns=notesIn(code);
  if(ns.length && /\bgm_/.test(code)){ const hi=Math.max(...ns.map(n=>n.v)), lo=Math.min(...ns.map(n=>n.v));
    if(hi>=84) add('bas','aigu','note tres aigue ('+ns.find(n=>n.v===hi).tok+') -> timbre fin possible.');
    if(lo<=16) add('bas','grave','note tres grave ('+ns.find(n=>n.v===lo).tok+') -> verifier que le son descend la.'); }
  const rank={haut:3,moyen:2,bas:1}; const maxSev=flags.reduce((a,fl)=>Math.max(a,rank[fl.sev]),0);
  records.push({...f,flags,maxSev});
}
const sevName=['ok','bas','moyen','haut'];
records.sort((a,b)=>b.maxSev-a.maxSev || a.id.localeCompare(b.id,undefined,{numeric:true}));
const counts={haut:0,moyen:0,bas:0,ok:0}; for(const r of records) counts[sevName[r.maxSev]]++;
writeFileSync('/sessions/practical-loving-bardeen/mnt/outputs/audit_data.json', JSON.stringify({generated:new Date().toISOString(),counts,records},null,2));
console.log('\n=== AUDIT C14 -- '+records.length+' flashs M3->M7 ===');
console.log('HAUT: '+counts.haut+' | MOYEN: '+counts.moyen+' | bas: '+counts.bas+' | rien: '+counts.ok+'\n');
for(const r of records.filter(x=>x.maxSev>=2)){
  console.log('['+sevName[r.maxSev].toUpperCase()+'] '+r.id+'  '+r.title);
  console.log('   code: '+r.code.replace(/\n/g,' / ').slice(0,130));
  for(const fl of r.flags) console.log('   - ('+fl.sev+'/'+fl.tag+') '+fl.msg);
}
const tagCount={}; for(const r of records) for(const fl of r.flags) tagCount[fl.tag]=(tagCount[fl.tag]||0)+1;
console.log('\n--- Repartition par type ---');
for(const [t,n] of Object.entries(tagCount).sort((a,b)=>b[1]-a[1])) console.log('   '+t+': '+n);
