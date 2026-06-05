// Keymaker — contenu pédagogique du Module 1, Chapitre 1 « Premier contact ».
// Source de vérité : KEYMAKER_module1.md (Chapitre 1, flashs 1.1 à 1.5).
//
// Structure d'un flash :
//   id        : '1.x'
//   kicker    : court intitulé affiché au-dessus du titre
//   title     : titre du flash
//   concept   : 1 à 3 phrases (le « pourquoi »)
//   code      : code chargé dans l'éditeur Strudel
//   decode    : (optionnel) liste [code, explication] — le code décortiqué
//   theory    : (optionnel) { title, items: [terme, explication] } — solfège intégré
//   exercise  : objectif à faire dans l'éditeur
//   recap     : (optionnel) { title, columns:[...], rows:[[...]] } — table récap de fin de chapitre
//   free      : (optionnel) exercice libre de fin de chapitre
//
// Un chapitre « stub » (chapitres 3-5, pas encore rédigés en données) porte
// `locked: true` et des flashs réduits à { id, title } — assez pour la carte du Parcours.

export const chapitre1 = {
  module: 1,
  chapter: 'Premier contact',
  title: 'Premier contact',
  subtitle: 'Le live coding & le premier son',
  flashs: [
    {
      id: '1.1',
      kicker: 'Le premier son',
      title: 'Le live coding & le premier son',
      concept:
        "En live coding, tu écris du code et tu l'entends tout de suite. " +
        "Pas de compilation, pas d'export. Le code, c'est l'instrument.",
      code: 'sound("casio")',
      decode: [
        ['sound(...)', '« joue ce son ».'],
        ['"casio"', 'le nom du son, entre guillemets.'],
      ],
      exercise:
        'Lance sound("casio"), puis remplace « casio » par « metal » et relance. ' +
        'Tu viens de faire ta première boucle Run → modifier → rejouer.',
    },

    {
      id: '1.2',
      kicker: 'La boucle Run / Stop',
      title: 'La boucle Run / Stop',
      concept:
        'Deux gestes suffisent. Ctrl+Enter joue, et met à jour à chaud sans couper le son. ' +
        "Ctrl+. arrête. C'est ça, la boucle du live coding : écrire → jouer → modifier → rejouer.",
      code: 'sound("metal")',
      decode: [
        ['Ctrl + Enter', 'jouer / mettre à jour à chaud (sans couper le son).'],
        ['Ctrl + .', 'arrêter le son.'],
      ],
      exercise:
        'Joue le son, puis modifie-le pendant que ça tourne (« metal » → « casio ») et relance ' +
        'avec Ctrl+Enter. Tu entends le changement sans coupure. Termine avec Ctrl+. pour arrêter.',
    },

    {
      id: '1.3',
      kicker: 'La banque de sons',
      title: 'La banque de sons',
      concept:
        "Strudel embarque plein de sons prêts à l'emploi. " +
        'On change de son juste en changeant le nom entre les guillemets.',
      code: 'sound("insect")',
      decode: [
        ['"insect"', 'un son parmi des dizaines. Essaie aussi : wind, jazz, crow, space, numbers…'],
        ['1er chargement', "un petit silence peut arriver le temps que le son se télécharge. C'est normal."],
      ],
      exercise:
        'Essaie 4 sons différents (wind, jazz, crow, space…) et repère celui que tu préfères.',
    },

    {
      id: '1.4',
      kicker: 'Les sons de batterie',
      title: 'Les sons de batterie',
      concept:
        'Parmi ces sons, une vraie batterie est cachée. ' +
        'Chaque abréviation correspond à un élément du kit.',
      code: 'sound("bd hh sd oh")',
      theory: {
        title: 'Le kit de batterie',
        items: [
          ['bd', 'grosse caisse — bass drum / kick'],
          ['sd', 'caisse claire — snare'],
          ['hh', 'charleston — hihat'],
          ['oh', 'charleston ouvert — open hihat'],
          ['cp', 'clap'],
          ['rim', 'rimshot'],
          ['lt / mt / ht', 'toms (grave / médium / aigu)'],
          ['cr / rd', 'crash / ride'],
        ],
      },
      exercise:
        'Compose ta propre batterie à 4 sons en piochant dans la liste (par ex. bd sd hh cp).',
    },

    {
      id: '1.5',
      kicker: 'Variantes de son',
      title: 'Les variantes : :n et bank()',
      concept:
        "Un même nom de son contient souvent plusieurs échantillons. On en choisit un avec « : » " +
        'suivi d\'un numéro. Et on peut changer la « machine » entière avec bank().',
      code: 'sound("bd hh sd oh").bank("RolandTR909")',
      decode: [
        [':n', 'choisit l\'échantillon n — ex. sound("casio:1"). Rien après le nom = :0.'],
        ['.bank("RolandTR909")', 'rebranche toute la batterie sur une boîte à rythmes mythique (house/techno).'],
        ['Autres banques', 'RolandTR808, RolandTR707, AkaiLinn, RhythmAce.'],
      ],
      exercise:
        'Reprends ta batterie du flash 1.4 et colle-lui deux banques différentes ' +
        '(ex. RolandTR808 puis RolandTR707) pour entendre la différence.',
      free:
        'Tu tiens les briques du chapitre 1 : sound, le nom du son, :n et bank(). ' +
        'Amuse-toi : compose une batterie de 4 sons, change la banque, échange un échantillon avec :n. ' +
        "C'est ton tout premier instrument — bidouille-le sans crainte.",
    },
  ],
};

/* ---------------------------------------------------------------------------
   Chapitre 2 — « Le rythme » : la mini-notation (le cœur du module).
   Source de vérité : KEYMAKER_module1.md (Chapitre 2, flashs 2.1 à 2.7).
   --------------------------------------------------------------------------- */
export const chapitre2 = {
  module: 1,
  chapter: 'Le rythme',
  title: 'Le rythme',
  subtitle: 'La mini-notation, le langage rythmique',
  flashs: [
    {
      id: '2.1',
      kicker: 'Les séquences',
      title: "Les séquences : l'espace",
      concept:
        "Plusieurs sons séparés par des espaces, c'est une suite jouée dans l'ordre. " +
        'Chaque mot est un pas du cycle.',
      code: 'sound("bd hh sd hh")',
      decode: [
        ['espace', 'sépare les pas de la séquence — chaque mot est joué à son tour.'],
        ['surlignage', 'le son en cours est surligné dans le code pendant la lecture.'],
      ],
      exercise: 'Allonge la séquence à 6 ou 8 sons (ex. bd hh sd hh bd cp).',
    },

    {
      id: '2.2',
      kicker: 'Le cycle',
      title: 'Le cycle qui se remplit',
      concept:
        'Toute la séquence est compressée dans UN cycle. Donc plus tu mets de sons, ' +
        'plus chacun est court : ça va plus vite.',
      code: 'sound("bd bd hh bd rim bd hh bd")',
      theory: {
        title: 'Le vocabulaire de la mesure',
        items: [
          ['cycle', 'le pouls qui boucle ≈ une mesure (bar). Par défaut ~2 secondes.'],
          ['temps (beat)', "les pas réguliers à l'intérieur du cycle."],
          ['subdivision', 'découper un temps en plus petits morceaux (croches, doubles-croches).'],
        ],
      },
      exercise:
        'Compare une séquence de 4 sons et une de 8 — entends que la 2ᵉ va deux fois plus vite.',
    },

    {
      id: '2.3',
      kicker: 'Les silences',
      title: 'Les silences : - et ~',
      concept:
        'Le silence est une brique à part entière : il occupe un pas mais ne joue rien. ' +
        'Le vide fait partie du groove.',
      code: 'sound("bd hh - rim - bd hh rim")',
      decode: [
        ['-', 'un pas vide (silence).'],
        ['~', "identique à - : deux façons d'écrire un pas vide."],
      ],
      theory: {
        title: 'Côté solfège',
        items: [
          ['silence (rest)', 'en musique, un silence a une durée, exactement comme une note.'],
        ],
      },
      exercise: 'Prends une séquence pleine et « creuse » des silences pour créer un groove.',
    },

    {
      id: '2.4',
      kicker: 'Les sous-séquences',
      title: 'Les sous-séquences : [ ]',
      concept:
        'Des crochets regroupent plusieurs sons dans UN seul pas. Ils se partagent la place ' +
        'de ce pas, donc ils vont plus vite.',
      code: 'sound("bd [hh hh] sd [hh bd]")',
      decode: [
        ['[hh hh]', "tient dans le temps d'un seul pas → les deux hh vont deux fois plus vite."],
        ['[[ ]]', 'on peut imbriquer : sound("bd [[rim rim] hh] bd cp").'],
      ],
      exercise: 'Transforme un pas simple en [deux sons], puis essaie une imbrication [[ ]].',
    },

    {
      id: '2.5',
      kicker: 'La vitesse',
      title: 'La vitesse : * et /',
      concept:
        "« * » répète/accélère un élément, « / » l'étale sur plusieurs cycles. " +
        "C'est la paire vitesse.",
      code: 'sound("bd hh*2 rim hh*3")',
      decode: [
        ['hh*2', 'joue deux charlestons dans un seul pas.'],
        ['hh*8', 'un pas répété 8 fois — sound("hh*8").'],
        ['[bd sd]/2', "la paire bd sd s'étale sur 2 cycles (plus lent)."],
      ],
      theory: {
        title: 'Le pont magique : rythme → hauteur',
        items: [
          ['hh*32', 'pousse la vitesse très loin : sound("hh*32").'],
          [
            'hauteur = rythme très rapide',
            "le rythme devient si rapide qu'on entend une note. C'est le lien secret avec le chapitre 4.",
          ],
        ],
      },
      exercise:
        'Prends un charleston et fais-le *4, *8, *16, *32 — écoute le moment où le rythme devient une note.',
    },

    {
      id: '2.6',
      kicker: "L'alternance",
      title: "L'alternance : < >",
      concept:
        'Les chevrons jouent UN seul élément par cycle, en tournant. ' +
        'Idéal pour varier sans accélérer.',
      code: 'sound("<bd hh rim oh>")',
      decode: [
        ['<bd hh rim oh>', 'un son différent à chaque cycle, en boucle.'],
        [
          '[ ] vs < >',
          'les crochets compressent tout dans un cycle ; les chevrons répartissent sur plusieurs cycles.',
        ],
        ['<a b c>', 'équivaut à [a b c]/3.'],
        ['exemple', 'sound("bd sd, [~ <sd cp>]*2") — la caisse claire alterne avec un clap.'],
      ],
      exercise: 'Ajoute une variation à ta batterie avec < > sans changer le tempo.',
    },

    {
      id: '2.7',
      kicker: 'Le parallèle',
      title: 'Le parallèle : la virgule',
      concept:
        'La virgule joue plusieurs séquences EN MÊME TEMPS, superposées. ' +
        'Ton tout premier empilement !',
      code: 'sound("hh hh hh, bd casio")',
      decode: [
        [',', 'sépare des couches indépendantes, toutes calées sur le même cycle.'],
        [
          'vers le ch.5',
          "c'est la version « mini-notation » de l'empilement — le chapitre 5 généralisera avec stack et $:.",
        ],
      ],
      recap: {
        title: 'La table de la mini-notation',
        columns: ['Concept', 'Syntaxe', 'Exemple'],
        rows: [
          ['Séquence', 'espace', 'sound("bd sd hh")'],
          ['Silence', '- ou ~', 'sound("bd - sd -")'],
          ['Sous-séquence', '[ ]', 'sound("bd [hh hh] sd")'],
          ['Imbrication', '[[ ]]', 'sound("bd [[rim rim] hh]")'],
          ['Accélérer', '*', 'sound("hh*4")'],
          ['Ralentir', '/', 'sound("[bd sd]/2")'],
          ['Alternance', '< >', 'sound("<bd hh rim>")'],
          ['Parallèle', ',', 'sound("hh*4, bd sd")'],
        ],
      },
      exercise:
        'Superpose une ligne de charleston régulière et une ligne kick + snare → une vraie boucle de batterie.',
      free:
        'Tu tiens toute la mini-notation : séquence, silence, [ ], *, /, < > et la virgule. ' +
        'Construis une boucle de batterie de 8 pas avec au moins un silence, une sous-séquence ' +
        "et une couche parallèle. C'est ton premier vrai groove.",
    },
  ],
};

/* ---------------------------------------------------------------------------
   Chapitres 3 à 5 — contenu complet, transposé depuis KEYMAKER_module1.md
   lors de la tranche 2 du Chantier 3 (3 juin 2026).
   --------------------------------------------------------------------------- */
