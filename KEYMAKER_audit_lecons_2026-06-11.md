# Keymaker — Audit du contenu pédagogique (11 juin 2026)

> Périmètre : `lessons.js` (M1–M6), `module7.js`, `module8.js` — **181 flashs lus intégralement**, vérifiés contre `KEYMAKER_strudel_reference.md` et la spec `KEYMAKER_module1.md`.
> Notation des ids : comme les numéros se chevauchent entre modules (voir §3), je préfixe par le module : « M3 3.7 » = flash 3.7 du Module 3.

---

## L'essentiel en 30 secondes

**Verdict : c'est un très bon cours.** Format TDA exemplaire (1 idée/flash, décodage ligne par ligne, récaps en tables), fil électro réellement tenu de M1 à M8, exactitude technique quasi irréprochable (la convention d'octave est propre partout). Ce n'est pas de la complaisance : le soin est visible et ça tient la comparaison avec les bons cours du genre.

**Les 3 actions prioritaires :**
1. **Le glossaire bilingue n'existe pas** — il était promis dans la vision d'origine, les termes sont bien semés dans les leçons, mais rien ne les rassemble ni ne les rend cherchables. → C48.
2. **Les rythmes euclidiens `(3,8)` ne sont jamais enseignés** mais sont utilisés dans deux morceaux finals (M4 4.25, M6 6.25). C'est le seul vrai trou de syntaxe — et c'est une syntaxe phare de l'électro. → C49.
3. **Une demi-douzaine de micro-erreurs/incohérences à corriger** (dont « 48 = do central » en M3 3.7, qui contredit la référence). Une heure de travail, zéro risque. → C50.

---

## 1. Qualité — les leçons sont-elles bonnes pour un débutant TDA ?

**Oui, franchement.** Points forts constatés sur les 181 flashs :
- **Concepts courts** (1–3 phrases), une seule idée par flash, respectés à ~95 %.
- **Décodage ligne par ligne** systématique : le code n'est jamais un bloc opaque.
- **Récaps en tables** en fin de chapitre + exercice libre : parfait pour la mémoire TDA.
- **Ponts permanents** vers le vécu de Felix : guitare (M2 2.3 « 1 case = 1 demi-ton », M3 entier), références croisées explicites « (M1) », « (M2 ch.2) ».
- Belles trouvailles pédagogiques : le « pont magique » rythme→hauteur (M1 2.5), « pêcher dans le hasard » avec ribbon (M5 5.12), « moins = plus » (M7 7.6).

**Ce qui pèche (légèrement) :**
- Quelques concepts-pavés : **M8 8.4** (la sync PO-33) fait ~9 lignes denses — à découper en 2 flashs (câblage / limite mono).
- **M7 7.18 et 7.20** : des blocs de code de 10+ lignes. Assumé (module de maîtrise), mais un décodage par *section* plutôt que par ligne aiderait.
- Le jargon est presque toujours expliqué — exceptions listées en §2.

---

## 2. Syntaxe Strudel — introduite avant usage ? exacte ?

### 2a. Convention d'octave : ✅ propre
Vérifié contre la référence (§0–§1 : do central = c4, défaut = octave 3, guitare e2–e4) :
- M1 4.3 (la racine du bug historique) est **correct** : `c2 e3 g4 c5`, « sans numéro → octave 3 ».
- M1 4.1 (« 48 = do grave, 60 = do central ») et M2 2.7 (« 60 = do central ») : corrects.
- Cordes de guitare M3 3.2 (`e2 a2 d3 g3 b3 e4`) : pile la table de la référence.
- **Une seule trace résiduelle : M3 3.7** — le décode dit « .add("48") : 48 = do central (c3) ». Faux : le do central est c4 = MIDI 60 ; 48 = c3 (do grave). Contredit M1 4.1 et M2 2.7. À corriger en « 48 = do (c3) ».

### 2b. Constructions utilisées AVANT d'être introduites
Par gravité décroissante :

