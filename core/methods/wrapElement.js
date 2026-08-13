// wrapElement.js

import { _el }           from './../resolve.js';
import { isString }      from './../vendors.js';
import { createElement } from './createElement.js';

// wrap(el, 'div') or wrap(el, existingNode) or wrap(el, 'div', { class: 'box' })
export const wrapElement = (spec, wrapper = 'div', props = {}) => {
  const element = _el(spec);
  if (!element?.parentNode) return null;

  const box = isString(wrapper) ? createElement(wrapper, props) : _el(wrapper);
  if (!box) return null;

  element.replaceWith(box);   // Mark position...
  box.append(element);        // ...and pull element in
  return box;
};

export default wrapElement;
