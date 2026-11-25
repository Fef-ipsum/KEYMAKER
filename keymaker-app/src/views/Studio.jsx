// Studio — « je veux juste faire du son ». Aucun exercice, aucune progression.
// Le code est conservé d'une session à l'autre (même clé que l'ancienne app).

import { useEffect, useRef, useState } from 'react';
import * as dock from '../lib/dock.js';
import * as engine from '../lib/engine.js';
import { readText, writeText } from '../lib/store.js';
import { loadSnippets, deleteSnippet, addSnippet } from '../lib/notebook.js';
import { go, pickDefi, readFlow, advanceFlow, DEFIS, useEngine } from '../lib/app.js';
import { Icon, Rich, PageHead, Fold } from '../ui.jsx';
import { record, recordingSupported, webmType, cpsOfCode, arrangeCycles, RecordError } from '../lib/record.js';
import { frNum } from '../schemas/core/format.js';

const STUDIO_KEY = 'keymaker:studio:code';

// Points de départ originaux : un clic charge et joue.
const STARTERS = [
  { label: 'Techno', code: `setcpm(135/4)\n\n$: sound("bd*4").bank("RolandTR909").distort(1)\n\n$: sound("[~ oh]*4").bank("RolandTR909").gain(.45)\n\n$: note("[~ c1 c1 <c1 eb1>]*4").sound("sawtooth").lpf(320).decay(.1).sustain(0)` },
  { label: 'Acid', code: `setcpm(126/4)\n\n$: sound("bd*4, [~ oh]*4, ~ cp ~ cp").bank("RolandTR909").gain(.8)\n\n$: note("c2 c2 c3 c2 ~ c2 eb2 c3 c2 ~ c2 c3 bb1 c2 ~ c2").sound("sawtooth")\n  .lpf(sine.range(250, 1800).slow(8)).lpq(15).lpenv(3).lpd(.12).decay(.15).sustain(0).gain(.6)` },
  { label: 'Trance', code: `setcpm(138/4)\n\nconst grille = chord("<Am F C G>")\n\n$: sound("bd*4, [~ oh]*4").bank("RolandTR909").gain(.8)\n\n$: grille.rootNotes(1).struct("[~ x]*4").sound("sawtooth").lpf(500).decay(.15).sustain(0)\n\n$: grille.voicing().arp("[0 2 1 3 2 3 1 2]*2").sound("sawtooth")\n  .lpf(2500).decay(.12).sustain(0).delay(.4).delaysync(3/16).gain(.5)` },
  { label: 'Synth-pop', code: `setcpm(112/4)\n\nconst grille = chord("<Am F C G>")\n\n$: sound("bd ~ ~ bd ~ ~ bd ~, ~ sd ~ sd, hh*8").bank("AkaiLinn").gain(.8)\n\n$: grille.rootNotes(1).struct("x*8").add(note("[0 12]*4")).sound("sawtooth").lpf(700).decay(.18).sustain(0)\n\n$: grille.voicing().sound("sawtooth").lpf(1500).attack(.05).release(.3).gain(.3)` },
  { label: 'Piano', code: `setcpm(80/4)\n\n$: chord("<Am F C G>").voicing().sound("piano").room(.5)\n\n$: n("<[4 ~ 4 2] [2 ~ 0 ~] [4 ~ 4 6] [4 2 1 ~]>").scale("A4:minor").sound("piano").room(.5).gain(.8)` },
  { label: 'Page blanche', code: `setcpm(120/4)\n\n$: sound("bd*4")\n` },
];

