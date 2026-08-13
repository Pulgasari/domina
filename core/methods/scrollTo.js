// scrollTo.js

import { _el } from './../resolve.js';

// Smooth as default; block/inline nearest as default options
export const scrollTo = (spec, options = {}) => {
  const element = _el(spec) ?? window;
  element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest', ...options });
  return element;
};

export default scrollTo;
