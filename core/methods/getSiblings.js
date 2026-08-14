// getSiblings.js

import { resolveElement } from './resolveElement.js';
import { buildSelector }  from './buildSelector.js';

const passes = (element, filter) => !filter || element.matches(buildSelector(filter));

export function getSiblings (spec, filter) {
  const element = resolveElement(spec);
  if (!element?.parentElement) return [];
  return [...element.parentElement.children].filter(child => child !== element && passes(child, filter));
}

export default getSiblings;
