// Fondations — Chapitre I : Premier son.
// Objectif : en trois gestes, un morceau qui est déjà un peu le tien.
// Ensuite seulement, on le démonte brique par brique.
//
// Forme d'une étape (voir docs/PEDAGOGIE.md §3) :
//   id, title
//   listen : ce qu'on dit AVANT d'appuyer sur ▶ (une ou deux phrases)
//   code   : chargé dans l'éditeur
//   name   : ce qu'on vient d'entendre — c'est ici que le nom arrive
//   task   : { text, check(c), ok } — un seul changement, vérifié localement
//   deep   : { decode: [[morceau, explication, idWiki]], why, wiki: [ids] }
//   quiz   : [{ type:'qcm'|'ecoute', q, code?, choices, answer, explain }]
//   legacy : leçons équivalentes de l'ancienne app (« module:id »), pour la migration

const PREMIER = `setcpm(110/4)

$: sound("bd*4, [~ cp]*2").bank("RolandTR909")

$: sound("hh*8").bank("RolandTR909").gain(.5)

$: note("<c2 ab1 eb2 bb1>").struct("x*8").sound("sawtooth").lpf(600).gain(.7)

$: chord("<Cm Ab Eb Bb>").voicing().sound("piano").room(.5)`;

export default {
  id: 'premier-son',
  title: 'Premier son',
  goal: 'Lancer un morceau, le modifier, puis écrire ton premier rythme.',
  steps: [
    {
      id: 'f.play',
      title: 'Appuie sur ▶',
      listen: 'Ne lis pas le code. Appuie simplement sur le bouton ▶ et écoute.',
      code: PREMIER,
      name:
        'Ce que tu entends est écrit dans ces quelques lignes : une batterie, une basse, des accords. ' +
        'Dans Strudel, **le code est l’instrument** : on l’écrit, on l’entend tout de suite.',
      task: {
        text: 'Lance le morceau avec ▶. Pour l’arrêter : le bouton ■.',
        check: () => true,
        ok: 'Tu viens de jouer du code.',
      },
      deep: {
        why:
          'On appelle ça le *live coding* : modifier un programme pendant qu’il joue. Strudel tourne entièrement ' +
          'dans cette app, sans rien installer. Chaque ligne qui commence par `$:` est un instrument ; on y revient à la fin du chapitre.',
        decode: [
          ['setcpm(110/4)', 'le tempo du morceau.', 'fn.setcpm'],
          ['$:', 'une ligne = un instrument qui joue en même temps que les autres.', 'fn.dollar'],
          ['sound("…")', 'joue des sons enregistrés (ici une batterie).', 'fn.sound'],
          ['note("…")', 'joue des notes (ici la basse).', 'fn.note'],
          ['chord("…")', 'joue des accords écrits comme sur une grille.', 'fn.chord'],
        ],
        wiki: ['fn.sound', 'fn.note', 'fn.dollar'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Dans Strudel, que se passe-t-il quand tu modifies le code puis que tu relances ▶ ?',
          choices: ['Le son change tout de suite, sans coupure', 'Il faut d’abord exporter un fichier', 'Le morceau reprend toujours au début'],
          answer: 0,
          explain: 'C’est le principe du live coding : le code est joué en direct, et relancer met à jour le son à chaud.',
        },
      ],
      legacy: ['1:1.1', '1:1.2'],
    },

    {
      id: 'f.tempo',
      title: 'Change un nombre',
      listen: 'Même morceau. Lance-le, puis regarde la toute première ligne.',
      code: PREMIER,
      name:
        'Le nombre `110` est le **tempo** : 110 battements par minute. Plus il est grand, plus le morceau va vite. ' +
        'En musique on écrit **BPM** (*beats per minute*).',
      task: {
        text: 'Remplace `110` par un autre nombre (essaie 90, puis 140) et relance ▶.',
        check: (c) => {
          const bpm = c.cpm * 4;
          if (Math.abs(bpm - 110) <= 1) return 'Le tempo est encore à 110. Change le nombre dans `setcpm(110/4)` puis relance.';
          if (bpm < 40 || bpm > 220) return 'Garde la forme `setcpm(90/4)` : le nombre de battements par minute, divisé par 4. Sans le `/4`, le morceau part quatre fois trop vite.';
          return true;
        },
        ok: 'Tu entends ? Même musique, autre énergie.',
      },
      deep: {
        why:
          'Strudel ne compte pas en battements mais en **cycles** : un cycle est une boucle complète. Ici un cycle contient 4 battements ' +
          '(une *mesure* à 4 temps), d’où la division : `110/4` cycles par minute = 110 battements par minute. Garde simplement la forme `setcpm(BPM/4)`.',
        decode: [
          ['setcpm(…)', '« set cycles per minute » : règle le nombre de cycles par minute.', 'fn.setcpm'],
          ['110', 'le tempo en BPM.', 'sol.tempo'],
          ['/4', 'parce qu’un cycle contient ici 4 temps.', 'sol.mesure'],
        ],
        wiki: ['fn.setcpm', 'sol.tempo', 'sol.mesure'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Tu veux un morceau à 128 BPM, avec 4 temps par cycle. Quelle ligne écris-tu ?',
          choices: ['setcpm(128/4)', 'setcpm(128)', 'setcpm(4/128)'],
          answer: 0,
          explain: '`setcpm` compte des cycles par minute. Avec 4 temps par cycle, 128 BPM = 128/4 cycles par minute.',
        },
      ],
      legacy: ['1:3.2', '1:3.3'],
    },

    {
      id: 'f.machine',
      title: 'Change un mot',
      listen: 'Toujours le même morceau. Cette fois, regarde le mot `RolandTR909`, écrit deux fois.',
      code: PREMIER,
      name:
        '`RolandTR909` est le nom d’une **boîte à rythmes** : une machine qui contient des sons de batterie. ' +
        '`.bank("…")` choisit la machine. Changer ce mot, c’est changer de batteur.',
      task: {
        text: 'Remplace `RolandTR909` par `RolandTR808` (aux deux endroits) et relance. Essaie aussi `RolandTR707` ou `AkaiLinn`.',
        check: (c) => {
          const banks = c.val('bank');
          if (!banks.length) return 'Garde `.bank("…")` à la fin des lignes de batterie.';
          const known = ['RolandTR909', 'RolandTR808', 'RolandTR707', 'AkaiLinn'];
          const unknown = banks.find((b) => !known.includes(b));
          if (unknown) return 'La machine « ' + unknown + ' » n’existe pas ici, la batterie est muette. Choisis `RolandTR808`, `RolandTR707` ou `AkaiLinn`, majuscules comprises.';
          return banks.some((b) => b !== 'RolandTR909') ? true : 'La batterie est encore une TR909. Remplace le nom entre guillemets après `.bank(`.';
        },
        ok: 'Tempo choisi, batterie choisie : ce morceau est déjà un peu le tien.',
      },
      deep: {
        why:
          'La TR-909 et la TR-808 sont deux machines Roland des années 1980. La 909 a donné son kick à la house et à la techno ; ' +
          'la 808, plus ronde et plus grave, au hip-hop et à l’électro. Strudel en embarque des dizaines ; cette app en garde quatre disponibles hors ligne : ' +
          '`RolandTR909`, `RolandTR808`, `RolandTR707` et `AkaiLinn`.',
        decode: [
          ['.bank("RolandTR909")', 'prend les sons dans cette machine. Attention aux majuscules : le nom doit être exact.', 'fn.bank'],
        ],
        wiki: ['fn.bank', 'son.batterie'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'À quoi sert `.bank("RolandTR808")` ?',
          choices: ['À choisir la boîte à rythmes dont on prend les sons', 'À régler le volume de la batterie', 'À enregistrer le morceau'],
          answer: 0,
          explain: '`bank` désigne la machine. Les mêmes noms de sons (`bd`, `hh`…) sonnent différemment selon la machine choisie.',
        },
      ],
      legacy: ['1:1.5'],
    },

    {
      id: 'f.un-son',
      title: 'Un seul son',
      listen: 'On démonte. Voici la plus petite chose qu’on puisse écrire : un seul son.',
      code: 'sound("bd")',
      name:
        '`bd` veut dire *bass drum* : la **grosse caisse** (on dit aussi *kick*). `sound("bd")` la joue une fois par cycle, et le cycle recommence sans fin.',
      task: {
        text: 'Remplace `bd` par `sd`, puis par `hh`, puis par `cp`. Relance à chaque fois.',
        check: (c) => {
          const s = c.sounds();
          if (!s.length) return 'Rien ne joue : garde la forme `sound("…")` avec un nom entre guillemets.';
          return s.some((x) => x !== 'bd') ? true : 'C’est encore la grosse caisse. Écris `sd`, `hh` ou `cp` entre les guillemets.';
        },
        ok: 'Caisse claire, charleston, clap : tu connais déjà quatre sons.',
      },
      deep: {
        why:
          'Les noms sont des abréviations anglaises, toujours en minuscules : `bd` grosse caisse, `sd` caisse claire (*snare drum*), ' +
          '`hh` charleston fermé (*hi-hat*), `oh` charleston ouvert (*open hat*), `cp` clap. On peut écrire `s("bd")` : `s` est le raccourci de `sound`.',
        decode: [
          ['sound(', '« joue ce son ». Les parenthèses entourent ce qu’on lui donne.', 'fn.sound'],
          ['"bd"', 'le nom du son, toujours entre guillemets.', 'son.batterie'],
        ],
        wiki: ['fn.sound', 'son.batterie'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute. Quel son est-ce ?',
          code: 'sound("hh*4")',
          choices: ['hh — le charleston', 'bd — la grosse caisse', 'cp — le clap'],
          answer: 0,
          explain: 'Un son court, aigu et métallique : c’est le charleston (`hh`). La grosse caisse (`bd`) est grave et sourde.',
        },
      ],
      legacy: ['1:1.3', '1:1.4'],
    },

    {
      id: 'f.sequence',
      title: 'Une suite de sons',
      listen: 'Maintenant quatre sons à la suite. Écoute l’ordre.',
      code: 'sound("bd hh sd hh")',
      name:
        'Des sons séparés par des **espaces** sont joués l’un après l’autre : c’est une **séquence**. ' +
        'Toute la séquence tient dans un cycle, puis recommence.',
      task: {
        text: 'Écris ta propre séquence : au moins 4 sons, dont au moins 3 différents (par exemple avec `cp` ou `oh`).',
        check: (c) => {
          if (c.count() < 4) return 'Il faut au moins 4 sons séparés par des espaces.';
          if (new Set(c.onsets()).size < 4) return 'Sépare les sons par des espaces, sans virgule : la virgule les joue tous en même temps.';
          if (c.sounds().length < 3) return 'Utilise au moins 3 sons différents : `bd`, `sd`, `hh`, `oh`, `cp`…';
          return c.changed ? true : 'C’est encore l’exemple : change au moins un son.';
        },
        ok: 'C’est ton premier rythme écrit de ta main.',
      },
      deep: {
        why:
          'Ce qu’on écrit entre guillemets s’appelle la **mini-notation** : un petit langage pour écrire du rythme. ' +
          'L’espace est son premier signe. Le chapitre II est entièrement consacré aux autres.',
        decode: [
          ['"bd hh sd hh"', 'quatre sons, chacun occupe un quart du cycle.', 'mini.espace'],
          ['espace', 'sépare deux pas de la séquence.', 'mini.espace'],
        ],
        wiki: ['mini.espace', 'sol.cycle'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Dans `sound("bd hh sd hh")`, que fait l’espace ?',
          choices: ['Il sépare les sons, joués l’un après l’autre', 'Il joue les sons en même temps', 'Il ajoute un silence'],
          answer: 0,
          explain: 'L’espace met les sons à la suite. Pour les jouer en même temps on utilisera la virgule ; pour un silence, `~`.',
        },
      ],
      legacy: ['1:2.1'],
    },

    {
      id: 'f.couches',
      title: 'Plusieurs lignes en même temps',
      listen: 'Deux lignes. Chacune commence par `$:`. Écoute : elles jouent ensemble.',
      code: `$: sound("bd bd bd bd")

$: sound("hh hh hh hh hh hh hh hh")`,
      name:
        'Chaque ligne qui commence par `$:` est une **piste**, comme un musicien de plus. Toutes les pistes jouent en même temps, sur le même cycle.',
      task: {
        text: 'Ajoute une troisième ligne : `$: sound("~ cp ~ cp")`. Le signe `~` est un silence.',
        check: (c) => {
          if (!c.sounds().includes('cp')) return 'Ajoute une ligne `$: sound("~ cp ~ cp")` sous les deux autres.';
          return c.sounds().length >= 3 ? true : 'Garde aussi les deux premières lignes : il faut trois pistes.';
        },
        ok: 'Trois pistes : kick, charleston, clap. C’est la base de presque toute la musique de danse.',
      },
      deep: {
        why:
          'Le clap tombe sur les temps 2 et 4 (les temps faibles) : c’est ce qu’on appelle le *backbeat*, l’accent qui fait hocher la tête. ' +
          'La grosse caisse sur chaque temps s’appelle « four on the floor » (quatre au plancher).',
        decode: [
          ['$:', 'démarre une piste. On peut en écrire autant qu’on veut.', 'fn.dollar'],
          ['~', 'un silence : le pas existe mais rien ne joue.', 'mini.silence'],
        ],
        wiki: ['fn.dollar', 'mini.silence', 'fn.stack'],
      },
      quiz: [
        {
          type: 'qcm',
          q: 'Que veut dire `$:` au début d’une ligne ?',
          choices: ['Cette ligne est une piste qui joue avec les autres', 'Cette ligne est un commentaire, elle ne joue pas', 'Cette ligne joue après la précédente'],
          answer: 0,
          explain: 'Chaque `$:` lance une piste. Toutes les pistes jouent ensemble sur le même cycle.',
        },
      ],
      legacy: ['1:5.1', '1:5.3'],
    },

    {
      id: 'f.premier-beat',
      title: 'Ton premier rythme',
      listen: 'Voici un point de départ. Écoute-le, puis fais-en le tien.',
      code: `setcpm(120/4)

$: sound("bd bd bd bd").bank("RolandTR909")

$: sound("~ cp ~ cp").bank("RolandTR909")

$: sound("hh hh hh hh hh hh hh hh").bank("RolandTR909").gain(.5)`,
      name:
        'Tu connais maintenant toutes les briques de ce code : le tempo, les pistes `$:`, les noms de sons, la machine, le silence `~`.',
      task: {
        text: 'Change au moins deux choses : le tempo, la machine, ou les sons d’une piste. Garde au moins 3 pistes.',
        check: (c) => {
          if (c.sounds().length < 3) return 'Garde au moins trois sons différents sur trois pistes.';
          return c.changed ? true : 'C’est encore l’exemple. Change le tempo, la machine ou une séquence.';
        },
        ok: 'Chapitre terminé. Si ce rythme te plaît, garde-le : bouton « Garder » sous l’éditeur.',
      },
      deep: {
        why:
          '`.gain(.5)` baisse le volume d’une piste (0 = muet ; sans `.gain`, le moteur joue à 0.8) : le charleston est moins fort que le kick, comme dans un vrai mixage. ' +
          'On y revient au chapitre VI.',
        decode: [
          ['.gain(.5)', 'volume de la piste : plus bas que le volume par défaut (0.8).', 'fx.gain'],
          ['.bank("RolandTR909")', 'la machine d’où viennent les sons.', 'fn.bank'],
        ],
        wiki: ['fx.gain', 'fn.bank', 'fn.setcpm'],
      },
      quiz: [
        {
          type: 'ecoute',
          q: 'Écoute ces deux pistes. Sur quels temps tombe le clap ?',
          code: `setcpm(100/4)
$: sound("bd bd bd bd")
$: sound("~ cp ~ cp")`,
          choices: ['Sur les temps 2 et 4', 'Sur les temps 1 et 3', 'Sur tous les temps'],
          answer: 0,
          explain: '`"~ cp ~ cp"` : silence, clap, silence, clap. Le clap est sur les temps 2 et 4 — le *backbeat*.',
        },
      ],
      legacy: ['1:5.4'],
    },
  ],
};
