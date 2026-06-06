# Chantier 26 — Visualiseur de pattern ✅ (6 juin 2026, en autonomie)

> Une **grille rythmique animée** sous l'éditeur : voir le temps, pas seulement l'entendre.
> Felix a choisi ce chantier (⭐ « super intéressant » dans la roadmap) pour la suite.

## Pourquoi
Le gap cognitif le plus courant en live coding : entendre un rythme sans *voir* sa structure.
`"bd sd [hh hh] sd"` se comprend mieux dessiné qu'imaginé. Et pour le **solfège**, voir les
subdivisions d'un cycle (les 16 pas, les 4 temps) ancre la lecture rythmique. Cible TDA :
un retour visuel immédiat, motivant, sans quitter l'éditeur.

## Ce qui est livré
- **Panneau escamotable sous l'éditeur** (pas un overlay) : on voit **code + grille + son** ensemble.
- **Grille à voies** : une ligne par voix (son `s`, note, `n`…), 16 subdivisions, les 4 temps marqués.
- **Curseur de lecture** qui balaie le cycle, calé sur le scheduler — les blocs s'allument au passage.
- **Quand c'est arrêté** : la structure du cycle 0 reste affichée (utile pour étudier en silence).
- **Avant le 1er Run** : message « ▶ Lance le son pour voir le rythme ».
- **Thème-aware** (Void / Clair / Matrix) : les couleurs sont lues sur les variables CSS.
- **Réglage persisté** `keymaker:settings.viz` (bouton `◫ Visualiseur` dans la barre Run/Stop), **OFF par défaut** (zéro surcharge).
- Respecte **réduire les animations** (pas de lueur/halo) et **reste visible en Mode Focus**.

## L'éditeur n'est JAMAIS recréé
Le visualiseur **lit** l'instance `StrudelMirror` existante (`editorRef.current`) — il ne la
remonte pas. Le son ne s'interrompt donc jamais quand on ouvre/ferme le panneau (invariant
hérité des Chantiers 21/22).

## API du moteur — vérifiée à la source (bundle vendor)
La roadmap proposait de passer par l'événement `update`. À l'étude, plus direct et fiable :
- `editor.pattern` = le **Pattern** courant (posé après `evaluate()`), avec `pattern.queryArc(begin, end)` → les *haps* du cycle.
- Le **scheduler** (`editor.repl.scheduler`, replis multiples) expose `now()` = **temps en cycles** (fractionnaire) → `cycle = floor(now)`, `phase = now - cycle`.
- Un *hap* discret a `whole {begin,end}` (Fractions, `.valueOf()`) + `value`. Les continus (sans `whole`) sont ignorés pour la grille.
> Confirmé en lisant `public/vendor/strudel-repl/index-1NNF4L0p.js` (classe Drawer : `this.scheduler.now()` + `this.scheduler.pattern.queryArc(...)`, painter `punchcard`). Cohérent avec `KEYMAKER_strudel_reference.md`.

## Fichiers
- **`src/vizCore.js`** *(nouveau)* — cœur **pur** et testable : accès moteur (`getScheduler`/`getPattern`/`schedNow`), `num` (Fraction→nombre), `laneLabel`, `processHaps` (filtre discrets, positions 0..1, voies stables entre cycles).
- **`src/PatternViz.jsx`** *(nouveau)* — le composant canvas (rAF, dessin, thème), importe `vizCore`.
- **`src/App.jsx`** — réglage `viz`, bouton `◫ Visualiseur`, rendu du panneau sous les contrôles (passe `editorRef`, `playing`, `theme`, `reduceMotion`).
- **`src/styles.css`** — styles `.viz*` + `.btn.viz-toggle` (tokens du thème).

## Build & vérifs
- Build propre **vite 6.4.3** : **42 modules**, bundle `index-BdUZ88b0.js` (398,3 kB) + CSS `index-CcUo1K63.css` (32,6 kB). Binaires Linux esbuild/rollup déjà injectés (gitignorés).
- **vizCore : 32/32** (node) — Fraction, étiquettes, accès multi-chemins, `processHaps` (continus ignorés, voies stables sur 2 cycles).
- **SSR PatternViz : 8/8** — rendu du markup (arrêté/live, bouton fermer conditionnel) sans exception.
- **Intégrité : 176 flashs / 7 modules** (inchangé). Sentinelles présentes dans le bundle **livré sur le mont** (byte-identique au build).

## Incident & parade (le pont qui tronque, encore)
Premier build **échoué** : le mont a servi un **`App.jsx` tronqué** (954 l. au lieu de 982) à la copie de build. Parade appliquée : **reconstruire `App.jsx` depuis `git show HEAD` + ré-appliquer les 5 edits en Python**, vérifier la complétude (fin de fichier + marqueurs), puis **écrire via bash** (rafraîchit le cache du mont) sur le mont **et** l'arbre de build. Rebuild → vert. *(Même famille de piège qu'au Chantier 10.)*

## Reste
- **Validation à l'œil par Felix** : ouvrir `◫ Visualiseur`, lancer un pattern, vérifier que le curseur et les blocs collent au son (surtout `<a b>` qui change de cycle en cycle).
- Idées futures : nombre de pas adaptatif (détecter la subdivision), repli vertical par module, mini-mode dans le Mode Focus.

## Clôture
Working tree à jour, `dist/` livré (suivi par git). **HEAD avait un `lessons.js` corrompu (tripliqué) — réparé dans le working tree** ; le commit de clôture (`git add .`) assainit HEAD. `close_session.bat` **auto-répare désormais un `index.lock` périmé** avant de committer.
