# Keymaker — Chantier 8 : Thème clair (Light)

> Réalisé le 5 juin 2026. Format identique aux chantiers précédents. À relire avec `KEYMAKER_roadmap.md`.
> Reporté depuis le Chantier 6 (« nécessite un 2ᵉ thème CSS complet ») — maintenant livré.

---

## 🎯 Objectif

Donner à Keymaker un **2ᵉ thème complet** — **Light (clair)** — et une **bascule** simple **Void / Clair**
dans ⚙ Réglages → Apparence. Jusqu'ici, seul le thème **Void** (sombre) existait.

---

## ✅ Ce qui est livré

- **Thème Light** : palette claire complète dans un bloc `[data-theme="light"]` de `styles.css`.
  Fond `#f6f7fb`, accent **indigo `#5b5bd6`**, texte `#1b2030`, cartes/bordures en alpha sombre.
- **Bascule Void / Clair** : sélecteur segmenté dans **Réglages → Apparence** (en haut, avant la taille de texte).
  Réutilise le style `.set-seg` existant → **zéro CSS ajouté** pour le contrôle.
- **Persistance** : le choix est enregistré dans `keymaker:settings.theme` (avec les autres réglages), relu au montage.
- **Application** : le thème est posé sur **`<html>`** (et sur `.app`) → tout l'écran suit, y compris le fond peint par `body`.

L'éditeur de code garde son **thème propre** (réglage « Couleurs du code ») — il est indépendant du thème de l'app
(un éditeur sombre sur une app claire reste tout à fait lisible ; et Felix peut choisir un thème d'éditeur clair s'il préfère).

---

## 🔎 Comment c'est fait (themable, propre)

