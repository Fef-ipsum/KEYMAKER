// Keymaker 2 — petit socle de stockage local.
//
// Tout est « au mieux » : si le navigateur refuse le stockage (mode privé,
// quota), l'app continue de marcher, simplement sans mémoire.
//
// RÈGLE DE MIGRATION : les clés de l'ancienne app (`keymaker:*`) ne sont jamais
// supprimées ni réécrites par ce fichier. Keymaker 2 écrit sous `km2:*`.

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const v = JSON.parse(raw);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readText(key, fallback = '') {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

export function writeText(key, value) {
  try {
    localStorage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

/* --- Réglages -------------------------------------------------------------
   Volontairement peu nombreux : chaque réglage est une décision de plus.   */
const SETTINGS_KEY = 'km2:settings';
export const DEFAULT_SETTINGS = {
  theme: 'auto', // 'auto' (suit l'appareil) | 'light' | 'dark'
  textScale: 'm', // 'm' | 'l' | 'xl'
  reduceMotion: 'auto', // 'auto' (suit l'appareil) | 'on'
  dial: true, // afficher le cadran du cycle sous l'éditeur
  chime: true, // petit son de validation
};

export function readSettings() {
  return { ...DEFAULT_SETTINGS, ...readJSON(SETTINGS_KEY, {}) };
}

export function writeSettings(s) {
  writeJSON(SETTINGS_KEY, s);
}

// Applique thème, taille et mouvement sur <html>. Le thème « auto » ne pose
// aucun attribut : la feuille de style suit alors prefers-color-scheme.
export function applySettings(s) {
  try {
    const root = document.documentElement;
    if (s.theme === 'light' || s.theme === 'dark') root.setAttribute('data-theme', s.theme);
    else root.removeAttribute('data-theme');
    root.setAttribute('data-text', s.textScale || 'm');
    if (s.reduceMotion === 'on') root.setAttribute('data-motion', 'reduce');
    else root.removeAttribute('data-motion');
    const dark = effectiveTheme(s) === 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0c0e13' : '#e9ecf0');
  } catch {
    /* hors navigateur */
  }
}

export function effectiveTheme(s) {
  if (s.theme === 'light' || s.theme === 'dark') return s.theme;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

export function prefersReducedMotion(s) {
  if (s && s.reduceMotion === 'on') return true;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/* --- Adresse du Pi (Sati) --------------------------------------------------
   Servie par le Pi → même origine, zéro configuration. En local (localhost),
   on vise l'adresse Tailscale. L'ancienne clé est relue telle quelle.       */
const PI_URL_KEY = 'keymaker:piUrl';
export function defaultPiUrl() {
  try {
    const h = window.location.hostname;
    if (h && h !== 'localhost' && h !== '127.0.0.1') return window.location.origin;
  } catch {
    /* ignore */
  }
  return 'https://personal-os.tailac998e.ts.net';
}
export function readPiUrl() {
  return readText(PI_URL_KEY, '') || defaultPiUrl();
}
export function writePiUrl(url) {
  writeText(PI_URL_KEY, url || '');
}
