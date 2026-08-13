// createElement.js

import updateElement from './updateElement.js';

export const createElement = (
  tag = 'div', 
  props = {}, 
  ...children
) => {
  const element = document.createElement(tag);
  updateElement(element, props, ...children);
};

export default createElement;
