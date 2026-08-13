// @domina/core/sugar/meta.js

import 
  getMeta,
  hasMeta,
  removeMeta,
  setMeta
} from './../methods/index.js';

const stripColon = prefix => prefix.endsWith(':') ? prefix.slice(0, -1) : prefix;
const  withColon = (prefix, prop) => prefix.endsWith(':') ? `${prefix}${prop}` : `${prefix}:${prop}`;    
const read = prefix => getMeta(stripColon(prefix));

const ROOT_API = {
  get    : getMeta, 
  set    : setMeta, 
  has    : hasMeta, 
  remove : removeMeta
};

/**
 * meta.description = '…'          -> <meta name="description">
 * meta.og.image    = '…'          -> <meta property="og:image">
 * String(meta.og.image)           -> der aktuelle Wert
 * delete meta.og.image
 * meta.get() / .set() / .has() / .remove()  auf Root-Ebene
 */
const createMetaProxy = (prefix = '') => new Proxy(Object.create(null), {

  get (target, prop) {
    if (typeof prop === 'symbol') {
      return prop === Symbol.toPrimitive ? () => read(prefix) ?? '' : undefined;
    }

    if (prefix === '' && prop in ROOT_API) return ROOT_API[prop];

    // damit sich ein Knoten wie sein Wert verhält
    if (prop === 'toString' || prop === 'valueOf') return () => read(prefix) ?? '';
    if (prop === 'toJSON') return () => read(prefix);
    // sonst hält await den Proxy für ein Thenable
    if (prop === 'then' || prop === 'catch') return undefined;

    const nextKey = prefix ? withColon(prefix, prop) : prop;
    return createMetaProxy(nextKey.includes(':') ? nextKey : `${nextKey}:`);
  },

  set (target, prop, value) {
    if (typeof prop !== 'string') return false;
    setMeta(prefix ? withColon(prefix, prop) : prop, value);
    return true;
  },

  deleteProperty (target, prop) {
    if (typeof prop !== 'string') return false;
    removeMeta(prefix ? withColon(prefix, prop) : prop);
    return true;
  },
});

export const meta = createMetaProxy();
