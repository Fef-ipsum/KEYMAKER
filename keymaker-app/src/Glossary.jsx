// Keymaker — Chantier 48 : le glossaire bilingue, enfin (promesse de la vision d'origine).
//
// Zéro donnée dupliquée : les entrées sont construites AU MONTAGE en parcourant les
// blocs `theory.items` de tous les flashs (lessons.js). Chaque item = [terme, explication],
// et les leçons suivent déjà la convention « terme FR (anglais) » → le glossaire est
// bilingue par construction. Déduplication par terme (accents ignorés) : on garde la
// PREMIÈRE définition rencontrée dans l'ordre du parcours + la référence du flash
// source (« M1 · 1.4 ») pour retrouver le contexte.
//
// Même patron d'overlay que Dashboard/SnippetLibrary (.learn-overlay/.learn-panel) :
// l'éditeur reste monté dessous, Échap ferme (géré par App). v1 : lecture seule.

import { useMemo, useState } from 'react';
import { modules } from './lessons.js';

// Minuscules sans accents — pour trier, dédupliquer et chercher (« reverb » trouve « réverb »).
function fold(t) {
  return String(t)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Construit la liste d'entrées { term, def, src } depuis les modules (PUR, testable).
export function buildGlossary(mods) {
  const byKey = new Map();
  for (const mo of mods || []) {
    for (const ch of (mo && mo.chapitres) || []) {
      for (const fl of (ch && ch.flashs) || []) {
        const items = fl && fl.theory && Array.isArray(fl.theory.items) ? fl.theory.items : [];
        for (const it of items) {
          if (!Array.isArray(it) || it.length < 2) continue;
          const term = String(it[0]).trim();
          const def = String(it[1]).trim();
          if (!term || !def) continue;
          const key = fold(term);
          if (!byKey.has(key)) byKey.set(key, { term, def, src: 'M' + mo.id + ' · ' + fl.id });
        }
      }
    }
  }
  return Array.from(byKey.values()).sort((a, b) => fold(a.term).localeCompare(fold(b.term)));
}

export default function Glossary({ onClose }) {
  const entries = useMemo(() => buildGlossary(modules), []);
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const needle = fold(q.trim());
    if (!needle) return entries;
    return entries.filter((e) => fold(e.term).includes(needle) || fold(e.def).includes(needle));
  }, [entries, q]);

  return (
    <div className="learn-overlay" role="dialog" aria-modal="true" aria-label="Glossaire bilingue">
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel glossary-panel">
        <header className="learn-head">
          <div>
            <p className="kicker">Glossaire</p>
            <h2 className="learn-title">Les mots du cours</h2>
            <p className="learn-sub">
              {entries.length} termes extraits des leçons, français ↔ anglais. Tape pour filtrer.
            </p>
          </div>
          <button className="learn-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>

        <input
          className="glossary-search"
          type="search"
          placeholder="Chercher un terme ou une définition (gamme, pitch, filtre…)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          aria-label="Chercher dans le glossaire"
        />

        <ul className="glossary-list">
          {list.map((e) => (
            <li key={e.src + e.term} className="glossary-item">
              <span className="glossary-term">{e.term}</span>
              <span className="glossary-def">{e.def}</span>
              <span className="glossary-src" title="Flash où le terme est enseigné">{e.src}</span>
            </li>
          ))}
          {list.length === 0 && (
            <li className="glossary-empty">Aucun terme ne correspond à « {q} ».</li>
          )}
        </ul>
      </div>
    </div>
  );
}
