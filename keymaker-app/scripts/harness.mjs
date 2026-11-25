// Banc d'essai : le moteur Strudel vendorisé dans un Chromium sans interface.
// openEngine() → { evalCode(code, opts), requests, close() }
// openEngines(n) → { engines, map(items, fn, onResult), close() } : n pages en parallèle
//   evalCode renvoie { error, logs, haps, cps } — error = erreur d'évaluation,
//   logs = messages d'erreur du moteur pendant la lecture (son introuvable…).
import { launchBrowser } from './browser.mjs';
import { serve } from './static-server.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { cpus } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = `<!doctype html><html><head><meta charset="utf-8">
<script src="/vendor/strudel-repl/index.js" defer></script></head><body><div id="host"></div></body></html>`;

// Nombre de pages pour les contrôles répartis : --pages N, sinon KM_PAGES, sinon
// le nombre de cœurs, plafonné à 4. --pages 1 refait tout dans une seule page, en série.
export function pageCount() {
  const i = process.argv.indexOf('--pages');
  const v = Number(i > 0 ? process.argv[i + 1] : process.env.KM_PAGES);
  if (Number.isInteger(v) && v >= 1) return v;
  return Math.max(1, Math.min(4, cpus().length));
}

// Un moteur dans une page à part (contexte de navigation à part : son propre AudioContext,
// son propre éditeur, son propre journal). Plusieurs moteurs peuvent partager un navigateur.
async function newEngine(browser, srv, requests, { offline = false } = {}) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
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
      // Chaque code part d'un moteur audio neuf, comme au premier ▶ dans l'app : les orbites
      // créées par le code précédent sont effacées. Sans cela, le résultat dépendrait de
      // l'ordre de passage (ex. duck(2) ne trouve l'orbite 2 que si un code joué AVANT l'a
      // créée), donc de la page qui reçoit l'exemple quand le contrôle est réparti.
      try { window.resetGlobalEffects(); } catch { /* moteur sans cette fonction */ }
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
  return { page, evalCode, requests };
}

export async function openEngine({ offline = false } = {}) {
  const srv = await serve(join(here, '..', 'public'));
  const browser = await launchBrowser();
  const requests = new Set();
  const eng = await newEngine(browser, srv, requests, { offline });
  return { ...eng, close: async () => { await browser.close(); await srv.close(); } };
}

// n moteurs, un seul navigateur et un seul serveur.
// map(items, fn, onResult) : chaque page prend l'élément suivant libre et lance
// fn(moteur, élément, index) ; onResult(résultat, élément, index) est appelé dans l'ORDRE
// des éléments, dès que tous les précédents sont terminés : la sortie est la même qu'en série.
export async function openEngines(n = pageCount(), { offline = false } = {}) {
  const srv = await serve(join(here, '..', 'public'));
  const browser = await launchBrowser();
  const requests = new Set();
  const engines = await Promise.all(Array.from({ length: n }, () => newEngine(browser, srv, requests, { offline })));
  async function map(items, fn, onResult) {
    const out = new Array(items.length);
    const done = new Array(items.length).fill(false);
    let next = 0;
    let flushed = 0;
    const flush = () => {
      while (flushed < items.length && done[flushed]) {
        if (onResult) onResult(out[flushed], items[flushed], flushed);
        flushed++;
      }
    };
    await Promise.all(engines.map(async (eng) => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(eng, items[i], i);
        done[i] = true;
        flush();
      }
    }));
    return out;
  }
  return { engines, size: n, map, requests, close: async () => { await browser.close(); await srv.close(); } };
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