Le CSS était déjà prévu pour ça (commentaire d'origine : « Variables prêtes pour brancher Matrix / Light »).
Deux ajouts ont rendu **toutes** les couleurs themables :

- **`--accent-rgb`** = l'accent en composantes RGB (`34, 211, 238` en Void, `91, 91, 214` en Light).
  Les ~18 lueurs/halos écrits en dur (`rgba(34, 211, 238, a)`) sont devenus `rgba(var(--accent-rgb), a)`
  → ils suivent l'accent automatiquement (cyan en sombre, indigo en clair). Plus aucune couleur d'accent en dur.
- **`--bg-fade`** = le fondu sombre de la topbar, sorti en variable : `linear-gradient(var(--bg), var(--bg-fade))`.

Le bloc `[data-theme="light"]` n'override **que des variables de couleur**. `--glow`, `--radius`, les polices
et les tailles sont **hérités de `:root`** — `--glow` devient indigo tout seul puisqu'il référence `var(--accent-rgb)`.

**Pourquoi sur `<html>` et pas seulement `.app` ?** Parce que `body` peint le fond via `var(--bg)` au niveau `:root`.
Sans le thème sur `<html>`, on aurait un fond sombre derrière une app claire. Et **pas de flash** au chargement :
`:root` fournit déjà les valeurs Void avant que l'effet React ne pose l'attribut.

**Correctif au passage** : la ligne « À propos » des Réglages disait encore « Module 1 » → corrigée en
« live coding & solfège » (le brief C7 l'avait annoncée sans que le code suive).

---

## 🗂️ Fichiers touchés

- `src/styles.css` — `--accent-rgb` + `--bg-fade` dans le bloc Void ; bloc `[data-theme="light"]` complet ;
  `linear-gradient(var(--bg), var(--bg-fade))` ; `replace_all` des `rgba(34,211,238,a)` → `rgba(var(--accent-rgb),a)`.
- `src/App.jsx` — `theme:'void'` dans `DEFAULT_SETTINGS` ; `useEffect` qui pose `data-theme` sur `<html>` ;
  `.app` passe à `data-theme={settings.theme}`.
- `src/Settings.jsx` — constante `APP_THEMES` ; sélecteur de thème dans Apparence ; ligne « À propos » corrigée.

---

## 🧪 Vérifications (toutes vertes)

- **Build** : `vite build` propre, **34 modules**, `dist/` régénéré (bundles `index-CLhha_Pi.js` + `index-BXVl0h6z.css`),
  PWA OK, moteur `vendor/` conservé (non rebuildé).
- **Intégrité données** : `lessons.js` reconstruit et vérifié — **M1 = 26, M2 = 25, total 51 flashs**, ids `2.1→2.25`, syntaxe OK.
- **Montage runtime jsdom (`test-mount.mjs`)** : **15/15** — app montée (topbar, titre du flash, hôte éditeur),
  thème **Void par défaut sur `<html>` et `.app`**, ouverture Réglages, clic **Clair** → `data-theme=light` sur `<html>`+`.app`
  + persistance `keymaker:settings.theme=light`, retour **Void**, et cohabitation des autres réglages (Mémoire de Sati, Taille de texte).
- **Sentinelles bundle livré** : `[data-theme=light]` + `#5b5bd6` dans le CSS ; `Void (sombre)`, `live coding & solfège`,
  `data-theme` dans le JS ; `index.html` pointe sur les nouveaux bundles.

---

## ⚠️ Pièges rencontrés (à retenir)

- **Pont fichiers Cowork ↔ sandbox** (encore) : `lessons.js`/`App.jsx`/`styles.css`/`Settings.jsx` relus **tronqués/figés**
  au mount (657/646/1189/214 lignes, coupés en milieu de ligne). Mes outils **Read/Write/Edit restent autoritatifs** (complets).
  Parade : préfixe correct du mount (`sed` jusqu'à un ancrage sûr) **+ queue émise depuis le Read autoritatif** → build dans `/tmp`
  → `dist/` recopié (l'écriture sandbox → mount est fiable). Le moteur `vendor/` du projet est **conservé** (jamais recopié depuis `/tmp`).
- **`npm install` + timeout 45 s** : une install coupée laisse `node_modules` **incohérent** (esbuild carrément retiré au resume,
  cache npm corrompu → erreur « Invalid Version » au dedup). Remède : `npm cache clean --force`, réinstall, puis **installer
  explicitement le binaire natif `@esbuild/linux-x64@<version d'esbuild>`** (sinon `vite build` plante en *Bus error / core dumped*).

---

## 🏁 Definition of Done (Chantier 8)

- [x] Thème **Light** complet (`[data-theme="light"]`) + refactor `--accent-rgb` / `--bg-fade` (zéro accent en dur).
- [x] Bascule **Void / Clair** dans Réglages → Apparence, posée sur `<html>`, **persistée**.
- [x] Éditeur unique conservé (overlay Réglages), aucun réglage existant cassé.
- [x] Build propre (34 modules) + `dist/` livré (vendor conservé) + **15/15** montage runtime jsdom.
- [x] Roadmap + ce brief + README à jour.

---

## 👀 À revoir / notes

- **Visuel** : la palette Light est cohérente et contrastée, mais le rendu final se juge à l'œil — ouvre l'app,
  va dans ⚙ Réglages et bascule sur **Clair**. Dis-moi si une teinte te gêne (ex. cartes trop pâles, accent trop vif) → ajustement d'une variable.
- **Anciens bundles `dist/assets/`** : les builds précédents ont laissé des fichiers `index-*.js/.css` orphelins
  (l'`index.html` ne pointe que sur les nouveaux). Ils ne gênent pas, mais **ne servent plus** — à supprimer ensemble quand tu veux (règle « fichiers à jour »).
- **Suite possible** : thème **Matrix** (3ᵉ thème, vert), ou `theme-color`/manifeste PWA dynamiques selon le thème (détail).

---

*Chantier réalisé le 5 juin 2026. Prochaine session : valider le rendu Light à l'œil + trancher la suite (Matrix · Modules 3-6 · validation orale du Module 2).*
