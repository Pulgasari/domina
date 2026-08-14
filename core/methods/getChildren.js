// getChildren.js

import { _el, _slct } from './../resolve.js';

const passes = (element, filter) => !filter || element.matches(_slct(filter));

export const getChildren = (spec, filter) => {
  const element = _el(spec);
  if (!element) return [];
  return [...element.children].filter(child => passes(child, filter));
};

export default getChildren;
