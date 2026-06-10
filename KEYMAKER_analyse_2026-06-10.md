# KEYMAKER — Analyse complète & plan d'amélioration

> Audit du 10 juin 2026 (code app + backend Pi + données live + docs).
> **Comment lire ce doc :** commence par « L'essentiel », puis pioche une section. Chaque reco dit *pourquoi* et *quoi faire*. La fin = chantiers prêts à lancer, un par conversation, comme d'habitude.

---

## L'essentiel en 30 secondes

Les fondations sont **excellentes** : curriculum complet (8 modules, 181 flashs, pédagogie soignée), Sati branchée avec mémoire sémantique, infra Pi saine (container healthy, contrat de frontière respecté), code défensif et testé.

Les 3 freins qui empêchent Keymaker d'être *réellement* utile aujourd'hui :

1. **L'app n'existe que sur le PC** (`start.bat` → `localhost:4321`). Pas de tablette, pas de téléphone, friction au démarrage. La vision d'origine (PWA cross-device via Tailscale) n'est pas câblée — alors qu'il manque ~1 heure de config Caddy.
2. **Rien ne mesure l'apprentissage.** Un flash est « vu » dès qu'il est ouvert. Pas de quiz, pas de révision, pas de notion de maîtrise. Or pour un cerveau TDA, *l'active recall et la répétition espacée sont précisément ce qui fait tenir les connaissances*.
3. **Aucun rappel externe.** Le streak n'existe que si tu ouvres l'app. Le Pi a déjà `ntfy` qui tourne — la connexion n'est juste pas faite.

Et **1 vrai bug trouvé** dans la mémoire de Sati (§ Bugs) : le journal sémantique stocke le contexte technique au lieu de tes questions → les souvenirs de Sati se diluent à mesure que tu l'utilises.

---

## Ce qui est déjà fort (à préserver)

