// createStyleSheet.js

import { layered }         from './_shared/styleSheet.js';
import { scopeStyleSheet } from './scopeStyleSheet.js';

/** CSS text -> constructable stylesheet, optionally scoped and layered */
export function createStyleSheet (css, options) {
  const { disabled = false, layer = null, media, scope = null } = options;
  const sheet = new CSSStyleSheet (media ? { media } : undefined);
  
  sheet.replaceSync(layered(css, layer));
  if (scope) scopeStyleSheet(sheet, scope);
  sheet.disabled = disabled;
  return sheet;
}

export default createStyleSheet;
