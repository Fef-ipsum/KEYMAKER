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
| **Studio** | « Je veux juste faire du son. » | Éditeur libre, points de départ, tes snippets. |

Sati (l'assistante en ligne) et les réglages sont deux icônes discrètes ; ils ne sont pas des destinations.

**Reprendre en un geste** : l'app mémorise la dernière étape ouverte et son code en cours. Le bouton *Continuer* y ramène, où qu'elle soit (fondations, genre, approfondissement).

---

## 3. Anatomie d'une étape

Toutes les étapes ont la même forme, dans le même ordre. On n'a qu'un seul modèle à apprendre.

1. **Écoute** — le code est déjà dans l'éditeur. On appuie sur ▶.
2. **Ce que tu entends** — deux phrases au plus. Le nom arrive ici.
3. **À toi** — une consigne, un seul changement. Quand on relance, l'app regarde ce que le code *produit* (les événements sonores du premier cycle) et répond : « C'est ça » ou un indice. Jamais « faux ».
4. **Creuser** (replié) — le code décortiqué morceau par morceau, chaque morceau menant à son entrée du wiki ; le pourquoi ; le lien avec le solfège.
5. **Suivant.**

### Les schémas vivants

Certaines étapes déclarent un **schéma vivant** (le filtre, l'enveloppe… voir `docs/SCHEMAS.md`). Il s'affiche dans « Ce que tu entends », **avant** le texte qui nomme la notion : on joue avec le dessin, on entend, puis on lit le mot. C'est le principe 1 appliqué jusqu'au bout : le son, puis le nom.

- Le schéma fait **comprendre** la notion (on voit la bosse grandir en l'entendant siffler) ; le code fait **apprendre** la syntaxe. Aucun bouton du schéma n'écrit dans l'éditeur : l'exercice « À toi » reste à faire.
- Ses deux ou trois **missions** se valident toutes seules pendant que ça joue, et chaque réussite fait apparaître une phrase de compréhension. Elles ne bloquent rien : l'étape se valide toujours par le code.
- Un seul son à la fois : toucher ▶ arrête le schéma, et inversement.

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
- **Une quatrième forme : « retrouve le réglage à l'oreille ».** L'app joue un son mystère ; on règle un schéma jusqu'à l'entendre pareil ; l'app compare les valeurs avec une tolérance. Elle entraîne l'oreille, pas seulement l'œil. Un point d'étape en contient au plus deux, en plus des questions des étapes (le chapitre 6 en a donc huit). Chacune a un identifiant stable (`oreille.…`) et devient une carte de révision comme les autres.
- **Révision espacée.** Chaque question réussie revient après 3 jours, puis 7 ; une question ratée revient le lendemain. Cinq cartes au plus par session. C'est l'algorithme de l'app précédente, conservé.
- **Tout est local.** Aucune question n'est générée à la volée. Un quiz faux est pire que pas de quiz.

---

## 6. Le mode « J'ai X minutes »

Trois durées : 10, 20, 40 minutes. L'app compose la session :

1. les révisions prêtes (3 à 5 cartes) ;
2. une à trois étapes nouvelles, à la suite de là où on en est ;
3. si le temps le permet, un défi libre dans le Studio (tiré d'une banque locale ; si Sati est joignable, elle peut en proposer un sur mesure).

Pas de minuteur qui presse : une indication discrète du temps écoulé, et on s'arrête quand on veut. Ce qui est fait reste fait.

---

## 7. Le wiki

### Le problème à résoudre

« Tout savoir sur chaque fonction » et « ne pas être confus » tirent en sens opposé. La réponse est une **forme fixe à quatre niveaux**, identique pour toutes les entrées. On ne lit jamais plus que ce qu'on a demandé.

| Niveau | Toujours visible ? | Contenu |
|---|---|---|
| **L'essentiel** | oui | Une ou deux phrases : ce que c'est, à quoi ça sert. Un exemple jouable. |
| **Comment s'en servir** | replié | Plusieurs usages, chacun avec son code jouable. Les arguments, avec leurs valeurs utiles. |
| **Pièges** | replié | Les erreurs courantes et comment les reconnaître. |
| **Évolutions** | replié | Autres noms (alias), anciens noms, changements de comportement, syntaxes qu'on peut croiser ailleurs. |

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

### Le cas Agar Agar : pourquoi les genres sont flous

Selon les sources, la musique du duo est rangée en électropop, synth-pop, new wave, techno ou art pop. L'app s'en sert pour montrer que les étiquettes décrivent des *ressemblances* : un même morceau peut emprunter le kick d'un genre, les synthés d'un autre et la voix d'un troisième. On regarde donc quels traits sont présents, plutôt que de chercher la bonne case.

Limite assumée : je ne peux pas écouter « I'm That Guy ». L'app ne donne aucun détail précis (tempo, tonalité, accords, sons) sur ce morceau. Elle décrit les traits du *style* et propose un exemple original dans cet esprit, présenté comme tel.

### Originalité

Tous les exemples de code sont des créations originales « dans le style de ». Aucun n'est la transcription d'un morceau existant.

### Ajouter un genre

Un genre est un fichier de données unique (ses huit traits, son assemblage). L'ajouter au registre suffit : il apparaît dans la liste, dans le comparateur et dans le wiki, sans toucher au code de l'interface.

---

## 9. Les approfondissements

Les modules d'origine qui vont au-delà des fondations restent disponibles après le parcours, sous des noms clairs : *Sculpter le son*, *Le code comme instrument*, *Composer un morceau*, *Autres genres* (house, drum & bass, ambient), *Guitare*, *PO-33*. Même forme d'étape, même éditeur. Leur exercice se valide par auto-évaluation (« c'est fait »), Sati pouvant donner un avis quand elle est joignable.

Ils sont volontairement en retrait : le parcours principal ne les exige pas.

---

## 10. Récompenses sobres

- Une étape validée : une coche, un son bref et doux (désactivable), l'aiguille du cadran de chapitre qui avance d'un cran.
- Un chapitre terminé : le cadran est complet. Une phrase. Rien d'autre.
- Aucun point, aucun niveau, aucun classement, aucune série.
