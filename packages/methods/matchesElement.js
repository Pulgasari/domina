// matchesElement.js

import { resolveElement } from './resolveElement.js';
import { buildSelector }  from './buildSelector.js';

export function matchesElement (spec, selector) { return resolveElement(spec)?.matches(buildSelector(selector)) ?? false; }
export default matchesElement;
