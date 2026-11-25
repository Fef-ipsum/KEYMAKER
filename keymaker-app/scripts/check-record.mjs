// Enregistrer le son (Studio) : longueur, calage sur le cycle, arrêt, annulation.
// Le code de test joue une note brève quatre fois par cycle : on retrouve chaque
// attaque dans le fichier et on la compare à l'heure attendue.
// Usage : node scripts/check-record.mjs [--dir dist]
import { launchBrowser } from './browser.mjs';
import { serve } from './static-server.mjs';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dirArg = process.argv.includes('--dir') ? process.argv[process.argv.indexOf('--dir') + 1] : 'dist';
const ROOT = join(here, '..', dirArg);
if (!existsSync(join(ROOT, 'index.html'))) { console.error('Build introuvable : ' + ROOT + ' (lance « npm run build »)'); process.exit(2); }
const BASE = dirArg === 'dist-pi' ? '/keymaker/app/' : '/';
const srv = await serve(ROOT, 0, { base: BASE });
const browser = await launchBrowser();
const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
let bad = 0;
const check = (cond, m) => { if (!cond) bad++; console.log((cond ? '  ✓ ' : '  ✗ ') + m); };

await page.goto(srv.url + '#/studio');
await page.waitForFunction(() => !!document.querySelector('.crown:not([disabled])'), null, { timeout: 30000 });

async function setCode(code) {
  await page.click('.cm-content');
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(code);
}
async function choose(label) {
  await page.locator('.rec .seg-b', { hasText: label }).first().click();
}
// Analyse du fichier produit, dans la page : durée, attaques (seuil 0,05).
async function analyse() {
  return page.evaluate(async () => {
    const a = document.querySelector('.rec-done audio');
    const blob = await (await fetch(a.src)).blob();
    const buf = await blob.arrayBuffer();
    let sr, data;
    if (blob.type === 'audio/wav') {
      const v = new DataView(buf);
      sr = v.getUint32(24, true);
      const n = v.getUint32(40, true) / 4;
      data = new Float32Array(n);
      for (let i = 0; i < n; i++) data[i] = v.getInt16(44 + i * 4, true) / 32767;
    } else {
      const ac = new OfflineAudioContext(2, 48000, 48000);
      const ab = await ac.decodeAudioData(buf);
      sr = ab.sampleRate;
      data = ab.getChannelData(0);
    }
    const onsets = [];
    let last = -1e9;
    for (let i = 0; i < data.length; i++) {
      if (Math.abs(data[i]) > 0.05) {
        if (i - last > sr * 0.2) onsets.push(i / sr);
        last = i;
      }
    }
    return { type: blob.type, sr, frames: data.length, seconds: data.length / sr, onsets, size: blob.size, label: document.querySelector('.rec-done .toast').textContent };
  });
}
async function recordOnce({ cycles, format, play = true }) {
  if (play) { await page.click('.crown'); await page.waitForTimeout(1200); }
  await choose(cycles + ' cycles');
  await choose(format);
  await page.locator('.rec .btn-primary').click();
  await page.waitForSelector('.rec-done audio, .rec .dock-error', { timeout: 120000 });
  if (await page.locator('.rec .dock-error').count()) return { error: await page.locator('.rec .dock-error').innerText() };
  return analyse();
}
const near = (onsets, period, tol) => onsets.every((t, k) => Math.abs(t - k * period) < tol);

console.log('\n[WAV] 4 cycles à 120 BPM (0,5 cycle par seconde), 4 notes par cycle');
const NOTE = (bpm) => `setcpm(${bpm}/4)\n\n$: note("c5*4").s("square").decay(.03).sustain(0).gain(.5)`;
await setCode(NOTE(120));
let r = await recordOnce({ cycles: 4, format: 'WAV' });
if (r.error) check(false, 'enregistrement : ' + r.error);
else {
  check(r.type === 'audio/wav' && r.sr > 0, `fichier WAV, ${r.sr} Hz`);
  check(Math.abs(r.frames - 8 * r.sr) <= 1, `longueur : ${r.frames} échantillons pour ${8 * r.sr} attendus (8 s)`);
  check(r.onsets.length === 16, `16 attaques trouvées (${r.onsets.length})`);
  const err = Math.max(...r.onsets.map((t, k) => Math.abs(t - k * 0.5)));
  check(near(r.onsets, 0.5, 0.004), `chaque attaque à moins de 4 ms de son temps (écart max ${(err * 1000).toFixed(2)} ms, première à ${(r.onsets[0] * 1000).toFixed(2)} ms)`);
  check(/4 cycles enregistrés, 8 s/.test(r.label), 'message : ' + r.label);
}

console.log('\n[WAV] tempo du code : 4 cycles à 135 BPM, réévalué pendant la lecture');
await setCode(NOTE(135));
await page.keyboard.press('Control+Enter');
await page.waitForTimeout(800);
r = await recordOnce({ cycles: 4, format: 'WAV', play: false });
if (r.error) check(false, 'enregistrement : ' + r.error);
else {
  const sec = 4 / (135 / 240);
  check(Math.abs(r.frames - sec * r.sr) <= 1, `longueur : ${r.frames} échantillons pour ${(sec * r.sr).toFixed(1)} attendus (${sec.toFixed(4)} s)`);
  const err = Math.max(...r.onsets.map((t, k) => Math.abs(t - (k * sec) / 16)));
  check(r.onsets.length === 16 && err < 0.004, `16 attaques calées (${r.onsets.length}, écart max ${(err * 1000).toFixed(2)} ms)`);
}

