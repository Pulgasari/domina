// @ts-self-types="./mod.d.ts"

// @domina/chain — jquery-artige kette über @domina/core.
// arbeitet immer auf einer menge; getter geben arrays.

import * as dom from '@domina/core';

const wrap = els => new Chain(els);

class Chain {
  constructor(els) {
    this.els = els;
    this.length = els.length;
  }

  // ---- iteration
  [Symbol.iterator]() { return this.els[Symbol.iterator](); }
  each(fn) { this.els.forEach(fn); return this; }
  map(fn)  { return this.els.map(fn); }          // verlässt die kette
  get(i)   { return i == null ? this.els : this.els.at(i); }

  // ::: setter: geben this zurück
  
     addClass(...a) { this.els.forEach(el => dom.addClass(el, ...a)); return this; }
  removeClass(...a) { this.els.forEach(el => dom.removeClass(el, ...a)); return this; }
  
  setAttr  (...args) { this.els.forEach (element => dom.setAttr  (element, ...args)); return this; }    
  setStyle (...args) { this.els.forEach (element => dom.setStyle (element, ...args)); return this; }
  setValue (...args) { this.els.forEach (element => dom.setValue (element, ...args)); return this; }
  
  update(...a)      { this.els.forEach(el => dom.updateElement(el, ...a)); return this; }
  remove()          { this.els.forEach(dom.remove); return this; }

  // ::: getter: geben arrays, NICHT den ersten treffer
  
  attrs(name)  { return this.els.map(el => dom.getAttr(el, name)); }
  values(mode) { return this.els.map(el => dom.getValue(el, mode)); }
  texts()      { return this.els.map(el => el.textContent); }

  // ::: traversal: neue kette
  
  find(sel)    { return wrap(this.els.flatMap(el => dom.getElements(sel, el))); }
  closest(sel) { return wrap([...new Set(this.els.map(el => el.closest(sel)).filter(Boolean))]); }
  filter(test) { return wrap(this.els.filter(test)); }
  first()      { return wrap(this.els.slice(0, 1)); }
  last()       { return wrap(this.els.slice(-1)); }

  // ---- events: disposer sammeln, kette bleibt
  on(types, handler, options) {
    this._disposers ??= [];
    this._disposers.push(dom.on(this.els, types, handler, options));
    return this;
  }
  dispose() { this._disposers?.forEach(d => d()); this._disposers = []; return this; }
}

export const el = spec => wrap(
  Array.isArray(spec) ? spec.filter(Boolean) : dom.getElements(spec)
);
