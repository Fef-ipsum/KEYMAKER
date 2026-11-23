// Schéma « filtre » : on attrape la courbe elle-même.
//
// Gauche-droite = coupure, haut-bas = résonance. La courbe vient de
// getFrequencyResponse() d'un filtre réglé comme celui qui joue, dans le même
// contexte audio. Le peigne montre les harmoniques de la note en cours.
import { useEffect, useMemo, useRef, useState } from 'react';
import def, { KINDS, SOURCES } from '../types/filtre.js';
import { codeText } from '../catalog.js';
import { frHz, frNum } from '../core/format.js';
import { midiToFreq } from '../core/synth.js';
import { audioContext } from '../core/audio.js';
import { filterResponse as responseIn } from './response.js';

const filterResponse = (st, freqs) => responseIn(audioContext(), st, freqs);
import { createFiltreSound } from './sounds.js';
import { useSchema } from './useSchema.js';
import { useWidth, Slider, CodeLine, HoldButton, PlayButton, Choice, Missions, Deep, Warn } from './parts.jsx';

const F_LO = 20;
const F_HI = 20000;
const DB_HI = 32;
const DB_LO = -60;
const TICKS = [50, 100, 200, 500, 1000, 2000, 5000, 10000];
const tickLabel = (f) => (f >= 1000 ? f / 1000 + 'k' : String(f));

