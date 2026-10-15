// @domina/chain/define.js
// a method is described as data and built into a prototype method once.
// the same descriptions are the registry (d.api) that docs and the playground read
//
//   read   (element, ...args)  -> value     a getter: the first element, or every one on .all
//   write  (element, ...args)               a setter: every element, the chain is returned
//   reads  (args) -> boolean                which of the two a call means. default: no argument,
//                                           or a single one that is not a plain object
//   method (...args)                        anything else, called on the chain itself
//   params { name: type }                   the arguments, in order. for docs and tooling
//   object true                             params are the keys of one object argument

import { Chain } from './chain.js';

export const api = new Map;

const isPlainObject = value => value !== null && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value));

const readsByDefault = args => args.length === 0 || (args.length === 1 && !isPlainObject(args[0]));

const kindOf = ({ kind, method, read, write }) => kind ?? (method ? 'method' : read && write ? 'access' : read ? 'read' : 'write');

function build (name, { method, read, reads = readsByDefault, write }) {
  if (method) return method;

  return function (...args) {
    const { elements } = this;

    if (read && (!write || reads(args))) {
      if (this.many) return elements.map(element => read(element, ...args));
      return elements.length ? read(elements[0], ...args) : null;
    }

    // with a getter in play, undefined would be read as "get" by some callers and "set" by others
    if (read && args.length > 1 && args.at(-1) === undefined) {
      throw new TypeError(`[domina/chain] ${name}(): undefined is not a value, null removes`);
    }

    // a function as value gets (old, element, index)
    if (read && typeof args[1] === 'function') {
      const [key, compute] = args;
      elements.forEach((element, index) => write(element, key, compute(read(element, key), element, index)));
      return this;
    }

    for (const element of elements) write(element, ...args);
    return this;
  };
}

export function define (name, definition) {
  if (name in Chain.prototype) throw new Error(`[domina/chain] "${name}" exists already`);

  // a bare function is a setter: (element, ...args) on every element
  const spec = typeof definition === 'function' ? { write: definition } : definition;

  Object.defineProperty(Chain.prototype, name, { configurable: true, value: build(name, spec), writable: true });
  api.set(name, { ...spec, kind: kindOf(spec), name, params: spec.params ?? {} });
}

export function extend (definitions) {
  for (const [name, definition] of Object.entries(definitions)) define(name, definition);
}
