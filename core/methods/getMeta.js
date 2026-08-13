// @domina/core/methods/getMeta.js

import { getMetaElement } from './getMetaElement.js';

const head = () => document.head;

// getMeta()      -> { key: content } aller Meta-Tags
// getMeta('key') -> string | null
export const getMeta = key => {
  if (key === undefined) {
    const all = {};
    for (const el of head()?.querySelectorAll('meta') ?? []) {
      const name = el.getAttribute('name') ?? el.getAttribute('property') ?? el.getAttribute('http-equiv');
      if (name) all[name] = el.getAttribute('content') ?? '';
      else if (el.hasAttribute('charset')) all.charset = el.getAttribute('charset');
    }
    return all;
  }
  return getMetaElement(key)?.getAttribute('content') ?? null;
};

export default getMeta;
