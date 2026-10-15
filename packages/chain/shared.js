// @domina/chain/shared.js

export const
isInstanceOf = (v) => (type) => v instanceof type,
isTypeOf     = (v) => (type) => typeof v === type;

export const // ::: PREDICATES
isBlank     = sth => sth == null || sth === '',
isChain     = isInstanceOf(Chain),
isNullish   = sth => sth == null,
isFn        = isTypeOf('function'),
isPlainObject = value => value !== null && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value)),    
isString    = isTypeOf('string'),
isTarget    = sth => typeof sth?.addEventListener === 'function',
hasIterator = sth => typeof sth[Symbol.iterator]  === 'function';
