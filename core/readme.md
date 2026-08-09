# @pulgasari/domina — core

## Konventionen

Der Präfix bestimmt die Rolle. Einwort-Exporte sind ausschließlich `sugar`-Namespaces.

| Präfix | Bedeutung |
|---|---|
| `create*` | erzeugt einen neuen Node |
| `get*` | liest — ohne Key die Gesamtheit, mit Key den Einzelwert |
| `set*` | schreibt — `(key, value)` **oder** eine Objekt-Map; `null`/`false` entfernt |
| `has*` | Boolean |
| `remove*` | entfernt, variadisch |
| `toggle*` | schaltet, optional mit `force` |
| `update*` | nur bei Elementen: Props in ein bestehendes Element mergen |
| `on*` / `off*` / `emit*` | Events und Observer |
| `*Elements` | Operationen über eine Item-Menge |

Dazu drei Regeln, die überall gelten:

1. **Das Subjekt kommt zuerst.** Jede Funktion nimmt als erstes Argument einen `spec`:
   einen Selektor-String, ein echtes Element oder ein Descriptor-Objekt
   (`{ tag: 'a', class: 'btn', data: { id: 5 } }`).
2. **Fehlt das Element, kommt `null` zurück.** Keine Exception, kein stiller No-Op-Wrapper.
   Schreibfunktionen geben sonst das Element zurück, damit sich Aufrufe verketten lassen.
3. **Namen werden konvertiert.** `ariaLabel` wird zu `aria-label`, `user-id` zu `userId` —
   je nachdem, was das DOM an der Stelle erwartet.

`update*` existiert weiterhin als Alias für die umbenannten `set*`-Funktionen
(`updateTitle`, `updateHead`, `updateMeta`, `updateStyleElement`).

---

## query

```javascript
getElement(spec, ctx?)              // Element | null
getElements(spec, ctx?)             // Element[]  (statisch, kein live HTMLCollection)
getElementById(id, ctx?)
getElementsByClass(name, ctx?)
getElementsByName(name, ctx?)
getElementsByTag(name, ctx?)
getElementsByDataAttr(key, ctx?)    // [data-key]
getElementsByDataKey(key, ctx?)     // [data-key="…"]
clone(spec, deep = true)
```

```javascript
getElement('#app');
getElement({ tag: 'input', name: 'email' });   // -> input[name="email"]
getElements('.row', '#table');                 // ctx als Selektor oder Element
```

## element / create

```javascript
createElement(tag = 'div', props?, ...children)
updateElement(spec, props?, ...children)

createSVG(tag = 'svg', props?, ...children)
createFragment(...nodes)
createHTML(html)                    // -> DocumentFragment, parst auch <tr>/<option>
createTemplate(html, props?)
createTextNode(text)
createStyleElement(cssOrProps)
```

`props` behandelt vier Schlüssel besonders und reicht den Rest als Property oder
Attribut durch:

```javascript
createElement('a', {
  class    : ['btn', { primary: isPrimary }],   // String, Array oder Objekt
  style    : { fontSize: 16, '--accent': 'tomato' },
  dataset  : { userId: 5 },
  appendTo : '#toolbar',                        // oder prependTo
  href     : '/x',
  onClick  : event => …,                        // Listener
  onVisible: element => …,                      // Observer, siehe unten
}, 'Klick mich');
```

## attr

```javascript
getAttr(spec)                       // { name: value } aller Attribute
getAttr(spec, name)                 // string | null
hasAttr(spec, name)
setAttr(spec, name, value)
setAttr(spec, { ariaLabel: 'x', disabled: false })
removeAttr(spec, ...names)
toggleAttr(spec, name, force?)
```

`false`/`null`/`undefined` entfernen das Attribut, `true` setzt es ohne Wert.

## class

```javascript
getClass(spec)                      // string[]
getClass(spec, name)                // boolean
hasClass(spec, names)               // alle müssen vorhanden sein
setClass(spec, names)               // ersetzt das ganze class-Attribut
addClass(spec, ...names)
removeClass(spec, ...names)
toggleClass(spec, names, force?)
replaceClass(spec, from, to)
```

Jede dieser Funktionen nimmt String, Array und Objekt — Letzteres ist der Grund,
warum man `classList` nicht direkt nimmt:

```javascript
addClass(el, 'a b', ['c', ['d']]);
toggleClass(el, { active: isOpen, hidden: !isOpen });
```

## data

