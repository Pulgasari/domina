// getElementPosition.js

import { resolveElement } from './resolveElement.js';

// Relative to offsetParent - needed for absolute positioning
export function getElementPosition (spec) {
  const element = resolveElement(spec); if (!element) return null;
  
  const x = element.offsetLeft;
  const y = element.offsetTop;
  
  return { x, y, left: x, top: y };
}

export default getElementPosition;
