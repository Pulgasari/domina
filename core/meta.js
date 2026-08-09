// core/meta.js

const $head = document.head;

/**
 * Bestimmt das korrekte Attribut für einen Meta-Key
 * - OpenGraph / Twitter / Custom Namespaces (mit `:`) -> 'property'
 * - HTTP-Header Keys -> 'http-equiv'
 * - Standard-Keys -> 'name'
 */
const HTTP_EQUIV_KEYS = new Set ([
  'content-type',
  'default-style',
  'refresh',
  'x-ua-compatible',
  'content-security-policy'
]);

export const getMetaAttr = (key) => {
  if (!key || typeof key !== 'string')        return 'name';
  if (HTTP_EQUIV_KEYS.has(key.toLowerCase())) return 'http-equiv';
  if (key.includes(':'))                      return 'property';
  return 'name';
};

export const getMetaElement = (key) => {
  if (!key || typeof key !== 'string') return null;
  
  const attr    = getMetaAttr(key);
  const safeKey = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(key) : key;
  
  return $head.querySelector(`meta[${attr}="${safeKey}"]`) 
      || $head.querySelector(`meta[name="${safeKey}"], meta[property="${safeKey}"]`);    
};

export const 
getMeta = key => getMetaElement(key)?.getAttribute('content') ?? null,
hasMeta = key => getMetaElement(key) !== null;

export const setMeta = (keyOrObj, value) => {
  // Massen-Update per Objekt: setMeta({ bla: '123', 'og:image': '...' })
  if (keyOrObj && typeof keyOrObj === 'object') {
    const results = {};
    for (const [k, v] of Object.entries(keyOrObj)) {
      results[k] = setMeta(k, v);
    }
    return results;
  }

  const key = keyOrObj;
  if (!key || typeof key !== 'string') return null;

  // Null/Undefined -> Entfernen
  if (value == null) {
    removeMeta(key);
    return null;
  }

  const strVal = String(value);
  const attr   = getMetaAttr(key);
  
  return getMetaElement(key)?.setAttribute('content', strVal)
      ?? createElement('meta', { [attr]: key, content: strVal, appendTo: $head });
};

// Core-Alias für konsistente Naming-Conventions
export const updateMeta = setMeta;

export const removeMeta = (...keys) => {
  const removed = [];
  const flatKeys = keys.flat(Infinity);

  for (const key of flatKeys) {
    if (!key || typeof key !== 'string') continue;

    // Namespace-Löschung (z.B. 'og:' entfernt alle <meta property="og:*">)
    if (key.endsWith(':')) {
      const prefix = key;
      const metas = $head.querySelectorAll('meta');
      metas.forEach((el) => {
        const nameVal = el.getAttribute('name') || el.getAttribute('property') || '';
        if (nameVal.startsWith(prefix)) { el.remove(); removed.push(el); }
      });
    } else {
      const el = getMetaElement(key);
      if (el) { el.remove(); removed.push(el); }
    }
  }

  return removed;
};
