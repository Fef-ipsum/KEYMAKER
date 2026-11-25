// Clavier : le motif joué est construit À PARTIR DE LA LIGNE DE CODE (note(…)/n(…).scale(…)),
// avec les fonctions du moteur Strudel. Le banc vérifie qu'il est identique à la ligne de
// code évaluée par l'éditeur.
const CODE_RE = /^(note|n)\("([^"]*)"\)(?:\.scale\("([^"]*)"\))?\.sound\("([a-z0-9_]+)"\)$/;

export function patternFromCode(code) {
  const m = CODE_RE.exec(code);
  if (!m) throw new Error('code inattendu : ' + code);
  let pat = window[m[1]](window.mini(m[2]));
  if (m[3]) pat = pat.scale(window.mini(m[3]));
  return pat.s(window.mini(m[4]));
}

// Notes (MIDI) jouées dans le premier cycle, dans l'ordre.
export function notesOf(pat, from = 0, to = 1) {
  return pat
    .queryArc(from, to)
    .filter((h) => h.hasOnset())
    .sort((a, b) => a.whole.begin.valueOf() - b.whole.begin.valueOf())
    .map((h) => {
      const v = h.value.note;
      return { b: Number(h.whole.begin.valueOf()), midi: typeof v === 'number' ? v : window.noteToMidi(String(v)) };
    });
}

// Une touche tout de suite, par le piano de Strudel.
export function playKey(ac, midi) {
  try {
    window.superdough({ note: midi, s: 'piano' }, ac.currentTime + 0.03, 0.6, 0.5, 0);
  } catch {
    /* son indisponible */
  }
}
