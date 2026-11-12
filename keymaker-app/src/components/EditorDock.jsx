// L'éditeur Strudel et sa barre de lecture. Monté UNE fois par App, jamais déplacé.
//
// Sous l'éditeur :
//   ▶ / ■        l'action principale
//   le cadran    un tour = un cycle ; chaque son est un index sur le cadran
//   « Dans ton code »  les éléments reconnus, chacun ouvre son entrée du wiki

import { useEffect, useMemo, useRef, useState } from 'react';
import * as engine from '../lib/engine.js';
import * as dock from '../lib/dock.js';
import { useEngine } from '../lib/app.js';
import { explainCode, entryForToken } from '../content/wiki/index.js';
import { addSnippet } from '../lib/notebook.js';
import { Icon, useWiki } from '../ui.jsx';

/* --- Le cadran du cycle ------------------------------------------------------------ */
const RINGS = 4;
function CycleDial({ playing, reduceMotion }) {
  const [haps, setHaps] = useState([]);
  const handRef = useRef(null);
  const cycleRef = useRef(-1);

  useEffect(() => {
    let raf = 0;
    let timer = 0;
    const refresh = (c) => {
      cycleRef.current = c;
      setHaps(engine.queryHaps(c, c + 1).map((h) => ({ ...h, begin: h.begin - c })));
    };
    const tick = () => {
      const t = engine.now();
      const c = Math.floor(t);
      if (c !== cycleRef.current) refresh(c);
      if (handRef.current) handRef.current.style.transform = `rotate(${(t - c) * 360}deg)`;
      raf = requestAnimationFrame(tick);
    };
    if (playing && !reduceMotion) raf = requestAnimationFrame(tick);
    else if (playing) {
      timer = setInterval(() => {
        const c = Math.floor(engine.now());
        if (c !== cycleRef.current) refresh(c);
      }, 200);
      refresh(Math.floor(engine.now()));
    } else {
      // À l'arrêt, le cadran se vide : il ne montre jamais le rythme d'un autre écran.
      cycleRef.current = -1;
      setHaps([]);
      if (handRef.current) handRef.current.style.transform = 'rotate(0deg)';
    }
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(timer);
    };
  }, [playing, reduceMotion]);

  // Une couronne par voix : les sons d'abord, puis les notes (du grave à l'aigu).
  const voices = useMemo(() => {
    const names = [];
    for (const h of haps) {
      const v = h.note != null && (!h.s || !/^(bd|sd|hh|oh|cp|rim|lt|mt|ht|cr|rd|cb|sh|tb)$/.test(h.s)) ? (h.note < 48 ? 'basse' : 'notes') : h.s || 'son';
      if (!names.includes(v)) names.push(v);
    }
    return names.slice(0, RINGS);
  }, [haps]);

  const marks = haps.map((h, i) => {
    const v = h.note != null && (!h.s || !/^(bd|sd|hh|oh|cp|rim|lt|mt|ht|cr|rd|cb|sh|tb)$/.test(h.s)) ? (h.note < 48 ? 'basse' : 'notes') : h.s || 'son';
    const ring = voices.indexOf(v);
    if (ring < 0) return null;
    const r = 44 - ring * 9;
    const a = h.begin * Math.PI * 2 - Math.PI / 2;
    return <circle key={i} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r={ring === 0 ? 2.6 : 2.1} className={'cd-mark cd-r' + ring} />;
  });

  // Rien à montrer tant que le code n'a pas été joué une fois.
  if (!haps.length && !playing) return null;
  return (
    <div className="cdial" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="49" className="cd-bezel" />
        <circle cx="50" cy="50" r="46.5" className="cd-face" />
        {[0, 1, 2, 3].map((q) => {
          const a = (q / 4) * Math.PI * 2 - Math.PI / 2;
          return <line key={q} x1={50 + Math.cos(a) * 41} y1={50 + Math.sin(a) * 41} x2={50 + Math.cos(a) * 46} y2={50 + Math.sin(a) * 46} className="cd-tick" />;
        })}
        {voices.map((_, i) => <circle key={i} cx="50" cy="50" r={44 - i * 9} className="cd-ring" />)}
        {marks}
        <g ref={handRef} className="cd-hand" style={{ transformOrigin: '50px 50px' }}>
          <line x1="50" y1="54" x2="50" y2="7" />
        </g>
        <circle cx="50" cy="50" r="2.2" className="cd-pin" />
      </svg>
      <ul className="cd-legend">
        {voices.map((v, i) => <li key={v} className={'cd-l cd-r' + i}>{v}</li>)}
      </ul>
    </div>
  );
}

