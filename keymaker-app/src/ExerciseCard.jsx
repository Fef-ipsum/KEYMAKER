// Keymaker — Chantier 39 : « ✓ Vérifie mon exercice ».  [build:c39-verify]
// Chantier 56 (11 juin 2026) : « Je valide moi-même » — auto-validation.
//
// Carte Exercice du flash + DEUX façons de passer le flash à « pratiqué » (srs.js) :
//   1. Vérification par Sati (route JSON /keymaker/ai/verify, Haiku) : elle regarde
//      consigne + code live et répond en 1-2 phrases. Verdict « ok » → pratiqué.
//   2. Auto-validation (Felix) : un bouton « Je valide moi-même ». Parfois Sati
//      n'est pas claire ou retient pour rien ; Felix garde la main et marque le
//      flash pratiqué d'un geste, sans IA et sans Pi. C'est SON parcours.
// Les deux chemins appellent le même onPracticed → la pastille du Parcours suit.
//
// Monté avec key={flashKey} par App : l'état (feedback, auto-validation) se
// réinitialise naturellement au changement de flash, zéro useEffect de nettoyage.

import { useRef, useState } from 'react';
import { verifyExercise } from './learnApi.js';

export default function ExerciseCard({ flash, piUrl, piOk, readLiveCode, onPracticed }) {
  const [st, setSt] = useState('idle'); // idle | busy | done
  const [verdict, setVerdict] = useState(null); // 'ok' | 'retry'
  const [feedback, setFeedback] = useState('');
  const [selfDone, setSelfDone] = useState(false); // auto-validé par Felix (Chantier 56)
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

  // Auto-validation : Felix décide. Marque pratiqué, sans IA, sans Pi.
  const selfValidate = () => {
    try { onPracticed && onPracticed(flash.id); } catch { /* ignore */ }
    setSelfDone(true);
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

        {/* Auto-validation — Felix garde la main (Chantier 56). Toujours dispo, même sans Pi. */}
        <button
          className="self-validate-btn"
          onClick={selfValidate}
          disabled={selfDone}
          title="Marque cette leçon comme acquise, sans passer par Sati"
        >
          {selfDone ? '✓ Validé par toi' : 'Je valide moi-même'}
        </button>

        {st === 'idle' && !selfDone && (
          <span className="verify-hint">Fais l'exercice dans l'éditeur, puis demande à Sati — ou valide toi-même.</span>
        )}
      </div>

      {st === 'done' && feedback && (
        <div className={'verify-feedback ' + (verdict === 'ok' ? 'good' : 'bad')} role="status">
          <strong>{verdict === 'ok' ? '✓ Validé' : '↻ Pas encore'}</strong> — {feedback}
        </div>
      )}

      {selfDone && (
        <div className="verify-feedback good" role="status">
          <strong>✓ Acquis</strong> — tu as validé cette leçon toi-même. Elle compte comme « pratiquée » dans ta progression.
        </div>
      )}
    </section>
  );
}
