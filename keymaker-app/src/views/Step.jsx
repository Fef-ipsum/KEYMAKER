// Une étape. Toujours la même forme, dans le même ordre :
//   Écoute → (▶) → Ce que tu entends → À toi → le code → le résultat sous ▶ → Creuser
//
// Mise en page : la tête (v-head), le milieu (v-mid : ce qu'on entend + la consigne),
// l'éditeur, puis le reste (v-body). Au téléphone, ces blocs s'empilent dans cet
// ordre : la consigne est juste au-dessus du code. Sur grand écran, l'éditeur est à droite.
// Le résultat de l'exercice s'affiche DANS le bloc de l'éditeur, juste sous ▶ (portail).

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as dock from '../lib/dock.js';
import { runCheck } from '../lib/check.js';
import { markSeen, markDone, setResume, isDone, readState } from '../lib/progress.js';
import { markPracticed } from '../lib/srs.js';
import { go, neighbours, stepRoute, readFlow, advanceFlow, refreshProgress } from '../lib/app.js';
import { stepIndex, solutions } from '../content/registry.js';
import { loadNote, saveNote } from '../lib/notebook.js';
import { Icon, Rich, Fold, WikiChip, chime, useDockSlot, revealOnNarrow } from '../ui.jsx';

// Où mène « la suite » depuis cette étape (session en cours, étape suivante, point d'étape…).
function useForward(stepId, chapter) {
  const { prev, next } = neighbours(stepId);
  const flow = readFlow();
  const inFlow = flow && !flow.done && flow.items[flow.index] && flow.items[flow.index].id === stepId;
  const goForward = () => {
    if (inFlow) return go(advanceFlow());
    if (next) return go(stepRoute(next.id));
    if (chapter.kind === 'fondations') return go('#/point/' + chapter.id);
    return go('#/parcours');
  };
  const label = inFlow ? 'Suite de la session' : next ? 'Étape suivante' : chapter.kind === 'fondations' ? 'Point d’étape du chapitre' : 'Retour au parcours';
  return { prev, label, goForward };
}

function NavRow({ stepId, done, chapter }) {
  const { prev, label, goForward } = useForward(stepId, chapter);
  return (
    <nav className="steprow" aria-label="Navigation entre les étapes">
      {prev ? (
        <button type="button" className="btn btn-quiet" onClick={() => go(stepRoute(prev.id))}>
          <Icon name="prev" size={18} /> Précédente
        </button>
      ) : <span />}
      <button type="button" className="btn btn-quiet" onClick={goForward}>
        {done ? label : 'Passer'} <Icon name="next" size={18} />
      </button>
    </nav>
  );
}