export const chapitre3 = {
  module: 1,
  chapter: 'Le pouls',
  title: 'Le pouls',
  subtitle: 'Le tempo & les cycles',
  flashs: [
    {
      id: '3.1',
      kicker: 'Le cycle',
      title: "C'est quoi un cycle ?",
      concept:
        "Le cycle est le pouls de Strudel. Tout ce que tu écris se répète à chaque cycle. " +
        "Par défaut : 30 cycles par minute, soit 1 cycle toutes les 2 secondes.",
      code: 'sound("bd sd")',
      theory: {
        title: 'Le vocabulaire du tempo',
        items: [
          ['cycle', "le pouls qui boucle ≈ une mesure (bar). Par défaut : 30 cpm = 2 secondes."],
          ['tempo', "la vitesse des cycles — le nombre de cycles par minute."],
          ['30 cpm', "la valeur par défaut de Strudel. Tu peux la changer à tout moment."],
        ],
      },
      exercise:
        'Joue sound("bd sd") et écoute la régularité de la boucle. ' +
        "Repère le « 1 » qui revient — c'est le début de chaque cycle.",
    },

    {
      id: '3.2',
      kicker: 'Régler le tempo',
      title: 'setcpm() : régler la vitesse',
      concept:
        "setcpm (cycles per minute) fixe le tempo global. " +
        "On l'écrit sur une ligne avant le pattern.",
      code: 'setcpm(45)\nsound("bd sd [- bd] sd")',
      decode: [
        ['setcpm(45)', "règle le tempo à 45 cpm — plus rapide que les 30 par défaut."],
        ['setcpm(90)', "monte encore plus vite — essaie 20, 45, 90 pour sentir la différence."],
        ['setcpm(20)', "ralentit la boucle. Le pattern reste identique, juste plus lent."],
      ],
      exercise:
        "Monte à setcpm(90), descends à setcpm(20). " +
        "Trouve le tempo qui groove le mieux pour ta batterie.",
    },

    {
      id: '3.3',
      kicker: 'cpm ↔ BPM',
      title: 'cpm ↔ BPM : le pont avec la musique',
      concept:
        "Les musiciens parlent en BPM (battements par minute), pas en cycles. " +
        "Le lien : on divise le BPM par le nombre de battements par cycle.",
      code: 'setcpm(90/4)\nsound("<bd hh rim hh>*8")',
      decode: [
        ['setcpm(90/4)', "90 BPM en mesure 4/4 — 4 temps par cycle. Strudel calcule 90÷4 = 22,5 cpm."],
        ['setcpm(120/4)', "120 BPM — tempo house classique."],
        ['setcpm(128/4)', "128 BPM — tempo techno typique."],
        ['setcps(x)', "existe aussi : cycles par seconde. setcpm(x) = setcps(x/60). On reste sur setcpm."],
      ],
      theory: {
        title: 'BPM et signature rythmique',
        items: [
          ['BPM', "battements par minute (beats per minute) — le tempo standard en musique."],
          ['4/4', "4 temps par mesure — la signature la plus courante en pop, rock et électro."],
          ['formule', "setcpm(BPM / temps_par_mesure). Ex. : setcpm(120/4) = 120 BPM en 4/4."],
        ],
      },
      recap: {
        title: 'Récap chapitre 3 — Le tempo',
        columns: ['Concept', 'Syntaxe', 'Exemple'],
        rows: [
          ['Cycle par défaut', '30 cpm (2 sec)', 'sound("bd sd")'],
          ['Régler le tempo', 'setcpm(n)', 'setcpm(45)'],
          ['Tempo musical', 'setcpm(BPM / beats)', 'setcpm(120/4)'],
        ],
      },
      exercise:
        "Règle une batterie house à setcpm(120/4) puis setcpm(128/4). " +
        "Entends la différence entre les deux tempos.",
    },
  ],
};

export const chapitre4 = {
  module: 1,
  chapter: 'La hauteur',
  title: 'La hauteur',
  subtitle: 'Les notes & les gammes',
  flashs: [
    {
      id: '4.1',
      kicker: 'Les notes',
      title: 'Jouer des notes avec des nombres',
      concept:
        "note(...) joue des hauteurs. Le plus simple : des nombres (numéros MIDI). " +
        "Plus le nombre est grand, plus c'est aigu.",
      code: 'note("48 52 55 59").sound("piano")',
      decode: [
        ['note("...")', "joue des hauteurs — comme sound, mais avec des notes plutôt que des samples."],
        ['48 52 55 59', "numéros MIDI : 48 = do grave, 60 = do central, 72 = do aigu."],
        ['.sound("piano")', "choisit le timbre — le son qui joue les notes."],
      ],
      exercise:
        "Change les nombres, essaie des décimales (55.5), écoute monter/descendre. " +
        "La mini-notation du chapitre 2 marche ici aussi (séquences, *, [ ]…).",
    },

    {
      id: '4.2',
      kicker: 'Les lettres',
      title: 'Les notes en lettres (le pont solfège)',
      concept:
        "On peut écrire les notes en lettres au lieu de nombres. " +
        "C'est le système anglais — le même que sur ta guitare.",
      code: 'note("c e g b").sound("piano")',
      theory: {
        title: 'Do-ré-mi ↔ C-D-E',
        items: [
          ['C', 'do'],
          ['D', 'ré'],
          ['E', 'mi'],
          ['F', 'fa'],
          ['G', 'sol'],
          ['A', 'la'],
          ['B', 'si'],
        ],
      },
      exercise:
        "Écris une « mélodie-mot » avec les lettres a–g. " +
        "Indice : c-a-f-e ☕ — quatre lettres qui forment un accord jazzy.",
    },

    {
      id: '4.3',
      kicker: 'Les octaves',
      title: 'Les octaves',
      concept:
        "La même note existe à plusieurs hauteurs. " +
        "Un numéro après la lettre choisit l'octave.",
      code: 'note("c2 e3 g4 b5").sound("piano")',
      decode: [
        ['c2', "do grave — le chiffre indique l'octave."],
        ['c5', "do aigu — même note, 3 octaves plus haut."],
        ['sans numéro', "Strudel choisit une octave par défaut (~4)."],
      ],
      theory: {
        title: "Côté solfège — l'octave",
        items: [
          ['octave', "l'intervalle entre une note et la même note deux fois plus aiguë (do → do suivant)."],
          ['sur la guitare', "12 cases plus haut = 1 octave plus aigu."],
        ],
      },
      exercise:
        "Joue la même mélodie en c3… puis en c4… pour entendre le saut d'octave.",
    },

    {
      id: '4.4',
      kicker: 'Dièses et bémols',
      title: 'Dièses et bémols (les touches noires)',
      concept:
        "Entre certaines notes il y a des notes intermédiaires : les dièses et les bémols. " +
        "Ce sont les touches noires du piano.",
      code: 'note("c c# d d# e").sound("piano")',
      decode: [
        ['#', "dièse (sharp) — monte d'un demi-ton. La touche noire à droite."],
        ['b', "bémol (flat) — descend d'un demi-ton. La touche noire à gauche."],
        ['c# = db', "même son, deux noms — enharmonie. Les deux marchent dans Strudel."],
      ],
      theory: {
        title: 'La gamme chromatique',
        items: [
          ['12 notes', "c, c#, d, d#, e, f, f#, g, g#, a, a#, b — les 12 notes de l'octave."],
          ['demi-ton', "le plus petit écart possible entre deux notes. Sur la guitare : 1 case."],
          ['gamme chromatique', "la succession des 12 demi-tons — toutes les notes sans exception."],
        ],
      },
      exercise:
        'Joue les 12 notes chromatiques de c à c : note("c c# d d# e f f# g g# a a# b c5").sound("piano").',
    },

    {
      id: '4.5',
      kicker: 'Durée des notes',
      title: 'La durée des notes : @ et !',
      concept:
        "Deux modificateurs pour sculpter la durée et la répétition d'une note.",
      code: 'note("c@3 eb").sound("gm_acoustic_bass")',
      decode: [
        ['c@3', "allonge (elongate) — c dure 3 unités, eb en dure 1."],
        ['c!3', "répète (replicate) — c joué 3 fois de suite, chacun d'une unité."],
        ['vs *', "* accélère dans un pas ; @ étire un pas ; ! duplique un pas. Trois rapports au temps."],
      ],
      exercise:
        "Prends une mélodie de 4 notes et allonge la première avec @3. " +
        "Puis remplace @ par ! — entends la différence.",
    },

    {
      id: '4.6',
      kicker: 'Les accords',
      title: 'Les accords (plusieurs notes à la fois)',
      concept:
        "La virgule vue au chapitre 2 sert aussi à jouer plusieurs notes en même temps — un accord.",
      code: 'note("[c,e,g]").sound("piano")',
      decode: [
        ['note("c e g")', "séquence — les 3 notes jouées l'une après l'autre."],
        ['note("[c,e,g]")', "accord — les 3 notes jouées EN MÊME TEMPS dans un seul pas."],
        ['[ , , ]', "la virgule à l'intérieur des crochets = empilement de hauteurs."],
      ],
      theory: {
        title: "Côté solfège — l'accord",
        items: [
          ['accord (chord)', "au moins 3 notes jouées ensemble. c-e-g = accord de do majeur."],
          ['construction', "la théorie complète (intervalles, renversements) arrive au Module 2."],
        ],
      },
      exercise:
        "Transforme une mélodie en accords avec [ , , ]. " +
        "Essaie [c,e,g] (majeur) puis [c,eb,g] (mineur) — entends la différence d'ambiance.",
    },

    {
      id: '4.7',
      kicker: 'Les gammes',
      title: 'Les gammes : n() + scale()',
      concept:
        "Trouver les bonnes notes, c'est dur. Une gamme fait le tri pour toi : " +
        "tu donnes des numéros de degré, elle choisit des notes qui sonnent bien ensemble.",
      code: 'setcpm(60)\nn("0 2 4 6").scale("C:minor").sound("piano")',
      decode: [
        ['n("0 2 4 6")', "degrés de la gamme — 0 = 1ère note, 1 = 2ème, etc."],
        ['.scale("C:minor")', "traduit les degrés en notes. C:minor = do mineur."],
        ['C:major', "do majeur — sonne joyeux."],
        ['A:minor', "la mineur — sonne grave/triste."],
        ['C:major:pentatonic', "pentatonique — le passe-partout du guitariste."],
      ],
      theory: {
        title: 'Côté solfège — la gamme',
        items: [
          ['gamme (scale)', "un ensemble de notes qui sonnent bien ensemble. N'importe quel degré sonne juste."],
          ['majeur', "sonne « joyeux » ou « ouvert »."],
          ['mineur', "sonne « grave » ou « triste »."],
          ['pentatonique', "5 notes — très utilisée en blues et rock. Aucune fausse note possible."],
        ],
      },
      recap: {
        title: 'Récap chapitre 4 — La hauteur',
        columns: ['Concept', 'Syntaxe', 'Exemple'],
        rows: [
          ['Note (nombre)', 'note', 'note("48 52 55")'],
          ['Note (lettre)', 'note', 'note("c e g")'],
          ['Octave', 'cN', 'note("c2 c3 c4")'],
          ['Dièse / bémol', '# / b', 'note("c# db")'],
          ['Allonger', '@', 'note("c@3 e")'],
          ['Répéter', '!', 'note("c!3 e")'],
          ['Accord', '[ , ]', 'note("[c,e,g]")'],
          ['Gamme', 'n + scale', 'n("0 2 4").scale("C:minor")'],
        ],
      },
      exercise:
        "Garde les mêmes numéros et change juste la gamme " +
        "(C:major → C:minor → C:major:pentatonic) pour entendre l'ambiance changer.",
      free:
        "Tu tiens toutes les briques de la hauteur : note, lettres, octaves, dièses/bémols, @ !, accords et gammes. " +
        "Écris une mélodie de 8 notes dans une gamme mineure, " +
        "avec au moins une note allongée et un accord.",
    },
  ],
};

export const chapitre5 = {
  module: 1,
  chapter: "L'assemblage",
  title: "L'assemblage",
  subtitle: 'Empiler les patterns',
  flashs: [
    {
      id: '5.1',
      kicker: 'Le problème',
      title: 'Le problème : tout jouer en même temps',
      concept:
        "Jusqu'ici, une ligne = un pattern. Mais une vraie boucle a plusieurs couches simultanées : " +
        "batterie + basse + mélodie. Comment les faire tourner ensemble ?",
      code: 'sound("hh hh hh, bd casio")',
      decode: [
        [',', "la virgule empile deux couches dans la mini-notation."],
        ['limite', "avec 3 lignes longues, ça devient vite illisible. Il faut mieux — c'est stack()."],
      ],
      exercise:
        "Essaie d'empiler 3 séquences longues avec des virgules. " +
        "Constate que c'est difficile à lire — c'est précisément le besoin que stack() va résoudre.",
    },

    {
      id: '5.2',
      kicker: 'stack()',
      title: 'stack() : empiler proprement',
      concept:
        "stack() empile plusieurs patterns complets, séparés par des virgules, " +
        "chacun sur sa propre ligne. Lisible et extensible.",
      code: 'stack(\n  sound("bd*4").bank("RolandTR909"),\n  sound("hh*8"),\n  note("c2 eb2 g2 c3").sound("gm_acoustic_bass")\n)',
      decode: [
        ['stack(...)', "chaque argument est un pattern indépendant, tous calés sur le même cycle."],
        ['ajouter/retirer', "il suffit d'ajouter ou d'enlever une ligne. Pas besoin de tout réécrire."],
      ],
      exercise:
        "Pars d'une batterie dans stack() et ajoute une couche de basse. " +
        "Modifie les deux couches séparément.",
    },

    {
      id: '5.3',
      kicker: '$: et _$:',
      title: '$: : la notation moderne',
      concept:
        "Strudel propose un raccourci plus souple : préfixer chaque pattern par $:. " +
        "Pas besoin de tout envelopper dans une fonction.",
      code: '$: sound("bd*4, [~ sd]*2").bank("RolandTR909")\n$: note("c2 eb2 g2 c3").sound("gm_acoustic_bass")\n$: n("0 2 4 6").scale("C:minor").sound("piano")',
      decode: [
        ['$:', "chaque ligne $: est une couche indépendante — toutes tournent en parallèle."],
        ['_$:', "mute une couche sans l'effacer. Astuce live : _$: désactive, $: réactive."],
      ],
      exercise:
        "Monte 3 couches en $:, puis mute/réactive la mélodie avec _$:. " +
        "C'est le geste de base du live coding multi-couches.",
    },

    {
      id: '5.4',
      kicker: 'Bilan du module',
      title: 'Bilan : assembler les briques',
      concept:
        "Toutes les briques du Module 1 réunies : batterie, tempo et notes en un seul empilement. " +
        "Pas encore un morceau — une démonstration que tout s'emboîte.",
      code: 'setcpm(120/4)\n$: sound("bd*4, [~ cp]*2, [~ hh]*4").bank("RolandTR909")\n$: note("<c2 ab1 f1 g1>*2").sound("gm_acoustic_bass")\n$: n("0 2 <4 5> 2").scale("C:minor").sound("piano")',
      decode: [
        ['setcpm(120/4)', "tempo house : 120 BPM en 4/4 (ch.3)."],
        ['bd*4, [~ cp]*2, [~ hh]*4', "batterie 3 couches avec parallèle et sous-séquences (ch.1-2)."],
        ['<c2 ab1 f1 g1>*2', "basse en alternance d'accords (ch.2 + ch.4)."],
        ['n("0 2 <4 5> 2").scale("C:minor")', "mélodie en gamme mineure avec alternance (ch.4)."],
      ],
      exercise:
        "Joue cet empilement, écoute-le. " +
        "Puis identifie la brique (chapitre) derrière chaque ligne.",
      free:
        "Tu tiens toutes les briques du Module 1. " +
        "Reparts de cet empilement et bidouille-le : change la gamme, le tempo, " +
        "ajoute une couche, mute-en une avec _$:. C'est ça, le live coding.",
    },
  ],
};

