// filterElements.js

import { buildSelector } from './buildSelector.js';
import { getValue }      from './getValue.js';
import { filterShape, isEmpty, isFn, parseDate, resolveScope, startOfDay, toNum, toSpecs } from './_shared.js';

// a mode takes the search value once and hands back the test for an item value, so
// lowercasing and parsing the search happen once per filter, not once per item

const str = value => String(value ?? '').toLowerCase();

const stringMode = method => search => { const needle = str(search); return value => str(value)[method](needle); };

const numMode = compare => search => {
  const b = toNum(search);
  return b === null ? () => false : value => { const a = toNum(value); return a !== null && compare(a, b); };
};

// day granularity: "01.05.2024" matches a value with a time of that day too
const dayOf = value => { const date = parseDate(value); return date ? +startOfDay(date) : null; };

const dateMode = compare => search => {
  const b = dayOf(search);
  return b === null ? () => false : value => { const a = dayOf(value); return a !== null && compare(a, b); };
};

const filterModes = {
  contains   : stringMode('includes'),
  includes   : stringMode('includes'),
  startsWith : stringMode('startsWith'),
  endsWith   : stringMode('endsWith'),
  exact      : search => { const needle = str(search); return value => str(value) === needle; },

  'num-eq' : numMode((a, b) => a === b),
  'num-gt' : numMode((a, b) => a  >  b),
  'num-lt' : numMode((a, b) => a  <  b),
  'num-ge' : numMode((a, b) => a >=  b),
  'num-le' : numMode((a, b) => a <=  b),

  'date-eq'     : dateMode((a, b) => a === b),
  'date-after'  : dateMode((a, b) => a  >  b),
  'date-before' : dateMode((a, b) => a  <  b),
};

// a spec as { css, test } once, an empty search drops out
function prepare ({ selector, value, mode, customFn }) {
  if (!isFn(customFn) && isEmpty(value)) return null;
  const css  = selector ? buildSelector(selector) : null;
  const test = isFn(customFn)
    ? (itemValue, el) => customFn(itemValue, value, el)
    : (filterModes[mode] ?? filterModes.contains)(value);
  return { css, test };
}

// mismatches get `mismatchClass`, or the hidden attribute with `hide: true`,
// which needs no stylesheet to take effect
export function filterElements ({ container, item, filters, mismatchClass = 'hidden', hide = false }) {
  const scope = resolveScope('filterElements', container, item);
  if (!scope) return { total: 0, matched: 0, items: [] };

  const { items } = scope;
  const specs = toSpecs(filters, filterShape).map(prepare).filter(Boolean);
  const matchedItems = [];

  for (const el of items) {
    let matches = true;

    for (const { css, test } of specs) {
      const target = css ? el.querySelector(css) : el;
      if (css && !target) { matches = false; break; }
      if (!test(getValue(target) ?? '', el)) { matches = false; break; }   // AND
    }

    if (hide) el.hidden = !matches;
    else el.classList.toggle(mismatchClass, !matches);
    if (matches) matchedItems.push(el);
  }

  return { total: items.length, matched: matchedItems.length, items: matchedItems };
}

export default filterElements;
