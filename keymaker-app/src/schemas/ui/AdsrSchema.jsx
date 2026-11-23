// Schéma « enveloppe » : la forme du volume d'une note, et le volume réel qui la suit.
//
// La forme vient de adsrPlan (../core/adsr.js) : la même fonction programme le volume.
// L'échelle du temps s'adapte aux réglages, mais reste figée pendant qu'on fait glisser
// une poignée (sinon elle fuirait sous le doigt).
import { useEffect, useMemo, useRef, useState } from 'react';
import def, { PRESETS } from '../types/adsr.js';
import { codeText } from '../catalog.js';
import { adsrPlan, phaseAt, SYNTH_DEFAULTS } from '../core/adsr.js';
import { frNum } from '../core/format.js';
import { createAdsrSound, CPS } from './sounds.js';
import { useSchema } from './useSchema.js';
import { useWidth, Slider, CodeLine, HoldButton, PlayButton, Choice, Missions, Deep, Warn } from './parts.jsx';
import { stateFromSpec } from '../catalog.js';

const MOTIF_DUR = 1 / (4 * CPS); // 4 notes par cycle → 0,5 s
const NOMINAL_HOLD = 1;
const PHASES = [['A', 'attaque'], ['D', 'retombée'], ['S', 'maintien'], ['R', 'extinction']];

function niceSpan(v) {
  const steps = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8];
  return steps.find((x) => x >= v) || Math.ceil(v);
}
// Polyligne exacte d'un plan (les morceaux sont des droites).
function planPoints(plan) {
  return plan.map((e) => [e.t, e.v]);
}

