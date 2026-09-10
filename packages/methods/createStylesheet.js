// createStylesheet.js

import { layered }         from './_shared/stylesheet.js';
import { scopeStylesheet } from './scopeStylesheet.js';

/** CSS text -> constructable stylesheet, optionally scoped and layered */
export function createStylesheet (css, options) {
  const { disabled = false, layer = null, media, scope = null } = options;
  const sheet = new CSSStyleSheet (media ? { media } : undefined);
  
  sheet.replaceSync(layered(css, layer));
  if (scope) scopeStylesheet(sheet, scope);
  sheet.disabled = disabled;
  return sheet;
}

export default createStylesheet;
