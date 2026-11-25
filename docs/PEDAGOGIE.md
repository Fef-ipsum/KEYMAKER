# Keymaker 2 — Conception pédagogique

*Comment l'app enseigne Strudel et le solfège à un débutant total, en sessions courtes, sans friction.*

---

## 1. Les cinq principes

1. **Le son d'abord, le nom ensuite, la théorie en dernier.** Chaque notion commence par quelque chose qu'on entend. Le mot (« tierce », « filtre passe-bas ») arrive pour nommer ce qu'on vient d'entendre. L'explication n'arrive que si on la demande.
2. **Une seule chose à la fois.** Une étape = une idée = un geste à faire. Un écran = une action principale.
3. **On apprend en modifiant, pas en lisant.** Chaque étape demande un petit changement dans le code. L'app vérifie le résultat elle-même, sur l'appareil, sans IA.
4. **Deux vitesses, jamais en conflit.** La voie rapide tient sur l'écran sans rien déplier. La profondeur est toujours à un geste, jamais sur le chemin.
5. **Rien n'accuse.** La progression ne recule jamais. Pas de série à maintenir, pas de retard affiché, aucune notification. Une révision « prête » attend ; elle ne « déborde » pas.

---

## 2. Les quatre lieux de l'app

| Lieu | Question à laquelle il répond | Contenu |
|---|---|---|
| **Aujourd'hui** | « Qu'est-ce que je fais maintenant ? » | Un seul gros bouton : *Continuer* (l'étape exacte où tu t'es arrêté). En dessous : « J'ai 10 / 20 / 40 minutes ». |
| **Parcours** | « Où j'en suis ? Qu'est-ce qui vient après ? » | Les fondations (8 chapitres), puis les genres, puis les approfondissements. |
| **Wiki** | « C'est quoi, ça ? » | Tout : fonctions, caractères, arguments, solfège, traits de genres. Recherche instantanée hors ligne. |
| **Studio** | « Je veux juste faire du son. » | Éditeur libre, points de départ, tes snippets, l'enregistrement du son, les défis. |

