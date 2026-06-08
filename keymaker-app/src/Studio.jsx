// Keymaker — Chantier 32 : le Studio REPL.  [studio]
//
// Un bac à sable AUTONOME, indépendant des leçons : Felix vient juste « faire du
// son ». Son PROPRE éditeur Strudel (instance dédiée, montée à l'ouverture, jamais
// partagée avec la leçon → aucun risque d'écraser le code d'un flash). Sati reste
// disponible à la demande (bouton), et voit le code live du Studio.
//
// Contrainte audio (vérifiée) : chaque <strudel-editor> a son propre scheduler mais
// partage l'AudioContext global de superdough. App arrête l'éditeur de leçon quand
// le Studio s'ouvre, et le Studio arrête le sien à la fermeture → un seul son à la fois.
import { useCallback, useEffect, useRef, useState } from 'react';
import StrudelEditor from './StrudelEditor.jsx';
import PatternViz from './PatternViz.jsx';

// Code d'accueil : jouable IMMÉDIATEMENT (▶ Run / Ctrl+Entrée) → gratification directe.
export const STUDIO_DEFAULT = `// 🎛️ Studio — ton bac a sable. Edite puis ▶ Run (Ctrl+Entree).
setcpm(120/4)
$: s("bd*4, ~ hh ~ hh, ~ sd ~")
$: n("0 3 5 7 5 3").scale("C:minor:pentatonic").s("triangle").gain(.55).delay(.3)`;

// Une page vierge (bouton « Vider ») — laisse juste de quoi repartir.
const STUDIO_BLANK = `// Studio libre — tape ton son, puis ▶ Run (Ctrl+Entree).
setcpm(120/4)
$: s("bd hh sd hh")`;

// Starters cliquables : chacun charge un pattern complet et le JOUE tout de suite.
// Tous tiennent dans le moteur vendorisé (samples par défaut + synthés).
const STARTERS = [
  {
    key: 'house',
    label: 'House',
    hint: 'pulsation 4/4 + charley',
    code: `setcpm(124/4)
$: s("bd*4")
$: s("~ hh ~ hh").gain(.7)
$: s("~ cp").room(.2)
$: note("c2 c2 g1 c2").s("sawtooth").lpf(700).gain(.6)`,
  },
  {
    key: 'breaks',
    label: 'Breakbeat',
    hint: 'batterie cassée + basse',
    code: `setcpm(92/4)
$: s("bd ~ sd bd, ~ ~ sd ~, hh*8?").bank("RolandTR909").gain(.9)
$: note("c2 ~ eb2 g2").s("sawtooth").lpf(600).lpenv(2).gain(.5)`,
  },
  {
    key: 'acid',
    label: 'Acid',
    hint: 'basse TB-303 filtrée',
    code: `setcpm(128/4)
$: s("bd*4").gain(.9)
$: note("c2 c3 eb2 c2 g2 eb2 c2 bb1")
   .s("sawtooth")
   .lpf(sine.range(300,1800).slow(4))
   .lpenv(3).resonance(12).gain(.5)`,
  },
  {
    key: 'penta',
    label: 'Mélodie',
    hint: 'gamme pentatonique + écho',
    code: `setcpm(104/4)
$: n("0 2 4 7 4 2 0 -3".add("<0 3>"))
   .scale("C:minor:pentatonic")
   .s("triangle").gain(.6).delay(.4).delaytime(.16).room(.3)`,
  },
  {
    key: 'ambient',
    label: 'Ambient',
    hint: 'nappe lente + réverb',
    code: `setcpm(60/4)
$: note("<c3 eb3 g3 bb3>")
   .s("sawtooth").lpf(600).attack(1).release(2)
   .gain(.5).room(.8).slow(2)
$: s("~ ~ ~ hh").gain(.25).room(.6)`,
  },
  {
    key: 'techno',
    label: 'Techno',
    hint: 'sombre & hypnotique',
    code: `setcpm(132/4)
$: s("bd*4").gain(1)
$: s("hh*8").gain(.35)
$: s("~ ~ cp ~").room(.3)
$: note("c1!8").s("sawtooth").lpf(perlin.range(200,900).slow(8)).gain(.6)`,
  },
];

