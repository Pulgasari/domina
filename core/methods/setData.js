// @domina/core/methods/setData.js

import { resolveElement } from './resolveElement.js';
import { isArray, isObject, isString, toCamelCase } from './../vendors.js';

const encode = value =>
  isString(value) ? value : (isObject(value) || isArray(value)) ? JSON.stringify(value) : String(value);

/**
 * setData(spec, 'user-id', 5)
 * setData(spec, { userId: 5, tags: ['a', 'b'] })
 * Objekte und Arrays werden als JSON abgelegt, null/undefined entfernt.
 */
export function setData (spec, nameOrMap, value) {
  const element = resolveElement(spec); if (!element) return null;
  const map     = isString(nameOrMap) ? { [nameOrMap]: value } : nameOrMap;

  for (const [name, val] of Object.entries(map ?? {})) {
    const key = toCamelCase(name);
    if (val == null) delete element.dataset[key];
    else element.dataset[key] = encode(val);
  }
  return element;
}

export default setData;
