// Genre — Trance. Forme : voir techno.js.

const BPM = 'setcpm(138/4)';
const KICK = '$: sound("bd*4").bank("RolandTR909")';
const GRILLE = 'const grille = chord("<Am F C G>")';

export default {
  id: 'trance',
  name: 'Trance',
  family: 'Trance et Progressive',
  bpm: [130, 142],
  pitch: 'De grands accords, une mélodie qui s’élève, et une construction pensée pour un seul moment : celui où tout revient.',
  intro:
    'La trance cherche l’émotion, là où la techno cherche l’hypnose. Elle garde le kick régulier de la techno, mais y ajoute ce que la techno refuse : ' +
    'une vraie suite d’accords, une mélodie qu’on retient, et une mise en scène — on retire tout, on fait monter la tension, on relâche.',
  traits: [
    {
      aspect: 'tempo',
      title: 'Rapide et porteur : 130 à 142 BPM',
      short: '130–142 BPM, souvent 138',
      hear: `${BPM}
sound("bd*4, [~ oh]*4").bank("RolandTR909")`,
      what:
        'Un peu plus rapide que la techno classique. Le tempo le plus associé au genre est 138 BPM : assez vif pour porter les mélodies, sans les brusquer.',
      build: [
        ['132 BPM : le bas de la fourchette', `setcpm(132/4)\nsound("bd*4, [~ oh]*4").bank("RolandTR909")`],
        ['138 BPM : le tempo emblématique', `setcpm(138/4)\nsound("bd*4, [~ oh]*4").bank("RolandTR909")`],
      ],
      wiki: ['fn.setcpm', 'sol.tempo'],
    },
    {
      aspect: 'kick',
      title: 'Un kick net, qui fait pomper tout le reste',
      short: 'Sur chaque temps, net et peu saturé ; à chaque coup, les autres pistes s’effacent un instant (le « pompage »)',
      hear: `${BPM}
$: sound("bd*4").bank("RolandTR909").duck(2).duckattack(.2).duckdepth(1)
$: note("[a2,c3,e3]").sound("supersaw").lpf(2000).gain(.6).orbit(2)`,
      what:
        'Toujours quatre coups par mesure, mais le kick trance est propre : une attaque nette, un grave court, presque pas de saturation. ' +
        'Sa signature est ailleurs : à chaque coup, le volume des accords et de la basse **plonge** puis remonte. On appelle ça le *sidechain*, ou « pompage ». ' +
        'Écoute l’accord tenu : il respire au rythme du kick.',
      build: [
        ['1. Le kick seul', `${BPM}\nsound("bd*4").bank("RolandTR909")`],
        ['2. Un accord tenu par-dessus : tout se mélange', `${BPM}\n$: sound("bd*4").bank("RolandTR909")\n$: note("[a2,c3,e3]").sound("supersaw").lpf(2000).gain(.6)`],
        ['3. Le sidechain : l’accord s’écarte à chaque coup', `${BPM}\n$: sound("bd*4").bank("RolandTR909").duck(2).duckattack(.2).duckdepth(1)\n$: note("[a2,c3,e3]").sound("supersaw").lpf(2000).gain(.6).orbit(2)`],
      ],
      wiki: ['genre.sidechain', 'fx.duck', 'fx.orbit'],
    },
    {
      aspect: 'basse',
      title: 'La basse à contretemps',
      short: 'Entre les kicks (contretemps) ou en doubles-croches ; elle suit les accords',
      hear: `${BPM}
${GRILLE}
${KICK}
$: grille.rootNotes(1).struct("[~ x]*4").sound("sawtooth").lpf(500).decay(.15).sustain(0)`,
      what:
        'La basse trance joue **entre** les kicks : « boum-BA-boum-BA ». Kick et basse alternent comme deux mains sur un tambour, ce qui donne un galop régulier. ' +
        'Contrairement à la techno, elle **change de note avec les accords** : elle joue la fondamentale de chacun.',
      build: [
        ['1. Une note entre chaque kick', `${BPM}\n${KICK}\n$: note("[~ a1]*4").sound("sawtooth").lpf(500).decay(.15).sustain(0)`],
        ['2. Elle suit la grille d’accords', `${BPM}\n${GRILLE}\n${KICK}\n$: grille.rootNotes(1).struct("[~ x]*4").sound("sawtooth").lpf(500).decay(.15).sustain(0)`],
        ['3. Variante « galop » : trois notes entre chaque kick', `${BPM}\n${GRILLE}\n${KICK}\n$: grille.rootNotes(1).struct("[~ x x x]*4").sound("sawtooth").lpf(500).decay(.1).sustain(0)`],
      ],
      wiki: ['sol.contretemps', 'fn.rootNotes', 'fn.struct', 'fn.chord'],
    },
    {
      aspect: 'hats',
      title: 'Contretemps, clap, et roulements',
      short: 'Charleston ouvert à contretemps, clap sur 2 et 4, roulement de caisse claire avant les temps forts',
      hear: `${BPM}
$: sound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.8)
$: sound("hh*16").bank("RolandTR909").gain("[.3 .15 .25 .15]*4")`,
      what:
        'La base est celle de la techno et de la house : charleston ouvert entre les temps, clap sur 2 et 4. La particularité trance, c’est le **roulement de caisse claire** : ' +
        'des coups de plus en plus serrés (4, puis 8, puis 16 par mesure) qui annoncent le retour du kick.',
      build: [
        ['1. Kick, contretemps, clap', `${BPM}\nsound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.8)`],
        ['2. Charleston fermé en doubles-croches', `${BPM}\n$: sound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.8)\n$: sound("hh*16").bank("RolandTR909").gain("[.3 .15 .25 .15]*4")`],
        ['3. Le roulement : de plus en plus serré sur 4 mesures', `${BPM}\nsound("sd*<4 8 16 32>").bank("RolandTR909").gain(saw.range(.3, .8).slow(4))`],
      ],
      wiki: ['sol.contretemps', 'genre.hats', 'mini.chevrons', 'fn.signaux'],
    },
    {
      aspect: 'harmonie',
      title: 'Quatre accords en mineur, qui tournent',
      short: 'Mineur ; quatre accords qui tournent en boucle ; une mélodie qu’on retient',
      hear: `${BPM}
chord("<Am F C G>").voicing().sound("supersaw").lpf(2500).room(.5).gain(.5)`,
      what:
        'C’est ici que la trance s’éloigne le plus de la techno. Elle repose sur une **suite d’accords**, presque toujours en mineur, qui change à chaque mesure ou toutes les deux mesures. ' +
        'La plus courante part de l’accord mineur de la tonalité et enchaîne trois accords majeurs : ici la mineur, fa, do, sol. Elle donne cette impression d’élan qui ne retombe jamais.',
      build: [
        ['1. La grille, au piano pour bien l’entendre', `setcpm(138/4)\nchord("<Am F C G>").voicing().sound("piano")`],
        ['2. La même, écrite avec les marches de la gamme', `setcpm(138/4)\nn("<[0,2,4] [-2,0,2] [2,4,6] [-1,1,3]>").scale("A3:minor").sound("piano")`],
        ['3. Une mélodie dans la même gamme', `setcpm(138/4)\n$: chord("<Am F C G>").voicing().sound("piano").gain(.6)\n$: n("<[4 ~ 4 2] [2 ~ 2 0] [4 ~ 4 6] [4 ~ 2 1]>").scale("A4:minor").sound("triangle").room(.4)`],
        ['4. Une autre grille courante : même famille, autre ordre', `setcpm(138/4)\nchord("<F G Am Am>").voicing().sound("piano")`],
      ],
      wiki: ['sol.progression', 'sol.mineur', 'fn.chord', 'fn.scale'],
    },
    {
      aspect: 'timbres',
      title: 'Supersaw, arpèges et accords hachés',
      short: 'Accords larges et brillants (plusieurs dents de scie désaccordées), arpèges rapides avec écho, accords hachés en rythme',
      hear: `${BPM}
chord("<Am F C G>").voicing().arp("[0 2 1 3 2 3 1 2]*2")
  .sound("sawtooth").lpf(2500).decay(.12).sustain(0)
  .delay(.4).delaysync(3/16).delayfeedback(.5).room(.3)`,
      what:
        'Trois sons font la trance. Le **supersaw** : plusieurs ondes en dent de scie légèrement désaccordées, pour des accords larges et brillants. ' +
        'L’**arpège pincé** : les notes de l’accord égrenées très vite, avec un écho calé sur le tempo. ' +
        'Et le **gate** : un accord tenu, haché par un rythme, comme si on ouvrait et fermait une porte.',
      build: [
        ['1. Supersaw : un accord large', `${BPM}\nchord("<Am F C G>").voicing().sound("supersaw").lpf(2500).room(.5).gain(.5)`],
        ['2. Arpège : les notes une à une, en doubles-croches', `${BPM}\nchord("<Am F C G>").voicing().arp("[0 2 1 3 2 3 1 2]*2").sound("sawtooth").lpf(2500).decay(.12).sustain(0)`],
        ['3. Avec un écho en rythme', `${BPM}\nchord("<Am F C G>").voicing().arp("[0 2 1 3 2 3 1 2]*2").sound("sawtooth").lpf(2500).decay(.12).sustain(0).delay(.4).delaysync(3/16).delayfeedback(.5).room(.3)`],
        ['4. Gate : l’accord haché par un rythme', `${BPM}\nchord("<Am F C G>").voicing().struct("x x ~ x x ~ x ~ x x ~ x x ~ x x").sound("supersaw").lpf(3000).clip(.6).gain(.5)`],
      ],
      wiki: ['son.supersaw', 'genre.supersaw', 'genre.arpege-trance', 'fn.arp', 'fx.delay'],
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute. Les notes de l’accord arrivent-elles ensemble ou une par une ?',
          code: `setcpm(138/4)\nchord("<Am F>").voicing().arp("[0 2 1 3 2 3 1 2]*2").sound("sawtooth").lpf(2500).decay(.12).sustain(0)`,
          choices: ['Une par une : c’est un arpège', 'Ensemble : c’est un accord plaqué'],
          answer: 0,
          explain: 'Les notes de l’accord sont égrenées très vite : l’arpège pincé, signature de la trance.',
        },
      ],
    },
    {
      aspect: 'structure',
      title: 'Breakdown, montée, retour',
      short: 'Pause sans batterie → montée de tension (roulement, souffle, filtre) → tout revient d’un coup',
      hear: `${BPM}
${GRILLE}
$: sound("bd*4, [~ oh]*4").bank("RolandTR909").mask("<0!4 1!4>")
$: sound("sd*<4 8 16 32>").bank("RolandTR909").gain(saw.range(.2, .7).slow(4)).mask("<1!4 0!4>")
$: sound("white").lpf(saw.range(300, 9000).slow(4)).gain(.2).mask("<1!4 0!4>")
$: grille.voicing().sound("supersaw").lpf("<800 1200 1800 2600 3200!4>").room(.5).gain(.45)
$: grille.rootNotes(1).struct("[~ x]*4").sound("sawtooth").lpf(500).decay(.15).sustain(0).mask("<0!4 1!4>")`,
      what:
        'Un morceau de trance est bâti autour d’un moment. D’abord le **breakdown** : la batterie se tait, il ne reste que les accords et la mélodie. ' +
        'Puis la **montée** (*build-up*) : un roulement de caisse claire qui se resserre, un souffle de bruit qui s’élève, un filtre qui s’ouvre. ' +
        'Enfin le **retour** (*drop*) : le kick et la basse reviennent d’un coup, avec tout le reste. L’exemple compresse cela en 8 mesures : 4 de montée, 4 de retour.',
      build: [
        ['1. Le breakdown : accords seuls, filtre fermé', `${BPM}\nchord("<Am F C G>").voicing().sound("supersaw").lpf(800).room(.5).gain(.45)`],
        ['2. La montée : le filtre s’ouvre, le roulement se resserre', `${BPM}\n$: chord("<Am F C G>").voicing().sound("supersaw").lpf("<800 1200 1800 2600>").room(.5).gain(.45)\n$: sound("sd*<4 8 16 32>").bank("RolandTR909").gain(saw.range(.2, .7).slow(4))`],
        ['3. Plus un souffle qui s’élève', `${BPM}\n$: chord("<Am F C G>").voicing().sound("supersaw").lpf("<800 1200 1800 2600>").room(.5).gain(.45)\n$: sound("sd*<4 8 16 32>").bank("RolandTR909").gain(saw.range(.2, .7).slow(4))\n$: sound("white").lpf(saw.range(300, 9000).slow(4)).gain(.2)`],
        ['4. Montée puis retour, en boucle de 8 mesures', `${BPM}\n${GRILLE}\n$: sound("bd*4, [~ oh]*4").bank("RolandTR909").mask("<0!4 1!4>")\n$: sound("sd*<4 8 16 32>").bank("RolandTR909").gain(saw.range(.2, .7).slow(4)).mask("<1!4 0!4>")\n$: sound("white").lpf(saw.range(300, 9000).slow(4)).gain(.2).mask("<1!4 0!4>")\n$: grille.voicing().sound("supersaw").lpf("<800 1200 1800 2600 3200!4>").room(.5).gain(.45)\n$: grille.rootNotes(1).struct("[~ x]*4").sound("sawtooth").lpf(500).decay(.15).sustain(0).mask("<0!4 1!4>")`],
      ],
      wiki: ['genre.structure', 'fn.mask', 'son.bruit', 'fn.signaux'],
    },
    {
      aspect: 'histoire',
      title: 'L’Allemagne du début des années 1990, puis le monde',
      short: 'Allemagne, début des années 1990 ; essor mondial à la fin de la décennie',
      hear: `setcpm(136/4)
$: sound("bd*4, [~ oh]*4").bank("RolandTR909").gain(.8)
$: n("0 2 4 7 4 2 0 2").scale("A3:minor").sound("sawtooth").lpf(sine.range(500, 2500).slow(8)).lpq(6).decay(.15).sustain(0).delay(.4).delaysync(3/16)`,
      what:
        'La trance apparaît en **Allemagne** au tout début des années 1990, notamment à Francfort, comme une version plus mélodique et plus planante de la techno. ' +
        'Le titre « The Age of Love » (1990) est souvent cité parmi ses premiers jalons. ' +
        'À la fin de la décennie, des DJ néerlandais et britanniques en font une musique de stades. Le son *supersaw* qui la caractérise vient d’un synthétiseur sorti en 1996, le Roland JP-8000. ' +
        'L’exemple ci-dessus évoque les débuts : un motif répété et un filtre qui bouge, encore très proche de la techno.',
      build: [],
      wiki: ['son.supersaw', 'genre.supersaw'],
    },
  ],
  assemble: {
    text:
      'Les huit traits réunis, sur une boucle de 16 mesures : 4 sans batterie, 4 de montée, 8 de retour. ' +
      'Change la grille (`<Am F C G>`) : la basse, les accords et l’arpège suivent ensemble.',
    code: `setcpm(138/4)

const grille = chord("<Am F C G>")

$: sound("bd*4").bank("RolandTR909").duck(2).duckattack(.2).duckdepth(.8)
  .mask("<0!8 1!8>")

$: sound("[~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.5).mask("<0!8 1!8>")

$: sound("sd*<4 8 16 32>").bank("RolandTR909").gain(saw.range(.2, .7).slow(4))
  .mask("<0!4 1!4 0!8>")

$: grille.rootNotes(1).struct("[~ x]*4").sound("sawtooth").lpf(500).decay(.15).sustain(0)
  .mask("<0!8 1!8>").orbit(2)

$: grille.voicing().sound("supersaw").lpf("<700!4 1000 1500 2200 3000 3200!8>")
  .room(.5).gain(.4).orbit(2)

$: grille.voicing().arp("[0 2 1 3 2 3 1 2]*2").sound("sawtooth")
  .lpf(2500).decay(.12).sustain(0).delay(.4).delaysync(3/16).delayfeedback(.5)
  .gain(.5).mask("<1!4 0!4 1!8>")`,
  },
  listen: [
    { artist: 'Age of Love', track: 'The Age of Love', why: 'un des premiers jalons du genre : la techno qui se met à planer.' },
    { artist: 'Paul van Dyk', track: 'For an Angel', why: 'la mélodie au premier plan, et la construction breakdown–montée–retour très lisible.' },
    { artist: 'Rank 1', track: 'Airwave', why: 'les accords supersaw et le long breakdown : le son de la trance de la fin des années 1990.' },
  ],
};
