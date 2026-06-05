# Keymaker — Chantier 4 : Setup du Pi (le backend)

> **Brief de démarrage.** À ouvrir en début de nouvelle conversation.
> Felix : ouvre une conv dans le projet et dis simplement « **on attaque le Chantier 4** ».
> Claude relit `KEYMAKER_roadmap.md` + ce fichier, puis propose un plan en micro-étapes.

---

## 🎯 Objectif du chantier

Donner un **cerveau distant** à l'app : un petit backend sur le Raspberry Pi qui héberge
**PocketBase** (base de données + auth) et un **proxy IA** (la clé API Claude reste sur le Pi,
jamais dans le navigateur). Le tout joignable de partout via **Tailscale** (déjà installé).

À la fin : depuis l'app (ou un simple `curl`), un message part → le Pi ajoute la clé et appelle
Claude → la réponse revient. Et PocketBase tourne, prêt à stocker la mémoire distante.

> ⚠️ **Ce chantier ne touche presque pas à l'app.** L'app reste 100 % utilisable en local sans le Pi.
> Le Pi sert à **débloquer Sati** (Chantier 5) et la sync distante. C'est de l'infra, pas du contenu.

---

## ✅ Ce qui est déjà fait (Chantiers 1 → 3)

- **Module 1 complet** : 26 flashs, 5 chapitres, navigables, joués 100 % en local (`keymaker-app/`).
- App React + Vite + PWA, thème Void, éditeur Strudel unique, reprise localStorage.
- Tout le contenu pédagogique du Module 1 est en données (`src/lessons.js`).
- Détails et décisions → `KEYMAKER_roadmap.md` + `KEYMAKER_architecture.md`.

---

## 🧩 Ce qui est déjà décidé (rappel `KEYMAKER_architecture.md`)

