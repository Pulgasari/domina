// prependToElement.js

import moveToElement from './moveToElement.js';

export const prependToElement = (spec, target) => moveToElement (spec, target, 'prepend');

export default prependToElement;
