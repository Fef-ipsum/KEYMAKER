// Schémas vivants — l'état d'un schéma, partagé par tous les types.
//
// Réglages arrondis avant d'être joués, son créé au premier geste, un seul son à la
// fois, missions vérifiées pendant que ça joue, inscription auprès de Sati.
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { stateFromSpec, clamp, summarize } from '../catalog.js';
import { createMissionRunner, missionsFor } from '../core/missions.js';
import * as audio from '../core/audio.js';
import { showSchema } from '../core/visible.js';

let seq = 0;

export function useSchema(def, spec, { ear = null, context = 'lecon' } = {}) {
  const idRef = useRef(null);
  if (!idRef.current) idRef.current = 'schema-' + ++seq;
  const id = idRef.current;
  const [st, setSt] = useState(() => stateFromSpec(spec));
  const stRef = useRef(st);
  stRef.current = st;
  const [playing, setPlaying] = useState(false);
  const [glow, setGlow] = useState({ k: null, n: 0 });
  const [bypass, setBypassState] = useState(false);
  const [mystery, setMysteryState] = useState(false);
  const mysteryRef = useRef(false);
  const target = useMemo(() => (ear ? ear.target : null), [ear]);
  const soundRef = useRef(null);
  const playingRef = useRef(false);

  // Missions (jamais dans une question d'écoute : là, on cherche, on ne s'exerce pas).
  const missionDefs = useMemo(() => {
    if (ear) return [];
    // Un type à plusieurs modes (clavier, effet) choisit ses missions par défaut selon le mode.
    return missionsFor(def, spec, stateFromSpec(spec));
  }, [def, spec, ear]);
  const runner = useMemo(() => createMissionRunner(missionDefs), [missionDefs]);
  const [done, setDone] = useState([]);
  const [fresh, setFresh] = useState(null);
  const extraRef = useRef({});

  // Ce que le son doit jouer : mes réglages, ou ceux du son mystère.
  const soundState = useCallback(() => (mysteryRef.current && target ? target : stRef.current), [target]);

  const check = useCallback(
    (extra = {}) => {
      if (!missionDefs.length) return;
      const s = stRef.current;
      const snap = { p: s.p, o: s.o, written: s.written, playing: playingRef.current && !mysteryRef.current, bypass, ...extraRef.current, ...extra };
      const got = runner.update(snap);
      if (got.length) {
        setDone([...runner.done]);
        setFresh(got[got.length - 1]);
      }
    },
    [runner, missionDefs, bypass],
  );

  const setParam = useCallback((k, v) => {
    const p = def.params[k];
    const q = p.q(clamp(v, p));
    setSt((s) => {
      if (s.p[k] === q && (s.written || !(def.writes ? def.writes.includes(k) : def.id === 'adsr'))) return s;
      return { ...s, p: { ...s.p, [k]: q }, written: (def.writes ? def.writes.includes(k) : def.id === 'adsr') ? true : s.written, implicit: (s.implicit || []).filter((x) => x !== k) };
    });
    setGlow((g) => ({ k, n: g.n + 1 }));
  }, [def]);

  // Un réglage est-il modifiable ? (question d'écoute : ceux à trouver ; leçon : `regler`)
  const map = useMemo(() => def.specKeys(spec) || {}, [def, spec]);
  const can = useCallback(
    (k) => {
      if (ear) return ear.adjust.includes(k);
      if (Array.isArray(spec.regler)) return spec.regler.some((c) => map[c] === k);
      return true;
    },
    [ear, spec, map],
  );

  // `glows` : l'option apparaît dans le code (onde…) → elle brille aussi.
  const setOption = useCallback((name, v, glows = false) => {
    setSt((s) => ({ ...s, o: { ...s.o, [name]: v } }));
    if (glows) setGlow((g) => ({ k: name, n: g.n + 1 }));
  }, []);

  const replace = useCallback((next, glowKey = null) => {
    setSt(next);
    if (glowKey) setGlow((g) => ({ k: glowKey, n: g.n + 1 }));
  }, []);

  // Le son suit chaque changement de réglage, même sur une note tenue.
  useEffect(() => {
    // Une erreur du son ne doit jamais casser l'affichage : le son continue, le dessin aussi.
    try {
      if (soundRef.current && soundRef.current.update) soundRef.current.update(soundState());
    } catch (e) {
      if (typeof console !== 'undefined') console.warn('[schéma] réglage non appliqué au son :', e && e.message);
    }
    check();
  }, [st]);
  useEffect(() => {
    check();
  }, [playing]);

  const ensureSound = useCallback(
    (factory) => {
      const ctx = audio.unlock();
      if (!soundRef.current) soundRef.current = factory(ctx, audio.output(ctx), soundState);
      return soundRef.current;
    },
    [soundState],
  );

  const stopSound = useCallback(() => {
    if (soundRef.current) soundRef.current.stop();
    playingRef.current = false;
    setPlaying(false);
    mysteryRef.current = false;
    setMysteryState(false);
  }, []);

  // Commencer à jouer : prend la sortie (coupe l'éditeur et les autres schémas).
  const claim = useCallback(() => {
    audio.claim(id, () => stopSound());
    playingRef.current = true;
    setPlaying(true);
  }, [id, stopSound]);
  const unclaim = useCallback(() => {
    stopSound();
    audio.release(id);
  }, [id, stopSound]);

  const setBypass = useCallback((on) => {
    setBypassState(on);
    if (soundRef.current && soundRef.current.bypass) soundRef.current.bypass(on);
  }, []);

  const setMystery = useCallback((on) => {
    mysteryRef.current = on;
    setMysteryState(on);
    if (soundRef.current && soundRef.current.update) soundRef.current.update(soundState());
  }, [soundState]);

  // Sati voit le schéma tant qu'il est à l'écran.
  useEffect(
    () =>
      showSchema(id, () => {
        const s = stRef.current;
        const where = { lecon: 'dans la leçon', wiki: 'dans le wiki', chat: 'dans la conversation', revue: 'sur la page de revue', oreille: 'dans une question « retrouve le réglage »' }[context] || '';
        return 'Schéma ' + where + ' : ' + summarize(def.toSpec(s), s) + (playingRef.current ? ' · en train de jouer' : ' · à l’arrêt');
      }),
    [id, def, context],
  );

  // Démontage : on coupe le son et on rend la sortie.
  useEffect(
    () => () => {
      if (soundRef.current) {
        try {
          soundRef.current.dispose();
        } catch {
          /* ignore */
        }
      }
      audio.release(id);
    },
    [id],
  );

  return {
    id,
    st,
    stRef,
    setParam,
    setOption,
    can,
    replace,
    playing,
    playingRef,
    claim,
    unclaim,
    ensureSound,
    sound: soundRef,
    glow,
    bypass,
    setBypass,
    mystery,
    setMystery,
    target,
    missions: missionDefs,
    done,
    fresh,
    check,
    extraRef,
  };
}
