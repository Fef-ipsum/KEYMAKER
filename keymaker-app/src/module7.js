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
      id: '7.1',
      kicker: 'Le squelette',
      title: "Anatomie d'un track house",
      concept:
        "La house, c'est 120–126 BPM et une recette nette : un kick 4/4, un charley sur le " +
        "CONTRETEMPS, un clap sur 2 et 4, une bassline ronde — et plus tard une voix et un arrangement. " +
        "On pose d'abord le squelette : tout le reste se construit dessus.",
      code:
        'setcpm(124/4)\n' +
        '$: s("bd*4").bank("RolandTR909").gain(.9)\n' +
        '$: s("~ cp ~ cp").bank("RolandTR909").gain(.7)\n' +
        '$: s("[~ hh]*4").bank("RolandTR909").gain(.5)\n' +
        '$: note("<c2 c2 ab1 bb1>").s("sawtooth").lpf(800).gain(.6)',
      decode: [
        ['s("bd*4")', "le kick « four-on-the-floor » : un sur chaque temps. Le cœur de la house."],
        ['[~ hh]*4', "le charley sur le CONTRETEMPS (le « ts » entre deux kicks) → le balancement house."],
        ['~ cp ~ cp', "le clap sur les temps 2 et 4 — le backbeat."],
        ['note("<c2 …>")', "une bassline ronde, une fondamentale par mesure, filtrée au lpf."],
      ],
      theory: {
        title: "Les 6 organes d'un track house",
        items: [
          ['kick 4/4', "le pouls, posé, dansant."],
          ['offbeat hat', "le charley entre les kicks = la signature."],
          ['backbeat', "clap/snare sur 2 et 4."],
          ['bassline', "ronde, sur les fondamentales de la grille."],
          ['vocal chop', "une voix hachée (flash 7.3)."],
          ['arrangement', "intro / montée / drop / outro (flash 7.4)."],
        ],
      },
      exercise:
        "Joue le squelette, puis mute une couche à la fois avec _$: pour entendre le rôle de chacune. " +
        "Le charley offbeat coupé → tout de suite moins « house ».",
      culture: {
        artist: 'Frankie Knuckles',
        track: 'Your Love',
        why:
          "le parrain de la house, Chicago : kick 4/4, bassline hypnotique, émotion — repère le charley offbeat dès l'intro.",
      },
    },

    {
      id: '7.2',
      kicker: 'Le balancement',
      title: 'Le groove house : swing & humanisation',
      concept:
        "Une grille parfaitement droite sonne raide, « machine ». Le groove house naît du SWING " +
        "(on retarde un charley sur deux) et de micro-décalages (late/early) qui « humanisent ». " +
        "Le même beat, mais il respire.",
      code:
        'setcpm(124/4)\n' +
        '$: s("bd*4, ~ cp ~ cp").bank("RolandTR909")\n' +
        '$: s("hh*8").bank("RolandTR909").swing(8).gain(.5)\n' +
        '$: note("c2 ~ c2 ~ ab1 ~ bb1 ~").s("sawtooth").lpf(800).late(.005).gain(.6)',
      decode: [
        ['.swing(8)', "balance les 8 charleys : un sur deux est retardé → le groove ternaire."],
        ['.late(.005)', "retarde la basse d'un cheveu → elle « pousse » derrière le kick (humanisation)."],
        ['hh*8', "huit charleys par mesure, support du swing."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['swing', "décaler les contretemps → balancement (ni tout droit, ni triolet)."],
          ['late / early', "micro-retard / micro-avance, en fractions de cycle."],
          ['humaniser', "casser la perfection machine pour un feel vivant."],
        ],
      },
      exercise:
        "Pousse le swing (.swing(16)), puis enlève-le : entends la house redevenir un métronome. " +
        "Joue aussi avec .late(.02) sur le clap.",
    },

    {
      id: '7.3',
      kicker: 'La voix-instrument',
      title: 'Le vocal chop & le sample',
      concept:
        "La house adore la voix humaine découpée en bouts (le vocal chop). Pas besoin d'importer : " +
        "Strudel embarque « numbers » — des chiffres parlés. On les pioche avec n(), et on HACHE un " +
        "sample en tranches avec chop().",
      code:
        'setcpm(124/4)\n' +
        '$: s("bd*4, ~ cp").bank("RolandTR909")\n' +
        '$: s("numbers:3").chop(8).gain(.7).room(.2)\n' +
        '$: n("0 2 4 6").s("numbers").gain(.55)',
      decode: [
        ['s("numbers:3")', "un échantillon vocal intégré (le chiffre « trois » parlé)."],
        ['.chop(8)', "découpe le sample en 8 tranches jouées dans l'ordre → l'effet « stutter » vocal."],
        ['n("0 2 4 6").s("numbers")', "n(...) placé à GAUCHE impose le rythme (4 événements) -> on entend bien zéro, deux, quatre, six."],
        ['.room(.2)', "un voile de réverbe pour poser la voix dans l'espace."],
      ],
      theory: {
        title: 'Hacher & réordonner un sample',
        items: [
          ['chop(n)', "n tranches jouées DANS L'ORDRE (stutter)."],
          ['slice(n, "<…>")', "rejoue les tranches dans un ORDRE choisi (remix)."],
          [':n / .n("…")', "choisit quel sample/quelle tranche."],
          ['tes propres voix', "samples('github:…') charge tes vocaux (réseau, une fois)."],
        ],
      },
      exercise:
        "Remplace .chop(8) par .slice(8, \"<0 2 4 6 1 3 5 7>\") : tu réordonnes les tranches → " +
        "un vrai remix de la voix. Essaie d'autres ordres.",
    },

    {
      id: '7.4',
      kicker: 'Les sections',
      title: 'Arranger en 8 / 16 mesures',
      concept:
        "Un morceau n'est pas une boucle infinie : c'est des SECTIONS qui s'enchaînent. arrange() " +
        "joue chaque pattern pendant un nombre de mesures donné, à la suite. C'est l'histoire en 4 actes : " +
        "intro → montée → drop → outro.",
      code:
        'setcpm(124/4)\n' +
        'const kick = s("bd*4").bank("RolandTR909")\n' +
        'const clap = s("~ cp ~ cp").bank("RolandTR909")\n' +
        'const bass = note("<c2 ab1 bb1 c2>").s("sawtooth").lpf(800).gain(.6)\n' +
        'arrange(\n' +
        '  [8,  kick],\n' +
        '  [8,  stack(kick, clap)],\n' +
        '  [16, stack(kick, clap, bass)],\n' +
        '  [8,  kick]\n' +
        ')',
      decode: [
        ['const nom = …', "on définit chaque brique une fois (pont M6), pour la réutiliser."],
        ['arrange([8, kick])', "joue « kick » pendant 8 mesures, puis passe à la section suivante."],
        ['[16, stack(…)]', "le DROP : 16 mesures avec toutes les couches empilées."],
        ['1 cycle = 1 mesure', "8 = 8 mesures ; l'arrangement dure 8+8+16+8 = 40 mesures."],
      ],
      theory: {
        title: 'La structure DJ',
        items: [
          ['intro', "le kick seul — le DJ cale le morceau."],
          ['montée (build)', "on empile les couches, la tension monte."],
          ['drop', "tout entre, le plein d'énergie."],
          ['outro', "on retire les couches — le DJ enchaîne."],
        ],
      },
      exercise:
        "Ajoute une section « break » : [8, stack(clap, bass)] (sans kick) avant le drop. " +
        "Couper le kick puis le faire revenir = l'effet le plus efficace de toute la house.",
      culture: {
        artist: 'Derrick May',
        track: 'Strings of Life',
        why:
          "Detroit 1987 : pas de bassline, un piano euphorique, une structure en blocs qui montent — un cours d'arrangement à lui tout seul.",
      },
    },

    {
      id: '7.5',
      kicker: 'Le projet',
      title: 'Projet : un track house complet (~2 min)',
      concept:
        "On réunit tout : batterie complète, bassline, accords de 7e en pad, un vocal chop, et un " +
        "arrangement en 6 sections. ~64 mesures à 124 BPM ≈ deux minutes. C'est un vrai morceau, " +
        "joué par une seule règle.",
      code:
        'setcpm(124/4)\n' +
        'const drums  = s("bd*4, ~ cp ~ cp, [~ hh]*4").bank("RolandTR909")\n' +
        'const bass   = note("<c2 c2 ab1 bb1>").s("sawtooth").lpf(900).gain(.7)\n' +
        'const chords = chord("<Cm7 Ab^7 Bb^7 Cm7>").voicing().s("sawtooth").lpf(2000).attack(.1).gain(.4).room(.4)\n' +
        'const vox    = s("numbers:3").chop(8).gain(.5).room(.3)\n' +
        'arrange(\n' +
        '  [8,  bass],\n' +
        '  [8,  stack(drums, bass)],\n' +
        '  [16, stack(drums, bass, chords)],\n' +
        '  [8,  stack(drums, chords, vox)],\n' +
        '  [16, stack(drums, bass, chords, vox)],\n' +
        '  [8,  drums]\n' +
        ')',
      decode: [
        ['intro [8, bass]', "la basse seule pose la tonalité (do mineur)."],
        ['montée + drop', "on empile drums, puis chords : le drop à la section 3 (16 mesures)."],
        ['break [8, … vox]', "on retire la basse, le vocal chop respire."],
        ['outro [8, drums]', "il ne reste que la batterie — prêt à enchaîner."],
      ],
      recap: {
        title: 'Récap 7.1 — La house',
        columns: ['Brique', 'Idée', 'Strudel'],
        rows: [
          ['Kick 4/4', 'le cœur', 's("bd*4").bank("RolandTR909")'],
          ['Offbeat', 'le balancement', 's("[~ hh]*4")'],
          ['Backbeat', 'clap 2 & 4', 's("~ cp ~ cp")'],
          ['Groove', 'swing / nudge', '.swing(8) / .late()'],
          ['Vocal chop', 'voix hachée', 's("numbers:3").chop(8)'],
          ['Arrangement', 'les sections', 'arrange([8,a],[16,b])'],
        ],
      },
      exercise:
        "Change la grille (chord(\"<Fm7 Db^7 Eb^7 Fm7>\")), le tempo (122–126), l'ordre des sections. " +
        "Le squelette tient : tu ne fais que raconter une autre histoire.",
      free:
        "Fais TA house : pars du squelette (kick 4/4 + clap + charley offbeat), pose une bassline ronde, " +
        "ajoute UN vocal chop, puis raconte 4 actes avec arrange (intro → montée → drop → outro). " +
        "Vise 124 BPM, et juge une seule chose : est-ce que ça donne envie de danser ?",
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
      id: '7.11',
      kicker: 'Le grand écart',
      title: "Anatomie du drum & bass",
      concept:
        "Le D&B, c'est ~170–175 BPM, des charleys ultra-rapides… mais un beat qui paraît LENT et lourd " +
        "(le half-time). Ce grand écart entre vitesse et ressenti, plus une basse sub très grave, c'est " +
        "toute sa signature.",
      code:
        'setcpm(170/4)\n' +
        '$: s("bd ~ ~ ~ ~ ~ ~ ~").bank("RolandTR808").gain(.9)\n' +
        '$: s("~ ~ ~ ~ sd ~ ~ ~").bank("RolandTR808").gain(.8)\n' +
        '$: s("hh*16").bank("RolandTR808").gain(.3)\n' +
        '$: note("c1*4").s("sine").gain(.8)',
      decode: [
        ['setcpm(170/4)', "le tempo réel du D&B : très rapide."],
        ['snare sur le temps 3', "(5ᵉ pas sur 8) → le « half-time feel » : le beat semble deux fois plus lent."],
        ['hh*16', "16 charleys → l'énergie rapide qui contraste avec le beat lent."],
        ['note("c1*4").s("sine")', "un sub bien grave et rond (sine), le moteur basse du genre."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['breakbeat', "un beat syncopé hérité du funk (pas un 4/4 droit)."],
          ['sub bass', "la basse grave qu'on ressent plus qu'on entend."],
          ['half-time feel', "snare sur le 3 → ressenti ≈ 85 BPM, alors que le tempo est 170."],
        ],
      },
      exercise:
        "Double la vitesse ressentie : mets le snare sur 2 ET 4 (\"~ ~ sd ~ ~ ~ sd ~\"). " +
        "Même tempo, mais ça file deux fois plus vite (full-time).",
    },

    {
      id: '7.12',
      kicker: 'Le break',
      title: 'Le breakbeat : chop, iter, shuffle',
      concept:
        "Le cœur du D&B, c'est LE break : l'« amen » (un solo de batterie de 1969) découpé en tranches " +
        "et réordonné sans fin. On le charge, on le hache, puis iter() le DÉCALE chaque mesure → une " +
        "boucle qui ne se répète jamais vraiment.",
      code:
        "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })\n" +
        'setcpm(170/4)\n' +
        '$: s("amen/4").fit().chop(16).iter(4).cut(1).gain(.9)\n' +
        '$: note("<c1 c1 eb1 c1>").s("sine").gain(.7)',
      decode: [
        ['samples({ amen: url })', "charge le break depuis son URL sous le nom « amen » (téléchargement réseau, UNE fois puis cache — même geste qu'en M6 6.16)."],
        ['s("amen/4").fit()', "le break amen étalé sur 4 mesures, calé pile sur les cycles."],
        ['.chop(16)', "16 tranches jouées dans l'ordre."],
        ['.iter(4)', "décale le motif d'1/4 à chaque mesure → la variation infinie."],
        ['.cut(1)', "chaque tranche coupe la précédente → propre, pas de chevauchement."],
      ],
      theory: {
        title: 'Hacher un break',
        items: [
          ['amen', "le break le plus samplé de l'histoire — l'ADN du D&B et de la jungle."],
          ['chop vs slice', "chop = dans l'ordre ; slice(n,\"<…>\") = ordre choisi (shuffle)."],
          ['iter(n)', "rotation du motif → variation automatique."],
        ],
      },
      exercise:
        "Remplace .iter(4) par .slice(16, \"<0 1 2 3 8 9 6 7>\") : tu réordonnes les tranches → " +
        "ton propre découpage du break. C'est ça, faire du D&B.",
      culture: {
        artist: 'The Winstons',
        track: 'Amen, Brother',
        why:
          "le break de batterie le plus samplé de l'histoire (vers 1:26) : six secondes de 1969 devenues l'ADN de la jungle et du D&B.",
      },
    },

    {
      id: '7.13',
      kicker: 'Le growl',
      title: 'La basse roulante (reese)',
      concept:
        "La basse signature du D&B, c'est la « reese » : deux ondes dent-de-scie LÉGÈREMENT désaccordées " +
        "qui battent l'une contre l'autre → un grognement mouvant. On l'obtient en empilant deux notes à " +
        "une fraction de demi-ton d'écart.",
      code:
        'setcpm(170/4)\n' +
        '$: s("bd ~ ~ ~ sd ~ ~ ~").bank("RolandTR808")\n' +
        '$: note("[24,24.2]*8").s("sawtooth").lpf(sine.range(300,1400).slow(4)).lpq(7).decay(.2).sustain(.6).gain(.55)',
      decode: [
        ['note("[24,24.2]")', "DEUX saws désaccordés de 0,2 demi-ton (MIDI 24 et 24.2) → le battement « reese »."],
        ['*8', "la basse roule en croches."],
        ['lpf(sine.range(300,1400).slow(4))', "le filtre ondule sur 4 mesures → le growl bouge, vivant."],
        ['les décimales', "rappel M2/référence : note() accepte des numéros MIDI à virgule (micro-tonal)."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['reese bass', "du nom de Kevin Saunderson (1988) — la basse désaccordée roulante."],
          ['désaccord (detune)', "un minuscule écart de hauteur entre deux oscillateurs → battement."],
          ['mouvement', "un filtre lent rend la basse organique, jamais statique."],
        ],
      },
      exercise:
        "Élargis le désaccord : note(\"[24,24.5]*8\") (plus rauque), puis resserre à 24.05 (presque pur). " +
        "Trouve le grain qui growl juste comme il faut.",
      culture: {
        artist: 'Reese (Kevin Saunderson)',
        track: 'Just Want Another Chance',
        why:
          "Detroit 1988 : la basse détunée qui gronde dans l'intro a donné son NOM à la reese — toute la bass music en descend.",
      },
    },

    {
      id: '7.14',
      kicker: 'Le poids',
      title: 'Half-time vs full-time',
      concept:
        "Une même piste à 170 BPM peut sonner légère et filante (full-time) ou lourde et planante " +
        "(half-time). Tout tient à la place du snare. Passer de l'un à l'autre, c'est l'effet « drop » " +
        "le plus jouissif du D&B.",
      code:
        'setcpm(170/4)\n' +
        'const hats = s("hh*16").bank("RolandTR808").gain(.3)\n' +
        'const subs = note("[24,24.2]*4").s("sawtooth").lpf(700).lpq(6).gain(.55)\n' +
        'arrange(\n' +
        '  [8, stack(s("bd*2, ~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808"), hats, subs)],\n' +
        '  [8, stack(s("bd ~ ~ ~ ~ ~ ~ ~, ~ ~ ~ ~ sd ~ ~ ~").bank("RolandTR808"), hats, subs)]\n' +
        ')',
      decode: [
        ['section 1 (full-time)', "snare sur 2 ET 4 → ça file, léger, rapide."],
        ['section 2 (half-time)', "snare sur le SEUL temps 3 → ressenti ≈ 85, lourd, planant."],
        ['même tempo', "170 BPM dans les deux : seule la place du snare change le ressenti."],
        ['hats / subs constants', "le contraste vient du beat, pas du reste."],
      ],
      theory: {
        title: 'Deux ressentis, un tempo',
        items: [
          ['full-time', "le beat suit le tempo réel → énergie, course."],
          ['half-time', "le beat paraît moitié moins vite → poids, espace."],
          ['le drop', "basculer en half-time sur le drop = signature du D&B moderne."],
        ],
      },
      exercise:
        "Inverse l'ordre : commence en half-time, puis bascule en full-time. " +
        "Sens comment le passage relance toute l'énergie.",
    },

    {
      id: '7.15',
      kicker: 'Le projet',
      title: 'Projet : une intro D&B avec break & drop',
      concept:
        "On assemble : une intro atmosphérique (pad + sub), une montée, puis le DROP — le break amen " +
        "entre en plein, avec la reese. C'est la structure d'ouverture classique d'un morceau D&B.",
      code:
        "samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })\n" +
        'setcpm(170/4)\n' +
        'const sub   = note("[24,24.2]*4").s("sawtooth").lpf(700).lpq(6).gain(.55)\n' +
        'const brk   = s("amen/4").fit().chop(16).iter(4).cut(1).gain(.9)\n' +
        'const pad   = chord("<Cm7 Ab^7>").voicing().s("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)\n' +
        'arrange(\n' +
        '  [8,  stack(pad, sub)],\n' +
        '  [8,  stack(pad, sub, s("~ ~ sd ~").bank("RolandTR808").gain(.5))],\n' +
        '  [16, stack(brk, sub, pad)],\n' +
        '  [8,  stack(pad, sub)]\n' +
        ')',
      decode: [
        ['intro [8, pad+sub]', "ambiance planante : un pad et le sub, sans batterie."],
        ['montée [8, … snare]', "on ajoute des snares épars → la tension monte."],
        ['drop [16, brk + …]', "le break amen entre en plein → l'explosion D&B."],
        ['const brk', "on évite « break » (mot réservé en JS) → on nomme la piste « brk »."],
      ],
      recap: {
        title: 'Récap 7.3 — Le drum & bass',
        columns: ['Brique', 'Idée', 'Strudel'],
        rows: [
          ['BPM', 'rapide', 'setcpm(170/4)'],
          ['Breakbeat', 'amen haché', 's("amen/4").chop(16).iter(4)'],
          ['Sub', 'grave & rond', 'note("c1").s("sine")'],
          ['Reese', 'saws désaccordés', 'note("[24,24.2]")'],
          ['Half-time', 'snare sur le 3', 'feel ≈ 85 à 170 BPM'],
          ['Structure', 'intro → break', 'arrange([8,a],[16,b])'],
        ],
      },
      exercise:
        "Change la tonalité du pad et du sub (Fm : sub sur note(\"[29,29.2]\"), pad \"<Fm7 Db^7>\"). " +
        "Puis allonge le drop à 32 mesures.",
      free:
        "Fais ton D&B : un sub bien grave (sine ou reese désaccordé), l'amen haché et varié (chop + iter), " +
        "et joue sur le half-time (snare sur le 3) pour le poids. Construis une intro atmosphérique qui " +
        "DROP sur le break. Vise 170–174 BPM — et laisse le sub faire trembler les murs.",
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
        '$: chord("<Am F C G>").voicing().superimpose(x=>x.add(0.15)).s("sawtooth").lpf(sine.range(800,4000).slow(8)).attack(.1).release(.4).room(.5).gain(.3)',
      decode: [
        ['superimpose(x=>x.add(0.15))', "superpose une COPIE désaccordée de 0,15 demi-ton → le « gras » supersaw."],
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
        "Empile une 2ᵉ couche : ajoute .superimpose(x=>x.add(0.3)) → 3 saws, encore plus large. " +
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
        'const lead  = n("<0 2 4 7>*2").scale("A:minor").s("sawtooth").superimpose(x=>x.add(0.12)).lpf(3000).room(.5).gain(.35)\n' +
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
        'const pad   = chord("<Am F C E>").voicing().superimpose(x=>x.add(0.13)).s("sawtooth").attack(.3).release(.6).room(.6).gain(.28)\n' +
        'const lead  = n("<0 2 4 7 9 7 4 2>").scale("A:minor").s("sawtooth").superimpose(x=>x.add(0.12)).lpf(3500).delay(.3).room(.5).gain(.3)\n' +
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
          ['Supersaw', 'accords gras', 'superimpose(x=>x.add(0.15))'],
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
      id: '7.21',
      kicker: 'Le temps s\'étire',
      title: "Anatomie de l'ambient",
      concept:
        "L'ambient renverse tout : (presque) pas de beat, une lenteur extrême, des textures qui évoluent " +
        "longtemps, et un espace immense. Ici, le temps s'étire — un accord peut durer dix secondes. " +
        "On baisse radicalement le tempo et on laisse respirer.",
      code:
        'setcpm(24/4)\n' +
        '$: note("c2").s("sine").gain(.35).room(.5)\n' +
        '$: chord("<Cm7 Ab^7>").voicing().s("sawtooth").lpf(900).attack(2).release(4).room(.85).roomsize(8).gain(.35)',
      decode: [
        ['setcpm(24/4)', "très lent : ~6 cycles/min → une mesure dure ~10 secondes."],
        ['note("c2").s("sine")', "un DRONE : une note grave tenue, le socle de la pièce."],
        ['attack(2).release(4)', "le pad entre en 2 s et s'éteint en 4 s → des nappes qui respirent."],
        ['room(.85).roomsize(8)', "une réverbe immense → l'espace devient l'instrument."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['ambient', "musique de texture et d'atmosphère (Brian Eno), à écouter ou à habiter."],
          ['drone', "une note/un accord tenu très longtemps, le socle."],
          ['lenteur', "le tempo bas laisse chaque son se déployer entièrement."],
        ],
      },
      exercise:
        "Descends encore : setcpm(16/4). Allonge attack(4).release(6). " +
        "Sens comment le morceau cesse d'être un « rythme » pour devenir un « lieu ».",
      culture: {
        artist: 'Brian Eno',
        track: 'Ambient 1: Music for Airports (1/1)',
        why:
          "l'album qui a NOMMÉ le genre (1978) : des boucles de durées inégales qui se décalent — « aussi ignorable qu'intéressante », disait Eno.",
      },
    },

    {
      id: '7.22',
      kicker: 'La nappe vivante',
      title: 'Le drone & le pad génératif',
      concept:
        "Une nappe figée s'ennuie vite. En ambient, le pad ÉVOLUE : un filtre qui morphe très lentement, " +
        "des notes qui sautent parfois d'octave. C'est génératif — ça ne sonne jamais exactement pareil, " +
        "sans que tu touches à rien.",
      code:
        'setcpm(24/4)\n' +
        '$: note("c2,c3").s("sawtooth").lpf(sine.range(300,1200).slow(12)).lpq(3).room(.7).gain(.35)\n' +
        '$: n("0 2 4 6").scale("C:minor").s("triangle").slow(2).attack(1).release(3).room(.8).gain(.25).sometimesBy(.4, x=>x.add(12))',
      decode: [
        ['note("c2,c3")', "le drone, à l'octave (deux notes tenues)."],
        ['lpf(sine.range(300,1200).slow(12))', "le filtre morphe sur 12 mesures → la nappe respire, vivante."],
        ['.slow(2)', "le motif s'étire sur 2 mesures → encore plus contemplatif."],
        ['sometimesBy(.4, x=>x.add(12))', "40% du temps, une note saute d'une octave → la variation génératif."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['morphing', "un paramètre (le filtre) qui change très lentement → l'évolution."],
          ['génératif', "des règles + du hasard → un résultat toujours un peu différent."],
          ['pad', "une nappe d'accords tenue, le corps harmonique."],
        ],
      },
      exercise:
        "Ralentis le morph (.slow(24)) et élargis-le (sine.range(200,2000)). " +
        "Laisse tourner deux minutes : écoute la nappe se transformer toute seule.",
    },

    {
      id: '7.23',
      kicker: 'Le hasard en gamme',
      title: 'Hasard maîtrisé : toujours différent',
      concept:
        "L'ambient adore le hasard — mais MAÎTRISÉ. Des notes tirées au sort, contraintes dans une gamme " +
        "(jamais fausses), et trouées au hasard (degrade). La pièce se compose seule, autrement à chaque " +
        "boucle, sans jamais sonner faux.",
      code:
        'setcpm(24/4)\n' +
        '$: note("c2").s("sine").gain(.3)\n' +
        '$: n(irand(8).segment(4)).scale("C:minor").s("triangle").attack(1).release(4).room(.85).gain(.3).degradeBy(.4)\n' +
        '$: n("0 3 5 7").scale("C:minor").s("sawtooth").lpf(900).slow(3).sometimesBy(.5, x=>x.add("<0 7 12>")).room(.7).gain(.2)',
      decode: [
        ['irand(8).segment(4)', "4 degrés tirés AU HASARD par cycle (entiers 0–7)."],
        ['.scale("C:minor")', "le hasard est contraint dans la gamme → jamais une fausse note."],
        ['.degradeBy(.4)', "on retire 40% des notes au hasard → de l'air, du jamais-pareil."],
        ['déterministe', "même code = même suite (rappel M5) ; ribbon(graine, n) fige un fragment qui plaît."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['hasard maîtrisé', "de l'aléatoire encadré par des règles (gamme, probas)."],
          ['irand / rand', "tire des nombres au hasard ; .scale() les rend justes."],
          ['degrade', "retire des événements au hasard → respiration."],
        ],
      },
      exercise:
        "Change la graine du hasard avec ribbon(3, 4) sur la couche irand : tu PÊCHES une variation, " +
        "puis tu la figes. Essaie plusieurs graines, garde celle que tu préfères.",
    },

    {
      id: '7.23b',
      kicker: 'Les engrenages',
      title: 'Le polymètre : { a b, c d e }',
      concept:
        "Deux boucles de LONGUEURS différentes qui avancent au même pas : elles se décalent à chaque tour, " +
        "comme deux engrenages, et ne se réalignent que bien plus tard. C'est le polymètre — l'astuce " +
        "préférée de l'ambient et de l'IDM pour qu'une boucle ne se répète jamais vraiment.",
      code:
        'setcpm(24/4)\n' +
        '$: note("c2").s("sine").gain(.3).room(.5)\n' +
        '$: n("{0 4 2, 7 5 3 1}%4").scale("C:minor").s("triangle").attack(.5).release(2).room(.8).gain(.3)',
      decode: [
        ['{0 4 2, 7 5 3 1}', "deux séquences de longueurs DIFFÉRENTES (3 et 4 notes) dans un même pattern."],
        ['%4', "la vitesse commune : 4 pas par cycle pour tout le monde."],
        ['le décalage', "3 contre 4 → elles ne se réalignent que tous les 12 pas : la boucle « tourne » sans se répéter."],
        ['polymeter(…)', "existe aussi en fonction (M5 : factories), si tu préfères éviter les accolades."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['polymètre (polymeter)', "des cycles de longueurs différentes superposés, même vitesse de pas."],
          ['vs la virgule', '"a b, c d e" (M1) étire tout sur UN cycle ; {a b, c d e} laisse chacun sa longueur.'],
          ['l\'héritage', "les tape loops de longueurs inégales de Brian Eno (Music for Airports) : le même principe, en bande magnétique."],
        ],
      },
      exercise:
        'Change les longueurs : {0 4 2 5, 7 5 3}%4 (4 contre 3), puis %3 ou %8 pour la densité. ' +
        'Laisse tourner : note quand la figure se répète vraiment.',
    },

    {
      id: '7.24',
      kicker: 'L\'espace-instrument',
      title: 'Réverb, delay, granularité',
      concept:
        "En ambient, les effets ne décorent pas : ils COMPOSENT. Une réverbe-cathédrale, un delay long et " +
        "syncopé, et la granularité (hacher un son en grains) transforment une simple texture en nuage " +
        "sonore. L'espace est l'instrument principal.",
      code:
        'setcpm(24/4)\n' +
        '$: s("space").chop(16).slow(2).delay(.6).delaytime(.375).delayfeedback(.6).room(.9).roomsize(10).orbit(2).gain(.3)\n' +
        '$: note("c2").s("sine").room(.6).gain(.3)',
      decode: [
        ['s("space").chop(16)', "un son d'ambiance intégré, haché en 16 grains → la granularité."],
        ['.delay(.6).delayfeedback(.6)', "des échos qui s'empilent et se répondent."],
        ['.room(.9).roomsize(10)', "une réverbe énorme → le grain devient nuage."],
        ['.orbit(2)', "un bus de réverbe/délai séparé du drone (rappel §8) → propre."],
      ],
      theory: {
        title: 'Le mot juste',
        items: [
          ['réverb', "room/roomsize/rlp → la taille et la couleur de l'espace."],
          ['delay', "delay/delaytime/delayfeedback → des échos rythmiques."],
          ['granularité', "chop(n) → des micro-grains, une texture vaporeuse."],
        ],
      },
      exercise:
        "Pousse chop(32) et delayfeedback(.8) : le grain se dissout en brume infinie. " +
        "Attention au feedback trop haut — ça s'emballe.",
    },

    {
      id: '7.25',
      kicker: 'Le tout dernier flash',
      title: 'Projet final : une pièce ambient générative (~5 min)',
      concept:
        "Le bout du chemin. Une pièce qui se compose toute seule, tissant tout Keymaker : un drone (M4), " +
        "des accords riches (M2), du hasard en gamme (M5), un espace immense (M4), et des couches nommées " +
        "(M6). Lance-la, et elle vivra ~5 minutes — différente à chaque fois. Tu ne joues plus : tu as " +
        "écrit un monde, et il respire.",
      code:
        'setcpm(20/4)\n' +
        '$: note("c2").s("sine").gain(.3).room(.5)\n' +
        '$: chord("<Cm7 Ab^7 Fm7 Gm7>").voicing().superimpose(x=>x.add(0.1)).s("sawtooth").lpf(sine.range(400,1600).slow(16)).attack(3).release(5).room(.85).roomsize(9).gain(.26)\n' +
        '$: n(irand(8).segment(2)).scale("C:minor").s("triangle").attack(1).release(4).delay(.6).delaytime(.5).delayfeedback(.5).room(.9).orbit(2).gain(.2).degradeBy(.5)\n' +
        '$: s("space").chop(16).slow(3).delay(.5).delayfeedback(.5).room(.9).orbit(3).gain(.16)\n' +
        '$: n("<0 3 5 7 10 7 5 3>").scale("C:minor").s("sine").slow(4).sometimesBy(.4, x=>x.add(12)).room(.8).gain(.16)',
      decode: [
        ['le drone (M4)', "la note grave tenue, le socle de tout."],
        ['le pad supersaw (M2+M4)', "accords de 7e détunés, filtre qui morphe sur 16 mesures."],
        ['les grains au hasard (M5)', "des notes tirées au sort, en gamme, trouées → jamais deux fois pareil."],
        ['l\'espace (M4) + le motif (M6)', "réverbe-nuage sur bus séparés, et une mélodie lente qui flotte."],
      ],
      recap: {
        title: 'Récap 7.5 — L\'ambient',
        columns: ['Brique', 'Idée', 'Strudel'],
        rows: [
          ['Lenteur', 'tempo bas', 'setcpm(20/4)'],
          ['Drone', 'note tenue', 'note("c2").s("sine")'],
          ['Pad génératif', 'morph lent', 'lpf(sine.range().slow(16))'],
          ['Hasard maîtrisé', 'en gamme', 'n(irand(8)).scale("C:minor")'],
          ['Espace', 'réverb / delay', 'room(.9) / delay(.6)'],
          ['Granularité', 'grains', 's("space").chop(16)'],
        ],
      },
      exercise:
        "Approprie-toi la pièce : change la grille (\"<Em9 C^7 …>\"), la gamme (C:dorian, C:aeolian), " +
        "les graines du hasard. Puis laisse-la tourner, vraiment, cinq minutes — c'est ça, l'ambient.",
      free:
        "C'est le tout dernier flash de Keymaker. Regarde le chemin parcouru : du premier « bd » au beat " +
        "techno, aux frissons de la trance, à ta guitare fondue dans l'industrial, au son acide sculpté " +
        "main, à la machine qui compose seule, aux morceaux complets — et maintenant à une pièce qui vit " +
        "sans toi. Tu n'apprends plus Strudel : tu en as toutes les clés (Keymaker !). Le code n'est plus " +
        "un mur, c'est ton studio. Lance cette pièce, ferme les yeux, laisse-la se dérouler — elle ne sera " +
        "jamais deux fois la même, comme chaque set que tu joueras. Le plus beau commence maintenant : fais " +
        "TA musique. Reviens piocher quand tu veux, appelle Sati si tu bloques. Merci pour le voyage, Felix. 🎛️🌌",
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
