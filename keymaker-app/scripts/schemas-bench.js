// Banc d'essai des schémas vivants — côté NAVIGATEUR (chargé par scripts/check-schemas.mjs).
//
// Deux rendus hors temps réel du même code, dans un OfflineAudioContext séparé :
//   - superdough, le moteur audio de Strudel embarqué (comme renderPatternAudio, sans
//     fermer le contexte audio de la page) ;
//   - la chaîne du schéma, avec les fonctions MÊMES de l'app (src/schemas/…).
// Puis on compare : échantillons, enveloppe de volume (RMS sur 10 ms), spectre.
import { TYPES, stateFromSpec, codeText } from '/src/schemas/catalog.js';
import { adsrValues, adsrPlan, planValue, SYNTH_DEFAULTS } from '/src/schemas/core/adsr.js';
import { createFiltreSound, adsrNote, heldVoice, ondeNote, fenvNote, CPS } from '/src/schemas/ui/sounds.js';
import { envPlan, FILTER_ENV_DEFAULTS, filterEnvRange } from '/src/schemas/core/adsr.js';
import { NOTES as ONDE_NOTES, period, harmonics } from '/src/schemas/types/onde.js';
import { motifEvents, createPatternSound } from '/src/schemas/ui/pattern.js';
import { createMissionRunner, pickMissions } from '/src/schemas/core/missions.js';
import { filterResponse } from '/src/schemas/ui/response.js';
import { SOURCES } from '/src/schemas/types/filtre.js';
import { MOTIF, HOLD_NOTE } from '/src/schemas/types/adsr.js';

export const SR = 44100;

/* --- Outils de mesure --------------------------------------------------------------- */
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < len / 2; k++) {
        const wr = Math.cos(ang * k);
        const wi = Math.sin(ang * k);
        const a = i + k;
        const b = a + len / 2;
        const xr = re[b] * wr - im[b] * wi;
        const xi = re[b] * wi + im[b] * wr;
        re[b] = re[a] - xr;
        im[b] = im[a] - xi;
        re[a] += xr;
        im[a] += xi;
      }
    }
  }
}
// Spectre en dB (fenêtre de Hann) d'un morceau de signal.
export function spectrum(x, start, n = 8192) {
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = (x[start + i] || 0) * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
  fft(re, im);
  const out = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) out[i] = 20 * Math.log10(Math.hypot(re[i], im[i]) + 1e-12);
  return out;
}
export function rmsEnvelope(x, win = Math.round(SR * 0.01)) {
  const out = [];
  for (let i = 0; i + win <= x.length; i += win) {
    let s = 0;
    for (let j = i; j < i + win; j++) s += x[j] * x[j];
    out.push(Math.sqrt(s / win));
  }
  return out;
}
// Compare deux rendus. Renvoie les écarts mesurés.
// `zones` : intervalles [t0, t1] (secondes) mis à part. Superdough range chaque note
// (déconnexion de sa chaîne) sur un événement asynchrone : juste après la fin d'une note,
// son rendu varie d'une fois à l'autre (mesuré : deux rendus du même code diffèrent là
// quand la résonance est forte). On compare donc exactement partout ailleurs, et on
// rapporte l'écart dans ces zones à part.
export function compare(a, b, zones = []) {
  const n = Math.min(a.length, b.length);
  const inZone = (t) => zones.some(([z0, z1]) => t >= z0 && t < z1);
  let maxAbs = 0;
  let zoneAbs = 0;
  let peak = 0;
  for (let i = 0; i < n; i++) {
    const d = Math.abs(a[i] - b[i]);
    if (inZone(i / SR)) zoneAbs = Math.max(zoneAbs, d);
    else maxAbs = Math.max(maxAbs, d);
    peak = Math.max(peak, Math.abs(a[i]));
  }
  const win = Math.round(SR * 0.01);
  const ea = rmsEnvelope(a, win);
  const eb = rmsEnvelope(b, win);
  const ePeak = Math.max(...ea, 1e-9);
  let envDiff = 0;
  for (let i = 0; i < Math.min(ea.length, eb.length); i++) {
    const t0 = (i * win) / SR;
    if (inZone(t0) || inZone(t0 + 0.0099)) continue;
    envDiff = Math.max(envDiff, Math.abs(ea[i] - eb[i]) / ePeak);
  }
  // Spectre : sur le premier morceau où le son est installé.
  const start = Math.round(SR * 0.03);
  const sa = spectrum(a, start);
  const sb = spectrum(b, start);
  const top = Math.max(...sa);
  let specDiff = 0;
  for (let i = 1; i < sa.length; i++) if (sa[i] > top - 50) specDiff = Math.max(specDiff, Math.abs(sa[i] - sb[i]));
  return { maxAbs, zoneAbs, peak, envDiff, specDiff };
}

// Zones de rangement des notes d'un schéma (voir compare).
export function teardownZones(spec, seconds) {
  const st = stateFromSpec(spec);
  let n;
  let tail;
  if (spec.type === 'filtre' || spec.type === 'enveloppe-filtre') {
    n = SOURCES[st.o.source].midi.length;
    tail = SYNTH_DEFAULTS[3];
  } else if (spec.type === 'onde') {
    n = 1;
    tail = SYNTH_DEFAULTS[3];
  } else {
    n = st.o.mode === 'motif' ? MOTIF.midi.length : 1;
    tail = TYPES.adsr.values(st)[3];
  }
  // Après le rangement, un filtre résonant continue de « sonner » : constante de temps
  // τ = Q / (π·f) (Q linéaire = 10^(lpq/20)). La zone couvre 7 τ (−60 dB), 80 ms au moins.
  let ring = 0;
  if (spec.type === 'filtre' || spec.type === 'enveloppe-filtre') {
    const f = spec.type === 'filtre' ? st.p.f : Math.min(...Object.values(TYPES[spec.type].range(st)));
    ring = (7 * Math.pow(10, st.p.q / 20)) / (Math.PI * Math.max(f, 20));
  }
  const len = Math.max(0.08, ring);
  const step = 1 / (n * CPS);
  const out = [];
  for (let k = 0; k * step < seconds; k++) out.push([(k + 1) * step + tail, (k + 1) * step + tail + len]);
  return out;
}

