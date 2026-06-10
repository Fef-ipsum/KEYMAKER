# Chantier 37 — Quiz de chapitre (active recall)

> **FAIT le 10 juin 2026** (session triple 37+38+39 : la boucle pédagogique complète).
> Répond à E1 de l'audit `KEYMAKER_analyse_2026-06-10.md` : « rien ne mesure l'apprentissage ».
> Un flash n'est plus « su » parce qu'il a été ouvert — il est su parce qu'il a été **testé**.

## Ce que ça fait

À la fin de chaque chapitre (dernier flash), une carte **« Quiz du chapitre »** propose 3-4 questions générées par Sati (Haiku) sur les flashs du chapitre. Le quiz est aussi relançable depuis le **Parcours** (bouton 🎯 sur tout chapitre dont les flashs sont tous vus).

- **Formats** : QCM (3 choix), Vrai/Faux, code à trous (`____` + propositions). Si la question porte un code, **▶ Écouter** le joue dans l'éditeur principal (déjà monté) — le code de Felix est capturé avant et **restauré à la fermeture**.
- **Feedback immédiat** : bonne réponse en accent, mauvaise en rouge, + 1 phrase d'explication (`explain`).
- **Fin de quiz** : score honnête, liste des flashs ratés (« ils reviendront en révision »), bouton **↻ Nouvelles questions** (regénération forcée).
- Chaque réponse alimente la **maîtrise** et la **répétition espacée** (Chantier 38) : réussi → `mastered` + boîte Leitner espacée ; raté → carte « à revoir demain ».

## Backend — `POST /keymaker/ai/quiz` (nouvelle route, `src/routes/learn.ts`)

- **JSON simple, pas de SSE** → le hook CORS d'`index.ts` s'applique normalement (aucun en-tête à reposer, contrairement au piège du chat hijacké).
- Corps : `{ moduleTitle, chapterTitle, flashs: [{id,title,concept,code,exercise}], count }` (flashs ≤ 10, champs bornés).
- Modèle **Haiku** (`MODELS.fast`), `max_tokens: 2000`, system dédié (pas la persona Sati) exigeant un **JSON strict** ; `extractJSON` tolère du texte autour ; **2 tentatives** si JSON invalide.
- **`sanitizeQuiz` côté serveur** : type connu, `flashId` ∈ flashs fournis (1 question max par flash), `answer` dans les bornes, champs tronqués. Le front **revalide** (défense en profondeur, `sanitizeQuestions` dans `learnApi.js`).
- Rate limit local 10/min. **Rien n'est journalisé** : un quiz n'est pas une conversation, la mémoire sémantique de Sati reste consacrée aux questions de Felix.

## Front

- `learnApi.js` — client JSON (`generateQuiz`, + helpers purs testés).
- `Quiz.jsx` — overlay (patron learn-overlay), expose aussi `QuestionCard` et `usePreviewAudio` (réutilisés par la révision du Chantier 38).
- **Banque locale** `keymaker:quizbank` (localStorage) : les questions générées sont conservées par chapitre → rouvrir le quiz = zéro latence, et la révision SRS pioche dedans **hors connexion**.
- App.jsx : carte CTA sur le dernier flash du chapitre + bouton 🎯 dans le Parcours + overlay.

## Vérifié (10 juin)

- Route live sur le Pi : 3 questions propres (mcq/fill variés, `answer` varié, explications bienveillantes) sur le chapitre 1 du Module 1.
- JSON malformé simulé → 2ᵉ tentative → sinon 502 propre (« Génération du quiz impossible ») et l'UI propose Réessayer / Plus tard.
- Build Vite OK ; sanitisation testée (6 questions brutes → 3 valides) dans `chantier38/test_srs.mjs`.

## Décisions

- **Pas de saisie libre** : tous les formats sont à choix → pas de faux négatifs de correction, friction minimale (TDA).
- Les questions d'écoute restent des QCM avec un code joué — le moteur audio est déjà là, aucun nouveau composant.
- La régénération est **manuelle** (bouton), pas automatique : la banque rend le quiz instantané, Felix choisit quand il veut du neuf.
