# Keymaker — Chantier 16 : Tableau de bord & progression

> Réalisé **en autonomie** le 6 juin 2026, sur « lance les prochains chantiers ».
> Conçu, codé, buildé, testé, livré et documenté de bout en bout. Fait **dans la même
> session** que les Chantiers 20, 24 et 27.

---

## 🎯 Objectif

Donner à Felix un **écran d'accueil** qui répond, en un coup d'œil, à « où j'en suis ? »
et « par où je reprends ? ». Aujourd'hui l'app s'ouvre directement sur le dernier flash —
efficace pour plonger, mais aucune **vue d'ensemble** ni **fil de motivation**.

**Le pourquoi (profil TDA).** L'orientation immédiate et un **gros bouton « Reprendre »**
réduisent la friction de démarrage ; un **streak honnête** (jours d'affilée) et des **%
par module** donnent une motivation visible **sans gamification lourde** (pas de points,
pas de badges, pas de notifications) — juste des chiffres vrais.

---

## ✅ Ce qui est livré

- Bouton **🏠 Accueil** dans la barre du haut (toujours disponible).
- **Ouverture automatique à la première visite du jour** : l'accueil s'affiche en
  overlay au-dessus du flash (l'éditeur reste monté dessous, **jamais recréé**), et se
  ferme instantanément (Échap, clic, bouton Reprendre) → retour au dernier flash, **sans
  rechargement** ni coupure du son.
- **Bandeau héro** : 🔥 **streak** (jours consécutifs) + **gros bouton « Reprendre »**
  (qui rappelle le module + flash courant).
- **Progression globale** : barre + « X / 151 flashs · N % » + « Y jours de pratique ».
- **Une carte par module** (1→6) : titre, sous-titre, barre de %, compteur `vus/total`,
  pastille « ici » sur le module courant, ✓ sur un module terminé. Clic → on saute au
  **1ᵉʳ flash non vu** de ce module (ou le 1ᵉʳ si tout est vu).
- Bouton **📌 Mes snippets** (pont vers le Chantier 27).
- **Suivi 100 % local** : aucun réseau, rien n'est envoyé.

---

## 🧠 Décisions (le « pourquoi » technique)

- **Nouveau module `progress.js`** (localStorage, best-effort). Forme stockée :
  `{ seen: { "m:c:f": ts }, days: ["YYYY-MM-DD"] }`. Les **flashs vus** sont des
  coordonnées stables `module:chapitre:flash` (mêmes clés que la reprise) → robustes au
  déverrouillage de chapitres. Les **jours** servent au streak et au compteur.
- **Helpers PURS exportés** (`computeStreak`, `moduleCompletion`, `summaryFrom`,
  `todayStr`, `firstUnseenIndex`) → testables hors navigateur. Le **streak tolère
  « aujourd'hui pas encore enregistré »** (compte depuis hier si besoin) : il ne casse
  pas juste parce qu'on calcule avant la 1ʳᵉ ouverture du jour.
- **Date locale** (pas UTC) → le « jour » de Felix, pas celui de Greenwich.
- **`markSeen` branché dans l'effet de persistance existant** (`[mod, chapitre, flash]`)
  → chaque flash atteint est marqué vu, idempotent (1ʳᵉ fois seulement).
- **Overlay = patron Parcours/Sati/Réglages** (`.learn-overlay`) → éditeur jamais
  recréé ; Échap géré par le même gestionnaire hiérarchisé (overlay d'abord, focus sinon).
- **`Dashboard.jsx` 100 % présentationnel** : `App` calcule le `summary` (lecture du
  stockage à l'ouverture, donc toujours frais) et passe les actions. Même découpage que
  l'URL Pi / la mémoire de Sati.
- **Zéro couleur en dur** : tout le CSS passe par `var(--…)` → Void / Clair / Matrix
  suivent automatiquement (barres, streak, cartes).

---

## 🛠️ Build & livraison

Pipeline robuste du projet : source reconstruite/éditée dans `/tmp` **depuis
`git archive HEAD`** (arbre committé byte-perfect, **hors pont fichiers**), build `vite`
là (binaires natifs Linux présents), `dist/` + sources recopiés sur le mont par `cp`
(write-through, **byte-identité vérifiée par sha256**), anciens bundles laissés orphelins
(non référencés). Livré **groupé avec les Chantiers 20, 24, 27** dans un seul bundle.

---

## 🧪 Vérifications (toutes vertes)

- **Build** `vite build` propre — **39 modules**, bundle `index-DR_TQsLb.js` (352,6 kB)
  + CSS `index-Dyesxukz.css` (31,2 kB) + PWA régénérée. `index.html`/`sw.js` à jour.
- **node — 33/33** : `progress.js` (streak : vide, today, +hier, trou, hier-sans-today ;
  `moduleCompletion` + borne ; `summaryFrom` ; `markSeen`/`recordToday`/`isFirstVisitToday`/
  `firstUnseenIndex`) + round-trip d'URL Strudel (C20) + **intégrité 151 flashs**.
- **jsdom — 15/15** (App réel monté, éditeur stubé) : bouton 🏠, **auto-ouverture 1ʳᵉ
  visite**, 6 cartes module, streak, Reprendre ferme, 🏠 rouvre, Échap ferme, recordToday
  (1 jour), markSeen sur navigation (Suivant → +1 flash vu).
- **Sentinelles** dans le bundle livré : `dash-overlay`, `dash-mod`, `home-btn`,
  `Accueil`, `Reprendre`, `keymaker:progress` ; CSS `.dash-streak`/`.dash-mod`/`.home-btn` ;
  3 accents thèmes présents.

---

## 🏁 État & reste à faire

- [x] `progress.js` + `Dashboard.jsx` + intégration App + CSS themable.
- [x] Auto-ouverture 1×/jour, streak, %, Reprendre, cartes module, pont snippets.
- [x] Build propre + `dist/` livré byte-identique + tests verts + sentinelles.
- [x] Docs à jour (roadmap, README, ce brief).
- [ ] **Commit + push** via `close_session.bat` (étape Windows : index git illisible
      côté sandbox, le push demande tes identifiants).

---

## 🔮 Et après ?

- **Stats de pratique (C29)** : temps par session, heures/semaine, sparkline 4 semaines —
  s'intègrent directement dans ce tableau de bord.
- **Répétition espacée (C23)** : un mode « Révision du jour » trouvera ici sa place.
- Possibilité d'un bouton « effacer mes stats » dédié (aujourd'hui « Reprendre à zéro »
  ne touche que la **position**, pas le suivi — choix délibéré pour ne pas perdre le streak).

---

*Brief écrit le 6 juin 2026 (réalisé en autonomie). Source ↔ build ↔ docs en phase.*
