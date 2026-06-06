// Keymaker — Chantier 24 : carnet de notes par flash.  [build:c24-notes]
//
// Zone de texte libre attachée au flash courant (clé = flashKey), persistée en
// IndexedDB (store 'notes'). Externaliser ce qu'on retient = moins de charge
// cognitive (pertinent TDA). Auto-enregistrement (débounce + au blur) → zéro
// bouton « Enregistrer », friction minimale. Replié quand vide, déplié si une note
// existe. Composant autonome : il charge/sauve sa propre note.
import { useEffect, useRef, useState } from 'react';
import { loadNote, saveNote } from './notebook.js';

export default function FlashNote({ flashKey }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  // (Re)charge la note quand on change de flash. Le `key={flashKey}` côté parent
  // remonte le composant → cet effet repart proprement à chaque flash.
  useEffect(() => {
    let alive = true;
    loadNote(flashKey)
      .then((t) => {
        if (!alive) return;
        setText(t || '');
        setOpen(!!(t && t.trim())); // déplié seulement si une note existe déjà
      })
      .catch(() => { if (alive) setText(''); });
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [flashKey]);

  const onChange = (e) => {
    const v = e.target.value;
    setText(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveNote(flashKey, v), 500); // débounce
  };
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    saveNote(flashKey, text);
  };
  const toggle = () =>
    setOpen((o) => {
      const next = !o;
      if (!next) flush(); // on referme → on sauve tout de suite
      return next;
    });

  const hasNote = !!(text && text.trim());

  return (
    <section className={'flash-note' + (open ? ' open' : '') + (hasNote ? ' has-note' : '')}>
      <button className="flash-note-head" onClick={toggle} aria-expanded={open}>
        <span className="flash-note-ico" aria-hidden="true">✎</span>
        <span className="flash-note-label">Ma note</span>
        {hasNote && !open && <span className="flash-note-preview">{text.trim().slice(0, 64)}</span>}
        <span className={'flash-note-chevron' + (open ? ' open' : '')} aria-hidden="true">▾</span>
      </button>
      {open && (
        <textarea
          className="flash-note-area"
          value={text}
          onChange={onChange}
          onBlur={flush}
          rows={3}
          spellCheck={true}
          placeholder="Note pour toi — une astuce, un truc à retenir, un rappel… (enregistré sur cet appareil, hors-ligne)"
        />
      )}
    </section>
  );
}
