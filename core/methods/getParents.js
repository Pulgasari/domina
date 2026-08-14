// getParents.js

import { buildSelector }  from './buildSelector.js';
import { resolveElement } from './resolveElement.js';
import { walk }           from './../utils.js';

// Ascending up to the root, closest ancestor first
export function getParents (spec, filter) {
  return walk(resolveElement(spec), 'parentElement', filter, true);
}

export default getParents;
