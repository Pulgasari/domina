// @domina/core/methods/setMeta.js

import { isObject, isString } from './../shared.js';
import { createElement }  from './createElement.js';
import { getMetaAttr }    from './getMetaAttr.js';
import { getMetaElement } from './getMetaElement.js';
import { removeMeta }     from './removeMeta.js';

const head = () => document.head;

/**
 * setMeta('description', '…')
 * setMeta({ description: '…', 'og:image': '…' })
 * null/undefined als Wert entfernt das Tag.
 */
export function setMeta (keyOrMap, value) {
  if (isObject(keyOrMap)) {
    const written = {};
    for (const [key, val] of Object.entries(keyOrMap)) written[key] = setMeta(key, val);
    return written;
  }

  const key = keyOrMap;
  if (!isString(key) || !key) return null;

  if (value == null) {
    removeMeta(key);
    return null;
  }

  const content = String(value);
  const element = getMetaElement(key);

  if (element) {
    element.setAttribute('content', content);
    return element;
  }
  return createElement('meta', { [getMetaAttr(key)]: key, content, appendTo: head() });
}

export default setMeta;
