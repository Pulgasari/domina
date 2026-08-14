// getElementRect.js

import { resolveElement } from './resolveElement.js';

export function getElementRect (spec) { return resolveElement(spec)?.getBoundingClientRect() ?? null; }

export default getElementRect;
