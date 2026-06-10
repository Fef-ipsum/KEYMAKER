// Keymaker — Chantier 38 : maîtrise par flash + répétition espacée (Leitner).  [build:c38-srs]
//
// Au-delà de « vu » (progress.js), deux états de maîtrise par flash :
//   practiced → l'exercice du flash a été validé par Sati (Chantier 39)
//   mastered  → une question de quiz sur ce flash a été réussie (Chantier 37)
// Un échec au quiz redescend mastered → practiced (honnêteté du suivi).
//
// Révision Leitner à 3 boîtes : box 1 = revoir à J+1, box 2 = J+3, box 3 = J+7.
// Réussite → boîte supérieure ; échec → retour box 1. Une « carte » naît au
// PREMIER résultat de quiz sur un flash (réussi : box 2 ; raté : box 1) → seuls
// les flashs réellement testés entrent dans la file. File du jour plafonnée à
// REVIEW_LIMIT (TDA-friendly : 5 max, jamais une montagne).
//
// Clés = ids STABLES des flashs ('1.4', '7.12'…) — PAS les indices m:c:f de
// progress.js : si un chapitre est inséré un jour, la maîtrise ne décale pas.
//
// La banque de questions (keymaker:quizbank) garde les quiz générés par le Pi :
// le quiz de chapitre les réutilise (zéro latence) et la révision pioche dedans
// (zéro coût IA pendant une session SRS).
//
// 100 % local (localStorage), best-effort comme progress.js : stockage absent →
// tout se dégrade en silence. Helpers PURS exportés → testables hors navigateur.

import { todayStr } from './progress.js';

const SRS_KEY = 'keymaker:srs';
const BANK_KEY = 'keymaker:quizbank';

export const BOX_DAYS = { 1: 1, 2: 3, 3: 7 };
export const REVIEW_LIMIT = 5;

/* ===========================================================================
   Stockage (localStorage, best-effort).
   Forme : { mastery: { "1.4": "practiced"|"mastered" },
             cards:   { "1.4": { box: 1|2|3, due: "YYYY-MM-DD", last: ts } } }
   =========================================================================== */
function emptyState() {
  return { mastery: {}, cards: {} };
}

export function readSrs() {
  try {
    const raw = localStorage.getItem(SRS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return {
        mastery: s && typeof s.mastery === 'object' && s.mastery ? s.mastery : {},
        cards: s && typeof s.cards === 'object' && s.cards ? s.cards : {},
      };
    }
  } catch {
    /* mode privé / JSON cassé : on repart vide */
  }
  return emptyState();
}

function writeSrs(s) {
  try {
    localStorage.setItem(SRS_KEY, JSON.stringify(s));
  } catch {
    /* non bloquant */
  }
}

/* ===========================================================================
   Helpers PURS — testables hors navigateur (node).
   =========================================================================== */

// 'YYYY-MM-DD' + n jours → 'YYYY-MM-DD' (calendrier local, pas UTC).
export function addDays(dateStr, n) {
  const [y, m, d] = String(dateStr).split('-').map((x) => parseInt(x, 10));
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + n);
  return todayStr(dt);
}

// Transition Leitner d'une carte. `card` peut être absent (premier résultat).
export function nextCard(card, correct, today) {
  const prevBox = card && Number.isInteger(card.box) ? card.box : 0;
  // Première réussite : entrée directe en box 2 (il connaît, on espace d'emblée).
  // Réussite suivante : monte (max 3). Échec : retour box 1, revue demain.
  const box = correct ? Math.min(3, Math.max(2, prevBox + 1)) : 1;
  return { box, due: addDays(today, BOX_DAYS[box]), last: Date.now() };
}

// Applique un résultat de quiz à l'état complet → NOUVEL état (pur).
export function applyResult(state, flashId, correct, today) {
  const s = state || emptyState();
  const mastery = { ...s.mastery };
  if (correct) {
    mastery[flashId] = 'mastered';
  } else if (mastery[flashId] === 'mastered') {
    mastery[flashId] = 'practiced'; // raté → on redescend d'un cran, honnêtement
  }
  const cards = { ...s.cards, [flashId]: nextCard(s.cards[flashId], correct, today) };
  return { mastery, cards };
}

