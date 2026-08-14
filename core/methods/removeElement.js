// removeElement.js

import { resolveElement } from './resolveElement.js';

export function removeElement (...specs) {
  const removed = [];
  for (const spec of specs.flat(Infinity)) {
    const element = resolveElement(spec);
    if (element) { element.remove(); removed.push(element); }
  }
  return removed;
}

export default removeElement;
