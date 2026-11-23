# Les schémas vivants de Keymaker 2

*Un schéma est un petit instrument : on attrape le dessin, on entend la différence tout de suite, et la ligne de code suit. Conception, catalogue, preuves, mode d'emploi.*

---

## 0. État du chantier — à lire en premier pour reprendre

**Mis à jour le 23 novembre 2026.**

| Vague | Contenu | État |
|---|---|---|
| 1 | Socle (catalogue, son, intégration leçons/wiki, missions, question « à l'oreille », Sati, tests, page de revue) · filtre passe-bas · enveloppe ADSR | **Construite et vérifiée.** Poussée sur la branche `ccr-b6c29ca3-4wolq4` (PR #1). **Pas encore déployée sur le Pi** (voir ci-dessous). |
| 2 | Ondes et harmoniques (les 4 ondes natives), passe-haut / passe-bande, enveloppe de filtre | **Construite et vérifiée.** `pulse` et `supersaw` : pas de schéma (voir §2.4). |
| 3 | Le cycle, le tempo | **Construite et vérifiée.** |
| 4 | Clavier, intervalles, gammes, accords | **Construite et vérifiée** (un seul type, quatre modes). |
| 5 | Signaux, écho, réverbération, sidechain, distorsion | **Signaux : construit et vérifié.** Écho, réverbération, sidechain, distorsion : **pas encore**, voir §2.10. |

**Déploiement.** Cette session de travail tournait dans un conteneur cloud qui n'atteint ni le Pi (Tailscale, réseau local) ni ton laptop. Le code est sur GitHub ; le déploiement se fait depuis le laptop avec `scripts/deploy-pi.sh` (commandes exactes dans le rapport de session et en §9).

**Pour reprendre une vague :**
1. Lire §3 (architecture) et §8 (ajouter un type).
2. `npm run check:schemas` doit passer avant et après.
3. Mettre à jour ce tableau et §6 (faits) dans le même commit que la vague.

---

## 1. Les principes (rappel)

1. **Un petit instrument** : on attrape le dessin lui-même ; les curseurs restent pour la précision, le clavier et les lecteurs d'écran.
2. **Le son réagit tout de suite**, même sur une note tenue.
3. **Le dessin dit la vérité** : calculé à partir de ce qui sonne, jamais « à peu près ».
4. **Le son est celui de Strudel** : même chaîne que superdough, mêmes valeurs par défaut — vérifié par rendu hors temps réel.
5. **La ligne de code suit** ; la valeur qui change brille ; les valeurs sont **arrondies avant d'être jouées**.
6. **Avant / après** : un bouton qu'on maintient.
7. **Deux ou trois missions**, validées toutes seules pendant que ça joue, chacune suivie d'une phrase de compréhension. Rien ne bloque.
8. **« Creuser »** replié : quelques faits, tous prouvés (§6).
9. **Complet au repos** : le dessin est juste avant d'appuyer sur lecture.
10. **TDA** : une chose importante à la fois, pas de chronomètre, rien qui accuse.
11. **Oreilles protégées** : limiteur sur la sortie des schémas, avertissement au-delà de 20 de résonance.
12. **Partout** : téléphone, tablette, PC ; clair et sombre ; cibles ≥ 44 px ; poignées au clavier ; `prefers-reduced-motion`.
13. **Aucune métaphore horlogère.**

---

## 2. Le catalogue

### 2.1 `filtre` — la courbe du filtre et les harmoniques de la note

| | |
|---|---|
| **Ce qu'on voit** | La réponse du filtre (`getFrequencyResponse()` d'un filtre Web Audio réglé comme celui qui joue), de 20 Hz à 20 kHz (log), de −60 à +32 dB. Le **peigne** : pour chaque harmonique de la note en cours, un trait gris jusqu'à son niveau brut (1/n) et un trait doré jusqu'à son niveau après le filtre. |
| **Ce qu'on attrape** | Une poignée posée sur la courbe, à (coupure, résonance en dB). Gauche-droite = coupure, haut-bas = résonance. Toucher n'importe où l'y amène. Clavier : flèches (Maj = grands pas). |
| **Réglages** | Coupure `lpf` 30 Hz → 18 kHz (log), arrondie à l'entier sous 1 000 Hz, à 3 chiffres au-dessus. Résonance `lpq` 0 → 30, entière. Si la déclaration n'écrit pas `lpq`, la résonance vaut 1 (défaut de Strudel) et le code ne l'affiche pas. |
| **Sources** | Ligne de basse `note("c2 c2 eb2 c2 g2 c2 bb1 c2")` · Note répétée `note("c2*8")` · Note tenue `note("c2")` (un cycle = 2 s). Toujours `.sound("sawtooth")`, enveloppe par défaut. |
| **Avant / après** | « Maintiens : sans filtre » : la courbe devient un pointillé à 0 dB, l'or rejoint le gris, la partie filtre du code est barrée. |
| **Missions** | `ferme` (sous 300 Hz) · `ouvre` (au-dessus de 5 000 Hz) · `siffle` (résonance ≥ 15) · `acid` (résonance ≥ 15, coupure de < 400 à > 2 000 Hz) |
| **Genres de filtre** | Passe-bas (`lpf`/`lpq`), passe-haut (`hpf`/`hpq`), passe-bande (`bpf`/`bpq`). La déclaration choisit le genre par ses réglages ; `filtres: [...]` affiche un choix entre plusieurs. En passe-bande, la poignée reste sur le sommet (0 dB) et glisser vers le haut resserre la bande. |
| **Missions (suite)** | `allege` (passe-haut au-dessus de 400 Hz) · `etroit` (passe-bande, `bpq` ≥ 8) |

### 2.2 `adsr` — l'enveloppe de volume

