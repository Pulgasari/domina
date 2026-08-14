// getIndex.js

import { _el } from './../resolve.js';

// Position among siblings, -1 if element does not exist or has no parent
export const getIndex = spec => {
  const element = _el(spec);
  if (!element?.parentElement) return -1;
  return [...element.parentElement.children].indexOf(element);
};

export default getIndex;
