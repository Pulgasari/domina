// @domina/core/internal/resolve.js

import { isElementish, isFn, isObject, toKebabCase } from './vendors.js';
import { buildSelector } from './methods/buildSelector.js';

const NODE      = Symbol.for('domina.node');

// Resolves input to a valid query root context (Document, Element, or ShadowRoot).
export const resolveContext = sth => {
  if (!sth)               return document;
  if (sth.nodeType)       return sth;
  if (sth.document)       return sth.document; // Window instance
  if (sth[NODE] === true) return sth.node ?? document;
  
  // If a wrapper or descriptor was passed as context, attempt resolving it
  const resolved = resolveElement(sth);
  return resolved?.nodeType ? resolved : document;
};


// resolves input (Selector, EDO, Node, or Wrapper) to a single DOM Element.
export const resolveElement = (sth, ctx) => {
  if (!sth)               return null;
  if (sth[NODE] === true) return sth.node ?? null;
  if (isElementish(sth))  return sth;

  const selector = buildSelector(sth); if (!selector) return null;

  try   { return resolveContext(ctx).querySelector(selector) ?? null; }
  catch { return null; } // Return null on invalid selector DOMExceptions
};

export const resolveNode = sth => sth instanceof Node ? sth : resolveElement(sth);
// Resolves input to a valid EventTarget (Window, Worker, Element, etc.).
export const resolveTarget = (sth, ctx) => isFn(sth?.addEventListener) ? sth : resolveElement(sth, ctx);


export const // short internal aliases for high-performance intra-module calls
_doc  = resolveContext,
_el   = resolveElement,
_slct = buildSelector,
_tgt  = resolveTarget;



// ==================== OLD ========================================

// @domina/core/internal/resolve.js
/*
import { isElementish, isFn, isObject } from './internal/is.js';

const NODE = Symbol.for('domina.node');

export const // resolveContext | resolveElement
_doc = sth => !sth ? document : sth.nodeType ? sth : _el(sth) ?? document,
_el = (sth, ctx) =>
    sth?.[NODE] === true ? sth.node
  : isElementish(sth)    ? sth
  : _doc(ctx).querySelector(_slct(sth)) ?? null;
export const _slct = sth => {
  if (!isObject(sth)) return sth;

  let selector = String(sth.tag || sth.tagName || '').toLowerCase();

  if (sth.id) selector += '#' + sth.id;

  const className = sth.class || sth.className;
  if (className) selector += '.' + String(className).trim().split(/\s+/).join('.');

  const data = sth.dataset || sth.data;
  if (isObject(data)) {
    for (const [k, v] of Object.entries(data)) selector += `[data-${k}="${v}"]`;
  }

  const SKIP = ['tag', 'tagName', 'id', 'class', 'className', 'dataset', 'data'];
  for (const [k, v] of Object.entries(sth)) {
    if (SKIP.includes(k)) continue;
    selector += `[${k}="${v}"]`;
  }

  return selector || '*';
};

// any eventtarget passes through untouched (window, mediaquerylist, worker, audio …),
// everything else takes the selector path
export const _tgt = (sth, ctx) => isFn(sth?.addEventListener) ? sth : _el(sth, ctx);


export const

contextOf  = _doc,
elementOf  = _el,
nodeOf     = _el,
selectorOf = _slct
targetOf   = _tgt,

castContext  = _doc,
castElement  = _el,
castNode     = _el,
castSelector = _slct
castTarget   = _tgt,

resolveSpec     = _el,
resolveSelector = _slct,

toContext  = _doc,
toElement  = _el,
toNode     = _el,
toSelector = _slct
toTarget   = _tgt;
*/
