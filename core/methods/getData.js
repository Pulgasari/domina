// @domina/core/methods/getData.js

import { _el } from './../resolve.js';
import { autoCast, toCamelCase } from './../vendors.js';

// dataset gibt immer Strings zurück – autoCast macht daraus wieder das,
// was im HTML gemeint war. Kein Schattencache, gelesen wird stets das DOM.
export const getData = (spec, name, { cast = true } = {}) => {
  const element = _el(spec);
  if (!element) return name ? null : {};

  if (name) {
    const raw = element.dataset[toCamelCase(name)];
    return raw === undefined ? null : (cast ? autoCast(raw) : raw);
  }

  const all = {};
  for (const [k, raw] of Object.entries(element.dataset)) all[k] = cast ? autoCast(raw) : raw;
  return all;
};

export default getData;
