// scrollTo.js

import { resolveElement } from './resolveElement.js';

// Smooth as default; block/inline nearest as default options
export function scrollTo (spec, options = {}) {
  const element = resolveElement(spec) ?? window;
  element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest', ...options });
  return element;
}

export default scrollTo;
