# domina

JavaScript Library & Toolkit for working with the DOM.

# todo

mögliche namespaces

```md
domina.css.layers
domina.css.scopes
domina.css.tokens
domina.dataset
domina.element/node
domina.elements/nodes
domina.element.position (viewport, document, offet-parent, other element)
domina.element.size
domina.font
domina.form
domina.form.data
domina.image
domina.meta
domina.shadow
domina.stylesheet
domina.template
domina.title

doc.datasets
doc.elements
doc.eventListeners
doc.events
doc.fonts
doc.forms
doc.images
doc.links
doc.meta
doc.nodes
doc.scripts
doc.stylesheets
doc.templates
doc.title

## sub-packages
@domina/css
@domina/shadow

##

addClass
getAttribute
getClass
getDataset
getProperties
getStylesheet
hasAttribute
hasClass
removeAttribute
removeClass
removeDataset
removeMeta        -> single or namespace
removeStylesheet  -> single
setAttribute
toggleAttribute
toggleClass
updateAttribute
updateDataset
updateElement     -> single
updateHead        
updateMeta        -> single k/v or k/v-array or object or string
updateTitle       -> string


--- allgemein
events
stylesheets

--- am element
attributes
classNames
content
nodes
properties
style

-- elemente
create
delete
insert (append prepend after before)
move
remove
update

##
- es muss durchgehend camelcase/kebabcase gemanaged werden

```

```
document.getElementsByClassName()
document.getElementsByTagName()

document.anchors
document.body
document.documentElement
document.embeds
document.forms
document.head
document.images
document.links
document.scripts
document.title

.insertAdjacentText()
.insertAdjacentElement()
```

Wo es für dich interessant wäre: updateStylesheet könnte optional constructed Sheets nutzen statt <style>-Tags. Und dieses hier ist ein echter Toolkit-Kandidat, den es nirgends gibt:

```js
findRules('.card')          // in welchen sheets/regeln kommt der selektor vor
cssVars(el)                 // alle custom properties, die auf el gelten
```

E. Utils-Latte (dein Nebenpunkt)

Genau die Konvertierungen, die man ständig von Hand macht:

```js
// klassen / listen
toList('a b  c')            // ['a','b','c']       whitespace/komma-tolerant
toList(['a', ['b','c']])    // ['a','b','c']       flach
toList({ a: true, b: 0 })   // ['a']               objekt-form
toClass(input)              // 'a b c'             fürs class-attribut
toSelector(input)           // '.a.b.c'            für querySelector

// namen
camel('font-size')          // 'fontSize'
kebab('fontSize')           // 'font-size'
dataKey('data-user-id')     // 'userId'            dataset-zugriff
dataAttr('userId')          // 'data-user-id'

// werte
px(12)                      // '12px'              zahl -> einheit
px('50%')                   // '50%'               strings unangetastet
unpx('12px')                // 12
toBool('false')             // false               attribut-strings korrekt
autoCast('42')              // 42                  zahl/bool/json/string
autoCast('{"a":1}')         // { a: 1 }

// urls / params
toQuery({ a: 1, b: [2,3] }) // 'a=1&b=2&b=3'
fromQuery('a=1&b=2')        // { a: '1', b: '2' }

// html
escapeHTML(str)
stripHTML(str)
```

autoCast ist der Schlüssel für data() — data-count="0" soll 0 sein, nicht "0".

##

Was tatsächlich taugt: document.forms und form.elements — die sind nicht ersetzbar, weil elements auch Controls einschließt, die per form="id" außerhalb des Formulars stehen. querySelectorAll findet die nicht. select.options und table.rows sind ebenfalls solide. Der Rest ist Nostalgie; getElements('img') ist präziser und vorhersehbarer.
Fürs Toolkit interessanter ist die benannte Adressierung, die niemand mehr kennt:

```js
document.forms.login.elements.email     // statt querySelector('form[name=login] [name=email]')
form.elements.namedItem('tags')         // RadioNodeList bei mehreren gleichen Namen
form.elements.tags.value                // RadioNodeList.value = der gecheckte Radio
```

RadioNodeList.value ist ein echtes Juwel: gibt direkt den Wert des selektierten Radios, ohne Schleife. Deine getFormValues iteriert dafür manuell. Nicht falsch — aber für den Radio-Fall gäbe es die kürzere Variante.

##

Fonts/Images verschieben Layout nachträglich. document.fonts.ready und img.decode() kennt kaum jemand.

##

appendChild nimmt einen Node, append nimmt Nodes und Strings — aber append gibt nichts zurück, appendChild gibt den Node. Beim Verketten stolpert man.

## Custom Elements

connectedCallback feuert auch beim Verschieben. Es gibt kein „wirklich entfernt" — dein Observer hat das Problem auch.

## Live-Collections

getElementsByClassName, getElementsByTagName, .children, .forms sind live und mutieren während der Iteration. querySelectorAll ist statisch. Der Unterschied ist unsichtbar, bis die Schleife Elemente überspringt.

