// @domina/chain/structure.js
// building, moving and removing. content is what append, prepend, before, after,
// insert and replace take:
//   a string        text, never html
//   a node / chain  only when the set has one element: a node can sit in one place only
//   a function      (element, index) -> content, called per element. the way to give
//                   every element its own node

import { clearElement }   from '@domina/methods/clearElement.js';
import { cloneElement }   from '@domina/methods/cloneElement.js';
import { insertAt }       from '@domina/methods/insertAt.js';
import { removeElement }  from '@domina/methods/removeElement.js';
import { replaceElement } from '@domina/methods/replaceElement.js';
import { sortElements }   from '@domina/methods/sortElements.js';
import { unwrapElement }  from '@domina/methods/unwrapElement.js';
import { wrapElement }    from '@domina/methods/wrapElement.js';

import { Chain, collect }        from './chain.js';
import { DOMINA, isChain, isFn } from './shared.js';

const isElement = node => node?.nodeType === 1;

// content for one element: functions called, chains opened, nullish and false dropped
function contentFor (content, element, index) {
  return content.flatMap(function resolve (item) {
    if (isFn(item))            return resolve(item(element, index));
    if (item == null || item === false) return [];
    if (Array.isArray(item))   return item.flatMap(resolve);
    if (isChain(item))         return item.elements;
    return [item];
  });
}

function assertPlaceable (name, chain, content) {
  if (chain.length < 2) return;
  if (content.some(item => isChain(item) || item?.nodeType)) {
    DOMINA.ERROR(`${name}(): one node cannot go to ${chain.length} places. pass a string, or a function (element, index) -> node`);
  }
}

// append, prepend, before, after: the native methods take nodes and strings (as text) alike
const placing = position => ({
  kind   : 'structure',
  params : { content: 'string' },
  method (...content) {
    assertPlaceable(position, this, content);
    this.elements.forEach((element, index) => element[position](...contentFor(content, element, index)));
    return this;
  },
});

export const append  = placing('append');
export const prepend = placing('prepend');
export const before  = placing('before');
export const after   = placing('after');

// at an index among the children, negative from the end
export const insert = {
  kind   : 'structure',
  params : { index: 'number', content: 'string' },
  method (index, ...content) {
    assertPlaceable('insert', this, content);
    this.elements.forEach((element, i) => insertAt(element, index, ...contentFor(content, element, i)));
    return this;
  },
};

// the set moves into the first target, in its order
const moving = position => ({
  kind   : 'structure',
  params : { target: 'string' },
  method (target) {
    const [destination] = collect(target);
    if (destination) destination[position](...this.elements);
    return this;
  },
});

export const appendTo  = moving('append');
export const prependTo = moving('prepend');

// :::::: REPLACE, WRAP, UNWRAP

// the replacements as a new chain
export const replace = {
  kind   : 'structure',
  params : { content: 'string' },
  method (...content) {
    assertPlaceable('replace', this, content);
    const placed = this.elements.flatMap((element, index) => replaceElement(element, ...contentFor(content, element, index)) ?? []);
    return new Chain(placed.filter(isElement), this.many);
  },
};

// every element into its own new wrapper: a tag (with props) or a function (element, index) -> element.
// returns the wrappers, so unwrap() undoes it
export const wrap = {
  kind   : 'structure',
  params : { tag: 'string', props: 'json' },
  method (wrapper = 'div', props = {}) {
    const boxes = this.elements.map((element, index) => wrapElement(element, isFn(wrapper) ? wrapper(element, index) : wrapper, props));
    return new Chain(boxes.filter(Boolean), this.many);
  },
};

// every element is dissolved, its children take its place. returns those children
export const unwrap = {
  kind   : 'structure',
  params : {},
  method () {
    const kids = this.elements.flatMap(element => unwrapElement(element) ?? []);
    return new Chain(kids.filter(isElement), this.many);
  },
};

// :::::: CLEAR, REMOVE, CLONE

export const clear = { kind: 'structure', params: {}, write: element => { clearElement(element); } };

// out of the document; the chain still holds them, so they can be placed again
export const remove = {
  kind   : 'structure',
  params : {},
  method () { removeElement(this.elements); return this; },
};

export const clone = {
  kind   : 'structure',
  params : { deep: 'bool' },
  method (deep = true) { return new Chain(this.elements.map(element => cloneElement(element, deep)), this.many); },
};

// :::::: SORT
// every element is a container: its items (a selector) are sorted in place by one or more
// indicators: a selector inside the item ('.price'), [selector, order] (['.price', 'num-desc']),
// or a compare function. order: auto | num | date | regular, each -asc or -desc, or random

export const sort = {
  kind   : 'structure',
  params : { item: 'string', by: 'string' },
  method (item, ...indicators) {
    for (const container of this.elements) sortElements({ container, indicators: indicators.length ? indicators : [{}], item });   // [{}]: the item's own value
    return this;
  },
};
