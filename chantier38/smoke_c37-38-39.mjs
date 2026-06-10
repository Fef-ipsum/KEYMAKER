import { createRequire } from "module";
const require = createRequire(new URL("../keymaker-app/package.json", import.meta.url));
const { chromium } = require("playwright");
const errors = [];
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage();
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });
await page.goto('http://127.0.0.1:8123/keymaker/app/', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.topbar', { timeout: 15000 });

// 1) Accueil auto (1re visite du jour) : pas de carte révision attendue (srs vierge).
const dash = await page.waitForSelector('.dash-panel', { timeout: 8000 }).catch(() => null);
console.log('accueil auto:', !!dash);
if (dash) {
  console.log('carte révision absente (attendu, srs vierge):', !(await page.$('.dash-review')));
  await page.click('.dash-resume');
}

// 2) Carte Exercice + bouton Vérifier (Chantier 39) sur le flash courant.
await page.waitForSelector('.card.exo', { timeout: 8000 });
console.log('bouton vérifier présent:', !!(await page.$('.verify-btn')));

// 3) Naviguer jusqu'au dernier flash du chapitre 1 → carte Quiz (Chantier 37).
for (let i = 0; i < 6; i++) {
  const cta = await page.$('.card.quiz-cta');
  if (cta) break;
  const next = await page.$('.nav-btn.next:not(.next-module)');
  if (!next) break;
  await next.click();
  await page.waitForTimeout(250);
}
console.log('carte quiz fin de chapitre:', !!(await page.$('.card.quiz-cta')));

// 4) Ouvrir le quiz : sans Pi joignable → état d'erreur propre (pas de crash).
const ctaBtn = await page.$('.quiz-cta-btn');
if (ctaBtn) {
  await ctaBtn.click();
  await page.waitForSelector('.quiz-panel', { timeout: 5000 });
  await page.waitForSelector('.quiz-wait-main, .quiz-q', { timeout: 50000 });
  const errTxt = await page.$eval('.quiz-wait-main, .quiz-q', (el) => el.textContent.slice(0, 80)).catch(() => '?');
  console.log('overlay quiz ouvert, état:', JSON.stringify(errTxt));
  const retry = await page.$('.btn.quiz-retry, .btn.quiz-leave');
  console.log('boutons de sortie présents:', !!retry);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  console.log('échap ferme le quiz:', !(await page.$('.quiz-panel')));
}

// 5) Parcours : pastilles de maîtrise + légende (Chantier 38).
await page.click('.tb-btn:has-text("Parcours")').catch(async () => { const btns = await page.$$('.tb-btn'); for (const b of btns) { if ((await b.textContent()).includes('Parcours')) { await b.click(); break; } } });
await page.waitForSelector('.learn-panel', { timeout: 5000 });
console.log('pastilles lvl- dans le parcours:', (await page.$$('.learn-id[class*="lvl-"]')).length > 0);
console.log('légende présente:', !!(await page.$('.learn-legend')));

const fatal = errors.filter((e) => e.startsWith('PAGEERROR'));
console.log('--- erreurs fatales:', fatal.length ? fatal : 'aucune');
const vendorish = errors.filter((e) => !e.startsWith('PAGEERROR')).slice(0, 3);
if (vendorish.length) console.log('(console non bloquante:', vendorish, ')');
await browser.close();
process.exit(fatal.length ? 1 : 0);
