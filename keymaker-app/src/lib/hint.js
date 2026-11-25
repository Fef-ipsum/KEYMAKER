// Indice gradué : « où chercher » dans le code de départ, sans donner la réponse.
//
// On compare, mot par mot, le code de départ et la solution proposée (plus longue
// sous-suite commune). Il reste les passages que la solution remplace, ou les endroits
// où elle ajoute quelque chose. Au-delà de trois endroits, ou si un passage est trop
// long pour servir d'indice, on donne les lignes. Fonction pure, testée hors navigateur
// (scripts/check-hints.mjs).

// Une chaîne entre guillemets (un motif) compte pour un seul mot ; on l'affine ensuite.
const TOKEN = /"[^"\n]*"|'[^'\n]*'|\d*\.?\d+|[A-Za-z_#][\w#]*|\s+|./g;
const QUOTED = /^(["']).*\1$/;
// Dans un motif : un « mot » de mini-notation (bd, c#3, sd:2, 0.5…).
const MINI = /[^\s\[\]<>{}(),|"']/;
const MAX = 32;

const tokens = (s) => s.match(TOKEN) || [];
// Un passage montré doit tenir debout : autant de ( [ < { ouvrants que fermants, dans l'ordre.
export function balanced(t) {
  const open = '([<{';
  const close = ')]>}';
  const stack = [];
  for (const ch of String(t).replace(/=>/g, '')) {
    if (open.includes(ch)) stack.push(close[open.indexOf(ch)]);
    else if (close.includes(ch) && stack.pop() !== ch) return false;
  }
  return !stack.length;
}
const blank = (t) => /^[\s,]*$/.test(t);

// Plus longue sous-suite commune : pour chaque mot du départ, gardé (true) ou non.
function keepMask(a, b) {
  const n = a.length;
  const m = b.length;
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const keepA = new Array(n).fill(false);
  const insAfter = new Array(n + 1).fill(false); // la solution ajoute quelque chose avant le mot i
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      keepA[i] = true;
      i++;
      j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) i++;
    else {
      if (!blank(b[j])) insAfter[i] = true;
      j++;
    }
  }
  while (j < m) {
    if (!blank(b[j])) insAfter[n] = true;
    j++;
  }
  return { keepA, insAfter };
}

function lineOf(text, pos) {
  return text.slice(0, pos).split('\n').length;
}

export function whereToChange(start, solution) {
  const a = String(start || '');
  const b = String(solution || '');
  if (!a.trim() || !b.trim() || a === b) return null;
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.length * tb.length > 250000) return null;
  const { keepA, insAfter } = keepMask(ta, tb);
  const pos = [];
  let acc = 0;
  for (const t of ta) {
    pos.push(acc);
    acc += t.length;
  }
  pos.push(acc);

  // Les passages : mots du départ non gardés, ou points d'insertion. Deux passages séparés
  // seulement par des espaces ou des virgules n'en font qu'un.
  const spots = [];
  for (let i = 0; i <= ta.length; i++) {
    const removed = i < ta.length && !keepA[i] && !blank(ta[i]);
    if (!removed && !insAfter[i]) continue;
    const last = spots[spots.length - 1];
    const gapBlank = last && ta.slice(last.to, i).every(blank) && !ta.slice(last.to, i).join('').includes('\n');
    if (last && gapBlank) last.to = removed ? i + 1 : Math.max(last.to, i);
    else spots.push({ from: i, to: removed ? i + 1 : i });
  }
  const multi = a.includes('\n');
  const where = (p) => (multi ? ' (ligne ' + lineOf(a, p) + ')' : '');
  const parts = [];
  for (const sp of spots) {
    let text = ta.slice(sp.from, sp.to).join('').trim();
    // Un motif remplacé par un autre motif : seulement les mots qui changent dedans.
    if (sp.to - sp.from === 1 && QUOTED.test(ta[sp.from])) {
      const inB = tb.filter((t) => QUOTED.test(t) && !ta.includes(t));
      const fine = inB.length === 1 ? refine(ta[sp.from], inB[0]) : null;
      if (fine) {
        parts.push({ ...fine, at: pos[sp.from] });
        continue;
      }
    }
    if (text) {
      text = text.replace(/^(?:[,\s]|\.(?!\d))+|[.,\s]+$/g, ''); // garde le point de .01
      if (!text || !balanced(text) || text.length > MAX || text.includes('\n') || text.includes('`')) return byLines(a, b, multi);
      parts.push({ kind: 'change', text, at: pos[sp.from] });
    } else {
      // Insertion : on montre les quelques mots qui précèdent, sur la même ligne.
      const lineStart = a.lastIndexOf('\n', pos[sp.from] - 1) + 1;
      let tail = a.slice(lineStart, pos[sp.from]).trimStart();
      if (tail.length > 24) {
        tail = tail.slice(-24);
        const cut = tail.search(/[.(\s"]/);
        if (cut > 0) tail = tail.slice(cut);
        tail = '…' + tail;
      }
      if (tail.includes('`')) return byLines(a, b, multi);
      parts.push({ kind: 'add', text: tail, at: pos[sp.from] });
    }
  }
  if (!parts.length || parts.length > 3) return byLines(a, b, multi);
  const said = parts.map((p) => (p.kind === 'inside' ? 'ajoute quelque chose dans le motif `' + p.text + '`' + where(p.at) : p.kind === 'motif' ? 'change le motif `' + p.text + '`' + where(p.at) : p.kind === 'change' ? 'change `' + p.text + '`' + where(p.at) : p.text ? 'ajoute quelque chose juste après `' + p.text + '`' + where(p.at) : multi ? 'ajoute une ligne' + where(p.at) : 'ajoute quelque chose au début'));
  const joined = said.length === 1 ? said[0] : said.slice(0, -1).join(', ') + ' et ' + said[said.length - 1];
  return { parts, text: 'Où chercher : dans le code de départ, la solution proposée ' + joined + '.' };
}

// Deux motifs : ce qui change entre leurs débuts et leurs fins communs, élargi aux mots
// entiers. Une insertion pure est dite « dans le motif ».
function refine(qa, qb) {
  const a = qa.slice(1, -1);
  const b = qb.slice(1, -1);
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  let from = p;
  let to = a.length - s;
  const w = (ch) => ch != null && MINI.test(ch);
  if (to === from) {
    // Rien de retiré. Un ajout collé à un mot (e3 → eb3, hh → hh?) change ce mot ;
    // sinon, c'est un ajout dans le motif.
    const ins = b.slice(p, b.length - s);
    const left = w(a[from - 1]) && w(ins[0]);
    const right = w(a[from]) && w(ins[ins.length - 1]);
    if (!left && !right) return qa.length <= MAX ? { kind: 'inside', text: qa } : null;
    if (left) while (from > 0 && w(a[from - 1])) from--;
    if (right) while (to < a.length && w(a[to])) to++;
  } else {
    while (from > 0 && w(a[from - 1]) && w(a[from])) from--;
    while (to < a.length && w(a[to]) && w(a[to - 1])) to++;
  }
  const text = a.slice(from, to).trim();
  if (!text || text.length > MAX || !balanced(text)) return qa.length <= MAX ? { kind: 'motif', text: qa } : null;
  return { kind: 'change', text };
}

// Repli : les lignes du code de départ que la solution modifie (trois au plus).
function byLines(a, b, multi) {
  if (!multi) return null;
  const lb = new Set(b.split('\n').map((x) => x.trim()));
  const changed = a.split('\n').map((x, i) => (lb.has(x.trim()) ? 0 : i + 1)).filter(Boolean);
  if (!changed.length || changed.length > 3) return null;
  const list = changed.length === 1 ? 'la ligne ' + changed[0] : 'les lignes ' + changed.slice(0, -1).join(', ') + ' et ' + changed[changed.length - 1];
  return { parts: [], text: 'Où chercher : dans le code de départ, la solution proposée modifie ' + list + '.' };
}
