// Fondations — Chapitre II : Le rythme.
// Toute la mini-notation rythmique, un signe par étape.

import { near } from '../../lib/check.js';

export default {
  id: 'rythme',
  title: 'Le rythme',
  goal: 'Lire et écrire la mini-notation : le petit langage du rythme, entre les guillemets.',
  steps: [
    {
      id: 'f.cycle',
      schema: { type: 'cycle', motif: 'bd hh sd hh', missions: ['ajoute'] },
      title: 'Le cycle',
      listen: 'Quatre sons dans un cycle. Écoute la vitesse.',
      code: 'sound("bd hh sd hh")',
      name:
        'Le **cycle** est la boucle qui se répète. Sa durée ne change pas : si tu y mets plus de sons, chacun devient plus court, et tout va plus vite.',
      task: {
        text: 'Allonge la séquence à 8 sons, par exemple `bd hh sd hh bd bd sd hh`. Écoute : c’est deux fois plus rapide.',
        check: (c) => (c.count() === 8 ? true : `Il y a ${c.count()} sons dans le cycle. Il en faut 8, séparés par des espaces.`),
        ok: 'Même durée de cycle, deux fois plus de sons : chacun dure deux fois moins longtemps.',
      },
      deep: {
        why:
          'En solfège, le cycle correspond à une **mesure**. Avec 4 pas, chaque pas est un **temps** (une *noire*). ' +
          'Avec 8 pas, chaque pas est un demi-temps (une *croche*). Avec 16, un quart de temps (une *double-croche*).',
        decode: [
          ['"bd hh sd hh"', '4 pas = 4 temps.', 'sol.temps'],
          ['8 pas', 'chaque pas vaut une croche.', 'sol.croche'],
        ],
        wiki: ['sol.cycle', 'sol.mesure', 'sol.temps', 'sol.croche'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Tu passes de 4 sons à 8 sons dans la même séquence. Que se passe-t-il ?',
          choices: ['Chaque son dure deux fois moins longtemps', 'Le cycle dure deux fois plus longtemps', 'Seuls les 4 premiers sons sont joués'],
          answer: 0,
          explain: 'La durée du cycle est fixe. Plus il contient de pas, plus chaque pas est court.',
        },
      ],
      legacy: ['1:2.2', '1:3.1'],
    },

    {
      id: 'f.silence',
      schema: { type: 'cycle', motif: 'bd hh sd hh bd hh sd hh', missions: ['silence'] },
      title: 'Le silence : ~',
      listen: 'Huit pas, tous remplis. Écoute, c’est chargé.',
      code: 'sound("bd hh sd hh bd hh sd hh")',
      name: 'Le signe `~` est un **silence** : le pas garde sa place dans le cycle, mais rien ne joue. Le vide fait partie du rythme.',
      task: {
        text: 'Remplace deux `hh` par `~` et relance. Le rythme respire.',
        check: (c) => {
          if (c.count() >= 8) return 'Tous les pas jouent encore. Remplace deux `hh` par `~`.';
          if (c.count() < 4) return 'Tu as enlevé beaucoup de sons : garde-en au moins quatre.';
          if (c.count() > 6) return 'Un seul silence pour l’instant : remplace un deuxième `hh` par `~`.';
          return true;
        },
        ok: 'Un bon rythme, ce sont aussi des trous bien placés.',
      },
      deep: {
        why:
          'En solfège, un silence a une durée, exactement comme une note. On peut aussi écrire le silence avec un tiret `-` : ' +
          '`sound("bd - sd -")` est identique à `sound("bd ~ sd ~")`.',
        decode: [
          ['~', 'un pas silencieux.', 'mini.silence'],
          ['-', 'autre écriture du même silence.', 'mini.silence'],
        ],
        wiki: ['mini.silence'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Combien de sons joue `sound("bd ~ ~ sd")` à chaque cycle ?',
          choices: ['2', '4', '3'],
          answer: 0,
          explain: 'Il y a 4 pas, mais deux sont des silences (`~`). Seuls `bd` et `sd` jouent.',
        },
      ],
      legacy: ['1:2.3'],
    },

    {
      id: 'f.etoile',
      schema: { type: 'cycle', motif: 'bd*4', missions: ['plus8'] },
      title: 'Répéter : *',
      listen: 'Une seule grosse caisse est écrite. Écoute combien tu en entends.',
      code: 'sound("bd*4")',
      name: 'L’étoile `*` **répète** un son à l’intérieur de son pas : `bd*4` joue quatre grosses caisses, au lieu d’écrire `bd bd bd bd`.',
      task: {
        text: 'Remplace par `hh*8` : huit charlestons. Puis essaie `hh*16`.',
        check: (c) => {
          const n = c.count('hh');
          if (!n) return 'Écris `hh` suivi de `*8` entre les guillemets.';
          return n >= 8 ? true : `Tu as ${n} charleston(s) par cycle. Vise 8 ou 16 avec \`hh*8\`.`;
        },
        ok: 'Huit par cycle : des croches. Seize : des doubles-croches.',
      },
      deep: {
        why:
          'L’étoile s’applique à ce qui est juste à sa gauche. `"bd*2 sd"` : deux grosses caisses dans la première moitié, puis une caisse claire. ' +
          'Son inverse est la barre oblique `/` : `"[bd sd]/2"` étale la séquence sur deux cycles.',
        decode: [
          ['*4', 'répète 4 fois dans le même pas (donc 4 fois plus vite).', 'mini.etoile'],
          ['/2', 'ralentit : étale sur 2 cycles.', 'mini.slash'],
        ],
        wiki: ['mini.etoile', 'mini.slash'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute le charleston. Qu’est-ce qui est écrit ?',
          code: 'sound("bd*2, hh*8")',
          choices: ['hh*8', 'hh*4', 'hh*2'],
          answer: 0,
          explain: 'Il y a quatre charlestons pour chaque grosse caisse, et deux grosses caisses par cycle : 8 en tout.',
        },
      ],
      legacy: ['1:2.5'],
    },

    {
      id: 'f.crochets',
      schema: { type: 'cycle', motif: 'bd hh sd hh', missions: ['crochets'] },
      title: 'Regrouper : [ ]',
      listen: 'Quatre pas réguliers. Écoute bien le dernier.',
      code: 'sound("bd hh sd hh")',
      name:
        'Les crochets `[ ]` rangent plusieurs sons **dans un seul pas**. Ils se partagent sa durée, donc ils vont plus vite que leurs voisins.',
      task: {
        text: 'Remplace le dernier `hh` par `[hh hh]` : deux charlestons dans le temps d’un seul.',
        check: (c) => {
          if (!c.has('[')) return 'Écris des crochets autour de deux sons : `[hh hh]`.';
          const on = c.onsets('hh');
          return on.some((t) => near(t, 0.875)) ? true : 'Mets `[hh hh]` à la place du quatrième pas : `bd hh sd [hh hh]`.';
        },
        ok: 'Tu viens d’écrire deux croches à la place d’une noire.',
      },
      deep: {
        why:
          'On peut mettre autant de sons qu’on veut dans des crochets : `[hh hh hh]` donne trois sons dans un temps (un *triolet*). ' +
          'On peut aussi imbriquer : `[bd [hh hh]]`. Et combiner avec l’étoile : `[~ cp]*2` répète deux fois « silence puis clap ».',
        decode: [
          ['[hh hh]', 'deux sons qui se partagent un pas.', 'mini.crochets'],
          ['[~ cp]*2', 'le groupe entier, joué deux fois.', 'mini.etoile'],
        ],
        wiki: ['mini.crochets', 'sol.croche'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Dans `sound("bd [sd sd] hh")`, combien de pas le cycle contient-il ?',
          choices: ['3 : les crochets comptent pour un seul pas', '4 : chaque son compte', '2'],
          answer: 0,
          explain: 'Le groupe `[sd sd]` occupe un seul pas : les deux caisses claires se partagent ce tiers de cycle.',
        },
      ],
      legacy: ['1:2.4'],
    },

    {
      id: 'f.chevrons',
      schema: { type: 'cycle', motif: 'bd hh sd <hh oh>', cycles: 4, missions: ['alterne'] },
      title: 'Alterner : < >',
      listen: 'Écoute au moins deux tours de boucle. Le dernier son change.',
      code: 'sound("bd hh sd <hh oh>")',
      name:
        'Les chevrons `< >` font **alterner** : à chaque nouveau cycle, on prend l’élément suivant. Ici `hh` au premier cycle, `oh` au deuxième, et ainsi de suite.',
      task: {
        text: 'Fais aussi alterner le premier son : remplace `bd` par `<bd cp>`.',
        check: (c) => {
          const firsts = new Set(c.haps4.filter((e) => near(e.begin % 1, 0)).map((e) => e.s));
          return firsts.size >= 2 ? true : 'Le premier son est toujours le même. Écris `<bd cp>` à la place de `bd`.';
        },
        ok: 'Une seule ligne, et déjà une boucle de deux mesures.',
      },
      deep: {
        why:
          'C’est le moyen le plus simple d’éviter qu’une boucle lasse : la même phrase, avec une fin différente une fois sur deux. ' +
          'Avec trois éléments, `<a b c>`, le motif met trois cycles à revenir. `<a b>*2` alterne deux fois plus vite (les deux dans le même cycle).',
        decode: [
          ['<hh oh>', 'un élément par cycle, à tour de rôle.', 'mini.chevrons'],
          ['oh', 'charleston ouvert (*open hat*).', 'son.batterie'],
        ],
        wiki: ['mini.chevrons'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que joue `sound("<bd sd hh>")` au 3ᵉ cycle ?',
          choices: ['hh', 'bd', 'bd, sd et hh à la suite'],
          answer: 0,
          explain: 'Les chevrons donnent un élément par cycle : `bd` au 1ᵉʳ, `sd` au 2ᵉ, `hh` au 3ᵉ, puis on recommence.',
        },
      ],
      legacy: ['1:2.6'],
    },

    {
      id: 'f.virgule',
      schema: { type: 'cycle', motif: 'bd*4, hh*8', missions: ['ajoute'] },
      title: 'Superposer : ,',
      listen: 'Une seule ligne, mais deux rythmes à la fois.',
      code: 'sound("bd*4, hh*8")',
      name: 'La virgule joue plusieurs séquences **en même temps**, dans la même ligne. Chacune remplit le cycle à sa façon.',
      task: {
        text: 'Ajoute une troisième séquence après une virgule : `, ~ cp ~ cp`.',
        check: (c) => {
          if (!c.sounds().includes('cp')) return 'Ajoute `, ~ cp ~ cp` avant le guillemet fermant.';
          return c.sounds().length >= 3 ? true : 'Garde aussi `bd*4` et `hh*8`.';
        },
        ok: 'Trois rythmes dans une seule paire de guillemets.',
      },
      deep: {
        why:
          'C’est la version courte de plusieurs pistes `$:`. On s’en sert pour un petit groupe de sons qui partagent les mêmes réglages. ' +
          'Dans des crochets, la virgule empile aussi : `[bd,hh]` joue les deux sons exactement ensemble sur un pas. On la retrouvera pour les accords.',
        decode: [
          [',', 'sépare des séquences jouées ensemble.', 'mini.virgule'],
          ['[bd,hh]', 'deux sons superposés sur un seul pas.', 'mini.virgule'],
        ],
        wiki: ['mini.virgule', 'fn.dollar', 'fn.stack'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Quelle différence entre `"bd hh"` et `"bd, hh"` ?',
          choices: ['Avec l’espace : l’un après l’autre. Avec la virgule : en même temps.', 'Aucune', 'La virgule ajoute un silence entre les deux'],
          answer: 0,
          explain: 'L’espace enchaîne, la virgule superpose.',
        },
      ],
      legacy: ['1:2.7'],
    },

    {
      id: 'f.durees',
      schema: { type: 'cycle', motif: 'bd@3 sd', missions: [] },
      title: 'Allonger et recopier : @ et !',
      listen: 'Deux sons, mais pas la même place : écoute quand arrive la caisse claire.',
      code: 'sound("bd@3 sd")',
      name:
        '`@` **allonge** un pas : `bd@3` prend la place de trois pas. La caisse claire n’arrive donc qu’au dernier quart du cycle.',
      task: {
        text: 'Retarde encore la caisse claire : écris `bd@7 sd`. Elle tombe au tout dernier huitième.',
        check: (c) => {
          const on = c.onsets('sd');
          return on.length && near(on[on.length - 1], 0.875) ? true : 'La caisse claire doit arriver au dernier huitième : `bd@7 sd`.';
        },
        ok: 'Avec `@`, tu choisis exactement où tombe chaque son.',
      },
      deep: {
        why:
          'Le point d’exclamation `!` fait l’inverse de ce qu’on croit : il **recopie** le pas sans l’accélérer. `"hh!3 sd"` vaut `"hh hh hh sd"` (4 pas), ' +
          'alors que `"hh*3 sd"` met trois charlestons dans un seul pas (2 pas). Enfin le souligné `_` prolonge le pas précédent : `"bd _ _ sd"` vaut `"bd@3 sd"`.',
        decode: [
          ['bd@3', 'ce pas pèse 3 : il dure trois fois plus que les autres.', 'mini.arobase'],
          ['hh!3', 'recopie le pas 3 fois, à vitesse normale.', 'mini.exclamation'],
          ['_', 'prolonge le pas qui précède.', 'mini.souligne'],
        ],
        wiki: ['mini.arobase', 'mini.exclamation', 'mini.souligne'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Laquelle de ces écritures vaut `"hh hh hh sd"` ?',
          choices: ['"hh!3 sd"', '"hh*3 sd"', '"hh@3 sd"'],
          answer: 0,
          explain: '`!` recopie le pas. `*3` mettrait trois sons dans un seul pas ; `@3` jouerait un seul son, trois fois plus long.',
        },
      ],
      legacy: ['1:4.5'],
    },

    {
      id: 'f.euclide',
      schema: { type: 'cycle', motif: 'bd(3,8)', missions: [] },
      title: 'Répartir : (3,8)',
      listen: 'Trois coups, mais pas réguliers. Écoute ce balancement.',
      code: 'sound("bd(3,8)")',
      name:
        '`(3,8)` répartit **3 coups sur 8 pas**, le plus régulièrement possible. On appelle ça un **rythme euclidien**. Celui-ci est partout, de la musique cubaine à la techno.',
      task: {
        text: 'Change pour `bd(5,8)` : cinq coups sur huit pas.',
        check: (c) => (c.count('bd') === 5 ? true : `Il y a ${c.count('bd')} grosse(s) caisse(s). Écris \`bd(5,8)\`.`),
        ok: 'Deux nombres, et un rythme entier apparaît.',
      },
      deep: {
        why:
          'Le premier nombre est le nombre de coups, le deuxième le nombre de pas. Un troisième nombre, facultatif, décale le point de départ : `bd(3,8,2)`. ' +
          'Superposer deux répartitions différentes donne vite quelque chose de riche : `"bd(3,8), hh(5,8)"`.',
        decode: [
          ['(3,8)', '3 coups répartis sur 8 pas.', 'mini.euclide'],
          ['(3,8,2)', 'le même, décalé de 2 pas.', 'mini.euclide'],
        ],
        wiki: ['mini.euclide', 'fn.euclid'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute la grosse caisse. Combien de coups par cycle ?',
          code: 'sound("bd(3,8), hh*8").gain(.9)',
          choices: ['3', '4', '8'],
          answer: 0,
          explain: 'C’est `bd(3,8)` : trois coups, espacés de façon irrégulière (long, long, court).',
        },
      ],
      legacy: ['5:5.9b'],
    },

    {
      id: 'f.hasard',
      schema: { type: 'cycle', motif: 'hh*8?', cycles: 4, missions: [] },
      title: 'Peut-être : ?',
      listen: 'Huit charlestons sont écrits. Écoute : ils ne jouent pas tous.',
      code: 'sound("hh*8?")',
      name: 'Le point d’interrogation `?` donne à chaque son **une chance sur deux** de jouer. Le rythme n’est jamais tout à fait le même.',
      task: {
        text: 'Ajoute une grosse caisse fixe pour tenir le tempo : `sound("bd*4, hh*8?")`.',
        check: (c) => {
          if (!c.has('?')) return 'Garde le `?` sur les charlestons.';
          return c.count('bd') === 4 ? true : 'Ajoute `bd*4,` au début, entre les guillemets.';
        },
        ok: 'Un cadre fixe, et du hasard par-dessus : la recette d’un rythme vivant.',
      },
      deep: {
        why:
          'On peut doser : `hh*8?0.2` retire environ 20 % des sons, `?0.8` en retire 80 %. Ce hasard est *reproductible* : ' +
          'Strudel rejoue les mêmes tirages si tu relances depuis le début.',
        decode: [
          ['?', 'chaque son a 50 % de chances d’être retiré.', 'mini.interrogation'],
          ['?0.2', '20 % de chances d’être retiré.', 'mini.interrogation'],
        ],
        wiki: ['mini.interrogation', 'fn.degradeBy'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que fait `?` dans `sound("hh*8?")` ?',
          choices: ['Chaque charleston a une chance sur deux de ne pas jouer', 'Le charleston joue une fois sur deux cycles', 'Strudel choisit un son au hasard'],
          answer: 0,
          explain: 'Le `?` retire des sons au hasard, un par un. Pour alterner d’un cycle à l’autre, ce sont les chevrons `< >`.',
        },
      ],
      legacy: [],
    },

    {
      id: 'f.groove',
      schema: { type: 'tempo', reglages: { bpm: 120 }, temps: 4, missions: ['lent', 'rapide'] },
      title: 'Ton rythme, avec tous les signes',
      listen: 'Un rythme complet, écrit avec ce que tu viens d’apprendre. Lis-le en l’écoutant.',
      code: `setcpm(120/4)

$: sound("bd*4, [~ cp]*2").bank("RolandTR909")

$: sound("hh*8").bank("RolandTR909").gain(.5)`,
      name: 'Tu sais lire chaque signe de ce code : `*` répète, `[ ]` regroupe, `~` se tait, la virgule superpose.',
      task: {
        text: 'Fais-le vivre : ajoute au moins un `< >` (alternance) et un `?` ou un `( , )` quelque part.',
        check: (c) => {
          if (!c.has('<')) return 'Ajoute une alternance avec `< >`, par exemple `<hh*8 hh*16>`.';
          if (!c.has('?') && !c.has(/\(\s*\d+\s*,\s*\d+/)) return 'Ajoute un `?` (hasard) ou une répartition `(3,8)`.';
          return c.count() >= 4 ? true : 'Il ne joue presque plus rien : garde au moins le kick.';
        },
        ok: 'Chapitre terminé : tu sais écrire du rythme. Place aux notes.',
      },
      deep: {
        why:
          'Quelques idées : `<hh*8 hh*16>` pour un charleston qui s’emballe une mesure sur deux ; `oh(3,8)` pour un charleston ouvert qui balance ; ' +
          '`[~ cp]*2` remplacé par `~ cp ~ <cp [cp cp]>` pour une fin de phrase.',
        decode: [],
        wiki: ['mini.chevrons', 'mini.euclide', 'mini.interrogation', 'mini.crochets'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Quel signe utilises-tu pour que le dernier son change à chaque cycle ?',
          choices: ['Les chevrons < >', 'Les crochets [ ]', 'L’étoile *'],
          answer: 0,
          explain: '`< >` prend un élément différent à chaque cycle. `[ ]` regroupe dans un pas, `*` répète.',
        },
      ],
      legacy: [],
    },
  ],
};
