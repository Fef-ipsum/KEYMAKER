// Genre — Ambient. Forme : voir techno.js.
// Reprend le contenu vérifié des leçons 7.21 à 7.25 (parcours « Autres genres »).
// L'ambient n'a pas de zone de tempo : bpmLabel remplace l'affichage « min–max BPM ».

const DRONE = 'note("c2").sound("sine").gain(.35).room(.5)';
const PAD = 'chord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(900).attack(2).release(4).room(.85).roomsize(8).gain(.3)';

export default {
  id: 'ambient',
  name: 'Ambient',
  family: 'Ambient',
  bpm: [0, 0],
  bpmLabel: 'Tempo libre',
  pitch: 'Presque pas de rythme : des sons tenus, lents, qui évoluent dans un très grand espace.',
  intro:
    'L’ambient renverse les priorités des autres genres. Le rythme passe au second plan ou disparaît ; ce qui compte, c’est la texture, la lenteur et l’espace. ' +
    'Une pièce ambient peut s’écouter attentivement, ou rester en fond, comme une lumière. Elle change souvent toute seule, par des boucles qui se décalent ou du hasard dosé. ' +
    'Les leçons du parcours « Autres genres » construisent ensuite une pièce générative complète.',
  traits: [
    {
      aspect: 'tempo',
      title: 'Le temps s’étire',
      short: 'Pas de zone de tempo ; souvent aucune pulsation audible',
      hear: `setcpm(24/4)
$: ${DRONE}
$: ${PAD}`,
      what:
        'L’ambient n’a pas de tempo typique : souvent, on n’entend tout simplement pas de pulsation. Le tempo sert surtout à régler la durée des événements : plus il est bas, plus chaque accord a le temps de monter, de durer et de s’éteindre.' +
        ' Dans Strudel, un tempo très bas étire le [cycle](sol.cycle) : `setcpm(24/4)` donne 6 cycles par minute, donc un cycle de 10 s ; chaque accord de `"<Cm7 Ab^7>"` dure ainsi 10 s. `attack(2)` le fait monter en 2 s et `release(4)` le laisse s’éteindre en 4 s (voir [enveloppe](fx.adsr)).',
      build: [
        ['Un accord toutes les 4 s : setcpm(60/4)', `setcpm(60/4)\n${PAD}`],
        ['Toutes les 10 s : setcpm(24/4)', `setcpm(24/4)\n${PAD}`],
        ['Toutes les 15 s : setcpm(16/4)', `setcpm(16/4)\n${PAD}`],
      ],
      wiki: ['fn.setcpm', 'sol.cycle', 'fx.adsr'],
      quiz: [
        {
          type: 'qcm',
          q: 'Avec `setcpm(24/4)`, combien de temps dure un cycle ?',
          choices: ['10 secondes', '4 secondes', '24 secondes'],
          answer: 0,
          explain: '`setcpm(24/4)` règle 24 ÷ 4 = 6 cycles par minute : 60 s ÷ 6 = 10 s par cycle. Une note écrite seule dans le cycle dure donc 10 s.',
        },
      ],
    },
    {
      aspect: 'kick',
      title: 'Pas de kick, ou un battement lointain',
      short: 'Le plus souvent aucun ; parfois un kick étouffé, très loin (ambient techno)',
      hear: `setcpm(60/4)
$: ${DRONE}
$: sound("bd*4").bank("RolandTR909").lpf(200).room(.9).roomsize(6).gain(.5)`,
      what:
        'Dans la plupart des pièces ambient, il n’y a pas de kick du tout. Une branche, l’*ambient techno*, en garde un, mais enfoui : filtré, noyé dans la réverbération, comme entendu à travers un mur. Il donne un pouls sans réclamer qu’on danse.' +
        ' Pour l’étouffer : un [passe-bas](fx.lpf) à 200 Hz retire l’attaque aiguë (le « clic ») et ne garde que le grave ; une grande [réverbération](fx.room) l’éloigne. À `setcpm(60/4)`, un kick par temps tombe toutes les secondes.',
      build: [
        ['1. Sans kick : le drone seul', `setcpm(60/4)\n${DRONE}`],
        ['2. Un kick ordinaire : il prend toute la place', `setcpm(60/4)\n$: ${DRONE}\n$: sound("bd*4").bank("RolandTR909").gain(.6)`],
        ['3. Le même, filtré et lointain', `setcpm(60/4)\n$: ${DRONE}\n$: sound("bd*4").bank("RolandTR909").lpf(200).room(.9).roomsize(6).gain(.5)`],
      ],
      wiki: ['fx.lpf', 'fx.room', 'son.batterie'],
    },
    {
      aspect: 'basse',
      title: 'Le drone : une note grave tenue',
      short: 'Une note grave tenue très longtemps (drone), qui évolue lentement',
      hear: `setcpm(24/4)
note("c2,c3").sound("sawtooth").lpf(sine.range(300, 1200).slow(12)).lpq(3).room(.7).gain(.3)`,
      what:
        'À la place d’une ligne de basse, l’ambient pose souvent un *drone* : une note grave tenue, parfois doublée à l’octave, qui sert de sol à tout le reste. Pour qu’elle ne lasse pas, son timbre bouge très lentement.' +
        ' `note("c2")` vibre à 65,4 Hz ; `note("c2,c3")` y ajoute l’[octave](sol.octave), 130,8 Hz. Rejouée à chaque cycle de 10 s, la note semble ne jamais s’arrêter. `lpf(sine.range(300, 1200).slow(12))` fait suivre à la coupure une vague de 300 à 1 200 Hz sur 12 cycles, soit 2 minutes à ce tempo (voir [signaux](fn.signaux)).',
      build: [
        ['1. Une sinusoïde grave', `setcpm(24/4)\n${DRONE}`],
        ['2. Une dent de scie, doublée à l’octave et filtrée', `setcpm(24/4)\nnote("c2,c3").sound("sawtooth").lpf(600).room(.7).gain(.3)`],
        ['3. Le filtre ondule sur 2 minutes', `setcpm(24/4)\nnote("c2,c3").sound("sawtooth").lpf(sine.range(300, 1200).slow(12)).lpq(3).room(.7).gain(.3)`],
      ],
      wiki: ['sol.octave', 'son.ondes', 'fn.signaux', 'fx.lpf'],
    },
    {
      aspect: 'hats',
      title: 'Pas de charleston : des textures qui bougent',
      short: 'Pas de charleston ; le mouvement vient de grains, d’échos et de bruits',
      hear: `setcpm(24/4)
$: sound("space").chop(16).slow(2).delay(.6).delaytime(.375).delayfeedback(.6).room(.9).roomsize(10).orbit(2).gain(.3)
$: ${DRONE}`,
      what:
        'Ce qui fait avancer une pièce ambient n’est pas une batterie mais une **texture** : un son découpé en grains très courts, des échos qui s’accumulent, un souffle. Ce mouvement est continu, sans temps forts.' +
        ' `sound("space")` joue un son d’ambiance de la banque ; `chop(16)` le découpe en 16 grains joués dans l’ordre, et `.slow(2)` étale le tout sur 2 cycles (voir [chop](fx.chop)). Le [delay](fx.delay) répète chaque grain toutes les 0,375 s, chaque écho gardant 60 % du précédent ; [orbit](fx.orbit) donne à cette piste sa propre réverbération, séparée de celle du drone.',
      build: [
        ['1. Le son d’ambiance tel quel', `setcpm(24/4)\nsound("space").gain(.4)`],
        ['2. En 16 grains, sur 2 cycles', `setcpm(24/4)\nsound("space").chop(16).slow(2).gain(.4)`],
        ['3. Des échos et une très grande réverbération', `setcpm(24/4)\nsound("space").chop(16).slow(2).delay(.6).delaytime(.375).delayfeedback(.6).room(.9).roomsize(10).orbit(2).gain(.3)`],
      ],
      wiki: ['fx.chop', 'fx.delay', 'fx.orbit', 'fx.room'],
    },
    {
      aspect: 'harmonie',
      title: 'Des accords lents, des notes qui ne heurtent jamais',
      short: 'Accords tenus et lents ; notes tirées au hasard dans une gamme ; boucles de longueurs différentes',
      hear: `setcpm(24/4)
$: ${PAD}
$: n(irand(8).segment(4)).seed(1).scale("C:minor").sound("triangle").attack(1).release(4).room(.85).gain(.3).degradeBy(.4)`,
      what:
        'L’harmonie de l’ambient est lente : un accord peut durer dix secondes ou plus. Les mélodies, quand il y en a, sont souvent laissées au hasard, mais un hasard encadré : les notes sont tirées dans une [gamme](sol.gamme), donc aucune ne sonne faux.' +
        ' `irand(8).segment(4)` tire 4 nombres entiers par cycle, de 0 à 7 (voir [irand](fn.irand)) ; `scale("C:minor")` en fait des degrés de do mineur. `degradeBy(.4)` retire chaque note avec une probabilité de 40 % (voir [degradeBy](fn.degradeBy)). `.seed(1)` donne aux notes un autre tirage que celui des trous : sans lui, les deux lisent le même nombre, et les degrés les plus graves ne jouent jamais (mesuré dans le moteur, voir [graine](voc.aleatoire.graine)).',
      build: [
        ['1. Deux accords de septième, 10 s chacun', `setcpm(24/4)\n${PAD}`],
        ['2. Des notes au hasard, toujours dans la gamme', `setcpm(24/4)\nn(irand(8).segment(4)).seed(1).scale("C:minor").sound("triangle").attack(1).release(4).room(.85).gain(.3)`],
        ['3. Des trous au hasard : de l’air', `setcpm(24/4)\nn(irand(8).segment(4)).seed(1).scale("C:minor").sound("triangle").attack(1).release(4).room(.85).gain(.3).degradeBy(.4)`],
        ['4. Ou deux boucles de 3 et 4 notes, au même pas (un polymètre)', `setcpm(24/4)\nn("{0 4 2, 7 5 3 1}%4").scale("C:minor").sound("triangle").attack(.5).release(2).room(.8).gain(.3)`],
      ],
      wiki: ['sol.gamme', 'fn.irand', 'fn.degradeBy', 'voc.aleatoire.graine', 'voc.rythme.polymetre'],
    },
    {
      aspect: 'timbres',
      title: 'L’espace comme instrument',
      short: 'Très grande réverbération, échos longs, voix légèrement désaccordées qui battent',
      hear: `setcpm(24/4)
${PAD.replace('.voicing()', '.voicing().superimpose(x => x.add(note(.1)))')}`,
      what:
        'En ambient, les effets ne décorent pas : ils font partie du son. La réverbération est immense, et un accord y laisse une traîne de plusieurs secondes. On double aussi les voix avec une copie très légèrement désaccordée : les deux battent lentement, et l’accord semble respirer.' +
        ' `roomsize(8)` règle une traîne qui s’éteint de 60 dB en 8 s (voir [size](fx.size)) ; `room(.85)` en règle la quantité. `superimpose(x => x.add(note(.1)))` superpose une copie de chaque note 0,1 demi-ton plus haut (voir [superimpose](fn.superimpose)) : comme dans un [supersaw](son.supersaw), les deux hauteurs proches battent.',
      build: [
        ['1. Les accords, sans espace', `setcpm(24/4)\nchord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(900).attack(2).release(4).gain(.3)`],
        ['2. Dans une très grande réverbération', `setcpm(24/4)\n${PAD}`],
        ['3. Doublés à 0,1 demi-ton : ils battent', `setcpm(24/4)\n${PAD.replace('.voicing()', '.voicing().superimpose(x => x.add(note(.1)))')}`],
      ],
      wiki: ['fx.room', 'fx.size', 'fn.superimpose', 'son.supersaw'],
    },
    {
      aspect: 'structure',
      title: 'Pas de couplets : des boucles qui se décalent',
      short: 'Pas de sections nettes ; boucles de longueurs inégales, évolution très lente',
      hear: `setcpm(24/4)
$: ${DRONE}
$: note("eb4").sound("triangle").attack(1).release(5).room(.8).gain(.25).slow(3)
$: note("g4").sound("triangle").attack(1).release(5).room(.8).gain(.25).slow(5)`,
      what:
        'Une pièce ambient n’a ni couplet ni refrain, ni montée vers un drop. Elle évolue lentement, souvent sans plan fixe. Une technique classique consiste à superposer des boucles de **longueurs différentes** : elles ne retombent ensemble qu’au bout d’un long moment, et la pièce ne se répète jamais à l’identique pendant ce temps.' +
        ' Dans l’exemple, une note revient tous les 3 cycles (`.slow(3)`), l’autre tous les 5 (`.slow(5)`) : elles ne sonnent ensemble qu’une fois tous les 15 cycles, soit toutes les 2 min 30 s à `setcpm(24/4)`.',
      build: [
        ['1. Une note, tous les 3 cycles', `setcpm(24/4)\nnote("eb4").sound("triangle").attack(1).release(5).room(.8).gain(.25).slow(3)`],
        ['2. Une autre, tous les 5 cycles : elles se décalent', `setcpm(24/4)\n$: note("eb4").sound("triangle").attack(1).release(5).room(.8).gain(.25).slow(3)\n$: note("g4").sound("triangle").attack(1).release(5).room(.8).gain(.25).slow(5)`],
        ['3. Sur le drone', `setcpm(24/4)\n$: ${DRONE}\n$: note("eb4").sound("triangle").attack(1).release(5).room(.8).gain(.25).slow(3)\n$: note("g4").sound("triangle").attack(1).release(5).room(.8).gain(.25).slow(5)`],
      ],
      wiki: ['fn.slow', 'voc.aleatoire.generatif', 'voc.rythme.polymetre'],
      quiz: [
        {
          type: 'qcm',
          q: 'Une note revient tous les 3 cycles (`.slow(3)`), une autre tous les 5 (`.slow(5)`). Tous les combien de cycles sonnent-elles ensemble ?',
          choices: ['15 cycles', '8 cycles', '5 cycles'],
          answer: 0,
          explain: 'Elles partent ensemble au cycle 0. La première revient aux cycles 3, 6, 9, 12, 15 ; la seconde aux cycles 5, 10, 15 : elles se retrouvent au cycle 15, le plus petit multiple commun de 3 et 5.',
        },
      ],
    },
    {
      aspect: 'histoire',
      title: 'Brian Eno, puis les salles de repos des raves',
      short: 'Nommé par Brian Eno à la fin des années 1970 ; renouveau dans les raves des années 1990',
      hear: `setcpm(20/4)
$: ${DRONE}
$: n("<0 2 4 7 4 2>").scale("C:major").sound("piano").attack(.2).release(4).room(.9).roomsize(8).gain(.4).slow(2)`,
      what:
        'Le mot vient de **Brian Eno**. À la fin des années 1970, dans les notes de son album *Ambient 1: Music for Airports*, il décrit une musique qui doit pouvoir s’écouter de près ou rester en fond, « aussi ignorable qu’intéressante ». L’album superpose des boucles de durées inégales qui se décalent. ' +
        'L’idée a des ancêtres : Erik Satie avait déjà imaginé une « musique d’ameublement », faite pour ne pas être écoutée attentivement. ' +
        'Au début des années 1990, l’ambient revient par les raves : on la joue dans les salles de repos (*chill-out*), et des producteurs de musique électronique comme The Orb ou Aphex Twin (*Selected Ambient Works 85–92*, 1992) la mêlent aux machines.',
      build: [],
      wiki: ['voc.culture.ambient', 'voc.aleatoire.generatif'],
    },
  ],
  assemble: {
    text:
      'Tous les traits ensemble. Lis-le piste par piste : le drone qui ondule, les accords dans un grand espace et doublés pour battre, des notes au hasard dans la gamme, une texture de grains, et deux notes en boucles de 3 et 5 cycles. ' +
      'Laisse-la tourner plusieurs minutes : elle change d’un cycle à l’autre, et pourtant, relancée, elle redonne exactement la même suite. Pour faire taire une piste, ajoute un tiret bas devant son `$:`.',
    code: `setcpm(24/4)

$: note("c2,c3").sound("sawtooth").lpf(sine.range(300, 1200).slow(12)).lpq(3).room(.7).gain(.25)

$: ${PAD.replace('.voicing()', '.voicing().superimpose(x => x.add(note(.1)))').replace('.gain(.3)', '.gain(.22)')}

$: n(irand(8).segment(4)).seed(1).scale("C:minor").sound("triangle")
  .attack(1).release(4).room(.85).orbit(2).gain(.22).degradeBy(.5)

$: sound("space").chop(16).slow(2).delay(.5).delayfeedback(.5).room(.9).orbit(3).gain(.14)

$: note("eb4").sound("sine").attack(1).release(5).room(.8).gain(.18).slow(3)
$: note("g4").sound("sine").attack(1).release(5).room(.8).gain(.18).slow(5)`,
  },
  listen: [
    { artist: 'Brian Eno', track: '1/1 (Ambient 1: Music for Airports)', why: 'des boucles de piano de durées inégales qui se décalent : l’album qui a donné son nom au genre.' },
    { artist: 'Aphex Twin', track: 'Selected Ambient Works 85–92 (album)', why: 'des boîtes à rythmes et des synthés au service d’atmosphères : l’ambient rencontre la musique électronique de club.' },
    { artist: 'Gas', track: 'Königsforst (album)', why: 'un kick étouffé, très loin, sous des boucles brumeuses : l’ambient techno.' },
  ],
};
