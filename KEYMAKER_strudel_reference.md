# Keymaker — Référence Strudel CC

> **Source de vérité Strudel pour le projet.** Distillée depuis la doc officielle **strudel.cc/learn** le **5 juin 2026**.
> Le cutoff de connaissances de Claude est **mai 2025** → en cas de doute sur une fonction, **c'est CE fichier qui fait foi**, pas la mémoire de Claude. Pages officielles listées en §11.
>
> Lecture TDA-friendly : chaque section est autonome. Va direct à ce qui te sert. Le plus important est en **§0**.

---

## §0 — À retenir d'abord (l'essentiel Keymaker)

1. **Strudel parle en notation scientifique** : le do central = `c4`, le La du diapason = `a4` = 440 Hz = MIDI 69. (Vérifié dans le moteur **et** la doc.)
2. **`note("e2")` = le vrai Mi grave de la guitare = 82 Hz.** Nos 6 cordes (`e2 a2 d3 g3 b3 e4`) tombent **pile** sur les vraies fréquences (table en §1).
3. **Lazy loading** : un son n'est chargé qu'au **premier jeu** → il peut être **muet la toute première fois**. Rejoue-le.
4. **Le sampler prend le sample le plus proche** : pour les banques GM (`gm_*`), une note très grave/aiguë hors de la plage enregistrée peut sonner **fine ou inaudible**.
5. **Une note seule → synthé triangle** par défaut. Pour un autre son : `.s("...")`.
6. **Réverb/délai sont partagés par “orbit”** : deux patterns qui se marchent dessus → sépare-les avec `.orbit(2)`.

---

## §1 — Les notes & les hauteurs

Trois façons d'écrire **la même** hauteur :

```
note("a3 c#4 e4 a4")   // noms de notes (théorie occidentale)
note("57 61 64 69")    // numéros MIDI (demi-tons, entiers adjacents)
freq("220 275 330 440") // fréquences en Hz (liberté totale, micro-tonal)
```

- **Noms** : lettre + altération (`#` dièse, `b` bémol) + numéro d'octave. Ex. `c#4`, `eb3`.
- **Numéros** dans `note(...)` = **numéros MIDI**. Décimales possibles (`74.5`) → micro-tonal.
- **`freq(...)`** : fréquence directe en Hz.

**La formule exacte** (lue dans le moteur Strudel embarqué) :

```
MIDI = (octave + 1) × 12 + classe_de_note + altération     // octave par défaut = 3
fréquence = 2^((MIDI − 69) / 12) × 440
```

### Table des cordes de guitare (accordage standard)

| Corde | Écriture Strudel | MIDI | Fréquence |
|------:|:-----------------|-----:|----------:|
| 6 (Mi grave) | `e2` | 40 | **82,4 Hz** |
| 5 (La)       | `a2` | 45 | 110,0 Hz |
| 4 (Ré)       | `d3` | 50 | 146,8 Hz |
| 3 (Sol)      | `g3` | 55 | 196,0 Hz |
| 2 (Si)       | `b3` | 59 | 246,9 Hz |
| 1 (Mi aigu)  | `e4` | 64 | 329,6 Hz |

> ⚠️ **Piège d'octave** : Strudel n'est PAS en convention « do central = c5 ». C'est bien `c4`. Donc nos écritures `e2…e4` sont **justes** pour une guitare. Si une note paraît trop grave/aiguë, c'est la **restitution** (sample/écoute), pas le code — voir §8.

**Défauts utiles** : `note(...)` sans `.s(...)` → **synthé triangle**. Une **gamme** (`scale`) sans octave au root → **octave 3**.

---

## §2 — Les sons : `s` / `sound`

`s("...")` (alias `sound`) déclenche soit un **sample** (fichier audio), soit un **synthé** (généré en direct).

```
s("bd hh sd hh")              // samples de batterie
s("sawtooth square triangle sine")  // synthés
note("a3 c#4 e4").s("sawtooth")     // combiner hauteur + son
```

### Samples de batterie par défaut

| Son | Abrév. | | Son | Abrév. |
|---|---|---|---|---|
| Grosse caisse (kick) | `bd` | | Charley fermé | `hh` |
| Caisse claire | `sd` | | Charley ouvert | `oh` |
| Rimshot | `rim` | | Crash | `cr` |
| Clap | `cp` | | Ride | `rd` |
| Toms (h/m/l) | `ht` `mt` `lt` | | Shaker / cowbell / tamb. | `sh` `cb` `tb` |

### Banques (`bank`) & sélection

