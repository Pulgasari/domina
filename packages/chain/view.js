// @domina/chain/view.js
// where elements are and whether they are seen; scrolling; waiting

import { getElementOffset }           from '@domina/methods/getElementOffset';
import { getElementPosition }         from '@domina/methods/getElementPosition';
import { getElementRect }             from '@domina/methods/getElementRect';
import { isElementInViewport }        from '@domina/methods/isElementInViewport';
import { jumpTo as jumpIntoView }     from '@domina/methods/jumpTo';
import { scrollTo as scrollIntoView } from '@domina/methods/scrollTo';
import { waitForAnimations }          from '@domina/methods/waitForAnimations';
import { waitForEvent }               from '@domina/methods/waitForEvent';

const point = found => found ? { x: found.left, y: found.top } : null;

// :::::: GEOMETRY. x and y everywhere

export const offset   = { params: {}, read: element => point(getElementOffset(element)) };     // in the document
export const position = { params: {}, read: element => point(getElementPosition(element)) };   // in the offset parent
export const rect     = { params: {}, read: element => getElementRect(element) };               // DOMRect, in the viewport

// any part visible, or at least ratio of it
export const inView = {
  params : { ratio: 'number' },
  read   : (element, ratio = 0) => isElementInViewport(element, { ratio }),
};

// :::::: SCROLLING. the first element comes into view

export const scrollTo = {
  kind   : 'view',
  params : { options: 'json' },
  method (options) { if (this.el) scrollIntoView(this.el, options); return this; },
};

export const jumpTo = {
  kind   : 'view',
  params : { options: 'json' },
  method (options) { if (this.el) jumpIntoView(this.el, options); return this; },
};

// :::::: WAITING. a promise, the chain is no thenable

// every running animation and transition of the set, then the chain
export const finished = {
  kind   : 'wait',
  params : { name: 'string' },
  method (name) { return waitForAnimations(this.elements, { name }).then(() => this); },
};

// the next event of this type on the first element
export const wait = {
  kind   : 'wait',
  params : { type: 'string', timeout: 'number' },
  method (type, timeout) { return this.el ? waitForEvent(this.el, type, { timeout }) : Promise.reject(new Error(`[domina] wait(): the chain is empty`)); },
};
