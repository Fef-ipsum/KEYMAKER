# Keymaker — Audit avant Keymaker 2

*11 novembre 2026. Audit de l'app `keymaker-app/` (dernier chantier : 61), du backend `modules/keymaker` sur le Pi, des documents `KEYMAKER_*.md` et du contrat de frontière.*

Ce document dit ce qui marche, ce qui manque, ce qui coince, et ce que j'en fais. Chaque constat a été vérifié dans le code ou dans le moteur Strudel lui-même pendant cette session ; quand ce n'est pas le cas, c'est écrit.

---

## 1. L'essentiel

L'app actuelle a un **bon contenu** et de **bonnes fondations techniques**, mais trois défauts de structure que les chantiers successifs n'ont pas pu corriger, parce qu'ils sont dans l'architecture :

1. **La boucle d'apprentissage dépend de l'IA.** La validation d'un exercice et la génération des quiz passent par le Pi. Hors ligne ou Pi éteint : plus de validation, plus de quiz, plus de maîtrise, donc plus de révision espacée. C'est l'inverse de la contrainte « aucune fonction d'apprentissage ne doit dépendre de Sati ».
2. **Il n'y a pas un parcours, il y en a huit.** 8 modules, 181 leçons, 150 termes de glossaire, un Studio, un mode Flow, un défi du jour, un compteur de jours d'affilée, trois thèmes, une vingtaine de réglages. Tout est accessible, rien n'est désigné. L'écran d'accueil ne répond pas à « qu'est-ce que je fais maintenant ? ».
3. **Le solfège arrive trop tard et trop abstrait.** Le module 2 (solfège) est un bloc de 25 leçons séparé du module 1 (Strudel). On y lit « T-T-S-T-T-T-S » avant d'avoir une raison de s'en servir.

Le reste de ce document détaille, puis liste mes décisions.

---

## 2. Ce qui marche (et que je garde)

| Élément | Constat | Décision |
|---|---|---|
| Moteur Strudel vendorisé (`@strudel/repl` 1.3.0) | C'est **la dernière version publiée** (vérifié sur npm aujourd'hui). Chargé localement, aucune dépendance à un CDN pour le code. | **Garder** tel quel. |
| Un seul éditeur, jamais recréé | Le son ne coupe pas quand on navigue. Bon principe. | **Garder** le principe, réécrire l'enveloppe. |
| Révision espacée (boîtes de Leitner 1/3/7 jours, 5 cartes maximum par jour) | Simple, honnête, plafonnée. Les fonctions sont pures et testables. | **Garder** l'algorithme et le format de stockage. |
| Mode Flow par durée (10/20/40 min) | Le plan est construit localement, sans IA. Bonne idée : « j'ai 10 minutes » est une vraie question. | **Garder**, simplifier, le rendre 100 % local. |
| Studio libre | Bac à sable hors leçons, code conservé d'une session à l'autre, bibliothèque de snippets. | **Garder**, alléger l'interface. |
| Glossaire refait à la main (chantier 56) | 150 définitions autonomes, bilingues, annotables. Bonne matière. | **Reprendre** dans le wiki, clés d'annotation conservées. |
| Contenu des modules 4, 5, 6 (son, code, composition) | Audité en juin : format court, une idée par leçon, exactitude correcte. | **Garder** comme approfondissements, après le parcours. |
| Backend Sati (chat en streaming, mémoire, quiz, vérification, défis) | Sain : conteneur en bonne santé depuis 3 semaines, frontière respectée, dépôt du Pi propre. | **Garder sans modification.** |
| Code défensif | Tout stockage est en « au mieux » : si le navigateur refuse, l'app continue. | **Garder** la philosophie. |

---

## 3. Ce qui coince

### 3.1 Pédagogie

- **Deux minutes avant le premier plaisir : non tenu.** La première leçon joue `sound("casio")` : un bip. Le premier vrai rythme arrive à la leçon 6, le premier morceau à la leçon 26. Un débutant doit entendre quelque chose qui lui plaît *tout de suite*, puis le démonter.
- **La validation des exercices est déléguée à Sati** (`ExerciseCard.jsx` → `/keymaker/ai/verify`). Sans Pi, le bouton ne sert à rien et la leçon ne passe jamais à « pratiquée ».
- **Les quiz sont générés par l'IA à la demande** (`Quiz.jsx` → `/keymaker/ai/quiz`). Sans Pi : pas de quiz. Et un quiz généré peut contenir une erreur que personne n'a relue.
- **Solfège et Strudel sont deux silos.** Le pont do-ré-mi ↔ C-D-E existe (une leçon), mais la notion d'intervalle, de gamme et d'accord est enseignée par définitions puis illustrée, alors que la demande est l'inverse : son, puis nom, puis théorie.
- **Aucune profondeur à la demande.** Une leçon dit une chose sur `lpf`. Pour en savoir plus (alias, pièges, arguments), il faut quitter l'app. Le glossaire donne une définition, pas un mode d'emploi.
- **Les genres sont des « morceaux complets par genre »** (module 7). On y copie un track techno ; on n'y apprend pas ce qui *fait* la techno, ni ce qui la distingue de la trance. Aucun contenu sur l'acid ni sur la synth-pop.
- **Des identifiants de leçon se chevauchent entre modules** (`2.3` existe au module 1 et au module 2, `4.1` au module 1 et au module 4…). Or la maîtrise et les cartes de révision sont rangées par cet identifiant : maîtriser « 2.3 » du module 1 marque aussi « 2.3 » du module 2. Défaut réel du modèle de données, corrigé dans la migration (section 6).

