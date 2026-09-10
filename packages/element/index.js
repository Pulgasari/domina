// @domina/element
//
// eager, synchronous, chainable element sugar. lean on purpose: it imports the
// ~63 methods it actually wraps from the @domina/methods single-export
// subpaths, not the whole barrel, so unused methods are never loaded.
// for zero upfront method loading use @domina/element/lazy instead.

// :::::: IMPORTS

import { API, NODE, isWrapped }        from './_api.js';
import { isArray, isSymbol, toKebabCase } from './_shared.js';

// infrastructure
import { resolveElement } from '@domina/methods/resolveElement';
import { getElement }     from '@domina/methods/getElement';
import { getElements }    from '@domina/methods/getElements';

// self + child-addressing targets
import { clearElement }   from '@domina/methods/clearElement';
import { removeElement }  from '@domina/methods/removeElement';
import { replaceElement } from '@domina/methods/replaceElement';
import { updateElement }  from '@domina/methods/updateElement';
import { wrapElement }    from '@domina/methods/wrapElement';
import { unwrapElement }  from '@domina/methods/unwrapElement';

// stop
import { delegateEvent }  from '@domina/methods/delegateEvent';
import { onOutsideEvent } from '@domina/methods/onOutsideEvent';
import { onEvent }        from '@domina/methods/onEvent';
import { onceEvent }      from '@domina/methods/onceEvent';

// value
import { getChildren }           from '@domina/methods/getChildren';
import { getCustomProperty }     from '@domina/methods/getCustomProperty';
import { getAttr }               from '@domina/methods/getAttr';
import { getClass }              from '@domina/methods/getClass';
import { getData }               from '@domina/methods/getData';
import { getHTML }               from '@domina/methods/getHTML';
import { getStyle }              from '@domina/methods/getStyle';
import { getText }               from '@domina/methods/getText';
import { getValue }              from '@domina/methods/getValue';
import { getParents }            from '@domina/methods/getParents';
import { getSiblings }           from '@domina/methods/getSiblings';
import { getIndex }              from '@domina/methods/getIndex';
import { getElementOffset }      from '@domina/methods/getElementOffset';
import { getElementPosition }    from '@domina/methods/getElementPosition';
import { getElementRect }        from '@domina/methods/getElementRect';
import { getElementSize }        from '@domina/methods/getElementSize';
import { hasAttr }               from '@domina/methods/hasAttr';
import { hasClass }              from '@domina/methods/hasClass';
import { hasData }               from '@domina/methods/hasData';
import { emitEvent }             from '@domina/methods/emitEvent';
import { offEvent }              from '@domina/methods/offEvent';
import { isElementInViewport }   from '@domina/methods/isElementInViewport';
import { matchesElement }        from '@domina/methods/matchesElement';

// chain
import { appendToElement }   from '@domina/methods/appendToElement';
import { prependToElement }  from '@domina/methods/prependToElement';
import { insertBefore }      from '@domina/methods/insertBefore';
import { insertAfter }       from '@domina/methods/insertAfter';
import { cloneElement }      from '@domina/methods/cloneElement';
import { moveTo }            from '@domina/methods/moveTo';
import { addClass }          from '@domina/methods/addClass';
import { getClosest }        from '@domina/methods/getClosest';
import { getNext }           from '@domina/methods/getNext';
import { getParent }         from '@domina/methods/getParent';
import { getPrev }           from '@domina/methods/getPrev';
import { jumpTo }            from '@domina/methods/jumpTo';
import { scrollTo }          from '@domina/methods/scrollTo';
import { setAttr }           from '@domina/methods/setAttr';
import { setClass }          from '@domina/methods/setClass';
import { setCustomProperty } from '@domina/methods/setCustomProperty';
import { setContent }        from '@domina/methods/setContent';
import { setData }           from '@domina/methods/setData';
import { setHTML }           from '@domina/methods/setHTML';
import { setStyle }          from '@domina/methods/setStyle';
import { setText }           from '@domina/methods/setText';
import { setValue }          from '@domina/methods/setValue';
import { removeAttr }        from '@domina/methods/removeAttr';
import { removeClass }       from '@domina/methods/removeClass';
import { removeData }        from '@domina/methods/removeData';
import { toggleAttr }        from '@domina/methods/toggleAttr';
import { toggleClass }       from '@domina/methods/toggleClass';

// :::::: METHOD LOOKUP

// methodName -> fn. the API table references these by name; keep them in sync.
const impl = {
  resolveElement, getElement, getElements,
  clearElement, removeElement, replaceElement, updateElement, wrapElement, unwrapElement,
  delegateEvent, onOutsideEvent, onEvent, onceEvent,
  getChildren, getCustomProperty, getAttr, getClass, getData, getHTML, getStyle, getText,
  getValue, getParents, getSiblings, getIndex, getElementOffset, getElementPosition,
  getElementRect, getElementSize, hasAttr, hasClass, hasData, emitEvent, offEvent,
  isElementInViewport, matchesElement,
  appendToElement, prependToElement, insertBefore, insertAfter, cloneElement, moveTo,
  addClass, getClosest, getNext, getParent, getPrev, jumpTo, scrollTo, setAttr, setClass,
  setCustomProperty, setContent, setData, setHTML, setStyle, setText, setValue,
  removeAttr, removeClass, removeData, toggleAttr, toggleClass,
};

// fail loudly if the shared table drifts from the imported set
for (const [name, [method]] of Object.entries(API)) {
  if (typeof impl[method] !== 'function') {
    throw new Error(`@domina/element: API "${name}" -> unknown method "${method}"`);
  }
}

const _el = resolveElement;

// :::::: PROTOTYPE

const proto = { [NODE]: true, node: null };

for (const [name, [method, kind]] of Object.entries(API)) {
  const fn = impl[method];
  proto[name] = kind === 'child'
    ? function (sel, ...args) { fn(impl.getElement(sel, this.node), ...args); return this; }
    : function (...args) {
        const result = fn(this.node, ...args);
        return kind === 'chain' ? (result === this.node ? this : element(result))
             : kind === 'self'  ? this
             : result; // value + stop
      };
}

Object.defineProperties(proto, {
  ok      : { get   ()     { return !!this.node; } },
  find    : { value (spec) { return element (impl.getElement (spec, this.node)); } },
  findAll : { value (spec) { return elements(impl.getElements(spec, this.node)); } },
  attr: {
    get () {
      return new Proxy(this, {
        get: (target, prop)        => isSymbol(prop) ? Reflect.get(target, prop)        :  target.getAttr(prop),
        set: (target, prop, value) => isSymbol(prop) ? Reflect.set(target, prop, value) : (target.setAttr(prop, value), true),
      });
    },
    set (attrs) { this.setAttr(attrs); },
  },
});

// :::::: FACTORIES

/** never null. .ok reports emptiness, .node returns the raw element */
export const element = (spec, ctx) => {
  if (isWrapped(spec)) return spec;
  const self = Object.create(proto);
  self.node = _el(spec, ctx);
  return self;
};

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
      },
    });
  }
  return items;
};

// :::::: GET (experimental)

export const get = new Proxy(element, {
  apply: (target, thisArg, args) => element(...args),
  get: (target, key, receiver) => {
    if (isSymbol(key)) return Reflect.get(target, key, receiver);

    return key.startsWith('$')
      ? element    ('#' + toKebabCase(key.slice(1)))
      : getElement ('#' + toKebabCase(key));
  },
});

export { isWrapped };
