// Schémas vivants — motifs de mini-notation (navigateur).
//
// motifEvents : les événements RÉELS d'un motif, construits par le moteur Strudel
// (sound(mini(motif))) — exactement ceux de la ligne de code sound("…"), vérifié par
// le banc de test. Le dessin et le son en partent tous les deux.
// createPatternSound : joue ces événements par superdough, le moteur audio de Strudel
// lui-même, au tempo demandé (comme le fait le « scheduler » de Strudel).

export function motifPattern(motif) {
  return window.sound(window.mini(motif));
}

// Événements de [from, to) cycles : { b, e, s, c (cycle), loc ([début, fin] dans le texte) }.
export function patternEvents(pat, from = 0, to = 4) {
  return pat
    .queryArc(from, to)
    .filter((h) => h.hasOnset())
    .map((h) => {
      const b = Number(h.whole.begin.valueOf());
      const loc = h.context && h.context.locations && h.context.locations[0];
      return { b, e: Number(h.whole.end.valueOf()), s: h.value && h.value.s != null ? String(h.value.s) : '?', c: Math.floor(b + 1e-9), loc: loc ? [loc.start - 1, loc.end - 1] : null, value: h.value };
    })
    .sort((x, y) => x.b - y.b || x.s.localeCompare(y.s));
}

export function motifEvents(motif, from = 0, to = 4) {
  try {
    return { ok: true, ev: patternEvents(motifPattern(motif), from, to), error: '' };
  } catch (e) {
    return { ok: false, ev: [], error: String((e && e.message) || e).replace(/^\[mini\]\s*/, '') };
  }
}

// Motif obtenu en rendant muet le bloc touché `e` (parmi les événements `ev` du motif),
// ou null si on ne sait pas le faire sans toucher aux autres blocs.
// Le texte `hh` de `hh*8?` ou de `hh!4` produit PLUSIEURS blocs : on ne peut pas le
// remplacer par `~` (tous les blocs disparaîtraient). On déroule alors la répétition
// (`hh*8?` → `[hh? hh? ~ hh? …]`, `hh!4` → `hh ~ hh hh`) pour ne taire que celui-là.
export function silenceMotif(motif, e, ev, max = 120) {
  if (!e || !e.loc) return null;
  const [a, b] = e.loc;
  if (a < 0 || b > motif.length || !/^[A-Za-z0-9_:.]+$/.test(motif.slice(a, b))) return null;
  const word = motif.slice(a, b);
  const rest = motif.slice(b);
  const same = ev.filter((x) => x.c === e.c && x.loc && x.loc[0] === a && x.loc[1] === b);
  const m = /^(?:\*(\d+)(\?[\d.]*)?|!(\d+))/.exec(rest);
  let out = null;
  if (m) {
    // Ce qui suit doit être la fin du pas : sinon (`hh*8@2`, `hh*8:3`…) on ne devine pas.
    if (!/^(?:$|[\s\]>,|)])/.test(rest.slice(m[0].length))) return null;
    const n = Number(m[1] || m[3]);
    if (!(n >= 1 && n <= 64)) return null;
    let k = -1;
    if (m[1]) {
      // `*n` : n parts égales de la place du pas ; la part touchée se lit sur sa durée.
      const d = e.e - e.b;
      const len = d * n;
      const r = (e.b - Math.floor(e.b / len + 1e-9) * len) / d;
      if (d > 0 && Math.abs(r - Math.round(r)) < 1e-6 && Math.round(r) < n) k = Math.round(r);
    } else if (same.length === n) {
      k = same.indexOf(e);
    }
    if (k < 0) return null;
    const items = Array.from({ length: n }, (_, i) => (i === k ? '~' : word + (m[2] || '')));
    out = motif.slice(0, a) + (m[1] ? '[' + items.join(' ') + ']' : items.join(' ')) + rest.slice(m[0].length);
  } else {
    if (same.length > 1) return null; // répétition qu'on ne sait pas dérouler (`hh(3,8)`…)
    out = motif.slice(0, a) + '~' + rest;
  }
  return out.length <= max ? out : null;
}

// Instant (en secondes) de chaque événement, au tempo cps, depuis le début du cycle 0.
export const onsetSeconds = (ev, cps) => ev.map((x) => x.b / cps);

// Charge une fois par contexte les AudioWorklets de superdough (window.loadWorklets du moteur).
const workletLoads = new WeakMap();
export function workletsReady(ac) {
  if (!workletLoads.has(ac)) {
    const load = typeof window.loadWorklets === 'function' ? Promise.resolve().then(() => window.loadWorklets()) : Promise.resolve();
    // Déjà chargés par le moteur : le second chargement peut être refusé (processeurs déjà
    // enregistrés) ; ce n'est pas une erreur pour nous.
    workletLoads.set(ac, load.catch(() => {}));
  }
  return workletLoads.get(ac);
}

