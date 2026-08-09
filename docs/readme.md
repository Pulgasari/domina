# domina

[https://pulgasari.github.io/domina/docs/](https://pulgasari.github.io/domina/docs/)

Die vollständige API-Referenz steht in **[core/readme.md](../core/readme.md)**.
Diese Seite ist der Index: welcher Name liegt in welchem Modul.

## Interna

Diese drei laufen unter `core/internal/` und sind nicht Teil der öffentlichen API.

```md
_el    ->  resolveElement    Selektor | EDO | Node  -> Element | null
_doc   ->  resolveContext    Kontext für Queries, default document
_slct  ->  resolveSelector   EDO -> CSS-Selektor
_tgt   ->  resolveTarget     alles mit addEventListener passiert unverändert
```

## Modulindex

| Modul | Exporte |
|---|---|
| `query` | `getElement` `getElements` `getElementById` `getElementsByClass` `getElementsByName` `getElementsByTag` `getElementsByDataAttr` `getElementsByDataKey` `clone` |
| `element` | `createElement` `updateElement` |
| `create` | `createSVG` `createFragment` `createHTML` `createTemplate` `createTextNode` `createStyleElement` |
| `attr` | `getAttr` `hasAttr` `setAttr` `removeAttr` `toggleAttr` |
| `class` | `getClass` `hasClass` `setClass` `addClass` `removeClass` `toggleClass` `replaceClass` |
| `data` | `getData` `hasData` `setData` `removeData` |
| `content` | `getText` `setText` `getHTML` `setHTML` `setContent` `emptyElement` |
| `values` | `getValue` `setValue` `notifyChange` |
| `style` | `getStyle` `setStyle` `removeStyle` `getCssVar` `setCssVar` |
| `traverse` | `getParent` `getParents` `getClosest` `getChildren` `getSiblings` `getNext` `getPrev` `getNextAll` `getPrevAll` `getFirst` `getLast` `getIndex` `containsElement` `matchesElement` |
| `insert` | `appendTo` `prependTo` `insertBefore` `insertAfter` `moveTo` `insertAt` `wrap` `unwrap` `replaceElement` `removeElement` |
| `geometry` | `getRect` `getSize` `getOffset` `getPosition` `getOffsetParent` `getScroll` `setScroll` `scrollIntoView` `isInViewport` |
| `head` | `getHead` `getTitle` `setTitle` `setLink` `setHead` `upsertHead` |
| `meta` | `getMeta` `hasMeta` `setMeta` `removeMeta` `getMetaAttr` `getMetaElement` |
| `fonts` | `addFont` `hasFont` `loadFont` `getFonts` `removeFont` `fontsReady` `getFontStatus` `eachFont` |
| `stylesheet` | `setStyleElement` `createStylesheet` `adoptStylesheet` `releaseStylesheet` `hasStylesheet` `getStylesheets` `scopeStylesheet` |
| `events` | `onEvent` `onceEvent` `offEvent` `emitEvent` `onCustom` `waitForEvent` `delegate` `onOutside` |
| `observer` | `observe` `onConnected` `onDisconnected` `onAdded` `onRemoved` `onAttr` `onResize` `onVisible` |
| `raf` | `measure` `mutate` `frame` `nextFrame` `flushSync` |
| `dispose` | `disposer` |
| `form` | `getFormValues` `setFormValues` |
| `collection` | `sortElements` `filterElements` `groupElements` |

## Aliase

`update*` bleibt als Alias für die umbenannten Funktionen erhalten:
`updateTitle`, `updateHead`, `updateMeta`, `updateStyleElement`, `waitFor`.

## sugar

```md
element    elements
form
meta
font       fonts
stylesheet stylesheets
```

## chain

Verkettender Zugriff, Hommage an jQuery. Eigenes Paket, in Arbeit.

## pipe

Funktionaler Zugriff. Eigenes Paket, in Arbeit.

## Ideen

Gesammelte Notizen und Wunschlisten liegen in [ideas.md](./ideas.md).
