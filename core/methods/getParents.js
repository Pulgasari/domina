// getParents.js

import { _el, _slct } from './../resolve.js';
import { walk }       from './../utils.js';

const passes = (element, filter) => !filter || element.matches(_slct(filter));

// Ascending up to the root, closest ancestor first
export const   getParents = (spec, filter) => walk(_el(spec), 'parentElement', filter, true);   
export default getParents;
