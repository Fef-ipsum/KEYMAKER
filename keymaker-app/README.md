# ꩜ Keymaker — l'app d'apprentissage Strudel CC + solfège

PWA en français pour apprendre **le live coding (Strudel CC)** et **le solfège** en même temps.
État actuel : **7 modules complets et jouables**, **176 flashs**, un écran **🏠 Accueil** (progression + streak), un **carnet de notes** et une **bibliothèque de snippets** par flash, un **visualiseur de rythme** (grille animée sous l'éditeur), le **partage vers strudel.cc**, un **🎛️ Studio** (bac à sable libre, hors leçon), un guide IA (**Sati**) et un écran **Réglages**. Tout tourne 100 % en local ; Sati se branche sur ton Pi.

---

## ▶️ Lancer l'app (le plus simple)

**Double-clique sur `start.bat`.**

Une fenêtre noire s'ouvre (le serveur local) et ton navigateur ouvre l'app tout seul sur `http://localhost:4321`.

- Garde la fenêtre noire **ouverte** tant que tu utilises l'app. Pour arrêter : **ferme-la**.
- Tu arrives sur ton **dernier flash** (l'app retient le module **et** la position).
- **▶ Run** (ou `Ctrl+Enter`) joue le son · **Stop** (ou `Ctrl+.`) l'arrête.
- **⤢ Focus** (barre du haut) ouvre le **Mode Focus** : tout disparaît sauf l'éditeur et Run/Stop, pour une session de pratique pure. On en sort par **Échap** ou le bouton **✕** en coin (le son ne s'interrompt pas).
- L'éditeur **complète les fonctions Strudel** pendant la frappe (Ctrl+Espace pour forcer) et **affiche les erreurs de code en clair** juste en dessous.
- **◫ Visualiseur** (à côté de Run/Stop) ouvre une **grille rythmique animée** : un curseur balaie le cycle et les blocs s'allument au passage du son — pour *voir* le rythme, pas seulement l'entendre. Optionnel, retenu dans les Réglages.

> 💡 Le tout premier son d'un échantillon met une seconde à charger. Internet utile **au premier usage** ; ensuite c'est en cache.

---

## 🧭 Navigation

- **Précédent / Suivant** parcourent les flashs et **traversent les chapitres**.
- Indicateur **Ch.N · n/m** + points du chapitre courant.
- **☰ Parcours** ouvre la carte : sélecteur **Module 1 à 7**, chapitres repliables, clic pour aller à n'importe quel flash. Circulation **libre**.
- À la fin d'un module : bouton **« Module suivant ▶ »**.

---

## 🏠 Accueil, carnet & partage

- **🏠 Accueil** (barre du haut, et à la 1ʳᵉ ouverture du jour) : ta **progression** d'un coup d'œil — **streak** (jours d'affilée), % par module, gros bouton **Reprendre**, accès rapide à chaque module, et **📌 Mes snippets**.
- **✎ Ma note** sous le concept de chaque flash : une note libre, **enregistrée toute seule**, hors-ligne — pour externaliser un truc à retenir.
- **📌 Bibliothèque de snippets** : sous l'éditeur, **☆ Sauvegarder** garde le pattern courant ; rouvre-le d'un clic depuis l'Accueil → il se charge dans l'éditeur.
- **↗ Ouvrir dans Strudel** ouvre ton code dans le REPL officiel strudel.cc · **⤓ Télécharger .js** l'enregistre en fichier propre.

Tout est **100 % local** (rien n'est envoyé) et **masqué en Mode Focus**.

---

## 🎛️ Studio — faire du son (hors leçon)

Bouton **🎛️ Studio** dans la barre du haut : un **bac à sable indépendant des leçons**. Pas de flash, pas de progression — juste un éditeur Strudel à toi pour **improviser et faire du son**.

- **Démarrage rapide** : une grille de *starters* (House, Breakbeat, Acid, Mélodie, Ambient, Techno). **Un clic = ça charge et ça joue.** Édite ensuite à ta guise.
- **🎲 Surprends-moi** : charge un pattern au hasard et le lance.
- **Tempo** : −/+ ajuste le BPM (réécrit la ligne `setcpm` en tête).
- **Run / Stop** (`Ctrl+Entrée` / `Ctrl+.`), **visualiseur** de rythme, **aide-mémoire** intégré.
- **☆ Sauvegarder** (dans ta bibliothèque) · **↗ Ouvrir dans Strudel** · **⤓ Télécharger .js** · **⟲ Vider**.
- **Sati à portée de clic** : elle voit ton code du Studio et propose des idées jouables (actions adaptées : *Donne-moi une idée*, *Améliore mon code*, *Surprends-moi*).

Ton code du Studio est **retenu d'une session à l'autre** (local). Le son de la leçon s'arrête quand tu entres dans le Studio (un seul moteur joue à la fois). On en sort par **✕ Fermer** ou **Échap**.

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

**Module 6 — Composition & Projets** (25 flashs, 5 chapitres)
1. Le studio dans le navigateur (le stack live) · 2. Réutiliser : variables & fonctions · 3. Arranger dans le temps · 4. La matière d'un track · 5. Finir, jouer, partager.
De la boucle au **morceau complet** — fil rouge **« d'une boucle à un morceau »** : le stack live (`$:`, pistes nommées, mute `_`, `all()`), la réutilisation (`const`, `register`, `color`), l'arrangement (`arrange`/`mask`/`pick`), la matière sonore (`samples`/`chop`/`slice`/`layer`), le mix (`gain`/`pan`/`orbit`), le live set, l'**export** (onglet export, OBS, MIDI/OSC) et la PWA — clôturé par un **projet final qui réunit les six modules**.

Chaque flash suit le même moule : **Concept → éditeur Strudel → Décodage → Théorie (solfège) → Exercice**, avec une **table récap** en fin de chapitre et un **exercice libre** en clôture.

---

## 🤖 Sati — le guide IA

Tiroir de chat (bouton **Sati** dans la barre du haut). Elle **voit ton flash et ton code live** et répond en français, en streaming.

- Actions rapides : *Explique ce flash* · *Corrige mon code* · *Un indice*. Modes **Normal** (Sonnet) / **Rapide** (Haiku).
- **Mémoire locale** (IndexedDB, hors-ligne) : le fil et les difficultés repérées survivent au rechargement.
- Sati vit sur **ton Pi** (la clé API n'est jamais dans le navigateur). Sans Pi, l'app reste 100 % utilisable, simplement sans Sati.

---

## ⚙ Réglages

Bouton **⚙ Réglages** : **thème (Void sombre / Clair / Matrix)**, taille de texte, réduire les animations, couleurs du code, numéros de ligne, **auto-complétion** (ON par défaut), URL du Pi + test, mémoire de Sati (voir / effacer), reprendre la progression à zéro.

---

## 🧩 Sous le capot

- **React + Vite + PWA** (`display: standalone`), thèmes **Void** (sombre, défaut, accent cyan), **Light** (clair, accent indigo) et **Matrix** (vert phosphore) — bascule dans les Réglages, posée sur `<html>`.
- **Une seule** instance d'éditeur **Strudel** (CodeMirror 6 + moteur), vendorisée dans `public/vendor/strudel-repl/` → **aucune dépendance CDN au runtime**. Jamais recréée en changeant de flash (on pousse juste le nouveau code). L'**auto-complétion** et les **erreurs inline** passent par l'API du moteur (`setAutocompletionEnabled`, événement `update.detail.error`) ; le **Mode Focus** est une simple classe CSS sur `.app` (l'éditeur n'est jamais recréé en entrant/sortant).
- Reprise du dernier flash + **suivi de progression** (flashs vus, streak) en `localStorage` ; mémoire de Sati, **carnet de notes** et **bibliothèque de snippets** en `IndexedDB` (base `keymaker`, **v2** — la migration préserve les données existantes).
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
│  ├─ App.jsx           ← navigation multi-modules + overlays (Accueil / Parcours / Sati / Réglages / Bibliothèque)
│  ├─ Dashboard.jsx     ← écran Accueil : progression, streak, % par module (Chantier 16)
│  ├─ progress.js       ← suivi local : flashs vus + jours/streak (localStorage)
│  ├─ FlashNote.jsx     ← carnet de notes par flash (Chantier 24)
│  ├─ SnippetLibrary.jsx← bibliothèque de snippets (Chantier 27)
│  ├─ notebook.js       ← opérations notes + snippets (IndexedDB v2)
│  ├─ StrudelEditor.jsx ← wrapper React du moteur Strudel
│  ├─ SatiChat.jsx · sati.js   ← guide IA : tiroir de chat + client SSE du Pi
│  ├─ Settings.jsx      ← écran Réglages
│  ├─ memory.js         ← mémoire locale de Sati + schéma IndexedDB v2 (stores notes/snippets)
│  ├─ lessons.js        ← contenu : modules = [module1...module7], 176 flashs (M7 dans module7.js)
│  └─ styles.css        ← thème Void + cartes + nav + table récap + overlays
├─ public/
│  ├─ icons/            ← icônes PWA
│  └─ vendor/strudel-repl/  ← moteur Strudel (local)
└─ dist/                ← build prêt à servir (généré)
```

---

*Keymaker — Modules 1 à 7 complets (176 flashs) + **Studio (bac à sable)** + Sati + Réglages (thèmes Void / Light / Matrix) + **Mode Focus** + **auto-complétion & erreurs inline** + **Accueil/progression**, **carnet de notes**, **bibliothèque de snippets**, **partage/export** et **visualiseur de rythme**. Strudel v1.3.0. Mis à jour le 8 juin 2026 (Chantier 32 — Studio REPL, en autonomie).*
