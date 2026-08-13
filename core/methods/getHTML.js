// getHTML.js

import { _el } from './../resolve.js';

export const getHTML = spec => _el(spec)?.innerHTML ?? null;

export default getHTML;
