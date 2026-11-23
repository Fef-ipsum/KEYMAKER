// Schéma « effet » : l'écho, la réverbération, la distorsion — dessinés d'après ce que
// fait superdough (relu dans le moteur embarqué, puis mesuré par le banc de test) :
//   écho      nœud de retard de l'orbite ; répétition k (k ≥ 1) à k × delaytime, de niveau
//             delay × delayfeedback^(k−1) ; delayfeedback plafonné à 0,98 ;
//   réverb    réponse faite de bruit, qui décroît de 60 dB (×1/1000) en `size` secondes et
//             dure 1,5 × size ; `room` = quantité envoyée ;
//   distort   AudioWorklet : sortie = (1+h)·x / (1+h·|x|), h = e^distort − 1 (« scurve »).
// Le son passe par superdough lui-même.
import { frNum, frSec, frPct, codeNum } from '../core/format.js';

const fix2 = (v) => Math.round(v * 100) / 100;
export const PLUCK = 'note("c4 ~ ~ ~").sound("triangle").decay(.1).sustain(0)';
export const SINE = 'note("c3").sound("sine")';
export const scurve = (x, d) => {
  const h = Math.expm1(d);
  return ((1 + h) * x) / (1 + h * Math.abs(x));
};
// Répétitions de l'écho : [{ t, level }], jusqu'à ce qu'elles passent sous 1 %.
export function echoes(p, max = 4) {
  const out = [];
  const fb = Math.min(p.delayfeedback, 0.98);
  for (let k = 1; k * p.delaytime <= max && out.length < 60; k++) {
    const level = p.delay * Math.pow(fb, k - 1);
    if (level < 0.01) break;
    out.push({ t: k * p.delaytime, level });
  }
  return out;
}
// Enveloppe de la traîne de réverbération (relative) à l'instant t.
export const reverbEnv = (p, t) => (t < 0 || t > 1.5 * p.size ? 0 : p.room * Math.pow(1e-3, t / p.size));

const MODES = { echo: 'Écho', reverb: 'Réverbération', distort: 'Distorsion' };
const KEYS = { echo: ['delay', 'delaytime', 'delayfeedback'], reverb: ['room', 'size'], distort: ['distort'] };

