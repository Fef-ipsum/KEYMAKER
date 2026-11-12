// Keymaker — Chantiers 24 (carnet de notes par flash) & 27 (bibliothèque de snippets).
// [build:c24-notes c27-snippets]
//
// Partage la base IndexedDB 'keymaker' et la connexion `getDB()` de memory.js (une
// seule base, une seule version → pas de conflit d'ouverture). memory.js possède le
// SCHÉMA (création des stores en v2) ; ce fichier possède les OPÉRATIONS notes/snippets.
//
// Best-effort par principe (comme memory.js) : si IndexedDB est indisponible, chaque
// fonction se dégrade en no-op / valeur vide → l'app marche, simplement sans carnet.

import { getDB, STORE_NOTES, STORE_SNIPPETS } from './memory.js';

/* --- Carnet de notes (Chantier 24) — une note par flash, clé = flashKey -------- */

// Texte de la note d'un flash ('' si aucune / IndexedDB indispo).
export async function loadNote(flashKey) {
  if (!flashKey) return '';
  const db = await getDB();
  if (!db) return '';
  return new Promise((resolve) => {
    let t;
    try { t = db.transaction(STORE_NOTES, 'readonly'); } catch { resolve(''); return; }
    let out = '';
    try {
      const r = t.objectStore(STORE_NOTES).get(flashKey);
      r.onsuccess = () => { out = (r.result && r.result.text) || ''; };
    } catch { /* ignore */ }
    t.oncomplete = () => resolve(out);
    t.onerror = () => resolve('');
    t.onabort = () => resolve('');
  });
}

// Enregistre (ou supprime si vide) la note d'un flash. put = upsert (keyPath flashKey).
export async function saveNote(flashKey, text) {
  if (!flashKey) return false;
  const db = await getDB();
  if (!db) return false;
  const clean = (text || '').trim();
  return new Promise((resolve) => {
    let t;
    try { t = db.transaction(STORE_NOTES, 'readwrite'); } catch { resolve(false); return; }
    try {
      const os = t.objectStore(STORE_NOTES);
      if (clean) os.put({ flashKey, text, ts: Date.now() });
      else os.delete(flashKey); // note vidée → on retire l'entrée (pas de coquille vide)
    } catch { /* ignore */ }
    t.oncomplete = () => resolve(true);
    t.onerror = () => resolve(false);
    t.onabort = () => resolve(false);
  });
}

export async function countNotes() {
  const db = await getDB();
  if (!db) return 0;
  return new Promise((resolve) => {
    let t;
    try { t = db.transaction(STORE_NOTES, 'readonly'); } catch { resolve(0); return; }
    let n = 0;
    try { const r = t.objectStore(STORE_NOTES).count(); r.onsuccess = () => { n = r.result || 0; }; } catch { /* ignore */ }
    t.oncomplete = () => resolve(n);
    t.onerror = () => resolve(0);
    t.onabort = () => resolve(0);
  });
}

/* --- Bibliothèque de snippets (Chantier 27) ------------------------------------ */

// Tous les snippets, les plus récents d'abord.
export async function loadSnippets() {
  const db = await getDB();
  if (!db) return [];
  return new Promise((resolve) => {
    let t;
    try { t = db.transaction(STORE_SNIPPETS, 'readonly'); } catch { resolve([]); return; }
    let rows = [];
    try { const r = t.objectStore(STORE_SNIPPETS).getAll(); r.onsuccess = () => { rows = r.result || []; }; } catch { /* ignore */ }
    t.oncomplete = () => { rows.sort((a, b) => (b.ts || 0) - (a.ts || 0)); resolve(rows); };
    t.onerror = () => resolve([]);
    t.onabort = () => resolve([]);
  });
}

// Ajoute un snippet { name, code, module }. Refuse un code vide. Renvoie true/false.
export async function addSnippet(snip) {
  const code = (snip && snip.code || '').trim();
  if (!code) return false;
  const db = await getDB();
  if (!db) return false;
  return new Promise((resolve) => {
    let t;
    try { t = db.transaction(STORE_SNIPPETS, 'readwrite'); } catch { resolve(false); return; }
    try {
      t.objectStore(STORE_SNIPPETS).add({
        name: (snip.name || 'Sans nom').slice(0, 120),
        code: snip.code,
        module: snip.module != null ? snip.module : null,
        ts: Date.now(),
      });
    } catch { /* ignore */ }
    t.oncomplete = () => resolve(true);
    t.onerror = () => resolve(false);
    t.onabort = () => resolve(false);
  });
}

export async function deleteSnippet(id) {
  if (id == null) return false;
  const db = await getDB();
  if (!db) return false;
  return new Promise((resolve) => {
    let t;
    try { t = db.transaction(STORE_SNIPPETS, 'readwrite'); } catch { resolve(false); return; }
    try { t.objectStore(STORE_SNIPPETS).delete(id); } catch { /* ignore */ }
    t.oncomplete = () => resolve(true);
    t.onerror = () => resolve(false);
    t.onabort = () => resolve(false);
  });
}

export async function countSnippets() {
  const db = await getDB();
  if (!db) return 0;
  return new Promise((resolve) => {
    let t;
    try { t = db.transaction(STORE_SNIPPETS, 'readonly'); } catch { resolve(0); return; }
    let n = 0;
    try { const r = t.objectStore(STORE_SNIPPETS).count(); r.onsuccess = () => { n = r.result || 0; }; } catch { /* ignore */ }
    t.oncomplete = () => resolve(n);
    t.onerror = () => resolve(0);
    t.onabort = () => resolve(0);
  });
}
