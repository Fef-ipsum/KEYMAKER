import { useEffect, useRef } from 'react';

// Le moteur Strudel est chargé via <script defer src="/vendor/strudel-repl/index.js">
// dans index.html. Il enregistre le web component <strudel-editor> et résout
// ses propres chunks/worklets relativement à /vendor/strudel-repl/.
function whenStrudelReady(timeoutMs = 20000) {
  if (typeof window === 'undefined' || !window.customElements) {
    return Promise.reject(new Error('customElements indisponible'));
  }
  if (customElements.get('strudel-editor')) return Promise.resolve();
  return Promise.race([
    customElements.whenDefined('strudel-editor'),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Délai dépassé : moteur Strudel non chargé')), timeoutMs)
    ),
  ]);
}

// Réduit une erreur Strudel (evalError / schedulerError) à un message court et lisible :
// 1ʳᵉ ligne seulement (pas de stack brut), préfixes techniques retirés, longueur bornée.
function cleanError(err) {
  if (!err) return '';
  let m = typeof err === 'string' ? err : (err.message || String(err));
  m = String(m).split('\n')[0].replace(/^\[?eval\]?:?\s*/i, '').replace(/^Error:\s*/i, '').trim();
  return m.length > 240 ? m.slice(0, 240) + '…' : m;
}

// Wrapper React impératif autour du web component <strudel-editor>.
// On crée l'élément à la main (hors JSX) car le composant insère son éditeur
// CodeMirror comme nœud frère — mieux vaut le garder loin de la réconciliation React.
export default function StrudelEditor({ initialCode, fontSize = 19, onReady, onError, onPlayingChange, onEvalError }) {
  const hostRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let poll;
    let el;
    let lastStarted;
    let lastErr;

    // L'état lecture/arrêt ET l'erreur d'évaluation sont portés par l'événement
    // 'update' (detail = l'état complet de StrudelMirror : { started, error, … }).
    // Il se déclenche aussi bien via les raccourcis clavier (Ctrl+Enter / Ctrl+.)
    // que via nos boutons → une seule source de vérité.
    const onUpdate = (e) => {
      const d = e.detail || {};
      const started = !!d.started;
      if (started !== lastStarted) {
        lastStarted = started;
        onPlayingChange && onPlayingChange(started);
      }
      // d.error = evalError || schedulerError (vérifié dans le bundle vendor).
      const msg = cleanError(d.error);
      if (msg !== lastErr) {
        lastErr = msg;
        onEvalError && onEvalError(msg);
      }
    };

    whenStrudelReady()
      .then(() => {
        if (cancelled || !hostRef.current) return;
        el = document.createElement('strudel-editor');
        el.setAttribute('code', initialCode);
        hostRef.current.appendChild(el);
        el.addEventListener('update', onUpdate);

        // el.editor (StrudelMirror) est instancié dans connectedCallback via un
        // setTimeout → on attend qu'il soit prêt avant d'exposer l'API.
        poll = setInterval(() => {
          if (el.editor) {
            clearInterval(poll);
            try {
              el.editor.setFontSize(fontSize);
              el.editor.setFontFamily(
                "'JetBrains Mono','Cascadia Code',Consolas,'Courier New',monospace"
              );
            } catch (e) {
              /* réglages cosmétiques, non bloquants */
            }
            onReady && onReady(el.editor);
          }
        }, 80);
      })
      .catch((e) => onError && onError(e));

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      if (el) el.removeEventListener('update', onUpdate);
      if (hostRef.current) hostRef.current.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="editor-host" ref={hostRef} aria-label="Éditeur de code Strudel" />;
}
