// Chantier 31 — tests du cœur PUR syncCore.js (aucune dépendance).
import {
  BEATS_PER_CYCLE, PPQN, PULSES_PER_CYCLE,
  cpsToBpm, bpmToCps, pulseHz, pulsePeriod,
  nextPulseIndex, pulseTime, pulsesInWindow, bpmLabel,
} from '../keymaker-app/src/syncCore.js';

let pass = 0, fail = 0;
const approx = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
function ok(name, cond) { if (cond) { pass++; } else { fail++; console.log('  ✗ ' + name); } }

// --- constantes ---
ok('BEATS_PER_CYCLE=4', BEATS_PER_CYCLE === 4);
ok('PPQN=2', PPQN === 2);
ok('PULSES_PER_CYCLE=8', PULSES_PER_CYCLE === 8);

// --- cps <-> BPM (convention 4/4) ---
ok('cpsToBpm(0.5)=120', approx(cpsToBpm(0.5), 120));
ok('cpsToBpm(0.55)=132', approx(cpsToBpm(0.55), 132));
ok('bpmToCps(120)=0.5', approx(bpmToCps(120), 0.5));
ok('round-trip 124 BPM', approx(cpsToBpm(bpmToCps(124)), 124, 1e-9));
ok('cpsToBpm(0)=0', cpsToBpm(0) === 0);
ok('cpsToBpm(-1)=0', cpsToBpm(-1) === 0);
ok('cpsToBpm(NaN)=0', cpsToBpm(NaN) === 0);
ok('bpmLabel(0.5)=120', bpmLabel(0.5) === 120);
ok('bpmLabel(0.51667)≈124', bpmLabel(124 / 240) === 124);

// --- débit de pulses ---
ok('pulseHz(0.5)=4 (120 BPM → 4 clics/s)', approx(pulseHz(0.5), 4));
ok('pulseHz = (BPM/60)*PPQN', approx(pulseHz(0.5), (120 / 60) * 2));
ok('pulsePeriod(0.5)=0.25 s', approx(pulsePeriod(0.5), 0.25));
ok('pulseHz(0)=0', pulseHz(0) === 0);
ok('pulsePeriod(0)=0', pulsePeriod(0) === 0);

// --- nextPulseIndex ---
ok('next @ cycle 0 = 0', nextPulseIndex(0) === 0);
ok('next @ 0.01 = 1', nextPulseIndex(0.01) === 1);
ok('next @ 0.125 = 1 (pile sur le clic)', nextPulseIndex(0.125) === 1);
ok('next @ 0.13 = 2', nextPulseIndex(0.13) === 2);
ok('next @ 1.0 = 8 (début cycle 2)', nextPulseIndex(1.0) === 8);
ok('next @ 0.999 = 8', nextPulseIndex(0.999) === 8);
ok('next(NaN)=0', nextPulseIndex(NaN) === 0);

// --- pulseTime ---
ok('pulseTime idx0 @ now0/audio10 = 10', approx(pulseTime(0, 0, 10, 0.5), 10));
ok('pulseTime idx1 = 10.25 (1 clic = 0.25s)', approx(pulseTime(1, 0, 10, 0.5), 10.25));
ok('pulseTime idx8 = 12 (1 cycle = 2s @ cps .5)', approx(pulseTime(8, 0, 10, 0.5), 12));
ok('pulseTime cps<=0 -> null', pulseTime(1, 0, 10, 0) === null);

// --- pulsesInWindow ---
let w = pulsesInWindow({ nowCycle: 0, audioNow: 10, cps: 0.5, horizon: 0.3, lastIdx: null });
ok('window 0.3s @120BPM → 2 clics (idx0,1)', w.times.length === 2 && w.times[0].idx === 0 && w.times[1].idx === 1);
ok('window espacement = 0.25s', approx(w.times[1].t - w.times[0].t, 0.25));
ok('window lastIdx=1', w.lastIdx === 1);

