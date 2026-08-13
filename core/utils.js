// @domina/core/internal/normalize.js

import { isArray, isNullish, isObject, isString } from './vendors.js';

export const

// beliebiger Input -> Array. null/undefined -> []
arrayfied = v => isNullish(v) ? [] : isArray(v) ? v : [v],

// Children überall gleich: verschachtelte Arrays platt, null/undefined/false raus
flatNodes = nodes => nodes.flat(Infinity).filter(n => n != null && n !== false),

/**
 * Token-Listen überall gleich. Akzeptiert
 *   'a b, c'                 -> ['a', 'b', 'c']
 *   ['a', ['b', 'c']]        -> ['a', 'b', 'c']
 *   { a: true, b: 0, c: 1 }  -> ['a', 'c']
 */
toList = value => {
  if (isNullish (value) || value === false) return [];
  if (isString  (value)) return value.split(/[\s,]+/).filter(Boolean);
  if (isArray   (value)) return value.flat(Infinity).flatMap(toList);
  if (isObject  (value)) return Object.entries(value).filter(([, on]) => on).map(([name]) => name);
  return [String(value)];
},

// Fisher-Yates, in place
shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
