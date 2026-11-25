// Schéma « filtre » : la courbe d'un filtre et les harmoniques de la note qui joue.
//
// Ce qu'on entend : une dent de scie (toutes les harmoniques) passée dans un filtre
// de Strudel. Ce qu'on voit : la réponse du filtre (getFrequencyResponse d'un filtre
// réglé comme celui qui joue) et, pour chaque harmonique de la note en cours, son
// niveau brut (trait gris) et son niveau après le filtre (trait doré).
//
// Données pures : réglages, code Strudel, missions, faits du « Creuser ».
// Le son est dans ../ui/filtreSound.js, le dessin dans ../ui/FiltreSchema.jsx.
import { qFreq, qInt, frHz, frNum } from '../core/format.js';

// Les trois filtres de Strudel : même schéma, autre forme. Les noms du code changent.
export const KINDS = {
  'passe-bas': { node: 'lowpass', f: 'lpf', q: 'lpq', ctl: ['cutoff', 'resonance'], label: 'passe-bas', wiki: 'fx.lpf' },
  'passe-haut': { node: 'highpass', f: 'hpf', q: 'hpq', ctl: ['hcutoff', 'hresonance'], label: 'passe-haut', wiki: 'fx.hpf' },
  'passe-bande': { node: 'bandpass', f: 'bpf', q: 'bpq', ctl: ['bandf', 'bandq'], label: 'passe-bande', wiki: 'fx.bpf' },
};
const kindOfKey = Object.fromEntries(Object.entries(KINDS).flatMap(([k, v]) => [[v.f, k], [v.q, k]]));

export const SOURCES = {
  basse: { label: 'Ligne de basse', notes: 'c2 c2 eb2 c2 g2 c2 bb1 c2', midi: [36, 36, 39, 36, 43, 36, 34, 36] },
  repetee: { label: 'Note répétée', notes: 'c2*8', midi: [36, 36, 36, 36, 36, 36, 36, 36] },
  tenue: { label: 'Note tenue', notes: 'c2', midi: [36] },
};

const num = (v) => (typeof v === 'number' ? v : parseFloat(v));

