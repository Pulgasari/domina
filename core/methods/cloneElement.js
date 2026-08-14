// cloneElement.js

import resolveElement from './resolveElement.js';

export const   cloneElement = (spec, deep = true) => resolveElement(spec)?.cloneNode(deep) ?? null;       
export default cloneElement;
  

