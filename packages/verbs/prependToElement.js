// prependToElement.js

import { moveToElement } from './moveToElement.js';

export function prependToElement (spec, target) { return moveToElement (spec, target, 'prepend'); }

export default prependToElement;
