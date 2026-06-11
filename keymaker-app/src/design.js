// Keymaker — Personnalisation du design (Apparence).
// 100 % local : ces réglages pilotent des variables CSS posées sur <html> par App,
// et sont persistés avec le reste des settings (clé keymaker:settings).
// Aucune dépendance, aucune touche « thématique » imposée — juste de la matière.

// Accents prêts à l'emploi. `auto` = laisser chaque thème décider (comportement d'origine).
// rgb/ink figés pour les presets (encre lisible choisie à la main) ; `custom` les calcule.
export const ACCENTS = [
  { key: 'auto',    label: 'Par thème', hex: null },
  { key: 'cyan',    label: 'Cyan',      hex: '#22d3ee', rgb: '34, 211, 238',  ink: '#04141a' },
  { key: 'amber',   label: 'Ambre',     hex: '#f5b73d', rgb: '245, 183, 61',  ink: '#241a02' },
  { key: 'emerald', label: 'Émeraude',  hex: '#33e6a6', rgb: '51, 230, 166',  ink: '#03241a' },
  { key: 'violet',  label: 'Violet',    hex: '#a995ff', rgb: '169, 149, 255', ink: '#160a2e' },
  { key: 'rose',    label: 'Rose',      hex: '#fb7aa0', rgb: '251, 122, 160', ink: '#2a0a16' },
  { key: 'ice',     label: 'Glacier',   hex: '#5fa8ff', rgb: '95, 168, 255',  ink: '#04122a' },
];

// Intensité des lueurs (halo). Multiplie l'alpha de --lume → toutes les lueurs suivent.
export const HALOS = [
  { key: 'soft',     label: 'Discret',   strength: 0.5 },
  { key: 'balanced', label: 'Équilibré', strength: 1 },
  { key: 'intense',  label: 'Intense',   strength: 1.7 },
];
export const HALO_STRENGTH = { soft: 0.5, balanced: 1, intense: 1.7 };

// Fond (thèmes sombres uniquement). `auto` = défaut du thème.
export const BACKDROPS = [
  { key: 'auto', label: 'Profond' },
  { key: 'oled', label: 'Noir pur' },
  { key: 'soft', label: 'Adouci' },
];
export const BG_PRESETS = {
  oled: { bg: '#000000', bg2: '#06070d', fade: 'rgba(0, 0, 0, 0.86)' },
  soft: { bg: '#141a2c', bg2: '#1c2540', fade: 'rgba(20, 26, 44, 0.85)' },
};

// "#rgb" ou "#rrggbb" -> "r, g, b" (ou null si invalide).
export function hexToRgb(hex) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255);
}

// Encre lisible (texte posé SUR l'accent) selon la luminance perçue.
export function inkFor(rgbStr) {
  const p = String(rgbStr).split(',').map((x) => parseInt(x, 10));
  if (p.length < 3 || p.some((x) => Number.isNaN(x))) return '#04141a';
  const lum = (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]) / 255;
  return lum > 0.6 ? '#0a0f1a' : '#ffffff';
}

// Accent effectif depuis les settings. null => 'auto' (on laisse le thème décider).
export function resolveAccent(settings) {
  const a = (settings && settings.accent) || 'auto';
  if (a === 'auto') return null;
  if (a === 'custom') {
    const hex = (settings && settings.accentCustom) || '#22d3ee';
    const rgb = hexToRgb(hex) || '34, 211, 238';
    return { hex, rgb, ink: inkFor(rgb) };
  }
  const found = ACCENTS.find((x) => x.key === a);
  return found && found.hex ? { hex: found.hex, rgb: found.rgb, ink: found.ink } : null;
}

// Chantier D2 (11 juin 2026) — identité visuelle par module : une teinte
// d'accent discrète (kicker du flash, badges, numéros de chapitre). L'app
// raconte visuellement où on est ; l'accent GLOBAL (choix de Felix) reste roi
// partout ailleurs. Fallback : var(--accent) si module inconnu.
export const MODULE_TINTS = {
  1: '#22d3ee', // Strudel & live coding — cyan (la maison)
  2: '#a78bfa', // Solfège — violet
  3: '#fbbf24', // Guitare — ambre
  4: '#f472b6', // Audio & FX — rose
  5: '#34d399', // Informatique musicale — vert
  6: '#fb923c', // Composition — orange
  7: '#f87171', // Genres & styles — rouge néon
  8: '#60a5fa', // Module 8 — bleu
};
