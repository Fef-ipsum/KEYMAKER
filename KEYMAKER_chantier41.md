# Chantier 41 — Typo réelle & polish visuel

> **FAIT le 10 juin 2026** (4ᵉ chantier du jour). Q4 + D5 + D6 de l'audit :
> « le 20 % de beauté pour 2 % d'effort ».

## Q4 — Les vraies polices, vendorisées

- **Nunito**, **Plus Jakarta Sans** et **JetBrains Mono** en woff2 **variables** (~107 KB au total), servies depuis `public/fonts/` — **zéro requête Google**, cohérent avec la dé-googlisation. Préchargées dans `index.html` (pas de flash de police).
- **Réglage « Police »** (Réglages → Apparence) : Nunito (défaut, ronde) / Jakarta (nette) / Système — posé en `data-font` sur `<html>`, comme le thème. Le code (éditeur, recaps, quiz) passe partout en **JetBrains Mono** avec ligatures (`font-variant-ligatures: contextual`) via la stack `--font-mono` existante.
- Source des woff2 : jsDelivr/fontsource (téléchargés une fois, committés).

## D5 — Chargement du moteur habillé

Le « Chargement du moteur Strudel… » nu devient un bloc avec spinner (respecte `reduce-motion`) + **astuce aléatoire** (8 tips : `~` = silence, `bank()`, `<a b c>`, `.lpf()`, …). Le silence du premier lancement ne ressemble plus à un bug.

## D6 — Audit contraste (programmatique, les 3 thèmes)

18 paires calculées (texte/muted/accent/danger × void/light/matrix) : **tout était AA** (4.5:1+) sauf `--danger` du thème Light (4.40) → passé de `#d92d54` à **`#c41f44`** (5.41:1).

## Vérifié (10 juin)

Smoke : Nunito + JetBrains chargées (`document.fonts.check`), body réellement en Nunito, bascule Jakarta live depuis les Réglages, URLs des fonts correctement rebasées par Vite (`/keymaker/app/fonts/…`), zéro erreur JS. Déployé sur le Pi (fonts servies en 200).
