// @domina/core/attr.js

import { _el } from './internal/resolve.js';
import { isString } from './internal/is.js';
import { toKebabCase } from './internal/case.js';

export const

// getAttr(spec)         -> { name: value } of every attribute
// getAttr(spec, 'name') -> string | null
getAttr = (spec, name) => {
  const el = _el(spec);
  if (!el) return name ? null : {};
  return name
    ? el.getAttribute(toKebabCase(name))
    : Object.fromEntries([...el.attributes].map(a => [a.name, a.value]));
},

hasAttr = (spec, name) => _el(spec)?.hasAttribute(toKebabCase(name)) ?? false,

/**
 * setAttr(spec, { ariaLabel: 'x', disabled: false })
 * setAttr(spec, 'aria-label', 'x')
 * false/null/undefined remove, true sets an empty attribute, rest stringifies
 */
setAttr = (spec, nameOrMap, value) => {
  const el = _el(spec);
  if (!el) return null;

  const map = isString(nameOrMap) ? { [nameOrMap]: value } : nameOrMap;

  for (const [key, val] of Object.entries(map ?? {})) {
    const name = toKebabCase(key);
    if      (val === false || val == null) el.removeAttribute(name);
    else if (val === true)                 el.setAttribute(name, '');
    else                                   el.setAttribute(name, String(val));
  }
  return el;
},

removeAttr = (spec, ...names) => {
  const el = _el(spec);
  names.flat(Infinity).forEach(n => el?.removeAttribute(toKebabCase(n)));
  return el;
},

// force omitted -> flip. attributes are presence-based, so the value stays ''
toggleAttr = (spec, name, force) => {
  const el = _el(spec);
  el?.toggleAttribute(toKebabCase(name), force);
  return el;
};
