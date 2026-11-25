# Notes de travail — Keymaker 2

*Une leçon par entrée, résumé en première ligne. Mis à jour le 12 novembre 2026.*

## État du chantier (à lire en premier pour reprendre)

**Construction terminée ; relectures faites (exactitude, parcours débutant) et corrigées ; déploiement, commit et push en cours.**

- Fait : audit, pédagogie, 8 chapitres des fondations (53 étapes à exercice vérifié localement), wiki (483 entrées), 5 genres (8 traits chacun), adaptateur des anciens modules, interface complète, migration des données, hors ligne (service worker écrit à la main + pack de sons de 345 fichiers, 35 Mo), note « Refaire un morceau », tests.
- Vérifié : `npm run check` (chaque exemple exécuté dans le moteur, chaque exercice : départ ≠ validé, solution = validée) ; `npm run smoke` (3 tailles × 2 thèmes, parcours débutant, migration, hors ligne) : tout passe.
- Le Pi sert toujours l'ancienne app tant que le déploiement n'est pas fait.

## La documentation officielle est dans le moteur

**`public/vendor/strudel-repl/index.js` contient la doc JSDoc de Strudel 1.3.0 (509 entrées) et toutes les déclarations de contrôles avec leurs alias.**
`node scripts/extract-docs.mjs lpf stut voicing` l'affiche ; `npm run reference` en tire `src/content/wiki/reference.json`. Source de vérité du wiki, hors ligne et exactement pour la version embarquée.

## Faits Strudel vérifiés dans le moteur

**Vérifiés par exécution (`node scripts/harness.mjs '<code>'`), à ne pas réécrire de mémoire.**

- `c` = `c3` = MIDI 48 ; `c4` = 60.
- `chord("Cmaj7").voicing()` ne joue rien, sans erreur. Le majeur 7 s'écrit `C^7`. `chord("am")` (minuscule) ne joue rien.
- `scale("C minor")` (avec espace) : erreur « Scale name C is incomplete » ; il faut `"C:minor"`.
- `.add(12)` ou `.add("<0 3 5>")` sur des notes : avertissement « Can't do arithmetic on control pattern » ; il faut `.add(note(12))`. Plusieurs anciennes leçons l'utilisaient : corrigées.
- `register('nom', …)` et `samples('github:…')` exigent des guillemets SIMPLES ; entre guillemets doubles, le texte est lu comme de la mini-notation et échoue.
- `?0.2` retire environ 20 % des événements. `"bd ! sd"` = `"bd bd sd"`.
- `a.b(motif)` garde le rythme de `a` : `sound("piano").note("c e g")` ne joue qu'une note par cycle.
- `delaytime` est en secondes ; `delaysync` en cycles (défaut 3/16). `delay(".5:.25:.6")` règle les trois.
- `duck(n)` se pose sur le kick et désigne l'orbit à faire plonger ; cette orbit doit exister (sinon « duck target orbit 2 does not exist ») : déclarer la piste `.orbit(2)` AVANT la piste qui la fait plonger.
- `stut`, `voicings` et `shape` sont marqués dépréciés dans la doc embarquée. `every` existe et se comporte comme `firstOf`.
- `_$:` coupe une piste. `const x = …` fonctionne avec `$:`.
- Le motif évalué est interrogeable : `editor.repl.state.pattern.queryArc(0, 1)`. C'est la base de la validation locale des exercices (`src/lib/check.js`).

## Pièges techniques

**Ne jamais déplacer `<strudel-editor>` dans le DOM.** Son `connectedCallback` recrée un éditeur. Un seul éditeur, monté une fois (`EditorDock`), masqué quand l'écran n'en a pas besoin ; chaque écran en « prend possession » avec une clé (`src/lib/dock.js`).

**Ctrl+Entrée passe par `editor.evaluate()`, pas par notre bouton.** `engine.js` enveloppe `evaluate` pour que clavier et bouton suivent le même chemin (erreurs, validation des exercices).

