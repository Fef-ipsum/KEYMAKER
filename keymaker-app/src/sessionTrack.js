// Keymaker — Chantier 42 (S3) : sessions réelles.  [build:c42-sessions]
//
// La table keymaker.sessions existait depuis le Chantier 4 avec 0 ligne (bug B4
// de l'audit) : le backend avait les routes, le front n'appelait jamais. Ce
// module la réveille : il mesure le temps RÉELLEMENT actif (onglet visible),
// collecte les flashs ouverts, et envoie UNE session par chargement de page
// quand l'app passe en arrière-plan ou se ferme (fetch keepalive — survit à la
// fermeture, contrairement à un fetch normal ; CORS géré par le hook du Pi).
//
// Ça nourrit : les stats honnêtes (P4), les résumés de progression de Sati, et
// le morning-report du Personal OS (C2 — lecture seule, déclarée au contrat).
//
// Best-effort intégral : sans réseau ou sans Pi, rien ne casse, rien ne bloque.

const MIN_SECONDS = 60; // en dessous d'une minute active, pas la peine de journaliser

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

function flush() {
  try {
    settle();
    if (sent) return;
    const dur = Math.round(activeMs / 1000);
    if (dur < MIN_SECONDS) return;
    const ctx = (getCtx && getCtx()) || {};
    let base = (ctx.piUrl || '').trim();
    while (base.endsWith('/')) base = base.slice(0, -1);
    if (!base) return;
    sent = true;
    const body = JSON.stringify({
      mode: 'flash',
      module_id: ctx.moduleId != null ? ctx.moduleId : null,
      flashs_vus: Array.from(flashes),
      duree_sec: dur,
    });
    // keepalive : le navigateur termine l'envoi même si la page se ferme.
    fetch(base + '/keymaker/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => { /* best-effort */ });
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
  } catch { /* environnement sans DOM (tests) : no-op */ }
}