Sati (l'assistante en ligne) et les réglages sont deux icônes discrètes ; ils ne sont pas des destinations.

**Enregistrer le son (Studio).** Le bouton « Enregistrer » capte la sortie de Strudel (le dernier gain avant les haut-parleurs) : le fichier contient ce que tu entends, à son volume. L'enregistrement commence au début d'un cycle et dure 4, 8, 16 ou 32 cycles ; si le code contient un seul `arrange` lisible, « Le morceau entier » le rejoue depuis le cycle 0 et s'arrête après la dernière section. WAV : chaque échantillon est recopié avec son numéro (AudioWorklet), et le fichier est coupé à l'échantillon près sur l'heure de début de cycle que calcule le planificateur : il boucle sans couture. WebM (M4A sous Safari) : compressé par MediaRecorder, démarré et arrêté par minuterie, à quelques centièmes de seconde près. Arrêter la lecture ou « Annuler » abandonne l'enregistrement. Contrôle : `scripts/check-record.mjs` (longueur, attaques à moins de 4 ms en WAV, morceau depuis le cycle 0, arrêt, annulation).

**Défis vérifiés.** Sept modèles de consigne (une couche qui entre au Nᵉ cycle, une basse dans une tonalité, un accord parfait, un rythme euclidien, un accent, un filtre qui s'ouvre, une fin de phrase) donnent 46 défis tirés au hasard (`src/content/defis.js`, `#/defi`). Chacun a sa vérification sur ce que le code produit, une solution générée et l'indice gradué du §3. `check-content` vérifie toutes les instances (départ refusé, solution acceptée) ; des variantes écrites autrement sont acceptées (`<~ ~ hh*8 hh*8>` au lieu de `mask`, `chord("Dm").voicing()`, toute rotation d'un rythme euclidien).

**Visualisations.** `_pianoroll()`, `_punchcard()` et `_scope()` dessinent sous leur ligne ; l'app cale leur largeur sur celle de l'éditeur (Strudel les dessine sur 500 px, ce qui débordait sur téléphone). Ce que le wiki en dit (`fn.visu`, `fn.color`) est mesuré par `scripts/check-visu.mjs`.

**Reprendre en un geste** : l'app mémorise la dernière étape ouverte et son code en cours. Le bouton *Continuer* y ramène, où qu'elle soit (fondations, genre, approfondissement).

---

## 3. Anatomie d'une étape

Toutes les étapes ont la même forme, dans le même ordre. On n'a qu'un seul modèle à apprendre.

1. **Écoute** — le code est déjà dans l'éditeur. On appuie sur ▶.
2. **Ce que tu entends** — court (deux ou trois phrases), mais précis : le nom arrive ici, avec ce qu'il désigne réellement (unité, sens, ordre de grandeur). Le mécanisme va dans « Creuser ».
3. **À toi** — une consigne, un seul changement. Quand on relance, l'app regarde ce que le code *produit* (les événements sonores du premier cycle) et répond : « C'est ça » ou un indice. Jamais « faux ». L'aide monte par paliers : au premier essai raté, l'indice de l'exercice ; au deuxième, **où chercher** dans le code de départ (`src/lib/hint.js` compare, mot par mot, le code de départ et la solution proposée, et nomme le passage à changer ou l'endroit où ajouter, sans dire par quoi) ; au troisième, « Voir une solution ». `scripts/check-hints.mjs` vérifie que chaque passage nommé existe dans le code de départ, tient debout (parenthèses équilibrées) et ne dévoile aucun mot propre à la solution.
4. **Creuser** (replié) — le code décortiqué morceau par morceau, chaque morceau menant à son entrée du wiki ; le pourquoi (le mécanisme réel, pas une image) ; le lien avec le solfège. Les termes techniques renvoient au wiki par des liens dans le texte.
5. **Suivant.**

### Les schémas vivants

Certaines étapes déclarent un **schéma vivant** (le filtre, l'enveloppe… voir `docs/SCHEMAS.md`). Il s'affiche dans « Ce que tu entends », **avant** le texte qui nomme la notion : on joue avec le dessin, on entend, puis on lit le mot. C'est le principe 1 appliqué jusqu'au bout : le son, puis le nom.

- Le schéma fait **comprendre** la notion (on voit la bosse grandir en l'entendant siffler) ; le code fait **apprendre** la syntaxe. Aucun bouton du schéma n'écrit dans l'éditeur : l'exercice « À toi » reste à faire.
- Ses deux ou trois **missions** se valident toutes seules pendant que ça joue, et chaque réussite fait apparaître une phrase de compréhension. Elles ne bloquent rien : l'étape se valide toujours par le code.
- Un seul son à la fois : toucher ▶ arrête le schéma, et inversement.
- Une notion que les leçons n'enseignent pas encore (le sidechain, `duck`) n'a son schéma que dans le wiki : on ne glisse pas une notion nouvelle dans une leçon qui parle d'autre chose.

### Les deux vitesses

- **Vite** : Écoute → À toi → Suivant. Trois gestes, moins de deux minutes par étape.
- **En profondeur** : on déplie *Creuser*, on ouvre une entrée du wiki, on y trouve d'autres exemples jouables, les pièges, les évolutions. On revient à l'étape là où on l'avait laissée : le wiki s'ouvre par-dessus, il ne fait pas quitter la leçon.

### Les trois états d'une étape

| État | Comment on l'obtient | Peut-il se perdre ? |
|---|---|---|
| **Vue** | on a ouvert l'étape | non |
| **Faite** | l'exercice est validé | non |
| **Acquise** | on a répondu juste à sa question lors d'un point d'étape ou d'une révision | non : une erreur en révision rapproche seulement la prochaine révision |

---

## 4. Le parcours « Les fondations »

Huit chapitres. Strudel et solfège y avancent ensemble : chaque notion de solfège arrive au moment où elle sert à faire un son.

| # | Chapitre | Ce qu'on sait faire à la fin | Solfège rencontré |
|---|---|---|---|
| 1 | **Premier son** | Lancer un morceau, le modifier, écrire un rythme de batterie à soi | tempo, pulsation |
| 2 | **Le rythme** | Lire et écrire toute la mini-notation rythmique | cycle et mesure, temps, croche, silence, contretemps |
| 3 | **Les notes** | Écrire une mélodie avec des lettres | grave/aigu, do-ré-mi = C-D-E, octave, demi-ton, dièse et bémol |
| 4 | **Les gammes** | Rester « dans la gamme » sans fausse note | gamme majeure et mineure, degrés, tonique |
| 5 | **Intervalles et accords** | Empiler des notes, écrire une suite d'accords | tierce majeure/mineure, quinte, accord, arpège, progression |
| 6 | **Le timbre** | Fabriquer un son de synthé et le sculpter | onde, filtre, enveloppe |
| 7 | **Le mouvement** | Faire évoluer un motif tout seul | variation, répétition, tension |
| 8 | **Assembler** | Construire un morceau en couches, avec une structure | couches, intro/développement, mesure de 4 temps |

### Les deux premières minutes

L'étape 1 ne joue pas un « bip ». Elle joue un petit morceau complet, court et lisible. Geste 1 : appuyer sur ▶. Geste 2 : changer un nombre (le tempo). Geste 3 : changer un mot (la boîte à rythmes). En trois étapes, on a un son qui est déjà un peu le sien. *Ensuite seulement* on le démonte, brique par brique.

### Le pont do-ré-mi ↔ C-D-E

Présenté une fois (chapitre 3), puis rappelé partout sans effort : dès qu'une note anglaise apparaît dans un texte de leçon ou dans le wiki, son nom français est donné à côté (« `e` (mi) »). Une table de correspondance est accessible depuis n'importe où dans le wiki. Convention fixée par le moteur et rappelée : une note sans numéro est à l'octave 3 (`c` = `c3`) ; le do une octave au-dessus s'écrit `c4`.

### Apprendre une tierce en l'écrivant

Exemple de la démarche pour les intervalles (chapitre 5) :

1. On joue `note("c3 e3")` puis `note("c3 eb3")`. On entend : même départ, deux couleurs.
2. On joue les deux notes *ensemble* : `note("[c3,e3]")`, puis `note("[c3,eb3]")`. Clair / sombre.
3. Le nom arrive : c'est une **tierce**, majeure (4 demi-tons) ou mineure (3 demi-tons).
4. À toi : transforme la tierce majeure en mineure. L'app vérifie l'écart entre les deux notes produites.
5. Creuser : pourquoi « tierce » (troisième note de la gamme), comment compter les demi-tons, lien vers *accord*.

---

## 5. Points d'étape et révision espacée

- **Fin de chapitre : un point d'étape.** Quatre à six questions écrites à la main, tirées des étapes du chapitre. Trois formes : question à choix, **question d'écoute** (« lequel des deux est une tierce mineure ? » — l'app joue, on choisit), et lecture de code (« que joue ce motif ? »).
- **Une quatrième forme : « retrouve le réglage à l'oreille ».** L'app joue un son mystère ; on règle un schéma jusqu'à l'entendre pareil ; l'app compare les valeurs avec une tolérance. Elle entraîne l'oreille, pas seulement l'œil. Les questions sont **générées** à partir des schémas (`src/content/fondations/ear.js`) : une famille par réglage (coupure, résonance, attack, enveloppe pincée, taille de la réverbération, temps entre les échos, tempo), avec plusieurs valeurs cibles. Une famille a un identifiant stable (`oreille.…`) et fait UNE carte de révision ; chaque passage tire une cible au hasard, pour qu'on retienne l'oreille et pas la réponse. Un point d'étape en tire deux familles au hasard, en plus des questions des étapes. `check-schemas` vérifie chaque variante : le réglage de départ est refusé, la cible est acceptée et atteignable au curseur, et le code du son mystère, évalué par Strudel, porte bien la valeur cible.
- **Révision espacée.** Chaque question réussie revient après 3 jours, puis 7 ; une question ratée revient le lendemain. Cinq cartes au plus par session. C'est l'algorithme de l'app précédente, conservé.
- **Tout est local.** Aucune question n'est générée à la volée. Un quiz faux est pire que pas de quiz.

---

## 6. Le mode « J'ai X minutes »

Trois durées : 10, 20, 40 minutes. L'app compose la session :

1. les révisions prêtes (3 à 5 cartes) ;
2. un ou deux exercices d'approfondissement à refaire de mémoire, s'il y en a de prêts (voir §9) ;
3. une à trois étapes nouvelles, à la suite de là où on en est : les fondations d'abord ; dès 20 minutes, une place va à la leçon suivante de l'approfondissement ouvert le plus récemment ; les fondations finies, toutes y vont ;
4. si le temps le permet, un défi libre dans le Studio (tiré d'une banque locale ; si Sati est joignable, elle peut en proposer un sur mesure).

Pas de minuteur qui presse : une indication discrète du temps écoulé, et on s'arrête quand on veut. Ce qui est fait reste fait.

---

## 7. Le wiki

### Le problème à résoudre

« Tout savoir sur chaque fonction » et « ne pas être confus » tirent en sens opposé. La réponse : **l'essentiel en tête, toujours visible, puis le détail complet dans des replis**, dans un ordre fixe. Le détail doit exister ; la lisibilité sur téléphone aussi. Un repli n'apparaît que si l'entrée a de quoi le remplir.

| Niveau | Toujours visible ? | Champ | Contenu |
|---|---|---|---|
| **L'essentiel** | oui | `ess`, `code` | Deux à quatre phrases : le phénomène réel (sonore ou musical), dit précisément. Un exemple jouable et commenté. |
| **Les réglages** | replié | `args` | Pour chaque paramètre : unité, sens (plus / moins), valeur par défaut, plage utile, ce qu'on entend en montant et en descendant. |
| **Dans le temps** | replié | `time` | Quand ça agit : début de note, durée, retour à l'état normal. |
| **Pourquoi ça marche** | replié | `why` | Le mécanisme physique, acoustique ou de calcul. |
| **Comment s'en servir** | replié | `recipe`, `vary`, `use` | Une recette complète (valeurs justifiées), des variations (« si on change telle valeur… »), d'autres exemples. |
| **Pièges et confusions** | replié | `traps` | Les erreurs fréquentes, et les notions voisines avec lesquelles on la confond. |
| **Évolutions et autres noms** | replié | `evo` | Alias, anciens noms, syntaxes qu'on peut croiser ailleurs. |

Ces sept points s'appliquent **en entier** aux sons et aux effets. Ailleurs (mini-notation, fonctions, solfège, écriture du code), on ne garde que ceux qui ont un sens : « Dans le temps » ou « mécanisme physique » n'ont rien à dire sur le signe `~`.

**Règles d'écriture** (valables pour tout le texte explicatif de l'app : wiki, étapes, genres, approfondissements) :

- **Précis avant tout.** Jamais de formule vague (« fait glisser », « donne de la couleur ») sans dire quoi, dans quel sens et de combien. Chaque comportement est vérifié dans le moteur embarqué ou la documentation officielle ; un doute se signale, il ne s'écrit pas comme un fait.
- **Ni condescendant ni jargon gratuit.** Registre adulte, tutoiement. Un terme technique est permis s'il est défini à sa première apparition **ou** relié à son entrée du wiki par un lien `[texte](id.entree)`.
- **Les exemples jouent et sont commentés** (`// …` sur sa propre ligne, court, pour rester lisible sur téléphone). Ils sont tous exécutés par `npm run check:content`.

Sous chaque entrée : *Voir aussi* (entrées liées) et *Ma note* (ton annotation personnelle).

### Les familles d'entrées

- **Mini-notation** — chaque caractère : espace, `~`, `[ ]`, `*`, `/`, `< >`, `,`, `!`, `@`, `_`, `?`, `( , )`, `:`, `|`, `.`
- **Fonctions** — créer un motif, le transformer dans le temps, le faire varier.
- **Sons et effets** — sources, filtres, enveloppes, espace, couleur.
- **Solfège** — notes, intervalles, gammes, accords, rythme.
- **Genres** — les traits : kick techno, basse acid, supersaw, sidechain, etc.
- **Vocabulaire** — le reste du glossaire d'origine.

### Y accéder

1. **Depuis une leçon** : chaque morceau de code décortiqué est un lien.
2. **Depuis le code** : sous l'éditeur, une rangée « Dans ton code » liste les éléments reconnus dans ce que tu as écrit (fonctions et caractères de mini-notation). Un toucher ouvre l'entrée. Le mot sous le curseur est mis en avant.
3. **Par la recherche** : instantanée, hors ligne, tolérante aux accents ; on peut chercher `lpf`, « filtre », « do » ou « tierce ».

### Exactitude

- Chaque nom de fonction cité dans le wiki est vérifié automatiquement : il doit exister dans le moteur embarqué (Strudel 1.3.0). Les alias affichés sont extraits du moteur.
- Chaque exemple de code du wiki, des leçons et des genres est exécuté dans un navigateur sans interface avant livraison.
- Les affirmations historiques (« autrefois appelé… ») ne sont écrites que si elles sont vérifiables dans le moteur (l'ancien nom existe encore comme alias) ou dans la documentation officielle. Sinon, elles sont absentes.
- Ce que le contenu affirme sur le moteur est vérifié par `npm run check:claims` (`scripts/claims.js`) : un code et ce qu’il doit produire cycle par cycle, ou un extrait du code source du moteur sur lequel un texte s’appuie (valeur par défaut, plafond, ordre de la chaîne). Chaque affirmation cite les entrées qui en dépendent : après une mise à jour du moteur, l’échec dit quels textes relire. Toute nouvelle affirmation chiffrée dans un texte s’accompagne d’une entrée dans `claims.js`.
- `npm run check:noop` cherche, dans tous les exemples, les transformations qui ne changent rien (comme `swing(8)` sur `hh*8`, ou deux hasards qui tirent le même nombre). Il avertit ; les cas voulus se déclarent dans sa liste `ALLOWED`, avec leur raison.
- Piège à connaître en écrivant un exemple : deux hasards dans la même chaîne (`degradeBy`, `sometimes`, `irand`, `rand`, `choose`, `?`) lisent le même nombre au même instant. `.seed(1)` placé entre les deux les sépare.

---

## 8. Les genres

### Un genre est une famille de traits

Un genre n'est pas une case. C'est un ensemble de traits qui apparaissent souvent ensemble. Chaque genre est donc présenté trait par trait, toujours dans le même ordre :

1. **Tempo**
2. **Kick**
3. **Basse**
4. **Hi-hats et groove**
5. **Harmonie et gammes**
6. **Timbres et synthés**
7. **Structure et arrangement**
8. **Histoire et contexte**

Pour chaque trait, trois temps : **l'entendre** (un exemple jouable), **le comprendre** (ce qui le rend reconnaissable, en clair), **le reconstruire** (on part d'une ligne simple et on ajoute un réglage à la fois). Puis une dernière étape, **assembler** : les traits empilés donnent un morceau dans le style.

### Comparer

Parce que tous les genres ont les mêmes huit traits, on peut les mettre côte à côte : « qu'est-ce qui distingue la techno de la trance ? » se lit ligne par ligne (tempo, kick, basse…), et s'entend : chaque case est jouable.

### Les genres livrés

- **Techno** et **Acid**
- **Trance** et **Progressive**
- **Synth-pop / électropop**, autour du cas Agar Agar
- **House**, **Drum & bass** et **Ambient**, repris des leçons vérifiées du parcours « Autres genres » (qui garde ses morceaux complets). L'ambient n'a pas de zone de tempo : `bpmLabel` remplace l'affichage « min–max BPM ».

### Le cas Agar Agar : pourquoi les genres sont flous

Selon les sources, la musique du duo est rangée en électropop, synth-pop, new wave, techno ou art pop. L'app s'en sert pour montrer que les étiquettes décrivent des *ressemblances* : un même morceau peut emprunter le kick d'un genre, les synthés d'un autre et la voix d'un troisième. On regarde donc quels traits sont présents, plutôt que de chercher la bonne case.

Limite assumée : je ne peux pas écouter « I'm That Guy ». L'app ne donne aucun détail précis (tempo, tonalité, accords, sons) sur ce morceau. Elle décrit les traits du *style* et propose un exemple original dans cet esprit, présenté comme tel.

### Originalité

Tous les exemples de code sont des créations originales « dans le style de ». Aucun n'est la transcription d'un morceau existant.

### Ajouter un genre

Un genre est un fichier de données unique (ses huit traits, son assemblage). L'ajouter au registre suffit : il apparaît dans la liste, dans le comparateur et dans le wiki, sans toucher au code de l'interface.

---

## 9. Les approfondissements

Les modules d'origine qui vont au-delà des fondations restent disponibles après le parcours, sous des noms clairs : *Sculpter le son*, *Le code comme instrument*, *Composer un morceau*, *Autres genres* (house, drum & bass, ambient), *Guitare*, *PO-33*. Même forme d'étape, même éditeur. 98 de leurs 117 exercices se valident tout seuls, comme ceux des fondations : après chaque ▶, une fonction regarde ce que le code produit et répond par la réussite ou par un indice précis (`src/content/legacy/checks.js`, avec une solution de référence par exercice ; « Voir une solution » apparaît après deux essais). Les 19 autres sont ouverts (écouter, comparer, s’approprier un morceau) et gardent « C’est fait ». Sur un exercice vérifié, « Je l’ai fait autrement » reste possible : la vérification ne doit jamais bloquer. Les tests exigent que chaque solution valide, que le code de départ échoue, et qu’un indice accompagne l’échec.

**Révision des exercices.** Un exercice validé par le moteur (pas « Je l'ai fait autrement ») crée une carte `ex:<leçon>` : il revient trois jours plus tard, puis sept, en mode « de mémoire » (`#/etape/<leçon>?revision=1`) : le code repart de son point de départ, le décodage est replié, les mêmes indices gradués s'appliquent. Le refaire juste marque la leçon « acquise » ; dire « Je ne m'en souviens pas » ou regarder la solution le fait revenir le lendemain. L'accueil signale les exercices prêts ; « J'ai X minutes » en place un ou deux.

**Questions.** 54 questions (`src/content/legacy/quizzes.js`), deux ou trois par chapitre, nourrissent un point d'étape à la fin de chaque chapitre et la révision espacée, comme dans les fondations. Chacune est protégée par une affirmation `qa-…` de `scripts/claims.js` qui cite sa leçon : le code ou le fait sur lequel repose la bonne réponse est vérifié dans le moteur, et `check-links` refuse une question sans affirmation. Les chapitres House, Drum & Bass et Ambient n'en ont pas : leurs questions sont dans la section Genres, avec les traits (deux par genre, chacune protégée par une affirmation).

Ils sont volontairement en retrait : le parcours principal ne les exige pas.

Réécriture (novembre 2026) : les cinq parcours suivent les règles d’écriture du §7 (texte précis, valeurs vérifiées dans le moteur, liens vers le wiki). Les leçons réécrites portent `rich: true` dans `lessons.js` / `module7.js`, ce qui active le mini-format (code, gras, liens) dans leur concept, décodage, théorie et exercice. `richRecap: true` fait de même pour le tableau récapitulatif, « Pour aller plus loin » et « À écouter » : sans ce drapeau, ces blocs restent en texte brut (un `hh*8` y deviendrait de l’italique). Les renvois aux anciens modules (« M1 », « Module 6 ») sont remplacés par les noms des parcours ou par des liens du wiki.

---

## 10. Récompenses sobres

- Une étape validée : une coche, un son bref et doux (désactivable), l'aiguille du cadran de chapitre qui avance d'un cran.
- Un chapitre terminé : le cadran est complet. Une phrase. Rien d'autre.
- Aucun point, aucun niveau, aucun classement, aucune série.
