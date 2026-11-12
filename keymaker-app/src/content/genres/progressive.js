// Genre — Progressive (house / trance progressive). Forme : voir techno.js.

const BPM = 'setcpm(124/4)';
const KICK = '$: sound("bd*4").bank("RolandTR909").lpf(2500).gain(.9)';
const BASSE = '$: note("<a1 a1 f1 g1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(380).decay(.25).sustain(.2).gain(.9)';
const NAPPE = '$: chord("<Am Am F G>").voicing().sound("sawtooth").lpf(sine.range(500, 1800).slow(16)).attack(.4).release(1).room(.6).gain(.3)';
const PLUCK = '$: n("0 ~ 4 ~ 2 ~ 4 7").scale("A4:minor").sound("triangle").decay(.15).sustain(0).delay(.6).delaysync(3/16).delayfeedback(.65).gain(.5)';

export default {
  id: 'progressive',
  name: 'Progressive',
  family: 'Trance et Progressive',
  bpm: [120, 128],
  pitch: 'Les mêmes ingrédients que la trance, mais sans coup de théâtre : tout change lentement, couche après couche.',
  intro:
    '« Progressive » décrit une manière de construire plus qu’un son : le morceau **progresse**. Un élément entre, s’installe, se transforme, un autre le rejoint. ' +
    'Rien n’arrive brusquement. On parle de *progressive house* ou de *progressive trance* selon le tempo et l’ambiance ; la frontière est mince, et c’est normal.',
  traits: [
    {
      aspect: 'tempo',
      title: 'Posé : 120 à 128 BPM',
      short: '120–128 BPM',
      hear: `${BPM}
sound("bd*4, [~ hh]*4").bank("RolandTR909").gain(.8)`,
      what:
        'Nettement plus lent que la trance. Ce tempo laisse de l’air entre les coups : on a le temps d’entendre les échos, les nappes, les détails. ' +
        'Le morceau peut durer huit ou dix minutes sans lasser, précisément parce qu’il ne court pas.',
      build: [
        ['124 BPM : le tempo typique', `setcpm(124/4)\nsound("bd*4, [~ hh]*4").bank("RolandTR909").gain(.8)`],
        ['Le même rythme à 138 (tempo trance), pour comparer', `setcpm(138/4)\nsound("bd*4, [~ hh]*4").bank("RolandTR909").gain(.8)`],
      ],
      wiki: ['fn.setcpm', 'sol.tempo'],
    },
    {
      aspect: 'kick',
      title: 'Un kick rond et profond',
      short: 'Sur chaque temps, rond, feutré, sans agressivité',
      hear: `${BPM}
sound("bd*4").bank("RolandTR909").lpf(2500).gain(.9)`,
      what:
        'Toujours sur chaque temps, mais on l’arrondit : moins de « clic », plus de « boum ». Il doit porter pendant de longues minutes sans fatiguer l’oreille. ' +
        'Ici, un filtre passe-bas lui retire un peu d’attaque.',
      build: [
        ['1. Le kick brut de la TR-909', `${BPM}\nsound("bd*4").bank("RolandTR909")`],
        ['2. Arrondi par un filtre', `${BPM}\nsound("bd*4").bank("RolandTR909").lpf(2500).gain(.9)`],
        ['3. Pour comparer : le kick durci de la techno', `${BPM}\nsound("bd*4").bank("RolandTR909").distort(2).gain(.8)`],
      ],
      wiki: ['fx.lpf', 'genre.kick-techno', 'son.batterie'],
    },
    {
      aspect: 'basse',
      title: 'Une basse profonde, qui groove',
      short: 'Grave et ronde, rythme décalé, peu de notes ; elle évolue lentement',
      hear: `${BPM}
${KICK}
${BASSE}`,
      what:
        'Ni le galop de la trance, ni le roulement de la techno : une basse ronde, avec un rythme **syncopé** (des notes placées juste avant ou après les temps), et des notes un peu tenues. ' +
        'Elle change de note rarement, parfois une seule fois toutes les deux mesures.',
      build: [
        ['1. Une note tenue par mesure', `${BPM}\nnote("<a1 a1 f1 g1>").sound("sawtooth").lpf(380).gain(.9)`],
        ['2. Un rythme syncopé', `${BPM}\nnote("<a1 a1 f1 g1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth").lpf(380).gain(.9)`],
        ['3. Des notes arrondies, avec le kick', `${BPM}\n${KICK}\n${BASSE}`],
      ],
      wiki: ['fn.struct', 'fx.lpf', 'fx.decay', 'fx.sustain'],
    },
    {
      aspect: 'hats',
      title: 'Des percussions qui s’ajoutent une à une',
      short: 'Charleston à contretemps, shaker, petites percussions ajoutées progressivement',
      hear: `${BPM}
${KICK}
$: sound("[~ hh]*4").bank("RolandTR909").gain(.4)
$: sound("sh*16").gain("[.25 .1 .18 .1]*4")
$: sound("~ ~ rim ~ ~ rim ~ ~").gain(.3).room(.4)`,
      what:
        'Le charleston à contretemps est là, mais discret. Autour, des couches légères : un shaker en doubles-croches, un coup sur le cercle de la caisse (*rim*), ' +
        'chacune très bas dans le mix. On les fait entrer une par une : c’est ainsi que le morceau « progresse » sans qu’on remarque de changement net.',
      build: [
        ['1. Kick et charleston à contretemps', `${BPM}\n${KICK}\n$: sound("[~ hh]*4").bank("RolandTR909").gain(.4)`],
        ['2. Un shaker, tout doux', `${BPM}\n${KICK}\n$: sound("[~ hh]*4").bank("RolandTR909").gain(.4)\n$: sound("sh*16").gain("[.25 .1 .18 .1]*4")`],
        ['3. Un coup de rim, avec de la réverbération', `${BPM}\n${KICK}\n$: sound("[~ hh]*4").bank("RolandTR909").gain(.4)\n$: sound("sh*16").gain("[.25 .1 .18 .1]*4")\n$: sound("~ ~ rim ~ ~ rim ~ ~").gain(.3).room(.4)`],
      ],
      wiki: ['sol.contretemps', 'genre.hats', 'son.batterie', 'fx.gain'],
    },
    {
      aspect: 'harmonie',
      title: 'Peu d’accords, tenus longtemps',
      short: 'Mineur ; deux ou trois accords tenus longtemps ; motif court répété plutôt que grande mélodie',
      hear: `${BPM}
chord("<Am Am F G>").voicing().sound("sawtooth").lpf(1200).attack(.4).release(1).room(.6).gain(.35)`,
      what:
        'Là où la trance change d’accord à chaque mesure, le progressive s’attarde : un accord peut durer deux ou quatre mesures. ' +
        'La mélodie n’est pas un grand thème : c’est un **motif** de quelques notes, répété, qui se transforme par le son (filtre, écho) plus que par les notes.',
      build: [
        ['1. Une grille qui prend son temps', `${BPM}\nchord("<Am Am F G>").voicing().sound("piano")`],
        ['2. En nappe : attaque et extinction lentes', `${BPM}\nchord("<Am Am F G>").voicing().sound("sawtooth").lpf(1200).attack(.4).release(1).room(.6).gain(.35)`],
        ['3. Un motif court par-dessus', `${BPM}\n$: chord("<Am Am F G>").voicing().sound("sawtooth").lpf(1200).attack(.4).release(1).room(.6).gain(.3)\n$: n("0 ~ 4 ~ 2 ~ 4 7").scale("A4:minor").sound("triangle").decay(.15).sustain(0).gain(.5)`],
      ],
      wiki: ['sol.progression', 'sol.mineur', 'fx.attack', 'fx.release'],
    },
    {
      aspect: 'timbres',
      title: 'Nappes chaudes et échos longs',
      short: 'Nappes chaudes, notes pincées avec de longs échos, filtres très lents',
      hear: `${BPM}
${PLUCK}`,
      what:
        'Les sons sont doux et profonds. Des **nappes** (accords tenus, filtrés) qui remplissent le fond. Des **notes pincées** dont l’écho dure plus longtemps que la note elle-même : ' +
        'les répétitions se superposent et dessinent un second rythme. Et des **filtres** qui mettent seize mesures à s’ouvrir.',
      build: [
        ['1. Un motif pincé, à sec', `${BPM}\nn("0 ~ 4 ~ 2 ~ 4 7").scale("A4:minor").sound("triangle").decay(.15).sustain(0).gain(.5)`],
        ['2. Avec un écho long, calé sur le tempo', `${BPM}\n${PLUCK}`],
        ['3. Une nappe dont le filtre respire très lentement', `${BPM}\n${NAPPE.slice(3)}`],
      ],
      wiki: ['fx.delay', 'fx.delayfeedback', 'fx.room', 'fn.signaux', 'sol.enveloppe'],
    },
    {
      aspect: 'structure',
      title: 'Une couche à la fois',
      short: 'Les pistes entrent et sortent très doucement, toutes les 8 ou 16 mesures ; une pause sans batterie, sans explosion au retour',
      hear: `${BPM}
${KICK}
$: sound("[~ hh]*4").bank("RolandTR909").gain(.4).mask("<0!2 1!6>")
${BASSE}.mask("<0!4 1!4>")
${PLUCK}.mask("<0!6 1!2>")`,
      what:
        'C’est le trait qui donne son nom au genre. On part de presque rien, et on ajoute **une seule chose à la fois**, à intervalles réguliers. ' +
        'Il y a bien un breakdown, mais il est doux : la batterie s’efface, les nappes restent, et le retour se fait sans explosion. ' +
        'L’exemple ajoute une couche toutes les 2 mesures ; dans un vrai morceau, ce serait toutes les 8 ou 16.',
      build: [
        ['1. Le kick seul', `${BPM}\n${KICK}`],
        ['2. Le charleston entre à la 3ᵉ mesure', `${BPM}\n${KICK}\n$: sound("[~ hh]*4").bank("RolandTR909").gain(.4).mask("<0!2 1!6>")`],
        ['3. La basse à la 5ᵉ', `${BPM}\n${KICK}\n$: sound("[~ hh]*4").bank("RolandTR909").gain(.4).mask("<0!2 1!6>")\n${BASSE}.mask("<0!4 1!4>")`],
        ['4. Le motif à la 7ᵉ', `${BPM}\n${KICK}\n$: sound("[~ hh]*4").bank("RolandTR909").gain(.4).mask("<0!2 1!6>")\n${BASSE}.mask("<0!4 1!4>")\n${PLUCK}.mask("<0!6 1!2>")`],
      ],
      wiki: ['genre.structure', 'fn.mask', 'mini.exclamation'],
    },
    {
      aspect: 'histoire',
      title: 'Le Royaume-Uni du début des années 1990',
      short: 'Royaume-Uni, début des années 1990',
      hear: `${BPM}
${KICK}
${BASSE}
${NAPPE}`,
      what:
        'Le mot apparaît au **Royaume-Uni** au début des années 1990, pour désigner une house plus longue, plus travaillée, moins festive que celle des clubs de l’époque. ' +
        'Les DJ Sasha et John Digweed en deviennent les figures, avec de longs mix où les morceaux se fondent les uns dans les autres. ' +
        'Dans les années 2000 et 2010, l’étiquette est reprise pour une musique plus mélodique, à mi-chemin de la trance.',
      build: [],
      wiki: ['genre.structure'],
    },
  ],
  assemble: {
    text:
      'Seize mesures où une couche entre toutes les deux mesures environ. Rien ne claque : écoute comme chaque entrée se remarque à peine, ' +
      'et comme le morceau est pourtant très différent à la fin.',
    code: `setcpm(124/4)

$: sound("bd*4").bank("RolandTR909").lpf(2500).gain(.9)

$: sound("[~ hh]*4").bank("RolandTR909").gain(.4).mask("<0!2 1!14>")

$: note("<a1 a1 f1 g1>").struct("x ~ ~ x ~ ~ x ~").sound("sawtooth")
  .lpf(380).decay(.25).sustain(.2).gain(.9).mask("<0!4 1!12>")

$: sound("sh*16").gain("[.25 .1 .18 .1]*4").mask("<0!6 1!10>")

$: chord("<Am Am F G>").voicing().sound("sawtooth")
  .lpf(sine.range(500, 1800).slow(16)).attack(.4).release(1).room(.6).gain(.3)
  .mask("<0!8 1!8>")

$: n("0 ~ 4 ~ 2 ~ 4 7").scale("A4:minor").sound("triangle").decay(.15).sustain(0)
  .delay(.6).delaysync(3/16).delayfeedback(.65).gain(.5).mask("<0!10 1!6>")

$: sound("~ ~ rim ~ ~ rim ~ ~").gain(.3).room(.4).mask("<0!12 1!4>")`,
  },
  listen: [
    { artist: 'Sasha & John Digweed', track: 'Northern Exposure (album mixé)', why: 'l’art de l’enchaînement lent : on ne sait jamais où un morceau finit et où le suivant commence.' },
    { artist: 'Leftfield', track: 'Not Forgotten', why: 'souvent cité parmi les premiers titres de house « progressive ».' },
    { artist: 'Eric Prydz', track: 'Opus', why: 'un seul motif, répété et transformé pendant de longues minutes : la progression à l’état pur.' },
  ],
};
