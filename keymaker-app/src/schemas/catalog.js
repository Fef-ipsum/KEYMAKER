// Schémas vivants — le catalogue.
//
// Un TYPE de schéma (filtre, enveloppe…) est fait et vérifié à la main : ses réglages,
// la ligne de code qu'il produit, ses missions, ses faits. Les leçons, le wiki et Sati
// ne font que DÉCLARER un schéma d'un type existant, avec des données :
//
//   { type: 'filtre', reglages: { lpf: 600, lpq: 0 }, source: 'basse', missions: ['ferme', 'siffle'] }
//
// Ce fichier valide ces déclarations (un bloc de Sati invalide reste du texte), compare
// deux réglages pour la question « retrouve le réglage à l'oreille », et génère la
// description du catalogue envoyée à Sati (toujours synchronisée avec le code).
//
// Fonctions pures (aucun accès au navigateur) → testables dans node.
import filtre from './types/filtre.js';
import adsr from './types/adsr.js';
import onde from './types/onde.js';
import enveloppeFiltre from './types/enveloppeFiltre.js';
import cycle from './types/cycle.js';
import tempo from './types/tempo.js';

export const TYPES = { filtre, adsr, onde, 'enveloppe-filtre': enveloppeFiltre, cycle, tempo };
export const typeIds = () => Object.keys(TYPES);

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

// Vérifie une déclaration de schéma. Renvoie { ok: true, spec } ou { ok: false, error }.
// Aucune valeur n'est corrigée en silence : hors limites = invalide.
export function validateSpec(spec) {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return { ok: false, error: 'pas un objet' };
  const def = TYPES[spec.type];
  if (!def) return { ok: false, error: 'type inconnu : ' + spec.type };
  const map = def.specKeys(spec);
  if (!map) return { ok: false, error: 'réglage inconnu pour ' + spec.type };
  for (const [key, internal] of Object.entries(map)) {
    const v = spec.reglages && spec.reglages[key];
    if (v == null) continue;
    const p = def.params[internal];
    if (!isNum(v) || v < p.min || v > p.max) return { ok: false, error: `${key} hors limites (${p.min} à ${p.max})` };
  }
  for (const [name, o] of Object.entries(def.options || {})) {
    const key = name === 'kind' ? 'filtre' : name;
    if (spec[key] != null && !o.values.includes(spec[key])) return { ok: false, error: `${key} : valeur inconnue` };
  }
  if (spec.filtres != null && (spec.type !== 'filtre' || !Array.isArray(spec.filtres) || !spec.filtres.length || spec.filtres.some((k) => !def.options.kind.values.includes(k)))) return { ok: false, error: 'filtres : des genres de filtre connus' };
  if (spec.regler != null && (!Array.isArray(spec.regler) || spec.regler.some((k) => !(k in map)))) return { ok: false, error: 'regler : des réglages du schéma' };
  if (spec.missions != null) {
    if (!Array.isArray(spec.missions)) return { ok: false, error: 'missions : une liste' };
    const ids = new Set((def.missions || []).map((m) => m.id));
    const bad = spec.missions.find((m) => !ids.has(m));
    if (bad) return { ok: false, error: 'mission inconnue : ' + bad };
  }
  if (spec.defi != null) {
    const d = spec.defi;
    if (!d || typeof d !== 'object' || !d.cible || typeof d.cible !== 'object') return { ok: false, error: 'defi : il faut une cible' };
    const target = validateSpec({ type: spec.type, reglages: d.cible, filtre: spec.filtre, source: spec.source, mode: spec.mode });
    if (!target.ok) return { ok: false, error: 'defi : ' + target.error };
    if (d.regler != null && (!Array.isArray(d.regler) || d.regler.some((k) => !(k in map)))) return { ok: false, error: 'defi : regler doit nommer des réglages du schéma' };
  }
  return { ok: true, spec };
}

