// matchesElement.js

import { _el, _slct } from './../resolve.js';

export const   matchesElement = (spec, selector) => _el(spec)?.matches(_slct(selector)) ?? false;   
export default matchesElement;
