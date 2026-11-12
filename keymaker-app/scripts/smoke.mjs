// Test de fumée de l'app CONSTRUITE (dist-pi, base /keymaker/app/), dans Chromium :
//   - trois tailles d'écran (PC, tablette, téléphone) × deux thèmes (clair, sombre) ;
//   - un parcours réel : accueil → première étape → ▶ → exercice validé → wiki → quiz ;
//   - hors ligne : service worker actif, pack de sons en cache, réseau coupé, puis
//     une étape, un genre, le wiki et le Studio doivent jouer sans erreur.
// Captures d'écran dans scripts/out/shots/.
// Usage : node scripts/smoke.mjs [--dir dist-pi] [--quick]
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './static-server.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dirArg = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : 'dist-pi';
const quick = process.argv.includes('--quick');
const onlyOffline = process.argv.includes('--only-offline');
const ROOT = join(here, '..', dirArg);
if (!existsSync(join(ROOT, 'index.html'))) { console.error('Build introuvable : ' + ROOT + ' (lance « npm run build:pi »)'); process.exit(2); }
const BASE = '/keymaker/app/';
const SHOTS = join(here, 'out', 'shots');
mkdirSync(SHOTS, { recursive: true });

const srv = await serve(ROOT, 0, { base: BASE });
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
let bad = 0;
const ok = (m) => console.log('  ✓ ' + m);
const fail = (m) => { bad++; console.log('  ✗ ' + m); };
const check = (cond, m) => (cond ? ok(m) : fail(m));

async function newPage(viewport, scheme) {
  const ctx = await browser.newContext({ viewport, colorScheme: scheme, hasTouch: viewport.width < 800, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text().slice(0, 200)); });
  return { ctx, page, errors };
}
const ready = (page) => page.waitForFunction(() => !!document.querySelector('.crown:not([disabled])'), null, { timeout: 30000 });
const text = (page, sel) => page.locator(sel).first().innerText().catch(() => '');