console.log('\n[WebM] 4 cycles à 120 BPM');
await page.click('.crown'); // arrêt
await page.waitForTimeout(500);
await setCode(NOTE(120));
r = await recordOnce({ cycles: 4, format: 'WebM' });
if (r.error) check(false, 'enregistrement : ' + r.error);
else {
  check(/webm|mp4/.test(r.type), `fichier ${r.type}, ${(r.size / 1024).toFixed(0)} Ko`);
  check(Math.abs(r.seconds - 8) < 0.15, `durée ${r.seconds.toFixed(3)} s pour 8 s (tolérance 0,15 s)`);
  const off = r.onsets.map((t, k) => t - k * 0.5);
  const mean = off.reduce((a, b) => a + b, 0) / (off.length || 1);
  check(r.onsets.length >= 15 && Math.abs(mean) < 0.06, `${r.onsets.length} attaques, décalage moyen ${(mean * 1000).toFixed(1)} ms (tolérance 60 ms)`);
}

console.log('\n[Morceau] arrange de 3 cycles, enregistré en pleine lecture : il repart du cycle 0');
// Section 1 (1 cycle) : une note ; section 2 (2 cycles) : 4 notes par cycle.
const PIECE = 'setcpm(120/4)\n\n$: arrange([1, note("c5")], [2, note("c5*4")]).s("square").decay(.03).sustain(0).gain(.5)';
const WANT = [0, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5];
await setCode(PIECE);
await page.keyboard.press('Control+Enter');
await page.waitForTimeout(3300); // en plein milieu du morceau
for (const fmt of ['WAV', 'WebM']) {
  await page.locator('.rec .seg-b', { hasText: 'Le morceau entier' }).click();
  await choose(fmt);
  const label = await page.locator('.rec .btn-primary').innerText();
  await page.locator('.rec .btn-primary').click();
  await page.waitForSelector('.rec-done audio, .rec .dock-error', { timeout: 60000 });
  if (await page.locator('.rec .dock-error').count()) { check(false, fmt + ' : ' + (await page.locator('.rec .dock-error').innerText())); continue; }
  const m = await analyse();
  const tol = fmt === 'WAV' ? 0.004 : 0.06;
  // WebM : démarré et arrêté à quelques ms près ; la note du cycle suivant peut entrer
  // dans les 60 dernières ms. On l'écarte avant de comparer.
  const ons = fmt === 'WebM' ? m.onsets.filter((t) => t < m.seconds - 0.06) : m.onsets;
  const err = ons.length === WANT.length ? Math.max(...ons.map((t, i) => Math.abs(t - WANT[i]))) : Infinity;
  check(/depuis le début/.test(label), `${fmt} : bouton « ${label} »`);
  check(fmt === 'WAV' ? Math.abs(m.frames - 6 * m.sr) <= 1 : Math.abs(m.seconds - 6) < 0.15, `${fmt} : 3 cycles, ${m.seconds.toFixed(3)} s pour 6 s`);
  check(err < tol, `${fmt} : ${ons.length} attaques aux temps du morceau depuis son début (écart max ${(err * 1000).toFixed(1)} ms)` + (err < tol ? '' : ' → ' + m.onsets.map((t) => t.toFixed(3)).join(' ')));
}
await page.waitForTimeout(300);
const outGain = await page.evaluate(() => window.getSuperdoughAudioController().output.destinationGain.gain.value);
check(Math.abs(outGain - 1) < 1e-6, `volume de sortie rétabli après le redémarrage (${outGain})`);
await choose('4 cycles');
await setCode(NOTE(120));
await page.keyboard.press('Control+Enter');
await page.waitForTimeout(800);

console.log('\n[Arrêt] la lecture s’arrête pendant l’enregistrement');
await choose('8 cycles');
await choose('WAV');
await page.locator('.rec .btn-primary').click();
await page.waitForSelector('.rec-busy', { timeout: 5000 });
await page.waitForTimeout(1500);
await page.click('.crown');
await page.waitForSelector('.rec .dock-error', { timeout: 5000 }).catch(() => {});
const stopMsg = await page.locator('.rec .dock-error').innerText().catch(() => '');
check(/lecture s’est arrêtée/.test(stopMsg), 'message : ' + stopMsg);
check(!(await page.locator('.rec-done').count()), 'aucun fichier proposé');

console.log('\n[Annuler] puis un nouvel enregistrement');
await page.locator('.rec .btn-primary').click();
await page.waitForSelector('.rec-busy', { timeout: 5000 });
await page.waitForTimeout(1000);
await page.locator('.rec-busy button', { hasText: 'Annuler' }).click();
await page.waitForSelector('.rec .dock-error', { timeout: 5000 }).catch(() => {});
check(/annulé/.test(await page.locator('.rec .dock-error').innerText().catch(() => '')), 'annulation signalée');
r = await recordOnce({ cycles: 4, format: 'WAV', play: false });
check(!r.error && r.onsets && r.onsets.length === 16 && Math.abs(r.frames - 8 * r.sr) <= 1, 'l’enregistrement suivant est complet' + (r.error ? ' : ' + r.error : ''));
const taps = await page.evaluate(() => document.querySelectorAll('.rec-busy').length);
check(taps === 0, 'plus rien en cours');

check(!errors.length, 'aucune erreur de page' + (errors.length ? ' → ' + errors.join(' | ') : ''));
console.log(bad ? `\nenregistrement : ${bad} vérification(s) en échec` : '\nenregistrement : tout passe');
await browser.close();
srv.close && srv.close();
process.exit(bad ? 1 : 0);
