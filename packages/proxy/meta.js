// @domina/proxy :: meta

/*
the <meta> elements as values:

  domina.meta.description = 'notes'        <meta name="description" content="notes">
  domina.meta.description                  'notes', null without one
  domina.meta.og.image    = 'cover.png'    <meta property="og:image" …>
  domina.meta['og:image']                  the same
  domina.meta.themeColor  = '#000'         <meta name="theme-color" …>, camelCase is kebab-case
  domina.meta.description = null           removes it, as delete does
  Object.keys(domina.meta)                 every key there is, JSON.stringify gives { key: content }

a known prefix (og, twitter, article …) is a namespace of its own, everything
else is read as the value it has. a key with : (og:image:width) goes in brackets.
*/

import { getMeta }    from '@domina/verbs/getMeta.js';
import { hasMeta }    from '@domina/verbs/hasMeta.js';
import { removeMeta } from '@domina/verbs/removeMeta.js';
import { setMeta }    from '@domina/verbs/setMeta.js';

import { isString } from './shared.js';

const PREFIXES = new Set(['al', 'article', 'book', 'fb', 'music', 'og', 'product', 'profile', 'twitter', 'video']);

// themeColor -> theme-color, og:image stays
const keyOf = key => key.includes(':') ? key : key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);

function space (prefix = '') {
  const full = key => prefix + keyOf(key);
  const own  = () => Object.keys(getMeta()).filter(key => key.startsWith(prefix)).map(key => key.slice(prefix.length));

  return new Proxy(Object.create(null), {
    get (target, key) {
      if (!isString(key)) return undefined;
      if (key === 'toJSON') return () => Object.fromEntries(own().map(name => [name, getMeta(prefix + name)]));
      if (!prefix && PREFIXES.has(key)) return space(`${key}:`);
      return getMeta(full(key));
    },
    set (target, key, value) {
      if (!isString(key)) return false;
      if (value == null) removeMeta(full(key));
      else setMeta(full(key), value);
      return true;
    },
    deleteProperty (target, key) {
      if (isString(key)) removeMeta(full(key));
      return true;
    },
    has                      : (target, key) => isString(key) && hasMeta(full(key)),
    ownKeys                  : () => own(),
    getOwnPropertyDescriptor : (target, key) => isString(key) && hasMeta(full(key)) ? { configurable: true, enumerable: true, value: getMeta(full(key)), writable: true } : undefined,
  });
}

export const meta = space();
