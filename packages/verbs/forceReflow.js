// forceReflow.js

import resolveElement from './resolveElement.js';

/**
 * makes the browser apply pending style changes now: a class or attribute
 * removed and set again in one task restarts its animation only with this in
 * between. one call covers the whole document
 */
export function forceReflow (spec = document.documentElement) {
  const element = resolveElement(spec);
  if (element) void element.offsetWidth;
  return element;
}

export default forceReflow;
