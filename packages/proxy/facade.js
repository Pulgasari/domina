// @domina/proxy/facade.js

/*
the proxy and the registry every facade reads. a member is

{ get (ctx), set (value, ctx) }   a value
{ make (ctx) -> function }         a function built once per facade (the built-ins)
{ method (...args) }               a function called with the facade as this (extend)
`only: 'document'` hides it on facades of a subtree (within)
*/

// :::::: IMPORT

import { d }     from '@domina/chain';
import { space } from './space.js';
import { isFn, isSymbol }  from './shared.js';

//const isDocument = (sth) => sth.nodeType === 9;

// :::::: REFS

export const 
api     = new Map,   // name -> { kind, name, only, writable }
members = new Map,
spaces  = new Map;

function assertFree (name, internal) {
  if (members.has(name) || spaces.has(name)) throw new Error(`[domina] "${name}" exists already`);
  if (!internal && typeof document !== 'undefined' && name in document) throw new Error(`[domina] "${name}" is a member of document`);
}

function register (name, def, { internal = false } = {}) {
  assertFree(name, internal);
  const member = isFn(def) ? { method: def } : def;
  members.set(name, member);
  
  const kind = member.get ? 'value' : 'method';
  const only = member.only ?? null;
  api.set(name, { kind, name, only, writable: Boolean(member.set) });
}

function registerSpace (name, def, { internal = false } = {}) {
  assertFree(name, internal);
  spaces.set(name, { ...def, name });

  const only = def.only ?? null;
  api.set(name, { kind: 'space', name, only, writable: Boolean(definition.set) });
}

// a property with a setter or a writable value along the chain.
// none at all is not writable here:
// an unknown write is a typo, not an expando
function isWritable (object, key) {
  for (let current = object; current; current = Object.getPrototypeOf(current)) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key);
    if (descriptor) return Boolean(descriptor.set || descriptor.writable);
  }
  return false;
}

// to a plain object, for snapshot() and watch()
function plainOf (facade, name) {
  const value = facade[name];
  if (!spaces.has(name)) return value;
  const keys = Object.keys(value);
  return name === 'class' ? keys : Object.fromEntries(keys.map(key => [key, value[key]]));
}

function createFacade (root) {
  const isDocument = root.nodeType === 9;
  const host       = isDocument ? root.documentElement : root.host ?? root;   // a shadow root writes to its host
  const ctx        = { document: root.ownerDocument ?? root, facade: null, host, isDocument, root };

  const bound = new Map; // native functions of root, bound once: domina.x === domina.x
  const built = new Map; // members made for this facade
  const views = new Map; // spaces for this facade

  const available = entry => entry && (!entry.only || isDocument);

  function read (key) {
    const member = members.get(key);
    if (available(member)) {
      if (member.get) return member.get(ctx);
      if (!built.has(key)) built.set(key, member.make ? member.make(ctx) : member.method.bind(ctx.facade));
      return built.get(key);
    }

    const definition = spaces.get(key);
    if (available(definition)) {
      if (!views.has(key)) views.set(key, space(definition, ctx));
      return views.get(key);
    }

    const value = root[key];
    if (!isFn(value)) return value;
    if (!bound.has(key)) bound.set(key, value.bind(root));
    return bound.get(key);
  }

  const own = key => available(members.get(key)) || available(spaces.get(key));

  // an arrow function as target: callable, and without a non-configurable prototype to report
  const facade = new Proxy(() => {}, {
    apply : (_, __, [spec, context]) => d(spec, context ?? (isDocument ? undefined : root)),
    get   : (_, key) => isSymbol(key) ? undefined : read(key),

    set (_, key, value) {
      const member = members.get(key);
      if (available(member) && member.set) { member.set(value, ctx); return true; }
      if (available(spaces.get(key))) throw new TypeError(`[domina] "${key}" is a namespace: write its keys, or set({ ${key}: { … } })`);

      // what is not available here falls through to the root, for reading and writing alike
      if (!available(member) && isWritable(root, key)) { root[key] = value; return true; }
      throw new TypeError(`[domina] "${String(key)}" is not writable`);
    },

    has     : (_, key) => own(key) || key in root,
    ownKeys : ()       => [...members.keys(), ...spaces.keys()].filter(own),

    getOwnPropertyDescriptor : (_, key) => own(key) ? { configurable: true, enumerable: true, value: read(key), writable: true } : undefined,
  });

  ctx.facade = facade;
  return facade;
}

// EXPORT

export { createFacade, plainOf, register, registerSpace };
