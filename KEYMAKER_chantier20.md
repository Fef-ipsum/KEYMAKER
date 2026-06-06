# Keymaker — Chantier 20 : Partage & export

> Réalisé **en autonomie** le 6 juin 2026. Livré **dans la même session** que les
> Chantiers 16, 24 et 27. Conçu, codé, buildé, testé, livré, documenté.

---

## 🎯 Objectif

Donner à Keymaker un **pont vers le monde extérieur** : sortir un pattern de l'app pour
le retravailler, le garder, ou le montrer. Deux fonctions simples, **zéro backend**.

---

## ✅ Ce qui est livré

Sous l'éditeur de chaque flash, une rangée d'actions (`.share-row`) :

- **↗ Ouvrir dans Strudel** : ouvre le **REPL officiel strudel.cc** dans un nouvel
  onglet, avec **le code courant pré-rempli**. Un clic → le patch de l'exercice (ou ce
  que Felix a tapé) dans l'environnement complet de Strudel.
- **⤓ Télécharger .js** : enregistre le code en **fichier `.js` propre** (en-tête commenté
  avec le numéro de flash + le module), nommé `keymaker-flash-<id>.js`.

Les deux lisent le **code live** de l'éditeur (pas seulement celui de la leçon). Rangée
**masquée en Mode Focus** (zéro distraction).

> *(La 3ᵉ fonction proposée — « ma progression en PDF » — est couverte autrement : le
> Tableau de bord du Chantier 16 affiche déjà % par module, streak et jours de pratique.)*

---

## 🧠 Décisions (le « pourquoi » technique)

- **Encodeur authentique, pas réinventé.** L'URL de partage utilise **exactement**
  l'encodeur du REPL Strudel, extrait du bundle vendorisé (donc identique à strudel.cc) :
  `code2hash(code) = encodeURIComponent(btoa(String.fromCharCode(...new TextEncoder().encode(code))))`.
  strudel.cc lit `location.hash`, le décode par `base64ToUnicode(decodeURIComponent(hash))`
  et restaure le code. URL finale : `https://strudel.cc/#<hash>`. **Vérifié à la source**
  (fonctions `unicodeToBase64` / `code2hash` / `hash2code` dans le vendor) → robuste à
  l'unicode (accents, emojis) et aux retours-ligne.
- **Download best-effort** : `Blob` + lien éphémère + `revokeObjectURL` différé, le tout
  en `try/catch` (jamais bloquant).
- **`readLiveCode()` mutualisé** : lit `editor.code` (tenu à jour par StrudelMirror), repli
  sur l'état CodeMirror, puis sur le code de la leçon. Partagé avec « Sauvegarder » (C27).
- **`window.open(..., '_blank', 'noopener')`** : pas de référence `window.opener` laissée
  à strudel.cc (bonne hygiène).
- **Zéro dépendance, zéro réseau propre à l'app** (l'ouverture de strudel.cc est une
  navigation externe explicite, déclenchée par Felix).

---

## 🧪 Vérifications (toutes vertes)

- **node — round-trip d'URL** (`code2hash` → `hash2code` == original) sur 4 codes, dont
  un avec **accents é à ü ✓** et un **multi-lignes `stack(...)`** : identité prouvée.
- **jsdom** : les **3 boutons** de la `share-row` présents ; clic **↗ Ouvrir dans
  Strudel** → `window.open` reçoit une URL **`https://strudel.cc/#…`** ; clic **⤓
  Télécharger** → `URL.createObjectURL` appelé (Blob créé).
- **Build** propre (39 modules) ; **sentinelles** dans le bundle livré : `share-row`,
  `Ouvrir dans Strudel`, `strudel.cc/#`, `Télécharger` ; CSS `.share-row`/`.share-btn`.
- **Intégrité 151 flashs** intacte.

---

## 🏁 État & reste à faire

- [x] Bouton « Ouvrir dans Strudel » (encodeur authentique) + « Télécharger .js ».
- [x] Lecture du code live, masquage en Focus, CSS themable.
- [x] Build + livraison byte-identique + tests verts + sentinelles.
- [x] Docs à jour (roadmap, README, ce brief).
- [ ] **Commit + push** via `close_session.bat`.

---

## 🔮 Et après ?

- **Bibliothèque de snippets (C27, livré en même temps)** : garder ses meilleurs patterns
  dans l'app, complément naturel de l'export.
- Plus tard : un bouton « copier le lien Strudel » (presse-papier) en plus de l'ouverture
  directe ; export `.json` de la progression complète.

---

*Brief écrit le 6 juin 2026 (réalisé en autonomie). Source ↔ build ↔ docs en phase.*
