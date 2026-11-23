// Schéma « effet » : l'écho, la réverbération, la distorsion — dessinés d'après ce que
// fait superdough (relu dans le moteur embarqué, puis mesuré par le banc de test) :
//   écho      nœud de retard de l'orbite ; répétition k (k ≥ 1) à k × delaytime, de niveau
//             delay × delayfeedback^(k−1) ; delayfeedback plafonné à 0,98 ;
//   réverb    réponse faite de bruit, qui décroît de 60 dB (×1/1000) en `size` secondes et
//             dure 1,5 × size ; `room` = quantité envoyée ;
//   distort   AudioWorklet : sortie = (1+h)·x / (1+h·|x|), h = e^distort − 1 (« scurve »).
//   sidechain `duck` posé sur le kick baisse le volume de l'orbite visée (Orbit.duck) :
//             au plus tôt 10 ms avant le coup, le moteur part du volume du moment c et
//             descend en exponentielle jusqu'à h = 1 − √duckdepth (borné à [0,01 ; c]),
//             atteint pile au coup ; puis remonte en exponentielle jusqu'à 1 en
//             `duckattack` secondes. Le calcul est lancé par un événement (`onended`) :
//             en temps réel, la descente commence entre 10 ms et 0 ms avant le coup.
// Le son passe par superdough lui-même.
import { frNum, frSec, frPct, codeNum } from '../core/format.js';

const fix2 = (v) => Math.round(v * 100) / 100;
export const PLUCK = 'note("c4 ~ ~ ~").sound("triangle").decay(.1).sustain(0)';
export const SINE = 'note("c3").sound("sine")';
// Sidechain : la nappe de l'entrée « duck » du wiki, sur l'orbite 2, et le kick qui la fait plonger.
export const PAD = 'note("[c2,c3]").sound("sawtooth").lpf(900).orbit(2)';
export const KICK = 'sound("bd*4")';
export const DUCK_ORBIT = 2;
export const DUCK_LEAD = 0.01; // le moteur prépare le creux 10 ms avant le coup
// Plancher du creux : 1 − √duckdepth, jamais sous 0,01, jamais au-dessus du volume du moment.
export const duckFloor = (depth, c = 1) => Math.min(Math.max(1 - Math.sqrt(depth), 0.01), c);
// Volume de l'orbite visée à l'instant t (s). kicks : [{ e (le coup), l (le calcul) }], triés.
// Même automation que superdough : setValueAtTime(c, l), rampe exponentielle vers h en e,
// puis rampe exponentielle vers 1 en e + duckattack.
export function duckGain(t, p, kicks) {
  const at = (seg, x) => {
    if (!seg) return 1;
    if (x < seg.e) return seg.c * Math.pow(seg.h / seg.c, (x - seg.l) / (seg.e - seg.l));
    if (x < seg.e + seg.a) return seg.h * Math.pow(1 / seg.h, (x - seg.e) / seg.a);
    return 1;
  };
  let seg = null;
  for (const k of kicks) {
    if (t < k.l) break;
    const c = at(seg, k.l);
    seg = { l: k.l, e: Math.max(k.e, k.l), c, h: duckFloor(p.duckdepth, c), a: Math.max(p.duckattack, 0.002) };
    if (seg.e === seg.l) seg.e = seg.l + 1e-9;
  }
  return at(seg, t);
}
// Les coups de bd*4 au tempo de Keymaker (0,5 cycle/s) : un toutes les 0,5 s ; calcul au plus tôt.
export const duckKicks = (from, to, period = 0.5) => {
  const out = [];
  for (let k = Math.floor(from / period) - 1; k * period <= to + period; k++) out.push({ e: k * period, l: k * period - DUCK_LEAD });
  return out;
};
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

