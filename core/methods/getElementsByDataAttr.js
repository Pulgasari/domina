// getElementsByDataAttr.js

import getElements from './getElements.js';

export const   getElementsByDataAttr = (key, ctx) => getElements(`[data-${key}]`, ctx);      
export default getElementsByDataAttr;
