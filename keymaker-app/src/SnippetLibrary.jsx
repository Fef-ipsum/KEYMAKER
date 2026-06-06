// Keymaker — Chantier 27 : bibliothèque de snippets.  [build:c27-snippets]
//
// Overlay (même patron que Parcours / Réglages / Accueil) listant les patterns
// sauvegardés. Clic sur un snippet → chargé dans l'éditeur (via onLoadSnippet).
// 100 % local (IndexedDB). Le bouton « Sauvegarder » vit sur chaque flash.
import { useEffect, useState } from 'react';
import { loadSnippets, deleteSnippet } from './notebook.js';

function fmtDate(ts) {
  try {
    return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

export default function SnippetLibrary({ onLoadSnippet, onClose }) {
  const [items, setItems] = useState(null); // null = chargement

  const refresh = () =>
    loadSnippets()
      .then((r) => setItems(r || []))
      .catch(() => setItems([]));

  useEffect(() => {
    refresh();
  }, []);

  const del = async (id) => {
    await deleteSnippet(id);
    refresh();
  };

  return (
    <div className="learn-overlay lib-overlay" role="dialog" aria-modal="true" aria-label="Ma bibliothèque de snippets">
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel lib-panel">
        <header className="learn-head">
          <div>
            <p className="kicker">Bibliothèque</p>
            <h2 className="learn-title">Mes snippets</h2>
            <p className="learn-sub">Tes patterns gardés. Clique pour charger dans l'éditeur.</p>
          </div>
          <button className="learn-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>

        {items === null ? (
          <p className="lib-empty">Chargement…</p>
        ) : items.length === 0 ? (
          <p className="lib-empty">
            Rien encore. Sur un flash, clique « ☆ Sauvegarder » sous l'éditeur pour garder un pattern ici.
          </p>
        ) : (
          <ul className="lib-list">
            {items.map((s) => (
              <li key={s.id} className="lib-item">
                <button className="lib-load" onClick={() => onLoadSnippet(s.code)} title="Charger ce pattern dans l'éditeur">
                  <span className="lib-name">{s.name || 'Sans nom'}</span>
                  <code className="lib-code">{String(s.code || '').split('\n')[0].slice(0, 56)}</code>
                  <span className="lib-meta">
                    {s.module != null ? 'Module ' + s.module + ' · ' : ''}
                    {fmtDate(s.ts)}
                  </span>
                </button>
                <button className="lib-del" onClick={() => del(s.id)} aria-label="Supprimer ce snippet" title="Supprimer">
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="set-about">Bibliothèque 100&nbsp;% locale (IndexedDB) · rien n'est envoyé.</p>
      </div>
    </div>
  );
}
