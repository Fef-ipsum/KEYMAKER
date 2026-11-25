// Schéma « clavier » : deux octaves, les noms anglais et do-ré-mi, les demi-tons.
// Quatre façons de s'en servir (spec.mode) :
//   notes      toucher une touche la joue et l'ajoute à note("…")
//   intervalle deux touches, l'écart en demi-tons, jouées l'une après l'autre puis ensemble
//   gamme      n("0 … 7").scale("C:major") : chaque degré allume sa touche
//   accord     des tierces empilées ; plaqué ou en arpège
// Les touches allumées viennent des notes que le moteur Strudel produit pour la ligne de
// code (vérifié par le banc de test). Le son est le piano de Strudel (superdough).

export const SHARP = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
export const FLAT = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
export const FR = ['do', 'do♯', 'ré', 'ré♯', 'mi', 'fa', 'fa♯', 'sol', 'sol♯', 'la', 'la♯', 'si'];
export const FR_FLAT = ['do', 'ré♭', 'ré', 'mi♭', 'mi', 'fa', 'sol♭', 'sol', 'la♭', 'la', 'si♭', 'si'];
export const isBlack = (m) => [1, 3, 6, 8, 10].includes(((m % 12) + 12) % 12);
export const octaveOf = (m) => Math.floor(m / 12) - 1;
export const noteName = (m, flat = false) => (flat ? FLAT : SHARP)[((m % 12) + 12) % 12] + octaveOf(m);
export const frName = (m, flat = false) => (flat ? FR_FLAT : FR)[((m % 12) + 12) % 12];

