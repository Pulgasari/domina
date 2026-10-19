// getValue.js

import { resolveElement } from './resolveElement.js';
import { isArray, isCheckable, isMultiSelect, parseDate, toNum } from './_shared.js';

const casts = {
  bool   : v => Boolean(isArray(v) ? v.length : v),
  date   : v => parseDate(v),
  number : v => toNum(v) ?? 0,
  string : v => isArray(v) ? v.join(', ') : String(v ?? ''),
};

// elements whose `value` is their value. an <li> has one too (its list number),
// so a bare `'value' in el` would read every list item as 0. custom elements
// count when they define one
const VALUED   = new Set(['button', 'data', 'input', 'meter', 'option', 'output', 'progress', 'select', 'textarea']);
const hasValue = el => VALUED.has(el.localName) || (el.localName?.includes('-') && 'value' in el);

export function getValue (node, mode = null) {
  const el = resolveElement(node);
  if (!el) return null;

  const raw = isCheckable(el)   ? el.checked
            : isMultiSelect(el) ? [...el.selectedOptions].map(o => o.value)
            : hasValue(el)      ? el.value
            : el.textContent ?? '';

  return mode && casts[mode] ? casts[mode](raw) : raw;
}

export default getValue;
