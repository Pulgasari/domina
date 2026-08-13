// @domina/core/meta.js

import { isObject, isString } from './internal/is.js';
import { createElement } from './element.js';

// Das Attribut ergibt sich aus dem Key:
// OpenGraph/Twitter/eigene Namespaces (mit ':') -> property, HTTP-Header -> http-equiv, sonst name
const HTTP_EQUIV_KEYS = new Set([
  'content-type',
  'default-style',
  'refresh',
  'x-ua-compatible',
  'content-security-policy',
]);

const head = () => document.head;

const escapeKey = key =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(key) : key;

export const

getMetaAttr = key =>
    !isString(key)                          ? 'name'
  : HTTP_EQUIV_KEYS.has(key.toLowerCase())  ? 'http-equiv'
  : key.includes(':')                       ? 'property'
  : 'name',

getMetaElement = key => {
  if (!isString(key) || !key) return null;
  const safe = escapeKey(key);
  return head()?.querySelector(`meta[${getMetaAttr(key)}="${safe}"]`)
      ?? head()?.querySelector(`meta[name="${safe}"], meta[property="${safe}"]`)
      ?? null;
},

// getMeta()      -> { key: content } aller Meta-Tags
// getMeta('key') -> string | null
getMeta = key => {
  if (key === undefined) {
    const all = {};
    for (const el of head()?.querySelectorAll('meta') ?? []) {
      const name = el.getAttribute('name') ?? el.getAttribute('property') ?? el.getAttribute('http-equiv');
      if (name) all[name] = el.getAttribute('content') ?? '';
      else if (el.hasAttribute('charset')) all.charset = el.getAttribute('charset');
    }
    return all;
  }
  return getMetaElement(key)?.getAttribute('content') ?? null;
},

hasMeta = key => getMetaElement(key) !== null,

/**
 * setMeta('description', '…')
 * setMeta({ description: '…', 'og:image': '…' })
 * null/undefined als Wert entfernt das Tag.
 */
setMeta = (keyOrMap, value) => {
  if (isObject(keyOrMap)) {
    const written = {};
    for (const [key, val] of Object.entries(keyOrMap)) written[key] = setMeta(key, val);
    return written;
  }

  const key = keyOrMap;
  if (!isString(key) || !key) return null;

  if (value == null) {
    removeMeta(key);
    return null;
  }

  const content = String(value);
  const element = getMetaElement(key);

  if (element) {
    element.setAttribute('content', content);
    return element;
  }
  return createElement('meta', { [getMetaAttr(key)]: key, content, appendTo: head() });
},

// removeMeta('description', 'og:image')
// Ein Key mit abschliessendem ':' loescht den ganzen Namespace: removeMeta('og:')
removeMeta = (...keys) => {
  const removed = [];

  for (const key of keys.flat(Infinity)) {
    if (!isString(key) || !key) continue;

    if (key.endsWith(':')) {
      for (const el of head()?.querySelectorAll('meta') ?? []) {
        const name = el.getAttribute('name') ?? el.getAttribute('property') ?? '';
        if (name.startsWith(key)) { el.remove(); removed.push(el); }
      }
      continue;
    }

    const element = getMetaElement(key);
    if (element) { element.remove(); removed.push(element); }
  }

  return removed;
};

export const updateMeta = setMeta;
