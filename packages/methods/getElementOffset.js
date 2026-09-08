// getElementOffset.js

import { resolveElement } from './resolveElement.js';

// Relative to document - persists across scrolling, unlike getBoundingClientRect()
export function getElementOffset (spec) {
  const element = resolveElement(spec);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { 
    top  : rect.top  + window.scrollY, 
    left : rect.left + window.scrollX 
  };
}

export default getElementOffset;
