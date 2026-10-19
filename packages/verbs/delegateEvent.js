// delegateEvent.js

import { resolveElement } from './resolveElement.js';
import { BUBBLE_MAP, eventTypes, isFn } from './_shared.js';

/** A single container listener that triggers only for matching descendants. */
export function delegateEvent (container, types, selector, handler, options) {
  const element = resolveElement(container);
  const list    = eventTypes(types).map(type => BUBBLE_MAP[type] ?? type);
  if (!element || !list.length || !isFn(handler)) return () => {};

  // `:scope` means the container, as in container.querySelectorAll(selector).
  // closest() would read it as the target itself and never match
  const scoped  = selector.includes(':scope');
  const matchOf = target => {
    if (!scoped) return target?.closest?.(selector);
    const matches = new Set(element.querySelectorAll(selector));
    for (let node = target; node && node !== element; node = node.parentNode) if (matches.has(node)) return node;
    return null;
  };

  const listener = event => {
    const match = matchOf(event.target);
    if (match && element.contains(match)) handler.call(match, event, match);
  };

  for (const type of list) element.addEventListener(type, listener, options);
  return () => { for (const type of list) element.removeEventListener(type, listener, options); };
}

export default delegateEvent;
