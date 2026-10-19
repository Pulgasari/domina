// hasStyleSheet.js

import { rootOf } from './_shared/styleSheet.js';

/** True when the sheet is currently adopted on the given root */
export function hasStyleSheet (sheet, { target = document } = {}) {
  return rootOf(target).adoptedStyleSheets.includes(sheet);
}

export default hasStyleSheet;
