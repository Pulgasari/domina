// @domina/core/methods/removeMeta.js

import { isString } from './../shared.js';
import { getMetaElement } from './getMetaElement.js';

const head = () => document.head;

// removeMeta('description', 'og:image')
// Ein Key mit abschliessendem ':' loescht den ganzen Namespace: removeMeta('og:')
export function removeMeta (...keys) {
  const removed = [];

  for (const key of keys.flat(Infinity)) {
    if (!isString(key) || !key) continue;

    if (key.endsWith(':')) {
      for (const el of head()?.querySelectorAll('meta') ?? []) {
        const name = el.getAttribute('name') ?? el.getAttribute('property') ?? '';
        if (name.startsWith(key)) { el.remove(); removed.push(el); }
      }
      continue;
    }

    const element = getMetaElement(key);
    if (element) { element.remove(); removed.push(element); }
  }

  return removed;
}

export default removeMeta;
