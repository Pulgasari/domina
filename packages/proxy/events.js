// @domina/proxy :: events

/*
addEventListener and removeEventListener, the gaps filled:

  addEventListener('click', handler)                   native, but returns its stop
  addEventListener('keydown keyup', handler)           several types
  addEventListener('click', '[data-action]', handler)  delegated: handler(event, match), this is the match
  removeEventListener('click', handler)                native
  removeEventListener('click')                         every listener added here for click

a delegated listener follows event.composedPath(), so a match inside an open
shadow root counts, as long as it is below the root.
*/

import { isString } from './shared.js';

const typesOf  = types => String(types).split(/[\s,]+/).filter(Boolean);
const captured = options => Boolean(typeof options === 'boolean' ? options : options?.capture);

// root -> type -> Set of { capture, listener, wrapped }
const registry = new WeakMap;

const entriesOf = (root, type) => {
  if (!registry.has(root)) registry.set(root, new Map);
  const types = registry.get(root);
  if (!types.has(type)) types.set(type, new Set);
  return types.get(type);
};

const delegate = (root, selector, listener) => function (event) {
  for (const node of event.composedPath()) {
    if (node === root) return;
    if (node.matches?.(selector)) return listener.call(node, event, node);
  }
};

export function listen (root, types, ...args) {
  const [selector, listener, options] = isString(args[0]) ? args : [null, ...args];
  const wrapped = selector ? delegate(root, selector, listener) : listener;
  const capture = captured(options);
  const added   = typesOf(types).map(type => {
    const entry = { capture, listener, wrapped };
    root.addEventListener(type, wrapped, options);
    entriesOf(root, type).add(entry);
    return [type, entry];
  });

  return () => {
    for (const [type, entry] of added) {
      root.removeEventListener(type, entry.wrapped, entry.capture);
      entriesOf(root, type).delete(entry);
    }
  };
}

export function unlisten (root, types, listener, options) {
  for (const type of typesOf(types)) {
    if (listener != null) root.removeEventListener(type, listener, options);
    const entries = entriesOf(root, type);
    for (const entry of entries) {
      if (listener != null && entry.listener !== listener) continue;
      root.removeEventListener(type, entry.wrapped, entry.capture);
      entries.delete(entry);
    }
  }
}
