// appendToElement.js

import { moveToElement } from './moveToElement.js';

export function appendToElement (spec, target) { return moveToElement (spec, target, 'append'); }
export default appendToElement;
