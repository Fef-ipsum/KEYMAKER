// Vérifie les SCHÉMAS VIVANTS : une information fausse est pire qu'une information absente.
//
//  A. Hors navigateur : chaque schéma déclaré (leçons, wiki, questions) est valide ; les
//     missions ne sont pas gagnées d'avance et sont atteignables (parcours scripté) ; les
//     questions « à l'oreille » ne se valident pas au départ et se valident à la cible ;
//     les blocs de Sati invalides restent du texte ; chaque fait du « Creuser » a sa preuve
//     dans docs/SCHEMAS.md ET une mesure ci-dessous.
//  B. Dans Chromium, avec le moteur Strudel embarqué :
//     1. le dessin correspond à l'objet audio ;
//     2. le son correspond à Strudel : rendu superdough vs rendu du schéma, hors temps réel ;
//     3. la ligne de code s'exécute et produit les valeurs attendues ;
//     5. chaque fait du « Creuser » est mesuré.
// Usage : node scripts/check-schemas.mjs [--quick]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './browser.mjs';
import { serve } from './static-server.mjs';
import { TYPES, validateSpec, stateFromSpec, codeText, earCompare, describeCatalog, parseSchemaBlock, fromPos } from '../src/schemas/catalog.js';
import { createMissionRunner, pickMissions } from '../src/schemas/core/missions.js';
import { allSchemas } from '../src/content/registry.js';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const quick = process.argv.includes('--quick');
let bad = 0;
let n = 0;
const report = { when: new Date().toISOString(), results: [] };
const ok = (m, detail) => {
  n++;
  report.results.push({ ok: true, m, detail });
  if (detail && process.argv.includes('--verbose')) console.log('  ✓ ' + m + ' — ' + detail);
};
const fail = (m, detail) => {
  n++;
  bad++;
  report.results.push({ ok: false, m, detail });
  console.log('  ✗ ' + m + (detail ? ' — ' + detail : ''));
};
const check = (cond, m, detail) => (cond ? ok(m, detail) : fail(m, detail));
const section = (t) => console.log('\n' + t);

