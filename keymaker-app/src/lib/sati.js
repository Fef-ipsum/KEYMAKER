// Keymaker — Chantier 5 : client du proxy IA de Sati (le guide).
//
// Le backend (module `keymaker` sur le Pi, Chantier 4) expose
//   POST {piUrl}/keymaker/ai/chat
// et répond en SSE. Contrat vérifié en direct le 3 juin 2026 :
//   event: model  → data {"model":"claude-…"}      (modèle réellement choisi)
//   event: delta  → data {"text":"…"}              (jeton par jeton)
//   event: done   → data {"text":"<texte complet>"}
//   event: error  → data {"message":"…"}
// Corps accepté : { message, context?, history?, mode? }.
//   • context = bloc <contexte_app> (Chantier 35) : envoyé SÉPARÉMENT du message.
//     Le Pi l'assemble pour Claude mais ne journalise/embedde QUE le message →
//     la mémoire sémantique encode la question de Felix, pas la position dans l'app.
//   • history = [{role:'user'|'assistant', content}] → mémoire multi-tours (vérifié).
//   • mode    = 'fast' (Haiku) | absent (Sonnet, défaut) | 'deep' (Opus).
// La persona de Sati + le profil de Felix sont déjà injectés CÔTÉ PI (system prompt
// serveur) : le front n'envoie donc QUE le message, l'historique et le contexte courant.

import { MAX_HISTORY_PAIRS } from './memory.js';

const CHAT_PATH = '/keymaker/ai/chat';

export function normalizePiUrl(url) {
  let base = (url || '').trim();
  while (base.endsWith('/')) base = base.slice(0, -1);
  return base;
}

/* ---------------------------------------------------------------------------
   Parseur SSE incrémental, indépendant du transport → testable hors navigateur.
   On l'alimente avec des morceaux de texte ; il appelle onEvent({event,data})
   pour chaque bloc complet (séparé par une ligne vide).
   --------------------------------------------------------------------------- */
export function createSSEParser(onEvent) {
  let buffer = '';
  const flush = () => {
    let idx;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      emitBlock(raw, onEvent);
    }
  };
  return {
    push(chunk) {
      buffer += String(chunk).replace(/\r\n?/g, '\n'); // normalise CRLF/CR → LF
      flush();
    },
    end() {
      if (buffer.trim()) emitBlock(buffer, onEvent);
      buffer = '';
    },
  };
}

function emitBlock(raw, onEvent) {
  let event = 'message';
  const dataLines = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
  }
  if (!dataLines.length) return;
  const dataStr = dataLines.join('\n');
  let data = null;
  try {
    data = dataStr ? JSON.parse(dataStr) : null;
  } catch {
    data = { raw: dataStr };
  }
  onEvent({ event, data });
}

/* ---------------------------------------------------------------------------
   streamSati — lance un échange et streame la réponse.
   Retourne { text, model }. Lève une Error explicite si le Pi est injoignable
   ou renvoie un `event: error`. `signal` (AbortController) permet d'interrompre.
   --------------------------------------------------------------------------- */
export async function streamSati({ piUrl, message, context, history = [], mode, signal, onModel, onDelta }) {
  const base = normalizePiUrl(piUrl);
  if (!base) throw new Error('URL du Pi vide — renseigne-la dans Connexion.');

  const body = { message };
  if (context) body.context = context; // Chantier 35 : contexte séparé, jamais journalisé
  if (history && history.length) body.history = history;
  if (mode) body.mode = mode;

  // 2 tentatives sur le fetch INITIAL uniquement (avant le premier octet reçu) :
  // une micro-coupure Tailscale ne doit pas finir en « Pi injoignable » sec.
  // On ne retente JAMAIS un stream entamé (réponse partielle déjà affichée).
  let res;
  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetch(base + CHAT_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });
      lastErr = null;
      break;
    } catch (e) {
      if (e && e.name === 'AbortError') throw e;
      lastErr = e;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
    }
  }
  if (lastErr || !res) {
    throw new Error('Pi injoignable. Vérifie Tailscale et la connexion.');
  }

  if (!res.ok || !res.body) {
    throw new Error('Pi injoignable (HTTP ' + res.status + ').');
  }

  let full = '';
  let model = null;
  let serverError = null;

  const parser = createSSEParser(({ event, data }) => {
    if (event === 'model') {
      model = (data && data.model) || null;
      if (onModel) onModel(model);
    } else if (event === 'delta') {
      const t = (data && data.text) || '';
      if (t) {
        full += t;
        if (onDelta) onDelta(t, full);
      }
    } else if (event === 'done') {
      if (data && typeof data.text === 'string') full = data.text;
    } else if (event === 'error') {
      serverError = (data && data.message) || 'Erreur côté Pi.';
    }
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    parser.push(decoder.decode(value, { stream: true }));
  }
  parser.end();

  if (serverError) throw new Error(serverError);
  return { text: full, model };
}

/* ---------------------------------------------------------------------------
   buildContextBlock — préambule de contexte (ce que Sati « voit » de l'app).
   Délimité par <contexte_app> pour que Sonnet le traite comme du contexte,
   pas comme une phrase de Felix. Inclut TOUJOURS le code live de l'éditeur.
   --------------------------------------------------------------------------- */
