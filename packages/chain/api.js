// @domina/chain/api.js
// the built-in methods, as definitions (see define.js)

import { getAttr }        from '@domina/methods/getAttr';
import { getData }        from '@domina/methods/getData';
import { getElementSize } from '@domina/methods/getElementSize';
import { getHTML }        from '@domina/methods/getHTML';
import { getStyle }       from '@domina/methods/getStyle';
import { setAttr }        from '@domina/methods/setAttr';
import { setData }        from '@domina/methods/setData';
import { setHTML }        from '@domina/methods/setHTML';
import { setStyle }       from '@domina/methods/setStyle';

import { isPlainObject, toCamelCase, toKebabCase } from './shared.js';

// a key and a value, or a map of them -> [key, value] pairs
const entriesOf = (keyOrMap, value) => isPlainObject(keyOrMap) ? Object.entries(keyOrMap) : [[keyOrMap, value]];

// :::::: ATTRIBUTES

// aria-* keys go through aria: there true and false are values, not presence
export const attr = {
  params : { name: 'string', value: 'string' },
  read   : (element, name) => getAttr(element, name),
  write  : (element, nameOrMap, value) => {
    for (const [key, val] of entriesOf(nameOrMap, value)) {
      if (toKebabCase(key).startsWith('aria-')) writeAria(element, key, val);
      else                                      setAttr(element, key, val);
    }
  },
};

// :::::: ARIA
// the prefix is optional: 'expanded', 'ariaExpanded' and 'aria-expanded' are the same.
// true and false become 'true' and 'false', a list (id references, tokens) is joined, null removes

const ariaName = key => { const name = toKebabCase(key); return name.startsWith('aria-') ? name : `aria-${name}`; };

function writeAria (element, key, value) {
  if (value == null) element.removeAttribute(ariaName(key));
  else               element.setAttribute(ariaName(key), Array.isArray(value) ? value.join(' ') : String(value));
}

function readAria (element) {
  const names = element.getAttributeNames().filter(name => name.startsWith('aria-'));
  return Object.fromEntries(names.map(name => [toCamelCase(name.slice(5)), element.getAttribute(name)]));
}

export const aria = {
  params : { name: 'string', value: 'string' },
  read   : (element, name) => name == null ? readAria(element) : element.getAttribute(ariaName(name)),
  write  : (element, nameOrMap, value) => { for (const [key, val] of entriesOf(nameOrMap, value)) writeAria(element, key, val); },
};

// :::::: DATA
// dataset, strings in and strings out: nothing is cast on reading. true is an empty
// attribute, false and null remove, objects and lists are stored as json

const dataKey = name => name.startsWith('data-') ? name.slice(5) : name;

function writeData (element, key, value) {
  if (value == null || value === false) delete element.dataset[toCamelCase(dataKey(key))];
  else                                  setData(element, dataKey(key), value === true ? '' : value);
}

export const data = {
  params : { name: 'string', value: 'string' },
  read   : (element, name) => getData(element, name == null ? undefined : dataKey(name), { cast: false }),
  write  : (element, nameOrMap, value) => { for (const [key, val] of entriesOf(nameOrMap, value)) writeData(element, key, val); },
};

export const dataset = { ...data, alias: 'data' };

// :::::: CONTENT

export const html = {
  params : { html: 'html' },
  read   : (element)       => getHTML(element),
  write  : (element, html) => setHTML(element, html),
};

// :::::: STYLES

export const style = {
  params : { property: 'string', value: 'string' },
  read   : (element, property)                => getStyle(element, property),
  write  : (element, propertyOrMap, value)    => setStyle(element, propertyOrMap, value),
};

// :::::: GEOMETRY

const onlyBox = options => Object.keys(options).every(key => key === 'box');

export const size = {
  object : true,
  params : { w: 'number', h: 'number', box: 'string' },
  reads  : ([options]) => options == null || onlyBox(options),

  read (element, { box } = {}) {
    const size = getElementSize(element, { box });
    return size && { h: size.height, w: size.width };
  },

  // only what is given is written, null removes
  write (element, { h, w }) {
    const styles = {};
    if (w !== undefined) styles.width  = w;
    if (h !== undefined) styles.height = h;
    setStyle(element, styles);
  },
};
