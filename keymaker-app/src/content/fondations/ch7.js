// Fondations — Chapitre VII : Le mouvement.
// Faire évoluer un motif tout seul : signaux, vitesse, alternance, hasard, décalage.

const num = (v) => (typeof v === 'number' ? v : parseFloat(v));

export default {
  id: 'mouvement',
  title: 'Le mouvement',
  goal: 'Faire évoluer un motif tout seul, pour qu’une boucle ne soit jamais figée.',
  steps: [
    {
      id: 'f.signal',
      title: 'Un réglage qui bouge tout seul',
      listen: 'Une basse sur une seule note. Écoute le filtre : il s’ouvre et se referme sans que tu touches à rien.',
      code: 'note("c2*8").sound("sawtooth").lpf(sine.range(300, 2500).slow(4))',
      name:
        'À la place d’un nombre fixe, on a donné au filtre un **signal** : une valeur qui change en continu. `sine` monte et descend comme une vague ; ' +
        '`.range(300, 2500)` fixe le bas et le haut ; `.slow(4)` étale la vague sur 4 cycles.',
      task: {
        text: 'Remplace `sine` par `saw` : le filtre monte lentement puis retombe d’un coup.',
        check: (c) => {
          if (!c.has(/\bsaw\s*\./)) return 'Écris `saw.range(300, 2500)` à la place de `sine.range(300, 2500)`.';
          const v = c.val('cutoff').map(num);
          return v.length >= 4 && v[v.length - 1] > v[0] ? true : 'Garde `.range(300, 2500).slow(4)` après `saw`.';
        },
        ok: 'Une seule note, et pourtant ça avance. C’est le geste de base de la techno et de l’acid.',
      },
      deep: {
        why:
          'Les signaux disponibles : `sine` (vague), `saw` (rampe qui monte), `tri` (triangle), `square` (deux positions), `rand` (hasard pur), `perlin` (hasard doux). ' +
          'Ils valent tous entre 0 et 1 ; `.range(bas, haut)` les met à l’échelle voulue. On peut les brancher sur presque tous les réglages : `.gain(…)`, `.pan(…)`, `.lpq(…)`.',
        decode: [
          ['sine', 'un signal en forme de vague, entre 0 et 1.', 'fn.signaux'],
          ['.range(300, 2500)', 'le fait varier entre 300 et 2500.', 'fn.range'],
          ['.slow(4)', 'une vague complète dure 4 cycles.', 'fn.slow'],
        ],
        wiki: ['fn.signaux', 'fn.range', 'fn.slow', 'fx.lpf'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que fait `.lpf(sine.range(200, 2000))` ?',
          choices: ['Le filtre oscille en continu entre 200 et 2000 Hz', 'Le filtre choisit 200 ou 2000 au hasard', 'Le filtre reste à 200, puis saute à 2000 à la fin'],
          answer: 0,
          explain: '`sine` est une vague continue ; `.range` en fixe les bornes.',
        },
      ],
      legacy: ['4:4.9', '5:5.11'],
    },

    {
      id: 'f.vitesse',
      title: 'Plus vite, plus lent',
      listen: 'Quatre notes par cycle.',
      code: 'n("0 2 4 7").scale("A:minor").sound("piano")',
      name:
        '`.fast(2)` joue le motif **deux fois plus vite** (deux fois par cycle). `.slow(2)` le joue **deux fois plus lentement** (étalé sur deux cycles). ' +
        'C’est ce que font `*` et `/` dans la mini-notation, mais pour un motif entier.',
      task: {
        text: 'Ajoute `.slow(2)` à la fin de la ligne.',
        check: (c) => (c.count() === 2 ? true : c.count() > 4 ? 'Là, c’est plus rapide. Essaie `.slow(2)`.' : 'Ajoute `.slow(2)` après `.sound("piano")`.'),
        ok: 'Le même motif prend maintenant deux cycles. Essaie aussi `.fast(2)`.',
      },
      deep: {
        why:
          'Superposer le même motif à deux vitesses est un classique : la mélodie normale en haut, la même deux fois plus lente à la basse. ' +
          'Le nombre peut être lui-même un motif : `.fast("<1 2>")` alterne vitesse normale et double.',
        decode: [
          ['.fast(2)', 'deux fois plus vite.', 'fn.fast'],
          ['.slow(2)', 'deux fois plus lent.', 'fn.slow'],
        ],
        wiki: ['fn.fast', 'fn.slow', 'mini.etoile', 'mini.slash'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Un motif de 4 notes reçoit `.slow(2)`. Combien de notes entend-on par cycle ?',
          choices: ['2', '4', '8'],
          answer: 0,
          explain: 'Étalé sur deux cycles, le motif ne livre que la moitié de ses notes à chaque cycle.',
        },
      ],
      legacy: ['5:5.6'],
    },

    {
      id: 'f.variation',
      title: 'Une valeur différente à chaque cycle',
      listen: 'Écoute quatre cycles : la dernière note change, et le filtre s’ouvre un peu plus à chaque tour.',
      code: 'note("c3 eb3 g3 <bb3 c4>").sound("sawtooth").lpf("<500 900 1600 3000>")',
      name:
        'Les chevrons `< >` fonctionnent partout où l’on peut écrire entre guillemets : sur les notes, mais aussi sur les réglages. Ici `.lpf("<500 900 1600 3000>")` change de valeur à chaque cycle.',
      task: {
        text: 'Fais alterner la dernière note entre **trois** notes au lieu de deux : par exemple `<bb3 c4 d4>`.',
        check: (c) => {
          const last = new Set(c.haps4.filter((e) => e.note != null && Math.abs((e.begin % 1) - 0.75) < 0.01).map((e) => e.note));
          return last.size >= 3 ? true : 'La quatrième note doit prendre au moins trois valeurs : `<bb3 c4 d4>`.';
        },
        ok: 'Trois fins de phrase, quatre ouvertures de filtre : la boucle met douze cycles avant de se répéter à l’identique.',
      },
      deep: {
        why:
          'C’est une astuce d’arrangement : faire tourner des listes de longueurs différentes. Trois notes contre quatre valeurs de filtre ne retombent ensemble que tous les 12 cycles. ' +
          'Le motif paraît beaucoup plus long qu’il ne l’est.',
        decode: [
          ['<bb3 c4>', 'la note change à chaque cycle.', 'mini.chevrons'],
          ['.lpf("<500 900 1600 3000>")', 'la coupure du filtre aussi.', 'fx.lpf'],
        ],
        wiki: ['mini.chevrons', 'fx.lpf'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que fait `.gain("<1 .5>")` ?',
          choices: ['Un cycle fort, un cycle moins fort, en alternance', 'Deux volumes mélangés en même temps', 'Le volume baisse progressivement'],
          answer: 0,
          explain: 'Les chevrons donnent une valeur par cycle, à tour de rôle, même pour un réglage.',
        },
      ],
      legacy: [],
    },

    {
      id: 'f.parfois',
      title: 'De temps en temps',
      listen: 'Des charlestons. Certains sonnent plus aigu, jamais les mêmes.',
      code: 'sound("hh*8").sometimes(x => x.speed(2))',
      name:
        '`.sometimes(…)` applique une transformation **une fois sur deux, au hasard**. Entre les parenthèses, `x => x.speed(2)` se lit : « prends le son (`x`) et joue-le deux fois plus vite ».',
      task: {
        text: 'Remplace `sometimes` par `rarely` (rarement), puis par `often` (souvent).',
        check: (c) => (c.has(/\.(rarely|often|almostNever|almostAlways)\s*\(/) ? true : 'Écris `.rarely(` ou `.often(` à la place de `.sometimes(`.'),
        ok: 'Tu doses le hasard avec un mot.',
      },
      deep: {
        why:
          'La flèche `=>` fabrique une petite fonction : à gauche le nom qu’on donne au motif (`x`, par habitude), à droite ce qu’on lui fait. ' +
          'La famille complète, du plus rare au plus fréquent : `almostNever`, `rarely`, `sometimes`, `often`, `almostAlways`. Pour un dosage exact : `.sometimesBy(.3, x => …)` (30 %). ' +
          '`.speed(2)` lit un son enregistré deux fois plus vite, donc une octave plus haut.',
        decode: [
          ['.sometimes(…)', 'applique ce qui suit une fois sur deux.', 'fn.sometimes'],
          ['x => x.speed(2)', 'une fonction : « à ce motif, applique speed(2) ».', 'js.fleche'],
          ['.speed(2)', 'lecture deux fois plus rapide (et plus aiguë).', 'fx.speed'],
        ],
        wiki: ['fn.sometimes', 'js.fleche', 'fx.speed', 'mini.interrogation'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Dans `.sometimes(x => x.speed(2))`, que désigne `x` ?',
          choices: ['Le motif auquel on applique la transformation', 'Le nombre de répétitions', 'Un son appelé « x »'],
          answer: 0,
          explain: '`x` est le nom donné au motif à l’intérieur de la petite fonction. On pourrait l’appeler autrement.',
        },
      ],
      legacy: ['5:5.14'],
    },

    {
      id: 'f.tous-les',
      title: 'Tous les quatre cycles',
      listen: 'Écoute quatre cycles : au quatrième, la batterie s’emballe.',
      code: 'sound("bd*2 [~ sd] hh*2 sd").lastOf(4, x => x.ply(2))',
      name:
        '`.lastOf(4, …)` applique une transformation **au dernier cycle de chaque groupe de 4**. Ici `.ply(2)` double chaque coup : c’est un *fill*, le roulement qui annonce la suite.',
      task: {
        text: 'Change `4` en `2` : le roulement revient un cycle sur deux.',
        check: (c) => {
          if (!c.has(/lastOf\s*\(/)) return 'Garde `.lastOf(…)`.';
          const per = [0, 1, 2, 3].map((k) => c.haps4.filter((e) => e.begin >= k && e.begin < k + 1).length);
          return per[1] > per[0] && per[3] > per[2] ? true : 'Écris `.lastOf(2, x => x.ply(2))`.';
        },
        ok: 'La musique de danse se compte par 4, 8 et 16 mesures. Ces fonctions marquent les fins de phrase.',
      },
      deep: {
        why:
          'Sa jumelle `.firstOf(4, …)` agit au **premier** cycle de chaque groupe. Elle existe aussi sous le nom `.every(4, …)`, hérité de TidalCycles (l’ancêtre de Strudel) : ' +
          'si tu croises `every` dans un exemple, c’est la même chose.',
        decode: [
          ['.lastOf(4, …)', 'au dernier cycle de chaque groupe de 4.', 'fn.lastOf'],
          ['x => x.ply(2)', 'répète chaque coup deux fois.', 'fn.ply'],
        ],
        wiki: ['fn.lastOf', 'fn.firstOf', 'fn.ply', 'js.fleche'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Quand `.firstOf(8, x => x.rev())` agit-il ?',
          choices: ['Au premier cycle de chaque groupe de 8', 'Aux 8 premiers cycles seulement', 'À un cycle sur 8, au hasard'],
          answer: 0,
          explain: '`firstOf(n, …)` : une fois tous les n cycles, en commençant par le premier.',
        },
      ],
      legacy: ['5:5.22'],
    },

    {
      id: 'f.echo-decale',
      title: 'Une copie décalée',
      listen: 'Quatre notes sont écrites. Tu en entends huit : chacune a une réponse, plus haute.',
      code: 'note("c3 eb3 g3 bb3").sound("triangle").off(1/8, x => x.add(note(12)))',
      name:
        '`.off(1/8, …)` superpose au motif **une copie décalée** d’un huitième de cycle. À cette copie on applique `add(note(12))` : on lui ajoute 12 demi-tons, soit une octave.',
      task: {
        text: 'Remplace `12` par `7` : la réponse est maintenant une quinte au-dessus.',
        check: (c) => {
          const n = c.notes();
          if (n.length < 8) return 'Garde `.off(1/8, …)` : il doit y avoir huit notes par cycle.';
          return n.includes(65) && !n.includes(70) ? true : 'Écris `x => x.add(note(7))`.';
        },
        ok: 'Une ligne de quatre notes, et déjà un dialogue à deux voix.',
      },
      deep: {
        why:
          'Le décalage se compte en fraction de cycle : `1/8` = une croche si le cycle fait 4 temps, `1/16` = une double-croche. ' +
          'On peut appliquer n’importe quoi à la copie : un autre son, un filtre, une vitesse. Voisin utile : `.jux(rev)` joue l’original à gauche et sa version inversée à droite.',
        decode: [
          ['.off(1/8, …)', 'ajoute une copie retardée de 1/8 de cycle.', 'fn.off'],
          ['x.add(note(12))', 'monte la copie de 12 demi-tons.', 'fn.add'],
        ],
        wiki: ['fn.off', 'fn.add', 'fn.jux', 'sol.intervalle'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que fait `.add(note(12))` à une note ?',
          choices: ['Il la monte d’une octave', 'Il la joue 12 fois', 'Il la retarde de 12 temps'],
          answer: 0,
          explain: '12 demi-tons = une octave. `add(note(7))` monterait d’une quinte.',
        },
      ],
      legacy: ['5:5.17'],
    },
  ],
};
