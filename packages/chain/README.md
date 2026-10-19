# @domina/chain

## 4. Attribute, Properties, Daten

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
