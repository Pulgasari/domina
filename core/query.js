// query.js

import { _doc, _slct, _el } from './internal/resolve.js';

export const

getElement         = (spec, ctx) => _doc(ctx).querySelector(_slct(spec)) ?? null,
getElements        = (spec, ctx) => [..._doc(ctx).querySelectorAll(_slct(spec))],
getElementById     = (id,   ctx) => _doc(ctx).getElementById?.(id) ?? getElement(`#${id}`, ctx),
getElementsByClass = (name, ctx) => { const d = _doc(ctx); return d.getElementsByClassName ? [...d.getElementsByClassName(name)] : getElements(`.${name}`, ctx); },    
getElementsByName  = (name, ctx) => getElements(`[name="${name}"]`, ctx),
getElementsByTag   = (name, ctx) => [..._doc(ctx).getElementsByTagName   (name)],

getElementsByDataAttr = (key, ctx) => getElements(`[data-${key}]`, ctx),
getElementsByDataKey  = (key, ctx) => getElements(`[data-key="${key}"]`, ctx),

clone = (spec, deep = true) => _el(spec)?.cloneNode(deep) ?? null;

/*
Und grundsätzlich: der einzige Vorteil dieser Methoden gegenüber getElements('.foo') ist Geschwindigkeit — und die verlierst du durch das [...]-Spreading sofort wieder, weil die live HTMLCollection zum statischen Array wird. Sie sind also reine API-Vertrautheit, keine Optimierung. Völlig legitim, aber erwarte keinen Performance-Gewinn.
*/
