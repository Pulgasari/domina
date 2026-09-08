// removeStyle.js

import { resolveElement } from './resolveElement.js';
import { toKebabCase } from './../shared.js';

const isVar = property => property.startsWith('--');

const propertyName = property => isVar(property) ? property : toKebabCase(property);

export function removeStyle (spec, ...properties) {
  const element = resolveElement(spec);
  properties.flat(Infinity).forEach(property => element?.style.removeProperty(propertyName(property)));
  return element;
}

export default removeStyle;
