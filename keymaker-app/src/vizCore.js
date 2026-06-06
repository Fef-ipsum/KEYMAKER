// vizCore.js — Chantier 26 : cœur PUR (testable) du visualiseur de pattern.
// Aucune dépendance DOM/React : accès au moteur, parsing des haps, voies.

/* --- Accès robuste au moteur StrudelMirror (chemins multiples) --- */
export function getScheduler(ed) {
  if (!ed) return null;
  return (ed.repl && ed.repl.scheduler) || ed.scheduler || (ed.drawer && ed.drawer.scheduler) || null;
}
export function getPattern(ed) {
  if (!ed) return null;
  if (ed.pattern) return ed.pattern;
  const s = getScheduler(ed);
  return (s && s.pattern) || null;
}
// Temps courant en cycles (fractionnaire) ou null.
export function schedNow(sch) {
  try {
    if (sch && typeof sch.now === 'function') {
      const t = sch.now();
      if (typeof t === 'number' && isFinite(t)) return t;
    }
  } catch { /* ignore */ }
  return null;
}
// Fraction Strudel (ou nombre, ou chaîne) → nombre.
export function num(x) {
  if (typeof x === 'number') return x;
  try { if (x && typeof x.valueOf === 'function') return Number(x.valueOf()); } catch { /* ignore */ }
  const n = Number(x);
  return isFinite(n) ? n : 0;
}
// Étiquette de voie depuis la valeur d'un hap (son, note, n…).
export function laneLabel(v) {
  if (v == null) return '·';
  if (typeof v !== 'object') return String(v);
  if (v.s != null) return String(v.s);
  if (v.note != null) return String(v.note);
  if (v.sound != null) return String(v.sound);
  if (v.n != null) return 'n' + v.n;
  return '·';
}
export function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
export function trim(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

// Transforme les haps bruts d'un queryArc(cyc, cyc+1) en blocs {label,b,e,row}
// (b/e = position dans le cycle, 0..1). Garde SEULEMENT les évènements discrets
// (whole défini). Assigne une voie stable via `lanes`/`order` persistants.
export function processHaps(raw, cyc, lanes, order) {
  const haps = (raw || [])
    .filter((h) => h && h.whole)
    .map((h) => {
      const sp = h.whole || h.part;
      return { label: laneLabel(h.value), b: num(sp.begin) - cyc, e: num(sp.end) - cyc, row: 0 };
    })
    .filter((h) => h.e > 0 && h.b < 1 && h.e >= h.b)
    .slice(0, 400);
  for (const h of haps) {
    if (!lanes.has(h.label)) { lanes.set(h.label, order.length); order.push(h.label); }
    h.row = lanes.get(h.label);
  }
  return haps;
}
