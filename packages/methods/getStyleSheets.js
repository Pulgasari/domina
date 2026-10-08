// getStyleSheets.js

import { rootOf } from './_shared/styleSheet.js';

/** Every sheet currently adopted on the given root */
export function getStyleSheets ({ target = document } = {}) {
  return [...rootOf(target).adoptedStyleSheets];
}

export default getStyleSheets;
