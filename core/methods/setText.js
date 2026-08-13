// setText.js

import { _el } from './../resolve.js';

export const setText = (spec, text) => {
  const element = _el(spec); if (!element) return null;
  element.textContent = text == null ? '' : String(text);
  return element;
};

export default setText;
