// Chantier 38 — tests node de la logique pure (srs.js + learnApi.js).
// Lancer :  node chantier38/test_srs.mjs   (depuis la racine du projet)
import {
  addDays, nextCard, applyResult, levelOf, dueList, dueCountFrom, masteryCounts, BOX_DAYS,
} from '../keymaker-app/src/srs.js';
import { sanitizeQuestions, normalizeVerdict } from '../keymaker-app/src/learnApi.js';

let n = 0, ko = 0;
function eq(got, want, label) {
  n++;
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) return;
  ko++;
  console.error(`✗ ${label}\n   attendu ${w}\n   obtenu  ${g}`);
}

/* ---- addDays ---- */
eq(addDays('2026-06-10', 1), '2026-06-11', 'addDays +1');
eq(addDays('2026-06-30', 1), '2026-07-01', 'addDays passage de mois');
eq(addDays('2026-12-31', 3), '2027-01-03', 'addDays passage d\'année');
eq(addDays('2026-06-10', 7), '2026-06-17', 'addDays +7');

/* ---- nextCard (Leitner) ---- */
const T = '2026-06-10';
let c = nextCard(undefined, true, T);
eq(c.box, 2, 'première réussite → box 2');
eq(c.due, addDays(T, BOX_DAYS[2]), 'première réussite → due +3j');
c = nextCard(undefined, false, T);
eq(c.box, 1, 'premier échec → box 1');
eq(c.due, addDays(T, 1), 'premier échec → due demain');
c = nextCard({ box: 2 }, true, T);
eq(c.box, 3, 'réussite box2 → box 3');
eq(c.due, addDays(T, 7), 'box 3 → due +7j');
c = nextCard({ box: 3 }, true, T);
eq(c.box, 3, 'réussite box3 → reste box 3');
c = nextCard({ box: 3 }, false, T);
eq(c.box, 1, 'échec box3 → retour box 1');
c = nextCard({ box: 1 }, true, T);
eq(c.box, 2, 'réussite box1 → box 2');

/* ---- applyResult (maîtrise) ---- */
let s = applyResult({ mastery: {}, cards: {} }, '1.4', true, T);
eq(s.mastery['1.4'], 'mastered', 'réussite → mastered');
eq(s.cards['1.4'].box, 2, 'réussite → carte box 2');
s = applyResult(s, '1.4', false, T);
eq(s.mastery['1.4'], 'practiced', 'échec après mastered → redescend practiced');
eq(s.cards['1.4'].box, 1, 'échec → carte box 1');
s = applyResult({ mastery: {}, cards: {} }, '2.1', false, T);
eq(s.mastery['2.1'] === undefined, true, 'échec sans maîtrise préalable → rien d\'écrit');
eq(s.cards['2.1'].box, 1, 'mais la carte existe (box 1)');

/* ---- levelOf ---- */
const st = { mastery: { a: 'mastered', b: 'practiced' }, cards: {} };
eq(levelOf('a', st, true), 'mastered', 'levelOf mastered');
eq(levelOf('b', st, true), 'practiced', 'levelOf practiced');
eq(levelOf('c', st, true), 'seen', 'levelOf vu');
eq(levelOf('d', st, false), 'new', 'levelOf nouveau');

/* ---- dueList / dueCountFrom ---- */
const stateDue = {
  mastery: {},
  cards: {
    old1: { box: 2, due: '2026-06-08' },  // en retard
    old2: { box: 1, due: '2026-06-08' },  // en retard, plus fragile
    today: { box: 3, due: '2026-06-10' }, // dû aujourd'hui
    future: { box: 1, due: '2026-06-12' },// pas encore
  },
};
const due = dueList(stateDue, '2026-06-10');
eq(due.length, 3, 'dueList exclut le futur');
eq(due[0].flashId, 'old2', 'tri : retard puis box basse d\'abord');
eq(due[1].flashId, 'old1', 'tri : retard box 2 ensuite');
eq(due[2].flashId, 'today', 'tri : dû aujourd\'hui en dernier');
eq(dueList(stateDue, '2026-06-10', 2).length, 2, 'plafond respecté');
eq(dueCountFrom(stateDue, '2026-06-10'), 3, 'dueCountFrom non plafonné');
eq(dueCountFrom(stateDue, '2026-06-07'), 0, 'rien de dû avant');

/* ---- masteryCounts ---- */
eq(masteryCounts(st), { practiced: 1, mastered: 1 }, 'masteryCounts');

/* ---- sanitizeQuestions (learnApi) ---- */
const ids = new Set(['1.1', '1.4']);
const raw = [
  { type: 'mcq', flashId: '1.1', question: 'Q ?', choices: ['a', 'b', 'c'], answer: 1, explain: 'ok' },
  { type: 'nope', flashId: '1.1', question: 'Q ?', choices: ['a', 'b'], answer: 0 },          // type inconnu
  { type: 'mcq', flashId: '9.9', question: 'Q ?', choices: ['a', 'b'], answer: 0 },           // id hors chapitre
  { type: 'mcq', flashId: '1.4', question: 'Q ?', choices: ['a', 'b'], answer: 5 },           // answer hors bornes
  { type: 'truefalse', flashId: '1.4', question: 'V ou F ?', choices: ['x'], answer: 0 },     // truefalse → forcé Vrai/Faux
  { type: 'fill', flashId: '1.4', question: 'sound("____")', choices: ['bd', 'xx'], answer: 0, code: 'sound("bd")' },
];
const qs = sanitizeQuestions(raw, ids);
eq(qs.length, 3, 'sanitize : 3 questions valides sur 6');
eq(qs[0].type, 'mcq', 'sanitize : mcq conservée');
eq(qs[1].choices, ['Vrai', 'Faux'], 'sanitize : truefalse normalisée');
eq(qs[2].code, 'sound("bd")', 'sanitize : code conservé');
eq(sanitizeQuestions(raw, null).length, 4, 'sanitize sans filtre d\'ids : 4 (9.9 passe)');

/* ---- normalizeVerdict ---- */
eq(normalizeVerdict('ok'), 'ok', 'verdict ok');
eq(normalizeVerdict('OK'), 'retry', 'verdict inconnu → retry (conservateur)');
eq(normalizeVerdict(undefined), 'retry', 'verdict absent → retry');

if (ko) { console.error(`\n${ko}/${n} tests en échec`); process.exit(1); }
console.log(`✓ ${n}/${n} tests OK — Leitner, maîtrise, file de révision, sanitisation.`);
