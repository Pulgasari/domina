// getScroll.js

import { resolveElement } from './resolveElement.js';
import { isWindow } from './../vendors.js';

const scrollRoot = spec => !spec || isWindow(spec) || spec === document ? null : resolveElement(spec);

// Without argument or with window/document: returns scroll state of the page itself
export function getScroll (spec) {
  const element = scrollRoot(spec);
  return element
    ? { top: element.scrollTop, left: element.scrollLeft }
    : { top: window.scrollY,    left: window.scrollX };
}

export default getScroll;
