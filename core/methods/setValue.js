// setValue.js

import { resolveElement } from './resolveElement.js';
import { arrayfied, isCheckable, isMultiSelect, toDateInput } from './../shared.js';
import { notifyChange } from './notifyChange.js';

export function setValue (node, value, { notify = false } = {}) {
  const el = resolveElement(node);
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
}

export default setValue;
