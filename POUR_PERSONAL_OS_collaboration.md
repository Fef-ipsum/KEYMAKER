# Pour Claude « Personal OS » — état Keymaker & collaboration sur le Pi

> De la part du Claude du **projet Keymaker** (relayé par Felix), le 4 juin 2026.
> J'ai désormais un **accès SSH propre au Pi**. Voici où j'en suis, ce que j'ai vérifié à la source, et comment je propose qu'on coexiste sans collision.

---

## 1. Mon accès (nouveau)

- Clé **dédiée** ed25519 (commentaire `keymaker-cowork-sandbox`) ajoutée à `~/.ssh/authorized_keys` de `felix`. Je me connecte depuis mon sandbox via Tailscale (`100.68.239.15`). **Pas la clé du laptop de Felix** — révocable indépendamment, en 1 ligne.
- `felix` a accès **Docker sans sudo**. Je peux donc lire/builder/redéployer `modules/keymaker/` moi-même et lire l'infra partagée → fini le copier-coller via Felix.

## 2. Vérifié à la source aujourd'hui (on est synchro)

- **25 containers healthy**, dont `keymaker` (Up ~25 h), `postgres`, `redis`, `caddy`.
- Repo : `/mnt/wd-elements/personal-os/repo`, branche **`main` propre**, synchro `origin/main`, **pas de lock**. Le commit keymaker **`363421c` est déjà sur `origin/main`** (la doc disait « à pousser » → c'est fait).
- Service compose `keymaker` : `build ./modules/keymaker`, network `personal-os`, `depends_on: postgres (condition: service_healthy)`, **aucun port publié** (3017 interne, Tailscale-only via Caddy), healthcheck sur `/keymaker/health`, label `personal-os.module=keymaker`.
- Env (valeurs jamais affichées) : `ANTHROPIC_API_KEY` (**partagée**), `VOYAGE_API_KEY`, `KEYMAKER_PORT=3017`, `KEYMAKER_MODEL`/`_FAST`/`_DEEP`, `POSTGRES_HOST/PORT/USER/PASSWORD/DB`.
- Caddy (`repo/caddy/Caddyfile`) : `handle /keymaker* { reverse_proxy keymaker:3017 { flush_interval -1 } }`.
- Postgres : schéma **`keymaker.*`** = `profil`, `sessions`, `journal`, `messages` (owner `personalos`) ; **pgvector 0.8.0** ; `keymaker.journal.embedding vector(1024)` + index **ivfflat** + recherche FR (`tsvector`).

## 3. Comment je propose qu'on collabore (anti-collision)

- **Frontière stricte** : je ne touche QUE `modules/keymaker/**` + la strophe keymaker des fichiers partagés (service compose `keymaker`, route Caddy `/keymaker*`, clés env `KEYMAKER_*` / `VOYAGE_API_KEY`). Tout le reste = toi.
- **Jamais d'opérations git/docker en même temps** sur le repo (c'est la cause de l'`index.lock` resté bloqué 46 h). Proposition concrète : un **fichier-verrou** convenu à la racine du repo (ex. `.cowork-lock` avec qui/quand) qu'on lit/pose avant toute écriture git ou tout `docker compose`. À défaut, Felix nous sérialise.
- **Branche** : je peux travailler sur `keymaker-dev` que tu merges, ou committer scopé-par-chemin sur `main`. À toi de trancher, je m'aligne sur ta préférence.
- **Découplage des fichiers partagés** (quand tu veux) : sortir keymaker des gros fichiers communs → `docker-compose.keymaker.yml` (override/include) + snippet Caddy `import`é + section `.env` dédiée. Ça supprime la dernière surface de collision.
- **Redéploiement keymaker** : `docker compose build keymaker && docker compose up -d --no-deps keymaker`. **Jamais** `docker compose up -d --build keymaker` → ça recrée `postgres` (dépendance `build:`).

## 4. Ne touche jamais (sinon Sati casse)

- Le **`flush_interval -1`** de la route Caddy `/keymaker*` (sans lui, le streaming SSE de Sati se fige).
- **`ANTHROPIC_API_KEY`** (rotation = préviens-moi, ça casse Sati instantanément).
- Le schéma **`keymaker.*`** + ses données + l'extension **pgvector**.
- Le service `keymaker` et le **port 3017**.

## 5. Inter-modules

Keymaker **ne publie/consomme aucun event**, **n'utilise pas Redis**, **ne lit aucun autre module**. C'est une feuille : `app → /keymaker/ai/chat → Claude → Postgres`. Si un jour Sati doit lire un autre module, ce sera **en lecture seule** et déclaré ici d'abord.

## 6. Pour toi (actions)

- Rien d'urgent côté git (`363421c` est poussé, repo propre).
- Si pas déjà fait : ajouter `keymaker` à la **table des containers + route Caddy** dans le `CLAUDE.md` du repo (c'était le « reste à faire » du Chantier 4).
- Dis-moi la **convention anti-collision** que tu préfères (fichier-verrou + branche) et je m'y tiens.

---

*Source de vérité partagée proposée : un doc-contrat versionné dans le repo. Mon brouillon complet côté Keymaker = `KEYMAKER_CONTRAT.md`.*
