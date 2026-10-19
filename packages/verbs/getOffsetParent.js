// getOffsetParent.js

import { resolveElement } from './resolveElement.js';

export function getOffsetParent (spec) { return resolveElement(spec)?.offsetParent ?? null; }

export default getOffsetParent;
