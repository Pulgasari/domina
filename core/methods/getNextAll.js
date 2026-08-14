// @domina/core/methods/getNextAll.js

import { resolveElement } from './resolveElement.js';
import { buildSelector }  from './buildSelector.js';
import { walk }           from './../utils.js';

export function getNextAll (spec, filter) { return walk(resolveElement(spec), 'nextElementSibling', filter, true); }
export default  getNextAll;