## scrolling

Scrolling: scrollTo, scrollBy, scrollIntoView, scrollTop=, scroll-behavior in CSS. Fünf Wege, unterschiedliche Smooth-Unterstützung, und es gibt kein scrollend-Event mit voller Browser-Deckung. „Warte bis Smooth-Scroll fertig" ist ein wiederkehrendes Selbstbau-Ding.

##
traversal. Komplett abwesend. parent, closest, children, siblings, next, prev, find. Für eine DOM-Lib ist das kein Extra.

Insertion-Basics. insertAt gibt es, append/prepend/before/after mit flatNodes-Normalisierung nicht.

Attribute + Dataset. attr/setAttr/removeAttr/toggleAttr, und data(el, key) mit JSON-Parsing — dataset gibt immer Strings zurück, das baut sich jeder selbst nach.
Text/HTML. setText, setHTML, getText.

Form-Serialisierung. getFormValues gibt ein Objekt — es fehlt toFormData und toQueryString. Zwei Zeilen, aber genau die zwei Zeilen tippt man ständig.
copyToClipboard / downloadBlob — trivial, aber nie zur Hand.

## FLIP, gekoppelt an die Collection-Ops

Du hast raf.js mit Read-vor-Write-Trennung und du hast drei Funktionen, die Elemente im DOM umordnen. Das ist exakt die Konstellation, in der FLIP trivial wird:
Js
measure() liest alle Rects, der Callback ordnet um, mutate() setzt inverse Transforms und lässt sie auslaufen. Deine frame(readFn, writeFn) ist praktisch dafür gebaut. Sortieren und Filtern, das animiert statt springt, ohne dass der Nutzer eine Animations-Library dazuholt — das ist ein echtes Alleinstellungsmerkmal und kostet dich vielleicht 60 Zeilen.

- oftmals will man iwie ausm nichts zugreifen können
- oder vom elements aus

Minimal-Move statt Blind-Append
sortElements macht $container.append(...items). Das reißt jedes Element aus dem DOM und hängt es neu ein. Konsequenzen: Focus geht verloren, <iframe> lädt neu, <video> stoppt, CSS-Transitions starten neu, Selection ist weg. Bei bereits korrekter Reihenfolge passiert trotzdem voller Aufwand.
Ein Reconciler, der nur bewegt was sich geändert hat (längste steigende Teilfolge, ~20 Zeilen), löst das komplett. Das ist keine Erfindung — Frameworks machen es intern — aber als freistehende Funktion in einer Lib habe ich es noch nicht gesehen:
Js
sortElements und groupElements benutzen es intern, und es ist einzeln nützlich.

## jQuery — was drin war
Grob nach Bereichen, damit man sieht, wo die Masse lag:
Selektion & Traversal (~30 Methoden): find, filter, not, has, closest, parent(s), parentsUntil, children, siblings, next(All|Until), prev(All|Until), first, last, eq, slice, add, end, index, is, contents, map, each

### Manipulation (~25): 

append(To), prepend(To), before, after, insertBefore/After, wrap, wrapAll, wrapInner, unwrap, remove, detach, empty, clone, replaceWith, html, text, val, attr, removeAttr, prop, addClass, removeClass, toggleClass, hasClass, data, removeData

### Geometrie (~12): 

css, width, height, innerWidth/Height, outerWidth/Height, offset, position, offsetParent, scrollTop, scrollLeft

### Events (~15): 

on, off, one, trigger, triggerHandler, plus Shortcuts (click, hover, …), Event-Objekt-Normalisierung, Delegation, Namespaces

### Effects (~10): 

show, hide, toggle, fadeIn/Out/To, slideUp/Down/Toggle, animate, queue, stop, delay

### Ajax (~10): 

$.ajax, $.get, $.post, $.getJSON, load, serialize, serializeArray

### Utilities (~20): 

$.each, $.map, $.grep, $.extend, $.merge, $.inArray, $.trim, $.type, $.isArray, $.param, $.Deferred, $.when, $.proxy, $.noop

### Ready/Plugin: 

$(document).ready, $.fn.extend

## Wo die Haken saßen

1. Utilities und Ajax sind tot. $.each → for...of. $.extend → Spread. $.Deferred → Promise. $.ajax → fetch. Das war ein Drittel der Lib und ist heute reiner Ballast. Was nicht tot ist: $.param (Objekt → Query-String) und serialize. Die tippt man immer noch selbst.

2. Effects waren die schlechteste Idee. animate() per setInterval auf JS-Thread, slideUp das height in Pixeln interpoliert. Heute: CSS-Transitions und WAAPI, beide auf dem Compositor. Aber das Problem, das jQuery gelöst hat, ist nicht weg — show/hide mit korrekter Rückgabe zum Original-display, und „animiere auf height: auto" ist mit CSS immer noch nicht direkt möglich. Da ist eine echte Lücke.

