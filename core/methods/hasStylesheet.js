// hasStylesheet.js

import { rootOf } from './adoptStylesheet.js';

/** True when the sheet is currently adopted on the given root */
export function hasStylesheet (sheet, { target = document } = {}) {
  return rootOf(target).adoptedStyleSheets.includes(sheet);
}

export default hasStylesheet;
