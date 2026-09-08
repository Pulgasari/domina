// getHTML.js

import { resolveElement } from './resolveElement.js';

export function getHTML (spec) { return resolveElement(spec)?.innerHTML ?? null; }

export default getHTML;
