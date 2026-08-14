// resolveTarget.js

import { isFn }           from './../vendors.js';
import { resolveElement } from './resolveElement.js';

/**
 * Resolves input to a valid EventTarget (Window, Worker, Element, etc.).
 */
export function resolveTarget (sth, ctx) {
  return isFn(sth?.addEventListener) ? sth : resolveElement(sth, ctx);
}

export default resolveTarget;