**Pendant une évaluation, le moteur annonce encore l'ANCIENNE erreur.** L'événement `update` part au début d'`evaluate` avec l'état précédent (`error = evalError || schedulerError`, remis à zéro seulement en fin d'évaluation). Ne jamais en tirer d'erreur pendant qu'on évalue (drapeau `evaluating` dans `engine.js`), sinon le message rouge reste après correction.

**Le tempo persiste d'une évaluation à l'autre** (comme sur strudel.cc). Dans l'app, un code sans `setcpm`/`setcps` repart à 0,5 cycle par seconde (`engine.js` et `scripts/harness.mjs` appliquent la même règle). Le wiki explique la différence avec strudel.cc.

**Code demandé avant que l'éditeur soit prêt = code perdu.** Au rechargement ou par lien direct, l'écran réclame l'éditeur avant sa création : `engine.setCode` garde ce code en attente et le pose dès que l'éditeur existe.

**Les captures « avant lecture » ne suffisent pas.** La rangée de lecture change de largeur quand la musique joue (bouton « Relancer ») : le débordement au téléphone n'apparaissait qu'après ▶. Le test de fumée mesure maintenant aussi pendant la lecture.

**Git Bash transforme les arguments qui commencent par `/`** (`--base=/keymaker/app/` devient `C:/Program Files/Git/keymaker/app/`). Passer par `npm run build:pi` (exécuté par cmd) ou préfixer `MSYS_NO_PATHCONV=1`.

**Un exemple officiel peut demander des sons absents du pack.** `npm run samples` écarte du wiki (via `reference-skip.json`) les exemples de la référence officielle qui ont besoin de sons non embarqués : tout ce qui est affiché joue hors ligne.

**`tidal-drum-machines-alias.json` n'existe pas (404).** Ne pas le reprendre dans la liste des banques.

**Shell** : pas de `node -e "…"` avec des accents graves ou des guillemets imbriqués sous Git Bash ; écrire un fichier `.mjs`.

## Hors ligne et mises à jour

**Le pack de sons est construit en jouant chaque exemple du contenu.** `scripts/build-sample-pack.mjs` relève les sons nommés (32 cycles) et les adresses réellement demandées, copie les fichiers dans `public/samples/` et écrit `manifest.json`. `src/lib/offline.js` redirige les adresses GitHub vers ces copies et range le pack dans le cache au premier lancement.

**Le pack n'est pas versionné** (sons tiers, 35 Mo) ; la build refuse de se faire sans lui (garde-fou dans `vite.config.js`).

**Passage depuis l'app d'origine** : l'ancien service worker (Workbox) se mettait à jour seul. Le nouveau fait `skipWaiting` UNE fois, s'il trouve un cache `workbox-precache*`, puis recharge les pages ouvertes (`client.navigate`) : Keymaker 2 apparaît environ 4 secondes après la première ouverture. Ensuite, les mises à jour attendent que l'utilisateur les accepte (bandeau sur l'accueil).

**Ne jamais attendre `client.navigate()` dans le `waitUntil` de l'activation** : la navigation attend la fin de l'activation, qui l'attend elle-même (interblocage constaté). La déclencher après.

## Schémas vivants (23 novembre 2026)

**Tout est dans `docs/SCHEMAS.md` ; lire son §0 pour reprendre.** Pièges rencontrés, à ne pas refaire :

**`cancelScheduledValues` pendant une rampe laisse UN échantillon à l'ancienne valeur dans Chrome** (un clic). Utiliser `freezeAt` (`src/schemas/core/synth.js`, `cancelAndHoldAtTime` quand il existe).

**Un filtre partagé entre les notes ne sonne pas comme Strudel** : avec une forte résonance, il continue de sonner d'une note à l'autre (+26 % mesuré). Superdough donne un filtre à chaque note et le range à fin + extinction.

**Superdough range ses notes sur un événement asynchrone** : juste après la fin d'une note, deux rendus du même code diffèrent. Comparer hors de ces zones (7 τ si un filtre résonne).

**La réserve de nœuds de superdough est commune à tous les contextes audio** : un deuxième `OfflineAudioContext` plante. Un seul contexte hors temps réel par page de test, et évaluer avec `repl.evaluate(code, false)` (sans lecture) pour ne pas y faire fuir des nœuds du contexte de la page.

**Le niveau des ondes intégrées dépend du navigateur** (Chrome : carré et dent de scie ×0,848). Ne jamais affirmer qu'elles ont le même volume.

**Un schéma doit repartir de sa déclaration quand on change d'entrée du wiki** : React réutilise le composant ; `Schema.jsx` lui donne une clé = la déclaration.

**`window.mini`, `window.note`… n'existent qu'une fois le moteur chargé** : les schémas qui en ont besoin attendent (`Schema.jsx`, « Le moteur se prépare… »).
