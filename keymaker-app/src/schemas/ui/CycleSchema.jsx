// Schéma « cycle » : une ligne par cycle, les événements réels du motif.
//
// On écrit le motif (le texte entre guillemets) ; on peut aussi toucher un bloc pour le
// remplacer par un silence `~`. Le dessin et le son viennent des mêmes événements,
// calculés par le moteur Strudel (pattern.js) ; le son passe par superdough lui-même.
import { useEffect, useMemo, useRef, useState } from 'react';
import def from '../types/cycle.js';
import { motifEvents, motifPattern, createPatternSound } from './pattern.js';
import { useSchema } from './useSchema.js';
import { useWidth, CodeLine, HoldButton, PlayButton, Missions, Deep } from './parts.jsx';
import { Icon } from '../../ui.jsx';

const CPS = 0.5;
const LANE_COLORS = 4;

// Répartit les événements d'un cycle en couloirs (ceux qui se chevauchent vont dessous).
function lanes(list) {
  const ends = [];
  return list.map((x) => {
    let i = ends.findIndex((e) => e <= x.b + 1e-9);
    if (i < 0) {
      i = ends.length;
      ends.push(0);
    }
    ends[i] = x.e;
    return { ...x, lane: i };
  });
}

export default function CycleSchema({ spec, context = 'lecon' }) {
  const s = useSchema(def, spec, { context });
  const { st } = s;
  const start = useRef(st.o.motif);
  const [draft, setDraft] = useState(st.o.motif);
  const motif = s.bypass ? start.current : st.o.motif;
  const parsed = useMemo(() => motifEvents(motif, 0, 4), [motif]);
  const lastGood = useRef(parsed.ok ? parsed : motifEvents(start.current, 0, 4));
  if (parsed.ok) lastGood.current = parsed;
  const ev = lastGood.current.ev;
  const draftErr = useMemo(() => (draft === st.o.motif ? '' : motifEvents(draft, 0, 1).error), [draft, st.o.motif]);
  // Les missions regardent ce que le motif produit (avant le premier contrôle).
  s.extraRef.current = { ...s.extraRef.current, ev: parsed.ok ? parsed.ev : [] };

  const rows = st.o.rows || (/[<?|/]/.test(motif) ? 4 : 2);
  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const L = 70;
  const R = 10;
  const rowH = W < 520 ? 46 : 54;
  const H = rows * (rowH + 10) + 22;
  const x = (u) => L + u * (W - L - R);

  // Tête de lecture.
  const [head, setHead] = useState(null);
  useEffect(() => {
    if (!s.playing) {
      setHead(null);
      return undefined;
    }
    let raf = 0;
    const loop = () => {
      const p = s.sound.current && s.sound.current.position();
      if (p != null && p >= 0) setHead(p);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [s.playing]);

  // Écrire le motif : chaque texte lisible est joué tout de suite.
  const patRef = useRef(null);
  const setPattern = (m) => {
    try {
      patRef.current = motifPattern(m);
    } catch {
      /* motif illisible : on garde le précédent */
    }
  };
  useEffect(() => {
    if (parsed.ok) setPattern(motif);
  }, [motif, parsed.ok]);
  const onType = (v) => {
    setDraft(v);
    const r = motifEvents(v, 0, 1);
    if (r.ok && v.trim() && !/["'`\\]/.test(v) && v.length <= 120) s.setOption('motif', v, true);
  };
  useEffect(() => setDraft(st.o.motif), [st.o.motif]);

  // Toucher un bloc : ce pas devient un silence.
  const silence = (e) => {
    if (!e.loc || s.bypass) return;
    const [a, b] = e.loc;
    const m = st.o.motif;
    if (a < 0 || b > m.length || !/^[A-Za-z0-9_:.]+$/.test(m.slice(a, b))) return;
    const next = m.slice(0, a) + '~' + m.slice(b);
    if (motifEvents(next, 0, 1).ok) s.setOption('motif', next, true);
  };

  const toggle = () => {
    if (s.playing) return s.unclaim();
    const snd = s.ensureSound((ac) => createPatternSound(ac, () => patRef.current, () => CPS));
    s.claim();
    snd.start();
  };
  const heldPlay = useRef(false);
  const bypassDown = () => {
    s.setBypass(true);
    setPattern(start.current);
    if (!s.playingRef.current) {
      heldPlay.current = true;
      toggle();
    }
  };
  const bypassUp = () => {
    s.setBypass(false);
    setPattern(st.o.motif);
    if (heldPlay.current) {
      heldPlay.current = false;
      s.unclaim();
    }
  };

  return (
    <div className={'schema schema-cycle' + (s.bypass ? ' is-bypass' : '')} data-schema="cycle" data-schema-id={s.id}>
      <div className="sch-figure" ref={boxRef}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="sch-svg sch-cycle-svg" role="img" aria-label={`Motif ${motif} : ${ev.filter((e) => e.c === 0).length} sons dans le premier cycle.`}>
          {Array.from({ length: rows }, (_, c) => {
            const y0 = 8 + c * (rowH + 10);
            const list = lanes(ev.filter((e) => e.c === c));
            const nl = Math.max(1, ...list.map((e) => e.lane + 1));
            const lh = (rowH - 4) / nl;
            const here = head != null && Math.floor(head) % rows === c ? head - Math.floor(head) : null;
            return (
              <g key={c}>
                <text className="sch-axis-t" x={6} y={y0 + rowH / 2 + 4}>cycle {c + 1}</text>
                <rect className="sch-row" x={x(0)} y={y0} width={x(1) - x(0)} height={rowH} rx={6} />
                {[0.25, 0.5, 0.75].map((q) => <line key={q} className="sch-quarter" x1={x(q)} x2={x(q)} y1={y0} y2={y0 + rowH} />)}
                {list.map((e, i) => {
                  const bx = x(e.b - c);
                  const bw = Math.max(3, x(Math.min(e.e - c, 1)) - bx - 2); // un son plus long que le cycle s'arrête au bord de la ligne
                  return (
                    <g key={i} className={'sch-ev sch-ev-' + (e.lane % LANE_COLORS) + (e.loc ? ' is-tap' : '')} onClick={() => silence(e)}>
                      <rect x={bx + 1} y={y0 + 2 + e.lane * lh} width={bw} height={lh - 2} rx={4} />
                      {bw > 24 ? <text x={bx + 1 + bw / 2} y={y0 + 2 + e.lane * lh + lh / 2 + 4} textAnchor="middle">{e.s}</text> : null}
                    </g>
                  );
                })}
                {here != null ? <line className="sch-head" x1={x(here)} x2={x(here)} y1={y0 - 3} y2={y0 + rowH + 3} /> : null}
              </g>
            );
          })}
          <text className="sch-grid-t" x={x(0)} y={H - 4}>{W < 520 ? '1 cycle = 2 s · pointillés : les quarts' : 'un cycle = 2 s (sans setcpm) · lignes pointillées : les quarts du cycle'}</text>
        </svg>
      </div>

      <label className="sch-motif">
        <span className="sch-slider-name">Le motif, entre les guillemets de <code>sound("…")</code></span>
        <input type="text" value={draft} spellCheck={false} autoCapitalize="off" autoCorrect="off" onChange={(e) => onType(e.target.value)} aria-invalid={!!draftErr} />
      </label>
      {draftErr ? <p className="sch-warn" role="status">Pas encore lisible : {draftErr.slice(0, 140)}. Le dessin garde le dernier motif lisible.</p> : null}

      <div className="sch-controls">
        <PlayButton playing={s.playing} onToggle={toggle} />
        <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour entendre le motif de départ">
          <span>Maintiens : motif de départ</span>
        </HoldButton>
        <button type="button" className="sch-hold" onClick={() => s.setOption('motif', start.current, true)} disabled={st.o.motif === start.current}>
          <Icon name="reset" size={18} /> <span>Remettre</span>
        </button>
      </div>

      <CodeLine parts={def.code({ ...st, o: { ...st.o, motif } })} glow={s.glow} note={s.bypass ? 'Pendant que tu maintiens : le motif de départ.' : 'Touche un bloc du dessin pour en faire un silence.'} />
      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      <Deep facts={def.facts} />
    </div>
  );
}
