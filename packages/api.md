# @domina/chain – API-Skizze

`d` ist eine Verbeugung vor jQuery: eine Menge von Elementen, kurze Verben, alles verkettbar. Darunter liegen die Funktionen aus `@domina/methods`, `d` selbst ist nur Fassade. Das hier ist eine Skizze der Oberfläche. Gebaut ist bisher der Kern (siehe Stand).

## Stand

Gebaut: `d`, `dd`, `.all`, `attr`, `style`, `size`, `html`, `on`, `once`, `off`, `emit`, dazu `length`, `el`, `each`, `map` und `d.extend`. Ausprobieren: [`www/chain.html`](../../www/chain.html).

| Datei | |
|---|---|
| `chain.js` | die Menge (`Chain`) und `collect()`: Selektor, Ziel, Iterable → Elemente |
| `define.js` | baut Methoden aus Beschreibungen und führt das Register `d.api` |
| `api.js` | `attr`, `html`, `style`, `size` als Beschreibungen |
| `events.js` | `on`, `once`, `off`, `emit`; Listener pro Ziel |

Eine Methode ist **Daten**, keine Klasse:

```js
d.extend({
  shake: {
    params : { distance: 'number' },                 // for docs, types and the playground
    write  : (element, distance = 6) => element.animate(…),
  },
  label: {
    params : { text: 'string' },
    read   : element => element.getAttribute('aria-label'),
    write  : (element, text) => element.setAttribute('aria-label', text),
  },
  ping: element => element.dispatchEvent(new Event('ping')),   // a bare function is a setter
});
```

`define.js` baut daraus einmal eine Prototyp-Methode: `read` gibt es für das erste Element (oder alle, auf `.all`), `write` läuft über alle, `reads(args)` entscheidet zwischen beiden (Default: kein Argument oder ein einzelnes, das kein Plain Object ist). Eine Funktion als Wert bekommt `(old, el, i)`. `undefined` als letzter Wert wirft, wenn es einen Getter gibt. Wer mehr braucht, gibt `method` an (`this` ist die Kette, so sind die Events gebaut).

Gegenüber der Skizze unten geändert:
- `dd(…)` ist `d(…).all`, auch als `d.all(…)`. Setter funktionieren auf `.all` wie sonst auch.
- `.off()` wirkt pro **Element**, nicht pro Kette: `d('.tab').off()` löst, was irgendein `d('.tab').on()` angemeldet hat.
- `d.extend` mit einer Funktion ergibt immer einen Setter. Getter brauchen `read`.


```js
import d from '@domina/chain';

d('.card')
  .style({ opacity: 0, translate: '0 8px' })
  .attr({ role: 'article', tabindex: 0 })
  .on('click', '.more', (event, button) => d(button).closest('.card').toggle('open'));
```

---

