// @domina/core/methods/replaceElement.js

import { resolveElement } from './resolveElement.js';
import { flatNodes } from './../shared.js';

// Replaces element with given nodes. Returns new nodes.
export function replaceElement (spec, ...nodes) {
  const element = resolveElement(spec);
  if (!element?.parentNode) return null;

  const kids = flatNodes(nodes);
  element.replaceWith(...kids);
  return kids;
}

export default replaceElement;
