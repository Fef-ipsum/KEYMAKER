// Page de revue des schémas vivants : tout d'un coup, hors du parcours.
// Adresse directe : #/schemas. Sert à écouter chaque schéma et à faire ses retours.
import { useEffect } from 'react';
import { go } from '../lib/app.js';
import { allSchemas, stepIndex } from '../content/registry.js';
import { byId } from '../content/wiki/index.js';
import { TYPES, describeCatalog } from '../schemas/catalog.js';
import { Schema, EarQuestion } from '../schemas/ui/Schema.jsx';
import { Fold, PageHead, Rich } from '../ui.jsx';

// Une déclaration de départ par type (les réglages par défaut du type).
const BASE = {
  filtre: { type: 'filtre', reglages: { lpf: 600, lpq: 0 }, source: 'basse' },
  adsr: { type: 'adsr', reglages: {}, notes: 1 },
  onde: { type: 'onde', onde: 'sawtooth', note: 'c3' },
  effet: { type: 'effet', effet: 'echo', reglages: { delay: 0.5, delaytime: 0.25, delayfeedback: 0.5 } },
  signal: { type: 'signal', reglages: { bas: 300, haut: 2000, slow: 4 }, forme: 'sine' },
  clavier: { type: 'clavier', mode: 'accord', accord: 'C' },
  cycle: { type: 'cycle', motif: 'bd [hh hh] sd <hh oh>', cycles: 4 },
  tempo: { type: 'tempo', reglages: { bpm: 120 }, temps: 4 },
  'enveloppe-filtre': { type: 'enveloppe-filtre', reglages: { lpf: 300, lpq: 8, lpenv: 2 }, source: 'basse' },
};

function whereLabel(w) {
  if (w.startsWith('wiki ')) {
    const e = byId[w.slice(5)];
    return { text: 'Wiki · ' + (e ? e.t + (e.sub ? ' (' + e.sub + ')' : '') : w), route: '#/wiki/' + encodeURIComponent(w.slice(5)) };
  }
  const st = stepIndex.get(w);
  if (st) return { text: 'Étape · ' + st.step.title, route: '#/etape/' + encodeURIComponent(w) };
  return { text: w, route: null };
}

export default function SchemaReview() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);
  const all = allSchemas();
  const inContent = all.filter((x) => !x.ear);
  const ears = all.filter((x) => x.ear);
  return (
    <section className="v-body narrow review">
      <PageHead
        kicker="Page de revue"
        title="Tous les schémas vivants"
        lead="Chaque schéma se joue et se manipule ici, sans passer par le parcours. Écoute, attrape les dessins, et note ce qui te gêne : c’est ce retour qui les améliore."
      />

      <h2 className="review-h">Les types de schémas ({Object.keys(TYPES).length})</h2>
      {Object.keys(TYPES).map((t) => (
        <div key={t} className="review-item">
          <Schema spec={BASE[t]} context="revue" title={TYPES[t].title} />
        </div>
      ))}

      <h2 className="review-h">Dans les leçons et le wiki ({inContent.length})</h2>
      {inContent.map((x) => {
        const w = whereLabel(x.where);
        return (
          <div key={x.where} className="review-item">
            <p className="review-where">
              {w.route ? <button type="button" className="linkbtn" onClick={() => go(w.route)}>{w.text}</button> : w.text}
            </p>
            <Schema spec={x.spec} context="revue" />
          </div>
        );
      })}

      <h2 className="review-h">Questions « retrouve le réglage à l’oreille » ({ears.length})</h2>
      {ears.map((x) => (
        <div key={x.where} className="review-item">
          <p className="review-where">{x.where}</p>
          <Rich as="p" className="review-q" text={x.ear.q} />
          <EarQuestion question={x.ear} context="revue" />
        </div>
      ))}

      <Fold title="Ce que Sati reçoit" hint="description générée depuis le code">
        <pre className="code code-small"><code>{describeCatalog()}</code></pre>
      </Fold>
    </section>
  );
}
