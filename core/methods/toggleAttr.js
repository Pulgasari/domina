// @domina/core/methods/toggleAttr.js

import { resolveElement } from './resolveElement.js';
import { toKebabCase }    from './../vendors.js';

// force omitted -> flip. attributes are presence-based, so the value stays ''
export function toggleAttr (spec, name, force) {
  const el = resolveElement(spec);
  el?.toggleAttribute(toKebabCase(name), force);
  return el;
}

export default toggleAttr;
