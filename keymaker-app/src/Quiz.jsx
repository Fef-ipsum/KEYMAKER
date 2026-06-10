// Keymaker — Chantier 37 : quiz de chapitre.  [build:c37-quiz]
//
// Overlay (patron learn-overlay : l'éditeur reste monté dessous) qui pose 3-4
// questions générées par Sati (Haiku, route JSON /keymaker/ai/quiz) sur le
// chapitre qui vient d'être terminé. Active recall : on se teste, feedback
// immédiat, 1 phrase d'explication — et chaque réponse alimente la maîtrise +
// la répétition espacée (srs.js) via onResult(flashId, correct).
//
// Les questions générées sont mises en banque (localStorage) : le quiz se
// rouvre sans latence, et la révision SRS (Review.jsx) pioche dedans hors
// connexion. « ↻ Nouvelles questions » force une regénération.
//
// Audio : si une question porte un code, « ▶ Écouter » le joue dans l'ÉDITEUR
// PRINCIPAL (déjà monté). Le code que Felix avait dans l'éditeur est capturé au
// premier play et restauré à la fermeture du quiz — rien n'est perdu.

import { useEffect, useRef, useState, useCallback } from 'react';
import { generateQuiz } from './learnApi.js';
import { getChapterQuiz, saveChapterQuiz } from './srs.js';

/* ---------------------------------------------------------------------------
   usePreviewAudio — joue un code de question dans l'éditeur principal, en
   capturant le code de Felix au premier play et en le restaurant au unmount.
   Best-effort intégral : le moindre échec audio ne casse jamais le quiz.
   --------------------------------------------------------------------------- */
export function usePreviewAudio(editorRef) {
  const savedRef = useRef(null);   // code de Felix capturé avant le 1er play
  const [playingCode, setPlayingCode] = useState(null);

  const stop = useCallback(async () => {
    const ed = editorRef && editorRef.current;
    setPlayingCode(null);
    if (!ed) return;
    try { await ed.stop(); } catch { /* ignore */ }
  }, [editorRef]);

  const play = useCallback(async (code) => {
    const ed = editorRef && editorRef.current;
    if (!ed || !code) return;
    if (savedRef.current == null) {
      try { savedRef.current = typeof ed.code === 'string' ? ed.code : ''; } catch { savedRef.current = ''; }
    }
    try {
      await ed.stop();
      ed.setCode(code);
      await ed.evaluate();
      setPlayingCode(code);
    } catch { setPlayingCode(null); }
  }, [editorRef]);

  // Restauration à la fermeture de l'overlay : stop + code de Felix remis en place.
  useEffect(() => () => {
    const ed = editorRef && editorRef.current;
    if (!ed) return;
    (async () => {
      try { await ed.stop(); } catch { /* ignore */ }
      if (savedRef.current != null) {
        try { ed.setCode(savedRef.current); } catch { /* ignore */ }
      }
    })();
  }, [editorRef]);

  return { play, stop, playingCode };
}

const TYPE_LABEL = { mcq: 'QCM', truefalse: 'Vrai ou faux', fill: 'Code à trous' };

/* ---------------------------------------------------------------------------
   <QuestionCard> — UNE question (réutilisée par la révision SRS, Review.jsx).
   Annonce le résultat via onAnswered(correct) UNE seule fois, au clic.
   --------------------------------------------------------------------------- */
