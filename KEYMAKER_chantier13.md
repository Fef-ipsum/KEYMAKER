# Keymaker — Chantier 13 : Module 6 « Composition & Projets »

> Réalisé **en autonomie** le 6 juin 2026, sur « continue le prochain chantier ».
> 6ᵉ et **dernier module de contenu** du curriculum. Conçu, codé, buildé, testé,
> livré et documenté d'un bout à l'autre. **Le parcours d'apprentissage est complet.**

---

## 🎯 Objectif

Donner à Keymaker son **6ᵉ module : Composition & Projets** — le module qui fait
passer Felix de « jouer une boucle » à « **construire, arranger, jouer et partager un
morceau complet** ». C'était la piste listée pour le Module 6 dans
`KEYMAKER_architecture.md` (« tracks complètes, layering, arrangement, export, live
sets »), adaptée à la pédagogie du projet : **tout est audible, on apprend en faisant**.

**Fil rouge : « d'une boucle à un morceau ».** Les modules 1-5 ont donné les briques
(rythme, harmonie, geste, son, mouvement). Le Module 6 apprend à les **assembler** :
le code devient un **studio**.

---

## ✅ Ce qui est livré

**Module 6 : 5 chapitres, 25 flashs (`6.1` → `6.25`).** Même format de flash que
M1-M5 (id, kicker, title, concept, code, decode?, theory?, exercise, recap?, free?).

- **Ch.1 — Le studio dans le navigateur** (6.1→6.5) : le **stack live** — empiler des
  pistes avec `$:`, les **nommer** (`drums$:`, `bass$:`), les **couper en direct** avec
  le souligné (`_bass$:`), traiter tout le mix d'un geste (`all(f)`), poser le tempo
  commun (`setcpm(BPM/4)`).
