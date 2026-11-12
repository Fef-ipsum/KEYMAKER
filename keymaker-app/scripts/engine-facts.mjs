// Extrait du moteur Strudel vendorisé les FAITS vérifiables : fonctions globales,
// méthodes de Pattern, contrôles et leurs alias, sons enregistrés, thèmes.
// Sortie : scripts/out/engine-facts.json (sert aux tests d'exactitude du wiki).
import { chromium } from 'playwright';
import { serve } from './static-server.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
const here = dirname(fileURLToPath(import.meta.url));
const srv = await serve(join(here, '..', 'public'));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.goto(srv.url + '__probe.html');
await page.waitForFunction(() => customElements.get('strudel-editor'));
const out = await page.evaluate(async () => {
  const frame = document.createElement('iframe'); document.body.appendChild(frame);
  const base = new Set(Object.getOwnPropertyNames(frame.contentWindow));
  const el = document.createElement('strudel-editor');
  el.setAttribute('code', 's("bd")');
  document.getElementById('host').appendChild(el);
  await new Promise((r) => { const t = setInterval(() => { if (el.editor) { clearInterval(t); r(); } }, 50); });
  await el.editor.evaluate(); await new Promise((r) => setTimeout(r, 4000)); el.editor.stop();
  const globals = Object.getOwnPropertyNames(window).filter((k) => !base.has(k) && !/^__|^webkit|^on/.test(k));
  const fns = globals.filter((k) => typeof window[k] === 'function').sort();
  const methods = Object.getOwnPropertyNames(window.Pattern.prototype).filter((k) => !k.startsWith('_')).sort();
  // Contrôles : f("1") → Pattern dont la valeur est { cle: 1 } → cle = nom canonique.
  const controls = {};
  for (const k of fns) {
    if (/^[A-Z]/.test(k) || ['evaluate', 'hush', 'samples', 'setcpm', 'setcps', 'alert', 'confirm', 'prompt', 'print', 'open', 'close', 'stop', 'focus', 'blur'].includes(k)) continue;
    try {
      const p = window[k]('1');
      if (p && typeof p.queryArc === 'function') {
        const h = p.queryArc(0, 1)[0];
        if (h && h.value && typeof h.value === 'object' && !Array.isArray(h.value)) {
          const keys = Object.keys(h.value);
          if (keys.length === 1) controls[k] = keys[0];
        }
      }
    } catch { /* pas un contrôle */ }
  }
  let sounds = {};
  try { const m = window.soundMap.get(); for (const k of Object.keys(m)) sounds[k] = (m[k].data && m[k].data.type) || 'unknown'; } catch (e) { sounds = { error: String(e) }; }
  let themes = []; try { themes = Object.keys(window.themes); } catch {}
  return { fns, methods, controls, sounds, themes };
});
mkdirSync(join(here, 'out'), { recursive: true });
writeFileSync(join(here, 'out', 'engine-facts.json'), JSON.stringify(out, null, 1));
const alias = {}; for (const [k, v] of Object.entries(out.controls)) (alias[v] ||= []).push(k);
console.log('fns', out.fns.length, 'methods', out.methods.length, 'controls', Object.keys(out.controls).length, 'sounds', Object.keys(out.sounds).length);
console.log('themes', out.themes.join(' '));
console.log('aliases:', Object.entries(alias).filter(([, a]) => a.length > 1).map(([k, a]) => k + '←' + a.filter((x) => x !== k).join(',')).join(' | '));
const types = {}; for (const [k, t] of Object.entries(out.sounds)) (types[t] ||= []).push(k);
for (const [t, a] of Object.entries(types)) console.log('SOUNDS', t, a.length, a.slice(0, t === 'sample' ? 400 : 80).join(' '));
await browser.close(); await srv.close();
