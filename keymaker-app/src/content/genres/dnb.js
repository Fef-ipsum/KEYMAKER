// Genre — Drum & bass. Forme : voir techno.js.
// Reprend le contenu vérifié des leçons 7.11 à 7.15 (parcours « Autres genres »).

const TWO = 'sound("bd ~ ~ ~ ~ bd ~ ~, ~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808")';
const HALF = 'sound("bd ~ ~ ~ ~ ~ ~ ~, ~ ~ ~ ~ sd ~ ~ ~").bank("RolandTR808")';
const HATS = 'sound("hh*16").bank("RolandTR808").gain("[.35 .15 .25 .15]*4")';
const REESE = 'note("[24,24.2]*8").sound("sawtooth").lpf(sine.range(300, 1400).slow(4)).lpq(7).decay(.2).sustain(.6).gain(.5)';
const AMEN = "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })";

export default {
  id: 'dnb',
  name: 'Drum & bass',
  family: 'Drum & bass',
  bpm: [160, 180],
  pitch: 'Une batterie très rapide, une basse très grave, et un rythme qui paraît pourtant deux fois plus lent.',
  intro:
    'Le drum & bass tient dans son nom : une batterie (*drum*) découpée et rapide, une basse (*bass*) énorme, et presque rien entre les deux. ' +
    'Sa signature est un grand écart : les charlestons filent à plus de 170 BPM, mais la caisse claire peut ne tomber qu’une fois par mesure, et le corps danse alors à moitié de cette vitesse. ' +
    'Les leçons du parcours « Autres genres » construisent ensuite une intro complète, avec le break et le drop.',
  traits: [
    {
      aspect: 'tempo',
      title: 'Très rapide : 160 à 180 BPM, ressenti deux fois plus lent',
      short: '160–180 BPM, souvent 170–175 ; ressenti souvent à moitié (half-time)',
      hear: `setcpm(174/4)
$: ${HALF}
$: ${HATS}`,
      what:
        'Le tempo du drum & bass est le plus rapide des genres de cette app : 170 à 175 BPM le plus souvent, autour de 160 à 170 pour la *jungle* des débuts. ' +
        'Mais seuls les charlestons suivent cette vitesse. Si la caisse claire ne tombe que sur le 3ᵉ temps, le corps la prend comme repère et ressent un tempo deux fois plus lent : c’est le [half-time](voc.structure.half-time-full-time).' +
        ' En chiffres (voir [tempo](sol.tempo)) : à 174 BPM, un temps dure 0,34 s et une mesure 1,38 s ; une caisse claire par mesure donne un ressenti de 87 BPM. Les 16 charlestons de `hh*16` sont espacés de 0,086 s, près de 12 par seconde.',
      build: [
        ['160 BPM : l’allure de la jungle', `setcpm(160/4)\n${HALF}\n  .stack(${HATS})`],
        ['174 BPM : le cœur du genre', `setcpm(174/4)\n${HALF}\n  .stack(${HATS})`],
        ['Le même tempo, caisse claire sur 2 et 4 : le ressenti double', `setcpm(174/4)\n${TWO}\n  .stack(${HATS})`],
      ],
      wiki: ['fn.setcpm', 'sol.tempo', 'voc.structure.half-time-full-time', 'genre.tempo'],
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ce rythme à 174 BPM. Combien de coups de caisse claire par mesure ?',
          code: `setcpm(174/4)\n${HALF}\n  .stack(${HATS})`,
          choices: ['Un seul, sur le 3ᵉ temps', 'Deux, sur les temps 2 et 4', 'Quatre, un par temps'],
          answer: 0,
          explain: 'Dans `~ ~ ~ ~ sd ~ ~ ~`, la caisse claire occupe la 5ᵉ case sur 8 : la position ½ du cycle, le 3ᵉ temps. Une seule par mesure : le *half-time*, qui fait ressentir 87 BPM alors que les charlestons filent à 174.',
        },
      ],
    },
    {
      aspect: 'kick',
      title: 'Kick et caisse claire : le « two-step »',
      short: 'Pas de four on the floor : kick sur le 1 et juste après le 3, caisse claire sur 2 et 4',
      hear: `setcpm(174/4)
$: ${TWO}
$: ${HATS}`,
      what:
        'Ici, pas de kick sur chaque temps. Le squelette le plus courant, le *two-step*, n’a que deux kicks par mesure : un sur le 1ᵉʳ temps, l’autre une croche après le 3ᵉ. La caisse claire frappe les temps 2 et 4. ' +
        'Le kick décalé empêche la mesure de sonner carrée : c’est un rythme cassé, un [breakbeat](voc.culture.breakbeat), hérité des batteurs de funk.' +
        ' Les positions, sur une grille de 8 croches : `bd ~ ~ ~ ~ bd ~ ~` place les kicks à 0 et ⅝ du cycle ; `~ ~ sd ~ ~ ~ sd ~` place la caisse claire à ¼ et ¾. À 174 BPM, le 2ᵉ kick tombe 0,86 s après le premier, puis 0,52 s avant la mesure suivante.',
      build: [
        ['1. La caisse claire sur 2 et 4', `setcpm(174/4)\nsound("~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808")`],
        ['2. Le kick sur le 1, puis une croche après le 3', `setcpm(174/4)\n${TWO}`],
        ['3. Avec les charlestons', `setcpm(174/4)\n$: ${TWO}\n$: ${HATS}`],
      ],
      wiki: ['voc.culture.breakbeat', 'son.batterie', 'sol.croche'],
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ce rythme. Le kick tombe-t-il sur chaque temps ?',
          code: `setcpm(174/4)\n${TWO}`,
          choices: ['Non : sur le 1ᵉʳ temps, puis une croche après le 3ᵉ', 'Oui : un kick par temps, comme en techno', 'Non : seulement sur le 1ᵉʳ temps'],
          answer: 0,
          explain: '`bd ~ ~ ~ ~ bd ~ ~` découpe la mesure en 8 croches : les kicks occupent la 1ʳᵉ et la 6ᵉ, aux positions 0 et ⅝ du cycle. Le 2ᵉ arrive donc une croche après le 3ᵉ temps (½). C’est le *two-step*, avec la caisse claire sur 2 et 4.',
        },
      ],
    },
    {
      aspect: 'basse',
      title: 'Une sub-basse, ou une basse qui gronde',
      short: 'Sub-basse sinusoïdale très grave ; ou basse « reese » : deux dents de scie désaccordées',
      hear: `setcpm(174/4)
$: ${HALF}
$: ${REESE}`,
      what:
        'Deux grandes familles. La [sub-basse](voc.structure.sub-bass) : une sinusoïde très grave, presque sans harmoniques, qu’on ressent dans le corps plus qu’on ne l’entend. Et la [reese](voc.culture.reese-bass) : deux dents de scie presque à la même hauteur, qui battent l’une contre l’autre et font gronder la basse.' +
        ' `note("c1")` vibre à 32,7 Hz. Dans `note("[24,24.2]")`, les deux notes sont à 0,2 demi-ton d’écart (MIDI 24 et 24,2 ; `note()` accepte les décimales) : leurs fondamentales battent 0,38 fois par seconde, leurs 10ᵉ harmoniques 3,8 fois. Le [passe-bas](fx.lpf) qui ondule sur 4 mesures (`sine.range(300, 1400).slow(4)`) fait bouger le grognement. Au téléphone, la sub-basse disparaît presque : écoute au casque.',
      build: [
        ['1. Une sub-basse : sinusoïde à 32,7 Hz', `setcpm(174/4)\nnote("c1*4").sound("sine").gain(.8)`],
        ['2. Une dent de scie seule, filtrée', `setcpm(174/4)\nnote("24*8").sound("sawtooth").lpf(700).decay(.2).sustain(.6).gain(.5)`],
        ['3. Deux dents de scie à 0,2 demi-ton : elles battent', `setcpm(174/4)\nnote("[24,24.2]*8").sound("sawtooth").lpf(700).decay(.2).sustain(.6).gain(.5)`],
        ['4. Un filtre qui ondule et de la résonance : la reese', `setcpm(174/4)\n${REESE}`],
      ],
      wiki: ['voc.structure.sub-bass', 'voc.culture.reese-bass', 'son.ondes', 'fx.lpf', 'fx.lpq'],
    },
    {
      aspect: 'hats',
      title: 'Des charlestons rapides, des caisses fantômes, un break haché',
      short: 'Charlestons en doubles-croches, coups de caisse très doux, break échantillonné et découpé',
      hear: `setcpm(174/4)
$: ${TWO}
$: sound("~ sd ~ ~ ~ ~ ~ sd").bank("RolandTR808").gain(.2)
$: ${HATS}`,
      what:
        'L’élan vient du haut : des charlestons en doubles-croches avec des accents, et des *notes fantômes*, des coups de caisse claire si doux qu’on les sent plus qu’on ne les entend. ' +
        'Le vrai cœur du genre est pourtant le *break* : quelques secondes de batterie de funk enregistrée, découpées en tranches et réordonnées. Le plus célèbre est l’[amen break](voc.culture.amen-break).' +
        ' Dans l’exemple, `gain("[.35 .15 .25 .15]*4")` donne à chaque double-croche son volume (voir [gain](fx.gain)) ; `~ sd ~ ~ ~ ~ ~ sd` à `gain(.2)` ajoute deux caisses fantômes, juste après le premier kick et juste avant la mesure suivante. Pour le break, `chop(16)` le coupe en 16 tranches et `iter(4)` décale le départ d’un quart à chaque mesure (voir [iter](voc.code.iter-n)) : une boucle qui ne se répète qu’au bout de 4 mesures.',
      build: [
        ['1. Le two-step et des charlestons réguliers', `setcpm(174/4)\n$: ${TWO}\n$: sound("hh*16").bank("RolandTR808").gain(.25)`],
        ['2. Des accents', `setcpm(174/4)\n$: ${TWO}\n$: ${HATS}`],
        ['3. Deux caisses fantômes', `setcpm(174/4)\n$: ${TWO}\n$: sound("~ sd ~ ~ ~ ~ ~ sd").bank("RolandTR808").gain(.2)\n$: ${HATS}`],
        ['4. Le break amen, haché (se charge depuis Internet)', `${AMEN}\nsetcpm(174/4)\n$: sound("amen/4").fit().chop(16).iter(4).cut(1).gain(.9)`],
      ],
      wiki: ['voc.culture.amen-break', 'fx.chop', 'voc.code.iter-n', 'fx.gain', 'fx.cut'],
    },
    {
      aspect: 'harmonie',
      title: 'Mineur, sombre ou jazzy',
      short: 'Mineur ; nappes d’accords de septième (liquid) ou presque pas d’harmonie (neurofunk)',
      hear: `setcpm(174/4)
$: ${HALF}
$: chord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)`,
      what:
        'Le drum & bass est presque toujours en [mineur](sol.mineur). Deux tendances. La branche douce (souvent appelée *liquid*) pose des nappes d’accords de septième, lentes, qui flottent au-dessus de la batterie rapide : une mesure d’accord dure 1,38 s à 174 BPM, et souvent l’accord tient deux mesures. La branche dure (*neurofunk*) n’a presque pas d’accords : toute la tension est dans la basse.' +
        ' Dans l’exemple, `chord("<Cm7 Ab^7>")` alterne do mineur 7 et la♭ majeur 7, une mesure chacun ; `attack(.5)` fait monter chaque accord en 0,5 s, `release(.8)` le fait s’éteindre en 0,8 s (voir [enveloppe](fx.adsr)).',
      build: [
        ['1. Deux accords de septième, une mesure chacun', `setcpm(174/4)\nchord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(1500).gain(.3)`],
        ['2. En nappe : attaque et extinction lentes', `setcpm(174/4)\nchord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)`],
        ['3. Deux fois plus lents : un accord toutes les deux mesures', `setcpm(174/4)\nchord("<Cm7 Ab^7>").slow(2).voicing().sound("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)`],
        ['4. Avec la batterie half-time', `setcpm(174/4)\n$: ${HALF}\n$: chord("<Cm7 Ab^7>").slow(2).voicing().sound("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)`],
      ],
      wiki: ['sol.mineur', 'sol.accord', 'fx.adsr', 'fx.room'],
    },
    {
      aspect: 'timbres',
      title: 'Une basse qui gronde, une batterie nette',
      short: 'Basse désaccordée et saturée au premier plan ; batterie sèche ; nappes et réverbération en fond',
      hear: `setcpm(174/4)
$: ${TWO}
$: ${HATS}
$: ${REESE}.distort(.8)`,
      what:
        'Le son du drum & bass se joue dans le grave : une basse travaillée comme un instrument soliste, désaccordée, filtrée en mouvement, saturée. La batterie reste sèche et précise pour ne pas brouiller ce grave. Les nappes et la réverbération restent au fond.' +
        ' La [saturation](fx.distort) (`distort(.8)`) écrase les crêtes de la reese et lui ajoute des harmoniques : elle s’entend alors même sur un petit haut-parleur. La [résonance](fx.lpq) `lpq(7)` accentue les fréquences autour de la coupure, qui monte et descend entre 300 et 1 400 Hz.',
      build: [
        ['1. La reese', `setcpm(174/4)\n${REESE}`],
        ['2. Saturée', `setcpm(174/4)\n${REESE}.distort(.8)`],
        ['3. Avec une batterie sèche', `setcpm(174/4)\n$: ${TWO}\n$: ${HATS}\n$: ${REESE}.distort(.8)`],
      ],
      wiki: ['fx.distort', 'fx.lpq', 'fn.signaux', 'voc.culture.reese-bass'],
    },
    {
      aspect: 'structure',
      title: 'Une intro pour le DJ, puis le drop',
      short: 'Longue intro sans basse, montée, drop où tout entre ; bascules half-time / full-time',
      hear: `setcpm(174/4)
const pad = chord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)
const sub = note("c1*4").sound("sine").gain(.7)
const drums = stack(${TWO}, ${HATS})
arrange([2, pad], [2, stack(pad, sound("sd*8").bank("RolandTR808").gain(.3))], [4, stack(drums, sub, pad)])`,
      what:
        'Comme en house, un morceau commence par une intro faite pour le mixage, souvent sans basse. Puis une montée (un roulement de caisse claire, un filtre qui s’ouvre) et le **drop** : la batterie et la basse entrent ensemble, d’un coup. ' +
        'Autre effet typique : passer du *full-time* (caisse claire sur 2 et 4) au *half-time* (sur le 3 seulement), ou l’inverse, sans changer de tempo. L’exemple tient en 8 mesures ; dans un vrai morceau, l’intro dure souvent 16 ou 32 mesures, soit 22 ou 44 s à 174 BPM.' +
        ' [arrange](fn.arrange) enchaîne les sections : 2 mesures de nappe, 2 mesures avec un roulement de caisse claire (`sd*8`, une par croche), puis 4 mesures de drop.',
      build: [
        ['1. Intro : la nappe seule', `setcpm(174/4)\nchord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)`],
        ['2. Montée : un roulement de caisse claire', `setcpm(174/4)\nconst pad = chord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)\narrange([2, pad], [2, stack(pad, sound("sd*8").bank("RolandTR808").gain(.3))])`],
        ['3. Le drop : batterie et basse entrent ensemble', `setcpm(174/4)\nconst pad = chord("<Cm7 Ab^7>").voicing().sound("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)\nconst sub = note("c1*4").sound("sine").gain(.7)\nconst drums = stack(${TWO}, ${HATS})\narrange([2, pad], [2, stack(pad, sound("sd*8").bank("RolandTR808").gain(.3))], [4, stack(drums, sub, pad)])`],
        ['4. Full-time, puis half-time : même tempo, autre poids', `setcpm(174/4)\narrange([4, ${TWO}], [4, ${HALF}])\n  .stack(${HATS})`],
      ],
      wiki: ['fn.arrange', 'voc.structure.half-time-full-time', 'genre.structure'],
    },
    {
      aspect: 'histoire',
      title: 'Les raves anglaises, début des années 1990',
      short: 'Royaume-Uni, début des années 1990 : de la jungle au drum & bass',
      hear: `setcpm(165/4)
$: sound("bd ~ ~ ~ ~ bd ~ ~, ~ ~ sd ~ ~ [~ sd] sd ~, hh*8").bank("RolandTR909").gain(.8)
$: note("c1 ~ ~ c1 ~ ~ eb1 ~").sound("sine").gain(.8)
$: chord("<Cm7 Fm7>").voicing().sound("sawtooth").lpf(1200).attack(.3).release(1).room(.7).gain(.25)`,
      what:
        'Au début des années 1990, dans les raves du **Royaume-Uni**, les producteurs accélèrent des breaks de funk échantillonnés et les posent sur des basses venues du reggae et du dub. Cette musique prend le nom de *jungle* ([jungle](voc.culture.jungle)), vers 1992-1994. ' +
        'Quelques années plus tard, une version plus épurée, centrée sur la batterie et la basse, prend le nom de *drum & bass*. En 1997, l’album *New Forms* de Roni Size et Reprazent, de Bristol, remporte le Mercury Prize, un grand prix musical britannique. ' +
        'Le break le plus utilisé vient de *Amen, Brother* des Winstons (1969) : quelques secondes de batterie devenues la base du genre.',
      build: [],
      wiki: ['voc.culture.drum-bass-d-b', 'voc.culture.jungle', 'voc.culture.amen-break'],
    },
  ],
  assemble: {
    text:
      'Tous les traits ensemble, sur 16 mesures. Lis-le piste par piste : une intro de 4 mesures avec la nappe et des charlestons, puis le drop en two-step avec la reese saturée, des caisses fantômes, et une bascule en half-time aux mesures 13 à 16. ' +
      'Pour faire taire une piste, ajoute un tiret bas devant son `$:` (ça donne `_$:`). Écoute au casque : sans lui, la basse disparaît presque.',
    code: `setcpm(174/4)

$: chord("<Cm7 Ab^7>").slow(2).voicing().sound("sawtooth").lpf(1500)
  .attack(.5).release(.8).room(.6).gain(.25)

$: ${HATS}

$: arrange([4, silence], [8, ${TWO}], [4, ${HALF}])

$: sound("~ sd ~ ~ ~ ~ ~ sd").bank("RolandTR808").gain(.2).mask("<0!4 1!8 0!4>")

$: ${REESE}.distort(.8).mask("<0!4 1!12>")`,
  },
  listen: [
    { artist: 'Goldie', track: 'Inner City Life', why: 'une batterie hachée très rapide sous une voix soul et des nappes : la jungle devient chanson.' },
    { artist: 'LTJ Bukem', track: 'Horizons', why: 'des nappes jazzy et une batterie légère : la branche atmosphérique du genre.' },
    { artist: 'Roni Size et Reprazent', track: 'Brown Paper Bag', why: 'une ligne de contrebasse sur une batterie drum & bass : le genre rencontre le jazz.' },
  ],
};
