// @domina/chain/api.js
// the built-in methods, as definitions (see define.js)

import { addClass as addClassTo }         from '@domina/verbs/addClass.js';
import { getAttr }                        from '@domina/verbs/getAttr.js';
import { getData }                        from '@domina/verbs/getData.js';
import { getElementSize }                 from '@domina/verbs/getElementSize.js';
import { getHTML }                        from '@domina/verbs/getHTML.js';
import { getStyle }                       from '@domina/verbs/getStyle.js';
import { getText }                        from '@domina/verbs/getText.js';
import { getValue }                       from '@domina/verbs/getValue.js';
import { hasClass as hasClassOn }         from '@domina/verbs/hasClass.js';
import { removeClass as removeClassFrom } from '@domina/verbs/removeClass.js';
import { setAttr }                        from '@domina/verbs/setAttr.js';
import { setClass }                       from '@domina/verbs/setClass.js';
import { setData }                        from '@domina/verbs/setData.js';
import { setHTML }                        from '@domina/verbs/setHTML.js';
import { setStyle }                       from '@domina/verbs/setStyle.js';
import { setText }                        from '@domina/verbs/setText.js';
import { setValue }                       from '@domina/verbs/setValue.js';
import { toggleClass as toggleClassOn }   from '@domina/verbs/toggleClass.js';

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
// two views of data-*. both: the prefix is optional ('fooBar', 'foo-bar', 'dataFooBar' and
// 'data-foo-bar' are the same), null removes, a map sets several.
//
//   data     typed: reads are cast ('42' -> 42, 'true' -> true, '{…}' -> object),
//            writes are encoded so they read back as written (true -> 'true', object -> json)
//   dataset  as the dom has it: strings in, strings out, nothing cast or encoded

const dataKey = key => { const name = toKebabCase(key); return toCamelCase(name.startsWith('data-') ? name.slice(5) : name); };

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

export const 
addClass    = { write: addClassTo,      params: { names: 'string' }},
removeClass = { write: removeClassFrom, params: { names: 'string' }},
toggleClass = { write: toggleClassOn,   params: { names: 'string', force: 'bool' }},
hasClass    = { read: hasClassOn,       params: { names: 'string' }};

// the whole list: read as an array, write replaces it. exported as class
const classList = {
  params : { names: 'string' },
  read   : element => [...element.classList],
  write  : setClass,
};

export { classList as class };

// :::::: STYLES

export const
html  = { read: getHTML,  write: setHTML,  params: { html: 'html' } },
style = { read: getStyle, write: setStyle, params: { property: 'string', value: 'string' } },
text  = { read: getText,  write: setText,  params: { text: 'string' } },
value = { read: getValue, write: setValue, params: { value: 'json' }, reads: args => args.length === 0 };     
  
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
