// Schéma « enveloppe » (ADSR) : la forme du volume d'une note dans le temps.
//
// Ce qu'on voit est calculé par la même fonction que celle qui programme le volume
// (../core/adsr.js, réplique de getParamADSR de superdough) : troncature comprise,
// quand la note est plus courte que l'attack.
//
// Comme dans Strudel, c'est le CODE qui décide de la durée des notes : note("c3*4") joue
// quatre notes par cycle ; le cycle dure 2 s au tempo de Keymaker, chaque note 0,5 s.
// `sustain` est un NIVEAU (0 à 1), gardé jusqu'à la fin de la note, pas une durée.
import { qTime, qLevel, frSec, frNum, codeNum } from '../core/format.js';
import { adsrValues, SYNTH_DEFAULTS } from '../core/adsr.js';

export const HOLD_NOTE = 48; // c3
export const CYCLE = 2; // durée d'un cycle (s) au tempo de Keymaker (0,5 cycle par seconde)
export const PER_CYCLE = [1, 2, 4, 8];
export const noteCode = (n) => (n > 1 ? 'c3*' + n : 'c3');
export const noteDur = (n) => CYCLE / n;
export const PRESETS = {
  'sans-reglage': { label: 'Sans réglage', vals: null },
  pince: { label: 'Pincé', vals: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.1 } },
  orgue: { label: 'Orgue', vals: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.05 } },
  nappe: { label: 'Nappe', vals: { attack: 0.4, decay: 0.3, sustain: 0.8, release: 1.2 } },
};
const KEYS = ['attack', 'decay', 'sustain', 'release'];
const num = (v) => (typeof v === 'number' ? v : parseFloat(v));
// Ancien champ `mode` (avant novembre 2026) : « tenir » jouait note("c3"), « motif » 4 notes par cycle.
const perCycleOf = (spec) => (PER_CYCLE.includes(Number(spec.notes)) ? Number(spec.notes) : spec.mode === 'motif' ? 4 : 1);

