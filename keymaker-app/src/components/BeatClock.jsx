// La durée d'un temps, au tempo du code joué — pour régler une enveloppe (ADSR),
// un écho ou une durée de note en sachant ce que valent ces secondes en musique.
//
// Le tempo est lu dans le moteur après chaque ▶ (setcpm / setcps du code, ou le
// tempo par défaut de l'app). Le nombre de temps par cycle (4 par défaut) et le
// clic des temps sont mémorisés sur l'appareil.

import { useEffect, useState } from 'react';
import * as engine from '../lib/engine.js';
import { useEngine } from '../lib/app.js';
import { readJSON, writeJSON } from '../lib/store.js';
import { beatTable, fmtDur, fmtNum, secToBeats, beatsToSec } from '../lib/beat.js';
import { Icon } from '../ui.jsx';

const KEY = 'km2:beatclock';

export function useBeatSettings() {
  useEffect(() => {
    const saved = readJSON(KEY, null);
    if (saved && typeof saved === 'object') engine.setClick({ on: !!saved.on, beats: saved.beats || 4 });
  }, []);
}

// État partagé : tempo du dernier ▶, réglages du clic.
function useBeat() {
  const eng = useEngine();
  const click = eng.click || { on: false, beats: 4 };
  const [cps, setCps] = useState(() => engine.currentCps());
  useEffect(() => engine.onEvaluated(() => setCps(engine.currentCps())), []);
  return { eng, click, cps, t: beatTable(cps, click.beats) };
}

// Le bouton de la barre de l'éditeur : la durée d'un temps, d'un coup d'œil.
export function BeatButton({ open, onToggle }) {
  const { t } = useBeat();
  useBeatSettings();
  return (
    <button type="button" className="toolbtn" onClick={onToggle} aria-expanded={open} title="Durée d’un temps au tempo du code joué">
      <Icon name="beat" size={19} />
      <span>{fmtDur(t.beat)}</span>
    </button>
  );
}

// Le panneau : durées, conversion secondes ↔ temps, clic des temps.
export function BeatPanel() {
  const { eng, click, cps, t } = useBeat();
  const [sec, setSec] = useState('0.3');
  const [nb, setNb] = useState('1');
  const save = (next) => {
    engine.setClick(next);
    writeJSON(KEY, { ...click, ...next });
  };
  const num = (v) => parseFloat(String(v).replace(',', '.'));
  return (
    <div className="beatpanel" role="region" aria-label="Durée d’un temps">
      <p className="beat-head">
        <strong>{fmtNum(t.bpm, 1)} BPM</strong> · un temps dure <strong>{fmtDur(t.beat)}</strong>
      </p>
      <p className="hint">Tempo lu au dernier ▶. Sans <code>setcpm</code>, l’app joue 30 cycles par minute.</p>

      <label className="beat-row">
        Temps par cycle
        <select value={t.beats} onChange={(e) => save({ beats: Number(e.target.value) })}>
          {[2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>

      <table className="beat-table">
        <tbody>
          <tr><th scope="row">Cycle (mesure)</th><td>{fmtDur(t.cycle)}</td></tr>
          <tr><th scope="row">Temps (noire)</th><td>{fmtDur(t.beat)}</td></tr>
          <tr><th scope="row">Croche</th><td>{fmtDur(t.eighth)}</td></tr>
          <tr><th scope="row">Triolet de croches</th><td>{fmtDur(t.triplet)}</td></tr>
          <tr><th scope="row">Double-croche</th><td>{fmtDur(t.sixteenth)}</td></tr>
        </tbody>
      </table>

      <div className="beat-conv">
        <label>
          Secondes
          <input inputMode="decimal" value={sec} onChange={(e) => setSec(e.target.value)} />
        </label>
        <span className="beat-out" role="status">= {fmtNum(secToBeats(num(sec), cps, t.beats))} temps</span>
        <label>
          Temps
          <input inputMode="decimal" value={nb} onChange={(e) => setNb(e.target.value)} />
        </label>
        <span className="beat-out" role="status">= {fmtNum(beatsToSec(num(nb), cps, t.beats), 3)} s</span>
      </div>
      <p className="hint">Exemple : <code>release({String(Math.round(t.beat * 1000) / 1000)})</code> fait durer l’extinction exactement un temps.</p>

      <label className="beat-click">
        <input type="checkbox" checked={!!click.on} onChange={(e) => save({ on: e.target.checked })} />
        Clic sur chaque temps (le premier plus fort)
      </label>
      {click.on ? <p className="hint">Le clic s’ajoute au son joué, jamais à ton code.</p> : null}
      {eng.clickNote ? <p className="hint" role="status">{eng.clickNote}</p> : null}
    </div>
  );
}
