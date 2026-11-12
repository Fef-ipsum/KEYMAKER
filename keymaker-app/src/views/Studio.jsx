// Studio — « je veux juste faire du son ». Aucun exercice, aucune progression.
// Le code est conservé d'une session à l'autre (même clé que l'ancienne app).

import { useEffect, useState } from 'react';
import * as dock from '../lib/dock.js';
import * as engine from '../lib/engine.js';
import { readText, writeText } from '../lib/store.js';
import { loadSnippets, deleteSnippet, addSnippet } from '../lib/notebook.js';
import { go, pickDefi, readFlow, advanceFlow, DEFIS } from '../lib/app.js';
import { Icon, Rich, PageHead, Fold } from '../ui.jsx';

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
