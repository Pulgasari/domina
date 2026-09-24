// delegateEvent.js

import { resolveElement } from './resolveElement.js';
import { BUBBLE_MAP, eventTypes, isFn } from './_shared.js';

/** A single container listener that triggers only for matching descendants. */
export function delegateEvent (container, types, selector, handler, options) {
  const element = resolveElement(container);
  const list    = eventTypes(types).map(type => BUBBLE_MAP[type] ?? type);
  if (!element || !list.length || !isFn(handler)) return () => {};

  const listener = event => {
    const match = event.target?.closest?.(selector);
    if (match && element.contains(match)) handler.call(match, event, match);
  };

  for (const type of list) element.addEventListener(type, listener, options);
  return () => { for (const type of list) element.removeEventListener(type, listener, options); };
}

export default delegateEvent;
