// getClosest.js

import { resolveElement } from './resolveElement.js';
import { buildSelector }  from './buildSelector.js';

export function getClosest (spec, selector) { return resolveElement(spec)?.closest(buildSelector(selector)) ?? null; }
export default getClosest;
