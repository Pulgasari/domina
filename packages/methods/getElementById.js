// getElementById.js

import { getElement }     from './getElement.js';
import { resolveContext } from './resolveContext.js';

export function getElementById (id, ctx) { return resolveContext(ctx).getElementById?.(id) ?? getElement(`#${id}`, ctx); }
export default getElementById;
