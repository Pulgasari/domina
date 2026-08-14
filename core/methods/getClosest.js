// getClosest.js

import { _el, _slct } from './../resolve.js';

export const   getClosest = (spec, selector) => _el(spec)?.closest(_slct(selector)) ?? null;
export default getClosest;
