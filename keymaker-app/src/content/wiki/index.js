// Le wiki, assemblé à partir de trois sources :
//   1. les entrées rédigées à la main (mini-notation, fonctions, effets, solfège, genres) ;
//   2. l'ancien glossaire de 150 termes : chaque terme non repris par une entrée
//      rédigée devient une entrée « vocabulaire » — AUCUN terme n'est perdu, et
//      chaque entrée garde la clé d'annotation d'origine ;
//   3. la référence officielle embarquée dans le moteur (Strudel 1.3.0, en anglais),
//      pour toutes les fonctions qui n'ont pas d'entrée rédigée.
//
// Fonctions pures (aucun accès au navigateur) → testables.

import mini from './mini.js';
import fonctions from './fonctions.js';
import effets from './effets.js';
import solfege from './solfege.js';
import genresW from './genres.js';
import reference from './reference.json' with { type: 'json' };
import { CATEGORIES, termKey } from '../legacy/glossaryData.js';

export const KINDS = [
  { id: 'mini', label: 'Mini-notation', hint: 'Les signes qu’on écrit entre guillemets.' },
  { id: 'fn', label: 'Fonctions', hint: 'Créer un motif, le transformer, le faire varier.' },
  { id: 'son', label: 'Sons', hint: 'Batterie, ondes, piano, bruit.' },
  { id: 'fx', label: 'Effets et réglages', hint: 'Filtre, enveloppe, espace, couleur.' },
  { id: 'sol', label: 'Solfège', hint: 'Notes, gammes, intervalles, accords, rythme.' },
  { id: 'genre', label: 'Traits de genres', hint: 'Ce qui fait l’identité d’un style.' },
  { id: 'js', label: 'Écriture du code', hint: 'Le point, la flèche, les noms.' },
  { id: 'voc', label: 'Vocabulaire', hint: 'Les autres termes du glossaire.' },
  { id: 'ref', label: 'Référence officielle', hint: 'Documentation de Strudel 1.3.0, en anglais.' },
];

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';

/* --- 1. Entrées rédigées ---------------------------------------------------- */
const written = [...mini, ...fonctions, ...effets, ...solfege, ...genresW].map((e) => ({
  ...e,
  tokens: e.tokens || [],
  noteKeys: (e.legacy || []).map(([cat, term]) => termKey(cat, term)),
  // Définitions d'origine des termes repris (affichées sous « Dans l'ancien glossaire »).
  origin: [],
}));

const claimed = new Map(); // clé d'annotation d'origine → entrée rédigée
for (const e of written) for (const k of e.noteKeys) claimed.set(k, e);

/* --- 2. Ancien glossaire ------------------------------------------------------ */
const vocab = [];
for (const cat of CATEGORIES) {
  for (const it of cat.entries) {
    const key = termKey(cat.id, it.term);
    const owner = claimed.get(key);
    if (owner) {
      owner.origin.push({ term: it.term, def: it.def });
      continue;
    }
    vocab.push({
      id: 'voc.' + cat.id + '.' + slug(it.term),
      t: it.term,
      en: it.en,
      sub: cat.label,
      kind: 'voc',
      tokens: [],
      ess: it.def,
      noteKeys: [key],
      origin: [],
    });
  }
}

/* --- 3. Référence officielle ------------------------------------------------- */
const refByName = Object.fromEntries(reference.entries.map((r) => [r.n, r]));

// Autres noms d'un contrôle, d'après le moteur : alias déclarés + synonymes de la doc.
export function engineAliases(name) {
  const out = new Set();
  for (const [canon, al] of Object.entries(reference.aliases)) {
    if (canon === name || al.includes(name)) {
      out.add(canon);
      al.forEach((a) => out.add(a));
    }
  }
  const r = refByName[name];
  if (r) r.s.forEach((s) => out.add(s));
  for (const r2 of reference.entries) if (r2.s.includes(name)) { out.add(r2.n); r2.s.forEach((s) => out.add(s)); }
  out.delete(name);
  return [...out];
}