| Flash fautif | Construction | Problème |
|---|---|---|
| **M4 4.25** et **M6 6.25** | `c2(3,8)` — rythme euclidien | **Jamais enseigné nulle part.** Le décode dit juste « un motif (3,8) ». C'est dans la référence §3 et c'est central en électro. |
| **M5 5.13** | `"a \| b"` (choix aléatoire) | Le décode affirme « vu en M1 » — **faux**, le `\|` n'apparaît dans aucun flash M1. |
| **M1 2.6** | la virgule `,` | L'exemple `sound("bd sd, [~ <sd cp>]*2")` utilise la virgule **un flash avant** son introduction (2.7). Hérité de la spec d'origine. |
| **M3 3.17** (exercice) | `.fast(2)` | Introduit formellement seulement en M5 5.6. Aucune glose en M3. |
| **M2 2.9, 2.25** | `.lpf()`, `.gain()` | Le filtre est enseigné en M4 ; ici glosé d'un mot (« filtrée »). Acceptable mais à signaler d'une phrase (« on l'expliquera au M4 »). |
| **M1 3.3** | `<a b c d>*8` | La combinaison `<…>*n` (n éléments du cycle tirés de l'alternance) n'est jamais expliquée en tant que telle. |
| **M1 1.4** | l'espace-séquence | `sound("bd hh sd oh")` séquence 4 sons au ch.1, l'espace n'est expliqué qu'en 2.1. Véniel (la spec faisait pareil). |
| **M4 4.4** | `.decay/.sustain` | Enveloppe utilisée au ch.1 de M4, enseignée au ch.3. Glosé, OK, mais un « (détail au ch.3) » serait propre. |

À noter en positif : les renvois avant-coureurs sont parfois **bien faits** (M5 5.6 : « on verra superimpose au ch.4 » — c'est le bon réflexe, à généraliser).

### 2c. Exactitude vs la référence : très bonne
- Les pièges documentés sont respectés : `superimpose`+`.add` sur les degrés AVANT `.scale()` (M5 5.16 ✅), forme doc de `off` (M5 5.17 ✅), ordre fixe de la chaîne d'effets (M4 4.24 ✅), orbits (M4 4.19 ✅), lazy loading signalé (M1 1.3, M6 6.16 ✅), `ply ≠ fast` (M5 5.9 ✅).
- Micro-incohérences : **M7 7.12** — le décode dit `samples("github:…")` alors que le code utilise `samples({ amen: url })` ; **M1 5.4** — le décode appelle la basse `<c2 ab1 f1 g1>` une « alternance d'accords » alors que ce sont des notes seules (fondamentales).

---

## 3. Ordre & progression

**La grande architecture est saine** : gestes (M1) → théorie (M2) → instrument connu (M3) → son (M4) → abstraction (M5) → composition (M6) → genres (M7) → hardware (M8). La marche conceptuelle la plus raide (M5 ch.1, « un pattern est une fonction ») est bien amortie par l'écriture.

**Points de friction :**
- **Redondance M1 ch.4 ↔ M2 ch.1** : lettres, octaves, dièses, chromatique sont enseignés deux fois quasi à l'identique (M1 4.2–4.4 vs M2 2.2–2.5). L'apprentissage en spirale est défendable, mais M2 ch.1 gagnerait à être raccourci en « rappel + approfondissement » plutôt que re-leçon.
- **Le mode dorien est suggéré 3 fois en exercice** (M5 5.25, M6 6.25, M7 7.25 : « essaie C:dorian ») **sans jamais avoir été enseigné**. Les modes sont absents du cursus (l'éolien est cité une fois en M2 2.13). Soit on les enseigne (1 flash), soit on retire la suggestion.
- **Ids de flashs ambigus** : M1 numérote par chapitre (1.x → 5.x), M2–M8 par module (2.x, 3.x…). Résultat : « 4.3 » désigne deux flashs différents (M1 ch.4 et M4). Le stockage interne (`m:c:f`, progress.js) est sain, mais pour Sati, les quiz et toute discussion humaine, c'est une source de confusion réelle.
- La montée en difficulté est par ailleurs régulière ; M7/M8 en « maîtrise » assument de gros codes, c'est cohérent.

---

## 4. Manques

**Strudel :**
- **Rythmes euclidiens `(p,s,r)`** — le manque n°1 (utilisé sans être enseigné, voir §2b).
- **`arp()` / `arpWith`** — jamais enseigné, alors que l'arpégiateur est LE geste trance/techno mélodique (la référence §13 le liste).
- **Polymètre `{a b, c}` / `polymeter`** — dans la référence, absent du cours. Optionnel mais très « électro IDM ».
- `compressor`, `vowel`, `penv` (enveloppe de hauteur — utile pour les kicks 909 synthétiques) : cités nulle part.
- `scaleTranspose` mentionné une fois (M2 2.24 theory) sans flash.

**Solfège :**
- **Les modes** (dorien, phrygien…) — suggérés en exercice, jamais enseignés.
- Les valeurs rythmiques nommées (noire, croche, double) ne sont qu'effleurées (M1 2.2, M4 4.18) ; un flash « lire un rythme » consoliderait le pont guitariste.
- La gamme mineure harmonique/mélodique (la psy-trance en vit) : absente.

**Électro :**
- **L'écoute de références** : aucun flash ne renvoie vers de vrais morceaux à écouter (« écoute tel track de Derrick May et repère le offbeat »). Pour apprendre un *genre*, c'est le manque le plus important.
- **La culture/histoire** n'existe qu'en name-drops (Kevin Saunderson 7.13, Brian Eno 7.21, JP-8000 7.17). Detroit/Chicago/Berlin, la rave, l'EBM annoncée en fil rouge M3 : jamais racontés.
- Genres non couverts par M7 : dubstep/UK garage, electro/EBM (alors que M3 s'en réclame), trap/hip-hop. Pas bloquant — 5 genres bien traités valent mieux que 9 survolés — mais l'EBM mériterait sa place vu le fil rouge M3.

---

## 5. Superflu

Peu de gras, honnêtement :
- **M2 ch.1** : la redondance avec M1 ch.4 (voir §3) — le seul vrai doublon.
- **`samples()` expliqué 3 fois** (M6 6.16, M7 7.12, M8 8.1–8.2) et **chop/slice 3 fois** (M6 6.17–6.18, M7 7.3/7.12, M8 8.3). En partie de la répétition espacée assumée (M8 recontextualise sur le PO-33), mais M7 7.12 pourrait renvoyer à M6 au lieu de re-décoder.
- **M5 5.24 (MIDI)** : flash un peu creux — le code joué ne démontre pas le MIDI (assumé honnêtement, mais il flotte ; il prendra son sens avec le chantier C45 WebMIDI).
- Rien d'hors sujet. Les flashs guitare (M3) pourraient sembler une digression, mais le bilan industrial 3.25 les raccroche bien au fil électro.

---

## 6. Le fil électro — tenu ?

**Oui, et c'est une réussite.** Vérifié module par module :
- Chaque module **annonce son genre au flash 1 et le délivre au bilan** : M1 techno (1.1 → 5.4, 132 BPM + breakdown), M2 trance (2.1 → 2.25, la montée émotionnelle), M3 industrial (3.1 → 3.25, power chords sur kick rigide), M4 acid/psy (4.1 → 4.25, le squelch 303), M5 ambient + D&B (5.1 → 5.25), M6 house (6.1, structure 4 actes), M7 = 5 morceaux complets, M8 = le geste hardware.
- Le **vocabulaire du producteur** est réellement enseigné, pas seulement la syntaxe : offbeat/backbeat (7.1), swing/humanisation (7.2), breakdown/build/drop (7.4, 7.8), sidechain/pump (7.9), half-time (7.11/7.14), reese (7.13), supersaw/layering (7.17), riser (7.18), drone/génératif (7.21–7.23), structure DJ (7.4).
- **La limite** : c'est un fil *technique* (comment fabriquer le son du genre), pas encore *culturel* (d'où il vient, qui écouter). Voir §4 — c'est le complément naturel, pas un échec.

---

## 7. Le glossaire bilingue — existe-t-il ?

**Non. Il n'existe pas, sous aucune forme.**
- `grep glossaire|glossary|lexique` dans `keymaker-app/src/` : **zéro résultat**. Aucun composant, aucun onglet, aucune donnée dédiée.
- La vision d'origine était explicite (`KEYMAKER_module1.md` : « Chaque terme nourrit le glossaire bilingue de l'app » + la liste de ~19 termes du M1 prête à l'emploi).
- **La matière première existe pourtant déjà** : les blocs `theory` des flashs appliquent rigoureusement la convention « terme FR (anglais) » — *hauteur (pitch)*, *gamme (scale)*, *armure (key signature)*, *sub bass*, *rolling bass*… Plusieurs centaines d'entrées sont extractibles automatiquement depuis les `theory.items` et les `decode`.
- Verdict : promesse non tenue, mais chantier peu coûteux car les données sont structurées.

---

## Chantiers proposés

Par ordre de priorité décroissante. Effort : S (< 1 session) / M (1–2 sessions) / L (3+).

1. **C48 — Glossaire bilingue cherchable** *(M, impact fort)* — Extraire les termes des blocs `theory` (+ liste du M1 dans la spec) vers un `glossary.js` ; onglet/overlay avec recherche FR↔EN et lien « vu au flash X ». Tient la promesse d'origine et sert le profil TDA (retrouver un mot sans relire un chapitre).
2. **C49 — Flash « rythmes euclidiens »** *(S, impact fort)* — Un flash dans M5 ch.2 (ou M1 ch.2 en extension) : `(3,8)`, `(p,s,r)`, exemples bd(3,8)/clave. Puis ajouter une ligne de décode dans M4 4.25 et M6 6.25 qui y renvoie. Supprime le seul vrai trou syntaxique.
3. **C50 — Passe de corrections ponctuelles** *(S, impact moyen)* — (a) M3 3.7 : « 48 = do central » → « 48 = do (c3) ; le do central, c'est c4 = 60 » ; (b) M5 5.13 : retirer « vu en M1 » ou introduire `|` en M1 2.7 ; (c) M1 2.6 : déplacer l'exemple à virgule vers 2.7 ; (d) M1 5.4 : « alternance d'accords » → « de notes » ; (e) M3 3.17 : gloser `.fast(2)` ; (f) M7 7.12 : aligner le décode sur le code (`samples({…})`) ; (g) M2 2.9/2.25 : une parenthèse « filtre expliqué au M4 ».
4. **C51 — Capsules culture & écoute** *(M, impact fort sur le fil électro)* — Par chapitre de M7 (+ bilans M1–M6) : 3–5 morceaux de référence à écouter avec « ce qu'il faut y entendre », et 4 lignes d'histoire du genre (Detroit, Chicago, l'amen, l'acid). Format `theory` existant, zéro dev.
5. **C52 — Flash « les modes »** *(S, impact moyen)* — Dorien/éolien/phrygien dans M2 ch.3 (ou M7), puisque trois exercices suggèrent déjà `C:dorian`. Bonus : mineure harmonique pour la psy.
6. **C53 — Dégraisser M2 ch.1** *(M, impact moyen)* — Transformer M2 2.2/2.4/2.5 en « rappel express + approfondissement » (renvoi M1 ch.4) pour éliminer la seule vraie redondance du cursus.
7. **C54 — Ids de flashs non ambigus** *(S, impact moyen)* — Harmoniser l'affichage des ids (préfixe module pour M1, ex. « M1·2.3 ») pour que Sati, les quiz et Felix parlent du même flash. Le stockage `m:c:f` est déjà sain, c'est cosmétique mais ça évite de vraies confusions.
8. **C55 — Mini-chapitre « syntaxe de scène »** *(M, impact faible/moyen)* — `arp()` (l'arpégiateur trance), `polymeter`, `penv` (kick synthétique), `compressor`. À caser en M7 ou en annexe du M5. Optionnel, pour la complétude.

---

*Audit réalisé le 11 juin 2026 — 181 flashs lus en intégralité, référence Strudel et spec M1 croisées, grep du code de l'app pour le glossaire.*
