// @domina/core/methods/getNextAll.js

import { _el, _slct } from './../resolve.js';
import { walk }       from './../utils.js';

const passes = (element, filter) => !filter || element.matches(_slct(filter));

export const   getNextAll = (spec, filter) => walk(_el(spec), 'nextElementSibling', filter, true);   
export default getNextAll;
