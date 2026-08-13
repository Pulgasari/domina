// getElementPosition.js

import { _el } from './../resolve.js';

// Relative to offsetParent - needed for absolute positioning
export const getElementPosition = spec => {
  const element = _el(spec);
  if (!element) return null;
  return {
    top  : element.offsetTop, 
    left : element.offsetLeft 
  };
};

export default getElementPosition;
