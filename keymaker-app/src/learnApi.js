// Keymaker — Chantiers 37 & 39 : client des routes JSON du Pi (quiz + vérif).
//
// Contrairement à sati.js (SSE streamé), ces routes répondent en JSON simple :
//   POST {piUrl}/keymaker/ai/quiz   → { questions: [...] }
//   POST {piUrl}/keymaker/ai/verify → { verdict: 'ok'|'retry', feedback }
// Le serveur valide déjà tout (sanitizeQuiz côté Pi) ; on REVALIDE ici par
// défense en profondeur — une question malformée ne doit jamais casser l'UI.
// Helpers purs (sanitizeQuestions, normalizeVerdict) exportés → testables node.

import { normalizePiUrl } from './sati.js';

const QUIZ_PATH = '/keymaker/ai/quiz';
const VERIFY_PATH = '/keymaker/ai/verify';

async function postJSON(piUrl, path, body, { signal, timeoutMs = 35000 } = {}) {
  const base = normalizePiUrl(piUrl);
  if (!base) throw new Error('URL du Pi vide — renseigne-la dans Connexion.');
  const ctrl = new AbortController();
  const timer = setTimeout(() => { try { ctrl.abort(); } catch { /* ignore */ } }, timeoutMs);
  const onAbort = () => { try { ctrl.abort(); } catch { /* ignore */ } };
  if (signal) {
    if (signal.aborted) onAbort();
    else signal.addEventListener('abort', onAbort, { once: true });
  }
  let res;
  try {
    res = await fetch(base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (signal && signal.aborted) throw e; // interruption volontaire
    throw new Error('Pi injoignable. Vérifie Tailscale et la connexion.');
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
  let data = null;
  try { data = await res.json(); } catch { /* corps non-JSON */ }
  if (!res.ok) {
    throw new Error((data && data.error) || 'Pi injoignable (HTTP ' + res.status + ').');
  }
  return data || {};
}

/* ---------------------------------------------------------------------------
   Validation côté client (PURE) — miroir du serveur, défense en profondeur.
   --------------------------------------------------------------------------- */
export const QUESTION_TYPES = new Set(['mcq', 'truefalse', 'fill']);

export function sanitizeQuestions(raw, validIds = null) {
  const qs = Array.isArray(raw) ? raw : [];
  const out = [];
  for (const q of qs) {
    if (!q || typeof q !== 'object') continue;
    const type = QUESTION_TYPES.has(q.type) ? q.type : null;
    const flashId = typeof q.flashId === 'string' && q.flashId ? q.flashId : null;
    const question = typeof q.question === 'string' ? q.question.trim() : '';
    let choices = Array.isArray(q.choices) ? q.choices.filter((c) => typeof c === 'string' && c.trim()) : [];
    if (type === 'truefalse') choices = ['Vrai', 'Faux'];
    const answer = Number.isInteger(q.answer) && q.answer >= 0 && q.answer < choices.length ? q.answer : -1;
    if (!type || !flashId || !question || choices.length < 2 || answer < 0) continue;
    if (validIds && !validIds.has(flashId)) continue;
    out.push({
      type,
      flashId,
      question,
      code: typeof q.code === 'string' && q.code.trim() ? q.code : undefined,
      choices,
      answer,
      explain: typeof q.explain === 'string' ? q.explain.trim() : '',
    });
  }
  return out;
}

export function normalizeVerdict(v) {
  return v === 'ok' ? 'ok' : 'retry';
}

/* ---------------------------------------------------------------------------
   Appels réseau.
   --------------------------------------------------------------------------- */

// Génère le quiz d'un chapitre. `flashs` = [{id,title,concept,code,exercise}].
// Lève une Error explicite si le Pi est injoignable ou le quiz inutilisable.
export async function generateQuiz({ piUrl, moduleTitle, chapterTitle, flashs, count = 4, signal }) {
  const data = await postJSON(piUrl, QUIZ_PATH, { moduleTitle, chapterTitle, flashs, count }, { signal, timeoutMs: 45000 });
  const validIds = new Set((flashs || []).map((f) => f && f.id).filter(Boolean));
  const questions = sanitizeQuestions(data.questions, validIds);
  if (!questions.length) throw new Error('Quiz illisible — réessaie dans un instant.');
  return questions;
}

// Évalue l'exercice du flash courant avec le code live de l'éditeur.
// → { verdict: 'ok'|'retry', feedback: string }
export async function verifyExercise({ piUrl, flashId, flashTitle, exercise, concept, lessonCode, code, signal }) {
  const data = await postJSON(
    piUrl,
    VERIFY_PATH,
    { flashId, flashTitle, exercise, concept, lessonCode, code },
    { signal, timeoutMs: 25000 },
  );
  return {
    verdict: normalizeVerdict(data.verdict),
    feedback: typeof data.feedback === 'string' && data.feedback.trim()
      ? data.feedback.trim()
      : (data.verdict === 'ok' ? 'Objectif atteint, bien joué.' : 'Pas encore — réessaie.'),
  };
}

// Chantier 44 — défi créatif du Mode Flow. Opus (deep) + profil vivant injectés
// CÔTÉ PI. Long (jusqu'à ~20 s) : le timeout est large, l'UI montre une attente
// chaleureuse, et flow.js a une banque locale de repli si ça échoue.
export async function generateChallenge({ piUrl, recent, minutes, signal }) {
  const data = await postJSON(piUrl, '/keymaker/ai/challenge', { recent, minutes }, { signal, timeoutMs: 45000 });
  if (!data || typeof data.title !== 'string' || typeof data.brief !== 'string' || !data.title.trim()) {
    throw new Error('Défi illisible.');
  }
  return {
    title: data.title.trim(),
    brief: data.brief.trim(),
    code: typeof data.code === 'string' ? data.code.trim() : '',
  };
}
