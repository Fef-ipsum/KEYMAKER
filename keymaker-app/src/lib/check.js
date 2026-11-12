// Keymaker 2 — validation LOCALE des exercices (aucune IA).
//
// Un exercice décrit ce que le code doit PRODUIRE. Après « Jouer », on construit
// un contexte à partir des événements réels du moteur et on appelle la fonction
// `check(c)` de l'étape. Elle renvoie :
//   true                → réussi
//   une chaîne          → pas encore, et voici un indice
//   false / undefined   → pas encore (indice générique)
//
// Les fonctions de ce fichier sont pures (le contexte reçoit les événements en
// paramètre) → testables hors navigateur.

const norm = (s) => String(s || '').replace(/\s+/g, '');

export function buildContext({ code, startCode, haps, haps4, cps }) {
  const h = haps || [];
  const h4 = haps4 || h;
  return {
    code: code || '',
    start: startCode || '',
    haps: h, // événements du 1er cycle
    haps4: h4, // événements des 4 premiers cycles (pour < > et les variations)
    cps: cps || 0.5,
    cpm: (cps || 0.5) * 60,
    // Le code a-t-il été modifié par rapport au code de départ ?
    changed: norm(code) !== norm(startCode),
    // Le texte du code contient-il ceci ? (chaîne ou expression régulière)
    has(x) {
      return x instanceof RegExp ? x.test(code || '') : (code || '').includes(x);
    },
    // Nombre d'événements du 1er cycle (optionnellement pour un son donné).
    count(s) {
      return s ? h.filter((e) => e.s === s).length : h.length;
    },
    count4(s) {
      return s ? h4.filter((e) => e.s === s).length : h4.length;
    },
    // Noms de sons joués (1er cycle / 4 cycles), sans doublon.
    sounds() {
      return [...new Set(h.map((e) => e.s).filter(Boolean))];
    },
    sounds4() {
      return [...new Set(h4.map((e) => e.s).filter(Boolean))];
    },
    // Hauteurs MIDI jouées, dans l'ordre (1er cycle / 4 cycles).
    notes() {
      return h.filter((e) => e.note != null).map((e) => e.note);
    },
    notes4() {
      return h4.filter((e) => e.note != null).map((e) => e.note);
    },
    // Groupes de notes jouées EN MÊME TEMPS, triées du grave à l'aigu.
    chords(src = h) {
      const by = new Map();
      for (const e of src) {
        if (e.note == null) continue;
        const k = e.begin.toFixed(4);
        if (!by.has(k)) by.set(k, []);
        by.get(k).push(e.note);
      }
      return [...by.values()].map((a) => [...new Set(a)].sort((x, y) => x - y));
    },
    // Valeurs d'un contrôle sur les événements (ex. val('cutoff')).
    val(key, src = h) {
      return src.map((e) => e.value[key]).filter((v) => v != null);
    },
    // Débuts d'événements (0..1) pour un son donné, 1er cycle.
    onsets(s) {
      return h.filter((e) => !s || e.s === s).map((e) => Math.round(e.begin * 1000) / 1000);
    },
  };
}

export function runCheck(check, ctx) {
  if (typeof check !== 'function') return { ok: true, hint: '' };
  let r;
  try {
    r = check(ctx);
  } catch {
    r = false;
  }
  if (r === true) return { ok: true, hint: '' };
  return { ok: false, hint: typeof r === 'string' ? r : '' };
}

// Aides d'écriture pour les contenus.
export const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
export const pc = (midi) => ((midi % 12) + 12) % 12; // classe de hauteur (0 = do)
export const uniq = (a) => [...new Set(a)];
