// Keymaker — Chantier 46 : oscilloscope du Studio.  [build:c46-osc]
//
// Lit l'AnalyserNode posé par le tap d'index.html (copie du signal vers la
// destination — jamais SUR le chemin du son). Pédagogie du Module 4 : VOIR ce
// que les filtres, l'ADSR et les formes d'onde font à la matière sonore.
// Le tap n'existe qu'après le premier son joué → on le guette gentiment.

import { useEffect, useRef, useState } from 'react';

export default function Oscilloscope({ reduceMotion }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(() => !!(typeof window !== 'undefined' && window.__keymakerTap));

  // Guette l'apparition du tap (créé à la première connexion audio).
  useEffect(() => {
    if (ready) return;
    const t = setInterval(() => {
      if (window.__keymakerTap) { setReady(true); clearInterval(t); }
    }, 800);
    return () => clearInterval(t);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const tap = window.__keymakerTap;
    const cv = canvasRef.current;
    if (!tap || !cv) return;
    const data = new Uint8Array(tap.fftSize);
    const g = cv.getContext('2d');
    let raf;
    let last = 0;
    const draw = (ts) => {
      raf = requestAnimationFrame(draw);
      if (reduceMotion && ts - last < 200) return; // ~5 fps en mouvement réduit
      last = ts;
      const dpr = window.devicePixelRatio || 1;
      const w = (cv.width = cv.clientWidth * dpr);
      const h = (cv.height = cv.clientHeight * dpr);
      let accent = '#22d3ee';
      try { accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || accent; } catch { /* thème */ }
      tap.getByteTimeDomainData(data);
      g.clearRect(0, 0, w, h);
      // ligne médiane discrète
      g.strokeStyle = 'rgba(127,127,127,0.25)';
      g.lineWidth = dpr;
      g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
      // la forme d'onde
      g.strokeStyle = accent;
      g.lineWidth = 2 * dpr;
      g.lineJoin = 'round';
      g.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * w;
        const y = (data[i] / 255) * h;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ready, reduceMotion]);

  return (
    <div className="osc-wrap" role="img" aria-label="Oscilloscope — forme d'onde du son en cours">
      {ready
        ? <canvas ref={canvasRef} className="osc-canvas" />
        : <p className="osc-empty">▶ Joue un son : la forme d'onde apparaîtra ici.</p>}
    </div>
  );
}
