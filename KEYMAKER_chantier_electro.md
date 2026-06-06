# Keymaker — Chantier Electro (réalisé)

> Réalisé **en autonomie** le 6 juin 2026 (Opus). Brief de design : `KEYMAKER_chantier_electro_brief.md`.
> Principe : **l'électro n'est pas une destination, c'est le contexte par défaut.**

---

## 🎯 Objectif

Faire de la musique électronique le **fil rouge de tout le curriculum** (et plus un module isolé),
puis **couronner le parcours** par un Module 7 « Genres & Styles » : un vrai morceau complet par genre.

---

## ✅ Ce qui est livré

### 1. M1–M6 recolorés par genre (recoloriage ciblé, pas de réécriture)

Pour chaque module : **intro ancrée** + **bilan-clé recoloré** + **exercice libre final réorienté**.

| Module | Genre ancré | Geste de recoloriage principal |
|--------|-------------|-------------------------------|
| M1 | **Techno** | bilan en 132 BPM, 909 ; free = beat minimal + breakdown par mute |
| M2 | **Trance** | bilan en 140 BPM, accords de 7e en pad sawtooth, mélodie qui « monte » |
| M3 | **Industrial / EBM** | bilan en 128 BPM, power chords distordus (`gm_distortion_guitar`) calés sur le kick ; free = couper sur le 3 |
| M4 | **Acid / Psy-trance** | bilan en 145 BPM, basse acide `note("c2(3,8)")` + `lpenv` + `lpq(15)` (squelch 303) |
| M5 | **Ambient & D&B** | intro + free à deux directions : ambiance générative lente / breakbeat D&B |
| M6 | **House** | intro « morceau = histoire en 4 actes » ; free **bridgé vers le Module 7** |

### 2. Module 7 « Genres & Styles » — 5 chapitres, 25 flashs (7.1 → 7.25)

Fichier dédié **`src/module7.js`**, importé dans `lessons.js` (`modules = [module1..module7]`).
Un morceau complet par genre (anatomie → technique signature → projet) :

- **7.1 House** (7.1–7.5) : anatomie 4/4, groove/swing, vocal chop (`numbers`+`chop`), `arrange`, projet 2 min.
- **7.2 Techno** (7.6–7.10) : minimalisme, tension par filtre lent, breakdown/montée, **pump** (gain piloté par `saw`), set live.
- **7.3 Drum & Bass** (7.11–7.15) : half-time feel, breakbeat **amen** (`chop`/`iter`/`cut`), **reese** (saws désaccordés), projet intro→break.
- **7.4 Trance/Psy** (7.16–7.20) : rolling bass, **supersaw** (`superimpose`+detune), arc émotionnel + riser, acid psy, build 64 mesures.
- **7.5 Ambient** (7.21–7.25) : lenteur, drone/pad génératif, hasard maîtrisé en gamme, granularité (`chop` sur `space`), **pièce générative finale ≈ 5 min — le dernier flash de Keymaker.**

**Total curriculum : 176 flashs** (26 + 25 × 6).

---

## 🧠 Décisions (le « pourquoi »)

