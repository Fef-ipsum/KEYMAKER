// Défis vérifiés : des MODÈLES de consigne, tirés au hasard avec leurs paramètres.
//
// Chaque instance a une clé stable (« couche.3 », « basse.a-minor »…) et fournit :
//   title, brief  la consigne (liens wiki permis : [texte](id))
//   code          le code de départ (il ne doit PAS valider)
//   solution      une solution générée (elle doit valider)
//   check(c)      true | 'indice' — même contexte que les exercices (src/lib/check.js)
//   ok            la phrase affichée quand c'est réussi
// scripts/check-content.mjs vérifie TOUTES les instances dans le moteur (départ refusé,
// solution acceptée) et scripts/check-hints.mjs leur « où chercher ».

const PC_FR = ['do', 'do♯', 'ré', 'mi♭', 'mi', 'fa', 'fa♯', 'sol', 'la♭', 'la', 'si♭', 'si'];
const nameOf = (m) => PC_FR[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
const pcOf = (m) => ((Math.round(m) % 12) + 12) % 12;
const ord = (n) => (n === 1 ? '1ᵉʳ' : n + 'ᵉ');

// Événements des 4 premiers cycles, rangés par cycle.
function byCycle(c, pred = () => true) {
  const out = [[], [], [], []];
  for (const e of c.haps4) {
    if (!pred(e)) continue;
    const k = Math.floor(e.begin + 1e-9);
    if (k >= 0 && k < 4) out[k].push(e);
  }
  return out;
}

/* --- 1. Une couche qui entre au Nᵉ cycle ------------------------------------------ */
const couche = [2, 3, 4].map((N) => {
  const mask = '<' + [0, 1, 2, 3].map((k) => (k < N - 1 ? 0 : 1)).join(' ') + '>';
  const start = 'setcpm(128/4)\n$: s("bd*4").bank("RolandTR909")\n$: s("hh*8").bank("RolandTR909").gain(.6)';
  return {
    key: 'couche.' + N,
    family: 'couche',
    title: `Une couche qui entre au ${ord(N)} cycle`,
    brief:
      `Le kick joue dès le début. Fais entrer le charleston au ${ord(N)} cycle : sur chaque groupe de 4 cycles, il se tait pendant ` +
      (N === 2 ? 'le premier' : `les ${N - 1} premiers`) +
      ` et joue à partir du ${ord(N)}. Le kick, lui, ne s’arrête jamais. Un outil possible : [mask](fn.mask).`,
    code: start,
    solution: start + `.mask("${mask}")`,
    check(c) {
      const bd = byCycle(c, (e) => e.s === 'bd');
      const hh = byCycle(c, (e) => e.s === 'hh');
      const k0 = bd.findIndex((x) => !x.length);
      if (k0 >= 0) return `Le kick doit jouer à chaque cycle, or il se tait au ${ord(k0 + 1)} cycle : laisse sa ligne telle quelle.`;
      for (let k = 0; k < N - 1; k++) if (hh[k].length) return `Le charleston joue déjà au ${ord(k + 1)} cycle : il doit se taire jusqu’au ${ord(N)}. Avec \`mask\`, un 0 par cycle muet et un 1 par cycle joué, entre chevrons \`< >\`.`;
      for (let k = N - 1; k < 4; k++) if (!hh[k].length) return `Le charleston doit jouer à partir du ${ord(N)} cycle et ne plus s’arrêter, or il se tait au ${ord(k + 1)}.`;
      return true;
    },
    ok: `Le charleston arrive au ${ord(N)} cycle : un morceau s’installe ainsi, une couche après l’autre.`,
  };
});

/* --- 2. Une basse dans une tonalité ------------------------------------------------ */
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10]; // mineur naturel : la gamme « minor » de Strudel
const TONICS = [
  { id: 'c', fr: 'do', code: 'C', pc: 0 },
  { id: 'd', fr: 'ré', code: 'D', pc: 2 },
  { id: 'e', fr: 'mi', code: 'E', pc: 4 },
  { id: 'f', fr: 'fa', code: 'F', pc: 5 },
  { id: 'g', fr: 'sol', code: 'G', pc: 7 },
  { id: 'a', fr: 'la', code: 'A', pc: 9 },
];
const basse = [];
for (const t of TONICS) {
  for (const mode of ['major', 'minor']) {
    const steps = mode === 'major' ? MAJOR : MINOR;
    const pcs = new Set(steps.map((s) => (t.pc + s) % 12));
    const modeFr = mode === 'major' ? 'majeur' : 'mineur';
    const tail = '.s("sawtooth").lpf(500).decay(.2).sustain(0)';
    basse.push({
      key: `basse.${t.id}-${mode}`,
      family: 'basse',
      title: `Une basse en ${t.fr} ${modeFr}`,
      brief:
        `Remplace cette basse par une ligne qui reste dans la [gamme](sol.gamme) de ${t.fr} ${modeFr}` +
        (mode === 'minor' ? ' (le mineur naturel, celui de `scale("' + t.code + ':minor")`)' : '') +
        ` : au moins 4 notes par cycle, au moins 3 hauteurs différentes, la [tonique](sol.tonique) ${t.fr} au moins une fois, et toutes les notes sous le do3 (MIDI 48).`,
      code: 'note("c2 eb2 gb2 a2")' + tail,
      solution: `n("0 2 4 2").scale("${t.code}1:${mode}")` + tail,
      check(c) {
        const all = c.notes4();
        if (!all.length) return 'Joue des notes : `note("…")`, ou des degrés avec `n("…").scale("…")`.';
        if (c.notes().length < 4) return `Il faut au moins 4 notes par cycle (le premier cycle en a ${c.notes().length}).`;
        const out = all.find((m) => !pcs.has(pcOf(m)));
        if (out != null) return `${nameOf(Math.round(out))} (MIDI ${Math.round(out)}) n’est pas dans la gamme de ${t.fr} ${modeFr}. Avec \`n("…").scale("${t.code}1:${mode}")\`, chaque nombre est un degré de la gamme : impossible d’en sortir.`;
        const high = all.find((m) => m >= 48);
        if (high != null) return `${nameOf(Math.round(high))} (MIDI ${Math.round(high)}) est trop aigu : toutes les notes doivent être sous le do3 (MIDI 48). Descends d’une octave.`;
        if (new Set(all.map(pcOf)).size < 3) return 'Au moins 3 hauteurs différentes : une basse qui bouge.';
        if (!all.some((m) => pcOf(m) === t.pc)) return `La tonique, ${t.fr}, doit sonner au moins une fois : c’est elle qui installe la tonalité.`;
        return true;
      },
      ok: `Toutes tes notes sont dans la gamme de ${t.fr} ${modeFr}, et la tonique est là : l’oreille entend la tonalité.`,
    });
  }
}

