# Keymaker — Audit d'ergonomie (Chantier 57)
**Date :** 14 juin 2026 · **Cadre :** rendre l'app *handy, claire, réglable, goal-driven et belle*, sans casser ton ADN calme (TDA-friendly).

> Lecture rapide : la section **« Fait aujourd'hui »** = ce qui est déjà codé. Les sections **P0/P1/P2** = la suite, triée par impact. Chaque point dit **le quoi**, **le pourquoi**, **la micro-action**.

---

## ✅ Fait aujourd'hui (cette session)

**1. La barre sous l'éditeur est désencombrée.**
Avant : 7 boutons de même poids sur 2 rangées (Run, Stop, Visualiseur, Sync PO-33 + Sauvegarder, Ouvrir, Télécharger).
Après : **Run** (action primaire) + **Stop** + statut, puis **un seul bouton « ⋯ Outils »** qui regroupe le reste.
→ *Pourquoi :* un écran d'apprentissage ne doit avoir **qu'une action évidente**. Le superflu visible = charge mentale + hésitation = frein. On cache l'occasionnel, on montre le fréquent.

**2. La Sync PO-33 n'apparaît plus qu'au Module 8.**
→ *Pourquoi :* elle ne sert qu'au hardware (Module 8). Ailleurs, c'est un bouton mystère. **Le contexte décide de ce qui s'affiche.**

**3. « Suivant » te ramène en haut de la leçon.**
→ *Pourquoi :* arriver au milieu de la leçon suivante casse le fil. Saut animé (instantané si « réduire les animations »).

**4. Refresh haut de gamme (sans changer l'identité) :** popover soigné (ombre + ouverture douce), focus clavier net, hiérarchie Run > Stop > Outils, plus d'air dans la barre.

*Déjà présent dans ta copie de travail (Chantier 57 entamé) et conservé :* **Mode Focus du Studio** (éditeur seul) + **fix du scroll du glossaire**. Bonne direction — voir P1.

---

## 🎯 Les 5 principes directeurs (la grille de lecture)

1. **Une action primaire par écran.** Le reste recule.
2. **Montre le fréquent, cache l'occasionnel.** Un menu vaut mieux que 5 boutons tièdes.
3. **Le contexte filtre.** N'affiche que ce qui sert *ici, maintenant* (ex. Sync PO-33).
4. **Réversible & réglable.** Tout choix se défait ; l'important se règle dans les Réglages.
5. **Calme visuel = concentration.** Moins de bruit à l'écran = moins de fatigue d'attention (TDA).

---

## 🔴 P0 — Frein direct à l'apprentissage *(traité)*

| Constat | Pourquoi ça bloque | Action |
|---|---|---|
| Trop de boutons sous l'éditeur | Charge mentale, l'œil ne sait pas quoi faire | **Menu « ⋯ Outils »** ✔ |
| Scroll bloqué en bas sur « Suivant » | Casse le fil de lecture | **Scroll-to-top** ✔ |
| Sync PO-33 visible partout | Bouton sans sens hors Module 8 | **Affichage contextuel** ✔ |

---

## 🟠 P1 — Frictions notables *(à faire bientôt, petites étapes)*

### 1. Finir l'unification du Studio
Le Studio reste chargé (Sauvegarder, Ouvrir, Télécharger, Vider, Oscillo + tempo + viz). Le **Mode Focus** que tu as commencé aide déjà beaucoup.
- **Micro-étape A :** appliquer le **même menu « ⋯ Outils »** au Studio (Sauvegarder / Ouvrir / Télécharger / Vider dedans ; garder Visualiseur + Oscillo comme bascules d'aide visuelle).
- **Micro-étape B :** garder le tempo (−/+) en avant : c'est une commande de jeu, pas un réglage caché.
- *Pourquoi :* même grammaire de boutons partout = tu n'as **qu'un seul modèle mental** à apprendre.

### 2. Cohérence visuelle leçon ↔ Studio
Aujourd'hui la leçon (épurée) et le Studio (dense) ne « parlent pas la même langue ».
- **Micro-étape :** une fois le Studio passé au menu Outils, les deux écrans partagent la même barre. Rien d'autre à faire.

### 3. Répondre à ton « réglable / paramétrable »
Tu as un bon écran Réglages (thème, police, taille, animations, viz…).
- **Micro-étape :** ajouter une mini-section **« Outils sous l'éditeur »** : cocher ce que tu veux voir *directement* (ex. sortir le Visualiseur du menu si tu l'utilises tout le temps).
- *Pourquoi :* ça transforme un choix imposé par moi en **ton** choix — et le Visualiseur est pédagogiquement utile, certains voudront le garder dehors.

---

## 🟡 P2 — Polish & goal-driven *(quand tu veux)*

### 1. Rendre l'objectif de chaque flash explicite
La leçon a kicker + titre + concept. Il manque la **promesse** : « à la fin, tu sauras X ».
- **Micro-étape :** une ligne discrète sous le titre : *« Objectif : … »* (1 phrase, déjà presque dans `concept`).
- *Pourquoi :* « goal-driven » = l'apprenant voit **où il va** avant de coder. Très aidant en TDA.

### 2. Vérifier les contrastes du thème Light sur les nouveaux éléments
Le menu et les états « actif » utilisent l'accent. À contrôler en Light (tu as déjà corrigé le rouge danger en C41).
- **Micro-étape :** un coup d'œil AA sur `.tools-item.checked` et la pastille active en Light.

### 3. Cohérence des micro-animations
Tu as `--ease` / `--ease-out`. Le nouveau popover les réutilise. À garder comme **standard** pour tout futur composant.

---

## 💚 Ce qui est déjà très bien (ne pas casser)

- **Fondations pédagogiques solides :** Flow, défi du jour, quiz de chapitre, révision espacée (Leitner), glossaire curé. Le « goal-driven » est déjà là dans la structure.
- **Identité visuelle propre :** 3 thèmes, teintes par module, typographie vendorisée, animations douces. C'est déjà *beau* — on raffine, on ne refait pas.
- **Accessibilité en progrès :** reduce-motion, tailles larges, responsive/consultation mobile, focus clavier (renforcé aujourd'hui).
- **Tout en local + offline (PWA).** Robuste.

---

## 🗺️ Suite proposée (chantiers courts)

- **C58 — Studio au menu Outils** (P1.1 + P1.2) · ~1 session
- **C59 — Réglage « Outils visibles »** (P1.3) · court
- **C60 — Objectif par flash + revue contraste Light** (P2.1 + P2.2) · court

> Règle d'or pour la suite : **une amélioration = une petite étape réversible.** On avance par petits pas nets, jamais par gros bloc.
