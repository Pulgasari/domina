// @domina/chain/api.js
// the built-in methods, as definitions (see define.js)

import { addClass as addClassTo }         from '@domina/methods/addClass.js';
import { getAttr }                        from '@domina/methods/getAttr.js';
import { getData }                        from '@domina/methods/getData.js';
import { getElementSize }                 from '@domina/methods/getElementSize.js';
import { getHTML }                        from '@domina/methods/getHTML.js';
import { getStyle }                       from '@domina/methods/getStyle.js';
import { getText }                        from '@domina/methods/getText.js';
import { getValue }                       from '@domina/methods/getValue.js';
import { hasClass as hasClassOn }         from '@domina/methods/hasClass.js';
import { removeClass as removeClassFrom } from '@domina/methods/removeClass.js';
import { setAttr }                        from '@domina/methods/setAttr.js';
import { setClass }                       from '@domina/methods/setClass.js';
import { setData }                        from '@domina/methods/setData.js';
import { setHTML }                        from '@domina/methods/setHTML.js';
import { setStyle }                       from '@domina/methods/setStyle.js';
import { setText }                        from '@domina/methods/setText.js';
import { setValue }                       from '@domina/methods/setValue.js';
import { toggleClass as toggleClassOn }   from '@domina/methods/toggleClass.js';

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
// two views of data-*. both: the data- prefix is optional, null removes, a map sets several.
//
//   data     typed: reads are cast ('42' -> 42, 'true' -> true, '{…}' -> object),
//            writes are encoded so they read back as written (true -> 'true', object -> json)
//   dataset  as the dom has it: strings in, strings out, nothing cast or encoded

const dataKey = name => toCamelCase(name.startsWith('data-') ? name.slice(5) : name);

const removeData = (element, key) => { delete element.dataset[dataKey(key)]; };

export const data = {
  params : { name: 'string', value: 'json' },
  read   : (element, name) => getData(element, name == null ? undefined : dataKey(name)),
  write  : (element, nameOrMap, value) => {
    for (const [key, val] of entriesOf(nameOrMap, value)) {
      if (val == null) removeData(element, key);
      else             setData(element, dataKey(key), val);
    }
  },
};

export const dataset = {
  params : { name: 'string', value: 'string' },
  read   : (element, name) => name == null ? { ...element.dataset } : element.dataset[dataKey(name)] ?? null,
  write  : (element, nameOrMap, value) => {
    for (const [key, val] of entriesOf(nameOrMap, value)) {
      if (val == null) removeData(element, key);
      else             element.dataset[dataKey(key)] = val;
    }
  },
};

// :::::: CLASSES
// names: 'a b', 'a, b', a list, or { a: true, b: false }

export const addClass    = { params: { names: 'string' },                write: (element, ...names)    => { addClassTo(element, ...names); } };
export const removeClass = { params: { names: 'string' },                write: (element, ...names)    => { removeClassFrom(element, ...names); } };
export const toggleClass = { params: { names: 'string', force: 'bool' }, write: (element, names, force) => { toggleClassOn(element, names, force); } };

// every name on the first element (or on every element, on .all)
export const hasClass = {
  params : { names: 'string' },
  read   : (element, names) => hasClassOn(element, names),
};

// the whole list: read as an array, write replaces it. exported as class
const classList = {
  params : { names: 'string' },
  read   : element         => [...element.classList],
  write  : (element, names) => { setClass(element, names); },
};

export { classList as class };

// :::::: CONTENT

export const html = {
  params : { html: 'html' },
  read   : (element)       => getHTML(element),
  write  : (element, html) => setHTML(element, html),
};

export const text = {
  params : { text: 'string' },
  read   : element         => getText(element),
  write  : (element, text) => { setText(element, text); },
};

// :::::: FORMS
// checkbox: boolean, select multiple: array, otherwise a string. { notify: true } fires input and change

export const value = {
  params : { value: 'json' },
  reads  : args => args.length === 0,
  read   : element                   => getValue(element),
  write  : (element, value, options) => { setValue(element, value, options); },
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
