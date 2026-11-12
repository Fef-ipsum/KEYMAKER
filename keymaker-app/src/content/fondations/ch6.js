// Fondations — Chapitre VI : Le timbre.
// Fabriquer un son de synthétiseur et le sculpter : onde, filtre, enveloppe, espace.

const num = (v) => (typeof v === 'number' ? v : parseFloat(v));

export default {
  id: 'timbre',
  title: 'Le timbre',
  goal: 'Fabriquer un son de synthé et le sculpter : onde, filtre, enveloppe, espace.',
  steps: [
    {
      id: 'f.ondes',
      title: 'Quatre ondes de base',
      listen: 'Une mélodie jouée par un synthétiseur : le son n’est pas enregistré, il est calculé.',
      code: 'note("c3 e3 g3 e3").sound("sawtooth")',
      name:
        'Un synthétiseur part d’une **onde** : une forme de vibration. Strudel en propose quatre de base : `sine` (pure et douce), `triangle` (douce, un peu plus présente), ' +
        '`square` (creuse, comme un vieux jeu vidéo) et `sawtooth` (riche et brillante).',
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
          '« Sawtooth » veut dire *dent de scie*, « square » *carré* : ce sont les dessins des vibrations. Plus une onde a d’angles vifs, plus elle contient d’aigus ' +
          '(des *harmoniques*). La sinusoïde n’en a aucun : c’est le son le plus pur. La dent de scie en est pleine : c’est la préférée des basses et des leads électroniques, ' +
          'parce qu’il y a beaucoup de matière à sculpter ensuite.',
        decode: [
          ['.sound("sawtooth")', 'onde en dent de scie.', 'son.ondes'],
          ['sine / triangle / square', 'les trois autres ondes de base.', 'son.ondes'],
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
          explain: 'La sinusoïde est ronde et sourde ; la dent de scie est pleine d’aigus.',
        },
      ],
      legacy: ['4:4.2', '4:4.3'],
    },

    {
      id: 'f.filtre',
      title: 'Le filtre : assombrir ou éclaircir',
      listen: 'Une basse en dent de scie, mais étouffée.',
      code: 'note("c2*8").sound("sawtooth").lpf(400)',
      name:
        '`.lpf(400)` est un **filtre passe-bas** (*low-pass filter*) : il laisse passer les graves et coupe ce qui est au-dessus de 400 Hz. ' +
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
          'Le nombre est une fréquence en hertz (Hz). L’oreille entend d’environ 20 Hz (très grave) à 20 000 Hz (très aigu). Repères : 200 = très étouffé, 800 = rond, 2000 = présent, 8000 = presque ouvert. ' +
          'Le filtre inverse existe : `.hpf(…)` (passe-haut) retire les graves.',
        decode: [
          ['.lpf(400)', 'coupe les fréquences au-dessus de 400 Hz.', 'fx.lpf'],
          ['.hpf(400)', 'l’inverse : coupe en dessous de 400 Hz.', 'fx.hpf'],
        ],
        wiki: ['fx.lpf', 'fx.hpf', 'son.ondes'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Tu passes de `.lpf(3000)` à `.lpf(300)`. Le son devient…',
          choices: ['Plus sombre, étouffé', 'Plus brillant', 'Plus fort'],
          answer: 0,
          explain: 'Un passe-bas coupe les aigus au-dessus de la valeur. Plus la valeur est basse, moins il reste d’aigus.',
        },
      ],
      legacy: ['4:4.6'],
    },

    {
      id: 'f.resonance',
      title: 'La résonance : le filtre qui chante',
      listen: 'Une ligne de basse filtrée, assez sage.',
      code: 'note("c2 c2 eb2 c2 g2 c2 bb1 c2").sound("sawtooth").lpf(600).lpq(0)',
      name:
        '`.lpq(…)` règle la **résonance** du filtre : il met en avant les fréquences situées juste à la coupure. À forte dose, le filtre se met à « chanter ».',
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
          'Le « q » vient de *quality factor*, le terme d’électronique pour l’étroitesse d’un filtre. Valeurs utiles : de 0 à 20 environ. Au-delà, le sifflement devient agressif : baisse le volume avant d’essayer.',
        decode: [
          ['.lpq(15)', 'résonance forte du filtre passe-bas.', 'fx.lpq'],
          ['.lpf(600)', 'la fréquence où le filtre coupe, et donc où il résonne.', 'fx.lpf'],
        ],
        wiki: ['fx.lpq', 'fx.lpf', 'genre.basse-acid'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute cette basse. Le filtre a-t-il beaucoup de résonance ?',
          code: 'note("c2 c2 eb2 c2").sound("sawtooth").lpf(700).lpq(18)',
          choices: ['Oui : on entend un pic nasal qui « chante »', 'Non : le son est rond et neutre'],
          answer: 0,
          explain: 'Avec `lpq(18)`, les fréquences autour de 700 Hz sont fortement accentuées.',
        },
      ],
      legacy: ['4:4.7'],
    },

    {
      id: 'f.enveloppe',
      title: 'L’enveloppe : comment le son arrive et repart',
      listen: 'Des notes qui démarrent net et s’arrêtent net.',
      code: 'note("c3 e3 g3 b3").sound("sawtooth").lpf(1500).attack(.01).release(.1)',
      name:
        'L’**enveloppe** décrit la forme du son dans le temps. `attack` est le temps qu’il met à **apparaître**, `release` le temps qu’il met à **s’éteindre** après la note. Les valeurs sont en secondes.',
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
          'L’enveloppe complète a quatre temps, résumés par les lettres **ADSR** : *Attack* (montée), *Decay* (retombée), *Sustain* (niveau tenu tant que la note dure), *Release* (extinction). ' +
          'On peut tout écrire d’un coup : `.adsr(".01:.2:.5:.3")`.',
        decode: [
          ['.attack(.01)', 'le son apparaît en un centième de seconde : net.', 'fx.attack'],
          ['.release(.1)', 'il s’éteint en un dixième de seconde.', 'fx.release'],
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
          explain: 'Avec `attack(.5)`, le son met une demi-seconde à atteindre son volume : c’est une nappe.',
        },
      ],
      legacy: ['4:4.11', '4:4.12'],
    },

    {
      id: 'f.pluck',
      title: 'La note pincée : decay et sustain',
      listen: 'Les mêmes notes, tenues jusqu’au bout de leur pas.',
      code: 'note("c3 eb3 g3 bb3 c4 bb3 g3 eb3").sound("sawtooth").lpf(1200)',
      name:
        '`decay` est le temps que met le son à **retomber** après l’attaque ; `sustain` est le niveau auquel il se **stabilise**. Avec `sustain(0)`, il retombe jusqu’au silence : la note est « pincée ».',
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
          'Le decay règle la longueur du « pincement » : `.05` très sec, `.3` plus rond. Essaie plusieurs valeurs. ' +
          'Avec un sustain à 0, la durée écrite de la note ne compte plus : c’est le decay qui décide.',
        decode: [
          ['.decay(.15)', 'le son retombe en 0,15 seconde.', 'fx.decay'],
          ['.sustain(0)', 'il retombe jusqu’à zéro (silence).', 'fx.sustain'],
        ],
        wiki: ['fx.decay', 'fx.sustain', 'fx.adsr'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Quel couple de réglages donne une note courte et pincée ?',
          choices: ['decay(.1) et sustain(0)', 'attack(1) et release(2)', 'decay(2) et sustain(1)'],
          answer: 0,
          explain: 'Une retombée rapide (decay court) jusqu’au silence (sustain à 0).',
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
        '`.room(…)` ajoute de la **réverbération** : le son d’une pièce, d’une salle, d’une cathédrale. `.delay(…)` ajoute un **écho** qui répète la note. Les deux vont de 0 (rien) à 1 (beaucoup).',
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
          'Pour l’écho, deux réglages de plus : `.delaytime(…)` l’intervalle entre les répétitions, en secondes (pour le caler sur le tempo, utilise plutôt `.delaysync(…)`, qui compte en cycles : `.25` = un temps) ' +
          'et `.delayfeedback(…)` le nombre de répétitions (reste en dessous de 1). Pour la réverbération, `.size(…)` règle la taille de la pièce. ' +
          'Règle de mixage : peu d’espace sur les graves, davantage sur les aigus.',
        decode: [
          ['.room(.6)', 'quantité de réverbération.', 'fx.room'],
          ['.delay(.5)', 'quantité d’écho.', 'fx.delay'],
          ['.delaytime(.25)', 'temps entre deux échos, en secondes.', 'fx.delaytime'],
          ['.delayfeedback(.5)', 'combien l’écho se répète.', 'fx.delayfeedback'],
        ],
        wiki: ['fx.room', 'fx.size', 'fx.delay', 'fx.delaytime', 'fx.delayfeedback'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Quelle différence entre `.room()` et `.delay()` ?',
          choices: ['room = réverbération (une salle), delay = écho (des répétitions)', 'room = écho, delay = retard du démarrage', 'Aucune, ce sont deux noms du même effet'],
          answer: 0,
          explain: 'La réverbération est un halo continu ; le delay répète distinctement la note.',
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
      name: 'Tu sais lire chaque ligne. Un son de synthé, c’est cette chaîne : **onde → filtre → enveloppe → espace**.',
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
          'On peut aller à la ligne avant chaque point : Strudel lit la chaîne comme si tout était sur une seule ligne. C’est plus lisible quand les réglages s’accumulent. ' +
          'L’ordre des réglages n’a pas d’importance pour le son : le moteur applique toujours onde, filtre, enveloppe puis effets d’espace.',
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
          explain: 'On part d’une onde brute, on la filtre, on lui donne une forme dans le temps, puis on la place dans un espace.',
        },
      ],
      legacy: ['4:4.15'],
    },
  ],
};
