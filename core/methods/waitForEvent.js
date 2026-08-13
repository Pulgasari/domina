// waitForEvent.js

import { onceEvent } from './onceEvent.js';

/** Waits for next event occurrence -> Promise<Event> */
export const waitForEvent = (target, type, { signal, timeout } = {}) => new Promise((resolve, reject) => {
  const stop  = onceEvent(target, type, event => { clearTimeout(timer); resolve(event); });
  const timer = timeout ? setTimeout(() => { stop(); reject(new Error(`waitForEvent: ${type} timed out`)); }, timeout) : null;
  signal?.addEventListener('abort', () => { stop(); clearTimeout(timer); reject(signal.reason); });
});

export default waitForEvent;
