// Keymaker — Module 8 « Hardware & PO-33 KO » (Chantier 31, 6 juin 2026).
//
// Rôle : le pont entre le code et le geste physique. Deux tranches :
//  - Ch.1 « Tes sons » : sampler avec le PO-33 → samples() → chop/slice (Tranche 1).
//  - Ch.2 « Sync live » : la sync audio 2 PPQN (canal gauche) + le duo live (Tranche 2).
//
// Source de vérité du code : KEYMAKER_strudel_reference.md (idiomes validés M1–M7).
// Convention projet : 1 cycle = 1 mesure ; setcpm(BPM/4) en 4/4. 4 temps × 2 PPQN = 8 clics/cycle.
// Même format de flash que M1–M7 (id, kicker, title, concept, code, decode?, theory?, exercise, recap?, free?).

export const m8chapitre1 = {
  module: 8,
  chapter: 'Tes sons',
  title: 'Tes sons dans Strudel',
  subtitle: 'Sampler avec le PO-33, charger ton kit, hacher tes breaks',
  flashs: [
    {
      id: '8.1',
      kicker: 'Du geste au code',
      title: 'Le PO-33, ta fabrique à sons',
      concept:
        "Le PO-33 KO est un sampler de poche : un micro intégré, une entrée jack, 16 pas pour " +
        "séquencer. Tout son du monde peut y entrer — un coup de cuillère, ta voix, un bout de " +
        "vinyle — et devenir un instrument. Le pont avec Strudel tient en quatre gestes : enregistre " +
        "sur le PO, exporte en audio, dépose le fichier dans /sounds/po33/, puis charge-le avec " +
        "samples(). À partir de là, tes sons faits main sont la matière de tes patterns.",
      code:
        'setcpm(120/4)\n' +
        '// Tes sons PO-33 — décommente quand tes .wav sont dans /sounds/po33/ :\n' +
        '// samples({ kick:"/sounds/po33/kick.wav", clap:"/sounds/po33/clap.wav" })\n' +
        '// s("kick ~ clap ~")\n' +
        '//\n' +
        '// En attendant, le même geste avec le kit intégré :\n' +
        '$: s("bd ~ sd ~").bank("RolandTR909").gain(.9)',
      decode: [
        ['samples({ nom: url })', "associe un nom court à un fichier. Une fois chargé, s(\"nom\") le joue."],
        ['/sounds/po33/…', "le dossier de l'app où tu déposes tes exports PO-33 (servi à la racine)."],
        ['une seule fois', "samples() charge en mémoire au 1er Run ; ensuite c'est instantané."],
        ['s("bd ~ sd ~")', "le kit intégré (RolandTR909) le temps que tes sons arrivent — même structure."],
      ],
      theory: {
        title: 'Le pipeline en 4 gestes',
        items: [
          ['1. Enregistrer', "sur le PO-33 (micro, jack, vinyle)."],
          ['2. Exporter', "line-out du PO → enregistreur / carte son → un .wav."],
          ['3. Déposer', "le fichier dans public/sounds/po33/."],
          ['4. Charger', "samples({ nom:\"/sounds/po33/fichier.wav\" }) puis s(\"nom\")."],
        ],
      },
      exercise:
        "Enregistre UN son sur ton PO (un mot, un claquement), exporte-le en kick.wav, dépose-le " +
        "dans /sounds/po33/, puis décommente les lignes samples()/s(). Ton premier son perso dans Strudel.",
    },

    {
      id: '8.2',
      kicker: 'Range ta boîte à sons',
      title: 'Charger et nommer ton kit PO-33',
      concept:
        "samples() accepte une carte { nom: chemin } : tu choisis les noms — courts, clairs — et " +
        "tu t'en sers ensuite comme de n'importe quel son. Un bon nommage, c'est la moitié du confort " +
        "en live : des noms parlants (kick, clap, voix, vinyl) et des fichiers sans espaces ni accents. " +
        "Charge tout ton kit en haut du code, une fois, puis joue.",
      code:
        'setcpm(120/4)\n' +
        '// remplace par tes fichiers PO-33 (sinon ça reste silencieux) :\n' +
        'samples({\n' +
        '  kick: "/sounds/po33/kick.wav",\n' +
        '  clap: "/sounds/po33/clap.wav",\n' +
        '  voix: "/sounds/po33/voix.wav",\n' +
        '})\n' +
        '$: s("kick*2 ~ kick ~").gain(.9)\n' +
        '$: s("~ clap").gain(.8)\n' +
        '$: s("voix").slow(4).gain(.7)',
      decode: [
        ['{ kick: …, clap: … }', "la carte de ton kit : à gauche le nom, à droite le fichier."],
        ['noms courts', "kick, clap, voix… faciles à taper en live. Pas d'espaces ni d'accents dans les fichiers."],
        ['s("voix").slow(4)', "un sample long (nappe, phrase) étiré sur 4 cycles."],
        ['en haut, une fois', "charge tout le kit au début ; Strudel garde tout en mémoire."],
      ],
      theory: {
        title: 'Bien nommer = jouer vite',
        items: [
          ['Percussions', 'kick, snare, clap, hat, rim'],
          ['Voix / textures', 'voix, chant, pad, drone'],
          ['Matière trouvée', 'vinyl, field, foley'],
          ['Règle', 'minuscules, sans espace/accent : break_amen.wav'],
        ],
      },
      exercise:
        "Charge un kit de 3 sons PO-33 (kick, clap, voix) et fais un groove de 2 mesures. " +
        "Mute une couche avec _$: pour entendre chaque son seul.",
    },

    {
      id: '8.3',
      kicker: 'Découper pour recomposer',
      title: 'Chopper un break PO-33',
      concept:
        "Un des gestes les plus puissants : sample une boucle entière (un break joué sur ton PO, ou " +
        "trouvé), puis HACHE-la pour la recomposer. chop(n) coupe le sample en n tranches jouées dans " +
        "l'ordre ; slice(n, \"<…>\") te laisse choisir l'ordre. Ton break devient un terrain de jeu : " +
        "même matière, mille rythmes.",
      code:
        'setcpm(95/4)\n' +
        '// ton break : samples({ break:"/sounds/po33/break.wav" }) puis s("break/4")…\n' +
        '// démo avec un break en ligne (réseau, une fois) :\n' +
        'samples("github:tidalcycles/dirt-samples")\n' +
        '$: s("amen/4").fit().chop(8).cut(1).gain(.9)',
      decode: [
        ['s("amen/4")', "joue un break sur 4 cycles. Remplace amen par TON sample : s(\"break/4\")."],
        ['.fit()', "cale le sample sur la durée des cycles (M6)."],
        ['.chop(8).cut(1)', "8 tranches jouées dans l'ordre ; cut(1) évite qu'elles se chevauchent."],
        ['slice(8,"<…>")', "même découpe, mais TOI tu donnes l'ordre des tranches → nouveau groove."],
      ],
      theory: {
        title: 'chop vs slice',
        items: [
          ['chop(n)', "n tranches, ordre d'origine — texture, grain"],
          ['slice(n,"<…>")', "n tranches, TON ordre — recomposition"],
          ['.fit()', "le sample épouse la durée du cycle"],
          ['.cut(1)', "monophonique : une tranche coupe la précédente"],
        ],
      },
      exercise:
        "Prends ton break PO-33 (ou amen), chop(16), puis essaie slice(8, \"<0 4 2 6 1 5 3 7>\"). " +
        "Tu recomposes ton propre break sans toucher au son lui-même.",
    },
  ],
};

