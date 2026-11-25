// Genre — House. Forme : voir techno.js.
// Reprend le contenu vérifié des leçons 7.1 à 7.5 (parcours « Autres genres »).

const KICK = 'sound("bd*4").bank("RolandTR909")';
const DRUMS = '$: sound("bd*4, ~ cp ~ cp").bank("RolandTR909")\n$: sound("hh*8").bank("RolandTR909").swing(4).gain(.45)';
const GRILLE = '<Cm7 Ab^7 Bb^7 Cm7>';

export default {
  id: 'house',
  name: 'House',
  family: 'House',
  bpm: [118, 128],
  pitch: 'Le kick sur chaque temps de la techno, mais plus chaud : un clap sur 2 et 4, un charleston qui balance, des accords et des voix.',
  intro:
    'La house descend du disco : la même pulsation régulière faite pour danser, reprise par des boîtes à rythmes et des synthétiseurs bon marché. ' +
    'Là où la techno retire presque tout, la house garde de la chaleur : des accords de septième venus de la soul et du jazz, des voix, un swing qui fait balancer la grille. ' +
    'Les leçons du parcours « Autres genres » construisent ensuite un morceau house complet.',
  traits: [
    {
      aspect: 'tempo',
      title: 'Médium et dansant : 118 à 128 BPM',
      short: '118–128 BPM, souvent autour de 124',
      hear: `setcpm(124/4)
sound("bd*4, ~ cp ~ cp, [~ hh]*4").bank("RolandTR909")`,
      what:
        'La house tourne le plus souvent entre 120 et 126 BPM : un peu plus lent que la techno, au rythme d’une marche rapide. La *deep house* descend vers 118, et au-delà de 128 on glisse vers la techno. Comme en techno, le tempo ne bouge pas pendant un morceau : les DJ enchaînent les disques en calant leurs kicks.' +
        ' En chiffres (voir [tempo](sol.tempo)) : à 124 BPM, un temps dure 0,48 s et une mesure 1,94 s ; à 118 BPM, 0,51 s et 2,03 s ; à 128 BPM, 0,47 s et 1,88 s.',
      build: [
        ['118 BPM : deep house, posée', `setcpm(118/4)\nsound("bd*4, ~ cp ~ cp, [~ hh]*4").bank("RolandTR909")`],
        ['124 BPM : le cœur du genre', `setcpm(124/4)\nsound("bd*4, ~ cp ~ cp, [~ hh]*4").bank("RolandTR909")`],
        ['128 BPM : la frontière avec la techno', `setcpm(128/4)\nsound("bd*4, ~ cp ~ cp, [~ hh]*4").bank("RolandTR909")`],
      ],
      wiki: ['fn.setcpm', 'sol.tempo', 'genre.tempo'],
    },
    {
      aspect: 'kick',
      title: 'Le kick sur chaque temps, le clap sur 2 et 4',
      short: 'Kick sur chaque temps, peu saturé ; clap ou caisse claire sur 2 et 4',
      hear: `setcpm(124/4)
sound("bd*4, ~ cp ~ cp").bank("RolandTR909")`,
      what:
        'Quatre kicks par mesure, un sur chaque temps : le *four on the floor*, comme en techno. La différence tient au son : le kick house est laissé presque tel quel, sans la saturation qui durcit celui de la techno. ' +
        'Au-dessus, un clap (ou une caisse claire) sur les temps 2 et 4 : le *backbeat*, hérité du disco et de la soul. Kick et clap forment le squelette sur lequel tout le reste se pose.' +
        ' Les positions : `~ cp ~ cp` découpe la mesure en 4 cases et place le clap dans la 2ᵉ et la 4ᵉ, aux positions ¼ et ¾ du cycle. À 124 BPM, il tombe 0,48 s après chaque kick des temps 1 et 3.',
      build: [
        ['1. Quatre kicks, sons de la TR-909', `setcpm(124/4)\n${KICK}`],
        ['2. Le clap sur les temps 2 et 4', `setcpm(124/4)\nsound("bd*4, ~ cp ~ cp").bank("RolandTR909")`],
        ['3. Le même squelette sur une TR-808 : autre machine, même rôle', `setcpm(124/4)\nsound("bd*4, ~ cp ~ cp").bank("RolandTR808")`],
      ],
      wiki: ['genre.kick-techno', 'son.batterie', 'fn.bank'],
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ce squelette house. Sur quels temps tombe le clap ?',
          code: `setcpm(124/4)\nsound("bd*4, ~ cp ~ cp").bank("RolandTR909")`,
          choices: ['Sur les temps 2 et 4', 'Sur chaque temps, avec le kick', 'Entre les temps, à contretemps'],
          answer: 0,
          explain: '`~ cp ~ cp` découpe la mesure en 4 cases : le clap occupe la 2ᵉ et la 4ᵉ, soit les temps 2 et 4 (positions ¼ et ¾ du cycle). C’est le *backbeat*, que la house a hérité du disco.',
        },
      ],
    },
    {
      aspect: 'basse',
      title: 'Une basse ronde, qui suit les accords',
      short: 'Ronde, sur les fondamentales des accords, souvent en rythme 3-3-2',
      hear: `setcpm(124/4)
$: ${KICK}
$: note("<c2 c2 ab1 bb1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(800).decay(.25).sustain(0).gain(.7)`,
      what:
        'La basse house ne roule pas comme en techno : elle chante un peu. Elle joue la note qui donne son nom à chaque accord, sa [fondamentale](sol.tonique) : ici do, do, la♭, si♭, une par mesure (65, 65, 52 et 58 Hz). ' +
        'Son rythme est souvent syncopé : trois notes par mesure, aux croches 1, 4 et 7, ce qui découpe la mesure en 3 + 3 + 2 croches. La 1ʳᵉ note tombe avec le kick du 1ᵉʳ temps, la 2ᵉ entre le 2ᵉ et le 3ᵉ temps, la 3ᵉ avec le kick du 4ᵉ temps : la note du milieu, à côté du kick, fait danser.' +
        ' Le motif `struct("x ~ ~ x ~ ~ x ~")` place les notes aux positions 0, ⅜ et ¾ du cycle (voir [struct](fn.struct)). À 124 BPM, une croche dure 0,24 s : 0,73 s entre les deux premières notes, 0,73 s encore, puis 0,48 s jusqu’à la mesure suivante. Le [passe-bas](fx.lpf) à 800 Hz arrondit la dent de scie.',
      build: [
        ['1. Une note par mesure : la fondamentale de chaque accord', `setcpm(124/4)\nnote("<c2 c2 ab1 bb1>").sound("sawtooth").lpf(800)`],
        ['2. En rythme 3-3-2, notes courtes', `setcpm(124/4)\nnote("<c2 c2 ab1 bb1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(800).decay(.25).sustain(0)`],
        ['3. Avec le kick', `setcpm(124/4)\n$: ${KICK}\n$: note("<c2 c2 ab1 bb1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(800).decay(.25).sustain(0).gain(.7)`],
      ],
      wiki: ['fn.struct', 'sol.tonique', 'fx.lpf', 'fx.decay'],
    },
    {
      aspect: 'hats',
      title: 'Le charleston balance : contretemps et swing',
      short: 'Charleston à contretemps ; croches légèrement « swinguées »',
      hear: `setcpm(124/4)
${DRUMS}`,
      what:
        'Comme en techno, le charleston le plus important tombe entre deux kicks, à [contretemps](sol.contretemps). Mais la house le fait **balancer** : le contretemps arrive un peu en retard, comme chez un batteur de disco ou de funk. C’est le [swing](voc.structure.swing).' +
        ' Mesuré dans le moteur : `hh*8` met un charleston au début et au milieu de chaque temps ; `.swing(4)` découpe le cycle en 4 tranches (une par temps) et retarde la seconde moitié de chacune. Le charleston du contretemps passe de la moitié aux deux tiers du temps : à 124 BPM, de 0,24 s à 0,32 s après le kick. Avec `.swing(8)`, chaque charleston est déjà au début de sa tranche, et rien ne bouge.',
      build: [
        ['1. Le charleston à contretemps', `setcpm(124/4)\nsound("bd*4, [~ hh]*4").bank("RolandTR909")`],
        ['2. En croches : un sur le temps, un à contretemps', `setcpm(124/4)\nsound("bd*4").bank("RolandTR909")\n  .stack(sound("hh*8").bank("RolandTR909").gain(.45))`],
        ['3. Le swing : le contretemps recule aux deux tiers du temps', `setcpm(124/4)\nsound("bd*4").bank("RolandTR909")\n  .stack(sound("hh*8").bank("RolandTR909").swing(4).gain(.45))`],
        ['4. Avec le clap', `setcpm(124/4)\n${DRUMS}`],
      ],
      wiki: ['sol.contretemps', 'voc.structure.swing', 'genre.hats', 'voc.structure.humaniser'],
      quiz: [
        {
          type: 'qcm',
          q: 'Dans `sound("hh*8").swing(4)`, où tombe le charleston qui suit le premier kick ?',
          choices: ['Aux deux tiers du premier temps', 'Au milieu du premier temps', 'Sur le deuxième temps'],
          answer: 0,
          explain: '`swing(4)` découpe le cycle en 4 tranches, une par temps, et retarde la seconde moitié de chacune : le 2ᵉ charleston passe de la position ⅛ du cycle (le milieu du temps) à 1/6 (les deux tiers du temps).',
        },
      ],
    },
    {
      aspect: 'harmonie',
      title: 'Des accords de septième',
      short: 'Accords de septième (mineurs et majeurs), venus de la soul et du jazz',
      hear: `setcpm(124/4)
$: ${KICK}
$: chord("${GRILLE}").voicing().struct("x ~ ~ x ~ ~ x ~").sound("piano").gain(.7)`,
      what:
        'La house aime les [accords](sol.accord) de quatre notes : un accord parfait, plus une septième. Ils sonnent plus doux et plus « ouverts » que les accords de trois notes, et viennent de la soul, du gospel et du jazz que les DJ de Chicago passaient avec le disco. ' +
        'Souvent joués au piano, plaqués en rythme comme une percussion.' +
        ' La grille de l’exemple : `Cm7` (do, mi♭, sol, si♭ : do mineur avec sa septième mineure), `Ab^7` (la♭, do, mi♭, sol : septième majeure, écrite `^7`), `Bb^7` (si♭, ré, fa, la), puis `Cm7`. [voicing](fn.voicing) choisit l’octave de chaque note, et en double parfois une : mesuré dans le moteur, `Cm7` sonne si♭3, mi♭4, sol4, si♭4, do5. Le rythme est celui de la basse, 3-3-2.',
      build: [
        ['1. Quatre accords de septième, un par mesure', `setcpm(124/4)\nchord("${GRILLE}").voicing().sound("piano")`],
        ['2. Plaqués en rythme 3-3-2', `setcpm(124/4)\nchord("${GRILLE}").voicing().struct("x ~ ~ x ~ ~ x ~").sound("piano")`],
        ['3. Avec le kick', `setcpm(124/4)\n$: ${KICK}\n$: chord("${GRILLE}").voicing().struct("x ~ ~ x ~ ~ x ~").sound("piano").gain(.7)`],
      ],
      wiki: ['sol.accord', 'fn.chord', 'fn.voicing', 'sol.progression'],
    },
    {
      aspect: 'timbres',
      title: 'Piano, voix hachée, filtres',
      short: 'Piano et orgue, voix découpée (vocal chop), filtres qui s’ouvrent',
      hear: `setcpm(124/4)
$: sound("bd*4, ~ cp").bank("RolandTR909")
$: sound("numbers:3").chop(8).gain(.7).room(.2)
$: chord("${GRILLE}").voicing().sound("sawtooth").lpf(sine.range(400, 3000).slow(8)).attack(.05).release(.3).gain(.3)`,
      what:
        'Les sons de la house viennent du disco et de la soul : piano, orgue, cordes, et surtout la **voix**, souvent découpée en morceaux et rejouée en rythme (le *vocal chop*). La house française des années 1990 a ajouté un geste : un passe-bas qui s’ouvre et se referme lentement sur une boucle.' +
        ' Sans échantillon à toi, la banque `numbers` de Strudel contient des chiffres parlés : `sound("numbers:3")` en joue le n° 3, et `chop(8)` le découpe en 8 tranches jouées dans l’ordre, chacune sur un huitième du pas (voir [chop](fx.chop)). `lpf(sine.range(400, 3000).slow(8))` fait suivre à la coupure une vague de 400 à 3 000 Hz sur 8 mesures (voir [signaux](fn.signaux)).',
      build: [
        ['1. Une voix (un chiffre parlé)', `setcpm(124/4)\nsound("numbers:3").gain(.8)`],
        ['2. Hachée en 8 tranches', `setcpm(124/4)\nsound("numbers:3").chop(8).gain(.8).room(.2)`],
        ['3. Des accords dans un filtre qui s’ouvre sur 8 mesures', `setcpm(124/4)\nchord("${GRILLE}").voicing().sound("sawtooth").lpf(sine.range(400, 3000).slow(8)).attack(.05).release(.3).gain(.4)`],
      ],
      wiki: ['fx.chop', 'fn.signaux', 'fx.lpf', 'son.piano'],
    },
    {
      aspect: 'structure',
      title: 'Des sections pour le DJ',
      short: 'Intro et fin rythmiques pour le mixage ; blocs de 8 ou 16 mesures ; break sans kick',
      hear: `setcpm(124/4)
const kick = sound("bd*4").bank("RolandTR909")
const clap = sound("~ cp ~ cp, hh*8").bank("RolandTR909").gain(.6)
const bass = note("<c2 c2 ab1 bb1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(800).decay(.25).sustain(0).gain(.7)
arrange([2, kick], [2, stack(kick, clap)], [2, stack(clap, bass)], [2, stack(kick, clap, bass)])`,
      what:
        'Un morceau house est fait pour être mixé. Il commence et finit par la batterie seule, pour que le DJ puisse caler son kick sur celui du disque précédent. Entre les deux, des sections de 8 ou 16 mesures : on empile les couches, on coupe le kick quelques mesures (le *break*), puis il revient avec tout le reste. ' +
        'L’exemple tient en 8 mesures pour que tu l’entendes vite ; dans un vrai morceau, chaque section dure 8 ou 16 mesures, soit 15,5 ou 31 s à 124 BPM.' +
        ' [arrange](fn.arrange) joue chaque motif pendant le nombre de mesures indiqué, l’un après l’autre, puis recommence : `arrange([2, kick], [2, stack(kick, clap)], …)` dure ici 2 + 2 + 2 + 2 = 8 mesures.',
      build: [
        ['1. L’intro : le kick seul, pour le mixage', `setcpm(124/4)\nconst kick = sound("bd*4").bank("RolandTR909")\nconst clap = sound("~ cp ~ cp, hh*8").bank("RolandTR909").gain(.6)\narrange([2, kick], [2, stack(kick, clap)])`],
        ['2. Le break : plus de kick, la basse seule avec le clap', `setcpm(124/4)\nconst kick = sound("bd*4").bank("RolandTR909")\nconst clap = sound("~ cp ~ cp, hh*8").bank("RolandTR909").gain(.6)\nconst bass = note("<c2 c2 ab1 bb1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(800).decay(.25).sustain(0).gain(.7)\narrange([2, stack(kick, clap)], [2, stack(clap, bass)])`],
        ['3. Le retour du kick, avec tout le reste', `setcpm(124/4)\nconst kick = sound("bd*4").bank("RolandTR909")\nconst clap = sound("~ cp ~ cp, hh*8").bank("RolandTR909").gain(.6)\nconst bass = note("<c2 c2 ab1 bb1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(800).decay(.25).sustain(0).gain(.7)\narrange([2, kick], [2, stack(kick, clap)], [2, stack(clap, bass)], [2, stack(kick, clap, bass)])`],
      ],
      wiki: ['fn.arrange', 'fn.stack', 'js.const', 'genre.structure'],
    },
    {
      aspect: 'histoire',
      title: 'Chicago, années 1980',
      short: 'Chicago, début des années 1980 ; Royaume-Uni à la fin de la décennie',
      hear: `setcpm(120/4)
$: sound("bd*4, ~ cp ~ cp, [~ oh]*4").bank("RolandTR808").gain(.8)
$: note("<[c2 c3]*4 [bb1 bb2]*4>").sound("sawtooth").lpf(900).decay(.15).sustain(0).gain(.6)
$: chord("<Cm7 Bb^7>").voicing().struct("~ x ~ ~ ~ x ~ ~").sound("piano").gain(.6)`,
      what:
        'La house naît à **Chicago** au début des années 1980, quand le disco disparaît des radios. Dans les clubs, les DJ continuent de le passer, en le prolongeant et en y ajoutant des boîtes à rythmes. ' +
        'Le nom viendrait du **Warehouse**, le club où Frankie Knuckles était le DJ résident : les disquaires y auraient rangé ce qu’il jouait sous l’étiquette « as heard at the Warehouse », bientôt réduite à « house ». L’origine du mot reste discutée. ' +
        'Au milieu de la décennie, des producteurs locaux enregistrent leurs propres morceaux avec des Roland TR-808 et TR-909 ; *On and On* de Jesse Saunders et Vince Lawrence (1984) est souvent cité comme le premier. ' +
        'À la fin des années 1980, la house traverse l’Atlantique et déclenche au Royaume-Uni la vague de l’*acid house* (voir [acid](genre.basse-acid)).',
      build: [],
      wiki: ['voc.culture.house', 'fn.bank'],
    },
  ],
  assemble: {
    text:
      'Tous les traits ensemble, sur 16 mesures. Lis-le piste par piste : le kick et le clap, le charleston qui balance, la basse en 3-3-2, les accords de septième au piano, la voix hachée qui entre à la 9ᵉ mesure, et un break sans kick aux mesures 7 et 8. ' +
      'Pour faire taire une piste, ajoute un tiret bas devant son `$:` (ça donne `_$:`).',
    code: `setcpm(124/4)

$: sound("bd*4").bank("RolandTR909").mask("<1!6 0 0 1!8>")

$: sound("~ cp ~ cp").bank("RolandTR909").gain(.7)

$: sound("hh*8").bank("RolandTR909").swing(4).gain(.4).mask("<0 0 1!14>")

$: note("<c2 c2 ab1 bb1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth")
  .lpf(800).decay(.25).sustain(0).gain(.7).mask("<0!4 1!12>")

$: chord("${GRILLE}").voicing().struct("x ~ ~ x ~ ~ x ~").sound("piano").gain(.55)

$: sound("numbers:3").chop(8).gain(.5).room(.3).mask("<0!8 1!8>")`,
  },
  listen: [
    { artist: 'Frankie Knuckles et Jamie Principle', track: 'Your Love', why: 'une ligne de synthé qui tourne en boucle sur un kick régulier : tout le morceau repose sur elle.' },
    { artist: 'Mr. Fingers (Larry Heard)', track: 'Can You Feel It', why: 'une basse ronde et des accords de synthé, presque rien d’autre : la house « profonde » (*deep house*).' },
    { artist: 'Stardust', track: 'Music Sounds Better With You', why: 'une boucle de disco dans un filtre qui s’ouvre et se ferme : le geste de la house française de la fin des années 1990.' },
  ],
};
