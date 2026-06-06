// Keymaker — Chantier 16 : suivi de progression (localStorage).  [build:c16-dashboard]
//
// 100 % local et best-effort (try/catch partout, comme le reste de l'app) : on note
// les flashs VUS et les JOURS d'ouverture → de quoi calculer un % par module, un
// streak (jours consécutifs) et quelques chiffres honnêtes. Aucune dépendance, aucun
// réseau. Si localStorage est indisponible (mode privé, quota), tout se dégrade en
// silence : l'app marche, simplement sans suivi.
//
// Les helpers PURS (computeStreak, moduleCompletion, summaryFrom, todayStr) sont
// exportés à part → testables hors navigateur (node).

const PROGRESS_KEY = 'keymaker:progress';

// Forme stockée : { seen: { "m:c:f": ts }, days: ["YYYY-MM-DD", ...] }
function read() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        seen: p && typeof p.seen === 'object' && p.seen ? p.seen : {},
        days: Array.isArray(p && p.days) ? p.days : [],
      };
    }
  } catch {
    /* mode privé / JSON cassé : on repart vide */
  }
  return { seen: {}, days: [] };
}

function write(p) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* non bloquant */
  }
}

// Date LOCALE au format YYYY-MM-DD (pas UTC → le « jour » de Felix, pas celui de Greenwich).
export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Marque le flash courant comme vu (clé stable module:chapitre:flash). Idempotent :
// on n'écrit que la 1re fois → l'ordre de découverte est conservé, pas réécrit.
export function markSeen(m, c, f) {
  const key = `${m}:${c}:${f}`;
  const p = read();
  if (!p.seen[key]) {
    p.seen[key] = Date.now();
    write(p);
  }
  return p;
}

// La 1re visite d'aujourd'hui ? (à lire AVANT recordToday → décide l'ouverture
// automatique du tableau de bord une fois par jour).
export function isFirstVisitToday(now = new Date()) {
  return !read().days.includes(todayStr(now));
}

// Enregistre l'ouverture du jour (un seul enregistrement par date). Renvoie l'état.
export function recordToday(now = new Date()) {
  const t = todayStr(now);
  const p = read();
  if (!p.days.includes(t)) {
    p.days.push(t);
    p.days.sort();
    write(p);
  }
  return p;
}

/* ===========================================================================
   Helpers PURS (sans localStorage) — testables hors navigateur.
   =========================================================================== */

// Streak = nb de jours CONSÉCUTIFS se terminant aujourd'hui. On tolère « aujourd'hui
// pas encore enregistré » tant qu'hier l'était (le streak ne se casse pas juste
// parce qu'on calcule avant d'avoir ouvert). Un trou d'un jour le remet à zéro.
export function computeStreak(days, now = new Date()) {
  if (!Array.isArray(days) || !days.length) return 0;
  const set = new Set(days);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!set.has(todayStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(todayStr(cursor))) return 0; // ni aujourd'hui ni hier → rompu
  }
  let streak = 0;
  while (set.has(todayStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// % de complétion par module : flashs vus distincts / total. `totals` = [n0, n1, …]
// (longueur de la liste plate de chaque module) ; `seen` = map "m:c:f".
export function moduleCompletion(seen, totals) {
  const counts = totals.map(() => 0);
  for (const key of Object.keys(seen || {})) {
    const m = parseInt(String(key).split(':')[0], 10);
    if (Number.isInteger(m) && m >= 0 && m < counts.length) counts[m] += 1;
  }
  return counts.map((n, i) => {
    const total = totals[i] || 0;
    const seenN = Math.min(n, total); // borne défensive (clés orphelines éventuelles)
    return { seen: seenN, total, pct: total ? Math.round((seenN / total) * 100) : 0 };
  });
}

// Vue d'ensemble pour le tableau de bord, à partir d'un état { seen, days } fourni
// (séparé de read() → testable). `totals` = flashs par module.
export function summaryFrom(state, totals, now = new Date()) {
  const seen = (state && state.seen) || {};
  const days = (state && state.days) || [];
  const perModule = moduleCompletion(seen, totals);
  const totalSeen = perModule.reduce((a, b) => a + b.seen, 0);
  const totalFlashs = totals.reduce((a, b) => a + b, 0);
  return {
    perModule,
    totalSeen,
    totalFlashs,
    days: days.length,
    streak: computeStreak(days, now),
    pct: totalFlashs ? Math.round((totalSeen / totalFlashs) * 100) : 0,
  };
}

// Vue d'ensemble depuis le stockage réel (appelée par l'app).
export function summary(totals, now = new Date()) {
  return summaryFrom(read(), totals, now);
}

// Index (dans la liste plate du module) du 1er flash NON vu — pour « reprendre ce
// module » depuis une carte du tableau de bord. -1 si tout est vu (l'appelant
// retombe alors sur le 1er flash). `flat` = FLATS[mIndex].
export function firstUnseenIndex(mIndex, flat) {
  const p = read();
  for (let i = 0; i < flat.length; i++) {
    const e = flat[i];
    const key = `${mIndex}:${e.chapterIndex}:${e.flashInChapter}`;
    if (!p.seen[key]) return i;
  }
  return -1;
}
