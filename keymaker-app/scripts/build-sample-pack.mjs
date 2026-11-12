// Construit le PACK DE SONS HORS LIGNE : public/samples/ + public/samples/manifest.json.
//
// Strudel télécharge ses sons depuis GitHub à la première écoute. Pour que tout le
// contenu de l'app joue sans réseau, on copie ici les fichiers dont il a besoin :
//   1. les cartes de sons (JSON) que le moteur charge au démarrage ;
//   2. le kit de batterie par défaut, le piano, et les quatre boîtes à rythmes proposées ;
//   3. tous les sons utilisés par un exemple du contenu (trouvés en interrogeant
//      chaque exemple sur 32 cycles) ;
//   4. tout ce que le moteur va chercher en jouant ces exemples (polices de sons `gm_*`,
//      boucles chargées par adresse).
//
// L'app (src/lib/offline.js) redirige ensuite ces adresses vers les copies locales.
// Usage : node scripts/build-sample-pack.mjs        (réseau requis)
import { mkdirSync, writeFileSync, existsSync, statSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openEngine } from './harness.mjs';
import { allExamples } from '../src/content/registry.js';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = join(here, '..', 'public', 'samples');
const MAPS = [
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/tidal-drum-machines.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/piano.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/Dirt-Samples.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/vcsl.json',
  'https://raw.githubusercontent.com/felixroos/dough-samples/main/mridangam.json',
  'https://raw.githubusercontent.com/tidalcycles/uzu-drumkit/main/strudel.json',
];
const BANKS = ['RolandTR909', 'RolandTR808', 'RolandTR707', 'AkaiLinn'];
const HOSTS = [
  ['https://raw.githubusercontent.com/', 'gh/'],
  ['https://felixroos.github.io/webaudiofontdata/', 'wafd/'],
];
const MAX_FILE = 6 * 1024 * 1024;

const localOf = (url) => {
  for (const [prefix, dir] of HOSTS) if (url.startsWith(prefix)) return dir + decodeURIComponent(url.slice(prefix.length));
  return null;
};
async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return Buffer.from(await r.arrayBuffer());
      if (r.status === 404) return null;
    } catch { /* on réessaie */ }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  return null;
}

// 1) Cartes de sons : nom → liste d'adresses.
const keyFiles = new Map();
const want = new Set(MAPS);
for (const m of MAPS) {
  const buf = await get(m);
  if (!buf) throw new Error('carte introuvable : ' + m);
  const json = JSON.parse(buf.toString('utf8'));
  const base = json._base || m.replace(/[^/]+$/, '');
  for (const [k, v] of Object.entries(json)) {
    if (k === '_base') continue;
    const files = Array.isArray(v) ? v : typeof v === 'string' ? [v] : Object.values(v).flat();
    keyFiles.set(k, files.map((f) => (f.startsWith('http') ? f : base + f)));
  }
}
const addKey = (k) => { const f = keyFiles.get(k); if (f) f.forEach((u) => want.add(u)); return !!f; };

// 2) Socle : kit par défaut, piano, quatre machines.
const uzu = JSON.parse((await get(MAPS[5])).toString('utf8'));
Object.keys(uzu).filter((k) => k !== '_base').forEach(addKey);
addKey('piano');
for (const k of keyFiles.keys()) if (BANKS.some((b) => k.startsWith(b + '_'))) addKey(k);

