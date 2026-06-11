# Chantier 46 — Studio augmenté

> **FAIT le 11 juin 2026.** D4 (oscilloscope) + C4 (import communauté) de l'audit.

## D4 — Oscilloscope (〰 dans le Studio)

- **Le tap audio** : un script inline dans `index.html` (AVANT le moteur) capture le premier `AudioContext` créé (celui de superdough) et duplique vers un `AnalyserNode` toute connexion vers la destination — **copie du signal, jamais sur le chemin du son**, best-effort intégral. Exposé en `window.__keymakerTap`.
- `Oscilloscope.jsx` : canvas thème-aware (couleur = `--accent` courante), `getByteTimeDomainData` à 60 fps (≈5 fps si « réduire les animations »), ligne médiane discrète. Le tap n'existe qu'après le premier son → message d'attente + guet.
- Pédagogie Module 4 : on VOIT enfin ce que `lpf`, l'ADSR et les formes d'onde font au son.

## C4 — Import strudel.cc

Champ « Colle une URL strudel.cc/#… » dans le Studio : `hash2code` (l'inverse exact du `code2hash` du Chantier 20 — base64 → texte) → le pattern de DJ Dave & co s'ouvre dans l'éditeur du Studio, prêt à désosser. Vérifié bout-en-bout au smoke.

## Au passage (B5)

`flashToast._t` (timeout accroché à la fonction) → `useRef` propre.

*Non fait, assumé : D2 (identités visuelles par module) — cosmétique lourd, à traiter seul si l'envie vient.*
