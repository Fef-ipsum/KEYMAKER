// Schémas vivants — les sons des schémas (navigateur).
//
// Chaque note est construite comme superdough la construit (../core/synth.js), avec SON
// PROPRE filtre, retiré quand la note se termine (fin + extinction), par le même genre de
// minuteur que superdough. Un filtre partagé entre les notes ne sonne pas pareil : avec
// une forte résonance, il continuerait de « sonner » d'une note à l'autre (mesuré par
// scripts/check-schemas.mjs). Différence voulue avec Strudel : quand on bouge un réglage,
// les notes EN COURS le suivent aussi (le son réagit tout de suite).
//
// Un « métronome » à anticipation programme les notes d'un motif qui boucle, au tempo par
// défaut de l'app (0,5 cycle par seconde), sur la grille exacte du motif.
import { synthNote, midiToFreq, freezeAt } from '../core/synth.js';
import { SYNTH_DEFAULTS, adsrPlan, envPlan, planValue, holdStartPlan, applyPlan, noteStop } from '../core/adsr.js';
import { SOURCES, KINDS } from '../types/filtre.js';
import adsrDef, { MOTIF, HOLD_NOTE } from '../types/adsr.js';

export const CPS = 0.5;
const SMOOTH = 0.004; // constante de temps du lissage des réglages (≈ 12 ms pour arriver)

// Boucle un motif : getSlots() → [midi…] répartis sur un cycle. onNote(midi, t, dur).
export function createLooper(ac, { getSlots, onNote, cps = CPS }) {
  let timer = 0;
  let t0 = 0;
  let next = 0; // index absolu du prochain pas
  const LOOK = 0.12;
  const tick = () => {
    const slots = getSlots();
    const n = slots.length;
    const step = 1 / (n * cps);
    const horizon = ac.currentTime + LOOK;
    let t = t0 + next * step;
    while (t < horizon) {
      if (t >= ac.currentTime - 0.01) onNote(slots[next % n], t, step);
      next++;
      t = t0 + next * step;
    }
  };
  return {
    start() {
      t0 = ac.currentTime + 0.05;
      next = 0;
      tick();
      timer = setInterval(tick, 25);
    },
    stop() {
      clearInterval(timer);
      timer = 0;
    },
    resync() {
      // Après un changement de motif : repartir sur la grille du nouveau motif.
      const n = getSlots().length;
      const step = 1 / (n * cps);
      next = Math.max(0, Math.ceil((ac.currentTime + 0.02 - t0) / step));
    },
  };
}

// Le minuteur de superdough (webAudioTimeout) : une source silencieuse dont la fin
// déclenche le rangement de la note.
function audioTimeout(ac, cb, start, end) {
  const src = new ConstantSourceNode(ac);
  const g = ac.createGain();
  g.gain.value = 0;
  src.connect(g).connect(ac.destination);
  src.onended = () => {
    try {
      src.disconnect();
      g.disconnect();
    } catch {
      /* déjà fait */
    }
    cb();
  };
  src.start(start);
  src.stop(end);
}

function setFilter(f, kind, p, ac, smooth) {
  const node = KINDS[kind].node;
  if (f.type !== node) f.type = node;
  if (smooth) {
    f.frequency.setTargetAtTime(p.f, ac.currentTime, SMOOTH);
    f.Q.setTargetAtTime(p.q, ac.currentTime, SMOOTH);
  } else {
    f.frequency.value = p.f;
    f.Q.value = p.q;
  }
}

