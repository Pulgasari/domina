// query.js

import { _doc, _slct, _el } from './internal/resolve.js';

export const

/*
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

*/

getElement         = (spec, ctx) => _doc(ctx).querySelector(_slct(spec)) ?? null,
getElements        = (spec, ctx) => [..._doc(ctx).querySelectorAll(_slct(spec))],
getElementById     = (id,   ctx) => _doc(ctx).getElementById?.(id) ?? getElement(`#${id}`, ctx),
getElementsByClass = (name, ctx) => { const d = _doc(ctx); return d.getElementsByClassName ? [...d.getElementsByClassName(name)] : getElements(`.${name}`, ctx); },    
getElementsByName  = (name, ctx) => getElements(`[name="${name}"]`, ctx),
getElementsByTag   = (name, ctx) => [..._doc(ctx).getElementsByTagName   (name)],

getElementsByDataAttr = (key, ctx) => getElements(`[data-${key}]`, ctx),
getElementsByDataKey  = (key, ctx) => getElements(`[data-key="${key}"]`, ctx),

clone = (spec, deep = true) => _el(spec)?.cloneNode(deep) ?? null;
