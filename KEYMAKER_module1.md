# Keymaker — Module 1 : Strudel & Live Coding

> Contenu détaillé du Module 1. Document de référence pour le développement.
> Syntaxe vérifiée contre la doc officielle Strudel (strudel.cc/workshop) le 2 juin 2026.

---

## Objectif du module

À la fin du Module 1, tu sais **lire, écrire et modifier en direct** un pattern Strudel composé de rythmes, de notes et de plusieurs couches. Tu maîtrises les **briques de base** du langage. Pas besoin de produire un « morceau » fini — l'objectif est de comprendre chaque brique à fond, pour pouvoir tout combiner ensuite librement.

**Ce que tu sauras faire concrètement :**

- Lancer et arrêter du son en live coding (la boucle Run/Stop)
- Programmer un rythme avec la mini-notation (séquences, silences, sous-rythmes, vitesse)
- Régler le tempo proprement (cycles, BPM)
- Jouer des notes et de petites mélodies (nombres, lettres, octaves, gammes)
- Empiler plusieurs patterns qui tournent en même temps (`stack`, `$:`)

---

## 3 décisions de cadrage (validées)

| Décision | Choix | Conséquence sur le contenu |
|---|---|---|
| **Granularité** | Mix : chapitres → flashs | 5 chapitres-thèmes (la carte), chacun découpé en étapes Flash (~5 min) |
| **Théorie musicale** | Intégrée au fil de l'eau | Chaque terme de solfège est expliqué au moment où il apparaît, pas avant |
| **Objectif** | Maîtriser les briques | On va au fond de chaque fonction ; l'assemblage en morceau viendra plus tard |

---

## Carte du module — 5 chapitres (briques)

| # | Chapitre | Brique maîtrisée | Flashs |
|---|---|---|---|
| 1 | **Premier contact** | Le live coding & le premier son | 5 |
| 2 | **Le rythme** | La mini-notation (langage rythmique) | 7 |
| 3 | **Le pouls** | Le tempo & les cycles | 3 |
| 4 | **La hauteur** | Les notes & les gammes | 7 |
| 5 | **L'assemblage** | Empiler les patterns | 4 |

**Total : 26 flashs.** Progression séquentielle, mais chaque chapitre est une brique autonome.

**Correspondance avec les modes d'apprentissage :**

- 1 **flash** = 1 étape ci-dessous (~5 min : 1 concept + 1 exercice)
- 1 **session** (~20 min) = 1 chapitre complet, joué avec le template de leçon complet
- 1 **deep dive** (~60 min) = le module entier d'un coup

---

## Template appliqué à chaque flash

Chaque flash suit une version courte du template de leçon (adaptée au format ~5 min) :

1. **Concept** — 1 à 3 phrases + visuel si utile
2. **Exemple sonore** — un pattern qui tourne, écoutable tout de suite
3. **Décodage** — le code expliqué ligne par ligne, en français
4. **Exercice** — un objectif précis, à faire dans l'éditeur embarqué

L'**exercice libre** (5ᵉ étape du template) est proposé en fin de chapitre, pas à chaque flash.

**Bilinguisme :** les fonctions Strudel restent en anglais (`sound`, `note`, `stack`…). Les termes de solfège sont donnés en français avec l'anglais entre parenthèses à leur première apparition (ex. : *mesure (bar)*). Chaque terme nourrit le glossaire bilingue de l'app.

---

# Chapitre 1 — Premier contact

> **Brique :** le live coding et le premier son.
> **Vibe :** ouvrir la première porte. Du code → du son, immédiatement.

