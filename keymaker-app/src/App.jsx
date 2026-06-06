// Keymaker — app d'apprentissage Strudel/solfège.
// Chantier 6 : écran Réglages (⚙ + overlay). [build:c6-settings]
// Chantier 21 : Mode Focus (éditeur seul). Chantier 22 : erreurs inline + auto-complétion. [build:c21-focus c22-editor]
import { useRef, useState, useCallback, useEffect } from 'react';
import StrudelEditor from './StrudelEditor.jsx';
import SatiChat from './SatiChat.jsx';
import Settings from './Settings.jsx';
import { modules } from './lessons.js';
import { countMemory, loadDifficulties, clearAllMemory } from './memory.js';
import Dashboard from './Dashboard.jsx';
import { markSeen, recordToday, isFirstVisitToday, summary as progressSummary, firstUnseenIndex } from './progress.js';
import FlashNote from './FlashNote.jsx';
import SnippetLibrary from './SnippetLibrary.jsx';
import { addSnippet } from './notebook.js';
import PatternViz from './PatternViz.jsx';
import PoSync from './PoSync.jsx';

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
const DEFAULT_SETTINGS = { textScale: 'm', reduceMotion: false, editorTheme: 'strudelTheme', lineNumbers: true, theme: 'void', autocomplete: true, viz: false, posync: false };

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
  try { editor.setAutocompletionEnabled(s.autocomplete !== false); } catch { /* cosmétique */ }
}

/* ---------------------------------------------------------------------------
   Chantier 20 — Partage & export. Encodeur AUTHENTIQUE du REPL Strudel (extrait
   du bundle vendorisé, identique a strudel.cc) : code -> hash d'URL. Ouvrir
   strudel.cc/#<hash> restaure le code. Zéro backend.
   --------------------------------------------------------------------------- */
