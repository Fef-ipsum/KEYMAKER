// Wiki — solfège : le son d'abord, le nom ensuite, la théorie en dernier.
// Chaque notion a un exemple à écouter. Forme des entrées : voir mini.js.

export default [
  /* ------------------------------ rythme ------------------------------ */
  {
    id: 'sol.cycle', t: 'cycle', sub: 'la boucle de Strudel', en: 'cycle', kind: 'sol',
    schema: { type: 'cycle', motif: 'bd hh sd hh', missions: [] },
    ess:
      'L’unité de temps de Strudel : une boucle qui se répète. Tout ce qu’on écrit entre guillemets se partage UN cycle : `"bd hh sd hh"` découpe le cycle en 4 parts égales. ' +
      'Sans réglage, un cycle dure 2 secondes ([setcpm](fn.setcpm) le change).',
    code: `// 4 sons dans un cycle de 2 s : un toutes les 0,5 s
sound("bd hh sd hh")`,
    args: [
      ['durée', '60 ÷ cpm secondes : 2 s sans réglage (30 cycles par minute) ; 1,94 s à `setcpm(124/4)`.'],
      ['subdivision', 'n éléments entre guillemets = n parts égales du cycle. Avec des crochets, une part se redécoupe : `"bd [hh hh]"` = une moitié, puis deux quarts.'],
    ],
    why: [
      'Strudel ne pense pas en temps ni en mesures, mais en fractions de cycle. C’est ce qui rend la [mini-notation](mini.espace) si compacte : on écrit une liste, le moteur la répartit dans le cycle.',
      'Les fonctions de temps comptent en cycles : [slow](fn.slow)`(4)` étale sur 4 cycles, [lastOf](fn.lastOf)`(4, …)` agit un cycle sur 4, les chevrons `< >` changent de valeur à chaque cycle.',
    ],
    use: [
      ['Plus d’éléments, même durée de cycle : chacun est plus court', 'sound("bd hh sd hh bd bd sd hh")'],
      ['Une valeur différente à chaque cycle', 'sound("bd <hh oh> sd <hh cp>")'],
    ],
    traps: [
      'Un cycle n’est pas forcément une mesure. C’est une convention : dans cette app, on choisit 1 cycle = 1 mesure de 4 temps, d’où `setcpm(BPM/4)`.',
      'Ajouter des éléments ne rallonge pas le cycle : ils deviennent chacun plus courts.',
    ],
    see: ['sol.mesure', 'sol.temps', 'fn.setcpm', 'mini.espace'],
    legacy: [['rythme', 'cycle']],
  },
  {
    id: 'sol.tempo', t: 'tempo', sub: 'la vitesse du morceau', en: 'tempo, BPM', kind: 'sol',
    schema: { type: 'tempo', reglages: { bpm: 120 }, temps: 4 },
    ess:
      'La vitesse de la pulsation, en battements par minute (BPM, *beats per minute*). 60 BPM = un [temps](sol.temps) par seconde ; 120 BPM = deux par seconde. ' +
      'Dans Strudel, on le règle avec `setcpm(BPM/4)` quand un cycle contient 4 temps.',
    code: `// 120 BPM : un temps toutes les 0,5 s
setcpm(120/4)
sound("bd*4, hh*8")`,
    args: [
      ['durée d’un temps', '60 ÷ BPM secondes : 0,5 s à 120 BPM, 0,44 s à 135 BPM.'],
      ['repères', 'ballade 60–80 · hip-hop 85–100 · house 120–128 · techno 125–140 (au-delà, techno dure) · trance 130–142 · drum & bass 160–180 (voir [tempo des genres](genre.tempo)).'],
    ],
    why: ['Le tempo n’est pas une vitesse « de notes » mais celle de la pulsation qu’on suit du pied. On peut jouer des notes très rapides sur un tempo lent (des doubles-croches à 70 BPM), ou très peu de notes sur un tempo rapide.'],
    use: [
      ['Lent : 80 BPM', 'setcpm(80/4)\nsound("bd*4, hh*8")'],
      ['Techno : 135 BPM', 'setcpm(135/4)\nsound("bd*4, hh*8")'],
    ],
    traps: [
      'Le tempo ne dit rien de la densité : un morceau lent peut être plein de notes rapides.',
      '`setcpm(120)` sans `/4` donne 120 CYCLES par minute, soit 480 BPM avec 4 temps par cycle.',
    ],
    see: ['fn.setcpm', 'sol.temps', 'genre.tempo'],
    legacy: [['rythme', 'tempo'], ['rythme', 'BPM']],
  },
  {
    id: 'sol.temps', t: 'temps', sub: 'la pulsation', en: 'beat', kind: 'sol',
    schema: { type: 'cycle', motif: 'bd*4', missions: [] },
    ess:
      'Les battements réguliers d’un morceau, ceux qu’on tape du pied. Ils forment une grille sur laquelle tout le reste se place. ' +
      'Une note qui dure un temps s’appelle une *noire* ; dans une mesure à 4 temps, `bd*4` met un kick sur chaque temps.',
    code: `// un kick sur chacun des 4 temps
sound("bd bd bd bd")`,
    why: ['L’oreille cherche spontanément une régularité dans ce qu’elle entend et s’y cale : c’est la pulsation. Elle reste perçue même quand rien ne joue sur un temps : un silence sur le temps 3 s’entend comme un « trou » dans la grille.'],
    use: [['Kick sur les temps, charleston entre les temps', 'sound("bd*4, [~ hh]*4")']],
    traps: ['Le temps n’est pas forcément joué : dans beaucoup de morceaux, rien ne frappe sur tous les temps, mais on les sent quand même.'],
    see: ['sol.mesure', 'sol.croche', 'sol.contretemps', 'sol.tempo'],
    legacy: [['rythme', 'temps']],
  },
  {
    id: 'sol.mesure', t: 'mesure', sub: 'un groupe de temps', en: 'bar, measure', kind: 'sol',
    schema: { type: 'cycle', motif: 'bd hh sd hh', missions: [] },
    ess:
      'Un groupe de temps qui se répète, dont le premier est le plus appuyé. La plus courante compte 4 temps, notée 4/4 (« quatre noires par mesure »). ' +
      'Dans cette app, un [cycle](sol.cycle) = une mesure de 4 temps.',
    code: `// 4 temps : kick sur chaque temps, clap sur 2 et 4
sound("bd bd bd bd, ~ cp ~ cp")`,
    args: [
      ['4/4', '4 temps d’une noire : rock, pop, quasiment toute la musique électronique de danse.'],
      ['3/4', '3 temps : valse. Dans Strudel : 3 éléments par cycle et `setcpm(BPM/3)`.'],
      ['6/8', '2 temps divisés chacun en 3 croches : un balancement ternaire. Dans Strudel : `"[a b c] [d e f]"`.'],
    ],
    why: [
      'Le regroupement en mesures vient de l’accentuation : on entend « UN deux trois quatre, UN deux trois quatre ». Le premier temps, plus fort ou marqué par un changement (accord, basse), donne le repère.',
      'Au-dessus de la mesure, la musique de danse se compte par phrases de 4, 8 ou 16 mesures : c’est à ces endroits que les éléments entrent, sortent ou changent (voir [structure](genre.structure)).',
    ],
    use: [['Une valse : 3 temps par cycle', 'setcpm(90/3)\nsound("bd hh hh")']],
    traps: ['La musique de danse se compte par groupes de 4, 8 ou 16 mesures : c’est à ces endroits que les choses changent.'],
    see: ['sol.temps', 'sol.cycle', 'genre.structure'],
    legacy: [['rythme', 'mesure 4/4']],
  },
  {
    id: 'sol.croche', t: 'noire, croche, double-croche', sub: 'les durées', en: 'quarter, eighth, sixteenth note', kind: 'sol',
    schema: { type: 'cycle', motif: 'bd*4, hh*8', missions: [] },
    ess:
      'Les noms des durées, par divisions successives par deux. Une noire dure un temps ; une croche, un demi-temps ; une double-croche, un quart de temps. ' +
      'Dans une mesure de 4 temps = 1 cycle : `*4` = noires, `*8` = croches, `*16` = doubles-croches.',
    code: `// noires au kick, croches au charleston
sound("bd*4, hh*8")`,
    args: [
      ['ronde', '4 temps, toute la mesure : `*1`.'],
      ['blanche', '2 temps : `*2`.'],
      ['noire', '1 temps : `*4`.'],
      ['croche', '1/2 temps : `*8`. À 120 BPM, 0,25 s.'],
      ['double-croche', '1/4 de temps : `*16`. À 120 BPM, 0,125 s.'],
      ['triolet', '3 notes égales à la place de 2 : `*12` donne des triolets de croches.'],
    ],
    why: ['Chaque durée vaut la moitié de la précédente : c’est un système binaire. Le triolet sort de ce système (division par 3) et donne un balancement ternaire, celui du shuffle et du swing.'],
    use: [
      ['Noires : 4 par mesure', 'sound("hh*4")'],
      ['Croches : 8 par mesure', 'sound("hh*8")'],
      ['Doubles-croches : 16 par mesure', 'sound("hh*16")'],
      ['Triolets de croches : 12 par mesure', 'sound("bd*4, hh*12")'],
    ],
    traps: ['Les noms anglais (américains) comptent en fractions de ronde : *quarter note* (un quart de ronde) = noire, *eighth note* = croche, *sixteenth note* = double-croche. En 4/4, une ronde remplit exactement une mesure, d’où la coïncidence.'],
    see: ['sol.temps', 'mini.etoile', 'mini.crochets'],
    legacy: [['rythme', 'subdivision']],
  },
  {
    id: 'sol.contretemps', t: 'contretemps', sub: 'entre les temps', en: 'offbeat, backbeat', kind: 'sol',
    schema: { type: 'cycle', motif: 'bd*4, [~ hh]*4', missions: [] },
    ess:
      'Ce qui tombe ENTRE les temps, au milieu de deux battements (*offbeat*). Le charleston ouvert à contretemps, entre deux kicks, est la signature de la house et de la techno. ' +
      'À ne pas confondre avec le *backbeat* : l’accent sur les temps 2 et 4.',
    code: `// kick sur les temps, charleston entre
sound("bd*4, [~ hh]*4")`,
    why: ['Un son à contretemps crée une alternance « boum - tchi - boum - tchi » : le corps entend la pulsation (le kick) ET son rebond. Cette tension entre le temps et l’entre-temps donne l’élan, l’impression que le rythme avance.'],
    use: [
      ['Charleston ouvert à contretemps', 'sound("bd*4, [~ oh]*4")'],
      ['Backbeat : clap sur 2 et 4', 'sound("bd*4, ~ cp ~ cp")'],
      ['Les deux à la fois', 'sound("bd*4, ~ cp ~ cp, [~ oh]*4")'],
    ],
    traps: ['En mini-notation, `[~ hh]*4` place le charleston sur la seconde moitié de chaque temps : c’est le contretemps de croche. `[~ ~ ~ hh]*4` le met sur la dernière double-croche, un contretemps plus serré.'],
    see: ['mini.silence', 'genre.hats', 'sol.temps'],
    legacy: [['structure', 'backbeat'], ['structure', 'offbeat hat']],
  },

  /* ------------------------------ notes ------------------------------ */
  {
    id: 'sol.hauteur', t: 'hauteur', sub: 'grave ou aigu', en: 'pitch', kind: 'sol',
    schema: { type: 'clavier', mode: 'notes', notes: 'c3 c4', missions: ['octave'] },
    ess:
      'Ce qui fait qu’une note est grave ou aiguë. Physiquement, c’est la fréquence de la vibration : le nombre d’allers-retours par seconde, en hertz (Hz). ' +
      'Le la du diapason (`a4`) vibre 440 fois par seconde ; plus la fréquence est élevée, plus la note est aiguë.',
    code: `// c3 puis c4 : fréquence doublée
// (131 puis 262 Hz)
note("c3 c4").sound("piano")`,
    args: [
      ['20 à 20 000 Hz', 'l’étendue de l’oreille humaine jeune ; la limite haute baisse avec l’âge.'],
      ['27,5 à 4 186 Hz', 'l’étendue d’un piano, de `a0` à `c8`.'],
      ['440 Hz', '`a4`, le la du diapason, référence d’accordage.'],
      ['× 2', 'une [octave](sol.octave) : même nom de note, fréquence doublée.'],
      ['× 1,0595', 'un [demi-ton](sol.demi-ton) : l’octave est partagée en 12 demi-tons égaux, chacun multiplie la fréquence par 2^(1/12).'],
    ],
    why: [
      'Une source qui vibre (une corde, une membrane, un haut-parleur) pousse l’air à la même fréquence ; l’oreille interne capte cette vibration et le cerveau la perçoit comme une hauteur.',
      'L’oreille juge les hauteurs en RAPPORTS, pas en différences : de 110 à 220 Hz et de 440 à 880 Hz, on entend le même écart, une octave, alors que le premier fait 110 Hz et le second 440. C’est pourquoi les notes avancent par multiplications (×1,0595 par demi-ton), et pourquoi les réglages de fréquence, comme la coupure d’un [filtre](fx.lpf), se pensent en octaves.',
      'Un son réel contient beaucoup de fréquences ; la hauteur perçue est en général celle de la fondamentale, la plus basse de la série des harmoniques. Les autres font le [timbre](sol.timbre).',
    ],
    use: [
      ['Le même do sur quatre octaves', 'note("c2 c3 c4 c5").sound("piano")'],
      ['Écrire directement une fréquence, en hertz : `freq`', '// 220, 330, 440 puis 660 Hz\nfreq("220 330 440 660").sound("triangle")'],
    ],
    traps: [
      'Hauteur et volume sont indépendants : une note aiguë n’est pas plus forte. Mais l’oreille est plus sensible dans le médium-aigu (autour de 2 000 à 5 000 Hz) que dans le grave : à énergie égale, le grave paraît plus faible.',
      'Hauteur et timbre aussi : un son « brillant » n’est pas une note plus aiguë.',
      'Dans Strudel, `c4` est le do central du piano (environ 261,6 Hz) ; beaucoup de méthodes françaises l’appellent do3 (voir [octave](sol.octave)).',
    ],
    see: ['sol.octave', 'sol.demi-ton', 'sol.noms-des-notes', 'fn.note', 'sol.midi'],
    legacy: [['solfege', 'hauteur'], ['solfege', 'fréquence']],
  },
  {
    id: 'sol.noms-des-notes', t: 'do ré mi = C D E', sub: 'les noms des notes', en: 'note names', kind: 'sol',
    schema: { type: 'clavier', mode: 'notes', notes: 'c3 d3 e3 f3 g3 a3 b3', missions: [] },
    ess:
      'C = do · D = ré · E = mi · F = fa · G = sol · A = la · B = si. Le français utilise les syllabes, l’anglais (et Strudel) les lettres. ' +
      'Les sept noms désignent les touches blanches du piano ; les touches noires se nomment avec [dièse ou bémol](sol.diese-bemol).',
    code: `// do ré mi fa sol la si do
note("c d e f g a b c4").sound("piano")`,
    why: [
      'Les syllabes viennent d’un hymne latin à saint Jean-Baptiste, *Ut queant laxis*, dont chaque vers commence une note plus haut : ut, ré, mi, fa, sol, la. On attribue à Guido d’Arezzo, au XIᵉ siècle, l’idée d’en faire des noms de notes. « Ut » est devenu « do » au XVIIᵉ siècle, et « si » a été ajouté pour la septième note.',
      'Les lettres, elles, commencent au la (A) : c’est un héritage historique, et do tombe donc sur C.',
    ],
    use: [
      ['Do, mi, sol', 'note("c e g").sound("piano")'],
      ['La, si, do', 'note("a b c4").sound("piano")'],
    ],
    traps: [
      'La série de lettres commence au LA (A), pas au do. Retiens : C = do.',
      'En Allemagne et dans quelques pays, la lettre H désigne le si et B le si bémol. Strudel suit l’usage anglais : B = si.',
      'Sans chiffre d’octave, `c` = `c3` : après `b` (si3), le do suivant s’écrit `c4`.',
    ],
    see: ['sol.octave', 'sol.diese-bemol', 'fn.note'],
    legacy: [['solfege', 'nom des notes']],
  },
  {
    id: 'sol.octave', t: 'octave', sub: 'la même note, plus haut', en: 'octave', kind: 'sol',
    schema: { type: 'clavier', mode: 'notes', notes: 'c3 c4', missions: ['octave'] },
    ess:
      'L’écart entre une note et la suivante du même nom : 12 [demi-tons](sol.demi-ton), et une fréquence exactement doublée. Do3 et do4 sonnent comme « la même note », l’une plus aiguë. ' +
      'Dans Strudel, le chiffre après la lettre est le numéro d’octave : `c3`, `c4`.',
    code: `// do3 puis do4 : 131 puis 262 Hz
note("c3 c4").sound("piano")`,
    args: [['numéro', 'notation internationale : `c4` = do central du piano (261,6 Hz), `a4` = la du diapason (440 Hz). Le numéro change au DO : `b3` puis `c4`. Sans chiffre, Strudel prend 3.']],
    why: ['Quand la fréquence double, toutes les harmoniques de la note aiguë coïncident avec des harmoniques de la note grave (une sur deux). L’oreille entend alors une fusion presque parfaite : c’est pour cela que les deux notes portent le même nom, dans toutes les cultures musicales.'],
    use: [
      ['Les deux ensemble : elles fusionnent', 'note("[c3,c4]").sound("piano")'],
      ['Le même do sur six octaves', 'note("c1 c2 c3 c4 c5 c6").sound("piano")'],
      ['Monter une ligne d’une octave', 'note("c3 eb3 g3").add(note(12)).sound("piano")'],
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
    ess:
      'Chaque note a un numéro, de 0 à 127 : +1 = un demi-ton plus haut, +12 = une octave. 60 est le do central (`c4`), 69 le la du diapason (`a4`, 440 Hz). ' +
      'C’est la façon dont les machines (claviers, logiciels) désignent les hauteurs.',
    code: `// do ré mi fa sol, en numéros
note("60 62 64 65 67").sound("piano")`,
    args: [['repères', '48 = `c3` (le do que joue `c` tout seul) · 60 = `c4` · 69 = `a4` (440 Hz) · 72 = `c5`. Fréquence = 440 × 2^((n − 69) / 12).']],
    why: ['Le MIDI (*Musical Instrument Digital Interface*, 1983) est la norme qui permet aux instruments électroniques de communiquer. Numéroter les notes rend les calculs simples : transposer, c’est additionner ; un intervalle, c’est une soustraction.'],
    use: [['Des calculs sur les notes : une gamme chromatique', 'note(run(13).add(60)).sound("piano")']],
    traps: [
      '48 = `c3` (le do que joue `c` tout seul), 60 = `c4`, 69 = `a4` (le la du diapason, 440 Hz).',
      'Après `.add(note(…))`, Strudel affiche les notes en numéros MIDI : c’est la même hauteur.',
    ],
    see: ['sol.octave', 'sol.demi-ton', 'fn.note'],
  },
  {
    id: 'sol.demi-ton', t: 'demi-ton', sub: 'la plus petite marche', en: 'semitone, half step', kind: 'sol',
    schema: { type: 'clavier', mode: 'notes', notes: 'c3 c#3', missions: ['demiton'] },
    ess:
      'Le plus petit écart entre deux notes de la musique occidentale : d’une touche de piano à sa voisine immédiate, noire ou blanche. ' +
      'L’octave est partagée en 12 demi-tons égaux ; chacun multiplie la fréquence par 1,0595.',
    code: `// mi puis fa : un demi-ton
note("e3 f3").sound("piano")`,
    args: [['en fréquence', '× 2^(1/12) ≈ 1,0595, soit environ 6 % de plus. En *cents* (centièmes de demi-ton) : 100 cents.']],
    why: ['Ce partage en 12 parts égales s’appelle le *tempérament égal*. Il permet de jouer dans toutes les tonalités avec les mêmes touches, au prix d’un léger désaccord des intervalles « purs » (voir [intervalle](sol.intervalle)).'],
    use: [['Les 12 demi-tons d’une octave : la gamme chromatique', 'n("0 1 2 3 4 5 6 7 8 9 10 11 12").scale("C3:chromatic").sound("piano")']],
    traps: ['Mi–fa et si–do sont déjà à un demi-ton : il n’y a pas de touche noire entre eux.'],
    see: ['sol.ton', 'sol.diese-bemol', 'sol.intervalle'],
    legacy: [['solfege', 'demi-ton'], ['solfege', 'gamme chromatique']],
  },
  {
    id: 'sol.ton', t: 'ton', sub: 'deux demi-tons', en: 'whole tone, whole step', kind: 'sol',
    schema: { type: 'clavier', mode: 'notes', notes: 'c3 d3', missions: [] },
    ess: 'Deux [demi-tons](sol.demi-ton). De do à ré, il y a un ton (do, do#, ré). Les gammes se décrivent par leur suite de tons (T) et de demi-tons (½).',
    code: `// do puis ré : un ton
note("c3 d3").sound("piano")`,
    why: ['Les gammes majeure et mineure mélangent 5 tons et 2 demi-tons. C’est la place des deux demi-tons qui leur donne leur caractère : en majeur, ils tombent entre les degrés 3-4 et 7-8 ; en mineur, entre 2-3 et 5-6.'],
    use: [['Une gamme par tons : uniquement des tons, aucun demi-ton', 'note("c3 d3 e3 f#3 g#3 a#3 c4").sound("piano")']],
    traps: ['Entre mi et fa, et entre si et do, il n’y a qu’un demi-ton : mi–fa# fait un ton.'],
    see: ['sol.demi-ton', 'sol.majeur'],
    legacy: [['solfege', 'ton']],
  },
  {
    id: 'sol.diese-bemol', t: '#  et  b', sub: 'dièse et bémol', en: 'sharp, flat', kind: 'sol',
    schema: { type: 'clavier', mode: 'notes', notes: 'c3 c#3 d3', missions: ['demiton'] },
    ess: 'Le dièse `#` monte une note d’un demi-ton ; le bémol `b` la descend d’un demi-ton. C’est ainsi qu’on nomme les touches noires du piano : do# (ou réb) est la touche entre do et ré.',
    code: `// mi, mi bémol, mi, fa
note("e3 eb3 e3 f3").sound("piano")`,
    why: ['Une même touche a deux noms (`c#` = `db`) : on dit qu’ils sont *enharmoniques*. On choisit le nom selon la gamme dans laquelle on joue, pour que chaque lettre n’apparaisse qu’une fois : en fa majeur, on écrit si bémol (fa sol la sib), pas la dièse.'],
    use: [['Do, do dièse, ré', 'note("c3 c#3 d3").sound("piano")']],
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
    schema: { type: 'clavier', mode: 'gamme', gamme: 'C3:major', missions: ['mineure', 'penta'] },
    ess:
      'Une sélection de notes, rangées de la plus grave à la plus aiguë, qui forment le vocabulaire d’un morceau. Une gamme se définit par sa note de départ (la [tonique](sol.tonique)) et sa suite d’écarts (tons et demi-tons). ' +
      'Rester dans la gamme garantit que les notes s’accordent entre elles.',
    code: `// do majeur : 7 notes, puis le do de l’octave
n("0 1 2 3 4 5 6 7").scale("C:major")
  .sound("piano")`,
    why: ['Sur les 12 demi-tons de l’octave, une gamme en choisit en général 7 (ou 5 pour une pentatonique). Ce choix crée une hiérarchie : la tonique est le point de repos, les autres notes tirent plus ou moins vers elle. C’est ce qui donne à une mélodie l’impression d’aller quelque part.'],
    use: [
      ['Majeure : claire', 'n("0 1 2 3 4 5 6 7").scale("C:major").sound("piano")'],
      ['Mineure : sombre', 'n("0 1 2 3 4 5 6 7").scale("C:minor").sound("piano")'],
      ['Pentatonique : 5 notes', 'n("0 1 2 3 4 5").scale("C:minor:pentatonic").sound("piano")'],
    ],
    traps: ['Une gamme n’est pas une mélodie : c’est le réservoir de notes dans lequel la mélodie puise, dans n’importe quel ordre.'],
    see: ['sol.majeur', 'sol.mineur', 'sol.pentatonique', 'sol.degre', 'fn.scale'],
    legacy: [['solfege', 'gamme']],
  },
  {
    id: 'sol.majeur', t: 'gamme majeure', sub: 'claire, ouverte', en: 'major scale', kind: 'sol',
    schema: { type: 'clavier', mode: 'gamme', gamme: 'C3:major', missions: ['tonique'] },
    ess:
      'La gamme « do ré mi fa sol la si » : les touches blanches du piano, à partir de do. Sa couleur est claire, stable. ' +
      'Ce qui la définit : sa troisième note est à 4 demi-tons de la tonique (une [tierce](sol.tierce) majeure).',
    code: `// do majeur, montée
n("0 1 2 3 4 5 6 7").scale("C:major")
  .sound("piano")`,
    args: [['recette', 'écarts entre les marches : ton, ton, demi-ton, ton, ton, ton, demi-ton (T T ½ T T T ½). Partir de n’importe quelle note avec cette recette donne une gamme majeure.']],
    why: ['La tierce majeure (rapport de fréquences proche de 5:4) et la septième à un demi-ton de la tonique (la *sensible*, qui « tire » vers la tonique) donnent à la gamme majeure son impression de lumière et de résolution.'],
    use: [['La même gamme à partir de sol : un fa dièse apparaît, pour respecter la recette', 'n("0 1 2 3 4 5 6 7").scale("G:major").sound("piano")']],
    traps: ['« Majeur » décrit la tierce, pas le volume ni la gaieté obligatoire : beaucoup de morceaux mélancoliques sont en majeur.'],
    see: ['sol.mineur', 'sol.gamme', 'sol.tierce'],
    legacy: [['solfege', 'gamme majeure']],
  },
  {
    id: 'sol.mineur', t: 'gamme mineure', sub: 'sombre, mélancolique', en: 'minor scale', kind: 'sol',
    schema: { type: 'clavier', mode: 'gamme', gamme: 'A3:minor', missions: [] },
    ess:
      'La gamme « la si do ré mi fa sol » : les mêmes touches blanches que do majeur, mais à partir de la. Couleur sombre. ' +
      'Ce qui la définit : sa troisième note est à 3 demi-tons de la tonique (une [tierce](sol.tierce) mineure). C’est la gamme la plus courante en musique électronique.',
    code: `// la mineur, montée
n("0 1 2 3 4 5 6 7").scale("A:minor")
  .sound("piano")`,
    args: [['recette', 'écarts : ton, demi-ton, ton, ton, demi-ton, ton, ton (T ½ T T ½ T T). C’est la mineure « naturelle » ; il en existe des variantes (`harmonic:minor`, avec une septième relevée).']],
    why: [
      'La tierce mineure, la sixte et la septième abaissées par rapport au majeur donnent cette couleur sombre. La mineur et do majeur partagent exactement les mêmes notes : on dit qu’elles sont *relatives*. Seul le point de repos change.',
    ],
    use: [['Même tonique, deux gammes : do majeur puis do mineur', 'n("0 1 2 3 4 5 6 7").scale("<C:major C:minor>").sound("piano")']],
    traps: ['« Mineur » ne veut pas dire « triste » : la plupart des morceaux de danse les plus énergiques sont en mineur.'],
    see: ['sol.majeur', 'sol.pentatonique', 'sol.tierce'],
    legacy: [['solfege', 'gamme mineure'], ['solfege', 'éolien']],
  },
  {
    id: 'sol.pentatonique', t: 'pentatonique', sub: 'cinq notes', en: 'pentatonic scale', kind: 'sol',
    schema: { type: 'clavier', mode: 'gamme', gamme: 'A3:minor:pentatonic', missions: [] },
    ess:
      'Une gamme de cinq notes. La pentatonique mineure de la : la, do, ré, mi, sol. Elle retire de la gamme les deux notes qui forment des demi-tons, celles qui « frottent » : ' +
      'toutes les combinaisons sonnent bien, d’où son usage pour improviser.',
    code: `// la mineur pentatonique
n("0 1 2 3 4 5 4 3").scale("A:minor:pentatonic")
  .sound("piano")`,
    args: [
      ['mineure', 'degrés 1, 3♭, 4, 5, 7♭ : en la, la do ré mi sol. `"A:minor:pentatonic"`.'],
      ['majeure', 'degrés 1, 2, 3, 5, 6 : en do, do ré mi sol la. Mêmes notes que la mineure pentatonique de la. `"C:major:pentatonic"`.'],
    ],
    why: ['Sans demi-ton, aucune paire de notes de la gamme n’est très dissonante : même jouées ensemble ou au hasard, elles s’accordent. On la retrouve dans le blues, le rock, les musiques d’Asie, d’Afrique de l’Ouest et dans beaucoup de mélodies populaires.'],
    use: [['Une improvisation au hasard qui ne sonne jamais faux', 'n(irand(10).segment(8)).scale("A3:minor:pentatonic")\n  .sound("triangle")']],
    traps: ['Pour un nom en trois parties, deux-points partout : `"A:minor:pentatonic"`, pas `"A:minor pentatonic"`.'],
    see: ['sol.mineur', 'fn.scale', 'fn.irand'],
    legacy: [['solfege', 'pentatonique']],
  },
  {
    id: 'sol.degre', t: 'degré', sub: 'une marche de la gamme', en: 'scale degree', kind: 'sol',
    schema: { type: 'clavier', mode: 'gamme', gamme: 'C3:major', missions: [] },
    ess:
      'La position d’une note dans sa gamme : la tonique est le 1er degré, la note suivante le 2e, etc. Penser en degrés plutôt qu’en noms de notes permet de décrire une mélodie ou un accord indépendamment de la tonalité. ' +
      'Avec `n()` et `scale()`, on écrit directement des degrés.',
    code: `// degrés I, III et V de do majeur : do, mi, sol
n("0 2 4").scale("C:major").sound("piano")`,
    args: [['noms traditionnels', 'I tonique · II sus-tonique · III médiante · IV sous-dominante · V dominante · VI sus-dominante · VII sensible (quand elle est à un demi-ton de la tonique).']],
    why: ['Chaque degré a un rôle : la tonique (I) repose, la dominante (V) crée une tension qui appelle la tonique, la sensible (VII) « tire » vers elle. Ces rôles sont les mêmes dans toutes les tonalités : c’est pourquoi une progression s’écrit en degrés (I–V–vi–IV).'],
    use: [['Tension puis repos : degré V puis degré I', 'n("<[4,6,8] [0,2,4]>").scale("C3:major").sound("piano")']],
    traps: ['Les musiciens comptent les degrés à partir de 1 (souvent en chiffres romains : I, II, III…). Strudel compte à partir de 0. Le degré I est donc `n("0")`, le degré V `n("4")`.'],
    see: ['fn.n', 'sol.tonique', 'sol.progression'],
    legacy: [['solfege', 'degré']],
  },
  {
    id: 'sol.tonique', t: 'tonique', sub: 'la note-maison', en: 'tonic, root', kind: 'sol',
    schema: { type: 'clavier', mode: 'gamme', gamme: 'C3:major', missions: ['tonique'] },
    ess:
      'La première note de la gamme, celle sur laquelle une mélodie se repose. Finir sur la tonique donne une impression de conclusion ; finir ailleurs laisse en suspens. ' +
      'Dans Strudel : `n("0")` après `.scale(…)`.',
    code: `// la mélodie part de la tonique et y revient
n("0 2 4 7 4 2 0 ~").scale("A:minor")
  .sound("piano")`,
    why: ['L’oreille repère la tonique parce qu’elle revient souvent, tombe sur les temps forts et sert de fondamentale à l’accord principal. Une fois établie, toutes les autres notes sont entendues par rapport à elle.'],
    use: [['Finir ailleurs : la phrase reste en suspens', 'n("0 2 4 7 4 2 1 ~").scale("A:minor").sound("piano")']],
    traps: ['La tonique n’est pas forcément la note la plus grave ni la première jouée : c’est la note de repos.'],
    see: ['sol.tonalite', 'sol.degre', 'fn.scale'],
    legacy: [['solfege', 'tonique (I)']],
  },
  {
    id: 'sol.tonalite', t: 'tonalité', sub: 'tonique + type de gamme', en: 'key', kind: 'sol',
    ess:
      'Dire qu’un morceau est « en la mineur », c’est donner sa tonalité : sa [tonique](sol.tonique) (la) et sa gamme (mineure). Toutes les pistes qui partagent la même tonalité s’accordent entre elles. ' +
      'Dans Strudel, c’est la valeur donnée à `.scale("A:minor")`.',
    code: `// basse et mélodie, toutes deux en la mineur
$: n("0 2 4 [6 4] 2 ~ 0 ~").scale("A4:minor").sound("piano")
$: n("0 ~ 0 ~").scale("A2:minor").sound("sawtooth").lpf(400)`,
    why: ['Changer de tonalité (moduler) en cours de morceau est un effet fort : toutes les notes se déplacent, l’oreille perd puis retrouve son repère. En musique électronique, on module rarement ; on reste souvent dans une seule tonalité tout le morceau.'],
    use: [['Le même morceau, une tonalité par cycle : la mineur puis ré mineur', '$: n("0 2 4 2").scale("<A3:minor D4:minor>").sound("piano")\n$: n("0 ~ 0 ~").scale("<A1:minor D2:minor>").sound("sawtooth").lpf(400)']],
    traps: ['Toutes les pistes d’un morceau partagent en général la même tonalité : c’est ce qui les accorde entre elles.'],
    see: ['sol.tonique', 'sol.gamme', 'fn.transpose'],
    legacy: [['harmonie', 'tonalité']],
  },

  /* --------------------------- intervalles --------------------------- */
  {
    id: 'sol.intervalle', t: 'intervalle', sub: 'la distance entre deux notes', en: 'interval', kind: 'sol',
    schema: { type: 'clavier', mode: 'intervalle', a: 'c3', b: 'g3', missions: ['tierce-majeure', 'tierce-mineure'] },
    ess:
      'L’écart entre deux notes, compté en [demi-tons](sol.demi-ton). Chaque écart a un nom (tierce, quinte…) et une couleur : certains fusionnent (consonants), d’autres frottent (dissonants). ' +
      'Physiquement, c’est le RAPPORT entre leurs deux fréquences.',
    code: `// do, sol, puis les deux ensemble : une quinte
note("c3 g3 [c3,g3] ~").sound("piano")`,
    args: [
      ['1 demi-ton', 'seconde mineure : frotte fortement.'],
      ['2', 'seconde majeure (un ton).'],
      ['3', 'tierce mineure : sombre (rapport pur 6:5).'],
      ['4', 'tierce majeure : claire (5:4).'],
      ['5', 'quarte juste (4:3).'],
      ['6', 'triton : très instable.'],
      ['7', 'quinte juste : très stable (3:2).'],
      ['12', 'octave : fusion presque totale (2:1).'],
    ],
    why: [
      'Plus le rapport des fréquences est simple (2:1, 3:2, 4:3), plus les harmoniques des deux notes coïncident, et plus l’intervalle sonne stable. Quand les fréquences sont proches sans coïncider, leurs harmoniques battent entre elles : on entend une rugosité, la dissonance.',
      'Dans le tempérament égal (12 demi-tons identiques), seule l’octave est exacte. La quinte est 2 cents (centièmes de demi-ton) trop basse, inaudible ; la tierce majeure est environ 14 cents trop haute, ce qui la rend un peu plus « vivante » qu’une tierce pure.',
    ],
    use: [
      ['Tierce mineure — 3 demi-tons', 'note("[c3,eb3]").sound("piano")'],
      ['Tierce majeure — 4 demi-tons', 'note("[c3,e3]").sound("piano")'],
      ['Quarte — 5 demi-tons', 'note("[c3,f3]").sound("piano")'],
      ['Quinte — 7 demi-tons', 'note("[c3,g3]").sound("piano")'],
      ['Octave — 12 demi-tons', 'note("[c3,c4]").sound("piano")'],
      ['Seconde mineure — 1 demi-ton : ça frotte', 'note("[c3,db3]").sound("piano")'],
    ],
    traps: [
      'Le nom compte les NOTES parcourues, extrémités comprises : do-ré-mi = trois notes = une tierce. Le nombre de demi-tons dit si elle est majeure ou mineure.',
      '« Dissonant » ne veut pas dire « faux » : la dissonance crée une tension que la musique utilise volontairement, avant de la résoudre.',
    ],
    see: ['sol.tierce', 'sol.quinte', 'sol.octave', 'sol.demi-ton'],
    legacy: [['harmonie', 'intervalle'], ['harmonie', 'consonance'], ['harmonie', 'dissonance']],
  },
  {
    id: 'sol.tierce', t: 'tierce', sub: 'majeure ou mineure', en: 'third', kind: 'sol',
    schema: { type: 'clavier', mode: 'intervalle', a: 'c3', b: 'e3', missions: ['tierce-mineure'] },
    ess:
      'L’intervalle qui donne sa couleur à l’harmonie. Majeure (4 demi-tons, do–mi) : claire. Mineure (3 demi-tons, do–mib) : sombre. ' +
      'C’est elle qui décide si un accord ou une gamme est majeur ou mineur.',
    code: `// tierce majeure, puis tierce mineure
note("[c3,e3] ~ [c3,eb3] ~").sound("piano")`,
    why: ['Les deux tierces ont des rapports de fréquences simples (environ 5:4 et 6:5) : elles sont consonantes, mais moins « vides » qu’une quinte. Un seul demi-ton les sépare, et pourtant l’oreille associe très nettement l’une à la clarté et l’autre à l’ombre.'],
    use: [
      ['Majeure, notes l’une après l’autre', 'note("c3 e3").sound("piano")'],
      ['Mineure, notes l’une après l’autre', 'note("c3 eb3").sound("piano")'],
    ],
    traps: ['La tierce s’appelle ainsi parce qu’elle couvre trois noms de notes (do-ré-mi), pas trois demi-tons.'],
    see: ['sol.intervalle', 'sol.accord', 'sol.majeur', 'sol.mineur'],
    legacy: [['harmonie', 'tierce']],
  },
  {
    id: 'sol.quinte', t: 'quinte', sub: '7 demi-tons', en: 'perfect fifth', kind: 'sol',
    schema: { type: 'clavier', mode: 'intervalle', a: 'c3', b: 'e3', missions: ['quinte'] },
    ess:
      'L’intervalle de 7 demi-tons (do–sol), le plus stable après l’octave. Deux notes à la quinte se renforcent : leurs fréquences sont dans un rapport proche de 3:2. ' +
      'C’est la note qui « porte » un accord, majeur ou mineur.',
    code: `// do et sol ensemble
note("[c3,g3]").sound("piano")`,
    why: ['Avec un rapport 3:2, une harmonique sur deux de la note aiguë coïncide avec une harmonique de la note grave. Les deux sons fusionnent sans couleur majeure ni mineure : c’est la *quinte à vide*, le son des « power chords » du rock.'],
    use: [
      ['Une basse doublée à la quinte', 'note("c2 c2 eb2 g1").superimpose(x => x.add(note(7)))\n  .sound("sawtooth").lpf(600)'],
      ['Un accord de quinte, sans tierce : ni majeur ni mineur', 'note("[c3,g3] [ab2,eb3]").sound("sawtooth").lpf(1500)'],
    ],
    traps: ['La quinte ne dit pas si l’accord est majeur ou mineur : c’est la tierce qui le décide.'],
    see: ['sol.intervalle', 'sol.accord'],
    legacy: [['harmonie', 'quinte juste']],
  },

  /* ------------------------------ accords ------------------------------ */
  {
    id: 'sol.accord', t: 'accord', sub: 'trois notes ou plus', en: 'chord', kind: 'sol',
    schema: { type: 'clavier', mode: 'accord', accord: 'C', missions: ['mineur', 'septieme'] },
    ess:
      'Plusieurs notes jouées ensemble. L’accord de base, la *triade*, empile trois notes une sur deux dans la gamme : la fondamentale, sa [tierce](sol.tierce) et sa [quinte](sol.quinte). ' +
      'Do–mi–sol est l’accord de do majeur ; do–mib–sol, de do mineur.',
    code: `// do majeur : do, mi, sol ensemble
note("[c3,e3,g3]").sound("piano")`,
    args: [
      ['majeur', 'tierce majeure + tierce mineure (4 + 3 demi-tons) : do–mi–sol. Nom : `C`.'],
      ['mineur', 'tierce mineure + tierce majeure (3 + 4) : do–mib–sol. Nom : `Cm`.'],
      ['diminué', 'deux tierces mineures (3 + 3) : do–mib–solb. Très instable. Nom : `Co`.'],
      ['augmenté', 'deux tierces majeures (4 + 4) : do–mi–sol#. Flottant. Nom : `Caug`.'],
      ['septième', 'on ajoute une quatrième note, une tierce plus haut : `C7`, `Cm7`, `C^7`.'],
    ],
    why: ['Empiler des tierces produit des notes dont les fréquences sont dans des rapports simples (pour do majeur, environ 4:5:6) : elles fusionnent en un son unique, dont la tierce du bas fixe la couleur. Les accords des degrés d’une gamme se construisent tous ainsi : une note sur deux.'],
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
    schema: { type: 'clavier', mode: 'accord', accord: 'Am', arpege: true, missions: [] },
    ess: 'Un accord dont on joue les notes l’une après l’autre au lieu de toutes ensemble. L’oreille entend à la fois une mélodie et l’harmonie qu’elle dessine.',
    code: `// do-mi-sol-mi : l’accord de do égrené
note("[c3,e3,g3]").arp("0 1 2 1").sound("piano")`,
    why: ['Même jouées séparément, les notes d’un accord restent dans la mémoire de l’oreille : un arpège rapide est entendu comme l’accord, avec un mouvement en plus. C’est pourquoi un arpège de synthé suffit à porter l’harmonie d’un morceau de trance, sans accords plaqués.'],
    use: [['Un arpège montant sur une grille', 'chord("<Am F C G>").voicing()\n  .arp("0 1 2 3 4 3 2 1").sound("piano")']],
    traps: ['Dans Strudel, [arp](fn.arp) compte les notes de l’accord dans l’ordre où elles sont écrites (avec `voicing()`, du grave à l’aigu), à partir de 0.'],
    see: ['fn.arp', 'sol.accord', 'genre.arpege-trance'],
  },
  {
    id: 'sol.progression', t: 'progression', sub: 'une suite d’accords', en: 'chord progression', kind: 'sol',
    ess:
      'L’enchaînement des accords d’un morceau, souvent quatre, qui tourne en boucle. On l’écrit en degrés (chiffres romains) pour la décrire indépendamment de la tonalité : ' +
      'I–V–vi–IV en do majeur = do, sol, la mineur, fa.',
    code: `// la mineur, fa, do, sol : i–VI–III–VII en la mineur
chord("<Am F C G>").voicing().sound("piano")`,
    args: [
      ['majuscule / minuscule', 'I = accord majeur sur le 1er degré ; vi = accord mineur sur le 6e degré.'],
      ['I–V–vi–IV', 'la progression pop la plus répandue (en do : C G Am F).'],
      ['i–VI–III–VII', 'la même boucle vue depuis la mineur (Am F C G) : sonne plus sombre, très courante en musique électronique.'],
      ['I–IV–V', 'la base du blues et du rock : tension sur V, repos sur I.'],
    ],
    why: ['Chaque accord a une fonction : la tonique (I) repose, la dominante (V) tend vers la tonique, la sous-dominante (IV) s’éloigne. Une progression fait voyager l’oreille entre repos et tension. Les accords voisins partagent souvent des notes, ce qui rend l’enchaînement fluide.'],
    use: [
      ['I – V – vi – IV, en do majeur', 'chord("<C G Am F>").voicing().sound("piano")'],
      ['I – IV – V', 'chord("<C F G G>").voicing().sound("piano")'],
      ['Avec les degrés : triades sur I, V, vi, IV', 'n("<[0,2,4] [4,6,8] [5,7,9] [3,5,7]>").scale("C:major").sound("piano")'],
    ],
    traps: ['Les chiffres romains désignent la marche de départ de l’accord, comptée à partir de 1. Majuscules = accord majeur, minuscules = mineur.'],
    see: ['fn.chord', 'sol.accord', 'sol.degre'],
    legacy: [['harmonie', 'I-IV-V'], ['harmonie', 'I-V-vi-IV'], ['harmonie', 'cadence']],
  },

  /* ------------------------------- son ------------------------------- */
  {
    id: 'sol.timbre', t: 'timbre', sub: 'la couleur d’un son', en: 'timbre', kind: 'sol',
    schema: { type: 'onde', onde: 'square', note: 'c3', missions: ['pure', 'brillante'] },
    ess:
      'Ce qui distingue deux sons de même hauteur et de même volume : un la à 220 Hz joué par une flûte, un violon ou une onde en dent de scie. ' +
      'Le timbre dépend surtout des harmoniques que le son contient (lesquelles, et avec quelle force) et de la façon dont il évolue dans le temps (son [enveloppe](sol.enveloppe), surtout l’attaque).',
    code: `// même note, quatre timbres
note("a3*4")
  .sound("<sine triangle square sawtooth>")`,
    why: [
      'Un son musical est une somme de sinusoïdes : la fondamentale, qui donne la [hauteur](sol.hauteur), et des harmoniques à 2, 3, 4… fois sa fréquence. Changer les harmoniques ne change pas la note : c’est leur mélange, le *spectre*, qui change, et l’oreille l’entend comme une couleur.',
      'Quelques repères : peu d’harmoniques = son doux et rond (flûte, sinusoïde) ; harmoniques impaires dominantes = son creux (clarinette, onde carrée) ; toutes les harmoniques, fortes = son brillant et mordant (cuivres, cordes frottées, dent de scie). Voir les [ondes de base](son.ondes).',
      'Le temps compte autant : une note de piano enregistrée puis jouée à l’envers, avec exactement le même spectre, ne sonne plus du tout comme un piano. L’attaque porte une grande partie de l’identité d’un instrument.',
    ],
    use: [
      ['Retirer des harmoniques : un passe-bas, ouvert puis fermé', '// la même note, plus ou moins brillante\nnote("a2*8").sound("sawtooth")\n  .lpf("<4000 300>")'],
      ['En ajouter : la saturation sur une sinusoïde', '// sans puis avec saturation\nnote("a2*8").sound("sine")\n  .distort("<0 3>").gain(.6)'],
      ['Changer l’attaque : même onde, autre caractère', '// attaque nette, puis lente\nnote("a3*2").sound("triangle")\n  .attack("<.001 .3>")'],
    ],
    traps: [
      'Le timbre n’est pas la hauteur : un son « brillant » (riche en harmoniques aiguës) n’est pas pour autant une note aiguë.',
      'Un passe-bas ne change pas la note, seulement le timbre : la fondamentale reste là, ce sont les harmoniques qui partent.',
      'Fort n’est pas brillant : monter le `gain` d’un son sombre le rend plus fort, pas plus brillant. Ajouter des harmoniques (onde plus riche, filtre plus ouvert, saturation) le rend brillant même à volume égal.',
    ],
    see: ['son.ondes', 'fx.lpf', 'sol.enveloppe', 'sol.hauteur', 'fx.distort'],
    legacy: [['son', 'timbre'], ['son', 'harmonique']],
  },
  {
    id: 'sol.enveloppe', t: 'enveloppe', sub: 'la forme du son dans le temps', en: 'envelope, ADSR', kind: 'sol',
    schema: { type: 'adsr', reglages: {}, notes: 1 },
    ess:
      'L’évolution du volume d’une note au cours du temps : comment elle commence, se maintient et s’éteint. On la décrit avec quatre réglages, ADSR : ' +
      '[attack](fx.attack) (durée de la montée), [decay](fx.decay) (durée de la retombée), [sustain](fx.sustain) (niveau tenu pendant la note) et [release](fx.release) (durée de l’extinction après la note). ' +
      'Trois sont des durées en secondes ; le sustain est un niveau, de 0 à 1.',
    code: `// A 0,01 s · D 0,15 s · S 0,3 · R 0,2 s
note("c3 e3 g3 e3").sound("sawtooth").lpf(1500)
  .attack(.01).decay(.15).sustain(.3).release(.2)`,
    time: [
      'Pour chaque note : 1) le volume monte de 0 au sommet pendant l’attack ; 2) il redescend jusqu’au niveau de sustain pendant le decay ; 3) il reste à ce niveau tant que la note dure ; 4) la note se termine et le volume descend à 0 pendant le release.',
      'La durée de la note vient du code (la longueur de son pas, éventuellement modifiée par [clip](fx.clip)), pas de l’enveloppe. Si la note se termine avant la fin de l’attack ou du decay, l’enveloppe est interrompue et le release part du niveau atteint.',
    ],
    why: [
      'Avec le [timbre](sol.timbre), l’enveloppe est ce qui permet de reconnaître un instrument. La même onde, à la même hauteur, sonne comme une percussion si elle monte en 1 ms et retombe en 0,1 s, ou comme une nappe si elle met 0,5 s à monter.',
      'Elle traduit la façon dont l’instrument reçoit son énergie : une seule fois (pincé, frappé : attaque courte, sustain nul) ou en continu (archet, souffle, orgue : sustain élevé).',
      'Sans aucun réglage, les ondes de synthèse de Strudel utilisent attack .001, decay .05, sustain .6 et release .01. Dès que tu écris l’un des quatre, les autres changent aussi : attack et decay passent à 0,001 s, release à 0,01 s, et sustain à 1 si tu n’as pas écrit `decay` (0,001 sinon). ' +
        'Les sons enregistrés ont par défaut un sustain de 1 et jouent en entier.',
    ],
    use: [
      ['Percussif : montée instantanée, retombée au silence en 0,1 s', '// sustain 0 : le decay fait toute la note\nnote("c3 e3 g3 e3").sound("sawtooth").lpf(1500)\n  .decay(.1).sustain(0)'],
      ['Nappe : montée en 0,5 s, extinction en 1 s', 'note("[c3,eb3,g3]").sound("sawtooth").lpf(1200)\n  .attack(.5).release(1)'],
      ['Orgue : plein volume tenu, arrêt net', 'note("<[c3,e3,g3] [f3,a3,c4]>").sound("square").lpf(2500)\n  .attack(.01).sustain(1).release(.05).gain(.5)'],
    ],
    traps: [
      'Le mot « enveloppe » désigne aussi d’autres mouvements que le volume : l’[enveloppe de filtre](fx.lpenv) fait bouger le timbre, l’[enveloppe de hauteur](fx.penv) la hauteur. Sans précision, « l’enveloppe » est celle du volume.',
      'Le sustain est un niveau, pas une durée : aucun réglage de l’enveloppe ne dit combien de temps la note est tenue. C’est la durée de la note, écrite dans le motif, qui le décide.',
      'L’ordre A, D, S, R suit le temps, mais S n’est pas une étape de durée : c’est le palier entre D et R.',
    ],
    see: ['fx.attack', 'fx.decay', 'fx.sustain', 'fx.release', 'fx.adsr', 'fx.lpenv', 'fx.penv'],
    legacy: [['son', 'pad / nappe']],
  },
];
