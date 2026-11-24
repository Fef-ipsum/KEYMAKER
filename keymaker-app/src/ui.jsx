// Keymaker 2 — composants partagés par tous les écrans.

import { createContext, useContext, useEffect, useState } from 'react';
import * as engine from './lib/engine.js';
import { useEngine, go } from './lib/app.js';
import { byId } from './content/wiki/index.js';
import { writeText } from './lib/store.js';

/* --- Icônes (traits fins, dessinées pour l'app) --------------------------------- */
const PATHS = {
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor" stroke="none" />,
  today: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>),
  path: (<><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h5a4 4 0 0 0 0-8h-2a4 4 0 0 1 0-8" transform="translate(0 4) scale(1 .8)" /></>),
  wiki: (<><path d="M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h10.5" /></>),
  studio: (<><path d="M5 7v10M9.5 4v16M14.5 8v8M19 5v14" /></>),
  genres: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="2.5" /><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" /></>),
  sati: (<><path d="M5 6.5h14v9H11l-4 3.5v-3.5H5z" /></>),
  gear: (<><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18" /></>),
  check: <path d="M5 12.5 10 17l9-10" />,
  next: <path d="M9 5l7 7-7 7" />,
  prev: <path d="M15 5l-7 7 7 7" />,
  down: <path d="M5 9l7 7 7-7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  reset: (<><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" /><path d="M4 4.5v4.5h4.5" /></>),
  keep: <path d="M7 4.5h10v15l-5-3.5-5 3.5z" />,
  search: (<><circle cx="11" cy="11" r="6" /><path d="M16 16l4 4" /></>),
  ear: (<><path d="M8 18a3 3 0 0 0 5 0c0-3 3.5-3.5 3.5-7.5a5.5 5.5 0 0 0-11 0" /><path d="M9 11a3 3 0 0 1 5 0" /></>),
  note: (<><path d="M5 5h14v10l-4 4H5z" /><path d="M15 19v-4h4" /></>),
  compare: (<><path d="M12 4v16" /><path d="M5 8h4M5 12h4M5 16h4M15 8h4M15 12h4M15 16h4" /></>),
  send: <path d="M4 12 20 5l-5 15-3-6z" />,
  open: (<><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M18 14v5H5V6h5" /></>),
  download: (<><path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" /></>),
  trash: (<><path d="M5 7h14" /><path d="M9 7V4.5h6V7" /><path d="M7 7l1 12.5h8L17 7" /></>),
  dial: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 12l4-4" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>),
  beat: (<><path d="M8.5 20h7l-2-15.5h-3z" /><path d="M12 15 16.5 6" /><circle cx="12" cy="15" r="1" fill="currentColor" /></>),
  flag: (<><path d="M6 20.5V4" /><path d="M6 4.5h11l-2.5 4 2.5 4H6" /></>),
};

/* --- Le bloc de l'éditeur accueille le résultat de l'écran en cours ------------------ */
export function useDockSlot() {
  const [slot, setSlot] = useState(null);
  useEffect(() => setSlot(document.getElementById('dock-slot')), []);
  return slot;
}

// Au téléphone et à la tablette (une seule colonne), amène un bloc en haut de l'écran.
export function revealOnNarrow(selector, reduceMotion) {
  if (typeof window === 'undefined' || !window.matchMedia('(max-width: 999px)').matches) return;
  requestAnimationFrame(() => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}
export function Icon({ name, size = 20, className = '' }) {
  return (
    <svg className={'ic ' + className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name] || null}
    </svg>
  );
}

/* --- Wiki : ouvrir une entrée par-dessus l'écran en cours -------------------------- */
export const WikiContext = createContext({ openWiki: () => {} });
export function useWiki() {
  return useContext(WikiContext);
}

// Lien vers une entrée du wiki (pastille).
export function WikiChip({ id, label, strong = false }) {
  const { openWiki } = useWiki();
  const e = byId[id];
  if (!e) return null;
  return (
    <button type="button" className={'chip' + (strong ? ' chip-strong' : '')} onClick={() => openWiki(id)} title={e.sub || ''}>
      <span className="chip-t">{label || e.t}</span>
      {e.sub && !label ? <span className="chip-s">{e.sub}</span> : null}
    </button>
  );
}

/* --- Texte enrichi ------------------------------------------------------------------
   Un mini-format dans les contenus : `code`, **gras**, *italique*, et les liens vers
   le wiki : [texte](fx.lpf) — le texte peut contenir du `code`. Un identifiant
   inconnu affiche le texte sans lien (scripts/check-links.mjs le signale).        */
// Typographie française : espace insécable dans les guillemets « » et devant : ; ! ?
// (évite un guillemet ou un deux-points seul en début de ligne). Jamais dans le code.
const frType = (t) => t.replace(/« /g, '« ').replace(/ »/g, ' »').replace(/ ([:;!?])(?=\s|$)/g, ' $1');

export const WIKI_LINK = /\[([^\]]+)\]\(([a-z]+\.[\w.-]+)\)/g;

function WikiLink({ id, children }) {
  const { openWiki } = useWiki();
  const e = byId[id];
  if (!e) return <>{children}</>;
  return (
    <button type="button" className="wikilink" onClick={() => openWiki(id)} title={e.t + (e.sub ? ' — ' + e.sub : '')}>
      {children}
    </button>
  );
}

const linkLabel = (t) => t.split(/(`[^`]+`)/).map((part, i) => (part[0] === '`' ? <code key={i}>{part.slice(1, -1)}</code> : frType(part)));

export function Rich({ text, as: Tag = 'span', className }) {
  if (!text) return null;
  const out = [];
  const re = /(\[[^\]]+\]\([a-z]+\.[\w.-]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m;
  let k = 0;
  const s = String(text);
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(frType(s.slice(last, m.index)));
    const tok = m[0];
    if (tok[0] === '[') {
      const [, label, id] = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      out.push(<WikiLink key={k++} id={id}>{linkLabel(label)}</WikiLink>);
    } else if (tok[0] === '`') {
      // Un code court ne se coupe jamais ; un code long (plus de 24 signes) peut passer à la
      // ligne, sinon il déborde de l'écran d'un téléphone.
      const c = tok.slice(1, -1);
      out.push(<code key={k++} className={c.length > 24 ? 'code-long' : undefined}>{c}</code>);
    }
    else if (tok.startsWith('**')) out.push(<strong key={k++}>{frType(tok.slice(2, -2))}</strong>);
    else out.push(<em key={k++}>{frType(tok.slice(1, -1))}</em>);
    last = m.index + tok.length;
  }
  if (last < s.length) out.push(frType(s.slice(last)));
  return <Tag className={className}>{out}</Tag>;
}

/* --- Bouton d'écoute d'un exemple (sans toucher au code en cours) ------------------ */
export function usePreview(code) {
  const eng = useEngine();
  const on = eng.previewing === code && eng.playing;
  const toggle = async () => {
    if (on) engine.endPreview();
    else await engine.preview(code);
  };
  return { on, toggle, ready: eng.ready };
}

export function PlayMini({ code, label = 'Écouter', big = false }) {
  const { on, toggle, ready } = usePreview(code);
  return (
    <button type="button" className={'playmini' + (on ? ' is-on' : '') + (big ? ' playmini-big' : '')} onClick={toggle} disabled={!ready} aria-pressed={on}>
      <Icon name={on ? 'stop' : 'play'} size={big ? 22 : 16} />
      <span>{on ? 'Arrêter' : label}</span>
    </button>
  );
}

// Un exemple de code, lisible, avec écoute et envoi dans le Studio.
export function Sample({ code, title, note }) {
  const openInStudio = () => {
    engine.endPreview();
    // Le Studio range d'abord ton code en cours dans « Mes codes gardés », puis charge celui-ci.
    writeText('km2:studio:incoming', code);
    go('#/studio');
  };
  return (
    <div className="sample">
      {title ? <div className="sample-title"><Rich text={title} /></div> : null}
      <pre className="code"><code>{code}</code></pre>
      {note ? <p className="sample-note"><Rich text={note} /></p> : null}
      <div className="sample-actions">
        <PlayMini code={code} />
        <button type="button" className="linkbtn" onClick={openInStudio}>
          <Icon name="open" size={15} /> Ouvrir dans le Studio
        </button>
      </div>
    </div>
  );
}

/* --- Repli ------------------------------------------------------------------------- */
export function Fold({ title, hint, children, defaultOpen = false, onOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={'fold' + (open ? ' is-open' : '')}>
      <button
        type="button"
        className="fold-head"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          if (!open && onOpen) onOpen();
        }}
      >
        <span className="fold-title">{title}</span>
        {hint ? <span className="fold-hint">{hint}</span> : null}
        <Icon name="down" size={18} className="fold-arrow" />
      </button>
      {open ? <div className="fold-body">{children}</div> : null}
    </section>
  );
}

