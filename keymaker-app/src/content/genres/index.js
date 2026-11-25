// Registre des genres.
//
// AJOUTER UN GENRE : créer un fichier sur le modèle de techno.js (huit traits,
// dans l'ordre d'ASPECTS), l'importer ici et l'ajouter à la liste. Il apparaît
// alors dans la liste des genres, dans le comparateur et dans les tests
// automatiques, sans toucher au code de l'interface.

import techno from './techno.js';
import acid from './acid.js';
import trance from './trance.js';
import progressive from './progressive.js';
import synthpop from './synthpop.js';
import house from './house.js';
import dnb from './dnb.js';
import ambient from './ambient.js';

// Les huit traits, toujours dans cet ordre : c'est ce qui rend les genres comparables.
export const ASPECTS = [
  { id: 'tempo', label: 'Tempo', question: 'À quelle vitesse ?' },
  { id: 'kick', label: 'Kick', question: 'Quelle grosse caisse, et où ?' },
  { id: 'basse', label: 'Basse', question: 'Que fait la basse ?' },
  { id: 'hats', label: 'Charlestons et groove', question: 'Qu’est-ce qui donne l’élan ?' },
  { id: 'harmonie', label: 'Harmonie et gammes', question: 'Quelles notes, quels accords ?' },
  { id: 'timbres', label: 'Timbres et synthés', question: 'Quels sons ?' },
  { id: 'structure', label: 'Structure', question: 'Comment le morceau avance-t-il ?' },
  { id: 'histoire', label: 'Histoire', question: 'D’où ça vient ?' },
];

export const genres = [techno, acid, trance, progressive, synthpop, house, dnb, ambient];

// Zone de tempo affichée ; bpmLabel la remplace pour un genre sans tempo type (ambient).
export const bpmText = (g) => g.bpmLabel || g.bpm[0] + '–' + g.bpm[1] + ' BPM';

export const genreById = Object.fromEntries(genres.map((g) => [g.id, g]));

// Identifiant de progression d'un trait : « g.techno.kick ».
export const traitId = (genreId, aspect) => `g.${genreId}.${aspect}`;

export function traitOf(genreId, aspect) {
  const g = genreById[genreId];
  return g ? g.traits.find((t) => t.aspect === aspect) : null;
}

// Familles, pour regrouper la liste.
export function families() {
  const out = [];
  for (const g of genres) {
    let f = out.find((x) => x.name === g.family);
    if (!f) out.push((f = { name: g.family, genres: [] }));
    f.genres.push(g);
  }
  return out;
}