function code2hash(code) {
  try {
    return encodeURIComponent(btoa(String.fromCharCode(...new TextEncoder().encode(code || ''))));
  } catch {
    return '';
  }
}
function strudelUrl(code) {
  return 'https://strudel.cc/#' + code2hash(code);
}
// Télécharge `text` comme fichier (Blob + lien éphémère). Best-effort.
function downloadText(filename, text) {
  try {
    const blob = new Blob([text], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* non bloquant */
  }
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
  const [evalError, setEvalError] = useState(null); // Chantier 22 : erreur de code Strudel (événement 'update')
  const [learnOpen, setLearnOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false); // Chantier 21 : Mode Focus (éphémère, non persisté)
  const [dashOpen, setDashOpen] = useState(false); // Chantier 16 : tableau de bord (accueil)
  const [libraryOpen, setLibraryOpen] = useState(false); // Chantier 27 : bibliothèque de snippets
  const [snipMsg, setSnipMsg] = useState(''); // Chantier 27 : confirmation éphémère de sauvegarde

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

  // Tableau de bord (Chantier 16) : on enregistre l'ouverture du jour et, à la
  // PREMIÈRE visite du jour, on ouvre l'accueil (dismissable, éditeur monté dessous).
  useEffect(() => {
    try {
      if (isFirstVisitToday()) setDashOpen(true);
      recordToday();
    } catch { /* best-effort */ }
  }, []);

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
  }, [ready, settings.editorTheme, settings.lineNumbers, settings.textScale, settings.autocomplete]);

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

  // Code live de l'éditeur (ce que Felix a tapé), repli sur l'état CodeMirror puis
  // sur le code de la leçon. Partagé par « Ouvrir dans Strudel » et « Télécharger ».
  const readLiveCode = useCallback(() => {
    const ed = editorRef.current;
    let liveCode = '';
    try { if (ed && typeof ed.code === 'string') liveCode = ed.code; } catch { /* ignore */ }
    if (!liveCode) {
      try { liveCode = (ed && ed.editor && ed.editor.state.doc.toString()) || ''; } catch { /* ignore */ }
    }
    return liveCode || (FLATS[mod][pos] && FLATS[mod][pos].flash.code) || '';
  }, [mod, pos]);

  // Chantier 20 — ouvrir le code courant dans le REPL officiel strudel.cc (nouvel onglet).
  const openInStrudel = useCallback(() => {
    try { window.open(strudelUrl(readLiveCode()), '_blank', 'noopener'); } catch { /* ignore */ }
  }, [readLiveCode]);

  // Chantier 20 — télécharger le code courant en fichier .js propre (en-tête commenté).
  const downloadJs = useCallback(() => {
    const cur = FLATS[mod][pos];
    const id = (cur && cur.flash && cur.flash.id) || 'flash';
    const header = '// Keymaker — Flash ' + id + ' · ' + curModule.title + '\n// ' + (curModule.titre || '') + '\n\n';
    downloadText('keymaker-flash-' + String(id).replace(/[^\w.-]/g, '_') + '.js', header + readLiveCode() + '\n');
  }, [mod, pos, curModule, readLiveCode]);

  // Chantier 27 — sauvegarder le code courant dans la bibliothèque (nom = le flash).
  const saveSnippet = useCallback(async () => {
    const cur = FLATS[mod][pos];
    const id = (cur && cur.flash && cur.flash.id) || '?';
    const title = (cur && cur.flash && cur.flash.title) || '';
    const name = ('Flash ' + id + (title ? ' — ' + title : '')).slice(0, 120);
    try {
      const saved = await addSnippet({ name, code: readLiveCode(), module: curModule.id });
      setSnipMsg(saved ? '✓ Gardé dans ta bibliothèque' : 'Sauvegarde indisponible ici');
    } catch {
      setSnipMsg('Sauvegarde indisponible ici');
    }
    setTimeout(() => setSnipMsg(''), 2600);
  }, [mod, pos, curModule, readLiveCode]);

  // Chantier 27 — charger un snippet dans l'éditeur (depuis la bibliothèque).
  const loadSnippetCode = useCallback((code) => {
    try { if (editorRef.current) editorRef.current.setCode(code); } catch { /* ignore */ }
    setLibraryOpen(false);
  }, []);

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

  // Chantier 16 — depuis une carte du tableau de bord : aller au 1er flash NON vu
  // du module choisi (ou son 1er flash si tout est déjà vu).
  const goToModule = useCallback((mIndex) => {
    const flat = FLATS[mIndex] || FLATS[0];
    let i = 0;
    try { const u = firstUnseenIndex(mIndex, flat); if (u >= 0) i = u; } catch { /* ignore */ }
    const e = flat[i] || flat[0];
    goToFlash(mIndex, e.chapterIndex, e.flashInChapter);
  }, [goToFlash]);

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
    // Chantier 16 : marque ce flash comme vu (progression). Best-effort.
    try { markSeen(mod, current.chapterIndex, current.flashInChapter); } catch { /* ignore */ }
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
    setEvalError(null);
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

  // Échap ferme d'abord les overlays ouverts (Parcours / Sati / Réglages),
  // sinon sort du Mode Focus (Chantier 21).
  useEffect(() => {
    if (!learnOpen && !satiOpen && !settingsOpen && !dashOpen && !libraryOpen && !focusMode) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (learnOpen || satiOpen || settingsOpen || dashOpen || libraryOpen) { setLearnOpen(false); setSatiOpen(false); setSettingsOpen(false); setDashOpen(false); setLibraryOpen(false); }
      else if (focusMode) setFocusMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [learnOpen, satiOpen, settingsOpen, dashOpen, libraryOpen, focusMode]);

  return (
    <div className={'app' + (settings.reduceMotion ? ' reduce-motion' : '') + (focusMode ? ' focus-mode' : '')} data-theme={settings.theme || 'void'}>
      <header className="topbar">
        <div className="wordmark">
          <span className="glyph" aria-hidden="true">꩜</span> Keymaker
        </div>

        <nav className="crumbs">
          Module {curModule.id} · {chap.chapter} · <strong>Flash {flash.id}</strong>
        </nav>

        <div className="topbar-actions">
          <button
            className="home-btn"
            onClick={() => setDashOpen(true)}
            title="Accueil — ta progression"
          >
            🏠 Accueil
          </button>
          <button
            className="focus-btn"
            onClick={() => setFocusMode(true)}
            title="Mode Focus : éditeur seul, zéro distraction (Échap pour sortir)"
          >
            ⤢ Focus
          </button>
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
        evalError={evalError}
        onRun={run}
        onStop={stop}
        onPrev={goPrev}
        onNext={goNext}
        onOpenInStrudel={openInStrudel}
        onDownloadJs={downloadJs}
        flashKey={mod + ':' + current.chapterIndex + ':' + current.flashInChapter}
        onSaveSnippet={saveSnippet}
        snipMsg={snipMsg}
        vizOpen={settings.viz}
        onToggleViz={() => updateSettings({ viz: !settings.viz })}
        posyncOpen={settings.posync}
        onTogglePosync={() => updateSettings({ posync: !settings.posync })}
        editorRef={editorRef}
        reduceMotion={settings.reduceMotion}
        theme={settings.theme}
      >
        {/* Éditeur UNIQUE : monté une fois ici, jamais remonté au changement de flash. */}
        <StrudelEditor
          initialCode={FLATS[startRef.current.mod][startRef.current.pos].flash.code}
          onReady={handleReady}
          onPlayingChange={setPlaying}
          onError={handleError}
          onEvalError={setEvalError}
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

      {dashOpen && (
        <Dashboard
          summary={progressSummary(FLATS.map((f) => f.length))}
          modules={modules}
          currentModuleIndex={mod}
          resumeLabel={'Module ' + curModule.id + ' · Flash ' + flash.id}
          onResume={() => setDashOpen(false)}
          onPickModule={(mi) => { goToModule(mi); setDashOpen(false); }}
          onOpenLibrary={() => { setDashOpen(false); setLibraryOpen(true); }}
          onClose={() => setDashOpen(false)}
        />
      )}

      {libraryOpen && (
        <SnippetLibrary
          onLoadSnippet={loadSnippetCode}
          onClose={() => setLibraryOpen(false)}
        />
      )}

      {/* Mode Focus (Chantier 21) : sortie discrète en coin (en plus de la touche Échap). */}
      {focusMode && (
        <button className="focus-exit" onClick={() => setFocusMode(false)} title="Quitter le Mode Focus">
          ✕ Quitter le focus
          <span className="focus-exit-kbd" aria-hidden="true">Échap</span>
        </button>
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
  evalError,
  onRun,
  onStop,
  onPrev,
  onNext,
  onOpenInStrudel,
  onDownloadJs,
  flashKey,
  onSaveSnippet,
  snipMsg,
  vizOpen,
  onToggleViz,
  posyncOpen,
  onTogglePosync,
  editorRef,
  reduceMotion,
  theme,
  children,
}) {
  return (
    <main className="stage">
      <p className="kicker">{flash.kicker}</p>
      <h1 className="title">{flash.title}</h1>

      <section className="card concept">
        <p>{flash.concept}</p>
      </section>

      {/* Carnet de notes (Chantier 24) — sous le concept, replié si vide. */}
      <FlashNote key={flashKey} flashKey={flashKey} />

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
          <button
            className={'btn viz-toggle' + (vizOpen ? ' on' : '')}
            onClick={onToggleViz}
            aria-pressed={vizOpen}
            title="Afficher/masquer la grille rythmique animée"
          >
            ◫ Visualiseur
          </button>
          <button
            className={'btn posync-toggle' + (posyncOpen ? ' on' : '')}
            onClick={onTogglePosync}
            aria-pressed={posyncOpen}
            title="Activer/masquer le générateur de sync PO-33"
          >
            ◧ Sync PO-33
          </button>
        </div>

        {/* Visualiseur de pattern (Chantier 26) : grille rythmique animée, lit le REPL. */}
        {vizOpen && (
          <PatternViz
            editorRef={editorRef}
            playing={playing}
            theme={theme}
            reduceMotion={reduceMotion}
            onClose={onToggleViz}
          />
        )}

        {/* Générateur de sync PO-33 (Chantier 31) : clics 2 PPQN sur le canal gauche. */}
        {posyncOpen && (
          <PoSync
            editorRef={editorRef}
            playing={playing}
            theme={theme}
            reduceMotion={reduceMotion}
            onClose={onTogglePosync}
          />
        )}

        {!ready && !error && <p className="hint loading">Chargement du moteur Strudel…</p>}
        {error && <p className="hint err">{error}</p>}

        {/* Erreur de code Strudel (Chantier 22) : message simplifié, sous l'éditeur. */}
        {evalError && (
          <div className="eval-error" role="alert">
            <span className="eval-error-tag" aria-hidden="true">erreur</span>
            <code className="eval-error-msg">{evalError}</code>
          </div>
        )}

        {/* Partage & export (Chantier 20) — masqué en Mode Focus via .focus-mode. */}
        <div className="share-row">
          <button className="share-btn" onClick={onSaveSnippet} title="Sauvegarder ce pattern dans ta bibliothèque">
            ☆ Sauvegarder
          </button>
          <button className="share-btn" onClick={onOpenInStrudel} title="Ouvrir ce code dans le REPL officiel strudel.cc (nouvel onglet)">
            ↗ Ouvrir dans Strudel
          </button>
          <button className="share-btn" onClick={onDownloadJs} title="Télécharger ce code en fichier .js">
            ⤓ Télécharger .js
          </button>
          {snipMsg && <span className="share-msg" role="status">{snipMsg}</span>}
        </div>
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
