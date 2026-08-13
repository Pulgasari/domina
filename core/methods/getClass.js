// @domina/core/methods/getClass.js

import { _el } from './../resolve.js';

// getClass(spec)      -> ['a', 'b']
// getClass(spec, 'a') -> boolean   (Kurzform von hasClass)
export const getClass = (spec, name) => {
  const element = _el(spec);
  if (!element) return name ? false : [];
  return name ? element.classList.contains(name) : [...element.classList];
};

export default getClass;
