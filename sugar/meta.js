// core/meta-namespace.js

const isOgOrTwitter = (key) =>
  key.startsWith('og:') || key.startsWith('twitter:') || key.includes(':');

const getMetaAttr = (key) => (isOgOrTwitter(key) ? 'property' : 'name');

const findMeta = (key) => {
  const attr = getMetaAttr(key);
  return document.head.querySelector(`meta[${attr}="${key}"]`);
};

// Standalone Helper
export const getMeta = (key) => {
  if (!key) return null;
  return findMeta(key)?.getAttribute('content') ?? null;
};

export const setMeta = (keyOrObj, value) => {
  if (typeof keyOrObj === 'object' && keyOrObj !== null) {
    for (const [k, v] of Object.entries(keyOrObj)) {
      setMeta(k, v);
    }
    return;
  }

  const key = keyOrObj;
  if (!key) return;

  if (value === null || value === undefined) {
    removeMeta(key);
    return;
  }

  const attr = getMetaAttr(key);
  let el = findMeta(key);

  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }

  el.setAttribute('content', String(value));
};

export const removeMeta = (...keys) => {
  for (const key of keys.flat()) {
    if (!key) continue;

    // Namespace-Löschung z. B. remove('og:')
    if (typeof key === 'string' && key.endsWith(':')) {
      const prefix = key;
      const metas = document.head.querySelectorAll('meta');
      metas.forEach((el) => {
        const name = el.getAttribute('name') || el.getAttribute('property') || '';
        if (name.startsWith(prefix)) el.remove();
      });
    } else {
      findMeta(key)?.remove();
    }
  }
};

// Rekursiver Proxy für geschachtelte Zugriffe (dom.meta.og.image = '...')
const createMetaProxy = (prefix = '') => {
  const dummyTarget = Object.create(null);

  return new Proxy(dummyTarget, {
    get(target, prop) {
      if (typeof prop !== 'string' || prop === 'then') return undefined;

      // Built-in API-Methoden auf Root-Ebene
      if (prefix === '') {
        if (prop === 'get') return getMeta;
        if (prop === 'set') return setMeta;
        if (prop === 'remove') return removeMeta;
      }

      const fullKey = prefix ? `${prefix}${prop}` : prop;

      // Sub-Proxy für Verschachtelung erzeugen (z. B. meta.og -> Proxy('og:'))
      const subProxy = createMetaProxy(`${fullKey}:`);

      // Primitive Konvertierungen abfangen (z. B. String(dom.meta.og.image))
      subProxy[Symbol.toPrimitive] = () => getMeta(fullKey);
      subProxy.toString = () => getMeta(fullKey) ?? '';
      subProxy.valueOf = () => getMeta(fullKey);

      return subProxy;
    },

    set(target, prop, value) {
      if (typeof prop !== 'string') return false;
      const fullKey = prefix ? `${prefix}${prop}` : prop;
      setMeta(fullKey, value);
      return true;
    }
  });
};

export const meta = createMetaProxy();
