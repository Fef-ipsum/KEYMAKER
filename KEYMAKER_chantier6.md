# Keymaker — Chantier 6 : Réglages (l'écran de paramètres)

> **Brief de démarrage.** Format identique aux chantiers précédents.
> Felix : pour reprendre, ouvre une conv dans le projet et dis « **on continue le Chantier 6** ».
> Claude relit `KEYMAKER_roadmap.md` + ce fichier, puis reprend là où on s'est arrêtés.

---

## 🎯 Objectif du chantier

Donner à Keymaker un vrai **écran Réglages** : un bouton **⚙️ Réglages** dans la barre du haut
+ un overlay (même patron que **Parcours** et **Sati** — rendu *par-dessus*, l'éditeur ne bouge pas).

Première tranche **volontairement petite et livrable** : uniquement des réglages à **effet réel
immédiat**. Pas de boutons fantômes. Le thème clair est reporté à une tranche dédiée.

---

## ✅ Ce qui est déjà fait (Chantiers 1 → 5)

- **Module 1 complet** : 26 flashs, 5 chapitres, navigation, Parcours, reprise localStorage.
- **Sati** : tiroir de chat IA branché au Pi (Chantier 5).
- Barre du haut actuelle : **2 boutons** seulement → `Sati` et `☰ Parcours`.
- **Seul réglage existant** = l'URL du Pi, **cachée** dans le tiroir Sati (`<details> ⚙️ Connexion au Pi`).
  C'est ce que Felix cherchait → d'où ce chantier.

---

## 🧩 Décidé avec Felix (3 juin 2026)

Réglages de **cette tranche** :

- **Apparence** : taille de texte (3 niveaux) · réduire les animations (+ respecte le réglage système).
- **Éditeur** : couleurs du code (thèmes intégrés de l'éditeur Strudel) · numéros de ligne.
- **Connexion** : URL du Pi + test, **remontés ici** (un raccourci reste dans Sati).
- **Données** : reprendre la progression à zéro (**avec confirmation**).
- **Thème clair/sombre** : **plus tard** (il faut créer un 2ᵉ thème complet — seul Void sombre existe).

---

## 🔎 Vérifié dans le code AVANT de coder

- L'éditeur (`<strudel-editor>` / StrudelMirror, vendorisé) expose bien :
  `setTheme(nom)`, `setFontSize(px)`, `setLineNumbersDisplayed(bool)`, `setLineWrappingEnabled(bool)`.
  Thèmes dispo : **strudelTheme** (défaut), materialDark, gruvboxDark/Light, dracula, nord,
  tokyoNight(+Storm/Day), bluescreen, teletext, sonicPink, githubDark/Light, solarizedDark/Light…
- `editorRef` (= `el.editor`) est **déjà** remonté à `App` via `onReady` → on applique les réglages **en live**.
- L'URL Pi est **déjà** gérée dans `App` (`piUrl` / `savePiUrl` / `checkPi` / `piStatus`) et passée à Sati
  → on la **partage** avec Réglages (pas de duplication d'état).
- Reprise = `localStorage["keymaker:m1:pos"]` (+ ancienne clé `keymaker:ch1:flashIndex`).
- Réglages persistés dans une **nouvelle clé** `keymaker:settings` (JSON).

---

## 🪜 Plan (micro-étapes — une brique qui marche à la fois)

> TDA-friendly : on teste chaque étape avant la suivante.

1. **Le contenant** — bouton ⚙️ Réglages (topbar) + overlay `Settings.jsx` (titre, sections,
   fermeture Échap / ✕ / backdrop). L'éditeur reste monté dessous. → on voit l'écran s'ouvrir/fermer.
2. **Modèle de réglages** — état `settings` dans `App` + clé `keymaker:settings` (lu au montage,
   écrit à chaque changement). Défauts sûrs (reduceMotion seedé sur `prefers-reduced-motion`).
3. **Apparence** — taille de texte (3 niveaux, var CSS `--fs-scale` + `editor.setFontSize`) +
   réduire les animations (classe sur `.app` qui coupe transitions/animations).
4. **Éditeur** — couleurs du code (select → `editor.setTheme`) + numéros de ligne
   (toggle → `editor.setLineNumbersDisplayed`). Appliqués à l'ouverture de l'éditeur **et** à chaque changement.
5. **Connexion** — section URL Pi + bouton Tester (réutilise l'état d'`App`) ; raccourci gardé dans Sati.
6. **Données** — « Reprendre à zéro » avec **confirmation** (efface la progression, retour Flash 1.1).
7. **Finitions** — petite section « À propos » (version, « 100 % local ») + revue d'espacement (aéré, TDA-friendly).
8. **Build + vérif** — build dans le sandbox (parade pont-fichiers : copie `/tmp`, sentinelles, `npm i`,
   `vite build`), recopie `dist/`, smoke test (montage, ouverture Réglages, persistance localStorage,
   API éditeur appelée sans erreur). Roadmap + ce brief mis à jour.

---

## ⚠️ Pièges techniques à garder en tête

- **Pont fichiers Cowork ↔ sandbox en retard** (vécu au Ch.3) → builder depuis `/tmp` après vérif
  par **sentinelle**, recopier `dist/`, **vérifier les fichiers livrés**.
- `setTheme` / `setFontSize` = cosmétique → toujours en **try/catch** (non bloquant), comme l'existant.
- **Ne pas remonter l'éditeur** (pas de `key`) — l'overlay Réglages se rend par-dessus, comme Parcours/Sati.
- « Reprendre à zéro » = **destructif** → confirmation obligatoire.
- Suppression d'anciens assets hashés = autorisation dédiée ; sinon les laisser (`index.html` pointe sur les neufs).

---

## 🏁 Definition of Done (Chantier 6)

- [x] Bouton **⚙️ Réglages** + overlay qui ouvre/ferme (Échap / ✕ / backdrop), éditeur non recréé.
- [x] **Taille de texte** (3 niveaux) + **réduire les animations** — persistés, effet immédiat.
- [x] **Couleurs du code** (thèmes) + **numéros de ligne** — persistés, appliqués à l'éditeur.
- [x] **URL Pi + test** dans Réglages (raccourci gardé dans Sati).
- [x] **Reprendre à zéro** avec confirmation.
- [x] Build propre + `dist/` livré. Roadmap & brief à jour.

---

## 🔮 Et après ?

Tranches suivantes possibles : **thème clair** (créer un 2ᵉ thème + bascule), réglages **Sati**
(verbosité / proactivité — petit ajout côté Pi), **Audio** (volume), **Notifications**.

---

*Brief créé le 3 juin 2026 (fin du Chantier 5). Réglages — première tranche.*

---

## ✅ CHANTIER 6 TERMINÉ — 4 juin 2026

**Build livré :** 34 modules, 1.10 s, zéro erreur. `dist/` à jour. `start.bat` montre le bouton **⚙ Réglages**.

**Pont fichiers :** sain dès la reprise (wc -l exact : 662/408/228/329/1210/217). Build direct dans `/tmp/km6` sans re-matérialisation nécessaire.

**Nettoyé :** `keymaker-app/__bridge_test.txt` supprimé.

*Chantier clos. Prochain : Chantier 5 tranche 2 (mémoire locale IndexedDB) ou Chantier 7 (thème clair — trancher avec Felix).*
