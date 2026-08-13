// getElementRect.js

import { _el } from './../resolve.js';

export const getElementRect = spec => _el(spec)?.getBoundingClientRect() ?? null;

export default getRect;
