// @ts-self-types="./index.d.ts"
// @domina/prototype

// the dom verbs of domina right on the dom prototypes, for an app that owns its globals:
//
//   import '@domina/prototype';
//
//   root.getElement('.row')                        Element, Document, DocumentFragment
//   root.getElements({ tag: 'li', dataset: { done: true } })
//   button.onEvent('click', save)                  EventTarget: window, document, elements …
//   window.onEvents({ resize, scroll }, { passive: true })
//   input.emitEvent('change', { value })
//   el.setProperties({ hidden: false, style: { gap: 8 }, dataset: { id: 5 } })
//   el.setAttributes({ ariaLabel: 'close', disabled: false })
//   el.style.setTokens({ accent: 'tomato', size: 2 })   CSSStyleDeclaration
//
// the methods are non-enumerable like the natives. a name a prototype has already is
// overwritten with a warning: the app decides what its dom means, a later standard
// method of the same name is taken care of when it comes.

// :::::: SHARED

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = value => typeof value === 'string';

const toKebabCase = name => name.replace(/[A-Z]/g, char => '-' + char.toLowerCase());
const toCamelCase = name => name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

// :::::: SELECT
// a selector string as it is, or an object that describes the element:
// { tag, id, class, dataset: { key: value | true }, attribute: value | true }.
// false and nullish leave a key out

const escape = value => typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/"/g, '\\"');
const OWN    = new Set(['tag', 'tagName', 'id', 'class', 'className', 'dataset', 'data']);

function selectorOf (spec) {
  if (isString(spec)) return spec;
  if (!isObject(spec)) return '*';

  let selector = String(spec.tag ?? spec.tagName ?? '').toLowerCase();
  if (spec.id) selector += '#' + escape(spec.id);

  const classes = [spec.class ?? spec.className ?? []].flat().join(' ').trim();
  if (classes) selector += '.' + classes.split(/\s+/).map(escape).join('.');

  for (const [key, value] of Object.entries(spec.dataset ?? spec.data ?? {})) {
    if (value === false || value == null) continue;
    selector += value === true ? `[data-${toKebabCase(key)}]` : `[data-${toKebabCase(key)}="${escape(value)}"]`;
  }

  for (const [key, value] of Object.entries(spec)) {
    if (OWN.has(key) || value === false || value == null) continue;
    selector += value === true ? `[${toKebabCase(key)}]` : `[${toKebabCase(key)}="${escape(value)}"]`;
  }

  return selector || '*';
}

// the first match or null, an invalid selector included
function getElement (spec) {
  try   { return this.querySelector(selectorOf(spec)); }
  catch { return null; }
}

// all matches as a real array, an invalid selector gives none
function getElements (spec) {
  try   { return [...this.querySelectorAll(selectorOf(spec))]; }
  catch { return []; }
}

// :::::: EVENTS
// types as 'click keydown', 'click, keydown' or an array. focus and blur listen to their
// bubbling twins, so a container hears its descendants. a listener comes back as off()

const BUBBLING = { blur: 'focusout', focus: 'focusin' };
const typesOf  = types => (isString(types) ? types.split(/[\s,]+/) : [types].flat()).filter(Boolean).map(type => BUBBLING[type] ?? type);

function onEvent (types, handler, options) {
  if (typeof handler !== 'function') return () => {};
  const list = typesOf(types);
  for (const type of list) this.addEventListener(type, handler, options);
  return () => { for (const type of list) this.removeEventListener(type, handler, options); };
}

// { click: fn, 'keydown keyup': fn } with shared options, one off() for all of them
function onEvents (map, options) {
  const offs = Object.entries(map ?? {}).map(([types, handler]) => this.onEvent(types, handler, options));
  return () => { for (const off of offs) off(); };
}

// a CustomEvent with detail, false when a listener called preventDefault()
function emitEvent (type, detail = null, { bubbles = true, cancelable = true, composed = false } = {}) {
  return this.dispatchEvent(new CustomEvent(type, { bubbles, cancelable, composed, detail }));
}

