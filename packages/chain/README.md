# @domina/chain

##

[aria](#aria) ·
[attr](#attr) ·
[data](#data) ·
[dataset](#dataset) ·
[prop](#prop) ·
[html](#html) ·
[htx](#htx) ·
[on](#on) ·
[size](#size) ·
[style](#style) ·
[text](#text) ·
[](#) ·
[](#) ·
[](#) ·

---

strings in the dom, booleans mean presence.

### `attr`

```js
// read (get)
d(el).attr()                           // { name: value } of the first element
d(el).attr('href')                     // string | null

// write (set)
d(el).attr('href', '/next')
d(el).attr('hidden', true)             // hidden=""
d(el).attr('hidden', false)            // removed (as null)
d(el).attr({ role: 'tab', ariaSelected: true })   // camelCase -> kebab-case

// has
d(el).attr.has('disabled')              // boolean

// toggle
d(el).attr.toggle('open')                            // single
d(el).attr.toggle(['open', 'disabled'])              // multiple
d(el).attr.toggle({ 'open': true, disabled: false }) // multiple with force
```

### `prop`

the js side of the element

```js
d(input).prop('checked')               // boolean
d(input).prop('checked', true)
d(video).prop({ muted: true, currentTime: 0 })
```

### `data` | `dataset`

```js
// data-*: typed. reads are cast, writes encoded so they read back as written
d(el).data('userId', 42)               // data-user-id="42"
d(el).data('userId')                   // 42
d(el).data('open', true)               // data-open="true", reads back as true
d(el).data('config', { a: 1 })         // data-config='{"a":1}', reads back as an object
d(el).data()                           // { userId: 42, open: true, config: { a: 1 } }
d(el).data('state', null)              // removed

// data-* as the dom has it: strings in, strings out
d(el).dataset('userId')                // '42'
d(el).dataset({ state: 'open' })
```

### `aria`

aria-*: the prefix is optional, true and false are values

```js
d(el).aria('expanded', true)           // aria-expanded="true"
d(el).aria({ controls: 'menu', labelledby: ['title', 'hint'] })   // a list is joined
d(el).aria('expanded')                 // 'true'
d(el).aria()                           // { expanded: 'true', controls: 'menu', … }
d(el).attr('aria-hidden', false)       // aria-hidden="false": attr hands aria-* keys to aria
```

`attr` und `prop` sind getrennt, weil sie verschiedene Dinge sind (`attr('value')` ist der Startwert, `prop('value')` der aktuelle). `data` und `dataset` lesen das DOM, nicht einen Cache. `data` castet beim Lesen (`autoCast` aus den Methods: `'42'` → `42`, `'true'` → `true`, JSON → Objekt; `'007'` bleibt ein String) und kodiert beim Schreiben so, dass es als dasselbe zurückkommt. `dataset` ist das native `element.dataset`, nur mit `null` zum Entfernen und Maps. Die Grenze von `data`: Ein String, der wie eine Zahl aussieht (`data('id', '42')`), kommt als Zahl zurück; wer genau den String braucht, nimmt `dataset`.


### `style.computed`

```js

```

- Lesen liest den **berechneten** Wert. Das ist fast immer gemeint (jQuery tut dasselbe, sagt es aber nicht). Der Inline-Wert nur ausdrücklich.
- Zahlen bekommen `px`, außer bei einheitenlosen Eigenschaften (`opacity`, `z-index`, `flex-grow`, `line-height` …). Die Liste lebt in `setStyle` und ist dokumentiert, nicht magisch erweiterbar.
- `var` ist als Property-Name in JavaScript erlaubt (`obj.var(…)`). Falls es stört: `cssVar`.

### `size`

## 7. Geometrie

Ein Format für alles: **`x`, `y`, `w`, `h`**. Kein Mischen von `left`/`top`/`width`/`height` und Varianten.

```js
// size: layout size of the first element
d(el).width()                          // number, border box
d(el).height()

// setting writes the css properties width / height, nothing else
d(el).width(320)                       // style width: 320px

```

```js
// position
d(el).offset()                         // { x, y } relative to the document
d(el).position()                       // { x, y } relative to the offset parent
d(el).rect()                           // DOMRect, relative to the viewport (native, untouched)

d(el).position({ x: 10, y: 20 })       // style left / top (the element has to be positioned)
d(el).offset({ x: 100, y: 400 })       // left / top so that the element lands on these document coordinates
d(el).translate({ x: 0, y: -8 })       // css translate, does not touch layout
```

Regeln:

- **Gelesen wird die Layout-Größe** (`offsetWidth`/`offsetHeight` bzw. `clientWidth` für `content`), nicht `getBoundingClientRect()`. Der Rect enthält Transformationen: Ein mit `scale(.5)` animiertes Element meldet sonst die halbe Größe. Wer die sichtbare Größe will, nimmt `.rect()`. (Heute nutzt `getElementSize` den Rect; das wäre in `@domina/methods` zu entscheiden.)
- **Gesetzt wird genau die CSS-Eigenschaft.** jQuery rechnet bei `height(200)` je nach `box-sizing` Padding und Border heraus. `d` schreibt `height: 200px` und überlässt `box-sizing` dem CSS.
- `size({ w, h })` ist der kurze Weg für beides. Ein eigenes `resize()` gibt es nicht: `resize` ist ein Event-Name, und ein Verb, das so heißt wie ein Event, ist genau die Verwechslung, die jQuery mit `.resize(fn)` hatte.
- Keine `innerWidth`/`outerWidth(true)`-Familie. `box: 'content' | 'border' | 'scroll'` deckt es ab, `margin` liest man über `style('margin')`.

## 9. Inhalt

## `html`

```js
d(el).html()            // innerHTML of the first element
d(el).html('<b>hi</b>') // innerHTML; with the sanitizer where the browser has setHTML
```

## `htx`

## `on`

```js
d(el).on('click', handler)                             // handler (event, el)
d(el).on('click keydown', handler)                     // several types
d(list).on('click', 'li', (event, li) => …)            // delegated: el is the matched element
d(el).on('pointerdown', handler, { passive: true, signal })
```

## `size`

```js
d(el).size()                   // { w, h }
d(el).size({ box: 'content' }) // without padding and border
d(el).size({ box: 'scroll' })  // full scroll size
d(el).size({ w: 320, h: 200 })
d(el).size({ w: '50%' })       // strings pass through
```

## `style`

```js
d(el).style('opacity')                 // computed value of the first element, as string
d(el).style('opacity', { inline: true }) // the inline value only, '' if none
d(el).style('opacity', 0.5)
d(el).style({ width: 200, gap: '1rem', translate: '0 8px' })   // numbers: px, except unitless properties
d(el).style('width', null)             // removes the inline property

d(el).var('accent')                    // --accent, computed
d(el).var('accent', 'tomato')          // sets --accent (the -- is optional)
d(el).var({ accent: 'tomato', gap: 8 }) // numbers stay numbers: no px for custom properties
```

## `text`

```js
d(el).text()                           // textContent of the first element
d(el).text('Hallo')                    // every element

d(el).content(node, 'text', fragment)  // replaces the children: nodes as they are, strings as text
d(el).empty()                          // removes all children
```

`text()` liest **nur das erste** Element (jQuery verkettet die Texte aller, siehe Quirks).
