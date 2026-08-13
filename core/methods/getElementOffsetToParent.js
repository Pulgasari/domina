// getElementOffsetToParent.js

import { _el } from './../resolve.js';

export const getElementOffsetToParent = spec => _el(spec)?.offsetParent ?? null;

export default getElementOffsetToParent;