export const m8chapitre2 = {
  module: 8,
  chapter: 'Sync live',
  title: 'Sync audio & duo live',
  subtitle: 'Verrouiller le PO-33 sur Strudel et jouer à deux machines',
  flashs: [
    {
      id: '8.4',
      kicker: 'Verrouiller le tempo',
      title: 'La sync PO-33 : 2 clics par temps',
      concept:
        "Le PO-33 se synchronise sur un signal audio : un train de clics, deux par temps (2 PPQN), " +
        "sur le canal GAUCHE du jack ; le canal DROIT porte la musique. Keymaker peut être le maître " +
        "d'horloge : le bouton ◧ Sync PO-33 envoie ces clics, calés sur le tempo de ton code (setcpm). " +
        "Tu branches, le PO suit — tempo verrouillé, zéro dérive. Règle d'or du câblage : clics à " +
        "gauche → le PO, musique à droite → tes oreilles. Le revers : sur un seul câble, ta " +
        "musique passe en mono (canal droit) — les panoramiques (pan automatique, jux, perlin) sont " +
        "mis en pause le temps du duo. Pour garder la stéréo, il faut une 2e sortie audio.",
      code:
        'setcpm(120/4)\n' +
        '// 1) Active ◧ Sync PO-33 sous le code — les clics partent a GAUCHE.\n' +
        '// 2) Garde ta musique a DROITE pour ne pas polluer la sync :\n' +
        'all(x => x.pan(1))\n' +
        '$: s("bd*4").bank("RolandTR909").gain(.9)\n' +
        '$: note("<c2 eb2 g2>").s("sawtooth").lpf(700).gain(.5)',
      decode: [
        ['2 PPQN', "deux clics par temps — le standard Pocket Operator / Korg. En 4/4 : 8 clics par cycle."],
        ['canal GAUCHE', "le PO écoute la sync à gauche, l'audio à droite. D'où le pan(1)."],
        ['all(x => x.pan(1))', "envoie TOUTES tes pistes à droite (M6) → la gauche reste à la sync seule."],
        ['◧ Sync PO-33', "le générateur de l'app : il lit ton setcpm et clique en rythme."],
        ['mono le temps de la sync', "pan(1) écrase les autres panoramiques : l'image stéréo est aplatie tant que tu synchronises."],
      ],
      theory: {
        title: 'Régler le PO-33 en suiveur',
        items: [
          ['Câble Y', 'GAUCHE → line-in du PO · DROITE → enceintes'],
          ['Mode sync', 'maintiens « record » + tape « bpm » pour cycler'],
          ['SY2', 'le mode où le PO suit une sync externe (notre cas)'],
          ['Niveau', 'reste sous 5 V — la sortie casque suffit'],
        ],
      },
      exercise:
        "Mets setcpm(120/4), active ◧ Sync PO-33, règle ton PO sur SY2, branche le câble Y. Le PO doit " +
        "démarrer avec Strudel. Puis passe à setcpm(128/4) : le PO accélère avec toi, sans dérive.",
    },

    {
      id: '8.5',
      kicker: 'Code + geste',
      title: 'Le duo live : Strudel mène, le PO suit',
      concept:
        "Tout est en place pour jouer à deux machines. Strudel tient le tempo et une couche (une nappe, " +
        "une basse, un kick), pendant que le PO-33 séquence tes samples faits main — verrouillés sur le " +
        "même pouls. Tu codes une transition, tu tournes les potards du PO : c'est du live coding ET du " +
        "hardware, en duo. Strudel cesse d'être une fenêtre de navigateur ; il devient le cerveau de ton setup.",
      code:
        'setcpm(124/4)\n' +
        'all(x => x.pan(1))            // musique a droite, sync a gauche\n' +
        '$: s("bd*4").bank("RolandTR909").gain(.9)\n' +
        '$: s("~ cp ~ cp").bank("RolandTR909").gain(.6)\n' +
        '$: note("<c2 c2 ab1 bb1>").s("sawtooth").lpf(sine.range(400,1200).slow(8)).gain(.5)\n' +
        '// ◧ Sync PO-33 ON · PO en SY2 · a toi de jouer tes samples sur le PO',
      decode: [
        ['Strudel = horloge', "setcpm fixe le tempo ; le PO ne fait que suivre les clics."],
        ['une couche ici, une là', "Strudel tient kick + basse ; le PO joue tes samples — vous vous partagez le morceau."],
        ['lpf(sine.range(…))', "un filtre qui respire (M4/M5) pendant que tu manipules le PO."],
        ['.pan(1)', "indispensable en sync : garde la gauche propre pour le PO."],
      ],
      theory: {
        title: 'Qui fait quoi',
        items: [
          ['Strudel (code)', 'tempo, kick, basse, nappes, transitions'],
          ['PO-33 (mains)', 'tes samples, breaks, variations live'],
          ['Le lien', 'les clics 2 PPQN à gauche — un tempo commun'],
          ['Toi', "tu passes de l'un à l'autre, en rythme"],
        ],
      },
      exercise:
        "Monte ton premier duo : une nappe + un kick dans Strudel (panés à droite), ◧ Sync ON, " +
        "PO réglé sur SY2 jouant tes samples. Tiens 8 mesures à deux machines, puis change le " +
        "setcpm en direct — le PO doit suivre sans décrocher.",
      recap: {
        title: "Module 8 en un coup d'œil",
        items: [
          ['Tes sons', 'enregistre → exporte → /sounds/po33/ → samples()'],
          ['Recomposer', 'chop(n) / slice(n,"<…>") sur tes breaks'],
          ['Sync', '2 PPQN, clics à GAUCHE, PO réglé sur SY2'],
          ['Duo', 'all(x => x.pan(1)) : musique à droite, sync à gauche'],
        ],
      },
      free:
        "Tu tiens le dernier maillon : le code et le geste, ensemble. Pose une nappe dans Strudel, lance " +
        "la sync, prends ton PO et joue par-dessus — deux instruments, un seul tempo. Et rien n'est figé : " +
        "change le setcpm, le PO te suit ; hache un nouveau break, recommence. Ton studio tient désormais " +
        "dans une fenêtre de code et une boîte orange. Amuse-toi, Felix. 🎛️🔊",
    },
  ],
};

/* Le Module 8 entier : 2 chapitres (Tes sons · Sync live). Court par design. */
export const module8 = {
  id: 8,
  titre: 'Module 8 — Hardware & PO-33',
  title: 'Module 8',
  subtitle: 'Le pont entre le code et le geste : sampling perso + sync live du PO-33 KO',
  chapitres: [m8chapitre1, m8chapitre2],
};