const def = {
  id: 'adsr',
  title: 'L’enveloppe',
  label: () => 'Enveloppe ADSR',
  // Les lettres de Strudel ; l'explication en français vient à côté, sans remplacer le nom.
  params: {
    attack: { label: 'A', hint: 'temps de montée jusqu’au sommet', letter: 'A', min: 0, max: 2, scale: 'cube', def: 0.001, q: qTime, fmt: frSec, step: 0.01 },
    decay: { label: 'D', hint: 'temps de descente jusqu’au niveau S', letter: 'D', min: 0, max: 2, scale: 'cube', def: 0.05, q: qTime, fmt: frSec, step: 0.01 },
    sustain: { label: 'S', hint: 'NIVEAU gardé jusqu’à la fin de la note (1 = sommet)', letter: 'S', min: 0, max: 1, scale: 'lin', def: 0.6, q: qLevel, fmt: (v) => frNum(v, 2), step: 0.05 },
    release: { label: 'R', hint: 'temps d’extinction après la fin de la note', letter: 'R', min: 0, max: 3, scale: 'cube', def: 0.01, q: qTime, fmt: frSec, step: 0.01 },
  },
  options: {
    notes: { label: 'Notes par cycle', values: PER_CYCLE, labels: { 1: '1 · 2 s', 2: '2 · 1 s', 4: '4 · 0,5 s', 8: '8 · 0,25 s' }, def: 1 },
  },
  paramCode: (st, k) => k,

  // { reglages: { attack, decay, sustain, release }, notes: 1 | 2 | 4 | 8 } — réglages absents :
  // « Sans réglage » (le code ne contient alors aucun réglage d'enveloppe, et Strudel prend ses
  // valeurs par défaut).
  fromSpec(spec = {}) {
    const r = spec.reglages || {};
    const written = KEYS.some((k) => r[k] != null);
    const p = {};
    if (written) for (const k of KEYS) p[k] = r[k] != null ? num(r[k]) : null;
    const vals = written ? adsrValues(p) : SYNTH_DEFAULTS;
    return {
      p: { attack: vals[0], decay: vals[1], sustain: vals[2], release: vals[3] },
      o: { notes: perCycleOf(spec) },
      written,
    };
  },
  toSpec(st) {
    return { type: 'adsr', reglages: st.written ? { ...st.p } : {}, notes: st.o.notes };
  },
  specKeys: (spec) => {
    const keys = Object.keys((spec && spec.reglages) || {});
    return keys.every((k) => KEYS.includes(k)) ? Object.fromEntries(KEYS.map((k) => [k, k])) : null;
  },
  // Les valeurs effectives, celles que le moteur utilisera (planchers compris).
  values(st) {
    return st.written ? adsrValues(st.p) : [...SYNTH_DEFAULTS];
  },
  noteDur: (st) => noteDur(st.o.notes),

  code(st, { bypass = false } = {}) {
    const parts = [{ t: 'note("' }, { t: noteCode(st.o.notes), k: 'notes' }, { t: '").sound("sawtooth").lpf(1500)' }];
    if (!st.written || bypass) return parts;
    for (const k of KEYS) parts.push({ t: '.' + k + '(' }, { t: codeNum(st.p[k]), k }, { t: ')' });
    return parts;
  },
  expect(st) {
    const out = { s: 'sawtooth', cutoff: 1500, notes: Array(st.o.notes).fill(HOLD_NOTE) };
    if (st.written) for (const k of KEYS) out[k] = st.p[k];
    return out;
  },

  warn(st) {
    const [a, d] = def.values(st);
    const dur = noteDur(st.o.notes);
    if (a > dur) return `L’attack (${frSec(a)}) dure plus longtemps que la note (${frSec(dur)}) : le sommet n’est jamais atteint, et le release part du niveau où la note s’arrête.`;
    if (a + d > dur) return `La note (${frSec(dur)}) s’arrête pendant le decay : le niveau S n’est jamais atteint.`;
    return null;
  },

  summary(st) {
    const v = def.values(st);
    return `enveloppe ADSR — ${st.written ? `attack ${v[0]}, decay ${v[1]}, sustain ${v[2]}, release ${v[3]}` : 'sans réglage (valeurs par défaut de Strudel : .001, .05, .6, .01)'} ; note("${noteCode(st.o.notes)}") : ${st.o.notes} note(s) par cycle de 2 s, chacune dure ${frNum(noteDur(st.o.notes), 2)} s`;
  },
  describe:
    'adsr — forme du volume d’une note dans le temps. reglages : {attack, decay, release} en secondes (0 à 2, release 0 à 3), {sustain} NIVEAU de 0 à 1 ; ' +
    'reglages vides = valeurs par défaut de Strudel. notes : 1, 2, 4 ou 8 notes par cycle (note("c3*4") : notes de 0,5 s ; un cycle dure 2 s). ' +
    'missions possibles : lente, pince, traine, courte.',

  tolerance: { attack: { ratio: 2, abs: 0.06 }, decay: { ratio: 2, abs: 0.06 }, sustain: { abs: 0.2 }, release: { ratio: 2, abs: 0.1 } },
  earHint(st, target) {
    const out = [];
    const [a, d, s, r] = def.values(st);
    const [ta, td, ts, tr] = def.values(target);
    const far = (x, y, t) => Math.abs(x - y) > (t.abs || 0) && (!t.ratio || Math.max(x, y) / Math.max(Math.min(x, y), 0.001) > t.ratio);
    if (far(a, ta, def.tolerance.attack)) out.push(a > ta ? 'ton attack est plus lente : ton son arrive plus lentement' : 'l’attack du son mystère est plus lente : il arrive plus en douceur');
    if (far(d, td, def.tolerance.decay)) out.push(d > td ? 'ton decay est plus lent' : 'le decay du son mystère est plus lent');
    if (Math.abs(s - ts) > def.tolerance.sustain.abs) out.push(s > ts ? 'ton sustain est plus haut : ta note reste plus forte pendant qu’elle dure' : 'le sustain du son mystère est plus haut : il reste plus fort pendant la note');
    if (far(r, tr, def.tolerance.release)) out.push(r > tr ? 'ton release est plus long : ton son traîne plus après la fin de la note' : 'le release du son mystère est plus long : il traîne plus après la fin de la note');
    return out;
  },

  // `changed` : un réglage ou le nombre de notes a bougé depuis le départ (sinon une
  // déclaration déjà réglée gagnerait la mission sans geste).
  missions: [
    {
      id: 'lente',
      text: 'Mets `attack` à 0,4 s ou plus, avec des notes assez longues pour atteindre le sommet.',
      learned: 'Le son met du temps à monter : la note arrive en fondu. Une attack lente, c’est le geste des nappes et des cordes.',
      test: (s) => s.playing && s.changed && s.written && s.p.attack >= 0.4 && s.p.attack <= noteDur(s.o.notes),
    },
    {
      id: 'pince',
      text: 'Mets `sustain` à 0, avec des notes d’au moins 1 s (1 ou 2 notes par cycle).',
      learned: 'La note dure encore, mais on n’entend plus rien : avec `sustain(0)`, le son retombe au silence à la fin du decay. C’est `decay` qui décide de la longueur du son, pas la durée de la note. Un son « pincé ».',
      test: (s) => s.playing && s.changed && s.written && s.p.sustain === 0 && noteDur(s.o.notes) >= 1 && s.p.attack + s.p.decay < noteDur(s.o.notes),
    },
    {
      id: 'traine',
      text: 'Mets `release` à 1 s ou plus.',
      learned: 'Le son continue après la fin de la note : c’est le release. Il part du niveau atteint au moment où la note s’arrête.',
      test: (s) => s.playing && s.changed && s.written && s.p.release >= 1,
    },
    {
      id: 'courte',
      text: 'Passe à 8 notes par cycle avec une `attack` de 0,3 s ou plus.',
      learned: 'Chaque note ne dure plus que 0,25 s : elle s’arrête avant le sommet de l’attack. Le son n’atteint jamais son plein volume, et le release part du niveau atteint. La durée de la note vient du code, pas de l’enveloppe.',
      test: (s) => s.playing && s.changed && s.written && s.o.notes === 8 && s.p.attack >= 0.3,
    },
  ],
  defaultMissions: ['lente', 'pince', 'traine', 'courte'],

  facts: [
    { id: 'adsr.defauts', text: 'Sans aucun réglage d’enveloppe, les ondes de Strudel (`sine`, `triangle`, `square`, `sawtooth`) utilisent attack .001, decay .05, sustain .6 et release .01.' },
    { id: 'adsr.un-seul', text: 'Dès que tu écris un seul des quatre réglages, les autres changent aussi : attack et decay 0,001 s, release 0,01 s, et sustain 1 si tu n’as pas écrit `decay` (0,001 sinon).' },
    { id: 'adsr.lineaire', text: 'Pour ces ondes, les montées et les descentes du volume sont des lignes droites (une enveloppe « linéaire »).' },
    { id: 'adsr.niveau', text: '`sustain` est un niveau, pas une durée : avec `sustain(.3)`, le son reste à 30 % du sommet jusqu’à la fin de la note, que la note dure 2 s ou 1 s.' },
    { id: 'adsr.duree', text: 'La durée de la note vient du code : un cycle dure 2 s au tempo de Keymaker, et `note("c3*4")` y joue 4 notes de 0,5 s.' },
    { id: 'adsr.troncature', text: 'Le release commence à la fin de la note, depuis le niveau atteint. Si la note est plus courte que l’attack, le sommet n’est jamais atteint.' },
    { id: 'adsr.raccourci', text: '`.adsr(".01:.2:.5:.3")` règle les quatre valeurs d’un coup, dans l’ordre A, D, S, R.' },
  ],
};

export default def;
