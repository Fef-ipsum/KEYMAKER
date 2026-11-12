// Petit serveur statique pour les scripts de vérification (zéro dépendance).
// Usage : serve(rootDir, port, { base }) → { close(), url }
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.woff2': 'font/woff2',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.flac': 'audio/flac',
};

export function serve(root, port = 0, { base = '/' } = {}) {
  const server = http.createServer(async (req, res) => {
    try {
      let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (base !== '/' && p.startsWith(base)) p = '/' + p.slice(base.length);
      else if (base !== '/' && p + '/' === base) { res.writeHead(301, { Location: base }); return res.end(); }
      if (p.endsWith('/')) p += 'index.html';
      let fp = normalize(join(root, p));
      if (!fp.startsWith(normalize(root))) { res.writeHead(403); return res.end('Forbidden'); }
      let data;
      try { const st = await stat(fp); if (st.isDirectory()) throw new Error('dir'); data = await readFile(fp); }
      catch {
        if (extname(fp)) { res.writeHead(404); return res.end('Not found'); }
        fp = join(root, 'index.html'); data = await readFile(fp);
      }
      res.writeHead(200, { 'Content-Type': TYPES[extname(fp)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    } catch { res.writeHead(500); res.end('Server error'); }
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const url = 'http://localhost:' + server.address().port + base;
      // close() coupe aussi les connexions maintenues ouvertes par le navigateur :
      // sinon la fermeture attend indéfiniment tant qu'un onglet reste ouvert.
      resolve({
        url,
        close: () =>
          new Promise((r) => {
            server.close(r);
            server.closeAllConnections();
          }),
      });
    });
  });
}