/* --- Filtre ----------------------------------------------------------------------- */
// Sortie : un bus « avec filtre » et un bus « sans filtre » (avant / après).
export function createFiltreSound(ac, dest, getState) {
  const wet = ac.createGain();
  const dry = ac.createGain();
  dry.gain.value = 0;
  wet.connect(dest);
  dry.connect(dest);
  const live = new Set(); // notes dont le filtre est encore branché
  const notes = []; // { midi, t0 } — pour le peigne des harmoniques
  let lastSource = null;

  // Une note : la dent de scie de superdough (enveloppe par défaut), puis SON filtre.
  function note(midi, t, dur) {
    const st = getState();
    const tap = ac.createGain();
    const filt = ac.createBiquadFilter();
    setFilter(filt, st.o.kind, st.p, ac, false);
    tap.connect(filt).connect(wet);
    tap.connect(dry);
    const voice = synthNote(ac, tap, { wave: 'sawtooth', freq: midiToFreq(midi), begin: t, hold: dur, vals: [...SYNTH_DEFAULTS] });
    const entry = { filt, voice, tap };
    live.add(entry);
    // Comme superdough : la chaîne de la note est rangée à fin + extinction (0,01 s par défaut).
    audioTimeout(ac, () => {
      live.delete(entry);
      try {
        tap.disconnect();
        filt.disconnect();
      } catch {
        /* déjà fait */
      }
    }, t, t + dur + SYNTH_DEFAULTS[3]);
    notes.push({ midi, t0: t });
    while (notes.length > 16) notes.shift();
    return entry;
  }

  const looper = createLooper(ac, {
    getSlots: () => SOURCES[getState().o.source].midi,
    onNote: note,
  });

  return {
    note,
    live,
    start() {
      lastSource = getState().o.source;
      looper.start();
    },
    stop() {
      looper.stop();
      const now = ac.currentTime;
      for (const e of live) e.voice.kill(now);
      notes.length = 0;
    },
    // Chaque note qui sonne suit le réglage, en douceur (≈ 12 ms).
    update(st) {
      for (const e of live) setFilter(e.filt, st.o.kind, st.p, ac, true);
      if (st.o.source !== lastSource) {
        lastSource = st.o.source;
        looper.resync();
      }
    },
    bypass(on) {
      const now = ac.currentTime;
      wet.gain.setTargetAtTime(on ? 0 : 1, now, SMOOTH);
      dry.gain.setTargetAtTime(on ? 1 : 0, now, SMOOTH);
    },
    // La note qui sonne en ce moment (pour le peigne des harmoniques).
    currentMidi() {
      const now = ac.currentTime;
      for (let i = notes.length - 1; i >= 0; i--) if (notes[i].t0 <= now) return notes[i].midi;
      return null;
    },
    dispose() {
      this.stop();
      try {
        wet.disconnect();
        dry.disconnect();
      } catch {
        /* ignore */
      }
    },
  };
}

/* --- Enveloppe -------------------------------------------------------------------- */
// Chaque note passe dans SON passe-bas à 1500 Hz (comme `.lpf(1500)` dans le code),
// Q = 1 (valeur par défaut de Strudel), rangé à fin + extinction.
export function adsrNote(ac, dest, midi, t, dur, vals) {
  const filt = ac.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 1500;
  filt.Q.value = 1;
  filt.connect(dest);
  const voice = synthNote(ac, filt, { wave: 'sawtooth', freq: midiToFreq(midi), begin: t, hold: dur, vals });
  audioTimeout(ac, () => {
    try {
      filt.disconnect();
    } catch {
      /* déjà fait */
    }
  }, t, t + dur + vals[3]);
  return voice;
}

// Une voix tenue dont on peut changer l'enveloppe en cours de route : on garde la
// trace exacte de ce qui a été programmé, pour la dessiner.
export function heldVoice(ac, dest, vals, wave = 'sawtooth') {
  const begin = ac.currentTime + 0.01;
  let out = dest;
  let filt = null;
  if (wave !== 'one') {
    filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 1500;
    filt.Q.value = 1;
    filt.connect(dest);
    out = filt;
  }
  const v = synthNote(ac, out, { wave, freq: midiToFreq(HOLD_NOTE), begin, hold: null, vals });
  // Morceaux : [{ from, fn }] ; fn(t) = valeur programmée à t.
  const pieces = [{ from: -Infinity, fn: (t) => planValue(holdStartPlan(vals, begin), t) }];
  const valueAt = (t) => {
    for (let i = pieces.length - 1; i >= 0; i--) if (t >= pieces[i].from) return pieces[i].fn(t);
    return 0;
  };
  let releaseAt = null;
  let curVals = vals;
  return {
    begin,
    env: v.env,
    get releaseAt() {
      return releaseAt;
    },
    get vals() {
      return curVals;
    },
    valueAt,
    // Nouveaux réglages pendant qu'on tient : le volume rejoint la nouvelle courbe en 20 ms.
    retune(newVals) {
      if (releaseAt != null) return;
      const now = ac.currentTime;
      const T = now + 0.02;
      const from = valueAt(now);
      const plan = holdStartPlan(newVals, begin);
      const to = planValue(plan, T);
      freezeAt(v.env.gain, now, from);
      v.env.gain.linearRampToValueAtTime(to, T);
      const rest = plan.filter((e) => e.t > T);
      applyPlan(v.env.gain, rest);
      const restPlan = [{ kind: 'set', t: T, v: to }, ...rest];
      pieces.push({ from: now, fn: (t) => (t < T ? from + (to - from) * ((t - now) / 0.02) : planValue(restPlan, t)) });
      curVals = newVals;
    },
    // Lâcher : on fige le niveau atteint, puis l'extinction (comme getParamADSR pour cette durée).
    release() {
      if (releaseAt != null) return;
      const T = ac.currentTime;
      const from = valueAt(T);
      const r = curVals[3];
      freezeAt(v.env.gain, T, from);
      v.env.gain.linearRampToValueAtTime(0, T + r);
      v.osc.stop(noteStop(curVals, T));
      pieces.push({ from: T, fn: (t) => (t >= T + r ? 0 : from * (1 - (t - T) / r)) });
      releaseAt = T;
      if (filt) audioTimeout(ac, () => filt.disconnect(), T, T + r);
    },
    kill() {
      v.kill();
      releaseAt = releaseAt ?? ac.currentTime;
    },
  };
}

