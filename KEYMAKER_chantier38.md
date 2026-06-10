# Chantier 38 — Maîtrise par flash + répétition espacée (Leitner)

> **FAIT le 10 juin 2026** (session triple 37+38+39).
> Répond à E2+E3 de l'audit : les 181 flashs deviennent un **système vivant** au lieu d'une bibliothèque.

## Les trois états de maîtrise (E3)

Au-delà de « vu » (progress.js, inchangé) :

| État | Comment on y entre | Affichage |
|---|---|---|
| `seen` | le flash a été ouvert | badge id discret |
| `practiced` | l'exercice validé par Sati (Chantier 39) | badge teinté accent |
| `mastered` | une question de quiz réussie (Chantier 37) | badge plein accent + ✦ |

Un échec au quiz **redescend** `mastered → practiced` (suivi honnête). Le Parcours colore chaque flash (pastilles + légende), les dots de navigation du chapitre suivent aussi.

## La révision (E2) — Leitner 3 boîtes, version simple qui marche

- **box 1** = revoir à J+1 · **box 2** = J+3 · **box 3** = J+7.
- Une **carte** naît au premier résultat de quiz sur un flash : réussi → box 2 (on espace d'emblée), raté → box 1 (demain). Réussite → boîte supérieure ; échec → retour box 1.
- **File du jour plafonnée à 5 cartes** (`REVIEW_LIMIT`) : une révision ≈ 3 minutes, jamais une montagne — contrat TDA.
- L'Accueil affiche **« 📬 X flashs à revoir »** → overlay `Review.jsx` : pour chaque carte, une **vraie question** de la banque de quiz si disponible (active recall), sinon **auto-évaluation** (« dis-le dans ta tête → révèle → je savais / à revoir »). Lien « Ouvrir la leçon → » sur chaque carte.

## Implémentation

- `srs.js` — logique **pure** (addDays, nextCard, applyResult, levelOf, dueList…) + stockage `keymaker:srs` (localStorage, best-effort) + banque `keymaker:quizbank`. **39 tests node** : `chantier38/test_srs.mjs`.
- **Clés = ids stables** (`'1.4'`) et non `m:c:f` → insérer un chapitre ne décalera jamais la maîtrise (recommandation « dette technique » de l'audit appliquée ici dès le départ). Pont indices ↔ ids : `FLASH_INDEX` calculé une fois dans App.jsx ; `seenKeys()` ajouté à progress.js pour croiser avec « vu ».
- `Review.jsx` réutilise `QuestionCard` + `usePreviewAudio` de Quiz.jsx (un seul rendu de question dans toute l'app).

## Vérifié (10 juin)

- 39/39 tests node (transitions Leitner, tri de la file — retard puis boîce basse, plafond, downgrade honnête, sanitisation).
- Parcours : pastilles + 🎯 Quiz sur chapitre complété ; Accueil : carte révision seulement si des cartes sont dues.

## Décisions

- **Leitner, pas SM-2** : 3 boîtes lisibles plutôt qu'un algo opaque — Felix peut comprendre où dort chaque flash.
- Les cartes naissent **du quiz uniquement** (pas de tout le curriculum d'un coup) : la file grandit au rythme réel de l'apprentissage, jamais 181 cartes le premier jour.
- Pas de notification : la carte de l'Accueil suffit (Felix ne veut pas de notifs — décision du 10 juin).
