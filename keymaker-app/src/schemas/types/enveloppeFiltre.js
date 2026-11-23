// Schéma « enveloppe de filtre » : la coupure qui s'ouvre et se referme pendant la note.
//
// Superdough (createFilter, relu dans le moteur embarqué) : dès que lpenv ou l'un de
// lpattack/lpdecay/lpsustain/lprelease est écrit, la coupure suit une enveloppe
// EXPONENTIELLE entre lpf et lpf·2^lpenv (ancre fanchor = 0 par défaut), avec les
// valeurs par défaut .005, .14, 0, .1. Même fonction pour le son et le dessin
// (envPlan, ../core/adsr.js).
import { qFreq, qInt, qTime, qLevel, frHz, frNum, frSec, frPct, codeNum } from '../core/format.js';
import { adsrValues, FILTER_ENV_DEFAULTS, filterEnvRange } from '../core/adsr.js';
import { SOURCES } from './filtre.js';

const ENV_KEYS = ['lpa', 'lpd', 'lps', 'lpr'];
const CTL = { lpa: 'lpattack', lpd: 'lpdecay', lps: 'lpsustain', lpr: 'lprelease' };
const num = (v) => (typeof v === 'number' ? v : parseFloat(v));
const qEnv = (v) => Math.round(v * 10) / 10;

