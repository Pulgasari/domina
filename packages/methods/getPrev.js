// getPrev.js

import { buildSelector }  from './buildSelector.js';
import { resolveElement } from './resolveElement.js';
import { walk } from './../shared.js';

export function getPrev (spec, filter) {
  return walk (resolveElement(spec), 'previousElementSibling', filter, false)[0] ?? null;
}

export default getPrev;
