// create.js

import { isString } from './internal/is.js';
import { flatNodes } from './internal/normalize.js';
import { updateElement } from './update.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export const

createElement = (tag = 'div', props = {}, ...children) =>
  updateElement(document.createElement(tag), props, ...children),

createSVG = (tag = 'svg', props = {}, ...children) =>
  updateElement(document.createElementNS(SVG_NS, tag), props, ...children),

createFragment = (...nodes) => {
  const fragment = document.createDocumentFragment();
  const children = flatNodes(nodes);
  if (children.length) fragment.append(...children);
  return fragment;
},

createHTML = html => {
  const template = document.createElement('template');
  template.innerHTML = String(html).trim();
  return template.content;
},

createStylesheet = sth => createElement('style', isString(sth) ? { textContent: sth } : sth),

createTextNode = text => document.createTextNode(String(text));
