// Schéma « clavier » : deux octaves. Toucher une touche la joue (piano de Strudel).
// Les touches allumées sont les notes que le moteur produit pour la ligne de code.
import { useMemo, useRef } from 'react';
import def, { isBlack, octaveOf, noteName, frName, INTERVALS, SCALES, CHORDS, chordSymbol } from '../types/clavier.js';
import { patternFromCode, notesOf, playKey } from './keys.js';
import { createPatternSound } from './pattern.js';
import { audioContext, unlock } from '../core/audio.js';
import { useSchema } from './useSchema.js';
import { useWidth, CodeLine, HoldButton, PlayButton, Choice, Missions, Deep } from './parts.jsx';
import { Icon } from '../../ui.jsx';

const WHITE = [0, 2, 4, 5, 7, 9, 11];
const LETTER = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'B' };

export default function ClavierSchema({ spec, context = 'lecon' }) {
  const s = useSchema(def, spec, { context });
  const { st } = s;
  const o = st.o;
  const root0 = useRef(o.root);
  // Avant / après : ce qu'on entend « sans l'effet » de ce mode.
  const view = useMemo(() => {
    if (!s.bypass) return st;
    if (o.mode === 'gamme') return { ...st, o: { ...o, scale: 'major' } };
    if (o.mode === 'accord') return { ...st, o: { ...o, quality: '', arp: false } };
    if (o.mode === 'intervalle') return { ...st, o: { ...o, b: o.a } };
    return st;
  }, [st, s.bypass]);
  const code = def.codeText(view);
  const pat = useMemo(() => patternFromCode(code), [code]);
  const played = useMemo(() => notesOf(pat), [pat]);
  const lit = new Map(); // midi → étiquette
  played.forEach((x, i) => {
    if (lit.has(x.midi)) return;
    if (o.mode === 'notes') lit.set(x.midi, String(i + 1));
    else if (o.mode === 'gamme') lit.set(x.midi, String(i + 1));
    else if (o.mode === 'accord') lit.set(x.midi, ['F', '3', '5', '7'][CHORDS[view.o.quality].st.indexOf(x.midi - view.o.croot)] || '');
    else lit.set(x.midi, x.midi === view.o.a ? 'A' : 'B');
  });
  s.extraRef.current = { ...s.extraRef.current, root0: root0.current };

  const start = o.mode === 'gamme' ? Math.min(o.start, Math.floor(o.root / 12) * 12) : o.start;
  const keys = [];
  for (let m = start; m < start + 25; m++) keys.push(m);
  const whites = keys.filter((m) => !isBlack(m));
  const boxRef = useRef(null);
  const W = useWidth(boxRef, 600);
  const top = o.mode === 'notes' ? 8 : 44;
  const kh = W < 520 ? 110 : 140;
  const H = top + kh + 6;
  const ww = (W - 2) / whites.length;
  const xOf = (m) => {
    const wi = whites.filter((w) => w < m).length;
    return isBlack(m) ? 1 + wi * ww - ww * 0.3 : 1 + wi * ww;
  };
  const cx = (m) => xOf(m) + (isBlack(m) ? ww * 0.3 : ww / 2);

  const tap = (m) => {
    const ac = unlock();
    playKey(ac, m);
    s.extraRef.current = { ...s.extraRef.current, taps: (s.extraRef.current.taps || 0) + 1 };
    if (o.mode === 'notes') s.setOption('seq', o.seq.length >= 8 ? [m] : [...o.seq, m], true);
    else if (o.mode === 'intervalle') s.setOption(o.target === 'a' ? 'a' : 'b', m, true);
    else if (o.mode === 'gamme') s.setOption('root', m, true);
    else s.setOption('croot', m, true);
  };
  const setOpt = (k, v) => {
    s.extraRef.current = { ...s.extraRef.current, taps: (s.extraRef.current.taps || 0) + 1 };
    s.setOption(k, v, true);
  };

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

  // Arcs : l'écart (en demi-tons) entre notes voisines de ce qui est joué.
  const chain = [...new Set(played.map((x) => x.midi))];
  const arcs = [];
  if (o.mode === 'intervalle' && view.o.a !== view.o.b) arcs.push([view.o.a, view.o.b]);
  if (o.mode === 'gamme' || o.mode === 'accord') {
    const sorted = [...chain].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) arcs.push([sorted[i - 1], sorted[i]]);
  }
  const stepLabel = (d) => (o.mode === 'gamme' ? (d === 2 ? 'T' : d === 1 ? '½' : d === 3 ? '1½' : String(d)) : String(d));
  const last2 = o.seq.slice(-2);
  const info =
    o.mode === 'notes'
      ? last2.length === 2
        ? `${noteName(last2[0])} → ${noteName(last2[1])} : ${Math.abs(last2[1] - last2[0])} demi-ton${Math.abs(last2[1] - last2[0]) > 1 ? 's' : ''}`
        : `${noteName(o.seq[0])} (${frName(o.seq[0])})`
      : o.mode === 'intervalle'
        ? `${noteName(view.o.a, true)} → ${noteName(view.o.b, true)} : ${Math.abs(view.o.b - view.o.a)} demi-tons${Math.abs(view.o.b - view.o.a) <= 12 ? ' · ' + INTERVALS[Math.abs(view.o.b - view.o.a)][0] : ''}`
        : o.mode === 'gamme'
          ? `${frName(view.o.root, true)} ${SCALES[view.o.scale]} : ${chain.length} notes`
          : `${chordSymbol(view.o.croot, view.o.quality)} : accord ${CHORDS[view.o.quality].label}, ${chain.length} notes${view.o.arp ? ', en arpège' : ', plaqué'}`;

  return (
    <div className={'schema schema-clavier' + (s.bypass ? ' is-bypass' : '')} data-schema="clavier" data-schema-id={s.id}>
      <p className="sch-tempo-line" role="status"><strong>{info}</strong></p>
      <div className="sch-figure" ref={boxRef}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="sch-svg sch-keys" role="group" aria-label="Clavier de deux octaves">
          {arcs.map(([a, b], i) => {
            const x1 = cx(a);
            const x2 = cx(b);
            const d = Math.abs(b - a);
            return (
              <g key={i} className="sch-arc">
                <path d={`M ${x1} ${top - 4} Q ${(x1 + x2) / 2} ${top - 34} ${x2} ${top - 4}`} />
                <text x={(x1 + x2) / 2} y={top - 22} textAnchor="middle">{stepLabel(d)}</text>
              </g>
            );
          })}
          {whites.map((m) => {
            const on = lit.has(m);
            const pc = ((m % 12) + 12) % 12;
            return (
              <g key={m} className={'sch-key sch-key-w' + (on ? ' is-on' : '')} onPointerDown={(e) => { e.preventDefault(); tap(m); }} role="button" tabIndex={0} aria-label={`${noteName(m)}, ${frName(m)}${on ? ', allumée' : ''}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(m); } }}>
                <rect x={xOf(m)} y={top} width={ww - 1} height={kh} rx={4} />
                <text className="sch-key-l" x={xOf(m) + ww / 2} y={top + kh - 26} textAnchor="middle">{LETTER[pc]}{pc === 0 ? octaveOf(m) : ''}</text>
                <text className="sch-key-fr" x={xOf(m) + ww / 2} y={top + kh - 10} textAnchor="middle">{frName(m)}</text>
                {on ? <text className="sch-key-n" x={xOf(m) + ww / 2} y={top + kh * 0.55} textAnchor="middle">{lit.get(m)}</text> : null}
              </g>
            );
          })}
          {keys.filter(isBlack).map((m) => {
            const on = lit.has(m);
            return (
              <g key={m} className={'sch-key sch-key-b' + (on ? ' is-on' : '')} onPointerDown={(e) => { e.preventDefault(); tap(m); }} role="button" tabIndex={0} aria-label={`${noteName(m)} = ${noteName(m, true)}${on ? ', allumée' : ''}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(m); } }}>
                <rect x={xOf(m)} y={top} width={ww * 0.6} height={kh * 0.6} rx={3} />
                {on ? <text className="sch-key-n" x={xOf(m) + ww * 0.3} y={top + kh * 0.4} textAnchor="middle">{lit.get(m)}</text> : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="sch-controls">
        <PlayButton playing={s.playing} onToggle={toggle} />
        {o.mode !== 'notes' ? (
          <HoldButton onDown={bypassDown} onUp={bypassUp} label="Maintiens pour comparer">
            <span>{{ gamme: 'Maintiens : majeure', accord: 'Maintiens : majeur plaqué', intervalle: 'Maintiens : une seule note' }[o.mode]}</span>
          </HoldButton>
        ) : (
          <button type="button" className="sch-hold" onClick={() => setOpt('seq', [o.seq[o.seq.length - 1]])}><Icon name="reset" size={18} /> <span>Recommencer la mélodie</span></button>
        )}
        {o.mode === 'intervalle' ? <Choice label="Je règle" values={['a', 'b']} labels={{ a: 'la 1re note', b: 'la 2e note' }} value={o.target === 'a' ? 'a' : 'b'} onChange={(v) => s.setOption('target', v)} /> : null}
        {o.mode === 'gamme' ? <Choice label="Gamme" values={Object.keys(SCALES)} labels={{ major: 'majeure', minor: 'mineure', 'minor:pentatonic': 'penta mineure', 'major:pentatonic': 'penta majeure' }} value={o.scale} onChange={(v) => setOpt('scale', v)} /> : null}
        {o.mode === 'accord' ? <Choice label="Accord" values={Object.keys(CHORDS)} labels={{ '': 'majeur', m: 'mineur', 7: 'septième', '^7': 'majeur 7' }} value={o.quality} onChange={(v) => setOpt('quality', v)} /> : null}
        {o.mode === 'accord' ? <Choice label="Jeu" values={['plaque', 'arpege']} labels={{ plaque: 'plaqué', arpege: 'arpège' }} value={o.arp ? 'arpege' : 'plaque'} onChange={(v) => setOpt('arp', v === 'arpege')} /> : null}
      </div>
      <p className="sch-code-note">{{ notes: 'Touche les touches : chacune joue et s’ajoute au code.', intervalle: 'Touche une touche pour la note choisie ci-dessus. On entend l’une, l’autre, puis les deux ensemble.', gamme: 'Touche une touche pour en faire la tonique. Les chiffres sont les degrés ; au-dessus, les tons (T) et demi-tons (½).', accord: 'Touche une touche pour en faire la fondamentale (F). Au-dessus, les tierces empilées, en demi-tons.' }[o.mode]}</p>

      <CodeLine parts={[{ t: code, k: s.glow.k || 'seq' }]} glow={s.glow} />
      <Missions missions={s.missions} done={s.done} fresh={s.fresh} />
      <Deep facts={def.facts.filter((f) => !f.modes || f.modes.includes(o.mode))} />
    </div>
  );
}

export { audioContext };
