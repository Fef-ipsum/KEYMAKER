// Parcours — « où j'en suis, et qu'est-ce qui vient après ? »
// Les fondations d'abord, puis les genres, puis les approfondissements (en retrait).

import { useState } from 'react';
import { go, stepRoute, useProgress, levelOf, nextFondation } from '../lib/app.js';
import { fondations, genres, tracks } from '../content/registry.js';
import { traitId, ASPECTS, bpmText } from '../content/genres/index.js';
import { Icon, ProgressDial, LevelDot, PageHead } from '../ui.jsx';

function Chapter({ ch, state, srs, open, onToggle, current }) {
  const levels = ch.steps.map((s) => levelOf(s.id, state, srs));
  const done = levels.filter((l) => l === 'faite' || l === 'acquise').length;
  const all = done === ch.steps.length;
  return (
    <li className={'chapter' + (open ? ' is-open' : '') + (current ? ' is-current' : '')}>
      <button type="button" className="chapter-head" onClick={onToggle} aria-expanded={open}>
        <ProgressDial levels={levels} label={ch.roman || ''} size={56} />
        <span className="chapter-text">
          <span className="chapter-title">{ch.title}</span>
          <span className="chapter-goal">{ch.goal}</span>
        </span>
        <span className="chapter-count">{done}/{ch.steps.length}</span>
        <Icon name="down" size={18} className="fold-arrow" />
      </button>
      {open ? (
        <ol className="steps">
          {ch.steps.map((s, i) => (
            <li key={s.id}>
              <button type="button" className="steplink" onClick={() => go(stepRoute(s.id))}>
                <LevelDot level={levels[i]} />
                <span className="steplink-n">{i + 1}</span>
                <span className="steplink-t">{s.title}</span>
              </button>
            </li>
          ))}
          {ch.kind === 'fondations' || ch.steps.some((s) => s.quiz && s.quiz.length) ? (
            <li>
              <button type="button" className="steplink steplink-quiz" onClick={() => go('#/point/' + ch.id)}>
                <Icon name="flag" size={16} />
                <span className="steplink-t">Point d’étape{all ? '' : ' (quand tu veux)'}</span>
              </button>
            </li>
          ) : null}
        </ol>
      ) : null}
    </li>
  );
}

export default function Path() {
  const { state, srs } = useProgress();
  const next = nextFondation(state);
  const [open, setOpen] = useState(() => (next ? next.chapter.id : null));
  const [track, setTrack] = useState(null);
  const toggle = (id) => setOpen((o) => (o === id ? null : id));

  return (
    <section className="v-body path">
      <PageHead kicker="Parcours" title="Les fondations" lead="Huit chapitres. Strudel et solfège avancent ensemble : chaque notion arrive au moment où elle sert à faire un son." />
      <ul className="chapters">
        {fondations.map((ch) => (
          <Chapter key={ch.id} ch={ch} state={state} srs={srs} open={open === ch.id} onToggle={() => toggle(ch.id)} current={next && next.chapter.id === ch.id} />
        ))}
      </ul>

      <h2 className="section-title">Les genres</h2>
      <p className="section-lead">Ce qui fait l’identité d’un style, trait par trait. Accessible dès que tu en as envie ; plus confortable après le chapitre VI.</p>
      <ul className="genrecards">
        {genres.map((g) => {
          const n = g.traits.filter((t) => state.steps[traitId(g.id, t.aspect)] && state.steps[traitId(g.id, t.aspect)].done).length;
          return (
            <li key={g.id}>
              <button type="button" className="genrecard" onClick={() => go('#/genre/' + g.id)}>
                <span className="genrecard-name">{g.name}</span>
                <span className="genrecard-bpm">{bpmText(g)}</span>
                <span className="genrecard-count">{n}/{ASPECTS.length} traits</span>
              </button>
            </li>
          );
        })}
      </ul>

      <h2 className="section-title">Approfondissements</h2>
      <p className="section-lead">Facultatifs. Les leçons de l’app d’origine qui vont au-delà des fondations : même éditeur, exercices à valider toi-même.</p>
      <ul className="tracks">
        {tracks.map((t) => {
          const ids = t.chapters.flatMap((c) => c.steps.map((s) => s.id));
          const n = ids.filter((id) => state.steps[id] && state.steps[id].done).length;
          const isOpen = track === t.id;
          return (
            <li key={t.id} className={'track' + (isOpen ? ' is-open' : '')}>
              <button type="button" className="track-head" onClick={() => setTrack(isOpen ? null : t.id)} aria-expanded={isOpen}>
                <span className="chapter-text">
                  <span className="chapter-title">{t.title}</span>
                  <span className="chapter-goal">{t.goal}</span>
                </span>
                <span className="chapter-count">{n}/{ids.length}</span>
                <Icon name="down" size={18} className="fold-arrow" />
              </button>
              {isOpen ? (
                <ul className="chapters chapters-inner">
                  {t.chapters.map((ch) => (
                    <Chapter key={ch.id} ch={{ ...ch, roman: '' }} state={state} srs={srs} open={open === ch.id} onToggle={() => toggle(ch.id)} />
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
