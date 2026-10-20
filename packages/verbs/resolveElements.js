// resolveElements.js

import { isElementish, isIterable, isString } from './_shared.js';
import { getElements }    from './getElements.js';
import { resolveElement } from './resolveElement.js';

const NODE = Symbol.for('domina.node');

/**
 * the plural of resolveElement: a selector, an element, a wrapper or any list of
 * those -> Element[]. a selector finds all its matches, nothing found is []
 */
export function resolveElements (sth, ctx) {
  if (!sth)               return [];
  if (sth[NODE] === true) return [sth.node].filter(Boolean);
  if (isString(sth))      return getElements(sth, ctx);
  if (isElementish(sth))  return [sth];
  if (isIterable(sth))    return [...sth].flatMap(item => resolveElements(item, ctx));
  return [resolveElement(sth, ctx)].filter(Boolean);
}

export default resolveElements;
