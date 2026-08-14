// getElement.js

import buildSelector  from './buildSelector.js';
import resolveContext from './resolveContext.js';

export const   getElement = (spec, ctx) => resolveContext(ctx).querySelector(buildSelector(spec)) ?? null;  
export default getElement;