/* ================= A. Hors navigateur ================= */
section('[A] déclarations, missions, questions, Sati, faits');
const all = allSchemas();
for (const x of all) {
  const v = validateSpec(x.spec);
  check(v.ok, 'schéma valide : ' + x.where, v.error);
}
// Missions : pas gagnées d'avance.
for (const x of all.filter((y) => !y.ear)) {
  const def = TYPES[x.spec.type];
  const st = stateFromSpec(x.spec);
  const runner = createMissionRunner(pickMissions(def, x.spec.missions));
  const got = runner.update({ p: st.p, o: st.o, written: st.written, playing: true, holding: false, heldFor: 0, taps: 0, root0: st.o.root });
  check(!got.length, 'aucune mission gagnée sans geste : ' + x.where, got.join(', '));
}
// Missions : atteignables par un parcours scripté (les valeurs passent par les arrondis).
const SCRIPTS = {
  filtre: {
    ferme: [{ playing: true, f: 250 }],
    ouvre: [{ playing: true, f: 6000 }],
    siffle: [{ playing: true, q: 16 }],
    acid: [{ playing: true, q: 16 }, { playing: true, q: 16, f: 350 }, { playing: true, q: 16, f: 2500 }],
    allege: [{ playing: true, kind: 'passe-haut', f: 500 }],
    etroit: [{ playing: true, kind: 'passe-bande', q: 10 }],
  },
  onde: {
    pure: [{ playing: true }, { playing: true, onde: 'sine' }],
    creuse: [{ playing: true }, { playing: true, onde: 'square' }],
    brillante: [{ playing: true }, { playing: true, onde: 'sawtooth' }],
  },
  clavier: {
    octave: [{ taps: 2, o: { mode: 'notes', seq: [48, 60] } }],
    demiton: [{ taps: 2, o: { mode: 'notes', seq: [52, 53] } }],
    melodie: [{ taps: 5, o: { mode: 'notes', seq: [48, 50, 52, 55, 57] } }],
    quinte: [{ taps: 1, o: { mode: 'intervalle', a: 48, b: 55 } }],
    'tierce-mineure': [{ taps: 1, o: { mode: 'intervalle', a: 48, b: 51 } }],
    'tierce-majeure': [{ taps: 1, o: { mode: 'intervalle', a: 48, b: 52 } }],
    mineure: [{ taps: 1, o: { mode: 'gamme', scale: 'minor' } }],
    penta: [{ taps: 1, o: { mode: 'gamme', scale: 'minor:pentatonic' } }],
    tonique: [{ taps: 1, o: { mode: 'gamme', root: 50 } }],
    mineur: [{ taps: 1, o: { mode: 'accord', quality: 'm' } }],
    septieme: [{ taps: 1, o: { mode: 'accord', quality: '7' } }],
    arpege: [{ taps: 1, o: { mode: 'accord', arp: true } }],
  },
  signal: {
    lent: [{ playing: true, changed: true, slow: 8 }],
    large: [{ playing: true, changed: true, lo: 200, hi: 2000 }],
    forme: [{ playing: true, changed: true, forme: 'saw' }],
  },
  tempo: {
    lent: [{ playing: true, bpm: 70 }],
    rapide: [{ playing: true, bpm: 150 }],
    trois: [{ playing: true, temps: 3 }],
  },
  'enveloppe-filtre': {
    balaye: [{ playing: true, env: 4 }],
    eveil: [{ playing: true, lpa: 0.3 }],
    pique: [{ playing: true, env: 3, lpd: 0.08, lps: 0 }],
  },
  adsr: {
    lente: [{ attack: 0.5 }, { holding: true, heldFor: 0.2, event: 'press' }, { holding: true, heldFor: 0.6, event: 'tick' }],
    pince: [{ sustain: 0 }, { holding: true, heldFor: 1.2, event: 'tick' }],
    traine: [{ release: 1.2 }, { holding: false, heldFor: 0.5, event: 'release' }],
  },
};
for (const [type, def] of Object.entries(TYPES)) {
  for (const m of def.missions) {
    if (type === 'cycle') continue; // missions sur des événements réels : vérifiées dans le navigateur
    const script = SCRIPTS[type] && SCRIPTS[type][m.id];
    if (!script) {
      fail(`mission ${type}/${m.id} : pas de parcours scripté`);
      continue;
    }
    const st = stateFromSpec(type === 'filtre' ? { type, reglages: { lpf: 1000, lpq: 0 } } : type === 'onde' ? { type, onde: 'triangle' } : type === 'enveloppe-filtre' ? { type, reglages: { lpf: 300, lpenv: 1 } } : type === 'tempo' ? { type, reglages: { bpm: 100 }, temps: 4 } : type === 'clavier' ? { type, mode: 'notes', notes: 'c3' } : type === 'signal' ? { type, reglages: { bas: 300, haut: 600, slow: 2 }, forme: 'sine' } : { type, reglages: {}, mode: 'tenir' });
    const runner = createMissionRunner([m]);
    let done = false;
    for (const stepSnap of script) {
      const { playing = false, holding = false, heldFor = 0, event, kind, mode, onde, temps, taps = 0, o: oo, changed = false, forme, ...params } = stepSnap;
      if (forme) st.o.forme = forme;
      if (oo) Object.assign(st.o, oo);
      if (temps) st.o.temps = temps;
      if (onde) st.o.onde = onde;
      if (kind) st.o.kind = kind;
      if (mode) st.o.mode = mode;
      for (const [k, v] of Object.entries(params)) {
        st.p[k] = def.params[k].q(v);
        if (def.writes ? def.writes.includes(k) : type === 'adsr') st.written = true;
      }
      if (runner.update({ p: st.p, o: st.o, written: st.written, playing, holding, heldFor, event, taps, root0: 48, changed }).length) done = true;
    }
    check(done, `mission ${type}/${m.id} atteignable`);
  }
}
// Questions « à l'oreille ».
for (const x of all.filter((y) => y.ear)) {
  const q = x.ear;
  const def = TYPES[q.schema.type];
  const map = def.specKeys(q.schema);
  const start = stateFromSpec(q.schema);
  const target = stateFromSpec({ ...q.schema, reglages: { ...q.schema.reglages, ...q.cible } });
  const adjust = (q.regler || Object.keys(q.cible)).map((k) => map[k]);
  check(/^oreille\.[a-z0-9-]+$/.test(q.id), 'identifiant stable : ' + q.id);
  check(adjust.length && adjust.every(Boolean), q.id + ' : réglages à trouver connus');
  check(!earCompare(def, start, target, adjust).ok, q.id + ' : le réglage de départ ne suffit pas');
  check(earCompare(def, target, target, adjust).ok, q.id + ' : la cible est acceptée');
  for (const [k, v] of Object.entries(q.cible)) check(def.params[map[k]].q(v) === v, `${q.id} : ${k} = ${v} est atteignable au curseur`);
}
// Sati : ce qu'elle reçoit couvre tout le catalogue ; un bloc invalide reste du texte.
const desc = describeCatalog();
for (const [type, def] of Object.entries(TYPES)) {
  check(desc.includes(type + ' —'), 'catalogue pour Sati : type ' + type);
  for (const m of def.missions) check(desc.includes(m.id), `catalogue pour Sati : mission ${type}/${m.id}`);
}
check(desc.length < 3000, 'catalogue pour Sati : ' + desc.length + ' caractères (le contexte est plafonné à 8 000)');
const BLOCKS = [
  ['{"type":"filtre","reglages":{"lpf":800,"lpq":12},"source":"basse"}', true],
  ['{"type":"adsr","reglages":{"attack":0.4,"release":1},"mode":"tenir"}', true],
  ['{"type":"filtre","reglages":{"lpf":600},"defi":{"cible":{"lpf":300},"regler":["lpf"]}}', true],
  ['{"type":"filtre","reglages":{"lpf":60000}}', false],
  ['{"type":"filtre","reglages":{"lpf":600,"hpq":3}}', false],
  ['{"type":"reverbe","reglages":{}}', false],
  ['{"type":"filtre","missions":["voler"]}', false],
  ['{"type":"adsr","reglages":{"attack":"lent"}}', false],
  ['{type: filtre}', false],
  ['{"type":"filtre","reglages":{"lpf":600},"defi":{"cible":{"lpf":10}}}', false],
];
for (const [b, want] of BLOCKS) check(!!parseSchemaBlock(b) === want, `bloc de Sati ${want ? 'accepté' : 'refusé'} : ${b.slice(0, 70)}`);
// Faits : preuve écrite dans docs/SCHEMAS.md.
const doc = readFileSync(join(ROOT, '..', 'docs', 'SCHEMAS.md'), 'utf8');
const factIds = Object.values(TYPES).flatMap((d) => (d.facts || []).map((f) => f.id));
for (const id of factIds) check(doc.includes('`' + id + '`'), 'fait ' + id + ' : preuve notée dans docs/SCHEMAS.md');

