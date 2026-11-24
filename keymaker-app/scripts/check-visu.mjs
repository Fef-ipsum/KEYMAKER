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
  // l'effacement du canevas (un rectangle plein cadre) : on compte les rectangles entre deux.
  await page.addInitScript(() => {
    window.__frames = {};
    window.__cur = {};
    window.__styles = {};
    for (const fn of ['fillRect', 'strokeRect']) {
      const orig = CanvasRenderingContext2D.prototype[fn];
      CanvasRenderingContext2D.prototype[fn] = function (x, y, w, h) {
        const id = (this.canvas.id || '').replace(/_\d+$/, '');
        if (id.startsWith('_widget_')) {
          if (x === 0 && y === 0 && w === this.canvas.width) {
            if (window.__cur[id] != null) (window.__frames[id] = window.__frames[id] || []).push(window.__cur[id]);
            window.__cur[id] = 0;
          } else if (window.__cur[id] != null) {
            window.__cur[id]++;
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
// Nombre de rectangles par image (médiane des images dessinées pendant 1 s), par widget.
async function rectsPerFrame(page) {
  await page.evaluate(() => { window.__frames = {}; window.__cur = {}; window.__styles = {}; });
  await page.waitForTimeout(1000);
  return page.evaluate(() => Object.fromEntries(Object.entries(window.__frames).map(([k, v]) => [k, v.slice().sort((a, b) => a - b)[Math.floor(v.length / 2)]])));
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
// 2 notes par cycle, fenêtre de 4 cycles (2 passés, 2 à venir) : environ 8 rectangles ;
// avec fast(2), environ 16. _pianoroll ne connaît le passé qu'à partir du moment où il
// joue : on attend plus de 2 cycles (2 cycles par seconde ici) avant de compter.
const res = {};
for (const [k, code] of [
  ['roll', 'setcps(2)\n$: note("c3 e3").s("piano")._pianoroll()'],
  ['rollFast', 'setcps(2)\n$: note("c3 e3").s("piano")._pianoroll().fast(2)'],
  ['card', 'setcps(2)\n$: note("c3 e3").s("piano")._punchcard()'],
  ['cardFast', 'setcps(2)\n$: note("c3 e3").s("piano")._punchcard().fast(2)'],
]) {
  await play(page, code, 2500);
  const r = await rectsPerFrame(page);
  res[k] = Object.values(r)[0] || 0;
}
console.log(`    rectangles par image : pianoroll ${res.roll}, pianoroll puis fast(2) ${res.rollFast}, punchcard ${res.card}, punchcard puis fast(2) ${res.cardFast}`);
check(res.roll >= 7 && res.roll <= 10, '_pianoroll : 2 notes par cycle sur 4 cycles visibles (7 à 10 rectangles)');
check(Math.abs(res.rollFast - res.roll) <= 1, '_pianoroll().fast(2) : le dessin ne change pas (le motif est pris à l’endroit du _pianoroll)');
check(res.cardFast >= 2 * res.card - 2, '_punchcard().fast(2) : deux fois plus de rectangles (le motif complet)');

console.log('\n[_scope] seulement sa piste');
const spread = () => page.evaluate(() => {
  const c = document.querySelector('canvas[id^="_widget__scope"]');
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let lo = 1e9, hi = -1, rgb = '';
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    const i = (y * c.width + x) * 4;
    if (d[i + 3] > 40) { lo = Math.min(lo, y); hi = Math.max(hi, y); }
    if (!rgb && d[i + 3] > 220) rgb = d[i] + ',' + d[i + 1] + ',' + d[i + 2];
  }
  return { h: hi < 0 ? 0 : hi - lo, rgb };
});
const maxSpread = async () => { let m = 0; for (let i = 0; i < 6; i++) { m = Math.max(m, (await spread()).h); await page.waitForTimeout(120); } return m; };
await play(page, '$: s("~ ~")._scope()\n$: note("c3").s("sawtooth")');
const quiet = await maxSpread();
await play(page, '$: note("c3").s("sawtooth")._scope()\n$: s("~ ~")');
const loud = await maxSpread();
check(quiet <= 4 && loud >= 20, `piste muette : trait plat (${quiet} px de haut) ; piste en dent de scie : onde (${loud} px), l’autre piste n’y apparaît pas`);

console.log('\n[color] la couleur passe dans les dessins');
await play(page, '$: note("c3").s("sawtooth").color("tomato")._scope()');
await page.waitForTimeout(300);
const sc = await spread();
// tomato = rgb(255, 99, 71) ; le lissage des bords peut décaler d'une unité.
check(sc.rgb && sc.rgb.split(',').map(Number).every((v, i) => Math.abs(v - [255, 99, 71][i]) <= 3), `_scope en tomato : rgb(${sc.rgb})`);
await play(page, 'setcps(2)\n$: note("c3 e3").s("piano").color("#00ced1")._pianoroll()', 2500);
await rectsPerFrame(page);
const st = (await stylesOf(page)).join(' ');
check(/^#00ced1$/i.test(st.trim()), `_pianoroll en #00ced1 : couleurs dessinées ${st}`);
await ctx.close();

check(!errors.length, 'aucune erreur de page' + (errors.length ? ' → ' + errors.join(' | ') : ''));
console.log(bad ? `\nvisualisations : ${bad} vérification(s) en échec` : '\nvisualisations : tout passe');
await browser.close();
process.exit(bad ? 1 : 0);
