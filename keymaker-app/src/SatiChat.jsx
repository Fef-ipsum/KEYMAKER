// Keymaker — Chantier 5 : SatiChat, le tiroir du guide IA.
//
// Tiroir latéral droit (overlay : le flash + l'éditeur restent montés dessous,
// jamais recréés — même règle que le Parcours). Sati attend qu'on lui parle
// (proactivité OFF, réglable plus tard). Elle « voit » le flash courant et le
// code live de l'éditeur via getContext(), assemblé par buildContextBlock().
// Mémoire LOCALE (Chantier 5, tranche 2) : le fil est désormais persisté en
// IndexedDB (un seul fil global) → il survit au rechargement ET fonctionne
// hors-ligne. Les difficultés (« je comprends pas… ») sont repérées
// automatiquement et glissées dans le contexte pour que Sati s'en souvienne.
import { useCallback, useEffect, useRef, useState } from 'react';
import { streamSati, buildContextBlock, historyFromMessages, buildLessonPrompt } from './sati.js';
import {
  loadThread,
  appendExchange,
  clearThread,
  loadDifficulties,
  recordDifficulty,
  detectDifficulty,
  makeDifficultyMarker,
  buildDifficultyRecall,
} from './memory.js';

const STATUS_LABEL = {
  ok: 'connectée',
  ko: 'injoignable',
  checking: 'test en cours…',
  unknown: 'pas encore testée',
};

// Actions rapides contextuelles (low-friction, TDA-friendly).
const QUICK_ACTIONS = [
  {
    key: 'flash',
    label: 'Explique ce flash',
    prompt: "Explique-moi ce flash simplement, comme à un débutant. Va à l'essentiel.",
    mode: undefined, // Sonnet : pédagogie
  },
  {
    key: 'fix',
    label: 'Corrige mon code',
    prompt: "Regarde le code dans mon éditeur : qu'est-ce qui cloche, ou comment l'améliorer ? Sois bref et concret.",
    mode: 'fast', // Haiku : correction rapide
  },
  {
    key: 'hint',
    label: 'Un indice',
    prompt: "Donne-moi juste un petit indice pour l'exercice, sans me donner la réponse complète.",
    mode: 'fast',
  },
];

// Actions rapides du STUDIO (Chantier 32) : orientées « faire du son », pas pédagogie.
const STUDIO_ACTIONS = [
  {
    key: 'idea',
    label: 'Donne-moi une idée',
    prompt: "Propose-moi une idée de pattern Strudel sympa à essayer maintenant. Donne le code, court et directement jouable.",
    mode: undefined,
  },
  {
    key: 'improve',
    label: 'Améliore mon code',
    prompt: "Regarde le code de mon éditeur Studio et améliore-le, ou propose une variation intéressante. Donne le code modifié, bref.",
    mode: 'fast',
  },
  {
    key: 'twist',
    label: 'Surprends-moi',
    prompt: "Surprends-moi : transforme ce que j'ai dans l'éditeur en quelque chose d'inattendu mais jouable. Code + une phrase d'explication.",
    mode: undefined,
  },
];

function modelLabel(model) {
  if (!model) return '';
  if (model.includes('haiku')) return 'Haiku';
  if (model.includes('sonnet')) return 'Sonnet';
  if (model.includes('opus')) return 'Opus';
  return model;
}

// `historyFromMessages` (reconstruction PROPRE + plafond) vit désormais dans sati.js
// (pur, testable hors React) → on l'importe.

