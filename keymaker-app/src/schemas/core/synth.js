// Schémas vivants — une note de synthé, construite comme superdough la construit.
//
// Chaîne d'une note dans superdough (Strudel 1.3.0, relue dans le moteur embarqué) :
//   OscillatorNode (sine | triangle | square | sawtooth)
//   → gain 0,3 → gain d'enveloppe (ADSR linéaire, de 0 à 1) → gain 0,8 (`gain` par défaut)
//   → filtres (passe-bas, passe-haut, passe-bande) → sortie
// L'onde s'arrête à fin de note + extinction + 0,01 s.
//
// Ce module ne dépend de rien d'autre que de Web Audio : il sert à l'app ET au banc
// de test (rendu hors temps réel comparé à superdough).
import { adsrPlan, applyPlan, holdStartPlan, releaseOrders, noteStop } from './adsr.js';

// Fige un paramètre à la valeur v à l'instant T, en annulant la suite.
// cancelScheduledValues seul laisse, dans Chrome, UN échantillon à l'ancienne valeur
// quand on coupe une rampe en cours (un petit clic) : mesuré par scripts/check-schemas.mjs.
// cancelAndHoldAtTime ne le fait pas ; on s'en sert quand le navigateur le connaît.
export function freezeAt(param, T, v) {
  if (typeof param.cancelAndHoldAtTime === 'function') param.cancelAndHoldAtTime(T);
  else param.cancelScheduledValues(T);
  param.setValueAtTime(v, T);
}

export const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
export const OSC_GAIN = 0.3;
export const DEFAULT_GAIN = 0.8;

// Joue une note. `hold` = durée en secondes ; null = note tenue, à lâcher avec release().
// `vals` = [a, d, s, r] effectifs (voir adsrValues).
export function synthNote(ac, dest, { wave = 'sawtooth', freq, begin, hold, vals }) {
  // wave 'one' : une source constante (comme le son « one » de superdough). Sert au banc
  // de test pour mesurer l'enveloppe seule.
  let osc;
  if (wave === 'one') osc = new ConstantSourceNode(ac, { offset: 1 });
  else {
    osc = ac.createOscillator();
    osc.type = wave;
    osc.frequency.value = freq;
  }
  const g1 = ac.createGain();
  g1.gain.value = OSC_GAIN;
  const env = ac.createGain();
  env.gain.value = 0;
  const g2 = ac.createGain();
  g2.gain.value = DEFAULT_GAIN;
  osc.connect(g1).connect(env).connect(g2).connect(dest);
  let plan;
  if (hold != null) {
    plan = adsrPlan(vals, begin, hold);
    applyPlan(env.gain, plan);
    osc.start(begin);
    osc.stop(noteStop(vals, begin + hold));
  } else {
    plan = holdStartPlan(vals, begin);
    applyPlan(env.gain, plan);
    osc.start(begin);
  }
  const cleanup = () => {
    try {
      osc.disconnect();
      g1.disconnect();
      env.disconnect();
      g2.disconnect();
    } catch {
      /* déjà fait */
    }
  };
  osc.onended = cleanup;
  return {
    osc,
    env,
    begin,
    vals,
    // Lâche une note tenue à l'instant T (par défaut : maintenant).
    release(T = ac.currentTime) {
      if (hold != null) return;
      const orders = releaseOrders(vals, begin, T);
      freezeAt(env.gain, T, orders[0].v);
      applyPlan(env.gain, orders.slice(1));
      osc.stop(noteStop(vals, T));
      return T;
    },
    // Coupe tout de suite, avec un fondu de 15 ms pour éviter un clic.
    kill(T = ac.currentTime) {
      try {
        freezeAt(env.gain, T, env.gain.value);
        env.gain.linearRampToValueAtTime(0, T + 0.015);
        osc.stop(T + 0.03);
      } catch {
        /* déjà arrêtée */
      }
    },
  };
}
