// removeStyle.js

import { _el }         from './../resolve.js';
import { toKebabCase } from './../vendors.js';

const isVar = property => property.startsWith('--');

const propertyName = property => isVar(property) ? property : toKebabCase(property);

export const removeStyle = (spec, ...properties) => {
  const element = _el(spec);
  properties.flat(Infinity).forEach(property => element?.style.removeProperty(propertyName(property)));
  return element;
};

export default removeStyle;
