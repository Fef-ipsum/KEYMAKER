# Brief — Chantier Electro : Intégration des genres électroniques dans M1–M6 + Module 7

> Rédigé le 6 juin 2026 · Session de design avec Felix · À remettre à Opus pour exécution.

---

## Contexte

Le curriculum Keymaker est complet (6 modules, 151 flashs). Les exemples de code actuels sont corrects
mais génériques — ils enseignent les briques sans ancrage culturel fort.

Felix veut que **la musique électronique soit le fil rouge de l'ensemble du curriculum**, pas un module
isolé en bout de parcours. Chaque module doit s'appuyer sur un genre électronique comme terrain
d'apprentissage naturel.

En parallèle, un **Module 7 « Genres & Styles »** vient clore le cursus avec des projets complets par genre.

---

## Décision de design

### Principe directeur

> L'électro n'est pas une destination, c'est le contexte par défaut.

Chaque concept doit s'enseigner *à travers* un son électronique reconnaissable. L'élève n'apprend
pas "le filtre LPF" — il apprend "pourquoi le son de la bassline de psy-trance monte et descend".

### Ce qu'on ne change PAS

- La structure des modules (5 chapitres / 25 flashs) reste intacte.
- L'ordre pédagogique des concepts reste intact.
- On ne réécrit pas tout — on **recolore** les exemples et exercices libres.

### Ce qu'on change

Pour chaque module, **3 points d'ancrage** sont mis à jour :

1. **L'intro du module** (flash X.1) : ajouter une phrase qui ancre le module dans son genre électro
   ("dans ce module, on va construire la base d'un beat techno").
2. **Les exemples de code** : remplacer les exemples génériques par des exemples qui sonnent
   comme le genre cible du module (sons, BPM, patterns caractéristiques).
3. **L'exercice libre final du module** : orienter vers le genre ("transforme ce pattern pour qu'il
   sonne plus trance / house / etc.").

---

## Cartographie Genre ↔ Module

| Module | Titre actuel | Genre électro ancré | Concept clé illustré par le genre |
|--------|-------------|--------------------|------------------------------------|
| M1 | Live coding & patterns | **Techno** | Kick 4/4 sec, boîte à rythmes 909, minimalisme |
| M2 | Solfège & théorie | **Trance** | Mélodie mineure/majeure, accord riche, gamme au service de l'émotion |
| M3 | Connexion Guitare | **Industrial / EBM** | Guitare distordue sur beat électro, power chords sur kick |
| M4 | Son & Effets | **Acid / Psy-trance** | Filtre LPF avec résonance haute, LFO = balayage acide, ADSR sur sawtooth |
| M5 | Informatique Musicale | **Ambient / D&B** | Génératif lent (ambient) ou hasard sur breakbeat (D&B) |
| M6 | Composition & Projets | **House** | Arrangement DJ (intro/buildup/drop/outro), live set, export |

---

## Instructions par module

### M1 — Techno

**Pourquoi Techno :** c'est le genre le plus minimaliste. Parfait pour M1 car chaque brique
(kick, hi-hat, snare) s'entend clairement. Pas de mélodie qui distrait. L'élève entend
immédiatement le résultat de chaque ligne de code.

**Changements à opérer :**
- Intro M1 : "À la fin de ce module, tu sauras coder un beat techno fonctionnel — kick, hi-hats,
  bassline basique."
- Exemples de rythme : utiliser `bank("RolandTR909")`, BPM 130–138, patterns 4/4 typiques.
- Exercice libre final : "Construis un beat techno minimal avec 3 couches. Puis mute-en une —
  c'est comme ça qu'un DJ fait un breakdown."
- Sons de référence : `bd`, `hh`, `sd` avec bank 909.

### M2 — Trance

**Pourquoi Trance :** la trance vit par sa mélodie. C'est le genre parfait pour enseigner gammes
et accords parce que l'élève ressent immédiatement si "ça sonne trance" ou pas — le mineur
naturel, les quartes et quintes, l'accord en position ouverte.

