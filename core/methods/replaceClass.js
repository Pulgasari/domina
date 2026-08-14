// @domina/core/methods/replaceClass.js

import { resolveElement } from './resolveElement.js';
import { toList } from './../shared.js';

export function replaceClass (spec, from, to) {
  const element = resolveElement(spec); if (!element) return null;
  
  // classList.replace() tauscht nur, wenn `from` vorhanden ist 
  // – hier soll `to` immer landen    
  element.classList.remove(...toList(from));
  element.classList.add   (...toList(to));
  
  return element;
}

export default replaceClass;
