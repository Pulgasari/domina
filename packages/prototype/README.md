# @domina/prototype

the dom verbs of domina right on the dom prototypes, for an app that owns its globals.

```js
import '@domina/prototype';
```

| on | methods |
|---|---|
| `Element`, `Document`, `DocumentFragment` (shadow roots too) | `getElement`, `getElements` |
| `EventTarget` (window, document, elements, signals …) | `onEvent`, `onEvents`, `emitEvent` |
| `Element` | `setProperties`, `setAttributes` |
| `CSSStyleDeclaration` | `setToken`, `setTokens`, `getToken`, `getTokens` |
| `EventTarget` | `waitForEvent` |
| `Element` | `getSiblings`, `getParents`, `getNextAll`, `getPrevAll`, `getIndex`, `isInViewport`, `waitForAnimations` |
| `HTMLFormElement` | `getValues`, `setValues` |

the methods are non-enumerable like the natives. a name a prototype has already is
overwritten with a warning: the app decides what its dom means. a library should not
import this, it changes the dom of the whole realm.

## getElement, getElements

```js
root.getElement('.row')                                   // the first match or null
root.getElements('li')                                    // a real array
root.getElements({ tag: 'li', class: 'row', dataset: { done: true } })
document.getElement({ ariaCurrent: 'page' })              // [aria-current="page"]
```

a spec is a selector or an object: `tag`, `id`, `class` (a string or a list), `dataset`,
any other key as an attribute in kebab-case. `true` asks for the attribute, `false` and
nullish leave the key out. an invalid selector gives `null` / `[]`, it does not throw.

## onEvent, onEvents, emitEvent

```js
const off = button.onEvent('click', save);                // off() removes it again
input.onEvent('input change', update, { passive: true });
const offAll = window.onEvents({ resize, 'online offline': sync });

el.emitEvent('select', { id });                           // bubbles, cancelable
if (!el.emitEvent('close')) return;                       // a listener called preventDefault()
```

`focus` and `blur` listen to `focusin` and `focusout`, so a container hears its descendants.

## setAttributes

```js
el.setAttributes({ ariaLabel: 'close', disabled: false, hidden: true, title: null });
```

camelCase keys become kebab-case. `false` and nullish remove, `true` sets the attribute
empty, anything else as a string. `aria-*` keeps `'true'` and `'false'`, they are values there.

## setProperties

```js
el.setProperties({
  hidden  : false,
  title   : 'settings',
  class   : ['panel', open && 'open'],
  style   : { gap: 8, lineHeight: 1.5, '--accent': 'tomato', marginTop: null },
  dataset : { id: 5, tags: ['a', 'b'] },
});
```

every key is set as a property, `undefined` is skipped. three take more:

- `style` as an object: kebab-case, numbers get `px` except where a number is the value
  (`opacity`, `lineHeight`, `zIndex` …), `--name` as it is, nullish and `false` remove.
  a string sets the style attribute.
- `dataset` (or `data`): objects and lists as json, nullish removes.
- `class` (or `className`): a string or a list, falsy entries dropped.

## tokens

```js
el.style.setToken('accent', 'tomato');                    // --accent: tomato
el.style.setTokens({ accent: 'tomato', size: 2 });
el.style.getToken('accent');                              // the inline value or null
getComputedStyle(el).getToken('accent');                  // the one in effect, inherited too
```

a token is a custom property, the name with or without its dashes. nullish and `false`
remove. `getToken` on `el.style` reads the inline value, on `getComputedStyle(el)` the
value in effect.

## relatives

```js
row.getSiblings('.selected')                             // arrays, a spec filters
el.getParents({ tag: 'section' })                        // the nearest first, up to <html>
el.getNextAll(), el.getPrevAll('.row')                   // the nearest first
el.getIndex()                                            // among its element siblings, -1 without a parent
```

## waiting

```js
const event = await video.waitForEvent('canplay error', { timeout: 5000, signal });
await panel.waitForAnimations({ name: 'slide-out' });    // then remove it
```

`waitForEvent` resolves with the first of the types and removes all its listeners; a
timeout rejects with an error, an aborted signal with its reason. `waitForAnimations`
counts a cancelled animation as done and resolves with the element.

## isInViewport

```js
el.isInViewport()                                        // a pixel is enough
el.isInViewport({ ratio: 1 })                            // all of it
```

## forms

```js
form.getValues()
// { title: 'hello', count: 3, agree: true, tags: ['a', 'c'], size: 'm', langs: ['de'] }

form.setValues({ title: 'new', tags: ['b'] });
form.setValues({ title: 'only' }, { missing: 'clear', notify: true });
```

named controls only, buttons left out, disabled ones unless `{ disabled: true }`. a
checkbox alone is a boolean, several of a name the list of the checked values. a radio
group is the checked value or `null`. number and range are numbers, empty is `null`. a
multiple select is a list, a file input a `File` (a list when multiple). strings are
trimmed unless `{ trim: false }`.

`setValues` leaves a name the object lacks or has as `undefined` alone, `{ missing: 'clear' }`
clears those. `{ notify: true }` fires `input` and `change` on the controls it set.
