# ꩜ Keymaker — l'app d'apprentissage Strudel CC + solfège

PWA en français pour apprendre **le live coding (Strudel CC)** et **le solfège** en même temps.
État actuel : **5 modules complets et jouables**, **126 flashs**, un guide IA (**Sati**) et un écran **Réglages**. Tout tourne 100 % en local ; Sati se branche sur ton Pi.

---

## ▶️ Lancer l'app (le plus simple)

**Double-clique sur `start.bat`.**

Une fenêtre noire s'ouvre (le serveur local) et ton navigateur ouvre l'app tout seul sur `http://localhost:4321`.

- Garde la fenêtre noire **ouverte** tant que tu utilises l'app. Pour arrêter : **ferme-la**.
- Tu arrives sur ton **dernier flash** (l'app retient le module **et** la position).
- **▶ Run** (ou `Ctrl+Enter`) joue le son · **Stop** (ou `Ctrl+.`) l'arrête.

> 💡 Le tout premier son d'un échantillon met une seconde à charger. Internet utile **au premier usage** ; ensuite c'est en cache.

---

## 🧭 Navigation

- **Précédent / Suivant** parcourent les flashs et **traversent les chapitres**.
- Indicateur **Ch.N · n/m** + points du chapitre courant.
- **☰ Parcours** ouvre la carte : sélecteur **Module 1 / 2 / 3 / 4 / 5**, chapitres repliables, clic pour aller à n'importe quel flash. Circulation **libre**.
- À la fin d'un module : bouton **« Module suivant ▶ »**.

---

## 📚 Le contenu

**Module 1 — Strudel & Live Coding** (26 flashs, 5 chapitres)
1. Premier contact (5) · 2. Le rythme (7) · 3. Le pouls (3) · 4. La hauteur (7) · 5. L'assemblage (4).
Le live coding : `sound()`, batterie, mini-notation, tempo/BPM, notes & gammes, `stack()` / `$:`.

**Module 2 — Solfège & Théorie musicale** (25 flashs, 5 chapitres)
1. Les 12 notes (5) · 2. Les intervalles (5) · 3. Les gammes (5) · 4. Les accords (5) · 5. La tonalité (5).
Le solfège **entendu dans Strudel** (chaque concept est audible), avec un pont permanent vers la guitare.

**Module 3 — Connexion Guitare** (25 flashs, 5 chapitres)
1. Le manche & l'accordage · 2. Lire le manche · 3. Les accords ouverts · 4. Power chords & barrés · 5. Le jeu.
Relie la théorie (Modules 1-2) à ta guitare : le manche, les positions, les accords, le jeu.

**Module 4 — Son & Effets** (25 flashs, 5 chapitres)
1. La source (ondes & bruit) · 2. Le filtre · 3. L'enveloppe (ADSR) · 4. L'espace (réverb & délai) · 5. La couleur & le mix.
Le son lui-même : fabriquer un timbre depuis l'onde brute, le filtrer, lui donner une forme (ADSR), un espace et de la couleur — chaque effet **audible**, ponts permanents vers M1/M2/M3.

**Module 5 — Informatique Musicale** (25 flashs, 5 chapitres)
1. Le pattern est une fonction · 2. Manipuler le temps · 3. Le hasard maîtrisé · 4. Accumulation & calques · 5. L'héritage & le grand tableau.
Le code comme instrument — fil rouge **« un pattern est une fonction du temps »** : fabriques (`stack`/`seq`/`cat`/`run`), transformations du temps (`slow`/`fast`/`rev`/`iter`/`ply`), hasard reproductible (`irand`/`degrade`/`sometimes`/`ribbon`), accumulation (`superimpose`/`off`/`echo`/`jux`), arrangement (`firstOf`/`chunk`), sortie **MIDI** — et un **morceau génératif final qui réunit les 5 modules**.

Chaque flash suit le même moule : **Concept → éditeur Strudel → Décodage → Théorie (solfège) → Exercice**, avec une **table récap** en fin de chapitre et un **exercice libre** en clôture.

---

## 🤖 Sati — le guide IA

Tiroir de chat (bouton **Sati** dans la barre du haut). Elle **voit ton flash et ton code live** et répond en français, en streaming.

- Actions rapides : *Explique ce flash* · *Corrige mon code* · *Un indice*. Modes **Normal** (Sonnet) / **Rapide** (Haiku).
- **Mémoire locale** (IndexedDB, hors-ligne) : le fil et les difficultés repérées survivent au rechargement.
- Sati vit sur **ton Pi** (la clé API n'est jamais dans le navigateur). Sans Pi, l'app reste 100 % utilisable, simplement sans Sati.

---

## ⚙ Réglages

Bouton **⚙ Réglages** : **thème (Void sombre / Clair / Matrix)**, taille de texte, réduire les animations, couleurs du code, numéros de ligne, URL du Pi + test, mémoire de Sati (voir / effacer), reprendre la progression à zéro.

---

## 🧩 Sous le capot

- **React + Vite + PWA** (`display: standalone`), thèmes **Void** (sombre, défaut, accent cyan), **Light** (clair, accent indigo) et **Matrix** (vert phosphore) — bascule dans les Réglages, posée sur `<html>`.
- **Une seule** instance d'éditeur **Strudel** (CodeMirror 6 + moteur), vendorisée dans `public/vendor/strudel-repl/` → **aucune dépendance CDN au runtime**. Jamais recréée en changeant de flash (on pousse juste le nouveau code).
- Reprise du dernier flash en `localStorage` ; mémoire de Sati en `IndexedDB`.
- Backend de Sati = module Docker `keymaker` sur le Pi (Fastify + Postgres, Tailscale-only).

---

## 🛠️ Pour développer (optionnel)

```bash
npm install      # une seule fois
npm run dev       # http://localhost:5173, se recharge à chaque modif
npm run build     # régénère le dossier dist/ servi par start.bat
```

`start.bat` sert le dossier **`dist/`** déjà construit — pas besoin de `npm install` juste pour utiliser l'app.

---

## 📁 Structure

```
keymaker-app/
├─ start.bat            ← double-clic pour lancer
├─ server.mjs           ← petit serveur local (zéro dépendance)
├─ index.html · vite.config.js
├─ src/
│  ├─ App.jsx           ← navigation multi-modules + overlays (Parcours / Sati / Réglages)
│  ├─ StrudelEditor.jsx ← wrapper React du moteur Strudel
│  ├─ SatiChat.jsx · sati.js   ← guide IA : tiroir de chat + client SSE du Pi
│  ├─ Settings.jsx      ← écran Réglages
│  ├─ memory.js         ← mémoire locale de Sati (IndexedDB)
│  ├─ lessons.js        ← contenu : modules = [module1...module5], 126 flashs
│  └─ styles.css        ← thème Void + cartes + nav + table récap + overlays
├─ public/
│  ├─ icons/            ← icônes PWA
│  └─ vendor/strudel-repl/  ← moteur Strudel (local)
└─ dist/                ← build prêt à servir (généré)
```

---

*Keymaker — Modules 1 à 5 complets (126 flashs) + Sati + Réglages (thèmes Void / Light / Matrix). Strudel v1.3.0. Mis à jour le 6 juin 2026 (Module 5 « Informatique Musicale »).*