// État de départ d'un schéma, à partir de sa déclaration.
export function stateFromSpec(spec) {
  const def = TYPES[spec.type];
  const st = def.fromSpec(spec);
  if (!st.implicit) st.implicit = [];
  // Les valeurs de départ sont arrondies comme tout ce qui est joué.
  for (const k of Object.keys(st.p)) if (st.p[k] != null && def.params[k]) st.p[k] = def.params[k].q(clamp(st.p[k], def.params[k]));
  return st;
}
export function clamp(v, p) {
  return Math.min(p.max, Math.max(p.min, v));
}

// Le texte du code d'un état (morceaux de def.code réunis).
export function codeText(def, st, opts) {
  return def.code(st, opts).filter((x) => !x.off).map((x) => x.t).join('');
}

/* --- Curseurs : position (0..1) ↔ valeur, selon l'échelle du réglage ------------- */
export function toPos(p, v) {
  const x = clamp(v, p);
  if (p.scale === 'log') return Math.log(x / p.min) / Math.log(p.max / p.min);
  if (p.scale === 'cube') return Math.cbrt((x - p.min) / (p.max - p.min));
  return (x - p.min) / (p.max - p.min);
}
export function fromPos(p, t) {
  const u = Math.min(1, Math.max(0, t));
  if (p.scale === 'log') return p.min * Math.pow(p.max / p.min, u);
  if (p.scale === 'cube') return p.min + (p.max - p.min) * u * u * u;
  return p.min + (p.max - p.min) * u;
}

/* --- « Retrouve le réglage à l'oreille » ------------------------------------------ */
// Compare deux états sur les réglages à trouver. Tolérances : celles du type, sauf
// si la question en donne d'autres. Renvoie { ok, misses: [clé], hints: [texte] }.
export function earCompare(def, mine, target, keys, tolerance = {}) {
  const misses = [];
  const valsMine = def.values ? def.values(mine) : null;
  const valsTarget = def.values ? def.values(target) : null;
  const order = Object.keys(def.params);
  for (const k of keys) {
    const t = { ...(def.tolerance && def.tolerance[k]), ...(tolerance[k] || {}) };
    const i = order.indexOf(k);
    const a = valsMine ? valsMine[i] : mine.p[k];
    const b = valsTarget ? valsTarget[i] : target.p[k];
    let ok = true;
    if (t.octaves != null) ok = Math.abs(Math.log2(a / b)) <= t.octaves;
    else if (t.ratio != null) ok = Math.abs(a - b) <= (t.abs || 0) || Math.max(a, b) / Math.max(Math.min(a, b), 1e-3) <= t.ratio;
    else if (t.abs != null) ok = Math.abs(a - b) <= t.abs;
    if (!ok) misses.push(k);
  }
  const hints = misses.length && def.earHint ? def.earHint(mine, target) : [];
  return { ok: !misses.length, misses, hints };
}

/* --- Pour Sati ------------------------------------------------------------------ */
// Le texte d'un bloc ```schema → déclaration validée, ou null (le bloc reste alors du texte).
export function parseSchemaBlock(body) {
  try {
    const spec = JSON.parse(String(body || '').trim());
    return validateSpec(spec).ok ? spec : null;
  } catch {
    return null;
  }
}

// Description du catalogue, générée depuis le code : elle ne peut pas dériver.
export function describeCatalog() {
  const lines = [
    'Schémas vivants de Keymaker : tu peux répondre avec un schéma réglé, que l’app affiche vivant (son + dessin).',
    'Écris un bloc ```schema contenant UN objet JSON, par exemple :',
    '```schema',
    '{"type":"filtre","reglages":{"lpf":800,"lpq":12},"source":"basse"}',
    '```',
    'Pour un défi d’écoute : ajoute "defi":{"cible":{…réglages à retrouver…},"regler":["lpf"]} ; l’app joue la cible, Felix règle le schéma, la vérification est locale.',
    'Types disponibles (tu ne peux pas en inventer d’autres ; un bloc invalide s’affiche comme du texte) :',
  ];
  for (const def of Object.values(TYPES)) lines.push('- ' + def.describe);
  return lines.join('\n');
}

// Ce qui est à l'écran, pour le contexte de Sati.
export function summarize(spec, st) {
  const def = TYPES[spec.type];
  if (!def) return '';
  return def.summary(st) + ' · code : ' + codeText(def, st);
}
