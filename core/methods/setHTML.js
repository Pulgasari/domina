// setHTML.js

import { _el }        from './../resolve.js';
import { createHTML } from './createHTML.js';

/**
 * setHTML(spec, '<b>x</b>')
 * Uses <template> so <tr>/<option> tags parse correctly, and empties
 * via replaceChildren to ensure previous tree is discarded.
 */
export const setHTML = (spec, html) => {
  const element = _el(spec);
  if (!element) return null;
  element.replaceChildren(createHTML(html ?? ''));
  return element;
};

export default setHTML;
