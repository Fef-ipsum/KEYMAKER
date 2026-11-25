// Wiki — sons et effets : les sources, puis la chaîne filtre → enveloppe → espace → couleur.
// Forme des entrées : voir mini.js.

export default [
  /* ----------------------------- sources ----------------------------- */
  {
    id: 'son.batterie', t: 'bd, sd, hh, oh, cp…', sub: 'les sons de batterie', kind: 'son',
    tokens: ['bd', 'sd', 'hh', 'oh', 'cp', 'rim', 'lt', 'mt', 'ht', 'cr', 'rd', 'cb', 'sh', 'tb'],
    syn: ['kick', 'grosse caisse', 'caisse claire', 'snare', 'charleston', 'hi-hat', 'clap', 'batterie', 'toms', 'cymbale'],
    ess:
      'Les noms courts des éléments d’une batterie, à écrire dans `sound("…")` : `bd` (grosse caisse, *kick*), `sd` (caisse claire, *snare*), `hh` (charleston fermé), `oh` (charleston ouvert), `cp` (clap)… ' +
      'Chaque nom désigne un dossier de sons enregistrés (des *échantillons*). [bank](fn.bank) choisit la boîte à rythmes d’où ils viennent.',
    code: `// kick, charleston, caisse claire, ouvert
sound("bd hh sd oh")`,
    args: [
      [
        'nom',
        'deux ou trois lettres, en minuscules, hérités de TidalCycles. `bd` (*bass drum*) grosse caisse · `sd` (*snare drum*) caisse claire · `hh` (*hi-hat*) charleston fermé · `oh` (*open hat*) charleston ouvert · ' +
          '`cp` (*clap*) claquement de mains · `rim` (*rimshot*) coup sur le cercle · `lt`, `mt`, `ht` toms grave, médium, aigu · `cr` (*crash*) et `rd` (*ride*) cymbales · `cb` (*cowbell*) cloche · `sh` (*shaker*) · `tb` (*tambourine*) tambourin.',
      ],
      ['numéro', '`bd:3` (ou `.n(3)`) choisit la variante n° 3 du dossier, en comptant à partir de 0. Un numéro trop grand repart du début de la liste (le moteur prend le reste de la division par le nombre de variantes).'],
    ],
    time: [
      'Un son de batterie joue son enregistrement en entier à chaque coup, même s’il dure plus longtemps que son pas : un charleston ouvert ou une cymbale continuent de sonner sous les coups suivants. ' +
        'Pour les couper : [cut](fx.cut) (un son du groupe coupe le précédent) ou [clip](fx.clip) (coupe à la fin du pas).',
    ],
    why: [
      'Chaque élément occupe sa propre zone de fréquences, ce qui permet de les superposer sans qu’ils se masquent. La grosse caisse a son corps dans le grave (en général entre 40 et 100 Hz). ' +
        'La caisse claire est dans le médium : le corps de sa peau, plus le grésillement des timbres, des ressorts métalliques tendus sous la peau du bas. Charlestons et cymbales sont dans l’aigu, au-dessus de quelques milliers de hertz.',
      'Avec `.bank("RolandTR909")`, le moteur cherche en réalité le son `RolandTR909_bd` : il colle le nom de la banque devant celui du son. C’est pourquoi l’orthographe exacte compte.',
    ],
    recipe: {
      title: 'un groove techno de base',
      text:
        'Kick sur chaque temps (`bd*4`, le *four on the floor*) ; clap sur les temps 2 et 4 (`[~ cp]*2`), l’accent appelé *backbeat* ; charleston ouvert sur chaque [contretemps](sol.contretemps) (`[~ oh]*4`, à mi-chemin entre deux kicks) ; ' +
        'charleston fermé en doubles-croches, plus faible, pour le mouvement continu. Tout vient de la même machine (TR-909), pour un son cohérent.',
      code: `setcpm(130/4)
// kick sur les 4 temps, clap sur 2 et 4
$: sound("bd*4, [~ cp]*2").bank("RolandTR909")
// ouvert entre les kicks, fermé en 16
$: sound("[~ oh]*4, hh*16").bank("RolandTR909")
  .gain(.5)`,
    },
    vary: [
      ['La même grille sur une TR-808 : mêmes noms, autre son (kick plus rond et plus long)', 'setcpm(130/4)\n$: sound("bd*4, [~ cp]*2").bank("RolandTR808")\n$: sound("[~ oh]*4, hh*16").bank("RolandTR808")\n  .gain(.5)'],
      ['Sans `.bank(…)` : le kit par défaut de Strudel, et sa variante n° 1 de grosse caisse', 'sound("bd:1 hh sd hh")'],
    ],
    traps: [
      'Sans `.bank(…)`, on entend le kit par défaut de Strudel. Avec une banque, les mêmes noms prennent le son de la machine choisie.',
      'Toutes les machines n’ont pas tous les sons : un coup absent de la banque (un `cb` sur une machine sans cloche) ne joue pas.',
      'Écrire une note sur un son de batterie le transpose : `c2` est la hauteur d’origine, `c3` le joue une octave plus haut (deux fois plus vite). Pour changer la hauteur d’un échantillon, [speed](fx.speed) est plus direct.',
    ],
    see: ['fn.bank', 'fn.sound', 'mini.deux-points', 'fx.cut', 'genre.kick-techno'],
    legacy: [['code', 'abréviations batterie']],
  },
  {
    id: 'son.ondes', t: 'sine, triangle, square, sawtooth', sub: 'les ondes de base', kind: 'son',
    schema: { type: 'onde', onde: 'sawtooth', note: 'c3' },
    tokens: ['sawtooth', 'triangle', 'pulse'],
    ess:
      'Les quatre formes d’onde de base que Strudel calcule en direct, sans enregistrement : `sine` (sinusoïde), `triangle`, `square` (carrée) et `sawtooth` (dent de scie). ' +
      'À la même note, elles ont la même hauteur mais pas le même [timbre](sol.timbre) ; de la plus douce à la plus brillante : sine, triangle, square, sawtooth. La différence tient aux harmoniques que chacune contient.',
    code: `// une onde par cycle, même note
note("c3*4")
  .sound("<sine triangle square sawtooth>")`,
    args: [
      ['sine', 'une seule fréquence, aucune harmonique : son pur et rond, proche d’un sifflement. Pour les sub-basses et les kicks de synthèse.'],
      ['triangle', 'harmoniques impaires seulement (3, 5, 7… fois la fréquence de la note), qui faiblissent très vite (la n-ième est n × n fois plus faible) : doux, un peu plus présent que la sine. C’est l’onde jouée quand on écrit des notes sans `.sound(…)`.'],
      ['square', 'harmoniques impaires seulement, qui faiblissent lentement (la n-ième est n fois plus faible) : son creux, « nasal », celui des consoles de jeu 8 bits, proche d’une clarinette.'],
      ['sawtooth', 'toutes les harmoniques (2, 3, 4… fois la fréquence), la n-ième n fois plus faible : le son le plus riche et le plus brillant, base des basses, leads et nappes de synthé, presque toujours filtré.'],
      ['pulse, pw', 'une onde rectangulaire dont `pw` règle la largeur, de 0 à 1 (défaut `.5` = onde carrée). Plus on s’éloigne de .5, plus le son s’amincit et devient nasillard. `pwrate` fait varier la largeur en continu (en hertz) : le son bouge.'],
    ],
    time: ['Les ondes sonnent tant que la note dure, avec l’[enveloppe de volume](sol.enveloppe) par défaut des synthés de Strudel : montée en 0,001 s, retombée en 0,05 s vers 60 % du volume, extinction en 0,01 s après la fin de la note.'],
    why: [
      'Tout son périodique se décompose en une somme de sinusoïdes : la fondamentale (la fréquence de la note) et des harmoniques à 2, 3, 4… fois cette fréquence (c’est le théorème de Fourier). La forme de l’onde dit quelles harmoniques sont présentes, et avec quelle force.',
      'Plus une onde a d’angles vifs ou de sauts, plus elle contient d’harmoniques aiguës : la sine n’en a aucune ; le triangle (des angles, mais pas de saut) en a peu ; le carré et la dent de scie (des sauts brusques) en ont beaucoup. L’oreille entend ces harmoniques comme de la brillance.',
      'C’est le principe de la synthèse *soustractive* : on part d’une onde riche (dent de scie, carré) et on retire des harmoniques avec un [filtre](fx.lpf). Une sine n’a rien à retirer.',
    ],
    recipe: {
      title: 'une basse en dent de scie, domptée par le filtre',
      text:
        'La dent de scie contient toutes les harmoniques ; seule, elle est agressive. Un passe-bas à 600 Hz garde la fondamentale et les premières harmoniques (pour `c2`, 65 Hz, à peu près les neuf premières), puis atténue de plus en plus les suivantes : une basse pleine mais ronde. ' +
        '`decay(.2).sustain(.3)` : chaque note s’affaisse un peu, ce qui la rend rythmique.',
      code: `setcpm(124/4)
note("c2 c2 eb2 c2 g1 c2 bb1 c2")
  // la plus riche des ondes…
  .sound("sawtooth")
  // …filtrée : on garde le grave
  .lpf(600)
  .decay(.2).sustain(.3)`,
    },
    vary: [
      ['En `square` : la même basse, plus creuse', 'setcpm(124/4)\nnote("c2 c2 eb2 c2 g1 c2 bb1 c2")\n  .sound("square").lpf(600)\n  .decay(.2).sustain(.3)'],
      ['En `sine` : le filtre ne change plus rien, il n’y a pas d’harmonique à retirer', 'setcpm(124/4)\nnote("c2 c2 eb2 c2 g1 c2 bb1 c2")\n  .sound("sine").lpf(600)\n  .decay(.2).sustain(.3)'],
    ],
    traps: [
      'Les ondes brutes sont plus fortes et plus agressives qu’un piano : baisse le `gain` ou ferme un filtre.',
      'À ne pas confondre avec les SIGNAUX `sine`, `saw`, `tri`, `square`, écrits sans guillemets, qui servent à faire bouger un réglage (voir [signaux](fn.signaux)).',
      'Une sine grave (sous 100 Hz) s’entend à peine sur un téléphone. Les ondes riches restent audibles grâce à leurs harmoniques, même quand la fondamentale ne passe pas.',
    ],
    evo: [
      'Sans `.sound(…)`, le moteur joue les notes avec une onde `triangle`.',
      '`.noise(n)` mélange du bruit rose à une onde (voir [bruit](son.bruit)).',
    ],
    see: ['son.supersaw', 'fx.lpf', 'sol.timbre', 'fn.signaux', 'son.bruit'],
    legacy: [['son', 'onde'], ['son', 'saw (dent de scie)'], ['son', 'sine (sinusoïde)'], ['son', 'triangle / square']],
  },
  {
    id: 'son.supersaw', t: 'supersaw', sub: 'plusieurs dents de scie désaccordées', kind: 'son', tokens: ['supersaw', 'unison', 'detune', 'spread'],
    ess:
      'Une [dent de scie](son.ondes) jouée par plusieurs voix à la fois (5 par défaut), chacune très légèrement désaccordée par rapport aux autres et placée un peu à gauche ou à droite. ' +
      'Ces petits écarts de fréquence font onduler le son : il devient large, épais et mouvant. C’est la signature des accords et des leads de la trance.',
    code: `// 5 voix, écart total 0,18 demi-ton
note("<[c3,eb3,g3] [ab2,c3,eb3]>")
  .sound("supersaw").lpf(2500).room(.5)`,
    args: [
      ['unison', 'nombre de voix, de 1 à 100. Défaut `5`. Plus il y en a, plus le son est épais ; le moteur divise le volume par la racine carrée du nombre de voix pour qu’il n’explose pas. `1` = une simple dent de scie.'],
      [
        'detune',
        'écart total, en [demi-tons](sol.demi-ton), entre la voix la plus grave et la plus aiguë ; les voix sont réparties régulièrement entre −detune/2 et +detune/2 autour de la note. Défaut `.18`, soit ±9 cents (un cent = un centième de demi-ton). ' +
          'Repères : `.05` = léger épaississement · `.2` à `.3` = supersaw classique · `.5` et plus = désaccord franc, son volontairement « faux ».',
      ],
      ['spread', 'écartement stéréo des voix, de 0 (toutes au centre) à 1 (alternées à fond à gauche et à droite). Défaut `.6`.'],
    ],
    time: ['Chaque voix démarre à un point de sa forme d’onde tiré au hasard : deux notes identiques ne sonnent jamais exactement pareil. L’enveloppe de volume par défaut est celle des autres ondes (.001, .05, .6, .01).'],
    why: [
      'Deux sons de fréquences très proches, joués ensemble, s’additionnent puis s’annulent tour à tour : c’est le *battement*, une ondulation du volume dont la vitesse est égale à l’écart de fréquence. ' +
        'Pour `c3` (131 Hz) avec le réglage par défaut, les voix extrêmes sont écartées d’environ 1,4 Hz : le son ondule à peu près une fois et demie par seconde.',
      'Avec plusieurs voix et des écarts tous différents, ces battements se mélangent et donnent une impression de largeur et de mouvement, comme un pupitre de cordes ou un chœur, où personne ne joue exactement à la même fréquence. Répartir les voix à gauche et à droite ajoute la largeur stéréo.',
      'Le nom vient du « Super Saw » de la Roland JP-8000 (présentée en 1996, vendue à partir de 1997), une onde qui imitait 7 dents de scie désaccordées et qui a popularisé ce son dans la trance.',
    ],
    recipe: {
      title: 'des accords de trance',
      text:
        '7 voix et un écart de 0,3 demi-ton : plus épais que le réglage par défaut, sans sonner faux. `lpf(3000)` : sept dents de scie empilées font beaucoup d’aigus, on les adoucit. ' +
        '`room(.6)` : la réverbération étale encore le son. `attack(.05)` : chaque accord arrive sans claquer. `gain(.5)` : trois notes × sept voix = 21 dents de scie, il faut baisser le volume.',
      code: `setcpm(138/4)
note("<[a2,c3,e3] [f2,a2,c3] [c3,e3,g3] [g2,b2,d3]>")
  .sound("supersaw")
  // 7 voix, écart total 0,3 demi-ton
  .unison(7).detune(.3)
  // aigus adoucis, beaucoup d’espace
  .lpf(3000).room(.6)
  .attack(.05).release(.4).gain(.5)`,
    },
    vary: [
      ['`detune(.05)` : presque plus de battement, le son redevient étroit', 'setcpm(138/4)\nnote("<[a2,c3,e3] [f2,a2,c3] [c3,e3,g3] [g2,b2,d3]>")\n  .sound("supersaw").unison(7).detune(.05)\n  .lpf(3000).room(.6)\n  .attack(.05).release(.4).gain(.5)'],
      ['`unison(1)` : une seule voix, c’est une dent de scie ordinaire', 'setcpm(138/4)\nnote("<[a2,c3,e3] [f2,a2,c3] [c3,e3,g3] [g2,b2,d3]>")\n  .sound("supersaw").unison(1)\n  .lpf(3000).room(.6)\n  .attack(.05).release(.4).gain(.5)'],
    ],
    traps: [
      'C’est un son très chargé en aigus : presque toujours à faire passer dans un `lpf`.',
      'Dans un accord, chaque note a ses propres voix : le son sature vite. Baisse le `gain`.',
      '`detune` n’accorde pas la note plus haut ou plus bas : il écarte les voix entre elles, la note moyenne reste juste.',
      'Sans `.scale(…)`, `n` sur une supersaw ne choisit pas une note : le moteur s’en sert comme valeur de `detune`. Écris les hauteurs avec `note(…)`, ou `n(…)` suivi de `.scale(…)`.',
    ],
    evo: [
      '`det` est un raccourci de `detune`.',
      'Les mêmes réglages `unison`, `detune` et `spread` s’appliquent aux ondes *wavetable* de Strudel (les sons `wt_…`).',
    ],
    see: ['son.ondes', 'genre.supersaw', 'fx.lpf', 'fx.room'],
    legacy: [['culture', 'supersaw']],
  },
  {
    id: 'son.piano', t: 'piano', sub: 'un piano enregistré', kind: 'son', tokens: ['piano'],
    ess:
      'Un piano à queue enregistré, note par note. Le moteur joue l’enregistrement le plus proche de la note demandée. ' +
      'C’est le son de référence de l’app pour entendre clairement des notes et des accords, parce que tout le monde connaît son timbre.',
    code: `note("c4 e4 g4 c5").sound("piano")`,
    args: [['note', 'de `a0` à `c8`, l’étendue d’un piano à 88 touches (27,5 à 4 186 Hz). Une note en dehors est jouée quand même, en étirant l’enregistrement le plus proche.']],
    time: [
      'Chaque note joue son enregistrement jusqu’au bout : celui du do central dure environ 16 secondes, comme une touche gardée enfoncée avec la pédale. La note continue donc bien après son pas et se superpose aux suivantes. ' +
        'Pour l’étouffer : [clip](fx.clip) (coupe à la fin du pas) ou un [release](fx.release) (coupe à la fin du pas, puis s’éteint en `release` secondes).',
    ],
    why: [
      'Le piano a été enregistré toutes les trois demi-tons (les la, do, ré♯ et fa♯ de chaque octave). Pour une note intermédiaire, le moteur prend l’enregistrement le plus proche et le lit un peu plus vite (plus aigu) ou plus lentement (plus grave) : au plus un demi-ton et demi de décalage, ce qui reste naturel.',
      'Une seule intensité a été enregistrée : jouer plus fort ou plus doucement (`gain`) change le volume, pas le timbre. Sur un vrai piano, une note frappée fort est aussi plus brillante.',
    ],
    recipe: {
      title: 'des accords qui ne se brouillent pas',
      text:
        'Sans réglage, chaque accord résonne une quinzaine de secondes et s’empile sur les suivants. `clip(1)` coupe chaque accord à la fin de son pas (ici 2 s, un accord par cycle) ; `release(.3)` lui laisse 0,3 s pour s’éteindre, comme un étouffoir qui retombe. ' +
        'Un peu de réverbération (`room(.3)`) redonne de l’air.',
      code: `chord("<Cm Ab Eb Bb>").voicing()
  .sound("piano")
  // coupé à la fin de chaque accord,
  // puis 0,3 s d’extinction
  .clip(1).release(.3)
  .room(.3)`,
    },
    vary: [['Sans `clip` ni `release` : les accords se superposent en un halo', 'chord("<Cm Ab Eb Bb>").voicing()\n  .sound("piano").room(.3)']],
    traps: [
      'Les notes ne s’arrêtent pas d’elles-mêmes à la fin de leur pas : sans `clip` ni `release`, une mélodie rapide se transforme en nappe de résonances.',
      'Une seule intensité enregistrée : le `gain` rend le son plus ou moins fort, pas plus brillant ou plus doux.',
      'Au-delà du clavier (sous `a0`, au-dessus de `c8`), le moteur étire l’enregistrement le plus proche : le son devient artificiel.',
    ],
    see: ['fn.note', 'fn.chord', 'fx.clip', 'son.ondes'],
  },
  {
    id: 'son.bruit', t: 'white, pink, brown', sub: 'le bruit', kind: 'son', tokens: ['white', 'pink', 'brown', 'noise'],
    ess:
      'Un son sans hauteur : toutes les fréquences à la fois, tirées au hasard. `white` (bruit blanc) sonne comme un souffle aigu, « chhh » ; `pink` (rose) et `brown` (brun) ont de moins en moins d’aigus, jusqu’au grondement. ' +
      'C’est la matière des charlestons, des cymbales, du souffle et des montées.',
    code: `// un cycle de chaque : blanc, rose, brun
sound("<white*8 pink*8 brown*8>")
  .decay(.08).sustain(0)`,
    args: [
      ['white', 'bruit blanc : chaque échantillon est un nombre tiré au hasard. Énergie égale à chaque hertz ; comme l’aigu contient beaucoup plus de hertz que le grave (de 10 000 à 20 000 Hz, contre 20 à 40 Hz pour l’octave la plus grave), on l’entend très aigu.'],
      ['pink', 'bruit rose : l’énergie baisse d’environ 3 dB à chaque octave, si bien que chaque octave contient la même énergie. L’oreille l’entend plus équilibré, comme une pluie ou une cascade.'],
      ['brown', 'bruit brun : chaque valeur est la précédente plus un petit pas au hasard (une « marche au hasard », comme le mouvement brownien qui lui donne son nom). L’énergie baisse d’environ 6 dB par octave : grondement sourd, vent, ressac.'],
      ['crackle', 'des impulsions isolées, tirées au hasard : un crépitement de vinyle ou de feu. Leur densité se règle avec `density` (défaut `.03`).'],
      ['noise', 'appliqué à une onde (`.sound("sawtooth").noise(.3)`) : mélange du bruit rose à l’onde. D’après le code du moteur : de 0 à 0,5, l’onde reste à plein volume et le bruit monte jusqu’à plein volume (`noise(.3)` = bruit à 60 %) ; de 0,5 à 1, c’est l’onde qui baisse, jusqu’à ne laisser que le bruit. Donne du souffle à un son de synthé.'],
    ],
    time: ['Comme les ondes, le bruit suit l’[enveloppe de volume](sol.enveloppe) par défaut des synthés (.001, .05, .6, .01) : sans réglage, il tient à 60 % jusqu’à la fin de la note. Pour une percussion : `decay` court et `sustain(0)`.'],
    why: [
      'Un son a une hauteur quand sa vibration se répète régulièrement. Le bruit ne se répète jamais : l’oreille n’y trouve aucune fréquence dominante, donc aucune note. Les cymbales et les charlestons réels en sont proches : leur métal vibre à une multitude de fréquences sans rapport simple entre elles.',
      'Filtré, le bruit prend la couleur de la bande qu’on laisse passer : un [passe-haut](fx.hpf) en fait un charleston ; un [passe-bande](fx.bpf) qu’on fait monter donne le « whoosh » des montées de dance music.',
    ],
    recipe: {
      title: 'un charleston synthétique',
      text:
        '`white` : le bruit le plus aigu. `hpf(7000)` retire tout ce qui est sous 7 000 Hz, il ne reste que le grésillement d’une cymbale. `decay(.03).sustain(0)` : chaque coup s’éteint en 30 ms, comme un charleston fermé. ' +
        'Un coup sur deux plus faible (`gain("[.5 .3]*8")`) donne de l’élan.',
      code: `setcpm(130/4)
$: sound("bd*4").bank("RolandTR909")
// bruit blanc, seulement au-dessus
// de 7 kHz
$: sound("white*16").hpf(7000)
  // 30 ms par coup : charleston fermé
  .decay(.03).sustain(0)
  // un coup sur deux plus faible
  .gain("[.5 .3]*8")`,
    },
    vary: [
      ['`decay(.25)` sur les contretemps : le même bruit devient un charleston ouvert', 'setcpm(130/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ white]*4").hpf(7000)\n  .decay(.25).sustain(0).gain(.4)'],
      ['Une montée : bruit rose dans un passe-bande qui grimpe sur 4 cycles, de plus en plus fort', '// la bande monte de 300 à 8 000 Hz\nsound("pink*16")\n  .bpf(saw.rangex(300, 8000).slow(4)).bpq(3)\n  .gain(saw.range(.1, .6).slow(4))'],
    ],
    traps: [
      'Le bruit à plein volume est désagréable et masque tout : garde un `gain` bas.',
      'Sans `decay` court et `sustain(0)`, un coup de bruit tient jusqu’à la fin de son pas : on entend une nappe de souffle au lieu d’une percussion.',
      'Sur un téléphone, `brown` est presque inaudible : son énergie est concentrée dans le grave.',
      'Ne pas confondre le bruit, un SON aléatoire, avec `rand`, un NOMBRE aléatoire qui fait varier un réglage (voir [signaux](fn.signaux)).',
    ],
    see: ['son.ondes', 'fx.hpf', 'fx.bpf', 'genre.structure'],
    legacy: [['son', 'bruit']],
  },

  /* ----------------------------- filtres ----------------------------- */
  {
    id: 'fx.lpf', t: 'lpf', sub: 'filtre passe-bas', kind: 'fx', tokens: ['lpf', 'cutoff', 'lp', 'ctf'], doc: 'lpf',
    schema: { type: 'filtre', reglages: { lpf: 600, lpq: 0 }, source: 'basse', missions: ['ferme', 'ouvre'] },
    ess:
      'Un filtre passe-bas : il laisse passer les fréquences situées sous une limite, la *fréquence de coupure*, et atténue celles qui sont au-dessus. ' +
      '`.lpf(800)` garde le grave et le médium d’un son et en retire progressivement les aigus au-delà de 800 Hz : plus le nombre est bas, plus le son est sombre et sourd.',
    code: `// coupure à 800 Hz : une basse ronde
note("c2 c2 eb2 c2").sound("sawtooth")
  .lpf(800)`,
    args: [
      [
        'fréquence',
        'la coupure, en hertz (vibrations par seconde). Plage utile : 20 à 20 000 Hz. Repères sur une dent de scie : `200` très étouffé, « derrière une porte » · `800` rond · `2000` présent · `8000` presque ouvert. ' +
          'Monter : le son s’éclaircit. Descendre : il s’assombrit, puis disparaît vers 100 Hz. L’oreille juge les fréquences en rapports : passer de 200 à 400 Hz change autant que passer de 2 000 à 4 000 Hz (une octave chaque fois).',
      ],
      ['résonance', 'en option, après un deux-points : `.lpf("800:12")` = coupure à 800 Hz et [résonance](fx.lpq) de 12. Sans valeur, la résonance vaut 1.'],
    ],
    time: [
      'Le filtre agit en continu, pendant toute la note. Sa coupure peut bouger : d’un cycle à l’autre avec la mini-notation (`lpf("<400 2000>")`), au fil du temps avec un [signal](fn.signaux), ou au début de chaque note avec une [enveloppe de filtre](fx.lpenv).',
      'Un signal n’est lu qu’au début de chaque note : pour un balayage fluide, il faut des notes nombreuses (ou `.segment(16)`).',
    ],
    why: [
      'Un son d’instrument ou de synthé est une somme d’harmoniques : la fondamentale (la note) et ses multiples (voir [timbre](sol.timbre)). Le passe-bas retire les harmoniques qui dépassent la coupure : la note reste la même, mais le timbre perd sa brillance.',
      'La coupure n’est pas un mur. Au-dessus, le filtre de Strudel atténue d’environ 12 dB par octave : une harmonique deux fois plus haute que la coupure ressort environ 4 fois plus faible (en amplitude) ; quatre fois plus haute, 16 fois plus faible.',
      'Le même phénomène existe hors des synthés : un son entendu à travers un mur ou depuis une autre pièce perd ses aigus, mieux absorbés que les graves. C’est pourquoi un passe-bas fermé donne l’impression d’un son lointain, « derrière une porte ».',
    ],
    recipe: {
      title: 'une intro qui s’ouvre',
      text:
        'La montée la plus courante de la musique électronique : le morceau démarre sourd, comme entendu de la pièce d’à côté, puis s’ouvre. `saw` monte de 0 à 1 en un cycle ; `.slow(8)` étale cette montée sur 8 cycles ; ' +
        '`rangex(200, 8000)` la convertit en fréquences, en courbe exponentielle : la coupure gagne le même nombre d’octaves à chaque instant (un peu plus de 5 octaves en tout), ce que l’oreille entend comme une ouverture régulière. ' +
        'Les doubles-croches de la basse lisent le signal 16 fois par cycle : le balayage est fluide.',
      code: `setcpm(124/4)
$: sound("bd*4").bank("RolandTR909")
$: note("c2*16").sound("sawtooth")
  // de 200 à 8 000 Hz en 8 cycles,
  // à vitesse égale en octaves
  .lpf(saw.rangex(200, 8000).slow(8))
  .gain(.5)`,
    },
    vary: [
      ['`range` au lieu de `rangex` : la même montée s’ouvre très vite au début, puis semble plafonner', 'setcpm(124/4)\n$: sound("bd*4").bank("RolandTR909")\n$: note("c2*16").sound("sawtooth")\n  // montée régulière en hertz,\n  // pas en octaves\n  .lpf(saw.range(200, 8000).slow(8))\n  .gain(.5)'],
      ['Coupure fixe très basse (`lpf(150)`) : il ne reste qu’un grondement', 'setcpm(124/4)\n$: sound("bd*4").bank("RolandTR909")\n$: note("c2*16").sound("sawtooth")\n  .lpf(150).gain(.7)'],
    ],
    traps: [
      'Sur une onde `sine`, un passe-bas ne change presque rien : il n’y a pas d’harmonique à retirer.',
      'Une valeur très basse (sous 100 Hz) peut rendre le son presque inaudible, surtout sur un téléphone.',
      'Un seul passe-bas par son : écrire deux fois `.lpf(…)` sur la même ligne ne crée pas deux filtres, la seconde valeur remplace la première. Pour une pente plus raide : `.ftype("24db")`.',
      'Ne pas confondre avec le [gain](fx.gain) : fermer le filtre fait aussi paraître le son moins fort, mais en retirant des fréquences précises, pas en baissant tout le volume.',
    ],
    evo: [
      'Autres noms : `cutoff`, `ctf`, `lp`.',
      'Le modèle du filtre se choisit avec [ftype](ref.ftype) : `"12db"` (défaut), `"24db"` (deux filtres à la suite, pente deux fois plus raide) ou `"ladder"` (un filtre « en échelle », inspiré des synthétiseurs analogiques).',
    ],
    see: ['fx.lpq', 'fx.hpf', 'fx.lpenv', 'fn.signaux', 'sol.timbre'],
    legacy: [['son', 'passe-bas (lpf)'], ['son', 'coupure'], ['son', 'filtre']],
  },
  {
    id: 'fx.lpq', t: 'lpq', sub: 'résonance du filtre', kind: 'fx', tokens: ['lpq', 'resonance'], doc: 'lpq',
    schema: { type: 'filtre', reglages: { lpf: 700, lpq: 0 }, source: 'basse', missions: ['siffle', 'acid'] },
    ess:
      'La résonance du [filtre passe-bas](fx.lpf) : elle amplifie une bande étroite de fréquences juste autour de la coupure. `lpq(15)` ajoute 15 dB à la fréquence de coupure : une bosse qu’on entend comme une note qui siffle par-dessus le son. ' +
      'Faire bouger la coupure d’un filtre résonant donne le « ouah » de l’acid.',
    code: `// bosse de +15 dB à 700 Hz
note("c2 c2 eb2 c2").sound("sawtooth")
  .lpf(700).lpq(15)`,
    args: [
      [
        'q',
        'en décibels ajoutés à la fréquence de coupure : `lpq(n)` donne +n dB exactement à la coupure (le maximum, juste en dessous, est à peine plus haut). Sans réglage : 1. ' +
          'Repères : `0` à `3` = filtre neutre · `5` à `10` = coloration nette · `12` à `20` = sifflement, son acid · au-delà de 20, le sifflement domine le son. Pour situer : +6 dB ≈ amplitude doublée, +20 dB = amplitude multipliée par 10.',
      ],
    ],
    time: ['Comme la coupure, la résonance agit pendant toute la note. On l’entend surtout quand la coupure bouge, ou quand une harmonique du son tombe près d’elle.'],
    why: [
      'Plus la résonance (le *facteur de qualité*, Q) est grande, plus le filtre renforce une bande étroite autour de la coupure au lieu de l’atténuer, comme un verre qui sonne fort sur une seule note quand on frotte son bord.',
      'Si la coupure est fixe, la bosse colore toujours les mêmes fréquences. Si elle bouge (avec une [enveloppe de filtre](fx.lpenv) ou un [signal](fn.signaux)), la bosse balaie les harmoniques l’une après l’autre et on entend une voyelle qui change : « iou », « ouah ».',
    ],
    recipe: {
      title: 'une basse acid qui balaie',
      text:
        '`lpf(sine.range(300, 2000).slow(4))` : la coupure monte et descend entre 300 et 2 000 Hz en 4 cycles. `lpq(18)` : la bosse est assez forte pour qu’on entende la coupure passer sur chaque harmonique. ' +
        '`gain(.5)` : la résonance ajoute jusqu’à 18 dB, on compense. Pour le claquement acid à chaque note, voir [lpenv](fx.lpenv).',
      code: `setcpm(130/4)
note("c2*16").sound("sawtooth")
  // coupure qui oscille sur 4 cycles
  .lpf(sine.range(300, 2000).slow(4))
  // bosse de +18 dB qui balaie le son
  .lpq(18).gain(.5)`,
    },
    vary: [
      ['`lpq(0)` : le même balayage sans bosse ; le son s’ouvre et se ferme, sans voyelle', 'setcpm(130/4)\nnote("c2*16").sound("sawtooth")\n  .lpf(sine.range(300, 2000).slow(4))\n  .lpq(0).gain(.5)'],
      ['`lpq(30)` : le sifflement domine, presque une mélodie à lui seul', 'setcpm(130/4)\nnote("c2*16").sound("sawtooth")\n  .lpf(sine.range(300, 2000).slow(4))\n  // très résonant : on baisse le volume\n  .lpq(30).gain(.3)'],
    ],
    traps: [
      'Sans `lpf`, `lpq` n’a aucun effet : il n’y a pas de filtre à faire résonner.',
      'Forte résonance = pics de volume. Baisse le `gain` avant de monter au-delà de 20.',
      'Chaque filtre a sa propre résonance : `lpq` pour le passe-bas, `hpq` pour le [passe-haut](fx.hpf), `bpq` pour le [passe-bande](fx.bpf). Attention, `bpq` n’est pas en décibels.',
      'Sur une onde `sine`, il n’y a que la fondamentale à faire résonner : l’effet ne s’entend que si la coupure passe près de la note.',
    ],
    evo: ['Le nom complet du réglage est `resonance`.', '`.lpf("700:15")` règle coupure et résonance d’un coup.'],
    see: ['fx.lpf', 'fx.lpenv', 'genre.basse-acid'],
    legacy: [['son', 'résonance']],
  },
  {
    id: 'fx.hpf', t: 'hpf', sub: 'filtre passe-haut', kind: 'fx', tokens: ['hpf', 'hcutoff', 'hp', 'hpq'], doc: 'hpf',
    schema: { type: 'filtre', reglages: { hpf: 200, hpq: 0 }, source: 'basse', filtres: ['passe-bas', 'passe-haut'], missions: ['allege'] },
    ess:
      'Un filtre passe-haut, l’inverse du [passe-bas](fx.lpf) : il laisse passer les fréquences situées au-dessus de la coupure et atténue celles qui sont en dessous. ' +
      '`.hpf(300)` retire le grave d’un son : il devient plus léger, plus fin, et laisse la place au kick et à la basse.',
    code: `// tout ce qui est sous 300 Hz s’efface
chord("<Am F>").voicing().sound("sawtooth")
  .hpf(300).lpf(3000)`,
    args: [
      [
        'fréquence',
        'la coupure, en hertz. Repères : `30` à `80` = retire seulement l’extrême grave, à peine audible · `150` à `300` = allège des accords ou une nappe, libère la place de la basse · `800` à `2000` = son fin, « radio » ou « téléphone ». ' +
          'Monter : le son s’amincit. Descendre : il retrouve du corps.',
      ],
      ['hpq', 'résonance du passe-haut, en décibels ajoutés à la coupure, comme [lpq](fx.lpq) pour le passe-bas. Sans réglage : 1.'],
    ],
    time: ['Le filtre agit en continu, pendant toute la note. Comme pour le passe-bas, sa coupure peut bouger (mini-notation, [signal](fn.signaux)) et il a sa propre enveloppe, `hpenv`.'],
    why: [
      'Dans un morceau, le grave est la zone la plus encombrée : le kick et la basse y mettent leur énergie. Des accords ou une nappe qui y ajoutent la leur rendent l’ensemble boueux. Couper le grave de tout ce qui n’en a pas besoin, c’est une règle de base du mixage : on « fait de la place ».',
      'La pente est la même que celle du passe-bas : environ 12 dB de moins par octave, en dessous de la coupure.',
      'Le son « radio » ou « téléphone » vient de là : les petits haut-parleurs ne reproduisent pas le grave, et le téléphone classique ne transmettait qu’entre 300 et 3 400 Hz environ. Un passe-haut, souvent combiné à un passe-bas, imite ce son.',
    ],
    recipe: {
      title: 'faire de la place à la basse',
      text:
        'Trois pistes se partagent le grave. Avec `hpf(250)`, les accords gardent leurs notes et leur couleur, mais ne débordent plus sur la basse : sous 250 Hz, il ne reste que le kick et la basse, qui s’entendent nettement.',
      code: `setcpm(124/4)
$: sound("bd*4").bank("RolandTR909")
$: note("<c2 ab1 eb2 bb1>").struct("x*8")
  .sound("sawtooth").lpf(700).gain(.6)
// les accords perdent leur grave :
// la basse respire
$: chord("<Cm Ab Eb Bb>").voicing()
  .sound("sawtooth").hpf(250).lpf(3000)
  .gain(.4)`,
    },
    vary: [
      ['Sans `hpf` sur les accords : le grave se charge et devient moins net', 'setcpm(124/4)\n$: sound("bd*4").bank("RolandTR909")\n$: note("<c2 ab1 eb2 bb1>").struct("x*8")\n  .sound("sawtooth").lpf(700).gain(.6)\n$: chord("<Cm Ab Eb Bb>").voicing()\n  .sound("sawtooth").lpf(3000).gain(.4)'],
      ['Effet radio : passe-haut à 2 000 Hz sur toute la batterie, un cycle sur deux', 'sound("bd*4, hh*8, [~ cp]*2").bank("RolandTR909")\n  .hpf("<0 2000>")'],
    ],
    traps: [
      'Sur une basse ou un kick, un passe-haut trop haut les vide : au-dessus de 60 à 80 Hz, le kick perd son corps.',
      'Ne pas confondre avec [lpf](fx.lpf) : `lpf` garde le GRAVE (*low pass*, « le bas passe »), `hpf` garde l’AIGU (*high pass*, « le haut passe »). Le nom dit ce qui passe, pas ce qui est coupé.',
      'Sans `hpf` dans le code, il n’y a pas de passe-haut : `hpq` seul n’a aucun effet.',
    ],
    evo: ['Autres noms : `hcutoff`, `hp`. `hpq` est le raccourci de `hresonance`.', '`.hpf("300:8")` règle coupure et résonance d’un coup.'],
    see: ['fx.lpf', 'fx.bpf', 'fx.lpq'],
    legacy: [['son', 'passe-haut (hpf)']],
  },
  {
    id: 'fx.bpf', t: 'bpf', sub: 'filtre passe-bande', kind: 'fx', tokens: ['bpf', 'bandf', 'bp', 'bpq'], doc: 'bpf',
    schema: { type: 'filtre', reglages: { bpf: 800, bpq: 1 }, source: 'basse', filtres: ['passe-bas', 'passe-haut', 'passe-bande'], missions: ['etroit'] },
    ess:
      'Un filtre passe-bande : il ne laisse passer qu’une bande de fréquences autour d’une fréquence centrale, et atténue tout ce qui est en dessous ET au-dessus. ' +
      '`.bpf(1000)` garde la zone autour de 1 000 Hz : le son perd son grave et son aigu, il devient étroit et nasal, comme au téléphone.',
    code: `// garde la bande autour de 1 000 Hz
sound("bd*4, hh*8, [~ cp]*2")
  .bank("RolandTR909").bpf(1000)`,
    args: [
      ['fréquence', 'centre de la bande, en hertz. Elle passe sans changement (0 dB) ; le reste est atténué. Repères : `300` à `600` = son sourd et creux · `1000` à `2000` = téléphone, nasal · `3000` et plus = son fin et grésillant.'],
      [
        'bpq',
        'étroitesse de la bande : le facteur de qualité Q, sans unité (contrairement à `lpq` et `hpq`, qui sont en décibels). La largeur de la bande vaut à peu près la fréquence centrale divisée par Q. ' +
          'Sans réglage : 1, une bande large (de 0,6 à 1,6 fois le centre environ, soit 600 à 1 600 Hz pour `bpf(1000)`). `5` : environ 900 à 1 100 Hz, son très nasal. `20` et plus : bande si étroite que le son « sonne » à la fréquence centrale.',
      ],
    ],
    time: ['Le filtre agit en continu, pendant toute la note. Sa fréquence centrale peut bouger comme les autres coupures, et il a sa propre enveloppe, `bpenv`.'],
    why: [
      'Un passe-bande revient à un passe-haut et un passe-bas réglés autour de la même fréquence : il retire les deux extrémités du spectre. Ce qui reste ressemble à ce que transmettait le téléphone classique (environ 300 à 3 400 Hz) : assez pour comprendre la parole, trop peu pour un son plein.',
      'Une bande étroite qu’on déplace sur un son riche fait ressortir une harmonique après l’autre : c’est le principe de la pédale « wah-wah » des guitaristes.',
    ],
    recipe: {
      title: 'un effet wah',
      text:
        '`bpf(sine.range(400, 2500).slow(2))` : le centre de la bande monte et redescend toutes les deux cycles. `bpq(6)` : une bande assez étroite pour qu’on entende une voyelle se déplacer. ' +
        'La dent de scie fournit toutes les harmoniques à faire ressortir ; les croches lisent le signal assez souvent pour un mouvement continu.',
      code: `setcpm(110/4)
note("c3*8").sound("sawtooth")
  // la bande monte et redescend
  // en 2 cycles
  .bpf(sine.range(400, 2500).slow(2))
  // bande étroite : on entend la voyelle
  .bpq(6).gain(.7)`,
    },
    vary: [['`bpq(1)` : bande large, l’effet devient discret', 'setcpm(110/4)\nnote("c3*8").sound("sawtooth")\n  .bpf(sine.range(400, 2500).slow(2))\n  .bpq(1).gain(.7)']],
    traps: [
      '`bpq` n’est pas en décibels, contrairement à `lpq` et `hpq` : `bpq(15)` donne une bande très étroite, pas une bosse de 15 dB.',
      'Le passe-bande retire beaucoup d’énergie : le son paraît nettement moins fort. Remonte le `gain` si besoin, prudemment.',
      'Sur une onde `sine`, si la note est loin de la bande, il ne reste presque rien.',
    ],
    evo: ['Autres noms : `bandf`, `bp` pour `bpf` ; `bandq` pour `bpq`.', '`.bpf("1000:5")` règle centre et étroitesse d’un coup.'],
    see: ['fx.lpf', 'fx.hpf', 'son.bruit'],
    legacy: [['son', 'passe-bande (bpf)']],
  },
  {
    id: 'fx.lpenv', t: 'lpenv', sub: 'enveloppe de filtre', kind: 'fx', tokens: ['lpenv', 'lpe', 'lpa', 'lpd', 'lps', 'lpr', 'lpattack', 'lpdecay'], doc: 'lpenv',
    schema: { type: 'enveloppe-filtre', reglages: { lpf: 300, lpq: 8, lpenv: 2 }, source: 'basse' },
    ess:
      'Fait monter puis redescendre la fréquence de coupure du [filtre passe-bas](fx.lpf) au début de CHAQUE note. ' +
      'Avec `.lpf(300).lpenv(4)`, la coupure part de 300 Hz, monte presque instantanément 4 octaves plus haut (300 × 2⁴ = 4 800 Hz), puis redescend vers 300 Hz : ' +
      'chaque note commence brillante et s’assombrit aussitôt. C’est le « ouah » des basses acid et le mordant de beaucoup de basses de synthé.',
    code: `// coupure à 300 Hz, ouverte de 4 octaves
// à chaque note, refermée en 0,15 s
note("c2 c2 eb2 c2").sound("sawtooth")
  .lpf(300).lpenv(4).lpd(.15)`,
    args: [
      [
        'lpenv',
        'ampleur de l’ouverture, en **octaves** au-dessus de `lpf` : la coupure monte jusqu’à `lpf × 2^lpenv`, plafonnée à 20 000 Hz. ' +
          '`1` = coupure doublée · `2` = ×4 · `4` = ×16 · `6` = ×64. Repères avec `lpf(300)` : `1` à `2` = léger mordant ; `3` à `4` = « ouah » franc ; ' +
          '`5` et plus = l’attaque de chaque note devient très brillante. Négatif : la forme est inversée. Avec `lpf(300).lpenv(-4)`, la coupure REPOSE à 300 × 16 = 4 800 Hz, plonge vers 300 Hz pendant l’attack, puis remonte pendant le decay : le filtre est surtout ouvert, avec un bref creux sombre au début de chaque note. ' +
          'Si `lpenv` n’est pas écrit mais que `lpa`, `lpd`, `lps` ou `lpr` l’est, il vaut 1.',
      ],
      [
        'lpa, lpd, lps, lpr',
        'l’[enveloppe ADSR](sol.enveloppe) de ce mouvement. `lpa` : secondes pour monter au maximum. `lpd` : secondes pour redescendre vers le niveau `lps`. ' +
          '`lps` : niveau tenu pendant la note, de 0 (retour à `lpf`) à 1 (le filtre reste ouvert au maximum). `lpr` : secondes pour revenir à `lpf` après la fin de la note. ' +
          'Sans aucun de ces réglages : `.005`, `.14`, `0`, `.1`. Dès que tu en écris un, les autres passent au minimum (0,001 s pour `lpa` et `lpd`, 0,01 s pour `lpr`) ' +
          'et `lps` suit la même règle que le [sustain](fx.sustain) : 1 si `lpd` n’est pas écrit, presque 0 sinon.',
      ],
      [
        'fanchor',
        'point d’ancrage du mouvement, de 0 à 1. `0` (défaut) : le repos est à `lpf` et l’ouverture monte au-dessus. `1` : le sommet de l’ouverture est à `lpf` et le repos est `lpenv` octaves en dessous. Voir [fanchor](ref.fanchor).',
      ],
    ],
    time: [
      'Le mouvement repart de zéro à chaque note, indépendamment de l’[enveloppe de volume](sol.enveloppe). Avec les valeurs par défaut, la coupure monte de `lpf` à son maximum en 5 ms, redescend vers `lpf` en 0,14 s, puis y reste jusqu’à la fin de la note.',
      'La coupure se déplace en courbe exponentielle : elle parcourt le même nombre d’octaves à chaque instant. Comme l’oreille juge les fréquences en octaves, la descente paraît régulière.',
    ],
    why: [
      'Une onde en [dent de scie](son.ondes) contient toutes les harmoniques de la note. Le passe-bas retire celles qui dépassent la coupure : coupure basse = son sourd, coupure haute = son brillant. ' +
        'Faire monter la coupure au début de la note laisse passer brièvement les harmoniques aiguës, puis les retire : le timbre passe de brillant à sourd en une fraction de seconde.',
      'Les instruments acoustiques font naturellement la même chose : une corde pincée ou frappée est riche en aigus au moment de l’attaque, et ces aigus s’éteignent plus vite que le grave. Une enveloppe de filtre rend donc un son de synthèse plus vivant.',
      'Avec de la [résonance](fx.lpq), la bande de fréquences accentuée autour de la coupure se déplace avec elle : on l’entend balayer vers le haut puis vers le bas, comme la voyelle « ouah ».',
    ],
    recipe: {
      title: 'une basse acid',
      text: [
        '`lpf(250)` : au repos, le filtre est presque fermé et la basse est sourde. `lpq(14)` : forte résonance, la coupure « siffle ». ' +
          '`lpenv(4)` : à chaque note, la coupure monte à 250 × 16 = 4 000 Hz. `lpd(.15)` : elle se referme en 0,15 s, avant la note suivante (à 130 BPM, une croche dure 0,23 s) : chaque note a son propre « ouah ».',
        '`gain(.6)` : la résonance forte fait monter le volume, on compense.',
      ],
      code: `setcpm(130/4)
note("c2 c2 c3 c2 eb2 c2 g2 bb1")
  .sound("sawtooth")
  // filtre presque fermé, très résonant
  .lpf(250).lpq(14)
  // à chaque note : +4 octaves (4 000 Hz),
  // refermé en 0,15 s
  .lpenv(4).lpd(.15)
  .gain(.6)`,
    },
    vary: [
      ['`lpenv(1)` : la même ligne, à peine animée (la coupure ne fait que doubler)', 'setcpm(130/4)\nnote("c2 c2 c3 c2 eb2 c2 g2 bb1")\n  .sound("sawtooth").lpf(250).lpq(14)\n  // une seule octave d’ouverture\n  .lpenv(1).lpd(.15).gain(.6)'],
      ['`lpd(.6)` : le filtre n’a pas le temps de se refermer avant la note suivante ; on n’entend plus un « ouah » par note mais un son globalement ouvert', 'setcpm(130/4)\nnote("c2 c2 c3 c2 eb2 c2 g2 bb1")\n  .sound("sawtooth").lpf(250).lpq(14)\n  // fermeture en 0,6 s : plus longue qu’une croche\n  .lpenv(4).lpd(.6).gain(.6)'],
      ['`lpenv("<1 2 4 6>")` : l’ouverture grandit à chaque cycle, comme quand on tourne le bouton *env mod* d’une TB-303', 'setcpm(130/4)\nnote("c2 c2 c3 c2 eb2 c2 g2 bb1")\n  .sound("sawtooth").lpf(250).lpq(14)\n  // 1, 2, 4 puis 6 octaves, un cycle chacun\n  .lpenv("<1 2 4 6>").lpd(.15).gain(.6)'],
    ],
    traps: [
      'Sans `lpf`, `lpenv` n’a aucun effet : le filtre passe-bas n’existe que si une coupure est écrite.',
      'Une coupure de départ déjà haute (`lpf(3000)`) laisse peu de place avant le plafond de 20 000 Hz, et le son est déjà brillant : l’effet s’entend à peine. Pars bas, entre 200 et 600 Hz.',
      'Sur une onde `sine`, il n’y a pas d’harmoniques à faire apparaître : l’enveloppe de filtre ne change presque rien. Elle est faite pour les ondes riches (`sawtooth`, `square`, `supersaw`).',
      'Ne pas confondre avec l’[enveloppe de volume](sol.enveloppe) : `lpd` règle la retombée du timbre, `decay` celle du volume. Les deux sont indépendantes et se combinent.',
      'Ne pas confondre avec un filtre piloté par un [signal](fn.signaux) (`lpf(sine.range(300, 2000))`) : le signal suit le temps du morceau ; l’enveloppe repart de zéro à chaque note.',
    ],
    evo: [
      '`lpe` est un raccourci de `lpenv`. `lpa`, `lpd`, `lps`, `lpr` sont les raccourcis de `lpattack`, `lpdecay`, `lpsustain`, `lprelease`.',
      'Le passe-haut et le passe-bande ont leur propre enveloppe, sur le même modèle : `hpenv` (avec `hpa`, `hpd`…) et `bpenv` (avec `bpa`, `bpd`…).',
    ],
    see: ['fx.lpf', 'fx.lpq', 'sol.enveloppe', 'fx.penv', 'genre.basse-acid'],
    legacy: [['son', 'enveloppe de filtre (lpenv)']],
  },

  /* ---------------------------- enveloppe ---------------------------- */
  {
    id: 'fx.attack', t: 'attack', sub: 'temps de montée', kind: 'fx', tokens: ['attack', 'att'], doc: 'attack',
    schema: { type: 'adsr', reglages: { attack: 0.4 }, notes: 2, missions: ['courte'] },
    ess:
      'La durée, en secondes, que met le volume d’une note pour passer de zéro à son maximum, à partir du moment où la note commence. ' +
      'Courte (quelques millisecondes), l’attaque est franche : la note « claque ». Longue (une demi-seconde et plus), le son arrive en fondu, comme une corde attaquée doucement à l’archet. ' +
      'C’est le A de l’[enveloppe ADSR](sol.enveloppe).',
    code: `// 0,3 s de montée : chaque note arrive en fondu
note("c3 e3 g3").sound("sawtooth").lpf(1500)
  .attack(.3)`,
    args: [
      [
        'attack',
        'secondes, du début de la note au sommet du volume. Le moteur ne descend pas sous 0,001 s. ' +
          'Repères : `.001` à `.005` = instantané, avec parfois un léger clic · `.01` à `.03` = net, sans clic · `.1` = doux · `.3` à `1` = nappe, cordes. ' +
          'Augmenter : le début de la note s’adoucit, puis disparaît dans le fondu. Diminuer : la note devient percussive. ' +
          'Sans aucun réglage d’enveloppe, les ondes de synthèse utilisent `.001`.',
      ],
    ],
    time: [
      'L’attack commence au début de chaque note. Le volume monte en ligne droite de 0 au sommet, puis le [decay](fx.decay) prend le relais.',
      'Si la note se termine avant la fin de l’attack, le sommet n’est jamais atteint : le [release](fx.release) part du niveau atteint à cet instant. ' +
        'Avec `note("c3*8")` au tempo par défaut de l’app (un cycle = 2 s), chaque note dure 0,25 s : une attack de 0,5 s n’y monte qu’à la moitié du sommet.',
    ],
    why: [
      'Une onde qui passe de 0 à plein volume en un instant présente une cassure brutale. Un changement aussi brusque contient une large bande de fréquences : on l’entend comme un « clic ». Plus l’attaque est lente, plus ce changement est étalé et plus le début de la note est doux.',
      'C’est aussi un indice majeur pour reconnaître un instrument : une corde pincée ou un tambour atteignent leur maximum en quelques millisecondes ; un violon à l’archet, une flûte ou un chœur mettent des dizaines à des centaines de millisecondes. L’attaque fait partie du [timbre](sol.timbre) perçu.',
      'La montée est linéaire en amplitude. Or l’oreille juge le volume en proportions (en décibels) : passer de 1 % à 10 % du sommet est un énorme changement, passer de 90 % à 100 % un tout petit. Une attaque linéaire paraît donc rapide au début, puis plafonner.',
    ],
    recipe: {
      title: 'une nappe qui gonfle',
      text:
        'Un accord par cycle, soit 2 s chacun : assez long pour que l’attaque arrive au sommet. `attack(.6)` : plus d’une demi-seconde de montée, on n’entend plus le début de la note. ' +
        '`sustain(.8)` : l’accord reste presque au sommet tant qu’il dure. `release(1.5)` : il s’efface en 1,5 s après sa fin, ce qui enchaîne les accords sans trou.',
      code: `note("<[c3,eb3,g3] [ab2,c3,eb3]>")
  .sound("sawtooth").lpf(1200)
  // 0,6 s de montée : l’accord arrive en fondu
  .attack(.6)
  // tenu à 80 % du sommet, 1,5 s pour s’éteindre
  .sustain(.8).release(1.5)`,
    },
    vary: [
      ['Attaque de 0,005 s : la même nappe devient une suite d’accords plaqués', 'note("<[c3,eb3,g3] [ab2,c3,eb3]>")\n  .sound("sawtooth").lpf(1200)\n  // montée quasi instantanée\n  .attack(.005)\n  .sustain(.8).release(1.5)'],
      ['Attaque plus longue que la note : le son ne décolle jamais', '// 8 notes de 0,25 s, attaque de 0,5 s :\n// le sommet n’est jamais atteint\nnote("c3*8").sound("sawtooth").lpf(1500)\n  .attack(.5)'],
    ],
    traps: [
      'Une attack plus longue que la note : le son n’atteint jamais son sommet, il reste faible puis s’éteint. Ce n’est pas un défaut : la durée de la note vient du code (la longueur du pas), pas de l’enveloppe.',
      'Écrire `attack` seul change aussi les trois autres réglages : decay 0,001 s, sustain 1, release 0,01 s (au lieu de .05, .6 et .01 sans rien écrire). La note peut donc paraître plus forte qu’avant, puisque son niveau tenu passe de 0,6 à 1.',
      'Sur un son enregistré (`bd`, `piano`…), l’attack s’applique au volume de l’échantillon : une attack lente efface le début du son, qui contient souvent l’essentiel (la frappe).',
      'Ne pas confondre avec l’attack du filtre (`lpa`, voir [lpenv](fx.lpenv)) ou de la hauteur (`pattack`, voir [penv](fx.penv)) : même mot, autres cibles.',
    ],
    evo: ['Raccourci : `att`.'],
    see: ['fx.decay', 'fx.release', 'fx.adsr', 'sol.enveloppe'],
  },
  {
    id: 'fx.decay', t: 'decay', sub: 'temps de descente vers le sustain', kind: 'fx', tokens: ['decay', 'dec'], doc: 'decay',
    schema: { type: 'adsr', reglages: { decay: 0.2, sustain: 0 }, notes: 4, missions: ['pince'] },
    ess:
      'La durée, en secondes, que met le volume pour redescendre du sommet (atteint à la fin de l’[attack](fx.attack)) jusqu’au niveau de [sustain](fx.sustain). ' +
      'Avec un sustain à 0, le son retombe jusqu’au silence : c’est alors le decay qui fixe la longueur audible de la note, quelle que soit sa durée écrite. ' +
      'C’est le D de l’[enveloppe ADSR](sol.enveloppe).',
    code: `// chaque note retombe au silence en 0,15 s
note("c3 e3 g3 e3").sound("sawtooth").lpf(1200)
  .decay(.15).sustain(0)`,
    args: [
      [
        'decay',
        'secondes, du sommet au niveau de sustain. Minimum 0,001 s. Repères avec `sustain(0)` : `.05` = coup sec, presque un clic · `.15` = note pincée (*pluck*) · `.4` = note ronde qui résonne · `1` et plus = cloche, piano. ' +
          'Augmenter : la note sonne plus longtemps. Diminuer : elle devient plus sèche. Sans aucun réglage d’enveloppe, les ondes de synthèse utilisent `.05` (avec un sustain de `.6`).',
      ],
    ],
    time: [
      'Le decay commence juste après l’attack et descend en ligne droite. Une fois le niveau de sustain atteint, le son y reste jusqu’à la fin de la note.',
      'Si la note se termine pendant le decay, le [release](fx.release) part du niveau atteint à cet instant : le sustain n’est jamais atteint.',
    ],
    why: [
      'Un instrument qu’on frappe ou qu’on pince ne reçoit de l’énergie qu’une fois. Ensuite il la perd (frottements, rayonnement dans l’air) et son volume décroît tout seul : c’est ce que le decay imite. ' +
        'Un instrument entretenu (archet, souffle, orgue) reçoit de l’énergie en continu et garde son niveau : c’est le rôle du sustain.',
    ],
    recipe: {
      title: 'une basse pincée',
      text:
        '`sustain(0)` : chaque note retombe au silence. `decay(.12)` : elle dure à peine plus d’un dixième de seconde, ce qui laisse un blanc avant la suivante (à 124 BPM, un pas de croche dure 0,24 s) : la ligne devient rythmique. ' +
        'L’attack reste au minimum (0,001 s) : chaque note démarre franchement. Le filtre à 800 Hz retire les aigus agressifs de la dent de scie.',
      code: `setcpm(124/4)
// 8 notes par cycle : chaque pas dure 0,24 s
note("c2 c2 eb2 c2 g1 c2 bb1 c2")
  .sound("sawtooth").lpf(800)
  // retombe au silence en 0,12 s
  .decay(.12).sustain(0)`,
    },
    vary: [
      ['Decay de 0,35 s : les notes se touchent, la ligne devient ronde et continue', 'setcpm(124/4)\nnote("c2 c2 eb2 c2 g1 c2 bb1 c2")\n  .sound("sawtooth").lpf(800)\n  .decay(.35).sustain(0)'],
      ['Sustain à 0,4 au lieu de 0 : après la retombée, la note reste audible jusqu’au bout de son pas', 'setcpm(124/4)\nnote("c2 c2 eb2 c2 g1 c2 bb1 c2")\n  .sound("sawtooth").lpf(800)\n  // retombe à 40 % du sommet, puis tient\n  .decay(.12).sustain(.4)'],
    ],
    traps: [
      'Avec un sustain à 1, le decay ne s’entend pas : il n’y a rien vers quoi descendre. C’est le cas si tu écris `attack` ou `release` seul : le sustain passe alors à 1.',
      'Écrire `decay` seul met le sustain à 0,001, presque le silence : `decay(.3)` seul donne déjà une note qui s’éteint en 0,3 s.',
      'Ne pas confondre avec le [release](fx.release) : le decay agit PENDANT la note, le release APRÈS sa fin.',
      'Sur un son enregistré, le decay s’applique à l’échantillon, qui sinon joue en entier : `sound("hh*8").decay(.03).sustain(0)` raccourcit le charleston.',
    ],
    evo: ['Raccourci : `dec`.'],
    see: ['fx.sustain', 'fx.attack', 'fx.adsr', 'sol.enveloppe'],
    legacy: [['son', 'pluck / stab']],
  },
  {
    id: 'fx.sustain', t: 'sustain', sub: 'niveau pendant la note', kind: 'fx', tokens: ['sustain', 'sus'], doc: 'sustain',
    schema: { type: 'adsr', reglages: { decay: 0.3, sustain: 0.3 }, notes: 1, missions: ['pince'] },
    ess:
      'Le niveau de volume, entre 0 et 1, auquel la note se maintient après l’[attack](fx.attack) et le [decay](fx.decay), jusqu’à ce qu’elle se termine. ' +
      '1 = le sommet de l’enveloppe, 0 = le silence. C’est le seul des quatre réglages ADSR qui soit un niveau et non une durée : il dure exactement ce que dure la note.',
    code: `// retombe en 0,2 s à 30 % du sommet, puis tient
note("c3 e3").sound("sawtooth").lpf(1200)
  .decay(.2).sustain(.3)`,
    args: [
      [
        'sustain',
        'niveau de 0 à 1 (au-delà de 1, le moteur ramène la valeur à 1). C’est une proportion de l’amplitude au sommet : `.5` = moitié de l’amplitude, environ 6 dB de moins, ce que l’oreille entend nettement moins fort, mais pas « deux fois moins ». ' +
          'Repères : `0` = son percussif qui s’éteint seul · `.3` = note qui s’affaisse mais reste présente · `.8` à `1` = son tenu (orgue, nappe). Sans aucun réglage d’enveloppe, les ondes de synthèse utilisent `.6`.',
      ],
    ],
    time: ['Le niveau de sustain est atteint à la fin du decay et tenu jusqu’à la fin de la note, qu’elle dure 0,1 s ou 4 s. À la fin de la note, le [release](fx.release) le fait descendre à zéro.'],
    why: [
      'Le sustain représente les sons entretenus : tant que l’archet frotte, que le souffle passe ou que la touche d’orgue est enfoncée, l’instrument reçoit de l’énergie et garde son niveau. ' +
        'Un sustain à 0 représente au contraire les sons frappés ou pincés, qui ne reçoivent plus rien après le coup et s’éteignent d’eux-mêmes.',
    ],
    recipe: {
      title: 'un orgue',
      text:
        'Un orgue sonne à plein volume tant qu’on tient la touche, et s’arrête presque net quand on la lâche. Donc : attaque très courte (`.01`), sustain au maximum (`1`), release court (`.05`). ' +
        'Le decay n’a alors aucun effet : il n’y a rien à descendre. `gain(.5)` : l’onde carrée est forte.',
      code: `note("<[c3,e3,g3] [f3,a3,c4]>")
  .sound("square").lpf(2500)
  // plein volume tant que la note dure,
  // arrêt presque net à la fin
  .attack(.01).sustain(1).release(.05)
  .gain(.5)`,
    },
    vary: [
      ['Sustain à 0,2 avec un decay de 0,4 s : le même accord frappe puis s’affaisse, comme un piano électrique', 'note("<[c3,e3,g3] [f3,a3,c4]>")\n  .sound("square").lpf(2500)\n  // retombe à 20 % en 0,4 s, puis tient\n  .attack(.01).decay(.4).sustain(.2).release(.3)\n  .gain(.5)'],
    ],
    traps: [
      'Le sustain ne s’entend que si la note dure plus longtemps que l’attack et le decay réunis : sur des notes très courtes, il n’est jamais atteint.',
      'Écrire `sustain` sans `decay` : le decay vaut alors 0,001 s, donc la chute du sommet au niveau de sustain est instantanée. Pour entendre une retombée, écris aussi un decay.',
      'Ne pas confondre avec la pédale de sustain d’un piano, qui prolonge le son APRÈS qu’on a lâché la touche : dans Strudel, c’est le rôle du [release](fx.release).',
      'Ne pas confondre avec le [gain](fx.gain) : le gain règle le volume de toute la note ; le sustain règle seulement la partie tenue, par rapport au sommet de l’enveloppe.',
    ],
    evo: ['Raccourci : `sus`.'],
    see: ['fx.decay', 'fx.release', 'fx.adsr', 'sol.enveloppe'],
  },
  {
    id: 'fx.release', t: 'release', sub: 'temps d’extinction', kind: 'fx', tokens: ['release', 'rel'], doc: 'release',
    schema: { type: 'adsr', reglages: { release: 0.3 }, notes: 2, missions: ['traine'] },
    ess:
      'La durée, en secondes, que met le son pour retomber à zéro APRÈS la fin de la note. Court, la note s’arrête net ; long, elle continue de sonner et se fond dans la suivante. ' +
      'C’est le R de l’[enveloppe ADSR](sol.enveloppe).',
    code: `// chaque note continue 0,8 s après sa fin
note("c3 ~ g3 ~").sound("sawtooth").lpf(1500)
  .release(.8)`,
    args: [
      [
        'release',
        'secondes. Minimum 0,01 s, valeur par défaut. Repères : `.01` = coupure nette, parfois un petit clic · `.05` à `.1` = fin propre · `.3` à `.5` = la note traîne un peu · `1` à `3` = longue queue, notes qui se chevauchent. ' +
          'Augmenter : les notes débordent sur les suivantes, le son devient plus fondu mais aussi plus brouillon. Diminuer : la ligne devient plus sèche et plus rythmique.',
      ],
    ],
    time: [
      'Le release démarre à la fin de la note (la fin de son pas, ou plus tôt ou plus tard si [clip](fx.clip) change sa durée) et part du niveau atteint à cet instant, en général le sustain. Il descend en ligne droite jusqu’à zéro.',
      'Il s’ajoute à la durée de la note : avec des notes de 0,5 s et un release de 1 s, chaque note sonne 1,5 s en tout et chevauche les deux suivantes.',
    ],
    why: [
      'Une note réelle ne s’arrête jamais instantanément : quand on lâche une touche de piano, l’étouffoir met un instant à immobiliser la corde. Le release imite cette extinction. ' +
        'Il évite aussi l’arrêt brusque de l’onde, qui produirait un clic (même principe que pour l’[attack](fx.attack)).',
      'La descente est linéaire en amplitude ; l’oreille, qui juge le volume en proportions, l’entend rester assez forte longtemps, puis disparaître vite à la fin.',
    ],
    recipe: {
      title: 'des accords qui s’enchaînent en fondu',
      text:
        'Les accords changent à chaque cycle. Avec un release de 1,5 s, chaque accord sonne encore pendant que le suivant commence : le passage se fait en fondu enchaîné. ' +
        '`attack(.3)` évite que le nouvel accord n’arrive d’un coup par-dessus.',
      code: `note("<[c3,eb3,g3] [bb2,d3,f3] [ab2,c3,eb3]>")
  .sound("sawtooth").lpf(1000)
  .attack(.3)
  // 1,5 s de queue : chaque accord
  // se fond dans le suivant
  .release(1.5)`,
    },
    vary: [
      ['Release de 0,05 s : les accords s’enchaînent sans fondu, chaque changement s’entend nettement', 'note("<[c3,eb3,g3] [bb2,d3,f3] [ab2,c3,eb3]>")\n  .sound("sawtooth").lpf(1000)\n  .attack(.3)\n  .release(.05)'],
    ],
    traps: [
      'Sur une basse, un release long fait se chevaucher les notes : le grave devient flou. Garde-le sous 0,1 s sur les sons graves et rythmiques.',
      'Sur un son enregistré (`bd`, `piano`…), écrire `release` change la façon dont il est coupé. Sans release (ni [clip](fx.clip)), l’échantillon joue en entier, même au-delà de son pas. Avec un release, il est coupé à la fin du pas, puis s’éteint en `release` secondes : `sound("bd*2").release(.05)` peut raccourcir le kick.',
      'Écrire `release` seul met le sustain à 1 (au lieu de .6 sans réglage) : la note devient plus forte pendant qu’elle dure.',
      'Ne pas confondre avec la réverbération ([room](fx.room)) : le release prolonge la note elle-même ; la réverbération ajoute autour d’elle les réflexions d’une pièce.',
    ],
    evo: ['Raccourci : `rel`.'],
    see: ['fx.attack', 'fx.clip', 'fx.adsr', 'sol.enveloppe'],
  },
  {
    id: 'fx.adsr', t: 'adsr', sub: 'l’enveloppe en une fois', kind: 'fx', tokens: ['adsr'], doc: 'adsr',
    schema: { type: 'adsr', reglages: { attack: 0.4, decay: 0.3, sustain: 0.8, release: 1.2 }, notes: 4 },
    ess:
      'Écrit les quatre réglages de l’[enveloppe de volume](sol.enveloppe) en une fois, dans l’ordre attack, decay, sustain, release, séparés par des deux-points : ' +
      '`.adsr(".01:.2:.5:.3")` équivaut exactement à `.attack(.01).decay(.2).sustain(.5).release(.3)`. Trois valeurs sont des durées en secondes ; la troisième est un niveau, de 0 à 1.',
    code: `// A 0,01 s · D 0,15 s · S 0 · R 0,1 s
note("c3 e3 g3 e3").sound("sawtooth").lpf(1500)
  .adsr(".01:.15:0:.1")`,
    args: [
      ['A', '[attack](fx.attack) : secondes pour monter de 0 au sommet.'],
      ['D', '[decay](fx.decay) : secondes pour descendre du sommet au niveau S.'],
      ['S', '[sustain](fx.sustain) : niveau tenu jusqu’à la fin de la note, de 0 à 1.'],
      ['R', '[release](fx.release) : secondes pour s’éteindre après la fin de la note.'],
    ],
    time: ['Pour chaque note : montée pendant A, descente pendant D jusqu’au niveau S, maintien à S jusqu’à la fin de la note, puis extinction pendant R. Si la note finit avant la fin de A + D, l’enveloppe est coupée là où elle en est et R part de ce niveau.'],
    why: ['C’est une écriture compacte, rien de plus : le moteur la traduit en quatre réglages séparés. Elle est commode parce que les quatre valeurs dépendent les unes des autres (un decay ne s’entend que si S est inférieur à 1, etc.) : les voir côte à côte aide à les régler ensemble.'],
    recipe: {
      title: 'trois caractères avec les mêmes notes',
      text:
        'Un profil par cycle. Pincé (`.005:.2:0:.1`) : montée instantanée, retombée au silence en 0,2 s. Orgue (`.01:.01:1:.05`) : plein volume tenu, arrêt net. ' +
        'Nappe (`.4:.3:.8:1.2`) : montée lente, léger affaissement, longue queue. Ce sont les profils proposés par le schéma de l’enveloppe.',
      code: `// un profil par cycle : pincé, orgue, nappe
note("[c3,eb3,g3]*2").sound("sawtooth").lpf(1500)
  .adsr("<.005:.2:0:.1 .01:.01:1:.05 .4:.3:.8:1.2>")`,
    },
    vary: [['La nappe avec S à 0 : elle monte en 0,4 s puis s’éteint pendant la note', '// monte en 0,4 s, retombe à 0 en 0,3 s\nnote("[c3,eb3,g3]*2").sound("sawtooth").lpf(1500)\n  .adsr(".4:.3:0:1.2")']],
    traps: [
      'Les quatre valeurs vont dans UNE paire de guillemets, séparées par des deux-points, sans espace : un espace créerait deux valeurs successives (deux pas de mini-notation).',
      'L’ordre est fixe : A, D, S, R. La troisième valeur est un niveau : `.5` à cette place donne un sustain de 50 %, pas une durée.',
      'Écris les quatre valeurs. Avec deux seulement (`.adsr(".01:.2")`), sustain et release ne sont pas fixés : comme un decay est écrit, le sustain tombe à 0,001, presque le silence.',
    ],
    see: ['fx.attack', 'fx.decay', 'fx.sustain', 'fx.release', 'sol.enveloppe'],
    legacy: [['son', 'enveloppe ADSR'], ['son', 'enveloppe d’ampli']],
  },
  {
    id: 'fx.clip', t: 'clip', sub: 'durée de la note', kind: 'fx', tokens: ['clip', 'legato'], doc: 'clip',
    ess:
      'Multiplie la durée de chaque note par un nombre. `clip(1)` : la note dure exactement son pas ; `clip(.5)` : la moitié de son pas, puis silence ; `clip(2)` : deux pas, elle déborde sur la suivante. ' +
      'On change ainsi l’articulation, détachée (*staccato*) ou liée (*legato*), sans toucher au rythme : les notes démarrent toujours au même moment.',
    code: `// chaque note s’arrête à la moitié de son pas
note("c3 e3 g3 e3").sound("sawtooth").lpf(1500)
  .clip(.5)`,
    args: [
      [
        'clip',
        'facteur sans unité, appliqué à la durée du pas. Sans réglage : 1. Repères : `.1` à `.3` = piqué · `.5` à `.8` = détaché · `1` = la note remplit son pas · `1.5` à `2` = lié, les notes se chevauchent. ' +
          'Augmenter : le son devient plus continu et plus chargé. Diminuer : plus aéré et plus rythmique.',
      ],
    ],
    time: [
      'La note commence toujours au début de son pas ; seule sa fin bouge. C’est à cette nouvelle fin que démarre le [release](fx.release) de l’enveloppe. ' +
        'Avec `note("c3 e3 g3 e3")` au tempo par défaut de l’app (un cycle = 2 s), chaque pas dure 0,5 s : `clip(.5)` donne des notes de 0,25 s.',
    ],
    why: [
      'Dans Strudel, chaque note est un événement qui a un début et une durée, celle de son pas dans le motif. `clip` ne crée ni ne déplace aucun événement : il multiplie seulement cette durée. Le moteur de son reçoit une note plus courte ou plus longue, et c’est elle qui décide quand l’enveloppe passe au release.',
      'Sur un son enregistré, `clip` a un effet de plus : sans lui, l’échantillon joue en entier, quelle que soit la longueur du pas ; avec lui, il est coupé à la fin de la durée calculée.',
    ],
    recipe: {
      title: 'une basse détachée qui laisse respirer le kick',
      text:
        'Huit notes par cycle, mais chacune ne sonne que pendant 40 % de son pas : il reste un blanc entre deux notes, où le kick s’entend clairement. ' +
        '`clip(.4)` plutôt qu’un decay court : la note garde son volume jusqu’au bout puis s’arrête net, ce qui donne une basse plus « carrée » qu’une basse pincée.',
      code: `setcpm(124/4)
$: sound("bd*4").bank("RolandTR909")
// la basse ne sonne que 40 % de chaque pas
$: note("c2*8").sound("sawtooth").lpf(700)
  .clip(.4)`,
    },
    vary: [
      ['`clip(1.5)` : les notes se chevauchent, la ligne devient presque un bourdon continu', 'setcpm(124/4)\n$: sound("bd*4").bank("RolandTR909")\n$: note("c2*8").sound("sawtooth").lpf(700)\n  .clip(1.5)'],
      ['Sur un échantillon : `clip` coupe le charleston ouvert, un cycle à la fin du pas, le suivant beaucoup plus tôt', '// cycle 1 : coupé à la fin du pas\n// cycle 2 : coupé à 15 % du pas\nsound("oh*4").bank("RolandTR909")\n  .clip("<1 .15>")'],
    ],
    traps: [
      '`clip` ne change pas le rythme : les notes commencent toujours au même endroit. Pour déplacer ou répéter des notes, c’est la mini-notation ou des fonctions comme [fast](fn.fast).',
      'Un `clip` supérieur à 1 superpose des notes : sur des accords ou une nappe, le son s’épaissit vite et peut saturer.',
      'Si le son s’éteint de toute façon avant la fin du pas (sustain à 0 et decay court), `clip` n’a presque pas d’effet audible : c’est le [decay](fx.decay) qui décide.',
      'Ne pas confondre avec le [release](fx.release) : `clip` change le moment où la note se termine ; le release décide de la manière dont elle s’éteint ensuite.',
    ],
    evo: [
      '`legato` est un autre nom du même réglage.',
      'Le réglage [duration](ref.duration) fixe directement la durée de la note en cycles, au lieu de la multiplier.',
    ],
    see: ['fx.release', 'fx.decay', 'sol.enveloppe'],
  },
  {
    id: 'fx.penv', t: 'penv', sub: 'enveloppe de hauteur', kind: 'fx', tokens: ['penv', 'pdecay', 'pdec', 'pattack', 'patt'], doc: 'penv',
    ess:
      'Déplace la hauteur de chaque note pendant ses premiers instants, puis la ramène à la note écrite. ' +
      'Avec `.penv(24).pdecay(.08)`, chaque note démarre 24 [demi-tons](sol.demi-ton) (deux octaves) AU-DESSUS de la note écrite et redescend jusqu’à elle en 0,08 s. ' +
      'Sur une onde [sinusoïdale](son.ondes) grave, cette chute très rapide est ce qu’on entend comme un kick : un impact aigu qui s’effondre en « boum ».',
    code: `setcpm(130/4)
// part 2 octaves plus haut, redescend en 80 ms
note("a1*4").sound("sine")
  .penv(24).pdecay(.08)
  // le volume s’éteint en 0,3 s
  .decay(.3).sustain(0)`,
    args: [
      [
        'penv',
        'ampleur du mouvement, en demi-tons. `12` = une octave (fréquence ×2) · `24` = deux octaves (×4) · `36` = trois octaves (×8). ' +
          'Positif : la note part au-dessus et redescend. Négatif : elle part en dessous et remonte. ' +
          'Repères : `1` à `3` = léger accent · `12` à `24` = tom, kick doux · `24` à `48` = kick électronique marqué · au-delà, un « piou » de laser. ' +
          'Si `penv` n’est pas écrit mais qu’un autre réglage de hauteur l’est (`pdecay`…), il vaut 1.',
      ],
      [
        'pdecay',
        'secondes pour revenir à la note écrite. Repères : `.02` à `.05` = impact sec · `.05` à `.1` = kick percutant · `.2` à `.5` = chute audible, « tom » ou « piou ». ' +
          'Augmenter : on entend la hauteur glisser. Diminuer : on n’entend plus qu’un impact.',
      ],
      [
        'pattack',
        'secondes pour aller de la note écrite à l’écart maximal. Avec `pdecay` seul, ce saut est instantané (0,001 s). ' +
          'Avec `.pattack(.1).pdecay(.1)`, la note part de sa hauteur, monte de `penv` demi-tons en 0,1 s, puis redescend en 0,1 s.',
      ],
      [
        'pcurve',
        'forme du mouvement. `0` (défaut) : linéaire en demi-tons, la hauteur descend à vitesse constante. `1` : exponentielle, elle chute très vite au début puis ralentit en approchant de la note : un kick plus sec. Voir [pcurve](ref.pcurve).',
      ],
      [
        'psustain, prelease, panchor',
        'les autres réglages, comme pour une [enveloppe ADSR](sol.enveloppe) : écart tenu pendant la note (`psustain`), mouvement après la fin de la note (`prelease`), et [panchor](ref.panchor), qui choisit quel point du mouvement tombe sur la note écrite. Rarement utiles pour un kick.',
      ],
    ],
    time: [
      'Avec `pdecay` : dès que la note commence, la hauteur saute à `penv` demi-tons au-dessus (en 0,001 s), revient à la note écrite en `pdecay` secondes, puis y reste jusqu’à la fin.',
      'Avec `penv` SEUL, sans aucun autre réglage de hauteur, c’est différent : le moteur applique une montée de 0,2 s (`pattack` par défaut) et la note part `penv` demi-tons EN DESSOUS pour monter jusqu’à la note écrite. C’est un glissé vers le haut, pas un kick.',
      'Le mouvement de hauteur et le volume sont indépendants : `pdecay` règle la chute de hauteur, `decay` (l’[enveloppe de volume](sol.enveloppe)) celle du volume.',
    ],
    why: [
      'Une hauteur est une fréquence, un nombre de vibrations par seconde (voir [hauteur](sol.hauteur)). Monter de 24 demi-tons multiplie la fréquence par 4 : `a1` (55 Hz) démarre donc à 220 Hz et retombe à 55 Hz en quelques centièmes de seconde.',
      'Ce début aigu est bref, mais l’oreille l’entend comme l’impact du coup. Il est aussi plus facile à reproduire que le grave, que les petits haut-parleurs (téléphone, portable) restituent mal. La suite grave est le corps du kick.',
      'Un tambour réel fait la même chose, en plus discret : frappée fort, la peau est étirée par sa propre vibration, sa tension augmente et elle sonne plus aigu ; à mesure que la vibration s’amortit, la hauteur redescend. Les acousticiens parlent de *modulation de tension* ; on l’entend nettement sur les toms d’une batterie frappés fort. Beaucoup de kicks de synthèse reposent sur ce principe : un oscillateur grave dont la hauteur chute au moment du coup.',
    ],
    recipe: {
      title: 'un kick techno à partir d’une sinusoïde',
      text: [
        'Note `a1` (55 Hz) : selon les guides de mixage, la fondamentale d’un kick se situe entre 40 et 100 Hz, souvent autour de 50 à 60 Hz. `penv(24)` : départ deux octaves plus haut, à 220 Hz, assez pour un impact net sans devenir un « piou ». ' +
          '`pdecay(.06)` : retour en 60 ms, trop vite pour qu’on entende un glissé, assez lent pour entendre un impact plutôt qu’un clic. `pcurve(1)` : l’essentiel de la chute se fait dans les premières millisecondes, l’attaque est plus sèche.',
        '`decay(.35).sustain(0)` : le volume s’éteint en 0,35 s, avant le coup suivant (à 130 BPM, un temps dure 0,46 s), pour que les kicks ne se chevauchent pas. `distort(1)` ajoute des harmoniques, qui rendent le kick audible même sur un petit haut-parleur.',
      ],
      code: `setcpm(130/4)
note("a1*4").sound("sine")
  // départ 24 demi-tons plus haut (220 Hz)
  .penv(24)
  // retour à 55 Hz en 60 ms, chute exponentielle
  .pdecay(.06).pcurve(1)
  // le volume s’éteint avant le coup suivant
  .decay(.35).sustain(0)
  // du grain pour les petits haut-parleurs
  .distort(1).gain(.8)`,
    },
    vary: [
      ['`pdecay(.25)` : la chute devient audible, on entend un tom électronique qui glisse', 'setcpm(130/4)\nnote("a1*4").sound("sine")\n  // chute en 0,25 s : on entend le glissé\n  .penv(24).pdecay(.25)\n  .decay(.35).sustain(0)'],
      ['`penv(48)` : départ quatre octaves plus haut (880 Hz), l’impact devient un « piou »', 'setcpm(130/4)\nnote("a1*4").sound("sine")\n  .penv(48).pdecay(.08)\n  .decay(.35).sustain(0)'],
      ['`penv` seul, sans `pdecay` : la note part deux octaves EN DESSOUS et monte en 0,2 s', '// a3 = 220 Hz : chaque note part de 55 Hz\n// et monte jusqu’à 220 Hz en 0,2 s\nnote("a3*2").sound("sine").penv(24)'],
      ['Le kick de synthèse tout fait de Strudel, `sbd`, applique le même principe : une onde triangulaire dont la hauteur chute de 36 demi-tons, plus un bref souffle pour l’impact', 'setcpm(130/4)\nsound("sbd*4")'],
    ],
    traps: [
      '`penv` seul ne fait pas un kick : sans `pdecay` (ou un autre réglage de hauteur), la note part EN DESSOUS et monte en 0,2 s. Pour un kick, écris toujours `pdecay`.',
      'Hauteur et volume sont deux enveloppes distinctes. Sans `decay(…).sustain(0)`, l’onde tient à 60 % de son volume jusqu’à la fin du pas (le réglage par défaut) : on obtient un « boum » suivi d’un bourdon grave.',
      'Sur une onde riche (`sawtooth`, `square`), le même réglage donne un synthé qui « tombe », pas un kick : le kick a besoin d’une onde presque pure, `sine` ou `triangle`.',
      'Ne pas confondre avec [lpenv](fx.lpenv), qui fait bouger la coupure du filtre (le timbre) et non la hauteur, ni avec [vib](fx.vib), qui fait osciller la hauteur en continu.',
      'Sur un téléphone, `a1` (55 Hz) est à peine audible : tu entends surtout l’impact. Au casque, le corps du kick apparaît.',
    ],
    evo: ['Raccourcis : `pdec` pour `pdecay`, `patt` pour `pattack`, `psus` pour `psustain`, `prel` pour `prelease`.'],
    see: ['genre.kick-techno', 'fx.lpenv', 'fx.decay', 'son.ondes', 'sol.demi-ton'],
    legacy: [['son', 'enveloppe de hauteur (penv)']],
  },

  /* ------------------------------ espace ------------------------------ */
  {
    id: 'fx.room', t: 'room', sub: 'réverbération', kind: 'fx', tokens: ['room'], doc: 'room',
    schema: { type: 'effet', effet: 'reverb', reglages: { room: 0.5, size: 2 } },
    ess:
      'Ajoute autour du son la réverbération d’une pièce : la multitude de réflexions sur les murs, qui prolonge chaque note par une traîne. ' +
      '`.room(.5)` envoie le son dans la réverbération avec un niveau de 0,5 ; le son direct, lui, reste intact. De 0 (sec, collé au haut-parleur) à 1 (lointain, baigné).',
    code: `// traîne de réverbération au niveau 0,6
note("c4 ~ eb4 ~").sound("triangle").room(.6)`,
    args: [
      [
        'room',
        'niveau d’envoi vers la réverbération, de 0 à 1. Le son direct n’est pas baissé : `room` AJOUTE la traîne. Repères : `.1` à `.2` = un peu d’air · `.3` à `.5` = salle nette · `.7` à `1` = son lointain, baigné. ' +
          'Monter : le son recule et s’étale. Descendre : il se rapproche et se resserre.',
      ],
      ['size', 'durée de la traîne, en secondes (voir [size](fx.size)). Défaut : 2.'],
      ['roomlp, roomdim', 'coupure de la traîne au début (défaut 15 000 Hz) et à la fin (défaut 1 000 Hz) : la traîne s’assombrit en s’éteignant. Baisser `roomlp` donne une réverbération plus feutrée.'],
      ['roomfade', 'durée de la montée de la traîne au début, en secondes. Défaut : 0,1.'],
    ],
    time: ['La traîne démarre avec le son (après une montée de 0,1 s), puis décroît jusqu’à devenir inaudible en environ `size` secondes. Elle continue après la fin de la note : avec une note de 0,25 s et `size(4)`, la réverbération s’entend encore 4 s plus tard.'],
    why: [
      'Dans une pièce réelle, le son arrive à l’oreille directement, puis après avoir rebondi sur les murs, le sol, le plafond : des milliers de réflexions, de plus en plus nombreuses et faibles. L’oreille ne les distingue pas une à une ; elle entend une traîne continue, qui renseigne sur la taille de la pièce et sur la distance de la source.',
      'Strudel fabrique cette traîne par *convolution* : il crée une « réponse » de pièce artificielle, du bruit qui décroît en `size` secondes et s’assombrit (l’air et les murs absorbent mieux les aigus), et l’applique à chaque instant du son.',
      'Plus la traîne est forte par rapport au son direct, plus la source paraît lointaine : c’est ce rapport que règle `room`.',
    ],
    recipe: {
      title: 'un clap dans une salle, un kick sec',
      text:
        'La règle de mixage la plus courante : peu ou pas de réverbération sur le grave (elle le rend flou), davantage sur les sons médiums et aigus. Le kick n’a pas de `room` : il reste sec. ' +
        'Le clap a `room(.6)` et `size(3)` : une traîne de 3 s qui donne de la profondeur au groove. Le niveau d’envoi est propre à chaque son : les deux pistes peuvent rester sur la même orbit.',
      code: `setcpm(124/4)
// kick sec
$: sound("bd*4").bank("RolandTR909")
// clap réverbéré, traîne de 3 s
$: sound("[~ cp]*2").bank("RolandTR909")
  .room(.6).size(3)`,
    },
    vary: [
      ['`room(.9).size(6)` : la même salle devient une cathédrale', 'setcpm(124/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[~ cp]*2").bank("RolandTR909")\n  .room(.9).size(6)'],
      ['Deux tailles de pièce différentes : il faut deux orbits', 'setcpm(124/4)\n// petite pièce pour le clap (orbit 1)\n$: sound("[~ cp]*2").bank("RolandTR909")\n  .room(.5).size(1)\n// grande salle pour la mélodie (orbit 2)\n$: note("<c5 eb5>").sound("triangle")\n  .room(.6).size(6).orbit(2)'],
    ],
    traps: [
      'Sur une basse ou un kick, la réverbération brouille le grave : réserve-la aux sons médiums et aigus.',
      'Le niveau `room` est propre à chaque son, mais la pièce elle-même (`size`, `roomlp`…) est partagée par toutes les pistes d’une même [orbit](fx.orbit) : la dernière valeur jouée l’emporte. Pour deux pièces différentes, deux orbits.',
      'La documentation officielle propose aussi la forme `room(".6:4")` (quantité et taille ensemble) ; dans la version de Strudel de cette app, la taille n’est alors pas appliquée. Écris `.size(4)` à part.',
      'Ne pas confondre avec l’[écho](fx.delay), qui répète distinctement le son, ni avec le [release](fx.release), qui prolonge la note elle-même.',
    ],
    see: ['fx.size', 'fx.delay', 'fx.orbit', 'fx.release'],
    legacy: [['effets', 'réverb']],
  },
  {
    id: 'fx.size', t: 'size', sub: 'taille de la pièce', kind: 'fx', tokens: ['size', 'roomsize', 'sz', 'rsize'], doc: 'roomsize',
    schema: { type: 'effet', effet: 'reverb', reglages: { room: 0.6, size: 1 } },
    ess:
      'La durée de la traîne de [réverbération](fx.room), en secondes : le temps qu’elle met pour devenir mille fois plus faible (−60 dB), ce que les acousticiens appellent le *temps de réverbération*. ' +
      'Petite valeur = petite pièce ou pièce meublée ; grande valeur = grande salle, église.',
    code: `// traîne de 4 s : une grande salle
sound("~ cp ~ cp").room(.6).size(4)`,
    args: [
      [
        'size',
        'secondes. Défaut : 2. Ordres de grandeur réels : pièce d’habitation meublée, moins d’une seconde · salle de concert, 1,5 à 2,5 s · cathédrale, souvent plus de 5 s. ' +
          'Monter : la traîne s’allonge et les notes se fondent les unes dans les autres. Descendre : elle se resserre autour du son.',
      ],
    ],
    time: ['La traîne décroît régulièrement depuis le début du son : au bout de `size` secondes, elle a perdu 60 dB et n’est plus audible. Le moteur la fabrique une fois et demie plus longue, pour que la fin ne soit pas coupée net.'],
    why: [
      'Dans une grande pièce, le son parcourt plus de chemin entre deux rebonds et perd moins d’énergie par seconde : la traîne dure plus longtemps. Des murs durs (pierre, verre) réfléchissent davantage que des surfaces molles (rideaux, tapis) : à taille égale, une église résonne bien plus qu’un salon.',
      'Changer `size` oblige le moteur à refabriquer la traîne : c’est un réglage à poser, pas à faire bouger en continu.',
    ],
    vary: [
      ['`size(.5)` : une petite pièce', 'sound("~ cp ~ cp").room(.6).size(.5)'],
      ['`size(8)` : une cathédrale', 'sound("~ cp ~ cp").room(.6).size(8)'],
    ],
    traps: [
      '`size` seul ne fait rien : sans `room`, le son n’est pas envoyé dans la réverbération.',
      'La taille est partagée par toute l’[orbit](fx.orbit) : deux pistes de la même orbit avec deux `size` différents se disputent la même pièce.',
      'Sous la forme `room(".6:4")`, la taille n’est pas appliquée dans la version de Strudel de cette app : écris `.size(4)` à part.',
    ],
    evo: ['Autres noms : `roomsize`, `sz`, `rsize`.'],
    see: ['fx.room', 'fx.orbit'],
  },
  {
    id: 'fx.delay', t: 'delay', sub: 'écho', kind: 'fx', tokens: ['delay'], doc: 'delay',
    schema: { type: 'effet', effet: 'echo', reglages: { delay: 0.5, delaytime: 0.25, delayfeedback: 0.5 } },
    ess:
      'Un écho : le son est répété, après un intervalle fixe, de plus en plus faiblement. `.delay(.5)` règle le niveau de la première répétition (la moitié du son d’origine). ' +
      'L’intervalle et le nombre de répétitions se règlent avec [delaytime](fx.delaytime) et [delayfeedback](fx.delayfeedback).',
    code: `// écho au niveau 0,5, intervalle par défaut
note("c4 ~ ~ ~ eb4 ~ ~ ~").sound("triangle")
  .delay(.5)`,
    args: [
      ['delay', 'niveau de l’écho, de 0 (aucun) à 1 (première répétition aussi forte que l’original). Repères : `.2` à `.3` = discret, donne de l’espace · `.5` = écho net · `.7` et plus = l’écho rivalise avec le son. Le son direct n’est pas baissé.'],
      ['forme courte', '`.delay(".5:.25:.6")` = niveau, temps en secondes, retour, en une fois.'],
    ],
    time: [
      'Sans autre réglage : la première répétition arrive 3/16 de cycle après le son (0,375 s au tempo par défaut de l’app), puis une répétition tous les 3/16 de cycle, chacune moitié moins forte que la précédente (`delayfeedback` vaut 0,5 par défaut). Au bout de 10 répétitions, l’écho a perdu 60 dB.',
      'L’écho continue après la fin de la note, jusqu’à s’éteindre.',
    ],
    why: [
      'Un écho réel, c’est le son qui revient après s’être réfléchi sur une paroi éloignée (une falaise, un mur à plus d’une quinzaine de mètres) : assez tard pour être entendu comme une répétition distincte, et non fondu dans une réverbération.',
      'Le moteur imite cela avec une ligne à retard qui boucle sur elle-même : le son ressort après `delaytime` secondes, et une fraction (`delayfeedback`) est renvoyée à l’entrée pour ressortir à nouveau.',
      'Calé sur le tempo, l’écho remplit les silences du rythme : c’est pourquoi on le règle souvent en fractions de cycle plutôt qu’en secondes.',
    ],
    recipe: {
      title: 'un lead qui remplit les silences',
      text:
        'Une note par temps, entrecoupée de silences. `delay(.45)` : écho net mais en retrait. `delaysync(3/16)` : 3/16 de cycle, soit une croche pointée dans une mesure à 4 temps ; l’écho tombe à contretemps, dans les trous du rythme. ' +
        '`delayfeedback(.4)` : chaque répétition garde 40 % de la précédente, l’écho s’efface en quelques répétitions et ne brouille pas la mélodie.',
      code: `setcpm(120/4)
$: sound("bd*4").bank("RolandTR909")
$: n("0 ~ 4 ~ 3 ~ 2 ~").scale("C4:minor")
  .sound("triangle")
  // écho en retrait, à la croche pointée
  .delay(.45).delaysync(3/16)
  // chaque répétition à 40 % de la précédente
  .delayfeedback(.4)`,
    },
    vary: [
      ['`delaysync(1/4)` : l’écho tombe sur le temps suivant ; il double la mélodie au lieu de la compléter', 'setcpm(120/4)\n$: sound("bd*4").bank("RolandTR909")\n$: n("0 ~ 4 ~ 3 ~ 2 ~").scale("C4:minor")\n  .sound("triangle")\n  .delay(.45).delaysync(1/4).delayfeedback(.4)'],
      ['`delayfeedback(.85)` : l’écho s’accumule et finit par brouiller la mélodie', 'setcpm(120/4)\n$: sound("bd*4").bank("RolandTR909")\n$: n("0 ~ 4 ~ 3 ~ 2 ~").scale("C4:minor")\n  .sound("triangle")\n  .delay(.45).delaysync(3/16).delayfeedback(.85)'],
    ],
    traps: [
      'Comme la réverbération, l’écho est partagé par les pistes d’une même [orbit](fx.orbit) : le niveau `delay` est propre à chaque son, mais l’intervalle et le retour sont ceux de la dernière note jouée sur cette orbit.',
      'Sur une basse ou un kick, l’écho brouille le grave et le rythme : réserve-le aux sons médiums et aigus.',
      'Ne pas confondre avec [echo](fn.echo), qui écrit de nouvelles notes dans le motif ; `delay` est un traitement du son.',
      'Ne pas confondre avec la [réverbération](fx.room) : l’écho répète distinctement ; la réverbération forme une traîne continue.',
    ],
    see: ['fx.delaytime', 'fx.delayfeedback', 'fx.orbit', 'fn.echo', 'fx.room'],
    legacy: [['effets', 'delay / écho']],
  },
  {
    id: 'fx.delaytime', t: 'delaytime', sub: 'temps entre les échos', kind: 'fx', tokens: ['delaytime', 'delayt', 'dt', 'delaysync'],
    schema: { type: 'effet', effet: 'echo', reglages: { delay: 0.6, delaytime: 0.375, delayfeedback: 0.4 }, missions: [] },
    ess:
      'L’intervalle, en secondes, entre le son et la première répétition de l’[écho](fx.delay), puis entre deux répétitions. Pour un écho calé sur le tempo, on utilise plutôt `delaysync`, qui compte en fractions de cycle.',
    code: `// une répétition toutes les 0,25 s
note("c4 ~ ~ ~").sound("triangle")
  .delay(.6).delaytime(.25)`,
    args: [
      [
        'delaytime',
        'secondes, 1 au maximum (au-delà, le moteur ramène la valeur à 1 s). Repères : `.02` à `.05` = l’écho se fond dans le son, effet de doublage métallique · `.07` à `.15` = écho court, le *slapback* du rockabilly · `.25` à `.5` = écho rythmique · `.75` à `1` = écho lointain.',
      ],
      ['delaysync', 'le même intervalle, en fractions de cycle : `1/4` = un temps (dans une mesure à 4 temps), `1/8` = une croche, `3/16` = une croche pointée (la valeur par défaut). Il suit le tempo automatiquement. Si `delaytime` est écrit, c’est lui qui l’emporte.'],
    ],
    time: ['L’intervalle est le même pour toutes les répétitions. Il est fixé pour toute l’[orbit](fx.orbit) au moment où chaque note est jouée : si deux pistes de la même orbit ont des intervalles différents, l’écho change d’intervalle à chaque note.'],
    why: [
      'Sous un certain délai, l’oreille ne distingue plus deux sons séparés : l’écho fusionne avec le son et modifie son timbre. Ce seuil dépend du son : quelques millisecondes pour un clic, environ 50 ms pour la parole, jusqu’à 100 ms environ pour de la musique.',
      'Pour qu’un écho « groove », son intervalle doit être une fraction de la mesure. À 120 BPM, un temps dure 0,5 s, une croche 0,25 s, une croche pointée 0,375 s. `delaysync` fait ce calcul et le refait si le tempo change.',
    ],
    recipe: {
      title: 'un écho en croches pointées, à n’importe quel tempo',
      text: 'À 128 BPM, une croche pointée dure 0,352 s. Plutôt que de calculer, `delaysync(3/16)` demande 3/16 de cycle : le moteur convertit lui-même, et l’écho reste en place si tu changes `setcpm`.',
      code: `setcpm(128/4)
$: sound("bd*4").bank("RolandTR909")
$: note("c5 ~ ~ ~ g4 ~ ~ ~").sound("triangle")
  // 3/16 de cycle : une croche pointée
  .delay(.5).delaysync(3/16).delayfeedback(.45)`,
    },
    vary: [['`delaytime(.03)` : l’écho se fond dans la note et donne un son doublé, métallique', 'note("c4 ~ ~ ~").sound("triangle")\n  // 30 ms : trop court pour un écho distinct\n  .delay(.6).delaytime(.03).delayfeedback(.6)']],
    traps: [
      'En secondes, l’écho ne suit pas le tempo : si tu changes `setcpm`, il tombe à côté. Avec `delaysync`, il suit.',
      'Au-delà de 1 s, la valeur est ramenée à 1 s : un écho plus lent est impossible avec `delay`.',
      '`delaytime` seul ne fait rien : sans `delay` (le niveau), l’écho est muet.',
    ],
    evo: ['Autres noms : `delayt`, `dt`.'],
    see: ['fx.delay', 'fx.delayfeedback', 'sol.tempo'],
  },
  {
    id: 'fx.delayfeedback', t: 'delayfeedback', sub: 'nombre de répétitions', kind: 'fx', tokens: ['delayfeedback', 'delayfb', 'dfb'], doc: 'delayfeedback',
    schema: { type: 'effet', effet: 'echo', reglages: { delay: 0.6, delaytime: 0.25, delayfeedback: 0.5 } },
    ess:
      'La part de chaque répétition de l’[écho](fx.delay) qui est renvoyée pour produire la suivante. `.delayfeedback(.5)` : chaque répétition est deux fois moins forte que la précédente. Plus la valeur est proche de 1, plus l’écho dure longtemps.',
    code: `// chaque répétition à 70 % de la précédente
note("c4 ~ ~ ~").sound("triangle")
  .delay(.6).delaytime(.25).delayfeedback(.7)`,
    args: [
      [
        'delayfeedback',
        'facteur de 0 à 0,98 (le moteur plafonne là). Défaut : 0,5. Chaque répétition = la précédente × ce facteur. Repères : `.2` = une ou deux répétitions vraiment audibles · `.5` = une dizaine avant −60 dB · `.8` = une trentaine · `.95` = l’écho dure presque indéfiniment et s’accumule.',
      ],
    ],
    time: ['Les répétitions se succèdent toutes les `delaytime` secondes. Le nombre de répétitions avant de perdre 60 dB vaut environ 60 ÷ (−20 × log₁₀ du facteur) : 10 pour 0,5, 31 pour 0,8, plus de 130 pour 0,95.'],
    why: [
      'Le moteur renvoie la sortie de la ligne à retard vers son entrée, multipliée par ce facteur : une boucle. Sous 1, chaque tour est plus faible que le précédent et l’écho finit par s’éteindre. À 1 ou plus, chaque tour serait aussi fort ou plus fort : l’écho ne s’arrêterait jamais et grossirait sans fin. D’où le plafond à 0,98.',
    ],
    vary: [
      ['`.2` : un seul écho net', 'note("c4 ~ ~ ~").sound("triangle")\n  .delay(.6).delaytime(.25).delayfeedback(.2)'],
      ['`.9` : l’écho s’accumule et forme une nappe', 'note("c4 ~ ~ ~").sound("triangle")\n  .delay(.5).delaytime(.25).delayfeedback(.9)'],
    ],
    traps: [
      'À 1 ou plus, la documentation officielle prévient que l’écho grossirait sans fin. Le moteur de cette app plafonne la valeur à 0,98 : l’écho ne s’éteint alors presque plus et brouille tout. À éviter.',
      'Avec un retour élevé, les répétitions de notes successives s’empilent : le son devient brouillon et plus fort. Baisse `delay` en compensation.',
    ],
    evo: ['Autres noms : `delayfb`, `dfb`.'],
    see: ['fx.delay', 'fx.delaytime'],
  },
  {
    id: 'fx.orbit', t: 'orbit', sub: 'groupe d’effets', kind: 'fx', tokens: ['orbit'], doc: 'orbit',
    ess:
      'Un numéro de groupe d’effets. Chaque orbit possède UNE [réverbération](fx.room) et UN [écho](fx.delay), partagés par toutes les pistes qui y jouent. Par défaut, tout est dans l’orbit 1. ' +
      'Changer d’orbit donne à une piste sa propre réverbération et son propre écho, et permet de la faire « pomper » avec [duck](fx.duck).',
    code: `// kick sur l’orbit 1, nappe sur l’orbit 2
$: sound("bd*4")
$: note("[c3,eb3,g3]").sound("sawtooth").lpf(1500)
  .room(.8).size(5).orbit(2)`,
    args: [['orbit', 'un nombre entier, à partir de 1. Défaut : 1. Le numéro n’a pas de sens en soi : c’est une étiquette.']],
    why: [
      'Une réverbération ou un écho coûtent du calcul. Au lieu d’en créer un par note, le moteur en crée un par orbit, et chaque son y envoie la quantité demandée (`room`, `delay`). C’est le principe des *bus d’effets* d’une table de mixage, où plusieurs instruments partagent la même réverbération.',
      'Conséquence : le niveau d’envoi (`room`, `delay`) est propre à chaque son, mais les réglages de l’effet lui-même (`size`, `delaytime`, `delayfeedback`, `roomlp`…) sont ceux de l’orbit ; la dernière note jouée impose les siens.',
      'L’orbit sert aussi de cible au [duck](fx.duck) : c’est le volume de toute l’orbit (sons directs et effets) qui plonge.',
    ],
    recipe: {
      title: 'trois plans sonores',
      text:
        'Orbit 1 : la batterie, sèche et devant. Orbit 2 : le lead, avec un écho calé sur la croche pointée. Orbit 3 : la nappe, dans une grande salle (`size(6)`). ' +
        'Chacun a son propre espace : l’écho du lead ne prend pas les réglages de la nappe, et inversement.',
      code: `setcpm(120/4)
// orbit 1 : batterie sèche
$: sound("bd*4, [~ cp]*2, hh*8")
  .bank("RolandTR909")
// orbit 2 : lead avec écho rythmique
$: n("0 ~ 4 ~ 3 ~ 2 ~").scale("C4:minor")
  .sound("triangle")
  .delay(.4).delaysync(3/16).orbit(2)
// orbit 3 : nappe dans une grande salle
$: note("<[c3,eb3,g3] [ab2,c3,eb3]>")
  .sound("sawtooth").lpf(1200)
  .attack(.4).release(1)
  .room(.8).size(6).orbit(3).gain(.5)`,
    },
    traps: [
      'Deux pistes dans la même orbit partagent la même salle et le même écho : pour des réglages différents, change d’orbit.',
      'Pour faire plonger une piste avec `duck`, mets-la dans une orbit à part : tout ce qui joue dans l’orbit visée plonge, y compris le kick s’il y est.',
      'Changer d’orbit ne change ni le volume ni la place gauche-droite d’une piste.',
    ],
    evo: ['Raccourci : `o`.'],
    see: ['fx.room', 'fx.delay', 'fx.duck'],
    legacy: [['effets', 'orbit']],
  },
  {
    id: 'fx.duck', t: 'duck', sub: 'le pompage (sidechain)', kind: 'fx', tokens: ['duck', 'duckorbit', 'duckattack', 'duckdepth'], doc: 'duckorbit',
    schema: { type: 'effet', effet: 'sidechain', reglages: { duckdepth: 1, duckattack: 0.2 } },
    ess:
      'Posé sur un son déclencheur (en général le kick), fait plonger brièvement le volume de toute une autre [orbit](fx.orbit) à chaque coup, puis le fait remonter. ' +
      'La basse ou la nappe s’écarte pour laisser passer le kick et semble respirer au rythme : c’est le *pompage*, imitation du *sidechain* des studios.',
    code: `setcpm(124/4)
// l’accord joue dans l’orbit 2
$: note("[c3,eb3,g3]").sound("sawtooth")
  .lpf(1500).orbit(2)
// le kick fait plonger l’orbit 2
$: sound("bd*4").bank("RolandTR909")
  .duck(2).duckattack(.2).duckdepth(1)`,
    args: [
      ['duck', 'le numéro de l’orbit à faire plonger ; plusieurs : `duck("2:3")`. Nom complet : `duckorbit`.'],
      ['duckdepth', 'profondeur, de 0 à 1. Défaut : 1. Le volume tombe à 1 − √duckdepth, jamais sous 1 % : `1` = 1 % (−40 dB), presque le silence · `.75` = 13 % · `.5` = 29 % (−11 dB) · `.25` = 50 % (−6 dB).'],
      ['duckattack', 'malgré son nom, le temps de REMONTÉE, en secondes (minimum 0,002). Défaut : 0,1. Repères : `.05` = plongeon sec · `.15` à `.3` = pompage marqué · plus long que l’intervalle entre deux kicks : le volume n’a jamais le temps de remonter.'],
      ['duckonset', 'le temps de DESCENTE, en secondes. Défaut : 0, chute instantanée sur le coup.'],
    ],
    time: [
      'À chaque son déclencheur, le volume de l’orbit visée descend jusqu’au plancher en `duckonset` secondes (instantanément par défaut), puis remonte en `duckattack` secondes, en courbe exponentielle. ' +
        'À 124 BPM, deux kicks sont séparés de 0,48 s : avec `duckattack(.2)`, l’orbit remonte en 0,2 s et reste pleine jusqu’au kick suivant.',
    ],
    why: [
      'En studio, un compresseur en *sidechain* baisse le volume de la basse chaque fois que le kick dépasse un seuil : les deux sons, qui occupent le même grave, ne se masquent plus. Poussé fort, l’effet devient audible et rythmique : c’est le pompage, signature d’une grande partie de la house et de la dance music.',
      'Strudel fait plus simple et plus prévisible : pas de seuil ni de compresseur, une courbe de volume déclenchée à chaque coup. Le déclencheur n’a même pas besoin d’être audible : un kick à `gain(0)` fait quand même pomper l’orbit.',
    ],
    recipe: {
      title: 'une nappe qui pompe',
      text:
        'Le kick, sur l’orbit 1, fait plonger l’orbit 2, où joue la nappe. `duckdepth(.9)` : creux profond (le volume tombe à 5 %). ' +
        '`duckattack(.3)` : remontée en 0,3 s, un peu plus de la moitié de l’intervalle entre deux kicks : on entend nettement la nappe respirer.',
      code: `setcpm(124/4)
$: note("<[c3,eb3,g3] [ab2,c3,eb3]>")
  .sound("supersaw").lpf(2000).gain(.5)
  // la nappe vit dans l’orbit 2
  .orbit(2)
$: sound("bd*4").bank("RolandTR909")
  // fait plonger l’orbit 2 à chaque coup
  .duck(2).duckdepth(.9).duckattack(.3)`,
    },
    vary: [
      ['`duckdepth(.3)` : pompage discret ; le kick ressort sans effet audible', 'setcpm(124/4)\n$: note("<[c3,eb3,g3] [ab2,c3,eb3]>")\n  .sound("supersaw").lpf(2000).gain(.5).orbit(2)\n$: sound("bd*4").bank("RolandTR909")\n  .duck(2).duckdepth(.3).duckattack(.3)'],
      ['Kick muet : la nappe pompe sans qu’on entende de kick', 'setcpm(124/4)\n$: note("<[c3,eb3,g3] [ab2,c3,eb3]>")\n  .sound("supersaw").lpf(2000).gain(.5).orbit(2)\n// déclencheur inaudible\n$: sound("bd*4").gain(0)\n  .duck(2).duckdepth(.9).duckattack(.3)'],
    ],
    traps: [
      '`duck` se place sur le son qui DÉCLENCHE (le kick), pas sur celui qui plonge.',
      'L’orbit visée doit exister au moment du coup : il faut une piste avec `.orbit(2)`, écrite AVANT celle du kick. Écrite après, elle n’existe pas encore au premier coup du premier ▶ : ce coup ne fait rien plonger, et le moteur note « duck target orbit 2 does not exist » dans la console du navigateur.',
      'Tout ce qui joue dans l’orbit visée plonge, réverbération et écho compris. Ne mets pas le kick dans l’orbit qu’il fait plonger.',
      '`duckattack` règle la remontée, pas la descente : la descente, c’est `duckonset`.',
    ],
    evo: ['`duck` est un raccourci de `duckorbit`. `duckatt` = `duckattack`, `duckons` = `duckonset`.'],
    see: ['fx.orbit', 'genre.sidechain', 'fx.gain'],
    legacy: [['effets', 'sidechain / pump']],
  },

  /* ----------------------------- couleur ----------------------------- */
  {
    id: 'fx.gain', t: 'gain', sub: 'volume', kind: 'fx', tokens: ['gain', 'velocity', 'postgain'], doc: 'gain',
    ess:
      'Le volume d’un son, sous forme de multiplicateur de son amplitude : `gain(1)` = tel quel, `gain(.5)` = moitié de l’amplitude, `gain(0)` = muet. Sans réglage, le moteur joue à 0,8.',
    code: `// accents : fort sur les temps
sound("hh*8").gain("1 .4 .6 .4 .8 .4 .6 .4")`,
    args: [
      [
        'gain',
        'multiplicateur d’amplitude, à partir de 0. Défaut : 0,8. En décibels : `.5` ≈ −6 dB · `.25` ≈ −12 dB · `.1` = −20 dB · `2` ≈ +6 dB. ' +
          'Règle empirique courante en acoustique : une baisse d’environ 10 dB s’entend comme « deux fois moins fort » ; il faut donc descendre vers `.3` pour qu’un son paraisse deux fois moins fort qu’à 1.',
      ],
      ['velocity', 'un second multiplicateur, appliqué en plus du gain (défaut 1). Sert à noter l’intensité de chaque note, comme sur un clavier MIDI, séparément du volume de la piste.'],
      ['postgain', 'volume appliqué APRÈS tous les effets de la note (filtre, saturation…), juste avant l’envoi vers la réverbération et l’écho. Défaut : 1.'],
    ],
    time: ['Le gain s’applique à toute la note. Pour un volume qui évolue PENDANT la note, c’est l’[enveloppe](sol.enveloppe) ; pour un volume qui change d’une note à l’autre, un motif (`gain("1 .5")`) ou un [signal](fn.signaux).'],
    why: [
      'Le gain multiplie la forme d’onde : à `.5`, chaque valeur est divisée par deux. Mais l’oreille juge les volumes en proportions (en décibels) : diviser l’amplitude par deux ne retire que 6 dB, une baisse nette mais loin de « moitié moins fort ».',
      'Il est placé en tête de la chaîne d’effets : il change donc aussi la quantité de [saturation](fx.distort), puisqu’un son plus fort sature davantage. Pour changer le volume sans changer la saturation : `postgain`.',
      'Au-delà de 1, la somme de toutes les pistes peut dépasser ce que la sortie audio accepte : les crêtes sont écrêtées et le son grésille.',
    ],
    recipe: {
      title: 'des accents qui font groover un charleston',
      text: 'Un motif de gain répété 4 fois par cycle : fort sur chaque temps (`.9`), faible entre (`.3`), moyen sur le contretemps (`.5`). La variation d’intensité, plus que les notes, donne l’impression d’un musicien.',
      code: `setcpm(124/4)
$: sound("bd*4").bank("RolandTR909")
// fort sur le temps, faible entre
$: sound("hh*16").bank("RolandTR909")
  .gain("[.9 .3 .5 .3]*4")`,
    },
    vary: [['Un volume qui respire au fil des cycles, avec un signal', 'sound("hh*16").bank("RolandTR909")\n  // entre 0,2 et 0,9, sur 4 cycles\n  .gain(sine.range(.2, .9).slow(4))']],
    traps: [
      'Au-dessus de 1, le son sature vite. Pour qu’une piste ressorte, baisse plutôt les autres.',
      'Sur une piste saturée (`distort`), baisser le gain rend aussi le son plus propre. Pour ne changer que le volume, utilise `postgain` ou le volume de sortie de la saturation.',
      'Un son à `gain(0)` est muet, mais il déclenche quand même un [duck](fx.duck).',
    ],
    evo: ['`vel` est un raccourci de `velocity`.'],
    see: ['fx.pan', 'fx.distort', 'sol.enveloppe'],
    legacy: [['effets', 'gain']],
  },
  {
    id: 'fx.pan', t: 'pan', sub: 'gauche ou droite', kind: 'fx', tokens: ['pan'], doc: 'pan',
    ess: 'Place le son dans l’espace stéréo, entre le haut-parleur gauche (0) et le droit (1) ; 0,5 = au centre. Sans réglage, le son est au centre.',
    code: `// gauche, centre, droite, centre
sound("hh*4").pan("0 .5 1 .5")`,
    args: [['pan', 'de 0 (tout à gauche) à 1 (tout à droite). Repères : `.3` ou `.7` = légèrement décalé, la place habituelle des instruments d’accompagnement · `0` ou `1` = complètement d’un côté, effet très marqué au casque.']],
    time: ['La position est fixée au début de chaque note. Un [signal](fn.signaux) la fait changer d’une note à l’autre, pas pendant une note tenue.'],
    why: [
      'Le cerveau situe un son à gauche ou à droite surtout d’après la différence de volume, et de moment d’arrivée, entre les deux oreilles. `pan` ne joue que sur le volume : il envoie plus de son d’un côté que de l’autre.',
      'Le moteur suit une loi « à puissance constante » : au centre, chaque côté reçoit environ 71 % de l’amplitude (−3 dB), pour que le son ne paraisse pas plus faible quand il passe au milieu.',
    ],
    recipe: {
      title: 'un charleston qui se promène',
      text: '`sine` varie de 0 à 1 et revient : le charleston va de gauche à droite puis revient, en deux cycles avec `.slow(2)`. Les 16 coups par cycle lisent le signal assez souvent pour un mouvement continu. Le kick reste au centre.',
      code: `setcpm(124/4)
$: sound("bd*4").bank("RolandTR909")
// de gauche à droite et retour, en 2 cycles
$: sound("hh*16").bank("RolandTR909")
  .pan(sine.slow(2)).gain(.5)`,
    },
    traps: [
      'Garde le kick et la basse au centre : ils portent l’énergie du morceau, et beaucoup de systèmes (enceintes de club, haut-parleur unique) les restituent mal s’ils sont d’un seul côté.',
      'Sur un téléphone à un seul haut-parleur, `pan` ne s’entend pas : il faut un casque ou deux enceintes.',
      'Ne pas confondre avec [jux](fn.jux), qui joue deux versions différentes du motif à gauche et à droite.',
    ],
    see: ['fn.jux', 'fx.gain', 'fn.signaux'],
    legacy: [['effets', 'pan']],
  },
  {
    id: 'fx.distort', t: 'distort', sub: 'saturation', kind: 'fx', tokens: ['distort', 'dist', 'shape'], doc: 'distort',
    schema: { type: 'effet', effet: 'distort', reglages: { distort: 1 } },
    ess:
      'Une saturation : elle écrase les crêtes de la forme d’onde et remonte les passages faibles. Le son devient plus dense, plus fort, et s’enrichit d’harmoniques : il « grogne » ou « mord ». ' +
      'Indispensable pour un kick techno ou une basse acid agressive.',
    code: `// saturation franche sur une basse
note("c2*8").sound("sawtooth").lpf(800)
  .distort(2).gain(.5)`,
    args: [
      ['distort', 'quantité, à partir de 0 (aucun effet). Repères : `.5` à `1` = chaleur, léger grain · `2` à `3` = saturation franche · `5` et plus = son écrasé, presque une onde carrée. Les sons faibles sont amplifiés d’environ e^distort fois : `distort(2)` les remonte d’environ 7 fois (+17 dB).'],
      ['distortvol', 'volume après la saturation, de 0,001 à 1 (défaut 1), pour compenser la hausse de volume. Forme courte : `distort("3:.4")`.'],
      ['distorttype', 'la forme de la courbe : `scurve` (défaut), `soft`, `hard`, `cubic`, `diode`, `asym`, `fold`, `sinefold`, `chebyshev`. `hard` coupe net, plus agressif ; `fold` replie l’onde sur elle-même, son métallique ; `asym` traite différemment le haut et le bas de l’onde.'],
    ],
    time: ['La saturation agit en continu, et dépend du niveau à chaque instant : elle écrase surtout l’attaque, forte, et remonte la fin de la note, faible. Résultat : un son saturé paraît plus long qu’avant.'],
    why: [
      'Le moteur fait passer chaque valeur de l’onde dans une courbe en S : (1+k)·x / (1+k·|x|), avec k = e^distort − 1. Les petites valeurs sont multipliées par environ 1+k ; les grandes plafonnent près de ±1. L’onde s’aplatit en haut et en bas, et se rapproche d’une onde carrée.',
      'Aplatir les crêtes crée des harmoniques qui n’existaient pas : une sinusoïde saturée gagne des harmoniques impaires, comme une onde carrée. C’est pourquoi un kick ou une basse saturés deviennent audibles même sur un petit haut-parleur.',
      'C’est le même principe qu’un ampli de guitare poussé à fond, ou qu’une bande magnétique saturée.',
    ],
    recipe: {
      title: 'un kick techno qui mord',
      text:
        '`distort("1.5:.6")` : quantité 1,5, les crêtes sont écrasées et la fin du kick, faible, est remontée d’environ 4,5 fois ; il paraît plus long et plus dense. ' +
        'La deuxième valeur (`.6`) baisse le volume APRÈS la saturation, pour compenser sans changer la quantité de grain.',
      code: `setcpm(135/4)
sound("bd*4").bank("RolandTR909")
  // grain franc, volume compensé
  .distort("1.5:.6")`,
    },
    vary: [
      ['`distort(4)` : écrasé, agressif', 'setcpm(135/4)\nsound("bd*4").bank("RolandTR909")\n  .distort("4:.4")'],
      ['`distorttype("fold")` sur une sinusoïde : l’onde se replie, son métallique', 'note("c2*8").sound("sine")\n  .distort(3).distorttype("fold").gain(.5)'],
    ],
    traps: [
      'La saturation augmente fortement le volume perçu. Compense avec la deuxième valeur (`distort("3:.4")`) ou `postgain`, plutôt qu’avec `gain`, qui changerait aussi la quantité de saturation (le gain est appliqué avant).',
      'Elle allonge les sons, puisque leur fin, faible, est amplifiée : un kick saturé déborde davantage sur le suivant.',
      'Ne pas confondre avec [crush](fx.crush), qui dégrade la précision du son (grain numérique) au lieu de le saturer.',
    ],
    evo: ['Raccourci : `dist`.', '`shape` est un autre effet de saturation de Strudel, avec sa propre courbe et son propre volume de sortie (`shapevol`).'],
    see: ['fx.crush', 'fx.gain', 'genre.kick-techno', 'sol.timbre'],
    legacy: [['effets', 'distorsion (dist)']],
  },
  {
    id: 'fx.crush', t: 'crush', sub: 'son dégradé', kind: 'fx', tokens: ['crush', 'coarse'], doc: 'crush',
    ess:
      'Réduit la précision avec laquelle chaque valeur du son est codée (la *résolution*, en bits) : l’onde devient un escalier. Le son prend un grain numérique, celui des vieilles consoles et des premiers échantillonneurs. Plus le nombre est petit, plus c’est abîmé.',
    code: `// 4 bits : son granuleux
note("c3 e3 g3 e3").sound("triangle").crush(4)`,
    args: [
      [
        'crush',
        'nombre de bits, à partir de 1. Chaque valeur de l’onde est arrondie au palier le plus proche, avec 2^(bits−1) paliers entre 0 et le maximum. Repères : `16` = intact à l’oreille · `8` = grain audible, console 8 bits · `4` = très dégradé · `1` = l’onde n’a plus que trois valeurs possibles (−1, 0, 1). Entre 3 et 8, l’effet est net sans tout détruire.',
      ],
      ['coarse', 'l’autre dégradation numérique : ne garde qu’un échantillon sur n et le répète. `coarse(8)` divise la fréquence d’échantillonnage par 8 : des fréquences parasites apparaissent, souvent sans rapport avec la note (le *repliement*). Son métallique, « lo-fi ».'],
    ],
    time: ['Agit en continu, sur chaque échantillon. Les passages faibles sont les plus touchés : la fin des notes tombe sur les paliers les plus bas, ou à zéro.'],
    why: [
      'Un son numérique est une suite de nombres, environ 48 000 par seconde. Plus il y a de bits, plus ces nombres sont précis : 16 bits donnent 65 536 niveaux, 8 bits seulement 256. Arrondir à peu de niveaux ajoute une erreur qui s’entend comme un bruit granuleux, d’autant plus présent que le son est faible.',
      'Les vieilles consoles et les premiers échantillonneurs (8 ou 12 bits) avaient ce grain : on le recrée volontairement pour sa couleur.',
    ],
    recipe: {
      title: 'une batterie lo-fi',
      text: 'Tempo lent, boîte à rythmes TR-808. `crush(6)` : 32 paliers par demi-onde, un grain marqué mais le rythme reste lisible. `coarse(4)` : un échantillon sur quatre, les aigus deviennent métalliques. Les deux ensemble imitent un vieil échantillonneur.',
      code: `setcpm(90/4)
sound("bd ~ sd ~, hh*8").bank("RolandTR808")
  // 6 bits : grain marqué
  .crush(6)
  // 1 échantillon sur 4 : aigus métalliques
  .coarse(4)`,
    },
    vary: [['`crush(2)` : il ne reste presque que le rythme', 'setcpm(90/4)\nsound("bd ~ sd ~, hh*8").bank("RolandTR808")\n  .crush(2)']],
    traps: [
      'Les sons faibles tombent sur les paliers les plus bas, ou à zéro : la fin des notes est hachée ou coupée.',
      'Dans Strudel, le filtre est appliqué AVANT le crush : un `lpf` sur la même piste n’adoucit pas le grain ajouté.',
      'Ne pas confondre avec [distort](fx.distort) : la saturation écrase les crêtes (son plus dense) ; le crush arrondit toutes les valeurs (son granuleux).',
    ],
    see: ['fx.distort', 'son.batterie'],
    legacy: [['effets', 'crush (bitcrush)']],
  },
  {
    id: 'fx.speed', t: 'speed', sub: 'vitesse de lecture', kind: 'fx', tokens: ['speed'], doc: 'speed',
    ess:
      'Change la vitesse de lecture d’un son enregistré, comme sur une bande ou un disque : `speed(2)` le lit deux fois plus vite, donc une octave plus aigu et deux fois plus court ; `speed(.5)`, une octave plus grave et deux fois plus long. Négatif : il est lu à l’envers.',
    code: `// normal, deux fois plus vite, à l’envers
sound("bd*4").speed("<1 2 -1>")`,
    args: [
      ['speed', 'multiplicateur de vitesse. Défaut : 1. `2` = une octave plus haut · `1.5` ≈ une quinte plus haut (7 demi-tons) · `.5` = une octave plus bas · `-1` = à l’envers, à vitesse normale · `0` = pas de son. Pour monter de n demi-tons : 2^(n/12), soit environ ×1,0595 par demi-ton.'],
      ['unit', '`unit("c")` change l’unité : la vitesse est alors comptée par rapport au cycle. C’est ce que fait `loopAt` (voir [chop](fx.chop)).'],
    ],
    time: ['La vitesse est fixée pour toute la note. Comme le son est lu plus vite ou plus lentement, sa durée change aussi : un échantillon de 1 s dure 0,5 s à `speed(2)`.'],
    why: [
      'Un son enregistré est une suite de valeurs, à lire à une cadence donnée. Les lire deux fois plus vite multiplie toutes les fréquences par deux (une octave plus haut) ET divise la durée par deux : hauteur et durée sont liées, comme sur un tourne-disque qu’on accélère.',
      'Le timbre change aussi : les résonances naturelles de l’instrument (ses *formants*) montent avec le reste. D’où l’effet « voix de dessin animé » quand on accélère une voix.',
    ],
    recipe: {
      title: 'des variations de kick sans autre échantillon',
      text: 'Un seul échantillon de kick, joué à des vitesses différentes : `1.5` le rend plus aigu et plus court, `.8` plus grave et plus long, `2` en fait presque un tom. On obtient une petite mélodie de percussions.',
      code: `setcpm(124/4)
sound("bd*8").bank("RolandTR909")
  // une vitesse par coup
  .speed("1 1 1.5 1 .8 1 2 1")`,
    },
    vary: [['À l’envers, de temps en temps', 'sound("hh*8").bank("RolandTR909")\n  // un coup sur deux en moyenne, à l’envers\n  .sometimes(x => x.speed(-1))']],
    traps: [
      '`speed` ne concerne que les sons enregistrés. Sur un synthétiseur (`sawtooth`…), il n’a aucun effet : change la note.',
      'Hauteur et durée changent ensemble : un échantillon accéléré est plus court ; ralenti, plus long et plus grave.',
      'Avec `note(…)` sur un échantillon, les deux se multiplient : la note transpose (`c2` = hauteur d’origine) et `speed` s’y ajoute.',
    ],
    see: ['fn.note', 'fx.chop', 'son.batterie', 'fn.sometimes'],
  },
  {
    id: 'fx.fm', t: 'fm', sub: 'modulation de fréquence', kind: 'fx', tokens: ['fm', 'fmi', 'fmh'], doc: 'fmi',
    ess:
      'La modulation de fréquence : une deuxième onde, le *modulateur*, fait varier très vite la fréquence de l’onde qu’on entend, la *porteuse*. ' +
      'Quand cette variation est aussi rapide que le son lui-même, on n’entend plus une ondulation mais un nouveau timbre, riche en harmoniques : cloches, métal, basses qui grognent, pianos électriques.',
    code: `// indice 4, modulateur à la fréquence de la note
note("c3 e3 g3 e3").sound("sine").fm(4)`,
    args: [
      ['fm', 'l’*indice de modulation* (nom complet `fmi`) : de combien la fréquence de la porteuse s’écarte, en multiples de la fréquence du modulateur. 0 = aucun effet. Repères : `.5` à `1` = légère brillance · `2` à `4` = son riche, piano électrique, basse qui grogne · `8` et plus = son dur, métallique, proche du bruit.'],
      ['fmh', 'l’*harmonicité* : fréquence du modulateur ÷ fréquence de la note. Défaut : 1. Entiers (1, 2, 3…) : les fréquences créées sont des harmoniques de la note, le son garde une hauteur nette. Non entiers (1.4, 3.5…) : des fréquences sans rapport simple apparaissent, son de cloche ou métallique, hauteur floue.'],
      ['fmattack, fmdecay, fmsustain, fmrelease', 'une [enveloppe](sol.enveloppe) appliquée à la modulation : le timbre peut être brillant à l’attaque puis s’adoucir, comme une cloche ou un piano électrique.'],
      ['fmwave', 'la forme du modulateur : `sine` par défaut, ou `triangle`, `square`, `sawtooth`.'],
    ],
    time: ['Sans enveloppe de modulation, le timbre reste le même pendant toute la note. Avec `fmdecay` et un `fmsustain` bas, la modulation, donc la brillance, s’éteint pendant la note : c’est ce qui fait sonner une cloche ou un piano électrique.'],
    why: [
      'La fréquence de la porteuse oscille autour de la note, d’un écart égal à `fm` × la fréquence du modulateur, à la vitesse du modulateur. Une oscillation lente s’entendrait comme un [vibrato](fx.vib). À la vitesse d’une note (des centaines de fois par seconde), elle produit des fréquences nouvelles, les *bandes latérales*, situées à la note ± 1, 2, 3… fois la fréquence du modulateur.',
      'Plus l’indice est grand, plus il y a de bandes latérales fortes : le son s’enrichit. Si le modulateur est un multiple entier de la note, ces bandes tombent sur des harmoniques de la note ; sinon, elles tombent entre, d’où le son de cloche.',
      'C’est la technique du Yamaha DX7 (1983), le synthétiseur des pianos électriques et des basses des années 1980.',
    ],
    recipe: {
      title: 'un piano électrique',
      text:
        '`sound("sine")` : la porteuse est pure, toute la couleur viendra de la FM. `fmh(1)` : modulateur à la fréquence de la note, le son reste juste. `fm(3)` : riche au moment de la frappe. ' +
        '`fmdecay(.5).fmsustain(.1)` : la modulation retombe à 10 % en 0,5 s, le son s’adoucit comme celui d’un piano électrique. `decay(1.2).sustain(.2)` : le volume s’affaisse lentement.',
      code: `chord("<Cm7 Fm7 Bb7 Eb^7>").voicing()
  .sound("sine")
  // modulateur à la note, indice 3
  .fm(3).fmh(1)
  // la brillance s’éteint en 0,5 s
  .fmdecay(.5).fmsustain(.1)
  .decay(1.2).sustain(.2).gain(.6)`,
    },
    vary: [
      ['`fmh(3.5)` : harmonicité non entière, son de cloche', 'note("c4 g4").sound("sine")\n  .fm(4).fmh(3.5)\n  .decay(1.5).sustain(0)'],
      ['Une basse FM qui grogne de plus en plus : indice 1, puis 4, puis 8', 'note("c2*8").sound("sine")\n  .fm("<1 4 8>").fmh(1)\n  .decay(.2).sustain(.3)'],
    ],
    traps: [
      'Sur une onde riche (`sawtooth`), la FM ajoute des fréquences à un son déjà plein : on obtient vite du bruit. On part presque toujours d’une `sine`.',
      'Un indice élevé avec un `fmh` non entier peut créer des fréquences très graves ou inaudibles qui brouillent le son : monte progressivement.',
      'Ne pas confondre avec le [vibrato](fx.vib) : même principe, mais avec un modulateur lent (quelques hertz) ; on entend une ondulation, pas un timbre.',
    ],
    evo: ['Le nom complet du réglage est `fmi` (*FM index*) ; `fm` en est le raccourci.', 'Strudel permet jusqu’à 8 modulateurs (`fm2`, `fmh2`…), qu’on peut brancher les uns sur les autres.'],
    see: ['son.ondes', 'fx.vib', 'sol.timbre'],
  },
  {
    id: 'fx.vib', t: 'vib', sub: 'vibrato', kind: 'fx', tokens: ['vib', 'vibrato', 'vibmod'], doc: 'vib',
    ess:
      'Fait osciller la hauteur de la note autour de sa valeur, en continu, comme la voix d’un chanteur ou le doigt d’un violoniste qui oscille sur la corde. ' +
      '`.vib(5)` : 5 allers-retours par seconde. `.vibmod(.3)` : la hauteur monte et descend de 0,3 [demi-ton](sol.demi-ton) de part et d’autre de la note.',
    code: `// 5 oscillations par seconde, ± 0,3 demi-ton
note("c4 eb4 g4").sound("triangle")
  .vib(5).vibmod(.3)`,
    args: [
      [
        'vib',
        'vitesse de l’oscillation, en hertz (allers-retours par seconde). Sans `vib` (ou à 0), pas de vibrato. ' +
          'Repères : `5` à `7` = vibrato naturel de chanteur ou de violon · sous `4` = ondulation lente, « mal de mer » · au-dessus de `8` = chevrotement nerveux. ' +
          'À partir de quelques dizaines de hertz, on n’entend plus une oscillation mais un changement de timbre (c’est le principe de la [modulation de fréquence](fx.fm)).',
      ],
      [
        'vibmod',
        'profondeur, en demi-tons, de chaque côté de la note : `.3` = de 0,3 demi-ton en dessous à 0,3 au-dessus. Défaut : `.5`. ' +
          'Repères : `.2` à `.35` = vibrato d’instrument à cordes · `.5` à `1` = vibrato de chanteur lyrique · au-delà de `1`, la hauteur devient instable, « sirène ».',
      ],
    ],
    time: [
      'Le vibrato démarre avec la note, à pleine profondeur, et dure jusqu’à la fin du son (release compris). Il n’y a pas de montée progressive, contrairement à un violoniste qui commence souvent la note droite avant de la faire vibrer.',
      'Chaque note relance son propre vibrato : l’oscillation repart du même point à chaque nouvelle note.',
    ],
    why: [
      'Le moteur branche un oscillateur sinusoïdal lent (un *LFO*, *low frequency oscillator*) sur l’accord fin de la note : il ajoute puis retire jusqu’à `vibmod` demi-tons, `vib` fois par seconde. L’oreille entend une seule note qui ondule, parce que l’écart reste petit et lent.',
      'Le vibrato donne de la vie à un son tenu : une onde parfaitement stable paraît mécanique, alors que les voix et les instruments joués à la main fluctuent toujours un peu.',
    ],
    recipe: {
      title: 'une mélodie expressive',
      text:
        '`vib(5.5)` : une vitesse proche de celle d’un chanteur. `vibmod(.25)` : un quart de demi-ton de chaque côté, l’ampleur d’un vibrato de violon : assez pour être entendu sans sonner faux. ' +
        'Notes longues (deux par cycle, 1 s chacune) : le vibrato a besoin de temps pour s’entendre. `attack(.08)` : la note n’arrive pas trop sèchement.',
      code: `n("<[0 4] [3 2]>").scale("C4:minor")
  .sound("triangle")
  // 5,5 oscillations par seconde, ± 0,25 demi-ton
  .vib(5.5).vibmod(.25)
  .attack(.08).release(.4)`,
    },
    vary: [
      ['`vib(2).vibmod(1)` : lent et profond, la note tangue', 'n("<[0 4] [3 2]>").scale("C4:minor")\n  .sound("triangle")\n  .vib(2).vibmod(1)\n  .attack(.08).release(.4)'],
      ['`vib(12)` : rapide, la note tremble', 'n("<[0 4] [3 2]>").scale("C4:minor")\n  .sound("triangle")\n  .vib(12).vibmod(.25)\n  .attack(.08).release(.4)'],
    ],
    traps: [
      'Ne pas confondre avec le trémolo, qui fait osciller le VOLUME et non la hauteur (voir [tremolo](ref.tremolo)).',
      'Ne pas confondre avec [penv](fx.penv), qui fait un seul mouvement de hauteur au début de la note, ni avec le [phaser](fx.phaser), qui fait bouger le timbre.',
      'Sur des notes courtes (0,2 s ou moins), un vibrato de 5 Hz n’a pas le temps de faire un aller-retour complet : on ne l’entend pas.',
      'Un `vibmod` au-delà de 1 fait osciller la note de plus d’un demi-ton de chaque côté : elle sonne faux. C’est parfois voulu, rarement sur une mélodie.',
    ],
    evo: [
      'Autres noms : `vibrato` et `v` pour `vib` ; `vmod` pour `vibmod`.',
      'Forme courte : `vib("5:.3")` règle vitesse et profondeur d’un coup.',
    ],
    see: ['fx.penv', 'fx.phaser', 'fx.fm', 'sol.demi-ton'],
    legacy: [['effets', 'vibrato (vib)']],
  },
  {
    id: 'fx.phaser', t: 'phaser', sub: 'balayage', kind: 'fx', tokens: ['phaser', 'ph', 'phaserdepth'], doc: 'phaser',
    ess:
      'Un balayage : une bande de fréquences est creusée dans le son (fortement atténuée), et ce creux monte et descend en continu. Le son semble tourner sur lui-même. `.phaser(2)` : deux allers-retours par seconde.',
    code: `// le creux balaie 2 fois par seconde
note("[c3,eb3,g3]").sound("sawtooth").lpf(3000)
  .phaser(2)`,
    args: [
      ['phaser', 'vitesse du balayage, en hertz (allers-retours par seconde). Repères : `.2` à `.5` = lent, planant · `1` à `2` = tournoiement net · `4` et plus = tremblement rapide. Nom complet : `phaserrate`.'],
      ['phaserdepth', 'largeur du creux, de 0 à 1. Défaut : 0,75. Petite valeur : creux étroit, effet discret. Proche de 1 : creux très large, effet marqué. À 0 : pas d’effet.'],
      ['phasercenter', 'fréquence autour de laquelle le creux balaie, en hertz. Défaut : 1 000 (le creux est en fait centré environ 280 Hz plus haut).'],
      ['phasersweep', 'amplitude du balayage, en cents (centièmes de demi-ton) de part et d’autre du centre. Défaut : 2 000, soit ±20 demi-tons : à peu près de 400 à 4 000 Hz.'],
    ],
    time: ['Le balayage démarre avec chaque note et suit un mouvement en triangle : montée régulière, puis descente régulière.'],
    why: [
      'Un phaser de studio mélange le son avec une copie déphasée : aux fréquences où les deux s’opposent, ils s’annulent et creusent le spectre. Faire varier ce déphasage déplace les creux, et l’oreille entend un mouvement tournant.',
      'Le phaser de Strudel est une version simplifiée : un seul filtre coupe-bande (*notch*), dont la fréquence est balayée par un oscillateur lent. Un phaser analogique en creuse généralement plusieurs à la fois : l’effet est ici plus discret.',
      'L’effet ne s’entend que sur un son riche en fréquences (dent de scie, accords, bruit) : il faut qu’il y ait quelque chose à creuser.',
    ],
    recipe: {
      title: 'une nappe qui tourne lentement',
      text: 'Accords de supersaw, très riches en fréquences. `phaser(.3)` : un aller-retour en un peu plus de 3 s, un mouvement lent qui ne distrait pas du rythme. `phaserdepth(.95)` : creux très large, effet bien audible.',
      code: `note("<[c3,eb3,g3] [ab2,c3,eb3]>")
  .sound("supersaw").lpf(3000)
  // un aller-retour toutes les 3,3 s
  .phaser(.3).phaserdepth(.95)
  .attack(.2).release(.8).gain(.5)`,
    },
    vary: [['`phaser(6)` : le même accord tremble rapidement', 'note("<[c3,eb3,g3] [ab2,c3,eb3]>")\n  .sound("supersaw").lpf(3000)\n  .phaser(6).phaserdepth(.95)\n  .attack(.2).release(.8).gain(.5)']],
    traps: [
      'Sur une onde `sine`, il n’y a qu’une fréquence : le creux ne fait que la baisser quand il passe dessus. On entend une variation de volume, pas le tournoiement attendu. L’effet est fait pour les sons riches.',
      'Ne pas confondre avec le [vibrato](fx.vib), où la hauteur bouge, ni avec un [filtre](fx.lpf) piloté par un signal, qui coupe tout un côté du spectre au lieu d’une bande.',
      '`phaserdepth(0)` désactive l’effet, même avec `phaser`.',
    ],
    evo: ['Autres noms : `ph` et `phaserrate` pour `phaser` ; `phd` pour `phaserdepth`.', 'Forme courte : `.phaser("2:.8:1000:2000")` = vitesse, profondeur, centre, amplitude.'],
    see: ['fx.vib', 'fx.lpf', 'son.supersaw'],
    legacy: [['effets', 'phaser']],
  },
  {
    id: 'fx.cut', t: 'cut', sub: 'un son coupe l’autre', kind: 'fx', tokens: ['cut'], doc: 'cut',
    ess:
      'Range des sons enregistrés dans un groupe de coupure : quand un son du groupe démarre, le précédent du même groupe s’arrête (en 10 ms). ' +
      'C’est ainsi qu’un charleston fermé fait taire le charleston ouvert, comme sur une vraie batterie où le pied referme les cymbales.',
    code: `// le fermé coupe l’ouvert
sound("[oh hh hh hh]*2").bank("RolandTR909")
  .cut(1)`,
    args: [['cut', 'un numéro de groupe (nombre entier). Tous les sons qui portent le même numéro se coupent entre eux, quelle que soit leur piste. Le numéro lui-même n’a pas de sens.']],
    time: ['La coupure a lieu au début du nouveau son : le précédent descend à zéro en 10 ms, assez vite pour paraître net, assez lentement pour éviter un clic.'],
    why: [
      'Un échantillon joue normalement jusqu’au bout, même s’il chevauche les suivants. Sur un vrai charleston, c’est impossible : refermer les cymbales arrête la résonance de l’ouvert. `cut` reproduit cette contrainte physique.',
      'Le même principe sert pour les boucles et les échantillons longs : chaque nouveau départ coupe le précédent, sans superposition.',
    ],
    recipe: {
      title: 'charlestons ouvert et fermé réalistes',
      text: 'Le charleston ouvert (`oh`) résonne longtemps. Avec `cut(1)`, il ne sonne que jusqu’au fermé suivant (`hh`) : le motif devient net et rythmique, comme joué au pied.',
      code: `setcpm(124/4)
$: sound("bd*4").bank("RolandTR909")
// l’ouvert sonne jusqu’au fermé suivant
$: sound("[hh oh hh hh]*4").bank("RolandTR909")
  .cut(1).gain(.6)`,
    },
    vary: [['Sans `cut` : l’ouvert continue de résonner sous les fermés', 'setcpm(124/4)\n$: sound("bd*4").bank("RolandTR909")\n$: sound("[hh oh hh hh]*4").bank("RolandTR909")\n  .gain(.6)']],
    traps: [
      '`cut` ne concerne que les sons enregistrés. Sur les synthétiseurs (`sawtooth`…), il n’a aucun effet : utilise [clip](fx.clip) ou l’[enveloppe](sol.enveloppe).',
      'Le groupe est global : deux pistes avec le même numéro de `cut` se coupent entre elles. Choisis des numéros différents pour des instruments indépendants.',
    ],
    see: ['son.batterie', 'fx.clip'],
  },
  {
    id: 'fx.chop', t: 'chop / slice', sub: 'découper un échantillon', kind: 'fx', tokens: ['chop', 'slice', 'splice', 'striate', 'begin', 'end', 'loopAt'], doc: 'chop',
    ess:
      'Découpe un son enregistré en tranches égales pour les rejouer séparément. `chop(4)` : chaque coup est remplacé par 4 coups plus courts, qui lisent l’un après l’autre les 4 quarts de l’échantillon. ' +
      '`slice(4, "0 2 1 3")` : on choisit quelle tranche joue à chaque pas, dans l’ordre qu’on veut. Avec une boucle de batterie, on réarrange le rythme.',
    code: `// une boucle de batterie (brk), en 8 tranches,
// calée sur 2 cycles
sound("brk").chop(8).loopAt(2)`,
    args: [
      ['chop(n)', 'découpe chaque coup en n parts égales, jouées dans l’ordre, à la place du coup d’origine. Chaque part lit la portion correspondante de l’échantillon.'],
      ['slice(n, motif)', 'découpe l’échantillon en n tranches et joue, à chaque pas du motif, la tranche dont on donne le numéro (de 0 à n−1). Le motif décide du rythme ET de l’ordre.'],
      ['splice(n, motif)', 'comme `slice`, mais adapte la vitesse de chaque tranche pour qu’elle remplisse exactement son pas.'],
      ['loopAt(n)', 'règle la vitesse de lecture pour que l’échantillon entier dure n cycles. C’est ce qui cale une boucle sur le tempo.'],
      ['begin, end', 'jouer seulement une portion du son : de `begin` à `end`, en fractions de sa durée (0 = début, 1 = fin). `begin(.5)` = à partir du milieu.'],
    ],
    time: ['Les tranches ne sont pas étirées : chacune joue sa portion à la vitesse fixée par `speed` ou `loopAt`. Si une tranche est plus longue que son pas, elle déborde sur la suivante.'],
    why: [
      'Une boucle de batterie enregistrée est un seul fichier : on ne peut pas en changer le rythme note par note. La découper en tranches égales, en général 8 ou 16 (une tranche par croche ou par double-croche), isole chaque coup ; on peut ensuite les rejouer dans un autre ordre.',
      'C’est la technique des producteurs de jungle et de hip-hop, qui découpaient des *breakbeats* (des solos de batterie enregistrés) sur leurs échantillonneurs pour inventer de nouveaux rythmes.',
      '`loopAt` ne fait pas un étirement temporel : il change la vitesse de lecture, donc aussi la hauteur, comme [speed](fx.speed).',
    ],
    recipe: {
      title: 'réarranger un breakbeat',
      text:
        '`loopAt(2)` : la boucle entière dure 2 cycles, donc chacune des 8 tranches dure un quart de cycle. ' +
        '`slice(8, "0 1 [2 2] 3 4 [6 5] 6 7")` : on garde l’ordre d’origine sauf deux pas, où l’on rejoue deux tranches deux fois plus serrées (les crochets). Le rythme reste reconnaissable mais devient le tien.',
      code: `// 8 tranches, deux pas réarrangés
sound("brk")
  .slice(8, "0 1 [2 2] 3 4 [6 5] 6 7")
  .loopAt(2)`,
    },
    vary: [
      ['Ordre au hasard : une tranche tirée au sort à chaque pas', 'sound("brk")\n  // un nombre entier de 0 à 7, 8 fois par cycle\n  .slice(8, irand(8).segment(8))\n  .loopAt(2)'],
      ['Ne jouer que le début d’un son', 'sound("brk").begin(0).end(.25)'],
    ],
    traps: [
      '`loopAt(2)` cale la boucle sur 2 cycles en changeant sa vitesse : si tu changes le tempo, la hauteur de la boucle change aussi.',
      'Sans `loopAt`, les tranches jouent à leur vitesse d’origine : elles ne tombent pas forcément sur la grille du tempo.',
      '`chop` et `slice` ne concernent que les sons enregistrés. Sur un synthétiseur, ils n’ont pas de sens.',
    ],
    see: ['fx.speed', 'fx.cut', 'son.batterie', 'fn.irand'],
    legacy: [['code', 'chop(n)'], ['code', 'slice(n, "<…>")']],
  },
];
