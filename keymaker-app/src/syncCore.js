// syncCore.js — Chantier 31 (Tranche 2) : cœur PUR du générateur de sync PO-33.
// Aucune dépendance Web Audio / DOM : uniquement les maths de timing, testables.
//
// Pocket Operator / Korg : la sync se transmet à 2 PPQN (2 pulses par temps),
// en clics audio sur le canal GAUCHE. Convention Keymaker (depuis M1) :
// 1 cycle = 1 mesure = 4 temps en 4/4, posée par setcpm(BPM/4).
//   → 4 temps/cycle × 2 pulses/temps = 8 clics par cycle.
// Le tempo vit dans le code de l'élève (setcpm/setcps) ; on le LIT en direct
// sur le scheduler de Strudel (scheduler.cps). On ne le pilote pas.

export const BEATS_PER_CYCLE = 4;                       // convention 4/4 du projet
export const PPQN = 2;                                  // standard Pocket Operator / Korg
export const PULSES_PER_CYCLE = BEATS_PER_CYCLE * PPQN; // = 8 clics par cycle

const fin = (x) => typeof x === 'number' && isFinite(x);

// cps (cycles/seconde) -> BPM, sous la convention 4/4 (1 cycle = 4 temps).
export function cpsToBpm(cps) {
  return fin(cps) && cps > 0 ? cps * BEATS_PER_CYCLE * 60 : 0;
}
// BPM -> cps (inverse de cpsToBpm).
export function bpmToCps(bpm) {
  return fin(bpm) && bpm > 0 ? bpm / (BEATS_PER_CYCLE * 60) : 0;
}
// Débit de pulses en Hz (= pulses/seconde = (BPM/60) × PPQN).
export function pulseHz(cps) {
  return fin(cps) && cps > 0 ? cps * PULSES_PER_CYCLE : 0;
}
// Durée (s) entre deux clics consécutifs.
export function pulsePeriod(cps) {
  const hz = pulseHz(cps);
  return hz > 0 ? 1 / hz : 0;
}

// Index entier du prochain clic à émettre à partir d'une position de cycle.
// nowCycle = scheduler.now() (cycles, fractionnaire). Les clics tombent aux
// multiples de 1/PULSES_PER_CYCLE de cycle ; l'index global d'un clic est
// idx = cycle × PULSES_PER_CYCLE. Renvoie le 1er index >= position courante
// (tolérance eps pour capter un clic pile sur l'instant présent).
export function nextPulseIndex(nowCycle, eps = 1e-6) {
  if (!fin(nowCycle)) return 0;
  return Math.ceil(nowCycle * PULSES_PER_CYCLE - eps);
}

// Instant audio (s) d'un clic d'index idx, ancré sur une lecture (nowCycle, audioNow)
// du scheduler. cps supposé constant sur la fenêtre de lookahead (re-ancré à chaque tick).
//   cycleDuClic = idx / PULSES_PER_CYCLE
//   t = audioNow + (cycleDuClic - nowCycle) / cps
export function pulseTime(idx, nowCycle, audioNow, cps) {
  if (!fin(idx) || !fin(nowCycle) || !fin(audioNow) || !fin(cps) || cps <= 0) return null;
  return audioNow + (idx / PULSES_PER_CYCLE - nowCycle) / cps;
}

// Planifie les clics dont l'instant tombe dans la fenêtre [audioNow, audioNow+horizon].
// Ré-ancré à chaque appel sur une lecture fraîche du scheduler → pas de dérive cumulée.
// lastIdx = dernier index déjà planifié (évite les doublons d'un tick à l'autre).
// Renvoie { times: [{idx, t}], lastIdx }.
export function pulsesInWindow({ nowCycle, audioNow, cps, horizon = 0.1, lastIdx = null } = {}) {
  if (!fin(nowCycle) || !fin(audioNow) || !fin(cps) || cps <= 0 || !(horizon >= 0)) {
    return { times: [], lastIdx };
  }
  let idx = nextPulseIndex(nowCycle);
  if (lastIdx != null && idx <= lastIdx) idx = lastIdx + 1;
  const times = [];
  let last = lastIdx;
  let guard = 0;
  while (guard++ < 4000) {
    const t = pulseTime(idx, nowCycle, audioNow, cps);
    if (t == null || t > audioNow + horizon) break;
    times.push({ idx, t: t < audioNow ? audioNow : t });
    last = idx;
    idx++;
  }
  return { times, lastIdx: last };
}

// Format court "≈ 124 BPM" pour l'UI (0 si tempo inconnu).
export function bpmLabel(cps) {
  const b = cpsToBpm(cps);
  return b > 0 ? Math.round(b) : 0;
}
