// emitEvent.js

import { _tgt } from './../resolve.js';

/**
 * emitEvent(target, type, detail?, options?) -> boolean (false = preventDefault)
 * emitEvent(el, 'domina:ready', { id: 5 })
 */
export const emitEvent = (target, type, detail = null, { bubbles = true, cancelable = true, composed = false } = {}) => {
  const element = _tgt(target);
  return element ? element.dispatchEvent(new CustomEvent(type, { detail, bubbles, cancelable, composed })) : false;
};

export default emitEvent;
