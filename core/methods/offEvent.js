// offEvent.js

import { resolveElement } from './resolveElement.js';
import { arrayfied, isFn, isIterable, isString } from './../shared.js';
import { getElements } from './getElements.js';

const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' };
const typesOf = types => (isString(types) ? types.split(/[\s,]+/) : arrayfied(types)).filter(Boolean);
const targetsOf = targets =>
  arrayfied(isIterable(targets) ? [...targets] : targets).flatMap(target =>
      !target                         ? []
    : isString(target)                ? getElements(target)
    : isFn(target.addEventListener)   ? [target]
    : isIterable(target)              ? targetsOf(target)
    : [resolveElement(target)].filter(Boolean));

export function offEvent (targets, types, handler, options) {
  for (const node of targetsOf(targets))
  for (const type of   typesOf(types))
  node.removeEventListener(BUBBLE_MAP[type] ?? type, handler, options);
}

export default offEvent;
