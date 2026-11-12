import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Garde-fou : sans le pack de sons, l'app construite serait muette hors ligne.
// Le pack n'est pas versionné (36 Mo de sons tiers) : `npm run samples` le reconstruit.
const requireSamplePack = {
  name: 'keymaker-sample-pack',
  apply: 'build',
  buildStart() {
    if (!existsSync(new URL('./public/samples/manifest.json', import.meta.url))) {
      throw new Error('Pack de sons hors ligne absent (public/samples/). Lance d’abord « npm run samples » (réseau requis).');
    }
  },
};

// Keymaker 2 — React + Vite, PWA installable et entièrement hors ligne.
//
//  - Le moteur Strudel est vendorisé dans public/vendor (chargé tel quel, jamais
//    retraité par Vite).
//  - Le service worker est ÉCRIT À LA MAIN (src/sw.js) ; le plugin y injecte
//    seulement la liste des fichiers de la coquille (__WB_MANIFEST).
//  - Les sons (public/samples/gh, public/samples/wafd) ne sont pas dans cette
//    liste : ils sont rangés dans leur propre cache par src/lib/offline.js.
//
// Build pour le Pi :  npm run build:pi   (base /keymaker/app/)
export default defineConfig({
  base: '/',
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Le contenu (leçons, wiki, genres) dans son propre fichier : corriger une
        // leçon n'invalide pas le cache du code de l'app, et inversement.
        manualChunks(id) {
          if (/src[\\/]content[\\/]/.test(id)) return 'contenu';
        },
      },
    },
  },
  plugins: [
    requireSamplePack,
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: false,
      injectManifest: {
        globPatterns: ['**/*.{css,html,js,mjs,svg,png,webmanifest,woff2,json}'],
        globIgnores: ['samples/gh/**', 'samples/wafd/**', 'sw.js'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
      manifest: {
        id: './',
        name: 'Keymaker',
        short_name: 'Keymaker',
        description: 'Apprendre Strudel et le solfège',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#090b10',
        theme_color: '#090b10',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
