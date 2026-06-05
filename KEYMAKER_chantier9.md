# Keymaker — Chantier 9 : Module 3 « Connexion Guitare »

> **Honnêteté sur l'historique.** Le **contenu** du Module 3 a d'abord été ajouté **par une autre session Cowork** le 5 juin (code seul dans `lessons.js`, sans rebuild ni doc). Il a ensuite été **réconcilié** (app rebuildée, roadmap/README resync) par la session du Chantier 8.
> **Ce brief-ci** a été **complété le 5 juin** par la session qui a (re)vérifié et (re)livré le module proprement : vérification Strudel **en direct**, décisions de contenu, et tests réels. Il décrit le module tel qu'il est livré et **pourquoi** il est fait ainsi.

---

## 🎯 Objectif

Donner à Keymaker son **3ᵉ module de contenu** : **Connexion Guitare** — relier la théorie (Modules 1 & 2)
au **manche de la guitare**, l'instrument de Felix. Le fil rouge : le manche comme **carte**, et chaque
concept rendu **immédiatement audible** dans Strudel avec de **vraies guitares** (banque General MIDI).
Pont permanent dans les deux sens : théorie → manche, et manche → Strudel.

C'était la 1ʳᵉ piste listée pour les Modules 3-6 dans `KEYMAKER_architecture.md`, et la plus forte
valeur d'usage (Felix est guitariste).

---

## ✅ Ce qui est livré

**Module 3 : 5 chapitres, 25 flashs (`3.1` → `3.25`).** Même format de flash que M1/M2
(id, kicker, title, concept, code, decode?, theory?, exercise, recap?, free?).

- **Ch.1 — Le manche & l'accordage** (3.1→3.5) : le son de guitare dans Strudel, les 6 cordes à vide
  (E A D G B E), 1 case = 1 demi-ton, la 12ᵉ case = l'octave, s'accorder à la 5ᵉ case (+ exception G→B en 4ᵉ).
- **Ch.2 — Lire le manche** (3.6→3.10) : les notes naturelles d'une corde, une gamme « le long ou en
  travers », le capo (= `.add()`), la boîte pentatonique pour improviser, un premier riff (basse + boîte).
- **Ch.3 — Les accords ouverts** (3.11→3.15) : Mi majeur (vraies notes), majeur → mineur en un demi-ton,
  les accords « feu de camp » (A D G C), la grille à 4 accords (I-V-vi-IV), gratter avec `.struct()`.
- **Ch.4 — Power chords & barrés** (3.16→3.20) : le power chord (fondamentale + quinte), la forme mobile
  (`.add()`), le palm mute (`.clip()`), le barré (forme de Mi `.add(n)`), un riff metal complet.
- **Ch.5 — Le jeu** (3.21→3.25) : plaqué vs arpégé, le picking (`n()` + `voicing()`), la dynamique
  (`gain()`), les effets/pédales (`distort/phaser/delay`), et un **morceau guitare complet** reliant M1+M2+M3.

5 récaps (1 par chapitre) + 5 exercices libres de clôture.

**Intégration — zéro changement de code de navigation :** `lessons.js` exporte `m3chapitre1…5`, `module3`,
et `modules = [module1, module2, module3]`. La navigation multi-modules du **Chantier 7**
(`FLATS = modules.map(buildFlat)`, sélecteur de module dans le Parcours, reprise `{m,c,f}`, bouton
« Module N+1 ▶ ») prend en charge un 3ᵉ module sans aucune modification — c'était tout l'intérêt de ce
câblage générique. Le **thème clair** (Chantier 8) s'applique au Module 3 comme au reste.

---

## 🔎 Vérifié AVANT de coder (Strudel réel — strudel.cc, juin 2026)

Cutoff Claude = mai 2025 → toutes les fonctions guitare ont été **vérifiées en direct** sur strudel.cc :

- **Sons GM guitare** ✓ : `gm_acoustic_guitar_nylon`, `gm_acoustic_guitar_steel`, `gm_electric_guitar_clean`
  (doc + recipes), `gm_electric_guitar_jazz` (doc), `gm_distortion_guitar`. La banque GM marche sans
  préchargement (M1 utilisait déjà `gm_acoustic_bass`).
