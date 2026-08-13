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
import { getOffset, getPosition, getRect, getSize, isInViewport, jumpTo, scrollTo } from '../geometry.js';
import { getChildren, getClosest, getIndex, getNext, getParent, getParents, getPrev, getSiblings, matchesElement } from '../traverse.js';
import { appendTo, insertAfter, insertBefore, moveTo, prependTo, removeElement, replaceElement, unwrap, wrap } from '../insert.js';
import { delegate, emitEvent, offEvent, onEvent, onOutside, onceEvent } from '../events.js';

/*
import * from './../methods.js';
import * from './../query.js';
import * from './../resolve.js';
*/

// registered globally so resolve.js can detect a wrapper without importing this file
const NODE = Symbol.for('domina.node');

export const isWrapped = value => value?.[NODE] === true;

// child-addressing: first arg is a selector relative to this.node.
// resolves the child, THEN applies the core function to it. the core fns are
// null-safe, so a missing child is a no-op rather than a throw.
const childActing = {
  emptyElement   : (node, sel)                 => emptyElement  (getElement(sel, node)),
  removeElement  : (node, sel)                 => removeElement (getElement(sel, node)),
  replaceElement : (node, sel, ...nodes)       => replaceElement(getElement(sel, node), ...nodes),
  updateElement  : (node, sel, props, ...kids) => updateElement (getElement(sel, node), props, ...kids),
  wrapElement    : (node, sel, wrapper, props) => wrap          (getElement(sel, node), wrapper, props),
  unwrapElement  : (node, sel)                 => unwrap        (getElement(sel, node)),
};

// four chaining modes:
//   chain : fn returns an element -> rewrap it (subject switches, only get*/find)
//   self  : keep the same handle, fn return value ignored (element lifecycle)
//   value : pass the raw value through
//   stop  : disposer
const API2 = {
  self : {
    // self-acting shorthands: act on this.node
    empty   : emptyElement,
    remove  : removeElement,
    replace : replaceElement,
    update  : updateElement,
    wrap,
    unwrap,
    // child-addressing counterparts: *Element(sel, ...)
    ...childActing,
  },
  stop  : { delegate, onEvent, onceEvent, onOutside },
  value : {
    getAttr, getClass, getCssVar, getData, getHTML, getStyle, getText, getValue,
    getChildren, getParents, getSiblings,
    getIndex, getOffset, getPosition, getRect, getSize,
    hasAttr, hasClass, hasData,
    emitEvent, offEvent,
    isInViewport,
    matches: matchesElement,
  },
  chain : {
    appendTo, prependTo, insertBefore, insertAfter,
    clone, moveTo,
    addClass,
    getClosest, getNext, getParent, getPrev,
    jumpTo, scrollTo,
    setAttr, setClass, setCssVar, setContent, setData,
    setHTML, setStyle, setText, setValue,
    removeAttr, removeClass, removeData,
    toggleAttr, toggleClass,
  },
};

// name -> [fn, kind]
// chain: returns an element -> rewrapped
// self:  keeps the same handle, return value discarded
// value: passed through
// stop:  disposer

// Map API2 structure into flat API lookup map: method -> [fn, kind]
const API = {};
for (const [kind, fns] of Object.entries(API2))
for (const [name, fn]  of Object.entries(fns))
API[name] = [fn, kind];

const proto = { [NODE]: true, node: null };

for (const [name, [fn, kind]] of Object.entries(API)) {
  proto[name] = function (...args) {
    const result = fn(this.node, ...args);
    // chain: a missing node keeps the same empty handle; otherwise rewrap.
    // self:  always the same handle, whatever the fn returned.
    return kind === 'chain' ? (result === this.node ? this : element(result))
         : kind === 'self'  ? this
         : result;
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
        // self keeps chaining on the list, same as chain
        if (kind === 'chain' || kind === 'self') return items;
        if (kind === 'stop')  return () => results.forEach(stop => stop());
        return results;
      }
    });
  }
  return items;
};
