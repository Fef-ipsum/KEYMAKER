# Chantiers 58–60 — Suite ergonomie (issue de l'audit C57)

> **FAIT le 14 juin 2026.** Déployé et vérifié live sur le Pi (`/keymaker/app/` → 200).
> Suite directe de `KEYMAKER_audit_ergonomie.md`.

## C58 — Le Studio adopte le menu « ⋯ Outils »

Le Studio était le 2ᵉ écran le plus chargé. Il parle maintenant **la même langue** que la leçon.

- **Composant partagé** `ToolsMenu.jsx` : un seul menu, piloté par une liste d'`items` (`toggle` / `action` / `sep`). La leçon **et** le Studio l'utilisent → une seule grammaire de boutons à apprendre, un seul code à maintenir.
- **Studio** : `Run / Stop / statut / tempo (−/+)` restent en avant ; le reste (Visualiseur, Oscilloscope en bascules + Sauvegarder, Ouvrir, Télécharger, Vider en actions) passe dans le menu. La `share-row` de 5 boutons a disparu.
- *Pourquoi :* moins de bruit visuel = moins de charge d'attention. Le tempo reste dehors car c'est une commande de **jeu**, pas un réglage.

## C59 — Réglage « Visualiseur en accès direct »

Réponse à ton besoin **réglable / paramétrable / ajustable**.

- Nouveau réglage : **Réglages → Éditeur de code → « Visualiseur en accès direct »** (`settings.vizDirect`, défaut OFF).
- ON : le Visualiseur **sort du menu** et redevient un bouton direct sous l'éditeur — **leçon ET Studio**.
- *Pourquoi :* le Visualiseur est pédagogiquement utile ; si tu l'utilises beaucoup, tu le gardes à portée. C'est **toi** qui décides, pas un choix imposé.

## C60 — Contraste Light (fait) + objectif par flash (cadré)

- **Contraste (fait)** : en thème Light, l'accent indigo sur fond clair frôlait la limite AA. Désormais l'item « coché » garde son **libellé en texte plein** (lisible) + un fond léger, et la pastille **« activé »** est **pleine** (texte clair sur accent) → contraste sûr sur les 3 thèmes.
- **Objectif par flash (reporté volontairement)** : afficher « 🎯 Objectif : … » par flash = **écrire ~186 phrases** de contenu pédagogique. Je ne l'auto-génère pas à l'aveugle (ta rigueur pédagogique d'abord). À faire en **passe dédiée** : brouillons via Opus → tu valides. À planifier (C61 ?).

## Fichiers touchés

- **`ToolsMenu.jsx`** (nouveau) — menu partagé générique
- **`App.jsx`** — leçon : items + `vizDirect`, retrait du ToolsMenu inline
- **`Studio.jsx`** — menu Outils, retrait de la share-row
- **`Settings.jsx`** — toggle C59
- **`styles.css`** — contraste C60
- **`.gitignore`** — `keymaker-app/dist-pi*/` (artefacts de build Pi)

## Vérifié (14 juin)

- `vite build` → 60 modules, 0 erreur. Chaînes présentes : menu Studio (`Oscilloscope`), réglage (`Visualiseur en accès direct`).
- Déploiement Pi (`dist-pi-c60`, base `/keymaker/app/`) → `GET /keymaker/app/` 200, bundle servi à jour, `/keymaker/health` → `db: up`.
