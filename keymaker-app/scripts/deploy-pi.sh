#!/usr/bin/env bash
# Déploie la build du Pi (dist-pi/) dans modules/keymaker/webapp/ sur le Raspberry Pi.
#
# À lancer depuis Git Bash, dans keymaker-app/, APRÈS « npm run build:pi » :
#     bash scripts/deploy-pi.sh
#
# Ce que fait le script, dans la zone keymaker uniquement :
#   1. sauvegarde l'app actuellement servie dans modules/keymaker/backups/ (ignoré par git) ;
#   2. vide modules/keymaker/webapp/ SANS supprimer le dossier (il est monté dans le
#      conteneur) et sans toucher à .gitkeep (suivi par git) ;
#   3. y extrait la nouvelle build, dossiers en 755, fichiers en 644 ;
#   4. vérifie que le conteneur sert bien la nouvelle app.
# Revenir en arrière : même opération avec l'archive de sauvegarde (voir README).
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
KEY="$HERE/../.ssh-keymaker/id_ed25519"
HOST="felix@100.68.239.15"
REPO="/mnt/nvme/personal-os/repo"
WEBAPP="$REPO/modules/keymaker/webapp"
BACKUPS="$REPO/modules/keymaker/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
SSH=(ssh -i "$KEY" -o BatchMode=yes -o ConnectTimeout=15)

[ -f "$HERE/dist-pi/index.html" ] || { echo "dist-pi/ absent : lance d'abord « npm run build:pi »."; exit 1; }
[ -f "$HERE/dist-pi/samples/manifest.json" ] || { echo "dist-pi/ sans pack de sons : lance « npm run samples » puis « npm run build:pi »."; exit 1; }
grep -q '/keymaker/app/' "$HERE/dist-pi/index.html" || { echo "dist-pi/ n'a pas été construit pour /keymaker/app/."; exit 1; }

ARCHIVE="$(mktemp -d)/keymaker-webapp-$STAMP.tar.gz"
tar -czf "$ARCHIVE" -C "$HERE/dist-pi" .
echo "Archive : $(du -h "$ARCHIVE" | cut -f1)"
scp -i "$KEY" -o BatchMode=yes -q "$ARCHIVE" "$HOST:/tmp/keymaker-webapp-$STAMP.tar.gz"
rm -f "$ARCHIVE"

"${SSH[@]}" "$HOST" bash -s -- "$WEBAPP" "$BACKUPS" "$STAMP" <<'REMOTE'
set -euo pipefail
WEBAPP="$1"; BACKUPS="$2"; STAMP="$3"; NEW="/tmp/keymaker-webapp-$STAMP.tar.gz"
mkdir -p "$BACKUPS"
if [ -f "$WEBAPP/index.html" ]; then
  tar -czf "$BACKUPS/webapp-$STAMP.tar.gz" -C "$WEBAPP" --exclude=./.gitkeep .
  echo "Sauvegarde de l'app en place : $BACKUPS/webapp-$STAMP.tar.gz"
  WAS_EMPTY=0
else
  WAS_EMPTY=1
fi
find "$WEBAPP" -mindepth 1 -maxdepth 1 ! -name .gitkeep -exec rm -rf {} +
tar -xzf "$NEW" -C "$WEBAPP"
find "$WEBAPP" -type d -exec chmod 755 {} +
find "$WEBAPP" -type f -exec chmod 644 {} +
rm -f "$NEW"
# Le serveur ne regarde la présence d'index.html qu'au démarrage.
if [ "$WAS_EMPTY" = 1 ]; then docker restart keymaker >/dev/null && sleep 6; fi
echo "Fichiers en place : $(find "$WEBAPP" -type f | wc -l) ($(du -sh "$WEBAPP" | cut -f1))"
docker exec keymaker node -e "
const get = (p) => new Promise((ok) => require('http').get('http://localhost:3017' + p, (r) => { let b = ''; r.on('data', (d) => (b += d)); r.on('end', () => ok([r.statusCode, b])); }).on('error', (e) => ok([0, String(e)])));
(async () => {
  const [s1, html] = await get('/keymaker/app/');
  const [s2] = await get('/keymaker/app/sw.js');
  const [s3] = await get('/keymaker/app/samples/manifest.json');
  const [s4] = await get('/keymaker/health');
  console.log('page ' + s1 + (/<title>Keymaker<\/title>/.test(html) ? ' (Keymaker)' : '') + ' · sw.js ' + s2 + ' · sons ' + s3 + ' · santé ' + s4);
  process.exit(s1 === 200 && s2 === 200 && s3 === 200 && s4 === 200 ? 0 : 1);
})();"
REMOTE
echo "Déploiement terminé."
