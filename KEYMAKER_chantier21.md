# Keymaker — Chantier 21 : Mode Focus

> Réalisé **en autonomie** le 6 juin 2026, sur « lance les prochains chantiers ».
> Chantier marqué 🔥 **priorité** dans la roadmap. Conçu, codé, buildé, testé,
> livré et documenté de bout en bout. Fait **dans la même session** que le Chantier 22.

---

## 🎯 Objectif

Offrir un **interrupteur « Mode Focus »** : une session de pratique pure où **tout
disparaît sauf l'éditeur, Run/Stop et le titre du flash**. Zéro nav, zéro carte,
zéro bouton — 100 % musique.

**Le pourquoi (profil TDA).** L'interface de Keymaker est riche (topbar, fil
d'Ariane, Parcours/Sati/Réglages, cartes Concept/Décodage/Théorie/Exercice, nav,
footer). C'est parfait pour **apprendre**. Mais quand on veut juste *jouer*, tout
ça devient du **bruit visuel** qui capte l'attention. Le Mode Focus retire le bruit
d'un seul clic, et le rend d'un seul Échap.

---

## ✅ Ce qui est livré

- **Bouton `⤢ Focus`** dans la barre du haut (entrée dans le mode).
- En focus : la topbar, le kicker, **toutes les cartes** (`.card` : Concept,
  Décodage, Théorie, Exercice, Récap, Libre), la nav entre flashs et le footer sont
  **masqués** (`display: none`). Restent : le **titre du flash** (réduit, centré, en
  gris discret) et le **bloc éditeur** (éditeur + Run/Stop + LED d'état + erreur
  inline). L'éditeur est **recentré** et a de l'air autour.
- **Deux sorties** : la touche **Échap** *ou* un bouton discret **« ✕ Quitter le
  focus »** fixé en haut à droite (avec le rappel `Échap`), à faible opacité, qui
  s'éclaire au survol.
- État **éphémère** (non persisté) : on entre en focus par une intention délibérée ;
  rouvrir l'app ne te piège pas dans un écran sans nav.

---

## 🧠 Décisions (le « pourquoi » technique)

- **Une classe, pas un remontage.** Le focus = un booléen `focusMode` dans `App` qui
  ajoute la classe `.focus-mode` sur `.app` (exactement le patron de `reduce-motion`).
  Le CSS fait tout le reste. **L'éditeur n'est jamais recréé** → le **son ne s'arrête
  pas** en entrant/sortant du focus. C'est l'invariant n°1 du projet (un seul éditeur,
  jamais remonté), respecté ici par construction.
- **`display: none`, pas `opacity: 0`.** Masquer en `display:none` **reflue** la page
  → l'éditeur se recentre proprement, et les éléments cachés ne captent ni clic ni
  tabulation (meilleure accessibilité qu'un simple `opacity`).
- **Échap hiérarchisé.** Le gestionnaire Échap existant (qui ferme Parcours/Sati/
  Réglages) gère maintenant aussi le focus : **d'abord** fermer un overlay s'il y en a
  un d'ouvert, **sinon** sortir du focus. Jamais les deux à la fois.
- **Bouton de sortie toujours visible.** En focus, la topbar (donc le bouton Focus) est
  masquée → la sortie `✕` est rendue **à part**, en `position: fixed`, garantie d'être
  là. Échap reste le raccourci ; le bouton est le filet de sécurité (si l'éditeur a le
  focus clavier et avale la touche).
- **Zéro impact sur le reste.** Aucune donnée touchée, aucune dépendance ajoutée,
  navigation et thèmes (Void/Clair/Matrix) inchangés.

---

## 🛠️ Build & livraison

Même pipeline que les modules précédents, et **le piège récurrent du projet a frappé
fort** : après édition par l'outil, le **pont fichiers Cowork ↔ sandbox** a servi des
`App.jsx` / `StrudelEditor.jsx` / `Settings.jsx` / `styles.css` **tronqués** (App.jsx
coupé en plein milieu à la ligne 747) → premier `vite build` cassé.

**Parade appliquée (robuste) :** reconstruire les fichiers édités dans `/tmp` **depuis
la base git authoritative** (`git archive HEAD keymaker-app` → arbre committé
byte-perfect, **sans pont**), puis **réappliquer mes éditions de façon déterministe**
(remplacements Python avec assertion « 1 seule occurrence » par édition ; bloc CSS
ajouté à la base ; `StrudelEditor.jsx` réécrit en entier). Build dans `/tmp` (binaires
natifs Linux `@esbuild/linux-x64` + `@rollup/rollup-linux-x64-gnu` déjà présents),
`dist/` recopié sur le mont (**aucune suppression** → l'ancien bundle C13 reste
orphelin, non référencé), et les 4 sources reconstruites **réécrites sur le mont** par
`cp` bash (write-through → cache rafraîchi, repo cohérent).

---

## 🧪 Vérifications (toutes vertes)

- **Build** `vite build` propre — **34 modules**, bundle `index-BrHeOIB7.js`
  (339,69 kB) + CSS `index-dnzb9Du8.css` (24,49 kB, +le bloc focus/erreur) + **PWA
  régénérée** (11 entrées). `index.html` + `sw.js` pointent sur le nouveau bundle.
- **Montage runtime jsdom** (esbuild → jsdom, App réel monté) : focus **13/13** (avec
  le Chantier 22) — départ sans `focus-mode`, clic `⤢ Focus` → `.app.focus-mode` +
  bouton de sortie affiché, **Échap** sort, ré-entrée OK, clic `✕` sort.
- **Intégrité données** : **151 flashs / 6 modules** intacts (le Mode Focus ne touche
  pas au contenu).
- **Sentinelles** dans le bundle **livré** sur le mont : `focus-mode`, `⤢ Focus`,
  `Quitter le focus`, `Mode Focus : éditeur seul` (JS) ; `.focus-mode`, `.focus-btn`,
  `.focus-exit` (CSS) ; thèmes `void`/`light`/`matrix` toujours présents.

---

## 🏁 État & reste à faire

- [x] Bouton d'entrée, masquage du superflu, recentrage de l'éditeur, double sortie
      (Échap + bouton), état éphémère, son non interrompu.
- [x] Build propre + `dist/` livré + tests verts + sentinelles.
- [x] Docs à jour (roadmap, README, ce brief).
- [ ] **Commit + push** via `close_session.bat` (étape Windows de Felix : l'index git
      est illisible côté sandbox et le push demande tes identifiants GitHub).

---

## 🔮 Et après ?

Le Mode Focus est le socle de plusieurs chantiers à venir :
- **Mode Quiz (C17)** : les exercices à trous se jouent en focus.
- **Sati next level (C18)** : Sati peut lancer un défi *en* focus (un objectif, un
  éditeur, rien d'autre).
- Option possible plus tard : un raccourci clavier d'entrée, ou « ouvrir directement en
  focus » pour les flashs `free`.

---

*Brief écrit le 6 juin 2026 (chantier réalisé en autonomie, même session que le
Chantier 22). Source ↔ build ↔ docs en phase.*
