// Enregistrer le son du Studio : un nombre entier de cycles, calé sur le début d'un cycle.
//
// Le son est pris à la sortie de Strudel (le dernier gain avant les haut-parleurs) :
// le fichier contient exactement ce que tu entends, à son volume.
//
// WAV : un AudioWorklet recopie chaque échantillon avec son numéro (currentFrame). On
// sait à quelle heure du contexte audio commence chaque cycle (même calcul que le
// planificateur de Strudel), donc on découpe le fichier pile au premier échantillon du
// cycle de départ et pile au dernier du dernier cycle : il boucle sans couture.
// WebM (ou MP4 sous Safari) : MediaRecorder, compressé, démarré et arrêté par minuterie ;
// début et fin à quelques centièmes de seconde près.
//
// Contrôles : scripts/check-record.mjs (longueur, calage, arrêt).
import * as engine from './engine.js';

const TAP = `class KmTap extends AudioWorkletProcessor {
  constructor() { super(); this.on = true; this.n = 0; this.f0 = 0; this.l = new Float32Array(4096); this.r = new Float32Array(4096);
    this.port.onmessage = (e) => { if (e.data === 'stop') { this.flush(); this.on = false; } }; }
  flush() { if (!this.n) return; this.port.postMessage({ f: this.f0, l: this.l.slice(0, this.n), r: this.r.slice(0, this.n) }); this.n = 0; }
  process(inputs) {
    if (!this.on) return false;
    const inp = inputs[0] || [];
    const L = inp[0]; const R = inp[1] || inp[0];
    const len = L ? L.length : 128;
    if (!this.n) this.f0 = currentFrame;
    for (let i = 0; i < len; i++) { this.l[this.n + i] = L ? L[i] : 0; this.r[this.n + i] = R ? R[i] : 0; }
    this.n += len;
    if (this.n + 128 > this.l.length) this.flush();
    return true;
  }
}
registerProcessor('km-tap', KmTap);`;

const loaded = new WeakMap();
function loadTap(ctx) {
  if (!loaded.has(ctx)) {
    const url = URL.createObjectURL(new Blob([TAP], { type: 'text/javascript' }));
    loaded.set(ctx, ctx.audioWorklet.addModule(url).finally(() => URL.revokeObjectURL(url)));
  }
  return loaded.get(ctx);
}

export function webmType() {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']) if (MediaRecorder.isTypeSupported(t)) return t;
  return '';
}
export function recordingSupported() {
  return typeof AudioWorkletNode !== 'undefined' && typeof window !== 'undefined' && typeof window.getAudioContext === 'function';
}

