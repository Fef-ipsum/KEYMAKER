// Keymaker — Chantier 38 : session de révision (répétition espacée).  [build:c38-review]
//
// Overlay ouvert depuis l'Accueil (« 📬 X flashs à revoir »). Pour chaque carte
// due (srs.js, Leitner) :
//   1. si la banque locale a une question de quiz pour ce flash → active recall
//      réel (QuestionCard, partagé avec Quiz.jsx) ;
//   2. sinon → auto-évaluation : essaie de te rappeler, révèle, juge-toi
//      honnêtement (« Je savais » / « À revoir »).
// Chaque réponse repasse par onAnswer(flashId, correct) → App met à jour le SRS
// (réussite : boîte supérieure, échec : retour box 1, revue demain).
//
// File plafonnée à 5 cartes (REVIEW_LIMIT) : une révision = 3 minutes, pas une
// montagne — c'est le contrat TDA-friendly de Keymaker.

import { useMemo, useState, useCallback } from 'react';
import { QuestionCard, usePreviewAudio } from './Quiz.jsx';
import { questionForFlash, readBank } from './srs.js';

export default function Review({ due, editorRef, onAnswer, onGoToFlash, onClose }) {
  // Une question de banque par carte, choisie UNE fois au montage (stable).
  const bank = useMemo(() => readBank(), []);
  const cards = useMemo(
    () => (due || []).map((d) => ({ ...d, q: questionForFlash(d.flashId, bank) })),
    [due, bank]
  );

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]); // bool par carte répondue
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);
  const audio = usePreviewAudio(editorRef);

  const card = cards[idx];
  const done = idx >= cards.length;

  const record = useCallback((correct) => {
    if (!card || answered) return;
    setAnswered(true);
    setResults((r) => [...r, !!correct]);
    try { onAnswer && onAnswer(card.flashId, !!correct); } catch { /* ignore */ }
  }, [card, answered, onAnswer]);

  const next = useCallback(() => {
    audio.stop();
    setRevealed(false);
    setAnswered(false);
    setIdx((i) => i + 1);
  }, [audio]);

  const score = results.filter(Boolean).length;

  return (
    <div className="learn-overlay quiz-overlay" role="dialog" aria-modal="true" aria-label="Révision du jour">
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel quiz-panel">
        <header className="learn-head">
          <div>
            <p className="kicker">Révision · Répétition espacée</p>
            <h2 className="learn-title">{done ? 'Révision faite' : 'Flashs à revoir'}</h2>
            <p className="learn-sub">
              {done
                ? 'Reviens demain, la suite arrivera au bon moment.'
                : 'Carte ' + (idx + 1) + ' / ' + cards.length + ' — au bon moment pour que ça reste.'}
            </p>
          </div>
          <button className="learn-close" onClick={onClose} aria-label="Fermer">✕</button>
        </header>

        {!done && cards.length > 1 && (
          <div className="quiz-steps" aria-hidden="true">
            {cards.map((_, i) => {
              let cls = 'quiz-step';
              if (i === idx && results.length <= i) cls += ' current';
              else if (results[i] != null) cls += results[i] ? ' good' : ' bad';
              return <span key={i} className={cls} />;
            })}
          </div>
        )}

        {!done && card && (
          <>
            <div className="review-meta">
              <span className="review-flash-id">{card.flashId}</span>
              <span className="review-flash-title">{card.title}</span>
              {card.where && <span className="review-where">{card.where}</span>}
            </div>

            {card.q ? (
              /* Active recall : une vraie question de la banque de quiz. */
              <QuestionCard key={card.flashId + ':' + idx} q={card.q} onAnswered={record} audio={audio} />
            ) : (
              /* Auto-évaluation : rappel d'abord, révélation ensuite. */
              <div className="quiz-q">
                <span className="quiz-type">Rappel</span>
                <p className="quiz-question">De quoi parle ce flash ? Dis-le dans ta tête avant de révéler.</p>
                {!revealed ? (
                  <div className="quiz-next-row">
                    <button className="btn quiz-next" onClick={() => setRevealed(true)}>Révéler</button>
                  </div>
                ) : (
                  <>
                    {card.concept && <p className="review-concept">{card.concept}</p>}
                    {card.code && (
                      <div className="quiz-code">
                        <pre><code>{card.code}</code></pre>
                        <button
                          className={'quiz-listen' + (audio.playingCode === card.code ? ' on' : '')}
                          onClick={() => (audio.playingCode === card.code ? audio.stop() : audio.play(card.code))}
                        >
                          {audio.playingCode === card.code ? '■ Stop' : '▶ Écouter'}
                        </button>
                      </div>
                    )}
                    {!answered && (
                      <div className="review-judge">
                        <button className="quiz-choice review-knew" onClick={() => record(true)}>✓ Je savais</button>
                        <button className="quiz-choice review-again" onClick={() => record(false)}>✗ À revoir</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="review-foot">
              <button className="review-open" onClick={() => onGoToFlash && onGoToFlash(card.flashId)}>
                Ouvrir la leçon →
              </button>
              {answered && (
                <button className="btn quiz-next" onClick={next} autoFocus>
                  {idx + 1 < cards.length ? 'Carte suivante ▶' : 'Terminer'}
                </button>
              )}
            </div>
          </>
        )}

        {done && (
          <div className="quiz-end">
            <p className="quiz-score">
              <span className="quiz-score-num">{score}/{cards.length}</span>
              {score === cards.length ? ' — tout tient. ✦' : ' — le reste reviendra demain, c\'est le jeu.'}
            </p>
            <p className="quiz-missed-title">
              Réussi → on espace. Raté → on revoit demain. C'est l'espacement qui fait la mémoire.
            </p>
            <div className="quiz-end-actions">
              <button className="btn quiz-leave" onClick={onClose}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
