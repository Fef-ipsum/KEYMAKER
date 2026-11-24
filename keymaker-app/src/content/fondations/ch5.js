// Fondations — Chapitre V : Intervalles et accords.
// On apprend une tierce en l'écrivant et en l'entendant, pas en lisant sa définition.

import { pc, uniq } from '../../lib/check.js';

const pcs = (chord) => uniq(chord.map(pc)).sort((a, b) => a - b);
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

export default {
  id: 'accords',
  title: 'Intervalles et accords',
  goal: 'Empiler des notes, reconnaître majeur et mineur à l’oreille, écrire une suite d’accords.',
  steps: [
    {
      id: 'f.intervalle',
      schema: { type: 'clavier', mode: 'intervalle', a: 'c3', b: 'g3', missions: ['tierce-majeure', 'tierce-mineure'] },
      title: 'Deux notes : un intervalle',
      listen: 'Deux notes l’une après l’autre, puis les mêmes en même temps.',
      code: 'note("c3 g3 [c3,g3] ~").sound("piano")',
      name:
        'La distance entre deux notes s’appelle un **intervalle**. Entre do et sol, c’est une **quinte**. Jouées ensemble (la virgule dans les crochets), les deux notes se fondent presque en une seule.',
      task: {
        text: 'Remplace les `g3` par `c4` : le do juste au-dessus. Écoute cet intervalle-là.',
        check: (c) => {
          const ch = c.chords().filter((x) => x.length === 2);
          return ch.some((x) => x[1] - x[0] === 12) ? true : 'Écris `note("c3 c4 [c3,c4] ~")` : do, puis le do du dessus, puis les deux ensemble.';
        },
        ok: 'C’est une **octave** : la même note, plus haut. L’intervalle le plus fondu de tous.',
      },
      deep: {
        why:
          'On mesure un [intervalle](sol.intervalle) en **demi-tons**. De do à sol : 7 demi-tons (la quinte). De do au do suivant : 12 (l’octave). Le nom vient du nombre de notes parcourues : do-ré-mi-fa-**sol**, cinq notes, d’où « quinte ». ' +
          'Pourquoi la quinte se fond si bien : la fréquence de sol est presque exactement 3/2 de celle de do. Avec un rapport aussi simple, beaucoup d’harmoniques des deux notes coïncident, et l’oreille entend une fusion. Plus le rapport est compliqué, plus les notes frottent.',
        decode: [
          ['c3 g3', 'les deux notes l’une après l’autre : intervalle *mélodique*.', 'sol.intervalle'],
          ['[c3,g3]', 'les deux notes ensemble : intervalle *harmonique*.', 'mini.virgule'],
        ],
        wiki: ['sol.intervalle', 'sol.quinte', 'sol.octave', 'mini.virgule'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ces deux notes jouées ensemble. Quel intervalle est-ce ?',
          code: 'note("[c3,c4] ~").sound("piano")',
          choices: ['Une octave (la même note, plus haut)', 'Une quinte', 'Un demi-ton'],
          answer: 0,
          explain: 'Les deux notes se confondent presque : c’est le même nom de note à deux hauteurs, une octave.',
        },
      ],
      legacy: ['2:2.6', '2:2.7', '2:2.9'],
    },

    {
      id: 'f.tierce',
      schema: { type: 'clavier', mode: 'intervalle', a: 'c3', b: 'e3', missions: ['tierce-mineure', 'quinte'] },
      title: 'La tierce : claire ou sombre',
      listen: 'Deux paires de notes. Le bas ne bouge pas ; seul le haut change un tout petit peu.',
      code: 'note("[c3,e3] ~ [c3,eb3] ~").sound("piano")',
      name:
        'Ces deux intervalles sont des **tierces**. La première est une tierce **majeure** (do–mi, 4 demi-tons) : claire. ' +
        'La seconde une tierce **mineure** (do–mi bémol, 3 demi-tons) : sombre. Un seul demi-ton d’écart, et l’humeur change.',
      task: {
        text: 'Écris une tierce mineure à partir de **ré** : `d3` avec, au-dessus, la note située 3 demi-tons plus haut.',
        check: (c) => {
          const ch = c.chords().filter((x) => x.length === 2);
          if (!ch.length) return 'Écris deux notes ensemble entre crochets, séparées par une virgule : `[d3,…]`.';
          const x = ch[0];
          if (pc(x[0]) !== 2) return 'La note du bas doit être ré : `d3`.';
          if (x[1] - x[0] === 4) return 'Tu as une tierce majeure (4 demi-tons). Descends la note du haut d’un demi-ton.';
          return x[1] - x[0] === 3 ? true : 'Compte 3 demi-tons au-dessus de ré : ré → ré# → mi → **fa**.';
        },
        ok: 'Ré–fa : une tierce mineure. Tu l’as construite en comptant les demi-tons.',
      },
      deep: {
        why:
          '« Tierce » parce qu’on parcourt trois notes : do-ré-**mi**. C’est exactement la marche 2 du chapitre IV : celle qui différencie la gamme majeure de la gamme mineure. ' +
          'Rapports de fréquences : environ 5/4 pour la tierce majeure, 6/5 pour la mineure. Les deux sont consonantes ; c’est leur différence d’un demi-ton qui donne à toute l’harmonie sa couleur claire ou sombre (voir [tierce](sol.tierce)).',
        decode: [
          ['[c3,e3]', 'do + mi : tierce majeure, 4 demi-tons.', 'sol.tierce'],
          ['[c3,eb3]', 'do + mi bémol : tierce mineure, 3 demi-tons.', 'sol.tierce'],
        ],
        wiki: ['sol.tierce', 'sol.demi-ton', 'sol.intervalle'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute cette tierce. Majeure ou mineure ?',
          code: 'note("[c4,eb4] ~").sound("piano")',
          choices: ['Mineure (sombre)', 'Majeure (claire)'],
          answer: 0,
          explain: 'Do et mi bémol : 3 demi-tons, tierce mineure.',
        },
        {
          type: 'ecoute',
          q: 'Et celle-ci ?',
          code: 'note("[c4,e4] ~").sound("piano")',
          choices: ['Majeure (claire)', 'Mineure (sombre)'],
          answer: 0,
          explain: 'Do et mi : 4 demi-tons, tierce majeure.',
        },
        {
          type: 'qcm',
          q: 'Combien de demi-tons dans une tierce mineure ?',
          choices: ['3', '4', '7'],
          answer: 0,
          explain: 'Tierce mineure : 3 demi-tons. Tierce majeure : 4. Quinte : 7.',
        },
      ],
      legacy: ['2:2.8'],
    },

    {
      id: 'f.accord',
      schema: { type: 'clavier', mode: 'accord', accord: 'C', missions: ['mineur', 'septieme', 'arpege'] },
      title: 'Trois notes : un accord',
      listen: 'Trois notes en même temps.',
      code: 'note("[c3,e3,g3]").sound("piano")',
      name:
        'Trois notes jouées ensemble forment un **accord**. Celui-ci est **do majeur** : la note de départ (do), sa tierce (mi) et sa quinte (sol). ' +
        'Un accord, ce sont deux tierces empilées.',
      task: {
        text: 'Transforme-le en **do mineur** : il suffit de changer une seule note.',
        check: (c) => {
          const ch = c.chords().find((x) => x.length >= 3);
          if (!ch) return 'Garde trois notes entre crochets, séparées par des virgules.';
          if (same(pcs(ch), [0, 3, 7])) return true;
          if (same(pcs(ch), [0, 4, 7])) return 'C’est encore do majeur. Descends la note du milieu d’un demi-ton : `e3` devient `eb3`.';
          return 'Garde do et sol, et ne change que la note du milieu.';
        },
        ok: 'Do, mi bémol, sol. La tierce décide : majeure, l’accord est majeur ; mineure, il est mineur.',
      },
      deep: {
        why:
          'Dans un [accord](sol.accord) de trois notes, la note de départ s’appelle la **fondamentale** ; elle donne son nom à l’accord. La quinte ne change pas entre majeur et mineur : seule la tierce bouge. ' +
          'Majeur = 4 demi-tons puis 3. Mineur = 3 demi-tons puis 4. Il existe aussi le diminué (3 + 3, très instable) et l’augmenté (4 + 4, flottant).',
        decode: [
          ['c3', 'la fondamentale : do.', 'sol.accord'],
          ['e3', 'la tierce : elle décide majeur ou mineur.', 'sol.tierce'],
          ['g3', 'la quinte.', 'sol.quinte'],
        ],
        wiki: ['sol.accord', 'sol.tierce', 'sol.quinte'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute cet accord. Majeur ou mineur ?',
          code: 'note("[a3,c4,e4] ~").sound("piano")',
          choices: ['Mineur', 'Majeur'],
          answer: 0,
          explain: 'La, do, mi : la tierce (la–do) fait 3 demi-tons. C’est la mineur.',
        },
        {
          type: 'qcm',
          q: 'Quelle note faut-il changer pour passer de do majeur (do-mi-sol) à do mineur ?',
          choices: ['Le mi, qui devient mi bémol', 'Le sol, qui devient sol dièse', 'Le do, qui devient ré'],
          answer: 0,
          explain: 'C’est la tierce qui fait la différence : mi (majeur) ou mi bémol (mineur).',
        },
      ],
      legacy: ['1:4.6', '2:2.16', '2:2.17'],
    },

    {
      id: 'f.accords-gamme',
      title: 'Les accords d’une gamme',
      listen: 'Quatre accords, un par cycle. Tous écrits avec la même forme : une marche sur deux.',
      code: 'n("<[0,2,4] [3,5,7] [4,6,8] [0,2,4]>").scale("C:major").sound("piano")',
      name:
        'Dans une gamme, on fabrique un accord en prenant **une marche sur deux**. La même forme, posée sur une autre marche, donne un autre accord. ' +
        'Cette suite d’accords s’appelle une **progression**.',
      task: {
        text: 'Remplace le troisième accord par `[5,7,9]`. Écoute : celui-là est mineur.',
        check: (c) => {
          const found = c.chords(c.haps4).some((x) => same(pcs(x), [0, 4, 9]));
          return found ? true : 'Écris `[5,7,9]` à la place de `[4,6,8]`, entre les chevrons.';
        },
        ok: 'La gamme majeure contient des accords majeurs *et* mineurs. Tu n’as rien eu à calculer.',
      },
      deep: {
        why:
          'On numérote les accords d’une gamme en chiffres romains selon leur marche de départ, comptée à partir de 1 : I (marche 0), IV (marche 3), V (marche 4), vi (marche 5, en minuscules car mineur). ' +
          'En do majeur, la forme « une marche sur deux » donne : I majeur, ii mineur, iii mineur, IV majeur, V majeur, vi mineur, vii° diminué. ' +
          'I–IV–V est la [progression](sol.progression) la plus jouée de la musique occidentale ; I–V–vi–IV celle d’innombrables tubes.',
        decode: [
          ['[0,2,4]', 'marches 0, 2 et 4 ensemble : l’accord I.', 'sol.accord'],
          ['[3,5,7]', 'la même forme sur la marche 3 : l’accord IV.', 'sol.progression'],
          ['< >', 'un accord par cycle.', 'mini.chevrons'],
        ],
        wiki: ['sol.progression', 'sol.accord', 'sol.degre', 'fn.scale'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Comment fabrique-t-on un accord dans une gamme avec `n()` ?',
          choices: ['On prend une marche sur deux, par exemple [0,2,4]', 'On prend trois marches voisines, par exemple [0,1,2]', 'On prend trois fois la même marche'],
          answer: 0,
          explain: 'Une marche sur deux empile deux tierces : c’est la définition d’un accord de trois notes.',
        },
      ],
      legacy: ['2:2.18', '2:2.19'],
    },

    {
      id: 'f.grille',
      title: 'Écrire les accords par leur nom',
      listen: 'Les mêmes idées, écrites comme sur une partition de chanson.',
      code: 'chord("<C Am F G>").voicing().sound("piano")',
      name:
        '`chord(…)` accepte les **noms d’accords** : `C` = do majeur, `Am` = la mineur (le `m` veut dire mineur), `F` = fa majeur, `G` = sol majeur. ' +
        '`.voicing()` choisit les notes à jouer pour que les accords s’enchaînent en douceur.',
      task: {
        text: 'Change l’ordre pour commencer en mineur : `<Am F C G>`.',
        check: (c) => {
          const first = c.chords(c.haps4.filter((e) => e.begin < 1))[0];
          if (!first) return 'Garde `chord("…").voicing()`.';
          return same(pcs(first), [0, 4, 9]) ? true : 'Le premier accord doit être la mineur : `chord("<Am F C G>")`.';
        },
        ok: 'Mêmes quatre accords, autre point de départ : l’ambiance n’est plus la même.',
      },
      deep: {
        why:
          'Une lettre seule désigne un accord majeur ; lettre + `m` un accord mineur. On croise aussi `C7`, `Am7` ou `C^7` : des accords à quatre notes, plus riches. ' +
          '**Attention aux noms** (vérifiés dans cette app) : l’accord « majeur 7 » s’écrit `C^7` ; `Cmaj7` ne joue rien. De même, `Csus4`, `Csus2` et `Cdim` ne jouent rien : écris `Csus` et `Co`. Voir [chord](fn.chord). ' +
          '`.voicing()` choisit des notes réelles : pour `C`, cinq notes (mi3, do4, mi4, sol4, do5), toutes sous `c5`, pour que les accords s’enchaînent sans sauts (voir [voicing](fn.voicing)). ' +
          'Ici les lettres sont en MAJUSCULES (ce sont des noms d’accords), alors que les notes de `note(…)` s’écrivent en minuscules.',
        decode: [
          ['chord("<C Am F G>")', 'une grille : un accord par cycle.', 'fn.chord'],
          ['.voicing()', 'transforme chaque nom d’accord en notes réelles.', 'fn.voicing'],
        ],
        wiki: ['fn.chord', 'fn.voicing', 'sol.accord', 'sol.progression'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que désigne `Am` dans `chord("Am")` ?',
          choices: ['L’accord de la mineur', 'L’accord de la majeur', 'La note la, jouée doucement'],
          answer: 0,
          explain: 'A = la ; le `m` minuscule veut dire mineur.',
        },
      ],
      legacy: ['2:2.20'],
    },

    {
      id: 'f.arpege',
      schema: { type: 'clavier', mode: 'accord', accord: 'C', missions: ['arpege'] },
      title: 'L’arpège : l’accord égrené',
      listen: 'Les mêmes accords, mais les notes arrivent une par une.',
      code: 'n("<[0,2,4] [3,5,7]>").scale("C4:major").arp("0 1 2 1").sound("piano").room(.4)',
      name:
        'Un **arpège** est un accord dont on joue les notes l’une après l’autre. `.arp("0 1 2 1")` donne l’ordre : la note du bas (0), celle du milieu (1), celle du haut (2), puis le milieu.',
      task: {
        text: 'Change l’ordre de l’arpège : essaie `.arp("0 2 1 2")`, ou `.arp("2 1 0 1")`.',
        check: (c) => {
          if (!c.has('.arp(')) return 'Garde `.arp("…")`.';
          const n = c.notes();
          if (n.length < 3) return 'Il faut au moins 3 notes dans l’arpège.';
          return c.changed && !same(n, [60, 64, 67, 64]) ? true : 'C’est encore l’ordre de départ. Change les nombres dans `.arp("…")`.';
        },
        ok: 'L’arpège est le cœur des mélodies de trance et de synth-pop. Tu le retrouveras dans les genres.',
      },
      deep: {
        why:
          'Les nombres de [arp](fn.arp) ne sont pas des marches de gamme : ce sont les positions dans l’accord, dans l’ordre où ses notes sont écrites, en partant de 0 (ici, du grave à l’aigu). ' +
          'On peut accélérer l’arpège avec l’étoile, à condition de mettre tout l’ordre entre crochets : `.arp("[0 1 2 1]*2")`, ou avec `.fast(2)` (chapitre VII). Sans crochets, `.arp("0 1 2 1*2")` ne double que le dernier pas. ' +
          'Avec `chord(…).voicing()`, un accord peut avoir plus de trois notes (cinq pour `C`) : les positions vont alors jusqu’à 4.',
        decode: [
          ['.arp("0 1 2 1")', 'joue les notes de l’accord dans cet ordre.', 'fn.arp'],
          ['C4:major', 'do majeur à partir de l’octave 4.', 'fn.scale'],
        ],
        wiki: ['fn.arp', 'sol.arpege', 'sol.accord'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute. Est-ce un accord plaqué ou un arpège ?',
          code: 'note("[c4,e4,g4]").arp("0 1 2 1").sound("piano")',
          choices: ['Un arpège : les notes arrivent une par une', 'Un accord plaqué : les notes arrivent ensemble'],
          answer: 0,
          explain: 'On entend do, mi, sol, mi l’une après l’autre : c’est l’accord de do majeur arpégé.',
        },
      ],
      legacy: [],
    },

    {
      id: 'f.harmonie',
      title: 'Accords, basse et batterie',
      listen: 'Une grille d’accords pilote deux pistes à la fois : le piano et la basse.',
      code: `setcpm(100/4)

const grille = chord("<Am F C G>")

$: grille.voicing().sound("piano").room(.4)

$: grille.rootNotes(2).struct("x*4").sound("sawtooth").lpf(500)

$: sound("bd*4, [~ cp]*2").bank("RolandTR909").gain(.8)`,
      name:
        '`const grille = …` donne un **nom** à la suite d’accords, pour la réutiliser. Le piano en joue les accords ; la basse en joue seulement la **fondamentale** (`.rootNotes(2)`), ' +
        'à l’octave 2.',
      task: {
        text: 'Change un ou deux accords de la grille (par exemple `Em` ou `Dm`). Écoute : piano et basse suivent ensemble.',
        check: (c) => {
          if (!c.has('rootNotes')) return 'Garde la piste de basse avec `.rootNotes(2)`.';
          if (c.notes4().length < 8) return 'Garde le piano et la basse.';
          return c.changed ? true : 'C’est encore l’exemple : change un nom d’accord dans la grille.';
        },
        ok: 'Chapitre terminé. Tu sais construire une harmonie : c’est le squelette d’un morceau.',
      },
      deep: {
        why:
          'Dans la gamme de do majeur, les accords les plus utiles sont : `C`, `Dm`, `Em`, `F`, `G`, `Am`. Tu peux les enchaîner dans n’importe quel ordre, ça fonctionnera : ils partagent tous les notes de la gamme. ' +
          '`const` ([donner un nom](js.const)) évite d’écrire deux fois la grille : si tu la changes, le piano et la basse suivent. ' +
          '[rootNotes](fn.rootNotes)`(2)` donne la fondamentale de chaque accord à l’octave 2 (65 à 123 Hz). `.struct("x*4")` ([struct](fn.struct)) impose quatre coups par cycle à la basse, qui sinon tiendrait une seule longue note.',
        decode: [
          ['const grille = …', 'range la grille sous un nom, pour s’en servir deux fois.', 'js.const'],
          ['.rootNotes(2)', 'ne garde que la fondamentale de chaque accord, à l’octave 2.', 'fn.rootNotes'],
          ['.struct("x*4")', 'impose un rythme : un `x` = un coup.', 'fn.struct'],
        ],
        wiki: ['fn.rootNotes', 'fn.struct', 'fn.chord', 'js.const'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que joue la basse avec `chord("<Am F C G>").rootNotes(2)` ?',
          choices: ['La fondamentale de chaque accord : la, fa, do, sol', 'Les trois notes de chaque accord', 'Toujours la même note'],
          answer: 0,
          explain: '`rootNotes` extrait la note qui donne son nom à l’accord, à l’octave demandée.',
        },
      ],
      legacy: [],
    },
  ],
};
