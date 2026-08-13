// getElementOffset.js

import { _el } from './../resolve.js';

// Relative to document - persists across scrolling, unlike getBoundingClientRect()
export const getElementOffset = spec => {
  const element = _el(spec);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  return { 
    top  : rect.top  + window.scrollY, 
    left : rect.left + window.scrollX 
  };
};

export default getElementOffset;
