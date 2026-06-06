# Chantier 31 — Intégration PO-33 KO (FAIT, 6 juin 2026, en autonomie)

> Le pont entre le code et le geste physique. Deux tranches livrées d'affilée :
> tes sons faits main dans Strudel (sampling) + un générateur de sync audio qui
> verrouille le PO-33 sur le tempo de Strudel. 100 % front-end (`keymaker-app/`),
> aucune touche au backend Pi.

## Ce qui est livré

### Tranche 1 — Tes sons dans Strudel
- **Dossier `public/sounds/po33/`** (+ `README.md` : workflow enregistrer → exporter → déposer → `samples()`), prêt à recevoir les `.wav` exportés du PO-33.
- **Module 8 « Hardware & PO-33 »** — court module, 2 chapitres, **5 flashs** :
  - Ch.1 « Tes sons » : 8.1 pipeline de sampling · 8.2 charger/nommer le kit (`samples({nom:url})`) · 8.3 chopper un break (`chop`/`slice`/`fit`/`cut`).
  - Ch.2 « Sync live » : 8.4 la sync 2 PPQN + câblage + mode SY2 · 8.5 le duo live (Strudel mène, PO suit).
- Intégré via `modules = [module1..module8]` dans `lessons.js` (import `module8.js`). **Total : 181 flashs.**

### Tranche 2 — Sync audio PO-33 ↔ Strudel
- **`syncCore.js`** — cœur PUR (sans Web Audio/DOM) : conversion `cps ↔ BPM` (convention 4/4), débit de pulses (2 PPQN = **8 clics/cycle**), `pulsesInWindow()` (planification à lookahead, ré-ancrée chaque tick → zéro dérive). Testé **37/37** + **simulation contrôleur 6/6**.
- **`PoSync.jsx`** — générateur Web Audio : clics carrés courts (~6 ms) sur le **canal GAUCHE** (via `ChannelMerger`), calés en direct sur `scheduler.cps` + `scheduler.now()`. Panneau escamotable sous l'éditeur (même patron que le Visualiseur C26) : affichage **BPM live**, schéma de câblage, étapes (câble Y, mode SY2, `pan(1)`). Bouton **◧ Sync PO-33** dans les contrôles, réglage persisté `keymaker:settings.posync` (OFF par défaut), thème-aware (Void/Clair/Matrix).

## Décisions & corrections techniques

- **Protocole de sync (corrigé vs roadmap).** Vérifié à la source : la sync Pocket Operator = **2 PPQN** (2 clics par temps, pas « BPM/60 Hz »), portée par le **canal GAUCHE** (le droit = audio), en **clics courts** (gated pulse < 0,125 s, < 5 V). Le PO se met en suiveur via **SY2** (maintiens *record* + tape *bpm*). Réf : spongefile « Pocket Operator sync modes explained ».
- **Lecture du tempo, pas de pilotage.** Le tempo vit dans le code de l'élève (`setcpm`/`setcps`). On lit `editor.repl.scheduler.cps` et `scheduler.now()` (via `getScheduler`/`schedNow` de `vizCore.js`). L'éditeur n'est jamais recréé.
- **Horloge sans dérive.** AudioContext partagé de Strudel atteint si possible (probe défensif) ; sinon AudioContext maison. Dans les deux cas, on lit `(nowCycle, audioNow=ctx.currentTime)` au même instant comme ancre, et on ré-ancre à chaque tick (30 ms, lookahead 120 ms) → l'erreur reste bornée, le PO suit la cadence exacte dérivée du `cps`.
- **Routage canal gauche.** Clic → `ChannelMerger` entrée 0 (gauche) uniquement ; la droite reste silencieuse côté générateur. La musique de Strudel se panne à droite côté contenu (`all(x => x.pan(1))`).
- **Compromis stéréo (assumé & documenté).** Sur un seul câble Y, garder la gauche propre impose `pan(1)` → la musique passe en **mono (droite)** et les panoramiques (`pan(sine/perlin)`, `jux`) sont neutralisés le temps de la sync. Noté dans le flash 8.4. Échappatoire (futur) : 2ᵉ sortie audio dédiée aux clics → stéréo préservée.

## Fichiers touchés
- **Nouveaux** : `src/syncCore.js`, `src/PoSync.jsx`, `src/module8.js`, `public/sounds/po33/README.md` (+ `.gitkeep`), `chantier31/test_synccore.mjs`.
- **Modifiés** : `src/lessons.js` (import + tableau `modules`), `src/App.jsx` (import PoSync, `DEFAULT_SETTINGS.posync`, bouton ◧, rendu du panneau, props), `src/styles.css` (bloc `.posync*`), `dist/` (rebuild byte-vérifié).

## Vérifications
- **Build** propre : `vite build` → **45 modules** (était 42), bundle `index-Brm7iWQm.js` 412,6 kB.
- **Tests cœur** : `syncCore` **37/37** + **simulation contrôleur 6/6** (train de clics contigu, sans doublon, espacement 0,25 s à 120 BPM, réactif au changement de tempo).
- **Intégrité données** : **181 flashs**, 0 champ essentiel manquant ; doublons d'`id` = uniquement les préexistants (schéma `chapitre.flash`, non global).
- **Sentinelles** dans le bundle MONTÉ : `posync`×17, `Sync PO-33`×7, `SY2`×6, `/sounds/po33/`×13 (+ `.posync` ×19 dans le CSS).
- **dist propagé** : nouveau JS/CSS `cmp`-identiques dans le mont (zéro troncature), `index.html` → nouveau bundle.

## Reste à valider AVEC Felix (matériel)
- **Test audio de bout en bout** : Felix a son PO-33, pas encore le câble Y. À faire dès qu'il l'a → câble *séparateur L/R* (3,5 mm stéréo → 2× mono), **pas** un doubleur casque. Test du câble fourni dans le chat (kick à gauche / charley à droite). Brancher gauche → line-in PO, PO en **SY2**, activer ◧ Sync PO-33, `setcpm` → le PO doit suivre, tempo verrouillé.
