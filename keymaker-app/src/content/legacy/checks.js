// Validation automatique des exercices des approfondissements (leçons de l'ancienne app).
//
// Même principe que les fondations (src/lib/check.js) : après ▶, on regarde ce que le code
// PRODUIT et on renvoie true (réussi) ou une chaîne (l'indice). Clé : id d'étape « L4.4.6 ».
//   check    : (c) => true | 'indice'
//   solution : un code qui valide (bouton « Voir une solution », et tests)
//   ok       : la phrase affichée quand c'est réussi
// Les tests (scripts/check-content.mjs) exigent : la solution valide, le code de départ non,
// et un indice quand le départ échoue.
//
// Un exercice ouvert (« fais ton propre kit », « écoute et compare ») n'a pas d'entrée ici :
// il garde le bouton « C'est fait ».
//
// Noms des champs dans les événements (mesurés dans le moteur) : lpf → cutoff, lpq →
// resonance, hpf → hcutoff, bpf/bpq → bandf/bandq, roomsize → roomsize, rlp → roomlp,
// phaser → phaserrate, vib("a:b") → vib/vibmod, lpa/lpd/lps → lpattack/lpdecay/lpsustain,
// distort("a:b") → distort/distortvol. `jux` n'a pas de champ : deux copies, pan 0 et pan 1.

import { pc } from '../../lib/check.js';

