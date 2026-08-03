// query.js — öffentliche Suche im DOM.

import { _doc, _slct, _el } from './internal/resolve.js';

export const

getElement     = (spec, ctx) => _doc(ctx).querySelector(_slct(spec)) ?? null,
getElements    = (spec, ctx) => [..._doc(ctx).querySelectorAll(_slct(spec))],
getElementById = (id, ctx) => _doc(ctx).getElementById?.(id) ?? getElement(`#${id}`, ctx),

getElementsByDataAttr = (key, ctx) => getElements(`[data-${key}]`, ctx),
getElementsByDataKey  = (key, ctx) => getElements(`[data-key="${key}"]`, ctx),

clone = (spec, deep = true) => _el(spec)?.cloneNode(deep) ?? null;
