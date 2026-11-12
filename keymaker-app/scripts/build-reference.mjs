// Fabrique src/content/wiki/reference.json : la documentation officielle embarquée
// dans le moteur (Strudel 1.3.0), allégée, + la table des alias de contrôles.
// À relancer si le moteur vendorisé change : node scripts/build-reference.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
execFileSync(process.execPath, [join(here, 'extract-docs.mjs')], { stdio: 'ignore' });
const docs = JSON.parse(readFileSync(join(here, 'out', 'docs.json'), 'utf8'));
const controls = JSON.parse(readFileSync(join(here, 'out', 'controls.json'), 'utf8'));
const skipFile = join(here, '..', 'src', 'content', 'wiki', 'reference-skip.json');
const skip = existsSync(skipFile) ? new Set(JSON.parse(readFileSync(skipFile, 'utf8'))) : new Set();

// Fonctions internes du moteur : documentées, mais sans intérêt pour écrire de la musique.
const INTERNAL = new Set(('Pattern withValue fmap appWhole appBoth appLeft appRight queryArc splitQueries withQuerySpan withQueryTime ' +
  'withHapSpan withHapTime withHaps withHap setContext withContext stripContext withLoc filterHaps filterValues removeUndefineds ' +
  'onsetsOnly discreteOnly defragmentHaps firstCycle firstCycleValues showFirstCycle sortHapsByPart sequenceP slowcatPrime seqPLoop ' +
  'reallocateChannelsIfNeeded readInputs writeOutputs shiftInputBuffers shiftOutputBuffers prepareInputBuffersToSend ' +
  'handleOutputBuffersToRetrieve generateReverb generateGraph applyGradualLowpass applyHannWindow computeMagnitudes findPeaks ' +
  'shiftPeaks _initialize K FX worklet tables chyx parray allTransforms useRNG defaultmidimap midimaps csoundm drawLine ' +
  'reset restart into tag filter filterWhen ref').split(' '));

const seen = new Set();
const entries = [];
for (const d of docs) {
  if (INTERNAL.has(d.name) || d.name.startsWith('_') || seen.has(d.name)) continue;
  seen.add(d.name);
  const fix = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  entries.push({
    n: d.name,
    d: fix(d.desc),
    p: d.params.filter((p) => p.name).map((p) => [p.name, p.type, fix(p.desc)]),
    s: d.synonyms,
    x: d.examples.filter((e) => !skip.has(e)).slice(0, 3),
    dep: /deprecat/i.test(d.desc) || undefined,
  });
}
const aliases = {};
for (const c of controls) if (c.aliases.length) aliases[c.name] = c.aliases;
const packs = {};
for (const c of controls) if (c.pack) packs[c.name] = c.pack;
const out = { version: '1.3.0', entries, aliases, packs };
writeFileSync(join(here, '..', 'src', 'content', 'wiki', 'reference.json'), JSON.stringify(out));
console.log('reference.json :', entries.length, 'entrées,', Object.keys(aliases).length, 'contrôles avec alias,', JSON.stringify(out).length, 'octets');
