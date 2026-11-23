// Sati — l'assistante en ligne (bonus). Elle voit l'écran en cours et le code de l'éditeur.
// Quand le Pi est injoignable, le panneau le dit simplement ; rien d'autre n'en dépend.

import { useEffect, useRef, useState } from 'react';
import * as engine from '../lib/engine.js';
import { streamSati, historyFromMessages } from '../lib/sati.js';
import { loadThread, appendExchange } from '../lib/memory.js';
import { readPiUrl } from '../lib/store.js';
import { Icon, useOnline } from '../ui.jsx';
import { visibleSchemas } from '../schemas/core/visible.js';
import { describeCatalog } from '../schemas/catalog.js';
import { Schema, EarQuestion, parseSchemaBlock } from '../schemas/ui/Schema.jsx';

function contextBlock(where) {
  const code = (engine.getCode() || '').trim();
  const err = engine.getEngineState().error;
  return [
    '<contexte_app>',
    'Felix utilise Keymaker 2 (apprentissage de Strudel et du solfège, débutant en solfège).',
    'Écran en cours : ' + (where || 'accueil') + '.',
    'Code actuellement dans l’éditeur :\n```\n' + (code || '(vide)') + '\n```',
    err ? 'Dernière erreur affichée : ' + err : '',
    ...schemaContext(),
    'Réponds en français, brièvement, avec un exemple de code jouable quand c’est utile. Rappel : une note sans chiffre est à l’octave 3 (c = c3).',
    '</contexte_app>',
  ].filter(Boolean).join('\n');
}

// Les schémas à l'écran (type, réglages, code) et le catalogue, généré depuis le code.
export function schemaContext() {
  const shown = visibleSchemas();
  return [
    shown.length ? 'Schémas vivants à l’écran (Felix peut les manipuler et les écouter) :\n- ' + shown.join('\n- ') : '',
    describeCatalog(),
  ].filter(Boolean);
}

// Un message de Sati : texte, blocs de code, et blocs ```schema rendus vivants.
// Un bloc invalide (type inconnu, valeur hors limites, JSON cassé) reste du texte.
function MessageBody({ text }) {
  const parts = text.split(/```/);
  return parts.map((part, j) => {
    if (j % 2 === 0) return part.trim() ? <p key={j}>{part.trim()}</p> : null;
    const lang = (part.match(/^([a-z]*)\n/) || [])[1] || '';
    const body = part.replace(/^[a-z]*\n/, '');
    if (lang === 'schema') {
      const spec = parseSchemaBlock(body);
      if (spec && spec.defi) {
        const { defi, ...base } = spec;
        return (
          <div key={j} className="chat-schema">
            <p className="chat-schema-t">Défi d’écoute : retrouve le réglage.</p>
            <EarQuestion question={{ schema: base, cible: defi.cible, regler: defi.regler }} context="chat" />
          </div>
        );
      }
      if (spec) return <div key={j} className="chat-schema"><Schema spec={spec} context="chat" title="Schéma de Sati" /></div>;
    }
    return <pre key={j} className="code code-small"><code>{body.trim()}</code></pre>;
  });
}

const QUICK = ['Explique-moi ce code, simplement', 'Pourquoi ça ne marche pas ?', 'Donne-moi une idée pour continuer'];

export default function Sati({ where, onClose }) {
  const online = useOnline();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [down, setDown] = useState('');
  const abort = useRef(null);
  const end = useRef(null);

  useEffect(() => {
    loadThread().then((t) => setMsgs(t.slice(-30)));
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (abort.current) abort.current.abort();
    };
  }, []);
  useEffect(() => {
    if (end.current) end.current.scrollIntoView({ block: 'end' });
  }, [msgs]);

  const send = async (q) => {
    const message = (q || text).trim();
    if (!message || busy) return;
    setText('');
    setDown('');
    setBusy(true);
    const history = historyFromMessages(msgs);
    setMsgs((m) => [...m, { role: 'user', text: message }, { role: 'sati', text: '' }]);
    abort.current = new AbortController();
    try {
      const res = await streamSati({
        piUrl: readPiUrl(),
        message,
        context: contextBlock(where),
        history,
        signal: abort.current.signal,
        onDelta: (_d, full) => setMsgs((m) => [...m.slice(0, -1), { role: 'sati', text: full }]),
      });
      setMsgs((m) => [...m.slice(0, -1), { role: 'sati', text: res.text }]);
      appendExchange(message, res);
    } catch (e) {
      setMsgs((m) => m.slice(0, -2));
      setText(message);
      if (!(e && e.name === 'AbortError')) setDown('Sati n’est pas joignable pour l’instant. Tout le reste de l’app fonctionne sans elle.');
    } finally {
      setBusy(false);
      abort.current = null;
    }
  };

  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label="Sati, assistante">
      <button type="button" className="sheet-scrim" onClick={onClose} aria-label="Fermer Sati" />
      <div className="sheet sheet-chat">
        <div className="sheet-bar">
          <span className="sheet-bar-title">Sati <span className="sheet-bar-sub">assistante en ligne</span></span>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>
        </div>
        <div className="chat">
          {!msgs.length ? <p className="empty">Sati voit l’écran où tu es et le code de l’éditeur. Pose ta question comme elle te vient.</p> : null}
          {msgs.map((m, i) => (
            <div key={i} className={'msg msg-' + m.role}>
              {m.text ? (busy && i === msgs.length - 1 ? <p>{m.text}</p> : <MessageBody text={m.text} />) : <p className="msg-wait">…</p>}
            </div>
          ))}
          <div ref={end} />
        </div>
        {!online ? <p className="chat-down">Tu es hors ligne : Sati attendra. Les leçons, le wiki et le Studio fonctionnent.</p> : down ? <p className="chat-down" role="status">{down}</p> : null}
        {!msgs.length && online ? (
          <div className="chips chat-quick">
            {QUICK.map((q) => <button type="button" key={q} className="chip" onClick={() => send(q)}><span className="chip-t">{q}</span></button>)}
          </div>
        ) : null}
        <form className="chatform" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <textarea value={text} rows={2} placeholder="Ta question…" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} disabled={!online} aria-label="Message pour Sati" />
          {busy ? (
            <button type="button" className="btn btn-quiet" onClick={() => abort.current && abort.current.abort()}>Arrêter</button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={!online || !text.trim()} aria-label="Envoyer"><Icon name="send" size={18} /></button>
          )}
        </form>
      </div>
    </div>
  );
}
