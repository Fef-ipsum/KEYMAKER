// Keymaker 2 — les sons hors ligne.
//
// Le moteur Strudel va chercher ses sons sur GitHub. L'app embarque une copie de
// tous ceux dont son contenu a besoin (public/samples/, construite par
// scripts/build-sample-pack.mjs). Ce module fait deux choses :
//
//   1. REDIRIGER : toute demande du moteur vers une adresse connue du pack est
//      servie par la copie locale (plus rapide, et indépendante de GitHub).
//   2. PRÉCHARGER : au premier lancement en ligne, il range tout le pack dans le
//      cache du navigateur. Ensuite, réseau coupé, chaque exemple joue.
//
// À importer AVANT le montage de l'éditeur (main.jsx) : le moteur charge ses
// cartes de sons dès sa création.

import { readJSON, writeJSON } from './store.js';

const BASE = import.meta.env.BASE_URL || '/';
const CACHE = 'km2-samples-v1';
const STATUS_KEY = 'km2:pack';
const REMOTE = /^https:\/\/(raw\.githubusercontent\.com|felixroos\.github\.io)\//;

const norm = (u) => {
  try {
    return decodeURI(String(u).split('?')[0]);
  } catch {
    return String(u);
  }
};

let manifest = null;
const nativeFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : null;

const manifestReady = nativeFetch
  ? nativeFetch(BASE + 'samples/manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (!m || !Array.isArray(m.files)) return null;
        manifest = m;
        return new Map(m.files.map((f) => [norm(f.u), BASE + 'samples/' + f.p]));
      })
      .catch(() => null)
  : Promise.resolve(null);

// 1. Redirection des adresses connues vers les copies locales.
if (nativeFetch) {
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input && input.url;
    if (url && REMOTE.test(url)) {
      const map = await manifestReady;
      const local = map && map.get(norm(url));
      if (local) {
        try {
          const r = await nativeFetch(local);
          if (r.ok) return r;
        } catch {
          /* copie locale indisponible : on tente l'adresse d'origine */
        }
      }
    }
    return nativeFetch(input, init);
  };
}

/* --- 2. Préchargement du pack ----------------------------------------------------- */
let status = { state: 'idle', done: 0, total: 0, ...readJSON(STATUS_KEY, {}) };
if (status.state === 'loading') status.state = 'idle';
const listeners = new Set();
function set(patch) {
  status = { ...status, ...patch };
  writeJSON(STATUS_KEY, status);
  listeners.forEach((cb) => cb(status));
}
export function packStatus() {
  return status;
}
export function onPack(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let running = null;
export function downloadPack() {
  if (running) return running;
  running = (async () => {
    const map = await manifestReady;
    if (!map || !manifest) return set({ state: 'idle' });
    if (!('caches' in window)) return set({ state: 'unsupported' });
    const cache = await caches.open(CACHE);
    const urls = [...map.values()];
    // Les sons qui ne font plus partie du pack (après une mise à jour) sont retirés.
    const wanted = new Set(urls.map((u) => new URL(u, window.location.href).pathname));
    for (const req of await cache.keys()) {
      if (!wanted.has(new URL(req.url).pathname)) await cache.delete(req);
    }
    const have = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
    const todo = urls.filter((u) => !have.has(new URL(u, window.location.href).pathname));
    let done = urls.length - todo.length;
    if (!todo.length) return set({ state: 'ready', done, total: urls.length, version: manifest.version });
    set({ state: 'loading', done, total: urls.length });
    let failed = 0;
    for (let i = 0; i < todo.length; i += 6) {
      if (navigator.onLine === false) {
        failed += todo.length - i;
        break;
      }
      await Promise.all(
        todo.slice(i, i + 6).map(async (u) => {
          try {
            const r = await nativeFetch(u);
            if (!r.ok) throw new Error(String(r.status));
            await cache.put(u, r);
            done++;
          } catch {
            failed++;
          }
        }),
      );
      set({ state: 'loading', done, total: urls.length });
    }
    set({ state: failed ? 'error' : 'ready', done, total: urls.length, version: manifest.version });
  })().finally(() => {
    running = null;
  });
  return running;
}

// Lancé au démarrage : sans rien demander, dès que l'app est en ligne et que le
// service worker est en place. Sans effet si le pack est déjà complet.
export function ensurePack() {
  if (typeof window === 'undefined') return;
  const start = async () => {
    const map = await manifestReady;
    if (!map || !manifest) return;
    if (status.state === 'ready' && status.version === manifest.version) return;
    if (navigator.onLine === false) return;
    downloadPack();
  };
  setTimeout(start, 2500);
  window.addEventListener('online', start);
}
