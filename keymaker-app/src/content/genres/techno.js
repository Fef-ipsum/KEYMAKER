// Genre — Techno.
//
// Forme d'un genre (identique pour tous) :
//   id, name, family, bpm: [min, max], pitch (une phrase), intro
//   traits : huit traits, toujours dans le même ordre (voir ASPECTS dans index.js)
//     aspect  : 'tempo' | 'kick' | 'basse' | 'hats' | 'harmonie' | 'timbres' | 'structure' | 'histoire'
//     title   : le trait en quelques mots
//     short   : une ligne pour le comparateur
//     hear    : code à écouter d'abord
//     what    : ce qui rend ce trait reconnaissable (comprendre)
//     build   : [[étape, code]] — on reconstruit en ajoutant un réglage à la fois
//     wiki    : entrées liées
//   assemble : { text, code } — les traits empilés
//   listen   : repères d'écoute (artistes et morceaux réels, pour l'oreille)
//
// Tous les exemples sont des créations originales « dans le style ».

const KICK = 'sound("bd*4").bank("RolandTR909")';

export default {
  id: 'techno',
  name: 'Techno',
  family: 'Techno et Acid',
  bpm: [125, 150],
  pitch: 'Un kick qui ne s’arrête jamais, très peu de notes, et une tension qui monte par petites touches.',
  intro:
    'La techno repose sur une idée simple : la répétition hypnotise, et un petit changement dans une boucle qui dure devient un événement. ' +
    'Peu d’éléments, choisis avec soin. Presque pas de mélodie. Tout se joue dans le son du kick, le grain des machines et la façon dont les pistes entrent et sortent.',
  traits: [
    {
      aspect: 'tempo',
      title: 'Rapide et régulier : 125 à 150 BPM',
      short: '125–150 BPM, souvent 130–140',
      hear: `setcpm(135/4)
${KICK}`,
      what:
        'Assez rapide pour porter le corps, assez régulier pour qu’on l’oublie. La techno « classique » tourne autour de 130 à 135 BPM ; ' +
        'les styles durs montent à 145 et au-delà. Le tempo ne varie jamais à l’intérieur d’un morceau : c’est ce qui permet aux DJ d’enchaîner les disques.',
      build: [
        ['128 BPM : la limite basse, proche de la house', `setcpm(128/4)\n${KICK}`],
        ['135 BPM : le cœur du genre', `setcpm(135/4)\n${KICK}`],
        ['145 BPM : techno dure', `setcpm(145/4)\n${KICK}`],
      ],
      wiki: ['fn.setcpm', 'sol.tempo'],
    },
    {
      aspect: 'kick',
      title: 'Le kick : sec, lourd, sur chaque temps',
      short: 'Sur chaque temps, lourd, saturé, souvent suivi d’une traînée grave',
      hear: `setcpm(135/4)
sound("bd*4").bank("RolandTR909").distort(1.5).gain(.9)`,
      what:
        'Quatre coups par mesure, un sur chaque temps : on dit *four on the floor*. Le kick techno a trois qualités. ' +
        'Une **attaque nette** (le « clic » qui perce). Un **corps grave et court** (le « boum »). Et du **grain** : une saturation qui le durcit. ' +
        'Dans la techno moderne, on lui ajoute souvent une *rumble* : une traînée grave et sourde qui remplit l’espace entre deux coups.',
      build: [
        ['1. Quatre coups, sons de la TR-909', `setcpm(135/4)\nsound("bd*4").bank("RolandTR909")`],
        ['2. On le durcit : saturation', `setcpm(135/4)\nsound("bd*4").bank("RolandTR909").distort(2).gain(.8)`],
        [
          '3. Ou on le fabrique : une onde grave dont la hauteur chute très vite',
          `setcpm(135/4)\nnote("c1*4").sound("sine").penv(36).pdecay(.05).decay(.3).sustain(0).distort(1)`,
        ],
        [
          '4. La rumble : une copie sourde et réverbérée, qui s’efface à chaque coup',
          `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909").lpf(120).room(.9).size(3).roomlp(300).gain(.7).orbit(2)\n$: sound("bd*4").bank("RolandTR909").distort(1.5).duck(2).duckattack(.15).duckdepth(1)`,
        ],
      ],
      wiki: ['genre.kick-techno', 'fx.distort', 'fx.penv', 'fx.duck', 'son.batterie'],
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ce rythme. Où tombe la grosse caisse ?',
          code: `setcpm(135/4)\nsound("bd*4, [~ oh]*4").bank("RolandTR909")`,
          choices: ['Sur chaque temps (four on the floor)', 'Sur les temps 1 et 3 seulement', 'Entre les temps'],
          answer: 0,
          explain: 'Quatre kicks par mesure, un par temps : c’est la signature de la techno, de la house et de la trance.',
        },
      ],
    },
    {
      aspect: 'basse',
      title: 'La basse : une seule note, qui roule',
      short: 'Une seule note, en doubles-croches entre les kicks : elle « roule »',
      hear: `setcpm(135/4)
$: sound("bd*4").bank("RolandTR909")
$: note("[~ c1 c1 c1]*4").sound("sawtooth").lpf(300).decay(.1).sustain(0).gain(.9)`,
      what:
        'La basse techno ne chante pas : elle pousse. Souvent une seule note, très grave, jouée sur les trois doubles-croches qui suivent chaque kick. ' +
        'Le kick prend le premier quart du temps, la basse les trois autres : les deux ne se marchent jamais dessus, et l’ensemble « roule ».',
      build: [
        ['1. Une note grave, 16 fois par mesure', `setcpm(135/4)\nnote("c1*16").sound("sawtooth").lpf(300)`],
        ['2. On laisse la place au kick : silence sur chaque temps', `setcpm(135/4)\nnote("[~ c1 c1 c1]*4").sound("sawtooth").lpf(300)`],
        ['3. Des notes courtes et pincées', `setcpm(135/4)\nnote("[~ c1 c1 c1]*4").sound("sawtooth").lpf(300).decay(.1).sustain(0)`],
        ['4. Avec le kick', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: note("[~ c1 c1 c1]*4").sound("sawtooth").lpf(300).decay(.1).sustain(0).gain(.9)`],
        ['5. Un accent qui change tout : la dernière note monte', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: note("[~ c1 c1 <c1 eb1>]*4").sound("sawtooth").lpf(300).decay(.1).sustain(0).gain(.9)`],
      ],
      wiki: ['fx.lpf', 'fx.decay', 'mini.crochets', 'mini.silence'],
    },
    {
      aspect: 'hats',
      title: 'Charleston ouvert à contretemps',
      short: 'Charleston ouvert entre les temps ; fermé en doubles-croches ; clap discret',
      hear: `setcpm(135/4)
$: sound("bd*4").bank("RolandTR909")
$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)
$: sound("hh*16").bank("RolandTR909").gain("[.25 .15 .35 .15]*4")`,
      what:
        'Le charleston ouvert tombe exactement entre deux kicks : « boum-tss-boum-tss ». C’est lui qui donne l’élan. ' +
        'Par-dessus, un charleston fermé en doubles-croches, très bas dans le mix, avec de petits accents. Le clap sur les temps 2 et 4 est facultatif, et souvent absent.',
      build: [
        ['1. Kick et charleston ouvert à contretemps', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)`],
        ['2. Charleston fermé, 16 par mesure, très doux', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)\n$: sound("hh*16").bank("RolandTR909").gain(.2)`],
        ['3. Des accents : le groove apparaît', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)\n$: sound("hh*16").bank("RolandTR909").gain("[.25 .15 .35 .15]*4")`],
        ['4. Une cymbale ride pour ouvrir le haut', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)\n$: sound("hh*16").bank("RolandTR909").gain("[.25 .15 .35 .15]*4")\n$: sound("rd*8").bank("RolandTR909").gain(.25).hpf(5000)`],
      ],
      wiki: ['sol.contretemps', 'genre.hats', 'fx.gain', 'son.batterie'],
    },
    {
      aspect: 'harmonie',
      title: 'Presque pas d’harmonie',
      short: 'Mineur, une ou deux notes ; au plus un accord court, répété comme une percussion',
      hear: `setcpm(135/4)
$: sound("bd*4").bank("RolandTR909")
$: note("[c3,eb3,g3]").struct("~ x ~ ~ ~ x ~ ~").sound("sawtooth").lpf(1400).decay(.12).sustain(0).delay(.5).delaysync(3/16).delayfeedback(.5).gain(.5)`,
      what:
        'Pas de suite d’accords, pas de refrain. La techno reste sur une note-maison, presque toujours en mineur. ' +
        'Quand il y a un accord, c’est un seul, court et répété, qu’on appelle un *stab* : il fonctionne comme une percussion. Son écho fait le reste.',
      build: [
        ['1. Un seul accord mineur', `note("[c3,eb3,g3]").sound("sawtooth").lpf(1400)`],
        ['2. Très court : un stab', `note("[c3,eb3,g3]").sound("sawtooth").lpf(1400).decay(.12).sustain(0)`],
        ['3. Placé à contretemps', `setcpm(135/4)\nnote("[c3,eb3,g3]").struct("~ x ~ ~ ~ x ~ ~").sound("sawtooth").lpf(1400).decay(.12).sustain(0)`],
        ['4. Avec un écho calé sur le tempo', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: note("[c3,eb3,g3]").struct("~ x ~ ~ ~ x ~ ~").sound("sawtooth").lpf(1400).decay(.12).sustain(0).delay(.5).delaysync(3/16).delayfeedback(.5).gain(.5)`],
      ],
      wiki: ['sol.accord', 'sol.mineur', 'fn.struct', 'fx.delay'],
    },
    {
      aspect: 'timbres',
      title: 'Des machines, du grain, des filtres qui bougent',
      short: 'Boîtes à rythmes (TR-909), saturation, filtres en mouvement, écho et réverbération',
      hear: `setcpm(135/4)
$: sound("bd*4").bank("RolandTR909").distort(1)
$: note("c2*16").sound("sawtooth").lpf(sine.range(200, 1800).slow(8)).lpq(10).decay(.08).sustain(0).gain(.6)`,
      what:
        'La palette est étroite : une boîte à rythmes (la Roland TR-909 est la référence), un ou deux synthétiseurs, et des effets joués comme des instruments. ' +
        'Le geste central est le **filtre qui s’ouvre lentement** : la même note, de plus en plus brillante, sur huit ou seize mesures. La saturation donne le grain.',
      build: [
        ['1. Une note répétée, sèche', `setcpm(135/4)\nnote("c2*16").sound("sawtooth").lpf(400).decay(.08).sustain(0)`],
        ['2. Le filtre respire sur 8 mesures', `setcpm(135/4)\nnote("c2*16").sound("sawtooth").lpf(sine.range(200, 1800).slow(8)).decay(.08).sustain(0)`],
        ['3. De la résonance : le filtre chante', `setcpm(135/4)\nnote("c2*16").sound("sawtooth").lpf(sine.range(200, 1800).slow(8)).lpq(10).decay(.08).sustain(0).gain(.6)`],
        ['4. Un souffle de bruit qui monte', `setcpm(135/4)\nsound("white").lpf(saw.range(200, 9000).slow(8)).gain(.25)`],
      ],
      wiki: ['fn.signaux', 'fx.lpf', 'fx.lpq', 'fx.distort', 'son.bruit'],
    },
    {
      aspect: 'structure',
      title: 'On ajoute, on retire, on fait attendre',
      short: 'Blocs de 16 ou 32 mesures ; on ajoute ou retire des pistes ; une pause sans kick, puis il revient',
      hear: `setcpm(135/4)
$: sound("bd*4").bank("RolandTR909").mask("<1!6 0 0>")
$: sound("[~ oh]*4").bank("RolandTR909").gain(.5).mask("<0 0 1!6>")
$: note("[~ c1 c1 c1]*4").sound("sawtooth").lpf(300).decay(.1).sustain(0).mask("<0!4 1!4>")`,
      what:
        'Il n’y a ni couplet ni refrain. Un morceau de techno est une longue courbe : on **ajoute** une piste toutes les 8 ou 16 mesures, on en **retire** une, ' +
        'on **coupe le kick** quelques mesures (le *break*), puis on le fait revenir. Ce retour est le moment fort. ' +
        'L’exemple tient en 8 mesures pour que tu l’entendes vite ; dans un vrai morceau, chaque bloc dure 16 ou 32 mesures.',
      build: [
        ['1. Le charleston entre à la 3ᵉ mesure', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5).mask("<0 0 1!6>")`],
        ['2. La basse entre à la 5ᵉ', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5).mask("<0 0 1!6>")\n$: note("[~ c1 c1 c1]*4").sound("sawtooth").lpf(300).decay(.1).sustain(0).mask("<0!4 1!4>")`],
        ['3. Le break : plus de kick pendant 2 mesures, puis il revient', `setcpm(135/4)\n$: sound("bd*4").bank("RolandTR909").mask("<1!6 0 0>")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5).mask("<0 0 1!6>")\n$: note("[~ c1 c1 c1]*4").sound("sawtooth").lpf(300).decay(.1).sustain(0).mask("<0!4 1!4>")`],
      ],
      wiki: ['fn.mask', 'genre.structure', 'mini.exclamation'],
    },
    {
      aspect: 'histoire',
      title: 'Detroit, puis Berlin',
      short: 'Detroit, milieu des années 1980 ; Berlin après 1989',
      hear: `setcpm(130/4)
$: sound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.8)
$: note("[c3,eb3,g3,bb3]").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(1800).decay(.15).sustain(0).room(.3).gain(.4)`,
      what:
        'La techno naît à **Detroit** au milieu des années 1980, autour de trois amis du lycée de Belleville, une petite ville à une cinquantaine de kilomètres de Detroit : Juan Atkins, Derrick May et Kevin Saunderson.' +
        'Ils mélangent le funk, la musique électronique européenne (Kraftwerk) et les nouvelles boîtes à rythmes japonaises. ' +
        'Après la chute du Mur, en 1989, **Berlin** adopte cette musique dans ses bâtiments abandonnés ; elle y devient plus dure, plus répétitive. ' +
        'L’exemple ci-dessus évoque la première époque : accords de synthé et clap bien présents.',
      build: [],
      wiki: ['fn.bank', 'genre.kick-techno'],
    },
  ],
  assemble: {
    text:
      'Tous les traits ensemble. Lis-le piste par piste : le kick et sa saturation, la basse qui roule entre les coups, le charleston à contretemps, ' +
      'un accord court avec son écho, et une structure en 16 mesures avec une pause sans kick. Pour faire taire une piste, ajoute un tiret bas devant son `$:` (ça donne `_$:`) : compare avec et sans.',
    code: `setcpm(135/4)

