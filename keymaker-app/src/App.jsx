// Keymaker — app d'apprentissage Strudel/solfège.
// Chantier 6 : écran Réglages (⚙ + overlay). [build:c6-settings]
// Chantier 21 : Mode Focus (éditeur seul). Chantier 22 : erreurs inline + auto-complétion. [build:c21-focus c22-editor]
import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import StrudelEditor from './StrudelEditor.jsx';
import SatiChat from './SatiChat.jsx';
import Settings from './Settings.jsx';
import { modules } from './lessons.js';
import { countMemory, loadDifficulties, clearAllMemory } from './memory.js';
import Dashboard from './Dashboard.jsx';
import { markSeen, recordToday, isFirstVisitToday, summary as progressSummary, firstUnseenIndex, seenKeys, todayStr } from './progress.js';
import Quiz from './Quiz.jsx';
import Review from './Review.jsx';
import ExerciseCard from './ExerciseCard.jsx';
import { recordQuizResult, markPracticed, todaysReview, levelOf, readSrs } from './srs.js';
import { initSessionTracking, trackFlash } from './sessionTrack.js';
import FlowBar from './FlowBar.jsx';
import { buildFlowPlan, dailyChallenge, isDailyDone, markDailyDone } from './flow.js';
import FlashNote from './FlashNote.jsx';
import SnippetLibrary from './SnippetLibrary.jsx';
import Glossary from './Glossary.jsx'; // Chantier 48 : glossaire bilingue
import { addSnippet } from './notebook.js';
import PatternViz from './PatternViz.jsx';
import PoSync from './PoSync.jsx';
import { resolveAccent, HALO_STRENGTH, BG_PRESETS, MODULE_TINTS } from './design.js';
import Studio, { STUDIO_DEFAULT } from './Studio.jsx';

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

// Chantiers 37/38 : index id STABLE ('1.4') → coordonnées + données. La maîtrise
// et la révision parlent en ids stables (insensibles à l'insertion d'un chapitre),
// l'app navigue en indices — ce pont est calculé une fois.
const FLASH_INDEX = (() => {
  const idx = {};
  modules.forEach((m, mi) => {
    FLATS[mi].forEach((e) => {
      idx[e.flash.id] = {
        mi,
        ci: e.chapterIndex,
        fi: e.flashInChapter,
        flash: e.flash,
        where: 'Module ' + m.id + ' · Ch.' + (e.chapterIndex + 1) + ' ' + (e.chap.chapter || e.chap.title || ''),
      };
    });
  });
  return idx;
})();

// Ids stables des flashs VUS (croisement progress.js « m:c:f » ↔ srs.js « 1.4 »).
function seenIdSet() {
  const out = new Set();
  try {
    for (const k of seenKeys()) {
      const [m, c, f] = String(k).split(':').map((n) => parseInt(n, 10));
      const e = (FLATS[m] || []).find((x) => x.chapterIndex === c && x.flashInChapter === f);
      if (e) out.add(e.flash.id);
    }
  } catch { /* best-effort */ }
  return out;
}

const STORE_KEY = 'keymaker:pos';            // Chantier 7 : { m: moduleIndex, c: chapterIndex, f: flashInChapter }
const OLD_M1_KEY = 'keymaker:m1:pos';        // Chantier 3 : { c, f } (Module 1 implicite) — migré
const OLDEST_KEY = 'keymaker:ch1:flashIndex'; // Chantier 2 : index simple dans le chapitre 1 — migré

// Backend de Sati (Chantier 4). Pré-rempli avec l'URL Tailscale du Pi ; modifiable.
// Chantier 34 : quand l'app est SERVIE PAR LE PI (/keymaker/app/), le backend est
// à la même origine → défaut = window.location.origin (zéro config sur un nouvel
// appareil : tablette, téléphone). En dev local (start.bat, localhost:4321), on
// garde l'URL Tailscale comme avant.
const PI_URL_KEY = 'keymaker:piUrl';
const DEFAULT_PI_URL = (() => {
  try {
    const h = window.location.hostname;
    if (h && h !== 'localhost' && h !== '127.0.0.1') return window.location.origin;
  } catch { /* jsdom/SSR : repli statique */ }
  return 'https://personal-os.tailac998e.ts.net';
})();

// Studio (Chantier 32) — code du bac à sable, persiste sur l'appareil.
const STUDIO_CODE_KEY = 'keymaker:studio:code';
function readStudioCode() {
  try { return localStorage.getItem(STUDIO_CODE_KEY) || STUDIO_DEFAULT; } catch { return STUDIO_DEFAULT; }
}