const def = {
  id: 'effet',
  title: 'Les effets',
  label: (st) => MODES[st.o.effet],
  params: {
    delay: { label: 'Quantité d’écho', min: 0, max: 1, scale: 'lin', def: 0.5, q: fix2, fmt: frPct },
    delaytime: { label: 'Temps entre les échos', min: 0.05, max: 1, scale: 'lin', def: 0.25, q: fix2, fmt: frSec },
    delayfeedback: { label: 'Répétition', hint: 'part reprise à chaque écho', min: 0, max: 0.95, scale: 'lin', def: 0.5, q: fix2, fmt: frPct },
    room: { label: 'Quantité de réverbération', min: 0, max: 1, scale: 'lin', def: 0.5, q: fix2, fmt: frPct },
    size: { label: 'Taille de la pièce', hint: 'durée de la traîne', min: 0.5, max: 8, scale: 'lin', def: 2, q: (v) => Math.round(v * 10) / 10, fmt: frSec },
    distort: { label: 'Distorsion', min: 0, max: 6, scale: 'lin', def: 1, q: (v) => Math.round(v * 10) / 10, fmt: (v) => frNum(v, 1) },
  },
  options: { effet: { label: 'Effet', values: Object.keys(MODES), labels: MODES, def: 'echo' } },
  paramCode: (st, k) => (k === 'size' ? 'size' : k),
  fromSpec(spec = {}) {
    const r = spec.reglages || {};
    const effet = MODES[spec.effet] ? spec.effet : 'echo';
    const p = {};
    for (const [k, d] of Object.entries(def.params)) p[k] = r[k] != null ? Number(r[k]) : d.def;
    return { p, o: { effet } };
  },
  toSpec: (st) => ({ type: 'effet', effet: st.o.effet, reglages: Object.fromEntries(KEYS[st.o.effet].map((k) => [k, st.p[k]])) }),
  specKeys: (spec) => {
    const keys = KEYS[(spec && spec.effet) || 'echo'] || [];
    return Object.keys((spec && spec.reglages) || {}).every((k) => keys.includes(k)) ? Object.fromEntries(keys.map((k) => [k, k])) : null;
  },
  keys: (st) => KEYS[st.o.effet],
  codeText(st) {
    const p = st.p;
    if (st.o.effet === 'echo') return `${PLUCK}.delay(${codeNum(p.delay)}).delaytime(${codeNum(p.delaytime)}).delayfeedback(${codeNum(p.delayfeedback)})`;
    if (st.o.effet === 'reverb') return `${PLUCK}.room(${codeNum(p.room)}).size(${codeNum(p.size)})`;
    return `${SINE}.distort(${codeNum(p.distort)})`;
  },
  code: (st) => [{ t: def.codeText(st), k: 'all' }],
  expect(st) {
    if (st.o.effet === 'echo') return { delay: st.p.delay, delaytime: st.p.delaytime, delayfeedback: st.p.delayfeedback };
    if (st.o.effet === 'reverb') return { room: st.p.room, roomsize: st.p.size };
    return { distort: st.p.distort };
  },
  warn: (st) => (st.o.effet === 'distort' && st.p.distort >= 4 ? 'Distorsion forte : le son devient presque carré, et plus fort. Baisse le volume de l’appareil.' : null),
  summary(st) {
    if (st.o.effet === 'echo') return `écho — delay ${st.p.delay}, delaytime ${st.p.delaytime} s, delayfeedback ${st.p.delayfeedback} (${echoes(st.p).length} répétitions audibles)`;
    if (st.o.effet === 'reverb') return `réverbération — room ${st.p.room}, size ${st.p.size} (traîne de ${frNum(1.5 * st.p.size, 1)} s)`;
    return `distorsion — distort ${st.p.distort} sur une sinusoïde`;
  },
  describe: 'effet — effet : "echo" (reglages : delay 0 à 1, delaytime 0,05 à 1 s, delayfeedback 0 à 0,95) | "reverb" (room 0 à 1, size 0,5 à 8) | "distort" (distort 0 à 6). missions possibles : traine (écho), cathedrale (réverb), sature (distorsion).',
  missions: [
    { id: 'traine', text: 'Monte la répétition `delayfeedback` à 0,8 ou plus.', learned: 'Chaque écho reprend 80 % du précédent : il faut beaucoup de répétitions pour qu’il s’éteigne. Au-delà de 1, il ne s’éteindrait jamais : Strudel s’arrête à 0,98.', test: (s) => s.playing && s.changed && s.o.effet === 'echo' && s.p.delayfeedback >= 0.8 },
    { id: 'cathedrale', text: 'Fais une cathédrale : `size` d’au moins 4 et `room` d’au moins 0,5.', learned: 'La traîne dure maintenant plus de 6 secondes : chaque note continue de résonner bien après sa fin, comme sous une voûte.', test: (s) => s.playing && s.changed && s.o.effet === 'reverb' && s.p.size >= 4 && s.p.room >= 0.5 },
    { id: 'sature', text: 'Pousse la distorsion à 3 ou plus.', learned: 'Le haut et le bas de l’onde s’écrasent : la sinusoïde se rapproche d’un carré, et des harmoniques apparaissent. Le son devient rugueux.', test: (s) => s.playing && s.changed && s.o.effet === 'distort' && s.p.distort >= 3 },
  ],
  modeMissions: { echo: ['traine'], reverb: ['cathedrale'], distort: ['sature'] },
  defaultMissions: [],
  facts: [
    { id: 'echo.repetitions', modes: ['echo'], text: 'La première répétition a le niveau `delay` ; chacune des suivantes reprend `delayfeedback` fois la précédente.' },
    { id: 'echo.plafond', modes: ['echo'], text: 'Strudel plafonne `delayfeedback` à 0,98 : l’écho finit toujours par s’éteindre.' },
    { id: 'echo.sync', modes: ['echo'], text: 'Sans `delaytime`, l’écho se cale sur le cycle : `delaysync` vaut 3/16 de cycle par défaut, soit 0,375 s au tempo de Keymaker.' },
    { id: 'reverb.duree', modes: ['reverb'], text: '`size` règle la durée de la traîne : elle s’éteint d’environ 60 dB (mille fois plus faible) en `size` secondes.' },
    { id: 'reverb.hasard', modes: ['reverb'], text: 'La traîne est fabriquée avec du bruit tiré au hasard : deux écoutes ne sont jamais identiques à l’échantillon près, mais elles s’éteignent à la même vitesse.' },
    { id: 'distort.courbe', modes: ['distort'], text: 'Par défaut, `distort(d)` applique la courbe (1+h)·x / (1+h·|x|), avec h = e^d − 1 : à 0, rien ne change ; plus d est grand, plus l’onde s’écrase vers ±1.' },
  ],
};
export default def;
