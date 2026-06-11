// Keymaker — Chantier 44 : Mode Flow.  [build:c44-flow]
//
// « J'ai X minutes » → une session orchestrée qui enchaîne ce qui compte :
//   1. review     — les cartes Leitner dues (réutilise Review.jsx, C38)
//   2. learn      — 1 à 3 flashs NOUVEAUX (navigation réelle dans l'app)
//   3. challenge  — un défi créatif inventé par Sati (Opus + profil vivant, C42)
//
// Le PLAN est construit LOCALEMENT (zéro latence, zéro JSON fragile, marche
// hors-ligne sauf le défi) — Sati intervient là où elle a de la valeur : le
// contenu du défi. Pas de minuteur coercitif : un chrono doux, le flow se
// termine quand Felix le décide (contrat TDA : cadre, pas de pression).
//
// buildFlowPlan est PUR (testable node). Le défi a une banque locale de repli.

export const FLOW_DURATIONS = [
  { minutes: 10, label: '~10 min', sub: 'micro-dose' },
  { minutes: 20, label: '~20 min', sub: 'la bonne session' },
  { minutes: 40, label: '~40 min', sub: 'plongée' },
];

// Plan d'une session : liste d'étapes ordonnées.
//   { type:'review',    count }  — n cartes dues (≤ 3 ou 5 selon le temps)
//   { type:'learn',     count }  — n flashs nouveaux
//   { type:'challenge'        }  — défi créatif
export function buildFlowPlan({ minutes, dueCount, unseenCount }) {
  const m = Number(minutes) || 20;
  const steps = [];
  const rev = Math.min(Math.max(0, dueCount | 0), m >= 20 ? 5 : 3);
  if (rev > 0) steps.push({ type: 'review', count: rev });
  const learn = Math.min(Math.max(0, unseenCount | 0), m >= 40 ? 3 : m >= 20 ? 2 : 1);
  if (learn > 0) steps.push({ type: 'learn', count: learn });
  // Défi : toujours à 20/40 min ; à 10 min seulement si pas de révision (sinon ça déborde).
  if (m >= 20 || rev === 0) steps.push({ type: 'challenge' });
  return steps;
}

// Libellé d'une étape pour le bandeau.
export function stepLabel(step) {
  if (!step) return '';
  if (step.type === 'review') return 'Révision · ' + step.count + (step.count > 1 ? ' cartes' : ' carte');
  if (step.type === 'learn') return 'Nouveau terrain · ' + step.count + (step.count > 1 ? ' flashs' : ' flash');
  return 'Défi créatif';
}