```
s("bd sd,hh*16").bank("RolandTR909")   // préfixe la banque
s("hh*8").bank("RolandTR909").n("0 1 2 3")  // choisir LE sample (0-indexé)
s("hh:0 hh:1 hh:2")                    // ou avec ":" dans la mini-notation
```
Certaines banques n'ont pas tous les sons. `nom(4)` dans l'onglet *sounds* = 4 samples dispo.

### Sons d'instruments **General MIDI** (`gm_*`)

Ce qu'on utilise pour la guitare : `gm_acoustic_guitar_nylon`, `gm_acoustic_guitar_steel`, `gm_electric_guitar_clean`, `gm_electric_guitar_jazz`, `gm_distortion_guitar`, `gm_acoustic_bass`…
→ Ce sont des **soundfonts**. Conséquences (importantes, cf. §8) :
- **lazy loading** (muet au 1er jeu possible) ;
- le sampler **interpole depuis le sample le plus proche** → une note hors plage peut être **fine/absente**.

### Charger ses propres samples

```
samples('github:tidalcycles/dirt-samples')   // raccourci GitHub
samples({ gtr: 'gtr/0001_cleanC.wav' }, 'github:tidalcycles/dirt-samples')
```
On peut **accorder** un sample en précisant sa hauteur de base : `samples({ moog: { g3: '...g3.wav' }})` → le sampler choisit le sample le plus proche de la note jouée.

---

## §3 — Mini-notation (le langage des motifs)

Tout ce qui est entre `"..."` est de la mini-notation. **Règle d'or** : un cycle garde **toujours la même durée** ; plus tu mets d'événements, plus **chacun est court**.

| Symbole | Effet | Exemple |
|---|---|---|
| ` ` (espace) | séquence dans 1 cycle | `"c e g"` |
| `*n` | **n fois par cycle** (accélère) | `"[c e]*2"` |
| `/n` | sur **n cycles** (ralentit) | `"[c e]/2"` |
| `<...>` | **un élément par cycle** | `"<c e g>"` |
| `<...>*n` | n éléments par cycle | `"<c e g>*8"` |
| `[...]` | sous-division / imbrication | `"c [e g] c"` |
| `~` ou `-` | **silence** | `"c ~ e ~"` |
| `,` | **superposition / accord** | `"[c,e,g]"` |
| `@n` | **poids** (durée ×n) ; `_` allonge aussi | `"c@3 e"` |
| `!n` | **répète** sans accélérer | `"c!3 e"` |
| `?` / `?0.3` | retrait **aléatoire** (50 % / 30 %) | `"c*8?"` |
| `\|` | **choix aléatoire** | `"c \| e \| g"` |
| `(p,s,r)` | rythme **euclidien** (pulses, pas, rotation) | `"c(3,8)"` |

**Guillemets** : `"..."` = mini-notation · `` `...` `` = mini-notation **multi-ligne** · `'...'` = chaîne **brute** (pas parsée).

**Euclidien** : `(3,8)` = 3 frappes réparties sur 8 pas (= « Pop Clave »). Ex. `s("bd(3,8)")`.

---

## §4 — Le tempo

```
setcpm(90)        // 90 cycles par minute (global, une ligne avant le motif)
setcps(0.5)       // 0,5 cycle par seconde  (= setcpm(30))
s("...").cpm(90)  // en méthode de pattern
```