/* --- 3. Un accord parfait ---------------------------------------------------------- */
// Notes écrites comme un musicien les nomme (fa♯ et non sol♭ dans ré majeur).
const CHORDS = [
  ['d', 'ré', 'major', ['d3', 'f#3', 'a3']],
  ['d', 'ré', 'minor', ['d3', 'f3', 'a3']],
  ['e', 'mi', 'major', ['e3', 'g#3', 'b3']],
  ['e', 'mi', 'minor', ['e3', 'g3', 'b3']],
  ['f', 'fa', 'major', ['f3', 'a3', 'c4']],
  ['f', 'fa', 'minor', ['f3', 'ab3', 'c4']],
  ['g', 'sol', 'major', ['g3', 'b3', 'd4']],
  ['g', 'sol', 'minor', ['g3', 'bb3', 'd4']],
  ['a', 'la', 'major', ['a3', 'c#4', 'e4']],
  ['a', 'la', 'minor', ['a3', 'c4', 'e4']],
  ['bb', 'si♭', 'major', ['bb3', 'd4', 'f4']],
  ['bb', 'si♭', 'minor', ['bb3', 'db4', 'f4']],
];
const ROOT_PC = { d: 2, e: 4, f: 5, g: 7, a: 9, bb: 10 };
const accord = CHORDS.map(([id, fr, q, notes]) => {
  const root = ROOT_PC[id];
  const third = q === 'major' ? 4 : 3;
  const target = [root, (root + third) % 12, (root + 7) % 12].sort((a, b) => a - b).join(',');
  const qFr = q === 'major' ? 'majeur' : 'mineur';
  return {
    key: `accord.${id}-${q}`,
    family: 'accord',
    title: `L’accord de ${fr} ${qFr}`,
    brief:
      `Fais sonner l’[accord](sol.accord) parfait de ${fr} ${qFr} : ses trois notes EN MÊME TEMPS (la fondamentale ${fr}, la tierce ${q === 'major' ? 'majeure' : 'mineure'}, la quinte). ` +
      'L’octave et l’ordre des notes sont libres ; tu peux doubler une note à l’octave.',
    code: 'note("[c3,e3,g3]").s("piano")',
    solution: `note("[${notes.join(',')}]").s("piano")`,
    check(c) {
      const chords = c.chords(c.haps4).filter((ch) => ch.length >= 2);
      if (!chords.length) return 'Les notes doivent sonner ENSEMBLE : entre crochets, séparées par des [virgules](mini.virgule), comme `note("[c3,e3,g3]")`.';
      const found = chords.map((ch) => [...new Set(ch.map(pcOf))].sort((a, b) => a - b));
      if (found.some((s) => s.join(',') === target)) return true;
      const last = chords[chords.length - 1];
      return `Ton accord (${last.map((m) => nameOf(Math.round(m))).join(', ')}) n’est pas ${fr} ${qFr}. Pars de ${fr}, la fondamentale ; la tierce est ${third} [demi-tons](sol.demi-ton) au-dessus, la quinte 7 demi-tons au-dessus de ${fr}.`;
    },
    ok: `${fr[0].toUpperCase() + fr.slice(1)} ${qFr} : fondamentale, tierce ${q === 'major' ? 'majeure (4 demi-tons)' : 'mineure (3 demi-tons)'} et quinte (7 demi-tons), jouées ensemble.`,
  };
});

