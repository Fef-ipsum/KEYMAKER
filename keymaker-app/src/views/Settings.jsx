// Réglages — peu nombreux, chacun utile. Et la session « J'ai X minutes ».

import { useEffect, useState } from 'react';
import { readPiUrl, writePiUrl, defaultPiUrl } from '../lib/store.js';
import { go, readFlow, writeFlow } from '../lib/app.js';
import { canInstall, promptInstall, isStandalone, onInstallable } from '../lib/pwa.js';
import { packStatus, onPack, downloadPack } from '../lib/offline.js';
import { exportAll } from '../lib/backup.js';
import { loadThread, clearThread } from '../lib/memory.js';
import { Icon, PageHead, Fold, useOnline } from '../ui.jsx';
import { stepIndex } from '../content/registry.js';
import { isDone } from '../lib/progress.js';

// Les instructions d'installation de CET appareil seulement.
function installHint() {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
  if (ios) return 'Dans Safari : bouton Partager (le carré avec une flèche), puis « Sur l’écran d’accueil ».';
  if (/Android/.test(ua)) return 'Dans Chrome : menu ⋮ en haut à droite, puis « Installer l’application ».';
  return 'Dans Chrome ou Edge : l’icône d’installation, à droite de la barre d’adresse.';
}

function Choice({ label, value, options, onChange }) {
  return (
    <fieldset className="setting">
      <legend>{label}</legend>
      <div className="seg">
        {options.map(([v, text]) => (
          <button type="button" key={v} className={'seg-b' + (value === v ? ' is-on' : '')} aria-pressed={value === v} onClick={() => onChange(v)}>{text}</button>
        ))}
      </div>
    </fieldset>
  );
}

export function Settings({ settings, setSettings }) {
  const online = useOnline();
  const [installable, setInstallable] = useState(canInstall());
  const [pack, setPack] = useState(packStatus());
  const [pi, setPi] = useState(readPiUrl());
  const [piState, setPiState] = useState('');
  const [msgs, setMsgs] = useState(0);
  const set = (k, v) => setSettings({ ...settings, [k]: v });

  useEffect(() => onInstallable(setInstallable), []);
  useEffect(() => onPack(setPack), []);
  useEffect(() => {
    loadThread().then((t) => setMsgs(t.length));
  }, []);

  const testPi = async () => {
    setPiState('…');
    try {
      const r = await fetch(pi.replace(/\/+$/, '') + '/keymaker/health', { signal: AbortSignal.timeout(6000) });
      setPiState(r.ok ? 'Sati répond.' : 'Le Pi répond, mais pas Sati (code ' + r.status + ').');
    } catch {
      setPiState('Pas de réponse. Vérifie Tailscale. Le reste de l’app fonctionne sans.');
    }
  };

  return (
    <section className="v-body narrow">
      <PageHead kicker="Réglages" title="Réglages" />

      <h2 className="section-title">Affichage</h2>
      <Choice label="Thème" value={settings.theme} onChange={(v) => set('theme', v)} options={[['auto', 'Comme l’appareil'], ['light', 'Clair'], ['dark', 'Sombre']]} />
      <Choice label="Taille du texte" value={settings.textScale} onChange={(v) => set('textScale', v)} options={[['m', 'Normale'], ['l', 'Grande'], ['xl', 'Très grande']]} />
      <Choice label="Animations" value={settings.reduceMotion} onChange={(v) => set('reduceMotion', v)} options={[['auto', 'Comme l’appareil'], ['on', 'Réduites']]} />
      <Choice label="Cadran du cycle sous l’éditeur (sur grand écran)" value={settings.dial ? 'on' : 'off'} onChange={(v) => set('dial', v === 'on')} options={[['on', 'Affiché'], ['off', 'Masqué']]} />
      <Choice label="Petit son quand une étape est validée" value={settings.chime ? 'on' : 'off'} onChange={(v) => set('chime', v === 'on')} options={[['on', 'Oui'], ['off', 'Non']]} />

      <h2 className="section-title">Hors ligne</h2>
      <div className="panel">
        <p>
          <strong>Sons embarqués : </strong>
          {pack.state === 'ready' ? `prêts (${pack.total} fichiers). Tout le contenu joue sans réseau.`
            : pack.state === 'loading' ? `téléchargement… ${pack.done} / ${pack.total}`
            : pack.state === 'unsupported' ? 'ce navigateur ne permet pas le mode hors ligne.'
            : pack.state === 'error' ? `interrompu à ${pack.done} / ${pack.total}. Il reprendra à la prochaine ouverture en ligne.`
            : 'pour jouer sans Internet, l’app télécharge ses sons (environ 35 Mo) dès qu’elle est en ligne. Tu peux aussi le lancer maintenant.'}
        </p>
        {pack.state !== 'ready' && pack.state !== 'unsupported' && pack.state !== 'loading' ? (
          <button type="button" className="btn btn-quiet" onClick={() => downloadPack()} disabled={!online}><Icon name="download" size={18} /> Télécharger maintenant</button>
        ) : null}
        <p className="hint">{online ? 'Tu es en ligne.' : 'Tu es hors ligne : tout fonctionne, sauf Sati.'}</p>
      </div>
      <div className="panel">
        <p><strong>Installer l’app : </strong>{isStandalone() ? 'elle est installée sur cet appareil.' : 'elle s’ouvre alors comme une app, sans barre de navigateur.'}</p>
        {!isStandalone() && installable ? <button type="button" className="btn btn-quiet" onClick={() => promptInstall()}><Icon name="download" size={18} /> Installer</button> : null}
        {!isStandalone() && !installable ? <p className="hint">{installHint()}</p> : null}
      </div>

      <h2 className="section-title">Sati, l’assistante</h2>
      <p className="hint">Un bonus en ligne : aucune leçon, aucun quiz, aucune révision n’a besoin d’elle.</p>
      <Fold title="Réglages avancés de Sati" hint="adresse du serveur, conversation">
        <div className="panel">
          <label htmlFor="pi">Adresse du Raspberry Pi</label>
          <div className="keeprow">
            <input id="pi" value={pi} onChange={(e) => setPi(e.target.value)} onBlur={() => writePiUrl(pi.trim() === defaultPiUrl() ? '' : pi.trim())} spellCheck={false} autoCapitalize="none" />
            <button type="button" className="btn btn-quiet" onClick={testPi}>Tester</button>
          </div>
          {piState ? <p className="hint" role="status">{piState}</p> : null}
          {msgs ? (
            <button type="button" className="btn btn-quiet" onClick={async () => { if (window.confirm('Effacer la conversation enregistrée sur cet appareil ?')) { await clearThread(); setMsgs(0); } }}>
              Effacer la conversation ({msgs} messages)
            </button>
          ) : null}
        </div>
      </Fold>

      <h2 className="section-title">Mes données</h2>
      <div className="panel">
        <p>Ta progression, tes annotations et tes codes gardés sont enregistrés sur cet appareil, dans ce navigateur. Ils ne sont envoyés nulle part.</p>
        <button type="button" className="btn btn-quiet" onClick={exportAll}><Icon name="download" size={18} /> Exporter une copie de sauvegarde</button>
        <p className="hint">Un fichier contenant tout : utile avant de changer de navigateur ou d’appareil.</p>
      </div>
      <p className="today-foot">Keymaker 2 · moteur Strudel 1.3.0 embarqué.</p>
    </section>
  );
}

