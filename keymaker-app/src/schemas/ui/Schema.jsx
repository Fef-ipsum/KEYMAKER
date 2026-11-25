// Schémas vivants — point d'entrée unique pour les écrans (leçon, wiki, Sati, revue).
//
//   <Schema spec={{ type: 'filtre', reglages: { lpf: 600, lpq: 0 } }} context="lecon" />
//
// Une déclaration invalide n'affiche rien (dans une leçon) ou reste du texte (Sati) :
// une information fausse est pire qu'une information absente.
import { Component, useMemo, useState } from 'react';
import { TYPES, validateSpec, stateFromSpec, earCompare, parseSchemaBlock } from '../catalog.js';

export { parseSchemaBlock };
import FiltreSchema from './FiltreSchema.jsx';
import AdsrSchema from './AdsrSchema.jsx';
import OndeSchema from './OndeSchema.jsx';
import FenvSchema from './FenvSchema.jsx';
import CycleSchema from './CycleSchema.jsx';
import TempoSchema from './TempoSchema.jsx';
import ClavierSchema from './ClavierSchema.jsx';
import SignalSchema from './SignalSchema.jsx';
import EffetSchema from './EffetSchema.jsx';
import { Icon, Rich } from '../../ui.jsx';
import { useEngine } from '../../lib/app.js';

// Ces types construisent leurs motifs avec le moteur Strudel : ils attendent qu'il soit chargé.
const NEEDS_ENGINE = new Set(['cycle', 'tempo', 'clavier', 'signal', 'effet']);

export const VIEWS = { filtre: FiltreSchema, adsr: AdsrSchema, onde: OndeSchema, 'enveloppe-filtre': FenvSchema, cycle: CycleSchema, tempo: TempoSchema, clavier: ClavierSchema, signal: SignalSchema, effet: EffetSchema };

// Un schéma qui plante ne fait pas tomber l'écran qui l'accueille.
class Guard extends Component {
  constructor(p) {
    super(p);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <p className="sch-failed">Ce schéma n’a pas pu s’afficher. Le reste de la page fonctionne.</p> : this.props.children;
  }
}

export function Schema({ spec, context = 'lecon', title }) {
  const v = useMemo(() => validateSpec(spec), [spec]);
  const eng = useEngine();
  if (!v.ok || !VIEWS[spec.type]) return null;
  const waiting = NEEDS_ENGINE.has(spec.type) && !(eng.ready && typeof window !== 'undefined' && window.mini);
  const View = VIEWS[spec.type];
  const def = TYPES[spec.type];
  return (
    <figure className="schema-wrap">
      <figcaption className="schema-cap">
        <Icon name="ear" size={16} /> <span>{title || 'Schéma vivant'}</span>
        <span className="schema-cap-type">{def.label(stateFromSpec(spec))}</span>
      </figcaption>
      <Guard>
        {waiting ? <p className="sch-failed">Le moteur se prépare…</p> : <View key={JSON.stringify(spec)} spec={spec} context={context} />}
      </Guard>
    </figure>
  );
}

/* --- « Retrouve le réglage à l'oreille » ---------------------------------------------
   Le son mystère joue ; on règle le schéma jusqu'à l'entendre pareil ; l'app compare
   les valeurs avec une tolérance. Questions écrites à la main (leçons) ou défis de Sati. */
export function earSetup(question) {
  const base = question.schema;
  const def = TYPES[base.type];
  const map = def.specKeys(base) || {};
  const target = stateFromSpec({ ...base, reglages: { ...(base.reglages || {}), ...question.cible } });
  const adjust = (question.regler || Object.keys(question.cible)).map((k) => map[k]).filter(Boolean);
  const tolerance = {};
  for (const [k, t] of Object.entries(question.tolerance || {})) if (map[k]) tolerance[map[k]] = t;
  return { def, target, adjust, tolerance };
}

export function EarQuestion({ question, onAnswer, context = 'oreille' }) {
  const setup = useMemo(() => earSetup(question), [question]);
  const [result, setResult] = useState(null);
  const [which, setWhich] = useState(null); // 'mystere' | 'moi' | null
  const View = VIEWS[question.schema.type];
  const ear = {
    target: setup.target,
    adjust: setup.adjust,
    revealed: !!result,
    fixedSource: true,
    controls: (s, toggle) => {
      const listen = (w) => {
        if (s.playing && which === w) {
          s.unclaim();
          setWhich(null);
          return;
        }
        s.setMystery(w === 'mystere');
        if (!s.playing) toggle();
        setWhich(w);
      };
      const verify = () => {
        const r = earCompare(setup.def, s.st, setup.target, setup.adjust, setup.tolerance);
        setResult(r);
        if (onAnswer) onAnswer(r.ok);
      };
      const on = (w) => s.playing && which === w;
      return (
        <div className="ear-controls">
          <button type="button" className={'sch-play' + (on('mystere') ? ' is-on' : '')} aria-pressed={on('mystere')} onClick={() => listen('mystere')}>
            <Icon name={on('mystere') ? 'stop' : 'play'} size={18} /> <span>{on('mystere') ? 'Arrêter' : 'Le son mystère'}</span>
          </button>
          <button type="button" className={'sch-play' + (on('moi') ? ' is-on' : '')} aria-pressed={on('moi')} onClick={() => listen('moi')}>
            <Icon name={on('moi') ? 'stop' : 'play'} size={18} /> <span>{on('moi') ? 'Arrêter' : 'Mon réglage'}</span>
          </button>
          {!result ? (
            <button type="button" className="btn btn-primary" onClick={verify}>
              <Icon name="check" size={18} /> Je l’entends pareil
            </button>
          ) : null}
        </div>
      );
    },
  };
  return (
    <div className="ear">
      <View spec={question.schema} ear={ear} context={context} />
      {result ? (
        <div className={'explain' + (result.ok ? ' is-right' : '')} role="status">
          <strong>{result.ok ? 'C’est ça.' : 'Pas tout à fait.'}</strong>{' '}
          {!result.ok && result.hints.length ? <span>{(() => { const t = result.hints.join(' ; '); return t.charAt(0).toUpperCase() + t.slice(1); })()}. </span> : null}
          {question.explain ? <Rich text={question.explain} /> : null}
          <p className="explain-more">{question.schema.type === 'filtre' || question.schema.type === 'adsr' ? 'La courbe en pointillé est celle du son mystère.' : 'Le code du son mystère s’affiche sous le tien.'} Tu peux continuer à comparer les deux.</p>
        </div>
      ) : null}
    </div>
  );
}
