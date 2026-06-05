# Keymaker — Chantier 5 : Sati (le guide IA)

> **Brief de démarrage.** À ouvrir en début de nouvelle conversation.
> Felix : ouvre une conv dans le projet et dis simplement « **on reprend le Chantier 5** ».
> Claude relit `KEYMAKER_roadmap.md` + ce fichier, puis propose un plan en micro-étapes.

---

## 🎯 Objectif du chantier

Donner une **voix** à Sati dans l'app : un guide IA qui voit ce que Felix apprend (le flash courant)
et ce qu'il tape (le code de l'éditeur), et qui répond — en français, en streaming. Le tout en
réutilisant la fondation posée au Chantier 4 (proxy IA + base Postgres sur le Pi).

On construit **par tranches qui marchent** (TDA-friendly) :
1. **« Sati parle »** — chat branché au proxy, contexte live, mémoire de session. ✅ **FAIT**
2. **Mémoire locale** — IndexedDB (offline, survit au rechargement). ✅ **FAIT (4 juin 2026)**
3. **Mémoire distante** — journal + embeddings Voyage sur le Pi, rappel sémantique. ✅ **FAIT (5 juin 2026)**

---

## ✅ Tranche 1 « Sati parle » — LIVRÉE (3 juin 2026)

### Ce qui marche
- **Tiroir de chat** latéral droit (le bouton **Sati** de la barre du haut l'ouvre). Glisse depuis la droite,
  ton code reste visible. C'est un **overlay** → l'unique éditeur Strudel n'est **jamais** recréé.
- **Sati voit ton contexte** : le flash courant (module/chapitre/titre/concept) **et le code live de
  ton éditeur** (pas seulement celui de la leçon), lus à l'instant de l'envoi.
- **Streaming token-par-token** depuis le proxy du Pi (vrai SSE).
- **Mémoire de session** : la conversation se poursuit en multi-tours (perdue au rechargement — c'est la
  couche « session » ; la couche « locale » viendra en tranche 2).
- **Actions rapides** : *Explique ce flash* (Sonnet), *Corrige mon code* (Haiku), *Un indice* (Haiku).
- **Sélecteur** Normal (Sonnet) / Rapide (Haiku). **Sati attend qu'on lui parle** (proactivité OFF, réglable plus tard).
- **Connexion repliable** en bas du tiroir (URL du Pi + bouton Tester) — remplace l'ancien overlay de réglages.

### Où est quoi (code)
```
keymaker-app/src/
├─ sati.js          ← NOUVEAU. Client du proxy : streamSati() (SSE), createSSEParser(),
│                      buildContextBlock() (flash + code live + erreur), composeMessage().
├─ SatiChat.jsx     ← NOUVEAU. Le tiroir : bulles, streaming, actions rapides, modes,
│                      mémoire de session (history), section Connexion.
├─ App.jsx          ← getContext() (lit editorRef.current.code) ; <SatiChat> remplace l'ancien
│                      <SatiOverlay> ; le reste (nav, flashs) inchangé.
└─ styles.css       ← bloc « Sati — tiroir de chat » (Void, gros texte, prefers-reduced-motion).
```

### Contrat du proxy (vérifié en direct contre le Pi)
- `POST {piUrl}/keymaker/ai/chat` → **SSE** : `event: model {model}` · `delta {text}` · `done {text}` · `error {message}`.
- Corps : `{ message, history?, mode? }`. `history=[{role,content}]` = multi-tours (OK). `mode:'fast'`→Haiku ; absent→Sonnet ; `'deep'`→Opus (non exercé).
- **La persona de Sati + le profil de Felix sont déjà côté serveur.** Le front n'envoie pas de system prompt.
- CORS `*` ; `health` → `{"status":"ok","db":"up"}`.

### Vérifications
- Build propre (32 modules), sentinelles présentes dans le **bundle livré** (JS + CSS).
- **10/10 tests unitaires** : parseur SSE (événements à cheval, erreur), `buildContextBlock`, `composeMessage`, `normalizePiUrl`.
- **Test bout-en-bout vert** : `streamSati` réel → Sati recopie le code planté dans l'éditeur (`sound("bd*2 hh sd")`), en streaming, Haiku, 1,7 s.

### ⚠️ Piège majeur (à retenir)
Le **pont fichiers Cowork ↔ sandbox tronque la LECTURE des gros fichiers (~16 Ko)** : `App.jsx` et
`styles.css` ont été lus **coupés** côté build → CSS du tiroir absente au 1er essai. Les fichiers **côté
Windows sont complets** ; c'est la lecture *mount* qui plafonne. **Parade** : reconstruire la source dans
`/tmp` (head + heredoc depuis le contenu autoritaire), builder là, **vérifier le bundle livré par
sentinelles**. L'écriture sandbox→Windows n'est **pas** tronquée (tailles `dist/` identiques — vérifié).

---

## ✅ Tranche 2 « mémoire locale » — LIVRÉE (4 juin 2026)

> Objectif atteint : Sati se souvient **entre deux lancements** et **hors-ligne**.

- [x] **Persistance du fil** — IndexedDB, **un seul fil global** horodaté (`memory.js` : `appendExchange` / `loadThread`). Seuls les échanges complets et réussis sont écrits → base toujours alternée.
- [x] **Difficultés repérées** — détection FR automatique (« je comprends pas… »), **dédupées par flash** (`recordDifficulty` / `loadDifficulties`), glissées dans le contexte envoyé à Sati.
- [x] **Réglages mémoire** — panneau **Réglages → Mémoire de Sati** : compteurs + repères (`loadMemoryInfo`), **Effacer** avec confirmation (`clearAllMemory`).
- [x] **Vérif** — 39/39 (couche IndexedDB + helpers, fake-indexeddb) + 8/8 (UI Réglages, jsdom) + build propre 34 modules + sentinelles dans le bundle livré.

### Où est quoi (code, tranche 2)
- `memory.js` — couche IndexedDB (best-effort, no-op si indisponible) + helpers purs (détection, labels, rappel). **Déjà présent**, vérifié ce chantier.
- `SatiChat.jsx` — recharge le fil + difficultés à l'ouverture, persiste chaque échange, glisse les repères dans le contexte. **Déjà câblé**, vérifié.
- `Settings.jsx` / `App.jsx` — **AJOUT de ce chantier** : panneau « Mémoire de Sati » + branchement `loadMemoryInfo` / `onClearMemory` (App reste propriétaire de l'état).

### ⚠️ Piège revu (pont fichiers)
Le pont Cowork ↔ sandbox a **re-tronqué la lecture** des 2 fichiers fraîchement édités (Settings/App : 213/653 l. au lieu de 301/674) alors que l'écriture autoritaire était complète. Parade : contenu autoritaire via l'outil **Read** → reconstruction `/tmp` (heredoc) → build là → livraison `dist/` → **vérif par taille d'octets** (le grep du mount peut rester en retard, la taille non).

## ✅ Tranche 3 « mémoire distante » — LIVRÉE (5 juin 2026)

> Objectif atteint : Sati a une **mémoire sémantique longue durée sur le Pi**. Elle se souvient des
> difficultés passées même dans une **nouvelle conversation** (sans history) et sur une question
> **reformulée** (pas les mêmes mots). C'était le **premier dev déployé en direct par SSH** (accès dédié au Pi).

### Ce qui marche
- **Écriture du journal** : chaque échange écrit le message de Felix dans `keymaker.journal`, tagué
  `difficulte` si un blocage FR est détecté (« je comprends pas… », « ça sert à… »), sinon `question`.
  En **fire-and-forget** après l'envoi de la réponse → **zéro latence ajoutée** à la réponse de Sati.
- **Embeddings Voyage** : chaque entrée porte son `embedding vector(1024)` (`voyage-3.5-lite`, `input_type: document`).
- **Rappel sémantique** : avant de répondre, la question est vectorisée (`input_type: query`), les **3** passages
  les plus proches (cosinus `<=>`) **sous le seuil 0,55** sont injectés dans le prompt. **Repli full-text FR**
  (`content_search`) si Voyage est indisponible. Best-effort : si l'embedding échoue, Sati répond simplement sans mémoire.
- **Injection propre** : la mémoire rappelée va dans un **2ᵉ bloc système NON caché**, après la persona cachée
  → le **prompt caching de la persona est préservé** (la mémoire change à chaque tour, pas la persona).

### Où est quoi (code, tranche 3 — tout dans `modules/keymaker/` sur le Pi)
```
modules/keymaker/src/
├─ services/voyage.ts    ← NOUVEAU. embed(texte, 'query'|'document') → vecteur 1024 (best-effort) ; toVector().
├─ services/anthropic.ts ← buildSystem(memory?) remplace cachedSystem() : persona cachée + bloc mémoire frais.
└─ routes/sati.ts        ← recall() (cosinus + repli FTS) injecté AVANT l'appel Claude ; persist() écrit
                            journal + embedding en fire-and-forget APRÈS res.end().
```

### Vérifications (en direct sur le Pi)
- **Build `tsc` propre** (image rebâtie), **déploiement `--no-deps`** (postgres **intact**, healthy en 7 s), `health` → `db:up`.
- **Test bout-en-bout vert** : difficulté semée (« je comprends pas le voicing… ») → ligne `journal` `difficulte`
  **avec embedding**. Puis question reformulée **sans history** (« mes changements d'accords sonnent maladroits… »)
  → Sati ouvre par *« ça rejoint quelque chose que tu mentionnais sur le voicing »*. **Distance cosinus 0,44 < 0,55.**
  Données de test nettoyées (journal/messages remis au niveau d'avant).
- **Git** : commit scopé `2f0debe` poussé sur `origin/main` (zone `modules/keymaker/**` uniquement ; rebase no-op).

### Décisions de la tranche
- **Quoi mémoriser** : **chaque échange** (pas seulement les difficultés) → mémoire riche, le rappel marche tôt. *(choix de Felix)*
- **Latence** : rappel **synchrone** (~0,44 s d'embedding avant la réponse) accepté ; écriture **asynchrone** (invisible).
- **Seuil 0,55** : calibré sur le test réel (le lié était à 0,44). Au-delà = hors-sujet écarté. Réglable dans `sati.ts` (`RECALL_MAX_DIST`).

### ⚠️ Note déploiement
Édition / build / deploy **directement sur le Pi par SSH** (plus besoin de passer par Felix — le blocage du brief est levé).
Règle d'or respectée : `docker compose build keymaker` puis `up -d --no-deps keymaker` — **jamais** `up -d --build`
(recréerait postgres). Code/docs édités **à la source sur le Pi** (heredoc via SSH) → **pas** de truncation du pont fichiers Cowork ici.

---

## 🏁 Definition of Done (Chantier 5 — tranche 1) — ✅ LIVRÉ (3 juin 2026)
- [x] Tiroir de chat (`SatiChat.jsx`) + client SSE (`sati.js`) branchés au proxy du Pi.
- [x] Contexte live (flash + code de l'éditeur) transmis à chaque envoi ; mémoire de session (history).
- [x] Actions rapides + modes Normal/Rapide ; Sati attend qu'on lui parle.
- [x] Build propre + sentinelles dans le bundle livré + 10/10 unitaires + **test bout-en-bout vert**.
- [x] Roadmap mise à jour ; ce brief créé (tranches 2 & 3 cadrées).

---

*Brief créé le 3 juin 2026, à la fin du Chantier 4. Tranche 1 « Sati parle » réalisée le 3 juin 2026. Tranche 2 « mémoire locale » bouclée + vérifiée le 4 juin 2026 (panneau Réglages Mémoire, 39/39 + 8/8, `dist/` livré). **Tranche 3 « mémoire distante » livrée + vérifiée le 5 juin 2026** (journal + embeddings Voyage + rappel cosinus sur le Pi, déployée en direct par SSH, commit `2f0debe`). **Chantier 5 COMPLET.***
