// Genre — Acid. Forme : voir techno.js.

const DRUMS = '$: sound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.8)';
const LIGNE = 'c2 c2 c3 c2 ~ c2 eb2 c3 c2 ~ c2 c3 bb1 c2 ~ c2';

export default {
  id: 'acid',
  name: 'Acid',
  family: 'Techno et Acid',
  bpm: [120, 145],
  pitch: 'Une ligne de basse qui se tord et « parle », grâce à un filtre résonant qu’on fait bouger sans arrêt.',
  intro:
    'L’acid n’est pas un rythme ni une harmonie : c’est **un son**. Celui d’une petite machine, la Roland TB-303, dont le filtre résonant produit un timbre liquide et nasal. ' +
    'Posé sur une batterie house, il donne l’*acid house* ; sur une batterie techno, l’*acid techno*. Le reste du morceau est volontairement simple, pour laisser parler la basse.',
  traits: [
    {
      aspect: 'tempo',
      title: 'De la house à la techno : 120 à 145 BPM',
      short: '120–130 BPM (acid house), 130–145 (acid techno)',
      hear: `setcpm(126/4)
${DRUMS}
$: note("${LIGNE}").sound("sawtooth").lpf(500).lpq(14).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.7)`,
      what:
        'L’acid se greffe sur d’autres genres, donc son tempo dépend de l’hôte. L’acid house des débuts tourne autour de 120 à 128 BPM, avec un balancement dansant. L’acid techno pousse à 135–145 : la même ligne devient frénétique.' +
        ' À 124 BPM, une double-croche de la ligne acid dure 0,12 s ; à 140 BPM, 0,11 s. Dans l’exemple de la structure, `lpd(.12)` fait retomber le filtre en 0,12 s, à peu près une double-croche à 124 BPM : chaque note reçoit son propre coup de filtre (voir [lpenv](fx.lpenv)).',
      build: [
        ['Acid house : 124 BPM', `setcpm(124/4)\n${DRUMS}\n$: note("${LIGNE}").sound("sawtooth").lpf(500).lpq(14).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.7)`],
        ['Acid techno : 140 BPM', `setcpm(140/4)\n${DRUMS}\n$: note("${LIGNE}").sound("sawtooth").lpf(500).lpq(14).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.7)`],
      ],
      wiki: ['fn.setcpm', 'sol.tempo'],
    },
    {
      aspect: 'kick',
      title: 'Un kick simple, au service de la basse',
      short: 'Sur chaque temps, plus rond et moins saturé qu’en techno',
      hear: `setcpm(126/4)
sound("bd*4").bank("RolandTR808")`,
      what:
        'Quatre coups par mesure, comme en house et en techno. Mais le kick n’est pas la vedette : il reste rond, sans grande saturation, pour ne pas disputer le grave à la basse. Les premiers morceaux utilisent les machines Roland de l’époque : TR-808, TR-707, puis TR-909.' +
        ' La [TR-808](fn.bank) a un kick long et rond, la TR-909 un kick plus court et plus sec : le second laisse plus de place à la basse.',
      build: [
        ['Le kick rond de la TR-808', `setcpm(126/4)\nsound("bd*4").bank("RolandTR808")`],
        ['Celui, plus sec, de la TR-909', `setcpm(126/4)\nsound("bd*4").bank("RolandTR909")`],
        ['Version acid techno : on durcit', `setcpm(140/4)\nsound("bd*4").bank("RolandTR909").distort(1.5)`],
      ],
      wiki: ['fn.bank', 'son.batterie', 'genre.kick-techno'],
    },
    {
      aspect: 'basse',
      title: 'La ligne acid : c’est elle, le genre',
      short: 'Ligne de 16 pas, sauts d’octave, filtre résonant qui s’ouvre à chaque note',
      hear: `setcpm(126/4)
note("${LIGNE}").sound("sawtooth").lpf(400).lpq(15).lpenv(4).lpd(.12).decay(.15).sustain(0)`,
      what:
        'Quatre ingrédients. **Une ligne de 16 pas**, sur très peu de notes différentes, avec des silences et des **sauts d’octave**. **Un filtre passe-bas fermé**, avec **beaucoup de résonance**. Et **une enveloppe de filtre** : à chaque note, le filtre s’ouvre puis se referme très vite. C’est ce petit « ouah » répété seize fois par mesure qui fait le son acid.' +
        ' Les valeurs de l’exemple : `lpf(400)` ferme le filtre ; `lpq(15)` ajoute 15 dB à la coupure ; `lpenv(4)` l’ouvre de 4 octaves (jusqu’à 6 400 Hz) au début de chaque note ; `lpd(.12)` la referme en 0,12 s, juste avant la double-croche suivante (0,12 s à 126 BPM). Voir [enveloppe de filtre](fx.lpenv) et [basse acid](genre.basse-acid).',
      build: [
        ['1. Une dent de scie, 16 notes par mesure', `setcpm(126/4)\nnote("c2*16").sound("sawtooth")`],
        ['2. Une vraie ligne : silences et sauts d’octave', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth")`],
        ['3. On ferme le filtre', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(400)`],
        ['4. On monte la résonance', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(400).lpq(15)`],
        ['5. Le filtre s’ouvre à chaque note : voilà l’acid', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(400).lpq(15).lpenv(4).lpd(.12)`],
        ['6. Notes courtes, avec des accents', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(400).lpq(15).lpenv(4).lpd(.12).decay(.15).sustain(0).gain("[1 .6 .8 .6]*4")`],
      ],
      wiki: ['genre.basse-acid', 'fx.lpenv', 'fx.lpq', 'fx.lpf', 'son.ondes'],
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ces deux basses, l’une après l’autre. Laquelle a le son acid ?',
          code: `setcpm(126/4)\nnote("c2 c2 c3 c2 ~ c2 eb2 c3").sound("sawtooth").lpf("<400 400>").lpq("<0 15>").lpenv("<0 4>").lpd(.12).decay(.15).sustain(0)`,
          choices: ['La deuxième : le filtre résonne et s’ouvre à chaque note', 'La première : le son est rond et neutre'],
          answer: 0,
          explain: 'Mêmes notes. Au 2ᵉ passage, deux réglages changent : `lpq(15)` ajoute 15 dB à la coupure (le sifflement, voir [lpq](fx.lpq)), et `lpenv(4)` ouvre la coupure de 400 à 6 400 Hz (4 octaves) au début de chaque note, puis la referme en 0,12 s avec `lpd(.12)` (voir [lpenv](fx.lpenv)).',
        },
      ],
    },
    {
      aspect: 'hats',
      title: 'Une batterie de boîte à rythmes, sans fioritures',
      short: 'Charleston ouvert à contretemps, clap sur 2 et 4',
      hear: `setcpm(126/4)
$: sound("bd*4").bank("RolandTR909")
$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)
$: sound("~ cp ~ cp").bank("RolandTR909").gain(.7)`,
      what:
        'La batterie est celle de la house : charleston ouvert entre les temps, clap ou caisse claire sur les temps 2 et 4. Rien de compliqué. Tout ce qui est rythmiquement surprenant vient de la ligne de basse.' +
        ' La batterie de l’exemple tient en une ligne de [mini-notation](mini.virgule) : `bd*4` (le kick sur chaque temps), `[~ oh]*4` (le charleston ouvert à contretemps) et `~ cp ~ cp` (le clap sur 2 et 4), superposés par des virgules.',
      build: [
        ['1. Kick et charleston à contretemps', `setcpm(126/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)`],
        ['2. Le clap sur 2 et 4', `setcpm(126/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)\n$: sound("~ cp ~ cp").bank("RolandTR909").gain(.7)`],
        ['3. Un charleston fermé en doubles-croches', `setcpm(126/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.5)\n$: sound("~ cp ~ cp").bank("RolandTR909").gain(.7)\n$: sound("hh*16").bank("RolandTR909").gain("[.3 .15]*8")`],
      ],
      wiki: ['sol.contretemps', 'genre.hats', 'son.batterie'],
    },
    {
      aspect: 'harmonie',
      title: 'Trois ou quatre notes, pas d’accords',
      short: 'Mineur ; une note-maison et deux ou trois voisines ; aucune suite d’accords',
      hear: `setcpm(126/4)
note("c2 c2 c3 c2 ~ c2 eb2 c3 c2 ~ c2 c3 bb1 c2 ~ c2").sound("sawtooth").lpf(700).decay(.15).sustain(0)`,
      what:
        'La ligne ci-dessus n’utilise que trois notes : do, mi bémol et si bémol (plus le do à l’octave). La note-maison revient sans cesse ; les autres sont des écarts brefs. Il n’y a pas d’accords : l’intérêt n’est pas dans les notes mais dans le timbre, qui change tout le temps.' +
        ' En degrés de do mineur : do est la [tonique](sol.tonique) (degré 1), mi bémol la tierce mineure (degré 3), si bémol la septième (degré 7). Les sauts d’octave (`c2` → `c3`) gardent le même nom de note, une octave plus haut : la ligne bouge beaucoup avec très peu de notes différentes.',
      build: [
        ['1. La note-maison seule, avec ses octaves', `setcpm(126/4)\nnote("c2 c2 c3 c2 ~ c2 c2 c3 c2 ~ c2 c3 c2 c2 ~ c2").sound("sawtooth").lpf(700).decay(.15).sustain(0)`],
        ['2. Une voisine : la tierce mineure (mi bémol)', `setcpm(126/4)\nnote("c2 c2 c3 c2 ~ c2 eb2 c3 c2 ~ c2 c3 c2 c2 ~ c2").sound("sawtooth").lpf(700).decay(.15).sustain(0)`],
        ['3. Une deuxième, juste sous la tonique (si bémol)', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(700).decay(.15).sustain(0)`],
        ['4. La même idée, tirée au hasard dans la gamme', `setcpm(126/4)\nn(irand(5).segment(16)).scale("C2:minor:pentatonic").sound("sawtooth").lpf(700).decay(.15).sustain(0)`],
      ],
      wiki: ['sol.mineur', 'sol.pentatonique', 'sol.tierce', 'fn.irand'],
    },
    {
      aspect: 'timbres',
      title: 'Un synthé, un filtre, et des doigts sur les boutons',
      short: 'Dent de scie ou carré, filtre résonant en mouvement, saturation',
      hear: `setcpm(126/4)
note("${LIGNE}").sound("sawtooth")
  .lpf(sine.range(250, 1500).slow(8)).lpq(16).lpenv(3).lpd(.12)
  .decay(.15).sustain(0).distort(1).gain(.6)`,
      what:
        'La TB-303 n’a que deux ondes : dent de scie (pleine, agressive) et carré (creuse, plus ronde). Le musicien ne change pas les notes : il tourne les boutons du filtre pendant que la ligne joue. Ici, un signal lent (`sine`) le fait à ta place. Un peu de saturation rend le tout plus mordant.' +
        ' Les deux ondes de la TB-303 se retrouvent dans Strudel : `square` et `sawtooth` (voir [ondes](son.ondes)). `ftype("ladder")` remplace le filtre standard par un modèle « en échelle », plus proche des filtres analogiques (voir [lpf](fx.lpf)).',
      build: [
        ['1. Onde carrée : plus creuse', `setcpm(126/4)\nnote("${LIGNE}").sound("square").lpf(500).lpq(14).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)`],
        ['2. Dent de scie : plus mordante', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(500).lpq(14).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)`],
        ['3. La coupure du filtre bouge lentement', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(sine.range(250, 1500).slow(8)).lpq(16).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)`],
        ['4. Saturation', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(sine.range(250, 1500).slow(8)).lpq(16).lpenv(3).lpd(.12).decay(.15).sustain(0).distort(1).gain(.6)`],
        ['5. Un filtre plus agressif', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(sine.range(250, 1500).slow(8)).lpq(10).ftype("ladder").lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)`],
      ],
      wiki: ['son.ondes', 'fx.lpf', 'fx.lpq', 'fx.lpenv', 'fx.distort', 'fn.signaux'],
    },
    {
      aspect: 'structure',
      title: 'C’est le filtre qui raconte l’histoire',
      short: 'La même ligne du début à la fin ; la tension vient de l’ouverture du filtre',
      hear: `setcpm(126/4)
$: sound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.8).mask("<0!2 1!6>")
$: note("${LIGNE}").sound("sawtooth")
  .lpf(saw.range(200, 2200).slow(8)).lpq(15).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)`,
      what:
        'Dans un morceau acid, la ligne de basse peut rester identique pendant plusieurs minutes. Ce qui avance, c’est le son : le filtre est d’abord fermé (sourd, lointain), puis s’ouvre peu à peu jusqu’à hurler. La batterie entre et sort autour de ce mouvement. Ici la montée dure 8 mesures ; en vrai, elle prend une minute ou deux.' +
        ' Dans l’exemple, `lpf(saw.range(200, 2200).slow(8))` fait monter la coupure de 200 à 2 200 Hz en 8 mesures, puis la fait retomber d’un coup (voir [signaux](fn.signaux)) : plus de trois octaves d’ouverture.',
      build: [
        ['1. La ligne seule, filtre fermé', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(220).lpq(15).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)`],
        ['2. Le filtre s’ouvre sur 8 mesures', `setcpm(126/4)\nnote("${LIGNE}").sound("sawtooth").lpf(saw.range(200, 2200).slow(8)).lpq(15).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)`],
        ['3. La batterie entre à la 3ᵉ mesure', `setcpm(126/4)\n$: sound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.8).mask("<0!2 1!6>")\n$: note("${LIGNE}").sound("sawtooth").lpf(saw.range(200, 2200).slow(8)).lpq(15).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)`],
      ],
      wiki: ['fn.signaux', 'fn.mask', 'genre.structure'],
    },
    {
      aspect: 'histoire',
      title: 'Une machine ratée, détournée à Chicago',
      short: 'Roland TB-303 (1981) ; Chicago, 1987 ; puis le Royaume-Uni',
      hear: `setcpm(122/4)
$: sound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR808").gain(.8)
$: note("c2 c2 c3 c2 eb2 c2 c3 c2").sound("sawtooth").lpf(sine.range(300, 1600).slow(4)).lpq(16).lpenv(3).lpd(.15).decay(.2).sustain(0).gain(.6)`,
      what:
        'La **Roland TB-303** sort en 1981. Elle devait remplacer un bassiste pour les guitaristes qui répètent seuls. Son son ne ressemble pas à une basse : ' +
        'c’est un échec commercial, et on la trouve vite d’occasion pour presque rien. ' +
        'À **Chicago**, des producteurs de house la récupèrent et poussent ses réglages au-delà du raisonnable. En 1987, le groupe Phuture publie « Acid Tracks » : ' +
        'le genre a un nom. L’année suivante, l’acid house déferle sur le **Royaume-Uni**.',
      build: [],
      wiki: ['genre.basse-acid', 'fx.lpq'],
    },
  ],
  assemble: {
    text:
      'Tout l’acid tient dans la deuxième piste. Essaie de changer une seule note de la ligne, ou la vitesse du signal (`.slow(8)` → `.slow(4)`). ' +
      'Puis remplace `sawtooth` par `square` : le caractère change, le genre reste.',
    code: `setcpm(126/4)

$: sound("bd*4").bank("RolandTR909").mask("<0!2 1!14>")

$: note("${LIGNE}").sound("sawtooth")
  .lpf(sine.range(250, 2000).slow(16)).lpq(15).lpenv(3).lpd(.12)
  .decay(.15).sustain(0).gain("[.7 .45 .6 .45]*4").distort(.8)

$: sound("[~ oh]*4").bank("RolandTR909").gain(.45).mask("<0!4 1!12>")

$: sound("~ cp ~ cp").bank("RolandTR909").gain(.6).mask("<0!8 1!8>")

$: sound("hh*16").bank("RolandTR909").gain("[.3 .15]*8").mask("<0!8 1!8>")`,
  },
  listen: [
    { artist: 'Phuture', track: 'Acid Tracks', why: 'le morceau qui a donné son nom au genre : une ligne de TB-303 triturée pendant de longues minutes.' },
    { artist: 'Hardfloor', track: 'Acperience 1', why: 'des lignes de TB-303 et une montée de filtre interminable.' },
    { artist: 'Josh Wink', track: 'Higher State of Consciousness', why: 'la résonance poussée jusqu’au cri : on entend exactement ce que fait le filtre.' },
  ],
};
