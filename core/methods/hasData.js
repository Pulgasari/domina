// hasData.js

import { _el }         from './../resolve.js';
import { toCamelCase } from './../vendors.js';

export const hasData = (spec, name) => _el(spec)?.dataset[toCamelCase(name)] !== undefined;

export default hasData;