/* --- La session « J'ai X minutes » ------------------------------------------------------------- */
export function Session() {
  const flow = readFlow();
  if (!flow) {
    return (
      <section className="v-body narrow">
        <PageHead kicker="Session" title="Pas de session en cours" />
        <button type="button" className="btn btn-primary" onClick={() => go('#/')}>Retour</button>
      </section>
    );
  }
  const minutes = Math.max(1, Math.round((Date.now() - flow.started) / 60000));
  const over = flow.done || flow.index >= flow.items.length;
  // Si la session vient de finir un chapitre des fondations, on propose son point d'étape.
  const lastStep = [...flow.items].reverse().find((it) => it.type === 'etape');
  const lastCh = lastStep && stepIndex.get(lastStep.id) ? stepIndex.get(lastStep.id).chapter : null;
  const chapterDone = over && lastCh && lastCh.kind === 'fondations' && lastCh.steps.every((s) => isDone(s.id));
  return (
    <section className="v-body narrow">
      <PageHead
        kicker={'Session de ' + flow.minutes + ' minutes'}
        title={over ? 'Session terminée' : 'Ta session'}
        lead={over ? `Environ ${minutes} minute${minutes > 1 ? 's' : ''}. Ce qui est fait reste fait.` : 'Tu peux t’arrêter quand tu veux : rien n’est perdu.'}
      />
      <ol className="flowlist">
        {flow.items.map((it, i) => (
          <li key={i} className={i < flow.index || over ? 'is-done' : i === flow.index ? 'is-current' : ''}>
            <span className={'ldot lv-' + (i < flow.index || over ? 'faite' : 'nouvelle')} />
            <span>{it.label}</span>
          </li>
        ))}
      </ol>
      <div className="chips">
        {over ? (
          <>
            {chapterDone ? (
              <button type="button" className="btn btn-primary" onClick={() => { writeFlow(null); go('#/point/' + lastCh.id); }}>
                <Icon name="flag" size={18} /> Point d’étape du chapitre {lastCh.roman}
              </button>
            ) : null}
            <button type="button" className={'btn ' + (chapterDone ? 'btn-quiet' : 'btn-primary')} onClick={() => { writeFlow(null); go('#/'); }}>Terminer</button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={() => go(flow.items[flow.index].route)}>Continuer <Icon name="next" size={18} /></button>
            <button type="button" className="btn btn-quiet" onClick={() => { writeFlow(null); go('#/'); }}>Arrêter là</button>
          </>
        )}
      </div>
    </section>
  );
}