/* --- 4. Un rythme euclidien -------------------------------------------------------- */
// Un rythme euclidien répartit p coups sur n pas le plus régulièrement possible. Toutes
// ces répartitions sont des rotations l'une de l'autre : on accepte n'importe laquelle.
function evenSet(p, n) {
  return Array.from({ length: p }, (_, i) => Math.floor((i * n) / p));
}
function isRotationOf(steps, p, n) {
  const want = evenSet(p, n);
  const have = new Set(steps);
  for (let r = 0; r < n; r++) if (want.every((s) => have.has((s + r) % n))) return true;
  return false;
}
const EUCLID = [[3, 8], [5, 8], [2, 5], [3, 5], [4, 7], [5, 12], [7, 12], [5, 16], [7, 16], [9, 16]];
const euclide = EUCLID.map(([p, n]) => ({
  key: `euclide.${p}-${n}`,
  family: 'euclide',
  title: `Un rythme euclidien : ${p} coups sur ${n} pas`,
  brief: `Fais jouer le kick ${p} fois par cycle, répartis le plus régulièrement possible sur une grille de ${n} pas : un [rythme euclidien](mini.euclide). Le premier coup peut tomber sur n’importe quel pas.`,
  code: 's("bd*4").bank("RolandTR909")',
  solution: `s("bd(${p},${n})").bank("RolandTR909")`,
  check(c) {
    const on = c.haps.filter((e) => e.s === 'bd').map((e) => e.begin);
    if (on.length !== p) return `Il faut ${p} coups de kick par cycle (le premier cycle en a ${on.length}).`;
    const steps = on.map((t) => t * n);
    if (steps.some((s) => Math.abs(s - Math.round(s)) > 1e-6)) return `Chaque coup doit tomber sur l’une des ${n} cases de la grille, c’est-à-dire à un multiple de 1/${n} de cycle.`;
    if (!isRotationOf(steps.map((s) => Math.round(s) % n), p, n)) return `Les ${p} coups sont sur la grille, mais pas répartis au plus régulier : entre deux coups, les écarts ne doivent différer que d’une case au plus, et être répartis aussi également que possible.`;
    return true;
  },
  ok: `${p} coups sur ${n} pas, au plus régulier : la notation \`(${p},${n})\` calcule cette répartition pour toi.`,
}));

