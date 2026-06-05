// Keymaker — petit serveur statique local, zéro dépendance.
// Sert le dossier ./dist sur http://localhost:4321
// (AudioWorklet + modules ES + PWA nécessitent http://, pas file://).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, 'dist');
const PORT = process.env.PORT ? Number(process.env.PORT) : 4321;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (p.endsWith('/')) p += 'index.html';
    let fp = normalize(join(ROOT, p));
    if (!fp.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    let data;
    try {
      data = await readFile(fp);
    } catch {
      // Repli SPA : tout chemin inconnu renvoie index.html
      fp = join(ROOT, 'index.html');
      data = await readFile(fp);
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(fp)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`\n  ꩜  Keymaker tourne sur  http://localhost:${PORT}\n  (laisse cette fenêtre ouverte ; ferme-la pour arrêter)\n`);
});
