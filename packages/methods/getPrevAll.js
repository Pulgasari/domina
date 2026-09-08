// getPrevAll.js

import { buildSelector }  from './buildSelector.js';
import { resolveElement } from './resolveElement.js';
import { walk } from './../shared.js';

export function getPrevAll (spec, filter) {
  return walk (resolveElement(spec), 'previousElementSibling', filter, true);
}

export default getPrevAll;
