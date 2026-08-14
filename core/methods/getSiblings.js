// getSiblings.js

import { _el, _slct } from './../resolve.js';

const passes = (element, filter) => !filter || element.matches(_slct(filter));

export const getSiblings = (spec, filter) => {
  const element = _el(spec);
  if (!element?.parentElement) return [];
  return [...element.parentElement.children].filter(child => child !== element && passes(child, filter));
};

export default getSiblings;
