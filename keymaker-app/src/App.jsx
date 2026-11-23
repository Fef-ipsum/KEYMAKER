// Keymaker 2 — la coque : navigation, éditeur unique, panneaux (wiki, Sati).
//
// Quatre lieux, pas plus : Aujourd'hui · Parcours · Wiki · Studio (+ Genres, qui
// prolonge le parcours). Sati et les réglages sont deux icônes discrètes.
//
// POINT D'EXTENSION — « Refaire un morceau » (voir docs/CONCEPTION_REFAIRE_UN_MORCEAU.md) :
// une nouvelle fonction s'ajoute en déclarant sa route dans ROUTES ci-dessous et,
// si elle utilise l'éditeur, en la marquant `dock: true`.

import { Component, useEffect, useMemo, useState } from 'react';
import * as engine from './lib/engine.js';
import { readSettings, writeSettings, applySettings, effectiveTheme, prefersReducedMotion } from './lib/store.js';
import { useRoute, go, useEngine, useFlow, writeFlow, useProgressBump } from './lib/app.js';
import { WikiContext, Icon } from './ui.jsx';
import EditorDock from './components/EditorDock.jsx';
import Sati from './components/Sati.jsx';
import Today from './views/Today.jsx';
import Path from './views/Path.jsx';
import Step from './views/Step.jsx';
import Quiz from './views/Quiz.jsx';
import Studio from './views/Studio.jsx';
import { GenreList, GenreOverview, Trait, Assemble, CaseStudy, Compare } from './views/Genres.jsx';
import { WikiHome, WikiEntryPage, WikiSheet, Annotations } from './views/Wiki.jsx';
import { Settings, Session } from './views/Settings.jsx';
import SchemaReview from './views/SchemaReview.jsx';
import { byId } from './content/wiki/index.js';

// Chaque route : { tab (onglet allumé), dock (utilise l'éditeur), where (pour Sati), view }.
function resolve(route, ctx) {
  const [a, b] = route.parts;
  switch (route.name) {
    case 'parcours': return { tab: 'parcours', where: 'le parcours', view: <Path /> };
    case 'etape': return { tab: 'parcours', dock: true, where: 'l’étape « ' + a + ' »', view: <Step id={a} settings={ctx.settings} reduceMotion={ctx.reduceMotion} /> };
    case 'point': return { tab: 'parcours', where: 'un point d’étape (quiz)', view: <Quiz mode="point" chapterId={a} /> };
    case 'revision': return { tab: 'aujourdhui', where: 'une révision (quiz)', view: <Quiz mode="revision" /> };
    case 'genres': return { tab: 'genres', where: 'la liste des genres', view: <GenreList /> };
    case 'genre':
      if (!b) return { tab: 'genres', where: 'le genre ' + a, view: <GenreOverview id={a} /> };
      if (b === 'assemblage') return { tab: 'genres', dock: true, where: 'le genre ' + a + ' (assemblage)', view: <Assemble id={a} /> };
      if (b === 'cas') return { tab: 'genres', dock: true, where: 'le genre ' + a + ' (étude de cas)', view: <CaseStudy id={a} /> };
      return { tab: 'genres', dock: true, where: 'le genre ' + a + ', trait ' + b, view: <Trait id={a} aspect={b} settings={ctx.settings} /> };
    case 'comparer': return { tab: 'genres', where: 'le comparateur de genres', view: <Compare a={route.params.a} b={route.params.b} /> };
    case 'wiki': return a ? { tab: 'wiki', where: 'le wiki, entrée ' + a, view: <WikiEntryPage id={a} /> } : { tab: 'wiki', where: 'le wiki', view: <WikiHome q0={route.params.q || ''} /> };
    case 'annotations': return { tab: 'wiki', where: 'ses annotations', view: <Annotations /> };
    case 'studio': return { tab: 'studio', dock: true, where: 'le Studio (bac à sable libre)', view: <Studio defi={route.params.defi} /> };
    case 'reglages': return { tab: '', where: 'les réglages', view: <Settings settings={ctx.settings} setSettings={ctx.setSettings} /> };
    case 'schemas': return { tab: '', where: 'la page de revue des schémas vivants', view: <SchemaReview /> };
    case 'session': return { tab: 'aujourdhui', where: 'le récapitulatif de session', view: <Session /> };
    default: return { tab: 'aujourdhui', where: 'l’accueil', view: <Today /> };
  }
}

const TABS = [
  { id: 'aujourdhui', label: 'Aujourd’hui', icon: 'today', hash: '#/' },
  { id: 'parcours', label: 'Parcours', icon: 'path', hash: '#/parcours' },
  { id: 'genres', label: 'Genres', icon: 'genres', hash: '#/genres' },
  { id: 'wiki', label: 'Wiki', icon: 'wiki', hash: '#/wiki' },
  { id: 'studio', label: 'Studio', icon: 'studio', hash: '#/studio' },
];

// Si un écran plante, le reste de l'app (navigation, éditeur) reste utilisable.
class Guard extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev) {
    if (prev.hash !== this.props.hash && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="v-body narrow">
        <h1>Cet écran a rencontré un problème</h1>
        <p className="lead">Rien n’est perdu : ta progression et tes codes sont enregistrés.</p>
        <button type="button" className="btn btn-primary" onClick={() => go('#/')}>Revenir à l’accueil</button>
      </section>
    );
  }
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".55" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const t = (i / 8) * Math.PI * 2;
        return <line key={i} x1={16 + Math.sin(t) * 10.5} y1={16 - Math.cos(t) * 10.5} x2={16 + Math.sin(t) * 12.5} y2={16 - Math.cos(t) * 12.5} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />;
      })}
      <line x1="16" y1="16" x2="22" y2="9" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1.8" fill="var(--blue)" />
    </svg>
  );
}

