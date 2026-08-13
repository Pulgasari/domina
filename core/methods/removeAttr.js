// @domina/core/methods/removeAttr.js

import { _el }         from './../resolve.js';
import { toKebabCase } from './../vendors.js';

export const removeAttr = (spec, ...names) => {
  const el = _el(spec);
  names.flat(Infinity).forEach(n => el?.removeAttribute(toKebabCase(n)));
  return el;
};

export default removeAttr;
