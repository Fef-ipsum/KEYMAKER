// Vérifie que ce que le CONTENU affirme sur le moteur est vrai dans le moteur embarqué.
//
// Deux sortes d'affirmations (scripts/claims.js) :
//   - « motif »    : un code, et ce qu'il doit produire cycle par cycle (ou : produit la
//                    même chose qu'un autre code, éventuellement décalé de n cycles) ;
//   - « empreinte » : des extraits du code source du moteur sur lesquels un texte s'appuie
//                    (valeurs par défaut, plafonds, ordre de la chaîne d'effets…). Si une
//                    mise à jour du moteur les fait disparaître, le texte est à revoir.
// Chaque affirmation cite les entrées du contenu qui en dépendent : en cas d'échec, on
// sait quels textes relire.
//
// Usage : node scripts/check-claims.mjs [--only motif|empreinte] [--id <id>]
import { readFileSync } from 'node:fs';
import { claims } from './claims.js';
import { byId } from '../src/content/wiki/index.js';
import { stepIndex, genreTraitIds } from '../src/content/registry.js';

const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null);
const only = arg('--only');
const oneId = arg('--id');
const list = claims.filter((c) => (!only || c.kind === only) && (!oneId || c.id === oneId));

let bad = 0;
const fail = (c, msg) => {
  bad++;
  console.log('✗ ' + c.id + ' — ' + msg + '\n    à relire : ' + (c.cites || []).join(', '));
};

// Les entrées citées doivent exister (sinon l'affirmation ne protège rien).
for (const c of claims) {
  for (const id of c.cites || []) {
    if (!byId[id] && !stepIndex.has(id) && !genreTraitIds.includes(id)) fail(c, 'cite une entrée inconnue : ' + id);
  }
}

/* --- Empreintes du code source du moteur ------------------------------------- */
const ENGINE = readFileSync(new URL('../public/vendor/strudel-repl/index.js', import.meta.url), 'utf8');
for (const c of list.filter((x) => x.kind === 'empreinte')) {
  for (const snip of c.has || []) if (!ENGINE.includes(snip)) fail(c, 'extrait absent du moteur : ' + snip);
  if (c.order) {
    const pos = c.order.map((snip) => ENGINE.indexOf(snip));
    if (pos.some((p) => p < 0)) fail(c, 'extrait absent : ' + c.order[pos.findIndex((p) => p < 0)]);
    else if (pos.some((p, i) => i && p < pos[i - 1])) fail(c, 'ordre changé : ' + c.order.join(' → '));
  }
}

/* --- Motifs : on fait jouer le moteur ------------------------------------------ */
const motifs = list.filter((x) => x.kind === 'motif');
if (motifs.length) {
  const { openEngine } = await import('./harness.mjs');
  const eng = await openEngine();
  const r3 = (x) => (typeof x === 'number' ? Math.round(x * 1000) / 1000 : x);
  // Une ligne par cycle : les valeurs demandées, triées par instant puis par texte.
  const render = (res, c) => {
    const fields = c.fields || ['note', 'n', 's'];
    const per = Array.from({ length: c.cycles || 1 }, () => []);
    for (const h of res.haps) {
      const k = Math.floor(h.b + 1e-9);
      if (k < 0 || k >= per.length) continue;
      const v = c.fields
        ? fields.map((f) => (f === 'b' ? r3(h.b - k) : r3(Array.isArray(h.v[f]) ? h.v[f].join(',') : h.v[f]))).join('/')
        : String(r3(h.v.note ?? h.v.n ?? h.v.s));
      per[k].push([h.b, v]);
    }
    return per.map((row) => row.sort((a, b) => a[0] - b[0] || String(a[1]).localeCompare(String(b[1]))).map((x) => x[1]).join(' '));
  };
  const run = async (code, c, offset = 0) => {
    const cycles = (c.cycles || 1) + offset;
    const res = await eng.evalCode(code, { cycles, playMs: 0 });
    if (res.error) return { error: res.error, logs: res.logs };
    if (offset) res.haps = res.haps.filter((h) => h.b >= offset - 1e-9).map((h) => ({ ...h, b: h.b - offset }));
    return { rows: render(res, c), logs: res.logs, haps: res.haps };
  };
  for (const c of motifs) {
    const a = await run(c.code, c);
    if (a.error) {
      fail(c, 'erreur : ' + a.error);
      continue;
    }
    if (c.log && !a.logs.some((l) => l.includes(c.log))) fail(c, 'message attendu absent : « ' + c.log + ' »');
    // never / some : { champ: true (présent) | [valeurs], … }. Toutes les conditions portent
    // sur le MÊME événement : « aucun / au moins un événement ne remplit tout cela ».
    const desc = (cond) => Object.entries(cond).map(([f, w]) => f + (w === true ? ' présent' : ' = ' + w.join('|'))).join(' et ');
    const fits = (h, cond) => Object.entries(cond).every(([f, w]) => (w === true ? h.v[f] !== undefined : w.includes(h.v[f])));
    if (c.never) {
      const n = a.haps.filter((h) => fits(h, c.never)).length;
      if (n) fail(c, `${n} événement(s) avec ${desc(c.never)}, attendu aucun`);
    }
    if (c.some && !a.haps.some((h) => fits(h, c.some))) fail(c, `aucun événement avec ${desc(c.some)}`);
    if (c.expect) {
      const want = c.expect.map(String);
      want.forEach((w, i) => {
        if (a.rows[i] !== w) fail(c, `cycle ${i + 1} : attendu « ${w} », obtenu « ${a.rows[i]} »`);
      });
    }
    if (c.sameAs || c.differsFrom) {
      const other = c.sameAs || c.differsFrom;
      const b = await run(other.code, c, other.offset || 0);
      if (b.error) fail(c, 'erreur (code de comparaison) : ' + b.error);
      else {
        const same = a.rows.join('|') === b.rows.join('|');
        if (c.sameAs && !same) fail(c, 'devrait produire la même chose que « ' + other.code + ' »' + (other.offset ? ' décalé de ' + other.offset + ' cycles' : '') + `\n    obtenu : ${a.rows.join(' | ')}\n    l’autre : ${b.rows.join(' | ')}`);
        if (c.differsFrom && same) fail(c, 'devrait différer de « ' + other.code + ' »');
      }
    }
  }
  await eng.close?.();
}

console.log(`affirmations : ${list.length} vérifiées, ${bad} en échec`);
process.exit(bad ? 1 : 0);
