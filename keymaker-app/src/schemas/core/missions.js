// Schémas vivants — les missions : deux ou trois défis courts, validés tout seuls
// pendant que le son joue. Une mission réussie fait apparaître une phrase de
// compréhension. Rien ne bloque, rien ne se perd, aucun chronomètre.
//
// Une mission : { id, text, learned, test(snap, mem) → bool }
//   snap = { p (réglages), o (options), playing, holding, heldFor, event, ... }
//   mem  = un petit carnet propre à la mission (pour « d'abord ceci, puis cela »).

export function createMissionRunner(defs) {
  const done = new Set();
  const mem = {};
  return {
    done,
    update(snap) {
      const fresh = [];
      for (const m of defs) {
        if (done.has(m.id)) continue;
        mem[m.id] = mem[m.id] || {};
        let ok = false;
        try {
          ok = !!m.test(snap, mem[m.id]);
        } catch {
          ok = false;
        }
        if (ok) {
          done.add(m.id);
          fresh.push(m.id);
        }
      }
      return fresh;
    },
  };
}

// Les missions d'un schéma déclaré : celles nommées par les données (`missions`), sinon
// celles de son mode (types à plusieurs modes : `modeMissions`, mode lu par `modeOf`),
// sinon celles par défaut. Même choix dans l'app (useSchema) et dans le banc de test.
export function missionsFor(def, spec, st) {
  const mode = def.modeOf ? def.modeOf(st) : st.o.mode;
  const ids = spec.missions ?? (def.modeMissions ? def.modeMissions[mode] : undefined);
  return pickMissions(def, ids);
}

// Choisit les missions d'un schéma : celles nommées par les données, sinon celles par défaut.
export function pickMissions(def, ids) {
  const all = def.missions || [];
  const want = Array.isArray(ids) ? ids : def.defaultMissions || all.map((m) => m.id);
  return want.map((id) => all.find((m) => m.id === id)).filter(Boolean);
}
