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

---

##
traversal. Komplett abwesend. parent, closest, children, siblings, next, prev, find. Für eine DOM-Lib ist das kein Extra.

Insertion-Basics. insertAt gibt es, append/prepend/before/after mit flatNodes-Normalisierung nicht.

Attribute + Dataset. attr/setAttr/removeAttr/toggleAttr, und data(el, key) mit JSON-Parsing — dataset gibt immer Strings zurück, das baut sich jeder selbst nach.
Text/HTML. setText, setHTML, getText.

Form-Serialisierung. getFormValues gibt ein Objekt — es fehlt toFormData und toQueryString. Zwei Zeilen, aber genau die zwei Zeilen tippt man ständig.
copyToClipboard / downloadBlob — trivial, aber nie zur Hand.

FLIP, gekoppelt an die Collection-Ops
Du hast raf.js mit Read-vor-Write-Trennung und du hast drei Funktionen, die Elemente im DOM umordnen. Das ist exakt die Konstellation, in der FLIP trivial wird:
Js
measure() liest alle Rects, der Callback ordnet um, mutate() setzt inverse Transforms und lässt sie auslaufen. Deine frame(readFn, writeFn) ist praktisch dafür gebaut. Sortieren und Filtern, das animiert statt springt, ohne dass der Nutzer eine Animations-Library dazuholt — das ist ein echtes Alleinstellungsmerkmal und kostet dich vielleicht 60 Zeilen.

- oftmals will man iwie ausm nichts zugreifen können
- oder vom elements aus