**Changements à opérer :**
- Intro M2 : "La trance, c'est de la théorie musicale rendue émotionnelle. On va comprendre
  pourquoi certaines notes donnent des frissons."
- Exemples de gammes : C minor naturel, A minor — les gammes maison du genre.
- Exemples d'accords : accord de 4 sons (7ème incluse), voicing ouvert.
- BPM : 138–142 dans les exemples.
- Exercice libre final : "Écris une mélodie en mineur sur 8 temps. Essaie de la faire 'monter'
  vers la résolution — c'est le moteur émotionnel de la trance."

### M3 — Industrial / EBM

**Pourquoi Industrial :** M3 est le module guitare. L'industrial et l'EBM (Electronic Body Music)
marient la guitare distordue avec un beat électronique rigide — c'est la passerelle naturelle.
Ça évite l'écueil "la guitare ça n'a rien à voir avec Strudel".

**Changements à opérer :**
- Intro M3 : "La guitare n'est pas l'ennemie de l'électro — dans l'industrial, elles fusionnent."
- Exemples : power chords sur kick 909, guitare distordue (`distort`) en riff répété.
- BPM : 120–130, rigide (pas de swing).
- Exercice libre final : "Pose tes power chords sur un beat 4/4. Coupe la guitare sur le 3 —
  c'est le riff industrial classique."

### M4 — Acid / Psy-trance

**Pourquoi Acid/Psy :** M4 enseigne la synthèse (source, filtre, enveloppe, espace). Le son acide
*est* la démonstration parfaite du filtre LPF + résonance haute. Le psy-trance *est* la démonstration
du LFO. L'élève n'apprend pas le filtre en théorie — il entend le filtre s'ouvrir sur une bassline.

**Changements à opérer :**
- Intro M4 : "La synthèse sonore est née de la musique électronique. Le son acide du psy-trance,
  c'est 3 paramètres : une onde, un filtre, et quelque chose qui fait bouger ce filtre."
- Chapitre Filtre : utiliser une bassline sawtooth + `lpf` + `lpq` élevée comme exemple central.
  Montrer ce que fait la résonance (de 0 à 20+). Montrer le balayage LFO avec `perlin.range(200, 3000)`.
- Chapitre ADSR : sawtooth + ADSR court = punch; long = pad trance.
- Chapitre Espace : réverb longue sur pad trance, délai syncopé sur bassline house.
- Exercice libre final : "Fais un son acide : sawtooth + lpf + résonance haute + LFO rapide.
  Puis ralentis le LFO pour passer en pad trance."

### M5 — Ambient & Drum & Bass

**Pourquoi deux genres :** M5 a deux saveurs — le hasard lent (génératif) et la manipulation
du temps (tempo, iter, palindrome). L'ambient illustre le premier, le D&B illustre le second.
Deux références, mais utilisées chacune pour son chapitre, pas mélangées.

**Changements à opérer :**
- Chapitres Hasard et Accumulation : exemples ambient — notes longues, réverb, hasard lent,
  `sometimes`, `degrade` pour le côté aléatoire.
- Chapitres Temps (fast/slow/iter) : exemples D&B — BPM apparent élevé (170+) mais groove
  à mi-tempo, breakbeat, `iter` pour la variation de pattern.
- Intro M5 : "Le code peut générer de la musique qui se compose elle-même (ambient) ou
  jouer avec notre perception du temps (D&B)."
- Exercice libre final : deux options proposées — "ambiance générative lente" ou "breakbeat D&B".

### M6 — House

**Pourquoi House :** M6 est le module composition/arrangement. La house a la structure
d'arrangement la plus pédagogique qui soit — intro / buildup / drop / outro — connue de tous
et directement reproductible avec `arrange`. C'est aussi le genre le plus orienté "performance
DJ", ce qui se prête au live set et à l'export traités dans ce module.

**Changements à opérer :**
- Intro M6 : "Un morceau de house, c'est une histoire en 4 actes. On va coder ces 4 actes."
- Chapitre Arranger : exemple central = structure house avec `arrange` (intro 8 bars, drop 16 bars, etc.)
- Chapitre Live set : mute/unmute à la façon DJ (couches entrantes progressivement).
- Projet final du module : un track house complet avec intro / break / drop / outro.

