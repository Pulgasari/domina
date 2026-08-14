// clearElement.js

import { _el } from './../resolve.js';

export const   clearElement = spec => _el(spec)?.replaceChildren() ?? null;
export default clearElement;
