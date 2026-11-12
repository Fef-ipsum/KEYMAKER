// Fondations — Chapitre VIII : Assembler.
// Des pistes, une structure, un mixage : de la boucle au morceau.

const num = (v) => (typeof v === 'number' ? v : parseFloat(v));

const BASE = `setcpm(120/4)

$: sound("bd*4").bank("RolandTR909")

$: sound("hh*8").bank("RolandTR909").gain(.5)

$: sound("[~ cp]*2").bank("RolandTR909")

$: note("<a1 f1 c2 g1>").struct("x*8").sound("sawtooth").lpf(700).decay(.15).sustain(0)

$: chord("<Am F C G>").voicing().sound("triangle").room(.5).gain(.6)`;

export default {
  id: 'assembler',
  title: 'Assembler',
  goal: 'Construire un morceau en couches, avec des entrées, un équilibre et une forme.',
  steps: [
    {
      id: 'f.pistes',
      title: 'Couper une piste',
      listen: 'Cinq pistes. Écoute l’ensemble.',
      code: BASE,
      name:
        'Un souligné devant le dollar, `_$:`, **coupe** la piste sans l’effacer. C’est le bouton *mute* d’une table de mixage. Tu enlèves le souligné, elle revient.',
      task: {
        text: 'Coupe le charleston : ajoute `_` devant le `$:` de la ligne `hh*8`, puis relance.',
        check: (c) => {
          if (!c.has('hh')) return 'N’efface pas la ligne : ajoute seulement `_` devant son `$:`.';
          return !c.sounds().includes('hh') ? true : 'Le charleston joue encore. Écris `_$: sound("hh*8")…`.';
        },
        ok: 'Arranger un morceau, c’est d’abord décider qui joue et qui se tait.',
      },
      deep: {
        why:
          'Jouer en direct avec Strudel, c’est souvent ça : couper et rouvrir des pistes, puis relancer avec ▶ (ou Ctrl+Entrée). ' +
          'On peut aussi nommer ses pistes pour s’y retrouver : `kick: sound("bd*4")` fonctionne comme `$:`, et `_kick:` la coupe.',
        decode: [
          ['$:', 'une piste active.', 'fn.dollar'],
          ['_$:', 'la même piste, coupée.', 'fn.dollar'],
        ],
        wiki: ['fn.dollar', 'fn.hush'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Comment couper une piste sans l’effacer ?',
          choices: ['Écrire `_$:` à la place de `$:`', 'Écrire `$:` deux fois', 'Mettre la ligne entre crochets'],
          answer: 0,
          explain: 'Le souligné devant `$:` met la piste en sourdine.',
        },
      ],
      legacy: ['6:6.1', '6:6.3'],
    },

    {
      id: 'f.entrees',
      title: 'Faire entrer une piste plus tard',
      listen: 'Écoute quatre cycles : la basse n’est pas là au début, elle arrive au deuxième.',
      code: `setcpm(120/4)

$: sound("bd*4, hh*8").bank("RolandTR909").gain(.8)

$: note("<a1 f1 c2 g1>").struct("x*8").sound("sawtooth").lpf(700).decay(.15).sustain(0)
  .mask("<0 1 1 1>")`,
      name:
        '`.mask("<0 1 1 1>")` ouvre ou ferme la piste, cycle par cycle : `0` = silence, `1` = la piste joue. Ici elle se tait un cycle puis joue trois cycles.',
      task: {
        text: 'Fais entrer la basse seulement au **troisième** cycle : `.mask("<0 0 1 1>")`.',
        check: (c) => {
          const bass = c.haps4.filter((e) => e.note != null);
          const early = bass.filter((e) => e.begin < 2).length;
          const late = bass.filter((e) => e.begin >= 2).length;
          if (!late) return 'La basse ne joue plus du tout : garde des `1` à la fin du masque.';
          return early === 0 ? true : 'La basse joue encore pendant les deux premiers cycles. Écris `<0 0 1 1>`.';
        },
        ok: 'Tu viens d’écrire une introduction.',
      },
      deep: {
        why:
          'Les morceaux de danse sont construits par blocs de 4, 8 ou 16 mesures : on ajoute ou on retire un élément à chaque bloc. ' +
          'Pour des blocs plus longs, on allonge le masque : `.mask("<0!8 1!8>")` = 8 cycles sans, 8 cycles avec. ' +
          'Autre outil : `arrange([8, intro], [16, couplet])` enchaîne des sections entières.',
        decode: [
          ['.mask("<0 1 1 1>")', 'un cycle fermé, trois cycles ouverts.', 'fn.mask'],
          ['<0!8 1!8>', '8 cycles fermés puis 8 ouverts.', 'mini.exclamation'],
        ],
        wiki: ['fn.mask', 'fn.arrange', 'mini.chevrons', 'genre.structure'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que fait `.mask("<1 1 1 0>")` sur une piste ?',
          choices: ['Elle joue trois cycles puis se tait au quatrième', 'Elle se tait trois cycles puis joue le quatrième', 'Elle joue une note sur quatre'],
          answer: 0,
          explain: '`1` = la piste joue, `0` = elle se tait ; les chevrons avancent d’une valeur par cycle.',
        },
      ],
      legacy: ['6:6.13'],
    },

    {
      id: 'f.mix',
      title: 'L’équilibre : qui est devant',
      listen: 'Écoute : les accords couvrent tout, et le charleston est aussi fort que le kick.',
      code: `setcpm(120/4)

$: sound("bd*4").bank("RolandTR909")

$: sound("hh*8").bank("RolandTR909")

$: note("<a1 f1 c2 g1>").struct("x*8").sound("sawtooth").lpf(700).decay(.15).sustain(0)

$: chord("<Am F C G>").voicing().sound("sawtooth").gain(1)`,
      name:
        'Mixer, c’est régler le **volume** de chaque piste avec `.gain(…)` pour que chacune ait sa place. En musique de danse, le kick est devant ; le reste se range derrière lui.',
      task: {
        text: 'Baisse le charleston (`.gain(.4)`) et les accords (`.gain(.4)`).',
        check: (c) => {
          const hh = c.haps.filter((e) => e.s === 'hh').map((e) => num(e.value.gain));
          if (!hh.length) return 'Garde la piste de charleston.';
          if (!hh.every((g) => g <= 0.6)) return 'Ajoute `.gain(.4)` à la fin de la ligne du charleston.';
          const ch = c.haps.filter((e) => e.note != null && e.note >= 52 && e.s === 'sawtooth').map((e) => num(e.value.gain));
          return ch.length && ch.every((g) => g <= 0.6) ? true : 'Baisse aussi les accords : `.gain(.4)` au lieu de `.gain(1)`.';
        },
        ok: 'On entend enfin le kick et la basse. Mixer, c’est surtout baisser.',
      },
      deep: {
        why:
          'Trois autres outils de place : `.lpf(…)` sur les accords pour laisser l’aigu au charleston ; `.pan(…)` pour placer une piste à gauche (0) ou à droite (1) ; ' +
          '`.room(…)` pour reculer un son dans l’espace. Repère : quand tout semble trop faible, ne monte pas tout — baisse ce qui gêne.',
        decode: [
          ['.gain(.4)', 'volume de la piste (0.8 sans réglage).', 'fx.gain'],
          ['.pan(.3)', 'position gauche-droite.', 'fx.pan'],
        ],
        wiki: ['fx.gain', 'fx.pan', 'fx.lpf', 'fx.room'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Le charleston couvre le reste. Quel est le bon réflexe ?',
          choices: ['Baisser son volume avec `.gain(.4)`', 'Monter le volume de toutes les autres pistes', 'Ajouter une deuxième piste de charleston'],
          answer: 0,
          explain: 'On baisse ce qui gêne plutôt que de tout monter.',
        },
      ],
      legacy: ['6:6.21'],
    },

    {
      id: 'f.morceau',
      title: 'Ton premier morceau',
      listen: 'Tout ce que tu as appris, dans un seul code : batterie, basse, accords, une entrée progressive, un filtre qui bouge.',
      code: `setcpm(120/4)

const grille = chord("<Am F C G>")

$: sound("bd*4").bank("RolandTR909")

$: sound("hh*8").bank("RolandTR909").gain(.4).mask("<0 1 1 1>")

$: sound("[~ cp]*2").bank("RolandTR909").mask("<0 0 1 1>")

$: grille.rootNotes(1).struct("x*8").sound("sawtooth")
  .lpf(sine.range(400, 1800).slow(8)).decay(.15).sustain(0)

$: grille.voicing().sound("triangle").room(.5).gain(.5)`,
      name:
        'Tu peux lire chaque ligne : le tempo, la grille d’accords, cinq pistes, des masques pour les entrées, un signal sur le filtre de la basse.',
      task: {
        text: 'Fais-en ton morceau : change la grille d’accords, le tempo, et au moins un son ou un réglage.',
        check: (c) => {
          if (c.sounds4().length < 4) return 'Garde au moins quatre pistes différentes.';
          return c.changed ? true : 'C’est encore l’exemple. Change la grille, le tempo ou un son.';
        },
        ok: 'Les fondations sont posées. Garde ce morceau, puis direction les genres : techno, acid, trance, synth-pop.',
      },
      deep: {
        why:
          'Pour aller plus loin à partir d’ici : les **genres** t’apprennent ce qui donne son identité à un style, trait par trait. ' +
          'Les **approfondissements** creusent le son, le code et la composition. Et le **Studio** est là pour jouer sans consigne.',
        decode: [
          ['const grille = …', 'la grille, nommée pour servir à la basse et aux accords.', 'js.const'],
          ['.mask("<0 1 1 1>")', 'l’entrée progressive des pistes.', 'fn.mask'],
          ['sine.range(400, 1800).slow(8)', 'le filtre de la basse respire sur 8 cycles.', 'fn.signaux'],
        ],
        wiki: ['fn.mask', 'fn.signaux', 'fn.rootNotes', 'fn.chord', 'js.const'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'À quoi sert `const grille = chord("<Am F C G>")` ?',
          choices: ['À nommer la suite d’accords pour la réutiliser dans plusieurs pistes', 'À jouer les accords plus fort', 'À enregistrer le morceau'],
          answer: 0,
          explain: 'Un nom permet de changer la grille à un seul endroit : basse et accords suivent ensemble.',
        },
      ],
      legacy: ['6:6.25', '6:6.6'],
    },
  ],
};
