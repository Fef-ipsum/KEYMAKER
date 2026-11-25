// Schémas vivants — nombres : arrondis (ce qui est joué), affichage français, code Strudel.
//
// Règle : une valeur est ARRONDIE avant d'être jouée, pas seulement à l'affichage.
// Le code affiché sous un schéma est donc exactement ce qu'on entend.
// Fonctions pures (aucun accès au navigateur) → testables dans node.

// Arrondi à n chiffres significatifs.
export function sig(v, n) {
  if (!Number.isFinite(v) || v === 0) return 0;
  const p = Math.pow(10, n - Math.ceil(Math.log10(Math.abs(v))));
  return Math.round(v * p) / p;
}
const fix = (v, d) => Math.round(v * Math.pow(10, d)) / Math.pow(10, d);

// Fréquence : entière sous 1000 Hz, trois chiffres significatifs au-dessus (6934 → 6930).
export const qFreq = (v) => (v < 1000 ? Math.round(v) : sig(v, 3));
export const qInt = (v) => Math.round(v);
// Durée en secondes : 0,001 près sous 0,1 s ; 0,01 près sous 1 s ; 0,1 près au-delà.
export const qTime = (v) => (v <= 0 ? 0 : v < 0.1 ? fix(v, 3) : v < 1 ? fix(v, 2) : fix(v, 1));
// Niveau de 0 à 1 : deux décimales.
export const qLevel = (v) => fix(Math.min(1, Math.max(0, v)), 2);

// Nombre au format du code de l'app : .15, 1.2, 600 (pas de zéro initial).
export function codeNum(v) {
  if (!Number.isFinite(v)) return '0';
  let s = String(Number(v.toPrecision(12)));
  if (s.startsWith('0.')) s = s.slice(1);
  else if (s.startsWith('-0.')) s = '-' + s.slice(2);
  return s;
}

// Nombre en français : virgule décimale, espace fine pour les milliers.
export function frNum(v, maxDecimals = 3) {
  if (!Number.isFinite(v)) return '—';
  const r = fix(v, maxDecimals);
  const [i, d] = String(Math.abs(r)).split('.');
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (r < 0 ? '−' : '') + int + (d ? ',' + d : '');
}
// 600 → « 600 Hz » ; 6930 → « 6,93 kHz ».
export function frHz(v) {
  if (v >= 1000) return frNum(sig(v, 3) / 1000, 2) + ' kHz';
  return frNum(Math.round(v), 0) + ' Hz';
}
export const frSec = (v) => frNum(v, 3) + ' s';
export const frPct = (v) => Math.round(v * 100) + ' %';
