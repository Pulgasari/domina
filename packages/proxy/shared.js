// shared.js

export { toCamelCase, toKebabCase } from '@pulgasari/str';

//const toCamelCase = name => name.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
//const toKebabCase = name => name.replace(/[A-Z]/g, char => '-' + char.toLowerCase());

export const undashed    = name => name.startsWith('--') ? name.slice(2) : name;

export const 
isPlainObject = value => value !== null && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value));       
