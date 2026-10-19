// getComputedStyle.js

import { resolveElement } from './resolveElement.js';

export function getComputedStyle (spec) {
  const element = resolveElement(spec);
  return element ? window.getComputedStyle(element) : null;
}

export default getComputedStyle;
