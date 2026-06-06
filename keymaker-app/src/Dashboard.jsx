// Keymaker — Chantier 16 : Tableau de bord & progression.  [build:c16-dashboard]
//
// Écran d'ACCUEIL, rendu PAR-DESSUS le flash (même patron que Parcours / Sati /
// Réglages) → l'éditeur reste monté dessous, jamais recréé. Pensé TDA-friendly :
// orientation immédiate (où j'en suis), motivation honnête (streak + %), et un GROS
// bouton « Reprendre » pour replonger sans friction. Pas de gamification lourde.
//
// 100 % présentationnel : App calcule le `summary` (depuis progress.js) et passe les
// actions. Données lues à l'ouverture, donc toujours fraîches.

export default function Dashboard({ summary, modules, currentModuleIndex, resumeLabel, onResume, onPickModule, onOpenLibrary, onClose }) {
  const s = summary || { perModule: [], totalSeen: 0, totalFlashs: 0, days: 0, streak: 0, pct: 0 };
  const streakWord = s.streak <= 1 ? 'jour' : 'jours';
  const daysWord = s.days <= 1 ? 'jour' : 'jours';

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
            <span className="dash-streak-flame" aria-hidden="true">🔥</span>
            <span className="dash-streak-num">{s.streak}</span>
            <span className="dash-streak-word">{streakWord} d'affilée</span>
          </div>

          <button className="dash-resume" onClick={onResume}>
            <span className="dash-resume-main">▶ Reprendre</span>
            {resumeLabel && <span className="dash-resume-sub">{resumeLabel}</span>}
          </button>
        </section>

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
            <button className="dash-lib-btn" onClick={onOpenLibrary}>📌 Mes snippets</button>
          </div>
        )}

        <p className="set-about">Keymaker · suivi 100&nbsp;% local, rien n'est envoyé · v0.1</p>
      </div>
    </div>
  );
}