/* --- Cadran de progression (l'identité de l'app) ------------------------------------
   Un cadran de montre : un index par étape autour du cadran, bleui quand l'étape
   est faite, doré quand elle est acquise. Chiffre romain au centre.               */
export function ProgressDial({ levels, label, size = 64 }) {
  const n = levels.length || 1;
  const r = 26;
  const marks = levels.map((lv, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x1 = 32 + Math.cos(a) * (r - 5);
    const y1 = 32 + Math.sin(a) * (r - 5);
    const x2 = 32 + Math.cos(a) * r;
    const y2 = 32 + Math.sin(a) * r;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={'dial-mark lv-' + lv} />;
  });
  const done = levels.filter((l) => l === 'faite' || l === 'acquise').length;
  const a = (done / n) * Math.PI * 2 - Math.PI / 2;
  return (
    <svg className="pdial" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={`${done} étapes faites sur ${n}`}>
      <circle cx="32" cy="32" r="30.5" className="dial-bezel" />
      <circle cx="32" cy="32" r="28" className="dial-face" />
      {marks}
      {done > 0 && done < n ? <line x1="32" y1="32" x2={32 + Math.cos(a) * 15} y2={32 + Math.sin(a) * 15} className="dial-hand" /> : null}
      <text x="32" y="32" className="dial-num" textAnchor="middle" dominantBaseline="central">{label}</text>
    </svg>
  );
}

