// @domina/core/methods/hasMeta.js

import { getMetaElement } from './getMetaElement.js';

export function hasMeta (key) { return getMetaElement(key) !== null; }

export default hasMeta;
