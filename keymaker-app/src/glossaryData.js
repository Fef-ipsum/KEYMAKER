// Keymaker — Chantier 56 (11 juin 2026) : LE GLOSSAIRE, refait à la main.
//
// L'ancien glossaire (Chantier 48) était auto-extrait des `theory.items` de toutes
// les leçons : 425 paires terme→explication aspirées sans filtre. Résultat : plein
// d'entrées incompréhensibles hors contexte (« _piste$ », « A → D », « 1. Enregistrer »,
// « ce qui change », « avantage », « const »…) — des notes internes aux leçons, pas
// du vocabulaire. Felix a demandé un truc CARRÉ. Le voici.
//
// Ce fichier est la SOURCE DE VÉRITÉ du glossaire : ~150 vrais termes, écrits à la
// main, rangés par thème, définitions claires et auto-suffisantes (on comprend SANS
// avoir la leçon sous les yeux), bilingues FR↔EN quand ça aide. Qualité > quantité.
//
// Forme d'une entrée : { term, en?, def, src? }
//   term : le terme affiché (français ou nom de fonction)
//   en   : l'équivalent anglais, en pastille (optionnel)
//   def  : la définition — peut être longue si la clarté l'exige
//   src  : le flash où c'est enseigné, « M1 · 1.4 » (optionnel, pour aller plus loin)
//
// Chaque catégorie : { id, label, icon, hint, entries[] }. Petits blocs thématiques
// = navigation TDA-friendly (Glossary.jsx affiche, filtre, et laisse annoter).

