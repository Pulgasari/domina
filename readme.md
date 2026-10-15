![Banner](/domina-002b-quant.png)

# domina

JavaScript toolkit for DOM mutation.

### demos | playground 
[chain](https://code.pulgasari.dev/domina/chain.html) ·
[proxy](https://code.pulgasari.dev/domina/proxy.html) 

## packages

| package              | dir                        | status  | mood   |
|----------------------|----------------------------|---------|--------|
| `@domina/analyzer`   | [dir](#)                   | concept |        |
| `@domina/chain`      | [dir](packages/chain)      | v0      | 🔥🥵🔥 |
| `@domina/element`    | [dir](packages/element)    | soon    |        |
| `@domina/observer`   | [dir](packages/observer)   | v0      | 🥺👉👈 |
| `@domina/prototypes` | [dir](packages/prototypes) | v0      | 🤔     |
| `@domina/proxy`      | [dir](packages/proxy)      | v0      | 🤔🧐😵‍💫 |
| `@domina/raf`        | [dir](packages)            | v0      |        |
| `@domina/render`     | [dir](packages/render)     | v0      |        |
| `@domina/sheets`     | [dir](package/sheets)      | v0      |        |
| `@domina/verbs`      | [dir](packages/methods)    | v0      | 😭😭😭 |

### `@domina/analyzer`

tool for analyzing a code base which is using @domina packages to provide plugins to get it cleaned up for production and/or optimized performance.

### `@domina/chain`

a hommage to jQuery.

### `@domina/domina`

your sincere excellence, the queen of the www, the dominatrix of humanity ...

### `@domina/element`

... coming soon ...

### `@domina/observer`

how to become a god and see everything.

### `@domina/prototypes`

alert! bad practice! danger! evil! forbidden! nobody does that kind of shit anymore!

### `@domina/proxy`

a proxy-like wrapper on `document` (without being a proxy or touching any prototype)

### `@domina/raf`

api to deal with `requestAnimationFrame`.

### `@domina/render`

api to render and update html-templates.

### `@domina/sheets`

api to deal with constructed stylesheets, css/stylesheet-files and style-elements.

### `@domina/verbs`

kinda standalone methods for dealing with the dom. that stuff every true vanilla-js-dev builds again all the time. enhanced.

---
---
---

**jump to:**
[installation](#installation)
[usage](#usage)
[docs](#docs)

---

## installation

### deno

```sh
deno install jsr:@domina/core
```

### pnpm

```sh
pnpm add jsr:@domina/core
```

## usage

### ESM

```javascript
import * as dom from 'https://esm.sh/jsr:@domina/core';
```

---

### Level 1

### Level 2

[`element`](#element)
[`elements`](#elements)
[`font`](#font)
[`fonts`](#fonts)
[`meta`](#meta)
[`stylesheet`](#stylesheet)
[`stylesheets`](#stylesheets)

```javascript
import { getElements, addClass, onEvent, setMeta } from '@pulgasari/domina';

getElements('.card').forEach(card => addClass(card, 'ready'));

const off = onEvent('.btn', 'click keydown', event => console.log(event.type));

setMeta({ description: 'Eine Seite', 'og:image': '/cover.png' });
```

## Zwei Ebenen

**`core`** — freistehende Funktionen. Jede funktioniert für sich, nimmt als erstes
Argument einen Selektor, ein Element oder ein Descriptor-Objekt, und gibt bei fehlendem
Element `null` zurück statt zu werfen.

```javascript
import { setAttr, getFormValues, observe } from '@pulgasari/domina';
```

**`sugar`** — dünne Namespaces über denselben Funktionen, für die Fälle, in denen man
dieselbe Sache mehrfach hintereinander anfasst.

```javascript
import { element, elements, form, meta, font, stylesheet } from '@pulgasari/domina';

element('#panel').addClass('open').setAttr({ ariaExpanded: true }).setText('Bereit');
elements('.row').addClass('striped');           // fächert über alle auf

meta.og.image = '/cover.png';
form('#login').values = { email: 'a@b.c' };
await font('Inter').add('/fonts/inter.woff2', { weight: '400' }).load();
```

Alles wird aus einem Paket exportiert. Wer nur ein Modul braucht, nimmt den Subpath:

```javascript
import { observe } from '@pulgasari/domina/observer';
import { element } from '@pulgasari/domina/sugar/element';
```

## Installation

```bash
deno add jsr:@pulgasari/domina
npx     jsr add @pulgasari/domina
```

## Dokumentation

Die vollständige API mit Signaturen und Beispielen steht in
**[core/readme.md](./core/readme.md)**.

## Pakete

| Paket | Stand | Inhalt |
|---|---|---|
| `core` | fertig | Die Funktionen und die `sugar`-Namespaces |
| `chain` | in Arbeit | Verkettender Zugriff, Hommage an jQuery |
| `pipe` | in Arbeit | Funktionaler Zugriff |

Gesammelte Ideen und Notizen liegen in [docs/ideas.md](./docs/ideas.md).

## Lizenz

MIT

![Logo](/logo.svg)