---

## Module 7 — « Genres & Styles » (nouveau)

### Rôle dans le curriculum

M7 n'est plus une introduction aux genres (les élèves les connaissent tous via M1–M6).
C'est un module de **maîtrise et finition** : construire un vrai morceau complet dans chaque genre,
avec les choix artistiques que ça implique (BPM, gamme, arrangement, dynamique).

### Structure proposée

5 chapitres, 25 flashs (7.1 → 7.25) :

**Chap 7.1 — House** (5 flashs)
- 7.1 : Anatomie d'un track house (kick / offbeat / bassline / vocal chop / arrangement)
- 7.2 : Le groove house — swing, nudge, humanisation
- 7.3 : Le vocal chop et le sample
- 7.4 : Arrangement 8/16 bars avec `arrange`
- 7.5 : Projet : track house complet 2 min

**Chap 7.2 — Techno** (5 flashs)
- 7.6 : Anatomie d'un track techno (moins = plus)
- 7.7 : Tension & relâchement — la dynamique industrielle
- 7.8 : Le breakdown et la montée
- 7.9 : Sidechaining et pump
- 7.10 : Projet : set techno 3 minutes, jouable en live

**Chap 7.3 — Drum & Bass** (5 flashs)
- 7.11 : Anatomie du D&B (breakbeat, BPM, basse roulante)
- 7.12 : Le breakbeat — `iter`, shuffle, syncopation
- 7.13 : La basse roulante (reese bass)
- 7.14 : Half-time feel vs full-time
- 7.15 : Projet : intro D&B avec break et drop

**Chap 7.4 — Trance / Psy-trance** (5 flashs)
- 7.16 : Anatomie trance vs psy-trance (similitudes, différences)
- 7.17 : Le supersaw — accords riches et layering
- 7.18 : L'arc émotionnel — buildup / breakdown / climax
- 7.19 : Psy-trance : LFO rapide, résonance haute, BPM >145
- 7.20 : Projet : un build trance de 64 bars

**Chap 7.5 — Ambient** (5 flashs)
- 7.21 : Anatomie de l'ambient (texture, espace, lenteur)
- 7.22 : Le drone et le pad génératif
- 7.23 : Hasard maîtrisé pour un résultat toujours différent
- 7.24 : Réverb, delay, granularité — l'espace comme instrument
- 7.25 : Projet final : une pièce ambient générative de 5 min — le dernier flash de Keymaker

---

## Contraintes techniques pour Opus

- **Vérifier tous les codes Strudel dans `KEYMAKER_strudel_reference.md` avant d'écrire** — cutoff
  Claude = mai 2025, la référence est à jour au 5 juin 2026.
- Les codes des flashs doivent tourner sur strudel.cc tel quel, sans bibliothèques externes.
- BPM : utiliser `setcpm(BPM/4)` — c'est la convention Strudel.
- Sons : bank 909 pour kick/snare/hh, `sawtooth`/`triangle`/`sine`/`square` pour synthèse.
- Garder la structure de données identique aux modules existants (même format JSON de flash).
- Tests d'intégrité identiques aux chantiers précédents (ids, champs requis, récaps, exercices libres).
- Nommer le fichier de données `module7.js`, l'importer dans `modules.js`.
- Build propre obligatoire + sentinelles dans le bundle livré.

---

## Ce que ce chantier livre

1. **M1 à M6 retouchés** : intro + exemples + exercice libre recolorés par genre (voir cartographie
   ci-dessus). Pas de réécriture complète — changements ciblés sur les points d'ancrage.
2. **Module 7 complet** : 5 chapitres, 25 flashs, intégré au curriculum (total : 176 flashs).
3. **Roadmap mise à jour** : entrée Chantier Electro marquée ✅.
4. **Tests** : intégrité données M1–M7 + navigation + sentinelles.

---

*Brief rédigé en session de design (sans code) — Felix + Claude Sonnet, 6 juin 2026.*
