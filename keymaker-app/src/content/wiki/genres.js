// Wiki — traits de genres. Chaque entrée renvoie vers les pages des genres
// (champ `genre` : [idGenre, aspect]) où le trait est reconstruit pas à pas.
// Forme des entrées : voir mini.js.

export default [
  {
    id: 'genre.tempo', t: 'tempo des genres', sub: 'repères en BPM', kind: 'genre', genre: ['techno', 'tempo'],
    ess: 'Chaque genre a sa zone de tempo. Repères : synth-pop 100–125 · house 118–128 · progressive 120–128 · acid 120–145 · techno 125–150 · trance 130–142 · drum & bass 160–180. L’ambient n’en a pas : souvent, on n’y entend aucune pulsation.',
    code: `setcpm(135/4)
sound("bd*4, [~ oh]*4").bank("RolandTR909")`,
    use: [
      ['Synth-pop : 112', 'setcpm(112/4)\nsound("bd ~ ~ bd ~ ~ bd ~, ~ sd ~ sd").bank("AkaiLinn")'],
      ['Progressive : 124', 'setcpm(124/4)\nsound("bd*4, [~ hh]*4").bank("RolandTR909")'],
      ['Techno : 135', 'setcpm(135/4)\nsound("bd*4, [~ oh]*4").bank("RolandTR909")'],
      ['Trance : 138', 'setcpm(138/4)\nsound("bd*4, [~ oh]*4").bank("RolandTR909")'],
      ['House : 124', 'setcpm(124/4)\nsound("bd*4, ~ cp ~ cp, [~ hh]*4").bank("RolandTR909")'],
      ['Drum & bass : 174', 'setcpm(174/4)\nsound("bd ~ ~ ~ ~ bd ~ ~, ~ ~ sd ~ ~ ~ sd ~, hh*16").bank("RolandTR808")'],
    ],
    traps: ['Les zones se recouvrent : le tempo seul ne suffit jamais à nommer un genre.'],
    see: ['sol.tempo', 'fn.setcpm'],
  },
  {
    id: 'genre.kick-techno', t: 'kick techno', sub: 'four on the floor', kind: 'genre', genre: ['techno', 'kick'],
    ess: 'Une grosse caisse sur chaque temps, lourde et saturée. Trois qualités : une attaque nette, un grave court, du grain.',
    code: `setcpm(135/4)
sound("bd*4").bank("RolandTR909").distort(1.5).gain(.9)`,
    why: [
      'Attaque nette : un clic aigu de quelques millisecondes, souvent obtenu par une chute de hauteur très rapide (voir [penv](fx.penv)). Grave court : une fondamentale entre 40 et 100 Hz environ, qui s’éteint avant le coup suivant. Grain : une [saturation](fx.distort) qui ajoute des harmoniques et rend le kick audible même sur un petit haut-parleur.',
      'Placé sur chaque temps, il sert de métronome au danseur : tout le reste du morceau se cale sur lui.',
    ],
    use: [
      ['Fabriqué à partir d’une onde', 'setcpm(135/4)\nnote("c1*4").sound("sine").penv(36).pdecay(.05).decay(.3).sustain(0).distort(1)'],
      ['Version trance : net, sans saturation', 'setcpm(138/4)\nsound("bd*4").bank("RolandTR909")'],
      ['Version progressive : arrondi', 'setcpm(124/4)\nsound("bd*4").bank("RolandTR909").lpf(2500).gain(.9)'],
    ],
    traps: ['« Four on the floor » (quatre au plancher) désigne le placement — un kick par temps — pas un son. La house, la techno et la trance le partagent.'],
    see: ['fx.distort', 'fx.penv', 'son.batterie', 'genre.sidechain'],
    legacy: [['culture', 'techno']],
  },
  {
    id: 'genre.basse-acid', t: 'basse acid', sub: 'le son de la TB-303', kind: 'genre', genre: ['acid', 'basse'],
    ess: 'Une ligne de 16 pas jouée par une onde en dent de scie, dans un filtre fermé et très résonant qui s’ouvre brièvement à chaque note.',
    code: `setcpm(126/4)
note("c2 c2 c3 c2 ~ c2 eb2 c3 c2 ~ c2 c3 bb1 c2 ~ c2").sound("sawtooth")
  .lpf(400).lpq(15).lpenv(4).lpd(.12).decay(.15).sustain(0).gain("[1 .6 .8 .6]*4")`,
    args: [
      ['lpf', 'coupure basse (300 à 600) : le son part sombre.'],
      ['lpq', 'résonance forte (12 à 18) : le caractère nasal.'],
      ['lpenv + lpd', 'l’ouverture du filtre à chaque note, et sa durée.'],
    ],
    why: [
      'Le son vient de la Roland TB-303 (1981), vendue comme accompagnement de basse pour guitaristes, puis détournée à Chicago au milieu des années 1980. Le principe : une dent de scie riche en harmoniques, un filtre passe-bas très résonant presque fermé, et une [enveloppe de filtre](fx.lpenv) qui l’ouvre brièvement à chaque note.',
      'La [résonance](fx.lpq) amplifie la zone de la coupure : quand la coupure monte et redescend, cette bosse balaie les harmoniques une à une et produit la voyelle « ouah ».',
    ],
    traps: [
      'Sans enveloppe de filtre (`lpenv`), on obtient une basse résonante, mais pas le « ouah » de l’acid.',
      'La vraie TB-303 a aussi des glissés entre notes et des accents ; ici les accents sont imités avec un motif de `gain`.',
    ],
    see: ['fx.lpenv', 'fx.lpq', 'fx.lpf', 'fx.distort'],
    legacy: [['culture', 'acid / TB-303']],
  },
  {
    id: 'genre.hats', t: 'charleston à contretemps', sub: 'offbeat hat', kind: 'genre', genre: ['techno', 'hats'],
    ess: 'Un charleston ouvert placé exactement entre deux kicks : « boum-tss-boum-tss ». Le moteur de la house, de la techno et de la trance.',
    code: `setcpm(130/4)
sound("bd*4, [~ oh]*4").bank("RolandTR909")`,
    why: [
      'Le kick marque le temps, le charleston ouvert le rebond entre deux temps : l’oreille entend une alternance « boum-tss » qui donne l’élan. Le charleston ouvert sonne longtemps ; s’il est coupé par un fermé (voir [cut](fx.cut)), le motif devient plus sec et plus précis.',
    ],
    use: [['Avec des doubles-croches accentuées', 'setcpm(130/4)\n$: sound("bd*4, [~ oh]*4").bank("RolandTR909")\n$: sound("hh*16").bank("RolandTR909").gain("[.25 .15 .35 .15]*4")']],
    see: ['sol.contretemps', 'mini.silence', 'son.batterie'],
  },
  {
    id: 'genre.sidechain', t: 'sidechain', sub: 'le pompage', kind: 'genre', genre: ['trance', 'kick'],
    ess: 'À chaque kick, le volume des autres pistes plonge puis remonte. Le kick reste lisible, et tout le morceau « respire » en rythme.',
    code: `setcpm(138/4)
$: sound("bd*4").bank("RolandTR909").duck(2).duckattack(.2).duckdepth(1)
$: note("[a2,c3,e3]").sound("supersaw").lpf(2000).gain(.6).orbit(2)`,
    why: [
      'Dans Strudel, `duck` (voir [duck](fx.duck)) fait plonger le volume de toute une [orbit](fx.orbit) à chaque coup du déclencheur, puis le fait remonter en `duckattack` secondes. Plus la remontée est longue (jusqu’à l’intervalle entre deux kicks), plus le pompage s’entend.',
    ],
    traps: ['Le mot vient du studio : un compresseur placé sur la basse est commandé par le kick, via son entrée latérale (*side chain*).'],
    see: ['fx.duck', 'fx.orbit', 'genre.kick-techno'],
  },
  {
    id: 'genre.supersaw', t: 'accords supersaw', sub: 'le mur de son de la trance', kind: 'genre', genre: ['trance', 'timbres'],
    ess: 'Des accords joués par plusieurs dents de scie désaccordées : large, brillant, émouvant. Presque toujours filtrés et réverbérés.',
    code: `setcpm(138/4)
chord("<Am F C G>").voicing().sound("supersaw").lpf(2500).room(.5).gain(.5)`,
    why: [
      'Plusieurs dents de scie à des fréquences très légèrement différentes battent entre elles : le son ondule et s’élargit, comme un pupitre de cordes. Avec trois notes d’accord et sept voix chacune, on obtient 21 dents de scie : un son très plein qu’il faut filtrer (voir [supersaw](son.supersaw)).',
    ],
    see: ['son.supersaw', 'fn.chord', 'sol.progression'],
  },
  {
    id: 'genre.arpege-trance', t: 'arpège pincé', sub: 'pluck + écho', kind: 'genre', genre: ['trance', 'timbres'],
    ess: 'Les notes d’un accord égrenées en doubles-croches, très courtes, avec un écho calé sur le tempo qui se superpose aux notes.',
    code: `setcpm(138/4)
chord("<Am F C G>").voicing().arp("[0 2 1 3 2 3 1 2]*2")
  .sound("sawtooth").lpf(2500).decay(.12).sustain(0)
  .delay(.4).delaysync(3/16).delayfeedback(.5)`,
    traps: [
      'L’écho de 3/16 de cycle (trois doubles-croches, une croche pointée) renvoie chaque note trois pas plus tard, par-dessus les suivantes : ce motif de 3 qui glisse sur une grille de 4 crée le balancement.',
      'Pour accélérer l’arpège, mets tout l’ordre entre crochets : `.arp("[0 2 1 3]*2")`. Avec `.fast(2)` à la place, la grille d’accords irait elle aussi deux fois plus vite.',
    ],
    see: ['fn.arp', 'sol.arpege', 'fx.delay', 'fx.decay'],
  },
  {
    id: 'genre.structure', t: 'structure d’un morceau', sub: 'intro, break, montée, retour', kind: 'genre', genre: ['trance', 'structure'],
    ess: 'La musique de danse avance par blocs de 8, 16 ou 32 mesures. À chaque bloc, on ajoute ou on retire quelque chose.',
    code: `setcpm(135/4)
$: sound("bd*4").bank("RolandTR909").mask("<1!6 0 0>")
$: sound("[~ oh]*4").bank("RolandTR909").gain(.5).mask("<0 0 1!6>")`,
    use: [
      ['Un roulement qui se resserre', 'setcpm(138/4)\nsound("sd*<4 8 16 32>").bank("RolandTR909").gain(saw.range(.3, .8).slow(4))'],
      ['Un souffle qui monte', 'setcpm(138/4)\nsound("white").lpf(saw.range(300, 9000).slow(4)).gain(.25)'],
    ],
    args: [
      ['intro', 'peu d’éléments ; les pistes entrent une à une.'],
      ['breakdown', 'la batterie se tait ; restent les accords, la mélodie.'],
      ['montée (build-up)', 'roulement, souffle, filtre qui s’ouvre : la tension grimpe.'],
      ['retour (drop)', 'tout revient d’un coup.'],
      ['outro', 'les pistes sortent une à une.'],
    ],
    see: ['fn.mask', 'fn.arrange', 'fn.lastOf', 'sol.mesure'],
    legacy: [['structure', 'intro / montée / drop / outro'], ['structure', 'breakdown'], ['structure', 'section']],
  },
];