/* Le module entier : la carte des 5 chapitres (les briques du Module 1). */
export const module1 = {
  id: 1,
  titre: 'Module 1 — Strudel & Live Coding',
  title: 'Module 1',
  subtitle: 'Les briques de base du live coding',
  chapitres: [chapitre1, chapitre2, chapitre3, chapitre4, chapitre5],
};

/* ===========================================================================
   MODULE 2 — Solfège & Théorie musicale (Chantier 7).
   Le solfège enseigné À TRAVERS Strudel : chaque concept est immédiatement
   audible. Pont permanent avec la guitare (Felix est guitariste).
   Toutes les fonctions Strudel utilisées sont vérifiées contre strudel.cc
   (note, .add(), n()+scale(), triades [0,4,7], chord().voicing()).
   5 chapitres, 25 flashs. Même format de flash que le Module 1.
   =========================================================================== */

export const m2chapitre1 = {
  module: 2,
  chapter: 'Les 12 notes',
  title: 'Les 12 notes',
  subtitle: 'La matière première : hauteur, ton & octave',
  flashs: [
    {
      id: '2.1',
      kicker: 'La hauteur',
      title: 'La hauteur : grave ↔ aigu',
      concept:
        "Une note, c'est d'abord une hauteur (pitch) : grave ou aigu. " +
        "Plus la vibration est rapide, plus c'est aigu. note() joue des hauteurs — comme au Module 1.",
      code: 'note("c3 e3 g3 c4").sound("piano")',
      decode: [
        ['c3 → c4', "on monte du grave vers l'aigu."],
        ['le chiffre', "l'octave : plus il est grand, plus c'est aigu."],
        ['a4 = 440 Hz', "le « la » des accordeurs — la fréquence étalon de toute la musique."],
      ],
      theory: {
        title: 'Côté solfège — la hauteur',
        items: [
          ['hauteur (pitch)', "à quel point un son est grave ou aigu."],
          ['fréquence', "le nombre de vibrations par seconde (Hz). Doubler la fréquence = monter d'une octave."],
          ['sur la guitare', "corde grave à vide = mi (E) ; plus tu montes le manche, plus c'est aigu."],
        ],
      },
      exercise:
        'Joue note("c3 c4 c5") : la même note, de plus en plus aiguë. ' +
        "C'est le saut d'octave — on y revient au flash 2.5.",
    },

    {
      id: '2.2',
      kicker: "L'alphabet musical",
      title: 'Sept lettres qui bouclent',
      concept:
        'Toute la musique occidentale tient avec 7 lettres : A B C D E F G. ' +
        "Après G, on repart à A, une octave plus haut. Un alphabet qui tourne en boucle.",
      code: 'note("a b c d e f g a").sound("piano")',
      decode: [
        ['système anglais', 'Strudel utilise les lettres A–G, comme sur ta guitare et les grilles d\'accords.'],
        ['do = C', "le solfège français dit « do », l'anglais dit « C ». Même note."],
      ],
      theory: {
        title: 'Do-ré-mi ↔ C-D-E',
        items: [
          ['C', 'do'],
          ['D', 'ré'],
          ['E', 'mi'],
          ['F', 'fa'],
          ['G', 'sol'],
          ['A', 'la'],
          ['B', 'si'],
          ['la boucle', 'après si (B) on retombe sur do (C) — la même note, plus haute.'],
        ],
      },
      exercise:
        'Joue les 7 lettres dans l\'ordre, puis à l\'envers : note("g f e d c b a"). ' +
        'Repère où ta voix « voudrait » revenir à la maison.',
    },

    {
      id: '2.3',
      kicker: "L'unité de mesure",
      title: 'Demi-ton & ton',
      concept:
        'Toutes les distances en musique se comptent en demi-tons. Le demi-ton (semitone) ' +
        'est le plus petit écart possible. Deux demi-tons = un ton.',
      code: 'note("c c# d d# e").sound("piano")',
      decode: [
        ['c → c#', 'un demi-ton — la plus petite marche.'],
        ['c → d', 'un ton = deux demi-tons.'],
        ['sur la guitare', '1 case = 1 demi-ton. Une case de plus = un demi-ton plus haut.'],
      ],
      theory: {
        title: 'Côté solfège',
        items: [
          ['demi-ton (semitone)', '1 case de guitare ; 2 touches voisines au piano.'],
          ['ton (whole tone)', 'deux demi-tons ; 2 cases de guitare.'],
          ['pourquoi ça compte', 'gammes et accords ne sont que des recettes de tons et demi-tons.'],
        ],
      },
      exercise:
        'Compare note("c c# d d# e") (demi-tons collés) et note("c d e") (tons). ' +
        'Entends que la 2ᵉ « saute » davantage.',
    },

    {
      id: '2.4',
      kicker: 'Les touches noires',
      title: 'Dièses, bémols & le piège mi-fa / si-do',
      concept:
        'Entre la plupart des lettres se cache une note intermédiaire : la touche noire. ' +
        "Mais entre mi-fa (E-F) et si-do (B-C), il n'y en a pas : elles sont déjà à un demi-ton.",
      code: 'note("c c# d d# e f f# g g# a a# b c5").sound("piano")',
      decode: [
        ['#', 'dièse (sharp) : +1 demi-ton.'],
        ['b', 'bémol (flat) : −1 demi-ton.'],
        ['c# = db', 'même son, deux noms : c\'est l\'enharmonie.'],
        ['pas de e# ni b#', 'mi→fa et si→do sont déjà collés — aucune touche noire entre eux.'],
      ],
      theory: {
        title: 'Les 12 notes (la gamme chromatique)',
        items: [
          ['12 demi-tons', 'C C# D D# E F F# G G# A A# B, puis on reboucle sur C.'],
          ['7 blanches + 5 noires', 'le piano le rend visible : 7 touches blanches, 5 noires.'],
          ['enharmonie', 'c# (dièse de do) et db (bémol de ré) = la même hauteur.'],
        ],
      },
      exercise:
        'Compte les notes de c à c5 : tu dois en trouver 12. ' +
        "Vérifie qu'il n'y a pas de touche noire entre e-f ni entre b-c.",
    },

    {
      id: '2.5',
      kicker: "L'octave",
      title: "L'octave : la même note, plus haut",
      concept:
        'Après 12 demi-tons, on retombe sur la même note, deux fois plus aiguë : ' +
        "c'est l'octave. Voilà pourquoi do revient à chaque octave — la boucle de l'alphabet.",
      code: 'note("c2 c3 c4 c5").sound("piano")',
      decode: [
        ['c2 → c3', 'une octave = 12 demi-tons = +1 au chiffre.'],
        ['même lettre', 'octave = même note, « identique mais plus haute ».'],
        ['guitare', '12 cases plus haut sur une corde = la même note une octave au-dessus (12ᵉ case).'],
      ],
      theory: {
        title: "Côté solfège — l'octave",
        items: [
          ['octave', "l'écart entre une note et sa répétition (do → do suivant). Rapport de fréquence 2:1."],
          ['équivalence d\'octave', "deux notes à l'octave portent le même nom car l'oreille les entend « pareilles »."],
        ],
      },
      recap: {
        title: 'Récap chapitre 1 — Les 12 notes',
        columns: ['Concept', 'Repère', 'Exemple'],
        rows: [
          ['Alphabet', '7 lettres A–G', 'note("a b c d e f g")'],
          ['Demi-ton', '1 case de guitare', 'note("c c#")'],
          ['Ton', '2 demi-tons', 'note("c d")'],
          ['Dièse / bémol', '# = +1 · b = −1', 'note("c# db")'],
          ['Chromatique', '12 demi-tons', 'note("c c# d d# e f f# g g# a a# b")'],
          ['Octave', '12 demi-tons, même nom', 'note("c3 c4")'],
        ],
      },
      exercise:
        'Joue la gamme chromatique de c3 à c4, puis de c4 à c5. ' +
        'Tu viens de parcourir deux octaves, demi-ton par demi-ton.',
      free:
        'Tu tiens la matière première : 12 notes, le ton et le demi-ton, l\'octave. ' +
        "Bidouille : une suite de demi-tons, puis saute d'une octave avec le chiffre. " +
        "La distance entre deux notes — l'intervalle — c'est tout le chapitre 2.",
    },
  ],
};

export const m2chapitre2 = {
  module: 2,
  chapter: 'Les intervalles',
  title: 'Les intervalles',
  subtitle: 'La distance entre deux notes',
  flashs: [
    {
      id: '2.6',
      kicker: 'La distance',
      title: "L'intervalle : la distance entre deux notes",
      concept:
        "Un intervalle, c'est l'écart entre deux notes, mesuré en demi-tons. " +
        "C'est LA brique de la théorie : gammes, accords et harmonie ne sont que des collections d'intervalles.",
      code: 'note("c e").sound("piano")',
      decode: [
        ['c puis e', 'on entend la distance entre les deux (ici 4 demi-tons).'],
        ['mélodique', "l'une après l'autre = intervalle mélodique."],
        ['harmonique', 'en même temps note("[c,e]") = intervalle harmonique.'],
      ],
      theory: {
        title: "Côté solfège — l'intervalle",
        items: [
          ['intervalle (interval)', "l'écart entre deux hauteurs."],
          ['mesure', 'en demi-tons (le plus simple), et avec un nom (seconde, tierce, quinte…).'],
          ['guitare', 'deux notes, leur écart en cases = leur intervalle.'],
        ],
      },
      exercise:
        'Joue note("[c,e]") (ensemble) puis note("c e") (à la suite). ' +
        "Même intervalle, deux façons de l'entendre.",
    },

    {
      id: '2.7',
      kicker: "Compter l'écart",
      title: 'Mesurer un intervalle en demi-tons',
      concept:
        "Chaque intervalle a un nombre de demi-tons fixe. Pour le voir, on part d'une note " +
        'et on ajoute des demi-tons avec .add() — la fonction qui décale une hauteur.',
      code: 'note("0 2 4 5 7".add("60")).sound("piano")',
      decode: [
        ['note("0 2 4 5 7")', 'des écarts en demi-tons depuis 0.'],
        ['.add("60")', '60 = do central (MIDI) ; on décale tout vers lui → do ré mi fa sol.'],
        ['raisonner par intervalles', "monter de tant de demi-tons depuis une note, c'est exactement ça."],
      ],
      theory: {
        title: 'Les intervalles de base (en demi-tons)',
        items: [
          ['seconde mineure', '1 (c → c#)'],
          ['seconde majeure', '2 (c → d) = 1 ton'],
          ['tierce mineure', '3 (c → eb)'],
          ['tierce majeure', '4 (c → e)'],
          ['quarte juste', '5 (c → f)'],
          ['quinte juste', '7 (c → g)'],
          ['octave', '12 (c → c)'],
        ],
      },
      exercise:
        'Change le 7 final en 12 : note("0 2 4 5 12".add("60")). ' +
        "La dernière note saute à l'octave. Essaie d'autres écarts.",
    },

    {
      id: '2.8',
      kicker: 'Le couple clé',
      title: 'Tierce majeure vs mineure : joyeux ou triste',
      concept:
        'Un seul demi-ton sépare la tierce majeure (4 demi-tons) de la mineure (3). ' +
        "Ce demi-ton décide à lui seul si ça sonne joyeux (majeur) ou triste (mineur). " +
        "L'intervalle le plus expressif de toute la musique.",
      code: 'note("[c,e] [c,eb]").sound("piano")',
      decode: [
        ['[c,e]', 'tierce majeure : 4 demi-tons. Ouvert, joyeux.'],
        ['[c,eb]', 'tierce mineure : 3 demi-tons. Sombre, triste.'],
        ['un seul demi-ton', "e → eb : c'est tout ce qui change l'humeur."],
      ],
      theory: {
        title: 'Côté solfège — la tierce',
        items: [
          ['tierce (third)', "l'intervalle qui colore l'harmonie."],
          ['majeure = 4 demi-tons', 'do-mi. Ambiance « lumineuse ».'],
          ['mineure = 3 demi-tons', 'do-mib. Ambiance « grave ».'],
          ['guitare', "majeur → mineur = descendre la note aiguë d'1 case."],
        ],
      },
      exercise:
        'Alterne note("[c,e]") et note("[c,eb]") plusieurs fois. ' +
        "Ferme les yeux : l'humeur bascule avec un seul demi-ton.",
    },

    {
      id: '2.9',
      kicker: 'La plus solide',
      title: 'La quinte juste : le power chord',
      concept:
        "La quinte juste (7 demi-tons) est l'intervalle le plus stable après l'octave. " +
        'Ni joyeux ni triste : juste solide. C\'est le power chord du rock — fondamentale + quinte, sans tierce.',
      code: 'note("[c,g] [f,c5] [g,d5]").sound("sawtooth").lpf(800)',
      decode: [
        ['[c,g]', 'quinte juste : 7 demi-tons. Le son « puissant », neutre.'],
        ['power chord', 'guitare saturée : la corde grave + sa quinte. Pas de tierce → ni majeur ni mineur.'],
        ['.sound("sawtooth").lpf(800)', 'une dent de scie filtrée — un son plus « électrique ».'],
      ],
      theory: {
        title: 'Côté solfège — la quinte',
        items: [
          ['quinte juste (perfect fifth)', '7 demi-tons. Très consonant (rapport de fréquences 3:2).'],
          ['quarte juste', '5 demi-tons — la quinte « à l\'envers ».'],
          ['consonance', 'des intervalles qui sonnent stables, posés (octave, quinte, quarte).'],
        ],
      },
      exercise:
        'Enchaîne les power chords : note("[c,g] [f,c5] [g,d5] [c,g]"). ' +
        'Tu tiens déjà une base de riff rock.',
    },

    {
      id: '2.10',
      kicker: 'La carte',
      title: "Tous les intervalles d'un coup d'œil",
      concept:
        "Voici les intervalles d'une octave, du plus petit au plus grand. " +
        'Pas besoin de les apprendre par cœur : tu les reconnaîtras à l\'oreille avec la pratique.',
      code: 'note("<0 1 2 3 4 5 6 7 8 9 10 11 12>".add("60")).sound("piano")',
      decode: [
        ['<0 … 12>', "chaque cycle ajoute un demi-ton : on monte tout l'escalier des intervalles."],
        ['6 = triton', 'le « diable en musique » : 6 demi-tons, instable, dissonant.'],
        ['12 = octave', 'retour à la même note, en haut.'],
      ],
      theory: {
        title: 'Côté solfège — consonance & dissonance',
        items: [
          ['consonant', 'stable, reposé : octave (12), quinte (7), quarte (5), tierces (3-4).'],
          ['dissonant', 'tendu, « veut bouger » : secondes (1-2), septièmes (10-11), triton (6).'],
          ['la musique', "c'est jouer avec cette tension ↔ détente."],
        ],
      },
      recap: {
        title: 'Récap chapitre 2 — Les intervalles',
        columns: ['Intervalle', 'Demi-tons', 'Exemple'],
        rows: [
          ['Seconde mineure', '1', 'note("[c,c#]")'],
          ['Seconde majeure', '2', 'note("[c,d]")'],
          ['Tierce mineure', '3', 'note("[c,eb]")'],
          ['Tierce majeure', '4', 'note("[c,e]")'],
          ['Quarte juste', '5', 'note("[c,f]")'],
          ['Triton', '6', 'note("[c,f#]")'],
          ['Quinte juste', '7', 'note("[c,g]")'],
          ['Octave', '12', 'note("[c,c5]")'],
        ],
      },
      exercise:
        'Joue le tableau en harmonique (note("[c,x]")) : ' +
        'repère lesquels te semblent « posés » (consonants) et lesquels « tendus » (dissonants).',
      free:
        'Tu tiens les intervalles : la distance en demi-tons, la tierce qui colore, la quinte qui solidifie. ' +
        "Invente un mini-riff avec uniquement des quintes et une tierce majeure. " +
        'Au chapitre 3, on enchaîne les intervalles pour fabriquer des gammes.',
    },
  ],
};

