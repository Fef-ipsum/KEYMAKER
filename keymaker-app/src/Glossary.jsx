// Keymaker — Chantier 56 (11 juin 2026) : le glossaire, refait CARRÉ.
//
// Remplace l'auto-extraction des theory.items (Chantier 48) par une source curée à
// la main : glossaryData.js (150 vrais termes, 10 thèmes, définitions claires).
//
// Trois choses pour Felix :
//   1. Rangé par THÈME (chips de filtre) → on navigue par petits blocs (TDA-friendly).
//   2. RECHERCHE globale (terme, anglais, définition) — accents ignorés.
//   3. ANNOTATIONS : une note mnémotechnique perso par terme (glossaryNotes.js,
//      localStorage). Felix colle l'astuce qui marche POUR LUI, à côté de la déf.
//
// Même patron d'overlay que Dashboard/SnippetLibrary (.learn-overlay/.learn-panel) :
// l'éditeur reste monté dessous, Échap ferme (géré par App) — sauf pendant l'édition
// d'une note, où Échap annule l'édition (stopPropagation).

import { useMemo, useState } from 'react';
import { CATEGORIES, termKey } from './glossaryData.js';
import { readNotes, setNote as persistNote } from './glossaryNotes.js';

// Minuscules sans accents — pour chercher (« reverb » trouve « réverb »).
function fold(t) {
  return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function Glossary({ onClose }) {
  const [q, setQ] = useState('');
  const [activeCat, setActiveCat] = useState(null); // null = tous les thèmes
  const [notes, setNotes] = useState(() => readNotes()); // { termKey: note }
  const [editing, setEditing] = useState(null); // termKey en cours d'édition
  const [draft, setDraft] = useState('');

  const total = useMemo(() => CATEGORIES.reduce((n, c) => n + c.entries.length, 0), []);

  // Catégories filtrées (par thème actif + recherche), chacune ne gardant que ses
  // entrées correspondantes. On ne montre une catégorie que si elle a des résultats.
  const view = useMemo(() => {
    const needle = fold(q.trim());
    return CATEGORIES
      .filter((c) => !activeCat || c.id === activeCat)
      .map((c) => {
        const entries = c.entries.filter((e) => {
          if (!needle) return true;
          return fold(e.term).includes(needle) || fold(e.en || '').includes(needle) || fold(e.def).includes(needle);
        });
        return { ...c, entries };
      })
      .filter((c) => c.entries.length > 0);
  }, [q, activeCat]);

  const nMatch = useMemo(() => view.reduce((n, c) => n + c.entries.length, 0), [view]);

  const startEdit = (key) => {
    setEditing(key);
    setDraft(notes[key] || '');
  };
  const cancelEdit = () => {
    setEditing(null);
    setDraft('');
  };
  const saveEdit = (key) => {
    const next = persistNote(key, draft);
    setNotes(next);
    setEditing(null);
    setDraft('');
  };
  const deleteNote = (key) => {
    const next = persistNote(key, '');
    setNotes(next);
    if (editing === key) cancelEdit();
  };

  return (
    <div className="learn-overlay" role="dialog" aria-modal="true" aria-label="Glossaire">
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel glossary-panel">
        <header className="learn-head">
          <div>
            <p className="kicker">Glossaire</p>
            <h2 className="learn-title">Les mots du cours</h2>
            <p className="learn-sub">
              {total} termes, rangés par thème, français ↔ anglais. Ajoute tes propres notes mnémotechniques. ✏️
            </p>
          </div>
          <button className="learn-close" onClick={onClose} aria-label="Fermer">✕</button>
        </header>

        <input
          className="glossary-search"
          type="search"
          placeholder="Chercher un terme, un mot anglais, une définition (gamme, reverb, kick…)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          aria-label="Chercher dans le glossaire"
        />

        {/* Chips de thèmes — navigation par petits blocs. */}
        <div className="gloss-chips" role="tablist" aria-label="Thèmes">
          <button
            className={'gloss-chip' + (activeCat === null ? ' on' : '')}
            onClick={() => setActiveCat(null)}
            aria-pressed={activeCat === null}
          >
            Tous <span className="gloss-chip-n">{total}</span>
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={'gloss-chip' + (activeCat === c.id ? ' on' : '')}
              onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
              aria-pressed={activeCat === c.id}
              title={c.hint}
            >
              <span className="gloss-chip-ico">{c.icon}</span> {c.label} <span className="gloss-chip-n">{c.entries.length}</span>
            </button>
          ))}
        </div>

        <div className="glossary-scroll">
          {view.length === 0 && (
            <p className="glossary-empty">Aucun terme ne correspond à « {q} ».</p>
          )}

          {view.map((c) => (
            <section key={c.id} className="gloss-section">
              <h3 className="gloss-section-head">
                <span className="gloss-section-ico">{c.icon}</span>
                {c.label}
                <span className="gloss-section-n">{c.entries.length}</span>
              </h3>
              {c.hint && !q && <p className="gloss-section-hint">{c.hint}</p>}

              <ul className="glossary-list">
                {c.entries.map((e) => {
                  const key = termKey(c.id, e.term);
                  const note = notes[key];
                  const isEditing = editing === key;
                  return (
                    <li key={key} className="glossary-item">
                      <div className="gloss-row">
                        <span className="glossary-term">{e.term}</span>
                        {e.en && <span className="gloss-en">{e.en}</span>}
                        {e.src && <span className="glossary-src" title="Flash où le terme est enseigné">{e.src}</span>}
                      </div>
                      <p className="glossary-def">{e.def}</p>

                      {/* Zone d'annotation perso. */}
                      {!isEditing && note && (
                        <div className="gloss-note">
                          <span className="gloss-note-ico" aria-hidden="true">📝</span>
                          <span className="gloss-note-txt">{note}</span>
                          <span className="gloss-note-actions">
                            <button className="gloss-note-edit" onClick={() => startEdit(key)} title="Modifier ma note">✏️</button>
                            <button className="gloss-note-del" onClick={() => deleteNote(key)} title="Supprimer ma note">🗑</button>
                          </span>
                        </div>
                      )}

                      {!isEditing && !note && (
                        <button className="gloss-note-add" onClick={() => startEdit(key)}>+ Ajouter une note</button>
                      )}

                      {isEditing && (
                        <div className="gloss-note-edit-box">
                          <textarea
                            className="gloss-note-input"
                            value={draft}
                            onChange={(ev) => setDraft(ev.target.value)}
                            onKeyDown={(ev) => {
                              if (ev.key === 'Escape') { ev.stopPropagation(); cancelEdit(); }
                              if (ev.key === 'Enter' && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); saveEdit(key); }
                            }}
                            placeholder="Ton astuce perso pour retenir ce terme…"
                            rows={2}
                            autoFocus
                            aria-label={'Note pour ' + e.term}
                          />
                          <div className="gloss-note-btns">
                            <button className="gloss-note-save" onClick={() => saveEdit(key)}>Enregistrer</button>
                            <button className="gloss-note-cancel" onClick={cancelEdit}>Annuler</button>
                            <span className="gloss-note-tip">⌘/Ctrl+↵ pour enregistrer</span>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {q && (
          <p className="gloss-count">{nMatch} terme{nMatch > 1 ? 's' : ''} trouvé{nMatch > 1 ? 's' : ''}.</p>
        )}
      </div>
    </div>
  );
}