### 3.2 Charge mentale (le point sensible avec un TDA)

- **Compteur de jours d'affilée** (« streak ») sur l'accueil : il se remet à zéro après un jour sans ouverture. C'est précisément le mécanisme culpabilisant à éviter.
- **Accueil chargé** : progression par module (8 barres), streak, défi du jour, révision, Flow, snippets, installation. Aucune action n'est désignée comme *la* suivante.
- **Barre du haut** : Accueil, Parcours, Focus, Studio, Glossaire, Sati, Réglages. Sept destinations de même poids.
- **Réglages** : 3 thèmes, accent personnalisable, halo, grain, « spotlight », fond, police, taille, etc. Du réglage pour le réglage ; chaque option est une décision de plus à prendre.
- **Le thème ne suit pas l'appareil** : sombre par défaut, clair en option manuelle.
- **Téléphone** : l'interface a été adaptée après coup (chantier 40) ; la feuille de style fait 3 900 lignes pour 10 requêtes d'écran. Fragile.

### 3.3 Hors ligne

- **Les sons ne sont pas embarqués.** Le moteur télécharge ses banques depuis GitHub. L'app actuelle met en cache « ce qui a déjà été joué une fois ». Conséquence : une leçon jamais ouverte en ligne est **muette** hors ligne. Le test d'acceptation « réseau coupé, tout fonctionne » n'est pas tenu.
- Une des sept adresses de banques préchargées (`tidal-drum-machines-alias.json`) **n'existe pas** (erreur 404 vérifiée aujourd'hui). Sans conséquence audible, mais c'est une erreur silencieuse à chaque démarrage.

### 3.4 Code

- `App.jsx` : 1 400 lignes, toute la navigation et tout l'état dans un seul composant. `styles.css` : 124 Ko. Un fichier `App.jsx.sync` (copie de travail d'un ancien environnement) traîne dans `src/`.
- Quatre dossiers de build (`dist`, `dist-pi`, `dist-pi-c60`, `dist-pi-c61`).
- Le backend décrit encore Felix comme « guitariste » dans ses consignes ; le module 3 entier (25 leçons) est consacré à la guitare. La mission d'aujourd'hui n'en parle pas.

---

## 4. Ce qui manque

1. Un **parcours unique** qui dit où j'en suis, quoi faire ensuite et pourquoi.
2. Une **validation locale** des exercices (le moteur Strudel sait dire quels sons un code produit : on peut vérifier sans IA).
3. Des **quiz écrits et relus**, embarqués, dont des quiz d'écoute pour le solfège.
4. Un **wiki** : pour chaque fonction, chaque caractère de mini-notation, chaque argument — l'essentiel d'abord, puis usages, pièges, évolutions.
5. Les **genres comme familles de traits**, avec Techno/Acid, Trance/Progressive, et la synth-pop.
6. Les **sons embarqués** pour un vrai hors-ligne.
7. Un **thème clair et sombre automatique** et une identité visuelle.
8. Une place prévue pour **« Refaire un morceau »**.

---

## 5. Décisions

### Je réécris

- **Toute l'interface** (React conservé, composants et styles repartis de zéro). Raison : la structure actuelle rend le parcours unique impossible sans tout démêler, et le nouveau design (clair/sombre, verre et métal, téléphone d'abord) ne se greffe pas sur 3 900 lignes de CSS.
- **Le début du cursus** : un nouveau parcours « Les fondations » remplace les modules 1 et 2. Strudel et solfège y sont tressés : le son d'abord, le nom ensuite, la théorie en dernier. Raison : c'est la priorité n° 1 de la mission et le défaut n° 3 de l'audit.
- **La validation des exercices** : locale, fondée sur ce que le code produit réellement (événements du moteur), avec un indice quand ce n'est pas encore ça. Sati reste disponible pour un retour plus fin, en bonus.
- **Les quiz** : écrits à la main, embarqués, relus. Plus aucune génération à la volée dans la boucle d'apprentissage.
- **Le service worker** : écrit à la main pour servir les sons depuis l'appareil.

