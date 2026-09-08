// setText.js

import { resolveElement } from './resolveElement.js';

export function setText (spec, text) {
  const element = resolveElement(spec); if (!element) return null;
  element.textContent = text == null ? '' : String(text);
  return element;
}

export default setText;
