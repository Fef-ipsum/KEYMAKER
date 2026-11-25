// Lance Chromium pour les scripts de vérification.
// Le navigateur de Playwright est utilisé s'il est installé ; sinon (machine où un
// autre Chromium est déjà présent, comme un conteneur de travail), on prend
// CHROMIUM_PATH ou /opt/pw-browsers/chromium.
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

export async function launchBrowser(opts = {}) {
  const args = ['--autoplay-policy=no-user-gesture-required', ...(opts.args || [])];
  try {
    return await chromium.launch({ ...opts, args });
  } catch (e) {
    const alt = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
    if (!existsSync(alt)) throw e;
    return chromium.launch({ ...opts, args, executablePath: alt });
  }
}
