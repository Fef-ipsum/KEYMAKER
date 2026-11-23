// Schéma « effet » : écho (les répétitions sur une ligne de temps), réverbération (la
// traîne), distorsion (la courbe, et l'onde avant / après). Formules de superdough,
// vérifiées par mesure (scripts/check-schemas.mjs). Son : superdough lui-même.
import { useMemo, useRef } from 'react';
import def, { echoes, reverbEnv, scurve } from '../types/effet.js';
import { createPatternSound, effetPattern } from './pattern.js';
import { useSchema } from './useSchema.js';
import { useWidth, Slider, CodeLine, HoldButton, PlayButton, Missions, Deep, Warn } from './parts.jsx';
import { frNum } from '../core/format.js';

export default function EffetSchema({ spec, context = 'lecon' }) {
  const s = useSchema(def, spec, { context });
  const { st } = s;
  const mode = st.o.effet;
  const start = useRef(JSON.stringify(st.p));
  s.extraRef.current = { ...s.extraRef.current, changed: JSON.stringify(st.p) !== start.current };
  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const H = W < 520 ? 180 : 210;
  const L = 40;
  const R = 12;
  const T = 14;
  const B = 24;
  const pat = useMemo(() => effetPattern(st, s.bypass), [JSON.stringify(st.p), mode, s.bypass]);
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

  let drawing;
  if (mode === 'distort') {
    const half = W < 520 ? W : Math.round(W / 2) - 6;
    const h = H - T - B;
    const cx = (x, w) => 8 + ((x + 1) / 2) * (w - 16);
    const cy = (y) => T + ((1 - y) / 2) * h;
    const d = s.bypass ? 0 : st.p.distort;
    const curve = Array.from({ length: 101 }, (_, i) => -1 + i / 50);
    const t = Array.from({ length: 201 }, (_, i) => i / 200);
    drawing = (
      <>
        <svg width={half} height={H} viewBox={`0 0 ${half} ${H}`} className="sch-svg" role="img" aria-label="Courbe de la distorsion : entrée à l’horizontale, sortie à la verticale.">
          <line className="sch-zero" x1={8} x2={half - 8} y1={cy(0)} y2={cy(0)} />
          <line className="sch-zero" x1={cx(0, half)} x2={cx(0, half)} y1={T} y2={T + h} />
          <path className="sch-curve sch-curve-ideal" d={curve.map((x, i) => (i ? 'L' : 'M') + cx(x, half) + ' ' + cy(x)).join(' ')} />
          <path className="sch-curve" d={curve.map((x, i) => (i ? 'L' : 'M') + cx(x, half) + ' ' + cy(scurve(x, d))).join(' ')} />
          <text className="sch-axis-t" x={10} y={H - 6}>la courbe : entrée → sortie</text>
        </svg>
        <svg width={half} height={H} viewBox={`0 0 ${half} ${H}`} className="sch-svg" role="img" aria-label="Une période de sinusoïde avant (gris) et après la distorsion (doré).">
          <line className="sch-zero" x1={8} x2={half - 8} y1={cy(0)} y2={cy(0)} />
          <path className="sch-curve sch-curve-ideal" d={t.map((u, i) => (i ? 'L' : 'M') + (8 + u * (half - 16)) + ' ' + cy(Math.sin(2 * Math.PI * u))).join(' ')} />
          <path className="sch-curve sch-curve-live" d={t.map((u, i) => (i ? 'L' : 'M') + (8 + u * (half - 16)) + ' ' + cy(scurve(Math.sin(2 * Math.PI * u), d))).join(' ')} />
          <text className="sch-axis-t" x={10} y={H - 6}>l’onde : avant (gris), après (doré)</text>
        </svg>
      </>
    );
  } else {
    const span = mode === 'echo' ? 2 : Math.max(2, Math.min(12, 1.5 * st.p.size));
    const x = (t) => L + (t / span) * (W - L - R);
    const y = (v) => T + (1 - Math.min(1, v)) * (H - T - B);
    const ticks = Array.from({ length: Math.floor(span) + 1 }, (_, i) => i);
    const ech = mode === 'echo' && !s.bypass ? echoes(st.p, span) : [];
    const tail = mode === 'reverb' && !s.bypass ? Array.from({ length: 161 }, (_, i) => [(i / 160) * span, reverbEnv(st.p, (i / 160) * span)]) : [];
    drawing = (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="sch-svg" role="img" aria-label={mode === 'echo' ? `${ech.length} répétitions, toutes les ${frNum(st.p.delaytime, 2)} s.` : `Une traîne de ${frNum(1.5 * st.p.size, 1)} s.`}>
        {ticks.map((t) => (
          <g key={t} className="sch-grid">
            <line x1={x(t)} x2={x(t)} y1={T} y2={H - B} />
            <text x={x(t)} y={H - 7} textAnchor="middle">{t} s</text>
          </g>
        ))}
        <line className="sch-zero" x1={L} x2={W - R} y1={y(0)} y2={y(0)} />
        <rect className="sch-bar-dry" x={x(0) - 3} y={y(1)} width={6} height={y(0) - y(1)} rx={2} />
        {ech.map((e, i) => <rect key={i} className="sch-bar" x={x(e.t) - 3} y={y(e.level)} width={6} height={y(0) - y(e.level)} rx={2} />)}
        {tail.length ? <path className="sch-fill sch-fill-gold" d={'M ' + x(0) + ' ' + y(0) + ' ' + tail.map(([t, v]) => 'L ' + x(t).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ') + ` L ${x(span)} ${y(0)} Z`} /> : null}
        <text className="sch-axis-t" x={L + 4} y={T + 10}>{mode === 'echo' ? 'la note (bleu) puis ses échos (doré), à leur niveau' : 'la note (bleu) et la traîne (forme de son volume)'}</text>
      </svg>
    );
  }

  return (
    <div className={'schema schema-effet' + (s.bypass ? ' is-bypass' : '')} data-schema="effet" data-schema-id={s.id}>
      <div className="sch-figure sch-effet-fig" ref={boxRef}>{drawing}</div>
      <div className="sch-controls">
        <PlayButton playing={s.playing} onToggle={toggle} />
        <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre sans l’effet">
          <span>Maintiens : sans l’effet</span>
        </HoldButton>
      </div>
      <div className="sch-sliders">
        {def.keys(st).map((k) => <Slider key={k} def={def} k={k} value={st.p[k]} codeName={def.paramCode(st, k)} onChange={s.setParam} disabled={!s.can(k)} />)}
      </div>
      <Warn text={def.warn(st)} />
      <CodeLine parts={[{ t: s.bypass ? def.codeText(st).replace(/\.(delay|room|distort)\(.*$/, '') : def.codeText(st), k: 'all' }]} glow={{ k: s.glow.n ? 'all' : null, n: s.glow.n }} note={s.bypass ? 'Pendant que tu maintiens : la même note, sans l’effet.' : null} />
      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      <Deep facts={def.facts.filter((f) => f.modes.includes(mode))} />
    </div>
  );
}