export const m2chapitre3 = {
  module: 2,
  chapter: 'Les gammes',
  title: 'Les gammes',
  subtitle: 'Majeure, mineure & pentatonique',
  flashs: [
    {
      id: '2.11',
      kicker: 'La recette',
      title: 'La gamme majeure : T-T-S-T-T-T-S',
      concept:
        'Une gamme (scale) est une suite de notes choisies dans l\'octave. ' +
        'La majeure suit une recette fixe : ton-ton-demi · ton-ton-ton-demi. ' +
        "C'est le « do ré mi fa sol la si do » que tout le monde connaît.",
      code: 'note("c d e f g a b c5").sound("piano")',
      decode: [
        ['c d e f g a b c5', 'do majeur : 7 notes + le retour à do.'],
        ['T-T-S-T-T-T-S', 'les écarts : do→ré→mi (ton, ton), mi→fa (demi), puis 3 tons, si→do (demi).'],
        ['les 2 demi-tons', 'toujours entre mi-fa et si-do. C\'est la signature du majeur.'],
      ],
      theory: {
        title: 'Côté solfège — la gamme majeure',
        items: [
          ['gamme (scale)', 'une sélection de notes qui « vont bien ensemble ».'],
          ['majeur', 'la recette T-T-S-T-T-T-S. Sonne ouvert, lumineux.'],
          ['transposable', "la même recette depuis n'importe quelle note donne une gamme majeure."],
        ],
      },
      exercise:
        'Rejoue do majeur, puis recommence depuis sol : note("g a b c5 d5 e5 f#5 g5"). ' +
        'Le f# apparaît pour garder la recette — c\'est sol majeur.',
    },

    {
      id: '2.12',
      kicker: 'Les degrés',
      title: 'Les degrés : n() + scale()',
      concept:
        'Plutôt que chercher les notes à la main, on numérote celles de la gamme : les degrés. ' +
        "n() donne les degrés, scale() choisit la gamme. (Croisé au Module 1 — ici on comprend pourquoi.)",
      code: 'n("0 1 2 3 4 5 6 7").scale("C:major").sound("piano")',
      decode: [
        ['n("0")', 'le 1er degré (la tonique). n("7") = l\'octave.'],
        ['.scale("C:major")', 'traduit chaque degré en note de do majeur.'],
        ['rester dans la gamme', "tant que tu y restes, aucune note ne « sonne faux »."],
      ],
      theory: {
        title: 'Côté solfège — les degrés',
        items: [
          ['degré', 'la place d\'une note dans la gamme (I à VII).'],
          ['tonique (I)', 'la note « maison », où la mélodie se repose.'],
          ['dominante (V)', 'le 5ᵉ degré, plein de tension qui « appelle » la tonique.'],
          ['sensible (VII)', 'le 7ᵉ degré, à un demi-ton sous la tonique : il « tire » vers elle.'],
        ],
      },
      exercise:
        'Joue n("0 2 4 2 0").scale("C:major") : tu montes par tierces et tu redescends. ' +
        'Finis sur 0 — entends le repos sur la tonique.',
    },

    {
      id: '2.13',
      kicker: "L'autre couleur",
      title: 'La gamme mineure : T-S-T-T-S-T-T',
      concept:
        'La gamme mineure (naturelle) a sa propre recette, avec une tierce mineure dès le départ. ' +
        "D'où sa couleur grave, mélancolique. L'autre grande famille avec le majeur.",
      code: 'n("0 1 2 3 4 5 6 7").scale("C:minor").sound("piano")',
      decode: [
        ['C:minor', 'do mineur naturel : la recette T-S-T-T-S-T-T.'],
        ['3ᵉ degré abaissé', 'le mib (au lieu de mi) → tierce mineure → ambiance triste.'],
        ['même n(), autre scale', 'garde tes degrés, change la gamme : la mélodie « tourne au mineur ».'],
      ],
      theory: {
        title: 'Côté solfège — majeur vs mineur',
        items: [
          ['mineur naturel', 'aussi appelé mode éolien (aeolian).'],
          ['ce qui change', 'les 3ᵉ, 6ᵉ et 7ᵉ degrés sont abaissés d\'un demi-ton par rapport au majeur.'],
          ["l'oreille", 'majeur = joyeux / ouvert · mineur = grave / intérieur.'],
        ],
      },
      exercise:
        'Reprends n("0 2 4 2 0") en .scale("C:minor"). ' +
        'Compare au C:major du flash précédent : même dessin, humeur opposée.',
    },

    {
      id: '2.14',
      kicker: 'Le raccourci',
      title: 'La relative mineure : mêmes notes, autre maison',
      concept:
        'Chaque gamme majeure a une « relative mineure » qui utilise exactement les mêmes notes — ' +
        'mais part du 6ᵉ degré. Do majeur et la mineur, ce sont les mêmes touches blanches : ' +
        'seule la note-maison change.',
      code: 'n("0 2 4 6 4 2 0").scale("<C:major A:minor>").sound("piano")',
      decode: [
        ['C:major ↔ A:minor', 'mêmes 7 notes (touches blanches), tonique différente.'],
        ['<…>', 'le cycle alterne les deux gammes (Module 1) — entends que les notes restent les mêmes.'],
        ['le 6ᵉ degré', 'la (A) est le 6ᵉ degré de do majeur → c\'est sa relative mineure.'],
      ],
      theory: {
        title: 'Côté solfège — relatives',
        items: [
          ['relative mineure', "la mineure qui partage l'armure (mêmes dièses/bémols) d'une majeure."],
          ['la trouver', 'descends de 3 demi-tons depuis la tonique majeure (C → A), ou monte au 6ᵉ degré.'],
          ['guitare', 'une même position de pentatonique sert pour les deux — d\'où sa magie.'],
        ],
      },
      exercise:
        'Joue la même phrase en C:major puis A:minor (le code le fait seul). ' +
        "Mêmes notes, mais l'une « finit chez do », l'autre « chez la ».",
    },

    {
      id: '2.15',
      kicker: 'Le passe-partout',
      title: 'La pentatonique : 5 notes, zéro fausse note',
      concept:
        'La pentatonique retire les 2 notes les plus « tendues » de la gamme : ' +
        'restent 5 notes qui sonnent bien dans presque tout. ' +
        "L'arme secrète du guitariste pour improviser sans se tromper.",
      code: 'setcpm(80/4)\nn("0 1 2 3 4 5 6 7").scale("C:major:pentatonic").sound("piano")',
      decode: [
        ['C:major:pentatonic', 'do pentatonique majeure : 5 notes par octave.'],
        ['les : à la place des espaces', '"major:pentatonic" = « major pentatonic » (nom de gamme à 2 mots).'],
        ['C:minor:pentatonic', 'la version mineure — le son blues / rock par excellence.'],
      ],
      theory: {
        title: 'Côté solfège — la pentatonique',
        items: [
          ['pentatonique', 'gamme de 5 notes (penta = cinq).'],
          ['majeure', 'la gamme majeure sans les 4ᵉ et 7ᵉ degrés (les plus tendus).'],
          ['mineure', 'la mineure sans les 2ᵉ et 6ᵉ. Le terrain de jeu du blues.'],
          ['guitare', 'la fameuse « boîte » pentatonique — une position, mille solos.'],
        ],
      },
      recap: {
        title: 'Récap chapitre 3 — Les gammes',
        columns: ['Gamme', 'Recette / repère', 'Exemple'],
        rows: [
          ['Majeure', 'T-T-S-T-T-T-S', 'n("0 2 4").scale("C:major")'],
          ['Mineure (nat.)', 'T-S-T-T-S-T-T', 'n("0 2 4").scale("C:minor")'],
          ['Relative mineure', '6ᵉ degré du majeur', 'C:major ↔ A:minor'],
          ['Penta majeure', '5 notes', 'scale("C:major:pentatonic")'],
          ['Penta mineure', '5 notes (blues)', 'scale("A:minor:pentatonic")'],
        ],
      },
      exercise:
        'Improvise ! Joue des degrés au hasard : n("0 3 2 4 3 1 0").scale("C:minor:pentatonic"). ' +
        "Tout sonne juste — c'est ça, la pentatonique.",
      free:
        'Tu tiens les gammes : majeure, mineure, relatives, et la pentatonique passe-partout. ' +
        'Improvise une mélodie de 8 degrés en pentatonique mineure sur un tempo lent. ' +
        'Au chapitre 4, on empile ces notes pour faire des accords.',
    },
  ],
};

