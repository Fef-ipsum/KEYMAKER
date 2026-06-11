import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Keymaker — Chantier 1 (prototype, slice vertical).
// PWA standalone + React. Le moteur Strudel est vendorisé dans public/vendor
// (chargé au runtime, jamais bundlé par Vite) pour rester 100% local.
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Keymaker',
        short_name: 'Keymaker',
        description: 'Apprendre Strudel CC & le solfège',
        lang: 'fr',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0d1120',
        theme_color: '#0d1120',
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Chantier 47 : PRÉCACHE COMPLET — coquille + moteur vendorisé (~5 MB) +
        // fonts + sons locaux → l'app démarre et joue dans le train, sans réseau.
        globPatterns: ['**/*.{css,html,js,mjs,svg,png,webmanifest,woff2,wav,mp3,ogg,json}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        // Les SAMPLES distants (banques strudel chargées à la demande) passent en
        // cache-first à l'usage : joués une fois = disponibles hors-ligne.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin !== self.location.origin &&
              /\.(wav|mp3|ogg|flac|json)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'keymaker-samples',
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ]
});
