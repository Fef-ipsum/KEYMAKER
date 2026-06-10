// Keymaker — Chantier 44 : le bandeau du Mode Flow.  [build:c44-flowbar]
//
// Fixé en bas de l'écran PENDANT le flow : l'app reste entièrement utilisable
// (le flow guide la navigation réelle, il ne l'enferme pas). Une étape à la
// fois, un seul bouton principal, un chrono doux — cadre sans pression.
//
// L'étape « challenge » charge son défi ici même (Sati/Opus via learnApi,
// banque locale en repli) et peut pousser le code de départ dans l'éditeur.

import { useEffect, useRef, useState, useCallback } from 'react';
import { stepLabel, elapsedLabel, pickLocalChallenge } from './flow.js';
import { generateChallenge } from './learnApi.js';

export default function FlowBar({
  flow,            // { plan, stepIndex, startTs, minutes, learnLeft, stats }
  piUrl,
  recentTitles,    // titres des flashs récents (contexte du défi)
  editorRef,
  onOpenReview,    // ouvre l'overlay de révision (Review)
  onNextUnseen,    // navigue vers le prochain flash non vu
  onAdvance,       // étape suivante (ou décrément learn)
  onQuit,          // fin / abandon du flow → récap géré par App
}) {
  const step = flow.plan[flow.stepIndex] || null;
  const done = !step;
  const [tick, setTick] = useState(0);
  const [challenge, setChallenge] = useState(null); // { title, brief, code, local? }
  const [chLoading, setChLoading] = useState(false);
  const fetchedRef = useRef(false);

  // Chrono doux (jamais coercitif) : re-rendu chaque seconde, en pause si reduce-motion ? non : 1 Hz est inoffensif.
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const over = (Date.now() - flow.startTs) / 60000 > flow.minutes;

  // Charge le défi en ARRIVANT sur l'étape challenge (une seule fois).
  useEffect(() => {
    if (!step || step.type !== 'challenge' || fetchedRef.current) return;
    fetchedRef.current = true;
    setChLoading(true);
    (async () => {
      try {
        const c = await generateChallenge({ piUrl, recent: recentTitles, minutes: flow.minutes });
        setChallenge(c);
      } catch {
        setChallenge({ ...pickLocalChallenge(), local: true });
      } finally {
        setChLoading(false);
      }
    })();
  }, [step, piUrl, recentTitles, flow.minutes]);

  const loadChallengeCode = useCallback(() => {
    const ed = editorRef && editorRef.current;
    if (!ed || !challenge || !challenge.code) return;
    (async () => {
      try { await ed.stop(); ed.setCode(challenge.code); } catch { /* best-effort */ }
    })();
  }, [editorRef, challenge]);

  return (
    <div className={'flow-bar' + (done ? ' done' : '')} role="region" aria-label="Mode Flow">
      <div className="flow-head">
        <span className="flow-glyph" aria-hidden="true">🌊</span>
        <span className="flow-title">Flow</span>
        <span className={'flow-clock' + (over ? ' over' : '')} title={over ? 'Temps prévu écoulé — termine quand tu veux' : 'Temps écoulé'}>
          {elapsedLabel(flow.startTs, Date.now() + tick * 0)} / ~{flow.minutes} min
        </span>
        <span className="flow-steps-ind" aria-hidden="true">
          {flow.plan.map((s, i) => (
            <span key={i} className={'flow-step-dot' + (i < flow.stepIndex ? ' past' : i === flow.stepIndex ? ' now' : '')} />
          ))}
        </span>
        <button className="flow-quit" onClick={onQuit} title="Terminer le flow">✕</button>
      </div>

      {!done && step.type === 'review' && (
        <div className="flow-body">
          <p className="flow-msg"><strong>{stepLabel(step)}</strong> — on consolide d'abord, ça libère la tête pour le neuf.</p>
          <button className="flow-cta" onClick={onOpenReview}>📬 Réviser maintenant</button>
        </div>
      )}

      {!done && step.type === 'learn' && (
        <div className="flow-body">
          <p className="flow-msg">
            <strong>Nouveau terrain</strong> — lis ce flash, joue son code, fais l'exercice.
            {flow.learnLeft > 1 ? ` Encore ${flow.learnLeft} flashs dans cette étape.` : ' Dernier flash de cette étape.'}
          </p>
          <button className="flow-cta" onClick={onAdvance}>✓ Fait{flow.learnLeft > 1 ? ', flash suivant' : ', étape suivante'} ▶</button>
        </div>
      )}

      {!done && step.type === 'challenge' && (
        <div className="flow-body flow-challenge">
          {chLoading && <p className="flow-msg">🔮 Sati invente ton défi (elle connaît ton niveau)…</p>}
          {!chLoading && challenge && (
            <>
              <p className="flow-ch-title">
                {challenge.title}
                {challenge.local && <span className="flow-ch-local" title="Pi injoignable : défi de la banque locale"> · hors-ligne</span>}
              </p>
              <p className="flow-ch-brief">{challenge.brief}</p>
              <div className="flow-ch-actions">
                {challenge.code && <button className="flow-cta ghost" onClick={loadChallengeCode}>▶ Code de départ</button>}
                <button className="flow-cta" onClick={onAdvance}>✓ Défi relevé ▶</button>
              </div>
            </>
          )}
        </div>
      )}

      {done && (
        <div className="flow-body">
          <p className="flow-msg">
            <strong>Flow terminé</strong> · {elapsedLabel(flow.startTs)} ·
            {flow.stats.reviewed > 0 ? ' ' + flow.stats.reviewed + ' carte' + (flow.stats.reviewed > 1 ? 's' : '') + ' révisée' + (flow.stats.reviewed > 1 ? 's' : '') + ' ·' : ''}
            {flow.stats.learned > 0 ? ' ' + flow.stats.learned + ' flash' + (flow.stats.learned > 1 ? 's' : '') + ' découvert' + (flow.stats.learned > 1 ? 's' : '') + ' ·' : ''}
            {flow.stats.challenged ? ' 1 défi relevé ·' : ''} bien joué. ✦
          </p>
          <button className="flow-cta" onClick={onQuit}>Terminer</button>
        </div>
      )}
    </div>
  );
}