- **`module7.js` en fichier dédié** : le brief disait « `module7.js` importé dans `modules.js` », mais tout
  vivait dans un seul `lessons.js`. Réconcilié : fichier dédié importé dans `lessons.js` → honore l'intention
  sans gonfler le gros fichier. **`App.jsx` non touché** (il dérive tout du tableau `modules` → 7ᵉ carte,
  navigation, progression 176 flashs, « module suivant » jusqu'à M7, tout automatique).
- **Recoloriage ≠ réécriture** : seuls les 3 points d'ancrage par module sont retouchés (intro, bilan, free).
  La structure pédagogique et l'ordre des concepts restent intacts.
- **Code vérifié** contre `KEYMAKER_strudel_reference.md` (§0–§13, à jour strudel.cc). Aucune fonction hors référence.
- **Choix techniques notables** :
  - *Breakbeat* : `samples("github:yaxu/clean-breaks")` + `s("amen/4").fit().chop(16).iter(4).cut(1)` (recette vérifiée §13 ; téléchargement réseau **une fois**, flaggé dans le flash).
  - *Sidechain/pump* : pas de bouton natif → **fabriqué** via `gain(saw.range(.3,1).fast(4))` + `segment` pour que le mouvement s'entende.
  - *Granularité* : `chop` appliqué à un **sample** (`space`, intégré), jamais à un synthé.
  - *Reese* : deux notes MIDI à virgule (`note("[24,24.2]")`) → battement de désaccord.
  - *Supersaw* : `superimpose(x=>x.add(0.15))` (numérique, pas de `-` qui se confondrait avec un silence en mini-notation).
  - *Vocal chop* : `numbers` (chiffres parlés, intégré) → robuste hors-ligne.

---

## 🧪 Vérifications (toutes vertes)

- **Syntaxe** : `node --check` OK sur `lessons.js` (4553 lignes) **et** `module7.js` (960 lignes).
- **Intégrité données M1–M7** : **1190/0** — 7 modules × 5 chapitres ; champs requis ; ids uniques par module ;
  **M7 = 7.1→7.25** dans l'ordre ; recap + free en fin de chaque chapitre M7 ; **équilibre parenthèses/crochets/guillemets de tous les codes**.
- **Navigation** : **9/9** — la construction des listes plates (logique exacte de `App.jsx`) donne `[26,25,25,25,25,25,25]` = 176 ;
  M7 atteignable (7.1 premier, 7.25 dernier) ; bouton « module suivant » actif depuis M6, inactif à M7 (fin du parcours).
- **Build** : `vite build` **propre**, bundle **`index-pfm8e5dE.js` (392 kB, gzip 128 kB)** ; `dist/` rafraîchi (sert M7).
- **Sentinelles dans le bundle** (10/10) : `Genres & Styles`, `tout dernier flash de Keymaker`, `Drum & Bass`,
  `reese`, `supersaw`, `half-time`, `squelch 303`, `coder un vrai beat techno`, `vocal chop`, `7.25`.

---

## ⚠️ Incident & résolution

En cours de chantier, la **fin de `lessons.js` a été tronquée** (flash 6.25 coupé en plein `decode`) lors d'une
écriture — désynchro outil/disque. **Détecté** par le test (`node --check` → EOF inattendu), **localisé** au bloc
`m6chapitre5`, et **restauré** depuis la version HEAD (tail vérifié) en réappliquant les 2 modifs voulues (free de
6.25 bridgé vers M7 + ajout de `module7` au tableau `modules`). Fichier final **revalidé** (syntaxe + intégrité + build).

---

## 🏁 État & reste à faire

- [x] M1–M6 recolorés (intro + bilan + free) par genre.
- [x] Module 7 complet (5 chapitres, 25 flashs) dans `module7.js`, câblé dans `lessons.js`.
- [x] Roadmap mise à jour (entrée Chantier Electro ✅).
- [x] Tests intégrité **1190/0** + navigation **9/9** + build propre + sentinelles + `dist/` à jour.
- [ ] **Validation à l'oreille** des 25 flashs M7 sur strudel.cc (parcours audio — à faire avec Felix ; rejoue un son muet la 1ʳᵉ fois = lazy loading).
- [ ] **Commit + push** via `close_session.bat`.
- [ ] *Ménage optionnel* : supprimer le dossier `keymaker-app/dist_electro/` (artefact de build temporaire ; non supprimable depuis le sandbox — restriction de montage).

---

## 🔮 Et après ?

- Pont naturel avec le **Mode Quiz (C17)** et la **SRS (C23)** : les projets de genre deviennent des défis.
- Un **sélecteur d'ambiance/genre** sur l'Accueil qui pré-charge le projet du genre choisi.

---

*Réalisé le 6 juin 2026 (en autonomie). Source ↔ build ↔ docs en phase.*
