// scopeStylesheet.js

/**
 * Prefixes every selector of a sheet or rule list so several sheets can coexist
 * on one page. Descends into @media, @supports and @layer. :root is replaced by
 * the scope rather than nested inside it.
 */
export function scopeStylesheet (sheetOrRules, scope) {
  const rules = sheetOrRules?.cssRules ?? sheetOrRules;
  if (!rules || !scope) return sheetOrRules;

  for (const rule of rules) {
    if (rule.selectorText) {
      rule.selectorText = rule.selectorText
        .split(',')
        .map(selector => {
          const trimmed = selector.trim();
          return trimmed.startsWith(':root') ? trimmed.replace(':root', scope) : `${scope} ${trimmed}`;
        })
        .join(', ');
    } else if (rule.cssRules) {
      scopeStylesheet(rule.cssRules, scope);
    }
  }
  return sheetOrRules;
}

export default scopeStylesheet;
