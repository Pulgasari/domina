// @domina/core/methods/getData.js

import { resolveElement } from './resolveElement.js';
import { autoCast, toCamelCase } from './../shared.js';

// dataset gibt immer Strings zurück – autoCast macht daraus wieder das,
// was im HTML gemeint war. Kein Schattencache, gelesen wird stets das DOM.
export function getData (spec, name, { cast = true } = {}) {
  const element = resolveElement(spec);
  if (!element) return name ? null : {};

  if (name) {
    const raw = element.dataset[toCamelCase(name)];
    return raw === undefined ? null : (cast ? autoCast(raw) : raw);
  }

  const all = {};
  for (const [k, raw] of Object.entries(element.dataset)) all[k] = cast ? autoCast(raw) : raw;
  return all;
}

export default getData;
