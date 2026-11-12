// Keymaker — Chantier 5, tranche 2 : mémoire locale de Sati (IndexedDB).  [build:c5-t2-memory]
//
// Décidé avec Felix (3 juin 2026) : UN SEUL FIL GLOBAL (pas un fil par flash) +
// repérage AUTOMATIQUE des difficultés (« je comprends pas… »). Sati se souvient
// donc entre deux lancements ET hors-ligne — tout est 100 % local (IndexedDB),
// rien ne part sur le réseau.
//
// Best-effort par principe : si IndexedDB est indisponible (mode privé, navigateur
// exotique, quota…), CHAQUE fonction se dégrade en no-op / tableau vide → Sati
// continue de marcher, simplement sans mémoire persistante. Même philosophie que
// les try/catch autour de localStorage ailleurs dans l'app.

const DB_NAME = 'keymaker';
const DB_VERSION = 3; // v3 (Chantier 47) : répare l'index 'flashKey' des bases nées en v1 (bug B6)
const STORE_MSG = 'messages'; //  fil GLOBAL : { id++, role:'user'|'sati', text, model?, ts }
const STORE_DIFF = 'difficultes'; //  repères auto : { id++, flashKey, flashId, label, ts }  (index: flashKey)
export const STORE_NOTES = 'notes'; // Chantier 24 : carnet par flash — { flashKey (keyPath), text, ts }
export const STORE_SNIPPETS = 'snippets'; // Chantier 27 : bibliothèque — { id++, name, code, module, ts }

// L'historique RENVOYÉ AU PI est borné : le fil affiché/stocké garde tout, mais on
// n'envoie que les derniers tours → sinon on alourdirait chaque requête (coût +
// latence) sans bénéfice. La mémoire « longue » passe par les difficultés repérées
// (et, plus tard, par les embeddings côté Pi — tranche 3).
export const MAX_HISTORY_PAIRS = 8;

/* ===========================================================================
   Couche IndexedDB — ouverture paresseuse, mémoïsée, JAMAIS rejetée.
   getDB() résout soit la base, soit `null` (→ tout le reste se dégrade).
   =========================================================================== */
let dbPromise = null;

