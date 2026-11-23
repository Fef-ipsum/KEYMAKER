// Test de fumée de l'app CONSTRUITE (dist-pi, base /keymaker/app/), dans Chromium :
//   - trois tailles d'écran (PC, tablette, téléphone) × deux thèmes (clair, sombre) ;
//   - un parcours réel : accueil → première étape → ▶ → exercice validé → wiki → quiz ;
//   - hors ligne : service worker actif, pack de sons en cache, réseau coupé, puis
//     une étape, un genre, le wiki et le Studio doivent jouer sans erreur.
// Captures d'écran dans scripts/out/shots/.
// Usage : node scripts/smoke.mjs [--dir dist-pi] [--quick]
import { launchBrowser } from './browser.mjs';
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
const browser = await launchBrowser();
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
const ROUTES = [['accueil', '#/'], ['parcours', '#/parcours'], ['etape', '#/etape/f.crochets'], ['genre', '#/genre/techno/kick'], ['comparer', '#/comparer?a=techno&b=trance'], ['wiki', '#/wiki/fx.lpf'], ['wiki-adsr', '#/wiki/fx.adsr'], ['wiki-ondes', '#/wiki/son.ondes'], ['wiki-lpenv', '#/wiki/fx.lpenv'], ['wiki-crochets', '#/wiki/mini.crochets'], ['wiki-tempo', '#/wiki/sol.tempo'], ['wiki-accord', '#/wiki/sol.accord'], ['wiki-gamme', '#/wiki/sol.gamme'], ['wiki-signal', '#/wiki/fn.signaux'], ['wiki-echo', '#/wiki/fx.delay'], ['wiki-reverb', '#/wiki/fx.room'], ['schemas', '#/schemas'], ['studio', '#/studio'], ['reglages', '#/reglages']];
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

