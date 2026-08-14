// eachElements.js

import getElements from './getElements.js';

export const   eachElements = (spec, fn, ctx) => getElements(spec, ctx).forEach (fn);       
export default eachElements;
