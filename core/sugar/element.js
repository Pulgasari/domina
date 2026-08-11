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
  // fehlen: on, 
  // missing (via observer.js): onIntersect usw.
  // rename: getCssVar, delegate -> bubbleEvent(???)
  stop  : { delegate, onEvent, onceEvent, onOutside },
  value : {
    getAttr, getClass,  getCssVar, getData, getHTML, getStyle, getText, getValue,
    getChildren, getParents, getSiblings,
    getIndex, getOffset, getPosition, getRect, getSize,
    hasAttr, hasClass, hasData,
    emitEvent, offEvent, 
    isInViewport, 
    replaceWith: replaceElement, remove: removeElement, unwrap,
    matches: matchesElement,
    
  },
  chain : {
    appendTo, prependTo, insertBefore, insertAfter,
    clone, moveTo,
    empty: emptyElement, update: updateElement,
    addClass,
    getClosest, getNext, getParent, getPrev,
    scrollTo,
    setAttr, setClass, setCssVar, setContent, setData, 
    setHTML, setStyle, setText, setValue,
    removeAttr, removeClass, removeData,
    toggleAttr, toggleClass,
    wrapWith: wrap,
  },
};

// name -> [fn, kind]
// chain: gibt ein Element zurück -> wird neu gewrappt
// value: wird durchgereicht
// stop:  Disposer

// Map API2 structure into flat API lookup map: method -> [fn, kind]
const API = {};
for (const [kind, fns] of Object.entries(API2))
for (const [name, fn]  of Object.entries(fns))
API[name] = [fn, kind];

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