const def = {
  id: 'enveloppe-filtre',
  title: 'L’enveloppe de filtre',
  label: () => 'Enveloppe de filtre',
  params: {
    f: { label: 'Coupure de départ', min: 30, max: 18000, scale: 'log', def: 300, q: qFreq, fmt: frHz },
    q: { label: 'Résonance', min: 0, max: 30, scale: 'lin', def: 1, q: qInt, fmt: (v) => frNum(v, 0) },
    env: { label: 'Profondeur', hint: 'en octaves', min: -8, max: 8, scale: 'lin', def: 2, q: qEnv, fmt: (v) => (v > 0 ? '+' : '') + frNum(v, 1) },
    lpa: { label: 'Attaque', letter: 'A', min: 0, max: 2, scale: 'cube', def: 0.005, q: qTime, fmt: frSec },
    lpd: { label: 'Retombée', letter: 'D', min: 0, max: 2, scale: 'cube', def: 0.14, q: qTime, fmt: frSec },
    lps: { label: 'Maintien', letter: 'S', min: 0, max: 1, scale: 'lin', def: 0, q: qLevel, fmt: frPct },
    lpr: { label: 'Extinction', letter: 'R', min: 0, max: 3, scale: 'cube', def: 0.1, q: qTime, fmt: frSec },
  },
  options: {
    source: { label: 'Ce qui joue', values: ['basse', 'tenue'], labels: { basse: 'Ligne de basse', tenue: 'Note tenue' }, def: 'basse' },
  },
  paramCode: (st, k) => ({ f: 'lpf', q: 'lpq', env: 'lpenv' }[k] || k),

  // { reglages: { lpf, lpq, lpenv, lpa, lpd, lps, lpr } } — lpa…lpr absents : valeurs par défaut.
  fromSpec(spec = {}) {
    const r = spec.reglages || {};
    const written = ENV_KEYS.some((k) => r[k] != null);
    const raw = Object.fromEntries(ENV_KEYS.map((k) => [k, r[k] != null ? num(r[k]) : null]));
    const vals = written ? adsrValues({ attack: raw.lpa, decay: raw.lpd, sustain: raw.lps, release: raw.lpr }) : [...FILTER_ENV_DEFAULTS];
    const implicitQ = r.lpq == null;
    return {
      p: { f: r.lpf != null ? num(r.lpf) : 300, q: implicitQ ? 1 : num(r.lpq), env: r.lpenv != null ? num(r.lpenv) : 2, lpa: vals[0], lpd: vals[1], lps: vals[2], lpr: vals[3] },
      o: { source: spec.source === 'tenue' ? 'tenue' : 'basse' },
      written,
      implicit: implicitQ ? ['q'] : [],
    };
  },
  toSpec(st) {
    const r = { lpf: st.p.f, lpenv: st.p.env };
    if (!(st.implicit || []).includes('q')) r.lpq = st.p.q;
    if (st.written) for (const k of ENV_KEYS) r[k] = st.p[k];
    return { type: 'enveloppe-filtre', reglages: r, source: st.o.source };
  },
  specKeys: (spec) => {
    const map = { lpf: 'f', lpq: 'q', lpenv: 'env', lpa: 'lpa', lpd: 'lpd', lps: 'lps', lpr: 'lpr' };
    return Object.keys((spec && spec.reglages) || {}).every((k) => k in map) ? map : null;
  },
  // Valeurs effectives de l'enveloppe (planchers du moteur compris) et bornes de la coupure.
  values(st) {
    return st.written ? adsrValues({ attack: st.p.lpa, decay: st.p.lpd, sustain: st.p.lps, release: st.p.lpr }) : [...FILTER_ENV_DEFAULTS];
  },
  range(st) {
    return filterEnvRange(st.p.f, st.p.env, 0);
  },

  code(st, { bypass = false } = {}) {
    const parts = [{ t: 'note("' + SOURCES[st.o.source].notes + '").sound("sawtooth").lpf(' }, { t: String(st.p.f), k: 'f' }, { t: ')' }];
    if (!(st.implicit || []).includes('q')) parts.push({ t: '.lpq(' }, { t: String(st.p.q), k: 'q' }, { t: ')' });
    const env = [{ t: '.lpenv(' }, { t: codeNum(st.p.env), k: 'env' }, { t: ')' }];
    if (st.written) for (const k of ENV_KEYS) env.push({ t: '.' + k + '(' }, { t: codeNum(st.p[k]), k }, { t: ')' });
    return [...parts, ...env.map((x) => (bypass ? { ...x, off: true } : x))];
  },
  expect(st) {
    const out = { s: 'sawtooth', cutoff: st.p.f, lpenv: st.p.env, notes: SOURCES[st.o.source].midi };
    out.resonance = (st.implicit || []).includes('q') ? undefined : st.p.q;
    for (const k of ENV_KEYS) out[CTL[k]] = st.written ? st.p[k] : undefined;
    return out;
  },

  warn(st) {
    if (st.p.q > 20) return 'Résonance très forte : le filtre peut siffler fort. Le limiteur protège tes oreilles ; baisse quand même le volume de l’appareil.';
    const { max } = def.range(st);
    if (st.p.env > 0 && max >= 20000) return 'La coupure monterait au-delà de 20 000 Hz : le moteur s’arrête à 20 000 Hz.';
    return null;
  },
  summary(st) {
    const v = def.values(st);
    const { min, max } = def.range(st);
    return `enveloppe de filtre — lpf ${st.p.f} Hz, lpq ${st.p.q}, lpenv ${st.p.env} (la coupure va de ${Math.round(min)} à ${Math.round(max)} Hz), lpa ${v[0]}, lpd ${v[1]}, lps ${v[2]}, lpr ${v[3]}${st.written ? '' : ' (valeurs par défaut)'}`;
  },
  describe:
    'enveloppe-filtre — la coupure d’un passe-bas qui s’ouvre et se referme à chaque note. reglages : {lpf 30 à 18000, lpq 0 à 30, lpenv −8 à 8 (octaves), lpa, lpd 0 à 2 s, lps 0 à 1, lpr 0 à 3 s} ; ' +
    'lpa…lpr absents = valeurs par défaut (.005, .14, 0, .1). source : "basse" | "tenue". missions possibles : balaye, eveil, pique.',
  tolerance: { f: { octaves: 0.5 }, env: { abs: 1 }, lpa: { ratio: 2, abs: 0.06 }, lpd: { ratio: 2, abs: 0.06 }, lps: { abs: 0.2 }, lpr: { ratio: 2, abs: 0.1 } },

  missions: [
    {
      id: 'balaye',
      text: 'Pendant que ça joue, monte la profondeur `lpenv` à 4 ou plus.',
      learned: 'Chaque note ouvre le filtre puis le referme : la coupure monte jusqu’à 2 puissance `lpenv` fois sa valeur (16 fois pour 4), puis redescend. C’est l’enveloppe qui fait « parler » la basse.',
      test: (s) => s.playing && s.p.env >= 4,
    },
    {
      id: 'eveil',
      text: 'Donne au filtre une attaque `lpa` d’au moins 0,2 s.',
      learned: 'Le filtre s’ouvre progressivement : le son s’éclaircit au fil de chaque note, au lieu de démarrer brillant.',
      test: (s) => s.playing && s.written && s.p.lpa >= 0.2 && s.p.env > 0,
    },
    {
      id: 'pique',
      text: 'Retombée `lpd` de 0,1 s ou moins, maintien `lps` à 0, profondeur d’au moins 2.',
      learned: 'Un petit coup de filtre au début de chaque note, puis le son se referme : c’est le « pincement » typique des basses acid.',
      test: (s) => s.playing && s.written && s.p.lpd <= 0.1 && s.p.lps === 0 && s.p.env >= 2,
    },
  ],
  defaultMissions: ['balaye', 'eveil', 'pique'],
  facts: [
    { id: 'fenv.octaves', text: '`lpenv(n)` fait monter la coupure jusqu’à 2ⁿ fois sa valeur de départ : `lpenv(1)` = une octave plus haut, `lpenv(4)` = 16 fois plus haut. Négatif, l’enveloppe est inversée : la coupure part de 2ⁿ fois plus haut et descend jusqu’à `lpf` pendant l’attaque.' },
    { id: 'fenv.defauts', text: 'Sans `lpa`, `lpd`, `lps` ni `lpr`, l’enveloppe du filtre vaut .005, .14, 0, .1 : elle s’ouvre presque d’un coup, puis se referme jusqu’à la coupure de départ.' },
    { id: 'fenv.exponentielle', text: 'La coupure monte et descend en courbe exponentielle : elle gagne le même nombre d’octaves à chaque instant. Sur une échelle de fréquences en octaves, comme celle du dessin, ce sont des lignes droites.' },
    { id: 'fenv.un-seul', text: 'Écrire seulement `lpa(…)` (ou `lpd`, `lps`, `lpr`) suffit à activer l’enveloppe : `lpenv` vaut alors 1.' },
  ],
};

export default def;