export default function FiltreSchema({ spec, ear = null, context = 'lecon' }) {
  const s = useSchema(def, spec, { ear, context });
  const { st } = s;
  const kind = KINDS[st.o.kind];
  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const H = W < 520 ? 230 : 280;
  const L = 34;
  const R = 12;
  const T = 14;
  const B = 24;
  const x = (f) => L + (Math.log(f / F_LO) / Math.log(F_HI / F_LO)) * (W - L - R);
  const fOf = (px) => F_LO * Math.pow(F_HI / F_LO, (px - L) / (W - L - R));
  const y = (db) => T + ((DB_HI - Math.max(DB_LO, Math.min(DB_HI, db))) / (DB_HI - DB_LO)) * (H - T - B);
  const dbOf = (py) => DB_HI - ((py - T) / (H - T - B)) * (DB_HI - DB_LO);

  // Note en cours (le peigne se décale à chaque note de la basse).
  const [midi, setMidi] = useState(SOURCES[st.o.source].midi[0]);
  useEffect(() => {
    if (!s.playing) {
      setMidi(SOURCES[st.o.source].midi[0]);
      return undefined;
    }
    let raf = 0;
    const loop = () => {
      const m = s.sound.current && s.sound.current.currentMidi();
      if (m != null) setMidi((old) => (old === m ? old : m));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [s.playing, st.o.source]);

  // Courbe + harmoniques : une seule demande de réponse au filtre.
  const N = 220;
  const f0 = midiToFreq(midi);
  const harmonics = useMemo(() => {
    const out = [];
    for (let n = 1; n * f0 <= F_HI; n++) out.push(n);
    return out;
  }, [f0]);
  const freqs = useMemo(() => {
    const a = new Float32Array(N + harmonics.length);
    for (let i = 0; i < N; i++) a[i] = F_LO * Math.pow(F_HI / F_LO, i / (N - 1));
    harmonics.forEach((n, i) => (a[N + i] = n * f0));
    return a;
  }, [harmonics, f0]);
  const resp = useMemo(() => filterResponse(st, freqs), [st.p.f, st.p.q, st.o.kind, freqs]);
  const curve = resp.slice(0, N);
  const hResp = resp.slice(N);

  const path = curve.map((db, i) => (i ? 'L' : 'M') + x(freqs[i]).toFixed(1) + ' ' + y(db).toFixed(1)).join(' ');
  const fill = path + ` L ${x(F_HI).toFixed(1)} ${H - B} L ${x(F_LO).toFixed(1)} ${H - B} Z`;

  // Revue de la question d'écoute : la courbe du son mystère, en pointillé.
  const targetPath = useMemo(() => {
    if (!ear || !ear.revealed) return null;
    const r = filterResponse(ear.target, freqs).slice(0, N);
    return r.map((db, i) => (i ? 'L' : 'M') + x(freqs[i]).toFixed(1) + ' ' + y(db).toFixed(1)).join(' ');
  }, [ear && ear.revealed, freqs, W]);

  const canF = s.can('f');
  const canQ = s.can('q') && st.o.kind !== 'passe-bande';
  const handleDb = st.o.kind === 'passe-bande' ? 0 : st.p.q;

  // Attraper le dessin : la poignée vient sous le doigt.
  const drag = useRef(false);
  const bandStart = useRef(null); // passe-bande : glisser vers le haut resserre la bande
  const canBandQ = s.can('q') && st.o.kind === 'passe-bande';
  const moveTo = (e, first = false) => {
    const r = boxRef.current.querySelector('svg').getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (canF) s.setParam('f', fOf(px));
    if (canQ) s.setParam('q', dbOf(py));
    if (canBandQ) {
      if (first) bandStart.current = { y: py, q: st.p.q };
      else if (bandStart.current) s.setParam('q', bandStart.current.q + (bandStart.current.y - py) / 8);
    }
  };
  const onKey = (e) => {
    const k = e.key;
    let used = true;
    if (k === 'ArrowRight' && canF) s.setParam('f', st.p.f * (e.shiftKey ? 2 : Math.pow(2, 1 / 6)));
    else if (k === 'ArrowLeft' && canF) s.setParam('f', st.p.f / (e.shiftKey ? 2 : Math.pow(2, 1 / 6)));
    else if (k === 'ArrowUp' && (canQ || canBandQ)) s.setParam('q', st.p.q + (e.shiftKey ? 5 : 1));
    else if (k === 'ArrowDown' && (canQ || canBandQ)) s.setParam('q', st.p.q - (e.shiftKey ? 5 : 1));
    else used = false;
    if (used) e.preventDefault();
  };

  const toggle = () => {
    if (s.playing) return s.unclaim();
    const snd = s.ensureSound(createFiltreSound);
    s.claim();
    snd.start();
  };
  // Avant / après : maintenir pour entendre (et voir) sans le filtre.
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

  const hx = x(st.p.f);
  const hy = y(handleDb);
  const labelLeft = hx > W - 150;
  const handleText = frHz(st.p.f) + (st.o.kind === 'passe-bande' ? ' · bande ' + frNum(st.p.q, 0) : ' · résonance ' + frNum(st.p.q, 0));
  const fCode = def.paramCode(st, 'f');
  const qCode = def.paramCode(st, 'q');

  return (
    <div className={'schema schema-filtre' + (s.bypass ? ' is-bypass' : '')} data-schema="filtre" data-schema-id={s.id}>
      <div className="sch-figure" ref={boxRef}>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="sch-svg"
          role="img"
          aria-label={`Courbe du filtre ${kind.label} : coupure ${frHz(st.p.f)}, résonance ${st.p.q}.`}
          onPointerDown={(e) => {
            if (!canF && !canQ && !canBandQ) return;
            drag.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            moveTo(e, true);
          }}
          onPointerMove={(e) => drag.current && moveTo(e)}
          onPointerUp={() => (drag.current = false)}
          onPointerCancel={() => (drag.current = false)}
        >
          {TICKS.map((f) => (
            <g key={f} className="sch-grid">
              <line x1={x(f)} x2={x(f)} y1={T} y2={H - B} />
              <text x={x(f)} y={H - 7} textAnchor="middle">{tickLabel(f)}</text>
            </g>
          ))}
          {[24, 12, -12, -24, -36, -48].map((db) => (
            <g key={db} className="sch-grid sch-grid-h">
              <line x1={L} x2={W - R} y1={y(db)} y2={y(db)} />
              {W > 420 || db % 24 === 0 ? <text x={L - 5} y={y(db) + 4} textAnchor="end">{db > 0 ? '+' + db : db}</text> : null}
            </g>
          ))}
          <line className="sch-zero" x1={L} x2={W - R} y1={y(0)} y2={y(0)} />
          <text className="sch-zero-t" x={L - 5} y={y(0) + 4} textAnchor="end">0 dB</text>

          {/* Harmoniques de la note en cours : brut (gris) et après le filtre (doré). */}
          <g className="sch-comb">
            {harmonics.map((n, i) => {
              const raw = 20 * Math.log10(1 / n);
              const after = s.bypass ? raw : raw + hResp[i];
              const hxi = x(n * f0);
              return (
                <g key={n}>
                  <line className="sch-h-raw" x1={hxi} x2={hxi} y1={H - B} y2={y(raw)} />
                  <line className="sch-h-out" x1={hxi} x2={hxi} y1={H - B} y2={y(after)} />
                </g>
              );
            })}
          </g>

          {s.bypass ? (
            <line className="sch-curve sch-curve-off" x1={L} x2={W - R} y1={y(0)} y2={y(0)} />
          ) : (
            <>
              <path className="sch-fill" d={fill} />
              <path className="sch-curve" d={path} />
            </>
          )}
          {targetPath ? <path className="sch-curve sch-curve-target" d={targetPath} /> : null}

          {!s.bypass && (canF || canQ || canBandQ) ? (
            <g
              className="sch-handle"
              tabIndex={0}
              role="group"
              aria-label={`Poignée du filtre : ${handleText}. Flèches gauche et droite pour la fréquence${canQ || canBandQ ? ', haut et bas pour la résonance' : ''}.`}
              onKeyDown={onKey}
            >
              <circle className="sch-handle-hit" cx={hx} cy={hy} r={24} />
              <circle className="sch-handle-dot" cx={hx} cy={hy} r={9} />
              <text className="sch-handle-t" x={labelLeft ? hx - 16 : hx + 16} y={Math.max(T + 12, hy - 14)} textAnchor={labelLeft ? 'end' : 'start'}>
                {handleText}
              </text>
            </g>
          ) : null}
        </svg>
      </div>

      <div className="sch-controls">
        {ear ? null : <PlayButton playing={s.playing} onToggle={toggle} />}
        {ear ? null : (
          <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre sans le filtre">
            <span>Maintiens : sans filtre</span>
          </HoldButton>
        )}
        {!ear && Array.isArray(spec.filtres) && spec.filtres.length > 1 ? (
          <Choice label={def.options.kind.label} values={spec.filtres} labels={{ 'passe-bas': 'Passe-bas', 'passe-haut': 'Passe-haut', 'passe-bande': 'Passe-bande' }} value={st.o.kind} onChange={(v) => s.setOption('kind', v)} />
        ) : null}
        {!ear || !ear.fixedSource ? (
          <Choice label={def.options.source.label} values={def.options.source.values} labels={def.options.source.labels} value={st.o.source} onChange={(v) => s.setOption('source', v)} />
        ) : null}
      </div>
      {ear ? ear.controls(s, toggle) : null}

      <div className="sch-sliders">
        <Slider def={def} k="f" value={st.p.f} codeName={fCode} onChange={s.setParam} disabled={!canF} />
        <Slider def={def} k="q" value={st.p.q} codeName={qCode} onChange={s.setParam} disabled={!(canQ || canBandQ)} hint={st.o.kind === 'passe-bande' ? 'plus c’est haut, plus la bande est étroite' : undefined} />
      </div>
      <Warn text={def.warn(st)} />

      {!ear || ear.revealed ? (
        <CodeLine parts={def.code(st, { bypass: s.bypass })} glow={s.glow} note={s.bypass ? 'Sans le filtre, ces réglages ne jouent pas.' : null} />
      ) : null}
      {ear && ear.revealed ? <CodeLine parts={[{ t: codeText(def, ear.target) }]} glow={{ k: null, n: 0 }} note="Le son mystère." /> : null}

      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      {ear ? null : <Deep facts={def.facts.filter((f) => !f.kinds || f.kinds.includes(st.o.kind))} />}
    </div>
  );
}
