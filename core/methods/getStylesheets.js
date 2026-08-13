// getStylesheets.js

import { rootOf } from './adoptStylesheet.js';

/** Every sheet currently adopted on the given root */
export const getStylesheets = ({ target = document } = {}) =>
  [...rootOf(target).adoptedStyleSheets];

export default getStylesheets;
