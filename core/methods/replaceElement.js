// @domina/core/methods/replaceElement.js

import { _el }       from './../resolve.js';
import { flatNodes } from './../utils.js';

// Replaces element with given nodes. Returns new nodes.
export const replaceElement = (spec, ...nodes) => {
  const element = _el(spec);
  if (!element?.parentNode) return null;

  const kids = flatNodes(nodes);
  element.replaceWith(...kids);
  return kids;
};

export default replaceElement;
