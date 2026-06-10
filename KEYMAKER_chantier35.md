# Chantier 35 — Mémoire de Sati assainie + accès Opus

> **FAIT le 10 juin 2026, en autonomie** (même session que le Chantier 34).
> Corrige les bugs B1, B2, B3 et B8 de l'audit `KEYMAKER_analyse_2026-06-10.md`.

## B1 — Le journal sémantique était pollué (le bug principal)

**Avant** : le front concaténait le bloc `<contexte_app>` (position, code de la leçon, code live) et la question de Felix en UN seul `message`. Le Pi journalisait et **embeddait tout** → les 21 entrées de `keymaker.journal` commençaient par `<contexte_app>`, les embeddings encodaient surtout du bruit, le rappel sémantique se dégradait à l'usage, et la regex de difficulté tournait sur le mauvais texte.

**Après** :
- **Contrat élargi** : `POST /keymaker/ai/chat` accepte `{ message, context?, history?, mode? }`. `context` est assemblé dans le contenu envoyé à Claude mais **n'entre jamais dans le journal ni dans les embeddings**. Compat : un ancien front qui envoie tout dans `message` marche comme avant.
- **Front** (`sati.js` / `SatiChat.jsx`) : `streamSati` envoie `message` (la question seule) + `context` (bloc `<contexte_app>`, avec les difficultés locales) séparés. `composeMessage` reste exporté (legacy/tests) mais n'est plus utilisé à l'envoi.
- **Nettoyage des données** : les 21 entrées polluées ont été nettoyées en base (extraction de la vraie question, recalcul du `kind` difficulté/question, suppression si vide) puis **ré-embeddées** via Voyage. `content_search` (tsvector) se régénère seul (colonne GENERATED).

## B2 + B3 — max_tokens par mode & accès Opus

- **Backend** : `max_tokens` n'est plus figé à 1024 → **fast 600 / normal 1500 / deep 4000**.
- **Front** : 3ᵉ mode **« Profond »** (Opus) dans le composeur de Sati, à côté de Normal/Rapide. **« ✏️ Crée une leçon »** passe automatiquement en deep → les mini-leçons ne sont plus tronquées.

## B8 — Retry léger

`streamSati` retente UNE fois (600 ms) le fetch **initial** (jamais un stream entamé) → une micro-coupure Tailscale ne finit plus en « Pi injoignable » sec.

## Seuil de rappel recalibré (découvert grâce au nettoyage)

Sur le journal **nettoyé**, les questions liées (gammes / c4 / « le 48 ») tombent à des distances cosinus de **0,63–0,66** (voyage-3.5-lite) → l'ancien seuil `RECALL_MAX_DIST = 0.55` ne rappelait plus **rien**. Passé à **0,68** (le prompt demande déjà à Sati d'ignorer le hors-sujet). Vérifié en live : « Sur quoi je butais la dernière fois avec les gammes ? » → Sati cite la difficulté exacte (c5 trop haut, gamme finissant en c4).

## Vérifié (10 juin)

- POST avec `context` + `mode:fast` → SSE OK, et l'entrée journal créée = **la question seule**, embedding présent, kind correct.
- Test identique via Caddy/HTTPS (chemin réel du front) → OK.
- Journal : 0 entrée commençant par `<contexte_app>` après nettoyage ; ré-embedding complet (voir note Voyage ci-dessous).
- Build front propre, sentinelles dans le bundle (`context:` dans le body, bouton « Profond »).

## ⚠️ Piège découvert : rate-limit Voyage

Le tier Voyage utilisé tolère ~**3 requêtes/minute** : un ré-embedding en rafale échoue en silence (`embed()` renvoie `null` sur tout, y compris 429). Le script de reprise (`/tmp/reembed2.cjs` sur le Pi, exécuté dans le container) espace les appels de 21 s et log le statut HTTP. À garder en tête si on ré-embedde en masse un jour.

## Idées notées pour la suite (audit)

Profil vivant (table `profil` mise à jour par Haiku), sessions réelles (table `sessions`, aujourd'hui vide), tagging des difficultés par Haiku au lieu de la regex → **Chantier 42 proposé**.