export function buildContextBlock(ctx = {}) {
  const {
    studio, // Chantier 32 : true quand Felix est dans le Studio (hors leçon)
    moduleId,
    moduleTitle,
    chapterNumber,
    chapterTitle,
    flashId,
    flashTitle,
    concept,
    lessonCode,
    liveCode,
    error,
    difficulties, // [{ label, ts }] — repères de mémoire locale (tranche 2)
  } = ctx;

  const lines = ['<contexte_app>'];
  if (studio) {
    lines.push(
      "Felix est dans le STUDIO de Keymaker : un bac à sable libre, hors leçon. Il vient juste faire du son, " +
        "improviser et expérimenter avec Strudel. Aide-le à créer ou modifier des patterns : propose des idées " +
        "concrètes et immédiatement jouables, et reste bref et orienté action (pas de cours magistral)."
    );
  } else {
    lines.push(
      `Felix apprend dans Keymaker. Position : Module ${moduleId ?? '?'} « ${moduleTitle ?? ''} »` +
        ` · Chapitre ${chapterNumber ?? '?'} « ${chapterTitle ?? ''} »` +
        ` · Flash ${flashId ?? '?'} « ${flashTitle ?? ''} ».`
    );
    if (concept) lines.push(`Concept enseigné ici : ${concept}`);
    if (lessonCode) lines.push('Code de la leçon (référence) :\n```\n' + lessonCode + '\n```');
  }
  const live = (liveCode || '').trim();
  lines.push("Code actuellement dans l'éditeur de Felix :\n```\n" + (live || '(éditeur vide)') + '\n```');
  if (error) lines.push(`Dernière erreur affichée dans l'app : ${error}`);

  // Mémoire locale (tranche 2) : rappel des difficultés récentes repérées chez Felix.
  // On en glisse 3 au plus, horodatées → Sati « se souvient » sans qu'on ait à
  // l'expliciter. (Le serveur, via sa persona, décide comment s'en servir.)
  const diffs = Array.isArray(difficulties) ? difficulties.slice(0, 3) : [];
  if (diffs.length) {
    lines.push('<memoire_sati>');
    lines.push('Difficultés repérées récemment (Felix les a exprimées dans l’app) :');
    for (const d of diffs) {
      const when = d && d.ts ? ` (${shortDate(d.ts)})` : '';
      lines.push(`- ${(d && d.label) || 'sujet ?'}${when}`);
    }
    lines.push('</memoire_sati>');
  }

  lines.push('</contexte_app>');
  return lines.join('\n');
}

// Date courte JJ/MM pour le rappel de mémoire (affichage compact dans le contexte).
function shortDate(ts) {
  try {
    const d = new Date(ts);
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  } catch {
    return '';
  }
}

// LEGACY (avant Chantier 35) : assemblait contexte + question en UN message.
// Conservé pour les tests/compat, mais l'app envoie désormais { message, context }
// séparés → le journal du Pi n'est plus pollué par le bloc <contexte_app>.
export function composeMessage(userText, contextBlock) {
  if (!contextBlock) return userText;
  return contextBlock + '\n\n' + userText;
}

/* ---------------------------------------------------------------------------
   buildLessonPrompt — Chantier 33 : transforme un sujet libre (« les filtres »,
   « gammes + accords ») en une consigne claire pour que Sati fabrique une
   mini-leçon utile : concept court, code Strudel jouable, petit exercice.
   PUR et testable (hors React). Le sujet est compacté et borné ; la
   personnalisation fine (module/flash courant, niveau) vient du <contexte_app>
   déjà injecté par buildContextBlock() côté envoi.
   --------------------------------------------------------------------------- */
export function buildLessonPrompt(subject) {
  const s = String(subject == null ? '' : subject).replace(/\s+/g, ' ').trim().slice(0, 200);
  const topic = s || 'un point que je revois';
  return (
    `Crée-moi une mini-leçon Keymaker sur : « ${topic} ». ` +
    `Structure ta réponse en trois temps courts : (1) le concept en 2-3 phrases simples, ` +
    `(2) un exemple de code Strudel directement jouable dans un bloc, ` +
    `(3) un petit exercice pour m'entraîner. ` +
    `Reste concret et adapté à mon niveau du moment.`
  );
}

/* ---------------------------------------------------------------------------
   historyFromMessages — reconstruit un historique multi-tours PROPRE à partir du
   fil de chat : paires user→assistant strictement alternées, en sautant les
   échanges en erreur/interrompus (jamais de rôles consécutifs qui casseraient
   l'API côté Pi). PLAFONNÉ aux `maxPairs` derniers tours : le fil affiché/persisté
   garde tout, mais on n'envoie au Pi que la fenêtre récente (coût + latence).
   --------------------------------------------------------------------------- */
export function historyFromMessages(list, maxPairs = MAX_HISTORY_PAIRS) {
  const src = Array.isArray(list) ? list : [];
  const out = [];
  for (let i = 0; i < src.length; i++) {
    const m = src[i];
    if (!m || m.role !== 'user') continue;
    const next = src[i + 1];
    if (!next || next.role !== 'sati' || next.error) continue;
    const u = (m.text || '').trim();
    const a = (next.text || '').trim();
    if (!u || !a) continue;
    out.push({ role: 'user', content: u });
    out.push({ role: 'assistant', content: a });
  }
  if (maxPairs > 0 && out.length > maxPairs * 2) {
    return out.slice(out.length - maxPairs * 2);
  }
  return out;
}
