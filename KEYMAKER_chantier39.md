# Chantier 39 — « ✓ Vérifie mon exercice »

> **FAIT le 10 juin 2026** (session triple 37+38+39).
> Répond à E4 de l'audit : ferme la boucle **consigne → production → feedback** qui restait ouverte depuis le Chantier 2.

## Ce que ça fait

Chaque flash a déjà un exercice (`exercise`). La carte Exercice (nouveau composant `ExerciseCard.jsx`, monté avec `key={flashKey}` → état remis à zéro à chaque flash) gagne un bouton **« ✓ Vérifie mon exercice »** :

1. envoie consigne + concept + code de DÉPART de la leçon + **code live** de l'éditeur au Pi ;
2. Sati (Haiku) répond en 1-2 phrases : `{ verdict: 'ok'|'retry', feedback }` ;
3. **ok** → encadré accent « ✓ Validé — … » et le flash passe à **« pratiqué »** (srs.js) ; **retry** → encadré « ↻ Pas encore — … » avec UN indice actionnable, jamais la solution.

## Backend — `POST /keymaker/ai/verify` (dans `src/routes/learn.ts`)

- JSON simple (pas de SSE), Haiku, `max_tokens: 300`, system dédié : « l'esprit compte plus que la lettre, ne sois PAS pointilleux » ; si le code est **identique au code de la leçon** alors que l'exercice demande une modification, le serveur le signale au modèle → « retry » bienveillant.
- Verdict normalisé serveur ET client (`normalizeVerdict` : tout sauf `'ok'` → `'retry'`, conservateur). Rate limit 15/min. Rien n'est journalisé.

## Vérifié (10 juin)

- Live : exercice du flash 1.4 + code modifié (`sound("bd cp hh rim")`) → `ok` avec feedback précis et chaleureux.
- Code identique à la leçon → `retry` doux (« tu n'as pas encore essayé »).
- Éditeur vide → 400 propre (« écris ton code d'abord »), affiché tel quel sous le bouton.

## Pourquoi c'est important (le lien avec 37/38)

`practiced` est l'étage intermédiaire de la maîtrise : **vu** (ouvert) → **pratiqué** (produit du code validé) → **maîtrisé** (répondu juste au quiz). Les trois chantiers forment UNE boucle : le flash enseigne, l'exercice fait produire, le quiz teste, la révision fait durer.
