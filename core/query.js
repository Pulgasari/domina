// @domina/core/query.js

import { _doc, _el, _slct } from './internal/resolve.js';

export const

getElement         = (spec, ctx) => _doc(ctx).querySelector(_slct(spec)) ?? null,
getElements        = (spec, ctx) => [..._doc(ctx).querySelectorAll(_slct(spec))],
getElementById     = (id,   ctx) => _doc(ctx).getElementById?.(id) ?? getElement(`#${id}`, ctx),
getElementsByName  = (name, ctx) => getElements(`[name="${name}"]`, ctx),
getElementsByTag   = (name, ctx) => getElements(name, ctx),
getElementsByClass = (name, ctx) => getElements(`.${name}`, ctx),

getElementsByDataAttr = (key, ctx) => getElements(`[data-${key}]`, ctx),
getElementsByDataKey  = (key, ctx) => getElements(`[data-key="${key}"]`, ctx),

eachElements = (spec, fn, ctx) => getElements(spec, ctx).forEach (fn),
mapElements  = (spec, fn, ctx) => getElements(spec, ctx).map     (fn),
  
clone = (spec, deep = true) => _el(spec)?.cloneNode(deep) ?? null;
