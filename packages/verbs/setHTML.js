// setHTML.js

import { resolveElement } from './resolveElement.js';
import { createHTML }     from './createHTML.js';

/**
 * setHTML(spec, '<b>x</b>')
 * Uses <template> so <tr>/<option> tags parse correctly, and empties
 * via replaceChildren to ensure previous tree is discarded.
 */
export function setHTML (spec, html) {
  const element = resolveElement(spec);
  if (!element) return null;
  element.replaceChildren(createHTML(html ?? ''));
  return element;
}

export default setHTML;
