// buildSelector.js

import { isObject, isString, toKebabCase } from './../shared.js';

const SKIP_KEYS = new Set(['tag', 'tagName', 'id', 'class', 'className', 'dataset', 'data']);

// scapes attribute values safely for CSS query selectors.
const escapeAttr = value => {
  const str = String(value);
  return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(str) : str.replace(/"/g, '\\"');
  //return CSS?.escape(str) ?? str.replace(/"/g, '\\"');
};

// Converts a selector string or Element Descriptor Object (EDO) into a valid CSS selector string.
export function buildSelector (sth) {
  if  (isString(sth)) return sth;
  if (!isObject(sth)) return '*';

  let selector = String(sth.tag || sth.tagName || '').toLowerCase();

  if (sth.id) {
    selector += '#' + escapeAttr(sth.id);
  }

  const className = sth.class || sth.className;
  if (className) {
    const cleaned = String(className).trim().replace(/\s+/g, '.');
    if (cleaned) selector += '.' + cleaned;
  }

  const data = sth.dataset || sth.data;
  if (isObject(data)) {
    for (const [k, v] of Object.entries(data)) {
      if (v === false || v == null) continue;
      const key = toKebabCase(k);
      selector += v === true ? `[data-${key}]` : `[data-${key}="${escapeAttr(v)}"]`;
    }
  }

  for (const [k,v] of Object.entries(sth)) {
    if (SKIP_KEYS.has(k) || v === false || v == null) continue;
    selector += v === true ? `[${k}]` : `[${k}="${escapeAttr(v)}"]`;
  }

  return selector || '*';
}
