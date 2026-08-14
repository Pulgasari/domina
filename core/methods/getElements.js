// getElements.js

import { buildSelector }  from './buildSelector.js';
import { resolveContext } from './resolveContext.js';

export function getElements (spec, ctx) { return [...resolveContext(ctx).querySelectorAll(buildSelector(spec))]; }
export default getElements;
