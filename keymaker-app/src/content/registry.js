// Registre de tout le contenu de l'app.
//  - l'app s'en sert pour retrouver une étape par son identifiant ;
//  - les tests (scripts/check-content.mjs) s'en servent pour exécuter CHAQUE exemple.
import { fondations } from './fondations/index.js';
import { solutions } from './fondations/solutions.js';
import { genres, traitId } from './genres/index.js';
import { entries as wikiEntries } from './wiki/index.js';
import { defis } from './defis.js';
import { tracks, legacyChapters } from './legacy/index.js';

export { fondations, solutions, genres, tracks };

// Chapitres du parcours, tous types confondus.
export const chapters = [...fondations, ...legacyChapters];

// id d'étape → { step, chapter, index }
export const stepIndex = (() => {
  const m = new Map();
  for (const ch of chapters) ch.steps.forEach((st, i) => m.set(st.id, { step: st, chapter: ch, index: i }));
  return m;
})();
export const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c]));

// Ordre du parcours principal (pour « Continuer »).
export const fondationIds = fondations.flatMap((c) => c.steps.map((s) => s.id));
export const genreTraitIds = genres.flatMap((g) => g.traits.map((t) => traitId(g.id, t.aspect)));

// Toutes les questions (points d'étape et révisions) : id de carte → questions.
export const quizIndex = (() => {
  const m = new Map();
  for (const ch of fondations) {
    for (const st of ch.steps) {
      if (st.quiz && st.quiz.length) m.set(st.id, { questions: st.quiz, title: st.title, route: '#/etape/' + st.id });
    }
  }
  // Approfondissements : questions de legacy/quizzes.js, rattachées à leur leçon.
  for (const ch of legacyChapters) {
    for (const st of ch.steps) {
      if (st.quiz && st.quiz.length) m.set(st.id, { questions: st.quiz, title: st.title, route: '#/etape/' + st.id });
    }
  }
  // Questions « retrouve le réglage à l'oreille » : une carte de révision chacune,
  // avec un identifiant stable (oreille.…), rattachée à l'étape où vit son schéma.
  for (const ch of fondations) {
    for (const q of ch.ear || []) {
      // Une famille (ear.js) = une carte ; ses variantes sont tirées au hasard à chaque passage.
      if (m.has(q.id)) {
        m.get(q.id).questions.push(q);
        continue;
      }
      const st = ch.steps.find((x) => x.id === q.step);
      m.set(q.id, { questions: [q], title: 'À l’oreille · ' + (st ? st.title : ch.title), route: '#/etape/' + (st ? st.id : ch.steps[0].id), ear: true, chapter: ch.id });
    }
  }
  for (const g of genres) {
    for (const t of g.traits) {
      if (t.quiz && t.quiz.length) {
        m.set(traitId(g.id, t.aspect), { questions: t.quiz, title: g.name + ' · ' + t.title, route: '#/genre/' + g.id + '/' + t.aspect });
      }
    }
  }
  return m;
})();

/* ------------------------------- pour les tests ------------------------------- */

// Étapes à exercice vérifié localement.
export function allSteps() {
  const out = [];
  for (const ch of fondations) {
    for (const st of ch.steps) {
      out.push({
        group: 'fondations',
        id: st.id,
        code: st.code,
        check: st.task && st.task.check,
        solution: solutions[st.id],
        trivial: st.id === 'f.play',
      });
    }
  }
  // Approfondissements : seulement les exercices validés automatiquement (legacy/checks.js).
  for (const ch of legacyChapters) {
    for (const st of ch.steps) {
      if (st.check) out.push({ group: 'legacy', id: st.id, code: st.code, check: st.check, solution: st.solution });
    }
  }
  // Défis vérifiés : toutes les instances de tous les modèles.
  for (const d of defis) out.push({ group: 'defis', id: 'defi:' + d.key, code: d.code, check: d.check, solution: d.solution });
  return out;
}

