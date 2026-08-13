// @domina/core/methods/hasAttr.js

import { _el }         from './../resolve.js';
import { toKebabCase } from './../vendors.js';

export const hasAttr = (spec, name) => _el(spec)?.hasAttribute(toKebabCase(name)) ?? false;   

export default hasAttr;
