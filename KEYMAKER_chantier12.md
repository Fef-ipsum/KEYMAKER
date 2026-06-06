# Keymaker — Chantier 12 : Module 5 « Informatique Musicale »

> Réalisé **en autonomie** le 6 juin 2026, sur « continue le prochain chantier ».
> 5ᵉ module de contenu — le dernier avant le Module 6 (Composition). Conçu, codé,
> buildé, testé, livré et documenté d'un bout à l'autre.

---

## 🎯 Objectif

Donner à Keymaker son **5ᵉ module : Informatique Musicale** — la face *programmation*
du live coding, enseignée *à travers* Strudel comme les modules précédents (chaque
concept immédiatement audible). C'était la piste listée pour le Module 5 dans
`KEYMAKER_architecture.md` (« programmation fonctionnelle, TidalCycles vs Strudel, MIDI »),
adaptée à la pédagogie du projet : **tout est audible, rien n'est abstrait**.

**Fil rouge : « un pattern est une fonction du temps ».** On fait passer Felix
d'« écrire des notes » à **« écrire des règles qui génèrent des notes »**. C'est le
saut mental qui débloque tout le reste de Strudel.

---

## ✅ Ce qui est livré

**Module 5 : 5 chapitres, 25 flashs (`5.1` → `5.25`).** Même format de flash que
M1-M4 (id, kicker, title, concept, code, decode?, theory?, exercise, recap?, free?).

