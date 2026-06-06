# Corrections audio Keymaker — 7 problèmes

> Diagnostic fait le 6 juin 2026, **vérifié en direct dans le vrai REPL strudel.cc** (chaque correctif a été rejoué et la console/le réseau inspectés).

> ✅ **Déjà appliqué dans tes cours** (`lessons.js`, `module7.js`, `module8.js`). Pour le break, j'ai **gardé l'Amen break** — le seul vrai souci était son nom de fichier avec espaces. Je le charge donc par URL directe **encodée** :
>
> `samples({ amen: 'https://raw.githubusercontent.com/yaxu/clean-breaks/main/sounds/The_Winstons_-_Amen_Brother%20%5B2019-03-04%20124550%5D.wav' })`
>
> Puis `s("amen/4").fit().chop(16)…` fonctionne normalement. Le passage à `breaks165` (montré plus bas) reste une alternative valable et plus simple si tu préfères.

---

## ⚡ TL;DR — la correction en 1 ligne par problème

| # | Symptôme | Cause | Correctif |
|---|----------|-------|-----------|
| 6.17 | `Invalid argument` | le sample `amen` de **clean-breaks ne se charge pas** | source → `dirt-samples`, sample → `breaks165` |
| 6.18 | `Invalid argument` | idem | idem |
| 7.12 | `Invalid argument` | idem | idem |
| 7.15 | `Invalid argument` (+ accord muet) | idem **+** `Abmaj7` | `breaks165` **+** `Ab^7` |
| 7.3 | reste sur « zero » | structure prise **à gauche** | `n("0 2 4 6").s("numbers")` |
| 7.5 | `Abmaj7`/`Bbmaj7` muets | `maj7` non reconnu | `Ab^7`, `Bb^7` |
| 7.25 | `Abmaj7` muet | `maj7` non reconnu | `Ab^7` |

Tout se ramène à **3 causes**. On les explique d'abord, puis le code corrigé prêt à copier.

---

## 🧠 Les 3 causes (le pourquoi)

### Cause 1 — Le break `amen` ne se charge pas → `Invalid argument`

C'est la cause des **4 erreurs** `Invalid argument` (6.17, 6.18, 7.12, 7.15).

Ce n'est **pas** ta technique (`fit`, `chop`, `slice` sont corrects et conformes à la doc). Le problème est en amont :

