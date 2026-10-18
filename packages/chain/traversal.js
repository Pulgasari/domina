// @domina/chain/traversal.js
// every step returns a new chain: deduplicated, in document order, with the .all of the
// chain it came from. no .end() stack: keep a variable to go back

import { getChildren } from '@domina/methods/getChildren.js';
import { getClosest }  from '@domina/methods/getClosest.js';
import { getIndex }    from '@domina/methods/getIndex.js';
import { getNext }     from '@domina/methods/getNext.js';
import { getNextAll }  from '@domina/methods/getNextAll.js';
import { getParent }   from '@domina/methods/getParent.js';
import { getParents }  from '@domina/methods/getParents.js';
import { getPrev }     from '@domina/methods/getPrev.js';
import { getPrevAll }  from '@domina/methods/getPrevAll.js';
import { getSiblings } from '@domina/methods/getSiblings.js';

import { Chain, collect } from './chain.js';
import { isFn }           from './shared.js';

const byDocumentOrder = (a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

// a new chain from a list per element
function step (chain, each) {
  const found = chain.elements.flatMap(element => [].concat(each(element) ?? []));
  const list  = found.length < 2 ? found : [...new Set(found)].sort(byDocumentOrder);
  return new Chain (list, chain.many);
}

const matches = (element, test) => isFn(test) ? test(element) : element.matches?.(test);

const walking = method => ({
  kind: 'traversal',
  params: { filter: 'string' }, 
  method (filter) { return step(this, element => method(element, filter)); }
});

// :::::: DOWN, UP, ACROSS

export const
find     = { kind: 'traversal', params: { selector: 'string' }, method (selector) { return step(this, element => collect    (selector, element)); } },
closest  = { kind: 'traversal', params: { selector: 'string' }, method (selector) { return step(this, element => getClosest (element, selector)); } };

export const 
children = walking(getChildren),
parent   = walking(getParent),
parents  = walking(getParents),
siblings = walking(getSiblings),
next     = walking(getNext),
prev     = walking(getPrev),
nextAll  = walking(getNextAll),
prevAll  = walking(getPrevAll);

// :::::: WITHIN THE SET

export const filter = {
  kind   : 'traversal',
  params : { test: 'string' },
  method (test) { return new Chain(this.elements.filter((element, index) => isFn(test) ? test(element, index) : matches(element, test)), this.many); },
};

export const not = {
  kind   : 'traversal',
  params : { test: 'string' },
  method (test) { return new Chain(this.elements.filter((element, index) => !(isFn(test) ? test(element, index) : matches(element, test))), this.many); },
};

// elements that contain a match
export const has = {
  kind   : 'traversal',
  params : { selector: 'string' },
  method (selector) { return new Chain(this.elements.filter(element => element.querySelector?.(selector)), this.many); },
};

export const 
at    = { kind: 'traversal', params: { index: 'number' }, method (index) { const element = this.elements.at(index); return new Chain(element ? [element] : [], this.many); } },     
first = { kind: 'traversal', params: {}, method () { return this.at( 0); } },
last  = { kind: 'traversal', params: {}, method () { return this.at(-1); } };

export const slice = {
  kind   : 'traversal',
  params : { start: 'number', end: 'number' },
  method (start, end) { return new Chain(this.elements.slice(start, end), this.many); },
};

// :::::: QUESTIONS

// does ANY element match
export const is = { kind: 'read', params: { selector: 'string' }, method (selector) { return this.elements.some(element => matches(element, selector)); } };

// position among the element siblings of the first element, -1 if none
export const index = { params: {}, read: getIndex };
