// @domina/core/collection/filter.js

import { getElement } from '../query.js';
import { getValue } from '../values.js';
import { isEmpty, isFn } from '../internal/is.js';
import { parseDate, startOfDay, toNum } from '../internal/coerce.js';
import { resolveScope, toSpecs, filterShape } from './shared.js';

const str = v => String(v ?? '').toLowerCase();
const stringFilter = fn => (value, search) => str(value)[fn](str(search));

const numFilter = compare => (value, search) => {
  const a = toNum(value), b = toNum(search);
  return a !== null && b !== null && compare(a, b);
};

// Tages-Granularität: "01.05.2024" soll auch matchen, wenn der Wert eine Uhrzeit hat
const dateFilter = compare => (value, search) => {
  const a = parseDate(value), b = parseDate(search);
  return !!a && !!b && compare(+startOfDay(a), +startOfDay(b));
};

const filterModes = {
  contains   : stringFilter('includes'),
  includes   : stringFilter('includes'),
  startsWith : stringFilter('startsWith'),
  endsWith   : stringFilter('endsWith'),
  exact      : (value, search) => str(value) === str(search),

  'num-eq' : numFilter((a, b) => a === b),
  'num-gt' : numFilter((a, b) => a  >  b),
  'num-lt' : numFilter((a, b) => a  <  b),
  'num-ge' : numFilter((a, b) => a >=  b),
  'num-le' : numFilter((a, b) => a <=  b),

  'date-eq'     : dateFilter((a, b) => a === b),
  'date-after'  : dateFilter((a, b) => a  >  b),
  'date-before' : dateFilter((a, b) => a  <  b),
};

export function filterElements({ container, item, filters, mismatchClass = 'hidden' }) {
  const scope = resolveScope('filterElements', container, item);
  if (!scope) return { total: 0, matched: 0, items: [] };

  const { items } = scope;
  const specs = toSpecs(filters, filterShape);
  const matchedItems = [];

  for (const el of items) {
    let matches = true;

    for (const { selector, value, mode, customFn } of specs) {
      if (!isFn(customFn) && isEmpty(value)) continue;

      const target = selector ? getElement(selector, el) : el;
      if (selector && !target) { matches = false; break; }

      const itemValue = getValue(target) ?? '';

      const result = isFn(customFn)
        ? customFn(itemValue, value, el)
        : (filterModes[mode] ?? filterModes.contains)(itemValue, value);

      if (!result) { matches = false; break; }   // AND
    }

    el.classList.toggle(mismatchClass, !matches);
    if (matches) matchedItems.push(el);
  }

  return { total: items.length, matched: matchedItems.length, items: matchedItems };
}