## Inhalt
- [1. Regeln](#1-regeln)
- [2. `d()` selbst](#2-d-selbst)
- [3. Die Menge](#3-die-menge)
- [4. Attribute, Properties, Daten](#4-attribute-properties-daten)
- [5. Klassen und Zustand](#5-klassen-und-zustand)
- [6. Styles und Custom Properties](#6-styles-und-custom-properties)
- [7. Geometrie](#7-geometrie)
- [8. Scrollen](#8-scrollen)
- [9. Inhalt](#9-inhalt)
- [10. Einfügen, Bewegen, Entfernen](#10-einfügen-bewegen-entfernen)
- [11. Traversal](#11-traversal)
- [12. Events](#12-events)
- [13. Formulare](#13-formulare)
- [14. Warten](#14-warten)
- [15. Statische Helfer](#15-statische-helfer)
- [16. Erweitern](#16-erweitern)
- [17. jQuery-Quirks und was `d` stattdessen tut](#17-jquery-quirks-und-was-d-stattdessen-tut)
- [18. Verhältnis zu `@domina/element`](#18-verhältnis-zu-dominaelement)
- [19. Offene Fragen](#19-offene-fragen)

---

## 1. Regeln

Wenige Regeln, die überall gelten. Die meisten jQuery-Quirks entstehen dort, wo jQuery sie bricht.

1. **`d()` ist immer eine Menge.** Auch bei einem Element, auch bei keinem. Eine leere Menge ist kein Fehler: Setter tun nichts, Getter liefern `null`.
2. **Getter lesen das erste Element, Setter schreiben alle.** Ohne Ausnahme (jQuery bricht das bei `.text()`). Wer von allen lesen will, nimmt `.all` ([3](#3-die-menge)).
3. **Lesen oder schreiben entscheidet die Anzahl der Argumente, nicht ihr Wert.** `attr('id')` liest, `attr('id', value)` schreibt, auch wenn `value` `undefined` ist. `undefined` als Wert ist ein Fehler im Entwicklungsmodus, kein stilles Lesen.
4. **`null` entfernt.** `attr('hidden', null)`, `style('color', null)`, `data('id', null)`, `var('accent', null)`.
5. **Ein Objekt setzt mehrere.** `attr({ id: 'a', hidden: true })`, `style({ color: 'red', gap: 8 })`.
6. **Eine Funktion als Wert bekommt `(old, el, i)`.** Element zuerst, Index zuletzt, wie bei nativen Array-Methoden. Kein `this`.
7. **Setter geben die Menge zurück, Getter den Wert, Events auch die Menge.** Nichts gibt mal das eine, mal das andere zurück.
8. **Strings sind Text, nie HTML.** HTML gibt es nur ausdrücklich: `.html()`, `d.html\`…\``.
9. **Keine versteckten Zustände.** Kein Daten-Cache neben `dataset`, keine Animations-Queue, kein gemerktes `display`.
10. **Namen:** kurz, ganze Wörter, keine `get`/`set`-Präfixe. Aus `getElementSize`/`setStyle` wird `size()`/`style()`. Wo jQuery einen guten Namen hat, bleibt er (`attr`, `on`, `closest`, `append`); wo er abgekürzt oder irreführend war, nicht (`val` → `value`, `css` → `style`, `eq` → `at`).

---

## 2. `d()` selbst

```js
d('.card')                // selector, in document
d('li', list)             // selector, within a context (element, selector or chain)
d(element)                // one element
d(nodeList)               // NodeList, HTMLCollection, array, any iterable of elements
d(window)  d(document)    // allowed: events, scroll, size
d(chain)                  // returns the same chain, no copy
d()                       // empty set
```

Nicht erlaubt (anders als `$()`):

```js
d('<div>')                // not html: a selector, so an empty set (dev: warning)
d(() => {})               // not ready: use d.ready(fn)
```

Die Menge ist in Dokumentreihenfolge und ohne Duplikate, wenn sie aus mehreren Quellen entsteht (`d([a, a, b])`, Traversal).

---

## 3. Die Menge

```js
const items = d('li');

items.length              // count
items.el                  // first element or null
items.at(-1)              // chain with the last element (negative indices like Array.at)
items.first()  items.last()
items.toArray()           // Element[]
[...items]                // iterable

items.each((el, i) => …)  // chain, for side effects
items.map((el, i) => …)   // array, leaves the chain
items.filter('.done')     // chain; selector or (el, i) => boolean
items.not('.done')        // chain; the opposite
items.is('.done')         // boolean: does ANY element match
items.add('.extra')       // chain; union, deduplicated, document order
items.slice(0, 3)         // chain
```

### `.all`: Getter für alle

Getter lesen das erste Element. Für alle gibt es `.all`, das dieselben Getter als Arrays liefert:

```js
d('a').attr('href')          // '/one'
d('a').all.attr('href')      // ['/one', '/two', '/three']
d('input').all.value()       // ['ada', '', 'x']
d('.card').all.size()        // [{ w, h }, …]
```

`.all` hat nur Getter. Ein Setter auf `.all` ist ein Fehler, Setter schreiben ohnehin alle.

---

## 4. Attribute, Properties, Daten

```js
// attributes: strings in the dom, booleans mean presence
d(el).attr('href')                     // string | null
d(el).attr('href', '/next')
d(el).attr('hidden', true)             // hidden=""
d(el).attr('hidden', false)            // removed (as null)
d(el).attr({ role: 'tab', ariaSelected: true })   // camelCase -> kebab-case
d(el).attr()                           // { name: value } of the first element
d(el).hasAttr('disabled')              // boolean
d(el).toggleAttr('open', force?)

// properties: the js side of the element
d(input).prop('checked')               // boolean
d(input).prop('checked', true)
d(video).prop({ muted: true, currentTime: 0 })

// data-*: strings in, strings out
d(el).data('userId')                   // '42' (data-user-id)
d(el).data('userId', 42)               // data-user-id="42"
d(el).data({ state: 'open', step: 2 })
d(el).data()                           // { userId: '42', state: 'open', … }
d(el).data('state', null)              // removed
```

`attr` und `prop` sind getrennt, weil sie verschiedene Dinge sind (`attr('value')` ist der Startwert, `prop('value')` der aktuelle). `data` liest das DOM, nicht einen Cache, und castet nicht (siehe [17](#17-jquery-quirks-und-was-d-stattdessen-tut)).

---

## 5. Klassen und Zustand

```js
d(el).addClass('a b')                  // space separated or array
d(el).removeClass('a b')
d(el).toggleClass('open', force?)
d(el).hasClass('open')                 // first element
d(el).class()                          // ['card', 'open'] of the first element
d(el).class('card compact')            // replaces the whole class list

// state as booleans: class, attribute or custom state, one verb
d(el).toggle('open')                   // class "open"
d(el).toggle('[open]')                 // attribute open
d(el).toggle(':state(busy)')           // custom state (ElementInternals), if the element has one

// visibility through the hidden attribute, never through display
d(el).hide()                           // hidden
d(el).show()                           // removes hidden
d(el).visible(force?)                  // toggles hidden; no argument = toggle
```

`addClass` und Co. behalten ihre jQuery-Namen: lang genug, um eindeutig zu sein, und jeder kennt sie. `.class()` ist das kurze Gegenstück für die ganze Liste.

`toggle` mit Präfix ist eine Idee, die man auch weglassen kann; dann bleibt es bei `toggleClass`/`toggleAttr`.

---

## 6. Styles und Custom Properties

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

- Lesen liest den **berechneten** Wert. Das ist fast immer gemeint (jQuery tut dasselbe, sagt es aber nicht). Der Inline-Wert nur ausdrücklich.
- Zahlen bekommen `px`, außer bei einheitenlosen Eigenschaften (`opacity`, `z-index`, `flex-grow`, `line-height` …). Die Liste lebt in `setStyle` und ist dokumentiert, nicht magisch erweiterbar.
- `var` ist als Property-Name in JavaScript erlaubt (`obj.var(…)`). Falls es stört: `cssVar`.

---

## 7. Geometrie

Ein Format für alles: **`x`, `y`, `w`, `h`**. Kein Mischen von `left`/`top`/`width`/`height` und Varianten.

```js
// size: layout size of the first element
d(el).width()                          // number, border box
d(el).height()
d(el).size()                           // { w, h }
d(el).size({ box: 'content' })         // without padding and border
d(el).size({ box: 'scroll' })          // full scroll size

// setting writes the css properties width / height, nothing else
d(el).width(320)                       // style width: 320px
d(el).size({ w: 320, h: 200 })
d(el).size({ w: '50%' })               // strings pass through
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

---

## 8. Scrollen

```js
d(el).scroll()                         // { x, y } scroll position of the element
d(el).scroll({ y: 0 })                 // set, instant
d(el).scroll({ y: 0, smooth: true })

d(window).scroll()                     // the page
d(window).scroll({ y: 0, smooth: true })

d(el).scrollTo()                       // bring the element into view, smooth
d(el).scrollTo({ block: 'center', offset: 80 })   // offset for a sticky header
d(el).jumpTo()                         // the same, instant

d(el).inView()                         // boolean, any part visible
d(el).inView({ ratio: 0.5 })           // at least half
```

`scroll()` ist die eigene Scroll-Position, `scrollTo()` bewegt den Viewport zum Element. Das sind die Namen aus `@domina/methods` (`scrollTo`, `jumpTo`, `getScroll`/`setScroll`), nur ohne Präfix.

---

## 9. Inhalt

```js
d(el).text()                           // textContent of the first element
d(el).text('Hallo')                    // every element
d(el).html()                           // innerHTML of the first element
d(el).html('<b>hi</b>')                // innerHTML; with the sanitizer where the browser has setHTML
d(el).content(node, 'text', fragment)  // replaces the children: nodes as they are, strings as text
d(el).empty()                          // removes all children
```

`text()` liest **nur das erste** Element (jQuery verkettet die Texte aller, siehe Quirks).

---

## 10. Einfügen, Bewegen, Entfernen

```js
d(list).append(item)                   // into, at the end
d(list).prepend(item)                  // into, at the start
d(el).before(node)                     // as previous sibling
d(el).after(node)                      // as next sibling
d(list).insert(2, item)                // at an index among the children

d(item).appendTo(list)                 // the other direction, moves the set
d(item).prependTo(list)
d(item).moveTo(target, 'before')       // 'append' | 'prepend' | 'before' | 'after'

d(el).replace(node)                    // replaces the element itself
d(el).wrap('div', { class: 'frame' })  // tag and props, or an element
d(el).unwrap()
d(el).clone()                          // deep, without listeners; chain of the copies
d(el).remove()                         // chain of the removed elements, can be appended again
```

**Mehrere Ziele, ein Knoten.** Ein Knoten kann nur an einer Stelle hängen. jQuery klont ihn deshalb still für alle Ziele außer dem letzten, die Klone verlieren ihre Listener. `d` macht es ausdrücklich:

```js
d('.row').append('neu')                // strings: fine for every target (as text)
d('.row').append(d.html`<i>neu</i>`)   // a template: instantiated per target
d('.row').append((row, i) => badge(i)) // a factory: one node per target
d('.row').append(node)                 // one node, several targets: error (dev), first target only (prod)
```

---

## 11. Traversal

Alle geben eine neue Menge zurück, dedupliziert und in Dokumentreihenfolge. Kein `.end()`-Stapel: wer zurück will, hält eine Variable.

```js
d(el).find('.item')                    // descendants
d(el).closest('.card')                 // self or ancestor
d(el).parent()                         // direct parent, optional filter: parent('.list')
d(el).parents('.section')              // all ancestors, optional filter
d(el).children('li')                   // direct children, optional filter
d(el).siblings('.tab')
d(el).next()  d(el).prev()             // optional filter
d(el).nextAll()  d(el).prevAll()
d(el).has('img')                       // elements that contain a match
d(el).index()                          // position among the element siblings of the first, -1 if none
```

---

## 12. Events

```js
d(el).on('click', handler)                             // handler (event, el)
d(el).on('click keydown', handler)                     // several types
d(list).on('click', 'li', (event, li) => …)            // delegated: el is the matched element
d(el).on('pointerdown', handler, { passive: true, signal })
d(el).once('transitionend', handler)
d(el).outside(handler)                                 // pointerdown outside or escape
d(el).off()                                            // removes every listener added through THIS chain
d(el).emit('change:value', { value })                  // CustomEvent, bubbles; returns the chain

// native actions, never a listener
d(input).focus()  d(input).blur()  d(button).click()
```

- Der Handler bekommt `(event, el)`. `el` ist bei Delegation das passende Element, sonst das Element, an dem der Listener hängt. Kein `this`, Pfeilfunktionen funktionieren.
- **Abmelden ohne Handler-Referenz und ohne Namespaces:** `.off()` löst alles, was über diese Menge angemeldet wurde. Für alles andere `{ signal }`:

  ```js
  const stop = new AbortController;
  d('.tab').on('click', select, { signal: stop.signal });
  stop.abort();
  ```

- Wer einen einzelnen Disposer braucht, nutzt die Funktion darunter: `onEvent(el, 'click', fn)` aus `@domina/methods` gibt ihn zurück.
- `focus()`, `blur()`, `click()` rufen **nur** die native Methode. Event-Shorthands wie jQuerys `.click(fn)` gibt es nicht; Listener nur über `on`.
- `emit` gibt die Menge zurück. Wer wissen will, ob `preventDefault()` aufgerufen wurde, nimmt `emitEvent()` aus den Methods.
- **Vorschlag `trigger(action)`:** `emit` sendet ein Ereignis, `trigger` *tut* etwas, über die native Methode, sodass Standardverhalten und echte Events entstehen: `trigger('click')` → `el.click()`, `'focus'`, `'blur'`, `'submit'` → `requestSubmit()`, `'reset'`, `'select'`, `'showModal'`, `'close'`, `'showPopover'`, `'hidePopover'`, `'togglePopover'`, `'play'`, `'pause'`. Unbekannte Namen werfen statt still ein synthetisches Event zu schicken (ein `dispatchEvent(new Event('focus'))` fokussiert nichts, `'submit'` sendet nichts). Damit ersetzt `trigger` die einzelnen `focus()`/`blur()`/`click()` oben.

---

## 13. Formulare

```js
d(input).value()                       // string; checkbox: boolean; select multiple: array
d(input).value('ada')
d(input).value('ada', { notify: true }) // fires input and change
d(input).value({ as: 'number' })       // reading with a cast: 'number' | 'date' | 'bool' | 'string'

d(form).values()                       // { name: value } of the form
d(form).values({ name: 'ada', newsletter: true })
d(form).reset()                        // native
```

Bewusst `value`, nicht `val`. Der Rückgabetyp hängt vom Feld ab (Checkbox, Mehrfachauswahl); das ist der eine Ort, an dem das sinnvoll ist, und er ist dokumentiert.

`value({ as })` liest mit einem Objekt als einzigem Argument. Das ist die einzige Stelle, an der ein Objekt nicht „setzen“ heißt; offen, ob das so bleibt ([19](#19-offene-fragen)).

---

## 14. Warten

Promises verlassen die Kette. Die Menge ist **kein** Thenable (ein versehentliches `await d(…)` soll nichts Seltsames tun).

```js
await d(dialog).addClass('closing').finished()          // all running animations and transitions
await d(el).finished({ name: 'fade-out' })
const event = await d(el).wait('transitionend')          // the next event of this type
await d(el).wait('load', { timeout: 3000 })
```

`finished()` liefert die Menge, damit es danach weitergehen kann: `(await d(el).finished()).remove()`.

---

## 15. Statische Helfer

```js
d.ready(fn)                            // DOMContentLoaded or now
d.create('button', { type: 'button', class: 'primary', text: 'OK' }, child)  // chain
d.html`<li class="item">${name}</li>`  // template literal, values escaped; a template, not nodes yet
d(d.html`<li>…</li>`)                   // chain of fresh nodes from it
d.root  d.body  d.head                 // chains of document.documentElement, body, head

d.meta('description')                  // read
d.meta({ description: '…', 'og:image': '/cover.png' })
d.title()  d.title('Neu')

d.raf(() => …)                         // requestAnimationFrame with a disposer
d.frame()                              // promise for the next frame
```

`d.html` escapt eingesetzte Werte und liefert ein **Template**, noch keine Knoten. `append`, `prepend`, `before`, `after` und `content` erzeugen daraus pro Ziel frische Knoten; `d(template)` macht einmal Knoten daraus. HTML aus einem String gibt es nur über `.html()` am Element, nie über `d()`.

---

## 16. Erweitern

```js
d.extend({
  shake (el, distance = 4) { … },      // (el, ...args) per element; the chain is returned
});

d('.error').shake(8);
```

- `d.extend` wirft, wenn der Name schon existiert. jQuerys `$.fn.x = …` überschreibt still und global.
- Eine Erweiterung bekommt das Element, nicht `this`. Gibt sie etwas anderes als `undefined` zurück, wird sie zum Getter (erstes Element), sonst ist sie ein Setter (alle Elemente). Dieselbe Regel wie bei den eingebauten.
- Für Bibliotheken: `d.extend` verändert den gemeinsamen `d`. Eine Bibliothek sollte stattdessen `d.with({ … })` nutzen, das eine eigene Instanz von `d` mit den Erweiterungen zurückgibt.

---

## 17. jQuery-Quirks und was `d` stattdessen tut

| jQuery | Problem | `d` |
|---|---|---|
| `$()` nimmt Selektor, HTML, Funktion, Element | Mehrdeutig; `$(location.hash)` war ein bekannter XSS-Weg | `d()` nimmt nur Selektor und Elemente; HTML über `d.html`, Ready über `d.ready` |
| `.attr('x', undefined)` liest | `undefined` aus einer Variable macht aus einem Setter still einen Getter | Anzahl der Argumente entscheidet; `undefined` ist ein Fehler, `null` entfernt |
| `.text()` liest alle, `.html()` und `.attr()` das erste | uneinheitlich | alle Getter lesen das erste, `.all` liest alle |
| `.each((i, el) => …)` mit `this` | Index zuerst, anders als `Array.forEach` | `(el, i)`, kein `this` |
| `return false` in `.each` bricht ab | versteckte Bedeutung eines Rückgabewerts | kein Abbruch; dafür `for (const el of d(…))` |
| `.data()` hat einen Cache neben `dataset` und castet (`'1e3'` → `1000`) | DOM und `.data()` laufen auseinander; Werte ändern still ihren Typ | liest und schreibt `dataset`, Strings, kein Cast |
| `.height(200)` rechnet `box-sizing` heraus | anderes Ergebnis als `style.height = '200px'` | setzt genau die CSS-Eigenschaft |
| `.width()` und Co. in fünf Varianten | `innerWidth`, `outerWidth`, `outerWidth(true)` | `size({ box })` |
| `.show()`/`.hide()` merken sich `display` | versteckter Zustand, bricht mit CSS-Klassen | `hidden`-Attribut |
| Animations-Queue (`.fadeIn().delay()`) | versteckter Zustand, `.stop(true, true)` | keine Animationen; CSS und `finished()` |
| `.click(fn)` bindet, `.click()` löst aus | ein Name, zwei Bedeutungen | nur `on` bindet, `click()` ruft die native Methode |
| Namespaces `'click.menu'` zum Abmelden | eigene Mini-Sprache in Event-Namen | `.off()` pro Menge, `{ signal }` |
| `.append(node)` an mehrere Ziele klont still | Klone ohne Listener, Original nur im letzten | Fehler; Strings, Templates oder Factory pro Ziel |
| `.append('<b>x</b>')` parst HTML | Injektionsrisiko | Strings sind Text |
| `.end()`-Stapel | unsichtbarer Zustand in der Kette | Variablen |
| `.promise()`, `$.Deferred` | eigene Promise-Welt | native Promises, Kette ist kein Thenable |
| `$.fn.x = …` | global, überschreibt still | `d.extend` mit Kollisionsfehler, `d.with` für Bibliotheken |
| `.index()` mit vier Bedeutungen | je nach Argument | nur Position unter den Geschwistern |
| `.is()` | „irgendeins“, nicht dokumentiert offensichtlich | `is` heißt „irgendeins“, so dokumentiert |
| `.val()`/`.prop`/`.attr` für `checked` | drei Wege, zwei davon falsch | `attr` = Attribut, `prop` = Property, `value` = Formularwert |

---

## 18. Verhältnis zu `@domina/element`

`@domina/element` hat schon eine verkettbare Oberfläche: `element('#x').setAttr(…).addClass(…)`, mit `get`/`set`-Namen und einer Tabelle `_api.js`, die jedem Namen eine Methode und eine Art (`chain`, `value`, `stop`, `self`, `child`) zuordnet.

Vorschlag zur Abgrenzung:

| | `@domina/element` | `@domina/chain` (`d`) |
|---|---|---|
| Namen | ausführlich, `get`/`set` | kurz, Getter und Setter in einem Verb |
| Subjekt | ein Element (`elements()` für mehrere) | immer eine Menge |
| Events | geben Disposer zurück | geben die Kette zurück, `.off()`/`signal` |
| Laden | eager oder `lazy` | eager |

Beide sollten dieselbe Mechanik nutzen: eine Tabelle Name → Methode → Art, plus bei `d` ein **Argument-Adapter** pro Name (aus `size({ w, h })` wird `setStyle(el, { width, height })`, aus `offset()` wird `getElementOffset` mit Umbenennung `left/top` → `x/y`). Die Tabelle ist zugleich die Dokumentation der Fassade.

---

## 19. Offene Fragen

- **`toggle('[open]')` / `toggle(':state(x)')`:** eine Methode mit Präfix-Syntax, oder bei `toggleClass`/`toggleAttr` bleiben?
- **`value({ as: 'number' })`:** das einzige Objekt-Argument, das liest. Alternativ `number()`, `date()` als eigene Getter oder `value.as('number')`.
- **`var` oder `cssVar`:** `var` ist kürzer und erlaubt, liest sich aber für manche wie ein Schlüsselwort.
- **Leere Menge im Entwicklungsmodus:** warnen, wenn ein Setter auf eine leere Menge trifft (Tippfehler im Selektor), oder still bleiben?
- **`getData` castet heute** (`autoCast`), `getElementSize` misst über den Rect: Beides widerspricht den Regeln oben. In `@domina/methods` ändern oder in der Fassade umgehen?
- **`d.with` für Bibliotheken:** nötig, oder reicht der Kollisionsfehler von `d.extend`?
- **Größe:** `d` importiert alle Methoden, die es abbildet. Eine `lazy`-Variante wie bei `@domina/element` (Methoden erst beim ersten Aufruf laden) passt schlecht zu synchronen Gettern; eher eine `lite`-Variante mit Kernmenge?

### Zur alten 0-Version

`packages/chain/index.js` ist nicht lauffähig und kann ersetzt werden: `addClass` reicht `...a` statt `...args` weiter, mehrere Methoden nutzen `this.els` statt `this.elements`, importiert wird `@domina/core` (heute `@domina/methods`), `deno.json` heißt noch `@pulgasari/chain` und veröffentlicht `mod.js`, das es nicht gibt.

---

# todo

## verbs: base/core
- [x] `d` | `dd`

## verbs: chain
- [x] `all`
- [ ] `aria`
- [ ] `attr`
- [ ] `data` | `dataset`
- [x] `html`
- [x] `emit` | `off` | `on` | `once`
- [x] `size`
- [x] `style`

## verbs: maybe (?)
- [ ] `a11y`
- [ ] `add`
- [ ] `animate`
- [ ] `apply`
- [ ] `bind` | `unbind`
- [ ] `clear`
- [ ] `click`
- [ ] `ensure`
- [ ] `filter`
- [ ] `focus`
- [ ] `height`
- [ ] `hide` | `unhide`
- [ ] `htx`
- [ ] `insert`
- [ ] `lib`
- [ ] `md`
- [ ] `node`
- [ ] `observe`
- [ ] `paint`
- [ ] `pipe`
- [ ] `props`
- [ ] `raf`
- [ ] `rect`
- [ ] `refresh`
- [ ] `remove`
- [ ] `replace`
- [ ] `request`
- [ ] `rotate`
- [ ] `scale`
- [ ] `scrollTo` | `jumpTo`
- [ ] `select`
- [ ] `sort`
- [ ] `sync`
- [ ] `tag`
- [ ] `text`
- [ ] `token`
- [ ] `transform`
- [ ] `trigger`
- [ ] `width`
- [ ] `wrap` | `unwrap`

## some ideas


### `lib`

vllt könnte `lib` als ne art adapter/subchain-entrypoint dienen.

```js
//
d('#sidebar').lib('tailwind`).apply('m-4');

//
const gs = d.lib('gestalt');
const tw = d.lib('tailwind');

gs(`article.blogpost`).typo(...).surface(...);;
tw('#sidebar').apply('m-4');


```

könnte im prinzip sogar eingebaut sein?
- im browser = lazy import
- im bundler = wenn/falls `@domina/analyzer` existiert, wird halt nix mit gebundelt weil aufgelöst
  
