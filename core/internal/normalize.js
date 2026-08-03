// @domina/core/internal/normalize.js

import { isArray, isNullish } from './is.js';

export const

// beliebiger Input -> Array. null/undefined -> []
arrayfied = v => isNullish(v) ? [] : isArray(v) ? v : [v],

// Children überall gleich: verschachtelte Arrays platt, null/undefined/false raus
flatNodes = nodes => nodes.flat(Infinity).filter(n => n != null && n !== false),

// Fisher-Yates, in place
shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