export const m2chapitre4 = {
  module: 2,
  chapter: 'Les accords',
  title: 'Les accords',
  subtitle: 'Empiler les tierces',
  flashs: [
    {
      id: '2.16',
      kicker: 'Empiler',
      title: 'Un accord : empiler des tierces',
      concept:
        "Un accord (chord), c'est au moins 3 notes ensemble. La recette de base : " +
        'pars d\'une note (la fondamentale), saute la suivante, prends celle d\'après, re-saute, prends la suivante. ' +
        'Tu empiles des tierces : 1 - 3 - 5.',
      code: 'note("[c,e,g]").sound("piano").room(.4)',
      decode: [
        ['[c,e,g]', 'do - mi - sol : la fondamentale (c), sa tierce (e), sa quinte (g).'],
        ['1-3-5', 'les degrés 1, 3 et 5 de la gamme : une note sur deux.'],
        ['.room(.4)', "un peu de réverbération pour entendre l'accord « respirer »."],
      ],
      theory: {
        title: 'Côté solfège — la triade',
        items: [
          ['triade (triad)', 'accord de 3 notes : fondamentale + tierce + quinte.'],
          ['fondamentale (root)', "la note qui donne son nom à l'accord (c → accord de do)."],
          ['empilement de tierces', 'la logique de presque tous les accords occidentaux.'],
        ],
      },
      exercise:
        'Construis l\'accord depuis ré : note("[d3,f#3,a3]") (ré majeur). ' +
        'Puis depuis sol : note("[g3,b3,d4]"). Tu fabriques des accords à la main.',
    },

    {
      id: '2.17',
      kicker: 'Les 4 couleurs',
      title: 'Majeur, mineur, diminué, augmenté',
      concept:
        "Selon l'écart entre les notes empilées, la triade prend 4 couleurs. " +
        'Tout se joue sur la 3ᵉ et la 5ᵉ. En demi-tons depuis la fondamentale : 4 recettes.',
      code: 'note("[0,4,7] [0,3,7] [0,3,6] [0,4,8]".add("60")).sound("piano").room(.4)',
      decode: [
        ['[0,4,7]', 'majeur : tierce majeure (4) + quinte juste (7). Joyeux.'],
        ['[0,3,7]', 'mineur : tierce mineure (3) + quinte juste. Triste.'],
        ['[0,3,6]', 'diminué : tierce mineure + quinte diminuée (6). Tendu, inquiet.'],
        ['[0,4,8]', 'augmenté : tierce majeure + quinte augmentée (8). Étrange, suspendu.'],
        ['.add("60")', 'on part des demi-tons (0 = do) et on transpose au do central.'],
      ],
      theory: {
        title: 'Côté solfège — les triades (en demi-tons)',
        items: [
          ['majeur', '0 - 4 - 7'],
          ['mineur', '0 - 3 - 7'],
          ['diminué', '0 - 3 - 6'],
          ['augmenté', '0 - 4 - 8'],
          ['la clé', 'la tierce (3 ou 4) décide majeur/mineur ; la quinte (6/7/8) ajoute la tension.'],
        ],
      },
      exercise:
        'Joue les 4 triades à la suite (le code les enchaîne). ' +
        'Mets un mot sur chaque couleur : joyeux, triste, inquiet, étrange.',
    },

    {
      id: '2.18',
      kicker: 'La famille',
      title: "Les 7 accords d'une gamme",
      concept:
        "Sur chaque degré d'une gamme, on bâtit une triade en restant dans la gamme. " +
        'En do majeur : 7 accords — certains majeurs, certains mineurs — toujours dans le même ordre.',
      code: 'note("[c3,e3,g3] [d3,f3,a3] [e3,g3,b3] [f3,a3,c4] [g3,b3,d4] [a3,c4,e4] [b3,d4,f4]").sound("piano").room(.4)',
      decode: [
        ['I — do majeur', '[c,e,g]'],
        ['ii — ré mineur', '[d,f,a]'],
        ['iii — mi mineur', '[e,g,b]'],
        ['IV — fa majeur', '[f,a,c]'],
        ['V — sol majeur', '[g,b,d] (la dominante)'],
        ['vi — la mineur', '[a,c,e] (la relative !)'],
        ['vii° — si diminué', '[b,d,f]'],
      ],
      theory: {
        title: "Côté solfège — les degrés d'accords",
        items: [
          ['notation', 'majuscule = majeur (I IV V) · minuscule = mineur (ii iii vi) · ° = diminué (vii°).'],
          ["l'ordre est fixe", 'en majeur : I-ii-iii-IV-V-vi-vii°. Toujours.'],
          ['les piliers', 'I, IV et V (majeurs) sont les accords les plus utilisés.'],
        ],
      },
      exercise:
        'Joue seulement I, IV et V : note("[c3,e3,g3] [f3,a3,c4] [g3,b3,d4]"). ' +
        'Tu entends déjà des centaines de chansons.',
    },

    {
      id: '2.19',
      kicker: 'Les 3 accords magiques',
      title: 'I-IV-V : la progression qui joue tout',
      concept:
        'Trois accords — I, IV, V — suffisent pour accompagner une foule de chansons ' +
        '(rock, blues, folk, pop). La « progression du feu de camp ». ' +
        'Ajoute le vi (relative mineure) et tu tiens la pop entière.',
      code:
        'setcpm(100/4)\n' +
        '$: note("<[c4,e4,g4] [a3,c4,e4] [f3,a3,c4] [g3,b3,d4]>").sound("piano").room(.5)\n' +
        '$: sound("bd*4, [~ sd]*2").bank("RolandTR909")',
      decode: [
        ['I-vi-IV-V', 'do - lam - fa - sol : la progression pop la plus célèbre (« 4 chords »).'],
        ['<…>', 'un accord par cycle (alternance vue au Module 1).'],
        ['+ batterie en $:', 'on superpose une batterie (Module 1) → un vrai début d\'accompagnement.'],
      ],
      theory: {
        title: 'Côté solfège — la cadence',
        items: [
          ['cadence', "un enchaînement d'accords qui crée tension puis repos."],
          ['V → I', 'la cadence parfaite : la dominante (V) « appelle » la tonique (I).'],
          ['I-IV-V', 'les 3 accords majeurs de la gamme — le squelette du blues et du rock.'],
        ],
      },
      exercise:
        'Change l\'ordre dans les < > : essaie do-fa-sol-do, puis lam-fa-do-sol. ' +
        'Chaque ordre raconte une autre histoire.',
    },

    {
      id: '2.20',
      kicker: 'Le raccourci magique',
      title: 'chord().voicing() : écrire comme une grille',
      concept:
        "Écrire chaque note à la main, c'est formateur mais long. Strudel sait lire les symboles " +
        "d'une grille (C, Am, F, G…) et trouver tout seul de belles positions. C'est chord(...).voicing().",
      code: 'setcpm(100/4)\nchord("<C Am F G>").voicing().sound("piano").room(.5)',
      decode: [
        ['chord("C Am F G")', 'les symboles d\'une grille : C = do majeur, Am = la mineur, F, G.'],
        ['.voicing()', 'Strudel choisit les notes et enchaîne en douceur (voice leading).'],
        ['symboles', 'C majeur · Cm mineur · C7 (septième) · C^7 (majeur 7) · Co (diminué).'],
      ],
      theory: {
        title: "Côté solfège — la grille d'accords",
        items: [
          ['grille (lead sheet)', "la notation des musiciens : juste les symboles d'accords au-dessus des paroles."],
          ['voicing', "la façon d'arranger les notes d'un accord (lequel en bas, lequel doublé…)."],
          ['voice leading', 'enchaîner les accords avec le moins de saut possible — plus fluide à l\'oreille.'],
        ],
      },
      recap: {
        title: 'Récap chapitre 4 — Les accords',
        columns: ['Accord', 'Demi-tons / symbole', 'Exemple'],
        rows: [
          ['Majeur', '0-4-7', 'note("[c,e,g]")'],
          ['Mineur', '0-3-7', 'note("[c,eb,g]")'],
          ['Diminué', '0-3-6', 'note("[c,eb,gb]")'],
          ['Augmenté', '0-4-8', 'note("[c,e,g#]")'],
          ['Grille', 'C Am F G', 'chord("<C Am F G>").voicing()'],
          ['Cadence', 'I-IV-V', 'note("[c,e,g] [f,a,c5] [g,b,d5]")'],
        ],
      },
      exercise:
        'Change la grille : chord("<Am F C G>").voicing(). ' +
        'Puis des accords de 4 sons : chord("<C^7 Am7 Dm7 G7>").voicing() — la couleur « jazz ».',
      free:
        'Tu tiens les accords : empiler des tierces, les 4 couleurs, les accords d\'une gamme, ' +
        'la cadence I-IV-V, et le raccourci chord().voicing(). ' +
        'Monte une progression de 4 accords + une batterie en $:. ' +
        'Au chapitre 5, on relie tout ça à la tonalité.',
    },
  ],
};

export const m2chapitre5 = {
  module: 2,
  chapter: 'La tonalité',
  title: 'La tonalité',
  subtitle: 'La maison des notes',
  flashs: [
    {
      id: '2.21',
      kicker: 'La maison',
      title: 'La tonalité : la note-maison et sa famille',
      concept:
        "Une tonalité (key), c'est une gamme + sa note-maison (la tonique) + les accords qui en découlent. " +
        '« En do majeur » veut dire : ces 7 notes, ces 7 accords, et tout se repose sur do.',
      code:
        'setcpm(100/4)\n' +
        '$: chord("<C F G C>").voicing().sound("piano").room(.5)\n' +
        '$: n("0 2 4 2").scale("C:major").sound("triangle").gain(.6)',
      decode: [
        ['tonalité de do majeur', 'gamme de do majeur + accords de do majeur + repos sur do.'],
        ['accords + mélodie', 'la grille et la mélodie partagent la même tonalité → cohérent.'],
        ['repos final', 'finir sur C (accord) et 0 (tonique) = sensation « d\'être rentré ».'],
      ],
      theory: {
        title: 'Côté solfège — la tonalité',
        items: [
          ['tonalité (key)', 'le « centre de gravité » d\'un morceau : sa gamme et sa tonique.'],
          ['majeure ou mineure', 'une tonalité est majeure (do majeur) ou mineure (la mineur).'],
          ['centre tonal', 'la note vers laquelle tout « veut » revenir.'],
        ],
      },
      exercise:
        'Joue le code, puis enlève le dernier C de la grille (finis sur G). ' +
        "Ça reste « en suspens » — on n'est pas rentré à la maison.",
    },

    {
      id: '2.22',
      kicker: 'Pourquoi des dièses',
      title: 'Les armures : pourquoi certaines tonalités ont des dièses',
      concept:
        'Pour garder la recette majeure (T-T-S-T-T-T-S) depuis une autre note, ' +
        "il faut parfois ajouter des dièses ou des bémols. La liste de ces altérations, " +
        "c'est l'armure (key signature) de la tonalité.",
      code: 'note("g a b c5 d5 e5 f#5 g5").sound("piano")',
      decode: [
        ['sol majeur', 'pour respecter la recette, le 7ᵉ degré doit être f# (pas f).'],
        ['1 dièse', "l'armure de sol majeur = un seul dièse (f#)."],
        ['fa majeur', 'lui, a besoin d\'un bémol (bb) → armure d\'1 bémol.'],
      ],
      theory: {
        title: "Côté solfège — l'armure",
        items: [
          ['armure (key signature)', 'les dièses/bémols affichés en début de portée, valables tout le morceau.'],
          ['do majeur', '0 altération (que des touches blanches).'],
          ['ordre des dièses', 'fa do sol ré la mi si (F C G D A E B).'],
          ['ordre des bémols', 'l\'inverse : si mi la ré sol do fa.'],
        ],
      },
      exercise:
        'Joue fa majeur : note("f a bb c5 d5 e5 f5") avec le bb obligatoire. ' +
        'Compare à do majeur (aucune altération).',
    },

    {
      id: '2.23',
      kicker: 'La carte des tonalités',
      title: 'Le cycle des quintes',
      concept:
        'Range les 12 tonalités par quintes (7 demi-tons) : do → sol → ré → la… ' +
        "À chaque pas, on ajoute un dièse. Dans l'autre sens (par quartes), on ajoute un bémol. " +
        'LA carte qui relie toutes les tonalités.',
      code: 'setcpm(120/4)\nchord("<C G D A>").voicing().sound("piano").room(.5)',
      decode: [
        ['C → G → D → A', 'chaque accord est une quinte au-dessus du précédent.'],
        ['+1 dièse par pas', 'C (0), G (1#), D (2#), A (3#)… jusqu\'à 7.'],
        ['sens inverse', 'C → F → Bb → Eb… ajoute un bémol à chaque pas.'],
      ],
      theory: {
        title: 'Côté solfège — le cycle des quintes',
        items: [
          ['cycle des quintes (circle of fifths)', 'les 12 tonalités disposées en cercle, de quinte en quinte.'],
          ['à quoi ça sert', "trouver l'armure d'une tonalité et ses accords « voisins »."],
          ['voisins', 'des tonalités proches sur le cycle partagent presque les mêmes notes → transitions douces.'],
        ],
      },
      exercise:
        'Joue chord("<C G D A E>").voicing() : tu montes le cycle des quintes. ' +
        'Chaque accord est « voisin » du précédent — la montée sonne naturelle.',
    },

    {
      id: '2.24',
      kicker: 'Déménager',
      title: 'Transposer : changer de tonalité',
      concept:
        "Transposer, c'est déplacer tout un morceau vers le grave ou l'aigu en gardant les mêmes rapports. " +
        'La mélodie est identique, juste plus haute ou plus basse. ' +
        "Sur la guitare, c'est exactement ce que fait un capo.",
      code: 'note("0 4 7 4".add("<60 65 67>")).sound("piano")',
      decode: [
        ['note("0 4 7 4")', 'un motif do-mi-sol-mi (en demi-tons depuis 0).'],
        ['.add("<60 65 67>")', 'chaque cycle on transpose : do (60), puis fa (+5 → 65), puis sol (+7 → 67).'],
        ['+5 / +7', 'monter d\'une quarte / d\'une quinte = changer de tonalité.'],
        ['capo', 'le capo de guitare fait pareil : il monte tout de N demi-tons (= N cases).'],
      ],
      theory: {
        title: 'Côté solfège — la transposition',
        items: [
          ['transposer (transpose)', 'décaler toutes les notes du même intervalle.'],
          ['à quoi ça sert', 'adapter une chanson à une voix, ou simplifier les accords à la guitare.'],
          ['dans la gamme', 'Strudel sait aussi transposer en degrés : .scaleTranspose(n).'],
        ],
      },
      exercise:
        'Change .add("<60 65 67>") en .add("<60 55 53>") : tu transposes vers le grave. ' +
        'Même mélodie, registre plus bas.',
    },

    {
      id: '2.25',
      kicker: 'Tout ensemble',
      title: 'Bilan : un morceau dans une tonalité',
      concept:
        'Réunissons tout : un tempo (M1), une batterie (M1), une basse sur les fondamentales, ' +
        'des accords par grille, et une mélodie en pentatonique — le tout dans UNE tonalité (la mineur). ' +
        "C'est un vrai bout de morceau.",
      code:
        'setcpm(120/4)\n' +
        '$: sound("bd*4, [~ cp]*2, [~ hh]*4").bank("RolandTR909")\n' +
        '$: note("<a1 f1 c2 g2>").sound("sawtooth").lpf(700).gain(.7)\n' +
        '$: chord("<Am F C G>").voicing().sound("piano").gain(.5).room(.4)\n' +
        '$: n("0 2 4 2 <3 5>").scale("A:minor:pentatonic").sound("triangle").gain(.5)',
      decode: [
        ['setcpm(120/4)', 'tempo house, 120 BPM en 4/4 (M1 ch.3).'],
        ['la basse <a1 f1 c2 g2>', 'la fondamentale de chaque accord (Am-F-C-G), bien grave.'],
        ['chord(...).voicing()', 'les accords au piano, enchaînés en douceur.'],
        ['A:minor:pentatonic', 'la mélodie reste dans la tonalité → tout sonne ensemble.'],
      ],
      theory: {
        title: 'Ce que tu viens de relier',
        items: [
          ['Module 1', 'tempo, mini-notation, batterie, stack / $:.'],
          ['Module 2', 'gamme, intervalles, accords, tonalité.'],
          ['le fil rouge', 'la tonalité : basse, accords et mélodie la partagent → cohérence.'],
        ],
      },
      recap: {
        title: 'Récap chapitre 5 — La tonalité',
        columns: ['Concept', 'Repère', 'Exemple'],
        rows: [
          ['Tonalité', 'gamme + tonique + accords', '« en la mineur »'],
          ['Armure', 'dièses/bémols de la tonalité', 'sol majeur = 1#'],
          ['Cycle des quintes', 'la carte des 12 tonalités', 'chord("<C G D A>")'],
          ['Transposer', 'tout décaler d\'un intervalle', '.add("<60 65 67>")'],
          ['Basse d\'accords', 'la fondamentale', 'note("<a1 f1 c2 g2>")'],
        ],
      },
      exercise:
        'Change de tonalité : grille chord("<Em C G D>") et mélodie .scale("E:minor:pentatonic"). ' +
        'Tout reste cohérent — tu as juste déménagé.',
      free:
        'Tu tiens le Module 2 entier : les 12 notes, les intervalles, les gammes, les accords et les tonalités — ' +
        'relié à ta guitare et joué dans Strudel. Reprends le morceau ci-dessus et fais-le tien : ' +
        'change la grille, la gamme, le tempo, ajoute ou mute une couche avec _$:. ' +
        "C'est toi le Keymaker, maintenant.",
    },
  ],
};