export function createAdsrSound(ac, dest, getState) {
  const bus = ac.createGain();
  bus.connect(dest);
  let bypass = false;
  let held = null;
  let last = null; // { begin, releaseAt, vals, valueAt }
  const voices = [];
  const pendingNotes = [];
  const valsNow = () => (bypass ? [...SYNTH_DEFAULTS] : adsrDef.values(getState()));
  const cache = new Map();
  const planFor = (vals, t, dur) => {
    const key = vals.join(',') + '@' + t + '+' + dur;
    if (!cache.has(key)) {
      cache.set(key, adsrPlan(vals, t, dur));
      if (cache.size > 40) cache.delete(cache.keys().next().value);
    }
    return cache.get(key);
  };

  const looper = createLooper(ac, {
    getSlots: () => MOTIF.midi,
    onNote: (midi, t, dur) => {
      const vals = valsNow();
      voices.push(adsrNote(ac, bus, midi, t, dur, vals));
      while (voices.length > 12) voices.shift();
      // Pour la trace : la note qui vient d'être programmée (elle commence bientôt).
      pendingNotes.push({ begin: t, releaseAt: t + dur, vals, valueAt: (x) => planValue(planFor(vals, t, dur), x) });
    },
  });

  return {
    // Dernière note commencée (pour la trace dorée).
    lastNote() {
      const now = ac.currentTime;
      while (pendingNotes.length && pendingNotes[0].begin <= now) last = pendingNotes.shift();
      return last;
    },
    startMotif() {
      looper.start();
    },
    stopMotif() {
      looper.stop();
      for (const v of voices) v.kill();
      voices.length = 0;
      pendingNotes.length = 0;
    },
    press() {
      if (held) held.release();
      held = heldVoice(ac, bus, valsNow());
      last = held;
      return held;
    },
    lift() {
      if (!held) return;
      held.release();
      held = null;
    },
    holding: () => !!held,
    update() {
      if (held) held.retune(valsNow());
    },
    bypass(on) {
      bypass = on;
      if (held) held.retune(valsNow());
    },
    stop() {
      this.stopMotif();
      if (held) held.kill();
      held = null;
    },
    dispose() {
      this.stop();
      try {
        bus.disconnect();
      } catch {
        /* ignore */
      }
    },
  };
}

/* --- Ondes ------------------------------------------------------------------------- */
// note("c3").sound(onde) : une note par cycle (2 s), enveloppe par défaut, sans filtre.
// Changer d'onde ou de hauteur change aussi la note en cours (le son réagit tout de suite).
export function ondeNote(ac, dest, wave, midi, t, dur) {
  return synthNote(ac, dest, { wave, freq: midiToFreq(midi), begin: t, hold: dur, vals: [...SYNTH_DEFAULTS] });
}
export function createOndeSound(ac, dest, getState, { notes: NOTE_MIDI }) {
  const bus = ac.createGain();
  bus.connect(dest);
  let bypass = false;
  const live = new Set();
  const waveNow = () => (bypass ? 'sine' : getState().o.onde);
  const looper = createLooper(ac, {
    getSlots: () => [NOTE_MIDI[getState().o.note]],
    onNote: (midi, t, dur) => {
      const v = ondeNote(ac, bus, waveNow(), midi, t, dur);
      live.add(v);
      audioTimeout(ac, () => live.delete(v), t, t + dur + 0.02);
    },
  });
  const retune = () => {
    const st = getState();
    for (const v of live) {
      try {
        v.osc.type = waveNow();
        v.osc.frequency.setTargetAtTime(midiToFreq(NOTE_MIDI[st.o.note]), ac.currentTime, SMOOTH);
      } catch {
        /* note finie */
      }
    }
  };
  return {
    start: () => looper.start(),
    stop() {
      looper.stop();
      for (const v of live) v.kill();
      live.clear();
    },
    update: retune,
    bypass(on) {
      bypass = on;
      retune();
    },
    dispose() {
      this.stop();
      try {
        bus.disconnect();
      } catch {
        /* ignore */
      }
    },
  };
}

