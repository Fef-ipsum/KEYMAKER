// Wiki — les fonctions : créer un motif, le transformer, le faire varier.
// Forme des entrées : voir mini.js.

export default [
  /* ------------------------------ créer ------------------------------ */
  {
    id: 'fn.sound', t: 'sound', sub: 'jouer un son', kind: 'fn', tokens: ['sound', 's'], doc: 's',
    ess:
      'Choisit le son qui joue : un échantillon enregistré (`bd`, `piano`) ou un synthétiseur (`sawtooth`, `supersaw`). ' +
      'Écrit en premier, `sound("…")` crée aussi le rythme : chaque nom entre guillemets devient un événement, placé selon la [mini-notation](mini.espace).',
    code: `// quatre sons, un par quart de cycle
sound("bd hh sd hh")`,
    args: [
      [
        'nom',
        'entre guillemets, en mini-notation : on peut y écrire une séquence entière. `nom:numéro` choisit une variante (`bd:2`). ' +
          'Synthés : `sine`, `triangle`, `square`, `sawtooth`, `supersaw`, `pulse` ; bruits : `white`, `pink`, `brown`. Batterie : voir [les sons de batterie](son.batterie).',
      ],
    ],
    why: [
      'Un motif Strudel est une suite d’événements dans le temps, chacun porteur de valeurs (« son : bd », « note : c3 »…). `sound("bd hh")` crée deux événements et leur donne un nom de son.',
      'Placé APRÈS un autre motif (`note("c3 e3").sound("piano")`), `sound` ne crée aucun événement : il ajoute seulement le nom du son à ceux qui existent. C’est la règle générale : le premier élément de la chaîne donne la structure, les suivants l’habillent.',
    ],
    use: [
      ['Le rythme vient de sound', 'sound("bd*2 [~ sd] hh*2 sd")'],
      ['Le son habille des notes', 'note("c3 e3 g3").sound("piano")'],
      ['Un son différent à chaque cycle', 'note("c3 e3 g3 e3").sound("<piano triangle>")'],
      ['Quatre variantes du même son', 'sound("bd:0 bd:1 bd:2 bd:3")'],
    ],
    traps: [
      'Un nom inconnu ne donne aucun son et un message « sound … not found ». Vérifie l’orthographe : tout en minuscules pour la batterie.',
      'Sans `.sound(…)`, des notes sont jouées par un synthétiseur par défaut (une onde triangle).',
      'Placé en premier, `sound(…)` donne le rythme. Placé après un point, il ne fait que colorer le motif qui précède.',
    ],
    evo: ['`s` est le raccourci de `sound` : `s("bd hh")`.'],
    see: ['son.batterie', 'son.ondes', 'fn.bank', 'fn.n', 'mini.deux-points'],
    legacy: [['code', 'sound / s']],
  },
  {
    id: 'fn.note', t: 'note', sub: 'jouer des hauteurs', kind: 'fn', tokens: ['note'], doc: 'note',
    ess:
      'Crée des notes à partir de leur nom (`c3`, `eb4`) ou de leur numéro MIDI (`60`). Chaque note est un événement, placé selon la mini-notation ; ' +
      'il faut ensuite un son pour l’entendre (sans `.sound(…)`, une onde triangle).',
    code: `// do, mi bémol, sol, à l’octave 3
note("c3 eb3 g3").sound("piano")`,
    args: [
      ['nom', 'lettre de `a` à `g` (voir [noms des notes](sol.noms-des-notes) : `c` = do), puis `#` (dièse) ou `b` (bémol) facultatif, puis le numéro d’[octave](sol.octave), 3 si absent. `c4` = le do central du piano (261,6 Hz).'],
      ['nombre', 'numéro [MIDI](sol.midi) : 60 = `c4`, chaque unité = un demi-ton. Les décimales sont acceptées : `60.5` = un quart de ton au-dessus de `c4`.'],
    ],
    why: ['Le moteur convertit chaque note en fréquence : f = 440 × 2^((n − 69) / 12), où n est le numéro MIDI. `a4` (69) vaut 440 Hz, et chaque demi-ton multiplie la fréquence par 1,0595.'],
    use: [
      ['Une mélodie avec un silence', 'note("c4 e4 ~ g4").sound("piano")'],
      ['Des accords : la virgule superpose', 'note("[c3,e3,g3] [f3,a3,c4]").sound("piano")'],
      ['En numéros MIDI', 'note("60 64 67 72").sound("piano")'],
    ],
    traps: [
      'Sans chiffre, l’octave est 3 : `c` = `c3`. Le do une octave au-dessus s’écrit `c4`.',
      '`b` seul est la note si ; `bb` est si bémol ; `eb` est mi bémol.',
      'Les noms d’accords (`Am`, `C`) ne vont pas dans `note()` mais dans [chord](fn.chord).',
    ],
    see: ['sol.noms-des-notes', 'sol.octave', 'sol.midi', 'fn.n', 'fn.scale'],
    legacy: [['code', 'note / n'], ['solfege', 'note']],
  },
  {
    id: 'fn.n', t: 'n', sub: 'un numéro', kind: 'fn', tokens: ['n'], doc: 'n',
    ess:
      'Donne un numéro à chaque événement. Son sens dépend de ce qui suit : avec [scale](fn.scale), c’est un [degré](sol.degre) de la gamme (0 = la tonique) ; ' +
      'avec un son enregistré, c’est le numéro de la variante (`n(2)` = `bd:2`).',
    code: `// degrés 0, 2, 4 de do majeur : do, mi, sol
n("0 2 4").scale("C3:major").sound("piano")`,
    args: [
      [
        'numéro',
        'entier, à partir de 0. Avec une gamme : au-delà du dernier degré, on passe à l’octave suivante (`7` en majeur = la tonique une octave plus haut) ; un nombre négatif descend sous la tonique (`-1` = la note juste en dessous). ' +
          'Avec un son enregistré : si le numéro dépasse le nombre de variantes, on repart au début.',
      ],
    ],
    why: ['Écrire des degrés plutôt que des noms de notes permet de changer de gamme ou de tonique sans réécrire la mélodie : `n("0 2 4")` donne do-mi-sol en do majeur, la-do-mi en la mineur.'],
    recipe: {
      title: 'une mélodie qu’on change de gamme en un mot',
      text: 'Les numéros restent les mêmes ; seule la gamme change à chaque cycle. En do majeur, la mélodie est claire ; en la mineur, elle s’assombrit, sans qu’une seule note soit fausse.',
      code: `// mêmes degrés, deux gammes en alternance
n("0 2 4 7 4 2").scale("<C3:major A2:minor>")
  .sound("piano")`,
    },
    traps: [
      'On compte à partir de 0 : la tonique est `0`, pas `1`.',
      'Sans `.scale(…)` derrière, `n` ne désigne pas une note mais une variante de son.',
      'Sur une `supersaw`, `n` sans `scale` sert de réglage de désaccord, pas de hauteur (voir [supersaw](son.supersaw)).',
    ],
    see: ['fn.scale', 'sol.degre', 'mini.deux-points', 'fn.note'],
  },
  {
    id: 'fn.bank', t: 'bank', sub: 'la boîte à rythmes', kind: 'fn', tokens: ['bank'], doc: 'bank',
    ess:
      'Choisit la boîte à rythmes dont viennent les sons de batterie : `.bank("RolandTR909")` fait jouer `bd`, `sd`, `hh`… avec les sons de la Roland TR-909. Les noms des coups ne changent pas ; seule la machine change.',
    code: `// kick et clap de TR-909
sound("bd*4, [~ cp]*2").bank("RolandTR909")`,
    args: [['nom', 'nom exact de la machine, majuscules comprises. Disponibles hors ligne dans cette app : `RolandTR909`, `RolandTR808`, `RolandTR707`, `AkaiLinn`.']],
    why: [
      'Le moteur colle le nom de la banque devant celui du son, avec un trait de soulignement : `bank("RolandTR909")` + `bd` = le son `RolandTR909_bd`. D’où l’orthographe exacte, et le silence d’un coup absent de la machine.',
      'Repères : la TR-808 (1980) a un kick rond et long, central dans le hip-hop et l’électro ; la TR-909 (1983) un kick plus sec et percutant, celui de la techno et de la house ; la TR-707 utilise des enregistrements de vraie batterie.',
    ],
    recipe: {
      title: 'comparer deux machines',
      text: 'Le même groove, une machine par cycle : on entend que c’est le timbre de chaque coup qui change, pas le rythme.',
      code: `// TR-909, puis TR-808, en alternance
sound("bd*4, [~ cp]*2, hh*8")
  .bank("<RolandTR909 RolandTR808>")`,
    },
    traps: [
      'Le nom doit être exact, majuscules comprises : `RolandTR909`, pas `rolandtr909`.',
      'Toutes les machines n’ont pas tous les sons : si un coup manque (`cp` sur une machine sans clap), il reste muet.',
      'Les autres machines de Strudel existent, mais leurs sons se téléchargent à la première écoute : il faut être en ligne ce jour-là.',
    ],
    see: ['son.batterie', 'fn.sound'],
    legacy: [['code', 'bank()']],
  },
  {
    id: 'fn.setcpm', t: 'setcpm', sub: 'le tempo', kind: 'fn', tokens: ['setcpm', 'setcps'], doc: 'setcpm',
    schema: { type: 'tempo', reglages: { bpm: 120 }, temps: 4 },
    ess:
      'Règle le tempo en *cycles par minute* : combien de fois par minute la boucle de base, le [cycle](sol.cycle), se répète. ' +
      'Si un cycle contient 4 temps, on écrit `setcpm(BPM/4)` : `setcpm(120/4)` = 120 battements par minute.',
    code: `// 124 BPM, un cycle = une mesure de 4 temps
setcpm(124/4)
sound("bd*4, [~ cp]*2")`,
    args: [['cpm', 'cycles par minute. `setcpm(30)` = un cycle toutes les 2 s. Le calcul `124/4` est fait avant d’être transmis : on peut écrire n’importe quelle opération.']],
    time: ['Le tempo s’applique à tout le morceau, toutes pistes confondues, dès que le code est évalué.'],
    why: [
      'Strudel ne connaît ni les temps ni les mesures : il ne compte que des cycles. Tout ce qu’on écrit entre guillemets tient dans un cycle. C’est notre convention (1 cycle = 1 mesure de 4 temps) qui fait le lien avec les BPM : 124 BPM ÷ 4 temps = 31 cycles par minute.',
      '`setcps` règle la même chose par seconde : `setcps(.5)` = `setcpm(30)`.',
    ],
    vary: [
      ['Même groove à 90 BPM', 'setcpm(90/4)\nsound("bd*4, [~ cp]*2")'],
      ['Une mesure à 3 temps : 3 coups par cycle, donc `BPM/3`', '// valse à 90 BPM\nsetcpm(90/3)\nsound("bd hh hh")'],
    ],
    traps: [
      '`setcpm(120)` sans division joue 120 CYCLES par minute, soit 480 BPM si le cycle a 4 temps.',
      'Sans `setcpm`, le tempo est de 30 cycles par minute (un cycle toutes les 2 secondes), soit 120 BPM à 4 temps. Dans cette app, c’est vrai à chaque lecture. Sur strudel.cc, en revanche, le tempo reste celui du dernier `setcpm` joué : effacer la ligne ne le remet pas à 30.',
      'Le tempo est global : une seule ligne `setcpm` pour tout le morceau.',
    ],
    see: ['sol.tempo', 'sol.mesure', 'sol.cycle'],
    legacy: [['rythme', 'setcpm()']],
  },
  {
    id: 'fn.dollar', t: '$:', sub: 'une piste', kind: 'fn', tokens: ['$:', '_$:', '$'],
    ess: 'Chaque ligne qui commence par `$:` est une piste. Toutes les pistes jouent en même temps, chacune avec son propre rythme et ses propres réglages.',
    code: `// deux pistes simultanées
$: sound("bd*4")
$: note("c2 eb2").sound("sawtooth").lpf(600)`,
    args: [
      ['$:', 'une piste sans nom. On peut aussi nommer une piste : `basse: note(…)` (un mot suivi de deux-points). Le son est le même ; le nom aide à s’y retrouver.'],
      ['_$:', 'un trait de soulignement devant coupe la piste sans l’effacer.'],
    ],
    why: ['Sans `$:`, Strudel ne joue que la DERNIÈRE expression du code : chaque ligne remplace la précédente. Avec `$:`, chaque ligne est ajoutée à la liste des pistes, et toutes sont superposées, comme avec [stack](fn.stack).'],
    use: [
      ['Une piste sur plusieurs lignes', '$: note("c2 eb2 g2")\n  .sound("sawtooth")\n  .lpf(600)'],
      ['Des pistes nommées', 'basse: note("c2*4").sound("sawtooth").lpf(500)\nbatterie: sound("bd*4")'],
      ['Couper une piste', '$: sound("bd*4")\n// coupée :\n_$: sound("hh*8")'],
    ],
    traps: [
      'Sans `$:`, seule la DERNIÈRE expression du code est jouée. C’est l’erreur la plus fréquente quand « une ligne ne joue pas ».',
      'Une piste peut s’étendre sur plusieurs lignes, tant que les suivantes commencent par un point.',
    ],
    see: ['fn.stack', 'mini.virgule', 'fn.hush'],
    legacy: [['structure', '$:'], ['structure', 'piste']],
  },
  {
    id: 'fn.stack', t: 'stack', sub: 'empiler', kind: 'fn', tokens: ['stack'], doc: 'stack',
    ess: 'Joue plusieurs motifs en même temps, chacun avec sa propre structure. `stack(a, b)` superpose `a` et `b` dans le même temps ; c’est la version « une seule expression » des pistes `$:`.',
    code: `// trois motifs superposés
stack(
  sound("bd*4"),
  sound("hh*8").gain(.5),
  note("c2 eb2").sound("sawtooth").lpf(600)
)`,
    why: [
      '`stack` produit UN motif qui contient tous les événements des motifs donnés. On peut donc le transformer d’un coup : `stack(…).fast(2)` accélère tout. C’est sa différence avec `$:`, où chaque piste est indépendante.',
      'C’est l’équivalent, pour des motifs entiers, de la [virgule](mini.virgule) de la mini-notation.',
    ],
    use: [['Transformer tout le groupe : un roulement tous les 4 cycles', 'stack(sound("bd*2"), sound("hh*4"))\n  .bank("RolandTR909")\n  .lastOf(4, x => x.fast(2))']],
    traps: [
      'Les motifs sont séparés par des virgules, et chaque parenthèse doit être refermée : c’est là qu’on se perd. `$:` évite le problème.',
      'Un réglage écrit après `stack(…)` s’applique à tous les motifs du groupe.',
    ],
    see: ['fn.dollar', 'mini.virgule'],
    legacy: [['structure', 'stack']],
  },
  {
    id: 'fn.cat', t: 'cat / seq', sub: 'enchaîner des motifs', kind: 'fn', tokens: ['cat', 'seq', 'slowcat', 'fastcat', 'sequence'], doc: 'cat',
    ess:
      '`cat(a, b)` enchaîne des motifs sur plusieurs cycles : `a` pendant un cycle, `b` pendant le suivant, puis on recommence. ' +
      '`seq(a, b)` les serre tous dans UN cycle, chacun dans une part égale.',
    code: `// cycle 1 : do-mi ; cycle 2 : sol
cat(note("c3 e3"), note("g3")).sound("piano")`,
    args: [
      ['cat(a, b, …)', 'un motif par cycle, dans l’ordre, en boucle. Équivaut aux [chevrons](mini.chevrons) `< >` de la mini-notation.'],
      ['seq(a, b, …)', 'tous les motifs dans un seul cycle, chacun compressé dans 1/n du cycle. Équivaut à l’[espace](mini.espace) de la mini-notation.'],
    ],
    why: ['Ce sont les deux façons de mettre des choses « l’une après l’autre » : sur plusieurs cycles (`cat`) ou à l’intérieur d’un cycle (`seq`). Entre guillemets, on écrit plutôt `"<a b>"` et `"a b"` ; `cat` et `seq` servent quand les éléments sont des motifs complets, avec leurs propres réglages.'],
    use: [['seq : les deux motifs dans le même cycle', '// do et mi sur un quart de cycle chacun,\n// sol sur une moitié\nseq(note("c3 e3"), note("g3")).sound("piano")']],
    traps: [
      'Dans `seq`, chaque motif est compressé : `seq(note("c3 e3"), note("g3"))` donne do et mi sur un quart de cycle chacun, sol sur un demi-cycle.',
      'Pour donner des durées différentes à chaque section (2 cycles, puis 1), c’est [arrange](fn.arrange).',
    ],
    evo: ['`slowcat` est un autre nom de `cat` ; `fastcat` et `sequence`, d’autres noms de `seq`.'],
    see: ['mini.chevrons', 'mini.espace', 'fn.arrange'],
    legacy: [['code', 'cat / slowcat']],
  },
  {
    id: 'fn.hush', t: 'hush', sub: 'tout arrêter', kind: 'fn', tokens: ['hush'], doc: 'hush',
    ess: 'Coupe tout le son. Dans l’app, c’est le bouton ■ (raccourci : Ctrl + point).',
    code: 'sound("bd*4")',
    use: [['Raccourcis clavier', '// Ctrl + Entrée : jouer / mettre à jour\n// Ctrl + . : arrêter\nsound("bd*4")']],
    traps: ['Écrire `hush()` dans le code arrête tout dès l’évaluation : rien ne jouera.'],
    see: ['fn.dollar'],
    legacy: [['code', 'hush() / Ctrl + .']],
  },

  /* ---------------------------- hauteur ---------------------------- */
  {
    id: 'fn.scale', t: 'scale', sub: 'la gamme', kind: 'fn', tokens: ['scale'], doc: 'scale',
    schema: { type: 'clavier', mode: 'gamme', gamme: 'C3:major', missions: ['mineure', 'penta'] },
    ess:
      'Transforme les numéros de [n](fn.n) en notes d’une [gamme](sol.gamme) : `n("0 1 2").scale("C3:major")` joue do, ré, mi. On écrit la tonique, deux-points, puis le type de gamme. ' +
      'Avantage : impossible de jouer une note hors de la gamme.',
    code: `// les 8 premiers degrés de la mineur
n("0 1 2 3 4 5 6 7").scale("A2:minor")
  .sound("piano")`,
    args: [
      ['tonique', 'une note : `C`, `F#`, `Bb`, avec ou sans octave (`C2`). Sans octave : 3.'],
      [
        'type',
        'en anglais : `major` (majeur), `minor` (mineur naturel), `dorian`, `phrygian`, `lydian`, `mixolydian`, `locrian` (les [modes](voc.solfege.mode)), ' +
          '`minor:pentatonic`, `major:pentatonic`, `harmonic:minor`, `blues`, `chromatic`…',
      ],
    ],
    why: [
      'Le moteur prend la liste des notes de la gamme (do majeur : do ré mi fa sol la si) et y lit le numéro : 0 = la première, 1 = la deuxième… ' +
        'Au-delà de la dernière, il recommence une octave plus haut : en majeur (7 notes), `7` = la tonique une octave plus haut, `9` = la tierce une octave plus haut. Un nombre négatif descend : `-1` = la septième, sous la tonique.',
    ],
    recipe: {
      title: 'une basse et une mélodie dans la même gamme',
      text: 'Les deux pistes utilisent la mineur, à deux octaves différentes (`A1` pour la basse, `A3` pour la mélodie). Quels que soient les numéros, aucune note ne peut être fausse.',
      code: `// tout en la mineur
$: n("0 ~ 0 3").scale("A1:minor")
  .sound("sawtooth").lpf(500)
$: n("4 2 3 1 2 0 1 -1").scale("A3:minor")
  .sound("triangle")`,
    },
    vary: [['Même mélodie en dorien : une seule note change (la sixte, plus haute d’un demi-ton)', '$: n("0 ~ 0 3").scale("A1:dorian")\n  .sound("sawtooth").lpf(500)\n$: n("4 2 3 1 2 0 1 -1").scale("A3:dorian")\n  .sound("triangle")']],
    traps: [
      'Pas d’espace dans le nom : `"C:minor"`. Un espace créerait deux pas.',
      'Le séparateur est le deux-points. Pour un nom en deux mots, on met aussi un deux-points : `"A:minor:pentatonic"`.',
      '`scale()` vient APRÈS `n()` : `n("0 2").scale("C:minor")`.',
    ],
    see: ['fn.n', 'sol.gamme', 'sol.majeur', 'sol.mineur', 'sol.pentatonique', 'fn.transpose'],
  },
  {
    id: 'fn.chord', t: 'chord', sub: 'des accords par leur nom', kind: 'fn', tokens: ['chord'], doc: 'chord',
    ess:
      'Écrit des accords par leur nom, comme sur une grille : `C` (do majeur), `Am` (la mineur), `G7`. Seul, `chord` ne joue pas les notes : ' +
      'il faut le faire suivre de [voicing](fn.voicing) (les notes de l’accord) ou de [rootNotes](fn.rootNotes) (la basse).',
    code: `// quatre accords, un par cycle
chord("<Am F C G>").voicing().sound("piano")`,
    args: [
      [
        'symbole',
        'fondamentale en MAJUSCULE (`C`, `F#`, `Bb`), puis le type. Vérifiés dans cette app : rien = majeur · `m` = mineur · `7` = septième · `m7` = mineur septième · `^7` = majeur septième · ' +
          '`o` = diminué · `o7` = diminué septième · `h7` ou `m7b5` = demi-diminué · `sus` = quarte suspendue · `6` · `9` · `add9` · `aug` = augmenté.',
      ],
    ],
    why: ['`chord` crée un événement qui porte le NOM de l’accord, pas ses notes. C’est `voicing()` qui consulte un dictionnaire d’accords et choisit des notes réelles. Cette séparation permet d’écrire une grille comme un musicien, puis de décider comment la jouer.'],
    recipe: {
      title: 'une grille avec ses accords et sa basse',
      text: 'La même grille écrite deux fois : une fois en accords (piano), une fois en fondamentales à l’octave 2 (basse). La basse suit automatiquement chaque changement d’accord.',
      code: `// la même grille, deux traitements
$: chord("<Am F C G>").voicing()
  .sound("piano")
$: chord("<Am F C G>").rootNotes(2)
  .sound("sawtooth").lpf(500)`,
    },
    traps: [
      '`chord()` seul ne joue pas l’accord : sans `.voicing()` ni `.rootNotes()`, on entend toujours le même do grave du synthé par défaut, quel que soit l’accord écrit.',
      'Certains noms courants ne sont pas reconnus et ne produisent AUCUN son, sans message d’erreur : `Cmaj7` (écris `C^7`), `Csus4` (écris `Csus`), `Csus2`, `Cdim` (écris `Co`). `C+` provoque une erreur de mini-notation (écris `Caug`).',
      'Lettres en MAJUSCULES pour les accords : `am` ne sera pas reconnu comme la mineur.',
    ],
    see: ['fn.voicing', 'fn.rootNotes', 'sol.accord', 'sol.progression'],
  },
  {
    id: 'fn.voicing', t: 'voicing', sub: 'les notes d’un accord', kind: 'fn', tokens: ['voicing', 'voicings'], doc: 'voicing',
    ess:
      'Transforme un nom d’accord en notes réelles, réparties dans le grave et l’aigu pour s’enchaîner en douceur. ' +
      'Pour `C`, le réglage par défaut joue 5 notes : mi3, do4, mi4, sol4, do5. La note la plus aiguë ne dépasse pas une note repère, `c5` par défaut.',
    code: `// chaque accord dans la même zone
chord("<C Am F G>").voicing().sound("piano")`,
    args: [['anchor', 'la note repère, à écrire avant `voicing()` : `.anchor("g5").voicing()` place les accords plus haut (pour `C` : do4, sol4, do5, mi5, sol5).']],
    why: [
      'En musique, *voicer* un accord, c’est choisir quelles notes jouer et à quelle hauteur : do-mi-sol peut se jouer serré, étalé, avec le mi en bas… Le moteur choisit pour chaque accord une disposition dont la note du haut reste sous la note repère.',
      'Comme tous les accords restent ainsi dans la même zone, chaque voix bouge peu d’un accord au suivant : c’est la *conduite des voix* (voir [voice leading](voc.harmonie.voice-leading)), qui rend un enchaînement fluide.',
    ],
    use: [
      ['Les mêmes accords, plus aigus', 'chord("<C Am F G>").anchor("g5").voicing()\n  .sound("piano")'],
      ['Arpégés', 'chord("<C Am F G>").voicing()\n  .arp("0 1 2 3 4 3 2 1").sound("piano")'],
    ],
    traps: [
      'Un « voicing » n’est pas un autre accord : ce sont les mêmes notes, réparties autrement dans le grave et l’aigu, parfois doublées.',
      'Le nombre de notes dépend de l’accord (5 pour `C`, 4 pour `C^7`) : ne suppose pas qu’un accord donne 3 notes. C’est important pour [arp](fn.arp).',
      'La note la plus grave n’est pas forcément la fondamentale (pour `C`, c’est mi3). Pour une basse, utilise [rootNotes](fn.rootNotes).',
    ],
    see: ['fn.chord', 'fn.rootNotes', 'fn.arp'],
    legacy: [['harmonie', 'voicing']],
  },
  {
    id: 'fn.rootNotes', t: 'rootNotes', sub: 'la basse des accords', kind: 'fn', tokens: ['rootNotes'], doc: 'rootNotes',
    ess:
      'Ne garde de chaque accord que sa fondamentale, la note qui lui donne son nom, à l’octave demandée. `chord("<C Am>").rootNotes(2)` joue do2, puis la2 : une ligne de basse qui suit la grille toute seule.',
    code: `// la fondamentale de chaque accord, octave 2
chord("<Am F C G>").rootNotes(2)
  .sound("sawtooth").lpf(500)`,
    args: [['octave', 'numéro d’octave de la basse : `1` = très grave (33 à 62 Hz) · `2` = basse classique (65 à 123 Hz) · `3` = basse claire, audible sur un petit haut-parleur.']],
    recipe: {
      title: 'une basse rythmée qui suit la grille',
      text: '`rootNotes(2)` donne la note ; `struct("x ~ x x ~ x x ~")` impose un rythme de croches syncopé. La basse change de note à chaque changement d’accord, sans qu’on l’écrive.',
      code: `setcpm(120/4)
$: chord("<Am F C G>").voicing().sound("piano")
$: chord("<Am F C G>").rootNotes(2)
  // le rythme de la basse
  .struct("x ~ x x ~ x x ~")
  .sound("sawtooth").lpf(500)`,
    },
    traps: [
      'Majuscule au milieu : `rootNotes`, pas `rootnotes`.',
      'La fondamentale n’est pas forcément la note la plus grave du voicing : d’où l’intérêt d’une basse séparée.',
    ],
    see: ['fn.chord', 'fn.struct', 'sol.accord'],
    legacy: [['harmonie', 'fondamentale']],
  },
  {
    id: 'fn.arp', t: 'arp', sub: 'arpéger', kind: 'fn', tokens: ['arp'], doc: 'arp',
    ess: 'Joue les notes d’un accord l’une après l’autre au lieu de toutes ensemble : `.arp("0 1 2")` joue la note n° 0, puis la n° 1, puis la n° 2 de l’accord, dans le rythme écrit entre guillemets.',
    code: `// les 5 notes de do majeur, une par une
chord("C").voicing().arp("0 1 2 3 4")
  .sound("piano")`,
    args: [['ordre', 'positions dans l’accord, à partir de 0, du grave à l’aigu (avec `.voicing()`). Un numéro trop grand revient au début de la liste.']],
    why: ['Après `voicing()`, un accord est un groupe de notes qui commencent au même instant. `arp` lit ce groupe comme une liste triée du grave à l’aigu et, à chaque pas du motif qu’on lui donne, en choisit une par son numéro. Le motif fixe à la fois l’ordre et le rythme.'],
    recipe: {
      title: 'un arpège de trance',
      text: 'Huit positions, montantes puis descendantes, répétées deux fois par cycle : 16 notes, une par double-croche. Le son est pincé (`decay(.15).sustain(0)`) pour que chaque note se détache.',
      code: `setcpm(138/4)
chord("<Am F C G>").voicing()
  // monte puis redescend, 2 fois par cycle
  .arp("[0 1 2 3 4 3 2 1]*2")
  .sound("sawtooth").lpf(2500)
  .decay(.15).sustain(0).gain(.6)`,
    },
    traps: [
      'Les nombres ne sont pas des degrés de gamme mais des positions dans l’accord. Un numéro trop grand revient au début.',
      'Le nombre de notes de l’accord dépend du voicing (5 pour `C`) : `arp("0 1 2")` ne joue pas forcément do-mi-sol.',
    ],
    see: ['sol.arpege', 'fn.chord', 'fn.voicing', 'genre.arpege-trance'],
  },
  {
    id: 'fn.add', t: 'add', sub: 'décaler une valeur', kind: 'fn', tokens: ['add', 'sub'], doc: 'add',
    ess:
      'Ajoute une valeur à celle de chaque événement. Avec des notes : `.add(note(7))` monte chaque note de 7 [demi-tons](sol.demi-ton), une quinte. ' +
      'On peut ajouter un motif : `.add(note("<0 3 5>"))` transpose différemment à chaque cycle.',
    code: `// la même mélodie, une quinte plus haut
note("c3 e3 g3").add(note(7)).sound("piano")`,
    args: [['valeur', 'à envelopper dans le réglage visé : `note(12)` pour des notes, `n(2)` pour des numéros. Un nombre nu (`.add(12)`) ne fait rien et affiche « Can’t do arithmetic on control pattern ».']],
    why: ['Un événement de `note("c3")` porte la valeur « note : c3 ». `add(note(12))` lui ajoute « note : 12 » : le moteur convertit c3 en numéro MIDI (48), ajoute 12 et obtient 60, c’est-à-dire c4.'],
    recipe: {
      title: 'monter la tension par paliers',
      text: 'Le même motif, transposé de 0, 0, 5 puis 7 demi-tons selon le cycle : la boucle reste identique mais la phrase de 4 cycles monte, puis revient.',
      code: `// palier par cycle : 0, 0, +5, +7
note("c3 eb3 g3 eb3")
  .add(note("<0 0 5 7>"))
  .sound("triangle")`,
    },
    traps: [
      'Il faut préciser ce qu’on ajoute : `.add(note(12))`, pas `.add(12)`.',
      'Après `add`, les notes deviennent des numéros MIDI (60 au lieu de `c4`) : le son est le même, seul l’affichage change.',
    ],
    evo: ['`sub` retire une valeur : `.sub(note(12))` descend d’une octave.'],
    see: ['fn.transpose', 'fn.off', 'sol.intervalle'],
  },
  {
    id: 'fn.transpose', t: 'transpose', sub: 'monter ou descendre', kind: 'fn', tokens: ['transpose', 'scaleTranspose'], doc: 'transpose',
    ess:
      'Monte ou descend toutes les notes d’un nombre de [demi-tons](sol.demi-ton) : `.transpose(3)` = 3 demi-tons plus haut, `-12` = une octave plus bas. ' +
      'Accepte aussi un nom d’intervalle : `"3M"` = tierce majeure (4 demi-tons).',
    code: `// cycle 1 : +3 demi-tons ; cycle 2 : tierce majeure
note("c3 e3").transpose("<3 3M>").sound("piano")`,
    args: [
      ['demi-tons', 'un nombre, positif ou négatif, ou un nom d’[intervalle](sol.intervalle) : chiffre + qualité (`3M` tierce majeure, `3m` tierce mineure, `5P` quinte juste, `8P` octave).'],
      ['scaleTranspose(n)', 'variante qui compte en degrés de la gamme définie par `scale` : `scaleTranspose(1)` monte chaque note d’un degré, en restant dans la gamme.'],
    ],
    why: [
      'Transposer garde les intervalles entre les notes : la mélodie est la même, plus haut ou plus bas. `transpose` compte en demi-tons et ignore la gamme : transposer de 3 demi-tons une mélodie en do majeur la met en mi bémol majeur.',
      '`scaleTranspose` compte en degrés : chaque note glisse sur la marche voisine de la gamme. La forme de la mélodie change légèrement (certaines marches font un ton, d’autres un demi-ton), mais aucune note ne sort de la gamme.',
    ],
    use: [
      ['Une boucle qui suit une progression : 0, puis +5, puis +7 demi-tons', 'note("c3 eb3 g3 eb3")\n  .transpose("<0 5 7 0>")\n  .sound("triangle")'],
      ['Monter d’un degré en restant dans la gamme', 'n("0 2 4").scale("C3:major")\n  .scaleTranspose("<0 1>").sound("piano")'],
    ],
    traps: ['`transpose` compte en demi-tons et peut sortir de la gamme ; `scaleTranspose` compte en marches et y reste.'],
    see: ['fn.add', 'sol.tonique', 'fn.scale'],
    legacy: [['solfege', 'transposer']],
  },

  /* ----------------------------- rythme ----------------------------- */
  {
    id: 'fn.struct', t: 'struct', sub: 'imposer un rythme', kind: 'fn', tokens: ['struct'], doc: 'struct',
    ess:
      'Impose un rythme à un motif : les coups viennent du motif de `struct` (`x` = un coup, `~` = un silence), les valeurs (notes, sons) viennent du motif d’origine, à l’endroit où tombe chaque coup.',
    code: `// une note tenue devient un rythme
note("c2").struct("x ~ x x ~ x x ~")
  .sound("sawtooth").lpf(600)`,
    why: ['Pour chaque `x`, le moteur regarde quelle valeur le motif d’origine a à cet instant et la recopie. Avec `note("c3 e3 g3 b3").struct("x ~ x x")`, les coups tombent aux positions 1, 3 et 4 : on entend do, sol, si ; le mi, qui tombe sous un silence, disparaît.'],
    recipe: {
      title: 'une basse rythmée sur une progression',
      text: 'Une note par cycle (`<c2 ab1 eb2 bb1>`), découpée en 8 croches par `struct("x*8")` : la basse martèle chaque note de la progression.',
      code: `setcpm(110/4)
note("<c2 ab1 eb2 bb1>").struct("x*8")
  .sound("sawtooth").lpf(600)`,
    },
    traps: ['Le motif d’origine donne les hauteurs, `struct` donne les moments. Une note tenue devient donc plusieurs coups de la même note.'],
    see: ['fn.mask', 'fn.euclid', 'mini.euclide'],
    legacy: [['rythme', 'struct']],
  },
  {
    id: 'fn.mask', t: 'mask', sub: 'ouvrir et fermer', kind: 'fn', tokens: ['mask'], doc: 'mask',
    ess:
      'Laisse passer le motif là où le masque vaut `1` et le fait taire là où il vaut `0`, sans changer son rythme. ' +
      'Sert à faire entrer et sortir une piste : `.mask("<0 0 1 1>")` = silence pendant 2 cycles, puis 2 cycles de jeu.',
    code: `// les charlestons n’entrent qu’au 3e cycle
$: sound("bd*4")
$: sound("hh*8").mask("<0 0 1 1>")`,
    why: ['Contrairement à [struct](fn.struct), `mask` ne crée aucun coup : il supprime seulement les événements existants qui tombent dans une zone à 0. Là où le masque vaut 1, le rythme d’origine est intact.'],
    recipe: {
      title: 'une entrée au 5e cycle',
      text: 'Le masque `<0 0 0 0 1 1 1 1>` vaut 0 pendant 4 cycles, puis 1 pendant 4 : la piste entre au début de la 5e mesure, là où l’oreille attend un changement.',
      code: `$: sound("bd*4").bank("RolandTR909")
// silence 4 cycles, jeu 4 cycles
$: sound("hh*8").bank("RolandTR909")
  .mask("<0 0 0 0 1 1 1 1>")`,
    },
    vary: [['Un masque À L’INTÉRIEUR du cycle : `"1 0"` coupe la seconde moitié de chaque cycle', 'sound("hh*8").mask("1 0")']],
    traps: ['Le masque est de la mini-notation : sans chevrons, `"0 1 1 1"` découpe UN cycle en quatre parts au lieu de compter des cycles.'],
    see: ['fn.struct', 'fn.arrange', 'genre.structure'],
    legacy: [['structure', 'mask']],
  },
  {
    id: 'fn.euclid', t: 'euclid', sub: 'répartir des coups', kind: 'fn', tokens: ['euclid', 'euclidRot', 'euclidLegato'], doc: 'euclid',
    ess:
      'Répartit k coups sur n pas, le plus régulièrement possible : `.euclid(3, 8)` place 3 coups sur 8 pas, aux pas 1, 4 et 7 (x..x..x.). ' +
      'C’est le *tresillo*, qu’on entend de la musique cubaine à la techno.',
    code: `// 3 coups répartis sur 8 pas
sound("bd").euclid(3, 8)`,
    args: [
      ['pulses', 'le nombre de coups (k).'],
      ['steps', 'le nombre de pas (n) dans le cycle.'],
      ['rotation', 'avec `euclidRot(k, n, r)` : décale le motif de r pas vers la droite (plus tard). `euclidRot(3, 8, 1)` frappe aux pas 2, 5 et 8.'],
    ],
    why: [
      'Le calcul (l’algorithme de Bjorklund, conçu pour répartir des impulsions dans un accélérateur de particules, puis appliqué au rythme par Godfried Toussaint en 2005) répartit les coups aussi également que possible quand k ne divise pas n.',
      'Beaucoup de rythmes traditionnels sont « euclidiens » : (3,8) le tresillo, (5,8) le cinquillo cubain, (7,12) un motif de cloche d’Afrique de l’Ouest.',
    ],
    recipe: {
      title: 'un groove à trois couches',
      text: 'Kick régulier (4 sur 4), *rim* en tresillo (3 sur 8), charleston en 5 sur 16 décalé de 2 pas. Les trois cycles se recoupent différemment : le groove paraît complexe alors que chaque couche est simple.',
      code: `setcpm(124/4)
$: sound("bd*4").bank("RolandTR909")
$: sound("rim").euclid(3, 8).bank("RolandTR909")
$: sound("hh").euclidRot(5, 16, 2)
  .bank("RolandTR909")`,
    },
    use: [
      ['La même chose en mini-notation', 'sound("bd(3,8)")'],
      ['Chaque coup tenu jusqu’au suivant : euclidLegato', 'note("c2").euclidLegato(3, 8)\n  .sound("sawtooth").lpf(600)'],
    ],
    traps: ['`euclid` remplace le rythme du motif d’origine, comme [struct](fn.struct) : il garde les valeurs, pas les moments.'],
    see: ['mini.euclide', 'fn.struct'],
  },
  {
    id: 'fn.fast', t: 'fast', sub: 'accélérer', kind: 'fn', tokens: ['fast'], doc: 'fast',
    ess: 'Joue le motif n fois plus vite : il tient n fois dans un cycle, et chaque note dure n fois moins longtemps. `.fast(2)` : deux passages par cycle.',
    code: `// le motif de 4 notes, deux fois par cycle
n("0 2 4 7").scale("A3:minor").fast(2)
  .sound("piano")`,
    why: ['`fast` comprime le temps du motif : positions, durées et écarts sont tous divisés par n. La hauteur ne change pas (contrairement à [speed](fx.speed)), ni le tempo des autres pistes. C’est l’équivalent, pour un motif entier, de `*` en mini-notation.'],
    use: [
      ['Vitesse normale, puis double, en alternance', 'sound("bd hh sd hh").fast("<1 2>")'],
      ['Un facteur non entier : 1,5 passage par cycle, le motif ne retombe sur le début du cycle que tous les 2 cycles', 'n("0 1 2 3").scale("C4:major").fast(1.5)\n  .sound("piano")'],
    ],
    traps: ['`fast` accélère le motif, pas le tempo du morceau : les autres pistes ne bougent pas.'],
    see: ['fn.slow', 'mini.etoile', 'fn.ply'],
    legacy: [['code', 'fast / slow']],
  },
  {
    id: 'fn.slow', t: 'slow', sub: 'ralentir', kind: 'fn', tokens: ['slow'], doc: 'slow',
    ess: 'Étale le motif sur n cycles : chaque note dure n fois plus longtemps. `.slow(4)` sur un motif d’un cycle : un passage tous les 4 cycles.',
    code: `// 4 notes réparties sur 2 cycles
n("0 2 4 7").scale("A3:minor").slow(2)
  .sound("piano")`,
    why: [
      '`slow` étire le temps du motif : positions, durées et écarts sont multipliés par n. C’est l’équivalent de `/` en mini-notation.',
      'Usage clé : ralentir un [signal](fn.signaux). `sine` fait une vague par cycle ; `sine.slow(8)` fait une vague tous les 8 cycles, assez lent pour une ouverture de filtre progressive.',
    ],
    use: [['Ralentir un signal : une ouverture de filtre sur 8 cycles', 'note("c2*8").sound("sawtooth")\n  .lpf(sine.range(300, 3000).slow(8))']],
    traps: ['Un motif de 4 notes avec `.slow(2)` ne joue que 2 notes par cycle : la seconde moitié arrive au cycle suivant.'],
    see: ['fn.fast', 'mini.slash', 'fn.signaux'],
  },
  {
    id: 'fn.ply', t: 'ply', sub: 'doubler chaque coup', kind: 'fn', tokens: ['ply'], doc: 'ply',
    ess: 'Remplace chaque événement par n copies plus courtes, au même endroit : `.ply(2)` sur `"c3 e3"` donne `"[c3 c3] [e3 e3]"`. Le rythme garde sa forme mais devient plus dense.',
    code: `// chaque coup doublé sur place
sound("bd ~ sd ~").ply(2)`,
    why: ['Chaque événement est découpé en n parts égales, chacune portant la même valeur. Contrairement à [fast](fn.fast), le motif n’est pas rejoué : chaque coup est démultiplié là où il est.'],
    use: [
      ['Normal, puis doublé, puis triplé', 'sound("bd sd hh sd").ply("<1 2 3>")'],
      ['Un roulement de fin de phrase', 'sound("bd*2 [~ sd] hh*2 sd")\n  .lastOf(4, x => x.ply(2))'],
    ],
    traps: ['`ply(2)` double chaque coup là où il est ; `fast(2)` rejoue tout le motif deux fois. Le rythme obtenu n’est pas le même.'],
    see: ['fn.fast', 'fn.lastOf'],
  },
  {
    id: 'fn.rev', t: 'rev', sub: 'à l’envers', kind: 'fn', tokens: ['rev', 'palindrome'], doc: 'rev',
    ess: 'Inverse l’ordre des événements à l’intérieur de chaque cycle : le dernier joue en premier. Chaque cycle est inversé séparément.',
    code: `// mi, ré, do au lieu de do, ré, mi
note("c4 d4 e4").rev().sound("piano")`,
    why: ['Le cycle est retourné comme dans un miroir : un événement qui commençait à la position p et durait d commence maintenant à 1 − p − d. Les silences sont retournés aussi.'],
    use: [
      ['À l’endroit, puis à l’envers : palindrome', 'note("c4 d4 e4 g4").palindrome().sound("piano")'],
      ['L’original à gauche, l’envers à droite', 'note("c4 d4 e4 g4").jux(rev).sound("piano")'],
    ],
    traps: ['C’est l’ordre des notes qui est inversé, pas le son lui-même. Pour lire un échantillon à l’envers : `.speed(-1)`.'],
    evo: ['`palindrome()` alterne : un cycle à l’endroit, un cycle à l’envers.'],
    see: ['fn.jux', 'fn.firstOf', 'fx.speed'],
  },

  /* ---------------------------- variation ---------------------------- */
  {
    id: 'fn.sometimes', t: 'sometimes', sub: 'de temps en temps', kind: 'fn',
    tokens: ['sometimes', 'often', 'rarely', 'almostNever', 'almostAlways', 'sometimesBy', 'always', 'never', 'someCycles'], doc: 'sometimes',
    ess:
      'Applique une transformation à certains événements, tirés au hasard : avec `sometimes`, chacun a une chance sur deux. ' +
      'Le dosage se choisit par le mot, de `almostNever` (10 %) à `almostAlways` (90 %).',
    code: `// la moitié des charlestons, une octave plus haut
sound("hh*8").sometimes(x => x.speed(2))`,
    args: [
      ['famille', '`almostNever` 10 % · `rarely` 25 % · `sometimes` 50 % · `often` 75 % · `almostAlways` 90 % · `always` 100 % · `never` 0 %.'],
      ['sometimesBy(p, f)', 'probabilité exacte, de 0 à 1 : `.sometimesBy(.3, x => …)` = 30 %.'],
      ['someCycles(f)', 'tire au sort par CYCLE entier plutôt que par événement : tout le cycle est transformé, ou rien.'],
      ['fonction', 'ce qu’on applique, écrit `x => x.quelqueChose(…)` (voir [la flèche](js.fleche)).'],
    ],
    time: ['Le tirage se fait événement par événement, à chaque cycle : la combinaison change d’un cycle à l’autre.'],
    why: ['Le hasard de Strudel est calculé à partir du temps, pas tiré au moment où le son joue : chaque cycle diffère du précédent, mais relancer le morceau redonne exactement la même suite. Une variation qui t’a plu reviendra donc au même endroit.'],
    recipe: {
      title: 'des charlestons vivants',
      text: 'Deux couches de hasard : 30 % des coups sont lus plus vite (plus aigus, plus courts), et la moitié sont plus faibles. Le `.seed(1)` entre les deux rend les tirages indépendants : sans lui, chaque coup accéléré serait aussi un coup affaibli (mesuré : 30 % des coups cumulent les deux, au lieu de 15 %). Aucune mesure n’est identique à la précédente, mais le groove reste régulier.',
      code: `setcpm(124/4)
$: sound("bd*4").bank("RolandTR909")
$: sound("hh*16").bank("RolandTR909")
  .sometimesBy(.3, x => x.speed(1.5))
  .seed(1)  // un autre tirage pour la couche suivante
  .sometimes(x => x.gain(.4))`,
    },
    traps: [
      'Le tirage se fait événement par événement. Pour décider par cycle entier : `someCycles`.',
      'Oublier `x =>` donne une erreur : il faut une fonction, pas un résultat.',
      'Deux hasards dans la même chaîne tirent le même nombre au même instant. Mesuré dans le moteur : `degradeBy(.3).sometimesBy(.3, f)` ne transforme aucun coup, car `sometimesBy` choisit les tirages inférieurs à 0,3, justement ceux que `degradeBy` a retirés. Même piège avec `irand`, `rand`, `choose` et le `?` de la mini-notation. Pour séparer les tirages, glisse `.seed(1)` entre les deux : il décale le hasard de tout ce qui est écrit avant lui (voir [graine](voc.aleatoire.graine)).',
    ],
    see: ['js.fleche', 'fn.degradeBy', 'mini.interrogation', 'fn.firstOf'],
    legacy: [['aleatoire', 'sometimes / often / rarely']],
  },
  {
    id: 'fn.degradeBy', t: 'degradeBy', sub: 'retirer au hasard', kind: 'fn', tokens: ['degradeBy', 'degrade', 'undegradeBy'], doc: 'degradeBy',
    ess: 'Retire des événements au hasard : `.degradeBy(.3)` en supprime environ 30 %, différents à chaque cycle. Le rythme garde sa grille, mais avec des trous qui changent.',
    code: `// environ 30 % des coups en moins
sound("hh*16").degradeBy(.3)`,
    args: [
      ['quantité', 'probabilité de retirer chaque événement, de 0 (rien n’est retiré) à 1 (tout est retiré). `degrade()` = `degradeBy(.5)`.'],
      ['undegradeBy', 'l’inverse : avec la même quantité, il laisse passer exactement les événements que `degradeBy` aurait retirés.'],
    ],
    why: ['Comme pour [sometimes](fn.sometimes), le hasard dépend du temps : chaque cycle a ses propres trous, mais relancer redonne la même suite. En mini-notation, `?` après un élément fait la même chose avec 50 %.'],
    use: [['Une basse qui respire', 'note("c2*8").sound("sawtooth").lpf(600)\n  .degradeBy(.25)']],
    traps: [
      '`degradeBy` retire des événements ; pour les garder tous mais en modifier certains, c’est [sometimes](fn.sometimes).',
      'Deux hasards dans la même chaîne tirent le même nombre au même instant. Mesuré dans le moteur : `degradeBy(.3).sometimesBy(.3, f)` ne transforme aucun coup, car `sometimesBy` choisit les tirages inférieurs à 0,3, justement ceux que `degradeBy` a retirés. Même piège avec `irand`, `rand`, `choose` et le `?` de la mini-notation. Pour séparer les tirages, glisse `.seed(1)` entre les deux : il décale le hasard de tout ce qui est écrit avant lui (voir [graine](voc.aleatoire.graine)).',
    ],
    see: ['mini.interrogation', 'fn.sometimes'],
  },
  {
    id: 'fn.firstOf', t: 'firstOf', sub: 'une fois tous les n cycles', kind: 'fn', tokens: ['firstOf', 'every'], doc: 'firstOf',
    ess: 'Applique une transformation au premier cycle de chaque groupe de n : avec `firstOf(4, …)`, aux cycles 1, 5, 9… Les autres cycles jouent le motif tel quel.',
    code: `// un cycle sur 4, la mélodie à l’envers
note("c4 d4 e4 g4").firstOf(4, x => x.rev())
  .sound("piano")`,
    args: [
      ['n', 'taille du groupe, en cycles.'],
      ['fonction', 'la transformation, écrite `x => x.…`.'],
    ],
    why: ['La musique se construit par phrases de 4, 8 ou 16 mesures. Marquer le début de chaque phrase (une variation, un accent) aide l’oreille à sentir la structure.'],
    use: [['Un motif qui change de forme tous les 2 cycles', 'sound("bd*2 sd").firstOf(2, x => x.fast(2))']],
    traps: ['La transformation agit sur tout le cycle concerné, pas sur une seule note.'],
    evo: ['`every(n, …)` est un autre nom de `firstOf`, hérité de TidalCycles.'],
    see: ['fn.lastOf', 'fn.sometimes', 'js.fleche'],
  },
  {
    id: 'fn.lastOf', t: 'lastOf', sub: 'à la fin de chaque groupe', kind: 'fn', tokens: ['lastOf'], doc: 'lastOf',
    ess: 'Applique une transformation au dernier cycle de chaque groupe de n : avec `lastOf(4, …)`, aux cycles 4, 8, 12… L’outil des fins de phrase, comme les roulements de batterie (*fills*).',
    code: `// un roulement toutes les 4 mesures
sound("bd*2 [~ sd] hh*2 sd").lastOf(4, x => x.ply(2))`,
    args: [
      ['n', 'taille du groupe, en cycles.'],
      ['fonction', 'la transformation.'],
    ],
    why: ['Dans une phrase de 4 mesures, la 4e prépare la suivante. Un changement placé là (un roulement, un silence, une montée) annonce le retour au début de phrase.'],
    recipe: {
      title: 'deux niveaux de fins de phrase',
      text: 'Un petit roulement toutes les 4 mesures (`lastOf(4, …)`) et un plus grand toutes les 8 (`lastOf(8, …)`, qui accélère tout le cycle). C’est la hiérarchie des phrases de la musique de danse.',
      code: `setcpm(124/4)
sound("bd*2 [~ sd] hh*2 sd").bank("RolandTR909")
  .lastOf(4, x => x.ply(2))
  .lastOf(8, x => x.fast(2))`,
    },
    see: ['fn.firstOf', 'fn.ply', 'genre.structure'],
  },
  {
    id: 'fn.off', t: 'off', sub: 'une copie décalée', kind: 'fn', tokens: ['off'], doc: 'off',
    ess:
      'Superpose au motif une copie décalée dans le temps, à laquelle on applique une transformation : `.off(1/8, x => x.add(note(12)))` ajoute, un huitième de cycle après chaque note, la même note une octave plus haut.',
    code: `// chaque note a sa réponse, une octave plus haut
note("c3 eb3 g3 bb3").off(1/8, x => x.add(note(12)))
  .sound("triangle")`,
    args: [
      ['temps', 'décalage en fraction de cycle : `1/8` (une croche si le cycle fait 4 temps), `1/16` (une double-croche), `3/16`…'],
      ['fonction', 'ce qu’on applique à la copie seulement.'],
    ],
    why: [
      '`off` = l’original + une copie retardée et transformée. La copie de la dernière note, qui dépasse la fin du cycle, retombe au début du cycle suivant : la boucle reste régulière.',
      'Différence avec l’écho ([delay](fx.delay)) : `off` écrit de vraies notes nouvelles, qu’on peut transposer, filtrer, envoyer sur un autre son ; `delay` répète le son lui-même, identique, en s’affaiblissant.',
    ],
    recipe: {
      title: 'une mélodie qui se répond à la double-croche',
      text: 'La copie arrive 1/16 de cycle après chaque note, une quinte plus haut et plus faible : on entend une seule ligne enrichie, presque un écho harmonisé.',
      code: `setcpm(128/4)
n("0 ~ 2 4 ~ 2 7 ~").scale("A3:minor")
  .off(1/16, x => x.add(note(7)).gain(.5))
  .sound("triangle")`,
    },
    traps: ['Avec `x => x` (aucune transformation), `off` double simplement le motif, décalé : utile pour épaissir un rythme.'],
    see: ['fn.superimpose', 'fn.echo', 'fn.add', 'fx.delay'],
  },
  {
    id: 'fn.superimpose', t: 'superimpose', sub: 'une copie transformée', kind: 'fn', tokens: ['superimpose', 'layer'], doc: 'superimpose',
    ess: 'Superpose au motif une copie transformée, en même temps, sans décalage : `.superimpose(x => x.add(note(7)))` joue chaque note et sa quinte ensemble.',
    code: `// chaque note doublée à la quinte
note("c3 e3 g3").superimpose(x => x.add(note(7)))
  .sound("piano")`,
    args: [
      ['fonction', 'la transformation de la copie. L’original joue toujours.'],
      ['layer(f, g, …)', 'applique plusieurs transformations et joue leurs résultats SANS l’original.'],
    ],
    why: ['`superimpose(f)` revient à `stack(motif, f(motif))`. C’est le moyen le plus court d’épaissir une ligne : doublure à l’octave, harmonisation à la quinte, même mélodie sur un autre son.'],
    use: [
      ['Doubler sur un autre son', 'note("c3 e3 g3 e3").sound("triangle")\n  .superimpose(x => x.sound("sawtooth").lpf(1200).gain(.4))'],
      ['layer : quinte et octave, sans l’original', 'note("c3 e3").layer(x => x.add(note(7)), x => x.add(note(12)))\n  .sound("piano")'],
    ],
    traps: ['Les deux couches s’additionnent : le volume monte. Baisse le `gain` de la copie.'],
    evo: ['`layer` diffère de `superimpose` : il ne garde pas l’original.'],
    see: ['fn.off', 'fn.jux', 'fn.stack'],
    legacy: [['code', 'layer / superimpose']],
  },
  {
    id: 'fn.echo', t: 'echo', sub: 'répétitions qui s’éteignent', kind: 'fn', tokens: ['echo', 'stut', 'echoWith'], doc: 'echo',
    ess:
      'Répète chaque événement plusieurs fois, de plus en plus faiblement, en écrivant de nouvelles notes dans le motif : `.echo(3, 1/8, .5)` = l’original, puis 2 répétitions à 1/8 de cycle d’écart, au volume 0,5 puis 0,25.',
    code: `// le son, puis 2 répétitions de plus en plus faibles
sound("cp ~ ~ ~").echo(3, 1/8, .5)`,
    args: [
      ['nombre', 'nombre total de coups, l’original compris : `echo(3, …)` = le son + 2 répétitions.'],
      ['temps', 'écart entre deux coups, en fraction de cycle.'],
      ['retour', 'facteur de volume d’un coup au suivant, de 0 à 1 : avec `.5`, chaque répétition a la moitié du volume de la précédente.'],
    ],
    time: ['Les répétitions tombent à `temps`, 2 × `temps`, 3 × `temps`… après chaque événement. Celles qui dépassent la fin du cycle retombent au début du cycle suivant.'],
    why: ['C’est un écho « écrit » : de vrais événements sont ajoutés au motif, chacun avec son propre `gain`. On peut donc les transformer (filtre, autre note) ou les voir dans le motif. L’effet [delay](fx.delay), lui, traite le son après coup.'],
    use: [['echoWith : les copies passent par une fonction (vérifié dans ce moteur : chacune, la première comprise, est transformée une fois, sans cumul)', 'note("c3 ~ ~ ~").echoWith(4, 1/8, x => x.add(note(7)))\n  .sound("triangle")']],
    traps: [
      'C’est un écho « écrit » : de nouveaux événements sont créés. L’effet `.delay()` est, lui, un traitement du son.',
      'L’original reçoit `gain(1)`, alors que le volume par défaut est 0,8 : il devient un peu plus fort qu’avant.',
      '`stut` fait la même chose avec les arguments dans un autre ordre : `stut(nombre, retour, temps)`.',
    ],
    see: ['fx.delay', 'fn.off'],
  },
  {
    id: 'fn.jux', t: 'jux', sub: 'gauche et droite', kind: 'fn', tokens: ['jux', 'juxBy'], doc: 'jux',
    ess: 'Joue le motif d’origine tout à gauche et une version transformée tout à droite : `.jux(rev)` = l’original à gauche, le même à l’envers à droite. Le son s’élargit dans l’espace stéréo.',
    code: `// à gauche : l’original ; à droite : à l’envers
note("c4 e4 g4 b4").jux(rev).sound("piano")`,
    args: [
      ['fonction', 'la transformation de la copie de droite : `rev`, `x => x.fast(2)`, `x => x.add(note(12))`…'],
      ['juxBy(n, f)', 'même chose, avec un écartement réglable de 0 (les deux au centre) à 1 (tout à gauche et tout à droite).'],
    ],
    why: ['`jux(f)` revient à superposer le motif avec `pan(0)` et sa transformation avec `pan(1)` (voir [pan](fx.pan)). Chaque oreille reçoit un motif différent : le cerveau les fusionne en un son large et mouvant.'],
    use: [['À droite, deux fois plus vite', 'sound("bd hh sd hh").jux(x => x.fast(2))']],
    traps: [
      'L’effet ne s’entend qu’au casque ou sur deux enceintes.',
      'Sur un téléphone à un seul haut-parleur, on entend juste les deux motifs mélangés.',
      'S’il y a déjà un `pan`, `jux` le décale au lieu de le remplacer : mesuré dans le moteur, `pan(.2).jux(rev)` donne deux copies à −0,3 et 0,7 (au-delà de 0 et 1, le son reste collé au bord). Pour un écart franc, n’écris pas de `pan` avant `jux`.',
    ],
    see: ['fx.pan', 'fn.rev', 'fn.superimpose'],
    legacy: [['effets', 'jux']],
  },
  {
    id: 'fn.arrange', t: 'arrange', sub: 'enchaîner des sections', kind: 'fn', tokens: ['arrange'], doc: 'arrange',
    ess:
      'Enchaîne des sections en donnant à chacune sa durée en cycles : `arrange([4, intro], [8, couplet])` joue `intro` pendant 4 cycles, puis `couplet` pendant 8, puis recommence. C’est le plan du morceau.',
    code: `// 2 cycles de do, 1 cycle de sol, en boucle
arrange([2, note("c3")], [1, note("g3")])
  .sound("piano")`,
    args: [['[durée, motif]', 'une section : sa durée en cycles, puis le motif qui joue pendant ce temps. Les sections sont séparées par des virgules.']],
    why: ['Comme [cat](fn.cat), mais chaque section a sa propre durée au lieu d’un cycle chacune. Avec des sections rangées dans des variables (voir [const](js.const)), on écrit le plan du morceau comme une liste lisible.'],
    recipe: {
      title: 'un plan intro, montée, plein',
      text: 'Trois sections nommées avec `const`, puis enchaînées : 4 cycles de kick seul, 4 cycles avec les charlestons, 8 cycles avec la basse. Le tout boucle tous les 16 cycles.',
      code: `setcpm(124/4)
const kick = sound("bd*4").bank("RolandTR909")
const hats = sound("[~ hh]*4").bank("RolandTR909")
const basse = note("c2*8").sound("sawtooth").lpf(600)
arrange(
  [4, kick],
  [4, stack(kick, hats)],
  [8, stack(kick, hats, basse)]
)`,
    },
    traps: ['Chaque section est un couple `[durée, motif]` entre crochets ; les sections sont séparées par des virgules.'],
    see: ['fn.mask', 'fn.cat', 'genre.structure', 'js.const'],
    legacy: [['structure', 'arrange']],
  },

  /* ----------------------------- signaux ----------------------------- */
  {
    id: 'fn.signaux', t: 'sine, saw, tri, square, rand, perlin', sub: 'les signaux', kind: 'fn',
    schema: { type: 'signal', reglages: { bas: 300, haut: 2000, slow: 4 }, forme: 'sine' },
    tokens: ['sine', 'saw', 'tri', 'square', 'rand', 'perlin', 'isaw', 'cosine'], doc: 'sine',
    ess:
      'Des valeurs qui varient en continu avec le temps, entre 0 et 1, à brancher sur un réglage pour qu’il bouge tout seul : `.lpf(sine.range(300, 2000))`. ' +
      'Chaque signal a sa forme : vague, rampe, triangle, créneau, hasard.',
    code: `// le filtre suit une vague sur 4 cycles
note("c2*8").sound("sawtooth")
  .lpf(sine.range(300, 2000).slow(4))`,
    args: [
      ['sine', 'vague : vaut 0,5 au début du cycle, monte à 1 au premier quart, redescend à 0 aux trois quarts, revient à 0,5.'],
      ['cosine', 'la même vague, décalée d’un quart : vaut 1 au début du cycle.'],
      ['saw', 'rampe : monte en ligne droite de 0 à 1 pendant le cycle, puis retombe d’un coup. `isaw` : l’inverse, de 1 à 0.'],
      ['tri', 'triangle : monte de 0 à 1 pendant la première moitié du cycle, redescend pendant la seconde.'],
      ['square', 'créneau : 0 pendant la première moitié du cycle, 1 pendant la seconde.'],
      ['rand', 'une valeur au hasard à chaque lecture.'],
      ['perlin', 'hasard lissé : une nouvelle valeur par cycle, avec des transitions douces entre elles.'],
    ],
    time: ['Une période par cycle (une vague, une rampe…) ; `.slow(n)` l’étale sur n cycles, `.fast(n)` la resserre. Le signal est lu au début de chaque note : avec 8 notes par cycle, 8 valeurs par cycle.'],
    why: [
      'Un signal n’a pas de rythme propre : c’est une fonction du temps. Branché sur un réglage, il est lu à l’instant où chaque note commence, et cette valeur s’applique à toute la note. D’où le mouvement en escalier sur des notes longues, et fluide sur des notes nombreuses.',
      'Le hasard (`rand`, `perlin`) est calculé à partir du temps : chaque cycle diffère, mais relancer redonne la même suite.',
    ],
    recipe: {
      title: 'un charleston qui bouge dans l’espace et le timbre',
      text: 'Deux signaux sur deux réglages : `perlin` fait varier doucement l’ouverture du filtre, `sine.slow(2)` promène le son de gauche à droite en 2 cycles. 16 coups par cycle : le mouvement est fluide.',
      code: `sound("hh*16").bank("RolandTR909")
  // ouverture qui dérive doucement
  .hpf(perlin.range(3000, 9000))
  // gauche-droite en 2 cycles
  .pan(sine.slow(2))`,
    },
    traps: [
      'Un signal s’écrit SANS guillemets et sans parenthèses : `sine`, pas `"sine"` ni `sine()`.',
      'Ne pas confondre avec les sons du même nom : `sound("sine")` est un synthétiseur, `sine` tout seul est un signal.',
      'Sans `.range(…)`, le signal reste entre 0 et 1 : parfait pour `gain` ou `pan`, inutilisable pour `lpf`.',
    ],
    see: ['fn.range', 'fn.slow', 'fn.irand', 'fx.lpf'],
    legacy: [['aleatoire', 'perlin']],
  },
  {
    id: 'fn.range', t: 'range', sub: 'fixer les bornes', kind: 'fn', tokens: ['range', 'rangex'], doc: 'range',
    schema: { type: 'signal', reglages: { bas: 300, haut: 2000, slow: 2 }, forme: 'sine', missions: ['large'] },
    ess: 'Met un [signal](fn.signaux) à l’échelle : `.range(bas, haut)` transforme la plage 0–1 en bas–haut. `sine.range(300, 2000)` varie entre 300 et 2 000.',
    code: `// coupure entre 300 et 2 000 Hz
note("c2*8").sound("sawtooth")
  .lpf(sine.range(300, 2000).slow(2))`,
    args: [
      ['range(bas, haut)', 'échelle linéaire : à mi-course du signal, la valeur est la moyenne (1 150 pour 300–2 000).'],
      ['rangex(bas, haut)', 'échelle exponentielle : à mi-course, la valeur est la moyenne géométrique (316 pour 100–1 000). Le signal parcourt alors le même nombre d’octaves à chaque instant.'],
    ],
    why: ['L’oreille juge les fréquences en rapports (en octaves). Avec `range`, une montée de 100 à 1 000 Hz parcourt plus de trois octaves dans son premier quart, et quelques dixièmes d’octave dans le dernier : elle paraît rapide puis figée. `rangex` répartit les octaves également : la montée paraît régulière.'],
    vary: [['La même montée avec `rangex` : régulière à l’oreille', 'note("c2*16").sound("sawtooth")\n  .lpf(saw.rangex(200, 5000).slow(4))']],
    traps: [
      'Pour une fréquence de filtre, `rangex` (échelle exponentielle) donne un balayage plus naturel à l’oreille que `range`.',
      '`range(haut, bas)` inverse le sens du signal : la valeur descend quand le signal monte.',
    ],
    see: ['fn.signaux', 'fx.lpf'],
    legacy: [['aleatoire', 'range (a,b)']],
  },
  {
    id: 'fn.irand', t: 'irand / segment', sub: 'des nombres au hasard', kind: 'fn', tokens: ['irand', 'segment', 'run'], doc: 'irand',
    ess: '`irand(8)` tire des nombres entiers au hasard, de 0 à 7. Un signal n’a pas de rythme : `.segment(8)` le découpe en 8 valeurs par cycle, ce qui crée 8 événements.',
    code: `// 8 degrés au hasard par cycle, en la mineur
n(irand(8).segment(8)).scale("A3:minor")
  .sound("piano")`,
    args: [
      ['irand(n)', 'entiers de 0 à n − 1, au hasard.'],
      ['segment(n)', 'prend n valeurs par cycle, régulièrement espacées : transforme un signal continu en n événements.'],
      ['run(n)', 'pas de hasard : 0, 1, 2… jusqu’à n − 1, répartis dans le cycle. `n(run(8))` monte la gamme.'],
    ],
    why: ['Avec une gamme, le hasard ne peut pas sonner faux : chaque numéro tombe sur une note de la gamme. Comme tout le hasard de Strudel, `irand` dépend du temps : chaque cycle est une nouvelle mélodie, mais relancer redonne la même suite.'],
    recipe: {
      title: 'une mélodie générative qui garde un repère',
      text: 'Le hasard sur les degrés 0 à 5, mais un cycle sur 4 on joue une montée fixe (`run(8)`) : l’oreille entend de l’improvisation encadrée par un motif qui revient.',
      code: `n(irand(6).segment(8)).scale("A3:minor")
  .lastOf(4, x => n(run(8)).scale("A3:minor"))
  .sound("triangle").decay(.2).sustain(0)`,
    },
    traps: ['Sans `.segment(…)`, un signal n’a pas de rythme : il faut lui dire combien de valeurs prendre par cycle.'],
    see: ['fn.signaux', 'fn.scale'],
    legacy: [['aleatoire', 'rand / irand'], ['aleatoire', 'segment']],
  },

  /* ------------------------------ JS ------------------------------ */
  {
    id: 'js.point', t: '.', sub: 'enchaîner', kind: 'js', tokens: [],
    ess: 'Le point enchaîne les réglages : on part d’un motif et on lui ajoute des choses, l’une après l’autre.',
    code: 'note("c3 e3 g3").sound("sawtooth").lpf(800).room(.4)',
    why: [
      'Chaque fonction après un point reçoit le motif construit jusque-là et en renvoie un nouveau, modifié : `note("c3").sound("piano").lpf(800)` = un motif de notes, auquel on ajoute un son, puis un filtre. C’est ce qui permet d’aller à la ligne avant chaque point : la chaîne continue.',
    ],
    use: [['Un réglage par ligne', 'note("c3 e3 g3")\n  .sound("sawtooth")\n  .lpf(800)\n  .room(.4)']],
    traps: [
      'Le premier élément de la chaîne donne le rythme. Ce qui suit ne fait que colorer.',
      'Un point oublié entre deux fonctions donne une erreur de syntaxe.',
    ],
    see: ['js.fleche', 'mini.point'],
  },
  {
    id: 'js.fleche', t: 'x => x.…', sub: 'une petite fonction', kind: 'js', tokens: ['=>'],
    ess: 'Une façon d’écrire « prends le motif, et fais-lui ceci ». À gauche de la flèche, son nom ; à droite, ce qu’on lui fait.',
    code: 'sound("hh*8").sometimes(x => x.speed(2))',
    why: [
      'Certaines fonctions ([sometimes](fn.sometimes), [firstOf](fn.firstOf), [off](fn.off)…) n’appliquent pas une transformation tout de suite : elles décident QUAND l’appliquer. Il faut donc leur donner la transformation elle-même, sous forme de fonction, et non son résultat. `x => x.speed(2)` est cette fonction : « quand on te donnera un motif, appelle-le x et renvoie x.speed(2) ».',
    ],
    use: [
      ['Avec plusieurs réglages', 'sound("hh*8").sometimes(x => x.speed(2).gain(.5))'],
      ['Une fonction toute faite, sans flèche', 'sound("bd hh sd hh").jux(rev)'],
    ],
    traps: [
      'Le nom `x` est libre, mais il doit être le même des deux côtés de la flèche.',
      'La flèche s’écrit avec un signe égal puis un chevron : `=>`. L’inverse (`>=`) veut dire « supérieur ou égal ».',
    ],
    see: ['fn.sometimes', 'fn.firstOf', 'fn.off'],
  },
  {
    id: 'js.const', t: 'const', sub: 'donner un nom', kind: 'js', tokens: ['const', 'let'],
    ess: 'Range quelque chose sous un nom, pour s’en resservir plus bas.',
    code: `const grille = chord("<Am F C G>")
$: grille.voicing().sound("piano")
$: grille.rootNotes(2).sound("sawtooth").lpf(500)`,
    why: [
      '`const nom = …` calcule la valeur une fois et la range sous ce nom. Utiliser le nom deux fois (pour le piano et pour la basse, par exemple) garantit que les deux suivent la même grille : changer la grille à un seul endroit change tout.',
    ],
    use: [['Nommer un rythme', 'const rythme = "x ~ x x ~ x x ~"\n$: note("c2").struct(rythme).sound("sawtooth").lpf(600)\n$: sound("hh").struct(rythme)']],
    traps: [
      'Le nom s’écrit sans guillemets, sans espace et sans accent.',
      'La ligne `const` doit être placée AVANT les pistes qui l’utilisent.',
    ],
    see: ['fn.dollar', 'fn.chord'],
  },
  {
    id: 'js.guillemets', t: `"…"  et  '…'`, sub: 'deux sortes de guillemets', kind: 'js', tokens: [],
    ess: 'Entre guillemets DOUBLES, Strudel lit de la mini-notation (un rythme). Entre guillemets SIMPLES, il lit un texte brut.',
    code: `sound("bd hh sd hh").bank('RolandTR909')`,
    use: [
      ['Un nom de fonction maison : guillemets simples', `register('doux', x => x.lpf(800).room(.4))
note("c3 e3 g3").sound("sawtooth").doux()`],
    ],
    traps: [
      'Un texte qui n’est pas un rythme (adresse de fichier, nom donné à `register`, banque à charger avec `samples`) doit être entre guillemets simples. Entre guillemets doubles, le moteur tente de le lire comme un motif et échoue, parfois sans message clair.',
      'Dans le doute pour un motif : guillemets doubles. C’est le cas de tout ce qui précède dans cette app.',
    ],
    see: ['mini.espace', 'js.point'],
  },
  {
    id: 'js.commentaire', t: '//', sub: 'un commentaire', kind: 'js', tokens: ['//'],
    ess: 'Tout ce qui suit `//` sur une ligne est ignoré par Strudel. Pour écrire une note à soi, ou désactiver une ligne.',
    code: `// ma batterie
sound("bd*4, hh*8") // le charleston est en croches`,
    traps: ['Pour couper une piste `$:`, le souligné (`_$:`) est plus rapide que de commenter la ligne.'],
    see: ['fn.dollar'],
  },
];
