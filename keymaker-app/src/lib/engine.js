// Keymaker 2 — pilotage du moteur Strudel (une seule instance d'éditeur).
//
// Le moteur vendorisé (public/vendor/strudel-repl, @strudel/repl 1.3.0) définit
// le composant <strudel-editor>. On en crée UN, une fois, et on ne le déplace
// jamais dans le DOM (le déplacer le réinitialiserait). Ce module est la seule
// porte d'accès : charger du code, jouer, arrêter, lire ce que le code produit.

const listeners = new Set();
let el = null; // l'élément <strudel-editor>
let ed = null; // son StrudelMirror
let state = { ready: false, playing: false, error: '', errorDetail: '', failed: '', previewing: null, click: { on: false, beats: 4 }, clickNote: '' };
let stash = null; // code mis de côté pendant une pré-écoute (wiki, quiz)
let pendingCode = null; // code demandé avant que l'éditeur soit prêt (rechargement, lien direct)
let evaluating = false; // pendant une évaluation, le moteur annonce encore l'ANCIENNE erreur
const evalListeners = new Set();
const failListeners = new Set();

// Prévenu après CHAQUE évaluation réussie, qu'elle vienne du bouton ou du clavier.
export function onEvaluated(cb) {
  evalListeners.add(cb);
  return () => evalListeners.delete(cb);
}
// Prévenu après chaque évaluation ÉCHOUÉE (faute de frappe…), avec le message affiché.
export function onEvalFailed(cb) {
  failListeners.add(cb);
  return () => failListeners.delete(cb);
}
export function clearError() {
  if (state.error || state.errorDetail) set({ error: '', errorDetail: '' });
}

function set(patch) {
  state = { ...state, ...patch };
  for (const cb of listeners) {
    try {
      cb(state);
    } catch {
      /* ignore */
    }
  }
}

export function getEngineState() {
  return state;
}
export function onEngine(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getEditor() {
  return ed;
}

/* --- Erreurs : une phrase courte, en français, qui dit quoi corriger ---------------
   rawError() garde le message technique (affiché replié, « Détail technique »).   */
function rawError(err) {
  if (!err) return '';
  const m = typeof err === 'string' ? err : err.message || String(err);
  return String(m)
    .split('\n')[0]
    .replace(/^\[?(eval|cyclist|getTrigger|webaudio)\]?:?\s*(error:)?\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .trim();
}

// Parenthèses, crochets, chevrons et guillemets : trouve ce qui manque, et où.
const CLOSE = { '(': ')', '[': ']', '{': '}', '<': '>' };
function miniCheck(body) {
  const st = [];
  for (const ch of body) {
    if ('[<{('.includes(ch)) st.push(ch);
    else if (']>})'.includes(ch)) {
      const top = st.pop();
      if (!top) return `Entre les guillemets, un « ${ch} » ne ferme rien : retire-le, ou ajoute ce qu’il doit fermer.`;
      if (CLOSE[top] !== ch) return `Entre les guillemets, un « ${top} » est fermé par « ${ch} » : un « ${top} » se ferme par « ${CLOSE[top]} ».`;
    }
  }
  if (st.length) {
    const t = st[st.length - 1];
    return `Entre les guillemets, il manque un « ${CLOSE[t]} » : chaque « ${t} » doit être refermé.`;
  }
  return '';
}
export function diagnose(code) {
  const s = String(code || '');
  const stack = [];
  let line = 1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\n') {
      line++;
      continue;
    }
    if (c === '/' && s[i + 1] === '/') {
      while (i < s.length && s[i] !== '\n') i++;
      line++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const startLine = line;
      let body = '';
      i++;
      while (i < s.length && s[i] !== c) {
        if (s[i] === '\\') {
          body += s[i] + (s[i + 1] || '');
          i += 2;
          continue;
        }
        if (s[i] === '\n') {
          if (c !== '`') break;
          line++;
        }
        body += s[i];
        i++;
      }
      if (s[i] !== c) {
        const what = c === '"' ? 'guillemet « " »' : c === "'" ? 'apostrophe « \' »' : 'accent grave « ` »';
        return `Il manque un ${what} pour fermer le texte ouvert ligne ${startLine}.`;
      }
      if (c !== "'") {
        const m = miniCheck(body);
        if (m) return m;
      }
      continue;
    }
    if ('([{'.includes(c)) stack.push({ c, line });
    else if (')]}'.includes(c)) {
      const top = stack.pop();
      if (!top) return `Ligne ${line}, un « ${c} » ne ferme rien : retire-le.`;
      if (CLOSE[top.c] !== c) return `Ligne ${line}, un « ${c} » ferme le « ${top.c} » de la ligne ${top.line} : il faudrait « ${CLOSE[top.c]} ».`;
    }
  }
  if (stack.length) {
    const t = stack[stack.length - 1];
    return `Il manque un « ${CLOSE[t.c]} » pour fermer le « ${t.c} » ouvert ligne ${t.line}.`;
  }
  return '';
}

