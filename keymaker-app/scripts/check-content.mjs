// Vérifie TOUT le contenu jouable de l'app dans le moteur réel :
//  - chaque exemple de code s'évalue sans erreur et sans son introuvable ;
//  - pour chaque étape : le code de départ ne valide PAS l'exercice,
//    et la solution fournie le valide.
// Usage : node scripts/check-content.mjs [--only fondations|wiki|genres|legacy|reference] [--quick] [--pages N]
//   --pages N : nombre de pages Chromium en parallèle (par défaut 4, ou moins si la machine
//               a moins de cœurs) ; la sortie est la même, dans le même ordre, qu'avec --pages 1.
//   --dump F  : écrit dans F, pour chaque exemple et chaque exercice, ce que le moteur a rendu
//               (erreur, messages, nombre d'événements, verdicts) : pour comparer deux passes.
//         node scripts/check-content.mjs --only reference --write-skip
//           → note les exemples OFFICIELS qui ne jouent pas dans ce moteur, pour les écarter du wiki.
import { writeFileSync, readFileSync } from 'node:fs';
import { openEngines } from './harness.mjs';
import { buildContext, runCheck } from '../src/lib/check.js';
import { allExamples, allSteps } from '../src/content/registry.js';

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const quick = process.argv.includes('--quick');
const dumpTo = process.argv.includes('--dump') ? process.argv[process.argv.indexOf('--dump') + 1] : null;
const dump = [];
const pool = await openEngines();
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
const playMs = quick ? 250 : 900;
await pool.map(examples, async (eng, ex) => {
  let r = await eng.evalCode(ex.code, { playMs });
  if (isNet(r)) r = await eng.evalCode(ex.code, { playMs });
  return r;
}, (r, ex) => {
  n++;
  if (dumpTo) dump.push({ where: ex.where, error: r.error, logs: r.logs, haps: r.haps.length, haps4: r.app.haps4.length, cps: r.cps });
  if (isNet(r)) {
    net++;
    console.log('⚠ ' + ex.where + ' : réseau indisponible, exemple non vérifié');
    return;
  }
  if (r.error) fail(ex, 'ERREUR : ' + r.error + '\n    code : ' + brief(ex.code));
  else if (r.logs.length) fail(ex, 'JOURNAL : ' + r.logs.join(' | ').slice(0, 300));
  else if (!r.haps.length && !r.app.haps4.length) fail(ex, 'AUCUN SON sur 4 cycles\n    code : ' + brief(ex.code));
});
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
const steps = allSteps().filter((s) => (!only || s.group === only) && s.check);
// Chaque page vérifie une étape entière (départ puis solution) et rend ses messages ;
// on les affiche ensuite dans l'ordre des étapes.
await pool.map(steps, async (eng, st) => {
  const out = [];
  const seen = { id: st.id };
  const ctxOf = async (code) => {
    const r = await eng.evalCode(code, { playMs: 0 });
    return { r, ctx: buildContext({ code, startCode: st.code, haps: r.app.haps, haps4: r.app.haps4, cps: r.cps }) };
  };
  const a = await ctxOf(st.code);
  const start = runCheck(st.check, a.ctx);
  seen.start = { ok: start.ok, hint: start.hint || '', haps4: a.r.app.haps4.length };
  if (start.ok && !st.trivial) out.push('✗ ' + st.id + ' : le code de DÉPART valide déjà l’exercice');
  if (!start.ok && !start.hint) out.push('✗ ' + st.id + ' : pas d’indice quand le code de départ échoue');
  if (st.solution) {
    const b = await ctxOf(st.solution);
    const sol = runCheck(st.check, b.ctx);
    seen.sol = { ok: sol.ok, error: b.r.error, haps4: b.r.app.haps4.length };
    if (b.r.error) out.push('✗ ' + st.id + ' : la solution ne s’évalue pas : ' + b.r.error);
    else if (!sol.ok) out.push('✗ ' + st.id + ' : la SOLUTION ne valide pas → ' + sol.hint);
  } else if (!st.trivial) out.push('✗ ' + st.id + ' : pas de solution');
  return { out, seen };
}, ({ out, seen }) => {
  sn++;
  if (dumpTo) dump.push(seen);
  sbad += out.length;
  for (const line of out) console.log(line);
});
console.log(`exercices : ${sn} vérifiés, ${sbad} en échec`);
if (dumpTo) writeFileSync(dumpTo, dump.map((x) => JSON.stringify(x)).join('\n') + '\n');
await pool.close();
process.exit(bad + sbad ? 1 : 0);
