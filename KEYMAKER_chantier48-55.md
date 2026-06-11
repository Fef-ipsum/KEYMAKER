# Keymaker — Chantiers 48 à 55 : la passe « contenu » de l'audit (11 juin 2026)

> Cahier des charges : `KEYMAKER_audit_lecons_2026-06-11.md`. Tout livré en une session,
> build + smoke playwright + déploiement Pi OK. **181 → 186 flashs.**

## Ce qui a été fait

### C50 — Passe de corrections ponctuelles (lessons.js + module7.js)
- **M3 3.7** : « 48 = do central (c3) » → « 48 = do (c3), une octave SOUS le do central (c4 = 60, cf. M1 4.1) ». La dernière trace du bug d'octave.
- **M5 5.13** : le `|` n'est plus présenté comme « vu en M1 » (c'était faux) — re-décrit comme nouveauté de mini-notation.
- **M1 2.6** : l'exemple à virgule (`bd sd, [~ <sd cp>]*2`) utilisait la virgule un flash avant son introduction → remplacé par un exemple pur < >, et déplacé dans le décode de 2.7 (où la virgule est enseignée).
- **M1 5.4** : la basse `<c2 ab1 f1 g1>` n'est plus une « alternance d'accords » mais « de notes SEULES — les fondamentales ».
- **M3 3.17** : `.fast(2)` de l'exercice désormais glosé (« accélère tout le motif ×2, détaillé au M5 »).
- **M7 7.12** : le décode dit maintenant `samples({ amen: url })` (aligné sur le code) + renvoi M6 6.16.
- **M2 2.9 et 2.25** : parenthèse « le filtre lpf sera expliqué au Module 4 ».
- **M1 3.3** (bonus §2b de l'audit) : la combinaison `<…>*n` enfin nommée dans le décode.

### C49 — Flash « rythmes euclidiens » : **5.9b** (M5 ch.2, entre ply 5.9 et le récap 5.10)
`(k,n)` répartit k coups sur n pas ; code `sound("bd(3,8), hh*8")` ; (3,8) = tresillo ; rotation (k,n,r) ;
théorie clave/cinquillo/bossa. Renvois ajoutés : décode de **M4 4.25** et **M6 6.25** (qui utilisaient
`(3,8)` sans jamais l'avoir enseigné) + une ligne `(k,n)` dans la table récap de 5.10.

### C52 — Flash « les modes » : **2.14b** (M2 ch.3, juste après la relative 2.14)
Dorien / phrygien / éolien, code à alternance `scale("<C:minor C:dorian C:phrygian>")`, lien guitare
(penta + 6te majeure = dorien). Justifie enfin les `C:dorian` suggérés en exercice par 5.25/6.25/7.25.

### C55 — Syntaxe de scène : 3 flashs dans M7 (chacun dans le chapitre de son genre)
- **7.6b** (Techno) — `penv`/`pdecay` : le kick synthétique façon 909, accordable à la tonalité.
- **7.17b** (Trance) — `arp("0 1 2 3")` : l'arpégiateur (syntaxe par INDICES, conforme à la référence §13 — pas de "up/down" en Strudel).
- **7.23b** (Ambient) — le polymètre `{a b, c d e}%n`, relié aux tape loops d'Eno.
(`compressor` non couvert : optionnel dans l'audit, faible valeur pour le profil — assumé.)

### C53 — Dégraissage M2 ch.1 (redondance avec M1 ch.4)
**Aucun id supprimé** (le SRS les référence). Les concepts de 2.2, 2.4 et 2.5 sont réécrits en
« rappel express (M1 4.x) + approfondissement » : 2.2 → ancrage do-ré-mi↔CDE, 2.4 → le piège mi-fa/si-do,
2.5 → l'équivalence d'octave. Les tables théorie (la vraie valeur ajoutée) sont conservées.

### C51 — Capsules culture « 🎧 À écouter » (15 flashs)
Nouveau champ optionnel `culture: { artist, track, why }`, rendu dans App.jsx (carte pointillée
discrète après la théorie, CSS `.card.culture`). Les 15 : M1 1.1 (DJ_Dave, live coding) · M1 5.4
(Jeff Mills — The Bells) · M2 2.25 (Energy 52 — Café del Mar) · M3 3.25 (Front 242 — Headhunter) ·
M4 4.25 (Phuture — Acid Tracks) · M5 5.25 (Aphex Twin — Xtal) · M6 6.25 (Mr. Fingers — Can You Feel It) ·
M7 7.1 (Frankie Knuckles — Your Love) · 7.4 (Derrick May — Strings of Life) · 7.6 (Plastikman — Spastik) ·
7.9 (Daft Punk — One More Time) · 7.12 (The Winstons — Amen, Brother) · 7.13 (Reese — Just Want Another
Chance) · 7.17 (System F — Out of the Blue) · 7.21 (Brian Eno — Music for Airports).

### C48 — Glossaire bilingue (`src/Glossary.jsx`)
- **368 entrées, zéro donnée dupliquée** : construit au montage en parcourant les `theory.items`
  de tous les flashs ; déduplication par terme (accents ignorés), première définition gardée,
  référence du flash source affichée (« M5 · 5.9b »).
- Recherche insensible aux accents (« reverb » trouve « réverb »), liste alphabétique, lecture seule (v1).
- Overlay au patron `.learn-overlay`/`.learn-panel` ; bouton « 📖 Glossaire » dans l'Accueil
  (à côté de « Mes snippets ») ; Échap ferme (intégré au gestionnaire existant d'App.jsx).
- CSS en append de styles.css (`.glossary-search/-item/-term/-def/-src`, responsive ≤600px).

## Ce qui n'a PAS été fait — et pourquoi
- **C54 (renumérotation des ids de flashs)** : les ids (`'1.4'`, `'7.12'`…) sont les CLÉS du système
  de répétition espacée (srs.js : mastery + boîtes Leitner) et de la banque de quiz. Les changer
  casserait la progression réelle de Felix. Les 5 nouveaux flashs utilisent des ids *suffixés*
  (5.9b, 2.14b, 7.6b, 7.17b, 7.23b) précisément pour ne décaler aucun id existant.
- Audit §1 (découpage M8 8.4, décodage par section de 7.18/7.20) : hors périmètre de cette passe.

## Vérifications
- `lessons.js` charge : **8 modules, 186 flashs**, aucun doublon (module|id), ordre des anciens ids
  intact vs `git HEAD` (vérifié par script).
- Build vite OK (chunk lessons 218 Ko) ; **smoke playwright OK** : boot sans pageerror, glossaire
  368 entrées, filtre OK, Échap OK, capsule culture rendue sur 1.1.
- Déployé sur le Pi (`/keymaker/app/` → HTTP 200).
