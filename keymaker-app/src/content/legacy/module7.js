// Keymaker — Module 7 « Genres & Styles » (Chantier Electro, 6 juin 2026).
//
// Rôle : module de MAÎTRISE et de finition. Les élèves connaissent déjà tous les
// genres (fil rouge électro de M1→M6) — ici on construit un VRAI morceau complet par
// genre, avec les choix artistiques que ça implique (BPM, gamme, arrangement, dynamique).
//
// Source de vérité du code : KEYMAKER_strudel_reference.md (à jour strudel.cc, 6 juin 2026).
// Tout tourne sur strudel.cc tel quel. Convention : 1 cycle = 1 mesure ; setcpm(BPM/4) en 4/4.
//
// Même format de flash que M1–M6 (id, kicker, title, concept, code, decode?, theory?,
// exercise, recap?, free?). 5 chapitres, 25 flashs (7.1 → 7.25). Importé dans lessons.js.

export const m7chapitre1 = {
  module: 7,
  chapter: 'House',
  title: 'House',
  subtitle: 'Le 4/4 dansant : kick, contretemps, groove et arrangement DJ',
  flashs: [
    {
      id: "7.1",
      kicker: "Le squelette",
      title: "Anatomie d'un track house",
      concept: "La [house](voc.culture.house), c’est 120 à 126 BPM et une recette nette : un kick sur chaque temps, un charleston à [contretemps](sol.contretemps), un clap sur les temps 2 et 4, une basse ronde. On pose d’abord ce squelette : tout le reste se construit dessus.",
      code: "setcpm(124/4)\n$: s(\"bd*4\").bank(\"RolandTR909\").gain(.9)\n$: s(\"~ cp ~ cp\").bank(\"RolandTR909\").gain(.7)\n$: s(\"[~ hh]*4\").bank(\"RolandTR909\").gain(.5)\n$: note(\"<c2 c2 ab1 bb1>\").s(\"sawtooth\").lpf(800).gain(.6)",
      decode: [
        ["s(\"bd*4\")", "le kick *four on the floor* : un sur chaque temps."],
        ["[~ hh]*4", "le charleston entre deux kicks, sur la seconde moitié de chaque temps : le balancement house."],
        ["~ cp ~ cp", "le clap sur les temps 2 et 4 : le *backbeat*."],
        ["note(\"<c2 …>\")", "une basse ronde, une note par mesure, filtrée au-dessus de 800 Hz."],
      ],
      theory: {
        title: "Les organes d’un morceau house",
        items: [
          ["kick 4/4", "la pulsation, régulière et dansante."],
          ["charleston à contretemps", "entre les kicks : la signature."],
          ["backbeat", "clap ou caisse claire sur 2 et 4."],
          ["basse", "ronde, sur les fondamentales de la grille d’accords."],
          ["voix hachée", "un échantillon de voix découpé (leçon 7.3)."],
          ["arrangement", "intro, montée, plein, fin (leçon 7.4)."],
        ],
      },
      exercise: "Joue le squelette, puis coupe une couche à la fois avec `_$:` pour entendre le rôle de chacune. Sans le charleston à contretemps, ça sonne tout de suite moins « house ».",
      culture: {
        artist: "Frankie Knuckles et Jamie Principle",
        track: "Your Love",
        why: "Chicago, 1987 : écrit et chanté par Jamie Principle, produit par Frankie Knuckles, qu’on surnomme le « parrain de la house ». Écoute la ligne de synthé qui tourne en boucle sur le kick 4/4 : tout le morceau repose sur elle.",
      },
      rich: true,
      richRecap: true,
    },

    {
      id: "7.2",
      kicker: "Le balancement",
      title: "Le groove house : swing & humanisation",
      concept: "Une grille parfaitement droite sonne raide. Le groove naît du [swing](voc.structure.swing), qui retarde chaque contretemps, et de petits décalages (`late`, `early`) qui imitent un musicien. Le même rythme, mais il respire.",
      code: "setcpm(124/4)\n$: s(\"bd*4, ~ cp ~ cp\").bank(\"RolandTR909\")\n$: s(\"hh*8\").bank(\"RolandTR909\").swing(4).gain(.5)\n$: note(\"c2 ~ c2 ~ ab1 ~ bb1 ~\").s(\"sawtooth\").lpf(800).late(.005).gain(.6)",
      decode: [
        [".swing(4)", "découpe le cycle en 4 tranches (une par temps) et retarde la seconde moitié de chacune : le charleston à contretemps passe de la moitié aux deux tiers du temps (vérifié dans le moteur)."],
        [".late(.005)", "retarde la basse de 0,005 cycle, soit environ 10 ms à 124 BPM : elle « pousse » juste derrière le kick."],
        ["hh*8", "huit charlestons par mesure : un sur le temps, un à contretemps, à chaque temps."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["swing(n)", "retarde les contretemps à l’intérieur de n tranches du cycle ; `n` doit correspondre aux temps (4 en 4/4) pour qu’il y ait des contretemps à décaler."],
          ["late / early", "retard ou avance, en fraction de cycle."],
          ["humaniser", "casser la perfection de la machine (voir [humaniser](voc.structure.humaniser))."],
        ],
      },
      exercise: "Compare avec `.swing(8)` : avec 8 tranches, chaque charleston tombe au début de la sienne, il n’y a plus de contretemps à décaler, et le swing disparaît. Joue aussi avec `.late(.02)` sur le clap.",
      rich: true,
    },

    {
      id: "7.3",
      kicker: "La voix-instrument",
      title: "Le vocal chop & le sample",
      concept: "La house aime la voix humaine découpée en morceaux (le *vocal chop*). Sans rien importer, la banque `numbers` contient des chiffres parlés : on les choisit avec `n()`, et on HACHE un échantillon en tranches avec [chop](fx.chop).",
      code: "setcpm(124/4)\n$: s(\"bd*4, ~ cp\").bank(\"RolandTR909\")\n$: s(\"numbers:3\").chop(8).gain(.7).room(.2)\n$: n(\"0 2 4 6\").s(\"numbers\").gain(.55)",
      decode: [
        ["s(\"numbers:3\")", "le fichier n° 3 de la banque « numbers », un chiffre parlé."],
        [".chop(8)", "le découpe en 8 tranches jouées dans l’ordre, chacune sur un huitième du pas : un effet de bégaiement."],
        ["n(\"0 2 4 6\").s(\"numbers\")", "ici `n()` est écrit en premier : il crée le rythme (4 événements) et choisit les fichiers 0, 2, 4 et 6."],
        [".room(.2)", "un peu de réverbération pour placer la voix dans l’espace."],
      ],
      theory: {
        title: "Hacher et réordonner",
        items: [
          ["chop(n)", "n tranches jouées DANS L’ORDRE."],
          ["slice(n, \"<…>\")", "les tranches dans un ordre CHOISI."],
          [":n / .n(\"…\")", "choisit quel fichier de la banque."],
          ["tes propres voix", "`samples(…)` charge tes enregistrements (réseau, une fois)."],
        ],
      },
      exercise: "Remplace `.chop(8)` par `.slice(8, \"<0 2 4 6 1 3 5 7>\")` : les tranches sont réordonnées, la voix est remixée. Essaie d’autres ordres.",
      rich: true,
    },

    {
      id: "7.4",
      kicker: "Les sections",
      title: "Arranger en 8 / 16 mesures",
      concept: "Un morceau n’est pas une boucle infinie : ce sont des SECTIONS qui s’enchaînent. [arrange](fn.arrange) joue chaque motif pendant un nombre de mesures donné, à la suite. C’est l’histoire en quatre actes : intro, montée, plein (*drop*), fin.",
      code: "setcpm(124/4)\nconst kick = s(\"bd*4\").bank(\"RolandTR909\")\nconst clap = s(\"~ cp ~ cp\").bank(\"RolandTR909\")\nconst bass = note(\"<c2 ab1 bb1 c2>\").s(\"sawtooth\").lpf(800).gain(.6)\narrange(\n  [8,  kick],\n  [8,  stack(kick, clap)],\n  [16, stack(kick, clap, bass)],\n  [8,  kick]\n)",
      decode: [
        ["const nom = …", "chaque brique définie une fois, pour la réutiliser."],
        ["arrange([8, kick], …)", "joue « kick » pendant 8 mesures, puis passe à la section suivante."],
        ["[16, stack(…)]", "le *drop* : 16 mesures avec toutes les couches."],
        ["1 cycle = 1 mesure", "l’ensemble dure 8 + 8 + 16 + 8 = 40 mesures, soit environ 77 s à 124 BPM."],
      ],
      theory: {
        title: "La structure pour DJ",
        items: [
          ["intro", "le kick seul : le DJ peut caler le morceau sur le précédent."],
          ["montée", "on empile les couches, la tension monte."],
          ["drop", "tout entre : le plein d’énergie."],
          ["outro", "on retire les couches : le DJ enchaîne."],
        ],
      },
      exercise: "Ajoute une section « break » : `[8, stack(clap, bass)]` (sans kick) avant le drop. Couper le kick puis le faire revenir est l’un des effets les plus utilisés en house.",
      culture: {
        artist: "Derrick May (Rhythim Is Rhythim)",
        track: "Strings of Life",
        why: "Detroit, 1987 : un riff de piano (une séquence de son ami Michael James) et des cordes de synthé. C’est de la techno de Detroit plutôt que de la house, mais l’idée vaut pour les deux : un morceau de club peut reposer sur ses accords autant que sur son rythme.",
      },
      rich: true,
      richRecap: true,
    },

    {
      id: "7.5",
      kicker: "Le projet",
      title: "Projet : un track house complet (~2 min)",
      concept: "On réunit tout : batterie complète, basse, accords de septième en nappe, une voix hachée, et un arrangement en 6 sections. 64 mesures à 124 BPM, environ deux minutes. Un vrai morceau, écrit comme une règle.",
      code: "setcpm(124/4)\nconst drums  = s(\"bd*4, ~ cp ~ cp, [~ hh]*4\").bank(\"RolandTR909\")\nconst bass   = note(\"<c2 c2 ab1 bb1>\").s(\"sawtooth\").lpf(900).gain(.7)\nconst chords = chord(\"<Cm7 Ab^7 Bb^7 Cm7>\").voicing().s(\"sawtooth\").lpf(2000).attack(.1).gain(.4).room(.4)\nconst vox    = s(\"numbers:3\").chop(8).gain(.5).room(.3)\narrange(\n  [8,  bass],\n  [8,  stack(drums, bass)],\n  [16, stack(drums, bass, chords)],\n  [8,  stack(drums, chords, vox)],\n  [16, stack(drums, bass, chords, vox)],\n  [8,  drums]\n)",
      decode: [
        ["intro [8, bass]", "la basse seule pose la tonalité (do mineur)."],
        ["montée et drop", "on ajoute la batterie, puis les accords : le drop arrive à la 3ᵉ section, pour 16 mesures."],
        ["break [8, … vox]", "la basse se retire, la voix hachée respire."],
        ["outro [8, drums]", "il ne reste que la batterie, prête à enchaîner."],
      ],
      recap: {
        title: "Récap — La house",
        columns: ["Brique", "Idée", "Strudel"],
        rows: [
          ["kick 4/4", "le cœur", "`s(\"bd*4\").bank(\"RolandTR909\")`"],
          ["contretemps", "le balancement", "`s(\"[~ hh]*4\")`"],
          ["backbeat", "le clap sur 2 et 4", "`s(\"~ cp ~ cp\")`"],
          ["groove", "swing, léger retard", "`.swing(4)` · `.late(.01)`"],
          ["voix hachée", "un échantillon de voix découpé", "`s(\"numbers:3\").chop(8)`"],
          ["arrangement", "les sections", "`arrange([8, a], [16, b])`"],
        ],
      },
      exercise: "Change la grille (`chord(\"<Fm7 Db^7 Eb^7 Fm7>\")`), le tempo (122 à 126), l’ordre des sections. Le squelette tient : tu racontes une autre histoire.",
      free: "Fais ta house : pars du squelette (kick 4/4, clap sur 2 et 4, charleston à contretemps), pose une basse ronde, ajoute une seule voix hachée, puis raconte quatre parties avec [arrange](fn.arrange) : intro, montée, drop, fin. Vise 124 BPM, et juge une seule chose : est-ce que ça donne envie de danser ?",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m7chapitre2 = {
  module: 7,
  chapter: 'Techno',
  title: 'Techno',
  subtitle: 'Moins = plus : minimalisme, tension, breakdown, pump',
  flashs: [
    {
      id: '7.6',
      kicker: 'Moins = plus',
      title: "Anatomie d'un track techno",
      concept:
        "La techno, c'est 128–135 BPM et une philosophie : MOINS = PLUS. Peu d'éléments, beaucoup de " +
        "répétition → l'hypnose. Un kick qui règne, des charleys discrets, une bassline roulante et " +
        "plucky. Là où la house séduit, la techno cogne et fait planer.",
      code:
        'setcpm(132/4)\n' +
        '$: s("bd*4").bank("RolandTR909").gain(.95)\n' +
        '$: s("[~ hh]*4").bank("RolandTR909").gain(.4)\n' +
        '$: s("~ ~ ~ oh").bank("RolandTR909").gain(.35)\n' +
        '$: note("c1*8").s("sawtooth").lpf(500).lpq(6).decay(.1).sustain(0).gain(.5)',
      decode: [
        ['s("bd*4").gain(.95)', "le kick domine tout — c'est lui le morceau."],
        ['~ ~ ~ oh', "un charley OUVERT une seule fois par mesure → le petit « tss » qui soulève."],
        ['note("c1*8")', "une basse roulante en croches, très grave (c1)."],
        ['decay(.1).sustain(0)', "enveloppe courte → chaque note « plucke » puis se tait. Hypnotique."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['minimalisme', "peu d'éléments, choisis avec soin."],
          ['hypnose', "la répétition longue installe la transe."],
          ['le kick règne', "en techno il est devant, sec, dominant."],
        ],
      },
      exercise:
        "Résiste à l'envie d'ajouter. Enlève plutôt : coupe les charleys, ne garde que kick + basse. " +
        "Souvent, c'est là que ça devient vraiment techno.",
      culture: {
        artist: 'Plastikman',
        track: 'Spastik',
        why:
          "13 minutes de quasi pures percussions 909 (Richie Hawtin, 1993) : le manifeste du « moins = plus » — écoute tout ce qui se passe avec si peu.",
      },
    },

    {
      id: '7.6b',
      kicker: 'Le kick fait main',
      title: 'penv : le kick synthétique',
      concept:
        "Un kick techno, c'est une note très grave dont la HAUTEUR plonge en quelques millisecondes : " +
        "« tooow » → « bd ». penv (pitch envelope) fait exactement ça. Tu peux donc SYNTHÉTISER ton kick " +
        "au lieu de le sampler — c'est ainsi que la TR-909 fabrique le sien.",
      code:
        'setcpm(132/4)\n' +
        '$: note("c1*4").s("sine").penv(24).pdecay(.08).decay(.25).sustain(0).distort("1.4:.7").gain(.9)\n' +
        '$: s("[~ hh]*4").bank("RolandTR909").gain(.35)',
      decode: [
        ['note("c1*4").s("sine")', "la base : une sinusoïde très grave, quatre fois par mesure."],
        ['.penv(24)', "l'enveloppe de hauteur : la note démarre 24 demi-tons (2 octaves) plus haut…"],
        ['.pdecay(.08)', "…et retombe en 80 ms → le « clic-plongeon » caractéristique du kick."],
        ['.decay(.25).sustain(0)', "le volume meurt vite : un coup, pas une note tenue (M4)."],
        ['.distort("1.4:.7")', "une pointe de saturation pour durcir le coup (M4)."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['penv / pdecay / pattack', "l'enveloppe de HAUTEUR (pitch envelope) : de combien la note plonge, et en combien de temps."],
          ['kick synthétique', "un oscillateur qui pique du nez — la recette du kick 909/808."],
          ['pourquoi faire ?', "un kick ACCORDÉ à ta tonalité (c1, e1…) et sculptable à l'infini."],
        ],
      },
      exercise:
        'Sculpte ton kick : penv(12) (plus doux) vs penv(36) (plus claquant) ; pdecay(.03) vs pdecay(.15). ' +
        'Puis accorde-le à ta tonalité : note("e1*4") pour un morceau en mi mineur.',
    },

    {
      id: '7.7',
      kicker: 'La grande respiration',
      title: 'Tension & relâchement',
      concept:
        "La techno vit sur une seule dynamique : la TENSION qui monte, puis le RELÂCHEMENT. " +
        "Pas de mélodie qui raconte — c'est le FILTRE qui raconte. On l'ouvre lentement (tension), " +
        "on le referme (détente), sur plusieurs mesures.",
      code:
        'setcpm(132/4)\n' +
        '$: s("bd*4").bank("RolandTR909")\n' +
        '$: s("[~ hh]*4").bank("RolandTR909").gain(.4)\n' +
        '$: note("c1*8").s("sawtooth").lpf(sine.range(400,2500).slow(8)).lpq(8).decay(.12).sustain(0).gain(.5)',
      decode: [
        ['lpf(sine.range(400,2500))', "la coupure oscille entre 400 et 2500 Hz."],
        ['.slow(8)', "un aller-retour complet toutes les 8 mesures → la lente respiration techno."],
        ['note("c1*8")', "8 notes par mesure → le filtre est lu 8×/mesure, le balayage s'entend."],
      ],
      theory: {
        title: 'La dynamique sans mélodie',
        items: [
          ['tension', "ouvrir le filtre, ajouter une couche, densifier."],
          ['relâchement', "fermer le filtre, retirer une couche."],
          ['automation', "un signal lent (sine.slow) pilote un paramètre tout seul."],
        ],
      },
      exercise:
        "Ralentis encore : .slow(16). La montée dure deux fois plus longtemps → la tension devient " +
        "irrésistible. C'est tout l'art de la techno : la patience.",
    },

    {
      id: '7.8',
      kicker: "L'arme absolue",
      title: 'Le breakdown & la montée',
      concept:
        "Le geste le plus puissant de toute la musique de club : on RETIRE le kick (le breakdown), " +
        "on fait MONTER la tension (filtre qui s'ouvre), puis le kick CLAQUE de nouveau (le drop). " +
        "Le vide rend le retour énorme.",
      code:
        'setcpm(132/4)\n' +
        'const kick  = s("bd*4").bank("RolandTR909")\n' +
        'const synth = note("c1*8").s("sawtooth").lpq(10).decay(.12).sustain(0).gain(.5)\n' +
        'const hats  = s("[~ hh]*4").bank("RolandTR909").gain(.4)\n' +
        'arrange(\n' +
        '  [8,  stack(kick, synth.lpf(1500))],\n' +
        '  [8,  synth.lpf(sine.range(400,4000).slow(8))],\n' +
        '  [16, stack(kick, synth.lpf(2500), hats)]\n' +
        ')',
      decode: [
        ['section 1', "le plein : kick + basse filtrée. L'état normal."],
        ['section 2 (breakdown)', "le kick DISPARAÎT, et le filtre de la basse s'ouvre = la montée."],
        ['section 3 (drop)', "le kick revient + les charleys → l'énergie explose."],
        ['le vide', "8 mesures sans kick : c'est ce qui rend le retour si fort."],
      ],
      theory: {
        title: 'Les trois temps',
        items: [
          ['breakdown', "on dégarnit (souvent : plus de kick)."],
          ['montée (build)', "filtre qui monte, densité qui augmente, parfois un riser (bruit blanc)."],
          ['drop', "tout revient d'un coup, le kick en tête."],
        ],
      },
      exercise:
        "Ajoute un riser de bruit blanc dans le breakdown : s(\"white\").hpf(saw.range(200,8000).slow(8)).gain(.3). " +
        "Le souffle qui monte annonce le drop.",
    },

    {
      id: '7.9',
      kicker: 'Le pompage',
      title: 'Sidechaining & pump',
      concept:
        "Tu as sûrement entendu ce « pompage » : à chaque kick, le reste du son PLONGE puis remonte. " +
        "En studio ça s'appelle le sidechain. Strudel n'a pas de bouton magique → on le FABRIQUE avec " +
        "un gain qui dip sur chaque temps.",
      code:
        'setcpm(132/4)\n' +
        '$: s("bd*4").bank("RolandTR909").gain(1)\n' +
        '$: chord("Cm").voicing().s("sawtooth").lpf(2000).segment(16).gain(saw.range(.3,1).fast(4)).room(.3)',
      decode: [
        ['saw.range(.3,1)', "un signal en dent de scie : il part bas (.3) et remonte (1)."],
        ['.fast(4)', "4 fois par mesure = une fois par temps, calé sur le kick."],
        ['.segment(16)', "on rejoue l'accord 16×/mesure → le gain mouvant s'entend (sinon figé)."],
        ['le résultat', "à chaque kick, le pad PLONGE puis remonte → le pump."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['sidechain', "le kick « écrase » le volume des autres pistes une fraction de seconde."],
          ['pump', "l'effet de respiration qui en résulte, très dansant."],
          ['fake en Strudel', "gain piloté par un saw synchronisé au kick."],
        ],
      },
      exercise:
        "Change la forme : gain(sine.range(.3,1).fast(4)) (pompage plus doux) ou .fast(2) (un dip toutes les 2 temps). " +
        "Trouve le pompage qui te fait hocher la tête.",
      culture: {
        artist: 'Daft Punk',
        track: 'One More Time',
        why:
          "le pompage sidechain rendu planétaire : tout le morceau « respire » au rythme du kick — exactement ton gain(saw.range(.3,1)).",
      },
    },

    {
      id: '7.10',
      kicker: 'Le projet',
      title: 'Projet : un set techno jouable en live',
      concept:
        "Pas un morceau figé : un SET. Des pistes nommées que tu montes une par une (comme un DJ), une " +
        "piste armée en mute (_), et all() pour fermer le filtre de tout le set en transition. Tu joues " +
        "avec le clavier, en direct.",
      code:
        'setcpm(132/4)\n' +
        'const kick = s("bd*4").bank("RolandTR909").gain(1)\n' +
        'const hats = s("[~ hh]*4, ~ ~ ~ oh").bank("RolandTR909").gain(.4)\n' +
        'const bass = note("c1*8").s("sawtooth").lpf(800).lpq(8).decay(.12).sustain(0).gain(.5)\n' +
        'const stab = chord("<Cm Cm Ab Bb>").voicing().s("sawtooth").lpf(1800).segment(16).gain(saw.range(.3,.9).fast(4)).room(.3)\n' +
        'kick$:  kick\n' +
        'hats$:  hats\n' +
        'bass$:  bass\n' +
        '_stab$: stab\n' +
        'all(x => x.when("<0!7 1>", y=>y.lpf(500)))',
      decode: [
        ['kick$: / hats$: …', "pistes NOMMÉES (M6) : tu en mutes/démutes pour monter le set en live."],
        ['_stab$:', "le stab est armé mais MUET (le _). Enlève le _ pour le faire entrer."],
        ['stab pompé', "le sidechain fake du flash 7.9, appliqué aux accords."],
        ['all(when "<0!7 1>")', "ferme le filtre de TOUT le set 1 mesure sur 8 → la transition globale."],
      ],
      recap: {
        title: 'Récap 7.2 — La techno',
        columns: ['Brique', 'Idée', 'Strudel'],
        rows: [
          ['Minimal', 'moins = plus', 'peu de couches, longue boucle'],
          ['Kick', 'il règne', 's("bd*4").bank("RolandTR909")'],
          ['Tension', 'filtre lent', 'lpf(sine.range().slow(8))'],
          ['Breakdown', 'retirer le kick', 'arrange / _$:'],
          ['Pump', 'sidechain fake', 'gain(saw.range(.3,1).fast(4))'],
          ['Live', 'pistes + all()', 'kick$: / _stab$ / all(f)'],
        ],
      },
      exercise:
        "Joue le set : enlève le _ de _stab$, puis remute-le ; coupe bass$ pour un breakdown. " +
        "Tes doigts sont les faders.",
      free:
        "Fais ta techno : un kick 909 qui règne, UNE bassline hypnotique, et c'est presque tout. " +
        "Monte la tension avec un filtre lent sur 8 mesures, place un breakdown (coupe le kick) suivi " +
        "d'un drop, et ajoute un pump. Joue-le en live avec _$:. Vise 130–135 BPM, et rappelle-toi : moins = plus.",
    },
  ],
};

export const m7chapitre3 = {
  module: 7,
  chapter: 'Drum & Bass',
  title: 'Drum & Bass',
  subtitle: '170 BPM, breakbeat haché et basse roulante : le half-time',
  flashs: [
    {
      id: "7.11",
      kicker: "Le grand écart",
      title: "Anatomie du drum & bass",
      concept: "Le [drum & bass](voc.culture.drum-bass-d-b), c’est environ 170 à 175 BPM, des charlestons très rapides… et un rythme qui paraît LENT et lourd, en [half-time](voc.structure.half-time-full-time). Ce grand écart entre vitesse et ressenti, plus une basse très grave, fait sa signature.",
      code: "setcpm(170/4)\n$: s(\"bd ~ ~ ~ ~ ~ ~ ~\").bank(\"RolandTR808\").gain(.9)\n$: s(\"~ ~ ~ ~ sd ~ ~ ~\").bank(\"RolandTR808\").gain(.8)\n$: s(\"hh*16\").bank(\"RolandTR808\").gain(.3)\n$: note(\"c1*4\").s(\"sine\").gain(.8)",
      decode: [
        ["setcpm(170/4)", "170 BPM : un temps dure 0,35 s."],
        ["caisse claire au 5ᵉ pas sur 8", "sur le temps 3 : le *half-time feel*, le rythme semble deux fois plus lent."],
        ["hh*16", "16 charlestons par mesure : l’énergie rapide, en contraste."],
        ["note(\"c1*4\").s(\"sine\")", "une [sub-basse](voc.structure.sub-bass) : sinusoïde à 33 Hz."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["breakbeat", "un rythme syncopé hérité du funk, pas un 4/4 régulier (voir [breakbeat](voc.culture.breakbeat))."],
          ["sub-basse", "la partie la plus grave de la basse, ressentie plus qu’entendue."],
          ["half-time", "caisse claire sur le 3 : ressenti d’environ 85 BPM, alors que le tempo est 170."],
        ],
      },
      exercise: "Double la vitesse ressentie : mets la caisse claire sur 2 ET 4 (`\"~ ~ sd ~ ~ ~ sd ~\"`). Même tempo, mais ça file deux fois plus vite (*full-time*).",
      rich: true,
    },

    {
      id: "7.12",
      kicker: "Le break",
      title: "Le breakbeat : chop, iter, shuffle",
      concept: "Le cœur du drum & bass, c’est le *break* : l’[amen break](voc.culture.amen-break), découpé en tranches et réordonné sans fin. On le charge, on le hache (`chop`), puis `iter` fait commencer le motif un quart plus loin à chaque mesure : une boucle qui ne se répète qu’au bout de 4 mesures.",
      code: "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })\nsetcpm(170/4)\n$: s(\"amen/4\").fit().chop(16).iter(4).cut(1).gain(.9)\n$: note(\"<c1 c1 eb1 c1>\").s(\"sine\").gain(.7)",
      decode: [
        ["samples({ amen: url })", "charge le break depuis son adresse, sous le nom « amen »."],
        ["s(\"amen/4\").fit()", "le break joué une fois toutes les 4 mesures, sa vitesse calée pour remplir exactement ces 4 mesures."],
        [".chop(16)", "16 tranches jouées dans l’ordre."],
        [".iter(4)", "décale le départ d’un quart à chaque mesure (voir [iter](voc.code.iter-n))."],
        [".cut(1)", "chaque tranche coupe la précédente : pas de chevauchement."],
      ],
      theory: {
        title: "Hacher un break",
        items: [
          ["amen", "l’un des breaks les plus échantillonnés de l’histoire, à la base de la jungle et du drum & bass."],
          ["chop ou slice", "`chop` : dans l’ordre ; `slice(n, \"<…>\")` : dans l’ordre choisi."],
          ["iter(n)", "rotation du motif : une variation automatique."],
        ],
      },
      exercise: "Remplace `.iter(4)` par `.slice(16, \"<0 1 2 3 8 9 6 7>\")` : tu réordonnes les tranches, ton propre découpage du break.",
      culture: {
        artist: "The Winstons",
        track: "Amen, Brother",
        why: "le break de batterie le plus échantillonné de l’histoire, vers 1:26 du morceau : quelques secondes de 1969, devenues la base de la jungle et du drum & bass.",
      },
      rich: true,
      richRecap: true,
    },

    {
      id: "7.13",
      kicker: "Le growl",
      title: "La basse roulante (reese)",
      concept: "La basse signature du drum & bass, c’est la [reese](voc.culture.reese-bass), un grognement mouvant. On la recrée avec deux dents de scie LÉGÈREMENT désaccordées qui battent l’une contre l’autre. On l’obtient en empilant deux notes à une fraction de demi-ton d’écart.",
      code: "setcpm(170/4)\n$: s(\"bd ~ ~ ~ sd ~ ~ ~\").bank(\"RolandTR808\")\n$: note(\"[24,24.2]*8\").s(\"sawtooth\").lpf(sine.range(300,1400).slow(4)).lpq(7).decay(.2).sustain(.6).gain(.55)",
      decode: [
        ["note(\"[24,24.2]\")", "deux dents de scie : MIDI 24 (do1, 32,7 Hz) et 24,2, soit 0,2 demi-ton plus haut."],
        ["*8", "la basse roule en croches."],
        ["lpf(sine.range(300,1400).slow(4))", "le filtre ondule sur 4 mesures : le grognement bouge."],
        ["les décimales", "`note()` accepte des numéros MIDI à virgule : des écarts plus fins qu’un demi-ton."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["battement", "deux fréquences très proches s’additionnent puis s’annulent tour à tour : le volume ondule (voir [supersaw](son.supersaw))."],
          ["désaccord", "un petit écart de hauteur entre deux oscillateurs. Plus il est grand, plus le battement est rapide et rauque."],
          ["mouvement", "un filtre lent rend la basse vivante, jamais statique."],
        ],
      },
      exercise: "Élargis le désaccord : `note(\"[24,24.5]*8\")` (plus rauque), puis resserre à `24.05` (presque pur). Trouve le grain qui te plaît.",
      culture: {
        artist: "Reese (Kevin Saunderson)",
        track: "Just Want Another Chance",
        why: "Detroit, 1988 : la basse désaccordée qui gronde dans l’intro a donné son nom à la *basse reese* (Reese est un pseudonyme de Kevin Saunderson). Une grande partie du drum & bass en a repris le principe.",
      },
      rich: true,
      richRecap: true,
    },

    {
      id: "7.14",
      kicker: "Le poids",
      title: "Half-time vs full-time",
      concept: "Une même piste à 170 BPM peut sonner légère et filante (*full-time*) ou lourde et planante (*half-time*). Tout tient à la place de la caisse claire. Passer de l’un à l’autre est l’un des effets de *drop* les plus forts du drum & bass.",
      code: "setcpm(170/4)\nconst hats = s(\"hh*16\").bank(\"RolandTR808\").gain(.3)\nconst subs = note(\"[24,24.2]*4\").s(\"sawtooth\").lpf(700).lpq(6).gain(.55)\narrange(\n  [8, stack(s(\"bd*2, ~ ~ sd ~ ~ ~ sd ~\").bank(\"RolandTR808\"), hats, subs)],\n  [8, stack(s(\"bd ~ ~ ~ ~ ~ ~ ~, ~ ~ ~ ~ sd ~ ~ ~\").bank(\"RolandTR808\"), hats, subs)]\n)",
      decode: [
        ["section 1 (full-time)", "caisse claire sur 2 ET 4 : léger, rapide."],
        ["section 2 (half-time)", "caisse claire sur le seul temps 3 : ressenti d’environ 85 BPM, lourd."],
        ["même tempo", "170 BPM dans les deux : seule la place de la caisse claire change le ressenti."],
        ["charlestons et basse constants", "le contraste vient uniquement du rythme."],
      ],
      theory: {
        title: "Deux ressentis, un tempo",
        items: [
          ["full-time", "le rythme suit le tempo réel : énergie, course."],
          ["half-time", "le rythme paraît deux fois plus lent : poids, espace."],
          ["le drop", "basculer en half-time au moment du drop."],
        ],
      },
      exercise: "Inverse l’ordre : commence en half-time, puis bascule en full-time. Sens comment le passage relance l’énergie.",
      rich: true,
    },

    {
      id: "7.15",
      kicker: "Le projet",
      title: "Projet : une intro D&B avec break & drop",
      concept: "On assemble : une intro planante (nappe + sub-basse), une montée, puis le DROP où le break entre en plein avec la basse désaccordée. C’est la structure d’ouverture classique d’un morceau de drum & bass.",
      code: "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })\nsetcpm(170/4)\nconst sub   = note(\"[24,24.2]*4\").s(\"sawtooth\").lpf(700).lpq(6).gain(.55)\nconst brk   = s(\"amen/4\").fit().chop(16).iter(4).cut(1).gain(.9)\nconst pad   = chord(\"<Cm7 Ab^7>\").voicing().s(\"sawtooth\").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)\narrange(\n  [8,  stack(pad, sub)],\n  [8,  stack(pad, sub, s(\"~ ~ sd ~\").bank(\"RolandTR808\").gain(.5))],\n  [16, stack(brk, sub, pad)],\n  [8,  stack(pad, sub)]\n)",
      decode: [
        ["intro [8, pad + sub]", "une nappe et la basse, sans batterie."],
        ["montée [8, … caisse claire]", "quelques coups de caisse claire : la tension monte."],
        ["drop [16, brk + …]", "le break entre en plein."],
        ["const brk", "`break` est un mot réservé de JavaScript : on nomme la piste « brk »."],
      ],
      recap: {
        title: "Récap — Le drum & bass",
        columns: ["Brique", "Idée", "Strudel"],
        rows: [
          ["tempo", "rapide", "`setcpm(170/4)`"],
          ["breakbeat", "le break amen haché, réordonné", "`s(\"amen/4\").fit().chop(16).iter(4)`"],
          ["sub", "grave et rond", "`note(\"c1\").s(\"sine\")`"],
          ["reese", "deux dents de scie à 0,2 demi-ton d’écart", "`note(\"[24,24.2]\").s(\"sawtooth\")`"],
          ["half-time", "caisse claire sur le 3ᵉ temps", "à 170 BPM, on ressent 85"],
          ["structure", "intro, puis break", "`arrange([8, a], [16, b])`"],
        ],
      },
      exercise: "Change la tonalité de la nappe et de la basse (fa mineur : basse `note(\"[29,29.2]\")`, nappe `\"<Fm7 Db^7>\"`). Puis allonge le drop à 32 mesures.",
      free: "Fais ton drum & bass : une sub-basse bien grave (sinusoïde, ou reese désaccordée), le break amen haché et varié (`chop` et `iter`), et joue sur le [half-time](voc.structure.half-time-full-time) (caisse claire sur le 3ᵉ temps) pour le poids. Construis une intro atmosphérique qui débouche sur le break. Vise 170 à 174 BPM, et écoute la sub au casque.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m7chapitre4 = {
  module: 7,
  chapter: 'Trance / Psy-trance',
  title: 'Trance / Psy-trance',
  subtitle: "L'émotion par construction : supersaw, arc émotionnel et acide psy",
  flashs: [
    {
      id: '7.16',
      kicker: 'La même famille',
      title: 'Anatomie : trance vs psy-trance',
      concept:
        "Trance (~138–142 BPM) et psy-trance (~145+) : même famille. Un 4/4 driving, une basse roulante " +
        "sur le CONTRETEMPS, et le mineur émotionnel. La trance vise l'euphorie mélodique ; la psy, plus " +
        "sombre et rapide, vise l'hypnose acide.",
      code:
        'setcpm(140/4)\n' +
        '$: s("bd*4").bank("RolandTR909").gain(.9)\n' +
        '$: s("[~ oh]*4").bank("RolandTR909").gain(.3)\n' +
        '$: note("<a1 f1 c2 e1>").struct("~ x ~ x ~ x ~ x").s("sawtooth").lpf(900).decay(.1).sustain(.1).gain(.6)\n' +
        '$: chord("<Am F C E>").voicing().s("sawtooth").lpf(2200).attack(.05).release(.3).room(.4).gain(.35)',
      decode: [
        ['s("bd*4")', "le 4/4 driving, plus appuyé qu'en house."],
        ['[~ oh]*4', "le charley OUVERT sur le contretemps → le « tss » planant."],
        ['struct("~ x ~ x …")', "la basse roulante : elle joue APRÈS chaque kick (le contretemps)."],
        ['chord("<Am F C E>")', "une grille mineure émotionnelle (le E majeur ramène la tension)."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['trance', "~138–142 BPM, mélodique, euphorique."],
          ['psy-trance', "~145+ BPM, plus sombre, basse roulante, lead acide."],
          ['rolling bass', "la basse sur le contretemps, moteur des deux genres."],
        ],
      },
      exercise:
        "Monte le tempo à 146 et assombris la grille (chord(\"<Am F Dm E>\")) : tu glisses de la trance " +
        "lumineuse vers la psy plus tendue.",
    },

    {
      id: '7.17',
      kicker: 'Le mur de saws',
      title: 'Le supersaw : accords riches & layering',
      concept:
        "Le son emblématique de la trance, c'est le SUPERSAW : plusieurs dents-de-scie légèrement " +
        "désaccordées et empilées → un accord énorme, large, qui scintille. On l'obtient en superposant " +
        "une copie détunée avec superimpose().",
      code:
        'setcpm(140/4)\n' +
        '$: s("bd*4").bank("RolandTR909")\n' +
        '$: chord("<Am F C G>").voicing().superimpose(x=>x.add(note(0.15))).s("sawtooth").lpf(sine.range(800,4000).slow(8)).attack(.1).release(.4).room(.5).gain(.3)',
      decode: [
        ['superimpose(x=>x.add(note(0.15)))', "superpose une COPIE désaccordée de 0,15 demi-ton → le « gras » supersaw."],
        ['.voicing()', "les accords en notes posées (M2)."],
        ['lpf(sine.range(800,4000).slow(8))', "le filtre s'ouvre sur 8 mesures → l'accord grandit, euphorique."],
        ['room(.5)', "une grande réverbe → l'espace de stade."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['supersaw', "le son du Roland JP-8000 : 7 saws désaccordés (ici on en empile 2)."],
          ['layering', "empiler des copies légèrement différentes pour épaissir."],
          ['superimpose(f)', "garde l'original ET ajoute la copie transformée (M5)."],
        ],
      },
      exercise:
        "Empile une 2ᵉ couche : ajoute .superimpose(x=>x.add(note(0.3))) → 3 saws, encore plus large. " +
        "Trop, c'est combien ? Écoute où ça devient flou.",
      culture: {
        artist: 'System F',
        track: 'Out of the Blue',
        why:
          "la trance de 1999 à son sommet (Ferry Corsten) : le supersaw du JP-8000 en pleine gloire — l'accord scintille comme ton superimpose.",
      },
    },

    {
      id: '7.17b',
      kicker: "L'accord qui court",
      title: "arp : l'arpégiateur",
      concept:
        "L'autre signature trance : l'accord ÉGRENÉ note à note, vite — l'arpège. arp() prend ton accord " +
        "empilé et le déroule selon un motif d'indices : 0 = la note la plus grave, puis 1, 2… " +
        "L'arpégiateur des synthés, en une fonction.",
      code:
        'setcpm(140/4)\n' +
        '$: s("bd*4").bank("RolandTR909")\n' +
        '$: chord("<Am F C G>").voicing().arp("0 1 2 3").fast(2).s("sawtooth").decay(.15).sustain(.1).delay(.3).room(.4).gain(.4)',
      decode: [
        ['chord("<Am F C G>").voicing()', "la grille d'accords, comme d'habitude (M2)."],
        ['.arp("0 1 2 3")', "égrène l'accord du grave à l'aigu : note 0, 1, 2, 3 — un arpège montant."],
        ['.arp("0 [0,2] 1 2")', "le motif est de la mini-notation : crochets, silences et < > marchent."],
        ['.fast(2) + delay(.3)', "doublé de vitesse + écho → le mouvement perpétuel hypnotique de la trance."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['arpège', "les notes d'un accord jouées une par une au lieu d'ensemble."],
          ['arpégiateur (arp)', "le module des synthés qui le fait tout seul ; arpWith(f) pour un ordre calculé."],
          ['descendre', 'arp("3 2 1 0") — et "0 3 1 2" pour les motifs brisés.'],
        ],
      },
      exercise:
        'Essaie .arp("<[0 1 2 3] [3 2 1 0]>") : montée un cycle, descente le suivant. ' +
        "Puis enlève .fast(2) — l'arpège redevient calme, presque ambient.",
    },

    {
      id: '7.18',
      kicker: 'Le voyage',
      title: "L'arc émotionnel",
      concept:
        "La trance est LE genre de l'arc émotionnel. On installe un groove, puis on coupe tout pour un " +
        "BREAKDOWN mélodique noyé de réverbe (la vallée), on remonte avec un riser (le buildup), et tout " +
        "revient en CLIMAX, plus grand. C'est une histoire, pas une boucle.",
      code:
        'setcpm(140/4)\n' +
        'const drums = s("bd*4, [~ oh]*4").bank("RolandTR909")\n' +
        'const bass  = note("<a1 f1 c2 e1>").struct("~ x ~ x ~ x ~ x").s("sawtooth").lpf(900).decay(.1).sustain(.1).gain(.55)\n' +
        'const lead  = n("<0 2 4 7>*2").scale("A:minor").s("sawtooth").superimpose(x=>x.add(note(0.12))).lpf(3000).room(.5).gain(.35)\n' +
        'const pad   = chord("<Am F C E>").voicing().s("sawtooth").attack(.5).release(1).room(.8).gain(.3)\n' +
        'arrange(\n' +
        '  [16, stack(drums, bass, lead)],\n' +
        '  [16, stack(pad, lead.room(.8))],\n' +
        '  [8,  stack(bass, lead.lpf(saw.range(500,5000).slow(8)), s("white").hpf(saw.range(200,9000).slow(8)).gain(.22))],\n' +
        '  [16, stack(drums, bass, lead, pad.release(.4).room(.5))]\n' +
        ')',
      decode: [
        ['section 1 (groove)', "tout joue : drums + basse + lead. L'énergie de croisière."],
        ['section 2 (breakdown)', "plus de kick : juste le pad et le lead noyés de réverbe → l'émotion."],
        ['section 3 (buildup)', "un riser de bruit blanc + le filtre du lead qui monte → la tension."],
        ['section 4 (climax)', "tout revient, en plus grand → le sommet."],
      ],
      theory: {
        title: 'Les quatre temps de l\'arc',
        items: [
          ['breakdown', "on coupe la batterie → un moment suspendu, mélodique."],
          ['riser / uplifter', "un bruit blanc filtré qui monte annonce le retour."],
          ['climax', "le drop euphorique, tout au max."],
        ],
      },
      exercise:
        "Allonge le breakdown à 24 mesures et ralentis le riser (.slow(16)). " +
        "Plus l'attente est longue, plus le climax frappe fort.",
    },

    {
      id: '7.19',
      kicker: 'Le côté obscur',
      title: 'Psy-trance : LFO rapide, résonance haute',
      concept:
        "La psy-trance pousse la formule : plus rapide (>145 BPM), plus sombre, hypnotique. Sa signature : " +
        "la basse roulante en 16es ET un lead ACIDE — un filtre résonant balayé par un LFO RAPIDE. " +
        "C'est l'acid du M4, poussé à fond.",
      code:
        'setcpm(146/4)\n' +
        '$: s("bd*4").bank("RolandTR909").gain(.95)\n' +
        '$: note("[~ a1 a1 a1]*4").s("sawtooth").lpf(700).lpq(8).decay(.08).sustain(0).gain(.55)\n' +
        '$: note("a3*16").s("sawtooth").lpf(perlin.range(400,3500)).lpq(18).decay(.05).sustain(0).gain(.3)',
      decode: [
        ['setcpm(146/4)', "au-delà de 145 BPM → territoire psy."],
        ['note("[~ a1 a1 a1]*4")', "la basse roulante psy : un trou puis 3 notes par temps, sans fin."],
        ['note("a3*16")', "un lead très rapide (16 notes/mesure) → le filtre est lu 16× → ça squelch."],
        ['lpf(perlin.range()).lpq(18)', "LFO perlin RAPIDE + résonance HAUTE = le cri acide."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['rolling bass', "la basse en 16es qui ne s'arrête jamais → l'hypnose."],
          ['acid lead', "filtre résonant balayé (référence : le son TB-303, M4)."],
          ['perlin', "un LFO « organique » (aléatoire lisse) → un balayage moins mécanique."],
        ],
      },
      exercise:
        "Échange perlin contre sine.fast(2) : un balayage régulier au lieu d'organique. " +
        "Puis pousse lpq(25) : attention, ça crie — baisse le gain.",
    },

    {
      id: '7.20',
      kicker: 'Le projet',
      title: 'Projet : un build trance de 64 mesures',
      concept:
        "Le grand œuvre du genre : un build de 64 mesures qui raconte tout l'arc. Intro, montée, groove, " +
        "breakdown, buildup avec riser, climax. Des voix nommées (M6), un supersaw, et de la patience.",
      code:
        'setcpm(140/4)\n' +
        'const drums = s("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909")\n' +
        'const bass  = note("<a1 f1 c2 e1>").struct("~ x ~ x ~ x ~ x").s("sawtooth").lpf(900).decay(.1).sustain(.1).gain(.55)\n' +
        'const pad   = chord("<Am F C E>").voicing().superimpose(x=>x.add(note(0.13))).s("sawtooth").attack(.3).release(.6).room(.6).gain(.28)\n' +
        'const lead  = n("<0 2 4 7 9 7 4 2>").scale("A:minor").s("sawtooth").superimpose(x=>x.add(note(0.12))).lpf(3500).delay(.3).room(.5).gain(.3)\n' +
        'const riser = s("white").hpf(saw.range(200,9000).slow(16)).gain(.2)\n' +
        'arrange(\n' +
        '  [8,  drums],\n' +
        '  [8,  stack(drums, bass)],\n' +
        '  [16, stack(drums, bass, pad)],\n' +
        '  [16, stack(pad, lead.room(.8))],\n' +
        '  [8,  stack(bass, lead, riser)],\n' +
        '  [8,  stack(drums, bass, pad, lead)]\n' +
        ')',
      decode: [
        ['8+8+16+16+8+8', "= 64 mesures ≈ 1 min 50 à 140 BPM."],
        ['sections 1-3', "intro → +basse → +pad : le groove se construit."],
        ['section 4 (breakdown)', "plus de batterie : pad + lead noyés → l'émotion."],
        ['sections 5-6', "buildup (riser) → climax (tout, en grand)."],
      ],
      recap: {
        title: 'Récap 7.4 — La trance & la psy',
        columns: ['Brique', 'Idée', 'Strudel'],
        rows: [
          ['Driving 4/4', 'le moteur', 's("bd*4").bank("RolandTR909")'],
          ['Rolling bass', 'le contretemps', 'struct("~ x ~ x")'],
          ['Supersaw', 'accords gras', 'superimpose(x=>x.add(note(0.15)))'],
          ['Arc', 'build / break / climax', 'arrange([16,…])'],
          ['Riser', 'la montée', 's("white").hpf(saw.range())'],
          ['Psy', 'LFO rapide + lpq', 'lpf(perlin.range()).lpq(18)'],
        ],
      },
      exercise:
        "Fais la version psy de ce build : monte à 146, passe la basse en \"[~ a1 a1 a1]*4\", " +
        "et remplace le lead par un acide (lpf(perlin.range(400,3500)).lpq(18)).",
      free:
        "Fais ta trance : un 4/4 driving, une basse roulante sur le contretemps, des accords supersaw qui montent. " +
        "Surtout, raconte un ARC : groove → breakdown mélodique noyé de réverbe → montée avec riser → climax plus grand que tout. " +
        "Pour la psy : 146+, plus sombre, un lead acide. C'est le genre qui se construit pour faire vibrer le dancefloor.",
    },
  ],
};

export const m7chapitre5 = {
  module: 7,
  chapter: 'Ambient',
  title: 'Ambient',
  subtitle: "L'espace comme instrument : texture, lenteur, génération",
  flashs: [
    {
      id: "7.21",
      kicker: "Le temps s'étire",
      title: "Anatomie de l'ambient",
      concept: "L’[ambient](voc.culture.ambient) renverse tout : presque pas de rythme, une lenteur extrême, des textures qui évoluent longtemps, et un espace immense. Ici, le temps s’étire : une mesure dure dix secondes.",
      code: "setcpm(24/4)\n$: note(\"c2\").s(\"sine\").gain(.35).room(.5)\n$: chord(\"<Cm7 Ab^7>\").voicing().s(\"sawtooth\").lpf(900).attack(2).release(4).room(.85).roomsize(8).gain(.35)",
      decode: [
        ["setcpm(24/4)", "6 cycles par minute : une mesure dure 10 s."],
        ["note(\"c2\").s(\"sine\")", "un *drone* : une note grave tenue, le socle de la pièce."],
        ["attack(2).release(4)", "la nappe monte en 2 s et s’éteint en 4 s après chaque accord (voir [enveloppe](sol.enveloppe))."],
        ["room(.85).roomsize(8)", "une réverbération dont la traîne dure 8 s : l’espace devient l’instrument."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["ambient", "une musique de texture et d’atmosphère."],
          ["drone", "une note ou un accord tenu très longtemps."],
          ["lenteur", "le tempo bas laisse chaque son se déployer entièrement."],
        ],
      },
      exercise: "Descends encore : `setcpm(16/4)`. Allonge `attack(4).release(6)`. Le morceau cesse d’être un rythme pour devenir un lieu.",
      culture: {
        artist: "Brian Eno",
        track: "Ambient 1: Music for Airports (1/1)",
        why: "l'album qui a NOMMÉ le genre (sorti en 1979) : des boucles de durées inégales qui se décalent — « aussi ignorable qu'intéressante », disait Eno.",
      },
      rich: true,
    },

    {
      id: "7.22",
      kicker: "La nappe vivante",
      title: "Le drone & le pad génératif",
      concept: "Une nappe figée lasse vite. En ambient, elle ÉVOLUE : un filtre qui s’ouvre et se ferme très lentement, des notes qui sautent parfois d’une octave. C’est *génératif* : ça change sans que tu touches à rien.",
      code: "setcpm(24/4)\n$: note(\"c2,c3\").s(\"sawtooth\").lpf(sine.range(300,1200).slow(12)).lpq(3).room(.7).gain(.35)\n$: n(\"0 2 4 6\").scale(\"C:minor\").s(\"triangle\").slow(2).attack(1).release(3).room(.8).gain(.25).sometimesBy(.4, x=>x.add(note(12)))",
      decode: [
        ["note(\"c2,c3\")", "le drone, à l’octave : deux notes tenues."],
        ["lpf(sine.range(300,1200).slow(12))", "la coupure suit une vague sur 12 mesures, soit 2 minutes à ce tempo."],
        [".slow(2)", "le motif s’étale sur 2 mesures."],
        ["sometimesBy(.4, x=>x.add(note(12)))", "chaque note a 40 % de chances de monter d’une octave."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["évolution lente", "un réglage qui change sur des minutes, pas sur des secondes."],
          ["génératif", "des règles et du hasard dosé (voir [génératif](voc.aleatoire.generatif))."],
          ["pad", "une nappe d’accords tenus."],
        ],
      },
      exercise: "Ralentis la vague (`.slow(24)`) et élargis-la (`sine.range(200,2000)`). Laisse tourner deux minutes.",
      rich: true,
    },

    {
      id: "7.23",
      kicker: "Le hasard en gamme",
      title: "Hasard maîtrisé : toujours différent",
      concept: "L’ambient aime le hasard, mais MAÎTRISÉ : des notes tirées au sort dans une gamme (aucune ne peut être fausse) et trouées au hasard. La pièce change à chaque cycle, sans jamais sonner faux.",
      code: "setcpm(24/4)\n$: note(\"c2\").s(\"sine\").gain(.3)\n$: n(irand(8).segment(4)).seed(1).scale(\"C:minor\").s(\"triangle\").attack(1).release(4).room(.85).gain(.3).degradeBy(.4)\n$: n(\"0 3 5 7\").scale(\"C:minor\").s(\"sawtooth\").lpf(900).slow(3).sometimesBy(.5, x=>x.add(note(\"<0 7 12>\"))).room(.7).gain(.2)",
      decode: [
        ["irand(8).segment(4)", "4 degrés tirés au hasard par cycle, de 0 à 7."],
        [".seed(1)", "donne à `irand` un autre tirage que celui de `degradeBy`. Sans lui, les deux lisent le même nombre : mesuré dans le moteur, les degrés 0, 1 et 2 ne jouaient jamais, car `degradeBy` retirait justement les notes tirées en bas (voir [graine](voc.aleatoire.graine))."],
        [".scale(\"C:minor\")", "le hasard est contraint dans la gamme."],
        [".degradeBy(.4)", "chaque note a 40 % de chances d’être retirée : de l’air."],
        ["déterministe", "même code, même suite ; `ribbon` fige un fragment qui te plaît."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["hasard maîtrisé", "de l’aléatoire encadré par des règles (gamme, probabilités)."],
          ["irand / rand", "des nombres au hasard ; `.scale()` les rend justes."],
          ["degradeBy", "retire des événements au hasard (voir [degradeBy](fn.degradeBy))."],
        ],
      },
      exercise: "Ajoute `.ribbon(3, 4)` à la couche `irand` : elle rejoue en boucle les cycles 4 à 7. Essaie d’autres points de départ, garde celui que tu préfères.",
      rich: true,
    },

    {
      id: "7.23b",
      kicker: "Les engrenages",
      title: "Le polymètre : { a b, c d e }",
      concept: "Deux boucles de LONGUEURS différentes qui avancent au même pas : elles se décalent à chaque tour et ne se réalignent que bien plus tard. C’est le [polymètre](voc.rythme.polymetre), une astuce courante en ambient pour qu’une boucle ne se répète pas à l’identique.",
      code: "setcpm(24/4)\n$: note(\"c2\").s(\"sine\").gain(.3).room(.5)\n$: n(\"{0 4 2, 7 5 3 1}%4\").scale(\"C:minor\").s(\"triangle\").attack(.5).release(2).room(.8).gain(.3)",
      decode: [
        ["{0 4 2, 7 5 3 1}", "deux séquences de 3 et 4 notes, dans un même motif."],
        ["%4", "la vitesse commune : 4 pas par cycle pour les deux."],
        ["le décalage", "3 contre 4 : elles ne se réalignent que tous les 12 pas, soit 3 cycles."],
        ["polymeter(…)", "existe aussi en fonction."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["polymètre", "des séquences de longueurs différentes, au même pas."],
          ["vs la virgule", "`\"a b, c d e\"` étire chaque séquence sur UN cycle ; `{a b, c d e}` garde le même pas pour toutes."],
          ["%n", "fixe le nombre de pas par cycle."],
        ],
      },
      exercise: "Change les longueurs : `{0 4 2 5, 7 5 3}%4` (4 contre 3), puis `%3` ou `%8` pour la densité. Note au bout de combien de pas la figure se répète.",
      rich: true,
    },

    {
      id: "7.24",
      kicker: "L'espace-instrument",
      title: "Réverb, delay, granularité",
      concept: "En ambient, les effets ne décorent pas : ils COMPOSENT. Une très grande réverbération, un écho long, et la *granularité* (découper un son en grains très courts) transforment une simple texture en nuage sonore.",
      code: "setcpm(24/4)\n$: s(\"space\").chop(16).slow(2).delay(.6).delaytime(.375).delayfeedback(.6).room(.9).roomsize(10).orbit(2).gain(.3)\n$: note(\"c2\").s(\"sine\").room(.6).gain(.3)",
      decode: [
        ["s(\"space\").chop(16)", "un son d’ambiance de la banque, découpé en 16 grains."],
        [".delay(.6).delayfeedback(.6)", "des échos à 0,6, chacun gardant 60 % du précédent (voir [delay](fx.delay))."],
        [".room(.9).roomsize(10)", "une réverbération dont la traîne dure 10 s."],
        [".orbit(2)", "une réverbération et un écho séparés de ceux du drone, avec leurs propres réglages (voir [orbit](fx.orbit))."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["réverbération", "`room`, `roomsize`, `rlp` : la quantité, la durée et la couleur de la traîne."],
          ["écho", "`delay`, `delaytime`, `delayfeedback` : des répétitions rythmiques."],
          ["granularité", "`chop(n)` : des grains très courts, une texture vaporeuse."],
        ],
      },
      exercise: "Pousse `chop(32)` et `delayfeedback(.8)` : le grain se dissout. Le moteur plafonne le retour à 0,98, mais au-delà de 0,9 les échos s’accumulent vite : baisse le `gain` si besoin.",
      rich: true,
    },

    {
      id: "7.25",
      kicker: "Le tout dernier flash",
      title: "Projet final : une pièce ambient générative (~5 min)",
      concept: "Une pièce qui se compose toute seule, avec tout le parcours : un drone, des accords riches, du hasard dans une gamme, un espace immense et des couches séparées. Lance-la : elle change à chaque cycle.",
      code: "setcpm(20/4)\n$: note(\"c2\").s(\"sine\").gain(.3).room(.5)\n$: chord(\"<Cm7 Ab^7 Fm7 Gm7>\").voicing().superimpose(x=>x.add(note(0.1))).s(\"sawtooth\").lpf(sine.range(400,1600).slow(16)).attack(3).release(5).room(.85).roomsize(9).gain(.26)\n$: n(irand(8).segment(2)).seed(1).scale(\"C:minor\").s(\"triangle\").attack(1).release(4).delay(.6).delaytime(.5).delayfeedback(.5).room(.9).orbit(2).gain(.2).degradeBy(.5)\n$: s(\"space\").chop(16).slow(3).delay(.5).delayfeedback(.5).room(.9).orbit(3).gain(.16)\n$: n(\"<0 3 5 7 10 7 5 3>\").scale(\"C:minor\").s(\"sine\").slow(4).sometimesBy(.4, x=>x.add(note(12))).room(.8).gain(.16)",
      decode: [
        ["le drone", "une note grave tenue, le socle."],
        ["la nappe", "des accords de septième joués deux fois, la copie 0,1 demi-ton plus haut (`superimpose`) : deux dents de scie qui battent ; le filtre suit une vague sur 16 mesures."],
        ["les notes au hasard", "tirées dans la gamme et trouées : jamais deux cycles pareils. Le `.seed(1)` sépare le tirage des notes de celui des trous ; sans lui, `degradeBy(.5)` retirerait toutes les notes des degrés 0 à 3, la moitié grave (mesuré dans le moteur)."],
        ["l’espace et la mélodie", "des réverbérations sur des orbits séparées, et une mélodie lente qui saute parfois d’une octave."],
      ],
      recap: {
        title: "Récap — L’ambient",
        columns: ["Brique", "Idée", "Strudel"],
        rows: [
          ["lenteur", "tempo bas", "`setcpm(20/4)`"],
          ["drone", "une note tenue", "`note(\"c2\").s(\"sine\")`"],
          ["nappe qui évolue", "un filtre qui bouge lentement", "`.lpf(sine.range(400, 1600).slow(16))`"],
          ["hasard en gamme", "aucune note fausse", "`n(irand(8).segment(2)).seed(1).scale(\"C:minor\")`"],
          ["espace", "réverbération, écho", "`.room(.9)` · `.delay(.6)`"],
          ["grains", "un son haché en petits morceaux", "`s(\"space\").chop(16)`"],
        ],
      },
      exercise: "Approprie-toi la pièce : change la grille, la gamme (`C:dorian`), les taux de hasard. Puis laisse-la vraiment tourner cinq minutes.",
      free: "C’est la toute dernière leçon de Keymaker. Regarde le chemin : du premier `bd` au beat techno, à la trance, à ta guitare dans l’industrial, à la basse acid sculptée à la main, à la machine qui compose seule, aux morceaux complets, et maintenant à une pièce qui vit sans toi. Le code n’est plus un mur, c’est ton studio. Lance cette pièce et laisse-la se dérouler : elle change d’un cycle à l’autre, et pourtant, relancée, elle redonne exactement la même suite. Fais ta musique. Reviens piocher quand tu veux, appelle Sati si tu bloques. Merci pour le voyage, Felix.",
      rich: true,
      richRecap: true,
    },
  ],
};

/* Le Module 7 entier : la carte de ses 5 chapitres (un genre par chapitre). */
export const module7 = {
  id: 7,
  titre: 'Module 7 — Genres & Styles',
  title: 'Module 7',
  subtitle: 'Un morceau complet par genre : house, techno, D&B, trance, ambient',
  chapitres: [m7chapitre1, m7chapitre2, m7chapitre3, m7chapitre4, m7chapitre5],
};