/* --- 5. L'accent ------------------------------------------------------------------- */
const accent = [1, 2, 3, 4].map((k) => {
  const gains = [0, 1, 2, 3].map((i) => (i === k - 1 ? '1' : '.5')).join(' ');
  return {
    key: 'accent.' + k,
    family: 'accent',
    title: `L’accent sur le ${ord(k)} coup`,
    brief:
      `Le charleston joue 4 coups par cycle, tous au même volume. Fais ressortir le ${ord(k)} : au moins une fois et demie plus fort que chacun des trois autres, qui restent audibles. ` +
      'Le volume d’un coup est son [gain](fx.gain) (0,8 si tu n’en écris pas) multiplié par sa `velocity` (1 par défaut).',
    code: 's("hh*4").bank("RolandTR909")',
    solution: `s("hh*4").bank("RolandTR909").gain("${gains}")`,
    check(c) {
      const hh = c.haps.filter((e) => e.s === 'hh');
      if (hh.length !== 4) return `Garde 4 coups de charleston par cycle (le premier cycle en a ${hh.length}).`;
      const vol = hh.map((e) => (e.value.gain != null ? Number(e.value.gain) : 0.8) * (e.value.velocity != null ? Number(e.value.velocity) : 1));
      const acc = vol[k - 1];
      const others = vol.filter((_, i) => i !== k - 1);
      if (others.some((v) => v < 0.05)) return 'Les trois autres coups doivent rester audibles : un gain d’au moins 0,05.';
      const ratio = acc / Math.max(...others);
      if (ratio < 1.5) return `Le ${ord(k)} coup est à ${String(Math.round(ratio * 100) / 100).replace('.', ',')} fois le plus fort des autres : il en faut au moins 1,5. Un motif de gains, un par coup : \`.gain("… … … …")\`.`;
      return true;
    },
    ok: `Le ${ord(k)} coup ressort : un accent change toute la pulsation sans ajouter un seul son.`,
  };
});

/* --- 6. Un filtre qui s'ouvre ------------------------------------------------------ */
const filtre = [1, 2].map((N) => {
  const sig = 'saw.range(300, 3000)' + (N > 1 ? `.slow(${N})` : '');
  return {
    key: 'filtre.' + N,
    family: 'filtre',
    title: N === 1 ? 'Un filtre qui s’ouvre à chaque cycle' : `Un filtre qui s’ouvre en ${N} cycles`,
    brief:
      `La basse est [filtrée](fx.lpf) à 300 Hz. Fais monter la coupure peu à peu, de 400 Hz ou moins jusqu’à 2000 Hz ou plus, en ${N === 1 ? 'un cycle' : N + ' cycles'}, ` +
      'puis qu’elle reparte d’en bas et recommence. Un outil possible : [les signaux](fn.signaux).',
    code: 'note("c2*8").s("sawtooth").lpf(300)',
    solution: `note("c2*8").s("sawtooth").lpf(${sig})`,
    check(c) {
      const ev = c.haps4.filter((e) => e.value.cutoff != null);
      if (ev.length < 8) return 'Garde le filtre `lpf` sur la basse, et ses 8 notes par cycle.';
      for (let w = 0; w < 4; w += N) {
        const win = ev.filter((e) => e.begin >= w - 1e-9 && e.begin < w + N - 1e-9).map((e) => Number(e.value.cutoff));
        if (!win.length) continue;
        if (win[0] > 400) return `Au début du cycle ${w + 1}, la coupure est à ${Math.round(win[0])} Hz : elle doit repartir de 400 Hz ou moins.`;
        if (Math.max(...win) < 2000) return `Sur ${N === 1 ? 'le cycle ' + (w + 1) : 'les cycles ' + (w + 1) + ' et ' + (w + 2)}, la coupure ne dépasse pas ${Math.round(Math.max(...win))} Hz : elle doit atteindre 2000 Hz.`;
        for (let i = 1; i < win.length; i++) if (win[i] < win[i - 1] - 1e-6) return `La coupure redescend avant la fin ${N === 1 ? 'du cycle' : 'des ' + N + ' cycles'} : elle doit seulement monter, puis repartir d’en bas. La dent de scie \`saw\` monte puis retombe d’un coup ; \`sine\` monte et redescend.`;
      }
      return true;
    },
    ok: `La coupure monte de ${N === 1 ? 'cycle en cycle' : N + ' cycles en ' + N + ' cycles'} puis retombe : la montée de tension des musiques électroniques.`,
  };
});

