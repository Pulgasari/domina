// @domina/core/methods/setAttr.js

import { resolveElement } from './resolveElement.js';
import { isString, toKebabCase } from './../vendors.js';

/**
 * setAttr(spec, { ariaLabel: 'x', disabled: false })
 * setAttr(spec, 'aria-label', 'x')
 * false/null/undefined remove, true sets an empty attribute, rest stringifies
 */
export function setAttr (spec, nameOrMap, value) {
  const el  = resolveElement(spec); if (!el) return null;
  const map = isString(nameOrMap) ? { [nameOrMap]: value } : nameOrMap;

  for (const [key, val] of Object.entries(map ?? {})) {
    const name = toKebabCase(key);
    if      (val === false || val == null) el.removeAttribute(name);
    else if (val === true)                 el.setAttribute(name, '');
    else                                   el.setAttribute(name, String(val));
  }
  return el;
}

export default setAttr;
