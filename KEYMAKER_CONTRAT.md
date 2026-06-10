# Keymaker ↔ Personal OS — Contrat de frontière

> **But :** permettre aux deux projets Cowork (Personal OS et Keymaker) de coexister sur le même Pi / même repo `personal-os` **sans collision**.
> **Statut :** réponse côté **Keymaker** aux questions A→F de Personal OS, **vérifiée à la source par SSH le 4 juin 2026**. Sert de graine au doc-contrat partagé.
> **Source de vérité :** app → ce dossier (`KEYMAKER_*.md` + `keymaker-app/`). Infra live → fichiers réels sur le Pi (`/mnt/wd-elements/personal-os/repo`).
>
> ⚠️ **Contrat canonique = `CONTRAT_FRONTIERE.md` à la racine du repo** (commit `45ffff7`+, créé par Personal OS). Ce fichier-ci = mes notes côté Keymaker ; **en cas de divergence, le fichier du repo fait foi.** Alignement vérifié le 4 juin 2026 : identique.
>
> 🔱 **Découplage compose (4 juin, commit `0da3c4f`)** : le service keymaker vit désormais dans **`docker-compose.keymaker.yml`** (mon fichier, fusionné via `COMPOSE_FILE` dans le `.env` gitignoré). **Je n'édite plus `docker-compose.yml`.** Ma zone = `modules/keymaker/**` + `docker-compose.keymaker.yml` + les 5 lignes `/keymaker*` du `caddy/Caddyfile`. Déploiement inchangé.

---

## 0. Accès SSH (depuis le 4 juin 2026)

Le Claude Keymaker dispose d'un **accès SSH dédié** au Pi :
- User `felix`, via Tailscale `100.68.239.15` (MagicDNS `personal-os` ; LAN `192.168.10.190` à la maison).
- Auth par **clé ed25519 dédiée** (`.ssh-keymaker/id_ed25519` dans ce dossier ; commentaire `keymaker-cowork-sandbox`). Révocable en 1 ligne côté Pi.
- Docker accessible sans sudo. Permet lecture infra + build/redéploiement de `modules/keymaker/`.
- ⚠️ Le mot de passe du Pi et la clé privée ne sont **jamais** stockés dans ces docs.

---

## En deux phrases

Keymaker est un **module Docker** du Personal OS (`modules/keymaker/`, Fastify+TS, port interne **3017**) : un **proxy IA** pour « Sati » qui réutilise la clé Claude du Pi et écrit sa mémoire dans le schéma Postgres **`keymaker.*`**. Il est **isolé** (aucun event, aucun Redis, ne lit aucun autre module). Depuis le découplage (4 juin), son service vit dans **son propre `docker-compose.keymaker.yml`** ; la seule surface partagée restante = les **5 lignes** de route `/keymaker*` du `caddy/Caddyfile`.

---

## A — Fichiers partagés & câblage (VÉRIFIÉ à la source)

Hors `modules/keymaker/`, Keymaker touche **3 fichiers**. Câblage réel relevé sur le Pi :

**1. `docker-compose.yml`** — service `keymaker` (extrait exact) :

```yaml
  keymaker:
    build:
      context: ./modules/keymaker
      dockerfile: Dockerfile
    container_name: keymaker
    restart: unless-stopped
    networks:
      - personal-os
    environment:
      TZ: ${TZ:-Europe/Zurich}
      NODE_ENV: production
      KEYMAKER_PORT: "3017"
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}      # PARTAGÉE
      KEYMAKER_MODEL: claude-sonnet-4-6
      KEYMAKER_MODEL_FAST: claude-haiku-4-5-20251001
      KEYMAKER_MODEL_DEEP: claude-opus-4-8
      VOYAGE_API_KEY: ${VOYAGE_API_KEY:-}          # embeddings (mémoire sémantique)
      POSTGRES_HOST: postgres
      POSTGRES_PORT: "5432"
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD","node","-e","require('http').get('http://localhost:3017/keymaker/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"]
    labels:
      personal-os.role: "module"
      personal-os.module: "keymaker"
```
→ **Aucun `ports:`** publié (3017 reste interne ; Caddy reverse-proxy sur le réseau `personal-os`).

**2. `caddy/Caddyfile`** — route (le `flush_interval -1` est **critique**) :

```
	handle /keymaker* {
		reverse_proxy keymaker:3017 {
			flush_interval -1
		}
	}
```

**3. `.env`** — clés propres à Keymaker : `KEYMAKER_MODEL`/`_FAST`/`_DEEP`, `VOYAGE_API_KEY`. **Pas de nouvelle clé Claude** : `ANTHROPIC_API_KEY` est partagée. La connexion Postgres réutilise les `POSTGRES_*` du stack.

> **Invariants :** service `keymaker` · port interne **3017** · `restart unless-stopped` · `depends_on: postgres (service_healthy)` · réseau `personal-os` · **aucun port public** · route `/keymaker*` avec **`flush_interval -1`**.