/* --- Le moteur Strudel ---------------------------------------------------------------- */
export async function evalPattern(code) {
  const ed = window.__ed;
  ed.setCode(code);
  if (!/\bsetcp[ms]\s*\(/.test(code)) ed.repl.setCps(0.5);
  // Sans démarrer la lecture (autostart = false) : sinon le moteur jouerait quelques notes
  // dans le contexte audio de la page, et ses nœuds recyclés fuiraient dans les rendus.
  await ed.repl.evaluate(code, false);
  const st = ed.repl.state;
  if (st.evalError) throw new Error(String(st.evalError.message || st.evalError));
  return st.pattern;
}

// Rendu par superdough, dans UN contexte hors temps réel séparé (celui de la page est
// remis en place ensuite ; renderPatternAudio, lui, le fermerait).
// Superdough recycle ses nœuds audio dans une réserve commune à tous les contextes : un
// deuxième contexte hors temps réel recevrait des nœuds du premier et planterait. On fait
// donc TOUS les rendus superdough d'une vérification dans un seul contexte, chacun à son
// propre décalage dans le temps, séparés par assez de silence pour que rien ne déborde.
const GAP = 5.5; // plus longue note tenue (2 s) + plus longue extinction (3 s) + marge
window.__renders = window.__renders || {};
export async function renderStrudelAll(items) {
  const cps = 0.5;
  const plans = [];
  let offset = 0;
  for (const it of items) {
    const pat = await evalPattern(it.code);
    plans.push({ ...it, pat, offset });
    offset += it.seconds + GAP;
  }
  const orig = window.getAudioContext();
  const origCtl = window.getSuperdoughAudioController();
  const ac = new OfflineAudioContext(2, Math.round(offset * SR), SR);
  window.setAudioContext(ac);
  window.setSuperdoughAudioController(new origCtl.constructor(ac));
  try {
    for (const p of plans) {
      const haps = p.pat
        .queryArc(0, p.seconds * cps)
        .filter((h) => h.hasOnset())
        .sort((x, y) => x.whole.begin.valueOf() - y.whole.begin.valueOf());
      for (const h of haps) {
        const begin = h.whole.begin.valueOf();
        await window.superdough({ ...h.value }, p.offset + begin / cps, h.duration.valueOf() / cps, cps, begin);
      }
    }
    const x = (await ac.startRendering()).getChannelData(0);
    for (const p of plans) window.__renders[p.key] = x.slice(Math.round(p.offset * SR), Math.round((p.offset + p.seconds) * SR));
    return plans.length;
  } finally {
    window.setAudioContext(orig);
    window.setSuperdoughAudioController(origCtl);
  }
}
const rendered = (key) => {
  const x = window.__renders[key];
  if (!x) throw new Error('rendu superdough absent : ' + key);
  return Array.from(x);
};

// Rendu par la chaîne du schéma (mêmes fonctions que l'app, mêmes notes, même grille).
export async function renderSchema(spec, seconds, stOverride) {
  const st = stOverride || stateFromSpec(spec);
  const ac = new OfflineAudioContext(2, Math.round(seconds * SR), SR);
  if (spec.type === 'filtre') {
    const snd = createFiltreSound(ac, ac.destination, () => st);
    const slots = SOURCES[st.o.source].midi;
    const step = 1 / (slots.length * CPS);
    for (let i = 0; i * step < seconds; i++) snd.note(slots[i % slots.length], i * step, step);
  } else if (spec.type === 'adsr') {
    const vals = TYPES.adsr.values(st);
    const slots = st.o.mode === 'motif' ? MOTIF.midi : [HOLD_NOTE];
    const step = 1 / (slots.length * CPS);
    for (let i = 0; i * step < seconds; i++) adsrNote(ac, ac.destination, slots[i % slots.length], i * step, step, vals);
  }
  else if (spec.type === 'enveloppe-filtre') {
    const slots = SOURCES[st.o.source].midi;
    const step = 1 / (slots.length * CPS);
    for (let i = 0; i * step < seconds; i++) fenvNote(ac, ac.destination, slots[i % slots.length], i * step, step, st, TYPES['enveloppe-filtre']);
  } else if (spec.type === 'onde') {
    for (let i = 0; i * 2 < seconds; i++) ondeNote(ac, ac.destination, st.o.onde, ONDE_NOTES[st.o.note], i * 2, 2);
  }
  const buf = await ac.startRendering();
  return Array.from(buf.getChannelData(0));
}

// Codes à rendre par superdough pour comparer un schéma (clé = la déclaration).
export function strudelItem(spec, seconds = 2.3) {
  const st = stateFromSpec(spec);
  return { key: 'spec:' + JSON.stringify(spec), code: codeText(TYPES[spec.type], st), seconds };
}
export async function soundVsStrudel(spec, seconds = 2.3) {
  const it = strudelItem(spec, seconds);
  const a = rendered(it.key);
  const b = await renderSchema(spec, seconds);
  return { code: it.code, ...compare(a, b, teardownZones(spec, seconds)) };
}

// Rendus superdough dont les faits ont besoin.
export const FACT_RENDERS = [
  { key: 'fact:sans-lpq', code: 'note("c2*4").sound("sawtooth").lpf(600)', seconds: 1.2 },
  { key: 'fact:lpq1', code: 'note("c2*4").sound("sawtooth").lpf(600).lpq(1)', seconds: 1.2 },
  { key: 'fact:lpq0', code: 'note("c2*4").sound("sawtooth").lpf(600).lpq(0)', seconds: 1.2 },
  { key: 'fact:sans-hpq', code: 'note("c2*4").sound("sawtooth").hpf(600)', seconds: 1.2 },
  { key: 'fact:hpq1', code: 'note("c2*4").sound("sawtooth").hpf(600).hpq(1)', seconds: 1.2 },
  { key: 'fact:sans-bpq', code: 'note("c2*4").sound("sawtooth").bpf(600)', seconds: 1.2 },
  { key: 'fact:bpq1', code: 'note("c2*4").sound("sawtooth").bpf(600).bpq(1)', seconds: 1.2 },
  { key: 'fact:lpa-seul', code: 'note("c2*4").sound("sawtooth").lpf(300).lpa(.1)', seconds: 1.2 },
  { key: 'fact:lpa-env1', code: 'note("c2*4").sound("sawtooth").lpf(300).lpa(.1).lpenv(1)', seconds: 1.2 },
  { key: 'fact:fenv-defauts', code: 'note("c2*4").sound("sawtooth").lpf(300).lpenv(3)', seconds: 1.2 },
  { key: 'fact:12db', code: 'note("c2").sound("sawtooth").lpf(500)', seconds: 0.4 },
  { key: 'fact:24db', code: 'note("c2").sound("sawtooth").lpf(500).ftype("24db")', seconds: 0.4 },
];

/* --- 1. Le dessin correspond à l'objet audio ----------------------------------------------- */
// Filtre : la courbe dessinée (filtre non branché, réglé comme celui qui joue) contre la
// réponse du filtre qui joue réellement, après un changement de réglage pendant la lecture.
export async function drawingVsFilter(specA, specB) {
  const ac = window.getAudioContext();
  await ac.resume();
  let st = stateFromSpec(specA);
  const sink = ac.createGain();
  sink.gain.value = 0;
  sink.connect(ac.destination);
  const snd = createFiltreSound(ac, sink, () => st);
  snd.note(36, ac.currentTime + 0.02, 1); // une note qui sonne, avec son filtre
  st = stateFromSpec(specB);
  snd.update(st); // lissage d'environ 12 ms, comme dans l'app
  await new Promise((r) => setTimeout(r, 250));
  const playing = [...snd.live][0].filt;
  const freqs = new Float32Array(240);
  for (let i = 0; i < 240; i++) freqs[i] = 20 * Math.pow(1000, i / 239);
  const drawn = filterResponse(ac, st, freqs);
  const mag = new Float32Array(240);
  const ph = new Float32Array(240);
  playing.getFrequencyResponse(freqs, mag, ph);
  let maxDb = 0;
  for (let i = 0; i < 240; i++) maxDb = Math.max(maxDb, Math.abs(drawn[i] - 20 * Math.log10(Math.max(mag[i], 1e-6))));
  snd.dispose();
  return { maxDb };
}

// Enveloppe : la forme dessinée (adsrPlan) contre le volume réellement programmé, rendu
// hors temps réel ; et contre getParamADSR de superdough lui-même.
export async function envelopeVsEngine(vals, hold) {
  const len = Math.round((hold + vals[3] + 0.2) * SR);
  const begin = 0.01;
  const render = async (apply) => {
    const ac = new OfflineAudioContext(1, len, SR);
    const src = new ConstantSourceNode(ac, { offset: 1 });
    const g = ac.createGain();
    g.gain.value = 0;
    src.connect(g).connect(ac.destination);
    apply(g.gain);
    src.start(0);
    return (await ac.startRendering()).getChannelData(0);
  };
  const plan = adsrPlan(vals, begin, hold);
  const mine = await render((p) => plan.forEach((e) => (e.kind === 'set' ? p.setValueAtTime(e.v, e.t) : p.linearRampToValueAtTime(e.v, e.t))));
  const theirs = await render((p) => window.getParamADSR(p, vals[0], vals[1], vals[2], vals[3], 0, 1, begin, begin + hold, 'linear'));
  let vsDrawn = 0;
  let vsEngine = 0;
  for (let i = 0; i < len; i++) {
    vsDrawn = Math.max(vsDrawn, Math.abs(mine[i] - planValue(plan, i / SR)));
    vsEngine = Math.max(vsEngine, Math.abs(mine[i] - theirs[i]));
  }
  return { vsDrawn, vsEngine };
}

// Note tenue puis lâchée (et éventuellement réglée pendant qu'on la tient) : la trace
// dessinée (voice.valueAt) contre le volume rendu, et contre superdough pour la même durée.
export async function heldVsEngine(vals, releaseAt, retune) {
  const len = Math.round((releaseAt + 3.4) * SR);
  const ac = new OfflineAudioContext(1, len, SR);
  const v = heldVoice(ac, ac.destination, vals, 'one');
  if (retune) ac.suspend(retune.t).then(() => {
    v.retune(retune.vals);
    ac.resume();
  });
  ac.suspend(releaseAt).then(() => {
    v.release();
    ac.resume();
  });
  const out = (await ac.startRendering()).getChannelData(0);
  const k = 0.3 * 0.8; // gain 0,3 de l'onde × gain 0,8 par défaut
  let vsTrace = 0;
  for (let i = 0; i < len; i++) vsTrace = Math.max(vsTrace, Math.abs(out[i] / k - v.valueAt(i / SR)));
  let vsEngine = null;
  if (!retune) {
    const ac2 = new OfflineAudioContext(1, len, SR);
    const src = new ConstantSourceNode(ac2, { offset: 1 });
    const g = ac2.createGain();
    g.gain.value = 0;
    src.connect(g).connect(ac2.destination);
    window.getParamADSR(g.gain, vals[0], vals[1], vals[2], vals[3], 0, 1, v.begin, v.releaseAt, 'linear');
    src.start(0);
    const ref = (await ac2.startRendering()).getChannelData(0);
    vsEngine = 0;
    for (let i = 0; i < len; i++) vsEngine = Math.max(vsEngine, Math.abs(out[i] / k - ref[i]));
  }
  return { vsTrace, vsEngine, releasedAt: v.releaseAt };
}

// Une onde de période entière (P échantillons), mesurée sur 60 périodes exactes.
async function measureWave(wave, P = 675) {
  const ac = new OfflineAudioContext(1, P * 80, SR);
  const o = ac.createOscillator();
  o.type = wave;
  o.frequency.value = SR / P;
  o.connect(ac.destination);
  o.start();
  const x = (await ac.startRendering()).getChannelData(0);
  const amp = (h) => {
    let c = 0;
    let s2 = 0;
    const N = P * 60;
    for (let i = 0; i < N; i++) {
      const a = (2 * Math.PI * h * i) / P;
      c += x[P * 10 + i] * Math.cos(a);
      s2 += x[P * 10 + i] * Math.sin(a);
    }
    return (2 * Math.hypot(c, s2)) / N;
  };
  const a1 = amp(1);
  const levels = Array.from({ length: 16 }, (_, i) => amp(i + 1) / a1);
  const onePeriod = Array.from(x.slice(P * 20, P * 21));
  return { levels, onePeriod };
}
// Le dessin de l'onde (forme et barres) contre l'oscillateur réel.
export async function waveDrawingVsOscillator(wave) {
  const P = 675;
  const m = await measureWave(wave, P);
  const drawnLevels = harmonics(wave, 16);
  const barsDiff = Math.max(...drawnLevels.map((l, i) => Math.abs(l - m.levels[i])));
  // Nombre d'harmoniques sous la moitié de la fréquence d'échantillonnage, comme l'oscillateur.
  const drawn = period(wave, P, Math.floor(P / 2) - 1);
  // Le niveau absolu des ondes intégrées dépend du navigateur (Chrome : carré et dent de
  // scie ×0,848, triangle ×1) : on compare la FORME, à un facteur d'échelle près.
  let num = 0;
  let den = 0;
  for (let i = 0; i < P; i++) {
    num += drawn[i] * m.onePeriod[i];
    den += drawn[i] * drawn[i];
  }
  const scale = num / den;
  const diffs = drawn.map((v, i) => Math.abs(v * scale - m.onePeriod[i]));
  const rms = Math.sqrt(diffs.reduce((a, d) => a + d * d, 0) / diffs.length);
  // Loin des sauts verticaux (carré, dent de scie), où une poignée d'échantillons diffèrent
  // selon le nombre d'harmoniques que l'oscillateur garde : on les met à part.
  const jumps = [];
  for (let i = 0; i < P; i++) if (Math.abs(drawn[(i + 1) % P] - drawn[i]) > 0.3) jumps.push(i);
  const near = (i) => jumps.some((j) => Math.min(Math.abs(i - j), P - Math.abs(i - j)) <= Math.round(P * 0.02));
  const shapeDiff = Math.max(...diffs.filter((_, i) => !near(i)));
  const jumpDiff = Math.max(0, ...diffs.filter((_, i) => near(i)));
  return { barsDiff, shapeDiff, rms, jumpDiff, jumps: jumps.length, scale };
}

// Enveloppe de filtre : la courbe dessinée (envPlan, exponentielle) contre getParamADSR
// du moteur en mode exponentiel, rendu hors temps réel (valeurs en hertz).
export async function filterEnvVsEngine(vals, hold, f, env) {
  const { min, max } = filterEnvRange(f, env, 0);
  const len = Math.round((hold + vals[3] + 0.2) * SR);
  const begin = 0.01;
  const render = async (apply) => {
    const ac = new OfflineAudioContext(1, len, SR);
    const src = new ConstantSourceNode(ac, { offset: 1 });
    const g = ac.createGain();
    g.gain.value = 0;
    src.connect(g).connect(ac.destination);
    apply(g.gain);
    src.start(0);
    return (await ac.startRendering()).getChannelData(0);
  };
  const plan = envPlan(vals, begin, hold, { min, max, curve: 'exponential' });
  const mine = await render((p) => plan.forEach((e) => (e.kind === 'set' ? p.setValueAtTime(e.v, e.t) : e.kind === 'exp' ? p.exponentialRampToValueAtTime(e.v, e.t) : p.linearRampToValueAtTime(e.v, e.t))));
  const theirs = await render((p) => window.getParamADSR(p, vals[0], vals[1], vals[2], vals[3], min, max, begin, begin + hold, 'exponential'));
  let vsDrawn = 0;
  let vsEngine = 0;
  for (let i = Math.round(begin * SR); i < len; i++) {
    const ref = Math.max(theirs[i], 1);
    vsDrawn = Math.max(vsDrawn, Math.abs(mine[i] - planValue(plan, i / SR)) / ref);
    vsEngine = Math.max(vsEngine, Math.abs(mine[i] - theirs[i]) / ref);
  }
  return { vsDrawn, vsEngine, min, max };
}

/* --- Rythme : cycle et tempo -------------------------------------------------------- */
const evSig = (list) => list.map((x) => x.b.toFixed(5) + '-' + x.e.toFixed(5) + '-' + x.s).sort().join(' ');
// Les événements dessinés (et joués) = ceux de la ligne de code sound("…") évaluée par Strudel.
export async function cycleVsCode(motif) {
  const mine = motifEvents(motif, 0, 4);
  if (!mine.ok) return { ok: false, why: 'illisible : ' + mine.error };
  const pat = await evalPattern('sound("' + motif + '")');
  const theirs = pat.queryArc(0, 4).filter((h) => h.hasOnset()).map((h) => ({ b: Number(h.whole.begin.valueOf()), e: Number(h.whole.end.valueOf()), s: String(h.value.s) }));
  return { ok: evSig(mine.ev) === evSig(theirs), n: mine.ev.length };
}
// Tempo : le tempo que Strudel règle en évaluant la ligne de code, et les sons par cycle.
export async function tempoVsCode(spec) {
  const def = TYPES.tempo;
  const st = stateFromSpec(spec);
  const code = codeText(def, st);
  const ed = window.__ed;
  ed.setCode(code);
  await ed.repl.evaluate(code, false);
  const cps = ed.repl.scheduler.cps;
  const per = {};
  for (const h of ed.repl.state.pattern.queryArc(0, 1).filter((x) => x.hasOnset())) per[h.value.s] = (per[h.value.s] || 0) + 1;
  const ex = def.expect(st);
  return { ok: Math.abs(cps - ex.cps) < 1e-12 && per.bd === ex.perCycle.bd && per.hh === ex.perCycle.hh, code, cps, per };
}
// Le « scheduler » des schémas de rythme : chaque son part à l'instant début/cps, et un
// changement de tempo en route ne fait ni trou ni doublon.
export async function patternScheduling() {
  const calls = [];
  const fake = { currentTime: 10 };
  const saved = window.superdough;
  const realSetInterval = window.setInterval;
  window.superdough = (v, t, dur, cps, cyc) => calls.push({ s: v.s, t, dur, cps, cyc });
  window.setInterval = () => 0;
  let cps = 0.5;
  const pat = window.sound(window.mini('bd hh sd hh'));
  const snd = createPatternSound(fake, () => pat, () => cps);
  try {
    snd.start();
    for (let i = 0; i < 120; i++) {
      fake.currentTime += 0.04;
      if (i === 60) cps = 1; // le tempo double en route
      snd.step();
    }
  } finally {
    window.setInterval = realSetInterval;
    window.superdough = saved;
    snd.stop();
  }
  const keys = calls.map((c) => c.cyc.toFixed(5));
  const unique = new Set(keys).size === keys.length;
  const regular = calls.every((c) => Math.abs(c.cyc * 4 - Math.round(c.cyc * 4)) < 1e-9);
  let steady = true;
  for (let i = 1; i < calls.length; i++) {
    const p = calls[i - 1];
    const c = calls[i];
    if (p.cps === c.cps && Math.abs(c.t - p.t - (c.cyc - p.cyc) / c.cps) > 1e-9) steady = false;
    if (c.t <= p.t) steady = false;
  }
  const missing = [];
  for (let k = 0; k < calls.length; k++) if (Math.abs(calls[k].cyc - k * 0.25) > 1e-9) missing.push(k);
  return { ok: unique && regular && steady && !missing.length && calls.some((c) => c.cps === 1), n: calls.length, detail: `${calls.length} sons, chaque quart de cycle une seule fois, écarts réguliers à chaque tempo, tempo doublé en route sans trou ni doublon` };
}
export function cycleMission(id, motifs) {
  const def = TYPES.cycle;
  const m = def.missions.find((x) => x.id === id);
  const runner = createMissionRunner([m]);
  let done = false;
  for (const motif of motifs) {
    const r = motifEvents(motif, 0, 4);
    if (runner.update({ p: {}, o: { motif }, playing: true, ev: r.ok ? r.ev : [] }).length) done = true;
  }
  return done;
}

/* --- 5. Les faits du « Creuser » -------------------------------------------------------- */
export const FACTS = {
  async 'filtre.q-db'() {
    const ac = window.getAudioContext();
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 600;
    const out = [];
    for (const q of [0, 1, 6, 12, 15, 20, 30]) {
      f.Q.value = q;
      const mag = new Float32Array(1);
      f.getFrequencyResponse(new Float32Array([600]), mag, new Float32Array(1));
      out.push([q, 20 * Math.log10(mag[0])]);
    }
    const err = Math.max(...out.map(([q, db]) => Math.abs(q - db)));
    return { ok: err < 0.01, detail: out.map(([q, db]) => `lpq ${q} → ${db.toFixed(4)} dB`).join(' · ') };
  },
  async 'filtre.pente'() {
    const ac = window.getAudioContext();
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 1;
    const slopes = [];
    for (const fc of [300, 600, 1000]) {
      f.frequency.value = fc;
      const fr = new Float32Array([2 * fc, 4 * fc, 8 * fc]);
      const mag = new Float32Array(3);
      f.getFrequencyResponse(fr, mag, new Float32Array(3));
      const db = Array.from(mag, (m) => 20 * Math.log10(m));
      slopes.push(db[1] - db[0], db[2] - db[1]);
    }
    return { ok: slopes.every((s) => s <= -12 && s > -14.5), detail: 'pente par octave, entre 2 et 8 fois la coupure (coupures 300, 600, 1000 Hz) : ' + slopes.map((s) => s.toFixed(2) + ' dB').join(', ') };
  },
  async 'filtre.q-defaut'() {
    const a = rendered('fact:sans-lpq');
    const b = rendered('fact:lpq1');
    const c = rendered('fact:lpq0');
    const d1 = compare(a, b).maxAbs;
    const d0 = compare(a, c).maxAbs;
    const dh = compare(rendered('fact:sans-hpq'), rendered('fact:hpq1')).maxAbs;
    const db = compare(rendered('fact:sans-bpq'), rendered('fact:bpq1')).maxAbs;
    return { ok: d1 < 1e-4 && d0 > 1e-3 && dh < 1e-4 && db < 1e-4, detail: `sans lpq vs lpq(1) : écart ${d1.toExponential(1)} ; vs lpq(0) : écart ${d0.toFixed(4)} ; sans hpq vs hpq(1) : ${dh.toExponential(1)} ; sans bpq vs bpq(1) : ${db.toExponential(1)}` };
  },
  async 'filtre.hpq-db'() {
    const ac = window.getAudioContext();
    const f = ac.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 600;
    const out = [];
    for (const q of [0, 1, 6, 12, 20, 30]) {
      f.Q.value = q;
      const mag = new Float32Array(1);
      f.getFrequencyResponse(new Float32Array([600]), mag, new Float32Array(1));
      out.push([q, 20 * Math.log10(mag[0])]);
    }
    const err = Math.max(...out.map(([q, db]) => Math.abs(q - db)));
    return { ok: err < 0.01, detail: out.map(([q, db]) => `hpq ${q} → ${db.toFixed(4)} dB`).join(' · ') };
  },
  async 'filtre.bpf-centre'() {
    const ac = window.getAudioContext();
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 800;
    const N = 2000;
    const fr = new Float32Array(N);
    for (let i = 0; i < N; i++) fr[i] = 20 * Math.pow(1000, i / (N - 1));
    const rows = [];
    for (const q of [1, 3, 8, 20]) {
      f.Q.value = q;
      const mag = new Float32Array(N);
      f.getFrequencyResponse(fr, mag, new Float32Array(N));
      const c = new Float32Array(1);
      f.getFrequencyResponse(new Float32Array([800]), c, new Float32Array(1));
      const above = [...mag].map((m, i) => [fr[i], 20 * Math.log10(m)]).filter(([, d]) => d >= -3);
      const width = Math.log2(above[above.length - 1][0] / above[0][0]);
      rows.push([q, 20 * Math.log10(c[0]), width]);
    }
    const ok = rows.every((r) => Math.abs(r[1]) < 0.01) && rows.every((r, i) => !i || r[2] < rows[i - 1][2]);
    return { ok, detail: rows.map(([q, c, w]) => `bpq ${q} : centre ${c.toFixed(3)} dB, bande à −3 dB ${w.toFixed(2)} octave`).join(' · ') };
  },
  async 'filtre.scie'() {
    // Une onde de période ENTIÈRE (675 échantillons ≈ 65,3 Hz, presque un do2), mesurée
    // sur 60 périodes exactes : chaque harmonique tombe pile sur sa fréquence d'analyse.
    const P = 675;
    const ac = new OfflineAudioContext(1, P * 80, SR);
    const o = ac.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = SR / P;
    o.connect(ac.destination);
    o.start();
    const x = (await ac.startRendering()).getChannelData(0);
    const amp = (h) => {
      let c = 0;
      let s2 = 0;
      const N = P * 60;
      for (let i = 0; i < N; i++) {
        const a = (2 * Math.PI * h * i) / P;
        c += x[P * 10 + i] * Math.cos(a);
        s2 += x[P * 10 + i] * Math.sin(a);
      }
      return (2 * Math.hypot(c, s2)) / N;
    };
    const a1 = amp(1);
    const hs = [2, 3, 4, 5, 8, 12, 16, 24, 32, 48, 64, 96, 128];
    const ratios = hs.map((h) => (amp(h) * h) / a1);
    return { ok: ratios.every((r) => r > 0.95 && r < 1.05), detail: 'niveau × n / niveau de la 1re harmonique, pour n = ' + hs.join(', ') + ' : ' + ratios.map((r) => r.toFixed(3)).join(' ') };
  },
  async 'filtre.raccourci'() {
    const pat = await evalPattern('note("c2").sound("sawtooth").lpf("800:12")');
    const v = pat.queryArc(0, 1)[0].value;
    return { ok: v.cutoff === 800 && v.resonance === 12, detail: JSON.stringify(v) };
  },
  async 'filtre.24db'() {
    const at = (x) => {
      const s = spectrum(x, Math.round(SR * 0.05), 8192);
      const bin = (f) => Math.round((f * 8192) / SR);
      const f0 = 65.406;
      const lvl = (h) => Math.max(...[-2, -1, 0, 1, 2].map((k) => s[bin(h * f0) + k]));
      return lvl(1) - lvl(32); // la 32e harmonique ≈ 2 093 Hz, bien au-dessus de 500 Hz
    };
    const x12 = rendered('fact:12db');
    const x24 = rendered('fact:24db');
    const raw = 20 * Math.log10(32); // la 32e harmonique est déjà 32 fois plus faible dans l'onde
    const a12 = at(x12) - raw;
    const a24 = at(x24) - raw;
    const ratio = a24 / a12;
    return { ok: ratio > 1.8 && ratio < 2.2, detail: `atténuation à ~2,1 kHz : 12db → ${a12.toFixed(1)} dB, 24db → ${a24.toFixed(1)} dB (rapport ${ratio.toFixed(2)})` };
  },
  async 'onde.sinus'() {
    const m = await measureWave('sine');
    const rest = Math.max(...m.levels.slice(1));
    return { ok: rest < 0.001, detail: `harmoniques 2 à 16 : au plus ${rest.toExponential(1)} de la première` };
  },
  async 'onde.carre'() {
    const m = await measureWave('square');
    const even = Math.max(...m.levels.filter((_, i) => (i + 1) % 2 === 0));
    const odd = m.levels.map((l, i) => [i + 1, l]).filter(([n]) => n % 2).map(([n, l]) => l * n);
    return { ok: even < 0.002 && odd.every((r) => Math.abs(r - 1) < 0.02), detail: `paires : au plus ${even.toExponential(1)} ; impaires, niveau × n : ${odd.map((r) => r.toFixed(3)).join(' ')}` };
  },
  async 'onde.triangle'() {
    const m = await measureWave('triangle');
    const even = Math.max(...m.levels.filter((_, i) => (i + 1) % 2 === 0));
    const odd = m.levels.map((l, i) => [i + 1, l]).filter(([n]) => n % 2).map(([n, l]) => l * n * n);
    return { ok: even < 0.002 && odd.every((r) => Math.abs(r - 1) < 0.03), detail: `paires : au plus ${even.toExponential(1)} ; impaires, niveau × n² : ${odd.map((r) => r.toFixed(3)).join(' ')}` };
  },
  async 'onde.scie'() {
    const m = await measureWave('sawtooth');
    const r = m.levels.map((l, i) => l * (i + 1));
    return { ok: r.every((x) => Math.abs(x - 1) < 0.02), detail: 'niveau × n, n = 1 à 16 : ' + r.map((x) => x.toFixed(3)).join(' ') };
  },
  async 'fenv.octaves'() {
    const rows = [];
    for (const env of [1, 2, 4, -2]) {
      const { min, max } = filterEnvRange(400, env, 0);
      rows.push([env, min, max]);
    }
    // Et le moteur, sur la vraie coupure : getParamADSR exponentiel entre ces bornes.
    const r = await filterEnvVsEngine([0.05, 0.1, 0, 0.1], 0.5, 400, 4);
    const ok = rows[0][2] === 800 && rows[1][2] === 1600 && rows[2][2] === 6400 && rows[3][1] === 1600 && rows[3][2] === 400 && r.vsEngine < 1e-4;
    return { ok, detail: rows.map(([e, a, b]) => `lpf 400, lpenv ${e} : de ${a} à ${b} Hz`).join(' · ') + ` ; courbe = getParamADSR (écart relatif ${r.vsEngine.toExponential(1)})` };
  },
  async 'fenv.defauts'() {
    const v = window.getADSRValues([undefined, undefined, undefined, undefined], 'exponential', [0.005, 0.14, 0, 0.1]);
    // note("c2*4") : 4 notes de 0,5 s ; le schéma rend les mêmes notes avec ses fonctions.
    const ac = new OfflineAudioContext(2, Math.round(1.2 * SR), SR);
    const st = stateFromSpec({ type: 'enveloppe-filtre', reglages: { lpf: 300, lpenv: 3 } });
    for (let i = 0; i * 0.5 < 1.2; i++) fenvNote(ac, ac.destination, 36, i * 0.5, 0.5, st, TYPES['enveloppe-filtre']);
    const mine = Array.from((await ac.startRendering()).getChannelData(0));
    const zones = [0.5, 1].map((e) => [e + 0.01, e + 0.09]);
    const c = compare(rendered('fact:fenv-defauts'), mine, zones);
    return { ok: v.join() === FILTER_ENV_DEFAULTS.join() && c.maxAbs < 1e-4, detail: `getADSRValues sans réglage → [${v.join(', ')}] ; rendu superdough de lpf(300).lpenv(3) = schéma avec ces valeurs (écart ${c.maxAbs.toExponential(1)})` };
  },
  async 'fenv.exponentielle'() {
    const r = await filterEnvVsEngine([0.4, 0.1, 0.5, 0.2], 1, 200, 5);
    // À mi-attaque, une rampe exponentielle de 200 à 6 400 Hz passe par la moyenne géométrique (1 131 Hz).
    const plan = envPlan([0.4, 0.1, 0.5, 0.2], 0, 1, { min: 200, max: 6400, curve: 'exponential' });
    const mid = planValue(plan, 0.2);
    return { ok: Math.abs(mid - Math.sqrt(200 * 6400)) < 1 && r.vsEngine < 1e-4, detail: `mi-attaque : ${mid.toFixed(1)} Hz (moyenne géométrique ${Math.sqrt(200 * 6400).toFixed(1)}) ; écart relatif avec getParamADSR ${r.vsEngine.toExponential(1)}` };
  },
  async 'fenv.un-seul'() {
    const d = compare(rendered('fact:lpa-seul'), rendered('fact:lpa-env1')).maxAbs;
    return { ok: d < 1e-4, detail: `lpf(300).lpa(.1) vs lpf(300).lpa(.1).lpenv(1) : écart ${d.toExponential(1)}` };
  },
  async 'cycle.duree'() {
    const src = await (await fetch('/src/lib/engine.js')).text();
    const rule = /if \(!\/\\bsetcp\[ms\]\\s\*\\\(\/\.test\(code\)\) ed\.repl\.setCps\(0\.5\)/.test(src);
    const ev = motifEvents('bd hh sd hh cp', 0, 1).ev;
    const last = ev[ev.length - 1];
    return { ok: rule && Math.abs(last.e / 0.5 - 2) < 1e-9, detail: `règle de l’app (src/lib/engine.js : sans setcpm/setcps → setCps(0.5)) ${rule ? 'présente' : 'ABSENTE'} ; 5 sons : le dernier finit à ${last.e} cycle = ${last.e / 0.5} s` };
  },
  async 'cycle.partage'() {
    const d4 = [...new Set(motifEvents('bd hh sd hh', 0, 1).ev.map((x) => +(x.e - x.b).toFixed(6)))];
    const d5 = [...new Set(motifEvents('bd hh sd hh cp', 0, 1).ev.map((x) => +(x.e - x.b).toFixed(6)))];
    return { ok: d4.length === 1 && d4[0] === 0.25 && d5.length === 1 && d5[0] === 0.2, detail: `4 sons : durées ${d4.join(', ')} cycle ; 5 sons : ${d5.join(', ')}` };
  },
  async 'cycle.crochets'() {
    const ev = motifEvents('bd [hh hh] sd hh', 0, 1).ev;
    const grp = ev.filter((x) => x.s === 'hh' && x.b < 0.5).map((x) => [x.b, +(x.e - x.b).toFixed(6)]);
    return { ok: grp.length === 2 && grp.every((g) => g[1] === 0.125), detail: 'hh du groupe : ' + grp.map(([b, d]) => `à ${b}, durée ${d}`).join(' ; ') };
  },
  async 'cycle.chevrons'() {
    const ev = motifEvents('bd hh sd <hh oh>', 0, 4).ev;
    const last = [0, 1, 2, 3].map((c) => ev.filter((x) => x.c === c).sort((a, b) => a.b - b.b).pop().s);
    return { ok: last.join() === 'hh,oh,hh,oh', detail: 'dernier son des cycles 1 à 4 : ' + last.join(', ') };
  },
  async 'cycle.virgule'() {
    const ev = motifEvents('bd*4, hh*8', 0, 1).ev;
    const n = (s) => ev.filter((x) => x.s === s).length;
    return { ok: n('bd') === 4 && n('hh') === 8, detail: `cycle 1 : ${n('bd')} bd et ${n('hh')} hh` };
  },
  async 'cycle.silence'() {
    const a = motifEvents('bd ~ sd ~', 0, 1).ev.map((x) => x.s + '@' + x.b);
    const b = motifEvents('bd hh sd hh', 0, 1).ev.filter((x) => x.s !== 'hh').map((x) => x.s + '@' + x.b);
    return { ok: a.join() === b.join() && a.length === 2, detail: `bd ~ sd ~ → ${a.join(', ')} ; bd hh sd hh sans les hh → ${b.join(', ')}` };
  },
  async 'tempo.cpm'() {
    const r = await tempoVsCode({ type: 'tempo', reglages: { bpm: 120 }, temps: 4 });
    const ed = window.__ed;
    await ed.repl.evaluate('setcpm(30)\nsound("bd")', false);
    const cps = ed.repl.scheduler.cps;
    return { ok: Math.abs(cps - 0.5) < 1e-12 && r.ok, detail: `setcpm(30) → ${cps} cycle par seconde → un cycle toutes les ${1 / cps} s` };
  },
  async 'tempo.bpm'() {
    const ed = window.__ed;
    await ed.repl.evaluate('setcpm(120/4)\nsound("bd*4")', false);
    const cps = ed.repl.scheduler.cps;
    const n = ed.repl.state.pattern.queryArc(0, 1).filter((h) => h.hasOnset()).length;
    const perMin = n * cps * 60;
    return { ok: Math.abs(perMin - 120) < 1e-9, detail: `setcpm(120/4) : ${cps} cycle/s × ${n} sons par cycle × 60 = ${perMin} par minute` };
  },
  async 'tempo.defaut'() {
    const src = await (await fetch('/src/lib/engine.js')).text();
    const ed = window.__ed;
    await ed.repl.evaluate('setcpm(90)\nsound("bd")', false);
    // Le moteur seul (sans la règle de l'app) : le tempo d'avant reste.
    await ed.repl.evaluate('sound("bd")', false);
    const kept = ed.repl.scheduler.cps;
    const rule = src.includes('ed.repl.setCps(0.5)');
    return { ok: rule && Math.abs(kept - 1.5) < 1e-12, detail: `moteur seul : après setcpm(90) puis un code sans setcpm, cps = ${kept} (le tempo reste) ; règle de l’app qui remet 0,5 : ${rule ? 'présente dans src/lib/engine.js' : 'ABSENTE'}` };
  },
  async 'adsr.defauts'() {
    const r = await soundVsStrudel({ type: 'adsr', reglages: {}, mode: 'motif' });
    const v = window.getADSRValues([undefined, undefined, undefined, undefined], 'linear', [0.001, 0.05, 0.6, 0.01]);
    return { ok: r.maxAbs < 1e-4, detail: `rendu superdough de ${r.code} = rendu du schéma avec [${SYNTH_DEFAULTS.join(', ')}] (écart max ${r.maxAbs.toExponential(1)}) ; getADSRValues sans réglage → [${v.join(', ')}]` };
  },
  async 'adsr.un-seul'() {
    const U = undefined;
    const sample = [0.3, 0.2, 0.5, 0.7];
    let bad = 0;
    const lines = [];
    for (let mask = 0; mask < 16; mask++) {
      const arr = sample.map((x, i) => (mask & (1 << i) ? x : U));
      const theirs = window.getADSRValues(arr, 'linear', [0.001, 0.05, 0.6, 0.01]);
      const mine = adsrValues({ attack: arr[0], decay: arr[1], sustain: arr[2], release: arr[3] });
      if (theirs.some((x, i) => Math.abs(x - mine[i]) > 1e-12)) bad++;
      if (mask === 1 || mask === 2) lines.push(`[${arr.map((x) => (x == null ? '—' : x)).join(', ')}] → [${theirs.join(', ')}]`);
    }
    return { ok: bad === 0, detail: `16 combinaisons, ${bad} différence(s) avec getADSRValues ; ex. ${lines.join(' ; ')}` };
  },
  async 'adsr.lineaire'() {
    const r = await envelopeVsEngine([0.4, 0.4, 0.5, 0.4], 1);
    const ac = new OfflineAudioContext(1, SR, SR);
    const src = new ConstantSourceNode(ac, { offset: 1 });
    const g = ac.createGain();
    src.connect(g).connect(ac.destination);
    window.getParamADSR(g.gain, 0.4, 0.4, 0.5, 0.4, 0, 1, 0, 1, 'linear');
    src.start();
    const x = (await ac.startRendering()).getChannelData(0);
    const mid = x[Math.round(0.2 * SR)];
    return { ok: Math.abs(mid - 0.5) < 2e-3 && r.vsEngine < 1e-4, detail: `à mi-attaque (0,2 s sur 0,4 s), le volume vaut ${mid.toFixed(4)}` };
  },
  async 'adsr.troncature'() {
    const vals = [0.5, 0.2, 0.6, 0.3];
    const hold = 0.2;
    const r = await envelopeVsEngine(vals, hold);
    const plan = adsrPlan(vals, 0, hold);
    const peak = Math.max(...plan.map((e) => e.v));
    return { ok: Math.abs(peak - hold / vals[0]) < 1e-9 && r.vsEngine < 1e-4, detail: `attaque 0,5 s, note de 0,2 s : sommet à ${peak.toFixed(3)} (au lieu de 1), puis extinction depuis ce niveau ; écart avec getParamADSR ${r.vsEngine.toExponential(1)}` };
  },
  async 'adsr.raccourci'() {
    const pat = await evalPattern('note("c3").sound("sawtooth").adsr(".01:.2:.5:.3")');
    const v = pat.queryArc(0, 1)[0].value;
    return { ok: v.attack === 0.01 && v.decay === 0.2 && v.sustain === 0.5 && v.release === 0.3, detail: JSON.stringify(v) };
  },
};

/* --- 3. La ligne de code s'exécute et produit les valeurs attendues ------------------------ */
export async function codeProduces(spec, st) {
  const def = TYPES[spec.type];
  const state = st || stateFromSpec(spec);
  const code = codeText(def, state);
  const expect = def.expect(state);
  let pat;
  try {
    pat = await evalPattern(code);
  } catch (e) {
    return { ok: false, code, why: 'erreur : ' + e.message };
  }
  const haps = pat.queryArc(0, 1).filter((h) => h.hasOnset()).sort((a, b) => a.whole.begin.valueOf() - b.whole.begin.valueOf());
  const notes = haps.map((h) => window.noteToMidi(String(h.value.note)));
  const why = [];
  if (JSON.stringify(notes) !== JSON.stringify(expect.notes)) why.push('notes ' + JSON.stringify(notes));
  for (const [k, v] of Object.entries(expect)) {
    if (k === 'notes') continue;
    for (const h of haps) {
      if (v === undefined ? k in h.value : h.value[k] !== v) {
        why.push(`${k} = ${h.value[k]} (attendu ${v})`);
        break;
      }
    }
  }
  return { ok: !why.length, code, why: why.join(', ') };
}

export { stateFromSpec, TYPES };
