// Le wiki. Une forme fixe pour toutes les entrées, à quatre niveaux :
//   L'essentiel (toujours visible) · Comment s'en servir · Pièges · Évolutions
// On ne lit jamais plus que ce qu'on a demandé.

import { useEffect, useMemo, useRef, useState } from 'react';
import * as engine from '../lib/engine.js';
import { go } from '../lib/app.js';
import { KINDS, byId, search, countByKind, primaryNoteKey, allNoteKeys, entryByNoteKey, engineVersion } from '../content/wiki/index.js';
import { readNotes, setNote } from '../lib/glossaryNotes.js';
import { Icon, Rich, Sample, Fold, WikiChip, PageHead, useWiki } from '../ui.jsx';

const KIND_LABEL = Object.fromEntries(KINDS.map((k) => [k.id, k.label]));

/* --- Mes notes sur une entrée ---------------------------------------------------------
   Lues et écrites dans la clé d'origine (keymaker:glossnotes), avec les clés d'origine :
   les annotations écrites dans l'ancienne app restent attachées à leur terme.          */
function Notes({ entry }) {
  const keys = allNoteKeys(entry);
  const [notes, setNotes] = useState(() => readNotes());
  useEffect(() => setNotes(readNotes()), [entry.id]);
  const shown = keys.filter((k, i) => i === 0 || notes[k]);
  return (
    <div className="mynote">
      {shown.map((k, i) => (
        <div key={k}>
          <label htmlFor={'wn-' + k}><Icon name="note" size={16} /> {i === 0 ? 'Ma note' : 'Ma note (terme d’origine : ' + k.split(':').slice(1).join(':') + ')'}</label>
          <textarea
            id={'wn-' + k}
            rows={2}
            placeholder="Ton astuce pour t’en souvenir."
            value={notes[k] || ''}
            onChange={(e) => setNotes({ ...notes, [k]: e.target.value })}
            onBlur={(e) => setNotes(setNote(k, e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}

/* --- Une entrée -------------------------------------------------------------------------- */
export function Entry({ entry, compact = false }) {
  const o = entry.official;
  const hasUse = (entry.use && entry.use.length) || (entry.args && entry.args.length);
  const hasEvo = (entry.evo && entry.evo.length) || (entry.aliases && entry.aliases.length) || (entry.deprecated && entry.deprecated.length);
  return (
    <article className={'entry' + (compact ? ' entry-compact' : '')}>
      <header className="entry-head">
        <div className="kicker">
          {KIND_LABEL[entry.kind]}
          {entry.kind === 'ref' ? <span className="badge">en anglais</span> : null}
        </div>
        <h1 className="entry-title"><span className="entry-term">{entry.t}</span>{entry.sub ? <span className="entry-sub">{entry.sub}</span> : null}</h1>
        {entry.en ? <div className="entry-en">en anglais : {entry.en}</div> : null}
      </header>

      <div className="entry-ess">
        <div className="moment-label">L’essentiel</div>
        {entry.kind === 'ref' ? <p className="entry-refnote">Cette fonction n’a pas encore de fiche en français. Voici sa documentation officielle (Strudel {engineVersion}), en anglais.</p> : null}
        {entry.kind === 'ref' ? <p lang="en">{entry.ess}</p> : <Rich as="p" text={entry.ess} />}
      </div>
      {entry.code ? <Sample code={entry.code} /> : null}
      {entry.genre ? (
        <button type="button" className="quietline" onClick={() => go('#/genre/' + entry.genre[0] + '/' + entry.genre[1])}>
          <Icon name="genres" size={18} /><span>Le reconstruire pas à pas</span><Icon name="next" size={18} />
        </button>
      ) : null}

      {hasUse ? (
        <Fold title="Comment s’en servir" hint={entry.use ? entry.use.length + ' exemple' + (entry.use.length > 1 ? 's' : '') : 'les réglages'}>
          {entry.args && entry.args.length ? (
            <dl className="decode">
              {entry.args.map((a, i) => <div className="decode-row" key={i}><dt><code>{a[0]}</code></dt><dd><Rich text={a[1]} /></dd></div>)}
            </dl>
          ) : null}
          {(entry.use || []).map((u, i) => <Sample key={i} title={u[0]} code={u[1]} note={u[2]} />)}
        </Fold>
      ) : null}

      {entry.kind === 'ref' && o && (o.p.length || o.x.length > 1) ? (
        <Fold title="Paramètres et autres exemples" hint="documentation officielle">
          {o.p.length ? (
            <dl className="decode">
              {o.p.map((p, i) => <div className="decode-row" key={i}><dt><code>{p[0]}</code></dt><dd lang="en">{p[2] || p[1]}</dd></div>)}
            </dl>
          ) : null}
          {o.x.slice(1).map((x, i) => <Sample key={i} code={x} />)}
        </Fold>
      ) : null}

      {entry.traps && entry.traps.length ? (
        <Fold title="Pièges" hint={entry.traps.length + ' à connaître'}>
          <ul className="bullets">{entry.traps.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ul>
        </Fold>
      ) : null}

      {/* Un seul repli pour le reste : évolutions, autres noms, et les sources. */}
      {hasEvo || (entry.kind !== 'ref' && o) || (entry.origin && entry.origin.length) ? (
        <Fold
          title={hasEvo ? 'Évolutions et autres noms' : 'Pour aller plus loin'}
          hint={[
            entry.aliases && entry.aliases.length ? entry.aliases.length + ' autre' + (entry.aliases.length > 1 ? 's' : '') + ' nom' + (entry.aliases.length > 1 ? 's' : '') : '',
            entry.kind !== 'ref' && o ? 'doc officielle' : '',
            entry.origin && entry.origin.length ? 'ancien glossaire' : '',
          ].filter(Boolean).join(' · ')}
        >
          {entry.evo && entry.evo.length ? <ul className="bullets">{entry.evo.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ul> : null}
          {entry.aliases && entry.aliases.length ? (
            <p className="aliases">
              Noms que le moteur ({engineVersion}) accepte aussi pour ce qui est décrit ici : {entry.aliases.map((a, i) => <span key={a}>{i ? ', ' : ''}<code>{a}</code></span>)}.
              <span className="aliases-src"> Liste extraite du moteur embarqué.</span>
            </p>
          ) : null}
          {entry.deprecated && entry.deprecated.length ? (
            <p className="aliases">Signalé comme déprécié par la documentation officielle : {entry.deprecated.map((a, i) => <span key={a}>{i ? ', ' : ''}<code>{a}</code></span>)}.</p>
          ) : null}
          {entry.kind !== 'ref' && o ? (
            <div className="subsec">
              <h3>Documentation officielle <span className="badge">en anglais</span></h3>
              <p lang="en">{o.d}</p>
              {o.p.length ? (
                <dl className="decode">
                  {o.p.map((p, i) => <div className="decode-row" key={i}><dt><code>{p[0]}</code></dt><dd lang="en">{p[2] || p[1]}</dd></div>)}
                </dl>
              ) : null}
            </div>
          ) : null}
          {entry.origin && entry.origin.length ? (
            <div className="subsec">
              <h3>Ce que disait l’ancien glossaire de l’app</h3>
              <dl className="decode">
                {entry.origin.map((g, i) => <div className="decode-row" key={i}><dt><strong>{g.term}</strong></dt><dd>{g.def}</dd></div>)}
              </dl>
            </div>
          ) : null}
        </Fold>
      ) : null}

      {entry.see && entry.see.length ? (
        <div className="seealso">
          <div className="moment-label">Voir aussi</div>
          <div className="chips">{entry.see.map((id) => <WikiChip key={id} id={id} />)}</div>
        </div>
      ) : null}
      {entry.kind !== 'ref' ? <Notes entry={entry} /> : null}
    </article>
  );
}

/* --- Panneau par-dessus l'écran en cours ------------------------------------------------- */
export function WikiSheet({ id, onClose, onOpen }) {
  const ref = useRef(null);
  const [trail, setTrail] = useState([]);
  const entry = byId[id];
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    if (ref.current) {
      ref.current.scrollTop = 0;
      ref.current.focus();
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [id]);
  useEffect(() => setTrail((t) => (t[t.length - 1] === id ? t : [...t, id])), [id]);
  if (!entry) return null;
  const back = trail.length > 1 ? trail[trail.length - 2] : null;
  return (
    <div className="sheet-wrap" role="dialog" aria-modal="true" aria-label={'Wiki : ' + entry.t}>
      <button type="button" className="sheet-scrim" onClick={onClose} aria-label="Fermer le wiki" />
      <div className="sheet" ref={ref} tabIndex={-1}>
        <div className="sheet-bar">
          {back ? (
            <button type="button" className="linkbtn" onClick={() => { setTrail((t) => t.slice(0, -2)); onOpen(back); }}>
              <Icon name="prev" size={16} /> {byId[back].t}
            </button>
          ) : <span className="sheet-bar-title">Wiki</span>}
          <span className="sheet-bar-tools">
            <button type="button" className="linkbtn" onClick={() => { onClose(); go('#/wiki/' + encodeURIComponent(id)); }}>Ouvrir en grand</button>
            <button type="button" className="iconbtn" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>
          </span>
        </div>
        <Entry entry={entry} compact />
      </div>
    </div>
  );
}

/* --- Page d'une entrée -------------------------------------------------------------------- */
export function WikiEntryPage({ id }) {
  const entry = byId[id];
  useEffect(() => {
    window.scrollTo({ top: 0 });
    return () => engine.endPreview();
  }, [id]);
  if (!entry) {
    return (
      <section className="v-body narrow">
        <h1>Entrée introuvable</h1>
        <button type="button" className="btn btn-primary" onClick={() => go('#/wiki')}>Retour au wiki</button>
      </section>
    );
  }
  return (
    <section className="v-body narrow">
      <div className="crumbs"><button type="button" className="linkbtn" onClick={() => go('#/wiki')}>Wiki</button><span>·</span><span>{KIND_LABEL[entry.kind]}</span></div>
      <Entry entry={entry} />
    </section>
  );
}

/* --- Liste et recherche -------------------------------------------------------------------- */
export function WikiHome({ q0 = '', kind0 = '' }) {
  const { openWiki } = useWiki();
  const [q, setQ] = useState(q0);
  const [kind, setKind] = useState(kind0);
  const counts = useMemo(() => countByKind(), []);
  const results = useMemo(() => search(q, { kind: kind || null, limit: q || kind ? 200 : 0 }), [q, kind]);
  const notes = useMemo(() => readNotes(), []);
  const noteCount = Object.keys(notes).length;
  useEffect(() => () => engine.endPreview(), []);

  return (
    <section className="v-body">
      <PageHead kicker="Wiki" title="C’est quoi, ça ?" lead="Chaque fonction, chaque signe, chaque notion. L’essentiel d’abord ; la profondeur seulement si tu la demandes." />
      <div className="searchbox">
        <Icon name="search" size={20} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="lpf, tierce, do, sidechain, [ ]…"
          aria-label="Chercher dans le wiki"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        {q ? <button type="button" className="iconbtn" onClick={() => setQ('')} aria-label="Effacer"><Icon name="close" size={18} /></button> : null}
      </div>

      <div className="kinds" role="tablist" aria-label="Familles d’entrées">
        <button type="button" role="tab" aria-selected={!kind} className={'kind' + (!kind ? ' is-on' : '')} onClick={() => setKind('')}>Tout</button>
        {KINDS.map((k) => (
          <button type="button" role="tab" aria-selected={kind === k.id} key={k.id} className={'kind' + (kind === k.id ? ' is-on' : '')} onClick={() => setKind(kind === k.id ? '' : k.id)}>
            {k.label} <span className="kind-n">{counts[k.id] || 0}</span>
          </button>
        ))}
      </div>

      {q || kind ? (
        results.length ? (
          <ul className="results">
            {results.map((e) => (
              <li key={e.id}>
                <button type="button" className="result" onClick={() => openWiki(e.id)}>
                  <span className="result-main">
                    <span className="result-t">{e.t}</span>
                    {e.sub ? <span className="result-s">{e.sub}</span> : null}
                  </span>
                  <span className="result-kind">{KIND_LABEL[e.kind]}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">Rien pour « {q} ». Essaie un seul mot, par exemple : cycle, tierce, lpf, kick.</p>
        )
      ) : (
        <div className="wikihome">
          {KINDS.map((k) => (
            <button type="button" key={k.id} className="wikikind" onClick={() => setKind(k.id)}>
              <span className="wikikind-t">{k.label}</span>
              <span className="wikikind-h">{k.hint}</span>
              <span className="wikikind-n">{counts[k.id] || 0}</span>
            </button>
          ))}
        </div>
      )}

      <div className="wikifoot">
        <button type="button" className="quietline" onClick={() => openWiki('sol.noms-des-notes')}>
          <Icon name="note" size={18} /><span>Do ré mi = C D E : la table de correspondance</span><Icon name="next" size={18} />
        </button>
        <button type="button" className="quietline" onClick={() => go('#/annotations')}>
          <Icon name="note" size={18} /><span>Mes annotations{noteCount ? ' (' + noteCount + ')' : ''}</span><Icon name="next" size={18} />
        </button>
      </div>
    </section>
  );
}

/* --- Toutes mes annotations (y compris celles dont le terme aurait disparu) ----------------- */
export function Annotations() {
  const { openWiki } = useWiki();
  const [notes, setNotes] = useState(() => readNotes());
  const keys = Object.keys(notes).sort();
  return (
    <section className="v-body narrow">
      <div className="crumbs"><button type="button" className="linkbtn" onClick={() => go('#/wiki')}>Wiki</button><span>·</span><span>Mes annotations</span></div>
      <PageHead title="Mes annotations" lead="Toutes les notes que tu as écrites sur des termes, y compris dans l’ancienne version de l’app." />
      {keys.length ? (
        <ul className="annots">
          {keys.map((k) => {
            const e = entryByNoteKey.get(k);
            return (
              <li key={k} className="annot">
                <div className="annot-head">
                  {e ? <button type="button" className="linkbtn" onClick={() => openWiki(e.id)}>{e.t}</button> : <span>{k.split(':').slice(1).join(':') || k} <em>(terme d’origine)</em></span>}
                </div>
                <textarea rows={2} value={notes[k]} onChange={(ev) => setNotes({ ...notes, [k]: ev.target.value })} onBlur={(ev) => { if (ev.target.value.trim()) setNote(k, ev.target.value); }} aria-label={'Note sur ' + (e ? e.t : k)} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="empty">Aucune note pour l’instant. Chaque entrée du wiki a un champ « Ma note ».</p>
      )}
    </section>
  );
}
