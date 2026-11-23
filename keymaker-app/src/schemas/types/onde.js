// Schéma « onde » : la forme d'une onde et ses harmoniques, côte à côte.
//
// Les quatre ondes de base de Strudel sont des OscillatorNode de Web Audio. Leur
// contenu est fixé par la norme Web Audio (série de Fourier de chaque forme) ; le
// banc de test le MESURE sur l'oscillateur réel (scripts/schemas-bench.js) : le
// dessin est donc celui de ce qui sonne.
import { codeNum } from '../core/format.js';

export const WAVES = {
  sine: { label: 'Sinusoïde', short: 'sine' },
  triangle: { label: 'Triangle', short: 'triangle' },
  square: { label: 'Carré', short: 'square' },
  sawtooth: { label: 'Dent de scie', short: 'sawtooth' },
};
export const NOTES = { c2: 36, c3: 48, c4: 60 };

// Coefficient de la n-ième harmonique (sinus), d'après la norme Web Audio (OscillatorNode).
export function coef(wave, n) {
  if (wave === 'sine') return n === 1 ? 1 : 0;
  if (wave === 'square') return n % 2 ? 4 / (n * Math.PI) : 0;
  if (wave === 'sawtooth') return ((n % 2 ? 1 : -1) * 2) / (n * Math.PI);
  if (wave === 'triangle') return (8 * Math.sin((n * Math.PI) / 2)) / (Math.PI * n) ** 2;
  return 0;
}
// Forme d'une période, échantillonnée (n points), normalisée à une crête de 1 comme le
// fait Web Audio. `maxH` = nombre d'harmoniques (l'oscillateur s'arrête sous la moitié
// de la fréquence d'échantillonnage).
export function period(wave, n = 256, maxH = 200) {
  const out = new Array(n).fill(0);
  for (let h = 1; h <= maxH; h++) {
    const b = coef(wave, h);
    if (!b) continue;
    for (let i = 0; i < n; i++) out[i] += b * Math.sin((2 * Math.PI * h * i) / n);
  }
  const peak = Math.max(...out.map(Math.abs)) || 1;
  return out.map((v) => v / peak);
}
// Niveau des harmoniques 1..n, par rapport à la première.
export function harmonics(wave, n = 16) {
  const b1 = Math.abs(coef(wave, 1));
  return Array.from({ length: n }, (_, i) => Math.abs(coef(wave, i + 1)) / b1);
}

const def = {
  id: 'onde',
  title: 'Les ondes',
  label: (st) => 'Onde ' + WAVES[st.o.onde].label.toLowerCase(),
  params: {},
  options: {
    onde: { label: 'Onde', values: Object.keys(WAVES), labels: Object.fromEntries(Object.entries(WAVES).map(([k, v]) => [k, v.label])), def: 'sawtooth' },
    note: { label: 'Hauteur', values: Object.keys(NOTES), labels: { c2: 'grave (c2)', c3: 'medium (c3)', c4: 'aigu (c4)' }, def: 'c3' },
  },
  paramCode: () => '',
  fromSpec(spec = {}) {
    return { p: {}, o: { onde: WAVES[spec.onde] ? spec.onde : 'sawtooth', note: NOTES[spec.note] != null ? spec.note : 'c3' } };
  },
  toSpec(st) {
    return { type: 'onde', onde: st.o.onde, note: st.o.note };
  },
  specKeys: (spec) => (Object.keys((spec && spec.reglages) || {}).length ? null : {}),
  code(st, { bypass = false } = {}) {
    return [{ t: 'note("' + st.o.note + '").sound("' }, { t: bypass ? 'sine' : st.o.onde, k: 'onde' }, { t: '")' }];
  },
  expect(st) {
    return { s: st.o.onde, notes: [NOTES[st.o.note]] };
  },
  warn: () => null,
  summary: (st) => `onde ${st.o.onde} (${WAVES[st.o.onde].label.toLowerCase()}), note ${st.o.note}`,
  describe: 'onde — forme d’une onde et ses harmoniques. onde : "sine" | "triangle" | "square" | "sawtooth" ; note : "c2" | "c3" | "c4". missions possibles : pure, creuse, brillante.',
  missions: [
    {
      id: 'pure',
      text: 'Pendant que ça joue, passe à la sinusoïde.',
      learned: 'Une seule barre : la sinusoïde n’a que sa fréquence de base, aucune harmonique. C’est pour ça qu’elle sonne si douce, presque comme un sifflement.',
      // Il faut venir d'une autre onde : sinon la mission serait gagnée sans geste.
      test: (s, m) => {
        if (s.playing && s.o.onde !== 'sine') m.other = true;
        return s.playing && s.o.onde === 'sine' && !!m.other;
      },
    },
    {
      id: 'creuse',
      text: 'Pendant que ça joue, passe au carré, et regarde ses barres.',
      learned: 'Une barre sur deux manque : le carré n’a que les harmoniques impaires (1, 3, 5…). C’est ce trou qui lui donne son son « creux ».',
      // Il faut venir d'une autre onde : sinon la mission serait gagnée sans geste.
      test: (s, m) => {
        if (s.playing && s.o.onde !== 'square') m.other = true;
        return s.playing && s.o.onde === 'square' && !!m.other;
      },
    },
    {
      id: 'brillante',
      text: 'Pendant que ça joue, passe (ou reviens) à la dent de scie.',
      learned: 'Toutes les barres sont là : la dent de scie a toutes les harmoniques. Plus un son en a dans l’aigu, plus il est brillant, et plus un filtre a de matière à sculpter.',
      // Il faut venir d'une autre onde : sinon la mission serait gagnée sans geste.
      test: (s, m) => {
        if (s.playing && s.o.onde !== 'sawtooth') m.other = true;
        return s.playing && s.o.onde === 'sawtooth' && !!m.other;
      },
    },
  ],
  defaultMissions: ['pure', 'creuse', 'brillante'],
  facts: [
    { id: 'onde.sinus', text: 'La sinusoïde (`sine`) n’a qu’une seule harmonique : sa fréquence de base.' },
    { id: 'onde.carre', text: 'Le carré (`square`) n’a que les harmoniques impaires (1, 3, 5…) ; la n-ième est n fois plus faible que la première.' },
    { id: 'onde.triangle', text: 'Le triangle (`triangle`) n’a lui aussi que les impaires, mais elles faiblissent beaucoup plus vite (n × n fois) : c’est pour ça qu’il est plus doux que le carré.' },
    { id: 'onde.scie', text: 'La dent de scie (`sawtooth`) a toutes les harmoniques ; la n-ième est n fois plus faible que la première.' },
  ],
  codeNum,
};

export default def;
