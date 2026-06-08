# Keymaker — Chantier 32 : le Studio REPL

**Date** : 8 juin 2026 (nuit, en autonomie)
**Demande de Felix** : « Ajoute à l'app un Studio REPL indépendant des leçons où je peux juste aller faire du son (avec Sati si j'ai besoin). »

---

## 🎯 L'idée

Un **bac à sable autonome**, hors parcours : Felix arrive, et il fait du son. Zéro flash, zéro progression à suivre, zéro friction. C'est le pendant « jeu libre » des leçons — important pour un profil TDA : pouvoir *juste jouer* sans le poids d'un parcours.

---

## ✅ Ce qui a été livré

- **Nouvel onglet `🎛️ Studio`** dans la barre du haut (à côté de Focus).
- **Éditeur Strudel dédié** au Studio (instance séparée de celle des leçons → le code du Studio n'écrase jamais un flash, et inversement).
- **Démarrage rapide** : 6 *starters* cliquables (House, Breakbeat, Acid, Mélodie, Ambient, Techno). **Un clic charge le pattern ET le joue.**
- **🎲 Surprends-moi** : un starter au hasard, lancé direct.
- **Tempo −/+** : ajuste le BPM en réécrivant la ligne `setcpm(BPM/4)` en tête (idiomatique + pédagogique).
- **Run / Stop** (`Ctrl+Entrée` / `Ctrl+.`), **LED d'état**, **visualiseur de rythme** (réutilise `PatternViz`), **erreurs inline**.
- **Aide-mémoire** intégré (batterie, hauteur, gamme, effets, superposition, temps) + rappels clavier.
- **Actions** : ☆ Sauvegarder (bibliothèque, tag `studio`) · ↗ Ouvrir dans strudel.cc · ⤓ Télécharger .js · ⟲ Vider.
- **Sati studio-aware** : le bouton Sati du Studio ouvre le guide avec un **contexte « bac à sable »** (pas de leçon) et des **actions adaptées** (*Donne-moi une idée*, *Améliore mon code*, *Surprends-moi*). Sati voit le code live du Studio.
- **Persistance** : le code du Studio est retenu en `localStorage` (`keymaker:studio:code`) d'une session à l'autre.

---

## 🧩 Fichiers touchés

- `src/Studio.jsx` **(nouveau)** — le composant plein écran : éditeur dédié, contrôles, starters, tempo, partage, aide-mémoire.
- `src/App.jsx` — bouton topbar, état `studioOpen`, `studioEditorRef`, ouverture (coupe le son de la leçon d'abord), rendu `<Studio>`, routage du contexte Sati (`studioOpen ? getStudioContext : getContext`), `Échap` ferme le Studio, persistance + sauvegarde snippet `studio`.
- `src/SatiChat.jsx` — prop `studio` (défaut `false` → leçons inchangées) : jeu d'actions, sous-titre et état vide adaptés.
- `src/sati.js` — `buildContextBlock` : branche `studio` (préambule « bac à sable », pas de position de leçon).
- `src/styles.css` — section `.studio*` (plein écran sous l'overlay Sati, thème-aware, responsive < 900px).
- `README.md` — section Studio + pied de page.

---

## 🔧 Notes techniques

- **Deux éditeurs, un seul son** : chaque `<strudel-editor>` a son propre `scheduler` mais partage l'`AudioContext` global de superdough (modèle d'embed standard de Strudel — la doc officielle en empile plusieurs par page). Pour éviter deux sons simultanés : App **arrête l'éditeur de leçon** à l'ouverture du Studio, et le Studio **arrête le sien** au démontage (cleanup). L'éditeur du Studio est monté **à l'ouverture** et démonté à la fermeture (jamais deux schedulers actifs en même temps).
- **z-index** : `.studio` = 30 (au-dessus de la topbar=5), l'overlay Sati = 40 → on peut ouvrir Sati **par-dessus** le Studio.
- **Piège du mont (revu)** : l'écriture via les outils Edit/Write a **tronqué** `SatiChat.jsx` et `sati.js` sur le mont (cf. `keymaker-mount-truncation`). Récupéré via `git show HEAD:… ` + ré-application des edits **en bash** (fragments en heredoc litéral pour les backticks/`${}`), puis `cmp` byte + esbuild. Build dans `/tmp` (archive HEAD + overlay du `src` corrigé + `node_modules` symlinké), `dist` livré sur le mont sans `rm`, sentinelles vérifiées.
- **Build** : `dist/assets/index-B50oE-dR.js` (434 ko) + `index-Uc3-_mr6.css` (58 ko), 47 modules, Vite 6.4.3.

---

## ▶️ Pour Felix

Lance l'app (`start.bat`), clique **🎛️ Studio** en haut. Clique un starter → ça joue. Bidouille. Besoin d'aide ou d'une idée ? Bouton **Sati**. Pour revenir aux leçons : **Échap** ou **✕ Fermer**. Ton dernier code de Studio est gardé.

*Aucune modif côté Pi : Sati réutilise l'endpoint existant `/keymaker/ai/chat`. L'app reste 100 % locale.*
