# Keymaker — Chantier 11 : Thème Matrix (vert)

> Réalisé **en autonomie** le 6 juin 2026, juste après le Chantier 10 (Module 4), dans la même session.
> Le 3ᵉ thème, annoncé depuis le Chantier 8 (« Matrix : plus tard »).

---

## 🎯 Objectif

Ajouter un **3ᵉ thème** à Keymaker : **Matrix**, vert phosphore sur quasi-noir — l'esthétique
« pluie de code » chère aux amateurs de live coding. Compléter la bascule Void / Clair (Chantier 8)
par une 3ᵉ option, sans rien casser.

---

## ✅ Ce qui est livré

- **`[data-theme="matrix"]`** dans `src/styles.css` : un bloc qui n'override que les **13 variables de
  couleur** (comme le thème Light), donc `--glow`, `--radius`, les polices et les tailles restent hérités
  de `:root`.
  - Fond `#050a05` / `#0a140a`, surfaces vert-teintées, accent **`#00ff66`** avec `--accent-rgb: 0, 255, 102`
    (→ toutes les lueurs `rgba(var(--accent-rgb), a)` passent au vert **automatiquement**), encre d'accent
    sombre `#02140a`, texte `#c8ffd4`, muted `#6fae82`, danger `#ff5d6c`, `--bg-fade` assorti.
- **3ᵉ option dans le sélecteur** (`src/Settings.jsx`) : `APP_THEMES` passe à
  `[{void}, {light}, {matrix}]` ; le sélecteur segmenté (Apparence) est **générique** (`.map`), donc la 3ᵉ
  pastille « Matrix » apparaît toute seule. Texte de la description mis à jour (« Void, Clair ou Matrix »).
- **Aucun changement d'`App.jsx`** : le thème est déjà posé sur `<html>` (et `.app`) via
  `data-theme={settings.theme}` pour **n'importe quelle** valeur, et persisté dans `keymaker:settings.theme`.
  Ajouter une valeur de thème = un bloc CSS + une option de liste.

---

## 🧪 Vérifications (toutes vertes)

- **Build** : `vite build` propre, **34 modules**, nouveaux assets `index-BmpEACbd.js` (285 kB) +
  `index-Dh5zhh25.css` (22,5 kB) + PWA régénérée (`sw.js` + workbox, precache 11 entrées).
- **Bloc Matrix complet** : **13/13** variables de couleur présentes.
- **3 thèmes coexistent** dans le CSS livré : accents cyan `#22d3ee` (Void), indigo `#5b5bd6` (Light),
  vert `#00ff66` (Matrix) tous présents ; `[data-theme=matrix]` dans le bundle.
- **Sélecteur** : `APP_THEMES` = `void, light, matrix` (3 options) dans la source.
- **Module 4 intact** : sentinelle « Le morceau final » toujours dans le bundle (build = M4 + Matrix).
- Livraison `dist/` sur le mont **sans suppression** (anciens bundles laissés en orphelins ;
  `index.html` + `sw.js` pointent sur les nouveaux assets).

---

## 🛠️ Note build

Même pipeline que le Chantier 10 (pont fichiers qui sert un cache périmé après édition) : les sources
fraîchement éditées via **bash** (python) restent fraîches sur le mont ; build dans `/tmp/build`
(`node_modules` symlinké au mont + binaires natifs Linux `@esbuild`/`@rollup` déjà en place) ; `dist/`
recopié sur le mont. Édition `styles.css` + `Settings.jsx` faites en bash → mont à jour pour le commit.

---

## 🔮 Et après ?

- **Valider M3 et M4 à l'oreille** avec Felix (codes vérifiés contre la doc, pas encore tous écoutés).
- **Module 5 — Informatique Musicale** · **Module 6 — Composition & Projets** (même méthode/format).
- (optionnel) câblage app → `session_id` (relier journal de Sati et sessions).

---

*Brief écrit le 6 juin 2026 (chantier réalisé en autonomie, juste après le Module 4).*