// Valeurs d'un champ sur les 4 premiers cycles (pour suivre les < > et les signaux lents).
const V = (c, k) => c.val(k, c.haps4);
const uniqV = (c, k) => [...new Set(V(c, k))];
const evs = (c, pred) => c.haps4.filter(pred);
const isSynth = (s) => ['sine', 'triangle', 'square', 'sawtooth'].includes(s);
const NOISE = ['white', 'pink', 'brown'];
// Le break amen, chargé comme dans les leçons.
const AMEN = "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })";
// Événements des 4 premiers cycles, rangés par cycle (0 à 3).
const byCycle = (c, pred = () => true) => {
  const out = [[], [], [], []];
  for (const e of c.haps4) if (pred(e)) { const k = Math.floor(e.begin + 1e-9); if (k >= 0 && k < 4) out[k].push(e); }
  return out;
};
const notesAt = (arr) => arr.map((e) => e.note);
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const TRANSFORMS = /\.(fast|slow|iter|ply|palindrome|off|jux|superimpose|chunk|rev|lastOf|firstOf)\(/g;

export const legacyChecks = {
  /* ================= Sculpter le son (module 4) ================= */
  'L4.4.1': {
    check: (c) => {
      const s = c.sounds4();
      if (s.includes('sawtooth')) return 'La source est encore `sawtooth`. Remplace-la par `triangle` dans `.s(…)`.';
      if (!s.includes('triangle')) return 'Écris `.s("triangle")` : c’est l’onde demandée.';
      return true;
    },
    solution: 'note("c3 e3 g3 c4").s("triangle")',
    ok: 'Même mélodie, autre source : le triangle a beaucoup moins d’harmoniques aiguës que la dent de scie, d’où ce son plus doux.',
  },
  'L4.4.2': {
    check: (c) => {
      const s = c.sounds4().filter(isSynth);
      if (s.length !== 1) return `Tu joues ${s.length} ondes. Garde-en une seule : \`.s("square")\`, par exemple.`;
      if (new Set(c.notes4()).size < 3) return 'Une seule onde, c’est bon. Joue maintenant une vraie mélodie, d’au moins trois notes : `note("c3 e3 g3 e3")`.';
      return true;
    },
    solution: 'note("c3 e3 g3 e3").s("square")',
    ok: 'Une onde, une mélodie. Essaie les trois autres ondes sur la même mélodie pour choisir ta préférée.',
  },
  'L4.4.4': {
    check: (c) => {
      const s = c.sounds4();
      if (!s.includes('bd')) return 'Il manque le kick : ajoute `bd*2` dans la mini-notation, séparé du bruit par une virgule : `s("bd*2, white*8")`.';
      if (!s.some((x) => NOISE.includes(x))) return 'Garde un bruit à côté du kick : `white*8`, `pink*8` ou `brown*8`.';
      return true;
    },
    solution: 's("bd*2, white*8").decay(.04).sustain(0)',
    ok: 'Un kick enregistré et un bruit taillé en impulsions de 40 ms : un groove à moitié synthétique.',
  },
  'L4.4.6': {
    check: (c) => {
      const v = uniqV(c, 'cutoff');
      if (v.length !== 1) return 'La coupure change encore à chaque cycle. Écris une seule valeur : `lpf(200)`, puis `lpf(6000)`.';
      if (v[0] > 300 && v[0] < 5000) return `Coupure à ${v[0]} Hz : va plus loin, tout en bas (\`lpf(200)\`) ou tout en haut (\`lpf(6000)\`).`;
      return true;
    },
    solution: 'note("c2 e2 g2 c3").s("sawtooth").lpf(200)',
    ok: 'Tu as entendu un extrême. Essaie l’autre (200 ou 6 000 Hz), puis cherche entre les deux la coupure qui te plaît.',
  },
  'L4.4.7': {
    check: (c) => {
      const q = uniqV(c, 'resonance');
      if (!q.length || Math.min(...q) < 25) return 'Pousse la résonance à `lpq(25)`, une seule valeur pour tous les cycles.';
      if (uniqV(c, 'cutoff').length < 3) return 'Résonance en place. Fais maintenant balayer la coupure : `lpf("<300 600 1200 2400>")`.';
      return true;
    },
    solution: 'note("c2 e2 g2 c3").s("sawtooth").lpf("<300 600 1200 2400>").lpq(25).gain(.5)',
    ok: 'Avec 25 dB à la coupure, chaque palier du filtre fait siffler une autre zone du son : le filtre « parle ».',
  },
  'L4.4.8': {
    check: (c) => {
      if (V(c, 'hcutoff').length) return 'Le passe-haut est encore là : remplace `hpf("<…>")` par `bpf(1200).bpq(8)`.';
      const f = uniqV(c, 'bandf');
      if (!f.length) return 'Écris un passe-bande : `.bpf(1200)`.';
      if (!V(c, 'bandq').some((q) => q >= 8)) return 'Resserre la bande avec `.bpq(8)`.';
      return true;
    },
    solution: 'note("c2 e2 g2 c3").s("sawtooth").bpf(1200).bpq(8)',
    ok: 'Il ne reste qu’une bande étroite autour de 1 200 Hz : le son devient nasal, comme filtré par un téléphone.',
  },
  'L4.4.9': {
    check: (c) => {
      if (c.has(/lpf\(\s*saw\b/)) return true;
      const m = c.code.match(/lpf\(\s*\w+\.range\([^)]*\)\.slow\(\s*([\d.]+)\s*\)/);
      if (m && Number(m[1]) > 2) return true;
      return 'Remplace `sine` par `saw` dans `lpf(…)`, ou ralentis le signal : `.slow(4)` au lieu de `.slow(2)`.';
    },
    solution: 'note("c2").s("sawtooth").segment(16).lpf(saw.range(300,3000).slow(2)).lpq(8).gain(.5)',
    ok: 'Avec `saw`, la coupure monte puis retombe d’un coup ; avec `.slow(4)`, le même mouvement prend deux fois plus de temps.',
  },
  'L4.4.10': {
    check: (c) => {
      const m = c.code.match(/lpf\(\s*\w+\.range\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/);
      if (!m) return 'Garde un signal dans `lpf(…)`, avec ses bornes : `lpf(saw.range(300, 5000).slow(8))`.';
      if (Number(m[1]) > 400) return `La coupure part de ${m[1]} Hz : pars de 300.`;
      if (Number(m[2]) < 4500) return `La coupure monte jusqu’à ${m[2]} Hz : ouvre jusqu’à 5 000.`;
      if (!V(c, 'resonance').some((q) => q >= 8)) return 'Bornes en place. Ajoute `lpq(8)` pour le « ouah ».';
      return true;
    },
    solution: 'setcpm(120/4)\n$: s("bd*4, hh*8").gain(.6)\n$: note("c2 eb2 g2 c2").s("sawtooth").lpf(saw.range(300,5000).slow(8)).lpq(8).gain(.5)',
    ok: 'Une ouverture de 300 à 5 000 Hz, plus de quatre octaves, avec une résonance qui souligne le passage : c’est une montée d’intro.',
  },
  'L4.4.11': {
    check: (c) => (V(c, 'attack').some((a) => a >= 0.4) ? true : 'Commence par l’attaque : remplace `attack(.01)` par `attack(.5)`.'),
    solution: 'note("c3 e3 g3 c4").s("sawtooth").attack(.5).decay(.2).sustain(.3).release(.3)',
    ok: 'Chaque note met une demi-seconde à monter : elle arrive en fondu. Change ensuite decay, sustain, puis release, un à la fois.',
  },
  'L4.4.12': {
    check: (c) => {
      if (!V(c, 'attack').length || Math.min(...V(c, 'attack')) < 1) return 'Pour une nappe, une attaque d’une seconde sur toutes les notes : `attack(1)`.';
      if (!V(c, 'release').length || Math.min(...V(c, 'release')) < 2) return 'Ajoute une longue extinction : `release(2)`.';
      return true;
    },
    solution: 'note("<c3 e3>").s("sawtooth").attack(1).release(2).lpf(1500)',
    ok: 'Une seconde pour monter, deux pour s’éteindre : les notes se fondent l’une dans l’autre. Essaie l’inverse, `attack(0).release(.1)`.',
  },
  'L4.4.13': {
    check: (c) => {
      if (V(c, 'sustain').some((s) => s >= 0.5)) return true;
      if (V(c, 'decay').some((d) => d >= 0.4) && V(c, 'sustain').every((s) => s === 0)) return true;
      return 'Monte le niveau tenu : `sustain(.5)`. Ou allonge le pincement : `decay(.4)` avec `sustain(0)`.';
    },
    solution: 'note("c2 e2 g2 c3").s("sawtooth").attack(.01).decay(.15).sustain(.5).lpf(2000)',
    ok: 'Avec un sustain, la note se tient au lieu de retomber au silence. Essaie aussi `decay(.4).sustain(0)` : un pincement plus long.',
  },
  'L4.4.14': {
    check: (c) => (V(c, 'lpenv').some((e) => e >= 8) || V(c, 'lpdecay').some((d) => d >= 0.6) ? true : 'Pousse l’ouverture du filtre, `lpenv(8)`, ou allonge sa fermeture, `lpd(.6)`.'),
    solution: 'note("c2 e2 g2 c3").s("sawtooth").lpf(400).lpenv(8).lpa(.01).lpd(.2).lps(0).lpq(6)',
    ok: 'Avec `lpenv(8)`, la coupure monte de 400 à 20 000 Hz (le plafond) au début de chaque note : l’attaque devient très brillante.',
  },
  'L4.4.15': {
    check: (c) => {
      const min = (k) => (V(c, k).length ? Math.min(...V(c, k)) : 0);
      const max = (k) => (V(c, k).length ? Math.max(...V(c, k)) : 99);
      if (min('attack') < 0.5) return 'Allonge l’attaque : `attack(.6)`.';
      if (min('sustain') < 0.5) return 'Monte le niveau tenu : `sustain(.6)`.';
      if (min('release') < 1) return 'Allonge l’extinction : `release(1)`.';
      if (max('lpenv') > 2) return 'Adoucis l’enveloppe de filtre : `lpenv(2)`.';
      return true;
    },
    solution: 'setcpm(120/4)\nnote("c2 c2 eb2 c2 g1 c2 eb2 d2").s("sawtooth").lpf(300).lpenv(2).lpa(.01).lpd(.18).lps(.1).lpq(10).attack(.6).decay(.2).sustain(.6).release(1).gain(.5)',
    ok: 'Mêmes notes, mêmes ondes : seules les enveloppes ont changé, et la basse est devenue une nappe.',
  },
  'L4.4.16': {
    check: (c) => {
      if (!V(c, 'roomsize').some((s) => s >= 8)) return 'Agrandis la salle : `.roomsize(8)`.';
      if (!V(c, 'roomlp').length) return 'Feutre maintenant la traîne : `.rlp(2000)`.';
      return true;
    },
    solution: 'note("c3 e3 g3 c4").s("triangle").room("<0 .3 .6 .9>").release(.2).roomsize(8).rlp(2000)',
    ok: 'Une traîne de 8 s, filtrée au-dessus de 2 000 Hz : une grande salle aux murs mous.',
  },
  'L4.4.17': {
    check: (c) => (V(c, 'delayfeedback').some((f) => f >= 0.7) || V(c, 'delaytime').some((t) => t <= 0.125) ? true : 'Pousse la réinjection, `delayfeedback(.7)`, ou resserre les échos, `delaytime(.125)`.'),
    solution: 'note("c3 ~ e3 ~").s("triangle").delay(.5).delaytime(.25).delayfeedback(.7).release(.1)',
    ok: 'À 0,7, chaque écho garde 70 % du précédent : la traîne dure bien plus longtemps.',
  },
  'L4.4.18': {
    check: (c) => (V(c, 'delaytime').some((t) => Math.abs(t - 0.5) < 1e-6) ? true : 'Passe à `delaytime(.5)` : à 120 BPM, une noire.'),
    solution: 'setcpm(120/4)\n$: s("bd*4").gain(.6)\n$: note("c4 ~ ~ ~ e4 ~ ~ ~").s("triangle").delay(.6).delaytime(.5).delayfeedback(.5).gain(.7)',
    ok: 'Une noire (0,5 s à 120 BPM) : les échos tombent sur les temps, avec le kick. La croche pointée (0,375 s) les faisait rouler entre les temps.',
  },
  'L4.4.19': {
    check: (c) => {
      const bd = evs(c, (e) => e.s === 'bd');
      if (!bd.some((e) => e.value.room != null)) return 'Ajoute à la batterie `.room(.3).roomsize(1)`.';
      const lead = evs(c, (e) => e.s === 'triangle');
      if (!lead.length || !lead.every((e) => e.value.orbit === 2)) return 'Remets `.orbit(2)` sur le lead : chaque piste retrouve sa pièce.';
      return true;
    },
    solution: 'setcpm(120/4)\n$: note("c3 e3 g3").s("triangle").room(.8).roomsize(6).orbit(2)\n$: s("bd*4").gain(.7).room(.3).roomsize(1)',
    ok: 'Deux pièces distinctes : une petite pour la batterie (orbit 1, 1 s), une grande pour le lead (orbit 2, 6 s).',
  },
  'L4.4.21': {
    check: (c) => {
      if (V(c, 'distort').length) return 'La distorsion est encore là : remplace `.distort("4:.3")` par `.crush("<16 8 4 2>")`.';
      if (!V(c, 'crush').length && !V(c, 'coarse').length) return 'Écris `.crush("<16 8 4 2>")`, puis essaie `.coarse("<1 4 8 16>")`.';
      return true;
    },
    solution: 'note("c2 eb2 g2 c2").s("sawtooth").lpf(2000).crush("<16 8 4 2>").gain(.5)',
    ok: '`crush` réduit le nombre de niveaux de volume (16 bits, puis 8, 4, 2) ; `coarse` réduit le nombre d’échantillons par seconde. Deux saletés différentes.',
  },
  'L4.4.22': {
    check: (c) => (uniqV(c, 'phaserrate').length >= 3 || (V(c, 'vib').some((v) => v >= 6) && V(c, 'vibmod').some((m) => m >= 0.5)) ? true : 'Essaie `phaser("<1 4 8>")` (trois vitesses), ou `vib("6:.5")` (un vibrato large).'),
    solution: 'n("0 2 4 7 4 2").scale("C:minor:pentatonic").s("sawtooth").phaser("<1 4 8>").vib("4:.2").release(.3)',
    ok: 'Un balayage par seconde, puis quatre, puis huit : de la houle au tremblement.',
  },
  'L4.4.23': {
    check: (c) => {
      const pans = new Set(c.haps.filter((e) => e.s === 'triangle').map((e) => e.value.pan));
      if (pans.has(0) && pans.has(1)) return true;
      if (c.has('jux')) return 'Le `jux` est là, mais il décale le `pan` déjà écrit : retire `.pan("<0 1>")` de la mélodie.';
      return 'Remplace `.pan("<0 1>")` par `.jux(rev)` sur la ligne de la mélodie.';
    },
    solution: 'setcpm(120/4)\n$: s("hh*8").gain(.4).pan(sine.range(0,1).slow(2))\n$: note("c3 e3 g3 c4").s("triangle").release(.3).gain(.6).jux(rev)',
    ok: 'À gauche, la mélodie à l’endroit ; à droite, à l’envers. Au casque, la stéréo s’élargit.',
  },
  'L4.4.24': {
    check: (c) => {
      if ((c.code.match(/\.lpf\(/g) || []).length < 2) return 'Écris deux filtres dans la même chaîne : `.lpf(300).distort("3:.3").lpf(3000)`.';
      const v = uniqV(c, 'cutoff');
      return v.length === 1 && v[0] === 3000 ? true : 'Mets la deuxième coupure à 3 000 : `.lpf(3000)`.';
    },
    solution: 'note("c2 eb2 g2 c2").s("sawtooth").lpf(300).distort("3:.3").lpf(3000).room(.3).gain(.6)',
    ok: 'Le moteur ne garde qu’une coupure, la dernière écrite (3 000 Hz), et l’applique avant la saturation : l’ordre d’écriture ne change pas l’ordre de la chaîne.',
  },
  'L4.4.25': {
    check: (c) => {
      const A_MINOR = [9, 11, 0, 2, 4, 5, 7];
      const outside = [...new Set(c.notes4().map(pc))].filter((p) => !A_MINOR.includes(p));
      if (outside.length) return 'Il reste des notes de do mineur (mi bémol, la bémol ou si bémol). Change les trois : grille `chord("<Am F C G>")`, basse `note("<a1 f1 c2 g1>(3,8)")`, mélodie `scale("A:minor:pentatonic")`.';
      if (!c.notes4().some((n) => pc(n) === 9)) return 'Toutes les notes sont dans la gamme de la mineur, mais aucun la ne joue : vérifie la basse.';
      return true;
    },
    solution:
      'setcpm(145/4)\n$: s("bd*4, [~ sd]*2, hh*8").bank("RolandTR909").gain(.6)\n$: note("<a1 f1 c2 g1>(3,8)").s("sawtooth").lpf(500).lpenv(4).lpa(.01).lpd(.18).lps(.1).lpq(15).decay(.2).sustain(.15).gain(.5)\n$: chord("<Am F C G>").voicing().struct("x ~ x x").s("gm_electric_guitar_clean").distort("1.5:.3").delay(.3).delaytime(.375).delayfeedback(.3).orbit(2).gain(.4)\n$: n("0 3 5 7 5 3").scale("A:minor:pentatonic").s("sawtooth").attack(.01).release(.2).phaser(2).room(.4).orbit(3).gain(.35)',
    ok: 'Toutes les notes sont maintenant dans la gamme de la mineur : grille, basse et mélodie ont changé de tonalité ensemble.',
  },

  /* ================= Le code comme instrument (module 5) ================= */
  'L5.5.1': {
    check: (c) => (c.notes().length === 3 ? true : 'Remplace les chevrons `< >` par des crochets `[ ]` : `note("[c4 e4 g4]")`. Les trois notes doivent tenir dans un seul cycle.'),
    solution: 'note("[c4 e4 g4]")',
    ok: 'Mêmes trois notes, autre fonction du temps : avec `[ ]`, elles se partagent un cycle ; avec `< >`, il en fallait trois.',
  },
  'L5.5.3': {
    check: (c) => {
      const [c0, c1] = byCycle(c);
      const s0 = new Set(c0.map((e) => e.s));
      if (s0.size > 1) return 'Les trois couches jouent encore ensemble. Remplace `stack` par `cat`.';
      if (new Set(c1.map((e) => e.s)).size !== 1 || c1[0]?.s === c0[0]?.s) return 'Une couche par cycle : écris `cat(` à la place de `stack(`, sans rien changer d’autre.';
      return true;
    },
    solution: 'cat(\n  s("bd*4"),\n  s("hh*8"),\n  note("c2 g2").s("sawtooth")\n)',
    ok: 'Avec `cat`, chaque couche a son cycle : le kick, puis les charlestons, puis la basse, et on recommence.',
  },
  'L5.5.4': {
    check: (c) => {
      if (!c.sounds().includes('sawtooth')) return 'Choisis l’onde : `.s("sawtooth")`.';
      const n = c.notes();
      if (n.length !== 8 || !n.every((x, i) => i === 0 || x < n[i - 1])) return 'Retourne la gamme : ajoute `.rev()` au bout. Elle doit descendre.';
      return true;
    },
    solution: 'n(run(8)).scale("C:major").s("sawtooth").rev()',
    ok: '`run(8)` génère 0 à 7, `scale` en fait la gamme de do majeur, `rev` la retourne : trois règles, aucune note écrite.',
  },
  'L5.5.5': {
    check: (c) => {
      const mel = new Set(c.haps4.filter((e) => e.s === 'sawtooth').map((e) => e.note));
      if (mel.size !== 5) return `La mélodie joue ${mel.size} notes différentes. Change \`run(8)\` en \`run(5)\`.`;
      const t = (c.code.match(TRANSFORMS) || []).length;
      if (t < 2) return 'Ajoute une transformation au bout de la ligne, en plus de `.rev()` : `.fast(2)`, par exemple.';
      return true;
    },
    solution: 'setcpm(120/4)\n$: stack(s("bd*4"), s("hh*8"))\n$: n(run(5)).scale("C:major").s("sawtooth").lpf(800).rev().fast(2)',
    ok: 'Cinq notes générées, retournées, accélérées : tu as écrit trois règles, pas une seule note.',
  },
  'L5.5.6': {
    check: (c) => (c.count() >= 6 ? true : 'Ajoute `.superimpose(x=>x.fast(2))` au bout de la ligne : une copie deux fois plus rapide, par-dessus.'),
    solution: 'n("0 2 4 6").scale("C:major").s("sawtooth").slow(2).superimpose(x=>x.fast(2))',
    ok: 'Par cycle : 2 notes de la version lente, 4 de la copie rapide. Deux vitesses, une seule ligne.',
  },
  'L5.5.8': {
    check: (c) => {
      const [c0, c1] = byCycle(c).map(notesAt);
      if (c0.length !== 8) return 'Passe à huit notes : `n("0 1 2 3 4 5 6 7")`.';
      if (!same(c1, [...c0.slice(1), c0[0]])) return 'Huit notes, c’est bon. Passe maintenant à `iter(8)` : chaque cycle doit commencer une note plus loin.';
      return true;
    },
    solution: 'n("0 1 2 3 4 5 6 7").scale("C:major").iter(8).s("sawtooth")',
    ok: 'Chaque cycle commence une note plus loin : il faut 8 cycles pour revenir au départ, contre 4 avant.',
  },
  'L5.5.9': {
    check: (c) => {
      const hh = c.onsets('hh');
      if (!hh.length) return 'Pars de `s("hh*4").ply(2)`.';
      const q = [0, 1, 2, 3].map((k) => hh.filter((t) => t >= k / 4 - 1e-6 && t < (k + 1) / 4 - 1e-6).length);
      if (q.every((x) => x === q[0])) return 'Chaque pas répète autant de fois. Donne un nombre par pas : `.ply("2 1 2 3")`.';
      return true;
    },
    solution: 's("hh*4").ply("2 1 2 3")',
    ok: '2, 1, 2 et 3 répétitions : chaque pas a son propre roulement.',
  },
  'L5.5.9b': {
    check: (c) => {
      const bd = c.onsets('bd');
      if (bd.length !== 3) return true;
      return bd[0] === 0 && Math.abs(bd[1] - 0.375) < 0.01 && Math.abs(bd[2] - 0.75) < 0.01 ? 'Essaie `(5,8)` ou `(7,16)` sur le kick, ou une rotation : `bd(3,8,2)`.' : true;
    },
    solution: 'sound("bd(5,8), hh*8")',
    ok: 'Cinq coups sur huit pas, répartis le plus régulièrement possible : un autre rythme, avec la même règle.',
  },
  'L5.5.10': {
    check: (c) => {
      if (!c.has(/iter\(\s*3\s*\)/)) return 'Change `iter(4)` en `iter(3)`.';
      if (!c.has(/fast\(\s*1\.5\s*\)/)) return 'Change `slow(2)` en `fast(1.5)`.';
      if (!c.has(/ply\(\s*"<1 2 1 3>"\s*\)/)) return 'Change le ply en `ply("<1 2 1 3>")`.';
      return true;
    },
    solution: 'setcpm(120/4)\n$: s("bd ~ sd ~").ply("<1 2 1 3>")\n$: s("hh*8")\n$: n("0 1 2 3 4 5 6 7").scale("C:minor").s("sawtooth").iter(3).fast(1.5).lpf(1200)',
    ok: 'Mêmes notes et mêmes sons, trois réglages de temps changés : un autre groove.',
  },
  'L5.5.11': {
    check: (c) => {
      if (c.has('irand')) return 'Remplace `irand(8).segment(8)` par `sine.segment(8).range(0, 7)`.';
      if (!c.has('sine')) return 'Utilise le signal `sine` : `sine.segment(8).range(0, 7)`.';
      return c.notes().length >= 8 ? true : 'Garde `.segment(8)` : huit valeurs, donc huit notes, par cycle.';
    },
    solution: 'n(sine.segment(8).range(0, 7)).scale("C:minor").s("triangle")',
    ok: 'Mesuré dans le moteur : sol, si bémol, do, si bémol, sol, mi bémol, do, mi bémol. La vague monte et redescend, chaque cycle pareil.',
  },
  'L5.5.12': {
    check: (c) => {
      const m = c.code.match(/ribbon\(\s*(\d+)/);
      if (!m) return 'Garde `.ribbon(n, 2)` et change seulement le premier nombre.';
      return Number(m[1]) !== 1337 ? true : 'Change le premier nombre de `ribbon` : 1, 42, 9000…';
    },
    solution: 'n(irand(8).segment(4)).scale("C:pentatonic").ribbon(42, 2).s("triangle")',
    ok: 'Une autre tranche de hasard, figée en boucle. Garde le nombre qui te plaît : il redonnera toujours la même boucle.',
  },
  'L5.5.13': {
    check: (c) => {
      const s = c.sounds4();
      if (!s.includes('square') || !s.includes('sawtooth') || s.length !== 2) return 'Tire le timbre entre deux ondes : `.s(choose("sawtooth","square"))`.';
      if (new Set(c.notes4()).size !== 3) return 'Joue les trois notes de la gamme : `n("0 2 4").scale("C:major")`.';
      return true;
    },
    solution: 'n("0 2 4").scale("C:major").s(choose("sawtooth","square"))',
    ok: 'Do, mi, sol, et pour chaque note une onde tirée au sort. Relance : la même suite revient.',
  },
  'L5.5.14': {
    check: (c) => {
      const hh = c.haps4.filter((e) => e.s === 'hh');
      if (!hh.some((e) => Math.abs((e.begin * 16) % 2 - 1) < 1e-6)) return 'Pars d’un charleston en doubles-croches : `s("hh*16")`.';
      if (hh.length >= 64) return 'Aucun coup ne manque : ajoute `.degrade()`.';
      if (!hh.some((e) => (e.value.gain ?? 0) >= 1.3)) return 'Ajoute les accents : `.seed(1).sometimes(x=>x.gain(1.4))`. Sans `.seed(1)`, aucun accent ne passe.';
      return true;
    },
    solution: 's("hh*16").degrade().seed(1).sometimes(x=>x.gain(1.4))',
    ok: 'Des trous et des accents, tirés au hasard mais séparés par `.seed(1)`. Retire-le pour entendre les accents disparaître.',
  },
  'L5.5.16': {
    check: (c) => {
      const gap = (arr) => { const z = arr.filter((e) => Math.abs(e.begin % 1) < 1e-6).map((e) => e.note); return Math.max(...z) - Math.min(...z); };
      const [c0, c1] = byCycle(c);
      return c0.length && c1.length && gap(c0) !== gap(c1) ? true : 'Fais alterner l’écart : `.superimpose(x=>x.add("<2 4>"))`, dans les guillemets de `n(…)`.';
    },
    solution: 'n("0 2 4 6".superimpose(x=>x.add("<2 4>"))).scale("C:major").s("triangle")',
    ok: 'Au 1ᵉʳ cycle, la deuxième voix est deux degrés plus haut (la tierce) ; au 2ᵉ, quatre degrés (la quinte).',
  },
  'L5.5.17': {
    check: (c) => (c.haps.some((e) => Math.abs(e.begin - 0.25) < 1e-6 && e.note === 60) ? true : 'Retarde la copie d’un quart de cycle et monte-la d’une octave : `off(1/4, x=>x.add(12))`.'),
    solution: '"c3 eb3 g3".off(1/4, x=>x.add(12)).note().s("triangle")',
    ok: 'La copie arrive un quart de cycle plus tard, douze demi-tons (une octave) plus haut.',
  },
  'L5.5.18': {
    check: (c) => {
      if (!c.sounds().includes('cp')) return 'Fais rebondir un clap : `s("cp").echo(4, 1/8, .7)`.';
      return c.count('cp') === 4 ? true : 'Quatre rebonds : `echo(4, 1/8, .7)`.';
    },
    solution: 's("cp").echo(4, 1/8, .7)',
    ok: 'Quatre claps espacés d’un huitième de cycle, chacun à 70 % du précédent. Essaie `.5` puis `.95`.',
  },
  'L5.5.19': {
    check: (c) => {
      const left = c.haps.filter((e) => e.value.pan === 0).map((e) => e.note);
      const right = c.haps.filter((e) => e.value.pan === 1).map((e) => e.note);
      if (!right.length) return 'Garde `jux` : `.jux(x=>x.add(note(7)))`.';
      if (same(right, left)) return 'La copie de droite joue les mêmes notes. Écris `x.add(note(7))`, pas `x.add(7)` : après `.scale()`, ce sont des notes.';
      return right.every((n, i) => n - left[i] === 7) ? true : 'Monte la copie de 7 demi-tons : `.jux(x=>x.add(note(7)))`.';
    },
    solution: 'n(run(8)).scale("C:major").s("sawtooth").jux(x=>x.add(note(7)))',
    ok: 'À gauche la gamme, à droite la même gamme une quinte plus haut : un accord de deux voix, écarté dans l’espace.',
  },
  'L5.5.20': {
    check: (c) => (c.haps.filter((e) => e.s === 'sawtooth').length >= 64 ? true : 'Ajoute `.superimpose(x=>x.add(note(12)))` à la ligne de la mélodie : une copie à l’octave.'),
    solution: 'setcpm(120/4)\n$: s("bd*4, hh*8")\n$: n("0 2 4 6 7 6 4 2".off(1/8, x=>x.add(7))).scale("C:minor").s("sawtooth").lpf(1500).jux(rev).superimpose(x=>x.add(note(12))).gain(.5)',
    ok: 'Par cycle, 64 notes de synthé à partir d’une phrase de huit : mélodie, canon, stéréo, octave.',
  },
  'L5.5.22': {
    check: (c) => {
      const n = byCycle(c, (e) => e.s === 'triangle').map((a) => a.length);
      return n[3] === 8 && n[1] === 4 ? true : 'Ajoute `.lastOf(4, x=>x.fast(2))` : le 4ᵉ cycle de chaque groupe de 4 doit jouer deux fois plus de notes.';
    },
    solution: 'n("0 1 2 3").scale("C:major").firstOf(4, x=>x.rev()).lastOf(4, x=>x.fast(2)).s("triangle")',
    ok: 'Cycle 1 à l’envers, cycles 2 et 3 normaux, cycle 4 deux fois plus vite : une phrase de 4 cycles qui se ponctue toute seule.',
  },
  'L5.5.23': {
    check: (c) => {
      const sq = byCycle(c).map((a) => a.filter((e) => e.s === 'square').length);
      if (sq.every((x) => x === 1)) return true;
      if (c.has('square')) return 'Le `.s("sawtooth")` écrit après `chunk` remplace le `square` partout : déplace-le avant `chunk`.';
      return 'Fais tourner le timbre : `.s("sawtooth").chunk(4, x=>x.s("square"))`.';
    },
    solution: 'n("0 1 2 3").scale("C:major").s("sawtooth").chunk(4, x=>x.s("square"))',
    ok: 'À chaque cycle, une note sur quatre passe en onde carrée, et c’est la suivante au cycle d’après.',
  },

  /* ================= Composer un morceau (module 6) ================= */
  'L6.6.1': {
    check: (c) => (c.count('hh') === 8 ? true : 'Ajoute une 4ᵉ piste, sur sa propre ligne : `$: s("hh*8").gain(.6)`.'),
    solution: '$: s("bd*4")\n$: s("~ cp")\n$: note("c2 g2").s("sawtooth")\n$: s("hh*8").gain(.6)',
    ok: 'Quatre couches, chacune sur sa ligne `$:`, qui jouent toutes sur le même cycle.',
  },
  'L6.6.2': {
    check: (c) => {
      const miss = ['kick', 'basse', 'nappe'].filter((n) => !c.has(new RegExp('(^|\\n)\\s*' + n + '\\$:')));
      if (miss.length) return 'Renomme les pistes : il manque ' + miss.map((n) => '`' + n + '$:`').join(', ') + '.';
      return c.count() >= 4 ? true : 'Les pistes sont renommées, mais elles ne jouent plus toutes : vérifie qu’il ne manque rien après les deux-points.';
    },
    solution: 'kick$: s("bd*4, ~ cp").bank("RolandTR909")\nbasse$: note("c2 g2 ~ c2").s("gm_acoustic_bass")\nnappe$: chord("<Cm Ab>").voicing().s("triangle").gain(.4)',
    ok: 'Le son n’a pas changé : seuls les noms ont changé. Ils servent à te retrouver dans ton code.',
  },
  'L6.6.4': {
    check: (c) => {
      if (V(c, 'room').length) return 'Remplace `all(x => x.room(.3))` par `all(x => x.gain(.7))`.';
      const g = V(c, 'gain');
      return g.length === c.haps4.length && g.every((x) => Math.abs(x - 0.7) < 1e-6) ? true : 'Écris `all(x => x.gain(.7))` : toutes les pistes doivent passer à 0,7.';
    },
    solution: '$: s("bd*4, ~ cp").bank("RolandTR909")\n$: note("c2 g2 eb2 g2").s("sawtooth").gain(.6)\nall(x => x.gain(.7))',
    ok: 'Toutes les pistes à 0,7 d’un coup. Note que `all` a remplacé le `gain(.6)` de la basse : le dernier réglage écrit l’emporte.',
  },
  'L6.6.5': {
    check: (c) => {
      const bpm = Math.round(c.cps * 240);
      return bpm === 140 || bpm === 90 ? true : `Le tempo est à ${bpm} BPM. Écris \`setcpm(140/4)\`, puis \`setcpm(90/4)\`.`;
    },
    solution: 'setcpm(140/4)\ndrums$: s("bd*4, ~ cp").bank("RolandTR909")\nbass$: note("c2 ~ g2 ~").s("gm_acoustic_bass")',
    ok: 'Mêmes notes, autre tempo : à 140 BPM, un temps dure 0,43 s ; à 90, 0,67 s.',
  },
  'L6.6.6': {
    check: (c) => {
      const tri = c.haps.filter((e) => e.s === 'triangle');
      if (!tri.length) return 'Crée `const lead = n("0 2 4 7").scale("C:minor").s("triangle")` et joue-le : `$: lead`.';
      return tri.some((e) => Math.abs(e.begin - 0.125) < 1e-6 && e.note === 60) ? true : 'Joue aussi la version décalée : `$: lead.off(1/8, x=>x.add(note(12)))`.';
    },
    solution: 'const bass = note("c2 g2 ~ c2").s("gm_acoustic_bass")\n$: bass\n$: bass.add(note(12)).gain(.4)\nconst lead = n("0 2 4 7").scale("C:minor").s("triangle")\n$: lead\n$: lead.off(1/8, x=>x.add(note(12)))',
    ok: 'Un motif défini une fois, joué deux fois : tel quel, et avec une copie décalée à l’octave.',
  },
  'L6.6.7': {
    check: (c) => (c.haps.some((e) => e.s === 'square' && e.begin === 0 && e.note === 55) ? true : 'Ajoute la 3ᵉ voix : `$: riff.slow(2).add(note(7)).s("square").gain(.3)`.'),
    solution: 'const riff = n("0 2 3 5").scale("C:minor")\n$: riff.s("sawtooth").gain(.5)\n$: riff.rev().s("triangle").gain(.4).off(1/8, x=>x.add(note(12)))\n$: riff.slow(2).add(note(7)).s("square").gain(.3)',
    ok: 'Un seul motif : joué tel quel, retourné, puis ralenti et monté d’une quinte (do3 devient sol3).',
  },
  'L6.6.8': {
    check: (c) => {
      const b = c.haps.filter((e) => e.s === 'gm_acoustic_bass');
      if (!b.length) return 'Applique ta fonction à une basse : `note("c2 g2").s("gm_acoustic_bass").moi()`.';
      const v = b[0].value;
      return v.room === 0.5 && v.gain === 0.6 && v.clip === 2 ? true : 'Déclare d’abord ta signature : `register(\'moi\', p => p.room(.5).gain(.6).clip(2))`.';
    },
    solution: "register('keymaker', p => p.s('sawtooth').lpf(900).room(.3))\nregister('moi', p => p.room(.5).gain(.6).clip(2))\nnote(\"c2 g2\").s(\"gm_acoustic_bass\").moi()",
    ok: 'Trois réglages rangés sous un nom : `.moi()` les applique d’un coup, à n’importe quel motif.',
  },
  'L6.6.9': {
    check: (c) => {
      const col = new Set(V(c, 'color'));
      if (V(c, 'color').length < c.haps4.length) return 'Donne une couleur à chaque piste : `.color("gold")`, `.color("orchid")`…';
      return col.has('tomato') || col.has('cyan') ? 'Choisis d’autres couleurs que `tomato` et `cyan` : `gold`, `orchid`…' : true;
    },
    solution: '$: s("bd*4, ~ cp").bank("RolandTR909").color("gold")\n$: note("c2 g2 eb2 g2").s("sawtooth").color("orchid")',
    ok: 'Les couleurs ne changent rien au son : elles servent à reconnaître les pistes dans une visualisation.',
  },
  'L6.6.10': {
    check: (c) => {
      if (!c.has(/const\s+lead\s*=/)) return 'Définis une 4ᵉ voix : `const lead = n("0 2 4 7").scale("C:minor").s("sawtooth").gain(.4)`.';
      if (!c.has(/(^|\n)\s*lead\$:\s*lead\b|\$:\s*lead\b/)) return 'Monte-la dans une piste : `lead$: lead`.';
      return true;
    },
    solution: 'setcpm(110/4)\nconst drums = s("bd*4, ~ cp, hh*8").bank("RolandTR909")\nconst bass  = note("c2 ~ g2 ~").s("gm_acoustic_bass").gain(.7)\nconst keys  = chord("<Cm7 Ab^7>").voicing().s("triangle").gain(.4).room(.3)\nconst lead  = n("0 2 4 7").scale("C:minor").s("sawtooth").gain(.4)\ndrums$: drums\nbass$: bass\nkeys$: keys\nlead$: lead',
    ok: 'Quatre voix définies en haut, quatre pistes en bas : le gabarit de tes morceaux.',
  },
  'L6.6.11': {
    check: (c) => ((c.code.match(/\[\s*\d+\s*,/g) || []).length >= 3 ? true : 'Ajoute une 3ᵉ section dans `arrange` : `[2, s("bd ~ ~ ~")]`.'),
    solution: 'arrange(\n  [4, s("bd*4, ~ cp")],\n  [4, s("bd*4, ~ cp, hh*8")],\n  [2, s("bd ~ ~ ~")]\n).bank("RolandTR909")',
    ok: 'Trois blocs de 4, 4 et 2 cycles, qui tournent en boucle : une forme de 10 cycles.',
  },
  'L6.6.12': {
    check: (c) => {
      const cyc = byCycle(c);
      const has = (k, s, p) => cyc[k].some((e) => e.s === s && pc(e.note) === p);
      if (!has(2, 'triangle', 8)) return 'Allonge la grille : `chord("<Cm!2 Ab!2 Fm!2 G!2>")`. Au 3ᵉ cycle, on doit entendre la bémol majeur.';
      if (!has(2, 'gm_acoustic_bass', 8) || !has(0, 'gm_acoustic_bass', 0)) return 'Fais suivre la basse : `note("<c2!2 ab1!2 f1!2 g1!2>")`.';
      return true;
    },
    solution: '$: note("<c2!2 ab1!2 f1!2 g1!2>").s("gm_acoustic_bass")\n$: chord("<Cm!2 Ab!2 Fm!2 G!2>").voicing().s("triangle").gain(.4)',
    ok: 'Quatre accords tenus deux cycles chacun : huit cycles de structure, écrits en une ligne.',
  },
  'L6.6.13': {
    check: (c) => {
      const cyc = byCycle(c);
      const out = c.sounds4().filter((s) => s !== 'bd' && cyc[0].some((e) => e.s === s) && !cyc[3].some((e) => e.s === s));
      return out.length ? true : 'Inverse un masque : `mask("<1 1 0 0>")`. La couche joue au début, puis se tait.';
    },
    solution: '$: s("bd*4").bank("RolandTR909")\n$: s("hh*8").mask("<1 1 0 0>").gain(.6)\n$: note("c2 g2 eb2 g2").s("sawtooth").mask("<0 1 1 1>")',
    ok: 'Avec `<1 1 0 0>`, la couche joue deux cycles puis sort : un masque fait entrer ou sortir, selon l’ordre des 0 et des 1.',
  },
  'L6.6.14': {
    check: (c) => {
      const n = byCycle(c).map(notesAt);
      if (same(n[1], n[0])) return 'Joue `"<0 1 0 2>".pick([couplet, refrain, pont])` : un élément par cycle.';
      if (!n[3].length || same(n[3], n[0]) || same(n[3], n[1])) return 'Ajoute un 3ᵉ élément, `const pont = …`, avec ses propres notes, et mets-le dans la liste de `pick`.';
      return same(n[2], n[0]) ? true : 'Le 3ᵉ cycle doit rejouer le couplet : `"<0 1 0 2>"`.';
    },
    solution: 'const couplet = note("c2 eb2 g2 c3").s("sawtooth").gain(.5)\nconst refrain = note("ab2 g2 f2 eb2").s("sawtooth").gain(.6)\nconst pont = note("f2 ab2 c3 bb2").s("sawtooth").gain(.5)\n"<0 1 0 2>".pick([couplet, refrain, pont])',
    ok: 'Couplet, refrain, couplet, pont : le numéro choisit la section, cycle par cycle.',
  },
  'L6.6.15': {
    check: (c) => {
      if ((c.code.match(/\[\s*\d+\s*,/g) || []).length < 4) return 'Ajoute des sections à `arrange` : un refrain (`[4, stack(groove, harmo, …)]`) et un pont.';
      return c.has(/add\(\s*note\(\s*5\s*\)\s*\)/) ? true : 'Pour le pont, monte la basse d’une quarte : `harmo.add(note(5))`.';
    },
    solution: 'setcpm(120/4)\nconst groove = s("bd*4, ~ cp, hh*8").bank("RolandTR909")\nconst harmo  = note("<c2 ab1 f1 g1>").s("gm_acoustic_bass").gain(.7)\nconst nappe  = chord("<Cm Ab Fm G>").voicing().s("triangle").gain(.3)\narrange(\n  [2, groove],\n  [4, stack(groove, harmo)],\n  [4, stack(groove, harmo, nappe)],\n  [2, harmo.add(note(5))],\n  [2, harmo]\n)',
    ok: 'Intro, couplet, refrain à trois voix, pont une quarte plus haut, fin : une forme complète.',
  },
  'L6.6.16': {
    check: (c) => {
      const n = new Set(c.haps.filter((e) => e.s === 'jazz').map((e) => e.value.n));
      return [4, 5, 6, 7].every((k) => n.has(k)) ? true : 'Joue les variantes 4 à 7 : `s("jazz:4 jazz:5 jazz:6 jazz:7")`.';
    },
    solution: "samples('github:tidalcycles/dirt-samples')\ns(\"jazz:4 jazz:5 jazz:6 jazz:7\").gain(.8)",
    ok: 'Même banque, quatre autres fichiers : le nombre après les deux-points choisit l’échantillon.',
  },
  'L6.6.17': {
    check: (c) => {
      const a = c.haps.filter((e) => e.s === 'amen');
      if (c.haps4.some((e) => e.value.speed === 2)) return true;
      const b = a.map((e) => e.value.begin);
      return b.length > 1 && b.every((x, i) => i === 0 || x < b[i - 1]) ? true : 'Ajoute `.rev()` au bout (les tranches à l’envers), ou `.sometimesBy(.3, x => x.speed(2))`.';
    },
    solution: "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })\ns(\"amen/4\").fit().chop(16).cut(1).rev()",
    ok: 'Les tranches de chaque cycle jouent de la dernière à la première : le même break, à rebours.',
  },
  'L6.6.18': {
    check: (c) => {
      const m = c.code.match(/slice\(\s*8\s*,\s*"([^"]+)"/);
      if (!m) return 'Garde `slice(8, "…")` et change seulement l’ordre entre guillemets.';
      return m[1].replace(/\s+/g, ' ').trim() !== '<0 2 1 3 4 6 5 7>' ? true : 'Invente ton ordre : `"<0 0 4 4 2 6 [5 7]>"`, par exemple.';
    },
    solution: "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })\ns(\"amen/4\").fit().slice(8, \"<0 0 4 4 2 6 [5 7]>\").cut(1)",
    ok: 'Une autre suite de tranches, un autre groove, avec le même enregistrement.',
  },
  'L6.6.19': {
    check: (c) => (c.haps.some((e) => e.s === 'triangle' && e.note === 43) ? true : 'Ajoute une 3ᵉ voix dans `layer` : `x => x.add(note(7)).s("triangle").gain(.3)`.'),
    solution: 'note("<c2 ab1 f1 g1>").layer(\n  x => x.s("sawtooth"),\n  x => x.s("square").add(note(12)).gain(.5),\n  x => x.add(note(7)).s("triangle").gain(.3)\n)',
    ok: 'Trois voix d’une même basse : la fondamentale, l’octave, et la quinte (do2 + 7 demi-tons = sol2).',
  },
  'L6.6.20': {
    check: (c) => {
      const r = new Set(V(c, 'release'));
      return r.has(0) && r.has(0.3) ? true : 'Ajoute `.release("<0 .3>")` : un cycle sans traîne, un cycle avec 0,3 s.';
    },
    solution: 'note("c eb g c4").clip("<.3 .6 1 2>")\n.s("gm_electric_guitar_clean").room(.3).release("<0 .3>")',
    ok: 'Un cycle sec, un cycle où chaque note s’éteint en 0,3 s après sa durée.',
  },
  'L6.6.21': {
    check: (c) => {
      const bd = c.haps.filter((e) => e.s === 'bd');
      if (!bd.length || bd[0].value.room == null) return 'Donne une réverbération courte à la batterie : `.room(.2).size(1)`.';
      if (bd[0].value.roomsize == null || bd[0].value.roomsize > 1.5) return 'Garde la salle de la batterie petite : `.size(1)`.';
      const bass = c.haps.filter((e) => e.s === 'sawtooth');
      return bass.length && bass.every((e) => e.value.orbit === 2) ? true : 'Laisse la basse en `orbit(2)` : sa grande salle doit rester séparée.';
    },
    solution: '$: s("bd*4").gain(.9).room(.2).size(1)\n$: s("hh*8").gain(.5).pan(sine.range(.3,.7))\n$: note("c2 g2").s("sawtooth").gain(.7).orbit(2).room(.4)',
    ok: 'Deux espaces dans le même mix : une petite pièce pour la batterie (orbit 1), une autre pour la basse (orbit 2).',
  },
  'L6.6.22': {
    check: (c) => {
      const s = c.sounds4();
      if (!s.includes('gm_acoustic_bass')) return 'Enlève le `_` devant `bass$:` pour faire entrer la basse.';
      if (!s.includes('sawtooth')) return 'Enlève le `_` devant `lead$:` pour faire entrer le lead.';
      const f = V(c, 'cutoff');
      return f.length === c.haps4.length && f.every((x) => x === 400) ? true : 'Pour le break, ajoute une dernière ligne : `all(x=>x.lpf(400))`.';
    },
    solution: 'setcpm(120/4)\ndrums$: s("bd*4, ~ cp").bank("RolandTR909")\nbass$: note("c2 ~ g2 ~").s("gm_acoustic_bass")\nlead$: n("0 2 4 7").scale("C:minor").s("sawtooth").gain(.4)\nall(x=>x.lpf(400))',
    ok: 'Trois pistes entrées une à une, puis un filtre sur tout le mix : un break joué en direct.',
  },

  /* ================= Autres genres (module 7) ================= */
  'L7.7.3': {
    check: (c) => {
      if (c.has('chop(')) return 'Remplace `.chop(8)` par `.slice(8, "<0 2 4 6 1 3 5 7>")`.';
      return c.has(/slice\(\s*8\s*,/) ? true : 'Écris `.slice(8, "<0 2 4 6 1 3 5 7>")` sur la voix.';
    },
    solution: 'setcpm(124/4)\n$: s("bd*4, ~ cp").bank("RolandTR909")\n$: s("numbers:3").slice(8, "<0 2 4 6 1 3 5 7>").gain(.7).room(.2)\n$: n("0 2 4 6").s("numbers").gain(.55)',
    ok: 'La voix est découpée en 8 tranches, jouées dans l’ordre que tu as écrit : un autre phrasé, avec le même enregistrement.',
  },
  'L7.7.4': {
    check: (c) => {
      if (!c.has(/stack\(\s*(clap\s*,\s*bass|bass\s*,\s*clap)\s*\)/)) return 'Ajoute la section sans kick : `[8, stack(clap, bass)]`.';
      const sec = c.code.match(/\[\s*\d+\s*,\s*[^\]]*\]/g) || [];
      const i = sec.findIndex((x) => /stack\(\s*(clap\s*,\s*bass|bass\s*,\s*clap)\s*\)/.test(x));
      return i > 0 && i < sec.length - 1 && /kick/.test(sec[i + 1]) ? true : 'Place le break juste avant une section où le kick revient : c’est son retour qui fait le drop.';
    },
    solution: 'setcpm(124/4)\nconst kick = s("bd*4").bank("RolandTR909")\nconst clap = s("~ cp ~ cp").bank("RolandTR909")\nconst bass = note("<c2 ab1 bb1 c2>").s("sawtooth").lpf(800).gain(.6)\narrange(\n  [8,  kick],\n  [8,  stack(kick, clap)],\n  [8,  stack(clap, bass)],\n  [16, stack(kick, clap, bass)],\n  [8,  kick]\n)',
    ok: 'Huit mesures sans kick, puis il revient avec tout le reste : le drop.',
  },
  'L7.7.5': {
    check: (c) => {
      const m = c.code.match(/chord\(\s*"([^"]+)"/);
      if (!m || m[1] === '<Cm7 Ab^7 Bb^7 Cm7>') return 'Change la grille : `chord("<Fm7 Db^7 Eb^7 Fm7>")`.';
      const bpm = Math.round(c.cps * 240);
      if (bpm === 124 || bpm < 122 || bpm > 126) return `Le tempo est à ${bpm} BPM : choisis une autre valeur entre 122 et 126, par exemple \`setcpm(126/4)\`.`;
      return true;
    },
    solution: 'setcpm(126/4)\nconst drums  = s("bd*4, ~ cp ~ cp, [~ hh]*4").bank("RolandTR909")\nconst bass   = note("<f1 f1 db2 eb2>").s("sawtooth").lpf(900).gain(.7)\nconst chords = chord("<Fm7 Db^7 Eb^7 Fm7>").voicing().s("sawtooth").lpf(2000).attack(.1).gain(.4).room(.4)\nconst vox    = s("numbers:3").chop(8).gain(.5).room(.3)\narrange(\n  [8,  bass],\n  [8,  stack(drums, bass)],\n  [16, stack(drums, bass, chords)],\n  [8,  stack(drums, chords, vox)],\n  [16, stack(drums, bass, chords, vox)],\n  [8,  drums]\n)',
    ok: 'Autre grille, autre tempo, même squelette : le gabarit tient, l’histoire change.',
  },
  'L7.7.11': {
    check: (c) => {
      const sd = c.onsets('sd');
      return sd.length === 2 && Math.abs(sd[0] - 0.25) < 0.01 && Math.abs(sd[1] - 0.75) < 0.01 ? true : 'Mets la caisse claire sur les temps 2 et 4 : `s("~ ~ sd ~ ~ ~ sd ~")`.';
    },
    solution: 'setcpm(170/4)\n$: s("bd ~ ~ ~ ~ ~ ~ ~").bank("RolandTR808").gain(.9)\n$: s("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808").gain(.8)\n$: s("hh*16").bank("RolandTR808").gain(.3)\n$: note("c1*4").s("sine").gain(.8)',
    ok: 'Même tempo, mais la caisse claire tombe deux fois par mesure : l’oreille compte deux fois plus vite.',
  },
  'L7.7.12': {
    check: (c) => {
      if (c.has('iter(')) return 'Remplace `.iter(4)` par `.slice(16, "<0 1 2 3 8 9 6 7>")`.';
      return c.has(/slice\(\s*16\s*,/) ? true : 'Écris `.slice(16, "<0 1 2 3 8 9 6 7>")` à la place de `.chop(16).iter(4)`.';
    },
    solution: AMEN + '\nsetcpm(170/4)\n$: s("amen/4").fit().slice(16, "<0 1 2 3 8 9 6 7>").cut(1).gain(.9)\n$: note("<c1 c1 eb1 c1>").s("sine").gain(.7)',
    ok: 'Tu choisis toi-même quelle tranche du break joue, et quand : ton propre découpage.',
  },
  'L7.7.13': {
    check: (c) => {
      const n = new Set(c.notes4());
      return n.has(24.5) || n.has(24.05) ? true : 'Change le désaccord de la deuxième note : `note("[24,24.5]*8")`, puis `24.05`.';
    },
    solution: 'setcpm(170/4)\n$: s("bd ~ ~ ~ sd ~ ~ ~").bank("RolandTR808")\n$: note("[24,24.5]*8").s("sawtooth").lpf(sine.range(300,1400).slow(4)).lpq(7).decay(.2).sustain(.6).gain(.55)',
    ok: 'Un quart de ton d’écart (0,5 demi-ton) : les fondamentales, 32,7 et 33,7 Hz, battent environ une fois par seconde, et chaque harmonique bat plus vite qu’elle (la 10ᵉ, dix fois plus) : le son devient rauque. À 0,05 demi-ton, tout bat dix fois plus lentement, et la basse redevient presque pure.',
  },
  'L7.7.14': {
    check: (c) => {
      const sd = byCycle(c, (e) => e.s === 'sd')[0].map((e) => Math.round(e.begin * 1000) / 1000);
      return sd.length === 1 && sd[0] === 0.5 ? true : 'Inverse l’ordre des deux sections dans `arrange` : la section half-time (caisse claire sur le 3ᵉ temps) d’abord.';
    },
    solution: 'setcpm(170/4)\nconst hats = s("hh*16").bank("RolandTR808").gain(.3)\nconst subs = note("[24,24.2]*4").s("sawtooth").lpf(700).lpq(6).gain(.55)\narrange(\n  [8, stack(s("bd ~ ~ ~ ~ ~ ~ ~, ~ ~ ~ ~ sd ~ ~ ~").bank("RolandTR808"), hats, subs)],\n  [8, stack(s("bd*2, ~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808"), hats, subs)]\n)',
    ok: 'Huit mesures lourdes en half-time, puis la caisse claire double : le passage au full-time relance l’énergie.',
  },
  'L7.7.15': {
    check: (c) => {
      const n = c.notes4();
      if (!n.includes(29)) return 'Passe la basse en fa : `note("[29,29.2]*4")`.';
      if (!n.some((x) => pc(x) === 1)) return 'Passe la nappe en fa mineur : `chord("<Fm7 Db^7>")`.';
      return c.has(/\[\s*32\s*,\s*stack\(\s*brk/) ? true : 'Allonge le drop : `[32, stack(brk, sub, pad)]`.';
    },
    solution: AMEN + '\nsetcpm(170/4)\nconst sub   = note("[29,29.2]*4").s("sawtooth").lpf(700).lpq(6).gain(.55)\nconst brk   = s("amen/4").fit().chop(16).iter(4).cut(1).gain(.9)\nconst pad   = chord("<Fm7 Db^7>").voicing().s("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)\narrange(\n  [8,  stack(pad, sub)],\n  [8,  stack(pad, sub, s("~ ~ sd ~").bank("RolandTR808").gain(.5))],\n  [32, stack(brk, sub, pad)],\n  [8,  stack(pad, sub)]\n)',
    ok: 'Tout en fa mineur, et un drop de 32 mesures : à 170 BPM, il dure 45 secondes.',
  },
  'L7.7.21': {
    check: (c) => {
      const bpm = Math.round(c.cps * 240);
      if (bpm !== 16) return `Le tempo est à ${bpm} BPM. Descends à \`setcpm(16/4)\`.`;
      if (!V(c, 'attack').some((a) => a >= 4)) return 'Allonge l’attaque de la nappe : `attack(4)`.';
      return V(c, 'release').some((r) => r >= 6) ? true : 'Allonge l’extinction : `release(6)`.';
    },
    solution: 'setcpm(16/4)\n$: note("c2").s("sine").gain(.35).room(.5)\n$: chord("<Cm7 Ab^7>").voicing().s("sawtooth").lpf(900).attack(4).release(6).room(.85).roomsize(8).gain(.35)',
    ok: 'À 16 BPM, un cycle dure 15 secondes ; chaque accord met 4 s à monter et 6 s à s’éteindre.',
  },
  'L7.7.22': {
    check: (c) => {
      if (!c.has(/sine\.range\(\s*200\s*,\s*2000\s*\)/)) return 'Élargis la vague : `sine.range(200, 2000)`.';
      return c.has(/sine\.range\(\s*200\s*,\s*2000\s*\)\.slow\(\s*24\s*\)/) ? true : 'Ralentis-la : `.slow(24)` juste après le `range`.';
    },
    solution: 'setcpm(24/4)\n$: note("c2,c3").s("sawtooth").lpf(sine.range(200,2000).slow(24)).lpq(3).room(.7).gain(.35)\n$: n("0 2 4 6").scale("C:minor").s("triangle").slow(2).attack(1).release(3).room(.8).gain(.25).sometimesBy(.4, x=>x.add(note(12)))',
    ok: 'Une vague de 200 à 2 000 Hz sur 24 cycles : à 24 BPM, un aller-retour dure quatre minutes.',
  },
  'L7.7.23': {
    check: (c) => {
      const line = c.code.split('\n').find((l) => l.includes('irand'));
      return line && /\.ribbon\(\s*\d+\s*,\s*\d+\s*\)/.test(line) ? true : 'Ajoute `.ribbon(3, 4)` sur la ligne de `irand`.';
    },
    solution: 'setcpm(24/4)\n$: note("c2").s("sine").gain(.3)\n$: n(irand(8).segment(4)).seed(1).scale("C:minor").s("triangle").attack(1).release(4).room(.85).gain(.3).degradeBy(.4).ribbon(3, 4)\n$: n("0 3 5 7").scale("C:minor").s("sawtooth").lpf(900).slow(3).sometimesBy(.5, x=>x.add(note("<0 7 12>"))).room(.7).gain(.2)',
    ok: 'La couche de hasard rejoue maintenant en boucle quatre cycles choisis. Change le premier nombre pour en essayer d’autres.',
  },
  'L7.7.23b': {
    check: (c) => (c.has(/\{\s*0 4 2 5\s*,\s*7 5 3\s*\}/) ? true : 'Change les longueurs : `{0 4 2 5, 7 5 3}%4`, quatre notes contre trois.'),
    solution: 'setcpm(24/4)\n$: note("c2").s("sine").gain(.3).room(.5)\n$: n("{0 4 2 5, 7 5 3}%4").scale("C:minor").s("triangle").attack(.5).release(2).room(.8).gain(.3)',
    ok: 'Quatre notes contre trois, au même pas : la figure complète revient tous les 12 pas, soit tous les 3 cycles avec `%4`.',
  },
  'L7.7.24': {
    check: (c) => {
      if (c.count('space') < 16) return 'Pousse le découpage : `chop(32)`.';
      return V(c, 'delayfeedback').some((f) => f >= 0.8) ? true : 'Pousse la réinjection : `delayfeedback(.8)`.';
    },
    solution: 'setcpm(24/4)\n$: s("space").chop(32).slow(2).delay(.6).delaytime(.375).delayfeedback(.8).room(.9).roomsize(10).orbit(2).gain(.3)\n$: note("c2").s("sine").room(.6).gain(.3)',
    ok: '32 grains au lieu de 16, et 80 % de chaque écho réinjecté : le son se dissout dans sa propre traîne.',
  },

  /* ================= Guitare (module 3) ================= */
  'L3.3.1': {
    check: (c) => {
      const s = c.sounds();
      if (s.includes('gm_acoustic_guitar_nylon')) return 'Remplace le son par `gm_acoustic_guitar_steel`, puis par `gm_electric_guitar_clean`.';
      return s.includes('gm_acoustic_guitar_steel') || s.includes('gm_electric_guitar_clean') ? true : 'Écris `.s("gm_acoustic_guitar_steel")`.';
    },
    solution: 'note("e3 a3 d4 g4").s("gm_acoustic_guitar_steel").room(.3)',
    ok: 'Mêmes notes, autre instrument enregistré : cordes nylon, cordes acier, guitare électrique.',
  },
  'L3.3.2': {
    check: (c) => (same(c.notes(), [64, 59, 55, 50, 45, 40]) ? true : 'Joue les cordes à l’envers, de l’aigu au grave : `note("e4 b3 g3 d3 a2 e2")`.'),
    solution: 'note("e4 b3 g3 d3 a2 e2").s("gm_acoustic_guitar_nylon").room(.3)',
    ok: 'Mi aigu, si, sol, ré, la, mi grave : les six cordes à vide, de la plus fine à la plus grosse.',
  },
  'L3.3.3': {
    check: (c) => (same(c.notes(), [45, 46, 47, 48, 49, 50]) ? true : 'Monte la corde de la case par case : `note("a2 a#2 b2 c3 c#3 d3")`.'),
    solution: 'note("a2 a#2 b2 c3 c#3 d3").s("gm_acoustic_guitar_nylon").clip(1.2)',
    ok: 'Six cases, six demi-tons : la 5ᵉ case de la corde de la donne ré, la note de la corde suivante.',
  },
  'L3.3.6': {
    check: (c) => (same(c.notes(), [45, 47, 48, 50, 52, 53, 55, 57]) ? true : 'Joue les notes naturelles de la corde de la : `note("a2 b2 c3 d3 e3 f3 g3 a3")`.'),
    solution: 'note("a2 b2 c3 d3 e3 f3 g3 a3").s("gm_acoustic_guitar_nylon").clip(1.2)',
    ok: 'De si à do, une seule case (un demi-ton) ; de même de mi à fa. Partout ailleurs, deux cases.',
  },
  'L3.3.7': {
    check: (c) => {
      if (!c.has('scale(')) return 'Écris la gamme en degrés : `n("0 1 2 3 4 5 6 7").scale("C:major")`.';
      return same(c.notes(), [48, 50, 52, 53, 55, 57, 59, 60]) ? true : 'Garde `n("0 1 2 3 4 5 6 7")` et `.scale("C:major")` : huit degrés, de do à do.';
    },
    solution: 'n("0 1 2 3 4 5 6 7").scale("C:major").s("gm_acoustic_guitar_steel")',
    ok: 'Exactement les mêmes notes (do3 à do4) : en demi-tons depuis 48, ou en degrés de la gamme.',
  },
  'L3.3.8': {
    check: (c) => {
      const cyc = byCycle(c).map(notesAt);
      return cyc.every((n) => same(n, [43, 48, 53, 58, 62, 67])) ? true : 'Fixe le capo à la 3ᵉ case : remplace `.add(note("<0 2 5>"))` par `.add(note(3))`.';
    },
    solution: 'note("e2 a2 d3 g3 b3 e4").add(note(3)).s("gm_acoustic_guitar_nylon").clip(1.5)',
    ok: 'Chaque corde monte de 3 demi-tons : mi devient sol, la devient do, et ainsi de suite.',
  },
  'L3.3.9': {
    check: (c) => (c.count() === 7 && c.has(/0 2 3 4 2 0/) ? true : 'Joue la phrase : `n("0 2 3 4 2 0 <3 5>").scale("E:minor:pentatonic")`.'),
    solution: 'setcpm(70/4)\nn("0 2 3 4 2 0 <3 5>").scale("E:minor:pentatonic").s("gm_electric_guitar_clean").clip(1.3)',
    ok: 'Sept notes, toutes dans la pentatonique de mi mineur : aucune ne peut sonner faux.',
  },
  'L3.3.10': {
    check: (c) => {
      const bass = byCycle(c, (e) => e.s === 'gm_distortion_guitar').map(notesAt);
      if (!same(bass[0], [45, 45]) || !same(bass[1], [48, 50])) return 'Change la basse : `note("<a2 a2 c3 d3>*2")`.';
      const A_PENTA = [9, 0, 2, 4, 7];
      const mel = c.haps4.filter((e) => e.s === 'gm_electric_guitar_clean').map((e) => pc(e.note));
      return mel.length && mel.every((p) => A_PENTA.includes(p)) && mel[0] === 9 ? true : 'Passe la mélodie en la mineur : `scale("A:minor:pentatonic")`.';
    },
    solution: 'setcpm(80/4)\n$: note("<a2 a2 c3 d3>*2").s("gm_distortion_guitar").clip(.6).gain(.7)\n$: n("0 ~ 2 3 ~ 2 ~ 0").scale("A:minor:pentatonic").s("gm_electric_guitar_clean").gain(.5)',
    ok: 'Le même riff, cinq demi-tons plus haut : en la mineur.',
  },
  'L3.3.11': {
    check: (c) => {
      const t = new Set(c.haps.map((e) => e.begin));
      return same(c.notes(), [40, 47, 52, 56, 59, 64]) && t.size === 6 ? true : 'Arpège l’accord : les mêmes notes, séparées par des espaces au lieu de virgules : `note("e2 b2 e3 g#3 b3 e4")`.';
    },
    solution: 'note("e2 b2 e3 g#3 b3 e4").s("gm_acoustic_guitar_nylon").room(.4)',
    ok: 'Les virgules plaquaient les six cordes ensemble ; les espaces les égrènent, de la plus grave à la plus aiguë.',
  },
  'L3.3.13': {
    check: (c) => (c.chords(c.haps4).some((ch) => same(ch, [45, 52, 57, 60, 64])) ? true : 'Joue la mineur : `note("[a2,e3,a3,c4,e4]")`, avec do (c4) au lieu de do dièse (c#4).'),
    solution: 'note("[a2,e3,a3,c4,e4]").s("gm_acoustic_guitar_steel").room(.4)',
    ok: 'Une seule note change, do dièse devient do : la tierce baisse d’un demi-ton, et l’accord devient mineur.',
  },
  'L3.3.14': {
    check: (c) => {
      const pcs = byCycle(c, (e) => e.s === 'gm_acoustic_guitar_nylon').map((a) => [...new Set(a.map((e) => pc(e.note)))].sort((x, y) => x - y));
      return same(pcs[0], [2, 7, 11]) && same(pcs[1], [2, 6, 9]) && same(pcs[2], [4, 7, 11]) ? true : 'Change la grille : `chord("<G D Em C>").voicing()`.';
    },
    solution: 'setcpm(100/4)\n$: chord("<G D Em C>").voicing().s("gm_acoustic_guitar_nylon").room(.4).gain(.7)\n$: sound("bd*4, [~ sd]*2").bank("RolandTR909").gain(.6)',
    ok: 'Sol, ré, mi mineur, do : la même recette (I, V, vi, IV), en sol majeur.',
  },
  'L3.3.15': {
    check: (c) => {
      const t = [...new Set(c.haps.filter((e) => e.s === 'gm_acoustic_guitar_steel').map((e) => Math.round(e.begin * 1000) / 1000))];
      return same(t, [0, 0.125, 0.375, 0.5, 0.75]) ? true : 'Change le motif de grattage : `.struct("x x ~ x x ~ x ~")`.';
    },
    solution: 'setcpm(110/4)\n$: chord("<C G Am F>").voicing().struct("x x ~ x x ~ x ~").s("gm_acoustic_guitar_steel").room(.3).gain(.7)\n$: sound("bd ~ sd ~").bank("RolandTR909").gain(.6)',
    ok: 'Cinq frappes par mesure, placées autrement : mêmes accords, autre groove.',
  },
  'L3.3.16': {
    check: (c) => (c.chords().some((ch) => same(ch, [40, 47, 52])) ? true : 'Ajoute l’octave de la fondamentale au premier accord : `[e2,b2,e3]`.'),
    solution: 'note("[e2,b2,e3] [a2,e3] [d3,a3]").s("gm_distortion_guitar").clip(1).gain(.7)',
    ok: 'Mi, si, mi : la fondamentale, la quinte et l’octave. Pas de tierce, donc ni majeur ni mineur.',
  },
  'L3.3.17': {
    check: (c) => {
      const roots = byCycle(c).flatMap((a) => c.chords(a).map((ch) => ch[0]));
      return same(roots.slice(0, 4), [40, 40, 43, 45]) ? true : 'Écris le riff : `note("[0,7]".add("<40 40 43 45>")).fast(2)`.';
    },
    solution: 'note("[0,7]".add("<40 40 43 45>")).fast(2).s("gm_distortion_guitar").clip(.9).gain(.7)',
    ok: 'Mi, mi, sol, la, deux power chords par cycle : la suite revient tous les deux cycles.',
  },
  'L3.3.18': {
    check: (c) => {
      const v = c.haps.map((e) => e.value.clip);
      return same(v, [0.2, 0.2, 0.2, 1, 0.2, 0.2, 1, 1]) ? true : 'Mélange étouffé et ouvert : `.clip(".2 .2 .2 1 .2 .2 1 1")`.';
    },
    solution: 'setcpm(120/4)\nnote("e2*8").s("gm_distortion_guitar").clip(".2 .2 .2 1 .2 .2 1 1").gain(.7)',
    ok: 'Cinq notes étouffées (20 % de leur durée), trois ouvertes : le contraste fait le motif.',
  },
  'L3.3.19': {
    check: (c) => {
      const ch = byCycle(c).map((a) => c.chords(a)[0] || []);
      if (ch[0].includes(56)) return 'Remplace `g#3` par `g3` : l’accord devient mineur.';
      return same(ch[0], [40, 47, 52, 55, 59, 64]) && ch[1][0] === 43 && ch[2][0] === 45 ? true : 'Garde la forme mineure et déplace-la : `.add("<0 3 5>")`.';
    },
    solution: 'note("[e2,b2,e3,g3,b3,e4]".add("<0 3 5>")).s("gm_electric_guitar_clean").room(.3).gain(.7)',
    ok: 'La forme de mi mineur, déplacée de 0, 3 puis 5 cases : mi mineur, sol mineur, la mineur.',
  },
  'L3.3.20': {
    check: (c) => {
      const bpm = Math.round(c.cps * 240);
      if (bpm !== 110) return `Le tempo est à ${bpm} BPM. Ralentis : \`setcpm(110/4)\`.`;
      const low = byCycle(c, (e) => e.s === 'gm_distortion_guitar').map((a) => Math.min(...notesAt(a)));
      return low[0] === 40 && low[1] === 45 && low[2] === 43 ? true : 'Change la note de base : `.add("<40 45 43>")`.';
    },
    solution: 'setcpm(110/4)\n$: note("[0,7]".add("<40 45 43>")).struct("x x x ~ x x ~ x").s("gm_distortion_guitar").clip(.3).gain(.7)\n$: sound("bd*4, [~ sd]*2, hh*8").bank("RolandTR909").gain(.6)',
    ok: 'Plus lent, et le riff voyage : mi, la, sol.',
  },
  'L3.3.21': {
    check: (c) => {
      const t = new Set(c.haps.map((e) => e.begin));
      return same(c.notes(), [48, 52, 55, 60, 64, 67]) && t.size === 6 ? true : 'Allonge l’arpège : `note("[c3 e3 g3 c4 e4 g4]")`.';
    },
    solution: 'note("[c3 e3 g3 c4 e4 g4]").s("gm_acoustic_guitar_nylon").clip(1.5).room(.3)',
    ok: 'Six notes de l’accord de do, sur deux octaves, qui montent une à une.',
  },
  'L3.3.22': {
    check: (c) => (c.count() === 6 ? true : 'Allonge le motif : `n("0 1 2 3 2 1")`.'),
    solution: 'setcpm(90/4)\nn("0 1 2 3 2 1").chord("<C Am F G>").voicing().s("gm_acoustic_guitar_nylon").clip(1.5).room(.3)',
    ok: 'Six notes par accord : le picking monte puis redescend.',
  },
  'L3.3.23': {
    check: (c) => (same(c.haps.map((e) => e.value.gain), [0.5, 1, 0.5, 0.7]) ? true : 'Déplace l’accent sur la 2ᵉ note : `gain(".5 1 .5 .7")`.'),
    solution: 'setcpm(100/4)\nnote("c3 e3 g3 c4").s("gm_acoustic_guitar_steel").gain(".5 1 .5 .7").clip(1.2)',
    ok: 'L’accent passe sur la 2ᵉ note : même arpège, autre appui.',
  },
  'L3.3.24': {
    check: (c) => (V(c, 'distort').some((d) => d >= 6) ? true : 'Pousse la saturation : `.distort("6:.3")`.'),
    solution: 'setcpm(90/4)\nn("0 2 4 7 4 2").scale("E:minor:pentatonic").s("gm_electric_guitar_clean").distort("6:.3").phaser(2).delay(.25).room(.3)',
    ok: 'À 6, la saturation écrase fortement les crêtes ; le `.3` garde le volume à 30 % pour compenser.',
  },
  'L3.3.25': {
    check: (c) => {
      const A_MINOR = [9, 11, 0, 2, 4, 5, 7];
      const out = [...new Set(c.notes4().map(pc))].filter((p) => !A_MINOR.includes(p));
      if (out.length) return 'Il reste des notes hors de la gamme de la mineur. Change la guitare (`chord("<Am F C G>").voicing()`), la basse (`<a1 f2 c2 g2>`) et la mélodie (`A:minor:pentatonic`).';
      return c.haps.some((e) => e.s === 'gm_acoustic_bass' && e.note === 33) ? true : 'Commence la basse sur la : `note("<a1 f2 c2 g2>")`.';
    },
    solution: 'setcpm(128/4)\n$: sound("bd*4, [~ sd]*2, hh*8").bank("RolandTR909").gain(.6)\n$: note("<a1 f2 c2 g2>").s("gm_acoustic_bass").clip(.9).gain(.7)\n$: chord("<Am F C G>").voicing().struct("x ~ x x ~ x ~ x").s("gm_distortion_guitar").distort("2:.3").gain(.5)\n$: n("0 2 4 2 <3 5>").scale("A:minor:pentatonic").s("gm_electric_guitar_clean").gain(.45).delay(.2)',
    ok: 'Batterie, basse, accords et mélodie, tous en la mineur : le morceau a changé de tonalité.',
  },
};
