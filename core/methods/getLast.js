// getLast.js

import { getElements } from './getElements.js';

export const   getLast = (spec, ctx) => getElements(spec, ctx).at(-1) ?? null;   
export default getLast;
