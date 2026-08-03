// sortElements.js

import { _el, getElement, getElements }    from './core.js';
import { isArray, isFn, isString }         from './utils.js';
import { parseDate, shuffle, toNum }       from './utils.js';
import { getValue }                        from './values.js';

const defaultOrder = 'auto-asc';

// unparsebare Werte landen immer am Ende – auch bei desc.
// dir wirkt deshalb NUR auf den echten Vergleich.
const nullsLast = (x, y, dir, compare) =>
    x === null && y === null ?  0
  : x === null              ?  1
  : y === null              ? -1
  : dir * compare(x, y);

const sortModes = {
  regular: (a, b, dir) =>
    dir * String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }),

  num:  (a, b, dir) => nullsLast(toNum(a),     toNum(b),     dir, (x, y) => x - y),
  date: (a, b, dir) => nullsLast(parseDate(a), parseDate(b), dir, (x, y) => x - y),

  auto: (a, b, dir) => (parseDate(a) && parseDate(b))
    ? sortModes.date(a, b, dir)
    : sortModes.regular(a, b, dir),
};

export function sortElements ({ container, item, indicators }) {
  const $container = _el(container);
  if (!$container) {
    console.warn('sortElements: container not found.', container);
    return [];
  }

  const items = getElements(item, $container);
  const defaultOrder = 'auto-asc';

  const specs = [].concat(indicators ?? []).map(spec => {
    if (isString(spec) || isFn(spec)) return {
      order    : isFn(spec) ? spec : defaultOrder,
      selector : isFn(spec) ? null : spec 
    };
    if (isArray(spec)) return {
      order    : spec[1] || defaultOrder,
      selector : spec[0],
    };
    return { order: defaultOrder, ...spec };
  });

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
          result = (sortModes[mode] || sortModes.auto)(valA, valB, dir);
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
