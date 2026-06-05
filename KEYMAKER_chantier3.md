# Keymaker — Chantier 3 : le reste du Module 1

> **Brief de démarrage.** À ouvrir en début de nouvelle conversation.
> Felix : ouvre une conv dans le projet et dis simplement « **on attaque le Chantier 3** ».
> Claude relit `KEYMAKER_roadmap.md` + ce fichier, puis propose un plan en micro-étapes.

---

## 🎯 Objectif du chantier

Passer d'**un** chapitre navigable à **tout le Module 1** : ajouter les chapitres 2 à 5
et permettre de **circuler entre les chapitres** (pas seulement entre les flashs d'un chapitre).

À la fin : l'écran Learn liste les 5 chapitres, on ouvre n'importe quel flash, et on enchaîne
de la fin d'un chapitre au début du suivant.

---

## ✅ Ce qui est déjà fait (Chantiers 1 & 2)

- App React + Vite + PWA, thème Void, **éditeur Strudel unique** réutilisé entre les flashs.
- **Chapitre 1 complet** : 5 flashs navigables (Précédent/Suivant + n/5), écran Learn (overlay), reprise localStorage.
- Le **moule** est posé : un flash = un objet de données ; un composant `Flash` data-driven.
- Détails techniques et pièges → `KEYMAKER_roadmap.md` § « Décisions techniques (Chantier 1 & 2) ».

---

## 🗂️ État du code (où est quoi)

```
keymaker-app/src/
├─ App.jsx            ← état flashIndex + nav + overlay Learn (à étendre : multi-chapitres)
├─ Flash (dans App)   ← écran data-driven : concept / éditeur / decode / theory / exo / free
├─ StrudelEditor.jsx  ← wrapper du moteur (réutilisable tel quel)
├─ lessons.js         ← `chapitre1 = { flashs:[…5…] }` (à généraliser : module1 = { chapitres:[…] })
└─ styles.css         ← thème Void + cartes + nav + points + overlay Learn
```

- Un flash supporte déjà : `kicker`, `concept`, `code`, `decode[]`, `theory{title,items[]}`, `exercise`, `free`.
- Le code de l'éditeur peut être **multi-lignes** (ex. `setcpm(45)\nsound("bd sd")`) → `setCode()` gère.

---

## 🧩 Le contenu est déjà écrit

Les chapitres 2 à 5 sont **entièrement rédigés** dans `KEYMAKER_module1.md` :

2. **Le rythme** — la mini-notation (7 flashs) : séquences, silences, `[ ]`, `*` / `/`, `< >`, virgule.
3. **Le pouls** — tempo & cycles (3 flashs) : `setcpm`, cpm↔BPM.
4. **La hauteur** — notes & gammes (7 flashs) : `note`, lettres, octaves, `#`/`b`, `@`/`!`, accords, `scale`.
5. **L'assemblage** — empiler (4 flashs) : `stack`, `$:`, `_$:`, bilan.

→ Pas de recherche de contenu : juste transposer en données. ⚠️ Quelques flashs ont du **code multi-lignes**
et des **tableaux récap** en fin de chapitre (mini-notation, gammes).

---

## 🪜 Plan proposé (micro-étapes, à valider en début de conv)

> Recommandation TDA-friendly : **ne pas tout faire d'un coup**. On livre par tranches qui marchent.

1. **Structure multi-chapitres** : `lessons.js` → `module1 = { titre, chapitres: [chapitre1, …] }`. Chapitre 1 inchangé, juste rangé dedans.
2. **Navigation globale** : Précédent/Suivant traversent les chapitres (fin de chap. → 1er flash du chap. suivant). Indicateur adapté (ex. « Chap 2 · 3/7 »).
3. **Écran Learn** : lister les **5 chapitres** repliables avec leurs flashs (le flash courant surligné).
4. **Chapitre 2 « Le rythme »** : saisir les 7 flashs (1er gros test du moule sur du code multi-lignes + tableau récap).
5. **Vérif** : build + smoke test (nav inter-chapitres, reprise, `setCode` multi-lignes).
6. *(Tranches suivantes)* Chapitres 3, 4, 5 — même moule, surtout du contenu. À enchaîner ou à étaler.

---

## ⚠️ Pièges techniques à garder en tête

- **Toujours une seule instance d'éditeur** : la reprise localStorage doit maintenant stocker *chapitre + flash* (ex. `"c2.f3"`), pas juste un index. Garder la circulation libre.
- **Code multi-lignes** : vérifier que `setCode()` reçoit bien les `\n` et que l'éditeur affiche/joue (ex. `setcpm(45)` sur sa ligne).
- **Tableaux récap** : prévoir un petit type de carte « tableau » (ou réutiliser `theory`/`decode` en liste) — à trancher.
- **Ne pas recréer l'éditeur** en changeant de chapitre (même règle qu'au Chantier 2 : overlay Learn, pas de `key`).
- **Livraison** : build dans le sandbox, copie de `dist/` ; le mount OneDrive peut être en retard **en lecture** → passer par `outputs` comme tampon et **vérifier les fichiers livrés**.

