// Vérifie l'indice « où chercher » (src/lib/hint.js), affiché au deuxième essai raté.
//  - cas écrits à la main : la bonne forme de phrase (changer, ajouter, ajouter dans un motif) ;
//  - chaque exercice qui a une solution : tout passage montré existe tel quel dans le code
//    de départ, tient debout (parenthèses et crochets équilibrés) et ne dévoile aucun mot
//    que seule la solution contient.
// Usage : node scripts/check-hints.mjs [--verbose]
import { allSteps } from '../src/content/registry.js';
import { whereToChange, balanced } from '../src/lib/hint.js';

let bad = 0;
const fail = (m) => {
  bad++;
  console.log('✗ ' + m);
};
const CASES = [
  ['note("c3 e3").s("sawtooth")', 'note("c3 e3").s("triangle")', 'change `sawtooth`'],
  ['s("bd").lpf(800)', 's("bd").lpf(400)', 'change `800`'],
  ['s("bd").lpf(1200)', 's("bd").lpf(1600)', 'change `1200`'],
  ['note("[c3,e3,g3]")', 'note("[c3,eb3,g3]")', 'change `e3`'],
  ['sound("bd hh sd hh")', 'sound("bd hh sd hh bd bd sd hh")', 'ajoute quelque chose dans le motif `"bd hh sd hh"`'],
  ['sound("hh*8")', 'sound("hh*8?")', 'change `hh*8`'],
  ['s("bd*4")', 's("bd*4").room(.5)', 'ajoute quelque chose juste après `s("bd*4")`'],
  ['$: s("bd*4")\n$: s("hh*8")', '$: s("bd*4")\n$: s("hh*16")', 'change `hh*8` (ligne 2)'],
];
for (const [a, b, want] of CASES) {
  const w = whereToChange(a, b);
  if (!w || !w.text.includes(want)) fail(`cas ${JSON.stringify(a)} → ${JSON.stringify(b)} : attendu « ${want} », obtenu « ${w ? w.text : 'rien'} »`);
}
if (whereToChange('s("bd")', 's("bd")') !== null) fail('code identique : aucun indice');

let n = 0;
let shown = 0;
for (const s of allSteps()) {
  if (!s.solution) continue;
  n++;
  const w = whereToChange(s.code, s.solution);
  if (!w) continue;
  shown++;
  if (process.argv.includes('--verbose')) console.log(s.id.padEnd(14) + w.text);
  for (const p of w.parts) {
    const t = p.text.replace(/^…/, '');
    if (!s.code.includes(t)) fail(`${s.id} : « ${p.text} » n’est pas dans le code de départ`);
    if (!balanced(t) && p.kind !== 'add') fail(`${s.id} : « ${p.text} » est coupé au milieu d’une parenthèse ou d’un crochet`);
  }
  // Aucun mot propre à la solution ne doit apparaître dans l'indice (on dit où, pas quoi).
  const words = (x) => new Set(String(x).match(/[A-Za-z_#][\w#]*|\d*\.?\d+/g) || []);
  const startW = words(s.code);
  const leak = [...words(w.text.replace(/^[^`]*/, '').replace(/\(lignes? [^)]*\)/g, ''))].filter((x) => !startW.has(x) && words(s.solution).has(x) && !/^(ligne|lignes|et|la|le|du|code|de|départ|solution|proposée|change|ajoute|quelque|chose|juste|après|dans|motif|modifie|une|au|début)$/.test(x));
  if (leak.length) fail(`${s.id} : l’indice dévoile ${leak.join(', ')}`);
}
console.log(`indices « où chercher » : ${shown} sur ${n} exercices${bad ? ' · ' + bad + ' en échec' : ''}`);
process.exit(bad ? 1 : 0);
