// @domina/core/data.js

import { _el } from './internal/resolve.js';
import { isObject, isString } from './internal/is.js';
import { autoCast } from './internal/coerce.js';
import { toCamelCase } from './internal/case.js';

// dataset gibt immer Strings zurück – autoCast macht daraus wieder das,
// was im HTML gemeint war. Kein Schattencache, gelesen wird stets das DOM.
const key = name => toCamelCase(name);

const encode = value =>
  isString(value) ? value : (isObject(value) || Array.isArray(value)) ? JSON.stringify(value) : String(value);

export const

// getData(spec)         -> { userId: 5, active: true }
// getData(spec, 'user-id') -> 5
getData = (spec, name, { cast = true } = {}) => {
  const element = _el(spec);
  if (!element) return name ? null : {};

  if (name) {
    const raw = element.dataset[key(name)];
    return raw === undefined ? null : (cast ? autoCast(raw) : raw);
  }

  const all = {};
  for (const [k, raw] of Object.entries(element.dataset)) all[k] = cast ? autoCast(raw) : raw;
  return all;
},

hasData = (spec, name) => _el(spec)?.dataset[key(name)] !== undefined,

/**
 * setData(spec, 'user-id', 5)
 * setData(spec, { userId: 5, tags: ['a', 'b'] })
 * Objekte und Arrays werden als JSON abgelegt, null/undefined entfernt.
 */
setData = (spec, nameOrMap, value) => {
  const element = _el(spec);
  if (!element) return null;

  const map = isString(nameOrMap) ? { [nameOrMap]: value } : nameOrMap;

  for (const [name, val] of Object.entries(map ?? {})) {
    if (val == null) delete element.dataset[key(name)];
    else element.dataset[key(name)] = encode(val);
  }
  return element;
},

removeData = (spec, ...names) => {
  const element = _el(spec);
  if (!element) return null;
  for (const name of names.flat(Infinity)) delete element.dataset[key(name)];
  return element;
};
