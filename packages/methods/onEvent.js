// onEvent.js

import { BUBBLE_MAP, eventTargets, eventTypes, isFn } from './_shared.js';
import { offEvent } from './offEvent.js';

/**
 * onEvent(targets, types, handler, options?) -> off()
 * onEvent('.btn', 'click keydown', fn)
 * onEvent([el1, el2], ['pointerdown'], fn, { passive: true })
 */
export function onEvent (targets, types, handler, options) {
  if (!targets || !types || !isFn(handler)) return () => {};

  targets = eventTargets(targets);
  types   = eventTypes(types);

  for (const node of targets)
  for (const type of types)
  node.addEventListener(BUBBLE_MAP[type] ?? type, handler, options);

  return () => offEvent(targets, types, handler, options);
}

export default onEvent;
