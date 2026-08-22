# domina

JavaScript toolkit for DOM mutation.

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
