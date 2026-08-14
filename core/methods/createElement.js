// createElement.js

import { updateElement } from './updateElement.js';

export function createElement (
  tag = 'div', 
  props = {}, 
  ...children
) {
  const element = document.createElement(tag);
  return updateElement(element, props, ...children);
}

export default createElement;
