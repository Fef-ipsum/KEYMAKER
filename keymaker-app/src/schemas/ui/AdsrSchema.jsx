// Schéma « enveloppe » : la forme du volume d'une note, et le volume réel qui la suit.
//
// Comme dans Strudel, le CODE décide de la durée des notes (note("c3*4") : 4 notes par
// cycle de 2 s, 0,5 s chacune) ; l'enveloppe décide de la forme du volume pendant la note
// (A, D, puis le NIVEAU S jusqu'à la fin de la note) et après (R).
// La forme vient de adsrPlan (../core/adsr.js) : la même fonction programme le volume.
// L'échelle du temps s'adapte aux réglages, mais reste figée pendant qu'on fait glisser
// une poignée (sinon elle fuirait sous le doigt).
import { useEffect, useMemo, useRef, useState } from 'react';
import def, { PRESETS, noteCode } from '../types/adsr.js';
import { codeText } from '../catalog.js';
import { adsrPlan, phaseAt, SYNTH_DEFAULTS } from '../core/adsr.js';
import { frNum } from '../core/format.js';
import { createAdsrSound } from './sounds.js';
import { useSchema } from './useSchema.js';
import { useWidth, Slider, CodeLine, HoldButton, PlayButton, Choice, Missions, Deep, Warn } from './parts.jsx';
import { stateFromSpec } from '../catalog.js';

