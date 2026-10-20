// getComputedStyle.js

import { resolveElement } from './resolveElement.js';

export function getInlineStyle (spec) {
  return resolveElement(spec)?.style ?? null;
}

export default getInlineStyle;



