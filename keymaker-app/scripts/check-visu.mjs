// Visualisations dans le code (_pianoroll, _punchcard, _scope) : ce que le wiki (fn.visu,
// fn.color) et la leçon 6.9 en disent, mesuré dans le moteur.
//   - largeur : le dessin suit la largeur de l'éditeur (téléphone 390 px, PC), net ;
//   - _pianoroll dessine le motif à l'endroit où il est écrit, _punchcard le motif complet ;
//   - _scope ne montre que sa piste ; color() colore les dessins.
// Les rectangles sont comptés en espionnant fillRect / strokeRect du canevas.
// Usage : node scripts/check-visu.mjs [--dir dist]
import { launchBrowser } from './browser.mjs';
import { serve } from './static-server.mjs';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dirArg = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : 'dist';
const ROOT = join(here, '..', dirArg);
if (!existsSync(join(ROOT, 'index.html'))) { console.error('Build introuvable : ' + ROOT + ' (lance « npm run build »)'); process.exit(2); }
const srv = await serve(ROOT, 0, { base: dirArg === 'dist-pi' ? '/keymaker/app/' : '/' });
const browser = await launchBrowser();
let bad = 0;
const check = (cond, m) => { if (!cond) bad++; console.log((cond ? '  ✓ ' : '  ✗ ') + m); };
const errors = [];

async function open(width, dpr = 1) {
  const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width, height: 900 }, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  // Espion : rectangles dessinés sur les canevas des widgets. Chaque image commence par
  // l'effacement du canevas (un rectangle plein cadre) ; pour chaque rectangle suivant, on
  // note sa largeur en part de celle du canevas, et sa couleur.
  await page.addInitScript(() => {
    window.__widths = {};
    window.__frames = {};
    window.__cur = {};
    window.__styles = {};
    for (const fn of ['fillRect', 'strokeRect']) {
      const orig = CanvasRenderingContext2D.prototype[fn];
      CanvasRenderingContext2D.prototype[fn] = function (x, y, w, h) {
        const id = this.canvas.id || '';
        if (id.startsWith('_widget_')) {
          if (x === 0 && y === 0 && w === this.canvas.width) {
            if (window.__cur[id] != null) (window.__frames[id] = window.__frames[id] || []).push(window.__cur[id]);
            window.__cur[id] = 0;
          } else if (window.__cur[id] != null) {
            window.__cur[id]++;
            (window.__widths[id] = window.__widths[id] || []).push(w / this.canvas.width);
            const st = String(fn === 'fillRect' ? this.fillStyle : this.strokeStyle);
            const s = (window.__styles[id] = window.__styles[id] || []);
            if (!s.includes(st)) s.push(st);
          }
        }
        return orig.call(this, x, y, w, h);
      };
    }
  });
  await page.goto(srv.url + '#/studio');
  await page.waitForFunction(() => !!document.querySelector('.crown:not([disabled])'), null, { timeout: 30000 });
  return { ctx, page };
}
async function play(page, code, wait = 1500) {
  await page.click('.cm-content');
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(code);
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(wait);
}
// Ce que dessine l'unique widget sous le code, pendant 1 s : largeur médiane d'une note
// (en part de la largeur du canevas), rectangles par image (médiane), nombre d'images.
const median = (v) => v.slice().sort((a, b) => a - b)[Math.floor(v.length / 2)];
async function drawn(page) {
  await page.evaluate(() => { window.__widths = {}; window.__frames = {}; window.__cur = {}; window.__styles = {}; });
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => {
    const c = document.querySelector('canvas[id^="_widget_"]');
    return c ? { w: window.__widths[c.id] || [], f: window.__frames[c.id] || [] } : { w: [], f: [] };
  });
  return { width: r.w.length ? median(r.w) : 0, n: r.f.length ? median(r.f) : 0, frames: r.f.length };
}
// Le Pi chargé peut démarrer la lecture tard : on mesure seconde après seconde (10 s au plus)
// jusqu'à deux mesures de suite d'au moins 5 images, de même largeur de note (à 5 % près).
// Le NOMBRE de rectangles, lui, dépend de ce que l'ordonnanceur a déjà planifié (une note à
// venir manque parfois) : il n'est qu'indicatif.
async function settled(page) {
  const seen = [];
  for (let i = 0; i < 10; i++) {
    const r = await drawn(page);
    seen.push(r);
    const p = seen[seen.length - 2];
    if (p && p.frames >= 5 && r.frames >= 5 && r.width > 0 && Math.abs(r.width - p.width) <= 0.05 * p.width) break;
  }
  return seen[seen.length - 1];
}
const stylesOf = (page) => page.evaluate(() => Object.values(window.__styles)[0] || []);

