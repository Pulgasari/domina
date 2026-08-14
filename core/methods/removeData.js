// removeData.js

import { resolveElement } from './resolveElement.js';
import { toCamelCase } from './../shared.js';

export function removeData (spec, ...names) {
  const element = resolveElement(spec);
  if (!element) return null;
  for (const name of names.flat(Infinity)) delete element.dataset[toCamelCase(name)];
  return element;
}

export default removeData;