### Je garde

- Le moteur Strudel 1.3.0 vendorisé, l'algorithme de révision espacée et son format, le mode Flow, le Studio et ses snippets, les annotations du glossaire, le chat Sati, tout le backend.
- Les modules 3 à 8 comme **approfondissements** optionnels, rangés après le parcours, affichés dans la nouvelle interface. Leurs 130 leçons gardent leur texte ; leurs exemples sont tous réexécutés (section Vérification du rapport).

### Je supprime

- Le **compteur de jours d'affilée** et l'historique des jours d'ouverture comme indicateur. Remplacé par une progression qui ne recule jamais.
- Le **défi du jour** daté (il crée un « raté » quand on ne vient pas). Les défis restent, sans date.
- Les thèmes Matrix/Void/Light, l'accent personnalisable, le halo, le grain, le « spotlight », le choix de police. Remplacés par : thème automatique (ou forcé clair/sombre), taille du texte, réduction des animations.
- La synchronisation audio PO-33 (`PoSync.jsx`) et l'oscilloscope comme fonctions d'interface. Les deux leçons qui parlent de la synchro restent lisibles ; l'outil lui-même sortait du cœur de l'app. *C'est une vraie suppression de fonction : dis-moi si elle te manque.*
- Les modules 1 et 2 en tant que tels (remplacés par le nouveau parcours ; ta progression y est reportée, voir section 6). Le module 7 « morceaux par genre » est remplacé par la nouvelle section Genres pour la techno et la trance ; ses chapitres House, Drum & Bass et Ambient restent en approfondissement.
- `App.jsx.sync`, les anciens dossiers de build, les fichiers de démonstration de design à la racine restent dans l'historique git mais sortent de l'app.

---

## 6. Tes données : ce qui existe et ce que j'en fais

Tout est stocké dans le navigateur de chaque appareil, à l'adresse de l'app. La nouvelle app est servie à la **même adresse** : elle voit donc les mêmes données. Règle que je m'impose : **je ne supprime ni ne réécris aucune ancienne clé**. La nouvelle app lit les anciennes données et écrit les siennes à côté.

| Donnée | Où (ancienne app) | Dans Keymaker 2 |
|---|---|---|
| Leçons vues | `localStorage` `keymaker:progress` (clés « module:chapitre:leçon ») | Converties une fois en identifiants stables. Les leçons des modules 1 et 2 sont reportées sur les étapes équivalentes du nouveau parcours. |
| Maîtrise et cartes de révision | `keymaker:srs` | Reportées de la même façon. Quand un identifiant est ambigu (défaut décrit en 3.1), je l'attribue aux leçons que tu as réellement ouvertes. |
| Annotations du glossaire | `keymaker:glossnotes` | **Lues et écrites au même endroit, avec les mêmes clés.** Chaque ancien terme existe dans le wiki avec sa clé d'origine. Une annotation dont le terme aurait disparu reste visible dans « Mes annotations ». |
| Snippets du Studio | IndexedDB `keymaker`, magasin `snippets` | Même base, même magasin, inchangés. |
| Code en cours du Studio | `keymaker:studio:code` | Même clé. |
| Notes par leçon | IndexedDB `keymaker`, magasin `notes` | Conservées et affichées sur les leçons d'approfondissement correspondantes. |
| Fil de discussion Sati | IndexedDB `keymaker`, magasin `messages` | Conservé. |
| Banque de quiz générés | `keymaker:quizbank` | Laissée en place, plus utilisée (les quiz sont maintenant écrits). |
| Jours d'ouverture, défi du jour | `keymaker:progress.days`, `keymaker:daily` | Laissés en place, plus affichés. |

---

## 7. Faits vérifiés dans le moteur pendant l'audit

Ces vérifications ont été faites en interrogeant le moteur vendorisé dans un navigateur sans interface (`scripts/probe.mjs`, `scripts/engine-facts.mjs`) :

- `noteToMidi("c")` = 48 = `noteToMidi("c3")` ; `noteToMidi("c4")` = 60. **Une note sans numéro est bien à l'octave 3.**
- Le moteur expose 1 020 fonctions globales et 1 011 méthodes de pattern. Les alias de contrôles sont extraits automatiquement (par exemple `lpf`, `lp`, `ctf` → `cutoff` ; `lpq` → `resonance` ; `legato` → `clip` ; `fm` → `fmi` ; `dt` → `delaytime`). Le wiki s'appuie sur cette extraction, pas sur ma mémoire.
- Le kit de batterie par défaut (`bd`, `sd`, `hh`…) vient de la banque `uzu-drumkit` (41 fichiers) ; les machines (`RolandTR909`…) de `tidal-drum-machines` (2 348 fichiers, 71 machines).
