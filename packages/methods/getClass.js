// @domina/core/methods/getClass.js

import { resolveElement } from './resolveElement.js';

// getClass(spec)      -> ['a', 'b']
// getClass(spec, 'a') -> boolean   (Kurzform von hasClass)
export function getClass (spec, name) {
  const element = resolveElement(spec);
  if (!element) return name ? false : [];
  return name ? element.classList.contains(name) : [...element.classList];
}

export default getClass;