$: sound("bd*4").bank("RolandTR909").distort(1.2).mask("<1!14 0 0>")

$: note("[~ c1 c1 <c1 eb1>]*4").sound("sawtooth").lpf(320).decay(.1).sustain(0).gain(.9)
  .mask("<0!4 1!12>")

$: sound("[~ oh]*4").bank("RolandTR909").gain(.45).mask("<0 0 1!14>")

$: sound("hh*16").bank("RolandTR909").gain("[.25 .15 .35 .15]*4").mask("<0!8 1!8>")

$: note("[c3,eb3,g3]").struct("~ x ~ ~ ~ x ~ ~").sound("sawtooth")
  .lpf(sine.range(600, 2400).slow(16)).decay(.12).sustain(0)
  .delay(.5).delaysync(3/16).delayfeedback(.5).gain(.4)
  .mask("<0!8 1!8>")`,
  },
  listen: [
    { artist: 'Jeff Mills', track: 'The Bells', why: 'un motif de quelques notes, répété, que les filtres et les entrées de pistes suffisent à faire vivre.' },
    { artist: 'Plastikman', track: 'Spastik', why: 'presque uniquement des percussions de boîte à rythmes : la preuve que le genre peut se passer de notes.' },
    { artist: 'Robert Hood', track: 'Minimal Nation (album)', why: 'le minimalisme poussé au bout : très peu d’éléments, chacun indispensable.' },
  ],
};
