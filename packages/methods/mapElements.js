// mapElements.js

import { getElements } from './getElements.js';

export function mapElements (spec, fn, ctx) { return getElements(spec, ctx).map (fn); }
export default mapElements;
