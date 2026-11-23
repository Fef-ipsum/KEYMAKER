// Schéma « enveloppe de filtre » : la coupure dans le temps, pendant la note.
//
// En haut : la coupure (échelle en octaves) au fil du temps, calculée par envPlan — la
// fonction qui programme aussi le filtre de chaque note. Les montées exponentielles y
// sont des droites. Trois poignées : A (sommet), D (fin du decay, et niveau S),
// R (fin du release). Pendant la lecture, une trace dorée suit la vraie coupure.
// En dessous : la courbe du filtre lui-même, qui s'ouvre et se referme.
import { useEffect, useMemo, useRef, useState } from 'react';
import def from '../types/enveloppeFiltre.js';
import { SOURCES } from '../types/filtre.js';
import { envPlan, phaseAt } from '../core/adsr.js';
import { frHz, frNum } from '../core/format.js';
import { audioContext } from '../core/audio.js';
import { filterResponse } from './response.js';
import { createFenvSound, CPS } from './sounds.js';
import { useSchema } from './useSchema.js';
import { useWidth, Slider, CodeLine, HoldButton, PlayButton, Choice, Missions, Deep, Warn } from './parts.jsx';
import { Fold } from '../../ui.jsx';

const F_LO = 20;
const F_HI = 20000;
const PHASES = [['A', 'attack · lpa'], ['D', 'decay · lpd'], ['S', 'sustain · lps'], ['R', 'release · lpr']];
const niceSpan = (v) => [0.5, 1, 1.5, 2, 3, 4, 5, 6].find((x) => x >= v) || Math.ceil(v);