export const CATEGORIES = [
  {
    id: 'rythme',
    label: 'Rythme & mini-notation',
    icon: '\u{1F941}',
    hint: 'Le langage rythmique de Strudel : ce qu’on écrit entre guillemets.',
    entries: [
      { term: 'cycle', en: 'cycle / bar', def: 'Le pouls qui boucle, ≈ une mesure. C’est l’unité de temps de Strudel : toute une séquence est compressée dans UN cycle (par défaut ~2 secondes). Plus tu mets de sons, plus chacun est court.', src: 'M1 · 2.2' },
      { term: 'temps', en: 'beat', def: 'Les pulsations régulières à l’intérieur du cycle — ce qu’on tape du pied.', src: 'M1 · 2.2' },
      { term: 'subdivision', def: 'Découper un temps en morceaux plus petits (croches, doubles-croches). Plus on subdivise, plus ça va vite.', src: 'M1 · 2.2' },
      { term: 'séquence', en: 'sequence', def: 'Plusieurs sons séparés par des espaces, joués l’un après l’autre dans le cycle. Chaque mot est un pas. Ex. sound("bd hh sd hh").', src: 'M1 · 2.1' },
      { term: 'silence', en: 'rest', def: 'Un pas vide : il occupe sa place mais ne joue rien. S’écrit - ou ~ (les deux sont identiques). Le vide fait partie du groove.', src: 'M1 · 2.3' },
      { term: 'sous-séquence [ ]', en: 'sub-sequence', def: 'Des crochets regroupent plusieurs sons dans UN seul pas ; ils s’y partagent la place, donc vont plus vite. On peut imbriquer : [[rim rim] hh].', src: 'M1 · 2.4' },
      { term: '*  (multiplier)', en: 'speed up', def: 'Répète/accélère un élément dans son pas. hh*2 = deux charlestons dans un pas, hh*8 = huit. Poussé très loin (hh*32), le rythme devient une note — le pont secret vers la hauteur.', src: 'M1 · 2.5' },
      { term: '/  (diviser)', en: 'slow down', def: 'Étale un élément sur plusieurs cycles. [bd sd]/2 = la paire s’étire sur 2 cycles (deux fois plus lent).', src: 'M1 · 2.5' },
      { term: 'tempo', en: 'tempo', def: 'La vitesse des cycles, en cycles par minute (cpm). Par défaut 30 cpm dans Strudel.', src: 'M1 · 3.1' },
      { term: 'BPM', en: 'beats per minute', def: 'Battements par minute — le tempo « musical » standard. Strudel raisonne en cpm ; on convertit avec setcpm(BPM / temps_par_mesure).', src: 'M1 · 3.3' },
      { term: 'setcpm()', def: 'Règle le tempo. setcpm(120/4) = 120 BPM en 4/4.', src: 'M1 · 3.3' },
      { term: 'mesure 4/4', en: 'time signature', def: '4 temps par mesure — la signature la plus courante en pop, rock et électro.', src: 'M1 · 3.3' },
      { term: 'struct', def: 'Sépare le RYTHME (quand ça joue) de l’HARMONIE (quoi joue) : un patron de frappes 1/0 appliqué à des notes.', src: 'M3 · 3.15' },
      { term: 'rythme euclidien (k,n)', en: 'euclidean rhythm', def: 'Répartit k coups le plus également possible sur n pas (l’algorithme d’Euclide — oui, le Grec). Presque toutes les claves du monde tiennent dans (k,n).', src: 'M5 · 5.9b' },
      { term: 'tresillo', def: 'Le motif euclidien (3,8) : la cellule rythmique de Cuba, du reggaeton, et de la basse de la moitié de la techno et de la house.', src: 'M5 · 5.9b' },
      { term: 'polymètre', en: 'polymeter', def: 'Des cycles de longueurs différentes superposés à la même vitesse de pas. {a b, c d e} laisse à chacun sa longueur (contrairement à la virgule qui étire tout sur un cycle).', src: 'M7 · 7.23b' },
      { term: 'polyrythmie', en: 'polyrhythm', def: 'Superposer plusieurs rythmes en même temps (un stack de motifs).', src: 'M5 · 5.3' },
    ],
  },

  {
    id: 'solfege',
    label: 'Notes, gammes & solfège',
    icon: '\u{1F3B5}',
    hint: 'Les briques de la mélodie : notes, écarts, gammes, degrés.',
    entries: [
      { term: 'note', def: 'Un son de hauteur précise. Les 12 notes : c c# d d# e f f# g g# a a# b, puis ça reboucle sur c.', src: 'M1 · 4.4' },
      { term: 'nom des notes', en: 'note names', def: 'c = do, d = ré, e = mi, f = fa, g = sol, a = la, b = si. Strudel utilise les lettres anglaises.', src: 'M1 · 4.2' },
      { term: 'demi-ton', en: 'semitone', def: 'Le plus petit écart entre deux notes : une case de guitare, deux touches voisines au piano.', src: 'M1 · 4.4' },
      { term: 'ton', en: 'whole tone', def: 'Deux demi-tons. Deux cases de guitare.', src: 'M2 · 2.3' },
      { term: 'octave', en: 'octave', def: 'L’intervalle entre une note et la même, deux fois plus aiguë (do → do suivant). La fréquence double ; l’oreille les entend « pareilles » (équivalence d’octave).', src: 'M1 · 4.3' },
      { term: 'hauteur', en: 'pitch', def: 'À quel point un son est grave ou aigu.', src: 'M2 · 2.1' },
      { term: 'fréquence', en: 'frequency', def: 'Le nombre de vibrations par seconde (Hz). Doubler la fréquence = monter d’une octave.', src: 'M2 · 2.1' },
      { term: 'enharmonie', en: 'enharmonic', def: 'Deux noms pour la même hauteur : c# (dièse de do) = db (bémol de ré).', src: 'M2 · 2.4' },
      { term: 'gamme chromatique', en: 'chromatic scale', def: 'La suite des 12 demi-tons — toutes les notes sans exception.', src: 'M1 · 4.4' },
      { term: 'gamme', en: 'scale', def: 'Un ensemble de notes choisies qui sonnent bien ensemble. Dans une gamme, n’importe quel degré sonne juste.', src: 'M1 · 4.7' },
      { term: 'gamme majeure', en: 'major scale', def: 'La gamme « joyeuse / ouverte ». Recette en demi-tons depuis la tonique : +0 +2 +4 +5 +7 +9 +11. La même recette depuis n’importe quelle note (transposable).', src: 'M2 · 2.11' },
      { term: 'gamme mineure', en: 'minor scale', def: 'La gamme « grave / intérieure » : 3ᵉ, 6ᵉ et 7ᵉ degrés abaissés d’un demi-ton par rapport au majeur. Le mineur naturel = le mode éolien.', src: 'M2 · 2.13' },
      { term: 'pentatonique', en: 'pentatonic', def: 'Gamme de 5 notes, très utilisée en blues et rock. Aucune fausse note possible.', src: 'M1 · 4.7' },
      { term: 'degré', en: 'scale degree', def: 'La place d’une note dans la gamme, notée I à VII.', src: 'M2 · 2.12' },
      { term: 'tonique (I)', en: 'tonic', def: 'La note « maison », où la mélodie se repose.', src: 'M2 · 2.12' },
      { term: 'dominante (V)', en: 'dominant', def: 'Le 5ᵉ degré, plein de tension qui « appelle » la tonique.', src: 'M2 · 2.12' },
      { term: 'sensible (VII)', en: 'leading tone', def: 'Le 7ᵉ degré, à un demi-ton sous la tonique : il « tire » vers elle.', src: 'M2 · 2.12' },
      { term: 'transposer', en: 'transpose', def: 'Décaler toutes les notes du même intervalle. .transpose(n) en demi-tons, .scaleTranspose(n) en degrés de la gamme.', src: 'M3 · 3.8' },
      { term: 'mode', en: 'mode', def: 'La gamme majeure démarrée sur un autre degré : mêmes notes, autre « centre », autre couleur.', src: 'M2 · 2.14b' },
      { term: 'dorien', en: 'dorian', def: 'Mode mineur + sixte majeure. « So What » de Miles Davis — et beaucoup de house.', src: 'M2 · 2.14b' },
      { term: 'phrygien', en: 'phrygian', def: 'Mode mineur + seconde mineure. Le frisson sombre de la psytrance et du metal.', src: 'M2 · 2.14b' },
      { term: 'éolien', en: 'aeolian', def: 'Le nom « mode » du mineur naturel — tu le connais déjà.', src: 'M2 · 2.14b' },
    ],
  },

  {
    id: 'harmonie',
    label: 'Intervalles, accords & harmonie',
    icon: '\u{1F3B9}',
    hint: 'Comment les notes s’empilent et s’enchaînent.',
    entries: [
      { term: 'intervalle', en: 'interval', def: 'L’écart entre deux hauteurs, mesuré en demi-tons et nommé (seconde, tierce, quinte…).', src: 'M2 · 2.6' },
      { term: 'seconde', en: 'second', def: '1 demi-ton (seconde mineure) ou 2 (seconde majeure = 1 ton).', src: 'M2 · 2.7' },
      { term: 'tierce', en: 'third', def: 'L’intervalle qui colore l’accord. Majeure = 4 demi-tons (lumineux, do–mi), mineure = 3 (grave, do–mib). C’est elle qui décide majeur ou mineur.', src: 'M2 · 2.8' },
      { term: 'quarte juste', en: 'perfect fourth', def: '5 demi-tons (do → fa).', src: 'M2 · 2.7' },
      { term: 'quinte juste', en: 'perfect fifth', def: '7 demi-tons (do → sol). Très consonant (rapport de fréquences 3:2) : c’est la stabilité.', src: 'M2 · 2.9' },
      { term: 'consonance', en: 'consonance', def: 'Des intervalles stables, posés : octave, quinte, quarte, tierces.', src: 'M2 · 2.9' },
      { term: 'dissonance', en: 'dissonance', def: 'Des intervalles tendus qui « veulent bouger » : secondes, septièmes, triton. Toute la musique joue avec la tension ↔ détente.', src: 'M2 · 2.10' },
      { term: 'accord', en: 'chord', def: 'Au moins 3 notes jouées ensemble. c-e-g = accord de do majeur.', src: 'M1 · 4.6' },
      { term: 'triade', en: 'triad', def: 'Accord de 3 notes : fondamentale + tierce + quinte. La logique de presque tous les accords occidentaux (empilement de tierces).', src: 'M2 · 2.16' },
      { term: 'fondamentale', en: 'root', def: 'La note qui donne son nom à l’accord (c → accord de do).', src: 'M2 · 2.16' },
      { term: 'voicing', def: 'La façon d’arranger les notes d’un accord (laquelle en bas, laquelle doublée…). voicing() les choisit pour toi.', src: 'M2 · 2.20' },
      { term: 'voice leading', def: 'Enchaîner les accords avec le moins de saut possible → plus fluide à l’oreille.', src: 'M2 · 2.20' },
      { term: 'cadence', def: 'Un enchaînement d’accords qui crée tension puis repos. V → I = la cadence parfaite (la dominante « appelle » la tonique).', src: 'M2 · 2.19' },
      { term: 'I-IV-V', def: 'Les trois accords majeurs d’une gamme — le squelette du blues et du rock.', src: 'M2 · 2.19' },
      { term: 'I-V-vi-IV', def: 'La grille de centaines de tubes : C-G-Am-F en do majeur.', src: 'M3 · 3.14' },
      { term: 'tonalité', en: 'key', def: 'Le « centre de gravité » d’un morceau : sa gamme et sa tonique. Majeure ou mineure. Basse, accords et mélodie la partagent → cohérence.', src: 'M2 · 2.21' },
      { term: 'armure', en: 'key signature', def: 'Les dièses/bémols affichés en début de portée, valables tout le morceau. Ordre des dièses : fa do sol ré la mi si.', src: 'M2 · 2.22' },
      { term: 'cycle des quintes', en: 'circle of fifths', def: 'Les 12 tonalités disposées en cercle, de quinte en quinte. Les voisines partagent presque les mêmes notes → transitions douces.', src: 'M2 · 2.23' },
      { term: 'relative mineure', en: 'relative minor', def: 'La gamme mineure qui partage l’armure d’une majeure : descends de 3 demi-tons depuis la tonique majeure (C → A).', src: 'M2 · 2.14' },
    ],
  },

  {
    id: 'son',
    label: 'Synthé & son',
    icon: '\u{1F50A}',
    hint: 'Fabriquer un son de zéro : onde, filtre, enveloppe.',
    entries: [
      { term: 'onde', en: 'waveform', def: 'La forme du son ; chaque forme a son timbre. Sans .s(...), une note sonne en triangle.', src: 'M4 · 4.2' },
      { term: 'saw (dent de scie)', en: 'sawtooth', def: 'Onde riche et brillante — le point de départ classique : on part d’un son plein et on ENLÈVE ce qu’on ne veut pas au filtre.', src: 'M4 · 4.6' },
      { term: 'sine (sinusoïde)', en: 'sine', def: 'L’onde la plus pure, sans harmoniques. Sert aussi de signal lent pour piloter un paramètre (automation).', src: 'M4 · 4.9' },
      { term: 'triangle / square', en: 'tri / square', def: 'Triangle = doux ; carré (square) = creux, « jeu vidéo ».', src: 'M4 · 4.2' },
      { term: 'timbre', def: 'Le « caractère » d’un son : ce qui distingue deux sons de même hauteur.', src: 'M4 · 4.2' },
      { term: 'harmonique', en: 'harmonic', def: 'Une fréquence multiple de la fondamentale (×2 = l’octave, ×3 ≈ la quinte…). Un son riche les contient déjà.', src: 'M4 · 4.3' },
      { term: 'bruit', en: 'noise', def: 'Pas de hauteur définie : toutes les fréquences mélangées. Le « hh » de batterie, c’est souvent du bruit filtré.', src: 'M4 · 4.4' },
      { term: 'filtre', en: 'filter', def: 'Enlève une partie des fréquences pour sculpter le son.', src: 'M4 · 4.6' },
      { term: 'passe-bas (lpf)', en: 'low-pass', def: 'Garde le grave, ôte la brillance — le filtre le plus courant.', src: 'M4 · 4.8' },
      { term: 'passe-haut (hpf)', en: 'high-pass', def: 'Garde l’aigu, allège le son (effet « téléphone »).', src: 'M4 · 4.8' },
      { term: 'passe-bande (bpf)', en: 'band-pass', def: 'Ne garde qu’une bande de fréquences (+ bpq pour sa largeur).', src: 'M4 · 4.8' },
      { term: 'coupure', en: 'cutoff', def: 'La fréquence où le filtre agit (de ~20 à 20000 Hz).', src: 'M4 · 4.6' },
      { term: 'résonance', en: 'resonance', def: 'Une bosse de volume pile à la coupure. Haute + balayage = le son « acid » de la TB-303 (attention, ça peut crier — baisse le gain).', src: 'M4 · 4.7' },
      { term: 'enveloppe ADSR', en: 'envelope', def: 'La forme d’un paramètre dans le temps : Attack (montée), Decay (descente), Sustain (NIVEAU tenu, pas un temps !), Release (extinction après le relâché).', src: 'M4 · 4.11' },
      { term: 'enveloppe d’ampli', def: 'ADSR appliqué au VOLUME (attack/decay/sustain/release). Attaque nette + maintien bas = un son qui « plucke ».', src: 'M4 · 4.14' },
      { term: 'enveloppe de filtre (lpenv)', def: 'ADSR appliqué à la COUPURE du filtre : lpa/lpd/lps/lpr + lpenv pour la profondeur (0 = rien, plus = plus spectaculaire).', src: 'M4 · 4.14' },
      { term: 'enveloppe de hauteur (penv)', en: 'pitch envelope', def: 'ADSR appliqué à la HAUTEUR : penv/pattack/pdecay. La recette du kick 808/909 : une note qui pique du nez.', src: 'M7 · 7.6b' },
      { term: 'pluck / stab', def: 'Attaque nette = son percussif, rythmique.', src: 'M4 · 4.12' },
      { term: 'pad / nappe', en: 'pad', def: 'Attaque lente + longue relâche = son d’ambiance tenu, le corps harmonique.', src: 'M4 · 4.12' },
    ],
  },

  {
    id: 'effets',
    label: 'Effets & espace',
    icon: '\u{1F30A}',
    hint: 'Donner de la profondeur, de la couleur, du mouvement.',
    entries: [
      { term: 'réverb', en: 'reverb', def: 'Les milliers de reflets d’un son dans un lieu. room = la quantité (0–1), roomsize / size = la taille de la pièce.', src: 'M4 · 4.16' },
      { term: 'delay / écho', en: 'delay', def: 'Des répétitions du son. delaytime (dt) = l’écart, delayfeedback (dfb) = le nombre de répétitions (reste sous 1 !), delay = la quantité. Calé sur le tempo, il groove.', src: 'M4 · 4.17' },
      { term: 'orbit', def: 'Un canal d’effets globaux (une réverb + un délai partagés). Sépare les orbits pour contrôler chaque ambiance indépendamment.', src: 'M4 · 4.19' },
      { term: 'pan', def: 'Position stéréo, de 0 (gauche) à 1 (droite).', src: 'M4 · 4.23' },
      { term: 'gain', def: 'Le volume. La disto pousse le niveau → compense en baissant le gain.', src: 'M4 · 4.21' },
      { term: 'distorsion (dist)', en: 'distortion', def: 'Écrase le son → grain rock (overdrive).', src: 'M4 · 4.21' },
      { term: 'crush (bitcrush)', def: 'Réduit la résolution → le son « jeu vidéo », sale.', src: 'M4 · 4.21' },
      { term: 'phaser', def: 'Un balayage qui « creuse » le son par moments — Strudel le décrit comme « une pédale de guitare ».', src: 'M4 · 4.22' },
      { term: 'vibrato (vib)', def: 'Une légère oscillation de hauteur — le geste du guitariste qui fait vibrer la corde.', src: 'M4 · 4.22' },
      { term: 'jux', def: 'Effet stéréo : applique une transformation à un seul côté. jux(rev) = la droite joue l’inverse de la gauche.', src: 'M4 · 4.23' },
      { term: 'sidechain / pump', def: 'Le kick « écrase » le volume des autres pistes une fraction de seconde → l’effet de respiration très dansant. En Strudel : un gain piloté par un saw synchronisé au kick.', src: 'M7 · 7.9' },
      { term: 'ordre des effets', en: 'signal chain', def: 'L’ordre est fixe : gain → filtres → disto → pan → phaser → réverb/délai. Un même effet appelé 2× s’écrase (usage unique).', src: 'M4 · 4.24' },
    ],
  },

  {
    id: 'structure',
    label: 'Structure & arrangement',
    icon: '\u{1F3D7}️',
    hint: 'Empiler des pistes et bâtir un morceau entier.',
    entries: [
      { term: 'piste', en: 'track', def: 'Une couche du morceau : batterie, basse, accords, lead… Toutes partagent les mêmes cycles (en parallèle).', src: 'M6 · 6.1' },
      { term: 'stack', def: 'La pile de pistes jouées en même temps (= la virgule « , »).', src: 'M6 · 6.1' },
      { term: '$:', def: 'Préfixe une ligne pour en faire une piste nommée du stack ; _piste$ mute cette piste (= hush sur elle seule).', src: 'M6 · 6.3' },
      { term: 'section', def: 'Un bloc musical (intro, couplet, refrain, pont…).', src: 'M6 · 6.11' },
      { term: 'arrange', def: 'Enchaîne des sections sur une ligne de temps. Si un motif est plus court, il se répète pour remplir.', src: 'M6 · 6.11' },
      { term: 'mask', def: 'Un « pochoir » de 0/1 qui laisse passer ou bloque le son par cycle. Plein de masques alignés = une structure complète, sans DAW.', src: 'M6 · 6.13' },
      { term: 'intro / montée / drop / outro', en: 'build / drop', def: 'L’arc d’un morceau électro : intro (kick seul, le DJ cale), montée/build (on empile, la tension monte), drop (tout entre, plein d’énergie), outro (on retire les couches).', src: 'M7 · 7.4' },
      { term: 'breakdown', def: 'On dégarnit (souvent : plus de kick) avant de relancer.', src: 'M7 · 7.8' },
      { term: 'backbeat', def: 'Clap/snare sur les temps 2 et 4.', src: 'M7 · 7.1' },
      { term: 'offbeat hat', def: 'Le charleston entre les kicks — la signature house.', src: 'M7 · 7.1' },
      { term: 'swing', def: 'Décaler les contretemps → balancement (ni tout droit, ni triolet).', src: 'M7 · 7.2' },
      { term: 'humaniser', en: 'humanize', def: 'Casser la perfection machine (micro-retards late / micro-avances early) pour un feel vivant.', src: 'M7 · 7.2' },
      { term: 'sub bass', def: 'La basse grave qu’on ressent plus qu’on entend.', src: 'M7 · 7.11' },
      { term: 'riser / uplifter', def: 'Un bruit blanc filtré qui monte pour annoncer le retour du drop.', src: 'M7 · 7.18' },
      { term: 'half-time / full-time', def: 'Half-time = le beat paraît moitié moins vite (poids, espace) ; full-time = il suit le tempo réel (énergie). Snare sur le 3 = half-time feel — la signature du D&B moderne.', src: 'M7 · 7.14' },
    ],
  },

  {
    id: 'aleatoire',
    label: 'Aléatoire & génératif',
    icon: '\u{1F3B2}',
    hint: 'Du hasard maîtrisé, reproductible, encadré par des règles.',
    entries: [
      { term: 'déterministe', en: 'deterministic', def: 'Même question → même réponse. Rien n’est stocké, tout est calculé → ton morceau sonnera pareil demain.', src: 'M5 · 5.1' },
      { term: 'graine', en: 'seed', def: 'Le point de départ du générateur pseudo-aléatoire. Même graine = même hasard (reproductible).', src: 'M5 · 5.12' },
      { term: 'rand / irand', def: 'Tire des nombres au hasard (continus / entiers). .range() ou .scale() les rendent utiles (et justes).', src: 'M5 · 5.11' },
      { term: 'segment', def: 'Transforme un signal continu en n événements nets par cycle (le balayage s’entend).', src: 'M5 · 5.11' },
      { term: 'range (a,b)', def: 'Recadre un signal 0→1 vers a→b.', src: 'M5 · 5.11' },
      { term: 'degrade / ?', def: 'Retire des événements au hasard → de la respiration. ? = la moitié retirée.', src: 'M5 · 5.14' },
      { term: 'sometimes / often / rarely', def: 'Applique une transformation une fois sur deux (50 %), souvent (75 %) ou rarement (25 %).', src: 'M5 · 5.14' },
      { term: 'perlin', def: 'Un hasard « lisse » et organique (comme un LFO mou) → des balayages moins mécaniques.', src: 'M7 · 7.19' },
      { term: 'génératif', en: 'generative', def: 'Des règles + du hasard → un résultat toujours un peu différent, mais maîtrisé (gamme, probas).', src: 'M7 · 7.22' },
      { term: 'ribbon (n, len)', def: 'Fige une fenêtre de len cycles à partir du cycle n.', src: 'M5 · 5.12' },
    ],
  },

  {
    id: 'guitare',
    label: 'Guitare',
    icon: '\u{1F3B8}',
    hint: 'Le manche, les cordes, les formes — pont vers le solfège.',
    entries: [
      { term: 'cordes à vide', en: 'open strings', def: 'Les 6 notes de référence, de la grave à l’aiguë : E A D G B E. Ce sont les lettres A–G du solfège, appliquées à ta guitare.', src: 'M3 · 3.2' },
      { term: 'manche & cases', en: 'fretboard', def: 'Repères aux cases 3, 5, 7, 9, et double point à la 12ᵉ (= une octave plus haut). 1 case = 1 demi-ton, 2 cases = 1 ton.', src: 'M3 · 3.4' },
      { term: 'repère « case 5 »', def: 'La case 5 d’une corde donne ≈ la corde suivante à vide (sauf G→B : case 4, l’exception).', src: 'M3 · 3.3' },
      { term: 'capo', def: 'Décaler de N demi-tons vers l’aigu = transposer.', src: 'M3 · 3.8' },
      { term: 'barré', en: 'barre', def: 'L’index couche sur toutes les cordes — un capo « humain » → rend les formes d’accords mobiles sur tout le manche.', src: 'M3 · 3.19' },
      { term: 'power chord', def: 'La forme mobile la plus simple : 2 notes (fondamentale + quinte), pas de tierce → ni majeur ni mineur, neutre et solide. Prend le nom de la note de la corde grave.', src: 'M3 · 3.17' },
      { term: 'palm mute', def: 'La paume étouffe les cordes près du chevalet → son court et serré.', src: 'M3 · 3.18' },
      { term: 'fingerpicking', def: 'Jouer les cordes aux doigts, en motif : le pouce les graves, les doigts les aigus.', src: 'M3 · 3.22' },
    ],
  },

  {
    id: 'code',
    label: 'Fonctions & écosystème Strudel',
    icon: '⌨️',
    hint: 'Les fonctions du code et d’où vient Strudel.',
    entries: [
      { term: 'sound / s', def: 'Joue un échantillon par son nom. sound("bd hh sd").', src: 'M1 · 1.3' },
      { term: 'abréviations batterie', en: 'drum names', def: 'bd = grosse caisse (kick), sd = caisse claire (snare), hh = charleston, oh = charleston ouvert, cp = clap, rim = rimshot, lt/mt/ht = toms, cr/rd = crash/ride.', src: 'M1 · 1.4' },
      { term: ':n  (variante)', def: 'Choisit l’échantillon n d’un son : casio:1. Rien après le nom = :0.', src: 'M1 · 1.5' },
      { term: 'bank()', def: 'Rebranche toute la batterie sur une boîte à rythmes mythique (RolandTR909, TR808, TR707…).', src: 'M1 · 1.5' },
      { term: 'note / n', def: 'Joue des notes : note("c e g"). n() + scale() choisit des degrés dans une gamme (répartis sur les cordes en guitare).', src: 'M1 · 4.x' },
      { term: 'chop(n)', def: 'Découpe un sample en n tranches jouées DANS L’ORDRE (stutter).', src: 'M7 · 7.3' },
      { term: 'slice(n, "<…>")', def: 'Découpe en n tranches rejouées dans TON ordre (remix, shuffle).', src: 'M7 · 7.3' },
      { term: 'fast / slow', def: 'fast(2) = "x*2", slow(2) = "x/2". Accélère / ralentit un motif entier. S’applique APRÈS les autres transformations.', src: 'M5 · 5.6' },
      { term: 'cat / slowcat', def: 'Un élément par cycle (l’alternance). seq / fastcat = tout tient dans un cycle.', src: 'M5 · 5.3' },
      { term: 'layer / superimpose', def: 'Empile des copies transformées par-dessus l’original (épaissir le son). layer agit sur les copies, superimpose ajoute original + copie(s).', src: 'M5 · 5.16' },
      { term: 'hush() / Ctrl + .', def: 'hush() coupe tout le son proprement. Ctrl + . = arrêt d’urgence du moteur (panic), le filet de sécurité.', src: 'M6 · 6.3' },
      { term: 'iter(n)', def: 'Décale le motif d’un cran par cycle → variation automatique (rotation).', src: 'M7 · 7.12' },
      { term: 'MIDI / Web MIDI', def: 'Protocole standard pour piloter synthés et claviers. Web MIDI marche directement dans le navigateur, sans logiciel.', src: 'M5 · 5.24' },
      { term: 'OSC', def: 'Une autre sortie, vers SuperCollider (le moteur de TidalCycles).', src: 'M5 · 5.24' },
      { term: 'Strudel', def: 'Le portage JavaScript de TidalCycles, dans le navigateur (2022+). Tout se calcule en live, en JS.', src: 'M5 · 5.21' },
      { term: 'TidalCycles', def: 'L’ancêtre de Strudel (Haskell, ~2009), né dans la scène algorave.', src: 'M5 · 5.21' },
    ],
  },

  {
    id: 'culture',
    label: 'Genres & culture',
    icon: '\u{1F4BF}',
    hint: 'Les styles cités dans le cours, en une ligne.',
    entries: [
      { term: 'techno', def: '~120–135 BPM, kick 4/4 devant, sec et dominant, minimaliste.', src: 'M7 · 7.6' },
      { term: 'house', def: '4/4 dansant, offbeat hat, groove chaleureux. Souvent en mode dorien.', src: 'M7 · 7.1' },
      { term: 'trance', def: '~138–142 BPM, mélodique, euphorique.', src: 'M7 · 7.16' },
      { term: 'psy-trance', def: '~145+ BPM, plus sombre, basse roulante (rolling bass) sur le contretemps, lead acide.', src: 'M7 · 7.16' },
      { term: 'drum & bass (D&B)', def: '~170 BPM, breakbeats rapides, basse profonde ; bascule en half-time sur le drop.', src: 'M7 · 7.14' },
      { term: 'jungle', def: 'L’ancêtre du D&B, bâti sur des breaks hachés (l’amen).', src: 'M7 · 7.12' },
      { term: 'breakbeat', def: 'Un beat syncopé hérité du funk (pas un 4/4 droit).', src: 'M7 · 7.11' },
      { term: 'amen break', def: 'Le break le plus samplé de l’histoire — l’ADN du D&B et de la jungle.', src: 'M7 · 7.12' },
      { term: 'reese bass', def: 'La basse désaccordée roulante, du nom de Kevin Saunderson (1988).', src: 'M7 · 7.13' },
      { term: 'ambient', def: 'Musique de texture et d’atmosphère (Brian Eno), à écouter ou à habiter.', src: 'M7 · 7.21' },
      { term: 'acid / TB-303', def: 'Le son d’un filtre résonant balayé sur la Roland TB-303 — la signature de l’acid house.', src: 'M4 · 4.7' },
      { term: 'supersaw', def: 'Le son du Roland JP-8000 : plusieurs saws désaccordés empilés, très large.', src: 'M7 · 7.17' },
    ],
  },
];

// Liste à plat { term, en, def, src, cat, catLabel } — pour la recherche globale.
export function flatEntries(cats = CATEGORIES) {
  const out = [];
  for (const c of cats || []) {
    for (const e of c.entries || []) {
      out.push({ ...e, cat: c.id, catLabel: c.label });
    }
  }
  return out;
}

// Clé stable d'un terme (pour annotations) : id de catégorie + terme replié.
export function termKey(catId, term) {
  return catId + ':' + String(term).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function totalTerms(cats = CATEGORIES) {
  return (cats || []).reduce((n, c) => n + ((c.entries && c.entries.length) || 0), 0);
}
