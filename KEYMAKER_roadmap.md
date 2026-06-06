# Keymaker — Roadmap & tableau de bord

> Point d'entrée du projet. À relire au début de chaque conversation.
> **Felix :** pour lancer un chantier, ouvre une nouvelle conversation dans le projet et dis simplement son nom (ex. « on attaque le Chantier 3 »). Claude relit ce dossier et reprend là où on s'est arrêtés.

---

## Où on en est (5 juin 2026)

> 🔑 **Accès Pi (4 juin 2026)** — le Claude du projet Keymaker a un accès SSH dédié au Pi (clé `.ssh-keymaker/id_ed25519`, user `felix`, via Tailscale). Câblage infra **vérifié à la source** ce jour. Contrat de frontière : `KEYMAKER_CONTRAT.md` · message pour Personal OS : `POUR_PERSONAL_OS_collaboration.md`.

- ✅ Brainstorming & architecture → `KEYMAKER_architecture.md`
- ✅ Module 1 — contenu détaillé validé → `KEYMAKER_module1.md`
- ✅ Framework tranché : **React**
- ✅ **Chantier 1 — Prototype livré** → dossier `keymaker-app/` (Flash 1.1 jouable)
- 🔧 **Correctif appliqué** : LED « en cours / arrêté » synchronisée aussi avec le clavier (Ctrl+Enter / Ctrl+.)
- ✅ **Chantier 2 — Chapitre 1 complet livré** → 5 flashs navigables (Précédent/Suivant + n/5), écran Learn, reprise du dernier flash (localStorage)
- ✅ **Chantier 3 — COMPLET** : structure multi-chapitres + navigation inter-chapitres + Parcours 5 chapitres + **Module 1 entier** (26 flashs, chapitres 1-5, toutes les tables récap)
- ✅ **Chantier 4 — COMPLET (3 juin 2026)** : backend de Sati livré comme **module Docker du Personal OS** (et non PocketBase). Module `keymaker` (Fastify+TS, port 3017) : proxy IA streaming `/keymaker/ai/chat`, schema Postgres `keymaker.*`, routé par Caddy, Tailscale-only. **Test bout-en-bout vert.** → détails : `KEYMAKER_chantier4.md`
- ✅ **Chantier 5 — tranche 1 « Sati parle » livrée (3 juin 2026)** : tiroir de chat branché au proxy du Pi, **streaming token-par-token**, contexte live (flash courant + code de l'éditeur), mémoire de session. **Test bout-en-bout vert** : Sati lit le code et répond en direct. → détails : `KEYMAKER_chantier5.md`
- ✅ **Chantier 6 — COMPLET (4 juin 2026)** : écran **⚙ Réglages** (overlay, même patron que Parcours/Sati) avec Apparence (taille de texte 3 niveaux, réduire animations), Éditeur (couleurs du code, numéros de ligne), Connexion au Pi (URL + test), Données (reprendre à zéro + confirmation), À propos. Tous réglages persistés `keymaker:settings`. → détails : `KEYMAKER_chantier6.md`
- ✅ **Chantier 5 — tranche 2 « mémoire locale » LIVRÉE (4 juin 2026)** : le fil global + les difficultés repérées sont persistés en **IndexedDB** (offline, survit au rechargement). Nouveau panneau **Réglages → Mémoire de Sati** : voir les compteurs + les repères, **Effacer** la mémoire (avec confirmation). Vérif : **39/39** (couche IndexedDB + helpers via fake-indexeddb) + **8/8** (UI Réglages en jsdom) + build propre 34 modules + sentinelles dans le bundle livré. → détails : `KEYMAKER_chantier5.md`
- ✅ **Chantier 7 — COMPLET (4 juin 2026, en autonomie)** : **Module 2 « Solfège & Théorie musicale »** (5 chapitres, **25 flashs** : les 12 notes · intervalles · gammes · accords · tonalité — solfège enseigné *à travers* Strudel, ponts guitare) + **navigation multi-modules** (sélecteur de module dans le Parcours, reprise `{m,c,f}` avec migration, bouton « module suivant »). Strudel vérifié en direct contre strudel.cc. Build propre (34 modules) + **16/16** intégrité données + **13/13** montage runtime jsdom + sentinelles dans le bundle. → détails : `KEYMAKER_chantier7.md`
- ✅ **Chantier 5 — tranche 3 « mémoire distante » LIVRÉE (5 juin 2026)** : journal + embeddings Voyage + **rappel cosinus sémantique** sur `keymaker.journal` (côté Pi), injecté dans le prompt de Sati. **Premier dev déployé en direct par SSH** (build `tsc` + `up -d --no-deps`, **postgres intact**). Test bout-en-bout vert : Sati référence une difficulté passée (voicing) sur une question **reformulée sans history** (dist 0,44 < 0,55). Commit `2f0debe` sur `origin/main`. → `KEYMAKER_chantier5.md`. **Chantier 5 COMPLET.**
- ✅ **Chantier 8 — « Thème clair » COMPLET (5 juin 2026)** : 2ᵉ thème CSS complet (**Light**, accent indigo `#5b5bd6`) + bascule **Void / Clair** dans ⚙ Réglages → Apparence, posée sur `<html>` et persistée (`keymaker:settings.theme`). Refactor themable (`--accent-rgb` → toutes les lueurs suivent l'accent). Build propre (34 modules) + **15/15** montage runtime jsdom (bascule + persistance). Aussi : **contrôle de cohérence docs↔app** (README & architecture resync, règle « tous les fichiers à jour »). → `KEYMAKER_chantier8.md`
- ✅ **Module 3 « Connexion Guitare » (5 juin 2026, autre session)** : 5 chapitres, 25 flashs (3.1→3.25) — le manche & l'accordage · lire le manche · accords ouverts · power chords & barrés · le jeu. Intégré via `modules = [module1, module2, module3]`. **Réconcilié le 5 juin** : app rebuildée (3 modules + thème clair), docs resync. → `KEYMAKER_chantier9.md`
- ✅ **Chantier 10 — Module 4 « Son & Effets » FAIT (6 juin 2026, en autonomie)** : 5 chapitres, **25 flashs (4.1→4.25)** — la source (ondes sine/triangle/square/sawtooth + bruit) · le filtre (lpf/lpq, hpf/bpf, balayage LFO) · l'enveloppe (ADSR + enveloppe de filtre lpenv) · l'espace (réverb, délai, délai calé au tempo, orbits) · la couleur & le mix (distort/crush, phaser/vib, pan, chaîne du signal). Intégré via `modules = [module1, module2, module3, module4]` (aucune modif `App.jsx`). Strudel vérifié **en direct** sur strudel.cc (effects + synths). Build propre (**34 modules**, bundle `index-oQUh9Mac.js`) + tests **86/86** données + **14/14** navigation + sentinelles. → `KEYMAKER_chantier10.md`
- ✅ **Chantier 11 — Thème Matrix (vert) FAIT (6 juin 2026, en autonomie)** : 3ᵉ thème CSS `[data-theme="matrix"]` (vert phosphore `#00ff66` sur quasi-noir) + 3ᵉ option **Matrix** dans ⚙ Réglages → Apparence (sélecteur Void / Clair / Matrix). Même patron que le thème clair (Chantier 8) : n'override que les 13 variables de couleur, posé sur `<html>`, persisté `keymaker:settings.theme`. Build propre (34 modules, `index-BmpEACbd.js` + `index-Dh5zhh25.css`). → `KEYMAKER_chantier11.md`
- 📖 **Référence Strudel à jour (5 juin 2026)** → `KEYMAKER_strudel_reference.md` : source de vérité distillée de strudel.cc (notes/hauteurs, sons GM + limites, mini-notation, effets, théorie, gotchas). **À consulter avant d'écrire du code Strudel** (cutoff Claude = mai 2025). Née de la validation M3 : `note("e2")` = 82 Hz (code guitare juste). **Cause du Mi grave muet trouvée & corrigée (5 juin)** : `gm_acoustic_guitar_steel` ne descend pas au Mi grave → 6 flashs (3.2, 3.3, 3.6, 3.8, 3.11, 3.12) passés en **nylon**, app rebuildée (bundle `index-CekULCjI.js`, 34 modules) + intégrité 94/94.

> Pour lancer l'app : double-clic sur `keymaker-app/start.bat`. Tu arrives sur ton **dernier flash** ; **Run** (ou `Ctrl+Enter`) joue le son, **Précédent / Suivant** parcourent les flashs du module en traversant les chapitres, le bouton **Parcours** ouvre la carte — désormais avec un **sélecteur Module 1 / 2 / 3 / 4** — et le bouton **⚙ Réglages** ouvre la configuration (taille de texte, thème éditeur, numéros de ligne, URL Pi, reprendre à zéro). **Quatre modules** maintenant : Module 1 (live coding, 26 flashs), Module 2 (solfège, 25 flashs), Module 3 (Connexion Guitare, 25 flashs) et Module 4 (Son & Effets, 25 flashs) — **101 flashs** au total.

---

## Méthode de travail

- On construit **par tranches qui marchent**, pas l'app d'un seul bloc.
- Les fichiers de ce dossier = la **mémoire durable** du projet. Claude les relit à chaque session.
- **Une conversation = un chantier cadré** (début et fin clairs). Faible friction, TDA-friendly.
- **Tous les fichiers tenus à jour pendant ET à la fin de chaque session** (docs `KEYMAKER_*.md` + `README.md` + code). Un fichier qui ne sert plus : on en parle, on le supprime **ensemble** — jamais de suppression unilatérale. *(Règle posée par Felix, 4 juin 2026.)*

---

## Chantiers

### ✅ Chantier 1 — Prototype (slice vertical) — FAIT (2 juin 2026)
App minimale mais **réelle**, livrée dans `keymaker-app/`.
- ✅ Squelette React + Vite + PWA (manifeste `standalone`)
- ✅ Thème **Void** appliqué (variables CSS prêtes pour Matrix/Light)
- ✅ Éditeur Strudel embarqué (CodeMirror 6 + moteur Strudel)
- ✅ **Leçon 1.1 jouable** : `sound("casio")` → bouton Run → premier son
- ✅ Tourne 100 % en local (moteur vendorisé) — **pas besoin du Pi**
- ✅ Vérifié : build propre + test de montage navigateur sans erreur
- 📌 Détails techniques → section « Décisions techniques (Chantier 1) » plus bas

### ✅ Chantier 2 — Chapitre 1 complet — FAIT (2 juin 2026)
Les 5 flashs de « Premier contact », navigables, livrés dans `keymaker-app/`.
- ✅ Données : `src/lessons.js` → objet `chapitre1` (5 flashs : `kicker`, `concept`, `code`, `decode`, `theory`, `exercise`, `free`)
- ✅ Composant `Flash` réutilisable + **une seule** instance d'éditeur (changement de flash = `stop()` puis `setCode()`)
- ✅ Navigation **Précédent / Suivant** + indicateur **n/5** + points de progression + fil d'Ariane
- ✅ **Reprise** du dernier flash atteint (localStorage `keymaker:ch1:flashIndex`), circulation **libre** entre les flashs
- ✅ Écran **Learn** (overlay « Parcours ») listant les 5 flashs — rendu *par-dessus* le flash pour **ne pas recréer l'éditeur**
- ✅ Vérifié : `vite build` propre + smoke test navigateur headless (montage, navigation, reprise, overlay, `setCode` validé)
- 📌 Décisions du chantier : navigation = état React simple ; progression mémorisée dès maintenant ; déverrouillage = circulation libre

### ✅ Chantier 3 — Module 1 complet — FAIT (3 juin 2026)
**Tranche 1** : structure multi-chapitres, navigation inter-chapitres, Chapitre 2 complet.
**Tranche 2** : Chapitres 3 « Le pouls » (3 flashs), 4 « La hauteur » (7 flashs), 5 « L'assemblage » (4 flashs) transposés en données. **Module 1 entier livré : 26 flashs, 5 chapitres, 2 tables récap (ch2+ch4), codes multi-lignes (setcpm, stack, $:).** Build propre (30 modules) + smoke test 30/30 assertions.

### ✅ Chantier 4 — Backend de Sati (module Personal OS) — FAIT (3 juin 2026)
**Pivot d'architecture** : le Pi héberge déjà **Personal OS** (24 containers Docker : Postgres, Caddy, Tailscale, et même un module `brain` = proxy Claude avec tool-use). Donc **ni PocketBase ni systemd** : Keymaker devient un **module Docker** de plus — cohérent avec l'écosystème, et perf-first (réutilise pgvector, prompt caching, backups auto déjà en place).
- ✅ Module `keymaker/` (Fastify+TS, port **3017**), buildé et **healthy** sur le Pi
- ✅ Proxy IA **streaming SSE** `POST /keymaker/ai/chat` → Claude, **modèle adaptatif** (Haiku/Sonnet/Opus), prompt caching. **Clé jamais côté browser** (réutilise `ANTHROPIC_API_KEY` du Pi)
- ✅ Schema Postgres `keymaker.*` : `profil`, `sessions`, `journal`, `messages` + colonne `embedding vector(1024)` (pgvector déjà présent) prête pour la mémoire sémantique
- ✅ Routé par **Caddy** (`/keymaker*`, `flush_interval -1`) + service `docker-compose` (`restart unless-stopped` → survit aux reboots)
- ✅ Sécurité : Tailscale-only (aucun port exposé), rate limit simple, clé non commitée
- ✅ **Test bout-en-bout vert** : message → réponse Claude en streaming ; écriture/lecture base OK ; 25 containers healthy
- ⏳ **Reste à valider avec Felix** : `git push` (commit local `363421c` prêt sur le Pi) + câblage léger de l'app (Settings → URL Pi + ping de statut)

### ✅ Chantier 6 — Réglages — COMPLET (4 juin 2026)

Écran **⚙ Réglages** (overlay par-dessus le flash, éditeur jamais recréé) avec 5 sections :
- ✅ **Apparence** : taille de texte (3 niveaux via `--fs-scale`) + réduire les animations (classe `reduce-motion`, respecte `prefers-reduced-motion`)
- ✅ **Éditeur** : couleurs du code (`setTheme` — strudelTheme, Dracula, Gruvbox, Nord, Tokyo Night…) + numéros de ligne (`setLineNumbersDisplayed`)
- ✅ **Connexion** : URL Pi + bouton Tester (partage l'état d'`App`, raccourci gardé dans Sati)
- ✅ **Données** : « Reprendre à zéro » avec confirmation modale (efface `keymaker:m1:pos`, retour flash 1.1)
- ✅ **À propos** : version + mention « 100 % local »
- ✅ Tous réglages persistés dans `keymaker:settings` (JSON), lus au montage, appliqués en live à l'éditeur
- ✅ Build propre (34 modules) + `dist/` livré → pont fichiers sain (pont OK dès la reprise)
- 📌 Détails + DoDone → `KEYMAKER_chantier6.md`

**Reporté à une prochaine tranche :** thème clair/sombre (nécessite un 2ᵉ thème CSS complet).

---

### ✅ Chantier 5 — Sati (guide IA) — COMPLET : tranches 1, 2 & 3 (5 juin 2026)
**Tranche 1 « Sati parle » — LIVRÉE.** Le guide IA est branché et fonctionnel.
- ✅ Tiroir de chat latéral (`SatiChat.jsx`) : overlay par-dessus le flash → l'éditeur n'est **jamais** recréé (même règle que le Parcours).
- ✅ Client SSE (`sati.js`) : `streamSati()` parse le flux du proxy (`model`/`delta`/`done`/`error`), streaming token-par-token ; `buildContextBlock()` assemble flash + **code live de l'éditeur** + dernière erreur.
- ✅ **Mémoire de session** (RAM) : conversation multi-tours via le champ `history` du proxy (vérifié). Paires user→assistant propres, échanges en erreur ignorés.
- ✅ Actions rapides contextuelles (Explique ce flash / Corrige mon code / Indice) + sélecteur Normal (Sonnet) / Rapide (Haiku). Proactivité **OFF** (Sati attend qu'on lui parle).
- ✅ La persona de Sati + le profil de Felix sont déjà injectés **côté Pi** (system prompt serveur) → le front n'envoie que message + historique + contexte.
- ✅ Build propre (32 modules), sentinelles vérifiées dans le bundle livré, **10/10 tests unitaires** (parseur SSE, contexte) + **test bout-en-bout vert** contre le vrai Pi (Sati recopie le code de l'éditeur, en streaming, Haiku 1,7 s).

**Tranche 2 « mémoire locale » — LIVRÉE (4 juin 2026).** Fil global + difficultés persistés en **IndexedDB** (`memory.js`, déjà câblé dans `SatiChat`) ; nouveau panneau **Réglages → Mémoire de Sati** (compteurs + repères + Effacer avec confirmation). Best-effort : si IndexedDB est indisponible, tout se dégrade en no-op (Sati marche, sans mémoire persistante).

**Tranche 3 « mémoire distante » — LIVRÉE (5 juin 2026).** Chaque échange est écrit dans `keymaker.journal` avec son **embedding Voyage** (`voyage-3.5-lite`, 1024d) ; avant de répondre, Sati fait un **rappel cosinus** (top-3, seuil 0,55, repli full-text FR) injecté dans un **2ᵉ bloc système non-caché** (préserve le prompt caching de la persona). Best-effort de bout en bout. **Premier dev déployé en direct par SSH.** Vérif live : difficulté reformulée **sans history** → Sati y fait référence (dist 0,44). → `KEYMAKER_chantier5.md`. **➡️ Chantier 5 COMPLET.**

### ✅ Chantier 7 — Module 2 (Solfège) + navigation multi-modules — FAIT (4 juin 2026, en autonomie)
**Module 2 « Solfège & Théorie musicale »** : 5 chapitres, **25 flashs**, solfège enseigné *à travers* Strudel (chaque concept audible), ponts guitare permanents.
- Ch.1 **Les 12 notes** (hauteur, alphabet A–G, demi-ton/ton, dièses/bémols, octave) · Ch.2 **Les intervalles** (`.add()`, tierce M/m, quinte/power chord) · Ch.3 **Les gammes** (majeure/mineure, relative, pentatonique, `n()+scale()`) · Ch.4 **Les accords** (triades 0,4,7 etc., I-IV-V, `chord().voicing()`) · Ch.5 **La tonalité** (armures, cycle des quintes, transposer, bilan M1+M2).
- **Navigation multi-modules** : `modules = [module1, module2]`, sélecteur dans le Parcours, reprise `{m,c,f}` (migration des anciennes clés), crumb/footer/contexte/fin dynamiques, bouton « Module N+1 ▶ ». Éditeur unique conservé.
- Strudel **vérifié contre strudel.cc** avant de coder. Vérif : build 34 modules + **16/16** données + **13/13** montage jsdom. → `KEYMAKER_chantier7.md`.

### ✅ Chantier 8 — Thème clair — FAIT (5 juin 2026)
2ᵉ thème complet **Light (clair)** + bascule **Void / Clair** dans ⚙ Réglages → Apparence. Reporté depuis le Chantier 6, maintenant livré.
- Palette claire (fond `#f6f7fb`, accent **indigo `#5b5bd6`**, texte `#1b2030`) en bloc `[data-theme="light"]` — n'override que les variables de couleur ; `--glow` / `--radius` / polices / tailles hérités de `:root`.
- **Refactor themable** : `--accent-rgb` (l'accent en RGB) → toutes les lueurs `rgba(var(--accent-rgb), a)` suivent l'accent (cyan en Void, indigo en Light) ; `--bg-fade` pour le fondu de la topbar. Plus aucune couleur d'accent en dur dans le CSS.
- Thème posé sur **`<html>`** (par `App`, comme `--fs-scale`) → le fond peint par `body` suit aussi ; persisté `keymaker:settings.theme`. Sélecteur segmenté dans Apparence. L'éditeur garde son thème propre (réglage « Couleurs du code »).
- Vérif : `vite build` propre (**34 modules**) + **15/15** montage runtime jsdom (défaut Void sur `<html>`+`.app`, bascule → Light + persistance, retour Void, cohabitation des autres réglages). → `KEYMAKER_chantier8.md`.

### ✅ Chantier 9 — Module 3 « Connexion Guitare » — FAIT (5 juin 2026, autre session)
**Module 3 : 5 chapitres, 25 flashs (3.1→3.25)** — relie la théorie (M1-M2) à la guitare.
- Ch.1 **Le manche & l'accordage** · Ch.2 **Lire le manche** · Ch.3 **Les accords ouverts** · Ch.4 **Power chords & barrés** · Ch.5 **Le jeu**.
- Intégré via `modules = [module1, module2, module3]` — la navigation multi-modules du Chantier 7 le prend en charge sans changement de code. Ajouté **en autonomie par une autre session** (code seul, sans doc ni rebuild).
- **Réconcilié & re-livré le 5 juin** : app **rebuildée** (3 modules + thème clair, bundle `index-NqFEHDkR.js`, **34 modules**), tests **98/98** intégrité données + **18/18** montage jsdom, `dist/` byte-identique. README + roadmap à jour, brief `KEYMAKER_chantier9.md` **complété** (vérif strudel.cc en direct : `gm_*_guitar_*`, `.clip()` palm mute, `.add()`, `voicing()`, `.struct()` + décisions de contenu). ⚠️ **Reste** : valider les 25 codes Strudel à l'oreille.

### ✅ Chantier 10 — Module 4 « Son & Effets » — FAIT (6 juin 2026, en autonomie)
**Module 4 : 5 chapitres, 25 flashs (4.1→4.25)** — la synthèse sonore enseignée *à travers* Strudel, dans l'ordre de la chaîne du signal.
- Ch.1 **La source** (4.1→4.5) : les 4 ondes (sine/triangle/square/sawtooth), harmoniques & timbre, le bruit (white/pink/brown), mélanger les sources.
- Ch.2 **Le filtre** (4.6→4.10) : passe-bas (lpf) + résonance (lpq), passe-haut/bande (hpf/bpf), le filtre qui balaye (LFO `sine.range().segment()`), filtrer un groove.
- Ch.3 **L'enveloppe** (4.11→4.15) : ADSR (attack/decay/sustain/release), nappe vs pluck, maintien sous 1, l'enveloppe de filtre (lpenv + lpa/lpd/lps/lpr).
- Ch.4 **L'espace** (4.16→4.20) : réverb (room/roomsize/rlp), délai (delay/delaytime/delayfeedback), délai calé au tempo (croche pointée, pont M3), les orbits.
- Ch.5 **La couleur & le mix** (4.21→4.25) : saturation (distort/crush/coarse), modulation (phaser/vib), dynamique & stéréo (gain/pan/jux), l'ordre fixe de la chaîne du signal, **morceau final M1→M4**.
- Intégré via `modules = [module1, module2, module3, module4]` — la navigation multi-modules (Chantier 7) prend en charge le 4ᵉ module **sans aucune modif** d'`App.jsx`. Thèmes Void/Clair appliqués.
- **Strudel vérifié en direct** (cutoff Claude = mai 2025) sur strudel.cc/learn/effects + /synths (juin 2026) : ondes, bruit, lpf/lpq/hpf/bpf, ADSR + adsr(), lpenv/lpa/lpd/lps/lpr, room/roomsize/rlp, delay/delaytime/delayfeedback, orbit, distort/crush/coarse, phaser/vib, gain/pan/jux + le piège LFO (`.segment()` requis).
- **Vérifs** : `vite build` propre (**34 modules**, `index-oQUh9Mac.js` 285 kB) + PWA régénérée + **86/86** intégrité données (modules=[m1..m4], M1-M3 intacts, M4=5 ch/25 flashs, ids 4.1→4.25, champs, 5 récaps/5 free) + **14/14** navigation (`buildFlat` 4 modules, reprise `{m:3,c,f}`, module suivant, crumb) + sentinelles dans le bundle livré. → détails : `KEYMAKER_chantier10.md`.

### ✅ Chantier 11 — Thème Matrix (vert) — FAIT (6 juin 2026, en autonomie)
3ᵉ thème complet **Matrix (vert)** + 3ᵉ option dans ⚙ Réglages → Apparence (Void / Clair / Matrix). Le 3ᵉ thème annoncé depuis le Chantier 8.
- Palette vert phosphore sur quasi-noir : fond `#050a05`, accent **`#00ff66`** (`--accent-rgb: 0,255,102`), texte `#c8ffd4`, dans un bloc `[data-theme="matrix"]` qui n'override que les **13 variables de couleur** ; `--glow`/`--radius`/polices/tailles hérités de `:root` → toutes les lueurs `rgba(var(--accent-rgb), a)` passent au vert automatiquement.
- Sélecteur de thème de `Settings.jsx` **générique** (`APP_THEMES.map`) → ajouter `{ key: 'matrix', label: 'Matrix' }` a suffi ; **aucun changement d'`App.jsx`** (le thème est posé sur `<html>` pour n'importe quelle valeur, persisté).
- **Vérifs** : `vite build` propre (**34 modules**, `index-BmpEACbd.js` + `index-Dh5zhh25.css`) + PWA régénérée + bloc Matrix **13/13 variables** + 3 options de thème dans la source + les 3 accents (cyan/indigo/vert) présents dans le CSS livré. → `KEYMAKER_chantier11.md`.

### ⬜ Chantiers contenu — Modules 5 à 6
À définir au fur et à mesure, comme les Modules 1-4. **Pas un prérequis pour coder.**
Pistes (cf. `KEYMAKER_architecture.md`) : 5 Informatique Musicale · 6 Composition & Projets.

---

## Décisions verrouillées

- Framework : **React**
- App **d'abord locale** ; le Pi vient après le prototype
- Thème par défaut au 1ᵉʳ lancement : **Void** (sombre). **Light (clair) livré** (Chantier 8) — bascule dans ⚙ Réglages → Apparence, persistée. **Matrix (vert) livré** (Chantier 11).
- Mobile = **lecture seule** (pas d'éditeur de code)
- Navigation interne : **état React simple** (pas de router tant qu'on n'en a pas besoin)
- Progression : on **mémorise le dernier flash** atteint (localStorage), circulation **libre**

---

## Décisions techniques (Chantier 1)

Vérifié contre l'écosystème Strudel **réel** au 2 juin 2026 (le cutoff de Claude étant mai 2025) :

- **Strudel v1.3.0**. `sound("casio")`, `hush()`, `setcpm`, `Ctrl+Enter` / `Ctrl+.` → toujours valides. Le Module 1 ne bouge pas.
- ⚠️ **`@strudel.cycles/react` est ABANDONNÉ.** On n'utilise donc pas de binding React officiel.
- **Éditeur = web component `@strudel/repl` (`<strudel-editor>`)**, qui embarque CodeMirror 6 + moteur + surlignage + raccourcis. On l'enrobe avec notre UI (thème Void, gros boutons). `editor.evaluate()` / `editor.stop()` câblés sur nos boutons Run/Stop.
- **État lecture/arrêt** : à lire via l'événement `update` du `<strudel-editor>` (`e.detail.started`), **jamais** via le clic — sinon le clavier (Ctrl+Enter / Ctrl+.) désynchronise l'UI. (Le `onToggle` interne de StrudelMirror n'est pas ré-exposé par le web component ; l'événement `update`, lui, l'est. C'était la cause du bug LED, corrigé.)
- **Moteur vendorisé en local** dans `public/vendor/strudel-repl/` (chargé via `<script defer>` dans `index.html` → `document.currentScript` résout les chunks). Zéro dépendance CDN au runtime.
- **Stack** : React 18 + Vite 6 + `vite-plugin-pwa`. Node ✅ présent sur le PC de Felix (v24).
- **Lancement** : `start.bat` → `server.mjs` (serveur statique zéro-dépendance, sert `dist/` sur `http://localhost:4321`). Pas besoin de `npm install` pour juste utiliser l'app.
- **Limite connue** : les échantillons (ex. « casio ») se téléchargent depuis le net au **1er** usage, puis sont en cache. Vrai offline complet (bundler les samples) = chantier ultérieur, avec le cache PWA.
- **À faire plus tard** (reporté, pas perdu) : coloration de **validation temps réel** custom (nécessitera un éditeur plus « fait-main » via `@strudel/codemirror` / `StrudelMirror` directement), thème Void *à l'intérieur* de l'éditeur, fonts JetBrains Mono / Plus Jakarta Sans bundlées en local.

---

## Décisions techniques (Chantier 2)

- **Une seule instance d'éditeur** pour tout le chapitre. Le composant `Flash` reçoit l'éditeur en `children` (slot) ; on ne lui met **jamais** de `key={flashIndex}`, et l'écran Learn est un **overlay** (le flash reste monté dessous). Résultat : aucun rechargement du moteur en navigant.
- **Changement de flash** : `useEffect([flashIndex, ready])` → `editor.stop()` *puis* `editor.setCode(code)`. Un `lastAppliedRef` évite de re-pousser le code du flash déjà affiché (le 1er flash arrive via `initialCode`).
- **Reprise** : `localStorage["keymaker:ch1:flashIndex"]`, lu une fois au montage (clampé sur 0–4), réécrit à chaque changement de flash.
- **Build/livraison** : build fait dans le sandbox (`vite build`), `dist/` recopié dans `keymaker-app/`. ⚠️ Le mount OneDrive peut être **en retard à la lecture** côté sandbox ; passer par la zone `outputs` comme tampon fiable, et **vérifier les fichiers livrés** (nombre de lignes) avant de conclure. La suppression de fichiers nécessite une autorisation explicite (outil dédié).

---

## Décisions techniques (Chantier 3 — tranche 1)

- **Structure** : `lessons.js` exporte `module1 = { id, titre, chapitres: [...] }`. `chapitre1` inchangé, rangé dedans. Chapitres 3-5 = **stubs** `locked: true` (titres de flashs seulement) → le Parcours montre déjà les 5 chapitres.
- **Navigation** : on aplatit les flashs des chapitres **déverrouillés** en une liste plate ; un seul curseur `pos` la parcourt → Précédent/Suivant **traversent les chapitres** automatiquement. Indicateur « Ch.N · n/m » (les points = flashs du chapitre courant).
- **Reprise** : `localStorage["keymaker:m1:pos"] = {c,f}` (chapitre + flash, coordonnées stables même quand un chapitre se déverrouille) ; **migration** auto depuis l'ancienne clé `keymaker:ch1:flashIndex`.
- **Carte récap** : nouveau champ `recap = { title, columns, rows }` rendu en vraie table (Concept · Syntaxe · Exemple).
- **Éditeur** : toujours **une seule** instance ; le Parcours reste un **overlay** (flash + éditeur restent montés). Aucun `key` au changement de flash.
- ⚠️ **Piège de propagation fichiers (confirmé)** : l'environnement de build (sandbox Linux de Cowork) a lu une version **tronquée/figée** des fichiers fraîchement écrits côté Windows. C'est le **pont fichiers Cowork ↔ sandbox** qui était en retard — **pas OneDrive** (vérifié *désactivé* le 3 juin : aucun process, fichiers 100 % locaux). Parade fiable : **réécrire la source dans le sandbox local** (`/tmp`), builder là, vérifier par sentinelles, puis recopier `dist/`. La suppression des anciens assets hashés reste protégée (autorisation dédiée) — sans impact : `index.html` pointe sur les nouveaux.
- **Vérif** : `vite build` propre (30 modules) + test d'intégrité des données (`lessons.js`) + **smoke test jsdom** (23 assertions : montage, traversée ch1→ch2, table récap 8×3, Parcours 5 chapitres + verrous, reprise `{c,f}`).

---

## Décisions techniques (Chantier 4 — le Pi)

Vérifié contre l'état **réel** du Pi (la doc Notion de Personal OS était périmée ; source de vérité = `CLAUDE.md` du repo `personal-os`).

- **Le Pi n'est pas une page blanche** : c'est **Personal OS**, 24 containers Docker (Postgres + pgvector, Redis, Caddy, Tailscale, backups age 3 niveaux) + un module `brain` qui parle déjà à Claude. La règle « jamais sur le Pi » a été levée (POS v2) → dev/build directement sur le Pi.
- **Décision d'archi** : Keymaker = **module Docker** du Personal OS (pas PocketBase, pas systemd). Réutiliser l'infra **accélère** Keymaker au lieu de le brider ; on s'autorise des exceptions aux règles de modularité si la perf de Sati l'exige (ex. lectures cross-module en lecture seule).
- **Module** : `modules/keymaker/` — Fastify+TS, `Dockerfile` (npm install, node:20-alpine, USER node), `tsconfig` calqué sur `tasks`. Port interne **3017** (3011 pris par `sport`).
- **Proxy Sati** : `POST /keymaker/ai/chat`, **SSE token-par-token** (calque `brain`), prompt caching (`cache_control` casté, SDK `@anthropic-ai/sdk` ^0.32). Modèles : `KEYMAKER_MODEL_FAST=claude-haiku-4-5-20251001` / `KEYMAKER_MODEL=claude-sonnet-4-6` / `KEYMAKER_MODEL_DEEP=claude-opus-4-8`.
- **Base** : schema `keymaker.*` (1 schema/module). `journal.embedding vector(1024)` (Voyage `voyage-3.5-lite`) + `content_search` FR en repli — **pipeline d'embedding branché au Chantier 5 tranche 3** (5 juin 2026).
- **Persistance** : chaque échange avec Sati est écrit dans `keymaker.messages` (mémoire distante).
- **Piège noté** : `docker compose up -d --build keymaker` a **recréé `postgres`** (dépendance avec `build:`) → préférer `docker compose build keymaker` puis `up -d --no-deps keymaker`. Données préservées (volume), tout est revenu healthy.

---

## Décisions techniques (Chantier 5 — Sati parle)

Contrat du proxy **vérifié en direct** contre le Pi (le 3 juin 2026) avant de coder :

- **Endpoint** : `POST {piUrl}/keymaker/ai/chat`, réponse **SSE**. Événements : `event: model` `{model}` · `event: delta` `{text}` (jeton) · `event: done` `{text}` (texte complet) · `event: error` `{message}`. CORS `*` (l'app `localhost:4321` peut appeler).
- **Corps** : `{ message, history?, mode? }`. `history = [{role, content}]` → **mémoire multi-tours** (vérifié, répond « BANANE »). `mode:'fast'` → **Haiku** ; absent → **Sonnet** (défaut) ; `'deep'` → Opus (non exercé, l'UI n'expose que Normal/Rapide).
- **Persona côté serveur** : le proxy **injecte déjà** l'identité de Sati + le profil de Felix (TDA, guitariste, FR). Le front n'envoie donc **pas** de system prompt — juste message + historique + contexte. (Découvert en testant : `system`/`systemPrompt` côté client sont ignorés.)
- **Contexte** : `buildContextBlock()` emballe flash + **code live** (lu sur `editorRef.current.code`, que StrudelMirror tient à jour à chaque frappe) + dernière erreur, dans des balises `<contexte_app>`. Attaché à **chaque** envoi (Sati voit toujours le code courant) ; le fil affiché, lui, ne montre que la question.
- **Mémoire de session** = le fil en RAM ; `history` reconstruit en **paires user→assistant strictement alternées** (les échanges en erreur/interrompus sont sautés → jamais de rôles consécutifs qui casseraient l'API).
- **UI** : tiroir = **overlay** (`.learn-overlay`) → l'unique éditeur reste monté dessous, jamais recréé. Rendu léger `**gras**`/`` `code` `` sans `dangerouslySetInnerHTML`.

⚠️ **Piège majeur rencontré (à retenir pour les prochains builds)** : le **pont fichiers Cowork ↔ sandbox tronque la LECTURE des gros fichiers (~16 Ko)**. `App.jsx` et `styles.css` ont été lus **coupés** côté sandbox (496 et 631 lignes au lieu de 585 et 1015) → build cassé, CSS du tiroir absente. Les fichiers **côté Windows sont complets** (l'outil d'écriture est fiable, la lecture autoritaire les voit entiers) ; c'est la lecture *mount* qui plafonne. **Parade appliquée** : reconstruire la source **dans `/tmp`** (head + heredoc depuis le contenu autoritaire), builder là, **vérifier par sentinelles le bundle livré**. L'écriture sandbox→Windows, elle, n'est **pas** tronquée (tailles `dist/` identiques à la source — vérifié).

> Build : sources recopiées/reconstruites dans `/tmp/km`, `npm install` (sans Playwright — `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`), `vite build`, puis `dist/` recopié dans `keymaker-app/`. Anciens assets hashés laissés en place (suppression = autorisation dédiée ; sans impact, `index.html` pointe sur les nouveaux).

---

Décisions techniques du Chantier 6 → voir section dédiée ci-dessous.

---

## Décisions techniques (Chantier 6 — Réglages)

- **Overlay** : même patron que Parcours et Sati (`.learn-overlay`) → l'éditeur reste monté, jamais recréé. Fermeture : ✕ / Échap / clic backdrop.
- **État** : `settings` dans `App` (objet), persisté dans `keymaker:settings` (JSON). Lu au montage, appliqué à l'éditeur via `useEffect`.
- **`--fs-scale`** posé sur `<html>` (valeurs `0.85 / 1 / 1.2`) → tous les `em`/`rem` du UI + les tailles de police éditeur héritent sans liste exhaustive.
- **API éditeur** : `setTheme(nom)` (repli sur `strudelTheme` si nom inconnu), `setLineNumbersDisplayed(bool)`, `setFontSize(px)` — tous appelés en `try/catch` non bloquant.
- **`reduceMotion`** : classe `reduce-motion` sur `.app` qui écrase `transition`/`animation` à `none`. La valeur par défaut est seedée depuis `window.matchMedia('prefers-reduced-motion: reduce')`.
- **URL Pi** : partagée avec Sati via l'état `App` (`piUrl` / `savePiUrl` / `checkPi` / `piStatus`) — aucune duplication d'état. Raccourci conservé dans le tiroir Sati (`<details>`).
- **Reprendre à zéro** : confirmation modale inline (pas une dialog native), efface `keymaker:m1:pos` + ancienne clé `keymaker:ch1:flashIndex`, remet `pos = {c:0,f:0}`.
- **Pont fichiers** : au 4 juin 2026, le pont était sain dès le démarrage de session (wc -l exact → build direct dans `/tmp/km6`, sans re-matérialisation). Conserver la parade de vérification par `wc -l` à chaque reprise.

---

## Décisions techniques (Chantier 5 — tranche 2 : mémoire locale)

- **Moteur déjà en place** : `memory.js` (IndexedDB, base `keymaker`, stores `messages` + `difficultes`) et son câblage dans `SatiChat` avaient été écrits en amont mais **jamais bouclés** (pas de panneau Réglages, pas de vérif, docs en retard). Ce chantier **ferme la boucle**.
- **App propriétaire, Settings présentationnel** : `App` importe `countMemory` / `loadDifficulties` / `clearAllMemory`, expose `loadMemoryInfo()` (compteurs + 6 derniers repères) et `onClearMemory` ; `Settings` ne fait qu'afficher. Même découpage que l'URL Pi et « Reprendre à zéro ».
- **Panneau « Mémoire de Sati »** : compteurs (messages · difficultés repérées) + ligne « Repères : … », bouton **Effacer** avec confirmation inline (calque exact de « Reprendre à zéro »). **Zéro CSS ajouté** (réutilise `set-section`/`set-row`/`set-confirm`/`set-danger`).
- **Détection des difficultés = conservatrice par design** : la regex FR de `memory.js` attrape `ça sert à quoi` mais **pas** `à quoi ça sert` (mieux vaut rater un repère que d'en poser un faux). Laissée telle quelle.
- ⚠️ **Pont fichiers retombé en panne de lecture** (après les éditions) : `Settings.jsx` et `App.jsx` se relisaient **tronqués** côté mount (213/653 l. au lieu de 301/674) alors que l'écriture autoritaire était complète. Parade : relire le **contenu autoritaire** via l'outil Read, **reconstruire en `/tmp`** (heredoc), builder là, livrer `dist/`, **vérifier par taille d'octets** (identité prouvée même quand le grep du mount est en retard).
- **Vérif** : `test-memory.mjs` (fake-indexeddb) **39/39** — append/load fil, dédup difficultés, compteurs, effacement, détection FR, labels, rappel ; `test-settings.jsx` (jsdom) **8/8** — section rendue, compteurs + repères, flux Effacer→Confirmer→`onClearMemory`, état « Rien de mémorisé » après effacement ; `vite build` propre (34 modules) + sentinelles dans le bundle livré.

---

## Décisions techniques (Chantier 5 — tranche 3 : mémoire distante)

Contrat Voyage **vérifié en direct** contre la clé du Pi avant de coder (1024d, 442 ms, egress OK).

- **Trois pièces, toutes dans `modules/keymaker/`** : `services/voyage.ts` (embeddings), `routes/sati.ts` (write + recall), `services/anthropic.ts` (`buildSystem`). Aucune touche au compose / Caddy / schéma → **zone Keymaker pure**, rien à coordonner avec Personal OS.
- **Voyage** : `voyage-3.5-lite`, `output_dimension: 1024` (= la colonne). `input_type: document` à l'écriture, `query` au rappel (Voyage préfixe différemment → meilleure qualité de retrieval). `fetch` global (Node 20), `AbortController` timeout 8 s, **best-effort** (renvoie `null` → l'appelant dégrade). Pas de nouveau dépendance npm → **layers Docker `npm install` restées en cache** (build rapide).
- **Écriture = fire-and-forget** : `persist()` lancé **après `res.end()`** (`void persist(...)`), donc l'embedding (~0,44 s) **n'allonge pas** la réponse de Sati. `messages` (transcript brut) + `journal` (mémoire sémantique : message de Felix + embedding + `kind`).
- **`kind`** : regex FR conservatrice (`DIFFICULTE_RE`) → `difficulte` si blocage détecté, sinon `question`. Mieux vaut rater un tag que d'en poser un faux (même esprit que la détection locale tranche 2).
- **Rappel** : `embedding <=> $1::vector` (**cast explicite obligatoire** pour l'opérateur cosinus), `ORDER BY` + `LIMIT 3`, filtre `dist ≤ 0,55`. Repli `content_search @@ plainto_tsquery('french', …)` si Voyage `null`. Le tout dans un `try/catch` → `''` (Sati répond sans mémoire si quoi que ce soit casse).
- **Injection & cache** : la mémoire part dans un **2ᵉ bloc `system` NON caché**, après la persona qui garde son `cache_control: ephemeral`. Ajouter du contenu **après** le point de cache ne casse pas le cache de la persona (la mémoire change à chaque tour, pas la persona).
- **Déploiement direct SSH** : édition à la source (heredoc via SSH depuis le sandbox), `build keymaker` puis `up -d --no-deps keymaker`, `tsc` validé **à l'intérieur** du build (container live intact si erreur de type). **Pas de pont fichiers Cowork sur le code de ce chantier** → la truncation de lecture des gros fichiers ne s'applique pas (on édite sur le Pi). *(Le pont reste un piège pour les docs `KEYMAKER_*.md` côté workspace — utiliser l'outil Read autoritaire, pas le mount.)*
- **Vérif** : build propre + deploy + **test bout-en-bout vert** (difficulté semée → ligne journal `difficulte` avec embedding ; question reformulée sans history → Sati cite le « voicing », dist **0,44 < 0,55**). Données de test nettoyées. Commit scopé `2f0debe` poussé.
- **Réglages** : `RECALL_K = 3`, `RECALL_MAX_DIST = 0,55`, `MAX_INPUT = 8000` dans `sati.ts` ; `MODEL`/`DIM`/`TIMEOUT_MS` dans `voyage.ts`.

---

## Décisions techniques (Chantier 7 — Module 2 & multi-modules)

- **Contenu vérifié AVANT de coder** (cutoff mai 2025 → strudel.cc en direct, juin 2026) : `note()` lettres/MIDI, `n()+scale()` (types tonaljs, espaces→`:`, gamme patternée `<C:major A:minor>`), `.add()` (structure prise sur l'opérande de **gauche** → motif multi-pas à gauche, scalaire à droite), triades `0,4,7 / 0,3,7 / 0,3,6 / 0,4,8`, `chord("<…>").voicing()` + symboles (`C`, `Cm`, `C7`, `C^7`, `Co`), `.room()` / `.lpf()` / `.gain()` / `.sound("sawtooth"|"triangle")`.
- **Données** : `lessons.js` exporte `m2chapitre1…5`, `module2`, et surtout `modules = [module1, module2]`. Chaque chapitre porte `module: 2`. Format de flash **inchangé** (id, kicker, title, concept, code, decode?, theory?, exercise, recap?, free?).
- **Navigation** : `FLATS = modules.map(buildFlat)` (une liste plate par module). État `mod` + `pos` dans `App`. Reprise `keymaker:pos = {m,c,f}` ; **migration** auto depuis `keymaker:m1:pos` `{c,f}` et `keymaker:ch1:flashIndex` → `m:0` (progression M1 de Felix conservée). `goToFlash(mIndex,ci,fi)` change module + position d'un coup ; l'effet d'éditeur déclenche sur **clé composite `mod:pos`** (sinon un changement de module au même `pos` ne rechargerait pas le code).
- **Parcours** : `LearnOverlay` reçoit `modules` + `currentModuleIndex` ; un état `view` (module affiché) **découplé** du module joué → on feuillette sans naviguer. Onglets `.learn-modtab` (calqués sur `.set-seg`). `onPick(view, ci, fi)`.
- **Invariant** : éditeur **jamais recréé** (overlays par-dessus, comme Parcours/Sati). Crumb, footer, contexte Sati et message de fin = dérivés de `modules[mod]`.
- **Pont fichiers (rappel renforcé)** : la **lecture mount** a tronqué `lessons.js` / `App.jsx` / `Settings.jsx` / `styles.css` (même non édités !). Parade : reconstruire en `/tmp` depuis l'autoritatif (préfixe `head` + bloc, ou heredoc complet), builder là, livrer `dist/` (écriture sandbox → mount **fiable**, byte-identique vérifié). Ne jamais `cp` un gros fichier du mount sans `wc -l` de contrôle.

---

## Décisions techniques (Chantier 8 — Thème clair)

- **Tout passe par les variables CSS.** `[data-theme="light"]` n'override que des couleurs : `--bg`, `--bg-2`, `--surface(-2)`, `--border(-soft)`, `--accent`, `--accent-rgb`, `--accent-ink`, `--text`, `--muted`, `--danger`, `--bg-fade`. `--glow` n'est **pas** redéfini (il référence `var(--accent-rgb)` + `var(--border)` → indigo automatique en Light). Idem pour `--radius`, polices, tailles (hérités de `:root`).
- **`--accent-rgb`** (nouveau) = l'accent en composantes RGB (`34, 211, 238` Void · `91, 91, 214` Light). Les ~18 `rgba(34,211,238,a)` en dur → `rgba(var(--accent-rgb), a)` (un `replace_all`). **`--bg-fade`** (nouveau) sort le fondu sombre de la topbar : `linear-gradient(var(--bg), var(--bg-fade))`.
- **Pose sur `<html>`** : `App` écrit `data-theme` sur `document.documentElement` via `useEffect([settings.theme])` **et** sur `.app` (`data-theme={settings.theme}`). Sur `<html>` car `body` peint le fond via `var(--bg)` au niveau `:root` ; sinon fond sombre derrière une app claire. **Pas de FOUC** : `:root` fournit déjà les valeurs Void avant que l'effet ne tourne.
- **Réglage** : `theme:'void'` ajouté à `DEFAULT_SETTINGS` ; sélecteur segmenté `Void (sombre)` / `Clair` dans Apparence (réutilise `.set-seg` → **zéro CSS ajouté**). L'éditeur de code garde son thème propre (réglage « Couleurs du code »), indépendant.
- **Correctif au passage** : la ligne « À propos » des Réglages disait encore « Module 1 » → « live coding & solfège » (le brief C7 l'avait sur-déclarée).
- **Pont fichiers + build (rappel)** : `lessons.js`/`App.jsx`/`styles.css`/`Settings.jsx` relus tronqués/figés au mount (657/646/1189/214 l. ; coupés **en milieu de ligne**). Parade : préfixe correct du mount (`sed` jusqu'à un ancrage sûr) + queue émise depuis le Read autoritatif → build `/tmp` → `dist/` recopié (vendor conservé). ⚠️ **Piège npm neuf** : un `npm install` coupé par le timeout 45 s laisse `node_modules` incohérent (esbuild retiré, cache npm corrompu « Invalid Version ») → `npm cache clean --force`, réinstall, puis **installer explicitement le binaire natif `@esbuild/linux-x64@<version>`** (sinon `vite build` → *Bus error*).

---

## Décisions techniques (Chantier 10 — Module 4 & build sous pont qui tronque)

- **Contenu vérifié AVANT de coder** : strudel.cc/learn **effects** + **synths** lus en direct (juin 2026). La référence `KEYMAKER_strudel_reference.md` §6/§7 (distillée le 5 juin) couvrait déjà l'essentiel → base + vérif live.
- **Données** : `lessons.js` exporte `m4chapitre1…5`, `module4`, `modules = [module1, module2, module3, module4]`. Format de flash **inchangé**. Ids **module-séquentiels** `4.1→4.25` (comme M2/M3 ; M1 est en `chapitre.flash`). Les ids ne sont **pas** uniques entre modules — sans effet : l'app navigue par coordonnées `{m,c,f}`, jamais par id (doublons M1-ch4/M4 du même type que M1-ch2/M2 déjà présents).
- **Navigation** : zéro changement d'`App.jsx` (généricité du Chantier 7 : `FLATS = modules.map(buildFlat)`, `modules.length`, onglets dynamiques).
- ⚠️ **Pont fichiers — nouveau visage du piège** : après édition via l'outil d'écriture, le **mount a servi un cache PÉRIMÉ** de `lessons.js` (2305 l. au lieu de 3058) → un build direct lisait une source tronquée. Les fichiers **non édités** (même volumineux : vendor 2,4 Mo) se lisaient parfaitement → ce n'est **pas** un plafond d'octets mais un **cache en retard sur les fichiers fraîchement écrits**.
  - **Parade build** : `git archive HEAD keymaker-app | tar -x` dans `/tmp` (arbre committé **byte-perfect, sans pont**) + overlay du seul `lessons.js` reconstruit (préfixe `git show HEAD` + Module 4 en heredoc), **vérifié par node** avant de builder.
  - **Parade commit** : une **écriture bash** du fichier sur le mont **rafraîchit** son cache → `cp /tmp/...lessons.js` a fait réapparaître 3058 lignes (vérifié `wc -l` + import node). Source ↔ build garantis identiques.
- ⚠️ **node_modules Windows ≠ Linux** : le `node_modules` du mont (installé sous Windows) n'a pas les binaires natifs Linux. `vite build` échoue sans `@esbuild/linux-x64@0.25.12` **et** `@rollup/rollup-linux-x64-gnu@4.61.1` (mêmes versions que le mont). Récupérés via npm (le registre répond pour des paquets isolés) et copiés dans le `node_modules` du mont (gitignoré, inertes sous Windows).
- **Livraison** : `dist/` recopié sur le mont **sans suppression** (rm interdit) → anciens bundles hashés (`index-CekULCjI.js`, `index-NqFEHDkR.js`) laissés en **orphelins inoffensifs** ; `index.html` + `sw.js` pointent sur `index-oQUh9Mac.js`.

---

*Dernière mise à jour : 6 juin 2026 — **Chantier 11 « Thème Matrix (vert) » FAIT (en autonomie)** : 3ᵉ thème CSS vert (`#00ff66`) + option Matrix dans ⚙ Réglages (Void/Clair/Matrix), même patron que le thème clair, build propre (34 modules). Détails : `KEYMAKER_chantier11.md`. Avant ça, même session : **Chantier 10 « Module 4 — Son & Effets » FAIT (en autonomie)** : 5 ch / 25 flashs (4.1→4.25), audio & effets vérifiés en direct sur strudel.cc, build propre (34 modules, bundle `index-oQUh9Mac.js`) + tests 86/86 + 14/14, `dist/` livré. Détails : `KEYMAKER_chantier10.md`. Avant ça : **Module 3 « Connexion Guitare » réconcilié** : une autre session avait ajouté le Module 3 (5 ch / 25 flashs) au **code seul** (sans rebuild ni doc) ; l'app a été **rebuildée en 3 modules / 76 flashs + thème clair** (bundle `index-NqFEHDkR.js`), README/roadmap resync, brief `KEYMAKER_chantier9.md` créé. Avant ça : **Chantier 8 « Thème clair » COMPLET** : 2ᵉ thème Light (indigo) + bascule Void/Clair dans ⚙ Réglages, posée sur `<html>`, persistée ; refactor `--accent-rgb`. Build propre (34 modules) + **15/15** montage runtime jsdom. Détails : `KEYMAKER_chantier8.md`. Précédé d'un **contrôle de cohérence docs↔app** (README réécrit, `architecture.md` daté, statut SSH/commit corrigés, règle « tous les fichiers à jour pendant/à la fin de session » posée). Avant ça : **Chantier 5 tranche 3 « mémoire distante » COMPLET** (en autonomie, **premier dev déployé en direct par SSH**) : journal + embeddings Voyage (`voyage-3.5-lite` 1024d) + rappel cosinus (seuil 0,55, repli FTS FR) injecté dans un 2ᵉ bloc système non-caché. Trois fichiers `modules/keymaker/src/` (`voyage.ts`, `sati.ts`, `anthropic.ts`), build `tsc` propre, déploiement `--no-deps` (**postgres intact**), test bout-en-bout vert (Sati cite le « voicing » sur une question reformulée **sans history**, dist 0,44). Commit `2f0debe` sur `origin/main`. Détails : `KEYMAKER_chantier5.md`. **Chantier 5 entièrement bouclé (tranches 1-2-3).** Prochains : valider les 25 codes Strudel du Module 2 à l'oreille · thème clair/sombre · Modules 3-6 · (optionnel) câblage app→`session_id` pour relier journal et sessions.*