// Joue un motif par superdough. getPattern() et getCps() sont relus à chaque pas :
// changer le motif ou le tempo s'entend au pas suivant.
export function createPatternSound(ac, getPattern, getCps) {
  let timer = 0;
  let anchorC = 0;
  let anchorT = 0;
  let cps = getCps();
  let next = 0; // prochain cycle (position) à programmer
  const pos = (t) => anchorC + (t - anchorT) * cps;
  const tick = () => {
    const c2 = getCps();
    if (c2 !== cps) {
      // Nouveau tempo : on repart de la position actuelle, sans saut.
      anchorC = pos(ac.currentTime);
      anchorT = ac.currentTime;
      cps = c2;
      next = Math.max(next, anchorC);
    }
    const horizon = pos(ac.currentTime + 0.15);
    if (horizon <= next) return;
    let haps = [];
    try {
      haps = getPattern().queryArc(next, horizon).filter((h) => h.hasOnset());
    } catch {
      haps = [];
    }
    for (const h of haps) {
      const b = Number(h.whole.begin.valueOf());
      const t = anchorT + (b - anchorC) / cps;
      if (t < ac.currentTime) continue;
      try {
        window.superdough({ ...h.value }, t, Number(h.duration.valueOf()) / cps, cps, b);
      } catch {
        /* son indisponible : on continue */
      }
    }
    next = horizon;
  };
  let wanted = false;
  const begin = () => {
    if (!wanted || timer) return;
    cps = getCps();
    anchorT = ac.currentTime + 0.12; // un peu d'avance : les sons se chargent
    anchorC = 0;
    next = 0;
    tick();
    timer = setInterval(tick, 40);
  };
  return {
    start() {
      wanted = true;
      // Certains sons de superdough (distorsion…) sont des AudioWorklets : leurs modules
      // doivent être chargés dans le contexte avant le premier son, sinon superdough
      // échoue (« AudioWorklet does not have a valid AudioWorkletGlobalScope »), ce qui
      // arrive quand un schéma est la toute première chose qu'on fait jouer.
      // Renvoie la promesse du démarrage (le banc de test l'attend).
      return workletsReady(ac).then(begin, begin);
    },
    stop() {
      wanted = false;
      clearInterval(timer);
      timer = 0;
    },
    // Position dans le temps du motif (en cycles), pour la tête de lecture.
    position() {
      return timer ? pos(ac.currentTime) : null;
    },
    step: tick, // un pas du métronome (banc de test)
    update() {},
    bypass() {},
    dispose() {
      this.stop();
    },
  };
}

/* --- Signaux (schéma « signal ») --------------------------------------------------- */
// Construits avec les fonctions du moteur, comme la ligne de code (vérifié par le banc).
export function signalPattern(st) {
  return window[st.o.forme].range(st.p.lo, st.p.hi).slow(st.p.slow);
}
export function fullSignalPattern(st) {
  return window.note(window.mini('c2*8')).s(window.mini('sawtooth')).lpf(signalPattern(st));
}
// Valeur du signal à l'instant t (en cycles).
export const signalAt = (sig, t) => {
  const h = sig.queryArc(t, t + 1e-6)[0];
  return h ? Number(h.value) : null;
};


/* --- Effets (schéma « effet ») --------------------------------------------------- */
// Mêmes appels que la ligne de code (vérifié par le banc). bypass : sans l'effet.
export function effetPattern(st, bypass = false) {
  const p = st.p;
  if (st.o.effet === 'sidechain') {
    // stack(nappe sur l'orbite 2, kick qui la fait plonger) — la nappe d'abord : l'orbite
    // visée doit exister quand le premier coup demande de la baisser.
    const pad = window.note(window.mini('[c2,c3]')).s(window.mini('sawtooth')).lpf(900).orbit(2);
    const kick = window.s(window.mini('bd*4'));
    return window.stack(pad, bypass ? kick : kick.duck(2).duckdepth(p.duckdepth).duckattack(p.duckattack));
  }
  if (st.o.effet === 'distort') {
    const base = window.note(window.mini('c3')).s(window.mini('sine'));
    return bypass ? base : base.distort(p.distort);
  }
  const base = window.note(window.mini('c4 ~ ~ ~')).s(window.mini('triangle')).decay(0.1).sustain(0);
  if (bypass) return base;
  if (st.o.effet === 'echo') return base.delay(p.delay).delaytime(p.delaytime).delayfeedback(p.delayfeedback);
  return base.room(p.room).size(p.size);
}
