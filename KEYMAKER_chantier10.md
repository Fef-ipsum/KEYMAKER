# Keymaker — Chantier 10 : Module 4 « Son & Effets »

> Réalisé **en autonomie** le 6 juin 2026 (Felix a lancé le chantier puis est parti se coucher :
> « vas aussi loin que tu peux »). Module conçu, codé, buildé, testé, livré et documenté d'un bout à l'autre.

---

## 🎯 Objectif

Donner à Keymaker son **4ᵉ module de contenu : Son & Effets** — la **synthèse sonore** et le **traitement
du signal**, enseignés *à travers* Strudel comme les modules précédents (chaque concept immédiatement
audible). Le fil rouge : la **chaîne du signal**, une étape par chapitre.
C'était la 1ʳᵉ piste listée pour les Modules 4-6 (`KEYMAKER_architecture.md`) et le complément naturel
de M1-M3 : après le rythme (M1), l'harmonie (M2) et la guitare (M3), **le son lui-même**.

---

## ✅ Ce qui est livré

**Module 4 : 5 chapitres, 25 flashs (`4.1` → `4.25`).** Même format de flash que M1/M2/M3
(id, kicker, title, concept, code, decode?, theory?, exercise, recap?, free?).

- **Ch.1 — La source** (4.1→4.5) : la chaîne du son, les 4 ondes (sine/triangle/square/sawtooth),
  les harmoniques & le timbre, le bruit (white/pink/brown), mélanger les sources ($:).
- **Ch.2 — Le filtre** (4.6→4.10) : passe-bas (lpf) + résonance (lpq), passe-haut/bande (hpf/bpf),
  le filtre qui balaye (LFO `sine.range().segment()` + le piège du signal figé), filtrer un groove.
- **Ch.3 — L'enveloppe** (4.11→4.15) : ADSR, attaque/relâche (nappe vs pluck), déclin/maintien
  (le maintien sous 1), l'enveloppe de filtre (lpenv + lpa/lpd/lps/lpr), façonner une basse acid.
- **Ch.4 — L'espace** (4.16→4.20) : la réverb (room/roomsize/rlp), le délai (delay/delaytime/
  delayfeedback), caler le délai sur le tempo (croche pointée — pont M3), les orbits.
- **Ch.5 — La couleur & le mix** (4.21→4.25) : saturation (distort/crush/coarse), modulation
  (phaser/vib), dynamique & stéréo (gain/pan/jux), l'ordre fixe de la chaîne du signal, et un
  **morceau final qui réunit les 4 modules** (batterie M1 + grille M2 + guitare M3 + son façonné M4).

5 récaps (1 par chapitre) + 5 exercices libres de clôture. Ponts explicites (M1)/(M2)/(M3) partout.

**Intégration — zéro changement de code de navigation :** `lessons.js` exporte `m4chapitre1…5`,
`module4`, et `modules = [module1, module2, module3, module4]`. La navigation multi-modules du
**Chantier 7** (`FLATS = modules.map(buildFlat)`, sélecteur de module, reprise `{m,c,f}`, bouton
« Module suivant ») prend en charge un 4ᵉ module **sans aucune modification d'`App.jsx`** — vérifié.

---

## 🔎 Vérifié AVANT de coder (Strudel réel — strudel.cc, juin 2026)

Cutoff Claude = mai 2025 → toutes les fonctions audio **vérifiées en direct** sur
`strudel.cc/learn/effects` et `/synths` (Astro v5.1.9). La référence du projet
`KEYMAKER_strudel_reference.md` §6/§7 (distillée le 5 juin) couvrait déjà l'essentiel — elle a servi
de base, recoupée par la doc live :

- **Ondes** ✓ : `sine`, `sawtooth`, `square`, `triangle` via `.s()` ; défaut d'une `note()` = triangle.
- **Bruit** ✓ : `white`, `pink`, `brown` (dur→doux).
- **Filtres** ✓ : `lpf` (cutoff/ctf), `lpq` (resonance), `hpf`, `bpf`, `bpq` ; cutoff + facteur Q.
- **Enveloppe d'ampli** ✓ : `attack`/`decay`/`sustain`/`release` + `adsr("a:d:s:r")` ; le déclin n'est
  audible que si sustain < 1.