export default function Studio({ defi }) {
  const [snips, setSnips] = useState([]);
  const [challenge, setChallenge] = useState(null);
  const [notice, setNotice] = useState('');
  const refresh = () => loadSnippets().then(setSnips);

  // Avant de remplacer le code du Studio, on le range dans « Mes codes gardés »,
  // s'il est à toi (ni un modèle, ni un défi, ni déjà gardé) : rien ne se perd.
  const stashDraft = async (prev, next) => {
    const p = String(prev || '').trim();
    if (!p || p === String(next || '').trim()) return;
    if (STARTERS.some((s) => s.code.trim() === p) || DEFIS.some((d) => d.code.trim() === p)) return;
    const list = await loadSnippets();
    if (list.some((s) => String(s.code).trim() === p)) return;
    const d = new Date();
    const name = 'Brouillon du ' + d.toLocaleDateString('fr-CH', { day: 'numeric', month: 'numeric' }) + ' à ' + d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
    if (await addSnippet({ name, code: prev, module: null })) {
      refresh();
      setNotice('Ton code précédent est rangé dans « Mes codes gardés ».');
      setTimeout(() => setNotice(''), 4000);
    }
  };

  useEffect(() => {
    const saved = readText(STUDIO_KEY, '');
    const incoming = readText('km2:studio:incoming', '');
    if (incoming) {
      writeText('km2:studio:incoming', '');
      stashDraft(saved, incoming);
      writeText(STUDIO_KEY, incoming);
    }
    const code = incoming || saved || STARTERS[0].code;
    dock.claim({ key: 'studio', code, fresh: !!incoming, onRan: () => writeText(STUDIO_KEY, engine.getCode()) });
    refresh();
    const onSnips = () => refresh();
    window.addEventListener('km2:snippets', onSnips);
    window.scrollTo({ top: 0 });
    return () => {
      window.removeEventListener('km2:snippets', onSnips);
      const current = engine.isPreviewing() ? null : engine.getCode();
      if (current && current !== '// LOADING') writeText(STUDIO_KEY, current);
      dock.release('studio');
    };
  }, []);

  useEffect(() => {
    if (defi) setChallenge(pickDefi(Math.floor(Math.random() * DEFIS.length)));
  }, [defi]);

  const load = async (code, play) => {
    await stashDraft(engine.getCode(), code);
    dock.loadCode(code, { play });
    writeText(STUDIO_KEY, code);
  };
  const flow = readFlow();
  const inFlow = flow && !flow.done && flow.items[flow.index] && flow.items[flow.index].type === 'defi';

  return (
    <>
      <section className="v-head">
        <PageHead kicker="Studio" title="Juste faire du son" lead="Pas de consigne, pas de vérification. Ton code reste là d’une fois sur l’autre." />
        <div className="starters" aria-label="Points de départ">
          {STARTERS.map((s) => (
            <button type="button" key={s.label} className="starter" onClick={() => load(s.code, true)}>{s.label}</button>
          ))}
        </div>
      </section>
      <section className="v-body">
        {notice ? <div className="toast" role="status">{notice}</div> : null}
        {challenge ? (
          <div className="task">
            <div className="moment-label">Défi libre</div>
            <p><strong>{challenge.title}.</strong> <Rich text={challenge.brief} /></p>
            <div className="chips">
              <button type="button" className="btn btn-quiet" onClick={() => load(challenge.code, true)}>Charger le point de départ</button>
              <button type="button" className="btn btn-quiet" onClick={() => setChallenge(pickDefi(DEFIS.indexOf(challenge) + 1))}>Un autre défi</button>
              {inFlow ? <button type="button" className="btn btn-primary" onClick={() => go(advanceFlow())}>Terminer la session <Icon name="next" size={18} /></button> : null}
            </div>
          </div>
        ) : (
          <button type="button" className="quietline" onClick={() => setChallenge(pickDefi())}>
            <Icon name="genres" size={18} /><span>Pas d’idée ? Un défi libre</span><Icon name="next" size={18} />
          </button>
        )}
        <button type="button" className="quietline" onClick={() => go('#/defi')}>
          <Icon name="check" size={18} /><span>Un défi vérifié : une consigne précise, l’app contrôle ton code</span><Icon name="next" size={18} />
        </button>

        <Recorder />

        <h2 className="section-title">Mes codes gardés</h2>
        {snips.length ? (
          <ul className="snips">
            {snips.map((s) => (
              <li key={s.id} className="snip">
                <button type="button" className="snip-main" onClick={() => load(s.code, false)}>
                  <span className="snip-name">{s.name}</span>
                  <span className="snip-code">{String(s.code).split('\n').find((l) => l.trim() && !/^setcp|^\/\//.test(l.trim())) || ''}</span>
                </button>
                <button type="button" className="iconbtn" aria-label={'Supprimer ' + s.name} onClick={async () => { if (window.confirm('Supprimer « ' + s.name + ' » ? Cette action est définitive.')) { await deleteSnippet(s.id); refresh(); } }}>
                  <Icon name="trash" size={18} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">Rien pour l’instant. Le bouton <Icon name="keep" size={16} /> sous l’éditeur garde le code en cours.</p>
        )}

        <Fold title="Sortir le code de l’app">
          <div className="chips">
            <button type="button" className="btn btn-quiet" onClick={() => {
              const blob = new Blob([engine.getCode()], { type: 'text/javascript' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'keymaker.js';
              a.click();
              setTimeout(() => URL.revokeObjectURL(a.href), 2000);
            }}><Icon name="download" size={18} /> Télécharger en fichier</button>
            <button type="button" className="btn btn-quiet" onClick={() => {
              const b64 = btoa(unescape(encodeURIComponent(engine.getCode())));
              window.open('https://strudel.cc/#' + encodeURIComponent(b64), '_blank', 'noopener');
            }}><Icon name="open" size={18} /> Ouvrir dans strudel.cc (en ligne)</button>
          </div>
        </Fold>
      </section>
    </>
  );
}

/* --- Enregistrer le son ------------------------------------------------------------ */
const LENGTHS = [4, 8, 16, 32];
const secs = (x) => frNum(Math.round(x * 10) / 10) + ' s';
function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `keymaker-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function Recorder() {
  const eng = useEngine();
  const [cycles, setCycles] = useState(8);
  const [piece, setPiece] = useState(false); // tout le morceau arrange, depuis son début
  const [format, setFormat] = useState('wav');
  const [busy, setBusy] = useState(null); // { done, total }
  const [result, setResult] = useState(null); // { url, name, seconds, cycles, size, peak }
  const [error, setError] = useState('');
  const abort = useRef(null);
  useEffect(() => () => { if (abort.current) abort.current.abort(); }, []);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);
  if (!recordingSupported() && eng.ready) return null;
  const cps = eng.playing ? engine.currentCps() : cpsOfCode(engine.getCode());
  const compressed = webmType();
  const pieceLen = arrangeCycles(engine.getCode());
  const start = async () => {
    setError('');
    setResult(null);
    const ctl = new AbortController();
    abort.current = ctl;
    // Le morceau : sa longueur est relue dans le code au moment d'enregistrer.
    const whole = piece ? arrangeCycles(engine.getCode()) : null;
    if (piece && !whole) {
      setPiece(false);
      setError('Le code n’a plus de morceau `arrange` lisible : choisis un nombre de cycles.');
      return;
    }
    const n = whole || cycles;
    setBusy({ done: 0, total: cps ? n / cps : 0 });
    try {
      const r = await record({ cycles: n, format, fromStart: !!whole, signal: ctl.signal, onProgress: (done, total) => setBusy({ done, total }) });
      setResult({ url: URL.createObjectURL(r.blob), name: stamp() + '.' + r.ext, seconds: r.seconds, cycles: r.cycles, size: r.blob.size, peak: r.peak });
    } catch (e) {
      setError(e instanceof RecordError ? e.message : 'L’enregistrement a échoué : ' + (e && e.message ? e.message : String(e)));
    } finally {
      abort.current = null;
      setBusy(null);
    }
  };
  return (
    <section className="task rec" aria-label="Enregistrer le son">
      <div className="moment-label">Enregistrer le son</div>
      <p className="task-note">L’enregistrement commence au début d’un cycle et dure un nombre entier de cycles : le fichier peut tourner en boucle dans un autre logiciel. Il contient ce que tu entends, au même volume.</p>
      <div className="rec-row">
        <span className="rec-label">Longueur</span>
        <div className="seg">
          {LENGTHS.map((n) => (
            <button type="button" key={n} className={'seg-b' + (!piece && cycles === n ? ' is-on' : '')} aria-pressed={!piece && cycles === n} disabled={!!busy} onClick={() => { setCycles(n); setPiece(false); }}>
              {n} cycles{cps ? <span className="rec-sec"> · {secs(n / cps)}</span> : null}
            </button>
          ))}
          {pieceLen ? (
            <button type="button" className={'seg-b' + (piece ? ' is-on' : '')} aria-pressed={piece} disabled={!!busy} onClick={() => setPiece(true)}>
              Le morceau entier · {pieceLen} cycles{cps ? <span className="rec-sec"> · {secs(pieceLen / cps)}</span> : null}
            </button>
          ) : null}
        </div>
      </div>
      <div className="rec-row">
        <span className="rec-label">Format</span>
        <div className="seg">
          <button type="button" className={'seg-b' + (format === 'wav' ? ' is-on' : '')} aria-pressed={format === 'wav'} disabled={!!busy} onClick={() => setFormat('wav')}>WAV</button>
          {compressed ? <button type="button" className={'seg-b' + (format === 'webm' ? ' is-on' : '')} aria-pressed={format === 'webm'} disabled={!!busy} onClick={() => setFormat('webm')}>{/mp4/.test(compressed) ? 'M4A' : 'WebM'}</button> : null}
        </div>
      </div>
      {piece && pieceLen ? <p className="task-note">Ton code enchaîne des sections avec <code>arrange</code> : la lecture repart de son début (le cycle 0) et s’arrête d’enregistrer après la dernière section.</p> : null}
      <p className="task-note">{format === 'wav'
        ? 'WAV : sans perte et coupé à l’échantillon près, environ 11 Mo par minute.'
        : 'Compressé : plus de dix fois plus léger, mais le début et la fin peuvent tomber à quelques centièmes de seconde du cycle.'}</p>
      {busy ? (
        <div className="rec-busy" role="status">
          <span className="rec-dot" aria-hidden="true" />
          <span>Enregistrement : {secs(busy.done)} sur {secs(busy.total)}</span>
          <button type="button" className="btn btn-quiet" onClick={() => abort.current && abort.current.abort()}>Annuler</button>
        </div>
      ) : (
        <div className="chips">
          <button type="button" className="btn btn-primary" disabled={!eng.ready} onClick={start}><Icon name="record" size={18} /> {piece && pieceLen ? 'Rejouer depuis le début et enregistrer' : eng.playing ? 'Enregistrer' : 'Jouer et enregistrer'}</button>
        </div>
      )}
      {busy ? <p className="task-note">Arrêter la lecture annule l’enregistrement. Tu peux modifier le code pendant ce temps : c’est la nouvelle version qui s’enregistre dès que tu la joues.</p> : null}
      {error ? <p className="dock-error" role="alert">{error}</p> : null}
      {result ? (
        <div className="rec-done">
          <p className="toast" role="status">{result.cycles} cycles enregistrés, {secs(result.seconds)}, {frNum(Math.round(result.size / 1e5) / 10)} Mo.{result.peak > 1 ? ' Le son dépasse le niveau maximal par endroits : il sature, dans le fichier comme dans les haut-parleurs. Baisse .gain() pour l’éviter.' : ''}</p>
          <audio controls src={result.url} className="rec-audio" />
          <div className="chips"><a className="btn btn-quiet" href={result.url} download={result.name}><Icon name="download" size={18} /> Télécharger {result.name.split('.').pop().toUpperCase()}</a></div>
        </div>
      ) : null}
    </section>
  );
}
