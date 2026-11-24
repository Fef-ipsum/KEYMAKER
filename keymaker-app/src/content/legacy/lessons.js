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

// Module 7 « Genres & Styles » (Chantier Electro) — défini à part dans module7.js.
import { module7 } from './module7.js';
import { module8 } from './module8.js';

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
        "Pas de compilation, pas d'export. Le code, c'est l'instrument. " +
        "Cap de ce module : coder un vrai beat techno — kick 4/4 sec, hi-hats, bassline.",
      code: 'sound("casio")',
      decode: [
        ['sound(...)', '« joue ce son ».'],
        ['"casio"', 'le nom du son, entre guillemets.'],
      ],
      exercise:
        'Lance sound("casio"), puis remplace « casio » par « metal » et relance. ' +
        'Tu viens de faire ta première boucle Run → modifier → rejouer.',
      culture: {
        artist: 'DJ_Dave',
        track: 'ses sets algorave en live (YouTube)',
        why:
          "la scène live coding d'aujourd'hui : elle compose de l'électro en direct, code projeté à l'écran — exactement le geste que tu apprends ici.",
      },
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
        ['exemple', 'sound("bd <hh oh> sd <hh oh oh>") — le charleston alterne fermé/ouvert selon le cycle.'],
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
        ['exemple', 'sound("bd sd, [~ <sd cp>]*2") — deux couches : le kick-snare, et une alternance snare/clap (< >, flash 2.6).'],
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
        ['"<bd hh rim hh>*8"', "la combinaison < > + * : *8 tire 8 pas de l'alternance par cycle, en tournant dans la liste."],
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
      code: 'note("c2 e3 g4 c5").sound("piano")',
      decode: [
        ['c2', "do grave — le chiffre indique l'octave."],
        ['c5', "do aigu — même note, 3 octaves plus haut."],
        ['sans numéro', "Strudel choisit une octave par défaut : 3."],
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
        'Joue les 12 notes chromatiques de c à c : note("c c# d d# e f f# g g# a a# b c4").sound("piano").',
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
      code: 'setcpm(132/4)\n$: sound("bd*4, [~ cp]*2, [~ hh]*4").bank("RolandTR909")\n$: note("<c2 ab1 f1 g1>*2").sound("gm_acoustic_bass")\n$: n("0 2 <4 5> 2").scale("C:minor").sound("piano")',
      decode: [
        ['setcpm(132/4)', "tempo techno : 132 BPM en 4/4 (ch.3)."],
        ['bd*4, [~ cp]*2, [~ hh]*4', "batterie 3 couches avec parallèle et sous-séquences (ch.1-2)."],
        ['<c2 ab1 f1 g1>*2', "basse en alternance de notes SEULES — les fondamentales, pas des accords (ch.2 + ch.4)."],
        ['n("0 2 <4 5> 2").scale("C:minor")', "mélodie en gamme mineure avec alternance (ch.4)."],
      ],
      exercise:
        "Joue cet empilement, écoute-le. " +
        "Puis identifie la brique (chapitre) derrière chaque ligne.",
      free:
        "Tu tiens toutes les briques du Module 1 — de quoi coder un beat techno. " +
        "Reparts de cet empilement : pousse le tempo vers 130-138, garde-le minimal et sec, " +
        "puis mute une couche avec _$: en plein jeu. Une couche qui disparaît puis revient, " +
        "c'est exactement comme ça qu'un DJ fait respirer un morceau — le breakdown.",
      culture: {
        artist: 'Jeff Mills',
        track: 'The Bells',
        why:
          "LE manifeste de la techno minimale (Detroit) : trois éléments, un riff, une 909 jouée live — la version maître de ton empilement à 132 BPM.",
      },
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
        "Plus la vibration est rapide, plus c'est aigu. note() joue des hauteurs — comme au Module 1. " +
        "Le fil rouge de ce module : la trance — de la théorie rendue émotionnelle, pour comprendre pourquoi certaines notes donnent des frissons.",
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
        "Rappel express — déjà vu en M1 (4.2) : 7 lettres A–G qui bouclent, après G on repart à A, une octave plus haut. " +
        "L'approfondissement ici : ancrer la correspondance do-ré-mi ↔ C-D-E une bonne fois pour toutes.",
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
        "Dièses et bémols : rappel de M1 (4.4). L'approfondissement ici, c'est LE piège à retenir — " +
        "entre mi-fa (E-F) et si-do (B-C), PAS de touche noire : elles sont déjà à un demi-ton.",
      code: 'note("c c# d d# e f f# g g# a a# b c4").sound("piano")',
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
        'Compte les notes de c à c4 : tu dois en trouver 12. ' +
        "Vérifie qu'il n'y a pas de touche noire entre e-f ni entre b-c.",
    },

    {
      id: '2.5',
      kicker: "L'octave",
      title: "L'octave : la même note, plus haut",
      concept:
        "L'octave, tu la pratiques depuis M1 (4.3) : 12 demi-tons, même nom, fréquence doublée. " +
        "L'approfondissement : POURQUOI l'oreille entend « la même note » — l'équivalence d'octave.",
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
      code: 'note("[c,g] [f,c4] [g,d4]").sound("sawtooth").lpf(800)',
      decode: [
        ['[c,g]', 'quinte juste : 7 demi-tons. Le son « puissant », neutre.'],
        ['power chord', 'guitare saturée : la corde grave + sa quinte. Pas de tierce → ni majeur ni mineur.'],
        ['.sound("sawtooth").lpf(800)', 'une dent de scie filtrée — un son plus « électrique ». Le filtre lpf sera expliqué au Module 4.'],
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
        'Enchaîne les power chords : note("[c,g] [f,c4] [g,d4] [c,g]"). ' +
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
          ['Octave', '12', 'note("[c,c4]")'],
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
      code: 'note("c d e f g a b c4").sound("piano")',
      decode: [
        ['c d e f g a b c4', 'do majeur : 7 notes + le retour à do.'],
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
        'Rejoue do majeur, puis recommence depuis sol : note("g a b c4 d4 e4 f#4 g4"). ' +
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
      id: '2.14b',
      kicker: 'Les couleurs cachées',
      title: 'Les modes : dorien, phrygien…',
      concept:
        "Pousse l'idée de la relative (2.14) jusqu'au bout : les MÊMES notes, démarrées sur chaque degré, " +
        "donnent 7 gammes différentes — les modes. Deux stars en électro : le dorien (mineur « lumineux ») " +
        "et le phrygien (sombre, couleur espagnole).",
      code: 'n("0 2 4 7 9 7 4 2").scale("<C:minor C:dorian C:phrygian>").s("sawtooth").lpf(1200)',
      decode: [
        ['scale("C:dorian")', 'comme le mineur, mais la 6te est MAJEURE → mineur lumineux, le mode chouchou de la house et de la techno mélodique.'],
        ['scale("C:phrygian")', 'comme le mineur, mais la 2de est MINEURE (un demi-ton au-dessus de la tonique) → sombre, tendu : psy-trance, EBM, flamenco.'],
        ['<…>', 'la même phrase change de mode à chaque cycle : écoute la couleur tourner, une seule note diffère à chaque fois.'],
      ],
      theory: {
        title: 'Côté solfège — les modes',
        items: [
          ['mode', 'la gamme majeure démarrée sur un autre degré : mêmes notes, autre « maison ».'],
          ['dorien (dorian)', 'mineur + 6te majeure. So What de Miles Davis — et tant de house.'],
          ['phrygien (phrygian)', 'mineur + 2de mineure. Le frisson sombre de la psy et du metal.'],
          ['éolien (aeolian)', 'le nom « mode » du mineur naturel (2.13) — tu le connais déjà.'],
          ['guitare', 'ta penta mineure + un doigt : ajoute la 6te majeure et tu joues dorien.'],
        ],
      },
      exercise:
        'Reprends une mélodie en C:minor et passe-la en C:dorian puis C:phrygian — une seule note change, ' +
        'toute l’ambiance bascule. Les exercices des modules 5 à 7 te proposent C:dorian : maintenant tu sais ce que c’est.',
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
          ['Cadence', 'I-IV-V', 'note("[c,e,g] [f,a,c4] [g,b,d4]")'],
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
      code: 'note("g a b c4 d4 e4 f#4 g4").sound("piano")',
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
        'Joue fa majeur : note("f g a bb c4 d4 e4 f4") avec le bb obligatoire. ' +
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
        'Réunissons tout en trance : un tempo (M1), une batterie (M1), une basse sur les fondamentales, ' +
        'des accords de 7e par grille, et une mélodie en la mineur qui monte — le tout dans UNE tonalité. ' +
        "C'est un vrai bout de morceau, et ça sonne déjà émotionnel.",
      code:
        'setcpm(140/4)\n' +
        '$: sound("bd*4, [~ cp]*2, hh*8").bank("RolandTR909")\n' +
        '$: note("<a1 f1 c2 g1>").sound("sawtooth").lpf(700).gain(.7)\n' +
        '$: chord("<Am7 F^7 C^7 G7>").voicing().sound("sawtooth").lpf(2000).gain(.4).room(.5)\n' +
        '$: n("0 2 4 7 9 7 4 2").scale("A:minor").sound("triangle").gain(.45).room(.3)',
      decode: [
        ['setcpm(140/4)', 'tempo trance, 140 BPM en 4/4 (M1 ch.3).'],
        ['la basse <a1 f1 c2 g1>', 'la fondamentale de chaque accord (Am-F-C-G), bien grave.'],
        ['chord("<Am7 F^7 C^7 G7>")', 'des accords de 7e (4 sons) en pad sawtooth filtré + réverb → la signature trance (le filtre lpf : Module 4).'],
        ['n("0 2 4 7 9 7 4 2").scale("A:minor")', 'une mélodie qui MONTE (0→9) puis redescend résoudre — le moteur émotionnel.'],
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
        'relié à ta guitare et joué dans Strudel. Mission trance : écris une mélodie en mineur sur 8 temps, ' +
        'et essaie de la faire « monter » vers sa résolution (vise la tonique, une octave au-dessus). ' +
        "Cette tension qui se résout, c'est exactement ce qui donne des frissons en trance.",
      culture: {
        artist: 'Energy 52',
        track: 'Café del Mar',
        why:
          "l'hymne trance absolu (1993) : écoute la mélodie en mineur MONTER puis se résoudre — le moteur émotionnel exact de ce flash.",
      },
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
      id: "3.1",
      kicker: "La guitare entre en jeu",
      title: "Ta guitare, dans le code",
      concept: "Strudel contient aussi des guitares enregistrées, issues d’une banque au format General MIDI (les sons dont le nom commence par `gm_`). On choisit le timbre avec `.s(\"gm_…\")`. Fil rouge du parcours : l’*industrial*, où la guitare saturée et la musique électronique se mêlent (riff distordu sur kick rigide).",
      code: "note(\"e3 a3 d4 g4\").s(\"gm_acoustic_guitar_nylon\").room(.3)",
      decode: [
        ["gm_acoustic_guitar_nylon", "guitare classique, cordes en nylon. `gm_` = banque General MIDI."],
        [".s(\"…\")", "choisit le son, comme `.sound()`."],
        [".room(.3)", "un peu de réverbération autour de l’instrument (voir [room](fx.room))."],
      ],
      theory: {
        title: "Les guitares disponibles",
        items: [
          ["gm_acoustic_guitar_nylon", "classique, douce."],
          ["gm_acoustic_guitar_steel", "folk, plus claire (cordes en acier)."],
          ["gm_electric_guitar_clean", "électrique, son clair."],
          ["gm_distortion_guitar", "électrique saturée."],
        ],
      },
      exercise: "Joue le code, puis remplace le son par `gm_acoustic_guitar_steel`, puis `gm_electric_guitar_clean`. Mêmes notes, trois guitares.",
      rich: true,
    },

    {
      id: "3.2",
      kicker: "L'accordage",
      title: "Les 6 cordes à vide : E A D G B E",
      concept: "Une guitare a 6 cordes, accordées de la plus grave à la plus aiguë : mi, la, ré, sol, si, mi (E A D G B E). « À vide » = jouée sans poser de doigt. En notation Strudel : `e2 a2 d3 g3 b3 e4` (voir [cordes à vide](voc.guitare.cordes-a-vide)).",
      code: "note(\"e2 a2 d3 g3 b3 e4\").s(\"gm_acoustic_guitar_nylon\").room(.3)",
      decode: [
        ["e2 … e4", "de la 6ᵉ corde (la plus grave, 82 Hz) à la 1ʳᵉ (la plus aiguë, 330 Hz)."],
        ["les chiffres", "le numéro d’[octave](sol.octave) : e4 est deux octaves au-dessus de e2."],
        ["E A D G B E", "un moyen mnémotechnique : « Et Adam Donna Genèse Bien Évidemment »."],
      ],
      theory: {
        title: "L’accordage",
        items: [
          ["cordes à vide", "les 6 notes de référence : E A D G B E."],
          ["lettres", "les mêmes lettres que les [noms des notes](sol.noms-des-notes) : E = mi, A = la…"],
          ["intervalles", "entre cordes voisines : une quarte (5 demi-tons), sauf sol → si : une tierce majeure (4)."],
        ],
      },
      exercise: "Joue les 6 cordes lentement, du grave à l’aigu, puis à l’envers : `note(\"e4 b3 g3 d3 a2 e2\")`.",
      rich: true,
    },

    {
      id: "3.3",
      kicker: "Les cases",
      title: "Monter d'une case = +1 demi-ton",
      concept: "Poser un doigt une case plus haut monte la note d’un [demi-ton](sol.demi-ton) : la corde vibrante est raccourcie d’environ 6 %, sa fréquence augmente d’autant. En montant la corde de mi grave case par case, on parcourt les 12 notes.",
      code: "note(\"e2 f2 f#2 g2 g#2 a2\").s(\"gm_acoustic_guitar_nylon\").clip(1.2)",
      decode: [
        ["e2 → a2", "cases 0 à 5 de la corde de mi grave : E, F, F#, G, G#, A."],
        ["1 case", "1 demi-ton."],
        ["case 5 = a2", "la même note que la corde de la à vide : un repère clé."],
      ],
      theory: {
        title: "La case",
        items: [
          ["demi-ton", "1 case : le plus petit pas."],
          ["ton", "2 cases."],
          ["repère", "case 5 d’une corde = la corde suivante à vide (sauf sol → si : case 4)."],
        ],
      },
      exercise: "Fais pareil sur la corde de la : `note(\"a2 a#2 b2 c3 c#3 d3\")`. Tu montes la corde de la, case par case, jusqu’au ré de la corde suivante.",
      rich: true,
    },

    {
      id: "3.4",
      kicker: "Le repère d'or",
      title: "La 12ᵉ case : l'octave",
      concept: "Douze cases = douze demi-tons = une [octave](sol.octave) : la fréquence est doublée, car la longueur vibrante de la corde est divisée par deux. La 12ᵉ case donne donc la même note que la corde à vide, une octave plus haut. C’est le grand repère du manche.",
      code: "note(\"e2 e3, a2 a3\").s(\"gm_electric_guitar_clean\").clip(2)",
      decode: [
        ["e2 → e3", "corde de mi à vide, puis 12ᵉ case : même note, une octave plus haut."],
        ["la virgule", "joue les deux cordes en même temps (voir [virgule](mini.virgule))."],
        [".clip(2)", "chaque note dure deux pas : elles résonnent ensemble (voir [clip](fx.clip))."],
      ],
      theory: {
        title: "L’octave sur le manche",
        items: [
          ["12 cases", "1 octave : fréquence × 2."],
          ["repères", "les points du manche : cases 3, 5, 7, 9, et un double point à la 12ᵉ."],
        ],
      },
      exercise: "Compare `note(\"e2 e3\")` (12 cases sur une corde) et `note(\"e2 a2 d3 g3 b3 e4\")` : deux façons de monter sur le manche.",
      rich: true,
    },

    {
      id: "3.5",
      kicker: "Mettre d'accord",
      title: "S'accorder : la méthode de la 5ᵉ case",
      concept: "Pour accorder sans accordeur : la 5ᵉ case d’une corde doit donner exactement la note de la corde suivante, à vide. Exception : sur la corde de sol (G), c’est la 4ᵉ case qui donne le si (B). Si les deux notes ne sont pas identiques, on entend un battement lent : on tourne la mécanique jusqu’à ce qu’il disparaisse.",
      code: "note(\"a2 a2, e3 e3\").s(\"gm_acoustic_guitar_nylon\").clip(1.5)",
      decode: [
        ["5ᵉ case du mi grave", "= A : doit sonner comme la corde de la à vide."],
        ["a2 = a2", "deux notes identiques : aucun battement."],
        ["exception sol → si", "la 4ᵉ case de sol donne si."],
      ],
      theory: {
        title: "L’ordre des comparaisons",
        items: [
          ["E → A", "5ᵉ case de mi = corde de la."],
          ["A → D", "5ᵉ case de la = corde de ré."],
          ["D → G", "5ᵉ case de ré = corde de sol."],
          ["G → B", "4ᵉ case de sol = corde de si (l’exception)."],
          ["B → E", "5ᵉ case de si = corde de mi aiguë."],
        ],
      },
      recap: {
        title: "Récap chapitre 1 — Le manche",
        columns: ["Repère", "Sur le manche", "Dans Strudel"],
        rows: [
          ["cordes à vide", "mi la ré sol si mi, du grave à l’aigu", "`note(\"e2 a2 d3 g3 b3 e4\")`"],
          ["une case", "+1 demi-ton", "`note(\"e2 f2\")`"],
          ["deux cases", "+1 ton", "`note(\"e2 f#2\")`"],
          ["octave", "12 cases plus haut", "`note(\"e2 e3\")`"],
          ["accordage", "5ᵉ case = la corde à vide suivante (de sol à si : 4ᵉ case)", "`note(\"a2 a2\")`"],
        ],
      },
      exercise: "Vérifie ta vraie guitare : joue `a2` dans Strudel et la corde de la. Si tu entends un battement, elles ne sont pas exactement accordées.",
      free: "Tu lis le manche comme une carte : 6 cordes, des cases qui ajoutent chacune un demi-ton, l’octave à la 12ᵉ case. Essaie `note(\"e2 f#2 g#2 a2 b2\")` : les cases 0, 2, 4, 5 et 7 de la corde de mi, soit le début de la gamme de mi majeur, sur une seule corde. Au chapitre 2, on apprend à trouver et déplacer n’importe quelle note.",
      rich: true,
      richRecap: true,
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
      id: "3.6",
      kicker: "Nommer les cases",
      title: "Trouver les notes sur la corde de Mi",
      concept: "Sur la corde de mi grave, en montant case par case, on retrouve les noms des notes dans l’ordre. Connaître les notes de cette corde suffit déjà à se repérer partout sur le manche.",
      code: "note(\"e2 f2 g2 a2 b2 c3 d3 e3\").s(\"gm_acoustic_guitar_nylon\").clip(1.2)",
      decode: [
        ["e2 f2 g2 …", "les notes naturelles (sans dièse) de la corde de mi grave."],
        ["cases 0 1 3 5 7 8 10 12", "E→F et B→C n’ont qu’une case d’écart (un demi-ton)."],
        ["e2 → e3", "8 notes naturelles, et on retombe sur mi, à la 12ᵉ case."],
      ],
      theory: {
        title: "Mi-fa et si-do",
        items: [
          ["E → F", "1 seule case : pas de touche noire entre elles sur un piano."],
          ["B → C", "pareil : 1 case."],
          ["les autres", "séparées par 2 cases (un ton), avec une note dièse/bémol entre."],
        ],
      },
      exercise: "Fais pareil sur la corde de la : `note(\"a2 b2 c3 d3 e3 f3 g3 a3\")`. Repère le pas court B→C.",
      rich: true,
    },

    {
      id: "3.7",
      kicker: "La gamme, version guitare",
      title: "Une gamme : le long ou en travers",
      concept: "Une [gamme](sol.gamme) se joue de deux façons sur la guitare : sur une seule corde (en montant les cases) ou en travers (en changeant de corde). Strudel rend les deux audibles.",
      code: "note(\"0 2 4 5 7 9 11 12\".add(\"48\")).s(\"gm_acoustic_guitar_steel\").clip(1.2)",
      decode: [
        ["\"0 2 4 5 7 9 11 12\"", "les écarts en demi-tons de la gamme majeure : ton, ton, demi-ton, ton, ton, ton, demi-ton."],
        [".add(\"48\")", "48 = do3, une octave sous le do central (60) : on pose la gamme sur ce do."],
        ["sur une corde", "cette suite de cases dessine la gamme en ligne."],
      ],
      theory: {
        title: "Le lien avec la théorie",
        items: [
          ["la recette", "do majeur = +0 +2 +4 +5 +7 +9 +11 +12 demi-tons (voir [gamme majeure](sol.majeur))."],
          ["une corde", "montre la gamme en ligne : idéal pour voir les intervalles."],
          ["en travers", "`n()` + `scale()` donne les mêmes notes ; sur le manche, on les répartit sur plusieurs cordes."],
        ],
      },
      exercise: "Compare avec `n(\"0 1 2 3 4 5 6 7\").scale(\"C:major\").s(\"gm_acoustic_guitar_steel\")` : même gamme, écrite en degrés.",
      rich: true,
    },

    {
      id: "3.8",
      kicker: "Le capo",
      title: "Le capo = tout monter d'un coup",
      concept: "Un [capo](voc.guitare.capo) serre toutes les cordes à une case : il monte tout de N demi-tons sans changer les doigtés. Dans Strudel, c’est `.add(note(N))` (voir [add](fn.add)).",
      code: "note(\"e2 a2 d3 g3 b3 e4\").add(note(\"<0 2 5>\")).s(\"gm_acoustic_guitar_nylon\").clip(1.5)",
      decode: [
        [".add(note(\"<0 2 5>\"))", "sans capo, puis capo 2, puis capo 5 : un par cycle."],
        ["capo 2", "+2 demi-tons : tout sonne un ton plus haut."],
        ["à quoi ça sert", "changer la hauteur d’une chanson (pour la voix, par exemple) sans réapprendre les positions."],
      ],
      theory: {
        title: "Transposer",
        items: [
          ["transposer", "décaler toutes les notes du même intervalle (voir [transpose](fn.transpose))."],
          ["capo N", "transposer de N demi-tons vers l’aigu."],
          ["les formes", "restent les mêmes, juste plus haut."],
        ],
      },
      exercise: "Fixe le capo à la 3ᵉ case : remplace par `.add(note(3))`. Toutes les cordes montent de 3 demi-tons.",
      rich: true,
    },

    {
      id: "3.9",
      kicker: "L'arme du guitariste",
      title: "La boîte pentatonique : improviser",
      concept: "La [pentatonique](sol.pentatonique) tient sur le manche dans une « boîte » : une position des doigts qui couvre les 5 notes de la gamme sur plusieurs cordes, et qu’on peut déplacer. Sans demi-ton entre ses notes, aucune ne frotte : c’est le terrain de jeu de l’improvisation.",
      code: "setcpm(70/4)\nn(\"0 1 2 3 4 5 6 7\").scale(\"E:minor:pentatonic\").s(\"gm_electric_guitar_clean\").clip(1.3)",
      decode: [
        ["E:minor:pentatonic", "mi mineur pentatonique : mi, sol, la, si, ré."],
        ["n(\"0 … 7\")", "les degrés de la gamme, du grave à l’aigu (5 = mi, une octave plus haut)."],
        ["gm_electric_guitar_clean", "une électrique au son clair."],
      ],
      theory: {
        title: "La boîte",
        items: [
          ["pentatonique", "5 notes par octave."],
          ["la boîte", "une forme de doigts déplaçable : la même forme, ailleurs, donne une autre tonalité."],
          ["mi mineur", "une tonalité confortable à la guitare : ses notes incluent plusieurs cordes à vide."],
        ],
      },
      exercise: "Improvise : `n(\"0 2 3 4 2 0 <3 5>\").scale(\"E:minor:pentatonic\")`. Tout sonne juste.",
      rich: true,
    },

    {
      id: "3.10",
      kicker: "Premier riff",
      title: "Assembler : un riff sur le manche",
      concept: "On réunit les repères : des notes graves saturées sur les cordes basses, la pentatonique par-dessus. Un vrai début de riff, dans une seule tonalité.",
      code: "setcpm(80/4)\n$: note(\"<e2 e2 g2 a2>*2\").s(\"gm_distortion_guitar\").clip(.6).gain(.7)\n$: n(\"0 ~ 2 3 ~ 2 ~ 0\").scale(\"E:minor:pentatonic\").s(\"gm_electric_guitar_clean\").gain(.5)",
      decode: [
        ["<e2 e2 g2 a2>*2", "deux notes graves par cycle, qui avancent dans la liste : mi, mi, puis sol, la. Le moteur du riff."],
        [".clip(.6)", "notes un peu courtes, plus mordantes (vers le palm mute, leçon 3.18)."],
        ["la pentatonique par-dessus", "la mélodie reste en mi mineur pentatonique : tout s’accorde."],
      ],
      theory: {
        title: "Ce que tu relies",
        items: [
          ["le rythme", "tempo, `< >`, `$:`, `gain`."],
          ["la théorie", "pentatonique, tonalité."],
          ["la guitare", "cordes, son de guitare, manche."],
        ],
      },
      recap: {
        title: "Récap chapitre 2 — Lire le manche",
        columns: ["Concept", "Repère guitare", "Strudel"],
        rows: [
          ["notes d’une corde", "chaque case monte d’un demi-ton", "`note(\"e2 f2 g2 a2\")`"],
          ["gamme", "le long d’une corde, ou en travers des cordes", "`n(\"0 2 4\").scale(\"C:major\")`"],
          ["capodastre", "toutes les cordes montent du même nombre de cases", "`.add(note(2))` : capo en 2ᵉ case"],
          ["boîte pentatonique", "une forme de doigts qui marche partout sur le manche", "`.scale(\"E:minor:pentatonic\")`"],
        ],
      },
      exercise: "Change la basse en `<a2 a2 c3 d3>` et la mélodie en `A:minor:pentatonic` : tu transposes le riff en la mineur.",
      free: "Tu sais lire le manche : nommer les notes, jouer une gamme, poser un capodastre, improviser dans la boîte pentatonique. Fais varier ton riff : change le tempo, la basse, ajoute une batterie sur une autre [piste](fn.dollar). Au chapitre 3, les accords ouverts, les positions « feu de camp ».",
      rich: true,
      richRecap: true,
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
      id: "3.11",
      kicker: "Les positions de base",
      title: "Les accords ouverts : Mi majeur",
      concept: "Un accord « ouvert » utilise des cordes à vide et quelques doigts près du sillet. Le mi majeur (E) est le plus simple : 3 doigts, 6 cordes qui sonnent. Voici ses vraies notes.",
      code: "note(\"[e2,b2,e3,g#3,b3,e4]\").s(\"gm_acoustic_guitar_nylon\").room(.4)",
      decode: [
        ["[e2,b2,e3,g#3,b3,e4]", "les 6 cordes du mi majeur ouvert, de la grave à l’aiguë."],
        ["crochets + virgules", "toutes les notes en même temps : un [accord](sol.accord)."],
        ["g#3", "la tierce majeure : c’est elle qui rend l’accord majeur."],
      ],
      theory: {
        title: "L’accord de mi",
        items: [
          ["fondamentale", "E (mi) : la note qui nomme l’accord."],
          ["tierce majeure", "G# : la couleur claire."],
          ["quinte", "B (si) : la stabilité."],
          ["notes doublées", "6 cordes, mais seulement 3 notes différentes (E, G#, B)."],
        ],
      },
      exercise: "Joue l’accord, puis arpège-le, une corde après l’autre : `note(\"e2 b2 e3 g#3 b3 e4\")`.",
      rich: true,
    },

    {
      id: "3.12",
      kicker: "La bascule",
      title: "Mi majeur → Mi mineur",
      concept: "Pour passer de mi majeur à mi mineur, on lève un seul doigt : la tierce majeure (G#) descend d’un demi-ton et devient la tierce mineure (G). Un demi-ton change toute l’humeur (voir [tierce](sol.tierce)).",
      code: "note(\"[e2,b2,e3,g#3,b3,e4] [e2,b2,e3,g3,b3,e4]\").s(\"gm_acoustic_guitar_nylon\").room(.4)",
      decode: [
        ["1er accord : g#3", "mi MAJEUR : clair."],
        ["2ᵉ accord : g3", "mi MINEUR : sombre. Seul g# → g a changé."],
        ["un seul demi-ton", "la tierce décide : majeur ou mineur."],
      ],
      theory: {
        title: "La tierce qui colore",
        items: [
          ["majeur", "tierce à 4 demi-tons (g#)."],
          ["mineur", "tierce à 3 demi-tons (g)."],
          ["sur la guitare", "lever le doigt de la 3ᵉ corde : E → Em."],
        ],
      },
      exercise: "Écoute l’alternance plusieurs fois (le code la joue). Ferme les yeux : entends l’humeur basculer.",
      rich: true,
    },

    {
      id: "3.13",
      kicker: "La trousse",
      title: "Les accords « feu de camp »",
      concept: "Avec une poignée d’accords ouverts (E, A, D, G, C et leurs mineurs), on accompagne énormément de chansons. Voici A, D, G et C dans leurs positions ouvertes habituelles.",
      code: "note(\"<[a2,e3,a3,c#4,e4] [d3,a3,d4,f#4] [g2,b2,d3,g3,b3,g4] [c3,e3,g3,c4,e4]>\").s(\"gm_acoustic_guitar_steel\").room(.4)",
      decode: [
        ["A (la majeur)", "[a2,e3,a3,c#4,e4] : 5 cordes ; c#4 est la tierce."],
        ["D (ré majeur)", "[d3,a3,d4,f#4] : 4 cordes seulement."],
        ["G (sol majeur)", "[g2,b2,d3,g3,b3,g4] : 6 cordes."],
        ["C (do majeur)", "[c3,e3,g3,c4,e4] : 5 cordes."],
      ],
      theory: {
        title: "Les positions ouvertes",
        items: [
          ["ouvert", "mêle cordes à vide et doigts près du sillet : facile et sonore."],
          ["les mineurs", "Am, Dm, Em existent aussi : la tierce est abaissée d’un demi-ton."],
          ["pourquoi ceux-là", "leurs notes tombent sur plusieurs cordes à vide."],
        ],
      },
      exercise: "Enchaîne-les lentement. Puis essaie un mineur : Am = `note(\"[a2,e3,a3,c4,e4]\")` (c4 au lieu de c#4).",
      rich: true,
    },

    {
      id: "3.14",
      kicker: "Les 4 accords",
      title: "La grille « 4 accords » à la guitare",
      concept: "En do majeur, les accords C, G, Am et F forment la [progression](sol.progression) pop la plus répandue : I–V–vi–IV. Avec une batterie, c’est déjà une chanson.",
      code: "setcpm(100/4)\n$: chord(\"<C G Am F>\").voicing().s(\"gm_acoustic_guitar_nylon\").room(.4).gain(.7)\n$: sound(\"bd*4, [~ sd]*2\").bank(\"RolandTR909\").gain(.6)",
      decode: [
        ["chord(\"<C G Am F>\")", "les noms des accords ; Strudel trouve les notes."],
        [".voicing()", "choisit des dispositions proches d’un accord à l’autre (voir [voicing](fn.voicing))."],
        ["+ batterie", "une boucle de batterie : un accompagnement complet."],
      ],
      theory: {
        title: "La progression",
        items: [
          ["I–V–vi–IV", "C–G–Am–F en do majeur."],
          ["« 4 accords »", "la grille d’innombrables chansons pop."],
          ["voicing()", "évite d’écrire chaque note ; ses dispositions ne correspondent pas forcément aux positions d’une guitare."],
        ],
      },
      exercise: "Change la grille : `chord(\"<G D Em C>\").voicing()`. Une autre chanson, même recette.",
      rich: true,
    },

    {
      id: "3.15",
      kicker: "Première chanson",
      title: "Une chanson : accords + rythme",
      concept: "Donne un rythme de grattage à tes accords avec [struct](fn.struct) : des frappes (`x`) et des silences (`~`). Tu passes de « plaquer un accord » à « gratter une chanson ».",
      code: "setcpm(110/4)\n$: chord(\"<C G Am F>\").voicing().struct(\"x ~ x x ~ x ~ x\").s(\"gm_acoustic_guitar_steel\").room(.3).gain(.7)\n$: sound(\"bd ~ sd ~\").bank(\"RolandTR909\").gain(.6)",
      decode: [
        [".struct(\"x ~ x x ~ x ~ x\")", "le motif de grattage : x = on gratte, ~ = on laisse passer."],
        ["un accord par cycle", "la grille avance, le motif de rythme se répète."],
        ["gm_acoustic_guitar_steel", "une folk au son clair."],
      ],
      theory: {
        title: "Le grattage",
        items: [
          ["struct", "sépare le RYTHME (quand) de l’HARMONIE (quoi)."],
          ["bas / haut", "sur une vraie guitare, les coups alternent vers le bas et vers le haut."],
        ],
      },
      recap: {
        title: "Récap chapitre 3 — Accords ouverts",
        columns: ["Accord", "Vraies notes", "Raccourci"],
        rows: [
          ["mi majeur", "`[e2,b2,e3,g#3,b3,e4]`", "`chord(\"E\").voicing()`"],
          ["mi mineur", "`[e2,b2,e3,g3,b3,e4]`", "`chord(\"Em\").voicing()`"],
          ["la, ré, sol, do", "positions ouvertes", "`chord(\"<A D G C>\").voicing()` : notes calculées, pas la position de guitare"],
          ["grille", "I-V-vi-IV", "`chord(\"<C G Am F>\").voicing()`"],
          ["grattage", "le rythme des frappes", "`.struct(\"x ~ x x\")`"],
        ],
      },
      exercise: "Change le motif : `.struct(\"x x ~ x x ~ x ~\")`. Les mêmes accords, un autre groove.",
      free: "Tu as les accords ouverts (mi, mi mineur, la, ré, sol, do), la grille à quatre accords et le grattage avec [struct](fn.struct). Monte ta chanson : quatre accords, un patron de grattage, une batterie. Au chapitre 4, on rend ces accords mobiles : power chords et barrés.",
      rich: true,
      richRecap: true,
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
      id: "3.16",
      kicker: "Le rock",
      title: "Le power chord : fondamentale + quinte",
      concept: "Le [power chord](voc.guitare.power-chord), c’est deux notes : la fondamentale et sa [quinte](sol.quinte). Sans tierce, il n’est ni majeur ni mineur ; et saturé, il reste net, alors qu’un accord complet devient vite brouillon.",
      code: "note(\"[e2,b2] [a2,e3] [d3,a3]\").s(\"gm_distortion_guitar\").clip(1).gain(.7)",
      decode: [
        ["[e2,b2]", "E5 : mi + sa quinte (si), 7 demi-tons d’écart."],
        ["[a2,e3]", "A5 : la même forme, sur la corde de la."],
        ["gm_distortion_guitar", "la guitare saturée : le son du power chord."],
      ],
      theory: {
        title: "La quinte",
        items: [
          ["quinte juste", "7 demi-tons, rapport de fréquences proche de 3:2 : très stable."],
          ["pas de tierce", "ni majeur ni mineur : neutre et solide."],
          ["à la guitare", "deux cordes voisines, la quinte deux cases plus haut sur la corde suivante."],
        ],
      },
      exercise: "Ajoute la fondamentale à l’octave : `note(\"[e2,b2,e3]\")`. Le power chord à 3 cordes.",
      rich: true,
    },

    {
      id: "3.17",
      kicker: "Mobile",
      title: "Une seule forme, partout",
      concept: "La force du power chord : c’est une forme mobile. La même position de doigts, glissée sur le manche, donne tous les power chords. En code : la même forme `[0,7]`, déplacée avec `.add()`.",
      code: "note(\"[0,7]\".add(\"<40 45 47 43>\")).s(\"gm_distortion_guitar\").clip(.9).gain(.7)",
      decode: [
        ["[0,7]", "la forme : fondamentale (0) + quinte (7 demi-tons)."],
        [".add(\"<40 45 47 43>\")", "on pose la forme sur les numéros MIDI 40 (E2), 45 (A2), 47 (B2), 43 (G2) : E5, A5, B5, G5."],
        ["mobile", "aucune corde à vide : on peut la glisser n’importe où."],
      ],
      theory: {
        title: "Les formes mobiles",
        items: [
          ["forme", "un motif d’intervalles qu’on déplace sans le changer."],
          ["power chord", "la forme mobile la plus simple : 2 notes."],
          ["nom", "le power chord prend le nom de sa note grave."],
        ],
      },
      exercise: "Compose un riff : `note(\"[0,7]\".add(\"<40 40 43 45>\")).fast(2)`. `.fast(2)` fait passer la suite deux fois par cycle (voir [fast](fn.fast)).",
      rich: true,
    },

    {
      id: "3.18",
      kicker: "Étouffer",
      title: "Le palm mute : des notes courtes",
      concept: "En posant la tranche de la main près du chevalet, le guitariste étouffe les cordes : le son devient court et percussif, c’est le [palm mute](voc.guitare.palm-mute). Dans Strudel, on raccourcit les notes avec [clip](fx.clip) : petite valeur = son étouffé.",
      code: "setcpm(120/4)\nnote(\"e2*8\").s(\"gm_distortion_guitar\").clip(\"<.2 1>\").gain(.7)",
      decode: [
        ["e2*8", "huit mi graves dans le cycle."],
        [".clip(.2)", "chaque note ne dure que 20 % de son pas : le « tchouk-tchouk » du palm mute."],
        [".clip(1)", "notes pleines : les cordes sonnent librement."],
      ],
      theory: {
        title: "L’articulation",
        items: [
          ["palm mute", "main posée près du chevalet : son court, étouffé."],
          ["clip", "règle la durée : 1 = le pas entier, moins = plus court, plus = laisse sonner."],
          ["les cousins", "`decay`, `sustain`, `release` sculptent aussi la durée (voir [enveloppe](sol.enveloppe))."],
        ],
      },
      exercise: "Mélange étouffé et ouvert : `note(\"e2*8\").clip(\".2 .2 .2 1 .2 .2 1 1\")`. Un motif metal.",
      rich: true,
    },

    {
      id: "3.19",
      kicker: "L'accord mobile",
      title: "Le barré : un accord ouvert qui voyage",
      concept: "Un accord [barré](voc.guitare.barre), c’est une forme d’accord ouvert dont l’index joue le rôle du sillet, puis qu’on déplace. La forme de mi majeur, montée de N cases, donne n’importe quel accord majeur.",
      code: "note(\"[e2,b2,e3,g#3,b3,e4]\".add(\"<0 1 3 5>\")).s(\"gm_electric_guitar_clean\").room(.3).gain(.7)",
      decode: [
        ["la forme de mi majeur", "[e2,b2,e3,g#3,b3,e4] (leçon 3.11)."],
        [".add(\"<0 1 3 5>\")", "déplacée de 0, 1, 3, 5 cases : mi, fa, sol, la majeur."],
        ["l’index", "il remplace le sillet : toute la forme monte."],
      ],
      theory: {
        title: "Le barré",
        items: [
          ["barré", "l’index couché sur toutes les cordes, comme un capo fait avec le doigt."],
          ["forme de mi", "donne les majeurs : F (case 1), G (case 3)…"],
          ["forme de mi mineur", "la même en mineur (g# → g) : Fm, Gm…"],
        ],
      },
      exercise: "Passe en mineur : remplace g#3 par g3, et garde `.add(\"<0 3 5>\")`. Tu obtiens Em, Gm, Am.",
      rich: true,
    },

    {
      id: "3.20",
      kicker: "Le mur du son",
      title: "Assembler : riff saturé + batterie",
      concept: "On réunit le chapitre : un power chord mobile, du palm mute, une grosse batterie. Le squelette d’un riff rock ou metal.",
      code: "setcpm(140/4)\n$: note(\"[0,7]\".add(\"40\")).struct(\"x x x ~ x x ~ x\").s(\"gm_distortion_guitar\").clip(.3).gain(.7)\n$: sound(\"bd*4, [~ sd]*2, hh*8\").bank(\"RolandTR909\").gain(.6)",
      decode: [
        ["[0,7].add(\"40\")", "un power chord de mi (E5)."],
        [".struct(\"x x x ~ x x ~ x\")", "le rythme du riff : 6 coups sur 8 pas."],
        [".clip(.3)", "palm mute serré : une attaque sèche."],
      ],
      theory: {
        title: "Ce que tu relies",
        items: [
          ["le rythme", "tempo rapide, `struct`, batterie 909."],
          ["la théorie", "la quinte du power chord."],
          ["la guitare", "forme mobile, palm mute, son saturé."],
        ],
      },
      recap: {
        title: "Récap chapitre 4 — Power chords et barrés",
        columns: ["Concept", "Forme", "Strudel"],
        rows: [
          ["power chord", "fondamentale + quinte (7 demi-tons)", "`note(\"[0,7]\".add(40))` : mi (MIDI 40)"],
          ["forme mobile", "la même forme, posée ailleurs", "`note(\"[0,7]\".add(\"<40 45 47>\"))`"],
          ["étouffé (*palm mute*)", "notes raccourcies", "`.clip(.2)`"],
          ["barré majeur", "la forme de mi, décalée de n cases", "`note(\"[e2,b2,e3,g#3,b3,e4]\".add(\"<0 1 3 5>\"))`"],
          ["barré mineur", "la forme de mi mineur", "`g3` au lieu de `g#3`"],
        ],
      },
      exercise: "Ralentis à `setcpm(110/4)` et change la note de base : `.add(\"<40 45 43>\")`. Un riff plus lourd.",
      free: "Tu rends les accords mobiles : power chords, palm mute, barrés majeurs et mineurs. Compose un riff : une forme `[0,7]`, un patron [struct](fn.struct), du palm mute, une batterie. Attention à la place de `.add` : il agit DANS `note(…)`, sur la chaîne de notes. `note(\"[0,7]\").add(40)` ne ferait rien (le moteur affiche `Can't do arithmetic on control pattern`) ; hors de `note(…)`, écris `.add(note(40))` (voir [add](fn.add)). Au chapitre 5, on soigne le jeu : arpèges, picking et dynamique.",
      rich: true,
      richRecap: true,
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
      id: "3.21",
      kicker: "Deux gestes",
      title: "Plaquer ou arpéger un accord",
      concept: "Un accord se joue plaqué (toutes les cordes d’un coup) ou [arpégé](sol.arpege) (corde après corde). Mêmes notes, geste différent, ambiance différente.",
      code: "note(\"<[c3,e3,g3,c4] [c3 e3 g3 c4]>\").s(\"gm_acoustic_guitar_nylon\").clip(1.5).room(.3)",
      decode: [
        ["[c3,e3,g3,c4]", "plaqué : les 4 notes ensemble (1er cycle)."],
        ["[c3 e3 g3 c4]", "arpégé : les mêmes notes l’une après l’autre (2ᵉ cycle)."],
        ["< >", "alterne plaqué et arpégé à chaque cycle."],
      ],
      theory: {
        title: "Le geste",
        items: [
          ["plaqué", "un coup de médiator ou de pouce sur toutes les cordes."],
          ["arpégé", "les cordes sonnent séparément."],
          ["fingerpicking", "arpéger aux doigts (voir [fingerpicking](voc.guitare.fingerpicking))."],
        ],
      },
      exercise: "Allonge l’arpège : `note(\"[c3 e3 g3 c4 e4 g4]\")`. Plus de notes, qui montent.",
      rich: true,
    },

    {
      id: "3.22",
      kicker: "Le picking",
      title: "Un motif de picking",
      concept: "Le fingerpicking joue les notes d’un accord une par une, dans un motif régulier. Dans Strudel : `n()` choisit, par leur position, les notes du voicing de chaque accord, et [clip](fx.clip) les laisse résonner.",
      code: "setcpm(90/4)\nn(\"0 1 2 3\").chord(\"<C Am F G>\").voicing().s(\"gm_acoustic_guitar_nylon\").clip(1.5).room(.3)",
      decode: [
        ["n(\"0 1 2 3\")", "joue les notes n° 0, 1, 2 et 3 du voicing, du grave à l’aigu."],
        [".chord(\"<C Am F G>\")", "un accord par cycle."],
        [".clip(1.5)", "chaque note dure un pas et demi : elles se chevauchent, effet « harpe »."],
      ],
      theory: {
        title: "Le picking",
        items: [
          ["fingerpicking", "jouer les cordes aux doigts, en motif."],
          ["n + voicing", "sélectionne les notes de l’accord par leur position."],
          ["pouce et doigts", "le pouce joue les graves, les doigts les aigus."],
        ],
      },
      exercise: "Change le motif : `n(\"0 1 2 3 2 1\").chord(\"<C Am F G>\").voicing()`. Un picking plus long.",
      rich: true,
    },

    {
      id: "3.23",
      kicker: "Le toucher",
      title: "Jouer fort, jouer doux",
      concept: "Un bon jeu n’est pas plat : on accentue certaines notes. [gain](fx.gain) règle le volume note par note, comme attaquer plus ou moins fort une corde.",
      code: "setcpm(100/4)\nnote(\"c3 e3 g3 c4\").s(\"gm_acoustic_guitar_steel\").gain(\"1 .5 .7 .5\").clip(1.2)",
      decode: [
        ["gain(\"1 .5 .7 .5\")", "la 1ʳᵉ note à plein volume, les autres plus faibles (0,5 ≈ −6 dB) : un accent."],
        ["accent", "appuyer le premier temps donne le groove."],
        ["limite", "avec ces sons enregistrés, `gain` change le volume, pas le timbre ; une vraie corde frappée fort sonne aussi plus brillante."],
      ],
      theory: {
        title: "La dynamique",
        items: [
          ["dynamique", "les variations de volume dans le jeu."],
          ["accent", "frapper plus fort une note clé, souvent le temps 1."],
          ["expressivité", "ce qui distingue un jeu vivant d’un jeu mécanique."],
        ],
      },
      exercise: "Déplace l’accent : `gain(\".5 1 .5 .7\")`. Le groove change de place.",
      rich: true,
    },

    {
      id: "3.24",
      kicker: "Les pédales",
      title: "Les effets : tes pédales virtuelles",
      concept: "Le guitariste branche des pédales : saturation, réverbération, écho, phaser. Strudel a les mêmes effets, et on peut les appliquer à n’importe quel son. Voici une électrique « pédalée ».",
      code: "setcpm(90/4)\nn(\"0 2 4 7 4 2\").scale(\"E:minor:pentatonic\").s(\"gm_electric_guitar_clean\").distort(\"2:.3\").phaser(2).delay(.25).room(.3)",
      decode: [
        [".distort(\"2:.3\")", "la [saturation](fx.distort) : quantité 2, volume ramené à 0,3 après."],
        [".phaser(2)", "le [phaser](fx.phaser), deux balayages par seconde ; la documentation officielle le présente comme une imitation des pédales de guitare."],
        [".delay(.25) / .room(.3)", "l’[écho](fx.delay) et la [réverbération](fx.room) : l’espace."],
      ],
      theory: {
        title: "La chaîne d’effets",
        items: [
          ["saturation", "écrase les crêtes de l’onde : le grain rock."],
          ["modulation", "phaser, vibrato (`vib`) : le son bouge."],
          ["espace", "écho et réverbération."],
        ],
      },
      exercise: "Retire les effets un par un pour entendre ce que chacun apporte. Puis pousse `.distort(\"6:.3\")`.",
      rich: true,
    },

    {
      id: "3.25",
      kicker: "Tout, ensemble",
      title: "Bilan : un morceau guitare complet",
      concept: "Le grand final, version industrial : une basse, des power chords saturés, une mélodie claire, et une batterie TR-909 rigide. Guitare et électronique se mêlent dans une même tonalité, mi mineur.",
      code: "setcpm(128/4)\n$: sound(\"bd*4, [~ sd]*2, hh*8\").bank(\"RolandTR909\").gain(.6)\n$: note(\"<e2 c2 g2 d2>\").s(\"gm_acoustic_bass\").clip(.9).gain(.7)\n$: note(\"<[e2,b2] [c3,g3] [g2,d3] [d3,a3]>\").struct(\"x ~ x x ~ x ~ x\").s(\"gm_distortion_guitar\").distort(\"2:.3\").gain(.5)\n$: n(\"0 2 4 2 <3 5>\").scale(\"E:minor\").s(\"gm_electric_guitar_clean\").gain(.45).delay(.2)",
      decode: [
        ["la batterie 909", "le moteur : kick sur chaque temps, sans swing."],
        ["les power chords saturés", "fondamentale + quinte, sans tierce : un mur de son."],
        [".struct(\"x ~ x x ~ x ~ x\")", "le rythme du riff : 5 coups sur 8 pas, dont deux sur des kicks (pas 1 et 3), les autres entre eux."],
        ["n(…).scale(\"E:minor\")", "une mélodie de guitare claire, qui tranche sur la saturation."],
      ],
      theory: {
        title: "Les trois modules réunis",
        items: [
          ["Module 1", "tempo, mini-notation, batterie, $:."],
          ["Module 2", "gamme, accords, tonalité, voicing."],
          ["Module 3", "son de guitare, grattage, picking, effets."],
        ],
      },
      recap: {
        title: "Récap chapitre 5 — Le jeu",
        columns: ["Geste", "Idée", "Strudel"],
        rows: [
          ["plaqué / arpégé", "ensemble / une par une", "`note(\"[c,e,g]\")` · `note(\"c e g\")`"],
          ["picking", "les notes de l’accord, choisies par leur rang", "`n(\"0 1 2 3\").chord(\"C\").voicing()`"],
          ["dynamique", "accentuer certaines frappes", "`.gain(\"1 .5 .7 .5\")`"],
          ["effets", "les pédales", "`.distort(2)` · `.phaser(2)` · `.delay(.3)`"],
          ["grattage", "le rythme", "`.struct(\"x ~ x x\")`"],
        ],
      },
      exercise: "Change la tonalité, en la mineur : la guitare saturée joue `chord(\"<Am F C G>\").voicing()` à la place des power chords (garde le `struct`), la basse `note(\"<a1 f2 c2 g2>\")`, la mélodie `scale(\"A:minor:pentatonic\")`.",
      free: "Tu as fait le tour du parcours Guitare : le manche, l’accordage, les accords ouverts, les power chords et barrés, et le jeu (picking, dynamique, effets). Défi industrial : pose tes power chords saturés sur un beat 4/4 bien rigide, puis coupe la guitare sur le 3ᵉ temps (un `~` dans le `struct`). Ce silence net au milieu de la mesure donne au riff son côté mécanique.",
      culture: {
        artist: "Front 242",
        track: "Headhunter",
        why: "Belgique, 1988 : de l’EBM (*electronic body music*), cousine de la musique industrielle. Un rythme martelé et une basse de séquenceur répétée, sans la moindre fioriture : la musique de machines dont s’inspire le riff que tu construis ici.",
      },
      rich: true,
      richRecap: true,
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

export const m4chapitre1 = {
  module: 4,
  chapter: 'La source',
  title: 'La source',
  subtitle: 'Les ondes & le timbre',
  flashs: [
    {
      id: "4.1",
      kicker: "Le plan du son",
      title: "Du son brut au son fini",
      concept: "Un son de synthé se fabrique en chaîne : une **source** (une [onde](son.ondes), riche en harmoniques), un **filtre** qui retire une partie de ces harmoniques, une **enveloppe** qui donne au son sa forme dans le temps, puis des **effets** qui le placent dans un espace. Ce parcours suit cette chaîne, un chapitre par étape. Fil rouge : le son *acid*, qui n’est rien d’autre qu’une onde, un filtre résonant et quelque chose qui fait bouger ce filtre.",
      code: "note(\"c3 e3 g3 c4\").s(\"sawtooth\")",
      decode: [
        ["note(\"c3 e3 g3 c4\")", "quatre hauteurs : do, mi, sol, do."],
        [".s(\"sawtooth\")", "la source : une onde en dent de scie, qui contient toutes les harmoniques de la note."],
        ["le son nu", "aucun filtre, aucun effet : la matière brute, brillante et agressive."],
      ],
      exercise: "Remplace `sawtooth` par `triangle` puis relance. Même mélodie, son plus doux : le triangle contient beaucoup moins d’harmoniques aiguës. Tu viens de changer la SOURCE.",
      rich: true,
    },

    {
      id: "4.2",
      kicker: "Les quatre ondes",
      title: "Les quatre ondes de base",
      concept: "Le synthé de Strudel calcule quatre ondes de base, de la plus douce à la plus brillante : `sine` (une seule fréquence), `triangle` et `square` (harmoniques impaires, faibles ou fortes), `sawtooth` (toutes les harmoniques). Même note, même volume : seul le [timbre](sol.timbre) change.",
      code: "note(\"c3 c3 c3 c3\").s(\"sine triangle square sawtooth\")",
      decode: [
        ["sine", "sinusoïde : aucune harmonique. Son pur, comme un sifflet."],
        ["triangle", "harmoniques impaires, très faibles : douce. C’est l’onde jouée sans `.s(…)`."],
        ["square", "harmoniques impaires, fortes : creuse, « nasale », le son des consoles 8 bits."],
        ["sawtooth", "toutes les harmoniques : la plus riche. Base des basses, leads et nappes."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["timbre", "ce qui distingue deux sons de même hauteur et de même volume. Voir [timbre](sol.timbre)."],
          ["onde", "la forme de la vibration, répétée à la fréquence de la note ; chaque forme a son timbre."],
          ["défaut", "une note sans `.s(…)` sonne avec l’onde `triangle`."],
        ],
      },
      exercise: "Garde une seule onde et joue une vraie mélodie : `note(\"c3 e3 g3 e3\").s(\"square\")`. Essaie les quatre, et choisis ta préférée.",
      rich: true,
    },

    {
      id: "4.3",
      kicker: "Le grain",
      title: "Pourquoi les ondes sonnent différemment",
      concept: "La différence entre les ondes, ce sont les **harmoniques** : des fréquences à 2, 3, 4… fois celle de la note, qui sonnent en même temps qu’elle. La sinusoïde n’a que la fondamentale ; la dent de scie les a toutes, la n-ième n fois plus faible que la première. Plus il y a d’harmoniques, plus le filtre aura de matière à retirer.",
      code: "note(\"c2\").s(\"<sine sawtooth>\").release(.5)",
      decode: [
        ["<sine sawtooth>", "un cycle de sinusoïde, un cycle de dent de scie : compare-les."],
        ["sine", "une seule fréquence : rien à filtrer, son lisse."],
        ["sawtooth", "la fondamentale + toutes ses harmoniques : du grain."],
      ],
      theory: {
        title: "Harmoniques et intervalles",
        items: [
          ["harmonique", "une fréquence multiple entière de la fondamentale. Par convention, la fondamentale est la 1ʳᵉ harmonique."],
          ["×2", "la 2ᵉ harmonique : l’[octave](sol.octave) au-dessus de la note."],
          ["×3", "la 3ᵉ harmonique : une [quinte](sol.quinte) au-dessus de cette octave (rapport 3:2 avec elle)."],
          ["×4, ×5", "deux octaves au-dessus, puis la tierce majeure au-dessus : un son riche contient déjà, en lui-même, les intervalles de l’accord majeur."],
        ],
      },
      exercise: "Écoute `sine` puis `sawtooth` sur la même note. Lequel a « plus de grain » ? C’est lui qu’on filtrera au chapitre suivant.",
      rich: true,
    },

    {
      id: "4.4",
      kicker: "Le bruit",
      title: "Le bruit : une source sans hauteur",
      concept: "Toutes les sources n’ont pas de note. Le [bruit](son.bruit), c’est toutes les fréquences à la fois, au hasard, sans aucune qui domine : l’oreille n’y entend pas de hauteur. `white` a autant d’énergie à chaque hertz et sonne aigu ; `pink` perd 3 dB par octave ; `brown` perd 6 dB par octave et sonne sourd. C’est la matière des cymbales, du souffle, du vent.",
      code: "s(\"<white pink brown>*8\").decay(.04).sustain(0).gain(.4)",
      decode: [
        ["white / pink / brown", "trois « couleurs » de bruit, de la plus aiguë à la plus sourde."],
        ["*8", "huit fois par cycle : un rythme de charleston."],
        [".decay(.04).sustain(0)", "chaque coup retombe au silence en 40 ms : une percussion courte (voir [decay](fx.decay))."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["bruit", "un son qui ne se répète jamais : pas de fréquence dominante, donc pas de hauteur."],
          ["usage", "charleston, cymbales, souffle, vent, montées (*risers*)."],
          ["charleston", "un vrai charleston est proche du bruit : son métal vibre à une multitude de fréquences sans rapport simple entre elles."],
        ],
      },
      exercise: "Mets le bruit sur un kick : `s(\"bd*2, white*8\").decay(.04).sustain(0)`. Un mini-groove de batterie à moitié synthétique.",
      rich: true,
    },

    {
      id: "4.5",
      kicker: "On assemble",
      title: "Mélanger les sources",
      concept: "On empile plusieurs sources avec `$:`, une piste par ligne. Voici un kit entièrement synthétique : un kick (une sinusoïde très grave qui retombe vite), un charleston (du bruit court) et une basse (une dent de scie filtrée). Aucun son enregistré.",
      code: "setcpm(120/4)\n$: note(\"c1*2\").s(\"sine\").decay(.18).sustain(0).gain(.9)\n$: s(\"white*8\").decay(.03).sustain(0).gain(.35)\n$: note(\"c2 eb2 g2 c2\").s(\"sawtooth\").lpf(800).gain(.5)",
      decode: [
        ["note(\"c1*2\").s(\"sine\")", "le kick : une sinusoïde à 33 Hz ; `decay(.18).sustain(0)` la fait retomber au silence en 0,18 s."],
        ["s(\"white*8\")", "le charleston : du bruit blanc, 30 ms par coup."],
        [".s(\"sawtooth\").lpf(800)", "la basse : une onde riche, dont le filtre retire les aigus au-dessus de 800 Hz."],
      ],
      recap: {
        title: "Récap chapitre 1 — La source",
        columns: ["Source", "Timbre", "Strudel"],
        rows: [
          ["sinusoïde", "une seule fréquence, aucune harmonique : ronde, pure", "`.s(\"sine\")`"],
          ["triangle", "harmoniques impaires très faibles : douce. Le son joué quand `s` n’est pas écrit", "`.s(\"triangle\")`"],
          ["carré", "harmoniques impaires, fortes : creuse, couleur 8-bit", "`.s(\"square\")`"],
          ["dent de scie", "toutes les harmoniques : riche, mordante", "`.s(\"sawtooth\")`"],
          ["bruit", "toutes les fréquences au hasard, sans hauteur : blanc (brillant), rose, brun (sourd)", "`.s(\"white\")` · `\"pink\"` · `\"brown\"`"],
        ],
      },
      exercise: "Fais ton propre kit : change l’onde de la basse, la couleur du bruit, la note du kick. Pour un kick plus percutant, ajoute `.penv(24).pdecay(.05)` (voir [penv](fx.penv)).",
      free: "Tu as la **source** : quatre [ondes](son.ondes), le [bruit](son.bruit), et l’idée que ses harmoniques décident du [timbre](sol.timbre). Tout son de synthé part de là. Au chapitre suivant, le [filtre](fx.lpf) retire une partie de ces harmoniques pour sculpter le son.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m4chapitre2 = {
  module: 4,
  chapter: 'Le filtre',
  title: 'Le filtre',
  subtitle: 'Sculpter le timbre',
  flashs: [
    {
      id: "4.6",
      kicker: "Le passe-bas",
      title: "Le passe-bas : adoucir le son",
      concept: "Le [filtre passe-bas](fx.lpf) (`lpf`) laisse passer les fréquences sous la *coupure* et atténue celles au-dessus, de plus en plus (environ 12 dB par octave). Il retire des harmoniques sans changer la note : coupure basse = son sourd, coupure haute = son brillant.",
      code: "note(\"c2 e2 g2 c3\").s(\"sawtooth\").lpf(\"<400 800 2000 8000>\")",
      decode: [
        [".lpf(…)", "le passe-bas : atténue au-dessus de la fréquence donnée, en hertz."],
        ["\"<400 … 8000>\"", "la coupure change à chaque cycle : le son s’ouvre peu à peu."],
        ["cutoff", "un autre nom du même réglage (aussi `ctf`, `lp`)."],
      ],
      theory: {
        title: "Synthèse soustractive",
        items: [
          ["l’idée", "partir d’un son riche (dent de scie) et RETIRER ce qu’on ne veut pas."],
          ["passe-bas", "le filtre le plus courant : garde le corps du son, retire la brillance."],
          ["en hertz", "la coupure va de 20 à 20 000 Hz. Repères : 200 étouffé, 800 rond, 2 000 présent, 8 000 presque ouvert."],
        ],
      },
      exercise: "Descends à `lpf(200)` (très sourd), puis monte à `lpf(6000)` (brillant). Trouve « ta » zone.",
      rich: true,
    },

    {
      id: "4.7",
      kicker: "La résonance",
      title: "La résonance : faire chanter le filtre",
      concept: "La [résonance](fx.lpq) (`lpq`) amplifie une bande étroite autour de la coupure : `lpq(n)` y ajoute n décibels. À forte dose, cette bosse siffle par-dessus le son : le filtre « chante ». Quand la coupure bouge, la bosse balaie les harmoniques et on entend une voyelle, « ouah » : le son acid.",
      code: "note(\"c2 e2 g2 c3\").s(\"sawtooth\").lpf(600).lpq(\"<0 10 20 30>\").gain(.5)",
      decode: [
        ["lpf(600)", "coupure fixe, plutôt basse."],
        ["lpq(\"<0 … 30>\")", "la résonance monte à chaque cycle : de 0 à +30 dB à la coupure."],
        ["lpq", "nom complet : `resonance`."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["résonance", "une bosse de volume à la fréquence de coupure : +n dB avec `lpq(n)`."],
          ["son acid", "un filtre résonant dont la coupure bouge à chaque note : la signature de la Roland TB-303."],
          ["prudence", "résonance forte = pics de volume. Baisse le `gain` avant de dépasser 20."],
        ],
      },
      exercise: "Pousse `lpq(25)` et balaie `lpf(\"<300 600 1200 2400>\")`. Entends le filtre « parler ».",
      rich: true,
    },

    {
      id: "4.8",
      kicker: "Passe-haut & bande",
      title: "Passe-haut & passe-bande",
      concept: "Le [passe-haut](fx.hpf) (`hpf`) fait l’inverse du passe-bas : il atténue les fréquences sous la coupure et garde l’aigu (son fin, « radio »). Le [passe-bande](fx.bpf) (`bpf`) ne garde qu’une bande autour d’une fréquence centrale ; `bpq` règle son étroitesse.",
      code: "note(\"c2 e2 g2 c3\").s(\"sawtooth\").hpf(\"<200 1000 3000>\")",
      decode: [
        [".hpf(…)", "le passe-haut : atténue en dessous de la fréquence donnée."],
        ["grave coupé", "plus la valeur monte, plus le son devient fin."],
        ["bpf", "le passe-bande : ne garde qu’une bande (à tester en exercice)."],
      ],
      theory: {
        title: "Les trois filtres",
        items: [
          ["lpf", "garde le GRAVE (*low pass*, « le bas passe ») : le plus courant."],
          ["hpf", "garde l’AIGU (*high pass*) : alléger un son, laisser la place à la basse."],
          ["bpf", "garde une BANDE : `bpq` est un facteur sans unité ; la largeur vaut à peu près la fréquence centrale divisée par `bpq`."],
        ],
      },
      exercise: "Remplace `hpf(\"<…>\")` par `bpf(1200).bpq(8)` : il ne reste qu’une bande d’environ 150 Hz autour de 1 200 Hz, un son très nasal.",
      rich: true,
    },

    {
      id: "4.9",
      kicker: "Le balayage",
      title: "Le filtre qui bouge (LFO)",
      concept: "Au lieu d’une coupure fixe, on la fait BOUGER avec un [signal](fn.signaux) (`sine`, `saw`…) : c’est le principe du *LFO* (oscillateur basse fréquence) des synthés. Piège : un signal n’est lu qu’au début de chaque note. Une note tenue garde donc la même coupure ; pour un balayage fluide, il faut beaucoup de notes, d’où `.segment(16)`.",
      code: "note(\"c2\").s(\"sawtooth\").segment(16).lpf(sine.range(300,3000).slow(2)).lpq(8).gain(.5)",
      decode: [
        ["sine.range(300,3000)", "la coupure suit une vague entre 300 et 3 000 Hz."],
        [".slow(2)", "un aller-retour toutes les 2 mesures."],
        [".segment(16)", "découpe la note tenue en 16 notes par cycle : 16 lectures du signal, donc 16 paliers de coupure."],
      ],
      theory: {
        title: "Le piège du signal figé",
        items: [
          ["signal", "`sine`, `saw`, `tri`, `rand`… : une valeur entre 0 et 1 qui varie avec le temps."],
          [".range(min, max)", "met le signal à l’échelle voulue (voir [range](fn.range))."],
          ["lecture", "le signal est lu au début de chaque note : plus il y a de notes, plus le mouvement paraît continu."],
        ],
      },
      exercise: "Change `sine` en `saw` (montée qui retombe d’un coup), ou ralentis avec `.slow(4)`.",
      rich: true,
    },

    {
      id: "4.10",
      kicker: "On assemble",
      title: "Filtrer un groove entier",
      concept: "Un filtre sur toute une piste change l’ambiance : une intro filtrée qui s’ouvre lentement est la montée classique de la musique électronique. Ici, la basse s’ouvre et se referme sur 8 mesures.",
      code: "setcpm(120/4)\n$: s(\"bd*4, hh*8\").gain(.6)\n$: note(\"c2 eb2 g2 c2\").s(\"sawtooth\").lpf(sine.range(400,4000).slow(8)).lpq(6).gain(.5)",
      decode: [
        ["lpf(sine.range(400,4000))", "la coupure balaie de 400 Hz (sourd) à 4 000 Hz (brillant), plus de trois octaves."],
        [".slow(8)", "un aller-retour sur 8 mesures : une ouverture lente."],
        ["les 4 notes par mesure", "suffisent à lire ce balayage lent : la coupure change de palier à chaque note."],
      ],
      recap: {
        title: "Récap chapitre 2 — Le filtre",
        columns: ["Filtre", "Effet", "Strudel"],
        rows: [
          ["passe-bas", "garde le grave, atténue au-dessus de la coupure (en Hz)", "`.lpf(800)`"],
          ["résonance", "ajoute n dB à la coupure : le son siffle", "`.lpq(20)`"],
          ["passe-haut", "l’inverse : atténue sous la coupure", "`.hpf(1500)`"],
          ["passe-bande", "garde une bande autour du centre ; `bpq` la resserre", "`.bpf(1200).bpq(8)`"],
          ["balayage", "la coupure suit un signal, relu au début de chaque note : il faut des notes courtes", "`.segment(16).lpf(sine.range(300, 3000))`"],
        ],
      },
      exercise: "Monte ton intro : pars de `lpf(300)`, ouvre jusqu’à 5 000, ajoute `lpq(8)` pour le « ouah ».",
      free: "Tu as le **filtre** : [passe-bas](fx.lpf), [résonance](fx.lpq), [passe-haut](fx.hpf), [passe-bande](fx.bpf) et le balayage par un [signal](fn.signaux). Avec les sources du chapitre 1, ça fait déjà des timbres à l’infini. Au chapitre 3 : l’[enveloppe](sol.enveloppe), la forme du son dans le temps.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m4chapitre3 = {
  module: 4,
  chapter: "L'enveloppe",
  title: "L'enveloppe",
  subtitle: 'La forme du son dans le temps',
  flashs: [
    {
      id: "4.11",
      kicker: "ADSR",
      title: "L'enveloppe : la forme du son",
      concept: "Une note n’apparaît pas d’un bloc : son volume a une forme dans le temps, l’[enveloppe](sol.enveloppe) ADSR. **Attack** : le temps pour monter de 0 au maximum. **Decay** : le temps pour redescendre vers le niveau tenu. **Sustain** : ce niveau, tenu tant que la note dure. **Release** : le temps pour s’éteindre après la fin de la note.",
      code: "note(\"c3 e3 g3 c4\").s(\"sawtooth\").attack(.01).decay(.2).sustain(.3).release(.3)",
      decode: [
        ["attack(.01)", "montée en 10 ms : départ net, sans clic."],
        ["decay(.2).sustain(.3)", "retombe en 0,2 s à 30 % du maximum, et s’y tient."],
        ["release(.3)", "après la fin de la note, s’éteint en 0,3 s."],
      ],
      theory: {
        title: "ADSR = 4 lettres",
        items: [
          ["A — Attack", "temps de montée, en secondes. Voir [attack](fx.attack)."],
          ["D — Decay", "temps de descente vers le niveau tenu. Voir [decay](fx.decay)."],
          ["S — Sustain", "le NIVEAU tenu, de 0 à 1 : ce n’est pas un temps ! Voir [sustain](fx.sustain)."],
          ["R — Release", "temps d’extinction après la fin de la note. Voir [release](fx.release)."],
        ],
      },
      exercise: "Change une seule lettre à la fois pour sentir son rôle. Commence par `attack(.5)`.",
      rich: true,
    },

    {
      id: "4.12",
      kicker: "Attaque & relâche",
      title: "Nappe ou pulsation",
      concept: "L’attaque change tout. Lente, une nappe qui gonfle (un *pad*) ; nette, une frappe immédiate. Le release décide de ce qui se passe après la note : court, les notes se détachent ; long, elles se fondent les unes dans les autres.",
      code: "note(\"<c3 e3 g3>\").s(\"sawtooth\").attack(\"<.5 .01>\").release(.6).lpf(1500)",
      decode: [
        ["attack(\"<.5 .01>\")", "un cycle, le son met une demi-seconde à monter ; le suivant, 10 ms."],
        ["release(.6)", "la note continue 0,6 s après sa fin."],
        ["nappe ou frappe", "même onde, même filtre : deux caractères opposés, uniquement par l’enveloppe."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["pad / nappe", "attaque lente + release long : un son d’ambiance, qui remplit."],
          ["pluck / stab", "attaque nette, son court : percussif, rythmique."],
          ["release", "ce qui suit la fin de la note : pour lier ou détacher les notes."],
        ],
      },
      exercise: "Fais une vraie nappe : `attack(1).release(2)` sur `note(\"<c3 e3>\")`. Puis l’inverse : `attack(0).release(.1)`.",
      rich: true,
    },

    {
      id: "4.13",
      kicker: "Déclin & maintien",
      title: "Le pluck : la note qui tombe",
      concept: "Pour un son percussif (*pluck*, xylophone, kick) : attaque rapide + sustain à zéro. La note monte, puis retombe toute seule jusqu’au silence en `decay` secondes, quelle que soit la durée écrite. Le decay ne s’entend QUE si le sustain est sous 1 : sinon il n’y a rien vers quoi retomber.",
      code: "note(\"c2 e2 g2 c3\").s(\"sawtooth\").attack(.01).decay(.15).sustain(0).lpf(2000)",
      decode: [
        ["attack(.01)", "frappe immédiate."],
        ["decay(.15).sustain(0)", "la note retombe à zéro en 0,15 s : un pluck."],
        ["sustain(0)", "sans lui, le decay serait inaudible (avec un sustain à 1)."],
      ],
      theory: {
        title: "D’où vient ce son",
        items: [
          ["instruments frappés", "une batterie, un piano, une corde pincée reçoivent leur énergie une seule fois, puis la perdent : leur volume décroît tout seul."],
          ["kick", "c’est exactement cette enveloppe, sur une onde très grave."],
          ["sustain bas", "la clé d’un son qui « plucke »."],
        ],
      },
      exercise: "Monte `sustain(.5)` : la note se tient. Puis `decay(.4).sustain(0)` : un pluck plus long.",
      rich: true,
    },

    {
      id: "4.14",
      kicker: "Enveloppe de filtre",
      title: "L'enveloppe de filtre : le son qui s'ouvre",
      concept: "Le coup de génie du synthétiseur : faire bouger le FILTRE avec une enveloppe, à chaque note. La coupure monte au-dessus de `lpf`, puis redescend : le son s’ouvre puis se referme tout seul, le « ouah ». `lpenv` règle de combien d’OCTAVES la coupure monte ; `lpa`, `lpd`, `lps`, `lpr` sont l’ADSR de ce mouvement. Voir [enveloppe de filtre](fx.lpenv).",
      code: "note(\"c2 e2 g2 c3\").s(\"sawtooth\").lpf(400).lpenv(4).lpa(.01).lpd(.2).lps(0).lpq(6)",
      decode: [
        ["lpf(400)", "la coupure de repos : filtre fermé."],
        ["lpenv(4)", "au début de chaque note, la coupure monte de 4 octaves : 400 × 2⁴ = 6 400 Hz."],
        ["lpa(.01).lpd(.2).lps(0)", "elle y monte en 10 ms, puis redescend vers 400 Hz en 0,2 s : le « ouah »."],
      ],
      theory: {
        title: "Deux enveloppes",
        items: [
          ["volume", "`attack`, `decay`, `sustain`, `release` : la forme du VOLUME."],
          ["filtre", "`lpa`, `lpd`, `lps`, `lpr` + `lpenv` : la forme de la COUPURE."],
          ["lpenv", "la profondeur, en octaves : 0 = rien, 1 = coupure doublée, 4 = ×16."],
        ],
      },
      exercise: "Pousse `lpenv(8)` (la coupure monte jusqu’à 20 000 Hz, le plafond) ou allonge `lpd(.6)` (le filtre met plus de temps à se refermer).",
      rich: true,
    },

    {
      id: "4.15",
      kicker: "On assemble",
      title: "Façonner un son de A à Z",
      concept: "Source + filtre + enveloppe de volume + enveloppe de filtre = un son de synthé complet, fait main. Voici une basse acid : une dent de scie filtrée, qui retombe vite, et dont le filtre s’ouvre et se referme à chaque note.",
      code: "setcpm(120/4)\nnote(\"c2 c2 eb2 c2 g1 c2 eb2 d2\").s(\"sawtooth\").lpf(300).lpenv(5).lpa(.01).lpd(.18).lps(.1).lpq(10).attack(.01).decay(.2).sustain(.2).release(.08).gain(.5)",
      decode: [
        ["note(\"c2 c2 eb2 …\")", "un motif de basse en do mineur."],
        ["lpenv(5).lpd(.18).lpq(10)", "à chaque note, la coupure monte de 5 octaves puis se referme en 0,18 s, avec une résonance de +10 dB : le grain acid."],
        ["decay(.2).sustain(.2)", "le volume retombe à 20 % en 0,2 s : une note légèrement pincée."],
      ],
      recap: {
        title: "Récap chapitre 3 — L’enveloppe",
        columns: ["Réglage", "Rôle", "Strudel"],
        rows: [
          ["attack", "secondes pour monter au maximum", "`.attack(.5)`"],
          ["decay, sustain", "secondes pour redescendre, puis niveau tenu (0 à 1)", "`.decay(.2).sustain(.3)`"],
          ["release", "secondes pour s’éteindre après la fin de la note", "`.release(.6)`"],
          ["les quatre d’un coup", "attack:decay:sustain:release", "`.adsr(\".01:.2:.3:.3\")`"],
          ["enveloppe de filtre", "la coupure monte de n octaves au début de chaque note, puis redescend", "`.lpenv(4).lpa(.01).lpd(.2)`"],
        ],
      },
      exercise: "Transforme la basse en nappe : `attack(.6)`, `sustain(.6)`, `release(1)`, `lpenv(2)`. Mêmes notes, tout autre son.",
      free: "Tu as l’**enveloppe** : la forme du volume ([ADSR](fx.adsr)) et celle du filtre ([lpenv](fx.lpenv)). Avec la source et le filtre, tu peux construire un son de synthé de zéro : une nappe (attack et release longs), un pincement (`decay(.1).sustain(0)`), une basse qui mord (enveloppe de filtre courte). Au chapitre 4, on lui donne de l’espace : [réverbération](fx.room) et [écho](fx.delay).",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m4chapitre4 = {
  module: 4,
  chapter: "L'espace",
  title: "L'espace",
  subtitle: 'Réverb & délai',
  flashs: [
    {
      id: "4.16",
      kicker: "La réverb",
      title: "La réverb : mettre le son dans une pièce",
      concept: "La [réverbération](fx.room) (`room`) place le son dans un espace : elle ajoute la traîne des milliers de réflexions d’une pièce. `room` règle le niveau de cette traîne (le son direct reste intact) ; [size](fx.size) (`roomsize`) règle sa durée, en secondes : petite pièce ou cathédrale.",
      code: "note(\"c3 e3 g3 c4\").s(\"triangle\").room(\"<0 .3 .6 .9>\").release(.2)",
      decode: [
        ["room(\"<0 … .9>\")", "le niveau de réverbération monte à chaque cycle."],
        ["0", "son sec, collé au haut-parleur."],
        [".9", "son lointain, baigné."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["réverbération", "les milliers de reflets d’un son dans un lieu, entendus comme une traîne continue."],
          ["room", "le niveau envoyé vers la réverbération, de 0 à 1."],
          ["roomsize", "la durée de la traîne, en secondes : le temps qu’elle met pour perdre 60 dB (autre nom : `size`). Défaut : 2."],
        ],
      },
      exercise: "Ajoute `.roomsize(8)` (une traîne de 8 s, une très grande salle), puis `.rlp(2000)` : la traîne est filtrée au-dessus de 2 000 Hz, plus feutrée et plus sombre.",
      rich: true,
    },

    {
      id: "4.17",
      kicker: "Le délai",
      title: "Le délai : l'écho qui répète",
      concept: "Le [délai](fx.delay) (`delay`) répète le son comme un écho, de plus en plus faiblement. `delaytime` règle l’intervalle entre les répétitions ; `delayfeedback`, la part de chaque répétition renvoyée pour produire la suivante. Plus elle est proche de 1, plus l’écho dure (le moteur plafonne à 0,98).",
      code: "note(\"c3 ~ e3 ~\").s(\"triangle\").delay(.5).delaytime(.25).delayfeedback(.4).release(.1)",
      decode: [
        ["delay(.5)", "le niveau de la première répétition (0 à 1)."],
        ["delaytime(.25)", "l’intervalle entre deux répétitions, en secondes (1 au maximum)."],
        ["delayfeedback(.4)", "chaque répétition garde 40 % de la précédente."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["delay", "le niveau de l’écho envoyé."],
          ["delaytime (dt)", "l’écart entre les répétitions, en secondes."],
          ["delayfeedback (dfb)", "la part renvoyée, de 0 à 0,98 : 0,5 donne une dizaine de répétitions audibles, 0,9 une longue traîne. Voir [delayfeedback](fx.delayfeedback)."],
        ],
      },
      exercise: "Pousse `delayfeedback(.7)` (longue traîne), puis `delaytime(.125)` (échos serrés).",
      rich: true,
    },

    {
      id: "4.18",
      kicker: "Le délai calé",
      title: "Caler le délai sur le tempo",
      concept: "Pour que l’écho groove, on cale son intervalle sur le tempo. À 120 BPM, un temps dure 0,5 s, une croche 0,25 s. `delaytime(.375)` = trois doubles-croches, une croche pointée : le délai « pointé » des guitaristes. Plus simple : `delaysync(3/16)`, qui compte en cycles et suit le tempo tout seul (voir [delaytime](fx.delaytime)).",
      code: "setcpm(120/4)\n$: s(\"bd*4\").gain(.6)\n$: note(\"c4 ~ ~ ~ e4 ~ ~ ~\").s(\"triangle\").delay(.6).delaytime(.375).delayfeedback(.5).gain(.7)",
      decode: [
        ["setcpm(120/4)", "120 BPM en 4/4 : 1 temps = 0,5 s."],
        ["delaytime(.375)", "0,5 × 0,75 : la croche pointée."],
        ["l’écho", "il tombe à contretemps, dans les trous du rythme."],
      ],
      theory: {
        title: "Le délai du guitariste",
        items: [
          ["croche pointée", "trois doubles-croches : l’écho décale chaque note par rapport à la grille, signature de beaucoup de solos."],
          ["la noire", "`delaytime(.5)` à 120 BPM : un écho par temps, qui double la mélodie."],
          ["calé", "un écho au hasard brouille ; calé sur le tempo, il groove."],
        ],
      },
      exercise: "Compare `delaytime(.5)` (la noire, carré) et `delaytime(.375)` (la croche pointée, qui « roule »).",
      rich: true,
    },

    {
      id: "4.19",
      kicker: "Les orbits",
      title: "Les orbits : séparer les espaces",
      concept: "La réverbération et le délai sont PARTAGÉS par [orbit](fx.orbit) : chaque orbit a une seule réverbération et un seul délai. Le niveau envoyé (`room`, `delay`) reste propre à chaque son ; mais la pièce elle-même (`roomsize`) et l’intervalle de l’écho sont ceux de la dernière note jouée sur l’orbit. Pour deux pièces différentes, il faut deux orbits.",
      code: "setcpm(120/4)\n$: note(\"c3 e3 g3\").s(\"triangle\").room(.8).roomsize(6).orbit(2)\n$: s(\"bd*4\").gain(.7)",
      decode: [
        [".orbit(2)", "le lead a sa propre réverbération, une salle de 6 s."],
        ["la batterie", "reste sur l’orbit 1 (le défaut), sans réverbération : sèche."],
        ["room par son", "la batterie n’envoie rien dans la réverbération : même sur la même orbit que le lead, elle resterait sèche."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["orbit", "un groupe d’effets partagés : une réverbération et un délai."],
          ["partagé", "les réglages de la pièce (`roomsize`, `roomlp`) et de l’écho (`delaytime`, `delayfeedback`) valent pour toute l’orbit."],
          ["propre à chaque son", "le niveau envoyé : `room`, `delay`."],
        ],
      },
      exercise: "Ajoute `.room(.3).roomsize(1)` à la batterie, puis enlève `.orbit(2)` du lead : les deux pistes partagent alors la même réverbération, dont la taille passe de 1 à 6 s selon la dernière note jouée. Remets `.orbit(2)` : chacune retrouve sa pièce.",
      rich: true,
    },

    {
      id: "4.20",
      kicker: "On assemble",
      title: "Un mix avec de l'espace",
      concept: "Produire, c’est placer chaque élément dans l’espace : batterie sèche, devant ; lead avec un délai calé sur le tempo ; nappe dans une grande réverbération. Chacun sur son orbit, pour que leurs réglages ne se mélangent pas.",
      code: "setcpm(120/4)\n$: s(\"bd*4, [~ sd]*2\").bank(\"RolandTR909\").gain(.6)\n$: note(\"<c3 e3 g3 b3>\").s(\"sawtooth\").lpf(1500).delay(.4).delaytime(.375).delayfeedback(.4).orbit(2).gain(.4)\n$: note(\"<c4 e4 g4>\").s(\"triangle\").attack(.4).release(1).room(.9).roomsize(8).orbit(3).gain(.3)",
      decode: [
        ["batterie (orbit 1)", "sèche, en avant."],
        ["lead (orbit 2)", "délai pointé, calé sur le tempo."],
        ["nappe (orbit 3)", "attaque lente, grande réverbération."],
      ],
      recap: {
        title: "Récap chapitre 4 — L’espace",
        columns: ["Effet", "Rôle", "Strudel"],
        rows: [
          ["réverbération", "la salle : `room` dose le mélange, `roomsize` la durée de la traîne", "`.room(.5).roomsize(4)`"],
          ["réverbération feutrée", "un passe-bas sur la traîne : plus sombre", "`.room(.5).roomlp(2000)`"],
          ["écho", "`delay` dose le mélange, `delaytime` l’écart en secondes (1 s au plus)", "`.delay(.5).delaytime(.375)`"],
          ["réinjection", "part de l’écho renvoyée dans l’écho, de 0 à 0,98 (plafond du moteur)", "`.delayfeedback(.4)`"],
          ["orbit", "un numéro de bus : chaque orbit a sa propre réverbération et son propre écho", "`.orbit(2)`"],
        ],
      },
      exercise: "Place tes trois couches dans trois espaces : change les orbits, la taille des réverbérations, l’intervalle des délais.",
      free: "Tu as l’**espace** : [réverbération](fx.room), [écho](fx.delay) calé ou non sur le tempo, et les [orbits](fx.orbit) pour donner à chaque piste son propre lieu. Ton son a maintenant une source, un timbre, une forme et un lieu. Dernier chapitre : la couleur (saturation, modulation) et le mélange final.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m4chapitre5 = {
  module: 4,
  chapter: 'La couleur & le mix',
  title: 'La couleur & le mix',
  subtitle: 'Saturation, modulation & assemblage',
  flashs: [
    {
      id: "4.21",
      kicker: "La saturation",
      title: "Salir le son : disto, crush, lo-fi",
      concept: "Salir le son lui donne du grain. La [saturation](fx.distort) (`distort`) écrase les crêtes de l’onde et ajoute des harmoniques, comme une pédale d’overdrive. Le [crush](fx.crush) arrondit chaque valeur sur peu de niveaux (son « 8 bits ») ; `coarse` ne garde qu’un échantillon sur n (son « lo-fi », métallique). La saturation fait monter le volume : compense.",
      code: "note(\"c2 eb2 g2 c2\").s(\"sawtooth\").lpf(2000).distort(\"4:.3\").gain(.5)",
      decode: [
        ["distort(\"4:.3\")", "quantité 4 ; la deuxième valeur baisse le volume après la saturation, à 0,3."],
        ["crush", "nombre de bits : `crush(4)` brutal, `crush(16)` intact."],
        ["coarse", "un échantillon sur n : `coarse(8)` = fréquence d’échantillonnage divisée par 8."],
      ],
      theory: {
        title: "Tes pédales",
        items: [
          ["distort (dist)", "overdrive, distorsion : le grain rock. Les sons faibles sont amplifiés d’environ e^distort fois."],
          ["crush", "le son « jeu vidéo » : l’onde devient un escalier."],
          ["volume", "la saturation pousse le volume : compense avec la deuxième valeur de `distort` (ou `postgain`) plutôt qu’avec `gain`, qui changerait la quantité de saturation."],
        ],
      },
      exercise: "Remplace par `.crush(\"<16 8 4 2>\")`, puis par `.coarse(\"<1 4 8 16>\")`. Deux façons de « salir ».",
      rich: true,
    },

    {
      id: "4.22",
      kicker: "La modulation",
      title: "Phaser & vibrato : faire bouger le son",
      concept: "La modulation met le son en mouvement. Le [phaser](fx.phaser) creuse une bande de fréquences et la fait monter et descendre : le son semble tourner. Le [vibrato](fx.vib) (`vib`) fait osciller la hauteur, comme le doigt qui vibre sur une corde.",
      code: "n(\"0 2 4 7 4 2\").scale(\"C:minor:pentatonic\").s(\"sawtooth\").phaser(2).vib(\"4:.2\").release(.3)",
      decode: [
        ["phaser(2)", "deux allers-retours du balayage par seconde."],
        ["vib(\"4:.2\")", "vibrato à 4 oscillations par seconde, ±0,2 demi-ton."],
        ["mouvement", "le son « respire » au lieu d’être figé."],
      ],
      theory: {
        title: "Gestes et pédales",
        items: [
          ["phaser", "une pédale de guitare classique. Celui de Strudel creuse un seul creux, un phaser analogique en creuse plusieurs."],
          ["vibrato", "chanteurs et violonistes : environ 5 à 7 oscillations par seconde."],
          ["modulation", "tout ce qui fait varier un réglage en continu."],
        ],
      },
      exercise: "Essaie `phaser(\"<1 4 8>\")` (de lent à rapide), ou `vib(\"6:.5\")` (un vibrato large, ±0,5 demi-ton).",
      rich: true,
    },

    {
      id: "4.23",
      kicker: "Le mix",
      title: "Dynamique & stéréo",
      concept: "Mixer, c’est équilibrer les volumes et placer chaque son dans l’espace stéréo. `gain` multiplie l’amplitude : `gain(.5)` = environ 6 dB de moins. `pan` place le son entre la gauche (0) et la droite (1). `postgain` règle le volume après tous les effets de la note.",
      code: "setcpm(120/4)\n$: s(\"hh*8\").gain(.4).pan(sine.range(0,1).slow(2))\n$: note(\"c3 e3 g3 c4\").s(\"triangle\").pan(\"<0 1>\").release(.3).gain(.6)",
      decode: [
        ["pan(sine.range(0,1))", "le charleston va de gauche à droite et revient."],
        ["pan(\"<0 1>\")", "les notes passent d’un côté à l’autre à chaque cycle."],
        ["gain", "le volume d’une piste ; `velocity` en est un second multiplicateur, note par note."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["gain", "multiplicateur LINÉAIRE de l’amplitude : `.5` ≈ −6 dB, `.25` ≈ −12 dB. Voir [gain](fx.gain)."],
          ["pan", "position stéréo, de 0 (gauche) à 1 (droite). Voir [pan](fx.pan)."],
          ["jux(rev)", "effet stéréo : la voie droite joue le motif à l’envers. Voir [jux](fn.jux)."],
        ],
      },
      exercise: "Remplace `.pan(\"<0 1>\")` par `.jux(rev)` sur la mélodie : à gauche elle joue à l’endroit, à droite à l’envers, et la stéréo s’élargit (au casque). Remplace, n’ajoute pas : `jux` décale le pan déjà écrit de 0,5 de chaque côté, si bien qu’avec `pan(0)` les deux copies tomberaient tout à gauche et au centre (voir [jux](fn.jux)).",
      rich: true,
    },

    {
      id: "4.24",
      kicker: "L'ordre compte",
      title: "La chaîne du signal",
      concept: "L’ordre dans ton CODE ne change rien : Strudel applique toujours les effets dans le même ordre (gain → filtres → crush → distorsion → pan → phaser → réverbération et délai). Autre règle : chaque effet n’existe qu’une fois par son. Deux `.lpf` ? La seconde valeur remplace la première.",
      code: "note(\"c2 eb2 g2 c2\").s(\"sawtooth\").lpf(800).distort(\"3:.3\").room(.3).gain(.6)",
      decode: [
        ["l’ordre du code", "libre : le résultat sonore est le même."],
        ["la chaîne réelle", "filtres, puis saturation, puis espace : toujours."],
        ["usage unique", "un effet écrit deux fois ne s’empile pas : seule la dernière valeur compte."],
      ],
      theory: {
        title: "Deux règles d’or",
        items: [
          ["ordre fixe", "gain → filtres → crush → distorsion → pan → phaser → réverbération et délai. Voir [ordre des effets](voc.effets.ordre-des-effets)."],
          ["usage unique", "un effet appelé deux fois : la seconde valeur remplace la première."],
          ["conséquence", "le filtre agit TOUJOURS avant la saturation : il ne peut pas adoucir le grain qu’elle ajoute."],
        ],
      },
      exercise: "Écris deux filtres : `.lpf(300).distort(\"3:.3\").lpf(3000)`. Tu n’obtiens PAS deux filtrages : seule la coupure à 3 000 Hz reste, et elle agit avant la saturation.",
      rich: true,
    },

    {
      id: "4.25",
      kicker: "Tout, ensemble",
      title: "Le morceau final : M1 → M4",
      concept: "Le grand final : un morceau qui réunit tout le parcours, autour d’une basse acide. La batterie et le tempo, la gamme et les accords, la guitare, et le son façonné à la main avec ses effets. En do mineur.",
      code: "setcpm(145/4)\n$: s(\"bd*4, [~ sd]*2, hh*8\").bank(\"RolandTR909\").gain(.6)\n$: note(\"c2(3,8)\").s(\"sawtooth\").lpf(500).lpenv(4).lpa(.01).lpd(.18).lps(.1).lpq(15).decay(.2).sustain(.15).gain(.5)\n$: chord(\"<Cm Ab Bb Eb>\").voicing().struct(\"x ~ x x\").s(\"gm_electric_guitar_clean\").distort(\"1.5:.3\").delay(.3).delaytime(.375).delayfeedback(.3).orbit(2).gain(.4)\n$: n(\"0 3 5 7 5 3\").scale(\"C:minor\").s(\"sawtooth\").attack(.01).release(.2).phaser(2).room(.4).orbit(3).gain(.35)",
      decode: [
        ["la batterie", "le moteur rythmique : kick sur chaque temps et charlestons serrés."],
        ["la basse acide", "dent de scie + enveloppe de filtre + forte résonance (`lpq(15)`), sur un rythme euclidien (3,8) : 3 coups répartis sur 8 pas, le *tresillo*."],
        ["les accords", "grille Cm-Ab-Bb-Eb, grattée, avec saturation et délai."],
        ["la mélodie", "en do mineur, avec phaser et réverbération."],
      ],
      theory: {
        title: "Les quatre modules réunis",
        items: [
          ["Module 1", "tempo, mini-notation, batterie, $:."],
          ["Module 2", "gamme, accords, tonalité, voicing."],
          ["Module 3", "guitare : grattage, picking, effets."],
          ["Module 4", "son : ondes, filtre, enveloppe, espace, couleur."],
        ],
      },
      recap: {
        title: "Récap chapitre 5 — La couleur et le mix",
        columns: ["Outil", "Rôle", "Strudel"],
        rows: [
          ["saturation", "écrase les crêtes, ajoute des harmoniques", "`.distort(\"4:.3\")` · `.crush(8)`"],
          ["modulation", "un réglage qui oscille tout seul", "`.phaser(2)` · `.vib(\"4:.2\")`"],
          ["stéréo", "placer de 0 (gauche) à 1 (droite)", "`.pan(.2)` · `.jux(rev)`"],
          ["volume", "multiplie l’amplitude (`gain(.5)` ≈ −6 dB) ; `postgain` agit après les filtres et la saturation", "`.gain(.6)` · `.postgain(1.2)`"],
          ["la chaîne", "ordre fixé par le moteur, quel que soit l’ordre d’écriture", "enveloppe → filtres → `crush` → `distort` → `pan` → `phaser` → écho et réverbération"],
        ],
      },
      exercise: "Change la tonalité : grille `chord(\"<Am F C G>\")`, basse `<a1 f1 c2 g1>`, mélodie `A:minor:pentatonic`.",
      free: "Tu as fait le tour du parcours « Sculpter le son ». Défi : fabrique une basse acid (voir le genre Acid) avec `sawtooth`, un passe-bas bas (`lpf(300)`), une résonance forte (`lpq(15)`) et une coupure qui bouge, par une [enveloppe de filtre](fx.lpenv) courte ou un [signal](fn.signaux) rapide. Puis ralentis tout : signal plus lent (`.slow(8)`), `attack` et `release` d’une seconde ou plus. La même matière devient une nappe.",
      culture: {
        artist: "Phuture",
        track: "Acid Tracks",
        why: "Chicago, 1987 : la ligne de basse d’une Roland TB-303, résonance poussée et filtre manipulé à la main pendant l’enregistrement. Le morceau qui a donné son nom à l’acid. Le sifflement de `lpq(15)` imite celui-là.",
      },
      rich: true,
      richRecap: true,
    },
  ],
};

/* Le Module 4 entier : la carte de ses 5 chapitres. */
export const module4 = {
  id: 4,
  titre: 'Module 4 — Son & Effets',
  title: 'Module 4',
  subtitle: 'Sculpter le son : ondes, filtres, enveloppes, espace, couleur',
  chapitres: [m4chapitre1, m4chapitre2, m4chapitre3, m4chapitre4, m4chapitre5],
};

/* ===========================================================================
   MODULE 5 — Informatique Musicale (Chantier 12).
   L'informatique musicale enseignée À TRAVERS Strudel : chaque concept est
   immédiatement audible. Fil rouge : « un pattern est une fonction du temps ».
   On passe d'écrire des NOTES à écrire des RÈGLES qui génèrent des notes.
   Toutes les fonctions sont vérifiées en direct contre strudel.cc/learn
   (factories, time-modifiers, signals, random-modifiers, conditional-modifiers,
   accumulation, input-output) le 6 juin 2026 — cutoff Claude = mai 2025.
   5 chapitres, 25 flashs (5.1 -> 5.25). Même format de flash que M1/M2/M3/M4.
   =========================================================================== */

export const m5chapitre1 = {
  module: 5,
  chapter: 'Le pattern est une fonction',
  title: 'Le pattern est une fonction',
  subtitle: 'Du « quoi » au « comment »',
  flashs: [
    {
      id: "5.1",
      kicker: "Le grand renversement",
      title: "Un pattern est une fonction du temps",
      concept: "Strudel ne garde pas une liste de notes : il garde une **règle**. Pendant que la musique joue, le moteur demande régulièrement au motif « quels événements tombent entre tel instant et tel instant ? », et le motif calcule la réponse. Un motif est donc une *fonction du temps* : on lui donne un intervalle de temps, il rend des événements. C’est ce qui permet de modifier le code pendant qu’il joue. Ce parcours explore deux usages : une musique qui se compose toute seule (hasard dosé) et une musique qui joue avec le temps (accélérer, retourner, décaler).",
      code: "note(\"<c4 e4 g4>\")",
      decode: [
        ["<c4 e4 g4>", "une note par cycle (voir [chevrons](mini.chevrons)) : à chaque cycle, le motif répond par la note suivante."],
        ["cycle 1 → c4", "pour l’intervalle du premier cycle, la fonction répond do4."],
        ["cycle 2 → e4", "pour le suivant, mi4 ; puis sol4 ; puis on recommence."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["interroger (query)", "demander au motif les événements d’un intervalle de temps : le cœur du moteur."],
          ["cycle", "l’unité de temps de Strudel ; tout est mesuré en cycles (voir [cycle](sol.cycle))."],
          ["déterministe", "même question, même réponse : rien n’est stocké, tout est recalculé (voir [déterministe](voc.aleatoire.deterministe))."],
        ],
      },
      exercise: "Remplace les chevrons par des crochets : `note(\"[c4 e4 g4]\")`. Les trois notes tombent alors dans UN seul cycle. Mêmes données, autre fonction du temps.",
      rich: true,
    },

    {
      id: "5.2",
      kicker: "Transformer, pas réécrire",
      title: "Une transformation prend un pattern",
      concept: "Si un motif est une fonction, alors `.rev()`, `.fast(2)`… sont des fonctions qui prennent un motif et en rendent un AUTRE. Elles ne modifient pas tes notes : elles fabriquent un nouveau motif qui interroge l’ancien et transforme ses réponses. D’où la chaîne `.a().b().c()` : chaque fonction emballe le résultat de la précédente.",
      code: "n(\"0 1 2 3 4 5 6 7\").scale(\"C:major\").rev()",
      decode: [
        ["n(\"0 1 … 7\").scale(\"C:major\")", "huit degrés de do majeur, en montant."],
        [".rev()", "prend ce motif et inverse l’ordre dans chaque cycle : la gamme descend."],
        ["les degrés", "intacts : 0 à 7. C’est l’emballage qui change, pas les données."],
      ],
      exercise: "L’ordre des transformations peut compter. Compare `n(\"0 1 2 3 4 5 6 7\").scale(\"C:major\").slow(2).rev()` et `….rev().slow(2)` : dans le premier, chaque cycle joue une moitié de gamme à l’envers (3 2 1 0, puis 7 6 5 4) ; dans le second, toute la gamme est retournée puis étalée (7 6 5 4, puis 3 2 1 0). Attention : certaines paires donnent le même résultat dans les deux ordres, comme `rev()` et `fast(2)` sur ce motif.",
      rich: true,
    },

    {
      id: "5.3",
      kicker: "Construire par le code",
      title: "seq, stack, cat : les fabriques",
      concept: "La mini-notation a des équivalents en fonctions : `seq(a, b)` joue l’un après l’autre dans un cycle (= `\"a b\"`), `stack(a, b)` joue tout en même temps (= `\"a, b\"`), `cat(a, b)` joue un motif par cycle (= `\"<a b>\"`). Pratique quand les éléments sont des motifs entiers, avec leurs propres réglages (voir [stack](fn.stack) et [cat](fn.cat)).",
      code: "stack(\n  s(\"bd*4\"),\n  s(\"hh*8\"),\n  note(\"c2 g2\").s(\"sawtooth\")\n)",
      decode: [
        ["stack(a, b, c)", "= `\"a, b, c\"` : les trois couches en même temps."],
        ["seq(a, b)", "= `\"a b\"` : a puis b, dans un cycle."],
        ["cat(a, b)", "= `\"<a b>\"` : a pendant un cycle, b le suivant."],
      ],
      theory: {
        title: "Les fabriques de motifs",
        items: [
          ["seq / fastcat", "tout tient dans un cycle : la séquence."],
          ["stack / pr", "superposition : plusieurs motifs en même temps."],
          ["cat / slowcat", "un élément par cycle : l’alternance."],
        ],
      },
      exercise: "Remplace `stack` par `cat` : tu passes de « tout en même temps » à « une couche par cycle ». Le même code, une musique très différente.",
      rich: true,
    },

    {
      id: "5.4",
      kicker: "Le code génère les données",
      title: "run : fabriquer des nombres",
      concept: "`run(n)` fabrique la suite 0, 1, 2… jusqu’à n − 1, répartie dans un cycle. Avec `.scale()`, c’est une gamme entière sans rien taper (voir [irand / run](fn.irand)). Première idée d’informatique musicale : le code ne joue pas seulement des notes, il les GÉNÈRE.",
      code: "n(run(8)).scale(\"C:major\")",
      decode: [
        ["run(8)", "= `\"0 1 2 3 4 5 6 7\"` : huit nombres générés, un huitième de cycle chacun."],
        ["n(…).scale(\"C:major\")", "transforme ces numéros en degrés de do majeur."],
        ["run(12)", "douze degrés : la gamme continue sur l’octave suivante, sans rien retaper."],
      ],
      exercise: "Génère, joue, retourne : `n(run(8)).scale(\"C:major\").s(\"sawtooth\").rev()`.",
      rich: true,
    },

    {
      id: "5.5",
      kicker: "On assemble",
      title: "Penser en fonctions",
      concept: "Il y a les DONNÉES (les notes, les degrés) et les FONCTIONS (ce qui les fabrique et les transforme). Voici un mini-morceau entièrement généré : une batterie empilée avec `stack`, une gamme produite par `run`, puis retournée.",
      code: "setcpm(120/4)\n$: stack(s(\"bd*4\"), s(\"hh*8\"))\n$: n(run(8)).scale(\"C:major\").s(\"sawtooth\").lpf(800).rev()",
      decode: [
        ["stack(s(\"bd*4\"), s(\"hh*8\"))", "la fabrique `stack` superpose kick et charleston."],
        ["n(run(8)).scale(…)", "`run` génère les degrés, `scale` les transforme en notes."],
        [".rev()", "une fonction de plus, branchée au bout de la chaîne."],
      ],
      recap: {
        title: "Récap chapitre 1 — Penser en fonctions",
        columns: ["Idée", "Mini-notation", "Fonction"],
        rows: [
          ["motif", "une fonction du temps", "le moteur lui demande ce qu’il joue sur un intervalle de temps"],
          ["séquence", "`\"a b\"`", "`seq(a, b)` : les deux dans le même cycle"],
          ["superposition", "`\"a, b\"`", "`stack(a, b)` : en même temps"],
          ["alternance", "`\"<a b>\"`", "`cat(a, b)` : un par cycle"],
          ["suite de nombres", "`\"0 1 2 3\"`", "`run(4)`"],
        ],
      },
      exercise: "Fais ton mini-morceau : change `run(8)` en `run(5)`, ajoute une transformation (`.fast(2)`, `.rev()`…) au bout. Tu écris des règles, pas des notes.",
      free: "Le renversement clé du parcours : un motif est une fonction du temps, que le moteur interroge sur un intervalle (« que joues-tu entre 0 et ¼ de cycle ? »), et les transformations (`fast`, `rev`…) sont des fonctions qui prennent un motif et en rendent un autre. Au chapitre suivant, on manipule le temps lui-même.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m5chapitre2 = {
  module: 5,
  chapter: 'Manipuler le temps',
  title: 'Manipuler le temps',
  subtitle: 'Le temps est une donnée',
  flashs: [
    {
      id: "5.6",
      kicker: "Étirer, comprimer",
      title: "slow & fast",
      concept: "`slow(n)` étire un motif sur n cycles ; `fast(n)` le comprime pour qu’il passe n fois par cycle. Ce sont les signes `/` et `*` de la mini-notation, mais en fonctions : on peut les appliquer à un motif entier, déjà transformé. Ralentir ne retire aucune note : ça les espace (voir [slow](fn.slow), [fast](fn.fast)).",
      code: "n(\"0 2 4 6\").scale(\"C:major\").s(\"sawtooth\").slow(2)",
      decode: [
        [".slow(2)", "= `\"[…]/2\"` : le motif s’étale sur deux cycles."],
        [".fast(2)", "= `\"[…]*2\"` : le motif passe deux fois par cycle, chaque note deux fois plus courte."],
        ["les notes", "identiques : seules leurs positions et leurs durées changent ; la hauteur ne bouge pas."],
      ],
      theory: {
        title: "Équivalences",
        items: [
          ["slow(2)", "comme `x/2` en mini-notation."],
          ["fast(2)", "comme `x*2`."],
          ["avantage", "la fonction s’applique APRÈS d’autres transformations, à tout le motif."],
        ],
      },
      exercise: "Superpose une version lente et une rapide : ajoute `.superimpose(x=>x.fast(2))`. Deux vitesses, une seule ligne écrite.",
      rich: true,
    },

    {
      id: "5.7",
      kicker: "À l’endroit, à l’envers",
      title: "rev & palindrome",
      concept: "`rev()` inverse l’ordre des événements dans chaque cycle : le dernier joue en premier. `palindrome()` alterne : un cycle à l’endroit, un cycle à l’envers. La boucle fait l’aller-retour sans que tu réécrives une seule note (voir [rev](fn.rev)).",
      code: "n(\"0 1 2 3 4 5 6 7\").scale(\"C:minor:pentatonic\").palindrome().s(\"triangle\")",
      decode: [
        ["palindrome()", "cycle 1 monte, cycle 2 descend, cycle 3 monte…"],
        ["C:minor:pentatonic", "la pentatonique mineure de do : cinq notes, aucune ne frotte."],
        ["aucune note réécrite", "c’est la fonction qui crée l’aller-retour."],
      ],
      exercise: "Compare : `.rev()` seul (toujours à l’envers) puis `.palindrome()` (alterne). Lequel boucle le plus naturellement ?",
      rich: true,
    },

    {
      id: "5.8",
      kicker: "La rotation",
      title: "iter : décaler le départ",
      concept: "`iter(n)` découpe le motif en n parts égales et, à chaque cycle, le fait commencer une part plus loin. Le riff tourne sur lui-même : même matériel, point de départ qui glisse. Il revient à l’original tous les n cycles (voir [iter](voc.code.iter-n)).",
      code: "n(\"0 1 2 3\").scale(\"C:major\").iter(4).s(\"sawtooth\")",
      decode: [
        ["iter(4)", "cycle 1 : 0 1 2 3 ; cycle 2 : 1 2 3 0 ; cycle 3 : 2 3 0 1 ; cycle 4 : 3 0 1 2 (vérifié dans le moteur)."],
        ["la boucle tourne", "elle revient au départ après 4 cycles."],
        ["iterBack(4)", "même chose, dans l’autre sens."],
      ],
      exercise: "Passe à `iter(8)` sur huit notes : la rotation met deux fois plus de temps à revenir au départ. Plus c’est long, plus ça « évolue ».",
      rich: true,
    },

    {
      id: "5.9",
      kicker: "Épaissir chaque coup",
      title: "ply : répéter chaque événement",
      concept: "`ply(n)` remplace CHAQUE événement par n copies plus courtes, au même endroit : un roulement, un bégaiement. À ne pas confondre avec `fast`, qui rejoue tout le motif : `ply` épaissit chaque coup en gardant sa place (voir [ply](fn.ply)).",
      code: "s(\"bd sd cp\").ply(\"<1 2 3>\")",
      decode: [
        ["ply(\"<1 2 3>\")", "cycle 1 : tel quel ; cycle 2 : chaque son doublé ; cycle 3 : triplé."],
        ["<…>", "le facteur change à chaque cycle : l’intensité monte."],
        ["roulement", "un roulement de caisse claire, c’est `ply` sur un `sd`."],
      ],
      exercise: "Pars de `s(\"hh*4\").ply(2)`, puis essaie un motif de ply : `.ply(\"2 1 2 3\")`. Chaque pas a son propre nombre de répétitions.",
      rich: true,
    },

    {
      id: "5.9b",
      kicker: "Répartir",
      title: "Les rythmes euclidiens : (k,n)",
      concept: "Deux nombres entre parenthèses après un son : `(k,n)` répartit k coups sur n pas, le plus régulièrement possible. C’est un rythme *euclidien* (voir [euclid](fn.euclid)). `(3,8)`, le *tresillo*, est l’une des syncopes les plus répandues, de la musique cubaine à la musique électronique.",
      code: "sound(\"bd(3,8), hh*8\")",
      decode: [
        ["bd(3,8)", "3 kicks répartis sur 8 pas, aux pas 1, 4 et 7 : `x ~ ~ x ~ ~ x ~`, le tresillo."],
        ["hh*8", "la grille témoin : 8 pas réguliers, pour entendre où tombent les 3 coups."],
        ["(k,n,r)", "un 3e nombre fait tourner le motif vers la droite : `bd(3,8,2)` frappe aux pas 1, 3 et 6."],
        ["sur des notes", "`note(\"c2(3,8)\").s(\"sawtooth\")` : une basse syncopée en un geste."],
      ],
      theory: {
        title: "La famille euclidienne",
        items: [
          ["rythme euclidien", "répartition la plus régulière possible de k coups sur n pas. Le calcul est apparenté à l’algorithme d’Euclide, celui du plus grand diviseur commun."],
          ["(3,8)", "le tresillo, d’origine cubaine."],
          ["(5,8), (7,12)…", "le cinquillo cubain, des motifs de cloche d’Afrique de l’Ouest : beaucoup de rythmes traditionnels tiennent dans (k,n)."],
        ],
      },
      exercise: "Joue `sound(\"bd(3,8), hh*8\")`, puis essaie `(5,8)` et `(7,16)` sur le kick, et une rotation `bd(3,8,2)`.",
      rich: true,
    },

    {
      id: "5.10",
      kicker: "On assemble",
      title: "Le temps comme matière",
      concept: "Le temps devient une matière qu’on sculpte. Voici un groove où le rythme est épaissi (`ply`), la mélodie tourne (`iter`) et s’étire (`slow`). Tu n’as écrit que quelques notes : les fonctions font le reste.",
      code: "setcpm(120/4)\n$: s(\"bd ~ sd ~\").ply(\"<1 1 2 1>\")\n$: s(\"hh*8\")\n$: n(\"0 1 2 3 4 5 6 7\").scale(\"C:minor\").s(\"sawtooth\").iter(4).slow(2).lpf(1200)",
      decode: [
        [".ply(\"<1 1 2 1>\")", "la caisse claire double un cycle sur quatre : un petit relief."],
        [".iter(4)", "la ligne tourne sur elle-même."],
        [".slow(2)", "le tout étalé sur deux cycles."],
      ],
      recap: {
        title: "Récap chapitre 2 — Le temps",
        columns: ["Fonction", "Effet", "Repère"],
        rows: [
          ["`slow` · `fast`", "étire / comprime le temps", "comme `/` et `*` en mini-notation"],
          ["`rev`", "retourne chaque cycle", "la fin passe au début"],
          ["`palindrome`", "un cycle à l’endroit, un à l’envers", "`0 1 2`, puis `2 1 0`"],
          ["`iter(n)`", "décale le départ d’un n-ième à chaque cycle", "`0 1 2 3`, `1 2 3 0`, `2 3 0 1`…"],
          ["`ply(n)`", "répète chaque événement n fois, sur place", "roulement, bégaiement"],
          ["`(k,n)`", "k coups répartis sur n pas", "`\"bd(3,8)\"` : le tresillo"],
        ],
      },
      exercise: "Triture le temps : change `iter(4)` en `iter(3)`, `slow(2)` en `fast(1.5)`, le ply en `\"<1 2 1 3>\"`. Même matériel, autres grooves.",
      free: "Tu sais plier le temps : l’étirer, le retourner, le faire tourner. Au chapitre suivant, le hasard, mais un hasard reproductible : relancer redonne exactement la même suite (voir [déterministe](voc.aleatoire.deterministe)).",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m5chapitre3 = {
  module: 5,
  chapter: 'Le hasard maîtrisé',
  title: 'Le hasard maîtrisé',
  subtitle: 'Du contrôle dans l’aléatoire',
  flashs: [
    {
      id: "5.11",
      kicker: "Des flux, pas des notes",
      title: "Les signaux : rand, sine, perlin",
      concept: "Un [signal](fn.signaux) est une valeur qui varie en continu avec le temps, entre 0 et 1 : `rand` (hasard), `sine` (une vague), `perlin` (un hasard lissé). Il n’a pas de rythme propre : `.segment(n)` y prélève n valeurs par cycle, ce qui crée n événements ; `.range(a, b)` recadre les valeurs. Ici, on en fait des notes.",
      code: "n(irand(8).segment(8)).scale(\"C:minor\").s(\"triangle\")",
      decode: [
        ["irand(8)", "des entiers au hasard, de 0 à 7."],
        [".segment(8)", "huit valeurs par cycle : huit événements."],
        [".scale(\"C:minor\")", "chaque entier devient un degré de do mineur."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["signal", "une valeur qui varie avec le temps, sans rythme propre."],
          ["segment(n)", "transforme le signal en n événements par cycle."],
          ["range(a, b)", "recadre un signal 0–1 vers a–b (voir [range](fn.range))."],
        ],
      },
      exercise: "Remplace `irand(8)` par `sine.segment(8).range(0, 7)` : le hasard devient une vague régulière. Compare les deux ambiances.",
      rich: true,
    },

    {
      id: "5.12",
      kicker: "Le secret",
      title: "Le hasard est déterministe",
      concept: "Le « hasard » de Strudel est REPRODUCTIBLE : il est calculé à partir de la position dans le temps (voir [déterministe](voc.aleatoire.deterministe)). Même code = même suite, à chaque écoute. On peut donc CHOISIR un fragment de hasard qui sonne bien et le figer : c’est le rôle de `ribbon`.",
      code: "n(irand(8).segment(4)).scale(\"C:pentatonic\").ribbon(1337, 2).s(\"triangle\")",
      decode: [
        ["ribbon(1337, 2)", "joue en boucle les 2 cycles qui commencent au cycle 1337 (vérifié dans le moteur)."],
        ["un fragment figé", "tu gèles un bout de hasard qui te plaît."],
        ["change 1337", "autre nombre = autre fragment. Tu « pêches » dans le hasard."],
      ],
      theory: {
        title: "Pourquoi c’est puissant",
        items: [
          ["graine", "le point de départ du générateur pseudo-aléatoire ; ici, la position dans le temps (voir [graine](voc.aleatoire.graine))."],
          ["reproductible", "ton morceau sonnera pareil demain : rien n’est perdu."],
          ["ribbon(n, len)", "fige une fenêtre de len cycles à partir du cycle n."],
        ],
      },
      exercise: "Essaie plusieurs nombres dans `ribbon` (1, 42, 1337, 9000…) jusqu’à trouver une boucle que tu aimes. Tu choisis ton hasard.",
      rich: true,
    },

    {
      id: "5.13",
      kicker: "Piocher",
      title: "choose : tirer dans une liste",
      concept: "`choose(a, b, c)` pioche une valeur au hasard parmi celles que tu donnes, à chaque événement. `wchoose([\"a\", 10], [\"b\", 1])` PONDÈRE les chances : « a » sort dix fois plus souvent que « b ». En mini-notation, `\"a | b | c\"` pioche une séquence entière, une fois par cycle (voir [barre](mini.barre)).",
      code: "note(\"c2 g2 d2 f1\").s(choose(\"sine\",\"triangle\",\"sawtooth\"))",
      decode: [
        ["choose(\"sine\",\"triangle\",\"sawtooth\")", "l’onde change au hasard à chaque note."],
        ["wchoose([\"sine\",10],[\"bd:6\",1])", "un tirage pondéré : 10 chances sur 11 pour « sine »."],
        ["\"a | b\"", "la barre verticale : une séquence tirée au sort à chaque cycle."],
      ],
      exercise: "Varie le timbre tout seul : `n(\"0 2 4\").scale(\"C:major\").s(choose(\"sawtooth\",\"square\"))`. Relance : la suite est la même à chaque écoute (hasard reproductible), mais le timbre change d’une note à l’autre.",
      rich: true,
    },

    {
      id: "5.14",
      kicker: "Parfois",
      title: "sometimes & degrade",
      concept: "`sometimes(f)` applique f à chaque événement avec une chance sur deux ; `often`, 75 % ; `rarely`, 25 % (voir [sometimes](fn.sometimes)). `degradeBy(p)`, ou `?` en mini-notation, retire des événements au hasard (voir [degradeBy](fn.degradeBy)) : ça troue un rythme trop régulier et le rend vivant.",
      code: "s(\"hh*8\").degradeBy(.3).seed(1).sometimesBy(.4, x=>x.speed(2))",
      decode: [
        ["degradeBy(.3)", "chaque coup a 30 % de chances d’être retiré."],
        [".seed(1)", "donne au tirage suivant un autre hasard (voir [graine](voc.aleatoire.graine)). Sans lui, `sometimesBy` relirait les nombres de `degradeBy` et ne toucherait que les coups tirés entre 0,3 et 0,4 : 15 % des coups restants au lieu de 40 % (mesuré dans le moteur)."],
        ["sometimesBy(.4, x=>x.speed(2))", "chaque coup a 40 % de chances d’être lu deux fois plus vite (une octave plus haut)."],
        ["déterministe", "toujours la même suite à chaque écoute."],
      ],
      theory: {
        title: "La famille « parfois »",
        items: [
          ["sometimes", "50 % de chances, à chaque événement."],
          ["often / rarely", "75 % / 25 %."],
          ["degrade / ?", "retire environ la moitié des événements, au hasard."],
        ],
      },
      exercise: "Pars d’un `s(\"hh*16\")` plat et donne-lui vie : ajoute `.degrade()`, puis `.seed(1)`, puis `.sometimes(x=>x.gain(1.4))`. Un charleston qui respire. Retire ensuite `.seed(1)` : plus aucun accent, car `degrade` a déjà retiré tous les coups que `sometimes` aurait choisis.",
      rich: true,
    },

    {
      id: "5.15",
      kicker: "On assemble",
      title: "Le chaos sous contrôle",
      concept: "Réunissons tout : une batterie qui se troue (`degradeBy`), des accents qui tombent parfois (`sometimesBy`), et une mélodie pêchée dans le hasard puis figée (`irand` + `ribbon`). Personne n’a écrit cette mélodie : tu as écrit la RÈGLE, et choisi le fragment.",
      code: "setcpm(120/4)\n$: s(\"bd*4\").degradeBy(.1)\n$: s(\"hh*8\").degradeBy(.3).seed(1).sometimesBy(.3, x=>x.gain(1.4))\n$: n(irand(8).segment(8)).scale(\"C:minor:pentatonic\").s(\"triangle\").ribbon(8, 2).lpf(1500)",
      decode: [
        [".degradeBy(.1)", "le kick saute rarement un coup : moins mécanique."],
        [".seed(1).sometimesBy(.3, …)", "des accents de charleston imprévus, sur 30 % des coups. Le `.seed(1)` sépare ce tirage de celui de `degradeBy` : sans lui, aucun accent (voir [graine](voc.aleatoire.graine))."],
        ["irand + ribbon(8, 2)", "une mélodie au hasard, figée sur les cycles 8 et 9, en boucle."],
      ],
      recap: {
        title: "Récap chapitre 3 — Le hasard maîtrisé",
        columns: ["Outil", "Rôle", "Repère"],
        rows: [
          ["`rand` · `irand` · `perlin`", "des signaux aléatoires, continus", "à découper avec `.segment(n)` pour obtenir n valeurs par cycle"],
          ["`choose` · `wchoose`", "piocher dans une liste", "`wchoose` : chaque élément a son poids"],
          ["`degradeBy` · `?`", "retirer des événements au hasard", "`?` = 50 %"],
          ["`sometimes` · `often` · `rarely`", "transformer certains événements", "50 · 75 · 25 %"],
          ["`ribbon(n, len)`", "rejouer en boucle une tranche de hasard", "`len` cycles, à partir du cycle `n`"],
          ["`seed(n)`", "un autre tirage", "à glisser entre deux hasards pour qu’ils ne se recouvrent pas"],
        ],
      },
      exercise: "Change le point de départ du `ribbon`, le taux de `degradeBy`, la gamme. Cherche TON accident heureux, puis fige-le.",
      free: "Le hasard est devenu un instrument : tu en fixes le cadre (une gamme, des probabilités) et tu choisis le fragment qui te plaît. Au chapitre suivant : faire beaucoup avec peu, une seule ligne qui se démultiplie en arrangement.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m5chapitre4 = {
  module: 5,
  chapter: 'Accumulation & calques',
  title: 'Accumulation & calques',
  subtitle: 'Beaucoup à partir de peu',
  flashs: [
    {
      id: "5.16",
      kicker: "Une copie par-dessus",
      title: "superimpose : doubler une voix",
      concept: "`superimpose(f)` joue l’original ET une copie passée dans la fonction f, en même temps. Une ligne devient deux voix. `layer(f)` joue seulement les copies, sans l’original (voir [superimpose](fn.superimpose)). Harmonie automatique : tu écris une mélodie, la fonction crée la deuxième voix.",
      code: "n(\"0 2 4 6\".superimpose(x=>x.add(2))).scale(\"C:major\").s(\"triangle\")",
      decode: [
        ["\"0 2 4 6\"", "la mélodie, en degrés."],
        [".superimpose(x=>x.add(2))", "ajoute une copie deux degrés plus haut : une tierce dans la gamme (do + mi, mi + sol…)."],
        ["les deux ensemble", "une harmonie parallèle, sans écrire la deuxième voix."],
      ],
      theory: {
        title: "superimpose ou layer",
        items: [
          ["superimpose(f)", "l’original + la copie transformée."],
          ["layer(f, g)", "seulement les copies, pas l’original."],
          ["add(2) sur des degrés", "deux marches plus haut : une tierce, majeure ou mineure selon l’endroit de la gamme."],
        ],
      },
      exercise: "Fais bouger l’harmonie : `.superimpose(x=>x.add(\"<2 4>\"))`. La deuxième voix alterne la tierce et la quinte selon le cycle.",
      rich: true,
    },

    {
      id: "5.17",
      kicker: "L’écho qui arrange",
      title: "off : une copie décalée",
      concept: "`off(t, f)` superpose une copie décalée de t cycles ET transformée par f (voir [off](fn.off)). Une note, puis sa réponse un peu plus tard, un peu plus haut : une phrase qui se répond à elle-même.",
      code: "\"c3 eb3 g3\".off(1/8, x=>x.add(7)).note().s(\"triangle\")",
      decode: [
        ["off(1/8, …)", "une copie retardée d’un huitième de cycle."],
        ["x=>x.add(7)", "cette copie monte de 7 demi-tons (une quinte) : do3 répond sol3."],
        ["résultat", "la phrase d’origine et sa réponse plus aiguë, en canon."],
      ],
      exercise: "Joue avec le décalage et l’intervalle : `off(1/4, x=>x.add(12))`, une réponse plus tardive, à l’octave.",
      rich: true,
    },

    {
      id: "5.18",
      kicker: "Rebonds",
      title: "echo : répétitions qui s’éteignent",
      concept: "`echo(n, t, fb)` répète chaque événement : n coups au total (l’original compris), espacés de t cycles, chacun `fb` fois moins fort que le précédent. Un écho « écrit » dans le motif, différent de l’effet [delay](fx.delay). `echoWith` transforme en plus chaque répétition.",
      code: "s(\"bd sd\").echo(3, 1/6, .8)",
      decode: [
        ["echo(3, 1/6, .8)", "l’original + 2 répétitions, à 1/6 de cycle d’écart, au volume 0,8 puis 0,64."],
        ["les rebonds", "s’éteignent progressivement, comme un vrai écho."],
        ["echoWith(3, 1/6, f)", "3 copies espacées de 1/6 de cycle, chacune passée une fois dans f (vérifié dans ce moteur : la première comprise, sans cumul)."],
      ],
      exercise: "Fais rebondir un clap : `s(\"cp\").echo(4, 1/8, .7)`. Change le retour (`.5` puis `.95`) : un écho court, ou qui s’accroche.",
      rich: true,
    },

    {
      id: "5.19",
      kicker: "La stéréo par fonction",
      title: "jux : gauche / droite",
      concept: "`jux(f)` joue l’original tout à GAUCHE et une copie transformée par f tout à DROITE (voir [jux](fn.jux)). Largeur stéréo instantanée : c’est un `superimpose` avec un placement gauche-droite automatique.",
      code: "n(run(8)).scale(\"C:major\").s(\"sawtooth\").jux(rev)",
      decode: [
        ["jux(rev)", "gauche : la gamme qui monte ; droite : elle descend."],
        ["au casque", "les deux oreilles entendent des choses différentes : l’espace s’ouvre."],
        ["jux(x=>x.fast(2))", "marche avec n’importe quelle fonction."],
      ],
      exercise: "Envoie la quinte à droite : `.jux(x=>x.add(note(7)))`, la copie de droite 7 demi-tons plus haut. Écris bien `note(7)` : après `.scale()`, ce sont des notes, et `x.add(7)` ne ferait rien (le moteur affiche `Can't do arithmetic on control pattern`). Mets un casque pour entendre l’espace se créer.",
      rich: true,
    },

    {
      id: "5.20",
      kicker: "On assemble",
      title: "Beaucoup à partir de peu",
      concept: "Le pari du chapitre : partir d’UNE ligne et la démultiplier en texture. Une seule mélodie en degrés devient un canon (`off`), puis s’ouvre en stéréo (`jux`), sur une batterie. Compte ce que tu as écrit : presque rien.",
      code: "setcpm(120/4)\n$: s(\"bd*4, hh*8\")\n$: n(\"0 2 4 6 7 6 4 2\".off(1/8, x=>x.add(7))).scale(\"C:minor\").s(\"sawtooth\").lpf(1500).jux(rev).gain(.5)",
      decode: [
        ["\"0 2 4 6 7 6 4 2\"", "la matière de départ, en degrés de do mineur."],
        [".off(1/8, x=>x.add(7))", "la ligne se répond 1/8 de cycle plus tard, 7 degrés plus haut : dans une gamme de 7 notes, c’est l’octave."],
        [".jux(rev)", "puis elle s’ouvre en stéréo, l’envers à droite."],
      ],
      recap: {
        title: "Récap chapitre 4 — Accumulation",
        columns: ["Fonction", "Ce qu’elle ajoute", "Repère"],
        rows: [
          ["`superimpose(f)`", "une copie transformée, en plus de l’original", "harmonie, doublure"],
          ["`layer(f, g…)`", "seulement les copies, sans l’original", "plusieurs versions à la fois"],
          ["`off(t, f)`", "une copie décalée de t cycles et transformée", "canon, écho mélodique"],
          ["`echo(n, t, fb)`", "n événements (l’original compris), espacés de t cycles ; chaque répétition multiplie le volume par fb", "un écho écrit dans le motif"],
          ["`jux(f)`", "l’original à gauche, la copie transformée à droite", "stéréo"],
        ],
      },
      exercise: "Ajoute un calque : `.superimpose(x=>x.add(note(12)))` à la ligne. Une mélodie, une octave, un canon, une stéréo : tout d’une même phrase.",
      free: "Tu sais faire foisonner une idée minuscule. Dernier chapitre : d’où vient tout ça (TidalCycles, la programmation fonctionnelle), comment arranger dans le temps, sortir vers le MIDI, et un morceau qui réunit tout et évolue seul.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m5chapitre5 = {
  module: 5,
  chapter: 'L’héritage & le grand tableau',
  title: 'L’héritage & le grand tableau',
  subtitle: 'D’où ça vient, où ça va',
  flashs: [
    {
      id: "5.21",
      kicker: "La famille",
      title: "Tidal, Strudel & le fonctionnel",
      concept: "Strudel est la version pour navigateur de [TidalCycles](voc.code.tidalcycles), écrit en Haskell, un langage *fonctionnel*. L’idée héritée : tout est motif, et tout se COMPOSE ; on assemble des fonctions au lieu de modifier des données. Strudel a porté cette idée en JavaScript, pour qu’elle tourne dans un onglet sans rien installer.",
      code: "note(\"c e g b\").add(note(\"<0 3 5>\")).s(\"sawtooth\")",
      decode: [
        ["add(note(\"<0 3 5>\"))", "un motif qui transforme un motif : transposition de 0, 3 puis 5 demi-tons selon le cycle."],
        ["pas de boucle", "aucune variable de temps à gérer : on branche des fonctions."],
        ["l’héritage Tidal", "des briques qui se composent sans limite."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["TidalCycles", "l’ancêtre de Strudel, écrit en Haskell."],
          ["Strudel", "sa version en JavaScript, dans le navigateur (voir [Strudel](voc.code.strudel))."],
          ["fonctionnel", "on compose des fonctions ; on ne modifie rien en place."],
        ],
      },
      exercise: "L’ordre compte parfois : `n(\"0 1 2 3 4 5 6 7\").scale(\"C:major\").slow(2).rev()` et `….rev().slow(2)` ne donnent pas la même chose. En revanche, `add(note(\"<0 3 5>\"))` et `rev()` donnent le même résultat dans les deux ordres : écoute pour t’en convaincre.",
      rich: true,
    },

    {
      id: "5.22",
      kicker: "Arranger dans le temps",
      title: "firstOf / lastOf / when",
      concept: "Pour qu’un morceau ÉVOLUE, on applique une transformation de temps en temps. `firstOf(4, f)` applique f au premier cycle de chaque groupe de 4 (les cycles 1, 5, 9…) ; `lastOf(4, f)` au dernier (4, 8, 12…) ; `when(motif, f)` là où un motif binaire vaut 1. C’est l’arrangement écrit en règles (voir [firstOf](fn.firstOf), [lastOf](fn.lastOf)).",
      code: "n(\"0 1 2 3\").scale(\"C:major\").firstOf(4, x=>x.rev()).s(\"triangle\")",
      decode: [
        ["firstOf(4, x=>x.rev())", "cycle 1 à l’envers, puis 3 cycles normaux, et ainsi de suite (vérifié dans le moteur)."],
        ["phrase de 4 mesures", "une variation régulière, qui marque le début de chaque phrase."],
        ["lastOf(4, f)", "cible le DERNIER cycle du groupe : idéal pour une fin de phrase."],
      ],
      exercise: "Mets un emballement en fin de phrase : `.lastOf(4, x=>x.fast(2))`. Un petit roulement automatique tous les 4 cycles.",
      rich: true,
    },

    {
      id: "5.23",
      kicker: "La transformation voyageuse",
      title: "chunk : un morceau à la fois",
      concept: "`chunk(n, f)` découpe le motif en n parts et applique f à UNE part par cycle, en avançant : la 1ʳᵉ au cycle 1, la 2ᵉ au cycle 2… Le changement se promène dans la phrase, comme une main qui passe sur le clavier.",
      code: "n(\"0 1 2 3\").scale(\"C:major\").chunk(4, x=>x.add(note(7))).s(\"sawtooth\")",
      decode: [
        ["chunk(4, x=>x.add(note(7)))", "cycle 1 : la 1ʳᵉ note monte d’une quinte ; cycle 2 : la 2ᵉ ; etc. (vérifié dans le moteur)."],
        ["la quinte voyage", "l’accent se déplace dans la mélodie."],
        ["chunkBack", "part de la 1ʳᵉ part, puis remonte depuis la dernière : le voyage va dans l’autre sens."],
      ],
      exercise: "Fais voyager le timbre plutôt que la hauteur : `n(\"0 1 2 3\").scale(\"C:major\").s(\"sawtooth\").chunk(4, x=>x.s(\"square\"))`. Une note sur quatre change de son, et ça tourne. Place bien `.s(\"sawtooth\")` AVANT `chunk` : écrit après, il remplacerait le `square` sur toutes les notes.",
      rich: true,
    },

    {
      id: "5.24",
      kicker: "Sortir de la boîte",
      title: "MIDI : piloter de vrais instruments",
      concept: "Strudel peut aussi piloter de VRAIS instruments : `.midi(\"nom du port\")` envoie les notes à un synthé ou à un logiciel par MIDI, directement depuis le navigateur grâce au Web MIDI (voir [MIDI](voc.code.midi-web-midi)). Le code devient un séquenceur. Ici, on reste sur le son interne pour vérifier la grille.",
      code: "chord(\"<C^7 A7 Dm7 G7>\").voicing().s(\"sawtooth\").lpf(2000).gain(.5)",
      decode: [
        ["chord(…).voicing()", "une grille d’accords, réalisée en notes."],
        [".s(\"sawtooth\")", "on l’entend en interne."],
        [".midi(\"…\")", "remplacerait `.s(…)` pour envoyer les notes vers un appareil MIDI."],
      ],
      theory: {
        title: "Entrées / sorties",
        items: [
          ["MIDI", "la norme qui permet aux instruments électroniques d’échanger des notes et des réglages."],
          ["Web MIDI", "le MIDI dans le navigateur : sa prise en charge dépend du navigateur, et il faut un appareil branché."],
          ["OSC", "une autre sortie, vers SuperCollider ; elle n’est pas disponible dans cette app."],
        ],
      },
      exercise: "Sans matériel, reste sur le son interne. Si tu as un appareil MIDI branché : remplace `.s(\"sawtooth\")` par `.midi(\"nom du port\")`, avec le nom exact que ton système donne à l’appareil.",
      rich: true,
    },

    {
      id: "5.25",
      kicker: "Le morceau final",
      title: "Tout Keymaker, en mouvement",
      concept: "Le final : un morceau qui se transforme TOUT SEUL. Batterie, grille d’accords, basse jouée par un instrument enregistré, son sculpté, et les outils génératifs du parcours : `iter`, `off`, `degradeBy`, `sometimesBy`, un signal. Tu ne joues pas ce morceau : tu as écrit la règle, et il vit.",
      code: "setcpm(120/4)\n$: s(\"bd*4, [~ cp]*2\").bank(\"RolandTR909\").degradeBy(.08)\n$: s(\"hh*8\").degradeBy(.3).seed(1).sometimesBy(.3, x=>x.gain(1.3))\n$: note(\"c2 ~ g2 ~\").s(\"gm_acoustic_bass\").gain(.7)\n$: chord(\"<Cm7 Ab^7 Fm7 G7>\").voicing().s(\"triangle\").gain(.3).room(.4)\n$: n(\"0 1 2 3 4 5 6 7\").scale(\"C:minor\").s(\"sawtooth\").iter(4).off(1/8, x=>x.add(note(12))).lpf(sine.range(500,2000).slow(4)).gain(.35)",
      decode: [
        ["couches 1-2", "batterie TR-909 qui se troue (`degradeBy`) avec des accents (`sometimesBy`), séparés par `.seed(1)` pour que les deux hasards ne se recouvrent pas."],
        ["couches 3-4", "basse d’instrument (`gm_acoustic_bass`) et grille d’accords avec un peu de réverbération."],
        ["couche 5", "mélodie qui tourne (`iter`), se répond à l’octave (`off` + `note(12)`) et dont le filtre suit une vague (`sine`)."],
      ],
      recap: {
        title: "Récap chapitre 5 — Le grand tableau",
        columns: ["Parcours", "Apport", "Exemple"],
        rows: [
          ["Les fondations", "rythme, notes, gammes, accords, timbre, mouvement", "`$:` · `scale` · `chord` · `lpf`"],
          ["Guitare", "le manche et ses accords, joués par des sons enregistrés", "`gm_*` · `clip`"],
          ["Sculpter le son", "le timbre : source, filtre, enveloppe, espace", "`lpf` · `adsr` · `room`"],
          ["Le code comme instrument", "le mouvement : transformations et hasard", "`iter` · `off` · `degradeBy`"],
        ],
      },
      exercise: "Approprie-toi le morceau : change la gamme (`C:minor` → `C:dorian`), la grille d’accords, les taux de hasard. Une règle, des variations sans fin.",
      free: "Tu n’écris plus des notes : tu écris des règles, et le moteur les fait sonner. Deux directions avec ce morceau. Ralentis tout (`setcpm` bas, notes longues, beaucoup de `room`, du `degradeBy`) : une pièce ambient. Ou serre le rythme (un break haché, `iter` sur les charlestons, la caisse claire sur le 3ᵉ temps) : un groove drum & bass. Le parcours « Composer un morceau » montre comment structurer tout ça, et ces deux genres ont leur chapitre dans « Autres genres ».",
      culture: {
        artist: "Aphex Twin",
        track: "Xtal",
        why: "le morceau qui ouvre *Selected Ambient Works 85–92* (1992). Quelques éléments répétés (des nappes, une voix lointaine, un rythme régulier) qui changent lentement, sans couplet ni refrain : la répétition comme matière première, comme dans ce morceau.",
      },
      rich: true,
      richRecap: true,
    },
  ],
};

/* Le Module 5 entier : la carte de ses 5 chapitres. */
export const module5 = {
  id: 5,
  titre: 'Module 5 — Informatique Musicale',
  title: 'Module 5',
  subtitle: 'Le code comme instrument : un pattern est une fonction du temps',
  chapitres: [m5chapitre1, m5chapitre2, m5chapitre3, m5chapitre4, m5chapitre5],
};

/* ===========================================================================
 * Module 6 — Composition & Projets  (Chantier 13, 6 juin 2026)
 * Fil rouge : « D'une boucle à un morceau. » Le code devient un studio :
 * construire (stack), réutiliser (const/register), arranger (arrange/mask/pick),
 * sculpter la matière (chop/slice/layer), finir/jouer/partager (mix/live/export).
 * Strudel vérifié en direct sur strudel.cc le 6 juin 2026 (cf. référence §13).
 * Ponts permanents vers M1 (live coding), M2 (solfège), M3 (guitare),
 * M4 (son & effets), M5 (informatique musicale).
 * =========================================================================== */

export const m6chapitre1 = {
  module: 6,
  chapter: 'Le studio dans le navigateur',
  title: 'Le studio dans le navigateur',
  subtitle: 'Empiler, nommer, couper, traiter : le stack live',
  flashs: [
    {
      id: "6.1",
      kicker: "Empiler des pistes",
      title: "Le stack : plusieurs pistes en même temps",
      concept: "Un morceau, ce sont des couches qui jouent ensemble. Chaque ligne qui commence par `$:` est une PISTE (voir [pistes](fn.dollar)) ; toutes jouent en parallèle, sur les mêmes cycles. C’est la table de mixage, en code. Fil rouge du parcours : un morceau de house, raconté en quatre actes (intro, montée, plein, fin).",
      code: "$: s(\"bd*4\")\n$: s(\"~ cp\")\n$: note(\"c2 g2\").s(\"sawtooth\")",
      decode: [
        ["$:", "au début d’une ligne : « ajoute cette piste au morceau »."],
        ["3 lignes = 3 pistes", "grosse caisse, clap et basse, superposés."],
        ["sans $:", "seule la DERNIÈRE ligne jouerait : chaque expression remplacerait la précédente."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["piste", "une couche du morceau : batterie, basse, accords, lead…"],
          ["parallèle", "toutes les pistes partagent le même temps (les mêmes cycles) et le même tempo."],
          ["stack", "la fonction qui superpose des motifs dans une seule expression (voir [stack](fn.stack))."],
        ],
      },
      exercise: "Ajoute une 4ᵉ piste : `$: s(\"hh*8\").gain(.6)`. Un morceau, c’est d’abord des couches bien choisies.",
      rich: true,
    },

    {
      id: "6.2",
      kicker: "Mettre de l’ordre",
      title: "Nommer ses pistes",
      concept: "Quand le code grossit, une pile de `$:` anonymes devient illisible. Tu peux nommer chaque piste : un mot devant `$:` (`drums$:`), ou un mot suivi de deux-points (`drums:`). Le son est le même ; le nom te dit qui fait quoi.",
      code: "drums$: s(\"bd*4, ~ cp\").bank(\"RolandTR909\")\nbass$: note(\"c2 g2 ~ c2\").s(\"gm_acoustic_bass\")\nchords$: chord(\"<Cm Ab>\").voicing().s(\"triangle\").gain(.4)",
      decode: [
        ["drums$:", "un nom devant `$:` étiquette la piste (vérifié dans le moteur)."],
        ["un nom par piste", "chaque piste nommée a son propre nom ; seul `$:` peut se répéter."],
        ["chords$:", "la grille d’accords, nommée « chords »."],
      ],
      exercise: "Renomme les pistes avec TES mots : `kick$:`, `basse$:`, `nappe$:`. Un code lisible, c’est un code qu’on retrouve le lendemain.",
      rich: true,
    },

    {
      id: "6.3",
      kicker: "L’interrupteur live",
      title: "Couper une piste : le souligné _",
      concept: "En direct, on ne réécrit pas tout : on ALLUME et on ÉTEINT des couches. Un `_` juste devant une piste la coupe, sans effacer son code ; enlève-le, et elle revient à la prochaine évaluation.",
      code: "drums$: s(\"bd*4, ~ cp\").bank(\"RolandTR909\")\n_bass$: note(\"c2 g2\").s(\"gm_acoustic_bass\")\nhats$: s(\"hh*8\").gain(.5)",
      decode: [
        ["_bass$:", "le trait de soulignement coupe la piste (vérifié dans le moteur)."],
        ["enlève le _", "la basse revient dès que tu relances : construire et retirer en direct."],
        ["■ / Ctrl + .", "tout arrêter d’un coup."],
      ],
      theory: {
        title: "Couper, en pratique",
        items: [
          ["_piste$:", "coupe UNE piste."],
          ["hush()", "coupe TOUT le son."],
          ["■ ou Ctrl + .", "le bouton d’arrêt de l’app."],
        ],
      },
      exercise: "Lance le code, puis coupe les charlestons (`_hats$:`). Attends 4 cycles, enlève le `_` et relance : une couche vient d’entrer.",
      rich: true,
    },

    {
      id: "6.4",
      kicker: "Le bus master",
      title: "all() : traiter toutes les pistes d’un coup",
      concept: "`all(f)` applique la fonction f à TOUTES les pistes à la fois : baisser le volume général, fermer le filtre pour une transition, ajouter de la réverbération partout. C’est le bus master de ta table de mixage.",
      code: "$: s(\"bd*4, ~ cp\").bank(\"RolandTR909\")\n$: note(\"c2 g2 eb2 g2\").s(\"sawtooth\").gain(.6)\nall(x => x.room(.3))",
      decode: [
        ["all(x => x.room(.3))", "ajoute `room(.3)` à chaque son de chaque piste (vérifié dans le moteur)."],
        ["un seul geste", "pas besoin de répéter `.room` sur chaque ligne."],
        ["all(x => x.lpf(500))", "une transition : le filtre se ferme sur tout le morceau."],
      ],
      exercise: "Remplace par `all(x => x.gain(.7))` : tout le mix baisse d’un coup. Puis essaie `all(x => x.fast(2))` le temps d’un cycle.",
      rich: true,
    },

    {
      id: "6.5",
      kicker: "Le métronome commun",
      title: "Le tempo du morceau",
      concept: "Toutes les pistes partagent UN tempo. On le pose une fois, en haut, avec [setcpm](fn.setcpm) : `setcpm(BPM/4)` donne ton tempo en battements par minute, avec un cycle = une mesure de 4 temps. Change-le, et tout le morceau accélère ou ralentit ensemble.",
      code: "setcpm(120/4)\ndrums$: s(\"bd*4, ~ cp\").bank(\"RolandTR909\")\nbass$: note(\"c2 ~ g2 ~\").s(\"gm_acoustic_bass\")",
      decode: [
        ["setcpm(120/4)", "120 BPM : 30 cycles par minute, un cycle toutes les 2 s."],
        ["une seule fois, en haut", "le tempo est global."],
        ["1 cycle = 1 mesure", "la convention de toute l’app."],
      ],
      recap: {
        title: "Récap chapitre 1 — Les pistes",
        columns: ["Geste", "Code", "Effet"],
        rows: [
          ["empiler", "`$: …`", "une piste par ligne, toutes en même temps"],
          ["nommer", "`drums$: …`", "une piste étiquetée, plus lisible"],
          ["couper", "`_drums$: …`", "la piste se tait, son code reste là"],
          ["tout traiter", "`all(x => x.lpf(800))`", "la même transformation sur chaque piste"],
          ["tempo", "`setcpm(BPM/4)`", "un tempo commun ; un cycle = 4 temps"],
        ],
      },
      exercise: "Passe le tempo à `setcpm(140/4)`, puis `setcpm(90/4)`. Même morceau, autre énergie : le tempo est déjà une décision artistique.",
      free: "Tu sais faire jouer plusieurs [pistes](fn.dollar) ensemble, les nommer, les couper et les traiter d’un bloc. C’est l’établi de tout le reste : un morceau, ce sont des couches qu’on choisit et qu’on pilote.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m6chapitre2 = {
  module: 6,
  chapter: 'Réutiliser : variables & fonctions',
  title: 'Réutiliser : variables & fonctions',
  subtitle: 'Définir une fois, rejouer partout',
  flashs: [
    {
      id: "6.6",
      kicker: "Définir une fois",
      title: "La variable : const",
      concept: "Recopier le même motif partout, c’est s’exposer aux erreurs. `const` définit un motif UNE fois, sous un nom, pour le réutiliser autant que tu veux (voir [const](js.const)). Tu changes la définition : tout suit.",
      code: "const bass = note(\"c2 g2 ~ c2\").s(\"gm_acoustic_bass\")\n$: bass\n$: bass.add(note(12)).gain(.4)",
      decode: [
        ["const bass = …", "la basse est définie une fois, sous le nom « bass »."],
        ["$: bass", "on la joue telle quelle."],
        ["$: bass.add(note(12))", "on la rejoue une octave plus haut, sans recopier."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["const", "un nom donné à un motif, pour s’en resservir."],
          ["réutiliser", "rejouer le même motif, transformé ou non, sans le réécrire."],
          ["moins de répétition", "moins de code à relire, moins d’erreurs."],
        ],
      },
      exercise: "Crée `const lead = n(\"0 2 4 7\").scale(\"C:minor\").s(\"triangle\")`, puis joue-le deux fois : `$: lead` et `$: lead.off(1/8, x=>x.add(note(12)))`.",
      rich: true,
    },

    {
      id: "6.7",
      kicker: "Une idée, des variations",
      title: "Transformer un motif réutilisé",
      concept: "Le vrai pouvoir de `const` : un seul motif source, plusieurs versions. Tu définis un riff, puis tu joues l’original ET des variations transformées, en parallèle. Beaucoup de musique à partir de très peu d’écriture.",
      code: "const riff = n(\"0 2 3 5\").scale(\"C:minor\")\n$: riff.s(\"sawtooth\").gain(.5)\n$: riff.rev().s(\"triangle\").gain(.4).off(1/8, x=>x.add(note(12)))",
      decode: [
        ["const riff = …", "le motif source, en degrés de do mineur."],
        ["riff.rev()", "la même idée, à l’envers : une 2ᵉ voix."],
        [".off(1/8, …)", "une copie décalée d’un huitième de cycle et montée d’une octave (voir [off](fn.off))."],
      ],
      exercise: "Ajoute une 3ᵉ voix : `$: riff.slow(2).add(note(7)).s(\"square\").gain(.3)`. Un motif, trois rôles.",
      rich: true,
    },

    {
      id: "6.8",
      kicker: "Ta chaîne maison",
      title: "register : créer ta propre fonction",
      concept: "Tu réutilises souvent la même chaîne de réglages ? `register` l’emballe sous un nom : tu crées ta propre fonction, qui s’enchaîne comme `.lpf` ou `.room`. Ta signature sonore en un mot.",
      code: "register('keymaker', p => p.s('sawtooth').lpf(900).room(.3))\nnote(\"c3 eb3 g3 c4\").keymaker()",
      decode: [
        ["register('keymaker', p => …)", "déclare une fonction nommée « keymaker »."],
        ["p => p.s(…).lpf(…)", "`p` est le motif reçu ; la fonction lui ajoute la chaîne de réglages (voir [la flèche](js.fleche))."],
        [".keymaker()", "on l’applique comme n’importe quelle fonction de Strudel."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["register", "déclare une nouvelle fonction réutilisable."],
          ["p => …", "une fonction fléchée : entrée `p`, sortie le motif traité."],
          ["nom", "entre guillemets SIMPLES : c’est un texte, pas un motif (voir [guillemets](js.guillemets))."],
        ],
      },
      exercise: "Crée ta signature : `register('moi', p => p.room(.5).gain(.6).clip(2))`, puis applique-la à une basse : `note(\"c2 g2\").s(\"gm_acoustic_bass\").moi()`.",
      rich: true,
    },

    {
      id: "6.9",
      kicker: "Se repérer d’un coup d’œil",
      title: "color() : organiser visuellement",
      concept: "`.color(\"…\")` attache une couleur à une piste. Elle ne change rien au son : elle sert aux visualisations de Strudel (le pianoroll, la spirale…), où chaque piste prend sa couleur. Un repère visuel quand plusieurs pistes tournent.",
      code: "$: s(\"bd*4, ~ cp\").bank(\"RolandTR909\").color(\"tomato\")\n$: note(\"c2 g2 eb2 g2\").s(\"sawtooth\").color(\"cyan\")",
      decode: [
        [".color(\"tomato\")", "une couleur attachée aux événements de la piste."],
        ["repérage", "dans une visualisation, chaque piste se distingue par sa couleur."],
        ["aucun effet sonore", "purement visuel."],
      ],
      exercise: "Donne une couleur à chaque piste (`color(\"gold\")`, `color(\"orchid\")`…). Elles ne changent pas le son : c’est une habitude d’organisation, utile si tu ajoutes une visualisation.",
      rich: true,
    },

    {
      id: "6.10",
      kicker: "Tout assembler",
      title: "Un mini-projet en const",
      concept: "On réunit le chapitre : chaque couche définie avec `const`, puis montée dans des pistes nommées. Le morceau devient une partition lisible, une ligne par voix. C’est le squelette de tes futurs projets.",
      code: "setcpm(110/4)\nconst drums = s(\"bd*4, ~ cp, hh*8\").bank(\"RolandTR909\")\nconst bass  = note(\"c2 ~ g2 ~\").s(\"gm_acoustic_bass\").gain(.7)\nconst keys  = chord(\"<Cm7 Ab^7>\").voicing().s(\"triangle\").gain(.4).room(.3)\ndrums$: drums\nbass$: bass\nkeys$: keys",
      decode: [
        ["3 const en haut", "chaque voix définie une fois : batterie, basse, accords."],
        ["drums$: drums …", "les pistes nommées jouent ces voix."],
        ["faire évoluer", "change une `const`, le morceau suit."],
      ],
      recap: {
        title: "Récap chapitre 2 — Réutiliser",
        columns: ["Outil", "Code", "Sert à"],
        rows: [
          ["variable", "`const basse = …`", "définir un motif une fois"],
          ["rejouer", "`$: basse`", "le jouer tel quel"],
          ["varier", "`basse.rev()` · `basse.add(note(7))`", "des versions transformées (voir [add](fn.add))"],
          ["fonction", "`register('moi', p => p.room(.5))`", "ta chaîne d’effets maison, appelée ensuite `.moi()`"],
          ["couleur", "`.color(\"cyan\")`", "colore la piste dans les visualisations"],
        ],
      },
      exercise: "Ajoute une 4ᵉ voix `lead` avec `const` et monte-la dans une piste. Tu tiens le gabarit de tes morceaux.",
      free: "Définir une fois, rejouer partout : ton code devient une partition au lieu d’un copier-coller. Changer la `const` change toutes les pistes qui l’utilisent, d’un coup.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m6chapitre3 = {
  module: 6,
  chapter: 'Arranger dans le temps',
  title: 'Arranger dans le temps',
  subtitle: 'De la boucle à la structure : intro, couplet, refrain',
  flashs: [
    {
      id: "6.11",
      kicker: "La timeline",
      title: "arrange : des sections à la suite",
      concept: "Une boucle tourne en rond ; un morceau AVANCE. [arrange](fn.arrange) pose une ligne de temps : « joue A pendant 4 cycles, puis B pendant 4 », puis recommence. C’est l’outil qui transforme des boucles en couplet, refrain, pont.",
      code: "arrange(\n  [4, s(\"bd*4, ~ cp\")],\n  [4, s(\"bd*4, ~ cp, hh*8\")]\n).bank(\"RolandTR909\")",
      decode: [
        ["arrange([4, A], [4, B])", "A pendant 4 cycles, puis B pendant 4, en boucle."],
        ["[nombre, motif]", "chaque section : sa durée en cycles, puis le motif à jouer."],
        [".bank(…) après", "un réglage écrit après `arrange(…)` s’applique à toutes les sections."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["arrange", "enchaîne des sections, chacune avec sa durée."],
          ["section", "un bloc musical : intro, couplet, refrain, pont…"],
          ["boucle", "à la fin de la dernière section, tout recommence."],
        ],
      },
      exercise: "Ajoute une 3ᵉ section calme : `[2, s(\"bd ~ ~ ~\")]`. Trois blocs : une vraie petite forme.",
      rich: true,
    },

    {
      id: "6.12",
      kicker: "Faire durer",
      title: "Tenir une section : <> @ !",
      concept: "Pour qu’une section respire, il faut la tenir plusieurs cycles. Dans des chevrons, `!4` recopie un élément 4 fois : `<c2!4 g2!4>` garde do2 pendant quatre cycles, puis sol2 pendant quatre (voir [!](mini.exclamation)).",
      code: "$: note(\"<c2!4 g2!4>\").s(\"gm_acoustic_bass\")\n$: chord(\"<Cm!4 G!4>\").voicing().s(\"triangle\").gain(.4)",
      decode: [
        ["<c2!4 g2!4>", "do2 quatre cycles, puis sol2 quatre cycles."],
        ["!n", "recopie l’élément n fois."],
        ["même rythme partout", "la basse et la grille d’accords changent ensemble, tous les 4 cycles."],
      ],
      exercise: "Fais un cycle harmonique long : `<Cm!2 Ab!2 Fm!2 G!2>` pour la grille, et les fondamentales correspondantes pour la basse. Huit cycles de structure, sans rien recopier.",
      rich: true,
    },

    {
      id: "6.13",
      kicker: "Faire entrer les couches",
      title: "mask : activer une piste par sections",
      concept: "Une intro réussie, ce sont des couches qui ENTRENT une à une. [mask](fn.mask) dit « cette piste joue ici, se tait là » avec un motif de 0 et de 1. Avec le même nombre de cases sur chaque piste, tu décides qui sonne, et quand.",
      code: "$: s(\"bd*4\").bank(\"RolandTR909\")\n$: s(\"hh*8\").mask(\"<0 0 1 1>\").gain(.6)\n$: note(\"c2 g2 eb2 g2\").s(\"sawtooth\").mask(\"<0 1 1 1>\")",
      decode: [
        ["mask(\"<0 0 1 1>\")", "0 = muet, 1 = joue : un état par cycle ; les charlestons arrivent au 3ᵉ cycle."],
        ["mask(\"<0 1 1 1>\")", "la basse entre au 2ᵉ cycle."],
        ["même nombre de cases", "4 cases partout : tout reste aligné."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["mask", "un pochoir de 0 et de 1 qui laisse passer ou bloque le son."],
          ["<0 0 1 1>", "un état par cycle, grâce aux chevrons."],
          ["arranger", "des masques alignés sur toutes les pistes = une structure complète."],
        ],
      },
      exercise: "Inverse un masque (`<1 1 0 0>`) pour faire SORTIR une couche au lieu de la faire entrer.",
      rich: true,
    },

    {
      id: "6.14",
      kicker: "Séquencer des blocs",
      title: "pick : choisir la section à jouer",
      concept: "Autre façon d’arranger : range tes sections dans une liste, puis un motif de numéros choisit laquelle joue. `\"<0@2 1@2>\".pick([couplet, refrain])` = couplet pendant 2 cycles, refrain pendant 2.",
      code: "const couplet = note(\"c2 eb2 g2 c3\").s(\"sawtooth\").gain(.5)\nconst refrain = note(\"ab2 g2 f2 eb2\").s(\"sawtooth\").gain(.6)\n\"<0@2 1@2>\".pick([couplet, refrain])",
      decode: [
        ["pick([couplet, refrain])", "le numéro 0 joue le couplet, le numéro 1 le refrain."],
        ["\"<0@2 1@2>\"", "un numéro par cycle ; `@2` le fait durer deux cycles."],
        ["pickRestart", "variante qui fait repartir la section de son début à chaque changement."],
      ],
      exercise: "Ajoute un pont (`const pont = …`) en 3ᵉ élément, puis joue `\"<0 1 0 2>\".pick([couplet, refrain, pont])`. Couplet, refrain, couplet, pont : une chanson.",
      rich: true,
    },

    {
      id: "6.15",
      kicker: "La forme complète",
      title: "Intro → couplet → refrain → outro",
      concept: "Assemblons : des `const` pour les sections, `arrange` pour la ligne de temps, `stack` pour superposer batterie et basse dans les parties pleines. Une petite forme complète, du début à la fin.",
      code: "setcpm(120/4)\nconst groove = s(\"bd*4, ~ cp, hh*8\").bank(\"RolandTR909\")\nconst harmo  = note(\"<c2 ab1 f1 g1>\").s(\"gm_acoustic_bass\").gain(.7)\narrange(\n  [2, groove],\n  [4, stack(groove, harmo)],\n  [2, harmo]\n)",
      decode: [
        ["[2, groove]", "intro : la batterie seule, 2 cycles."],
        ["[4, stack(groove, harmo)]", "le cœur : batterie et basse ensemble, 4 cycles."],
        ["[2, harmo]", "fin : la basse seule, 2 cycles."],
      ],
      recap: {
        title: "Récap chapitre 3 — Arranger",
        columns: ["Outil", "Code", "Sert à"],
        rows: [
          ["sections à la suite", "`arrange([4, a], [8, b])`", "`a` pendant 4 cycles, puis `b` pendant 8, en boucle"],
          ["tenir", "`\"<a!4 b!4>\"`", "chaque valeur pendant 4 cycles"],
          ["voiler", "`mask(\"<0 1 1>\")`", "la couche se tait quand le masque vaut 0"],
          ["choisir", "`\"<0 1>\".pick([a, b])`", "jouer la section dont le numéro est donné"],
          ["empiler", "`stack(a, b)`", "superposer, pour une partie pleine"],
        ],
      },
      exercise: "Allonge la forme : ajoute un refrain (un `stack` de trois voix) et un pont (`harmo.add(note(5))`, la basse montée d’une quarte).",
      free: "Tes boucles savent maintenant raconter : entrer, monter, retomber. C’est toute la différence entre une boucle qui tourne et un morceau qui avance.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m6chapitre4 = {
  module: 6,
  chapter: 'La matière d’un track',
  title: 'La matière d’un track',
  subtitle: 'Charger, hacher, réordonner, épaissir le son',
  flashs: [
    {
      id: "6.16",
      kicker: "Apporter tes sons",
      title: "samples() : charger un kit",
      concept: "Pour un projet, tu peux apporter d’autres sons : `samples()` charge une banque d’échantillons depuis Internet. Une fois chargée, tu joues ses noms comme d’habitude. Le premier chargement demande du réseau ; tant qu’il n’est pas fini, le son peut rester muet.",
      code: "samples('github:tidalcycles/dirt-samples')\ns(\"jazz:0 jazz:1 jazz:2 jazz:3\").gain(.8)",
      decode: [
        ["samples('github:…')", "charge une banque de sons hébergée sur GitHub (ici, la collection « Dirt-Samples » de TidalCycles)."],
        ["s(\"jazz:0 …\")", "on joue ses sons ; `:n` choisit la variante."],
        ["premier jeu", "possiblement muet le temps du téléchargement : relance."],
      ],
      theory: {
        title: "Charger des sons",
        items: [
          ["github:utilisateur/dépôt", "raccourci vers une banque hébergée sur GitHub."],
          ["une adresse web", "`samples({ nom: 'https://…/fichier.wav' })` charge un seul fichier sous un nom."],
          ["guillemets simples", "une adresse est un texte, pas un motif."],
        ],
      },
      exercise: "Joue d’autres variantes de la même banque : `s(\"jazz:4 jazz:5 jazz:6 jazz:7\")`.",
      rich: true,
    },

    {
      id: "6.17",
      kicker: "Découper une boucle",
      title: "chop : trancher un break",
      concept: "Un geste fondateur de la musique électronique : prendre une boucle de batterie et la HACHER (voir [chop](fx.chop)). `chop(16)` découpe chaque coup en 16 tranches, jouées dans l’ordre : on n’entend pas encore de différence, mais chaque tranche devient un événement qu’on peut manipuler.",
      code: "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })\ns(\"amen/4\").fit().chop(16).cut(1)",
      decode: [
        ["s(\"amen/4\")", "l’« Amen break » (voir [amen break](voc.culture.amen-break)), joué une fois tous les 4 cycles."],
        [".fit()", "règle la vitesse de lecture pour que l’échantillon remplisse exactement la durée de son événement, ici 4 cycles."],
        [".chop(16).cut(1)", "16 tranches ; `cut(1)` coupe chaque tranche quand la suivante démarre (voir [cut](fx.cut))."],
      ],
      exercise: "Manipule les tranches : ajoute `.rev()` (le break à l’envers), ou `.sometimesBy(.3, x => x.speed(2))` pour des tranches accélérées au hasard.",
      rich: true,
    },

    {
      id: "6.18",
      kicker: "Remixer",
      title: "slice / splice : réordonner les tranches",
      concept: "`chop` joue les tranches dans l’ordre. `slice` te laisse CHOISIR l’ordre : tu remixes le break. `splice` fait pareil, mais adapte la vitesse de chaque tranche pour qu’elle remplisse exactement son pas.",
      code: "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })\ns(\"amen/4\").fit().slice(8, \"<[0 2] [1 3] [4 6] [5 7]>\").cut(1)",
      decode: [
        [".slice(8, \"…\")", "découpe le break en 8 tranches et joue, à chaque pas, la tranche dont tu donnes le numéro (de 0 à 7)."],
        ["\"<[0 2] [1 3] [4 6] [5 7]>\"", "deux tranches par cycle, sur 4 cycles : les 8 tranches, dans un nouvel ordre. Avec `fit()`, une tranche dure un demi-cycle, exactement la place de son pas. Une seule tranche par cycle (`\"<0 2 1 3 …>\"`) laisserait un demi-cycle de silence après chacune (mesuré dans le moteur)."],
        ["splice", "comme `slice`, mais chaque tranche est accélérée ou ralentie pour remplir son pas."],
      ],
      exercise: "Invente ton ordre, en gardant deux tranches par cycle : `\"<[0 0] [4 4] [2 6] [5 7]>\"`. Chaque suite donne un autre groove.",
      rich: true,
    },

    {
      id: "6.19",
      kicker: "Donner du corps",
      title: "layer : épaissir un son",
      concept: "Un son seul peut sonner maigre. Pour l’épaissir, on superpose plusieurs versions du même motif : `layer(f, g)` joue les résultats de f et de g ensemble, sans l’original (voir [layer](fn.superimpose)). Plus court : `s(\"sawtooth, square\")` joue deux sons à la fois sur chaque note.",
      code: "note(\"<c2 ab1 f1 g1>\").layer(\n  x => x.s(\"sawtooth\"),\n  x => x.s(\"square\").add(note(12)).gain(.5)\n)",
      decode: [
        ["layer(x=>…, x=>…)", "deux voix du même motif : une en dent de scie, une en onde carrée une octave plus haut."],
        ["s(\"sawtooth, square\")", "la virgule superpose deux sons sur chaque note."],
        ["\"square:0:.5\"", "nom, variante, volume : `s(\"square:0:.5\")` donne `gain(.5)` à ce son (vérifié dans le moteur)."],
      ],
      exercise: "Ajoute une 3ᵉ voix dans `layer` : `x => x.add(note(7)).s(\"triangle\").gain(.3)`, une quinte au-dessus.",
      rich: true,
    },

    {
      id: "6.20",
      kicker: "Sculpter le temps de chaque son",
      title: "Durées & transitions",
      concept: "La durée des sons fait le caractère : court et sec, ou long et tenu. [clip](fx.clip) multiplie la durée de chaque note ; [release](fx.release) ajoute une extinction après la fin de la note ; `end` coupe un échantillon avant sa fin.",
      code: "note(\"c eb g c4\").clip(\"<.3 .6 1 2>\")\n.s(\"gm_electric_guitar_clean\").room(.3)",
      decode: [
        [".clip(\"<.3 .6 1 2>\")", "la durée change à chaque cycle : 30 % du pas (piqué) jusqu’à 2 pas (lié)."],
        [".release(.2)", "chaque note s’éteint en 0,2 s après sa fin."],
        [".end(.5)", "pour un échantillon : ne jouer que sa première moitié."],
      ],
      recap: {
        title: "Récap chapitre 4 — La matière",
        columns: ["Geste", "Code", "Effet"],
        rows: [
          ["charger", "`samples('…')`", "une banque de sons à toi, depuis une adresse web"],
          ["hacher", "`chop(n)`", "chaque son coupé en n tranches, jouées dans l’ordre"],
          ["réordonner", "`slice(n, \"…\")` · `splice`", "jouer les tranches dans un autre ordre ; `splice` ajuste aussi la vitesse à la durée du pas"],
          ["épaissir", "`layer(…)` · `\"a, b\"`", "plusieurs voix d’un même motif"],
          ["durée", "`clip` · `release` · `end`", "raccourcir la note ou ne lire qu’une partie de l’échantillon"],
        ],
      },
      exercise: "Ajoute `.release(\"<0 .3>\")` à la guitare : un cycle sur deux, chaque note s’arrête net à la fin de sa durée ; l’autre, elle s’éteint en 0,3 s (voir [release](fx.release)).",
      free: "Charger, hacher, réordonner, épaissir, raccourcir : tu travailles le son comme une matière. C’est le métier de producteur, tenu en quelques fonctions.",
      rich: true,
      richRecap: true,
    },
  ],
};

export const m6chapitre5 = {
  module: 6,
  chapter: 'Finir, jouer, partager',
  title: 'Finir, jouer, partager',
  subtitle: 'Mixer, performer en live, exporter — et le projet final',
  flashs: [
    {
      id: "6.21",
      kicker: "Équilibrer les couches",
      title: "Mixer : gain, pan, orbit",
      concept: "Toutes les pistes sonnent, mais ensemble c’est confus ? Le mixage les met en place : [gain](fx.gain) règle le volume de chacune, [pan](fx.pan) les place à gauche ou à droite, [orbit](fx.orbit) donne à une piste sa propre réverbération et son propre écho.",
      code: "$: s(\"bd*4\").gain(.9)\n$: s(\"hh*8\").gain(.5).pan(sine.range(.3,.7))\n$: note(\"c2 g2\").s(\"sawtooth\").gain(.7).orbit(2).room(.4)",
      decode: [
        ["gain par piste", "doser chaque couche : la base du mixage."],
        [".pan(sine.range(.3,.7))", "une position stéréo qui bouge doucement, de 0,3 à 0,7."],
        [".orbit(2)", "une réverbération à part pour la basse. La batterie, qui n’a pas de `room`, resterait sèche de toute façon : l’orbit sert à avoir des réglages de pièce DIFFÉRENTS."],
      ],
      theory: {
        title: "Le mot juste",
        items: [
          ["mixer", "équilibrer volumes, espace et stéréo des pistes."],
          ["orbit", "un groupe d’effets partagés : une réverbération et un écho."],
          ["partagé", "le niveau envoyé est propre à chaque son ; la taille de la pièce et l’intervalle de l’écho valent pour toute l’orbit."],
        ],
      },
      exercise: "Donne une réverbération courte à la batterie (`.room(.2).size(1)`) et garde la grande salle sur la basse, en orbit 2. Deux espaces distincts dans le même mix.",
      rich: true,
    },

    {
      id: "6.22",
      kicker: "Le live set",
      title: "Jouer en direct",
      concept: "Le live coding, c’est JOUER devant l’écran. Le secret : prépare un code avec des pistes déjà coupées (`_`), puis enlève les `_` un à un pour monter le morceau. Chaque relance applique tes changements sans couper le son.",
      code: "setcpm(120/4)\ndrums$: s(\"bd*4, ~ cp\").bank(\"RolandTR909\")\n_bass$: note(\"c2 ~ g2 ~\").s(\"gm_acoustic_bass\")\n_lead$: n(\"0 2 4 7\").scale(\"C:minor\").s(\"sawtooth\").gain(.4)",
      decode: [
        ["des pistes en _ au départ", "tout est prêt, mais muet."],
        ["enlève _bass$:, puis _lead$:", "tu fais entrer les couches en direct."],
        ["▶ ou Ctrl + Entrée", "applique chaque modification sans interrompre le groove."],
      ],
      theory: {
        title: "Tes gestes de live",
        items: [
          ["_piste$:", "l’interrupteur : faire entrer ou sortir une couche."],
          ["all(f)", "une transition globale (filtre, volume) en un geste."],
          ["■ ou Ctrl + .", "tout arrêter net."],
        ],
      },
      exercise: "Joue ton set : lance, attends 4 cycles, enlève `_bass$:`, attends, enlève `_lead$:`, puis ajoute `all(x=>x.lpf(400))` pour un break.",
      rich: true,
    },

    {
      id: "6.23",
      kicker: "Garder & diffuser",
      title: "Exporter & partager ton morceau",
      concept: "Tu tiens un morceau qui te plaît ? Garde-le. Dans le Studio de l’app, « Garder » le range dans tes codes ; « Sortir le code de l’app » le télécharge en fichier, ou l’ouvre sur strudel.cc par un lien qui contient tout le code. Pour un fichier audio, il faut enregistrer la sortie son de l’appareil avec un autre logiciel.",
      code: "// @title Mon premier morceau\n// @by Felix\nsetcpm(120/4)\n$: s(\"bd*4, ~ cp\").bank(\"RolandTR909\")\n$: note(\"c2 eb2 g2 c3\").s(\"sawtooth\").gain(.6).room(.3)",
      decode: [
        ["// …", "les lignes qui commencent par `//` sont des commentaires : idéal pour titrer et signer ton morceau (voir [commentaire](js.commentaire))."],
        ["Studio › Garder", "range le code dans « Mes codes gardés »."],
        ["Studio › Sortir le code", "fichier `keymaker.js`, ou lien vers strudel.cc."],
      ],
      theory: {
        title: "Sortir ton morceau",
        items: [
          ["le code", "un simple texte : il contient tout le morceau."],
          ["un lien", "le lien strudel.cc ouvert depuis le Studio contient le code lui-même : l’envoyer, c’est partager le morceau."],
          ["l’audio", "à enregistrer avec un autre logiciel (enregistreur, logiciel de musique) pendant que le morceau joue."],
        ],
      },
      exercise: "Ajoute un titre et ton nom en commentaires, garde le morceau dans le Studio, puis ouvre-le sur strudel.cc pour vérifier qu’il joue pareil.",
      rich: true,
    },

    {
      id: "6.24",
      kicker: "Sans réseau",
      title: "Jouer hors-ligne : la PWA",
      concept: "Jouer ne doit pas dépendre du réseau. Keymaker est une application web installable (une *PWA*) : une fois installée, elle fonctionne hors ligne, avec ses sons embarqués. Seule l’assistante Sati demande une connexion.",
      code: "setcpm(110/4)\n$: s(\"bd*4, ~ cp\").bank(\"RolandTR808\")\n$: note(\"c2 g2 eb2 g2\").s(\"sawtooth\").lpf(800).gain(.6)",
      decode: [
        ["PWA", "une application web qu’on installe, et qui fonctionne sans connexion."],
        ["sons embarqués", "les sons utilisés par les leçons de l’app sont disponibles hors ligne."],
        ["Réglages", "l’écran des réglages indique si tu es en ligne, et comment installer l’app."],
      ],
      exercise: "Installe l’app depuis les Réglages, coupe le réseau, relance ce morceau : il joue toujours.",
      rich: true,
    },

    {
      id: "6.25",
      kicker: "Le projet final",
      title: "Tout Keymaker, un morceau complet",
      concept: "Le bout du parcours : un morceau STRUCTURÉ qui réunit tout. Des voix définies avec `const`, montées dans des pistes nommées, une piste coupée pour le live, et `all()` qui ferme le filtre en transition, un cycle sur huit.",
      code: "setcpm(120/4)\nconst drums = s(\"bd*4, [~ cp]*2, hh*8?\").bank(\"RolandTR909\").degradeBy(.08)\nconst bass  = note(\"<c2 ab1 f1 g1>(3,8)\").s(\"gm_acoustic_bass\").gain(.7)\nconst keys  = chord(\"<Cm7 Ab^7 Fm7 G7>\").voicing().s(\"triangle\").gain(.4).room(.4)\nconst lead  = n(\"0 2 3 5 7\").scale(\"C:minor\").s(\"sawtooth\")\n  .off(1/8, x=>x.add(note(12))).lpf(sine.range(600,2200).slow(8)).gain(.4)\ndrums$: drums\nbass$:  bass\nkeys$:  keys\n_lead$: lead\nall(x => x.when(\"<0!7 1>\", y=>y.lpf(500)))",
      decode: [
        ["4 const + pistes nommées", "chaque voix définie une fois : le morceau se lit comme une partition."],
        ["(3,8)", "le rythme euclidien : 3 coups de basse répartis sur 8 pas, le tresillo."],
        ["_lead$: + all(…when…)", "le lead est prêt mais coupé ; `when(\"<0!7 1>\", …)` ferme le filtre de toutes les pistes au 8ᵉ cycle."],
      ],
      recap: {
        title: "Récap chapitre 5 — Finir et jouer",
        columns: ["Étape", "Code ou bouton", "Sert à"],
        rows: [
          ["mixer", "`gain` · `pan` · `orbit`", "équilibrer les couches, leur donner un espace"],
          ["jouer", "`_$:` · `all(f)`", "monter le morceau en direct"],
          ["garder", "« Garder », dans le Studio", "ranger le code dans tes codes, dans l’app"],
          ["partager", "« Sortir le code de l’app »", "un fichier, ou un lien strudel.cc qui contient tout le code"],
          ["hors ligne", "l’app installée", "jouer sans réseau, sons compris"],
        ],
      },
      exercise: "Approprie-toi le final : enlève le `_` du lead, change la grille, la gamme (`C:dorian`), ajoute une section avec `arrange`. Ce morceau est à toi.",
      free: "Tu as fait le tour des parcours principaux : du premier `bd` au morceau complet, tu sais empiler, nommer, réutiliser, arranger, sculpter, mixer, jouer en direct et partager. Le parcours « Autres genres » t’attend pour aller au bout de trois genres, house, drum & bass et ambient, avec un vrai morceau chacun. Reviens piocher quand tu veux, et appelle Sati si tu bloques. Bravo, Felix.",
      culture: {
        artist: "Mr. Fingers",
        track: "Can You Feel It",
        why: "Chicago, 1986 : Larry Heard l’a fait avec deux machines seulement, un synthétiseur Roland Juno-60 et une boîte à rythmes TR-909. Une grille d’accords, une basse, une batterie : une structure simple, bien arrangée, suffit à faire un classique.",
      },
      rich: true,
      richRecap: true,
    },
  ],
};

/* Le Module 6 entier : la carte de ses 5 chapitres. */
export const module6 = {
  id: 6,
  titre: 'Module 6 — Composition & Projets',
  title: 'Module 6',
  subtitle: 'D’une boucle à un morceau : construire, arranger, jouer, partager',
  chapitres: [m6chapitre1, m6chapitre2, m6chapitre3, m6chapitre4, m6chapitre5],
};

/* Tous les modules de Keymaker, dans l'ordre du parcours. */
export const modules = [module1, module2, module3, module4, module5, module6, module7, module8];

// Rétro-compatibilité : certains imports historiques pointaient sur flash11.
export const flash11 = chapitre1.flashs[0];
    