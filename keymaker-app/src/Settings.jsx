// Keymaker — Chantier 6 : écran Réglages.
//
// Overlay rendu PAR-DESSUS le flash (comme Parcours / Sati) : le flash et
// l'éditeur restent montés dessous, jamais recréés. Tous les réglages ont un
// effet réel immédiat et sont persistés (clé keymaker:settings) côté App.
import { useEffect, useState } from 'react';

// Taille de texte → facteur --fs-scale (voir App + styles.css).
const TEXT_SIZES = [
  { key: 'm', label: 'Normale' },
  { key: 'l', label: 'Grande' },
  { key: 'xl', label: 'Très grande' },
];

// Thème de l'app (chrome) — Void sombre (défaut) / Light clair. Voir styles.css [data-theme].
const APP_THEMES = [
  { key: 'void', label: 'Void (sombre)' },
  { key: 'light', label: 'Clair' },
  { key: 'matrix', label: 'Matrix' },
];

// Thèmes de coloration de l'éditeur : clés RÉELLES du registre StrudelMirror
// (vérifiées dans le bundle vendorisé ; setTheme retombe sur strudelTheme si inconnu).
const EDITOR_THEMES = [
  { key: 'strudelTheme', label: 'Strudel (défaut)' },
  { key: 'materialDark', label: 'Material sombre' },
  { key: 'gruvboxDark', label: 'Gruvbox sombre' },
  { key: 'dracula', label: 'Dracula' },
  { key: 'nord', label: 'Nord' },
  { key: 'tokyoNight', label: 'Tokyo Night' },
  { key: 'gruvboxLight', label: 'Gruvbox clair' },
  { key: 'githubLight', label: 'GitHub clair' },
];

const STATUS_LABEL = {
  ok: 'connectée',
  ko: 'injoignable',
  checking: 'test en cours…',
  unknown: 'pas encore testée',
};

// État « vide » de la mémoire locale de Sati (repli sûr si IndexedDB est indisponible).
const EMPTY_MEM = { counts: { messages: 0, difficultes: 0 }, difficulties: [] };

