# Chantier 47 — Offline & dettes

> **FAIT le 11 juin 2026.** P2 + B5/B6/B7 de l'audit.

## P2 — Vraiment hors-ligne

- **Précache complet** (vite-plugin-pwa/workbox) : coquille + **moteur Strudel vendorisé** + fonts + sons locaux = **23 entrées / 5,6 MB** installées par le service worker → l'app démarre et joue **dans le train**, première visite déjà faite.
- **Samples distants** (banques chargées à la demande) : règle `runtimeCaching` **CacheFirst** (`keymaker-samples`, 600 entrées max, 60 jours) sur les wav/mp3/ogg/json cross-origin → un son joué une fois reste disponible hors-ligne.

## Dettes réglées

- **B6** : IndexedDB passe en **v3** — l'upgrade recrée l'index `flashKey` du store `difficultes` pour les bases nées en v1 (la migration v2 ne re-vérifiait pas).
- **B7** : ménage — `styles.css.bak` (53 KB) et les `.fuse_hidden*` supprimés (via PowerShell, le mont bloque `rm`).
- **B5** (partiel) : `flashToast._t` → ref (cf. C46). Le polling de montage de l'éditeur reste tel quel (fonctionne, faible enjeu).

*Non fait, assumé : `lessons.js` en `import()` dynamique — touche FLATS/App en profondeur pour ~150 KB gzip ; à faire un jour calme, seul.*