- **`.clip(n)`** ✓ (page recipes « Sound Duration ») : durée **relative** de chaque note. `<1` = staccato /
  palm mute, `>1` = laisse sonner. C'est le cœur du palm mute (3.18).
- **`.add()`** ✓ : structure prise sur l'opérande de **gauche** (motif multi-pas à gauche, scalaire à droite,
  ex. `note("0 2 4 5 7 9 11 12".add("48"))`). Utilisé pour cases (3.7), capo (3.8), formes mobiles (3.17)
  et barrés (3.19 : `note("[e2,b2,e3,g#3,b3,e4]".add("<0 1 3 5>"))`).
- **`chord("<…>").voicing()`** + **`n("0 1 2 3").chord(...).voicing()`** ✓ : grilles d'accords et arpèges
  (page voicings + recipes « Arpeggios »).
- **`.struct("x ~ x x")`** ✓ : sépare le rythme (quand) de l'harmonie (quoi) → grattage (3.15, 3.20, 3.25).
- **Effets** ✓ (page effects) : `.distort("x:y")`, `.phaser()` (la doc dit « approximates popular guitar
  pedals »), `.delay()`, `.room()`, `.lpf()`, `.gain()`.
- **Vraies positions d'accords** (notes exactes d'un vrai manche, pas des voicings auto) : E majeur
  `[e2,b2,e3,g#3,b3,e4]`, E mineur (g#→g, le « lever d'index »), A/D/G/C ouverts, power chord `[e2,b2]`,
  barré = forme de Mi transposée. Choisi exprès pour qu'un guitariste **reconnaisse** ses positions.

---

## 🧠 Décisions de contenu (le « pourquoi »)

- **Enseigner À TRAVERS Strudel, comme M2** : chaque concept guitare est immédiatement audible. Pas de
  schéma de manche dessiné (l'app est code + audio) → les « formes » sont exprimées comme des **motifs de
  demi-tons déplaçables** (`.add()`), ce qui est à la fois jouable et fidèle à la logique du manche.
- **Vraies notes d'accords plutôt que `voicing()` partout** : pour les accords ouverts (3.11-3.13) on écrit
  les notes exactes (E `[e2,b2,e3,g#3,b3,e4]`), pour que Felix retrouve ses positions. `chord().voicing()`
  est gardé pour les grilles (3.14-3.15) où le confort prime.
- **Le « lever d'index » majeur→mineur** (3.12) : un seul demi-ton (g#→g) bascule E en Em — rappel direct
  de la tierce du M2, et geste réel sur l'instrument.
- **Formes mobiles = `.add()`** (3.17, 3.19) : power chord `[0,7]` et barré (forme de Mi) déplacés par
  `.add("<…>")` → on **entend** qu'une seule forme donne tous les accords. Lien fort code ↔ manche.
- **Palm mute = `.clip()`** (3.18) : `.clip(.2)` (étouffé) vs `.clip(1)` (ouvert) → l'articulation devient
  un paramètre audible, pas un mot abstrait.
- **Picking = `n()` + `voicing()`** (3.22) : prolonge directement le M2 (chapitre 4 accords) plutôt
  qu'introduire une fonction non vérifiée. Arpège fidèle, sans nouvelle dépendance conceptuelle.
- **Ponts explicites (M1)/(M2)/(M3)** dans chaque flash, et 3 bilans « assembler » (3.10, 3.20, 3.25) qui
  empilent batterie + basse + accords + mélodie → un vrai bout de morceau à chaque fin de fil.

---

## 🛠️ Réconciliation & livraison (5 juin 2026)

Le Module 3 avait été ajouté **après** le build du Chantier 8 → `dist/` et docs étaient restés en 2 modules.
Remis en cohérence et **re-livré proprement** :

- **`lessons.js` autoritatif** = `module3` inséré avant l'export `modules`, `modules = [module1, module2, module3]`
  (M1/M2 intacts). Vérifié par Grep côté machine de Felix.
- **App rebuildée** (source réelle complète, 3 modules + thème clair) : `vite build` → **34 modules**,
  bundle `index-NqFEHDkR.js` (258,9 kB) + CSS `index-BXVl0h6z.css`. `dist/` recopié sur le mont
  (écriture sandbox → mount fiable, **byte-identité vérifiée** `.js`/`.css`/`index.html`/`sw.js`/`manifest`).
- **Pont fichiers** (rappel) : le mount servait des sources **périmées** (`lessons.js` 657 l. au lieu de 2300,
  etc.), y compris après l'édition autoritative. Parade : build dans un dossier possédé (`/tmp/kmg`) à partir
  des sources autoritatives, `node_modules` réutilisé d'un build précédent (symlinks → vite peut écrire ses
  temporaires). Le moteur `vendor/` (statique) se lisait correctement (tailles byte-identiques).

---

## 🧪 Vérifications (toutes vertes)

- **Build** : `vite build` propre, **34 modules**, 0 erreur, nouveau bundle + PWA régénérée.
- **Intégrité des données** (`test-data.mjs`) : **98/98** — `modules=[m1,m2,m3]`, M1 intact (26 flashs),
  M2 intact (25), M3 = 5 ch / 25 flashs, ids `3.1→3.25`, champs typés, decode/theory bien formés,
  5 récaps alignées, 5 exercices libres, `buildFlat(m3)=25`, titres de chapitres.
- **Montage runtime jsdom** (`test-mount-m3.mjs`) : **18/18** — démarrage M1, ouverture Parcours, 3 onglets,
  bascule Module 3, chapitres listés, flash 3.1 sélectionné → crumb « Module 3 · Le manche & l'accordage ·
  Flash 3.1 » + titre, Parcours refermé, reprise `{m:2}`, Suivant 3.1→3.2, retour Module 1.
- **Sentinelles** dans le bundle livré : `Connexion Guitare`, `gm_distortion_guitar`, `palm mute`,
  `power chord`, `3.25` ; `index.html` → nouveau bundle ; `dist/` byte-identique au build.

---

## 🏁 État & reste à faire

- [x] Module 3 : 5 ch / 25 flashs, format identique à M1/M2, Strudel vérifié, ponts guitare.
- [x] Intégré (`modules=[m1,m2,m3]`), navigation multi-modules OK pour 3 modules (aucune modif `App.jsx`).
- [x] Build propre (34 modules) + `dist/` livré (byte-identique). Tests **98/98** + **18/18**.
- [x] Docs en cohérence (README 3 modules / 76 flashs · roadmap · ce brief **complété**).
- [~] **Valider les 25 codes Strudel du Module 3 à l'oreille** (en cours, 5 juin). **Trouvé & corrigé** :
  la banque `gm_acoustic_guitar_steel` ne joue pas le Mi grave (`e2` = 82 Hz, muette sous ~Fa2) → **6 flashs**
  (3.2, 3.3, 3.6, 3.8, 3.11, 3.12) **passés en nylon**, app **rebuildée** (bundle `index-CekULCjI.js`, 34 modules)
  + intégrité données **94/94**. Détail technique : `KEYMAKER_strudel_reference.md` §8. **Reste à écouter**
  musicalement : 3.1/3.4/3.5 + chapitres 2-5 (les sons sont OK, vérifier l'harmonie — surtout 3.13, 3.19, 3.25).

---

## ⚠️ Leçon de la journée : collisions entre sessions

Plusieurs sessions Cowork ont touché le même dossier le 5 juin → l'app a brièvement régressé (dist en
2 modules alors que la source passait à 3 ; un Module 3 ajouté au code sans rebuild ni doc). **Parade** :
une seule session active à la fois sur le projet, **git** pour tracer/rattraper, et la règle « tous les
fichiers à jour pendant ET à la fin de session » (roadmap). Ce brief et la livraison de ce jour remettent
**source ↔ build ↔ docs** parfaitement en phase.

---

## 🔮 Et après ?

- **Valider le Module 3 à l'oreille** avec Felix (et ajuster les codes qui sonneraient faux).
- **Modules 4 à 6** (audio & effets · informatique musicale · composition) — même méthode.
- **Thème Matrix** (3ᵉ thème, vert) — suite naturelle du Chantier 8.
- (optionnel) câblage app → `session_id` pour relier le journal de Sati et les sessions.

---

*Brief complété le 5 juin 2026 (vérification Strudel + décisions de contenu + tests). Contenu initial du
Module 3 : autre session, réconcilié et re-livré proprement.*