const MODES = { echo: 'Écho', reverb: 'Réverbération', distort: 'Distorsion', sidechain: 'Sidechain' };
const KEYS = { echo: ['delay', 'delaytime', 'delayfeedback'], reverb: ['room', 'size'], distort: ['distort'], sidechain: ['duckdepth', 'duckattack'] };

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
    duckdepth: { label: 'Profondeur du creux', hint: 'à 1, la nappe tombe à 1 %', min: 0, max: 1, scale: 'lin', def: 0.7, q: fix2, fmt: frPct },
    // Au-delà de 0,45 s, le volume n'aurait pas fini de remonter au coup suivant (toutes les 0,5 s).
    duckattack: { label: 'Temps de remontée', hint: 'malgré son nom : le retour au volume normal', min: 0.02, max: 0.45, scale: 'lin', def: 0.2, q: fix2, fmt: frSec },
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
    // Deux pistes, comme dans l'entrée « duck » du wiki ; la nappe d'abord : l'orbit visée
    // existe ainsi avant le premier coup qui la fait plonger.
    if (st.o.effet === 'sidechain') return `$: ${PAD}\n$: ${KICK}.duck(${DUCK_ORBIT}).duckdepth(${codeNum(p.duckdepth)}).duckattack(${codeNum(p.duckattack)})`;
    return `${SINE}.distort(${codeNum(p.distort)})`;
  },
  // La même ligne sans l'effet (pendant « Maintiens : sans l'effet »).
  bypassText(st) {
    if (st.o.effet === 'sidechain') return `$: ${PAD}\n$: ${KICK}`;
    return def.codeText(st).replace(/\.(delay|room|distort)\(.*$/, '');
  },
  code: (st) => [{ t: def.codeText(st), k: 'all' }],
  expect(st) {
    if (st.o.effet === 'echo') return { delay: st.p.delay, delaytime: st.p.delaytime, delayfeedback: st.p.delayfeedback };
    if (st.o.effet === 'reverb') return { room: st.p.room, roomsize: st.p.size };
    if (st.o.effet === 'sidechain') return { duckorbit: DUCK_ORBIT, duckdepth: st.p.duckdepth, duckattack: st.p.duckattack };
    return { distort: st.p.distort };
  },
  // Les événements qui portent ces valeurs (sidechain : le kick seulement, pas la nappe).
  expectOn: (st, v) => (st.o.effet === 'sidechain' ? v.s === 'bd' : true),
  warn: (st) => (st.o.effet === 'distort' && st.p.distort >= 4 ? 'Distorsion forte : le son devient presque carré, et plus fort. Baisse le volume de l’appareil.' : null),
  summary(st) {
    if (st.o.effet === 'echo') return `écho — delay ${st.p.delay}, delaytime ${st.p.delaytime} s, delayfeedback ${st.p.delayfeedback} (${echoes(st.p).length} répétitions audibles)`;
    if (st.o.effet === 'reverb') return `réverbération — room ${st.p.room}, size ${st.p.size} (traîne de ${frNum(1.5 * st.p.size, 1)} s)`;
    if (st.o.effet === 'sidechain') return `sidechain — duckdepth ${st.p.duckdepth}, duckattack ${st.p.duckattack} s : à chaque coup de kick, la nappe (orbit 2) tombe à ${frPct(duckFloor(st.p.duckdepth))} de son volume puis remonte en ${frNum(st.p.duckattack, 2)} s`;
    return `distorsion — distort ${st.p.distort} sur une sinusoïde`;
  },
  describe: 'effet — effet : "echo" (reglages : delay 0 à 1, delaytime 0,05 à 1 s, delayfeedback 0 à 0,95) | "reverb" (room 0 à 1, size 0,5 à 8) | "distort" (distort 0 à 6) | "sidechain" (duckdepth 0 à 1, duckattack 0,02 à 0,45 s ; kick bd*4 qui fait plonger une nappe sur l\'orbit 2). missions possibles : traine (écho), cathedrale (réverb), sature (distorsion), pompe et trou (sidechain).',
  missions: [
    { id: 'traine', text: 'Monte la répétition `delayfeedback` à 0,8 ou plus.', learned: 'Chaque écho reprend 80 % du précédent : il faut beaucoup de répétitions pour qu’il s’éteigne. Au-delà de 1, il ne s’éteindrait jamais : Strudel s’arrête à 0,98.', test: (s) => s.playing && s.changed && s.o.effet === 'echo' && s.p.delayfeedback >= 0.8 },
    { id: 'cathedrale', text: 'Fais une cathédrale : `size` d’au moins 4 et `room` d’au moins 0,5.', learned: 'La traîne dure maintenant plus de 6 secondes : chaque note continue de résonner bien après sa fin, comme sous une voûte.', test: (s) => s.playing && s.changed && s.o.effet === 'reverb' && s.p.size >= 4 && s.p.room >= 0.5 },
    { id: 'pompe', text: 'Fais pomper la nappe : `duckdepth` à 0,8 ou plus et `duckattack` à 0,3 ou plus.', learned: 'Le volume plonge à chaque coup puis remonte lentement, juste à temps pour le coup suivant : la nappe « respire » au rythme du kick. C’est le pompage de la house et de la trance.', test: (s) => s.playing && s.changed && s.o.effet === 'sidechain' && s.p.duckdepth >= 0.8 && s.p.duckattack >= 0.3 },
    { id: 'trou', text: 'Creuse un simple trou : `duckattack` à 0,05 ou moins, avec `duckdepth` d’au moins 0,5.', learned: 'Le volume remonte presque aussitôt : on n’entend plus de pompage, seulement une petite place laissée au kick à chaque coup. Le kick passe devant, la nappe reste stable.', test: (s) => s.playing && s.changed && s.o.effet === 'sidechain' && s.p.duckattack <= 0.05 && s.p.duckdepth >= 0.5 },
    { id: 'sature', text: 'Pousse la distorsion à 3 ou plus.', learned: 'Le haut et le bas de l’onde s’écrasent : la sinusoïde se rapproche d’un carré, et des harmoniques apparaissent. Le son devient rugueux.', test: (s) => s.playing && s.changed && s.o.effet === 'distort' && s.p.distort >= 3 },
  ],
  modeOf: (st) => st.o.effet,
  modeMissions: { echo: ['traine'], reverb: ['cathedrale'], distort: ['sature'], sidechain: ['pompe', 'trou'] },
  defaultMissions: [],
  facts: [
    { id: 'echo.repetitions', modes: ['echo'], text: 'La première répétition a le niveau `delay` ; chacune des suivantes reprend `delayfeedback` fois la précédente.' },
    { id: 'echo.plafond', modes: ['echo'], text: 'Strudel plafonne `delayfeedback` à 0,98 : l’écho finit toujours par s’éteindre.' },
    { id: 'echo.sync', modes: ['echo'], text: 'Sans `delaytime`, l’écho se cale sur le cycle : `delaysync` vaut 3/16 de cycle par défaut, soit 0,375 s au tempo de Keymaker.' },
    { id: 'reverb.duree', modes: ['reverb'], text: '`size` règle la durée de la traîne : elle s’éteint d’environ 60 dB (mille fois plus faible) en `size` secondes.' },
    { id: 'reverb.hasard', modes: ['reverb'], text: 'La traîne est fabriquée avec du bruit tiré au hasard : deux écoutes ne sont jamais identiques à l’échantillon près, mais elles s’éteignent à la même vitesse.' },
    { id: 'duck.plancher', modes: ['sidechain'], text: 'Le creux n’est jamais un silence : le volume tombe à 1 − √`duckdepth`, et jamais sous 1 %. À `duckdepth(.75)`, il tombe à 13 % ; à `duckdepth(1)`, à 1 % (−40 dB).' },
    { id: 'duck.remontee', modes: ['sidechain'], text: '`duckattack`, malgré son nom, règle la remontée : le volume revient à la normale en `duckattack` secondes, en courbe exponentielle. À mi-chemin, il n’est encore qu’à la racine du plancher : 10 % quand le plancher est à 1 %.' },
    { id: 'duck.pile', modes: ['sidechain'], text: 'Le fond du creux tombe pile sur le coup : Strudel prépare la descente jusqu’à 10 ms avant, selon le moment où le navigateur s’en occupe.' },
    { id: 'duck.fantome', modes: ['sidechain'], text: 'Le son qui déclenche n’a pas besoin de s’entendre : un kick à `gain(0)` fait quand même plonger l’orbit visée. Pratique pour faire pomper une nappe sans kick audible.' },
    { id: 'distort.courbe', modes: ['distort'], text: 'Par défaut, `distort(d)` applique la courbe (1+h)·x / (1+h·|x|), avec h = e^d − 1 : à 0, rien ne change ; plus d est grand, plus l’onde s’écrase vers ±1.' },
  ],
};
export default def;
