// PatternViz.jsx — Chantier 26 : visualiseur de pattern.
// Grille rythmique animée qui LIT le pattern courant du REPL Strudel
// (editor.pattern.queryArc) et balaie un curseur de lecture calé sur le
// scheduler (scheduler.now()). L'éditeur n'est JAMAIS recréé : on le lit, point.
// 100 % canvas, thème-aware (Void / Clair / Matrix via les variables CSS).
// Le cœur pur (accès moteur, parsing des haps, voies) vit dans ./vizCore.js (testé).
import { useEffect, useRef } from 'react';
import { getScheduler, getPattern, schedNow, clamp01, trim, processHaps } from './vizCore.js';

// Couleurs du thème courant, lues sur les variables CSS → suit Void / Clair / Matrix.
function readColors() {
  const fb = { surface:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.12)', accent:'#22d3ee', text:'#e7eef6', muted:'#93a6bd', rgb:'34,211,238' };
  try {
    const cs = getComputedStyle(document.documentElement);
    const g = (k, d) => { const v = (cs.getPropertyValue(k) || '').trim(); return v || d; };
    return {
      surface: g('--surface', fb.surface),
      border: g('--border-soft', fb.border),
      accent: g('--accent', fb.accent),
      text: g('--text', fb.text),
      muted: g('--muted', fb.muted),
      rgb: g('--accent-rgb', fb.rgb),
    };
  } catch { return fb; }
}

/* --- helpers dessin (canvas only) --- */
function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
const UI_FONT = "'Segoe UI', system-ui, -apple-system, sans-serif";
const MONO_FONT = "'JetBrains Mono', 'Cascadia Code', Consolas, monospace";

export default function PatternViz({ editorRef, playing, theme, reduceMotion, onClose }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const colorsRef = useRef(readColors());
  const liveRef = useRef({ playing, reduceMotion });
  const cacheRef = useRef({ code: null, cycle: null, lanes: new Map(), order: [], haps: [] });
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 600, h: 150, dpr: 1 });

  liveRef.current = { playing, reduceMotion };

  useEffect(() => { colorsRef.current = readColors(); }, [theme]);

  // Dimensionne le canvas (DPR + largeur du conteneur), suit les redimensionnements.
  useEffect(() => {
    const cv = canvasRef.current, wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(240, wrap.clientWidth);
      const h = 150;
      sizeRef.current = { w, h, dpr };
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = w + 'px';
      cv.style.height = h + 'px';
    };
    resize();
    let ro = null;
    try { ro = new ResizeObserver(resize); ro.observe(wrap); }
    catch { window.addEventListener('resize', resize); }
    return () => {
      try { if (ro) ro.disconnect(); } catch { /* ignore */ }
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Boucle d'animation : lit le pattern + le temps, redessine la grille.
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;

    const requery = (pat, cyc, code) => {
      let raw = [];
      try { raw = pat.queryArc(cyc, cyc + 1) || []; } catch { raw = []; }
      const c = cacheRef.current;
      if (code !== c.code) { c.lanes = new Map(); c.order = []; }
      c.haps = processHaps(raw, cyc, c.lanes, c.order);
      c.code = code; c.cycle = cyc;
    };

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      try {
        const { w, h, dpr } = sizeRef.current;
        const col = colorsRef.current;
        const { playing: isPlaying, reduceMotion: rm } = liveRef.current;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const ed = editorRef && editorRef.current;
        const pat = getPattern(ed);
        const code = (ed && typeof ed.code === 'string') ? ed.code : '';

        const padL = 64, padR = 10, padT = 10, padB = 18;
        const gx = padL, gy = padT;
        const gw = Math.max(40, w - padL - padR);
        const gh = Math.max(30, h - padT - padB);

        ctx.fillStyle = col.surface;
        roundRect(ctx, gx, gy, gw, gh, 8); ctx.fill();

        if (!pat) {
          ctx.fillStyle = col.muted;
          ctx.font = '13px ' + UI_FONT;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('▶ Lance le son (Run) pour voir le rythme', gx + gw / 2, gy + gh / 2);
          return;
        }

        const now = schedNow(getScheduler(ed));
        const moving = isPlaying && now != null;
        const cyc = moving ? Math.floor(now) : 0;
        const phase = moving ? (now - cyc) : null;

        if (cyc !== cacheRef.current.cycle || code !== cacheRef.current.code) requery(pat, cyc, code);
        const c = cacheRef.current;
        const rows = Math.max(1, c.order.length);
        const laneH = gh / rows;

        // Subdivisions : 16 pas, temps (1/4) marqués plus fort.
        const steps = 16;
        for (let i = 0; i <= steps; i++) {
          const x = gx + (gw * i) / steps;
          const beat = i % 4 === 0;
          ctx.strokeStyle = beat ? 'rgba(' + col.rgb + ',0.22)' : col.border;
          ctx.lineWidth = beat ? 1.4 : 1;
          ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); ctx.stroke();
        }

        // Voies : séparateurs + étiquettes à gauche.
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.font = '12px ' + MONO_FONT;
        for (let r = 0; r < rows; r++) {
          const y = gy + laneH * r;
          if (r > 0) {
            ctx.strokeStyle = col.border; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke();
          }
          ctx.fillStyle = col.muted;
          ctx.fillText(trim(c.order[r] || '', 9), gx - 8, y + laneH / 2);
        }

        // Évènements (un bloc par hap, surligné quand le curseur passe dessus).
        for (const hh of c.haps) {
          const y = gy + laneH * (hh.row || 0) + 3;
          const bh = Math.max(5, laneH - 6);
          const x0 = gx + gw * clamp01(hh.b);
          const x1 = gx + gw * clamp01(hh.e);
          const bw = Math.max(4, x1 - x0);
          const active = phase != null && phase >= hh.b && phase < hh.e;
          if (active && !rm) { ctx.shadowColor = 'rgba(' + col.rgb + ',0.9)'; ctx.shadowBlur = 12; }
          else { ctx.shadowBlur = 0; }
          ctx.fillStyle = active ? col.accent : 'rgba(' + col.rgb + ',0.42)';
          roundRect(ctx, x0, y, bw, bh, 4); ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Curseur de lecture (seulement quand ça joue).
        if (phase != null) {
          const x = gx + gw * clamp01(phase);
          ctx.strokeStyle = col.accent; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, gy - 2); ctx.lineTo(x, gy + gh + 2); ctx.stroke();
          if (!rm) { ctx.fillStyle = col.accent; ctx.beginPath(); ctx.arc(x, gy - 2, 3, 0, Math.PI * 2); ctx.fill(); }
        } else {
          ctx.fillStyle = col.muted;
          ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
          ctx.font = '11px ' + UI_FONT;
          ctx.fillText('arrêté · structure du cycle', gx + 4, gy + gh + 13);
        }
      } catch { /* une frame ratée ne casse pas la boucle */ }
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="viz" ref={wrapRef}>
      <div className="viz-head">
        <span className="viz-title">◫ Visualiseur de rythme</span>
        <span className={'viz-live' + (playing ? ' on' : '')}>{playing ? '● live' : '○ arrêté'}</span>
        {onClose && (
          <button className="viz-close" onClick={onClose} aria-label="Masquer le visualiseur" title="Masquer">✕</button>
        )}
      </div>
      <canvas ref={canvasRef} className="viz-canvas" role="img" aria-label="Grille rythmique du pattern en cours de lecture" />
    </div>
  );
}
