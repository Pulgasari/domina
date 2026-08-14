// getPrevAll.js

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

export const   getPrevAll = (spec, filter) => walk(_el(spec), 'previousElementSibling', filter, true);   
export default getPrevAll;