// Rattache à chaque entrée rédigée sa fiche officielle et les alias de ses mots-clés.
const covered = new Set();
for (const e of written) {
  const names = new Set(e.tokens.filter((t) => /^[A-Za-z_$][\w$]*$/.test(t)));
  if (e.doc) names.add(e.doc);
  const al = new Set();
  for (const n of names) {
    engineAliases(n).forEach((a) => al.add(a));
  }
  for (const n of [...names, ...al]) covered.add(n);
  e.aliases = [...al].filter((a) => !names.has(a) || a !== e.doc).sort();
  e.official = e.doc && refByName[e.doc] ? refByName[e.doc] : null;
  e.deprecated = [...names, ...al].filter((n) => refByName[n] && refByName[n].dep);
}

const refs = reference.entries
  .filter((r) => !covered.has(r.n))
  .map((r) => ({
    id: 'ref.' + r.n,
    t: r.n,
    sub: r.s.length ? 'aussi : ' + r.s.join(', ') : '',
    kind: 'ref',
    tokens: [r.n, ...r.s],
    ess: r.d,
    official: r,
    code: r.x[0] || '',
    noteKeys: [],
    origin: [],
    aliases: engineAliases(r.n),
    deprecated: r.dep ? [r.n] : [],
  }));

/* --- Index --------------------------------------------------------------------- */
export const entries = [...written, ...vocab, ...refs];
export const byId = Object.fromEntries(entries.map((e) => [e.id, e]));
export const engineVersion = reference.version;

// Clé d'annotation principale d'une entrée : la clé d'origine si elle existe
// (les notes déjà écrites restent attachées), sinon une clé propre à Keymaker 2.
export function primaryNoteKey(e) {
  return (e.noteKeys && e.noteKeys[0]) || 'wiki:' + e.id;
}
export function allNoteKeys(e) {
  const keys = [primaryNoteKey(e), ...(e.noteKeys || []).slice(1)];
  return [...new Set(keys)];
}
// Toutes les clés d'annotation connues → entrée (pour retrouver les notes orphelines).
export const entryByNoteKey = (() => {
  const m = new Map();
  for (const e of entries) for (const k of allNoteKeys(e)) m.set(k, e);
  return m;
})();

// Mot du code → entrée (fonctions, alias). Les entrées rédigées passent d'abord.
const byToken = new Map();
for (const e of entries) {
  for (const t of [...(e.tokens || []), ...(e.kind !== 'ref' ? e.aliases || [] : [])]) {
    if (t && !byToken.has(t)) byToken.set(t, e);
  }
}
export function entryForToken(tok) {
  return byToken.get(tok) || null;
}

