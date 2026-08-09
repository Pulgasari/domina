# domina

[https://pulgasari.github.io/domina/docs/](https://pulgasari.github.io/domina/docs/)

## internal

```md
_el    ->  resolveElement
_slct  ->  resolveSelector
_tgt   ->  resolveTarget
```

## core methods

```md
addClass
addFont
createElement
createFragment
createStyleElement
createStylesheet
createTemplate
createTextNode
emitEvent
getAttribute
getClass
getDataset
getProperties
getStyleElement
getStylesheet
hasAttribute
hasClass
offEvent
onEvent
onceEvent
removeAttribute
removeClass
removeDataset
removeMeta
removeStyleElement
removeStylesheet
setAttribute
toggleAttribute
toggleClass
updateAttribute
updateClass
updateClassList
updateDataset
updateElement
updateHead        
updateMeta
updateStyleElement
updateStylesheet
updateTitle
```

```md
element()
elements()
```

## chain

chainable approach (hommage to jQuery)

## pipe

functional approach

## doc

`doc` bietet ne art `document` ersatz mit cleanem interface bestehend aus gettern und settern und objekt-like zugriff.

hängt direkt an `domina` oder kann sich via `doc` rausgezogen werden.

```javascript
import * as dom from '@domina/core'; // hier als 'doc' verfügbar
import      dom from '@domina/core'; // hier als 'doc' verfügbar und hängt direkt an 'dom'
```

```javascript
doc.id  ->  access element by id

dom.meta.bla = '123';
dom.meta['og:image'] = '123';
dom.meta.og.image = '123';
dom.meta.set({ bla: '123', blu: 'abc', 'og:image': '123' }); // set/update multiple

dom.meta.remove('og:'); // remove by namespace
dom.meta.remove('bla', 'blu'); // remove multiple at once
```

```md
doc.meta
doc.meta = {...};
doc.meta.og
doc.meta.og.title

doc.title
doc.title = 'new title';
```

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
```

```md
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