```javascript
getData(spec)                       // { userId: 5, active: true }
getData(spec, name)                 // gecastet
getData(spec, name, { cast: false })
hasData(spec, name)
setData(spec, name, value)
setData(spec, { userId: 5, tags: ['a', 'b'] })
removeData(spec, ...names)
```

`dataset` gibt immer Strings zurück. `getData` castet zurück auf das, was im HTML
gemeint war: `"0"` wird `0`, `"true"` wird `true`, `'{"a":1}'` wird ein Objekt.
Führende Nullen bleiben String (`"007"` ist eine Kennung, keine 7). Objekte und Arrays
werden beim Schreiben als JSON abgelegt. Kein Schattencache — gelesen wird stets das DOM.

## content

```javascript
getText(spec)
setText(spec, text)
getHTML(spec)
setHTML(spec, html)                 // über <template>, dann replaceChildren
setContent(spec, ...nodes)          // ersetzt den Inhalt durch Nodes
emptyElement(spec)
```

## values

```javascript
getValue(node, mode?)               // mode: 'bool' | 'date' | 'number' | 'string'
setValue(node, value, { notify })
notifyChange(el)                    // input + change zusammen
```

Checkboxen liefern `checked`, Multi-Selects ein Array, alles ohne `value` den
`textContent`.

## style

Style-Properties am Element — für Stylesheets siehe unten.

```javascript
getStyle(spec)                      // CSSStyleDeclaration (computed)
getStyle(spec, property)            // '16px'
getStyle(spec, property, true)      // aus dem Inline-Style statt computed
setStyle(spec, property, value)
setStyle(spec, { fontSize: 16, '--accent': 'tomato' })
removeStyle(spec, ...properties)
getCssVar(spec, name, inline?)
setCssVar(spec, nameOrMap, value?)
```

Zahlen bekommen automatisch `px`, außer bei einheitslosen Properties
(`opacity`, `zIndex`, `lineHeight`, `flexGrow` …). `--custom-props` laufen über
`setProperty`/`getPropertyValue`, weil `element.style['--x']` nicht funktioniert.

## traverse

Jede Funktion nimmt einen optionalen Filter-Selektor — das ist der eigentliche Punkt,
nicht die ungefilterte Variante.

```javascript
getParent(spec, filter?)
getParents(spec, filter?)           // aufsteigend, nächster Vorfahre zuerst
getClosest(spec, selector)
getChildren(spec, filter?)
getSiblings(spec, filter?)
getNext(spec, filter?)              getNextAll(spec, filter?)
getPrev(spec, filter?)              getPrevAll(spec, filter?)
getFirst(spec, ctx?)                getLast(spec, ctx?)
getIndex(spec)                      // Position unter den Geschwistern, -1 wenn weg
containsElement(spec, other)
matchesElement(spec, selector)
```

## insert

```javascript
appendTo(spec, target)              prependTo(spec, target)
insertBefore(spec, target)          insertAfter(spec, target)
moveTo(spec, target, position?)     // 'append' | 'prepend' | 'before' | 'after'
insertAt(target, index, ...nodes)   // negativer Index zählt von hinten
wrap(spec, wrapper = 'div', props?)
unwrap(spec)                        // Hülle weg, Kinder bleiben
replaceElement(spec, ...nodes)
removeElement(...specs)
```

## geometry

```javascript
getRect(spec)                       // DOMRect
getSize(spec, { box })              // 'border' (default) | 'content' | 'scroll'
getOffset(spec)                     // { top, left } relativ zum Dokument
getPosition(spec)                   // { top, left } relativ zum offsetParent
getOffsetParent(spec)
getScroll(spec?)                    // ohne Argument: die Seite
setScroll(spec?, { top, left, behavior })
scrollIntoView(spec, options?)
isInViewport(spec, { ratio })       // ratio 1 = vollständig sichtbar
```

Diese Funktionen sind bewusst synchron — `getRect(el)` ist das, was man erwartet.
Wer viele Elemente hintereinander misst, packt die Aufrufe in `measure()` aus `raf`,
dann rechnet der Browser einmal Layout statt einmal pro Element.

## head / meta

```javascript
getHead()                           getTitle()
setTitle(title)
setLink({ rel, href, ... })         // idempotent über rel + href
setHead({ title, meta, link, ...props })
upsertHead(selector, make)          // findet oder legt an

getMeta()                           // { description: '…', 'og:image': '…' }
getMeta(key)
hasMeta(key)
setMeta(key, value)
setMeta({ description: '…', 'og:image': '…' })
removeMeta(...keys)                 // 'og:' löscht den ganzen Namespace
getMetaAttr(key)                    // 'name' | 'property' | 'http-equiv'
getMetaElement(key)
```

