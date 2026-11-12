// Banc d'essai : le moteur Strudel vendorisé dans un Chromium sans interface.
// openEngine() → { evalCode(code, opts), requests, close() }
//   evalCode renvoie { error, logs, haps, cps } — error = erreur d'évaluation,
//   logs = messages d'erreur du moteur pendant la lecture (son introuvable…).
import { chromium } from 'playwright';
import { serve } from './static-server.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<script src="/vendor/strudel-repl/index.js" defer></script></head><body><div id="host"></div></body></html>`;

export async function openEngine({ offline = false } = {}) {
  const srv = await serve(join(here, '..', 'public'));
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const requests = new Set();
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(srv.url)) requests.add(u); });
  await page.route('**/__engine.html', (route) => route.fulfill({ body: PAGE, contentType: 'text/html' }));
  await page.goto(srv.url + '__engine.html');
  await page.waitForFunction(() => customElements.get('strudel-editor'));
  await page.mouse.click(5, 5);
  await page.waitForTimeout(600);
  await page.evaluate(async () => {
    const el = document.createElement('strudel-editor');
    el.setAttribute('code', 'silence');
    document.getElementById('host').appendChild(el);
    await new Promise((r) => { const t = setInterval(() => { if (el.editor) { clearInterval(t); r(); } }, 50); });
    window.__ed = el.editor;
    window.__logs = [];
    document.addEventListener('strudel.log', (e) => { const m = (e.detail && e.detail.message) || ''; if (/error|not found|warn/i.test(m)) window.__logs.push(m); });
    await window.__ed.evaluate();
    await new Promise((r) => setTimeout(r, 2500)); // laisse prebake charger les banques
    window.__ed.stop();
  });
  if (offline) await ctx.setOffline(true);

  async function evalCode(code, { playMs = 1200, cycles = 1 } = {}) {
    return page.evaluate(async ({ code, playMs, cycles }) => {
      const ed = window.__ed;
      window.__logs.length = 0;
      ed.setCode(code);
      // Même règle que l'app (src/lib/engine.js) : sans setcpm/setcps, tempo par défaut.
      if (!/\bsetcp[ms]\s*\(/.test(code.replace(/\/\/.*$/gm, ''))) ed.repl.setCps(0.5);
      let error = '';
      try { await ed.evaluate(); } catch (e) { error = String(e && e.message || e); }
      const st = ed.repl.state;
      if (!error && (st.evalError || st.schedulerError)) error = String((st.evalError || st.schedulerError).message || st.evalError || st.schedulerError);
      let haps = [];
      if (!error) {
        try {
          haps = st.pattern.queryArc(0, cycles).filter((h) => h.hasOnset()).map((h) => ({
            b: Math.round(Number(h.whole.begin.valueOf()) * 1000) / 1000,
            e: Math.round(Number(h.whole.end.valueOf()) * 1000) / 1000,
            v: h.value,
          }));
        } catch (e) { error = 'query: ' + String(e && e.message || e); }
      }
      if (playMs) await new Promise((r) => setTimeout(r, playMs));
      const st2 = ed.repl.state;
      if (!error && st2.schedulerError) error = String(st2.schedulerError.message || st2.schedulerError);
      const cps = ed.repl.scheduler.cps;
      const midi = (v) => { if (v == null) return null; if (typeof v === 'number') return v; try { const m = window.noteToMidi(String(v)); return Number.isFinite(m) ? m : null; } catch { return null; } };
      const appHaps = (a, b) => { try { return st.pattern.queryArc(a, b).filter((h) => h.hasOnset()).map((h) => { const v = h.value && typeof h.value === 'object' ? h.value : { value: h.value }; return { begin: Number(h.whole.begin.valueOf()), end: Number(h.whole.end.valueOf()), value: v, s: v.s != null ? String(v.s) : null, note: v.note != null ? midi(v.note) : null }; }).sort((x, y) => x.begin - y.begin); } catch { return []; } };
      const app = error ? { haps: [], haps4: [] } : { haps: appHaps(0, 1), haps4: appHaps(0, 4) };
      ed.stop();
      return { error, logs: [...new Set(window.__logs)], haps, cps, app };
    }, { code, playMs, cycles });
  }
  return { page, evalCode, requests, close: async () => { await browser.close(); await srv.close(); } };
}

// Usage direct : node scripts/harness.mjs 'note("c e g")' ['autre code'…]
if (process.argv[1] && process.argv[1].endsWith('harness.mjs') && process.argv.length > 2) {
  const eng = await openEngine();
  for (const code of process.argv.slice(2)) {
    const r = await eng.evalCode(code, { playMs: 900 });
    const brief = r.haps.slice(0, 24).map((h) => h.b + ':' + JSON.stringify(h.v)).join('  ');
    console.log('\n# ' + code.replace(/\n/g, ' ⏎ ') + '\n  n=' + r.haps.length + ' cps=' + r.cps + (r.error ? '  ERROR: ' + r.error : '') + (r.logs.length ? '  LOGS: ' + r.logs.join(' | ') : '') + '\n  ' + brief);
  }
  await eng.close();
}
