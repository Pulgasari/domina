// @domina/observer/_shared.js

import { isArray, isNullish } from '@pulgasari/is';

// is-checks used by the observer
export { isElementish, isFn, isObject } from '@pulgasari/is';

// the one shared generic the observer needs
export const arrayfied = v => isNullish(v) ? [] : isArray(v) ? v : [v];
