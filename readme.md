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
domina.meta
domina.shadow
domina.stylesheet
domina.template
domina.title

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

##
traversal. Komplett abwesend. parent, closest, children, siblings, next, prev, find. Für eine DOM-Lib ist das kein Extra.

Insertion-Basics. insertAt gibt es, append/prepend/before/after mit flatNodes-Normalisierung nicht.

```

- oftmals will man iwie ausm nichts zugreifen können
- oder vom elements aus
