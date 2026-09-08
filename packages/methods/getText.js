// getText.js

import { resolveElement } from './resolveElement.js';

export function getText (spec) { return resolveElement(spec)?.textContent ?? null; }

export default getText;