/* --- Enveloppe de filtre ------------------------------------------------------------ */
// Une note : la dent de scie de superdough, et SON passe-bas dont la coupure suit
// l'enveloppe exponentielle (envPlan, comme getParamADSR de createFilter).
// Quand on change un réglage, les notes en cours rejoignent la nouvelle courbe en 20 ms.
export function fenvNote(ac, dest, midi, t, dur, st, def) {
  const filt = ac.createBiquadFilter();
  filt.type = 'lowpass';
  filt.Q.value = st.p.q;
  const plan = envPlan(def.values(st), t, dur, { ...def.range(st), curve: 'exponential' });
  applyPlan(filt.frequency, plan);
  filt.connect(dest);
  const voice = synthNote(ac, filt, { wave: 'sawtooth', freq: midiToFreq(midi), begin: t, hold: dur, vals: [...SYNTH_DEFAULTS] });
  const pieces = [{ from: -Infinity, fn: (x) => planValue(plan, x) }];
  const valueAt = (x) => {
    for (let i = pieces.length - 1; i >= 0; i--) if (x >= pieces[i].from) return pieces[i].fn(x);
    return plan[0].v;
  };
  audioTimeout(ac, () => {
    try {
      filt.disconnect();
    } catch {
      /* déjà fait */
    }
  }, t, t + dur + SYNTH_DEFAULTS[3]);
  return {
    voice,
    filt,
    begin: t,
    releaseAt: t + dur,
    get vals() {
      return def.values(st);
    },
    end: t + dur + def.values(st)[3],
    valueAt,
    retune(next) {
      const now = ac.currentTime;
      if (now > t + dur + 0.02) return;
      const np = envPlan(def.values(next), t, dur, { ...def.range(next), curve: 'exponential' });
      filt.Q.setTargetAtTime(next.p.q, now, SMOOTH);
      // Note programmée mais pas encore commencée : elle reçoit simplement la nouvelle
      // courbe entière. (Partir de sa valeur « actuelle », 0 avant le début, donnait une
      // rampe exponentielle depuis 0 : un nombre invalide, et le schéma plantait.)
      if (now < t) {
        filt.frequency.cancelScheduledValues(0);
        applyPlan(filt.frequency, np);
        pieces.length = 0;
        pieces.push({ from: -Infinity, fn: (x) => planValue(np, x) });
        return;
      }
      const T = now + 0.02;
      const from = valueAt(now);
      if (!(from > 0) || !Number.isFinite(from)) return;
      const to = Math.max(planValue(np, T), 0.001);
      if (!Number.isFinite(to)) return;
      freezeAt(filt.frequency, now, from);
      filt.frequency.exponentialRampToValueAtTime(to, T);
      const rest = np.filter((e) => e.t > T);
      applyPlan(filt.frequency, rest);
      const restPlan = [{ kind: 'set', t: T, v: to }, ...rest];
      pieces.push({ from: now, fn: (x) => (x < T ? from * Math.pow(to / from, (x - now) / 0.02) : planValue(restPlan, x)) });
    },
  };
}
export function createFenvSound(ac, dest, getState, def) {
  const bus = ac.createGain();
  bus.connect(dest);
  let bypass = false;
  const live = new Set();
  const pending = [];
  let last = null;
  // Sans l'enveloppe : la même note, la coupure fixe à lpf (lpenv 0).
  const stateNow = () => {
    const st = getState();
    return bypass ? { ...st, p: { ...st.p, env: 0 } } : st;
  };
  const looper = createLooper(ac, {
    getSlots: () => SOURCES[getState().o.source].midi,
    onNote: (midi, t, dur) => {
      const n = fenvNote(ac, bus, midi, t, dur, stateNow(), def);
      live.add(n);
      pending.push(n);
      audioTimeout(ac, () => live.delete(n), t, t + dur + 0.05);
    },
  });
  return {
    lastNote() {
      const now = ac.currentTime;
      while (pending.length && pending[0].begin <= now) last = pending.shift();
      return last;
    },
    start: () => looper.start(),
    stop() {
      looper.stop();
      for (const n of live) n.voice.kill();
      live.clear();
      pending.length = 0;
    },
    update() {
      const st = stateNow();
      for (const n of live) n.retune(st);
    },
    bypass(on) {
      bypass = on;
      this.update();
    },
    dispose() {
      this.stop();
      try {
        bus.disconnect();
      } catch {
        /* ignore */
      }
    },
  };
}
