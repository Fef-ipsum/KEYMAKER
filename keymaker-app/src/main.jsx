import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { captureInstallPrompt, muffleSampleLoadErrors, prewarmSampleMaps } from './pwa.js';

// Chantier 61 : capter l'événement d'installation PWA AVANT le rendu —
// `beforeinstallprompt` n'arrive qu'une fois, très tôt ; si on le rate,
// le bouton « Installer » ne peut jamais apparaître.
captureInstallPrompt();
// Une banque de sons injoignable (hors ligne) ne doit pas remonter en erreur.
muffleSampleLoadErrors();
// Préchauffer les cartes de samples dans le cache du SW (sons hors ligne).
prewarmSampleMaps();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