// :::::: ATTRIBUTES
// camelCase keys become kebab-case. false and nullish remove, true sets the attribute
// empty, anything else as a string. aria-* keeps 'true' and 'false', they are values there

function setAttributes (map) {
  for (const [key, value] of Object.entries(map ?? {})) {
    const name = toKebabCase(key);
    if (value == null || (value === false && !name.startsWith('aria-'))) this.removeAttribute(name);
    else if (value === true && !name.startsWith('aria-'))                this.setAttribute(name, '');
    else                                                                 this.setAttribute(name, String(value));
  }
  return this;
}

// :::::: STYLE
// numbers get px, except where a number is the value. nullish and false remove

const UNITLESS = new Set([
  'animation-iteration-count', 'aspect-ratio', 'border-image-outset', 'border-image-slice', 'border-image-width',
  'column-count', 'fill-opacity', 'flex', 'flex-grow', 'flex-shrink', 'font-weight', 'grid-area', 'grid-column',
  'grid-row', 'line-height', 'opacity', 'order', 'orphans', 'scale', 'stroke-opacity', 'tab-size', 'widows',
  'z-index', 'zoom',
]);

const cssName  = key => key.startsWith('--') ? key : toKebabCase(key);
const cssValue = (name, value) => typeof value === 'number' && !name.startsWith('--') && !UNITLESS.has(name) ? `${value}px` : String(value);

function writeStyle (style, map) {
  for (const [key, value] of Object.entries(map)) {
    const name = cssName(key);
    if (value == null || value === false) style.removeProperty(name);
    else                                  style.setProperty(name, cssValue(name, value));
  }
}

// a token is a custom property without its dashes: 'accent' is --accent
const tokenName = name => name.startsWith('--') ? name : `--${name}`;

function setToken (name, value) {
  if (value == null || value === false) this.removeProperty(tokenName(name));
  else                                  this.setProperty(tokenName(name), String(value));
  return this;
}

function setTokens (map) {
  for (const [name, value] of Object.entries(map ?? {})) this.setToken(name, value);
  return this;
}

// the value as a trimmed string, null when unset. on getComputedStyle(el) the one in effect
function getToken (name) {
  return this.getPropertyValue(tokenName(name)).trim() || null;
}

function getTokens (names) {
  const list = Array.isArray(names) ? names : Object.keys(names ?? {});
  return Object.fromEntries(list.map(name => [name, this.getToken(name)]));
}

// :::::: PROPERTIES
// property by property, with two that take an object: style (a string is the style
// attribute) and dataset (objects as json, nullish removes). class takes a list as well

const encode = value => isString(value) ? value : isObject(value) || Array.isArray(value) ? JSON.stringify(value) : String(value);

function setProperties (map) {
  for (const [key, value] of Object.entries(map ?? {})) {
    if (value === undefined) continue;

    if (key === 'style' && value !== null && !isString(value)) writeStyle(this.style, value);
    else if (key === 'dataset' || key === 'data') {
      for (const [name, data] of Object.entries(value ?? {})) {
        const prop = toCamelCase(name);
        if (data == null) delete this.dataset[prop];
        else              this.dataset[prop] = encode(data);
      }
    }
    else if (key === 'class' || key === 'className') this.className = [value ?? []].flat().filter(Boolean).join(' ');
    else this[key] = value;
  }
  return this;
}

// :::::: INSTALL

const define = (proto, methods) => {
  for (const [name, value] of Object.entries(methods)) {
    if (name in proto) console.warn(`[@domina/prototype] ${proto.constructor.name}.prototype.${name} exists, overwritten.`);
    Object.defineProperty(proto, name, { configurable: true, value, writable: true });
  }
};

const query = { getElement, getElements };

define(EventTarget.prototype,         { emitEvent, onEvent, onEvents });
define(Element.prototype,             { ...query, setAttributes, setProperties });
define(Document.prototype,            query);
define(DocumentFragment.prototype,    query);
define(CSSStyleDeclaration.prototype, { getToken, getTokens, setToken, setTokens });

export { selectorOf };
