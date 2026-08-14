// emitEvent.js

import { resolveTarget } from './resolveTarget.js';

/**
 * emitEvent(target, type, detail?, options?) -> boolean (false = preventDefault)
 * emitEvent(el, 'domina:ready', { id: 5 })
 */
export function emitEvent (target, type, detail = null, { bubbles = true, cancelable = true, composed = false } = {}) {
  const element = resolveTarget(target);
  return element ? element.dispatchEvent(new CustomEvent(type, { detail, bubbles, cancelable, composed })) : false;
}

export default emitEvent;
