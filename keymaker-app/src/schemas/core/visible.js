// Schémas vivants — ce qui est à l'écran en ce moment (pour le contexte de Sati).
// Chaque schéma monté s'inscrit ici avec une fonction qui décrit son état courant.
const shown = new Map(); // id → () => texte

export function showSchema(id, describe) {
  shown.set(id, describe);
  return () => shown.delete(id);
}
export function visibleSchemas() {
  const out = [];
  for (const fn of shown.values()) {
    try {
      const t = fn();
      if (t) out.push(t);
    } catch {
      /* ignore */
    }
  }
  return out;
}