---

## ❓ À trancher au début de la conv (3 petites questions)

1. **Découpage** : on fait tout le reste du Module 1 d'un coup (chap. 2-5, ~21 flashs), ou **structure + Chapitre 2 d'abord** (recommandé), puis 3-5 en tranches ?
2. **Navigation inter-chapitres** : « Suivant » enchaîne **automatiquement** sur le chapitre suivant (recommandé, plus fluide), ou chaque chapitre reste fermé (on change via Learn) ?
3. **Tableaux récap de fin de chapitre** : carte « tableau » dédiée maintenant, ou **liste simple** pour l'instant (recommandé, on raffinera) ?

---

## 🏁 Definition of Done (Chantier 3 — tranche 1) — ✅ LIVRÉ (3 juin 2026)

- [x] `lessons.js` en structure multi-chapitres (`module1.chapitres`), Chapitre 1 intact.
- [x] Navigation Précédent/Suivant traverse les chapitres ; indicateur « Ch.N · n/m ».
- [x] Écran Parcours liste les 5 chapitres (repliables) et leurs flashs ; 3-5 « à venir ».
- [x] **Chapitre 2 « Le rythme »** complet et jouable (7 flashs + table récap mini-notation).
- [x] Reprise localStorage = chapitre + flash (`{c,f}`) + migration de l'ancienne clé. Build propre + smoke test (23 assertions, tout vert).
- [x] Roadmap mise à jour (Chantier 3 tranche 1 ✅, tranche 2 = chapitres 3-5 planifiée).

> Note : `setCode()` gère le multi-lignes (vérifié), mais le Chapitre 2 est en code une-ligne ;
> le multi-lignes sera réellement exercé au **Chapitre 3** (`setcpm(...)` sur sa propre ligne), en tranche 2.

---

## 🏁 Definition of Done (Chantier 3 — tranche 2) — ✅ LIVRÉ (3 juin 2026)

- [x] **Chapitre 3 « Le pouls »** (3 flashs) — `setcpm`, cpm ↔ BPM, **code multi-lignes** réellement exercé.
- [x] **Chapitre 4 « La hauteur »** (7 flashs) — `note`, lettres, octaves, `#`/`b`, `@`/`!`, accords, `n()`+`scale()`.
- [x] **Chapitre 5 « L'assemblage »** (4 flashs) — `stack()`, `$:`, `_$:`, bilan du module (empilement multi-couches).
- [x] 3 tables récap supplémentaires (ch.3, ch.4) + exercices libres de fin de chapitre.
- [x] **Module 1 entier : 26 flashs, 5 chapitres**, tous déverrouillés dans le Parcours.
- [x] Build propre (30 modules) + smoke test (30/30 assertions). Roadmap mise à jour, brief Chantier 4 créé.

> Le Chantier 3 est **clos** : tout le Module 1 est jouable. Prochain chantier → le Pi (`KEYMAKER_chantier4.md`).

---

*Brief créé le 2 juin 2026, à la fin du Chantier 2. Tranche 2 close le 3 juin 2026.*
