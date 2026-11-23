// Schémas vivants — l'enveloppe de volume, calculée EXACTEMENT comme superdough.
//
// Superdough (le moteur audio de Strudel 1.3.0) programme le volume d'une note avec
// deux fonctions, relues dans le moteur embarqué (public/vendor/strudel-repl/index.js) :
//   getADSRValues([a, d, s, r], 'linear', défauts)  → les quatre valeurs effectives ;
//   getParamADSR(gain, a, d, s, r, 0, 1, début, fin, 'linear') → les rampes du volume.
// Ce fichier en est la réplique. UNE seule fonction (adsrPlan) sert à la fois à
// programmer le son et à dessiner la courbe : le dessin ne peut pas mentir.
// L'équivalence avec les fonctions du moteur est vérifiée par scripts/check-schemas.mjs.
//
// Fonctions pures → testables hors navigateur.

// Valeurs par défaut des ondes sine, triangle, square, sawtooth (registerSynthSounds).
export const SYNTH_DEFAULTS = Object.freeze([0.001, 0.05, 0.6, 0.01]);
// Valeurs par défaut de l'enveloppe d'un filtre (createFilter).
export const FILTER_ENV_DEFAULTS = Object.freeze([0.005, 0.14, 0, 0.1]);

// Bornes de la coupure d'une enveloppe de filtre (createFilter) : de lpf·2^(−env·ancre)
// à lpf·2^(env·(1−ancre)), limitées à 0..20 000 Hz ; inversées si env est négatif.
// Ancre (fanchor) : 0 par défaut dans ce moteur.
export function filterEnvRange(f, env = 1, anchor = 0) {
  const k = Math.abs(env);
  const off = k * anchor;
  let lo = Math.min(Math.max(Math.pow(2, -off) * f, 0), 20000);
  let hi = Math.min(Math.max(Math.pow(2, k - off) * f, 0), 20000);
  if (env < 0) [lo, hi] = [hi, lo];
  return { min: lo, max: hi };
}

// Réplique de getADSRValues. null/undefined = « pas écrit dans le code ».
//  - rien d'écrit           → les valeurs par défaut de l'onde ;
//  - au moins une écrite    → attaque et retombée 0 si absentes, extinction 0 si absente,
//                             maintien 1 si decay n'est pas écrit, 0,001 sinon ;
//  - planchers              → attaque et retombée ≥ 0,001 s, extinction ≥ 0,01 s, maintien ≤ 1.
export function adsrValues({ attack, decay, sustain, release } = {}, defaults = SYNTH_DEFAULTS) {
  const A = attack ?? null;
  const D = decay ?? null;
  const S = sustain ?? null;
  const R = release ?? null;
  if (A == null && D == null && S == null && R == null) return [...defaults];
  const s = S ?? ((A != null && D == null) || (A == null && D == null) ? 1 : 0.001);
  return [Math.max(A ?? 0, 0.001), Math.max(D ?? 0, 0.001), Math.min(s, 1), Math.max(R ?? 0, 0.01)];
}

// Réplique de getParamADSR (courbe linéaire, de 0 à 1), pour une note qui commence à
// `begin` et dure `hold` secondes. Renvoie la liste des ordres donnés au volume :
//   { kind: 'set' | 'ramp' | 'exp', t, v }
//   (setValueAtTime / linearRampToValueAtTime / exponentialRampToValueAtTime)
export function adsrPlan(vals, begin, hold) {
  return envPlan(vals, begin, hold);
}

