// Schéma « enveloppe » (ADSR) : la forme du volume d'une note dans le temps.
//
// Ce qu'on voit est calculé par la même fonction que celle qui programme le volume
// (../core/adsr.js, réplique de getParamADSR de superdough) : troncature comprise,
// quand la note est plus courte que l'attaque.
import { qTime, qLevel, frSec, frPct, codeNum } from '../core/format.js';
import { adsrValues, SYNTH_DEFAULTS } from '../core/adsr.js';

export const MOTIF = { notes: 'c3 e3 g3 e3', midi: [48, 52, 55, 52] };
export const HOLD_NOTE = 48; // c3
export const PRESETS = {
  'sans-reglage': { label: 'Sans réglage', vals: null },
  pince: { label: 'Pincé', vals: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.1 } },
  orgue: { label: 'Orgue', vals: { attack: 0.01, decay: 0.01, sustain: 1, release: 0.05 } },
  nappe: { label: 'Nappe', vals: { attack: 0.4, decay: 0.3, sustain: 0.8, release: 1.2 } },
};
const KEYS = ['attack', 'decay', 'sustain', 'release'];
const num = (v) => (typeof v === 'number' ? v : parseFloat(v));

const def = {
  id: 'adsr',
  title: 'L’enveloppe',
  label: () => 'Enveloppe ADSR',
  params: {
    attack: { label: 'Attaque', letter: 'A', min: 0, max: 2, scale: 'cube', def: 0.001, q: qTime, fmt: frSec, step: 0.01 },
    decay: { label: 'Retombée', letter: 'D', min: 0, max: 2, scale: 'cube', def: 0.05, q: qTime, fmt: frSec, step: 0.01 },
    sustain: { label: 'Maintien', letter: 'S', min: 0, max: 1, scale: 'lin', def: 0.6, q: qLevel, fmt: frPct, step: 0.05 },
    release: { label: 'Extinction', letter: 'R', min: 0, max: 3, scale: 'cube', def: 0.01, q: qTime, fmt: frSec, step: 0.01 },
  },
  options: {
    mode: { label: 'Jouer', values: ['tenir', 'motif'], labels: { tenir: 'Tenir', motif: 'Motif' }, def: 'tenir' },
  },
  paramCode: (st, k) => k,

  // { reglages: { attack, decay, sustain, release } } — absents : « Sans réglage »
  // (le code ne contient alors aucun réglage d'enveloppe, et Strudel prend ses valeurs par défaut).
  fromSpec(spec = {}) {
    const r = spec.reglages || {};
    const written = KEYS.some((k) => r[k] != null);
    const p = {};
    if (written) for (const k of KEYS) p[k] = r[k] != null ? num(r[k]) : null;
    const vals = written ? adsrValues(p) : SYNTH_DEFAULTS;
    return {
      p: { attack: vals[0], decay: vals[1], sustain: vals[2], release: vals[3] },
      o: { mode: spec.mode === 'motif' ? 'motif' : 'tenir' },
      written,
    };
  },
  toSpec(st) {
    return { type: 'adsr', reglages: st.written ? { ...st.p } : {}, mode: st.o.mode };
  },
  specKeys: (spec) => {
    const keys = Object.keys((spec && spec.reglages) || {});
    return keys.every((k) => KEYS.includes(k)) ? Object.fromEntries(KEYS.map((k) => [k, k])) : null;
  },
  // Les valeurs effectives, celles que le moteur utilisera (planchers compris).
  values(st) {
    return st.written ? adsrValues(st.p) : [...SYNTH_DEFAULTS];
  },

  code(st, { bypass = false } = {}) {
    const parts = [{ t: 'note("' + (st.o.mode === 'motif' ? MOTIF.notes : 'c3') + '").sound("sawtooth").lpf(1500)' }];
    if (!st.written || bypass) return parts;
    for (const k of KEYS) parts.push({ t: '.' + k + '(' }, { t: codeNum(st.p[k]), k }, { t: ')' });
    return parts;
  },
  expect(st) {
    const out = { s: 'sawtooth', cutoff: 1500, notes: st.o.mode === 'motif' ? MOTIF.midi : [HOLD_NOTE] };
    if (st.written) for (const k of KEYS) out[k] = st.p[k];
    return out;
  },

  warn(st, extra = {}) {
    const [a, d] = def.values(st);
    const dur = extra.noteDur;
    if (dur != null && a > dur) return 'L’attaque dure plus longtemps que la note : le sommet n’est jamais atteint, et l’extinction part du niveau où la note s’arrête.';
    if (dur != null && a + d > dur) return 'La note s’arrête pendant la retombée : le maintien n’est jamais atteint.';
    return null;
  },

  summary(st) {
    const v = def.values(st);
    return `enveloppe ADSR — ${st.written ? `attack ${v[0]}, decay ${v[1]}, sustain ${v[2]}, release ${v[3]}` : 'sans réglage (valeurs par défaut de Strudel : .001, .05, .6, .01)'}, mode : ${st.o.mode}`;
  },
  describe:
    'adsr — forme du volume d’une note dans le temps. reglages : {attack, decay, release} en secondes (0 à 2, release 0 à 3), {sustain} de 0 à 1 ; ' +
    'reglages vides = valeurs par défaut de Strudel. mode : "tenir" (Felix tient une note) | "motif" (note("c3 e3 g3 e3"), notes de 0,5 s). ' +
    'missions possibles : lente, pince, traine.',

  tolerance: { attack: { ratio: 2, abs: 0.06 }, decay: { ratio: 2, abs: 0.06 }, sustain: { abs: 0.2 }, release: { ratio: 2, abs: 0.1 } },
  earHint(st, target) {
    const out = [];
    const [a, d, s, r] = def.values(st);
    const [ta, td, ts, tr] = def.values(target);
    const far = (x, y, t) => Math.abs(x - y) > (t.abs || 0) && (!t.ratio || Math.max(x, y) / Math.max(Math.min(x, y), 0.001) > t.ratio);
    if (far(a, ta, def.tolerance.attack)) out.push(a > ta ? 'ton son arrive plus lentement que le son mystère' : 'le son mystère arrive plus en douceur');
    if (far(d, td, def.tolerance.decay)) out.push(d > td ? 'ta retombée est plus lente' : 'la retombée du son mystère est plus lente');
    if (Math.abs(s - ts) > def.tolerance.sustain.abs) out.push(s > ts ? 'ta note reste plus forte quand on la tient' : 'le son mystère reste plus fort quand on le tient');
    if (far(r, tr, def.tolerance.release)) out.push(r > tr ? 'ton son traîne plus longtemps après la fin' : 'le son mystère traîne plus longtemps après la fin');
    return out;
  },

  missions: [
    {
      id: 'lente',
      text: 'Mets une attaque d’au moins 0,4 s, puis tiens une note jusqu’au sommet.',
      learned: 'Le son met du temps à monter : la note arrive en fondu. Une attaque lente, c’est le geste des nappes et des cordes.',
      test: (s) => s.holding && s.written && s.p.attack >= 0.4 && s.heldFor >= s.p.attack,
    },
    {
      id: 'pince',
      text: 'Mets le maintien à 0, puis tiens une note plus d’une seconde.',
      learned: 'Même si tu tiens, le son retombe au silence après la retombée : avec un maintien à 0, c’est la retombée qui décide de la longueur. C’est un son « pincé ».',
      test: (s) => s.holding && s.written && s.p.sustain === 0 && s.heldFor > 1,
    },
    {
      id: 'traine',
      text: 'Mets une extinction d’au moins 1 s, puis lâche une note.',
      learned: 'Le son continue après que tu as lâché : c’est l’extinction. Elle part du niveau atteint au moment où la note s’arrête.',
      test: (s) => s.event === 'release' && s.written && s.p.release >= 1,
    },
  ],
  defaultMissions: ['lente', 'pince', 'traine'],

  facts: [
    { id: 'adsr.defauts', text: 'Sans aucun réglage d’enveloppe, les ondes de Strudel (`sine`, `triangle`, `square`, `sawtooth`) utilisent attack .001, decay .05, sustain .6 et release .01.' },
    { id: 'adsr.un-seul', text: 'Dès que tu écris un seul des quatre réglages, les autres changent aussi : attaque et retombée 0,001 s, extinction 0,01 s, et maintien 1 si tu n’as pas écrit `decay` (0,001 sinon).' },
    { id: 'adsr.lineaire', text: 'Pour ces ondes, les montées et les descentes du volume sont des lignes droites (une enveloppe « linéaire »).' },
    { id: 'adsr.troncature', text: 'L’extinction commence à la fin de la note, depuis le niveau atteint. Si la note est plus courte que l’attaque, le sommet n’est jamais atteint.' },
    { id: 'adsr.raccourci', text: '`.adsr(".01:.2:.5:.3")` règle les quatre valeurs d’un coup, dans l’ordre A, D, S, R.' },
  ],
};

export default def;
