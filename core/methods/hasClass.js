// @domina/core/methods/hasClass.js

import { resolveElement } from './resolveElement.js';
import { toList }         from './../utils.js';

export function hasClass (spec, names) {
  const element = resolveElement(spec); if (!element) return false;
  const list    = toList(names);
  
  return list.length > 0 && list.every(name => element.classList.contains(name));   
}

export default hasClass;
