// getParents.js

import { resolveElement } from './resolveElement.js';
import { buildSelector }  from './buildSelector.js';
import { walk }           from './../utils.js';

const passes = (element, filter) => !filter || element.matches(buildSelector(filter));

// Ascending up to the root, closest ancestor first
export function getParents (spec, filter) { return walk(resolveElement(spec), 'parentElement', filter, true); }
export default getParents;