/* ---------- 2 bis. Les schémas vivants ---------- */
console.log('\n[schémas vivants]');
if (!onlyOffline) {
  for (const [label, vp, scheme] of [['téléphone', SIZES.telephone, 'light'], ['pc', SIZES.pc, 'dark']]) {
    const { ctx, page, errors } = await newPage(vp, scheme);
    const playing = (sel) => page.locator(sel).count().then((n) => n > 0);
    // Complet au repos : le dessin est là avant toute lecture (wiki).
    await page.goto(srv.url + '#/wiki/fx.lpf');
    await page.waitForSelector('.schema-filtre .sch-curve', { timeout: 30000 });
    const d = await page.getAttribute('.schema-filtre path.sch-curve', 'd');
    check(d && d.length > 200, `${label} · wiki : la courbe du filtre est dessinée avant toute lecture`);
    // Étape : le schéma apparaît dans « Ce que tu entends », avant le texte.
    await page.evaluate(() => { window.location.hash = '#/etape/f.resonance'; });
    await ready(page);
    await page.click('.crown');
    await page.waitForSelector('.moment-name .schema-filtre', { timeout: 15000 });
    const order = await page.evaluate(() => { const m = document.querySelector('.moment-name'); const sc = m.querySelector('.schema-wrap'); const p = m.querySelector(':scope > p'); return !!(sc && p && (sc.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING)); });
    check(order, `${label} · étape : le schéma vient avant le texte qui nomme la notion`);
    // Un seul son à la fois : le schéma arrête l'éditeur…
    check(await playing('.crown.is-playing'), `${label} · l’éditeur joue`);
    await page.locator('.schema-filtre .sch-play').scrollIntoViewIfNeeded();
    await page.click('.schema-filtre .sch-play');
    await page.waitForTimeout(400);
    check(!(await playing('.crown.is-playing')) && (await playing('.schema-filtre .sch-play.is-on')), `${label} · le schéma joue et l’éditeur s’est arrêté`);
    // On attrape le dessin : la coupure descend, le code suit, la mission « ferme » se valide.
    const box = await page.locator('.schema-filtre svg.sch-svg').boundingBox();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.4);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.45, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    const code = await text(page, '.schema-filtre .sch-code code');
    const f = Number((code.match(/lpf\((\d+)\)/) || [])[1]);
    check(f > 0 && f < 300, `${label} · glisser sur le dessin change la coupure (${code.match(/lpf\(\d+\)/)})`);
    check((await page.locator('.schema-filtre .sch-mission.is-done .sch-learned').count()) >= 1, `${label} · mission « ferme » validée pendant la lecture, phrase de compréhension affichée`);
    // Au clavier.
    await page.focus('.schema-filtre .sch-handle');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(150);
    check(/lpq\(2\)/.test(await text(page, '.schema-filtre .sch-code code')), `${label} · la poignée se règle au clavier (flèche haut → lpq(2))`);
    // Avant / après.
    const hb = await page.locator('.schema-filtre .sch-hold').boundingBox();
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(250);
    const off = await page.locator('.schema-filtre .sch-curve-off').count();
    await page.mouse.up();
    await page.waitForTimeout(250);
    check(off === 1 && (await page.locator('.schema-filtre .sch-curve-off').count()) === 0, `${label} · « Maintiens : sans filtre » montre la ligne à 0 dB, puis revient`);
    // … et l'éditeur arrête le schéma.
    await page.click('.crown');
    await page.waitForTimeout(400);
    check(!(await playing('.schema-filtre .sch-play.is-on')), `${label} · ▶ dans l’éditeur arrête le schéma`);
    await page.click('.crown');
    // Enveloppe : « Pincé », puis jouer (notes de 2 s, durée donnée par le code) → mission « pince ».
    await page.evaluate(() => { window.location.hash = '#/etape/f.pluck'; });
    await ready(page);
    await page.click('.crown');
    await page.waitForSelector('.schema-adsr', { timeout: 15000 });
    await page.click('.crown');
    await page.locator('.schema-adsr .sch-presets').scrollIntoViewIfNeeded();
    await page.click('.schema-adsr .sch-presets .chip:has-text("Pincé")');
    await page.waitForTimeout(200);
    check(/note\("c3"\).*sustain\(0\)/.test(await text(page, '.schema-adsr .sch-code code')), `${label} · exemple « Pincé » : le code montre note("c3") et sustain(0)`);
    await page.click('.schema-adsr .sch-play');
    await page.waitForTimeout(1300);
    const phaseOn = await page.locator('.schema-adsr .sch-phases li.is-on').count();
    check(phaseOn === 1, `${label} · pendant la lecture, une phase de l’enveloppe est allumée`);
    check((await page.locator('.schema-adsr .sch-mission.is-done').count()) >= 1, `${label} · mission « pince » validée (notes de 2 s, sustain 0)`);
    check((await page.locator('.schema-adsr .sch-trace path').count()) === 1, `${label} · la trace dorée de la dernière note est dessinée`);
    // La durée des notes vient du code : 4 notes par cycle → note("c3*4"), notes de 0,5 s.
    await page.click('.schema-adsr .sch-choice-b:has-text("4 · 0,5 s")');
    await page.waitForTimeout(300);
    check(/note\("c3\*4"\)/.test(await text(page, '.schema-adsr .sch-code code')) && /la note dure 0,5 s/.test(await page.locator('.schema-adsr svg').first().textContent()), `${label} · 4 notes par cycle : le code devient note("c3*4") et le dessin annonce des notes de 0,5 s`);
    await page.click('.schema-adsr .sch-play');
    await page.screenshot({ path: join(SHOTS, `schemas-${label}-${scheme}-adsr.png`) });
    // Point d'étape du chapitre 6 : jusqu'aux questions « à l'oreille ».
    await page.evaluate(() => { window.location.hash = '#/point/timbre'; });
    for (let i = 0; i < 12; i++) {
      await page.waitForSelector('.question', { timeout: 15000 });
      if (await page.locator('.ear').count()) break;
      await page.click('.choice');
      await page.click('.steprow .btn-primary');
    }
    check((await page.locator('.ear').count()) === 1, `${label} · le point d’étape du chapitre 6 contient une question « à l’oreille »`);
    await page.click('.ear-controls .sch-play:has-text("Le son mystère")');
    await page.waitForTimeout(400);
    check(await playing('.ear-controls .sch-play.is-on'), `${label} · le son mystère joue`);
    await page.click('.ear-controls .btn-primary');
    await page.waitForSelector('.ear + .explain, .ear .explain', { timeout: 5000 });
    check((await page.locator('.ear .sch-curve-target').count()) === 1, `${label} · après la réponse, la courbe du son mystère apparaît`);
    await page.screenshot({ path: join(SHOTS, `schemas-${label}-${scheme}-oreille.png`) });
    // Sati voit le schéma, et montre en réglant (bloc ```schema) ; un bloc invalide reste du texte.
    let sent = null;
    await page.route('**/keymaker/ai/chat', async (route) => {
      sent = JSON.parse(route.request().postData() || '{}');
      const textOut = 'Regarde :\n```schema\n{"type":"filtre","reglages":{"lpf":800,"lpq":18},"source":"tenue"}\n```\nEt ceci :\n```schema\n{"type":"filtre","reglages":{"lpf":99999}}\n```';
      await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream', 'access-control-allow-origin': '*' }, body: 'event: done\ndata: ' + JSON.stringify({ text: textOut }) + '\n\n' });
    });
    await page.evaluate(() => { window.location.hash = '#/wiki/fx.lpq'; });
    await page.waitForSelector('.schema-filtre');
    await page.locator('.topbar-tools .iconbtn:visible, .nav-extra:visible').first().click();
    await page.waitForSelector('.chatform textarea');
    await page.fill('.chatform textarea', 'Pourquoi ça siffle ?');
    await page.click('.chatform button[type=submit]');
    await page.waitForSelector('.chat-schema .schema-filtre', { timeout: 15000 });
    check(sent && /Schéma dans le wiki : filtre passe-bas — lpf 700 Hz, lpq 0/.test(sent.context || ''), `${label} · Sati reçoit le schéma à l’écran dans son contexte`);
    check(sent && /```schema/.test(sent.context || '') && /adsr —/.test(sent.context || ''), `${label} · Sati reçoit la description du catalogue`);
    check((await page.locator('.chat-schema .schema-filtre').count()) === 1 && /99999/.test(await text(page, '.msg-sati')), `${label} · bloc valide → schéma vivant ; bloc invalide → reste du texte`);
    await page.screenshot({ path: join(SHOTS, `schemas-${label}-${scheme}-sati.png`) });
    await page.unroute('**/keymaker/ai/chat');
    // Vague 2 : ondes, passe-haut, enveloppe de filtre.
    await page.evaluate(() => { window.location.hash = '#/wiki/son.ondes'; });
    await page.waitForSelector('.schema-onde');
    await page.click('.schema-onde .sch-play');
    await page.click('.schema-onde .sch-wavebtn:has-text("Sinusoïde")');
    await page.waitForTimeout(300);
    check(/sound\("sine"\)/.test(await text(page, '.schema-onde .sch-code code')) && (await page.locator('.schema-onde .sch-mission.is-done').count()) >= 1, `${label} · ondes : toucher la sinusoïde change le code et valide « pure »`);
    check((await page.locator('.schema-onde .sch-bar:not(.is-empty)').count()) === 1, `${label} · ondes : la sinusoïde n’a qu’une barre`);
    await page.click('.schema-onde .sch-play');
    await page.evaluate(() => { window.location.hash = '#/wiki/fx.hpf'; });
    await page.waitForSelector('.schema-filtre');
    check(/hpf\(200\)\.hpq\(0\)/.test(await text(page, '.schema-filtre .sch-code code')), `${label} · passe-haut : le code dit hpf(200).hpq(0)`);
    await page.click('.schema-filtre .sch-choice-b:has-text("Passe-bas")');
    check(/lpf\(200\)\.lpq\(0\)/.test(await text(page, '.schema-filtre .sch-code code')), `${label} · changer de genre de filtre change les noms dans le code`);
    await page.evaluate(() => { window.location.hash = '#/wiki/fx.lpenv'; });
    await page.waitForSelector('.schema-fenv');
    await page.click('.schema-fenv .sch-play');
    await page.waitForTimeout(900);
    check((await page.locator('.schema-fenv .sch-trace path').count()) === 1 && (await page.locator('.schema-fenv .sch-curve-live').count()) === 1, `${label} · enveloppe de filtre : la trace et la courbe du filtre bougent pendant la lecture`);
    await page.screenshot({ path: join(SHOTS, `schemas-${label}-${scheme}-fenv.png`) });
    await page.click('.schema-fenv .sch-play');
    // Vague 3 : le cycle et le tempo.
    await page.evaluate(() => { window.location.hash = '#/wiki/mini.crochets'; });
    await page.waitForSelector('.schema-cycle');
    const blocks0 = await page.locator('.schema-cycle .sch-ev').count();
    await page.fill('.schema-cycle .sch-motif input', 'bd [hh hh] sd [hh hh hh]');
    await page.waitForTimeout(200);
    check((await page.locator('.schema-cycle .sch-ev').count()) > blocks0 && /\[hh hh hh\]/.test(await text(page, '.schema-cycle .sch-code code')), `${label} · cycle : écrire le motif redessine les blocs et la ligne de code`);
    await page.click('.schema-cycle .sch-play');
    await page.waitForTimeout(700);
    check((await page.locator('.schema-cycle .sch-head').count()) === 1, `${label} · cycle : la tête de lecture avance pendant la lecture`);
    await page.locator('.schema-cycle .sch-ev.is-tap').first().click();
    await page.waitForTimeout(200);
    check(/^~/.test((await text(page, '.schema-cycle .sch-code code')).replace(/^sound\("/, '')), `${label} · cycle : toucher un bloc le remplace par ~`);
    await page.fill('.schema-cycle .sch-motif input', 'bd [hh');
    await page.waitForTimeout(200);
    check((await page.locator('.schema-cycle .sch-warn').count()) === 1, `${label} · cycle : un motif illisible est signalé sans rien casser`);
    await page.click('.schema-cycle .sch-play');
    await page.evaluate(() => { window.location.hash = '#/wiki/sol.tempo'; });
    await page.waitForSelector('.schema-tempo');
    await page.locator('.schema-tempo .sch-handle').focus();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(150);
    check(/setcpm\(121\/4\)/.test(await text(page, '.schema-tempo .sch-code code')), `${label} · tempo : la fin du cycle se règle au clavier (setcpm(121/4))`);
    await page.screenshot({ path: join(SHOTS, `schemas-${label}-${scheme}-tempo.png`) });
    // Vague 4 : le clavier.
    await page.evaluate(() => { window.location.hash = '#/wiki/sol.octave'; });
    await page.waitForSelector('.schema-clavier');
    const keyC4 = page.locator('.schema-clavier .sch-key-w[aria-label^="c4,"]');
    await keyC4.dispatchEvent('pointerdown');
    await page.waitForTimeout(200);
    check(/note\("c3 c4 c4"\)/.test(await text(page, '.schema-clavier .sch-code code')), `${label} · clavier : toucher une touche l’ajoute à note("…")`);
    await page.locator('.schema-clavier .sch-key-w[aria-label^="c3,"]').dispatchEvent('pointerdown');
    await keyC4.dispatchEvent('pointerdown');
    await page.waitForTimeout(200);
    check((await page.locator('.schema-clavier .sch-mission.is-done').count()) === 1, `${label} · clavier : mission « octave » (c3 puis c4)`);
    await page.evaluate(() => { window.location.hash = '#/wiki/sol.gamme'; });
    await page.waitForSelector('.schema-clavier');
    check((await page.locator('.schema-clavier .sch-key.is-on').count()) === 8, `${label} · gamme : les 8 degrés de do majeur sont allumés`);
    await page.click('.schema-clavier .sch-choice-b:has-text("mineure")');
    await page.waitForTimeout(150);
    check(/scale\("C3:minor"\)/.test(await text(page, '.schema-clavier .sch-code code')), `${label} · gamme : le choix « mineure » change le code`);
    await page.screenshot({ path: join(SHOTS, `schemas-${label}-${scheme}-gamme.png`) });
    // Vague 5 : un signal.
    await page.evaluate(() => { window.location.hash = '#/wiki/fn.signaux'; });
    await page.waitForSelector('.schema-signal');
    check((await page.locator('.schema-signal .sch-step').count()) >= 32 && /lpf\(sine\.range\(300, 2000\)\.slow\(4\)\)/.test(await text(page, '.schema-signal .sch-code code')), `${label} · signal : la courbe et la coupure de chaque note sont dessinées`);
    await page.click('.schema-signal .sch-choice-b:has-text("carré")');
    await page.click('.schema-signal .sch-play');
    await page.waitForTimeout(400);
    check(/square\.range/.test(await text(page, '.schema-signal .sch-code code')) && (await page.locator('.schema-signal .sch-mission.is-done').count()) === 1, `${label} · signal : changer la forme change le code et valide la mission`);
    await page.click('.schema-signal .sch-play');
    // Vague 5 : les effets.
    await page.evaluate(() => { window.location.hash = '#/wiki/fx.delayfeedback'; });
    await page.waitForSelector('.schema-effet');
    const bars = await page.locator('.schema-effet .sch-bar').count();
    check(bars >= 4, `${label} · écho : ${bars} répétitions dessinées`);
    await page.evaluate(() => { window.location.hash = '#/wiki/fx.distort'; });
    await page.waitForSelector('.schema-effet');
    check((await page.locator('.schema-effet svg.sch-svg').count()) === 2 && /distort\(1\)/.test(await text(page, '.schema-effet .sch-code code')), `${label} · distorsion : courbe et onde dessinées, code distort(1)`);
    await page.evaluate(() => { window.location.hash = '#/wiki/fx.duck'; });
    await page.waitForSelector('.schema-effet .sch-fill-gold');
    {
      const kicks = await page.locator('.schema-effet .sch-bar-dry').count();
      const code0 = await text(page, '.schema-effet .sch-code code');
      // Monter la remontée (duckattack) au maximum au clavier, pendant la lecture.
      await page.click('.schema-effet .sch-play');
      const att = page.locator('.schema-effet .sch-sliders input').nth(1);
      await att.focus();
      await page.keyboard.press('End');
      await page.waitForTimeout(400);
      const code1 = await text(page, '.schema-effet .sch-code code');
      check(kicks === 4 && /duck\(2\)\.duckdepth\(1\)\.duckattack\(\.2\)/.test(code0) && /duckattack\(\.45\)/.test(code1) && (await page.locator('.schema-effet .sch-mission.is-done').count()) === 1, `${label} · sidechain : 4 coups dessinés, la ligne de code suit (${code1.match(/duckattack\([^)]*\)/)}), mission pompe validée`);
      await page.click('.schema-effet .sch-play');
    }
    check(!errors.length, `${label} · aucune erreur de page` + (errors.length ? ' → ' + errors.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
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
  // Un schéma vivant hors ligne (aucun son téléchargé : des ondes calculées).
  await page.evaluate(() => { window.location.hash = '#/wiki/fx.lpf'; });
  await page.waitForSelector('.schema-filtre .sch-play');
  await page.click('.schema-filtre .sch-play');
  await page.waitForTimeout(800);
  check((await page.locator('.schema-filtre .sch-play.is-on').count()) === 1, 'un schéma vivant joue hors ligne');
  await page.click('.schema-filtre .sch-play');
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
