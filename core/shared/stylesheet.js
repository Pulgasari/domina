// @domina/core/shared/stylesheet.js

import { resolveElement } from './../methods/resolveElement.js';
import { isString }       from './../shared.js';

// Constructable Stylesheets state registry
export const registry = new WeakMap;
export function isCssUrl (v) { return isString(v) && (/^(https?:|blob:|data:|\.{0,2}\/)/.test(v) || /\.css($|[?#])/.test(v)); }    
export function isSheet  (v) { return typeof CSSStyleSheet !== 'undefined' && v instanceof CSSStyleSheet; }      
export function layered (css, layer) { return layer ? `@layer ${layer} {${css} }` : String(css); }

/*
Where the sheet gets adopted. 
A shadow root or document is used as is,
an element resolves to its own shadow root when it has one,
else to itscontaining document or shadow root.
*/
export function rootOf (target) {
  if (!target) return document;
  if (target.nodeType === 9 || target.nodeType === 11) return target;
  const element = resolveElement(target);
  if (!element) return document;
  return element.shadowRoot ?? element.getRootNode?.() ?? document;
}

export function storeOf (root) {
  let store = registry.get(root);
  if (!store) registry.set(root, store = new Map);
  return store;
}