3. Die Kette war Wrapper und Kollektion in einem. $('.x').text() liest vom ersten, $('.x').text('y') schreibt auf alle. Diese Getter/Setter-Asymmetrie war die häufigste Fehlerquelle überhaupt. Dass du die Kette rausgezogen hast, umgeht es — aber sobald chain kommt, steht die Frage wieder da. Die Antwort ist: Getter geben ein Array, oder es gibt getrennte Einstiegspunkte für Einzel und Menge.

5. .data() war ein Cache, kein Dataset. $.data(el, 'x', {…}) schrieb in eine interne Map, nicht ins DOM. Nach .data('x', 5) stand im HTML immer noch der alte Wert. Ursache für endlose Verwirrung.
  
7. Kein Cleanup-Modell. .remove() räumte Handler auf, aber wenn du das Element per innerHTML überschriebst, leakte alles. Es gab keinen Weg, „alle meine Handler in diesem Bereich weg" zu sagen. Dein Disposer-Pattern ist hier strukturell besser — aber du hast noch keinen Gruppen-Disposer.

8. Alles oder nichts. 90 KB für $('.x').addClass('y'). Deine Subpath-Exports lösen das.

9. $ machte zu viel. Selektor, Konstruktor, DOM-ready, Wrapper — vier Bedeutungen für ein Zeichen.

Was daraus für domina folgt
Definitiv rein — das ist die Pflichtlücke
Traversal. find, closest, parent, parents, children, siblings, next, prev, is, index, contains. Wichtiger Unterschied zu jQuery: die Varianten mit optionalem Filter-Selektor (parents('.card'), nextAll('[data-x]')) sind das, was man wirklich braucht — nicht die ungefilterten.
Klassen. addClass/removeClass/toggleClass/hasClass/replaceClass, jeweils mit String, Array und Objekt ({ active: true, hidden: false }). Letzteres ist der Grund, warum man classList nicht direkt nimmt.
Attribute/Props. attr, setAttr, removeAttr, toggleAttr, prop. Plus — und das ist die Verbesserung gegenüber jQuery — data(el, key) das wirklich aus dem Dataset liest, aber JSON-Werte automatisch parst. Kein Schattencache.
Remove/Empty/Replace. Fehlt komplett.
Geometrie. rect, offset (relativ zum Dokument), position (relativ zum Offset-Parent), scroll get/set, size (Content vs. Border-Box). Alles über measure() aus raf.js, damit es batched.
CSS. css(el) liest computed, css(el, {…}) schreibt. Plus cssVar(el, '--x') — Custom Properties brauchen getPropertyValue, das weiß nicht jeder.
show/hide/toggle. Mit korrekter Rückgabe zum vorherigen display (im WeakMap gespeichert, nicht im Inline-Style hinterlassen).
Toolkit-Tier — selten, aber jedes Mal selbst gebaut
Scroll & Viewport: lockScroll (stapelbar, ohne Layout-Shift), scrollIntoViewIf, isInViewport, scrollbarWidth, onScrollEnd.
Focus & A11y: focusables(el), trapFocus(el), restoreFocus(), announce(text) für Live-Regions, setInert.
Animation: animateTo(el, keyframes, opts) → Promise. awaitTransition(el). Und die eine, die CSS nicht kann: animateSize(el, fn) — misst vorher/nachher, animiert height/width explizit, setzt danach zurück auf auto. Das ist jQuerys slideDown, aber richtig.
Forms: toFormData, toQueryString, validate (Constraint API auslesen und als Objekt zurückgeben), onDirty (Änderungen gegen Ausgangszustand tracken).
Media/Environment: onMedia(query, cb), prefersReducedMotion(), onlineStatus.
Clipboard/Files: copy(text), download(blob, name), onDrop(el, cb) mit Datei-Extraktion.
Templating light: fill(el, data) — füllt [data-field="name"] aus einem Objekt. Kein Framework, aber deckt „Server liefert HTML-Template, JS füllt es" ab.
Die zwei eigenständigen Ideen
reorder(container, items) — minimales Bewegen statt Blind-Append. Löst einen echten Bug in sortElements (Focus-Verlust, iframe-Reload, Transition-Neustart) und ist einzeln nützlich. Kein Framework exponiert das freistehend.
flip(items, mutateFn) — FLIP-Animation um beliebige DOM-Umordnung. Deine frame(read, write) ist buchstäblich dafür gebaut. sortElements mit Animation, ohne Animations-Library.
Und eine dritte, die ich vorher nicht genannt habe:
scope() — Gruppen-Disposer. Das ist jQuerys Cleanup-Loch, richtig gelöst:
Js
Jede Funktion, die einen Disposer zurückgibt, kann darüber laufen. Bei Komponenten-Lifecycles ist das genau das, was man ständig von Hand baut — ein Array voller stop-Funktionen.