/* ---------- 1. Captures : tailles × thèmes ---------- */
const SIZES = { pc: { width: 1440, height: 900 }, tablette: { width: 834, height: 1112 }, telephone: { width: 390, height: 844 } };
const ROUTES = [['accueil', '#/'], ['parcours', '#/parcours'], ['etape', '#/etape/f.crochets'], ['genre', '#/genre/techno/kick'], ['comparer', '#/comparer?a=techno&b=trance'], ['wiki', '#/wiki/fx.lpf'], ['studio', '#/studio'], ['reglages', '#/reglages']];
for (const [size, viewport] of Object.entries(SIZES)) {
  for (const scheme of ['light', 'dark']) {
    if (onlyOffline) continue;
    if (quick && !(size === 'telephone' && scheme === 'dark') && !(size === 'pc' && scheme === 'light')) continue;
    console.log(`\n[${size} · ${scheme}]`);
    const { ctx, page, errors } = await newPage(viewport, scheme);
    await page.goto(srv.url);
    await page.waitForSelector('.resume', { timeout: 30000 });
    for (const [name, hash] of ROUTES) {
      await page.evaluate((h) => { window.location.hash = h; }, hash);
      await page.waitForTimeout(450);
      // Pas de débordement horizontal.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 2) fail(`${name} : débordement horizontal de ${overflow}px`);
      // Cibles tactiles : au moins 44 px de haut (boutons visibles).
      const small = await page.evaluate(() => [...document.querySelectorAll('button, a, select, input, textarea')]
        .filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !el.closest('.cm-editor') && !el.closest('[hidden]') && r.height < 43.5; })
        .map((el) => (el.className || el.tagName) + ':' + Math.round(el.getBoundingClientRect().height)).slice(0, 5));
      if (small.length) fail(`${name} : cibles trop petites → ${small.join(', ')}`);
      await page.screenshot({ path: join(SHOTS, `${size}-${scheme}-${name}.png`) });
    }
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
    check(scheme === 'dark' ? bg === '#090b10' : bg === '#e6e9ee', `thème ${scheme} appliqué (fond ${bg})`);
    check(!errors.length, 'aucune erreur de page' + (errors.length ? ' → ' + errors.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
}

/* ---------- 2. Un parcours réel ---------- */
console.log('\n[parcours d’un débutant · téléphone]');
if (!onlyOffline) {
  const { ctx, page, errors } = await newPage(SIZES.telephone, 'light');
  const t0 = Date.now();
  await page.goto(srv.url);
  await page.waitForSelector('.resume');
  check(/Commencer/i.test(await text(page, '.resume-kicker')), 'l’accueil propose « Commencer »');
  await page.click('.resume');
  await ready(page);
  check(/Appuie sur ▶/.test(await text(page, 'h1')), 'première étape ouverte en un geste');
  await page.click('.crown');
  await page.waitForSelector('.res-ok', { timeout: 15000 });
  ok(`premier son et première étape validée en ${((Date.now() - t0) / 1000).toFixed(1)} s après l’ouverture`);
  await page.waitForTimeout(900); // fin du défilement doux
  const okBox = await page.locator('.res-ok').boundingBox();
  check(okBox && okBox.y + okBox.height <= 844 - 70, 'la validation s’affiche dans l’écran, au-dessus de la barre d’onglets');
  await page.click('.res-ok .btn-primary');
  await page.waitForFunction(() => /Change un nombre/.test(document.querySelector('h1').innerText));
  // Étape 2 : sans modification → message neutre (ni reproche, ni indice).
  await page.click('.crown');
  await page.waitForSelector('.res-wait', { timeout: 15000 });
  check((await page.locator('.res-hint').count()) === 0, 'code non modifié : message neutre, pas d’indice ni de reproche');
  const overflowPlaying = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflowPlaying <= 2, 'pendant la lecture, rien ne déborde à droite (' + overflowPlaying + ' px)');
  const transportOk = await page.evaluate(() => [...document.querySelectorAll('.transport > *')].every((el) => el.getBoundingClientRect().right <= document.querySelector('.dock-glass').getBoundingClientRect().right + 1));
  check(transportOk, 'pendant la lecture, ▶, « Relancer » et les outils tiennent dans le cadre');
  // Faute de frappe : message qui dit ce qui manque, et l'étape le sait.
  await page.evaluate(() => { const ed = document.querySelector('strudel-editor').editor; ed.setCode('setcpm(132/4)\nsound("bd*4'); });
  await page.click('.btn-relaunch');
  await page.waitForSelector('.dock-error', { timeout: 15000 });
  const err = await text(page, '.dock-error p');
  check(/Il manque un guillemet/.test(err), 'faute de frappe : « ' + err + ' »');
  check(/faute de frappe/.test(await text(page, '.res-hint')), 'faute de frappe : l’étape le dit au lieu d’un indice hors sujet');
  // Correction : setcpm(132/4) + sound("bd*4") — code valide, tempo changé.
  await page.evaluate(() => { const ed = document.querySelector('strudel-editor').editor; ed.setCode(ed.code + '")'); });
  await page.click((await page.locator('.btn-relaunch').count()) ? '.btn-relaunch' : '.crown');
  await page.waitForFunction(() => !document.querySelector('.dock-error'), null, { timeout: 15000 }).then(() => ok('le message rouge disparaît une fois la faute corrigée')).catch(() => fail('le message rouge reste après correction'));
  await page.waitForSelector('.res-ok', { timeout: 15000 });
  ok('tempo changé : exercice validé localement, sans IA');
  // Rechargement de la page sur l'étape : le code est toujours là (il était vide avant correction).
  await page.reload();
  await ready(page);
  const reloaded = await page.evaluate(() => document.querySelector('strudel-editor').editor.code);
  check(/setcpm\(132\/4\)/.test(reloaded), 'après un rechargement, l’éditeur contient le code de l’étape (et ta modification)');
  // Tempo : un code sans setcpm joue au tempo par défaut, quel que soit le code joué avant.
  await page.evaluate(() => { window.location.hash = '#/etape/f.un-son'; });
  await page.waitForFunction(() => /Un seul son/.test(document.querySelector('h1').innerText));
  await page.click('.crown');
  await page.waitForTimeout(500);
  const cps = await page.evaluate(() => document.querySelector('strudel-editor').editor.repl.scheduler.cps);
  check(cps === 0.5, 'un code sans setcpm joue à 30 cycles par minute (cps = ' + cps + ')');
  check((await page.locator('.dock-error').count()) === 0, 'pas de message d’erreur hérité de l’étape précédente');
  await page.click('.crown');
  await page.evaluate(() => { window.location.hash = '#/etape/f.tempo'; });
  await page.waitForFunction(() => /Change un nombre/.test(document.querySelector('h1').innerText));
  // Wiki depuis le code.
  await page.click('.incode-list .chip');
  await page.waitForSelector('.sheet .entry');
  check((await text(page, '.sheet .entry-term')).length > 0, 'un élément du code ouvre son entrée du wiki par-dessus la leçon');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.sheet', { state: 'detached' });
  const still = await page.evaluate(() => document.querySelector('strudel-editor').editor.code.includes('132/4'));
  check(still, 'le code en cours est intact après le wiki');
  // Reprise en un geste.
  await page.evaluate(() => { window.location.hash = '#/'; });
  await page.waitForSelector('.resume');
  check(/Continuer/i.test(await text(page, '.resume-kicker')), 'l’accueil propose « Continuer »');
  // Point d'étape.
  await page.evaluate(() => { window.location.hash = '#/point/premier-son'; });
  await page.waitForSelector('.choice');
  await page.click('.choice');
  await page.waitForSelector('.explain');
  ok('point d’étape : question, réponse, explication');
  // Recherche wiki.
  await page.evaluate(() => { window.location.hash = '#/wiki'; });
  await page.fill('.searchbox input', 'tierce');
  await page.waitForSelector('.result');
  check(/tierce/i.test(await text(page, '.result-t')), 'recherche « tierce » → entrée trouvée');
  await page.fill('.searchbox input', 'cutoff');
  await page.waitForTimeout(200);
  check(/lpf/.test(await text(page, '.result-t')), 'recherche d’un alias (« cutoff ») → entrée lpf');
  // (Le moteur journalise la faute de frappe introduite volontairement plus haut : attendu.)
  const unexpected = errors.filter((e) => !/Unterminated string constant/.test(e));
  check(!unexpected.length, 'aucune erreur de page' + (unexpected.length ? ' → ' + unexpected.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

/* ---------- 3. Migration des données de l'ancienne app ---------- */
console.log('\n[données de l’ancienne app]');
if (!onlyOffline) {
  const { ctx, page } = await newPage(SIZES.pc, 'dark');
  await page.addInitScript(() => {
    if (localStorage.getItem('seeded')) return;
    localStorage.setItem('seeded', '1');
    localStorage.setItem('keymaker:progress', JSON.stringify({ seen: { '0:0:0': 1, '0:0:3': 2, '3:1:0': 3 }, days: ['2026-06-10'] }));
    localStorage.setItem('keymaker:srs', JSON.stringify({ mastery: { '1.4': 'mastered', '4.6': 'practiced' }, cards: { '1.4': { box: 2, due: '2026-06-13', last: 1 } } }));
    localStorage.setItem('keymaker:glossnotes', JSON.stringify({ 'son:passe-bas (lpf)': 'LPF = lunettes de soleil', 'rythme:cycle': 'un tour de cadran', 'guitare:capo': 'pince', 'vieux:terme disparu': 'note orpheline' }));
    localStorage.setItem('keymaker:studio:code', 's("bd*4") // mon studio');
  });
  await page.goto(srv.url);
  await page.waitForSelector('.resume');
  const st = await page.evaluate(() => ({ state: JSON.parse(localStorage.getItem('km2:state')), srs: JSON.parse(localStorage.getItem('keymaker:srs')), old: localStorage.getItem('keymaker:progress'), notes: JSON.parse(localStorage.getItem('keymaker:glossnotes')) }));
  check(st.state.steps['f.play'] && st.state.steps['f.un-son'], 'leçons vues reportées sur le nouveau parcours');
  check(st.state.steps['f.un-son'].done && st.srs.mastery['f.un-son'] === 'mastered', 'maîtrise reportée (ancienne leçon 1.4 → étape « Un seul son »)');
  check(st.state.steps['L4.4.6'] && st.state.steps['L4.4.6'].done && !st.state.steps['L1.4.6'], 'identifiant ambigu attribué à la leçon réellement ouverte (module 4)');
  check(st.srs.mastery['1.4'] === 'mastered' && !!st.old && Object.keys(st.notes).length === 4, 'anciennes clés intactes');
  await page.evaluate(() => { window.location.hash = '#/wiki/fx.lpf'; });
  await page.waitForSelector('.mynote textarea');
  check((await page.inputValue('.mynote textarea')) === 'LPF = lunettes de soleil', 'annotation d’origine affichée sur l’entrée lpf');
  await page.evaluate(() => { window.location.hash = '#/annotations'; });
  await page.waitForSelector('.annot');
  check((await page.locator('.annot').count()) === 4, 'les 4 annotations sont listées, y compris l’orpheline');
  await page.evaluate(() => { window.location.hash = '#/studio'; });
  await page.waitForFunction(() => { const e = document.querySelector('strudel-editor'); return e && e.editor && /mon studio/.test(e.editor.code); }, null, { timeout: 30000 }).then(() => ok('code du Studio retrouvé')).catch(() => fail('code du Studio non retrouvé'));
  await ctx.close();
}

/* ---------- 4. Hors ligne ---------- */
console.log('\n[hors ligne]');
{
  const { ctx, page, errors } = await newPage(SIZES.tablette, 'dark');
  await page.goto(srv.url);
  await page.waitForSelector('.resume');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 60000 });
  ok('service worker actif');
  await page.evaluate(() => { window.location.hash = '#/reglages'; });
  await page.waitForFunction(() => /prêts \(\d+ fichiers\)/.test(document.body.innerText), null, { timeout: 600000 });
  ok('pack de sons : ' + (await page.evaluate(() => (document.body.innerText.match(/prêts \((\d+) fichiers\)/) || [])[1])) + ' fichiers en cache');
  await ctx.setOffline(true);
  const failedReq = [];
  page.on('requestfailed', (r) => failedReq.push(r.url()));
  await page.goto(srv.url);
  await page.waitForSelector('.resume', { timeout: 30000 });
  ok('l’app redémarre réseau coupé');
  const logs = [];
  await page.exposeFunction('__log', (m) => logs.push(m));
  await page.evaluate(() => document.addEventListener('strudel.log', (e) => { const m = (e.detail && e.detail.message) || ''; if (/error|not found/i.test(m)) window.__log(m); }));
  const play = async (hash, label, wait = 3500) => {
    await page.evaluate((h) => { window.location.hash = h; }, hash);
    await ready(page);
    await page.waitForTimeout(300);
    await page.click('.crown');
    await page.waitForTimeout(wait);
    const err = await page.locator('.dock-error').count();
    const playing = await page.locator('.crown.is-playing').count();
    check(playing === 1 && err === 0, label + ' joue hors ligne');
    await page.click('.crown');
  };
  await play('#/etape/f.play', 'étape « Appuie sur ▶ » (batterie TR-909, piano, synthé)');
  await play('#/etape/f.premier-beat', 'étape « Ton premier rythme »');
  await play('#/genre/synthpop/assemblage', 'genre synth-pop, assemblage (boîte AkaiLinn)');
  await play('#/genre/trance/timbres', 'genre trance, timbres (supersaw)');
  await play('#/etape/L3.3.8', 'approfondissement guitare (police de sons gm_)');
  await play('#/studio', 'Studio');
  await page.evaluate(() => { window.location.hash = '#/wiki/son.batterie'; });
  await page.waitForSelector('.playmini');
  await page.click('.playmini');
  await page.waitForTimeout(2000);
  check((await page.locator('.playmini.is-on').count()) === 1, 'un exemple du wiki joue hors ligne');
  const missing = failedReq.filter((u) => /\.(wav|mp3|ogg|flac)$|webaudiofontdata|strudel\.json|dough-samples/.test(u));
  check(!missing.length, 'aucun son demandé au réseau' + (missing.length ? ' → ' + [...new Set(missing)].slice(0, 4).join(' , ') : ''));
  check(!logs.length, 'aucun son introuvable' + (logs.length ? ' → ' + [...new Set(logs)].slice(0, 3).join(' | ') : ''));
  // Sati hors ligne : un message clair, rien de cassé.
  await page.evaluate(() => { window.location.hash = '#/'; });
  await page.click('.topbar-tools .iconbtn');
  await page.waitForSelector('.chat-down');
  ok('Sati hors ligne : message clair, le reste fonctionne');
  await page.screenshot({ path: join(SHOTS, 'hors-ligne-sati.png') });
  const real = errors.filter((e) => !/ERR_INTERNET_DISCONNECTED|net::|Failed to fetch/.test(e));
  check(!real.length, 'aucune erreur de page' + (real.length ? ' → ' + real.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

await browser.close();
await srv.close();
console.log(bad ? `\n${bad} vérification(s) en échec` : '\nTout passe.');
process.exit(bad ? 1 : 0);
