# Chantier 43 — Défi du jour

> **FAIT le 11 juin 2026.** E6 de l'audit : l'anti-page-blanche pour les jours sans énergie.

- Carte **« 🎲 Défi du jour »** sur l'Accueil : un défi **déterministe par date** (hash de la date → banque locale de 16 défis : 8 nouveaux `DAILY_CHALLENGES` + les 8 du Mode Flow). Même défi toute la journée, un autre demain. **Zéro appel IA, zéro latence, marche hors-ligne** — la route Opus reste l'apanage du Flow.
- **« Relever »** charge le code de départ dans l'éditeur et ferme l'Accueil → on joue tout de suite. Marqué « ✓ relevé » (localStorage `keymaker:daily`) — honnêteté simple, pas de streak de défis.
- Pur et testé : `dailyChallenge(dateStr)` / `isDailyDone` dans `flow.js`.
