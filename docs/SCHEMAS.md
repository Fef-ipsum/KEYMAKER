# Les schémas vivants de Keymaker 2

*Un schéma est un petit instrument : on attrape le dessin, on entend la différence tout de suite, et la ligne de code suit. Conception, catalogue, preuves, mode d'emploi.*

---

## 0. État du chantier — à lire en premier pour reprendre

**Mis à jour le 23 novembre 2026.**

| Vague | Contenu | État |
|---|---|---|
| 1 | Socle (catalogue, son, intégration leçons/wiki, missions, question « à l'oreille », Sati, tests, page de revue) · filtre passe-bas · enveloppe ADSR | **Construite et vérifiée.** Poussée sur la branche `ccr-b6c29ca3-4wolq4`. **Pas encore déployée sur le Pi** (voir ci-dessous). |
| 2 | Ondes et harmoniques, passe-haut / passe-bande, enveloppe de filtre | À faire |
| 3 | Le cycle, le tempo | À faire |
| 4 | Clavier, intervalles, gammes, accords | À faire |
| 5 | Signaux, écho, réverbération, sidechain, distorsion | À faire |

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
| **Prévu (vague 2)** | Passe-haut (`hpf`/`hpq`) et passe-bande (`bpf`/`bpq`) : déjà acceptés par le moteur du schéma, pas encore utilisés dans le contenu ni vérifiés. |

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

### 2.3 Où ils vivent

| Lieu | Schéma | Missions |
|---|---|---|
| Étape `f.filtre` | filtre, `lpf(400)`, note répétée, seule la coupure se règle | ferme, ouvre |
| Étape `f.resonance` | filtre, `lpf(600).lpq(0)`, ligne de basse | ferme, siffle, acid |
| Étape `f.enveloppe` | adsr, `attack(.01).release(.1)`, Tenir | lente, traine |
| Étape `f.pluck` | adsr, sans réglage, Tenir | pince, lente, traine |
| Wiki `fx.lpf` · `fx.lpq` | filtre | ferme, ouvre · siffle, acid |
| Wiki `fx.attack` · `fx.decay` · `fx.sustain` · `fx.release` · `fx.adsr` · `sol.enveloppe` | adsr | une mission chacun (toutes pour `fx.adsr`, `sol.enveloppe`) |
| Point d'étape du chapitre 6 | `oreille.filtre-coupure`, `oreille.adsr-pince` | — |
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
- **La réserve de nœuds de superdough est commune à tous les contextes audio** (`getNodeFromPool`, non exportée). Un deuxième `OfflineAudioContext` reçoit des nœuds du premier et plante (« cannot connect to an AudioNode belonging to a different audio context »). `renderPatternAudio` n'est pas concerné parce qu'il ne sert qu'une fois. Le banc fait donc **tous** ses rendus superdough dans un seul contexte, chacun à son propre moment, séparés par 5,5 s de silence.

---

## 6. Faits vérifiés et leurs preuves

Chaque fait affiché dans un « Creuser » a son identifiant, sa preuve dans le code du moteur embarqué (Strudel 1.3.0) et une mesure automatique (`scripts/schemas-bench.js`, objet `FACTS`). Mesures du 23 novembre 2026, Chromium sans interface, 44 100 Hz.

### Filtre

- **`filtre.q-db`** — À la coupure, le gain vaut exactement `lpq` dB. *Code* : `createFilter` règle `Q` = `resonance`. *Mesure* : `getFrequencyResponse` à 600 Hz : lpq 0, 1, 6, 12, 15, 20, 30 → 0,0000 ; 1,0000 ; 6,0000 ; 12,0000 ; 15,0000 ; 20,0000 ; 30,0000 dB.
- **`filtre.pente`** — Au moins 12 dB par octave au-dessus de la coupure. *Mesure* : entre 2 et 8 fois la coupure, pour 300, 600 et 1 000 Hz : −12,94 ; −12,41 ; −13,04 ; −12,81 ; −13,27 ; −13,84 dB par octave. *Correction de l'annexe B* : elle disait « environ −12,5 dB entre la 2ᵉ et la 3ᵉ octave » ; la valeur dépend de la coupure, d'où la formulation « au moins 12 ».
- **`filtre.q-defaut`** — Sans `.lpq()`, la résonance vaut 1. *Code* : `createFilter(…){ let { q: tn = 1 } }`. *Mesure* : rendu superdough de `lpf(600)` vs `lpf(600).lpq(1)` : écart 3,4·10⁻⁶ (bruit de calcul) ; vs `lpq(0)` : 0,0202.
- **`filtre.scie`** — Une dent de scie contient toutes les harmoniques, la n-ième n fois plus faible. *Mesure* : `OscillatorNode` sawtooth de période entière (675 échantillons), amplitude × n / amplitude de la 1ʳᵉ, n = 2 à 128 : 1,000 partout (0,999 pour n = 128). C'est aussi ce qui garantit que les traits gris du peigne disent vrai.
- **`filtre.raccourci`** — `lpf("800:12")` règle coupure et résonance. *Mesure* : `queryArc` → `cutoff: 800, resonance: 12`.
- **`filtre.24db`** — `.ftype("24db")` met deux filtres à la suite. *Code* : `superdough` crée un second `createFilter` quand `ftype` vaut `24db`. *Mesure* : atténuation à ~2,1 kHz d'une basse `lpf(500)` : 24,9 dB → 49,7 dB (rapport 2,00).

### Enveloppe

- **`adsr.defauts`** — Sans réglage : .001, .05, .6, .01. *Code* : `registerSynthSounds` → `getADSRValues([…], 'linear', [.001, .05, .6, .01])`. *Mesure* : rendu superdough de `note("c3 e3 g3 e3").sound("sawtooth").lpf(1500)` = rendu du schéma avec ces valeurs (écart max 1,5·10⁻⁶).
- **`adsr.un-seul`** — Un seul réglage écrit change les autres. *Code* : `getADSRValues`. *Mesure* : les 16 combinaisons écrit / pas écrit, comparées à `getADSRValues` du moteur : 0 différence. Ex. `attack` seul → [a, .001, 1, .01] ; `decay` seul → [.001, d, .001, .01].
- **`adsr.lineaire`** — Montées et descentes en lignes droites. *Code* : `getParamADSR(…, 'linear')` pour ces ondes. *Mesure* : à mi-attaque (0,2 s sur 0,4 s), le volume vaut 0,5000.
- **`adsr.troncature`** — Note plus courte que l'attaque : sommet jamais atteint ; extinction depuis le niveau atteint. *Mesure* : attaque 0,5 s, note de 0,2 s → sommet 0,400 ; écart avec `getParamADSR` : 0.
- **`adsr.raccourci`** — `.adsr(".01:.2:.5:.3")` règle les quatre. *Mesure* : `queryArc` → `attack .01, decay .2, sustain .5, release .3`.

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