// Rendu léger : préserve les retours à la ligne (CSS pre-wrap) + **gras** et `code`
// inline, sans dangerouslySetInnerHTML.
function inlineRich(text) {
  const nodes = [];
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[2] != null) nodes.push(<strong key={k++}>{m[2]}</strong>);
    else if (m[3] != null) nodes.push(<code key={k++}>{m[3]}</code>);
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function SatiChat({ piUrl, status, onChangeUrl, onTest, getContext, onClose, studio = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('normal'); // 'normal' (Sonnet) | 'fast' (Haiku) | 'deep' (Opus — Chantier 35)
  const [difficulties, setDifficulties] = useState([]); // repères de mémoire locale (tranche 2)
  // Chantier 33 — UX Sati :
  const [confirmReset, setConfirmReset] = useState(false); // « Nouvelle conversation » en 2 temps (anti-clic)
  const [notice, setNotice] = useState('');                // avis transitoire (ex. « réinitialisée »)
  const [lessonOpen, setLessonOpen] = useState(false);     // champ « ✏️ Crée une leçon sur… »
  const [lessonSubject, setLessonSubject] = useState('');

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Miroir des difficultés pour les lire dans send() sans rouvrir la closure.
  const diffsRef = useRef(difficulties);
  useEffect(() => {
    diffsRef.current = difficulties;
  }, [difficulties]);

  const abortRef = useRef(null);
  const idRef = useRef(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const nextId = () => ++idRef.current;

  const updateMsg = useCallback((id, fn) => {
    setMessages((list) => list.map((m) => (m.id === id ? fn(m) : m)));
  }, []);

  // Auto-défilement vers le bas à chaque nouveau jeton.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Focus sur le champ à l'ouverture ; abandon de tout stream à la fermeture.
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  // Chantier 33 : l'avis transitoire s'efface tout seul après quelques secondes.
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  // À l'ouverture : recharge le fil global + les difficultés depuis IndexedDB
  // (best-effort — si la base est indisponible, on démarre simplement à vide).
  useEffect(() => {
    let alive = true;
    (async () => {
      const [thread, diffs] = await Promise.all([loadThread(), loadDifficulties()]);
      if (!alive) return;
      if (Array.isArray(thread) && thread.length) {
        const mapped = thread.map((r) => ({
          id: nextId(),
          role: r.role === 'user' ? 'user' : 'sati',
          text: r.text || '',
          model: r.model || null,
          streaming: false,
          error: false,
        }));
        setMessages(mapped);
      }
      if (Array.isArray(diffs)) setDifficulties(diffs);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(
    async (rawText, opts = {}) => {
      const text = (rawText != null ? rawText : input).trim();
      if (!text || busy) return;

      const useMode =
        opts.mode !== undefined ? opts.mode : mode === 'fast' ? 'fast' : mode === 'deep' ? 'deep' : undefined;

      setInput('');
      const userMsg = { id: nextId(), role: 'user', text };
      const satiId = nextId();
      const history = historyFromMessages(messagesRef.current);

      setMessages((list) => [
        ...list,
        userMsg,
        { id: satiId, role: 'sati', text: '', model: null, streaming: true, error: false },
      ]);
      setBusy(true);

      const ctx = typeof getContext === 'function' ? getContext() : {};

      // Repérage AUTO d'une difficulté (mémoire locale, tranche 2) : si Felix exprime
      // qu'il ne comprend pas, on pose un repère (dédupé par flash) que Sati relira au
      // prochain démarrage. Best-effort et non bloquant.
      if (detectDifficulty(text)) {
        recordDifficulty(makeDifficultyMarker(ctx))
          .then(() => loadDifficulties())
          .then((list) => {
            if (Array.isArray(list)) setDifficulties(list);
          })
          .catch(() => {});
      }

      // Chantier 35 : le contexte (avec les difficultés récentes) part SÉPARÉMENT
      // de la question → le Pi ne journalise/embedde que la question de Felix.
      const apiContext = buildContextBlock({ ...ctx, difficulties: diffsRef.current });

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const result = await streamSati({
          piUrl,
          message: text,
          context: apiContext,
          history,
          mode: useMode,
          signal: ctrl.signal,
          onModel: (mdl) => updateMsg(satiId, (mm) => ({ ...mm, model: mdl })),
          onDelta: (_t, full) => updateMsg(satiId, (mm) => ({ ...mm, text: full })),
        });
        updateMsg(satiId, (mm) => ({ ...mm, streaming: false }));
        // Persiste le tour RÉUSSI dans le fil global (IndexedDB) → survit au rechargement.
        appendExchange(text, { text: (result && result.text) || '', model: result && result.model }).catch(() => {});
      } catch (e) {
        if (e && e.name === 'AbortError') {
          updateMsg(satiId, (mm) => ({ ...mm, streaming: false, text: mm.text || '⏹ Interrompu.' }));
        } else {
          updateMsg(satiId, (mm) => ({
            ...mm,
            streaming: false,
            error: true,
            text: (e && e.message) || 'Sati est injoignable pour le moment.',
          }));
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, input, mode, piUrl, getContext, updateMsg]
  );

  const stop = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  // Chantier 33 — « Nouvelle conversation » : vide le fil AFFICHÉ et le fil
  // PERSISTÉ (IndexedDB), mais PAS les difficultés repérées ni le journal du Pi.
  // Sati repart d'une page blanche sans oublier ce qui était difficile pour Felix.
  const resetConversation = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    clearThread().catch(() => {});
    setMessages([]);
    setInput('');
    setBusy(false);
    idRef.current = 0;
    setConfirmReset(false);
    setLessonOpen(false);
    setNotice('Conversation réinitialisée — Sati garde tes points difficiles en mémoire.');
  }, []);

  // Chantier 33 — leçon personnalisée : à partir d'un sujet libre, Sati fabrique
  // une mini-leçon (concept + code jouable + exercice). Chantier 35 : en mode
  // « deep » (Opus, max_tokens 4000) → la leçon n'est plus tronquée à 1024 tokens.
  const submitLesson = useCallback(() => {
    const subject = lessonSubject.trim();
    if (!subject || busy) return;
    setLessonOpen(false);
    setLessonSubject('');
    send(buildLessonPrompt(subject), { mode: 'deep' });
  }, [lessonSubject, busy, send]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const statusLabel = STATUS_LABEL[status?.state] || STATUS_LABEL.unknown;
  const offline = status?.state !== 'ok';
  const empty = messages.length === 0;
  const recall = buildDifficultyRecall(difficulties); // rappel doux quand le fil est vide
  const actions = studio ? STUDIO_ACTIONS : QUICK_ACTIONS; // Chantier 32 : jeu d'actions selon le contexte

  return (
    <div className="learn-overlay sati-overlay" role="dialog" aria-modal="true" aria-label="Sati, le guide">
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel sati-drawer">
        <header className="learn-head">
          <div>
            <p className="kicker">Guide · IA</p>
            <h2 className="learn-title">
              <span className={'sati-dot status-' + (status?.state || 'unknown')} aria-hidden="true" /> Sati
            </h2>
            <p className="learn-sub">
              {studio
                ? 'Tu es dans le Studio. Elle voit ton code et t’aide à faire du son.'
                : 'Elle voit ton flash et ton code. Elle attend que tu lui parles.'}
            </p>
          </div>
          <div className="sati-head-actions">
            {!empty &&
              (confirmReset ? (
                <span className="sati-reset-confirm" role="group" aria-label="Confirmer la réinitialisation">
                  <span className="sati-reset-q">Effacer&nbsp;?</span>
                  <button className="sati-reset-yes" onClick={resetConversation}>
                    Oui
                  </button>
                  <button className="sati-reset-no" onClick={() => setConfirmReset(false)}>
                    Non
                  </button>
                </span>
              ) : (
                <button
                  className="sati-reset"
                  onClick={() => setConfirmReset(true)}
                  title="Nouvelle conversation : efface le fil courant, garde la mémoire de Sati"
                >
                  ⟲ Nouvelle conversation
                </button>
              ))}
            <button className="learn-close" onClick={onClose} aria-label="Fermer">
              ✕
            </button>
          </div>
        </header>

        {notice && (
          <div className="sati-notice" role="status">
            {notice}
          </div>
        )}

        {offline && (
          <div className="sati-banner" role="status">
            <span>
              Sati vit sur ton Pi — statut : <strong>{statusLabel}</strong>
              {status?.detail ? ' (' + status.detail + ')' : ''}.
            </span>
            <button className="sati-banner-test" onClick={onTest}>
              ↻ Tester
            </button>
          </div>
        )}

        <div className="sati-stream" ref={scrollRef}>
          {empty ? (
            <div className="sati-empty">
              <p className="sati-empty-lead">
                {studio
                  ? 'Salut Felix. Envie d’un son ? Demande-moi une idée, ou clique une action ci-dessous.'
                  : 'Salut Felix. Pose-moi une question sur ce flash, ou clique une action ci-dessous.'}
              </p>
              <ul className="sati-empty-list">
                {studio ? (
                  <>
                    <li>Je te propose un pattern jouable tout de suite.</li>
                    <li>Je lis ton code et je l’améliore ou le fais varier.</li>
                    <li>Je te surprends avec une idée inattendue.</li>
                  </>
                ) : (
                  <>
                    <li>J'explique le concept du flash en français, simplement.</li>
                    <li>Je lis le code de ton éditeur et je repère ce qui coince.</li>
                    <li>Je te donne un indice sans cracher la réponse.</li>
                  </>
                )}
              </ul>
              {recall && (
                <p className="sati-recall" role="note">
                  <span className="sati-recall-icon" aria-hidden="true">💡</span> {recall}
                </p>
              )}
            </div>
          ) : (
            messages.map((m) => (
              <Bubble key={m.id} m={m} />
            ))
          )}
        </div>

        <div className="sati-actions" role="group" aria-label="Actions rapides">
          {actions.map((a) => (
            <button
              key={a.key}
              className="sati-chip"
              disabled={busy}
              onClick={() => send(a.prompt, { mode: a.mode })}
              title={a.prompt}
            >
              {a.label}
            </button>
          ))}
          {!studio && (
            <button
              className={'sati-chip sati-chip-lesson' + (lessonOpen ? ' on' : '')}
              disabled={busy}
              onClick={() => setLessonOpen((v) => !v)}
              aria-expanded={lessonOpen}
              title="Sati te fabrique une mini-leçon sur le sujet de ton choix"
            >
              ✏️ Crée une leçon
            </button>
          )}
        </div>

        {lessonOpen && !studio && (
          <div className="sati-lesson" role="group" aria-label="Créer une leçon sur mesure">
            <input
              className="sati-input sati-lesson-input"
              type="text"
              value={lessonSubject}
              autoFocus
              placeholder="Sujet…  ex. « les filtres + les enveloppes »"
              onChange={(e) => setLessonSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitLesson();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setLessonOpen(false);
                }
              }}
            />
            <button
              className="btn run sati-lesson-go"
              onClick={submitLesson}
              disabled={!lessonSubject.trim() || busy}
            >
              Générer ▸
            </button>
            <button
              className="sati-lesson-cancel"
              onClick={() => {
                setLessonOpen(false);
                setLessonSubject('');
              }}
              aria-label="Annuler"
            >
              ✕
            </button>
          </div>
        )}

        <div className="sati-composer">
          <textarea
            ref={inputRef}
            className="sati-textarea"
            value={input}
            rows={2}
            placeholder="Écris à Sati…  (Entrée pour envoyer · Maj+Entrée = nouvelle ligne)"
            spellCheck={true}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="sati-composer-row">
            <div className="sati-modes" role="group" aria-label="Vitesse / modèle">
              <button
                className={'sati-mode' + (mode === 'normal' ? ' on' : '')}
                onClick={() => setMode('normal')}
                title="Sonnet — explications soignées"
              >
                Normal
              </button>
              <button
                className={'sati-mode' + (mode === 'fast' ? ' on' : '')}
                onClick={() => setMode('fast')}
                title="Haiku — réponses rapides"
              >
                Rapide
              </button>
              <button
                className={'sati-mode' + (mode === 'deep' ? ' on' : '')}
                onClick={() => setMode('deep')}
                title="Opus — explications profondes, réponses longues (plus lent)"
              >
                Profond
              </button>
            </div>
            {busy ? (
              <button className="btn stop sati-send" onClick={stop}>
                ■ Stop
              </button>
            ) : (
              <button className="btn run sati-send" onClick={() => send()} disabled={!input.trim()}>
                Envoyer ▸
              </button>
            )}
          </div>
        </div>

        <details className="sati-conn">
          <summary>⚙️ Connexion au Pi</summary>
          <div className="sati-body">
            <label className="sati-label" htmlFor="pi-url">
              URL du Pi
            </label>
            <input
              id="pi-url"
              className="sati-input"
              type="text"
              value={piUrl}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => onChangeUrl(e.target.value)}
              placeholder="https://personal-os.tailac998e.ts.net"
            />
            <div className="sati-statusline">
              <span className={'sati-dot status-' + (status?.state || 'unknown')} aria-hidden="true" />
              <span className="sati-state">Statut : {statusLabel}</span>
              {status?.detail && <span className="sati-detail">({status.detail})</span>}
            </div>
            <button className="btn run sati-test" onClick={onTest}>
              ↻ Tester la connexion
            </button>
            <p className="sati-hint">
              Via Tailscale, ton Pi est joignable de partout. En local (Wi-Fi maison), tu peux aussi utiliser{' '}
              <code>http://192.168.10.190</code>.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   <Bubble> — une bulle du fil. Sati à gauche, Felix à droite.
   --------------------------------------------------------------------------- */
function Bubble({ m }) {
  const isUser = m.role === 'user';
  const showTyping = !isUser && m.streaming && !m.text;
  return (
    <div className={'sati-msg ' + (isUser ? 'user' : 'sati') + (m.error ? ' err' : '')}>
      {!isUser && (
        <div className="sati-who">
          Sati
          {m.model && !m.error && <span className="sati-model">{modelLabel(m.model)}</span>}
        </div>
      )}
      <div className="sati-text">
        {showTyping ? <TypingDots /> : inlineRich(m.text)}
        {!isUser && m.streaming && m.text && <span className="sati-caret" aria-hidden="true" />}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="sati-typing" aria-label="Sati écrit…">
      <span />
      <span />
      <span />
    </span>
  );
}