- **Défaut Strudel : 0,5 cps = 30 cpm** = **1 cycle toutes les 2 s**.
- Conversion : `setcpm(x)` = `setcps(x/60)`.
- **Pont BPM** : `setcpm(BPM / temps_par_mesure)`. Ex. `setcpm(120/4)` = **120 BPM en 4/4**. (C'est notre convention dans les modules.)

---

## §5 — Théorie musicale (fonctions *tonal*)

S'appuie sur **tonal.js**. Le cœur de nos modules 2 & 3.

### Gammes — `n(...).scale(...)`
```
n("0 2 4 6 4 2").scale("C:major")     // degrés 0-indexés → notes
n("0 1 2 3 4 5 6 7").scale("E:minor:pentatonic")
```
- Degrés **0-indexés**. **Négatifs** = on descend. `#`/`b` pour sortir de la gamme.
- Format : `root:type` **sans espaces** (espace = motif). Remplace les espaces par `:`.
- **Root sans octave → octave 3.**

### Accords — `chord(...).voicing()`
```
chord("<C G Am F>").voicing()              // symboles → voicings
n("0 1 2 3").chord("<C Am F G>").voicing()  // arpège (n choisit la note de l'accord)
```
`voicing()` accepte : `chord` (obligatoire), `dict`, `anchor`, `mode` (below/above/duck), `offset`, `n`.

### Transposer
```
.transpose(7)         // +7 demi-tons (chromatique)
.scaleTranspose(2)    // +2 degrés DANS la gamme
.add("<0 2 5>")       // arithmétique de notes (structure prise à GAUCHE)
.rootNotes(2)         // symboles d'accords → fondamentales en octave 2
```
> `.add()` (vérifié projet) : motif multi-pas **à gauche**, scalaire **à droite**. Sert pour cases/capo/formes mobiles/barrés (M3).

---

## §6 — Les effets

**Ordre de la chaîne du signal** (important : un même effet appelé 2× s'écrase, il ne s'empile pas) :
`gain → lpf → hpf → bpf → vowel → coarse → crush → shape → distort → tremolo → compressor → pan → phaser → postgain → (dry / delay / room)`.

### Filtres
```
.lpf(1000).lpq(10)   // passe-bas + résonance (alias cutoff/ctf)
.hpf(2000).hpq(5)    // passe-haut
.bpf(800).bpq(3)     // passe-bande
.ftype("<12db ladder 24db>")  // type de filtre (ladder = + agressif)
```

### Enveloppe d'amplitude (ADSR)
```
.attack(.1).decay(.2).sustain(.4).release(.5)
.adsr(".1:.2:.4:.5")
```
Enveloppe de **filtre** : `lpenv` + `lpa/lpd/lps/lpr`. Enveloppe de **hauteur** : `penv`, `pattack`, `pdecay`, `panchor`.

### Dynamique
```
.gain(.7)            // volume (exponentiel)
.velocity(.8)        // multiplié au gain
.compressor("-20:20:10:.002:.02")
.postgain(1.5)       // gain après tous les effets
```

### Couleur / saturation
```
.distort("2:.3")     // saturation (amount : postgain : type). ⚠️ ça monte vite en volume
.crush(8)            // bit-crush (1 = brutal … 16 = propre)
.coarse(4)           // réduction de sample rate
.pan(.5)             // position stéréo (0 gauche → 1 droite)
.jux(rev)            // applique une fonction seulement à droite (effet stéréo)
```

### Délai & réverb (globaux, par *orbit*)
```
.delay(.5).delaytime(.25).delayfeedback(.3)   // alias dt / dfb ; ou "delay:time:fb"
.room(.3).roomsize(2).rlp(8000)               // réverb ; alias size/sz ; ou "room:size"
.orbit(2)                                      // sépare les chaînes globales
```

### Phaser — « approxime les pédales de guitare connues »
```
.phaser(2).phaserdepth(.75).phasercenter(1000).phasersweep(2000)
```

### Durée des notes (clé pour le palm mute / le legato)
```
.clip(.3)   // alias legato : durée ×0,3 (staccato/étouffé) ; >1 laisse sonner
```

---

## §7 — Construire & transformer des motifs

### Plusieurs motifs en même temps
```
$: s("bd*4")              // dans le REPL : chaque "$:" = une couche jouée ensemble
$: note("e2 g2").s("gm_distortion_guitar")
stack(a, b)  cat(a, b)  seq(a, b)   // équivalents en fonctions (",  <>  espace")
run(4)       // = "0 1 2 3"
```

### Modifier le temps
`slow` `fast` · `rev` (inverse) · `palindrome` · `iter(n)` · `ply(n)` (répète chaque event) · `segment(n)`/`seg` (échantillonne un signal) · `euclid(p,s)` / `euclidRot` · `swing(n)` · `early`/`late` (décale) · `cpm(n)`.

### Modifier sous condition
`firstOf(n,f)` / `lastOf(n,f)` (tous les n cycles) · `when(pat,f)` · `chunk(n,f)` · `struct("x ~ x x")` (applique un rythme) · `mask(...)` · `arp("0 [0,2] 1")` (arpège un accord empilé) · `hush()`.
> Pour `sometimes`/`often`/`rarely`/`someCycles` → page **random-modifiers** (non détaillée ici).

### Signaux continus (LFO / hasard)
`sine` `saw` `cosine` `tri` `square` `rand` (0→1) · variantes `…2` (−1→1) · `perlin` · `irand(n)` (entiers) · `brand` · `mouseX/Y`.
S'utilisent avec `.range(min,max)` et `.segment(n)` :
```
s("bd*4,hh*8").lpf(sine.range(500,4000).slow(2).segment(16))
n(irand(8)).scale("C:minor")
```

---

## §8 — Gotchas & faits vérifiés (spécial Keymaker)

1. **Le `e2` muet — RÉSOLU (5 juin 2026, à l'oreille avec Felix)** — la **hauteur est juste** (`e2` = 82 Hz, confirmé moteur + doc). Cause réelle : **seule la banque `gm_acoustic_guitar_steel` ne descend pas jusqu'au Mi grave** (muette sous ~Fa2 / 87 Hz). Vérifié : le **matériel est bon** (`note("e2 e4").s("sine")` → 2 sons), et **nylon, électrique clean, disto et basse jouent tous `e2`**.
   - **Fix livré** : les 6 flashs M3 qui jouaient `e2` sur acier (**3.2, 3.3, 3.6, 3.8, 3.11, 3.12**) sont passés en `gm_acoustic_guitar_nylon`. App rebuildée (bundle `index-CekULCjI.js`, 34 modules), intégrité **94/94**.
   - **Règle à retenir** : pour une note **≤ Fa2**, **éviter `gm_acoustic_guitar_steel`** → préférer **nylon** (acoustique chaud, descend au Mi grave) ou la **basse** pour les fondamentales graves.
   - *(Toujours valable : le **lazy loading** peut rendre n'importe quel son muet au tout premier déclenchement — rejouer.)*
2. **Lazy loading général** : tout `s(...)` peut être silencieux la première fois. Ce n'est pas un bug de code.
3. **Closest-sample** : sur les `gm_*`, les extrêmes graves/aigus sont interpolés → timbre fin. Garder les mélodies guitare dans une plage médium quand c'est audible.
4. **Réverb/délai partagés par orbit** : si deux couches changent `room`/`roomsize` sur le même orbit → résultats imprévisibles. Séparer avec `.orbit(n)`.
5. **`distort` monte vite en volume** — toujours accompagner d'un `gain` raisonnable.
6. **Samples = téléchargement réseau au 1er usage**, puis cache. Vrai offline complet = chantier ultérieur (cache PWA).
7. **Rappel projet** : `@strudel.cycles/react` est **abandonné** → on reste sur le web-component `<strudel-editor>` (cf. roadmap, décisions Chantier 1).

---

## §9 — Fonctions utilisées dans Keymaker (M1→M4)

| Fonction | Rôle | Où, dans Keymaker |
|---|---|---|
| `sound`/`s` | choisir le son | partout |
| `note` | hauteur (noms/MIDI) | M1 hauteur, M3 guitare |
| `n` + `scale` | degrés de gamme | M2 gammes, M3 pentatonique |
| `chord` + `voicing` | accords | M2 accords, M3 grilles |
| `add` | transposer / formes mobiles | M3 cases, capo, barrés |
| `setcpm` | tempo (BPM/temps) | dès qu'il y a un groove |
| `stack` / `$:` | couches simultanées | bilans M1/M2/M3 |
| `struct` | séparer rythme & harmonie | M3 grattage |
| `clip` | durée de note / palm mute | M3 articulation |
| `gain` | dynamique | M3 nuances |
| `distort`/`phaser`/`delay`/`room` | effets/pédales | M3 effets |
| `bank` | banque de batterie | grilles & bilans |

---

> **Module 4 « Son & Effets » (Chantier 10) ajoute**, tous re-vérifiés §6/§7 en direct : filtres `lpf`/`lpq`/`hpf`/`bpf` · enveloppe d'ampli `attack`/`decay`/`sustain`/`release`/`adsr` · enveloppe de filtre `lpenv`/`lpa`/`lpd`/`lps` · saturation `distort`/`crush`/`coarse` · modulation `phaser`/`vib` · espace `room`/`roomsize`/`rlp`/`delay`/`delaytime`/`delayfeedback`/`orbit` · stéréo `pan`/`jux` · LFO `sine.range().segment()` · ondes `sine`/`triangle`/`square`/`sawtooth` & bruit `white`/`pink`/`brown`.

## §10 — Pages officielles (pour aller plus loin)

Base : `https://strudel.cc/learn/`
`notes/` · `sounds/` · `samples/` · `synths/` · `effects/` · `mini-notation/` · `tonal/` · `time-modifiers/` · `factories/` · `signals/` · `conditional-modifiers/` · `random-modifiers/` · `accumulation/` · `input-output/`
REPL : `https://strudel.cc/` (onglet **sounds** = liste réelle des sons, dont tous les `gm_*`).

---

*Distillé depuis strudel.cc le 5 juin 2026 (Astro v5). **Complété au Chantier 10 (6 juin 2026)** : Module 4 « Son & Effets » livré — §6/§7 (effets, ADSR, filtres, LFO, bruit) re-vérifiés en direct sur strudel.cc/learn/effects + /synths. À compléter pour les Modules 5-6 (informatique musicale · composition).*
