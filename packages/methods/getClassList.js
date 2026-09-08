// getClassList.js

import { resolveElement } from './resolveElement.js';

export function getClassList (spec) { return resolveElement(spec)?.classList; }
export default getClassList;