**Fonctions / syntaxe introduites :** `sound("…")`, `s("…")` (raccourci), `:n` (numéro d'échantillon), `.bank("…")`
**Théorie intégrée :** la notion de *cycle* (le pouls qui boucle), le vocabulaire de la batterie (kick / snare / hihat)
**Raccourcis clavier :** `Ctrl+Enter` (jouer / mettre à jour), `Ctrl+.` (arrêter)

### Flash 1.1 — Le live coding & le premier son
- **Concept :** en live coding, tu écris du code et tu l'entends *tout de suite*. Pas de compilation, pas d'export. Le code, c'est l'instrument.
- **Code :** `sound("casio")`
- **Décodage :** `sound(...)` = « joue ce son ». `"casio"` = le nom du son, entre guillemets.
- **Exercice :** lancer `sound("casio")`, puis remplacer `casio` par `metal` et relancer.

### Flash 1.2 — La boucle Run / Stop
- **Concept :** deux gestes suffisent. `Ctrl+Enter` joue (et met à jour à chaud, sans couper le son). `Ctrl+.` arrête. C'est la boucle du live coding : écrire → jouer → modifier → rejouer.
- **Code :** `sound("metal")`
- **Exercice :** jouer, modifier le son pendant que ça tourne, relancer avec `Ctrl+Enter`, puis arrêter avec `Ctrl+.`.
- **Note dev :** c'est la première vraie manipulation de l'éditeur. Bien mettre en valeur les deux raccourcis (visuel fort, gros).

### Flash 1.3 — La banque de sons
- **Concept :** Strudel embarque plein de sons prêts à l'emploi. On change de son juste en changeant le nom.
- **Code :** `sound("insect")` — puis essayer `wind`, `jazz`, `crow`, `space`, `numbers`…
- **Décodage :** un petit silence peut arriver pendant le chargement du son la première fois. Normal.
- **Exercice :** essayer 4 sons différents et repérer celui qu'on préfère.

### Flash 1.4 — Les sons de batterie
- **Concept :** parmi ces sons, une vraie batterie est cachée. Chaque abréviation = un élément du kit.
- **Code :** `sound("bd hh sd oh")`
- **Théorie (kit de batterie) :** `bd` = grosse caisse (*bass drum / kick*), `sd` = caisse claire (*snare*), `hh` = charleston (*hihat*), `oh` = charleston ouvert (*open hihat*). Aussi : `rim`, `cp` (clap), `lt/mt/ht` (toms), `cr` (crash), `rd` (ride).
- **Exercice :** composer une batterie à 4 sons en piochant dans la liste.
- **Visuel :** schéma d'un kit de batterie avec les abréviations placées sur chaque fût/cymbale.

### Flash 1.5 — Variantes de son : `:n` et `bank()`
- **Concept :** un même nom de son contient souvent plusieurs échantillons. On en choisit un avec `:` suivi d'un numéro. Et on peut changer la « machine » entière avec `bank()`.
- **Code :**
  - `sound("casio:1")` (ne rien mettre = `:0`)
  - `sound("bd hh sd oh").bank("RolandTR909")`
- **Décodage :** `.bank("RolandTR909")` rebranche toute la batterie sur une boîte à rythmes mythique (house/techno). Autres banques : `RolandTR808`, `RolandTR707`, `AkaiLinn`, `RhythmAce`.
- **Exercice :** prendre sa batterie du flash 1.4 et lui coller deux banques différentes pour entendre la différence.

**Récap chapitre 1 :** `sound` / `s`, le nom du son, `:n`, `bank()`. Le concept de *cycle* est posé (le pattern boucle). Premier son obtenu, boucle Run/Stop maîtrisée.

---

# Chapitre 2 — Le rythme

> **Brique :** la mini-notation, le langage rythmique de Strudel (hérité de Tidal).
> **Vibe :** le cœur du module. Tout se joue ici.

**Syntaxe introduite :** espace (séquence), `-` et `~` (silence), `[ ]` (sous-séquence), `[[ ]]` (imbrication), `*` (accélérer), `/` (ralentir), `< >` (alternance), `,` (parallèle)
**Théorie intégrée :** *temps (beat)*, *mesure (bar)*, *subdivision* (croches/double-croches), l'idée « hauteur = rythme très rapide »

### Flash 2.1 — Les séquences (l'espace)
- **Concept :** plusieurs sons séparés par des espaces = une suite jouée dans l'ordre.
- **Code :** `sound("bd hh sd hh")`
- **Décodage :** chaque mot est un pas. Le son en cours est surligné dans le code pendant la lecture.
- **Exercice :** allonger la séquence à 6 ou 8 sons.

### Flash 2.2 — Le cycle qui se remplit
- **Concept :** toute la séquence est compressée dans **un cycle**. Donc plus tu mets de sons, plus chacun est court → ça va plus vite.
- **Théorie (mesure) :** un *cycle* en Strudel ≈ une *mesure (bar)* en musique. Par défaut il dure 2 secondes. Les pas à l'intérieur sont les *temps (beats)* et leurs *subdivisions*.
- **Code :** `sound("bd bd hh bd rim bd hh bd")`
- **Exercice :** comparer une séquence de 4 sons et une de 8 — entendre que la 2ᵉ va deux fois plus vite.

### Flash 2.3 — Les silences (`-` et `~`)
- **Concept :** le silence est une brique à part entière. Il occupe un pas, mais ne joue rien.
- **Théorie :** en musique, un silence (*rest*) a une durée, exactement comme une note. Le vide fait partie du groove.
- **Code :** `sound("bd hh - rim - bd hh rim")`
- **Décodage :** `-` et `~` sont équivalents, deux façons d'écrire un pas vide.
- **Exercice :** prendre une séquence pleine et « creuser » des silences pour créer un groove.

### Flash 2.4 — Les sous-séquences `[ ]`
- **Concept :** des crochets regroupent plusieurs sons dans **un seul pas**. Ils se partagent la place de ce pas.
- **Code :** `sound("bd [hh hh] sd [hh bd]")`
- **Décodage :** `[hh hh]` tient dans le temps d'un seul pas → les deux `hh` sont deux fois plus rapides. On peut imbriquer : `sound("bd [[rim rim] hh] bd cp")`.
- **Exercice :** transformer un pas simple en `[deux sons]`, puis essayer une imbrication `[[ ]]`.

### Flash 2.5 — La vitesse : `*` (accélérer) et `/` (ralentir)
- **Concept :** `*` répète/accélère un élément, `/` l'étale sur plusieurs cycles. C'est la paire vitesse.
- **Code :**
  - `sound("bd hh*2 rim hh*3")` — `hh*2` joue deux charlestons dans un pas
  - `sound("hh*8")` — un pas répété 8 fois
  - `sound("[bd sd]/2")` — la paire `bd sd` s'étale sur 2 cycles (plus lent)
- **Théorie (le pont magique) :** pousse la vitesse très loin — `sound("hh*32")`. À un moment, le rythme devient si rapide qu'on entend une **hauteur**. *Une hauteur, c'est un rythme très rapide.* C'est le lien secret entre le chapitre 2 (rythme) et le chapitre 4 (notes).
- **Exercice :** prendre un charleston et le faire `*4`, `*8`, `*16`, `*32` — écouter le moment où le rythme devient une note.

### Flash 2.6 — L'alternance `< >`
- **Concept :** les chevrons jouent **un seul élément par cycle**, en tournant. Idéal pour faire varier sans accélérer.
- **Code :**
  - `sound("<bd hh rim oh>")` — un son différent à chaque cycle
  - `sound("bd sd, [~ <sd cp>]*2")` — la caisse claire alterne avec un clap
- **Décodage :** différence clé avec `[ ]` : les crochets *compressent* tout dans un cycle, les chevrons *répartissent* sur plusieurs cycles. `<a b c>` = `[a b c]/3`.
- **Exercice :** ajouter une variation à sa batterie avec `< >` sans que le tempo change.

### Flash 2.7 — Le parallèle : la virgule
- **Concept :** la virgule joue plusieurs séquences **en même temps**, superposées. Premier empilement !
- **Code :** `sound("hh hh hh, bd casio")` — la ligne de charleston et la ligne kick/casio tournent ensemble.
- **Décodage :** chaque groupe séparé par `,` est une couche indépendante, calée sur le même cycle. C'est la version « mini-notation » de l'empilement (le chapitre 5 généralisera avec `stack` et `$:`).
- **Exercice :** superposer une ligne de charleston régulière et une ligne kick + snare → une vraie boucle de batterie.

**Récap chapitre 2 (la table de la mini-notation) :**

| Concept | Syntaxe | Exemple |
|---|---|---|
| Séquence | espace | `sound("bd sd hh")` |
| Silence | `-` ou `~` | `sound("bd - sd -")` |
| Sous-séquence | `[ ]` | `sound("bd [hh hh] sd")` |
| Imbrication | `[[ ]]` | `sound("bd [[rim rim] hh]")` |
| Accélérer | `*` | `sound("hh*4")` |
| Ralentir | `/` | `sound("[bd sd]/2")` |
| Alternance | `< >` | `sound("<bd hh rim>")` |
| Parallèle | `,` | `sound("hh*4, bd sd")` |

**Exercice libre du chapitre :** construire une boucle de batterie de 8 pas avec au moins un silence, une sous-séquence et une couche parallèle.

---

# Chapitre 3 — Le pouls

> **Brique :** le tempo et les cycles.
> **Vibe :** prendre le contrôle de la vitesse. Court chapitre, gros déclic.

**Fonctions introduites :** `setcpm(…)`, mention de `setcps(…)`
**Théorie intégrée :** *cycle*, *tempo*, *BPM (beats per minute)*, *mesure / signature rythmique (4/4)*
**Note :** Felix est guitariste → le tempo/BPM est un terrain semi-familier. Bon chapitre de confiance, on peut aller un peu plus vite.

### Flash 3.1 — C'est quoi un cycle ?
- **Concept :** le *cycle* est le pouls de Strudel. Tout ce que tu écris se répète à chaque cycle. Par défaut : **30 cycles par minute**, soit 1 cycle toutes les 2 secondes.
- **Code :** `sound("bd sd")` (observer la régularité de la boucle)
- **Théorie :** un cycle ≈ une *mesure (bar)*. Le tempo, c'est le nombre de cycles par minute.
- **Exercice :** juste écouter et compter — repérer le « 1 » qui revient.

### Flash 3.2 — `setcpm()` : régler la vitesse
- **Concept :** `setcpm` (cycles per minute) fixe le tempo global. On l'écrit sur une ligne avant le pattern.
- **Code :**
  ```
  setcpm(45)
  sound("bd sd [- bd] sd")
  ```
- **Décodage :** monte à `setcpm(90)`, redescends à `setcpm(20)` → la boucle entière accélère/ralentit.
- **Exercice :** trouver le tempo qui « groove » le mieux pour sa batterie.

### Flash 3.3 — cpm ↔ BPM (faire le pont avec la musique)
- **Concept :** les musiciens parlent en *BPM (battements par minute)*, pas en cycles. Le lien : on divise le BPM par le nombre de battements qu'on veut par cycle.
- **Code :**
  ```
  setcpm(90/4)
  sound("<bd hh rim hh>*8")
  ```
- **Théorie (4/4 et BPM) :** ici `90/4` = 90 BPM en mesure *4/4* (4 temps par mesure). Le `*8` met 8 croches (*eighth notes*) dans la mesure. Tu n'as pas besoin de retenir ça par cœur — c'est juste pour reconnaître les chiffres quand tu vois un tempo « comme en musique ».
- **Note :** `setcps(x)` existe aussi (cycles par *seconde*) ; `setcpm(x) = setcps(x/60)`. On reste sur `setcpm`, plus lisible.
- **Exercice :** régler une batterie house à `setcpm(120/4)` puis `setcpm(128/4)` (tempos techno typiques).

**Récap chapitre 3 :** le cycle = pouls (30 cpm par défaut). `setcpm()` règle le tempo. `setcpm(BPM / battements_par_cycle)` fait le pont avec le BPM musical.

---

# Chapitre 4 — La hauteur

> **Brique :** les notes et les gammes.
> **Vibe :** ici le solfège entre en scène — mais en douceur, et connecté à la guitare.

**Fonctions introduites :** `note("…")`, `n("…")`, `.scale("…")`, modificateurs `@` (allonger) et `!` (répéter)
**Théorie intégrée :** noms de notes *do-ré-mi ↔ C-D-E*, *octave*, *dièse (#) / bémol (♭)*, *gamme chromatique*, *accord (chord)*, *gamme (scale)*, *majeur / mineur / pentatonique*
**Pont guitare :** Felix sait à peu près où sont les notes sur le manche → on s'appuie là-dessus.

### Flash 4.1 — Jouer des notes avec des nombres
- **Concept :** `note(...)` joue des hauteurs. Le plus simple : des nombres (numéros MIDI). Plus le nombre est grand, plus c'est aigu.
- **Code :** `note("48 52 55 59").sound("piano")`
- **Décodage :** la mini-notation du chapitre 2 marche pareil ici (séquences, silences, `*`, `[ ]`…). Seule la *matière* change : des hauteurs au lieu de samples. On ajoute `.sound("piano")` pour choisir le timbre.
- **Exercice :** changer les nombres, essayer des décimales (`55.5`), écouter monter/descendre.

### Flash 4.2 — Les notes en lettres (le pont solfège)
- **Concept :** on peut écrire les notes en lettres au lieu de nombres.
- **Théorie (do-ré-mi ↔ C-D-E) :** le système anglais utilise des **lettres** :

  | do | ré | mi | fa | sol | la | si |
  |---|---|---|---|---|---|---|
  | C | D | E | F | G | A | B |

  C'est le même système que sur ta guitare (case 0 de la corde de Mi grave = E). Strudel parle anglais → autant adopter C-D-E directement.
- **Code :** `note("c e g b").sound("piano")`
- **Exercice :** écrire une « mélodie-mot » avec les lettres a–g (indice : c-a-f-e ☕).

### Flash 4.3 — Les octaves
- **Concept :** la même note existe à plusieurs hauteurs. Un numéro après la lettre choisit l'*octave*.
- **Théorie (octave) :** une *octave*, c'est l'intervalle entre une note et la même note deux fois plus aiguë (do → do suivant). Sur la guitare, c'est 12 cases plus haut.
- **Code :** `note("c2 e3 g4 b5").sound("piano")`
- **Décodage :** `c2` est grave, `c5` est aigu. Sans numéro, Strudel choisit une octave par défaut.
- **Exercice :** jouer la même mélodie en `c3…` puis en `c4…` pour entendre le saut d'octave.

### Flash 4.4 — Dièses et bémols (les touches noires)
- **Concept :** entre certaines notes il y a des notes intermédiaires : les *dièses* et *bémols*.
- **Théorie (gamme chromatique) :** `#` (*dièse / sharp*) monte d'un demi-ton, `♭`/`b` (*bémol / flat*) descend d'un demi-ton. Ce sont les touches noires du piano. En tout, **12 notes** par octave = la *gamme chromatique*. Sur la guitare, un demi-ton = une case.
- **Code :**
  - `note("c c# d d# e").sound("piano")` (dièses)
  - `note("db eb gb ab bb").sound("piano")` (bémols)
- **Exercice :** jouer les 12 notes chromatiques de `c` à `c` (case par case mentale).

### Flash 4.5 — La durée des notes : `@` et `!`
- **Concept :** deux modificateurs de durée/répétition utiles pour le phrasé.
- **Code :**
  - `note("c@3 eb").sound("gm_acoustic_bass")` — `c` dure 3 unités, `eb` en dure 1
  - `note("c!3 e").sound("piano")` — `c` répété 3 fois
- **Décodage :** `@n` = allonger (*elongate*), `!n` = répéter (*replicate*). À comparer avec `*` (accélérer) du chapitre 2 : trois façons différentes de jouer avec le temps.
- **Exercice :** prendre une mélodie de 4 notes et allonger la première avec `@3`.

### Flash 4.6 — Les accords (plusieurs notes à la fois)
- **Concept :** la virgule (chapitre 2.7) sert aussi à jouer plusieurs notes **en même temps** → un *accord*.
- **Théorie (accord) :** un *accord (chord)* = au moins 3 notes jouées ensemble. Ex. do-mi-sol (`c e g`) = accord de do majeur. On reste léger ici — la construction des accords, c'est le Module 2.
- **Code :** `note("c e g").sound("piano")` joué en séquence, vs `note("[c,e,g]").sound("piano")` joué en bloc.
- **Décodage :** `[c,e,g]` empile les 3 notes dans un seul pas → elles sonnent ensemble.
- **Exercice :** transformer une mélodie en accords en regroupant des notes avec `[ , , ]`.

### Flash 4.7 — Les gammes : `n()` + `scale()`
- **Concept :** trouver les bonnes notes, c'est dur. Une *gamme* fait le tri pour toi : tu donnes des numéros de degré, elle choisit des notes qui sonnent bien ensemble.
- **Théorie (gamme) :** une *gamme (scale)* = un ensemble de notes qui vont bien ensemble. `0` = la première note de la gamme, `1` la suivante, etc. *Majeur* sonne « joyeux », *mineur* sonne « grave/triste », *pentatonique* est le passe-partout du guitariste. La théorie complète des gammes = Module 2.
- **Code :**
  ```
  setcpm(60)
  n("0 2 4 6").scale("C:minor").sound("piano")
  ```
- **Décodage :** `n(...)` donne des degrés (pas des hauteurs absolues), `.scale("C:minor")` les traduit en notes. Essaie `C:major`, `A:minor`, `C:major:pentatonic`. *N'importe quel chiffre devrait sonner juste.*
- **Exercice :** garder les mêmes numéros et changer juste la gamme (`major` → `minor` → `pentatonic`) pour entendre l'ambiance changer.

**Récap chapitre 4 :**

| Concept | Syntaxe | Exemple |
|---|---|---|
| Note (nombre) | `note` | `note("48 52 55")` |
| Note (lettre) | `note` | `note("c e g")` |
| Octave | `cN` | `note("c2 c3 c4")` |
| Dièse / bémol | `#` / `b` | `note("c# db")` |
| Allonger | `@` | `note("c@3 e")` |
| Répéter | `!` | `note("c!3 e")` |
| Accord | `[ , ]` | `note("[c,e,g]")` |
| Gamme | `n` + `scale` | `n("0 2 4").scale("C:minor")` |

**Exercice libre du chapitre :** écrire une mélodie de 8 notes dans une gamme mineure, avec au moins une note allongée et un accord.

---

# Chapitre 5 — L'assemblage

> **Brique :** empiler plusieurs patterns qui tournent ensemble.
> **Vibe :** le moment « waouh » — tout ce qu'on a appris, en couches. Pas pour faire un morceau fini, mais pour comprendre *comment les briques se combinent*.

**Fonctions introduites :** `stack(…)`, `$:` (et `_$:` pour muter)
**Théorie intégrée :** la notion de *couches / layering* (rythme + basse + mélodie), rappel : tout est calé sur le même cycle

### Flash 5.1 — Le problème : tout jouer en même temps
- **Concept :** jusqu'ici, une ligne = un pattern. Mais une vraie boucle a plusieurs couches simultanées : batterie + basse + mélodie. Comment les faire tourner ensemble ?
- **Code (rappel) :** `sound("hh*4, bd sd")` — la virgule marche pour empiler *dans* une mini-notation, mais c'est vite illisible avec 3+ couches longues.
- **Exercice :** essayer d'empiler 3 lignes longues avec des virgules → constater que ça devient dur à lire. (Met en place le besoin.)

### Flash 5.2 — `stack()` : empiler proprement
- **Concept :** `stack(...)` empile plusieurs patterns complets, séparés par des virgules, chacun sur sa ligne. Lisible et extensible.
- **Code :**
  ```
  stack(
    sound("bd*4").bank("RolandTR909"),
    sound("hh*8"),
    note("c2 eb2 g2 c3").sound("gm_acoustic_bass")
  )
  ```
- **Décodage :** chaque argument de `stack()` est un pattern indépendant. Tous tournent en parallèle, calés sur le même cycle. On peut en ajouter/retirer librement.
- **Exercice :** partir d'une batterie et ajouter une 2ᵉ couche basse dans le `stack`.

### Flash 5.3 — `$:` : la notation moderne
- **Concept :** Strudel propose un raccourci plus souple : préfixer chaque pattern par `$:`. Pas besoin d'emboîter dans une fonction.
- **Code :**
  ```
  $: sound("bd*4, [~ sd]*2").bank("RolandTR909")
  $: note("c2 eb2 g2 c3").sound("gm_acoustic_bass")
  $: n("0 2 4 6").scale("C:minor").sound("piano")
  ```
- **Décodage :** chaque ligne `$:` est une couche. Astuce live : remplace `$:` par `_$:` pour **muter** une couche sans l'effacer (super pratique pour jouer en direct).
- **Exercice :** monter 3 couches en `$:`, puis muter/réactiver la mélodie avec `_$:`.

### Flash 5.4 — Bilan : assembler les briques
- **Concept :** réunir batterie (ch.1-2), tempo (ch.3) et notes/gammes (ch.4) en un seul empilement. Pas un « morceau » — une démonstration que toutes les briques s'emboîtent.
- **Code :**
  ```
  setcpm(120/4)
  $: sound("bd*4, [~ cp]*2, [~ hh]*4").bank("RolandTR909")
  $: note("<c2 ab1 f1 g1>*2").sound("gm_acoustic_bass")
  $: n("0 2 <4 5> 2").scale("C:minor").sound("piano")
  ```
- **Décodage :** revue rapide de chaque ligne en pointant la brique d'où elle vient (banque + parallèle + tempo + alternance + gamme).
- **Exercice libre du module :** repartir de cet empilement et le bidouiller — changer la gamme, le tempo, ajouter une couche, en muter une. **C'est ça, le live coding.**

**Récap chapitre 5 :** `stack(...)` et `$:` empilent des patterns. `_$:` mute une couche. Toutes les briques du module se combinent sur un même cycle.

---

## Récapitulatif global — Module 1

**Toutes les fonctions du module :**

| Fonction | Rôle | Exemple |
|---|---|---|
| `sound` / `s` | jouer un son / sample | `sound("bd sd")` |
| `bank` | choisir la boîte à rythmes | `.bank("RolandTR909")` |
| `note` | jouer une hauteur | `note("c e g").sound("piano")` |
| `n` | numéro de sample OU degré de gamme | `n("0 2 4").scale("C:minor")` |
| `scale` | interpréter `n` comme une gamme | `.scale("C:minor")` |
| `setcpm` | régler le tempo (cycles/min) | `setcpm(120/4)` |
| `stack` | empiler des patterns | `stack(a, b, c)` |
| `$:` | empiler des patterns (raccourci) | `$: sound("bd sd")` |

**Toute la mini-notation :** espace, `-`/`~`, `[ ]`, `[[ ]]`, `*`, `/`, `< >`, `,`, `@`, `!`, `:n`

**Vocabulaire bilingue introduit (pour le glossaire) :**

cycle · mesure (*bar*) · temps (*beat*) · silence (*rest*) · subdivision · tempo · BPM (*beats per minute*) · signature rythmique (*time signature*) · note · octave · dièse (*sharp*) · bémol (*flat*) · gamme chromatique (*chromatic scale*) · accord (*chord*) · gamme (*scale*) · majeur (*major*) · mineur (*minor*) · pentatonique (*pentatonic*) · couche (*layer*)

---

## Ce qui débloque le Module 2

À la fin du Module 1, Felix manipule les notes et les gammes **mécaniquement** (il sait les écrire et les empiler) mais pas **théoriquement** (pourquoi une gamme mineure sonne triste, comment se construit un accord, ce qu'est un intervalle). Le Module 2 reprend exactement ces termes — déjà rencontrés au chapitre 4 — pour les expliquer en profondeur. La transition est donc naturelle : *« tu as utilisé `scale("C:minor")` sans savoir ce que ça veut dire — maintenant on ouvre la boîte. »*

---

## Notes pour le développement

- **Pré-requis technique :** REPL Strudel embarqué (CodeMirror 6 + moteur Strudel) fonctionnel dès le chapitre 1, flash 1.1.
- **Surlignage temps réel :** le surlignage du son en cours (vu au flash 2.1) est natif dans Strudel — à exposer dans l'éditeur embarqué.
- **Validation couleur :** la feature « validation couleur temps réel » (architecture) est particulièrement utile aux flashs avec crochets/chevrons (2.4, 2.6) — repérer les `[ ]`, `< >`, `( )` non fermés.
- **Mobile :** rappel — pas d'éditeur sur téléphone. Ces flashs sont PC/tablette. Sur mobile : version « lecture » (concept + audio + quiz), sans exercice de code.
- **Sati :** bons points d'intervention → flash 2.5 (le pont rythme↔hauteur, concept abstrait), flash 4.4 (gamme chromatique), tout le chapitre 5 (debug d'empilement). Sati peut générer un quiz de fin de chapitre sur le vocabulaire introduit.
- **Easter egg potentiel :** la mélodie-mot du flash 4.2 (c-a-f-e…) — à explorer, sans spoiler.

---

*Document créé le 2 juin 2026 — session de définition du Module 1 avec claude-opus.*
*Syntaxe vérifiée contre strudel.cc/workshop/first-sounds, first-notes, et la doc des time-modifiers.*
*Prochaine étape : choix du framework UI (React vs Svelte) et début du développement.*
