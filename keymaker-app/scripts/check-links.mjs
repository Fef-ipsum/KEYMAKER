// Vérifications SANS navigateur : liens vers le wiki, identifiants uniques,
// conservation des 150 termes de l'ancien glossaire, noms de fonctions réels.
import { allWikiLinks, chapters, genres, fondations } from '../src/content/registry.js';
import { entries, byId, entryByNoteKey, entryForToken, countByKind, explainCode } from '../src/content/wiki/index.js';
import { CATEGORIES, termKey } from '../src/content/legacy/glossaryData.js';
import { readFileSync } from 'node:fs';

let bad = 0;
const fail = (m) => {
  bad++;
  console.log('✗ ' + m);
};

for (const l of allWikiLinks()) if (!byId[l.id]) fail('lien wiki inexistant « ' + l.id + ' » depuis ' + l.from);

const ids = new Set();
for (const e of entries) {
  if (ids.has(e.id)) fail('entrée wiki en double : ' + e.id);
  ids.add(e.id);
}
const stepIds = new Set();
for (const ch of chapters) {
  for (const s of ch.steps) {
    if (stepIds.has(s.id)) fail('étape en double : ' + s.id);
    stepIds.add(s.id);
  }
}

let terms = 0;
for (const c of CATEGORIES) {
  for (const it of c.entries) {
    terms++;
    if (!entryByNoteKey.get(termKey(c.id, it.term))) fail('terme du glossaire perdu : ' + c.id + ' / ' + it.term);
  }
}

// Chaque mot-clé « fonction » d'une entrée rédigée doit exister dans le moteur.
const facts = JSON.parse(readFileSync(new URL('./out/engine-facts.json', import.meta.url), 'utf8'));
const known = new Set([...facts.fns, ...facts.methods, 'sine', 'saw', 'tri', 'square', 'rand', 'perlin', 'isaw', 'cosine', 'const', 'let']);
const SOUNDS = new Set('bd sd hh oh cp rim lt mt ht cr rd cb sh tb sawtooth triangle pulse supersaw piano white pink brown'.split(' '));
for (const e of entries) {
  if (e.kind === 'ref' || e.kind === 'voc') continue;
  for (const t of e.tokens) {
    if (!/^[A-Za-z][\w]*$/.test(t)) continue;
    if (SOUNDS.has(t)) continue;
    if (!known.has(t)) fail('« ' + t + ' » (entrée ' + e.id + ') n’existe pas dans le moteur');
  }
  // Les « autres noms » affichés doivent aussi exister (la doc officielle en cite qui n'existent pas).
  for (const a of e.aliases || []) {
    if (/^[A-Za-z]\w*$/.test(a) && !known.has(a)) fail('« ' + a + ' », autre nom affiché pour ' + e.id + ', n’existe pas dans le moteur (à mettre dans notAliases)');
  }
}
for (const g of genres) {
  if (g.traits.length !== 8) fail('genre ' + g.id + ' : ' + g.traits.length + ' traits au lieu de 8');
  for (const t of g.traits) if (!t.short || !t.what || !t.hear) fail('genre ' + g.id + '/' + t.aspect + ' incomplet');
}
for (const ch of fondations) {
  for (const s of ch.steps) {
    if (!s.quiz || !s.quiz.length) fail(s.id + ' : pas de question');
    for (const q of s.quiz || []) if (!q.explain || q.choices.length < 2 || q.answer !== 0) fail(s.id + ' : question mal formée');
    if (!s.task || !s.task.ok) fail(s.id + ' : exercice incomplet');
  }
}
// Approfondissements : 2 ou 3 questions par chapitre (sauf ceux qui rejoignent les genres),
// bien formées, et chacune protégée par une affirmation de claims.js qui cite sa leçon.
{
  const { legacyChapters } = await import('../src/content/legacy/index.js');
  const { claims } = await import('./claims.js');
  const cited = new Set(claims.filter((c) => c.id.startsWith('qa-')).flatMap((c) => c.cites || []));
  for (const ch of legacyChapters) {
    if (ch.track === 'autres-genres') continue;
    const qs = ch.steps.filter((s) => s.quiz && s.quiz.length);
    if (qs.length < 2 || qs.length > 3) fail(ch.id + ' : ' + qs.length + ' question(s) au lieu de 2 ou 3');
    for (const s of qs) {
      for (const q of s.quiz) if (!q.explain || q.choices.length < 2 || q.answer !== 0 || !q.q || (q.type === 'ecoute' && !q.code)) fail(s.id + ' : question mal formée');
      if (!cited.has(s.id)) fail(s.id + ' : question sans affirmation « qa-… » (claims.js) qui cite la leçon');
    }
  }
}
const ex = explainCode('$: note("<c2 eb2>*2").sound("sawtooth").lpf(600).sometimes(x => x.add(note(12)))')
  .map((e) => e.id)
  .join(' ');
console.log('explainCode →', ex);
console.log(
  'wiki :', entries.length, 'entrées', JSON.stringify(countByKind()),
  '· glossaire d’origine :', terms, 'termes',
  '· cutoff→', (entryForToken('cutoff') || {}).id, '· stut→', (entryForToken('stut') || {}).id,
);
console.log(bad ? bad + ' problème(s)' : 'tout est cohérent');
process.exit(bad ? 1 : 0);