// La même chose, entre `min` et `max`, en courbe linéaire ou exponentielle : c'est ainsi
// que superdough fait bouger la coupure d'un filtre (enveloppe de filtre, lpenv).
// En exponentiel, le moteur remplace un 0 par 0,001 (une rampe exponentielle ne peut pas
// atteindre 0).
export function envPlan([a, d, s, r], begin, hold, { min = 0, max = 1, curve = 'linear' } = {}) {
  const exp = curve === 'exponential';
  const lo = exp && min === 0 ? 0.001 : min;
  const hi = exp && max === 0 ? 0.001 : max;
  const end = begin + hold;
  const sus = lo + s * (hi - lo);
  const slopeA = a === 0 ? 0 : (hi - lo) / a;
  const slopeD = d === 0 ? 0 : (sus - hi) / d;
  // Valeur qu'aurait l'enveloppe à l'instant x après le début (formule du moteur).
  const at = (x) => {
    const v = a > x ? x * slopeA + lo : (x - a) * slopeD + hi;
    return exp ? v || 0.001 : v;
  };
  const RAMP = exp ? 'exp' : 'ramp';
  const plan = [{ kind: 'set', t: begin, v: lo }];
  if (a > hold) {
    // La note finit pendant l'attaque : le sommet n'est jamais atteint.
    plan.push({ kind: RAMP, t: end, v: at(hold) });
  } else if (a + d > hold) {
    // Elle finit pendant la retombée.
    plan.push({ kind: RAMP, t: begin + a, v: at(a) });
    plan.push({ kind: RAMP, t: end, v: at(hold) });
  } else {
    plan.push({ kind: RAMP, t: begin + a, v: at(a) });
    plan.push({ kind: RAMP, t: begin + a + d, v: at(a + d) });
    plan.push({ kind: 'set', t: end, v: sus });
  }
  plan.push({ kind: RAMP, t: end + r, v: lo });
  return plan;
}

// Lit une liste d'ordres comme le fait Web Audio : une rampe part du dernier ordre.
export function planValue(plan, t) {
  if (!plan.length || t < plan[0].t) return 0;
  let prevT = plan[0].t;
  let prevV = plan[0].v;
  for (let i = 1; i < plan.length; i++) {
    const e = plan[i];
    if (e.kind === 'set') {
      if (t < e.t) return prevV;
      prevT = e.t;
      prevV = e.v;
      continue;
    }
    if (t < e.t) {
      const span = e.t - prevT;
      if (span <= 0) return e.v;
      const u = (t - prevT) / span;
      if (e.kind === 'exp' && prevV > 0 && e.v > 0) return prevV * Math.pow(e.v / prevV, u);
      return prevV + (e.v - prevV) * u;
    }
    prevT = e.t;
    prevV = e.v;
  }
  return prevV;
}

// Applique une liste d'ordres à un paramètre audio (AudioParam).
export function applyPlan(param, plan) {
  for (const e of plan) {
    if (e.kind === 'set') param.setValueAtTime(e.v, e.t);
    else if (e.kind === 'exp') param.exponentialRampToValueAtTime(e.v, e.t);
    else param.linearRampToValueAtTime(e.v, e.t);
  }
}

// Partie « appui » d'une note tenue (fin inconnue) : début, attaque, retombée.
// Tant qu'on tient, c'est exactement le début de adsrPlan pour une note très longue.
export function holdStartPlan([a, d, s], begin) {
  return [
    { kind: 'set', t: begin, v: 0 },
    { kind: 'ramp', t: begin + a, v: 1 },
    { kind: 'ramp', t: begin + a + d, v: s },
  ];
}

// Plan complet d'une note tenue puis lâchée à `releaseAt` : c'est adsrPlan avec
// la durée réellement tenue. Sert au dessin ET à programmer l'extinction.
export function heldPlan(vals, begin, releaseAt) {
  return adsrPlan(vals, begin, Math.max(0, releaseAt - begin));
}

// Dans quelle phase est la note à l'instant t (pour allumer A, D, S ou R).
export function phaseAt([a, d], begin, releaseAt, t) {
  if (t < begin) return null;
  if (releaseAt != null && t >= releaseAt) return 'R';
  const x = t - begin;
  if (x < a) return 'A';
  if (x < a + d) return 'D';
  return 'S';
}

// Fin du son d'une note (le moteur arrête l'onde à fin + extinction + 0,01 s).
export const noteStop = ([, , , r], end) => end + r + 0.01;

// Ordres à donner au volume quand on lâche une note tenue à l'instant T : on fige la
// valeur atteinte (celle que donnerait adsrPlan pour cette durée), puis l'extinction.
export function releaseOrders(vals, begin, T) {
  const plan = heldPlan(vals, begin, T);
  return [
    { kind: 'set', t: T, v: planValue(plan, T) },
    { kind: 'ramp', t: T + vals[3], v: 0 },
  ];
}
