// @domina/core/methods/addClass.js

import { resolveElement } from './resolveElement.js';
import { toList }         from './../utils.js';

export function addClass (spec, ...names) {
  const element = resolveElement(spec); if (!element) return null;
  const list    = toList(names);
  
  if (list.length) element.classList.add(...list);
  return element;
}

export default addClass;
