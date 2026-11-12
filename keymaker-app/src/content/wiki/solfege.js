// Wiki — solfège : le son d'abord, le nom ensuite, la théorie en dernier.
// Chaque notion a un exemple à écouter. Forme des entrées : voir mini.js.

export default [
  /* ------------------------------ rythme ------------------------------ */
  {
    id: 'sol.cycle', t: 'cycle', sub: 'la boucle de Strudel', en: 'cycle', kind: 'sol',
    ess: 'L’unité de temps de Strudel : une boucle qui se répète. Tout ce qu’on écrit entre guillemets tient dans un cycle.',
    code: 'sound("bd hh sd hh")',
    use: [['Plus d’éléments = chacun plus court', 'sound("bd hh sd hh bd hh sd hh")']],
    traps: ['Un cycle n’est pas forcément une mesure. C’est une convention : dans cette app, on choisit 1 cycle = 1 mesure de 4 temps, d’où `setcpm(BPM/4)`.'],
    see: ['sol.mesure', 'sol.temps', 'fn.setcpm', 'mini.espace'],
    legacy: [['rythme', 'cycle']],
  },
  {
    id: 'sol.tempo', t: 'tempo', sub: 'la vitesse du morceau', en: 'tempo, BPM', kind: 'sol',
    ess: 'La vitesse de la pulsation, en battements par minute (BPM). 60 BPM = un battement par seconde.',
    code: `setcpm(120/4)
sound("bd*4")`,
    use: [
      ['Lent : 80 BPM', 'setcpm(80/4)\nsound("bd*4, hh*8")'],
      ['Techno : 135 BPM', 'setcpm(135/4)\nsound("bd*4, hh*8")'],
    ],
    traps: ['Le tempo ne dit rien de la densité : un morceau lent peut être plein de notes rapides.'],
    see: ['fn.setcpm', 'sol.temps', 'genre.tempo'],
    legacy: [['rythme', 'tempo'], ['rythme', 'BPM']],
  },
  {
    id: 'sol.temps', t: 'temps', sub: 'la pulsation', en: 'beat', kind: 'sol',
    ess: 'Les battements réguliers d’un morceau : ce qu’on tape du pied. Une note qui dure un temps s’appelle une noire.',
    code: 'sound("bd bd bd bd")',
    see: ['sol.mesure', 'sol.croche', 'sol.contretemps'],
    legacy: [['rythme', 'temps']],
  },
  {
    id: 'sol.mesure', t: 'mesure', sub: 'un groupe de temps', en: 'bar, measure', kind: 'sol',
    ess: 'Un petit groupe de temps qui se répète. La plus courante compte 4 temps : on la note 4/4.',
    code: `sound("bd bd bd bd, ~ cp ~ cp")`,
    use: [['Une mesure à 3 temps (valse)', 'sound("bd hh hh")']],
    traps: ['La musique de danse se compte par groupes de 4, 8 ou 16 mesures : c’est à ces endroits que les choses changent.'],
    see: ['sol.temps', 'sol.cycle', 'genre.structure'],
    legacy: [['rythme', 'mesure 4/4']],
  },
  {
    id: 'sol.croche', t: 'noire, croche, double-croche', sub: 'les durées', en: 'quarter, eighth, sixteenth note', kind: 'sol',
    ess: 'Une noire dure un temps. Une croche, un demi-temps. Une double-croche, un quart de temps.',
    code: 'sound("bd*4, hh*8")',
    use: [
      ['Noires : 4 par mesure', 'sound("hh*4")'],
      ['Croches : 8 par mesure', 'sound("hh*8")'],
      ['Doubles-croches : 16 par mesure', 'sound("hh*16")'],
    ],
    traps: ['Les noms anglais (américains) comptent en fractions de ronde : *quarter note* (un quart de ronde) = noire, *eighth note* = croche, *sixteenth note* = double-croche. En 4/4, une ronde remplit exactement une mesure, d’où la coïncidence.'],
    see: ['sol.temps', 'mini.etoile', 'mini.crochets'],
    legacy: [['rythme', 'subdivision']],
  },
  {
    id: 'sol.contretemps', t: 'contretemps', sub: 'entre les temps', en: 'offbeat, backbeat', kind: 'sol',
    ess: 'Ce qui tombe ENTRE les temps (*offbeat*). On appelle *backbeat* l’accent sur les temps 2 et 4.',
    code: 'sound("bd*4, [~ hh]*4")',
    use: [
      ['Charleston à contretemps', 'sound("bd*4, [~ oh]*4")'],
      ['Backbeat : clap sur 2 et 4', 'sound("bd*4, ~ cp ~ cp")'],
    ],
    see: ['mini.silence', 'genre.hats', 'sol.temps'],
    legacy: [['structure', 'backbeat'], ['structure', 'offbeat hat']],
  },

  /* ------------------------------ notes ------------------------------ */
  {
    id: 'sol.hauteur', t: 'hauteur', sub: 'grave ou aigu', en: 'pitch', kind: 'sol',
    ess: 'Ce qui fait qu’un son est grave ou aigu. Plus la vibration est rapide, plus le son est aigu.',
    code: 'note("c2 c3 c4 c5").sound("piano")',
    see: ['sol.octave', 'sol.noms-des-notes', 'fn.note'],
    legacy: [['solfege', 'hauteur'], ['solfege', 'fréquence']],
  },
  {
    id: 'sol.noms-des-notes', t: 'do ré mi = C D E', sub: 'les noms des notes', en: 'note names', kind: 'sol',
    ess: 'C = do · D = ré · E = mi · F = fa · G = sol · A = la · B = si. Strudel utilise les lettres.',
    code: 'note("c d e f g a b c4").sound("piano")',
    use: [
      ['Do, mi, sol', 'note("c e g").sound("piano")'],
      ['La, si, do', 'note("a b c4").sound("piano")'],
    ],
    traps: [
      'La série de lettres commence au LA (A), pas au do. Retiens : C = do.',
      'En Allemagne et dans quelques pays, la lettre H désigne le si et B le si bémol. Strudel suit l’usage anglais : B = si.',
    ],
    see: ['sol.octave', 'sol.diese-bemol', 'fn.note'],
    legacy: [['solfege', 'nom des notes']],
  },
  {
    id: 'sol.octave', t: 'octave', sub: 'la même note, plus haut', en: 'octave', kind: 'sol',
    ess: 'L’écart entre une note et la suivante du même nom : 12 demi-tons. Le chiffre après la lettre est le numéro d’octave.',
    code: 'note("c3 c4").sound("piano")',
    use: [
      ['Les deux ensemble', 'note("[c3,c4]").sound("piano")'],
      ['Graves et aigus', 'note("c1 c2 c3 c4 c5 c6").sound("piano")'],
    ],
    traps: [
      'Sans chiffre, Strudel joue l’octave 3 : `c` = `c3`. Le do d’au-dessus s’écrit `c4`.',
      'Le do central du piano est `c4`. Beaucoup de méthodes françaises l’appellent « do3 » : Strudel suit la numérotation internationale, décalée d’une octave.',
      'Le numéro change au DO : après `b3` (si) vient `c4`.',
    ],
    see: ['sol.hauteur', 'sol.midi', 'sol.intervalle'],
    legacy: [['solfege', 'octave']],
  },
  {
    id: 'sol.midi', t: 'numéro MIDI', sub: 'les notes en nombres', en: 'MIDI note number', kind: 'sol',
    ess: 'Chaque note a un numéro : +1 = un demi-ton plus haut. 60 est le do central (`c4`, souvent appelé « do3 » en France).',
    code: 'note("60 62 64 65 67").sound("piano")',
    use: [['Mêmes notes, par leur nom', 'note("c4 d4 e4 f4 g4").sound("piano")']],
    traps: ['48 = `c3` (le do que joue `c` tout seul), 60 = `c4`, 69 = `a4` (le la du diapason, 440 Hz).'],
    see: ['sol.octave', 'sol.demi-ton', 'fn.note'],
  },
  {
    id: 'sol.demi-ton', t: 'demi-ton', sub: 'la plus petite marche', en: 'semitone, half step', kind: 'sol',
    ess: 'Le plus petit écart entre deux notes : d’une touche de piano à sa voisine immédiate.',
    code: 'note("e3 f3").sound("piano")',
    use: [['Les douze demi-tons d’une octave', 'note("c c# d d# e f f# g g# a a# b").sound("piano")']],
    traps: ['Mi–fa et si–do sont déjà à un demi-ton : il n’y a pas de touche noire entre eux.'],
    see: ['sol.ton', 'sol.diese-bemol', 'sol.intervalle'],
    legacy: [['solfege', 'demi-ton'], ['solfege', 'gamme chromatique']],
  },
  {
    id: 'sol.ton', t: 'ton', sub: 'deux demi-tons', en: 'whole tone, whole step', kind: 'sol',
    ess: 'Deux demi-tons. De do à ré, il y a un ton.',
    code: 'note("c3 d3").sound("piano")',
    see: ['sol.demi-ton', 'sol.majeur'],
    legacy: [['solfege', 'ton']],
  },
  {
    id: 'sol.diese-bemol', t: '#  et  b', sub: 'dièse et bémol', en: 'sharp, flat', kind: 'sol',
    ess: 'Le dièse `#` monte une note d’un demi-ton. Le bémol `b` la descend d’un demi-ton.',
    code: 'note("e3 eb3 e3 f3").sound("piano")',
    use: [['Deux noms pour un même son', 'note("d#3 eb3").sound("piano")']],
    traps: [
      '`b` seul est la note si. `bb` = si bémol. `ab` = la bémol.',
      'Une même touche a deux noms (`c#` = `db`). On choisit selon la gamme dans laquelle on est.',
    ],
    see: ['sol.demi-ton', 'sol.noms-des-notes'],
    legacy: [['solfege', 'enharmonie']],
  },

  /* ------------------------------ gammes ------------------------------ */
  {
    id: 'sol.gamme', t: 'gamme', sub: 'un choix de notes', en: 'scale', kind: 'sol',
    ess: 'Une sélection de notes qui vont bien ensemble, rangées de la plus grave à la plus aiguë, comme un escalier.',
    code: 'n("0 1 2 3 4 5 6 7").scale("C:major").sound("piano")',
    see: ['sol.majeur', 'sol.mineur', 'sol.pentatonique', 'sol.degre', 'fn.scale'],
    legacy: [['solfege', 'gamme']],
  },
  {
    id: 'sol.majeur', t: 'gamme majeure', sub: 'claire, ouverte', en: 'major scale', kind: 'sol',
    ess: 'La gamme « do ré mi fa sol la si ». Couleur claire. Sa troisième note est à 4 demi-tons de la tonique.',
    code: 'n("0 1 2 3 4 5 6 7").scale("C:major").sound("piano")',
    use: [['La même à partir de sol', 'n("0 1 2 3 4 5 6 7").scale("G:major").sound("piano")']],
    args: [['recette', 'écarts entre les marches : ton, ton, demi-ton, ton, ton, ton, demi-ton.']],
    see: ['sol.mineur', 'sol.gamme', 'sol.tierce'],
    legacy: [['solfege', 'gamme majeure']],
  },
  {
    id: 'sol.mineur', t: 'gamme mineure', sub: 'sombre, mélancolique', en: 'minor scale', kind: 'sol',
    ess: 'La gamme la plus courante en musique électronique. Couleur sombre. Sa troisième note est à 3 demi-tons de la tonique.',
    code: 'n("0 1 2 3 4 5 6 7").scale("C:minor").sound("piano")',
    use: [['Majeur puis mineur, pour comparer', 'n("0 1 2 3 4 3 2 1").scale("<C:major C:minor>").sound("piano")']],
    args: [['recette', 'écarts entre les marches : ton, demi-ton, ton, ton, demi-ton, ton, ton.']],
    traps: ['« Mineur » ne veut pas dire « triste » : la plupart des morceaux de danse les plus énergiques sont en mineur.'],
    see: ['sol.majeur', 'sol.pentatonique', 'sol.tierce'],
    legacy: [['solfege', 'gamme mineure'], ['solfege', 'éolien']],
  },
  {
    id: 'sol.pentatonique', t: 'pentatonique', sub: 'cinq notes', en: 'pentatonic scale', kind: 'sol',
    ess: 'Une gamme de cinq notes, sans les deux qui frottent le plus. Tout y sonne bien : idéale pour improviser.',
    code: 'n("0 1 2 3 4 5 4 3").scale("A:minor:pentatonic").sound("piano")',
    use: [['Version majeure', 'n("0 1 2 3 4 5 4 3").scale("C:major:pentatonic").sound("piano")']],
    see: ['sol.mineur', 'fn.scale', 'fn.irand'],
    legacy: [['solfege', 'pentatonique']],
  },
  {
    id: 'sol.degre', t: 'degré', sub: 'une marche de la gamme', en: 'scale degree', kind: 'sol',
    ess: 'La position d’une note dans la gamme. Avec `n()`, on écrit directement les degrés.',
    code: 'n("0 2 4").scale("C:major").sound("piano")',
    traps: [
      'Les musiciens comptent les degrés à partir de 1 (souvent en chiffres romains : I, II, III…). Strudel compte à partir de 0. Le degré I est donc `n("0")`, le degré V `n("4")`.',
    ],
    see: ['fn.n', 'sol.tonique', 'sol.progression'],
    legacy: [['solfege', 'degré']],
  },
  {
    id: 'sol.tonique', t: 'tonique', sub: 'la note-maison', en: 'tonic, root', kind: 'sol',
    ess: 'La première note de la gamme, celle sur laquelle une mélodie se repose. Dans Strudel : `n("0")`.',
    code: 'n("0 2 4 7 4 2 0 ~").scale("A:minor").sound("piano")',
    use: [['Finir ailleurs laisse en suspens', 'n("0 2 4 7 4 2 1 ~").scale("A:minor").sound("piano")']],
    see: ['sol.tonalite', 'sol.degre', 'fn.scale'],
    legacy: [['solfege', 'tonique (I)']],
  },
  {
    id: 'sol.tonalite', t: 'tonalité', sub: 'tonique + type de gamme', en: 'key', kind: 'sol',
    ess: 'Dire qu’un morceau est « en la mineur », c’est donner sa tonalité : sa tonique (la) et sa gamme (mineure).',
    code: `$: n("0 2 4 [6 4] 2 ~ 0 ~").scale("A4:minor").sound("piano")
$: n("<0 -2 -4 -3>").scale("A2:minor").sound("sawtooth").lpf(500)`,
    traps: ['Toutes les pistes d’un morceau partagent en général la même tonalité : c’est ce qui les accorde entre elles.'],
    see: ['sol.tonique', 'sol.gamme', 'fn.transpose'],
    legacy: [['harmonie', 'tonalité']],
  },

  /* --------------------------- intervalles --------------------------- */
  {
    id: 'sol.intervalle', t: 'intervalle', sub: 'la distance entre deux notes', en: 'interval', kind: 'sol',
    ess: 'L’écart entre deux notes, compté en demi-tons. Chaque écart a un nom et une couleur.',
    code: 'note("c3 g3 [c3,g3] ~").sound("piano")',
    use: [
      ['Tierce mineure — 3 demi-tons', 'note("[c3,eb3]").sound("piano")'],
      ['Tierce majeure — 4 demi-tons', 'note("[c3,e3]").sound("piano")'],
      ['Quarte — 5 demi-tons', 'note("[c3,f3]").sound("piano")'],
      ['Quinte — 7 demi-tons', 'note("[c3,g3]").sound("piano")'],
      ['Octave — 12 demi-tons', 'note("[c3,c4]").sound("piano")'],
      ['Seconde mineure — 1 demi-ton : ça frotte', 'note("[c3,db3]").sound("piano")'],
    ],
    traps: ['Le nom compte les NOTES parcourues, extrémités comprises : do-ré-mi = trois notes = une tierce. Le nombre de demi-tons dit si elle est majeure ou mineure.'],
    see: ['sol.tierce', 'sol.quinte', 'sol.octave', 'sol.demi-ton'],
    legacy: [['harmonie', 'intervalle'], ['harmonie', 'consonance'], ['harmonie', 'dissonance']],
  },
  {
    id: 'sol.tierce', t: 'tierce', sub: 'majeure ou mineure', en: 'third', kind: 'sol',
    ess: 'L’intervalle qui donne sa couleur à l’harmonie. Majeure (4 demi-tons) : claire. Mineure (3 demi-tons) : sombre.',
    code: 'note("[c3,e3] ~ [c3,eb3] ~").sound("piano")',
    use: [
      ['Majeure, notes l’une après l’autre', 'note("c3 e3").sound("piano")'],
      ['Mineure, notes l’une après l’autre', 'note("c3 eb3").sound("piano")'],
    ],
    see: ['sol.intervalle', 'sol.accord', 'sol.majeur', 'sol.mineur'],
    legacy: [['harmonie', 'tierce']],
  },
  {
    id: 'sol.quinte', t: 'quinte', sub: '7 demi-tons', en: 'perfect fifth', kind: 'sol',
    ess: 'L’intervalle le plus stable après l’octave : do–sol. Deux notes à la quinte se renforcent.',
    code: 'note("[c3,g3]").sound("piano")',
    use: [['Une basse en quintes', 'note("c2 g2 c2 g2").sound("sawtooth").lpf(600)']],
    see: ['sol.intervalle', 'sol.accord'],
    legacy: [['harmonie', 'quinte juste']],
  },

  /* ------------------------------ accords ------------------------------ */
  {
    id: 'sol.accord', t: 'accord', sub: 'trois notes ou plus', en: 'chord', kind: 'sol',
    ess: 'Plusieurs notes jouées ensemble. L’accord de base a trois notes : la fondamentale, sa tierce et sa quinte.',
    code: 'note("[c3,e3,g3]").sound("piano")',
    use: [
      ['Majeur : tierce majeure', 'note("[c3,e3,g3]").sound("piano")'],
      ['Mineur : tierce mineure', 'note("[c3,eb3,g3]").sound("piano")'],
      ['Par son nom', 'chord("<C Cm>").voicing().sound("piano")'],
      ['Dans une gamme : une marche sur deux', 'n("[0,2,4]").scale("C:minor").sound("piano")'],
    ],
    traps: ['Majeur et mineur ne diffèrent que d’une note : la tierce, celle du milieu.'],
    see: ['sol.tierce', 'sol.quinte', 'fn.chord', 'sol.arpege', 'sol.progression'],
    legacy: [['harmonie', 'accord'], ['harmonie', 'triade']],
  },
  {
    id: 'sol.arpege', t: 'arpège', sub: 'un accord égrené', en: 'arpeggio', kind: 'sol',
    ess: 'Un accord dont on joue les notes l’une après l’autre au lieu de toutes ensemble.',
    code: 'note("[c3,e3,g3]").arp("0 1 2 1").sound("piano")',
    use: [['Écrit à la main', 'note("c3 e3 g3 e3").sound("piano")']],
    see: ['fn.arp', 'sol.accord', 'genre.arpege-trance'],
  },
  {
    id: 'sol.progression', t: 'progression', sub: 'une suite d’accords', en: 'chord progression', kind: 'sol',
    ess: 'L’enchaînement des accords d’un morceau, souvent quatre, qui tourne en boucle.',
    code: 'chord("<Am F C G>").voicing().sound("piano")',
    use: [
      ['I – V – vi – IV, en do majeur', 'chord("<C G Am F>").voicing().sound("piano")'],
      ['I – IV – V', 'chord("<C F G G>").voicing().sound("piano")'],
      ['Avec les degrés', 'n("<[0,2,4] [4,6,8] [5,7,9] [3,5,7]>").scale("C:major").sound("piano")'],
    ],
    traps: ['Les chiffres romains désignent la marche de départ de l’accord, comptée à partir de 1. Majuscules = accord majeur, minuscules = mineur.'],
    see: ['fn.chord', 'sol.accord', 'sol.degre'],
    legacy: [['harmonie', 'I-IV-V'], ['harmonie', 'I-V-vi-IV'], ['harmonie', 'cadence']],
  },

  /* ------------------------------- son ------------------------------- */
  {
    id: 'sol.timbre', t: 'timbre', sub: 'la couleur d’un son', en: 'timbre', kind: 'sol',
    ess: 'Ce qui distingue deux instruments jouant la même note, à la même hauteur et au même volume.',
    code: 'note("c3 c3").sound("<piano sawtooth>*2")',
    see: ['son.ondes', 'fx.lpf', 'sol.enveloppe'],
    legacy: [['son', 'timbre'], ['son', 'harmonique']],
  },
  {
    id: 'sol.enveloppe', t: 'enveloppe', sub: 'la forme du son dans le temps', en: 'envelope, ADSR', kind: 'sol',
    ess: 'La façon dont un son apparaît, se maintient et s’éteint. Quatre temps : attaque, retombée, maintien, extinction (ADSR).',
    code: 'note("c3 e3 g3 e3").sound("sawtooth").lpf(1500).attack(.01).decay(.15).sustain(.3).release(.2)',
    use: [
      ['Percussif', 'note("c3 e3 g3 e3").sound("sawtooth").lpf(1500).decay(.1).sustain(0)'],
      ['Nappe', 'note("[c3,eb3,g3]").sound("sawtooth").lpf(1200).attack(.5).release(1)'],
    ],
    see: ['fx.attack', 'fx.decay', 'fx.sustain', 'fx.release', 'fx.adsr'],
    legacy: [['son', 'pad / nappe']],
  },
];
