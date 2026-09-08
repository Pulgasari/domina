// delegateEvent.js

import { resolveElement } from './resolveElement.js';
import { arrayfied, isFn, isString } from './../shared.js';

const BUBBLE_MAP = { focus: 'focusin', blur: 'focusout' };

const typesOf = types => (isString(types) ? types.split(/[\s,]+/) : arrayfied(types)).filter(Boolean);

/** A single container listener that triggers only for matching descendants. */
export function delegateEvent (container, types, selector, handler, options) {
  const element = resolveElement(container);
  const list    = typesOf(types).map(type => BUBBLE_MAP[type] ?? type);
  if (!element || !list.length || !isFn(handler)) return () => {};

  const listener = event => {
    const match = event.target?.closest?.(selector);
    if (match && element.contains(match)) handler.call(match, event, match);
  };

  for (const type of list) element.addEventListener(type, listener, options);
  return () => { for (const type of list) element.removeEventListener(type, listener, options); };
}

export default delegateEvent;