- **Ch.2 — Réutiliser : variables & fonctions** (6.6→6.10) : `const` (définir un motif
  une fois, le rejouer/transformer partout), `register('nom', p=>…)` (sa propre fonction
  chaînée), `.color()` (s'organiser visuellement). Code DRY = TDA-friendly.
- **Ch.3 — Arranger dans le temps** (6.11→6.15) : `arrange([n, pat], …)` (la timeline
  couplet/refrain), `<a!4 b!4>` (tenir une section), `mask("<0 1 1>")` (entrer/sortir une
  couche), `pick([a,b])`/`pickRestart` (séquencer des sections), forme intro→cœur→outro.
- **Ch.4 — La matière d'un track** (6.16→6.20) : `samples()` (charger un kit),
  `chop(n)` (hacher un break), `slice`/`splice` (réordonner les tranches), `layer` &
  empilement `nom:n:gain` (épaissir), `clip`/`release`/`end` (sculpter les durées).
- **Ch.5 — Finir, jouer, partager** (6.21→6.25) : mixer (`gain`/`pan`/`orbit`), le
  **live set** (jouer en enlevant les `_` un à un + `all()` pour les transitions),
  **exporter** (onglet export → fichier audio ; OBS ; MIDI/OSC vers un DAW ; URL
  partageable), la **PWA** (hors-ligne), et un **projet final qui réunit les 6 modules**.

5 récaps (1 par chapitre) + 5 frees de clôture. Ponts explicites (M1)→(M5) partout.

**Intégration — zéro changement de code de navigation :** `lessons.js` exporte
`m6chapitre1…5`, `module6`, et `modules = [module1, module2, module3, module4, module5,
module6]`. La navigation multi-modules du **Chantier 7** (`FLATS = modules.map(buildFlat)`,
`modules.length - 1`, sélecteur de module, reprise `{m,c,f}`, bouton « Module suivant »)
prend en charge un 6ᵉ module **sans aucune modification d'`App.jsx`** — vérifié.

---

## 🔎 Vérifié AVANT de coder (Strudel réel — strudel.cc, juin 2026)

Cutoff Claude = mai 2025 → toutes les fonctions du module **vérifiées en direct** sur
strudel.cc, distillées dans `KEYMAKER_strudel_reference.md` §13 :

- **factories** ✓ : `arrange([n,pat],…)` (la timeline), `cat`/`slowcat`, `seq`,
  `stepcat`, `stack`, `polymeter`, `silence`. Signature d'`arrange` confirmée.
- **code** ✓ : `register('nom', p => …)` (fonction chaînée custom), commentaires `//`,
  chaînage, strings `"…"` (mini-notation) vs `'…'` (brut).
- **recipes** ✓ : `chop(n)`, `slice(n,"<…>")`, `splice`, `fit()`, `.cut(1)` (découpe de
  breaks) ; `layer(x=>…)` & empilement `s("a, b:0:.5")` ; `clip`/`release`/`decay`/`end`/
  `loop`/`loopEnd` (durées) ; exemple `samples('github:yaxu/clean-breaks')`.
- **faq** ✓ (la mine d'or) : `$:` (pistes parallèles), **pistes nommées** (`cello$:`),
  **mute** par `_` (`_$:`, `_cello$:`), `all(f)` (bus master), `mask("<0!24 1!40>")`
  (arrangement), `pick`/`pickRestart`, `const` réutilisables, **export audio** (onglet
  export, OBS, capture DAW), MIDI/OSC, cheat-sheet des symboles.
- **technical-manual/repl** ✓ : le scheduler interroge le pattern par cycle (confirme le
  fil rouge M5) ; transpilation des `$:`.
- **stepwise** ✓ (⚠️ *experimental*) : `pace`, `grow`/`shrink`, `expand`/`contract`,
  `take`/`drop`, `zip`/`tour` — gardés en **bonus léger** (susceptibles de changer).

---

## 🧠 Décisions de contenu (le « pourquoi »)

- **Un fil rouge concret** (« d'une boucle à un morceau ») pour un module qui est, par
  nature, du « méta » (organiser ce qu'on sait déjà). Chaque chapitre est une étape du
  passage boucle → morceau : empiler → factoriser → arranger → sculpter → finir.
- **Le workflow live d'abord** (Ch.1) : `$:`/nom/`_`/`all` sont les gestes qu'on répète
  des centaines de fois en live coding. Les ancrer tôt rend tout le reste plus fluide.
- **Strudel n'est pas un DAW** (assumé, cf. FAQ) : on arrange par **règles**
  (`arrange`/`mask`/`pick`), pas par glisser-déposer. Présenté comme une **force** (du
  code lisible, partageable, reproductible), pas comme un manque.
- **`const` = soulagement cognitif** : explicitement relié au TDA — moins de recopie,
  moins d'erreurs, plus de place mentale pour la musique.
- **L'export rassure** : un débutant veut **garder** ce qu'il fait. L'onglet export + le
  partage d'URL transforment un patch éphémère en quelque chose à soi.
- **Le projet final réunit les 6 modules** : batterie 909 (M1) + gamme/accords (M2) +
  basse `gm_*` (M3) + filtre/réverb (M4) + `off`/signal/`degrade` (M5) + le tout en
  `const` + stack nommé + `_` + `all(when…)` (M6). Preuve vivante que tout se combine, et
  clôture symbolique du parcours (« tu as les clés — Keymaker ! »).
- **Ids module-séquentiels `6.1→6.25`** (comme M2-M5). L'app navigue par coordonnées
  `{m,c,f}`, jamais par id → unicité **par module** suffit.

---

## 🛠️ Build & livraison — pipeline sandbox (contourne le pont fichiers)

Le piège récurrent du projet (le **pont fichiers Cowork ↔ sandbox sert un cache
périmé** après une écriture via l'outil d'édition) a été contourné par construction :

- **Rédaction + validation du contenu en sandbox** : Module 6 écrit dans `/tmp/m6.mjs`
  (heredoc bash quoté → frais côté sandbox, UTF-8 préservé), `node --check` + **test
  structurel (294/295**, 1 faux négatif d'échappement JSON) **avant** intégration.
- **Intégration via python sur le mont** : insertion du bloc M6 avant le commentaire
  « Tous les modules » + `modules` passé à `[m1..m6]`. Édition **bash sur le mont** →
  rafraîchit le cache → `node --check` + **test d'intégrité 19/19** lus frais.
- **Build dans `/tmp/kbuild6`** (`node_modules`/`public` symlinkés au mont, **binaires
  natifs Linux** `@esbuild/linux-x64` + `@rollup/rollup-linux-x64-gnu` présents) :
  `vite build` propre, **3,02 s**. (Un `/tmp/build` d'une session précédente était
  pollué par des fichiers non supprimables → répertoire neuf.)
- **Livraison `dist/` par copie** sur le mont : `index.html`, `sw.js`, `workbox`,
  `manifest`, `registerSW`, `assets/*` recopiés (**pas de suppression** requise → l'ancien
  bundle C12 reste en orphelin, non référencé). `vendor/`+`icons/` inchangés, laissés en
  place.

---

## 🧪 Vérifications (toutes vertes)

- **Build** : `vite build` propre, **34 modules**, bundle `index-0lEGc-u1.js` (338,21 kB,
  +27,6 kB vs C12 = le contenu M6) + CSS **inchangée** (`index-Dh5zhh25.css`, aucune modif
  de style) + **PWA régénérée** (`sw.js` + `workbox-9c191d2f.js`, precache 11 entrées vers
  le nouveau bundle).
- **Données + navigation** (`node`, reproduction de `buildFlat`) : **19/19** —
  `modules=[m1..m6]`, **M1-M5 intacts** (bornes 1.1 / 2.1→2.25 / 3.1→3.25 / 4.1→4.25 /
  5.1→5.25), M6 = 5 ch / 25 flashs, ids `6.1→6.25` ordonnés, `FLATS` = [26,25,25,25,25,25]
  = **151**, reprise `{m:5,c:4,f:4}`→6.25, **pas de « module suivant » sur M6** (dernier).
- **Structure du contenu** (`node`, import de `/tmp/m6.mjs`) : **294/295** — 5 chapitres,
  25 flashs, champs requis typés, `decode` en paires, `theory` (10) bien formées, **5
  récaps** (largeur colonnes = lignes) + **5 free**, dernier flash de chaque chapitre =
  recap+free. (L'unique « échec » = sentinelle `scale("C:minor")` faux-négativée par
  l'échappement JSON ; présence confirmée sur le fichier brut : 4 occurrences.)
- **Sentinelles** dans le bundle **livré** sur le mont : `Composition & Projets`, `Le
  studio dans le navigateur`, `Réutiliser : variables`, `Arranger dans le temps`, `La
  matière d'un track`, `Finir, jouer, partager`, `Tout Keymaker, un morceau complet`,
  `register(`, `arrange(`, `samples(`, `chop(`, `.slice(`, `mask(`, `.pick(`, `_lead$:`,
  `6.25`, `D'une boucle à un morceau` ; M1-M5 intacts (`Le morceau final`, `Informatique
  Musicale`, `Connexion Guitare`, `Solfège`) ; `index.html` & `sw.js` → `index-0lEGc-u1.js`
  (ancien bundle **non référencé**).
- **`App.jsx`** confirmé **générique** (aucun nombre de modules en dur) → le Module 6
  apparaît seul (sélecteur, onglets, reprise, et fin de parcours sans « module suivant »).

---

## 🏁 État & reste à faire

- [x] Module 6 : 5 ch / 25 flashs, format identique à M1-M5, Strudel vérifié en direct,
      fil rouge « d'une boucle à un morceau », ponts permanents, projet final des 6 modules.
- [x] Intégré (`modules=[m1..m6]`), navigation OK pour 6 modules (aucune modif `App.jsx`).
- [x] Build propre (34 modules) + `dist/` livré (bundle + PWA). Tests **19/19** + **294/295**
      + sentinelles.
- [x] Docs en cohérence (README 6 modules / 151 flashs · roadmap Chantier 13 · référence
      §13 · ce brief).
- [~] **Valider les 25 codes Strudel du Module 6 à l'oreille** avec Felix (fonctions
      vérifiées contre la doc ; reste l'écoute musicale — surtout 6.17-6.18 chop/slice du
      break, 6.19 layer, 6.25 projet final). Même étape que pour M3/M4/M5.

---

## 🔮 Et après ?

**Le curriculum de contenu est COMPLET** : les 6 modules prévus à l'architecture sont
livrés (151 flashs). Pistes futures, **hors curriculum** :

- **Valider M3, M4, M5 et M6 à l'oreille** avec Felix (codes vérifiés contre la doc, pas
  encore tous écoutés) — la dernière dette pédagogique du projet.
- **Offline complet** : bundler les samples (kit de base) dans le cache PWA pour un live
  sans réseau garanti (aujourd'hui : téléchargement réseau au 1er usage).
- (optionnel) câblage app → `session_id` pour relier le journal de Sati et les sessions.
- (optionnel) polish UX : page d'accueil « parcours terminé », badges, ou un module
  « bac à sable » libre.

---

*Brief écrit le 6 juin 2026 (chantier réalisé en autonomie). Source ↔ build ↔ docs en phase. Curriculum Keymaker complet : 6 modules, 151 flashs.*
