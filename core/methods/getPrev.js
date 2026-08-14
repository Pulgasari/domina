// getPrev.js

import { resolveElement } from './resolveElement.js';
import { buildSelector }  from './buildSelector.js';
import { walk }           from './../utils.js';

const passes = (element, filter) => !filter || element.matches(buildSelector(filter));

export function getPrev (spec, filter) { return walk(resolveElement(spec), 'previousElementSibling', filter, false)[0] ?? null; }
export default getPrev;
