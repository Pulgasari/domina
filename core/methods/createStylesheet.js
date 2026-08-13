// createStylesheet.js

import scopeStylesheet from './scopeStylesheet.js';

// Wraps CSS in a cascade layer. Adopted sheets come after author styles, so an
// unlayered sheet wins at equal specificity. That is right for an override and
// wrong for base styles, which belong in a layer so page CSS beats them again.
const layered = (css, layer) => layer ? `@layer ${layer} { ${css} }` : String(css);

/** CSS text -> constructable stylesheet, optionally scoped and layered */
export const createStylesheet = (css, options) => {
  const { disabled = false, layer = null, media, scope = null } = options;
  const sheet = new CSSStyleSheet(media ? { media } : undefined);
  
  sheet.replaceSync(layered(css, layer));
  if (scope) scopeStylesheet(sheet, scope);
  sheet.disabled = disabled;
  return sheet;
};

export default createStylesheet;
