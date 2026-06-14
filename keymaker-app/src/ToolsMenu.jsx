// ToolsMenu.jsx — Chantier 57/58 : le menu « ⋯ Outils » PARTAGÉ (leçon + Studio).
// Items génériques : { kind:'toggle', icon, label, on, onClick } | { kind:'action',
// icon, label, onClick } | { kind:'sep' }. Popover non modal : clic dehors ou Échap
// ferme. Désencombre la barre sous l'éditeur : Run / Stop restent au premier plan.
import { useState, useRef, useEffect } from 'react';

export default function ToolsMenu({ items = [], label = 'Outils' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const fire = (fn) => () => { try { if (fn) fn(); } finally { setOpen(false); } };
  const toolActive = items.some((it) => it.kind === 'toggle' && it.on);

  return (
    <div className={'tools-menu' + (open ? ' open' : '')} ref={wrapRef}>
      <button
        type="button"
        className={'btn tools-trigger' + (open ? ' on' : '') + (toolActive ? ' active' : '')}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Outils du pattern (visualiseur, sauvegarde, export…)"
      >
        <span className="tools-trigger-ico" aria-hidden="true">⋯</span>
        <span className="tools-trigger-label">{label}</span>
      </button>

      {open && (
        <div className="tools-pop" role="menu" aria-label={label}>
          {items.map((it, i) => {
            if (it.kind === 'sep') return <div key={'sep' + i} className="tools-sep" role="separator" />;
            const isToggle = it.kind === 'toggle';
            return (
              <button
                key={i}
                type="button"
                role={isToggle ? 'menuitemcheckbox' : 'menuitem'}
                aria-checked={isToggle ? !!it.on : undefined}
                className={'tools-item' + (isToggle && it.on ? ' checked' : '')}
                onClick={fire(it.onClick)}
              >
                <span className="tools-item-ico" aria-hidden="true">{it.icon}</span>
                <span className="tools-item-label">{it.label}</span>
                {isToggle && it.on && <span className="tools-item-state">activé</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
