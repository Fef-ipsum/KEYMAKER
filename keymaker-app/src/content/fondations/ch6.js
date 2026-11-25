// Fondations — Chapitre VI : Le timbre.
// Fabriquer un son de synthétiseur et le sculpter : onde, filtre, enveloppe, espace.

import { earTimbre } from './ear.js';

const num = (v) => (typeof v === 'number' ? v : parseFloat(v));

export default {
  id: 'timbre',
  title: 'Le timbre',
  goal: 'Fabriquer un son de synthé et le sculpter : onde, filtre, enveloppe, espace.',
  // Points d'étape et révisions : « retrouve le réglage à l'oreille » (familles générées
  // dans ear.js ; identifiants stables, ne jamais les renommer).
  ear: earTimbre,
  steps: [
    {
      id: 'f.ondes',
      schema: { type: 'onde', onde: 'sawtooth', note: 'c3', missions: ['pure', 'creuse', 'brillante'] },
      title: 'Quatre ondes de base',
      listen: 'Une mélodie jouée par un synthétiseur : le son n’est pas enregistré, il est calculé à chaque instant par le moteur.',
      code: 'note("c3 e3 g3 e3").sound("sawtooth")',
      name:
        'Un synthétiseur part d’une **onde** : une vibration de forme régulière, répétée autant de fois par seconde que la fréquence de la note. ' +
        'Strudel en calcule quatre de base : `sine` (sinusoïde, pure), `triangle` (douce), `square` (carrée, creuse) et `sawtooth` (dent de scie, la plus brillante).',
      task: {
        text: 'Essaie les trois autres : `sine`, `triangle`, `square`. Laisse celle que tu préfères.',
        check: (c) => {
          const s = c.sounds();
          if (!s.length) return 'Garde `.sound("…")` avec un nom d’onde.';
          return ['sine', 'triangle', 'square'].includes(s[0]) ? true : 'Écris `sine`, `triangle` ou `square` à la place de `sawtooth`.';
        },
        ok: 'Mêmes notes, quatre timbres. L’onde est la matière première du son.',
      },
      deep: {
        why:
          'Chaque forme correspond à un mélange d’**harmoniques** : des fréquences à 2, 3, 4… fois celle de la note, qui font la couleur du son, son [timbre](sol.timbre). ' +
          'La sinusoïde n’en a aucune : son pur. Le triangle et le carré n’ont que les impaires (3, 5, 7…), faibles pour le triangle, fortes pour le carré. La dent de scie les a toutes : c’est la plus brillante. ' +
          'Règle visuelle : plus une onde a d’angles vifs ou de sauts, plus elle contient d’aigus. La dent de scie est la préférée des basses et des leads, parce qu’un [filtre](fx.lpf) a beaucoup à y retirer.',
        decode: [
          ['.sound("sawtooth")', 'onde en dent de scie : toutes les harmoniques.', 'son.ondes'],
          ['sine / triangle / square', 'les trois autres ondes de base, de la plus pure à la plus creuse.', 'son.ondes'],
        ],
        wiki: ['son.ondes', 'sol.timbre', 'son.supersaw'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ces deux notes : même hauteur, deux ondes. Laquelle est la plus brillante ?',
          code: 'note("c3 c3").sound("<sine sawtooth>*2").slow(2)',
          choices: ['La deuxième (dent de scie)', 'La première (sinusoïde)'],
          answer: 0,
          explain: 'La sinusoïde n’a que sa fréquence de base : son rond et sourd. La dent de scie contient toutes les harmoniques : son brillant.',
        },
      ],
      legacy: ['4:4.2', '4:4.3'],
    },

    {
      id: 'f.filtre',
      schema: { type: 'filtre', reglages: { lpf: 400 }, source: 'repetee', regler: ['lpf'], missions: ['ferme', 'ouvre'] },
      title: 'Le filtre : assombrir ou éclaircir',
      listen: 'Une basse en dent de scie, mais étouffée.',
      code: 'note("c2*8").sound("sawtooth").lpf(400)',
      name:
        '`.lpf(400)` est un **filtre passe-bas** (*low-pass filter*) : il laisse passer les fréquences situées sous 400 Hz et atténue de plus en plus celles qui sont au-dessus. ' +
        'Plus le nombre est petit, plus le son est sombre.',
      task: {
        text: 'Ouvre le filtre : remplace 400 par 3000. Puis referme-le à 200.',
        check: (c) => {
          const v = c.val('cutoff').map(num);
          if (!v.length) return 'Garde `.lpf(…)` à la fin de la ligne.';
          return v.every((x) => x !== 400) ? true : 'Le filtre est encore à 400. Essaie `.lpf(3000)` puis `.lpf(200)`.';
        },
        ok: 'Ce simple réglage est le geste le plus important de toute la musique électronique.',
      },
      deep: {
        why:
          'Le nombre est une fréquence de coupure, en hertz (Hz, vibrations par seconde). L’oreille entend d’environ 20 Hz (très grave) à 20 000 Hz (très aigu). Repères : 200 = très étouffé, 800 = rond, 2000 = présent, 8000 = presque ouvert. ' +
          'Le filtre ne change pas la note : il retire des [harmoniques](sol.timbre). La coupure n’est pas un mur : au-dessus, chaque octave est atténuée d’environ 12 dB (amplitude divisée par 4). ' +
          'C’est le principe de la synthèse *soustractive* : une onde riche, puis un filtre qui la sculpte. Le filtre inverse existe : `.hpf(…)` ([passe-haut](fx.hpf)) retire les graves.',
        decode: [
          ['.lpf(400)', 'atténue les fréquences au-dessus de 400 Hz.', 'fx.lpf'],
          ['.hpf(400)', 'l’inverse : atténue celles en dessous de 400 Hz.', 'fx.hpf'],
        ],
        wiki: ['fx.lpf', 'fx.hpf', 'son.ondes'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Tu passes de `.lpf(3000)` à `.lpf(300)`. Le son devient…',
          choices: ['Plus sombre, étouffé', 'Plus brillant', 'Plus fort'],
          answer: 0,
          explain: 'Un passe-bas atténue ce qui dépasse la coupure. Coupure plus basse = moins d’harmoniques aiguës = son plus sombre. La note, elle, ne change pas.',
        },
      ],
      legacy: ['4:4.6'],
    },

    {
      id: 'f.resonance',
      schema: { type: 'filtre', reglages: { lpf: 600, lpq: 0 }, source: 'basse', missions: ['ferme', 'siffle', 'acid'] },
      title: 'La résonance : le filtre qui chante',
      listen: 'Une ligne de basse filtrée, assez sage.',
      code: 'note("c2 c2 eb2 c2 g2 c2 bb1 c2").sound("sawtooth").lpf(600).lpq(0)',
      name:
        '`.lpq(…)` règle la **résonance** du filtre : une bosse de volume juste à la fréquence de coupure. `lpq(15)` y ajoute 15 dB. ' +
        'À forte dose, cette bosse s’entend comme un sifflement : le filtre « chante ».',
      task: {
        text: 'Monte la résonance : remplace `lpq(0)` par `lpq(15)`.',
        check: (c) => {
          const v = c.val('resonance').map(num);
          if (!v.length) return 'Garde `.lpq(…)` à la fin de la ligne.';
          return v.some((x) => x >= 8) ? true : 'Monte plus haut : `.lpq(15)`.';
        },
        ok: 'Ce son nasal et liquide est celui de l’*acid*. Tu le retrouveras dans les genres.',
      },
      deep: {
        why:
          'Le « q » vient de *quality factor* (facteur de qualité), le terme d’électronique pour l’étroitesse d’un filtre : plus il est grand, plus la bande renforcée est étroite et haute. ' +
          'Dans Strudel, `lpq(n)` ajoute exactement n décibels à la coupure ; sans réglage, il vaut 1. Valeurs utiles : de 0 à 20 environ. Au-delà, le sifflement domine et le volume monte : baisse le `gain` avant d’essayer. ' +
          'La résonance prend tout son sens quand la coupure bouge : la bosse balaie les harmoniques une à une et on entend une voyelle, « ouah ». C’est le son de la [basse acid](genre.basse-acid).',
        decode: [
          ['.lpq(15)', 'bosse de +15 dB à la coupure.', 'fx.lpq'],
          ['.lpf(600)', 'la fréquence où le filtre coupe, et donc où il résonne.', 'fx.lpf'],
        ],
        wiki: ['fx.lpq', 'fx.lpf', 'fx.lpenv', 'genre.basse-acid'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute cette basse. Le filtre a-t-il beaucoup de résonance ?',
          code: 'note("c2 c2 eb2 c2").sound("sawtooth").lpf(700).lpq(18)',
          choices: ['Oui : on entend un pic nasal qui « chante »', 'Non : le son est rond et neutre'],
          answer: 0,
          explain: 'Avec `lpq(18)`, les fréquences autour de 700 Hz sont renforcées de 18 dB : on entend un pic nasal qui siffle.',
        },
      ],
      legacy: ['4:4.7'],
    },

    {
      id: 'f.enveloppe',
      schema: { type: 'adsr', reglages: { attack: 0.01, release: 0.1 }, notes: 1, missions: ['lente', 'traine'] },
      title: 'L’enveloppe : comment le son arrive et repart',
      listen: 'Des notes qui démarrent net et s’arrêtent net.',
      code: 'note("c3 e3 g3 b3").sound("sawtooth").lpf(1500).attack(.01).release(.1)',
      name:
        'L’**enveloppe** décrit comment le volume d’une note évolue dans le temps. `attack` : le temps, en secondes, pour monter de zéro au maximum. ' +
        '`release` : le temps pour retomber à zéro APRÈS la fin de la note.',
      task: {
        text: 'Fais une nappe : mets `attack(.4)` et `release(1)`. Les notes arrivent en fondu et se chevauchent.',
        check: (c) => {
          const a = c.val('attack').map(num);
          if (!a.length) return 'Garde `.attack(…)`.';
          return a.some((x) => x >= 0.2) ? true : 'L’attaque est encore très courte. Essaie `.attack(.4)`.';
        },
        ok: 'Attaque lente : une nappe. Attaque courte : une note percussive. Même onde, autre instrument.',
      },
      deep: {
        why:
          'L’enveloppe complète a quatre réglages, **ADSR** : [attack](fx.attack) (montée), [decay](fx.decay) (retombée vers le niveau tenu), [sustain](fx.sustain) (niveau tenu tant que la note dure, entre 0 et 1) et [release](fx.release) (extinction après la note). ' +
          'Trois sont des durées, le sustain est un niveau. On peut tout écrire d’un coup : `.adsr(".01:.2:.5:.3")`. ' +
          'Dans la consigne : une attaque de 0,4 s fait arriver chaque note en fondu ; un release de 1 s la fait déborder sur la suivante, d’où l’impression de nappe. ' +
          'Attention : écrire un seul de ces réglages change aussi les autres. Par exemple, `attack` seul fait passer le sustain de 0,6 (sa valeur sans réglage) à 1.',
        decode: [
          ['.attack(.01)', 'le son monte au maximum en 0,01 s : départ net, sans clic.', 'fx.attack'],
          ['.release(.1)', 'après la fin de la note, il s’éteint en 0,1 s.', 'fx.release'],
          ['.adsr("a:d:s:r")', 'les quatre réglages en une fois.', 'fx.adsr'],
        ],
        wiki: ['fx.attack', 'fx.release', 'fx.adsr', 'sol.enveloppe'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ces notes. L’attaque est-elle courte ou longue ?',
          code: 'note("c3 g3").sound("sawtooth").lpf(1500).attack(.5).release(.8).slow(2)',
          choices: ['Longue : chaque note arrive en fondu', 'Courte : chaque note claque tout de suite'],
          answer: 0,
          explain: 'Avec `attack(.5)`, chaque note met une demi-seconde à atteindre son maximum : elle arrive en fondu, comme une nappe ou des cordes.',
        },
      ],
      legacy: ['4:4.11', '4:4.12'],
    },

    {
      id: 'f.pluck',
      schema: { type: 'adsr', reglages: {}, notes: 1, missions: ['pince', 'lente', 'traine'] },
      title: 'La note pincée : decay et sustain',
      listen: 'Les mêmes notes, tenues jusqu’au bout de leur pas.',
      code: 'note("c3 eb3 g3 bb3 c4 bb3 g3 eb3").sound("sawtooth").lpf(1200)',
      name:
        '`decay` est le temps, en secondes, que met le son pour **retomber** du maximum vers le niveau `sustain` ; `sustain` est ce **niveau**, entre 0 et 1, tenu jusqu’à la fin de la note. ' +
        'Avec `sustain(0)`, le son retombe jusqu’au silence : la note est « pincée ».',
      task: {
        text: 'Ajoute `.decay(.15).sustain(0)` à la fin de la ligne.',
        check: (c) => {
          const d = c.val('decay').map(num);
          const s = c.val('sustain').map(num);
          if (!d.length) return 'Ajoute `.decay(.15)`.';
          if (!s.length) return 'Ajoute aussi `.sustain(0)`.';
          return s.every((x) => x <= 0.2) ? true : 'Mets le sustain à 0 pour que la note retombe complètement.';
        },
        ok: 'Chaque note claque puis disparaît : on appelle ce son un *pluck*. C’est celui des basses techno et des arpèges de trance.',
      },
      deep: {
        why:
          'Le decay règle la longueur du pincement : `.05` très sec, `.15` pincé, `.4` rond. Avec un sustain à 0, la durée écrite de la note ne compte presque plus : c’est le decay qui décide de ce qu’on entend. ' +
          'C’est ainsi que sonnent les instruments pincés ou frappés (guitare, piano, xylophone) : ils reçoivent leur énergie en une fois, puis la perdent. ' +
          'Sans aucun réglage, les ondes de Strudel ont un sustain de 0,6 : elles tiennent le son jusqu’au bout du pas, comme au départ de cette étape.',
        decode: [
          ['.decay(.15)', 'le son retombe en 0,15 seconde.', 'fx.decay'],
          ['.sustain(0)', 'il retombe jusqu’à zéro, le silence.', 'fx.sustain'],
        ],
        wiki: ['fx.decay', 'fx.sustain', 'fx.adsr'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Quel couple de réglages donne une note courte et pincée ?',
          choices: ['decay(.1) et sustain(0)', 'attack(1) et release(2)', 'decay(2) et sustain(1)'],
          answer: 0,
          explain: 'Decay court : le son retombe vite. Sustain à 0 : il retombe jusqu’au silence. `attack(1)` donnerait un fondu, `sustain(1)` tiendrait la note.',
        },
      ],
      legacy: ['4:4.13'],
    },

    {
      id: 'f.espace',
      title: 'L’espace : réverbération et écho',
      listen: 'Quelques notes sèches, comme dans une pièce capitonnée.',
      code: 'note("c4 ~ eb4 ~ g4 ~ ~ ~").sound("triangle")',
      name:
        '`.room(…)` ajoute de la **réverbération** : la traîne de réflexions d’une pièce autour du son. `.delay(…)` ajoute un **écho** : des répétitions distinctes, de plus en plus faibles. ' +
        'Les deux règlent un niveau, de 0 (rien) à 1 (fort), qui s’ajoute au son d’origine sans le baisser.',
      task: {
        text: 'Ajoute `.room(.6)` à la fin. Puis essaie aussi `.delay(.5)`.',
        check: (c) => {
          const r = c.val('room').map(num);
          const d = c.val('delay').map(num);
          return r.some((x) => x > 0) || d.some((x) => x > 0) ? true : 'Ajoute `.room(.6)` après `.sound("triangle")`.';
        },
        ok: 'Les silences se remplissent. L’espace fait partie du son autant que les notes.',
      },
      deep: {
        why:
          'Pour l’écho, deux réglages de plus : [delaytime](fx.delaytime), l’intervalle entre les répétitions en secondes (pour le caler sur le tempo, `.delaysync(…)` compte en cycles : `.25` = un temps) ; ' +
          'et [delayfeedback](fx.delayfeedback), la part de chaque répétition renvoyée vers la suivante (0,5 par défaut, plafonnée à 0,98). ' +
          'Pour la réverbération, [size](fx.size) règle la durée de la traîne, en secondes (2 par défaut). Ces effets sont partagés par toutes les pistes d’une même [orbit](fx.orbit). ' +
          'Règle de mixage : peu d’espace sur les graves, qu’il brouille ; davantage sur les aigus.',
        decode: [
          ['.room(.6)', 'niveau envoyé dans la réverbération.', 'fx.room'],
          ['.delay(.5)', 'niveau de la première répétition de l’écho.', 'fx.delay'],
          ['.delaytime(.25)', 'intervalle entre deux répétitions, en secondes.', 'fx.delaytime'],
          ['.delayfeedback(.5)', 'chaque répétition garde la moitié de la précédente.', 'fx.delayfeedback'],
        ],
        wiki: ['fx.room', 'fx.size', 'fx.delay', 'fx.delaytime', 'fx.delayfeedback'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Quelle différence entre `.room()` et `.delay()` ?',
          choices: ['room = réverbération (une salle), delay = écho (des répétitions)', 'room = écho, delay = retard du démarrage', 'Aucune, ce sont deux noms du même effet'],
          answer: 0,
          explain: 'La réverbération est une traîne continue, faite de milliers de réflexions ; l’écho répète distinctement la note, à intervalle régulier.',
        },
      ],
      legacy: ['4:4.16', '4:4.17'],
    },

    {
      id: 'f.son-a-toi',
      title: 'Sculpter ton propre son',
      listen: 'Un son complet : onde, filtre, résonance, enveloppe, espace. Chaque réglage est sur sa ligne.',
      code: `note("c2 c2 eb2 c2 g2 c2 bb1 c3")
  .sound("sawtooth")
  .lpf(900)
  .lpq(8)
  .decay(.2).sustain(0)
  .room(.3)`,
      name:
        'Tu sais lire chaque ligne. Un son de synthé, c’est cette chaîne : **onde → filtre → enveloppe → espace**. ' +
        'Une onde riche, dont le filtre retire des aigus, que l’enveloppe découpe dans le temps, puis qu’on place dans une pièce.',
      task: {
        text: 'Fais-en ton son : change au moins deux réglages (l’onde, la coupure du filtre, la résonance, le decay…).',
        check: (c) => {
          if (c.notes().length < 4) return 'Garde la ligne de notes.';
          return c.changed ? true : 'C’est encore l’exemple : change deux valeurs.';
        },
        ok: 'Chapitre terminé. Si ce son te plaît, garde-le avec le bouton « Garder ».',
      },
      deep: {
        why:
          'On peut aller à la ligne avant chaque point : Strudel lit la chaîne comme une seule ligne. C’est plus lisible quand les réglages s’accumulent. ' +
          'L’ordre des réglages dans le code n’a aucune importance : le moteur applique toujours la même chaîne. Il calcule l’onde avec son enveloppe de volume, puis applique le volume (`gain`), les filtres, la saturation, la position gauche-droite, et envoie enfin le son vers l’écho et la réverbération. ' +
          'Dans un synthétiseur analogique classique, l’enveloppe agit après le filtre (sur l’amplificateur) ; dans Strudel, elle est appliquée dès la source, avant le filtre.',
        decode: [
          ['.lpf(900).lpq(8)', 'le filtre et sa résonance.', 'fx.lpf'],
          ['.decay(.2).sustain(0)', 'l’enveloppe : une note pincée.', 'fx.decay'],
          ['.room(.3)', 'un peu de réverbération.', 'fx.room'],
        ],
        wiki: ['son.ondes', 'fx.lpf', 'fx.lpq', 'fx.adsr', 'fx.room'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Dans quel ordre un synthétiseur façonne-t-il le son ?',
          choices: ['Onde → filtre → enveloppe → espace', 'Espace → onde → filtre', 'Filtre → onde → tempo'],
          answer: 0,
          explain: 'On part d’une onde brute, le filtre retire des harmoniques, l’enveloppe donne une forme dans le temps, puis l’espace place le son dans une pièce. C’est l’ordre classique d’un synthétiseur analogique.',
        },
      ],
      legacy: ['4:4.15'],
    },
  ],
};
