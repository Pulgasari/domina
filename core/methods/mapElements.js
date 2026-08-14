// mapElements.js

import getElements from './getElements.js';

export const   mapElements = (spec, fn, ctx) => getElements(spec, ctx).forEach (fn);       
export default mapElements;