console.log('\n[largeur] téléphone 390 px (écran 3×) et PC');
for (const [w, dpr] of [[390, 3], [1440, 1]]) {
  const { ctx, page } = await open(w, dpr);
  await play(page, '$: note("c3 e3 g3 b3").s("piano")._pianoroll()\n$: s("bd sd")._punchcard()\n$: note("c2").s("sawtooth")._scope()');
  const m = await page.evaluate(() => {
    const cont = document.querySelector('.cm-content');
    const cs = getComputedStyle(cont);
    const inner = cont.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return {
      inner,
      scroller: document.querySelector('.cm-scroller').scrollWidth - document.querySelector('.cm-scroller').clientWidth,
      page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      canv: [...document.querySelectorAll('canvas[id^="_widget_"]')].map((c) => ({ id: c.id, css: c.getBoundingClientRect().width, px: c.width, h: c.getBoundingClientRect().height })),
      dpr: window.devicePixelRatio,
    };
  });
  check(m.canv.length === 3, `${w} px : 3 dessins sous le code (${m.canv.length})`);
  check(m.canv.every((c) => Math.abs(c.css - m.inner) <= 1), `${w} px : chaque dessin occupe la largeur du code (${m.canv.map((c) => Math.round(c.css)).join(', ')} pour ${Math.round(m.inner)})`);
  check(m.canv.every((c) => Math.abs(c.px - Math.round(c.css * m.dpr)) <= 1), `${w} px : image nette, ${m.dpr} pixel(s) d’écran par pixel CSS (${m.canv.map((c) => c.px).join(', ')})`);
  check(m.canv.every((c) => Math.round(c.h) === 60), `${w} px : 60 px de haut`);
  check(m.scroller <= 1 && m.page <= 1, `${w} px : aucun débordement (éditeur ${m.scroller}, page ${m.page})`);
  await ctx.close();
}

const { ctx, page } = await open(1000);
console.log('\n[_pianoroll / _punchcard] une transformation écrite APRÈS');
// 2 notes par cycle et une fenêtre de 4 cycles : chaque note occupe 1/8 de la largeur
// (un peu moins : un liseré les sépare). Si fast(2) agit sur le motif dessiné, chaque note
// devient deux fois plus étroite (1/16). On compare la LARGEUR des notes, pas leur nombre :
// le nombre dépend de ce que l'ordonnanceur a déjà planifié, la largeur ne dépend que du motif.
const res = {};
for (const [k, code] of [
  ['roll', 'setcps(2)\n$: note("c3 e3").s("piano")._pianoroll()'],
  ['rollFast', 'setcps(2)\n$: note("c3 e3").s("piano")._pianoroll().fast(2)'],
  ['card', 'setcps(2)\n$: note("c3 e3").s("piano")._punchcard()'],
  ['cardFast', 'setcps(2)\n$: note("c3 e3").s("piano")._punchcard().fast(2)'],
]) {
  await play(page, code, 1500);
  res[k] = await settled(page);
}
const fmt = (r) => `${(1 / r.width).toFixed(1)}e de largeur, ${r.n} par image`;
console.log(`    une note = pianoroll ${fmt(res.roll)} · pianoroll puis fast(2) ${fmt(res.rollFast)} · punchcard ${fmt(res.card)} · punchcard puis fast(2) ${fmt(res.cardFast)}`);
const eighth = (r) => r.width >= 0.1 && r.width <= 0.13;
check(eighth(res.roll) && eighth(res.card), '_pianoroll, _punchcard : une note par demi-cycle sur 4 cycles visibles (chaque note ≈ 1/8 de la largeur)');
check(Math.abs(res.rollFast.width / res.roll.width - 1) <= 0.1, '_pianoroll().fast(2) : le dessin ne change pas (le motif est pris à l’endroit du _pianoroll)');
check(Math.abs(res.cardFast.width / res.card.width - 0.5) <= 0.1, '_punchcard().fast(2) : notes deux fois plus étroites (le motif complet)');

