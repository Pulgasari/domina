// offEvent.js

import { BUBBLE_MAP, eventTargets, eventTypes } from './_shared.js';

export function offEvent (targets, types, handler, options) {
  for (const node of eventTargets(targets))
  for (const type of   eventTypes(types))
  node.removeEventListener(BUBBLE_MAP[type] ?? type, handler, options);
}

export default offEvent;
