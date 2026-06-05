# Keymaker — Chantier 2 : Chapitre 1 complet

> **Brief de démarrage.** À ouvrir en début de nouvelle conversation.
> Felix : ouvre une conv dans le projet et dis simplement « **on attaque le Chantier 2** ».
> Claude relit `KEYMAKER_roadmap.md` + ce fichier, puis propose un plan en micro-étapes.

---

## 🎯 Objectif du chantier

Transformer le prototype mono-écran (Flash 1.1) en **Chapitre 1 complet et navigable** :
les **5 flashs** de « Premier contact » + une **navigation** Learn → Chapitre → Flash.

À la fin : on parcourt les 5 flashs avec Précédent / Suivant, on voit sa progression (ex. 3/5),
et chaque flash a son propre code dans l'éditeur.

---

## ✅ Ce qui est déjà fait (Chantier 1)

- App React + Vite + PWA dans `keymaker-app/`, thème Void, éditeur Strudel embarqué.
- **Flash 1.1 jouable** (premier son) + boutons Run/Stop + LED synchronisée (clavier inclus).
- Lancement : double-clic `keymaker-app/start.bat`.
- Détails techniques et pièges → `KEYMAKER_roadmap.md` § « Décisions techniques ».

---

## 🗂️ État du code (où est quoi)

```
keymaker-app/src/
├─ App.jsx            ← écran unique du Flash 1.1 (à généraliser en navigation)
├─ StrudelEditor.jsx  ← wrapper du moteur Strudel (réutilisable tel quel)
├─ lessons.js         ← contient flash11 (à étendre : tout le Chapitre 1)
└─ styles.css         ← thème Void + composants (cards, boutons, LED, status)
```

- `StrudelEditor` expose : `onReady(editor)`, `onPlayingChange(bool)`, `initialCode`.
- L'objet `editor` (StrudelMirror) a : `evaluate()`, `stop()`, **`setCode(code)`**, `setFontSize()`.

---

## 🧩 Le contenu est déjà écrit

Les 5 flashs sont **entièrement rédigés** dans `KEYMAKER_module1.md` → Chapitre 1 :

1. **1.1** — Le live coding & le premier son — `sound("casio")`  *(déjà codé)*
2. **1.2** — La boucle Run / Stop — `sound("metal")`
3. **1.3** — La banque de sons — `sound("insect")` (+ wind, jazz, crow…)
4. **1.4** — Les sons de batterie — `sound("bd hh sd oh")`
5. **1.5** — Variantes : `:n` et `bank()` — `sound("bd hh sd oh").bank("RolandTR909")`
   + **Exercice libre** de fin de chapitre.

→ Pas de recherche de contenu à faire : juste le transposer en données + écrans.

---

## 🪜 Plan proposé (micro-étapes, à valider en début de conv)

1. **Données** : étendre `lessons.js` → structure `chapitre1 = { titre, flashs: [ {id, titre, concept, code, decode[], exercice} ] }`. Y mettre les 5 flashs.
2. **Composant `Flash`** : extraire l'écran actuel de `App.jsx` en un composant réutilisable qui prend un objet flash en prop (Concept / éditeur / Run-Stop / Décodage / Exercice).
3. **Navigation** : un état `flashIndex` dans `App.jsx`, + barre **Précédent / Suivant** + indicateur **n/5** + fil d'Ariane.
4. **Éditeur partagé** : garder **une seule** instance d'éditeur et appeler `editor.stop()` puis `editor.setCode(flash.code)` au changement de flash (voir piège ci-dessous).
5. **Écran Learn** (léger) : liste des chapitres/flashs → clic ouvre un flash. (Home complète = plus tard.)
6. **Vérif** : build propre + smoke test (navigation entre flashs, LED OK, code change bien).

---

## ⚠️ Pièges techniques à garder en tête

- **Ne pas recréer l'éditeur à chaque flash** : chaque `<strudel-editor>` recharge le prebake/worklets (lourd). Garder une instance et utiliser `setCode()`. Au changement de flash : `stop()` d'abord, puis `setCode()`.
- **État play/arrêt** : toujours via l'événement `update` (`e.detail.started`), jamais via le clic (sinon le clavier désynchronise — c'était le bug du Chantier 1).
- **Dossier OneDrive** : la suppression de fichiers est protégée. Le build se fait dans le sandbox, on copie ensuite (la copie miroir `rsync --delete` fonctionne maintenant, la suppression a été autorisée pour le dossier).
- **Mobile** : rappel — pas d'éditeur sur téléphone (lecture seule). Pas bloquant pour ce chantier (on dev sur PC).

---

## ❓ À trancher au début de la conv (3 petites questions)

1. **Navigation** : état React simple (recommandé pour rester léger) ou `react-router` ?
2. **Progression** : on mémorise le dernier flash atteint dès maintenant (localStorage) ou on garde ça pour plus tard ?
3. **Déverrouillage** : on circule librement entre les flashs, ou il faut « valider » l'exercice pour débloquer le suivant ?

---

## 🏁 Definition of Done (Chantier 2) — ✅ LIVRÉ (2 juin 2026)

- [x] Les 5 flashs du Chapitre 1 sont navigables (Précédent / Suivant + n/5).
- [x] Chaque flash charge son propre code dans l'éditeur, le son marche.
- [x] LED play/arrêt OK partout (clavier + boutons).
- [x] Un écran Learn liste le chapitre et permet d'ouvrir un flash.
- [x] Build propre + test de montage/navigation sans erreur, livré dans `keymaker-app/`.
- [x] Roadmap mise à jour (Chantier 2 ✅, brief Chantier 3).

---

*Brief créé le 2 juin 2026, à la fin du Chantier 1.*
