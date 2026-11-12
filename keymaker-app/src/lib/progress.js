// Keymaker 2 — progression.
//
// Trois états par étape, qui ne reculent jamais :
//   vue     → l'étape a été ouverte
//   faite   → son exercice a été validé
//   acquise → sa question a été réussie (point d'étape ou révision) — porté par srs.js
//
// Stockage : `km2:state` = { v, steps: { id: { seen, done } }, resume, migrated }
// Aucune date de « dernier jour », aucune série : rien ici ne peut accuser.

import { readJSON, writeJSON } from './store.js';

const KEY = 'km2:state';

// Date LOCALE AAAA-MM-JJ (le « jour » de l'utilisateur, pas celui de Greenwich).
export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function empty() {
  return { v: 1, steps: {}, resume: null, migrated: 0 };
}

export function readState() {
  const s = readJSON(KEY, null);
  if (!s || typeof s !== 'object') return empty();
  return {
    v: 1,
    steps: s.steps && typeof s.steps === 'object' ? s.steps : {},
    resume: s.resume && typeof s.resume === 'object' ? s.resume : null,
    migrated: s.migrated || 0,
  };
}

export function writeState(s) {
  writeJSON(KEY, s);
}

// Abonnement minimal : les vues se rafraîchissent quand la progression change.
const listeners = new Set();
export function onProgress(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function emit() {
  for (const cb of listeners) {
    try {
      cb();
    } catch {
      /* un abonné cassé ne bloque pas les autres */
    }
  }
}

export function markSeen(id) {
  if (!id) return;
  const s = readState();
  const cur = s.steps[id] || {};
  if (!cur.seen) {
    s.steps[id] = { ...cur, seen: Date.now() };
    writeState(s);
    emit();
  }
}

export function markDone(id) {
  if (!id) return;
  const s = readState();
  const cur = s.steps[id] || {};
  if (!cur.done) {
    s.steps[id] = { seen: cur.seen || Date.now(), ...cur, done: Date.now() };
    writeState(s);
    emit();
  }
}

export function isSeen(id, s = readState()) {
  return !!(s.steps[id] && s.steps[id].seen);
}
export function isDone(id, s = readState()) {
  return !!(s.steps[id] && s.steps[id].done);
}

// Reprise en un geste : la dernière étape ouverte (route + titre affichable).
export function setResume(route, label) {
  const s = readState();
  s.resume = { route, label: label || '', ts: Date.now() };
  writeState(s);
}
export function getResume() {
  return readState().resume;
}

/* ---------------------------------------------------------------------------
   Helpers PURS (testables sans navigateur).
   --------------------------------------------------------------------------- */

// Première étape non faite d'une liste d'ids ; null si tout est fait.
export function firstNotDone(ids, state) {
  for (const id of ids) if (!(state.steps[id] && state.steps[id].done)) return id;
  return null;
}

// { done, total } pour une liste d'ids.
export function countDone(ids, state) {
  let done = 0;
  for (const id of ids) if (state.steps[id] && state.steps[id].done) done += 1;
  return { done, total: ids.length };
}
