// getValue.js

import { _el } from './../resolve.js';
import { parseDate, toNum } from './../utils.js';
import { isArray, isCheckable, isMultiSelect } from './../vendors.js';

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

export default getValue;