const BANKS = ['RolandTR909', 'RolandTR808', 'RolandTR707', 'AkaiLinn'];
export function cleanError(err, code) {
  const m = rawError(err);
  if (!m) return '';
  const notFound = m.match(/sound (.+?) not found/i);
  if (notFound) {
    const name = notFound[1];
    const bank = name.match(/^([A-Z][A-Za-z0-9]+)_(.+)$/);
    if (bank && !BANKS.includes(bank[1])) {
      return `La boîte à rythmes « ${bank[1]} » n’existe pas. Choisis ${BANKS.slice(0, -1).join(', ')} ou ${BANKS[BANKS.length - 1]}, majuscules comprises.`;
    }
    return `Le son « ${name} » n’existe pas. Vérifie son nom (en minuscules pour la batterie : bd, sd, hh…).`;
  }
  let x = m.match(/^(.+) is not defined/i);
  if (x) {
    return `« ${x[1]} » n’est pas un mot que Strudel connaît. Si c’est un son, une note ou un rythme, il faut des guillemets : "${x[1]}". Sinon, vérifie l’orthographe (majuscules comprises).`;
  }
  x = m.match(/^(.+) is not a function/i);
  if (x) return `« ${x[1]} » n’est pas une fonction : vérifie le nom, et le point qui le précède.`;
  if (/Unexpected token|Unexpected end|unterminated|missing \)|Unexpected identifier|Invalid or unexpected/i.test(m)) {
    return diagnose(code) || 'Le code est incomplet ou mal fermé : vérifie les parenthèses et les guillemets.';
  }
  if (/mini|Expected .* but/i.test(m)) {
    return diagnose(code) || 'Entre les guillemets, la mini-notation est mal formée : vérifie les crochets [ ] et les chevrons < >.';
  }
  return m.length > 220 ? m.slice(0, 220) + '…' : m;
}
function setError(err, code) {
  const friendly = cleanError(err, code);
  const raw = rawError(err);
  set({ error: friendly, errorDetail: raw && raw !== friendly ? raw : '' });
  return friendly;
}

function whenDefined(timeoutMs = 25000) {
  if (typeof window === 'undefined' || !window.customElements) {
    return Promise.reject(new Error('Navigateur trop ancien.'));
  }
  if (customElements.get('strudel-editor')) return Promise.resolve();
  return Promise.race([
    customElements.whenDefined('strudel-editor'),
    new Promise((_, rej) => setTimeout(() => rej(new Error('Le moteur Strudel ne s’est pas chargé.')), timeoutMs)),
  ]);
}

