// Les anciens modules, présentés comme APPROFONDISSEMENTS optionnels.
//
// Leur texte vient de l'ancienne app (lessons.js, module7.js, module8.js) ; les leçons
// marquées `rich: true` ont été réécrites (texte précis, liens vers le wiki). Cet
// adaptateur les met à la forme des étapes de Keymaker 2 et leur donne des
// identifiants sans collision : « L4.4.6 » = module 4, leçon 4.6.
// (Dans l'ancienne app, « 4.1 » existait à la fois au module 1 et au module 4.)
//
// Les modules 1 et 2 ne sont plus affichés : le parcours « Les fondations » les
// remplace. Ils restent dans `allLegacy` pour reporter la progression (migration).

import { modules } from './lessons.js';
import { legacyChecks } from './checks.js';
import { legacyQuizzes } from './quizzes.js';

const lid = (m, flashId) => 'L' + m + '.' + flashId;

function adapt(m, chapterIndex, flashInChapter, f) {
  return {
    id: lid(m, f.id),
    isLegacy: true,
    title: f.title,
    kicker: f.kicker,
    listen: f.concept,
    code: f.code || '',
    decode: f.decode || [],
    theory: f.theory || null,
    exercise: f.exercise || '',
    free: f.free || '',
    recap: f.recap || null,
    culture: f.culture || null,
    // Leçon réécrite (lot de réécriture 2026) : son texte utilise le mini-format de Rich.
    rich: !!f.rich,
    // Tableau récapitulatif, « Pour aller plus loin » et « À écouter » réécrits au format Rich.
    richRecap: !!f.richRecap,
    // Validation automatique de l'exercice, si elle existe (checks.js) ; sinon « C'est fait ».
    check: legacyChecks[lid(m, f.id)]?.check || null,
    solution: legacyChecks[lid(m, f.id)]?.solution || '',
    ok: legacyChecks[lid(m, f.id)]?.ok || '',
    // Questions du point d'étape et de la révision (quizzes.js).
    quiz: legacyQuizzes[lid(m, f.id)] || null,
    // Clé des notes par leçon de l'ancienne app (IndexedDB, magasin « notes »).
    noteKey: m - 1 + ':' + chapterIndex + ':' + flashInChapter,
  };
}

// Tous les anciens flashs, pour la migration : { m, c, f, flashId, id }.
export const allLegacy = [];
modules.forEach((mod, mi) => {
  (mod.chapitres || []).forEach((ch, ci) => {
    (ch.flashs || []).forEach((f, fi) => {
      allLegacy.push({ m: mi + 1, c: ci, f: fi, flashId: f.id, id: lid(mi + 1, f.id) });
    });
  });
});

function track(id, title, goal, m, keepChapters) {
  const mod = modules[m - 1];
  const chapters = (mod.chapitres || [])
    .map((ch, ci) => ({ ch, ci }))
    .filter(({ ci }) => !keepChapters || keepChapters.includes(ci))
    .map(({ ch, ci }) => ({
      id: id + '-' + ci,
      title: ch.title,
      goal: ch.subtitle || '',
      kind: 'legacy',
      steps: ch.flashs.map((f, fi) => ({ f, fi })).filter(({ f }) => f.code).map(({ f, fi }) => adapt(m, ci, fi, f)),
    }));
  return { id, title, goal, chapters };
}

export const tracks = [
  track('son', 'Sculpter le son', 'Ondes, filtres, enveloppes, espace, couleur : aller plus loin que le chapitre VI.', 4),
  track('code', 'Le code comme instrument', 'Transformer le temps, doser le hasard, accumuler des couches.', 5),
  track('composer', 'Composer un morceau', 'Pistes, variables, arrangement, mixage, jeu en direct.', 6),
  // Les chapitres Techno et Trance de l'ancien module 7 sont remplacés par la section Genres.
  // House, drum & bass et ambient ont aussi leur page dans Genres (traits) ; ces chapitres
  // gardent les morceaux complets.
  track('autres-genres', 'Autres genres', 'House, drum & bass, ambient : un morceau complet par style. Leurs traits sont aussi dans Genres.', 7, [0, 2, 4]),
  track('guitare', 'Guitare', 'Relier le manche de la guitare aux notes et aux accords.', 3),
  // Le module 8 (PO-33) n’est plus proposé : ses leçons demandaient de déposer des fichiers
  // à côté de l’app et reposaient sur un outil de synchronisation retiré. Son texte reste dans module8.js.
];

export const legacyChapters = tracks.flatMap((t) => t.chapters.map((c) => ({ ...c, track: t.id, trackTitle: t.title })));
