// @domina/core/sugar/element.js

// :::::: IMPORTS

import * as core from './../methods/index.js';
import { isArray, isSymbol, toKebabCase } from './../shared.js';

const _el = core.resolveElement;

// :::::: HELPERS

const NODE = Symbol.for('domina.node');

export const isWrapped = value => value?.[NODE] === true;

const childActing = {
    emptyElement : (node, sel)                 => core.clearElement  (core.getElement(sel, node)),
   removeElement : (node, sel)                 => core.removeElement (core.getElement(sel, node)),
  replaceElement : (node, sel, ...nodes)       => core.replaceElement(core.getElement(sel, node), ...nodes),
   updateElement : (node, sel, props, ...kids) => core.updateElement (core.getElement(sel, node), props, ...kids),
     wrapElement : (node, sel, wrapper, props) => core.wrapElement   (core.getElement(sel, node), wrapper, props),
   unwrapElement : (node, sel)                 => core.unwrapElement (core.getElement(sel, node)),
};

// four chaining modes:
//   chain : fn returns an element -> rewrap it (subject switches, only get*/find)
//   self  : keep the same handle, fn return value ignored (element lifecycle)
//   value : pass the raw value through
//   stop  : disposer
const API2 = {
  self : {
    // self-acting shorthands: act on this.node
    empty   : core.clearElement,
    remove  : core.removeElement,
    replace : core.replaceElement,
    update  : core.updateElement,
    wrap    : core.wrapElement,
    unwrap  : core.unwrapElement,
    // child-addressing counterparts: *Element(sel, ...)
    ...childActing,
  },
  stop  : {
    delegate  : core.delegateEvent,
    onOutside : core.onOutsideEvent,
    onEvent   : core.onEvent,
    onceEvent : core.onceEvent,
  },
  value : {
    // miss
    //getClassList
    //getChilds

    // rename
    getChildren : core.getChildren,
    getCssVar   : core.getCustomProperty,
    
    getAttr     : core.getAttr,
    getClass    : core.getClass,
    
    getData     : core.getData,
    getHTML     : core.getHTML,
    getStyle    : core.getStyle,
    getText     : core.getText,
    getValue    : core.getValue,
    
    getParents  : core.getParents,
    getSiblings : core.getSiblings,
    getIndex    : core.getIndex,
    getOffset   : core.getElementOffset,
    getPosition : core.getElementPosition,
    getRect     : core.getElementRect,
    getSize     : core.getElementSize,
    hasAttr     : core.hasAttr,
    hasClass    : core.hasClass,
    hasData     : core.hasData,
    emitEvent   : core.emitEvent,
    offEvent    : core.offEvent,
    isInViewport: core.isElementInViewport,
    matches     : core.matchesElement,
  },
  chain : {
    appendTo     : core.appendToElement,
    prependTo    : core.prependToElement,
    insertBefore : core.insertBefore,
    insertAfter  : core.insertAfter,
    clone        : core.cloneElement,
    moveTo       : core.moveTo,
    addClass     : core.addClass,
    getClosest   : core.getClosest,
    getNext      : core.getNext,
    getParent    : core.getParent,
    getPrev      : core.getPrev,
    jumpTo       : core.jumpTo,
    scrollTo     : core.scrollTo,
    setAttr      : core.setAttr,
    setClass     : core.setClass,
    setCssVar    : core.setCustomProperty,
    setContent   : core.setContent,
    setData      : core.setData,
    setHTML      : core.setHTML,
    setStyle     : core.setStyle,
    setText      : core.setText,
    setValue     : core.setValue,
    removeAttr   : core.removeAttr,
    removeClass  : core.removeClass,
    removeData   : core.removeData,
    toggleAttr   : core.toggleAttr,
    toggleClass  : core.toggleClass,
  },
};

// name -> [fn, kind]
// chain: returns an element -> rewrapped
// self:  keeps the same handle, return value discarded
// value: passed through
// stop:  disposer

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
  find    : { value (spec) { return element (core.getElement (spec, this.node)); } },
  findAll : { value (spec) { return elements(core.getElements(spec, this.node)); } },
});

/** nie null. .ok fragt nach, .node liefert das rohe Element */
export const element = (spec, ctx) => {
  if (isWrapped(spec)) return spec;
  const self = Object.create(proto);
  self.node = _el(spec, ctx);
  return self;
};

export const elements = (spec, ctx) => {
  const items = (isArray(spec) ? spec : core.getElements(spec, ctx)).map(node => element(node));

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

// :::::: GET (experimental) ::::::::::::::::::::::::::::::::::::::

export const get = new Proxy(element, {
  apply: (target, thisArg, args) => element(...args),
  get: (target, key, receiver) => {
    if (isSymbol(key)) return Reflect.get(target, key, receiver);

    return key.startsWith('$')
      ?    element ('#' + toKebabCase(key.slice(1)))
      : getElement ('#' + toKebabCase(key));
  }
});
