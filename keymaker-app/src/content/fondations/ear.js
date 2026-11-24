// Questions « retrouve le réglage à l'oreille », générées à partir des schémas.
//
// Une FAMILLE = un réglage à retrouver (la coupure, la résonance, l'attack…) sur un schéma
// de départ, et plusieurs valeurs cibles. Toutes ses variantes partagent le même
// identifiant : c'est UNE carte de révision, et chaque passage tire une cible au hasard
// (on retient l'oreille, pas la réponse). Identifiants stables : ne jamais les renommer.
//
// Contrôles (scripts/check-schemas.mjs) : chaque variante part d'un réglage refusé,
// sa cible est acceptée et atteignable au curseur, et le code du son mystère, évalué
// par Strudel, porte bien la valeur cible.
import { frNum, codeNum } from '../../schemas/core/format.js';

function family({ id, step, q, schema, key, targets, explain }) {
  return targets.map((v, i) => ({ type: 'oreille', id, variant: i, step, q, schema, cible: { [key]: v }, regler: [key], explain: explain(v) }));
}

// Chapitre VI — le timbre.
export const earTimbre = [
  ...family({
    id: 'oreille.filtre-coupure',
    step: 'f.filtre',
    q: 'Retrouve la coupure : le son mystère est la même basse, avec un filtre plus fermé.',
    schema: { type: 'filtre', reglages: { lpf: 3000, lpq: 0 }, source: 'basse' },
    key: 'lpf',
    targets: [250, 400, 800],
    explain: (v) =>
      `Le son mystère était à \`lpf(${v})\` : le passe-bas laisse passer ce qui est sous ${frNum(v)} Hz et atténue de plus en plus ce qui est au-dessus. ` +
      `Pour un do2 (65 Hz), les harmoniques à partir de la ${Math.floor(v / 65.4) + 1}ᵉ sont atténuées : plus la coupure est basse, plus le son est rond et étouffé.`,
  }),
  ...family({
    id: 'oreille.filtre-resonance',
    step: 'f.resonance',
    q: 'Retrouve la résonance : même basse, même coupure (800 Hz), mais le filtre du son mystère « chante ».',
    schema: { type: 'filtre', reglages: { lpf: 800, lpq: 0 }, source: 'basse' },
    key: 'lpq',
    targets: [10, 18, 26],
    explain: (v) =>
      `Le son mystère avait \`lpq(${v})\` : la résonance renforce les fréquences proches de la coupure, ici 800 Hz. ` +
      'Plus elle est haute, plus cette bosse est haute et étroite, et plus le filtre siffle sur chaque note.',
  }),
  ...family({
    id: 'oreille.adsr-attack',
    step: 'f.enveloppe',
    q: 'Retrouve l’attack : le son mystère est la même note, qui arrive plus lentement.',
    schema: { type: 'adsr', reglages: { attack: 0.005, decay: 0.1, sustain: 1, release: 0.1 }, notes: 1 },
    key: 'attack',
    targets: [0.3, 0.7, 1.5],
    explain: (v) => `Le son mystère avait \`attack(${codeNum(v)})\` : chaque note met ${frNum(v)} s à monter du silence jusqu’au sommet, au lieu de démarrer d’un coup.`,
  }),
  {
    type: 'oreille',
    id: 'oreille.adsr-pince',
    step: 'f.pluck',
    q: 'Retrouve l’enveloppe : le son mystère est une note pincée.',
    schema: { type: 'adsr', reglages: { attack: 0.005, decay: 0.15, sustain: 1, release: 0.1 }, notes: 4 },
    cible: { sustain: 0 },
    regler: ['sustain'],
    explain: 'Le son mystère avait `sustain(0)` : après le decay de 0,15 s, le volume tombe à zéro au lieu de rester au niveau sustain jusqu’à la fin de la note.',
  },
  ...family({
    id: 'oreille.reverb-taille',
    step: 'f.espace',
    q: 'Retrouve la taille de la pièce : même note, même quantité de réverbération, mais une traîne plus longue.',
    schema: { type: 'effet', effet: 'reverb', reglages: { room: 0.6, size: 0.5 } },
    key: 'size',
    targets: [2, 4, 7],
    explain: (v) => `Le son mystère avait \`size(${v})\` : sa traîne s’éteint de 60 dB (à un millième de son niveau) en ${frNum(v)} s, et s’arrête tout à fait à ${frNum(1.5 * v)} s.`,
  }),
  ...family({
    id: 'oreille.echo-temps',
    step: 'f.espace',
    q: 'Retrouve le temps entre les échos : même note, même nombre d’échos, un autre espacement.',
    schema: { type: 'effet', effet: 'echo', reglages: { delay: 0.6, delaytime: 0.5, delayfeedback: 0.4 } },
    key: 'delaytime',
    targets: [0.1, 0.25, 0.75],
    explain: (v) => `Le son mystère avait \`delaytime(${codeNum(v)})\` : un écho toutes les ${frNum(v)} s après la note, le premier au niveau 0,6, chacun des suivants à 40 % du précédent.`,
  }),
];

// Chapitre II — le rythme.
export const earRythme = [
  ...family({
    id: 'oreille.tempo',
    step: 'f.groove',
    q: 'Retrouve le tempo : le son mystère joue le même motif, plus vite ou plus lentement.',
    schema: { type: 'tempo', reglages: { bpm: 120 }, temps: 4 },
    key: 'bpm',
    targets: [80, 100, 145],
    explain: (v) => `Le son mystère était à \`setcpm(${v}/4)\` : ${v} temps par minute, un kick toutes les ${frNum(60 / v, 2)} s.`,
  }),
];
