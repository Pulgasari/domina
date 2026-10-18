//

// :::::: IMPORT

import { isNumber, isObject, isString, toKebabCase } from './shared.js';

import { createElement }  from './createElement.js';
import { getMetaAttr }    from './getMetaAttr.js';
import { getMetaElement } from './getMetaElement.js';
import { removeMeta }     from './removeMeta.js';
import { resolveElement } from './resolveElement.js';
import { isElementish } from './_shared.js';
import { buildSelector }  from './buildSelector.js';
import { resolveContext } from './resolveContext.js';
import { resolveElement } from './resolveElement.js';

// :::::: CONSTS

const HTTP_EQUIV_KEYS = new Set([ 'content-type', 'default-style', 'refresh', 'x-ua-compatible', 'content-security-policy' ]);      
const SKIP_KEYS       = new Set(['tag', 'tagName', 'id', 'class', 'className', 'dataset', 'data']);
const UNITLESS = new Set([
  'animation-iteration-count', 'aspect-ratio', 'border-image-outset', 'border-image-slice',
  'border-image-width', 'column-count', 'flex', 'flex-grow', 'flex-shrink', 'font-weight',
  'grid-area', 'grid-column', 'grid-row', 'line-height', 'opacity', 'order', 'orphans',
  'scale', 'tab-size', 'widows', 'z-index', 'zoom',
]);

// :::::: REFS

const $HEAD = () => document.head;
const NODE  = Symbol.for('domina.node');

// :::::: HELPERS

const escapeAttr = (value) => { const str = String(value); return typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(str) : str.replace(/"/g, '\\"'); };
const escapeKey  = (key)   => typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(key) : key;

const isFalsish = (sth) => sth === false || sth == null;
const isNullish = (sth) => sth === null || sth === undefined;
const isNodeMap = (sth) => sth instanceof NamedNodeMap;

function toObj (sth) {
  const obj = {};
  if (isNodeMap(sth)) for (const { name, value } of sth) attrs[name] = value;
  return obj;
}

const isVar = property => property.startsWith('--');
const normalizeStylePropertyName = property => isVar(property) ? property : toKebabCase(property);
const cssValue = (property, value) => isNumber(value) && !UNITLESS.has(property) && !isVar(property) ? `${value}px` : String(value);



// METHODS

/*
buildSelector
resolveElement

getAttribute
getAttributes
getStyleProperty
getStyleProperties

setAttribute
setAttributes
setStyleProperty
setStyleProperties
*/

// Converts a selector string or Element Descriptor Object (EDO) into a valid CSS selector string.
function buildSelector (sth) {
  if  (isString(sth)) return sth;
  if (!isObject(sth)) return '*';

  let selector = String(sth.tag || sth.tagName || '').toLowerCase();

  if (sth.id) selector += '#' + escapeAttr(sth.id);

  const className = sth.class || sth.className;
  if (className) {
    const cleaned = String(className).trim().replace(/\s+/g, '.');
    if (cleaned) selector += '.' + cleaned;
  }

  const data = sth.dataset || sth.data;
  if (isObject(data)) {
    for (const [k,v] of Object.entries(data)) {
      if (v === false || v == null) continue;
      const key = toKebabCase(k);
      selector += v === true ? `[data-${key}]` : `[data-${key}="${escapeAttr(v)}"]`;
    }
  }

  for (const [k,v] of Object.entries(sth)) {
    if (SKIP_KEYS.has(k) || v === false || v == null) continue;
    selector += v === true ? `[${k}]` : `[${k}="${escapeAttr(v)}"]`;
  }

  return selector || '*';
}

// Resolves input (Selector, EDO, Node, or Wrapper) to a single DOM Element.
function resolveElement (sth, ctx) {
  if (!sth)               return null;
  if (sth[NODE] === true) return sth.node ?? null;
  if (isElementish(sth))  return sth;

  const selector = buildSelector(sth);
  if (!selector) return null;

  try   { return resolveContext(ctx).querySelector(selector) ?? null; }
  catch { return null; } // Return null on invalid selector DOMExceptions
}

function getAttribute (spec, key) {
  const element = resolveElement(spec); if (!element) return null;
  return element.getAttribute(toKebabCase(key));
}

function getAttributes (spec) {
  const element = resolveElement(spec); if (!element) return {};
  return toObj(element.attributes);
}

function setAttribute (spec, key, value) {
  const element = resolveElement(spec); if (!element) return null;
  const name    = toKebabCase(key);
  
       if (isFalsish(key)) element.removeAttribute(name);
  else if (value === true) element.setAttribute(name, '');
  else                     element.setAttribute(name, String(value));
  
  return element;
}

function setAttributes (spec, entries) {
  const element = resolveElement(spec); if (!element) return null;
  for (const [key, value] of entries) setAttribute(element, key, value);
  return element;
}



// :::::::::::: STYLE ::::::::::::::::::::::::::::::::::::::::::::::::

const getComputedStyleObj = (spec) => { const element = resolveElement(spec) ?? null; return getComputedStyle(element); }
const   getInlineStyleObj = (spec) => resolveElement(spec)?.style ?? null:

function getComputedStylePropertyValue (spec, key) {
  const element  = resolveElement(spec); if (!element) return null;
  const styleObj = getComputedStyleObj(element);
  const name     = normalizeStylePropertyName(key);
  
  return styleObj.getPropertyValue(name).trim() || null;
}

function   getInlineStylePropertyValue () {
  const element  = resolveElement(spec); if (!element) return null;
  const styleObj = getInlineStyleObj(element);
  const name     = normalizeStylePropertyName(key);
  
  return styleObj.getPropertyValue(name).trim() || null;
}

function setStyleProperty (spec, key, value) {
  const element  = resolveElement(spec); if (!element) return null;
  const property = normalizedStylePropertyName(key);
  
  if (isFalsish(value)) element.style.removeProperty(property);
  else                  element.style.setProperty(property, cssValue(property, value));
  
  return element;
}

function setStyleProperties (spec, entries) {
  const element = resolveElement(spec); if (!element) return null;
  for (const [key, value] of entries) setStyleProperty(element, key, value);
  return element;
}

/*
const 
setAttributes      = (spec, entries) => entries.forEach([k,v] => setAttribute     (spec, k, v)),   
setStyleProperties = (spec, entries) => entries.forEach([k,v] => setStyleProperty (spec, k, v));   
*/

// Das Attribut ergibt sich aus dem Key:
// OpenGraph/Twitter/eigene Namespaces (mit ':')
// -> property, HTTP-Header -> http-equiv, sonst name

function getMetaAttributeName (key) {
  if !isString(key) return 'name';
  key = key.toLowerCase();
  
  return HTTP_EQUIV_KEYS.has(key)  ? 'http-equiv'
       : key.includes(':')         ? 'property'
       : 'name';
}

function getMetaElement (key) {
  if (!isString(key) || !key) return null;
  const safe = escapeKey(key);
  return $HEAD?.querySelector(`meta[${getMetaAttributeName(key)}="${safe}"]`)
      ?? $HEAD?.querySelector(`meta[name="${safe}"], meta[property="${safe}"]`)
      ?? null;
}

/**
 * setMeta('description', '…')
 * setMeta({ description: '…', 'og:image': '…' })
 * null/undefined als Wert entfernt das Tag.
 */
export function setMeta (keyOrMap, value) {
  if (isObject(keyOrMap)) {
    const entries = Object.entries(keyOrMap);
    const written = {};
    for (const [key, val] of entries) written[key] = setMeta(key, val);
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
}

export default setMeta;
