# Note de conception — « Refaire un morceau »

*Fonction prévue, non construite. Cette note dit où elle se branche et pourquoi l'architecture de Keymaker 2 la permet sans réécriture.*

---

## 1. Ce que la fonction fera

Tu choisis un morceau que tu connais. L'app t'aide à le refaire dans Strudel en trois temps :

1. **Décomposer** : lister les couches du morceau (batterie, basse, accords, mélodie, effets) et répondre, pour chacune, aux huit questions des genres (tempo, kick, basse, charlestons, harmonie, timbres, structure, histoire).
2. **Avancer couche par couche** : une étape par couche. Tu écris, tu écoutes, tu ajustes. Chaque couche terminée s'empile sur les précédentes.
3. **Comparer** : écouter ta version à côté de l'original (que tu fais jouer toi-même, ailleurs), et noter les écarts qui restent.

L'app ne « transcrit » pas le morceau à ta place : elle structure le travail et garde ta progression.

## 2. Ce qui existe déjà et sera réutilisé tel quel

| Besoin | Brique existante | Fichier |
|---|---|---|
| Un éditeur qui joue, avec validation à chaque lecture | l'éditeur unique et son propriétaire | `src/lib/engine.js`, `src/lib/dock.js`, `src/components/EditorDock.jsx` |
| Charger un code par étape et comparer avec l'étape d'avant | le mécanisme « reconstruire » des genres (`dock.loadCode`) | `src/views/Genres.jsx` (composant `Trait`) |
| Lire ce qu'un code produit (sons, notes, tempo) | le contexte de validation | `src/lib/check.js` |
| Les huit questions | le registre des aspects | `src/content/genres/index.js` (`ASPECTS`) |
| Garder des codes | les snippets | `src/lib/notebook.js` |
| Expliquer un élément du code | le wiki et « Dans ton code » | `src/content/wiki/index.js` (`explainCode`) |
| Être sauvegardé avec le reste | l'export | `src/lib/backup.js` (prend toutes les clés `km2:*`) |

## 3. Ce qu'il faudra ajouter

### 3.1 Les données : un « projet »

Un projet est un objet enregistré sur l'appareil, sous une clé `km2:projets` (liste) :

```js
{
  id: 'p-1731312000',            // identifiant stable
  titre: 'Le titre du morceau',
  artiste: 'Son artiste',
  tempo: null,                   // ce que TU mesures à l'oreille ; vide au départ
  tonalite: '',                  // idem (par exemple 'A:minor') ; peut rester vide
  couches: [
    { id: 'kick',  aspect: 'kick',     nom: 'Kick',  code: '…', etat: 'faite',   note: '' },
    { id: 'basse', aspect: 'basse',    nom: 'Basse', code: '…', etat: 'en-cours', note: 'manque le filtre' },
    { id: 'acc',   aspect: 'harmonie', nom: 'Accords', code: '', etat: 'a-faire', note: '' },
  ],
  ecarts: 'La basse est trop propre.',  // notes de comparaison
  cree: 1731312000000, modifie: 1731398400000,
}
```

Chaque couche porte un `aspect` pris dans `ASPECTS` : c'est ce qui relie un projet aux genres et au wiki (« ta basse ressemble au trait *basse acid* »).

Aucune table côté serveur n'est nécessaire. Si un jour les projets doivent suivre d'un appareil à l'autre, ce sera une nouvelle table `keymaker.projets` (migration additive, dans la zone keymaker), sans toucher à l'existant.

### 3.2 Le code

Un dossier `src/features/remake/` :

- `store.js` — lire, créer, modifier, supprimer un projet (`km2:projets`), avec des fonctions pures testables.
- `Remake.jsx` — trois écrans : la liste des projets ; la décomposition (les couches et les huit questions) ; l'atelier d'une couche (l'éditeur, les couches déjà faites jouées en dessous).
- `assemble.js` — fabrique le code complet à partir des couches : le tempo en tête (`setcpm`), puis une piste `$:` par couche faite. Les couches en cours ou coupées sont préfixées par `_$:`.

### 3.3 Le branchement

Trois points de contact, tous déjà prévus :

1. **La route.** Dans `src/App.jsx`, la fonction `resolve()` associe une adresse à un écran. On y ajoute un cas `atelier` (liste), `atelier/<id>` (décomposition) et `atelier/<id>/<couche>` (atelier, avec `dock: true`). Un commentaire en tête du fichier signale ce point d'extension.
2. **L'éditeur.** L'atelier d'une couche prend possession de l'éditeur avec `dock.claim({ key: 'remake:' + projet + ':' + couche, code, onRan })`. Le code de la couche est sauvegardé dans le projet à chaque lecture (`onRan`), comme le fait le Studio.
3. **L'entrée.** Un cinquième onglet n'est pas souhaitable (quatre lieux, pas plus). L'atelier s'ouvre depuis le **Studio** (« Refaire un morceau ») et depuis la page d'un **genre** (« Refaire un morceau de ce style »), qui pré-remplit les couches avec les traits du genre comme points de départ.

### 3.4 La comparaison

L'app ne peut pas lire un fichier audio protégé ni un service de streaming. La comparaison reste donc manuelle et honnête : un bouton joue ta version ; tu lances l'original de ton côté ; un champ de notes par couche recueille les écarts. Plus tard, si tu disposes d'un fichier audio à toi, Strudel sait le charger (`samples({ original: '…' })`) : l'atelier pourrait alors alterner les deux d'un bouton. C'est une extension, pas un prérequis.

## 4. Ce qu'il ne faut pas faire

- **Ne pas fournir de transcriptions** de morceaux existants : les exemples de l'app restent des créations originales. C'est toi qui refais, à l'oreille.
- **Ne pas dépendre de Sati.** Elle pourra proposer une décomposition ou commenter une couche quand elle est joignable ; l'atelier doit fonctionner sans elle.
- **Ne pas affirmer** le tempo ou la tonalité d'un morceau réel : ce sont des champs que tu remplis.

## 5. Estimation

La partie données et assemblage est petite (environ 150 lignes). L'essentiel du travail est dans les trois écrans et dans le soin apporté à la décomposition, qui est un vrai sujet pédagogique : comment apprendre à quelqu'un à entendre séparément les couches d'un morceau. C'est par là qu'il faudra commencer.