export default function FenvSchema({ spec, context = 'lecon' }) {
  const s = useSchema(def, spec, { context });
  const { st } = s;
  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const H = W < 520 ? 210 : 250;
  const L = 44;
  const R = 16;
  const T = 36; // titre de l'axe de la coupure
  const B = 40; // graduations du temps + titre de l'axe

  const noteDur = 1 / (SOURCES[st.o.source].midi.length * CPS);
  const view = s.bypass ? { ...st, p: { ...st.p, env: 0 } } : st;
  const vals = def.values(view);
  const [a, d, , r] = vals;
  const { min, max } = def.range(view);
  const sus = min + vals[2] * (max - min);

  const dragging = useRef(null);
  const frozen = useRef(null);
  const want = niceSpan(Math.max(a + d, noteDur) + r + 0.05);
  const span = dragging.current && frozen.current ? frozen.current : want;
  if (!dragging.current) frozen.current = want;

  const x = (t) => L + (t / span) * (W - L - R);
  const tOf = (px) => ((px - L) / (W - L - R)) * span;
  const y = (f) => T + (1 - Math.log(Math.max(f, F_LO) / F_LO) / Math.log(F_HI / F_LO)) * (H - T - B);
  const fOf = (py) => F_LO * Math.pow(F_HI / F_LO, 1 - (py - T) / (H - T - B));

  const plan = useMemo(() => envPlan(vals, 0, noteDur, { min, max, curve: 'exponential' }), [vals.join(','), noteDur, min, max]);
  const toPath = (pts) => pts.map(([t, f], i) => (i ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(f).toFixed(1)).join(' ');
  const shape = plan.map((e) => [e.t, e.v]);
  // La note s'arrête avant la fin du decay : ce qu'elle n'atteint pas, en pointillé.
  const truncated = a + d > noteDur;
  const ideal = truncated ? envPlan(vals, 0, a + d + 0.0001, { min, max, curve: 'exponential' }).slice(0, 3).map((e) => [e.t, e.v]) : null;
  const truncWarn = a > noteDur ? `L’attack du filtre (lpa, ${frNum(a)} s) dure plus longtemps que la note (${frNum(noteDur, 2)} s) : la coupure n’atteint jamais son sommet.` : truncated ? `La note (${frNum(noteDur, 2)} s) s’arrête pendant le decay du filtre (lpd) : le niveau S n’est jamais atteint.` : null;

  // Trace dorée : la coupure réelle de la dernière note, depuis son début.
  const [live, setLive] = useState(null);
  useEffect(() => {
    if (!s.playing) {
      setLive(null);
      return undefined;
    }
    let raf = 0;
    const loop = () => {
      const snd = s.sound.current;
      const n = snd && snd.lastNote();
      if (n) {
        const now = audioContext().currentTime;
        const until = Math.min(now, n.end + 0.02);
        const pts = [];
        for (let i = 0; i <= 80; i++) {
          const t = n.begin + ((until - n.begin) * i) / 80;
          pts.push([t - n.begin, n.valueAt(t)]);
        }
        setLive({ pts, now: now - n.begin, f: n.valueAt(Math.min(now, n.end)), phase: phaseAt(n.vals, n.begin, n.releaseAt, now) });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [s.playing]);

  // La courbe du filtre : au repos, fermée (coupure de départ) et ouverte (sommet) ;
  // pendant la lecture, celle de l'instant.
  const RW = W;
  const RH = W < 520 ? 110 : 130;
  const N = 160;
  const freqs = useMemo(() => {
    const f = new Float32Array(N);
    for (let i = 0; i < N; i++) f[i] = F_LO * Math.pow(F_HI / F_LO, i / (N - 1));
    return f;
  }, []);
  const rx = (f) => L + (Math.log(f / F_LO) / Math.log(F_HI / F_LO)) * (RW - L - R);
  const ry = (db) => 8 + ((24 - Math.max(-48, Math.min(24, db))) / 72) * (RH - 26);
  const respPath = (cut) => {
    const resp = filterResponse(audioContext(), { p: { f: Math.min(Math.max(cut, 10), 22000), q: st.p.q }, o: { kind: 'passe-bas' } }, freqs);
    return resp.map((db, i) => (i ? 'L' : 'M') + rx(freqs[i]).toFixed(1) + ' ' + ry(db).toFixed(1)).join(' ');
  };
  const closed = useMemo(() => respPath(Math.min(min, max)), [min, max, st.p.q, W]);
  const opened = useMemo(() => respPath(Math.max(min, max)), [min, max, st.p.q, W]);
  const nowPath = live ? respPath(live.f) : null;

  const toggle = () => {
    if (s.playing) return s.unclaim();
    const snd = s.ensureSound((ac, dest, get) => createFenvSound(ac, dest, get, def));
    s.claim();
    snd.start();
  };
  const heldPlay = useRef(false);
  const bypassDown = () => {
    s.setBypass(true);
    if (!s.playingRef.current) {
      heldPlay.current = true;
      toggle();
      s.sound.current.bypass(true);
    }
  };
  const bypassUp = () => {
    s.setBypass(false);
    if (heldPlay.current) {
      heldPlay.current = false;
      s.unclaim();
    }
  };

  const canEdit = (k) => !s.bypass && s.can(k);
  const handles = [
    { id: 'A', cx: x(a), cy: y(max), label: `Sommet : coupure ${frHz(max)} à ${frNum(a)} s` },
    { id: 'D', cx: x(a + d), cy: y(sus), label: `Fin du decay : ${frNum(d)} s ; niveau sustain ${frNum(vals[2], 2)}` },
    { id: 'R', cx: x(noteDur + r), cy: y(min), label: `Fin du release : ${frNum(r)} s après la fin de la note` },
  ];
  const closeAD = Math.hypot(handles[0].cx - handles[1].cx, handles[0].cy - handles[1].cy) < 26;
  const dragTo = (hid, e) => {
    const rect = boxRef.current.querySelector('svg').getBoundingClientRect();
    const t = tOf(e.clientX - rect.left);
    if (hid === 'A' && canEdit('lpa')) s.setParam('lpa', t);
    if (hid === 'D') {
      if (canEdit('lpd')) s.setParam('lpd', t - a);
      if (canEdit('lps') && max !== min) s.setParam('lps', (fOf(e.clientY - rect.top) - min) / (max - min));
    }
    if (hid === 'R' && canEdit('lpr')) s.setParam('lpr', t - noteDur);
  };
  const nearest = (e) => {
    const rect = boxRef.current.querySelector('svg').getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    let best = null;
    for (const h of handles) {
      const dd = Math.hypot(h.cx - px, h.cy - py);
      if (!best || dd < best.dd) best = { id: h.id, dd };
    }
    return best && best.id;
  };
  const keyMove = (hid, e) => {
    const dt = e.shiftKey ? 0.1 : 0.01;
    const k = e.key;
    let used = true;
    if (hid === 'A' && (k === 'ArrowRight' || k === 'ArrowLeft')) s.setParam('lpa', a + (k === 'ArrowRight' ? dt : -dt));
    else if (hid === 'D' && (k === 'ArrowRight' || k === 'ArrowLeft')) s.setParam('lpd', d + (k === 'ArrowRight' ? dt : -dt));
    else if (hid === 'D' && (k === 'ArrowUp' || k === 'ArrowDown')) s.setParam('lps', vals[2] + (k === 'ArrowUp' ? 0.05 : -0.05));
    else if (hid === 'R' && (k === 'ArrowRight' || k === 'ArrowLeft')) s.setParam('lpr', r + (k === 'ArrowRight' ? dt : -dt));
    else used = false;
    if (used) e.preventDefault();
  };

  const ticks = [];
  const tStep = span <= 1 ? 0.25 : span <= 2 ? 0.5 : 1;
  for (let t = 0; t <= span + 1e-9; t += tStep) ticks.push(Math.round(t * 100) / 100);

  return (
    <div className={'schema schema-fenv' + (s.bypass ? ' is-bypass' : '')} data-schema="enveloppe-filtre" data-schema-id={s.id}>
      <div className="sch-figure" ref={boxRef}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="sch-svg"
          role="img"
          aria-label={`La coupure va de ${frHz(min)} à ${frHz(max)} puis revient, à chaque note.`}
          onPointerDown={(e) => {
            const hid = e.target.dataset && e.target.dataset.h ? e.target.dataset.h : nearest(e);
            if (!hid || s.bypass) return;
            dragging.current = hid;
            e.currentTarget.setPointerCapture(e.pointerId);
            dragTo(hid, e);
          }}
          onPointerMove={(e) => dragging.current && dragTo(dragging.current, e)}
          onPointerUp={() => (dragging.current = null)}
          onPointerCancel={() => (dragging.current = null)}
        >
          {ticks.map((t) => (
            <g key={t} className="sch-grid">
              <line x1={x(t)} x2={x(t)} y1={T} y2={H - B} />
              <text x={x(t)} y={H - B + 15} textAnchor="middle">{frNum(t, 2)}</text>
            </g>
          ))}
          <text className="sch-axis-title" x={4} y={13}>coupure du filtre (Hz)</text>
          <text className="sch-axis-title" x={W - R} y={H - 4} textAnchor="end">temps depuis le début de la note (s)</text>
          {[100, 1000, 10000].map((f) => (
            <g key={f} className="sch-grid sch-grid-h">
              <line x1={L} x2={W - R} y1={y(f)} y2={y(f)} />
              <text x={L - 5} y={y(f) + 4} textAnchor="end">{f >= 1000 ? f / 1000 + 'k' : f}</text>
            </g>
          ))}
          <rect className="sch-notezone" x={x(0)} y={T} width={Math.max(0, x(noteDur) - x(0))} height={H - T - B} />
          <text className="sch-notezone-t" x={Math.max(x(noteDur) - 6, x(0) + 110)} y={H - B - 8} textAnchor="end">la note dure {frNum(noteDur, 2)} s</text>
          <line className="sch-curve-ideal sch-curve" x1={L} x2={W - R} y1={y(st.p.f)} y2={y(st.p.f)} />
          <text className="sch-axis-t" x={W - R - 4} y={y(st.p.f) - 6} textAnchor="end">lpf {frHz(st.p.f)}</text>
          {ideal && !s.bypass ? <path className="sch-curve sch-curve-ideal" d={toPath(ideal)} /> : null}
          {ideal && !s.bypass ? <text className="sch-ideal-t" x={x(a + d) + 14 < W - R - 70 ? x(a + d) + 14 : x(a + d) - 14} y={y(sus) + 18} textAnchor={x(a + d) + 14 < W - R - 70 ? 'start' : 'end'}>pas atteint</text> : null}
          <path className={'sch-curve' + (s.bypass ? ' sch-curve-default' : '')} d={toPath(shape)} />
          {live && live.pts.length > 1 ? (
            <g className="sch-trace">
              <path d={toPath(live.pts)} />
              <circle cx={x(Math.min(live.now, span))} cy={y(live.f)} r={5} />
            </g>
          ) : null}
          {!s.bypass
            ? handles.map((h) => (
                <g key={h.id} className="sch-handle" tabIndex={0} role="group" aria-label={h.label + '. Flèches pour régler.'} onKeyDown={(e) => keyMove(h.id, e)}>
                  <circle className="sch-handle-hit" data-h={h.id} cx={h.cx} cy={h.cy} r={22} />
                  <circle className="sch-handle-dot" data-h={h.id} cx={h.cx} cy={h.cy} r={8} />
                  <text className="sch-handle-t" x={h.id === 'A' ? h.cx + 12 : h.id === 'R' ? h.cx + 14 : closeAD ? h.cx + 12 : h.cx} y={h.id === 'A' ? h.cy - 6 : h.id === 'D' && closeAD ? h.cy + 16 : h.cy - 13} textAnchor={h.id === 'A' || (h.id === 'D' && closeAD) ? 'start' : 'middle'}>{h.id}</text>
                </g>
              ))
            : null}
        </svg>
        <svg width={RW} height={RH} viewBox={`0 0 ${RW} ${RH}`} className="sch-svg sch-fenv-resp" role="img" aria-label="La courbe du filtre, fermée puis ouverte.">
          <text className="sch-axis-t" x={L} y={14}>volume par fréquence · {live ? 'filtre en ce moment' : 'fermé (pointillé), ouvert'}</text>
          <line className="sch-zero" x1={L} x2={RW - R} y1={ry(0)} y2={ry(0)} />
          {[100, 1000, 10000].map((f) => <text key={f} className="sch-grid-t" x={rx(f)} y={RH - 4} textAnchor="middle">{f >= 1000 ? f / 1000 + ' kHz' : f + ' Hz'}</text>)}
          {live ? <path className="sch-curve sch-curve-live" d={nowPath} /> : (
            <>
              <path className="sch-curve sch-curve-ideal" d={closed} />
              <path className="sch-curve" d={opened} />
            </>
          )}
        </svg>
      </div>

      <Warn text={truncWarn || def.warn(st)} />
      <ul className="sch-phases" aria-label="Les quatre temps de l’enveloppe du filtre">
        {PHASES.map(([k, name]) => <li key={k} className={live && live.phase === k ? 'is-on' : ''}><strong>{k}</strong> {name}</li>)}
      </ul>

      <div className="sch-controls">
        <PlayButton playing={s.playing} onToggle={toggle} />
        <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre sans l’enveloppe du filtre">
          <span>Maintiens : sans enveloppe</span>
        </HoldButton>
        <Choice label={def.options.source.label} values={def.options.source.values} labels={def.options.source.labels} value={st.o.source} onChange={(v) => s.setOption('source', v)} />
      </div>

      <div className="sch-sliders">
        <Slider def={def} k="env" value={st.p.env} codeName="lpenv" onChange={s.setParam} disabled={!canEdit('env')} />
        <Slider def={def} k="f" value={st.p.f} codeName="lpf" onChange={s.setParam} disabled={!canEdit('f')} />
        <Slider def={def} k="q" value={st.p.q} codeName="lpq" onChange={s.setParam} disabled={!canEdit('q')} />
      </div>
      <Fold title="Les quatre temps de l’enveloppe" hint="lpa, lpd, lps, lpr">
        <div className="sch-sliders">
          {['lpa', 'lpd', 'lps', 'lpr'].map((k) => <Slider key={k} def={def} k={k} value={st.p[k]} codeName={k} onChange={s.setParam} disabled={!canEdit(k)} />)}
        </div>
      </Fold>

      <CodeLine
        parts={def.code(st, { bypass: s.bypass })}
        glow={s.glow}
        note={s.bypass ? 'Sans l’enveloppe, la coupure reste à lpf.' : !st.written ? 'Sans lpa, lpd, lps ni lpr dans le code, Strudel prend .005, .14, 0, .1.' : null}
      />
      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      <Deep facts={def.facts} />
    </div>
  );
}
