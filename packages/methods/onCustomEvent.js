// onCustomEvent.js

import { onEvent } from './onEvent.js';

/** Like onEvent(), but handler receives event.detail instead of event object. */
export function onCustomEvent (targets, types, handler, options) {
  return onEvent(targets, types, event => handler(event.detail, event), options);
}

export default onCustomEvent;
