// Keymaker — Chantier 61 : PWA installable + hors-ligne lisible.  [build:c61-pwa]
//
// Trois petites responsabilités, toutes best-effort (un navigateur sans support
// → les boutons n'apparaissent simplement pas, rien ne casse) :
//
//  1. INSTALLATION — Chrome/Android ne montre pas toujours sa bannière d'install.
//     On capture l'événement `beforeinstallprompt` (qui n'arrive qu'UNE fois, tôt)
//     et on le rejoue quand Felix clique « Installer » (Accueil ou Réglages).
//     `captureInstallPrompt()` doit donc être appelé AVANT le rendu React (main.jsx).
//
//  2. DÉJÀ INSTALLÉE ? — `isStandalone()` dit si on tourne en icône (display-mode
//     standalone). Sert à remplacer le bouton par « ✓ installée ».
//
//  3. RÉSEAU — `subscribeOnline(cb)` notifie en ligne / hors ligne (navigator.onLine
//     + events window). L'app distingue ainsi « TU es hors ligne » (tout le local
//     marche, Sati attendra) de « le Pi est injoignable » (réseau OK mais pas lui).

let deferredPrompt = null;
const installListeners = new Set();

function notifyInstallable(v) {
  for (const cb of installListeners) {
    try { cb(v); } catch { /* listener cassé : on continue */ }
  }
}

// À appeler UNE fois, le plus tôt possible (main.jsx, avant le rendu).
export function captureInstallPrompt() {
  try {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // pas de mini-bannière navigateur : notre bouton décide
      deferredPrompt = e;
      notifyInstallable(true);
    });
    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      notifyInstallable(false);
    });
  } catch { /* environnement sans window (tests) : no-op */ }
}

export function canInstall() {
  return !!deferredPrompt;
}

// S'abonner aux changements d'installabilité. Renvoie la fonction de désabonnement.
export function onInstallable(cb) {
  installListeners.add(cb);
  return () => installListeners.delete(cb);
}

// Rejoue le prompt d'installation capturé.
// Renvoie 'accepted' | 'dismissed' | 'unavailable'.
export async function promptInstall() {
  const e = deferredPrompt;
  if (!e) return 'unavailable';
  try {
    e.prompt();
    const choice = await e.userChoice; // { outcome: 'accepted' | 'dismissed' }
    if (choice && choice.outcome === 'accepted') {
      deferredPrompt = null; // consommé — appinstalled suivra
      return 'accepted';
    }
    return 'dismissed'; // l'événement reste consommé côté Chrome : pas de re-prompt immédiat
  } catch {
    return 'unavailable';
  }
}

// L'app tourne-t-elle déjà en icône (PWA installée, plein écran) ?
export function isStandalone() {
  try {
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true // iOS Safari
    );
  } catch {
    return false;
  }
}

// Abonnement réseau : cb(true|false) tout de suite puis à chaque changement.
// Renvoie la fonction de désabonnement (compatible useEffect).
export function subscribeOnline(cb) {
  const emit = () => {
    try { cb(typeof navigator !== 'undefined' ? navigator.onLine !== false : true); } catch { /* ignore */ }
  };
  emit();
  try {
    window.addEventListener('online', emit);
    window.addEventListener('offline', emit);
    return () => {
      window.removeEventListener('online', emit);
      window.removeEventListener('offline', emit);
    };
  } catch {
    return () => {};
  }
}

/* --- Chantier 61 : sons hors ligne ------------------------------------- */

// Cartes de samples que le moteur Strudel (prebake) charge au boot — extraites
// du bundle vendorisé. Après UNE visite en ligne, le SW les garde (CacheFirst)
// → les banques répondent hors ligne. On les « préchauffe » explicitement car
// au TOUT PREMIER chargement, le moteur les télécharge avant que le service
// worker ne contrôle la page (course à l'activation) → sans ce coup de pouce,
// elles n'entraient en cache qu'à la 2e visite en ligne.
const SAMPLE_MAPS = [
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines-alias.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/Dirt-Samples.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/vcsl.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/mridangam.json',
  'https://raw.githubusercontent.com/tidalcycles/uzu-drumkit/main/strudel.json',
];

export function prewarmSampleMaps() {
  const warm = () => {
    try {
      if (typeof navigator === 'undefined' || navigator.onLine === false) return;
      if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
      for (const url of SAMPLE_MAPS) {
        fetch(url, { mode: 'cors' }).catch(() => { /* best-effort */ });
      }
    } catch { /* best-effort */ }
  };
  try {
    // ~4 s après le boot (le laisser respirer), 2e chance à 10 s si le SW
    // venait à peine de prendre le contrôle (cas de toute première visite).
    setTimeout(warm, 4000);
    setTimeout(warm, 10000);
  } catch { /* no-op */ }
}

// Le moteur Strudel rejette « error loading "<url>" » quand une banque de sons
// est injoignable (hors ligne, toute 1re fois). L'app tient déjà le choc — la
// banque est simplement absente ; on évite juste l'erreur non gérée qui salit
// la console et les rapports d'erreur.
export function muffleSampleLoadErrors() {
  try {
    window.addEventListener('unhandledrejection', (e) => {
      const msg = String((e && e.reason && (e.reason.message || e.reason)) || '');
      if (/error loading ["']?https?:/i.test(msg)) e.preventDefault();
    });
  } catch { /* no-op */ }
}
