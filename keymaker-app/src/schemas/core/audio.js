// Schémas vivants — la sortie audio des schémas.
//
//  - UN contexte audio : celui du moteur Strudel (getAudioContext, exporté par le moteur
//    embarqué). Les schémas n'en créent pas un second.
//  - UNE sortie protégée : compresseur réglé en limiteur (seuil −10 dB, rapport 20,
//    attaque 2 ms) puis écrêtage doux. Protège les oreilles quand la résonance monte.
//  - UN son à la fois : un schéma qui joue arrête l'éditeur (et l'écoute d'un exemple),
//    et un code qui se met à jouer arrête les schémas. Deux schémas ne jouent jamais ensemble.
//  - iPhone : le son des schémas ne doit pas dépendre du bouton silencieux.
import * as engine from '../../lib/engine.js';

let own = null; // contexte de secours, si le moteur n'a pas pu se charger
let out = null; // { ctx, input }
let active = null; // { id, stop }
const listeners = new Set();

export function audioContext() {
  try {
    if (typeof window !== 'undefined' && typeof window.getAudioContext === 'function') return window.getAudioContext();
  } catch {
    /* moteur indisponible */
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  own = own || new AC();
  return own;
}

// Courbe d'écrêtage doux (tangente hyperbolique), neutre pour les petits signaux.
function softClipCurve(n = 2048) {
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    c[i] = Math.tanh(x * 1.2) / Math.tanh(1.2);
  }
  return c;
}

// Entrée de la sortie protégée. Construite une fois par contexte.
export function output(ctx = audioContext()) {
  if (out && out.ctx === ctx) return out.input;
  const input = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.knee.value = 0;
  comp.ratio.value = 20;
  comp.attack.value = 0.002;
  comp.release.value = 0.1;
  const clip = ctx.createWaveShaper();
  clip.curve = softClipCurve();
  clip.oversample = '2x';
  input.connect(comp).connect(clip).connect(ctx.destination);
  out = { ctx, input };
  return input;
}

/* --- iPhone : jouer même quand le bouton silencieux est activé ------------------ */
let unlocked = false;
export function unlock() {
  const ctx = audioContext();
  if (!unlocked) {
    unlocked = true;
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
      else {
        // Ancien Safari : un son silencieux très court, joué pendant le geste, ouvre la sortie.
        const b = ctx.createBuffer(1, 1, ctx.sampleRate);
        const s = ctx.createBufferSource();
        s.buffer = b;
        s.connect(ctx.destination);
        s.start();
      }
    } catch {
      /* sans conséquence */
    }
  }
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  return ctx;
}

/* --- Un son à la fois ------------------------------------------------------------- */
function emit() {
  listeners.forEach((cb) => {
    try {
      cb(active && active.id);
    } catch {
      /* ignore */
    }
  });
}
export function onActive(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function activeId() {
  return active && active.id;
}

// Un schéma va jouer : il coupe l'éditeur, l'exemple en écoute et l'autre schéma.
export function claim(id, stop) {
  if (active && active.id !== id) {
    const prev = active;
    active = null;
    try {
      prev.stop();
    } catch {
      /* ignore */
    }
  }
  try {
    if (engine.isPreviewing()) engine.endPreview();
    if (engine.getEngineState().playing) engine.stop();
  } catch {
    /* moteur absent */
  }
  active = { id, stop };
  emit();
}

// Le schéma s'est arrêté de lui-même.
export function release(id) {
  if (active && active.id === id) {
    active = null;
    emit();
  }
}

export function stopAll() {
  if (!active) return;
  const prev = active;
  active = null;
  try {
    prev.stop();
  } catch {
    /* ignore */
  }
  emit();
}

// Le code de l'éditeur (ou un exemple du wiki) se met à jouer : les schémas se taisent.
try {
  let was = false;
  engine.onEngine((st) => {
    if (st.playing && !was) stopAll();
    was = !!st.playing;
  });
} catch {
  /* hors navigateur */
}
