// Wiki — la mini-notation : chaque caractère qu'on écrit entre guillemets.
//
// Forme d'une entrée (identique dans tous les fichiers du wiki) :
//   id, t (titre), sub (traduction/glose), kind
//   tokens : ce qui, dans le code, mène à cette entrée
//   doc    : nom dans la documentation officielle embarquée (alias et synonymes en sont tirés)
//   ess    : L'ESSENTIEL — une ou deux phrases
//   code   : exemple jouable
//   use    : [[titre, code, remarque?]] — COMMENT S'EN SERVIR
//   args   : [[nom, explication]]
//   traps  : PIÈGES
//   evo    : ÉVOLUTIONS (autres noms, anciennes écritures)
//   see    : entrées liées
//   legacy : [[catégorie, terme]] de l'ancien glossaire → conserve les annotations

export default [
  {
    id: 'mini.espace', t: 'espace', sub: 'la séquence', kind: 'mini', tokens: [' '],
    ess: 'L’espace sépare des éléments joués l’un après l’autre. Tous se partagent le cycle à parts égales.',
    code: 'sound("bd hh sd hh")',
    use: [
      ['Quatre pas égaux', 'sound("bd hh sd hh")'],
      ['Plus de pas, donc plus rapides', 'sound("bd hh sd hh bd bd sd hh")'],
      ['Avec des notes', 'note("c e g e").sound("piano")'],
    ],
    traps: [
      'Ajouter un élément raccourcit tous les autres : la durée du cycle ne change pas.',
      'Plusieurs espaces de suite comptent pour un seul.',
    ],
    see: ['mini.silence', 'mini.crochets', 'mini.virgule', 'sol.cycle'],
    legacy: [['rythme', 'séquence']],
  },
  {
    id: 'mini.silence', t: '~  ou  -', sub: 'le silence', kind: 'mini', tokens: ['~', '-'],
    ess: 'Un pas qui garde sa place dans le cycle, mais où rien ne joue.',
    code: 'sound("bd ~ sd ~")',
    use: [
      ['Aérer un rythme', 'sound("bd ~ ~ bd sd ~ bd ~")'],
      ['Placer un son sur le contretemps', 'sound("[~ hh]*4")'],
      ['Avec le tiret', 'sound("bd - sd -")'],
    ],
    traps: [
      'Le tiret `-` doit être entouré d’espaces. Collé à un nombre, il devient un signe moins : `"0 -1"` est la marche −1, pas un silence.',
    ],
    evo: [
      'Les deux écritures sont équivalentes. Le tilde `~` vient de TidalCycles ; le tiret `-` est plus facile à taper sur un clavier français et apparaît dans la documentation récente.',
    ],
    see: ['mini.espace', 'mini.interrogation', 'fn.mask'],
    legacy: [['rythme', 'silence']],
  },
  {
    id: 'mini.crochets', t: '[ ]', sub: 'le groupe', kind: 'mini', tokens: ['[', ']'],
    ess: 'Les crochets rangent plusieurs éléments dans un seul pas. Ils s’y partagent la durée, donc vont plus vite.',
    code: 'sound("bd [hh hh] sd [hh hh]")',
    use: [
      ['Deux sons dans un temps', 'sound("bd [hh hh] sd hh")'],
      ['Trois sons dans un temps (triolet)', 'sound("bd [hh hh hh] sd hh")'],
      ['Imbriquer', 'sound("bd [hh [hh hh]] sd hh")'],
      ['Répéter le groupe entier', 'sound("[~ cp]*2")'],
      ['Empiler dans un pas', 'sound("[bd,hh] hh [sd,hh] hh")'],
    ],
    traps: [
      'Un crochet ouvert doit être refermé, sinon le code ne s’évalue pas.',
      'Les crochets comptent pour UN pas, quel que soit leur contenu.',
    ],
    see: ['mini.virgule', 'mini.etoile', 'mini.chevrons', 'mini.point'],
    legacy: [['rythme', 'sous-séquence [ ]']],
  },
  {
    id: 'mini.etoile', t: '*', sub: 'répéter, accélérer', kind: 'mini', tokens: ['*'],
    ess: '`x*n` joue l’élément n fois dans la durée de son pas.',
    code: 'sound("bd*4")',
    use: [
      ['Quatre kicks par cycle', 'sound("bd*4")'],
      ['Sur un seul pas de la séquence', 'sound("bd hh*2 sd hh*3")'],
      ['Sur un groupe', 'sound("[bd sd]*2")'],
      ['Un nombre qui alterne', 'sound("hh*<8 16>")'],
    ],
    traps: [
      'L’étoile ne s’applique qu’à l’élément collé à sa gauche. Pour tout un passage, entoure-le de crochets.',
      '`hh*3 sd` (deux pas) n’est pas `hh!3 sd` (quatre pas) : voir `!`.',
    ],
    evo: ['C’est la version mini-notation de la fonction `.fast(n)`.'],
    see: ['mini.slash', 'mini.exclamation', 'fn.fast'],
    legacy: [['rythme', '*  (multiplier)']],
  },
  {
    id: 'mini.slash', t: '/', sub: 'ralentir, étaler', kind: 'mini', tokens: ['/'],
    ess: '`x/n` étale l’élément sur n cycles.',
    code: 'note("[c3 e3 g3 b3]/2").sound("piano")',
    use: [
      ['Une séquence sur deux cycles', 'sound("[bd sd hh cp]/2")'],
      ['Une note de basse tenue plus longtemps', 'note("[c2 f2]/4").sound("sawtooth").lpf(500)'],
    ],
    traps: [
      'Sur un son seul, `bd/2` ne joue le son qu’un cycle sur deux.',
      'Dans `setcpm(120/4)`, la barre est une vraie division, hors des guillemets : rien à voir.',
    ],
    evo: ['C’est la version mini-notation de la fonction `.slow(n)`.'],
    see: ['mini.etoile', 'fn.slow', 'mini.chevrons'],
    legacy: [['rythme', '/  (diviser)']],
  },
  {
    id: 'mini.chevrons', t: '< >', sub: 'un par cycle', kind: 'mini', tokens: ['<', '>'],
    ess: 'Les chevrons donnent un élément par cycle, à tour de rôle.',
    code: 'sound("bd hh sd <hh oh>")',
    use: [
      ['Une fin de phrase qui alterne', 'sound("bd hh sd <hh oh cp>")'],
      ['Une note de basse par cycle', 'note("<c2 ab1 eb2 bb1>").sound("sawtooth").lpf(500)'],
      ['Sur un réglage', 'sound("hh*8").gain("<1 .5>")'],
      ['Plus vite : deux par cycle', 'note("<c3 e3 g3 b3>*2").sound("piano")'],
    ],
    traps: [
      '`<a b c>` met trois cycles à revenir au début. Si la boucle paraît « ne pas tourner rond », compte les éléments.',
      'Les chevrons comptent pour UN pas dans la séquence qui les contient.',
    ],
    evo: ['`<a b c>` est une abréviation de `[a b c]/3`.'],
    see: ['mini.slash', 'mini.crochets', 'fn.cat'],
  },
  {
    id: 'mini.virgule', t: ',', sub: 'en même temps', kind: 'mini', tokens: [','],
    ess: 'La virgule superpose : les séquences qu’elle sépare jouent en même temps.',
    code: 'sound("bd*4, hh*8")',
    use: [
      ['Deux rythmes dans une ligne', 'sound("bd*4, [~ cp]*2, hh*8")'],
      ['Deux notes ensemble', 'note("[c3,g3]").sound("piano")'],
      ['Un accord', 'note("[c3,e3,g3]").sound("piano")'],
      ['Des accords dans une gamme', 'n("<[0,2,4] [3,5,7]>").scale("C:major").sound("piano")'],
    ],
    traps: [
      'Hors des crochets, la virgule superpose des séquences entières. Dans des crochets, elle superpose seulement à l’intérieur de ce pas.',
      'Ne pas confondre avec la virgule qui sépare les arguments d’une fonction, hors des guillemets : `.range(300, 2000)`.',
    ],
    see: ['fn.stack', 'fn.dollar', 'sol.accord'],
  },
  {
    id: 'mini.exclamation', t: '!', sub: 'recopier', kind: 'mini', tokens: ['!'],
    ess: '`x!n` recopie le pas n fois, sans l’accélérer. `"hh!3 sd"` vaut `"hh hh hh sd"`.',
    code: 'sound("hh!3 sd")',
    use: [
      ['Éviter de se répéter', 'sound("bd!3 [bd bd]")'],
      ['Tenir une valeur plusieurs cycles', 'note("<c2!3 eb2>").sound("sawtooth").lpf(500)'],
      ['Un masque par blocs', 'sound("hh*8").mask("<0!2 1!2>")'],
    ],
    traps: ['`!` ajoute des pas (le cycle se redivise) ; `*` répète à l’intérieur d’un pas. Le résultat rythmique est différent.'],
    evo: ['Un `!` seul, sans nombre, recopie une fois : `"bd ! sd"` vaut `"bd bd sd"`.'],
    see: ['mini.etoile', 'mini.arobase'],
  },
  {
    id: 'mini.arobase', t: '@', sub: 'allonger', kind: 'mini', tokens: ['@'],
    ess: '`x@n` donne au pas un poids de n : il dure n fois plus que ses voisins.',
    code: 'note("c3@3 e3").sound("piano")',
    use: [
      ['Une note longue puis une courte', 'note("c3@3 e3").sound("piano")'],
      ['Décaler un coup', 'sound("bd@3 sd")'],
      ['Tenir un accord plus longtemps dans une grille', 'chord("<Am@3 G>").voicing().sound("piano")'],
    ],
    traps: ['Pour une batterie, `@` ne rallonge pas le son lui-même : il déplace seulement les coups suivants.'],
    see: ['mini.souligne', 'mini.exclamation'],
  },
  {
    id: 'mini.souligne', t: '_', sub: 'prolonger', kind: 'mini', tokens: ['_'],
    ess: 'Le souligné prolonge le pas précédent d’un pas. `"c3 _ _ e3"` vaut `"c3@3 e3"`.',
    code: 'note("c3 _ _ e3").sound("piano")',
    use: [['Écrire les durées « à vue »', 'note("c3 _ e3 g3 _ _ e3 _").sound("piano")']],
    traps: [
      'Dans la séquence, le souligné doit être entouré d’espaces.',
      'À ne pas confondre avec `_$:` au début d’une ligne, qui coupe une piste.',
    ],
    see: ['mini.arobase', 'fn.dollar'],
  },
  {
    id: 'mini.interrogation', t: '?', sub: 'peut-être', kind: 'mini', tokens: ['?'],
    ess: '`x?` donne à chaque son une chance sur deux d’être retiré.',
    code: 'sound("hh*8?")',
    use: [
      ['Un charleston troué', 'sound("bd*4, hh*8?")'],
      ['Doser : retirer environ 20 %', 'sound("hh*8?0.2")'],
      ['Sur une seule note', 'note("c3 e3 g3? b3").sound("piano")'],
    ],
    args: [['?0.2', 'probabilité de RETRAIT, entre 0 et 1. `?0.2` retire peu, `?0.8` retire beaucoup.']],
    traps: [
      'Le nombre est la probabilité de retirer le son, pas de le jouer.',
      'Le hasard de Strudel est reproductible : en repartant du début, on retrouve les mêmes tirages.',
    ],
    evo: ['C’est la version mini-notation de `.degradeBy(n)`.'],
    see: ['fn.degradeBy', 'fn.sometimes', 'mini.barre'],
    legacy: [['aleatoire', 'degrade / ?']],
  },
  {
    id: 'mini.euclide', t: '(3,8)', sub: 'rythme euclidien', kind: 'mini', tokens: ['('],
    ess: '`x(k,n)` répartit k coups sur n pas, le plus régulièrement possible.',
    code: 'sound("bd(3,8)")',
    use: [
      ['Le « tresillo »', 'sound("bd(3,8), hh*8")'],
      ['Cinq sur huit', 'sound("cp(5,8)")'],
      ['Décalé de deux pas', 'sound("bd(3,8,2)")'],
      ['Sur une note de basse', 'note("c2(5,8)").sound("sawtooth").lpf(600)'],
      ['Deux répartitions superposées', 'sound("bd(3,8), hh(5,8), oh(2,8,4)")'],
    ],
    args: [
      ['k', 'nombre de coups.'],
      ['n', 'nombre de pas.'],
      ['3ᵉ nombre', 'facultatif : rotation, en pas.'],
    ],
    traps: ['Les parenthèses se collent à l’élément, sans espace : `bd(3,8)`.'],
    evo: [
      'Mêmes rythmes avec la fonction `.euclid(3,8)` ; la rotation s’écrit alors `.euclidRot(3,8,2)`.',
      'Le nom vient de l’algorithme d’Euclide ; ces rythmes ont été décrits au milieu des années 2000 par l’informaticien Godfried Toussaint.',
    ],
    see: ['fn.euclid', 'mini.etoile'],
    legacy: [['rythme', 'rythme euclidien (k,n)'], ['rythme', 'tresillo']],
  },
  {
    id: 'mini.deux-points', t: ':', sub: 'la variante', kind: 'mini', tokens: [':'],
    ess: 'Après un nom de son, `:n` choisit une variante : `hh:1` est le deuxième charleston de la banque.',
    code: 'sound("hh:0 hh:1 hh:2 hh:3")',
    use: [
      ['Choisir un kick précis', 'sound("bd:3*4")'],
      ['Même chose avec n()', 'n("0 1 2 3").sound("hh")'],
      ['Dans une gamme : séparer tonique et type', 'n("0 2 4").scale("C:minor").sound("piano")'],
      ['Dans un réglage : valeurs groupées', 'sound("bd*4").lpf("800:10")'],
    ],
    traps: [
      'La numérotation commence à 0. Un numéro trop grand revient au début de la liste.',
      'Le deux-points n’a pas le même sens partout : variante d’un son, séparateur dans `scale("C:minor")`, ou groupe de valeurs dans certains réglages (`lpf("800:10")` = coupure 800, résonance 10).',
    ],
    see: ['fn.n', 'fn.sound', 'fn.scale'],
    legacy: [['code', ':n  (variante)']],
  },
  {
    id: 'mini.barre', t: '|', sub: 'l’un ou l’autre', kind: 'mini', tokens: ['|'],
    ess: 'La barre verticale choisit au hasard, à chaque cycle, l’une des séquences qu’elle sépare.',
    code: 'sound("bd*4 | hh*8 | [bd sd]*2")',
    use: [['Varier une mélodie', 'note("c3 e3 g3 | c3 f3 a3 | b2 d3 g3").sound("piano")']],
    traps: ['Le choix se fait par cycle entier, pas note par note. Pour retirer des sons un à un, voir `?`.'],
    see: ['mini.interrogation', 'mini.chevrons'],
  },
  {
    id: 'mini.point', t: '.', sub: 'séparer des groupes', kind: 'mini', tokens: [],
    ess: 'Un point isolé, entouré d’espaces, découpe la séquence en groupes égaux : une autre façon d’écrire des crochets.',
    code: 'sound("bd . hh hh . sd . hh hh hh")',
    use: [['Équivalent avec des crochets', 'sound("bd [hh hh] sd [hh hh hh]")']],
    traps: [
      'Le point doit être entouré d’espaces. Collé à un chiffre, c’est une virgule décimale : `.5`.',
      'Rien à voir avec le point qui enchaîne les fonctions hors des guillemets : `.lpf(800)`.',
    ],
    see: ['mini.crochets', 'js.point'],
  },
];
