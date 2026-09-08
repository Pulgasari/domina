// getElementSize.js

import { resolveElement } from './resolveElement.js';

/**
 * getSize(spec)                    -> Border-Box including border and padding
 * getSize(spec, { box: 'content' })-> Content-Box (clientWidth / clientHeight)
 * getSize(spec, { box: 'scroll' }) -> Full scroll dimensions
 */
export function getElementSize (spec, { box = 'border' } = {}) {
  const element = resolveElement(spec);
  if (!element) return null;

  if (box === 'content') return { width: element.clientWidth, height: element.clientHeight };
  if (box === 'scroll')  return { width: element.scrollWidth, height: element.scrollHeight };

  const rect = element.getBoundingClientRect();
  return { 
    width  : rect.width, 
    height : rect.height 
  };
}

export default getElementSize;
