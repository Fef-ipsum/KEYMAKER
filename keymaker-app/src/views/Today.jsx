// Aujourd'hui — une seule question : « qu'est-ce que je fais maintenant ? »
// Un gros bouton (Continuer), puis « J'ai X minutes ». Rien d'autre ne réclame l'attention.

import { getResume, countDone } from '../lib/progress.js';
import { go, nextFondation, stepRoute, useProgress, dueCount, dueExercises, DURATIONS, buildFlow, writeFlow, levelOf } from '../lib/app.js';
import { fondationIds, stepIndex } from '../content/registry.js';
import { Icon, ProgressDial } from '../ui.jsx';

export default function Today() {
  const { state, srs } = useProgress();
  const next = nextFondation(state);
  const resume = getResume();
  const started = Object.keys(state.steps).length > 0;
  const due = dueCount();
  const exercises = dueExercises();

  // Où reprendre : la dernière étape ouverte si elle n'est pas terminée, sinon la suivante du parcours.
  let target = next ? { route: stepRoute(next.step.id), title: next.step.title, chapter: next.chapter } : null;
  if (resume && resume.route) {
    const id = decodeURIComponent((resume.route.match(/^#\/etape\/(.+)$/) || [])[1] || '');
    const e = id && stepIndex.get(id);
    if (e && !(state.steps[id] && state.steps[id].done)) target = { route: resume.route, title: e.step.title, chapter: e.chapter };
    else if (!e && /^#\/genre\//.test(resume.route)) target = { route: resume.route, title: resume.label, chapter: null };
  }

  const ch = target && target.chapter;
  const levels = ch ? ch.steps.map((s) => levelOf(s.id, state, srs)) : [];
  const total = countDone(fondationIds, state);
  const startFlow = (minutes) => {
    const f = buildFlow(minutes);
    writeFlow(f);
    go(f.items[0].route);
  };

  return (
    <section className="v-body today">
      <p className="today-hello">{started ? 'Bon retour.' : 'Bienvenue dans Keymaker.'}</p>

      {!started && target ? (
        <button type="button" className="resume resume-first" onClick={() => go(target.route)}>
          <span className="resume-play"><Icon name="play" size={34} /></span>
          <span className="resume-text">
            <span className="resume-kicker">Commencer</span>
            <span className="resume-title">Ton premier son</span>
            <span className="resume-sub">Chapitre I — deux minutes</span>
          </span>
        </button>
      ) : target ? (
        <button type="button" className="resume" onClick={() => go(target.route)}>
          {ch ? <ProgressDial levels={levels} label={ch.roman || '·'} size={84} /> : <span className="resume-ic"><Icon name="genres" size={40} /></span>}
          <span className="resume-text">
            <span className="resume-kicker">{started ? 'Continuer' : 'Commencer'}</span>
            <span className="resume-title">{target.title}</span>
            {ch ? <span className="resume-sub">{ch.kind === 'fondations' ? 'Chapitre ' + ch.roman + ' — ' + ch.title : ch.trackTitle + ' — ' + ch.title}</span> : null}
          </span>
          <Icon name="next" size={26} className="resume-arrow" />
        </button>
      ) : (
        <button type="button" className="resume" onClick={() => go('#/genres')}>
          <span className="resume-ic"><Icon name="genres" size={40} /></span>
          <span className="resume-text">
            <span className="resume-kicker">Les fondations sont terminées</span>
            <span className="resume-title">Explorer les genres</span>
          </span>
          <Icon name="next" size={26} className="resume-arrow" />
        </button>
      )}

      {total.done > 0 ? (
      <div className="minutes">
        <h2>J’ai…</h2>
        <div className="minutes-row">
          {DURATIONS.map((d) => (
            <button type="button" key={d.minutes} className="minute" onClick={() => startFlow(d.minutes)}>
              <span className="minute-n">{d.label}</span>
              <span className="minute-s">{d.sub}</span>
            </button>
          ))}
        </div>
      </div>
      ) : null}

      {due > 0 ? (
        <button type="button" className="quietline" onClick={() => go('#/revision')}>
          <Icon name="check" size={18} />
          <span>{due === 1 ? 'Une révision est prête' : due + ' révisions sont prêtes'} — deux minutes, quand tu veux.</span>
          <Icon name="next" size={18} />
        </button>
      ) : null}

      {exercises.length ? (
        <button type="button" className="quietline" onClick={() => go(exercises[0].route)}>
          <Icon name="studio" size={18} />
          <span>{exercises.length === 1 ? 'Un exercice à refaire de mémoire : « ' + exercises[0].title + ' ».' : exercises.length + ' exercices à refaire de mémoire, en commençant par « ' + exercises[0].title + ' ».'}</span>
          <Icon name="next" size={18} />
        </button>
      ) : null}

      <p className="today-foot">
        {total.done > 0 ? `${total.done} étape${total.done > 1 ? 's' : ''} faite${total.done > 1 ? 's' : ''} sur ${total.total} dans les fondations. ` : 'Deux minutes suffisent pour la première étape. '}
        <button type="button" className="linkbtn" onClick={() => go('#/parcours')}>Voir tout le parcours</button>
      </p>
    </section>
  );
}
