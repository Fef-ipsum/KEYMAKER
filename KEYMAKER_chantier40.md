# Chantier 40 — Responsive tablette & téléphone

> **FAIT le 10 juin 2026** (session C40+C42). Répond à P1 de l'audit — condition du
> Chantier 34 : l'app est dans la poche depuis le 10 juin, elle est maintenant **utilisable** dedans.

## Tablette ≤ 880px (cible n°1 : Galaxy Tab A9+, on code dessus)

- **Topbar compacte** : libellés avalés (`font-size: 0` sur `.tb-btn`, l'icône SVG reste), fil d'Ariane masqué (l'info vit dans la nav du bas), touch targets **44px**.
- `.btn` ≥ 46px, raccourcis clavier (`.btn-kbd`) masqués, panneaux latéraux (Parcours/Accueil/Réglages/Quiz/Révision) **plein écran**.
- Le stage était déjà fluide (`min(880px, 100%)`) — rien à casser.

## Téléphone ≤ 600px : mode CONSULTATION (vision d'origine)

- **Éditeur replié par défaut** (`matchMedia` au boot) — le DOM reste MONTÉ (règle d'or : l'éditeur n'est jamais recréé), seul le cadre est masqué en CSS. **Run/Stop restent visibles** : on lit le flash et on ÉCOUTE l'exemple sans éditer.
- Bouton **« ⌨ Voir le code »** pour déplier (invisible au-delà de 600px) ; le Mode Focus force l'affichage du code même replié.
- En consultation : partage/viz/PO-33 masqués ; nav bas en 2 gros boutons pleine largeur, points au-dessus ; quiz/révision avec choix ≥ 50px — le SRS du C38 se fait très bien au pouce en pause.
- Fix au passage : `.quiz-panel` héritait du drawer 440px → `width: min(720px, 96vw)`.

## Vérifié (smoke `chantier40/smoke_responsive.mjs`, 3 viewports)

1280/800/390 : **aucun débordement horizontal**, topbar icônes + 44px à 800, éditeur replié + toggle fonctionnel + Run visible à 390, zéro erreur JS. Déployé sur le Pi dans la foulée.
