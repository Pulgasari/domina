// getNext.js

import { buildSelector }  from './buildSelector.js';
import { resolveElement } from './resolveElement.js';
import { walk }           from './../utils.js';

export function getNext (spec, filter) {
  return walk (resolveElement(spec), 'nextElementSibling', filter, false)[0] ?? null;
}

export default getNext;
