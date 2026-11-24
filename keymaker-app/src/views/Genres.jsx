// Les genres : un genre est une famille de traits. Pour chaque trait, trois temps :
// l'entendre, le comprendre, le reconstruire. Puis on assemble.
// Tous les genres ont les mêmes huit traits : on peut donc les comparer ligne à ligne.

import { useEffect, useMemo, useRef, useState } from 'react';
import * as dock from '../lib/dock.js';
import * as engine from '../lib/engine.js';
import { markSeen, markDone, setResume, isDone } from '../lib/progress.js';
import { markPracticed, recordQuizResult } from '../lib/srs.js';
import { go, useProgress, shuffled, refreshProgress } from '../lib/app.js';
import { genres, genreById, ASPECTS, traitId, traitOf, families, bpmText } from '../content/genres/index.js';
import { createPortal } from 'react-dom';
import { Icon, Rich, WikiChip, PlayMini, PageHead, Fold, chime, useDockSlot } from '../ui.jsx';

const aspectLabel = (id) => (ASPECTS.find((a) => a.id === id) || {}).label || id;

/* --- Liste des genres ------------------------------------------------------------------ */
export function GenreList() {
  const { state } = useProgress();
  return (
    <section className="v-body">
      <PageHead
        kicker="Genres"
        title="Ce qui fait un genre"
        lead="Un genre n’est pas une case : c’est une famille de traits qui apparaissent souvent ensemble. Chaque genre est présenté par les mêmes huit traits, pour que tu puisses les comparer."
      />
      {families().map((f) => (
        <div key={f.name} className="family">
          <h2 className="section-title">{f.name}</h2>
          <ul className="genrelist">
            {f.genres.map((g) => {
              const n = g.traits.filter((t) => isDone(traitId(g.id, t.aspect), state)).length;
              return (
                <li key={g.id}>
                  <button type="button" className="genrerow" onClick={() => go('#/genre/' + g.id)}>
                    <span className="genrerow-main">
                      <span className="genrerow-name">{g.name}</span>
                      <span className="genrerow-pitch">{g.pitch}</span>
                    </span>
                    <span className="genrerow-meta">{bpmText(g)}<br />{n}/{ASPECTS.length} traits</span>
                    <Icon name="next" size={20} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <button type="button" className="quietline" onClick={() => go('#/comparer')}>
        <Icon name="compare" size={18} />
        <span>Comparer deux genres, trait par trait</span>
        <Icon name="next" size={18} />
      </button>
    </section>
  );
}

/* --- Vue d'ensemble d'un genre ---------------------------------------------------------- */
export function GenreOverview({ id }) {
  const g = genreById[id];
  const { state } = useProgress();
  if (!g) return <Missing />;
  const firstTodo = g.traits.find((t) => !isDone(traitId(g.id, t.aspect), state)) || g.traits[0];
  return (
    <section className="v-body">
      <div className="crumbs"><button type="button" className="linkbtn" onClick={() => go('#/genres')}>Genres</button><span>·</span><span>{g.family}</span></div>
      <PageHead title={g.name} lead={g.pitch}>
        <p className="bpm">{bpmText(g)}</p>
      </PageHead>
      <Rich as="p" text={g.intro} className="prose" />
      <button type="button" className="btn btn-primary" onClick={() => go('#/genre/' + g.id + '/' + firstTodo.aspect)}>
        {isDone(traitId(g.id, g.traits[0].aspect), state) ? 'Continuer : ' : 'Commencer : '}{aspectLabel(firstTodo.aspect)} <Icon name="next" size={18} />
      </button>

      <h2 className="section-title">Les huit traits</h2>
      <ol className="traits">
        {g.traits.map((t) => {
          const done = isDone(traitId(g.id, t.aspect), state);
          return (
            <li key={t.aspect}>
              <button type="button" className={'traitrow' + (done ? ' is-done' : '')} onClick={() => go('#/genre/' + g.id + '/' + t.aspect)}>
                <span className={'ldot lv-' + (done ? 'faite' : 'nouvelle')} />
                <span className="traitrow-main">
                  <span className="traitrow-aspect">{aspectLabel(t.aspect)}</span>
                  <span className="traitrow-title">{t.title}</span>
                </span>
                <Icon name="next" size={18} />
              </button>
            </li>
          );
        })}
        <li>
          <button type="button" className="traitrow traitrow-final" onClick={() => go('#/genre/' + g.id + '/assemblage')}>
            <Icon name="genres" size={18} />
            <span className="traitrow-main"><span className="traitrow-aspect">Assembler</span><span className="traitrow-title">Tous les traits dans un morceau</span></span>
            <Icon name="next" size={18} />
          </button>
        </li>
        {g.caseStudy ? (
          <li>
            <button type="button" className="traitrow traitrow-final" onClick={() => go('#/genre/' + g.id + '/cas')}>
              <Icon name="note" size={18} />
              <span className="traitrow-main"><span className="traitrow-aspect">Étude de cas</span><span className="traitrow-title">{g.caseStudy.title}</span></span>
              <Icon name="next" size={18} />
            </button>
          </li>
        ) : null}
      </ol>

      <h2 className="section-title">Pour l’oreille</h2>
      <ul className="listen">
        {g.listen.map((l, i) => (
          <li key={i}><strong>{l.artist}</strong> — <em>{l.track}</em> : {l.why}</li>
        ))}
      </ul>
      <button type="button" className="quietline" onClick={() => go('#/comparer?a=' + g.id)}>
        <Icon name="compare" size={18} /><span>Comparer {g.name} à un autre genre</span><Icon name="next" size={18} />
      </button>
    </section>
  );
}

/* --- Un trait --------------------------------------------------------------------------- */
function TraitQuiz({ cardId, q }) {
  const order = useMemo(() => shuffled(q.choices, cardId.length * 7919), [q, cardId]);
  const [picked, setPicked] = useState(null);
  useEffect(() => () => engine.endPreview(), []);
  const answered = picked != null;
  return (
    <div className="question question-inline">
      <div className="moment-label">Vérifie ton oreille</div>
      <Rich as="p" text={q.q} className="question-q" />
      {q.type === 'ecoute' ? <div className="question-listen"><PlayMini code={q.code} label="Écouter" /></div> : null}
      <ul className="choices">
        {order.map(([text, orig]) => (
          <li key={orig}>
            <button
              type="button"
              className={'choice' + (!answered ? '' : orig === q.answer ? ' is-right' : orig === picked ? ' is-wrong' : ' is-dim')}
              disabled={answered}
              onClick={() => { setPicked(orig); recordQuizResult(cardId, orig === q.answer); }}
            >
              <Rich text={text} />
            </button>
          </li>
        ))}
      </ul>
      {answered ? <p className={'explain' + (picked === q.answer ? ' is-right' : '')}><strong>{picked === q.answer ? 'C’est ça.' : 'Pas tout à fait.'}</strong> <Rich text={q.explain} /></p> : null}
    </div>
  );
}

export function Trait({ id, aspect, settings }) {
  const g = genreById[id];
  const t = g && traitOf(id, aspect);
  const tid = t ? traitId(id, aspect) : '';
  const [stage, setStage] = useState(-1); // -1 = l'exemple d'écoute
  const [heard, setHeard] = useState(() => new Set());
  const [done, setDone] = useState(() => (tid ? isDone(tid) : false));
  const onRan = useRef(() => {});
  const stageRef = useRef(-1);
  const slot = useDockSlot();

  useEffect(() => {
    if (!t) return undefined;
    setStage(-1);
    stageRef.current = -1;
    setHeard(new Set());
    setDone(isDone(tid));
    markSeen(tid);
    setResume('#/genre/' + id + '/' + aspect, g.name + ' · ' + aspectLabel(aspect));
    dock.claim({ key: 'trait:' + tid, code: t.hear, fresh: true, onRan: () => onRan.current() });
    window.scrollTo({ top: 0 });
    return () => dock.release('trait:' + tid);
  }, [tid]);

  // Le trait est « fait » quand toutes les étapes de reconstruction ont été jouées
  // (ou l'exemple d'écoute, quand il n'y a rien à reconstruire).
  onRan.current = () => {
    setHeard((prev) => {
      const next = new Set(prev);
      next.add(stageRef.current);
      const need = t.build.length ? t.build.map((_, i) => i) : [-1];
      if (need.every((i) => next.has(i)) && !isDone(tid)) {
        markDone(tid);
        markPracticed(tid);
        if (settings.chime) chime();
        setDone(true);
        refreshProgress();
      }
      return next;
    });
  };
  if (!t) return <Missing />;
  const idx = g.traits.findIndex((x) => x.aspect === aspect);
  const prev = g.traits[idx - 1];
  const next = g.traits[idx + 1];
  const pick = (i) => {
    setStage(i);
    stageRef.current = i;
    dock.loadCode(i < 0 ? t.hear : t.build[i][1], { play: true });
  };
  const nextRoute = '#/genre/' + id + '/' + (next ? next.aspect : 'assemblage');
  const nextLabel = next ? aspectLabel(next.aspect) : 'Assembler';

  return (
    <>
      <section className="v-head">
        <div className="crumbs">
          <button type="button" className="linkbtn" onClick={() => go('#/genre/' + id)}>{g.name}</button>
          <span>·</span><span>{aspectLabel(aspect)}</span>
          <span className="crumbs-n">{idx + 1} / {g.traits.length}</span>
        </div>
        <h1>{t.title}</h1>
        <div className="moment">
          <div className="moment-label"><Icon name="ear" size={16} /> L’entendre</div>
          <p>Appuie sur ▶. L’exemple est original, écrit dans le style.</p>
        </div>
      </section>
      <section className="v-body">
        <div className="moment moment-name">
          <div className="moment-label">Le comprendre</div>
          <Rich as="p" text={t.what} />
        </div>

        {t.build.length ? (
          <div className="build">
            <div className="moment-label">Le reconstruire</div>
            <p className="build-lead">Un réglage à la fois. Chaque bouton charge le code dans l’éditeur et le joue : compare avec l’étape d’avant.</p>
            <ol className="stages">
              {t.build.map((b, i) => (
                <li key={i}>
                  <button type="button" className={'stage-btn' + (stage === i ? ' is-current' : '') + (heard.has(i) ? ' is-heard' : '')} onClick={() => pick(i)}>
                    <span className="stage-ic"><Icon name={heard.has(i) ? 'check' : 'play'} size={16} /></span>
                    <span>{b[0]}</span>
                  </button>
                  {stage === i && i > 0 ? <StageDiff before={t.build[i - 1][1]} after={b[1]} /> : null}
                </li>
              ))}
            </ol>
            <button type="button" className="linkbtn" onClick={() => pick(-1)}>Réécouter l’exemple complet</button>
          </div>
        ) : null}

        {done ? <p className="task-ok" role="status"><Icon name="check" size={18} /> Trait reconstruit. Modifie le code librement : rien ne se casse.</p> : null}
        {done && t.quiz && t.quiz[0] ? <TraitQuiz cardId={tid} q={t.quiz[0]} /> : null}

        {t.wiki && t.wiki.length ? (
          <div className="seealso">
            <div className="moment-label">Dans le wiki</div>
            <div className="chips">{t.wiki.map((w) => <WikiChip key={w} id={w} />)}</div>
          </div>
        ) : null}

        <nav className="steprow">
          {prev ? <button type="button" className="btn btn-quiet" onClick={() => go('#/genre/' + id + '/' + prev.aspect)}><Icon name="prev" size={18} /> {aspectLabel(prev.aspect)}</button> : <span />}
          <button type="button" className="btn btn-quiet" onClick={() => go(nextRoute)}>
            {nextLabel} <Icon name="next" size={18} />
          </button>
        </nav>
      </section>
      {done && slot
        ? createPortal(
            <div className="res-wrap">
              <div className="res res-ok" role="status">
                <p><Icon name="check" size={18} /> Trait reconstruit.</p>
                <button type="button" className="btn btn-primary" onClick={() => go(nextRoute)}>{nextLabel} <Icon name="next" size={18} /></button>
              </div>
            </div>,
            slot,
          )
        : null}
    </>
  );
}

// Ce qui a changé entre deux étapes de reconstruction (affiché sous le bouton touché).
function diffCode(a, b) {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  const w = /[\w.]/;
  while (p > 0 && w.test(a[p - 1]) && (w.test(a[p] || '') || w.test(b[p] || ''))) p--;
  while (s > 0 && w.test(a[a.length - s] || '') && (w.test(a[a.length - 1 - s] || '') || w.test(b[b.length - 1 - s] || ''))) s--;
  return { removed: a.slice(p, a.length - s).trim(), added: b.slice(p, b.length - s).trim() };
}
const clip = (s) => (s.length > 220 ? s.slice(0, 220) + '…' : s);
function StageDiff({ before, after }) {
  const { removed, added } = diffCode(before, after);
  if (!removed && !added) return null;
  return (
    <div className="stage-diff" aria-label="Ce qui change dans le code">
      {removed ? <pre className="diff-del"><code>{'− ' + clip(removed)}</code></pre> : null}
      {added ? <pre className="diff-add"><code>{'+ ' + clip(added)}</code></pre> : null}
    </div>
  );
}

/* --- Assembler, et l'étude de cas ----------------------------------------------------------- */
export function Assemble({ id }) {
  const g = genreById[id];
  useEffect(() => {
    if (!g) return undefined;
    setResume('#/genre/' + id + '/assemblage', g.name + ' · Assembler');
    dock.claim({ key: 'asm:' + id, code: g.assemble.code, onRan: () => {} });
    window.scrollTo({ top: 0 });
    return () => dock.release('asm:' + id);
  }, [id]);
  if (!g) return <Missing />;
  return (
    <>
      <section className="v-head">
        <div className="crumbs"><button type="button" className="linkbtn" onClick={() => go('#/genre/' + id)}>{g.name}</button><span>·</span><span>Assembler</span></div>
        <h1>{g.name} : tous les traits ensemble</h1>
        <div className="moment"><div className="moment-label"><Icon name="ear" size={16} /> Écoute</div><Rich as="p" text={g.assemble.text} /></div>
      </section>
      <section className="v-body">
        <div className="moment-label">Ce que chaque trait apporte</div>
        <ul className="shorts">
          {g.traits.map((t) => (
            <li key={t.aspect}><button type="button" className="linkbtn" onClick={() => go('#/genre/' + id + '/' + t.aspect)}>{aspectLabel(t.aspect)}</button> — {t.short}</li>
          ))}
        </ul>
        <nav className="steprow">
          <button type="button" className="btn btn-quiet" onClick={() => go('#/genre/' + id)}><Icon name="prev" size={18} /> {g.name}</button>
          <button type="button" className="btn btn-primary" onClick={() => go(g.caseStudy ? '#/genre/' + id + '/cas' : '#/comparer?a=' + id)}>
            {g.caseStudy ? 'Étude de cas' : 'Comparer'} <Icon name="next" size={18} />
          </button>
        </nav>
      </section>
    </>
  );
}

export function CaseStudy({ id }) {
  const g = genreById[id];
  const cs = g && g.caseStudy;
  useEffect(() => {
    if (!cs) return undefined;
    dock.claim({ key: 'cas:' + id, code: cs.exercise.code, onRan: () => {} });
    window.scrollTo({ top: 0 });
    return () => dock.release('cas:' + id);
  }, [id]);
  if (!cs) return <Missing />;
  return (
    <>
      <section className="v-head">
        <div className="crumbs"><button type="button" className="linkbtn" onClick={() => go('#/genre/' + id)}>{g.name}</button><span>·</span><span>Étude de cas</span></div>
        <h1>{cs.title}</h1>
        <div className="moment"><div className="moment-label"><Icon name="ear" size={16} /> À essayer</div><Rich as="p" text={cs.exercise.text} /></div>
        {cs.exercise.variants ? (
          <div className="chips">
            {cs.exercise.variants.map((v) => (
              <button type="button" key={v.label} className="btn btn-quiet" onClick={() => dock.loadCode(v.code, { play: true })}>
                <Icon name="play" size={16} /> {v.label}
              </button>
            ))}
            <button type="button" className="linkbtn" onClick={() => dock.loadCode(cs.exercise.code, { play: true })}>Revenir au point de départ</button>
          </div>
        ) : null}
      </section>
      <section className="v-body prose">
        {cs.paragraphs.map((p, i) => <Rich key={i} as="p" text={p} />)}
        <nav className="steprow">
          <button type="button" className="btn btn-quiet" onClick={() => go('#/genre/' + id)}><Icon name="prev" size={18} /> {g.name}</button>
          <button type="button" className="btn btn-primary" onClick={() => go('#/comparer?a=techno&b=' + id)}>Comparer avec la techno <Icon name="next" size={18} /></button>
        </nav>
      </section>
    </>
  );
}

/* --- Comparateur ----------------------------------------------------------------------------- */
export function Compare({ a: a0, b: b0 }) {
  const [a, setA] = useState(genreById[a0] ? a0 : 'techno');
  const [b, setB] = useState(genreById[b0] && b0 !== a0 ? b0 : a0 === 'trance' ? 'techno' : 'trance');
  useEffect(() => () => engine.endPreview(), []);
  const ga = genreById[a];
  const gb = genreById[b];
  const Select = ({ value, onChange, label }) => (
    <label className="cmp-select">
      <span className="sr">{label}</span>
      <select value={value} onChange={(e) => { engine.endPreview(); onChange(e.target.value); }}>
        {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
    </label>
  );
  return (
    <section className="v-body">
      <div className="crumbs"><button type="button" className="linkbtn" onClick={() => go('#/genres')}>Genres</button><span>·</span><span>Comparer</span></div>
      <PageHead title="Qu’est-ce qui distingue deux genres ?" lead="Les mêmes huit questions, posées aux deux. Chaque case s’écoute." />
      <div className="cmp">
        <div className="cmp-head">
          <span />
          <Select value={a} onChange={setA} label="Premier genre" />
          <Select value={b} onChange={setB} label="Second genre" />
        </div>
        {ASPECTS.map((asp) => {
          const ta = traitOf(a, asp.id);
          const tb = traitOf(b, asp.id);
          return (
            <div className="cmp-row" key={asp.id}>
              <div className="cmp-aspect"><strong>{asp.label}</strong><span>{asp.question}</span></div>
              {[[ga, ta], [gb, tb]].map(([g, t], i) => (
                <div className="cmp-cell" key={i}>
                  <div className="cmp-genre">{g.name}</div>
                  <p>{t.short}</p>
                  <div className="cmp-actions">
                    <PlayMini code={t.hear} />
                    <button type="button" className="linkbtn" onClick={() => go('#/genre/' + g.id + '/' + asp.id)}>Détail</button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <Fold title="Pourquoi les étiquettes ne suffisent pas">
        <p>Regarde les colonnes : plusieurs cases sont presque identiques d’un genre à l’autre (le kick sur chaque temps, le charleston à contretemps), et les zones de tempo se recouvrent. Ce qui fait un genre, ce n’est jamais un trait seul : c’est la combinaison.</p>
        <button type="button" className="linkbtn" onClick={() => go('#/genre/synthpop/cas')}>Lire l’étude de cas Agar Agar</button>
      </Fold>
    </section>
  );
}

function Missing() {
  return (
    <section className="v-body">
      <h1>Page introuvable</h1>
      <button type="button" className="btn btn-primary" onClick={() => go('#/genres')}>Voir les genres</button>
    </section>
  );
}
