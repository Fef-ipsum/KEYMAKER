// Schéma « signal » : la courbe du signal (calculée par le moteur) et la coupure que
// chaque note reçoit vraiment (sa valeur au début de la note).
import { useEffect, useMemo, useRef, useState } from 'react';
import def, { SHAPES } from '../types/signal.js';
import { createPatternSound, signalPattern, fullSignalPattern as fullPattern, signalAt } from './pattern.js';
import { useSchema } from './useSchema.js';
import { useWidth, Slider, CodeLine, HoldButton, PlayButton, Choice, Missions, Deep } from './parts.jsx';
import { frHz } from '../core/format.js';

export default function SignalSchema({ spec, context = 'lecon' }) {
  const s = useSchema(def, spec, { context });
  const { st } = s;
  const start = useRef(JSON.stringify(st));
  s.extraRef.current = { ...s.extraRef.current, changed: JSON.stringify(st) !== start.current };
  const view = s.bypass ? { ...st, p: { ...st.p, hi: st.p.lo } } : st;
  const span = Math.min(16, Math.max(4, view.p.slow * 2));
  const sig = useMemo(() => signalPattern(view), [view.p.lo, view.p.hi, view.p.slow, view.o.forme]);
  const pat = useMemo(() => fullPattern(view), [sig]);
  const curve = useMemo(() => Array.from({ length: 241 }, (_, i) => [(i / 240) * span, signalAt(sig, (i / 240) * span)]), [sig, span]);
  const steps = useMemo(() => pat.queryArc(0, Math.min(span, 8)).filter((h) => h.hasOnset()).map((h) => [Number(h.whole.begin.valueOf()), Number(h.whole.end.valueOf()), Number(h.value.cutoff)]), [pat, span]);

  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const H = W < 520 ? 190 : 230;
  const L = 44;
  const R = 12;
  const T = 12;
  const B = 24;
  const x = (c) => L + (c / span) * (W - L - R);
  const y = (f) => T + (1 - Math.log(Math.max(f, 20) / 20) / Math.log(1000)) * (H - T - B);

  const [head, setHead] = useState(null);
  useEffect(() => {
    if (!s.playing) {
      setHead(null);
      return undefined;
    }
    let raf = 0;
    const loop = () => {
      const p = s.sound.current && s.sound.current.position();
      if (p != null && p >= 0) setHead(p % span);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [s.playing, span]);

  const patRef = useRef(pat);
  patRef.current = pat;
  const toggle = () => {
    if (s.playing) return s.unclaim();
    const snd = s.ensureSound((ac) => createPatternSound(ac, () => patRef.current, () => 0.5));
    s.claim();
    snd.start();
  };
  const heldPlay = useRef(false);
  const bypassDown = () => {
    s.setBypass(true);
    if (!s.playingRef.current) {
      heldPlay.current = true;
      toggle();
    }
  };
  const bypassUp = () => {
    s.setBypass(false);
    if (heldPlay.current) {
      heldPlay.current = false;
      s.unclaim();
    }
  };

  const path = curve.map(([c, v], i) => (i ? 'L' : 'M') + x(c).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  return (
    <div className={'schema schema-signal' + (s.bypass ? ' is-bypass' : '')} data-schema="signal" data-schema-id={s.id}>
      <div className="sch-figure" ref={boxRef}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="sch-svg" role="img" aria-label={`Le signal va de ${frHz(view.p.lo)} à ${frHz(view.p.hi)} en ${view.p.slow} cycles.`}>
          {Array.from({ length: span + 1 }, (_, c) => (
            <g key={c} className="sch-grid">
              <line x1={x(c)} x2={x(c)} y1={T} y2={H - B} />
              {span <= 8 || c % 2 === 0 ? <text x={x(c)} y={H - 7} textAnchor="middle">{c}</text> : null}
            </g>
          ))}
          {[100, 1000, 10000].map((f) => (
            <g key={f} className="sch-grid sch-grid-h">
              <line x1={L} x2={W - R} y1={y(f)} y2={y(f)} />
              <text x={L - 5} y={y(f) + 4} textAnchor="end">{f >= 1000 ? f / 1000 + 'k' : f}</text>
            </g>
          ))}
          <path className="sch-curve" d={path} />
          {steps.map(([b, e, v], i) => <line key={i} className="sch-step" x1={x(b)} x2={x(e)} y1={y(v)} y2={y(v)} />)}
          {head != null ? <line className="sch-head" x1={x(head)} x2={x(head)} y1={T} y2={H - B} /> : null}
          <text className="sch-axis-t" x={W - R} y={T + 10} textAnchor="end">cycles →</text>
        </svg>
      </div>
      <p className="sch-code-note">Courbe bleue : le signal. Traits dorés : la coupure que chaque note reçoit, sa valeur au début de la note.</p>
      <div className="sch-controls">
        <PlayButton playing={s.playing} onToggle={toggle} />
        <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre sans mouvement">
          <span>Maintiens : sans mouvement</span>
        </HoldButton>
        <Choice label={def.options.forme.label} values={Object.keys(SHAPES)} labels={SHAPES} value={st.o.forme} onChange={(v) => s.setOption('forme', v, true)} />
      </div>
      <div className="sch-sliders">
        {['lo', 'hi', 'slow'].map((k) => <Slider key={k} def={def} k={k} value={st.p[k]} codeName={def.paramCode(st, k)} onChange={(kk, v) => { s.setParam(kk, v); }} />)}
      </div>
      <CodeLine parts={def.code(view)} glow={{ k: s.glow.n ? 'all' : null, n: s.glow.n }} note={s.bypass ? 'Pendant que tu maintiens : la coupure reste à la valeur basse.' : null} />
      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      <Deep facts={def.facts} />
    </div>
  );
}
