// @domina/core/methods/getMetaElement.js

import { isString }    from './../vendors.js';
import { getMetaAttr } from './getMetaAttr.js';

const head = () => document.head;

const escapeKey = key =>
  typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(key) : key;

export const getMetaElement = key => {
  if (!isString(key) || !key) return null;
  const safe = escapeKey(key);
  return head()?.querySelector(`meta[${getMetaAttr(key)}="${safe}"]`)
      ?? head()?.querySelector(`meta[name="${safe}"], meta[property="${safe}"]`)
      ?? null;
};

export default getMetaElement;
