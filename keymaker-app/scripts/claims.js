// Affirmations du contenu sur le comportement du moteur, vérifiées par check-claims.mjs.
//
// motif     : { id, kind: 'motif', code, cycles?, fields?, expect?: [ligne par cycle],
//               sameAs?: { code, offset? }, differsFrom?: { code }, log?, cites: [ids] }
//             Sans `fields`, chaque événement s'écrit par sa note (ou n, ou s). Avec
//             `fields`, par ces champs séparés par « / » (`b` = instant dans le cycle).
//             cps : tempo attendu (cycles/s) ; countBetween : [min, max] événements au total.
//             never / some : { champ: true | [valeurs], … } — aucun / au moins un événement
//             (sur tous les cycles) ne remplit TOUTES ces conditions à la fois.
// empreinte : { id, kind: 'empreinte', has?: [extraits], order?: [extraits], cites }
//             Extraits du code source du moteur embarqué (public/vendor/strudel-repl).
//
// AJOUTER : dès qu'un texte affirme un comportement précis du moteur (« vérifié dans le
// moteur », une valeur par défaut, un ordre, un plafond…), ajouter ici l'affirmation et
// citer l'entrée. Les ids cités doivent exister (wiki, étape, ou trait de genre g.<genre>.<aspect>).

const r3 = (x) => Math.round(x * 1000) / 1000;
const grid = (n, f) => Array.from({ length: n }, (_, i) => f(i, r3(i / n))).join(' ');

