// @ts-self-types="./mod.d.ts"

// @domina/chain — jquery-artige kette über @domina/core.
// arbeitet immer auf einer menge; getter geben arrays.

import * as dom from '@domina/core';

const wrap = elements => new Chain (elements);

class Chain {
  constructor (elements) {
    this.elements = elements;
    this.length   = elements.length;
  }

  // ---- iteration
  
  [Symbol.iterator]() { return this.elements[Symbol.iterator](); }
  each (fn) { this.elements.forEach(fn); return this; }
  map  (fn) { return this.elements.map(fn); }          // verlässt die kette
  get  (i)  { return i == null ? this.elements : this.elements.at(i); }

  // ::: setter: geben this zurück
  
     addClass (...args) { this.elements.forEach(el => dom.addClass(el, ...a)); return this; }
  removeClass (...args) { this.elements.forEach(el => dom.removeClass(el, ...a)); return this; }
  
  setAttr  (...args) { this.elements.forEach (element => dom.setAttr  (element, ...args)); return this; }    
  setStyle (...args) { this.elements.forEach (element => dom.setStyle (element, ...args)); return this; }
  setValue (...args) { this.elements.forEach (element => dom.setValue (element, ...args)); return this; }
  
  update(...a)      { this.els.forEach(el => dom.updateElement(el, ...a)); return this; }
  remove()          { this.els.forEach(dom.remove); return this; }

  // ::: getter: geben arrays, NICHT den ersten treffer
  
  attrs(name)  { return this.elements.map(el => dom.getAttr(el, name)); }
  values(mode) { return this.elements.map(el => dom.getValue(el, mode)); }
  texts()      { return this.elements.map(el => el.textContent); }

  // ::: traversal: neue kette
  
  find    (selector) { return wrap(this.els.flatMap(el => dom.getElements(sel, el))); }
  closest (selector) { return wrap([...new Set(this.els.map(el => el.closest(sel)).filter(Boolean))]); }
  filter  (test)     { return wrap(this.elements.filter(test)); }
  first   ()         { return wrap(this.elements.slice(0, 1)); }
  last    ()         { return wrap(this.elements.slice(-1)); }

  // ---- events: disposer sammeln, kette bleibt
  
  on(types, handler, options) {
    this._disposers ??= [];
    this._disposers.push(dom.on(this.els, types, handler, options));
    return this;
  }
  dispose() { this._disposers?.forEach(d => d()); this._disposers = []; return this; }
}

export const chain = spec => wrap(
  Array.isArray(spec) ? spec.filter(Boolean) : dom.getElements(spec)
);
