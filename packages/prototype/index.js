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
//   row.getSiblings('.selected'), el.getParents('section'), el.getIndex()
//   await video.waitForEvent('canplay', { timeout: 5000 })
//   form.getValues(), form.setValues({ name, tags })      HTMLFormElement
//
// the methods are non-enumerable like the natives. a name a prototype has already is
// overwritten with a warning: the app decides what its dom means, a later standard
// method of the same name is taken care of when it comes.

// :::::: SHARED

const 
toEtries    = Object.entries,
fromEntries = Object.fromEntries,
isArray     = Array.isArray,
$root       = document.documentElement;

const
toEntries = (sth) => Object.entries(sth ?? {});

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = value => typeof value === 'string';

const toKebabCase = name => name.replace(   /[A-Z]/g,     char  => '-' + char.toLowerCase());
const toCamelCase = name => name.replace(/-([a-z])/g, (_, char) =>       char.toUpperCase());

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
                 for (const type of list) this.   addEventListener(type, handler, options);
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

// the next of the types as a promise, then every listener is gone again. a timeout
// rejects with an error, an aborted signal with its reason
function waitForEvent (types, { signal, timeout } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    let timer = 0;
    const done   = () => { off(); clearTimeout(timer); signal?.removeEventListener('abort', abort); };
    const abort  = () => { done(); reject(signal.reason); };
    const off    = this.onEvent(types, event => { done(); resolve(event); });
    if (timeout) timer = setTimeout(() => { done(); reject(new Error(`waitForEvent: ${types} timed out after ${timeout}ms`)); }, timeout);
    signal?.addEventListener('abort', abort, { once: true });
  });
}

// :::::: ATTRIBUTES
// camelCase keys become kebab-case. false and nullish remove, true sets the attribute
// empty, anything else as a string. aria-* keeps 'true' and 'false', they are values there

function setAttributes (map) {
  for (const [key, value] of Object.entries(map ?? {})) {
    const name = toKebabCase(key);
         if (value == null || (value === false && !name.startsWith('aria-'))) this.removeAttribute (name);
    else if                   (value === true  && !name.startsWith('aria-'))  this.setAttribute    (name, '');
    else                                                                      this.setAttribute    (name, String(value));
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
  else                                  this.   setProperty(tokenName(name), String(value));
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
        else this.dataset[prop] = encode(data);
      }
    }
    else if (key === 'class' || key === 'className') this.className = [value ?? []].flat().filter(Boolean).join(' ');
    else this[key] = value;
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

function getSiblings (filter) {
  const parent = this.parentElement;
  if (!parent) return [];
  const out = [];
  for (const child of parent.children) if (child !== this && passes(child, filter)) out.push(child);
  return out;
}

function getParents (filter) { return walk (this, 'parentElement',          filter); }
function getNextAll (filter) { return walk (this, 'nextElementSibling',     filter); }
function getPrevAll (filter) { return walk (this, 'previousElementSibling', filter); }

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

function controlsOf (form, disabled) {
  return [...form.elements].filter(control => control.name && !BUTTONS.has(control.type) && (disabled || !control.disabled));
}

// a single control: checkbox as a boolean, number and range as a number (empty is
// null), a multiple select as a list, a file input as a File (a list when multiple)
function valueOf (control, trim) {
  if (control.type === 'checkbox')                           return control.checked;
  if (control.type === 'file')                               return control.multiple ? [...control.files] : control.files[0] ?? null;
  if (control.type === 'number' || control.type === 'range') return control.value === '' ? null : Number(control.value);
  if (control.localName === 'select' && control.multiple)    return [...control.selectedOptions].map(option => option.value);
  const value = control.value;
  return trim && typeof value === 'string' ? value.trim() : value;
}

// several controls of a name are a list, the checked values of checkboxes. a radio
// group is the value of the checked one, null when none is
function getValues ({ disabled = false, trim = true } = {}) {
  const groups = new Map;
  for (const control of controlsOf(this, disabled)) (groups.get(control.name) ?? groups.set(control.name, []).get(control.name)).push(control);

  const values = {};
  for (const [name, group] of groups) {
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
    const list = [value ?? []].flat().map(String);
    for (const option of control.options) option.selected = list.includes(option.value);
  }
  else control.value = value ?? '';
}

// { name: value } into the controls of that name. a name the object lacks (or has as
// undefined) stays as it is, or is cleared with { missing: 'clear' }. { notify } fires
// input and change
function setValues (values = {}, { missing = 'skip', notify = false } = {}) {
  const groups = new Map;
  for (const control of controlsOf(this, true)) (groups.get(control.name) ?? groups.set(control.name, []).get(control.name)).push(control);

  for (const [name, group] of groups) {
    if (values[name] === undefined && missing !== 'clear') continue;   // unset leaves the control alone
    const value = values[name] ?? null, [first] = group;

         if (first.type === 'radio')                         group.forEach(control => { control.checked = value != null && control.value === String(value); });
    else if (first.type === 'checkbox' && group.length > 1) { const list = [value ?? []].flat().map(String); group.forEach(control => { control.checked = list.includes(control.value); }); }
    else if (group.length > 1 && Array.isArray(value))      group.forEach((control, i) => setValue(control, value[i]));
    else                                                    group.forEach( control     => setValue(control, value));

    if (notify) for (const control of group) {
      control.dispatchEvent(new Event('input',  { bubbles: true }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  return this;
}

// :::::: INSTALL

const extend = (obj, methods) => {
  const proto = obj.prototype
  for (const [name, value] of Object.entries(methods)) {
    if (name in proto) console.warn(`[@domina/prototype] ${proto.constructor.name}.prototype.${name} exists, overwritten.`);
    Object.defineProperty(proto, name, { configurable: true, value, writable: true });
  }
};

extend(CSSStyleDeclaration, { getToken, getTokens, setToken, setTokens });
extend(Document,            { getElement, getElements });
extend(DocumentFragment,    { getElement, getElements });
extend(Element,             { getElement, getElements, getIndex, getNextAll, getParents, getPrevAll, getSiblings, isInViewport, setAttributes, setProperties, waitForAnimations });
extend(EventTarget,         { emitEvent, onEvent, onEvents, waitForEvent });
extend(HTMLFormElement,     { getValues, setValues });

export { selectorOf };
