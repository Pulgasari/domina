// @domina/core/internal/resolve.js

import { isElementish, isObject } from './is.js';

export const // resolveContext | resolveElement
_doc = sth => !sth ? document : sth.nodeType ? sth : _el(sth) ?? document,
_el  = (sth, ctx) => isElementish(sth) ? sth : _doc(ctx).querySelector(_slct(sth)) ?? null;   
/**
 * Selektor-String oder EDO -> CSS-Selektor.
 * tag/tagName, id, class/className, dataset/data + beliebige Attribute.
 */
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

