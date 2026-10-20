// getElementsByDataAttr.js

import { getElements } from './getElements.js';

export function getElementsByDataAttr (key, ctx) { return getElements(`[data-${key}]`, ctx); }
export default getElementsByDataAttr;
