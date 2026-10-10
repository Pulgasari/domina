// @ts-self-types="./index.d.ts"
// @domina/prototype

// :::::: SHARED

const isOff    = value => value == null || value === false;
const isFn     = value => typeof value === 'function';
const isString = value => typeof value === 'string';
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

const toEntries   = map   => Object.entries(map ?? {});
const toList      = value => [value ?? []].flat();
const toKebabCase = name  => name.replace(   /[A-Z]/g,     char  => '-' + char.toLowerCase());
const toCamelCase = name  => name.replace(/-([a-z])/g, (_, char) =>       char.toUpperCase());

// :::::: SELECT

const escape = value => typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(value)) : String(value).replace(/"/g, '\\"');
const OWN    = new Set(['tag', 'tagName', 'id', 'class', 'className', 'dataset', 'data']);

// [name] for true, [name="value"] otherwise
const attributeSelector = (name, value) => value === true ? `[${name}]` : `[${name}="${escape(value)}"]`;

function selectorOf (spec) {
  if  (isString(spec)) return spec;
  if (!isObject(spec)) return '*';

  let selector = String(spec.tag ?? spec.tagName ?? '').toLowerCase();
  if (spec.id) selector += '#' + escape(spec.id);

  const classes = toList(spec.class ?? spec.className).join(' ').trim();
  if (classes) selector += '.' + classes.split(/\s+/).map(escape).join('.');

  for (const [key, value] of toEntries(spec.dataset ?? spec.data)) {
    if (!isOff(value)) selector += attributeSelector(`data-${toKebabCase(key)}`, value);
  }

  for (const [key, value] of toEntries(spec)) {
    if (!OWN.has(key) && !isOff(value)) selector += attributeSelector(toKebabCase(key), value);
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

const BUBBLING = { blur: 'focusout', focus: 'focusin' };
const typesOf  = types => (isString(types) ? types.split(/[\s,]+/) : toList(types)).filter(Boolean).map(type => BUBBLING[type] ?? type);

function onEvent (types, handler, options) {
  if (!isFn(handler)) return () => {};
  const list = typesOf(types);
                 for (const type of list) this.   addEventListener(type, handler, options);
  return () => { for (const type of list) this.removeEventListener(type, handler, options); };
}

// { click: fn, 'keydown keyup': fn } with shared options, one off() for all of them
function onEvents (map, options) {
  const offs = toEntries(map).map(([types, handler]) => this.onEvent(types, handler, options));
  return () => { for (const off of offs) off(); };
}

// a CustomEvent with detail, false when a listener called preventDefault()
function emitEvent (type, detail = null, { bubbles = true, cancelable = true, composed = false } = {}) {
  return this.dispatchEvent(new CustomEvent(type, { bubbles, cancelable, composed, detail }));
}

// the next of the types as a promise, then every listener is gone again. a timeout
// rejects with an error, an aborted signal with its reason
function waitForEvent (types, { signal, timeout } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    let timer = 0;
    const done  = () => { off(); clearTimeout(timer); signal?.removeEventListener('abort', abort); };
    const abort = () => { done(); reject(signal.reason); };
    const off   = this.onEvent(types, event => { done(); resolve(event); });
    if (timeout) timer = setTimeout(() => { done(); reject(new Error(`waitForEvent: ${types} timed out after ${timeout}ms`)); }, timeout);
    signal?.addEventListener('abort', abort, { once: true });
  });
}

// :::::: ATTRIBUTES
// camelCase keys become kebab-case. false and nullish remove, true sets the attribute
// empty, anything else as a string. aria-* keys go to setAriaAttribute

function setAttributes (map) {
  for (const [key, value] of toEntries(map)) {
    const name = toKebabCase(key);
         if (name.startsWith('aria-')) this.setAriaAttribute(name, value);
    else if (isOff(value))             this.removeAttribute (name);
    else if (value === true)           this.setAttribute    (name, '');
    else                               this.setAttribute    (name, String(value));
  }
  return this;
}

// :::::: ARIA
// the prefix is optional: 'expanded', 'ariaExpanded' and 'aria-expanded' are the same.
// true and false are values here ('true', 'false'), only nullish removes. a list (id
// references, tokens) is joined with spaces

function ariaName (key) {
  const name = toKebabCase(key);
  return name.startsWith('aria-') ? name : `aria-${name}`;
}

function setAriaAttribute (name, value) {
  if (value == null) this.removeAttribute(ariaName(name));
  else               this.setAttribute   (ariaName(name), Array.isArray(value) ? value.join(' ') : String(value));
  return this;
}

function setAriaAttributes (map) {
  for (const [name, value] of toEntries(map)) this.setAriaAttribute(name, value);
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
  for (const [key, value] of toEntries(map)) {
    const name = cssName(key);
    if (isOff(value)) style.removeProperty(name);
    else              style.   setProperty(name, cssValue(name, value));
  }
}

// a token is a custom property without its dashes: 'accent' is --accent
const tokenName = name => name.startsWith('--') ? name : `--${name}`;

function setToken (name, value) {
  if (isOff(value)) this.removeProperty(tokenName(name));
  else              this.   setProperty(tokenName(name), String(value));
  return this;
}

function setTokens (map) {
  for (const [name, value] of toEntries(map)) this.setToken(name, value);
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
// attribute) and dataset (objects as json, nullish removes). class takes a list as well.
// undefined leaves a property alone

const encode = value => isString(value) ? value : value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value);

function writeDataset (dataset, map) {
  for (const [key, value] of toEntries(map)) {
    const name = toCamelCase(key);
    if (value == null) delete dataset[name];
    else                      dataset[name] = encode(value);
  }
}

function setProperties (map) {
  for (const [key, value] of toEntries(map)) {
         if (value === undefined)                      continue;
    else if (key === 'style'   && isObject(value))     writeStyle  (this.style,   value);
    else if (key === 'dataset' || key === 'data')      writeDataset(this.dataset, value);
    else if (key === 'class'   || key === 'className') this.className = toList(value).filter(Boolean).join(' ');
    else                                               this[key]      = value;
  }
  return this;
}

// :::::: TRAVERSAL
// the element's relatives as arrays, the nearest first, a spec filters them

const passes = (element, filter) => filter == null || element.matches(selectorOf(filter));

function walk (start, step, filter) {
  const out = [];
  for (let node = start?.[step]; node; node = node[step]) if (passes(node, filter)) out.push(node);
  return out;
}

function getParents  (filter) { return walk(this, 'parentElement',          filter); }
function getNextAll  (filter) { return walk(this, 'nextElementSibling',     filter); }
function getPrevAll  (filter) { return walk(this, 'previousElementSibling', filter); }

// the siblings in document order
function getSiblings (filter) { return [...this.getPrevAll(filter).reverse(), ...this.getNextAll(filter)]; }

// the position among the element siblings, -1 without a parent
function getIndex () {
  const parent = this.parentElement;
  return parent ? Array.prototype.indexOf.call(parent.children, this) : -1;
}

// :::::: VIEW

// in the viewport: ratio 0 is a pixel, 1 the whole element
function isInViewport ({ ratio = 0 } = {}) {
  const rect   = this.getBoundingClientRect();
  const height = window.innerHeight || document.documentElement.clientHeight;
  const width  = window.innerWidth  || document.documentElement.clientWidth;
  const seenY  = Math.min(rect.bottom, height) - Math.max(rect.top,  0);
  const seenX  = Math.min(rect.right,  width)  - Math.max(rect.left, 0);
  if (seenY <= 0 || seenX <= 0) return false;
  return (seenY * seenX) / (rect.height * rect.width || 1) >= ratio;
}

// the running animations done, a cancelled one counts as done. { name } only that css
// animation, { subtree } the descendants' as well. resolves with the element
function waitForAnimations ({ name, subtree = false } = {}) {
  const animations = this.getAnimations({ subtree }).filter(animation => !name || animation.animationName === name);
  return Promise.all(animations.map(animation => animation.finished.catch(() => null))).then(() => this);
}

// :::::: FORMS
// the named controls of a form as one object and back. buttons and nameless controls
// are left out, disabled ones too unless asked for

const BUTTONS = new Set(['button', 'image', 'reset', 'submit']);

// the controls by name, in document order
function groupsOf (form, disabled) {
  const groups = new Map;
  for (const control of form.elements) {
    if (!control.name || BUTTONS.has(control.type) || (control.disabled && !disabled)) continue;
    if (!groups.has(control.name)) groups.set(control.name, []);
    groups.get(control.name).push(control);
  }
  return groups;
}

// strings to compare against control values
const toStrings = value => toList(value).map(String);

// a single control: checkbox as a boolean, number and range as a number (empty is
// null), a multiple select as a list, a file input as a File (a list when multiple)
function valueOf (control, trim) {
  if (control.type === 'checkbox')                           return control.checked;
  if (control.type === 'file')                               return control.multiple ? [...control.files] : control.files[0] ?? null;
  if (control.type === 'number' || control.type === 'range') return control.value === '' ? null : Number(control.value);
  if (control.localName === 'select' && control.multiple)    return [...control.selectedOptions].map(option => option.value);
  const value = control.value;
  return trim && isString(value) ? value.trim() : value;
}

// several controls of a name are a list, the checked values of checkboxes. a radio
// group is the value of the checked one, null when none is
function getValues ({ disabled = false, trim = true } = {}) {
  const values = {};
  for (const [name, group] of groupsOf(this, disabled)) {
    const [first] = group;
         if (first.type === 'radio')                        values[name] = group.find   (control => control.checked)?.value ?? null;
    else if (first.type === 'checkbox' && group.length > 1) values[name] = group.filter (control => control.checked).map(control => control.value);
    else if (group.length > 1)                              values[name] = group.map    (control => valueOf(control, trim));
    else                                                    values[name] = valueOf(first, trim);
  }
  return values;
}

function setValue (control, value) {
       if (control.type === 'checkbox') control.checked = Boolean(value);
  else if (control.type === 'file')     return;
  else if (control.localName === 'select' && control.multiple) {
    const list = toStrings(value);
    for (const option of control.options) option.selected = list.includes(option.value);
  }
  else control.value = value ?? '';
}

// { name: value } into the controls of that name. a name the object lacks (or has as
// undefined) stays as it is, or is cleared with { missing: 'clear' }. { notify } fires
// input and change
function setValues (values = {}, { missing = 'skip', notify = false } = {}) {
  for (const [name, group] of groupsOf(this, true)) {
    if (values[name] === undefined && missing !== 'clear') continue;   // unset leaves the control alone
    const value = values[name] ?? null, [first] = group;

         if (first.type === 'radio')                        for (const control of group) control.checked = value != null && control.value === String(value);
    else if (first.type === 'checkbox' && group.length > 1) for (const control of group) control.checked = toStrings(value).includes(control.value);
    else if (group.length > 1 && Array.isArray(value))      group.forEach((control, i) => setValue(control, value[i]));
    else                                                    for (const control of group) setValue(control, value);

    if (notify) for (const control of group) {
      control.dispatchEvent(new Event('input',  { bubbles: true }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  return this;
}

// :::::: UPDATE

// own props from outside, as (element, value) => void.
// @domina/prototype/observer adds onConnected, onVisible etc. this way
const customProps = new Map;

function defineProps (map) {
  for (const [key, handler] of toEntries(map)) if (isFn(handler)) customProps.set(key, handler);
}

// 'a b, c', ['a', ['b']], { a: true, b: false } -> 'a b c'
function classesOf (value) {
  if (isOff(value))         return [];
  if (isString(value))      return value.split(/[\s,]+/).filter(Boolean);
  if (Array.isArray(value)) return value.flatMap(classesOf);
  if (isObject(value))      return toEntries(value).filter(([, on]) => on).map(([name]) => name);
  return [String(value)];
}

// a setter or a writable value along the prototype chain, cached per prototype and key.
// none at all counts as writable: an expando
const writableCache = new WeakMap;

function isWritable (element, key) {
  const proto = Object.getPrototypeOf(element);
  let keys = writableCache.get(proto);
  if (!keys) writableCache.set(proto, keys = new Map);
  if (keys.has(key)) return keys.get(key);

  let descriptor;
  for (let current = element; current && !descriptor; current = Object.getPrototypeOf(current)) {
    descriptor = Object.getOwnPropertyDescriptor(current, key);
  }
  const writable = !descriptor || Boolean(descriptor.set || descriptor.writable);
  keys.set(key, writable);
  return writable;
}

function update (props = {}, ...children) {
  let ref;

  for (const [key, value] of toEntries(props)) {
    if (value == null) continue;

         if (customProps.has(key))                     customProps.get(key)(this, value);
    else if (key === 'ref')                            ref = value;
    else if (key === 'style')                          isString(value) ? this.setAttribute('style', value) : writeStyle(this.style, value);
    else if (key === 'dataset' || key === 'data')      writeDataset(this.dataset, value);
    else if (key === 'class'   || key === 'className') this.setAttribute('class', classesOf(value).join(' '));
    else if (key.startsWith('on') && isFn(value))      this.addEventListener(key.slice(2).toLowerCase(), value);

    // svg properties are read-only animated values, svg always takes attributes
    else if (!(this instanceof SVGElement) && key in this && isWritable(this, key)) this[key] = value;
    else if (typeof value === 'boolean' && !key.startsWith('aria-'))                 this.toggleAttribute(key, value);
    else                                                                             this.setAttribute(key, value);
  }

  const kids = children.flat(Infinity).filter(child => child != null && child !== false);
  if (kids.length) this.append(...kids);

  // last, so the element has its props and its children
  if (isFn(ref))          ref(this);
  else if (isObject(ref)) ref.current = this;

  return this;
}

// :::::: CREATE

const nativeCreateElement = Document.prototype.createElement;

function createElement (tag = 'div', props, ...children) {
  if (isString(props)) return nativeCreateElement.call(this, tag, props);

  const element = nativeCreateElement.call(this, tag, props?.is == null ? undefined : { is: props.is });
  if (!props && !children.length) return element;

  const { is, ...rest } = props ?? {};
  return element.update(rest, ...children);
}

// :::::: INSTALL
// non-enumerable like the native methods. an existing method is overwritten, with a warning

function define (proto, name, value) {
  Object.defineProperty(proto, name, { configurable: true, value, writable: true });
}

function extend (Class, methods) {
  const proto = Class.prototype;
  for (const [name, value] of toEntries(methods)) {
    if (name in proto) console.warn(`[@domina/prototype] ${Class.name}.prototype.${name} exists, overwritten.`);
    define(proto, name, value);
  }
}

// a compatible wrapper of the native, no warning
define(Document.prototype, 'createElement', createElement);

extend(CSSStyleDeclaration, { getToken, getTokens, setToken, setTokens });
extend(Document,            { getElement, getElements });
extend(DocumentFragment,    { getElement, getElements });
extend(Element,             { getElement, getElements, getIndex, getNextAll, getParents, getPrevAll, getSiblings, isInViewport, setAriaAttribute, setAriaAttributes, setAttributes, setProperties, update, waitForAnimations });
extend(EventTarget,         { emitEvent, onEvent, onEvents, waitForEvent });
extend(HTMLFormElement,     { getValues, setValues });

export { defineProps, selectorOf };
