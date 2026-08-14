// getElementsByDataKey.js

import getElements from './getElements.js';

export const   getElementsByDataKey = (key, ctx) => getElements(`[data-key="${key}"]`, ctx);       
export default getElementsByDataKey;
