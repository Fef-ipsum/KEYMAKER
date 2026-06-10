# Chantier 34 — L'app servie par le Pi (`/keymaker/app/`)

> **FAIT le 10 juin 2026, en autonomie** (même session que le Chantier 35).
> Issu de l'audit `KEYMAKER_analyse_2026-06-10.md` (reco n°1).

## Le problème

L'app ne vivait que sur le PC (`start.bat` → `server.mjs` → `localhost:4321`). Pas de tablette, pas de téléphone, friction au démarrage — alors que la vision d'origine était une PWA cross-device via Tailscale.

## Ce qui a été fait

**L'app est désormais servie par le module keymaker lui-même**, sous la route Caddy `/keymaker*` **déjà existante** → zéro changement d'infra partagée (ni Caddyfile, ni compose principal).

- **URL : `https://personal-os.tailac998e.ts.net/keymaker/app/`** — depuis n'importe quel appareil Tailscale (PC, Galaxy Tab, téléphone). Installable en PWA (manifest + SW scope `/keymaker/app/`).
- **Backend** (`modules/keymaker/`) : `@fastify/static` ajouté ; `index.ts` sert `webapp/` sous `/keymaker/app/` (cache `no-cache` pour html/sw, 24 h pour les assets), redirect 301 `/keymaker/app` → `/keymaker/app/`, repli SPA (tout GET inconnu sous le préfixe → `index.html`). Si `webapp/index.html` est absent → API seule + warning au boot (aucune casse).
- **`docker-compose.keymaker.yml`** (zone Keymaker) : volume `./modules/keymaker/webapp:/app/webapp:ro` → **mettre à jour l'app = remplacer le contenu de `webapp/`, pas de rebuild d'image**.
- **Front** : `DEFAULT_PI_URL` devient dynamique — si l'app n'est pas sur `localhost`, l'URL du Pi par défaut = `window.location.origin` (zéro config sur un nouvel appareil). En local (`start.bat`), comportement inchangé (URL Tailscale).
- **Deux builds** désormais :
  - `vite build` (base `/`) → `dist/` — le build LOCAL servi par `start.bat` (inchangé).
  - `vite build --base=/keymaker/app/ --outDir dist-pi` → **build Pi** ; livré par `tar cz` + `scp` puis extraction dans `modules/keymaker/webapp/` sur le Pi.
- `webapp/` est **gitignoré** côté repo personal-os (artefact de build ; la source vit dans le repo Strudel CC).

## Vérifié (10 juin, via Caddy/Tailscale en HTTPS)

- `GET /keymaker/app/` → 200 (index 1161 o) · bundle JS → 200 (437 ko) · vendor Strudel → 200 (2,2 Mo) · manifest → 200 · route inconnue → 200 (repli SPA) · `/keymaker/app` → 301 `/keymaker/app/`.
- `GET /keymaker/health` → `{"status":"ok","db":"up"}` (API intacte).
- `POST /keymaker/ai/chat` en SSE via Caddy → stream OK (contrat C35).

## Procédure de mise à jour de l'app sur le Pi

```bash
# depuis le sandbox, après un build dist-pi :
tar -czf /tmp/webapp.tgz -C dist-pi .
scp /tmp/webapp.tgz felix@100.68.239.15:/tmp/
ssh felix@100.68.239.15 "cd /mnt/wd-elements/personal-os/repo/modules/keymaker/webapp && rm -rf ./* && tar -xzf /tmp/webapp.tgz"
# pas de redéploiement du container : le volume est monté en :ro, servi à chaud.
```

## Reste à faire (avec Felix)

- Ouvrir l'URL sur la tablette + le téléphone, « Ajouter à l'écran d'accueil » (PWA).
- ⚠️ L'UI n'est **pas encore responsive** < 880 px (Chantier 40 proposé) : utilisable sur tablette paysage, étroit sur téléphone.
- Premier chargement : le vendor (~5 Mo) transite par Tailscale — patienter quelques secondes, ensuite le navigateur le met en cache.
