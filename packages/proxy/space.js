// @domina/proxy/space.js
// a namespace as properties: read, write, delete, `in` and Object.keys().
// null as a value removes, like everywhere in domina

export function space (definition, ctx) {
  const { delete: remove, get, has, keys, name, set } = definition;

  const fail = action => { throw new TypeError(`[domina] ${name}: cannot ${action}`); };
  const read = key => typeof key === 'symbol' ? undefined : get(key, ctx);

  return new Proxy(Object.create(null), {
    get : (_, key) => read(key),

    set (_, key, value) {
      if (value == null && remove) remove(key, ctx);
      else if (set)                set(key, value, ctx);
      else                         fail('write');
      return true;
    },

    deleteProperty (_, key) {
      if (!remove) fail('delete');
      remove(key, ctx);
      return true;
    },

    has     : (_, key) => typeof key !== 'symbol' && (has ? has(key, ctx) : read(key) != null),
    ownKeys : ()       => keys ? keys(ctx) : [],

    getOwnPropertyDescriptor (_, key) {
      const value = read(key);
      return value == null ? undefined : { configurable: true, enumerable: true, value, writable: Boolean(set) };
    },
  });
}
