// unwrapElement.js

import { _el } from './../resolve.js';

// Removes wrapper, retains children. Returns freed nodes.
export const unwrapElement = spec => {
  const element = _el(spec);
  if (!element?.parentNode) return null;

  const kids = [...element.childNodes];
  element.replaceWith(...kids);
  return kids;
};

export default unwrapElement;
