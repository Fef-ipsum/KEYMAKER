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

// Instant (en secondes) de chaque événement, au tempo cps, depuis le début du cycle 0.
export const onsetSeconds = (ev, cps) => ev.map((x) => x.b / cps);

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
  return {
    start() {
      cps = getCps();
      anchorT = ac.currentTime + 0.12; // un peu d'avance : les sons se chargent
      anchorC = 0;
      next = 0;
      tick();
      timer = setInterval(tick, 40);
    },
    stop() {
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
