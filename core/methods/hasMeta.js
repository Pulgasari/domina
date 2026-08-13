// @domina/core/methods/hasMeta.js

import { getMetaElement } from './getMetaElement.js';

export const hasMeta = key => getMetaElement(key) !== null;

export default hasMeta;
