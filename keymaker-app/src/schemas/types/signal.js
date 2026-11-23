// Schéma « signal » : sine.range(300, 2000).slow(4) branché sur la coupure d'un filtre.
// Ce qu'on voit : la courbe du signal sur plusieurs cycles (valeurs calculées par le moteur)
// et, pour chaque note, la coupure qu'elle reçoit VRAIMENT : la valeur du signal au début
// de la note. Le son passe par superdough.
import { qFreq, frHz } from '../core/format.js';

export const SHAPES = { sine: 'sinus', tri: 'triangle', saw: 'dent de scie', square: 'carré' };

const def = {
  id: 'signal',
  title: 'Les signaux',
  label: () => 'Un signal qui bouge un réglage',
  params: {
    lo: { label: 'Valeur basse', min: 30, max: 18000, scale: 'log', def: 300, q: qFreq, fmt: frHz },
    hi: { label: 'Valeur haute', min: 30, max: 18000, scale: 'log', def: 2000, q: qFreq, fmt: frHz },
    slow: { label: 'Lenteur', hint: 'cycles par aller-retour', min: 1, max: 16, scale: 'lin', def: 4, q: (v) => Math.round(v), fmt: (v) => v + ' cycle' + (v > 1 ? 's' : '') },
  },
  options: { forme: { label: 'Forme', values: Object.keys(SHAPES), labels: SHAPES, def: 'sine' } },
  paramCode: (st, k) => ({ lo: 'range', hi: 'range', slow: 'slow' }[k]),
  fromSpec(spec = {}) {
    const r = spec.reglages || {};
    return { p: { lo: r.bas != null ? Number(r.bas) : 300, hi: r.haut != null ? Number(r.haut) : 2000, slow: r.slow != null ? Number(r.slow) : 4 }, o: { forme: SHAPES[spec.forme] ? spec.forme : 'sine' } };
  },
  toSpec: (st) => ({ type: 'signal', reglages: { bas: st.p.lo, haut: st.p.hi, slow: st.p.slow }, forme: st.o.forme }),
  specKeys: (spec) => (Object.keys((spec && spec.reglages) || {}).every((k) => ['bas', 'haut', 'slow'].includes(k)) ? { bas: 'lo', haut: 'hi', slow: 'slow' } : null),
  signalText: (st) => `${st.o.forme}.range(${st.p.lo}, ${st.p.hi}).slow(${st.p.slow})`,
  codeText: (st) => `note("c2*8").sound("sawtooth").lpf(${def.signalText(st)})`,
  code: (st) => [{ t: 'note("c2*8").sound("sawtooth").lpf(' }, { t: def.signalText(st), k: 'all' }, { t: ')' }],
  warn: () => null,
  summary: (st) => `signal — lpf(${def.signalText(st)}) sur note("c2*8") : la coupure va de ${st.p.lo} à ${st.p.hi} Hz en ${st.p.slow} cycles`,
  describe: 'signal — un signal (sine, tri, saw, square) .range(bas, haut).slow(n) branché sur lpf d’une basse note("c2*8"). reglages : {bas, haut : 30 à 18000, slow : 1 à 16} ; forme. missions possibles : lent, large, forme.',
  missions: [
    { id: 'lent', text: 'Ralentis le signal : `slow` de 8 ou plus.', learned: 'Le signal met maintenant 8 cycles (16 secondes) à faire un aller-retour : le son évolue si lentement qu’on l’entend « respirer » plutôt que bouger.', test: (s) => s.playing && s.p.slow >= 8 && s.changed },
    { id: 'large', text: 'Écarte les deux valeurs : la haute au moins 8 fois la basse.', learned: 'Trois octaves d’écart : le filtre passe de très sombre à très ouvert. Plus l’écart est grand, plus le mouvement s’entend.', test: (s) => s.playing && s.p.hi / s.p.lo >= 8 && s.changed },
    { id: 'forme', text: 'Change la forme du signal.', learned: 'La forme décide du chemin : le sinus glisse en douceur, la dent de scie monte puis retombe d’un coup, le carré saute d’une valeur à l’autre.', test: (s) => s.playing && s.o.forme !== 'sine' && s.changed },
  ],
  defaultMissions: ['lent', 'large', 'forme'],
  facts: [
    { id: 'signal.echantillon', text: 'Chaque note prend la valeur du signal au moment où elle commence, et la garde : avec `note("c2*8")`, la coupure change par marches, huit fois par cycle.' },
    { id: 'signal.range', text: '`sine.range(300, 2000)` fait aller le signal de 300 à 2000 : `sine` seul va de 0 à 1.' },
    { id: 'signal.slow', text: '`.slow(4)` étire le signal : un aller-retour complet prend 4 cycles au lieu d’un.' },
  ],
};
export default def;
