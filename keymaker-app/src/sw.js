// Keymaker 2 — service worker, écrit à la main.
//
// Rôle : que l'app démarre et joue sans réseau.
//   - À l'installation : met en cache la coquille de l'app (pages, code, moteur
//     Strudel, polices, wiki, leçons). La liste est injectée au build (__WB_MANIFEST).
//   - Les sons (dossier samples/) sont rangés dans un cache à part par la page
//     (src/lib/offline.js) ; ici on les sert depuis ce cache.
//   - Une nouvelle version ATTEND : elle ne prend la main que lorsque la page le
//     demande (message SKIP_WAITING) ou au prochain lancement. Jamais en pleine étape.
//
// Ce fichier remplace le service worker de l'ancienne app (même adresse, même portée).

const MANIFEST = self.__WB_MANIFEST || [];
const VERSION = MANIFEST.map((e) => e.url + ':' + (e.revision || '')).join('|');
function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
const SHELL = 'km2-shell-' + hash(VERSION);
const SAMPLES = 'km2-samples-v1';
const REMOTE = 'km2-remote-v1';
// Caches de l'ancienne app qu'on garde : des sons déjà écoutés y sont rangés.
const KEEP = new Set([SHELL, SAMPLES, REMOTE, 'keymaker-samples', 'keymaker-soundfonts']);
const SCOPE = new URL(self.registration.scope);
const SOUND_HOSTS = /^(raw\.githubusercontent\.com|felixroos\.github\.io)$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      const urls = MANIFEST.map((e) => new URL(e.url, SCOPE).href);
      // Par petits lots : un échec isolé ne doit pas faire échouer toute l'installation
      // des gros fichiers du moteur sur une connexion lente.
      for (let i = 0; i < urls.length; i += 8) {
        await Promise.all(
          urls.slice(i, i + 8).map(async (u) => {
            const res = await fetch(u, { cache: 'reload' });
            if (!res.ok) throw new Error('précache : ' + u + ' → ' + res.status);
            await cache.put(u, res);
          }),
        );
      }
      // Première installation par-dessus l'app d'origine : son service worker se
      // mettait à jour tout seul. On fait de même cette fois-ci, sinon Keymaker 2
      // attendrait que toutes les fenêtres de l'ancienne app soient fermées ; ici,
      // le prochain lancement (ou un simple rechargement) ouvre la nouvelle app.
      // Les mises à jour suivantes, elles, attendent qu'on les demande.
      const names = await caches.keys();
      if (names.some((n) => n.startsWith('workbox-precache'))) self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  const work = (async () => {
    const names = await caches.keys();
    const fromOldApp = names.some((n) => n.startsWith('workbox-precache'));
    for (const name of names) {
      if (!KEEP.has(name)) await caches.delete(name);
    }
    await self.clients.claim();
    return fromOldApp;
  })();
  event.waitUntil(work);
  // Passage unique depuis l'app d'origine : ses pages encore ouvertes sont
  // rechargées, pour que Keymaker 2 apparaisse sans avoir à fermer l'app.
  // Surtout PAS dans waitUntil : le rechargement attend la fin de l'activation,
  // qui l'attendrait elle-même (interblocage vérifié).
  work.then(async (fromOldApp) => {
    if (!fromOldApp) return;
    for (const client of await self.clients.matchAll({ type: 'window' })) {
      client.navigate(client.url).catch(() => {
        /* navigateur sans navigate() : la nouvelle app s'ouvrira au prochain lancement */
      });
    }
  });
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

async function fromShell(request) {
  const cache = await caches.open(SHELL);
  return (await cache.match(request, { ignoreSearch: true })) || null;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 1) Fichiers de l'app.
  if (url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname)) {
    if (req.mode === 'navigate') {
      event.respondWith(
        (async () => (await fromShell(new URL('index.html', SCOPE).href)) || fetch(req).catch(() => new Response('Hors ligne.', { status: 503 })))(),
      );
      return;
    }
    const isSample = url.pathname.startsWith(SCOPE.pathname + 'samples/') && !url.pathname.endsWith('manifest.json');
    event.respondWith(
      (async () => {
        if (isSample) {
          const cache = await caches.open(SAMPLES);
          const hit = await cache.match(req, { ignoreSearch: true });
          if (hit) return hit;
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        }
        return (await fromShell(req)) || fetch(req);
      })(),
    );
    return;
  }

  // 2) Sons distants hors du pack (explorés dans le Studio) : gardés après une première écoute.
  if (SOUND_HOSTS.test(url.hostname)) {
    event.respondWith(
      (async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') {
          const cache = await caches.open(REMOTE);
          cache.put(req, res.clone());
        }
        return res;
      })(),
    );
  }
  // 3) Tout le reste (Sati, etc.) : réseau, sans intervention.
});