export const claims = [
  /* ---------------- Temps : transformations par cycle ---------------- */
  { id: 'firstOf-premier-cycle', kind: 'motif', code: 'n("0 1 2 3").firstOf(4, x=>x.add(n(10)))', cycles: 4, expect: ['10 11 12 13', '0 1 2 3', '0 1 2 3', '0 1 2 3'], cites: ['fn.firstOf', 'L5.5.22'] },
  { id: 'lastOf-dernier-cycle', kind: 'motif', code: 'n("0 1 2 3").lastOf(4, x=>x.add(n(10)))', cycles: 4, expect: ['0 1 2 3', '0 1 2 3', '0 1 2 3', '10 11 12 13'], cites: ['fn.lastOf', 'f.tous-les'] },
  { id: 'chunk-sens', kind: 'motif', code: 'n("0 1 2 3").chunk(4, x=>x.add(n(10)))', cycles: 4, expect: ['10 1 2 3', '0 11 2 3', '0 1 12 3', '0 1 2 13'], cites: ['L5.5.23'] },
  { id: 'chunkBack-sens', kind: 'motif', code: 'n("0 1 2 3").chunkBack(4, x=>x.add(n(10)))', cycles: 4, expect: ['10 1 2 3', '0 1 2 13', '0 1 12 3', '0 11 2 3'], cites: ['L5.5.23'] },
  { id: 'iter-sens', kind: 'motif', code: 'n("0 1 2 3").iter(4)', cycles: 4, expect: ['0 1 2 3', '1 2 3 0', '2 3 0 1', '3 0 1 2'], cites: ['voc.code.iter-n', 'L5.5.8'] },
  { id: 'palindrome-alterne', kind: 'motif', code: 'n("0 1 2").palindrome()', cycles: 2, expect: ['0 1 2', '2 1 0'], cites: ['fn.rev', 'L5.5.7'] },
  { id: 'ply-sur-place', kind: 'motif', code: 'n("0 1").ply(2)', fields: ['n', 'b'], expect: ['0/0 0/0.25 1/0.5 1/0.75'], cites: ['fn.ply'] },
  { id: 'rev-fast-commutent', kind: 'motif', code: 'n("0 1 2 3").rev().fast(2)', cycles: 2, sameAs: { code: 'n("0 1 2 3").fast(2).rev()' }, cites: ['L5.5.2'] },
  { id: 'slow-rev-ne-commutent-pas', kind: 'motif', code: 'n("0 1 2 3 4 5 6 7").slow(2).rev()', cycles: 2, expect: ['3 2 1 0', '7 6 5 4'], differsFrom: { code: 'n("0 1 2 3 4 5 6 7").rev().slow(2)' }, cites: ['L5.5.2', 'L5.5.21'] },
  { id: 'add-rev-commutent', kind: 'motif', code: 'note("c e g b").add(note("<0 3 5>")).rev()', cycles: 3, sameAs: { code: 'note("c e g b").rev().add(note("<0 3 5>"))' }, cites: ['L5.5.21'] },
  { id: 'slow-etale', kind: 'motif', code: 'n("0 1 2 3").slow(2)', cycles: 2, expect: ['0 1', '2 3'], cites: ['fn.slow', 'f.vitesse'] },

  /* ---------------- Rythme ---------------- */
  { id: 'euclid-3-8', kind: 'motif', code: 's("bd").euclid(3,8)', fields: ['b'], expect: ['0 0.375 0.75'], cites: ['fn.euclid', 'mini.euclide', 'f.euclide'] },
  { id: 'euclidRot-droite', kind: 'motif', code: 's("bd").euclidRot(3,8,1)', fields: ['b'], expect: ['0.125 0.5 0.875'], cites: ['fn.euclid'] },
  { id: 'euclide-rotation-mini', kind: 'motif', code: 's("bd(3,8,2)")', fields: ['b'], expect: ['0 0.25 0.625'], cites: ['f.euclide', 'L5.5.9b'] },
  { id: 'swing-4-ternaire', kind: 'motif', code: 's("hh*8").swing(4)', fields: ['b'], expect: ['0 0.167 0.25 0.417 0.5 0.667 0.75 0.917'], cites: ['voc.structure.swing', 'L7.7.2', 'g.house.hats'] },
  { id: 'swing-8-sans-effet', kind: 'motif', code: 's("hh*8").swing(8)', fields: ['b'], expect: ['0 0.125 0.25 0.375 0.5 0.625 0.75 0.875'], cites: ['L7.7.2'] },
  { id: 'struct-valeurs', kind: 'motif', code: 'note("c3 e3 g3 b3").struct("x ~ x x")', expect: ['c3 g3 b3'], cites: ['fn.struct'] },
  { id: 'seq-compresse', kind: 'motif', code: 'seq(note("c3 e3"), note("g3"))', fields: ['note', 'b'], expect: ['c3/0 e3/0.25 g3/0.5'], cites: ['fn.cat'] },
  { id: 'cat-un-par-cycle', kind: 'motif', code: 'cat(note("c3 e3"), note("g3"))', cycles: 2, expect: ['c3 e3', 'g3'], cites: ['fn.cat'] },
  { id: 'arrange-durees', kind: 'motif', code: 'arrange([2, note("c3")], [1, note("g3")])', cycles: 3, expect: ['c3', 'c3', 'g3'], cites: ['fn.arrange'] },
  { id: 'chevrons-fois-2', kind: 'motif', code: 'note("<e2 e2 g2 a2>*2")', cycles: 2, expect: ['e2 e2', 'g2 a2'], cites: ['L3.3.10'] },
  { id: 'pick-tenir', kind: 'motif', code: '"<0@2 1@2>".pick([note("c3"), note("g3")])', cycles: 4, expect: ['c3', 'c3', 'g3', 'g3'], cites: ['L6.6.14'] },
  { id: 'polymetre-pas-commun', kind: 'motif', code: 'note("{c3 e3, g3 b3 d4}")', cycles: 2, expect: ['c3 g3 b3 e3', 'c3 d4 e3 g3'], cites: ['voc.rythme.polymetre', 'L7.7.23b'] },
  { id: 'exclamation-recopie', kind: 'motif', code: 's("bd ! sd")', fields: ['s', 'b'], expect: ['bd/0 bd/0.333 sd/0.667'], cites: ['mini.exclamation'] },

  /* ---------------- Hasard ---------------- */
  { id: 'seed-decale', kind: 'motif', code: 's("hh*16").degradeBy(.4).seed(3)', fields: ['b'], cycles: 2, sameAs: { code: 's("hh*16").degradeBy(.4)', offset: 3 }, cites: ['voc.aleatoire.graine'] },
  { id: 'ribbon-boucle', kind: 'motif', code: 'n(irand(8).segment(8)).ribbon(5, 2)', cycles: 2, sameAs: { code: 'n(irand(8).segment(8))', offset: 5 }, cites: ['voc.aleatoire.ribbon-n-len', 'L5.5.12'] },
  { id: 'ribbon-repete', kind: 'motif', code: 'n(irand(8).segment(8)).ribbon(5, 2).early(2)', cycles: 2, sameAs: { code: 'n(irand(8).segment(8)).ribbon(5, 2)' }, cites: ['voc.aleatoire.ribbon-n-len'] },

  /* ---------------- Hasard : deux tirages dans la même chaîne ---------------- */
  { id: 'hasard-degrade-sometimes-lies', kind: 'motif', code: 's("hh*8").degradeBy(.3).sometimesBy(.3, x=>x.speed(2))', cycles: 64, never: { speed: true }, cites: ['fn.sometimes', 'fn.degradeBy', 'L5.5.14', 'L5.5.15'] },
  { id: 'hasard-seed-separe', kind: 'motif', code: 's("hh*8").degradeBy(.3).seed(1).sometimesBy(.3, x=>x.speed(2))', cycles: 16, some: { speed: true }, cites: ['voc.aleatoire.graine', 'L5.5.14', 'L5.5.15', 'L5.5.25'] },
  { id: 'hasard-seed-en-fin-lie-tout', kind: 'motif', code: 's("hh*8").degradeBy(.3).sometimesBy(.3, x=>x.speed(2)).seed(1)', cycles: 64, never: { speed: true }, cites: ['voc.aleatoire.graine'] },
  { id: 'hasard-irand-degrade-lies', kind: 'motif', code: 'n(irand(8).segment(4)).degradeBy(.4)', cycles: 128, never: { n: [0, 1, 2] }, cites: ['L7.7.23'] },
  { id: 'hasard-irand-degrade-separes', kind: 'motif', code: 'n(irand(8).segment(4)).seed(1).degradeBy(.4)', cycles: 32, some: { n: [0] }, cites: ['L7.7.23', 'L7.7.25'] },
  { id: 'hasard-irand-degrade-5', kind: 'motif', code: 'n(irand(8).segment(2)).degradeBy(.5)', cycles: 128, never: { n: [0, 1, 2, 3] }, cites: ['L7.7.25'] },
  { id: 'hasard-irand-sometimes-lies', kind: 'motif', code: 'n(irand(8).segment(8)).sometimes(x=>x.speed(2))', cycles: 64, never: { n: [4, 5, 6, 7], speed: true }, cites: ['voc.aleatoire.generatif'] },
  { id: 'hasard-irand-sometimes-separes', kind: 'motif', code: 'n(irand(8).segment(8)).seed(1).sometimes(x=>x.speed(2))', cycles: 16, some: { n: [7], speed: true }, cites: ['voc.aleatoire.generatif'] },
  { id: 'hasard-choose-degrade-lies', kind: 'motif', code: 'n(choose(0,1,2,3).segment(4)).degradeBy(.5)', cycles: 64, never: { n: [0, 1] }, cites: ['fn.sometimes'] },
  { id: 'hasard-interrogation-sometimes-lies', kind: 'motif', code: 'n("0*8?").sometimes(x=>x.speed(2))', cycles: 64, never: { speed: true }, cites: ['fn.sometimes'] },

  /* ---------------- Copies et échos écrits ---------------- */
  { id: 'echo-gains', kind: 'motif', code: 'note("c3").echo(3, 1/8, .5)', fields: ['gain'], expect: ['1 0.5 0.25'], cites: ['fn.echo'] },
  { id: 'stut-ordre-arguments', kind: 'motif', code: 'note("c3").stut(3, .5, 1/8)', fields: ['gain', 'b'], expect: ['1/0 0.5/0.125 0.25/0.25'], cites: ['fn.echo'] },
  { id: 'echoWith-sans-cumul', kind: 'motif', code: 'note("c3 ~ ~ ~ ~ ~ ~ ~").echoWith(3, 1/8, x => x.add(note(7)))', expect: ['55 55 55'], cites: ['fn.echo', 'L5.5.18'] },
  { id: 'layer-sans-original', kind: 'motif', code: 'note("c3").layer(x=>x.add(note(7)), x=>x.add(note(12)))', expect: ['55 60'], cites: ['fn.superimpose', 'L5.5.16'] },
  { id: 'superimpose-degres', kind: 'motif', code: 'n("0 2 4 6".superimpose(x=>x.add(2))).scale("C:major")', expect: ['C3 E3 E3 G3 B3 G3 B3 D4'], cites: ['L5.5.16'] },
  { id: 'off-sur-noms', kind: 'motif', code: '"c3 eb3 g3".off(1/8, x=>x.add(7)).note()', expect: ['c3 55 eb3 58 g3 62'], cites: ['L5.5.17'] },
  { id: 'jux-gauche-droite', kind: 'motif', code: 'note("c3 e3").jux(rev)', fields: ['note', 'pan'], expect: ['c3/0 e3/1 c3/1 e3/0'], cites: ['fn.jux'] },
  { id: 'jux-decale-le-pan', kind: 'motif', code: 'note("c3").pan(.2).jux(rev)', fields: ['pan'], expect: ['-0.3 0.7'], cites: ['fn.jux', 'L4.4.23'] },

  /* ---------------- Hauteurs, gammes, accords ---------------- */
  { id: 'add-nombre-nu', kind: 'motif', code: 'note("c3").add(12)', expect: ['c3'], log: 'arithmetic on control pattern', cites: ['fn.add'] },
  { id: 'add-note-12', kind: 'motif', code: 'note("c3").add(note(12))', expect: ['60'], cites: ['fn.add', 'f.echo-decale'] },
  { id: 'scale-octaves', kind: 'motif', code: 'n("0 7 -1 9").scale("C:major")', expect: ['C3 C4 B2 E4'], cites: ['fn.scale', 'fn.n'] },
  { id: 'scale-enleve-n', kind: 'motif', code: 'n("0 2").scale("C4:minor").s("supersaw")', fields: ['note', 'n'], expect: ['C4/ Eb4/'], cites: ['son.supersaw'] },
  { id: 'transpose-intervalle', kind: 'motif', code: 'note("c3 e3").transpose("<3 3M>")', cycles: 2, expect: ['Eb3 G3', 'E3 G#3'], cites: ['fn.transpose'] },
  { id: 'scaleTranspose-degre', kind: 'motif', code: 'n("0 2").scale("C:major").scaleTranspose(1)', expect: ['D3 F3'], cites: ['fn.transpose'] },
  { id: 'voicing-C-5-notes', kind: 'motif', code: 'chord("C").voicing()', expect: ['C4 C5 E3 E4 G4'], cites: ['fn.voicing', 'fn.arp', 'f.grille'] },
  { id: 'voicing-anchor', kind: 'motif', code: 'chord("C").anchor("g5").voicing()', expect: ['C4 C5 E5 G4 G5'], cites: ['fn.voicing'] },
  { id: 'rootNotes-octave', kind: 'motif', code: 'chord("C Am").rootNotes(2)', expect: ['C2 A2'], cites: ['fn.rootNotes'] },
  { id: 'arp-positions', kind: 'motif', code: 'chord("C").voicing().arp("0 1 2 3 4")', expect: ['E3 C4 E4 G4 C5'], cites: ['fn.arp'] },
  { id: 'accords-muets', kind: 'motif', code: 'chord("<Cmaj7 Csus4 Csus2 Cdim>").voicing()', cycles: 4, expect: ['', '', '', ''], cites: ['fn.chord', 'f.grille'] },
  { id: 'accords-reconnus', kind: 'motif', code: 'chord("<C^7 Csus Co Caug>").voicing()', cycles: 4, expect: ['B4 C3 E4 G4', 'C4 C5 F4 G4', 'C4 C5 Eb3 Eb4 Gb4', 'Ab4 C4 C5 E3 E4'], cites: ['fn.chord', 'f.grille'] },

  /* ---------------- Signaux ---------------- */
  { id: 'sine-forme', kind: 'motif', code: 's("bd*4").pan(sine)', fields: ['pan'], expect: ['0.5 1 0.5 0'], cites: ['fn.signaux'] },
  { id: 'cosine-forme', kind: 'motif', code: 's("bd*4").pan(cosine)', fields: ['pan'], expect: ['1 0.5 0 0.5'], cites: ['fn.signaux'] },
  { id: 'saw-forme', kind: 'motif', code: 's("bd*4").pan(saw)', fields: ['pan'], expect: ['0 0.25 0.5 0.75'], cites: ['fn.signaux'] },
  { id: 'tri-forme', kind: 'motif', code: 's("bd*4").pan(tri)', fields: ['pan'], expect: ['0 0.5 1 0.5'], cites: ['fn.signaux'] },
  { id: 'square-forme', kind: 'motif', code: 's("bd*4").pan(square)', fields: ['pan'], expect: ['0 0 1 1'], cites: ['fn.signaux'] },
  { id: 'rangex-geometrique', kind: 'motif', code: 's("bd*4").pan(sine.rangex(100, 1000))', fields: ['pan'], expect: ['316.228 1000 316.228 100'], cites: ['fn.range'] },
  { id: 'signal-lu-au-debut', kind: 'motif', code: 'note("c2").lpf(saw.range(0, 1000))', fields: ['cutoff'], expect: ['0'], cites: ['fn.signaux', 'f.signal'] },

  /* ---------------- Pistes ---------------- */
  { id: 'derniere-expression', kind: 'motif', code: 'note("c2")\nnote("e4")', expect: ['e4'], cites: ['fn.dollar'] },
  { id: 'pistes-nommees', kind: 'motif', code: 'basse: note("c2")\nlead: note("e4")', expect: ['c2 e4'], cites: ['fn.dollar', 'L6.6.2'] },
  { id: 'piste-coupee', kind: 'motif', code: 'drums$: s("bd*2")\n_bass$: note("c2")', fields: ['s'], expect: ['bd bd'], cites: ['L6.6.3', 'f.pistes'] },
  { id: 'all-toutes-pistes', kind: 'motif', code: '$: s("bd")\nall(x => x.room(.3))', fields: ['room'], expect: ['0.3'], cites: ['L6.6.4'] },

  /* ---------------- Formes courtes des réglages ---------------- */
  { id: 'delay-forme-courte', kind: 'motif', code: 's("bd").delay(".5:.25:.6")', fields: ['delay', 'delaytime', 'delayfeedback'], expect: ['0.5/0.25/0.6'], cites: ['fx.delay'] },
  { id: 'distort-forme-courte', kind: 'motif', code: 's("bd").distort("1.5:.6")', fields: ['distort', 'distortvol'], expect: ['1.5/0.6'], cites: ['fx.distort'] },
  { id: 'phaser-forme-courte', kind: 'motif', code: 'note("c3").phaser("2:.8:1000:2000")', fields: ['phaserrate', 'phaserdepth', 'phasercenter', 'phasersweep'], expect: ['2/0.8/1000/2000'], cites: ['fx.phaser'] },
  { id: 'vib-forme-courte', kind: 'motif', code: 'note("c4").vib("5:.3")', fields: ['vib', 'vibmod'], expect: ['5/0.3'], cites: ['fx.vib'] },
  { id: 'fm-est-fmi', kind: 'motif', code: 'note("c3").fm("4")', fields: ['fmi'], expect: ['4'], cites: ['fx.fm'] },
  // Au premier ▶ (orbites neuves), duck(2) cherche l'orbit 2 au moment du coup : si la piste
  // .orbit(2) est écrite APRÈS le kick, le premier coup ne la trouve pas et ne fait rien plonger.
  { id: 'duck-orbite-avant', kind: 'motif', play: 900, code: 'setcpm(124/4)\n$: sound("bd*4").duck(2)\n$: note("c3").sound("sawtooth").orbit(2)', log: 'duck target orbit 2 does not exist', cites: ['fx.duck'] },
  { id: 'duck-orbite-ecrite-avant', kind: 'motif', play: 900, code: 'setcpm(124/4)\n$: note("c3").sound("sawtooth").orbit(2)\n$: sound("bd*4").duck(2)', noLog: true, cites: ['fx.duck', 'genre.sidechain', 'g.trance.kick'] },
  { id: 'duck-plusieurs', kind: 'motif', code: 's("bd").duck("2:3")', fields: ['duckorbit'], expect: ['2,3'], cites: ['fx.duck'] },
  { id: 's-nom-variante-gain', kind: 'motif', code: 's("square:0:.5")', fields: ['s', 'n', 'gain'], expect: ['square/0/0.5'], cites: ['L6.6.19'] },
  { id: 'lpf-forme-courte', kind: 'motif', code: 'note("c2").lpf("800:12")', fields: ['cutoff', 'resonance'], expect: ['800/12'], cites: ['fx.lpf', 'fx.lpq'] },
  { id: 'adsr-deux-valeurs', kind: 'motif', code: 'note("c3").adsr(".01:.2")', fields: ['attack', 'decay', 'sustain'], expect: ['0.01/0.2/'], cites: ['fx.adsr'] },

  /* ---------------- Quiz : ce que la bonne réponse affirme ---------------- */
  { id: 'q-un-son', kind: 'motif', code: 'sound("hh*4")', expect: ['hh hh hh hh'], cites: ['f.un-son'] },
  { id: 'q-premier-beat', kind: 'motif', code: 'setcpm(100/4)\n$: sound("bd bd bd bd")\n$: sound("~ cp ~ cp")', fields: ['s', 'b'], expect: ['bd/0 bd/0.25 cp/0.25 bd/0.5 bd/0.75 cp/0.75'], cites: ['f.premier-beat'] },
  { id: 'q-silence', kind: 'motif', code: 'sound("bd ~ ~ sd")', expect: ['bd sd'], cites: ['f.silence'] },
  { id: 'q-etoile', kind: 'motif', code: 'sound("bd*2, hh*8")', expect: ['bd hh hh hh hh bd hh hh hh hh'], cites: ['f.etoile'] },
  { id: 'q-crochets', kind: 'motif', code: 'sound("bd [sd sd] hh")', fields: ['s', 'b'], expect: ['bd/0 sd/0.333 sd/0.5 hh/0.667'], cites: ['f.crochets'] },
  { id: 'q-chevrons', kind: 'motif', code: 'sound("<bd sd hh>")', cycles: 4, expect: ['bd', 'sd', 'hh', 'bd'], cites: ['f.chevrons'] },
  { id: 'q-durees', kind: 'motif', code: 'sound("hh!3 sd")', fields: ['s', 'b'], sameAs: { code: 'sound("hh hh hh sd")' }, cites: ['f.durees'] },
  { id: 'q-durees-arobase', kind: 'motif', code: 'sound("hh@3 sd")', fields: ['s', 'b'], expect: ['hh/0 sd/0.75'], cites: ['f.durees'] },
  { id: 'q-hauteur', kind: 'motif', code: 'note("g3 c3").sound("piano").slow(2)', cycles: 2, expect: ['g3', 'c3'], cites: ['f.hauteur'] },
  { id: 'q-octave-defaut', kind: 'motif', code: 'note("c c3 c4").add(note(0))', expect: ['48 48 60'], cites: ['f.octave'] },
  { id: 'q-gamme', kind: 'motif', code: 'n("0 1 2").scale("C:major")', expect: ['C3 D3 E3'], cites: ['f.gamme'] },
  { id: 'q-mineur', kind: 'motif', code: 'n("0 1 2 3 4 3 2 1").scale("C4:minor")', expect: ['C4 D4 Eb4 F4 G4 F4 Eb4 D4'], cites: ['f.majeur-mineur'] },
  { id: 'q-majeur', kind: 'motif', code: 'n("0 1 2 3 4 3 2 1").scale("C4:major")', expect: ['C4 D4 E4 F4 G4 F4 E4 D4'], cites: ['f.majeur-mineur'] },
  { id: 'q-arpege', kind: 'motif', code: 'note("[c4,e4,g4]").arp("0 1 2 1")', fields: ['note', 'b'], expect: ['c4/0 e4/0.25 g4/0.5 e4/0.75'], cites: ['f.arpege'] },
  { id: 'q-rootNotes', kind: 'motif', code: 'chord("<Am F C G>").rootNotes(2)', cycles: 4, expect: ['A2', 'F2', 'C2', 'G2'], cites: ['f.harmonie'] },
  { id: 'q-gain-chevrons', kind: 'motif', code: 's("bd").gain("<1 .5>")', cycles: 2, fields: ['gain'], expect: ['1', '0.5'], cites: ['f.variation'] },
  { id: 'q-mask', kind: 'motif', code: 's("bd").mask("<1 1 1 0>")', cycles: 4, expect: ['bd', 'bd', 'bd', ''], cites: ['f.entrees'] },
  { id: 'q-firstOf-8', kind: 'motif', code: 'n("0 1").firstOf(8, x => x.rev())', cycles: 9, expect: ['1 0', '0 1', '0 1', '0 1', '0 1', '0 1', '0 1', '0 1', '1 0'], cites: ['f.tous-les'] },
  { id: 'q-techno-kick', kind: 'motif', code: 'setcpm(135/4)\nsound("bd*4, [~ oh]*4").bank("RolandTR909")', fields: ['s', 'b'], expect: [grid(8, (i, b) => (i % 2 ? 'oh/' : 'bd/') + b)], cites: ['g.techno.kick'] },
  { id: 'q-acid-basse', kind: 'motif', code: 'setcpm(126/4)\nnote("c2 c2 c3 c2 ~ c2 eb2 c3").sound("sawtooth").lpf("<400 400>").lpq("<0 15>").lpenv("<0 4>").lpd(.12).decay(.15).sustain(0)', cycles: 2, fields: ['resonance', 'lpenv'], expect: [Array(7).fill('0/0').join(' '), Array(7).fill('15/4').join(' ')], cites: ['g.acid.basse'] },
  { id: 'q-trance-arpege', kind: 'motif', code: 'setcpm(138/4)\nchord("<Am F>").voicing().arp("[0 2 1 3 2 3 1 2]*2").sound("sawtooth").lpf(2500).decay(.12).sustain(0)', fields: ['b'], expect: [grid(16, (i, b) => b)], cites: ['g.trance.timbres'] },
  // House, drum & bass, ambient (vue Genres)
  { id: 'q-house-clap', kind: 'motif', code: 'setcpm(124/4)\nsound("bd*4, ~ cp ~ cp").bank("RolandTR909")', fields: ['s', 'b'], expect: ['bd/0 bd/0.25 cp/0.25 bd/0.5 bd/0.75 cp/0.75'], cites: ['g.house.kick'] },
  { id: 'house-332', kind: 'motif', code: 'note("<c2 c2 ab1 bb1>").struct("x ~ ~ x ~ ~ x ~")', cycles: 4, fields: ['note', 'b'], expect: ['c2/0 c2/0.375 c2/0.75', 'c2/0 c2/0.375 c2/0.75', 'ab1/0 ab1/0.375 ab1/0.75', 'bb1/0 bb1/0.375 bb1/0.75'], cites: ['g.house.basse', 'g.house.harmonie'] },
  { id: 'house-septiemes', kind: 'motif', code: 'chord("<Cm7 Ab^7 Bb^7>").voicing()', cycles: 3, expect: ['Bb3 Bb4 C5 Eb4 G4', 'Ab3 C4 C5 Eb3 G4', 'A4 Bb2 D4 F4'], cites: ['g.house.harmonie'] },
  { id: 'q-dnb-half-time', kind: 'motif', code: 'setcpm(174/4)\nsound("bd ~ ~ ~ ~ ~ ~ ~, ~ ~ ~ ~ sd ~ ~ ~").bank("RolandTR808")', fields: ['s', 'b'], expect: ['bd/0 sd/0.5'], cites: ['g.dnb.tempo'] },
  { id: 'q-dnb-two-step', kind: 'motif', code: 'setcpm(174/4)\nsound("bd ~ ~ ~ ~ bd ~ ~, ~ ~ sd ~ ~ ~ sd ~").bank("RolandTR808")', fields: ['s', 'b'], expect: ['bd/0 sd/0.25 bd/0.625 sd/0.75'], cites: ['g.dnb.kick'] },
  { id: 'dnb-fantomes', kind: 'motif', code: 'sound("~ sd ~ ~ ~ ~ ~ sd").gain(.2)', fields: ['s', 'b', 'gain'], expect: ['sd/0.125/0.2 sd/0.875/0.2'], cites: ['g.dnb.hats'] },
  { id: 'q-ambient-cycle-10s', kind: 'motif', code: 'setcpm(24/4)\nnote("c2")', cps: 0.1, cites: ['g.ambient.tempo'] },
  { id: 'q-ambient-boucles-3-5', kind: 'motif', code: 'stack(n("0").slow(3), n("1").slow(5))', cycles: 16, expect: ['0 1', '', '', '0', '', '1', '0', '', '', '0', '1', '', '0', '', '', '0 1'], cites: ['g.ambient.structure'] },

  /* ---------------- Fondations : textes « Pourquoi ça marche » ---------------- */
  { id: 'tempo-par-defaut', kind: 'motif', code: 's("bd")', cps: 0.5, expect: ['bd'], cites: ['f.tempo', 'f.cycle'] },
  { id: 'setcpm-divise', kind: 'motif', code: 'setcpm(110/4)\ns("bd")', cps: 110 / 240, expect: ['bd'], cites: ['f.tempo'] },
  { id: 'espace-parts-egales', kind: 'motif', code: 's("bd hh sd hh")', fields: ['b'], expect: ['0 0.25 0.5 0.75'], cites: ['f.sequence'] },
  { id: 'virgule-crochets-ensemble', kind: 'motif', code: 's("[bd,hh] sd")', fields: ['s', 'b'], expect: ['bd/0 hh/0 sd/0.5'], cites: ['f.virgule'] },
  { id: 'interrogation-50', kind: 'motif', code: 's("hh*8?")', cycles: 64, countBetween: [226, 286], cites: ['f.hasard', 'mini.interrogation'] },
  { id: 'interrogation-dosee', kind: 'motif', code: 's("hh*8?0.2")', cycles: 64, countBetween: [380, 440], cites: ['f.hasard'] },
  { id: 'diese-egal-bemol', kind: 'motif', code: 'note("d# eb b bb").add(note(0))', expect: ['51 51 59 58'], cites: ['f.demi-ton'] },
  { id: 'scale-octave-3', kind: 'motif', code: 'n("0").scale("D:minor")', expect: ['D3'], cites: ['f.tonique'] },
  { id: 'pentatonique-mineure-la', kind: 'motif', code: 'n("0 1 2 3 4 5").scale("A:minor:pentatonic")', expect: ['A3 C4 D4 E4 G4 A4'], cites: ['f.pentatonique'] },
  { id: 'accords-de-la-gamme', kind: 'motif', code: 'n("<[0,2,4] [1,3,5] [6,8,10]>").scale("C:major")', cycles: 3, expect: ['C3 E3 G3', 'A3 D3 F3', 'B3 D4 F4'], cites: ['f.accords-gamme'] },

  /* ---------------- Quiz des approfondissements (legacy/quizzes.js) ----------------
     Une affirmation « qa-… » par question : le code ou le fait sur lequel repose la bonne
     réponse. check-links exige qu'il y en ait une pour chaque leçon qui a une question. */
  { id: 'qa-ondes-par-pas', kind: 'motif', code: 'note("c3 c3 c3 c3").s("sine triangle square sawtooth")', fields: ['s', 'note', 'b'], expect: ['sine/c3/0 triangle/c3/0.25 square/c3/0.5 sawtooth/c3/0.75'], cites: ['L4.4.2'] },
  { id: 'qa-bruits-ronde-rapide', kind: 'motif', code: 's("<white pink brown>*8")', cycles: 2, expect: ['white pink brown white pink brown white pink', 'brown white pink brown white pink brown white'], cites: ['L4.4.4'] },
  { id: 'qa-lpf-par-cycle', kind: 'motif', code: 'note("c2*4").s("sawtooth").lpf("<400 4000>")', cycles: 2, fields: ['cutoff'], expect: ['400 400 400 400', '4000 4000 4000 4000'], cites: ['L4.4.6'] },
  { id: 'qa-hpf-hcutoff', kind: 'motif', code: 'note("c2 e2 g2 c3").s("sawtooth").hpf(1000)', fields: ['hcutoff'], expect: ['1000 1000 1000 1000'], never: { cutoff: true }, cites: ['L4.4.8'] },
  { id: 'qa-lfo-part-du-milieu', kind: 'motif', code: 'note("c2").s("sawtooth").segment(16).lpf(sine.range(300, 3000).slow(2))', cycles: 2, fields: ['cutoff'], expect: ['1650 1913.372 2166.623 2400.02 2604.594 2772.484 2897.237 2974.06 3000 2974.06 2897.237 2772.484 2604.594 2400.02 2166.623 1913.372', '1650 1386.628 1133.377 899.98 695.406 527.516 402.763 325.94 300 325.94 402.763 527.516 695.406 899.98 1133.377 1386.628'], cites: ['L4.4.9'] },
  { id: 'qa-adsr-valeurs', kind: 'motif', code: 'note("c3").s("sawtooth").attack(.01).decay(.2).sustain(.3).release(.3)', fields: ['attack', 'decay', 'sustain', 'release'], expect: ['0.01/0.2/0.3/0.3'], cites: ['L4.4.11'] },
  { id: 'qa-pluck-sustain-0', kind: 'motif', code: 'note("c2").s("sawtooth").attack(.01).decay(.15).sustain(0)', fields: ['decay', 'sustain'], expect: ['0.15/0'], cites: ['L4.4.13'] },
  { id: 'qa-lpenv-octaves', kind: 'empreinte', has: ['rs=clamp(2**(qn-ns)*R,0,2e4)'], cites: ['L4.4.14'] },
  { id: 'qa-echo-reglages', kind: 'motif', code: 'note("c3").s("triangle").delay(.5).delaytime(.25).delayfeedback(.4)', fields: ['delay', 'delaytime', 'delayfeedback'], expect: ['0.5/0.25/0.4'], cites: ['L4.4.17'] },
  { id: 'qa-delay-croche-pointee', kind: 'motif', code: 'setcpm(120/4)\nnote("c4").s("triangle").delay(.6).delaytime(.375)', cps: 0.5, fields: ['delaytime'], expect: ['0.375'], cites: ['L4.4.18'] },
  { id: 'qa-orbits-separees', kind: 'motif', code: '$: note("c3").s("triangle").room(.8).roomsize(6).orbit(2)\n$: s("bd").room(.3).roomsize(1)', fields: ['s', 'orbit', 'roomsize'], expect: ['bd//1 triangle/2/6'], cites: ['L4.4.19'] },
  { id: 'qa-distort-forme-courte', kind: 'motif', code: 'note("c2").s("sawtooth").distort("4:.3")', fields: ['distort', 'distortvol'], expect: ['4/0.3'], cites: ['L4.4.21'] },
  { id: 'qa-vib-forme-courte', kind: 'motif', code: 'note("c3").s("sawtooth").vib("4:.2")', fields: ['vib', 'vibmod'], expect: ['4/0.2'], cites: ['L4.4.22'] },
  { id: 'qa-deux-lpf-un-seul', kind: 'motif', code: 'note("c2").s("sawtooth").lpf(300).distort("3:.3").lpf(3000)', fields: ['cutoff'], expect: ['3000'], cites: ['L4.4.24'] },
  { id: 'qa-chevrons-boucle', kind: 'motif', code: 'note("<c4 e4 g4>")', cycles: 4, expect: ['c4', 'e4', 'g4', 'c4'], cites: ['L5.5.1'] },
  { id: 'qa-cat-un-par-cycle', kind: 'motif', code: 'cat(s("bd*2"), s("hh*4"))', cycles: 2, expect: ['bd bd', 'hh hh hh hh'], cites: ['L5.5.3'] },
  { id: 'qa-run-4', kind: 'motif', code: 'n(run(4))', expect: ['0 1 2 3'], cites: ['L5.5.4'] },
  { id: 'qa-palindrome', kind: 'motif', code: 'n("0 1 2").palindrome()', cycles: 4, expect: ['0 1 2', '2 1 0', '0 1 2', '2 1 0'], cites: ['L5.5.7'] },
  { id: 'qa-iter-4', kind: 'motif', code: 'n("0 1 2 3").iter(4)', cycles: 4, expect: ['0 1 2 3', '1 2 3 0', '2 3 0 1', '3 0 1 2'], cites: ['L5.5.8'] },
  { id: 'qa-ply-2', kind: 'motif', code: 's("bd sd").ply(2)', fields: ['s', 'b'], expect: ['bd/0 bd/0.25 sd/0.5 sd/0.75'], cites: ['L5.5.9'] },
  { id: 'qa-irand-0-a-7', kind: 'motif', code: 'n(irand(8).segment(8))', cycles: 64, never: { n: [-1, 8, 0.5, 7.5] }, some: { n: [7] }, cites: ['L5.5.11'] },
  { id: 'qa-irand-0', kind: 'motif', code: 'n(irand(8).segment(8))', cycles: 64, some: { n: [0] }, cites: ['L5.5.11'] },
  { id: 'qa-hasard-rejoue', kind: 'motif', code: 'n(irand(8).segment(4)).scale("C:pentatonic")', cycles: 4, sameAs: { code: 'n(irand(8).segment(4)).scale("C:pentatonic")' }, cites: ['L5.5.12'] },
  { id: 'qa-degrade-garde-70', kind: 'motif', code: 's("hh*8").degradeBy(.3)', cycles: 64, countBetween: [330, 390], cites: ['L5.5.14'] },
  { id: 'qa-off-quinte', kind: 'motif', code: '"c3 eb3 g3".off(1/8, x => x.add(7)).note()', fields: ['note', 'b'], expect: ['c3/0 55/0.125 eb3/0.333 58/0.458 g3/0.667 62/0.792'], cites: ['L5.5.17'] },
  { id: 'qa-echo-trois-voix', kind: 'motif', code: 's("bd sd").echo(3, 1/6, .8)', fields: ['s', 'b', 'gain'], expect: ['bd/0/1 bd/0.167/0.8 bd/0.333/0.64 sd/0.5/1 sd/0.667/0.8 sd/0.833/0.64'], cites: ['L5.5.18'] },
  { id: 'qa-jux-rev', kind: 'motif', code: 'note("c3 e3").jux(rev)', fields: ['note', 'pan'], expect: ['c3/0 e3/1 c3/1 e3/0'], cites: ['L5.5.19'] },
  { id: 'qa-add-chevrons', kind: 'motif', code: 'note("c e g b").add(note("<0 3 5>"))', cycles: 3, expect: ['48 52 55 59', '51 55 58 62', '53 57 60 64'], cites: ['L5.5.21'] },
  { id: 'qa-firstOf-rev', kind: 'motif', code: 'n("0 1 2 3").firstOf(4, x => x.rev())', cycles: 5, expect: ['3 2 1 0', '0 1 2 3', '0 1 2 3', '0 1 2 3', '3 2 1 0'], cites: ['L5.5.22'] },
  { id: 'qa-chunk-avance', kind: 'motif', code: 'n("0 1 2 3").chunk(4, x => x.add(n(10)))', cycles: 2, expect: ['10 1 2 3', '0 11 2 3'], cites: ['L5.5.23'] },
  { id: 'qa-souligne-coupe', kind: 'motif', code: '$: s("bd*2")\n_hats$: s("hh*4")', expect: ['bd bd'], cites: ['L6.6.3'] },
  { id: 'qa-all-toutes-pistes', kind: 'motif', code: '$: s("bd")\n$: note("c2").s("sawtooth")\nall(x => x.room(.3))', fields: ['s', 'room'], expect: ['bd/0.3 sawtooth/0.3'], cites: ['L6.6.4'] },
  { id: 'qa-const-deux-pistes', kind: 'motif', code: 'const bass = note("c2 g2").s("gm_acoustic_bass")\n$: bass\n$: bass.add(note(12)).gain(.4)', fields: ['note', 'gain'], expect: ['48/0.4 c2/ 55/0.4 g2/'], cites: ['L6.6.6'] },
  { id: 'qa-register-methode', kind: 'motif', code: "register('keymaker', p => p.s('sawtooth').lpf(900))\nnote(\"c3\").keymaker()", fields: ['s', 'cutoff'], expect: ['sawtooth/900'], cites: ['L6.6.8'] },
  { id: 'qa-color-sans-effet-sonore', kind: 'motif', code: 's("bd sd").color("tomato")', fields: ['s', 'b', 'note', 'gain'], sameAs: { code: 's("bd sd")' }, some: { color: ['tomato'] }, cites: ['L6.6.9'] },
  { id: 'qa-arrange-sections', kind: 'motif', code: 'arrange([4, s("bd*2")], [4, s("hh*4")])', cycles: 9, expect: ['bd bd', 'bd bd', 'bd bd', 'bd bd', 'hh hh hh hh', 'hh hh hh hh', 'hh hh hh hh', 'hh hh hh hh', 'bd bd'], cites: ['L6.6.11'] },
  { id: 'qa-bang-repete', kind: 'motif', code: 'note("<c2!4 g2!4>")', cycles: 8, expect: ['c2', 'c2', 'c2', 'c2', 'g2', 'g2', 'g2', 'g2'], cites: ['L6.6.12'] },
  { id: 'qa-arobase-allonge', kind: 'motif', code: 'note("<c2@4 g2@4>")', cycles: 8, expect: ['c2', '', '', '', 'g2', '', '', ''], cites: ['L6.6.12'] },
  { id: 'qa-mask-sections', kind: 'motif', code: 's("hh*2").mask("<0 0 1 1>")', cycles: 4, expect: ['', '', 'hh hh', 'hh hh'], cites: ['L6.6.13'] },
  { id: 'qa-chop-16-dans-l-ordre', kind: 'motif', code: 's("numbers:3").chop(16)', fields: ['b', 'begin'], expect: ['0/0 0.063/0.063 0.125/0.125 0.188/0.188 0.25/0.25 0.313/0.313 0.375/0.375 0.438/0.438 0.5/0.5 0.563/0.563 0.625/0.625 0.688/0.688 0.75/0.75 0.813/0.813 0.875/0.875 0.938/0.938'], cites: ['L6.6.17'] },
  { id: 'qa-layer-sans-original', kind: 'motif', code: 'note("c2").layer(x => x.s("sawtooth"), x => x.s("square").add(note(12)))', fields: ['s', 'note'], expect: ['sawtooth/c2 square/48'], cites: ['L6.6.19'] },
  { id: 'qa-pan-0-gauche', kind: 'empreinte', has: ['if(Jn.pan!==void 0){const vs=R.createStereoPanner();ps.pan=[vs],vs.pan.value=2*Jn.pan-1'], cites: ['L6.6.21'] },
  { id: 'qa-direct-piste-coupee', kind: 'motif', code: 'drums$: s("bd*4, ~ cp")\n_bass$: note("c2 ~ g2 ~").s("gm_acoustic_bass")', never: { s: ['gm_acoustic_bass'] }, some: { s: ['cp'] }, cites: ['L6.6.22'] },
  { id: 'qa-direct-piste-entree', kind: 'motif', code: 'drums$: s("bd*4, ~ cp")\nbass$: note("c2 ~ g2 ~").s("gm_acoustic_bass")', fields: ['s', 'b'], expect: ['bd/0 gm_acoustic_bass/0 bd/0.25 bd/0.5 cp/0.5 gm_acoustic_bass/0.5 bd/0.75'], cites: ['L6.6.22'] },
  { id: 'qa-cordes-a-vide', kind: 'motif', code: 'note("e2 a2 d3 g3 b3 e4").add(note(0))', expect: ['40 45 50 55 59 64'], cites: ['L3.3.2'] },
  { id: 'qa-case-demi-ton', kind: 'motif', code: 'note("e2 f2 f#2").add(note(0))', expect: ['40 41 42'], cites: ['L3.3.3', 'L3.3.6'] },
  { id: 'qa-douzieme-case', kind: 'motif', code: 'note("e2").add(note(12))', expect: ['52'], cites: ['L3.3.4'] },
  { id: 'qa-capo-2', kind: 'motif', code: 'note("e2 a2").add(note("<0 2 5>"))', cycles: 3, expect: ['40 45', '42 47', '45 50'], cites: ['L3.3.8'] },
  { id: 'qa-penta-mi', kind: 'motif', code: 'n("0 1 2 3 4 5").scale("E:minor:pentatonic")', expect: ['E3 G3 A3 B3 D4 E4'], cites: ['L3.3.9'] },
  { id: 'qa-mi-majeur-mineur', kind: 'motif', code: 'note("[e2,b2,e3,g#3,b3,e4] [e2,b2,e3,g3,b3,e4]").add(note(0))', fields: ['note', 'b'], expect: ['40/0 47/0 52/0 56/0 59/0 64/0 40/0.5 47/0.5 52/0.5 55/0.5 59/0.5 64/0.5'], cites: ['L3.3.12'] },
  { id: 'qa-struct-5-coups', kind: 'motif', code: 'note("c3").struct("x ~ x x ~ x ~ x")', fields: ['b'], expect: ['0 0.25 0.375 0.625 0.875'], cites: ['L3.3.15'] },
  { id: 'qa-power-chord-quinte', kind: 'motif', code: 'note("[e2,b2]").add(note(0))', expect: ['40 47'], cites: ['L3.3.16'] },
  { id: 'qa-power-chord-forme', kind: 'motif', code: 'note("[0,7]".add("<40 45 47 43>"))', cycles: 4, expect: ['40 47', '45 52', '47 54', '43 50'], cites: ['L3.3.17'] },
  { id: 'qa-barre-fa', kind: 'motif', code: 'note("[e2,b2,e3,g#3,b3,e4]".add("<0 1 3 5>"))', cycles: 2, expect: ['40 47 52 56 59 64', '41 48 53 57 60 65'], cites: ['L3.3.19'] },
  { id: 'qa-plaquer-arpeger', kind: 'motif', code: 'note("[c3,e3,g3] [c3 e3 g3]")', fields: ['note', 'b'], expect: ['c3/0 e3/0 g3/0 c3/0.5 e3/0.667 g3/0.833'], cites: ['L3.3.21'] },
  { id: 'qa-gain-accent', kind: 'motif', code: 'note("c3 e3 g3 c4").gain("1 .5 .7 .5")', fields: ['gain'], expect: ['1 0.5 0.7 0.5'], cites: ['L3.3.23'] },

  /* ---------------- Tranches : slice ---------------- */
  { id: 'slice-chevrons-une-par-cycle', kind: 'motif', code: 's("numbers:3").slice(8, "<0 2>")', cycles: 2, fields: ['begin', 'b'], expect: ['0/0', '0.25/0'], cites: ['L7.7.3', 'L6.6.18'] },
  { id: 'slice-sans-chevrons', kind: 'motif', code: 's("numbers:3").slice(8, "0 2 4 6 1 3 5 7")', fields: ['begin'], expect: ['0 0.25 0.5 0.75 0.125 0.375 0.625 0.875'], cites: ['L7.7.3'] },
  { id: 'slice-fit-remplit', kind: 'motif', code: 's("amen/4").fit().slice(8, "<[0 2] [1 3] [4 6] [5 7]>")', fields: ['begin', 'end', 'speed', 'unit', 'b'], expect: ['0/0.125/0.25/c/0 0.25/0.375/0.25/c/0.5'], cites: ['L6.6.18', 'L7.7.12'] },

  /* ---------------- Empreintes du code source du moteur ---------------- */
  { id: 'adsr-defauts-synthes', kind: 'empreinte', has: ['getADSRValues([l.attack,l.decay,l.sustain,l.release],"linear",[.001,.05,.6,.01])'], cites: ['fx.attack', 'fx.decay', 'fx.sustain', 'sol.enveloppe', 'f.pluck'] },
  { id: 'adsr-un-seul-reglage', kind: 'empreinte', has: ['const le=z??(R!=null&&I==null||R==null&&I==null?1:.001)'], cites: ['fx.attack', 'fx.decay', 'fx.release', 'sol.enveloppe'] },
  { id: 'penv-defauts', kind: 'empreinte', has: ['getADSRValues([e.pattack,e.pdecay,e.psustain,e.prelease],R,[.2,.001,1,.001])', 'const b=nanFallback(e.penv,1,!0)'], cites: ['fx.penv'] },
  { id: 'filtre-env-octaves', kind: 'empreinte', has: ['getADSRValues(kn,"exponential",[.005,.14,0,.1])', 'rs=clamp(2**(qn-ns)*R,0,2e4)'], cites: ['fx.lpenv', 'genre.basse-acid'] },
  { id: 'filtre-sans-coupure', kind: 'empreinte', has: ['if(Jn.cutoff!==void 0)', 'if(Jn.hcutoff!==void 0)', 'if(Jn.bandf!==void 0)'], cites: ['fx.lpenv', 'fx.lpq', 'fx.hpf'] },
  { id: 'echantillon-coupe-par-release', kind: 'empreinte', has: ['se==null&&z==null&&e.release==null&&(sn=Mn)'], cites: ['fx.release', 'son.piano', 'fx.clip'] },
  { id: 'gain-lineaire', kind: 'empreinte', has: ['gainCurveFunc=o=>o'], cites: ['fx.gain', 'L4.4.23'] },
  { id: 'echo-plafond', kind: 'empreinte', has: ['l=clamp(l,0,.98)'], cites: ['fx.delayfeedback', 'L4.4.17', 'f.espace'] },
  { id: 'echo-max-1s', kind: 'empreinte', has: ['class o extends DelayNode{constructor(l,d,p,b){return super(l)'], cites: ['fx.delaytime'] },
  { id: 'reverb-rt60', kind: 'empreinte', has: ['se=Math.pow(1/1e3,1/R)'], cites: ['fx.size', 'fx.room'] },
  { id: 'duck-plancher', kind: 'empreinte', has: ['tn=clamp(1-Math.sqrt(p),.01,se)'], cites: ['fx.duck'] },
  { id: 'phaser-un-creux', kind: 'empreinte', has: ['sn.type="notch"', 'sn.Q.value=2-Math.min(Math.max(d*2,0),1.9)'], cites: ['fx.phaser'] },
  { id: 'bruit-melange', kind: 'empreinte', has: ['wetfade=o=>o<.5?1:1-(o-.5)/.5'], cites: ['son.bruit', 'son.ondes'] },
  { id: 'nudge-echantillons', kind: 'empreinte', has: ['nudge:R=0'], cites: ['voc.structure.humaniser'] },
  { id: 'cut-10ms', kind: 'empreinte', has: ['qn.node.gain.linearRampToValueAtTime(0,kn+.01)'], cites: ['fx.cut'] },
  { id: 'signal-debut-intervalle', kind: 'empreinte', has: ['signal$1=o=>{const e=l=>[new Hap(void 0,l.span,o(l.span.begin'], cites: ['fn.signaux', 'f.signal'] },
  { id: 'supersaw-defauts', kind: 'empreinte', has: ['unison:R=5,spread:I=.6,detune:z', 'z=z??b??.18'], cites: ['son.supersaw'] },
  { id: 'parfois-pourcentages', kind: 'empreinte', has: ['often=register("often",function(o,e){return e.sometimesBy(.75,o)})', 'rarely=register("rarely",function(o,e){return e.sometimesBy(.25,o)})', 'almostNever=register("almostNever",function(o,e){return e.sometimesBy(.1,o)})', 'almostAlways=register("almostAlways",function(o,e){return e.sometimesBy(.9,o)})'], cites: ['f.parfois', 'fn.sometimes'] },
  { id: 'filtre-12db-resonance-1', kind: 'empreinte', has: ['const e=["12db","ladder","24db"]', 'q:tn=1,drive:sn=.69'], cites: ['f.filtre', 'f.resonance', 'fx.lpq'] },
  { id: 'defauts-gain-echo', kind: 'empreinte', has: ['s:"triangle",gain:.8,postgain:1', 'delayfeedback:.5,delaysync:3/16'], cites: ['f.mix', 'f.espace', 'fx.gain'] },
  { id: 'reverb-2s-par-defaut', kind: 'empreinte', has: ['I.generate=(z=2,se=.1,le=15e3,tn=1e3'], cites: ['f.espace', 'fx.size'] },
  { id: 'cycle-par-defaut-2s', kind: 'empreinte', has: ['this.started=!1,this.cps=.5'], cites: ['f.tempo', 'f.cycle'] },
  {
    id: 'ordre-des-effets',
    kind: 'empreinte',
    order: ['const Ar=gainNode(Us)', 'if(Jn.cutoff!==void 0)', 'if(Jn.crush!==void 0)', 'if(Jn.distort!==void 0)', 'if(Jn.pan!==void 0)', 'if(Jn.phaserrate!==void 0'],
    cites: ['voc.effets.ordre-des-effets', 'fx.crush', 'L4.4.24', 'f.son-a-toi'],
  },
];
