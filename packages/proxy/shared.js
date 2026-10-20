// @domina/proxy :: shared

export const
isFn          = sth => typeof sth === 'function',
isPlainObject = sth => sth !== null && typeof sth === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(sth)),
isString      = sth => typeof sth === 'string',
isSymbol      = sth => typeof sth === 'symbol';
