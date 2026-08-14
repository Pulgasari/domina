// cloneElement.js

import { resolveElement } from './resolveElement.js';

export function cloneElement (spec, deep = true) { return resolveElement(spec)?.cloneNode(deep) ?? null; }
export default cloneElement;
  

