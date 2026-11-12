// Keymaker 2 — copie de sauvegarde de toutes les données locales, dans un fichier.
// Lecture seule : rien n'est modifié.

import { loadSnippets } from './notebook.js';
import { getDB, STORE_NOTES } from './memory.js';

async function allNotes() {
  const db = await getDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const t = db.transaction(STORE_NOTES, 'readonly');
      const r = t.objectStore(STORE_NOTES).getAll();
      r.onsuccess = () => resolve(r.result || []);
      r.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function collectAll() {
  const local = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('keymaker:') || k.startsWith('km2:'))) local[k] = localStorage.getItem(k);
    }
  } catch {
    /* stockage indisponible */
  }
  return {
    app: 'Keymaker 2',
    date: new Date().toISOString(),
    localStorage: local,
    snippets: await loadSnippets(),
    notes: await allNotes(),
  };
}

export async function exportAll() {
  const data = await collectAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'keymaker-sauvegarde-' + data.date.slice(0, 10) + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
