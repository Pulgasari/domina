// hasData.js

import { resolveElement } from './resolveElement.js';
import { toCamelCase } from './_shared.js';

export function hasData (spec, name) { return resolveElement(spec)?.dataset[toCamelCase(name)] !== undefined; }

export default hasData;
