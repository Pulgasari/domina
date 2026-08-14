// getPrev.js

import { _el, _slct } from './../resolve.js';

const passes = (element, filter) => !filter || element.matches(_slct(filter));

const walk = (element, direction, filter, all) => {
  const found = [];
  let current = element?.[direction];

  while (current) {
    if (passes(current, filter)) {
      found.push(current);
      if (!all) break;
    }
    current = current[direction];
  }
  return found;
};

export const   getPrev = (spec, filter) => walk(_el(spec), 'previousElementSibling', filter, false)[0] ?? null;   
export default getPrev;
