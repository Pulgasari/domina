// getIndex.js

import { resolveElement } from './resolveElement.js';

// Position among siblings, -1 if element does not exist or has no parent
export function getIndex (spec) {
  const element = resolveElement(spec);
  if (!element?.parentElement) return -1;
  return [...element.parentElement.children].indexOf(element);
}

export default getIndex;