Das Attribut ergibt sich aus dem Key: Keys mit `:` werden `property`, bekannte
HTTP-Header werden `http-equiv`, alles andere `name`. `setMeta(key, null)` entfernt.

## fonts

```javascript
addFont(family, source, descriptors?)    // -> FontFace
hasFont(spec)                            // 'Inter' oder 'bold 16px Inter'
loadFont(spec, text?)                    // -> Promise<FontFace[]>
getFonts(family?)
removeFont(...families)
fontsReady()                             // -> Promise, alle Ladungen durch
getFontStatus()                          // 'loading' | 'loaded'
eachFont(callback)
```

## stylesheet

```javascript
setStyleElement(css, { id, media })      // <style>, mit id idempotent
setStyleElement(null, { id })            // entfernt

createStylesheet(css, { scope, layer, media, disabled })
adoptStylesheet(source, options)         // -> Promise<CSSStyleSheet|null>
releaseStylesheet(sheetOrKey, { target })
hasStylesheet(sheet, { target })
getStylesheets({ target })
scopeStylesheet(sheetOrRules, scope)
```

`source` ist CSS-Text, eine URL, eine `Response` oder ein fertiges `CSSStyleSheet`.
Adoptierte Sheets kommen in der Kaskade nach den Autor-Styles, überschreiben ein
`<link>` der Seite also ohne `!important`. `layer` dreht das um: gelayertes CSS
verliert gegen jede ungelayerte Regel — das Richtige für Komponenten-Basisstyles.

```javascript
await adoptStylesheet('/themes/nord.css', {
  scope : '[data-theme="nord"]',
  key   : 'theme:nord',
});
```

`key` dedupliziert; ein zweiter Aufruf mit demselben Key adoptiert nicht nochmal.
`replace: true` tauscht den Inhalt eines schon adoptierten Sheets, was seine Position
in der Kaskade stabil hält — genau das, was man beim Theme-Wechsel braucht.

## events

```javascript
onEvent(targets, types, handler, options?)     // -> off()
onceEvent(targets, types, handler, options?)   // feuert genau einmal, über alle Paare
offEvent(targets, types, handler, options?)
emitEvent(target, type, detail?, options?)     // -> false bei preventDefault
onCustom(targets, types, handler, options?)    // Handler bekommt e.detail
waitForEvent(target, type, { signal, timeout })// -> Promise<Event>
delegate(container, types, selector, handler, options?)
onOutside(spec, handler, { events, escape, root })
```

`targets` sind Selektoren (alle Treffer), Nodes, `window`/`document` oder Iterables
davon. `types` sind `'click keydown'` oder `['click', 'keydown']`. `focus`/`blur`
werden auf `focusin`/`focusout` gemappt, damit Delegation funktioniert.

Jede `on*`-Funktion gibt einen Disposer zurück.

## observer

Ein `MutationObserver` pro Root, geteilt von allen Subscribern — nicht einer pro Aufruf.

```javascript
observe(target, handlers)           // -> Disposer
observe({ '.card': handlers, ... }) // -> Disposer über alle

onConnected(node, cb)               onDisconnected(node, cb)
onAdded(target, cb)                 onRemoved(target, cb)
onAttr(target, spec)
onResize(target, cb)
onVisible(target, cb, options?)
```

```javascript
const stop = observe('.card', {
  onInit    : el => …,              // beim Initial-Scan bereits vorhanden
  onAdded   : el => …,              // später dazugekommen
  onMatch   : el => …,              // beides
  onRemoved : el => …,
  onAttr    : { 'data-state': (el, { name, value, old }) => … },
  onVisible : el => …,
  onResize  : (el, entry) => …,
});
```

Gibt ein `onInit`/`onAdded`/`onMatch`-Handler eine Funktion zurück, wird sie als
Cleanup für genau dieses Element aufgehoben.

## raf

Alle Lesevorgänge eines Frames laufen vor allen Schreibvorgängen, damit der Browser
einmal Layout rechnet statt einmal pro Element.

```javascript
measure(fn)                         // -> Promise, Lesephase
mutate(fn)                          // -> Promise, Schreibphase
frame(readFn, writeFn)              // beides im selben Frame — der nützliche Fall
nextFrame()
flushSync()                         // Notausgang
```

## dispose

```javascript
const scope = disposer();
scope.add(onEvent('.btn', 'click', fn));
scope.add(observe('.card', { onAdded }));
scope.dispose();                    // alles auf einmal weg
```

## form

