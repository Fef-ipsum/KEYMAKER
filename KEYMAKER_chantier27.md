# Keymaker — Chantier 27 : Bibliothèque de snippets

> Réalisé **en autonomie** le 6 juin 2026. Livré **dans la même session** que les
> Chantiers 16, 20 et 24 (migration IndexedDB v2 partagée avec le C24).

---

## 🎯 Objectif

Le début d'un **vrai workflow créatif** : quand Felix trouve un pattern génial pendant un
exercice, il peut le **garder d'un clic** et le **rappeler** plus tard dans l'éditeur —
sans devoir le copier ailleurs pour ne pas le perdre.

---

## ✅ Ce qui est livré

- **☆ Sauvegarder** dans la rangée d'actions sous l'éditeur (à côté de Ouvrir dans
  Strudel / Télécharger) : enregistre le **code courant** comme snippet, **nommé d'après
  le flash** (`Flash <id> — <titre>`) + le module + la date. **Confirmation éphémère**
  (« ✓ Gardé dans ta bibliothèque »), zéro boîte de dialogue → friction minimale (TDA).
- **📌 Mes snippets** (depuis le Tableau de bord) ouvre la **bibliothèque** (overlay) :
  - liste des patterns gardés (nom + 1ʳᵉ ligne de code + module/date), **les plus récents
    d'abord** ;
  - **clic → chargé dans l'éditeur** (et l'overlay se ferme) ;
  - **🗑 supprimer** par snippet.
- **100 % local** (IndexedDB, store `snippets`), rien sur le réseau.

---

## 🧠 Décisions (le « pourquoi » technique)

- **Même base, migration partagée avec le C24** : `memory.js` passe en **v2** et crée les
  stores `notes` + `snippets` dans le même `onupgradeneeded`, **sans toucher** à la mémoire
  de Sati (`messages`/`difficultes` préservés — testé).
- **`notebook.js`** porte les opérations snippets (`loadSnippets` trié récent→ancien,
  `addSnippet` qui **refuse un code vide**, `deleteSnippet`, `countSnippets`), au-dessus du
  `getDB()` exporté par `memory.js`. **Best-effort** partout.
- **Nom auto = le flash** : low-friction par choix (TDA) ; le renommage/tri fin pourra
  venir plus tard. Le `code` stocké est le **code live** (`readLiveCode()`, mutualisé avec
  le C20), pas seulement la leçon.
- **Charger un snippet = `editor.setCode(code)`** sur l'éditeur unique : il **n'est pas
  remonté**, le code de la leçon ne réécrit pas par-dessus (l'effet d'éditeur ne se
  redéclenche qu'au **changement de flash**, pas ici).
- **Overlay = patron du projet** (`.learn-overlay`), Échap géré par le gestionnaire
  hiérarchisé (avec Parcours/Sati/Réglages/Accueil).
- **CSS themable** (var() only) → Void / Clair / Matrix.

---

## 🧪 Vérifications (toutes vertes)

- **node (fake-indexeddb) — snippets** : `loadSnippets` vide au départ ; `addSnippet` ok ;
  **refus d'un code vide** ; **tri récent d'abord** ; champs corrects (`name`/`code`/
  `module`) ; `deleteSnippet` retire le bon ; `countSnippets`. + la **migration** v1→v2
  qui préserve Sati (voir C24).
- **jsdom (App réel + fake-indexeddb) — bout-en-bout** : clic **☆ Sauvegarder** →
  **confirmation affichée** + snippet **réellement persisté** ; ouverture de la
  bibliothèque depuis le Tableau de bord → **1 snippet listé** ; **clic → `setCode(code)`**
  sur l'éditeur + overlay fermé.
- **Build** propre (39 modules, bundle `index-DR_TQsLb.js`) ; **sentinelles** : `lib-overlay`,
  `Mes snippets`, `Sauvegarder`, `Gardé dans ta bibliothèque` (JS) ; `.lib-list`/`.lib-load`/
  `.dash-lib-btn` (CSS) ; 3 accents thèmes présents.

---

## 🏁 État & reste à faire

- [x] Bouton Sauvegarder (nom = flash) + bibliothèque (lister / charger / supprimer).
- [x] `notebook.js` (snippets) + migration v2 + CSS, best-effort.
- [x] Build + livraison byte-identique + tests verts + sentinelles.
- [x] Docs à jour (roadmap, README, ce brief).
- [ ] **Commit + push** via `close_session.bat`.

---

## 🔮 Et après ?

- **Renommer** un snippet dans la bibliothèque + **recherche** par nom.
- **Import/export JSON** (backup local de la bibliothèque).
- Pont naturel avec le **Module 6** (`const`, `register`) : les snippets deviennent les
  briques des projets — le carnet de laboratoire du musicien.

---

*Brief écrit le 6 juin 2026 (réalisé en autonomie). Source ↔ build ↔ docs en phase.*
