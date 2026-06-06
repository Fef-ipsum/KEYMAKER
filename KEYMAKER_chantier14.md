# Keymaker — Chantier 14 : Validation audio M3 → M7

> **Statut (6 juin 2026) — 🟡 moitié autonome LIVRÉE.**
> Fait sans Felix : l'**audit statique « risque silence »** des 125 codes + l'**outil d'écoute interactif**.
> **Reste (avec Felix, à son rythme) :** la passe d'écoute réelle au casque.

---

## Le problème (rappel de la roadmap)

Le curriculum est **complet** (176 flashs). Mais les codes des modules **3 à 7 (125 flashs)** ont été vérifiés
contre la doc Strudel — **pas tous écoutés**. C'est la **dette pédagogique critique** : un son muet, un
registre faux ou un mix déséquilibré sape une leçon sans qu'on le voie dans le code.

> Périmètre **étendu** : la roadmap disait « 100 flashs (M3→M6) ». M7 (Genres & Styles, 25 flashs) est arrivé
> après (chantier Electro) et n'a pas plus été écouté → **inclus ici** = 125 flashs.

---

## Ce qui a été fait en autonomie

### 1) Audit statique « risque silence » — `chantier14/audit.mjs`

Un script qui **importe les vraies données** (`keymaker-app/src/lessons.js`) et passe chaque code au crible
d'heuristiques **ancrées sur `KEYMAKER_strudel_reference.md` §8** (les gotchas déjà vérifiés à l'oreille avec toi) :

- **steel + note ≤ Fa2** → le bug du *Mi grave muet* (banque `gm_acoustic_guitar_steel`).
- **`.midi()` dans le code principal** → route vers un appareil externe = **muet en interne**.
- **`chop`/`slice`/`splice`/`fit` sans `samples()`** → un break externe non chargé = silence.
- **`mask` qui démarre sur des cycles à 0** → piste muette au début.
- **filtres / gain extrêmes** (`lpf`≤200, `hpf`≥6000, `gain(0)` ou ≤.15).
- **sons non standards** (typo → silence) — avec liste blanche des sons **déjà validés en M1/M2**.
- **équilibrage parenthèses / guillemets** (une erreur = pas de son du tout).
- **hasard** (`degrade`/`sometimes`…) et **registres extrêmes sur `gm_`** → notes d'écoute.

### Résultat : **0 risque HAUT** ✅

- **Aucune** récurrence du bug *steel + grave* (les 6 correctifs M3 tiennent, rien de neuf ne le réintroduit).
- **Aucun** code auto-joué en `.midi()` seul (les 3 `.midi()` du contenu sont dans du **texte explicatif**, le
  code joué garde toujours un `.s(...)` audible — exactement la règle de la référence).
- **Aucun** déséquilibre de syntaxe, **aucun** `gain(0)`, **aucun** son inconnu/typo.
- **Contre-vérifié au `grep` brut** sur la source, indépendamment de mon parseur.

➡️ Les codes sont **structurellement sains côté silence**. Ce qui reste à juger est **musical**
(le registre, l'équilibre, « est-ce que ça sonne *bien* ») → **ça, seules tes oreilles le tranchent.**

### Les 9 flashs « à écouter en priorité »

Les seuls qui présentent un risque non trivial (découpe de samples + leçon `mask` + final génératif) :

| Flash | Pourquoi le surveiller |
|---|---|
| **6.13** | leçon `mask` — la piste est volontairement muette quelques cycles, vérifier qu'elle revient bien. |
| **6.17 / 6.18** | `chop` / `slice` du break `amen` (`samples("github:yaxu/clean-breaks")`) — dépend du téléchargement réseau. |
| **7.3 / 7.5** | vocal chop du sample `numbers` — confirmer qu'il charge et sonne. |
| **7.12 / 7.15** | breakbeat D&B (break + `iter` + sub grave) — vérifier que le sub est audible. |
| **7.24** | granular ambient (`chop` + `slow` + grosse réverb) — vérifier que ça ne se noie pas. |
| **7.25** | **projet final génératif** (~5 min, accords + `superimpose` + hasard) — le plus complexe. |

> Point d'attention transverse : les flashs « chop » dépendent de la **disponibilité des samples**
> (`numbers`, `space`, breaks). L'écoute est ce qui confirme qu'ils se chargent vraiment.

### 2) L'outil d'écoute — `KEYMAKER_validation_audio.html`

Un **fichier autonome** (double-clic → navigateur, marche hors-ligne, aucune dépendance). Pensé TDA-friendly :

- Les **9 suspects en tête** (panneau cliquable) + le **parcours module par module**.
- Par flash : le **code**, un bouton **« Copier »**, un statut **À écouter / ✓ OK / ⚠️ Problème**, un **champ note**.
- **Progression sauvegardée toute seule** (localStorage) — tu peux fermer et reprendre.
- **Filtres** (Suspects / À écouter / OK / Problèmes) + barre de progression + compteur.
- Bouton **« Exporter les problèmes »** → copie une liste propre (id + code + ta note) à coller dans Notion
  ou dans une prochaine session « on corrige ».

---

## Mode d'emploi — la passe d'écoute (à ton rythme, pas besoin de tout faire d'un coup)

1. Ouvre **`KEYMAKER_validation_audio.html`** (double-clic) à côté de Keymaker.
2. Commence par les **9 suspects** du panneau du haut.
3. Pour chaque flash : ouvre-le dans Keymaker → **Ctrl+Entrée** → écoute. Ça va → **✓ OK**. C'est bizarre → **⚠️ Problème** + une note courte.
4. Ensuite déroule **module par module** quand tu veux. La progression est gardée.
5. Quand tu as des ⚠️ : **« Exporter les problèmes »** → on ouvre une session dédiée et on corrige la liste ensemble.

---

## Vérifications

- **`audit.mjs`** : import des données réel (125 flashs M3→M7) ; **0 HAUT / 9 MOYEN / 14 bas / 102 rien** ;
  faux positifs nettoyés (multiplicateurs `*4`, banques, `8?`, contretemps `struct`, basses de synthé) ;
  recoupé au `grep` brut (`.midi(`, `gm_acoustic_guitar_steel`, `samples(`).
- **HTML** : syntaxe JS valide (`node --check`) + **smoke test DOM simulé** → 125 cartes, 30 en-têtes
  (5 modules + 25 chapitres), 9 suspects, persistance localStorage OK.

## Fichiers du chantier

- `KEYMAKER_validation_audio.html` — **l'outil d'écoute** (ce que tu utilises).
- `chantier14/audit.mjs` — le moteur d'audit (rejouable si le contenu change : `node chantier14/audit.mjs`).
- `chantier14/audit_data.json` — le résultat de l'audit (alimente l'outil).
- `chantier14/gen_html.mjs` — régénère l'outil depuis les données (`node chantier14/gen_html.mjs`).

## Definition of Done

- [x] Audit statique des 125 codes, ancré sur la référence, faux positifs nettoyés, contre-vérifié.
- [x] Outil d'écoute interactif livré, vérifié (syntaxe + smoke test).
- [x] Doc + roadmap à jour.
- [ ] **Passe d'écoute des 125 flashs avec Felix** (suspects d'abord) → marquage OK/Problème.
- [ ] Session de correction des ⚠️ remontés.
