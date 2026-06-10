# Chantier 44 — Mode Flow

> **FAIT le 10 juin 2026** (3ᵉ chantier du jour après C40+C42).
> La vision d'origine (E5 de l'audit) : « j'ai 20 minutes » → une session orchestrée.
> Toutes ses briques venaient d'être posées : SRS (C38), quiz (C37), profil vivant (C42).

## Comment ça marche

Carte **« 🌊 Mode Flow »** sur l'Accueil : ~10 / ~20 / ~40 min. Le **plan est construit localement** (`flow.js`, pur et testé) — démarrage instantané, zéro JSON fragile :

| Temps | Plan |
|---|---|
| ~10 min | révision (≤3 cartes si dues) → 1 flash nouveau · défi seulement si rien à réviser |
| ~20 min | révision (≤5) → 2 flashs nouveaux → défi créatif |
| ~40 min | révision (≤5) → 3 flashs nouveaux → défi créatif |

Un **bandeau** (`FlowBar.jsx`) fixé en bas guide l'enchaînement — l'app reste 100 % utilisable, le flow guide la **navigation réelle** (étape « nouveau » = vrais flashs non vus, tous modules confondus). Chrono doux, jamais coercitif : au-delà du budget, il passe à l'accent, c'est tout (contrat TDA : cadre sans pression). La révision réutilise `Review.jsx` (prop `onDone` → « Continuer le flow ▶ »).

## Le défi créatif — là où Sati a de la valeur

`POST /keymaker/ai/challenge` (learn.ts) : **Opus** (`MODELS.deep`) + **profil vivant injecté côté Pi** (`profileBlock()`, C42) + flashs récents envoyés par le front → `{title, brief, code}` : consigne créative avec contrainte ludique + code de départ jouable (bouton « ▶ Code de départ » le pousse dans l'éditeur). **Repli local** : banque de 8 défis dans `flow.js` si le Pi ne répond pas (marqué « hors-ligne »).

## Vérifié (10 juin)

- 11 tests node `buildFlowPlan` (plans 10/20/40, bornes dues/non-vus, défi seul si tout est vu).
- Smoke Playwright complet : carte → bandeau → 2 flashs « nouveau terrain » → défi → récap « Flow terminé · 2 flashs · 1 défi » ; zéro erreur JS. Le smoke a même atteint le **vrai Pi** : Opus a généré un défi calé sur les flashs du chapitre 1.
- Route live : « Le groove à tiroirs » — réutilise exactement bd/hh/bank()/:n des flashs récents. Le profil vivant nourrit déjà la créativité de Sati.

## Décisions

- **Orchestration locale, contenu par IA** : le plan n'a pas besoin d'Opus (données déjà locales : file SRS, flashs non vus) ; Opus intervient là où il crée de la valeur (le défi personnalisé). Robuste, instantané, partiellement hors-ligne.
- Pas de minuteur bloquant, pas de notification : le flow se termine quand Felix le décide.
