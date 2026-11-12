// Point d'étape (fin de chapitre) et révision espacée : même écran, questions écrites à la main.
// Trois formes : question à choix, question d'écoute (l'app joue, on choisit), lecture de code.
// Une erreur ne retire rien : elle rapproche seulement la prochaine révision.

import { useEffect, useMemo, useState } from 'react';
import * as engine from '../lib/engine.js';
import { recordQuizResult } from '../lib/srs.js';
import { go, chapterQuestions, dueQuestions, shuffled, readFlow, advanceFlow, refreshProgress } from '../lib/app.js';
import { chapterById, fondations } from '../content/registry.js';
import { Icon, Rich, PlayMini, PageHead } from '../ui.jsx';

function Question({ item, seed, onAnswer }) {
  const q = item.question;
  const order = useMemo(() => shuffled(q.choices, seed), [q, seed]);
  const [picked, setPicked] = useState(null); // indice d'origine
  const answered = picked != null;
  const right = picked === q.answer;

  useEffect(() => {
    setPicked(null);
    return () => engine.endPreview();
  }, [q]);

  const choose = (orig) => {
    if (answered) return;
    setPicked(orig);
    onAnswer(orig === q.answer);
  };

  return (
    <div className="question">
      <Rich as="h1" text={q.q} className="question-q" />
      {q.type === 'ecoute' ? (
        <div className="question-listen"><PlayMini code={q.code} label="Écouter" big /></div>
      ) : q.code ? (
        <pre className="code"><code>{q.code}</code></pre>
      ) : null}
      <ul className="choices">
        {order.map(([text, orig]) => {
          const state = !answered ? '' : orig === q.answer ? ' is-right' : orig === picked ? ' is-wrong' : ' is-dim';
          return (
            <li key={orig}>
              <button type="button" className={'choice' + state} onClick={() => choose(orig)} disabled={answered}>
                <Rich text={text} />
                {answered && orig === q.answer ? <Icon name="check" size={18} /> : null}
              </button>
            </li>
          );
        })}
      </ul>
      {answered ? (
        <div className={'explain' + (right ? ' is-right' : '')} role="status">
          <strong>{right ? 'C’est ça.' : 'Pas tout à fait.'}</strong> <Rich text={q.explain} />
          {q.type === 'ecoute' ? <pre className="code code-small"><code>{q.code}</code></pre> : null}
          {!right ? (
            <p className="explain-more">
              Elle reviendra demain. <button type="button" className="linkbtn" onClick={() => go(item.route)}>Revoir « {item.title} »</button>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function Quiz({ mode, chapterId }) {
  const chapter = mode === 'point' ? chapterById[chapterId] : null;
  const items = useMemo(() => (mode === 'point' ? chapterQuestions(chapterId) : dueQuestions()), [mode, chapterId]);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const seed = useMemo(() => Math.floor(Math.random() * 1e9), [mode, chapterId]);

  useEffect(() => {
    setI(0);
    setAnswered(false);
    setScore(0);
    window.scrollTo({ top: 0 });
  }, [mode, chapterId]);

  const flow = readFlow();
  const inFlow = mode === 'revision' && flow && !flow.done && flow.items[flow.index] && flow.items[flow.index].type === 'revision';
  const finish = () => {
    refreshProgress();
    if (inFlow) return go(advanceFlow());
    if (chapter) {
      const idx = fondations.findIndex((c) => c.id === chapter.id);
      const nextCh = fondations[idx + 1];
      return go(nextCh ? '#/etape/' + encodeURIComponent(nextCh.steps[0].id) : '#/genres');
    }
    go('#/');
  };

  if (!items.length) {
    return (
      <section className="v-body narrow">
        <PageHead kicker={mode === 'point' ? 'Point d’étape' : 'Révision'} title="Rien à réviser pour l’instant" lead="Les questions reviennent quelques jours après que tu y as répondu. Rien ne s’accumule : il n’y en a jamais plus de cinq à la fois." />
        <button type="button" className="btn btn-primary" onClick={() => go('#/')}>Retour</button>
      </section>
    );
  }

  const end = i >= items.length;
  if (end) {
    const nextCh = chapter ? fondations[fondations.findIndex((c) => c.id === chapter.id) + 1] : null;
    return (
      <section className="v-body narrow">
        <PageHead
          kicker={chapter ? 'Chapitre ' + chapter.roman + ' — ' + chapter.title : 'Révision'}
          title={chapter ? 'Chapitre terminé' : 'Révision terminée'}
          lead={`${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} sur ${items.length}. Les questions réussies reviendront dans quelques jours, les autres dès demain.`}
        />
        <button type="button" className="btn btn-primary" onClick={finish}>
          {inFlow ? 'Suite de la session' : nextCh ? 'Chapitre ' + nextCh.roman + ' — ' + nextCh.title : chapter ? 'Découvrir les genres' : 'Terminé'} <Icon name="next" size={18} />
        </button>
      </section>
    );
  }

  const item = items[i];
  return (
    <section className="v-body narrow">
      <div className="crumbs">
        <span>{chapter ? 'Point d’étape — chapitre ' + chapter.roman : 'Révision'}</span>
        <span className="crumbs-n">{i + 1} / {items.length}</span>
      </div>
      <Question
        key={item.cardId + ':' + i}
        item={item}
        seed={seed + i}
        onAnswer={(ok) => {
          recordQuizResult(item.cardId, ok);
          if (ok) setScore((s) => s + 1);
          setAnswered(true);
        }}
      />
      {answered ? (
        <div className="steprow">
          <span />
          <button type="button" className="btn btn-primary" onClick={() => { engine.endPreview(); setAnswered(false); setI((n) => n + 1); }}>
            {i + 1 < items.length ? 'Question suivante' : 'Terminer'} <Icon name="next" size={18} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
