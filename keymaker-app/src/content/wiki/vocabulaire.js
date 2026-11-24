// Wiki — compléments des entrées « vocabulaire » (l'ancien glossaire).
//
// Les entrées « voc.* » sont fabriquées par index.js à partir de l'ancien glossaire
// (legacy/glossaryData.js) : leur identifiant et leur clé d'annotation ne changent pas.
// Ce fichier remplace leur « essentiel » par un texte précis et leur ajoute, si besoin,
// un exemple, le mécanisme, des pièges et des liens. La définition d'origine reste
// visible sous « Ce que disait l'ancien glossaire ».
//
// Forme : { [id]: { ess, code?, why?, use?, traps?, see? } } (voir mini.js).

export default {
  'voc.rythme.polymetre': {
    ess:
      'Superposer des séquences de longueurs différentes qui avancent à la même vitesse de pas. Entre accolades, `{c3 e3, g3 b3 d4}` joue 2 pas par cycle sur chaque ligne : la première revient à son début tous les cycles, la seconde (3 notes) se décale d’un cran à chaque cycle.',
    code: `// 2 notes contre 3, au même pas
note("{c3 e3, g3 b3 d4}").sound("piano")`,
    why: ['Avec la [virgule](mini.virgule) ordinaire, chaque séquence est étirée pour remplir le cycle : 2 notes et 3 notes n’ont pas la même vitesse. Avec les accolades, le pas est commun ; ce sont les retours au début qui se décalent. Les deux lignes ne retombent ensemble que tous les 3 cycles (6 pas).'],
    traps: ['Le nombre de pas par cycle est celui de la PREMIÈRE séquence entre accolades.'],
    see: ['mini.virgule', 'voc.rythme.polyrythmie'],
  },
  'voc.rythme.polyrythmie': {
    ess: 'Superposer des divisions différentes du même temps : 3 coups contre 2, 4 contre 3… Toutes les séquences ont la même durée (un cycle), mais pas le même découpage. En mini-notation, la [virgule](mini.virgule) le fait directement.',
    code: `// 3 coups contre 4 dans le même cycle
sound("bd*3, hh*4")`,
    why: ['L’oreille entend deux pulsations à la fois, qui ne coïncident qu’au début du cycle. C’est un procédé central des musiques d’Afrique de l’Ouest et de Cuba, et une source de tension rythmique en musique électronique.'],
    traps: ['Ne pas confondre avec le [polymètre](voc.rythme.polymetre) : en polyrythmie, les séquences ont la même durée et des pas différents ; en polymètre, le même pas et des durées différentes.'],
    see: ['mini.virgule', 'voc.rythme.polymetre', 'fn.euclid'],
  },
  'voc.solfege.dominante-v': {
    ess: 'Le 5ᵉ [degré](sol.degre) de la gamme (sol en do majeur), et l’accord construit dessus. Il crée une tension qui « appelle » la tonique : l’enchaînement V → I est la conclusion la plus forte de la musique tonale.',
    code: `// accord V (sol), puis I (do) : tension, repos
chord("<G C>").voicing().sound("piano")`,
    why: ['L’accord de dominante contient la [sensible](voc.solfege.sensible-vii) (si en do majeur), à un demi-ton sous la tonique, qui tire vers elle. Sa basse descend d’une quinte vers la tonique : deux mouvements très attendus par l’oreille.'],
    see: ['sol.degre', 'voc.solfege.sensible-vii', 'sol.progression'],
  },
  'voc.solfege.sensible-vii': {
    ess: 'Le 7ᵉ degré, quand il est à un demi-ton sous la tonique (si en do majeur). Cette proximité crée une attraction : après la sensible, l’oreille attend la tonique.',
    code: `// si, puis do : la sensible se résout
note("b3 c4").sound("piano")`,
    why: ['Un demi-ton est le plus petit pas possible : une note à un demi-ton de la note de repos semble « presque arrivée ». En mineur naturel, le 7ᵉ degré est à un ton (sol en la mineur) : il n’y a pas de sensible, d’où une couleur moins conclusive. La gamme `harmonic:minor` relève ce degré pour en créer une.'],
    see: ['sol.degre', 'voc.solfege.dominante-v', 'sol.demi-ton'],
  },
  'voc.solfege.mode': {
    ess: 'Une gamme obtenue en partant d’un autre degré de la gamme majeure : mêmes notes, autre point de repos, donc autre couleur. De do à do : ionien (le majeur) ; de ré à ré : dorien ; de mi à mi : phrygien ; puis lydien (fa), mixolydien (sol), éolien (la, le mineur naturel), locrien (si).',
    code: `// mêmes touches blanches, deux modes
n("0 1 2 3 4 5 6 7").scale("<D3:dorian E3:phrygian>")
  .sound("piano")`,
    why: ['Changer de point de départ change l’ordre des tons et des demi-tons, donc les intervalles avec la tonique : c’est cela que l’oreille entend comme une couleur. Dans Strudel, chaque mode a son nom dans `scale()` : `dorian`, `phrygian`, `lydian`, `mixolydian`, `locrian`.'],
    see: ['voc.solfege.dorien', 'voc.solfege.phrygien', 'fn.scale', 'sol.gamme'],
  },
  'voc.solfege.dorien': {
    ess: 'Un mode mineur dont la 6ᵉ note est relevée d’un demi-ton (sixte majeure) : ré mi fa sol la SI do en ré dorien, contre ré mi fa sol la SIb do en ré mineur naturel. Sombre, mais moins triste, avec une note lumineuse. Exemple célèbre : « So What » de Miles Davis (1959), en ré dorien.',
    code: `// ré dorien : le si naturel éclaire la mélodie
n("0 2 3 5 4 2 3 0").scale("D3:dorian")
  .sound("piano")`,
    traps: ['Le dorien partage ses notes avec la majeure un ton plus bas : ré dorien = les notes de do majeur, à partir de ré.'],
    see: ['voc.solfege.mode', 'sol.mineur', 'voc.culture.house'],
  },
  'voc.solfege.phrygien': {
    ess: 'Un mode mineur dont la 2ᵉ note est abaissée d’un demi-ton (seconde mineure) : mi FA sol la si do ré en mi phrygien. Ce demi-ton juste au-dessus de la tonique donne une couleur sombre et tendue.',
    code: `// mi phrygien : mi–fa, le demi-ton qui inquiète
n("0 1 0 1 0 4 3 1").scale("E2:phrygian")
  .sound("sawtooth").lpf(800)`,
    see: ['voc.solfege.mode', 'sol.demi-ton'],
  },
  'voc.harmonie.seconde': {
    ess: 'L’intervalle entre deux notes voisines de la gamme. Seconde mineure : 1 demi-ton (mi–fa), très dissonante jouée ensemble. Seconde majeure : 2 demi-tons, un ton (do–ré), plus douce.',
    code: `// seconde majeure, puis mineure, jouées ensemble
note("[c3,d3] ~ [e3,f3] ~").sound("piano")`,
    why: ['Les fréquences de deux notes à un demi-ton sont trop proches pour fusionner et trop éloignées pour se confondre : leurs harmoniques battent fortement, l’oreille entend une rugosité. C’est la dissonance la plus forte de la gamme.'],
    see: ['sol.intervalle', 'sol.demi-ton', 'sol.ton'],
  },
  'voc.harmonie.quarte-juste': {
    ess: 'L’intervalle de 5 demi-tons (do–fa), rapport de fréquences proche de 4:3. Consonant et ouvert ; c’est le « renversement » de la quinte : do–fa monte d’une quarte, fa–do d’une quinte.',
    code: `note("[c3,f3]").sound("piano")`,
    see: ['sol.intervalle', 'sol.quinte'],
  },
  'voc.harmonie.voice-leading': {
    ess: 'La conduite des voix : enchaîner les accords en faisant bouger chaque note le moins possible, en gardant les notes communes. L’enchaînement paraît fluide, comme plusieurs chanteurs qui glissent d’une note à la voisine.',
    code: `// voicing() choisit des dispositions proches
chord("<C Am F G>").voicing().sound("piano")`,
    why: ['L’oreille suit chaque « voix » (la note du haut, celle du milieu…) comme une petite mélodie. Si toutes sautent, elle perd le fil ; si elles bougent d’un ou deux demi-tons, elle entend un mouvement continu. Dans Strudel, [voicing](fn.voicing) applique ce principe en gardant tous les accords sous une même note repère.'],
    see: ['fn.voicing', 'sol.progression'],
  },
  'voc.harmonie.armure': {
    ess: 'Sur une partition, les dièses ou bémols écrits au début de chaque portée, valables pour tout le morceau : ils indiquent la tonalité. Les dièses s’ajoutent toujours dans le même ordre : fa, do, sol, ré, la, mi, si ; les bémols dans l’ordre inverse.',
    why: ['Sol majeur a un dièse (fa#), ré majeur deux (fa#, do#)… Chaque nouvelle tonalité, une quinte plus haut, ajoute un dièse : c’est le [cycle des quintes](voc.harmonie.cycle-des-quintes). Dans Strudel, il n’y a pas d’armure : `scale("G:major")` calcule lui-même les notes.'],
    see: ['voc.harmonie.cycle-des-quintes', 'sol.tonalite', 'sol.diese-bemol'],
  },
  'voc.harmonie.cycle-des-quintes': {
    ess: 'Les 12 tonalités rangées en cercle, chacune une quinte au-dessus de la précédente : do, sol, ré, la, mi, si, fa#… jusqu’à revenir à do. Deux tonalités voisines ne diffèrent que d’une note : passer de l’une à l’autre est doux.',
    code: `// do, sol, ré, la : une quinte de plus à chaque cycle
n("0 2 4 2").scale("<C3:major G3:major D3:major A3:major>")
  .sound("piano")`,
    why: ['Monter d’une quinte (7 demi-tons) douze fois de suite parcourt les 12 notes avant de revenir au point de départ (sept octaves plus haut). D’une tonalité à sa voisine sur le cercle, une seule note change d’un demi-ton.'],
    see: ['voc.harmonie.armure', 'sol.quinte', 'sol.tonalite'],
  },
  'voc.harmonie.relative-mineure': {
    ess: 'La gamme mineure qui a exactement les mêmes notes qu’une gamme majeure : sa tonique est 3 demi-tons sous celle du majeur. La mineur est la relative de do majeur (toutes deux sur les touches blanches).',
    code: `// mêmes notes, deux points de repos
n("0 1 2 3 4 5 6 7").scale("<C3:major A2:minor>")
  .sound("piano")`,
    why: ['Seul le point de repos change : on entend clair ou sombre selon la note sur laquelle la mélodie se pose. C’est pourquoi une même grille (C, Am, F, G) peut sonner majeure ou mineure selon l’accord qu’on met en avant.'],
    see: ['sol.mineur', 'sol.majeur', 'sol.tonique'],
  },
  'voc.effets.ordre-des-effets': {
    ess: 'Dans Strudel, l’ordre des réglages dans le code ne change pas le son : le moteur applique toujours la même chaîne. La note est fabriquée avec son enveloppe de volume, puis passe dans : gain → filtres (passe-bas, passe-haut, passe-bande) → crush → distorsion → pan → phaser → envois vers l’écho et la réverbération.',
    why: [
      'Conséquences pratiques : le [gain](fx.gain) change la quantité de saturation (il est appliqué avant) ; un filtre ne peut pas adoucir le grain du [crush](fx.crush) (il est appliqué avant lui) ; la réverbération reçoit le son déjà filtré et saturé.',
      'Chaque effet n’existe qu’une fois par son : écrire deux fois `.lpf(…)` ne crée pas deux filtres, la seconde valeur remplace la première.',
    ],
    see: ['fx.gain', 'fx.lpf', 'fx.distort', 'fx.room'],
  },
  'voc.structure.swing': {
    ess: 'Retarder légèrement les notes à contretemps pour créer un balancement : au lieu de tomber au milieu du temps, le contretemps tombe vers les deux tiers. Ni tout à fait droit, ni tout à fait ternaire.',
    code: `// contretemps retardés : swing ternaire
sound("hh*8").swingBy(1/3, 4)`,
    why: ['`swingBy(x, n)` découpe le cycle en n tranches et retarde la seconde moitié de chaque tranche de x fois une demi-tranche. Avec `swingBy(1/3, 4)`, mesuré dans le moteur : le contretemps passe de la moitié aux deux tiers du temps, exactement la position d’un triolet. Des valeurs plus petites (1/6, 1/8) donnent un swing plus léger.'],
    see: ['sol.contretemps', 'voc.structure.humaniser'],
  },
  'voc.structure.humaniser': {
    ess: 'Casser la perfection de la machine par de petites irrégularités, comme un musicien : quelques millisecondes d’avance ou de retard, des volumes qui varient. Le rythme reste en place, mais il « respire ».',
    code: `// volumes et décalages légèrement aléatoires
sound("hh*16")
  .gain(rand.range(.4, .8))
  .nudge(rand.range(0, .01).seed(1))`,
    why: ['Un batteur ne frappe jamais deux fois exactement au même moment ni avec la même force : l’oreille perçoit ces écarts (quelques millisecondes) comme de la vie. Dans Strudel : `nudge(s)` décale un son enregistré de s secondes, `late(c)` / `early(c)` décalent un motif d’une fraction de cycle, et un [signal](fn.signaux) `rand` fait varier un réglage.'],
    traps: ['Deux `rand` dans la même chaîne donnent le même nombre au même instant : sans le `.seed(1)` de l’exemple, les coups les plus forts seraient toujours les plus en retard (corrélation mesurée : 1,00 ; avec `.seed(1)` : −0,08, soit aucun lien).'],
    see: ['voc.structure.swing', 'fn.signaux', 'fx.gain'],
  },
  'voc.structure.sub-bass': {
    ess: 'La partie la plus grave d’une basse, sous 60 Hz environ, qu’on ressent dans le corps plus qu’on ne l’entend. On la produit avec une onde presque pure, en général une [sinusoïde](son.ondes), à l’octave 1.',
    code: `// sinusoïde à l’octave 1 : 33 à 62 Hz
note("<c1 ab0 eb1 bb0>").struct("x*4")
  .sound("sine").decay(.4).sustain(.6)`,
    why: ['À ces fréquences, l’oreille est peu sensible, mais les grosses enceintes de club déplacent beaucoup d’air : on sent la pression. Une sinusoïde n’ayant pas d’harmoniques, elle ne gêne pas les autres sons dans le médium.'],
    traps: ['Un téléphone ou un ordinateur portable ne reproduit presque rien sous 100 Hz : écoute la sub-basse au casque.'],
    see: ['son.ondes', 'sol.hauteur', 'fx.hpf'],
  },
  'voc.structure.riser-uplifter': {
    ess: 'Un son qui monte pendant plusieurs mesures pour annoncer un moment fort (le *drop*) : souvent du bruit blanc dont un filtre s’ouvre et dont le volume grimpe. L’oreille entend une tension qui s’accumule.',
    code: `// bruit rose : la bande monte en 4 cycles
sound("pink*16")
  .bpf(saw.rangex(300, 8000).slow(4)).bpq(3)
  .gain(saw.range(.1, .6).slow(4))`,
    why: ['Le cerveau associe une hausse continue (de hauteur, de brillance, de volume) à une approche : quelque chose arrive. Quand le riser s’arrête net et que tout revient, la tension se libère.'],
    see: ['son.bruit', 'fx.bpf', 'fn.signaux', 'genre.structure'],
  },
  'voc.structure.half-time-full-time': {
    ess: 'En *half-time*, le rythme semble deux fois plus lent que le tempo réel : la caisse claire ne tombe plus sur les temps 2 et 4 mais sur le 3. En *full-time*, il suit le tempo. Le même morceau peut passer de l’un à l’autre : signature du drum & bass moderne.',
    code: `setcpm(170/4)
// half-time, puis full-time, en alternance
sound("<[bd ~ ~ ~ sd ~ ~ ~] [bd ~ sd ~ bd ~ sd ~]>")`,
    why: ['L’oreille compte la pulsation d’après l’écart entre kick et caisse claire. Si la caisse claire n’arrive qu’une fois par mesure, elle entend des temps deux fois plus longs : impression de poids et d’espace, alors que le tempo (et les charlestons) n’ont pas changé.'],
    see: ['sol.tempo', 'sol.contretemps', 'voc.culture.drum-bass-d-b'],
  },
  'voc.aleatoire.deterministe': {
    ess: 'Se dit d’un calcul qui donne toujours le même résultat pour les mêmes données. Le hasard de Strudel est déterministe : il est calculé à partir du temps (du numéro de cycle), si bien que relancer le morceau redonne exactement les mêmes tirages.',
    code: `// rejoue : les trous sont toujours aux mêmes places
sound("hh*16").degradeBy(.4)`,
    why: ['Un générateur *pseudo-aléatoire* applique une formule mathématique à un nombre de départ, la [graine](voc.aleatoire.graine). Dans Strudel, ce nombre vient de la position dans le temps : à un instant donné correspond toujours la même valeur. Avantage : une variation qui t’a plu reviendra.'],
    see: ['voc.aleatoire.graine', 'fn.sometimes', 'fn.degradeBy'],
  },
  'voc.aleatoire.graine': {
    ess: 'Le nombre de départ d’un générateur pseudo-aléatoire. Même graine = même suite de « hasards ». Dans Strudel, la graine est la position dans le temps. `seed(n)` décale ce point de départ de n cycles : mesuré dans le moteur, `seed(3)` rejoue au cycle 1 les tirages du cycle 4, et ainsi de suite. On obtient d’autres trous, tout aussi reproductibles.',
    code: `// même motif, hasard décalé de 3 cycles
sound("hh*16").degradeBy(.4).seed(3)`,
    use: [['Séparer deux hasards', 'sound("hh*8").degradeBy(.3)\n  .seed(1)  // sans lui, sometimesBy ne toucherait aucun coup\n  .sometimesBy(.3, x => x.speed(2))']],
    traps: ['`seed(n)` agit sur tout ce qui est écrit AVANT lui dans la chaîne. Placé à la fin, il décale tous les tirages ensemble : ils restent liés entre eux. Pour rendre deux hasards indépendants, mets-le entre les deux (voir [sometimes](fn.sometimes)).'],
    see: ['voc.aleatoire.deterministe', 'fn.degradeBy'],
  },
  'voc.aleatoire.generatif': {
    ess: 'Une musique produite par des règles et du hasard dosé : le résultat change à chaque cycle, mais reste dans un cadre (une gamme, un rythme, des probabilités). Le compositeur écrit le système, pas chaque note.',
    code: `// hasard dans une gamme, rythme fixe
n(irand(8).segment(8)).scale("A3:minor:pentatonic")
  .seed(1)  // un autre tirage pour l’octave
  .sound("triangle").sometimes(x => x.add(note(12)))`,
    why: ['Le cadre fait la différence entre du bruit et de la musique : une gamme interdit les fausses notes, un rythme fixe garde la pulsation, des probabilités dosent la surprise.'],
    traps: ['Sans le `.seed(1)`, `irand` et `sometimes` lisent le même tirage : mesuré dans le moteur, les degrés 0 à 3 montaient alors TOUJOURS d’une octave et les degrés 4 à 7 jamais. Une règle fixe, pas du hasard.'],
    see: ['fn.irand', 'fn.sometimes', 'sol.pentatonique'],
  },
  'voc.aleatoire.ribbon-n-len': {
    ess: '`ribbon(n, len)` découpe une tranche de `len` cycles à partir du cycle `n` et la répète en boucle. Avec du hasard, cela fige une séquence qui t’a plu : elle revient identique au lieu de changer à chaque cycle.',
    code: `// fige 2 cycles de hasard, à partir du cycle 5
n(irand(8).segment(8)).scale("A3:minor")
  .ribbon(5, 2).sound("triangle")`,
    see: ['voc.aleatoire.deterministe', 'fn.irand'],
  },
  'voc.guitare.cordes-a-vide': {
    ess: 'Les 6 cordes d’une guitare accordée normalement, de la plus grave à la plus aiguë : mi, la, ré, sol, si, mi (E A D G B E). En notation Strudel : `e2 a2 d3 g3 b3 e4`.',
    code: `note("e2 a2 d3 g3 b3 e4").sound("piano")`,
    why: ['Les cordes sont espacées d’une quarte (5 demi-tons), sauf sol–si, espacées d’une tierce majeure (4 demi-tons). Cet accord permet de jouer les accords courants sans trop étirer la main.'],
    see: ['voc.guitare.repere-case-5', 'sol.noms-des-notes'],
  },
  'voc.guitare.manche-cases': {
    ess: 'Chaque case du manche monte la corde d’un demi-ton : 1 case = 1 demi-ton, 2 cases = 1 ton, 12 cases = une octave (le double point à la 12ᵉ case). Les points aux cases 3, 5, 7 et 9 servent de repères.',
    code: `// corde de la (a2) : à vide, case 5, case 12
note("a2 d3 a3").sound("piano")`,
    see: ['sol.demi-ton', 'sol.octave'],
  },
  'voc.guitare.repere-case-5': {
    ess: 'Appuyer à la case 5 d’une corde donne la note de la corde suivante, à vide : 5 demi-tons, une quarte. Exception : la corde de sol, où c’est la case 4 qui donne le si (tierce majeure). Base de l’accordage « à l’oreille ».',
    see: ['voc.guitare.cordes-a-vide', 'voc.harmonie.quarte-juste'],
  },
  'voc.guitare.capo': {
    ess: 'Une pince posée en travers du manche, qui raccourcit toutes les cordes d’autant de cases : capo à la case 2 = tout monte de 2 demi-tons. On garde les mêmes formes d’accords, transposées. Dans Strudel, l’équivalent est [transpose](fn.transpose).',
    code: `// la même grille, 2 demi-tons plus haut
chord("<C G Am F>").voicing().transpose(2)
  .sound("piano")`,
    see: ['fn.transpose', 'voc.guitare.barre'],
  },
  'voc.guitare.barre': {
    ess: 'L’index posé à plat sur toutes les cordes d’une case, comme un capo fait avec le doigt. Les autres doigts forment un accord par-dessus : la même forme, déplacée le long du manche, donne tous les accords du même type.',
    see: ['voc.guitare.capo', 'sol.accord'],
  },
  'voc.guitare.power-chord': {
    ess: 'Un accord de deux notes, la fondamentale et sa [quinte](sol.quinte), sans tierce : ni majeur ni mineur. Très solide, surtout avec de la saturation, d’où son usage dans le rock et le metal. Il prend le nom de sa note grave : C5, E5…',
    code: `// power chords saturés
note("<[e2,b2] [g2,d3] [a2,e3] [c3,g3]>")
  .sound("sawtooth").lpf(2000).distort(2).gain(.4)`,
    why: ['Sans tierce, aucun intervalle ne frotte, et la saturation ajoute ses harmoniques sans créer de dissonance : la quinte reste nette même très distordue, alors qu’un accord complet devient brouillon.'],
    see: ['sol.quinte', 'fx.distort'],
  },
  'voc.guitare.palm-mute': {
    ess: 'Étouffer légèrement les cordes avec la tranche de la main, près du chevalet : chaque note devient courte et sourde, avec une attaque marquée. Dans Strudel, on l’imite avec une note courte (`clip` ou `decay` court) et un filtre passe-bas.',
    code: `// notes courtes et sourdes
note("e2*8").sound("sawtooth")
  .lpf(900).clip(.3)`,
    see: ['fx.clip', 'fx.decay', 'fx.lpf'],
  },
  'voc.guitare.fingerpicking': {
    ess: 'Jouer les cordes aux doigts, dans un motif régulier : le pouce sur les cordes graves, les autres doigts sur les aiguës. Le résultat ressemble à un arpège continu. Dans Strudel : [arp](fn.arp) sur un accord.',
    code: `// basse au pouce, notes aiguës aux doigts
chord("<C Am F G>").voicing()
  .arp("0 2 1 3 0 2 1 3").sound("piano")`,
    see: ['fn.arp', 'sol.arpege'],
  },
  'voc.code.iter-n': {
    ess: '`iter(n)` découpe le motif en n parts et, à chaque cycle, le fait commencer une part plus loin : `"a b c d"` devient `"b c d a"`, puis `"c d a b"`… Une variation automatique, qui revient au départ tous les n cycles.',
    code: `// le motif démarre un cran plus loin à chaque cycle
n("0 1 2 3").scale("C4:major").iter(4)
  .sound("piano")`,
    traps: ['`iterBack(n)` tourne dans l’autre sens.'],
    see: ['fn.rev', 'fn.firstOf'],
  },
  'voc.code.midi-web-midi': {
    ess: 'Le MIDI est la norme (1983) qui permet aux instruments électroniques de s’échanger des notes et des réglages. Le Web MIDI permet à un navigateur de parler directement à un synthé ou un clavier branché. Strudel peut envoyer ses notes en MIDI avec `.midi()`.',
    traps: ['Le Web MIDI dépend du navigateur (tous ne le gèrent pas) et demande un appareil MIDI branché. Les leçons de cette app n’en ont pas besoin.'],
    see: ['sol.midi'],
  },
  'voc.code.osc': {
    ess: 'L’OSC (*Open Sound Control*) est un protocole réseau pour piloter des logiciels de son. Strudel peut l’utiliser pour envoyer ses motifs à SuperCollider, le moteur sonore de TidalCycles, au lieu de produire le son dans le navigateur.',
    traps: ['Ce n’est pas disponible dans cette app : tout le son est calculé dans le navigateur.'],
    see: ['voc.code.tidalcycles', 'voc.code.strudel'],
  },
  'voc.code.strudel': {
    ess: 'Le logiciel utilisé par cette app : une version de TidalCycles en JavaScript, qui tourne entièrement dans le navigateur (projet commencé en 2022). On y écrit des motifs, et le son est calculé en direct, sans rien installer.',
    see: ['voc.code.tidalcycles', 'fn.dollar'],
  },
  'voc.code.tidalcycles': {
    ess: 'Le langage dont Strudel est issu, créé par Alex McLean vers 2009, écrit en Haskell. C’est l’un des outils fondateurs du *live coding* musical et de la scène *algorave*. Beaucoup de noms de Strudel en viennent (`every`, `sometimes`, `jux`, les noms de batterie).',
    see: ['voc.code.strudel'],
  },
  'voc.culture.house': {
    ess: 'Musique de danse née à Chicago au début des années 1980. Repères : 120 à 128 BPM, kick sur chaque temps, charleston ouvert à [contretemps](sol.contretemps), clap sur 2 et 4, accords chaleureux, basse ronde.',
    code: `setcpm(124/4)
$: sound("bd*4, ~ cp ~ cp, [~ oh]*4").bank("RolandTR909")
$: chord("<Dm7 G7>").voicing().struct("[~ x]*2")
  .sound("piano").gain(.6)`,
    see: ['sol.contretemps', 'voc.solfege.dorien', 'genre.tempo'],
  },
  'voc.culture.trance': {
    ess: 'Musique électronique née au début des années 1990 en Allemagne. Repères : 130 à 142 BPM, accords et leads en [supersaw](son.supersaw), arpèges rapides, longues montées vers un *drop* euphorique. Le parcours « Genres » de l’app la détaille.',
    see: ['son.supersaw', 'genre.arpege-trance', 'genre.tempo'],
  },
  'voc.culture.psy-trance': {
    ess: 'Branche de la trance née à Goa (Inde) puis en Europe dans les années 1990. Repères : 140 à 150 BPM, basse qui roule en doubles-croches entre les kicks, sons acides et psychédéliques.',
    code: `setcpm(145/4)
// kick sur le temps, basse sur les 3 doubles-croches suivantes
$: sound("bd*4").bank("RolandTR909")
$: note("[~ e1 e1 e1]*4").sound("sawtooth")
  .lpf(500).decay(.1).sustain(0)`,
    see: ['genre.basse-acid'],
  },
  'voc.culture.drum-bass-d-b': {
    ess: 'Musique née au Royaume-Uni dans les années 1990, issue de la [jungle](voc.culture.jungle). Repères : 160 à 180 BPM, rythmes de batterie cassés (*breakbeats*), basse très grave et puissante, souvent ressentie en [half-time](voc.structure.half-time-full-time).',
    code: `setcpm(172/4)
sound("bd ~ ~ ~ sd ~ ~ bd ~ bd sd ~ ~ ~ sd ~")`,
    see: ['voc.culture.jungle', 'voc.culture.breakbeat', 'voc.structure.half-time-full-time'],
  },
  'voc.culture.jungle': {
    ess: 'Musique née à Londres au début des années 1990 : des *breakbeats* (souvent l’[amen break](voc.culture.amen-break)) découpés et accélérés vers 160 BPM, sur des basses très graves héritées du reggae et du dub. L’ancêtre direct du drum & bass.',
    code: `// une boucle de batterie découpée et réordonnée
sound("brk").slice(8, "0 1 [2 2] 3 6 [5 4] 6 7").loopAt(1)`,
    see: ['voc.culture.amen-break', 'fx.chop'],
  },
  'voc.culture.breakbeat': {
    ess: 'Un rythme de batterie syncopé, hérité des passages instrumentaux (*breaks*) des disques de funk et de soul, où seule la batterie jouait. Contrairement au 4/4 régulier de la house, le kick n’y tombe pas sur chaque temps.',
    code: `// kick et caisse claire syncopés
sound("bd ~ ~ bd ~ ~ bd ~, ~ ~ sd ~ ~ ~ sd ~, hh*8")`,
    see: ['voc.culture.amen-break', 'sol.contretemps'],
  },
  'voc.culture.amen-break': {
    ess: 'Un solo de batterie de 4 mesures tiré du morceau « Amen, Brother » des Winstons (1969), joué par Gregory C. Coleman. Découpé et réarrangé sur les échantillonneurs, il est devenu l’un des sons les plus utilisés de l’histoire, base de la jungle et du drum & bass.',
    see: ['voc.culture.jungle', 'fx.chop'],
  },
  'voc.culture.reese-bass': {
    ess: 'Une basse épaisse qui ondule et « roule ». Elle doit son nom à « Just Want Another Chance » (1988), publié par Kevin Saunderson sous le pseudonyme Reese ; l’original a été programmé sur un synthétiseur Casio CZ. On la recrée en général avec deux dents de scie légèrement désaccordées. Très reprise en jungle et en drum & bass.',
    code: `// deux voix désaccordées : la basse ondule
note("e1*2").sound("supersaw").unison(2).detune(.3)
  .lpf(600).gain(.6)`,
    why: ['Deux fréquences proches battent entre elles (voir [supersaw](son.supersaw)) : le volume et le timbre ondulent lentement, ce qui donne une basse vivante même sur une note tenue.'],
    see: ['son.supersaw', 'voc.culture.drum-bass-d-b'],
  },
  'voc.culture.ambient': {
    ess: 'Musique de textures et d’atmosphères plutôt que de rythme et de mélodie, faite pour être écoutée attentivement ou laissée en fond. Le terme a été popularisé par Brian Eno, avec l’album « Ambient 1: Music for Airports » (1979). Repères : nappes longues, attaques lentes, beaucoup de réverbération.',
    code: `// nappe lente dans une grande salle
note("<[c3,g3,e4] [a2,e3,c4]>").sound("sawtooth")
  .lpf(1200).attack(1.5).release(3)
  .room(.9).size(8).gain(.4)`,
    see: ['fx.attack', 'fx.room', 'fx.size'],
  },
}
