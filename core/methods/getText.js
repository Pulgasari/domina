// getText.js

import { _el } from './../resolve.js';

export const getText = spec => _el(spec)?.textContent ?? null;

export default getText;