/* --- Le résultat, affiché sous ▶ ----------------------------------------------------- */
function StepResult({ step, chapter, played, done, res, tries, reduceMotion }) {
  const slot = useDockSlot();
  const ref = useRef(null);
  const { label, goForward } = useForward(step.id, chapter);
  const solution = solutions[step.id];
  useEffect(() => {
    if (ref.current && (done || res)) ref.current.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [done, res]);
  if (!slot || !played) return null;
  let body;
  if (done) {
    body = (
      <div className="res res-ok" role="status">
        <p><Icon name="check" size={18} /> <Rich text={step.task.ok} /></p>
        <button type="button" className="btn btn-primary" onClick={goForward}>
          {label} <Icon name="next" size={18} />
        </button>
      </div>
    );
  } else if (res && res.kind === 'syntax') {
    body = <p className="res res-hint" role="status">Ton code a une faute de frappe : le message rouge juste au-dessus dit où. Je vérifie dès qu’elle est corrigée.</p>;
  } else if (res && res.kind === 'hint') {
    body = (
      <p className="res res-hint" role="status">
        <Rich text={res.hint || 'Pas encore. Relis la consigne « À toi », change le code, puis relance.'} />
      </p>
    );
  } else {
    body = <p className="res res-wait">À toi de jouer : suis la consigne « À toi », puis touche ▶ Relancer. Je vérifie tout seul.</p>;
  }
  return createPortal(
    <div className="res-wrap" ref={ref}>
      {body}
      {!done && tries >= 2 && solution ? (
        <button type="button" className="linkbtn" onClick={() => dock.loadCode(solution)}>Voir une solution</button>
      ) : null}
    </div>,
    slot,
  );
}

/* --- Étape des fondations ------------------------------------------------------------ */
function FondationStep({ entry, settings, reduceMotion }) {
  const { step, chapter, index } = entry;
  const [played, setPlayed] = useState(false);
  const [res, setRes] = useState(null); // { kind: 'neutral' | 'hint' | 'syntax', hint }
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(() => isDone(step.id));
  const playedRef = useRef(false);
  const chimeOn = useRef(settings.chime);
  chimeOn.current = settings.chime;

  useEffect(() => {
    const already = isDone(step.id, readState());
    playedRef.current = already;
    setPlayed(already);
    setRes(null);
    setTries(0);
    setDone(already);
    markSeen(step.id);
    setResume(stepRoute(step.id), chapter.roman + ' · ' + step.title);
    // Première lecture. Au téléphone : si l'exercice n'est pas encore réussi, on montre ce
    // qu'on vient d'entendre et la consigne (juste au-dessus du code) ; s'il l'est déjà,
    // c'est le résultat, sous ▶, qui reste à l'écran.
    const firstPlay = (validated) => {
      if (playedRef.current) return;
      playedRef.current = true;
      setPlayed(true);
      if (!validated) revealOnNarrow('.v-mid', reduceMotion);
    };
    dock.claim({
      key: 'step:' + step.id,
      code: step.code,
      onRan: (ctx) => {
        const r = runCheck(step.task && step.task.check, ctx);
        firstPlay(r.ok);
        if (r.ok) {
          if (!isDone(step.id)) {
            markDone(step.id);
            markPracticed(step.id);
            if (chimeOn.current) chime();
          }
          setDone(true);
          setRes(null);
          refreshProgress();
          return;
        }
        if (!ctx.changed) {
          // Le code de départ, juste écouté : pas de reproche, pas d'indice.
          setRes({ kind: 'neutral' });
          return;
        }
        setRes({ kind: 'hint', hint: r.hint });
        setTries((t) => t + 1);
      },
      onError: () => {
        firstPlay(false);
        setRes({ kind: 'syntax' });
        setTries((t) => t + 1);
      },
    });
    window.scrollTo({ top: 0 });
    return () => dock.release('step:' + step.id);
  }, [step.id]);

  const deep = step.deep || {};
  return (
    <>
      <section className="v-head">
        <div className="crumbs">
          <button type="button" className="linkbtn" onClick={() => go('#/parcours')}>Parcours</button>
          <span>·</span>
          <span>Chapitre {chapter.roman} — {chapter.title}</span>
          <span className="crumbs-n">{index + 1} / {chapter.steps.length}</span>
        </div>
        <h1>{step.title}</h1>
        <div className="moment">
          <div className="moment-label"><Icon name="ear" size={16} /> Écoute</div>
          <Rich as="p" text={step.listen} />
        </div>
      </section>

      <section className="v-mid">
        {played ? (
          <>
            <div className="moment moment-name">
              <div className="moment-label">Ce que tu entends</div>
              <Rich as="p" text={step.name} />
            </div>
            {step.task ? (
              <div className={'task' + (done ? ' is-done' : '')}>
                <div className="moment-label">À toi</div>
                <Rich as="p" text={step.task.text} />
              </div>
            ) : null}
          </>
        ) : (
          <p className="waiting">Appuie sur ▶ pour écouter.</p>
        )}
      </section>

      <StepResult step={step} chapter={chapter} played={played} done={done} res={res} tries={tries} reduceMotion={reduceMotion} />

      <section className="v-body">
        {played ? (
          <Fold title="Creuser" hint="le pourquoi, pas à pas">
            {deep.why ? <Rich as="p" text={deep.why} /> : null}
            {deep.decode && deep.decode.length ? (
              <dl className="decode">
                {deep.decode.map((d, i) => (
                  <div key={i} className="decode-row">
                    <dt>{d[2] ? <WikiChip id={d[2]} label={d[0]} /> : <code>{d[0]}</code>}</dt>
                    <dd><Rich text={d[1]} /></dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {deep.wiki && deep.wiki.length ? (
              <div className="seealso">
                <div className="moment-label">Dans le wiki</div>
                <div className="chips">{deep.wiki.map((id) => <WikiChip key={id} id={id} />)}</div>
              </div>
            ) : null}
          </Fold>
        ) : null}

        <NavRow stepId={step.id} done={done} chapter={chapter} />
      </section>
    </>
  );
}

/* --- Étape d'approfondissement (anciens modules) -------------------------------------- */
function Note({ noteKey }) {
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    setLoaded(false);
    loadNote(noteKey).then((t) => {
      if (alive) {
        setText(t || '');
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [noteKey]);
  if (!loaded) return null;
  return (
    <div className="mynote">
      <label htmlFor={'note-' + noteKey}><Icon name="note" size={16} /> Ma note</label>
      <textarea id={'note-' + noteKey} value={text} rows={2} placeholder="Une astuce à retenir, avec tes mots." onChange={(e) => setText(e.target.value)} onBlur={() => saveNote(noteKey, text)} />
    </div>
  );
}

function LegacyStep({ entry, settings }) {
  const { step, chapter, index } = entry;
  const [done, setDone] = useState(() => isDone(step.id));

  useEffect(() => {
    setDone(isDone(step.id, readState()));
    markSeen(step.id);
    setResume(stepRoute(step.id), chapter.trackTitle + ' · ' + step.title);
    dock.claim({ key: 'step:' + step.id, code: step.code, onRan: () => {} });
    window.scrollTo({ top: 0 });
    return () => dock.release('step:' + step.id);
  }, [step.id]);

  const validate = () => {
    markDone(step.id);
    markPracticed(step.id);
    if (settings.chime) chime();
    setDone(true);
    refreshProgress();
  };

  return (
    <>
      <section className="v-head">
        <div className="crumbs">
          <button type="button" className="linkbtn" onClick={() => go('#/parcours')}>Parcours</button>
          <span>·</span>
          <span>{chapter.trackTitle} — {chapter.title}</span>
          <span className="crumbs-n">{index + 1} / {chapter.steps.length}</span>
        </div>
        <h1>{step.title}</h1>
        <div className="moment">
          <div className="moment-label"><Icon name="ear" size={16} /> Écoute</div>
          <Rich as="p" text={step.listen} />
        </div>
      </section>

      <section className="v-mid">
        {step.exercise ? (
          <div className={'task' + (done ? ' is-done' : '')}>
            <div className="moment-label">À toi</div>
            <p>{step.exercise}</p>
            {done ? (
              <p className="task-ok" role="status"><Icon name="check" size={18} /> Noté comme fait.</p>
            ) : (
              <button type="button" className="btn btn-primary" onClick={validate}><Icon name="check" size={18} /> C’est fait</button>
            )}
          </div>
        ) : null}
      </section>

      <section className="v-body">
        {step.decode.length ? (
          <Fold title="Ce que fait chaque élément du code" defaultOpen>
            <dl className="decode">
              {step.decode.map((d, i) => (
                <div key={i} className="decode-row">
                  <dt><code>{d[0]}</code></dt>
                  <dd>{d[1]}</dd>
                </div>
              ))}
            </dl>
          </Fold>
        ) : null}

        {step.theory ? (
          <Fold title={step.theory.title || 'Le vocabulaire'}>
            <dl className="decode">
              {step.theory.items.map((d, i) => (
                <div key={i} className="decode-row">
                  <dt><strong>{d[0]}</strong></dt>
                  <dd>{d[1]}</dd>
                </div>
              ))}
            </dl>
          </Fold>
        ) : null}

        {step.recap ? (
          <Fold title={step.recap.title || 'Récapitulatif du chapitre'}>
            <div className="tablewrap">
              <table className="recap">
                <thead><tr>{step.recap.columns.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
                <tbody>{step.recap.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </Fold>
        ) : null}

        {step.free ? <p className="free"><strong>Pour aller plus loin.</strong> {step.free}</p> : null}
        {step.culture ? (
          <p className="culture"><strong>À écouter.</strong> {step.culture.artist} — {step.culture.track} : {step.culture.why}</p>
        ) : null}

        <Note noteKey={step.noteKey} />
        <NavRow stepId={step.id} done={done || !step.exercise} chapter={chapter} />
      </section>
    </>
  );
}

export default function Step({ id, settings, reduceMotion }) {
  const entry = stepIndex.get(id);
  if (!entry) {
    return (
      <section className="v-body">
        <h1>Étape introuvable</h1>
        <p>Cette étape n’existe pas (ou plus).</p>
        <button type="button" className="btn btn-primary" onClick={() => go('#/parcours')}>Voir le parcours</button>
      </section>
    );
  }
  return entry.step.isLegacy ? <LegacyStep entry={entry} settings={settings} /> : <FondationStep entry={entry} settings={settings} reduceMotion={reduceMotion} />;
}
