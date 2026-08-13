// hasStylesheet.js

import { rootOf } from './adoptStylesheet.js';

/** True when the sheet is currently adopted on the given root */
export const hasStylesheet = (sheet, { target = document } = {}) =>
  rootOf(target).adoptedStyleSheets.includes(sheet);

export default hasStylesheet;
