# Keymaker — Chantier 9 : Module 3 « Connexion Guitare »

> ⚠️ **Note d'honnêteté.** Le **contenu** du Module 3 a été ajouté **par une autre session Cowork** le 5 juin 2026 (vers 01:29), en **code seul** : `lessons.js` a reçu le Module 3, mais sans rebuild de l'app, sans entrée roadmap et sans ce brief.
> Ce document a été **créé après coup, pendant la réconciliation** (même session que le Chantier 8). Il décrit ce qui est **observable dans le code** ; les décisions de contenu détaillées (choix pédagogiques, vérification Strudel) sont à étoffer par la session qui l'a écrit, ou à valider avec Felix.

---

## 🎯 Objectif

Donner à Keymaker son **3ᵉ module de contenu** : **Connexion Guitare** — relier la théorie (Modules 1 & 2) au **manche de la guitare** (l'instrument de Felix). C'était la première piste listée pour les Modules 3-6 dans `KEYMAKER_architecture.md`.

---

## ✅ Ce qui est livré (observé dans `src/lessons.js`)

**Module 3 : 5 chapitres, 25 flashs (ids `3.1` → `3.25`).** Même format de flash que les Modules 1 et 2.

- Ch.1 — **Le manche & l'accordage**
- Ch.2 — **Lire le manche**
- Ch.3 — **Les accords ouverts**
- Ch.4 — **Power chords & barrés**
- Ch.5 — **Le jeu**

**Intégration (zéro changement de code de navigation) :**
- `lessons.js` exporte `m3chapitre1…5`, `module3`, et `modules = [module1, module2, module3]`.
- La navigation multi-modules du **Chantier 7** (`FLATS = modules.map(buildFlat)`, sélecteur de module dans le Parcours, reprise `{m,c,f}`, bouton « Module N+1 ▶ ») prend en charge un 3ᵉ module **sans aucune modification** — c'était tout l'intérêt de ce câblage générique.
- Le **thème clair** (Chantier 8) s'applique au Module 3 comme au reste (variables CSS).

---

## 🔧 Réconciliation (5 juin 2026, cette session)

Le Module 3 avait été ajouté **après** le build du Chantier 8 → l'app compilée (`dist/`) et les docs étaient restées en **2 modules**. Remis en cohérence :

- **App rebuildée** sur la machine de Felix (source réelle complète, 3 modules + thème clair) : `npm install` (351 paquets) + `npm run build` → **34 modules**, bundle `index-NqFEHDkR.js` (258,9 kB) + CSS thème `index-BXVl0h6z.css`. `dist/` propre (vite `emptyOutDir` → aucun orphelin), moteur `vendor/` recopié.
- **Vérifié dans le bundle livré** : présence de « Connexion Guitare » / « Lire le manche » (Module 3), « Void (sombre) » (thème), « live coding & solfège » (à propos) ; CSS `[data-theme=light]` + `#5b5bd6`.
- **Docs resync** : README (3 modules / 76 flashs + bloc Module 3), roadmap (dashboard, Chantier 9, dernière mise à jour), ce brief.

---

## 🏁 État & reste à faire

- [x] Module 3 présent dans la source (5 ch / 25 flashs) et **dans l'app compilée**.
- [x] Docs en cohérence (3 modules / 76 flashs).
- [ ] **Valider les 25 codes Strudel du Module 3 à l'oreille** (comme pour le Module 2 — non audible en sandbox).
- [ ] **Étoffer ce brief** : décisions de contenu, vérification des fonctions Strudel utilisées, ponts guitare précis (par la session d'origine ou avec Felix).

---

## ⚠️ Leçon de cette journée : collision entre sessions

Deux sessions Cowork ont travaillé sur le même dossier le 5 juin → l'app a brièvement régressé (dist en 2 modules alors que la source était en 3). **Parade pour l'avenir** : une seule session active à la fois sur le projet, et **git** (mis en place ce jour) pour tracer/rattraper ce genre d'écart. Voir la règle « tous les fichiers à jour » dans le roadmap.

---

*Brief créé pendant la réconciliation du 5 juin 2026. Contenu du Module 3 : autre session. À compléter.*
