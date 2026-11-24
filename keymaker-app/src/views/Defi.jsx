// Défi vérifié : une consigne tirée d'un modèle (content/defis.js), vérifiée après chaque ▶.
// #/defi        → tire un défi et remplace l'adresse par #/defi/<clé>
// #/defi/<clé>  → ce défi précis (rechargement, lien)
import { useEffect, useRef, useState } from 'react';
import * as dock from '../lib/dock.js';
import { runCheck } from '../lib/check.js';
import { readJSON, writeJSON } from '../lib/store.js';
import { go } from '../lib/app.js';
import { defiByKey, randomDefi, defis, DEFI_FAMILIES } from '../content/defis.js';
import { Icon, Rich, PageHead, chime } from '../ui.jsx';
import { HintLadder } from './Step.jsx';

const SOLVED_KEY = 'km2:defis'; // { [clé]: 'AAAA-MM-JJ' } — défis réussis
const today = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
const another = (key) => {
  const d = randomDefi(key);
  window.location.replace('#/defi/' + d.key);
};

export default function Defi({ id, settings }) {
  const defi = id ? defiByKey[id] : null;
  const [done, setDone] = useState(false);
  const [res, setRes] = useState(null); // null | { kind: 'hint' | 'syntax', hint }
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(() => readJSON(SOLVED_KEY, {}) || {});
  const chimeOn = useRef(settings && settings.chime);
  chimeOn.current = settings && settings.chime;

  useEffect(() => {
    if (!defi) {
      // Sans clé (ou clé inconnue) : on en tire un.
      another(null);
      return undefined;
    }
    setDone(false);
    setRes(null);
    setTries(0);
    const key = 'defi:' + defi.key;
    dock.claim({
      key,
      code: defi.code,
      fresh: true,
      onRan: (ctx) => {
        const r = runCheck(defi.check, ctx);
        if (r.ok) {
          setDone(true);
          setRes(null);
          const all = { ...(readJSON(SOLVED_KEY, {}) || {}), [defi.key]: today() };
          writeJSON(SOLVED_KEY, all);
          setSolved(all);
          if (chimeOn.current) chime();
          return;
        }
        if (!ctx.changed) return setRes(null);
        setRes({ kind: 'hint', hint: r.hint });
        setTries((t) => t + 1);
      },
      onError: () => {
        setRes({ kind: 'syntax' });
        setTries((t) => t + 1);
      },
    });
    window.scrollTo({ top: 0 });
    return () => dock.release(key);
  }, [defi && defi.key]);

  if (!defi) return null;
  const fam = DEFI_FAMILIES.find((f) => f.id === defi.family);
  const nSolved = Object.keys(solved).filter((k) => defiByKey[k]).length;
  return (
    <>
      <section className="v-head">
        <PageHead kicker={'Défi vérifié · ' + (fam ? fam.label : '')} title={defi.title} lead={'Tiré au hasard parmi ' + defis.length + ' défis. Change le code, touche ▶ : l’app vérifie ce qu’il produit.'} />
      </section>
      <section className="v-mid">
        <div className={'task' + (done ? ' is-done' : '')}>
          <div className="moment-label">À toi</div>
          <Rich as="p" text={defi.brief} />
          {done ? (
            <>
              <p className="task-ok" role="status"><Icon name="check" size={18} /> <Rich text={defi.ok} /></p>
              <div className="chips">
                <button type="button" className="btn btn-primary" onClick={() => another(defi.key)}>Un autre défi <Icon name="next" size={18} /></button>
              </div>
            </>
          ) : (
            <>
              {res && res.kind === 'syntax' ? (
                <p className="res res-hint" role="status">Ton code a une faute de frappe : le message rouge de l’éditeur dit où. Je vérifie dès qu’elle est corrigée.</p>
              ) : res ? (
                <p className="res res-hint" role="status"><Rich text={res.hint || 'Pas encore. Relis la consigne, change le code, puis relance.'} /></p>
              ) : (
                <p className="res res-wait">Change le code selon la consigne, puis touche ▶ : je vérifie tout seul.</p>
              )}
              <div className="task-alt">
                <HintLadder start={defi.code} solution={defi.solution} tries={tries} />
                <button type="button" className="linkbtn" onClick={() => another(defi.key)}>Un autre défi</button>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="v-body">
        <p className="task-note">{nSolved ? `Défis réussis : ${nSolved} sur ${defis.length}.` : 'Aucun défi réussi pour l’instant.'} Chaque modèle change de paramètres d’un tirage à l’autre (tonalité, cycle, nombre de coups…).</p>
        <button type="button" className="quietline" onClick={() => go('#/studio')}>
          <Icon name="studio" size={18} /><span>Retour au Studio</span><Icon name="next" size={18} />
        </button>
      </section>
    </>
  );
}
