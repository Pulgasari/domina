// removeData.js

import { _el } from './../resolve.js';
import { toCamelCase } from './../vendors.js';

export const removeData = (spec, ...names) => {
  const element = _el(spec);
  if (!element) return null;
  for (const name of names.flat(Infinity)) delete element.dataset[toCamelCase(name)];
  return element;
};

export default removeData;
