# @domina/chain

## usage

```js
import d from `@domina/chain':
```

```js
import { d, dd } from `@domina/chain':
```

---

## methods

[addClass](#addclass) ·
[after](#after) ·
[append](#append) ·
[appendTo](#appendto) ·
[aria](#aria) ·
[attr](#attr) ·
[before](#before) ·
[blur](#blur) ·
[children](#children) ·
[class](#class) ·
[click](#click) ·
[clone](#clone) ·
[closest](#closest) ·
[content](#content) ·
[data](#data) ·
[dataset](#dataset) ·
[emit](#emit) ·
[empty](#empty) ·
[find](#find) ·
[finished](#finished) ·
[focus](#focus) ·
[has](#has) ·
[hasClass](#hasclass) ·
[height](#height) ·
[hide](#hide) ·
[html](#html) ·
[htx](#htx) ·
[inView](#inview) ·
[index](#index) ·
[insert](#insert) ·
[jumpTo](#jumpto) ·
[moveTo](#moveto) ·
[next](#next) ·
[nextAll](#nextall) ·
[off](#off) ·
[offset](#offset) ·
[on](#on) ·
[once](#once) ·
[outside](#outside) ·
[parent](#parent) ·
[parents](#parents) ·
[position](#position) ·
[prepend](#prepend) ·
[prependTo](#prependto) ·
[prev](#prev) ·
[prevAll](#prevall) ·
[prop](#prop) ·
[rect](#rect) ·
[remove](#remove) ·
[removeClass](#removeclass) ·
[replace](#replace) ·
[reset](#reset) ·
[scroll](#scroll) ·
[scrollTo](#scrollto) ·
[show](#show) ·
[siblings](#siblings) ·
[size](#size) ·
[style](#style) ·
[text](#text) ·
[toggle](#toggle) ·
[toggleClass](#toggleclass) ·
[translate](#translate) ·
[unwrap](#unwrap) ·
[value](#value) ·
[values](#values) ·
[var](#var) ·
[visible](#visible) ·
[wait](#wait) ·
[width](#width) ·
[wrap](#wrap)

---

## addClass

```js
d(el).addClass('a b')                  // space separated or array
```

## after

```js
d(el).after(node)                      // as next sibling
```

## append

```js
d(list).append(item)                   // into, at the end
d('.row').append('neu')                // strings: fine for every target (as text)
d('.row').append(d.html`<i>neu</i>`)   // a template: instantiated per target
d('.row').append((row, i) => badge(i)) // a factory: one node per target
d('.row').append(node)                 // one node, several targets: error (dev), first target only (prod)
```

## appendTo

```js
d(item).appendTo(list)                 // the other direction, moves the set
```

## aria

```js
d(el).aria('expanded', true)           // aria-expanded="true"
d(el).aria({ controls: 'menu', labelledby: ['title', 'hint'] })   // a list is joined
d(el).aria('expanded')                 // 'true'
d(el).aria()                           // { expanded: 'true', controls: 'menu', … }
d(el).attr('aria-hidden', false)       // aria-hidden="false": attr hands aria-* keys to aria
```

## attr

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

## before

```js
d(el).before(node)                     // as previous sibling
```

## blur

```js
d(input).blur()                        // native method
```

## children

```js
d(el).children('li')                   // direct children, optional filter
```

## class

```js
d(el).class()                          // ['card', 'open'] of the first element
d(el).class('card compact')            // replaces the whole class list
```

## click

```js
d(button).click()                      // native method
```

## clone

```js
d(el).clone()                          // deep, without listeners; chain of the copies
```

## closest

```js
d(el).closest('.card')                 // self or ancestor
```

## content

```js
d(el).content(node, 'text', fragment)  // replaces the children: nodes as they are, strings as text
```

## data

```js
// data-*: typed. reads are cast, writes encoded so they read back as written
d(el).data('userId', 42)               // data-user-id="42"
d(el).data('userId')                   // 42
d(el).data('open', true)               // data-open="true", reads back as true
d(el).data('config', { a: 1 })         // data-config='{"a":1}', reads back as an object
d(el).data()                           // { userId: 42, open: true, config: { a: 1 } }
d(el).data('state', null)              // removed
```

## dataset

```js
// data-* as the dom has it: strings in, strings out
d(el).dataset('userId')                // '42'
d(el).dataset({ state: 'open' })
```

## emit

```js
d(el).emit('change:value', { value })                  // CustomEvent, bubbles; returns the chain
```

## empty

```js
d(el).empty()                          // removes all children
```

## find

```js
d(el).find('.item')                    // descendants
```

## finished

```js
await d(dialog).addClass('closing').finished()          // all running animations and transitions
await d(el).finished({ name: 'fade-out' })
```

## focus

```js
d(input).focus()                       // native method
```

## has

```js
d(el).has('img')                       // elements that contain a match
```

## hasClass

```js
d(el).hasClass('open')                 // first element
```

## height

```js
d(el).height()
```

## hide

```js
d(el).hide()                           // hidden
```

## html

```js
d(el).html()            // innerHTML of the first element
d(el).html('<b>hi</b>') // innerHTML; with the sanitizer where the browser has setHTML
```

## htx

```js

```

## inView

```js
d(el).inView()                         // boolean, any part visible
d(el).inView({ ratio: 0.5 })           // at least half
```

## index

```js
d(el).index()                          // position among the element siblings of the first, -1 if none
```

## insert

```js
d(list).insert(2, item)                // at an index among the children
```

## jumpTo

```js
d(el).jumpTo()                         // bring the element into view, instant
```

## moveTo

```js
d(item).moveTo(target, 'before')       // 'append' | 'prepend' | 'before' | 'after'
```

## next

```js
d(el).next()                           // optional filter
```

## nextAll

```js
d(el).nextAll()
```

## off

```js
d(el).off()                            // removes every listener added through THIS chain
```

## offset

```js
d(el).offset()                         // { x, y } relative to the document
d(el).offset({ x: 100, y: 400 })       // left / top so that the element lands on these document coordinates
```

## on

```js
d(el).on('click', handler)                             // handler (event, el)
d(el).on('click keydown', handler)                     // several types
d(list).on('click', 'li', (event, li) => …)            // delegated: el is the matched element
d(el).on('pointerdown', handler, { passive: true, signal })
```

## once

```js
d(el).once('transitionend', handler)
```

## outside

```js
d(el).outside(handler)                                 // pointerdown outside or escape
```

## parent

```js
d(el).parent()                         // direct parent, optional filter: parent('.list')
```

## parents

```js
d(el).parents('.section')              // all ancestors, optional filter
```

## position

```js
d(el).position()                       // { x, y } relative to the offset parent
d(el).position({ x: 10, y: 20 })       // style left / top (the element has to be positioned)
```

## prepend

```js
d(list).prepend(item)                  // into, at the start
```

## prependTo

```js
d(item).prependTo(list)
```

## prev

```js
d(el).prev()                           // optional filter
```

## prevAll

```js
d(el).prevAll()
```

## prop

```js
d(input).prop('checked')               // boolean
d(input).prop('checked', true)
d(video).prop({ muted: true, currentTime: 0 })
```

## rect

```js
d(el).rect()                           // DOMRect, relative to the viewport (native, untouched)
```

## remove

```js
d(el).remove()                         // chain of the removed elements, can be appended again
```

## removeClass

```js
d(el).removeClass('a b')
```

## replace

```js
d(el).replace(node)                    // replaces the element itself
```

## reset

```js
d(form).reset()                        // native
```

## scroll

```js
d(el).scroll()                         // { x, y } scroll position of the element
d(el).scroll({ y: 0 })                 // set, instant
d(el).scroll({ y: 0, smooth: true })

d(window).scroll()                     // the page
d(window).scroll({ y: 0, smooth: true })
```

## scrollTo

```js
d(el).scrollTo()                       // bring the element into view, smooth
d(el).scrollTo({ block: 'center', offset: 80 })   // offset for a sticky header
```

## show

```js
d(el).show()                           // removes hidden
```

## siblings

```js
d(el).siblings('.tab')
```

## size

```js
d(el).size()                   // { w, h }
d(el).size({ box: 'content' }) // without padding and border
d(el).size({ box: 'scroll' })  // full scroll size
d(el).size({ w: 320, h: 200 })
d(el).size({ w: '50%' })       // strings pass through
```

## style

```js
d(el).style('opacity')                 // computed value of the first element, as string
d(el).style('opacity', { inline: true }) // the inline value only, '' if none
d(el).style('opacity', 0.5)
d(el).style({ width: 200, gap: '1rem', translate: '0 8px' })   // numbers: px, except unitless properties
d(el).style('width', null)             // removes the inline property
```

## text

```js
d(el).text()                           // textContent of the first element
d(el).text('Hallo')                    // every element
```

## toggle

```js
d(el).toggle('open')                   // class "open"
d(el).toggle('[open]')                 // attribute open
d(el).toggle(':state(busy)')           // custom state (ElementInternals), if the element has one
```

## toggleClass

```js
d(el).toggleClass('open', force?)
```

## translate

```js
d(el).translate({ x: 0, y: -8 })       // css translate, does not touch layout
```

## unwrap

```js
d(el).unwrap()
```

## value

```js
d(input).value()                       // string; checkbox: boolean; select multiple: array
d(input).value('ada')
d(input).value('ada', { notify: true }) // fires input and change
d(input).value({ as: 'number' })       // reading with a cast: 'number' | 'date' | 'bool' | 'string'
```

## values

```js
d(form).values()                       // { name: value } of the form
d(form).values({ name: 'ada', newsletter: true })
```

## var

```js
d(el).var('accent')                    // --accent, computed
d(el).var('accent', 'tomato')          // sets --accent (the -- is optional)
d(el).var({ accent: 'tomato', gap: 8 }) // numbers stay numbers: no px for custom properties
```

## visible

```js
d(el).visible(force?)                  // toggles hidden; no argument = toggle
```

## wait

```js
const event = await d(el).wait('transitionend')          // the next event of this type
await d(el).wait('load', { timeout: 3000 })
```

## width

```js
d(el).width()                          // number, border box
d(el).width(320)                       // style width: 320px
```

## wrap

```js
d(el).wrap('div', { class: 'frame' })  // tag and props, or an element
```
