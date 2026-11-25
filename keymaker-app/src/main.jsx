// Keymaker 2 — démarrage.
// L'ordre compte : (1) la redirection des sons vers les copies locales doit être
// en place avant la création de l'éditeur ; (2) la reprise des anciennes données
// se fait avant le premier affichage.

import './lib/offline.js';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import './styles/schemas.css';
import App from './App.jsx';
import { readSettings, applySettings } from './lib/store.js';
import { runMigration } from './lib/migrate.js';
import { captureInstallPrompt } from './lib/pwa.js';
import { ensurePack } from './lib/offline.js';
import { allLegacy } from './content/legacy/index.js';
import { fondations } from './content/registry.js';

applySettings(readSettings());
captureInstallPrompt();

try {
  runMigration({
    legacy: allLegacy,
    equivalents: fondations.flatMap((c) => c.steps.map((s) => ({ id: s.id, legacy: s.legacy || [] }))),
  });
} catch {
  /* la migration ne doit jamais empêcher l'app de démarrer */
}

// Le moteur signale une erreur non rattrapée quand une banque de sons distante est
// injoignable (hors ligne). L'app s'en passe : on évite juste le bruit dans la console.
window.addEventListener('unhandledrejection', (e) => {
  const msg = String((e && e.reason && (e.reason.message || e.reason)) || '');
  if (/error loading|Failed to fetch|NetworkError|Load failed/i.test(msg)) e.preventDefault();
});

/* --- Service worker : hors ligne + mises à jour sans surprise ----------------------
   Une nouvelle version n'est jamais appliquée en plein milieu d'une étape : elle
   attend, et l'accueil propose « Mettre à jour ».                                 */
function useServiceWorker() {
  const [waiting, setWaiting] = useState(null);
  useEffect(() => {
    if (!('serviceWorker' in navigator) || import.meta.env.DEV) return undefined;
    let reg = null;
    const watch = (r) => {
      if (r.waiting && navigator.serviceWorker.controller) setWaiting(r.waiting);
      r.addEventListener('updatefound', () => {
        const sw = r.installing;
        if (!sw) return;
        sw.addEventListener('statechange', () => {
          if (sw.state === 'installed' && navigator.serviceWorker.controller) setWaiting(sw);
        });
      });
    };
    navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js', { scope: import.meta.env.BASE_URL })
      .then((r) => {
        reg = r;
        watch(r);
        ensurePack();
      })
      .catch(() => ensurePack());
    const check = () => {
      if (reg && document.visibilityState === 'visible') reg.update().catch(() => {});
    };
    document.addEventListener('visibilitychange', check);
    let reloaded = false;
    const onChange = () => {
      if (reloaded || !window.__km2Updating) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onChange);
    return () => {
      document.removeEventListener('visibilitychange', check);
      navigator.serviceWorker.removeEventListener('controllerchange', onChange);
    };
  }, []);
  const apply = () => {
    if (!waiting) return;
    window.__km2Updating = true;
    waiting.postMessage({ type: 'SKIP_WAITING' });
  };
  return { updateReady: !!waiting, applyUpdate: apply };
}

function Root() {
  const sw = useServiceWorker();
  return <App updateReady={sw.updateReady} applyUpdate={sw.applyUpdate} />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
