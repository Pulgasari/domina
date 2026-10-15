// @domina/chain/shared.js

// a chain carries this brand instead of being checked with instanceof:
// shared.js cannot import Chain (chain.js imports shared.js), and a brand also
// holds across two copies of the package
export const CHAIN = Symbol.for('domina.chain');

export const // :::
isInstanceOf = (type) => (sth) => sth instanceof type,
isTypeOf     = (type) => (sth) => typeof sth === type;

export const // ::: PREDICATES
isBlank       = sth => sth == null || sth === '',
isChain       = sth => sth?.[CHAIN] === true,
isNullish     = sth => sth == null,
isFn          = isTypeOf('function'),
isPlainObject = sth => sth !== null && typeof sth === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(sth)),
isString      = isTypeOf('string'),
isTarget      = sth => typeof sth?.addEventListener === 'function',
hasIterator   = sth => typeof sth?.[Symbol.iterator] === 'function';

// :::
// (its intenionally uppercase to make it optically stand out when reading code.)
export const DOMINA = {};
DOMINA.ERROR = (message) => { throw new TypeError('[domina] ' + message); };
