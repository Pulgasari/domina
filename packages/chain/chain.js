// @domina/chain/chain.js
// the set every call works on. immutable: a call that changes the set returns a new chain

const
isInstanceOf = (v) => (type) => v instanceof type,
isTypeOf     = (v) => (type) => typeof v === type;

const // ::: PREDICATES
isBlank     = sth => sth == null || sth === '',
isChain     = isInstanceOf(Chain),
isNullish   = sth => sth == null,
isFn        = isTypeOf('function'),
isString    = isTypeOf('string'),
isTarget    = sth => typeof sth?.addEventListener === 'function',
hasIterator = sth => typeof sth[Symbol.iterator]  === 'function';

const byDocumentOrder = (a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

const unique = list => list.length < 2 ? list : [...new Set(list)];

function select (root, selector) {
  try   { return root.querySelectorAll ? Array.from(root.querySelectorAll(selector)) : []; }
  catch { return []; } // an invalid selector is an empty set, as in @domina/methods
}

function query (selector, context) {
  if (context == null) return select(document, selector);

  const roots = collect(context);
  if (roots.length === 1) return select(roots[0], selector);
  return unique(roots.flatMap(root => select(root, selector))).sort(byDocumentOrder);
}

// a selector, a target (element, window, document) or any iterable of those -> targets.
// a <form> or <select> is iterable too, so a target is taken as it is before anything is iterated
function collect (spec, context) {
  if     (isBlank(spec)) return [];
  if    (isString(spec)) return query(spec, context);
  if     (isChain(spec)) return spec.elements;
  if    (isTarget(spec)) return [spec];
  if (hasIterator(spec)) return unique(Array.from(spec, collect).flat());
  return [];
}

class Chain {

  constructor (elements, many = false) {
    this.elements = elements;
    this.many     = many;     // getters answer for every element instead of the first
  }

  get length () { return this.elements.length; }
  get el     () { return this.elements[0] ?? null; }
  get all    () { return this.many ? this : new Chain(this.elements, true); }

  [Symbol.iterator] () { return this.elements[Symbol.iterator](); }

  each (callback) { this.elements.forEach(callback); return this; }
  map  (callback) { return this.elements.map(callback); }

}

// :::::: EXPORT

export {
  Chain,
  collect,
};
