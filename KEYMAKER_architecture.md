# Keymaker — Document d'architecture & décisions validées

> Document de transfert pour continuer le développement avec Opus.
> Toutes les décisions ci-dessous ont été validées par Felix au cours du brainstorming initial.

> ⚠️ **Mise à jour (4 juin 2026) — certaines décisions ci-dessous sont périmées.**
> Le backend n'est **pas** PocketBase/Express : c'est un **module Docker Fastify + Postgres** intégré au Personal OS (voir `KEYMAKER_CONTRAT.md`). La mémoire distante = schéma Postgres `keymaker.*` (pas PocketBase). Modèle Opus déployé = `claude-opus-4-8`.
> Le reste du doc (concept, design, curriculum, modes d'apprentissage, profil de Felix) reste valable. Les tableaux « Stack technique » et « Architecture mémoire » ci-dessous gardent leur valeur historique mais sont datés.

---

## Concept

**Keymaker** est une PWA d'apprentissage de Strudel CC et du solfège, conçue pour Felix — guitariste, profil TDA, débutant en solfège, aucune connaissance formelle de la théorie musicale. L'app enseigne simultanément : le code Strudel, la théorie musicale, la théorie audio/effets, et l'informatique musicale. Elle est en français, avec les termes techniques en anglais (comme dans le vrai code Strudel).

**Références visuelles et d'inspiration :** DJ Dave (Sarah) et Switch Angel (Jade Rose, développeuse principale de Strudel). Style underground/Matrix, live coding, musique électronique.

**Nom :** Keymaker — personnage Matrix qui possède les clés de toutes les portes. Triple sens : tonalités musicales (musical keys), touches de clavier (keyboard keys), accès à la compréhension (ouvrir des portes).

---

## Stack technique

| Composant | Choix | Raison |
|---|---|---|
| Type d'app | PWA (`display: standalone`) | Cross-device, offline, pas de browser UI visible |
| Framework UI | **React** | Preview inline pendant le dev, gros écosystème, profil visuel de Felix |
| Éditeur code | CodeMirror 6 + extension Strudel | Syntax highlighting, validation temps réel |
| Moteur musical | Strudel CC embarqué | Open-source, web-native, WebAudio + WASM |
| Backend | PocketBase sur Raspberry Pi | Léger, SQLite, auth + API + realtime |
| Accès distant Pi | Tailscale (déjà installé) | VPN mesh, accès de partout |
| Proxy API IA | Node/Express sur Pi | Clé API jamais exposée dans le browser |
| Sync offline | IndexedDB (PouchDB ou idb) + Service Worker | Offline-first |
| Notifications | Push API (PWA) | Streak, défis, Sati |

**Important :** La clé API Claude est stockée UNIQUEMENT sur le Pi. L'app ne la voit jamais. Toute requête à Claude passe par le Pi.

---

## Design

### Thèmes (3)
| Nom | Fond | Accent | Usage |
|---|---|---|---|
| Matrix | `#0a0a0a` | `#00ff41` (vert) | Défaut, soir |
| Void | `#0d1120` | `#22d3ee` (cyan) | Journée, doux — **favori de Felix** |
| Light | `#fafafa` | `#5b5bd6` (indigo) | Plein soleil |

### Typographie
- **Texte/UI :** Nunito ou Plus Jakarta Sans (choix dans les paramètres, Felix hésite entre les deux)
- **Code :** JetBrains Mono avec ligatures activées
- **Taille de police :** réglable — prévoir des valeurs grandes (Felix est visuel, yeux sensibles)

### Éditeur de code — coloration avancée
- Syntax highlighting classique (fonctions, strings, nombres, opérateurs = couleurs différentes)
- **Validation en temps réel :** quand une unité syntaxique est complète et valide → couleur positive (vert/cyan). Quand il manque quelque chose → couleur neutre ou orange. Rouge uniquement pour erreur franche.
- Paramètre activable/désactivable dans les Paramètres > Apparence
- Objectif pédagogique : feedback positif immédiat, repérage des oublis (guillemets, parenthèses fermantes)

---

## Curriculum — 6 modules

| # | Module | Contenu clé |
|---|---|---|
| 1 | Strudel & Live Coding | sound(), note(), mini-notation, séquences, stack(), tempo/BPM |
| 2 | Solfège & Théorie musicale | Notes (do/C), gammes, intervalles, accords, rythme, tonalités |
| 3 | Connexion Guitare | Lien théorie ↔ manche, gammes, positions, modes |
| 4 | Théorie Audio & Effets | Oscillateurs, formes d'onde, filtres LP/HP/BP, ADSR, reverb, delay, phaser, chorus, LFO, modulation, compresseur, duck |
| 5 | Informatique Musicale | Programmation fonctionnelle, Haskell (bases), TidalCycles vs Strudel, Web Audio API, MIDI, plugins |
| 6 | Composition & Projets | Tracks complètes, layering, arrangement, export, live sets |

**Modules débloqués séquentiellement avec option de passer.**

**Module 1 :** contenu détaillé défini et validé → voir `KEYMAKER_module1.md`.

---

## Structure d'une leçon (template de base)

1. **Concept** — texte court + visuel/schéma si besoin
2. **Exemple sonore** — un pattern qui tourne, écoutable
3. **Explication du code** — ligne par ligne, en français
4. **Exercice guidé** — Strudel embarqué, objectif précis
5. **Exercice libre** — expérimentation

*La structure est adaptable selon la leçon (Sati peut proposer des variantes).*

---

## Modes d'apprentissage

| Mode | Durée | Description |
|---|---|---|
| ⚡ Flash | ~5 min | 1 concept + 1 exercice. Pour les petits moments. |
| 📖 Session | ~20 min | Leçon complète avec théorie + pratique. |
| 🧠 Deep Dive | ~60 min | Module entier + projets. |
| 🌊 Flow | Variable | Session orchestrée par Sati, adaptée au niveau du moment. Tu dis "je veux pratiquer X minutes", elle gère. |

---

## Structure de l'app (navigation)

```
Home         → Streak, XP, progression, "Continuer"
Learn        → Modules → Leçons
Studio       → REPL Strudel libre + Pattern Bank + Référence + Visualiseur audio
Discover     → Culture Algorave, artistes, import communauté, Défi du jour
Profile      → Carte de progression, badges, journal de session
```

**Mobile (téléphone) :** mode consultation uniquement — pas d'éditeur de code. Leçons flash, quiz, contenu audio, culture, journal. Code uniquement sur PC et tablette.

---

## Features validées

- **Studio / REPL** — Strudel embarqué, totalement libre, accessible en 1 clic
- **Pattern Bank** — sauvegarder n'importe quel pattern (leçon ou Studio), tags
- **Référence intégrée** — sidebar dans Studio, toutes les fonctions Strudel, cherchable
- **Glossaire bilingue FR/EN** — chaque terme pointe vers la leçon qui l'a introduit
- **Défi du jour** — prompt créatif optionnel, différent chaque jour
- **Visualiseur audio** — oscilloscope/forme d'onde dans Studio pendant la lecture
- **Partage de patterns** — URL Strudel native (base64 dans URL), bouton dans Studio
- **Carte de progression** — skill tree visuel, pas juste une barre de %
- **Notifications PWA** — streak en danger, défi du jour, message de Sati (opt-in)
- **Mode Flow** — session guidée par Sati
- **Import communauté** — patterns de strudel.cc, section Discover, ouvrir dans Studio
- **Journal de session** — notes rapides après session, peut signaler à Sati ce qui n'a pas été compris
- **Easter eggs** — plusieurs cachés dans l'app, trouvables mais pas évidents. **NE PAS SPOILER à Felix.**
- **Syntax highlighting + validation couleur temps réel** — CodeMirror 6, activable
- **Taille de police réglable** — valeurs larges disponibles
- **Modes visuels** — 3 thèmes (Matrix/Void/Light), toggle dans paramètres

---

## Gestion du bilinguisme

- **Interface et apprentissage :** français
- **Termes techniques :** conservés en anglais (ce sont les vrais noms dans Strudel : `sound`, `note`, `reverb`, `filter`...)
- **Première apparition** de chaque terme EN → explication en FR
- **Glossaire** : entrées bilingues, searchable par les deux langues
- **Paramètre optionnel** : "Afficher termes EN" — affiche le mot anglais en petit à côté des traductions partout dans l'app
- **Objectif** : Felix reconnaît les termes en ligne sans traduction mentale

---

## Sati — Guide IA

### Identité
Sati est le guide IA de Keymaker. Dans Matrix Revolutions, Sati est un programme créé sans utilité prédéfinie — uniquement par amour. Elle est à l'origine du lever de soleil à la fin du film. Référence parfaite : créer la beauté dans un monde de logique pure.

### Architecture mémoire (3 couches)

| Couche | Stockage | Contenu | Disponible |
|---|---|---|---|
| Session | RAM navigateur | Code actuel, erreurs récentes, état session | Temps réel |
| Locale | IndexedDB | 10 dernières sessions, difficultés connues, journal | Offline |
| Distante | PocketBase sur Pi | Historique complet, profil d'apprentissage, tout le journal | Quand online |

### Modèles utilisés
- `claude-haiku-4-5` → corrections d'erreurs rapides (quasi-instantané)
- `claude-sonnet-4-6` → usage quotidien, explications
- `claude-opus-4-8` → Mode Flow, explications profondes, analyse de progression

### Flux d'un appel
```
App (browser) → Pi (assemble contexte : profil + mémoire + journal + code actuel) → Claude API → Pi → App
```

### Capacités
- Lit et analyse le code Strudel en temps réel
- Explique les erreurs en français, avec contexte pédagogique
- Se souvient des difficultés passées et y fait référence naturellement
- Génère des quiz personnalisés sur ce qui vient d'être appris
- Orchestre le Mode Flow (séquence de micro-exercices adaptée)
- Observe les patterns d'apprentissage de Felix sur le long terme
- Répond aux notes du journal ("je n'ai pas compris X")
- Droits mémoire : peut tout mémoriser de ce qui se passe dans l'app

### Paramètres Sati (dans Settings)
- Verbosité : courte / normale / détaillée
- Proactivité : suggère spontanément / attend qu'on lui parle
- Effacer la mémoire (locale / distante / tout)

---

## Paramètres de l'app (Settings)

| Catégorie | Options |
|---|---|
| Apparence | Thème, police (Nunito/Plus Jakarta Sans), taille texte, animations, réduire mouvement, validation couleur code (on/off) |
| Audio | Buffer latence, sons d'interface, volume maître |
| Sati | Verbosité, proactivité, langue, effacer mémoire |
| Notifications | Streak, défi du jour, Sati, heure de rappel |
| Sync | URL Pi, statut, sync auto, dernière sync |
| Données | Export JSON, import, reset module, vider cache audio |
| Accessibilité | Contraste élevé, animation réduite, Mode Focus |

---

## Onboarding (< 90 secondes)

1. **Écran 1** (~10s) — Choisir son thème (Matrix/Void/Light)
2. **Écran 2** (~30s) — 3 questions : niveau musical · instrument · ce qui attire le plus
3. **Écran 3** (~20s) — Sati se présente (message court)
4. **Écran 4** — Leçon 1, Module 1 : `sound("bd")` → Run → premier son

**Principe :** pas de compte, pas d'email, pas de tutoriel long. Premier son avant 90 secondes.

---

## Infrastructure

- **Raspberry Pi** : toujours allumé, héberge PocketBase + proxy API + assets app (cachés en local après premier load)
- **Tailscale** : déjà installé dans Personal-OS, accès distant au Pi depuis n'importe où
- **API Claude** : compte Anthropic existant (felix.dunkel.home@gmail.com), nouvelle clé API à créer au moment du setup
- **Appareils** : PC (dev principal) + Galaxy Tab A9+ (Snapdragon 695, mid-range, suffisant pour l'usage) + téléphone (consultation)
- **PWA standalone** : `display: standalone` dans le manifeste → aucun élément visuel du navigateur

---

## Profil utilisateur — Felix

- Horloger chez Patek Philippe, frontalier France/Genève
- Guitariste : sait où se trouvent les notes sur le manche (approximativement), pas de solfège formel
- TDA + borderline : préférence pour contenu court, structuré, à faible friction, micro-étapes
- Visuel : police grande, feedback visuel fort, préfère voir plutôt que lire
- Langue : français
- Outils actuels : Notion, Personal-OS sur Raspberry Pi, Tailscale
- Quitte progressivement l'écosystème Google
- Objectif avec Keymaker : apprendre Strudel + solfège + électronique audio + informatique musicale, et que ça serve aussi à la guitare

---

## Ce qui n'est PAS encore décidé

- Nombre exact de leçons pour les Modules 2 à 6
- Contenu des Modules 2 à 6 (à définir au fur et à mesure, pas avant de coder)
- Système XP/badges détaillé (Felix préfère la surprise — implémenter librement)

## Décidé depuis le brainstorming initial

- **Framework UI : React** (validé le 2 juin 2026)
- **Module 1 : contenu détaillé validé** → `KEYMAKER_module1.md`
- **Méthode de dev : par tranches qui marchent** (un slice vertical à la fois), fichiers du projet = mémoire durable, une conversation = un chantier

---

*Document créé le 2 juin 2026 — brainstorming initial avec claude-sonnet-4-6.*
*Prochaine étape : nouvelle conversation avec claude-opus-4-6 pour définir le contenu du Module 1 et commencer le développement.*