export default function App({ updateReady, applyUpdate }) {
  const route = useRoute();
  const eng = useEngine();
  const flow = useFlow();
  useProgressBump();
  const [settings, setSettingsState] = useState(readSettings);
  const [wikiId, setWikiId] = useState(null);
  const [sati, setSati] = useState(false);
  const [scheme, setScheme] = useState(0);

  const setSettings = (s) => {
    setSettingsState(s);
    writeSettings(s);
  };
  useEffect(() => applySettings(settings), [settings, scheme]);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setScheme((n) => n + 1);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const dark = effectiveTheme(settings) === 'dark';
  const reduceMotion = prefersReducedMotion(settings);

  const ctx = { settings, setSettings, reduceMotion };
  const r = useMemo(() => resolve(route, ctx), [route.hash, settings]);

  // Changer d'écran ferme les panneaux et coupe une éventuelle pré-écoute.
  useEffect(() => {
    setWikiId(null);
    setSati(false);
  }, [route.hash]);

  const wiki = useMemo(() => ({
    openWiki: (id) => {
      if (!byId[id]) return;
      engine.endPreview();
      setWikiId(id);
    },
  }), []);
  const closeWiki = () => {
    engine.endPreview();
    setWikiId(null);
  };

  const flowActive = flow && !flow.done && route.name !== 'session';
  // Barre « Écoute d'un exemple » : utile quand le bouton d'écoute est sorti de l'écran (wiki, comparateur),
  // jamais dans un quiz, où elle masquerait « Question suivante ».
  const previewOnly = eng.previewing && eng.playing && !wikiId && route.name !== 'point' && route.name !== 'revision';

  return (
    <WikiContext.Provider value={wiki}>
      <div className="app">
        <header className="topbar">
          <button type="button" className="brand" onClick={() => go('#/')} aria-label="Keymaker, accueil"><Mark /> Keymaker</button>
          <div className="topbar-tools">
            <button type="button" className="iconbtn" onClick={() => setSati(true)} aria-label="Ouvrir Sati, l’assistante"><Icon name="sati" /></button>
            <button type="button" className="iconbtn" onClick={() => go('#/reglages')} aria-label="Réglages"><Icon name="gear" /></button>
          </div>
        </header>

        <nav className="nav" aria-label="Navigation principale">
          <button type="button" className="nav-brand brand" onClick={() => go('#/')} aria-label="Keymaker, accueil"><Mark /></button>
          {TABS.map((t) => (
            <button type="button" key={t.id} className={'nav-b' + (r.tab === t.id ? ' is-on' : '')} onClick={() => go(t.hash)} aria-current={r.tab === t.id ? 'page' : undefined}>
              <Icon name={t.icon} size={22} />
              <span>{t.label}</span>
            </button>
          ))}
          <span className="nav-spacer" />
          <button type="button" className="nav-b nav-extra" onClick={() => setSati(true)}><Icon name="sati" size={22} /><span>Sati</span></button>
          <button type="button" className={'nav-b nav-extra' + (route.name === 'reglages' ? ' is-on' : '')} onClick={() => go('#/reglages')}><Icon name="gear" size={22} /><span>Réglages</span></button>
        </nav>

        <div className="main">
          {flowActive ? (
            <div className="flowbar" role="status">
              <span>Session {flow.minutes} min · {Math.min(flow.index + 1, flow.items.length)} / {flow.items.length} — {flow.items[flow.index] ? flow.items[flow.index].label : ''}</span>
              <button type="button" className="linkbtn" onClick={() => go('#/session')}>Voir</button>
              <button type="button" className="linkbtn" onClick={() => writeFlow(null)}>Arrêter la session</button>
            </div>
          ) : null}
          {updateReady && route.name === 'aujourdhui' ? (
            <div className="stage" data-dock="off" style={{ paddingBottom: 0 }}>
              <div className="update"><span>Une nouvelle version de Keymaker est prête.</span><button type="button" className="btn btn-quiet" onClick={applyUpdate}>Mettre à jour</button></div>
            </div>
          ) : null}
          <main className="stage" data-dock={r.dock ? 'on' : 'off'}>
            <EditorDock visible={!!r.dock} settings={settings} reduceMotion={reduceMotion} dark={dark} />
            <Guard hash={route.hash}>{r.view}</Guard>
          </main>
        </div>

        {previewOnly ? (
          <div className="previewbar" role="status">
            <span>Écoute d’un exemple</span>
            <button type="button" className="btn btn-quiet" onClick={() => engine.endPreview()}><Icon name="stop" size={18} /> Arrêter</button>
          </div>
        ) : null}
        {wikiId ? <WikiSheet id={wikiId} onClose={closeWiki} onOpen={(id) => { engine.endPreview(); setWikiId(id); }} /> : null}
        {sati ? <Sati where={r.where} onClose={() => setSati(false)} /> : null}
      </div>
    </WikiContext.Provider>
  );
}
