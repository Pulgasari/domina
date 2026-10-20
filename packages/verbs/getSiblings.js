// getSiblings.js

import { resolveElement } from './resolveElement.js';
import { matcher }        from './_shared.js';

export function getSiblings (spec, filter) {
  const element = resolveElement(spec);
  if (!element?.parentElement) return [];
  const test = matcher(filter);
  return [...element.parentElement.children].filter(child => child !== element && test(child));
}

export default getSiblings;
