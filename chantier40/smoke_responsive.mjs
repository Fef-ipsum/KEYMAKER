// Chantier 40 — smoke multi-viewport : desktop 1280 / tablette 800 / téléphone 390.
// Sert le build sous /keymaker/app/ (cf. chantier38/smoke_c37-38-39.mjs pour la recette).
import { createRequire } from 'module';
const require = createRequire(new URL('../keymaker-app/package.json', import.meta.url));
const { chromium } = require('playwright');

const errors = [];
const browser = await chromium.launch({ channel: 'chromium' });

async function at(width, height, label, checks) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', (e) => errors.push(label + ' PAGEERROR: ' + e.message));
  await page.goto('http://127.0.0.1:8123/keymaker/app/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.topbar', { timeout: 15000 });
  // fermer l'accueil auto s'il s'ouvre
  const dash = await page.waitForSelector('.dash-resume', { timeout: 4000 }).catch(() => null);
  if (dash) await dash.click();
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`[${label}] débordement horizontal: ${overflow <= 1 ? 'aucun ✓' : overflow + 'px ✗'}`);
  await checks(page);
  await page.close();
}

await at(1280, 850, 'desktop', async (page) => {
  const txt = await page.$eval('.tb-btn', (el) => getComputedStyle(el).fontSize);
  console.log('[desktop] libellés topbar visibles:', txt !== '0px');
  console.log('[desktop] éditeur visible:', await page.$eval('.editor-frame', (el) => el.offsetHeight > 50));
  console.log('[desktop] toggle éditeur masqué:', await page.$eval('.editor-toggle', (el) => getComputedStyle(el).display === 'none'));
});

await at(800, 1100, 'tablette', async (page) => {
  console.log('[tablette] topbar icônes seules:', await page.$eval('.tb-btn', (el) => getComputedStyle(el).fontSize === '0px'));
  console.log('[tablette] crumbs masqués:', await page.$eval('.crumbs', (el) => getComputedStyle(el).display === 'none'));
  const h = await page.$eval('.tb-btn', (el) => el.getBoundingClientRect().height);
  console.log('[tablette] touch target topbar ≥44px:', h >= 43, '(' + Math.round(h) + 'px)');
  console.log('[tablette] éditeur visible:', await page.$eval('.editor-frame', (el) => el.offsetHeight > 50));
});

await at(390, 844, 'téléphone', async (page) => {
  console.log('[téléphone] éditeur replié par défaut:', await page.$eval('.editor-frame', (el) => el.offsetHeight === 0 || getComputedStyle(el).display === 'none'));
  console.log('[téléphone] toggle visible:', await page.$eval('.editor-toggle', (el) => getComputedStyle(el).display !== 'none'));
  console.log('[téléphone] Run visible (écouter sans éditer):', await page.$eval('.btn.run', (el) => el.offsetHeight > 0));
  // déplier l'éditeur
  await page.click('.editor-toggle');
  await page.waitForTimeout(600);
  console.log('[téléphone] éditeur déplié après toggle:', await page.$eval('.editor-frame', (el) => el.offsetHeight > 50));
  const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log('[téléphone] pas de débordement éditeur ouvert:', overflow2 <= 1);
});

const fatal = errors.filter((e) => e.includes('PAGEERROR'));
console.log('--- erreurs fatales:', fatal.length ? fatal : 'aucune');
await browser.close();
process.exit(fatal.length ? 1 : 0);