/* Le Module 2 entier : la carte de ses 5 chapitres. */
export const module2 = {
  id: 2,
  titre: 'Module 2 — Solfège & Théorie musicale',
  title: 'Module 2',
  subtitle: 'Le solfège, entendu dans Strudel',
  chapitres: [m2chapitre1, m2chapitre2, m2chapitre3, m2chapitre4, m2chapitre5],
};

/* ===========================================================================
   MODULE 3 — Connexion Guitare (Chantier 8).
   La guitare de Felix reliée à la théorie (Module 2) et au live coding (Module 1).
   Le manche comme carte ; chaque concept est immédiatement AUDIBLE avec de
   vraies guitares (banque General MIDI). Toutes les fonctions sont vérifiées
   contre strudel.cc (juin 2026) : gm_*_guitar_*, .add() (multi-pas à gauche,
   scalaire à droite), .clip() (palm mute), chord().voicing(), n()+voicing()
   (arpège), .struct() (grattage), .distort()/.phaser()/.delay().
   5 chapitres, 25 flashs (3.1 → 3.25). Même format de flash que M1/M2.
   =========================================================================== */

export const m3chapitre1 = {
  module: 3,
  chapter: 'Le manche & l\'accordage',
  title: 'Le manche & l\'accordage',
  subtitle: 'La guitare comme carte des notes',
  flashs: [
    {
      id: '3.1',
      kicker: 'La guitare entre en jeu',
      title: 'Ta guitare, dans le code',
      concept:
        "Jusqu'ici tu jouais piano, sawtooth, triangle… Strudel embarque aussi de vraies " +
        'guitares (banque General MIDI). On choisit le timbre avec .s("gm_…").',
      code: 'note("e3 a3 d4 g4").s("gm_acoustic_guitar_nylon").room(.3)',
      decode: [
        ['gm_acoustic_guitar_nylon', 'guitare classique (cordes nylon). Le « gm_ » = banque General MIDI.'],
        ['.s("…")', 'choisit le timbre — comme .sound(). Ici, une guitare.'],
        ['.room(.3)', "un peu de réverbération pour le corps de l'instrument."],
      ],
      theory: {
        title: 'Les guitares disponibles',
        items: [
          ['gm_acoustic_guitar_nylon', 'classique, douce (cordes nylon).'],
          ['gm_acoustic_guitar_steel', 'folk, plus claire (cordes acier).'],
          ['gm_electric_guitar_clean', 'électrique propre.'],
          ['gm_distortion_guitar', 'électrique saturée (rock).'],
        ],
      },
      exercise:
        'Joue le code, puis échange le son contre gm_acoustic_guitar_steel, puis ' +
        'gm_electric_guitar_clean. Mêmes notes, trois guitares.',
    },

    {
      id: '3.2',
      kicker: "L'accordage",
      title: 'Les 6 cordes à vide : E A D G B E',
      concept:
        'Une guitare standard a 6 cordes, accordées de la plus grave à la plus aiguë : ' +
        'Mi La Ré Sol Si Mi — en lettres E A D G B E. « À vide » = jouée sans poser de doigt.',
      code: 'note("e2 a2 d3 g3 b3 e4").s("gm_acoustic_guitar_steel").room(.3)',
      decode: [
        ['e2 … e4', 'de la 6ᵉ corde (grave) à la 1ʳᵉ (aiguë).'],
        ['les chiffres', "l'octave (M2) : e2 grave, e4 deux octaves plus haut."],
        ['E A D G B E', "le moyen mnémo : « Et Adam Donna Genèse Bien Évidemment »."],
      ],
      theory: {
        title: "Côté solfège — l'accordage",
        items: [
          ['cordes à vide', 'les 6 notes de référence : E A D G B E.'],
          ['lettres = M2', 'ce sont les lettres A–G du Module 2, appliquées à ta guitare.'],
          ['intervalles', 'entre cordes voisines : une quarte (5 demi-tons)… sauf G→B : une tierce (4).'],
        ],
      },
      exercise:
        "Joue les 6 cordes lentement, du grave à l'aigu, puis à l'envers : " +
        'note("e4 b3 g3 d3 a2 e2").',
    },

    {
      id: '3.3',
      kicker: 'Les cases',
      title: "Monter d'une case = +1 demi-ton",
      concept:
        "Poser un doigt une case plus haut monte la note d'un demi-ton (M2). " +
        "En montant la corde de Mi grave case par case, on parcourt la gamme chromatique.",
      code: 'note("e2 f2 f#2 g2 g#2 a2").s("gm_acoustic_guitar_steel").clip(1.2)',
      decode: [
        ['e2 → a2', 'cases 0 à 5 de la corde de Mi grave : E F F# G G# A.'],
        ['1 case', '= 1 demi-ton = la plus petite marche (M2).'],
        ['case 5 = a2', 'la même note que la corde de La à vide ! Un repère clé.'],
      ],
      theory: {
        title: 'Côté solfège — la case',
        items: [
          ['demi-ton', '1 case = le plus petit pas (M2).'],
          ['ton', '2 cases = 1 ton.'],
          ['repère', "case 5 d'une corde ≈ la corde suivante à vide (sauf G→B : case 4)."],
        ],
      },
      exercise:
        'Fais pareil sur la corde de La : note("a2 a#2 b2 c3 c#3 d3"). ' +
        'Tu montes la corde de La, case par case — et tu retombes sur Ré (corde suivante).',
    },

    {
      id: '3.4',
      kicker: "Le repère d'or",
      title: 'La 12ᵉ case : l\'octave',
      concept:
        'Douze cases = douze demi-tons = une octave (M2). La 12ᵉ case d\'une corde donne ' +
        'donc la même note que la corde à vide, en plus aigu. C\'est le grand repère du manche.',
      code: 'note("e2 e3, a2 a3").s("gm_electric_guitar_clean").clip(2)',
      decode: [
        ['e2 → e3', 'corde de Mi à vide puis 12ᵉ case : même note, +1 octave.'],
        ['la virgule', "joue les deux cordes en parallèle (M1) — entends l'octave."],
        ['.clip(2)', 'laisse les notes sonner deux fois plus longtemps.'],
      ],
      theory: {
        title: "Côté solfège — l'octave sur le manche",
        items: [
          ['12 cases', '= 1 octave = rapport de fréquence 2:1 (M2).'],
          ['repères', 'les points du manche : cases 3, 5, 7, 9, et double point à la 12ᵉ.'],
        ],
      },
      exercise:
        'Compare note("e2 e3") (12 cases sur une corde) et ' +
        'note("e2 a2 d3 g3 b3 e4") : deux façons de monter sur le manche.',
    },

    {
      id: '3.5',
      kicker: "Mettre d'accord",
      title: "S'accorder : la méthode de la 5ᵉ case",
      concept:
        "Pour accorder sans accordeur : la 5ᵉ case d'une corde donne la note de la corde " +
        "suivante à vide. Exception : pour la corde de Sol (G), c'est la 4ᵉ case qui donne Si (B).",
      code: 'note("a2 a2, e3 e3").s("gm_acoustic_guitar_nylon").clip(1.5)',
      decode: [
        ['5ᵉ case du Mi grave', '= A → doit sonner comme la corde de La à vide.'],
        ['a2 = a2', 'les deux doivent être identiques : sinon, on ajuste la corde.'],
        ['exception G→B', 'la 4ᵉ case de Sol (G) donne Si (B), pas la 5ᵉ.'],
      ],
      theory: {
        title: "L'ordre des comparaisons",
        items: [
          ['E → A', '5ᵉ case de E = corde de A'],
          ['A → D', '5ᵉ case de A = corde de D'],
          ['D → G', '5ᵉ case de D = corde de G'],
          ['G → B', '4ᵉ case de G = corde de B (l\'exception !)'],
          ['B → E', '5ᵉ case de B = corde de E (aiguë)'],
        ],
      },
      recap: {
        title: 'Récap chapitre 1 — Le manche',
        columns: ['Repère', 'Sur le manche', 'Dans Strudel'],
        rows: [
          ['Cordes à vide', 'E A D G B E', 'note("e2 a2 d3 g3 b3 e4")'],
          ['1 case', '+1 demi-ton', 'note("e2 f2")'],
          ['1 ton', '2 cases', 'note("e2 f#2")'],
          ['Octave', '12 cases', 'note("e2 e3")'],
          ['Accordage', '5ᵉ case (G→B : 4ᵉ)', 'note("a2 a2")'],
        ],
      },
      exercise:
        'Vérifie ta vraie guitare : joue a2 dans Strudel et la corde de La — ' +
        "sont-elles d'accord ?",
      free:
        "Tu tiens le manche comme une carte : 6 cordes, des cases qui ajoutent des demi-tons, " +
        "l'octave à la 12ᵉ. Bidouille : pars d'une corde et grimpe en " +
        'note("e2 f#2 g#2 a2 b2") — tu joues déjà une gamme sur une seule corde. ' +
        "Au chapitre 2, on apprend à trouver et déplacer n'importe quelle note.",
    },
  ],
};

export const m3chapitre2 = {
  module: 3,
  chapter: 'Lire le manche',
  title: 'Lire le manche',
  subtitle: 'Trouver les notes, les déplacer',
  flashs: [
    {
      id: '3.6',
      kicker: 'Nommer les cases',
      title: 'Trouver les notes sur la corde de Mi',
      concept:
        "Sur la corde de Mi grave, en montant case par case, on retrouve l'alphabet musical (M2). " +
        'Connaître les notes de cette corde suffit déjà pour te repérer partout.',
      code: 'note("e2 f2 g2 a2 b2 c3 d3 e3").s("gm_acoustic_guitar_steel").clip(1.2)',
      decode: [
        ['e2 f2 g2 …', 'les notes naturelles (sans dièse) de la corde de Mi grave.'],
        ['cases 0 1 3 5 7 8 10 12', "attention : E→F et B→C n'ont qu'1 case d'écart (M2)."],
        ['e2 → e3', '8 notes naturelles, et on retombe sur Mi (12ᵉ case).'],
      ],
      theory: {
        title: 'Côté solfège — mi-fa & si-do',
        items: [
          ['E → F', '1 seule case (1 demi-ton) : pas de note noire entre eux (M2).'],
          ['B → C', 'pareil : 1 case seulement.'],
          ['les autres', 'séparés par 2 cases (1 ton), avec une note noire entre.'],
        ],
      },
      exercise:
        'Fais pareil sur la corde de La : note("a2 b2 c3 d3 e3 f3 g3 a3"). ' +
        'Repère le saut court B→C.',
    },

    {
      id: '3.7',
      kicker: 'La gamme, version guitare',
      title: 'Une gamme : le long ou en travers',
      concept:
        'Tu peux jouer une gamme (M2) de deux façons sur la guitare : tout sur une corde ' +
        "(en montant les cases) ou en travers (en changeant de corde). Strudel rend les deux audibles.",
      code: 'note("0 2 4 5 7 9 11 12".add("48")).s("gm_acoustic_guitar_steel").clip(1.2)',
      decode: [
        ['"0 2 4 5 7 9 11 12"', 'les écarts en demi-tons de do majeur (M2 : T-T-S-T-T-T-S).'],
        ['.add("48")', '48 = do central (c3) ; on cale la gamme dessus → do ré mi fa sol la si do.'],
        ['sur une corde', 'cette suite de cases « dessine » la gamme en ligne.'],
      ],
      theory: {
        title: 'Côté solfège — le lien',
        items: [
          ['la recette', 'do majeur = +0 +2 +4 +5 +7 +9 +11 +12 demi-tons (M2 ch.3).'],
          ['une corde', "montre la gamme « en ligne » — parfait pour voir les intervalles."],
          ['en travers', "n() + scale() répartit les mêmes notes sur plusieurs cordes."],
        ],
      },
      exercise:
        'Compare avec n("0 1 2 3 4 5 6 7").scale("C:major").s("gm_acoustic_guitar_steel"). ' +
        'Même gamme, répartie par Strudel.',
    },

    {
      id: '3.8',
      kicker: 'Le capo',
      title: 'Le capo = tout monter d\'un coup',
      concept:
        "Un capo serre toutes les cordes à une case : il monte tout le morceau de N demi-tons " +
        "sans changer tes doigtés. Dans Strudel, c'est .add(N) appliqué à l'ensemble (M2 : transposer).",
      code: 'note("e2 a2 d3 g3 b3 e4").add("<0 2 5>").s("gm_acoustic_guitar_steel").clip(1.5)',
      decode: [
        ['.add("<0 2 5>")', 'capo 0 (rien), puis capo 2, puis capo 5 — un par cycle (M1 : < >).'],
        ['capo 2', '+2 demi-tons : tes accords sonnent un ton plus haut.'],
        ['à quoi ça sert', "changer la hauteur d'une chanson sans réapprendre les positions."],
      ],
      theory: {
        title: 'Côté solfège — transposer',
        items: [
          ['transposer', 'décaler toutes les notes du même intervalle (M2 ch.5).'],
          ['capo N', '= transposer de N demi-tons vers l\'aigu.'],
          ['guitare', 'le capo garde les mêmes formes d\'accords — juste plus haut.'],
        ],
      },
      exercise:
        'Fixe le capo à la 3ᵉ case : remplace par .add("3"). ' +
        'Toutes les cordes montent de 3 demi-tons.',
    },

    {
      id: '3.9',
      kicker: "L'arme du guitariste",
      title: 'La boîte pentatonique : improviser',
      concept:
        "La pentatonique (M2) tient sur la guitare dans une « boîte » : une position de 5 notes " +
        "par octave qu'on joue partout. C'est LE terrain de jeu pour improviser un solo sans fausse note.",
      code: 'setcpm(70/4)\nn("0 1 2 3 4 5 6 7").scale("E:minor:pentatonic").s("gm_electric_guitar_clean").clip(1.3)',
      decode: [
        ['E:minor:pentatonic', 'mi mineur pentatonique : la boîte rock/blues par excellence.'],
        ['n("0 … 7")', 'les degrés de la boîte, du grave à l\'aigu.'],
        ['gm_electric_guitar_clean', 'une électrique propre, le son « solo ».'],
      ],
      theory: {
        title: 'Côté guitare — la boîte',
        items: [
          ['pentatonique', '5 notes par octave (M2 ch.3).'],
          ['la boîte', 'une seule forme de doigts, déplaçable sur tout le manche.'],
          ['mi mineur', 'la tonalité « ouverte » de la guitare (corde de Mi grave).'],
        ],
      },
      exercise:
        'Improvise : joue des degrés au hasard, ex. ' +
        'n("0 2 3 4 2 0 <3 5>").scale("E:minor:pentatonic"). Tout sonne juste.',
    },

    {
      id: '3.10',
      kicker: 'Premier riff',
      title: 'Assembler : un riff sur le manche',
      concept:
        'Réunis tes repères : une basse saturée sur les cordes graves, la boîte pentatonique ' +
        'par-dessus. Un vrai début de riff de guitare, dans une seule tonalité.',
      code:
        'setcpm(80/4)\n' +
        '$: note("<e2 e2 g2 a2>*2").s("gm_distortion_guitar").clip(.6).gain(.7)\n' +
        '$: n("0 ~ 2 3 ~ 2 ~ 0").scale("E:minor:pentatonic").s("gm_electric_guitar_clean").gain(.5)',
      decode: [
        ['la basse <e2 e2 g2 a2>', 'des notes graves saturées — le « moteur » du riff.'],
        ['.clip(.6)', 'notes un peu courtes → plus « mordantes » (vers le palm mute, ch.4).'],
        ['la boîte par-dessus', 'la mélodie reste en mi mineur pentatonique → tout colle.'],
      ],
      theory: {
        title: 'Ce que tu relies',
        items: [
          ['Module 1', 'tempo, < >, $:, gain.'],
          ['Module 2', 'pentatonique, tonalité.'],
          ['Module 3', 'cordes, son de guitare, le manche.'],
        ],
      },
      recap: {
        title: 'Récap chapitre 2 — Lire le manche',
        columns: ['Concept', 'Repère guitare', 'Strudel'],
        rows: [
          ['Notes d\'une corde', 'monter les cases', 'note("e2 f2 g2 a2")'],
          ['Gamme', 'le long / en travers', 'n("0 2 4").scale("C:major")'],
          ['Capo', 'monter de N cases', '.add("N")'],
          ['Boîte penta', '1 forme partout', 'scale("E:minor:pentatonic")'],
        ],
      },
      exercise:
        'Reprends le riff et change la basse en <a2 a2 c3 d3> + la boîte en ' +
        'A:minor:pentatonic. Tu déménages le riff en la mineur.',
      free:
        "Tu sais lire le manche : nommer les notes, jouer une gamme, poser un capo, improviser " +
        "dans la boîte. Bidouille ton riff : change le tempo, la basse, ajoute une batterie en $: (M1). " +
        'Au chapitre 3, on attaque les accords ouverts — les fameuses positions « feu de camp ».',
    },
  ],
};

