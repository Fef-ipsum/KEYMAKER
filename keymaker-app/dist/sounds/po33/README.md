# Tes samples PO-33

Dépose ici les sons que tu exportes de ton Pocket Operator PO-33 KO
(fichiers `.wav` de préférence, mono ou stéréo).

## Workflow
1. Enregistre un son sur le PO-33 (micro intégré, jack, vinyle…).
2. Exporte-le en audio (jack line-out → enregistreur / carte son).
3. Dépose le `.wav` dans ce dossier (`public/sounds/po33/`).
4. Dans l'éditeur Strudel de Keymaker :

   ```js
   samples({
     kick:  '/sounds/po33/kick.wav',
     snare: '/sounds/po33/snare.wav',
     break: '/sounds/po33/break.wav',
   })
   // puis :
   s("kick snare kick snare")
   ```

Les chemins commencent par `/sounds/po33/...` (servis à la racine de l'app).
Nomme tes fichiers simplement (sans espaces ni accents) : `kick.wav`, `hat1.wav`, `break_amen.wav`.

> Ces sons restent 100 % locaux : ils ne quittent jamais ta machine.