export default function AdsrSchema({ spec, ear = null, context = 'lecon' }) {
  const s = useSchema(def, spec, { ear, context });
  const { st } = s;
  const mode = st.o.mode;
  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const H = W < 520 ? 210 : 250;
  const L = 42;
  const R = 16;
  const T = 28;
  const B = 26;

  const [holding, setHolding] = useState(false);
  const [lastHeld, setLastHeld] = useState(null); // durée tenue de la dernière note
  const [live, setLive] = useState(null); // { pts, now, phase, dur }
  const pressAt = useRef(0);

  const bypassVals = s.bypass ? [...SYNTH_DEFAULTS] : null;
  const vals = bypassVals || def.values(st);
  const [a, d, sus, r] = vals;
  const noteDur = mode === 'motif' ? MOTIF_DUR : holding ? Math.max(0.05, live ? live.held : 0) : lastHeld != null ? lastHeld : NOMINAL_HOLD;

  // Échelle du temps : suit les réglages, figée pendant un glissement.
  const dragging = useRef(null);
  const frozen = useRef(null);
  const want = niceSpan(Math.max(a + d, noteDur) + r + 0.08);
  const span = dragging.current && frozen.current ? frozen.current : want;
  if (!dragging.current) frozen.current = want;

  const x = (t) => L + (t / span) * (W - L - R);
  const tOf = (px) => ((px - L) / (W - L - R)) * span;
  const y = (v) => T + (1 - v) * (H - T - B);
  const vOf = (py) => 1 - (py - T) / (H - T - B);

  const plan = useMemo(() => adsrPlan(vals, 0, noteDur), [vals.join(','), noteDur]);
  const shape = planPoints(plan);
  const truncated = a + d > noteDur;
  const ideal = useMemo(() => (truncated ? planPoints(adsrPlan(vals, 0, a + d + 0.0001)) : null), [truncated, vals.join(',')]);
  const toPath = (pts) => pts.map(([t, v], i) => (i ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');

  // Trace dorée : le volume de la dernière note, depuis son début.
  const animating = s.playing || holding;
  useEffect(() => {
    if (!animating) return undefined;
    let raf = 0;
    const loop = () => {
      const snd = s.sound.current;
      const n = snd && (mode === 'motif' ? snd.lastNote() : snd.lastNote ? snd.lastNote() : null);
      const ctx = snd && n ? n : null;
      if (ctx) {
        const now = window.getAudioContext ? window.getAudioContext().currentTime : 0;
        const rel = ctx.releaseAt;
        const until = Math.min(now, (rel != null ? rel + ctx.vals[3] : now) + 0.02);
        const pts = [];
        const steps = 90;
        for (let i = 0; i <= steps; i++) {
          const t = ctx.begin + ((until - ctx.begin) * i) / steps;
          if (t < ctx.begin) continue;
          pts.push([t - ctx.begin, ctx.valueAt(t)]);
        }
        const held = rel != null ? rel - ctx.begin : now - ctx.begin;
        setLive({ pts, now: now - ctx.begin, v: ctx.valueAt(now), phase: phaseAt(ctx.vals, ctx.begin, rel, now), held });
        if (holding) s.check({ holding: true, heldFor: now - pressAt.current, event: 'tick' });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [animating, mode, holding]);

  // Tenir une note.
  const press = (withBypass = false) => {
    const snd = s.ensureSound(createAdsrSound);
    if (!s.playingRef.current) s.claim();
    snd.bypass(withBypass);
    if (withBypass) s.setBypass(true);
    const v = snd.press();
    pressAt.current = v.begin;
    setHolding(true);
    setLastHeld(null);
    s.extraRef.current = { holding: true, heldFor: 0 };
    s.check({ event: 'press', holding: true, heldFor: 0 });
  };
  const lift = () => {
    const snd = s.sound.current;
    if (!snd) return;
    const now = window.getAudioContext ? window.getAudioContext().currentTime : 0;
    snd.lift();
    const heldFor = now - pressAt.current;
    setHolding(false);
    setLastHeld(Math.max(0.01, heldFor));
    s.extraRef.current = { holding: false, heldFor };
    s.check({ event: 'release', holding: false, heldFor });
    if (s.bypass) {
      s.setBypass(false);
      snd.bypass(false);
    }
  };
  // Mode motif.
  const toggleMotif = () => {
    if (s.playing) return s.unclaim();
    const snd = s.ensureSound(createAdsrSound);
    s.claim();
    snd.startMotif();
  };
  // Changer de mode coupe le son en cours.
  useEffect(() => {
    if (s.playingRef.current) s.unclaim();
    setLive(null);
    setLastHeld(null);
  }, [mode]);

  const heldPlay = useRef(false);
  const bypassDown = () => {
    if (mode === 'tenir') return press(true);
    s.setBypass(true);
    if (!s.playingRef.current) {
      toggleMotif();
      heldPlay.current = true;
    }
  };
  const bypassUp = () => {
    if (mode === 'tenir') return lift();
    s.setBypass(false);
    if (heldPlay.current) {
      heldPlay.current = false;
      s.unclaim();
    }
  };

  // Poignées : sommet de l'attaque, fin de la retombée (et maintien), fin de l'extinction.
  const canEdit = (k) => !s.bypass && s.can(k);
  const handles = [
    { id: 'A', cx: x(a), cy: y(1), keys: ['attack'], label: `Sommet de l’attaque : ${frNum(a)} s` },
    { id: 'D', cx: x(a + d), cy: y(sus), keys: ['decay', 'sustain'], label: `Fin de la retombée : ${frNum(d)} s, maintien ${Math.round(sus * 100)} %` },
    { id: 'R', cx: x(noteDur + r), cy: y(0), keys: ['release'], label: `Fin de l’extinction : ${frNum(r)} s après la fin de la note` },
  ].filter((h) => h.keys.some(canEdit));

  const dragTo = (hid, e) => {
    const rect = boxRef.current.querySelector('svg').getBoundingClientRect();
    const t = tOf(e.clientX - rect.left);
    const v = vOf(e.clientY - rect.top);
    if (hid === 'A' && canEdit('attack')) s.setParam('attack', t);
    if (hid === 'D') {
      if (canEdit('decay')) s.setParam('decay', t - a);
      if (canEdit('sustain')) s.setParam('sustain', v);
    }
    if (hid === 'R' && canEdit('release')) s.setParam('release', t - noteDur);
  };
  // Toucher le dessin hors d'une poignée : la plus proche vient.
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
    let used = true;
    const k = e.key;
    if (hid === 'A' && (k === 'ArrowRight' || k === 'ArrowLeft')) s.setParam('attack', a + (k === 'ArrowRight' ? dt : -dt));
    else if (hid === 'D' && (k === 'ArrowRight' || k === 'ArrowLeft') && canEdit('decay')) s.setParam('decay', d + (k === 'ArrowRight' ? dt : -dt));
    else if (hid === 'D' && (k === 'ArrowUp' || k === 'ArrowDown') && canEdit('sustain')) s.setParam('sustain', sus + (k === 'ArrowUp' ? 0.05 : -0.05));
    else if (hid === 'R' && (k === 'ArrowRight' || k === 'ArrowLeft')) s.setParam('release', r + (k === 'ArrowRight' ? dt : -dt));
    else used = false;
    if (used) e.preventDefault();
  };

  const ticks = [];
  const tStep = span <= 1 ? 0.25 : span <= 2 ? 0.5 : 1;
  for (let t = 0; t <= span + 1e-9; t += tStep) ticks.push(Math.round(t * 100) / 100);

  const phase = live && animating ? live.phase : null;
  const preset = !st.written ? 'sans-reglage' : Object.keys(PRESETS).find((k) => PRESETS[k].vals && Object.keys(PRESETS[k].vals).every((p) => PRESETS[k].vals[p] === st.p[p]));
  const applyPreset = (k) => {
    const next = stateFromSpec({ type: 'adsr', reglages: PRESETS[k].vals || {}, mode: st.o.mode });
    s.replace(next, PRESETS[k].vals ? 'attack' : null);
  };
  const warn = def.warn(st, { noteDur: mode === 'motif' ? MOTIF_DUR : lastHeld });

  return (
    <div className={'schema schema-adsr' + (s.bypass ? ' is-bypass' : '')} data-schema="adsr" data-schema-id={s.id}>
      <div className="sch-figure" ref={boxRef}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="sch-svg"
          role="img"
          aria-label={`Enveloppe : attaque ${frNum(a)} s, retombée ${frNum(d)} s, maintien ${Math.round(sus * 100)} %, extinction ${frNum(r)} s.`}
          onPointerDown={(e) => {
            const hid = e.target.dataset && e.target.dataset.h ? e.target.dataset.h : nearest(e);
            if (!hid) return;
            dragging.current = hid;
            e.currentTarget.setPointerCapture(e.pointerId);
            dragTo(hid, e);
          }}
          onPointerMove={(e) => dragging.current && dragTo(dragging.current, e)}
          onPointerUp={() => {
            dragging.current = null;
          }}
          onPointerCancel={() => {
            dragging.current = null;
          }}
        >
          {ticks.map((t) => (
            <g key={t} className="sch-grid">
              <line x1={x(t)} x2={x(t)} y1={T} y2={H - B} />
              <text x={x(t)} y={H - 8} textAnchor="middle">{frNum(t, 2)} s</text>
            </g>
          ))}
          <line className="sch-zero" x1={L} x2={W - R} y1={y(0)} y2={y(0)} />
          <text className="sch-axis-t" x={L - 6} y={y(1) + 4} textAnchor="end">max</text>
          <text className="sch-axis-t" x={L - 6} y={y(0) + 4} textAnchor="end">0</text>

          {/* La note joue pendant la zone grise ; l'extinction commence à sa fin. */}
          <rect className="sch-notezone" x={x(0)} y={T} width={Math.max(0, x(noteDur) - x(0))} height={H - T - B} />
          <text className="sch-notezone-t" x={Math.max(x(noteDur) - 6, x(0) + 120)} y={H - B - 8} textAnchor="end">
            {mode === 'motif' ? 'la note dure 0,5 s' : holding ? 'tu tiens la note' : lastHeld != null ? 'tu l’as tenue ' + frNum(lastHeld, 2) + ' s' : 'si tu tiens 1 s'}
          </text>

          {ideal ? <path className="sch-curve sch-curve-ideal" d={toPath(ideal)} /> : null}
          <path className="sch-fill" d={toPath(shape) + ` L ${x(shape[shape.length - 1][0])} ${y(0)} Z`} />
          <path className={'sch-curve' + (s.bypass ? ' sch-curve-default' : '')} d={toPath(shape)} />
          {ear && ear.revealed ? <path className="sch-curve sch-curve-target" d={toPath(planPoints(adsrPlan(def.values(ear.target), 0, noteDur)))} /> : null}

          {live && live.pts.length > 1 ? (
            <g className="sch-trace">
              <path d={toPath(live.pts)} />
              {animating ? <circle cx={x(Math.min(live.now, span))} cy={y(live.v)} r={5} /> : null}
            </g>
          ) : null}

          {handles.map((h) => (
            <g key={h.id} className="sch-handle" tabIndex={0} role="group" aria-label={h.label + '. Flèches pour régler.'} onKeyDown={(e) => keyMove(h.id, e)}>
              <circle className="sch-handle-hit" data-h={h.id} cx={h.cx} cy={h.cy} r={22} />
              <circle className="sch-handle-dot" data-h={h.id} cx={h.cx} cy={h.cy} r={8} />
              <text className="sch-handle-t" x={h.id === 'R' ? h.cx + 14 : h.cx} y={h.id === 'R' ? h.cy - 10 : h.cy - 14} textAnchor="middle">{h.id}</text>
            </g>
          ))}
        </svg>
      </div>

      <ul className="sch-phases" aria-label="Les quatre temps de l’enveloppe">
        {PHASES.map(([k, name]) => (
          <li key={k} className={phase === k ? 'is-on' : ''}><strong>{k}</strong> {name}</li>
        ))}
      </ul>

      <div className="sch-controls">
        {!ear ? <Choice label={def.options.mode.label} values={def.options.mode.values} labels={def.options.mode.labels} value={mode} onChange={(v) => s.setOption('mode', v)} /> : null}
        {ear ? null : mode === 'tenir' ? (
          <HoldButton big onDown={() => press(false)} onUp={lift} label="Tiens pour jouer une note" className={holding && !s.bypass ? 'is-on' : ''}>
            <span>{holding && !s.bypass ? 'Tu tiens…' : 'Tiens pour jouer'}</span>
          </HoldButton>
        ) : (
          <PlayButton playing={s.playing} onToggle={toggleMotif} />
        )}
        {ear ? null : (
          <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre sans réglage d’enveloppe">
            <span>{mode === 'tenir' ? 'Tiens : sans réglage' : 'Maintiens : sans réglage'}</span>
          </HoldButton>
        )}
      </div>
      {ear ? ear.controls(s, toggleMotif) : null}

      {!ear ? (
        <div className="sch-presets" role="group" aria-label="Exemples">
          {Object.entries(PRESETS).map(([k, p]) => (
            <button key={k} type="button" className={'chip' + (preset === k ? ' chip-strong' : '')} onClick={() => applyPreset(k)} aria-pressed={preset === k}>
              <span className="chip-t">{p.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="sch-sliders">
        {['attack', 'decay', 'sustain', 'release'].map((k) => (
          <Slider key={k} def={def} k={k} value={st.p[k]} codeName={k} onChange={s.setParam} disabled={!canEdit(k)} />
        ))}
      </div>
      <Warn text={warn} />

      {!ear || ear.revealed ? (
        <CodeLine
          parts={def.code(st, { bypass: s.bypass })}
          glow={s.glow}
          note={
            s.bypass || !st.written
              ? 'Sans réglage d’enveloppe dans le code, Strudel prend ses valeurs par défaut : .001, .05, .6, .01.'
              : mode === 'tenir'
                ? 'En mode Tenir, la note dure tant que tu appuies. Dans le code, c’est la durée de la note qui joue ce rôle : ici `note("c3")` dure un cycle entier, soit 2 s.'
                : null
          }
        />
      ) : null}
      {ear && ear.revealed ? <CodeLine parts={[{ t: codeText(def, ear.target) }]} glow={{ k: null, n: 0 }} note="Le son mystère." /> : null}

      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      {ear ? null : <Deep facts={def.facts} />}
    </div>
  );
}
