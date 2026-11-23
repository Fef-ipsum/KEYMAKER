// Gestes au hasard sur chaque type de schéma (téléphone) : glisser dans le dessin, bouger
// des curseurs, changer les choix, maintenir « avant / après », lire et arrêter.
// Échoue si un schéma affiche « n'a pas pu s'afficher » ou si la page signale une erreur.
// Usage : node scripts/fuzz-schemas.mjs [--steps 120] [--dir dist-pi]
import { launchBrowser } from './browser.mjs';
import { serve } from './static-server.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const STEPS = Number(arg('--steps', 120));
const srv = await serve(join(here, '..', arg('--dir', 'dist-pi')), 0, { base: '/keymaker/app/' });
const browser = await launchBrowser();
const ROUTES = ['fx.lpq', 'fx.bpf', 'fx.adsr', 'fx.attack', 'son.ondes', 'fx.lpenv', 'mini.chevrons', 'sol.tempo', 'sol.gamme', 'sol.accord', 'sol.octave', 'fn.signaux', 'fx.delay', 'fx.room', 'fx.distort'];
let bad = 0;
for (const id of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await p.goto(srv.url + '#/wiki/' + id);
  await p.waitForSelector('.schema', { timeout: 60000 });
  await p.waitForTimeout(400);
  let seed = 11;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  let crashed = -1;
  const play = p.locator('.schema .sch-play').first();
  if (await play.count()) await play.click();
  for (let i = 0; i < STEPS; i++) {
    if (await p.locator('.sch-failed').count()) {
      crashed = i;
      break;
    }
    const r = rnd();
    try {
      if (r < 0.45) {
        const svg = p.locator('.schema svg.sch-svg').first();
        const box = await svg.boundingBox();
        if (box) {
          await p.mouse.move(box.x + rnd() * box.width, box.y + rnd() * box.height);
          await p.mouse.down();
          await p.mouse.move(box.x + rnd() * box.width, box.y + rnd() * box.height, { steps: 3 });
          await p.mouse.up();
        }
      } else if (r < 0.75) {
        const inputs = p.locator('.schema .sch-sliders input:not([disabled]), .schema .sch-motif input');
        const n = await inputs.count();
        if (n) {
          const el = inputs.nth(Math.floor(rnd() * n));
          const isText = (await el.getAttribute('type')) === 'text';
          const v = isText ? ['bd hh sd hh', 'bd [hh hh] <sd cp>', 'bd*8, ~ hh', 'bd(3,8) sd?', 'bd [hh'][Math.floor(rnd() * 5)] : String(Math.floor(rnd() * 1001));
          await el.evaluate((e, v) => {
            const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            set.call(e, v);
            e.dispatchEvent(new Event('input', { bubbles: true }));
          }, v);
        }
      } else if (r < 0.88) {
        const ch = p.locator('.schema .sch-choice-b, .schema .sch-wavebtn, .schema .sch-presets .chip, .schema .sch-key-w');
        const n = await ch.count();
        if (n) await ch.nth(Math.floor(rnd() * n)).dispatchEvent(rnd() < 0.5 ? 'click' : 'pointerdown');
      } else if (r < 0.95) {
        const hb = p.locator('.schema .sch-hold').first();
        const box = (await hb.count()) ? await hb.boundingBox() : null;
        if (box) {
          await p.mouse.move(box.x + 5, box.y + 5);
          await p.mouse.down();
          await p.waitForTimeout(150 + rnd() * 600);
          await p.mouse.up();
        }
      } else if (await play.count()) await play.click();
    } catch {
      /* un geste impossible (élément masqué) : on passe au suivant */
    }
    await p.waitForTimeout(40);
  }
  const real = errs.filter((e) => !/AudioContext was not allowed/.test(e));
  const ok = crashed < 0 && !real.length;
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${id} : ${STEPS} gestes${crashed >= 0 ? ', PLANTE au geste ' + crashed : ''}${real.length ? ' — ' + [...new Set(real)].slice(0, 2).join(' | ') : ''}`);
  await ctx.close();
}
await browser.close();
await srv.close();
console.log(bad ? `\n${bad} schéma(s) en échec` : '\nAucun schéma ne plante.');
process.exit(bad ? 1 : 0);