/* --- 7. Une fin de phrase ---------------------------------------------------------- */
const phrase = [2, 3, 4].map((N) => {
  const start = 's("bd ~ sd ~, hh*4").bank("RolandTR909")';
  return {
    key: 'phrase.' + N,
    family: 'phrase',
    title: `Une fin de phrase tous les ${N} cycles`,
    brief:
      `Sur chaque groupe de ${N} cycles, le dernier doit jouer deux fois plus de coups (par exemple chaque coup doublé) ; les autres cycles restent tels quels. ` +
      'Outils possibles : [lastOf](fn.lastOf) et [ply](fn.ply).',
    code: start,
    solution: start + `.lastOf(${N}, x => x.ply(2))`,
    check(c) {
      const cyc = byCycle(c).map((x) => x.length);
      const base = cyc[0]; // le 1er cycle n'est jamais une fin de groupe (N ≥ 2)
      if (base !== 6) return `Le 1ᵉʳ cycle doit rester comme au départ : 6 coups (kick, caisse claire, 4 charlestons), il en a ${base}. Seule la fin de chaque groupe change : \`every\` et \`firstOf\` agissent sur le PREMIER cycle du groupe, \`lastOf\` sur le dernier.`;
      for (let k = 0; k < 4; k++) {
        const last = k % N === N - 1;
        if (last && cyc[k] !== 2 * base) return `Le cycle ${k + 1} termine un groupe de ${N} : il doit avoir deux fois plus de coups que les autres (${2 * base}), il en a ${cyc[k]}.`;
        if (!last && cyc[k] !== base) return `Le cycle ${k + 1} n’est pas une fin de groupe : il doit rester comme au départ (${base} coups), il en a ${cyc[k]}.`;
      }
      return true;
    },
    ok: `Tous les ${N} cycles, la batterie s’emballe puis revient : l’oreille sent la phrase se terminer.`,
  };
});

export const DEFI_FAMILIES = [
  { id: 'couche', label: 'Entrée d’une couche' },
  { id: 'basse', label: 'Basse dans une tonalité' },
  { id: 'accord', label: 'Accord parfait' },
  { id: 'euclide', label: 'Rythme euclidien' },
  { id: 'accent', label: 'Accent' },
  { id: 'filtre', label: 'Filtre qui s’ouvre' },
  { id: 'phrase', label: 'Fin de phrase' },
];
export const defis = [...couche, ...basse, ...accord, ...euclide, ...accent, ...filtre, ...phrase];
export const defiByKey = Object.fromEntries(defis.map((d) => [d.key, d]));

// Tire un défi au hasard : une autre famille que le précédent quand c'est possible.
export function randomDefi(prevKey, rnd = Math.random) {
  const prev = prevKey && defiByKey[prevKey];
  const pool = prev ? defis.filter((d) => d.family !== prev.family) : defis;
  const fam = DEFI_FAMILIES.filter((f) => pool.some((d) => d.family === f.id));
  const f = fam[Math.floor(rnd() * fam.length)].id;
  const inFam = pool.filter((d) => d.family === f);
  return inFam[Math.floor(rnd() * inFam.length)];
}
