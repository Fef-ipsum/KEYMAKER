// Schéma « tempo » : setcpm, les cycles par minute, les temps par cycle, les BPM.
// Les instants dessinés sont ceux du motif (queryArc), placés en secondes au tempo réglé ;
// le son passe par superdough. On attrape la fin du premier cycle pour l'étirer.
import { useEffect, useMemo, useRef, useState } from 'react';
import def from '../types/tempo.js';
import { motifEvents, motifPattern, createPatternSound } from './pattern.js';
import { useSchema } from './useSchema.js';
import { useWidth, Slider, CodeLine, HoldButton, PlayButton, Choice, Missions, Deep } from './parts.jsx';
import { frNum } from '../core/format.js';

const SPAN = 4; // secondes dessinées

export default function TempoSchema({ spec, context = 'lecon' }) {
  const s = useSchema(def, spec, { context });
  const { st } = s;
  const view = s.bypass ? { ...st, p: { ...st.p, bpm: 30 * st.o.temps } } : st;
  const cpm = def.cpm(view);
  const cps = cpm / 60;
  const cycleDur = 1 / cps;
  const motif = def.motif(st);
  const ev = useMemo(() => motifEvents(motif, 0, Math.ceil(SPAN * cps) + 1).ev, [motif, cps]);

  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const H = W < 520 ? 150 : 170;
  const L = 34;
  const R = 12;
  const x = (t) => L + (t / SPAN) * (W - L - R);
  const tOf = (px) => ((px - L) / (W - L - R)) * SPAN;
  const rowY = { bd: 52, hh: 92 };

  const [head, setHead] = useState(null);
  useEffect(() => {
    if (!s.playing) {
      setHead(null);
      return undefined;
    }
    let raf = 0;
    const loop = () => {
      const p = s.sound.current && s.sound.current.position();
      if (p != null && p >= 0) setHead((p / cps) % SPAN);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [s.playing, cps]);

  const patRef = useRef(null);
  const cpsRef = useRef(cps);
  cpsRef.current = cps;
  useEffect(() => {
    patRef.current = motifPattern(motif);
  }, [motif]);
  const toggle = () => {
    if (s.playing) return s.unclaim();
    const snd = s.ensureSound((ac) => createPatternSound(ac, () => patRef.current, () => cpsRef.current));
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

  // Attraper la fin du premier cycle : durée du cycle → BPM = 60 × temps / durée.
  const drag = useRef(false);
  const dragTo = (e) => {
    const r = boxRef.current.querySelector('svg').getBoundingClientRect();
    const d = Math.max(0.2, tOf(e.clientX - r.left));
    s.setParam('bpm', (60 * st.o.temps) / d);
  };
  const cycles = [];
  for (let c = 0; c * cycleDur <= SPAN + 1e-9; c++) cycles.push(c * cycleDur);

  return (
    <div className={'schema schema-tempo' + (s.bypass ? ' is-bypass' : '')} data-schema="tempo" data-schema-id={s.id}>
      <div className="sch-figure" ref={boxRef}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="sch-svg"
          role="img"
          aria-label={`${frNum(cpm, 2)} cycles par minute : un cycle dure ${frNum(cycleDur, 2)} secondes.`}
          onPointerDown={(e) => {
            if (s.bypass) return;
            drag.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            dragTo(e);
          }}
          onPointerMove={(e) => drag.current && dragTo(e)}
          onPointerUp={() => (drag.current = false)}
          onPointerCancel={() => (drag.current = false)}
        >
          {[0, 1, 2, 3, 4].map((t) => (
            <g key={t} className="sch-grid">
              <line x1={x(t)} x2={x(t)} y1={H - 30} y2={H - 24} />
              <text x={x(t)} y={H - 10} textAnchor="middle">{t} s</text>
            </g>
          ))}
          {cycles.map((t, i) => (
            <g key={i}>
              <line className="sch-cycle-line" x1={x(t)} x2={x(t)} y1={14} y2={H - 30} />
              {t + cycleDur / 2 <= SPAN ? <text className="sch-axis-t" x={x(t + cycleDur / 2)} y={24} textAnchor="middle">cycle {i + 1}</text> : null}
            </g>
          ))}
          <text className="sch-axis-t" x={4} y={rowY.bd + 4}>bd</text>
          <text className="sch-axis-t" x={4} y={rowY.hh + 4}>hh</text>
          {ev.map((e, i) => {
            const t = e.b / cps;
            if (t > SPAN) return null;
            return <circle key={i} className={'sch-hit sch-hit-' + e.s} cx={x(t)} cy={rowY[e.s] || 120} r={e.s === 'bd' ? 7 : 4.5} />;
          })}
          {head != null ? <line className="sch-head" x1={x(head)} x2={x(head)} y1={14} y2={H - 30} /> : null}
          {!s.bypass ? (
            <g className="sch-handle" tabIndex={0} role="group" aria-label={`Fin du premier cycle : ${frNum(cycleDur, 2)} s. Flèches pour régler le tempo.`} onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                s.setParam('bpm', st.p.bpm + (e.key === 'ArrowLeft' ? 1 : -1) * (e.shiftKey ? 10 : 1));
              }
            }}>
              <circle className="sch-handle-hit" cx={x(Math.min(cycleDur, SPAN))} cy={H - 30} r={22} />
              <circle className="sch-handle-dot" cx={x(Math.min(cycleDur, SPAN))} cy={H - 30} r={8} />
            </g>
          ) : null}
        </svg>
      </div>

      <p className="sch-tempo-line">
        <code>setcpm({view.p.bpm}/{st.o.temps})</code> = <strong>{frNum(cpm, 2)}</strong> cycles par minute · 1 cycle = <strong>{frNum(cycleDur, 2)} s</strong> · {st.o.temps} temps par cycle → <strong>{view.p.bpm} temps par minute</strong> (BPM)
      </p>

      <div className="sch-controls">
        <PlayButton playing={s.playing} onToggle={toggle} />
        <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre le tempo par défaut">
          <span>Maintiens : sans setcpm</span>
        </HoldButton>
        <Choice label={def.options.temps.label} values={def.options.temps.values} labels={def.options.temps.labels} value={st.o.temps} onChange={(v) => s.setOption('temps', v, true)} />
      </div>
      <div className="sch-sliders">
        <Slider def={def} k="bpm" value={st.p.bpm} codeName="setcpm" onChange={s.setParam} />
      </div>
      <CodeLine parts={def.code(st)} glow={s.glow} note={s.bypass ? 'Sans setcpm : 30 cycles par minute, le tempo par défaut de Keymaker.' : null} />
      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      <Deep facts={def.facts} />
    </div>
  );
}
