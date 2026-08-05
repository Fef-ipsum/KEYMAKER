// Keymaker — Chantier 42 (S3) : sessions réelles.  [build:c42-sessions]
//
// La table keymaker.sessions existait depuis le Chantier 4 avec 0 ligne (bug B4
// de l'audit) : le backend avait les routes, le front n'appelait jamais. Ce
// module la réveille : il mesure le temps RÉELLEMENT actif (onglet visible),
// collecte les flashs ouverts, et envoie UNE session par chargement de page
// quand l'app passe en arrière-plan ou se ferme (fetch keepalive — survit à la
// fermeture, contrairement à un fetch normal ; CORS géré par le hook du Pi).
//
// Chantier 61 : FILE D'ATTENTE HORS-LIGNE. Une session qui ne peut pas partir
// (appareil hors ligne, Pi injoignable) est gardée en localStorage et renvoyée
// au prochain démarrage en ligne / au retour du réseau → plus de sessions
// perdues dans le train. Plafond bas (20) : c'est un journal, pas une dette.
//
// Ça nourrit : les stats honnêtes (P4), les résumés de progression de Sati, et
// le morning-report du Personal OS (C2 — lecture seule, déclarée au contrat).
//
// Best-effort intégral : sans réseau ou sans Pi, rien ne casse, rien ne bloque.

const MIN_SECONDS = 60; // en dessous d'une minute active, pas la peine de journaliser

const QUEUE_KEY = 'keymaker:sessionQueue'; // Chantier 61 : sessions en attente
const QUEUE_MAX = 20;

let getCtx = null;        // () => ({ piUrl, moduleId }) — fourni par App au boot
let visibleSince = null;  // ts du dernier passage « visible » (null si caché)
let activeMs = 0;         // temps cumulé onglet visible
let sent = false;         // une seule session envoyée par chargement de page
const flashes = new Set();

// Appelé par App à chaque flash affiché (même endroit que markSeen).
export function trackFlash(flashId) {
  try { if (flashId) flashes.add(String(flashId)); } catch { /* ignore */ }
}

function settle() {
  if (visibleSince != null) {
    activeMs += Date.now() - visibleSince;
    visibleSince = null;
  }
}

// Durée active en secondes (exportée pure pour les tests : on lui passe l'état).
export function activeSeconds(ms = activeMs, since = visibleSince, now = Date.now()) {
  return Math.round((ms + (since != null ? now - since : 0)) / 1000);
}

/* --- File d'attente hors-ligne (Chantier 61) ------------------------------ */

function readQueue() {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    return Array.isArray(q) ? q : [];
  } catch { return []; }
}

function writeQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-QUEUE_MAX))); } catch { /* ignore */ }
}

function enqueue(payload) {
  const q = readQueue();
  q.push(payload);
  writeQueue(q);
}

function piBase() {
  const ctx = (getCtx && getCtx()) || {};
  let base = (ctx.piUrl || '').trim();
  while (base.endsWith('/')) base = base.slice(0, -1);
  return base;
}

// Renvoie les sessions en attente (au boot en ligne + au retour du réseau).
// Optimiste : on vide la file, ce qui échoue se ré-enfile.
function drainQueue() {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    const q = readQueue();
    if (!q.length) return;
    const base = piBase();
    if (!base) return;
    writeQueue([]);
    for (const payload of q) {
      fetch(base + '/keymaker/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
        .then((r) => { if (!r.ok) enqueue(payload); })
        .catch(() => enqueue(payload));
    }
  } catch { /* jamais bloquant */ }
}

/* --- Envoi de la session courante ---------------------------------------- */

function flush() {
  try {
    settle();
    if (sent) return;
    const dur = Math.round(activeMs / 1000);
    if (dur < MIN_SECONDS) return;
    const ctx = (getCtx && getCtx()) || {};
    const base = piBase();
    if (!base) return;
    sent = true;
    const payload = {
      mode: 'flash',
      module_id: ctx.moduleId != null ? ctx.moduleId : null,
      flashs_vus: Array.from(flashes),
      duree_sec: dur,
    };
    // Hors ligne : inutile de tenter — directement en file (Chantier 61).
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      enqueue(payload);
      return;
    }
    // keepalive : le navigateur termine l'envoi même si la page se ferme.
    // Échec (Pi injoignable, 5xx) → file d'attente. Si la page meurt avant que
    // la promesse ne se règle, tant pis : best-effort assumé.
    fetch(base + '/keymaker/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((r) => { if (!r.ok) enqueue(payload); })
      .catch(() => enqueue(payload));
  } catch { /* jamais bloquant */ }
}

// À appeler UNE fois au boot. Mesure visible/caché + envoie à la mise en veille.
export function initSessionTracking(ctxFn) {
  getCtx = ctxFn;
  try {
    visibleSince = document.visibilityState === 'visible' ? Date.now() : null;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flush(); // passage en arrière-plan = fin de session probable (mobile surtout)
      } else if (visibleSince == null) {
        visibleSince = Date.now();
      }
    });
    window.addEventListener('pagehide', flush);
    // Chantier 61 : renvoyer les sessions restées en rade (boot + retour réseau).
    window.addEventListener('online', drainQueue);
    setTimeout(drainQueue, 4000); // après le boot, sans gêner le chargement
  } catch { /* environnement sans DOM (tests) : no-op */ }
}
