// getElementsByName.js

import { getElements } from './getElements.js';

export function getElementsByName (name, ctx) { return getElements(`[name="${name}"]`, ctx); }
export default getElementsByName;
