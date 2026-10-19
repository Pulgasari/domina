# @domina/render — concept

a working draft. the decisions taken so far are listed at the end.

## goal

render a template into a container again and again, and write only what
changed. no vdom, no tree diff: the static parts of a template are parsed and
cloned once, the holes become parts that compare their last value with the new
one. the model lit-html made popular, without its syntax.

```js
import { html, render } from '@htx/js/render';   // htx syntax, this renderer

const view = ({ title, items }) => html`
  <section.card>
    <h2>${title}</h2>
    <ul>${each(items, item => item.id, item => html`<li>${item.name}</li>`)}</ul>
  </section>
`;

render(container, view(state));   // first call: clone, later calls: patch
```

## layers

```
htx (@htx/htx)       syntax: tag selectors, prop groups, merged class/style, shorthand tags
   │  program(strings)  → a description of the template, parsed once per template literal
   ▼
@domina/render       template cache, clone, parts, value comparison, helpers
   │
   ▼
DOM
```

**the renderer knows no syntax.** it takes a *program*: the static structure of
a template with numbered holes. htx produces programs from its syntax, but
anything that can describe a template that way can use the renderer (a
compiler, a plain-object builder, a future syntax).

the same htx syntax keeps feeding the existing h-adapters: `@htx/preact`, a
`@htx/vdom`, the one-shot builder in `@htx/js`. they plug into `createHTX(h)` as
today and nothing changes for them. the renderer plugs in one step earlier, at
the parsed program, because it has to know which values are static and which
come from holes; an `h` is called with finished values and can not tell.

```
                 ┌─ createHTX(h) ─► @htx/preact, @htx/vdom, @htx/js (builder)   unchanged
htx syntax ─ parse
                 └─ program()   ─► @domina/render                               new
```

## the program

the one interface between a syntax and the renderer. a tree with holes:

```js
// html`<section.card id=${id}><h2>${title}</h2>${body}</section>`
{
  nodes: [
    { tag: 'section', props: [['class', 'card'], ['id', { hole: 0 }]], children: [
      { tag: 'h2', props: [], children: [{ hole: 1 }] },
      { hole: 2 },
    ] },
  ],
}
```

| node | meaning |
|---|---|
| a string | static text |
| `{ tag, props, children }` | an element; `tag` may itself be `{ hole }` (a dynamic tag or a component) |
| `{ hole: n }` as a child | a child part, value `n` |
| `[name, value]` in props | a static prop, or `{ hole: n }` for a dynamic one |
| `{ spread: n }` in props | `...${object}` |
| `{ parts: [...] }` as a value | a value built from text and holes: `title="a ${b} c"` |

htx resolves everything it can while building, before the program exists: tag
selectors, prop groups, shorthand tags with a static name, positional values.
what reaches the renderer is plain elements, props and holes.

**needed in htx:** `build()` exists, but its output is htm's opcode array, an
internal format. htx gets a public `program(strings)` that turns it into the
tree above (cached per template literal like `build()`).

## the renderer

```js
import { render, tag } from '@domina/render';
import { program }     from '@htx/htx';

const html = tag(program);           // a template tag: (strings, ...values) => { program, values }
render(container, html`<p>${text}</p>`);
```

`tag(parse)` caches `parse(strings)` per template literal (the `strings` array is
the same object on every call of the same literal) and returns a light result
`{ program, values }`. `render(target, result)` does the rest:

1. **first render of a program in a target:** turn the program into a
   `<template>` once (cached per program), clone it, walk the clone once and
   collect the parts with their node references.
2. **later renders with the same program:** each part compares its new value
   with the last one (`Object.is`) and writes only on a change.
3. **another program in the same target:** the old instance is removed, the new
   one cloned.

the instance lives on the target (a `WeakMap`), so `render()` is all a caller
needs; aufbau calls it from `update()`.

## parts

| part | from | writes |
|---|---|---|
| child | `${value}` between tags | text, nodes, a nested template instance, a list |
| attribute | `title=${value}` | `setAttribute`, removed for `null`, `undefined` and `false` |
| property | a prop the element has as a property (`value`, `checked`) | the property, as `@domina/verbs/updateElement` decides today |
| event | `onClick=${fn}` | one listener per part that calls the current function, so a new function costs nothing |
| class | `class=${value}`, `class:x=${bool}` | merged with the static classes of the element, string, array or object |
| style | `style=${object}`, `style:name=${value}` | merged with the static style, removed keys are unset |
| spread | `...${object}` | sets new props, removes the ones gone since the last render; its class and style add up with the element's own |
| ref | `ref=${fn \| object}` | once per node, as in `@htx/js` |
| raw | `!html=${string}` | `innerHTML`, only on a change |
| tag | `<${Tag}>` | a string swaps the element, a function renders a component as a nested instance; a spread keeps its getters |

