// Questions des approfondissements : deux ou trois par chapitre, pour le point d'étape du
// chapitre et la révision espacée (une carte par leçon, identifiant = celui de la leçon).
//
// Forme : celle des fondations ({ type: 'qcm' | 'ecoute', q, code?, choices, answer: 0,
// explain }). La bonne réponse est toujours le premier choix : l'ordre est mélangé à
// l'affichage. Chaque question est protégée par une affirmation de scripts/claims.js
// (groupe « Quiz des approfondissements ») qui cite la leçon : si le moteur change, le
// test le dit. Les chapitres House, Drum & Bass et Ambient n'en ont pas : ils
// rejoignent la section Genres, où chaque trait a ses questions.

export const legacyQuizzes = {
  /* ---------------- Sculpter le son ---------------- */
  // La source
  'L4.4.2': [
    {
      type: 'qcm',
      q: 'Que joue ce code en un cycle ?',
      code: 'note("c3 c3 c3 c3").s("sine triangle square sawtooth")',
      choices: ['Quatre do3 à la suite, chacun avec une onde différente', 'Un seul do3, les quatre ondes mêlées', 'Quatre notes différentes, toutes en sinusoïde'],
      answer: 0,
      explain: 'Les deux motifs ont quatre pas. Chaque pas prend la note du premier (do3 partout) et l’onde du second : sinusoïde, triangle, carrée, puis dent de scie, à 0, ¼, ½ et ¾ du cycle.',
    },
  ],
  'L4.4.4': [
    {
      type: 'qcm',
      q: 'Combien de couleurs de bruit entend-on dans le premier cycle ?',
      code: 's("<white pink brown>*8")',
      choices: ['Les trois, à tour de rôle : white, pink, brown, white…', 'Une seule : white, huit fois', 'Les trois en même temps, huit fois'],
      answer: 0,
      explain: '`<…>` choisit un élément par cycle, mais `*8` accélère la ronde huit fois : elle avance d’un élément à chaque huitième. Premier cycle : white pink brown white pink brown white pink ; le suivant reprend à brown.',
    },
  ],
  // Le filtre
  'L4.4.6': [
    {
      type: 'ecoute',
      q: 'Écoute deux cycles de la même basse. Lequel est le plus sombre ?',
      code: 'note("c2*4").s("sawtooth").lpf("<400 4000>")',
      choices: ['Le premier : la coupure est à 400 Hz', 'Le second : la coupure est à 4 000 Hz', 'Aucun : `lpf` ne change que le volume'],
      answer: 0,
      explain: 'Un passe-bas laisse passer ce qui est sous la coupure. À 400 Hz, il ne reste que les premières harmoniques de la basse : son rond et sombre. À 4 000 Hz, presque tout passe.',
    },
  ],
  'L4.4.8': [
    {
      type: 'qcm',
      q: 'Sur une basse, `hpf(1000)` garde…',
      code: 'note("c2 e2 g2 c3").s("sawtooth").hpf(1000)',
      choices: ['les harmoniques au-dessus d’environ 1 000 Hz : la basse perd son grave', 'les fréquences sous 1 000 Hz : la basse s’assombrit', 'une bande étroite autour de 1 000 Hz'],
      answer: 0,
      explain: '`hpf` est un passe-haut : il coupe sous la coupure, ici 1 000 Hz. Les notes de la basse (65 à 131 Hz) disparaissent ; il reste leurs harmoniques aiguës, un son fin et nasillard. La bande étroite, c’est `bpf`.',
    },
  ],
  'L4.4.9': [
    {
      type: 'qcm',
      q: 'Où est la coupure au tout début du premier cycle ?',
      code: 'note("c2").s("sawtooth").segment(16)\n  .lpf(sine.range(300, 3000).slow(2))',
      choices: ['1 650 Hz, au milieu de la plage', '300 Hz, tout en bas', '3 000 Hz, tout en haut'],
      answer: 0,
      explain: '`sine` part du milieu (0,5) et monte. `range(300, 3000)` en fait 1 650 Hz au départ. Avec `slow(2)`, la vague dure deux cycles : sommet à 3 000 Hz au milieu du premier cycle, creux à 300 Hz au milieu du second.',
    },
  ],
  // L'enveloppe
  'L4.4.11': [
    {
      type: 'qcm',
      q: 'Dans `.attack(.01).decay(.2).sustain(.3).release(.3)`, lequel est un niveau, pas une durée ?',
      choices: ['`sustain(.3)` : 30 % du sommet, tenu jusqu’à la fin de la note', '`attack(.01)`', '`decay(.2)`', '`release(.3)`'],
      answer: 0,
      explain: 'Attack, decay et release sont des durées en secondes : montée, descente, extinction. Le sustain est le niveau atteint après le decay, de 0 (silence) à 1 (le sommet).',
    },
  ],
  'L4.4.13': [
    {
      type: 'qcm',
      q: 'Avec `.decay(.15).sustain(0)`, que devient une longue note après 0,15 s ?',
      choices: ['Elle s’est éteinte : le volume est descendu à zéro', 'Elle reste à mi-volume jusqu’à la fin', 'Elle repart vers le sommet'],
      answer: 0,
      explain: 'Le decay descend du sommet au niveau sustain en 0,15 s. Le sustain vaut 0 : la note tombe au silence, même si sa place dans le cycle est plus longue. C’est le son « pincé » (pluck).',
    },
  ],
  'L4.4.14': [
    {
      type: 'qcm',
      q: 'Avec `.lpf(400).lpenv(4)`, jusqu’où monte la coupure au sommet de l’enveloppe ?',
      choices: ['6 400 Hz : 4 octaves au-dessus de 400 (400 × 2⁴)', '404 Hz', '1 600 Hz (400 × 4)'],
      answer: 0,
      explain: '`lpenv` se compte en octaves : la coupure est multipliée par 2 à la puissance `lpenv` au sommet, puis redescend avec `lpd`. Le moteur plafonne à 20 000 Hz : `lpenv(8)` sur 400 Hz s’arrête là.',
    },
  ],
  // L'espace
  'L4.4.17': [
    {
      type: 'qcm',
      q: 'Avec `.delay(.5).delaytime(.25).delayfeedback(.4)`, quel est le niveau du deuxième écho ?',
      choices: ['0,2 : 0,5 × 0,4', '0,4', '0,5 : tous les échos ont le même niveau'],
      answer: 0,
      explain: 'Le premier écho arrive 0,25 s après la note, au niveau `delay` (0,5). Chaque écho suivant reprend 40 % du précédent : 0,2, puis 0,08, et ainsi de suite.',
    },
  ],
  'L4.4.18': [
    {
      type: 'qcm',
      q: 'À `setcpm(120/4)` (120 BPM, 4 temps par cycle), que vaut `delaytime(.375)` ?',
      choices: ['Trois quarts de temps : une croche pointée', 'Un temps : une noire', 'Un quart de temps : une double croche'],
      answer: 0,
      explain: 'Un cycle dure 2 s et contient 4 temps : un temps dure 0,5 s. 0,375 s, c’est ¾ de temps, une croche pointée. L’écho tombe entre les temps, d’où son effet « roulant ».',
    },
  ],
  'L4.4.19': [
    {
      type: 'qcm',
      q: 'Pourquoi mettre la nappe sur `.orbit(2)` alors que la batterie reste sur l’orbit 1 ?',
      code: '$: note("c3 e3 g3").s("triangle").room(.8).roomsize(6).orbit(2)\n$: s("bd*4").room(.3).roomsize(1)',
      choices: ['Pour qu’elle ait sa propre réverbération, de 6 s, sans allonger celle de la batterie', 'Pour la jouer deux fois', 'Pour la placer à droite'],
      answer: 0,
      explain: 'Il y a une réverbération (et un écho) par orbit. Sur la même orbit, les deux pistes partageraient une seule pièce, dont la taille suit la dernière note jouée. Sur deux orbits, chacune garde la sienne.',
    },
  ],
  // La couleur & le mix
  'L4.4.21': [
    {
      type: 'qcm',
      q: 'Dans `distort("4:.3")`, que règle `.3` ?',
      choices: ['Le volume après la distorsion', 'La part de son distordu mélangée au son propre', 'La coupure d’un filtre'],
      answer: 0,
      explain: 'La forme `"a:b"` règle deux paramètres d’un coup : `distort` (4, la force) et `distortvol` (0,3, le volume de sortie). La distorsion fait monter le volume : on le baisse ici à 30 %.',
    },
  ],
  'L4.4.22': [
    {
      type: 'qcm',
      q: 'Dans `vib("4:.2")`, que valent 4 et .2 ?',
      choices: ['4 oscillations par seconde, de ±0,2 demi-ton', '4 demi-tons, 0,2 seconde', '4 notes, 20 % de volume'],
      answer: 0,
      explain: '`vib` fait osciller la hauteur : le premier nombre est la vitesse (en hertz), le second, `vibmod`, la profondeur en demi-tons. ±0,2 demi-ton reste discret ; ±0,5 devient un vibrato large.',
    },
  ],
  'L4.4.24': [
    {
      type: 'qcm',
      q: 'Combien de filtres passe-bas agissent ici ?',
      code: 'note("c2").s("sawtooth").lpf(300).distort("3:.3").lpf(3000)',
      choices: ['Un seul, à 3 000 Hz, avant la saturation', 'Deux : 300 Hz avant la saturation, 3 000 Hz après', 'Aucun : deux `lpf` s’annulent'],
      answer: 0,
      explain: 'Chaque note n’a qu’une valeur `cutoff` : le second `lpf` remplace le premier. Et l’ordre d’écriture ne compte pas : le moteur applique toujours le filtre, puis la distorsion.',
    },
  ],

  /* ---------------- Le code comme instrument ---------------- */
  // Le pattern est une fonction
  'L5.5.1': [
    {
      type: 'qcm',
      q: 'Quelle note joue le quatrième cycle ?',
      code: 'note("<c4 e4 g4>")',
      choices: ['do4 : la ronde recommence', 'sol4 : la dernière reste', 'Aucune : le motif est fini'],
      answer: 0,
      explain: '`<…>` joue un élément par cycle, en boucle : do4, mi4, sol4, puis de nouveau do4. Un motif ne s’arrête jamais : c’est une fonction du temps, définie pour tous les cycles.',
    },
  ],
  'L5.5.3': [
    {
      type: 'qcm',
      q: 'Que joue le deuxième cycle ?',
      code: 'cat(s("bd*2"), s("hh*4"))',
      choices: ['Quatre hh : `cat` joue un motif par cycle, à tour de rôle', 'bd et hh ensemble', 'Deux bd puis quatre hh, serrés dans le cycle'],
      answer: 0,
      explain: '`cat` (comme `<…>`) donne un cycle entier à chaque motif : bd bd, puis hh hh hh hh. `stack` les jouerait ensemble ; `seq` les serrerait dans un seul cycle.',
    },
  ],
  'L5.5.4': [
    {
      type: 'qcm',
      q: 'Quels nombres produit `run(4)` ?',
      choices: ['0 1 2 3', '1 2 3 4', '0 1 2 3 4'],
      answer: 0,
      explain: '`run(n)` compte de 0 à n − 1, en n pas égaux dans le cycle. Avec `.scale`, `n(run(8))` monte donc les huit premiers degrés de la gamme, à partir de la tonique (degré 0).',
    },
  ],
  // Manipuler le temps
  'L5.5.7': [
    {
      type: 'qcm',
      q: 'Que joue le deuxième cycle ?',
      code: 'n("0 1 2").palindrome()',
      choices: ['2 1 0 : un cycle sur deux est joué à l’envers', '0 1 2 2 1 0, serrés dans le cycle', '0 1 2, comme le premier'],
      answer: 0,
      explain: '`palindrome` alterne : le motif à l’endroit, puis à l’envers au cycle suivant. Il ne double pas la longueur du cycle.',
    },
  ],
  'L5.5.8': [
    {
      type: 'qcm',
      q: 'Que joue le deuxième cycle ?',
      code: 'n("0 1 2 3").iter(4)',
      choices: ['1 2 3 0', '3 2 1 0', '0 1 2 3'],
      answer: 0,
      explain: '`iter(4)` découpe le motif en 4 et fait démarrer chaque cycle un quart plus loin : 0 1 2 3, puis 1 2 3 0, 2 3 0 1, 3 0 1 2, et la boucle reprend.',
    },
  ],
  'L5.5.9': [
    {
      type: 'qcm',
      q: 'Que joue ce code en un cycle ?',
      code: 's("bd sd").ply(2)',
      choices: ['bd bd sd sd, en quatre pas égaux', 'bd sd bd sd', 'bd sd, deux fois plus fort'],
      answer: 0,
      explain: '`ply(2)` répète chaque événement deux fois dans sa propre place : le bd du premier demi-cycle devient deux bd d’un quart de cycle, de même pour sd.',
    },
  ],
  // Le hasard maîtrisé
  'L5.5.11': [
    {
      type: 'qcm',
      q: 'Quels nombres peut donner `irand(8)` ?',
      choices: ['Les entiers de 0 à 7', 'Les entiers de 1 à 8', 'N’importe quel nombre entre 0 et 8'],
      answer: 0,
      explain: '`irand(n)` tire un entier de 0 à n − 1. Avec `n(…).scale(…)`, ce sont huit degrés de la gamme, de la tonique à la tonique une octave plus haut (degré 7 dans une gamme de 7 notes).',
    },
  ],
  'L5.5.12': [
    {
      type: 'qcm',
      q: 'Tu relances le même code sans rien changer. Qu’entends-tu au cycle 1 ?',
      code: 'n(irand(8).segment(4)).scale("C:pentatonic")',
      choices: ['Exactement les mêmes notes que la première fois', 'D’autres notes : le hasard change à chaque lecture', 'Les mêmes notes, dans un autre ordre'],
      answer: 0,
      explain: 'Le hasard de Strudel est calculé à partir du temps (le numéro du cycle et la position dans le cycle), pas tiré à l’instant : un même cycle donne toujours les mêmes nombres. `seed` ou `ribbon` changent l’endroit où l’on puise.',
    },
  ],
  'L5.5.14': [
    {
      type: 'qcm',
      q: 'Sur un grand nombre de cycles, `s("hh*8").degradeBy(.3)` garde environ…',
      choices: ['70 % des charlestons', '30 % des charlestons', '3 charlestons par cycle, toujours'],
      answer: 0,
      explain: '`degradeBy(.3)` retire chaque événement avec une probabilité de 30 % : il en reste 70 % en moyenne, soit 5,6 par cycle. Le nombre varie d’un cycle à l’autre.',
    },
  ],
  // Accumulation & calques
  'L5.5.17': [
    {
      type: 'qcm',
      q: 'Que fait `.off(1/8, x => x.add(7))` ?',
      code: '"c3 eb3 g3".off(1/8, x => x.add(7)).note()',
      choices: ['Ajoute une copie décalée d’un huitième de cycle, 7 demi-tons plus haut', 'Décale tout le motif d’un huitième, sans copie', 'Joue une note sur huit, 7 fois plus fort'],
      answer: 0,
      explain: 'L’original reste. `off` superpose une copie retardée de 1/8 de cycle et transformée par la fonction : chaque note est suivie de sa quinte (7 demi-tons), do3 puis sol3, et ainsi de suite.',
    },
  ],
  'L5.5.18': [
    {
      type: 'qcm',
      q: 'Combien de fois entend-on chaque son, et à quel volume ?',
      code: 's("bd sd").echo(3, 1/6, .8)',
      choices: ['3 fois, original compris : volumes 1, 0,8 et 0,64', '4 fois : l’original plus 3 échos', '3 fois, toutes au même volume'],
      answer: 0,
      explain: '`echo(fois, décalage, retour)` : 3 voix en tout, espacées de 1/6 de cycle, chacune à 0,8 fois le volume de la précédente. Contrairement à `delay`, ce sont de vraies notes du motif.',
    },
  ],
  'L5.5.19': [
    {
      type: 'qcm',
      q: 'Que fait `.jux(rev)` ?',
      choices: ['Le motif tel quel à gauche, et à l’envers à droite', 'Le motif à l’envers, au centre', 'Deux copies à l’endroit, une de chaque côté'],
      answer: 0,
      explain: '`jux(f)` joue deux voix : l’original à gauche (pan 0) et sa version transformée par `f` à droite (pan 1). Avec `rev`, la droite joue à l’envers : au casque, la stéréo s’élargit.',
    },
  ],
  // L'héritage & le grand tableau
  'L5.5.21': [
    {
      type: 'qcm',
      q: 'Quelle note ouvre le deuxième cycle ?',
      code: 'note("c e g b").add(note("<0 3 5>"))',
      choices: ['mi♭3 : do3 + 3 demi-tons', 'do3 : `add` ne change que le premier cycle', 'fa3 : do3 + 5 demi-tons'],
      answer: 0,
      explain: '`<0 3 5>` donne 0, puis 3, puis 5, un nombre par cycle. Au deuxième cycle, tout l’accord monte de 3 demi-tons : do devient mi♭.',
    },
  ],
  'L5.5.22': [
    {
      type: 'qcm',
      q: 'Avec `.firstOf(4, x => x.rev())`, à quels cycles le motif est-il à l’envers ?',
      choices: ['Les cycles 1, 5, 9… : le premier de chaque groupe de quatre', 'Les cycles 4, 8, 12…', 'Un cycle sur quatre, au hasard'],
      answer: 0,
      explain: '`firstOf(n, f)` transforme le premier cycle de chaque groupe de n. Pour le dernier (4, 8, 12…), c’est `lastOf`.',
    },
  ],
  'L5.5.23': [
    {
      type: 'qcm',
      q: 'Au deuxième cycle, quelle partie du motif est transformée ?',
      code: 'n("0 1 2 3").chunk(4, x => x.add(n(10)))',
      choices: ['Le deuxième quart : 0 11 2 3', 'Le premier quart : 10 1 2 3', 'Tout le motif : 10 11 12 13'],
      answer: 0,
      explain: '`chunk(4, f)` découpe le cycle en 4 et transforme un quart à la fois, en avançant d’un quart par cycle : le premier au cycle 1, le deuxième au cycle 2… `chunkBack` part du dernier.',
    },
  ],

  /* ---------------- Composer un morceau ---------------- */
  // Le studio dans le navigateur
  'L6.6.3': [
    {
      type: 'qcm',
      q: 'Qu’entend-on ?',
      code: '$: s("bd*2")\n_hats$: s("hh*4")',
      choices: ['Seulement les deux bd : le souligné coupe la piste hats', 'bd et hh', 'Rien : le souligné est une erreur'],
      answer: 0,
      explain: 'Un nom de piste qui commence par `_` est coupé : son code reste écrit, prêt à revenir, mais il ne joue pas. Retire le souligné pour la faire entrer.',
    },
  ],
  'L6.6.4': [
    {
      type: 'qcm',
      q: 'À quoi s’applique `all(x => x.room(.3))` ?',
      code: '$: s("bd")\n$: note("c2").s("sawtooth")\nall(x => x.room(.3))',
      choices: ['Aux deux pistes : chaque note reçoit `room(.3)`', 'À la dernière piste seulement', 'À rien : il faudrait `$:` devant'],
      answer: 0,
      explain: '`all` reçoit chaque piste `$:` et applique la fonction à toutes. Pratique pour un effet commun ou un réglage de fin de chaîne.',
    },
  ],
  // Réutiliser : variables & fonctions
  'L6.6.6': [
    {
      type: 'qcm',
      q: 'Combien de basses jouent ?',
      code: 'const bass = note("c2 g2").s("gm_acoustic_bass")\n$: bass\n$: bass.add(note(12)).gain(.4)',
      choices: ['Deux : la basse, et une copie une octave plus haut, moins forte', 'Une : la seconde ligne remplace la première', 'Aucune : une `const` ne joue pas'],
      answer: 0,
      explain: 'La `const` ne joue rien seule : elle donne un nom au motif. Chaque `$:` qui l’utilise est une piste : la basse telle quelle, puis la même 12 demi-tons plus haut, à `gain(.4)`.',
    },
  ],
  'L6.6.8': [
    {
      type: 'qcm',
      q: 'Après `register(\'keymaker\', p => p.s(\'sawtooth\').lpf(900))`, que fait `note("c3").keymaker()` ?',
      choices: ['Joue do3 en dent de scie, filtré à 900 Hz', 'Rien : `keymaker` n’existe pas dans Strudel', 'Joue do3 avec le son par défaut'],
      answer: 0,
      explain: '`register` crée une méthode : `.keymaker()` applique la fonction au motif sur lequel on l’appelle. Une façon de nommer une chaîne d’effets réutilisée partout.',
    },
  ],
  'L6.6.9': [
    {
      type: 'qcm',
      q: 'Que change `.color("tomato")` au son ?',
      choices: ['Rien : seulement la couleur des visualisations', 'Il le rend plus chaud', 'Il le filtre'],
      answer: 0,
      explain: '`color` ajoute une couleur aux événements, que les visualisations (`_pianoroll`, `_punchcard`) utilisent. Les notes, leurs instants et leurs sons ne changent pas.',
    },
  ],
  // Arranger dans le temps
  'L6.6.11': [
    {
      type: 'qcm',
      q: 'À quel cycle commence la deuxième section ?',
      code: 'arrange([4, s("bd*2")], [4, s("hh*4")])',
      choices: ['Au cycle 5 : la première dure 4 cycles', 'Au cycle 2', 'Au cycle 4'],
      answer: 0,
      explain: '`arrange([durée, motif], …)` enchaîne les sections : 4 cycles de bd, puis 4 cycles de hh, et le tout recommence après 8 cycles.',
    },
  ],
  'L6.6.12': [
    {
      type: 'qcm',
      q: 'Pendant combien de cycles la basse reste-t-elle sur do2 ?',
      code: 'note("<c2!4 g2!4>")',
      choices: ['4 cycles, puis 4 sur sol2', '1 cycle, puis 1 sur sol2', '4 notes dans un seul cycle'],
      answer: 0,
      explain: '`!4` répète l’élément 4 fois dans la ronde `<…>` : do2 rejoué quatre cycles de suite, puis sol2 quatre cycles. `<c2@4 g2@4>` tiendrait aussi do2 quatre cycles, mais en une seule note longue : `!` répète, `@` allonge.',
    },
  ],
  'L6.6.13': [
    {
      type: 'qcm',
      q: 'Quand le charleston joue-t-il ?',
      code: 's("hh*2").mask("<0 0 1 1>")',
      choices: ['Aux cycles 3 et 4, puis 7 et 8…', 'Aux cycles 1 et 2', 'Une moitié de cycle sur deux'],
      answer: 0,
      explain: '`mask` laisse passer là où le motif vaut 1. `<0 0 1 1>` donne un nombre par cycle : silence deux cycles, jeu deux cycles, en boucle.',
    },
  ],
  // La matière d'un track
  'L6.6.17': [
    {
      type: 'qcm',
      q: 'Combien d’événements par cycle donne `.chop(16)` sur un son qui occupe tout le cycle ?',
      choices: ['16, chacun lisant un seizième de l’échantillon, dans l’ordre', '1, seize fois plus court', '16, dans un ordre au hasard'],
      answer: 0,
      explain: '`chop(16)` découpe chaque événement en 16 morceaux qui se suivent, le premier lisant l’échantillon de 0 à 1/16, le suivant de 1/16 à 2/16… L’ordre ne change que si tu le changes (`rev`, `iter`, `slice`).',
    },
  ],
  'L6.6.19': [
    {
      type: 'qcm',
      q: 'Combien de voix joue ce code ?',
      code: 'note("c2").layer(\n  x => x.s("sawtooth"),\n  x => x.s("square").add(note(12))\n)',
      choices: ['Deux : une dent de scie et une carrée une octave plus haut', 'Trois : l’original et les deux couches', 'Une : la dernière couche remplace la première'],
      answer: 0,
      explain: '`layer` remplace le motif par la superposition de ses couches : l’original ne joue plus. `superimpose`, lui, garde l’original et ajoute la copie transformée.',
    },
  ],
  // Finir, jouer, partager
  'L6.6.21': [
    {
      type: 'qcm',
      q: 'Où `pan(0)` place-t-il le son ?',
      choices: ['Tout à gauche', 'Au centre', 'Tout à droite'],
      answer: 0,
      explain: '`pan` va de 0 (gauche) à 1 (droite) ; 0,5 est le centre, la valeur par défaut. Les effets stéréo comme `jux` décalent ce réglage de ±0,5.',
    },
  ],
  'L6.6.22': [
    {
      type: 'qcm',
      q: 'En direct, quelle est la façon la plus sûre de faire entrer une piste préparée ?',
      code: 'drums$: s("bd*4, ~ cp")\n_bass$: note("c2 ~ g2 ~").s("gm_acoustic_bass")',
      choices: ['Retirer le `_` de `_bass`, puis relancer', 'Effacer la ligne et la réécrire', 'Ajouter `.gain(0)` à drums'],
      answer: 0,
      explain: 'La piste coupée est déjà écrite et vérifiée : un caractère suffit. À la relance, le moteur garde le tempo, et la basse entre au bon endroit du cycle.',
    },
  ],

  /* ---------------- Guitare ---------------- */
  // Le manche & l'accordage
  'L3.3.2': [
    {
      type: 'qcm',
      q: 'Les six cordes à vide, de la plus grave à la plus aiguë ?',
      choices: ['Mi La Ré Sol Si Mi (`e2 a2 d3 g3 b3 e4`)', 'Mi Si Sol Ré La Mi', 'Do Ré Mi Fa Sol La'],
      answer: 0,
      explain: 'En MIDI : 40, 45, 50, 55, 59, 64. Quatre écarts de quarte (5 demi-tons) et un de tierce majeure (4 demi-tons, entre Sol et Si). Le Mi aigu est deux octaves au-dessus du Mi grave.',
    },
  ],
  'L3.3.3': [
    {
      type: 'qcm',
      q: 'Sur une même corde, monter d’une case, c’est…',
      choices: ['monter d’un demi-ton', 'monter d’un ton', 'passer à la note suivante de la gamme'],
      answer: 0,
      explain: 'Chaque case ajoute un demi-ton : Mi à vide, Fa à la case 1, Fa# à la 2… 12 cases font une octave.',
    },
  ],
  'L3.3.4': [
    {
      type: 'qcm',
      q: 'La corde de Mi grave (`e2`) appuyée à la 12ᵉ case donne…',
      choices: ['`e3` : la même note, une octave plus haut', '`e2` : la même hauteur', '`f3`'],
      answer: 0,
      explain: '12 cases = 12 demi-tons = une octave : 40 + 12 = 52, soit `e3`. C’est pourquoi le manche porte souvent un repère double à la 12ᵉ case.',
    },
  ],
  // Lire le manche
  'L3.3.6': [
    {
      type: 'qcm',
      q: 'Sur la corde de Mi, combien de cases séparent Mi de Fa ?',
      choices: ['Une : Mi–Fa est un demi-ton', 'Deux : un ton', 'Aucune'],
      answer: 0,
      explain: 'Entre Mi et Fa (comme entre Si et Do), il n’y a pas de touche noire au piano : un demi-ton, une case. Entre Fa et Sol, il y en a deux.',
    },
  ],
  'L3.3.8': [
    {
      type: 'qcm',
      q: 'Un capo à la case 2 : de combien monte chaque corde ?',
      code: 'note("e2 a2").add(note("<0 2 5>"))',
      choices: ['2 demi-tons : Mi devient Fa#, La devient Si', '2 octaves', 'Seulement la corde de Mi'],
      answer: 0,
      explain: 'Le capo appuie sur toutes les cordes à la même case : tout monte du même nombre de demi-tons. Au deuxième cycle du code, `e2 a2` (40, 45) devient 42, 47.',
    },
  ],
  'L3.3.9': [
    {
      type: 'qcm',
      q: 'Quelles notes contient `E:minor:pentatonic` ?',
      choices: ['Mi Sol La Si Ré', 'Mi Fa# Sol La Si Do Ré', 'Mi Sol# Si'],
      answer: 0,
      explain: 'La pentatonique mineure garde 5 notes de la gamme mineure : 1, 3♭, 4, 5, 7♭. En Mi : Mi Sol La Si Ré. C’est la boîte la plus jouée en impro rock et blues.',
    },
  ],
  // Les accords ouverts
  'L3.3.12': [
    {
      type: 'qcm',
      q: 'De Mi majeur à Mi mineur, quelle note change ?',
      code: 'note("[e2,b2,e3,g#3,b3,e4] [e2,b2,e3,g3,b3,e4]")',
      choices: ['Sol# devient Sol : la tierce descend d’un demi-ton', 'Si devient Do', 'Le Mi grave disparaît'],
      answer: 0,
      explain: 'Les deux accords ont cinq notes communes. Seule la tierce change : `g#3` (56) dans le majeur, `g3` (55) dans le mineur. À la guitare, un seul doigt se lève.',
    },
  ],
  'L3.3.15': [
    {
      type: 'qcm',
      q: 'Combien de coups par cycle joue `struct("x ~ x x ~ x ~ x")` ?',
      choices: ['5', '8', '4'],
      answer: 0,
      explain: 'Le cycle a 8 pas ; chaque `x` est un coup, chaque `~` un silence. Les 5 coups tombent à 0, 2/8, 3/8, 5/8 et 7/8 du cycle.',
    },
  ],
  // Power chords & barrés
  'L3.3.16': [
    {
      type: 'qcm',
      q: 'Un power chord, c’est…',
      code: 'note("[e2,b2]")',
      choices: ['la fondamentale et sa quinte, 7 demi-tons plus haut', 'trois notes : fondamentale, tierce, quinte', 'deux fois la même note'],
      answer: 0,
      explain: '`e2` (40) et `b2` (47) : une quinte juste. Sans tierce, l’accord n’est ni majeur ni mineur, et il reste net même très saturé.',
    },
  ],
  'L3.3.17': [
    {
      type: 'qcm',
      q: 'Quelles notes joue le deuxième cycle ?',
      code: 'note("[0,7]".add("<40 45 47 43>"))',
      choices: ['45 et 52 : La2 et Mi3', '40 et 47', '45 et 47'],
      answer: 0,
      explain: 'La forme `[0,7]` (fondamentale + quinte) est déplacée d’un bloc : 40 au premier cycle, 45 au deuxième. La même forme sert partout sur le manche.',
    },
  ],
  'L3.3.19': [
    {
      type: 'qcm',
      q: 'Le barré : l’accord de Mi majeur monté d’une case donne…',
      code: 'note("[e2,b2,e3,g#3,b3,e4]".add("<0 1 3 5>"))',
      choices: ['Fa majeur : les six notes montent d’un demi-ton', 'Mi mineur', 'Fa mineur'],
      answer: 0,
      explain: 'Tout l’accord glisse d’un demi-ton : la forme reste majeure, la fondamentale passe de Mi à Fa. L’index barre les cordes pour remplacer le sillet.',
    },
  ],
  // Le jeu
  'L3.3.21': [
    {
      type: 'qcm',
      q: 'Laquelle de ces écritures arpège l’accord (une note après l’autre) ?',
      choices: ['`[c3 e3 g3]`', '`[c3,e3,g3]`', 'Les deux'],
      answer: 0,
      explain: 'Entre crochets, les espaces font une suite (trois tiers de la place) et les virgules jouent ensemble. `[c3,e3,g3]` plaque l’accord.',
    },
  ],
  'L3.3.23': [
    {
      type: 'qcm',
      q: 'Quelle note est la plus forte ?',
      code: 'note("c3 e3 g3 c4").gain("1 .5 .7 .5")',
      choices: ['La première, do3', 'La troisième, sol3', 'Toutes pareilles'],
      answer: 0,
      explain: 'Le motif de `gain` a quatre pas, comme les notes : 1, 0,5, 0,7, 0,5. Le premier temps est accentué, le troisième un peu moins.',
    },
  ],
};
