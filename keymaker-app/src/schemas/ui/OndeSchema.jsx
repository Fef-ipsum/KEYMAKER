// Schéma « onde » : la forme (deux périodes) et les harmoniques, côte à côte.
// On choisit l'onde en touchant son dessin. Le dessin vient des coefficients de la
// norme Web Audio, vérifiés par mesure sur l'oscillateur réel (scripts/check-schemas.mjs).
import { useRef } from 'react';
import def, { WAVES, NOTES, period, harmonics } from '../types/onde.js';
import { createOndeSound } from './sounds.js';
import { useSchema } from './useSchema.js';
import { useWidth, CodeLine, HoldButton, PlayButton, Choice, Missions, Deep } from './parts.jsx';

const NH = 16;

function WavePath({ wave, w, h, periods = 2, pad = 6 }) {
  const pts = period(wave, 128);
  const all = [];
  for (let p = 0; p < periods; p++) for (let i = 0; i < pts.length; i++) all.push(pts[i]);
  all.push(pts[0]);
  const d = all.map((v, i) => (i ? 'L' : 'M') + (pad + (i / (all.length - 1)) * (w - 2 * pad)).toFixed(1) + ' ' + (h / 2 - v * (h / 2 - pad)).toFixed(1)).join(' ');
  return <path d={d} />;
}

export default function OndeSchema({ spec, context = 'lecon' }) {
  const s = useSchema(def, spec, { context });
  const { st } = s;
  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const narrow = W < 560;
  const wave = s.bypass ? 'sine' : st.o.onde;
  const waveW = narrow ? W : Math.round(W * 0.48);
  const waveH = narrow ? 130 : 200;
  const barsW = narrow ? W : W - waveW - 12;
  const barsH = narrow ? 150 : 200;
  const levels = harmonics(wave, NH);
  const bT = 18;
  const bB = 24;
  const bL = 8;
  const slot = (barsW - bL * 2) / NH;

  const toggle = () => {
    if (s.playing) return s.unclaim();
    const snd = s.ensureSound((ac, dest, get) => createOndeSound(ac, dest, get, { notes: NOTES }));
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
  const pick = (w) => s.setOption('onde', w, true);

  return (
    <div className={'schema schema-onde' + (s.bypass ? ' is-bypass' : '')} data-schema="onde" data-schema-id={s.id}>
      <div className="sch-figure sch-onde-fig" ref={boxRef}>
        <svg width={waveW} height={waveH} viewBox={`0 0 ${waveW} ${waveH}`} className="sch-svg sch-onde-wave" role="img" aria-label={`Forme de l’onde ${WAVES[wave].label}, deux périodes.`}>
          <line className="sch-zero" x1={6} x2={waveW - 6} y1={waveH / 2} y2={waveH / 2} />
          <g className="sch-curve"><WavePath wave={wave} w={waveW} h={waveH} /></g>
          <text className="sch-axis-t" x={8} y={14}>la forme (2 périodes)</text>
        </svg>
        <svg width={barsW} height={barsH} viewBox={`0 0 ${barsW} ${barsH}`} className="sch-svg sch-onde-bars" role="img" aria-label={`Harmoniques : ${levels.map((l, i) => (l > 0.001 ? i + 1 : null)).filter(Boolean).join(', ')}.`}>
          <text className="sch-axis-t" x={bL} y={13}>les harmoniques (niveau par rapport à la 1re)</text>
          {levels.map((l, i) => {
            const h = l * (barsH - bT - bB);
            const x = bL + i * slot + slot * 0.18;
            return (
              <g key={i}>
                <rect className={'sch-bar' + (l < 0.001 ? ' is-empty' : '')} x={x} y={barsH - bB - h} width={slot * 0.64} height={Math.max(h, l < 0.001 ? 0 : 1)} rx={2} />
                <text className="sch-grid-t" x={x + slot * 0.32} y={barsH - 8} textAnchor="middle">{i + 1}</text>
              </g>
            );
          })}
          <line className="sch-zero" x1={bL} x2={barsW - bL} y1={barsH - bB} y2={barsH - bB} />
        </svg>
      </div>

      <div className="sch-waves" role="radiogroup" aria-label="Choisis une onde">
        {Object.entries(WAVES).map(([k, w]) => (
          <button key={k} type="button" role="radio" aria-checked={st.o.onde === k} className={'sch-wavebtn' + (st.o.onde === k ? ' is-on' : '')} onClick={() => pick(k)}>
            <svg width="64" height="30" viewBox="0 0 64 30" aria-hidden="true"><g className="sch-curve"><WavePath wave={k} w={64} h={30} pad={3} /></g></svg>
            <span>{w.label}</span>
          </button>
        ))}
      </div>

      <div className="sch-controls">
        <PlayButton playing={s.playing} onToggle={toggle} />
        <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre la sinusoïde, sans harmoniques">
          <span>Maintiens : sinusoïde</span>
        </HoldButton>
        <Choice label={def.options.note.label} values={def.options.note.values} labels={def.options.note.labels} value={st.o.note} onChange={(v) => s.setOption('note', v)} />
      </div>

      <CodeLine parts={def.code(st, { bypass: s.bypass })} glow={s.glow} note={s.bypass ? 'Pendant que tu maintiens : la sinusoïde, une seule harmonique.' : null} />
      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      <Deep facts={def.facts} />
    </div>
  );
}
