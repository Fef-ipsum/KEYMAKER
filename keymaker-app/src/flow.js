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