// Monte l'éditeur dans `host` (appelé une seule fois par EditorDock).
export async function mountEditor(host, initialCode) {
  if (el) return ed;
  try {
    await whenDefined();
  } catch (e) {
    set({ failed: e.message || String(e) });
    throw e;
  }
  el = document.createElement('strudel-editor');
  el.setAttribute('code', initialCode || '');
  host.appendChild(el);
  el.addEventListener('update', (e) => {
    const d = e.detail || {};
    if (!!d.started !== state.playing) set({ playing: !!d.started });
    // Erreurs survenues PENDANT la lecture. Celles de l'évaluation sont traitées par
    // l'enveloppe d'evaluate (pendant l'évaluation, le moteur annonce l'ancienne).
    if (!evaluating && d.schedulerError) {
      const err = cleanError(d.schedulerError, getCode());
      if (err && err !== state.error) setError(d.schedulerError, getCode());
    }
  });
  // Les erreurs de lecture (son introuvable…) passent par le journal du moteur.
  document.addEventListener('strudel.log', (e) => {
    const msg = (e.detail && e.detail.message) || '';
    if (/error/i.test(msg) && /not found/i.test(msg)) setError(msg);
  });
  await new Promise((resolve) => {
    const t = setInterval(() => {
      if (el.editor) {
        clearInterval(t);
        resolve();
      }
    }, 60);
  });
  ed = el.editor;
  // Ctrl+Entrée dans l'éditeur appelle ed.evaluate() : on l'enveloppe pour que le
  // clavier et le bouton ▶ passent par le même chemin (erreurs, validation).
  const rawEvaluate = ed.evaluate.bind(ed);
  ed.evaluate = async (...args) => {
    set({ error: '', errorDetail: '' });
    // Ce que tu écris est ce que tu entends : un code sans setcpm/setcps joue au
    // tempo par défaut (30 cycles par minute), quel que soit le code joué avant.
    // Le moteur, lui, garderait le dernier tempo réglé (comme sur strudel.cc).
    try {
      const code = String(ed.code || '').replace(/\/\/.*$/gm, '');
      if (!/\bsetcp[ms]\s*\(/.test(code)) ed.repl.setCps(0.5);
    } catch {
      /* ignore */
    }
    let thrown = null;
    evaluating = true;
    // Clic des temps : la piste de clics est ajoutée au code ÉVALUÉ, jamais au texte
    // de l'éditeur. Si le code ne l'accepte pas, on rejoue sans clic et on le signale.
    const clicked = withClick(String(ed.code || ''));
    let clickNote = '';
    try {
      if (clicked == null) await rawEvaluate(...args);
      else {
        if (typeof ed.flash === 'function') ed.flash();
        await ed.repl.evaluate(clicked, args.length ? args[0] : true);
        const st0 = (ed.repl && ed.repl.state) || {};
        if (st0.evalError) {
          clickNote = 'Le clic des temps n’a pas pu s’ajouter à ce code : il joue sans.';
          await rawEvaluate(...args);
        }
      }
    } catch (e) {
      thrown = e;
    } finally {
      evaluating = false;
    }
    if (clickNote !== state.clickNote) set({ clickNote });
    const st = (ed.repl && ed.repl.state) || {};
    const bad = thrown || st.evalError || st.schedulerError;
    if (bad) {
      const error = setError(bad, ed.code);
      for (const cb of failListeners) {
        try {
          cb(error);
        } catch {
          /* ignore */
        }
      }
      return { ok: false, error };
    }
    for (const cb of evalListeners) {
      try {
        cb();
      } catch {
        /* ignore */
      }
    }
    return { ok: true, error: '' };
  };
  try {
    ed.setFontFamily("'JetBrains Mono','Cascadia Code',Consolas,monospace");
    ed.setLineWrappingEnabled(true);
    ed.setAutocompletionEnabled(true);
    ed.setLineNumbersDisplayed(false);
  } catch {
    /* cosmétique */
  }
  // Visualisations dans le code (_pianoroll, _punchcard, _scope…) : Strudel les dessine
  // sur 500 px de large, ce qui élargit l'éditeur sur un téléphone. On cale leur largeur
  // sur celle de l'éditeur (styles : .cm-content > canvas) et on redimensionne l'image
  // en pixels pour qu'elle reste nette. Elles relisent cette largeur à chaque image.
  let fitQueued = false;
  const fit = () => {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(() => {
      fitQueued = false;
      fitWidgets();
    });
  };
  try {
    // L'éditeur de code n'est pas forcément DANS <strudel-editor> : on observe sa vue.
    const root = (ed.editor && ed.editor.dom) || el;
    new MutationObserver(fit).observe(root, { childList: true, subtree: true });
    new ResizeObserver(fit).observe(root);
  } catch {
    /* navigateur ancien : largeur d'origine */
  }
  // Un écran a demandé son code avant que l'éditeur soit prêt : on le charge maintenant.
  if (pendingCode != null) {
    try {
      ed.setCode(pendingCode);
    } catch {
      /* ignore */
    }
    pendingCode = null;
  }
  set({ ready: true });
  return ed;
}

// Les widgets larges (pianoroll, punchcard, scope, spectre) prennent toute la largeur ;
// les ronds (spirale, roue des hauteurs) gardent leur taille, réduite si besoin (CSS).
const WIDE = /^_widget__(pianoroll|punchcard|scope|fscope|spectrum)_/;
export function fitWidgets() {
  const root = ed && ed.editor && ed.editor.dom;
  if (!root) return;
  const dpr = window.devicePixelRatio || 1;
  for (const c of root.querySelectorAll('canvas[id^="_widget_"]')) {
    if (!WIDE.test(c.id)) continue;
    c.classList.add('km-wide');
    const w = Math.round(c.clientWidth * dpr);
    if (w > 0 && c.width !== w) c.width = w;
  }
}

export function applyEditorLook({ dark, fontSize }) {
  if (!ed) return;
  try {
    ed.setTheme(dark ? 'strudelTheme' : 'githubLight');
  } catch {
    /* cosmétique */
  }
  try {
    ed.setFontSize(fontSize);
  } catch {
    /* cosmétique */
  }
}

export function getCode() {
  try {
    return ed ? ed.code || '' : pendingCode || '';
  } catch {
    return '';
  }
}

export function setCode(code) {
  if (!ed) {
    pendingCode = code || '';
    return;
  }
  try {
    ed.setCode(code || '');
  } catch {
    /* ignore */
  }
}

export function stop() {
  if (!ed) return;
  try {
    ed.stop();
  } catch {
    /* ignore */
  }
}

// Évalue et joue le code de l'éditeur. Renvoie { ok, error }.
export async function run() {
  if (!ed) return { ok: false, error: 'L’éditeur n’est pas prêt.' };
  return ed.evaluate();
}

/* --- Pré-écoute (wiki, quiz, comparateur) -----------------------------------
   Joue un exemple SANS perdre le code en cours : on le met de côté, on charge
   l'exemple, et endPreview() remet tout en place.                            */
export async function preview(code) {
  if (!ed) return { ok: false, error: 'L’éditeur n’est pas prêt.' };
  if (stash == null) stash = getCode();
  setCode(code);
  const r = await run();
  set({ previewing: code });
  return r;
}

export function endPreview() {
  if (stash == null) return;
  stop();
  setCode(stash);
  stash = null;
  set({ previewing: null, error: '' });
}

export function isPreviewing() {
  return stash != null;
}

/* --- Lire ce que le code PRODUIT ---------------------------------------------
   Après évaluation, le motif est interrogeable : on demande les événements
   (« haps ») d'un ou plusieurs cycles. C'est la base de la validation locale. */
function midiOf(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  try {
    const m = window.noteToMidi(String(v));
    return Number.isFinite(m) ? m : null;
  } catch {
    return null;
  }
}

export function queryHaps(fromCycle = 0, toCycle = 1) {
  try {
    const pat = ed && ed.repl && ed.repl.state && ed.repl.state.pattern;
    if (!pat) return [];
    return pat
      .queryArc(fromCycle, toCycle)
      .filter((h) => h.hasOnset() && !(h.value && typeof h.value === 'object' && h.value.kmclic))
      .map((h) => {
        const v = h.value && typeof h.value === 'object' ? h.value : { value: h.value };
        return {
          begin: Number(h.whole.begin.valueOf()),
          end: Number(h.whole.end.valueOf()),
          value: v,
          s: v.s != null ? String(v.s) : null,
          note: v.note != null ? midiOf(v.note) : null,
        };
      })
      .sort((a, b) => a.begin - b.begin);
  } catch {
    return [];
  }
}

/* --- Clic des temps (métronome) ---------------------------------------------
   Une piste de clics, un par temps (le premier plus fort), jouée avec le code.
   Écrite sans guillemets doubles : pas de mini-notation, donc rien à surligner
   dans l'éditeur. Ses événements portent `kmclic` et sont écartés de queryHaps :
   la validation des exercices ne les voit pas.                               */
let click = { on: false, beats: 4 };
export function getClick() {
  return click;
}
export function clickTrack(beats) {
  const n = Math.max(1, Math.min(12, Math.round(Number(beats) || 4)));
  const vel = [1, ...Array(n - 1).fill(0.55)].join(', ');
  return `s('rim').fast(${n}).velocity(seq(${vel})).gain(.45).set({ kmclic: 1 })`;
}
// Code réellement évalué quand le clic est actif (null sinon).
export function withClick(code, opts = click) {
  if (!opts || !opts.on) return null;
  const track = clickTrack(opts.beats);
  const src = String(code || '').replace(/\/\/.*$/gm, '');
  // Code à pistes ($:, nom:, nom$:) : all() s'applique à toutes les pistes.
  // Sinon, une seule expression : on lui accroche la piste avec .stack(…).
  const tracks = /(^|\n)[ \t]*_?(\$|[A-Za-z]\w*\$?):/.test(src);
  if (tracks) return code + '\nall(x => stack(x, ' + track + '))';
  return String(code || '').replace(/[\s;]*$/, '') + '\n.stack(' + track + ')';
}
export function setClick(next) {
  click = { ...click, ...next };
  set({ click });
  if (state.playing && ed) run();
}

export function currentCps() {
  try {
    return ed.repl.scheduler.cps;
  } catch {
    return 0.5;
  }
}

// Position dans le cycle en cours (0..1), pour le cadran. null si arrêté.
export function cyclePosition() {
  try {
    if (!state.playing) return null;
    const now = ed.repl.scheduler.now();
    return now - Math.floor(now);
  } catch {
    return null;
  }
}

// Mot sous le curseur de l'éditeur (pour « Dans ton code »). '' si aucun.
export function wordAtCursor() {
  try {
    const view = ed.editor;
    const pos = view.state.selection.main.head;
    const w = view.state.wordAt(pos);
    return w ? view.state.sliceDoc(w.from, w.to) : '';
  } catch {
    return '';
  }
}

// Temps du moteur, en cycles (pour le cadran). 0 si indisponible.
export function now() {
  try {
    return ed.repl.scheduler.now();
  } catch {
    return 0;
  }
}

// Redemande une mesure à l'éditeur (après un changement de mise en page).
export function refreshLayout() {
  try {
    ed.editor.requestMeasure();
  } catch {
    /* ignore */
  }
}
