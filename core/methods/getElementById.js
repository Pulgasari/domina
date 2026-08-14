// getElementById.js

import getElement     from './getElement.js';
import resolveContext from './resolveContext.js';

export const   getElementById  = (id, ctx) => resolveContext(ctx).getElementById?.(id) ?? getElement(`#${id}`, ctx);   
export default getElementById;