// Tous les exemples de code : { group, where, code }.
export function allExamples() {
  const out = [];
  const add = (group, where, code) => {
    if (code && String(code).trim()) out.push({ group, where, code });
  };
  for (const ch of fondations) {
    for (const st of ch.steps) {
      add('fondations', st.id + ' (code)', st.code);
      add('fondations', st.id + ' (solution)', solutions[st.id]);
      (st.quiz || []).forEach((q, i) => add('fondations', st.id + ' (quiz ' + (i + 1) + ')', q.code));
    }
  }
  for (const g of genres) {
    for (const t of g.traits) {
      const w = 'genre ' + g.id + '/' + t.aspect;
      add('genres', w + ' (écoute)', t.hear);
      (t.build || []).forEach((b, i) => add('genres', w + ' (étape ' + (i + 1) + ')', b[1]));
      (t.quiz || []).forEach((q, i) => add('genres', w + ' (quiz ' + (i + 1) + ')', q.code));
    }
    add('genres', 'genre ' + g.id + ' (assemblage)', g.assemble && g.assemble.code);
    if (g.caseStudy && g.caseStudy.exercise) {
      add('genres', 'genre ' + g.id + ' (étude de cas)', g.caseStudy.exercise.code);
      (g.caseStudy.exercise.variants || []).forEach((v) => add('genres', 'genre ' + g.id + ' (étude de cas, ' + v.label + ')', v.code));
    }
  }
  for (const e of wikiEntries) {
    if (e.kind === 'ref') {
      (e.official ? e.official.x : []).forEach((x, i) => add('reference', 'ref ' + e.t + ' (ex. ' + (i + 1) + ')', x));
      continue;
    }
    add('wiki', 'wiki ' + e.id + ' (exemple)', e.code);
    if (e.recipe) add('wiki', 'wiki ' + e.id + ' (recette)', e.recipe.code);
    (e.vary || []).forEach((v, i) => add('wiki', 'wiki ' + e.id + ' (variation ' + (i + 1) + ')', v[1]));
    (e.use || []).forEach((u, i) => add('wiki', 'wiki ' + e.id + ' (usage ' + (i + 1) + ')', u[1]));
  }
  for (const ch of legacyChapters) {
    for (const st of ch.steps) {
      add('legacy', st.id + ' ' + st.title, st.code);
      (st.quiz || []).forEach((q, i) => add('legacy', st.id + ' (quiz ' + (i + 1) + ')', q.code));
    }
  }
  return out;
}

// Tous les schémas déclarés par le contenu : { where, spec } (leçons, wiki, questions).
export function allSchemas() {
  const out = [];
  for (const ch of fondations) {
    for (const st of ch.steps) if (st.schema) out.push({ where: st.id, spec: st.schema });
    for (const q of ch.ear || []) out.push({ where: q.id, spec: q.schema, ear: q });
  }
  for (const e of wikiEntries) if (e.schema) out.push({ where: 'wiki ' + e.id, spec: e.schema });
  return out;
}

// Liens du contenu vers le wiki : tous doivent exister.
export function allWikiLinks() {
  const out = [];
  for (const ch of fondations) {
    for (const st of ch.steps) {
      for (const id of (st.deep && st.deep.wiki) || []) out.push({ from: st.id, id });
      for (const d of (st.deep && st.deep.decode) || []) if (d[2]) out.push({ from: st.id + ' (décodage)', id: d[2] });
    }
  }
  for (const g of genres) for (const t of g.traits) for (const id of t.wiki || []) out.push({ from: 'genre ' + g.id + '/' + t.aspect, id });
  for (const e of wikiEntries) for (const id of e.see || []) out.push({ from: 'wiki ' + e.id, id });
  // Liens dans le texte : [texte](fx.lpf), partout où le contenu est rédigé.
  const scan = (from, x, depth = 0) => {
    if (depth > 8 || x == null) return;
    if (typeof x === 'string') {
      for (const m of x.matchAll(/\[([^\]]+)\]\(([a-z]+\.[\w.-]+)\)/g)) out.push({ from: from + ' (lien « ' + m[1] + ' »)', id: m[2] });
    } else if (Array.isArray(x)) x.forEach((y) => scan(from, y, depth + 1));
    else if (typeof x === 'object') for (const v of Object.values(x)) scan(from, v, depth + 1);
  };
  for (const ch of fondations) for (const st of ch.steps) scan(st.id, { ...st, code: null });
  for (const ch of fondations) for (const q of ch.ear || []) scan(q.id, q);
  for (const g of genres) scan('genre ' + g.id, g);
  for (const e of wikiEntries) if (e.kind !== 'ref') scan('wiki ' + e.id, { ...e, code: null, official: null });
  for (const ch of legacyChapters) for (const st of ch.steps) scan(st.id, { ...st, code: null });
  return out;
}
