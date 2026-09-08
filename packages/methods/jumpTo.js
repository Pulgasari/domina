// jumpTo.js

import { scrollTo } from './scrollTo.js';

export function jumpTo (spec, options = {}) { return scrollTo(spec, { behavior: 'auto', ...options }); }

export default jumpTo;
