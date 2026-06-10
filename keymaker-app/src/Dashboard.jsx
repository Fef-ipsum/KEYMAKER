// Keymaker — Chantier 16 : Tableau de bord & progression.  [build:c16-dashboard]
// Icônes SVG inline pour la dashboard (remplace 🔥 et 📌).
const IcoFlame = () => (
  <svg className="dash-streak-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
  </svg>
);
const IcoBookmark = () => (
  <svg style={{display:'block', width:14, height:14, flexShrink:0, opacity:0.75}} viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 2h9a1 1 0 011 1v9.5l-4.5-2.5L4 12.5V3a1 1 0 011-1z"/>
  </svg>
);
//
// Écran d'ACCUEIL, rendu PAR-DESSUS le flash (même patron que Parcours / Sati /
// Réglages) → l'éditeur reste monté dessous, jamais recréé. Pensé TDA-friendly :
// orientation immédiate (où j'en suis), motivation honnête (streak + %), et un GROS
// bouton « Reprendre » pour replonger sans friction. Pas de gamification lourde.
//
// 100 % présentationnel : App calcule le `summary` (depuis progress.js) et passe les
// actions. Données lues à l'ouverture, donc toujours fraîches.

export default function Dashboard({ summary, modules, currentModuleIndex, resumeLabel, reviewCount, onOpenReview, onStartFlow, onResume, onPickModule, onOpenLibrary, onClose }) {
  const s = summary || { perModule: [], totalSeen: 0, totalFlashs: 0, days: 0, streak: 0, pct: 0 };
  const streakWord = s.streak <= 1 ? 'jour' : 'jours';
  const daysWord = s.days <= 1 ? 'jour' : 'jours';
  const nDue = reviewCount || 0;

  return (
    <div className="learn-overlay dash-overlay" role="dialog" aria-modal="true" aria-label="Accueil — ta progression">
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel dash-panel">
        <header className="learn-head">
          <div>
            <p className="kicker">Accueil</p>
            <h2 className="learn-title">Ta progression</h2>
            <p className="learn-sub">Où tu en es, en un coup d'œil. Reprends quand tu veux.</p>
          </div>
          <button className="learn-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>

        {/* ---- Bandeau : streak + reprise + total ---- */}
        <section className="dash-hero">
          <div className="dash-streak" title="Jours consécutifs de pratique">
            <IcoFlame />
            <span className="dash-streak-num">{s.streak}</span>
            <span className="dash-streak-word">{streakWord} d'affilée</span>
          </div>

          <button className="dash-resume" onClick={onResume}>
            <span className="dash-resume-main">▶ Reprendre</span>
            {resumeLabel && <span className="dash-resume-sub">{resumeLabel}</span>}
          </button>
        </section>

        {/* ---- Mode Flow (Chantier 44) : « j'ai X minutes », Sati orchestre ---- */}
        {onStartFlow && (
          <section className="dash-flow">
            <div className="dash-flow-txt">
              <span className="dash-flow-glyph" aria-hidden="true">🌊</span>
              <span className="dash-review-label">
                Mode Flow
                <span className="dash-review-sub">Dis combien de temps tu as — révision, nouveau, défi : tout s'enchaîne.</span>
              </span>
            </div>
            <div className="dash-flow-btns">
              <button className="dash-flow-btn" onClick={() => onStartFlow(10)}>~10 min</button>
              <button className="dash-flow-btn main" onClick={() => onStartFlow(20)}>~20 min</button>
              <button className="dash-flow-btn" onClick={() => onStartFlow(40)}>~40 min</button>
            </div>
          </section>
        )}

        {/* ---- Révision du jour (Chantier 38) : la file Leitner, 3 minutes max ---- */}
        {nDue > 0 && onOpenReview && (
          <section className="dash-review">
            <div className="dash-review-txt">
              <span className="dash-review-badge">📬 {nDue}</span>
              <span className="dash-review-label">
                {nDue === 1 ? 'flash à revoir aujourd’hui' : 'flashs à revoir aujourd’hui'}
                <span className="dash-review-sub">Revus au bon moment, ils restent. ~3 minutes.</span>
              </span>
            </div>
            <button className="dash-review-btn" onClick={onOpenReview}>Réviser</button>
          </section>
        )}

        {/* ---- Progression globale ---- */}
        <section className="dash-global">
          <div className="dash-global-line">
            <span className="dash-global-label">Parcours complet</span>
            <span className="dash-global-val">
              {s.totalSeen} / {s.totalFlashs} flashs · {s.pct}%
            </span>
          </div>
          <div className="dash-bar" aria-hidden="true">
            <div className="dash-bar-fill" style={{ width: s.pct + '%' }} />
          </div>
          <p className="dash-global-sub">
            {s.totalSeen === 0
              ? 'Tu démarres — joue ton premier flash, il comptera ici.'
              : `${s.days} ${daysWord} de pratique au total.`}
          </p>
        </section>

        {/* ---- Cartes par module ---- */}
        <section className="dash-modules">
          <h3 className="set-h">Tes modules</h3>
          <div className="dash-mod-grid">
            {modules.map((m, mi) => {
              const pm = (s.perModule && s.perModule[mi]) || { seen: 0, total: 0, pct: 0 };
              const here = mi === currentModuleIndex;
              const done = pm.total > 0 && pm.seen >= pm.total;
              return (
                <button
                  key={m.id}
                  className={'dash-mod' + (here ? ' here' : '') + (done ? ' done' : '')}
                  onClick={() => onPickModule(mi)}
                  title={'Aller au Module ' + m.id}
                >
                  <div className="dash-mod-top">
                    <span className="dash-mod-badge">{m.id}</span>
                    <span className="dash-mod-meta">
                      <span className="dash-mod-title">{m.titre || m.title}</span>
                      <span className="dash-mod-sub">{m.subtitle}</span>
                    </span>
                    {here && <span className="dash-mod-here" aria-hidden="true" title="ici">ici</span>}
                    {done && !here && <span className="dash-mod-check" aria-hidden="true" title="terminé">✓</span>}
                  </div>
                  <div className="dash-bar dash-bar-sm" aria-hidden="true">
                    <div className="dash-bar-fill" style={{ width: pm.pct + '%' }} />
                  </div>
                  <span className="dash-mod-count">
                    {pm.seen}/{pm.total} · {pm.pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {onOpenLibrary && (
          <div className="dash-actions">
            <button className="dash-lib-btn" onClick={onOpenLibrary} style={{display:'inline-flex',alignItems:'center',gap:7}}><IcoBookmark /> Mes snippets</button>
          </div>
        )}

        <p className="set-about">Keymaker · suivi 100&nbsp;% local, rien n'est envoyé · v0.1</p>
      </div>
    </div>
  );
}
