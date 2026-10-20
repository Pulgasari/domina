// eachElements.js

import { getElements } from './getElements.js';

export function eachElements (spec, fn, ctx) { return getElements(spec, ctx).forEach (fn); }
export default eachElements;
