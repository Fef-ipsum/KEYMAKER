// Keymaker 2 — petites briques partagées par les écrans :
// routage par ancre (#/…), abonnements React, tirage des questions, session « J'ai X minutes ».

import { useEffect, useState, useSyncExternalStore } from 'react';
import * as engine from './engine.js';
import { onProgress, readState, firstNotDone } from './progress.js';
import { readSrs, todaysReview } from './srs.js';
import { fondationIds, quizIndex, stepIndex, chapterById } from '../content/registry.js';

/* --- Routage -------------------------------------------------------------------
   Les adresses sont des ancres : « #/etape/f.play ». Aucun serveur n'a besoin de
   les connaître, et l'app fonctionne telle quelle hors ligne.                    */
export function parseRoute(hash) {
  const raw = String(hash || '').replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const params = Object.fromEntries(new URLSearchParams(query));
  return { name: parts[0] || 'aujourdhui', parts: parts.slice(1), params, hash: '#/' + raw };
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(hash) {
  if (window.location.hash === hash) return;
  window.location.hash = hash;
}

/* --- Abonnements ---------------------------------------------------------------- */
export function useEngine() {
  return useSyncExternalStore(engine.onEngine, engine.getEngineState);
}

// Se rafraîchit quand la progression change. Renvoie { state, srs }.
export function useProgress() {
  const [tick, setTick] = useState(0);
  useEffect(() => onProgress(() => setTick((t) => t + 1)), []);
  // eslint-disable-next-line no-unused-vars
  const _ = tick;
  return { state: readState(), srs: readSrs() };
}

let bump = null;
export function refreshProgress() {
  if (bump) bump();
}
export function useProgressBump() {
  const [, setN] = useState(0);
  useEffect(() => {
    bump = () => setN((n) => n + 1);
    return () => {
      bump = null;
    };
  }, []);
}

/* --- Où en est-on ? -------------------------------------------------------------- */
// La prochaine étape des fondations (la première qui n'est pas faite).
export function nextFondation(state = readState()) {
  const id = firstNotDone(fondationIds, state);
  return id ? stepIndex.get(id) : null;
}

export function stepRoute(id) {
  return '#/etape/' + encodeURIComponent(id);
}

// Étape suivante / précédente dans son chapitre, puis dans le chapitre suivant du même parcours.
export function neighbours(stepId) {
  const cur = stepIndex.get(stepId);
  if (!cur) return { prev: null, next: null, endOfChapter: false };
  const { chapter, index } = cur;
  const prev = index > 0 ? chapter.steps[index - 1] : null;
  const next = index < chapter.steps.length - 1 ? chapter.steps[index + 1] : null;
  return { prev, next, endOfChapter: !next, chapter, index };
}

export function levelOf(id, state, srs) {
  if (srs.mastery && srs.mastery[id] === 'mastered') return 'acquise';
  const st = state.steps[id];
  if (st && st.done) return 'faite';
  if (st && st.seen) return 'vue';
  return 'nouvelle';
}

/* --- Questions ------------------------------------------------------------------- */
// Mélange reproductible (pour que l'ordre des choix ne saute pas à chaque rendu).
export function shuffled(arr, seed) {
  const a = arr.map((v, i) => [v, i]);
  let s = (seed >>> 0) || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a; // [[valeur, indiceOrigine]]
}

// Questions d'un point d'étape : une par étape du chapitre (six au plus).
export function chapterQuestions(chapterId) {
  const ch = chapterById[chapterId];
  if (!ch) return [];
  const out = [];
  for (const st of ch.steps) {
    const q = quizIndex.get(st.id);
    if (q) out.push({ cardId: st.id, title: q.title, route: q.route, question: q.questions[0] });
  }
  return out.slice(0, 6);
}

// Révisions prêtes aujourd'hui (cinq au plus), limitées aux cartes qui ont une question écrite.
export function dueQuestions(limit = 5) {
  const { due } = todaysReview();
  const out = [];
  for (const c of due) {
    const q = quizIndex.get(c.flashId);
    if (!q) continue;
    const pick = q.questions[Math.floor(Math.random() * q.questions.length)];
    out.push({ cardId: c.flashId, title: q.title, route: q.route, question: pick });
    if (out.length >= limit) break;
  }
  return out;
}

export function dueCount() {
  const { due } = todaysReview();
  return due.filter((c) => quizIndex.has(c.flashId)).length;
}

/* --- Session « J'ai X minutes » -------------------------------------------------- */
const FLOW_KEY = 'km2:flow';

export const DURATIONS = [
  { minutes: 10, label: '10 min', sub: '1 étape' },
  { minutes: 20, label: '20 min', sub: '2 étapes' },
  { minutes: 40, label: '40 min', sub: '3 étapes + défi' },
];

// Plan d'une session : révisions prêtes, puis étapes nouvelles, puis un défi libre.
export function buildFlow(minutes, { due = dueCount(), state = readState() } = {}) {
  const items = [];
  const rev = Math.min(due, minutes >= 20 ? 5 : 3);
  if (rev > 0) items.push({ type: 'revision', label: 'Révision · ' + rev + (rev > 1 ? ' questions' : ' question'), route: '#/revision' });
  const want = minutes >= 40 ? 3 : minutes >= 20 ? 2 : 1;
  const todo = fondationIds.filter((id) => !(state.steps[id] && state.steps[id].done)).slice(0, want);
  for (const id of todo) {
    const s = stepIndex.get(id);
    items.push({ type: 'etape', id, label: s.step.title, route: stepRoute(id) });
  }
  if (minutes >= 40 || !items.length) items.push({ type: 'defi', label: 'Défi libre dans le Studio', route: '#/studio?defi=1' });
  return { minutes, items, index: 0, started: Date.now() };
}

export function readFlow() {
  try {
    const f = JSON.parse(sessionStorage.getItem(FLOW_KEY) || 'null');
    return f && Array.isArray(f.items) ? f : null;
  } catch {
    return null;
  }
}
const flowListeners = new Set();
export function writeFlow(f) {
  try {
    if (f) sessionStorage.setItem(FLOW_KEY, JSON.stringify(f));
    else sessionStorage.removeItem(FLOW_KEY);
  } catch {
    /* ignore */
  }
  flowListeners.forEach((cb) => cb());
}
export function useFlow() {
  const [, setN] = useState(0);
  useEffect(() => {
    const cb = () => setN((n) => n + 1);
    flowListeners.add(cb);
    return () => flowListeners.delete(cb);
  }, []);
  return readFlow();
}
// Passe à l'élément suivant de la session ; renvoie sa route (ou null si terminée).
export function advanceFlow() {
  const f = readFlow();
  if (!f) return null;
  const index = f.index + 1;
  if (index >= f.items.length) {
    writeFlow({ ...f, index, done: true });
    return '#/session';
  }
  writeFlow({ ...f, index });
  return f.items[index].route;
}

/* --- Défis libres (banque locale, aucune IA nécessaire) --------------------------- */
export const DEFIS = [
  { title: 'Un seul son', brief: 'Construis un rythme qui tient la route avec un seul nom de son. Varie avec la mini-notation, les variantes (`:1`, `:2`) et un effet.', code: 'sound("hh hh:1 ~ hh:2")' },
  { title: 'Le kick voyageur', brief: 'Pars d’un kick sur chaque temps, puis fais-le respirer : retire-le une fois sur quatre, ajoute un écho.', code: 'sound("bd*4").bank("RolandTR909")' },
  { title: 'Deux machines', brief: 'Le même rythme joué par deux boîtes à rythmes qui alternent à chaque cycle. Garde celle qui te fait hocher la tête.', code: 'sound("bd hh sd hh").bank("<RolandTR808 RolandTR909>")' },
  { title: 'Trois notes, pas plus', brief: 'Compose une mélodie hypnotique avec exactement trois notes. Varie le rythme, jamais les notes.', code: 'note("c3 eb3 g3").sound("piano")' },
  { title: 'Le dialogue', brief: 'Deux pistes qui se répondent : l’une pose une question dans l’aigu, l’autre répond dans le grave.', code: '$: note("c4 eb4 ~ ~").sound("triangle")\n$: note("~ ~ g2 c2").sound("sawtooth").lpf(600)' },
  { title: 'Montée d’acide', brief: 'Une ligne de basse qui tourne, un filtre qui s’ouvre lentement. Cherche le moment où ça décolle.', code: 'note("c2 c2 eb2 c2").sound("sawtooth").lpf(400).lpq(12)' },
  { title: 'Nappe du soir', brief: 'Pas de batterie : des accords longs, de la réverbération, et le temps qui s’étire.', code: 'chord("<Am F>").voicing().sound("sawtooth").lpf(1000).attack(.5).release(2).room(.8)' },
  { title: 'La gamme cachée', brief: 'Choisis une gamme et improvise un motif qui n’en sort jamais. Change de tonique au milieu.', code: 'n("0 2 4 2").scale("D:minor").sound("piano")' },
  { title: 'Le roulement', brief: 'Écris une fin de phrase : tous les quatre cycles, la batterie s’emballe.', code: 'sound("bd*2 [~ sd] hh*2 sd").lastOf(4, x => x.ply(2))' },
  { title: 'Moins, c’est plus', brief: 'Voici un rythme chargé. Retire des sons jusqu’à ce qu’il groove vraiment.', code: 'sound("bd hh sd hh bd hh sd hh, cp*4, oh*8")' },
];
export function pickDefi(n) {
  const i = Number.isInteger(n) ? n : Math.floor(Math.random() * DEFIS.length);
  return DEFIS[((i % DEFIS.length) + DEFIS.length) % DEFIS.length];
}
