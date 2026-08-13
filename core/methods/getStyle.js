// getStyle.js

import { _el }         from './../resolve.js';
import { toKebabCase } from './../vendors.js';

const isVar = property => property.startsWith('--');

// --custom-props remain as-is, everything else is converted to kebab-case
const propertyName = property => isVar(property) ? property : toKebabCase(property);

/**
 * getStyle(spec)              -> CSSStyleDeclaration (computed)
 * getStyle(spec, 'fontSize')  -> '16px'
 * getStyle(spec, 'x', true)   -> reads inline style instead of computed
 */
export const getStyle = (spec, property, inline = false) => {
  const element = _el(spec);
  if (!element) return null;

  const declaration = inline ? element.style : getComputedStyle(element);
  if (!property) return declaration;

  return declaration.getPropertyValue(propertyName(property)).trim() || null;
};

export default getStyle;