---

## B — Dépendances infra partagées (VÉRIFIÉ)

- **Env :** `ANTHROPIC_API_KEY` (partagée, jamais côté browser) · `VOYAGE_API_KEY` (embeddings) · `KEYMAKER_MODEL*` (propres) · `POSTGRES_HOST/PORT/USER/PASSWORD/DB` (connexion au Postgres partagé).
- **Postgres :** schéma **`keymaker.*`** — 4 tables : `profil`, `sessions`, `journal`, `messages` (owner `personalos`). `keymaker.journal` porte `embedding vector(1024)` + `content_search tsvector` (FR), index **ivfflat** (cosine) + GIN. **Pas de cross-schema.**
- **pgvector :** présent (**v0.8.0**), requis par la colonne `embedding`.
- **Redis :** **NON utilisé** par Keymaker (ni stream ni channel).
- **API centrale / `brain` :** **aucune dépendance** — appel direct à l'API Claude via `@anthropic-ai/sdk`.
- **Client (hors Pi) :** `localStorage` + IndexedDB (base `keymaker`, stores `messages`/`difficultes`). Zéro impact infra.

---

## C — Surface d'échange

**Endpoints exposés** (derrière Caddy `/keymaker*`, Tailscale-only) :
- `POST /keymaker/ai/chat` → **SSE** (`model`/`delta`/`done`/`error` ; corps `{message, context?, history?, mode?}` — Chantier 35 : `context` = bloc app, jamais journalisé ; `fast`=Haiku, défaut=Sonnet, `deep`=Opus ; persona injectée serveur ; `max_tokens` 600/1500/4000 selon le mode).
- `GET /keymaker/health` → ping (utilisé par l'app + le healthcheck du container).
- `GET /keymaker/app/*` → **l'app Keymaker (PWA statique)** servie par le module (Chantier 34, 10 juin 2026) : `@fastify/static` sur le volume `modules/keymaker/webapp/` (monté `:ro` via `docker-compose.keymaker.yml`, **ma zone**), repli SPA, redirect `/keymaker/app`→`/keymaker/app/`. Passe par la route Caddy `/keymaker*` **existante** → aucun nouveau fichier partagé touché.

**Events publiés/consommés :** aucun. **Ce que d'autres modules attendent de lui :** rien (feuille). Seule extension future possible : lectures cross-module **en lecture seule** si la perf de Sati l'exige — déclarée ici d'abord.

---

## D — Ne touche jamais

`ANTHROPIC_API_KEY` (rotation = prévenir, casse Sati) · **`flush_interval -1`** de la route Caddy (sinon SSE figé) · schéma `keymaker.*` + données + **pgvector** · service `keymaker` / port `3017` · clés `KEYMAKER_*` / `VOYAGE_API_KEY` · **jamais** `docker compose up -d --build keymaker` (recrée `postgres`) → faire `build keymaker` puis `up -d --no-deps keymaker`.

---

## E — Workflow git (VÉRIFIÉ)

- Repo `/mnt/wd-elements/personal-os/repo`, remote `git@github.com:Fef-ipsum/personal-os.git`.
- Branche **`main`**, **propre**, synchro `origin/main`, **pas d'`index.lock`**. Le commit keymaker **`363421c` est déjà poussé** sur `origin/main`.
- Dev directement sur le Pi (POS v2). Mon sandbox joint le Pi en SSH (Tailscale) → je peux éditer/builder/déployer `modules/keymaker/` moi-même.
- **Proposition anti-collision** : fichier-verrou convenu (`.cowork-lock`) lu avant toute opération git/docker ; jamais d'opérations simultanées ; branche `keymaker-dev` mergée par Personal OS, ou commits scopés-par-chemin sur `main`. Felix/Personal OS tranche, je m'aligne.

---

## F — Doc-contrat (ce que je veux dedans)

Un fichier versionné dans le repo, lu par les deux projets : carte de propriété (`modules/keymaker/**` vs reste) · registre des ressources partagées (service/port/route+`flush_interval`/schéma/clés env) · plan de découplage (`docker-compose.keymaker.yml` + Caddy `import` + section `.env`) · liste « ne pas toucher » (= D) · règle inter-comm (API/Redis ; Keymaker n'utilise ni l'un ni l'autre) · règles git + convention de verrou · état courant + accès SSH.

---

## ⚠️ Divergences corrigées

- L'archi **PocketBase/Express/systemd** de `KEYMAKER_architecture.md` est **abandonnée** (3 juin) → module Docker Fastify + Postgres + Caddy.
- **Redis** : convention future OK, mais **non utilisé** aujourd'hui par Keymaker.
- Le commit `363421c` **n'est plus « à pousser »** : il est sur `origin/main` (vérifié le 4 juin).
- Reste utile : ajouter `keymaker` au `CLAUDE.md` du repo (table containers + route).