- **Curriculum complet et cohérent** : 181 flashs, structure constante (concept court → code jouable → décodage → théorie → exercice), genres électro en fil rouge, ponts guitare. C'est le cœur de la valeur, il est là.
- **Architecture UI saine** : un seul éditeur Strudel monté une fois, jamais recréé — le son ne coupe jamais quand on navigue. Les overlays (Parcours, Réglages, Sati, Studio, Accueil) flottent au-dessus. C'est le bon pattern.
- **Sati bien branchée** : streaming token par token, contexte live (flash + code de l'éditeur + erreurs), mémoire 3 couches (RAM / IndexedDB / Postgres+pgvector). Le rappel sémantique *fonctionne* (testé bout-en-bout).
- **Code défensif partout** : try/catch systématique, l'app ne crashe jamais, tout se dégrade en silence (IndexedDB absent → app OK sans mémoire).
- **Infra propre** : module Docker isolé, healthcheck, aucun port public, clé API jamais côté navigateur, contrat de frontière avec Personal OS tenu.

---

## 🐛 Bugs & corrections (trouvés pendant l'audit)

### B1 — Le journal sémantique est pollué par le contexte *(le plus important)*
**Constat (vérifié en DB)** : les 26 entrées de `keymaker.journal` commencent toutes par `<contexte_app>…`. Le front (sati.js `composeMessage`) colle le bloc contexte + ta question dans UN seul message ; le Pi journalise et *embedde* ce texte entier.
**Conséquences** : les embeddings encodent surtout du bruit (position, code de leçon) au lieu de ta question → le rappel « souvenirs » se dégrade avec l'usage ; la détection de difficulté (regex côté Pi) tourne sur le mauvais texte ; les souvenirs réinjectés sont verbeux.
**Fix** : envoyer `{ message, context }` séparés dans le body ; le Pi assemble pour Claude mais ne journalise/embedde QUE `message`. Migration optionnelle : nettoyer les 26 entrées existantes (strip du bloc `<contexte_app>`) et ré-embedder.

### B2 — `max_tokens: 1024` tronque les réponses longues
Les « ✏️ Crée une leçon » (Chantier 33) demandent concept + code + exercice : 1024 tokens, c'est juste. **Fix** : `max_tokens` par mode (fast 512 / normal 1500 / deep 4000).

### B3 — Le mode `deep` (Opus) n'est jamais utilisé
Le backend le gère, le front ne l'envoie jamais (seulement `fast` et défaut). Opus = le modèle prévu pour les explications profondes et le futur Mode Flow. **Fix** : l'exposer (cf. Q3).

### B4 — Table `sessions` morte (0 lignes)
Le backend a des routes sessions/profil jamais appelées par le front. Soit on les utilise (cf. S3), soit on les retire — mais pas d'entre-deux silencieux.

### B5 — Petites fuites front
- Listener `pointermove` du spotlight qui s'accumule si on toggle le réglage (App.jsx ~348).
- `flashToast._t` : timeout accroché à la fonction, fragile si double appel (Studio.jsx ~138).
- Polling de montage de l'éditeur (80 ms / 20 s) — préférer un await/MutationObserver.

### B6 — Migration IndexedDB v1→v2 : l'index `flashKey` du store difficultés n'est pas re-créé pour une base née en v1.

### B7 — Ménage : 6 fichiers `.fuse_hidden*` + `styles.css.bak` (53 KB) traînent dans `src/`.

### B8 — Pas de retry sur `streamSati`
Une micro-coupure réseau = échec sec « Pi injoignable ». **Fix** : 1 retry automatique avec backoff court avant d'afficher l'erreur.

---

## 🔥 Quick wins (impact fort, effort faible — 1 petite session chacun)

### Q1 — Servir l'app depuis le Pi *(LE déclencheur de tout le reste)*
**Pourquoi** : c'est le passage de « projet de dev sur mon PC » à « app dans ma poche ». Tablette au canapé, téléphone en pause au travail, PWA installée partout, plus jamais `start.bat`, toujours la dernière version.
**Quoi** : copier `dist/` sur le Pi (ex. `modules/keymaker/webapp/`), 5 lignes Caddy (`handle /keymaker-app/*` → `file_server`), build avec `base: '/keymaker-app/'`. Accessible via Tailscale depuis tous tes appareils. À déclarer dans le contrat de frontière (1 route de plus).
**Bonus** : le PC garde `start.bat` comme repli hors-ligne.

### Q2 — Rappels quotidiens via ntfy *(déjà sur ton Pi !)*
**Pourquoi** : le rappel externe est LA béquille TDA qui marche. Un streak sans rappel ne survit pas à une semaine chargée.
**Quoi** : un petit cron sur le Pi (ou tâche du Personal OS) : « 🎛️ 19h — 10 min de Strudel ? Tu es à J+4 de streak » via ntfy. Plus tard : couper le rappel les jours où l'app a déjà été ouverte (lecture `keymaker.sessions` une fois S3 fait).

### Q3 — Donner accès à Opus + max_tokens adaptés
**Quoi** : corrige B2+B3 d'un coup. Dans le tiroir Sati, un 3ᵉ choix « 🔮 Profond » (mode deep) à côté de Rapide/Normal ; et « ✏️ Crée une leçon » passe automatiquement en deep. Effort : ~20 lignes front + 5 backend.

### Q4 — La vraie typo (Nunito / Plus Jakarta Sans + JetBrains Mono)
**Constat** : la vision design prévoyait Nunito/Jakarta + JetBrains Mono ; aujourd'hui c'est Segoe UI système, et JetBrains Mono n'est chargée nulle part (fallback Consolas). C'est le « 20 % de beauté pour 2 % d'effort ».
**Quoi** : vendoriser les .woff2 (pas de Google Fonts — cohérent avec ta dé-googlisation), `@font-face`, et le réglage de police prévu dans Réglages → Apparence.

### Q5 — Fix mémoire Sati (B1) — petit chantier, gros effet long terme. À faire tôt : chaque jour d'usage ajoute des entrées polluées.

---

## 🎯 Rendre l'apprentissage réellement efficace *(le cœur du sujet)*

> **Le principe** : aujourd'hui Keymaker est un excellent *cours*. Ce qui transforme un cours en *apprentissage durable*, c'est : se tester (active recall), revoir au bon moment (répétition espacée), produire (exercices vérifiés). Les trois sont notoirement efficaces pour les cerveaux TDA — et les trois manquent.

### E1 — Quiz actif (Chantier 17 prévu) — *la priorité n°1 pédagogique*
- 2-3 questions générées par Sati à la fin de chaque chapitre (elle a déjà tout le contexte).
- Formats : code à trous (« complète pour obtenir un kick 4/4 »), vrai/faux, « qu'entend-on ? » (le code joue, tu réponds).
- Le résultat alimente la maîtrise (E3) et le SRS (E2). Haiku suffit → rapide et pas cher.

### E2 — Répétition espacée (Chantier 23 prévu)
- L'infra est quasi prête : `difficultes` (IndexedDB) + résultats de quiz.
- Au lancement : « 📬 3 flashs à revoir aujourd'hui » (un raté récent, un moyen, un ancien). Algo simple type Leitner (3 boîtes), pas besoin d'un SM-2 complet.
- C'est LE multiplicateur du curriculum existant : tes 181 flashs deviennent un système vivant au lieu d'une bibliothèque.

### E3 — Maîtrise par flash (au-delà de « vu »)
- 3 états : `vu` / `pratiqué` (exercice fait) / `maîtrisé` (quiz OK).
- Le Parcours et l'Accueil colorent selon l'état → tu VOIS où tu en es vraiment. (Le « skill tree » de la vision d'origine, version honnête.)

### E4 — « ✓ Vérifie mon exercice » (Sati évalue le code)
- Chaque flash a déjà un `exercise` texte + ton code live part déjà dans le contexte.
- Un bouton sous l'éditeur : Sati (Haiku) répond en 2 phrases : objectif atteint ? quoi améliorer ?
- Ferme la boucle « consigne → production → feedback » qui aujourd'hui reste ouverte.

### E5 — Mode Flow (vision d'origine, Chantier 18/41)
- « J'ai 20 minutes » → Sati (Opus) orchestre : 1 révision SRS + 1 flash nouveau + 1 défi créatif, enchaînés.
- Le plus gros différenciateur à terme — mais il a besoin de E1/E2/E3 comme briques. À faire après.

### E6 — Défi du jour (vision d'origine, jamais codé)
- Un prompt créatif par jour (généré par Sati en avance, ou table locale de 60 défis) : « un beat house avec UN seul son », « une mélodie triste en mi mineur »…
- Anti-page-blanche pour les jours sans énergie : ouvrir → un défi → 10 min → fini.

---

## 🧠 Sati next level

### S1 — Profil vivant
La table `profil` (niveau, objectifs, prefs, progression) existe mais reste figée. Après chaque session, un appel Haiku fire-and-forget pourrait la mettre à jour (« à l'aise avec les filtres, bute sur les voicings d'accords ») → le system prompt de Sati cite un profil qui évolue. Effort modéré, déjà toute l'infra.

### S2 — Détection de difficulté par IA (remplace la regex)
La regex actuelle est conservatrice (elle rate « euh je vois pas le rapport avec la gamme »). La classification du message (difficulté ? sujet ?) peut se faire par Haiku dans le `persist()` déjà asynchrone — zéro latence ajoutée, tagging bien meilleur, et le `kind` du journal devient fiable pour le SRS.

### S3 — Sessions réelles (réveiller la table morte)
À la fermeture (ou après X min d'inactivité), le front POste `sessions` : durée, flashs vus, mode. Ça nourrit : stats (P4), rappels intelligents (Q2), résumés de progression par Sati, et le morning-report (C2).

### S4 — Résumé de fil long
L'historique envoyé est plafonné à 8 paires (bien) mais au-delà, tout est perdu pour la conversation courante. Quand le fil dépasse ~20 paires, demander à Haiku un résumé en 3 lignes, stocké et injecté comme contexte. Sati garde le fil des longues sessions.

---

## 📱 Praticité quotidienne

### P1 — Responsive tablette & téléphone *(condition de Q1)*
Aujourd'hui : `stage` 880 px fixe, topbar qui déborde, éditeur 19 px. Il faut un vrai breakpoint < 880 px : topbar compactée (icônes), stage fluide, boutons plus gros. **Tablette = cible n°1** (Galaxy Tab A9+ : taille OK pour coder). **Téléphone = mode consultation** (vision d'origine) : flashs lisibles, quiz, Sati — éditeur replié par défaut.

### P2 — Offline complet (Chantier 19 prévu)
Le moteur Strudel (vendor, ~10 MB) n'est pas précaché → première visite et certains sons exigent le réseau. Précacher vendor + un kit de sons de base = pratiquer dans le train. (Cohérent avec Q1 : le SW servi depuis le Pi.)

### P3 — Reprendre en 1 geste
L'Accueil s'ouvre 1×/jour avec « Reprendre » — bien. Ajouter : Ctrl+R/bouton « ▶ là où j'étais » depuis n'importe quel écran, et dans le rappel ntfy, un lien direct profond vers le dernier flash.

### P4 — Stats honnêtes (Chantier 29 prévu)
Temps par module, minutes/semaine sur 4 semaines, jours actifs. Pas de gamification creuse : des chiffres vrais, dans l'Accueil. (Dépend de S3 pour le temps réel passé.)

### P5 — Cheat sheet PDF (Chantier 25 prévu)
Un A4 par module depuis les tables récap existantes (déjà structurées dans lessons.js → génération quasi mécanique). Référence physique au mur de l'atelier = ancrage hors écran, très TDA-friendly.

---

## 🔌 Connexions & intégrations

### C1 — ntfy *(= Q2, la plus rentable, infra déjà là)*

### C2 — Morning report du Personal OS
Une ligne Keymaker dans ton brief du matin : « hier 22 min de Strudel · streak 5 j · 3 flashs à revoir ». Lecture seule du schéma `keymaker.*` par le module morning-report — **à déclarer dans le contrat de frontière** (lecture cross-schema autorisée si déclarée). Effort faible, ancre Keymaker dans ta routine existante.

### C3 — WebMIDI : un clavier dans Keymaker *(le pont solfège ↔ réel)*
Strudel supporte WebMIDI nativement. Avec n'importe quel mini-clavier USB (~40 CHF) : « joue la tierce de Do » → tu joues, l'app entend, valide en vrai. L'ear training et le solfège passent du quiz mental au geste physique. Gros potentiel pédagogique pour le Module 2-3 — et ça sert ta guitare (brancher une interface audio plus tard).

### C4 — Import communauté strudel.cc (vision « Discover »)
Coller une URL strudel.cc → le pattern s'ouvre dans le Studio (le décodeur d'URL existe déjà — l'encodeur du Chantier 20 marche dans les deux sens). Apprendre en désossant les patterns de DJ Dave & co. Effort faible si on reste sur « coller une URL » (pas de scraping).

### C5 — Notion (optionnel, plus tard)
Export mensuel du journal d'apprentissage vers une page Notion (résumé Sati : sujets vus, difficultés, victoires). Sympa mais non structurant — à faire seulement si tu en ressens l'envie réelle.

### C6 — PO-33 : finir ce qui est commencé
Le sync 2 PPQN est codé et testé côté logique ; il reste **le test physique avec le câble Y** (toi + 10 min). À cocher avant d'empiler du neuf.

---

## ✨ Beauté & design

### D1 — Typo réelle *(= Q4)* — le plus gros saut visuel pour le moindre effort.

### D2 — Identité visuelle par module (les genres comme matière)
Chaque module a déjà son genre (techno, trance, EBM, acid, ambient/D&B, house…). Donner à chacun une **teinte d'accent + une texture d'en-tête discrète** (scanlines pour l'EBM, vagues lentes pour l'ambient…). L'app raconte visuellement où tu es — et le Parcours devient une carte de territoires plutôt qu'une liste.

### D3 — Micro-célébrations sobres
Fin de chapitre : un glow + « Chapitre bouclé · 5/5 » 2 secondes. Fin de module : écran récap (ce que tu sais faire maintenant + le pattern emblème du module). Dopamine honnête, pas de confettis criards — et `prefers-reduced-motion` respecté comme déjà fait.

### D4 — Oscilloscope dans le Studio (vision d'origine)
Le visualiseur rythmique (C26) est top pour les patterns ; il manque la **forme d'onde/spectre** temps réel pour *voir* ce que les filtres/ADSR font au son — pédagogiquement précieux pour le Module 4. Web Audio AnalyserNode sur la sortie, canvas thème-aware, ~1 chantier.

### D5 — Chargement du moteur habillé
Au premier lancement : skeleton + « le moteur arrive… » + un tip aléatoire (« savais-tu : .bank("RolandTR808")… »). Le silence actuel fait croire à un bug.

### D6 — Audit contraste (rapide)
Thème Light + accent violet pâle : vérifier WCAG AA (texte secondaire surtout). 30 min avec DevTools.

---

## 🧹 Dette technique (au fil de l'eau, pas urgent)

- **App.jsx : 1185 lignes, 58 hooks.** Extraire 3-4 morceaux (FlashScreen, TopBar, état de navigation) — *seulement* à l'occasion d'un chantier qui y touche déjà, les tests jsdom existants comme filet.
- **lessons.js bundlé statiquement (201 KB)** : `import()` dynamique par module = démarrage plus léger ; à coupler avec P2.
- **Clés de progression par indices** (`m:c:f`) : si tu insères un chapitre un jour, tout décale. Migrer vers les ids stables (`'4.12'`) qui existent déjà dans les données.
- **Logger minimal** : les erreurs avalées par les try/catch sont invisibles. Un ring-buffer localStorage (50 dernières) + panneau « Debug » dans Réglages → À propos.
- **SatiChat.jsx (563 l.)** : découper en MessageList / Composer / QuickActions à la prochaine retouche.

---

## 🗺️ Chantiers proposés (prêts à lancer, un par conversation)

| # | Chantier | Contenu | Effort | Impact |
|---|---|---|---|---|
| **34** | **App servie par le Pi** | Q1 (Caddy + base path + contrat) + P3 lien profond | S | 🔥🔥🔥 |
| **35** | **Mémoire de Sati assainie** | B1 (message/context séparés) + B2/B3 (max_tokens, deep) + nettoyage des 26 entrées | S | 🔥🔥 |
| **36** | **Rappels ntfy** | Q2 (cron + message streak + opt-out) | S | 🔥🔥 |
| **37** | **Quiz de chapitre** | E1 (génération Sati + UI quiz + stockage résultats) | M | 🔥🔥🔥 |
| **38** | **Répétition espacée** | E2+E3 (états de maîtrise, file de révision, Leitner) | M | 🔥🔥🔥 |
| **39** | **Vérif d'exercice** | E4 (bouton ✓ + prompt évaluation Haiku) | S | 🔥🔥 |
| **40** | **Responsive tablette/mobile** | P1 (breakpoints, topbar compacte, mode consultation) | M | 🔥🔥 |
| **41** | **Typo & polish visuel** | Q4 + D5 + D6 (fonts vendorisées, loader, contrastes) | S | 🔥 |
| **42** | **Sati vivante** | S1+S2+S3 (profil auto, tagging Haiku, sessions réelles) + C2 (morning report) | M | 🔥🔥 |
| **43** | **Défi du jour** | E6 (banque de défis + carte Accueil) | S | 🔥 |
| **44** | **Mode Flow** | E5 (orchestration Opus : révision+nouveau+défi) — après 37/38 | L | 🔥🔥🔥 |
| **45** | **WebMIDI solfège** | C3 (clavier USB, exercices d'oreille/notes M2) | M/L | 🔥🔥 |
| **46** | **Studio augmenté** | D4 (oscilloscope) + C4 (import URL strudel.cc) + D2 (identités modules) | M | 🔥 |
| **47** | **Offline & perf** | P2 (précache vendor+sons) + lessons.js dynamique + B5/B6/B7/B8 | M | 🔥 |

**Légende effort** : S = une session courte · M = une session pleine · L = deux sessions.

---

## Par quoi commencer — ma reco

1. **C34 (app sur le Pi)** — tout le reste devient plus utile une fois l'app dans ta poche.
2. **C35 (mémoire Sati)** — chaque jour d'attente ajoute des souvenirs pollués.
3. **C36 (ntfy)** — le filet anti-oubli, 1 h de travail.
4. **C37 puis C38 (quiz puis SRS)** — le cœur pédagogique ; c'est là que « vu » devient « su ».
5. **C40 (responsive)** — dès que tu utilises vraiment la tablette.

Les trois premiers tiennent chacun dans une petite session — trois soirs, et Keymaker change de catégorie : d'app de dev locale à compagnon quotidien qui se souvient, te rappelle, et te fait réviser au bon moment.

---

*Audit réalisé le 10 juin 2026 — code front (12 951 lignes src), backend Pi (405 lignes TS), base live (26 journal / 68 messages / 0 sessions), docs projet. Aucune modification de code dans cette session.*
