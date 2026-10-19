// getElementsByDataKey.js

import { getElements } from './getElements.js';

export function getElementsByDataKey (key, ctx) { return getElements(`[data-key="${key}"]`, ctx); }
export default getElementsByDataKey;