export default function Settings({
  settings,
  onChange,
  piUrl,
  status,
  onChangeUrl,
  onTest,
  onResetProgress,
  loadMemoryInfo,
  onClearMemory,
  onClose,
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  // Mémoire locale de Sati (Chantier 5, tranche 2) : chargée à l'ouverture de cet
  // écran. Best-effort → si IndexedDB est indisponible, on affiche simplement zéro.
  const [mem, setMem] = useState(null); // null = chargement ; sinon { counts, difficulties }
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    let alive = true;
    if (typeof loadMemoryInfo !== 'function') {
      setMem(EMPTY_MEM);
      return;
    }
    Promise.resolve(loadMemoryInfo())
      .then((info) => alive && setMem(info || EMPTY_MEM))
      .catch(() => alive && setMem(EMPTY_MEM));
    return () => {
      alive = false;
    };
  }, [loadMemoryInfo]);

  const counts = (mem && mem.counts) || EMPTY_MEM.counts;
  const memEmpty = !!mem && counts.messages === 0 && counts.difficultes === 0;
  const memDesc = !mem
    ? 'Chargement…'
    : memEmpty
      ? "Rien de mémorisé pour l'instant."
      : `${counts.messages} message${counts.messages > 1 ? 's' : ''} · ${counts.difficultes} difficulté${
          counts.difficultes > 1 ? 's' : ''
        } repérée${counts.difficultes > 1 ? 's' : ''}`;
  const reperes = ((mem && mem.difficulties) || []).map((d) => d && d.label).filter(Boolean);

  const doWipe = async () => {
    setWiping(true);
    try {
      if (typeof onClearMemory === 'function') await onClearMemory();
    } catch {
      /* non bloquant */
    }
    setMem(EMPTY_MEM);
    setWiping(false);
    setConfirmWipe(false);
  };

  const statusLabel = STATUS_LABEL[status?.state] || STATUS_LABEL.unknown;

  return (
    <div className="learn-overlay set-overlay" role="dialog" aria-modal="true" aria-label="Réglages">
      <div className="learn-backdrop" onClick={onClose} />
      <div className="learn-panel set-panel">
        <header className="learn-head">
          <div>
            <p className="kicker">Réglages</p>
            <h2 className="learn-title">⚙ Préférences</h2>
            <p className="learn-sub">Tout est mémorisé sur cet appareil. Effet immédiat.</p>
          </div>
          <button className="learn-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </header>

        {/* ---- Apparence ---- */}
        <section className="set-section">
          <h3 className="set-h">Apparence</h3>

          <div className="set-row">
            <div className="set-row-label">
              <span className="set-name">Thème</span>
              <span className="set-desc">Void (sombre), Clair ou Matrix (vert) — change toute l'app.</span>
            </div>
            <div className="set-seg" role="group" aria-label="Thème">
              {APP_THEMES.map((t) => (
                <button
                  key={t.key}
                  className={'set-seg-btn' + (settings.theme === t.key ? ' on' : '')}
                  onClick={() => onChange({ theme: t.key })}
                  aria-pressed={settings.theme === t.key}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="set-row">
            <div className="set-row-label">
              <span className="set-name">Taille de texte</span>
              <span className="set-desc">Confort de lecture des leçons et du code.</span>
            </div>
            <div className="set-seg" role="group" aria-label="Taille de texte">
              {TEXT_SIZES.map((s) => (
                <button
                  key={s.key}
                  className={'set-seg-btn' + (settings.textScale === s.key ? ' on' : '')}
                  onClick={() => onChange({ textScale: s.key })}
                  aria-pressed={settings.textScale === s.key}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="set-row">
            <div className="set-row-label">
              <span className="set-name">Réduire les animations</span>
              <span className="set-desc">Coupe transitions et effets. Respecte aussi ton réglage système.</span>
            </div>
            <Toggle
              on={settings.reduceMotion}
              onToggle={(v) => onChange({ reduceMotion: v })}
              label="Réduire les animations"
            />
          </div>
        </section>

        {/* ---- Éditeur de code ---- */}
        <section className="set-section">
          <h3 className="set-h">Éditeur de code</h3>

          <div className="set-row">
            <div className="set-row-label">
              <span className="set-name">Couleurs du code</span>
              <span className="set-desc">Thème de coloration syntaxique de l'éditeur.</span>
            </div>
            <select
              className="set-select"
              value={settings.editorTheme}
              onChange={(e) => onChange({ editorTheme: e.target.value })}
              aria-label="Couleurs du code"
            >
              {EDITOR_THEMES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="set-row">
            <div className="set-row-label">
              <span className="set-name">Numéros de ligne</span>
              <span className="set-desc">Affiche la colonne de numéros à gauche du code.</span>
            </div>
            <Toggle
              on={settings.lineNumbers}
              onToggle={(v) => onChange({ lineNumbers: v })}
              label="Numéros de ligne"
            />
          </div>

          <div className="set-row">
            <div className="set-row-label">
              <span className="set-name">Auto-complétion</span>
              <span className="set-desc">Suggère les fonctions Strudel pendant la frappe (Ctrl+Espace pour forcer).</span>
            </div>
            <Toggle
              on={settings.autocomplete !== false}
              onToggle={(v) => onChange({ autocomplete: v })}
              label="Auto-complétion"
            />
          </div>
        </section>

        {/* ---- Connexion à Sati (partagé avec le tiroir Sati) ---- */}
        <section className="set-section">
          <h3 className="set-h">Connexion à Sati (ton Pi)</h3>
          <p className="set-desc set-desc-block">
            Sati vit sur ton Pi. Cette adresse est la même que dans le tiroir Sati.
          </p>
          <label className="set-name set-label" htmlFor="set-pi-url">
            URL du Pi
          </label>
          <input
            id="set-pi-url"
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
          <button className="btn run set-test" onClick={onTest}>
            ↻ Tester la connexion
          </button>
        </section>

        {/* ---- Mémoire de Sati (locale, hors-ligne) ---- */}
        <section className="set-section">
          <h3 className="set-h">Mémoire de Sati</h3>
          <p className="set-desc set-desc-block">
            Sati se souvient de tes échanges et de ce qui t'a bloqué — seulement sur
            cet appareil et hors-ligne. Rien n'est envoyé sur le réseau.
          </p>
          <div className="set-row">
            <div className="set-row-label">
              <span className="set-name">Effacer la mémoire de Sati</span>
              <span className="set-desc">{memDesc}</span>
              {reperes.length > 0 && <span className="set-desc">Repères : {reperes.join(' · ')}</span>}
            </div>
            {confirmWipe ? (
              <div className="set-confirm">
                <button className="set-danger" disabled={wiping} onClick={doWipe}>
                  {wiping ? 'Effacement…' : 'Confirmer'}
                </button>
                <button className="set-ghost" disabled={wiping} onClick={() => setConfirmWipe(false)}>
                  Annuler
                </button>
              </div>
            ) : (
              <button
                className="set-ghost set-reset"
                disabled={!mem || memEmpty}
                onClick={() => setConfirmWipe(true)}
              >
                Effacer
              </button>
            )}
          </div>
        </section>

        {/* ---- Données ---- */}
        <section className="set-section">
          <h3 className="set-h">Données</h3>
          <div className="set-row">
            <div className="set-row-label">
              <span className="set-name">Reprendre la progression à zéro</span>
              <span className="set-desc">Efface le flash mémorisé et revient au tout début (Flash 1.1).</span>
            </div>
            {confirmReset ? (
              <div className="set-confirm">
                <button
                  className="set-danger"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                >
                  Confirmer
                </button>
                <button className="set-ghost" onClick={() => setConfirmReset(false)}>
                  Annuler
                </button>
              </div>
            ) : (
              <button className="set-ghost set-reset" onClick={() => setConfirmReset(true)}>
                Reprendre à zéro
              </button>
            )}
          </div>
        </section>

        <p className="set-about">Keymaker · live coding &amp; solfège · tourne 100&nbsp;% en local · v0.1</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   <Toggle> — interrupteur on/off accessible (role="switch").
   --------------------------------------------------------------------------- */
function Toggle({ on, onToggle, label }) {
  return (
    <button
      type="button"
      className={'set-toggle' + (on ? ' on' : '')}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onToggle(!on)}
    >
      <span className="set-toggle-knob" aria-hidden="true" />
    </button>
  );
}
