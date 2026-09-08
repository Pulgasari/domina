// @domina/core/methods/hasAttr.js

import { resolveElement } from './resolveElement.js';
import { toKebabCase }    from './../shared.js';

export function hasAttr (spec, name) {
  return resolveElement(spec)?.hasAttribute(toKebabCase(name)) ?? false;
}

export default hasAttr;
