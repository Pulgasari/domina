// wrapElement.js

import { resolveElement } from './resolveElement.js';
import { isString } from './../shared.js';
import { createElement }  from './createElement.js';

// wrap(el, 'div') or wrap(el, existingNode) or wrap(el, 'div', { class: 'box' })
export function wrapElement (spec, wrapper = 'div', props = {}) {
  const element = resolveElement(spec);
  if (!element?.parentNode) return null;

  const box = isString(wrapper) ? createElement(wrapper, props) : resolveElement(wrapper);
  if (!box) return null;

  element.replaceWith(box);   // Mark position...
  box.append(element);        // ...and pull element in
  return box;
}

export default wrapElement;
