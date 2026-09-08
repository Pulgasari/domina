// @domina/core/methods/removeClass.js

import { resolveElement } from './resolveElement.js';
import { toList } from './../shared.js';

export function removeClass (spec, ...names) {
  const element = resolveElement(spec);
  if (!element) return null;
  const list = toList(names);
  if (list.length) element.classList.remove(...list);
  return element;
}

export default removeClass;
