// onEvent.js

import { arrayfied, isFn, isIterable, isString } from './../shared.js';
import { getElements }    from './getElements.js';
import { resolveElement } from './resolveElement.js';
import { offEvent }       from './offEvent.js';

const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' }; // non-bubbling events -> map to bubbling equivalent     
const    typesOf = types   => (isString(types) ? types.split(/[\s,]+/) : arrayfied(types)).filter(Boolean);
const  targetsOf = targets =>
  arrayfied(isIterable(targets) ? [...targets] : targets).flatMap(target =>
      !target                         ? []
    : isString(target)                ? getElements(target)
    : isFn(target.addEventListener)   ? [target]
    : isIterable(target)              ? targetsOf(target)
    : [resolveElement(target)].filter(Boolean));

/**
 * onEvent(targets, types, handler, options?) -> off()
 * onEvent('.btn', 'click keydown', fn)
 * onEvent([el1, el2], ['pointerdown'], fn, { passive: true })
 */
export function onEvent (targets, types, handler, options) {
  if (!targets || !types || !isFn(handler)) return () => {};

  targets = targetsOf (targets);
    types =   typesOf   (types);

  for (const node of targets)
  for (const type of types)
  node.addEventListener(BUBBLE_MAP[type] ?? type, handler, options);

  return () => offEvent(targets, types, handler, options);
}

export default onEvent;