// Lit le BPM d'un code (convention 4/4 → setcpm(BPM/4)). null si absent.
function readBpm(code) {
  const m = /setcpm\(\s*([\d.]+)\s*\/\s*4\s*\)/.exec(code || '');
  if (m) return Math.round(parseFloat(m[1]));
  const c = /setcps\(\s*([\d.]+)\s*\)/.exec(code || '');
  if (c) return Math.round(parseFloat(c[1]) * 240);
  return null;
}

export default function Studio({
  initialCode,
  piStatus,
  onOpenSati,
  onSaveSnippet,
  onOpenInStrudel,
  onDownload,
  onEditorReady,
  onPersist,
  onClose,
  theme,
  reduceMotion,
}) {
  const edRef = useRef(null);
  const persistRef = useRef(onPersist);
  persistRef.current = onPersist;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [bootError, setBootError] = useState(null);
  const [tempo, setTempo] = useState(() => readBpm(initialCode) || 120);
  const [vizOn, setVizOn] = useState(false);
  const [toast, setToast] = useState('');

  const startCode = useRef(initialCode || STUDIO_DEFAULT);

  // Lecture du code live (ce que Felix a tapé), repli sur l'état CodeMirror.
  const readLiveCode = useCallback(() => {
    const ed = edRef.current;
    let code = '';
    try { if (ed && typeof ed.code === 'string') code = ed.code; } catch { /* ignore */ }
    if (!code) {
      try { code = (ed && ed.editor && ed.editor.state.doc.toString()) || ''; } catch { /* ignore */ }
    }
    return code || startCode.current || '';
  }, []);

  const flashToast = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(flashToast._t);
    flashToast._t = window.setTimeout(() => setToast(''), 2200);
  }, []);

  const handleReady = useCallback((ed) => {
    edRef.current = ed;
    setReady(true);
    try { onEditorReady && onEditorReady(ed); } catch { /* non bloquant */ }
  }, [onEditorReady]);

  const handleBootError = useCallback(() => {
    setBootError("Le moteur Strudel n'a pas pu se charger. Relance l'app via start.bat.");
  }, []);

  const run = useCallback(async () => {
    const ed = edRef.current;
    if (!ed) return;
    try {
      await ed.evaluate();
      setBootError(null);
      try { persistRef.current && persistRef.current(readLiveCode()); } catch { /* ignore */ }
    } catch {
      setBootError("Le son n'a pas pu démarrer. Reclique sur Run.");
    }
  }, [readLiveCode]);

  const stop = useCallback(async () => {
    const ed = edRef.current;
    if (!ed) return;
    try { await ed.stop(); } catch { /* ignore */ }
  }, []);

  // Charge un pattern et le JOUE tout de suite (low-friction). Ordre : stop → setCode → evaluate.
  const loadAndPlay = useCallback(async (code, label) => {
    const ed = edRef.current;
    if (!ed) return;
    setEvalError(null);
    try { await ed.stop(); } catch { /* ignore */ }
    try { ed.setCode(code); } catch { /* ignore */ }
    const bpm = readBpm(code);
    if (bpm) setTempo(bpm);
    try { await ed.evaluate(); } catch { /* ignore */ }
    try { persistRef.current && persistRef.current(code); } catch { /* ignore */ }
    if (label) flashToast('▶ ' + label);
  }, [flashToast]);

  const clearCode = useCallback(async () => {
    const ed = edRef.current;
    if (!ed) return;
    try { await ed.stop(); } catch { /* ignore */ }
    try { ed.setCode(STUDIO_BLANK); } catch { /* ignore */ }
    setTempo(readBpm(STUDIO_BLANK) || 120);
    setEvalError(null);
    try { persistRef.current && persistRef.current(STUDIO_BLANK); } catch { /* ignore */ }
    flashToast('Page vierge');
  }, [flashToast]);

  const surprise = useCallback(() => {
    const pick = STARTERS[Math.floor(Math.random() * STARTERS.length)];
    loadAndPlay(pick.code, pick.label);
  }, [loadAndPlay]);

  // Tempo : réécrit (ou injecte) la ligne setcpm en tête, puis ré-évalue si ça joue.
  // On ne touche QUE la ligne de tempo en tête → on ne casse pas les .cpm() internes.
  const applyTempo = useCallback((bpm) => {
    const next = Math.max(50, Math.min(200, bpm));
    setTempo(next);
    const ed = edRef.current;
    if (!ed) return;
    let code = readLiveCode();
    code = code.replace(/^\s*setc(?:pm|ps)\([^\n)]*\)\s*;?\s*\n?/, '');
    code = `setcpm(${next}/4)\n` + code;
    try { ed.setCode(code); } catch { /* ignore */ }
    try { persistRef.current && persistRef.current(code); } catch { /* ignore */ }
    if (playing) { try { ed.evaluate(); } catch { /* ignore */ } }
  }, [playing, readLiveCode]);

  // Persiste + coupe le son à la fermeture du Studio (cleanup unique au démontage).
  useEffect(() => {
    return () => {
      try { persistRef.current && persistRef.current(readLiveCode()); } catch { /* ignore */ }
      const ed = edRef.current;
      if (ed) { try { ed.stop(); } catch { /* ignore */ } }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(async () => {
    try {
      const ok = await (onSaveSnippet ? onSaveSnippet(readLiveCode()) : false);
      flashToast(ok ? '✓ Gardé dans ta bibliothèque' : 'Sauvegarde indisponible ici');
    } catch {
      flashToast('Sauvegarde indisponible ici');
    }
  }, [onSaveSnippet, readLiveCode, flashToast]);

  const piState = (piStatus && piStatus.state) || 'unknown';

  return (
    <div className="studio" role="region" aria-label="Studio — bac à sable Strudel">
      <header className="studio-top">
        <div className="studio-brand">
          <span className="studio-glyph" aria-hidden="true">◉</span>
          <div className="studio-id">
            <p className="kicker">Studio · faire du son</p>
            <h1 className="studio-title">Ton bac à sable</h1>
          </div>
        </div>

        <div className="studio-top-actions">
          <button
            className={'sati-btn status-' + piState}
            onClick={onOpenSati}
            aria-haspopup="dialog"
            title="Ouvrir Sati (ton guide IA) — elle voit ton code du Studio"
          >
            <span className="sati-dot" aria-hidden="true" />
            Sati
          </button>
          <button className="studio-close" onClick={onClose} title="Retour aux leçons (Échap)">
            ✕ Fermer le Studio
            <span className="studio-kbd" aria-hidden="true">Échap</span>
          </button>
        </div>
      </header>

      <div className="studio-body">
        <section className="studio-editor-block">
          <div className="editor-frame studio-frame">
            <StrudelEditor
              initialCode={startCode.current}
              fontSize={20}
              onReady={handleReady}
              onPlayingChange={setPlaying}
              onError={handleBootError}
              onEvalError={setEvalError}
            />
          </div>

          <div className="controls studio-controls">
            <button className="btn run" onClick={run} disabled={!ready} aria-keyshortcuts="Control+Enter">
              <span className="btn-main">▶ Run</span>
              <span className="btn-kbd">Ctrl + Enter</span>
            </button>
            <button className="btn stop" onClick={stop} disabled={!ready} aria-keyshortcuts="Control+.">
              <span className="btn-main">■ Stop</span>
              <span className="btn-kbd">Ctrl + .</span>
            </button>
            <span className={'status ' + (playing ? 'on' : 'off')} role="status" aria-live="polite">
              <span className="dot" aria-hidden="true" />
              {playing ? 'en cours' : 'arrêté'}
            </span>

            <div className="studio-tempo" role="group" aria-label="Tempo">
              <button className="studio-tempo-btn" onClick={() => applyTempo(tempo - 5)} disabled={!ready} aria-label="Ralentir">−</button>
              <span className="studio-tempo-val"><b>{tempo}</b> BPM</span>
              <button className="studio-tempo-btn" onClick={() => applyTempo(tempo + 5)} disabled={!ready} aria-label="Accélérer">+</button>
            </div>

            <button
              className={'btn viz-toggle' + (vizOn ? ' on' : '')}
              onClick={() => setVizOn((v) => !v)}
              aria-pressed={vizOn}
              title="Afficher/masquer la grille rythmique animée"
            >
              ◫ Visualiseur
            </button>
          </div>

          {vizOn && (
            <PatternViz
              editorRef={edRef}
              playing={playing}
              theme={theme}
              reduceMotion={reduceMotion}
              onClose={() => setVizOn(false)}
            />
          )}

          {!ready && !bootError && <p className="hint loading">Chargement du moteur Strudel…</p>}
          {bootError && <p className="hint err">{bootError}</p>}

          {evalError && (
            <div className="eval-error" role="alert">
              <span className="eval-error-tag" aria-hidden="true">erreur</span>
              <code className="eval-error-msg">{evalError}</code>
            </div>
          )}

          <div className="share-row studio-share">
            <button className="share-btn" onClick={save} title="Garder ce pattern dans ta bibliothèque">
              ☆ Sauvegarder
            </button>
            <button className="share-btn" onClick={() => onOpenInStrudel && onOpenInStrudel(readLiveCode())} title="Ouvrir dans le REPL officiel strudel.cc">
              ↗ Ouvrir dans Strudel
            </button>
            <button className="share-btn" onClick={() => onDownload && onDownload(readLiveCode())} title="Télécharger ce code en .js">
              ⤓ Télécharger .js
            </button>
            <button className="share-btn" onClick={clearCode} title="Repartir d'une page vierge">
              ⟲ Vider
            </button>
            {toast && <span className="share-msg" role="status">{toast}</span>}
          </div>
        </section>

        <aside className="studio-side">
          <div className="studio-panel">
            <div className="studio-panel-head">
              <h2>Démarrage rapide</h2>
              <button className="studio-surprise" onClick={surprise} disabled={!ready} title="Charger un pattern au hasard et le jouer">
                🎲 Surprends-moi
              </button>
            </div>
            <p className="studio-panel-sub">Un clic = ça charge et ça joue. Édite ensuite à ta guise.</p>
            <div className="studio-starters">
              {STARTERS.map((s) => (
                <button
                  key={s.key}
                  className="studio-starter"
                  onClick={() => loadAndPlay(s.code, s.label)}
                  disabled={!ready}
                >
                  <span className="studio-starter-label">{s.label}</span>
                  <span className="studio-starter-hint">{s.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="studio-panel studio-cheats">
            <h2>Aide-mémoire</h2>
            <ul className="studio-cheatlist">
              <li><code>s("bd hh sd hh")</code> batterie</li>
              <li><code>note("c e g")</code> hauteur</li>
              <li><code>n("0 2 4").scale("C:major")</code> gamme</li>
              <li><code>.gain(.6) .lpf(800) .room(.4)</code> son</li>
              <li><code>stack(a, b)</code> / <code>$:</code> superposer</li>
              <li><code>.slow(2) .fast(2) .rev</code> temps</li>
            </ul>
            <p className="studio-cheat-foot">
              <kbd>Ctrl</kbd>+<kbd>Entrée</kbd> jouer · <kbd>Ctrl</kbd>+<kbd>.</kbd> stop ·
              {' '}<button className="studio-link" onClick={onOpenSati}>demande à Sati ↗</button>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
