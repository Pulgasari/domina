// onCustomEvent.js

import onEvent from './onEvent.js';

/** Like onEvent(), but handler receives event.detail instead of event object. */
export const onCustomEvent = (targets, types, handler, options) =>
  onEvent(targets, types, event => handler(event.detail, event), options);

export default onCustomEvent;
