// @domina/core/methods/getMetaAttr.js

import { isString } from './../vendors.js';

const HTTP_EQUIV_KEYS = new Set([
  'content-type',
  'default-style',
  'refresh',
  'x-ua-compatible',
  'content-security-policy',
]);

// Das Attribut ergibt sich aus dem Key:
// OpenGraph/Twitter/eigene Namespaces (mit ':')
// -> property, HTTP-Header -> http-equiv, sonst name

export function getMetaAttr (key) {
  return !isString(key)                          ? 'name'
       : HTTP_EQUIV_KEYS.has(key.toLowerCase())  ? 'http-equiv'
       : key.includes(':')                       ? 'property'
       : 'name';
}

export default getMetaAttr;
