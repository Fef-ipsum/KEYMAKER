// PoSync.jsx — Chantier 31 (Tranche 2) : générateur de sync PO-33.  [posync]
// Émet un train de clics Web Audio sur le canal GAUCHE, à 2 PPQN (8 clics/cycle),
// calé EN DIRECT sur le tempo de Strudel (scheduler.cps) et sur sa position
// (scheduler.now()). L'éditeur n'est JAMAIS recréé : on LIT le scheduler, point.
// Fenêtre de lookahead ré-ancrée à chaque tick → pas de dérive cumulée.
// Le cœur pur des maths de timing vit dans ./syncCore.js (testé 37/37).
import { useEffect, useRef, useState } from 'react';
import { getScheduler, schedNow } from './vizCore.js';
import { pulsesInWindow, bpmLabel, PULSES_PER_CYCLE } from './syncCore.js';

// Tente d'atteindre l'AudioContext partagé de Strudel (chemins multiples, défensif).
// Si rien : on renverra null et le générateur créera le sien (les deux horloges
// partagent le matériel ; on ré-ancre chaque tick, donc pas de dérive audible).
function getStrudelCtx(ed) {
  try {
    const sch = getScheduler(ed);
    const cands = [
      sch && sch.clock && sch.clock.context,
      sch && sch.context,
      ed && ed.repl && ed.repl.scheduler && ed.repl.scheduler.context,
      ed && ed.repl && ed.repl.audioContext,
      ed && ed.audioContext,
      typeof window !== 'undefined' && window.__strudelAudioContext,
    ];
    for (const c of cands) {
      if (c && typeof c.currentTime === 'number' && typeof c.createGain === 'function') return c;
    }
  } catch { /* ignore */ }
  return null;
}

export default function PoSync({ editorRef, playing, theme, reduceMotion, onClose }) {
  const [bpm, setBpm] = useState(0);
  const liveRef = useRef({ playing });
  liveRef.current = { playing };

  // Affichage BPM : lit scheduler.cps périodiquement (convention 4/4 → BPM = cps×240).
  useEffect(() => {
    const id = setInterval(() => {
      const sch = getScheduler(editorRef && editorRef.current);
      const cps = sch ? Number(sch.cps) : NaN;
      setBpm(cps > 0 ? bpmLabel(cps) : 0);
    }, 250);
    return () => clearInterval(id);
  }, [editorRef]);

  // Moteur audio : planificateur de clics à lookahead, sur le canal GAUCHE.
  useEffect(() => {
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return undefined;
    const ed0 = editorRef && editorRef.current;
    let ctx = getStrudelCtx(ed0);
    let own = false;
    if (!ctx) { try { ctx = new AC(); own = true; } catch { return undefined; } }

    let merger;
    try {
      merger = ctx.createChannelMerger(2); // entrée 0 = gauche, entrée 1 = droite
      merger.connect(ctx.destination);
    } catch { if (own) { try { ctx.close(); } catch { /* ignore */ } } return undefined; }

    const LOOKAHEAD = 0.12; // s d'avance planifiée
    const TICK = 30;        // ms entre deux passes
    let lastIdx = null;

    const clickAt = (t) => {
      try {
        const t0 = Math.max(t, ctx.currentTime + 0.001);
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 1000;
        const g = ctx.createGain();
        const dur = 0.006; // 6 ms — clic net, bien sous le max PO (125 ms)
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(1, t0 + 0.0006);
        g.gain.setValueAtTime(1, t0 + dur - 0.0008);
        g.gain.linearRampToValueAtTime(0, t0 + dur);
        osc.connect(g);
        g.connect(merger, 0, 0); // → entrée GAUCHE uniquement
        osc.start(t0);
        osc.stop(t0 + dur + 0.01);
        osc.onended = () => { try { g.disconnect(); osc.disconnect(); } catch { /* ignore */ } };
      } catch { /* une frame ratée ne casse pas la boucle */ }
    };

    const tick = () => {
      const sch = getScheduler(editorRef && editorRef.current);
      if (!sch || !liveRef.current.playing) { lastIdx = null; return; }
      const cps = Number(sch.cps);
      const nowCycle = schedNow(sch);       // cycles (fractionnaire)
      const audioNow = ctx.currentTime;     // lue au même instant → ancre cohérente
      if (!(cps > 0) || nowCycle == null) return;
      const r = pulsesInWindow({ nowCycle, audioNow, cps, horizon: LOOKAHEAD, lastIdx });
      for (const p of r.times) clickAt(p.t);
      lastIdx = r.lastIdx;
    };

    if (own && ctx.state === 'suspended') { ctx.resume().catch(() => {}); }
    const id = setInterval(tick, TICK);
    return () => {
      clearInterval(id);
      try { merger.disconnect(); } catch { /* ignore */ }
      if (own) { try { ctx.close(); } catch { /* ignore */ } }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="posync">
      <div className="posync-head">
        <span className="posync-title">◧ Sync PO-33</span>
        <span className={'posync-live' + (playing ? ' on' : '')}>
          {playing ? (bpm > 0 ? '● ' + bpm + ' BPM' : '● live') : '○ arrêté'}
        </span>
        {onClose && (
          <button className="posync-close" onClick={onClose} aria-label="Masquer la sync PO-33" title="Masquer">✕</button>
        )}
      </div>

      <div className="posync-body">
        <div className="posync-meta">
          <span><b>{PULSES_PER_CYCLE} clics/cycle</b> · 2 PPQN</span>
          <span>signal sur le canal <b>gauche</b></span>
        </div>

        <div className="posync-wire" aria-hidden="true">
          <div className="pw-node">ordi<small>3,5 mm</small></div>
          <div className="pw-y">⟨ Y</div>
          <div className="pw-legs">
            <div className="pw-leg pw-left"><span className="pw-ch">G</span> sync → <b>line-in PO</b></div>
            <div className="pw-leg pw-right"><span className="pw-ch">D</span> musique → <b>enceintes</b></div>
          </div>
        </div>

        <ol className="posync-steps">
          <li>Câble Y : <b>gauche → line-in du PO</b>, droite → enceintes.</li>
          <li>PO-33 : maintiens <b>record</b> + tape <b>bpm</b> → choisis <b>SY2</b>.</li>
          <li>Lance le son (<b>Run</b>) : le PO suit ton <code>setcpm</code>.</li>
          <li>Musique à droite : <code>all(x =&gt; x.pan(1))</code> (sinon mono pollué).</li>
        </ol>

        <p className="posync-hint">
          {playing ? 'Clics en cours — le PO doit suivre, tempo verrouillé.' : '▶ Lance le son pour démarrer la sync.'}
        </p>
      </div>
    </div>
  );
}
