# Keymaker — Chantier 7 : Module 2 (Solfège) + navigation multi-modules

> Brief de chantier. Réalisé **en autonomie** (Felix absent) le 4 juin 2026.
> Format identique aux chantiers précédents. À relire avec `KEYMAKER_roadmap.md`.

---

## 🎯 Objectif

Donner à Keymaker son **2ᵉ module de contenu** — le **solfège**, le cœur de l'usage pour Felix
(guitariste qui veut apprendre la théorie) — et le **câblage de navigation** pour passer
d'« un module » à « plusieurs modules ».

**Pourquoi celui-ci et pas la suite du Chantier 5 (tranche 3, embeddings Voyage) ?**
La tranche 3 touche le **backend sur le Pi**, que le sandbox ne peut pas atteindre
(Tailscale/HTTPS, pas de SSH → l'édition backend se fait côté Felix). Le Module 2 est, lui,
100 % frontend + contenu : entièrement réalisable et vérifiable **en autonomie**, et c'est la
plus grande valeur d'usage immédiate.

---

## ✅ Ce qui est livré

### Contenu — Module 2 « Solfège & Théorie musicale » : 5 chapitres, 25 flashs

Le solfège enseigné **À TRAVERS Strudel** (chaque concept est immédiatement audible), avec un
pont permanent vers la **guitare**. Même format de flash que le Module 1.

- **Ch.1 — Les 12 notes** : hauteur (pitch), alphabet A–G, demi-ton/ton, dièses/bémols & enharmonie, octave. (5 flashs, 2.1→2.5)
- **Ch.2 — Les intervalles** : distance en demi-tons, `.add()`, tierce majeure/mineure (joyeux/triste), quinte juste/power chord, tableau consonance↔dissonance. (2.6→2.10)
- **Ch.3 — Les gammes** : majeure (T-T-S-T-T-T-S), degrés `n()+scale()`, mineure naturelle, relative mineure, pentatonique. (2.11→2.15)
- **Ch.4 — Les accords** : empiler des tierces, 4 triades (0,4,7 / 0,3,7 / 0,3,6 / 0,4,8), les 7 accords d'une gamme, cadence I-IV-V, `chord().voicing()`. (2.16→2.20)
- **Ch.5 — La tonalité** : tonalité, armures, cycle des quintes, transposer (capo), bilan M1+M2. (2.21→2.25)

### Navigation multi-modules (`App.jsx`)

- `modules = [module1, module2]` ; une liste plate **par module** (`FLATS`).
- Reprise étendue à `{m,c,f}` (clé `keymaker:pos`), avec **migration auto** des anciennes clés
  (`keymaker:m1:pos` `{c,f}` et `keymaker:ch1:flashIndex`) → `m:0`. La progression Module 1 de Felix est **préservée**.
- **Sélecteur de module dans le Parcours** : onglets Module 1 / Module 2 (avec un point « ici »
  sur le module en cours de lecture). On peut feuilleter un module sans quitter le flash courant ;
  un clic sur un flash y navigue (module + position d'un coup).
- Fil d'Ariane, footer, contexte Sati, message de fin = **dynamiques** (module courant).
- À la fin d'un module : bouton **« Module N+1 ▶ »** pour enchaîner.
- Invariant respecté : **une seule instance d'éditeur**, jamais recréée (overlays par-dessus, comme Parcours/Sati).

---

## 🔎 Vérifié AVANT de coder (Strudel réel — strudel.cc, juin 2026)

Cutoff Claude = mai 2025 → vérification **en direct** des fonctions de théorie musicale :

- `note()` lettres/MIDI, octaves, `#`/`b` ✓ (`/learn/notes`)
- `n("…").scale("C:major")` ; types tonaljs ; espaces → `:` (`C:major:pentatonic`) ; gamme patternée `<C:major A:minor>` ✓ (`/learn/tonal`)
- `.add()` pour transposer — **structure prise sur l'opérande de gauche** → motif multi-pas à GAUCHE, scalaire à droite (`note("0 4 7".add("60"))`) ✓ (`/understand/voicings`)
- **triades vérifiées** : majeur `0,4,7` · mineur `0,3,7` · diminué `0,3,6` · augmenté `0,4,8` ✓
- `chord("<C Am F G>").voicing()` + symboles (`C`, `Cm`, `C7`, `C^7`, `Co`) ✓
- `.room()`, `.lpf()`, `.gain()`, `.sound("sawtooth"/"triangle")` ✓

---

## ⚠️ Piège majeur (encore) : pont fichiers Cowork ↔ sandbox

Ce coup-ci, la **lecture *mount*** a servi des versions **tronquées/figées** des gros fichiers —
pas seulement ceux édités cette session : `lessons.js` (657 l. au lieu de 1494), `App.jsx` (652/748),
`Settings.jsx` (213/300, **non édité ce chantier !**), `styles.css` (1209/1258). Symptôme : un `cp`
depuis le mount donne des fichiers coupés → build cassé / régression silencieuse.

- **Les fichiers autoritatifs (outils Read / Write / Edit / Grep) sont, eux, COMPLETS et corrects** —
  c'est seulement la **lecture du mount sandbox** qui plafonne. (Confirmé : `grep` autoritatif voit les 5 `m2chapitre`, `modules`, `flash11`.)
- **Parade appliquée** : reconstruire les 4 fichiers dans `/tmp/km7` depuis le **contenu autoritaire**
  (préfixe intact `head -655` pour `lessons.js` + bloc Module 2 ; heredoc complet pour App/Settings/styles),
  `npm install`, `vite build` là, puis recopier `dist/` (l'écriture **sandbox → mount n'est PAS tronquée** :
  tailles `dist/` byte-identiques, vérifié).
- **À retenir** : ne JAMAIS `cp` un gros fichier depuis le mount sans vérifier `wc -l` contre l'autoritatif.
  Au moindre doute, **reconstruire en `/tmp`**.

---

## 🧪 Vérifications (toutes vertes)

- **Build** : `vite build` propre, **34 modules**, 0 erreur, `dist/` régénéré (bundle `index-DPYjesl_.js`), PWA OK.
- **Intégrité des données** (`test-data.mjs`, ESM) : **16/16** — `modules=[m1,m2]`, M1 intact (26 flashs),
  M2 = 5 ch / 25 flashs, ids `2.1→2.25`, champs bien typés, 5 recaps + 5 exercices libres, recap aligné
  sur les colonnes, `buildFlat(m2)=25`, `findPos` inter-chapitres.
- **Montage runtime jsdom** (`test-mount.mjs`, esbuild + jsdom, React partagé) : **13/13** — montage M1/Flash 1.1,
  ouverture Parcours, 2 onglets, bascule Module 2, flash 2.1 listé puis sélectionné → crumb « Module 2 · Flash 2.1 »
  + titre, Parcours refermé, reprise `m:1`, « Suivant » 2.1→2.2, retour Module 1.
- **Sentinelles** dans le bundle livré : contenus Module 2 + `learn-modtab` présents ; `index.html` pointe sur le nouveau bundle.

---

## 🏁 Definition of Done (Chantier 7)

- [x] Module 2 : 5 chapitres, 25 flashs, format identique au M1, Strudel vérifié, ponts guitare.
- [x] Navigation multi-modules : sélecteur Parcours, reprise `{m,c,f}` + migration, crumb/footer/contexte/fin dynamiques, bouton « module suivant ».
- [x] Éditeur jamais recréé (invariant conservé).
- [x] Build propre + `dist/` livré (byte-identique). Tests **16/16** + **13/13**.
- [x] Roadmap + ce brief à jour.

---

## 👀 À revoir avec Felix (quand dispo)

- **Écoute** : les 25 codes Strudel sont valides syntaxiquement et vérifiés contre la doc, mais je n'ai
  pas pu les *entendre* (pas d'audio en sandbox). À tester à l'oreille — surtout les octaves des accords
  diatoniques (2.18) et le bilan multi-couches (2.25). *« Pas grave si je me trompe légèrement »* → Sati
  pourra corriger en live.
- **Scope** : Module 2 = **pitch / harmonie**. La **rythmique côté solfège** (valeurs de notes, mesures)
  n'y est pas — le M1 couvre déjà le rythme côté Strudel. Candidate à un Module 2-bis ou un chapitre ajouté.
- **« À propos »** : la ligne des Réglages dit désormais « live coding & solfège » (au lieu de « Module 1 »).

---

## 🔮 Et après ?

- **Chantier 5 tranche 3** (embeddings Voyage, journal) — backend Pi, **nécessite Felix** (SSH/édition du module sur le Pi).
- **Thème clair** — 2ᵉ thème CSS complet + bascule (reporté depuis le Chantier 6).
- **Modules 3 à 6** (guitare, audio/effets, informatique musicale, composition) — même méthode que le Module 2.

---

*Chantier réalisé en autonomie le 4 juin 2026. Prochaine session : valider à l'oreille + trancher la suite.*