```javascript
getFormValues(form, { trim, includeDisabled })
setFormValues(form, values, { notify, missing })   // missing: 'skip' | 'clear'
```

Mehrere Controls mit demselben Namen ergeben ein Array, Radios den gewählten Wert,
Checkboxen einen Boolean (einzeln) oder ein Array (mehrere), Files das `File`-Objekt.

## collection

```javascript
sortElements({ container, item, indicators })
filterElements({ container, item, filters, mismatchClass })
groupElements({ container, item, by, header, sort, groupClass, emptyKey })
```

```javascript
sortElements({ container: '#list', item: '.row', indicators: ['.name', 'num-desc'] });

filterElements({
  container : '#list',
  item      : '.row',
  filters   : [['.name', query], ['.price', min, 'num-ge']],   // UND-verknüpft
});
```

Sortier-Modi: `regular`, `num`, `date`, `auto`, jeweils mit `-asc`/`-desc`, plus
`random`. Filter-Modi: `contains`, `startsWith`, `endsWith`, `exact`, `num-*`, `date-*`
sowie eigene Funktionen.

---

# sugar

Dünne Namespaces über denselben core-Funktionen. Keine eigene Logik — `sugar` ruft
ausschließlich `core` auf. Wird aus dem Hauptexport mit durchgereicht.

## element / elements

```javascript
element(spec, ctx?)                 // gibt nie null zurück
elements(spec, ctx?)                // Array von Handles mit Fan-out
```

```javascript
element('#panel')
  .addClass('open')
  .setAttr({ ariaExpanded: true })
  .setText('Bereit');

if (!element('#missing').ok) …      // .ok fragt nach, .node liefert das rohe Element

elements('.row').addClass('striped');           // Kette -> die Liste
elements('.row').getText();                     // Wert  -> Array von Werten
const off = elements('.btn').onEvent('click', fn);  // Disposer -> einer für alle
```

`.find(spec)` und `.findAll(spec)` suchen im Handle weiter. Methoden, die ein Element
liefern (`parent`, `closest`, `next`, `clone` …), geben wieder ein Handle zurück.

## form

```javascript
const login = form('#login');

login.values;                       // { email: '…', remember: true }
login.values = { email: 'a@b.c' };
login.email;                        // das Control (RadioNodeList bei mehreren)
login.email = 'a@b.c';              // schreibt den Wert

login.on({
  input  : show,
  submit : event => { event.preventDefault(); if (login.checkValidity()) send(); },
});

login.reset();  login.submit();  login.reportValidity();
```

Der Feldzugriff geht über `form.elements.namedItem` und findet damit auch Controls,
die per `form="id"` außerhalb des Formulars stehen — `querySelector` findet die nicht.

## meta

```javascript
meta.description = 'Eine Seite';
meta.og.image    = '/cover.png';    // -> <meta property="og:image">
meta['og:title'] = 'Titel';

String(meta.og.image);              // liest den aktuellen Wert
delete meta.og.image;

meta.set({ description: '…', 'og:image': '…' });
meta.get('description');
meta.has('description');
meta.remove('og:');                 // ganzer Namespace
```

## font / fonts

```javascript
await font('Inter')
  .add('/fonts/inter.woff2', { weight: '400', display: 'swap' })
  .load();

font('Inter').has('16px');
font('Inter').faces;                // FontFace[]

fonts.families;                     // ['Inter', 'JetBrains Mono']
fonts.status;                       // 'loading' | 'loaded'
await fonts.ready;
```

## stylesheet / stylesheets

```javascript
const theme = stylesheet('/themes/nord.css', { key: 'theme', scope: '[data-theme]' });
await theme.adopt();
await theme.replace('/themes/gruvbox.css');   // Cascade-Position bleibt
await theme.release();

stylesheets().list;                 // adoptierte Sheets des Dokuments
stylesheets(shadowRoot).add(css);
stylesheets(el).clear();
```

---

## Subpath-Exports

```javascript
import { getAttr }  from '@pulgasari/domina/attr';
import { observe }  from '@pulgasari/domina/observer';
import { element }  from '@pulgasari/domina/sugar/element';
```

Jedes Modul hat einen eigenen Subpath: `query`, `element`, `create`, `attr`, `class`,
`data`, `content`, `values`, `style`, `traverse`, `insert`, `geometry`, `head`, `meta`,
`fonts`, `stylesheet`, `events`, `observer`, `raf`, `dispose`, `form`, `collection`,
`sugar` (und `sugar/element`, `sugar/form`, `sugar/meta`, `sugar/fonts`,
`sugar/stylesheet`).
