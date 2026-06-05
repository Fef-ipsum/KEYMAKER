// Keymaker — app d'apprentissage Strudel/solfège.
// Chantier 6 : écran Réglages (⚙ + overlay). [build:c6-settings]
import { useRef, useState, useCallback, useEffect } from 'react';
import StrudelEditor from './StrudelEditor.jsx';
import SatiChat from './SatiChat.jsx';
import Settings from './Settings.jsx';
import { modules } from './lessons.js';
import { countMemory, loadDifficulties, clearAllMemory } from './memory.js';

/* ---------------------------------------------------------------------------
   Navigation multi-chapitres (Chantier 3).
   On aplatit tous les flashs des chapitres DÉVERROUILLÉS en une seule liste
   ordonnée. `pos` = index dans cette liste → Précédent / Suivant traversent
   naturellement les chapitres (fin d'un chapitre → 1er flash du suivant).
   Chaque entrée garde ses coordonnées d'origine (chapterIndex + flashInChapter)
   pour une reprise localStorage stable même quand un chapitre se déverrouille.
   --------------------------------------------------------------------------- */
function buildFlat(chapitres) {
  const flat = [];
  chapitres.forEach((chap, chapterIndex) => {
    if (chap.locked) return;
    chap.flashs.forEach((flash, flashInChapter) => {
      flat.push({ chapterIndex, flashInChapter, chap, flash });
    });
  });
  return flat;
}

// Une liste plate PAR module (les modules sont statiques → calculé une fois au chargement).
// Chantier 7 : on passe de « le Module 1 » à « plusieurs modules ».
const FLATS = modules.map((m) => buildFlat(m.chapitres));

const STORE_KEY = 'keymaker:pos';            // Chantier 7 : { m: moduleIndex, c: chapterIndex, f: flashInChapter }
const OLD_M1_KEY = 'keymaker:m1:pos';        // Chantier 3 : { c, f } (Module 1 implicite) — migré
const OLDEST_KEY = 'keymaker:ch1:flashIndex'; // Chantier 2 : index simple dans le chapitre 1 — migré

// Backend de Sati (Chantier 4). Pré-rempli avec l'URL Tailscale du Pi ; modifiable.
const PI_URL_KEY = 'keymaker:piUrl';
const DEFAULT_PI_URL = 'https://personal-os.tailac998e.ts.net';

// Réglages (Chantier 6) — persistés sur l'appareil.
const SETTINGS_KEY = 'keymaker:settings';
const TEXT_SCALE = { m: 1, l: 1.12, xl: 1.26 }; // facteur appliqué à --fs-scale + police éditeur
const DEFAULT_SETTINGS = { textScale: 'm', reduceMotion: false, editorTheme: 'strudelTheme', lineNumbers: true, theme: 'void' };

function readSettings() {
  let base = { ...DEFAULT_SETTINGS };
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) base.reduceMotion = true;
  } catch { /* ignore */ }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) base = { ...base, ...JSON.parse(raw) };
  } catch { /* mode privé : on garde les défauts */ }
  return base;
}

// Applique les réglages COSMÉTIQUES à l'éditeur Strudel. Tout en try/catch : un échec
// (méthode absente d'une future version du moteur) ne doit jamais casser l'app.
function applyEditorSettings(editor, s) {
  if (!editor) return;
  try { editor.setTheme(s.editorTheme); } catch { /* cosmétique */ }
  try { editor.setLineNumbersDisplayed(!!s.lineNumbers); } catch { /* cosmétique */ }
  try { editor.setFontSize(Math.round(19 * (TEXT_SCALE[s.textScale] || 1))); } catch { /* cosmétique */ }
}

function findPosIn(flat, chapterIndex, flashInChapter) {
  return flat.findIndex((x) => x.chapterIndex === chapterIndex && x.flashInChapter === flashInChapter);
}

