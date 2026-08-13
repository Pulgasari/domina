// offEvent.js

import { _el } from './../resolve.js';
import { arrayfied, isFn, isIterable, isString } from './../vendors.js';
import { getElements } from './getElements.js';

const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' };
const typesOf = types => (isString(types) ? types.split(/[\s,]+/) : arrayfied(types)).filter(Boolean);
const targetsOf = targets =>
  arrayfied(isIterable(targets) ? [...targets] : targets).flatMap(target =>
      !target                         ? []
    : isString(target)                ? getElements(target)
    : isFn(target.addEventListener)   ? [target]
    : isIterable(target)              ? targetsOf(target)
    : [_el(target)].filter(Boolean));

/** Mirror to onEvent(). Options must match registration (e.g. capture!). */
export const offEvent = (targets, types, handler, options) => {
  for (const node of targetsOf(targets))
    for (const type of typesOf(types))
      node.removeEventListener(BUBBLE_MAP[type] ?? type, handler, options);
};

export default offEvent;