// Réglages (Chantier 6) — persistés sur l'appareil.
const SETTINGS_KEY = 'keymaker:settings';
const TEXT_SCALE = { m: 1, l: 1.12, xl: 1.26 }; // facteur appliqué à --fs-scale + police éditeur
const DEFAULT_SETTINGS = { font: 'nunito', textScale: 'm', reduceMotion: false, editorTheme: 'strudelTheme', lineNumbers: true, theme: 'void', autocomplete: true, viz: false, posync: false, accent: 'auto', accentCustom: '#22d3ee', halo: 'balanced', backdrop: 'auto', grain: false, spotlight: false };

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

/* ---------------------------------------------------------------------------
   Icônes SVG inline — topbar & UI (remplace les emojis qui ne scalent pas).
   Toutes 15×15 viewBox, stroke-only, strokeWidth 1.5.
   --------------------------------------------------------------------------- */
const IcoHome = () => (
  <svg className="tb-btn-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 7.5L7.5 2 14 7.5V13.5a1 1 0 01-1 1H9.5v-3.5h-4V14.5H2a1 1 0 01-1-1V7.5z"/>
  </svg>
);
const IcoExpand = () => (
  <svg className="tb-btn-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 5V1h4M10 1h4v4M14 10v4h-4M5 14H1v-4"/>
  </svg>
);
const IcoMenu = () => (
  <svg className="tb-btn-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <line x1="1.5" y1="3.5" x2="13.5" y2="3.5"/>
    <line x1="1.5" y1="7.5" x2="13.5" y2="7.5"/>
    <line x1="1.5" y1="11.5" x2="13.5" y2="11.5"/>
  </svg>
);
const IcoStudio = () => (
  <svg className="tb-btn-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="3" y1="2" x2="3" y2="13"/>
    <line x1="7.5" y1="2" x2="7.5" y2="13"/>
    <line x1="12" y1="2" x2="12" y2="13"/>
    <circle cx="3" cy="5.5" r="1.6"/>
    <circle cx="7.5" cy="9.5" r="1.6"/>
    <circle cx="12" cy="4.5" r="1.6"/>
  </svg>
);
const IcoGear = () => (
  <svg className="tb-btn-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="2.2"/>
    <path d="M7.5 1v1.8m0 8.4V13m-6.5-5.5h1.8m8.4 0H13M3.3 3.3l1.27 1.27m5.83 5.83 1.27 1.27M11.7 3.3l-1.27 1.27M4.43 9.3 3.16 10.57"/>
  </svg>
);
const IcoSave = () => (
  <svg className="share-btn-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7.5 1v8m0 0L5 6.5m2.5 2.5L10 6.5"/>
    <path d="M2 11v2.5a1 1 0 001 1h9a1 1 0 001-1V11"/>
  </svg>
);
const IcoExternal = () => (
  <svg className="share-btn-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2H2.5a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9"/>
    <path d="M9 1h5v5M8 7l6-6"/>
  </svg>
);
const IcoDownload = () => (
  <svg className="share-btn-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7.5 1v9m0 0L5 7.5m2.5 2.5L10 7.5"/>
    <path d="M1.5 12v1.5a1 1 0 001 1h10a1 1 0 001-1V12"/>
  </svg>
);
const IcoBookmark = () => (
  <svg className="dash-lib-ico" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 2h9a1 1 0 011 1v9.5l-4.5-2.5L4 12.5V3a1 1 0 011-1z"/>
  </svg>
);

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
  const [glossaryOpen, setGlossaryOpen] = useState(false); // Chantier 48 : glossaire bilingue
  const [studioOpen, setStudioOpen] = useState(false); // Chantier 32 : Studio (bac à sable, hors leçon)
  const studioEditorRef = useRef(null);                // éditeur Strudel dédié au Studio
  const [snipMsg, setSnipMsg] = useState(''); // Chantier 27 : confirmation éphémère de sauvegarde

  // Chantiers 37/38/39 : quiz de chapitre, révision espacée, maîtrise.
  const [quizFor, setQuizFor] = useState(null);     // null | { mi, ci } — chapitre quizzé
  const [reviewOpen, setReviewOpen] = useState(false); // session de révision (SRS)
  const [srsTick, setSrsTick] = useState(0);        // invalide les dérivés après chaque résultat

  // Chantier 40 — mode consultation (téléphone) : éditeur replié par défaut sur
  // petit écran. Le DOM de l'éditeur reste MONTÉ (règle d'or : jamais recréé) ;
  // seul son cadre est masqué en CSS. Run/Stop restent visibles : on peut
  // écouter les exemples sans éditer. Non persisté : re-déduit du viewport.
  const [editorHidden, setEditorHidden] = useState(() => {
    try { return window.matchMedia('(max-width: 600px)').matches; } catch { return false; }
  });

  // Chantier 44 — Mode Flow : « j'ai X minutes » → plan local (révision → nouveau
  // → défi), bandeau FlowBar par-dessus l'app qui reste 100 % utilisable.
  const [flow, setFlow] = useState(null); // { plan, stepIndex, startTs, minutes, learnLeft, stats }

  // Chantier 43 — défi du jour : déterministe par date, marqué « relevé » localement.
  const [dailyTick, setDailyTick] = useState(0);
  const daily = useMemo(() => {
    const t = todayStr();
    return { challenge: dailyChallenge(t), done: isDailyDone(t) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashOpen, dailyTick]);

  const takeDaily = useCallback(async () => {
    const ed = editorRef.current;
    if (ed && daily.challenge.code) {
      try { await ed.stop(); } catch { /* ignore */ }
      try { ed.setCode(daily.challenge.code); } catch { /* ignore */ }
    }
    try { markDailyDone(todayStr()); } catch { /* ignore */ }
    setDailyTick((t) => t + 1);
    setDashOpen(false);
  }, [daily]);

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

  // Sessions réelles (Chantier 42, S3) : temps actif + flashs vus → POSTés au
  // Pi à la mise en arrière-plan (la table keymaker.sessions se réveille).
  // Les refs évitent de réinstaller les listeners à chaque navigation.
  const sessionCtxRef = useRef({ piUrl, moduleId: modules[mod] ? modules[mod].id : null });
  sessionCtxRef.current = { piUrl, moduleId: modules[mod] ? modules[mod].id : null };
  useEffect(() => {
    initSessionTracking(() => sessionCtxRef.current);
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

  // Police UI (Chantier 41) — posée sur <html> ; les @font-face vendorisés font le reste.
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-font', settings.font || 'nunito');
    } catch { /* ignore */ }
  }, [settings.font]);

  // Personnalisation (Apparence) — applique accent / halo / fond / effets sur <html>.
  // 100 % cosmétique, tout en try/catch : un souci ici ne doit jamais casser l'app.
  // Accent 'auto' → on RETIRE l'override (chaque thème garde sa couleur d'origine).
  useEffect(() => {
    const el = document.documentElement;
    try {
      const A = resolveAccent(settings);
      if (A) {
        el.style.setProperty('--accent', A.hex);
        el.style.setProperty('--accent-rgb', A.rgb);
        el.style.setProperty('--accent-ink', A.ink);
      } else {
        el.style.removeProperty('--accent');
        el.style.removeProperty('--accent-rgb');
        el.style.removeProperty('--accent-ink');
      }
      el.style.setProperty('--glow-strength', String(HALO_STRENGTH[settings.halo] ?? 1));
      // Fond : presets réservés aux thèmes sombres ; sinon on laisse le thème faire.
      const dark = (settings.theme || 'void') !== 'light';
      const bp = dark ? BG_PRESETS[settings.backdrop] : null;
      if (bp) {
        el.style.setProperty('--bg', bp.bg);
        el.style.setProperty('--bg-2', bp.bg2);
        el.style.setProperty('--bg-fade', bp.fade);
      } else {
        el.style.removeProperty('--bg');
        el.style.removeProperty('--bg-2');
        el.style.removeProperty('--bg-fade');
      }
      el.classList.toggle('grain-on', !!settings.grain);
      el.classList.toggle('spotlight-on', !!settings.spotlight);
    } catch { /* cosmétique */ }
  }, [settings.accent, settings.accentCustom, settings.halo, settings.backdrop, settings.grain, settings.spotlight, settings.theme]);

  // Lumière au curseur (spotlight) — met à jour --mx/--my (coords viewport) lues par
  // la CSS. Coupée si « réduire les animations ». Listener passif, retiré quand off.
  useEffect(() => {
    if (!settings.spotlight || settings.reduceMotion) return;
    const onMove = (e) => {
      try {
        const el = document.documentElement;
        el.style.setProperty('--mx', e.clientX + 'px');
        el.style.setProperty('--my', e.clientY + 'px');
      } catch { /* ignore */ }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [settings.spotlight, settings.reduceMotion]);

  // Réglages d'éditeur : appliqués dès qu'il est prêt, puis à chaque changement.
  useEffect(() => {
    if (ready) applyEditorSettings(editorRef.current, settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, settings.editorTheme, settings.lineNumbers, settings.textScale, settings.autocomplete]);

  // Chantier 57 — à chaque changement de flash ou de module, remonter en haut de
  // la page (sinon on arrive au milieu de la leçon suivante). Respecte
  // « réduire les animations » : saut instantané plutôt que défilement animé.
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: settings.reduceMotion ? 'auto' : 'smooth' });
    } catch {
      try { window.scrollTo(0, 0); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, mod]);

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

  // Niveaux de maîtrise par flash (new/seen/practiced/mastered) — Chantier 38.
  // Recalculés après chaque résultat (srsTick) et à l'ouverture des écrans qui
  // les affichent (lecture localStorage : bon marché, ~200 clés).
  const levels = useMemo(() => {
    const seen = seenIdSet();
    const srs = readSrs();
    const out = {};
    for (const id of Object.keys(FLASH_INDEX)) out[id] = levelOf(id, srs, seen.has(id));
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srsTick, dashOpen, learnOpen, quizFor, reviewOpen]);

  // File de révision du jour (Leitner) : { due: [...max 5], total }.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const review = useMemo(() => todaysReview(), [srsTick, dashOpen, reviewOpen]);

  // Cartes dues enrichies pour l'overlay de révision (titre, concept, position).
  const dueCards = useMemo(
    () => (review.due || [])
      .map((d) => {
        const e = FLASH_INDEX[d.flashId];
        return e ? { ...d, title: e.flash.title, concept: e.flash.concept, code: e.flash.code, where: e.where } : null;
      })
      .filter(Boolean),
    [review]
  );

  // Un résultat de question (quiz initial OU révision) → maîtrise + boîte Leitner.
  const quizResult = useCallback((flashId, correct) => {
    try { recordQuizResult(flashId, correct); } catch { /* best-effort */ }
    setSrsTick((t) => t + 1);
  }, []);

  // Exercice validé par Sati (Chantier 39) → flash « pratiqué ».
  const practiced = useCallback((flashId) => {
    try { markPracticed(flashId); } catch { /* best-effort */ }
    setSrsTick((t) => t + 1);
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

  // Chantier 32 — Studio : ouvre le bac à sable en coupant d'abord le son de la leçon
  // (un seul éditeur joue à la fois ; ils partagent l'AudioContext global de Strudel).
  const openStudio = useCallback(async () => {
    try { if (editorRef.current) await editorRef.current.stop(); } catch { /* ignore */ }
    setPlaying(false);
    setStudioOpen(true);
  }, []);

  const persistStudio = useCallback((code) => {
    try { localStorage.setItem(STUDIO_CODE_KEY, code); } catch { /* non bloquant */ }
  }, []);

  const saveStudioSnippet = useCallback(async (code) => {
    const when = new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
    try { const saved = await addSnippet({ name: 'Studio — ' + when, code, module: 'studio' }); return !!saved; }
    catch { return false; }
  }, []);

  // Contexte transmis à Sati quand Felix est dans le Studio (code live de l'éditeur dédié).
  const getStudioContext = useCallback(() => {
    const ed = studioEditorRef.current;
    let liveCode = '';
    try { if (ed && typeof ed.code === 'string') liveCode = ed.code; } catch { /* ignore */ }
    if (!liveCode) { try { liveCode = (ed && ed.editor && ed.editor.state.doc.toString()) || ''; } catch { /* ignore */ } }
    return { studio: true, moduleTitle: 'Studio', flashTitle: 'Studio libre', liveCode, error: null };
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

  // Chantier 38 — ouvrir la leçon d'un flash depuis la révision (id stable).
  const goToFlashId = useCallback((flashId) => {
    const e = FLASH_INDEX[flashId];
    if (!e) return;
    setReviewOpen(false);
    setQuizFor(null);
    setDashOpen(false);
    goToFlash(e.mi, e.ci, e.fi);
  }, [goToFlash]);

  // Chantier 44 — prochain flash NON VU, tous modules confondus (à partir du
  // module courant). Tout vu ? On avance simplement d'un flash.
  const goToNextUnseenFlash = useCallback(() => {
    try {
      for (let k = 0; k < modules.length; k++) {
        const mi = (mod + k) % modules.length;
        const u = firstUnseenIndex(mi, FLATS[mi]);
        if (u >= 0) {
          const e = FLATS[mi][u];
          goToFlash(mi, e.chapterIndex, e.flashInChapter);
          return;
        }
      }
      goNext();
    } catch { /* best-effort */ }
  }, [mod, goToFlash, goNext]);

  // Chantier 44 — démarrer / avancer / quitter le Flow.
  const startFlow = useCallback((minutes) => {
    const unseenCount = Math.max(0, Object.keys(FLASH_INDEX).length - seenIdSet().size);
    const plan = buildFlowPlan({ minutes, dueCount: review.total, unseenCount });
    if (!plan.length) return;
    setDashOpen(false);
    const first = plan[0];
    setFlow({
      plan,
      stepIndex: 0,
      startTs: Date.now(),
      minutes,
      learnLeft: first.type === 'learn' ? first.count : 0,
      stats: { reviewed: 0, learned: 0, challenged: false },
    });
    if (first.type === 'learn') goToNextUnseenFlash();
  }, [review, goToNextUnseenFlash]);

  const advanceFlow = useCallback(() => {
    if (!flow) return;
    const st = flow.plan[flow.stepIndex];
    // Étape learn multi-flashs : on décrémente et on navigue, sans changer d'étape.
    if (st && st.type === 'learn' && flow.learnLeft > 1) {
      goToNextUnseenFlash();
      setFlow({ ...flow, learnLeft: flow.learnLeft - 1, stats: { ...flow.stats, learned: flow.stats.learned + 1 } });
      return;
    }
    const stats = { ...flow.stats };
    if (st && st.type === 'learn') stats.learned += 1;
    if (st && st.type === 'challenge') stats.challenged = true;
    const ni = flow.stepIndex + 1;
    const ns = flow.plan[ni];
    if (ns && ns.type === 'learn') goToNextUnseenFlash();
    setFlow({ ...flow, stepIndex: ni, learnLeft: ns && ns.type === 'learn' ? ns.count : 0, stats });
  }, [flow, goToNextUnseenFlash]);

  const quitFlow = useCallback(() => setFlow(null), []);

  // Révision pendant un Flow : même mécanique SRS + compteur du récap.
  const flowReviewAnswer = useCallback((flashId, correct) => {
    quizResult(flashId, correct);
    setFlow((f) => (f ? { ...f, stats: { ...f.stats, reviewed: f.stats.reviewed + 1 } } : f));
  }, [quizResult]);

  const flowOnReviewStep = !!(flow && flow.plan[flow.stepIndex] && flow.plan[flow.stepIndex].type === 'review');

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
    // Chantier 42 : le flash entre dans la session en cours (id stable).
    try { trackFlash(current.flash.id); } catch { /* ignore */ }
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
    if (!learnOpen && !satiOpen && !settingsOpen && !dashOpen && !libraryOpen && !glossaryOpen && !focusMode && !studioOpen && quizFor == null && !reviewOpen) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (quizFor != null || reviewOpen) { setQuizFor(null); setReviewOpen(false); }
      else if (learnOpen || satiOpen || settingsOpen || dashOpen || libraryOpen || glossaryOpen) { setLearnOpen(false); setSatiOpen(false); setSettingsOpen(false); setDashOpen(false); setLibraryOpen(false); setGlossaryOpen(false); }
      else if (studioOpen) setStudioOpen(false);
      else if (focusMode) setFocusMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [learnOpen, satiOpen, settingsOpen, dashOpen, libraryOpen, glossaryOpen, focusMode, studioOpen, quizFor, reviewOpen]);

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
            className="tb-btn"
            onClick={() => setDashOpen(true)}
            title="Accueil — ta progression"
          >
            <IcoHome />
            Accueil
          </button>
          <button
            className="tb-btn"
            onClick={() => setFocusMode(true)}
            title="Mode Focus : éditeur seul, zéro distraction (Échap pour sortir)"
          >
            <IcoExpand />
            Focus
          </button>
          <button
            className="tb-btn tb-btn-studio"
            onClick={openStudio}
            title="Studio : un bac à sable libre pour faire du son (hors leçon)"
          >
            <IcoStudio />
            Studio
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
          <button className="tb-btn" onClick={() => setLearnOpen(true)} aria-haspopup="dialog">
            <IcoMenu />
            Parcours
          </button>
          <button
            className="tb-btn"
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
            title="Réglages"
          >
            <IcoGear />
            Réglages
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
        piUrl={piUrl}
        piOk={piStatus.state === 'ok'}
        readLiveCode={readLiveCode}
        onPracticed={practiced}
        onOpenQuiz={() => setQuizFor({ mi: mod, ci: current.chapterIndex })}
        dotLevels={chap.flashs.map((f) => levels[f.id] || 'new')}
        editorHidden={editorHidden}
        onToggleEditor={() => setEditorHidden((h) => !h)}
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
          levels={levels}
          onQuiz={(mi, ci) => {
            setLearnOpen(false);
            setQuizFor({ mi, ci });
          }}
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
          getContext={studioOpen ? getStudioContext : getContext}
          studio={studioOpen}
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
          reviewCount={review.total}
          onOpenReview={() => { setDashOpen(false); setReviewOpen(true); }}
          onStartFlow={startFlow}
          daily={daily}
          onDaily={takeDaily}
          onResume={() => setDashOpen(false)}
          onPickModule={(mi) => { goToModule(mi); setDashOpen(false); }}
          onOpenLibrary={() => { setDashOpen(false); setLibraryOpen(true); }}
          onOpenGlossary={() => { setDashOpen(false); setGlossaryOpen(true); }}
          onClose={() => setDashOpen(false)}
        />
      )}

      {libraryOpen && (
        <SnippetLibrary
          onLoadSnippet={loadSnippetCode}
          onClose={() => setLibraryOpen(false)}
        />
      )}

      {/* Glossaire bilingue (Chantier 48) : construit depuis les theory.items des leçons. */}
      {glossaryOpen && <Glossary onClose={() => setGlossaryOpen(false)} />}

      {studioOpen && (
        <Studio
          initialCode={readStudioCode()}
          piStatus={piStatus}
          theme={settings.theme}
          reduceMotion={settings.reduceMotion}
          onOpenSati={() => setSatiOpen(true)}
          onSaveSnippet={saveStudioSnippet}
          onOpenInStrudel={(code) => { try { window.open(strudelUrl(code), '_blank', 'noopener'); } catch { /* ignore */ } }}
          onDownload={(code) => downloadText('keymaker-studio.js', '// Keymaker — Studio (bac a sable)\n\n' + code + '\n')}
          onEditorReady={(ed) => { studioEditorRef.current = ed; applyEditorSettings(ed, settings); }}
          onPersist={persistStudio}
          onClose={() => setStudioOpen(false)}
        />
      )}

      {/* Quiz de chapitre (Chantier 37) : généré par Sati, alimente la maîtrise + le SRS. */}
      {quizFor != null && modules[quizFor.mi] && modules[quizFor.mi].chapitres[quizFor.ci] && (
        <Quiz
          piUrl={piUrl}
          moduleId={modules[quizFor.mi].id}
          moduleTitle={modules[quizFor.mi].titre || modules[quizFor.mi].title}
          chapterIndex={quizFor.ci}
          chapterTitle={modules[quizFor.mi].chapitres[quizFor.ci].chapter || modules[quizFor.mi].chapitres[quizFor.ci].title || ''}
          flashs={modules[quizFor.mi].chapitres[quizFor.ci].flashs || []}
          editorRef={editorRef}
          onResult={quizResult}
          onClose={() => setQuizFor(null)}
        />
      )}

      {/* Révision espacée (Chantier 38) : la file Leitner du jour, depuis l'Accueil. */}
      {reviewOpen && (
        <Review
          due={dueCards}
          editorRef={editorRef}
          onAnswer={flowOnReviewStep ? flowReviewAnswer : quizResult}
          onGoToFlash={goToFlashId}
          onClose={() => setReviewOpen(false)}
          onDone={flowOnReviewStep ? () => { setReviewOpen(false); advanceFlow(); } : undefined}
        />
      )}

      {/* Mode Flow (Chantier 44) : bandeau d'orchestration, l'app reste utilisable. */}
      {flow && (
        <FlowBar
          flow={flow}
          piUrl={piUrl}
          recentTitles={FLAT.slice(Math.max(0, pos - 4), pos + 1).map((e) => e.flash.id + ' ' + e.flash.title)}
          editorRef={editorRef}
          onOpenReview={() => setReviewOpen(true)}
          onNextUnseen={goToNextUnseenFlash}
          onAdvance={advanceFlow}
          onQuit={quitFlow}
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

// Chantier 41 (D5) : astuces affichées pendant le chargement du moteur.
const ENGINE_TIPS = [
  'Un ~ dans la mini-notation = un silence. Le groove vit dans les trous.',
  '.bank("RolandTR808") rebranche toute ta batterie sur une boîte mythique.',
  '<a b c> joue UNE valeur par cycle — parfait pour faire évoluer un pattern.',
  'hh*4 répète le hi-hat 4 fois dans le temps d\'une seule note.',
  'Ctrl+Enter met à jour le son SANS le couper : c\'est ça, le live coding.',
  '.lpf(800) adoucit le son — ouvre-le doucement pour faire monter un morceau.',
  '.slow(2) étire ton pattern, .fast(2) le compresse. Même code, autre énergie.',
  'note("c3 e3 g3") = un Do majeur égrené. Le solfège est déjà dans le code.',
];

/* ---------------------------------------------------------------------------
   <Flash> — un écran de flash, piloté par un objet `flash`.
   L'éditeur Strudel arrive en `children` (slot) pour rester monté entre les flashs.
   --------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
   <ToolsMenu> — Chantier 57 : un seul bouton « ⋯ Outils » regroupe les actions
   secondaires (Visualiseur, Sauvegarder, Ouvrir, Télécharger, + Sync PO-33 au
   Module 8). Désencombre la barre sous l'éditeur : Run / Stop restent les seules
   actions de premier plan. Popover non modal : clic dehors ou Échap pour fermer.
   --------------------------------------------------------------------------- */
function ToolsMenu({ vizOpen, onToggleViz, posyncOpen, onTogglePosync, showPosync, onSaveSnippet, onOpenInStrudel, onDownloadJs }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // Action one-shot : exécute puis referme le menu.
  const fire = (fn) => () => { try { if (fn) fn(); } finally { setOpen(false); } };
  const toolActive = vizOpen || (showPosync && posyncOpen);

  return (
    <div className={'tools-menu' + (open ? ' open' : '')} ref={wrapRef}>
      <button
        type="button"
        className={'btn tools-trigger' + (open ? ' on' : '') + (toolActive ? ' active' : '')}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Outils du pattern (visualiseur, sauvegarde, export…)"
      >
        <span className="tools-trigger-ico" aria-hidden="true">⋯</span>
        <span className="tools-trigger-label">Outils</span>
      </button>

      {open && (
        <div className="tools-pop" role="menu" aria-label="Outils du pattern">
          <button type="button" role="menuitemcheckbox" aria-checked={vizOpen} className={'tools-item' + (vizOpen ? ' checked' : '')} onClick={fire(onToggleViz)}>
            <span className="tools-item-ico" aria-hidden="true">◫</span>
            <span className="tools-item-label">Visualiseur de rythme</span>
            {vizOpen && <span className="tools-item-state">activé</span>}
          </button>

          {showPosync && (
            <button type="button" role="menuitemcheckbox" aria-checked={posyncOpen} className={'tools-item' + (posyncOpen ? ' checked' : '')} onClick={fire(onTogglePosync)}>
              <span className="tools-item-ico" aria-hidden="true">◧</span>
              <span className="tools-item-label">Sync PO-33</span>
              {posyncOpen && <span className="tools-item-state">activé</span>}
            </button>
          )}

          <div className="tools-sep" role="separator" />

          <button type="button" role="menuitem" className="tools-item" onClick={fire(onSaveSnippet)}>
            <span className="tools-item-ico" aria-hidden="true"><IcoSave /></span>
            <span className="tools-item-label">Sauvegarder</span>
          </button>
          <button type="button" role="menuitem" className="tools-item" onClick={fire(onOpenInStrudel)}>
            <span className="tools-item-ico" aria-hidden="true"><IcoExternal /></span>
            <span className="tools-item-label">Ouvrir dans Strudel</span>
          </button>
          <button type="button" role="menuitem" className="tools-item" onClick={fire(onDownloadJs)}>
            <span className="tools-item-ico" aria-hidden="true"><IcoDownload /></span>
            <span className="tools-item-label">Télécharger .js</span>
          </button>
        </div>
      )}
    </div>
  );
}

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
  piUrl,
  piOk,
  readLiveCode,
  onPracticed,
  onOpenQuiz,
  dotLevels,
  editorHidden,
  onToggleEditor,
  children,
}) {
  // Astuce du loader : choisie une fois (stable tant que le moteur charge).
  const [engineTip] = useState(() => ENGINE_TIPS[Math.floor(Math.random() * ENGINE_TIPS.length)]);
  return (
    <main className="stage" style={{ '--mtint': MODULE_TINTS[moduleId] }}>
      <p className="kicker">{flash.kicker}</p>
      <h1 className="title">{flash.title}</h1>

      <section className="card concept">
        <p>{flash.concept}</p>
      </section>

      {/* Carnet de notes (Chantier 24) — sous le concept, replié si vide. */}
      <FlashNote key={flashKey} flashKey={flashKey} />

      <section className={'editor-block' + (editorHidden ? ' editor-hidden' : '')}>
        <div className="editor-frame">{children}</div>

        <div className="controls">
          {/* Chantier 40 : visible uniquement ≤ 600px (mode consultation). */}
          <button
            className="btn editor-toggle"
            onClick={onToggleEditor}
            aria-expanded={!editorHidden}
            title={editorHidden ? "Afficher l'éditeur de code" : "Replier l'éditeur (mode consultation)"}
          >
            {editorHidden ? '⌨ Voir le code' : '⌨ Replier le code'}
          </button>
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
          <ToolsMenu
            vizOpen={vizOpen}
            onToggleViz={onToggleViz}
            posyncOpen={posyncOpen}
            onTogglePosync={onTogglePosync}
            showPosync={moduleId === 8}
            onSaveSnippet={onSaveSnippet}
            onOpenInStrudel={onOpenInStrudel}
            onDownloadJs={onDownloadJs}
          />
          {snipMsg && <span className="tools-msg" role="status">{snipMsg}</span>}
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
        {posyncOpen && moduleId === 8 && (
          <PoSync
            editorRef={editorRef}
            playing={playing}
            theme={theme}
            reduceMotion={reduceMotion}
            onClose={onTogglePosync}
          />
        )}

        {!ready && !error && (
          <div className="engine-loading" role="status">
            <span className="engine-spinner" aria-hidden="true" />
            <div>
              <p className="engine-loading-main">Le moteur Strudel arrive…</p>
              <p className="engine-loading-tip">💡 {engineTip}</p>
            </div>
          </div>
        )}
        {error && <p className="hint err">{error}</p>}

        {/* Erreur de code Strudel (Chantier 22) : message simplifié, sous l'éditeur. */}
        {evalError && (
          <div className="eval-error" role="alert">
            <span className="eval-error-tag" aria-hidden="true">erreur</span>
            <code className="eval-error-msg">{evalError}</code>
          </div>
        )}

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

      {/* Capsule culture (Chantier 51) : un vrai morceau à écouter, lié au flash. */}
      {flash.culture && (
        <section className="card culture">
          <h2>🎧 À écouter</h2>
          <p>
            <strong>{flash.culture.artist} — {flash.culture.track}</strong> : {flash.culture.why}
          </p>
        </section>
      )}

      {/* Carte Exercice + « ✓ Vérifie mon exercice » (Chantier 39). key = reset au changement de flash. */}
      <ExerciseCard
        key={'exo:' + flashKey}
        flash={flash}
        piUrl={piUrl}
        piOk={piOk}
        readLiveCode={readLiveCode}
        onPracticed={onPracticed}
      />

      {flash.recap && <RecapTable recap={flash.recap} />}

      {flash.free && (
        <section className="card free">
          <h2>Exercice libre · fin du chapitre</h2>
          <p>{flash.free}</p>
        </section>
      )}

      {/* Fin de chapitre (Chantier 37) : le quiz transforme « vu » en « su ». */}
      {withinIndex === withinTotal - 1 && onOpenQuiz && (
        <section className="card quiz-cta">
          <div className="quiz-cta-txt">
            <h2>Quiz du chapitre</h2>
            <p>3-4 questions pour ancrer ce que tu viens de voir. Les ratés reviendront en révision, au bon moment.</p>
          </div>
          <button className="btn quiz-cta-btn" onClick={onOpenQuiz}>🎯 Lancer le quiz</button>
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
        dotLevels={dotLevels}
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
function FlashNav({ moduleId, hasNextModule, onNextModule, chapterNumber, chapterTitle, withinIndex, withinTotal, atStart, atEnd, onPrev, onNext, dotLevels }) {
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
              className={
                'dot-step' +
                (i === withinIndex ? ' current' : i < withinIndex ? ' done' : '') +
                (dotLevels && dotLevels[i] ? ' lvl-' + dotLevels[i] : '')
              }
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
function LearnOverlay({ modules, currentModuleIndex, currentChapterIndex, currentFlashInChapter, levels, onQuiz, onPick, onClose }) {
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
      <div className="learn-panel" style={{ '--mtint': MODULE_TINTS[module.id] }}>
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
            // Chantier 37 : le quiz du chapitre apparaît dès que tous ses flashs ont été vus.
            const quizReady =
              !locked && onQuiz && levels &&
              c.flashs.length > 0 &&
              c.flashs.every((f) => levels[f.id] && levels[f.id] !== 'new');
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
                  {quizReady && (
                    <span
                      className="learn-quiz-btn"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); onQuiz(view, ci); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); onQuiz(view, ci); } }}
                      title="Quiz de ce chapitre (3-4 questions)"
                    >
                      🎯 Quiz
                    </span>
                  )}
                  {locked && <span className="learn-lock">à venir</span>}
                  {isCurrent && !locked && <span className="learn-here-dot" aria-hidden="true" />}
                  <span className={'learn-chevron' + (isOpen ? ' open' : '')} aria-hidden="true">
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <ol className="learn-list" data-haslevels="true">
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
                      const lvl = (levels && levels[f.id]) || 'new';
                      return (
                        <li key={f.id}>
                          <button
                            className={'learn-item' + (here ? ' current' : '')}
                            onClick={() => onPick(view, ci, fi)}
                            aria-current={here ? 'true' : undefined}
                          >
                            <span
                              className={'learn-id lvl-' + lvl}
                              title={lvl === 'mastered' ? 'maîtrisé' : lvl === 'practiced' ? 'pratiqué' : lvl === 'seen' ? 'vu' : 'pas encore vu'}
                            >
                              {f.id}
                            </span>
                            <span className="learn-item-title">{f.title}</span>
                            {lvl === 'mastered' && <span className="learn-lvl-star" aria-hidden="true">✦</span>}
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

        {/* Chantier 38 : lecture des pastilles de maîtrise. */}
        <p className="learn-legend" aria-hidden="true">
          <span className="lvl-dot lvl-seen" /> vu
          <span className="lvl-dot lvl-practiced" /> pratiqué
          <span className="lvl-dot lvl-mastered" /> maîtrisé
        </p>
      </div>
    </div>
  );
}
