// Genre — Synth-pop / électropop, avec le cas Agar Agar. Forme : voir techno.js.
//
// Limite assumée : aucun détail précis sur un morceau réel n'est affirmé ici
// (tempo, tonalité, accords, sons). Les exemples sont originaux, « dans l'esprit ».

const BPM = 'setcpm(112/4)';
const BATT = '$: sound("bd ~ ~ bd ~ ~ bd ~, ~ sd ~ sd").bank("AkaiLinn")';
const HATS = '$: sound("hh*8").bank("AkaiLinn").gain("[.4 .25]*4")';
const GRILLE = 'const grille = chord("<Am F C G>")';
const BASSE = '$: grille.rootNotes(1).struct("x*8").add(note("[0 12]*4")).sound("sawtooth").lpf(700).decay(.18).sustain(0).gain(.8)';

export default {
  id: 'synthpop',
  name: 'Synth-pop',
  family: 'Synth-pop et électropop',
  bpm: [100, 125],
  pitch: 'Des chansons, avec couplet et refrain, mais jouées par des machines : synthétiseurs et boîtes à rythmes.',
  intro:
    'La synth-pop (ou électropop) est d’abord de la **pop** : une mélodie qu’on retient, une voix, un couplet et un refrain. ' +
    'Ce qui la définit, c’est l’instrumentation : les synthétiseurs et les boîtes à rythmes tiennent la place de la guitare, de la basse et de la batterie. ' +
    'Elle emprunte volontiers à ses voisines — le kick de la techno, les arpèges de la trance, la froideur de la new wave — ce qui rend ses frontières floues.',
  traits: [
    {
      aspect: 'tempo',
      title: 'Le tempo d’une chanson : 100 à 125 BPM',
      short: '100–125 BPM',
      hear: `${BPM}
${BATT}`,
      what:
        'Plus lent que la techno ou la trance : c’est un tempo auquel on peut chanter. Vers 100–110, le morceau balance ; vers 120–125, il se danse franchement.' +
        ' À 104 BPM, un temps dure 0,58 s ; à 122 BPM, 0,49 s. Le rythme de batterie `bd ~ ~ bd ~ ~ bd ~` place les kicks sur les croches 1, 4 et 7 : le motif 3-3-2 (voir [euclid](fn.euclid)).',
      build: [
        ['104 BPM : posé', `setcpm(104/4)\n${BATT}`],
        ['122 BPM : dansant', `setcpm(122/4)\n${BATT}`],
      ],
      wiki: ['fn.setcpm', 'sol.tempo'],
    },
    {
      aspect: 'kick',
      title: 'Un rythme de chanson : kick et caisse claire',
      short: 'Kick décalé ou sur chaque temps ; caisse claire forte sur les temps 2 et 4',
      hear: `${BPM}
${BATT}`,
      what:
        'Le kick n’est plus obligé de tomber sur chaque temps. Il dialogue avec une **caisse claire** très présente sur les temps 2 et 4 : « boum — clac — boum — boum+clac » (le troisième kick tombe avec la deuxième caisse claire). C’est le rythme de la pop et du rock, joué par une boîte à rythmes. Quand le morceau lorgne vers la piste de danse, le kick repasse sur chaque temps.' +
        ' La caisse claire avec réverbération (`room(.5).size(2)`, une traîne de 2 s) est typique des productions des années 1980 (voir [room](fx.room)).',
      build: [
        ['1. Le rythme pop de base', `${BPM}\nsound("bd ~ bd ~, ~ sd ~ sd").bank("AkaiLinn")`],
        ['2. Un kick syncopé', `${BPM}\n${BATT}`],
        ['3. Version dansante : le kick sur chaque temps', `${BPM}\nsound("bd*4, ~ sd ~ sd").bank("AkaiLinn")`],
        ['4. Une caisse claire avec de la réverbération', `${BPM}\n$: sound("bd ~ ~ bd ~ ~ bd ~").bank("AkaiLinn")\n$: sound("~ sd ~ sd").bank("AkaiLinn").room(.5).size(2)`],
      ],
      wiki: ['sol.contretemps', 'son.batterie', 'fn.bank', 'fx.room'],
    },
    {
      aspect: 'basse',
      title: 'Une basse de synthé qui saute d’octave',
      short: 'Synthé en croches, sauts d’octave ; elle suit les accords',
      hear: `${BPM}
${GRILLE}
${BATT}
${BASSE}`,
      what:
        'La basse est un synthétiseur, pas une guitare basse, et elle ne cherche pas à l’imiter. Le motif le plus reconnaissable : des croches régulières qui alternent la note grave et **la même note une octave plus haut**. Elle suit la suite d’accords, comme dans une chanson.' +
        ' Le saut d’octave double la fréquence (a1 = 55 Hz, a2 = 110 Hz) : la note haute rend la basse audible sur un petit haut-parleur, la note basse lui garde son poids. `add(note("[0 12]*4"))` ajoute 0 puis 12 demi-tons en alternance (voir [add](fn.add)).',
      build: [
        ['1. Des croches sur une seule note', `${BPM}\nnote("a1*8").sound("sawtooth").lpf(700).decay(.18).sustain(0)`],
        ['2. Le saut d’octave', `${BPM}\nnote("[a1 a2]*4").sound("sawtooth").lpf(700).decay(.18).sustain(0)`],
        ['3. Elle suit la grille d’accords', `${BPM}\n${GRILLE}\n${BASSE}`],
        ['4. Avec la batterie', `${BPM}\n${GRILLE}\n${BATT}\n${BASSE}`],
      ],
      wiki: ['sol.octave', 'fn.rootNotes', 'fn.add', 'fn.struct'],
    },
    {
      aspect: 'hats',
      title: 'Charleston régulier, claps et toms',
      short: 'Charleston en croches, claps ; roulements de toms entre les sections',
      hear: `${BPM}
${BATT}
${HATS}`,
      what:
        'Le charleston est fermé, régulier, en croches ou en doubles-croches, avec une croche sur deux (celle qui tombe sur le temps) légèrement accentuée. Les boîtes à rythmes des années 1980 ont aussi des **toms** au son très typé, qu’on utilise pour annoncer le refrain.' +
        ' `gain("[.4 .25]*4")` alterne un charleston plus fort sur le temps et un plus faible sur la contretemps (voir [gain](fx.gain)). Le roulement de toms `[ht mt lt lt]` occupe le dernier temps, et `mask("<0 0 0 1>")` ne le laisse passer qu’une mesure sur quatre, la 4ᵉ (voir [mask](fn.mask)).',
      build: [
        ['1. Charleston en croches, accentué', `${BPM}\n${BATT}\n${HATS}`],
        ['2. Un clap qui double la caisse claire', `${BPM}\n${BATT}\n${HATS}\n$: sound("~ cp ~ cp").bank("AkaiLinn").gain(.5)`],
        ['3. Un roulement de toms toutes les 4 mesures', `${BPM}\n${BATT}\n${HATS}\n$: sound("~ ~ ~ [ht mt lt lt]").bank("AkaiLinn").gain(.7).mask("<0 0 0 1>")`],
      ],
      wiki: ['son.batterie', 'fn.mask', 'fx.gain'],
    },
    {
      aspect: 'harmonie',
      title: 'De vrais accords, un couplet et un refrain',
      short: 'Majeur ou mineur ; suites d’accords de chanson ; couplet et refrain différents ; mélodie en avant',
      hear: `${BPM}
$: chord("<Am F C G>").voicing().sound("sawtooth").lpf(1500).attack(.05).release(.3).gain(.35)
$: n("<[4 ~ 4 2] [2 ~ 0 ~] [4 ~ 4 6] [4 2 1 ~]>").scale("A4:minor").sound("square").lpf(2200).decay(.25).sustain(.3).gain(.4)`,
      what:
        'C’est une chanson : il y a une **mélodie** qu’on peut fredonner, posée sur une **suite d’accords**. Et surtout, il y a deux suites différentes : celle du **couplet** et celle du **refrain**. Le passage de l’une à l’autre est le moment qu’on attend. La tonalité peut être majeure (lumineuse) ou mineure (mélancolique) : la synth-pop aime les deux, et souvent le mélange.' +
        ' Les deux grilles utilisent les mêmes quatre accords de la mineur (la mineur, fa, do, sol), dans un ordre différent : le couplet commence sur la mineur, l’accord de la [tonique](sol.tonique) ; le refrain commence sur fa et n’atteint la mineur qu’à sa 3ᵉ mesure (voir [progression](sol.progression)).',
      build: [
        ['1. Les accords du couplet', `${BPM}\nchord("<Am F C G>").voicing().sound("piano")`],
        ['2. Ceux du refrain : mêmes accords, autre ordre', `${BPM}\nchord("<F G Am C>").voicing().sound("piano")`],
        ['3. Couplet puis refrain, enchaînés', `${BPM}\nchord("<Am F C G F G Am C>").voicing().sound("piano")`],
        ['4. Une mélodie sur le couplet', `${BPM}\n$: chord("<Am F C G>").voicing().sound("piano").gain(.6)\n$: n("<[4 ~ 4 2] [2 ~ 0 ~] [4 ~ 4 6] [4 2 1 ~]>").scale("A4:minor").sound("square").lpf(2200).decay(.25).sustain(.3).gain(.4)`],
      ],
      wiki: ['sol.progression', 'fn.chord', 'sol.majeur', 'sol.mineur', 'fn.scale'],
    },
    {
      aspect: 'timbres',
      title: 'Des synthés francs, des arpèges, des nappes épaisses',
      short: 'Synthés aux ondes franches (carré, dent de scie), arpèges, nappes ; une voix au premier plan',
      hear: `${BPM}
chord("<Am F C G>").voicing().arp("[0 1 2 3 2 1]*2").sound("square").lpf(1800).decay(.14).sustain(0).delay(.3).delaysync(1/8).gain(.4)`,
      what:
        'Les sons sont francs et assumés comme synthétiques : onde carrée pour les mélodies, dent de scie pour les nappes et la basse. On retrouve l’**arpège**, plus lent et plus sage qu’en trance. Les nappes sont épaissies en doublant le son avec de légers désaccords (c’est ce que faisait l’effet *chorus* des synthés de l’époque) ; dans Strudel, le plus simple est `supersaw` avec peu de voix. Et il manque ici l’essentiel : **la voix**. Strudel ne chante pas ; dans les exemples, c’est la mélodie au synthé qui tient sa place.' +
        ' Le vibrato de la mélodie : `vib(5).vibmod(.2)`, 5 oscillations par seconde, ±0,2 demi-ton (voir [vib](fx.vib)). Pour la nappe : `supersaw` avec 3 voix seulement et un désaccord faible (`detune(.1)`) épaissit le son sans l’effet « mur » de la trance (voir [supersaw](son.supersaw)).',
      build: [
        ['1. Une mélodie à l’onde carrée', `${BPM}\nn("4 ~ 4 2 2 ~ 0 ~").scale("A4:minor").sound("square").lpf(2200).decay(.25).sustain(.3).gain(.4)`],
        ['2. Avec un léger vibrato', `${BPM}\nn("4 ~ 4 2 2 ~ 0 ~").scale("A4:minor").sound("square").lpf(2200).decay(.25).sustain(.3).vib(5).vibmod(.2).gain(.4)`],
        ['3. Un arpège sage', `${BPM}\nchord("<Am F C G>").voicing().arp("[0 1 2 3 2 1]*2").sound("square").lpf(1800).decay(.14).sustain(0).delay(.3).delaysync(1/8).gain(.4)`],
        ['4. Une nappe épaissie : quelques voix désaccordées', `${BPM}\nchord("<Am F C G>").voicing().sound("supersaw").unison(3).detune(.1).lpf(1500).attack(.1).release(.5).gain(.3)`],
      ],
      wiki: ['son.ondes', 'fn.arp', 'fx.vib', 'sol.arpege'],
    },
    {
      aspect: 'structure',
      title: 'Une forme de chanson',
      short: 'Couplet / refrain / pont ; 3 à 4 minutes',
      hear: `${BPM}
const grille = chord("<Am F C G F G Am C>")
${BATT}
${HATS}.mask("<0!4 1!4>")
${BASSE}
$: grille.voicing().sound("sawtooth").lpf(1500).attack(.05).release(.3).gain(.3).mask("<0!4 1!4>")`,
      what:
        'Pas de montée de dix minutes : une chanson dure trois ou quatre minutes et alterne des parties bien distinctes. Le **couplet** est dépouillé (batterie, basse). Le **refrain** ajoute des couches (charleston, nappe, mélodie) et change d’accords. Un **pont**, vers les deux tiers, casse la routine avant le dernier refrain. L’exemple alterne 4 mesures de couplet et 4 de refrain.' +
        ' Dans l’exemple enchaîné, `chord("<Am F C G F G Am C>")` contient huit accords : les quatre du couplet, puis les quatre du refrain. Le cycle complet dure 8 mesures.',
      build: [
        ['1. Le couplet : batterie et basse', `${BPM}\nconst grille = chord("<Am F C G>")\n${BATT}\n${BASSE}`],
        ['2. Le refrain : autres accords, plus de couches', `${BPM}\nconst grille = chord("<F G Am C>")\n${BATT}\n${HATS}\n${BASSE}\n$: grille.voicing().sound("sawtooth").lpf(1500).attack(.05).release(.3).gain(.3)`],
        ['3. Les deux enchaînés', `${BPM}\nconst grille = chord("<Am F C G F G Am C>")\n${BATT}\n${HATS}.mask("<0!4 1!4>")\n${BASSE}\n$: grille.voicing().sound("sawtooth").lpf(1500).attack(.05).release(.3).gain(.3).mask("<0!4 1!4>")`],
      ],
      wiki: ['genre.structure', 'fn.mask', 'js.const'],
    },
    {
      aspect: 'histoire',
      title: 'De la fin des années 1970 à aujourd’hui',
      short: 'Fin des années 1970 ; âge d’or au début des années 1980 ; retours réguliers depuis',
      hear: `setcpm(118/4)
$: sound("bd*4, ~ sd ~ sd, hh*8").bank("RolandTR707").gain(.8)
$: note("[a1 a2]*4").sound("sawtooth").lpf(800).decay(.18).sustain(0)
$: n("0 2 4 2 7 4 2 4").scale("A4:minor").sound("square").lpf(2000).decay(.15).sustain(0).gain(.35)`,
      what:
        'À la fin des années 1970, les synthétiseurs deviennent abordables. Des groupes comme Kraftwerk, en Allemagne, montrent qu’on peut faire de la pop uniquement avec des machines. ' +
        'Au début des années 1980, au Royaume-Uni surtout, toute une génération s’en empare : The Human League, Depeche Mode, New Order. ' +
        'Le genre ne disparaît jamais vraiment : il revient par vagues, sous le nom d’*électropop* à partir des années 2000.',
      build: [],
      wiki: ['son.ondes', 'fn.bank'],
    },
  ],
  assemble: {
    text:
      'Une chanson miniature : 4 mesures de couplet, 4 de refrain, en boucle. La mélodie à l’onde carrée tient la place de la voix. ' +
      'Change la grille de huit accords : les quatre premiers sont le couplet, les quatre suivants le refrain.',
    code: `setcpm(112/4)

const grille = chord("<Am F C G F G Am C>")

$: sound("bd ~ ~ bd ~ ~ bd ~, ~ sd ~ sd").bank("AkaiLinn")

$: sound("hh*8").bank("AkaiLinn").gain("[.4 .25]*4").mask("<0!4 1!4>")

$: grille.rootNotes(1).struct("x*8").add(note("[0 12]*4")).sound("sawtooth")
  .lpf(700).decay(.18).sustain(0).gain(.8)

$: grille.voicing().sound("sawtooth").lpf(1500).attack(.05).release(.3).gain(.3)
  .mask("<0!4 1!4>")

$: n("<[4 ~ 4 2] [2 ~ 0 ~] [4 ~ 4 6] [4 2 1 ~] [7 ~ 7 6] [4 ~ 4 2] [4 ~ 2 0] [2 ~ ~ ~]>")
  .scale("A4:minor").sound("square").lpf(2200).decay(.25).sustain(.3).vib(5).vibmod(.15).gain(.4)

$: sound("~ ~ ~ [ht mt lt lt]").bank("AkaiLinn").gain(.6).mask("<0 0 0 1>")`,
  },
  // Étude de cas : pourquoi les genres sont flous.
  caseStudy: {
    title: 'Le cas Agar Agar : pourquoi les genres sont flous',
    paragraphs: [
      'Agar Agar est un duo parisien formé par Clara Cappagli et Armand Bultheel. Leur EP *Cardan*, paru sur le label Cracki Records, contient le titre « I’m That Guy » ; ' +
        'leur premier album, *The Dog and the Future*, est sorti en 2018.',
      'Demande à cinq sources de quel genre il s’agit, tu auras cinq réponses. On lit **électropop** et **techno pop** sur des programmes de festival, **synth-pop** dans des portraits, ' +
        '« entre pop et techno » ailleurs, **post-disco** dans la presse, et un disquaire range même le disque en **disco**. Les critiques de l’album parlent de pop électronique ' +
        'traversée de morceaux techno et d’influences *art pop*. L’étiquette *new wave* circule aussi ; elle n’apparaît pas dans les sources consultées pour écrire cette page, ce qui ne veut pas dire qu’elle soit fausse.',
      'Aucune de ces étiquettes n’est une erreur. Elles regardent chacune **un trait différent**. Celui qui dit « synth-pop » entend des chansons jouées par des synthétiseurs. ' +
        'Celui qui dit « techno » entend la boîte à rythmes et la répétition. Celui qui dit « disco » entend le tempo et le balancement. Celui qui dit « art pop » parle de la démarche, pas du son.',
      'C’est la leçon de cette section : **un genre est une famille de traits, pas une case**. Un morceau peut emprunter son kick à un genre, ses synthés à un autre et sa forme à un troisième. ' +
        'Plutôt que de chercher la bonne étiquette, pose-toi les huit questions de cette app : quel tempo ? quel kick ? quelle basse ? quels charlestons ? quelle harmonie ? quels timbres ? quelle structure ? quelle histoire ?',
      'Une limite honnête : cette page a été écrite sans pouvoir écouter « I’m That Guy ». Elle ne te dit donc rien de précis sur ce morceau — ni son tempo, ni sa tonalité, ni ses accords. ' +
        'À toi de faire l’exercice : écoute-le, réponds aux huit questions, puis compare avec les traits de la techno et de la synth-pop dans le comparateur.',
    ],
    exercise: {
      text:
        'Un point de départ original, dans l’esprit « entre pop et techno » : un kick de techno sur chaque temps, mais une basse de synth-pop et une vraie suite d’accords. ' +
        'Écoute-le, puis compare avec les deux versions ci-dessous : la même idée poussée vers la techno (accords retirés, kick durci, basse qui roule), puis vers la pop (kick décalé, mélodie, grille de chanson).',
      variants: [
        {
          label: 'Version plus techno',
          code: `setcpm(124/4)

$: sound("bd*4").bank("RolandTR909").distort(1.5)

$: sound("[~ oh]*4").bank("RolandTR909").gain(.45)

$: note("[~ a1 a1 a1]*4").sound("sawtooth").lpf(sine.range(300, 1200).slow(8)).lpq(8).decay(.1).sustain(0)

$: note("[a2,c3,e3]").struct("~ x ~ ~ ~ x ~ ~").sound("sawtooth").lpf(1400).decay(.12).sustain(0)
  .delay(.5).delaysync(3/16).gain(.4)`,
        },
        {
          label: 'Version plus pop',
          code: `setcpm(112/4)

const grille = chord("<Am F C G>")

$: sound("bd ~ ~ bd ~ ~ bd ~, ~ sd ~ sd, hh*8").bank("AkaiLinn").gain(.8)

$: grille.rootNotes(1).struct("x*8").add(note("[0 12]*4")).sound("sawtooth").lpf(700).decay(.18).sustain(0)

$: grille.voicing().sound("square").lpf(1600).attack(.05).release(.4).gain(.25)

$: n("<[4 ~ 4 2] [2 ~ 0 ~] [4 ~ 4 6] [4 2 1 ~]>").scale("A4:minor")
  .sound("triangle").delay(.3).delaysync(3/16).room(.4).gain(.5)`,
        },
      ],
      code: `setcpm(120/4)

const grille = chord("<Am Am F G>")

$: sound("bd*4").bank("RolandTR909")

$: sound("[~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.45)

$: grille.rootNotes(1).struct("x*8").add(note("[0 12]*4")).sound("sawtooth")
  .lpf(sine.range(400, 1400).slow(8)).lpq(6).decay(.18).sustain(0).gain(.8)

$: grille.voicing().sound("square").lpf(1600).attack(.05).release(.4).gain(.25)

$: n("<[4 ~ ~ 2] [~ ~ 0 ~] [4 ~ ~ 6] [4 2 ~ ~]>").scale("A4:minor")
  .sound("triangle").delay(.4).delaysync(3/16).room(.4).gain(.5)`,
    },
  },
  listen: [
    { artist: 'Kraftwerk', track: 'The Model', why: 'la pop réduite à l’essentiel : une mélodie, une basse et une boîte à rythmes.' },
    { artist: 'The Human League', track: 'Don’t You Want Me', why: 'couplet, refrain, voix au premier plan : une chanson, jouée entièrement aux synthétiseurs.' },
    { artist: 'New Order', track: 'Blue Monday', why: 'la rencontre de la pop et de la piste de danse : kick de boîte à rythmes et basse séquencée.' },
    { artist: 'Agar Agar', track: 'I’m That Guy', why: 'le cas d’étude : écoute-le en te posant les huit questions.' },
  ],
};
