// jumpTo.js

import { scrollTo } from './scrollTo.js';

export const jumpTo = (spec, options = {}) => scrollTo(spec, { behavior: 'auto', ...options });

export default jumpTo;