/* --- Le dock ------------------------------------------------------------------------- */
export default function EditorDock({ visible, settings, reduceMotion, dark, canReset = true, resetLabel = 'Recommencer' }) {
  const hostRef = useRef(null);
  const eng = useEngine();
  const { openWiki } = useWiki();
  const [codeText, setCodeText] = useState('');
  const [word, setWord] = useState('');
  const [keeping, setKeeping] = useState(false);
  const [keepName, setKeepName] = useState('');
  const [toast, setToast] = useState('');
  const [allChips, setAllChips] = useState(false);
  const errorRef = useRef(null);

  // Une erreur qui apparaît est amenée à l'écran (au téléphone, elle pourrait être sous la barre d'onglets).
  useEffect(() => {
    if (eng.error && errorRef.current) errorRef.current.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [eng.error]);
  useEffect(() => dock.onOwner(() => setAllChips(false)), []);

  // Montage unique de l'éditeur.
  useEffect(() => {
    let t = 0;
    engine.mountEditor(hostRef.current, '').catch(() => {});
    const host = hostRef.current;
    const sync = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        setCodeText(engine.getCode());
        setWord(engine.wordAtCursor());
      }, 180);
    };
    host.addEventListener('keyup', sync);
    host.addEventListener('pointerup', sync);
    const off1 = engine.onEvaluated(sync);
    const off2 = dock.onOwner(sync);
    return () => {
      host.removeEventListener('keyup', sync);
      host.removeEventListener('pointerup', sync);
      off1();
      off2();
      clearTimeout(t);
    };
  }, []);

  // Apparence de l'éditeur : suit le thème et la taille de texte.
  useEffect(() => {
    if (!eng.ready) return;
    const base = window.innerWidth < 420 ? 14 : window.innerWidth < 720 ? 15 : 17;
    const scale = { m: 1, l: 1.12, xl: 1.25 }[settings.textScale] || 1;
    engine.applyEditorLook({ dark, fontSize: Math.round(base * scale) });
  }, [eng.ready, dark, settings.textScale]);

  useEffect(() => {
    if (visible) engine.refreshLayout();
  }, [visible]);

  const found = useMemo(() => (visible ? explainCode(codeText) : []), [codeText, visible]);
  const focused = word ? entryForToken(word) : null;

  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };
  const keep = async () => {
    const code = engine.getCode();
    const ok = await addSnippet({ name: keepName.trim() || 'Sans titre', code, module: null });
    setKeeping(false);
    setKeepName('');
    if (ok) window.dispatchEvent(new Event('km2:snippets'));
    flash(ok ? 'Gardé. Tu le retrouves dans le Studio, sous « Mes codes gardés ».' : 'Impossible d’enregistrer sur cet appareil.');
  };
  // Au plus 6 pastilles d'abord (l'élément sous le curseur toujours inclus) ; les autres sur demande.
  const CAP = 6;
  let chips = found;
  if (!allChips && found.length > CAP) {
    chips = found.slice(0, CAP);
    if (focused && !chips.some((e) => e.id === focused.id) && found.some((e) => e.id === focused.id)) chips = [...chips.slice(0, CAP - 1), focused];
  }

  return (
    <div className="dock" hidden={!visible}>
      <div className="dock-glass">
        <div className={'editor-host' + (eng.ready ? '' : ' is-loading')} ref={hostRef} aria-label="Éditeur de code Strudel" />
        {!eng.ready && !eng.failed ? <div className="dock-wait">Le moteur se prépare…</div> : null}
        {eng.failed ? <div className="dock-error" role="alert">{eng.failed} Recharge la page.</div> : null}

        <div className="transport">
          <button
            type="button"
            className={'crown' + (eng.playing ? ' is-playing' : '')}
            onClick={() => (eng.playing ? engine.stop() : engine.run())}
            disabled={!eng.ready}
            aria-label={eng.playing ? 'Arrêter' : 'Jouer'}
          >
            <Icon name={eng.playing ? 'stop' : 'play'} size={26} />
          </button>
          <div className="transport-mid">
            {eng.playing ? (
              <button type="button" className="btn btn-quiet btn-relaunch" onClick={() => engine.run()}>
                <Icon name="play" size={16} /> Relancer
              </button>
            ) : (
              <span className="transport-hint">Jouer · <kbd>Ctrl</kbd>+<kbd>Entrée</kbd></span>
            )}
          </div>
          <div className="transport-tools">
            {canReset ? (
              <button type="button" className="toolbtn" onClick={() => dock.resetCode()} title="Remettre le code de départ">
                <Icon name="reset" size={19} />
                <span>{resetLabel}</span>
              </button>
            ) : null}
            <button type="button" className="toolbtn" onClick={() => setKeeping((k) => !k)} title="Garder ce code" aria-expanded={keeping}>
              <Icon name="keep" size={19} />
              <span>Garder</span>
            </button>
          </div>
        </div>

        {keeping ? (
          <form className="keepform" onSubmit={(e) => { e.preventDefault(); keep(); }}>
            <label htmlFor="keepname">Un nom pour le retrouver</label>
            <div className="keeprow">
              <input id="keepname" value={keepName} onChange={(e) => setKeepName(e.target.value)} placeholder="Mon rythme du soir" autoFocus maxLength={80} />
              <button type="submit" className="btn btn-primary">Garder</button>
            </div>
          </form>
        ) : null}
        {toast ? <div className="toast" role="status">{toast}</div> : null}
        {eng.error ? (
          <div className="dock-error" role="alert" ref={errorRef}>
            <p>{eng.error}</p>
            {eng.errorDetail ? (
              <details className="error-detail">
                <summary>Détail technique</summary>
                <code>{eng.errorDetail}</code>
              </details>
            ) : null}
          </div>
        ) : null}

        {/* L'écran en cours y affiche le résultat de l'exercice, juste sous ▶. */}
        <div id="dock-slot" className="dock-slot" />

        {settings.dial ? <CycleDial playing={eng.playing} reduceMotion={reduceMotion} /> : null}

        {found.length ? (
          <div className="incode">
            <div className="incode-title">Dans ton code</div>
            <div className="incode-list">
              {chips.map((e) => (
                <button type="button" key={e.id} className={'chip' + (focused && focused.id === e.id ? ' chip-strong' : '')} onClick={() => openWiki(e.id)}>
                  <span className="chip-t">{e.t}</span>
                  {e.sub ? <span className="chip-s">{e.sub}</span> : null}
                </button>
              ))}
              {chips.length < found.length ? (
                <button type="button" className="chip chip-more" onClick={() => setAllChips(true)}>
                  <span className="chip-t">+{found.length - chips.length}</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
