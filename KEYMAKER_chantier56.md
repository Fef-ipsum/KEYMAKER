# Chantier 56 — Auto-validation + glossaire refait carré (11 juin 2026)

Trois corrections demandées par Felix, en une session.

## 1. Auto-validation d'une leçon (sans Sati)
**Pourquoi :** « Parfois Sati n'est pas claire ou me retient pour rien. »
**Fait :** `ExerciseCard.jsx` — un 2ᵉ bouton **« Je valide moi-même »** à côté de
« ✓ Vérifie mon exercice ». Il appelle le même `onPracticed(flash.id)` → le flash
passe à « pratiqué » (srs.js), la pastille du Parcours suit. **Sans IA, sans Pi**,
toujours disponible. Felix garde la main sur son parcours. Style discret/secondaire
(`.self-validate-btn`, ghost) pour ne pas voler la vedette à la vérif Sati.

## 2. Glossaire — REFAIT À LA MAIN (le gros morceau)
**Pourquoi :** l'ancien glossaire (C48) était **auto-extrait** des `theory.items` de
toutes les leçons : 425 paires aspirées sans filtre → 368 entrées dont une majorité
incompréhensibles hors contexte (« _piste$ », « A → D », « 1. Enregistrer »,
« ce qui change », « avantage », « const », « Câble Y »…). Des notes internes aux
leçons, pas du vocabulaire. Felix : « C'est quoi ce glossaire ?! Fais un truc carré. »

**Fait :**
- **`glossaryData.js`** (NOUVEAU) — source de vérité curée : **150 vrais termes**,
  écrits à la main, rangés en **10 thèmes** (Rythme & mini-notation, Notes & solfège,
  Intervalles & accords, Synthé & son, Effets & espace, Structure & arrangement,
  Aléatoire & génératif, Guitare, Fonctions & écosystème Strudel, Genres & culture).
  Définitions claires et **auto-suffisantes** (on comprend sans la leçon), bilingues
  FR↔EN, avec renvoi au flash source. Qualité > quantité.
- **`Glossary.jsx`** (RÉÉCRIT) — UI thématique : **chips de filtre** par thème,
  **recherche globale** (terme / anglais / définition, accents ignorés), sections
  avec en-tête collant. Plus d'auto-extraction.
- Ancien `buildGlossary()` supprimé (aucune autre référence dans le code).

## 3. Annotations du glossaire (notes mnémotechniques)
**Pourquoi :** « Que je marque des petites notes mnémotechniques. »
**Fait :**
- **`glossaryNotes.js`** (NOUVEAU) — persistance `localStorage`
  (`keymaker:glossnotes`, clé = `catId:terme replié`). Helpers purs
  (`upsertNote`/`removeNote`) testables ; best-effort comme progress.js/srs.js.
- Dans `Glossary.jsx` : sous chaque terme, **« + Ajouter une note »** → textarea
  (⌘/Ctrl+↵ enregistre, Échap annule sans fermer l'overlay), affichage 📝, ✏️ éditer,
  🗑 supprimer. La note survit au reload.

## Détails techniques
- CSS : nouveau bloc glossaire (chips, sections, zone d'annotation) remplace l'ancien
  bloc C48 dans `styles.css`. En-tête de section `pointer-events: none` (il n'a aucun
  bouton) → n'intercepte plus les clics des items collés dessous (corrigé après smoke).
- App du Pi servie depuis `webapp/` (volume :ro) — déployé par `vite build
  --base=/keymaker/app/` → `tar`/`scp`/extract. App locale `dist/` rebâtie (base=/).

## Vérifs
- Intégrité données : 150 termes, **150 clés uniques**, recherche accent-insensible OK.
- Helpers `glossaryNotes` : trim, suppression si vide, immutabilité — OK (node).
- Smoke Playwright (Chromium → URL ts.net du Pi, build live) : glossaire s'ouvre,
  **11 chips / 10 sections / 150 items**, recherche « kick » = 7, filtre Guitare = 8,
  annotation enregistrée et **persistée en localStorage** après reload, **0 erreur
  console**.

## Compteurs
- 186 flashs (inchangé). Glossaire : 368 entrées auto → **150 termes curés** (10 thèmes).
