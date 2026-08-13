// createSVG.js

import updateElement from './updateElement.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export const createSVG = (
  tag = 'svg', 
  props = {}, 
  ...children
) => {
  const element = document.createElementNS(SVG_NS, tag);
  return updateElement(element, props, ...children);
};

export default createSVG;
