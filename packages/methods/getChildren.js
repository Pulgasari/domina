// getChildren.js

import { resolveElement } from './resolveElement.js';
import { matcher }        from './_shared.js';

export function getChildren (spec, filter) {
  const element = resolveElement(spec);
  if (!element) return [];
  const test = matcher(filter);
  return [...element.children].filter(test);
}

export default getChildren;
