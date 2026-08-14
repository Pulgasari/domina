// getElementsByClass.js

import getElements    from './getElements.js';

export const   getElementsByClass = (name, ctx) => getElements(`.${name}`, ctx);   
export default getElementsByClass;