| | |
|---|---|
| **Ce qu'on voit** | La forme du volume, calculée par **la même fonction** que celle qui programme le volume (`adsrPlan`, réplique de `getParamADSR`), troncature comprise. Une zone grise = le temps où la note joue ; l'extinction commence à sa fin. Une **trace dorée** : le volume réel de la dernière note, en temps réel, avec un point qui avance ; la phase en cours (A, D, S, R) s'allume. |
| **Ce qu'on attrape** | Trois poignées : sommet de l'attaque (temps), fin de la retombée (temps et maintien), fin de l'extinction (temps). Toucher ailleurs amène la plus proche. L'échelle du temps est **figée pendant un glissement**. |
| **Réglages** | `attack`, `decay` 0 → 2 s ; `release` 0 → 3 s (échelle au cube) ; `sustain` 0 → 1. Temps arrondis à 0,001 s sous 0,1 s, 0,01 s sous 1 s, 0,1 s au-delà. |
| **Jouer** | **Tenir** (un gros bouton : appuyer = la note, lâcher = l'extinction) · **Motif** `note("c3 e3 g3 e3")`, notes de 0,5 s. Toujours `.sound("sawtooth").lpf(1500)`. Pendant qu'on tient, changer un réglage change la note en cours (en 20 ms). |
| **Exemples** | Sans réglage (défauts de Strudel, aucun réglage d'enveloppe dans le code) · Pincé .005/.2/0/.1 · Orgue .01/.01/1/.05 · Nappe .4/.3/.8/1.2 |
| **Avant / après** | « Tiens : sans réglage » (mode Tenir) ou « Maintiens : sans réglage » (mode Motif) : le son et la forme reviennent aux valeurs par défaut de Strudel. |
| **Missions** | `lente` (attaque ≥ 0,4 s, tenir jusqu'au sommet) · `pince` (maintien 0, tenir plus d'1 s) · `traine` (extinction ≥ 1 s, puis lâcher) |

### 2.3 `onde` — la forme d'une onde et ses harmoniques

| | |
|---|---|
| **Ce qu'on voit** | Deux périodes de l'onde, et ses 16 premières harmoniques en barres (niveau par rapport à la 1ʳᵉ). Le dessin vient des coefficients de la norme Web Audio, **mesurés** sur l'oscillateur réel (§6). |
| **Ce qu'on attrape** | Le dessin de chaque onde (quatre vignettes) ; la hauteur (c2, c3, c4). Changer d'onde change aussi la note en cours. |
| **Code** | `note("c3").sound("sawtooth")` — une note par cycle (2 s), enveloppe par défaut. |
| **Avant / après** | « Maintiens : sinusoïde » : la même note sans harmoniques. |
| **Missions** | `pure`, `creuse`, `brillante` : passer à la sinusoïde, au carré, à la dent de scie **en venant d'une autre onde** (sinon la mission serait gagnée sans geste, ce que le test refuse). |
| **Pas de `pulse` ni de `supersaw`** | Dans le moteur, ce sont des AudioWorklets : `pulse` est une approximation par modulation de fréquence (pas une impulsion idéale), et `supersaw` tire au hasard la phase de chaque voix. Aucun des deux n'a une forme qu'on puisse dessiner à partir du code sans la mesurer sur le son réel. Plutôt qu'un dessin « à peu près », pas de schéma ; à reprendre avec une mesure en direct (analyseur) si besoin. |
| **Niveau des ondes** | Le niveau absolu des ondes intégrées dépend du navigateur (Chrome : carré et dent de scie ×0,848, triangle ×1, mesuré). Le dessin montre la **forme** de chaque onde à sa propre crête, et aucun texte ne compare leurs volumes. |

### 2.4 `enveloppe-filtre` — la coupure qui bouge pendant la note

| | |
|---|---|
| **Ce qu'on voit** | La coupure dans le temps (échelle en octaves), calculée par `envPlan` — la fonction qui programme aussi le filtre de chaque note, réplique de `getParamADSR` en mode exponentiel. Les montées exponentielles y sont des droites. Une ligne pointillée à `lpf`. En dessous, la courbe du filtre : fermée et ouverte au repos, celle de l'instant pendant la lecture. |
| **Ce qu'on attrape** | Trois poignées A, D, R (comme l'ADSR) ; curseurs `lpenv`, `lpf`, `lpq` ; les quatre temps `lpa`, `lpd`, `lps`, `lpr` dans un repli. |
| **Règles du moteur** | Bornes : de `lpf` à `lpf·2^lpenv` (ancre `fanchor` 0 : `setVersionDefaults` existe mais n'est pas appelé dans ce moteur), limitées à 20 000 Hz, inversées si `lpenv` est négatif. Valeurs par défaut .005, .14, 0, .1. |
| **Sources** | Ligne de basse (notes de 0,25 s) · Note tenue (2 s). |
| **Missions** | `balaye` (`lpenv` ≥ 4) · `eveil` (`lpa` ≥ 0,2 s) · `pique` (`lpd` ≤ 0,1, `lps` 0, `lpenv` ≥ 2) |

### 2.5 `cycle` — les événements réels d'un motif

| | |
|---|---|
| **Ce qu'on voit** | Une ligne par cycle (2 ou 4 lignes quand le motif change d'un cycle à l'autre : `< >`, `?`, `\|`, `/`). Chaque son est un bloc, à sa place et avec sa durée, tels que le moteur les produit : `sound(mini(motif))`, **exactement** les événements de la ligne `sound("…")` (vérifié sur 4 cycles). Les sons qui se chevauchent passent dans un couloir en dessous. Pointillés : les quarts du cycle. Une tête de lecture dorée pendant la lecture. |
| **Ce qu'on attrape** | Le motif s'écrit dans un champ (chaque texte lisible joue tout de suite ; un texte illisible le dit, et le dessin garde le dernier lisible). **Toucher un bloc** le remplace par `~` (grâce à la position de chaque son dans le texte, fournie par le moteur). |
| **Son** | Celui de **superdough lui-même** : les événements du motif sont envoyés à `window.superdough` avec 150 ms d'avance, au tempo de l'app (0,5 cycle/s). Sortie : celle de Strudel (le limiteur des schémas n'est pas sur ce chemin ; des sons de batterie à `gain` 0,8 n'en ont pas besoin). |
| **Avant / après** | « Maintiens : motif de départ ». Un bouton « Remettre ». |
| **Missions** | Toutes portent sur **ton** changement (le motif doit différer du départ) : `ajoute`, `silence`, `plus8`, `crochets`, `alterne`, `couches`. |
| **Pas de cadran** | Le cadran sous l'éditeur n'a pas été repris : une ligne par cycle se lit mieux (on compare les cycles l'un sous l'autre) et ne porte aucun vocabulaire horloger. |

### 2.6 `tempo` — setcpm, cycles par minute, BPM

| | |
|---|---|
| **Ce qu'on voit** | 4 secondes de temps réel ; les limites des cycles (pointillés bleus) ; chaque kick et chaque charleston à son instant (événements du motif, au tempo réglé). Une phrase : `setcpm(120/4)` = 30 cycles par minute · 1 cycle = 2 s · 4 temps par cycle → 120 BPM. |
| **Ce qu'on attrape** | La fin du premier cycle : l'étirer ralentit (BPM = 60 × temps ÷ durée du cycle). Curseur BPM, choix 3 ou 4 temps par cycle. |
| **Code** | `setcpm(120/4)` puis `sound("bd*4, hh*8")` (3 temps : `bd*3, hh*6`). |
| **Avant / après** | « Maintiens : sans setcpm » (30 cycles par minute). |
| **Missions** | `lent` (≤ 80 BPM), `rapide` (≥ 140), `trois` (3 temps par cycle). |

### 2.7 `clavier` — notes, intervalles, gammes, accords

| | |
|---|---|
| **Ce qu'on voit** | Deux octaves ; chaque touche blanche porte sa lettre (et son octave sur les do : C3, C4) et son nom en do-ré-mi. Les touches **allumées** sont les notes que le moteur produit pour la ligne de code (vérifié : identiques à la ligne évaluée par l'éditeur). Au-dessus, des arcs : l'écart en demi-tons (gammes : T et ½). |
| **Ce qu'on attrape** | Les touches : chacune joue tout de suite (le piano de Strudel, par superdough). |
| **Modes** | `notes` : la touche s'ajoute à `note("…")` (8 au plus), l'écart avec la précédente s'affiche. `intervalle` : deux notes, jouées l'une, l'autre, puis ensemble (`note("c3 e3 [c3,e3] ~")`), avec le nom de l'écart. `gamme` : `n("0 … 7").scale("C3:major")`, degrés numérotés, toucher une touche change la tonique. `accord` : fondamentale (F), tierce (3), quinte (5), septième (7), plaqué `note("[c3,e3,g3]")` ou en arpège. |
| **Avant / après** | Gamme : « Maintiens : majeure ». Accord : « majeur plaqué ». Intervalle : « une seule note ». Notes : pas d'effet à retirer (un bouton « Recommencer la mélodie »). |
| **Missions** | notes : `octave`, `demiton`, `melodie` · intervalle : `quinte`, `tierce-mineure`, `tierce-majeure` · gamme : `mineure`, `penta`, `tonique` · accord : `mineur`, `septieme`, `arpege`. Toutes demandent un geste. |
| **Écriture** | Touches noires : dièses en mode notes (comme le chapitre 3 : `c#`), bémols ailleurs (`eb`, `bb`, comme les chapitres 4 et 5). Les deux désignent la même touche (vérifié). |
| **Accords et `voicing()`** | Le schéma joue les notes de l'accord empilées en tierces. `chord("D7").voicing()` de Strudel omet la quinte (mesuré : fa♯, do, ré) : c'est un choix de « voicing », pas une erreur ; le test vérifie que chaque note de Strudel appartient bien à l'accord du schéma. |

### 2.8 `signal` — un signal qui bouge un réglage

| | |
|---|---|
| **Ce qu'on voit** | La courbe du signal (`sine`, `tri`, `saw` ou `square` `.range(bas, haut).slow(n)`), sur 4 à 16 cycles, calculée par le moteur ; et en doré, la coupure que **chaque note reçoit vraiment** : la valeur du signal au début de la note, gardée toute la note. On voit (et on entend) que le mouvement se fait par marches. |
| **Code** | `note("c2*8").sound("sawtooth").lpf(sine.range(300, 2000).slow(4))` |
| **Ce qu'on attrape** | Valeur basse, valeur haute, lenteur, forme. Avant / après : « sans mouvement » (la coupure reste à la valeur basse). |
| **Missions** | `lent` (slow ≥ 8), `large` (haute ≥ 8 × basse), `forme` — après un changement. |

### 2.9 Ce qui reste (vague 5)

Pour chacun, la règle reste la même : pas de dessin tant qu'il n'est pas calculé depuis ce qui sonne et vérifié.

- **Écho** (`delay`, `delaytime`, `delayfeedback`, `delaysync`) : les répétitions sont produites par le nœud de retard de l'orbite (`Orbit.getDelay` → `createFeedbackDelay`). À faire : mesurer, sur un rendu superdough d'une note courte, le niveau de chaque répétition (hypothèse à vérifier : la première vaut `delay`, chacune suivante × `delayfeedback`, plafonné à 0,98) et le dessiner sur une ligne de temps.
- **Réverbération** (`room`, `size`) : la queue est générée par `reverbGen` (bruit filtré, durée liée à `roomsize`, `roomfade`, `roomlp`). À faire : mesurer l'enveloppe de la réponse impulsionnelle pour plusieurs `size` et dessiner la traîne mesurée.
- **Sidechain** (`duck`, `orbit`) : `Orbit.duck(t, onset, attack, depth)` programme le volume de l'orbite visée. À faire : relire la fonction, rendre basse + kick hors temps réel et dessiner le volume mesuré de la basse sur un cycle.
- **Distorsion** (`distort`, `crush`, `clip`) : `getDistortion` construit une courbe de `WaveShaper`, `crush` et `coarse` sont des AudioWorklets. À faire : passer une sinusoïde dans la même chaîne (rendu hors temps réel) et dessiner l'onde avant / après mesurée.

### 2.10 Où ils vivent

| Lieu | Schéma | Missions |
|---|---|---|
| Étape `f.filtre` | filtre, `lpf(400)`, note répétée, seule la coupure se règle | ferme, ouvre |
| Étape `f.resonance` | filtre, `lpf(600).lpq(0)`, ligne de basse | ferme, siffle, acid |
| Étape `f.enveloppe` | adsr, `attack(.01).release(.1)`, Tenir | lente, traine |
| Étape `f.pluck` | adsr, sans réglage, Tenir | pince, lente, traine |
| Wiki `fx.lpf` · `fx.lpq` | filtre | ferme, ouvre · siffle, acid |
| Wiki `fx.attack` · `fx.decay` · `fx.sustain` · `fx.release` · `fx.adsr` · `sol.enveloppe` | adsr | une mission chacun (toutes pour `fx.adsr`, `sol.enveloppe`) |
| Point d'étape du chapitre 6 | `oreille.filtre-coupure`, `oreille.adsr-pince` | — |
| Étape `f.ondes` | onde, dent de scie | pure, creuse, brillante |
| Wiki `son.ondes` · `sol.timbre` | onde | toutes · pure, brillante |
| Wiki `fx.hpf` · `fx.bpf` | filtre passe-haut (choix bas/haut) · passe-bande (choix des trois) | allege · etroit |
| Wiki `fx.lpenv` | enveloppe-filtre, `lpf(300).lpq(8).lpenv(2)` | balaye, eveil, pique |
| Étapes `f.cycle`, `f.silence`, `f.etoile`, `f.crochets`, `f.chevrons`, `f.virgule`, `f.durees`, `f.euclide`, `f.hasard` | cycle, avec le motif de l'étape | une mission liée au signe de l'étape (aucune pour `@`, `( , )`, `?`) |
| Étape `f.groove` · wiki `sol.tempo`, `fn.setcpm` | tempo, 120 BPM | lent, rapide · toutes |
| Wiki `mini.*` (12 signes), `sol.cycle`, `sol.temps`, `sol.mesure`, `sol.croche`, `sol.contretemps` | cycle, motif de l'entrée | au plus une |
| Wiki `fn.signaux` · `fn.range` | signal | toutes · large |
| Étapes `f.do-re-mi`, `f.octave`, `f.demi-ton`, `f.melodie` · `f.gamme`, `f.majeur-mineur`, `f.tonique`, `f.pentatonique` · `f.intervalle`, `f.tierce`, `f.accord`, `f.arpege` | clavier (notes · gamme · intervalle · accord) | celle de la notion |
| Wiki `sol.hauteur`, `sol.noms-des-notes`, `sol.octave`, `sol.demi-ton`, `sol.ton`, `sol.diese-bemol`, `sol.intervalle`, `sol.tierce`, `sol.quinte`, `sol.gamme`, `sol.majeur`, `sol.mineur`, `sol.pentatonique`, `sol.degre`, `sol.tonique`, `fn.scale`, `sol.accord`, `sol.arpege` | clavier | 0 à 2 |
| Page de revue `#/schemas` | tout, d'un coup | — |

---

## 3. Architecture

```
src/schemas/
  catalog.js            le catalogue : validation, état de départ, comparaison « à l'oreille »,
                        description pour Sati (générée), blocs ```schema
  core/format.js        arrondis (ce qui est joué) et affichage français
  core/adsr.js          réplique de getADSRValues / getParamADSR : UNE fonction pour le son et le dessin
  core/synth.js         une note construite comme superdough ; freezeAt (couper une rampe sans clic)
  core/missions.js      les missions (pures)
  core/audio.js         contexte audio du moteur, sortie protégée, un son à la fois, iPhone
  core/visible.js       ce qui est à l'écran (pour Sati)
  types/filtre.js       données du type : réglages, code, missions, faits, tolérances
  types/adsr.js
  ui/sounds.js          le son des schémas (navigateur) — utilisé aussi par le banc de test
  ui/response.js        réponse d'un filtre (getFrequencyResponse) — le dessin du filtre
  ui/useSchema.js       état commun : arrondis, son, missions, Sati
  ui/parts.jsx          curseurs, ligne de code, avant/après, missions, « Creuser »
  ui/FiltreSchema.jsx · ui/AdsrSchema.jsx
  ui/Schema.jsx         <Schema spec>, <EarQuestion>
src/views/SchemaReview.jsx   la page de revue (#/schemas)
scripts/check-schemas.mjs    les vérifications ; scripts/schemas-bench.js (côté navigateur)
```

**Les données ne contiennent pas de code d'interface.** Une étape, une entrée du wiki ou Sati *déclarent* un schéma ; le type (fait à la main) fait le reste.

```js
schema: { type: 'filtre', reglages: { lpf: 600, lpq: 0 }, source: 'basse', missions: ['ferme', 'siffle'] }
```

### 3.1 Le son

- **Une note = une note de superdough** (relu dans `public/vendor/strudel-repl/index.js`, fonctions `registerSynthSounds`, `superdough`, `createFilter`) : `OscillatorNode` → gain 0,3 → gain d'enveloppe linéaire → gain 0,8 (`gain` par défaut) → filtre → sortie. L'onde s'arrête à fin + extinction + 0,01 s.
- **Chaque note a son propre filtre**, comme dans superdough, rangé à fin + extinction par le même genre de minuteur (`webAudioTimeout`). *Pourquoi pas un filtre partagé ?* La première version en partageait un : avec une forte résonance (`lpf(138).lpq(27)`), il continuait de sonner d'une note à l'autre et le schéma sonnait **26 % plus fort** que Strudel à chaque changement de note (mesuré). Différence voulue avec Strudel : quand on bouge un réglage, les notes **en cours** le suivent aussi (lissage d'environ 12 ms).
- **Couper une rampe en cours** (lâcher une note pendant l'attaque) : `cancelScheduledValues` laisse, dans Chrome, **un échantillon** à l'ancienne valeur — un clic (mesuré : saut de 0,486). `freezeAt` utilise `cancelAndHoldAtTime` quand le navigateur le connaît (saut mesuré : 0,00004).
- **Un seul contexte audio** : celui du moteur (`getAudioContext`, exporté par le moteur embarqué).
- **Un son à la fois** (`core/audio.js`) : un schéma qui joue arrête l'éditeur et l'exemple en écoute ; un code qui se met à jouer arrête les schémas ; deux schémas ne jouent jamais ensemble.
- **Sortie protégée** : compresseur en limiteur (seuil −10 dB, rapport 20, attaque 2 ms) puis écrêtage doux (tanh). C'est le seul écart volontaire avec le son de Strudel, et il n'agit que sur les sons forts.
- **iPhone** : `navigator.audioSession.type = 'playback'` si disponible, sinon un son silencieux d'un échantillon joué pendant le premier geste.

### 3.2 La ligne de code

Chaque type fournit `code(état)` (des morceaux, dont ceux qui brillent) et `expect(état)` (les valeurs que Strudel doit produire en l'évaluant). Les réglages sont arrondis **avant** d'être joués : le code affiché est exactement ce qu'on entend. Le test 3 évalue ces lignes dans Strudel.

### 3.3 Sati

- **Elle voit** : chaque schéma monté s'inscrit (`core/visible.js`) ; son type, ses réglages, son code et « joue / à l'arrêt » entrent dans `<contexte_app>`.
- **Elle montre** : un bloc ` ```schema ` contenant un objet JSON est validé par `parseSchemaBlock` ; valide → schéma vivant dans la conversation ; invalide (type inconnu, réglage hors limites, JSON cassé) → reste du texte.
- **Elle lance des défis** : `"defi": { "cible": {…}, "regler": [...] }` → une question « retrouve le réglage » ; la vérification est locale (`earCompare`).
- **Elle ne crée pas de types.** La description qu'elle reçoit (`describeCatalog()`, ~1 300 caractères) est générée depuis le code des types. Aucun changement du backend n'a été nécessaire : tout passe par le contexte, que le serveur transmet tel quel (plafond 8 000 caractères, vérifié dans `modules/keymaker/src/routes/sati.ts`).

---

## 4. Place dans la pédagogie

- **Leçons** : le schéma apparaît dans « Ce que tu entends », **avant le texte qui nomme la notion** (« Joue avec avant de lire »). Aucun bouton du schéma n'écrit dans l'éditeur : l'exercice « À toi » reste à faire dans le code. Le schéma fait comprendre la notion ; le code fait apprendre la syntaxe.
- **Wiki** : le schéma est dans « L'essentiel ».
- **Points d'étape et révisions** : la question **« retrouve le réglage à l'oreille »**. Le son mystère joue ; on règle le schéma (seulement les réglages demandés) ; « Je l'entends pareil » compare avec une tolérance (fréquence : ±½ octave ; résonance : ±4 ; temps : ×2 ou un petit écart absolu ; maintien : ±0,2). Après la réponse : la courbe du son mystère apparaît en pointillé, et on peut continuer à comparer. Chaque question a un **identifiant stable** (`oreille.…`), qui devient une carte de révision comme les autres.
- **Un point d'étape** = jusqu'à 6 questions d'étapes + jusqu'à 2 questions à l'oreille. *Écart avec « 4 à 6 questions » : le chapitre 6 en a 8. Les deux questions à l'oreille sont celles qui entraînent l'oreille ; les retirer reviendrait à ne tester que l'œil.*

---

## 5. Exactitude : ce qui est vérifié, et comment

`npm run check:schemas` (aussi dans `npm run check`). Résultat du 23 novembre 2026 : **voir §7**.

| # | Vérification | Méthode |
|---|---|---|
| A | Déclarations, missions, questions, Sati | Hors navigateur : chaque schéma déclaré est valide ; aucune mission n'est gagnée sans geste ; chaque mission est atteignable par un parcours scripté (valeurs passées par les arrondis) ; chaque question à l'oreille échoue au départ et réussit à la cible ; 10 blocs de Sati (valides et invalides) ; le catalogue envoyé à Sati nomme tous les types et toutes les missions. |
| 1 | Le dessin = l'objet audio | Filtre : courbe dessinée vs `getFrequencyResponse` du filtre d'une note qui joue, après un changement de réglage. Enveloppe : forme dessinée vs volume rendu hors temps réel vs `getParamADSR` **du moteur lui-même**, y compris notes tenues lâchées en attaque, retombée et maintien, et réglage changé pendant qu'on tient. |
| 2 | Le son = Strudel | Rendu hors temps réel du **même code** par superdough et par le schéma ; comparaison échantillon par échantillon, enveloppe (RMS 10 ms) et spectre. Toutes les déclarations du contenu + 10 états tirés au hasard. |
| 3 | La ligne de code s'exécute et produit les valeurs attendues | Chaque ligne évaluée par Strudel : notes, `cutoff`, `resonance` (absente quand elle doit l'être), `attack`… comparées à `expect`. Contenu + 50 états au hasard. |
| 4 | Missions atteignables | Parcours scripté (partie A) ; plus, dans `npm run smoke`, un vrai glissement sur le dessin qui valide une mission. |
| 5 | Faits du « Creuser » | Chacun mesuré dans le navigateur (§6) et noté ici. Un fait sans mesure fait échouer le test. |

### 5.1 Deux limites rencontrées, et la meilleure comparaison suivante

- **Superdough range ses notes de façon asynchrone.** Il déconnecte la chaîne d'une note sur un événement `onended` (`webAudioTimeout`). Juste après la fin d'une note, le rendu varie donc **d'une fois à l'autre** : deux rendus superdough du même code `lpf(138).lpq(27)` diffèrent de 0,25 dans ces zones, et de 0,00002 ailleurs (mesuré). La comparaison est donc exacte partout **sauf** dans les 80 ms qui suivent la fin + extinction de chaque note ; l'écart dans ces zones est rapporté à part, pour information. Il n'est audible qu'avec une résonance extrême sur des fréquences très basses.
- **Combien de temps mettre à part ?** Au moins 80 ms ; davantage quand un filtre résonne : 7 constantes de temps τ = Q / (π·f), avec Q = 10^(lpq/20) (une baisse de 60 dB). Pour `lpf(138).lpq(27)`, cela fait 0,36 s. Mesuré : superdough contre lui-même, hors de ces zones, diffère de 1,8·10⁻⁵ ; dedans, de 0,22.
- **La réserve de nœuds de superdough est commune à tous les contextes audio** (`getNodeFromPool`, non exportée). Un deuxième `OfflineAudioContext` reçoit des nœuds du premier et plante (« cannot connect to an AudioNode belonging to a different audio context »). `renderPatternAudio` n'est pas concerné parce qu'il ne sert qu'une fois. Le banc fait donc **tous** ses rendus superdough dans un seul contexte, chacun à son propre moment, séparés par 5,5 s de silence. Et il évalue le code **sans démarrer la lecture** (`repl.evaluate(code, false)`) : sinon quelques notes partent dans le contexte de la page et leurs nœuds recyclés fuient dans le rendu.

---

## 6. Faits vérifiés et leurs preuves

Chaque fait affiché dans un « Creuser » a son identifiant, sa preuve dans le code du moteur embarqué (Strudel 1.3.0) et une mesure automatique (`scripts/schemas-bench.js`, objet `FACTS`). Mesures du 23 novembre 2026, Chromium sans interface, 44 100 Hz.

### Filtre

- **`filtre.q-db`** — À la coupure, le gain vaut exactement `lpq` dB. *Code* : `createFilter` règle `Q` = `resonance`. *Mesure* : `getFrequencyResponse` à 600 Hz : lpq 0, 1, 6, 12, 15, 20, 30 → 0,0000 ; 1,0000 ; 6,0000 ; 12,0000 ; 15,0000 ; 20,0000 ; 30,0000 dB.
- **`filtre.pente`** — Au moins 12 dB par octave au-dessus de la coupure. *Mesure* : entre 2 et 8 fois la coupure, pour 300, 600 et 1 000 Hz : −12,94 ; −12,41 ; −13,04 ; −12,81 ; −13,27 ; −13,84 dB par octave. *Correction de l'annexe B* : elle disait « environ −12,5 dB entre la 2ᵉ et la 3ᵉ octave » ; la valeur dépend de la coupure, d'où la formulation « au moins 12 ».
- **`filtre.q-defaut`** — Sans `.lpq()` (ou `.hpq()`, `.bpq()`), la résonance vaut 1. *Code* : `createFilter(…){ let { q: tn = 1 } }`, commun aux trois filtres. *Mesure* : rendus superdough, sans vs avec la valeur 1 : `lpf` 3,6·10⁻⁶, `hpf` 5,3·10⁻⁵, `bpf` 5,4·10⁻⁶ (bruit de calcul) ; `lpf` sans vs `lpq(0)` : 0,0202.
- **`filtre.hpq-db`** — À la coupure, un passe-haut ajoute exactement `hpq` dB. *Mesure* : hpq 0, 1, 6, 12, 20, 30 → 0,0000 ; 1,0000 ; 6,0000 ; 12,0000 ; 20,0000 ; 30,0000 dB.
- **`filtre.bpf-centre`** — Un passe-bande laisse passer son centre à 0 dB ; `bpq` plus grand = bande plus étroite. *Mesure* (centre 800 Hz) : bpq 1, 3, 8, 20 → centre 0,000 dB à chaque fois ; largeur à −3 dB 1,38 ; 0,47 ; 0,17 ; 0,06 octave.
- **`filtre.scie`** — Une dent de scie contient toutes les harmoniques, la n-ième n fois plus faible. *Mesure* : `OscillatorNode` sawtooth de période entière (675 échantillons), amplitude × n / amplitude de la 1ʳᵉ, n = 2 à 128 : 1,000 partout (0,999 pour n = 128). C'est aussi ce qui garantit que les traits gris du peigne disent vrai.
- **`filtre.raccourci`** — `lpf("800:12")` règle coupure et résonance. *Mesure* : `queryArc` → `cutoff: 800, resonance: 12`.
- **`filtre.24db`** — `.ftype("24db")` met deux filtres à la suite. *Code* : `superdough` crée un second `createFilter` quand `ftype` vaut `24db`. *Mesure* : atténuation à ~2,1 kHz d'une basse `lpf(500)` : 24,9 dB → 49,7 dB (rapport 2,00).

### Ondes

Mesures sur un `OscillatorNode` de période entière (675 échantillons), sur 60 périodes exactes. Le test compare aussi la forme dessinée à l'onde rendue, à un facteur d'échelle près (§2.3) : écart max hors des sauts verticaux 4·10⁻⁶ (sinusoïde), 3·10⁻⁴ (triangle), 1,8·10⁻² (carré), 1,3·10⁻² (dent de scie) ; tout près des sauts, une poignée d'échantillons diffèrent de 0,12 (le nombre d'harmoniques que garde l'oscillateur).

- **`onde.sinus`** — Une seule harmonique. *Mesure* : harmoniques 2 à 16 au plus 10⁻⁶ de la première.
- **`onde.carre`** — Impaires seulement, la n-ième n fois plus faible. *Mesure* : paires ≤ 1,2·10⁻⁶ ; impaires, niveau × n = 1,000 (n = 1 à 15).
- **`onde.triangle`** — Impaires seulement, n² fois plus faibles. *Mesure* : paires ≤ 1,2·10⁻⁶ ; impaires, niveau × n² = 1,000.
- **`onde.scie`** — Toutes, n fois plus faibles. *Mesure* : niveau × n = 1,000 pour n = 1 à 16.

### Enveloppe de filtre

- **`fenv.octaves`** — `lpenv(n)` : jusqu'à 2ⁿ fois la coupure ; négatif, inversée. *Code* : `createFilter` (bornes `2^-ns·R` et `2^(qn-ns)·R`, échange si négatif). *Mesure* : lpf 400 → lpenv 1 : 400 à 800 Hz ; 2 : 400 à 1 600 ; 4 : 400 à 6 400 ; −2 : de 1 600 à 400 Hz. Courbe = `getParamADSR` exponentiel du moteur (écart relatif 0).
- **`fenv.defauts`** — Valeurs .005, .14, 0, .1. *Code* : `getADSRValues(…, "exponential", [.005, .14, 0, .1])`. *Mesure* : rendu superdough de `lpf(300).lpenv(3)` = rendu du schéma avec ces valeurs (écart 1,3·10⁻⁶).
- **`fenv.exponentielle`** — Courbes exponentielles. *Mesure* : à mi-attaque d'une montée de 200 à 6 400 Hz, la coupure vaut 1 131,4 Hz, la moyenne géométrique (une montée linéaire donnerait 3 300 Hz).
- **`fenv.un-seul`** — `lpa(…)` seul active l'enveloppe avec `lpenv` = 1. *Code* : `z = nanFallback(z, 1, true)`. *Mesure* : `lpf(300).lpa(.1)` vs `lpf(300).lpa(.1).lpenv(1)` : écart 2,7·10⁻⁶.

### Enveloppe

- **`adsr.defauts`** — Sans réglage : .001, .05, .6, .01. *Code* : `registerSynthSounds` → `getADSRValues([…], 'linear', [.001, .05, .6, .01])`. *Mesure* : rendu superdough de `note("c3 e3 g3 e3").sound("sawtooth").lpf(1500)` = rendu du schéma avec ces valeurs (écart max 1,5·10⁻⁶).
- **`adsr.un-seul`** — Un seul réglage écrit change les autres. *Code* : `getADSRValues`. *Mesure* : les 16 combinaisons écrit / pas écrit, comparées à `getADSRValues` du moteur : 0 différence. Ex. `attack` seul → [a, .001, 1, .01] ; `decay` seul → [.001, d, .001, .01].
- **`adsr.lineaire`** — Montées et descentes en lignes droites. *Code* : `getParamADSR(…, 'linear')` pour ces ondes. *Mesure* : à mi-attaque (0,2 s sur 0,4 s), le volume vaut 0,5000.
- **`adsr.troncature`** — Note plus courte que l'attaque : sommet jamais atteint ; extinction depuis le niveau atteint. *Mesure* : attaque 0,5 s, note de 0,2 s → sommet 0,400 ; écart avec `getParamADSR` : 0.
- **`adsr.raccourci`** — `.adsr(".01:.2:.5:.3")` règle les quatre. *Mesure* : `queryArc` → `attack .01, decay .2, sustain .5, release .3`.

### Rythme

Le banc compare d'abord, pour 29 motifs (ceux du contenu et des motifs difficiles : `< >`, `?`, `(5,8,2)`, `.`, `!`, `_`, `@`), les événements du schéma à ceux de `sound("…")` évalué par Strudel, sur 4 cycles : identiques. Le métronome des schémas est testé avec une horloge simulée : chaque quart de cycle joué une fois, écarts réguliers, tempo doublé en route sans trou ni doublon. Les missions du cycle sont rejouées sur les vrais événements, et refusées si le motif n'a pas changé.

- **`cycle.duree`** — 2 s par cycle sans `setcpm`. *Code* : règle de l'app (`src/lib/engine.js` : sans `setcpm`/`setcps`, `setCps(0.5)`), vérifiée présente ; et `npm run smoke` mesure cps = 0,5. *Mesure* : avec 5 sons, le dernier finit à 1 cycle = 2 s.
- **`cycle.partage`** — Parts égales. *Mesure* : 4 sons → 0,25 cycle chacun ; 5 sons → 0,2.
- **`cycle.crochets`** — *Mesure* : dans `bd [hh hh] sd hh`, les deux `hh` du groupe à 0,25 et 0,375, durée 0,125 chacun.
- **`cycle.chevrons`** — *Mesure* : dernier son des cycles 1 à 4 de `bd hh sd <hh oh>` : hh, oh, hh, oh.
- **`cycle.virgule`** — *Mesure* : `bd*4, hh*8` → 4 `bd` et 8 `hh` dans le cycle 1.
- **`cycle.silence`** — *Mesure* : `bd ~ sd ~` → bd à 0, sd à 0,5 ; mêmes places que dans `bd hh sd hh`.
- **`tempo.cpm`** — *Mesure* : `setcpm(30)` → le moteur règle 0,5 cycle par seconde (un cycle toutes les 2 s).
- **`tempo.bpm`** — *Mesure* : `setcpm(120/4)` + `bd*4` → 0,5 cycle/s × 4 × 60 = 120 par minute ; `setcpm(87/3)` → 0,4833 cycle/s ; `setcpm(174/4)` → 0,725.
- **`tempo.defaut`** — *Mesure* : moteur seul, `setcpm(90)` puis un code sans `setcpm` : 1,5 cycle/s, le tempo reste (comme strudel.cc) ; la règle de l'app qui remet 0,5 est présente dans `src/lib/engine.js`.

### Notes et harmonie

Le banc compare d'abord, pour 34 claviers (contenu + cas difficiles : `Eb4:minor`, `Bb^7` en arpège, `f#3 → c4`), les touches allumées aux notes de la ligne de code évaluée par l'éditeur, sur 2 cycles : identiques.

- **`clavier.octave`** — *Mesure* : `noteToMidi` : c3 = 48, c4 = 60 ; `midiToFreq(60) / midiToFreq(48)` = 2 exactement.
- **`clavier.sans-chiffre`** — *Mesure* : `noteToMidi("c")` = 48 = `noteToMidi("c3")`.
- **`clavier.demi-ton`** — *Mesure* : c#3 = db3 = 49 ; f#3 = gb3 = 54 ; a#3 = bb3 = 58 ; e3 → f3 : 1.
- **`intervalle.noms`** — *Mesure* : `note("c3").transpose(…)` du moteur : 3m → 3 demi-tons, 3M → 4, 5P → 7, 8P → 12 ; les 13 noms affichés (unisson à octave) vérifiés de la même façon.
- **`gamme.majeure`** — *Mesure* : `n("0 … 7").scale("C:major")` → écarts 2 2 1 2 2 2 1.
- **`gamme.mineure`** — *Mesure* : `A:minor` → 2 1 2 2 1 2 2.
- **`gamme.penta`** — *Mesure* : `A:minor:pentatonic` → 5 notes par octave, écarts 3 2 2 3 2… ; `C:major:pentatonic` → 5 notes, écarts 2 2 3 2 3… ; aucun demi-ton.
- **`accord.majeur-mineur`** — *Mesure* : `chord("C").voicing()` → classes 0, 4, 7 ; `"Cm"` → 0, 3, 7 ; 12 accords (do, ré, la × 4 qualités) comparés au moteur.
- **`accord.septieme`** — *Mesure* : `"C7"` → 0, 4, 7, 10 ; `"C^7"` → 0, 4, 7, 11 ; `"Cmaj7"` → rien ne joue (déjà noté dans NOTES_FABLE).

### Signaux

Le banc compare, pour 5 signaux (dont `saw` de 80 à 9 000 Hz, `square`, `tri` inversé de 2 000 à 200 Hz sur 16 cycles), les coupures des 64 notes de 8 cycles : schéma = ligne de code évaluée par Strudel = valeur du signal au début de chaque note (écarts 0).

- **`signal.echantillon`** — *Mesure* : `lpf(sine.range(300, 2000).slow(4))` sur `note("c2*8")` : 64 notes, chacune avec la valeur du signal à son début, une seule valeur par note.
- **`signal.range`** — *Mesure* : `sine.range(300, 2000)` va de 300,00 à 2 000,00 ; `sine` seul de 0,0000 à 1,0000.
- **`signal.slow`** — *Mesure* : avec `slow(4)`, la valeur à 0,25 cycle se retrouve à 4,25 (période 4) mais pas à 1,25 ; sans `slow`, 0,25 et 1,25 donnent la même (période 1).

### Annexe B, revérifiée

| Fait de l'annexe B | Résultat |
|---|---|
| `lpf` = `BiquadFilterNode` `lowpass`, `frequency` = coupure, `Q` = `lpq` ; Q = 1 si absent | Confirmé (code + `filtre.q-defaut`) |
| `ftype('24db')` = deux filtres ; `ladder` = AudioWorklet | Deux filtres : confirmé (`filtre.24db`). `ladder` : vu dans le code (`getWorklet(…, 'ladder-processor')`), non mesuré. |
| Gain à la coupure = `lpq` dB | Confirmé (`filtre.q-db`) |
| Pente « environ −12,5 dB entre la 2ᵉ et la 3ᵉ octave » | **Nuancé** : de −12,4 à −13,8 dB selon la coupure (`filtre.pente`) |
| `getFrequencyResponse` tient compte tout de suite d'une valeur posée avec `.value` | Confirmé (le dessin s'appuie dessus ; test 1) |
| `lpf("coupure:résonance:lpenv")` | Coupure et résonance : confirmé (`filtre.raccourci`). `lpenv` : non utilisé ici (vague 2). |
| Ondes natives, gain 0,3, enveloppe linéaire | Confirmé (code `registerSynthSounds` ; test 2 sample à sample) |
| Défauts .001/.05/.6/.01, règles quand un seul est écrit, planchers | Confirmé (`adsr.defauts`, `adsr.un-seul`) |
| `getParamADSR` : formes, troncature, extinction depuis le niveau atteint | Confirmé, y compris note lâchée en attaque, retombée, maintien (test 1, écarts < 10⁻⁶) |
| L'onde s'arrête à fin + extinction + 0,01 s | Vu dans le code (`vn = bn + I + .01`) ; reproduit ; non affiché dans l'app |
| `getAudioContext`, `setAudioContext`, `renderPatternAudio` exportés | Confirmé (tous présents sur `window`) |
| `c2` = MIDI 36 ; 0,5 cycle par seconde sans `setcpm` | Confirmé (test 3 : notes MIDI ; règle de l'app) |

---

## 7. Derniers résultats

Voir le rapport de session et `scripts/out/schemas-report.json` (régénéré à chaque `npm run check:schemas`). Au 23 novembre 2026 : toutes les vérifications passent ; sons identiques à Strudel à moins de 3,4·10⁻⁶ près hors zones de rangement (≈ 10⁻⁵ de la crête).

---

## 8. Ajouter un schéma

### 8.1 À une leçon ou au wiki (données seulement)

Ajouter un champ `schema` à l'étape (`src/content/fondations/chN.js`) ou à l'entrée (`src/content/wiki/*.js`) :

```js
schema: { type: 'adsr', reglages: { attack: 0.4 }, mode: 'tenir', missions: ['lente'] },
```

- `reglages` : avec les noms du code (`lpf`, `lpq`, `attack`…). Absents = valeurs de Strudel.
- `regler` (facultatif) : la liste des réglages modifiables ; les autres sont figés.
- `missions` (facultatif) : parmi celles du type ; sinon celles par défaut.
- Puis `npm run check:schemas` : il refuse une déclaration invalide **et** une mission gagnée sans geste.

### 8.2 Une question « à l'oreille »

Dans le chapitre, tableau `ear` :

```js
{ type: 'oreille', id: 'oreille.mon-sujet', step: 'f.mon-etape',
  q: 'Retrouve …', schema: { type: 'filtre', reglages: { lpf: 3000, lpq: 0 } },
  cible: { lpf: 400 }, regler: ['lpf'], explain: 'Le son mystère était …' }
```

**Ne jamais renommer un `id`** : c'est la carte de révision.

### 8.3 Un nouveau TYPE (code, fait à la main)

1. `src/schemas/types/<type>.js` : `params` (bornes, échelle, arrondi `q`, affichage), `options`, `fromSpec`/`toSpec`/`specKeys`, `code`, `expect`, `missions`, `facts`, `tolerance`/`earHint`, `describe`, `summary`.
2. Le son dans `ui/sounds.js` (en réutilisant `synthNote`, et en respectant la chaîne de superdough).
3. Le composant `ui/<Type>Schema.jsx` avec `useSchema` et les pièces de `parts.jsx` ; l'ajouter à `VIEWS` (`ui/Schema.jsx`) et à `TYPES` (`catalog.js`).
4. Dans le banc : le rendu du schéma (`renderSchema`), les zones de rangement, une mesure par fait (`FACTS`), un parcours scripté par mission (`SCRIPTS` dans `check-schemas.mjs`).
5. Ajouter les preuves en §6, mettre à jour §0.

---

## 9. Déployer, revenir en arrière

Depuis le laptop (Git Bash), dans `keymaker-app/` :

```bash
git pull
npm install
npm run check            # contenu + liens + schémas
npm run build:pi
npm run smoke            # 3 tailles × 2 thèmes, hors ligne, schémas
bash scripts/deploy-pi.sh
```

`deploy-pi.sh` sauvegarde l'app en place dans `modules/keymaker/backups/webapp-<date>.tar.gz` avant de la remplacer. **Revenir en arrière** : sur le Pi, vider `modules/keymaker/webapp/` sans toucher à `.gitkeep`, puis y extraire la sauvegarde :

```bash
cd /mnt/nvme/personal-os/repo/modules/keymaker
find webapp -mindepth 1 -maxdepth 1 ! -name .gitkeep -exec rm -rf {} +
tar -xzf backups/webapp-<date>.tar.gz -C webapp
find webapp -type d -exec chmod 755 {} + ; find webapp -type f -exec chmod 644 {} +
```

Aucune donnée n'est touchée : les schémas n'écrivent rien dans le navigateur, et les questions à l'oreille créent leurs propres cartes de révision (`oreille.…`) à côté des autres.
