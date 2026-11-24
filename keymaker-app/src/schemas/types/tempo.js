// Schéma « tempo » : setcpm, les cycles par minute, les temps par cycle et les BPM.
// Le code : setcpm(bpm/temps) puis un motif de `temps` kicks et du double de charleston.
// Les instants dessinés viennent du motif lui-même (queryArc), au tempo réglé.
import { frNum } from '../core/format.js';

const def = {
  id: 'tempo',
  title: 'Le tempo',
  label: () => 'Le tempo',
  params: {
    bpm: { label: 'Temps par minute', hint: 'BPM', min: 40, max: 200, scale: 'lin', def: 120, q: (v) => Math.round(v), fmt: (v) => frNum(v, 0) + ' BPM' },
  },
  options: {
    temps: { label: 'Temps par cycle', values: [3, 4], labels: { 3: '3 temps', 4: '4 temps' }, def: 4 },
  },
  paramCode: (st, k) => (k === 'bpm' ? 'setcpm' : k),
  fromSpec(spec = {}) {
    const r = spec.reglages || {};
    return { p: { bpm: r.bpm != null ? Number(r.bpm) : 120 }, o: { temps: spec.temps === 3 ? 3 : 4 } };
  },
  toSpec: (st) => ({ type: 'tempo', reglages: { bpm: st.p.bpm }, temps: st.o.temps }),
  specKeys: (spec) => (Object.keys((spec && spec.reglages) || {}).every((k) => k === 'bpm') ? { bpm: 'bpm' } : null),
  motif: (st) => `bd*${st.o.temps}, hh*${st.o.temps * 2}`,
  cpm: (st) => st.p.bpm / st.o.temps,
  code: (st) => [{ t: 'setcpm(' }, { t: String(st.p.bpm), k: 'bpm' }, { t: '/' + st.o.temps + ')\nsound("' + def.motif(st) + '")' }],
  expect: (st) => ({ cps: st.p.bpm / st.o.temps / 60, perCycle: { bd: st.o.temps, hh: st.o.temps * 2 } }),
  warn: () => null,
  // « Retrouve le réglage à l'oreille » : 6 BPM d'écart acceptés.
  tolerance: { bpm: { abs: 6 } },
  earHint: (st, target) => (Math.abs(st.p.bpm - target.p.bpm) > 6 ? [st.p.bpm > target.p.bpm ? 'ton tempo est plus rapide que celui du son mystère' : 'le son mystère est plus rapide que ton tempo'] : []),
  summary: (st) => `tempo — setcpm(${st.p.bpm}/${st.o.temps}) : ${frNum(def.cpm(st), 2)} cycles par minute, ${st.o.temps} temps par cycle, ${st.p.bpm} BPM`,
  describe: 'tempo — setcpm, cycles par minute, temps par cycle, BPM. reglages : {bpm 40 à 200} ; temps : 3 | 4. missions possibles : lent, rapide, trois.',
  missions: [
    { id: 'lent', text: 'Pendant que ça joue, descends à 80 BPM ou moins.', learned: 'Moins de cycles par minute : chaque cycle dure plus longtemps, et tous ses sons s’écartent. Le motif ne change pas, seule sa vitesse change.', test: (s) => s.playing && s.p.bpm <= 80 },
    { id: 'rapide', text: 'Monte à 140 BPM ou plus.', learned: 'Plus de cycles par minute : les temps se rapprochent. 140 BPM, c’est déjà une techno rapide.', test: (s) => s.playing && s.p.bpm >= 140 },
    { id: 'trois', text: 'Passe à 3 temps par cycle.', learned: 'À BPM égal, un cycle de 3 temps est plus court : `setcpm(bpm/3)` compte plus de cycles par minute. Le temps, lui, garde sa durée.', test: (s) => s.playing && s.o.temps === 3 },
  ],
  defaultMissions: ['lent', 'rapide', 'trois'],
  facts: [
    { id: 'tempo.cpm', text: '`setcpm(n)` règle n cycles par minute : `setcpm(30)` = un cycle toutes les 2 secondes.' },
    { id: 'tempo.bpm', text: 'Avec 4 temps par cycle, `setcpm(120/4)` donne 120 temps par minute : 120 BPM. Strudel ne connaît pas les « temps » : c’est toi qui décides combien il y en a dans un cycle.' },
    { id: 'tempo.defaut', text: 'Sans `setcpm` ni `setcps`, Keymaker joue à 30 cycles par minute (0,5 par seconde). Sur strudel.cc, le dernier tempo réglé reste en place d’une évaluation à l’autre ; ici, chaque code repart de 30.' },
  ],
};
export default def;