- **Enveloppe de filtre** ✓ : `lpenv` (profondeur) + `lpa`/`lpd`/`lps`/`lpr`.
- **Espace** ✓ : `room`/`roomsize`(sz)/`rlp`, `delay`/`delaytime`(dt)/`delayfeedback`(dfb), `orbit`
  (réverb & délai **partagés par orbit** → `.orbit(n)` pour séparer).
- **Couleur** ✓ : `distort("amt:postgain")`, `crush` (1 brutal → 16 propre), `coarse`, `pan`, `jux(rev)`.
- **Modulation** ✓ : `phaser` (« approximates popular guitar pedals »), `vib("freq:depth")`.
- **Piège LFO confirmé** : un signal (`sine.range(...)`) n'est lu **qu'au déclenchement d'une note** →
  pour un balayage continu il faut multiplier les événements (`.segment(16)` ou `note("x*16")`).

---

## 🧠 Décisions de contenu (le « pourquoi »)

- **Suivre la chaîne du signal** comme fil pédagogique : source → filtre → enveloppe → espace → couleur.
  Chaque chapitre = un maillon, donc une progression mentale claire (TDA-friendly).
- **Synthés plutôt que samples** pour l'essentiel : on **entend** ce qu'on sculpte (un saw filtré dit
  tout ; un sample masquerait l'effet). Le bruit sert à montrer une source sans hauteur.
- **Tout est audible, rien d'abstrait** : la résonance « chante », le filtre « balaye », le pluck
  « tombe », la disto « salit ». Les mots techniques arrivent après l'oreille.
- **Ponts permanents** : kick/pluck = enveloppe (M1), harmoniques = intervalles (M2), délai pointé &
  phaser & disto = gestes/pédales de guitariste (M3). Le **morceau final** empile les 4 modules.
- **Ids module-séquentiels `4.1→4.25`** (comme M2/M3). Volontairement pas globalement uniques (M1 est en
  `chapitre.flash`) : sans effet, l'app navigue par coordonnées `{m,c,f}`, jamais par id.

---

## 🛠️ Build & livraison — sous un pont fichiers capricieux

Le piège récurrent du projet a pris un **nouveau visage** ce jour :

- Après les éditions de `lessons.js` (via l'outil d'écriture, fiable côté Windows), le **mount sandbox a
  servi un cache PÉRIMÉ** : `wc -l` = 2305 lignes au lieu de 3058, et `node --check` d'une copie échouait
  (`Unexpected end of input`). **Mais** les fichiers **non édités**, même volumineux (`vendor` 2,4 Mo),
  se lisaient parfaitement → ce **n'est pas un plafond d'octets**, c'est un **cache en retard sur les
  fichiers fraîchement écrits**.
- **Parade build** : `git archive HEAD keymaker-app | tar -x` dans `/tmp` (arbre committé byte-perfect,
  **sans passer par le pont**) ; seul `lessons.js` (le fichier modifié) reconstruit dans `/tmp` =
  `git show HEAD:…lessons.js | head -2295` (préfixe M1-M3 byte-perfect) **+** Module 4 en heredoc ;
  le tout **vérifié par node** (4 modules / 101 flashs / ids 4.1→4.25) avant de builder.
- **node_modules Windows ≠ Linux** : le `node_modules` du mont (installé sous Windows) n'a pas les
  binaires natifs Linux → `vite build` plante (`@esbuild/linux-x64` puis `@rollup/rollup-linux-x64-gnu`
  introuvables). Récupérés via npm (le registre répond pour un paquet isolé) aux **mêmes versions** que
  le mont (`esbuild 0.25.12`, `rollup 4.61.1`) et copiés dans le `node_modules` du mont (gitignoré,
  inertes sous Windows). `vite build` alors **propre : 34 modules, 2 s**.
- **Parade commit** : une **écriture bash** d'un fichier sur le mont **rafraîchit son cache**. `cp` du
  `lessons.js` reconstruit (`/tmp` → mont) a fait réapparaître 3058 lignes (vérifié `wc -l` + import
  node) → **source ↔ build garantis identiques**, et git committe la bonne version.
- **Livraison `dist/`** : recopié sur le mont **sans suppression** (rm interdit sur le mont) → les
  anciens bundles hashés (`index-CekULCjI.js`, `index-NqFEHDkR.js`) restent en **orphelins
  inoffensifs** ; `index.html` + `sw.js` pointent sur le nouveau `index-oQUh9Mac.js`. Vendor inchangé.

---

## 🧪 Vérifications (toutes vertes)

- **Build** : `vite build` propre, **34 modules**, bundle `index-oQUh9Mac.js` (285 kB) + CSS inchangée
  (`index-BXVl0h6z.css`) + **PWA régénérée** (`sw.js` + `workbox-9c191d2f.js`, precache 11 entrées
  référençant le nouveau bundle).
- **Intégrité des données** (`test-data`) : **86/86** — `modules=[m1,m2,m3,m4]`, M1 intact (26), M2 (25),
  M3 (25), M4 = 5 ch / 25 flashs, ids `4.1→4.25` ordonnés, champs typés, decode/theory bien formés,
  5 récaps (3 colonnes, lignes alignées) + 5 exercices libres, ids uniques **par module**, flash11
  rétro-compat OK.
- **Navigation** (`test-nav`, reproduction fidèle de `buildFlat`/`findPosIn`) : **14/14** — `FLATS`
  = [26,25,25,25], M4 pos0=4.1 / pos4=4.5 / pos5=4.6 (Suivant traverse les chapitres) / pos24=4.25,
  reprise `{m:3,c:4,f:4}`→4.25, bouton « Module suivant » faux sur M4 (dernier), crumb « La source »
  / « La couleur & le mix », 4 onglets de module au Parcours.
- **Sentinelles** dans le bundle **livré sur le mont** : `Son & Effets`, `La couleur & le mix`,
  `Le morceau final`, `lpenv`, `phaser`, `4.25` ; `index.html` & `sw.js` → `index-oQUh9Mac.js` ;
  vendor complet (2 400 462 o).
- **`App.jsx`** confirmé **générique** (aucun nombre de modules en dur) → le Module 4 apparaît seul.

---

## 🏁 État & reste à faire

- [x] Module 4 : 5 ch / 25 flashs, format identique à M1-M3, Strudel vérifié en direct, ponts permanents.
- [x] Intégré (`modules=[m1,m2,m3,m4]`), navigation OK pour 4 modules (aucune modif `App.jsx`).
- [x] Build propre (34 modules) + `dist/` livré (bundle + PWA). Tests **86/86** + **14/14** + sentinelles.
- [x] Docs en cohérence (README 4 modules / 101 flashs · roadmap · ce brief · référence Strudel §9).
- [~] **Valider les 25 codes Strudel du Module 4 à l'oreille** avec Felix (les fonctions sont vérifiées
  contre la doc ; reste l'écoute musicale — surtout 4.9 balayage, 4.15 basse acid, 4.20 mix multi-orbits,
  4.25 morceau final). Même étape que pour M3.

---

## 🔮 Et après ?

- **Valider M3 et M4 à l'oreille** avec Felix (les deux modules ont des codes vérifiés contre la doc,
  pas encore tous écoutés).
- **Thème Matrix** (3ᵉ thème, vert) — suite naturelle du Chantier 8, petit & autonome.
- **Module 5 — Informatique Musicale** · **Module 6 — Composition & Projets** (mêmes méthode et format).
- (optionnel) câblage app → `session_id` pour relier le journal de Sati et les sessions.

---

*Brief écrit le 6 juin 2026 (chantier réalisé en autonomie). Source ↔ build ↔ docs en phase.*
