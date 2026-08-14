// getElementOffsetToParent.js

import { resolveElement } from './resolveElement.js';

export function getElementOffsetToParent (spec) { return resolveElement(spec)?.offsetParent ?? null; }

export default getElementOffsetToParent;