const def = {
  id: 'filtre',
  title: 'Le filtre',
  label: (st) => 'Filtre ' + KINDS[st.o.kind].label,
  // Réglages. `code` : le nom écrit dans le code dépend du genre de filtre.
  params: {
    f: { label: 'Coupure', min: 30, max: 18000, scale: 'log', def: 600, q: qFreq, fmt: frHz, step: 1.03 },
    q: { label: 'Résonance', hint: 'la bosse', min: 0, max: 30, scale: 'lin', def: 0, q: qInt, fmt: (v) => frNum(v, 0), step: 1 },
  },
  options: {
    kind: { label: 'Genre de filtre', values: Object.keys(KINDS), def: 'passe-bas' },
    source: { label: 'Ce qui joue', values: Object.keys(SOURCES), labels: Object.fromEntries(Object.entries(SOURCES).map(([k, v]) => [k, v.label])), def: 'basse' },
  },
  paramCode: (st, k) => KINDS[st.o.kind][k],

  // Données (leçon, wiki, Sati) → état. On écrit les réglages avec leurs noms du code :
  // { lpf: 600, lpq: 0 } ou { hpf: 800, hpq: 5 } (le genre de filtre s'en déduit).
  fromSpec(spec = {}) {
    const r = spec.reglages || {};
    const keys = Object.keys(r);
    const kind = spec.filtre && KINDS[spec.filtre] ? spec.filtre : keys.length && kindOfKey[keys[0]] ? kindOfKey[keys[0]] : 'passe-bas';
    const k = KINDS[kind];
    // Résonance non écrite : Strudel prend 1 (valeur par défaut de superdough), et le
    // code n'affiche pas `.lpq(…)` tant qu'on n'y touche pas.
    const implicitQ = r[k.q] == null;
    return {
      p: { f: r[k.f] != null ? num(r[k.f]) : 600, q: implicitQ ? 1 : num(r[k.q]) },
      o: { kind, source: spec.source && SOURCES[spec.source] ? spec.source : 'basse' },
      implicit: implicitQ ? ['q'] : [],
    };
  },
  toSpec(st) {
    const k = KINDS[st.o.kind];
    const r = { [k.f]: st.p.f };
    if (!(st.implicit || []).includes('q')) r[k.q] = st.p.q;
    return { type: 'filtre', reglages: r, source: st.o.source };
  },
  // Clés acceptées dans `reglages` (validation des blocs de Sati).
  specKeys: (spec) => {
    const keys = Object.keys((spec && spec.reglages) || {});
    const kinds = new Set(keys.map((x) => kindOfKey[x]));
    if (keys.some((x) => !kindOfKey[x]) || kinds.size > 1) return null;
    const kind = [...kinds][0] || 'passe-bas';
    return { [KINDS[kind].f]: 'f', [KINDS[kind].q]: 'q' };
  },

  // La ligne de code : exactement ce qu'on entend. Morceaux { t, k } : k = réglage qui brille.
  code(st, { bypass = false } = {}) {
    const k = KINDS[st.o.kind];
    const parts = [{ t: 'note("' + SOURCES[st.o.source].notes + '").sound("sawtooth")' }];
    const fx = [{ t: '.' + k.f + '(' }, { t: String(st.p.f), k: 'f' }, { t: ')' }];
    if (!(st.implicit || []).includes('q')) fx.push({ t: '.' + k.q + '(' }, { t: String(st.p.q), k: 'q' }, { t: ')' });
    return bypass ? [...parts, ...fx.map((x) => ({ ...x, off: true }))] : [...parts, ...fx];
  },
  // Valeurs attendues quand ce code est évalué par Strudel (test d'exactitude n° 3).
  expect(st) {
    const k = KINDS[st.o.kind];
    const out = { [k.ctl[0]]: st.p.f, s: 'sawtooth', notes: SOURCES[st.o.source].midi };
    out[k.ctl[1]] = (st.implicit || []).includes('q') ? undefined : st.p.q;
    return out;
  },

  warn(st) {
    if (st.p.q > 20 && st.o.kind !== 'passe-bande') return 'Résonance très forte : le filtre peut siffler fort. Le limiteur protège tes oreilles ; baisse quand même le volume de l’appareil.';
    return null;
  },

  // Pour Sati : ce qui est à l'écran, en une ligne.
  summary(st) {
    const k = KINDS[st.o.kind];
    return `filtre ${k.label} — ${k.f} ${st.p.f} Hz, ${k.q} ${st.p.q}, source : ${SOURCES[st.o.source].label.toLowerCase()}`;
  },
  describe:
    'filtre — courbe d’un filtre (passe-bas, passe-haut ou passe-bande) et harmoniques d’une dent de scie. ' +
    'reglages : {lpf, lpq} ou {hpf, hpq} ou {bpf, bpq} ; fréquence 30 à 18000, résonance 0 à 30 (absente = 1, la valeur par défaut). ' +
    'source : "basse" (note("c2 c2 eb2 c2 g2 c2 bb1 c2")) | "repetee" (note("c2*8")) | "tenue" (note("c2")). regler : liste des réglages modifiables (facultatif). ' +
    'filtres : liste des genres que Felix peut choisir (facultatif). missions possibles : ferme, ouvre, siffle, acid (passe-bas), allege (passe-haut), etroit (passe-bande).',

  // Question « retrouve le réglage » : tolérances. Fréquence : en octaves (l'oreille
  // entend des rapports, pas des écarts en hertz). Résonance : en valeur.
  tolerance: { f: { octaves: 0.5 }, q: { abs: 4 } },
  earHint(st, target) {
    const d = Math.log2(st.p.f / target.p.f);
    const out = [];
    if (Math.abs(d) > 0.5) out.push(d > 0 ? 'ton filtre est plus ouvert (plus brillant) que le son mystère' : 'ton filtre est plus fermé (plus sombre) que le son mystère');
    const dq = st.p.q - target.p.q;
    if (Math.abs(dq) > 4) out.push(dq > 0 ? 'ta résonance est plus forte' : 'le son mystère a plus de résonance (il « chante » plus)');
    return out;
  },

  missions: [
    {
      id: 'ferme',
      text: 'Pendant que ça joue, ferme le filtre sous 300 Hz.',
      learned: 'Sous 300 Hz, seules les premières harmoniques passent : la note est toujours là, mais ses aigus ont disparu. C’est ça, un son « sombre ».',
      test: (s) => s.playing && s.o.kind === 'passe-bas' && s.p.f < 300,
    },
    {
      id: 'ouvre',
      text: 'Ouvre le filtre en grand : au-dessus de 5 000 Hz.',
      learned: 'Les harmoniques aiguës reviennent : la dent de scie retrouve tout son brillant. Grand ouvert, un passe-bas ne change presque plus rien.',
      test: (s) => s.playing && s.o.kind === 'passe-bas' && s.p.f > 5000,
    },
    {
      id: 'allege',
      kinds: ['passe-haut'],
      text: 'En passe-haut, monte la coupure au-dessus de 400 Hz pendant que ça joue.',
      learned: 'Le passe-haut retire le bas : la note de base et les premières harmoniques disparaissent, le son devient fin, sans poids. C’est ce qu’on fait pour laisser la place à la basse.',
      test: (s) => s.playing && s.o.kind === 'passe-haut' && s.p.f >= 400,
    },
    {
      id: 'etroit',
      kinds: ['passe-bande'],
      text: 'En passe-bande, resserre la bande : `bpq` d’au moins 8.',
      learned: 'Il ne reste qu’une bande étroite autour de la fréquence choisie : le son devient nasillard. Balaie-la : les harmoniques ressortent une à une.',
      test: (s) => s.playing && s.o.kind === 'passe-bande' && s.p.q >= 8,
    },
    {
      id: 'siffle',
      text: 'Monte la bosse : une résonance d’au moins 15.',
      learned: 'À la coupure, le filtre ajoute autant de décibels que la valeur de la résonance. Les harmoniques qui tombent sous la bosse ressortent : c’est elles que tu entends siffler.',
      test: (s) => s.playing && s.p.q >= 15,
    },
    {
      id: 'acid',
      text: 'Résonance d’au moins 15, puis balaie la coupure de moins de 400 Hz à plus de 2 000 Hz.',
      learned: 'La bosse passe sur les harmoniques une à une, et chacune chante à son tour. Ce balayage est le son « acid ».',
      test: (s, m) => {
        if (!s.playing || s.p.q < 15 || s.o.kind !== 'passe-bas') {
          m.low = false;
          return false;
        }
        if (s.p.f < 400) m.low = true;
        return m.low && s.p.f > 2000;
      },
    },
  ],
  defaultMissions: ['ferme', 'siffle', 'acid'],

  // Le « Creuser ». Chaque fait a sa preuve dans docs/SCHEMAS.md (§ Faits vérifiés).
  facts: [
    { id: 'filtre.q-db', kinds: ['passe-bas'], text: 'À la fréquence de coupure, un passe-bas ajoute exactement autant de décibels que la valeur de `lpq` : `lpq(15)` donne +15 dB à la coupure.' },
    { id: 'filtre.pente', kinds: ['passe-bas'], text: 'Au-dessus de la coupure, le passe-bas de Strudel retire au moins 12 dB par octave : chaque fois que la fréquence double, le son devient au moins quatre fois plus faible.' },
    { id: 'filtre.q-defaut', text: 'Sans `.lpq(…)` (ou `.hpq(…)`, `.bpq(…)`) dans le code, la résonance vaut 1, pas 0.' },
    { id: 'filtre.scie', text: 'Une dent de scie contient toutes les harmoniques : 2, 3, 4… fois la fréquence de la note. La n-ième est n fois plus faible que la première. C’est pour ça qu’elle est brillante, et qu’un filtre a beaucoup à retirer.' },
    { id: 'filtre.raccourci', kinds: ['passe-bas'], text: '`.lpf("800:12")` règle la coupure ET la résonance en une seule fois.' },
    { id: 'filtre.hpq-db', kinds: ['passe-haut'], text: 'À la coupure, un passe-haut ajoute exactement autant de décibels que la valeur de `hpq`, comme le passe-bas avec `lpq`.' },
    { id: 'filtre.bpf-centre', kinds: ['passe-bande'], text: 'Un passe-bande laisse passer sa fréquence centrale telle quelle (0 dB) ; plus `bpq` est grand, plus la bande qui passe est étroite.' },
    { id: 'filtre.24db', text: 'Le filtre de Strudel est un filtre de Web Audio (« biquad »). `.ftype("24db")` en met deux à la suite : la pente est alors deux fois plus raide.' },
  ],
};

export default def;
