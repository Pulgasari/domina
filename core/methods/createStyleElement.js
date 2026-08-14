// createStyleElement.js

import { isString } from './../shared.js';
import { createElement } from './createElement.js';

export function createStyleElement (source) {
  const body = isString(source) ? { textContent: source } : source ?? {};
  return createElement('style', body);
}

export default createStyleElement;
