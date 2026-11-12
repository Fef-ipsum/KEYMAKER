// Le parcours « Les fondations » : huit chapitres, dans l'ordre.
import ch1 from './ch1.js';
import ch2 from './ch2.js';
import ch3 from './ch3.js';
import ch4 from './ch4.js';
import ch5 from './ch5.js';
import ch6 from './ch6.js';
import ch7 from './ch7.js';
import ch8 from './ch8.js';

export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export const fondations = [ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8].map((c, i) => ({
  ...c,
  roman: ROMAN[i],
  kind: 'fondations',
}));