/* ================= B. Dans le navigateur ================= */
const srv = await serve(ROOT);
const browser = await launchBrowser();
const page = await browser.newPage();
const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<script src="/public/vendor/strudel-repl/index.js" defer></script></head><body><div id="host"></div></body></html>`;
await page.route('**/__schemas.html', (route) => route.fulfill({ body: PAGE, contentType: 'text/html' }));
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
await page.goto(srv.url + '__schemas.html');
await page.waitForFunction(() => customElements.get('strudel-editor'));
await page.evaluate(async () => {
  const el = document.createElement('strudel-editor');
  el.setAttribute('code', 'silence');
  document.getElementById('host').appendChild(el);
  await new Promise((r) => {
    const t = setInterval(() => {
      if (el.editor) {
        clearInterval(t);
        r();
      }
    }, 50);
  });
  window.__ed = el.editor;
  await window.__ed.evaluate();
  await new Promise((r) => setTimeout(r, 1500));
  window.__ed.stop();
  window.__bench = await import('/scripts/schemas-bench.js');
});
const bench = (fn, ...args) => page.evaluate(({ fn, args }) => window.__bench[fn](...args), { fn, args });

// Quelques états au hasard (graine fixe), arrondis comme dans l'app.
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
function randomSpec(type) {
  const def = TYPES[type];
  if (type === 'filtre') {
    const f = def.params.f.q(fromPos(def.params.f, rnd()));
    const q = def.params.q.q(fromPos(def.params.q, rnd()));
    const src = ['basse', 'repetee', 'tenue'][Math.floor(rnd() * 3)];
    return { type, reglages: { lpf: f, lpq: q }, source: src };
  }
  if (type === 'enveloppe-filtre') {
    const d = TYPES[type];
    const r = { lpf: d.params.f.q(fromPos(d.params.f, rnd() * 0.6)), lpq: d.params.q.q(fromPos(d.params.q, rnd() * 0.5)), lpenv: d.params.env.q(fromPos(d.params.env, rnd())) };
    if (rnd() < 0.6) for (const k of ['lpa', 'lpd', 'lps', 'lpr']) r[k] = d.params[k].q(fromPos(d.params[k], rnd()));
    return { type, reglages: r, source: rnd() < 0.5 ? 'basse' : 'tenue' };
  }
  if (type === 'onde') return { type, onde: ['sine', 'triangle', 'square', 'sawtooth'][Math.floor(rnd() * 4)], note: ['c2', 'c3', 'c4'][Math.floor(rnd() * 3)] };
  const r = {};
  for (const k of ['attack', 'decay', 'sustain', 'release']) if (rnd() < 0.8) r[k] = def.params[k].q(fromPos(def.params[k], rnd()));
  return { type, reglages: r, mode: rnd() < 0.5 ? 'motif' : 'tenir' };
}

section('[B1] le dessin correspond à l’objet audio');
for (const [a, b] of [
  [{ type: 'filtre', reglages: { lpf: 600, lpq: 0 } }, { type: 'filtre', reglages: { lpf: 2400, lpq: 18 } }],
  [{ type: 'filtre', reglages: { lpf: 5000, lpq: 3 } }, { type: 'filtre', reglages: { lpf: 120, lpq: 30 } }],
  [{ type: 'filtre', reglages: { lpf: 600 } }, { type: 'filtre', reglages: { lpf: 900 } }],
]) {
  const r = await bench('drawingVsFilter', a, b);
  check(r.maxDb < 0.05, `courbe dessinée = filtre qui joue (${codeText(TYPES.filtre, stateFromSpec(b))})`, `écart max ${r.maxDb.toFixed(4)} dB`);
}
for (const [vals, hold] of [
  [[0.001, 0.05, 0.6, 0.01], 0.25],
  [[0.4, 0.3, 0.8, 1.2], 0.5],
  [[0.4, 0.3, 0.8, 1.2], 2],
  [[0.5, 0.2, 0.6, 0.3], 0.2],
  [[0.005, 0.2, 0, 0.1], 0.5],
  [[0.01, 0.01, 1, 0.05], 0.5],
]) {
  const r = await bench('envelopeVsEngine', vals, hold);
  check(r.vsDrawn < 1e-3 && r.vsEngine < 1e-3, `enveloppe [${vals.join(', ')}] sur ${hold} s : forme dessinée = volume programmé = getParamADSR`, `écarts ${r.vsDrawn.toExponential(1)} / ${r.vsEngine.toExponential(1)}`);
}
for (const [vals, rel, label] of [
  [[0.6, 0.4, 0.5, 0.8], 0.3, 'lâchée pendant l’attaque'],
  [[0.1, 0.6, 0.3, 0.5], 0.4, 'lâchée pendant la retombée'],
  [[0.05, 0.1, 0.4, 1], 1.2, 'lâchée pendant le maintien'],
]) {
  const r = await bench('heldVsEngine', vals, rel, null);
  check(r.vsTrace < 2e-3 && r.vsEngine < 2e-3, `note tenue ${label} : trace dorée = volume rendu = superdough (même durée)`, `écarts ${r.vsTrace.toExponential(1)} / ${r.vsEngine.toExponential(1)}`);
}
{
  const r = await bench('heldVsEngine', [0.05, 0.1, 0.8, 0.5], 1.2, { t: 0.5, vals: [0.05, 0.1, 0.2, 0.5] });
  check(r.vsTrace < 2e-3, 'note tenue, maintien changé pendant qu’on tient : la trace suit exactement le volume', `écart ${r.vsTrace.toExponential(1)}`);
}

for (const w of ['sine', 'triangle', 'square', 'sawtooth']) {
  const r = await bench('waveDrawingVsOscillator', w);
  check(r.barsDiff < 0.01 && r.shapeDiff < 0.02 && r.rms < 0.03, `onde ${w} : forme et barres dessinées = oscillateur réel`, `barres ${r.barsDiff.toExponential(1)} ; forme (échelle ×${r.scale.toFixed(3)}) : écart max ${r.shapeDiff.toExponential(1)} hors des ${r.jumps} saut(s) vertical(aux), ${r.jumpDiff.toExponential(1)} tout près des sauts, écart moyen (RMS) ${r.rms.toExponential(1)}`);
}

for (const [vals, hold, f, env] of [
  [[0.005, 0.14, 0, 0.1], 0.25, 300, 2],
  [[0.3, 0.2, 0.5, 0.4], 1, 200, 5],
  [[0.5, 0.2, 0.6, 0.3], 0.25, 600, -3],
  [[0.05, 0.1, 1, 0.1], 2, 100, 7],
]) {
  const r = await bench('filterEnvVsEngine', vals, hold, f, env);
  check(r.vsDrawn < 1e-3 && r.vsEngine < 1e-4, `enveloppe de filtre lpf ${f}, lpenv ${env}, [${vals.join(', ')}] sur ${hold} s : courbe dessinée = coupure programmée = getParamADSR`, `de ${Math.round(r.min)} à ${Math.round(r.max)} Hz ; écarts relatifs ${r.vsDrawn.toExponential(1)} / ${r.vsEngine.toExponential(1)}`);
}

section('[B2] le son correspond à Strudel (superdough vs schéma, hors temps réel)');
const RHYTHM = new Set(['cycle', 'tempo', 'clavier', 'signal']);
const soundCases = [...all.filter((x) => !RHYTHM.has(x.spec.type)).map((x) => ({ where: x.where, spec: x.spec }))];
soundCases.push({ where: 'sans réglage d’enveloppe (motif)', spec: { type: 'adsr', reglages: {}, mode: 'motif' } });
for (const t of Object.keys(TYPES).filter((x) => !RHYTHM.has(x))) for (let i = 0; i < (quick ? 2 : 5); i++) soundCases.push({ where: 'au hasard ' + t + ' ' + (i + 1), spec: randomSpec(t) });
// Tous les rendus superdough d'un coup (voir renderStrudelAll).
const items = await page.evaluate((specs) => [...specs.map((sp) => window.__bench.strudelItem(sp)), ...window.__bench.FACT_RENDERS, { ...window.__bench.strudelItem({ type: 'filtre', reglages: { lpf: 138, lpq: 27 }, source: 'repetee' }), key: 'self:resonance' }], soundCases.map((c) => c.spec));
const uniq = [...new Map(items.map((it) => [it.key, it])).values()];
const nRendered = await bench('renderStrudelAll', uniq);
ok(nRendered + ' rendus superdough hors temps réel');
for (const c of soundCases) {
  const r = await bench('soundVsStrudel', c.spec);
  check(r.maxAbs < 1e-4 && r.envDiff < 0.005 && r.specDiff < 0.5, `même son que Strudel : ${c.where}`, `${r.code} · écart échantillon max ${r.maxAbs.toExponential(1)} (crête ${r.peak.toFixed(3)}), enveloppe ${(r.envDiff * 100).toFixed(3)} %, spectre ${r.specDiff.toFixed(3)} dB · juste après la fin des notes (rangement asynchrone) : ${r.zoneAbs.toExponential(1)}`);
}

{
  // Superdough contre lui-même : la zone de rangement varie d'un rendu à l'autre.
  const r = await page.evaluate(() => {
    const B = window.__bench;
    const sp = { type: 'filtre', reglages: { lpf: 138, lpq: 27 }, source: 'repetee' };
    return B.compare(Array.from(window.__renders['spec:' + JSON.stringify(sp)] || []), Array.from(window.__renders['self:resonance']), B.teardownZones(sp, 2.3));
  });
  ok('superdough contre lui-même (lpf 138, lpq 27)', `hors zones de rangement : ${r.maxAbs.toExponential(1)} ; dans ces zones : ${r.zoneAbs.toExponential(1)}`);
  console.log(`  i superdough contre lui-même (lpf 138, lpq 27) : hors zones ${r.maxAbs.toExponential(1)}, dans les zones de rangement ${r.zoneAbs.toExponential(1)}`);
}

section('[B3] la ligne de code s’exécute et produit les valeurs attendues');
const codeCases = [...all.map((x) => x.spec).filter((sp) => !RHYTHM.has(sp.type))];
for (const t of Object.keys(TYPES).filter((x) => !RHYTHM.has(x))) for (let i = 0; i < (quick ? 5 : 25); i++) codeCases.push(randomSpec(t));
let codeBad = 0;
for (const spec of codeCases) {
  const r = await bench('codeProduces', spec);
  if (!r.ok) {
    codeBad++;
    fail('code : ' + r.code, r.why);
  }
}
check(!codeBad, `${codeCases.length} lignes de code évaluées par Strudel, valeurs conformes`);

section('[B4] rythme : événements, tempo, métronome, missions');
{
  const motifs = [...new Set([...all.filter((x) => x.spec.type === 'cycle').map((x) => x.spec.motif), 'bd [hh hh] sd <hh oh>', 'bd*2 [~ sd] hh*2 sd', 'bd(5,8,2), hh*4?', 'bd . hh hh . sd', '<bd sd>*2 hh', 'bd sd:2 [hh oh]!2', 'bd _ sd@2 ~'])];
  let bad = 0;
  for (const m of motifs) {
    const r = await bench('cycleVsCode', m);
    if (!r.ok) {
      bad++;
      fail('cycle : ' + m, r.why || 'événements différents de sound("…") évalué par Strudel');
    }
  }
  check(!bad, `${motifs.length} motifs : événements dessinés et joués = ceux de sound("…") évalué par Strudel (4 cycles)`);
  for (const sp of [...all.filter((x) => x.spec.type === 'tempo').map((x) => x.spec), { type: 'tempo', reglages: { bpm: 87 }, temps: 3 }, { type: 'tempo', reglages: { bpm: 174 }, temps: 4 }]) {
    const r = await bench('tempoVsCode', sp);
    check(r.ok, 'tempo : ' + r.code.replace(/\n/g, ' ⏎ '), `cps ${r.cps}, par cycle ${JSON.stringify(r.per)}`);
  }
  const sch = await bench('patternScheduling');
  check(sch.ok, 'métronome des schémas de rythme', sch.detail);
  const CYCLE_SCRIPTS = {
    ajoute: ['bd hh sd hh', 'bd hh sd hh cp'],
    silence: ['bd hh sd hh', 'bd ~ sd hh'],
    plus8: ['bd*4', 'bd*8'],
    crochets: ['bd hh sd hh', 'bd [hh hh] sd hh'],
    alterne: ['bd hh sd hh', 'bd hh sd <hh oh>'],
    couches: ['bd*4', 'bd*4, hh*8'],
  };
  for (const m of TYPES.cycle.missions) {
    const script = CYCLE_SCRIPTS[m.id];
    if (!script) {
      fail(`mission cycle/${m.id} : pas de parcours scripté`);
      continue;
    }
    check(await bench('cycleMission', m.id, script), `mission cycle/${m.id} atteignable (${script.join(' → ')})`);
    check(!(await bench('cycleMission', m.id, [script[0], script[0]])), `mission cycle/${m.id} : pas gagnée sans changer le motif`);
  }
}

{
  const specs = [...all.filter((x) => x.spec.type === 'clavier').map((x) => x.spec), { type: 'clavier', mode: 'gamme', gamme: 'Eb4:minor' }, { type: 'clavier', mode: 'gamme', gamme: 'G3:major:pentatonic' }, { type: 'clavier', mode: 'accord', accord: 'Bb^7', arpege: true }, { type: 'clavier', mode: 'intervalle', a: 'f#3', b: 'c4' }, { type: 'clavier', mode: 'notes', notes: 'c3 c#3 bb4 b4' }];
  let bad = 0;
  for (const sp of specs) {
    const r = await bench('clavierVsCode', sp);
    if (!r.ok) {
      bad++;
      fail('clavier : ' + r.code, 'touches allumées ≠ notes de la ligne de code');
    }
  }
  check(!bad, `${specs.length} claviers : touches allumées = notes de la ligne de code évaluée par Strudel`);
}

for (const sp of [...all.filter((x) => x.spec.type === 'signal').map((x) => x.spec), { type: 'signal', reglages: { bas: 80, haut: 9000, slow: 3 }, forme: 'saw' }, { type: 'signal', reglages: { bas: 500, haut: 700, slow: 1 }, forme: 'square' }, { type: 'signal', reglages: { bas: 2000, haut: 200, slow: 16 }, forme: 'tri' }]) {
  const r = await bench('signalVsCode', sp);
  check(r.ok, 'signal : ' + r.code, `coupures par note = ligne de code (écart ${r.maxDiff}) = signal au début de la note (${r.maxStep})`);
}

section('[B5] les faits du « Creuser », mesurés');
const factFns = await page.evaluate(() => Object.keys(window.__bench.FACTS));
for (const id of factIds) {
  if (!factFns.includes(id)) {
    fail('fait ' + id + ' : aucune mesure');
    continue;
  }
  const r = await page.evaluate((id) => window.__bench.FACTS[id](), id);
  check(r.ok, 'fait ' + id, r.detail);
}
check(!pageErrors.length, 'aucune erreur de page', pageErrors.slice(0, 3).join(' | '));

await browser.close();
await srv.close();
mkdirSync(join(here, 'out'), { recursive: true });
writeFileSync(join(here, 'out', 'schemas-report.json'), JSON.stringify(report, null, 1));
console.log(`\nschémas : ${n} vérifications, ${bad} en échec (détail : scripts/out/schemas-report.json)`);
process.exit(bad ? 1 : 0);
