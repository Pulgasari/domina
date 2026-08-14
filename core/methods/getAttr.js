// @domina/core/methods/getAttr.js

import { resolveElement } from './resolveElement.js';
import { toKebabCase }    from './../vendors.js';

/**
 * getAttr(spec)         -> { name: value } of every attribute
 * getAttr(spec, 'name') -> string | null
 */
export function getAttr (spec, name) {
  const el = resolveElement(spec);
  if (!el) return name ? null : {};
  return name
    ? el.getAttribute(toKebabCase(name))
    : Object.fromEntries([...el.attributes].map(a => [a.name, a.value]));
}

export default getAttr;
