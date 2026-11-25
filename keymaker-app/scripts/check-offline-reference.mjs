// Recalcule reference-skip.json : les exemples de la référence officielle qui NE JOUENT PAS
// hors ligne (sons absents du pack embarqué). Règle de l'app : tout ce qui est affiché joue
// sans réseau.
//
// Pourquoi un outil à part : build-sample-pack.mjs ajoute des exemples à la liste mais n'en
// retire jamais ; une liste ancienne garde donc des exemples qui jouent maintenant, et
// reference.json, s'il n'est pas reconstruit, peut afficher des exemples qui ne jouent pas.
//
// La liste sert à plusieurs raisons : un exemple en est retiré seulement s'il passe LES DEUX
// épreuves :
//  1. il produit des sons dans le moteur, sans erreur ni message (scripts/harness.mjs) :
//     écarte `.osc()` (SuperCollider), `silence`, l'entrée MIDI, les capteurs du téléphone… ;
//  2. il joue dans l'app construite (dist/) servie en local, service worker bloqué et TOUT
//     le réseau extérieur coupé : aucun son demandé au réseau, introuvable (« not found »)
//     ou non chargé (« Failed to fetch »).
//
// Usage : npm run build && node scripts/check-offline-reference.mjs [--all] [--write]
//   par défaut : les exemples de la liste actuelle (pour en faire revenir) ;
//   --all      : aussi tous les exemples affichés (lent : plusieurs centaines) ;
//   --write    : réécrit reference-skip.json ; relancer ensuite build-reference.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { launchBrowser } from './browser.mjs';
import { serve } from './static-server.mjs';
import { openEngine } from './harness.mjs';

const here = new URL('.', import.meta.url);
const skipUrl = new URL('../src/content/wiki/reference-skip.json', here);
const refUrl = new URL('../src/content/wiki/reference.json', here);
const skip = JSON.parse(readFileSync(skipUrl, 'utf8'));
const ref = JSON.parse(readFileSync(refUrl, 'utf8'));
const shown = ref.entries.flatMap((e) => e.x);
const toTest = [...new Set([...skip, ...(process.argv.includes('--all') ? shown : [])])];

const srv = await serve(new URL('../dist', here).pathname, 0);
const browser = await launchBrowser();
const ctx = await browser.newContext({ serviceWorkers: 'block' });
let bad = [];
await ctx.route('**/*', (r) => {
  const u = r.request().url();
  if (u.startsWith(srv.url)) return r.continue();
  bad.push('réseau : ' + u.replace(/^https?:\/\/[^/]+/, '').slice(0, 70));
  return r.abort();
});
const page = await ctx.newPage();
page.on('console', (m) => {
  const t = m.text();
  if (/not found|Failed to fetch/i.test(t)) bad.push(t.replace(/%c|background-color:.*$/g, '').trim().slice(0, 80));
});
page.on('response', (r) => {
  if (r.status() >= 400 && r.url().startsWith(srv.url)) bad.push(r.status() + ' ' + r.url().replace(srv.url, '').slice(0, 60));
});
await page.goto(srv.url + '#/studio');
await page.waitForFunction(() => !!document.querySelector('.crown:not([disabled])'), null, { timeout: 30000 });
const play = async (code) => {
  await page.click('.cm-content');
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(code);
  await page.keyboard.press('Control+Enter');
};

const eng = await openEngine();
const keep = [];
let back = 0;
for (const code of toTest) {
  // Épreuve 1 : des sons, sans erreur.
  const r = await eng.evalCode(code, { cycles: 4, playMs: 0 }).catch((e) => ({ error: String(e), haps: [], logs: [] }));
  const plays = !r.error && !(r.logs || []).length && (r.haps || []).some((h) => h.v && (h.v.s != null || h.v.note != null || h.v.n != null || h.v.freq != null));
  if (!plays) {
    keep.push(code);
    if (!skip.includes(code)) console.log('✗ ' + code.replace(/\n/g, ' ⏎ ').slice(0, 70) + '\n    ' + (r.error || (r.logs || [])[0] || 'aucun son'));
    continue;
  }
  // Épreuve 2 : hors ligne, dans l'app.
  await play('silence'); // le motif précédent se tait : ses erreurs ne débordent pas
  await page.waitForTimeout(1200);
  bad = [];
  await play(code);
  await page.waitForTimeout(3500);
  const why = [...new Set(bad)];
  const was = skip.includes(code);
  if (why.length) keep.push(code);
  else if (was) back++;
  if (why.length || was) console.log((why.length ? '✗ ' : '✓ ') + code.replace(/\n/g, ' ⏎ ').slice(0, 70) + (why.length ? '\n    ' + why.slice(0, 2).join(' · ') : ' (joue hors ligne : revient)'));
}
await browser.close();
await eng.close?.();
console.log(`\nexemples testés : ${toTest.length} · restent exclus : ${keep.length} · reviennent : ${back}`);
if (process.argv.includes('--write')) {
  writeFileSync(skipUrl, JSON.stringify(keep, null, 1));
  console.log('reference-skip.json réécrit. Relance : node scripts/build-reference.mjs');
}
process.exit(0);
