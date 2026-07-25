// domina/index.js

// ---------------------------------------------------------------------------
// Internal type checks
// ---------------------------------------------------------------------------
const isArray      = Array.isArray;
const isString     = v => typeof v === 'string';
const isFn         = v => typeof v === 'function';
const isNullish    = v => v == null;                         // null | undefined
const isObject     = v => v !== null && typeof v === 'object'; // excludes null, includes arrays
const isFragment   = v => v instanceof DocumentFragment;
const isElementish = v => v instanceof Element || v instanceof DocumentFragment || v instanceof Document;

// ---------------------------------------------------------------------------
// Main Elements References
// ---------------------------------------------------------------------------
export let
  $app  = document.getElementById('app'),
  $body = document.body,
  $head = document.head,
  $root = document.documentElement;

// ---------------------------------------------------------------------------
// Domain-specific checks
// ---------------------------------------------------------------------------
let
  isDate   = v => /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.test(v) || (!isNaN(Date.parse(v)) && isNaN(Number(v))),
  isEDO    = v => isObject(v) && (v.tag || v.tagName),
  isEmpty  = v => v === '' || v === null || v === undefined,
  isHTML   = v => isString(v) && v.trim().startsWith('<'),
  isIdLike = v => v.charCodeAt(0) === 35 && v.indexOf(' ') === -1 && v.indexOf('.') === -1,
  isDings  = el => el.type === 'checkbox' || el.type === 'radio',
  isMulti  = el => el.tagName === 'SELECT' && el.multiple,
  isURL    = v => isString(v) && v.includes('://');

// ---------------------------------------------------------------------------
// Magic Helpers
// ---------------------------------------------------------------------------
export let
  _doc  = sth => sth ? _el(sth) : document,
  _el   = sth => isElementish(sth) ? sth : getElement(_slct(sth)),
  _root = sth => sth ? _el(sth) : $root,
  _slct = sth => {
    return isObject(sth)
      ? sth.id
        ? '#' + sth.id
        : Object.entries(sth).map(([k, v]) => `[${k}="${v}"]`).join('')
      : sth;
  };

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------
export let
  getElementById        = selector              => document.getElementById(selector),
  getElement            = (selector, context)   => _doc(context).querySelector(selector),
  // getElement         = (selector, context)   => (isIdLike(selector) && getElementById(selector.slice(1))) || _doc(context).querySelector(selector),
  getElements           = (selector, context)   => [..._doc(context).querySelectorAll(selector)],
  getElementsByDataAttr = (key, parent)         => getElements(`[data-${key}]`, parent),
  getElementsByDataKey  = (key, parent)         => getElements(`[data-key="${key}"]`, parent),
  get                   = getElements,

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------
  createElement = (tag = 'div', obj = {}, ...children) => {
    // Dirty edge case: first argument is a props object
    if (isObject(tag)) {
      obj = { ...tag };
      tag = tag.tag || tag.tagName || 'div';
      delete obj.tag;
      delete obj.tagName;
    }

    const el = document.createElement(tag);
    updateElement(el, obj, ...children);
    return el;
  },

  createFragment   = ()  => document.createDocumentFragment(),
  createFragment2  = sth => document.createRange().createContextualFragment(sth),
  createTextNode   = text => document.createTextNode(String(text)),
  createStylesheet = sth => createElement('style', isString(sth) ? { textContent: sth } : sth),

// ---------------------------------------------------------------------------
// insert
// ---------------------------------------------------------------------------
  insertElement = (sth, target = $body, mode = 'append') => {
    let el = isElementish(sth) ? sth
           : isHTML(sth)       ? createFragment2(sth)
           : isEDO(sth)        ? createElement(sth)
           : _el(sth);

    let result = el;
    if (isFragment(el)) {
      result = el.childNodes.length === 1
        ? el.childNodes[0]
        : [...el.childNodes];
    }

    mode = {
      after       : 'after',
      afterbegin  : 'prepend',
      afterend    : 'after',
      before      : 'before',
      beforebegin : 'before',
      prepend     : 'prepend',
    }[mode] || 'append';

    if (el) _el(target)?.[mode](el);

    return result;
  },

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------
  updateElement = (el, props = {}, ...children) => {
    el = _el(el);
    if (!el) return false;

    // Apply props
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'style') {
        Object.assign(el.style, value);
      } else if (key === 'dataset' || key === 'data') {
        Object.assign(el.dataset, value);
      } else if (key.startsWith('on') && isFn(value)) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key in el) {
        el[key] = value;
      } else {
        el.setAttribute(key, value);
      }
    });

    // Append children
    children.forEach(child => el.append(child));
  },

  updateTitle = str => (document.title = str),

// ---------------------------------------------------------------------------
// remove
// ---------------------------------------------------------------------------
  clearElement  = sth => _el(sth) && (_el(sth).innerHTML = ''),
  removeElement = sth => _el(sth)?.remove();
