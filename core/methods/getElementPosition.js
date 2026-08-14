// getElementPosition.js

import { resolveElement } from './resolveElement.js';

// Relative to offsetParent - needed for absolute positioning
export function getElementPosition (spec) {
  const element = resolveElement(spec);
  if (!element) return null;
  return {
    top  : element.offsetTop, 
    left : element.offsetLeft 
  };
}

export default getElementPosition;
