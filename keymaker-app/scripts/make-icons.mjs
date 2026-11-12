// Dessine l'icône de l'app (un cadran, une aiguille bleuie) et produit les PNG de la PWA.
// Usage : node scripts/make-icons.mjs
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
const marks = Array.from({ length: 12 }, (_, i) => {
  const t = (i / 12) * Math.PI * 2;
  const long = i % 3 === 0;
  const r1 = long ? 150 : 160;
  return `<line x1="${256 + Math.sin(t) * r1}" y1="${256 - Math.cos(t) * r1}" x2="${256 + Math.sin(t) * 176}" y2="${256 - Math.cos(t) * 176}" stroke="${long ? '#e9edf3' : '#8f99a8'}" stroke-width="${long ? 12 : 7}" stroke-linecap="round"/>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b202b"/><stop offset="1" stop-color="#07090d"/></linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f9"/><stop offset=".5" stop-color="#7d8696"/><stop offset="1" stop-color="#dfe3ea"/></linearGradient>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9db9ff"/><stop offset="1" stop-color="#2f55c4"/></linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="204" fill="none" stroke="url(#steel)" stroke-width="14"/>
  <circle cx="256" cy="256" r="190" fill="#10141c"/>
  ${marks}
  <line x1="256" y1="256" x2="352" y2="146" stroke="url(#blue)" stroke-width="20" stroke-linecap="round"/>
  <line x1="256" y1="256" x2="196" y2="312" stroke="#cfd6e2" stroke-width="12" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="22" fill="url(#blue)"/>
  <circle cx="256" cy="256" r="7" fill="#07090d"/>
</svg>`;
writeFileSync(join(out, 'favicon.svg'), svg);
const browser = await chromium.launch();
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`);
  await page.screenshot({ path: join(out, `pwa-${size}.png`) });
  await page.close();
}
await browser.close();
console.log('icônes écrites dans public/icons');