export function QuestionCard({ q, onAnswered, audio }) {
  const [picked, setPicked] = useState(null);
  const answered = picked != null;
  const pick = (i) => {
    if (answered) return;
    setPicked(i);
    try { onAnswered(i === q.answer); } catch { /* ignore */ }
  };
  const isPlaying = audio && audio.playingCode === q.code && q.code;

  return (
    <div className="quiz-q">
      <span className="quiz-type">{TYPE_LABEL[q.type] || 'Question'}</span>
      <p className="quiz-question">{q.question}</p>

      {q.code && (
        <div className="quiz-code">
          <pre><code>{q.code}</code></pre>
          {audio && (
            <button
              className={'quiz-listen' + (isPlaying ? ' on' : '')}
              onClick={() => (isPlaying ? audio.stop() : audio.play(q.code))}
              title={isPlaying ? 'Arrêter' : 'Écouter ce code'}
            >
              {isPlaying ? '■ Stop' : '▶ Écouter'}
            </button>
          )}
        </div>
      )}

      <div className="quiz-choices" role="group">
        {q.choices.map((c, i) => {
          let cls = 'quiz-choice';
          if (answered) {
            if (i === q.answer) cls += ' right';
            else if (i === picked) cls += ' wrong';
            else cls += ' off';
          }
          return (
            <button key={i} className={cls} onClick={() => pick(i)} disabled={answered}>
              {q.type === 'fill' ? <code>{c}</code> : c}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={'quiz-verdict ' + (picked === q.answer ? 'good' : 'bad')} role="status">
          <strong>{picked === q.answer ? '✓ Exact.' : '✗ Pas celle-là.'}</strong>
          {q.explain ? ' ' + q.explain : ''}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   <Quiz> — l'overlay complet du quiz de chapitre.
   --------------------------------------------------------------------------- */
export default function Quiz({
  piUrl,
  moduleId,
  moduleTitle,
  chapterIndex,
  chapterTitle,
  flashs,            // flashs (données complètes) du chapitre
  editorRef,
  onResult,          // (flashId, correct) → App enregistre dans le SRS
  onClose,
}) {
  const [phase, setPhase] = useState('loading'); // loading | error | quiz | done
  const [errMsg, setErrMsg] = useState('');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]); // [{flashId, correct}]
  const audio = usePreviewAudio(editorRef);
  const abortRef = useRef(null);

  const titleById = {};
  for (const f of flashs || []) titleById[f.id] = f.title;

  const load = useCallback(async (force) => {
    setPhase('loading');
    setErrMsg('');
    setIdx(0);
    setResults([]);
    // 1) Banque locale (zéro latence), sauf regénération forcée.
    if (!force) {
      const cached = getChapterQuiz(moduleId, chapterIndex);
      if (cached) { setQuestions(cached); setPhase('quiz'); return; }
    }
    // 2) Génération par le Pi (Haiku).
    try {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const qs = await generateQuiz({
        piUrl,
        moduleTitle,
        chapterTitle,
        count: Math.min(5, Math.max(3, (flashs || []).length - 1)),
        flashs: (flashs || []).map((f) => ({
          id: f.id, title: f.title, concept: f.concept, code: f.code, exercise: f.exercise,
        })),
        signal: ctrl.signal,
      });
      saveChapterQuiz(moduleId, chapterIndex, qs);
      setQuestions(qs);
      setPhase('quiz');
    } catch (e) {
      setErrMsg((e && e.message) || 'Génération impossible.');
      setPhase('error');
    }
  }, [piUrl, moduleId, moduleTitle, chapterIndex, chapterTitle, flashs]);

  useEffect(() => {
    load(false);
    return () => { try { abortRef.current && abortRef.current.abort(); } catch { /* ignore */ } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAnswered = useCallback((correct) => {
    const q = questions[idx];
    if (!q) return;
    setResults((r) => [...r, { flashId: q.flashId, correct }]);
    try { onResult && onResult(q.flashId, correct); } catch { /* ignore */ }
  }, [questions, idx, onResult]);

  const next = useCallback(() => {
    audio.stop();
    if (idx + 1 < questions.length) setIdx(idx + 1);
    else setPhase('done');
  }, [idx, questions.length, audio]);

  const score = results.filter((r) => r.correct).length;
  const missed = results.filter((r) => !r.correct);
  const answeredCurrent = results.length > idx;

  return (
    <div className="learn-overlay quiz-overlay" role="dialog" aria-modal="true" aria-label={'Quiz — ' + chapterTitle}>
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel quiz-panel">
        <header className="learn-head">
          <div>
            <p className="kicker">Quiz · Chapitre</p>
            <h2 className="learn-title">{chapterTitle}</h2>
            <p className="learn-sub">
              {phase === 'quiz' ? 'Question ' + (idx + 1) + ' / ' + questions.length + ' — réponds à l\'instinct, l\'explication suit.' : 'Vérifie que c\'est acquis — 2 minutes.'}
            </p>
          </div>
          <button className="learn-close" onClick={onClose} aria-label="Fermer">✕</button>
        </header>

        {phase === 'quiz' && questions.length > 1 && (
          <div className="quiz-steps" aria-hidden="true">
            {questions.map((_, i) => {
              const r = results[i];
              let cls = 'quiz-step';
              if (i === idx && !r) cls += ' current';
              else if (r) cls += r.correct ? ' good' : ' bad';
              return <span key={i} className={cls} />;
            })}
          </div>
        )}

        {phase === 'loading' && (
          <div className="quiz-wait">
            <p className="quiz-wait-main">Sati prépare ton quiz…</p>
            <p className="quiz-wait-sub">3-4 questions sur ce que tu viens d'apprendre.</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="quiz-wait">
            <p className="quiz-wait-main">{errMsg}</p>
            <div className="quiz-end-actions">
              <button className="btn quiz-retry" onClick={() => load(false)}>Réessayer</button>
              <button className="btn quiz-leave" onClick={onClose}>Plus tard</button>
            </div>
          </div>
        )}

        {phase === 'quiz' && questions[idx] && (
          <>
            <QuestionCard key={idx} q={questions[idx]} onAnswered={onAnswered} audio={audio} />
            {answeredCurrent && (
              <div className="quiz-next-row">
                <button className="btn quiz-next" onClick={next} autoFocus>
                  {idx + 1 < questions.length ? 'Question suivante ▶' : 'Voir le résultat'}
                </button>
              </div>
            )}
          </>
        )}

        {phase === 'done' && (
          <div className="quiz-end">
            <p className="quiz-score">
              <span className="quiz-score-num">{score}/{questions.length}</span>
              {score === questions.length
                ? ' — sans faute. Chapitre maîtrisé. ✦'
                : score >= Math.ceil(questions.length / 2)
                  ? ' — bien joué.'
                  : ' — c\'est noté, on les reverra ensemble.'}
            </p>
            {missed.length > 0 && (
              <div className="quiz-missed">
                <p className="quiz-missed-title">Ils reviendront dans ta file de révision :</p>
                <ul>
                  {missed.map((r, i) => (
                    <li key={i}><strong>{r.flashId}</strong>{titleById[r.flashId] ? ' · ' + titleById[r.flashId] : ''}</li>
                  ))}
                </ul>
              </div>
            )}
            {missed.length === 0 && (
              <p className="quiz-missed-title">Les questions réussies reviendront d'ici quelques jours — c'est comme ça que ça s'ancre.</p>
            )}
            <div className="quiz-end-actions">
              <button className="btn quiz-retry" onClick={() => load(true)} title="Regénérer de nouvelles questions sur ce chapitre">↻ Nouvelles questions</button>
              <button className="btn quiz-leave" onClick={onClose}>Terminer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
