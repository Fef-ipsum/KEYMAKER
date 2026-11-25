// Réponse d'un filtre réglé comme l'état `st`, calculée par Web Audio lui-même
// (getFrequencyResponse d'un BiquadFilterNode non branché, dans le même contexte audio).
// Le dessin du schéma « filtre » vient de là. Utilisé aussi par le banc de test.
import { KINDS } from '../types/filtre.js';

const probes = new WeakMap();
export function filterResponse(ctx, st, freqs) {
  let probe = probes.get(ctx);
  if (!probe) {
    probe = ctx.createBiquadFilter();
    probes.set(ctx, probe);
  }
  probe.type = KINDS[st.o.kind].node;
  probe.frequency.value = st.p.f;
  probe.Q.value = st.p.q;
  const mag = new Float32Array(freqs.length);
  const ph = new Float32Array(freqs.length);
  probe.getFrequencyResponse(freqs, mag, ph);
  return Array.from(mag, (m) => 20 * Math.log10(Math.max(m, 1e-6)));
}
