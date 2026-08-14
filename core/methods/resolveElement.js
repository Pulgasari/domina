// resolveElement.js

import { isElementish }   from './../vendors.js';
import { buildSelector }  from './buildSelector.js';
import { resolveContext } from './resolveContext.js';

const NODE = Symbol.for('domina.node');

/**
 * Resolves input (Selector, EDO, Node, or Wrapper) to a single DOM Element.
 */
export function resolveElement (sth, ctx) {
  if (!sth)               return null;
  if (sth[NODE] === true) return sth.node ?? null;
  if (isElementish(sth))  return sth;

  const selector = buildSelector(sth);
  if (!selector) return null;

  try   { return resolveContext(ctx).querySelector(selector) ?? null; }
  catch { return null; } // Return null on invalid selector DOMExceptions
}

export default resolveElement;
