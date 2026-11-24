// Fondations — Chapitre III : Les notes.
// La hauteur, puis les noms : do-ré-mi = C-D-E, l'octave, le demi-ton.

import { pc } from '../../lib/check.js';

const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

export default {
  id: 'notes',
  title: 'Les notes',
  goal: 'Écrire une mélodie avec des lettres, et savoir ce que chaque lettre veut dire.',
  steps: [
    {
      id: 'f.hauteur',
      title: 'Grave et aigu',
      listen: 'Quatre sons de piano. Écoute : ils montent.',
      code: 'note("c2 c3 c4 c5").sound("piano")',
      name:
        'Ce qui change entre ces sons s’appelle la **hauteur** : un son est plus **grave** (bas) ou plus **aigu** (haut). `note(…)` joue des hauteurs précises.',
      task: {
        text: 'Fais descendre l’escalier : écris les mêmes notes de la plus aiguë à la plus grave.',
        check: (c) => {
          const n = c.notes();
          if (n.length < 3) return 'Garde au moins trois notes.';
          return n.every((x, i) => i === 0 || x < n[i - 1]) ? true : 'Chaque note doit être plus grave que la précédente : commence par `c5`.';
        },
        ok: 'Le chiffre règle la hauteur : plus il est grand, plus c’est aigu.',
      },
      deep: {
        why:
          'Un son est une vibration ; sa [hauteur](sol.hauteur) dépend du nombre d’allers-retours par seconde, la fréquence, en hertz (Hz). Plus elle est élevée, plus le son est aigu. ' +
          'Ici : do2 = 65 Hz, do3 = 131 Hz, do4 = 262 Hz, do5 = 523 Hz. Chaque marche vibre exactement deux fois plus vite que la précédente : c’est pour cela que ces quatre sons se ressemblent autant, et qu’ils portent le même nom, `c`. On y revient dans deux étapes. ' +
          'L’oreille humaine entend d’environ 20 à 20 000 Hz.',
        decode: [
          ['note("…")', 'joue des notes, c’est-à-dire des hauteurs.', 'fn.note'],
          ['.sound("piano")', 'avec le son d’un piano.', 'son.piano'],
          ['c2 … c5', 'la même note, de plus en plus haut.', 'sol.octave'],
        ],
        wiki: ['fn.note', 'sol.hauteur', 'sol.octave'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ces deux notes. La deuxième est-elle plus grave ou plus aiguë ?',
          code: 'note("g3 c3").sound("piano").slow(2)',
          choices: ['Plus grave', 'Plus aiguë', 'Identique'],
          answer: 0,
          explain: 'On entend sol (`g3`) puis do (`c3`) : la mélodie descend, la deuxième note est plus grave.',
        },
      ],
      legacy: ['2:2.1'],
    },

    {
      id: 'f.do-re-mi',
      schema: { type: 'clavier', mode: 'notes', notes: 'c3 d3 e3 f3 g3 a3 b3 c4', missions: ['melodie'] },
      title: 'Do ré mi = C D E',
      listen: 'Huit notes qui montent. Tu les connais : chante-les en même temps.',
      code: 'note("c d e f g a b c4").sound("piano")',
      name:
        'C’est **do ré mi fa sol la si do**. Strudel utilise les noms anglais, qui sont des lettres : ' +
        '**C** = do, **D** = ré, **E** = mi, **F** = fa, **G** = sol, **A** = la, **B** = si.',
      task: {
        text: 'Écris les trois notes **do, mi, sol**, dans cet ordre.',
        check: (c) => {
          const n = c.notes().map(pc);
          return eq(n, [0, 4, 7]) ? true : 'Do = `c`, mi = `e`, sol = `g`. Écris `note("c e g")` en gardant `.sound("piano")`.';
        },
        ok: 'Do, mi, sol : tu viens d’écrire les notes d’un accord. On en reparle au chapitre V.',
      },
      deep: {
        why:
          'La série de lettres commence au **la** : A = la, B = si, C = do… C’est un héritage historique, sans lien avec la façon dont les notes sonnent. ' +
          'Un moyen simple : retiens que **C = do**, puis déroule l’alphabet. Après G (sol), on repart à A (la). Dans le code, on écrit les lettres en minuscules. ' +
          'Les syllabes françaises, elles, viennent d’un hymne latin (voir [noms des notes](sol.noms-des-notes)).',
        decode: [
          ['c d e f g a b', 'do ré mi fa sol la si.', 'sol.noms-des-notes'],
          ['c4', 'le do suivant, une octave plus haut.', 'sol.octave'],
        ],
        wiki: ['sol.noms-des-notes', 'fn.note'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Quelle lettre correspond à la note **sol** ?',
          choices: ['G', 'S', 'E'],
          answer: 0,
          explain: 'C = do, D = ré, E = mi, F = fa, **G = sol**, A = la, B = si.',
        },
        {
          type: 'qcm',
          q: 'Et la lettre **A**, c’est quelle note ?',
          choices: ['La', 'Do', 'Si'],
          answer: 0,
          explain: 'La série anglaise commence au la : A = la, B = si, C = do.',
        },
      ],
      legacy: ['1:4.2', '2:2.2'],
    },

    {
      id: 'f.octave',
      schema: { type: 'clavier', mode: 'notes', notes: 'c3 c4', missions: ['octave'] },
      title: 'L’octave : le chiffre après la lettre',
      listen: 'Deux do. Le même nom, pas la même hauteur.',
      code: 'note("c3 c4 c3 c4").sound("piano")',
      name:
        'Le chiffre est le numéro d’**octave**. Monter d’une octave, c’est retrouver la même note, plus aiguë. ' +
        'Sans chiffre, Strudel prend l’octave 3 : `c` et `c3` sont la même note.',
      task: {
        text: 'Écris **mi** à trois hauteurs, du grave à l’aigu : octave 2, puis 3, puis 4.',
        check: (c) => (eq(c.notes(), [40, 52, 64]) ? true : 'Mi = `e`. Écris `note("e2 e3 e4")` et garde le son de piano.'),
        ok: 'Même note, trois hauteurs. Les basses vivent à l’octave 1 et 2, les mélodies à l’octave 3, 4 et 5.',
      },
      deep: {
        why:
          'Le mot « octave » vient de *huit* : de do à do, on compte huit notes (do ré mi fa sol la si do). Physiquement, monter d’une [octave](sol.octave), c’est doubler la fréquence : 131 Hz pour `c3`, 262 Hz pour `c4`. ' +
          'Le do du milieu d’un piano est `c4` (beaucoup de méthodes françaises l’appellent « do3 » : Strudel suit la numérotation internationale). ' +
          '**Piège fréquent** : `c` tout seul n’est pas ce do central mais le do en dessous (`c3`). Pour monter d’une octave depuis `c`, il faut donc écrire `c4`.',
        decode: [
          ['c3', 'do, octave 3. C’est aussi ce que joue `c` tout seul.', 'sol.octave'],
          ['c4', 'do, une octave plus haut : le do central du piano.', 'sol.octave'],
        ],
        wiki: ['sol.octave', 'sol.noms-des-notes', 'sol.midi'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Dans Strudel, `note("c")` joue la même note que…',
          choices: ['note("c3")', 'note("c4")', 'note("c1")'],
          answer: 0,
          explain: 'Sans chiffre, l’octave est 3. Le do une octave au-dessus s’écrit `c4`.',
        },
      ],
      legacy: ['1:4.3', '2:2.5'],
    },

    {
      id: 'f.demi-ton',
      schema: { type: 'clavier', mode: 'notes', notes: 'c3 c#3 d3', missions: ['demiton'] },
      title: 'Les douze notes : # et b',
      listen: 'Douze notes qui montent par les plus petites marches possibles.',
      code: 'note("c c# d d# e f f# g g# a a# b").sound("piano")',
      name:
        'Entre deux notes voisines, il y a un **demi-ton** : la plus petite marche. Le dièse `#` **monte** une note d’un demi-ton, le bémol `b` la **descend**. ' +
        'Avec eux, on obtient les 12 notes qui existent dans une octave.',
      task: {
        text: 'Joue **mi**, puis **mi bémol** : écris `e` puis `eb`.',
        check: (c) => (eq(c.notes(), [52, 51]) ? true : 'Deux notes : `e` (mi) puis `eb` (mi bémol), l’une après l’autre.'),
        ok: 'Un demi-ton plus bas. Cette petite différence change toute la couleur d’une mélodie.',
      },
      deep: {
        why:
          'Sur un piano, les dièses et bémols sont les touches noires. Une même touche a deux noms : `d#` (ré dièse) et `eb` (mi bémol) sont le même son. Deux demi-tons font un **ton**. ' +
          'Les 12 [demi-tons](sol.demi-ton) d’une octave sont égaux : chacun multiplie la fréquence par environ 1,0595 (12 fois de suite, on obtient ×2, l’octave). ' +
          '**Piège** : `b` tout seul est la note si ; `bb` est si bémol. Autre piège : il n’y a pas de touche noire entre mi et fa, ni entre si et do : ces notes sont déjà à un demi-ton l’une de l’autre.',
        decode: [
          ['c#', 'do dièse : un demi-ton au-dessus de do.', 'sol.diese-bemol'],
          ['eb', 'mi bémol : un demi-ton en dessous de mi.', 'sol.diese-bemol'],
          ['bb', 'si bémol (le premier b est la note si, le second le bémol).', 'sol.diese-bemol'],
        ],
        wiki: ['sol.demi-ton', 'sol.diese-bemol', 'sol.ton'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que veut dire `f#` ?',
          choices: ['Fa dièse : fa monté d’un demi-ton', 'Fa bémol : fa descendu d’un demi-ton', 'Fa joué plus fort'],
          answer: 0,
          explain: 'Le dièse `#` monte la note d’un demi-ton. Le bémol `b` la descend.',
        },
        {
          type: 'ecoute',
          q: 'Écoute ces deux notes. Quelle distance les sépare ?',
          code: 'note("e3 f3").sound("piano").slow(2)',
          choices: ['Un demi-ton (la plus petite marche)', 'Une octave', 'Aucune : c’est la même note'],
          answer: 0,
          explain: 'Mi puis fa : deux notes voisines, séparées par un seul demi-ton.',
        },
      ],
      legacy: ['1:4.4', '2:2.3', '2:2.4'],
    },

    {
      id: 'f.instrument',
      title: 'La même mélodie, un autre instrument',
      listen: 'Une petite mélodie au piano.',
      code: 'note("c4 e4 g4 e4").sound("piano")',
      name:
        '`.sound(…)` choisit **qui** joue les notes. Le piano est un son enregistré. Strudel a aussi des synthétiseurs, qui fabriquent le son : ' +
        '`sawtooth`, `square`, `triangle`, `sine`.',
      task: {
        text: 'Remplace `piano` par `sawtooth`, puis par `triangle`. Mêmes notes, autre couleur.',
        check: (c) => {
          const s = c.sounds();
          if (c.notes().length < 3) return 'Garde la mélodie dans `note(…)`.';
          return s.length && !s.includes('piano') ? true : 'C’est encore le piano. Écris `sawtooth` ou `triangle` dans `.sound("…")`.';
        },
        ok: 'Ce qui distingue deux instruments jouant la même note s’appelle le **timbre**.',
      },
      deep: {
        why:
          'Le point `.` enchaîne : on part de `note(…)` et on lui ajoute des réglages, l’un après l’autre. C’est le premier élément, ici `note(…)`, qui donne le rythme ; les réglages ajoutés ensuite ne font que colorer chaque note. ' +
          'Ce qui distingue un piano d’un synthé à hauteur égale, c’est le [timbre](sol.timbre) : le mélange de fréquences qui accompagnent la note (ses harmoniques) et la façon dont le son démarre et s’éteint. Le chapitre VI y est consacré.',
        decode: [
          ['.sound("piano")', 'le timbre : ici un piano enregistré.', 'son.piano'],
          ['sawtooth', 'un synthétiseur au son riche et brillant.', 'son.ondes'],
        ],
        wiki: ['fn.sound', 'son.ondes', 'son.piano'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Deux instruments jouent la même note, à la même hauteur. Ce qui les distingue s’appelle…',
          choices: ['Le timbre', 'Le tempo', 'L’octave'],
          answer: 0,
          explain: 'Le timbre est la « couleur » d’un son. La hauteur et le tempo peuvent être identiques, on reconnaît quand même un piano d’un synthé.',
        },
      ],
      legacy: [],
    },

    {
      id: 'f.melodie',
      schema: { type: 'clavier', mode: 'notes', notes: 'c4 e4 g4', missions: ['melodie'] },
      title: 'Le rythme marche aussi avec les notes',
      listen: 'Une mélodie avec des silences et un groupe rapide.',
      code: 'note("c4 e4 g4 [e4 c4] ~ g4 e4 ~").sound("piano")',
      name:
        'Tous les signes du chapitre II fonctionnent avec les notes : l’espace, `~`, `[ ]`, `*`, `< >`. La mini-notation décrit le rythme, peu importe ce qu’on y met.',
      task: {
        text: 'Écris ta mélodie : au moins 5 notes, au moins un silence `~` et un groupe `[ ]`.',
        check: (c) => {
          if (c.notes().length < 5) return 'Il faut au moins 5 notes.';
          if (!c.has('~') && !c.has(' - ')) return 'Ajoute au moins un silence `~`.';
          if (!c.has('[')) return 'Ajoute un groupe entre crochets, par exemple `[e4 c4]`.';
          return c.changed ? true : 'C’est encore l’exemple : change des notes.';
        },
        ok: 'Hauteur et rythme : tu écris de la musique.',
      },
      deep: {
        why:
          'Astuce pour une mélodie qui « tient » : commence et termine sur la même note, et bouge par petites marches plutôt que par grands sauts. Les petites marches sont faciles à suivre pour l’oreille ; un grand saut attire l’attention, à réserver aux moments importants. ' +
          'Au chapitre suivant, les [gammes](sol.gamme) te donneront un moyen de ne jamais tomber sur une fausse note.',
        decode: [
          ['[e4 c4]', 'deux notes rapides dans un seul pas.', 'mini.crochets'],
          ['~', 'un silence.', 'mini.silence'],
        ],
        wiki: ['mini.crochets', 'mini.silence', 'mini.chevrons'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Dans `note("c4 [e4 g4] c5")`, quelles notes sont jouées le plus vite ?',
          choices: ['e4 et g4', 'c4 et c5', 'Toutes à la même vitesse'],
          answer: 0,
          explain: 'Les crochets rangent `e4` et `g4` dans un seul pas : elles durent chacune la moitié des autres.',
        },
      ],
      legacy: [],
    },

    {
      id: 'f.basse',
      title: 'Une basse sous la batterie',
      listen: 'Une batterie, et une ligne de notes très graves.',
      code: `setcpm(110/4)

$: sound("bd*4, [~ cp]*2, hh*8").bank("RolandTR909").gain(.8)

$: note("c2 c2 eb2 c2 g1 g1 bb1 c2").sound("sawtooth").lpf(700)`,
      name:
        'Des notes à l’octave 1 et 2 forment une **basse** : la voix grave du morceau. Elle tient le rythme avec la batterie et annonce l’harmonie.',
      task: {
        text: 'Change au moins deux notes de la basse. Reste à l’octave 1 ou 2.',
        check: (c) => {
          const n = c.notes();
          if (n.length < 4) return 'Garde une ligne de basse d’au moins 4 notes.';
          if (n.some((x) => x > 47)) return 'Reste dans le grave : octave 1 ou 2 (par exemple `f1`, `ab1`, `d2`).';
          return c.changed ? true : 'C’est encore l’exemple : change deux notes.';
        },
        ok: 'Chapitre terminé. Tu sais nommer, écrire et placer des notes.',
      },
      deep: {
        why:
          '`.lpf(700)` est un [filtre passe-bas](fx.lpf) : il atténue les fréquences au-dessus de 700 Hz et donne au synthétiseur un son rond de basse (chapitre VI). ' +
          'Les octaves 1 et 2 couvrent environ 33 à 123 Hz : la zone de la basse et du kick. Sur un téléphone, ces fréquences passent mal ; au casque, elles donnent le poids du morceau. ' +
          'Les notes `eb` (mi bémol) et `bb` (si bémol) donnent à cette ligne sa couleur sombre : elle est en *do mineur*. Le chapitre IV explique ce mot.',
        decode: [
          ['c2, g1, bb1', 'des notes graves : octaves 1 et 2.', 'sol.octave'],
          ['.lpf(700)', 'un filtre qui retire les aigus.', 'fx.lpf'],
        ],
        wiki: ['sol.octave', 'fx.lpf', 'son.ondes'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute. Laquelle de ces lignes entends-tu ?',
          code: 'note("c2 c2 c3 c2").sound("sawtooth").lpf(800)',
          choices: ['Trois notes graves et une plus aiguë (la troisième)', 'Quatre fois la même note', 'Des notes qui montent une à une'],
          answer: 0,
          explain: 'C’est `c2 c2 c3 c2` : la troisième note saute une octave plus haut, puis on retombe.',
        },
      ],
      legacy: [],
    },
  ],
};
