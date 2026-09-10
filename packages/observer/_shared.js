// @domina/observer/_shared.js

import { isArray, isNullish } from 'https://code.pulgasari.dev/js/is.js';

// is-checks used by the observer
export { isElementish, isFn, isObject } from 'https://code.pulgasari.dev/js/is.js';

// the one shared generic the observer needs
export const arrayfied = v => isNullish(v) ? [] : isArray(v) ? v : [v];