- `samples("github:yaxu/clean-breaks")` → le fichier `amen` s'appelle
  `The_Winstons_-_Amen_Brother [2019-03-04 124550].wav` (espaces + crochets). Dans le strudel.cc actuel il **ne se télécharge pas** (aucune requête réseau n'aboutit, testé plusieurs fois).
- `fit()` / `chop()` / `slice()` ont besoin de la **durée** du sample pour calculer les tranches. Si le sample n'est pas chargé, la durée vaut `NaN` → l'API audio renvoie `Invalid argument`.

**Preuve** : le même code avec `breaks165` (dirt-samples, nom de fichier propre) **fonctionne** dès que le sample est en cache.

> ⚠️ Petit piège de chargement (vrai pour TOUS les breaks) : au **tout premier** play d'un break, le sample n'a pas fini de se télécharger → tu peux voir `Invalid argument` une fois. **Relance** (Ctrl+Entrée) : au 2ᵉ play le break est en cache et ça marche. C'est normal, c'est juste le temps de chargement.

### Cause 2 — « reste sur zero » : la structure vient de GAUCHE

Concerne 7.3 (ligne 4).

```js
s("numbers").n("0 2 4 6")   // ❌ on entend seulement "zero"
```

En Strudel/Tidal, **le pattern le plus à gauche impose le rythme** (le nombre d'événements par cycle). `s("numbers")` = **1 seul** événement par cycle → seule la **1ʳᵉ** valeur de `n` (0) est lue. Les valeurs 2, 4, 6 ne sont jamais déclenchées.

**Preuve** : seul `numbers/0.wav` est téléchargé. Avec le correctif, `0.wav`, `2.wav`, `4.wav`, `6.wav` sont tous téléchargés.

```js
n("0 2 4 6").s("numbers")   // ✅ zéro, deux, quatre, six
```

> 💡 Principe à retenir pour toute ta formation : mets à **gauche** le pattern qui doit donner le rythme. Alternative équivalente : `s("numbers:0 numbers:2 numbers:4 numbers:6")` (la notation `:` fixe l'index directement — c'est pour ça que ta ligne 3 `s("numbers:3")` marchait déjà).

### Cause 3 — Les accords `maj7` sont muets

Concerne 7.5 et 7.25 (et un bonus caché dans 7.15).

`.voicing()` utilise un dictionnaire d'accords qui **ne connaît pas** le suffixe `maj7`. L'accord devient **vide** (zéro note) → silence.

Ce **n'est pas** lié aux bémols : `Cmaj7` est muet lui aussi. C'est bien le `maj7`.

**Preuve** :

| Écriture | `.voicing()` donne |
|----------|--------------------|
| `chord("Cm7")` | 5 notes ✅ |
| `chord("Cmaj7")` | **rien** ❌ |
| `chord("Ab^7")` | 5 notes ✅ |
| `chord("CM7")` | 4 notes ✅ |

**Correctif** : la notation 7ᵉ majeure en Strudel est **`^7`** (notation jazz/iReal), pas `maj7`.

- `Abmaj7` → **`Ab^7`**
- `Bbmaj7` → **`Bb^7`**
- (`M7` majuscule marche aussi : `AbM7`, mais `^7` est le standard.)

---

## ✅ Le code corrigé (prêt à copier)

### 6.17 — chop : trancher un break

```js
samples('github:tidalcycles/dirt-samples')
s("breaks165/4").fit().chop(16).cut(1)
```

### 6.18 — slice / splice : réordonner les tranches

```js
samples('github:tidalcycles/dirt-samples')
s("breaks165/4").fit().slice(8, "<0 2 1 3 4 6 5 7>").cut(1)
```

> `splice` = comme `slice`, mais il ajuste **tout seul** la vitesse de chaque tranche (donc **sans** `fit`) :
> `s("breaks165").splice(8, "<0 2 1 3 4 6 5 7>")`

### 7.3 — le vocal chop & le sample (ligne 4 corrigée)

```js
setcpm(124/4)
$: s("bd*4, ~ cp").bank("RolandTR909")
$: s("numbers:3").chop(8).gain(.7).room(.2)
$: n("0 2 4 6").s("numbers").gain(.55)   // ← n à gauche
```

### 7.5 — track house complet (accords corrigés)

```js
setcpm(124/4)
const drums  = s("bd*4, ~ cp ~ cp, [~ hh]*4").bank("RolandTR909")
const bass   = note("<c2 c2 ab1 bb1>").s("sawtooth").lpf(900).gain(.7)
const chords = chord("<Cm7 Ab^7 Bb^7 Cm7>").voicing().s("sawtooth").lpf(2000).attack(.1).gain(.4).room(.4)
const vox    = s("numbers:3").chop(8).gain(.5).room(.3)
arrange(
  [8,  bass],
  [8,  stack(drums, bass)],
  [16, stack(drums, bass, chords)],
  [8,  stack(drums, chords, vox)],
  [16, stack(drums, bass, chords, vox)],
  [8,  drums]
)
```

### 7.12 — le breakbeat : chop, iter, shuffle

```js
setcpm(170/4)
samples('github:tidalcycles/dirt-samples')
$: s("breaks165/4").fit().chop(16).iter(4).cut(1).gain(.9)
$: note("<c1 c1 eb1 c1>").s("sine").gain(.7)
```

### 7.15 — intro D&B avec break & drop (2 correctifs : break + accord)

```js
samples('github:tidalcycles/dirt-samples')
setcpm(170/4)
const sub   = note("[24,24.2]*4").s("sawtooth").lpf(700).lpq(6).gain(.55)
const brk   = s("breaks165/4").fit().chop(16).iter(4).cut(1).gain(.9)
const pad   = chord("<Cm7 Ab^7>").voicing().s("sawtooth").lpf(1500).attack(.5).release(.8).room(.6).gain(.3)
arrange(
  [8,  stack(pad, sub)],
  [8,  stack(pad, sub, s("~ ~ sd ~").bank("RolandTR808").gain(.5))],
  [16, stack(brk, sub, pad)],
  [8,  stack(pad, sub)]
)
```

> Note : `Abmaj7` était **aussi** muet ici (cause 3), en plus de l'erreur du break. Les deux sont corrigés.

### 7.25 — pièce ambient générative (accord corrigé)

```js
setcpm(20/4)
$: note("c2").s("sine").gain(.3).room(.5)
$: chord("<Cm7 Ab^7 Fm7 Gm7>").voicing().superimpose(x=>x.add(0.1)).s("sawtooth").lpf(sine.range(400,1600).slow(16)).attack(3).release(5).room(.85).roomsize(9).gain(.26)
$: n(irand(8).segment(2)).scale("C:minor").s("triangle").attack(1).release(4).delay(.6).delaytime(.5).delayfeedback(.5).room(.9).orbit(2).gain(.2).degradeBy(.5)
$: s("space").chop(16).slow(3).delay(.5).delayfeedback(.5).room(.9).orbit(3).gain(.16)
$: n("<0 3 5 7 10 7 5 3>").scale("C:minor").s("sine").slow(4).sometimesBy(.4, x=>x.add(12)).room(.8).gain(.16)
```

**À propos de `sometimesBy`** : il fonctionne bien. S'il « ne saute pas aux oreilles », c'est juste le tempo : `setcpm(20/4)` = 5 cycles/min (≈ 12 s par cycle) + `slow(4)` → les événements sont très espacés, donc les sauts d'octave (40 % du temps) sont rares et discrets. Pour **l'entendre clairement**, teste la ligne seule avec une proba plus haute et plus vite :

```js
n("0 3 5 7 10 7 5 3").scale("C:minor").s("sine").sometimesBy(.7, x=>x.add(12))
```

---

## 📌 Mémo pour la suite (à garder dans Keymaker)

1. **Breaks** : utilise `samples('github:tidalcycles/dirt-samples')` + `breaks165` (ou `breaks125`, `breaks152`, `breaks157`). Évite `clean-breaks` pour l'instant (les noms de fichiers avec espaces ne chargent pas). Si `Invalid argument` au 1er play → relance, le temps que ça charge.
2. **Sélectionner un sample dans un dossier** : `n(...).s("nom")` (n à gauche) **ou** `s("nom:0 nom:2 …")`. Jamais `s("nom").n(...)` avec plusieurs valeurs.
3. **Accord 7ᵉ majeure** : `^7` (ex. `C^7`), jamais `maj7`. Mineur 7 = `m7` (OK). Dominante = `7`.