// mm:ss écoulées (chrono doux du bandeau).
export function elapsedLabel(startTs, now = Date.now()) {
  const s = Math.max(0, Math.round((now - startTs) / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

/* ---------------------------------------------------------------------------
   Banque locale de défis — repli quand le Pi est injoignable (ou trop lent).
   Volontairement simples et ouverts : l'anti-page-blanche avant tout.
   --------------------------------------------------------------------------- */
export const LOCAL_CHALLENGES = [
  { title: 'Un seul son', brief: 'Construis un groove qui tient la route avec UN seul nom de son (varie avec :n, la mini-notation et un effet). Contrainte = liberté.', code: 'sound("casio casio:2 ~ casio:5")' },
  { title: 'Le kick voyageur', brief: 'Pars d\'un kick 4/4, puis fais-le « voyager » : enlève-le un temps sur quatre, ajoute un écho. Le silence est un instrument.', code: 'sound("bd bd bd bd")' },
  { title: 'Machine à remonter le temps', brief: 'Même pattern, deux époques : joue-le avec une banque 808, puis 909. Garde celle qui te fait bouger la tête.', code: 'sound("bd hh sd hh").bank("RolandTR808")' },
  { title: 'La pluie', brief: 'Fais tomber la pluie : des hi-hats rapides, irréguliers, doux. Puis un coup de tonnerre de temps en temps.', code: 'sound("hh*8")' },
  { title: 'Trois notes, pas plus', brief: 'Compose une mélodie hypnotique avec exactement trois notes. Répète, varie le rythme, jamais les notes.', code: 'note("c3 eb3 g3")' },
  { title: 'Le dialogue', brief: 'Deux sons qui se répondent : l\'un pose une question (aigu), l\'autre répond (grave). stack() est ton ami.', code: 'stack(sound("hh ~ hh ~"), sound("~ bd ~ bd"))' },
  { title: 'Montée d\'acide', brief: 'Une bassline qui tourne, et un filtre qui s\'ouvre doucement. Cherche le moment où ça décolle.', code: 'note("c2 c2 eb2 c2").sound("sawtooth").lpf(400)' },
  { title: 'Le métronome fou', brief: 'Commence carré (4/4 bien sage), puis dérègle UNE chose à la fois : vitesse, accent, silence. Où est la limite du dansable ?', code: 'sound("bd hh sd hh")' },
];

export function pickLocalChallenge(rand = Math.random()) {
  return LOCAL_CHALLENGES[Math.floor(rand * LOCAL_CHALLENGES.length) % LOCAL_CHALLENGES.length];
}

/* ---------------------------------------------------------------------------
   Chantier 43 — Défi du jour. Déterministe : la DATE choisit le défi (même
   défi toute la journée, différent demain) dans la banque combinée. Marqué
   « relevé » en localStorage. Anti-page-blanche : ouvrir → un défi → 10 min.
   --------------------------------------------------------------------------- */
export const DAILY_CHALLENGES = [
  { title: 'Carte postale sonore', brief: 'Un lieu te vient en tête (gare, forêt, atelier…) ? Fais-le entendre en 4 lignes max. Pas de mélodie obligatoire : une ambiance.', code: 'sound("wind ~ insect ~")' },
  { title: 'Le batteur fantôme', brief: 'Un beat où la grosse caisse ne tombe JAMAIS sur le premier temps. Bizarre au début, addictif ensuite.', code: 'sound("~ bd hh bd")' },
  { title: 'Deux vitesses', brief: 'Superpose le même motif joué lent et rapide (.slow(2) + .fast(2)). Écoute les motifs se croiser.', code: 'note("c3 eb3 g3 bb3")' },
  { title: 'Minimal house', brief: 'Kick 4/4, UN clap, UN hi-hat. Rien d\'autre — mais place-les pour que ça groove vraiment.', code: 'sound("bd bd bd bd")' },
  { title: 'L\'intrus', brief: 'Un pattern propre… avec UN son qui n\'a rien à faire là (crow ? numbers ?). Fais-le sonner voulu.', code: 'sound("bd hh sd hh")' },
  { title: 'Nappe du soir', brief: 'Pas de batterie aujourd\'hui : des notes longues, de la reverb, et le temps qui s\'étire.', code: 'note("c3 g3 e4").slow(4).room(0.8)' },
  { title: 'Code golf', brief: 'Le groove le plus riche possible en UNE seule ligne de code. Compte tes caractères, recommence plus court.', code: 'sound("bd*2 [~ sd] hh*4")' },
  { title: 'La gamme cachée', brief: 'Choisis une gamme (mineure ?) et improvise un motif qui ne sort JAMAIS de ses notes. Ton oreille te dira merci.', code: 'note("a2 c3 e3 a3")' },
];

const DAILY_KEY = 'keymaker:daily';

// La date (YYYY-MM-DD) choisit le défi — déterministe, pur.
export function dailyChallenge(dateStr) {
  const all = DAILY_CHALLENGES.concat(LOCAL_CHALLENGES);
  let h = 0;
  for (const ch of String(dateStr)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return all[h % all.length];
}

export function readDaily() {
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export function markDailyDone(dateStr) {
  try { localStorage.setItem(DAILY_KEY, JSON.stringify({ date: dateStr, done: true })); } catch { /* ignore */ }
}

export function isDailyDone(dateStr, stored = readDaily()) {
  return !!(stored && stored.date === dateStr && stored.done);
}
