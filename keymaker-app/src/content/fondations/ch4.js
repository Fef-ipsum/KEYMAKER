// Fondations — Chapitre IV : Les gammes.
// Rester « dans la gamme » : n() + scale(), majeur/mineur, la tonique.

import { pc, uniq } from '../../lib/check.js';

const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

export default {
  id: 'gammes',
  title: 'Les gammes',
  goal: 'Choisir une gamme et y écrire des mélodies sans fausse note.',
  steps: [
    {
      id: 'f.gamme',
      title: 'Un escalier de notes',
      listen: 'Encore do ré mi… mais regarde : il n’y a plus de lettres, seulement des nombres.',
      code: 'n("0 1 2 3 4 5 6 7").scale("C:major").sound("piano")',
      name:
        'Une **gamme** est une sélection de notes qui vont bien ensemble, rangées comme les marches d’un escalier. ' +
        '`scale("C:major")` choisit l’escalier (la gamme de do majeur) ; `n(…)` dit sur quelle marche se poser. **La première marche porte le numéro 0.**',
      task: {
        text: 'Joue seulement les marches 0, 2, 4 puis 7.',
        check: (c) => (eq(c.notes(), [48, 52, 55, 60]) ? true : 'Écris `n("0 2 4 7")` et garde `.scale("C:major")`.'),
        ok: 'Do, mi, sol, do : les mêmes notes qu’au chapitre III, écrites avec des numéros de marche.',
      },
      deep: {
        why:
          'L’intérêt : tant que tu écris des nombres, tu restes dans la gamme. Aucune fausse note possible. ' +
          'La marche 7 est le do suivant (une octave plus haut), 8 le ré suivant… Les nombres négatifs descendent : `-1` est le si juste en dessous du premier do.',
        decode: [
          ['n("0 1 2 …")', 'des numéros de marche dans la gamme (on commence à 0).', 'fn.n'],
          ['.scale("C:major")', 'la gamme : tonique `C` (do), type `major` (majeur).', 'fn.scale'],
        ],
        wiki: ['fn.n', 'fn.scale', 'sol.gamme', 'sol.degre'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Avec `.scale("C:major")`, quelle note joue `n("2")` ?',
          choices: ['Mi (E) : la troisième marche', 'Ré (D) : la deuxième marche', 'Do dièse (C#)'],
          answer: 0,
          explain: 'On compte à partir de 0 : 0 = do, 1 = ré, 2 = mi.',
        },
      ],
      legacy: ['1:4.7', '2:2.11', '2:2.12'],
    },

    {
      id: 'f.majeur-mineur',
      title: 'Majeur ou mineur',
      listen: 'Une mélodie en do majeur. Retiens sa couleur.',
      code: 'n("0 2 4 2 0 4 7 ~").scale("C:major").sound("piano")',
      name:
        'Les deux gammes les plus courantes sont la gamme **majeure** (claire, ouverte) et la gamme **mineure** (sombre, mélancolique). ' +
        'Mêmes numéros de marche, mais certaines marches ne sont pas à la même hauteur.',
      task: {
        text: 'Remplace `major` par `minor` et relance. Ne touche pas aux nombres.',
        check: (c) => {
          const set = uniq(c.notes().map(pc));
          if (set.includes(3) && !set.includes(4)) return true;
          return 'La mélodie est encore majeure. Écris `.scale("C:minor")`.';
        },
        ok: 'Un seul mot changé, et toute l’humeur bascule.',
      },
      deep: {
        why:
          'Ce qui a changé : la marche 2. En majeur c’est mi (`e`) ; en mineur c’est mi bémol (`eb`), un demi-ton plus bas. ' +
          'Les marches 5 et 6 baissent aussi d’un demi-ton en mineur (la → la bémol, si → si bémol). Presque toute la techno et la trance sont en mineur.',
        decode: [
          ['C:major', 'do majeur : do ré mi fa sol la si.', 'sol.majeur'],
          ['C:minor', 'do mineur : do ré mi♭ fa sol la♭ si♭.', 'sol.mineur'],
        ],
        wiki: ['sol.majeur', 'sol.mineur', 'fn.scale'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute cette montée. La gamme est-elle majeure ou mineure ?',
          code: 'n("0 1 2 3 4 3 2 1").scale("C4:minor").sound("piano")',
          choices: ['Mineure', 'Majeure'],
          answer: 0,
          explain: 'La troisième note est basse (mi bémol) : couleur sombre, gamme mineure.',
        },
        {
          type: 'ecoute',
          q: 'Et celle-ci ?',
          code: 'n("0 1 2 3 4 3 2 1").scale("C4:major").sound("piano")',
          choices: ['Majeure', 'Mineure'],
          answer: 0,
          explain: 'La troisième note est haute (mi) : couleur claire, gamme majeure.',
        },
      ],
      legacy: ['2:2.13'],
    },

    {
      id: 'f.tonique',
      title: 'La tonique : la note-maison',
      listen: 'La mélodie part de la marche 0 et y revient. Écoute comme la fin sonne « posée ».',
      code: 'n("0 2 4 7 4 2 0 ~").scale("C:minor").sound("piano")',
      name:
        'La marche 0 s’appelle la **tonique** : la note-maison de la gamme. C’est la lettre écrite avant les deux-points. Changer cette lettre déplace toute la mélodie, sans changer sa forme.',
      task: {
        text: 'Déplace la mélodie en **ré mineur** : remplace `C:minor` par `D:minor`.',
        check: (c) => {
          const n = c.notes();
          if (!n.length) return 'Garde la mélodie dans `n(…)`.';
          return pc(n[0]) === 2 && uniq(n.map(pc)).includes(5) ? true : 'La tonique doit être ré : écris `.scale("D:minor")`.';
        },
        ok: 'Même mélodie, plus haute d’un ton. On appelle ça *transposer*.',
      },
      deep: {
        why:
          'Dire qu’un morceau est « en ré mineur », c’est donner sa **tonalité** : sa tonique (ré) et son type de gamme (mineur). ' +
          'On peut aussi préciser l’octave de départ : `D2:minor` pour une basse, `D4:minor` pour une mélodie aiguë. Sans chiffre, c’est l’octave 3.',
        decode: [
          ['D:minor', 'tonique ré, gamme mineure.', 'sol.tonique'],
          ['D2:minor', 'la même gamme, en partant du ré grave (octave 2).', 'fn.scale'],
        ],
        wiki: ['sol.tonique', 'sol.tonalite', 'fn.scale', 'fn.transpose'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Dans `.scale("A:minor")`, quelle est la tonique ?',
          choices: ['La (A)', 'Do (C)', 'Mi (E)'],
          answer: 0,
          explain: 'La tonique est la lettre avant les deux-points. A = la : c’est la gamme de la mineur.',
        },
      ],
      legacy: ['2:2.21', '2:2.24'],
    },

    {
      id: 'f.pentatonique',
      title: 'Cinq notes qui sonnent toujours bien',
      listen: 'Une gamme à cinq notes seulement. Écoute : rien n’accroche.',
      code: 'n("0 1 2 3 4 3 2 1").scale("A:minor:pentatonic").sound("piano")',
      name:
        'La gamme **pentatonique** n’a que cinq notes (*penta* = cinq). On a retiré les deux notes qui frottent le plus : n’importe quel enchaînement sonne bien.',
      task: {
        text: 'Improvise : écris au moins 6 marches de ton choix, en allant au-delà de 4 (essaie 5, 6, 7).',
        check: (c) => {
          const n = c.notes();
          if (n.length < 6) return 'Écris au moins 6 nombres dans `n(…)`.';
          if (!c.has('pentatonic')) return 'Garde la gamme pentatonique.';
          return Math.max(...n) > 67 ? true : 'Monte plus haut : utilise des marches au-dessus de 4.';
        },
        ok: 'Avec cinq notes, tu peux improviser sans jamais te tromper.',
      },
      deep: {
        why:
          'La pentatonique mineure est la gamme du blues, du rock et de beaucoup de mélodies électroniques. ' +
          'Comme elle n’a que 5 marches, la marche 5 est déjà la tonique une octave plus haut.',
        decode: [
          ['A:minor:pentatonic', 'tonique la, gamme mineure pentatonique.', 'sol.pentatonique'],
        ],
        wiki: ['sol.pentatonique', 'fn.scale'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Combien de notes différentes contient une gamme pentatonique ?',
          choices: ['5', '7', '12'],
          answer: 0,
          explain: '*Penta* veut dire cinq. La gamme majeure ou mineure en a sept ; il existe douze notes en tout.',
        },
      ],
      legacy: ['2:2.15'],
    },

    {
      id: 'f.melodie-gamme',
      title: 'Mélodie et basse dans la même gamme',
      listen: 'Deux pistes, la même gamme : ré mineur. L’une en haut, l’autre en bas.',
      code: `setcpm(90/4)

$: n("0 2 4 [6 4] 2 ~ 0 ~").scale("D4:minor").sound("piano").room(.4)

$: n("<0 -2 -4 -3>").scale("D2:minor").sound("sawtooth").lpf(500)`,
      name:
        'Quand toutes les pistes puisent dans la même gamme, tout s’accorde. La basse change de marche à chaque cycle (`< >`), la mélodie se répète par-dessus.',
      task: {
        text: 'Réécris la mélodie du haut avec tes propres numéros de marche. Garde les deux pistes.',
        check: (c) => {
          const n = c.notes();
          if (n.filter((x) => x >= 60).length < 4) return 'Garde une mélodie d’au moins 4 notes sur la piste du haut.';
          if (!n.some((x) => x < 48)) return 'Garde aussi la piste de basse.';
          return c.changed ? true : 'C’est encore l’exemple : change des nombres dans la première piste.';
        },
        ok: 'Chapitre terminé. Tu composes dans une tonalité.',
      },
      deep: {
        why:
          'La mélodie ne change pas, mais elle ne sonne pas pareil selon la note de basse en dessous : c’est le début de l’**harmonie**. ' +
          'Le chapitre suivant explique pourquoi, avec les intervalles et les accords.',
        decode: [
          ['scale("D4:minor")', 'ré mineur, à partir de l’octave 4 : la mélodie.', 'fn.scale'],
          ['scale("D2:minor")', 'ré mineur, à partir de l’octave 2 : la basse.', 'fn.scale'],
          ['<0 -2 -4 -3>', 'une marche par cycle.', 'mini.chevrons'],
        ],
        wiki: ['fn.scale', 'fn.n', 'mini.chevrons', 'sol.tonalite'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Pourquoi une mélodie et une basse écrites avec `n()` dans la même `scale()` sonnent-elles bien ensemble ?',
          choices: ['Elles n’utilisent que les notes de la même gamme', 'Elles jouent exactement les mêmes notes', 'Strudel corrige les fausses notes après coup'],
          answer: 0,
          explain: 'La gamme est un réservoir commun de notes compatibles. Chaque piste y choisit ses marches.',
        },
      ],
      legacy: ['2:2.25'],
    },
  ],
};
