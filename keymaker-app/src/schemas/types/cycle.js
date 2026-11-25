// Schéma « cycle » : les événements RÉELS d'un motif de mini-notation, sur une ligne
// par cycle. Les événements viennent de queryArc sur le motif que Strudel construit
// (sound(mini(motif))) — les mêmes que pour la ligne de code sound("…"), vérifié par
// scripts/check-schemas.mjs. Le son est celui de superdough lui-même.
//
// Les missions regardent ce que le motif PRODUIT (snap.ev : événements des 4 premiers
// cycles, { b, e, s, c }), comme la validation des exercices.

const MAX = 120;
const cyc = (ev, c) => ev.filter((x) => x.c === c);
// Le motif a-t-il changé depuis le départ ? (et note le nombre d'événements de départ)
const changed = (s, m) => {
  if (m.motif0 == null) {
    m.motif0 = s.o.motif;
    m.n0 = cyc(s.ev || [], 0).length;
  }
  return !!s.playing && s.o.motif !== m.motif0;
};
const sig = (list) => list.map((x) => x.b.toFixed(4) + ':' + x.e.toFixed(4) + ':' + x.s).join('|');

const def = {
  id: 'cycle',
  title: 'Le cycle',
  label: () => 'Le cycle',
  params: {},
  options: {},
  paramCode: () => '',
  fromSpec(spec = {}) {
    return { p: {}, o: { motif: typeof spec.motif === 'string' ? spec.motif : 'bd hh sd hh', rows: [1, 2, 4].includes(spec.cycles) ? spec.cycles : null } };
  },
  toSpec: (st) => ({ type: 'cycle', motif: st.o.motif }),
  specKeys: (spec) => {
    if (Object.keys((spec && spec.reglages) || {}).length) return null;
    const m = spec && spec.motif;
    if (m != null && (typeof m !== 'string' || !m.trim() || m.length > MAX || /["'`\\]/.test(m))) return null;
    return {};
  },
  code: (st) => [{ t: 'sound("' }, { t: st.o.motif, k: 'motif' }, { t: '")' }],
  warn: () => null,
  summary: (st) => `cycle — motif "${st.o.motif}" (une ligne par cycle, événements réels du moteur)`,
  describe: 'cycle — les événements réels d’un motif de mini-notation, une ligne par cycle. motif : le texte entre guillemets de sound("…") (120 caractères au plus) ; cycles : 1, 2 ou 4 lignes. missions possibles : ajoute, silence, plus8, crochets, alterne, couches.',
  // Toutes les missions portent sur TON changement : le motif doit avoir changé depuis le
  // départ (aucune mission n'est gagnée sans geste, quel que soit le motif de la leçon).
  missions: [
    {
      id: 'ajoute',
      text: 'Ajoute un son au motif.',
      learned: 'Le cycle ne s’allonge pas : il garde la même durée, et chaque son devient plus court pour faire de la place. Les sons se partagent toujours le cycle en parts égales.',
      test: (s, m) => changed(s, m) && cyc(s.ev || [], 0).length > m.n0,
    },
    {
      id: 'silence',
      text: 'Remplace un son par `~` (ou touche un bloc du dessin).',
      learned: '`~` garde sa place dans le cycle, mais sans son : le temps passe quand même. Un silence fait partie du rythme.',
      test: (s, m) => changed(s, m) && /[~-]/.test(s.o.motif) && cyc(s.ev || [], 0).length < m.n0,
    },
    {
      id: 'plus8',
      text: 'Fais entendre au moins 8 sons dans un cycle (essaie `*8`).',
      learned: '`*` répète un son DANS sa place : `bd*8`, c’est huit sons serrés dans un seul cycle. Le cycle, lui, dure toujours pareil.',
      test: (s, m) => changed(s, m) && cyc(s.ev || [], 0).length >= 8,
    },
    {
      id: 'crochets',
      text: 'Mets deux sons dans la place d’un seul avec `[ ]`.',
      learned: 'Les crochets partagent UNE place en parts égales : `[hh hh]`, ce sont deux sons deux fois plus courts, dans le temps d’un seul.',
      test: (s, m) => changed(s, m) && /\[/.test(s.o.motif) && new Set(cyc(s.ev || [], 0).map((x) => (x.e - x.b).toFixed(4))).size >= 2,
    },
    {
      id: 'alterne',
      text: 'Avec `< >`, fais changer le motif d’un cycle à l’autre (ou change ce qui alterne).',
      learned: '`< >` prend un seul élément par cycle, à tour de rôle : regarde les lignes du dessin, elles ne sont plus pareilles.',
      test: (s, m) => {
        if (!changed(s, m) || !/</.test(s.o.motif) || /\?/.test(s.o.motif)) return false;
        const ev = s.ev || [];
        const rows = [0, 1, 2, 3].map((c) => sig(cyc(ev, c).map((x) => ({ ...x, b: x.b - c, e: x.e - c }))));
        return new Set(rows).size > 1;
      },
    },
    {
      id: 'couches',
      text: 'Ajoute une deuxième couche avec une virgule `,`.',
      learned: 'La virgule superpose deux motifs : ils jouent en même temps, chacun se partage le cycle à sa façon.',
      test: (s, m) => {
        if (!changed(s, m)) return false;
        const c0 = cyc(s.ev || [], 0);
        return /,/.test(s.o.motif) && c0.some((x, i) => c0.some((y, j) => i !== j && Math.abs(x.b - y.b) < 1e-9));
      },
    },
  ],
  defaultMissions: ['ajoute', 'silence', 'crochets'],
  facts: [
    { id: 'cycle.duree', text: 'Sans `setcpm`, un cycle dure 2 secondes dans Keymaker (0,5 cycle par seconde), quel que soit le nombre de sons.' },
    { id: 'cycle.partage', text: 'Les sons écrits côte à côte se partagent le cycle en parts égales : avec 4 sons, chacun dure un quart de cycle ; avec 5, un cinquième.' },
    { id: 'cycle.crochets', text: '`[ ]` partage une seule place : dans `bd [hh hh] sd hh`, chaque `hh` du groupe dure un huitième de cycle.' },
    { id: 'cycle.chevrons', text: '`< >` joue un seul de ses éléments par cycle, à tour de rôle : `<hh oh>` donne `hh` au 1er cycle, `oh` au 2e, puis recommence.' },
    { id: 'cycle.virgule', text: 'La virgule superpose : dans `bd*4, hh*8`, les 4 `bd` et les 8 `hh` jouent dans le même cycle.' },
    { id: 'cycle.silence', text: '`~` occupe une place sans produire de son : `bd ~ sd ~` ne joue que deux sons, aux mêmes endroits que dans `bd hh sd hh`.' },
  ],
};
export default def;