// 3) et 4) Tout le contenu RÉDIGÉ : sons nommés sur 32 cycles + adresses réellement demandées.
//    Les exemples de la référence officielle passent ensuite : on ne garde que ceux
//    qui se contentent des sons déjà embarqués ; les autres sont écartés du wiki
//    (reference-skip.json) pour que tout ce qui est affiché joue hors ligne.
const eng = await openEngine();
const examples = allExamples();
const isAudio = (u) => localOf(u) && /\.(wav|mp3|ogg|flac|js)(\?|$)/i.test(u);
async function probe(code) {
  const before = new Set(eng.requests);
  const names = await eng.page.evaluate(async (code) => {
    const ed = window.__ed;
    ed.setCode(code);
    try { await ed.evaluate(); } catch { return []; }
    const out = new Set();
    try {
      for (const h of ed.repl.state.pattern.queryArc(0, 32)) {
        const v = h.value;
        if (v && typeof v === 'object' && v.s != null) out.add((v.bank ? v.bank + '_' : '') + String(v.s));
      }
    } catch { /* motif non interrogeable */ }
    await new Promise((r) => setTimeout(r, 700));
    ed.stop();
    return [...out];
  }, code);
  const asked = [...eng.requests].filter((u) => !before.has(u) && isAudio(u)).map((u) => u.split('?')[0]);
  return { names, asked };
}
for (const ex of examples.filter((e) => e.group !== 'reference')) {
  const { names, asked } = await probe(ex.code);
  names.forEach(addKey);
  asked.forEach((u) => want.add(u));
}
const rejectedUrls = new Set();
const skip = new Set();
for (const ex of examples.filter((e) => e.group === 'reference')) {
  const { names, asked } = await probe(ex.code);
  const files = names.flatMap((n) => keyFiles.get(n) || []);
  const extra = [...files, ...asked].filter((u) => !want.has(u));
  if (extra.length || files.some((u) => rejectedUrls.has(u))) {
    extra.forEach((u) => rejectedUrls.add(u));
    skip.add(ex.code);
  }
}
await eng.close();
const skipFile = join(here, '..', 'src', 'content', 'wiki', 'reference-skip.json');
let prevSkip = [];
try { prevSkip = JSON.parse(readFileSync(skipFile, 'utf8')); } catch { /* aucun */ }
writeFileSync(skipFile, JSON.stringify([...new Set([...prevSkip, ...skip])], null, 1));
console.log('exemples officiels écartés faute de sons embarqués : ' + skip.size);

// Téléchargement (reprise possible : un fichier déjà présent n'est pas retéléchargé).
const files = [];
let bytes = 0, skipped = 0, fetched = 0;
const list = [...want].filter((u) => localOf(u));
for (let i = 0; i < list.length; i += 8) {
  await Promise.all(list.slice(i, i + 8).map(async (u) => {
    const local = localOf(u);
    const dest = join(OUT, local);
    let size = existsSync(dest) ? statSync(dest).size : 0;
    if (!size) {
      const buf = await get(encodeURI(decodeURI(u)).replace(/#/g, '%23'));
      if (!buf) { skipped++; return; }
      if (buf.length > MAX_FILE) { skipped++; return; }
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, buf);
      size = buf.length;
      fetched++;
    }
    files.push({ u: decodeURI(u), p: local.split('/').map(encodeURIComponent).join('/'), b: size });
    bytes += size;
  }));
  process.stdout.write(`\r${Math.min(i + 8, list.length)} / ${list.length}`);
}
files.sort((a, b) => a.p.localeCompare(b.p));
const keep = new Set(files.map((f) => f.p.split('/').map(decodeURIComponent).join('/')));
(function prune(dir, rel) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    const r = rel ? rel + '/' + name.name : name.name;
    if (name.isDirectory()) { prune(p, r); if (!readdirSync(p).length) rmSync(p, { recursive: true }); }
    else if (r !== 'manifest.json' && !keep.has(r)) rmSync(p);
  }
})(OUT, '');
const manifest = { version: String(files.length) + '-' + bytes, total: files.length, bytes, files };
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log(`\npack : ${files.length} fichiers, ${(bytes / 1048576).toFixed(1)} Mo (${fetched} téléchargés, ${skipped} ignorés), ${examples.length} exemples analysés`);
const byTop = {};
for (const f of files) { const k = f.p.split('/').slice(0, 3).join('/'); byTop[k] = (byTop[k] || 0) + f.b; }
for (const [k, v] of Object.entries(byTop).sort((a, b) => b[1] - a[1]).slice(0, 14)) console.log('  ' + (v / 1048576).toFixed(1).padStart(6) + ' Mo  ' + k);
