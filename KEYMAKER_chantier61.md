# Chantier 61 — PWA installable & hors-ligne fiable (+ bugs backend)

> **FAIT le 5 août 2026** — session Cowork « Personal OS » à la demande de Felix
> (« l'app ne marchait pas l'autre jour, Pi hors ligne ou autre chose »).
> Frontière respectée : `modules/keymaker/**` + webapp seulement, cf. `CONTRAT_FRONTIERE.md`.

## Le constat (audit avant de toucher)

Le build C60 déployé était **déjà** une PWA complète (manifest + précache Workbox
~5,5 Mo + NavigationRoute offline, Chantier 47). Serveur sain : app/sw/manifest
en 200, santé `db: up`. Donc « ça ne marchait pas » = très probablement l'un de :
PWA jamais (ré)installée sur l'appareil, DNS MagicDNS côté téléphone (cf. incident
POS du 07-27/28), ou message d'erreur ambigu (« Pi injoignable » alors que c'est
l'appareil qui était hors ligne). Le chantier blinde les trois.

## App (source `keymaker-app/`, build `dist-pi-c61`)

1. **Installation explicite** — `src/pwa.js` (NOUVEAU) : capture de
   `beforeinstallprompt` AVANT le rendu (main.jsx), rejoué par un bouton
   **« 📲 Installer »** (carte Accueil + Réglages → section **Application**).
   Détection « déjà installée » (display-mode standalone) → badge ✓. Repli
   texte si le navigateur ne propose pas l'événement (menu ⋮ → Ajouter à
   l'écran d'accueil).
2. **« Hors ligne » ≠ « Pi injoignable »** — état réseau global
   (`navigator.onLine` + events) : pastille **⚡ hors ligne** dans la topbar,
   bandeau rassurant sur l'Accueil (« l'essentiel fonctionne : leçons, Studio,
   révisions, notes »), bandeau Sati adapté, statut Pi `(hors ligne)` au lieu
   d'un « injoignable » accusateur.
3. **Reconnexion sans friction** — avant : UN ping santé au boot, puis plus
   rien (app démarrée hors ligne = statut rouge jusqu'au test manuel).
   Maintenant : re-ping au retour du réseau (`online`), quand l'onglet
   redevient visible (si pas vert), et 800 ms après une modification de
   l'URL du Pi.
4. **Sessions jamais perdues** — `sessionTrack.js` : file d'attente
   localStorage (max 20) pour les sessions POSTées hors ligne / Pi absent,
   drainée au boot en ligne + à l'événement `online`.
5. **Sons hors ligne** — 2ᵉ règle runtime Workbox pour les **soundfonts**
   (`felixroos.github.io/webaudiofontdata/*.js` — la règle wav/mp3/ogg/json ne
   les couvrait pas → sons `gm_` muets hors ligne même déjà joués) ; plafond
   samples 600 → **1200 entrées**. Toujours : un son joué une fois en ligne =
   disponible hors ligne.
6. **Manifest** : `id: './'` explicite. `index.html` : favicon SVG +
   `apple-touch-icon`.

## Backend (`modules/keymaker/`, rebuild du container)

- **`trustProxy: true`** (index.ts) — derrière Caddy, `req.ip` était l'IP du
  conteneur caddy pour tout le monde → rate-limit partagé entre tous les
  appareils. Lit désormais X-Forwarded-For.
- **Redirect 301 réparé** — Fastify v4 = `redirect(code, url)` ; l'ancien
  `redirect(url, 301)` renvoyait un 302.
- **Abort du stream Anthropic si le client part** (sati.ts) — fermeture de la
  PWA / réseau coupé / Stop en plein stream : la génération continuait dans le
  vide (tokens facturés, réponse persistée jamais vue). `res.once('close')` →
  `stream.abort()`, et on ne persiste pas un tour abandonné.
- Purge occasionnelle de la Map du rate-limit (fuite lente).

## Déploiement

- Build : `npx vite build --base=/keymaker/app/ --outDir dist-pi-c61` (+ `dist/`
  local rebâti, base `/`). Livraison : tar → scp (Posh-SSH) → extraction dans
  `repo/modules/keymaker/webapp/` (`.gitkeep` préservé), volume `:ro` servi à
  chaud. Backend : commit + push `personal-os`, `git pull` Pi,
  `docker compose build keymaker && docker compose up -d --no-deps keymaker`.

## À savoir (réinstallation téléphone)

Après tout incident réseau, si le navigateur remarche mais pas l'icône PWA :
**désinstaller l'icône, rouvrir `https://personal-os.tailac998e.ts.net/keymaker/app/`
en ligne une fois, réinstaller** (même piège WebAPK que le POS, mémoire du 07-28).
L'app exige que le téléphone résolve le nom ts.net (MagicDNS — pas de DNS privé
qui court-circuite Tailscale).
