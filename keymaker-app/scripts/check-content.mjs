// Vérifie TOUT le contenu jouable de l'app dans le moteur réel :
//  - chaque exemple de code s'évalue sans erreur et sans son introuvable ;
//  - pour chaque étape : le code de départ ne valide PAS l'exercice,
//    et la solution fournie le valide.
// Usage : node scripts/check-content.mjs [--only fondations|wiki|genres|legacy|reference] [--quick]
//         node scripts/check-content.mjs --only reference --write-skip
//           → note les exemples OFFICIELS qui ne jouent pas dans ce moteur, pour les écarter du wiki.
import { writeFileSync, readFileSync } from 'node:fs';
import { openEngine } from './harness.mjs';
import { buildContext, runCheck } from '../src/lib/check.js';
import { allExamples, allSteps } from '../src/content/registry.js';

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const quick = process.argv.includes('--quick');
const eng = await openEngine();
let bad = 0;
let n = 0;
const failedCodes = [];
const fail = (ex, msg) => {
  bad++;
  failedCodes.push(ex.code);
  console.log('✗ ' + ex.where + '\n    ' + msg);
};
const brief = (code) => code.replace(/\n/g, ' ⏎ ').slice(0, 160);

// Par défaut (sans --only), la référence officielle est vérifiée aussi.
const examples = allExamples().filter((e) => !only || e.group === only);
// Un son non chargé faute de réseau (« Failed to fetch ») n'est pas une erreur du contenu :
// on réessaie une fois, puis on le signale à part, sans faire échouer le contrôle.
const isNet = (r) => /Failed to fetch|NetworkError|ERR_INTERNET/i.test([r.error || '', ...(r.logs || [])].join(' '));
let net = 0;
for (const ex of examples) {
  n++;
  let r = await eng.evalCode(ex.code, { playMs: quick ? 250 : 900 });
  if (isNet(r)) r = await eng.evalCode(ex.code, { playMs: quick ? 250 : 900 });
  if (isNet(r)) {
    net++;
    console.log('⚠ ' + ex.where + ' : réseau indisponible, exemple non vérifié');
    continue;
  }
  if (r.error) fail(ex, 'ERREUR : ' + r.error + '\n    code : ' + brief(ex.code));
  else if (r.logs.length) fail(ex, 'JOURNAL : ' + r.logs.join(' | ').slice(0, 300));
  else if (!r.haps.length && !r.app.haps4.length) fail(ex, 'AUCUN SON sur 4 cycles\n    code : ' + brief(ex.code));
}
console.log(`exemples : ${n} exécutés, ${bad} en échec` + (net ? `, ${net} non vérifiés faute de réseau` : ''));

if (process.argv.includes('--write-skip') && only === 'reference') {
  const skipUrl = new URL('../src/content/wiki/reference-skip.json', import.meta.url);
  let prev = [];
  try { prev = JSON.parse(readFileSync(skipUrl, 'utf8')); } catch { /* premier passage */ }
  writeFileSync(skipUrl, JSON.stringify([...new Set([...prev, ...failedCodes])], null, 1));
  console.log('reference-skip.json : ' + failedCodes.length + ' exemples écartés');
}

let sbad = 0;
let sn = 0;
for (const st of allSteps().filter((s) => !only || s.group === only)) {
  if (!st.check) continue;
  sn++;
  const ctxOf = async (code) => {
    const r = await eng.evalCode(code, { playMs: 0 });
    return { r, ctx: buildContext({ code, startCode: st.code, haps: r.app.haps, haps4: r.app.haps4, cps: r.cps }) };
  };
  const a = await ctxOf(st.code);
  const start = runCheck(st.check, a.ctx);
  if (start.ok && !st.trivial) { sbad++; console.log('✗ ' + st.id + ' : le code de DÉPART valide déjà l’exercice'); }
  if (!start.ok && !start.hint) { sbad++; console.log('✗ ' + st.id + ' : pas d’indice quand le code de départ échoue'); }
  if (st.solution) {
    const b = await ctxOf(st.solution);
    const sol = runCheck(st.check, b.ctx);
    if (b.r.error) { sbad++; console.log('✗ ' + st.id + ' : la solution ne s’évalue pas : ' + b.r.error); }
    else if (!sol.ok) { sbad++; console.log('✗ ' + st.id + ' : la SOLUTION ne valide pas → ' + sol.hint); }
  } else if (!st.trivial) { sbad++; console.log('✗ ' + st.id + ' : pas de solution'); }
}
console.log(`exercices : ${sn} vérifiés, ${sbad} en échec`);
await eng.close();
process.exit(bad + sbad ? 1 : 0);