export const m3chapitre3 = {
  module: 3,
  chapter: 'Les accords ouverts',
  title: 'Les accords ouverts',
  subtitle: 'Les positions « feu de camp »',
  flashs: [
    {
      id: '3.11',
      kicker: 'Les positions de base',
      title: 'Les accords ouverts : Mi majeur',
      concept:
        'Un accord ouvert utilise des cordes à vide + quelques doigts près du sillet. Le Mi majeur (E) ' +
        'est le plus simple : 3 doigts, 6 cordes qui sonnent. Voici ses vraies notes.',
      code: 'note("[e2,b2,e3,g#3,b3,e4]").s("gm_acoustic_guitar_steel").room(.4)',
      decode: [
        ['[e2,b2,e3,g#3,b3,e4]', 'les 6 cordes du Mi majeur ouvert, de la grave à l\'aiguë.'],
        ['crochets + virgules', 'toutes les notes en même temps = un accord (M2).'],
        ['g#3', "la tierce majeure (M2) : c'est elle qui rend l'accord « majeur »."],
      ],
      theory: {
        title: "Côté solfège — l'accord de Mi",
        items: [
          ['fondamentale', "E (mi) — la note qui nomme l'accord."],
          ['tierce majeure', 'G# — la couleur joyeuse (M2 ch.2).'],
          ['quinte', 'B (si) — la stabilité (M2).'],
          ['notes doublées', '6 cordes, mais seulement 3 notes différentes (E, G#, B).'],
        ],
      },
      exercise:
        "Joue l'accord, puis arpège-le (une corde après l'autre) : " +
        'note("e2 b2 e3 g#3 b3 e4").',
    },

    {
      id: '3.12',
      kicker: 'La bascule',
      title: 'Mi majeur → Mi mineur',
      concept:
        'Pour passer de Mi majeur à Mi mineur, on enlève un seul doigt : la tierce majeure (G#) ' +
        "descend d'un demi-ton vers la tierce mineure (G). Un demi-ton change toute l'humeur (M2).",
      code: 'note("[e2,b2,e3,g#3,b3,e4] [e2,b2,e3,g3,b3,e4]").s("gm_acoustic_guitar_steel").room(.4)',
      decode: [
        ['1er accord : g#3', 'Mi MAJEUR : joyeux.'],
        ['2ᵉ accord : g3', 'Mi MINEUR : triste. Seul g#→g a changé.'],
        ['un seul demi-ton', 'comme en M2 : la tierce décide majeur/mineur.'],
      ],
      theory: {
        title: 'Côté solfège — la tierce qui colore',
        items: [
          ['majeur', 'tierce à 4 demi-tons (g#).'],
          ['mineur', 'tierce à 3 demi-tons (g).'],
          ['sur la guitare', "lever l'index de la 3ᵉ corde : E → Em."],
        ],
      },
      exercise:
        'Alterne plusieurs fois les deux accords (le code le fait). ' +
        "Ferme les yeux : entends l'humeur basculer.",
    },

    {
      id: '3.13',
      kicker: 'La trousse',
      title: 'Les accords « feu de camp »',
      concept:
        "Avec une poignée d'accords ouverts — E, A, D, G, C et leurs mineurs — tu accompagnes " +
        'des centaines de chansons. Voici A, D, G, C dans leurs vraies positions.',
      code: 'note("<[a2,e3,a3,c#4,e4] [d3,a3,d4,f#4] [g2,b2,d3,g3,b3,g4] [c3,e3,g3,c4,e4]>").s("gm_acoustic_guitar_steel").room(.4)',
      decode: [
        ['A (la majeur)', '[a2,e3,a3,c#4,e4] — c#4 = la tierce.'],
        ['D (ré majeur)', '[d3,a3,d4,f#4] — 4 cordes seulement.'],
        ['G (sol majeur)', '[g2,b2,d3,g3,b3,g4] — 6 cordes, son riche.'],
        ['C (do majeur)', '[c3,e3,g3,c4,e4] — l\'accord ouvert classique.'],
      ],
      theory: {
        title: 'Côté guitare — les positions ouvertes',
        items: [
          ['ouvert', 'mêle cordes à vide et doigtés bas — facile et sonore.'],
          ['les mineurs', 'Am, Dm, Em existent aussi (tierce abaissée).'],
          ['pourquoi ceux-là', 'ils tombent bien sous les doigts près du sillet.'],
        ],
      },
      exercise:
        'Enchaîne-les lentement. Puis essaie un mineur : ' +
        'Am = note("[a2,e3,a3,c4,e4]") (c4 au lieu de c#4).',
    },

    {
      id: '3.14',
      kicker: 'Les 4 accords',
      title: 'La grille « 4 accords » à la guitare',
      concept:
        'En do majeur, les accords ouverts C, G, Am, F donnent la progression pop la plus célèbre ' +
        "(M2 : I-V-vi-IV). Avec une rythmique, c'est déjà une chanson.",
      code:
        'setcpm(100/4)\n' +
        '$: chord("<C G Am F>").voicing().s("gm_acoustic_guitar_nylon").room(.4).gain(.7)\n' +
        '$: sound("bd*4, [~ sd]*2").bank("RolandTR909").gain(.6)',
      decode: [
        ['chord("<C G Am F>")', "les symboles d'une grille (M2) — Strudel trouve les notes."],
        ['.voicing()', 'enchaîne les accords en douceur (voice leading, M2).'],
        ['+ batterie', 'une boucle de batterie (M1) → un vrai accompagnement.'],
      ],
      theory: {
        title: 'Côté solfège — la progression',
        items: [
          ['I-V-vi-IV', 'C-G-Am-F en do majeur (M2 ch.4).'],
          ['« 4 chords »', 'la grille de centaines de tubes.'],
          ['voicing()', 'le raccourci pour ne pas écrire chaque note (M2 ch.4).'],
        ],
      },
      exercise:
        'Change la grille : chord("<G D Em C>").voicing(). ' +
        'Une autre chanson, même recette.',
    },

    {
      id: '3.15',
      kicker: 'Première chanson',
      title: 'Une chanson : accords + rythme',
      concept:
        'Donne un rythme de grattage à tes accords avec .struct() : des frappes (x) et des silences (~). ' +
        'Tu passes de « plaquer un accord » à « gratter une chanson ».',
      code:
        'setcpm(110/4)\n' +
        '$: chord("<C G Am F>").voicing().struct("x ~ x x ~ x ~ x").s("gm_acoustic_guitar_steel").room(.3).gain(.7)\n' +
        '$: sound("bd ~ sd ~").bank("RolandTR909").gain(.6)',
      decode: [
        ['.struct("x ~ x x ~ x ~ x")', 'le patron de grattage : x = on gratte, ~ = on saute (M1).'],
        ['un accord par cycle', 'la grille avance, le patron de rythme se répète.'],
        ['gm_acoustic_guitar_steel', 'la folk claire, idéale pour le grattage.'],
      ],
      theory: {
        title: 'Côté guitare — le grattage',
        items: [
          ['struct', 'sépare le RYTHME (quand) de l\'HARMONIE (quoi).'],
          ['down/up', 'sur la vraie guitare, les x alternent coups vers le bas / vers le haut.'],
        ],
      },
      recap: {
        title: 'Récap chapitre 3 — Accords ouverts',
        columns: ['Accord', 'Vraies notes', 'Raccourci'],
        rows: [
          ['E majeur', '[e2,b2,e3,g#3,b3,e4]', 'chord("E")'],
          ['E mineur', '[e2,b2,e3,g3,b3,e4]', 'chord("Em")'],
          ['A / D / G / C', 'positions ouvertes', 'chord("A D G C")'],
          ['Grille', 'I-V-vi-IV', 'chord("<C G Am F>").voicing()'],
          ['Grattage', 'rythme des frappes', '.struct("x ~ x x")'],
        ],
      },
      exercise:
        'Change le patron de grattage : .struct("x x ~ x x ~ x ~"). ' +
        'Le même accord, un autre groove.',
      free:
        'Tu tiens les accords ouverts : E, Em, A, D, G, C, la grille à 4 accords et le grattage ' +
        'avec struct. Monte ta chanson : choisis 4 accords, un patron de grattage, ajoute une batterie. ' +
        'Au chapitre 4, on rend ces accords mobiles : power chords et barrés.',
    },
  ],
};

