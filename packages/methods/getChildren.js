// getChildren.js

import { resolveElement } from './resolveElement.js';
import { buildSelector }  from './buildSelector.js';

const passes = (element, filter) => !filter || element.matches(buildSelector(filter));

export function getChildren (spec, filter) {
  const element = resolveElement(spec);
  if (!element) return [];
  return [...element.children].filter(child => passes(child, filter));
}

export default getChildren;
