// @domina/core/sugar/element.js

import { _el } from '../internal/resolve.js';
import { isArray } from '../internal/is.js';
import { clone, getElement, getElements } from '../query.js';
import { updateElement } from '../element.js';
import { getAttr, hasAttr, removeAttr, setAttr, toggleAttr } from '../attr.js';
import { addClass, getClass, hasClass, removeClass, setClass, toggleClass } from '../class.js';
import { getData, hasData, removeData, setData } from '../data.js';
import { emptyElement, getHTML, getText, setContent, setHTML, setText } from '../content.js';
import { getValue, setValue } from '../values.js';
import { getCssVar, getStyle, setCssVar, setStyle } from '../style.js';
import { getOffset, getPosition, getRect, getSize, isInViewport, scrollIntoView } from '../geometry.js';
import { getChildren, getClosest, getIndex, getNext, getParent, getParents, getPrev, getSiblings, matchesElement } from '../traverse.js';
import { appendTo, insertAfter, insertBefore, moveTo, prependTo, removeElement, replaceElement, unwrap, wrap } from '../insert.js';
import { delegate, emitEvent, offEvent, onEvent, onOutside, onceEvent } from '../events.js';

// registered globally so resolve.js can detect a wrapper without importing this file
const NODE = Symbol.for('domina.node');

export const isWrapped = value => value?.[NODE] === true;

const API2 = {
  // fehlen: on
  // umbenennen: getCssVar
  stop  : { delegate, onEvent, onceEvent, onOutside },
  value : {
    getAttr, getClass, getCssVar, getData, getHTML, getStyle, getText, getValue,
    hasAttr, hasClass, hasData,
    emitEvent, offEvent, isInViewport, unwrap,

    getChildren, getParents, getSiblings,
    getIndex, getOffset, getPosition, getRect, getSize,
    matches: matchesElement,
    replaceWith: replaceElement,
    remove: removeElement,
  },
  chain : {
    empty: emptyElement,
    update: updateElement,

                   addClass,
       setAttr,    setClass, setCssVar, setContent,    setData, setHTML, setStyle, setText,
    removeAttr, removeClass,                        removeData,
    toggleAttr, toggleClass,
    
  },
};

// name -> [fn, kind]
// chain: gibt ein Element zurück -> wird neu gewrappt
// value: wird durchgereicht
// stop:  Disposer
const API = {

  // element
  update      : [updateElement,  'chain'],

  // attr
  setAttr     : [setAttr,        'chain'],
  removeAttr  : [removeAttr,     'chain'],
  toggleAttr  : [toggleAttr,     'chain'],

  // class
  setClass    : [setClass,       'chain'],
  addClass    : [addClass,       'chain'],
  removeClass : [removeClass,    'chain'],
  toggleClass : [toggleClass,    'chain'],

  // data
  setData     : [setData,        'chain'],
  removeData  : [removeData,     'chain'],

  
  setText     : [setText,        'chain'],
  setHTML     : [setHTML,        'chain'],
  setContent  : [setContent,     'chain'],
  empty       : [emptyElement,   'chain'],
  setValue    : [setValue,       'chain'],
  setStyle    : [setStyle,       'chain'],
  setCssVar   : [setCssVar,      'chain'],
  
  appendTo    : [appendTo,       'chain'],
  prependTo   : [prependTo,      'chain'],
  insertBefore: [insertBefore,   'chain'],
  insertAfter : [insertAfter,    'chain'],
  moveTo      : [moveTo,         'chain'],
  wrapWith    : [wrap,           'chain'],
  parent      : [getParent,      'chain'],
  closest     : [getClosest,     'chain'],
  next        : [getNext,        'chain'],
  prev        : [getPrev,        'chain'],
  clone       : [clone,          'chain'],
  scrollTo    : [scrollIntoView, 'chain'],

  getAttr     : [getAttr,         'value'],
  hasAttr     : [hasAttr,         'value'],
  getClass    : [getClass,        'value'],
  hasClass    : [hasClass,        'value'],
  getData     : [getData,         'value'],
  hasData     : [hasData,         'value'],
  getText     : [getText,         'value'],
  getHTML     : [getHTML,         'value'],
  getValue    : [getValue,        'value'],
  getStyle    : [getStyle,        'value'],
  getCssVar   : [getCssVar,       'value'],
  getRect     : [getRect,         'value'],
  getSize     : [getSize,         'value'],
  getOffset   : [getOffset,       'value'],
  getPosition : [getPosition,     'value'],
  getIndex    : [getIndex,        'value'],
  isInViewport: [isInViewport,    'value'],
  matches     : [matchesElement,  'value'],
  children    : [getChildren,     'value'],
  parents     : [getParents,      'value'],
  siblings    : [getSiblings,     'value'],
  unwrap      : [unwrap,          'value'],
  replaceWith : [replaceElement,  'value'],
  remove      : [removeElement,   'value'],
  
  emitEvent   : [emitEvent,       'value'],
  offEvent    : [offEvent,        'value'],
  onEvent     : [onEvent,     'stop'],
  onceEvent   : [onceEvent,   'stop'],
  onOutside   : [onOutside,   'stop'],
  delegate    : [delegate,    'stop'],
};

const proto = { [NODE]: true, node: null };

for (const [name, [fn, kind]] of Object.entries(API)) {
  proto[name] = function (...args) {
    const result = fn(this.node, ...args);
    // ein chain-Aufruf auf einem fehlenden Node behält dasselbe leere Handle
    return kind === 'chain' ? (result === this.node ? this : element(result)) : result;
  };
}

Object.defineProperties(proto, {
  ok      : { get () { return !!this.node; } },
  find    : { value (spec) { return element (getElement (spec, this.node)); } },
  findAll : { value (spec) { return elements(getElements(spec, this.node)); } },
});

/** nie null. .ok fragt nach, .node liefert das rohe Element */
export const element = (spec, ctx) => {
  if (isWrapped(spec)) return spec;
  const self = Object.create(proto);
  self.node = _el(spec, ctx);
  return self;
};

/** Array von Wrappern, plus Fan-out für jede API-Methode */
export const elements = (spec, ctx) => {
  const items = (isArray(spec) ? spec : getElements(spec, ctx)).map(node => element(node));

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
