// Keymaker 2 — qui « possède » l'éditeur en ce moment ?
//
// Il n'y a qu'un éditeur. Chaque écran qui s'en sert (étape, trait de genre, Studio)
// en prend possession avec une clé. On garde en mémoire le code de chaque clé :
// ouvrir le wiki ou changer d'écran puis revenir ne fait rien perdre.

import * as engine from './engine.js';
import { buildContext } from './check.js';
import { readJSON, writeJSON } from './store.js';

const CODE_KEY = 'km2:code'; // { key, code } — le dernier code en cours, pour la reprise
const codes = new Map();
let owner = null; // { key, startCode, onRan }
const listeners = new Set();

(function restore() {
  const saved = readJSON(CODE_KEY, null);
  if (saved && saved.key && typeof saved.code === 'string') codes.set(saved.key, saved.code);
})();

function emit() {
  for (const cb of listeners) {
    try {
      cb(owner);
    } catch {
      /* ignore */
    }
  }
}
export function onOwner(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getOwner() {
  return owner;
}

// Mémorise le code de l'écran qu'on quitte.
function remember() {
  if (!owner || engine.isPreviewing()) return;
  const code = engine.getCode();
  if (code && code !== '// LOADING') {
    codes.set(owner.key, code);
    writeJSON(CODE_KEY, { key: owner.key, code });
  }
}

// Prend possession de l'éditeur. `fresh: true` force le code fourni (étapes de
// reconstruction d'un genre, « Réinitialiser »).
export function claim({ key, code, onRan, onError, fresh = false }) {
  if (engine.isPreviewing()) engine.endPreview();
  if (owner && owner.key === key && !fresh) {
    owner = { ...owner, onRan, onError };
    emit();
    return;
  }
  remember();
  engine.stop();
  engine.clearError();
  const start = code || '';
  const current = fresh ? start : codes.has(key) ? codes.get(key) : start;
  owner = { key, startCode: start, onRan, onError };
  codes.set(key, current);
  engine.setCode(current);
  emit();
}

export function release(key) {
  if (owner && owner.key === key) {
    remember();
    engine.stop();
    owner = null;
    emit();
  }
}

export function resetCode() {
  if (!owner) return;
  engine.stop();
  engine.clearError();
  codes.set(owner.key, owner.startCode);
  engine.setCode(owner.startCode);
  emit();
}

export function loadCode(code, { play = false } = {}) {
  if (!owner) return;
  if (engine.isPreviewing()) engine.endPreview();
  engine.clearError();
  codes.set(owner.key, code);
  engine.setCode(code);
  if (play) engine.run();
}

// Une évaluation a échoué (faute de frappe…) : l'écran en cours en est prévenu.
engine.onEvalFailed((error) => {
  if (!owner || engine.isPreviewing() || typeof owner.onError !== 'function') return;
  try {
    owner.onError(error);
  } catch {
    /* ignore */
  }
});

// Appelé par engine quand un code vient d'être évalué avec succès (bouton ou clavier).
engine.onEvaluated(() => {
  if (!owner || engine.isPreviewing()) return;
  remember();
  if (typeof owner.onRan !== 'function') return;
  const code = engine.getCode();
  const ctx = buildContext({
    code,
    startCode: owner.startCode,
    haps: engine.queryHaps(0, 1),
    haps4: engine.queryHaps(0, 4),
    cps: engine.currentCps(),
  });
  try {
    owner.onRan(ctx);
  } catch {
    /* un écran cassé ne bloque pas la lecture */
  }
});

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', remember);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') remember();
  });
}
