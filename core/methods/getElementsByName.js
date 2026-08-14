// getElementsByName.js

import getElements    from './getElements.js';

export const   getElementsByName = (name, ctx) => getElements(`[name="${name}"]`, ctx);  
export default getElementsByName;
