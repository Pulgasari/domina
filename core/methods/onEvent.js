// onEvent.js

import { _el } from './../resolve.js';
import { arrayfied, isFn, isIterable, isString } from './../vendors.js';
import getElements from './getElements.js';
import offEvent    from './offEvent.js';

// Non-bubbling events -> map to bubbling equivalent
const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' };

// 'click keydown' or ['click','keydown'] -> ['click','keydown']
const typesOf = types => (isString(types) ? types.split(/[\s,]+/) : arrayfied(types)).filter(Boolean);

// Selector (all matches), Node, window/document, or iterables of these
const targetsOf = targets =>
  arrayfied(isIterable(targets) ? [...targets] : targets).flatMap(target =>
      !target                         ? []
    : isString(target)                ? getElements(target)
    : isFn(target.addEventListener)   ? [target]
    : isIterable(target)              ? targetsOf(target)
    : [_el(target)].filter(Boolean));

/**
 * onEvent(targets, types, handler, options?) -> off()
 * onEvent('.btn', 'click keydown', fn)
 * onEvent([el1, el2], ['pointerdown'], fn, { passive: true })
 */
export const onEvent = (targets, types, handler, options) => {
  const nodes = targetsOf(targets);
  const list  = typesOf(types);
  if (!nodes.length || !list.length || !isFn(handler)) return () => {};

  for (const node of nodes)
    for (const type of list)
      node.addEventListener(BUBBLE_MAP[type] ?? type, handler, options);

  return () => offEvent(nodes, list, handler, options);
};

export default onEvent;