// Nom d'un écart, par nombre de demi-tons (vérifiés avec transpose du moteur : 3m, 3M, 5P…).
export const INTERVALS = [
  ['unisson', '1P'], ['seconde mineure', '2m'], ['seconde majeure', '2M'], ['tierce mineure', '3m'], ['tierce majeure', '3M'],
  ['quarte', '4P'], ['triton', '4A'], ['quinte', '5P'], ['sixte mineure', '6m'], ['sixte majeure', '6M'],
  ['septième mineure', '7m'], ['septième majeure', '7M'], ['octave', '8P'],
];
export const SCALES = { major: 'majeure', minor: 'mineure', 'minor:pentatonic': 'pentatonique mineure', 'major:pentatonic': 'pentatonique majeure' };
// Accords : écarts depuis la fondamentale (vérifiés contre chord(…).voicing() du moteur).
export const CHORDS = { '': { label: 'majeur', st: [0, 4, 7] }, m: { label: 'mineur', st: [0, 3, 7] }, 7: { label: 'septième', st: [0, 4, 7, 10] }, '^7': { label: 'majeur 7', st: [0, 4, 7, 11] } };
const ROOT_SYMBOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const chordSymbol = (root, q) => ROOT_SYMBOL[root % 12] + q;
const NOTE_RE = /^([a-g])(#|b)?(-?\d)$/;
export function midiOf(name) {
  const m = NOTE_RE.exec(String(name || '').toLowerCase());
  if (!m) return null;
  const pc = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  return (Number(m[3]) + 1) * 12 + pc;
}

const LO = 36; // c2
const HI = 84; // c6

const def = {
  id: 'clavier',
  title: 'Le clavier',
  label: (st) => ({ notes: 'Le clavier', intervalle: 'Les intervalles', gamme: 'Les gammes', accord: 'Les accords' }[st.o.mode]),
  params: {},
  options: {
    mode: { label: 'Mode', values: ['notes', 'intervalle', 'gamme', 'accord'], def: 'notes' },
  },
  paramCode: () => '',
  fromSpec(spec = {}) {
    const mode = ['notes', 'intervalle', 'gamme', 'accord'].includes(spec.mode) ? spec.mode : 'notes';
    const seq = String(spec.notes || 'c3 e3 g3').split(/\s+/).map(midiOf).filter((x) => x != null);
    const a = midiOf(spec.a) ?? 48;
    const b = midiOf(spec.b) ?? 55;
    const [tonic, ...type] = String(spec.gamme || 'C:major').split(':');
    const root = midiOf(tonic.toLowerCase() + (/\d/.test(tonic) ? '' : '3')) ?? 48;
    const scale = SCALES[type.join(':')] ? type.join(':') : 'major';
    const [cr, cq] = /^([A-G]b?)(.*)$/.exec(spec.accord || 'C').slice(1);
    const croot = 48 + ROOT_SYMBOL.indexOf(cr);
    const start = midiOf(spec.depuis) ?? 48;
    return {
      p: {},
      o: { mode, seq: seq.length ? seq : [48, 52, 55], a, b, root, scale, croot: croot >= 48 ? croot : 48, quality: CHORDS[cq] ? cq : '', arp: !!spec.arpege, start: Math.min(Math.max(start, LO), HI - 24) },
    };
  },
  toSpec(st) {
    const o = st.o;
    if (o.mode === 'notes') return { type: 'clavier', mode: 'notes', notes: o.seq.map((m) => noteName(m)).join(' ') };
    if (o.mode === 'intervalle') return { type: 'clavier', mode: 'intervalle', a: noteName(o.a, true), b: noteName(o.b, true) };
    if (o.mode === 'gamme') return { type: 'clavier', mode: 'gamme', gamme: ROOT_SYMBOL[o.root % 12] + octaveOf(o.root) + ':' + o.scale };
    return { type: 'clavier', mode: 'accord', accord: chordSymbol(o.croot, o.quality), arpege: o.arp };
  },
  specKeys: (spec) => {
    if (Object.keys((spec && spec.reglages) || {}).length) return null;
    const bad = (n) => n != null && midiOf(n) == null;
    if (bad(spec.a) || bad(spec.b) || bad(spec.depuis)) return null;
    if (spec.notes != null && String(spec.notes).split(/\s+/).some((n) => midiOf(n) == null)) return null;
    if (spec.gamme != null && !/^[A-G]b?\d?:(major|minor|minor:pentatonic|major:pentatonic)$/.test(spec.gamme)) return null;
    if (spec.accord != null && !/^[A-G]b?(|m|7|\^7)$/.test(spec.accord)) return null;
    return {};
  },
  // Les notes de l'accord (fondamentale + écarts).
  chordNotes: (st) => CHORDS[st.o.quality].st.map((x) => st.o.croot + x),
  // La ligne de code (et ce que le moteur doit en tirer).
  codeText(st) {
    const o = st.o;
    if (o.mode === 'notes') return `note("${o.seq.map((m) => noteName(m)).join(' ')}").sound("piano")`;
    if (o.mode === 'intervalle') {
      const a = noteName(o.a, true);
      const b = noteName(o.b, true);
      return `note("${a} ${b} [${a},${b}] ~").sound("piano")`;
    }
    if (o.mode === 'gamme') return `n("0 1 2 3 4 5 6 7").scale("${ROOT_SYMBOL[o.root % 12]}${octaveOf(o.root)}:${o.scale}").sound("piano")`;
    const names = def.chordNotes(st).map((m) => noteName(m, true));
    return o.arp ? `note("${names.join(' ')}").sound("piano")` : `note("[${names.join(',')}]").sound("piano")`;
  },
  code: (st) => [{ t: def.codeText(st), k: 'all' }],
  warn: () => null,
  summary(st) {
    const o = st.o;
    if (o.mode === 'notes') return `clavier — notes ${o.seq.map((m) => noteName(m)).join(' ')}`;
    if (o.mode === 'intervalle') return `intervalle — ${noteName(o.a, true)} → ${noteName(o.b, true)} : ${Math.abs(o.b - o.a)} demi-tons`;
    if (o.mode === 'gamme') return `gamme — ${ROOT_SYMBOL[o.root % 12]} ${SCALES[o.scale]}`;
    return `accord — ${chordSymbol(o.croot, o.quality)} (${CHORDS[o.quality].label})${o.arp ? ', en arpège' : ', plaqué'}`;
  },
  describe:
    'clavier — deux octaves de piano. mode : "notes" (notes : "c3 e3 g3") | "intervalle" (a : "c3", b : "e3") | "gamme" (gamme : "C:major", "A:minor", "A:minor:pentatonic", "C:major:pentatonic") | "accord" (accord : "C", "Cm", "C7", "C^7" ; arpege : true|false). ' +
    'missions possibles : octave, demiton, melodie (notes) ; quinte, tierce-mineure, tierce-majeure (intervalle) ; mineure, penta, tonique (gamme) ; mineur, septieme, arpege (accord).',
  // snap.taps : nombre de gestes depuis l'ouverture (aucune mission sans geste).
  missions: [
    { id: 'octave', text: 'Touche un do, puis le do suivant.', learned: 'La même note, en plus aigu : 12 demi-tons plus haut, c’est une octave. Le chiffre change (c3 → c4), le nom reste.', test: (s) => s.taps > 0 && s.o.mode === 'notes' && s.o.seq.slice(-2).length === 2 && Math.abs(s.o.seq.slice(-1)[0] - s.o.seq.slice(-2)[0]) === 12 },
    { id: 'demiton', text: 'Touche deux touches voisines, noire comprise.', learned: 'Deux touches voisines : un demi-ton, le plus petit pas du clavier. Une touche noire a deux noms : c# (do dièse) = db (ré bémol).', test: (s) => s.taps > 0 && s.o.mode === 'notes' && s.o.seq.length >= 2 && Math.abs(s.o.seq.slice(-1)[0] - s.o.seq.slice(-2)[0]) === 1 },
    { id: 'melodie', text: 'Compose une mélodie d’au moins 5 notes.', learned: 'Ta mélodie est écrite dans le code : chaque note a pris un cinquième du cycle. Garde-la, ou recopie-la dans le Studio.', test: (s) => s.taps >= 5 && s.o.mode === 'notes' && s.o.seq.length >= 5 },
    { id: 'quinte', text: 'Trouve une quinte : 7 demi-tons d’écart.', learned: 'La quinte sonne « ouverte » et stable : c’est l’intervalle des accords de puissance du rock et des basses qui sautent.', test: (s) => s.taps > 0 && s.o.mode === 'intervalle' && Math.abs(s.o.b - s.o.a) === 7 },
    { id: 'tierce-mineure', text: 'Trouve une tierce mineure : 3 demi-tons.', learned: 'Trois demi-tons : la tierce mineure, la couleur « sombre » des accords mineurs.', test: (s) => s.taps > 0 && s.o.mode === 'intervalle' && Math.abs(s.o.b - s.o.a) === 3 },
    { id: 'tierce-majeure', text: 'Trouve une tierce majeure : 4 demi-tons.', learned: 'Quatre demi-tons : la tierce majeure, la couleur « claire » des accords majeurs. Un seul demi-ton la sépare de la mineure.', test: (s) => s.taps > 0 && s.o.mode === 'intervalle' && Math.abs(s.o.b - s.o.a) === 4 },
    { id: 'mineure', text: 'Passe la gamme en mineure.', learned: 'Mêmes touches de départ et d’arrivée, mais la 3e, la 6e et la 7e note descendent d’un demi-ton : c’est ce qui assombrit la gamme.', test: (s) => s.taps > 0 && s.o.mode === 'gamme' && s.o.scale === 'minor' },
    { id: 'penta', text: 'Essaie une gamme pentatonique.', learned: 'Cinq notes au lieu de sept, et plus aucun demi-ton entre deux voisines : c’est pour ça qu’on ne peut presque pas y jouer « faux ».', test: (s) => s.taps > 0 && s.o.mode === 'gamme' && /pentatonic/.test(s.o.scale) },
    { id: 'tonique', text: 'Change de tonique : touche une autre touche.', learned: 'Tout le dessin des tons et demi-tons se déplace avec la tonique : la gamme garde sa couleur, elle commence juste ailleurs.', test: (s) => s.taps > 0 && s.o.mode === 'gamme' && s.o.root !== s.root0 },
    { id: 'mineur', text: 'Rends l’accord mineur.', learned: 'Seule la note du milieu bouge, d’un demi-ton vers le bas : la tierce du bas devient mineure (3 demi-tons) et l’accord s’assombrit.', test: (s) => s.taps > 0 && s.o.mode === 'accord' && s.o.quality === 'm' },
    { id: 'septieme', text: 'Ajoute une septième.', learned: 'Une tierce de plus empilée au-dessus : l’accord a maintenant quatre notes, et une tension qui demande à aller ailleurs.', test: (s) => s.taps > 0 && s.o.mode === 'accord' && (s.o.quality === '7' || s.o.quality === '^7') },
    { id: 'arpege', text: 'Joue l’accord en arpège.', learned: 'Les mêmes notes, mais l’une après l’autre : un arpège, c’est un accord étalé dans le temps.', test: (s) => s.taps > 0 && s.o.mode === 'accord' && s.o.arp },
  ],
  defaultMissions: [],
  modeMissions: { notes: ['octave', 'demiton', 'melodie'], intervalle: ['quinte', 'tierce-mineure', 'tierce-majeure'], gamme: ['mineure', 'penta', 'tonique'], accord: ['mineur', 'septieme', 'arpege'] },
  facts: [
    { id: 'clavier.octave', modes: ['notes', 'intervalle'], text: '`c4` est une octave au-dessus de `c3` : 12 demi-tons plus haut, et une fréquence exactement deux fois plus grande.' },
    { id: 'clavier.sans-chiffre', modes: ['notes'], text: 'Une note écrite sans chiffre est à l’octave 3 : `c` = `c3`.' },
    { id: 'clavier.demi-ton', modes: ['notes', 'intervalle'], text: 'Entre deux touches voisines, noire comprise : un demi-ton. `c#3` et `db3` désignent la même touche.' },
    { id: 'intervalle.noms', modes: ['intervalle'], text: '3 demi-tons = tierce mineure, 4 = tierce majeure, 7 = quinte, 12 = octave.' },
    { id: 'gamme.majeure', modes: ['gamme'], text: 'La gamme majeure enchaîne : ton, ton, demi-ton, ton, ton, ton, demi-ton.' },
    { id: 'gamme.mineure', modes: ['gamme'], text: 'La gamme mineure (`minor`) enchaîne : ton, demi-ton, ton, ton, demi-ton, ton, ton.' },
    { id: 'gamme.penta', modes: ['gamme'], text: 'Une gamme pentatonique a 5 notes par octave, sans aucun demi-ton entre deux voisines.' },
    { id: 'accord.majeur-mineur', modes: ['accord'], text: 'Un accord majeur empile une tierce majeure (4 demi-tons) puis une tierce mineure (3) ; un accord mineur, l’inverse.' },
    { id: 'accord.septieme', modes: ['accord'], text: '`C7` ajoute une septième mineure (10 demi-tons au-dessus de do). L’accord majeur 7 s’écrit `C^7` dans Strudel.' },
  ],
};

export default def;
