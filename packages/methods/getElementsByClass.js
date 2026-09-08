// getElementsByClass.js

import { getElements } from './getElements.js';

export function getElementsByClass (name, ctx) { return getElements(`.${name}`, ctx); }
export default getElementsByClass;
