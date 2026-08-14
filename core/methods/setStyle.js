// setStyle.js

import { resolveElement } from './resolveElement.js';
import { isNumber, isString, toKebabCase } from './../vendors.js';

// Numbers almost always need px - these properties are exceptions
const UNITLESS = new Set([
  'animation-iteration-count', 'aspect-ratio', 'border-image-outset', 'border-image-slice',
  'border-image-width', 'column-count', 'flex', 'flex-grow', 'flex-shrink', 'font-weight',
  'grid-area', 'grid-column', 'grid-row', 'line-height', 'opacity', 'order', 'orphans',
  'scale', 'tab-size', 'widows', 'z-index', 'zoom',
]);

const isVar = property => property.startsWith('--');

const propertyName = property => isVar(property) ? property : toKebabCase(property);

const cssValue = (property, value) =>
  isNumber(value) && !UNITLESS.has(property) && !isVar(property) ? `${value}px` : String(value);

/**
 * setStyle(spec, { fontSize: 16, '--accent': 'tomato' })
 * setStyle(spec, 'display', 'flex')
 * Numbers get 'px' appended, except for unitless properties.
 * null/undefined/false removes the property.
 */
export function setStyle (spec, propertyOrMap, value) {
  const element = resolveElement(spec);
  if (!element) return null;

  const map = isString(propertyOrMap) ? { [propertyOrMap]: value } : propertyOrMap;

  for (const [key, val] of Object.entries(map ?? {})) {
    const property = propertyName(key);
    if (val == null || val === false) element.style.removeProperty(property);
    else element.style.setProperty(property, cssValue(property, val));
  }
  return element;
}

export default setStyle;
