// resolveNode.js

import { resolveElement } from './resolveElement.js';

/**
 * Resolves input to a DOM Node instance.
 */
export function resolveNode (sth) {
  return sth instanceof Node ? sth : resolveElement(sth);
}

export default resolveNode;