## values in a child part

| value | renders |
|---|---|
| string, number | a text node, updated in place |
| `null`, `undefined`, `false`, `true` | nothing |
| a node | that node |
| a template result | a nested instance, reused while its program stays the same |
| an array | a list of the above, by position |
| `each(list, key, row, otherwise)` | a keyed list: rows move with their key instead of being rebuilt, `otherwise` while empty |
| `when(condition, then, otherwise)` | one branch, the other one removed |
| `match(subject, cases, otherwise)` | the case whose value is the subject, keyed by case |
| a function | a live binding if an `effect` is set (below), otherwise called once |

## live bindings

```js
import { render }        from '@domina/render';
import { effect, scope } from 'some-signals';

const options = { effect: fn => effect(fn, null), scope: fn => scope(fn, null) };
render(container, html`<p>${() => $count}</p>`, options);   // the text node follows $count, nothing else re-renders
```

with an `effect` function configured, a function in a child, attribute, class
or style hole becomes an effect of its own: it reads its signals, the renderer
writes its result into that one part, and the effect runs again when a signal
changes. the effect is disposed with the part. event holes are not affected, a
function there is the handler.

a helper whose source is a function (`each(() => list, …)`, `when(() => ok, …)`)
is followed live, and then works fine-grained: a row is built once per key, a
branch once per switch, and both are kept while the source changes. what
changes inside them comes through their own live holes. a helper with a plain
value calls its rows and branches on every render and patches them, which is
what a re-rendering caller (aufbau) needs.

`scope(fn)` gives every component call, row and branch an owner of its own, so
the effects and cleanups they create are disposed with them. it runs fn
untracked as well: what a component reads while it is built does not subscribe
the effect around it. `effect` must create an effect that no other owner
disposes, the renderer holds and disposes it.

without `effect` the renderer works without any signal library, and a function
in a value hole is called once per render. that keeps `@domina/render` usable
for aufbau's update cycle and for plain pages.

this is what rat compiles to: every `{expr}` becomes `${() => expr}`, `@if`
becomes `when`, `@switch` becomes `match`, `@for` becomes `each`. rat passes
effect and scope per render call, not through `configure()`, so aufbau elements
on the same page keep their re-render mode.

## helpers

`when` and `each` describe child content, so they belong to the renderer that
interprets child parts: **in `@domina/render`**, re-exported by `@rat/runtime`
for compiled code. they are plain values (`{ type: EACH, … }`), not functions
with access to the renderer, so a program can hold them like any other value.

more helpers on the same model, if needed: `cache` (keeps the
instances of several branches instead of rebuilding), `live` (compares a
property against the dom, for inputs the user typed into).

## performance

- one `<template>` per program, cloned with `cloneNode(true)`: the html parser
  runs once per template, never per render
- parts are found by walking the clone once, then held as node references
- a render with nothing changed is one `Object.is` per hole
- no allocation per render beyond the result object `{ program, values }`
- batching is the caller's job: aufbau calls `render()` once per microtask
  (see `@aufbau/element` 3), rat never re-renders, its effects write single parts

target size: about 3 kb gz with `each` and `when`.

## later

- **hydration:** `render(target, result, { hydrate: true })` takes over nodes a
  server rendered from the same program (markers in the html) instead of
  cloning. the server side is an `h`-adapter that builds strings (`@htx/string`).
- **svg:** the program carries the namespace; a template whose root is inside an
  `<svg>` is parsed in an svg context.

## state

built: `tag`, `render`, `unrender`, `configure`, `each`, `when`, `match`, every
part of the table above, live bindings with scopes, svg. element parts update
after their children (a `<select>` has its options before its value, a ref sees
the content). `program()` is in `@htx/htx`, `@htx/js/render`
is the user facing tag. hydration is not built.

## decided

- the user facing tag lives in a subpath of the vanilla adapter: `@htx/js/render`
  exports `html` and `render` (it already depends on `@domina/verbs`).
- `configure({ effect, scope })` sets them globally, `render(target, result, { effect, scope })`
  per call; the call option wins.
- `when` and `each` live here, `@rat/runtime` re-exports them.
