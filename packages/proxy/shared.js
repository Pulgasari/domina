// shared.js

export { toCamelCase, toKebabCase } from '@pulgasari/str';

//const toCamelCase = name => name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
//const toKebabCase = name => name.replace(/[A-Z]/g, char => '-' + char.toLowerCase());

export const 
undashed = name => name.startsWith('--') ? name.slice(2) : name;

export const
isArray       = Array.isArray,
isFalsish     = (sth) => sth === false || sth == null,
isFn          = (sth) => typeof sth === 'function',
isNullish     = (sth) => sth === null || sth === undefined,
isNodeMap     = (sth) => sth instanceof NamedNodeMap,
isPlainObject = value => value !== null && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value)),
isSymbol      = (sth) => typeof sth === 'symbol';



export function toObj (sth) {
  const obj = {};
  if (isNodeMap(sth)) for (const { name, value } of sth) attrs[name] = value;
  return obj;
}
