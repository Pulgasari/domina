// sortElements.js

import { buildSelector } from './buildSelector.js';
import { getValue }      from './getValue.js';
import { isFn, parseDate, resolveScope, shuffle, sortShape, toNum, toSpecs } from './_shared.js';

const DEFAULT_ORDER = 'auto-asc';

// every value is read once per item and turned into a sort key, then the sort compares
// plain keys. the comparator touches neither the dom nor a parser
//
//   regular   strings like people read them: case and accents aside, numbers by value
//   num       numbers, unparsable last
//   date      dates, unparsable last
//   auto      dates when every value of the column is one, regular otherwise
//
// unparsable values go last in either direction, the direction only turns the real
// comparison

const DIACRITICS = /[̀-ͯ]/g, DIGITS = /\d+/g, ASCII = /^[\x00-\x7f]*$/;

const textKey = value => {
  let key = String(value);
  if (!ASCII.test(key)) key = key.normalize('NFD').replace(DIACRITICS, '');
  return key.toLowerCase().replace(DIGITS, digits => digits.padStart(16, '0'));
};

const dateKey = value => parseDate(value)?.getTime() ?? null;

const keyers = {
  date    : values => values.map(dateKey),
  num     : values => values.map(toNum),
  regular : values => values.map(textKey),
  auto    : values => {
    const dates = values.map(dateKey);
    return dates.every((date, i) => date !== null || values[i] === '') && dates.some(date => date !== null) ? dates : values.map(textKey);
  },
};

const compareKeys = (x, y, dir) =>
    x === null && y === null ?  0
  : x === null              ?  1
  : y === null              ? -1
  : x < y                   ? -dir
  : x > y                   ?  dir
  :                            0;

// a column: its raw values, and its keys or its compare function
function column ({ selector, order }, items) {
  const css    = selector ? buildSelector(selector) : null;
  const values = items.map(item => getValue(css ? item.querySelector(css) : item) ?? '');

  if (isFn(order)) return { values, order };

  const [mode, direction] = order.includes('-') ? order.split('-') : ['auto', order];
  return { keys: (keyers[mode] ?? keyers.auto)(values), dir: direction === 'desc' ? -1 : 1 };
}

export function sortElements ({ container, item, indicators }) {
  const scope = resolveScope('sortElements', container, item);
  if (!scope) return [];

  const { $container, items } = scope;
  const specs = toSpecs(indicators, sortShape(DEFAULT_ORDER));

  if (specs.some(spec => spec.order === 'random')) shuffle(items);
  else {
    const columns = specs.map(spec => column(spec, items));
    const index   = items.map((_, i) => i);

    index.sort((a, b) => {
      for (const { dir, keys, order, values } of columns) {
        const result = order ? order(values[a], values[b], items[a], items[b]) : compareKeys(keys[a], keys[b], dir);
        if (result) return result;
      }
      return 0;
    });

    const sorted = index.map(i => items[i]);
    items.splice(0, items.length, ...sorted);
  }

  $container.append(...items);   // a plain move, no fragment needed
  return items;
}

export default sortElements;
