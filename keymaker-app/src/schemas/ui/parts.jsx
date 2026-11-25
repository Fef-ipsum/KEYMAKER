// Schémas vivants — pièces communes : curseurs, ligne de code, avant/après, missions, « Creuser ».
import { useEffect, useRef, useState } from 'react';
import { toPos, fromPos } from '../catalog.js';
import { Icon, Rich, Fold } from '../../ui.jsx';

/* --- Taille réelle d'un élément (le dessin se fait à l'échelle 1 : textes nets) --- */
export function useWidth(ref, fallback = 600) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver((entries) => {
      const cw = Math.round(entries[0].contentRect.width);
      if (cw > 0) setW(cw);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return w;
}

/* --- Un curseur : précision, clavier, lecteurs d'écran ---------------------------- */
const STEPS = 1000;
export function Slider({ def, k, value, onChange, codeName, disabled = false, label, hint }) {
  const p = { ...def.params[k], ...(label ? { label } : {}), ...(hint !== undefined ? { hint } : {}) };
  return (
    <label className={'sch-slider' + (disabled ? ' is-off' : '')}>
      <span className="sch-slider-top">
        <span className="sch-slider-name">
          {p.label} {codeName ? <code>{codeName}</code> : null}
          {p.hint ? <span className="sch-slider-hint"> · {p.hint}</span> : null}
        </span>
        <span className="sch-slider-val">{p.fmt(value)}</span>
      </span>
      <input
        type="range"
        min={0}
        max={STEPS}
        step={1}
        disabled={disabled}
        value={Math.round(toPos(p, value) * STEPS)}
        onChange={(e) => onChange(k, fromPos(p, Number(e.target.value) / STEPS))}
        aria-valuetext={p.fmt(value)}
      />
    </label>
  );
}

/* --- La ligne de code : exactement ce qu'on entend ; la valeur qui change brille --- */
// Points de coupure avant chaque « .méthode( » : sur téléphone, une longue ligne se coupe entre
// deux appels plutôt qu'au milieu d'un texte entre guillemets. <wbr> n'ajoute aucun caractère
// (le texte copié reste le même).
const breakable = (t) => String(t).split(/(?=\.[A-Za-z_$])/).flatMap((seg, i) => (i ? [<wbr key={'w' + i} />, seg] : [seg]));

export function CodeLine({ parts, glow, note }) {
  return (
    <div className="sch-code">
      <pre className="code code-small"><code>
        {parts.map((x, i) =>
          x.k ? (
            <span key={x.k + ':' + (glow.k === x.k ? glow.n : 0)} className={'sch-val' + (glow.k === x.k && glow.n ? ' is-glow' : '') + (x.off ? ' is-off' : '')}>{breakable(x.t)}</span>
          ) : (
            <span key={i} className={x.off ? 'is-off' : undefined}>{breakable(x.t)}</span>
          ),
        )}
      </code></pre>
      {note ? <p className="sch-code-note"><Rich text={note} /></p> : null}
    </div>
  );
}

/* --- Bouton qu'on maintient (avant / après, ou « tenir une note ») ---------------- */
export function HoldButton({ onDown, onUp, children, className = '', big = false, label }) {
  const down = useRef(false);
  const start = (e) => {
    if (down.current) return;
    down.current = true;
    if (e && e.pointerId != null && e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    onDown();
  };
  const end = () => {
    if (!down.current) return;
    down.current = false;
    onUp();
  };
  useEffect(() => () => {
    if (down.current) onUp();
  }, []);
  return (
    <button
      type="button"
      className={'sch-hold' + (big ? ' sch-hold-big' : '') + ' ' + className}
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        start(e);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          end();
        }
      }}
      onBlur={end}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
}

/* --- Lire / arrêter ------------------------------------------------------------- */
export function PlayButton({ playing, onToggle, label = 'Écouter' }) {
  return (
    <button type="button" className={'sch-play' + (playing ? ' is-on' : '')} onClick={onToggle} aria-pressed={playing}>
      <Icon name={playing ? 'stop' : 'play'} size={20} />
      <span>{playing ? 'Arrêter' : label}</span>
    </button>
  );
}

/* --- Choix court (source, mode, genre de filtre) --------------------------------- */
export function Choice({ label, values, labels = {}, value, onChange }) {
  return (
    <div className="sch-choice" role="radiogroup" aria-label={label}>
      {values.map((v) => (
        <button key={v} type="button" role="radio" aria-checked={v === value} className={'sch-choice-b' + (v === value ? ' is-on' : '')} onClick={() => onChange(v)}>
          {labels[v] || v}
        </button>
      ))}
    </div>
  );
}

/* --- Missions : deux ou trois défis, jamais bloquants ----------------------------- */
export function Missions({ missions, done, fresh }) {
  if (!missions.length) return null;
  return (
    <div className="sch-missions">
      <div className="moment-label">Missions</div>
      <ul>
        {missions.map((m) => {
          const ok = done.includes(m.id);
          return (
            <li key={m.id} className={'sch-mission' + (ok ? ' is-done' : '')}>
              <span className="sch-mission-mark" aria-hidden="true">{ok ? <Icon name="check" size={16} /> : null}</span>
              <span>
                <Rich text={m.text} />
                {ok ? (
                  <span className={'sch-learned' + (fresh === m.id ? ' is-fresh' : '')} role={fresh === m.id ? 'status' : undefined}>
                    <Rich text={m.learned} />
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* --- « Creuser » : quelques faits vérifiés ------------------------------------------ */
export function Deep({ facts }) {
  if (!facts || !facts.length) return null;
  return (
    <Fold title="Creuser" hint="des faits vérifiés dans Strudel">
      <ul className="bullets">{facts.map((f) => <li key={f.id}><Rich text={f.text} /></li>)}</ul>
    </Fold>
  );
}

export function Warn({ text }) {
  if (!text) return null;
  return <p className="sch-warn" role="status"><Rich text={text} /></p>;
}
