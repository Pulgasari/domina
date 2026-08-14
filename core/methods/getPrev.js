// getPrev.js

import { _el, _slct } from './../resolve.js';
import { walk }       from './../utils.js';

const passes = (element, filter) => !filter || element.matches(_slct(filter));

export const   getPrev = (spec, filter) => walk(_el(spec), 'previousElementSibling', filter, false)[0] ?? null;   
export default getPrev;
