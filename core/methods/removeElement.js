// removeElement.js

import { _el } from './../resolve.js';

export const removeElement = (...specs) => {
  const removed = [];
  for (const spec of specs.flat(Infinity)) {
    const element = _el(spec);
    if (element) { element.remove(); removed.push(element); }
  }
  return removed;
};

export default removeElement;
