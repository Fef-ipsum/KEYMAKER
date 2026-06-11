// Keymaker — Chantier 56 (11 juin 2026) : notes mnémotechniques du glossaire.
//
// Felix veut pouvoir ANNOTER les termes : coller une petite astuce perso à côté
// d'une définition (« le moyen mnémotechnique qui marche pour MOI »). 100 % local
// (localStorage), best-effort comme progress.js / srs.js : stockage absent → tout
// se dégrade en silence, l'app marche, simplement sans notes.
//
// Forme stockée : { "<termKey>": "ma note", ... } sous keymaker:glossnotes.
// La clé d'un terme vient de glossaryData.termKey(catId, term) → stable même si on
// réécrit la définition (tant que le terme garde son libellé). On stocke directement
// par clé pour ne dépendre d'aucun ordre.
//
// Helpers PURS (upsert/remove sur un objet) exportés → testables hors navigateur.

const NOTES_KEY = 'keymaker:glossnotes';

function read() {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
    }
  } catch {
    /* mode privé / JSON cassé : on repart vide */
  }
  return {};
}

function write(o) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(o));
  } catch {
    /* non bloquant */
  }
}

/* ===========================================================================
   Helpers PURS (sans localStorage) — testables hors navigateur.
   =========================================================================== */

// Pose/écrase une note pour une clé. Texte vide ou blanc → supprime l'entrée
// (pas de notes fantômes). Renvoie un NOUVEL objet (immutable).
export function upsertNote(map, key, text) {
  const next = { ...(map || {}) };
  const t = String(text == null ? '' : text).trim();
  if (!key) return next;
  if (t) next[key] = t;
  else delete next[key];
  return next;
}

// Retire une note.
export function removeNote(map, key) {
  const next = { ...(map || {}) };
  delete next[key];
  return next;
}

/* ===========================================================================
   API stockage réel (appelée par l'app).
   =========================================================================== */

// Tout l'objet { key: note } — pour hydrater le composant une fois au montage.
export function readNotes() {
  return read();
}

// Note d'une clé (chaîne vide si absente).
export function getNote(key) {
  const o = read();
  return (key && o[key]) || '';
}

// Enregistre (ou supprime si vide) et renvoie l'objet à jour.
export function setNote(key, text) {
  const next = upsertNote(read(), key, text);
  write(next);
  return next;
}

// Nombre de notes posées (petit indicateur d'UI).
export function countNotes() {
  return Object.keys(read()).length;
}
