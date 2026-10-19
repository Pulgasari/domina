// onceEvent.js

import { onEvent } from './onEvent.js';

/** Fires exactly once across all targets/types combined, not per pair. */
export function onceEvent (targets, types, handler, options) {
  let stop;
  const wrapped = event => { stop(); handler(event); };
  stop = onEvent(targets, types, wrapped, options);
  return stop;
}

export default onceEvent;