export const m3chapitre4 = {
  module: 3,
  chapter: 'Power chords & barrés',
  title: 'Power chords & barrés',
  subtitle: 'Une forme qui voyage sur le manche',
  flashs: [
    {
      id: '3.16',
      kicker: 'Le rock',
      title: 'Le power chord : fondamentale + quinte',
      concept:
        "Le power chord, c'est juste deux notes : la fondamentale et sa quinte (M2). Pas de tierce " +
        '→ ni majeur ni mineur → il sonne « puissant » et passe partout, surtout saturé.',
      code: 'note("[e2,b2] [a2,e3] [d3,a3]").s("gm_distortion_guitar").clip(1).gain(.7)',
      decode: [
        ['[e2,b2]', 'E5 : mi + sa quinte (si). 7 demi-tons d\'écart (M2).'],
        ['[a2,e3]', 'A5 : la même forme, déplacée sur la corde de La.'],
        ['gm_distortion_guitar', 'la guitare saturée : le son du power chord.'],
      ],
      theory: {
        title: 'Côté solfège — la quinte',
        items: [
          ['quinte juste', '7 demi-tons : très stable (M2 ch.2).'],
          ['pas de tierce', '→ ni majeur ni mineur : neutre et solide.'],
          ['guitare', '2 cordes voisines, la quinte 2 cases plus haut.'],
        ],
      },
      exercise:
        "Ajoute la fondamentale à l'octave : note(\"[e2,b2,e3]\"). " +
        'Le power chord « complet » à 3 cordes.',
    },

    {
      id: '3.17',
      kicker: 'Mobile',
      title: 'Une seule forme, partout',
      concept:
        "La grande force du power chord : c'est une forme mobile. La même position de doigts, " +
        'glissée sur le manche, donne tous les power chords. En code : la même forme avec .add().',
      code: 'note("[0,7]".add("<40 45 47 43>")).s("gm_distortion_guitar").clip(.9).gain(.7)',
      decode: [
        ['[0,7]', 'la forme : fondamentale (0) + quinte (7 demi-tons).'],
        ['.add("<40 45 47 43>")', 'on déplace la forme : E5, A5, B5, G5 (un par cycle).'],
        ['mobile', 'aucune corde à vide → glissable n\'importe où.'],
      ],
      theory: {
        title: 'Côté guitare — les formes mobiles',
        items: [
          ['forme', "un motif d'intervalles qu'on déplace sans le changer."],
          ['power chord', 'la forme mobile la plus simple : 2 notes.'],
          ['nom = case', 'le power chord prend le nom de la note de la corde grave.'],
        ],
      },
      exercise:
        'Compose un riff : note("[0,7]".add("<40 40 43 45>")).fast(2). ' +
        'Quatre power chords, un vrai motif punk.',
    },

    {
      id: '3.18',
      kicker: 'Étouffer',
      title: 'Le palm mute : des notes courtes',
      concept:
        'En posant la paume près du chevalet, le guitariste étouffe les cordes : le son devient ' +
        'court et percussif. Dans Strudel, on raccourcit les notes avec .clip() (petit = étouffé).',
      code: 'setcpm(120/4)\nnote("e2*8").s("gm_distortion_guitar").clip("<.2 1>").gain(.7)',
      decode: [
        ['e2*8', 'huit Mi graves dans le cycle (M1 : *).'],
        ['.clip(.2)', 'notes très courtes → palm mute « chugga-chugga ».'],
        ['.clip(1)', 'notes pleines → cordes qui sonnent librement.'],
      ],
      theory: {
        title: "Côté guitare — l'articulation",
        items: [
          ['palm mute', 'paume sur les cordes près du chevalet → son court, étouffé.'],
          ['clip', 'règle la durée (1 = normale, <1 = courte, >1 = laisse sonner).'],
          ['cousins', 'decay / sustain / release sculptent aussi la durée (effets Strudel).'],
        ],
      },
      exercise:
        'Mélange étouffé et ouvert : note("e2*8").clip(".2 .2 .2 1 .2 .2 1 1"). ' +
        'Un vrai motif metal.',
    },

    {
      id: '3.19',
      kicker: "L'accord mobile",
      title: 'Le barré : un accord ouvert qui voyage',
      concept:
        "Un accord barré, c'est une forme d'accord ouvert où l'index « fait capo » sur toutes les " +
        'cordes, puis qu\'on déplace. La forme de Mi, montée de N cases, donne n\'importe quel accord majeur.',
      code: 'note("[e2,b2,e3,g#3,b3,e4]".add("<0 1 3 5>")).s("gm_electric_guitar_clean").room(.3).gain(.7)',
      decode: [
        ['la forme de Mi majeur', '[e2,b2,e3,g#3,b3,e4] (chapitre 3).'],
        ['.add("<0 1 3 5>")', 'déplacée de 0, 1, 3, 5 cases → E, F, G, A majeur !'],
        ['l\'index = barré', 'il remplace le sillet, et toute la forme « monte ».'],
      ],
      theory: {
        title: 'Côté guitare — le barré',
        items: [
          ['barré', "l'index couche sur toutes les cordes (un capo « humain »)."],
          ['forme de Mi', 'donne les majeurs : F (case 1), G (case 3)…'],
          ['forme de Mim', 'la même en mineur (g# → g) donne Fm, Gm…'],
        ],
      },
      exercise:
        'Passe en mineur : remplace g#3 par g3, et garde .add("<0 3 5>"). ' +
        'Tu obtiens Em, Gm, Am barrés.',
    },

    {
      id: '3.20',
      kicker: 'Le mur du son',
      title: 'Assembler : riff saturé + batterie',
      concept:
        'Réunis le chapitre : un power chord mobile, du palm mute, et une grosse batterie. ' +
        "Le squelette d'un riff rock/metal, entièrement dans Strudel.",
      code:
        'setcpm(140/4)\n' +
        '$: note("[0,7]".add("40")).struct("x x x ~ x x ~ x").s("gm_distortion_guitar").clip(.3).gain(.7)\n' +
        '$: sound("bd*4, [~ sd]*2, hh*8").bank("RolandTR909").gain(.6)',
      decode: [
        ['[0,7].add("40")', 'un power chord de Mi (E5) qui pulse.'],
        ['.struct("x x x ~ x x ~ x")', 'le rythme du riff (M1 : x / ~).'],
        ['.clip(.3)', 'palm mute serré → l\'attaque « djent ».'],
      ],
      theory: {
        title: 'Ce que tu relies',
        items: [
          ['Module 1', 'tempo rapide, struct, batterie 909.'],
          ['Module 2', 'la quinte (power chord).'],
          ['Module 3', 'forme mobile, palm mute, guitare saturée.'],
        ],
      },
      recap: {
        title: 'Récap chapitre 4 — Power chords & barrés',
        columns: ['Concept', 'Forme', 'Strudel'],
        rows: [
          ['Power chord', 'fondamentale + quinte', 'note("[0,7]")'],
          ['Mobile', 'glisser la forme', '.add("<40 45 47>")'],
          ['Palm mute', 'notes courtes', '.clip(.2)'],
          ['Barré majeur', 'forme de Mi', 'note("[e2,b2,e3,g#3,b3,e4]").add(n)'],
          ['Barré mineur', 'forme de Mim', 'g3 au lieu de g#3'],
        ],
      },
      exercise:
        'Ralentis à setcpm(110/4) et change la note de base : .add("<40 45 43>"). ' +
        'Un riff plus lourd.',
      free:
        'Tu rends les accords mobiles : power chords, palm mute, barrés majeurs et mineurs. ' +
        'Compose un riff : une forme [0,7], un patron struct, du palm mute, une batterie. ' +
        'Au chapitre 5, on soigne le JEU : arpèges, picking et dynamique.',
    },
  ],
};

export const m3chapitre5 = {
  module: 3,
  chapter: 'Le jeu',
  title: 'Le jeu',
  subtitle: 'Gratte, arpèges & rythmique',
  flashs: [
    {
      id: '3.21',
      kicker: 'Deux gestes',
      title: 'Plaquer ou arpéger un accord',
      concept:
        "Un accord, tu peux le plaquer (toutes les cordes d'un coup) ou l'arpéger (corde après corde). " +
        'Mêmes notes, geste différent — et ambiance différente.',
      code: 'note("<[c3,e3,g3,c4] [c3 e3 g3 c4]>").s("gm_acoustic_guitar_nylon").clip(1.5).room(.3)',
      decode: [
        ['[c3,e3,g3,c4]', 'plaqué : les 4 notes ensemble (1er cycle).'],
        ['[c3 e3 g3 c4]', 'arpégé : les mêmes notes en séquence rapide (2ᵉ cycle).'],
        ['< >', 'alterne plaqué / arpégé à chaque cycle (M1).'],
      ],
      theory: {
        title: 'Côté guitare — le geste',
        items: [
          ['plaqué', 'un coup de médiator/pouce sur toutes les cordes.'],
          ['arpégé', 'on fait sonner les cordes séparément (M2 : arpège).'],
          ['picking', 'arpéger aux doigts = le fingerpicking.'],
        ],
      },
      exercise:
        "Allonge l'arpège : note(\"[c3 e3 g3 c4 e4 g4]\"). " +
        'Plus de notes, qui montent.',
    },

    {
      id: '3.22',
      kicker: 'Le picking',
      title: 'Un motif de picking',
      concept:
        'Le fingerpicking joue les notes d\'un accord une par une, en motif régulier. ' +
        'Dans Strudel : n() choisit les notes du voicing dans l\'ordre (M2), et .clip() les laisse résonner.',
      code: 'setcpm(90/4)\nn("0 1 2 3").chord("<C Am F G>").voicing().s("gm_acoustic_guitar_nylon").clip(1.5).room(.3)',
      decode: [
        ['n("0 1 2 3")', 'on joue les notes du voicing une par une (M2 : n + voicing).'],
        ['.chord("<C Am F G>")', 'un accord par cycle ; ses notes sont arpégées.'],
        ['.clip(1.5)', 'les notes se chevauchent → effet « harpe ».'],
      ],
      theory: {
        title: 'Côté guitare — le picking',
        items: [
          ['fingerpicking', 'jouer les cordes aux doigts, en motif.'],
          ['n + voicing', 'sélectionne les notes de l\'accord dans l\'ordre (M2 ch.4).'],
          ['pouce + doigts', 'le pouce les graves, les doigts les aigus.'],
        ],
      },
      exercise:
        'Change le motif : n("0 1 2 3 2 1").chord("<C Am F G>").voicing(). ' +
        'Un picking plus long.',
    },

    {
      id: '3.23',
      kicker: 'Le toucher',
      title: 'Jouer fort, jouer doux',
      concept:
        "Un bon jeu n'est pas plat : on accentue certaines notes. Le .gain() règle le volume " +
        'note par note — comme attaquer plus ou moins fort les cordes.',
      code: 'setcpm(100/4)\nnote("c3 e3 g3 c4").s("gm_acoustic_guitar_steel").gain("1 .5 .7 .5").clip(1.2)',
      decode: [
        ['gain("1 .5 .7 .5")', 'la 1ʳᵉ note forte, les autres plus douces → un accent.'],
        ['accent', 'mettre en avant le 1er temps = donner un groove.'],
        ['velocity', 'gain("…") ≈ la force d\'attaque sur la corde.'],
      ],
      theory: {
        title: 'Côté guitare — la dynamique',
        items: [
          ['dynamique', 'les variations de volume dans le jeu.'],
          ['accent', 'frapper plus fort une note clé (souvent le temps 1).'],
          ['expressivité', "ce qui sépare un robot d'un musicien."],
        ],
      },
      exercise:
        'Déplace l\'accent : gain(".5 1 .5 .7"). Le groove change de place.',
    },

    {
      id: '3.24',
      kicker: 'Les pédales',
      title: 'Les effets : tes pédales virtuelles',
      concept:
        'Le guitariste branche des pédales : disto, reverb, delay, phaser. Strudel a les mêmes effets, ' +
        'chaînables sur n\'importe quel son (M1/M2). Voici une électrique « pédalée ».',
      code: 'setcpm(90/4)\nn("0 2 4 7 4 2").scale("E:minor:pentatonic").s("gm_electric_guitar_clean").distort("2:.3").phaser(2).delay(.25).room(.3)',
      decode: [
        ['.distort("2:.3")', 'la saturation (overdrive / disto).'],
        ['.phaser(2)', 'le phaser — Strudel le décrit comme une pédale de guitare.'],
        ['.delay(.25) / .room(.3)', "l'écho et la réverbération (l'espace)."],
      ],
      theory: {
        title: "Côté guitare — la chaîne d'effets",
        items: [
          ['disto', 'écrase le son → grain rock (distort / dist).'],
          ['modulation', 'phaser, chorus, vibrato (vib).'],
          ['temps', 'delay (écho) et room (reverb) ajoutent l\'espace.'],
        ],
      },
      exercise:
        'Enlève les effets un par un pour entendre ce que chacun apporte. ' +
        'Puis pousse .distort("6:.3").',
    },

    {
      id: '3.25',
      kicker: 'Tout, ensemble',
      title: 'Bilan : un morceau guitare complet',
      concept:
        'Le grand final : basse, accords grattés, mélodie pickée, batterie — une vraie guitare dans ' +
        'une tonalité (M2), jouée comme un musicien (M3). Tu tiens les trois modules d\'un coup.',
      code:
        'setcpm(110/4)\n' +
        '$: sound("bd*4, [~ sd]*2, [~ hh]*4").bank("RolandTR909").gain(.6)\n' +
        '$: note("<e2 c2 g2 d2>").s("gm_acoustic_bass").clip(.9).gain(.7)\n' +
        '$: chord("<Em C G D>").voicing().struct("x ~ x x ~ x ~ x").s("gm_acoustic_guitar_steel").gain(.5).room(.3)\n' +
        '$: n("0 2 4 2 <3 5>").scale("E:minor:pentatonic").s("gm_electric_guitar_clean").gain(.45).delay(.2)',
      decode: [
        ['la batterie', 'le moteur (M1).'],
        ['la basse <e2 c2 g2 d2>', 'la fondamentale de chaque accord (Em-C-G-D).'],
        ['chord(…).struct(…)', 'les accords grattés en rythme (M2 + M3).'],
        ['n(…).scale("E:minor:pentatonic")', 'la mélodie de guitare, dans la boîte.'],
      ],
      theory: {
        title: 'Les trois modules réunis',
        items: [
          ['Module 1', 'tempo, mini-notation, batterie, $:.'],
          ['Module 2', 'gamme, accords, tonalité, voicing.'],
          ['Module 3', 'son de guitare, grattage, picking, effets.'],
        ],
      },
      recap: {
        title: 'Récap chapitre 5 — Le jeu',
        columns: ['Geste', 'Idée', 'Strudel'],
        rows: [
          ['Plaqué / arpégé', 'ensemble / un par un', 'note("[c,e,g]") vs "c e g"'],
          ['Picking', 'notes de l\'accord', 'n("0 1 2 3").chord("C").voicing()'],
          ['Dynamique', 'accentuer', 'gain("1 .5 .7 .5")'],
          ['Effets', 'pédales', '.distort().phaser().delay()'],
          ['Grattage', 'rythme', '.struct("x ~ x x")'],
        ],
      },
      exercise:
        'Change la tonalité : grille chord("<Am F C G>"), basse <a1 f2 c2 g2>, ' +
        'mélodie A:minor:pentatonic.',
      free:
        "Tu tiens le Module 3 : le manche, l'accordage, les accords ouverts, les power chords et " +
        'barrés, et le jeu (picking, dynamique, effets). Surtout, tu relies ta guitare à la théorie (M2) ' +
        "et au live coding (M1). Reprends ce morceau et fais-le tien : ta grille, ton riff, ton solo. " +
        "La guitare et le code ne font plus qu'un — c'est toi le Keymaker. 🎸",
    },
  ],
};

/* Le Module 3 entier : la carte de ses 5 chapitres. */
export const module3 = {
  id: 3,
  titre: 'Module 3 — Connexion Guitare',
  title: 'Module 3',
  subtitle: 'Ta guitare, reliée à la théorie et à Strudel',
  chapitres: [m3chapitre1, m3chapitre2, m3chapitre3, m3chapitre4, m3chapitre5],
};

/* Tous les modules de Keymaker, dans l'ordre du parcours. */
export const modules = [module1, module2, module3];

// Rétro-compatibilité : certains imports historiques pointaient sur flash11.
export const flash11 = chapitre1.flashs[0];
