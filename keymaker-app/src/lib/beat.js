// Durées musicales à partir du tempo du moteur (cycles par seconde).
// Fonctions pures → testables hors navigateur.
//
// Convention de l'app : un cycle = une mesure de `beats` temps (4 par défaut).

export function beatTable(cps, beats = 4) {
  const c = cps > 0 ? cps : 0.5;
  const b = Math.max(1, Math.round(beats) || 4);
  const cycle = 1 / c;
  const beat = cycle / b;
  return {
    bpm: c * 60 * b,
    beats: b,
    cycle,
    beat,
    eighth: beat / 2,
    triplet: beat / 3,
    sixteenth: beat / 4,
  };
}

// Durée lisible : « 484 ms » sous la seconde, « 1,94 s » au-delà.
export function fmtDur(sec) {
  if (!Number.isFinite(sec)) return '—';
  if (sec < 1) return Math.round(sec * 1000) + ' ms';
  return (Math.round(sec * 100) / 100).toLocaleString('fr-FR') + ' s';
}

export function fmtNum(x, digits = 2) {
  if (!Number.isFinite(x)) return '—';
  const r = Math.round(x * 10 ** digits) / 10 ** digits;
  return r.toLocaleString('fr-FR');
}

// Secondes → temps, et l'inverse.
export const secToBeats = (sec, cps, beats = 4) => sec / beatTable(cps, beats).beat;
export const beatsToSec = (n, cps, beats = 4) => n * beatTable(cps, beats).beat;
