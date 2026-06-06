# Keymaker — Chantier 24 : Carnet de notes par flash

> Réalisé **en autonomie** le 6 juin 2026. Livré **dans la même session** que les
> Chantiers 16, 20 et 27 (migration IndexedDB v2 partagée avec le C27).

---

## 🎯 Objectif

Une **zone de texte libre par flash**, persistée, pour **externaliser ce qu'on retient** :
une astuce, un truc mnémotechnique, un rappel (« ce `voicing()` marche seulement si la note
est déjà dans l'accord », « `iter` = un tapis roulant »).

**Le pourquoi (profil TDA).** Sortir l'info de sa tête = **moins de charge cognitive** =
plus de place pour la musique. La friction doit être nulle : pas de bouton « Enregistrer »,
ça se sauve tout seul.

---

## ✅ Ce qui est livré

- Sous le **concept** de chaque flash, un bloc **`✎ Ma note`** :
  - **Replié si vide** (juste l'en-tête discret), **déplié si une note existe** (avec un
    aperçu en une ligne quand on le replie).
  - Déplié → un **textarea** : **auto-enregistrement** (débounce 500 ms + au blur), zéro
    bouton. Correcteur orthographique activé.
- **Persisté en IndexedDB** (store `notes`, **une note par flash**, clé = coordonnées
  `module:chapitre:flash`). Survit au rechargement, **100 % hors-ligne**, rien sur le réseau.
- **Masqué en Mode Focus** (zéro distraction).

---

## 🧠 Décisions (le « pourquoi » technique)

- **Migration IndexedDB v1 → v2** (partagée avec le C27) : la base `keymaker` passe en
  version 2. L'`onupgradeneeded` **ajoute** les stores `notes` et `snippets` **sans toucher**
  à `messages`/`difficultes` → **la mémoire de Sati déjà stockée est préservée** (testé).
- **`memory.js` possède le schéma, `notebook.js` les opérations.** Une seule base, une
  seule connexion (`getDB()` exporté depuis `memory.js` et mémoïsé) → **pas de conflit
  d'ouverture** entre deux modules qui ouvriraient la base à des versions différentes.
- **Clé = coordonnées `m:c:f`** (mêmes que la progression du C16), **pas** l'`id` du flash
  (qui n'est pas unique entre modules) → zéro collision.
- **Composant `FlashNote.jsx` autonome** : il charge/sauve sa propre note ; `key={flashKey}`
  côté parent le remonte proprement à chaque flash. **Best-effort** : si IndexedDB est
  indisponible, tout se dégrade en no-op (le textarea marche, sans persistance).
- **Note vidée = entrée supprimée** (`delete` si texte vide après `trim`) → pas de coquilles
  vides qui pollueraient un futur export.
- **`saveNote` = upsert** (`put`, keyPath `flashKey`) → réécrire le même flash ne duplique
  jamais.
- **CSS themable** (var() only) → Void / Clair / Matrix.

---

## 🧪 Vérifications (toutes vertes)

- **node (fake-indexeddb) — migration & notes** : base v1 **seedée** (messages +
  difficultés de Sati) → ouverture v2 → **données Sati préservées** (2 messages, 1
  difficulté) + stores `notes`/`snippets` créés ; `saveNote`/`loadNote` round-trip ;
  **note vidée → supprimée** ; **upsert** sans doublon ; `countNotes`.
- **jsdom (App réel + fake-indexeddb)** : `FlashNote` présent sous le concept ; ouverture
  du textarea ; saisie → **persistance réelle vérifiée** (`loadNote('0:0:0')` rend le
  texte tapé après le débounce).
- **Build** propre (39 modules) ; **sentinelles** : `flash-note`, `Ma note` (JS) ;
  `.flash-note`/`.flash-note-area` (CSS) ; stores `notes`/`snippets` dans le bundle.

---

## 🏁 État & reste à faire

- [x] `FlashNote.jsx` + `notebook.js` (notes) + migration v2 dans `memory.js` + CSS.
- [x] Auto-save, repli/dépli, masquage Focus, best-effort.
- [x] Build + livraison byte-identique + tests verts + sentinelles.
- [x] Docs à jour (roadmap, README, ce brief).
- [ ] **Commit + push** via `close_session.bat`.

---

## 🔮 Et après ?

- **Cheat sheet imprimable (C25)** : les notes personnelles pourront s'intégrer au PDF
  par module (déjà prévu dans le brief du C25).
- Possibilité d'un compteur de notes dans Réglages (la fonction `countNotes` existe déjà).

---

*Brief écrit le 6 juin 2026 (réalisé en autonomie). Source ↔ build ↔ docs en phase.*