// Position de départ : { mod, pos } — reprise du dernier flash atteint, avec migration
// des anciennes clés (où le Module 1 était implicite → m:0).
function readStart() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const { m, c, f } = JSON.parse(raw);
      const mi = Number.isInteger(m) && modules[m] ? m : 0;
      const i = findPosIn(FLATS[mi], c, f);
      if (i >= 0) return { mod: mi, pos: i };
    }
    const rawM1 = localStorage.getItem(OLD_M1_KEY);
    if (rawM1) {
      const { c, f } = JSON.parse(rawM1);
      const i = findPosIn(FLATS[0], c, f);
      if (i >= 0) return { mod: 0, pos: i };
    }
    const oldest = localStorage.getItem(OLDEST_KEY);
    if (oldest != null) {
      const n = parseInt(oldest, 10);
      if (!Number.isNaN(n)) {
        const i = findPosIn(FLATS[0], 0, Math.max(0, n));
        if (i >= 0) return { mod: 0, pos: i };
      }
    }
  } catch {
    /* mode privé / quota : on repart du début */
  }
  return { mod: 0, pos: 0 };
}

export default function App() {
  // Position de départ figée au 1er rendu (reprise) : module + flash.
  const startRef = useRef(readStart());
  const [mod, setMod] = useState(startRef.current.mod);
  const [pos, setPos] = useState(startRef.current.pos);

  const editorRef = useRef(null);
  // Dernier flash poussé dans l'éditeur, en clé composite "mod:pos".
  const lastAppliedRef = useRef(startRef.current.mod + ':' + startRef.current.pos);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false); // piloté par l'événement 'update' de l'éditeur
  const [error, setError] = useState(null);
  const [learnOpen, setLearnOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Réglages persistés (Chantier 6) : taille de texte, animations, thème d'éditeur, numéros de ligne.
  const [settings, setSettings] = useState(readSettings);
  const updateSettings = useCallback((patch) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* non bloquant */ }
      return next;
    });
  }, []);

  // Connexion au Pi (backend de Sati). L'app reste 100 % utilisable sans.
  const [satiOpen, setSatiOpen] = useState(false);
  const [piUrl, setPiUrl] = useState(() => {
    try { return localStorage.getItem(PI_URL_KEY) || DEFAULT_PI_URL; } catch { return DEFAULT_PI_URL; }
  });
  const [piStatus, setPiStatus] = useState({ state: 'unknown', detail: '' });

  const savePiUrl = useCallback((url) => {
    setPiUrl(url);
    try { localStorage.setItem(PI_URL_KEY, url); } catch { /* non bloquant */ }
  }, []);

  // Ping de santé du backend de Sati (silencieux, non bloquant, timeout 5 s).
  const checkPi = useCallback(async (url) => {
    let base = (url || '').trim();
    while (base.endsWith('/')) base = base.slice(0, -1);
    if (!base) { setPiStatus({ state: 'ko', detail: 'URL vide' }); return; }
    setPiStatus({ state: 'checking', detail: '' });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const r = await fetch(base + '/keymaker/health', { signal: ctrl.signal });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.status) setPiStatus({ state: 'ok', detail: 'db ' + (j.db || '?') });
      else setPiStatus({ state: 'ko', detail: 'HTTP ' + r.status });
    } catch (e) {
      setPiStatus({ state: 'ko', detail: e.name === 'AbortError' ? 'délai dépassé' : 'injoignable' });
    } finally {
      clearTimeout(timer);
    }
  }, []);

  // Ping auto au démarrage.
  useEffect(() => { checkPi(piUrl); }, [checkPi]);

  // Échelle de texte : pilote --fs-scale sur <html> (lue par body, titres et éditeur via la CSS).
  useEffect(() => {
    try {
      document.documentElement.style.setProperty('--fs-scale', String(TEXT_SCALE[settings.textScale] || 1));
    } catch { /* ignore */ }
  }, [settings.textScale]);

  // Thème de l'app (Void sombre / Light clair) — posé sur <html> pour que le fond
  // peint par body suive aussi ; toutes les cartes/overlays héritent des variables.
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', settings.theme || 'void');
    } catch { /* ignore */ }
  }, [settings.theme]);

  // Réglages d'éditeur : appliqués dès qu'il est prêt, puis à chaque changement.
  useEffect(() => {
    if (ready) applyEditorSettings(editorRef.current, settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, settings.editorTheme, settings.lineNumbers, settings.textScale]);

  // Reprendre la progression à zéro : efface les clés de reprise et revient au 1er flash.
  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(OLD_M1_KEY);
      localStorage.removeItem(OLDEST_KEY);
    } catch { /* ignore */ }
    setMod(0);
    setPos(0);
  }, []);

  // Mémoire locale de Sati (Chantier 5, tranche 2) : compteurs + repères pour l'écran
  // Réglages. App reste propriétaire ; Settings n'est que présentationnel. Best-effort
  // (memory.js se dégrade tout seul si IndexedDB est indisponible).
  const loadMemoryInfo = useCallback(async () => {
    const [counts, difficulties] = await Promise.all([countMemory(), loadDifficulties(6)]);
    return { counts, difficulties };
  }, []);

  // Dérivés du module + flash courants (recalculés à chaque rendu).
  const FLAT = FLATS[mod];
  const TOTAL = FLAT.length;
  const curModule = modules[mod];
  const current = FLAT[pos];
  const flash = current.flash;
  const chap = current.chap;

  const handleReady = useCallback((ed) => {
    editorRef.current = ed;
    setReady(true);
  }, []);

  const handleError = useCallback(() => {
    setError("Le moteur Strudel n'a pas pu se charger. Vérifie que le dossier est bien ouvert via start.bat.");
  }, []);

  // Boutons : evaluate()/stop(). La LED (playing) est mise à jour par onPlayingChange,
  // donc vraie aussi bien pour le clavier (Ctrl+Enter / Ctrl+.) que pour les boutons.
  const run = useCallback(async () => {
    if (!editorRef.current) return;
    try {
      await editorRef.current.evaluate();
      setError(null);
    } catch (e) {
      setError("Le son n'a pas pu démarrer. Reclique sur Run.");
    }
  }, []);

  const stop = useCallback(async () => {
    if (!editorRef.current) return;
    try {
      await editorRef.current.stop();
    } catch (e) {
      /* ignore */
    }
  }, []);

  // Contexte courant transmis à Sati, LU À L'INSTANT DE L'ENVOI (donc le code
  // live tapé par Felix, pas seulement celui de la leçon). StrudelMirror tient
  // `editor.code` à jour à chaque frappe (vérifié) ; repli sur l'état CodeMirror.
  const getContext = useCallback(() => {
    const ed = editorRef.current;
    let liveCode = '';
    try {
      if (ed && typeof ed.code === 'string') liveCode = ed.code;
    } catch {
      /* ignore */
    }
    if (!liveCode) {
      try {
        liveCode = (ed && ed.editor && ed.editor.state.doc.toString()) || '';
      } catch {
        /* ignore */
      }
    }
    const cur = FLAT[pos];
    return {
      moduleId: curModule.id,
      moduleTitle: curModule.title,
      chapterNumber: cur.chapterIndex + 1,
      chapterTitle: cur.chap.chapter,
      flashId: cur.flash.id,
      flashTitle: cur.flash.title,
      concept: cur.flash.concept,
      lessonCode: cur.flash.code,
      liveCode,
      error,
    };
  }, [mod, pos, error]);

  // Navigation : un seul curseur `pos` sur la liste plate du module courant. Circulation libre.
  const goTo = useCallback((i) => setPos(Math.max(0, Math.min(TOTAL - 1, i))), [TOTAL]);
  const goPrev = useCallback(() => setPos((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setPos((p) => Math.min(TOTAL - 1, p + 1)), [TOTAL]);

  // Aller à un flash précis, éventuellement dans un AUTRE module (depuis le Parcours
  // ou le bouton « module suivant »). Met à jour module + position d'un coup.
  const goToFlash = useCallback((mIndex, ci, fi) => {
    const flat = FLATS[mIndex] || FLATS[0];
    const i = findPosIn(flat, ci, fi);
    setMod(modules[mIndex] ? mIndex : 0);
    setPos(i >= 0 ? i : 0);
  }, []);

  // Persiste la position courante en coordonnées chapitre + flash (reprise au prochain lancement).
  useEffect(() => {
    try {
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({ m: mod, c: current.chapterIndex, f: current.flashInChapter })
      );
    } catch {
      /* mode privé / quota : non bloquant */
    }
  }, [mod, current.chapterIndex, current.flashInChapter]);

  // Au changement de flash : une SEULE instance d'éditeur, on pousse le nouveau code.
  // Ordre imposé (piège connu) : stop() d'abord, puis setCode().
  useEffect(() => {
    if (!ready) return;
    const key = mod + ':' + pos;
    if (key === lastAppliedRef.current) return; // 1er flash déjà affiché via initialCode
    const ed = editorRef.current;
    if (!ed) return;
    lastAppliedRef.current = key;
    setError(null);
    setPlaying(false);
    (async () => {
      try {
        await ed.stop();
      } catch {
        /* ignore */
      }
      try {
        ed.setCode(FLATS[mod][pos].flash.code);
      } catch {
        /* ignore */
      }
    })();
  }, [mod, pos, ready]);

  // Échap ferme les overlays ouverts (Parcours / Sati / Réglages).
  useEffect(() => {
    if (!learnOpen && !satiOpen && !settingsOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { setLearnOpen(false); setSatiOpen(false); setSettingsOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [learnOpen, satiOpen, settingsOpen]);

  return (
    <div className={'app' + (settings.reduceMotion ? ' reduce-motion' : '')} data-theme={settings.theme || 'void'}>
      <header className="topbar">
        <div className="wordmark">
          <span className="glyph" aria-hidden="true">꩜</span> Keymaker
        </div>

        <nav className="crumbs">
          Module {curModule.id} · {chap.chapter} · <strong>Flash {flash.id}</strong>
        </nav>

        <div className="topbar-actions">
          <button
            className={'sati-btn status-' + piStatus.state}
            onClick={() => setSatiOpen(true)}
            aria-haspopup="dialog"
            title="Connexion à Sati (ton Pi)"
          >
            <span className="sati-dot" aria-hidden="true" />
            Sati
          </button>
          <button className="parcours-btn" onClick={() => setLearnOpen(true)} aria-haspopup="dialog">
            ☰ Parcours
          </button>
          <button
            className="reglages-btn"
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
            title="Réglages"
          >
            ⚙ Réglages
          </button>
        </div>
      </header>

      <Flash
        flash={flash}
        moduleId={curModule.id}
        moduleChapters={curModule.chapitres.length}
        chapterNumber={current.chapterIndex + 1}
        chapterTitle={chap.chapter}
        withinIndex={current.flashInChapter}
        withinTotal={chap.flashs.length}
        atStart={pos === 0}
        atEnd={pos === TOTAL - 1}
        hasNextModule={mod < modules.length - 1}
        onNextModule={() => goToFlash(mod + 1, 0, 0)}
        ready={ready}
        playing={playing}
        error={error}
        onRun={run}
        onStop={stop}
        onPrev={goPrev}
        onNext={goNext}
      >
        {/* Éditeur UNIQUE : monté une fois ici, jamais remonté au changement de flash. */}
        <StrudelEditor
          initialCode={FLATS[startRef.current.mod][startRef.current.pos].flash.code}
          onReady={handleReady}
          onPlayingChange={setPlaying}
          onError={handleError}
        />
      </Flash>

      {learnOpen && (
        <LearnOverlay
          modules={modules}
          currentModuleIndex={mod}
          currentChapterIndex={current.chapterIndex}
          currentFlashInChapter={current.flashInChapter}
          onPick={(mi, ci, fi) => {
            goToFlash(mi, ci, fi);
            setLearnOpen(false);
          }}
          onClose={() => setLearnOpen(false)}
        />
      )}

      {satiOpen && (
        <SatiChat
          piUrl={piUrl}
          status={piStatus}
          onChangeUrl={savePiUrl}
          onTest={() => checkPi(piUrl)}
          getContext={getContext}
          onClose={() => setSatiOpen(false)}
        />
      )}

      {settingsOpen && (
        <Settings
          settings={settings}
          onChange={updateSettings}
          piUrl={piUrl}
          status={piStatus}
          onChangeUrl={savePiUrl}
          onTest={() => checkPi(piUrl)}
          onResetProgress={resetProgress}
          loadMemoryInfo={loadMemoryInfo}
          onClearMemory={clearAllMemory}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   <Flash> — un écran de flash, piloté par un objet `flash`.
   L'éditeur Strudel arrive en `children` (slot) pour rester monté entre les flashs.
   --------------------------------------------------------------------------- */
function Flash({
  flash,
  moduleId,
  moduleChapters,
  hasNextModule,
  onNextModule,
  chapterNumber,
  chapterTitle,
  withinIndex,
  withinTotal,
  atStart,
  atEnd,
  ready,
  playing,
  error,
  onRun,
  onStop,
  onPrev,
  onNext,
  children,
}) {
  return (
    <main className="stage">
      <p className="kicker">{flash.kicker}</p>
      <h1 className="title">{flash.title}</h1>

      <section className="card concept">
        <p>{flash.concept}</p>
      </section>

      <section className="editor-block">
        <div className="editor-frame">{children}</div>

        <div className="controls">
          <button className="btn run" onClick={onRun} disabled={!ready} aria-keyshortcuts="Control+Enter">
            <span className="btn-main">▶ Run</span>
            <span className="btn-kbd">Ctrl + Enter</span>
          </button>
          <button className="btn stop" onClick={onStop} disabled={!ready} aria-keyshortcuts="Control+.">
            <span className="btn-main">■ Stop</span>
            <span className="btn-kbd">Ctrl + .</span>
          </button>
          <span className={'status ' + (playing ? 'on' : 'off')} role="status" aria-live="polite">
            <span className="dot" aria-hidden="true" />
            {playing ? 'en cours' : 'arrêté'}
          </span>
        </div>

        {!ready && !error && <p className="hint loading">Chargement du moteur Strudel…</p>}
        {error && <p className="hint err">{error}</p>}
      </section>

      {flash.decode && (
        <section className="card decode">
          <h2>Décodage</h2>
          <ul>
            {flash.decode.map(([code, txt]) => (
              <li key={code}>
                <code>{code}</code> {txt}
              </li>
            ))}
          </ul>
        </section>
      )}

      {flash.theory && (
        <section className="card theory">
          <h2>{flash.theory.title}</h2>
          <ul>
            {flash.theory.items.map(([term, txt]) => (
              <li key={term}>
                <code>{term}</code> {txt}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card exo">
        <h2>Exercice</h2>
        <p>{flash.exercise}</p>
      </section>

      {flash.recap && <RecapTable recap={flash.recap} />}

      {flash.free && (
        <section className="card free">
          <h2>Exercice libre · fin du chapitre</h2>
          <p>{flash.free}</p>
        </section>
      )}

      <FlashNav
        moduleId={moduleId}
        hasNextModule={hasNextModule}
        onNextModule={onNextModule}
        chapterNumber={chapterNumber}
        chapterTitle={chapterTitle}
        withinIndex={withinIndex}
        withinTotal={withinTotal}
        atStart={atStart}
        atEnd={atEnd}
        onPrev={onPrev}
        onNext={onNext}
      />

      <footer className="foot">Module {moduleId} · {moduleChapters} chapitres · tourne 100&nbsp;% en local</footer>
    </main>
  );
}

/* ---------------------------------------------------------------------------
   <RecapTable> — carte « tableau » de fin de chapitre (Concept · Syntaxe · Exemple).
   1ère colonne en texte, les suivantes en <code> (syntaxe / exemples).
   --------------------------------------------------------------------------- */
function RecapTable({ recap }) {
  return (
    <section className="card recap">
      <h2>{recap.title}</h2>
      <div className="recap-scroll">
        <table className="recap-table">
          <thead>
            <tr>
              {recap.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recap.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={j === 0 ? 'recap-concept' : 'recap-code'}>
                    {j === 0 ? cell : <code>{cell}</code>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   <FlashNav> — Précédent / indicateur « Ch.N · n/m » + points / Suivant.
   Les points représentent les flashs du chapitre courant.
   --------------------------------------------------------------------------- */
function FlashNav({ moduleId, hasNextModule, onNextModule, chapterNumber, chapterTitle, withinIndex, withinTotal, atStart, atEnd, onPrev, onNext }) {
  return (
    <nav className="flash-nav" aria-label="Navigation entre les flashs">
      <button className="nav-btn prev" onClick={onPrev} disabled={atStart}>
        ◀ Précédent
      </button>

      <div className="progress" aria-label={`Chapitre ${chapterNumber}, flash ${withinIndex + 1} sur ${withinTotal}`}>
        <span className="chap-label">
          Ch.{chapterNumber} · {chapterTitle}
        </span>
        <div className="dots" aria-hidden="true">
          {Array.from({ length: withinTotal }).map((_, i) => (
            <span
              key={i}
              className={'dot-step' + (i === withinIndex ? ' current' : i < withinIndex ? ' done' : '')}
            />
          ))}
        </div>
        <span className="count">
          {withinIndex + 1}/{withinTotal}
        </span>
      </div>

      {atEnd ? (
        hasNextModule ? (
          <button className="nav-btn next next-module" onClick={onNextModule}>
            Module {moduleId + 1} ▶
          </button>
        ) : (
          <span className="nav-end" aria-live="polite">
            Fin du Module {moduleId} · tu as tout couvert 🎉
          </span>
        )
      ) : (
        <button className="nav-btn next" onClick={onNext}>
          Suivant ▶
        </button>
      )}
    </nav>
  );
}

/* ---------------------------------------------------------------------------
   <LearnOverlay> — écran Parcours : les 5 chapitres du module, repliables.
   Rendu PAR-DESSUS le flash (qui reste monté) → l'éditeur n'est jamais recréé.
   Chapitres verrouillés (3-5) : flashs listés mais non cliquables (« à venir »).
   --------------------------------------------------------------------------- */
function LearnOverlay({ modules, currentModuleIndex, currentChapterIndex, currentFlashInChapter, onPick, onClose }) {
  // `view` = le module AFFICHÉ dans le Parcours (peut différer du module en cours de lecture :
  // Felix peut feuilleter le Module 2 tout en restant « sur » un flash du Module 1).
  const [view, setView] = useState(currentModuleIndex);
  // Par défaut : seul le chapitre courant est déplié (si on regarde le module courant).
  const [open, setOpen] = useState(() => new Set([currentChapterIndex]));

  const showModule = (mi) => {
    setView(mi);
    setOpen(new Set([mi === currentModuleIndex ? currentChapterIndex : 0]));
  };
  const toggle = (ci) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(ci)) n.delete(ci);
      else n.add(ci);
      return n;
    });

  const module = modules[view];

  return (
    <div className="learn-overlay" role="dialog" aria-modal="true" aria-label="Parcours d'apprentissage">
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel">
        <header className="learn-head">
          <div>
            <p className="kicker">Parcours · Apprendre</p>
            <h2 className="learn-title">{module.titre || module.title}</h2>
            <p className="learn-sub">{module.subtitle}</p>
          </div>
          <button className="learn-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>

        {modules.length > 1 && (
          <div className="learn-modtabs" role="tablist" aria-label="Choisir un module">
            {modules.map((m, mi) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={mi === view}
                className={'learn-modtab' + (mi === view ? ' on' : '')}
                onClick={() => showModule(mi)}
              >
                Module {m.id}
                {mi === currentModuleIndex && <span className="learn-modtab-here" aria-hidden="true" title="ici" />}
              </button>
            ))}
          </div>
        )}

        <div className="learn-chapters">
          {module.chapitres.map((c, ci) => {
            const isOpen = open.has(ci);
            const isCurrent = view === currentModuleIndex && ci === currentChapterIndex;
            const locked = !!c.locked;
            return (
              <section className={'learn-chapter' + (locked ? ' locked' : '') + (isCurrent ? ' current' : '')} key={ci}>
                <button
                  className="learn-chapter-head"
                  onClick={() => toggle(ci)}
                  aria-expanded={isOpen}
                >
                  <span className="learn-chapter-no">{ci + 1}</span>
                  <span className="learn-chapter-meta">
                    <span className="learn-chapter-title">{c.title}</span>
                    <span className="learn-chapter-sub">{c.subtitle}</span>
                  </span>
                  {locked && <span className="learn-lock">à venir</span>}
                  {isCurrent && !locked && <span className="learn-here-dot" aria-hidden="true" />}
                  <span className={'learn-chevron' + (isOpen ? ' open' : '')} aria-hidden="true">
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <ol className="learn-list">
                    {c.flashs.map((f, fi) => {
                      const here = isCurrent && fi === currentFlashInChapter;
                      if (locked) {
                        return (
                          <li key={f.id}>
                            <div className="learn-item locked" aria-disabled="true">
                              <span className="learn-id">{f.id}</span>
                              <span className="learn-item-title">{f.title}</span>
                            </div>
                          </li>
                        );
                      }
                      return (
                        <li key={f.id}>
                          <button
                            className={'learn-item' + (here ? ' current' : '')}
                            onClick={() => onPick(view, ci, fi)}
                            aria-current={here ? 'true' : undefined}
                          >
                            <span className="learn-id">{f.id}</span>
                            <span className="learn-item-title">{f.title}</span>
                            {here && <span className="learn-tag">ici</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
