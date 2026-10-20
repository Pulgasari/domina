// @domina/proxy :: facade

/*
a facade reads like its root (document, an element, a shadow root): what
domina adds comes first (members.js, then extend()), everything else is the
root's own, its functions bound once. it hands back real nodes, never itself.

writing goes to a setter domina has or to a writable property of the root.
anything else throws: a typo, not an expando.
*/

import { membersOf }      from './members.js';
import { isFn, isSymbol } from './shared.js';

// extend() writes here, every facade reads it
export const extensions = Object.create(null);

// one facade per root: within('#card') twice is the same facade
const facades = new WeakMap;
export const facadeOf = (root) => facades.getOrInsertComputed(root, createFacade);

// a setter or a writable value somewhere along the prototype chain
function isWritable (object, key) {
  for (let current = object; current; current = Object.getPrototypeOf(current)) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) return Boolean(descriptor.set || descriptor.writable);
  }
  return false;
}

// the members as fixed properties: domina.getElement = … is an error, not a replacement
function fixed (members) {
  const descriptors = Object.getOwnPropertyDescriptors(members);
  for (const descriptor of Object.values(descriptors)) if ('value' in descriptor) descriptor.writable = false;
  return Object.defineProperties(Object.create(extensions), descriptors);
}

function createFacade (root) {
  const isDocument = root.nodeType === 9;
  const host       = isDocument ? root.documentElement : root.host ?? root;   // a shadow root stands for its host
  const own        = fixed(membersOf({ document: root.ownerDocument ?? root, host, isDocument, root }));
  const bound      = new Map;

  const facade = new Proxy(own, {
    get (target, key) {
      if (key in target) return Reflect.get(target, key, facade);
      if (isSymbol(key)) return undefined;
      const value = root[key];
      if (!isFn(value)) return value;
      if (!bound.has(key)) bound.set(key, value.bind(root));
      return bound.get(key);
    },

    has : (target, key) => key in target || key in root,

    set (target, key, value) {
      if (key in target) {
        if (!Reflect.set(target, key, value, facade)) throw new TypeError(`[domina] "${String(key)}" can not be written`);
      }
      else if (isWritable(root, key)) root[key] = value;
      else throw new TypeError(`[domina] "${String(key)}" is no property here, a typo?`);
      return true;
    },
  });

  return facade;
}

/*
export function facadeOf (root) {
  if (!facades.has(root)) facades.set(root, createFacade(root));
  return facades.get(root);
}
*/