- **Backend = PocketBase** sur le Pi (léger, SQLite, auth + API + realtime).
- **Proxy IA = Node/Express** sur le Pi. **La clé API Claude vit UNIQUEMENT sur le Pi** (variable d'env),
  jamais exposée au browser. Toute requête à Claude passe par le Pi.
- **Accès distant = Tailscale** (déjà installé dans Personal-OS sur le Pi).
- **Compte Anthropic existant** (felix.dunkel.home@gmail.com) → **nouvelle clé API à créer** au setup.
- **Mémoire 3 couches** (cible) : Session (RAM browser) · Locale (IndexedDB) · **Distante (PocketBase/Pi)**.
- **Modèles visés** : Haiku (corrections rapides) · Sonnet (quotidien) · Opus (Flow / analyses profondes).
  → *Vérifier les strings exacts + tarifs dans les docs Anthropic au moment du setup (ça bouge).*

---

## 🪜 Plan proposé (micro-étapes, à valider en début de conv)

> TDA-friendly : **une brique qui marche à la fois**. On teste chaque étape avant la suivante.

1. **Reconnaissance du Pi** — joignable via Tailscale ? `uname -m` (ARM64 vs ARMv7, pour le bon binaire),
   Node présent (`node -v`), ports libres, dossier de travail choisi (ex. `~/keymaker-backend`).
2. **PocketBase debout** — télécharger le binaire de la bonne archi, le lancer, créer le compte admin,
   ouvrir l'admin UI via l'IP Tailscale. *(Schéma vide pour l'instant — on le pose à l'étape 5.)*
3. **Proxy IA minimal** — petit serveur Express, **un seul endpoint** (`POST /ai/chat`) qui ajoute la clé
   (env `ANTHROPIC_API_KEY`), appelle l'API Claude (modèle **Haiku** pour tester pas cher), renvoie la réponse.
4. **Sécurité** — le proxy n'écoute **que** sur l'interface Tailscale (pas `0.0.0.0` public), CORS limité à
   l'app (`localhost:4321` + la future tablette), garde-fou anti-emballement (rate limit simple). Clé jamais commitée.
5. **Schéma PocketBase** — créer les collections de la mémoire distante : `profil`, `sessions`, `journal`
   (de quoi accueillir la couche distante de Sati). Minimal mais propre.
6. **Service au démarrage** — PocketBase + proxy en `systemd` pour survivre aux reboots (le Pi est toujours allumé).
7. **Test bout-en-bout** — `curl` (puis l'app) → proxy → Claude → réponse OK ; une écriture test dans PocketBase OK.
8. **Câblage app (léger)** — paramètre **« URL Pi »** + un **ping de statut** dans l'app. *(Le vrai branchement de Sati = Chantier 5.)*

---

## ⚠️ Pièges techniques à garder en tête

- **Clé API = secret.** Jamais dans le browser, jamais dans un fichier commité, jamais dans `dist/`.
  Variable d'environnement sur le Pi uniquement. Si elle fuit → la révoquer et en refaire une.
- **Exposition réseau.** Le proxy doit écouter sur l'**IP Tailscale**, pas en public. Vérifier le firewall du Pi.
- **Bonne archi du binaire** PocketBase (ARM64 vs ARMv7) — sinon « cannot execute ». `uname -m` d'abord.
- **Coûts API.** Chaque appel coûte. Tester avec **Haiku**, prévoir un petit rate limit, surveiller la conso.
- **Joignabilité.** Tout repose sur Tailscale **up des deux côtés** (Pi + appareil). Vérifier avant de débugger plus loin.
- **CORS.** L'app tourne sur `http://localhost:4321` (et plus tard la tablette) → autoriser ces origines explicitement.
- **Pas de dépendance Google** ici (cohérent avec ta sortie de l'écosystème Google). ✅

---

## ❓ À trancher au début de la conv (4 petites questions)

1. **Clé API** : on en crée une **maintenant** (accès console Anthropic + facturation OK), ou on prépare tout le reste d'abord ?
2. **Modèle de test** du proxy : **Haiku** (recommandé, pas cher) pour valider la plomberie, Sonnet plus tard ?
3. **Schéma PocketBase** : minimal « juste pour tester » d'abord, ou on pose **direct les 3 collections** (profil/sessions/journal) ?
4. **Lancement** : **systemd** tout de suite (robuste, recommandé), ou lancement manuel pour commencer et on durcit après ?

---

## 🏁 Definition of Done (Chantier 4)

- [ ] Pi joignable via Tailscale, archi/Node vérifiés, dossier de travail en place.
- [ ] **PocketBase** tourne, admin accessible via Tailscale, collections `profil`/`sessions`/`journal` créées.
- [ ] **Proxy IA** : `POST /ai/chat` répond via Claude, clé en env, **rien côté browser**.
- [ ] Sécurité OK : écoute Tailscale-only, CORS limité, garde-fou conso, clé non commitée.
- [ ] PocketBase + proxy en **service** (survivent à un reboot).
- [ ] **Test bout-en-bout** vert (message → réponse Claude ; écriture PocketBase).
- [ ] App : paramètre « URL Pi » + ping de statut. Roadmap mise à jour (Chantier 4 ✅, brief Chantier 5).

---

## 🔮 Et après ? (Chantier 5 = Sati)

Une fois le Pi debout, le **Chantier 5** branche **Sati** dessus : assemblage du contexte
(profil + mémoire + journal + code courant) côté Pi, choix du modèle selon la tâche, et la mémoire 3 couches.
Le proxy de ce chantier est exactement la fondation dont Sati a besoin.

---

---

## ✅ RÉALISÉ — 3 juin 2026

> Le brief ci-dessus visait PocketBase + proxy Express + systemd. **L'audit du Pi a tout changé** : il héberge déjà **Personal OS** (24 containers Docker, Postgres+pgvector, Caddy, Tailscale, backups, et un module `brain` qui parle déjà à Claude). On a donc fait **mieux et plus cohérent**.

**Décisions prises avec Felix :**
- Backend = **module Docker `keymaker`** intégré au Personal OS (et non PocketBase). Le « proxy IA » = une route Fastify ; la « mémoire distante » = un schema Postgres.
- **Clé API réutilisée** (`ANTHROPIC_API_KEY` déjà sur le Pi, utilisée par `brain`/`journal`/`sport`) — pas de nouvelle clé.
- Mandat **perf-first** : réutiliser l'infra (qui accélère), s'affranchir des règles de modularité si elles brident Sati.

**Livré et vérifié :**
- [x] Module `keymaker/` (Fastify+TS, port 3017) buildé, container **healthy**
- [x] **Proxy Sati** `POST /keymaker/ai/chat` — streaming SSE, modèle adaptatif (Haiku/Sonnet/Opus), prompt caching. Clé **jamais** côté browser
- [x] **Schema** `keymaker.*` : `profil`, `sessions`, `journal` (+ `messages`) ; `embedding vector(1024)` préparé pour la mémoire sémantique
- [x] **Caddy** route `/keymaker*` (`flush_interval -1`) + service `docker-compose` (`restart unless-stopped`)
- [x] Sécurité : Tailscale-only, rate limit simple, clé non commitée, sauvegardes `.bak.c4` des fichiers d'infra
- [x] **Test bout-en-bout vert** : Sati répond via Claude (vérifié), écriture/lecture base OK, **25 containers healthy, 0 régression**
- [x] Commit **local** sur le Pi (`363421c`)

**Reste à faire (validation Felix) :**
- [ ] `git push` du commit `363421c` vers GitHub
- [ ] Câblage léger de l'app (Settings → URL Pi + ping de statut) — *peut aussi ouvrir le Chantier 5*
- [ ] Ajouter `keymaker` à la doc Personal OS (`CLAUDE.md` du repo : table containers + route Caddy)

**Piège rencontré :** `docker compose up -d --build keymaker` recrée `postgres` (dépendance `build:`). Préférer `docker compose build keymaker` puis `docker compose up -d --no-deps keymaker`. (Données intactes : volume disque.)

---

*Brief créé le 3 juin 2026, à la fin du Chantier 3 (Module 1 complet). Chantier réalisé le 3 juin 2026.*
