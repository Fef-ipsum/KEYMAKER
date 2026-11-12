// Une solution possible par étape des fondations.
// Deux usages : (1) le bouton « Voir une solution » quand on bloque ;
// (2) les tests automatiques — chaque solution doit valider le `check` de son étape,
//     et le code de départ ne doit PAS le valider (scripts/check-content.mjs).

const PREMIER_140 = `setcpm(140/4)

$: sound("bd*4, [~ cp]*2").bank("RolandTR909")

$: sound("hh*8").bank("RolandTR909").gain(.5)

$: note("<c2 ab1 eb2 bb1>").struct("x*8").sound("sawtooth").lpf(600).gain(.7)

$: chord("<Cm Ab Eb Bb>").voicing().sound("piano").room(.5)`;

export const solutions = {
  'f.tempo': PREMIER_140,
  'f.machine': PREMIER_140.replace('140/4', '110/4').replaceAll('RolandTR909', 'RolandTR808'),
  'f.un-son': 'sound("sd")',
  'f.sequence': 'sound("bd hh cp oh")',
  'f.couches': `$: sound("bd bd bd bd")

$: sound("hh hh hh hh hh hh hh hh")

$: sound("~ cp ~ cp")`,
  'f.premier-beat': `setcpm(100/4)

$: sound("bd bd bd bd").bank("RolandTR808")

$: sound("~ cp ~ cp").bank("RolandTR808")

$: sound("hh hh oh hh hh hh oh hh").bank("RolandTR808").gain(.5)`,

  'f.cycle': 'sound("bd hh sd hh bd bd sd hh")',
  'f.silence': 'sound("bd ~ sd hh bd ~ sd hh")',
  'f.etoile': 'sound("hh*8")',
  'f.crochets': 'sound("bd hh sd [hh hh]")',
  'f.chevrons': 'sound("<bd cp> hh sd <hh oh>")',
  'f.virgule': 'sound("bd*4, hh*8, ~ cp ~ cp")',
  'f.durees': 'sound("bd@7 sd")',
  'f.euclide': 'sound("bd(5,8)")',
  'f.hasard': 'sound("bd*4, hh*8?")',
  'f.groove': `setcpm(120/4)

$: sound("bd*4, [~ cp]*2").bank("RolandTR909")

$: sound("<hh*8 hh*16>").bank("RolandTR909").gain(.5)

$: sound("oh(3,8)").bank("RolandTR909").gain(.4)`,

  'f.hauteur': 'note("c5 c4 c3 c2").sound("piano")',
  'f.do-re-mi': 'note("c e g").sound("piano")',
  'f.octave': 'note("e2 e3 e4").sound("piano")',
  'f.demi-ton': 'note("e eb").sound("piano")',
  'f.instrument': 'note("c4 e4 g4 e4").sound("triangle")',
  'f.melodie': 'note("e4 g4 a4 [g4 e4] ~ d4 e4 ~").sound("piano")',
  'f.basse': `setcpm(110/4)

$: sound("bd*4, [~ cp]*2, hh*8").bank("RolandTR909").gain(.8)

$: note("c2 c2 eb2 c2 f1 f1 ab1 c2").sound("sawtooth").lpf(700)`,

  'f.gamme': 'n("0 2 4 7").scale("C:major").sound("piano")',
  'f.majeur-mineur': 'n("0 2 4 2 0 4 7 ~").scale("C:minor").sound("piano")',
  'f.tonique': 'n("0 2 4 7 4 2 0 ~").scale("D:minor").sound("piano")',
  'f.pentatonique': 'n("0 2 4 5 7 6 4 2").scale("A:minor:pentatonic").sound("piano")',
  'f.melodie-gamme': `setcpm(90/4)

$: n("4 2 0 [2 4] 6 ~ 4 ~").scale("D4:minor").sound("piano").room(.4)

$: n("<0 -2 -4 -3>").scale("D2:minor").sound("sawtooth").lpf(500)`,

  'f.intervalle': 'note("c3 c4 [c3,c4] ~").sound("piano")',
  'f.tierce': 'note("[d3,f3] ~").sound("piano")',
  'f.accord': 'note("[c3,eb3,g3]").sound("piano")',
  'f.accords-gamme': 'n("<[0,2,4] [3,5,7] [5,7,9] [0,2,4]>").scale("C:major").sound("piano")',
  'f.grille': 'chord("<Am F C G>").voicing().sound("piano")',
  'f.arpege': 'n("<[0,2,4] [3,5,7]>").scale("C4:major").arp("0 2 1 2").sound("piano").room(.4)',
  'f.harmonie': `setcpm(100/4)

const grille = chord("<Am F Dm G>")

$: grille.voicing().sound("piano").room(.4)

$: grille.rootNotes(2).struct("x*4").sound("sawtooth").lpf(500)

$: sound("bd*4, [~ cp]*2").bank("RolandTR909").gain(.8)`,

  'f.ondes': 'note("c3 e3 g3 e3").sound("square")',
  'f.filtre': 'note("c2*8").sound("sawtooth").lpf(3000)',
  'f.resonance': 'note("c2 c2 eb2 c2 g2 c2 bb1 c2").sound("sawtooth").lpf(600).lpq(15)',
  'f.enveloppe': 'note("c3 e3 g3 b3").sound("sawtooth").lpf(1500).attack(.4).release(1)',
  'f.pluck': 'note("c3 eb3 g3 bb3 c4 bb3 g3 eb3").sound("sawtooth").lpf(1200).decay(.15).sustain(0)',
  'f.espace': 'note("c4 ~ eb4 ~ g4 ~ ~ ~").sound("triangle").room(.6)',
  'f.son-a-toi': `note("c2 c2 eb2 c2 g2 c2 bb1 c3")
  .sound("square")
  .lpf(1400)
  .lpq(12)
  .decay(.2).sustain(0)
  .room(.3)`,

  'f.signal': 'note("c2*8").sound("sawtooth").lpf(saw.range(300, 2500).slow(4))',
  'f.vitesse': 'n("0 2 4 7").scale("A:minor").sound("piano").slow(2)',
  'f.variation': 'note("c3 eb3 g3 <bb3 c4 d4>").sound("sawtooth").lpf("<500 900 1600 3000>")',
  'f.parfois': 'sound("hh*8").rarely(x => x.speed(2))',
  'f.tous-les': 'sound("bd*2 [~ sd] hh*2 sd").lastOf(2, x => x.ply(2))',
  'f.echo-decale': 'note("c3 eb3 g3 bb3").sound("triangle").off(1/8, x => x.add(note(7)))',

  'f.pistes': `setcpm(120/4)

$: sound("bd*4").bank("RolandTR909")

_$: sound("hh*8").bank("RolandTR909").gain(.5)

$: sound("[~ cp]*2").bank("RolandTR909")

$: note("<a1 f1 c2 g1>").struct("x*8").sound("sawtooth").lpf(700).decay(.15).sustain(0)

$: chord("<Am F C G>").voicing().sound("triangle").room(.5).gain(.6)`,
  'f.entrees': `setcpm(120/4)

$: sound("bd*4, hh*8").bank("RolandTR909").gain(.8)

$: note("<a1 f1 c2 g1>").struct("x*8").sound("sawtooth").lpf(700).decay(.15).sustain(0)
  .mask("<0 0 1 1>")`,
  'f.mix': `setcpm(120/4)

$: sound("bd*4").bank("RolandTR909")

$: sound("hh*8").bank("RolandTR909").gain(.4)

$: note("<a1 f1 c2 g1>").struct("x*8").sound("sawtooth").lpf(700).decay(.15).sustain(0)

$: chord("<Am F C G>").voicing().sound("sawtooth").gain(.4)`,
  'f.morceau': `setcpm(124/4)

const grille = chord("<Dm Bb F C>")

$: sound("bd*4").bank("RolandTR909")

$: sound("hh*8").bank("RolandTR909").gain(.4).mask("<0 1 1 1>")

$: sound("[~ cp]*2").bank("RolandTR909").mask("<0 0 1 1>")

$: grille.rootNotes(1).struct("x*8").sound("sawtooth")
  .lpf(sine.range(400, 1800).slow(8)).decay(.15).sustain(0)

$: grille.voicing().sound("triangle").room(.5).gain(.5)`,
};
