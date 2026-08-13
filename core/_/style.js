// @domina/core/style.js

import { _el } from './internal/resolve.js';
import { isNumber, isString } from './internal/is.js';
import { toKebabCase } from './internal/case.js';

// Zahlen brauchen fast immer px – diese Properties sind die Ausnahmen
const UNITLESS = new Set([
  'animation-iteration-count', 'aspect-ratio', 'border-image-outset', 'border-image-slice',
  'border-image-width', 'column-count', 'flex', 'flex-grow', 'flex-shrink', 'font-weight',
  'grid-area', 'grid-column', 'grid-row', 'line-height', 'opacity', 'order', 'orphans',
  'scale', 'tab-size', 'widows', 'z-index', 'zoom',
]);

const isVar = property => property.startsWith('--');

// --custom-props bleiben wie sie sind, alles andere wird kebab-case
const propertyName = property => isVar(property) ? property : toKebabCase(property);

const cssValue = (property, value) =>
  isNumber(value) && !UNITLESS.has(property) && !isVar(property) ? `${value}px` : String(value);

export const

/**
 * getStyle(spec)              -> CSSStyleDeclaration (computed)
 * getStyle(spec, 'fontSize')  -> '16px'
 * getStyle(spec, 'x', true)   -> liest den Inline-Style statt computed
 */
getStyle = (spec, property, inline = false) => {
  const element = _el(spec);
  if (!element) return null;

  const declaration = inline ? element.style : getComputedStyle(element);
  if (!property) return declaration;

  return declaration.getPropertyValue(propertyName(property)).trim() || null;
},

/**
 * setStyle(spec, { fontSize: 16, '--accent': 'tomato' })
 * setStyle(spec, 'display', 'flex')
 * Zahlen bekommen px, ausser bei einheitslosen Properties.
 * null/undefined/false entfernt die Property wieder.
 */
setStyle = (spec, propertyOrMap, value) => {
  const element = _el(spec);
  if (!element) return null;

  const map = isString(propertyOrMap) ? { [propertyOrMap]: value } : propertyOrMap;

  for (const [key, val] of Object.entries(map ?? {})) {
    const property = propertyName(key);
    if (val == null || val === false) element.style.removeProperty(property);
    else element.style.setProperty(property, cssValue(property, val));
  }
  return element;
},

removeStyle = (spec, ...properties) => {
  const element = _el(spec);
  properties.flat(Infinity).forEach(property => element?.style.removeProperty(propertyName(property)));
  return element;
},

// Custom Properties brauchen getPropertyValue – über element.style['--x'] geht es nicht
getCssVar = (spec, name, inline = false) => getStyle(spec, name.startsWith('--') ? name : `--${name}`, inline),

setCssVar = (spec, nameOrMap, value) => {
  const map = isString(nameOrMap) ? { [nameOrMap]: value } : nameOrMap;
  const prefixed = {};
  for (const [name, val] of Object.entries(map ?? {})) {
    prefixed[name.startsWith('--') ? name : `--${name}`] = val;
  }
  return setStyle(spec, prefixed);
};
