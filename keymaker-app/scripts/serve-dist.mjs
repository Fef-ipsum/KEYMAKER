// Sert le build du Pi (dist-pi) en local, à la même adresse relative que sur le Pi.
// Usage : node scripts/serve-dist.mjs [port]   → http://localhost:4455/keymaker/app/
import { serve } from './static-server.mjs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist-pi', import.meta.url));
const srv = await serve(root, Number(process.argv[2]) || 4455, { base: '/keymaker/app/' });
console.log('Keymaker 2 servi sur ' + srv.url);