// pas de doublon : tick suivant repart à idx2
let w2 = pulsesInWindow({ nowCycle: 0.25, audioNow: 10.5, cps: 0.5, horizon: 0.3, lastIdx: 1 });
ok('tick suivant: pas de doublon (idx>=2)', w2.times.every((p) => p.idx >= 2));
ok('tick suivant: 1er clic idx2', w2.times[0] && w2.times[0].idx === 2);

// horizon nul → rien (ou clic pile sur now au plus)
let w3 = pulsesInWindow({ nowCycle: 0.13, audioNow: 5, cps: 0.5, horizon: 0, lastIdx: null });
ok('horizon 0 → <=1 clic', w3.times.length <= 1);

// cps invalide → vide, lastIdx préservé
let w4 = pulsesInWindow({ nowCycle: 0, audioNow: 1, cps: 0, horizon: 1, lastIdx: 7 });
ok('cps=0 → aucun clic, lastIdx préservé', w4.times.length === 0 && w4.lastIdx === 7);

// densité : sur 1 s pleine à 120 BPM → 4 clics
let w5 = pulsesInWindow({ nowCycle: 0, audioNow: 0, cps: 0.5, horizon: 1 - 1e-9, lastIdx: null });
ok('1 s @120BPM → 4 clics', w5.times.length === 4);

// tempo techno 132 BPM (cps .55) : période ≈ 0.2273 s, ~ pulseHz 4.4
ok('132 BPM → pulseHz≈4.4', approx(pulseHz(0.55), 4.4, 1e-9));

console.log(`\nsyncCore : ${pass}/${pass + fail} tests OK` + (fail ? ` (${fail} échec(s))` : ''));
if (fail) process.exitCode = 1;

// --- simulation : la boucle du contrôleur (ticks 30 ms, lookahead 120 ms) ---
// On rejoue ce que fait PoSync.jsx : à chaque tick, lire (nowCycle, audioNow) et
// planifier la fenêtre, en passant lastIdx pour éviter les doublons.
{
  let p2 = 0, f2 = 0;
  const ok2 = (n, c) => { if (c) p2++; else { f2++; console.log('  ✗ ' + n); } };
  const cps = 0.5, TICK = 0.03, HORIZON = 0.12, DUR = 2.0; // 120 BPM
  let lastIdx = null; const fired = [];
  for (let t = 0; t <= DUR + 1e-9; t += TICK) {
    const r = pulsesInWindow({ nowCycle: t * cps, audioNow: t, cps, horizon: HORIZON, lastIdx });
    for (const p of r.times) fired.push(p);
    lastIdx = r.lastIdx;
  }
  const idxs = fired.map((p) => p.idx);
  ok2('sim: démarre à idx 0', idxs[0] === 0);
  ok2('sim: index strictement croissants (aucun doublon)', idxs.every((v, i) => i === 0 || v > idxs[i - 1]));
  ok2('sim: index contigus (aucun trou)', idxs.every((v, i) => i === 0 || v === idxs[i - 1] + 1));
  ok2('sim: ~8 clics sur 2 s à 120 BPM', idxs.length >= 8 && idxs.length <= 10);
  let space = true;
  for (let i = 1; i < fired.length; i++) if (Math.abs((fired[i].t - fired[i - 1].t) - 0.25) > 1e-9) space = false;
  ok2('sim: espacement constant 0,25 s (2 PPQN)', space);
  // changement de tempo en cours de route : passe à 0.55 (132 BPM) → cadence resserrée
  let li = null; const f2s = [];
  for (let t = 0; t <= 1 + 1e-9; t += TICK) { const r = pulsesInWindow({ nowCycle: t * 0.55, audioNow: t, cps: 0.55, horizon: HORIZON, lastIdx: li }); for (const p of r.times) f2s.push(p); li = r.lastIdx; }
  ok2('sim: 132 BPM → plus de clics que 120 sur 1 s', f2s.length >= 4);
  console.log(`simulation contrôleur : ${p2}/${p2 + f2} OK` + (f2 ? ` (${f2} échec)` : ''));
  if (f2) process.exitCode = 1;
}