// Tempo écrit dans le code (setcpm / setcps), sans l'exécuter. 0,5 cycle par seconde
// sinon : c'est le tempo que l'app impose à un code qui n'en fixe pas (engine.js).
export function cpsOfCode(code) {
  const src = String(code || '').replace(/\/\/.*$/gm, '');
  const m = src.match(/\bsetcp([ms])\s*\(\s*([\d.\s/*+-]+?)\s*\)/);
  if (!m) return 0.5;
  try {
    const v = Function('"use strict";return (' + m[2] + ')')();
    if (!Number.isFinite(v) || v <= 0) return null;
    return m[1] === 'm' ? v / 60 : v;
  } catch {
    return null;
  }
}

// Longueur d'un morceau écrit avec arrange([n, motif], [m, motif]…) : n + m + … cycles,
// après quoi il recommence. null si le code n'a pas UN arrange lisible, ou plusieurs de
// longueurs différentes.
export function arrangeCycles(code) {
  const src = String(code || '').replace(/\/\/.*$/gm, '');
  const totals = [];
  const re = /\barrange\s*\(/g;
  let m;
  while ((m = re.exec(src))) {
    let i = re.lastIndex;
    let depth = 1;
    let total = 0;
    let q = null;
    for (; i < src.length && depth > 0; i++) {
      const ch = src[i];
      if (q) { if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; }
      if (ch === '[' && depth === 1) {
        const n = src.slice(i).match(/^\[\s*(\d+(?:\.\d+)?)\s*,/);
        if (!n) return null;
        total += Number(n[1]);
      }
      if ('([{'.includes(ch)) depth++;
      else if (')]}'.includes(ch)) depth--;
    }
    if (depth !== 0 || !total) return null;
    totals.push(total);
  }
  if (!totals.length || totals.some((t) => t !== totals[0]) || !Number.isInteger(totals[0])) return null;
  return totals[0];
}

function scheduler() {
  const ed = engine.getEditor();
  return ed && ed.repl && ed.repl.scheduler;
}
// Heure du contexte audio à laquelle sonne le début du cycle c (calcul du planificateur).
function timeOfCycle(s, c) {
  return (c - s.num_cycles_at_cps_change) / s.cps + s.seconds_at_cps_change + s.latency;
}
function cycleAtTime(s, t) {
  return (t - s.latency - s.seconds_at_cps_change) * s.cps + s.num_cycles_at_cps_change;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export class RecordError extends Error {}

// Enregistre `cycles` cycles. onProgress(secondes écoulées, secondes au total).
// signal : AbortSignal (bouton Annuler). Arrêter la lecture annule aussi.
// fromStart : la lecture repart du cycle 0 (un morceau `arrange` depuis son début).
export async function record({ cycles = 8, format = 'wav', onProgress, signal, fromStart = false } = {}) {
  if (!recordingSupported()) throw new RecordError('Ce navigateur ne permet pas d’enregistrer le son.');
  // Morceau depuis le début : on arrête la lecture. Les notes déjà programmées sonnent
  // encore un instant après l'arrêt (le moteur les prépare 0,1 s à l'avance) : la sortie
  // est coupée jusqu'au début du cycle 0, pour qu'elles ne débordent pas sur le morceau.
  let muted = null; // { gain, value }
  const unmute = (at) => {
    if (!muted) return;
    try {
      const g = muted.gain;
      const now = window.getAudioContext().currentTime;
      if (g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(now);
      else g.cancelScheduledValues(now);
      if (at == null || at <= now) g.setValueAtTime(muted.value, now);
      else {
        g.setValueAtTime(0, now);
        g.setValueAtTime(0, Math.max(now, at - 0.005));
        g.linearRampToValueAtTime(muted.value, at);
      }
    } catch { /* ignore */ }
    muted = null;
  };
  if (fromStart && engine.getEngineState().playing) {
    const g = window.getSuperdoughAudioController().output.destinationGain.gain;
    muted = { gain: g, value: g.value };
    g.cancelScheduledValues(0);
    g.setTargetAtTime(0, window.getAudioContext().currentTime, 0.01);
    engine.stop();
    for (let i = 0; scheduler() && scheduler().started; i++) {
      if (i > 100) { unmute(); throw new RecordError('La lecture ne s’est pas arrêtée.'); }
      await wait(20);
    }
    await wait(300);
  }
  // La prise de son est branchée AVANT de lancer la lecture : rien du cycle 0 ne manque.
  const ctx = window.getAudioContext();
  const out = window.getSuperdoughAudioController().output;
  const tap = out.destinationGain;
  await loadTap(ctx);
  const sr = ctx.sampleRate;
  const node = new AudioWorkletNode(ctx, 'km-tap', { numberOfInputs: 1, numberOfOutputs: 1, channelCount: 2, channelCountMode: 'explicit', outputChannelCount: [2] });
  const chunks = [];
  node.port.onmessage = (e) => chunks.push(e.data);
  tap.connect(node);
  node.connect(ctx.destination); // sa sortie est muette ; la connexion le fait tourner
  const unplug = () => {
    try { node.port.postMessage('stop'); } catch { /* ignore */ }
    try { tap.disconnect(node); } catch { /* ignore */ }
    try { node.disconnect(); } catch { /* ignore */ }
  };
  try {
    if (!engine.getEngineState().playing || fromStart) {
      const r = await engine.run();
      if (!r.ok) throw new RecordError(r.error || 'Le code ne joue pas.');
    }
    // Le planificateur doit avoir tourné au moins une fois au tempo du code.
    for (let i = 0; ; i++) {
      const s = scheduler();
      if (s && s.started && s.num_ticks_since_cps_change > 0 && s.seconds_at_cps_change != null) break;
      if (i > 150) throw new RecordError('La lecture n’a pas démarré.');
      await wait(5);
    }
  } catch (e) {
    unplug();
    unmute();
    throw e;
  }

  let mr = null;
  let msd = null;
  const parts = [];
  const cleanup = () => {
    unplug();
    unmute();
    if (mr && mr.state !== 'inactive') try { mr.stop(); } catch { /* ignore */ }
    if (msd) try { tap.disconnect(msd); } catch { /* ignore */ }
  };

  try {
    // Le premier cycle entier qui n'a pas encore commencé à sonner.
    const s0 = scheduler();
    const start = fromStart ? 0 : Math.ceil(cycleAtTime(s0, ctx.currentTime + 0.06) - 1e-9);
    const end = start + cycles;
    const tStart = timeOfCycle(s0, start);
    unmute(tStart);
    if (fromStart && format === 'webm' && ctx.currentTime > tStart + 0.01) throw new RecordError('Le début du morceau est passé avant que l’enregistrement soit prêt : réessaie.');
    if (format === 'webm') {
      const type = webmType();
      if (!type) throw new RecordError('Ce navigateur ne sait pas compresser le son : choisis WAV.');
      msd = ctx.createMediaStreamDestination();
      tap.connect(msd);
      mr = new MediaRecorder(msd.stream, { mimeType: type });
      mr.ondataavailable = (e) => e.data && e.data.size && parts.push(e.data);
      // Démarrage au début du cycle : minuterie, puis attente fine.
      while (ctx.currentTime < tStart - 0.03) await wait(Math.max(1, (tStart - 0.03 - ctx.currentTime) * 1000 - 15));
      while (ctx.currentTime < tStart) await wait(1);
      mr.start();
    }
    // On attend la fin du dernier cycle. Le tempo peut changer en route (setcpm
    // réévalué) : l'heure de fin est recalculée à chaque tour.
    for (;;) {
      if (signal && signal.aborted) throw new RecordError('Enregistrement annulé.');
      const s = scheduler();
      if (!s || !s.started) throw new RecordError('Enregistrement annulé : la lecture s’est arrêtée.');
      if (out.destinationGain !== tap) throw new RecordError('La sortie audio a été réinitialisée : recommence l’enregistrement.');
      const tEnd = timeOfCycle(s, end);
      const now = ctx.currentTime;
      if (onProgress) onProgress(Math.max(0, Math.min(now, tEnd) - tStart), tEnd - tStart);
      if (format === 'webm' && now >= tEnd) break;
      if (now >= tEnd + 0.12) break;
      await wait(format === 'webm' && tEnd - now < 0.05 ? 1 : Math.min(100, Math.max(1, (tEnd - now) * 1000 - 20)));
    }
    const tEnd = timeOfCycle(scheduler(), end);
    if (format === 'webm') {
      const stopped = new Promise((r) => (mr.onstop = r));
      mr.stop();
      await stopped;
      cleanup();
      const blob = new Blob(parts, { type: mr.mimeType || webmType() });
      return { blob, seconds: tEnd - tStart, cycles, ext: /mp4/.test(blob.type) ? 'm4a' : 'webm', start };
    }
    node.port.postMessage('stop');
    await wait(60);
    cleanup();
    const f0 = Math.round(tStart * sr);
    const f1 = Math.round(tEnd * sr);
    const n = f1 - f0;
    const L = new Float32Array(n);
    const R = new Float32Array(n);
    let covered = 0;
    for (const c of chunks) {
      const a = Math.max(f0, c.f);
      const b = Math.min(f1, c.f + c.l.length);
      if (b <= a) continue;
      L.set(c.l.subarray(a - c.f, b - c.f), a - f0);
      R.set(c.r.subarray(a - c.f, b - c.f), a - f0);
      covered += b - a;
    }
    if (covered < n) throw new RecordError('Une partie du son n’a pas été captée : recommence l’enregistrement.');
    let peak = 0;
    for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    return { blob: wav(L, R, sr), seconds: n / sr, cycles, ext: 'wav', peak, start, frames: n };
  } catch (e) {
    cleanup();
    throw e;
  }
}

// WAV PCM 16 bits stéréo. Au-delà de ±1, le son est écrêté, comme dans les haut-parleurs.
function wav(L, R, sr) {
  const n = L.length;
  const buf = new ArrayBuffer(44 + n * 4);
  const v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * 4, true);
  const s16 = (x) => Math.round(Math.max(-1, Math.min(1, x)) * 32767);
  for (let i = 0, o = 44; i < n; i++, o += 4) {
    v.setInt16(o, s16(L[i]), true);
    v.setInt16(o + 2, s16(R[i]), true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}
