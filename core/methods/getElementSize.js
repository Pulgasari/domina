// getElementSize.js

import { _el } from './../resolve.js';

/**
 * getSize(spec)                    -> Border-Box including border and padding
 * getSize(spec, { box: 'content' })-> Content-Box (clientWidth / clientHeight)
 * getSize(spec, { box: 'scroll' }) -> Full scroll dimensions
 */
export const getElementSize = (spec, { box = 'border' } = {}) => {
  const element = _el(spec);
  if (!element) return null;

  if (box === 'content') return { width: element.clientWidth, height: element.clientHeight };
  if (box === 'scroll')  return { width: element.scrollWidth, height: element.scrollHeight };

  const rect = element.getBoundingClientRect();
  return { 
    width  : rect.width, 
    height : rect.height 
  };
};

export default getElementSize;
