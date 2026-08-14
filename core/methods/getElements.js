// getElements.js

import buildSelector  from './buildSelector.js';
import resolveContext from './resolveContext.js';

export const   getElements = (spec, ctx) => [...resolveContext(ctx).querySelectorAll(buildSelector(spec))];   
export default getElements;
