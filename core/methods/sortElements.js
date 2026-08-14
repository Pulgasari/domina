// sortElements.js

import { getElement } from './getElement.js';
import { getValue }   from './getValue.js';
import { resolveScope, toSpecs, sortShape } from './../shared.js';
import { parseDate, shuffle, toNum }        from './../utils.js';
import { isFn }                             from './../vendors.js';

const DEFAULT_ORDER = 'auto-asc';

// Unparsebare Werte landen immer am Ende – auch bei desc.
// dir wirkt deshalb NUR auf den echten Vergleich.
const nullsLast = (x, y, dir, compare) =>
    x === null && y === null ?  0
  : x === null              ?  1
  : y === null              ? -1
  : dir * compare(x, y);

const diff = (x, y) => x - y;

const sortModes = {
  regular: (a, b, dir) =>
    dir * String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }),

  num:  (a, b, dir) => nullsLast(toNum(a),     toNum(b),     dir, diff),
  date: (a, b, dir) => nullsLast(parseDate(a), parseDate(b), dir, diff),

  auto: (a, b, dir) => (parseDate(a) && parseDate(b))
    ? sortModes.date(a, b, dir)
    : sortModes.regular(a, b, dir),
};

export function sortElements ({ container, item, indicators }) {
  const scope = resolveScope('sortElements', container, item);
  if (!scope) return [];

  const { $container, items } = scope;
  const specs = toSpecs(indicators, sortShape(DEFAULT_ORDER));

  if (specs.some(s => s.order === 'random')) {
    shuffle(items);
  } else {
    items.sort((a, b) => {
      for (const { selector, order } of specs) {
        const valA = getValue(selector ? getElement(selector, a) : a) ?? '';
        const valB = getValue(selector ? getElement(selector, b) : b) ?? '';

        let result;

        if (isFn(order)) {
          result = order(valA, valB, a, b);
        } else {
          const [mode, direction] = order.includes('-') ? order.split('-') : ['auto', order];
          const dir = direction === 'desc' ? -1 : 1;
          result = (sortModes[mode] ?? sortModes.auto)(valA, valB, dir);
        }

        if (result) return result;
      }
      return 0;
    });
  }

  $container.append(...items);   // reine Bewegung, kein Fragment nötig
  return items;
}

export default sortElements;
