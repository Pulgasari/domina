// createStyleElement.js

import { isString }  from './../internal/is.js';
import createElement from './createElement.js';

export default const createStyleElement = source => {
  const body = isString(source) ? { textContent: source } : source ?? {};
  return createElement('style', body);
}
