// resolveContext.js

import { resolveElement } from './resolveElement.js';

const NODE = Symbol.for('domina.node');

/**
 * Resolves input to a valid query root context (Document, Element, or ShadowRoot).
 */
export function resolveContext (sth) {
  if (!sth)               return document;
  if (sth.nodeType)       return sth;
  if (sth.document)       return sth.document; // window instance
  if (sth[NODE] === true) return sth.node ?? document;

  // if a wrapper or descriptor was passed as context, attempt resolving it
  const resolved = resolveElement(sth);
  return resolved?.nodeType ? resolved : document;
}

export default resolveContext;