/* --- Reconnaître les éléments d'un code ------------------------------------- */
// Renvoie les entrées du wiki correspondant à ce qui est écrit, dans l'ordre
// d'apparition, sans doublon : fonctions, signaux, noms de sons, signes de mini-notation.
const MINI_SIGNS = [
  ['<', 'mini.chevrons'], ['[', 'mini.crochets'], ['*', 'mini.etoile'], ['/', 'mini.slash'], ['~', 'mini.silence'],
  [',', 'mini.virgule'], ['!', 'mini.exclamation'], ['@', 'mini.arobase'], ['?', 'mini.interrogation'], ['|', 'mini.barre'],
];
export function explainCode(code) {
  const out = [];
  const seen = new Set();
  const push = (e) => {
    if (e && !seen.has(e.id)) {
      seen.add(e.id);
      out.push(e);
    }
  };
  const src = String(code || '').replace(/\/\/.*$/gm, '');
  if (/(^|\n)\s*_?\$:/.test(src) || /(^|\n)\s*_?[A-Za-z]\w*:\s/.test(src)) push(byId['fn.dollar']);
  // Parcours : alternance chaînes / code.
  const re = /"([^"]*)"|'([^']*)'|`([^`]*)`|([A-Za-z_$][\w$]*)|(=>)/g;
  let m;
  while ((m = re.exec(src))) {
    const str = m[1] != null ? m[1] : m[2] != null ? m[2] : m[3];
    if (str != null) {
      if (/\S\s+\S/.test(str)) push(byId['mini.espace']);
      for (const [sign, id] of MINI_SIGNS) if (str.includes(sign)) push(byId[id]);
      if (/\(\s*\d+\s*,\s*\d+/.test(str)) push(byId['mini.euclide']);
      if (/(^|\s)-(\s|$)/.test(str)) push(byId['mini.silence']);
      if (/(^|\s)_(\s|$)/.test(str)) push(byId['mini.souligne']);
      if (/[a-z]\w*:\d/.test(str)) push(byId['mini.deux-points']);
      for (const w of str.split(/[^A-Za-z0-9_#]+/)) {
        const e = byToken.get(w);
        if (e && (e.kind === 'son' || e.id === 'son.batterie')) push(e);
      }
    } else if (m[4]) {
      const e = byToken.get(m[4]);
      if (e && e.kind !== 'son') push(e);
    } else if (m[5]) push(byId['js.fleche']);
  }
  return out;
}

/* --- Recherche ------------------------------------------------------------------ */
const hay = entries.map((e) => ({
  e,
  title: norm(e.t),
  tokens: (e.tokens || []).map(norm),
  aliases: (e.aliases || []).map(norm),
  syn: (e.syn || []).map(norm), // mots courants qui mènent à l'entrée (« kick », « grosse caisse »…)
  sub: norm((e.sub || '') + ' ' + (e.en || '')),
  uses: norm((e.use || []).map((u) => u[0]).join(' ')),
  body: norm(e.ess || ''),
  origin: norm((e.origin || []).map((o) => o.term).join(' ')),
}));
const KIND_RANK = { mini: 0, fn: 0, fx: 0, son: 0, sol: 0, genre: 0, js: 0, voc: 1, ref: 2 };

function scoreTerm(h, q) {
  if (h.title === q || h.tokens.includes(q)) return 100;
  if (h.aliases.includes(q)) return 90;
  if (h.syn.includes(q)) return 85;
  if (h.title.startsWith(q) || h.tokens.some((t) => t.startsWith(q))) return 70;
  if (h.syn.some((t) => t.startsWith(q))) return 60;
  if (h.title.includes(q) || h.origin.includes(q)) return 55;
  if (h.sub.includes(q)) return 45;
  if (h.aliases.some((t) => t.startsWith(q))) return 40;
  if (q.length >= 3 && h.uses.includes(q)) return 30;
  if (q.length >= 3 && h.body.includes(q)) return 20;
  return 0;
}

// Mots vides d'une question (« c'est quoi un cycle » → « cycle »).
const STOP = new Set(
  ('c est quoi qu que qui un une le la les l de du des d a au aux en et ou ce cet cette ca comment pourquoi ' +
    'faire fait sert on je j tu il elle the what is how to').split(' '),
);

export function search(query, { kind = null, limit = 60 } = {}) {
  const q = norm(query);
  const words = q.split(/[\s'’?!.,;:]+/).filter((w) => w && !STOP.has(w));
  const res = [];
  for (const h of hay) {
    if (kind && h.e.kind !== kind) continue;
    let score = 0;
    if (!q) score = 1;
    else {
      score = scoreTerm(h, q);
      if (!score && words.length) {
        // Plusieurs mots : on cherche chacun ; une entrée qui les a tous passe devant.
        const per = words.map((w) => scoreTerm(h, w));
        const hits = per.filter(Boolean).length;
        if (hits) score = (per.reduce((a, b) => a + b, 0) / words.length) * (hits === words.length ? 1 : 0.5);
      }
    }
    if (score) res.push({ e: h.e, score: score - KIND_RANK[h.e.kind] * 8 });
  }
  if (q) res.sort((a, b) => b.score - a.score || a.e.t.localeCompare(b.e.t, 'fr'));
  return res.slice(0, limit).map((r) => r.e);
}

export function countByKind() {
  const c = {};
  for (const e of entries) c[e.kind] = (c[e.kind] || 0) + 1;
  return c;
}
