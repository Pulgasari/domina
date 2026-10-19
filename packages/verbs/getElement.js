// getElement.js

import { buildSelector }  from './buildSelector.js';
import { resolveContext } from './resolveContext.js';

export function getElement (spec, ctx) { return resolveContext(ctx).querySelector(buildSelector(spec)) ?? null; }
export default getElement;
