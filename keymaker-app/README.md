# Keymaker 2

Application en français pour apprendre **Strudel** (la musique par le code) et le **solfège** en même temps. Elle s'installe comme une app sur téléphone, tablette et PC, et fonctionne **entièrement hors ligne** ; seule l'assistante Sati a besoin du réseau.

## Ouvrir l'app

- **Depuis n'importe quel appareil connecté à Tailscale** : `https://personal-os.tailac998e.ts.net/keymaker/app/`
- **En local sur le PC** : double-clic sur `start.bat` (ouvre `http://localhost:4321`). Au premier lancement, le script construit l'app ; il faut Node.js.

Pour l'installer : sur Android (Chrome), menu ⋮ puis « Installer l'application » ; sur iPhone et iPad (Safari), bouton Partager puis « Sur l'écran d'accueil » ; sur PC (Chrome ou Edge), icône d'installation à droite de la barre d'adresse. À la première ouverture en ligne, l'app télécharge ses sons (environ 35 Mo) ; l'avancement est visible dans Réglages → Hors ligne.

## Ce qu'il y a dedans

| Lieu | À quoi il sert |
|---|---|
| **Aujourd'hui** | Un seul bouton pour reprendre, et « J'ai 10 / 20 / 40 minutes ». |
| **Parcours** | Les fondations (8 chapitres), puis les approfondissements facultatifs (leçons de l'app d'origine). |
| **Genres** | Techno, Acid, Trance, Progressive, Synth-pop : huit traits par genre, à entendre, comprendre et reconstruire ; un comparateur. |
| **Wiki** | Chaque fonction, signe et notion. L'essentiel d'abord, le détail sur demande. Inclut la documentation officielle de Strudel 1.3.0. |
| **Studio** | Bac à sable libre, codes gardés, défis. |

## Organisation du code

```
src/
  main.jsx, App.jsx        démarrage, navigation, éditeur unique
  ui.jsx                   composants partagés
  views/                   un fichier par écran
  components/              l'éditeur (EditorDock) et Sati
  lib/                     moteur, validation des exercices, progression, hors ligne, migration
  content/
    fondations/            les 8 chapitres (ch1.js … ch8.js) et les solutions des exercices
    genres/                un fichier par genre + index.js (le registre)
    wiki/                  entrées rédigées + reference.json (doc officielle extraite du moteur)
    legacy/                leçons et glossaire de l'app d'origine, conservés
    registry.js            l'index de tout le contenu (utilisé par l'app et par les tests)
  sw.js                    service worker (écrit à la main)
public/
  vendor/strudel-repl/     le moteur Strudel 1.3.0, embarqué
  samples/                 les sons nécessaires au contenu (pack hors ligne)
scripts/                   vérifications et fabrication (voir ci-dessous)
```

**Ajouter un genre** : créer `src/content/genres/<nom>.js` sur le modèle de `techno.js`, l'ajouter à la liste dans `src/content/genres/index.js`, puis lancer `npm run samples` (si le genre utilise de nouveaux sons) et `npm run check`.

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Développement (rechargement à chaud ; pas de service worker). |
| `npm run build` | Build local (`dist/`, servi par `start.bat`). |
| `npm run build:pi` | Build pour le Pi (`dist-pi/`, adresse de base `/keymaker/app/`). |
| `npm run check` | Vérifie les liens, puis **exécute chaque exemple de code** dans le moteur réel et vérifie chaque exercice (le code de départ ne valide pas, la solution valide). |
| `npm run smoke` | Parcourt le build du Pi dans un navigateur : 3 tailles d'écran × 2 thèmes, parcours d'un débutant, reprise des anciennes données, hors ligne. |
| `npm run samples` | Reconstruit le pack de sons hors ligne (`public/samples/`) en jouant chaque exemple du contenu (réseau requis). À relancer quand un contenu utilise un nouveau son. |
| `npm run reference` | Ré-extrait la documentation officielle du moteur embarqué. |

Sous Git Bash, `npm run build:pi` doit être lancé tel quel (ne pas passer `--base=/keymaker/app/` à la main : le shell transformerait le chemin).

**Après un clonage neuf**, le pack de sons n'est pas là (il n'est pas versionné : 35 Mo de sons tiers). Dans l'ordre : `npm install`, `npx playwright install chromium`, `npm run samples` (quelques minutes, réseau requis). La build refuse de se faire sans le pack, pour ne jamais produire une app muette hors ligne.

## Déployer sur le Pi

Depuis Git Bash, dans `keymaker-app/` :

```bash
npm run build:pi && bash scripts/deploy-pi.sh
```

Le script sauvegarde d'abord l'app en place dans `modules/keymaker/backups/webapp-<date>-<heure>.tar.gz` sur le Pi (dossier ignoré par git), vide `modules/keymaker/webapp/` sans supprimer le dossier (il est monté dans le conteneur), y extrait la nouvelle build (dossiers 755, fichiers 644), puis vérifie que le conteneur la sert. Aucun redémarrage n'est nécessaire quand le dossier n'était pas vide.

**Revenir en arrière** : sur le Pi, vider `modules/keymaker/webapp/` (sauf `.gitkeep`) et y extraire l'archive voulue de `modules/keymaker/backups/`.

## Données de l'utilisateur

Tout est enregistré dans le navigateur, sur l'appareil. Les clés de l'app d'origine (`keymaker:*`) sont lues et jamais supprimées ; Keymaker 2 ajoute les siennes (`km2:*`). Réglages → « Exporter une copie de sauvegarde » produit un fichier contenant tout.

## Documents

- `../docs/AUDIT.md` — l'état de l'app d'origine et les décisions prises.
- `../docs/PEDAGOGIE.md` — le parcours et les choix pédagogiques.
- `../docs/CONCEPTION_REFAIRE_UN_MORCEAU.md` — la prochaine fonction prévue et où elle se branche.
- `../docs/NOTES_FABLE.md` — notes de travail (faits vérifiés, pièges).
