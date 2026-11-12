// Extrait du moteur vendorisé la DOCUMENTATION OFFICIELLE embarquée (JSDoc de
// Strudel, utilisée par l'auto-complétion) et la table des contrôles + alias.
// C'est la source de vérité du wiki pour la version exacte que l'app utilise.
// Sorties : scripts/out/docs.json, scripts/out/controls.json
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const s = readFileSync(join(here, '..', 'public', 'vendor', 'strudel-repl', 'index.js'), 'utf8');
mkdirSync(join(here, 'out'), { recursive: true });

// 1) docs = JSON.parse(`…`) — on évalue le gabarit pour retrouver la chaîne JSON.
const marker = 'const docs=JSON.parse(`';
const start = s.indexOf(marker) + marker.length;
let i = start;
while (i < s.length) {
  if (s[i] === '\\') { i += 2; continue; }
  if (s[i] === '`') break;
  i++;
}
const str = new Function('return `' + s.slice(start, i) + '`')();
const docs = JSON.parse(str);
const strip = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const out = docs
  .filter((d) => d.name && !d.undocumented && d.description)
  .map((d) => ({
    name: d.name,
    desc: strip(d.description),
    params: (d.params || []).map((p) => ({ name: p.name, type: p.type && p.type.names ? p.type.names.join('|') : '', desc: strip(p.description) })),
    synonyms: d.synonyms || [],
    examples: d.examples || [],
    file: d.meta && d.meta.filename,
  }));
writeFileSync(join(here, 'out', 'docs.json'), JSON.stringify(out, null, 1));

// 2) registerControl("nom", …alias) / registerControl(["nom", …pack], …alias)
const re = /registerControl\((\[[^\]]*\]|"[^"]*")((?:,"[^"]*")*)\)/g;
const controls = [];
let m;
while ((m = re.exec(s))) {
  const names = m[1].startsWith('[') ? JSON.parse(m[1]) : [JSON.parse(m[1])];
  const aliases = m[2] ? m[2].slice(1).split(',').map((x) => JSON.parse(x)) : [];
  controls.push({ name: names[0], pack: names.length > 1 ? names : undefined, aliases });
}
writeFileSync(join(here, 'out', 'controls.json'), JSON.stringify(controls));

console.log('docs:', out.length, 'entrées ·', 'contrôles:', controls.length);
if (process.argv.length > 2) {
  const by = {};
  for (const d of out) (by[d.name] ||= []).push(d);
  for (const n of process.argv.slice(2)) {
    const ds = by[n];
    if (!ds) { console.log('\n## ' + n + ' : ∅ (pas de doc)'); continue; }
    for (const d of ds) {
      console.log('\n## ' + d.name + (d.synonyms.length ? '  (synonymes : ' + d.synonyms.join(', ') + ')' : '') + '  [' + d.file + ']');
      console.log('   ' + d.desc.slice(0, 600));
      for (const p of d.params) console.log('   - ' + p.name + ' : ' + p.type + ' — ' + p.desc.slice(0, 200));
      for (const e of d.examples.slice(0, 2)) console.log('   ex: ' + e.replace(/\n/g, ' ⏎ ').slice(0, 220));
    }
  }
}
