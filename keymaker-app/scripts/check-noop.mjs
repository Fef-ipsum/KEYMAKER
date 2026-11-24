// Cherche, dans les exemples du contenu, les transformations qui NE FONT RIEN.
//
// Pour chaque exemple, on retire une à une les transformations (.swing(…), .rev(), .iter(…)…)
// et on compare les événements produits sur 4 cycles (puis 64 pour confirmer). Si le résultat est identique sans
// elle, l'exemple montre une transformation sans effet : c'est soit une erreur (comme
// `swing(8)` sur `hh*8`), soit un cas voulu (à déclarer dans ALLOWED avec sa raison).
//
// Usage : node scripts/check-noop.mjs [--only wiki|fondations|genres|legacy]
// Sortie : un avertissement par cas suspect ; code de sortie 1 s'il y en a.
import { allExamples } from '../src/content/registry.js';
import { openEngine } from './harness.mjs';

const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;

const METHODS = [
  'swing', 'swingBy', 'rev', 'palindrome', 'iter', 'iterBack', 'ply', 'fast', 'slow', 'chunk', 'chunkBack',
  'firstOf', 'lastOf', 'every', 'off', 'superimpose', 'layer', 'jux', 'juxBy', 'echo', 'stut', 'echoWith',
  'degradeBy', 'degrade', 'undegradeBy', 'sometimes', 'sometimesBy', 'often', 'rarely', 'almostNever', 'almostAlways', 'someCycles',
  'struct', 'mask', 'euclid', 'euclidRot', 'euclidLegato', 'late', 'early', 'add', 'sub', 'transpose', 'scaleTranspose',
  'arp', 'segment', 'ribbon', 'chop', 'slice', 'splice', 'striate', 'loopAt', 'when', 'linger', 'hurry', 'range', 'rangex', 'seed',
];

// Exemples entiers à ne pas signaler : « code de l'exemple contient » → raison.
const ALLOWED_EXAMPLES = [
  ['_lead$: lead', 'leçon 6.25 : la piste lead est coupée exprès, l’exercice demande de la rétablir'],
];

// Cas voulus : « code de l'exemple contient » → raison.
const ALLOWED = [
  ['ribbon(5, 2).early(2)', 'vérifie justement que le ruban se répète'],
  ['.swing(8)', 'la leçon 7.2 montre que swing(8) ne fait rien sur hh*8'],
  ['sine.range(0,1)', 'écrit pour être explicite : sine va déjà de 0 à 1'],
];

// Retire `.name(…)` (parenthèses équilibrées, chaînes respectées) à la position i.
function removeCall(code, i, name) {
  let j = i + 1 + name.length;
  if (code[j] !== '(') return null;
  let depth = 0;
  let quote = null;
  for (; j < code.length; j++) {
    const ch = code[j];
    if (quote) {
      if (ch === '\\') j++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return code.slice(0, i) + code.slice(j + 1);
    }
  }
  return null;
}

function calls(code) {
  const out = [];
  const re = new RegExp('\\.(' + METHODS.join('|') + ')\\(', 'g');
  let m;
  while ((m = re.exec(code))) out.push({ i: m.index, name: m[1] });
  return out;
}

const sig = (res) =>
  res.haps
    .map((h) => `${Math.round(h.b * 1000)}:${Math.round(h.e * 1000)}:${JSON.stringify(h.v)}`)
    .sort()
    .join('|');

const eng = await openEngine();
const examples = allExamples().filter((e) => e.group !== 'reference' && (!only || e.group === only));
let warned = 0;
let tested = 0;
const seen = new Set();
for (const ex of examples) {
  const code = String(ex.code);
  if (seen.has(code)) continue;
  seen.add(code);
  if (ALLOWED_EXAMPLES.some(([needle]) => code.includes(needle))) continue;
  const found = calls(code);
  if (!found.length) continue;
  const base = await eng.evalCode(code, { cycles: 4, playMs: 0 });
  if (base.error || !base.haps.length) continue;
  const ref = sig(base);
  for (const c of found) {
    const without = removeCall(code, c.i, c.name);
    if (!without) continue;
    const res = await eng.evalCode(without, { cycles: 4, playMs: 0 });
    tested++;
    if (res.error || !res.haps.length) continue;
    if (sig(res) !== ref) continue;
    // Confirmation sur 64 cycles : un masque, un « lastOf(8) », un signal lent ou une section
    // d'arrange peuvent n'agir qu'après les 4 premiers.
    const [longA, longB] = [await eng.evalCode(code, { cycles: 64, playMs: 0 }), await eng.evalCode(without, { cycles: 64, playMs: 0 })];
    if (!longA.error && !longB.error && sig(longA) !== sig(longB)) continue;
    const call = code.slice(c.i, code.length - without.length + c.i);
    const ok = ALLOWED.find(([needle]) => code.includes(needle) && call.includes(needle.replace(/^.*?(\.\w+\()/, '$1')));
    if (ok) continue;
    warned++;
    console.log(`⚠ ${ex.where} : « ${call} » ne change rien\n    ${code.replace(/\n/g, ' ⏎ ').slice(0, 160)}`);
  }
}
await eng.close?.();
console.log(`transformations testées : ${tested} · sans effet : ${warned}`);
process.exit(warned ? 1 : 0);
