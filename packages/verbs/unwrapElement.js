// unwrapElement.js

import { resolveElement } from './resolveElement.js';

// Removes wrapper, retains children. Returns freed nodes.
export function unwrapElement (spec) {
  const element = resolveElement(spec);
  if (!element?.parentNode) return null;

  const kids = [...element.childNodes];
  element.replaceWith(...kids);
  return kids;
}

export default unwrapElement;