const PHASES = [['A', 'attack'], ['D', 'decay'], ['S', 'sustain'], ['R', 'release']];

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
  const perCycle = st.o.notes;
  const noteDur = def.noteDur(st);
  // Missions : un réglage ou le nombre de notes a-t-il bougé depuis le départ ?
  const start = useRef(JSON.stringify([st.p, st.o.notes]));
  s.extraRef.current = { ...s.extraRef.current, changed: JSON.stringify([st.p, st.o.notes]) !== start.current };

  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const narrow = W < 520;
  const H = narrow ? 240 : 270;
  const L = 40;
  const R = 16;
  const T = 44; // titre de l'axe du volume + durée de la note
  const B = 40; // graduations du temps + titre de l'axe

  const [live, setLive] = useState(null); // { pts, now, v, phase }

  const bypassVals = s.bypass ? [...SYNTH_DEFAULTS] : null;
  const vals = bypassVals || def.values(st);
  const [a, d, sus, r] = vals;

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
  // Ce que la note n'atteint pas : la montée et la descente complètes (sans le release).
  const ideal = useMemo(() => (truncated ? planPoints(adsrPlan(vals, 0, a + d + 0.0001)).slice(0, 3) : null), [truncated, vals.join(',')]);
  const toPath = (pts) => pts.map(([t, v], i) => (i ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');

  // Trace dorée : le volume de la dernière note jouée, depuis son début.
  useEffect(() => {
    if (!s.playing) return undefined;
    let raf = 0;
    const loop = () => {
      const snd = s.sound.current;
      const n = snd && snd.lastNote ? snd.lastNote() : null;
      if (n) {
        const now = window.getAudioContext ? window.getAudioContext().currentTime : 0;
        const until = Math.min(now, n.releaseAt + n.vals[3] + 0.02);
        const pts = [];
        const steps = 90;
        for (let i = 0; i <= steps; i++) {
          const t = n.begin + ((until - n.begin) * i) / steps;
          if (t >= n.begin) pts.push([t - n.begin, n.valueAt(t)]);
        }
        setLive({ pts, now: now - n.begin, v: n.valueAt(now), phase: phaseAt(n.vals, n.begin, n.releaseAt, now) });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [s.playing]);
  useEffect(() => {
    if (!s.playing) setLive(null);
  }, [s.playing]);

  const toggle = () => {
    if (s.playing) return s.unclaim();
    const snd = s.ensureSound(createAdsrSound);
    s.claim();
    snd.startMotif();
  };
  // Nouveau nombre de notes par cycle pendant la lecture : la grille suit tout de suite.
  useEffect(() => {
    const snd = s.sound.current;
    if (snd && snd.resync && s.playingRef.current) snd.resync();
    setLive(null);
  }, [perCycle]);

  const heldPlay = useRef(false);
  const bypassDown = () => {
    s.setBypass(true);
    if (!s.playingRef.current) {
      toggle();
      heldPlay.current = true;
    }
  };
  const bypassUp = () => {
    s.setBypass(false);
    if (heldPlay.current) {
      heldPlay.current = false;
      s.unclaim();
    }
  };

  // Poignées : sommet de l'attack, fin du decay (et niveau S), fin du release.
  const canEdit = (k) => !s.bypass && s.can(k);
  const handles = [
    { id: 'A', text: 'A', cx: x(a), cy: y(1), keys: ['attack'], label: `Sommet de l’attack : ${frNum(a)} s` },
    { id: 'D', text: 'D', cx: x(a + d), cy: y(sus), keys: ['decay', 'sustain'], label: `Fin du decay : ${frNum(d)} s ; niveau sustain ${frNum(sus, 2)}` },
    { id: 'R', text: 'R', cx: x(noteDur + r), cy: y(0), keys: ['release'], label: `Fin du release : ${frNum(r)} s après la fin de la note` },
  ].filter((h) => h.keys.some(canEdit));

  // Lettres des poignées : A en haut à droite (le titre de l'axe est en haut à gauche),
  // D au-dessus (en bas à droite si A est tout près), R au-dessus à droite.
  const close = Math.hypot(x(a) - x(a + d), y(1) - y(sus)) < 26;
  const labelPos = (h) => {
    if (h.id === 'A') return { x: h.cx + 12, y: h.cy - 6, anchor: 'start' };
    if (h.id === 'D') return close ? { x: h.cx + 12, y: h.cy + 16, anchor: 'start' } : { x: h.cx, y: h.cy - 14, anchor: 'middle' };
    return { x: h.cx + 14, y: h.cy - 10, anchor: 'middle' };
  };

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

  // Les temps, au tempo du schéma : un cycle de 2 s = une mesure de 4 temps (120 BPM).
  const BEAT = 0.5;
  const beatLines = [];
  for (let t = BEAT; t <= span + 1e-9; t += BEAT) beatLines.push(Math.round(t * 100) / 100);
  const inBeats = (sec) => frNum(sec / BEAT, 2);

  const ticks = [];
  const tStep = span <= 1 ? 0.25 : span <= 2 ? 0.5 : 1;
  for (let t = 0; t <= span + 1e-9; t += tStep) ticks.push(Math.round(t * 100) / 100);

  const phase = live && s.playing ? live.phase : null;
  const preset = !st.written ? 'sans-reglage' : Object.keys(PRESETS).find((k) => PRESETS[k].vals && Object.keys(PRESETS[k].vals).every((p) => PRESETS[k].vals[p] === st.p[p]));
  const applyPreset = (k) => {
    const next = stateFromSpec({ type: 'adsr', reglages: PRESETS[k].vals || {}, notes: st.o.notes });
    s.replace(next, PRESETS[k].vals ? 'attack' : null);
  };
  const warn = def.warn(st);

  // Le niveau S : sur le palier s'il existe, sinon signalé comme non atteint.
  const plateau = !truncated && noteDur - (a + d) > 0.001;
  const sMid = plateau ? (a + d + noteDur) / 2 : null;
  const durText = `la note dure ${frNum(noteDur, 2)} s`;
  const durWide = x(noteDur) - x(0) > 150;

  return (
    <div className={'schema schema-adsr' + (s.bypass ? ' is-bypass' : '')} data-schema="adsr" data-schema-id={s.id}>
      <div className="sch-figure" ref={boxRef}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="sch-svg"
          role="img"
          aria-label={`Enveloppe : attack ${frNum(a)} s, decay ${frNum(d)} s, sustain ${frNum(sus, 2)} (niveau), release ${frNum(r)} s ; ${durText}.`}
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
          {/* Axe du volume : 0 = silence, 1 = sommet de l'attack. */}
          <text className="sch-axis-title" x={4} y={13}>volume (1 = sommet)</text>
          {[0, 0.5, 1].map((v) => (
            <g key={v} className="sch-grid">
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} />
              <text x={L - 6} y={y(v) + 4} textAnchor="end">{frNum(v, 1)}</text>
            </g>
          ))}
          {/* Axe du temps. */}
          {ticks.map((t) => (
            <g key={t} className="sch-grid">
              <line x1={x(t)} x2={x(t)} y1={T} y2={H - B} />
              <text x={x(t)} y={H - B + 15} textAnchor="middle">{frNum(t, 2)}</text>
            </g>
          ))}
          <text className="sch-axis-title" x={W - R} y={H - 4} textAnchor="end">temps depuis le début de la note (s)</text>
          {/* Les temps (pulsation à 120 BPM) : pour lire les durées en musique. */}
          {beatLines.map((t, i) => (
            <g key={'b' + t} className="sch-beat">
              <line x1={x(t)} x2={x(t)} y1={T} y2={H - B} />
              {x(t) - x(0) > 26 ? <text x={x(t) - 3} y={T + 11} textAnchor="end">{i + 1} t</text> : null}
            </g>
          ))}
          <line className="sch-zero" x1={L} x2={W - R} y1={y(0)} y2={y(0)} />

          {/* La note joue pendant la zone grise (durée donnée par le code) ; le release commence à sa fin. */}
          <rect className="sch-notezone" x={x(0)} y={T} width={Math.max(0, x(noteDur) - x(0))} height={H - T - B} />
          <g className="sch-bracket">
            <line x1={x(0)} x2={x(noteDur)} y1={30} y2={30} />
            <line x1={x(0)} x2={x(0)} y1={25} y2={35} />
            <line x1={x(noteDur)} x2={x(noteDur)} y1={25} y2={H - B} className="sch-bracket-end" />
            <text x={durWide ? (x(0) + x(noteDur)) / 2 : x(noteDur) + 6} y={25} textAnchor={durWide ? 'middle' : 'start'}>
              {durText} · {noteCode(perCycle)}
            </text>
          </g>

          {ideal ? <path className="sch-curve sch-curve-ideal" d={toPath(ideal)} /> : null}
          {ideal ? <text className="sch-ideal-t" x={x(a) - 76 > L ? x(a) - 14 : x(a) + 14} y={y(1) + 4} textAnchor={x(a) - 76 > L ? 'end' : 'start'}>pas atteint</text> : null}
          <path className="sch-fill" d={toPath(shape) + ` L ${x(shape[shape.length - 1][0])} ${y(0)} Z`} />
          <path className={'sch-curve' + (s.bypass ? ' sch-curve-default' : '')} d={toPath(shape)} />
          {ear && ear.revealed ? <path className="sch-curve sch-curve-target" d={toPath(planPoints(adsrPlan(def.values(ear.target), 0, noteDur)))} /> : null}
          {plateau ? (
            <text className="sch-level-t" x={x(sMid)} y={sus > 0.82 ? y(sus) + 16 : y(sus) - 7} textAnchor="middle">
              S = {frNum(sus, 2)}
            </text>
          ) : null}

          {live && live.pts.length > 1 ? (
            <g className="sch-trace">
              <path d={toPath(live.pts)} />
              <circle cx={x(Math.min(live.now, span))} cy={y(live.v)} r={5} />
            </g>
          ) : null}

          {handles.map((h) => (
            <g key={h.id} className="sch-handle" tabIndex={0} role="group" aria-label={h.label + '. Flèches pour régler.'} onKeyDown={(e) => keyMove(h.id, e)}>
              <circle className="sch-handle-hit" data-h={h.id} cx={h.cx} cy={h.cy} r={22} />
              <circle className="sch-handle-dot" data-h={h.id} cx={h.cx} cy={h.cy} r={8} />
              <text className="sch-handle-t" x={labelPos(h).x} y={labelPos(h).y} textAnchor={labelPos(h).anchor}>{h.text}</text>
            </g>
          ))}
        </svg>
        <p className="sch-beatnote">
          Pointillés : les temps, au tempo du schéma (120 BPM, un temps = 0,5 s). En temps : attack {inBeats(a)} · decay {inBeats(d)} · release {inBeats(r)} · note {inBeats(noteDur)}.
        </p>
      </div>

      <Warn text={warn} />
      <ul className="sch-phases" aria-label="Les quatre temps de l’enveloppe">
        {PHASES.map(([k, name]) => (
          <li key={k} className={phase === k ? 'is-on' : ''}><strong>{k}</strong> {name}</li>
        ))}
      </ul>

      <div className="sch-controls">
        {!ear ? (
          <div className="sch-choice-wrap">
            <span className="sch-choice-label">Notes par cycle · durée de chaque note</span>
            <Choice label={def.options.notes.label} values={def.options.notes.values} labels={def.options.notes.labels} value={perCycle} onChange={(v) => s.setOption('notes', v, true)} />
          </div>
        ) : null}
        {ear ? null : <PlayButton playing={s.playing} onToggle={toggle} />}
        {ear ? null : (
          <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre sans réglage d’enveloppe">
            <span>Maintiens : sans réglage</span>
          </HoldButton>
        )}
      </div>
      {ear ? ear.controls(s, toggle) : null}

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

      {!ear || ear.revealed ? (
        <CodeLine
          parts={def.code(st, { bypass: s.bypass })}
          glow={s.glow}
          note={
            s.bypass || !st.written
              ? 'Sans réglage d’enveloppe dans le code, Strudel prend ses valeurs par défaut : .001, .05, .6, .01.'
              : `La durée de la note vient du code : un cycle dure 2 s, et \`note("${noteCode(perCycle)}")\` y joue ${perCycle} note${perCycle > 1 ? 's' : ''} de ${frNum(noteDur, 2)} s. L’enveloppe ne change pas cette durée : elle dessine le volume pendant la note (A, D, puis le niveau S) et après (R).`
          }
        />
      ) : null}
      {ear && ear.revealed ? <CodeLine parts={[{ t: codeText(def, ear.target) }]} glow={{ k: null, n: 0 }} note="Le son mystère." /> : null}

      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      {ear ? null : <Deep facts={def.facts} />}
    </div>
  );
}
