// clearElement.js

import { resolveElement } from './resolveElement.js';

export function clearElement (spec) { return resolveElement(spec)?.replaceChildren() ?? null; }
export default clearElement;