console.log('\n[_scope] seulement sa piste');
// Hauteur du dessin du i-e scope sous le code, et la couleur de son premier pixel opaque.
// Un scope garde son canevas d'un code à l'autre (même identifiant) : on ne mesure qu'après
// avoir vu le dessin attendu, pas après une attente fixe.
const spread = (i = 0) => page.evaluate((i) => {
  const c = document.querySelectorAll('canvas[id^="_widget__scope"]')[i];
  if (!c) return { h: -1, rgb: '' };
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let lo = 1e9, hi = -1, rgb = '';
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const j = (y * c.width + x) * 4;
    if (d[j + 3] > 40) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
    if (!rgb && d[j + 3] > 220) rgb = d[j] + ',' + d[j + 1] + ',' + d[j + 2];
  }
  return { h: hi < 0 ? 0 : hi - lo, rgb };
}, i);
// Attend (10 s au plus, toutes les 120 ms) que le i-e scope remplisse cond.
async function waitScope(i, cond) {
  let r = await spread(i);
  for (const t0 = Date.now(); !cond(r) && Date.now() - t0 < 10000;) { await page.waitForTimeout(120); r = await spread(i); }
  return r;
}
// Deux scopes dans le même code : celui de la piste muette et celui de la dent de scie.
// Le second prouve que le son tourne ; le premier, observé ensuite pendant 1,5 s, doit rester plat.
await play(page, '$: s("~ ~")._scope()\n$: note("c3").s("sawtooth")._scope()', 500);
const loud = (await waitScope(1, (r) => r.h >= 20)).h;
let quiet = 0;
for (const t0 = Date.now(); Date.now() - t0 < 1500;) { quiet = Math.max(quiet, (await spread(0)).h); await page.waitForTimeout(120); }
check(quiet >= 0 && quiet <= 4 && loud >= 20, `piste muette : trait plat (${quiet} px de haut) ; piste en dent de scie : onde (${loud} px), l’autre piste n’y apparaît pas`);

console.log('\n[color] la couleur passe dans les dessins');
// tomato = rgb(255, 99, 71) ; le lissage des bords peut décaler d'une unité.
const tomato = (r) => !!r.rgb && r.rgb.split(',').map(Number).every((v, i) => Math.abs(v - [255, 99, 71][i]) <= 3);
await play(page, '$: note("c3").s("sawtooth").color("tomato")._scope()', 500);
const sc = await waitScope(0, (r) => r.h >= 20 && tomato(r));
check(tomato(sc), `_scope en tomato : rgb(${sc.rgb})`);
await play(page, 'setcps(2)\n$: note("c3 e3").s("piano").color("#00ced1")._pianoroll()', 1500);
await settled(page);
const st = (await stylesOf(page)).join(' ');
check(/^#00ced1$/i.test(st.trim()), `_pianoroll en #00ced1 : couleurs dessinées ${st}`);
await ctx.close();

check(!errors.length, 'aucune erreur de page' + (errors.length ? ' → ' + errors.join(' | ') : ''));
console.log(bad ? `\nvisualisations : ${bad} vérification(s) en échec` : '\nvisualisations : tout passe');
await browser.close();
process.exit(bad ? 1 : 0);
