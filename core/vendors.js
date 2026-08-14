// @domina/core/vendors.js

export * from 'https://code.pulgasari.dev/js/is.js';
export * from 'https://code.pulgasari.dev/js/logger.js';
export * from 'https://code.pulgasari.dev/js/str.js';

export const
arrayfied = v => isNullish(v) ? [] : isArray(v) ? v : [v],
shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

