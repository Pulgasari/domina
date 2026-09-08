// setHead.js

import { arrayfied, isObject } from './../shared.js';
import { setLink }       from './setLink.js';
import { setMeta }       from './setMeta.js';
import { setTitle }      from './setTitle.js';
import { updateElement } from './updateElement.js';

/**
 * setHead({ title, meta, link, ...props })
 * meta takes a key/value map (or an array of them), link descriptor objects.
 * Remaining props are applied directly to <head> via updateElement.
 */
export function setHead ({ title, meta, link, ...props } = {}) {
  const head = document.head;
  if (!head) return null;

  if (title != null) setTitle(title);
  for (const spec of arrayfied(meta)) if (isObject(spec)) setMeta(spec);
  for (const spec of arrayfied(link)) setLink(spec);
  if (Object.keys(props).length) updateElement(head, props);

  return head;
}

export default setHead;
