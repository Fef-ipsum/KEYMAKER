// Keymaker — Chantier 39 : « ✓ Vérifie mon exercice ».  [build:c39-verify]
//
// Remplace la carte Exercice statique du flash : même contenu, plus un bouton
// qui envoie consigne + code live au Pi (route JSON /keymaker/ai/verify, Haiku).
// Sati répond en 1-2 phrases : objectif atteint ? quoi améliorer ? Verdict « ok »
// → le flash passe à « pratiqué » (srs.js, via onPracticed) et la pastille du
// Parcours suit. Ferme la boucle consigne → production → feedback qui restait
// ouverte depuis le Chantier 2.
//
// Monté avec key={flashKey} par App : l'état (feedback affiché) se réinitialise
// naturellement au changement de flash, zéro useEffect de nettoyage.

import { useRef, useState } from 'react';
import { verifyExercise } from './learnApi.js';

export default function ExerciseCard({ flash, piUrl, piOk, readLiveCode, onPracticed }) {
  const [st, setSt] = useState('idle'); // idle | busy | done
  const [verdict, setVerdict] = useState(null); // 'ok' | 'retry'
  const [feedback, setFeedback] = useState('');
  const busyRef = useRef(false);

  if (!flash || !flash.exercise) return null;

  const check = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setSt('busy');
    setVerdict(null);
    setFeedback('');
    try {
      const code = (readLiveCode && readLiveCode()) || '';
      const r = await verifyExercise({
        piUrl,
        flashId: flash.id,
        flashTitle: flash.title,
        exercise: flash.exercise,
        concept: flash.concept,
        lessonCode: flash.code,
        code,
      });
      setVerdict(r.verdict);
      setFeedback(r.feedback);
      setSt('done');
      if (r.verdict === 'ok') {
        try { onPracticed && onPracticed(flash.id); } catch { /* ignore */ }
      }
    } catch (e) {
      setVerdict('retry');
      setFeedback((e && e.message) || 'Vérification impossible pour le moment.');
      setSt('done');
    } finally {
      busyRef.current = false;
    }
  };

  return (
    <section className="card exo">
      <h2>Exercice</h2>
      <p>{flash.exercise}</p>

      <div className="verify-row">
        <button
          className={'verify-btn' + (st === 'busy' ? ' busy' : '')}
          onClick={check}
          disabled={st === 'busy'}
          title={piOk ? 'Sati regarde ton code et la consigne, et te dit si c\'est bon' : 'Nécessite la connexion au Pi (Sati)'}
        >
          {st === 'busy' ? 'Sati regarde ton code…' : '✓ Vérifie mon exercice'}
        </button>
        {st === 'idle' && <span className="verify-hint">Fais l'exercice dans l'éditeur, puis demande à Sati.</span>}
      </div>

      {st === 'done' && feedback && (
        <div className={'verify-feedback ' + (verdict === 'ok' ? 'good' : 'bad')} role="status">
          <strong>{verdict === 'ok' ? '✓ Validé' : '↻ Pas encore'}</strong> — {feedback}
        </div>
      )}
    </section>
  );
}
