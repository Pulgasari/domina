// getNext.js

import { _el, _slct } from './../resolve.js';

const passes = (element, filter) => !filter || element.matches(_slct(filter));

export const   getNext = (spec, filter) => walk(_el(spec), 'nextElementSibling', filter, false)[0] ?? null;   
export default getNext;
