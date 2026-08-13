// values.js

import { _el } from './internal/resolve.js';
import { isArray, isCheckable, isMultiSelect } from './internal/is.js';
import { arrayfied } from './internal/normalize.js';
import { parseDate, toDateInput, toNum } from './internal/coerce.js';

const casts = {
  bool   : v => Boolean(isArray(v) ? v.length : v),
  date   : v => parseDate(v),
  number : v => toNum(v) ?? 0,
  string : v => isArray(v) ? v.join(', ') : String(v ?? ''),
};

export const getValue = (node, mode = null) => {
  const el = _el(node);
  if (!el) return null;

  const raw = isCheckable(el)   ? el.checked
            : isMultiSelect(el) ? [...el.selectedOptions].map(o => o.value)
            : 'value' in el     ? el.value
            : el.textContent ?? '';

  return mode && casts[mode] ? casts[mode](raw) : raw;
};

export const setValue = (node, value, { notify = false } = {}) => {
  const el = _el(node);
  if (!el) return null;

  if (isCheckable(el)) {
    el.checked = Boolean(value);
  }
  else if (isMultiSelect(el)) {
    const values = arrayfied(value).map(String);
    for (const opt of el.options) opt.selected = values.includes(opt.value);
  }
  else if ('value' in el) {
    el.value = (value instanceof Date && el.type === 'date')
      ? toDateInput(value)
      : value ?? '';
  }
  else {
    el.textContent = value ?? '';
  }

  if (notify) notifyChange(el);

  return el;
};

// input + change zusammen – form.js braucht dasselbe
export const notifyChange = el => {
  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
};
