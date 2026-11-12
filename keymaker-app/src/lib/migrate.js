// Keymaker 2 — reprise des données de l'ancienne app.
//
// RÈGLE : on LIT les anciennes clés, on n'en supprime ni n'en réécrit aucune.
//   keymaker:progress  { seen: { "m:c:f": ts }, days }   → étapes vues
//   keymaker:srs       { mastery: { "1.4": … }, cards }  → étapes faites / acquises + cartes
// La migration ne s'exécute qu'une fois (km2:state.migrated) et peut être rejouée sans
// dommage : elle ne fait qu'AJOUTER des états, jamais en retirer.
//
// planMigration() est PURE (testable sans navigateur) ; runMigration() l'applique.

import { readJSON, writeJSON } from './store.js';
import { readState, writeState } from './progress.js';

// oldProgress, oldSrs : contenus des anciennes clés.
// legacy : [{ m, c, f, flashId, id }] — tous les anciens flashs (content/legacy).
// equivalents : [{ id (nouvelle étape), legacy: ["module:flashId", …] }].
export function planMigration({ oldProgress, oldSrs, legacy, equivalents, now = Date.now() }) {
  const seen = (oldProgress && oldProgress.seen) || {};
  const mastery = (oldSrs && oldSrs.mastery) || {};
  const cards = (oldSrs && oldSrs.cards) || {};

  const byIndex = new Map(legacy.map((l) => [l.m - 1 + ':' + l.c + ':' + l.f, l]));
  const byFlashId = new Map();
  for (const l of legacy) {
    if (!byFlashId.has(l.flashId)) byFlashId.set(l.flashId, []);
    byFlashId.get(l.flashId).push(l);
  }

  // 1) Étapes vues : la clé « m:c:f » est sans ambiguïté.
  const steps = {}; // id → { seen, done }
  const seenIds = new Set();
  for (const key of Object.keys(seen)) {
    const l = byIndex.get(key);
    if (!l) continue;
    seenIds.add(l.id);
    steps[l.id] = { seen: seen[key] || now };
  }

  // 2) Maîtrise et cartes : l'ancien identifiant (« 2.3 ») peut désigner plusieurs
  //    leçons. On l'attribue à celles qui ont été ouvertes ; à défaut, à toutes.
  const newMastery = {};
  const newCards = {};
  const targetsOf = (flashId) => {
    const cands = byFlashId.get(flashId) || [];
    const opened = cands.filter((l) => seenIds.has(l.id));
    return opened.length ? opened : cands;
  };
  for (const flashId of Object.keys(mastery)) {
    for (const l of targetsOf(flashId)) {
      steps[l.id] = { seen: (steps[l.id] && steps[l.id].seen) || now, done: now };
      newMastery[l.id] = mastery[flashId];
    }
  }
  for (const flashId of Object.keys(cards)) {
    for (const l of targetsOf(flashId)) newCards[l.id] = cards[flashId];
  }

  // 3) Report sur les étapes équivalentes du nouveau parcours.
  //    Les cartes ne sont PAS reportées : les nouvelles étapes ont leurs propres questions.
  const rank = { practiced: 1, mastered: 2 };
  for (const eq of equivalents) {
    let s = null;
    let d = null;
    let m = null;
    for (const ref of eq.legacy || []) {
      const [mod, flashId] = ref.split(':');
      const l = legacy.find((x) => String(x.m) === mod && x.flashId === flashId);
      if (!l || !steps[l.id]) continue;
      s = s || steps[l.id].seen || now;
      if (steps[l.id].done) d = d || steps[l.id].done;
      const lm = newMastery[l.id];
      if (lm && (!m || rank[lm] > rank[m])) m = lm;
    }
    if (s) {
      steps[eq.id] = { seen: s, ...(d ? { done: d } : {}) };
      if (m) newMastery[eq.id] = m;
    }
  }
  return { steps, mastery: newMastery, cards: newCards };
}

export function runMigration({ legacy, equivalents }) {
  const state = readState();
  if (state.migrated) return { ran: false };
  const oldProgress = readJSON('keymaker:progress', null);
  const oldSrs = readJSON('keymaker:srs', null);
  const plan = planMigration({ oldProgress, oldSrs, legacy, equivalents });

  // Étapes : on n'écrase jamais un état déjà présent.
  for (const [id, st] of Object.entries(plan.steps)) {
    const cur = state.steps[id] || {};
    state.steps[id] = { ...st, ...cur };
  }
  state.migrated = Date.now();
  writeState(state);

  // Maîtrise et cartes : AJOUT de nouvelles clés dans keymaker:srs, les anciennes restent.
  if (oldSrs && (Object.keys(plan.mastery).length || Object.keys(plan.cards).length)) {
    const srs = {
      mastery: { ...plan.mastery, ...(oldSrs.mastery || {}) },
      cards: { ...plan.cards, ...(oldSrs.cards || {}) },
    };
    writeJSON('keymaker:srs', srs);
  }
  return { ran: true, steps: Object.keys(plan.steps).length, mastery: Object.keys(plan.mastery).length };
}
