// @domina/core/methods/removeAttr.js

import { resolveElement } from './resolveElement.js';
import { toKebabCase } from './../shared.js';

export function removeAttr (spec, ...names) {
  const el = resolveElement(spec);
  names.flat(Infinity).forEach(n => el?.removeAttribute(toKebabCase(n)));
  return el;
}

export default removeAttr;
