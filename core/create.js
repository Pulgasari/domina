// @domina/core/create.js

import createFragment     from './methods/createFragment.js';
import createHTML         from './methods/createHTML.js';
import createStyleElement from './methods/createStyleElement.js';
import createSVG          from './methods/createSVG.js';
import createTemplate     from './methods/createTemplate.js';
import createTextNode     from './methods/createTextNode.js';

export {
  createFragment,
  createHTML,
  createStyleElement,
  createSVG,
  createTemplate,
  createTextNode,
}

/*

import { isString } from './internal/is.js';
import { flatNodes } from './internal/normalize.js';
import { createElement, updateElement } from './element.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export const

createSVG = (tag = 'svg', props = {}, ...children) =>
  updateElement(document.createElementNS(SVG_NS, tag), props, ...children),

createFragment = (...nodes) => {
  const fragment = document.createDocumentFragment();
  const children = flatNodes(nodes);
  if (children.length) fragment.append(...children);
  return fragment;
},

// -> DocumentFragment. Der Umweg über <template> parst auch <tr> und <option>
// korrekt, die in einem beliebigen Container still verworfen würden.
createHTML = html => {
  const template = document.createElement('template');
  template.innerHTML = String(html).trim();
  return template.content;
},

createTemplate = (html, props = {}) =>
  updateElement(document.createElement('template'), { innerHTML: String(html ?? '').trim(), ...props }),

createTextNode = text => document.createTextNode(String(text)),

createStyleElement = source =>
  createElement('style', isString(source) ? { textContent: source } : source ?? {});

*/