// Niveau effectif d'un flash : mastered > practiced > seen > new.
// `seen` = booléen (le flash a été ouvert — vient de progress.js).
export function levelOf(flashId, state, seen) {
  const m = state && state.mastery && state.mastery[flashId];
  if (m === 'mastered') return 'mastered';
  if (m === 'practiced') return 'practiced';
  return seen ? 'seen' : 'new';
}

// Cartes dues aujourd'hui (due <= today), les plus en retard d'abord, puis les
// boîtes basses (les plus fragiles). Plafonné à `limit`.
export function dueList(state, today, limit = REVIEW_LIMIT) {
  const cards = (state && state.cards) || {};
  const due = [];
  for (const id of Object.keys(cards)) {
    const c = cards[id];
    if (c && typeof c.due === 'string' && c.due <= today) due.push({ flashId: id, box: c.box || 1, due: c.due });
  }
  due.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : (a.box || 1) - (b.box || 1)));
  return limit > 0 ? due.slice(0, limit) : due;
}

// Nombre TOTAL de cartes dues (non plafonné) — pour la carte de l'Accueil.
export function dueCountFrom(state, today) {
  return dueList(state, today, 0).length;
}

// Compte des flashs par niveau de maîtrise (pour un récap honnête).
export function masteryCounts(state) {
  const out = { practiced: 0, mastered: 0 };
  const m = (state && state.mastery) || {};
  for (const id of Object.keys(m)) {
    if (m[id] === 'mastered') out.mastered += 1;
    else if (m[id] === 'practiced') out.practiced += 1;
  }
  return out;
}

/* ===========================================================================
   API stockage (utilisée par l'app) — lit, applique le helper pur, écrit.
   =========================================================================== */

// Résultat d'une question de quiz (initial ou révision). Renvoie le nouvel état.
export function recordQuizResult(flashId, correct, now = new Date()) {
  if (!flashId) return readSrs();
  const s = applyResult(readSrs(), flashId, !!correct, todayStr(now));
  writeSrs(s);
  return s;
}

// L'exercice du flash a été validé (Chantier 39). Ne RÉTROGRADE jamais :
// un flash mastered qui re-valide son exercice reste mastered.
export function markPracticed(flashId) {
  if (!flashId) return readSrs();
  const s = readSrs();
  if (s.mastery[flashId] !== 'mastered' && s.mastery[flashId] !== 'practiced') {
    s.mastery = { ...s.mastery, [flashId]: 'practiced' };
    writeSrs(s);
  }
  return s;
}

// File de révision du jour + compteur (lecture directe, pour l'UI).
export function todaysReview(now = new Date()) {
  const s = readSrs();
  const t = todayStr(now);
  return { due: dueList(s, t), total: dueCountFrom(s, t) };
}

/* ===========================================================================
   Banque de questions (quiz générés par le Pi, réutilisés en révision).
   Forme : { "m7:2": { questions: [...], at: ts } } — clé = module id + chapitre.
   =========================================================================== */

export function chapterKey(moduleId, chapterIndex) {
  return 'm' + moduleId + ':' + chapterIndex;
}

export function readBank() {
  try {
    const raw = localStorage.getItem(BANK_KEY);
    if (raw) {
      const b = JSON.parse(raw);
      if (b && typeof b === 'object') return b;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export function saveChapterQuiz(moduleId, chapterIndex, questions) {
  if (!Array.isArray(questions) || !questions.length) return;
  try {
    const b = readBank();
    b[chapterKey(moduleId, chapterIndex)] = { questions, at: Date.now() };
    localStorage.setItem(BANK_KEY, JSON.stringify(b));
  } catch {
    /* non bloquant */
  }
}

export function getChapterQuiz(moduleId, chapterIndex) {
  const e = readBank()[chapterKey(moduleId, chapterIndex)];
  return e && Array.isArray(e.questions) && e.questions.length ? e.questions : null;
}

// Une question de la banque pour CE flash (révision SRS). Pioche au hasard
// parmi celles qui le concernent ; null si aucune (→ l'UI passe en auto-éval).
export function questionForFlash(flashId, bank = readBank()) {
  const all = [];
  for (const k of Object.keys(bank || {})) {
    const qs = bank[k] && bank[k].questions;
    if (!Array.isArray(qs)) continue;
    for (const q of qs) if (q && q.flashId === flashId) all.push(q);
  }
  if (!all.length) return null;
  return all[Math.floor(Math.random() * all.length)];
}