- **Ch.1 — Le pattern est une fonction** (5.1→5.5) : un pattern = fonction du temps
  (le moteur l'« interroge » à chaque cycle) ; une transformation = fonction qui prend
  un pattern (`.rev()`, `.fast()`…) ; les fabriques `seq`/`stack`/`cat` (jumelles
  fonctionnelles de la mini-notation) ; `run(n)` génère les nombres.
- **Ch.2 — Manipuler le temps** (5.6→5.10) : `slow`/`fast` (= `/` `*`), `rev` &
  `palindrome`, `iter` (la boucle qui tourne), `ply` (répète chaque coup ≠ `fast`).
- **Ch.3 — Le hasard maîtrisé** (5.11→5.15) : les signaux (`rand`/`irand`/`sine`/`perlin`
  + `.segment()`/`.range()`) ; **le hasard est déterministe** (graine) → `ribbon(seed,len)`
  pour *pêcher* puis figer un fragment ; `choose`/`wchoose` ; `degrade`/`?` ;
  `sometimes`/`often`/`rarely`.
- **Ch.4 — Accumulation & calques** (5.16→5.20) : `superimpose`/`layer` (harmonie auto),
  `off` (canon/écho décalé + transformé), `echo` (rebonds qui s'éteignent), `jux` (stéréo
  par fonction). Faire **beaucoup à partir de peu**.
- **Ch.5 — L'héritage & le grand tableau** (5.21→5.25) : TidalCycles ↔ Strudel & la
  programmation fonctionnelle ; `firstOf`/`lastOf`/`chunk` (arranger dans le temps) ;
  **sortie MIDI** (`.midi()`, Web MIDI) ; et un **morceau génératif final qui réunit les
  5 modules** (batterie M1 + grille M2 + basse M3 + son sculpté M4 + outils génératifs M5).

5 récaps (1 par chapitre) + 5 exercices libres de clôture. Ponts explicites (M1)/(M2)/(M3)/(M4) partout.

**Intégration — zéro changement de code de navigation :** `lessons.js` exporte
`m5chapitre1…5`, `module5`, et `modules = [module1, module2, module3, module4, module5]`.
La navigation multi-modules du **Chantier 7** (`FLATS = modules.map(buildFlat)`,
`modules.length - 1`, sélecteur de module, reprise `{m,c,f}`, bouton « Module suivant »)
prend en charge un 5ᵉ module **sans aucune modification d'`App.jsx`** — vérifié
(grep : `modules.map`, `modules.length - 1`, onglets dynamiques `modules.map`).

---

## 🔎 Vérifié AVANT de coder (Strudel réel — strudel.cc, juin 2026)

Cutoff Claude = mai 2025 → toutes les fonctions du module **vérifiées en direct** sur
`strudel.cc/learn` (Astro v5.1.9), pages distillées dans `KEYMAKER_strudel_reference.md` §12 :

- **factories** ✓ : `seq`/`fastcat`, `stack`/`pr`, `cat`/`slowcat`, `stepcat`, `arrange`,
  `polymeter`/`pm`, `run`, `binary`/`binaryN`, `silence`.
- **time-modifiers** ✓ : `slow`/`fast`, `rev`, `palindrome`, `iter`/`iterBack`, `ply`,
  `segment`, `early`/`late`, `swing`/`swingBy`, `zoom`, `linger`, `ribbon`, `inside`/`outside`.
- **signals** ✓ : `sine`/`cosine`/`saw`/`tri`/`square` (+ `…2`), `rand`, `perlin`,
  `irand(n)`, `brand`/`brandBy`, `mouseX`/`mouseY` ; `.segment(n)` + `.range(a,b)`.
- **random-modifiers** ✓ : `choose`/`wchoose`, `chooseCycles`/`randcat`, `degrade`/`degradeBy`,
  `sometimes`/`sometimesBy`, `often`/`rarely`/`almostAlways`/`almostNever`, `someCycles`.
- **conditional-modifiers** ✓ : `firstOf`/`lastOf`, `when`, `chunk`/`chunkBack`, `arp`,
  `struct`, `mask`, `hush`, `invert`, `pick`/`pickF`, `inhabit`, `squeeze`.
- **accumulation** ✓ : `superimpose`, `layer`, `off(t,f)`, `echo(times,time,fb)`, `echoWith`,
  `stut` (déprécié). Signatures confirmées (ordre des params).
- **input-output** ✓ : `.midi("nom")` (Web MIDI sans logiciel), `midin`/`midikeys`,
  `progNum`/`control`/`ccn`/`ccv`/`midimaps`, `.osc()` (SuperCollider), MQTT.
- **technical-manual/patterns** ✓ : confirme le fil rouge — « patterns … represent flows of
  time as functions … pure functional reactive programming » → *querying* par cycle.

---

## 🧠 Décisions de contenu (le « pourquoi »)

- **Un seul fil rouge fort** (« pattern = fonction du temps ») pour ancrer un module qui
  pourrait être très abstrait. Chaque chapitre y revient. TDA-friendly : une grande idée,
  déclinée en petits gestes audibles.
- **Tout audible** : pas de Haskell théorique. La « programmation fonctionnelle » s'entend
  (rev retourne, iter tourne, degrade troue, off répond). Les mots techniques arrivent après l'oreille.
- **Le hasard déterministe** comme révélation centrale (Ch.3) : c'est le moment « aha » de
  l'informatique musicale — le chaos est dirigeable, reproductible, donc compositionnel.
- **Beaucoup à partir de peu** (Ch.4) : pédagogiquement, montrer qu'une ligne minuscule
  devient un arrangement renforce le sens du code « génératif ».
- **Le MIDI sans casser l'audible** : `.midi()` couperait le son interne → la leçon garde
  `.s(...)` pour entendre, et présente `.midi(...)` en variante (décodage + exercice).
- **Morceau final = synthèse des 5 modules** : clôture du parcours de contenu, et preuve
  vivante que tout se combine.
- **Ids module-séquentiels `5.1→5.25`** (comme M2/M3/M4). Volontairement pas globalement
  uniques : l'app navigue par coordonnées `{m,c,f}`, jamais par id.

---

## 🛠️ Build & livraison — sur Windows (contourne le pont fichiers)

Le piège récurrent du projet (le **pont sandbox sert un cache périmé** après une écriture
via l'outil d'édition ; le `node_modules` du mont est **Windows-only**, sans binaires Linux)
a été **contourné par construction** ce chantier :

- **Rédaction + validation du contenu en sandbox** : Module 5 écrit dans `/tmp/m5.js`
  (heredoc bash → frais côté sandbox), `node --check` + test structurel (29 checks) **avant**
  toute intégration.
- **Intégration via bash/python sur le mont** : `python3` insère le bloc M5 avant le
  commentaire « Tous les modules » et passe `modules` à `[m1..m5]`. Une **écriture bash sur
  le mont rafraîchit le cache** → le fichier réel (= côté Windows) est à jour immédiatement.
- **Build côté Windows** (`npm run build` via PowerShell) : `node_modules` natif Windows
  + fichier réel frais → **aucun des deux pièges sandbox**. `vite build` **propre, 742 ms**.
- **`dist/` écrit directement** sur le dossier réel par vite → **pas de recopie manuelle,
  pas de bundle orphelin** (contrairement à C9/C10 où `rm` était interdit sur le mont).

---

## 🧪 Vérifications (toutes vertes)

- **Build** : `vite build` propre, **34 modules**, bundle `index-bdjVqxxa.js` (310,63 kB,
  +25 kB vs C11 = le contenu M5) + CSS **inchangée** (`index-Dh5zhh25.css`, aucune modif de
  style) + **PWA régénérée** (`sw.js` + `workbox-9c191d2f.js`, precache 11 entrées vers le
  nouveau bundle).
- **Données + navigation** (`node`, reproduction fidèle de `buildFlat`/`findPosIn`) :
  **34/34** — `modules=[m1..m5]`, **M1-M4 intacts** (premiers ids 1.1/2.1/3.1/4.1,
  derniers 2.25/3.25/4.25), M5 = 5 ch / 25 flashs, ids `5.1→5.25` ordonnés, champs requis
  typés, decode/theory bien formés, **5 récaps** (largeur colonnes = lignes) + **5 free**,
  ids uniques **par module**, `FLATS` = [26,25,25,25,25] = **126**, M5 pos0=5.1 / pos5=5.6
  (Suivant traverse les chapitres) / pos24=5.25, reprise `{m:4,c:4,f:4}`→5.25, **pas de
  « module suivant » sur M5** (dernier), crumbs ch1/ch5 corrects, `flash11` rétro-compat OK.
- **Sentinelles** dans le bundle **livré** : `Informatique Musicale`, `Le pattern est une
  fonction`, `Manipuler le temps`, `Le hasard maîtrisé`, `Accumulation & calques`,
  `Tout Keymaker`, `degradeBy`, `superimpose`, `ribbon`, `voicing`, `5.25` ; `index.html` &
  `sw.js` → `index-bdjVqxxa.js`.
- **`App.jsx`** confirmé **générique** (aucun nombre de modules en dur) → le Module 5
  apparaît seul (sélecteur, onglets, « module suivant », reprise).

---

## 🏁 État & reste à faire

- [x] Module 5 : 5 ch / 25 flashs, format identique à M1-M4, Strudel vérifié en direct,
      fil rouge « pattern = fonction du temps », ponts permanents, morceau génératif final.
- [x] Intégré (`modules=[m1..m5]`), navigation OK pour 5 modules (aucune modif `App.jsx`).
- [x] Build propre (34 modules) + `dist/` livré (bundle + PWA). Tests **34/34** + sentinelles.
- [x] Docs en cohérence (README 5 modules / 126 flashs · roadmap · ce brief · référence §12).
- [~] **Valider les 25 codes Strudel du Module 5 à l'oreille** avec Felix (fonctions
      vérifiées contre la doc ; reste l'écoute musicale — surtout 5.12 ribbon/graine,
      5.16-5.17 superimpose/off (harmonie de gamme), 5.24 voicing, 5.25 morceau génératif).
      Même étape que pour M3 et M4.

---

## 🔮 Et après ?

- **Valider M3, M4 et M5 à l'oreille** avec Felix (codes vérifiés contre la doc, pas encore
  tous écoutés).
- **Module 6 — Composition & Projets** : le dernier module du curriculum (tracks complètes,
  layering, arrangement, export, live sets) — même méthode et format.
- (optionnel) câblage app → `session_id` pour relier le journal de Sati et les sessions.

---

*Brief écrit le 6 juin 2026 (chantier réalisé en autonomie). Source ↔ build ↔ docs en phase.*
