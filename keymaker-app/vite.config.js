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
        // On précache la coquille de l'app, pas le moteur Strudel vendorisé
        // (volumineux) — il sera mis en cache au premier usage par le navigateur.
        globPatterns: ['**/*.{css,html,js,svg,png,webmanifest}'],
        globIgnores: ['**/vendor/**']
      }
    })
  ]
});
