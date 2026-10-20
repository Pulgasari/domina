// getElementOffset.js

import resolveElement from './resolveElement.js';

// Relative to document - persists across scrolling, unlike getBoundingClientRect()
export function getElementOffset (spec) {
  const element = resolveElement(spec); if (!element) return null;
  const rect    = element.getBoundingClientRect();
  const x       = rect.top  + window.scrollY;
  const y       = rect.left + window.scrollX;
  
  return { x, y, left: x, top: y };
}

export default getElementOffset;
