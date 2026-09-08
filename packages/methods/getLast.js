// getLast.js

import { getElements } from './getElements.js';

export function getLast (spec, ctx) { return getElements(spec, ctx).at(-1) ?? null; }
export default getLast;
