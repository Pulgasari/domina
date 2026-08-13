// @domina/core/methods/toggleAttr.js

import { _el }         from './../resolve.js';
import { toKebabCase } from './../vendors.js';

// force omitted -> flip. attributes are presence-based, so the value stays ''
export const toggleAttr = (spec, name, force) => {
  const el = _el(spec);
  el?.toggleAttribute(toKebabCase(name), force);
  return el;
};

export default toggleAttr;