export function getDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    let idb;
    try {
      idb = globalThis.indexedDB;
    } catch {
      idb = null;
    }
    if (!idb) {
      resolve(null);
      return;
    }
    let req;
    try {
      req = idb.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_MSG)) {
        db.createObjectStore(STORE_MSG, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_DIFF)) {
        const s = db.createObjectStore(STORE_DIFF, { keyPath: 'id', autoIncrement: true });
        s.createIndex('flashKey', 'flashKey', { unique: false });
      }
      // B6 (v3) : une base née en v1 avait le store SANS l'index (la migration v2
      // ne re-vérifiait pas). On le crée a posteriori via la transaction d'upgrade.
      try {
        const st = req.transaction.objectStore(STORE_DIFF);
        if (!st.indexNames.contains('flashKey')) st.createIndex('flashKey', 'flashKey', { unique: false });
      } catch { /* store tout juste créé ci-dessus : index déjà posé */ }
      // Chantiers 24 & 27 (passage v1 -> v2) : on AJOUTE deux stores sans toucher
      // à 'messages'/'difficultes' → la mémoire de Sati déjà stockée est préservée.
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'flashKey' });
      }
      if (!db.objectStoreNames.contains(STORE_SNIPPETS)) {
        db.createObjectStore(STORE_SNIPPETS, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
  return dbPromise;
}

// Lance UNE requête de lecture et résout sa valeur à la fin de la transaction.
function readAll(db, store) {
  return new Promise((resolve) => {
    let t;
    try {
      t = db.transaction(store, 'readonly');
    } catch {
      resolve(null);
      return;
    }
    let out = null;
    try {
      const r = t.objectStore(store).getAll();
      r.onsuccess = () => {
        out = r.result;
      };
    } catch {
      /* ignore */
    }
    t.oncomplete = () => resolve(out);
    t.onerror = () => resolve(null);
    t.onabort = () => resolve(null);
  });
}

function countStore(db, store) {
  return new Promise((resolve) => {
    let t;
    try {
      t = db.transaction(store, 'readonly');
    } catch {
      resolve(0);
      return;
    }
    let n = 0;
    try {
      const r = t.objectStore(store).count();
      r.onsuccess = () => {
        n = r.result || 0;
      };
    } catch {
      /* ignore */
    }
    t.oncomplete = () => resolve(n);
    t.onerror = () => resolve(0);
    t.onabort = () => resolve(0);
  });
}

/* --- Fil global ---------------------------------------------------------- */

// Renvoie le fil complet, ordonné (du plus ancien au plus récent).
export async function loadThread() {
  const db = await getDB();
  if (!db) return [];
  const rows = await readAll(db, STORE_MSG);
  if (!Array.isArray(rows)) return [];
  rows.sort((a, b) => (a.id || 0) - (b.id || 0));
  return rows;
}

// Persiste UNE paire propre (user → sati) en une seule transaction. On ne stocke
// QUE les échanges complets et réussis (texte non vide des deux côtés) → la base
// ne contient jamais de tours en erreur/interrompus, et reste alternée par nature.
export async function appendExchange(userText, sati) {
  const u = (userText || '').trim();
  const a = ((sati && sati.text) || '').trim();
  if (!u || !a) return false;
  const db = await getDB();
  if (!db) return false;
  const now = Date.now();
  return new Promise((resolve) => {
    let t;
    try {
      t = db.transaction(STORE_MSG, 'readwrite');
    } catch {
      resolve(false);
      return;
    }
    try {
      const os = t.objectStore(STORE_MSG);
      os.add({ role: 'user', text: u, ts: now });
      os.add({ role: 'sati', text: a, model: (sati && sati.model) || null, ts: now });
    } catch {
      /* ignore */
    }
    t.oncomplete = () => resolve(true);
    t.onerror = () => resolve(false);
    t.onabort = () => resolve(false);
  });
}

/* --- Difficultés repérées ------------------------------------------------ */

// Renvoie les repères, les plus récents d'abord (max `limit`).
export async function loadDifficulties(limit = 20) {
  const db = await getDB();
  if (!db) return [];
  const rows = await readAll(db, STORE_DIFF);
  if (!Array.isArray(rows)) return [];
  rows.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  return rows.slice(0, limit);
}

// Enregistre (ou rafraîchit) un repère de difficulté. DEDUPE par `flashKey` :
// on garde UN repère par flash, à la date la plus récente → la liste reste courte
// et utile, pas un journal de chaque soupir.
export async function recordDifficulty(marker) {
  if (!marker || !marker.flashKey) return false;
  const db = await getDB();
  if (!db) return false;
  const ts = marker.ts || Date.now();
  return new Promise((resolve) => {
    let t;
    try {
      t = db.transaction(STORE_DIFF, 'readwrite');
    } catch {
      resolve(false);
      return;
    }
    const os = t.objectStore(STORE_DIFF);
    try {
      const idx = os.index('flashKey');
      const q = idx.getAll(marker.flashKey);
      q.onsuccess = () => {
        const found = q.result && q.result[0];
        const rec = {
          ...(found || {}),
          flashKey: marker.flashKey,
          flashId: marker.flashId != null ? marker.flashId : (found && found.flashId) || null,
          label: marker.label || (found && found.label) || '',
          ts,
        };
        try {
          os.put(rec); // put : crée si pas d'id, met à jour si l'id existe déjà
        } catch {
          /* ignore */
        }
      };
    } catch {
      // Pas d'index (ne devrait pas arriver) : on ajoute simplement.
      try {
        os.add({ flashKey: marker.flashKey, flashId: marker.flashId || null, label: marker.label || '', ts });
      } catch {
        /* ignore */
      }
    }
    t.oncomplete = () => resolve(true);
    t.onerror = () => resolve(false);
    t.onabort = () => resolve(false);
  });
}

/* --- Réglages mémoire (Settings) ----------------------------------------- */

// Efface TOUTE la mémoire locale de Sati (fil + difficultés). Action destructive
// → l'UI demande confirmation avant d'appeler ceci.
export async function clearAllMemory() {
  const db = await getDB();
  if (!db) return false;
  return new Promise((resolve) => {
    let t;
    try {
      t = db.transaction([STORE_MSG, STORE_DIFF], 'readwrite');
    } catch {
      resolve(false);
      return;
    }
    try {
      t.objectStore(STORE_MSG).clear();
      t.objectStore(STORE_DIFF).clear();
    } catch {
      /* ignore */
    }
    t.oncomplete = () => resolve(true);
    t.onerror = () => resolve(false);
    t.onabort = () => resolve(false);
  });
}

// Efface UNIQUEMENT le fil de conversation courant (store 'messages'), en
// PRÉSERVANT les difficultés repérées (mémoire longue locale) ET le journal
// distant côté Pi. C'est le « Nouvelle conversation » du tiroir Sati (Chantier 33) :
// on repart d'un fil vierge sans amnésie — Sati se souvient toujours des points durs.
export async function clearThread() {
  const db = await getDB();
  if (!db) return false;
  return new Promise((resolve) => {
    let t;
    try {
      t = db.transaction(STORE_MSG, 'readwrite');
    } catch {
      resolve(false);
      return;
    }
    try {
      t.objectStore(STORE_MSG).clear();
    } catch {
      /* ignore */
    }
    t.oncomplete = () => resolve(true);
    t.onerror = () => resolve(false);
    t.onabort = () => resolve(false);
  });
}

// Compteurs pour l'écran Réglages.
export async function countMemory() {
  const db = await getDB();
  if (!db) return { messages: 0, difficultes: 0 };
  const messages = await countStore(db, STORE_MSG);
  const difficultes = await countStore(db, STORE_DIFF);
  return { messages, difficultes };
}

/* ===========================================================================
   Helpers PURS (sans IndexedDB) — testables hors navigateur.
   =========================================================================== */

// Normalise pour la détection : minuscules, accents retirés (table explicite, sans
// dépendre des marques combinantes — robuste au transfert de fichiers), apostrophes
// → espace, espaces compactés.
const ACCENTS = {
  à: 'a', â: 'a', ä: 'a', á: 'a', ã: 'a',
  ç: 'c',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  î: 'i', ï: 'i', í: 'i',
  ô: 'o', ö: 'o', ó: 'o', õ: 'o',
  ù: 'u', û: 'u', ü: 'u', ú: 'u',
   ÿ: 'y', ñ: 'n', œ: 'oe', æ: 'ae',
};
function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[àâäáãçèéêëîïíôöóõùûüúÿñœæ]/g, (c) => ACCENTS[c] || c)
    .replace(/['’`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tournures de confusion en français (volontairement CONSERVATEUR : mieux vaut
// rater un repère que d'en poser un faux). Testé sur le texte normalisé ci-dessus.
const DIFFICULTY_RE = new RegExp(
  '\\b(' +
    'comprends? (pas|rien)|pas compris|rien compris|compris rien|' +
    'pige (pas|rien)|capte (pas|rien)|' +
    'pas (tres )?clair|confus|flou|perdue?|' +
    'bloque|galere|je rame|arrive pas|' +
    'sais (pas|plus)|aucune idee|' +
    'trop (dur|difficile|complique|chaud)|c est (dur|difficile|complique)|' +
    'veut dire quoi|sert a quoi|comprends? plus' +
  ')\\b'
);

// Felix exprime-t-il une difficulté ? (booléen)
export function detectDifficulty(text) {
  return DIFFICULTY_RE.test(normalize(text));
}

// Clé de dédup d'un repère = module + flash.
export function difficultyKey(ctx = {}) {
  return `${ctx.moduleId != null ? ctx.moduleId : 'm?'}:${ctx.flashId != null ? ctx.flashId : '?'}`;
}

// Libellé lisible d'un repère (affiché à Felix et glissé dans le contexte de Sati).
export function difficultyLabel(ctx = {}) {
  const fl = ctx.flashId ? `Flash ${ctx.flashId}` : 'Flash ?';
  const ti = ctx.flashTitle ? ` « ${ctx.flashTitle} »` : '';
  const ch = ctx.chapterTitle ? ` (Ch.${ctx.chapterNumber != null ? ctx.chapterNumber : '?'} ${ctx.chapterTitle})` : '';
  return `${fl}${ti}${ch}`;
}

// Construit le repère à enregistrer à partir du contexte courant de l'app.
export function makeDifficultyMarker(ctx = {}, ts = Date.now()) {
  return {
    flashKey: difficultyKey(ctx),
    flashId: ctx.flashId != null ? ctx.flashId : null,
    label: difficultyLabel(ctx),
    ts,
  };
}

// Phrase de rappel (douce) pour l'écran vide du tiroir Sati. '' si rien à dire.
export function buildDifficultyRecall(diffs) {
  if (!Array.isArray(diffs) || !diffs.length) return '';
  const top = diffs.slice(0, 3).map((d) => d && d.label).filter(Boolean);
  if (!top.length) return '';
  return `La dernière fois, tu butais sur : ${top.join(' · ')}. Dis-moi si tu veux qu'on y revienne.`;
}
