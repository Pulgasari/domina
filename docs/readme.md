# domina

[https://pulgasari.github.io/domina/docs/](https://pulgasari.github.io/domina/docs/)

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
