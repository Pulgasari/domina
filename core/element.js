// @domina/core/element.js

import { _doc, _slct, _el } from './internal/resolve.js';

export const

getElement         = (spec, ctx) => _doc(ctx).querySelector(_slct(spec)) ?? null,
getElements        = (spec, ctx) => [..._doc(ctx).querySelectorAll(_slct(spec))],
getElementById     = (id,   ctx) => _doc(ctx).getElementById?.(id) ?? getElement(`#${id}`, ctx),
getElementsByClass = (name, ctx) => { const d = _doc(ctx); return d.getElementsByClassName ? [...d.getElementsByClassName(name)] : getElements(`.${name}`, ctx); },    
getElementsByName  = (name, ctx) => getElements(`[name="${name}"]`, ctx),
getElementsByTag   = (name, ctx) => [..._doc(ctx).getElementsByTagName   (name)],

getElementsByDataAttr = (key, ctx) => getElements(`[data-${key}]`, ctx),
getElementsByDataKey  = (key, ctx) => getElements(`[data-key="${key}"]`, ctx),

clone = (spec, deep = true) => _el(spec)?.cloneNode(deep) ?? null;


import { _el }                    from './internal/resolve.js';
import { isArray }                from './internal/is.js';
import { getElement, getElements } from './query.js';
import { getAttr, hasAttr, setAttr, removeAttr, toggleAttr } from './attr.js';
import { getValue, setValue }     from './values.js';
import { updateElement }          from './update.js';
import * from './events.js';
import { moveTo, unwrap, wrap }   from './misc.js';

// registered globally so resolve.js can detect a wrapper without importing this file
const NODE = Symbol.for('domina.node');

export const isWrapped = v => v?.[NODE] === true;

// name -> [fn, kind]
// chain: returns an element -> rewrapped   value: passed through   stop: disposer
const API = {
  setAttr    : [setAttr,       'chain'],
  removeAttr : [removeAttr,    'chain'],
  toggleAttr : [toggleAttr,    'chain'],
  setValue   : [setValue,      'chain'],
  update     : [updateElement, 'chain'],
  moveTo     : [moveTo,        'chain'],
  wrapWith   : [wrap,          'chain'],

  getAttr    : [getAttr,   'value'],
  hasAttr    : [hasAttr,   'value'],
  getValue   : [getValue,  'value'],
  unwrap     : [unwrap,    'value'],
  emitEvemt  : [emitEvent, 'value'],

  onEvent    : [onEvent,   'stop'],
  onceEvent  : [onceEvent, 'stop'],
  delegate   : [delegate,  'stop'],
  offEvent   : [offEvent,  'value'],
};

const proto = { [NODE]: true, node: null };

for (const [name, [fn, kind]] of Object.entries(API)) {
  proto[name] = function (...args) {
    const result = fn(this.node, ...args);
    // a chain call on a missing node keeps the same empty handle
    return kind === 'chain' ? (result === this.node ? this : element(result)) : result;
  };
}

Object.defineProperties(proto, {
  ok      : { get () { return !!this.node; } },
  find    : { value (spec) { return element (getElement (spec, this.node)); } },
  findAll : { value (spec) { return elements(getElements(spec, this.node)); } },
});

/** never null. use .ok or .node when the raw element is needed */
export const element = (spec, ctx) => {
  if (isWrapped(spec)) return spec;
  const self = Object.create(proto);
  self.node = _el(spec, ctx);
  return self;
};

/** array of wrappers, plus fan-out for every api method */
export const elements = (spec, ctx) => {
  const items = (isArray(spec) ? spec : getElements(spec, ctx)).map(el => element(el));

  for (const [name, [, kind]] of Object.entries(API)) {
    Object.defineProperty(items, name, {
      configurable: true,
      value (...args) {
        const results = items.map(item => item[name](...args));
        if (kind === 'chain') return items;
        if (kind === 'stop')  return () => results.forEach(stop => stop());
        return results;
      }
    });
  }
  return items;
};
