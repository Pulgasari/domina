// getStylesheets.js

import { rootOf } from './../shared/stylesheet.js';

/** Every sheet currently adopted on the given root */
export function getStylesheets ({ target = document } = {}) {
  return [...rootOf(target).adoptedStyleSheets];
}

export default getStylesheets;