export function LevelDot({ level }) {
  const titles = { nouvelle: 'Pas encore ouverte', vue: 'Vue', faite: 'Faite', acquise: 'Acquise' };
  return <span className={'ldot lv-' + level} title={titles[level]} aria-label={titles[level]} />;
}

/* --- Petit son de validation (désactivable) ------------------------------------------ */
let chimeCtx = null;
export function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    chimeCtx = chimeCtx || new AC();
    const t = chimeCtx.currentTime + 0.02;
    [[784, 0], [1175, 0.09]].forEach(([f, d]) => {
      const o = chimeCtx.createOscillator();
      const g = chimeCtx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t + d);
      g.gain.linearRampToValueAtTime(0.07, t + d + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.5);
      o.connect(g).connect(chimeCtx.destination);
      o.start(t + d);
      o.stop(t + d + 0.55);
    });
  } catch {
    /* pas de son : sans importance */
  }
}

/* --- Réseau ------------------------------------------------------------------------- */
export function useOnline() {
  const [on, setOn] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false));
  useEffect(() => {
    const up = () => setOn(navigator.onLine !== false);
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', up);
    };
  }, []);
  return on;
}

// En-tête d'écran standard.
export function PageHead({ kicker, title, lead, children }) {
  return (
    <header className="pagehead">
      {kicker ? <div className="kicker">{kicker}</div> : null}
      <h1>{title}</h1>
      {lead ? <p className="lead"><Rich text={lead} /></p> : null}
      {children}
    </header>
  );
}
